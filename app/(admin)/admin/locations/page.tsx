import { Suspense } from "react";
import { Metadata } from "next";
import db from "@/lib/db/client";
import { LocationManager, LocationItem } from "./location-manager";
import { MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Location & SEO Management | Admin Back-Office",
  description: "Create and edit locality hubs, GPS coordinates, permanent URLs, and SEO meta tags.",
};

export default async function AdminLocationsPage() {
  const locations = await db.location.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          listings: true,
          children: true,
        },
      },
    },
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">
            <MapPin className="h-4 w-4" />
            <span>Geographic Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Location &amp; SEO Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure Pimple Saudagar localities, GPS coordinates, permanent directory URLs, and search snippet previews.
          </p>
        </div>
      </div>

      {/* Interactive Location Manager */}
      <Suspense fallback={null}>
        <LocationManager
          initialLocations={locations.map((loc) => ({
            ...loc,
            latitude: loc.latitude !== null && loc.latitude !== undefined ? Number(loc.latitude) : null,
            longitude: loc.longitude !== null && loc.longitude !== undefined ? Number(loc.longitude) : null,
          }))}
        />
      </Suspense>
    </div>
  );
}
