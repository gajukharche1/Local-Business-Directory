"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/rbac";
import { UserRole } from "@prisma/client";
import { MediaService, MediaUploadRequest, ListMediaOptions } from "@/lib/services/media.service";

export async function listMediaAction(params: Partial<ListMediaOptions>) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false as const, error: "Authentication required" };
  }

  const isAdminOrMod = hasRole(user.role, UserRole.moderator);

  try {
    const data = await MediaService.listMedia({
      userId: user.id,
      isAdminOrMod,
      folder: params.folder,
      search: params.search,
      mimeGroup: params.mimeGroup,
      listingId: params.listingId,
      showDeleted: params.showDeleted,
      page: params.page,
      limit: params.limit,
    });

    return { success: true as const, ...data };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to load media items.",
    };
  }
}

export async function createMediaUploadTicketAction(req: MediaUploadRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false as const, error: "Authentication required" };
  }

  try {
    const ticket = await MediaService.createUploadTicket(user.id, req);
    return { success: true as const, ticket };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to generate upload ticket.",
    };
  }
}

export async function updateMediaMetadataAction(
  id: string,
  data: {
    title?: string;
    altText?: string;
    folder?: string;
    tags?: string[];
  }
) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Authentication required" };

  const isAdminOrMod = hasRole(user.role, UserRole.moderator);

  try {
    const updated = await MediaService.updateMetadata(id, user.id, isAdminOrMod, data);
    revalidatePath("/admin/media");
    revalidatePath("/dashboard/media");
    return { success: true as const, media: updated };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to update media metadata.",
    };
  }
}

export async function moveMediaFolderAction(ids: string[], targetFolder: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Authentication required" };

  const isAdminOrMod = hasRole(user.role, UserRole.moderator);

  try {
    const count = await MediaService.moveFolder(ids, targetFolder, user.id, isAdminOrMod);
    revalidatePath("/admin/media");
    revalidatePath("/dashboard/media");
    return { success: true as const, count };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to move media assets.",
    };
  }
}

export async function deleteMediaAction(id: string, permanent: boolean = false) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Authentication required" };

  const isAdminOrMod = hasRole(user.role, UserRole.moderator);

  try {
    await MediaService.deleteMedia(id, user.id, isAdminOrMod, permanent);
    revalidatePath("/admin/media");
    revalidatePath("/dashboard/media");
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to delete media asset.",
    };
  }
}

export async function bulkDeleteMediaAction(ids: string[], permanent: boolean = false) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Authentication required" };

  const isAdminOrMod = hasRole(user.role, UserRole.moderator);

  try {
    const count = await MediaService.bulkDeleteMedia(ids, user.id, isAdminOrMod, permanent);
    revalidatePath("/admin/media");
    revalidatePath("/dashboard/media");
    return { success: true as const, count };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to perform bulk delete.",
    };
  }
}

export async function restoreMediaAction(ids: string[]) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Authentication required" };

  const isAdminOrMod = hasRole(user.role, UserRole.moderator);

  try {
    const count = await MediaService.restoreMedia(ids, user.id, isAdminOrMod);
    revalidatePath("/admin/media");
    revalidatePath("/dashboard/media");
    return { success: true as const, count };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to restore media items.",
    };
  }
}

export async function getMediaStorageStatsAction() {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Authentication required" };

  const isAdminOrMod = hasRole(user.role, UserRole.moderator);

  try {
    const stats = await MediaService.getStorageStats(user.id, isAdminOrMod);
    return { success: true as const, stats };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to retrieve storage stats.",
    };
  }
}
