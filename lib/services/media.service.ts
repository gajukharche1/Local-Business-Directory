import db from "@/lib/db/client";
import { getStorageDriver } from "@/lib/storage/driver";
import { Prisma } from "@prisma/client";

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "application/pdf",
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export interface MediaUploadRequest {
  listingId?: string | null;
  categoryId?: string | null;
  locationId?: string | null;
  fileName: string;
  mimeType: string;
  bytes: number;
  folder?: string;
  title?: string;
}

export interface ListMediaOptions {
  userId?: string | null;
  isAdminOrMod?: boolean;
  folder?: string;
  search?: string;
  mimeGroup?: "all" | "image" | "document";
  listingId?: string;
  showDeleted?: boolean;
  page?: number;
  limit?: number;
}

export class MediaService {
  /**
   * Checks whether the user / listing can accept more media
   */
  static async assertCanUploadMedia(ownerId: string, listingId?: string | null): Promise<boolean> {
    if (listingId) {
      const listing = await db.listing.findFirst({
        where: { id: listingId },
        include: {
          plan: true,
          _count: {
            select: {
              media: {
                where: { deletedAt: null },
              },
            },
          },
        },
      });

      if (listing) {
        const maxAllowed = listing.plan?.maxPhotos ?? 10;
        const currentCount = listing._count.media;
        if (currentCount >= maxAllowed) {
          throw new Error(
            `Plan limit reached. Your ${listing.plan?.name || "current"} plan allows up to ${maxAllowed} photos. Please upgrade to add more.`
          );
        }
      }
    }

    return true;
  }

  /**
   * Generates a pre-signed or direct upload payload contract
   */
  static async createUploadTicket(ownerId: string, req: MediaUploadRequest) {
    if (!ALLOWED_MIME_TYPES.includes(req.mimeType)) {
      throw new Error("Invalid file type. Allowed formats: JPEG, PNG, WebP, AVIF, SVG, PDF.");
    }

    if (req.bytes > MAX_FILE_SIZE_BYTES) {
      throw new Error("File exceeds the 10 MB maximum size limit.");
    }

    if (req.listingId) {
      await this.assertCanUploadMedia(ownerId, req.listingId);
    }

    const folder = "/" + (req.folder || "").trim().replace(/^[\/\\]+|[\/\\]+$/g, "").replace(/\.\./g, "");
    const ext = req.fileName.split(".").pop() || "bin";
    const uniqueId = Math.random().toString(36).substring(2, 9);
    const subFolder = folder === "/" ? "" : `${folder.replace(/^\//, "")}/`;
    const objectKey = `${subFolder}${Date.now()}-${uniqueId}.${ext}`;

    const driver = getStorageDriver();
    const ticket = await driver.generateUploadTicket({
      key: objectKey,
      mimeType: req.mimeType,
      bytes: req.bytes,
    });

    // Create pending media record in database
    const media = await db.media.create({
      data: {
        title: req.title || req.fileName.replace(/\.[^/.]+$/, ""),
        fileName: req.fileName,
        listingId: req.listingId || null,
        categoryId: req.categoryId || null,
        locationId: req.locationId || null,
        ownerId,
        key: objectKey,
        url: ticket.publicUrl,
        thumbnailUrl: req.mimeType.startsWith("image/") ? ticket.publicUrl : null,
        mimeType: req.mimeType,
        bytes: req.bytes,
        folder,
        storageProvider: ticket.storageProvider,
        scanStatus: "clean",
      },
    });

    return {
      mediaId: media.id,
      objectKey,
      publicUrl: ticket.publicUrl,
      uploadUrl: ticket.uploadUrl,
      headers: ticket.headers,
    };
  }

  /**
   * List media with pagination, filters, and access controls
   */
  static async listMedia(opts: ListMediaOptions) {
    const page = Math.max(1, opts.page || 1);
    const limit = Math.min(100, Math.max(1, opts.limit || 24));
    const skip = (page - 1) * limit;

    const where: Prisma.MediaWhereInput = {};

    // Multi-tenant authorization
    if (!opts.isAdminOrMod) {
      if (!opts.userId) {
        return { items: [], total: 0, page: 1, totalPages: 0, folders: ["/"], storageBytes: 0 };
      }
      where.ownerId = opts.userId;
    }

    // Soft-deletion filter
    if (opts.showDeleted) {
      where.deletedAt = { not: null };
    } else {
      where.deletedAt = null;
    }

    // Folder filter
    if (opts.folder && opts.folder !== "all") {
      where.folder = opts.folder;
    }

    // Search query
    if (opts.search?.trim()) {
      const q = opts.search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { fileName: { contains: q, mode: "insensitive" } },
        { altText: { contains: q, mode: "insensitive" } },
      ];
    }

    // MIME group filter
    if (opts.mimeGroup === "image") {
      where.mimeType = { startsWith: "image/" };
    } else if (opts.mimeGroup === "document") {
      where.mimeType = {
        in: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      };
    }

    // Listing association filter
    if (opts.listingId) {
      where.listingId = opts.listingId;
    }

    // Parallel execution for items, total count, folders, and storage bytes
    const [items, total, distinctFolders, storageAggregate] = await Promise.all([
      db.media.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          listing: {
            select: { id: true, title: true, slug: true },
          },
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      db.media.count({ where }),
      db.media.findMany({
        where: opts.isAdminOrMod ? { deletedAt: null } : { ownerId: opts.userId || "", deletedAt: null },
        select: { folder: true },
        distinct: ["folder"],
      }),
      db.media.aggregate({
        where: opts.isAdminOrMod ? { deletedAt: null } : { ownerId: opts.userId || "", deletedAt: null },
        _sum: { bytes: true },
        _count: true,
      }),
    ]);

    const folderSet = new Set<string>(["/"]);
    distinctFolders.forEach((f) => {
      if (f.folder) folderSet.add(f.folder);
    });

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      folders: Array.from(folderSet).sort(),
      storageBytes: storageAggregate._sum.bytes || 0,
      totalActiveAssets: storageAggregate._count || 0,
    };
  }

  /**
   * Update media metadata
   */
  static async updateMetadata(
    id: string,
    userId: string,
    isAdminOrMod: boolean,
    data: {
      title?: string;
      altText?: string;
      folder?: string;
      tags?: string[];
    }
  ) {
    const existing = await db.media.findUnique({ where: { id } });
    if (!existing) throw new Error("Media asset not found.");

    if (!isAdminOrMod && existing.ownerId !== userId) {
      throw new Error("Unauthorized to modify this asset.");
    }

    let cleanFolder = existing.folder;
    if (data.folder !== undefined) {
      cleanFolder = "/" + data.folder.trim().replace(/^[\/\\]+|[\/\\]+$/g, "").replace(/\.\./g, "");
    }

    return db.media.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title : existing.title,
        altText: data.altText !== undefined ? data.altText : existing.altText,
        folder: cleanFolder,
        tags: data.tags !== undefined ? data.tags : existing.tags,
      },
    });
  }

  /**
   * Move batch of media items into a target folder
   */
  static async moveFolder(
    ids: string[],
    targetFolder: string,
    userId: string,
    isAdminOrMod: boolean
  ) {
    if (!ids.length) return 0;

    const cleanFolder = "/" + targetFolder.trim().replace(/^[\/\\]+|[\/\\]+$/g, "").replace(/\.\./g, "");

    const where: Prisma.MediaWhereInput = {
      id: { in: ids },
    };

    if (!isAdminOrMod) {
      where.ownerId = userId;
    }

    const res = await db.media.updateMany({
      where,
      data: { folder: cleanFolder },
    });

    return res.count;
  }

  /**
   * Soft-delete or permanently purge a media item
   */
  static async deleteMedia(
    id: string,
    userId: string,
    isAdminOrMod: boolean,
    permanent: boolean = false
  ) {
    const existing = await db.media.findUnique({ where: { id } });
    if (!existing) throw new Error("Media asset not found.");

    if (!isAdminOrMod && existing.ownerId !== userId) {
      throw new Error("Unauthorized to delete this asset.");
    }

    if (!permanent) {
      // Soft-delete: Move to trash
      return db.media.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    }

    // Permanent delete: remove storage object and DB record
    const driver = getStorageDriver();
    await driver.deleteObject(existing.key);

    return db.media.delete({
      where: { id },
    });
  }

  /**
   * Bulk soft-delete or permanent purge
   */
  static async bulkDeleteMedia(
    ids: string[],
    userId: string,
    isAdminOrMod: boolean,
    permanent: boolean = false
  ) {
    if (!ids.length) return 0;

    const where: Prisma.MediaWhereInput = {
      id: { in: ids },
    };

    if (!isAdminOrMod) {
      where.ownerId = userId;
    }

    if (!permanent) {
      const res = await db.media.updateMany({
        where,
        data: { deletedAt: new Date() },
      });
      return res.count;
    }

    // Find all matching to delete storage objects
    const records = await db.media.findMany({
      where,
      select: { id: true, key: true },
    });

    const driver = getStorageDriver();
    await driver.bulkDeleteObjects(records.map((r) => r.key));

    const res = await db.media.deleteMany({
      where: { id: { in: records.map((r) => r.id) } },
    });

    return res.count;
  }

  /**
   * Restore soft-deleted media from trash
   */
  static async restoreMedia(ids: string[], userId: string, isAdminOrMod: boolean) {
    if (!ids.length) return 0;

    const where: Prisma.MediaWhereInput = {
      id: { in: ids },
      deletedAt: { not: null },
    };

    if (!isAdminOrMod) {
      where.ownerId = userId;
    }

    const res = await db.media.updateMany({
      where,
      data: { deletedAt: null },
    });

    return res.count;
  }

  /**
   * Get storage usage statistics
   */
  static async getStorageStats(userId?: string | null, isAdminOrMod: boolean = false) {
    const where: Prisma.MediaWhereInput = { deletedAt: null };

    if (!isAdminOrMod && userId) {
      where.ownerId = userId;
    }

    const [totalActive, trashCount, aggregate] = await Promise.all([
      db.media.count({ where }),
      db.media.count({
        where: {
          deletedAt: { not: null },
          ...(!isAdminOrMod && userId ? { ownerId: userId } : {}),
        },
      }),
      db.media.aggregate({
        where,
        _sum: { bytes: true },
      }),
    ]);

    const totalBytes = aggregate._sum.bytes || 0;

    return {
      totalActive,
      trashCount,
      totalBytes,
      totalMB: Math.round((totalBytes / (1024 * 1024)) * 100) / 100,
    };
  }
}
