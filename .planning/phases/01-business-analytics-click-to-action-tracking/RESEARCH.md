# Phase Research: Business Analytics & Click-to-Action Tracking

## 1. Domain Context & Requirements

In a local business directory (e.g., Justdial, Yelp, Google Business Profile), listing owners need clear, quantifiable proof of value to justify their subscription and claim their business. The most critical metrics for local merchants are:
1. **Visibility (Impressions & Unique Visitors)**: How many local customers discovered their storefront.
2. **Direct Intent / Click-to-Action (CTA)**: High-intent user conversions:
   - **Call Now**: Direct phone calls initiated.
   - **WhatsApp Chat**: Conversations started via WhatsApp API deep links.
   - **Directions / Map View**: Route requests to visit the physical store.
   - **Website Visits**: Outbound traffic to the merchant's portal.
   - **Lead Enquiries**: Quote/deal enquiries submitted via the lead dock.
3. **Conversion Rate**: Percentage of visits converting into direct customer contacts (`Total CTAs / Unique Views * 100`).

## 2. Regulatory & Architectural Constraints

### A. Privacy & India DPDP Act 2023 Compliance
- **No Third-Party Cookies or Invasive Tracking**: Zero cross-site tracking, third-party pixels, or fingerprinting.
- **Anonymized Visitor Salted Hash**: Daily rotating salt combined with client IP and User-Agent (`crypto.createHash('sha256').update(ip + userAgent + dailySalt).digest('hex')`) to deduplicate daily views without storing raw IP addresses or personal identifiers.
- **Data Minimization**: Store only listing ID, event type, sanitized referrer domain, device type (`mobile` vs `desktop`), and timestamp.

### B. High-Performance Ingestion & Database Scalability
- **Write Path**: Asynchronous non-blocking tracking endpoint (`/api/analytics/track`) using `fetch` with `keepalive: true` or `navigator.sendBeacon`.
- **Bot & Spam Mitigation**:
  - Filter out known crawler User-Agents (Googlebot, Bingbot, etc.).
  - Sliding-window rate limit (Upstash Redis / in-memory fallback) to discard click flood spam (max 5 actions per IP/hash per minute per listing).
- **Dual Storage Strategy**:
  - **Raw Event Stream (`AnalyticsEvent`)**: Detailed recent activity for real-time logs (retained 30–60 days).
  - **Daily Aggregation Rollup (`AnalyticsDailySummary`)**: Aggregated daily counts (`pageViews`, `uniqueVisitors`, `callClicks`, `whatsappClicks`, `directionsClicks`, `websiteClicks`, `enquiries`) enabling sub-millisecond queries for 7d/30d/90d historical charts without expensive table scans.

## 3. Visualization & UI/UX Standards

Adhering to our project design system (`/agency-ui-designer` and `/ui-ux-pro-max`):
- **Semantic Color Palette**:
  - Views / Impressions: Primary Blue/Indigo (`text-blue-600`, `bg-blue-500/10`)
  - Calls: Emerald (`text-emerald-600`, `bg-emerald-500/10`)
  - WhatsApp: WhatsApp Green (`text-[#25D366]`, `bg-[#25D366]/10`)
  - Directions / Maps: Amber (`text-amber-600`, `bg-amber-500/10`)
  - Inquiries: Purple (`text-purple-600`, `bg-purple-500/10`)
- **Lightweight SVG Charts**:
  - Pure React SVG rendering (smooth area/line charts, bar histograms, donut breakdown) without heavy bundle overhead.
  - Tabular numbers (`tabular-nums`) with percentage delta badges (`+18.4% vs last period`).
  - Empty states with illustrative empty-chart graphics and actionable guidance on how merchants can boost visibility.
