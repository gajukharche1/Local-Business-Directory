import db from "@/lib/db/client";

export interface SiteSettingsData {
  siteName: string;
  siteBadge: string;
  adminTitle: string;
  siteTagline: string;
  contactEmail: string;
  contactPhone: string;
  defaultLocality: string;
  allowPublicSubmissions: boolean;
  requireReviewModeration: boolean;
  allowClaims: boolean;
  announcementActive: boolean;
  announcementBanner: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  siteName: "Pimple Saudagar",
  siteBadge: "PS",
  adminTitle: "Admin Console",
  siteTagline: "Directory health, moderation queue status, and community activity",
  contactEmail: "support@pimplesaudagar.com",
  contactPhone: "+91 98765 43210",
  defaultLocality: "Pimple Saudagar, PCMC, Pune",
  allowPublicSubmissions: true,
  requireReviewModeration: true,
  allowClaims: true,
  announcementActive: false,
  announcementBanner: "",
};

const KEY_GROUP_MAP: Record<keyof SiteSettingsData, string> = {
  siteName: "general",
  siteBadge: "general",
  adminTitle: "general",
  siteTagline: "general",
  contactEmail: "contact",
  contactPhone: "contact",
  defaultLocality: "contact",
  allowPublicSubmissions: "governance",
  requireReviewModeration: "governance",
  allowClaims: "governance",
  announcementActive: "announcement",
  announcementBanner: "announcement",
};

export class SettingsService {
  /**
   * Retrieves all site settings with safe defaults fallback.
   */
  static async getAll(): Promise<SiteSettingsData> {
    try {
      const records = await db.siteSetting.findMany().catch(() => []);
      if (!records || records.length === 0) {
        return { ...DEFAULT_SITE_SETTINGS };
      }

      const map = new Map<string, string>();
      for (const item of records) {
        map.set(item.key, item.value);
      }

      return {
        siteName: map.get("siteName") ?? DEFAULT_SITE_SETTINGS.siteName,
        siteBadge: map.get("siteBadge") ?? DEFAULT_SITE_SETTINGS.siteBadge,
        adminTitle: map.get("adminTitle") ?? DEFAULT_SITE_SETTINGS.adminTitle,
        siteTagline: map.get("siteTagline") ?? DEFAULT_SITE_SETTINGS.siteTagline,
        contactEmail: map.get("contactEmail") ?? DEFAULT_SITE_SETTINGS.contactEmail,
        contactPhone: map.get("contactPhone") ?? DEFAULT_SITE_SETTINGS.contactPhone,
        defaultLocality: map.get("defaultLocality") ?? DEFAULT_SITE_SETTINGS.defaultLocality,
        allowPublicSubmissions: map.has("allowPublicSubmissions")
          ? map.get("allowPublicSubmissions") === "true"
          : DEFAULT_SITE_SETTINGS.allowPublicSubmissions,
        requireReviewModeration: map.has("requireReviewModeration")
          ? map.get("requireReviewModeration") === "true"
          : DEFAULT_SITE_SETTINGS.requireReviewModeration,
        allowClaims: map.has("allowClaims")
          ? map.get("allowClaims") === "true"
          : DEFAULT_SITE_SETTINGS.allowClaims,
        announcementActive: map.has("announcementActive")
          ? map.get("announcementActive") === "true"
          : DEFAULT_SITE_SETTINGS.announcementActive,
        announcementBanner: map.get("announcementBanner") ?? DEFAULT_SITE_SETTINGS.announcementBanner,
      };
    } catch {
      return { ...DEFAULT_SITE_SETTINGS };
    }
  }

  /**
   * Updates settings in batch.
   */
  static async updateSettings(data: Partial<SiteSettingsData>): Promise<SiteSettingsData> {
    const entries = Object.entries(data) as [keyof SiteSettingsData, unknown][];

    for (const [key, rawValue] of entries) {
      if (rawValue === undefined) continue;
      const group = KEY_GROUP_MAP[key] || "general";
      const value = typeof rawValue === "boolean" ? (rawValue ? "true" : "false") : String(rawValue ?? "").trim();

      await db.siteSetting.upsert({
        where: { key },
        update: { value, group },
        create: { key, value, group },
      });
    }

    return this.getAll();
  }
}

