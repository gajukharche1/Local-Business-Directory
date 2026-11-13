import { Metadata } from "next";
import Link from "next/link";
import db from "@/lib/db/client";
import { ListingStatus } from "@prisma/client";
import { AdminListingsTable } from "./admin-listings-table";
import {
  PlusCircle,
  Upload,
  Search,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Listing Management | Admin Back-Office",
  description: "Browse, filter, and moderate local business listings with bulk selection and pagination.",
};

interface SearchParamsProps {
  searchParams: Promise<{
    status?: string;
    q?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function AdminListingsPage({ searchParams }: SearchParamsProps) {
  const resolvedParams = await searchParams;
  const statusFilter = resolvedParams.status as ListingStatus | undefined;
  const query = resolvedParams.q || "";

  // Pagination parameters
  const page = Math.max(1, parseInt(resolvedParams.page || "1", 10));
  const parsedLimit = parseInt(resolvedParams.limit || "50", 10);
  const limit = [50, 100, 500].includes(parsedLimit) ? parsedLimit : 50;
  const skip = (page - 1) * limit;

  let listings: any[] = [];
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

    totalCount = await db.listing.count({ where: whereClause });

    const rawListings = await db.listing.findMany({
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
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        ogImage: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    listings = rawListings.map((l) => ({
      ...l,
      averageRating: l.averageRating !== null && l.averageRating !== undefined ? Number(l.averageRating) : 0,
      createdAt: l.createdAt.toISOString(),
    }));
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
            records on page {page} matching current filters.
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
            const params = new URLSearchParams();
            if (tab.value) params.set("status", tab.value);
            if (query) params.set("q", query);
            if (limit !== 50) params.set("limit", String(limit));
            const href = params.toString() ? `/admin/listings?${params.toString()}` : "/admin/listings";

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
          {limit !== 50 && <input type="hidden" name="limit" value={limit} />}
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

      {/* Interactive Listings Table with Bulk Selection & Pagination */}
      <AdminListingsTable
        listings={listings}
        totalCount={totalCount}
        currentPage={page}
        pageSize={limit}
      />
    </div>
  );
}
