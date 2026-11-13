"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Sliders,
  Store,
  ClipboardList,
  Clipboard,
  List,
  ListPlus,
  Upload,
  PlusCircle,
  FolderTree,
  MapPin,
  Settings,
  ChevronDown,
  Circle,
  Loader2,
  Image as ImageIcon,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export type NavIconKey =
  | "sliders"
  | "shield"
  | "store"
  | "Store"
  | "clipboard"
  | "clipboard-list"
  | "plus"
  | "folder"
  | "Folder"
  | "map"
  | "Map"
  | "upload"
  | "settings"
  | "circle"
  | "list"
  | "List"
  | "list-plus"
  | "ListPlus"
  | "image"
  | "Image"
  | "chart"
  | "Chart";

const NAV_ICONS: Record<NavIconKey, LucideIcon> = {
  sliders: Sliders,
  shield: ShieldAlert,
  store: Store,
  Store: Store,
  clipboard: Clipboard,
  "clipboard-list": ClipboardList,
  plus: PlusCircle,
  folder: FolderTree,
  Folder: FolderTree,
  map: MapPin,
  Map: MapPin,
  upload: Upload,
  settings: Settings,
  circle: Circle,
  list: List,
  List: List,
  "list-plus": ListPlus,
  ListPlus: ListPlus,
  image: ImageIcon,
  Image: ImageIcon,
  chart: BarChart3,
  Chart: BarChart3,
};

export interface AdminNavSubItem {
  label: string;
  href: string;
  icon?: NavIconKey;
  badge?: number;
}

export interface AdminNavItem {
  label: string;
  href?: string;
  icon: NavIconKey;
  badge?: number;
  children?: AdminNavSubItem[];
}

interface AdminNavProps {
  items: AdminNavItem[];
  isCollapsed?: boolean;
}

export function AdminNav({ items, isCollapsed = false }: AdminNavProps) {
  const pathname = usePathname();
  const [navigatingHref, setNavigatingHref] = useState<string | null>(null);
  const [activeFlyout, setActiveFlyout] = useState<string | null>(null);

  // Clear navigating and flyout state whenever the route changes
  useEffect(() => {
    setNavigatingHref(null);
    setActiveFlyout(null);
  }, [pathname]);

  // Keep track of expanded submenu groups (defaulting to open so items are immediately visible)
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    items.forEach((item) => {
      if (item.children && item.children.length > 0) {
        initial[item.label] = true;
      }
    });
    return initial;
  });

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleLinkClick = (href: string) => {
    if (href !== pathname) {
      setNavigatingHref(href);
    }
  };

  return (
    <nav className={`p-2 space-y-1 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
      {items.map((item) => {
        const Icon = NAV_ICONS[item.icon] || Sliders;
        const hasChildren = Boolean(item.children && item.children.length > 0);
        const isOpen = openMenus[item.label] ?? true;

        if (hasChildren && item.children) {
          const hasActiveChild = item.children.some(
            (child) => pathname === child.href || pathname.startsWith(`${child.href}/`)
          );

          // Collapsed Mode: Icon Button + Floating Flyout Submenu
          if (isCollapsed) {
            const isFlyoutOpen = activeFlyout === item.label;

            return (
              <div key={item.label} className="relative flex justify-center w-full">
                <button
                  type="button"
                  title={item.label}
                  onClick={() => setActiveFlyout(isFlyoutOpen ? null : item.label)}
                  className={`group relative flex items-center justify-center h-10 w-10 text-xs font-semibold rounded-xl transition-all duration-150 ${
                    hasActiveChild || isFlyoutOpen
                      ? "bg-primary/10 text-primary font-bold shadow-xs dark:bg-primary/20 ring-1 ring-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                      hasActiveChild ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 flex items-center justify-center text-[9px] font-black rounded-full bg-amber-500 text-white shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Floating Flyout Card */}
                {isFlyoutOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setActiveFlyout(null)}
                    />
                    <div className="absolute left-full top-0 ml-3 w-48 rounded-2xl border border-border/80 bg-card p-2 shadow-2xl z-50 animate-in fade-in-50 zoom-in-95 space-y-1">
                      <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/60 mb-1 flex items-center justify-between">
                        <span>{item.label}</span>
                        <span className="text-[9px] font-mono lowercase opacity-60">menu</span>
                      </div>

                      {item.children.map((subItem) => {
                        const SubIcon = subItem.icon ? NAV_ICONS[subItem.icon] : null;
                        const isSubActive =
                          subItem.href === "/admin"
                            ? pathname === "/admin"
                            : pathname === subItem.href || pathname.startsWith(`${subItem.href}/`);
                        const isNavigating = navigatingHref === subItem.href;

                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={() => {
                              handleLinkClick(subItem.href);
                              setActiveFlyout(null);
                            }}
                            className={`flex items-center justify-between px-2.5 py-2 text-xs font-semibold rounded-xl transition-all duration-150 ${
                              isNavigating
                                ? "bg-primary/15 text-primary font-bold ring-1 ring-primary/30"
                                : isSubActive
                                ? "bg-primary/10 text-primary font-bold shadow-xs dark:bg-primary/20"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {isNavigating ? (
                                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-primary" />
                              ) : SubIcon ? (
                                <SubIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              ) : (
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              )}
                              <span className="truncate">{subItem.label}</span>
                            </div>

                            {isNavigating ? (
                              <span className="text-[10px] text-primary font-bold animate-pulse">
                                Loading...
                              </span>
                            ) : subItem.badge !== undefined && subItem.badge > 0 ? (
                              <span className="ml-2 px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                                {subItem.badge}
                              </span>
                            ) : null}
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          }

          // Expanded Mode: Accordion Submenu
          return (
            <div key={item.label} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleMenu(item.label)}
                className={`group w-full relative flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all duration-150 ${
                  hasActiveChild
                    ? "text-primary font-bold bg-primary/5 dark:bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                      hasActiveChild
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
                      {item.badge}
                    </span>
                  )}
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 text-muted-foreground ${
                      isOpen ? "rotate-180 text-foreground" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Submenu rail */}
              {isOpen && item.children && (
                <div className="ml-4 pl-3 border-l-2 border-border/60 space-y-1 pt-0.5 pb-1">
                  {item.children.map((subItem) => {
                    const SubIcon = subItem.icon ? NAV_ICONS[subItem.icon] : null;
                    const childrenList = item.children ?? [];
                    const isSubActive =
                      subItem.href === "/admin"
                        ? pathname === "/admin"
                        : pathname === subItem.href ||
                          (pathname.startsWith(`${subItem.href}/`) &&
                            !childrenList.some(
                              (other) =>
                                other.href !== subItem.href &&
                                (pathname === other.href || pathname.startsWith(`${other.href}/`))
                            ));
                    const isNavigating = navigatingHref === subItem.href;

                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        onClick={() => handleLinkClick(subItem.href)}
                        className={`group flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-lg transition-all duration-150 ${
                          isNavigating
                            ? "bg-primary/15 text-primary font-bold ring-1 ring-primary/30"
                            : isSubActive
                            ? "bg-primary/10 text-primary font-bold shadow-xs dark:bg-primary/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isNavigating ? (
                            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-primary" />
                          ) : SubIcon ? (
                            <SubIcon
                              className={`h-3.5 w-3.5 shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                                isSubActive
                                  ? "text-primary"
                                  : "text-muted-foreground group-hover:text-foreground"
                              }`}
                            />
                          ) : (
                            <span
                              className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                isSubActive ? "bg-primary" : "bg-muted-foreground/50"
                              }`}
                            />
                          )}
                          <span className="truncate">{subItem.label}</span>
                        </div>

                        {isNavigating ? (
                          <span className="text-[10px] text-primary font-bold animate-pulse">
                            Loading...
                          </span>
                        ) : subItem.badge !== undefined && subItem.badge > 0 ? (
                          <span
                            className={`ml-2 px-1.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                              isSubActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                            }`}
                          >
                            {subItem.badge}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        // Single-level item without children
        const href = item.href || "#";
        const isActive =
          href === "/admin"
            ? pathname === "/admin"
            : pathname === href || pathname.startsWith(`${href}/`);
        const isNavigating = navigatingHref === href;

        // Collapsed Mode for single-level item
        if (isCollapsed) {
          return (
            <Link
              key={href}
              href={href}
              title={item.label}
              onClick={() => handleLinkClick(href)}
              className={`group relative flex items-center justify-center h-10 w-10 text-xs font-semibold rounded-xl transition-all duration-150 ${
                isNavigating
                  ? "bg-primary/15 text-primary font-bold ring-1 ring-primary/30"
                  : isActive
                  ? "bg-primary/10 text-primary font-bold shadow-xs dark:bg-primary/20 ring-1 ring-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {isNavigating ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
              ) : (
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
              )}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 flex items-center justify-center text-[9px] font-black rounded-full bg-amber-500 text-white shadow-xs">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        }

        // Expanded Mode for single-level item
        return (
          <Link
            key={href}
            href={href}
            onClick={() => handleLinkClick(href)}
            className={`group relative flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all duration-150 ${
              isNavigating
                ? "bg-primary/15 text-primary font-bold ring-1 ring-primary/30"
                : isActive
                ? "bg-primary/10 text-primary font-bold shadow-xs dark:bg-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isNavigating ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
              ) : (
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
              )}
              <span className="truncate">{item.label}</span>
            </div>

            {/* Active Left Pill Accent */}
            {isActive && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r-full" />
            )}

            {/* Loading or Notification Badge */}
            {isNavigating ? (
              <span className="text-[10px] text-primary font-bold animate-pulse">
                Loading...
              </span>
            ) : item.badge !== undefined && item.badge > 0 ? (
              <span
                className={`ml-2 px-1.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                }`}
              >
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
