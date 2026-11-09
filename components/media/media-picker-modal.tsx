"use client";

import { useState } from "react";
import { MediaItem } from "./types";
import { MediaManager } from "./media-manager";
import { MediaUploaderDropzone } from "./media-uploader-dropzone";
import { X, Image as ImageIcon, UploadCloud } from "lucide-react";

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selected: { url: string; mediaId: string; altText?: string; title?: string }[]) => void;
  maxSelections?: number;
  title?: string;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  maxSelections = 1,
  title = "Select Media",
}: MediaPickerModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");

  if (!isOpen) return null;

  const handleSelectedFromManager = (items: MediaItem[]) => {
    const formatted = items.map((i) => ({
      url: i.url,
      mediaId: i.id,
      altText: i.altText || i.title || undefined,
      title: i.title || undefined,
    }));
    onSelect(formatted);
    onClose();
  };

  const handleUploadComplete = (item: MediaItem) => {
    onSelect([
      {
        url: item.url,
        mediaId: item.id,
        altText: item.altText || item.title || undefined,
        title: item.title || undefined,
      },
    ]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 flex h-[85vh] w-full max-w-5xl flex-col rounded-2xl border border-border/80 bg-background shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/70 px-6 py-4 bg-card">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-bold text-foreground">{title}</h2>
            <div className="flex items-center rounded-lg border border-border/70 bg-muted/30 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("library")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 transition-colors ${
                  activeTab === "library"
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                Library
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 transition-colors ${
                  activeTab === "upload"
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UploadCloud className="h-3.5 w-3.5" />
                Upload New
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-muted/10">
          {activeTab === "library" ? (
            <MediaManager
              title=""
              description=""
              mode="picker"
              selectionLimit={maxSelections}
              onSelectItems={handleSelectedFromManager}
            />
          ) : (
            <div className="max-w-2xl mx-auto py-6">
              <MediaUploaderDropzone
                onUploadComplete={handleUploadComplete}
                onClose={() => setActiveTab("library")}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
