"use client";

import React from "react";
import { X } from "lucide-react";

export interface BulkSelectToolbarProps {
  selectedCount: number;
  totalCount?: number;
  onClear: () => void;
  entityName?: string;
  children: React.ReactNode;
}

export function BulkSelectToolbar({
  selectedCount,
  totalCount,
  onClear,
  entityName = "items",
  children,
}: BulkSelectToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      role="toolbar"
      aria-label="Bulk actions toolbar"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-3xl w-[calc(100%-2rem)] sm:w-auto animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md p-2 sm:px-4 sm:py-2.5 shadow-2xl flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-start gap-2.5 sm:gap-3.5 text-xs text-foreground">
        {/* Selection Badge & Entity Info */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-primary/10 text-primary border border-primary/20 font-mono font-bold text-xs whitespace-nowrap">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>{selectedCount}</span>
            {totalCount !== undefined && (
              <span className="text-muted-foreground font-normal">of {totalCount}</span>
            )}
            <span className="font-semibold text-primary">{entityName} selected</span>
          </span>

          {/* Clear Button */}
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors font-medium active:scale-95"
            title="Clear active selection (Esc)"
          >
            <X className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear</span>
            <kbd className="hidden md:inline-block ml-0.5 px-1.5 py-0.5 rounded bg-muted border border-border/60 text-[10px] font-mono text-muted-foreground">
              Esc
            </kbd>
          </button>
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-border/80 hidden sm:block" />

        {/* Action Controls Slot */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
          {children}
        </div>
      </div>
    </div>
  );
}
