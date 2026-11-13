# Enterprise Import Hub & Business Opening Hours Plan

## 1. Overview & Goals
This enhancement addresses two core user requests:
1. **Multi-Entity CSV Import Hub**: Expand bulk import beyond listings to also support **Categories** and **Locations** taxonomy, with an enterprise UX inspired by `design-ux` and `agency-ui-designer`.
2. **Business Opening Hours Integration**: Add full opening hours support in the CSV import engine, listing creation form (`admin-listing-form.tsx`), and listing edit form (`admin-edit-listing-form.tsx`).

---

## 2. Design System & UX Principles (`design-ux` & `agency-ui-designer`)

- **Visibility of System Status**: Real-time CSV parse metrics (Total rows, valid records, invalid lines) and in-flight progress with `Loader2`.
- **Recognition over Recall**: Visual drag-and-drop dropzone, 1-click sample data loaders, and downloadable CSV templates eliminate guesswork on column headers.
- **Error Prevention & Plain Language Recovery**: Pre-flight validation checks missing required headers before hitting the database, with clear row-by-row error reporting.
- **Segmented Multi-Entity Flow**: Tabbed interface switching between Listings, Categories, and Locations with distinct icon keys and contextual guidance.
- **Visual Affordance for Opening Hours**: Interactive 7-day schedule matrix with quick presets (Mon-Sat 9am-9pm, 24/7, Mon-Fri 9am-6pm) and visual open/closed badges.

---

## 3. Implementation Checklist

### Phase 1: Opening Hours Parser & Scheduler Component
- [x] Create `lib/utils/opening-hours-parser.ts` to parse shorthand formats ("09:00-21:00", "Mon-Sat: 09:00-20:00", "24/7") and JSON.
- [x] Create `components/forms/opening-hours-scheduler.tsx` for visual 7-day schedule configuration.
- [x] Wire opening hours scheduler into `app/(admin)/admin/listings/new/admin-listing-form.tsx`.
- [x] Wire opening hours scheduler into `app/(admin)/admin/listings/[id]/edit/admin-edit-listing-form.tsx`.
- [x] Update `actions/listing.ts` (`createListingAdminAction` & `updateListingAdminAction`) to parse and persist `openingHours`.

### Phase 2: Multi-Entity Backend Actions (`actions/admin.ts`)
- [x] Update `importListingsAction` to accept `openingHours` and map it to `WeekSchedule`.
- [x] Add `importCategoriesAction` with parent-hierarchy resolution, unique slug generation, and taxonomy counter updates.
- [x] Add `importLocationsAction` with GPS coordinate parsing, parent locality resolution, and uniqueness checks.

### Phase 3: Redesigned Import Center (`app/(admin)/admin/imports`)
- [x] Restructure `app/(admin)/admin/imports/page.tsx` with live database metric counters (Total Listings, Total Categories, Total Locations).
- [x] Rewrite `app/(admin)/admin/imports/csv-importer.tsx`:
  - Entity tabs: Listings, Categories, Locations.
  - Drag-and-drop file upload zone + CSV paste mode.
  - 1-Click sample data loader & CSV template download for each entity.
  - Interactive data preview table with opening hours pill preview, category pills, and coordinates.
  - Execution status with plain-language success/failure details and direct links to view the created items.

### Phase 4: Verification & Deployment
- [x] Run `npm run build` to verify 0 TypeScript and bundling errors.
- [x] Commit and sync across `main` and `Admin-Dashboard-UI`.
- [x] Deploy to Vercel production and verify live health.

