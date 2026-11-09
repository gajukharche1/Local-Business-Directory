"use client";

import { useState } from "react";
import { MediaItem } from "./types";
import {
  X,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Folder,
  FileText,
  Save,
  RotateCcw,
  Loader2,
  Calendar,
  HardDrive,
} from "lucide-react";
import { updateMediaMetadataAction, deleteMediaAction, restoreMediaAction } from "@/actions/media";

interface MediaDetailsDrawerProps {
  media: MediaItem | null;
  folders: string[];
  onClose: () => void;
  onUpdate: (updated: MediaItem) => void;
  onDelete: (id: string) => void;
  onRestore?: (id: string) => void;
}

export function MediaDetailsDrawer({
  media,
  folders,
  onClose,
  onUpdate,
  onDelete,
  onRestore,
}: MediaDetailsDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [title, setTitle] = useState(media?.title || "");
  const [altText, setAltText] = useState(media?.altText || "");
  const [folder, setFolder] = useState(media?.folder || "/");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!media) return null;

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(media.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateMediaMetadataAction(media.id, {
        title,
        altText,
        folder,
      });

      if (res.success && res.media) {
        onUpdate(res.media as unknown as MediaItem);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (permanent: boolean = false) => {
    if (!confirm(permanent ? "Are you sure you want to permanently purge this file?" : "Move this file to trash?")) {
      return;
    }
    setDeleting(true);
    try {
      const res = await deleteMediaAction(media.id, permanent);
      if (res.success) {
        onDelete(media.id);
        onClose();
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async () => {
    setDeleting(true);
    try {
      const res = await restoreMediaAction([media.id]);
      if (res.success && onRestore) {
        onRestore(media.id);
        onClose();
      }
    } finally {
      setDeleting(false);
    }
  };

  const isImage = media.mimeType.startsWith("image/");
  const isDeleted = Boolean(media.deletedAt);

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-card border-l border-border/80 shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">File Details</h3>
          <p className="text-xs text-muted-foreground truncate max-w-[240px]">
            {media.fileName || media.title || "Asset details"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Media Preview Box */}
        <div className="flex items-center justify-center rounded-xl border border-border/70 bg-muted/30 p-4 min-h-[200px] overflow-hidden">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={media.url}
              alt={media.altText || media.title || "Media Preview"}
              className="max-h-56 max-w-full rounded-lg object-contain shadow-xs"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground p-6">
              <FileText className="h-14 w-14 stroke-1 text-primary" />
              <span className="text-xs font-semibold uppercase">{media.mimeType}</span>
            </div>
          )}
        </div>

        {/* Copy Public URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground/80">Public Asset URL</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={media.url}
              className="flex-1 rounded-lg border border-border/80 bg-background px-3 py-1.5 text-xs text-muted-foreground outline-none font-mono select-all"
            />
            <button
              type="button"
              onClick={copyUrl}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/40 transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <a
              href={media.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border/80 bg-background p-2 text-muted-foreground hover:text-foreground shadow-xs"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Editable Metadata */}
        <div className="space-y-4 rounded-xl border border-border/60 bg-muted/15 p-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground/80">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Display title..."
              className="w-full rounded-lg border border-border/80 bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground/80">Alt Text (Accessibility & SEO)</label>
            <textarea
              rows={2}
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image for screen readers and SEO..."
              className="w-full rounded-lg border border-border/80 bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground/80">Folder</label>
            <select
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className="w-full rounded-lg border border-border/80 bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
            >
              {Array.from(new Set(["/", ...folders])).map((f) => (
                <option key={f} value={f}>
                  {f === "/" ? "/ (Root)" : f}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 shadow-xs"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save Changes
          </button>
        </div>

        {/* Technical Properties Grid */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Properties</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-border/60 bg-card p-3">
              <span className="text-muted-foreground block text-[11px]">File Size</span>
              <span className="font-mono font-bold text-foreground">
                {(media.bytes / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>

            <div className="rounded-lg border border-border/60 bg-card p-3">
              <span className="text-muted-foreground block text-[11px]">Format</span>
              <span className="font-mono font-bold uppercase text-foreground">
                {media.mimeType.split("/")[1] || media.mimeType}
              </span>
            </div>

            {media.width && media.height ? (
              <div className="rounded-lg border border-border/60 bg-card p-3">
                <span className="text-muted-foreground block text-[11px]">Dimensions</span>
                <span className="font-mono font-bold text-foreground">
                  {media.width} &times; {media.height} px
                </span>
              </div>
            ) : null}

            <div className="rounded-lg border border-border/60 bg-card p-3">
              <span className="text-muted-foreground block text-[11px]">Storage Provider</span>
              <span className="font-mono font-bold uppercase text-foreground">
                {media.storageProvider}
              </span>
            </div>
          </div>
        </div>

        {/* Associations */}
        {media.listing && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
            <span className="text-primary font-semibold block text-[11px]">Associated Listing</span>
            <a
              href={`/listings/${media.listing.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-primary hover:underline inline-flex items-center gap-1 mt-0.5"
            >
              {media.listing.title}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {media.owner && (
          <div className="rounded-lg border border-border/60 bg-card p-3 text-xs">
            <span className="text-muted-foreground block text-[11px]">Uploaded By</span>
            <span className="font-semibold text-foreground">
              {media.owner.name || media.owner.email}
            </span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-border/70 p-4 bg-muted/10 flex items-center justify-between">
        {isDeleted ? (
          <>
            <button
              type="button"
              onClick={handleRestore}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/40 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
              Restore Asset
            </button>
            <button
              type="button"
              onClick={() => handleDelete(true)}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition-colors shadow-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Purge Forever
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => handleDelete(false)}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Move to Trash
          </button>
        )}
      </div>
    </div>
  );
}
