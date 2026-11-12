---
last_mapped_commit: d477ba9a8095b24b7bd59f7726557d82cce578aa
last_mapped_at: 2026-11-12
---
# Codebase Structure

**Analysis Date:** 2026-11-12

## Directory Layout

```
project-root/
├── actions/                  # Server Actions (Mutations, auth, listing CRUD, admin actions)
├── app/                      # Next.js 16 App Router pages, layouts, and route handlers
│   ├── (account)/dashboard/  # Merchant & Business Owner Dashboard
│   ├── (admin)/admin/        # Role-gated Administrator Back-Office & Moderation
│   ├── (auth)/               # Authentication routes (/login, /register, /forgot-password)
│   ├── (public)/             # Public directory routes (/listing, /category, /location, /search)
│   └── api/                  # API endpoints (/analytics/track, /upload, /cron, /webhooks)
├── components/               # Reusable React components organized by feature domain
│   ├── analytics/            # Area chart, breakdown bar, and telemetry tracking hooks
│   ├── dashboard/            # Merchant sidebar, top-right user menu, stats cards
│   ├── forms/                # Modular form builders (schema editor, hours scheduler, enquiry modal)
│   ├── listing/              # Justdial-inspired Bento gallery, lightbox, action dock, review section
│   ├── search/               # Leaflet MapView, autocomplete, and search filter controls
│   └── ui/                   # Reusable UI primitives (buttons, badges, skeleton shimmer)
├── docs/                     # Architecture runbooks, deployment guides, DPDP compliance audits
├── lib/                      # Core business logic, infrastructure, and domain services
│   ├── auth/                 # Session management, Argon2id passwords, and RBAC utilities
│   ├── config/               # Validated environment configuration (`env.ts`)
│   ├── db/                   # Prisma database client (`client.ts`) and Redis client (`redis.ts`)
│   ├── security/             # HTML sanitization and security policies
│   ├── services/             # 13 Domain services (Listing, Analytics, Media, SEO, Review, etc.)
│   ├── storage/              # Storage driver abstraction (S3/R2 and Local disk drivers)
│   └── utils/                # Date/time formatters, opening hours parsers
├── messages/                 # Complete i18n dictionaries (en, mr, hi)
├── prisma/                   # Prisma schema (`schema.prisma`) and migrations
├── public/                   # Static assets, fallback media, and local upload storage
├── scripts/                  # Database seed scripts (`seed.ts`)
├── tests/                    # Vitest unit and integration test suite
│   └── unit/                 # Unit tests (analytics, opening-hours, sanitize, seo, plan)
└── update/                   # Project modernization specs and completed feature blueprints
```

## Directory Purposes

**`actions/`:**
- Purpose: Next.js Server Actions executed on the server via form submissions or RPC.
- Contains: `auth.ts`, `listing.ts`, `admin.ts`, `taxonomy.ts`, `review.ts`, `enquiry.ts`, `settings.ts`.
- Key files: `actions/listing.ts` (listing management), `actions/admin.ts` (user & CSV management).

**`app/`:**
- Purpose: Application routing using Next.js App Router conventions.
- Route groups:
  - `(public)`: Public directory view pages (`/listing/[slug]`, `/category/[...slug]`, `/location/[...slug]`, `/search`).
  - `(account)`: Authenticated business owner workspace (`/dashboard`, `/dashboard/listings`, `/dashboard/analytics`, `/dashboard/media`).
  - `(admin)`: Moderator/admin console (`/admin`, `/admin/analytics`, `/admin/listings`, `/admin/categories`, `/admin/imports`, `/admin/media`, `/admin/settings`).
  - `(auth)`: User authentication flows (`/login`, `/register`).
  - `api`: Endpoint handlers for background beacons, file uploads, webhooks, and cron jobs.

**`components/`:**
- Purpose: React client and server components partitioned by feature domain.
- Key files: `components/listing/listing-header-card.tsx`, `components/analytics/analytics-area-chart.tsx`, `components/forms/modular-sections-manager.tsx`.

**`lib/services/`:**
- Purpose: Pure domain logic isolated from the HTTP/React framework.
- Key files: `listing.service.ts`, `analytics.service.ts`, `media.service.ts`, `seo.service.ts`, `taxonomy.service.ts`.

## Key File Locations

**Entry Points:**
- `app/page.tsx`: Directory homepage.
- `proxy.ts`: Edge security proxy and middleware.
- `app/layout.tsx`: Root document layout.

**Configuration:**
- `next.config.ts`: Next.js compiler settings.
- `tailwind.config.ts`: Color palette and typography tokens.
- `prisma/schema.prisma`: Data models and database relations.
- `eslint.config.mjs`: ESLint flat config.

**Testing:**
- `vitest.config.mts`: Test environment configuration.
- `tests/unit/*.test.ts`: Test specifications.

## Naming Conventions

**Files:**
- React components & routes: `kebab-case.tsx` (`listing-header-card.tsx`, `page.tsx`, `layout.tsx`).
- Domain services: `name.service.ts` (`analytics.service.ts`).
- Server actions: `name.ts` (`listing.ts`, `admin.ts`).
- Tests: `name.test.ts` in `tests/unit/`.

**Directories:**
- Route groups: `(group-name)` (`(public)`, `(admin)`, `(account)`, `(auth)`).
- Dynamic routes: `[param]` (`[slug]`, `[id]`, `[...slug]`).

## Where to Add New Code

**New Feature / Domain:**
- Backend Service: Add to `lib/services/<feature>.service.ts`.
- Server Action: Add or extend `actions/<feature>.ts`.
- Components: Create domain folder `components/<feature>/`.
- Pages: Add route inside appropriate route group in `app/`.
- Tests: Add unit tests in `tests/unit/<feature>.test.ts`.

**Database Migration:**
- Add/modify models in `prisma/schema.prisma`.
- Push schema with `npx prisma db push` (or `npx prisma migrate dev`).
- Regenerate client with `npx prisma generate`.

---

*Structure analysis: 2026-11-12*
