# Technical Specification & UI/UX Development Plan: Modernized Listing Detail Experience

> **Role**: Senior UI/UX Architect (`/agency-ui-designer` & `/ui-ux-pro-max`)  
> **Status**: APPROVED SPECIFICATION  
> **Target Branch**: `Frontend-UI`  
> **Design Framework**: Modern Bento Grid, WCAG AAA Accessible, High-Contrast Typography, Tailwind CSS & Next.js 16  
> **Benchmark Reference**: Deconstructed & Modernized Justdial Enterprise Listing (`Orrganic Elemennt Salon, Koregaon Park`)

---

## 1. Executive Summary & Core Objectives

The current listing detail page (`app/(public)/listing/[slug]/page.tsx`) provides baseline functionality but lacks the visual punch, conversion psychology, and rich data density found in industry-leading directories (e.g., Justdial, Yelp, Google Maps Business Profiles). 

By analyzing the production Justdial listing for **Orrganic Elemennt Salon (Koregaon Park, Pune)**, we extract key commercial and UX patterns—stripping away legacy ad clutter and outdated 2012 styling—and translate them into a **clean, elevated, mobile-first, conversion-engineered design system**.

### Key Deliverables:
1. **Asymmetric Bento Hero Gallery**: 5-tile dynamic photo mosaic with interactive lightbox, starting price pill, and "+N Photos" overlay.
2. **Profile & Trust Hub**: Business identity header with verified checkmarks, claimed badges, emerald rating capsules, and real-time open/closed status.
3. **High-Conversion Action Dock**: Prominent primary CTAs (Call, WhatsApp, Enquire, Directions, Save, Share) with desktop sticky rail and mobile bottom floating bar.
4. **Sticky In-Page Section Anchor Tabs**: Frictionless jump navigation (`Overview`, `Services & Prices`, `Photos`, `Reviews`, `Timings & Location`, `Amenities`).
5. **Interactive Services & Rate Card**: Categorized catalogue with service duration, starting prices (with ₹ currency styling), and 1-click booking/enquiry.
6. **Key Customer Insights ("Why People Love This")**: AI-summarized positive sentiment chips extracted from customer feedback.
7. **Interactive Review Breakdown & Distribution**: 5-star to 1-star visual histogram, verified customer badges, and owner response threads.
8. **Right-Rail Sticky "Get Best Deal" Lead Widget**: Non-intrusive, high-converting enquiry form that stays pinned during viewport scrolling.
9. **SEO & Rich Snippet Enhancement**: Complete Schema.org `LocalBusiness` / specific subtype (`HairSalon`, `Restaurant`, `HealthAndBeautyBusiness`) with `OpeningHoursSpecification`, `GeoCoordinates`, and `AggregateRating`.

---

## 2. Deconstruction: Justdial Benchmark vs. Our Modern Architecture

| Feature Dimension | Justdial Production Listing (`Orrganic Elemennt`) | Our Modern Directory Implementation (`Frontend-UI`) |
| :--- | :--- | :--- |
| **Visual Aesthetics** | Cluttered, banner ads, dense tables, 11px font sizes, legacy gradients. | Modern Bento Grid, semantic Tailwind tokens (`bg-card`, `border-border/70`), crisp typography (14px–16px body, bold headings). |
| **Photo Presentation** | Flat table grid with pop-up page reloads. | Responsive 5-tile Bento photo mosaic with hover zoom (`scale-105`), instant full-screen lightbox modal (`ListingLightbox`), and upload trigger. |
| **Rating & Trust** | Green box (`117b01`) + text ratings. | Emerald pill badge (`bg-emerald-600 text-white font-extrabold text-sm`) + star icons + detailed review count + "Verified Business" badge. |
| **Primary CTAs** | Scattered call and SMS buttons with popup ads. | Clean unified Action Dock: **Call Now** (pulsing phone icon), **WhatsApp Chat** (direct wa.me deep link), **Get Best Deal** (modal lead trigger), **Save** & **Share**. |
| **Operating Hours** | Basic text list requiring dropdown click. | Live operating status badge ("Open Now • Closes 8:30 PM" or "Closed • Opens Tomorrow 11:00 AM") with expandable weekly timetable. |
| **Service Menu / Rate Card** | Hidden in sub-tabs with heavy iframe styles. | Integrated interactive catalogue with category filters, starting price (`₹413`), service duration ("45 mins"), and direct enquiry action. |
| **Customer Insights** | Bullet points inside dashed blue containers. | Modern "Key Customer Insights" card with sentiment icons (thumbs up, verified tags: "Organic & Vegan", "Polite Staff", "Serene Ambience"). |
| **Lead Capture** | Aggressive popup modals interrupting user reading. | Unobtrusive, sticky desktop right-rail card ("⚡ Usually responds in 15 mins") + mobile sticky bottom action bar. |
| **Mobile Experience** | Heavy desktop page scaled down on mobile. | Mobile-first touch-optimized layout: swipeable image carousel, sticky bottom contact bar (`Call` & `WhatsApp`), 48px touch targets. |

---

## 3. UI/UX Design System Tokens & Foundations (`/ui-ux-pro-max`)

### A. Color Palette & Semantics
- **Brand / Accent**: `primary` (`#DC2626` / `#0076D7` semantic mapping via `bg-primary`, `text-primary-foreground`).
- **Trust & Ratings (Emerald)**:
  - Rating Badge: `bg-emerald-600 text-white shadow-xs`
  - Positive Highlights: `bg-emerald-500/10 text-emerald-700 border-emerald-500/20`
- **Call-to-Action Buttons**:
  - Call Action: `bg-emerald-600 hover:bg-emerald-700 text-white`
  - WhatsApp Action: `bg-[#25D366] hover:bg-[#20BD5A] text-white`
  - Enquire / Quote Action: `bg-primary hover:bg-primary/90 text-primary-foreground`
- **Surface Elevation**:
  - Background: `bg-background`
  - Cards & Panels: `bg-card border-border/70 shadow-sm rounded-2xl`
  - Inset Highlights: `bg-muted/40`

### B. Typography & Contrast (WCAG AAA)
- **Primary Body Font**: System Sans / Inter (14px–16px, `text-foreground`).
- **Metric & Pricing**: `font-mono font-extrabold tabular-nums` (e.g. `₹413`, `4.5 ★`, `142 reviews`).
- **Hierarchy**:
  - H1 (Business Title): `text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight`
  - Section Headings: `text-xl font-bold tracking-tight text-foreground`
  - Microcopy & Metadata: `text-xs font-semibold text-muted-foreground`

---

## 4. Component Hierarchy & Architectural Breakdown

```
app/(public)/listing/[slug]/
├── page.tsx                           # Master Server Component (Fetches Listing, SEO, Breadcrumbs)
├── opengraph-image.tsx                # Dynamic social card generator
└── components/
    ├── listing-hero-bento.tsx         # 5-Tile Bento photo gallery with starting price chip
    ├── listing-header-card.tsx        # Title, badges, rating score, live hours, and primary CTA buttons
    ├── listing-sticky-nav.tsx         # Sticky anchor tabs (Overview, Services, Photos, Reviews, Hours)
    ├── listing-services-catalogue.tsx # Interactive rate card / service price list with categories
    ├── listing-insights-card.tsx      # "What Customers Love" AI highlights + Payment modes
    ├── opening-hours-card.tsx         # Live operational schedule with today highlight & countdown
    ├── listing-reviews-section.tsx    # Rating histogram, review filters, customer cards, and reply threads
    ├── listing-lead-sidebar.tsx       # Sticky right-rail "Get Best Deal" instant enquiry form
    ├── listing-lightbox.tsx           # Full-screen photo browser modal with thumbnail carousel
    └── listing-mobile-action-bar.tsx  # Mobile sticky bottom bar (Call, WhatsApp, Enquire)

components/forms/
├── modular-sections-manager.tsx       # Admin Dashboard Section & Component Manager (Add / Remove / Configure)
└── schema-markup-editor.tsx           # Structured Data (Schema.org / JSON-LD) Rich Snippets Editor & Live Preview
```

---

## 5. Detailed Component Specifications

### 1. `listing-hero-bento.tsx` (Bento Photo Mosaic)
- **Grid Layout**: 4-column, 2-row CSS grid (`h-[360px] md:h-[440px] gap-2 rounded-2xl overflow-hidden`).
  - **Tile 1 (Hero)**: Spans 2 rows and 2 columns on desktop (50% width); displays main storefront cover photo.
  - **Tile 2 & 3**: Stacked on column 3.
  - **Tile 4 & 5**: Stacked on column 4. Tile 5 features a dark gradient overlay with camera icon and text: **"View all {N} Photos"**.
- **Floating Badge**: Bottom-left glassmorphism chip: `"Starting from ₹413"` (or lowest price item from catalogue).
- **Interactions**:
  - Hovering any tile applies `scale-105 transition-transform duration-300`.
  - Clicking any tile launches `ListingLightbox` starting at that image index.
  - Mobile fallback: Smooth touch-swipe horizontal carousel with dot pagination.

### 2. `listing-header-card.tsx` (Identity, Status & Action Hub)
- **Header Elements**:
  - Business Avatar/Logo: `h-20 w-20 rounded-2xl border border-border/80 object-cover shadow-sm`.
  - Title: Large font with **Verified Checkmark** (`ShieldCheck` in emerald) and **Claimed Badge**.
  - Rating Capsule: Green score badge (`4.5 ★`) accompanied by star icons and hyperlinked review count `(142 Customer Reviews)`.
  - Location line: `MapPin` icon + Street Address + Locality + Pune + Distance indicator.
  - Live Hours Indicator:
    - If open: Pulsing emerald dot + `"Open Now until 8:30 PM"`.
    - If closed: Amber dot + `"Closed • Opens Wed 11:00 AM"`.
- **Primary Action Dock**:
  - `[ Call Now ]`: Primary emerald button with pulsing phone icon; triggers `tel:` link.
  - `[ WhatsApp ]`: Direct `wa.me` message with pre-filled enquiry text.
  - `[ Get Best Deal ]`: Opens quote modal or focuses the sticky sidebar form.
  - `[ Directions ]`: Opens Google Maps navigation in a new tab.
  - `[ Save / Bookmark ]`: Optimistic heart toggle saving to user favorites.
  - `[ Share ]`: Native Web Share API with clipboard copy toast.

### 3. `listing-sticky-nav.tsx` (In-Page Anchor Bar)
- **Behavior**: Sticks beneath top header (`top-14`) with backdrop blur (`bg-background/90 backdrop-blur-md border-b`).
- **Tabs**:
  - `Overview` (`#overview`)
  - `Services & Prices` (`#services`)
  - `Photos ({count})` (`#photos`)
  - `Reviews ({count})` (`#reviews`)
  - `Timings & Location` (`#timings`)
  - `Key Amenities` (`#amenities`)
- **Active Spy**: Highlights active section based on IntersectionObserver as user scrolls.

### 4. `listing-services-catalogue.tsx` (Rate Card & Services)
- Inspired by Justdial's `.jddtl_servicescatalogue`:
- **Category Filter Pills**: "All", "Hair Care", "Facials & Cleanup", "Spa & Massages", "Bridal & Make-up".
- **Service Card Architecture**:
  - Service image thumbnail (rounded-xl with aspect square).
  - Service title + description.
  - Estimated duration: `Clock` icon + `"45 mins"`.
  - Pricing display: Discounted price (`₹413`), strikethrough original MRP (`₹550`), and green savings pill (`25% OFF`).
  - CTA: `[ Enquire / Book ]` button triggering service-specific enquiry modal.

### 5. `listing-insights-card.tsx` (Customer Sentiment & Payment Modes)
- **Sentiment Highlights ("Why Customers Love This Place")**:
  - Synthesized bullet points rendered with emerald checkmarks:
    - `"Certified Organic & Vegan products used exclusively"`
    - `"Courteous, highly trained, and friendly hair stylists"`
    - `"Peaceful and relaxing spa ambiance"`
    - `"Ethical approach: Cruelty-free and animal-safe"`
- **Modes of Payment Accepted**:
  - Visual badges with icons: `UPI (GPay / PhonePe / Paytm)`, `Credit / Debit Cards (Visa / Master / RuPay)`, `Cash`.

### 6. `listing-hours-card.tsx` (Timings & Live Schedule)
- Two-column daily schedule (Monday through Sunday):
  - Highlights **Today's row** in soft accent background with an `"Active Today"` badge.
  - Displays explicit open/close slots (e.g., `11:00 AM – 8:30 PM`).
  - Clear markers for weekly closed days (e.g. `Tuesday: Closed`).

### 7. `listing-reviews-section.tsx` (Interactive Review Hub)
- **Rating Scorecard & Histogram**:
  - Giant rating score display (`4.5` out of 5) with star cluster.
  - 5-row progress bars showing percentage distribution (5-star: 78%, 4-star: 15%, etc.).
- **Write a Review CTA**:
  - Prominent button opening review composer with star rating selector and photo attachment.
- **Review List**:
  - Reviewer avatar initials, verified visit badge, publish date (`"25th February, 2026"`).
  - Star rating score.
  - Review body with expandable read-more for long feedback.
  - Owner reply card: nested box with merchant badge and personalized response.

### 8. `listing-lead-sidebar.tsx` (Sticky "Get Best Deal" Widget)
- **Placement**: Desktop right column (sticky at `top-28`).
- **Elements**:
  - Header: `"Get Best Deal & Pricing"` + `"⚡ Response in ~15 mins"`.
  - Inputs: Name, Mobile Number (+91 prefix), Requirement dropdown.
  - Quick checkbox: `"Send details on WhatsApp"`.
  - Primary Submit: `"Request Callback / Free Quote"`.
  - Privacy note: `"Your contact details are verified and kept secure."`
  - Business Owner Claim Prompt: `"Own this business? Claim listing to manage details."`

### 9. `listing-mobile-action-bar.tsx` (Mobile Conversion Dock)
- **Placement**: Fixed to bottom on viewports `< 768px` (`fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur border-t p-3`).
- **Buttons**:
  - `[ 📞 Call Business ]` (Flex-1 emerald button).
  - `[ 💬 WhatsApp ]` (Flex-1 green button).
  - `[ ⚡ Enquire ]` (Icon button opening lead bottom sheet).

---

## 6. Backend Admin Dashboard: Modular Component Management (Add / Remove / Configure)

### A. Architectural Motivation & Business Flexibility
Not all local businesses operate identically:
- A **Hair & Beauty Salon** or **Dental Clinic** requires a prominent **Services & Rate Card Catalogue** with pricing and duration.
- A **Real Estate Broker** or **Law Firm** needs verified credentials, direct consultations, and enquiry capture, but no fixed service rate card.
- A **Neighborhood Supermarket** requires payment modes, parking facilities, and operating hours, but no booking widget.

To support this variety without codebase fragmentation, every frontend listing component is made **modular, toggleable, and customizable** directly within the Admin Dashboard when creating (`/admin/listings/new`) or editing (`/admin/listings/[id]/edit`) a listing.

### B. Modular Sections Manager (`ModularSectionsManager`)
Located at `components/forms/modular-sections-manager.tsx`, this component provides:

1. **Master Component Toggles (`ListingSectionToggles`)**:
   - `services`: Services & Rate Card Catalogue (`true` | `false`)
   - `insights`: "Why Customers Love This" Sentiment Highlights (`true` | `false`)
   - `paymentModes`: Accepted Payment Modes (`true` | `false`)
   - `hours`: Weekly Timetable & Live Schedule (`true` | `false`)
   - `amenities`: Facilities & Key Conveniences (`true` | `false`)
   - `reviews`: Customer Ratings & Feedback Hub (`true` | `false`)
   - `leadSidebar`: Sticky "Get Best Deal" Lead Widget (`true` | `false`)

2. **Interactive Rate Card & Pricing Package Editor**:
   - Live list of services showing item title, category, duration, selling price, and original MRP.
   - Dynamic form to append new items:
     - `title`: Service Name (e.g. *"Organic Botanical Hair Spa"*)
     - `price`: Discounted Selling Price in ₹ (e.g. `1299`)
     - `originalPrice`: Strikethrough MRP in ₹ (e.g. `1750`)
     - `duration`: Time needed (e.g. *"60 mins"*)
     - `category`: Category group tag (e.g. *"Hair Care"*)
     - `description`: Service explanation
     - `popular`: Toggle switch for "Popular" highlight badge
   - 1-click removal of any individual service.
   - 1-click *"Reset Template"* button to populate industry-standard benchmark packages.

3. **Customer Sentiment Highlight Editor ("Why People Love This")**:
   - Dynamic bullet point management for USPs (e.g. *"Certified 100% Organic & Vegan Formulations"*).
   - Add/remove items with real-time UI preview.

4. **Modes of Payment Accepted Selector**:
   - Multi-select interactive pills for standard Indian payment rails:
     - `UPI (GPay / PhonePe / Paytm)`
     - `Credit & Debit Cards (Visa / Master / RuPay)`
     - `Net Banking`
     - `Cash Accepted`
     - `EMI Options Available`
   - Custom payment mode input for specialized payment methods (e.g., Sodexo, Meal Coupons).

### C. Database & Data Pipeline Architecture
- **Schema Storage**: Persistent JSONB column `customSections` on Prisma `Listing` model:
  ```typescript
  export interface ListingSchemaConfig {
    schemaType?: string;
    priceRangeText?: string;
    currenciesAccepted?: string;
    paymentAccepted?: string;
    includeRatings?: boolean;
    includeOpeningHours?: boolean;
    includeGeo?: boolean;
    includeReviews?: boolean;
    customJsonLd?: string;
  }

  export interface ListingCustomSections {
    toggles?: Partial<ListingSectionToggles>;
    services?: ListingServiceItem[];
    insights?: string[];
    paymentModes?: string[];
    schemaConfig?: ListingSchemaConfig;
  }
  ```
- **Form Serialization**: Hidden inputs `<input type="hidden" name="customSections" />` and `<input type="hidden" name="schemaConfig" />` transmit structured state to server actions without requiring complex multi-table migrations.
- **Server Action Validation**: `actions/listing.ts` parses `customSections` and `schemaConfig` through `baseListingSchema` with Zod validation, ensuring sanitization on create (`createListingAdminAction`, `submitListingUserAction`) and update (`updateListingAdminAction`).

### D. Frontend Responsive Adaptation
- **Dynamic Anchor Navigation (`ListingStickyNav`)**: Tabs for disabled sections are automatically filtered out from the sticky top bar.
- **Dynamic Hero Starting Price**: Calculates `Math.min(...services.map(s => s.price))` dynamically from active rate card items.
- **Grid Layout Reflow**: If `leadSidebar` is disabled, the page layout smoothly transitions from an asymmetric `8:4` desktop grid to a centered `max-w-4xl mx-auto` single-column reading layout.
- **Mobile Conversion Dock (`ListingMobileActionBar`)**: Automatically disables lead capture sheets if lead submission is turned off.

---

## 7. SEO & Schema.org JSON-LD Enhancement & Admin Schema Options

### A. Admin Dashboard Schema Markup Options (`SchemaMarkupEditor`)
Embedded directly inside **Section 6: Search Engine Optimization (SEO & Meta Tags)** of both the Add Listing (`/admin/listings/new`) and Edit Listing (`/admin/listings/[id]/edit`) forms:

1. **Schema.org Business Subtype (@type) Selection**:
   - `auto`: Auto-detect from Primary Category (Recommended default).
   - Categorized high-intent local business sub-types:
     - **Beauty, Wellness & Personal Care**: `HairSalon`, `BeautySalon`, `HealthAndBeautyBusiness`, `TattooParlor`.
     - **Food & Dining**: `Restaurant`, `CafeOrCoffeeShop`, `FastFoodRestaurant`, `Bakery`, `BarOrPub`.
     - **Healthcare & Fitness**: `MedicalBusiness`, `Dentist`, `Physician`, `Pharmacy`, `HealthClub`, `SportsActivityLocation`.
     - **Retail & Shopping**: `GroceryStore`, `ClothingStore`, `ElectronicsStore`, `Store`.
     - **Automotive & Services**: `AutoRepair`, `AutoDealer`, `GasStation`, `CarWash`.
     - **Professional & Home**: `EducationalOrganization`, `RealEstateAgent`, `ProfessionalService`, `HomeAndConstructionBusiness`, `LegalService`, `FinancialService`, `LocalBusiness`.

2. **Custom Price Range Specification (`priceRange`)**:
   - Explicit price string formatting (e.g., `Hair Cut Starting at ₹ 413` or `₹₹` or `₹500 - ₹2,500`).
   - 1-click quick preset chips for instant population.

3. **Currencies & Payment Methods**:
   - `currenciesAccepted`: Default `INR`.
   - `paymentAccepted`: Formatted comma-separated string (e.g. `Cash, Credit Card, Debit Card, UPI`).

4. **Rich Snippet Microdata Inclusion Toggles**:
   - `includeRatings`: Star score & aggregate rating count.
   - `includeOpeningHours`: Structured daily `OpeningHoursSpecification`.
   - `includeGeo`: Exact latitude and longitude `GeoCoordinates`.
   - `includeReviews`: Individual customer review quotes and author markup.

5. **Live JSON-LD Syntax-Highlighted Preview**:
   - Interactive preview component rendering the real-time `<script type="application/ld+json">` code block for instant crawler validation before saving.

### B. Runtime Schema Generation (`SeoService.generateLocalBusinessSchema`)
The public listing page dynamically consumes the configured `schemaConfig`:
- Overrides `@type` if an explicit subtype is chosen.
- Injects formatted `priceRange`, `currenciesAccepted`, and `paymentAccepted`.
- Conditionally includes/excludes ratings, weekly hours, geolocation, and reviews based on the admin toggles.

---

## 8. Implementation Roadmap & Checklist

### Phase 1: Branch & Design Tokens Setup
- [x] Create feature branch `Frontend-UI` and switch to it.
- [x] Define reusable component types in `components/listing/types.ts`.
- [x] Ensure Lucide icons and Tailwind styles are mapped to semantic design system tokens.

### Phase 2: Hero Gallery & Profile Header
- [x] Build `components/listing/listing-hero-bento.tsx` with 5-tile bento grid and starting price chip.
- [x] Build `components/listing/listing-lightbox.tsx` for full-screen photo browsing.
- [x] Build `components/listing/listing-header-card.tsx` with logo, verified badge, rating capsule, live open/closed logic, and Action Dock.

### Phase 3: In-Page Navigation & Service Catalogue
- [x] Build `components/listing/listing-sticky-nav.tsx` with IntersectionObserver scrollspy tabs.
- [x] Build `components/listing/listing-services-catalogue.tsx` with category filter pills and service cards.
- [x] Build `components/listing/listing-insights-card.tsx` for customer sentiment tags and payment methods.

### Phase 4: Timings, Reviews & Sticky Lead Sidebar
- [x] Enhance `components/listing/opening-hours-card.tsx` with active day highlighting and countdown.
- [x] Build `components/listing/listing-reviews-section.tsx` with rating histogram and owner replies.
- [x] Build `components/listing/listing-lead-sidebar.tsx` with sticky enquiry form.
- [x] Build `components/listing/listing-mobile-action-bar.tsx` for mobile sticky conversion.

### Phase 5: Page Integration & Verification
- [x] Refactor `app/(public)/listing/[slug]/page.tsx` to compose all new components.
- [x] Verify SEO Schema.org JSON-LD contains rich attributes (`priceRange`, `paymentAccepted`, `geo`, `openingHoursSpecification`).
- [x] Run `npm run typecheck` (`tsc --noEmit`) and verify 0 errors.
- [x] Verify build via `npx next build --turbopack`.

### Phase 6: Admin Dashboard Modular Component Controls
- [x] Add `customSections` JSON field to Prisma `Listing` model and sync database schema.
- [x] Build `components/forms/modular-sections-manager.tsx` providing:
  - Master on/off toggles for each component (Services, Insights, Payment Modes, Hours, Amenities, Reviews, Lead Form).
  - Interactive rate card & service package editor (add/edit/delete items with prices, duration, and popular badge).
  - Customer sentiment highlight editor ("Why Customers Love This Place").
  - Payment modes accepted selector (UPI, Credit/Debit Cards, Cash, Net Banking, EMI, Custom).
- [x] Integrate `ModularSectionsManager` into both `AdminListingForm` (new listing) and `AdminEditListingForm` (edit listing).
- [x] Wire `actions/listing.ts` to parse and persist `customSections` on create and update.
- [x] Update frontend `app/(public)/listing/[slug]/page.tsx` and `ListingStickyNav` to dynamically show or hide components based on configured toggles.

### Phase 7: Structured Data (Schema.org / JSON-LD) Markup Options in SEO Section
- [x] Build `components/forms/schema-markup-editor.tsx` providing:
  - Schema.org business subtype selector (`schemaType`) with 18+ local business categories.
  - Price range input (`priceRangeText`) with 1-click presets (e.g. `Hair Cut Starting at ₹ 413`, `₹₹`).
  - Accepted currencies (`currenciesAccepted`) and payment modes (`paymentAccepted`).
  - Rich snippet inclusion checkboxes (ratings, operating hours, geocoordinates, reviews).
  - Real-time live JSON-LD syntax-highlighted code preview.
- [x] Embed `SchemaMarkupEditor` into **Section 6: Search Engine Optimization (SEO & Meta Tags)** of both `AdminListingForm` (new) and `AdminEditListingForm` (edit).
- [x] Update `actions/listing.ts` to parse and persist `schemaConfig` into `customSections.schemaConfig`.
- [x] Upgrade `SeoService.generateLocalBusinessSchema` to dynamically respect admin overrides and microdata toggles.
- [x] Full verification with `npm run typecheck` and `npx next build` (0 errors).
