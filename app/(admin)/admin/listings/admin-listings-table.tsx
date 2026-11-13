"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ListingStatus } from "@prisma/client";
import { ListingStatusSelect } from "./listing-status-select";
import { useBulkSelect } from "@/lib/hooks/use-bulk-select";
import {
  BulkSelectCheckbox,
  BulkSelectToolbar,
  BulkConfirmModal,
  TablePagination,
} from "@/components/ui/bulk-select";
import {
  bulkUpdateListingStatusAction,
  bulkDeleteListingsAction,
  deleteListingAdminAction,
} from "@/actions/admin";
import {
  Building2,
  ExternalLink,
  Edit2,
  Edit3,
  Phone,
  Star,
  CheckCircle2,
  Archive,
  FileText,
  XCircle,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";

export interface AdminListingRow {
  id: string;
  slug: string;
  title: string;
  status: ListingStatus;
  locality: string;
  address: string;
  phone: string | null;
  averageRating: number;
  reviewCount: number;
  createdAt: Date | string;
  categories: Array<{ category: { name: string } }>;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  ogImage?: string | null;
}

interface AdminListingsTableProps {
  listings: AdminListingRow[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

export function AdminListingsTable({
  listings,
  totalCount,
  currentPage,
  pageSize,
}: AdminListingsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "delete" | "single-delete";
    singleListing?: AdminListingRow;
    title: string;
    description: string;
  }>({
    isOpen: false,
    type: "delete",
    title: "",
    description: "",
  });

  const {
    selectedIds,
    selectedCount,
    isSelected,
    isAllSelected,
    isPartiallySelected,
    toggle,
    toggleAll,
    clearSelection,
  } = useBulkSelect({
    items: listings,
    getItemId: (item) => item.id,
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageSizeChange = (newSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", String(newSize));
    params.set("page", "1"); // Reset to page 1 on page size change
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleBulkStatusChange = (status: ListingStatus) => {
    if (selectedCount === 0) return;
    setFeedback(null);

    startTransition(async () => {
      const ids = Array.from(selectedIds);
      const res = await bulkUpdateListingStatusAction(ids, status);
      if (res.success) {
        setFeedback({
          type: "success",
          message: `Successfully updated ${res.count ?? ids.length} listing(s) to ${status.replace("_", " ")}.`,
        });
        clearSelection();
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Failed to update listings.",
        });
      }
    });
  };

  const openDeleteModal = () => {
    setConfirmModal({
      isOpen: true,
      type: "delete",
      title: `Delete ${selectedCount} Listing${selectedCount === 1 ? "" : "s"}?`,
      description:
        "This will permanently delete the selected businesses and all associated categories junction, media assets, reviews, and analytics summaries from the directory database.",
    });
  };

  const openSingleDeleteModal = (listing: AdminListingRow) => {
    setConfirmModal({
      isOpen: true,
      type: "single-delete",
      singleListing: listing,
      title: `Delete Listing "${listing.title}"?`,
      description:
        "This will permanently delete this business and all associated media assets, customer reviews, and analytics. This action cannot be undone.",
    });
  };

  const handleConfirmAction = () => {
    setFeedback(null);
    if (confirmModal.type === "delete") {
      startTransition(async () => {
        const ids = Array.from(selectedIds);
        const res = await bulkDeleteListingsAction(ids);
        if (res.success) {
          setFeedback({
            type: "success",
            message: `Successfully deleted ${res.count ?? ids.length} listing(s).`,
          });
          clearSelection();
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          router.refresh();
        } else {
          setFeedback({
            type: "error",
            message: res.error || "Failed to delete listings.",
          });
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      });
    } else if (confirmModal.type === "single-delete" && confirmModal.singleListing) {
      const targetListing = confirmModal.singleListing;
      startTransition(async () => {
        const res = await deleteListingAdminAction(targetListing.id);
        if (res.success) {
          setFeedback({
            type: "success",
            message: `Successfully deleted listing "${targetListing.title}".`,
          });
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          router.refresh();
        } else {
          setFeedback({
            type: "error",
            message: res.error || "Failed to delete listing.",
          });
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Notification Alert */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Listings Table Card */}
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/70 bg-muted/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th scope="col" className="w-10 px-4 py-3.5">
                  <BulkSelectCheckbox
                    checked={isAllSelected}
                    indeterminate={isPartiallySelected}
                    onChange={toggleAll}
                    aria-label="Select all listings on this page"
                  />
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Business &amp; Category
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Locality
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Rating
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Status
                </th>
                <th scope="col" className="px-4 py-3.5">
                  SEO &amp; Metadata
                </th>
                <th scope="col" className="px-4 py-3.5 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {listings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-12 w-12 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-center text-muted-foreground">
                        <Building2 className="h-6 w-6 opacity-70" />
                      </div>
                      <p className="font-semibold text-sm text-foreground">No listings found</p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        No business listings match the current filters or search terms.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                listings.map((item, index) => {
                  const selected = isSelected(item.id);
                  const hasSeo = Boolean(item.seoTitle && item.seoDescription && item.seoKeywords);
                  const partialSeo = Boolean(item.seoTitle || item.seoDescription || item.seoKeywords || item.ogImage);

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        selected
                          ? "bg-primary/5 dark:bg-primary/10 hover:bg-primary/10"
                          : "hover:bg-muted/20"
                      }`}
                    >
                      <td className="w-10 px-4 py-4">
                        <BulkSelectCheckbox
                          checked={selected}
                          onChange={(e) => toggle(item.id, index, e)}
                          aria-label={`Select ${item.title}`}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <Link
                            href={`/listing/${item.slug}`}
                            target="_blank"
                            className="font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                          >
                            <span className="truncate max-w-[260px]">{item.title}</span>
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary shrink-0" />
                          </Link>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted/50 border border-border/50 text-[10px] font-semibold text-foreground/80">
                              {item.categories.map((c) => c.category.name).join(", ") || "General"}
                            </span>
                            {item.phone && (
                              <span className="flex items-center gap-1 font-mono text-[10px]">
                                <Phone className="h-2.5 w-2.5 text-muted-foreground/70" />
                                {item.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{item.locality}</span>
                          <span className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                            {item.address}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-foreground">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-bold">
                            {Number(item.averageRating || 0).toFixed(1)}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            ({item.reviewCount})
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <ListingStatusSelect
                          listingId={item.id}
                          initialStatus={item.status}
                        />
                      </td>
                      <td className="px-4 py-4">
                        {hasSeo ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Full Meta &amp; OG
                          </span>
                        ) : partialSeo ? (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-[11px]">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Partial SEO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 text-[11px]">
                            Default auto-tags
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/listings/${item.id}/edit`}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition"
                            title="Edit Listing Details & SEO"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => openSingleDeleteModal(item)}
                            disabled={isPending}
                            className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition disabled:opacity-50"
                            title="Delete Listing"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <TablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[50, 100, 500]}
          entityName="listings"
        />
      </div>

      {/* Floating Bulk Action Bar */}
      <BulkSelectToolbar
        selectedCount={selectedCount}
        totalCount={listings.length}
        onClear={clearSelection}
        entityName="listings"
      >
        {/* Bulk Status Select Dropdown / Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleBulkStatusChange(ListingStatus.published)}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50"
            title="Publish selected listings"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Publish</span>
          </button>

          <button
            type="button"
            onClick={() => handleBulkStatusChange(ListingStatus.draft)}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-xl border border-border/80 bg-card hover:bg-muted px-2.5 py-1.5 text-xs font-semibold text-foreground shadow-xs transition-all active:scale-95 disabled:opacity-50"
            title="Set selected listings as Draft"
          >
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleBulkStatusChange(ListingStatus.archived)}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-xl border border-border/80 bg-card hover:bg-muted px-2.5 py-1.5 text-xs font-semibold text-foreground shadow-xs transition-all active:scale-95 disabled:opacity-50"
            title="Archive selected listings"
          >
            <Archive className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Archive</span>
          </button>

          <button
            type="button"
            onClick={() => handleBulkStatusChange(ListingStatus.rejected)}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 px-2.5 py-1.5 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
            title="Reject selected listings"
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>Reject</span>
          </button>
        </div>

        {/* Bulk Delete Button */}
        <button
          type="button"
          onClick={openDeleteModal}
          disabled={isPending}
          className="inline-flex items-center gap-1 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 px-3 py-1.5 text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50 ml-1"
          title="Delete selected listings permanently"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
          <span>Delete</span>
        </button>
      </BulkSelectToolbar>

      {/* Confirmation Modal */}
      <BulkConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        title={confirmModal.title}
        description={confirmModal.description}
        warningNote="Warning: Deleting businesses is permanent and removes all customer reviews, lead messages, and analytics."
        itemCount={confirmModal.type === "single-delete" ? 1 : selectedCount}
        confirmLabel={confirmModal.type === "single-delete" ? "Delete Listing" : "Delete Listings"}
        isDestructive={true}
        isPending={isPending}
      />
    </div>
  );
}
