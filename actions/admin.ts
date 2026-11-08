"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { assertAuthorized } from "@/lib/auth/rbac";
import { ReviewService } from "@/lib/services/review.service";
import { ClaimService } from "@/lib/services/claim.service";
import { UserRole, UserStatus, ReviewStatus, ListingStatus, Prisma } from "@prisma/client";
import db from "@/lib/db/client";
import { parseOpeningHoursInput } from "@/lib/utils/opening-hours-parser";
import { hashPassword } from "@/lib/auth/password";

export async function approveReviewAction(reviewId: string) {
  const user = await getCurrentUser();
  assertAuthorized(user, UserRole.moderator);

  try {
    await ReviewService.setModerationStatus(reviewId, ReviewStatus.approved, user.id);
    revalidatePath("/admin/moderation");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to approve review.",
    };
  }
}

export async function rejectReviewAction(reviewId: string) {
  const user = await getCurrentUser();
  assertAuthorized(user, UserRole.moderator);

  try {
    await ReviewService.setModerationStatus(reviewId, ReviewStatus.trashed, user.id);
    revalidatePath("/admin/moderation");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reject review.",
    };
  }
}

export async function approveClaimAction(claimId: string) {
  const user = await getCurrentUser();
  assertAuthorized(user, UserRole.moderator);

  try {
    await ClaimService.approveClaim(claimId, user.id);
    revalidatePath("/admin/moderation");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to approve claim.",
    };
  }
}

export async function rejectClaimAction(claimId: string, reason?: string) {
  const user = await getCurrentUser();
  assertAuthorized(user, UserRole.moderator);

  try {
    await ClaimService.rejectClaim(claimId, user.id, reason);
    revalidatePath("/admin/moderation");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reject claim.",
    };
  }
}

export async function updateListingStatusAction(listingId: string, status: ListingStatus) {
  const user = await getCurrentUser();
  assertAuthorized(user, UserRole.moderator);

  try {
    await db.listing.update({
      where: { id: listingId },
      data: {
        status,
        ...(status === "published" && { publishedAt: new Date() }),
      },
    });

    revalidatePath("/admin/listings");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update listing status.",
    };
  }
}

export interface ImportListingInput {
  title: string;
  categorySlug?: string;
  locationSlug?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  address: string;
  locality?: string;
  landmark?: string;
  description?: string;
  priceRange?: number;
  openingHours?: string;
}

export async function importListingsAction(items: ImportListingInput[]) {
  const user = await getCurrentUser();
  assertAuthorized(user, UserRole.admin);

  if (!items || items.length === 0) {
    return { success: false, error: "No listings provided to import." };
  }

  let importedCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item) continue;
    try {
      if (!item.title?.trim() || !item.address?.trim()) {
        errors.push(`Row ${i + 1}: Title and address are required.`);
        continue;
      }

      // Base slug from title
      const baseSlug = item.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      let slug = baseSlug || `business-${Date.now()}`;
      let suffix = 1;
      while (await db.listing.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${suffix++}`;
      }

      // Resolve category
      let category = item.categorySlug
        ? await db.category.findUnique({ where: { slug: item.categorySlug.trim().toLowerCase() } })
        : null;

      if (!category) {
        category = await db.category.findFirst();
      }

      // Resolve location
      let location = item.locationSlug
        ? await db.location.findUnique({ where: { slug: item.locationSlug.trim().toLowerCase() } })
        : null;

      if (!location) {
        location = await db.location.findFirst();
      }

      // Parse opening hours (supporting text shorthand and JSON)
      const parsedHours = parseOpeningHoursInput(item.openingHours);

      const listing = await db.listing.create({
        data: {
          slug,
          title: item.title.trim(),
          description: item.description?.trim() || `<p>${item.title} is a verified business in Pimple Saudagar, PCMC.</p>`,
          status: ListingStatus.published,
          publishedAt: new Date(),
          address: item.address.trim(),
          locality: item.locality?.trim() || location?.name || "Pimple Saudagar",
          landmark: item.landmark?.trim() || null,
          phone: item.phone?.trim() || null,
          whatsapp: item.whatsapp?.trim() || null,
          email: item.email?.trim() || null,
          website: item.website?.trim() || null,
          priceRange: item.priceRange && item.priceRange >= 1 && item.priceRange <= 4 ? item.priceRange : 2,
          openingHours: parsedHours ? (parsedHours as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        },
      });

      if (category) {
        await db.listingCategory.create({
          data: {
            listingId: listing.id,
            categoryId: category.id,
          },
        });
      }

      if (location) {
        await db.listingLocation.create({
          data: {
            listingId: listing.id,
            locationId: location.id,
            isPrimary: true,
          },
        });
      }

      importedCount++;
    } catch (err) {
      errors.push(`Row ${i + 1} (${item.title}): ${err instanceof Error ? err.message : "Database error"}`);
    }
  }

  revalidatePath("/admin/listings");
  revalidatePath("/admin");
  revalidatePath("/search");

  return {
    success: true,
    importedCount,
    failedCount: errors.length,
    errors,
  };
}

export interface ImportCategoryInput {
  name: string;
  slug?: string;
  parentSlug?: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  featuredOnHome?: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export async function importCategoriesAction(items: ImportCategoryInput[]) {
  const user = await getCurrentUser();
  assertAuthorized(user, UserRole.admin);

  if (!items || items.length === 0) {
    return { success: false, error: "No categories provided to import." };
  }

  let importedCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item) continue;
    try {
      if (!item.name?.trim()) {
        errors.push(`Row ${i + 1}: Category name is required.`);
        continue;
      }

      const name = item.name.trim();
      const baseSlug = (item.slug?.trim() || name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      let parentId: string | null = null;
      if (item.parentSlug?.trim()) {
        const parent = await db.category.findUnique({
          where: { slug: item.parentSlug.trim().toLowerCase() },
        });
        if (parent) {
          parentId = parent.id;
        }
      }

      await db.category.upsert({
        where: { slug: baseSlug },
        create: {
          name,
          slug: baseSlug,
          parentId,
          description: item.description?.trim() || null,
          icon: item.icon?.trim() || null,
          sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : 0,
          featuredOnHome: Boolean(item.featuredOnHome),
          seoTitle: item.seoTitle?.trim() || `${name} in Pimple Saudagar | Local Directory`,
          seoDescription: item.seoDescription?.trim() || `Explore top verified ${name} listings, contact numbers, and reviews in Pimple Saudagar.`,
        },
        update: {
          name,
          ...(parentId ? { parentId } : {}),
          ...(item.description ? { description: item.description.trim() } : {}),
          ...(item.icon ? { icon: item.icon.trim() } : {}),
          ...(typeof item.sortOrder === "number" ? { sortOrder: item.sortOrder } : {}),
          ...(item.featuredOnHome !== undefined ? { featuredOnHome: Boolean(item.featuredOnHome) } : {}),
          ...(item.seoTitle ? { seoTitle: item.seoTitle.trim() } : {}),
          ...(item.seoDescription ? { seoDescription: item.seoDescription.trim() } : {}),
        },
      });

      importedCount++;
    } catch (err) {
      errors.push(`Row ${i + 1} (${item.name}): ${err instanceof Error ? err.message : "Database error"}`);
    }
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin");
  revalidatePath("/");

  return {
    success: true,
    importedCount,
    failedCount: errors.length,
    errors,
  };
}

export interface ImportLocationInput {
  name: string;
  slug?: string;
  parentSlug?: string;
  description?: string;
  latitude?: number | string;
  longitude?: number | string;
  sortOrder?: number;
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export async function importLocationsAction(items: ImportLocationInput[]) {
  const user = await getCurrentUser();
  assertAuthorized(user, UserRole.admin);

  if (!items || items.length === 0) {
    return { success: false, error: "No locations provided to import." };
  }

  let importedCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item) continue;
    try {
      if (!item.name?.trim()) {
        errors.push(`Row ${i + 1}: Location/Area name is required.`);
        continue;
      }

      const name = item.name.trim();
      const baseSlug = (item.slug?.trim() || name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      let parentId: string | null = null;
      if (item.parentSlug?.trim()) {
        const parent = await db.location.findUnique({
          where: { slug: item.parentSlug.trim().toLowerCase() },
        });
        if (parent) {
          parentId = parent.id;
        }
      }

      const lat = item.latitude !== undefined && item.latitude !== "" && !isNaN(Number(item.latitude))
        ? new Prisma.Decimal(Number(item.latitude))
        : null;
      const lng = item.longitude !== undefined && item.longitude !== "" && !isNaN(Number(item.longitude))
        ? new Prisma.Decimal(Number(item.longitude))
        : null;

      await db.location.upsert({
        where: { slug: baseSlug },
        create: {
          name,
          slug: baseSlug,
          parentId,
          description: item.description?.trim() || null,
          latitude: lat,
          longitude: lng,
          sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : 0,
          featured: Boolean(item.featured),
          seoTitle: item.seoTitle?.trim() || `${name}, Pimple Saudagar Directory | Local Businesses & Services`,
          seoDescription: item.seoDescription?.trim() || `Discover top verified businesses, shops, and services around ${name}, Pimple Saudagar.`,
        },
        update: {
          name,
          ...(parentId ? { parentId } : {}),
          ...(item.description ? { description: item.description.trim() } : {}),
          ...(lat ? { latitude: lat } : {}),
          ...(lng ? { longitude: lng } : {}),
          ...(typeof item.sortOrder === "number" ? { sortOrder: item.sortOrder } : {}),
          ...(item.featured !== undefined ? { featured: Boolean(item.featured) } : {}),
          ...(item.seoTitle ? { seoTitle: item.seoTitle.trim() } : {}),
          ...(item.seoDescription ? { seoDescription: item.seoDescription.trim() } : {}),
        },
      });

      importedCount++;
    } catch (err) {
      errors.push(`Row ${i + 1} (${item.name}): ${err instanceof Error ? err.message : "Database error"}`);
    }
  }

  revalidatePath("/admin/locations");
  revalidatePath("/admin");
  revalidatePath("/");

  return {
    success: true,
    importedCount,
    failedCount: errors.length,
    errors,
  };
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
}

export async function createUserAdminAction(input: CreateUserInput) {
  const currentUser = await getCurrentUser();
  assertAuthorized(currentUser, UserRole.admin);

  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const password = input.password?.trim();
  const phone = input.phone?.trim() || null;
  const role = input.role || UserRole.visitor;

  if (!name || name.length < 2) {
    return { success: false, error: "Name is compulsory and must be at least 2 characters long." };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "A valid email address is compulsory." };
  }

  if (!password || password.length < 6) {
    return { success: false, error: "Password is compulsory and must be at least 6 characters long." };
  }

  try {
    const existing = await db.user.findUnique({
      where: { email },
    });

    if (existing) {
      return { success: false, error: "A user with this email address already exists." };
    }

    const passwordHash = await hashPassword(password);

    const newUser = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        role,
        status: UserStatus.active,
        emailVerifiedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        createdAt: true,
        _count: {
          select: { listings: true },
        },
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    return {
      success: true,
      user: {
        ...newUser,
        createdAt: newUser.createdAt.toISOString(),
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create user.",
    };
  }
}

export async function deleteUserAdminAction(userId: string) {
  const currentUser = await getCurrentUser();
  assertAuthorized(currentUser, UserRole.admin);

  if (currentUser.id === userId) {
    return { success: false, error: "You cannot delete your own active administrator account." };
  }

  try {
    await db.session.deleteMany({ where: { userId } });
    await db.user.delete({ where: { id: userId } });

    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete user.",
    };
  }
}

export async function updateUserRoleAndStatusAction(
  userId: string,
  data: { role?: UserRole; status?: UserStatus }
) {
  const currentUser = await getCurrentUser();
  assertAuthorized(currentUser, UserRole.admin);

  if (currentUser.id === userId && data.role && data.role !== UserRole.admin) {
    return { success: false, error: "You cannot demote your own administrator account." };
  }

  try {
    const updated = await db.user.update({
      where: { id: userId },
      data: {
        ...(data.role && { role: data.role }),
        ...(data.status && { status: data.status }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        createdAt: true,
        _count: {
          select: { listings: true },
        },
      },
    });

    revalidatePath("/admin/settings");
    return {
      success: true,
      user: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update user.",
    };
  }
}

export async function resetUserPasswordAdminAction(targetUserId: string, newPassword: string) {
  const currentUser = await getCurrentUser();
  assertAuthorized(currentUser, UserRole.admin);

  const cleanPassword = newPassword?.trim();
  if (!cleanPassword || cleanPassword.length < 6) {
    return { success: false, error: "New password must be at least 6 characters long." };
  }

  try {
    const targetUser = await db.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, email: true },
    });

    if (!targetUser) {
      return { success: false, error: "User account not found." };
    }

    const passwordHash = await hashPassword(cleanPassword);

    await db.user.update({
      where: { id: targetUserId },
      data: {
        passwordHash,
        failedLoginCount: 0,
        lockedUntil: null,
      },
    });

    // Invalidate target user's active sessions to force re-login with the new password
    await db.session.deleteMany({ where: { userId: targetUserId } });

    revalidatePath("/admin/settings");
    return {
      success: true,
      message: `Password for ${targetUser.name} (${targetUser.email}) was updated successfully.`,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to reset password.",
    };
  }
}
