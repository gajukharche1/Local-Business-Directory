import { redirect } from "next/navigation";
import Link from "next/link";
import db from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/rbac";
import { logoutAction } from "@/actions/auth";
import { UserRole, ReviewStatus, ClaimRequestStatus, ListingStatus } from "@prisma/client";
import { SettingsService } from "@/lib/services/settings.service";
import { AdminNav, type AdminNavItem } from "./admin-nav";
import {
  ShieldAlert,
  ArrowLeft,
  LogOut,
  Settings,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, settings, pendingReviews, pendingClaims, pendingListings] = await Promise.all([
    getCurrentUser(),
    SettingsService.getAll(),
    db.review.count({ where: { status: ReviewStatus.pending } }).catch(() => 0),
    db.claimRequest.count({ where: { status: ClaimRequestStatus.pending } }).catch(() => 0),
    db.listing.count({ where: { status: ListingStatus.pending_review } }).catch(() => 0),
  ]);

  if (!user || !hasRole(user.role, UserRole.moderator)) {
    redirect("/login?redirectTo=/admin");
  }

  const pendingTotal = pendingReviews + pendingClaims + pendingListings;

  const navItems: AdminNavItem[] = [
    { label: "Dashboard", href: "/admin", icon: "sliders" },
    {
      label: "Moderation Queue",
      href: "/admin/moderation",
      icon: "shield",
      badge: pendingTotal > 0 ? pendingTotal : undefined,
    },
    {
      label: "Listing",
      icon: "Store",
      children: [
        { label: "All Listing", href: "/admin/listings", icon: "clipboard" },
        { label: "Add New Listing", href: "/admin/listings/new", icon: "plus" },
      ],
    },
    { label: "Categories", href: "/admin/categories", icon: "folder" },
    { label: "Locations", href: "/admin/locations", icon: "map" },
    { label: "CSV Import / Export", href: "/admin/imports", icon: "upload" },
    ...(hasRole(user.role, UserRole.admin)
      ? [{ label: "Site & Settings", href: "/admin/settings", icon: "settings" as const }]
      : []),
  ];

  // User avatar initials
  const userInitials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AD";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/15 antialiased selection:bg-primary/20">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 border-r border-border/70 bg-card flex flex-col justify-between shrink-0 shadow-xs">
        <div>
          {/* Brand Header */}
          <div className="p-4 border-b border-border/70 bg-card">
            <Link
              href="/admin"
              className="flex items-center gap-3 group transition-transform duration-150"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-600 text-primary-foreground font-extrabold text-sm shadow-sm uppercase shrink-0 ring-2 ring-primary/20">
                {settings.siteBadge || "LBD"}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold tracking-tight text-sm text-foreground block leading-tight truncate group-hover:text-primary transition-colors">
                  {settings.siteName || "Directory"}
                </span>
                <span className="text-[10px] text-primary uppercase font-bold tracking-wider block truncate mt-0.5">
                  {settings.adminTitle || "Admin Console"}
                </span>
              </div>
            </Link>
          </div>

          {/* Admin User Capsule */}
          <div className="p-4 border-b border-border/70 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase shadow-xs">
                  {userInitials}
                </div>
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card"
                  title="Active Session"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-foreground truncate leading-tight">
                  {user.name}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 dark:bg-primary/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {user.role} Privilege
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                OWASP ASVS
              </span>
            </div>
          </div>

          {/* Navigation Items (Client Component for active highlighting) */}
          <AdminNav items={navItems} />
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-border/70 space-y-1 bg-muted/10">
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-muted"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Public Directory</span>
            </div>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors rounded-xl"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border/70 bg-card/95 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <div className="text-xs font-semibold text-foreground">
              <span>Operational Status</span>
              <span className="hidden sm:inline text-muted-foreground font-normal ml-2">
                · Level 2 RBAC Guard Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {pendingTotal > 0 && (
              <Link
                href="/admin/moderation"
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-colors"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>{pendingTotal} Pending Items</span>
              </Link>
            )}

            <Link
              href="/admin/settings"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Settings</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full">{children}</main>
      </div>
    </div>
  );
}
