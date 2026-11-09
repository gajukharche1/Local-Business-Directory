import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import db from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
};

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const listingId = (formData.get("listingId") as string) || null;
    const categoryId = (formData.get("categoryId") as string) || null;
    const locationId = (formData.get("locationId") as string) || null;
    const rawFolder = (formData.get("folder") as string) || "/";
    const customTitle = (formData.get("title") as string) || null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES[file.type]) {
      return NextResponse.json(
        { error: "Unsupported format. Allowed formats: JPG, PNG, WebP, AVIF, SVG, PDF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds the 10MB size limit." },
        { status: 400 }
      );
    }

    // Sanitize folder path (e.g. "/" or "/listings" or "/covers")
    const folder = "/" + rawFolder.trim().replace(/^[\/\\]+|[\/\\]+$/g, "").replace(/\.\./g, "");

    const ext = ALLOWED_MIME_TYPES[file.type];
    const uniqueId = crypto.randomBytes(6).toString("hex");
    const sanitizedBase = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .replace(/\.[^/.]+$/, "");
    const fileName = `${Date.now()}-${uniqueId}-${sanitizedBase}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    let publicUrl = "";

    // Folder subpath for local storage
    const subPath = folder === "/" ? "" : folder.replace(/^\//, "");
    const uploadsDir = path.resolve(process.cwd(), "public", "uploads", subPath);

    try {
      await mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, fileName);
      await writeFile(filePath, buffer);
      publicUrl = subPath ? `/uploads/${subPath}/${fileName}` : `/uploads/${fileName}`;
    } catch (e) {
      console.warn("Filesystem write error, falling back to data URL:", e);
      publicUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
    }

    const objectKey = subPath ? `${subPath}/${fileName}` : fileName;

    // Persist media record in DB
    const media = await db.media.create({
      data: {
        title: customTitle || file.name.replace(/\.[^/.]+$/, ""),
        fileName: file.name,
        key: objectKey,
        url: publicUrl,
        thumbnailUrl: file.type.startsWith("image/") ? publicUrl : null,
        mimeType: file.type,
        bytes: file.size,
        folder,
        storageProvider: "local",
        scanStatus: "clean",
        altText: customTitle || file.name.replace(/\.[^/.]+$/, ""),
        ownerId: user?.id || null,
        listingId,
        categoryId,
        locationId,
      },
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      key: objectKey,
      mediaId: media.id,
      media,
      name: file.name,
      size: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error("Upload handler error:", error);
    return NextResponse.json(
      { error: "Failed to upload file. Please try again." },
      { status: 500 }
    );
  }
}
