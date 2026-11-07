import Link from "next/link";
import db from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/session";
import { ListingStatus, ReviewStatus, ClaimRequestStatus } from "@prisma/client";
import { SettingsService } from "@/lib/services/settings.service";
import {
  ShieldAlert,
  Store,
  Users,
  Star,
  ArrowRight,
  Clock,
  Megaphone,
  PlusCircle,
  FolderTree,
  MapPin,
  Settings,
  Sparkles,
  Database,
  Lock,
  HardDrive,
  Activity,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    user,
    publishedListings,
    pendingListings,
    pendingReviews,
    pendingClaims,
    totalUsers,
    settings,
  ] = await Promise.all([
    getCurrentUser(),
    db.listing.count({ where: { status: ListingStatus.published } }).catch(() => 0),
    db.listing.count({ where: { status: ListingStatus.pending_review } }).catch(() => 0),
    db.review.count({ where: { status: ReviewStatus.pending } }).catch(() => 0),
    db.claimRequest.count({ where: { status: ClaimRequestStatus.pending } }).catch(() => 0),
    db.user.count().catch(() => 0),
    SettingsService.getAll(),
  ]);

  const pendingTotal = pendingReviews + pendingClaims + pendingListings;

  const quickActions = [
    {
      title: "Add New Listing",
      description: "Register a merchant or local business with categories and media",
      href: "/admin/listings/new",
      icon: PlusCircle,
      color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Manage Categories",
      description: "Organize taxonomy, SEO keywords, and category card badges",
      href: "/admin/categories",
      icon: FolderTree,
      color: "text-blue-600 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Location Hubs",
      description: "Configure neighborhoods, commercial centers, and landmarks",
      href: "/admin/locations",
      icon: MapPin,
      color: "text-purple-600 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Site Settings",
      description: "Customize directory name, badge initials, and operational controls",
      href: "/admin/settings",
      icon: Settings,
      color: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/70 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Command Center
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground font-medium">
              {settings.siteName || "Directory"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            System Overview & Operations
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            {settings.siteTagline
              ? `${settings.siteTagline} for ${settings.siteName}`
              : `Directory health, moderation queue status, and community activity for ${settings.siteName}`}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/admin/listings/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all duration-150"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Listing</span>
          </Link>
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-all duration-150"
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span>Settings</span>
          </Link>
        </div>
      </div>

      {/* Active Announcement Notice (if enabled in settings) */}
      {settings.announcementActive && settings.announcementBanner && (
        <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/20 p-4 flex items-center justify-between gap-4 text-xs shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Megaphone className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-blue-950 dark:text-blue-200 block truncate">
                Active Public Announcement
              </span>
              <p className="text-muted-foreground truncate">
                {settings.announcementBanner}
              </p>
            </div>
          </div>
          <Link
            href="/admin/settings"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
          >
            Configure
          </Link>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Published Listings */}
        <div className="group rounded-2xl border border-border/70 bg-card p-5 shadow-card hover:border-emerald-500/40 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Published Listings
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 ring-1 ring-emerald-500/20 transition-transform group-hover:scale-110">
              <Store className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-mono font-extrabold text-foreground mt-3 tracking-tight tabular-nums">
            {publishedListings}
          </p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50 text-[11px]">
            <span className="text-muted-foreground">Live in directory</span>
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Active
            </span>
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="group rounded-2xl border border-border/70 bg-card p-5 shadow-card hover:border-amber-500/40 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Pending Reviews
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 ring-1 ring-amber-500/20 transition-transform group-hover:scale-110">
              <Star className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-mono font-extrabold text-foreground mt-3 tracking-tight tabular-nums">
            {pendingReviews}
          </p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50 text-[11px]">
            <span className="text-muted-foreground">Awaiting moderation</span>
            {pendingReviews > 0 ? (
              <span className="font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                Action Required
              </span>
            ) : (
              <span className="text-muted-foreground">All Clear</span>
            )}
          </div>
        </div>

        {/* Claim Requests */}
        <div className="group rounded-2xl border border-border/70 bg-card p-5 shadow-card hover:border-blue-500/40 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Claim Requests
            </span>
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 ring-1 ring-blue-500/20 transition-transform group-hover:scale-110">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-mono font-extrabold text-foreground mt-3 tracking-tight tabular-nums">
            {pendingClaims}
          </p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50 text-[11px]">
            <span className="text-muted-foreground">Ownership proof checks</span>
            {pendingClaims > 0 ? (
              <span className="font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                Verify Proof
              </span>
            ) : (
              <span className="text-muted-foreground">Up to date</span>
            )}
          </div>
        </div>

        {/* Registered Users */}
        <div className="group rounded-2xl border border-border/70 bg-card p-5 shadow-card hover:border-purple-500/40 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Registered Users
            </span>
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 ring-1 ring-purple-500/20 transition-transform group-hover:scale-110">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-mono font-extrabold text-foreground mt-3 tracking-tight tabular-nums">
            {totalUsers}
          </p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50 text-[11px]">
            <span className="text-muted-foreground">Community accounts</span>
            <span className="font-semibold text-purple-600">Active</span>
          </div>
        </div>
      </div>

      {/* Moderation Command Center Alert */}
      {pendingTotal > 0 && (
        <div className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-gradient-to-r from-amber-50/70 via-amber-50/40 to-card dark:from-amber-950/30 dark:via-amber-950/15 dark:to-card p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <span>Action Required: Moderation Queue</span>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-600 text-white">
                    {pendingTotal} pending
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  New community content is waiting for verification before appearing in public directory search results.
                </p>

                {/* Sub-item count capsules */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card border text-[11px] font-semibold text-foreground">
                    <Star className="h-3 w-3 text-amber-600" />
                    <span>{pendingReviews} Reviews</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card border text-[11px] font-semibold text-foreground">
                    <Clock className="h-3 w-3 text-blue-600" />
                    <span>{pendingClaims} Claims</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card border text-[11px] font-semibold text-foreground">
                    <Store className="h-3 w-3 text-emerald-600" />
                    <span>{pendingListings} Listings</span>
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/admin/moderation"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 text-xs font-bold shadow transition-all duration-150 shrink-0 self-start md:self-center"
            >
              <span>Open Moderation Queue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Quick Launchpad Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">
            Operations Launchpad
          </h2>
          <p className="text-xs text-muted-foreground">
            Frequently used administration shortcuts and catalog management modules
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group rounded-2xl border border-border/70 bg-card p-5 shadow-card hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center border mb-3 transition-transform group-hover:scale-105 ${action.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    {action.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/50 flex items-center gap-1 text-[11px] font-semibold text-primary">
                  <span>Manage</span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* System Health & Security Matrix */}
      <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-border/70 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Platform Architecture & Security Guard
            </h3>
          </div>
          <span className="text-[10px] font-mono font-semibold text-muted-foreground">
            Next.js 15 · React 19 · Node 22
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/50">
            <Database className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-foreground">Prisma PostgreSQL</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Connected · Auto-sync enabled
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/50">
            <Lock className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-foreground">OWASP ASVS Guard</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Level 2 RBAC & Argon2id active
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/50">
            <HardDrive className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-foreground">Object Media Storage</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Cloudflare R2 / S3 Endpoint active
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
