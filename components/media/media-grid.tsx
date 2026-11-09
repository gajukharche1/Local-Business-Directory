"use client";

import { MediaItem } from "./types";
import { FileText, Copy, Check, Eye, Trash2 } from "lucide-react";
import { useState } from "react";

interface MediaGridProps {
  items: MediaItem[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onInspect: (item: MediaItem) => void;
  selectable?: boolean;
}

export function MediaGrid({
  items,
  selectedIds,
  onToggleSelect,
  onInspect,
  selectable = true,
}: MediaGridProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyUrl = async (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item.url);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {}
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/50 p-12 text-center">
        <div className="rounded-full bg-muted/60 p-4 mb-3 text-muted-foreground">
          <FileText className="h-8 w-8 stroke-1" />
        </div>
        <h4 className="text-sm font-bold text-foreground">No media assets found</h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          No files match your selected folder or search query. Upload files or adjust your filter.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((item) => {
        const isSelected = selectedIds.has(item.id);
        const isImage = item.mimeType.startsWith("image/");
        const extension = item.mimeType.split("/")[1] || "file";

        return (
          <div
            key={item.id}
            onClick={() => onInspect(item)}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card transition-all duration-200 cursor-pointer hover:shadow-md ${
              isSelected
                ? "border-primary ring-2 ring-primary/30 shadow-sm"
                : "border-border/70 hover:border-border"
            }`}
          >
            {/* Top Bar inside Card */}
            <div className="relative aspect-square w-full bg-muted/25 overflow-hidden flex items-center justify-center">
              {isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.thumbnailUrl || item.url}
                  alt={item.altText || item.title || "thumbnail"}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex flex-col items-center gap-1.5 p-4 text-muted-foreground">
                  <FileText className="h-10 w-10 text-primary/80 stroke-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{extension}</span>
                </div>
              )}

              {/* Selection Checkbox */}
              {selectable && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(item.id);
                  }}
                  className={`absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-md border transition-all ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-black/20 bg-black/40 text-transparent opacity-0 group-hover:opacity-100 hover:border-white"
                  }`}
                >
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
              )}

              {/* Hover Quick Overlay Buttons */}
              <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  title="Copy URL"
                  onClick={(e) => copyUrl(e, item)}
                  className="rounded-md bg-black/60 p-1.5 text-white hover:bg-black/90 transition-colors backdrop-blur-xs"
                >
                  {copiedId === item.id ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {/* Soft delete badge */}
              {item.deletedAt && (
                <div className="absolute inset-0 bg-rose-950/40 backdrop-blur-[1px] flex items-center justify-center">
                  <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                    In Trash
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Details */}
            <div className="p-2.5">
              <p className="truncate text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                {item.title || item.fileName || "Untitled"}
              </p>
              <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                <span>{(item.bytes / (1024 * 1024)).toFixed(2)} MB</span>
                <span className="uppercase text-[10px] px-1 py-0.5 rounded bg-muted font-sans font-semibold">
                  {extension}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
