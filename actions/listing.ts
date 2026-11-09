"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import db from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/session";
import { assertAuthorized } from "@/lib/auth/rbac";
import { sanitizeRichText, stripHtml } from "@/lib/security/sanitize";
import { hashPassword } from "@/lib/auth/password";
import { ListingStatus, ClaimStatus, UserRole, Prisma } from "@prisma/client";
import { parseOpeningHoursInput } from "@/lib/utils/opening-hours-parser";

const baseListingSchema = z.object({
  title: z.string().min(1, "Business title cannot be blank.").default("Untitled Business"),
  description: z.string().default("<p>Local business in Pimple Saudagar.</p>"),
  categoryId: z.string().optional().default(""),
  locationId: z.string().optional().default(""),
  address: z.string().optional().default("Pimple Saudagar, Pune"),
  locality: z.string().optional().default("Pimple Saudagar"),
  landmark: z.string().optional().or(z.literal("")),
  latitude: z.coerce.number().min(-90, "Latitude must be between -90 and 90.").max(90, "Latitude must be between -90 and 90.").optional(),
  longitude: z.coerce.number().min(-180, "Longitude must be between -180 and 180.").max(180, "Longitude must be between -180 and 180.").optional(),
  phone: z.string().regex(/^(\+?[0-9\s\-()]{7,20})?$/, "Please enter a valid phone number (e.g. +91 98765 43210)").optional().or(z.literal("")),
  whatsapp: z.string().regex(/^(\+?[0-9\s\-()]{7,20})?$/, "Please enter a valid WhatsApp number (e.g. +91 98765 43210)").optional().or(z.literal("")),
  email: z.string().email("Please enter a valid email address (e.g. contact@business.com)").optional().or(z.literal("")),
  website: z.string().url("Please enter a valid website URL (e.g. https://example.com)").optional().or(z.literal("")),
  yearEstablished: z.coerce.number().min(1900, "Year established must be 1900 or later.").max(new Date().getFullYear(), "Year cannot be in the future.").optional(),
  priceRange: z.coerce.number().min(1).max(4).default(1),
  planId: z.string().optional().or(z.literal("")),
  amenities: z.array(z.string()).optional().default([]),
  seoTitle: z.string().max(120, "SEO title must be 120 characters or less.").optional().or(z.literal("")),
  seoDescription: z.string().max(320, "SEO description must be 320 characters or less.").optional().or(z.literal("")),
  seoKeywords: z.string().max(250, "SEO keywords must be 250 characters or less.").optional().or(z.literal("")),
  ogImage: z.string().optional().or(z.literal("")),
  customSections: z.any().optional(),
});

function parseListingFormData(formData: FormData) {
  const rawTitle = (formData.get("title") as string)?.trim();
  const rawDesc = (formData.get("description") as string)?.trim();
  const rawCat = (formData.get("categoryId") as string)?.trim();
  const rawLoc = (formData.get("locationId") as string)?.trim();
  const rawAddr = (formData.get("address") as string)?.trim();
  const rawLocality = (formData.get("locality") as string)?.trim();
  const rawLandmark = (formData.get("landmark") as string)?.trim();
  const rawLat = (formData.get("latitude") as string)?.trim();
  const rawLng = (formData.get("longitude") as string)?.trim();
  const rawPhone = (formData.get("phone") as string)?.trim();
  const rawWhatsapp = (formData.get("whatsapp") as string)?.trim();
  const rawEmail = (formData.get("email") as string)?.trim();
  let rawWebsite = (formData.get("website") as string)?.trim() || "";
  if (rawWebsite && !rawWebsite.startsWith("http://") && !rawWebsite.startsWith("https://")) {
    rawWebsite = "https://" + rawWebsite;
  }
  const rawYear = (formData.get("yearEstablished") as string)?.trim();
  const rawPriceRange = (formData.get("priceRange") as string)?.trim();
  const rawPlanId = (formData.get("planId") as string)?.trim();
  const rawSeoTitle = (formData.get("seoTitle") as string)?.trim();
  const rawSeoDesc = (formData.get("seoDescription") as string)?.trim();
  const rawSeoKeywords = (formData.get("seoKeywords") as string)?.trim();
  const rawOgImage = (formData.get("ogImage") as string)?.trim();
  const rawAmenities = formData.getAll("amenities") as string[];
  const rawCustomSections = (formData.get("customSections") as string)?.trim();
  let resolvedCustomSections: Prisma.InputJsonValue | undefined = undefined;
  if (rawCustomSections) {
    try {
      resolvedCustomSections = JSON.parse(rawCustomSections);
    } catch {}
  }

  return {
    title: rawTitle || undefined,
    description: rawDesc || undefined,
    categoryId: rawCat || undefined,
    locationId: rawLoc || undefined,
    address: rawAddr || undefined,
    locality: rawLocality || undefined,
    landmark: rawLandmark || undefined,
    latitude: rawLat ? Number(rawLat) : undefined,
    longitude: rawLng ? Number(rawLng) : undefined,
    phone: rawPhone || undefined,
    whatsapp: rawWhatsapp || undefined,
    email: rawEmail || undefined,
    website: rawWebsite || undefined,
    yearEstablished: rawYear ? Number(rawYear) : undefined,
    priceRange: rawPriceRange ? Number(rawPriceRange) : undefined,
    planId: rawPlanId || undefined,
    amenities: rawAmenities,
    seoTitle: rawSeoTitle || undefined,
    seoDescription: rawSeoDesc || undefined,
    seoKeywords: rawSeoKeywords || undefined,
    ogImage: rawOgImage || undefined,
    customSections: resolvedCustomSections,
  };
}

export type ActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  listingId?: string;
  slug?: string;
};

function generateSlug(title: string): string {
  const base = stripHtml(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base || "business"}-${suffix}`;
}

const defaultOpeningHours = {
  monday: { open: "09:00", close: "21:00", closed: false },
  tuesday: { open: "09:00", close: "21:00", closed: false },
  wednesday: { open: "09:00", close: "21:00", closed: false },
  thursday: { open: "09:00", close: "21:00", closed: false },
  friday: { open: "09:00", close: "21:00", closed: false },
  saturday: { open: "09:00", close: "21:00", closed: false },
  sunday: { open: "10:00", close: "20:00", closed: false },
};

/**
 * Admin action to create a business listing with full operational controls
 */
export async function createListingAdminAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser();
  try {
    assertAuthorized(user, UserRole.moderator);
  } catch (err) {
    return { error: "Unauthorized: Administrator privileges required." };
  }

  const rawData = parseListingFormData(formData);
  const validation = baseListingSchema.safeParse(rawData);
  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    const invalidList = Object.keys(fieldErrors);
    return {
      error: `Please check the form for invalid fields (${invalidList.join(", ")}).`,
      fieldErrors,
    };
  }

  const data = validation.data;
  const status = (formData.get("status") as ListingStatus) || ListingStatus.published;
  const claimStatus = (formData.get("claimStatus") as ClaimStatus) || ClaimStatus.verified;
  const featured = formData.get("featured") === "true" || formData.get("featured") === "on";
  const priority = Number(formData.get("priority") || 0);
  const ownerId = (formData.get("ownerId") as string) || user.id;
  const rawOpeningHours = formData.get("openingHours") as string;
  const resolvedOpeningHours = rawOpeningHours
    ? parseOpeningHoursInput(rawOpeningHours)
    : defaultOpeningHours;

  try {
    // Resolve location to get locality fallback if needed
    const locationRecord = await db.location.findUnique({
      where: { id: data.locationId },
    });

    const localityName = data.locality || locationRecord?.name || "Pimple Saudagar";

    let planId = data.planId;
    if (!planId) {
      const freePlan = await db.pricingPlan.findFirst({ where: { slug: "free" } });
      planId = freePlan?.id;
    }

    const slug = generateSlug(data.title);

    const listing = await db.listing.create({
      data: {
        title: stripHtml(data.title),
        slug,
        description: sanitizeRichText(data.description),
        status,
        claimStatus,
        featured,
        priority,
        planId: planId || null,
        ownerId: ownerId || null,
        publishedAt: status === ListingStatus.published ? new Date() : null,
        phone: data.phone?.trim() || null,
        whatsapp: data.whatsapp?.trim() || null,
        email: data.email?.trim() || null,
        website: data.website?.trim() || null,
        address: stripHtml(data.address),
        locality: stripHtml(localityName),
        landmark: data.landmark ? stripHtml(data.landmark) : null,
        latitude: data.latitude !== undefined && !isNaN(data.latitude) ? new Prisma.Decimal(data.latitude) : null,
        longitude: data.longitude !== undefined && !isNaN(data.longitude) ? new Prisma.Decimal(data.longitude) : null,
        seoTitle: data.seoTitle?.trim() || null,
        seoDescription: data.seoDescription?.trim() || null,
        seoKeywords: data.seoKeywords?.trim() || null,
        ogImage: data.ogImage?.trim() || null,
        yearEstablished: data.yearEstablished || null,
        priceRange: data.priceRange || 1,
        openingHours: (resolvedOpeningHours as unknown as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        customSections: (data.customSections as unknown as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        amenities: data.amenities || [],
        categories: {
          create: [{ categoryId: data.categoryId }],
        },
        locations: {
          create: [{ locationId: data.locationId, isPrimary: true }],
        },
      },
    });

    // Update listing counts on category and location
    await Promise.all([
      db.category.update({
        where: { id: data.categoryId },
        data: { listingCount: { increment: 1 } },
      }).catch(() => {}),
      db.location.update({
        where: { id: data.locationId },
        data: { listingCount: { increment: 1 } },
      }).catch(() => {}),
    ]);

    // Handle uploaded/attached images
    const imageUrls = (formData.getAll("imageUrls") as string[]).filter(Boolean);
    if (imageUrls.length > 0) {
      await db.media.createMany({
        data: imageUrls.map((url, idx) => ({
          listingId: listing.id,
          ownerId: listing.ownerId || null,
          key: `listings/${listing.id}/${idx}-${Date.now()}`,
          url,
          mimeType: "image/jpeg",
          bytes: 1000,
          scanStatus: "clean",
          altText: `${listing.title} photo ${idx + 1}`,
        })),
      });
    }

    revalidatePath("/admin/listings");
    revalidatePath("/admin");
    revalidatePath("/search");
    revalidatePath("/");

    return {
      success: true,
      listingId: listing.id,
      slug: listing.slug,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to create listing.",
    };
  }
}

/**
 * Public action to submit a business listing from /submit
 */
export async function submitListingPublicAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const currentUser = await getCurrentUser();

  const rawData = parseListingFormData(formData);
  const validation = baseListingSchema.safeParse(rawData);
  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    const invalidList = Object.keys(fieldErrors);
    return {
      error: `Please check the form for invalid fields (${invalidList.join(", ")}).`,
      fieldErrors,
    };
  }

  const data = validation.data;

  // Resolve user account
  let ownerId = currentUser?.id;

  if (!ownerId) {
    // If not logged in, require contact email and name from form
    const ownerName = (formData.get("ownerName") as string)?.trim();
    const ownerEmail = (formData.get("ownerEmail") as string)?.trim().toLowerCase();
    const ownerPhone = (formData.get("ownerPhone") as string)?.trim();
    const ownerPassword = formData.get("ownerPassword") as string;

    if (!ownerEmail || !ownerName) {
      return {
        error: "Contact name and email address are required to submit your listing.",
      };
    }

    // Check if user already exists
    let existingUser = await db.user.findUnique({
      where: { email: ownerEmail },
    });

    if (existingUser) {
      ownerId = existingUser.id;
    } else {
      // Create new owner account
      const password = ownerPassword || "PimpleSaudagar@" + Math.floor(1000 + Math.random() * 9000);
      const passwordHash = await hashPassword(password);

      const newUser = await db.user.create({
        data: {
          name: ownerName,
          email: ownerEmail,
          phone: ownerPhone || data.phone || null,
          passwordHash,
          role: UserRole.owner,
          emailVerifiedAt: new Date(),
        },
      });
      ownerId = newUser.id;
    }
  }

  try {
    const locationRecord = await db.location.findUnique({
      where: { id: data.locationId },
    });
    const localityName = data.locality || locationRecord?.name || "Pimple Saudagar";

    let planId = data.planId;
    if (!planId) {
      const freePlan = await db.pricingPlan.findFirst({ where: { slug: "free" } });
      planId = freePlan?.id;
    }

    const slug = generateSlug(data.title);

    const isModeratorOrAdmin =
      currentUser?.role === UserRole.admin || currentUser?.role === UserRole.moderator;

    const status = isModeratorOrAdmin ? ListingStatus.published : ListingStatus.pending_review;

    const rawOpeningHours = formData.get("openingHours") as string;
    const resolvedOpeningHours = rawOpeningHours
      ? parseOpeningHoursInput(rawOpeningHours)
      : defaultOpeningHours;

    const listing = await db.listing.create({
      data: {
        title: stripHtml(data.title),
        slug,
        description: sanitizeRichText(data.description),
        status,
        claimStatus: ClaimStatus.claimed,
        planId: planId || null,
        ownerId: ownerId || null,
        publishedAt: status === ListingStatus.published ? new Date() : null,
        phone: data.phone?.trim() || null,
        whatsapp: data.whatsapp?.trim() || null,
        email: data.email?.trim() || null,
        website: data.website?.trim() || null,
        address: stripHtml(data.address),
        locality: stripHtml(localityName),
        landmark: data.landmark ? stripHtml(data.landmark) : null,
        latitude: data.latitude !== undefined && !isNaN(data.latitude) ? new Prisma.Decimal(data.latitude) : null,
        longitude: data.longitude !== undefined && !isNaN(data.longitude) ? new Prisma.Decimal(data.longitude) : null,
        seoTitle: data.seoTitle?.trim() || null,
        seoDescription: data.seoDescription?.trim() || null,
        seoKeywords: data.seoKeywords?.trim() || null,
        ogImage: data.ogImage?.trim() || null,
        yearEstablished: data.yearEstablished || null,
        priceRange: data.priceRange || 1,
        openingHours: (resolvedOpeningHours as unknown as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        customSections: (data.customSections as unknown as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        amenities: data.amenities || [],
        categories: {
          create: [{ categoryId: data.categoryId }],
        },
        locations: {
          create: [{ locationId: data.locationId, isPrimary: true }],
        },
      },
    });

    await Promise.all([
      db.category.update({
        where: { id: data.categoryId },
        data: { listingCount: { increment: 1 } },
      }).catch(() => {}),
      db.location.update({
        where: { id: data.locationId },
        data: { listingCount: { increment: 1 } },
      }).catch(() => {}),
    ]);

    // Handle uploaded/attached images
    const imageUrls = (formData.getAll("imageUrls") as string[]).filter(Boolean);
    if (imageUrls.length > 0) {
      await db.media.createMany({
        data: imageUrls.map((url, idx) => ({
          listingId: listing.id,
          ownerId: listing.ownerId || null,
          key: `listings/${listing.id}/${idx}-${Date.now()}`,
          url,
          mimeType: "image/jpeg",
          bytes: 1000,
          scanStatus: "clean",
          altText: `${listing.title} photo ${idx + 1}`,
        })),
      });
    }

    revalidatePath("/admin/listings");
    revalidatePath("/admin/moderation");
    revalidatePath("/admin");
    revalidatePath("/search");
    revalidatePath("/dashboard/listings");
    revalidatePath("/");

    return {
      success: true,
      listingId: listing.id,
      slug: listing.slug,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to submit business listing.",
    };
  }
}

/**
 * Admin action to update an existing business listing with full controls
 */
export async function updateListingAdminAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser();
  try {
    assertAuthorized(user, UserRole.moderator);
  } catch (err) {
    return { error: "Unauthorized: Administrator privileges required." };
  }

  const listingId = formData.get("listingId") as string;
  if (!listingId) {
    return { error: "Listing ID is required." };
  }

  const existing = await db.listing.findUnique({
    where: { id: listingId },
    include: { categories: true, locations: true },
  });

  if (!existing) {
    return { error: "Listing not found." };
  }

  const rawData = parseListingFormData(formData);
  const validation = baseListingSchema.safeParse(rawData);
  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    const invalidList = Object.keys(fieldErrors);
    return {
      error: `Please check the form for invalid fields (${invalidList.join(", ")}).`,
      fieldErrors,
    };
  }

  const data = validation.data;
  const status = (formData.get("status") as ListingStatus) || existing.status;
  const claimStatus = (formData.get("claimStatus") as ClaimStatus) || existing.claimStatus;
  const featured = formData.get("featured") === "true" || formData.get("featured") === "on";
  const priority = Number(formData.get("priority") || 0);
  const rawOpeningHours = formData.get("openingHours") as string;
  const updatedOpeningHours = rawOpeningHours ? parseOpeningHoursInput(rawOpeningHours) : undefined;

  // Check custom slug
  let targetSlug = existing.slug;
  const customSlug = (formData.get("slug") as string)?.trim();
  if (customSlug && customSlug !== existing.slug) {
    const sanitizedSlug = customSlug
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const slugConflict = await db.listing.findFirst({
      where: { slug: sanitizedSlug, id: { not: listingId } },
    });
    if (slugConflict) {
      return { error: `The URL slug "${sanitizedSlug}" is already in use by another listing.` };
    }
    targetSlug = sanitizedSlug;
  }

  try {
    const locationRecord = await db.location.findUnique({
      where: { id: data.locationId },
    });
    const localityName = data.locality || locationRecord?.name || existing.locality;

    // Update listing core fields
    const updated = await db.listing.update({
      where: { id: listingId },
      data: {
        title: stripHtml(data.title),
        slug: targetSlug,
        description: sanitizeRichText(data.description),
        status,
        claimStatus,
        featured,
        priority,
        planId: data.planId || existing.planId,
        publishedAt: status === ListingStatus.published && !existing.publishedAt ? new Date() : existing.publishedAt,
        phone: data.phone?.trim() || null,
        whatsapp: data.whatsapp?.trim() || null,
        email: data.email?.trim() || null,
        website: data.website?.trim() || null,
        address: stripHtml(data.address),
        locality: stripHtml(localityName),
        landmark: data.landmark ? stripHtml(data.landmark) : null,
        latitude: data.latitude !== undefined && !isNaN(data.latitude) ? new Prisma.Decimal(data.latitude) : null,
        longitude: data.longitude !== undefined && !isNaN(data.longitude) ? new Prisma.Decimal(data.longitude) : null,
        seoTitle: data.seoTitle?.trim() || null,
        seoDescription: data.seoDescription?.trim() || null,
        seoKeywords: data.seoKeywords?.trim() || null,
        ogImage: data.ogImage?.trim() || null,
        yearEstablished: data.yearEstablished || null,
        priceRange: data.priceRange || 1,
        ...(updatedOpeningHours && { openingHours: updatedOpeningHours as unknown as Prisma.InputJsonValue }),
        ...(data.customSections !== undefined && { customSections: data.customSections as unknown as Prisma.InputJsonValue }),
        amenities: data.amenities || [],
      },
    });

    // Update category relation
    await db.listingCategory.deleteMany({ where: { listingId } });
    await db.listingCategory.create({
      data: { listingId, categoryId: data.categoryId },
    });

    // Update location relation
    await db.listingLocation.deleteMany({ where: { listingId } });
    await db.listingLocation.create({
      data: { listingId, locationId: data.locationId, isPrimary: true },
    });

    // Sync image media
    const imageUrls = (formData.getAll("imageUrls") as string[]).filter(Boolean);
    if (imageUrls.length > 0) {
      await db.media.deleteMany({ where: { listingId } });
      await db.media.createMany({
        data: imageUrls.map((url, idx) => ({
          listingId,
          ownerId: updated.ownerId || null,
          key: `listings/${listingId}/${idx}-${Date.now()}`,
          url,
          mimeType: "image/jpeg",
          bytes: 1000,
          scanStatus: "clean",
          altText: `${updated.title} photo ${idx + 1}`,
        })),
      });
    }

    revalidatePath("/admin/listings");
    revalidatePath(`/admin/listings/${listingId}/edit`);
    revalidatePath(`/listing/${existing.slug}`);
    revalidatePath(`/listing/${updated.slug}`);
    revalidatePath("/search");
    revalidatePath("/");

    return {
      success: true,
      listingId: updated.id,
      slug: updated.slug,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update business listing.",
    };
  }
}

