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
    ├── listing-hours-card.tsx         # Live operational schedule with today highlight & countdown
    ├── listing-reviews-section.tsx    # Rating histogram, review filters, customer cards, and reply threads
    ├── listing-lead-sidebar.tsx       # Sticky right-rail "Get Best Deal" instant enquiry form
    ├── listing-lightbox.tsx           # Full-screen photo browser modal with thumbnail carousel
    └── listing-mobile-action-bar.tsx  # Mobile sticky bottom bar (Call, WhatsApp, Enquire)
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

## 6. SEO & Schema.org JSON-LD Enhancement

Enhance `SeoService.generateLocalBusinessSchema` to inject comprehensive metadata matching the Justdial standard:
- Specific `@type`: `HairSalon` / `Restaurant` / `LocalBusiness`.
- `priceRange`: e.g. `"Hair Cut Starting at ₹ 413"`.
- `paymentAccepted`: `["UPI", "Visa / Master Card / Rupay", "Cash"]`.
- `geo`: exact latitude and longitude.
- `openingHoursSpecification`: array of daily operating hours.
- `aggregateRating`: `ratingValue`, `ratingCount`, `bestRating: "5"`.
- `review`: Top reviews with author, reviewBody, and datePublished.

---

## 7. Implementation Roadmap & Checklist

### Phase 1: Branch & Design Tokens Setup
- [x] Create feature branch `Frontend-UI` and switch to it.
- [ ] Define reusable component types in `components/listing/types.ts`.
- [ ] Ensure Lucide icons and Tailwind styles are mapped to semantic design system tokens.

### Phase 2: Hero Gallery & Profile Header
- [ ] Build `components/listing/listing-hero-bento.tsx` with 5-tile bento grid and starting price chip.
- [ ] Build `components/listing/listing-lightbox.tsx` for full-screen photo browsing.
- [ ] Build `components/listing/listing-header-card.tsx` with logo, verified badge, rating capsule, live open/closed logic, and Action Dock.

### Phase 3: In-Page Navigation & Service Catalogue
- [ ] Build `components/listing/listing-sticky-nav.tsx` with IntersectionObserver scrollspy tabs.
- [ ] Build `components/listing/listing-services-catalogue.tsx` with category filter pills and service cards.
- [ ] Build `components/listing/listing-insights-card.tsx` for customer sentiment tags and payment methods.

### Phase 4: Timings, Reviews & Sticky Lead Sidebar
- [ ] Enhance `components/listing/opening-hours-card.tsx` with active day highlighting and countdown.
- [ ] Build `components/listing/listing-reviews-section.tsx` with rating histogram and owner replies.
- [ ] Build `components/listing/listing-lead-sidebar.tsx` with sticky enquiry form.
- [ ] Build `components/listing/listing-mobile-action-bar.tsx` for mobile sticky conversion.

### Phase 5: Page Integration & Verification
- [ ] Refactor `app/(public)/listing/[slug]/page.tsx` to compose all new components.
- [ ] Verify SEO Schema.org JSON-LD contains rich attributes (`priceRange`, `paymentAccepted`, `geo`, `openingHoursSpecification`).
- [ ] Run `npm run typecheck` (`tsc --noEmit`) and verify 0 errors.
- [ ] Verify build via `npx next build --turbopack`.
