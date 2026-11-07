# Development Plan: Admin Dashboard & Site Settings

## 1. Overview
The **Dashboard & Site Settings** module allows administrators to dynamically manage the directory's branding, admin interface identity, and minor operational settings from a centralized interface at `/admin/settings`.

This resolves hardcoded values such as the `<Your Business Name>` placeholder in `app/(admin)/admin/page.tsx` and the hardcoded `Pimple Saudagar` / `PS` logo initials in the admin navigation sidebar in `app/(admin)/admin/layout.tsx`.

---

## 2. Scope & Features

### A. Dynamic Identity & Branding
- **Website / Directory Name**: Configurable main directory name (e.g. *Pimple Saudagar Local Directory* or custom name).
- **Admin Dashboard Title**: Configurable subtitle displayed under the brand badge in the admin sidebar.
- **Logo Badge Initials**: 2-4 character shortcode (e.g. *PS*) for the header badge and mobile icons.
- **Site Tagline / Description**: Displayed in the admin overview header and available across metadata.

### B. Directory Governance & Minor Controls
- **Public Submissions Toggle**: Enable or disable new public business submissions (`/submit`).
- **Review Moderation Toggle**: Automatically publish user reviews or require moderator review before publishing.
- **Listing Claim Requests Toggle**: Enable or disable business ownership claim submissions.
- **Announcement Banner**: Optional alert banner message with active/inactive toggle displayed across the directory.

### C. Contact & Regional Details
- **Primary Support Email**: Contact email for listing alerts and user notifications.
- **Primary Support Phone**: Helpline / WhatsApp support number.
- **Primary Locality / City**: Default geographic scope (e.g. *Pimple Saudagar, PCMC, Pune*).

---

## 3. Architecture & Technical Design

### Data Persistence (`prisma/schema.prisma`)
A lightweight, flexible key-value model stored in PostgreSQL:
```prisma
model SiteSetting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String   @db.Text
  group     String   @default("general")
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())

  @@index([group])
  @@map("site_settings")
}
```

### Service Layer (`lib/services/settings.service.ts`)
- **Default Fallback Strategy**: Provides safe, pre-configured defaults if database rows do not exist or during offline local development.
- **Cache-Optimized Reads**: Uses Next.js data caching mechanisms for sub-millisecond retrieval on server renders.
- **Batch Updates**: Type-safe updates of multiple key-value pairs in a single transaction.

### Server Actions (`actions/settings.ts`)
- **Security & Authorization**: Enforces role-based access control with `assertAuthorized(user, UserRole.admin)`.
- **Validation**: Enforces type and string length constraints with Zod.
- **Revalidation**: Invalidates `/admin`, `/admin/settings`, and `/` via `revalidatePath` to immediately reflect updates across all active views.

### UI Components (`app/(admin)/admin/settings/`)
- `page.tsx`: Server Component verifying authorization and fetching current values.
- `settings-form.tsx`: Responsive client component utilizing React 19 transitions, accessible fieldsets, live preview badge, and status toast notifications.

---

## 4. Implementation Steps (Action Items)

- [x] **Step 1: Database Model & Prisma Client**
  - Add `SiteSetting` model to `prisma/schema.prisma`.
  - Run `prisma generate` to update Prisma Client types.
  
- [x] **Step 2: Settings Service Layer**
  - Create `lib/services/settings.service.ts` with typed defaults, safe fallback error handling, and query helpers.

- [x] **Step 3: Server Action & RBAC**
  - Create `actions/settings.ts` with input validation, admin permission guard, and path revalidation.

- [x] **Step 4: Frontend Settings Form Component**
  - Build `app/(admin)/admin/settings/settings-form.tsx` with tabs/cards for Branding, Operations, and Region/Contact info.
  - Implement instant live preview for branding badge & title.

- [x] **Step 5: Admin Settings Page**
  - Build `app/(admin)/admin/settings/page.tsx` integrating breadcrumbs, description, and the settings form.

- [x] **Step 6: Sidebar & Navigation Integration**
  - Update `app/(admin)/admin/layout.tsx` to add "Settings" to the sidebar navigation.
  - Replace static `Pimple Saudagar` and `PS` sidebar header with dynamic values from the settings service.

- [x] **Step 7: Admin Dashboard Overview Integration**
  - Update `app/(admin)/admin/page.tsx` to dynamically render the configured site name in place of `<Your Business Name>`.

- [x] **Step 8: Verification & Quality Assurance**
  - Run TypeScript verification (`npx tsc --noEmit`).
  - Verify error handling and fallback resilience when offline.

---

## 5. Verification & Safety Criteria
- Zero regression to existing admin features (Moderation, Listings, Categories, Locations, CSV Imports).
- Offline robustness: Pages render cleanly with defaults if the database is temporarily unreachable.
- Security: Strictly restricted to users with `admin` role.
