# Development & Modernization Plan: Admin Dashboard & Site Settings

## 1. Overview
The **Dashboard & Site Settings** module allows administrators to dynamically manage the directory's branding, admin interface identity, and operational governance from a centralized interface at `/admin/settings`.

This document outlines the core architecture, data persistence, and the **modern UI/UX design overhaul** for the entire Admin Dashboard following modern design system principles (`agency-ui-designer` & `design-system` standards).

---

## 2. Design System Architecture & Invariants

### A. Token Architecture & Semantic Mapping
All interface elements map to consistent semantic primitives without random color values:
- **Brand & Accent**: `primary` (`bg-primary`, `text-primary-foreground`) with subtle hover states (`hover:bg-primary/90`).
- **Surface Elevation**:
  - Base: `bg-background`
  - Cards & Panels: `bg-card` with `border-border/60` and `shadow-card`
  - Inset & Active Indicators: `bg-muted/40` and `bg-primary/10`
- **Functional Semantics**:
  - **Success / Live**: Emerald (`text-emerald-600`, `bg-emerald-500/10`, `border-emerald-500/20`)
  - **Attention / Pending**: Amber (`text-amber-600`, `bg-amber-500/10`, `border-amber-500/20`)
  - **Security / Claims**: Indigo/Blue (`text-blue-600`, `bg-blue-500/10`, `border-blue-500/20`)
  - **Audience / Users**: Purple (`text-purple-600`, `bg-purple-500/10`, `border-purple-500/20`)
- **Concentric Radii**:
  - Container cards: `rounded-2xl` (16px)
  - Nested elements / inner panels: `rounded-xl` (12px)
  - Buttons / Controls: `rounded-lg` (8px)
  - Badges / Avatars: `rounded-full` or `rounded-lg` with concentric gap rules.

### B. Typography & Data Presentation
- **Headings**: Heavier weights (`font-bold`, `font-extrabold`), tighter letter tracking (`tracking-tight`) for high-contrast visual hierarchy.
- **Data & Numbers**: All metrics and counters use `font-mono tabular-nums font-extrabold` for clean columnar alignment.
- **Labels & UI Text**: Medium weight (`font-semibold`), legible sizing (`text-xs`, `text-sm`).
- **No Trend Slop**: No decorative fake metadata or faux-technical captions; clear, human-readable copy only.

### C. Chrome Stability
- Fixed-height top navigation (`h-14` / `h-16`) with stable flex layouts.
- Truncated text (`truncate`, `whitespace-nowrap`) prevents unexpected layout shifts when labels or user names change.
- Micro-interactions restrained to 150ms–200ms ease-out transitions.

---

## 3. UI/UX Modernization Checklist

- [ ] **1. Admin Sidebar & Top Chrome Overhaul (`layout.tsx` & `admin-nav.tsx`)**
  - Extract sidebar navigation to a Client Component (`admin-nav.tsx`) utilizing `usePathname()`.
  - Active route highlighting: Active tab receives soft accent background (`bg-primary/10 text-primary font-bold`), clean icon fill, and left accent border.
  - Refined Brand Avatar: Rounded-xl brand icon with subtle gradient and typography hierarchy.
  - User Status Capsule: Modern avatar circle with role badge and operational status pulse dot.
  - Header Upgrade: Live pulsing operational indicator ("ASVS Level 2 Guard Active"), live clock/date display, and quick moderation pill.

- [ ] **2. Dashboard Overview Re-imagination (`app/(admin)/admin/page.tsx`)**
  - **Hero Greeting**: Personalized welcome greeting ("Welcome back, {admin}") with dynamic system status pill and quick action buttons.
  - **KPI Metric Cards**:
    - High-polish cards with hover elevation (`hover:-translate-y-1 hover:shadow-lg transition-all duration-200`).
    - Dual-tone iconography with rounded-xl containers.
    - Real-time trend & status sub-badges (e.g., "Live in directory", "Awaiting verification").
    - Tabular numbers (`tabular-nums`) for crisp metric rendering.
  - **Moderation Queue Command Center**:
    - Interactive summary card showing breakdown of Pending Reviews, Pending Claims, and Pending Listings with distinct badges.
    - One-click CTA to open the moderation queue.
  - **Operations Quick Launchpad**:
    - 4-card quick action grid: *Add New Listing*, *Manage Categories*, *Review Claims*, *Site Settings*.
  - **System Health & Security Matrix**:
    - Visual indicators for Database connectivity, Media Storage status, Authentication policy, and Cache latency.

- [ ] **3. Settings Interface Beautification (`settings-form.tsx`)**
  - **Segmented Tab Navigation**: Switch smoothly between *Identity & Branding*, *Directory Governance*, *Regional & Contacts*, and *Announcement Banner*.
  - **Interactive Real-Time Simulation**: Live sidebar header preview matching the exact 1:1 redesigned sidebar dimensions and styling.
  - **Concentric Accessible Switches**: Smooth custom toggle switches with keyboard focus rings and ARIA support.
  - **Sticky Action Bar**: Prominent save and reset controls with animated pending state indicators.

---

## 4. Architecture & Technical Invariants

### Database (`prisma/schema.prisma`)
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

### Safe Fallback Service (`lib/services/settings.service.ts`)
- Returns `DEFAULT_SITE_SETTINGS` seamlessly if database queries fail or during offline development.
- Batch upsert logic handles updates in an interactive transaction with automatic cache busting.

### Server Actions (`actions/settings.ts`)
- Role-based authorization (`assertAuthorized(user, UserRole.admin)`).
- Zod schema input validation.
- Friendly error catching for missing database tables.

---

## 5. Completed Implementation Milestones

- [x] **Step 1: Database Model & Prisma Client**: Added `SiteSetting` and executed `prisma generate`.
- [x] **Step 2: Settings Service Layer**: Implemented `lib/services/settings.service.ts` with typed defaults.
- [x] **Step 3: Server Action**: Implemented `actions/settings.ts` with error handling and RBAC protection.
- [x] **Step 4: Settings Page & Form**: Built initial `page.tsx` and `settings-form.tsx`.
- [x] **Step 5: Database Push to Remote**: Pushed schema to remote database `db.prisma.io:5432`.
- [x] **Step 6: Git Merge & Vercel Deploy**: Merged to `main` and verified live deployment on `https://ps-lyart.vercel.app`.
- [x] **Step 7: Modern UI/UX Overhaul**: Applied modern design practices across sidebar (active navigation state with client component), header (operational pulse indicator), dashboard overview (KPI cards with tabular-nums and quick launchpad), and settings form (segmented tabs, accessible switches, 1:1 live preview).
