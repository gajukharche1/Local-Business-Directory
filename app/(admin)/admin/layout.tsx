import { redirect } from "next/navigation";
import Link from "next/link";
import db from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/rbac";
import { UserRole, ReviewStatus, ClaimRequestStatus, ListingStatus } from "@prisma/client";
import { SettingsService } from "@/lib/services/settings.service";
import { type AdminNavItem } from "./admin-nav";
import { AdminSidebar } from "./admin-sidebar";
import { DashboardUserMenu } from "@/components/dashboard/dashboard-user-menu";
import {
  ShieldAlert,
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
    {
      label: "Categories",
      icon: "folder",
      children: [
        { label: "All Categories", href: "/admin/categories", icon: "List" },
        { label: "Add New Category", href: "/admin/categories/new", icon: "ListPlus" },
      ],
    },
    {
      label: "Locations",
      icon: "map",
      children: [
        { label: "All Locations", href: "/admin/locations", icon: "List" },
        { label: "Add New Location", href: "/admin/locations/new", icon: "ListPlus" },
      ],
    },
    { label: "CSV Import / Export", href: "/admin/imports", icon: "upload" },
    ...(hasRole(user.role, UserRole.admin)
      ? [{ label: "Site & Settings", href: "/admin/settings", icon: "settings" as const }]
      : []),
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/15 antialiased selection:bg-primary/20">
      {/* Collapsible Admin Sidebar */}
      <AdminSidebar
        settings={{
          siteBadge: settings.siteBadge,
          siteName: settings.siteName,
          adminTitle: settings.adminTitle,
        }}
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }}
        navItems={navItems}
      />

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

            <DashboardUserMenu
              user={{
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
              }}
            />
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full">{children}</main>
      </div>
    </div>
  );
}
