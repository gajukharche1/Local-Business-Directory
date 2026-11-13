import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { ListingService } from "@/lib/services/listing.service";
import { AnalyticsService } from "@/lib/services/analytics.service";
import { AnalyticsAreaChart } from "@/components/analytics/analytics-area-chart";
import { AnalyticsBreakdownBar } from "@/components/analytics/analytics-breakdown-bar";
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  Users,
  Activity,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Calendar,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface ListingAnalyticsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ period?: string }>;
}

export default async function ListingAnalyticsPage({
  params,
  searchParams,
}: ListingAnalyticsPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const { period } = await searchParams;

  const listing = await ListingService.getById(id);
  if (!listing) notFound();

  // Ensure caller is the owner or an admin/moderator
  if (listing.ownerId !== user.id && user.role !== "admin" && user.role !== "moderator") {
    redirect("/dashboard/listings");
  }

  const periodDays = period === "7d" ? 7 : period === "90d" ? 90 : 30;
  const analytics = await AnalyticsService.getListingAnalytics(id, periodDays);

  const formatDelta = (pct: number) => {
    if (pct === 0) return { text: "0%", isPositive: true };
    const isPositive = pct > 0;
    return {
      text: `${isPositive ? "+" : ""}${pct}%`,
      isPositive,
    };
  };

  const viewsDelta = formatDelta(analytics.deltas.viewsPct);
  const actionsDelta = formatDelta(analytics.deltas.actionsPct);
  const convDelta = formatDelta(analytics.deltas.conversionRatePct);

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/listings"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-1.5 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to My Listings</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              {listing.title}
            </h1>
            <Link
              href={`/listing/${listing.slug}`}
              target="_blank"
              className="text-xs text-primary hover:underline inline-flex items-center gap-0.5"
            >
              <span>View live</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Performance analytics, visitor trends, and customer conversion telemetry
          </p>
        </div>

        {/* Timeframe Selector Pills */}
        <div className="flex items-center gap-1 p-1 bg-muted/60 border border-border/80 rounded-xl self-start">
          {[
            { label: "Last 7 Days", val: "7d" },
            { label: "Last 30 Days", val: "30d" },
            { label: "Last 90 Days", val: "90d" },
          ].map((tab) => {
            const isActive =
              (periodDays === 7 && tab.val === "7d") ||
              (periodDays === 30 && tab.val === "30d") ||
              (periodDays === 90 && tab.val === "90d");
            return (
              <Link
                key={tab.val}
                href={`/dashboard/listings/${id}/analytics?period=${tab.val}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  isActive
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Views */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Page Views</span>
            <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono tabular-nums text-foreground">
              {analytics.totalViews.toLocaleString()}
            </span>
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                viewsDelta.isPositive
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-rose-500/10 text-rose-600"
              }`}
            >
              {viewsDelta.isPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {viewsDelta.text}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">Storefront impressions</p>
        </div>

        {/* Unique Visitors */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Unique Visitors</span>
            <div className="h-8 w-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono tabular-nums text-foreground">
              {analytics.uniqueVisitors.toLocaleString()}
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
              DPDP Verified
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">De-duplicated daily visitors</p>
        </div>

        {/* Customer Actions / CTAs */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Customer CTAs</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono tabular-nums text-foreground">
              {analytics.totalActions.toLocaleString()}
            </span>
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                actionsDelta.isPositive
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-rose-500/10 text-rose-600"
              }`}
            >
              {actionsDelta.isPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {actionsDelta.text}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">Calls, WhatsApp, Maps & Quotes</p>
        </div>

        {/* Conversion Rate */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Conversion Rate</span>
            <div className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono tabular-nums text-foreground">
              {analytics.conversionRate}%
            </span>
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                convDelta.isPositive
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-rose-500/10 text-rose-600"
              }`}
            >
              {convDelta.isPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {convDelta.text}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">Actions per page impression</p>
        </div>
      </div>

      {/* Main Area Chart Card */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold tracking-tight text-foreground">
              Traffic & High-Intent Engagement
            </h3>
            <p className="text-xs text-muted-foreground">
              Daily volume comparison between storefront visitors and direct customer contacts
            </p>
          </div>
        </div>

        <AnalyticsAreaChart data={analytics.dailySeries} />
      </div>

      {/* Action Breakdown Card */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-extrabold tracking-tight text-foreground">
            Customer Contact Breakdown
          </h3>
          <p className="text-xs text-muted-foreground">
            Distribution of high-intent conversion channels utilized by local buyers
          </p>
        </div>

        <AnalyticsBreakdownBar
          breakdown={analytics.actionBreakdown}
          totalActions={analytics.totalActions}
        />
      </div>

      {/* Merchant Insights / Optimization Tip */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex items-start gap-4">
        <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-foreground">
            Tips to Boost Your Storefront Conversion
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Businesses with full 7-day opening hours, WhatsApp chat enabled, and a verified phone number convert up to 3.2x more visitors into direct customer phone calls and visits. Ensure your store photos and services rate card are kept up-to-date.
          </p>
        </div>
      </div>
    </div>
  );
}
