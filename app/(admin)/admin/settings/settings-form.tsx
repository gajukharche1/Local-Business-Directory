"use client";

import { useState, useTransition } from "react";
import { type SiteSettingsData } from "@/lib/services/settings.service";
import { updateSettingsAction } from "@/actions/settings";
import {
  Sliders,
  Store,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Megaphone,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  HelpCircle,
  Users,
} from "lucide-react";
import { UserManagementTab, SerializedUser } from "./user-management-tab";

interface SettingsFormProps {
  initialSettings: SiteSettingsData;
  initialUsers?: SerializedUser[];
  currentUserId?: string;
}

type TabKey = "branding" | "governance" | "contact" | "announcement" | "users";

export function SettingsForm({
  initialSettings,
  initialUsers = [],
  currentUserId,
}: SettingsFormProps) {
  const [formData, setFormData] = useState<SiteSettingsData>(initialSettings);
  const [activeTab, setActiveTab] = useState<TabKey>("branding");
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (name: keyof SiteSettingsData) => {
    setFormData((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    startTransition(async () => {
      const res = await updateSettingsAction(formData);
      if (res.success && res.data) {
        setFormData(res.data);
        setStatusMessage({
          type: "success",
          text: "Settings saved successfully! Sidebar headers, dashboard metrics, and public pages updated.",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to save settings. Please try again.",
        });
      }
    });
  };

  const handleReset = () => {
    setFormData(initialSettings);
    setStatusMessage(null);
  };

  const tabs: { key: TabKey; label: string; icon: typeof Sliders }[] = [
    { key: "branding", label: "Identity & Branding", icon: Sliders },
    { key: "governance", label: "Directory Governance", icon: Store },
    { key: "contact", label: "Regional & Contact", icon: MapPin },
    { key: "announcement", label: "Announcement Banner", icon: Megaphone },
    { key: "users", label: "User Management", icon: Users },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Status Feedback Toast */}
      {statusMessage && (
        <div
          role="alert"
          className={`rounded-2xl p-4 flex items-start gap-3 border shadow-sm transition-all duration-200 animate-in fade-in-50 ${
            statusMessage.type === "success"
              ? "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
              : "bg-red-50/90 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs">
            <p className="font-semibold">{statusMessage.text}</p>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-xs font-bold opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Dismiss alert"
          >
            ✕
          </button>
        </div>
      )}

      {/* Live Brand Preview Card */}
      <div className="rounded-2xl border border-border/70 bg-gradient-to-r from-card via-card to-primary/5 p-5 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Live Sidebar Simulation (1:1 Ratio)
          </span>
          <span className="text-[11px] font-mono text-muted-foreground">
            Real-time visual feedback
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-background border border-border/80 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-600 text-primary-foreground font-extrabold text-base shadow-sm uppercase shrink-0 ring-2 ring-primary/20">
              {formData.siteBadge || "LBD"}
            </div>
            <div className="min-w-0">
              <span className="font-bold tracking-tight text-sm text-foreground block truncate leading-tight">
                {formData.siteName || "Directory Name"}
              </span>
              <span className="text-[10px] text-primary uppercase font-bold tracking-wider block truncate mt-0.5">
                {formData.adminTitle || "Admin Console"}
              </span>
            </div>
          </div>

          <div className="text-right text-[11px] text-muted-foreground">
            <span className="font-semibold block text-foreground">
              {formData.defaultLocality || "Default Locality"}
            </span>
            <span>{formData.contactEmail || "contact@directory.com"}</span>
          </div>
        </div>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-2xl bg-muted/40 border border-border/60 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 whitespace-nowrap shrink-0 ${
                isSelected
                  ? "bg-card text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Identity & Branding */}
      {activeTab === "branding" && (
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card space-y-6 animate-in fade-in-50">
          <div className="border-b border-border/70 pb-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" />
              Identity & Admin Branding
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customize directory title, admin subtitle, and brand initials badge across the portal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="siteName"
                className="block text-xs font-bold text-foreground mb-1.5"
              >
                Website / Directory Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="siteName"
                name="siteName"
                value={formData.siteName}
                onChange={handleTextChange}
                required
                maxLength={100}
                placeholder="e.g. Pimple Saudagar Directory"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              <span className="text-[11px] text-muted-foreground mt-1.5 block">
                Displayed in the sidebar, browser titles, and user emails.
              </span>
            </div>

            <div>
              <label
                htmlFor="siteBadge"
                className="block text-xs font-bold text-foreground mb-1.5"
              >
                Logo Badge Initials (2-4 Chars) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="siteBadge"
                name="siteBadge"
                value={formData.siteBadge}
                onChange={handleTextChange}
                required
                maxLength={6}
                placeholder="e.g. PS"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-bold text-foreground uppercase placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              <span className="text-[11px] text-muted-foreground mt-1.5 block">
                Rendered inside the sidebar avatar icon and favicon representations.
              </span>
            </div>

            <div>
              <label
                htmlFor="adminTitle"
                className="block text-xs font-bold text-foreground mb-1.5"
              >
                Admin Dashboard Subtitle <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="adminTitle"
                name="adminTitle"
                value={formData.adminTitle}
                onChange={handleTextChange}
                required
                maxLength={60}
                placeholder="e.g. Admin Console"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              <span className="text-[11px] text-muted-foreground mt-1.5 block">
                Upper-case subtitle shown below brand mark in the admin sidebar.
              </span>
            </div>

            <div>
              <label
                htmlFor="siteTagline"
                className="block text-xs font-bold text-foreground mb-1.5"
              >
                Overview Header Tagline
              </label>
              <input
                type="text"
                id="siteTagline"
                name="siteTagline"
                value={formData.siteTagline}
                onChange={handleTextChange}
                maxLength={255}
                placeholder="Directory health, moderation queue status, and community activity"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              <span className="text-[11px] text-muted-foreground mt-1.5 block">
                Subheading text rendered below the title on `/admin`.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Directory Governance */}
      {activeTab === "governance" && (
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card space-y-6 animate-in fade-in-50">
          <div className="border-b border-border/70 pb-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Store className="h-4 w-4 text-emerald-600" />
              Directory Governance & Policies
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Control public submissions, moderation requirements, and business ownership claims.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/70 bg-background hover:bg-muted/20 transition">
              <div className="pr-4 space-y-0.5">
                <span className="text-xs font-bold text-foreground block">
                  Allow Public Business Submissions
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  When enabled, visitors and owners can submit new listing profiles via `/submit`.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.allowPublicSubmissions}
                onClick={() => handleToggleChange("allowPublicSubmissions")}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  formData.allowPublicSubmissions ? "bg-emerald-600" : "bg-muted"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.allowPublicSubmissions ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border/70 bg-background hover:bg-muted/20 transition">
              <div className="pr-4 space-y-0.5">
                <span className="text-xs font-bold text-foreground block">
                  Require Review Moderation Before Publishing
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  Reviews are held in pending status until approved by an administrator or moderator.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.requireReviewModeration}
                onClick={() => handleToggleChange("requireReviewModeration")}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  formData.requireReviewModeration ? "bg-emerald-600" : "bg-muted"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.requireReviewModeration ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border/70 bg-background hover:bg-muted/20 transition">
              <div className="pr-4 space-y-0.5">
                <span className="text-xs font-bold text-foreground block">
                  Allow Merchant Claim Requests
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  Business owners can claim and verify unclaimed listings with legal documentation.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.allowClaims}
                onClick={() => handleToggleChange("allowClaims")}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  formData.allowClaims ? "bg-emerald-600" : "bg-muted"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.allowClaims ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Regional & Contacts */}
      {activeTab === "contact" && (
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card space-y-6 animate-in fade-in-50">
          <div className="border-b border-border/70 pb-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              Regional Scope & Contact Channels
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Default geography scope and direct administrator support channels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label
                htmlFor="defaultLocality"
                className="block text-xs font-bold text-foreground mb-1.5"
              >
                Default Locality / City
              </label>
              <div className="relative">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  id="defaultLocality"
                  name="defaultLocality"
                  value={formData.defaultLocality}
                  onChange={handleTextChange}
                  maxLength={100}
                  placeholder="Pimple Saudagar, PCMC, Pune"
                  className="w-full rounded-xl border border-border bg-background pl-9 pr-3.5 py-2.5 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>
              <span className="text-[11px] text-muted-foreground mt-1.5 block">
                Primary locality used in directory search placeholders and hero headers.
              </span>
            </div>

            <div>
              <label
                htmlFor="contactEmail"
                className="block text-xs font-bold text-foreground mb-1.5"
              >
                Support Contact Email
              </label>
              <div className="relative">
                <Mail className="h-3.5 w-3.5 text-muted-foreground absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleTextChange}
                  placeholder="support@pimplesaudagar.com"
                  className="w-full rounded-xl border border-border bg-background pl-9 pr-3.5 py-2.5 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>
              <span className="text-[11px] text-muted-foreground mt-1.5 block">
                Shown to users on closed submission notices and footer inquiries.
              </span>
            </div>

            <div>
              <label
                htmlFor="contactPhone"
                className="block text-xs font-bold text-foreground mb-1.5"
              >
                Support Phone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="h-3.5 w-3.5 text-muted-foreground absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleTextChange}
                  maxLength={30}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-border bg-background pl-9 pr-3.5 py-2.5 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>
              <span className="text-[11px] text-muted-foreground mt-1.5 block">
                Customer helpline for merchant onboardings and urgent assistance.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Announcement Banner */}
      {activeTab === "announcement" && (
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card space-y-6 animate-in fade-in-50">
          <div className="border-b border-border/70 pb-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-amber-600" />
              Global Announcement Banner
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Display a site-wide broadcast message across the homepage and admin overview.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/70 bg-background hover:bg-muted/20 transition">
              <div className="pr-4 space-y-0.5">
                <span className="text-xs font-bold text-foreground block">
                  Activate Announcement Banner
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  When enabled, this notice is rendered prominently at the top of the portal.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.announcementActive}
                onClick={() => handleToggleChange("announcementActive")}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  formData.announcementActive ? "bg-amber-600" : "bg-muted"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.announcementActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div>
              <label
                htmlFor="announcementBanner"
                className="block text-xs font-bold text-foreground mb-1.5"
              >
                Announcement Message
              </label>
              <textarea
                id="announcementBanner"
                name="announcementBanner"
                rows={3}
                value={formData.announcementBanner}
                onChange={handleTextChange}
                maxLength={300}
                placeholder="e.g. Scheduled platform maintenance tonight from 2:00 AM to 4:00 AM IST. All directory listings remain active."
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              <span className="text-[11px] text-muted-foreground mt-1.5 block">
                Up to 300 characters. Keep it brief and informative.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: User Management */}
      {activeTab === "users" && (
        <UserManagementTab
          initialUsers={initialUsers}
          currentUserId={currentUserId}
        />
      )}

      {/* Sticky Bottom Actions Bar (for Site Settings Tabs) */}
      {activeTab !== "users" && (
        <div className="flex items-center justify-between p-4 rounded-2xl border border-border/70 bg-card shadow-card">
          <button
            type="button"
            onClick={handleReset}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Current</span>
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90 transition-all duration-150 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isPending ? "Saving Changes..." : "Save Settings"}</span>
          </button>
        </div>
      )}
    </form>
  );
}
