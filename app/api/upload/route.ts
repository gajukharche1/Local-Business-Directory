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
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const listingId = formData.get("listingId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES[file.type]) {
      return NextResponse.json(
        { error: "Unsupported image format. Allowed formats: JPG, PNG, WebP, AVIF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image file exceeds the 5MB size limit." },
        { status: 400 }
      );
    }

    const ext = ALLOWED_MIME_TYPES[file.type];
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .replace(/\.[^/.]+$/, "");
    const fileName = `${Date.now()}-${uniqueId}-${sanitizedName}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    let publicUrl = "";

    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "listings");
      await mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, fileName);
      await writeFile(filePath, buffer);
      publicUrl = `/uploads/listings/${fileName}`;
    } catch {
      // Fallback for serverless environments (e.g. Vercel read-only filesystem)
      publicUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
    }

    const objectKey = `listings/${fileName}`;

    let mediaId: string | null = null;

    // If listingId provided or owner known, create media record in db
    if (listingId) {
      const media = await db.media.create({
        data: {
          listingId,
          ownerId: user?.id || null,
          key: objectKey,
          url: publicUrl,
          mimeType: file.type,
          bytes: file.size,
          scanStatus: "clean",
          altText: file.name,
        },
      });
      mediaId = media.id;
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      key: objectKey,
      mediaId,
      name: file.name,
      size: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error("Upload handler error:", error);
    return NextResponse.json(
      { error: "Failed to upload image. Please try again." },
      { status: 500 }
    );
  }
}
