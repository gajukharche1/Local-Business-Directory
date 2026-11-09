"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { UploadCloud, X, CheckCircle2, AlertCircle, Loader2, FileText, Image as ImageIcon } from "lucide-react";
import { MediaItem } from "./types";

interface MediaUploaderDropzoneProps {
  currentFolder?: string;
  folders?: string[];
  onUploadComplete?: (item: MediaItem) => void;
  onAllUploadsComplete?: () => void;
  onClose?: () => void;
}

interface UploadQueueItem {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export function MediaUploaderDropzone({
  currentFolder = "/",
  folders = ["/"],
  onUploadComplete,
  onAllUploadsComplete,
  onClose,
}: MediaUploaderDropzoneProps) {
  const [targetFolder, setTargetFolder] = useState(currentFolder === "all" ? "/" : currentFolder);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cleanFolder = (f: string) => {
    return "/" + f.trim().replace(/^[\/\\]+|[\/\\]+$/g, "").replace(/\.\./g, "");
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: UploadQueueItem[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
      progress: 0,
      status: "pending",
    }));

    setQueue((prev) => [...prev, ...newItems]);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFromQueue = (id: string) => {
    setQueue((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const startUploads = async () => {
    if (queue.length === 0 || isUploading) return;
    setIsUploading(true);

    const folderToUse = isCreatingFolder && newFolderName.trim()
      ? cleanFolder(newFolderName)
      : targetFolder;

    for (const item of queue) {
      if (item.status === "success") continue;

      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: "uploading", progress: 20 } : q))
      );

      try {
        const formData = new FormData();
        formData.append("file", item.file);
        formData.append("folder", folderToUse);
        formData.append("title", item.file.name.replace(/\.[^/.]+$/, ""));

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Upload failed with status ${res.status}`);
        }

        const data = await res.json();

        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id ? { ...q, status: "success", progress: 100 } : q
          )
        );

        if (data.media && onUploadComplete) {
          onUploadComplete(data.media);
        }
      } catch (err) {
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: "error", error: err instanceof Error ? err.message : "Failed to upload" }
              : q
          )
        );
      }
    }

    setIsUploading(false);
    if (onAllUploadsComplete) {
      onAllUploadsComplete();
    }
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div>
          <h3 className="text-base font-bold text-foreground">Upload Media Files</h3>
          <p className="text-xs text-muted-foreground">
            Upload images (JPEG, PNG, WebP, AVIF, SVG) or documents (PDF) up to 10MB each.
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Target Folder Selector */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="font-semibold text-foreground/80">Destination Folder:</span>
        {!isCreatingFolder ? (
          <div className="flex items-center gap-2">
            <select
              value={targetFolder}
              onChange={(e) => setTargetFolder(e.target.value)}
              className="rounded-lg border border-border/80 bg-background px-3 py-1.5 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {Array.from(new Set(["/", ...folders])).map((f) => (
                <option key={f} value={f}>
                  {f === "/" ? "/ (Root)" : f}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setIsCreatingFolder(true)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              + New Folder
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="/listings/summer"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="rounded-lg border border-border/80 bg-background px-3 py-1.5 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setIsCreatingFolder(false)}
              className="text-xs text-muted-foreground hover:underline"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border/70 hover:border-primary/60 hover:bg-muted/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)}
        />
        <div className="rounded-full bg-primary/10 p-3 mb-3 text-primary">
          <UploadCloud className="h-7 w-7" />
        </div>
        <p className="text-sm font-semibold text-foreground">
          Click to browse or drag and drop files here
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Supports JPEG, PNG, WebP, AVIF, SVG, PDF (Max 10 MB per file)
        </p>
      </div>

      {/* Upload Queue */}
      {queue.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Files in Queue ({queue.length})</span>
            <span>
              {queue.filter((q) => q.status === "success").length} of {queue.length} completed
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {queue.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-2.5 text-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="h-10 w-10 shrink-0 rounded-lg object-cover border border-border/50"
                    />
                  ) : item.file.type.startsWith("image/") ? (
                    <ImageIcon className="h-10 w-10 shrink-0 text-muted-foreground p-2" />
                  ) : (
                    <FileText className="h-10 w-10 shrink-0 text-muted-foreground p-2" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground text-xs">{item.file.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                      {item.error && <span className="ml-2 text-rose-500 font-semibold">{item.error}</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {item.status === "pending" && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromQueue(item.id);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {item.status === "uploading" && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                  {item.status === "success" && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  )}
                  {item.status === "error" && (
                    <AlertCircle className="h-4 w-4 text-rose-600" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setQueue([])}
              disabled={isUploading}
              className="rounded-lg border border-border/80 px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted/50 disabled:opacity-50"
            >
              Clear Queue
            </button>
            <button
              type="button"
              onClick={startUploads}
              disabled={isUploading || queue.every((q) => q.status === "success")}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 shadow-xs"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                `Upload ${queue.filter((q) => q.status !== "success").length} Files`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
