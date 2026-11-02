"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import db from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/session";
import { assertAuthorized } from "@/lib/auth/rbac";
import { sanitizeRichText, stripHtml } from "@/lib/security/sanitize";
import { hashPassword } from "@/lib/auth/password";
import { ListingStatus, ClaimStatus, UserRole, Prisma } from "@prisma/client";

const baseListingSchema = z.object({
  title: z.string().min(2, "Business title must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  categoryId: z.string().min(1, "Please select a category."),
  locationId: z.string().min(1, "Please select a locality/neighborhood."),
  address: z.string().min(5, "Full street address is required."),
  locality: z.string().min(2, "Locality name is required."),
  landmark: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number (e.g. +919876543210)").optional().or(z.literal("")),
  whatsapp: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid WhatsApp number (e.g. +919876543210)").optional().or(z.literal("")),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  website: z.string().url("Invalid website URL (e.g. https://example.com)").optional().or(z.literal("")),
  yearEstablished: z.coerce.number().min(1900).max(new Date().getFullYear()).optional(),
  priceRange: z.coerce.number().min(1).max(4).default(1),
  planId: z.string().optional(),
  amenities: z.array(z.string()).optional().default([]),
  seoTitle: z.string().max(120, "SEO title should be under 120 characters.").optional().or(z.literal("")),
  seoDescription: z.string().max(320, "SEO description should be under 320 characters.").optional().or(z.literal("")),
  seoKeywords: z.string().max(250, "SEO keywords should be under 250 characters.").optional().or(z.literal("")),
  ogImage: z.string().optional().or(z.literal("")),
});

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

  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    categoryId: formData.get("categoryId") as string,
    locationId: formData.get("locationId") as string,
    address: formData.get("address") as string,
    locality: formData.get("locality") as string,
    landmark: formData.get("landmark") as string,
    latitude: formData.get("latitude") as string,
    longitude: formData.get("longitude") as string,
    phone: formData.get("phone") as string,
    whatsapp: formData.get("whatsapp") as string,
    email: formData.get("email") as string,
    website: formData.get("website") as string,
    yearEstablished: formData.get("yearEstablished") as string,
    priceRange: formData.get("priceRange") as string,
    planId: formData.get("planId") as string,
    amenities: formData.getAll("amenities") as string[],
    seoTitle: formData.get("seoTitle") as string,
    seoDescription: formData.get("seoDescription") as string,
    seoKeywords: formData.get("seoKeywords") as string,
    ogImage: formData.get("ogImage") as string,
  };

  const validation = baseListingSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      error: "Please check the form for invalid fields.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const data = validation.data;
  const status = (formData.get("status") as ListingStatus) || ListingStatus.published;
  const claimStatus = (formData.get("claimStatus") as ClaimStatus) || ClaimStatus.verified;
  const featured = formData.get("featured") === "true" || formData.get("featured") === "on";
  const priority = Number(formData.get("priority") || 0);
  const ownerId = (formData.get("ownerId") as string) || user.id;

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
        openingHours: defaultOpeningHours,
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

  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    categoryId: formData.get("categoryId") as string,
    locationId: formData.get("locationId") as string,
    address: formData.get("address") as string,
    locality: formData.get("locality") as string,
    landmark: formData.get("landmark") as string,
    latitude: formData.get("latitude") as string,
    longitude: formData.get("longitude") as string,
    phone: formData.get("phone") as string,
    whatsapp: formData.get("whatsapp") as string,
    email: formData.get("email") as string,
    website: formData.get("website") as string,
    yearEstablished: formData.get("yearEstablished") as string,
    priceRange: formData.get("priceRange") as string,
    planId: formData.get("planId") as string,
    amenities: formData.getAll("amenities") as string[],
    seoTitle: formData.get("seoTitle") as string,
    seoDescription: formData.get("seoDescription") as string,
    seoKeywords: formData.get("seoKeywords") as string,
    ogImage: formData.get("ogImage") as string,
  };

  const validation = baseListingSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      error: "Please check the form for invalid entries.",
      fieldErrors: validation.error.flatten().fieldErrors,
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
        openingHours: defaultOpeningHours,
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

  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    categoryId: formData.get("categoryId") as string,
    locationId: formData.get("locationId") as string,
    address: formData.get("address") as string,
    locality: formData.get("locality") as string,
    landmark: formData.get("landmark") as string,
    latitude: formData.get("latitude") as string,
    longitude: formData.get("longitude") as string,
    phone: formData.get("phone") as string,
    whatsapp: formData.get("whatsapp") as string,
    email: formData.get("email") as string,
    website: formData.get("website") as string,
    yearEstablished: formData.get("yearEstablished") as string,
    priceRange: formData.get("priceRange") as string,
    planId: formData.get("planId") as string,
    amenities: formData.getAll("amenities") as string[],
    seoTitle: formData.get("seoTitle") as string,
    seoDescription: formData.get("seoDescription") as string,
    seoKeywords: formData.get("seoKeywords") as string,
    ogImage: formData.get("ogImage") as string,
  };

  const validation = baseListingSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      error: "Please check the form for invalid fields.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const data = validation.data;
  const status = (formData.get("status") as ListingStatus) || existing.status;
  const claimStatus = (formData.get("claimStatus") as ClaimStatus) || existing.claimStatus;
  const featured = formData.get("featured") === "true" || formData.get("featured") === "on";
  const priority = Number(formData.get("priority") || 0);

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

