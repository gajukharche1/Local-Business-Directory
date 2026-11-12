---
last_mapped_commit: d477ba9a8095b24b7bd59f7726557d82cce578aa
last_mapped_at: 2026-11-12
---
# Technology Stack

**Analysis Date:** 2026-11-12

## Languages

**Primary:**
- TypeScript 5.7.3 - Strict mode across all application logic, React Server Components, Server Actions, services, and tests (`tsconfig.json`).

**Secondary:**
- JavaScript / PostCSS / CSS - Build scripts, PostCSS pipeline (`postcss.config.mjs`, `eslint.config.mjs`, `tailwind.config.ts`, `app/globals.css`).
- Prisma Schema DSL - Database modeling and migrations (`prisma/schema.prisma`).

## Runtime

**Environment:**
- Node.js >= 22.x (`v22.19.0` detected) with ES modules / Next.js standalone runtime compatibility.

**Package Manager:**
- npm 11.14.0
- Lockfile: `package-lock.json` present (`lockfileVersion: 3`).

## Frameworks

**Core:**
- Next.js 16.4.5 (App Router, Turbopack enabled) - Primary fullstack web application framework powering Server Components, Server Actions, dynamic routes, and API endpoints.
- React 19.3.1 & React DOM 19.3.1 - User interface layer with Server Components, Actions (`useActionState`), and Client interactivity.

**Testing:**
- Vitest 5.1.0 - Fast unit and integration test runner configured in `vitest.config.mts`.

**Build/Dev:**
- Turbopack (`next dev --turbopack`, `next build`) - High-performance bundler and compiler.
- Tailwind CSS 3.4.17 with Autoprefixer 10.4.20 - Utility-first styling framework with CSS variables design system.
- TypeScript Compiler (`tsc --noEmit`) - Strict static type validation.
- ESLint 9.39.5 with `eslint-config-next` 16.4.5 - Linting and code quality via flat config (`eslint.config.mjs`).

## Key Dependencies

**Critical:**
- `@prisma/client` 6.19.3 - ORM client for PostgreSQL interactions and data integrity.
- `@node-rs/argon2` 2.2.2 - High-performance native Argon2id password hashing for credential authentication.
- `zod` 4.6.7 - Schema validation for Server Actions, API routes, and environment configuration.
- `sanitize-html` 2.18.1 - HTML sanitization engine for safe user and merchant rich-text content blocks.
- `leaflet` 1.9.4 & `@types/leaflet` 1.9.22 - Interactive OpenStreetMap mapping library for geo-coordinates and search views.
- `lucide-react` 1.70.0 - Semantic icon system.

**Infrastructure & Utilities:**
- `clsx` 2.1.1 & `tailwind-merge` 3.0.1 - Conditional class name merging and Tailwind class deduplication.
- `class-variance-authority` 0.7.1 - Component variant styling abstraction.
- `tsx` 4.19.3 - TypeScript execution runner for database seeders (`scripts/seed.ts`).

## Configuration

**Environment:**
- Managed via `.env`, `.env.local`, and `.env.example`.
- Validated via strict schema configuration in `lib/config/env.ts`.
- Key configs: `DATABASE_URL`, `APP_SECRET`, `CRON_SECRET`, `STORAGE_BUCKET`, `REDIS_URL`, `NEXT_PUBLIC_APP_URL`.

**Build:**
- `next.config.ts` - Next.js configuration.
- `tsconfig.json` - TypeScript compiler options with strict type checking and `@/*` path alias.
- `tailwind.config.ts` - Tailwind design tokens, semantic color mappings, and container queries.
- `postcss.config.mjs` - PostCSS plugin pipeline.
- `eslint.config.mjs` - ESLint 9 flat configuration.

## Platform Requirements

**Development:**
- Node.js 20+ (recommended Node 22+), npm 10+, PostgreSQL 16+ (local Docker or cloud connection).

**Production:**
- Standalone multi-stage Docker build (`Dockerfile`) or serverless hosting (Vercel / Cloudflare Pages + Neon/Supabase PostgreSQL).

---

*Stack analysis: 2026-11-12*
