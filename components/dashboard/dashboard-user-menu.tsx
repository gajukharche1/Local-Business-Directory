"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import {
  ShieldAlert,
  ShieldCheck,
  Store,
  FolderTree,
  MapPin,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Users,
  CheckCircle2,
  Key,
} from "lucide-react";

interface DashboardUserMenuProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export function DashboardUserMenu({ user }: DashboardUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "US";

  const isAdmin = user.role === "admin";
  const isModerator = user.role === "moderator";
  const hasElevatedAccess = isAdmin || isModerator;

  // Privileges definition based on role
  const privileges = isAdmin
    ? [
        { title: "Full System Governance", desc: "Global directory configuration & site settings" },
        { title: "User Management & Passwords", desc: "Create, invite, and assign user credentials" },
        { title: "Taxonomy & Geo Engine", desc: "Manage categories, localities & URL slugs" },
        { title: "Direct Publishing & Moderation", desc: "Override and publish listings instantly" },
        { title: "Bulk Ingestion & CSV Migrations", desc: "Seed thousands of listings and hours" },
      ]
    : isModerator
    ? [
        { title: "Moderation Queue Access", desc: "Approve or reject customer reviews & edits" },
        { title: "Merchant Claim Verification", desc: "Review ownership documents & approvals" },
        { title: "Listing Status Reviews", desc: "Audit newly submitted businesses" },
      ]
    : [
        { title: "Storefront Management", desc: "Create, edit, and maintain your businesses" },
        { title: "Lead Inquiries & Customer Quotes", desc: "Respond to customer inquiries" },
        { title: "Customer Review Responses", desc: "Reply to ratings left by visitors" },
      ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Capsule */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-border/70 bg-card hover:bg-muted/50 hover:border-border transition shadow-2xs group focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-expanded={isOpen}
      >
        <div className="relative">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-600 text-primary-foreground font-bold text-xs flex items-center justify-center uppercase shadow-2xs">
            {initials}
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card ${
              isAdmin ? "bg-red-500" : isModerator ? "bg-amber-500" : "bg-emerald-500"
            }`}
          />
        </div>

        <div className="text-left hidden sm:block">
          <span className="block text-xs font-bold text-foreground leading-tight truncate max-w-[120px]">
            {user.name}
          </span>
          <span className="block text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
            {user.role}
          </span>
        </div>

        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-hover:text-foreground ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border/80 bg-card p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header Identity Card */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/60">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm flex items-center justify-center uppercase shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-xs text-foreground truncate">{user.name}</h4>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                    isAdmin
                      ? "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20"
                      : isModerator
                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">{user.email}</p>
            </div>
          </div>

          {/* User Privileges Overview */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
              <Key className="h-3.5 w-3.5 text-primary" />
              <span>Assigned System Privileges</span>
            </div>

            <div className="space-y-1 rounded-xl border border-border/60 bg-background/50 p-2.5 max-h-40 overflow-y-auto">
              {privileges.map((priv, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs py-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground block text-[11px] leading-tight">
                      {priv.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground block leading-tight">
                      {priv.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Admin Access (if elevated) */}
          {hasElevatedAccess && (
            <div className="mt-3 pt-3 border-t border-border/70 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Administrative Tools &amp; Console
              </span>

              <div className="grid grid-cols-2 gap-1.5">
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition border border-transparent hover:border-border"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">Admin Console</span>
                </Link>

                <Link
                  href="/admin/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition border border-transparent hover:border-border"
                >
                  <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">User Management</span>
                </Link>

                <Link
                  href="/admin/categories"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition border border-transparent hover:border-border"
                >
                  <FolderTree className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Categories</span>
                </Link>

                <Link
                  href="/admin/locations"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition border border-transparent hover:border-border"
                >
                  <MapPin className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                  <span className="truncate">Locations</span>
                </Link>
              </div>
            </div>
          )}

          {/* Footer Actions & Log Out */}
          <div className="mt-3 pt-3 border-t border-border/70 flex items-center justify-between gap-2">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Public Directory</span>
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-destructive hover:bg-destructive/10 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log Out</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

