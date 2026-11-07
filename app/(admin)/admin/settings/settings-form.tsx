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
} from "lucide-react";

interface SettingsFormProps {
  initialSettings: SiteSettingsData;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [formData, setFormData] = useState<SiteSettingsData>(initialSettings);
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
          text: "Dashboard and website settings saved successfully! Navigation headers and overview updated.",
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Status Feedback */}
      {statusMessage && (
        <div
          role="alert"
          className={`rounded-xl p-4 flex items-start gap-3 border shadow-xs transition-all ${
            statusMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
              : "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200"
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
            className="text-xs opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Live Brand Preview Card */}
      <div className="rounded-xl border bg-gradient-to-r from-card via-card to-muted/30 p-5 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Live Admin Sidebar Header Preview
          </span>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-background border max-w-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white font-extrabold text-sm shadow-xs shrink-0 uppercase">
            {formData.siteBadge || "PS"}
          </div>
          <div className="min-w-0">
            <span className="font-bold tracking-tight text-sm text-foreground block truncate">
              {formData.siteName || "Website Name"}
            </span>
            <span className="text-[10px] text-red-600 uppercase font-bold tracking-wider block truncate">
              {formData.adminTitle || "Admin Console"}
            </span>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          Preview updates in real time. Saving changes will immediately update the sidebar and system overview.
        </p>
      </div>

      {/* Section 1: Identity & Branding */}
      <div className="rounded-xl border bg-card p-6 shadow-card space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sliders className="h-4 w-4 text-primary" />
            Identity & Admin Branding
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure the name of the website, logo badge initials, and dashboard labels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="siteName"
              className="block text-xs font-semibold text-foreground mb-1.5"
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
              className="w-full rounded-lg border bg-background px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
            <span className="text-[11px] text-muted-foreground mt-1 block">
              Displayed on admin sidebar, page titles, and system communications.
            </span>
          </div>

          <div>
            <label
              htmlFor="siteBadge"
              className="block text-xs font-semibold text-foreground mb-1.5"
            >
              Logo Badge Initials <span className="text-red-500">*</span>
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
              className="w-full rounded-lg border bg-background px-3 py-2 text-xs font-medium text-foreground uppercase placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
            <span className="text-[11px] text-muted-foreground mt-1 block">
              2-4 letter abbreviation for admin avatar badge and small screen icons.
            </span>
          </div>

          <div>
            <label
              htmlFor="adminTitle"
              className="block text-xs font-semibold text-foreground mb-1.5"
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
              className="w-full rounded-lg border bg-background px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
            <span className="text-[11px] text-muted-foreground mt-1 block">
              Header subtitle in sidebar navigation (e.g., Admin Console, Operations Hub).
            </span>
          </div>

          <div>
            <label
              htmlFor="siteTagline"
              className="block text-xs font-semibold text-foreground mb-1.5"
            >
              Dashboard Header Tagline
            </label>
            <input
              type="text"
              id="siteTagline"
              name="siteTagline"
              value={formData.siteTagline}
              onChange={handleTextChange}
              maxLength={255}
              placeholder="Directory health, moderation queue status, and community activity"
              className="w-full rounded-lg border bg-background px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
            <span className="text-[11px] text-muted-foreground mt-1 block">
              Subheading shown on the main overview dashboard.
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: Directory Governance & Operational Toggles */}
      <div className="rounded-xl border bg-card p-6 shadow-card space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Store className="h-4 w-4 text-emerald-600" />
            Directory Governance & Submissions
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Control business submissions, moderation policies, and merchant claim requests.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-lg border bg-background hover:bg-muted/30 transition">
            <div className="pr-4">
              <span className="text-xs font-bold text-foreground block">
                Allow Public Business Submissions
              </span>
              <span className="text-[11px] text-muted-foreground">
                When enabled, visitors and merchant owners can submit new listings via the /submit portal.
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

          <div className="flex items-center justify-between p-3.5 rounded-lg border bg-background hover:bg-muted/30 transition">
            <div className="pr-4">
              <span className="text-xs font-bold text-foreground block">
                Require Review Moderation Before Publishing
              </span>
              <span className="text-[11px] text-muted-foreground">
                When enabled, customer reviews remain in Pending status until approved by an admin or moderator.
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

          <div className="flex items-center justify-between p-3.5 rounded-lg border bg-background hover:bg-muted/30 transition">
            <div className="pr-4">
              <span className="text-xs font-bold text-foreground block">
                Allow Merchant Claim Requests
              </span>
              <span className="text-[11px] text-muted-foreground">
                When enabled, business owners can submit ownership claims on unclaimed directory listings.
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

      {/* Section 3: Regional & Support Info */}
      <div className="rounded-xl border bg-card p-6 shadow-card space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            Regional & Contact Information
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Default locality scope and administrator support communication channels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label
              htmlFor="defaultLocality"
              className="block text-xs font-semibold text-foreground mb-1.5"
            >
              Default Locality / City
            </label>
            <div className="relative">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                id="defaultLocality"
                name="defaultLocality"
                value={formData.defaultLocality}
                onChange={handleTextChange}
                maxLength={100}
                placeholder="Pimple Saudagar, PCMC, Pune"
                className="w-full rounded-lg border bg-background pl-8 pr-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>
            <span className="text-[11px] text-muted-foreground mt-1 block">
              Default geographic location for directory filtering.
            </span>
          </div>

          <div>
            <label
              htmlFor="contactEmail"
              className="block text-xs font-semibold text-foreground mb-1.5"
            >
              Support Contact Email
            </label>
            <div className="relative">
              <Mail className="h-3.5 w-3.5 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleTextChange}
                placeholder="support@pimplesaudagar.com"
                className="w-full rounded-lg border bg-background pl-8 pr-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>
            <span className="text-[11px] text-muted-foreground mt-1 block">
              Received in inquiry forms and notification footers.
            </span>
          </div>

          <div>
            <label
              htmlFor="contactPhone"
              className="block text-xs font-semibold text-foreground mb-1.5"
            >
              Support Phone / Helpline
            </label>
            <div className="relative">
              <Phone className="h-3.5 w-3.5 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleTextChange}
                maxLength={30}
                placeholder="+91 98765 43210"
                className="w-full rounded-lg border bg-background pl-8 pr-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>
            <span className="text-[11px] text-muted-foreground mt-1 block">
              Customer support / WhatsApp assistance number.
            </span>
          </div>
        </div>
      </div>

      {/* Section 4: Site Notice & Announcement Banner */}
      <div className="rounded-xl border bg-card p-6 shadow-card space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-amber-600" />
            Announcement Banner & Notices
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Display a global broadcast or maintenance alert across the top of the portal.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-lg border bg-background hover:bg-muted/30 transition">
            <div className="pr-4">
              <span className="text-xs font-bold text-foreground block">
                Enable Announcement Banner
              </span>
              <span className="text-[11px] text-muted-foreground">
                Toggle visibility of the notice bar for visitors and merchants.
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
              className="block text-xs font-semibold text-foreground mb-1.5"
            >
              Announcement Message
            </label>
            <textarea
              id="announcementBanner"
              name="announcementBanner"
              rows={2}
              value={formData.announcementBanner}
              onChange={handleTextChange}
              maxLength={300}
              placeholder="e.g. Scheduled maintenance this Sunday from 2 AM to 4 AM IST."
              className="w-full rounded-lg border bg-background px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={handleReset}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition disabled:opacity-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Changes</span>
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 transition disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{isPending ? "Saving Settings..." : "Save Settings"}</span>
        </button>
      </div>
    </form>
  );
}

