import { Metadata } from "next";
import Link from "next/link";
import db from "@/lib/db/client";
import { ListingStatus } from "@prisma/client";
import { ListingStatusSelect } from "./listing-status-select";
import {
  PlusCircle,
  Upload,
  Search,
  Star,
  MapPin,
  ExternalLink,
  Edit3,
  Building2,
  Phone,
  SlidersHorizontal,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Listing Management | Admin Back-Office",
  description: "Browse, filter, and moderate local business listings.",
};

interface SearchParamsProps {
  searchParams: Promise<{
    status?: string;
    q?: string;
  }>;
}

export default async function AdminListingsPage({ searchParams }: SearchParamsProps) {
  const resolvedParams = await searchParams;
  const statusFilter = resolvedParams.status as ListingStatus | undefined;
  const query = resolvedParams.q || "";

  let listings: Array<{
    id: string;
    slug: string;
    title: string;
    status: ListingStatus;
    locality: string;
    address: string;
    phone: string | null;
    averageRating: any;
    reviewCount: number;
    createdAt: Date;
    categories: Array<{ category: { name: string } }>;
  }> = [];

  let totalCount = 0;

  try {
    const whereClause: any = {};
    if (statusFilter && Object.values(ListingStatus).includes(statusFilter)) {
      whereClause.status = statusFilter;
    }
    if (query) {
      whereClause.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { address: { contains: query, mode: "insensitive" } },
        { locality: { contains: query, mode: "insensitive" } },
      ];
    }

    listings = await db.listing.findMany({
      where: whereClause,
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        locality: true,
        address: true,
        phone: true,
        averageRating: true,
        reviewCount: true,
        createdAt: true,
        categories: {
          select: {
            category: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    totalCount = await db.listing.count({ where: whereClause });
  } catch (error) {
    console.warn("Database offline or unavailable during admin listings query:", error);
  }

  const statusTabs = [
    { label: "All", value: "" },
    { label: "Published", value: "published" },
    { label: "Pending Review", value: "pending_review" },
    { label: "Draft", value: "draft" },
    { label: "Rejected", value: "rejected" },
    { label: "Archived", value: "archived" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Directory Listings
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20">
              {totalCount} Total
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Displaying{" "}
            <span className="font-mono font-semibold text-foreground">
              {listings.length}
            </span>{" "}
            records matching current query and status filters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/listings/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add New Listing</span>
          </Link>
          <Link
            href="/admin/imports"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-xs hover:bg-muted/70 transition-all active:scale-[0.98]"
          >
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span>Import CSV</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-xs md:flex-row md:items-center md:justify-between">
        {/* Segmented Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {statusTabs.map((tab) => {
            const isActive = (statusFilter || "") === tab.value;
            const href = tab.value ? `/admin/listings?status=${tab.value}` : "/admin/listings";
            return (
              <Link
                key={tab.label}
                href={href}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Search Input */}
        <form method="GET" action="/admin/listings" className="flex items-center gap-2">
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by name, address, locality..."
              className="w-56 sm:w-64 rounded-xl border border-border/70 bg-background pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl border border-border/70 bg-muted/40 hover:bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition-colors shadow-xs active:scale-[0.98]"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Listings Table Card */}
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/70 bg-muted/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th scope="col" className="px-5 py-3.5">
                  Business &amp; Category
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Locality
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Rating
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Status
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {listings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-12 w-12 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-center text-muted-foreground">
                        <Building2 className="h-6 w-6 opacity-70" />
                      </div>
                      <p className="font-semibold text-sm text-foreground">No listings found</p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        {query || statusFilter
                          ? "Try clearing filters or search keywords to view other listings."
                          : "No business listings currently in the directory database."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                listings.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4">
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
                              <span>{item.phone}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-foreground">
                      <div className="flex items-center gap-1.5 font-semibold text-xs">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                        <span>{item.locality || "Pimple Saudagar"}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate max-w-[220px] mt-0.5">
                        {item.address}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500 shrink-0" />
                        <span className="font-bold text-foreground font-mono tabular-nums text-xs">
                          {Number(item.averageRating || 0).toFixed(1)}
                        </span>
                        <span className="text-muted-foreground text-[11px] font-mono tabular-nums">
                          ({item.reviewCount})
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <ListingStatusSelect listingId={item.id} initialStatus={item.status} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/listings/${item.id}/edit`}
                          className="inline-flex items-center gap-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1 text-xs font-semibold transition-colors active:scale-95"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Edit</span>
                        </Link>
                        <Link
                          href={`/listing/${item.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded-lg border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground px-2.5 py-1 text-xs font-semibold transition-colors"
                        >
                          <span>View</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
