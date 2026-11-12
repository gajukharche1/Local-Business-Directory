---
last_mapped_commit: d477ba9a8095b24b7bd59f7726557d82cce578aa
last_mapped_at: 2026-11-12
---
# Coding Conventions

**Analysis Date:** 2026-11-12

## Naming Patterns

**Files & Directories:**
- React components, routes, and utilities: Strict `kebab-case.tsx` / `kebab-case.ts` (e.g. `listing-header-card.tsx`, `opening-hours-parser.ts`).
- Route directories: Kebab-case, dynamic parameters in brackets `[slug]`, catch-all in `[...slug]`.
- Service classes: `[domain].service.ts` with PascalCase class name (`AnalyticsService` in `analytics.service.ts`).
- Action modules: `actions/[domain].ts` (e.g. `actions/listing.ts`).

**Functions & Methods:**
- Functions and methods: `camelCase` (e.g. `getListingAnalytics`, `generateVisitorHash`, `submitReviewAction`).
- Server actions: Verb-first with `Action` suffix (e.g. `createListingAdminAction`, `updateUserRoleAndStatusAction`).

**Variables & Constants:**
- Variables and object properties: `camelCase` (e.g. `listingId`, `totalViews`, `periodDays`).
- Global / Module constants: `UPPER_SNAKE_CASE` (e.g. `DEFAULT_WEEK_SCHEDULE`, `BOT_REGEX`, `MAX_IMAGE_SIZE`).

**Types & Interfaces:**
- Types, Interfaces, Enums: `PascalCase` (e.g. `DailyDataPoint`, `ListingAnalyticsSummary`, `AnalyticsEventType`).
- Input contracts: `[Action/Method]Input` (e.g. `CreateListingInput`, `RecordEventInput`).
- Action return contracts: `[Action]State` (e.g. `EnquiryActionState`, `ReviewActionState`).

## Code Style

**Formatting & Linting:**
- Tooling: ESLint 9 (`eslint.config.mjs`) extending `eslint-config-next` (Next.js 16.4.5 native flat config).
- Prettier / TypeScript formatting rules: 2-space indentation, trailing commas where valid, semicolons enabled.
- Tailwind CSS: Enforced semantic design tokens (`bg-card`, `border-border/80`, `text-foreground`, `text-primary`, `bg-muted/50`). Arbitrary one-off pixel values or untracked hex codes are discouraged.

## Import Organization

**Order:**
1. React & Next.js core imports (`react`, `next/navigation`, `next/server`, `next/link`).
2. Third-party libraries (`@prisma/client`, `zod`, `lucide-react`, `crypto`).
3. Internal domain services & database clients (`@/lib/db/client`, `@/lib/services/*`).
4. Security & auth utilities (`@/lib/auth/*`, `@/lib/security/*`).
5. Components & UI primitives (`@/components/*`).
6. Types & Interfaces.

**Path Aliases:**
- Configured in `tsconfig.json`: `@/*` maps directly to project root `./*`. Relative traversal (`../../`) across major modules is avoided.

## Error Handling

**Server Action Pattern:**
- Never let raw database errors or unhandled exceptions crash client forms.
- Return structured typed state objects:
  ```typescript
  export interface ActionResponse<T = unknown> {
    success: boolean;
    error?: string;
    data?: T;
  }
  ```
- Catch errors in try/catch blocks, log securely with context tags, and return user-friendly localized messages.

**Service Layer Pattern:**
- Defensively validate arguments. When external dependencies (like Redis or third-party APIs) fail, services degrade gracefully to safe fallbacks (e.g. In-memory rate limiting, default fixtures).

## Logging

**Framework:** Native `console` with structured contextual prefixing:
- `console.error("[AnalyticsService] Error recording telemetry event:", err)`
- `console.warn("[MediaService] File rejected: exceeds quota")`
- Sensitive credentials, API keys, passwords, and raw client PII are NEVER logged.

## Function & Component Design

**React Server Components (RSC):**
- Server components by default for maximum performance, SEO, and zero bundle footprint.
- Keep data fetching directly in RSC functions via domain services and Prisma queries.

**Client Interactivity ("use client"):**
- Mark components `"use client"` only when browser interactivity is required (state, event listeners, effects, DOM APIs).
- Isolate interactive islands (e.g. `ListingAnalyticsTracker`, `ListingLightbox`, `OpeningHoursScheduler`) so parent pages remain server rendered.

---

*Convention analysis: 2026-11-12*
