# Pimple Saudagar Local Business Directory

> A production-ready, enterprise-grade local business directory platform tailored for **Pimple Saudagar (PCMC, Pune, Maharashtra, India)**. Designed for scale, speed, accessibility, and high SEO performance on a modern serverless stack.

[![Live Demo](https://img.shields.io/badge/Demo-ps--lyart.vercel.app-2ea44f?style=flat&logo=vercel)](https://ps-lyart.vercel.app)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.5.28-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0_Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4.1-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![WCAG](https://img.shields.io/badge/WCAG-2.2_AA_Compliant-success)](#)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌟 Key Platform Features

### 1. Public Directory Experience
- **Smart Multi-Criteria Search**: Real-time keyword search across businesses with instant filtering by category, locality, open status, and minimum rating.
- **Dual View Layout**: Instant toggle between responsive listing card grid and interactive OpenStreetMap / Leaflet map view with custom business pins.
- **Rich Business Profiles**: Real-time `Asia/Kolkata` operating status (Open/Closed), high-resolution photo galleries, direct 1-click WhatsApp chat, phone dialer, verified merchant badges, and customer enquiry modal.
- **Automated OpenGraph & SEO**:
  - Dynamic `Schema.org` structured data (`LocalBusiness`, `BreadcrumbList`, and `AggregateRating` JSON-LD).
  - OpenGraph banner selection across Listings, Categories, and Locations.
  - Interactive live social media card previews (WhatsApp, Facebook, Twitter/X, and LinkedIn).
  - Search engine snippet previews (Google SERP).
  - Auto-generated `sitemap.xml` and `robots.txt`.

### 2. Business Submission & Merchant Dashboard
- **Public Business Submission**: Streamlined multi-step form for local business owners with photo upload, GPS coordinates, operating hours, and amenities.
- **Locality GPS Presets**: One-click coordinate presets for Pimple Saudagar hubs (Kokane Chowk, Shivar Chowk, Kunal Icon Road, Govind Garden, etc.) with browser GPS auto-detection.
- **Lead & Review Management**: Merchant dashboard for managing customer inquiries and replying to verified customer reviews.
- **Ownership Verification**: Business claim flow with document upload and admin audit workflow.

### 3. Admin Back-Office & Moderation
- **Moderation Queue**: Review incoming business submissions, approve/reject edits, and verify ownership claims.
- **Listings Management**: Full CRUD controls with status filters (Published, Pending Review, Draft, Rejected, Archived).
- **Taxonomy Management**: Hierarchical category and location management with drag/sort ordering, cover photos, and dedicated OpenGraph social share settings.
- **Bulk Import**: Client-side CSV batch importer with schema validation and dry-run preview.

### 4. Resilient Media Architecture
- **Serverless & Edge Ready**: Automatic Base64 Data URI fallback on serverless environments (e.g., Vercel read-only filesystem) with client-side FileReader fallbacks.
- **Cloud Storage Support**: Fully compatible with Cloudflare R2, AWS S3, or MinIO for scalable media hosting.

### 5. Enterprise Security & DPDP Compliance
- **OWASP ASVS Compliance**: Edge middleware with dynamic per-request cryptographic CSP nonces, Argon2id password hashing, sliding-window rate limiting, and strict HTML sanitization.
- **India DPDP Act 2023 Compliant**: Peppered HMAC SHA-256 reviewer email hashing, consent management, and automated personal data erasure workflows.
- **Connection Pooling**: Prisma configuration supporting serverless connection pooling with direct URL fallbacks for migrations.

---

## 🏗️ Architecture Overview

```
                       [ Cloudflare DNS & CDN ]
                                  │
                                  ▼
                       [ Vercel Edge Runtime ]
                  (Dynamic CSP Nonces & Protection)
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
       [ Next.js App Router ]           [ Cloud Storage / R2 ]
     (React Server Components)      (Media Assets & Photo Gallery)
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
[ PostgreSQL Database ] [ Upstash / Redis ]
(Prisma ORM with Pool)   (Rate Limiting & Cache)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ (LTS recommended)
- PostgreSQL 16+ database (local, Docker, Neon, or Supabase)
- npm or pnpm

### 1. Clone the Repository
```bash
git clone https://github.com/gajukharche1/PS.git
cd PS
npm install
```

### 2. Configure Environment Variables
Create your local environment configuration file from the provided template:

```bash
cp .env.example .env.local
```

Open `.env.local` and configure your credentials. Refer to `.env.example` for detailed descriptions of each required setting:
- **Application URL**: Base URL for canonical links and callback redirects.
- **Security Secrets**: Application secret and cron job authorization keys.
- **Database Connection**: Connection URLs for your PostgreSQL database (supports pooled and direct URLs).
- **Storage & Optional Services**: Optional settings for S3/R2 storage, transactional email, and analytics.

> **Security Note:** Never commit `.env` or `.env.local` files to version control. The repository's `.gitignore` automatically excludes them.

### 3. Database Setup & Migrations
Synchronize the Prisma schema with your database and seed initial taxonomy and plans:

```bash
# Push schema to PostgreSQL database
npx prisma db push

# Generate Prisma client
npm run prisma:generate

# (Optional) Seed initial categories, locations, and plans
npm run prisma:seed
```

### 4. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Quality Assurance & Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| **Development** | `npm run dev` | Starts Next.js development server with Turbopack |
| **Type Check** | `npm run typecheck` | Validates TypeScript types across the entire project |
| **Unit Tests** | `npm test` | Executes the Vitest test suite |
| **Production Build** | `npm run build` | Generates optimized production build with Prisma generation |
| **Start Server** | `npm start` | Runs the compiled production application |
| **Prisma Studio** | `npx prisma studio` | Interactive web GUI to inspect database records |

---

## 🐳 Docker Deployment

To build and run the application locally using Docker:

```bash
# Build production Docker container
docker build -t pimplesaudagar-directory:latest .

# Run container with environment configuration
docker run -p 3000:3000 --env-file .env.local pimplesaudagar-directory:latest
```

---

## 📄 License & Credits
Developed for the Pimple Saudagar (PCMC, Pune) community. Released under the [MIT License](LICENSE).
