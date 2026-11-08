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
  | "ListPlus";

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
}

export function AdminNav({ items }: AdminNavProps) {
  const pathname = usePathname();
  const [navigatingHref, setNavigatingHref] = useState<string | null>(null);

  // Clear navigating state whenever the route changes
  useEffect(() => {
    setNavigatingHref(null);
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
    <nav className="p-3 space-y-1">
      {items.map((item) => {
        const Icon = NAV_ICONS[item.icon] || Sliders;
        const hasChildren = Boolean(item.children && item.children.length > 0);
        const isOpen = openMenus[item.label] ?? true;

        if (hasChildren && item.children) {
          const hasActiveChild = item.children.some(
            (child) => pathname === child.href || pathname.startsWith(`${child.href}/`)
          );

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
              {isOpen && (
                <div className="ml-4 pl-3 border-l-2 border-border/60 space-y-1 pt-0.5 pb-1">
                  {item.children.map((subItem) => {
                    const SubIcon = subItem.icon ? NAV_ICONS[subItem.icon] : null;
                    const isSubActive =
                      subItem.href === "/admin"
                        ? pathname === "/admin"
                        : pathname === subItem.href ||
                          (pathname.startsWith(`${subItem.href}/`) &&
                            !item.children.some(
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
