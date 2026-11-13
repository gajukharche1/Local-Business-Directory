# Bulk Select & Multi-Action Utility: UI Design Contract & Implementation Plan
**Document Version:** 1.0.0  
**Status:** SPECIFIED & READY FOR IMPLEMENTATION  
**Target Entities:** Admin Listings (`/admin/listings`), Categories (`/admin/categories`), Locations (`/admin/locations`)

---

## 1. Executive Summary & Purpose

The **Bulk Select & Multi-Action Utility** provides a unified, reusable, and accessible selection system across all administrative tabular data views in the Local Business Directory. It eliminates tedious row-by-row interactions by allowing administrators and moderators to select multiple entities via individual checkboxes, range-selection (Shift + Click), and "Select All" header controls, and perform high-leverage batch operations (status changes, featured flags, and cascade-safe deletions) with confirmation safeguards.

---

## 2. UI Design Contract (UI-SPEC)

### 2.1 Design System Tokens & Aesthetics
The components adhere to the project's Tailwind design tokens, supporting seamless light and dark mode rendering:

| Element | Light Mode Tokens | Dark Mode Tokens | Notes |
| :--- | :--- | :--- | :--- |
| **Floating Action Bar** | `bg-card/95 border-border/80 shadow-2xl backdrop-blur-md` | `bg-card/95 border-border/70 shadow-2xl backdrop-blur-md` | Sticky or floating dock at `bottom-6` |
| **Selection Counter Badge** | `bg-primary/10 text-primary border-primary/20` | `bg-primary/15 text-primary border-primary/30` | Pill badge with `font-mono font-bold text-xs` |
| **Checkbox (Checked)** | `bg-primary border-primary text-primary-foreground` | `bg-primary border-primary text-primary-foreground` | Accent colored with check icon |
| **Checkbox (Indeterminate)**| `bg-primary border-primary text-primary-foreground` | `bg-primary border-primary text-primary-foreground` | Minus/dash icon via DOM `.indeterminate = true` |
| **Row Highlight (Selected)** | `bg-primary/5 hover:bg-primary/10` | `bg-primary/10 hover:bg-primary/15` | Subtle tint indicating active selection |
| **Danger / Delete Action** | `bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground` | Same | Destructive styling for bulk deletions |
| **Divider / Separator** | `bg-border/80` | `bg-border/60` | Vertical divider separating action groups |

---

### 2.2 Reusable Component Architecture

```
components/ui/bulk-select/
├── use-bulk-select.ts          # Core generic selection hook (supports Shift+Click range & sets)
├── bulk-select-checkbox.tsx     # Accessible checkbox with native indeterminate support
├── bulk-select-toolbar.tsx      # Floating bottom action toolbar with transitions & actions slot
└── bulk-confirm-modal.tsx       # Safety confirmation modal for batch operations (especially delete)
```

#### A. Core Hook Interface: `useBulkSelect<T>`
```typescript
interface UseBulkSelectOptions<T> {
  items: T[];
  getItemId: (item: T) => string;
}

interface UseBulkSelectReturn<T> {
  selectedIds: Set<string>;
  selectedCount: number;
  selectedItems: T[];
  isSelected: (id: string) => boolean;
  isAllSelected: boolean;
  isPartiallySelected: boolean; // For indeterminate header checkbox
  toggle: (id: string, index?: number, event?: React.MouseEvent) => void;
  toggleAll: () => void;
  selectOnly: (id: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
}
```

#### B. Shift + Click Range Selection UX
- When a user clicks a row checkbox, the hook tracks `lastSelectedIndex`.
- When clicking another checkbox while holding `Shift`, all rows between `lastSelectedIndex` and the target index are automatically selected.
- Pressing `Escape` anywhere within the table or toolbar invokes `clearSelection()`.

#### C. Floating Action Bar Layout (`<BulkSelectToolbar />`)
- **Positioning**: Fixed floating dock positioned at `fixed bottom-6 left-1/2 -translate-x-1/2 z-40`.
- **Animation**: Smooth entry using `animate-in fade-in slide-in-from-bottom-4 duration-200`.
- **Contents**:
  1. **Selection Info**: `[X items selected]` counter pill + `Clear (Esc)` button.
  2. **Vertical Separator**: Visual divider.
  3. **Contextual Action Slots**: Children action buttons (e.g. status dropdown, toggle featured).
  4. **Destructive Action Slot**: Delete button with trash icon.

#### D. Batch Confirmation Modal (`<BulkConfirmModal />`)
- Appears before executing irreversible or impactful actions (such as `Bulk Delete`).
- Displays:
  - Exact count of items to be affected.
  - Warning about cascading relations (e.g. deleting categories that have listings, or deleting listings that have reviews).
  - Clear "Cancel" (`bg-muted`) and "Confirm [Action]" (`bg-destructive`) buttons with loading spinners.

#### E. Reusable Table Pagination (`<TablePagination />`)
- **Location**: `components/ui/bulk-select/table-pagination.tsx`
- **Page Size Presets**: **50**, **100**, and **500** items per page (customizable via prop).
- **Controls & Indicators**:
  1. **Results Counter**: `"Showing 1–50 of 320 records"` with tabular numbers.
  2. **Page Size Selector**: Dropdown / Select box offering `[50 per page, 100 per page, 500 per page]`.
  3. **Navigation**:
     - *First Page* (`<<`)
     - *Previous Page* (`< Previous`)
     - *Numeric Page Buttons* with active page pill (`1`, `2`, `3` ... `N`)
     - *Next Page* (`Next >`)
     - *Last Page* (`>>`)
  4. **Modes Supported**:
     - **Server Mode**: Updates URL search params (`page=1&limit=50`) with Next.js router for server-rendered queries (e.g. Listings).
     - **Client Mode**: Controlled callback `(page: number, pageSize: number) => void` for client-side state managers (e.g. Categories and Locations).

---

## 3. Screen-by-Screen Integration Specifications

### 3.1 Listings Management (`/admin/listings`)
- **File**: `app/(admin)/admin/listings/page.tsx` + `app/(admin)/admin/listings/admin-listings-table.tsx`
- **Pagination Strategy**: Server-side pagination via `page` and `limit` URL search parameters.
  - Page size options: **50** (default), **100**, and **500** records.
  - SQL query optimization: `skip: (page - 1) * limit`, `take: limit`.
  - Database count: `totalCount = await db.listing.count({ where: whereClause })`.
- **Table Column Structure**:
  - `Col 0 (w-10)`: Checkbox header (All) + Checkbox per row.
  - `Col 1`: Business Name & Category.
  - `Col 2`: Locality & Address.
  - `Col 3`: Rating & Reviews.
  - `Col 4`: Status (Individual `ListingStatusSelect`).
  - `Col 5`: Actions (Edit, View Public).
- **Available Bulk Actions**:
  1. **Change Status**:
     - *Publish Selected* (`published`)
     - *Set as Draft* (`draft`)
     - *Archive Selected* (`archived`)
     - *Reject Selected* (`rejected`)
  2. **Bulk Delete**:
     - Deletes selected listings with atomic cascading cleanup (categories junction, reviews, analytics).
  3. **Clear Selection**.

### 3.2 Category Management (`/admin/categories`)
- **File**: `app/(admin)/admin/categories/category-manager.tsx`
- **Pagination Strategy**: Client-side reactive pagination integrated with real-time search filtering.
  - Page size options: **50** (default), **100**, and **500** categories per page.
  - Page state (`currentPage`, `pageSize`): automatically resets to page 1 upon typing in search filter.
  - Slice calculation: `filteredCategories.slice((page - 1) * pageSize, page * pageSize)`.
- **Table Column Structure**:
  - `Col 0 (w-10)`: Checkbox header + Checkbox per row.
  - `Col 1`: Category & Slug URL.
  - `Col 2`: Parent Category.
  - `Col 3`: Listings Count.
  - `Col 4`: Featured on Home.
  - `Col 5`: SEO & Metadata.
  - `Col 6`: Actions (Edit, Delete).
- **Available Bulk Actions**:
  1. **Toggle Featured on Home**:
     - *Feature on Home Tab* (`featuredOnHome: true`)
     - *Remove from Home Tab* (`featuredOnHome: false`)
  2. **Bulk Delete**:
     - Safety check: Identifies if any selected category contains child subcategories or associated listings.
     - Confirms deletion via modal.
  3. **Clear Selection**.

### 3.3 Location Management (`/admin/locations`)
- **File**: `app/(admin)/admin/locations/location-manager.tsx`
- **Pagination Strategy**: Client-side reactive pagination integrated with real-time search filtering.
  - Page size options: **50** (default), **100**, and **500** locations per page.
  - Page state (`currentPage`, `pageSize`): resets to page 1 upon searching.
  - Slice calculation: `filteredLocations.slice((page - 1) * pageSize, page * pageSize)`.
- **Table Column Structure**:
  - `Col 0 (w-10)`: Checkbox header + Checkbox per row.
  - `Col 1`: Locality & URL.
  - `Col 2`: Parent Locality.
  - `Col 3`: Coordinates.
  - `Col 4`: Listings Count.
  - `Col 5`: Featured Status.
  - `Col 6`: SEO Metadata.
  - `Col 7`: Actions (Edit, Delete).
- **Available Bulk Actions**:
  1. **Toggle Featured**:
     - *Mark as Featured* (`featured: true`)
     - *Unfeature* (`featured: false`)
  2. **Bulk Delete**:
     - Confirms deletion via modal with safety check.
  3. **Clear Selection**.

---

## 4. Backend Server Actions Specification

### 4.1 Listings Bulk Actions (`actions/admin.ts`)
```typescript
// Bulk update status (published, draft, archived, rejected)
export async function bulkUpdateListingStatusAction(
  listingIds: string[],
  status: ListingStatus
): Promise<{ success: boolean; count?: number; error?: string }>

// Bulk delete listings
export async function bulkDeleteListingsAction(
  listingIds: string[]
): Promise<{ success: boolean; count?: number; error?: string }>
```
- **RBAC**: Requires `UserRole.moderator` for status changes; `UserRole.admin` for deletions.
- **Cache Invalidation**: Calls `revalidatePath("/admin/listings")`, `revalidatePath("/admin")`, `revalidatePath("/search")`, `revalidatePath("/")`.

### 4.2 Taxonomy Bulk Actions (`actions/taxonomy.ts`)
```typescript
// Categories bulk update
export async function bulkUpdateCategoriesAction(
  categoryIds: string[],
  data: { featuredOnHome?: boolean }
): Promise<{ success: boolean; count?: number; error?: string }>

// Categories bulk delete
export async function bulkDeleteCategoriesAction(
  categoryIds: string[]
): Promise<{ success: boolean; count?: number; error?: string }>

// Locations bulk update
export async function bulkUpdateLocationsAction(
  locationIds: string[],
  data: { featured?: boolean }
): Promise<{ success: boolean; count?: number; error?: string }>

// Locations bulk delete
export async function bulkDeleteLocationsAction(
  locationIds: string[]
): Promise<{ success: boolean; count?: number; error?: string }>
```
- **RBAC**: Requires `UserRole.moderator` for updates; `UserRole.admin` for deletions.
- **Cache Invalidation**: Revalidates `/admin/categories`, `/admin/locations`, and public archive paths.

---

## 5. Step-by-Step Implementation Tasks

### Wave 1: Core Selection & Pagination Utilities
- [x] **Task 1.1**: Create `lib/hooks/use-bulk-select.ts` with generic state management, shift-click range selection, and indeterminate logic.
- [x] **Task 1.2**: Create `components/ui/bulk-select/bulk-select-checkbox.tsx` with ref-based indeterminate visual rendering.
- [x] **Task 1.3**: Create `components/ui/bulk-select/bulk-select-toolbar.tsx` floating dock with badges, action buttons, and keyboard escape listeners.
- [x] **Task 1.4**: Create `components/ui/bulk-select/bulk-confirm-modal.tsx` for destructive action confirmations.
- [x] **Task 1.5**: Create `components/ui/bulk-select/table-pagination.tsx` reusable pagination component supporting 50, 100, 500 per page for both server-driven and client-driven tables.

### Wave 2: Backend Server Actions
- [x] **Task 2.1**: Add `bulkUpdateListingStatusAction` and `bulkDeleteListingsAction` to `actions/admin.ts`.
- [x] **Task 2.2**: Add `bulkUpdateCategoriesAction` and `bulkDeleteCategoriesAction` to `actions/taxonomy.ts`.
- [x] **Task 2.3**: Add `bulkUpdateLocationsAction` and `bulkDeleteLocationsAction` to `actions/taxonomy.ts`.

### Wave 3: Integration into Admin Views & Pagination
- [x] **Task 3.1**: Create `app/(admin)/admin/listings/admin-listings-table.tsx` client component with bulk selection, wire into `app/(admin)/admin/listings/page.tsx` with server-side pagination (`skip`, `take`, 50/100/500 limits).
- [x] **Task 3.2**: Integrate bulk select and pagination (50/100/500) into `CategoryManager` (`app/(admin)/admin/categories/category-manager.tsx`).
- [x] **Task 3.3**: Integrate bulk select and pagination (50/100/500) into `LocationManager` (`app/(admin)/admin/locations/location-manager.tsx`).

### Wave 4: Testing & Verification
- [x] **Task 4.1**: Unit tests in `tests/unit/bulk-select.test.ts` testing hook logic, range selection, and pagination calculations.
- [x] **Task 4.2**: Verify type safety (`npm run typecheck`).
- [x] **Task 4.3**: Verify existing test suite passes (`npm test`).
- [x] **Task 4.4**: Verify full application build (`npm run build`).

---

## 6. Verification Protocol & Quality Gates
1. **Visual Indeterminate Check**: Header checkbox displays a horizontal bar (`-`) when 1 to N-1 items are checked.
2. **Shift + Click Range**: Checking row 2, holding shift, and checking row 5 selects rows 2, 3, 4, and 5 simultaneously.
3. **Esc Key Dismissal**: Pressing `Esc` clears all selected checkboxes immediately.
4. **Safety Modal**: Deleting 5 categories pops a modal stating "Are you sure you want to delete 5 categories?".
5. **No Regression**: Individual row actions (status select, edit button, single delete) function without interference.
