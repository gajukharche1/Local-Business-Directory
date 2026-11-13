import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/rbac";
import { UserRole } from "@prisma/client";
import { AnalyticsService } from "@/lib/services/analytics.service";
import { AnalyticsAreaChart } from "@/components/analytics/analytics-area-chart";
import {
  Eye,
  Users,
  Activity,
  TrendingUp,
  Store,
  ExternalLink,
  ShieldCheck,
  BarChart3,
  MapPin,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface AdminAnalyticsPageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function AdminAnalyticsPage({ searchParams }: AdminAnalyticsPageProps) {
  const user = await getCurrentUser();
  if (!user || !hasRole(user.role, UserRole.moderator)) {
    redirect("/login?redirectTo=/admin/analytics");
  }

  const { period } = await searchParams;
  const periodDays = period === "7d" ? 7 : period === "90d" ? 90 : 30;

  const data = await AnalyticsService.getDirectoryAnalytics(periodDays);

  return (
    <div className="space-y-6">
      {/* Top Banner & Timeframe Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Directory Analytics & Conversion Intelligence
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 border border-emerald-500/20">
              <ShieldCheck className="h-3 w-3" />
              <span>DPDP 2023 Compliant</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Network-wide telemetry, high-intent buyer actions, and business ranking analytics
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
                href={`/admin/analytics?period=${tab.val}`}
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

      {/* Directory KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Directory Views */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Impressions</span>
            <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono tabular-nums text-foreground">
              {data.totalViews.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
              {periodDays}D Window
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">Storefront impressions across directory</p>
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
              {data.uniqueVisitors.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              No Cookies
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">Daily salted hash deduplicated</p>
        </div>

        {/* Total Customer Actions */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Customer Actions (CTAs)</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono tabular-nums text-foreground">
              {data.totalActions.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              High-Intent
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">Calls, WhatsApp, Maps & Quotes</p>
        </div>

        {/* Directory-Wide Conversion Rate */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Platform Conversion</span>
            <div className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono tabular-nums text-foreground">
              {data.overallConversionRate}%
            </span>
            <span className="text-[10px] font-bold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-md">
              Benchmark
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">Average actions per 100 views</p>
        </div>
      </div>

      {/* Main Directory Area Chart Card */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-extrabold tracking-tight text-foreground">
            Platform Traffic & Buyer Intent Over Time
          </h3>
          <p className="text-xs text-muted-foreground">
            Aggregated daily impressions vs buyer conversion actions across all active listings
          </p>
        </div>

        <AnalyticsAreaChart data={data.dailySeries} />
      </div>

      {/* Top 10 Most Engaged Businesses Leaderboard */}
      <div className="rounded-3xl border border-border/80 bg-card shadow-sm overflow-hidden space-y-4 p-6">
        <div>
          <h3 className="text-base font-extrabold tracking-tight text-foreground">
            Top Performing Business Profiles
          </h3>
          <p className="text-xs text-muted-foreground">
            Businesses generating the highest storefront traffic and buyer enquiries
          </p>
        </div>

        {data.topListings.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border/80 rounded-2xl bg-muted/20 text-xs text-muted-foreground">
            No listing activity captured in this timeframe yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/80 bg-muted/30 font-semibold text-muted-foreground">
                <tr>
                  <th className="p-3.5">Rank</th>
                  <th className="p-3.5">Business Name</th>
                  <th className="p-3.5">Locality</th>
                  <th className="p-3.5">Views ({periodDays}D)</th>
                  <th className="p-3.5">Customer CTAs</th>
                  <th className="p-3.5">Conv. Rate</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data.topListings.map((b, idx) => {
                  const conv = b.views > 0 ? ((b.actions / b.views) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={b.id} className="hover:bg-muted/30 transition">
                      <td className="p-3.5 font-mono font-extrabold text-muted-foreground">
                        #{idx + 1}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-extrabold text-foreground">{b.title}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-muted-foreground">{b.locality}</td>
                      <td className="p-3.5 font-mono font-bold tabular-nums text-foreground">
                        {b.views.toLocaleString()}
                      </td>
                      <td className="p-3.5 font-mono font-bold tabular-nums text-emerald-600">
                        {b.actions.toLocaleString()}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-foreground">
                        {conv}%
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          href={`/dashboard/listings/${b.id}/analytics`}
                          className="inline-flex items-center gap-1 font-bold text-xs text-primary hover:underline"
                        >
                          <span>Deep Dive</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
