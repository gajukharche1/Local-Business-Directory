"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { assertAuthorized } from "@/lib/auth/rbac";
import { UserRole } from "@prisma/client";
import { SettingsService, type SiteSettingsData } from "@/lib/services/settings.service";
import { z } from "zod";

const settingsSchema = z.object({
  siteName: z.string().min(1, "Website name is required").max(100),
  siteBadge: z.string().min(1, "Badge initials are required").max(6),
  adminTitle: z.string().min(1, "Admin title is required").max(60),
  siteTagline: z.string().max(255).optional().default(""),
  contactEmail: z.string().email("Invalid email address").or(z.literal("")),
  contactPhone: z.string().max(30).optional().default(""),
  defaultLocality: z.string().max(100).optional().default(""),
  allowPublicSubmissions: z.boolean().default(true),
  requireReviewModeration: z.boolean().default(true),
  allowClaims: z.boolean().default(true),
  announcementActive: z.boolean().default(false),
  announcementBanner: z.string().max(300).optional().default(""),
});

export type UpdateSettingsInput = z.infer<typeof settingsSchema>;

export async function updateSettingsAction(data: UpdateSettingsInput) {
  const user = await getCurrentUser();
  assertAuthorized(user, UserRole.admin);

  const parsed = settingsSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg };
  }

  try {
    const updated = await SettingsService.updateSettings(parsed.data);

    // Revalidate paths that consume site settings
    revalidatePath("/admin");
    revalidatePath("/admin/settings");
    revalidatePath("/");
    revalidatePath("/submit");

    return { success: true, data: updated };
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : "Failed to update settings.";
    if (rawMessage.includes("does not exist in the current database") || rawMessage.includes("P2021")) {
      return {
        success: false,
        error: "The 'site_settings' table does not exist in your database yet. Run 'npx prisma db push' in your terminal to synchronize the schema.",
      };
    }
    return {
      success: false,
      error: rawMessage,
    };
  }
}
