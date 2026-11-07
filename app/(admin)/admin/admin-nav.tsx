"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Sliders,
  Store,
  ClipboardList,
  Upload,
  PlusCircle,
  FolderTree,
  MapPin,
  Settings,
  ChevronDown,
  Circle,
  type LucideIcon,
} from "lucide-react";

export type NavIconKey =
  | "sliders"
  | "shield"
  | "store"
  | "clipboard-list"
  | "plus"
  | "folder"
  | "map"
  | "upload"
  | "settings"
  | "circle";

const NAV_ICONS: Record<NavIconKey, LucideIcon> = {
  sliders: Sliders,
  shield: ShieldAlert,
  store: Store,
  "clipboard-list": ClipboardList,
  plus: PlusCircle,
  folder: FolderTree,
  map: MapPin,
  upload: Upload,
  settings: Settings,
  circle: Circle,
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
                        : pathname === subItem.href || pathname.startsWith(`${subItem.href}/`);

                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`group flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-lg transition-all duration-150 ${
                          isSubActive
                            ? "bg-primary/10 text-primary font-bold shadow-xs dark:bg-primary/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {SubIcon ? (
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

                        {subItem.badge !== undefined && subItem.badge > 0 && (
                          <span
                            className={`ml-2 px-1.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                              isSubActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                            }`}
                          >
                            {subItem.badge}
                          </span>
                        )}
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

        return (
          <Link
            key={href}
            href={href}
            className={`group relative flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all duration-150 ${
              isActive
                ? "bg-primary/10 text-primary font-bold shadow-xs dark:bg-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon
                className={`h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
              <span className="truncate">{item.label}</span>
            </div>

            {/* Active Left Pill Accent */}
            {isActive && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r-full" />
            )}

            {/* Notification Badge if applicable */}
            {item.badge !== undefined && item.badge > 0 && (
              <span
                className={`ml-2 px-1.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                }`}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
