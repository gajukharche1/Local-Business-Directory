# Phase Plan: Business Analytics & Click-to-Action Tracking

## Goal
Implement a privacy-first, DPDP-compliant business analytics engine that tracks listing impressions and high-intent customer click-to-action conversions (Phone Calls, WhatsApp Chats, Directions, Website clicks, and Enquiries), paired with an interactive visual dashboard for business owners and system administrators.

---

## Technical Specifications & Architecture

### 1. Database Schema (`prisma/schema.prisma`)
- Model `AnalyticsEvent`:
  - `id`: CUID
  - `listingId`: UUID/String relation to `Listing`
  - `eventType`: Enum/String (`page_view`, `click_call`, `click_whatsapp`, `click_directions`, `click_website`, `click_enquire`)
  - `metadata`: JSON payload (`{ referrer?: string, device?: "mobile"|"desktop" }`)
  - `visitorHash`: String? (SHA-256 salted hash of IP + User-Agent + Daily Salt)
  - `createdAt`: DateTime index
- Model `AnalyticsDailySummary`:
  - `id`: CUID
  - `listingId`: String relation to `Listing`
  - `date`: DateTime (`@db.Date`)
  - `pageViews`, `uniqueVisitors`, `callClicks`, `whatsappClicks`, `directionsClicks`, `websiteClicks`, `enquiries`: Int
  - Compound unique constraint: `@@unique([listingId, date])`

### 2. High-Throughput Ingestion API (`app/api/analytics/track/route.ts`)
- Accepts POST request with `{ listingId, eventType, metadata }`.
- Validates request payload with Zod.
- Checks rate limits via sliding window to discard click bots.
- Derives anonymized daily visitor hash.
- Upserts `AnalyticsDailySummary` and records `AnalyticsEvent`.
- Returns `204 No Content` for minimal network overhead.

### 3. Client Tracking Integration
- `components/analytics/listing-analytics-tracker.tsx`: Invisible client component mounted on `/listing/[slug]` that fires `page_view` once per tab session.
- Add event telemetry to CTAs:
  - Phone call button (`click_call`) in `listing-header-card.tsx` and `listing-mobile-action-bar.tsx`.
  - WhatsApp chat button (`click_whatsapp`) in `listing-header-card.tsx` and `listing-mobile-action-bar.tsx`.
  - Directions / Map button (`click_directions`).
  - Website link (`click_website`).
  - Enquiry trigger (`click_enquire`).

### 4. Analytics Service (`lib/services/analytics.service.ts`)
- `recordEvent(listingId, eventType, req)`: Ingestion logic.
- `getListingAnalytics(listingId, period: '7d' | '30d' | '90d')`:
  - Returns total views, total conversions, conversion rate %, time-series daily data array, and action breakdown percentages.
  - Computes period-over-period delta (+/- % vs previous equivalent period).
- `getDirectoryAnalytics(period)`: System-wide rollup for administrators.

### 5. UI Dashboards
- **Owner Listing Analytics Page** (`app/(account)/dashboard/listings/[id]/analytics/page.tsx`):
  - Segmented timeframe pills (7D, 30D, 90D).
  - Modern KPI Cards (Total Views, Direct Inquiries, Total Actions, Conversion Rate) with trend deltas.
  - Interactive SVG Area Chart: Impressions vs Total Actions over time.
  - Action Breakdown Donut / Bar: Percentage distribution of Call vs WhatsApp vs Directions vs Enquiries.
- **Admin Directory Analytics** (`app/(admin)/admin/analytics/page.tsx`):
  - Platform-wide discovery metrics and top-performing businesses leaderboard.

---

## Detailed Task Breakdown

### Wave 1: Database & Core Service
- [x] **Task 1.1**: Add `AnalyticsEvent` and `AnalyticsDailySummary` to `prisma/schema.prisma` with appropriate indexes and relations.
- [x] **Task 1.2**: Synchronize Postgres schema using `npx prisma db push` and regenerate Prisma Client (`npx prisma generate`).
- [x] **Task 1.3**: Create `lib/services/analytics.service.ts` with DPDP-compliant visitor hashing, event ingestion, daily aggregation rollup, and query methods.

### Wave 2: Telemetry Ingestion & Client Instrumentation
- [x] **Task 2.1**: Implement `/api/analytics/track` route handler with Zod validation, rate limiting, and bot filtering.
- [x] **Task 2.2**: Build reusable tracking client `components/analytics/track-event.ts` (using `navigator.sendBeacon` and `fetch` fallback).
- [x] **Task 2.3**: Build `components/analytics/listing-analytics-tracker.tsx` and mount on `app/(public)/listing/[slug]/page.tsx`.
- [x] **Task 2.4**: Wire click telemetry triggers into `listing-header-card.tsx`, `listing-mobile-action-bar.tsx`, and `listing-lead-sidebar.tsx`.

### Wave 3: Visual Analytics Components & Owner Dashboard
- [x] **Task 3.1**: Build lightweight SVG chart primitives (`components/analytics/analytics-area-chart.tsx` and `components/analytics/analytics-breakdown-bar.tsx`).
- [x] **Task 3.2**: Build `app/(account)/dashboard/listings/[id]/analytics/page.tsx` and integrate analytics navigation tab into owner listing management.
- [x] **Task 3.3**: Build global merchant overview in `app/(account)/dashboard/analytics/page.tsx`.

### Wave 4: Admin Directory Analytics & Verification
- [x] **Task 4.1**: Build `app/(admin)/admin/analytics/page.tsx` with directory-wide KPI summary, platform conversion rate, and top listing rankings.
- [x] **Task 4.2**: Add "Analytics" link to Admin Sidebar (`app/(admin)/admin/admin-nav.tsx`).
- [x] **Task 4.3**: Add unit tests in `tests/unit/analytics.test.ts` validating DPDP anonymization hashing, conversion rate calculation, and aggregation logic.
- [x] **Task 4.4**: Run `npm run typecheck` and `npm test` to verify 0 errors.

---

## Verification Criteria
1. `npx prisma db push` executes cleanly.
2. Ingestion endpoint `/api/analytics/track` responds with 204 for valid events and records both raw event and daily summary.
3. Multiple page views on the same day from the same browser count as 1 unique visitor in daily summary.
4. Calling, WhatsApp clicking, and directions clicking update respective action counters.
5. Owner analytics dashboard renders interactive trend charts without layout shifts or third-party chart library bundle bloat.
6. `npm run typecheck` passes with 0 errors.
7. `npm test` passes all unit tests.
