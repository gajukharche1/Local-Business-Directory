"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminNav, type AdminNavItem } from "./admin-nav";
import { logoutAction } from "@/actions/auth";
import {
  ArrowLeft,
  LogOut,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface AdminSidebarProps {
  settings: {
    siteBadge?: string | null;
    siteName?: string | null;
    adminTitle?: string | null;
  };
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  navItems: AdminNavItem[];
}

export function AdminSidebar({ settings, user, navItems }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("lbd_admin_sidebar_collapsed");
    if (saved === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("lbd_admin_sidebar_collapsed", String(next));
      }
      return next;
    });
  };

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
    <aside
      className={`border-r border-border/70 bg-card flex flex-col justify-between shrink-0 shadow-xs transition-[width] duration-200 ease-in-out ${
        isCollapsed ? "w-full md:w-20" : "w-full md:w-64"
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="p-3.5 border-b border-border/70 bg-card">
          {!isCollapsed ? (
            <div className="flex items-center justify-between gap-2">
              <Link
                href="/admin"
                className="flex items-center gap-3 min-w-0 group transition-transform duration-150"
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

              <button
                type="button"
                onClick={toggleCollapse}
                title="Collapse sidebar (Ctrl + B)"
                aria-label="Collapse sidebar"
                className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Link
                href="/admin"
                title={`${settings.siteName || "Directory"} - ${settings.adminTitle || "Admin Console"}`}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-600 text-primary-foreground font-extrabold text-sm shadow-sm uppercase shrink-0 ring-2 ring-primary/20 hover:scale-105 transition-transform"
              >
                {settings.siteBadge || "LBD"}
              </Link>
              <button
                type="button"
                onClick={toggleCollapse}
                title="Expand sidebar"
                aria-label="Expand sidebar"
                className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* User Capsule */}
        <div className="p-3 border-b border-border/70 bg-muted/20">
          {!isCollapsed ? (
            <div>
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
          ) : (
            <div
              className="flex justify-center"
              title={`${user.name} (${user.email}) • ${user.role} Privilege`}
            >
              <div className="relative">
                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase shadow-xs">
                  {userInitials}
                </div>
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card"
                  title="Active Session"
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <AdminNav items={navItems} isCollapsed={isCollapsed} />
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-border/70 space-y-1 bg-muted/10">
        {!isCollapsed ? (
          <>
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

            {/* Bottom Collapse Toggle */}
            <button
              type="button"
              onClick={toggleCollapse}
              className="hidden md:flex w-full items-center gap-2 px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors rounded-lg mt-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Collapse Sidebar</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <Link
              href="/"
              title="Return to Public Directory"
              className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                title="Sign Out"
                className="flex h-9 w-9 items-center justify-center text-destructive hover:bg-destructive/10 transition-colors rounded-xl"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>

            <button
              type="button"
              onClick={toggleCollapse}
              title="Expand Sidebar"
              className="hidden md:flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors rounded-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

