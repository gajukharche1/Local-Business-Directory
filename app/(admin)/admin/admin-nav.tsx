"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Sliders,
  Store,
  Upload,
  PlusCircle,
  FolderTree,
  MapPin,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavIconKey =
  | "sliders"
  | "shield"
  | "store"
  | "plus"
  | "folder"
  | "map"
  | "upload"
  | "settings";

const NAV_ICONS: Record<NavIconKey, LucideIcon> = {
  sliders: Sliders,
  shield: ShieldAlert,
  store: Store,
  plus: PlusCircle,
  folder: FolderTree,
  map: MapPin,
  upload: Upload,
  settings: Settings,
};

export interface AdminNavItem {
  label: string;
  href: string;
  icon: NavIconKey;
  badge?: number;
}

interface AdminNavProps {
  items: AdminNavItem[];
}

export function AdminNav({ items }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav className="p-3 space-y-1">
      {items.map((item) => {
        const Icon = NAV_ICONS[item.icon] || Sliders;
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
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
