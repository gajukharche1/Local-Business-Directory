# UI Modernization & Shimmer Loading State Plan

## 1. Overview & Objective
This plan addresses two core user enhancements for the Admin Back-Office:
1. **Dribbble-Style Shimmer Loading States**: Interactive, high-polish skeleton loading states when clicking on **"All Listing"**, **"Add New Listing"**, **"Categories"**, and **"Locations"** (based on [Dribbble: Loading States Shimmer](https://dribbble.com/shots/3826035-Loading-States-Shimmer)).
2. **Listings View Overhaul (`app/(admin)/admin/listings/page.tsx`)**: Upgrading the older hardcoded `slate-*`/`red-*` styling to match our modern design system standards (semantic tokens, dark mode compatibility, Lucide icons, dual-tone status pill badges, and `tabular-nums` data presentation).

---

## 2. Technical Architecture & Design System Tokens

### A. Shimmer Effect Engine
Following the Dribbble design reference, skeleton elements will feature a flowing linear gradient wave that pulses across the content placeholders:
- **Base Skeleton Class**: `bg-muted/70 relative overflow-hidden rounded-md`
- **Shimmer Wave**: An animated pseudo-element traversing from `translateX(-100%)` to `translateX(100%)` with a soft translucent gradient highlight (`via-white/30 dark:via-white/5`).
- **CSS Keyframes**: Configured in `tailwind.config.ts` or `app/globals.css` with a smooth 1.8s ease-in-out cycle.

### B. Dual-Level Loading Feedback
1. **Micro Navigation Feedback (`admin-nav.tsx`)**:
   - Immediate feedback upon click: The clicked sidebar button shows an active transitioning pulse or mini-spinner so the user knows their action was immediately registered without lag.
   - Smooth top loading rail: A subtle indeterminate top loading bar across the main header during route transitions.
2. **Route-Level Next.js Streaming Suspense (`loading.tsx`)**:
   - `app/(admin)/admin/listings/loading.tsx`: Mirrors the listings table (filter tabs, search input, 6 table rows with avatar, title, category, status pill, and actions).
   - `app/(admin)/admin/listings/new/loading.tsx`: Mirrors the Add Listing form layout (section cards, input skeletons, photo uploader placeholder).
   - `app/(admin)/admin/categories/loading.tsx`: Mirrors the Category Manager tree and card grid.
   - `app/(admin)/admin/locations/loading.tsx`: Mirrors the Location Manager grid and metrics.
   - `app/(admin)/admin/loading.tsx`: Admin-wide root loading fallback.

### C. Listings Management Redesign Tokens
- **Surface Elevation**: `bg-card` containers with `border border-border/70` and `rounded-2xl` outer geometry.
- **Header & Metrics**: `font-bold tracking-tight text-foreground` with `font-mono tabular-nums` for counts and ratings.
- **Status Badges**:
  - `Published`: `bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20`
  - `Pending Review`: `bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20`
  - `Draft`: `bg-muted text-muted-foreground border-border/60`
  - `Rejected`: `bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20`
  - `Archived`: `bg-muted/80 text-muted-foreground border-border/40`
- **Actions & Controls**: Modern primary button (`bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl`), search bar with `focus:ring-2 focus:ring-primary/20`, and Lucide icons replacing inline SVGs.

---

## 3. Implementation Checklist

### Phase 1: Shimmer Animation Engine
- [x] Add `@keyframes shimmer` and `.animate-shimmer` / `bg-shimmer` utilities to `app/globals.css` / `tailwind.config.ts`.
- [x] Create reusable `<Skeleton>` primitive in `components/ui/skeleton.tsx` supporting standard and shimmer modes with arbitrary width/height.

### Phase 2: Route-Level Loading Skeletons (`loading.tsx`)
- [x] Implement `app/(admin)/admin/listings/loading.tsx` (Dribbble-style table skeleton).
- [x] Implement `app/(admin)/admin/listings/new/loading.tsx` (Form skeleton with tabs and input placeholders).
- [x] Implement `app/(admin)/admin/categories/loading.tsx` (Category manager card & tree skeleton).
- [x] Implement `app/(admin)/admin/locations/loading.tsx` (Location manager grid skeleton).
- [x] Implement `app/(admin)/admin/loading.tsx` (Root admin fallback).

### Phase 3: Immediate Navigation Feedback in `admin-nav.tsx`
- [x] Track pending navigation in `admin-nav.tsx` using route click state (`navigatingHref`).
- [x] Show subtle inline loader indicator (`Loader2` spinner & text) on clicked nav items during transition.
- [x] Ensure nested submenu toggling remains smooth and instant.

### Phase 4: Modernize `app/(admin)/admin/listings/page.tsx`
- [x] Replace `slate-*` hardcoded classes with semantic `bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`.
- [x] Replace inline raw SVGs with Lucide icons (`Search`, `PlusCircle`, `Upload`, `Star`, `MapPin`, `ExternalLink`, `Edit3`, `SlidersHorizontal`, `Phone`, `Building2`).
- [x] Redesign status filter tabs into a modern segmented control with active pill backgrounds.
- [x] Polish `ListingStatusSelect` component with semantic status pills and animated loading indicator.
- [x] Add empty state illustrations and `tabular-nums` formatting.

### Phase 5: Verification & Production Deployment
- [x] Run `npx tsc --noEmit` and `npm run build` to verify 0 errors (Verified - exit code 0).
- [x] Commit changes to `main` and sync with `Admin-Dashboard-UI`.
- [x] Deploy to Vercel production (`https://ps-lyart.vercel.app`) and verify live health.

