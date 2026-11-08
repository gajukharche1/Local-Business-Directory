"use client";

import { useState, useTransition } from "react";
import { updateListingStatusAction } from "@/actions/admin";
import { ListingStatus } from "@prisma/client";
import { Loader2 } from "lucide-react";

interface Props {
  listingId: string;
  initialStatus: ListingStatus;
}

const STATUS_CONFIG: Record<
  ListingStatus,
  { label: string; dot: string; badge: string }
> = {
  [ListingStatus.published]: {
    label: "Published",
    dot: "bg-emerald-500",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  [ListingStatus.pending_review]: {
    label: "Pending Review",
    dot: "bg-amber-500",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  [ListingStatus.draft]: {
    label: "Draft",
    dot: "bg-muted-foreground",
    badge: "border-border/70 bg-muted/60 text-muted-foreground",
  },
  [ListingStatus.rejected]: {
    label: "Rejected",
    dot: "bg-rose-500",
    badge: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  },
  [ListingStatus.expired]: {
    label: "Expired",
    dot: "bg-orange-500",
    badge: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400",
  },
  [ListingStatus.archived]: {
    label: "Archived",
    dot: "bg-muted-foreground/60",
    badge: "border-border/50 bg-muted/30 text-muted-foreground/80",
  },
};

export function ListingStatusSelect({ listingId, initialStatus }: Props) {
  const [status, setStatus] = useState<ListingStatus>(initialStatus);
  const [isPending, startTransition] = useTransition();

  const handleChange = (newStatus: ListingStatus) => {
    setStatus(newStatus);
    startTransition(async () => {
      const res = await updateListingStatusAction(listingId, newStatus);
      if (!res.success) {
        alert(res.error || "Failed to update listing status");
        setStatus(initialStatus);
      }
    });
  };

  const currentConfig = STATUS_CONFIG[status] || STATUS_CONFIG[ListingStatus.draft];

  return (
    <div className="flex items-center gap-2">
      <div
        className={`relative inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold shadow-xs transition-colors ${currentConfig.badge}`}
      >
        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${currentConfig.dot}`} />
        <select
          value={status}
          disabled={isPending}
          onChange={(e) => handleChange(e.target.value as ListingStatus)}
          className="bg-transparent border-none p-0 pr-4 text-xs font-semibold focus:outline-none focus:ring-0 cursor-pointer disabled:cursor-not-allowed appearance-none"
        >
          <option value={ListingStatus.published} className="bg-card text-foreground">
            Published
          </option>
          <option value={ListingStatus.pending_review} className="bg-card text-foreground">
            Pending Review
          </option>
          <option value={ListingStatus.draft} className="bg-card text-foreground">
            Draft
          </option>
          <option value={ListingStatus.rejected} className="bg-card text-foreground">
            Rejected
          </option>
          <option value={ListingStatus.archived} className="bg-card text-foreground">
            Archived
          </option>
        </select>
        <span className="pointer-events-none absolute right-2 text-[10px] opacity-70">▾</span>
      </div>

      {isPending && (
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
          <span>Saving...</span>
        </span>
      )}
    </div>
  );
}
