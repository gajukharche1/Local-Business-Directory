---
last_mapped_commit: d477ba9a8095b24b7bd59f7726557d82cce578aa
last_mapped_at: 2026-11-12
---
# External Integrations

**Analysis Date:** 2026-11-12

## APIs & External Services

**Transactional Email:**
- Resend / SMTP - Outbound transactional emails (welcome emails, lead alerts, claim notifications, plan expiry alerts).
  - SDK/Client: REST API / Fetch client wrapper in `lib/services/email.service.ts`.
  - Auth: `RESEND_API_KEY`.
  - Sender: `EMAIL_FROM`.

**Payments & Billing:**
- Razorpay (Primary for INR transactions) - Merchant subscription plan checkout, recurring billing, and webhook event verification.
  - SDK/Client: Direct API & HMAC verification in `lib/services/payment.service.ts` and `app/api/webhooks/payments/route.ts`.
  - Auth: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`.
- Stripe (Secondary / International) - Card billing and webhook handling.
  - Auth: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.

**Maps & Geolocation:**
- OpenStreetMap / Leaflet (Primary $0 Free Tier) - Interactive map pins, category radius exploration, and directions routing in `components/search/map-view.tsx`.
- Google Maps (Optional Enterprise Provider) - Deep links for directions and navigation in `components/listing/listing-header-card.tsx`.
  - Auth: `NEXT_PUBLIC_GOOGLE_MAPS_KEY` (optional).

**Bot Defenses:**
- Cloudflare Turnstile (Optional) - Anti-bot protection for public listing submission and contact forms.
  - Auth: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`.

## Data Storage

**Databases:**
- PostgreSQL 16+ (Local Docker or Cloud Managed: Neon, Supabase, Prisma Postgres)
  - Connection: `DATABASE_URL` (pooled) and optional `DIRECT_URL`.
  - Client: Prisma ORM v6.19.3 (`@prisma/client`) initialized in `lib/db/client.ts`.

**File Storage:**
- S3-Compatible Object Storage (Cloudflare R2 / AWS S3 / MinIO) with local filesystem fallback.
  - Drivers: `S3StorageDriver` and `LocalStorageDriver` abstracted in `lib/storage/driver.ts`.
  - Storage directory for local fallback: `public/uploads/` managed via `app/api/upload/route.ts`.
  - Auth: `STORAGE_ENDPOINT`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`, `STORAGE_BUCKET`.
  - Public CDN Base: `NEXT_PUBLIC_STORAGE_PUBLIC_URL`.

**Caching & Rate Limiting:**
- Redis / Upstash Redis
  - Connection: `REDIS_URL` or `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`.
  - Client: `lib/db/redis.ts` supporting sliding-window IP rate limiting, telemetry throttling, and cached taxonomies with safe in-memory fallback.

## Authentication & Identity

**Auth Provider:**
- Custom Session-Based Authentication (Role-Based Access Control)
  - Implementation: Native HTTP-only secure cookie session engine in `lib/auth/session.ts` and `lib/auth/rbac.ts`.
  - Password Hashing: `@node-rs/argon2` (Argon2id) in `lib/auth/password.ts`.
  - Roles: `admin`, `moderator`, `owner`, `visitor` defined in `prisma/schema.prisma` and enforced via `assertAuthorized` guards.

## Monitoring & Observability

**Error Tracking & Health:**
- `/api/health` route handler reporting database connectivity, Redis ping, storage readiness, and system uptime.
- Structured application error reporting in server action responses.

**Telemetry & Business Analytics:**
- Privacy-compliant internal visitor analytics engine (`lib/services/analytics.service.ts` & `/api/analytics/track`).
- Salted daily SHA-256 visitor hash conforming to India DPDP Act 2023 with zero third-party cookies.

## CI/CD & Deployment

**Hosting:**
- Docker containerization (`Dockerfile` multi-stage standalone runner) and Vercel / Cloudflare edge compatibility.

**CI Pipeline:**
- GitHub Actions (`.github/workflows/ci.yml`) executing lint, typecheck, Vitest unit tests, and production build verification.

## Environment Configuration

**Required env vars:**
- `DATABASE_URL`, `APP_SECRET`, `CRON_SECRET`, `NEXT_PUBLIC_APP_URL`.

**Secrets location:**
- `.env.local` for local development (gitignored); production platform environment secrets (Vercel / Docker environment injection).

## Webhooks & Callbacks

**Incoming:**
- `/api/webhooks/payments` - Receives Razorpay and Stripe subscription payment status webhooks with HMAC-SHA256 signature verification.
- `/api/cron/*` (`/api/cron/plan-expiry`, `/api/cron/repair-aggregates`, `/api/cron/cleanup-sessions`) - Invoked by scheduled cron jobs authenticated via Bearer `CRON_SECRET`.

**Outgoing:**
- None (outbound notifications dispatched synchronously or through transactional Resend email API).

---

*Integration audit: 2026-11-12*
