import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { ListingService } from "@/lib/services/listing.service";
import { AnalyticsService } from "@/lib/services/analytics.service";
import {
  BarChart3,
  Store,
  ArrowRight,
  Eye,
  Activity,
  Plus,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardAnalyticsOverviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const listings = await ListingService.getByOwnerId(user.id);

  if (listings.length === 1 && listings[0]) {
    redirect(`/dashboard/listings/${listings[0].id}/analytics`);
  }

  // Fetch 30-day analytics summary for each owned listing concurrently
  const listingSummaries = await Promise.all(
    listings.map(async (l) => {
      const summary = await AnalyticsService.getListingAnalytics(l.id, 30);
      return {
        ...l,
        analytics: summary,
      };
    })
  );

  const totalPortfolioViews = listingSummaries.reduce(
    (acc, curr) => acc + curr.analytics.totalViews,
    0
  );
  const totalPortfolioActions = listingSummaries.reduce(
    (acc, curr) => acc + curr.analytics.totalActions,
    0
  );
  const avgPortfolioConversion =
    totalPortfolioViews > 0
      ? ((totalPortfolioActions / totalPortfolioViews) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Business Analytics Hub
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cross-storefront visibility, customer action tracking, and conversion metrics
          </p>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-card p-12 text-center shadow-card">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/60 mb-3" />
          <h3 className="font-bold text-base text-foreground">No storefronts connected</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            You need at least one claimed or listed business to track impressions, calls, and WhatsApp enquiries.
          </p>
          <Link
            href="/submit"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary-600 transition shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Business</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Portfolio KPI Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
              <span className="text-xs font-semibold text-muted-foreground">Portfolio Views (30D)</span>
              <p className="text-2xl font-black font-mono tabular-nums text-foreground mt-2">
                {totalPortfolioViews.toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
              <span className="text-xs font-semibold text-muted-foreground">Customer Actions (30D)</span>
              <p className="text-2xl font-black font-mono tabular-nums text-foreground mt-2">
                {totalPortfolioActions.toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
              <span className="text-xs font-semibold text-muted-foreground">Average Conversion</span>
              <p className="text-2xl font-black font-mono tabular-nums text-foreground mt-2">
                {avgPortfolioConversion}%
              </p>
            </div>
          </div>

          {/* Listing Cards */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-foreground">Select Storefront for Deep Dive</h3>
            <div className="grid grid-cols-1 gap-3">
              {listingSummaries.map((l) => (
                <div
                  key={l.id}
                  className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/40 transition group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-primary shrink-0" />
                      <h4 className="font-extrabold text-sm text-foreground group-hover:text-primary transition-colors">
                        {l.title}
                      </h4>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {l.locality}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                      <span>{l.analytics.totalViews.toLocaleString()} views</span>
                      <span>•</span>
                      <span>{l.analytics.totalActions.toLocaleString()} actions</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-bold">{l.analytics.conversionRate}% conv.</span>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/listings/${l.id}/analytics`}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-bold text-xs transition"
                  >
                    <span>View Analytics</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
