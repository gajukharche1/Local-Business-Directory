"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import {
  LayoutDashboard,
  Store,
  Inbox,
  Star,
  CreditCard,
  Image as ImageIcon,
  LogOut,
  ArrowLeft,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface DashboardSidebarProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lbd_dashboard_sidebar_collapsed");
    if (saved === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("lbd_dashboard_sidebar_collapsed", String(next));
      }
      return next;
    });
  };

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Listings", href: "/dashboard/listings", icon: Store },
    { label: "Leads & Enquiries", href: "/dashboard/enquiries", icon: Inbox },
    { label: "Customer Reviews", href: "/dashboard/reviews", icon: Star },
    { label: "Media Files", href: "/dashboard/media", icon: ImageIcon },
    { label: "Plan & Billing", href: "/dashboard/billing", icon: CreditCard },
  ];

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "ME";

  return (
    <aside
      className={`border-r border-border/70 bg-card flex flex-col justify-between shrink-0 shadow-xs transition-[width] duration-200 ease-in-out ${
        isCollapsed ? "w-full md:w-20" : "w-full md:w-64"
      }`}
    >
      <div>
        {/* Top Brand */}
        <div className="p-3.5 border-b border-border/70 bg-card">
          {!isCollapsed ? (
            <div className="flex items-center justify-between gap-2">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-extrabold text-sm shadow-sm ring-2 ring-primary/20 shrink-0">
                  PS
                </div>
                <div className="min-w-0">
                  <span className="font-bold tracking-tight text-sm text-foreground block leading-tight truncate group-hover:text-primary transition-colors">
                    Pimple Saudagar
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block truncate mt-0.5">
                    Owner Dashboard
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={toggleCollapse}
                title="Collapse sidebar"
                className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Link
                href="/"
                title="Pimple Saudagar - Owner Dashboard"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-extrabold text-sm shadow-sm ring-2 ring-primary/20 hover:scale-105 transition-transform"
              >
                PS
              </Link>
              <button
                type="button"
                onClick={toggleCollapse}
                title="Expand sidebar"
                className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* User Profile Summary */}
        <div className="p-3 border-b border-border/70 bg-muted/20">
          {!isCollapsed ? (
            <div>
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-foreground truncate">{user.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <span className="inline-block mt-2 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {user.role} Account
              </span>
            </div>
          ) : (
            <div
              className="flex justify-center"
              title={`${user.name} (${user.email}) - ${user.role} Account`}
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                {initials}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className={`p-2 space-y-1 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            if (isCollapsed) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 ${
                    isActive
                      ? "bg-primary/10 text-primary font-bold shadow-xs dark:bg-primary/20 ring-1 ring-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-150 ${
                  isActive
                    ? "bg-primary/10 text-primary font-bold shadow-xs dark:bg-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-border/70 space-y-1 bg-muted/10">
        {!isCollapsed ? (
          <>
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition rounded-xl hover:bg-muted"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Public Directory</span>
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition rounded-xl"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </form>

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

