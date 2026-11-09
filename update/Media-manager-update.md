# Technical Specification & Implementation Plan: Enterprise Media File Manager

> **Role**: Senior Backend Architect (`/agency-backend-architect`)  
> **Status**: APPROVED ARCHITECTURE SPECIFICATION  
> **Target Branch**: `feature/media-manager`  
> **Applicable Standards**: OWASP ASVS Level 2, 12-Factor App, Clean Architecture, Next.js 16.4 (Turbopack) & React 19

---

## 1. Executive Summary & Core Objectives

The Local Business Directory requires an enterprise-grade, centralized **Media File Manager** to replace decentralized, one-off file upload mechanisms. The Media Manager provides a unified asset management pipeline for both system administrators and business owners, ensuring strict multi-tenant isolation, high-performance asset retrieval, quota enforcement, and direct-to-cloud presigned storage streaming.

### Core Objectives:
1. **Centralized Media Asset Library**:
   - **Admin Media Console** (`/admin/media`): Global directory-wide visibility into all uploaded assets across listings, categories, locations, and user profiles with moderation, quarantine, and audit capabilities.
   - **Owner Media Hub** (`/dashboard/media`): Tenant-isolated workspace where business owners organize store photos, menu scans, and banners into structured folders, re-using assets without redundant uploads.
2. **Reusable Media Picker Modal (`MediaPickerModal`)**:
   - Universal component seamlessly integrated into Listing Creation/Edit forms (`components/forms/image-upload.tsx`), Category icon/banner editors, and Location cover uploaders.
3. **Resilient Direct Storage Pipeline**:
   - Direct-to-storage presigned upload flow (Cloudflare R2 / AWS S3 / MinIO) eliminating serverless execution timeouts and memory exhaustion caused by multi-megabyte payload buffers.
   - Local development fallback mode (`/public/uploads/`) with strict path-traversal guards and MIME verification.
4. **Asset Governance & Taxonomy**:
   - Hierarchical virtual folders (`/listings`, `/branding`, `/menus`, `/proofs`), tag taxonomy, soft-deletion lifecycle (Recycle Bin with 30-day purge), and transactional bulk operations (move, delete, export).
5. **Security & Plan Quota Enforcement**:
   - ASVS Level 2 compliant MIME validation and magic byte inspection.
   - Storage quota validation based on `PricingPlan.maxPhotos` and account-level byte budgets.

---

## 2. Storage & System Architecture

```
                                  [ BROWSER CLIENT ]
                                    /            \
              1. Request Upload Ticket             3. Direct PUT with Presigned URL
              (Metadata, MIME, Size)               (Bypasses Next.js Server)
                                  /                \
                                 v                  v
                   [ NEXT.JS APP ROUTER ]    [ OBJECT STORAGE: R2 / S3 ]
                   (Validates Auth & Quota)         |
                                 |                  |
                       2. Return Ticket & URL       |
                                 |                  |
                                 +--------+---------+
                                          |
                              4. Confirm Upload & Metadata
                                          |
                                          v
                                [ POSTGRESQL / PRISMA ]
                                (Media Record Active)
```

### A. Storage Driver Abstraction (`lib/storage/driver.ts`)
The application defines a unified storage interface decoupling business logic from underlying storage providers:
- `S3StorageDriver`: For Cloudflare R2 and AWS S3 in staging/production.
- `LocalStorageDriver`: For zero-dependency local development writing to `public/uploads/`.
- Capability matrix:
  - `generatePresignedUploadUrl(key, mimeType, maxBytes, expiresInSeconds)`
  - `deleteObject(key)`
  - `bulkDeleteObjects(keys[])`
  - `getPublicUrl(key)`

### B. Object Key Structure & Invariants
Keys must be collision-proof, URL-safe, and tenant-scoped:
- **Tenant Scope**: `media/{ownerId}/{folder}/{timestamp}-{randomBytes(6)}.{ext}`
- **System Scope (Admin)**: `media/system/{folder}/{timestamp}-{randomBytes(6)}.{ext}`
- Invariant: Object keys never expose original untrusted client file names directly on the filesystem.

---

## 3. Database Schema Evolution (`prisma/schema.prisma`)

### A. Schema Enhancements to `model Media`
Extend the existing `Media` entity to support folder taxonomy, friendly titles, storage provider classification, soft-deletes, and global entity associations:

```prisma
enum StorageProvider {
  r2
  s3
  local
}

enum MediaScanStatus {
  pending
  clean
  infected
  quarantined
}

model Media {
  id              String          @id @default(cuid())
  ownerId         String?
  listingId       String?
  categoryId      String?         // Direct association for category banner/icon
  locationId      String?         // Direct association for location cover image
  
  title           String?         // Human-friendly title
  fileName        String          // Original sanitized file name
  key             String          @unique // Storage object key
  url             String          // Public CDN or relative serving URL
  thumbnailUrl    String?         // Generated or optimized thumb URL
  mimeType        String
  bytes           Int             // File size in bytes
  width           Int?
  height          Int?
  altText         String?         // Crucial for SEO and a11y
  
  folder          String          @default("/") // Virtual path, e.g. "/storefront"
  tags            String[]        @default([])
  storageProvider StorageProvider @default(r2)
  scanStatus      MediaScanStatus @default(clean)
  
  deletedAt       DateTime?       // Soft-deletion timestamp for recycle bin
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  // Relational mappings
  owner           User?           @relation(fields: [ownerId], references: [id], onDelete: SetNull)
  listing         Listing?        @relation(fields: [listingId], references: [id], onDelete: SetNull)
  category        Category?       @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  location        Location?       @relation(fields: [locationId], references: [id], onDelete: SetNull)

  // Query performance indices (Sub-15ms target)
  @@index([ownerId, folder, deletedAt])
  @@index([listingId, deletedAt])
  @@index([categoryId])
  @@index([locationId])
  @@index([mimeType])
  @@index([createdAt])
  @@map("media")
}
```

### B. Migration Strategy
1. The migration adds nullable fields and sensible defaults (`folder: "/"`, `tags: []`, `storageProvider: "r2"`).
2. Existing `media` rows retain full backward compatibility without data truncation.

---

## 4. Backend Actions & Service Layer API Contract

All operations are encapsulated in `actions/media.ts` backed by `lib/services/media.service.ts` with strict Zod validation and session authorization.

### A. Core Server Actions (`actions/media.ts`)

#### 1. `listMediaAction(query: ListMediaQuery)`
- **Permissions**:
  - `admin` / `moderator`: Can query all media or filter by `ownerId`.
  - `owner` / `visitor`: Strictly scoped to `ownerId === session.userId`.
- **Query Filters**: `folder`, `search`, `mimeGroup` (`image` | `document`), `listingId`, `showDeleted` (trash bin), `page`, `limit` (default: 24, max: 100).
- **Performance**: Cursor-based pagination with indexed keyset fallback; returns items count and folder tree summary.

#### 2. `createMediaUploadTicketAction(input: UploadTicketInput)`
- **Validations**:
  - Validates MIME type against whitelist: `image/jpeg`, `image/png`, `image/webp`, `image/avif`, `image/svg+xml`, `application/pdf`.
  - Validates file size (max 5MB for images, 10MB for verification documents).
  - Validates user quota: checks total photos and storage limits against active `PricingPlan`.
- **Response**:
  ```ts
  {
    success: true,
    mediaId: string,
    key: string,
    uploadUrl: string, // Presigned S3 PUT URL or Local API direct route
    publicUrl: string,
    headers?: Record<string, string>
  }
  ```

#### 3. `confirmMediaUploadAction(mediaId: string, metadata: { width?: number; height?: number })`
- Verifies object existence in storage, updates dimensions, marks status as `clean`, and triggers cache invalidation.

#### 4. `updateMediaMetadataAction(id: string, data: UpdateMediaInput)`
- Updates `title`, `altText`, `folder`, and `tags`.
- Invariant: User must be owner or system admin.

#### 5. `moveMediaFolderAction(ids: string[], targetFolder: string)`
- Batch moves assets to `targetFolder` in a single database transaction. Sanitizes target folder path (e.g. `/listings/interior`).

#### 6. `deleteMediaAction(id: string, permanent: boolean = false)`
- **Soft Delete (`permanent: false`)**: Sets `deletedAt = new Date()`. Item moves to Trash Bin.
- **Permanent Purge (`permanent: true`)**:
  - Admin or owner triggers permanent purge.
  - Deletes record in PostgreSQL.
  - Asynchronously purges physical object from Cloudflare R2 / S3 bucket or local disk.

#### 7. `bulkDeleteMediaAction(ids: string[], permanent: boolean = false)`
- Batch operation executing within `db.$transaction` with bulk storage purge.

#### 8. `getMediaStorageStatsAction()`
- Returns total assets, total bytes consumed, available quota, and breakdown by MIME type.

---

## 5. UI / UX Design & Component Architecture

Adhering strictly to `/design-system`, `/ui-skills`, and standard tokens (`bg-card`, `border-border/70`, `rounded-2xl`, `tabular-nums`):

### A. Application Route Hierarchy
```
app/
├── (admin)/admin/media/
│   ├── page.tsx                     # Admin Global Media Console
│   └── loading.tsx                  # Instant skeleton grid
├── (account)/dashboard/media/
│   ├── page.tsx                     # Merchant Tenant Media Manager
│   └── loading.tsx
```

### B. Component Library Breakdown (`components/media/`)
1. **`media-manager.tsx` (Client Root Component)**:
   - Houses state for active folder, selection set, view mode (`grid` vs `list`), search filter, and active inspector item.
2. **`media-folder-tree.tsx`**:
   - Collapsible hierarchical folder tree (`/`, `/listings`, `/covers`, `/menus`, `/trash`).
   - Supports creating new folders, folder item counts, and drag-and-drop target highlighting.
3. **`media-grid.tsx` & `media-card.tsx`**:
   - Responsive multi-column layout (`grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4`).
   - Image preview with aspect-square preservation, file type badge, file size in `font-mono text-xs`, and selection checkbox.
   - Hover quick actions: Preview, Copy URL, Info Drawer, Delete.
4. **`media-table.tsx`**:
   - Columnar tabular view (`Name`, `Preview`, `Folder`, `Size`, `Dimensions`, `Date`, `Actions`) for bulk data management.
5. **`media-details-drawer.tsx`**:
   - Slide-over inspector panel:
     - High-resolution interactive preview.
     - 1-click Copy Public URL with toast feedback.
     - Direct editing for `Title` and `Alt Text` (with instant auto-save).
     - Relational usage badge (e.g. "Attached to: *Green Valley Cafe*").
     - Metadata chips: Dimensions (`1920x1080`), Format (`image/webp`), File Size (`1.2 MB`), Created date.
6. **`media-uploader-dropzone.tsx`**:
   - Drag-and-drop multi-file upload zone with clipboard paste support (`Ctrl+V`).
   - Per-file progress bars, instant preview generation, and batch upload queueing with concurrent limit (max 3 parallel uploads).
7. **`media-picker-modal.tsx` (Universal Selector)**:
   - Dialog overlay with tabs: **"Upload New"** and **"Choose from Library"**.
   - Search & folder filter within modal.
   - Single or multi-select mode with callback `onSelect(media: MediaItem[])`.
   - Seamlessly integrated into `components/forms/image-upload.tsx`.

---

## 6. Navigation Integration

### Admin Sidebar & Nav (`app/(admin)/admin/admin-sidebar.tsx` & `admin-nav.tsx`)
- Add **"Media Library"** with `image` icon under management items in `AdminLayout`:
  ```ts
  { label: "Media Library", href: "/admin/media", icon: "image" }
  ```

### Dashboard Sidebar (`components/dashboard/dashboard-sidebar.tsx`)
- Add **"Media Files"** with `image` icon for business owners:
  ```ts
  { label: "Media Files", href: "/dashboard/media", icon: "image" }
  ```

---

## 7. Security, Quota & Performance Invariants

1. **Path Traversal Protection**:
   - Folder paths are sanitized to prevent `../` directory traversal attacks. Folders match regex `^\/([a-zA-Z0-9_-]+\/?)*$`.
2. **File Name Sanitization**:
   - All client-provided file names are sanitized: special characters, spaces, and path delimiters stripped; random hash appended to guarantee uniqueness.
3. **MIME Verification**:
   - Files validated on both client and server. Only authorized image and document formats are accepted.
4. **Memory Hygiene**:
   - Direct presigned URLs prevent multi-megabyte buffers from residing in Next.js Serverless Function RAM.
5. **Sub-20ms Query Execution**:
   - Database queries utilize composite indexes on `(ownerId, folder, deletedAt)` and keyset pagination.

---

## 8. Implementation Checklist & Phase Rollout

### Phase 1: Storage Driver & Database Schema
- [x] Extend `prisma/schema.prisma` with `folder`, `tags`, `storageProvider`, `deletedAt`, `title`, and associated indexes.
- [x] Run `npx prisma db push` (or generate migration) to apply schema changes to PostgreSQL.
- [x] Implement `lib/storage/driver.ts` supporting `S3StorageDriver` (Cloudflare R2 / AWS S3) and `LocalStorageDriver`.

### Phase 2: Backend Services & Server Actions
- [x] Refactor and enhance `lib/services/media.service.ts` for folder operations, quota calculation, and direct presigned ticket generation.
- [x] Create `actions/media.ts` with complete CRUD actions (`listMediaAction`, `createMediaUploadTicketAction`, `updateMediaMetadataAction`, `moveMediaFolderAction`, `deleteMediaAction`, `bulkDeleteMediaAction`, `restoreMediaAction`, `getMediaStorageStatsAction`).
- [x] Multi-tenant isolation verified (business owners strictly restricted to own assets; moderators/admins have global governance).

### Phase 3: Core Media UI Components
- [x] Build `components/media/media-manager.tsx` (view mode switch, folder navigation, bulk selection toolbar).
- [x] Build `components/media/media-grid.tsx` with high-density card layout, quick hover actions, and selection controls.
- [x] Build `components/media/media-table.tsx` for columnar list view.
- [x] Build `components/media/media-details-drawer.tsx` for asset inspection, 1-click URL copy, and alt-text SEO editing.
- [x] Build `components/media/media-uploader-dropzone.tsx` with folder assignment and batch uploading.
- [x] Build `components/media/media-picker-modal.tsx` for universal asset selection across forms.

### Phase 4: Admin & Dashboard Pages
- [x] Create Admin route `app/(admin)/admin/media/page.tsx` with global search and storage health stats.
- [x] Create Dashboard route `app/(account)/dashboard/media/page.tsx` with owner quota widgets.
- [x] Update `AdminSidebar` / `AdminNav` and `DashboardSidebar` with dedicated navigation links and Lucide icons.

### Phase 5: Form Integration & Final Verification
- [x] Integrate `MediaPickerModal` into `components/forms/image-upload.tsx` so users can choose existing media or upload new ones.
- [x] Verify local upload fallback and test R2/S3 compatibility.
- [x] Run `npm run typecheck` (`tsc --noEmit`) and verify 0 errors.
- [x] Verify build via `npx next build --turbopack` (all 42 routes compiled and verified).
