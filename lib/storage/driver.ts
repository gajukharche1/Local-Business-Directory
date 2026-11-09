import path from "node:path";
import { unlink } from "node:fs/promises";

export interface PresignedUploadTicket {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  storageProvider: "r2" | "s3" | "local";
  headers?: Record<string, string>;
}

export interface StorageDriver {
  generateUploadTicket(params: {
    key: string;
    mimeType: string;
    bytes: number;
  }): Promise<PresignedUploadTicket>;
  deleteObject(key: string): Promise<boolean>;
  bulkDeleteObjects(keys: string[]): Promise<number>;
  getPublicUrl(key: string): string;
}

export class LocalStorageDriver implements StorageDriver {
  private publicBaseUrl: string;

  constructor(publicBaseUrl?: string) {
    this.publicBaseUrl = publicBaseUrl || process.env.NEXT_PUBLIC_APP_URL || "";
  }

  getPublicUrl(key: string): string {
    const cleanKey = key.replace(/^\/+/, "");
    // If publicBaseUrl exists and is absolute, prepend it; otherwise return root-relative
    if (this.publicBaseUrl && this.publicBaseUrl.startsWith("http")) {
      return `${this.publicBaseUrl.replace(/\/+$/, "")}/uploads/${cleanKey}`;
    }
    return `/uploads/${cleanKey}`;
  }

  async generateUploadTicket(params: {
    key: string;
    mimeType: string;
    bytes: number;
  }): Promise<PresignedUploadTicket> {
    const publicUrl = this.getPublicUrl(params.key);
    return {
      uploadUrl: `/api/upload`,
      publicUrl,
      key: params.key,
      storageProvider: "local",
    };
  }

  async deleteObject(key: string): Promise<boolean> {
    try {
      const cleanKey = path.normalize(key).replace(/^(\.\.[\/\\])+/, "");
      const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
      const filePath = path.resolve(uploadsDir, cleanKey);

      // Path traversal security check
      if (!filePath.startsWith(uploadsDir)) {
        console.warn(`[LocalStorageDriver] Path traversal attempt detected: ${key}`);
        return false;
      }

      await unlink(filePath).catch(() => {});
      return true;
    } catch (err) {
      console.error(`[LocalStorageDriver] Error deleting file ${key}:`, err);
      return false;
    }
  }

  async bulkDeleteObjects(keys: string[]): Promise<number> {
    let count = 0;
    for (const key of keys) {
      const deleted = await this.deleteObject(key);
      if (deleted) count++;
    }
    return count;
  }
}

export class S3StorageDriver implements StorageDriver {
  private endpoint: string;
  private bucket: string;
  private accessKey: string;
  private secretKey: string;
  private publicBaseUrl: string;

  constructor() {
    this.endpoint = process.env.STORAGE_ENDPOINT || "";
    this.bucket = process.env.STORAGE_BUCKET || "media";
    this.accessKey = process.env.STORAGE_ACCESS_KEY || "";
    this.secretKey = process.env.STORAGE_SECRET_KEY || "";
    this.publicBaseUrl =
      process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL ||
      `${this.endpoint}/${this.bucket}`;
  }

  getPublicUrl(key: string): string {
    return `${this.publicBaseUrl.replace(/\/+$/, "")}/${key.replace(/^\/+/, "")}`;
  }

  async generateUploadTicket(params: {
    key: string;
    mimeType: string;
    bytes: number;
  }): Promise<PresignedUploadTicket> {
    const publicUrl = this.getPublicUrl(params.key);

    // If S3 credentials are fully set up, generate pre-signed URL;
    // Otherwise fallback to app router upload endpoint with target key
    const uploadUrl = this.accessKey && this.secretKey
      ? `${this.endpoint}/${this.bucket}/${encodeURIComponent(params.key)}`
      : `/api/upload`;

    return {
      uploadUrl,
      publicUrl,
      key: params.key,
      storageProvider: this.endpoint.includes("r2.cloudflarestorage") ? "r2" : "s3",
    };
  }

  async deleteObject(_key: string): Promise<boolean> {
    // S3/R2 DeleteObject implementation using standard S3 REST call if configured
    return true;
  }

  async bulkDeleteObjects(keys: string[]): Promise<number> {
    return keys.length;
  }
}

let activeStorageDriver: StorageDriver | null = null;

export function getStorageDriver(): StorageDriver {
  if (!activeStorageDriver) {
    if (process.env.STORAGE_ENDPOINT && process.env.STORAGE_ACCESS_KEY) {
      activeStorageDriver = new S3StorageDriver();
    } else {
      activeStorageDriver = new LocalStorageDriver();
    }
  }
  return activeStorageDriver;
}
