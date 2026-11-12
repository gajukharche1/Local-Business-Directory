---
last_mapped_commit: d477ba9a8095b24b7bd59f7726557d82cce578aa
last_mapped_at: 2026-11-12
---
<!-- refreshed: 2026-11-12 -->
# Architecture

**Analysis Date:** 2026-11-12

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Client / Browser Layer                            │
├───────────────────────┬───────────────────────────────┬─────────────────────┤
│   Public Directory    │       Merchant Dashboard      │     Admin Portal    │
│  `app/(public)/...`   │      `app/(account)/...`      │  `app/(admin)/...`  │
└───────────┬───────────┴───────────────┬───────────────┴──────────┬──────────┘
            │                           │                          │
            ▼                           ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│             Next.js 16 App Router & Edge Gateway (`proxy.ts`)                │
│  - CSP Nonce Injection & Security Headers                                   │
│  - Session Extraction & Role-Based Route Guards                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                      Mutation Layer: Server Actions                         │
│  `actions/auth.ts`, `actions/listing.ts`, `actions/admin.ts`, etc.          │
│  - Zod Input Validation & RBAC Authorization                                │
│  - Rich Text Sanitization (`lib/security/sanitize.ts`)                      │
└───────────────────────────────────────┬─────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Domain Service Layer                              │
│  `lib/services/*.service.ts`                                                │
│  (Listing, Analytics, Taxonomy, Review, Search, Payment, Email, Media)      │
└───────────────┬───────────────────────┬───────────────────────┬─────────────┘
                │                       │                       │
                ▼                       ▼                       ▼
┌────────────────────────┐  ┌────────────────────────┐  ┌─────────────────────┐
│ PostgreSQL / Prisma 6  │  │   Redis / Rate Limiter │  │ S3 / R2 Cloud Media │
│   `lib/db/client.ts`   │  │   `lib/db/redis.ts`    │  │ `lib/storage/driver`│
└────────────────────────┘  └────────────────────────┘  └─────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| **Edge Gateway** | Dynamic CSP nonces, secure headers, and route protection | `proxy.ts` |
| **Auth & RBAC** | Argon2id hashing, secure cookie session lifecycle, role assertions | `lib/auth/session.ts`, `lib/auth/rbac.ts` |
| **Listing Service** | Business directory DAL, spatial coordinates, weekly opening hours logic | `lib/services/listing.service.ts` |
| **Analytics Service** | DPDP-compliant visitor hashing, real-time action telemetry, daily rollup | `lib/services/analytics.service.ts` |
| **Taxonomy Service** | Category and location hierarchy, slug generation, listing counters | `lib/services/taxonomy.service.ts` |
| **Review Engine** | Anti-spam heuristics, HMAC email hashing, transactional rating recalculation | `lib/services/review.service.ts` |
| **Search Engine** | Locality filtering, category search, Leaflet interactive map pins | `lib/services/search.service.ts` |
| **Storage Driver** | S3/Cloudflare R2 presigned streaming with local disk fallback | `lib/storage/driver.ts` |
| **Media Service** | Centralized asset metadata, folder taxonomy, quarantine, quota checks | `lib/services/media.service.ts` |
| **SEO Service** | Dynamic BreadcrumbList & LocalBusiness Schema.org JSON-LD generation | `lib/services/seo.service.ts` |

## Pattern Overview

**Overall:** Clean Layered Architecture with Data Access Layer (DAL) isolation and Next.js 16 App Router Server Components & Actions.

**Key Characteristics:**
- **Zero Client Waterfall**: Data fetching occurs on the server inside React Server Components directly via Domain Services and Prisma, passing pre-rendered markup to the client.
- **Strict Role-Based Access Control (RBAC)**: Enforced via `assertAuthorized` in Server Actions and route-level checks in admin/dashboard layouts.
- **Safe Fallback Resilience**: Core services gracefully degrade (e.g. In-memory rate limiting when Redis is unavailable, mock plan fixtures when database is cold).

## Layers

**Presentation Layer (`app/`, `components/`):**
- Purpose: Render accessible (WCAG 2.2 AA compliant), high-converting UI across Public, Merchant, and Admin portals.
- Location: `app/`, `components/`
- Depends on: Server Actions (`actions/`), Domain Services (`lib/services/`), Tailwind design tokens.

**Action / API Gateway Layer (`actions/`, `app/api/`):**
- Purpose: Handle data mutations, file uploads, webhooks, and asynchronous telemetry tracking.
- Location: `actions/`, `app/api/`
- Depends on: Zod schemas, Auth RBAC, Domain Services.

**Domain Service Layer (`lib/services/`):**
- Purpose: Encapsulate core business rules, transactional calculations, sanitization, and third-party orchestration.
- Location: `lib/services/`
- Depends on: `lib/db/client.ts`, `lib/security/`, `lib/storage/`.

**Infrastructure & Persistence Layer (`lib/db/`, `prisma/`, `lib/storage/`):**
- Purpose: Manage PostgreSQL schemas, connection pooling, Redis caching, and object storage drivers.
- Location: `lib/db/`, `lib/storage/`, `prisma/`

## Data Flow

### Primary Request Path (Public Listing Page)

1. Client requests `/listing/[slug]` (`app/(public)/listing/[slug]/page.tsx:23`).
2. Edge proxy injects CSP nonce and security headers (`proxy.ts:15`).
3. Server Component calls `ListingService.getBySlug(slug)` (`lib/services/listing.service.ts:35`).
4. Server generates dynamic SEO meta tags and Schema.org JSON-LD (`lib/services/seo.service.ts:40`).
5. Client hydrates and non-blocking telemetry tracker triggers `page_view` (`components/analytics/listing-analytics-tracker.tsx:18`).
6. `/api/analytics/track` increments `AnalyticsDailySummary` without blocking (`app/api/analytics/track/route.ts:48`).

### High-Intent Action Path (Click-to-Call / WhatsApp / Directions)

1. User clicks "Call Now" or "WhatsApp" button on listing profile (`components/listing/listing-header-card.tsx:254`).
2. Client fires non-blocking beacon to `/api/analytics/track` (`components/analytics/track-event.ts:16`).
3. Rate-limiter verifies caller is not a bot or flood attacker.
4. Server updates daily summary `callClicks` or `whatsappClicks` in `AnalyticsDailySummary`.
5. Merchant views real-time conversion update in `/dashboard/listings/[id]/analytics`.

## Key Abstractions

**Storage Driver Abstraction:**
- Purpose: Unified storage contract allowing seamless switching between Cloudflare R2 / AWS S3 in production and local filesystem in dev.
- Location: `lib/storage/driver.ts`
- Pattern: Strategy Pattern (`S3StorageDriver`, `LocalStorageDriver`).

**Timezone & Operating Hours Engine:**
- Purpose: Accurately compute open/closed status against India Standard Time (`Asia/Kolkata`) accounting for midnight shifts.
- Location: `lib/utils/opening-hours.ts`, `lib/utils/opening-hours-parser.ts`.

## Entry Points

**Web Entry Points:**
- `app/page.tsx`: Directory home landing page.
- `proxy.ts`: Next.js middleware gateway for security headers and session pass-through.
- `app/layout.tsx`: Root HTML layout with skip link, fonts, and dark mode theme container.

**API Entry Points:**
- `/api/analytics/track`: High-throughput visitor telemetry ingestion.
- `/api/upload`: Multipart image asset upload pipeline.
- `/api/webhooks/payments`: Payment gateway webhook handler.
- `/api/cron/*`: Periodic maintenance and cleanup endpoints.

## Error Handling

**Strategy:** Fail-safe defensive design. Server actions return structured `{ success: boolean, error?: string, data?: T }` without throwing unhandled exceptions to the client.

## Cross-Cutting Concerns

**Logging:** Standard console output with context prefixing (`[AnalyticsService]`, `[MediaService]`).
**Validation:** Centralized Zod schemas in actions and service inputs.
**Authentication:** HTTP-only `lbd_session` cookies with Argon2id encrypted hashes and role enforcement.

---

*Architecture analysis: 2026-11-12*
