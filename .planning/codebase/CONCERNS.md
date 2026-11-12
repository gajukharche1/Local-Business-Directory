---
last_mapped_commit: d477ba9a8095b24b7bd59f7726557d82cce578aa
last_mapped_at: 2026-11-12
---
# Codebase Concerns

**Analysis Date:** 2026-11-12

## Tech Debt

**Prisma 7 Seed Deprecation:**
- Issue: `package.json#prisma` configuration property is deprecated in Prisma 6.19 and will be removed in Prisma 7.
- Files: `package.json`
- Impact: Non-fatal CLI warning printed during `prisma generate` and `prisma db push`.
- Fix approach: Migrate seed command to a dedicated `prisma.config.ts` when upgrading to Prisma 7.

**Ephemeral Storage on Serverless Deployments:**
- Issue: When `STORAGE_ENDPOINT` is unset, `MediaService` falls back to writing uploads into `public/uploads/` on the local filesystem.
- Files: `lib/storage/driver.ts`, `app/api/upload/route.ts`
- Impact: In ephemeral serverless environments (e.g. Vercel or AWS Lambda), local files are discarded on container recycle, causing missing images.
- Fix approach: Production deployments must configure Cloudflare R2 or AWS S3 credentials via `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`, and `STORAGE_BUCKET`.

**Leaflet SSR Guarding:**
- Issue: Leaflet depends on browser globals (`window`, `navigator`) not present during Node SSR.
- Files: `components/search/map-view.tsx`
- Impact: Attempting to render Leaflet directly on the server causes hydration mismatches or `window is not defined` errors.
- Fix approach: Always dynamically load `MapView` using Next.js `dynamic(() => import(...), { ssr: false })` with a fallback skeleton.

## Security Considerations

**Argon2id Memory Bounds:**
- Issue: Password hashing using native `@node-rs/argon2` is CPU/memory intensive by design.
- Files: `lib/auth/password.ts`, `actions/auth.ts`
- Impact: Unchecked concurrent login requests could degrade serverless memory or CPU budgets.
- Mitigation: Rate-limiting on `/login` and `/register` endpoints via Redis sliding-window prevents credential brute-force attacks.

**Session Secret Rotation:**
- Issue: Daily visitor telemetry hashing incorporates `APP_SECRET` / `SESSION_SECRET`.
- Files: `lib/services/analytics.service.ts`
- Impact: Using default development fallback secrets in production weakens DPDP salted hash protection.
- Mitigation: `lib/config/env.ts` enforces that production environments supply a cryptographically random secret of at least 32 characters.

## Performance & Scalability

**Analytics Summary Rollup:**
- Area: Telemetry ingestion volume at scale.
- Status: The dual-storage architecture (`AnalyticsDailySummary` + `AnalyticsEvent`) prevents table scan degradation by aggregating daily counts at write time.
- Recommendation: For high-traffic production deployments (>50,000 views/day), schedule an automated cron job (`/api/cron/cleanup-sessions`) to archive raw `AnalyticsEvent` records older than 60 days while retaining `AnalyticsDailySummary` permanently.

**Spatial Geocoding & Radius Filtering:**
- Area: Search and Map Pins.
- Status: Locality filtering currently uses string and coordinate bounding boxes.
- Recommendation: As the directory expands across multiple Pune hubs, consider enabling PostgreSQL `PostGIS` extension or Haversine SQL queries for geographic radius searches.

---

*Concerns analysis: 2026-11-12*
