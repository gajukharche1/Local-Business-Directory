"use client";

import { MediaItem } from "./types";
import { FileText, Copy, Check, Eye } from "lucide-react";
import { useState } from "react";

interface MediaTableProps {
  items: MediaItem[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onInspect: (item: MediaItem) => void;
  selectable?: boolean;
}

export function MediaTable({
  items,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onInspect,
  selectable = true,
}: MediaTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyUrl = async (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item.url);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {}
  };

  const allSelected = items.length > 0 && items.every((i) => selectedIds.has(i.id));

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/50 p-12 text-center">
        <FileText className="h-8 w-8 text-muted-foreground stroke-1 mb-2" />
        <h4 className="text-sm font-bold text-foreground">No media assets found</h4>
        <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or upload new files.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/70 bg-card shadow-xs">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-border/70 bg-muted/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <tr>
            {selectable && (
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="rounded border-border/80 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                />
              </th>
            )}
            <th className="w-14 px-3 py-3">Preview</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Folder</th>
            <th className="px-4 py-3">Size</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Date</th>
            <th className="w-20 px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {items.map((item) => {
            const isSelected = selectedIds.has(item.id);
            const isImage = item.mimeType.startsWith("image/");
            const extension = item.mimeType.split("/")[1] || "file";

            return (
              <tr
                key={item.id}
                onClick={() => onInspect(item)}
                className={`cursor-pointer transition-colors hover:bg-muted/30 ${
                  isSelected ? "bg-primary/5" : ""
                }`}
              >
                {selectable && (
                  <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(item.id)}
                      className="rounded border-border/80 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                    />
                  </td>
                )}
                <td className="px-3 py-2.5">
                  <div className="h-10 w-10 overflow-hidden rounded-md border border-border/60 bg-muted/40 flex items-center justify-center shrink-0">
                    {isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.thumbnailUrl || item.url}
                        alt={item.title || "thumbnail"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FileText className="h-5 w-5 text-primary stroke-1" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-2.5 max-w-xs truncate">
                  <div className="font-semibold text-foreground truncate">
                    {item.title || item.fileName || "Untitled"}
                  </div>
                  {item.listing && (
                    <div className="text-[11px] text-primary truncate">
                      {item.listing.title}
                    </div>
                  )}
                </td>
                <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
                  {item.folder}
                </td>
                <td className="px-4 py-2.5 font-mono tabular-nums text-muted-foreground">
                  {(item.bytes / (1024 * 1024)).toFixed(2)} MB
                </td>
                <td className="px-4 py-2.5 uppercase font-semibold text-[10px] text-muted-foreground">
                  {extension}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      title="Copy URL"
                      onClick={(e) => copyUrl(e, item)}
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      {copiedId === item.id ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      title="Inspect"
                      onClick={() => onInspect(item)}
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
