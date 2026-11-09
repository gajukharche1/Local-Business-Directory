"use client";

import { useState, useEffect, useCallback } from "react";
import { MediaItem, MediaStorageStats } from "./types";
import { MediaGrid } from "./media-grid";
import { MediaTable } from "./media-table";
import { MediaDetailsDrawer } from "./media-details-drawer";
import { MediaUploaderDropzone } from "./media-uploader-dropzone";
import {
  listMediaAction,
  bulkDeleteMediaAction,
  moveMediaFolderAction,
  restoreMediaAction,
  getMediaStorageStatsAction,
} from "@/actions/media";
import {
  Search,
  Upload,
  LayoutGrid,
  List as ListIcon,
  Folder,
  Trash2,
  RotateCcw,
  FolderInput,
  HardDrive,
  RefreshCw,
  Loader2,
  FileText,
  Image as ImageIcon,
  Check,
} from "lucide-react";

interface MediaManagerProps {
  title?: string;
  description?: string;
  initialFolder?: string;
  mode?: "manager" | "picker";
  selectionLimit?: number; // 1 for single pick, > 1 for multi pick
  onSelectItems?: (items: MediaItem[]) => void;
  isAdmin?: boolean;
}

export function MediaManager({
  title = "Media Library",
  description = "Manage, organize, and upload directory photos and documents.",
  initialFolder = "all",
  mode = "manager",
  selectionLimit,
  onSelectItems,
  isAdmin = false,
}: MediaManagerProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<string[]>(["/"]);
  const [activeFolder, setActiveFolder] = useState<string>(initialFolder);
  const [search, setSearch] = useState("");
  const [mimeGroup, setMimeGroup] = useState<"all" | "image" | "document">("all");
  const [showTrash, setShowTrash] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [inspectorItem, setInspectorItem] = useState<MediaItem | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [stats, setStats] = useState<MediaStorageStats | null>(null);

  // Bulk action states
  const [targetMoveFolder, setTargetMoveFolder] = useState<string>("/");
  const [isMoving, setIsMoving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load data
  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listMediaAction({
        folder: activeFolder === "all" ? undefined : activeFolder,
        search: search.trim() || undefined,
        mimeGroup,
        showDeleted: showTrash,
        page,
        limit: 30,
      });

      if (res.success && res.items) {
        setItems(res.items as unknown as MediaItem[]);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
        if (res.folders) setFolders(res.folders);
      }
    } finally {
      setLoading(false);
    }
  }, [activeFolder, search, mimeGroup, showTrash, page]);

  const loadStats = useCallback(async () => {
    const res = await getMediaStorageStatsAction();
    if (res.success && res.stats) {
      setStats(res.stats);
    }
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Selection handling
  const toggleSelect = (id: string) => {
    if (mode === "picker" && selectionLimit === 1) {
      setSelectedIds(new Set([id]));
      return;
    }

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (selectionLimit && next.size >= selectionLimit) return prev;
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (items.every((i) => selectedIds.has(i.id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  };

  // Bulk Actions
  const handleBulkDelete = async (permanent: boolean = false) => {
    if (selectedIds.size === 0) return;
    const msg = permanent
      ? `Are you sure you want to permanently purge ${selectedIds.size} files?`
      : `Move ${selectedIds.size} files to trash?`;

    if (!confirm(msg)) return;

    setIsDeleting(true);
    try {
      await bulkDeleteMediaAction(Array.from(selectedIds), permanent);
      setSelectedIds(new Set());
      await Promise.all([loadMedia(), loadStats()]);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkRestore = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    try {
      await restoreMediaAction(Array.from(selectedIds));
      setSelectedIds(new Set());
      await Promise.all([loadMedia(), loadStats()]);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkMove = async () => {
    if (selectedIds.size === 0 || !targetMoveFolder) return;
    setIsMoving(true);
    try {
      await moveMediaFolderAction(Array.from(selectedIds), targetMoveFolder);
      setSelectedIds(new Set());
      await loadMedia();
    } finally {
      setIsMoving(false);
    }
  };

  const handleItemUpdated = (updated: MediaItem) => {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    setInspectorItem(updated);
  };

  const handleItemDeleted = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setInspectorItem(null);
    loadStats();
  };

  const confirmPickerSelection = () => {
    if (!onSelectItems) return;
    const selected = items.filter((i) => selectedIds.has(i.id));
    onSelectItems(selected);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{title}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {stats && (
            <div className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-xs">
              <HardDrive className="h-4 w-4 text-primary" />
              <span>
                <strong className="font-mono font-bold text-foreground">{stats.totalMB} MB</strong> used (
                {stats.totalActive} files)
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowUploader((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
          >
            <Upload className="h-4 w-4" />
            {showUploader ? "Hide Uploader" : "Upload Files"}
          </button>
        </div>
      </div>

      {/* Dropzone Collapsible Panel */}
      {showUploader && (
        <MediaUploaderDropzone
          currentFolder={activeFolder}
          folders={folders}
          onUploadComplete={() => {
            loadMedia();
            loadStats();
          }}
          onClose={() => setShowUploader(false)}
        />
      )}

      {/* Filter and Control Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by file name or alt text..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-border/70 bg-background py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Folder selector */}
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
            <select
              value={activeFolder}
              onChange={(e) => {
                setActiveFolder(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-border/70 bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
            >
              <option value="all">All Folders</option>
              {folders.map((f) => (
                <option key={f} value={f}>
                  {f === "/" ? "/ (Root)" : f}
                </option>
              ))}
            </select>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center rounded-xl border border-border/70 bg-muted/30 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`rounded-lg p-1.5 transition-colors ${
                viewMode === "grid"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`rounded-lg p-1.5 transition-colors ${
                viewMode === "table"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="List View"
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowTrash(false);
                setMimeGroup("all");
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1 font-semibold transition-colors ${
                !showTrash && mimeGroup === "all"
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              All Files ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => {
                setShowTrash(false);
                setMimeGroup("image");
                setPage(1);
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition-colors ${
                !showTrash && mimeGroup === "image"
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Images
            </button>
            <button
              type="button"
              onClick={() => {
                setShowTrash(false);
                setMimeGroup("document");
                setPage(1);
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition-colors ${
                !showTrash && mimeGroup === "document"
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Documents
            </button>
            <button
              type="button"
              onClick={() => {
                setShowTrash(true);
                setPage(1);
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition-colors ${
                showTrash
                  ? "bg-rose-500/10 text-rose-600 font-bold"
                  : "text-muted-foreground hover:text-rose-600 hover:bg-rose-500/5"
              }`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Trash {stats?.trashCount ? `(${stats.trashCount})` : ""}
            </button>
          </div>

          <button
            type="button"
            onClick={() => loadMedia()}
            title="Refresh"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3.5 text-xs animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary px-2 py-0.5 font-mono font-bold text-primary-foreground">
              {selectedIds.size}
            </span>
            <span className="font-semibold text-foreground">items selected</span>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-muted-foreground hover:text-foreground underline ml-2"
            >
              Deselect All
            </button>
          </div>

          <div className="flex items-center gap-2">
            {mode === "picker" ? (
              <button
                type="button"
                onClick={confirmPickerSelection}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 font-bold text-primary-foreground hover:bg-primary/90 shadow-xs"
              >
                <Check className="h-4 w-4" />
                Select ({selectedIds.size})
              </button>
            ) : (
              <>
                {/* Move folder control */}
                {!showTrash && (
                  <div className="flex items-center gap-1.5">
                    <select
                      value={targetMoveFolder}
                      onChange={(e) => setTargetMoveFolder(e.target.value)}
                      className="rounded-lg border border-border/80 bg-background px-2.5 py-1 text-xs font-semibold text-foreground"
                    >
                      {folders.map((f) => (
                        <option key={f} value={f}>
                          Move to {f === "/" ? "/ (Root)" : f}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleBulkMove}
                      disabled={isMoving}
                      className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-background px-2.5 py-1 font-semibold text-foreground hover:bg-muted/40 disabled:opacity-50"
                    >
                      <FolderInput className="h-3.5 w-3.5 text-primary" />
                      Move
                    </button>
                  </div>
                )}

                {showTrash ? (
                  <>
                    <button
                      type="button"
                      onClick={handleBulkRestore}
                      disabled={isDeleting}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-600 hover:bg-emerald-500/20"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Restore
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkDelete(true)}
                      disabled={isDeleting}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1 font-semibold text-white hover:bg-rose-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Purge
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleBulkDelete(false)}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1 font-semibold text-rose-600 hover:bg-rose-500/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Move to Trash
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-border/60 bg-card">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-xs font-semibold">Loading media assets...</span>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <MediaGrid
          items={items}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onInspect={(item) => setInspectorItem(item)}
        />
      ) : (
        <MediaTable
          items={items}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onInspect={(item) => setInspectorItem(item)}
        />
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/60 pt-4 text-xs">
          <span className="text-muted-foreground">
            Page <strong className="font-semibold text-foreground">{page}</strong> of {totalPages} (
            {totalCount} total assets)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-border/80 px-3 py-1.5 font-semibold text-foreground hover:bg-muted/40 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-border/80 px-3 py-1.5 font-semibold text-foreground hover:bg-muted/40 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Inspector Details Drawer */}
      {inspectorItem && (
        <MediaDetailsDrawer
          media={inspectorItem}
          folders={folders}
          onClose={() => setInspectorItem(null)}
          onUpdate={handleItemUpdated}
          onDelete={handleItemDeleted}
          onRestore={() => {
            loadMedia();
            loadStats();
          }}
        />
      )}
    </div>
  );
}
