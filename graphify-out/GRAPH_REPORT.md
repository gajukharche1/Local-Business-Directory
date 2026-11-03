# Graph Report - PS  (2026-11-03)

## Corpus Check
- 119 files · ~61,519 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 4, .example 1, .css 1)

## Summary
- 630 nodes · 1246 edges · 44 communities (33 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Cron & Health API Routes
- Listing Management & Validation
- Admin Category & Location Routes
- Admin Listing Forms & UI
- Ownership Claims & Customer Enquiries
- Reviews & Ratings System
- Admin Moderation & Import Workflow
- Frontend Tooling & DevDependencies
- CI/CD Pipeline & Secrets
- User Authentication & Sessions
- TypeScript Compiler Configuration
- Core Runtime Dependencies
- Package Scripts & Lifecycle
- Pricing Plans & Subscription UI
- Internationalization & Multi-Language
- MinIO Storage Container
- PostgreSQL Database Container
- Docker Web Application Service
- Payment Webhooks & Gateways
- Root Layout & Accessibility
- Docker Compose Infrastructure
- Container Healthcheck Probes
- Redis Cache Service
- Security Headers & CSP Middleware
- Tailwind Styling Utilities
- Service Dependency Graph
- Cloud & Storage Deployment Architecture
- PostgreSQL Full-Text Search & Migrations
- Atomic Review Aggregates & Privacy
- Tailwind CSS Configuration
- Vitest Testing Framework
- Taxonomy & Domain Models
- STRIDE Threat Model & Rate Limiting
- PostCSS Build Configuration
- Hyperlocal Directory Specification
- OWASP ASVS & Security Specs
- Next.js App Router Architecture
- Data Access Layer (DAL) Isolation
- DPDP Act Privacy Compliance
- TypeScript Execution Engine (TSX)
- Interactive Maps & Geolocation
- Roadmap & Implementation Verification
- Five-Stage Mutation Pipeline
- Tech Stack & Architecture Matrix

## God Nodes (most connected - your core abstractions)
1. `next` - 60 edges
2. `getCurrentUser()` - 50 edges
3. `lucide-react` - 48 edges
4. `db` - 34 edges
5. `@prisma/client` - 29 edges
6. `stripHtml()` - 21 edges
7. `react` - 21 edges
8. `assertAuthorized()` - 19 edges
9. `compilerOptions` - 17 edges
10. `ListingService` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Reviews Engine & Aggregate Rating Schema` --semantically_similar_to--> `Reviewer Email Peppered HMAC Hashing`  [INFERRED] [semantically similar]
  SPEC.md → docs/compliance/dpdp-audit.md
- `RegisterPage()` --indirect_call--> `registerAction()`  [INFERRED]
  app/(auth)/register/page.tsx → actions/auth.ts
- `AdminEditListingForm()` --indirect_call--> `updateListingAdminAction()`  [INFERRED]
  app/(admin)/admin/listings/[id]/edit/admin-edit-listing-form.tsx → actions/listing.ts
- `DashboardLayout()` --calls--> `getCurrentUser()`  [EXTRACTED]
  app/(account)/dashboard/layout.tsx → lib/auth/session.ts
- `POST()` --calls--> `getCurrentUser()`  [EXTRACTED]
  app/api/upload/route.ts → lib/auth/session.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Security and DPDP Privacy Framework** — security_owasp_asvs_level_2, architecture_stride_threat_model, docs_compliance_dpdp_audit_dpdp_compliance_matrix, spec_security_and_dpdp [INFERRED 0.95]
- **Zero-Cost Cloud Deployment Infrastructure** — docs_deployment_free_tier_deployment_guide, docs_deployment_neon_postgres_setup, docs_deployment_vercel_deployment, stack_redis_rate_limiting, stack_cloudflare_r2_storage [EXTRACTED 1.00]
- **Listing and Atomic Review Aggregation Lifecycle** — spec_listings_domain_model, spec_reviews_and_aggregates, architecture_adr_04_atomic_rating_recalculation, roadmap_phase_reviews_and_aggregates [EXTRACTED 1.00]

## Communities (44 total, 11 thin omitted)

### Community 0 - "Cron & Health API Routes"
Cohesion: 0.06
Nodes (37): dynamic, dynamic, GET(), dynamic, dynamic, HomePage(), CategoryArchivePage(), CategoryPageProps (+29 more)

### Community 1 - "Listing Management & Validation"
Cohesion: 0.07
Nodes (46): baseListingSchema, createListingAdminAction(), defaultOpeningHours, generateSlug(), submitListingPublicAction(), updateListingAdminAction(), categorySchema, createCategoryAdminAction() (+38 more)

### Community 2 - "Admin Category & Location Routes"
Cohesion: 0.05
Nodes (32): dynamic, dynamic, ALLOWED_MIME_TYPES, dynamic, POST(), contentType, Props, size (+24 more)

### Community 3 - "Admin Listing Forms & UI"
Cohesion: 0.06
Nodes (43): ActionState, AdminLayout(), dynamic, AdminEditListingForm(), AdminEditListingFormProps, LOCALITY_COORDINATES, POPULAR_AMENITIES, AdminEditListingPage() (+35 more)

### Community 4 - "Ownership Claims & Customer Enquiries"
Cohesion: 0.08
Nodes (24): ClaimActionState, claimSchema, submitClaimAction(), EnquiryActionState, enquirySchema, submitEnquiryAction(), ClaimForm(), ClaimFormProps (+16 more)

### Community 5 - "Reviews & Ratings System"
Cohesion: 0.08
Nodes (21): replyToReviewAction(), ReviewActionState, reviewSchema, submitReviewAction(), voteHelpfulAction(), OwnerReplyForm(), OwnerReplyFormProps, DashboardReviewsPage() (+13 more)

### Community 6 - "Admin Moderation & Import Workflow"
Cohesion: 0.11
Nodes (22): approveClaimAction(), approveReviewAction(), ImportListingInput, importListingsAction(), rejectClaimAction(), rejectReviewAction(), updateListingStatusAction(), CsvImporter() (+14 more)

### Community 7 - "Frontend Tooling & DevDependencies"
Cohesion: 0.10
Nodes (28): devDependencies, autoprefixer@^10.4.20, eslint@^9.20.1, eslint-config-next@^15.5.28, postcss@^8.5.2, prisma@^6.4.1, @types/leaflet@^1.9.22, @types/node@^22.13.4 (+20 more)

### Community 8 - "CI/CD Pipeline & Secrets"
Cohesion: 0.07
Nodes (27): concurrency, cancel-in-progress, group, AUTH_SECRET, CRON_SECRET, DATABASE_URL, ENCRYPTION_KEY, NEXT_PUBLIC_APP_URL (+19 more)

### Community 9 - "User Authentication & Sessions"
Cohesion: 0.16
Nodes (17): ActionState, loginAction(), loginSchema, logoutAction(), registerAction(), registerSchema, DashboardLayout(), dynamic (+9 more)

### Community 10 - "TypeScript Compiler Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 11 - "Core Runtime Dependencies"
Cohesion: 0.13
Nodes (15): dependencies, class-variance-authority@^0.7.1, lucide-react@^0.475.0, next@^15.5.28, @node-rs/argon2@^2.2.2, @prisma/client@^6.4.1, react@19.0.0, react-dom@19.0.0 (+7 more)

### Community 12 - "Package Scripts & Lifecycle"
Cohesion: 0.18
Nodes (11): scripts, build, dev, lint, postinstall, prisma:generate, prisma:migrate, prisma:seed (+3 more)

### Community 13 - "Pricing Plans & Subscription UI"
Cohesion: 0.27
Nodes (4): dynamic, metadata, PricingPage(), PlanService

### Community 14 - "Internationalization & Multi-Language"
Cohesion: 0.24
Nodes (3): dictionaries, Locale, LOCALES

### Community 15 - "MinIO Storage Container"
Cohesion: 0.20
Nodes (10): MINIO_ROOT_PASSWORD, MINIO_ROOT_USER, command, container_name, environment, image, ports, restart (+2 more)

### Community 16 - "PostgreSQL Database Container"
Cohesion: 0.20
Nodes (10): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, container_name, environment, image, ports, restart (+2 more)

### Community 17 - "Docker Web Application Service"
Cohesion: 0.22
Nodes (9): context, dockerfile, web, build, container_name, environment, image, ports (+1 more)

### Community 19 - "Root Layout & Accessibility"
Cohesion: 0.47
Nodes (3): metadata, RootLayout(), SkipLink()

### Community 20 - "Docker Compose Infrastructure"
Cohesion: 0.33
Nodes (5): services, volumes, ps-minio-data, ps-postgres-data, ps-redis-data

### Community 21 - "Container Healthcheck Probes"
Cohesion: 0.53
Nodes (6): interval, retries, test, timeout, healthcheck, healthcheck

### Community 22 - "Redis Cache Service"
Cohesion: 0.33
Nodes (6): container_name, image, ports, restart, volumes, redis

### Community 23 - "Security Headers & CSP Middleware"
Cohesion: 0.47
Nodes (4): generateCspHeader(), staticSecurityHeaders, config, middleware()

### Community 24 - "Tailwind Styling Utilities"
Cohesion: 0.33
Nodes (4): clsx@^2.1.1, tailwind-merge@^3.0.1, clsx, tailwind-merge

### Community 25 - "Service Dependency Graph"
Cohesion: 0.40
Nodes (5): postgres, redis, condition, condition, depends_on

### Community 26 - "Cloud & Storage Deployment Architecture"
Cohesion: 0.40
Nodes (5): 100% Free-Tier Production Deployment Guide, Neon PostgreSQL Serverless Setup, Vercel Edge & Serverless Deployment, Cloudflare R2 Media Bucket Disaster Sync, Cloudflare R2 Object Storage & Sharp Optimization

### Community 27 - "PostgreSQL Full-Text Search & Migrations"
Cohesion: 0.50
Nodes (3): PostgreSQL Backup & Disaster Recovery Runbook, Phase 2: Database Schema & Migrations, PostgreSQL 16 & Prisma ORM Data Layer

### Community 28 - "Atomic Review Aggregates & Privacy"
Cohesion: 0.50
Nodes (3): Reviewer Email Peppered HMAC Hashing, Phase 8: Reviews & Aggregations Engine, Reviews Engine & Aggregate Rating Schema

### Community 29 - "Tailwind CSS Configuration"
Cohesion: 0.50
Nodes (3): tailwindcss@^3.4.17, tailwindcss, config

### Community 31 - "Taxonomy & Domain Models"
Cohesion: 0.50
Nodes (4): Hierarchical Categories & Locations Taxonomy, Listings Domain Model, Pricing Plans Model (Paise Currency & Feature Gates), Implementation Plan 2: Taxonomy & Admin Listing Editor

### Community 32 - "STRIDE Threat Model & Rate Limiting"
Cohesion: 0.67
Nodes (3): STRIDE Threat Model & Mitigations, STRIDE Security Countermeasures, Upstash Redis Rate Limiting & Autocomplete Cache

### Community 34 - "Hyperlocal Directory Specification"
Cohesion: 0.67
Nodes (3): Pimple Saudagar Local Business Directory, Project Specification: Hyperlocal Business Directory, WordPress ListingPro Spec Re-implementation Prompt

### Community 35 - "OWASP ASVS & Security Specs"
Cohesion: 0.67
Nodes (3): Phase 4: Security Middleware & Security Headers, OWASP ASVS Level 2 Verification, ASVS Level 2 & DPDP Act 2023 Technical Specifications

## Knowledge Gaps
- **25 isolated node(s):** `STRIDE Threat Model & Mitigations`, `Five-Stage Mutation Pipeline (Acquire, Prepare, Process, Parse, Render)`, `Pimple Saudagar Local Business Directory`, `Multi-Criteria Search and Leaflet Map View`, `DPDP Compliance & OWASP Security Architecture` (+20 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 266 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Cron & Health API Routes` to `Listing Management & Validation`, `Admin Category & Location Routes`, `Admin Listing Forms & UI`, `Ownership Claims & Customer Enquiries`, `Reviews & Ratings System`, `Admin Moderation & Import Workflow`, `Frontend Tooling & DevDependencies`, `User Authentication & Sessions`, `Core Runtime Dependencies`, `Pricing Plans & Subscription UI`, `Payment Webhooks & Gateways`, `Root Layout & Accessibility`, `Security Headers & CSP Middleware`?**
  _High betweenness centrality (0.215) - this node is a cross-community bridge._
- **What connects `STRIDE Threat Model & Mitigations`, `Five-Stage Mutation Pipeline (Acquire, Prepare, Process, Parse, Render)`, `Pimple Saudagar Local Business Directory` to the rest of the system?**
  _25 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Cron & Health API Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.0553116769095698 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `Ownership Claims & Customer Enquiries` to `Cron & Health API Routes`, `Listing Management & Validation`, `Admin Category & Location Routes`, `Admin Listing Forms & UI`, `Reviews & Ratings System`, `Admin Moderation & Import Workflow`, `Frontend Tooling & DevDependencies`, `User Authentication & Sessions`, `Core Runtime Dependencies`, `Pricing Plans & Subscription UI`, `Internationalization & Multi-Language`?**
  _High betweenness centrality (0.117) - this node is a cross-community bridge._
- **Should `Listing Management & Validation` be split into smaller, more focused modules?**
  _Cohesion score 0.07191316146540028 - nodes in this community are weakly interconnected._
- **Why does `@prisma/client` connect `Admin Category & Location Routes` to `Cron & Health API Routes`, `Listing Management & Validation`, `Admin Listing Forms & UI`, `Ownership Claims & Customer Enquiries`, `Admin Moderation & Import Workflow`, `Frontend Tooling & DevDependencies`, `User Authentication & Sessions`, `Core Runtime Dependencies`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Should `Admin Category & Location Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.0514216575922565 - nodes in this community are weakly interconnected._