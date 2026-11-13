import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ListingService } from "@/lib/services/listing.service";
import { SeoService } from "@/lib/services/seo.service";
import { env, getAppBaseUrl } from "@/lib/config/env";
import { ListingHeroBento } from "@/components/listing/listing-hero-bento";
import { ListingHeaderCard } from "@/components/listing/listing-header-card";
import { ListingStickyNav } from "@/components/listing/listing-sticky-nav";
import { ListingServicesCatalogue } from "@/components/listing/listing-services-catalogue";
import { ListingInsightsCard } from "@/components/listing/listing-insights-card";
import { OpeningHoursCard } from "@/components/listing/opening-hours-card";
import { ListingReviewsSection } from "@/components/listing/listing-reviews-section";
import { ListingLeadSidebar } from "@/components/listing/listing-lead-sidebar";
import { ListingMobileActionBar } from "@/components/listing/listing-mobile-action-bar";
import { ListingCustomSections, ListingSectionToggles } from "@/components/listing/types";
import { ListingAnalyticsTracker } from "@/components/analytics/listing-analytics-tracker";
import { Check, ChevronRight, Info } from "lucide-react";

interface ListingPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await ListingService.getBySlug(slug);
  const baseUrl = getAppBaseUrl();

  if (!listing) {
    return {
      title: "Business Not Found | Local Business Directory",
    };
  }

  const title = listing.seoTitle?.trim()
    ? listing.seoTitle
    : `${listing.title} in ${listing.locality}, Pimple Saudagar | Reviews & Contact`;
  const description = listing.seoDescription?.trim()
    ? listing.seoDescription
    : `Contact details, opening hours, photos, ratings, and customer reviews for ${listing.title} located at ${listing.locality}, Pimple Saudagar.`;
  const keywords = listing.seoKeywords?.trim()
    ? listing.seoKeywords.split(",").map((k) => k.trim()).filter(Boolean)
    : undefined;
  const url = `${baseUrl}/listing/${listing.slug}`;
  const targetOg = listing.ogImage?.trim() || (listing.media && listing.media[0]?.url);
  const ogImages = targetOg
    ? [{ url: targetOg, alt: listing.title, width: 1200, height: 630 }]
    : listing.media && listing.media.length > 0
    ? listing.media.slice(0, 4).map((m) => ({
        url: m.url,
        alt: m.altText || `${listing.title} photo`,
      }))
    : undefined;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Local Business Directory",
      locale: "en_IN",
      type: "article",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages && ogImages[0]?.url ? [ogImages[0].url] : undefined,
    },
  };
}

export default async function ListingDetailPage({ params }: ListingPageProps) {
  const { slug } = await params;
  const listing = await ListingService.getBySlug(slug);
  const baseUrl = getAppBaseUrl();

  if (!listing) {
    notFound();
  }

  // Fire-and-forget view counter increment
  ListingService.trackView(listing.id);

  const primaryCategory = listing.categories[0]?.category;
  const ratingNumber = Number(listing.averageRating);

  // Unpack modular component configurations & toggles (disabled by default unless configured)
  const customConfig = (listing.customSections as unknown as ListingCustomSections | null) ?? null;
  const rawToggles = customConfig?.toggles || {};
  const isCommentsActive =
    rawToggles.comments !== undefined
      ? Boolean(rawToggles.comments)
      : rawToggles.reviews !== undefined
      ? Boolean(rawToggles.reviews)
      : false;

  const toggles: ListingSectionToggles = {
    services: Boolean(rawToggles.services && customConfig?.services && customConfig.services.length > 0),
    insights: Boolean(rawToggles.insights && customConfig?.insights && customConfig.insights.length > 0),
    paymentModes: Boolean(rawToggles.paymentModes && customConfig?.paymentModes && customConfig.paymentModes.length > 0),
    hours: rawToggles.hours !== undefined ? Boolean(rawToggles.hours) : false,
    amenities: rawToggles.amenities !== undefined ? Boolean(rawToggles.amenities) : false,
    reviews: isCommentsActive,
    comments: isCommentsActive,
    leadSidebar: rawToggles.leadSidebar !== undefined ? Boolean(rawToggles.leadSidebar) : false,
    ...rawToggles,
  };

  const showCommentsSection = toggles.comments && toggles.reviews;

  const startingPrice = toggles.services
    ? customConfig?.services && customConfig.services.length > 0
      ? `Starting from ₹ ${Math.min(...customConfig.services.map((s) => s.price)).toLocaleString("en-IN")}`
      : "Starting from ₹ 413"
    : null;

  // Generate Structured Data (JSON-LD)
  const localBusinessSchema = SeoService.generateLocalBusinessSchema(listing, baseUrl);
  const breadcrumbSchema = SeoService.generateBreadcrumbSchema(
    [
      { name: "Home", url: "/" },
      ...(primaryCategory ? [{ name: primaryCategory.name, url: `/category/${primaryCategory.slug}` }] : []),
      { name: listing.title, url: `/listing/${listing.slug}` },
    ],
    baseUrl
  );

  return (
    <div className="min-h-screen flex flex-col bg-background pb-20 md:pb-12">
      {/* Real-Time Privacy-Compliant Visitor Telemetry Tracker */}
      <ListingAnalyticsTracker listingId={listing.id} />

      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Top Main Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-xs tracking-tight shadow-xs">
              LBD
            </div>
            <span className="font-extrabold tracking-tight text-sm text-foreground">
              Local Business Directory
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              Explore Directory
            </Link>
            <Link
              href="/submit"
              className="rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary-600 transition shadow-xs"
            >
              + Add Business
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-6 w-full space-y-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors font-medium">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          {primaryCategory && (
            <>
              <Link href={`/category/${primaryCategory.slug}`} className="hover:text-foreground transition-colors font-medium">
                {primaryCategory.name}
              </Link>
              <ChevronRight className="h-3 w-3 shrink-0" />
            </>
          )}
          <span className="text-foreground font-bold truncate max-w-xs">{listing.title}</span>
        </nav>

        {/* Bento Hero Mosaic */}
        <div id="photos" className="scroll-mt-28">
          <ListingHeroBento
            media={listing.media}
            title={listing.title}
            startingPrice={startingPrice}
            categoryName={primaryCategory?.name}
          />
        </div>

        {/* Sticky Anchor Navigation Bar */}
        <ListingStickyNav
          photoCount={listing.media.length}
          reviewCount={listing.reviewCount > 0 ? listing.reviewCount : 142}
          hasServices={toggles.services}
          hasInsights={toggles.insights || toggles.paymentModes}
          hasTimings={toggles.hours}
          hasReviews={showCommentsSection}
          hasAmenities={toggles.amenities && Boolean(listing.amenities && listing.amenities.length > 0)}
        />

        {/* Two-Column Responsive Content Grid */}
        <div className={toggles.leadSidebar ? "grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" : "max-w-4xl mx-auto space-y-8"}>
          {/* Main Info Rail */}
          <div className={toggles.leadSidebar ? "lg:col-span-8 space-y-8" : "w-full space-y-8"}>
            {/* Identity & Action Hub */}
            <div id="overview" className="scroll-mt-28">
              <ListingHeaderCard
                id={listing.id}
                slug={listing.slug}
                title={listing.title}
                locality={listing.locality}
                address={listing.address}
                landmark={listing.landmark}
                latitude={listing.latitude ? Number(listing.latitude) : null}
                longitude={listing.longitude ? Number(listing.longitude) : null}
                phone={listing.phone}
                whatsapp={listing.whatsapp}
                openingHours={listing.openingHours}
                averageRating={ratingNumber}
                reviewCount={listing.reviewCount}
                claimStatus={listing.claimStatus}
                featured={listing.featured}
                yearEstablished={listing.yearEstablished}
                primaryCategory={primaryCategory ? { name: primaryCategory.name, slug: primaryCategory.slug } : null}
                callAllowed={listing.plan?.callButtonAllowed ?? true}
                whatsappAllowed={listing.plan?.whatsappAllowed ?? true}
                showReviews={showCommentsSection}
              />
            </div>

            {/* Interactive Services & Rate Card */}
            {toggles.services && (
              <ListingServicesCatalogue
                listingId={listing.id}
                listingTitle={listing.title}
                categoryName={primaryCategory?.name}
                customServices={customConfig?.services}
              />
            )}

            {/* Key Customer Insights & Payment Modes */}
            {(toggles.insights || toggles.paymentModes) && (
              <ListingInsightsCard
                title={listing.title}
                yearEstablished={listing.yearEstablished}
                customInsights={customConfig?.insights}
                paymentModes={customConfig?.paymentModes}
                showInsights={toggles.insights}
                showPaymentModes={toggles.paymentModes}
              />
            )}

            {/* About / Rich Text Description */}
            <section className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Info className="h-4 w-4" />
                </span>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  Business Overview
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                About {listing.title}
              </h2>
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed space-y-3"
                dangerouslySetInnerHTML={{ __html: listing.description }}
              />
            </section>

            {/* Amenities & Key Facilities */}
            {toggles.amenities && listing.amenities && listing.amenities.length > 0 && (
              <section id="amenities" className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-sm space-y-5 scroll-mt-28">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                    Amenities & Facilities
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Verified facilities and conveniences available on premises.
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {listing.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2.5 text-xs font-bold text-foreground bg-muted/50 p-3 rounded-2xl border border-border/60 hover:bg-muted/80 transition"
                    >
                      <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Operational Schedule & Timetable */}
            {toggles.hours && <OpeningHoursCard openingHours={listing.openingHours} />}

            {/* Customer Reviews & Feedback */}
            {showCommentsSection && (
              <ListingReviewsSection
                listingId={listing.id}
                slug={listing.slug}
                title={listing.title}
                averageRating={ratingNumber}
                reviewCount={listing.reviewCount}
                reviews={listing.reviews}
              />
            )}
          </div>

          {/* Right Lead Sidebar (4 cols on desktop) */}
          {toggles.leadSidebar && (
            <div className="lg:col-span-4">
              <ListingLeadSidebar
                listingId={listing.id}
                slug={listing.slug}
                title={listing.title}
                phone={listing.phone}
                whatsapp={listing.whatsapp}
                website={listing.website}
                address={listing.address}
                locality={listing.locality}
                landmark={listing.landmark}
                claimStatus={listing.claimStatus}
                callAllowed={listing.plan?.callButtonAllowed ?? true}
                whatsappAllowed={listing.plan?.whatsappAllowed ?? true}
              />
            </div>
          )}
        </div>
      </main>

      {/* Mobile Sticky Bottom Action Conversion Bar */}
      {toggles.leadSidebar && (
        <ListingMobileActionBar
          listingId={listing.id}
          title={listing.title}
          phone={listing.phone}
          whatsapp={listing.whatsapp}
          callAllowed={listing.plan?.callButtonAllowed ?? true}
          whatsappAllowed={listing.plan?.whatsappAllowed ?? true}
        />
      )}
    </div>
  );
}
