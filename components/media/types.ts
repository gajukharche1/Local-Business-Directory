export interface MediaItem {
  id: string;
  title: string | null;
  fileName: string | null;
  key: string;
  url: string;
  thumbnailUrl: string | null;
  mimeType: string;
  bytes: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  folder: string;
  tags: string[];
  storageProvider: string;
  scanStatus: string;
  deletedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  ownerId: string | null;
  listingId: string | null;
  listing?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  owner?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

export interface MediaStorageStats {
  totalActive: number;
  trashCount: number;
  totalBytes: number;
  totalMB: number;
}
