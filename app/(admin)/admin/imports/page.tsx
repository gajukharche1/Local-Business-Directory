import { Metadata } from "next";
import db from "@/lib/db/client";
import { CsvImporter } from "./csv-importer";
import { UploadCloud, Store, FolderTree, MapPin, Database } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bulk CSV & Data Import Hub | Admin Back-Office",
  description:
    "Batch import and seed local business listings with operating hours, category taxonomy hierarchies, and locality geographic hubs.",
};

export default async function AdminImportsPage() {
  const [listingsCount, categoriesCount, locationsCount] = await Promise.all([
    db.listing.count(),
    db.category.count(),
    db.location.count(),
  ]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
            <UploadCloud className="h-4 w-4" />
            <span>Data Ingestion &amp; Seeding Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Bulk CSV &amp; Data Import Hub
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Upload or paste CSV spreadsheets to seed verified storefronts with operating hours, category hierarchies, and locality geographic hubs.
          </p>
        </div>

        {/* Live Metrics Row */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border/70 shadow-2xs">
            <Store className="h-4 w-4 text-primary shrink-0" />
            <div>
              <span className="block text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                Listings
              </span>
              <span className="font-mono text-sm font-bold text-foreground tabular-nums">
                {listingsCount}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border/70 shadow-2xs">
            <FolderTree className="h-4 w-4 text-emerald-600 shrink-0" />
            <div>
              <span className="block text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                Categories
              </span>
              <span className="font-mono text-sm font-bold text-foreground tabular-nums">
                {categoriesCount}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border/70 shadow-2xs">
            <MapPin className="h-4 w-4 text-indigo-600 shrink-0" />
            <div>
              <span className="block text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                Locations
              </span>
              <span className="font-mono text-sm font-bold text-foreground tabular-nums">
                {locationsCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Importer */}
      <CsvImporter />
    </div>
  );
}
