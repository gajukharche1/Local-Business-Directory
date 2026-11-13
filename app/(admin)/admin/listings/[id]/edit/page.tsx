import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import db from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/rbac";
import { UserRole } from "@prisma/client";
import { ArrowLeft, Edit3, ExternalLink } from "lucide-react";
import { AdminEditListingForm } from "./admin-edit-listing-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Business Listing | Admin Console",
  description: "Modify existing business details, coordinates, SEO tags, and content blocks.",
};

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditListingPage({ params }: EditPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || !hasRole(user.role, UserRole.moderator)) {
    redirect(`/login?redirectTo=/admin/listings/${id}/edit`);
  }

  const [listing, categories, locations, plans, users] = await Promise.all([
    db.listing.findUnique({
      where: { id },
      include: {
        categories: { select: { categoryId: true } },
        locations: { select: { locationId: true } },
        media: {
          select: { id: true, url: true, altText: true },
          orderBy: { createdAt: "asc" },
        },
        plan: true,
      },
    }),
    db.category.findMany({
      select: { id: true, name: true, parentId: true },
      orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    }),
    db.location.findMany({
      select: { id: true, name: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.pricingPlan.findMany({
      select: { id: true, name: true, priceMinor: true },
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    }),
    db.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
      take: 100,
    }),
  ]);

  if (!listing) {
    notFound();
  }

  // Convert Decimal, BigInt, and dates into plain serializable values for Client Components
  const serializedListing = {
    ...listing,
    viewCount: Number(listing.viewCount ?? 0),
    averageRating: listing.averageRating !== null && listing.averageRating !== undefined ? Number(listing.averageRating) : 0,
    latitude: listing.latitude !== null && listing.latitude !== undefined ? Number(listing.latitude) : null,
    longitude: listing.longitude !== null && listing.longitude !== undefined ? Number(listing.longitude) : null,
    createdAt: listing.createdAt.toISOString(),
    updatedAt: listing.updatedAt.toISOString(),
    publishedAt: listing.publishedAt?.toISOString() ?? null,
    planStartedAt: listing.planStartedAt?.toISOString() ?? null,
    planExpiresAt: listing.planExpiresAt?.toISOString() ?? null,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/listings"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Listings</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Edit3 className="h-6 w-6 text-amber-600" />
            <span>Edit Listing: {listing.title}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Update listing parameters, HTML blocks, coordinates, SEO meta, or customize its permanent URL slug.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/listing/${listing.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition"
          >
            <span>View Public Page</span>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>
        </div>
      </div>

      {/* Edit Form */}
      <AdminEditListingForm
        listing={serializedListing}
        categories={categories}
        locations={locations}
        plans={plans}
        users={users}
      />
    </div>
  );
}

