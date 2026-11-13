---
phase: 01-business-analytics-click-to-action-tracking
plan: PLAN
subsystem: analytics
tags: [telemetry, analytics, dpdp, metrics, conversion, svg-charts]
provides:
  - DPDP-compliant salted visitor hashing and telemetry ingestion
  - AnalyticsEvent and AnalyticsDailySummary PostgreSQL Prisma models
  - Non-blocking /api/analytics/track route with bot filtering and rate limiting
  - CTA telemetry triggers on Phone, WhatsApp, Directions, Website, and Enquiry buttons
  - Interactive SVG Area Chart and Breakdown Bar components
  - Merchant dashboard analytics suite at /dashboard/listings/[id]/analytics and /dashboard/analytics
  - Directory-wide administration portal at /admin/analytics
affects: [listings, dashboard, admin]
actuals:
  tokens: 12000
  tasks: 12
  commits: 4
tech-stack:
  added: []
  patterns: [atomic-upsert-rollup, dpdp-salted-visitor-hash, non-blocking-beacon, svg-area-chart]
key-files:
  created:
    - lib/services/analytics.service.ts
    - app/api/analytics/track/route.ts
    - components/analytics/track-event.ts
    - components/analytics/listing-analytics-tracker.tsx
    - components/analytics/analytics-area-chart.tsx
    - components/analytics/analytics-breakdown-bar.tsx
    - app/(account)/dashboard/listings/[id]/analytics/page.tsx
    - app/(account)/dashboard/analytics/page.tsx
    - app/(admin)/admin/analytics/page.tsx
    - tests/unit/analytics.test.ts
  modified:
    - prisma/schema.prisma
    - lib/services/listing.service.ts
    - app/(public)/listing/[slug]/page.tsx
    - components/listing/listing-header-card.tsx
    - components/listing/listing-mobile-action-bar.tsx
    - components/listing/listing-lead-sidebar.tsx
    - components/dashboard/dashboard-sidebar.tsx
    - app/(account)/dashboard/listings/page.tsx
    - app/(admin)/admin/admin-nav.tsx
    - app/(admin)/admin/layout.tsx
key-decisions:
  - "DPDP Act 2023 compliance: Anonymized daily salted SHA-256 visitor hash prevents cross-day user tracking without third-party cookies or storing raw IPs."
  - "Dual storage rollup: Ingests raw events for audit while atomically maintaining AnalyticsDailySummary for sub-millisecond 7d/30d/90d chart queries."
  - "Zero third-party chart dependencies: Lightweight React SVG chart primitives avoid heavy charting bundle overhead."
duration: 35min
completed: 2026-11-09
status: complete
---

# Phase 01: Business Analytics & Click-to-Action Tracking Summary

**Privacy-first, DPDP-compliant visitor analytics and high-intent customer click-to-action conversion tracking with interactive SVG dashboards for merchants and administrators.**

## Performance
- **Duration:** 35 min
- **Tasks:** 12 completed across 4 waves
- **Files created/modified:** 20 files

## Accomplishments
- Schema models `AnalyticsEvent` and `AnalyticsDailySummary` synced to PostgreSQL database.
- Non-blocking beacon `/api/analytics/track` with bot detection and sliding-window rate limiting.
- Client telemetry tracking for Call Now, WhatsApp, Directions, Website clicks, and Enquiries.
- Merchant listing analytics dashboard (`/dashboard/listings/[id]/analytics`), merchant portfolio hub (`/dashboard/analytics`), and admin directory intelligence (`/admin/analytics`).
- 23 Vitest unit tests passing, strict TypeScript passing with 0 errors, and Next.js 16.4.5 Turbopack production build passing.

## Decisions & Deviations
- None - followed plan as specified.

## Next Phase Readiness
- Analytics telemetry operational and verified across all routes.
