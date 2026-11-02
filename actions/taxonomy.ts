"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import db from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/session";
import { assertAuthorized } from "@/lib/auth/rbac";
import { stripHtml } from "@/lib/security/sanitize";
import { UserRole, Prisma } from "@prisma/client";

export type TaxonomyActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  recordId?: string;
};

function formatPermanentSlug(input: string, fallback: string): string {
  const source = input.trim() || fallback;
  const slug = stripHtml(source)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "item";
}

/* -------------------------------------------------------------------------- */
/* CATEGORY SERVER ACTIONS                                                    */
/* -------------------------------------------------------------------------- */

const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters."),
  slug: z.string().optional(),
  parentId: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  icon: z.string().optional().or(z.literal("")),
  coverImage: z.string().optional().or(z.literal("")),
  sortOrder: z.coerce.number().default(0),
  featuredOnHome: z.boolean().default(false),
  seoTitle: z.string().max(120, "SEO title should be under 120 characters.").optional().or(z.literal("")),
  seoDescription: z.string().max(320, "SEO description should be under 320 characters.").optional().or(z.literal("")),
  seoKeywords: z.string().max(250, "SEO keywords should be under 250 characters.").optional().or(z.literal("")),
  ogImage: z.string().optional().or(z.literal("")),
});

export async function createCategoryAdminAction(
  _prevState: TaxonomyActionState | null,
  formData: FormData
): Promise<TaxonomyActionState> {
  const user = await getCurrentUser();
  try {
    assertAuthorized(user, UserRole.moderator);
  } catch {
    return { error: "Unauthorized: Administrator privileges required." };
  }

  const raw = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    parentId: formData.get("parentId") as string,
    description: formData.get("description") as string,
    icon: formData.get("icon") as string,
    coverImage: formData.get("coverImage") as string,
    sortOrder: formData.get("sortOrder") as string,
    featuredOnHome: formData.get("featuredOnHome") === "true" || formData.get("featuredOnHome") === "on",
    seoTitle: formData.get("seoTitle") as string,
    seoDescription: formData.get("seoDescription") as string,
    seoKeywords: formData.get("seoKeywords") as string,
    ogImage: formData.get("ogImage") as string,
  };

  const validation = categorySchema.safeParse(raw);
  if (!validation.success) {
    return {
      error: "Please check form for invalid inputs.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const data = validation.data;
  const targetSlug = formatPermanentSlug(data.slug || "", data.name);

  const existingSlug = await db.category.findUnique({ where: { slug: targetSlug } });
  if (existingSlug) {
    return { error: `The permanent slug "/category/${targetSlug}" is already taken. Please choose another.` };
  }

  try {
    const created = await db.category.create({
      data: {
        name: stripHtml(data.name),
        slug: targetSlug,
        parentId: data.parentId || null,
        description: data.description ? stripHtml(data.description) : null,
        icon: data.icon ? stripHtml(data.icon) : null,
        coverImage: data.coverImage?.trim() || null,
        sortOrder: data.sortOrder,
        featuredOnHome: data.featuredOnHome,
        seoTitle: data.seoTitle?.trim() || null,
        seoDescription: data.seoDescription?.trim() || null,
        seoKeywords: data.seoKeywords?.trim() || null,
        ogImage: data.ogImage?.trim() || null,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/category/" + targetSlug);
    revalidatePath("/");

    return { success: true, recordId: created.id };
  } catch (err: any) {
    return { error: err.message || "Failed to create category." };
  }
}

export async function updateCategoryAdminAction(
  _prevState: TaxonomyActionState | null,
  formData: FormData
): Promise<TaxonomyActionState> {
  const user = await getCurrentUser();
  try {
    assertAuthorized(user, UserRole.moderator);
  } catch {
    return { error: "Unauthorized: Administrator privileges required." };
  }

  const categoryId = formData.get("categoryId") as string;
  if (!categoryId) {
    return { error: "Category ID is required for editing." };
  }

  const existing = await db.category.findUnique({ where: { id: categoryId } });
  if (!existing) {
    return { error: "Category not found." };
  }

  const raw = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    parentId: formData.get("parentId") as string,
    description: formData.get("description") as string,
    icon: formData.get("icon") as string,
    coverImage: formData.get("coverImage") as string,
    sortOrder: formData.get("sortOrder") as string,
    featuredOnHome: formData.get("featuredOnHome") === "true" || formData.get("featuredOnHome") === "on",
    seoTitle: formData.get("seoTitle") as string,
    seoDescription: formData.get("seoDescription") as string,
    seoKeywords: formData.get("seoKeywords") as string,
    ogImage: formData.get("ogImage") as string,
  };

  const validation = categorySchema.safeParse(raw);
  if (!validation.success) {
    return {
      error: "Please check form for invalid inputs.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const data = validation.data;
  const targetSlug = formatPermanentSlug(data.slug || existing.slug, data.name);

  if (targetSlug !== existing.slug) {
    const slugConflict = await db.category.findFirst({
      where: { slug: targetSlug, id: { not: categoryId } },
    });
    if (slugConflict) {
      return { error: `The permanent slug "/category/${targetSlug}" is already in use.` };
    }
  }

  try {
    await db.category.update({
      where: { id: categoryId },
      data: {
        name: stripHtml(data.name),
        slug: targetSlug,
        parentId: data.parentId && data.parentId !== categoryId ? data.parentId : null,
        description: data.description ? stripHtml(data.description) : null,
        icon: data.icon ? stripHtml(data.icon) : null,
        coverImage: data.coverImage?.trim() || null,
        sortOrder: data.sortOrder,
        featuredOnHome: data.featuredOnHome,
        seoTitle: data.seoTitle?.trim() || null,
        seoDescription: data.seoDescription?.trim() || null,
        seoKeywords: data.seoKeywords?.trim() || null,
        ogImage: data.ogImage?.trim() || null,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/category/" + existing.slug);
    revalidatePath("/category/" + targetSlug);
    revalidatePath("/");

    return { success: true, recordId: categoryId };
  } catch (err: any) {
    return { error: err.message || "Failed to update category." };
  }
}

export async function deleteCategoryAdminAction(categoryId: string): Promise<{ success?: boolean; error?: string }> {
  const user = await getCurrentUser();
  try {
    assertAuthorized(user, UserRole.admin);
  } catch {
    return { error: "Unauthorized: Super-Admin privileges required." };
  }

  try {
    await db.category.delete({ where: { id: categoryId } });
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to delete category." };
  }
}

/* -------------------------------------------------------------------------- */
/* LOCATION SERVER ACTIONS                                                    */
/* -------------------------------------------------------------------------- */

const locationSchema = z.object({
  name: z.string().min(2, "Location name must be at least 2 characters."),
  slug: z.string().optional(),
  parentId: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  coverImage: z.string().optional().or(z.literal("")),
  sortOrder: z.coerce.number().default(0),
  featured: z.boolean().default(false),
  seoTitle: z.string().max(120, "SEO title should be under 120 characters.").optional().or(z.literal("")),
  seoDescription: z.string().max(320, "SEO description should be under 320 characters.").optional().or(z.literal("")),
  seoKeywords: z.string().max(250, "SEO keywords should be under 250 characters.").optional().or(z.literal("")),
  ogImage: z.string().optional().or(z.literal("")),
});

export async function createLocationAdminAction(
  _prevState: TaxonomyActionState | null,
  formData: FormData
): Promise<TaxonomyActionState> {
  const user = await getCurrentUser();
  try {
    assertAuthorized(user, UserRole.moderator);
  } catch {
    return { error: "Unauthorized: Administrator privileges required." };
  }

  const raw = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    parentId: formData.get("parentId") as string,
    description: formData.get("description") as string,
    latitude: formData.get("latitude") as string,
    longitude: formData.get("longitude") as string,
    coverImage: formData.get("coverImage") as string,
    sortOrder: formData.get("sortOrder") as string,
    featured: formData.get("featured") === "true" || formData.get("featured") === "on",
    seoTitle: formData.get("seoTitle") as string,
    seoDescription: formData.get("seoDescription") as string,
    seoKeywords: formData.get("seoKeywords") as string,
    ogImage: formData.get("ogImage") as string,
  };

  const validation = locationSchema.safeParse(raw);
  if (!validation.success) {
    return {
      error: "Please check form for invalid inputs.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const data = validation.data;
  const targetSlug = formatPermanentSlug(data.slug || "", data.name);

  const existingSlug = await db.location.findUnique({ where: { slug: targetSlug } });
  if (existingSlug) {
    return { error: `The permanent slug "/location/${targetSlug}" is already taken.` };
  }

  try {
    const created = await db.location.create({
      data: {
        name: stripHtml(data.name),
        slug: targetSlug,
        parentId: data.parentId || null,
        description: data.description ? stripHtml(data.description) : null,
        latitude: data.latitude !== undefined && !isNaN(data.latitude) ? new Prisma.Decimal(data.latitude) : null,
        longitude: data.longitude !== undefined && !isNaN(data.longitude) ? new Prisma.Decimal(data.longitude) : null,
        coverImage: data.coverImage?.trim() || null,
        sortOrder: data.sortOrder,
        featured: data.featured,
        seoTitle: data.seoTitle?.trim() || null,
        seoDescription: data.seoDescription?.trim() || null,
        seoKeywords: data.seoKeywords?.trim() || null,
        ogImage: data.ogImage?.trim() || null,
      },
    });

    revalidatePath("/admin/locations");
    revalidatePath("/location/" + targetSlug);
    revalidatePath("/");

    return { success: true, recordId: created.id };
  } catch (err: any) {
    return { error: err.message || "Failed to create location." };
  }
}

export async function updateLocationAdminAction(
  _prevState: TaxonomyActionState | null,
  formData: FormData
): Promise<TaxonomyActionState> {
  const user = await getCurrentUser();
  try {
    assertAuthorized(user, UserRole.moderator);
  } catch {
    return { error: "Unauthorized: Administrator privileges required." };
  }

  const locationId = formData.get("locationId") as string;
  if (!locationId) {
    return { error: "Location ID is required for editing." };
  }

  const existing = await db.location.findUnique({ where: { id: locationId } });
  if (!existing) {
    return { error: "Location not found." };
  }

  const raw = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    parentId: formData.get("parentId") as string,
    description: formData.get("description") as string,
    latitude: formData.get("latitude") as string,
    longitude: formData.get("longitude") as string,
    coverImage: formData.get("coverImage") as string,
    sortOrder: formData.get("sortOrder") as string,
    featured: formData.get("featured") === "true" || formData.get("featured") === "on",
    seoTitle: formData.get("seoTitle") as string,
    seoDescription: formData.get("seoDescription") as string,
    seoKeywords: formData.get("seoKeywords") as string,
    ogImage: formData.get("ogImage") as string,
  };

  const validation = locationSchema.safeParse(raw);
  if (!validation.success) {
    return {
      error: "Please check form for invalid inputs.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const data = validation.data;
  const targetSlug = formatPermanentSlug(data.slug || existing.slug, data.name);

  if (targetSlug !== existing.slug) {
    const slugConflict = await db.location.findFirst({
      where: { slug: targetSlug, id: { not: locationId } },
    });
    if (slugConflict) {
      return { error: `The permanent slug "/location/${targetSlug}" is already in use.` };
    }
  }

  try {
    await db.location.update({
      where: { id: locationId },
      data: {
        name: stripHtml(data.name),
        slug: targetSlug,
        parentId: data.parentId && data.parentId !== locationId ? data.parentId : null,
        description: data.description ? stripHtml(data.description) : null,
        latitude: data.latitude !== undefined && !isNaN(data.latitude) ? new Prisma.Decimal(data.latitude) : null,
        longitude: data.longitude !== undefined && !isNaN(data.longitude) ? new Prisma.Decimal(data.longitude) : null,
        coverImage: data.coverImage?.trim() || null,
        sortOrder: data.sortOrder,
        featured: data.featured,
        seoTitle: data.seoTitle?.trim() || null,
        seoDescription: data.seoDescription?.trim() || null,
        seoKeywords: data.seoKeywords?.trim() || null,
        ogImage: data.ogImage?.trim() || null,
      },
    });

    revalidatePath("/admin/locations");
    revalidatePath("/location/" + existing.slug);
    revalidatePath("/location/" + targetSlug);
    revalidatePath("/");

    return { success: true, recordId: locationId };
  } catch (err: any) {
    return { error: err.message || "Failed to update location." };
  }
}

export async function deleteLocationAdminAction(locationId: string): Promise<{ success?: boolean; error?: string }> {
  const user = await getCurrentUser();
  try {
    assertAuthorized(user, UserRole.admin);
  } catch {
    return { error: "Unauthorized: Super-Admin privileges required." };
  }

  try {
    await db.location.delete({ where: { id: locationId } });
    revalidatePath("/admin/locations");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to delete location." };
  }
}

