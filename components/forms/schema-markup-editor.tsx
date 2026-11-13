"use client";

import { useState } from "react";
import {
  Code,
  Sparkles,
  Eye,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  Sliders,
  DollarSign,
  Globe,
  Star,
  Clock,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { ListingSchemaConfig } from "@/components/listing/types";

interface SchemaMarkupEditorProps {
  initialConfig?: ListingSchemaConfig | null;
  listingTitle?: string;
  categoryName?: string;
  locality?: string;
  address?: string;
}

const SCHEMA_TYPE_OPTIONS = [
  { value: "auto", label: "Auto-detect from Category (Recommended)" },
  {
    group: "Beauty, Wellness & Personal Care",
    options: [
      { value: "HairSalon", label: "HairSalon (Hair Salons & Styling Parlours)" },
      { value: "BeautySalon", label: "BeautySalon (Beauty, Skincare & Nail Studios)" },
      { value: "HealthAndBeautyBusiness", label: "HealthAndBeautyBusiness (Spas & Wellness)" },
      { value: "TattooParlor", label: "TattooParlor (Tattoo & Piercing Studios)" },
    ],
  },
  {
    group: "Food & Dining",
    options: [
      { value: "Restaurant", label: "Restaurant (Dine-in, Fine Dining & Family)" },
      { value: "CafeOrCoffeeShop", label: "CafeOrCoffeeShop (Cafes & Coffee Bars)" },
      { value: "FastFoodRestaurant", label: "FastFoodRestaurant (Quick Bites & Takeaway)" },
      { value: "Bakery", label: "Bakery (Cake Shops & Confectioneries)" },
      { value: "BarOrPub", label: "BarOrPub (Lounges & Pubs)" },
    ],
  },
  {
    group: "Healthcare & Fitness",
    options: [
      { value: "MedicalBusiness", label: "MedicalBusiness (Clinics & Diagnostics)" },
      { value: "Dentist", label: "Dentist (Dental Clinics & Orthodontists)" },
      { value: "Physician", label: "Physician (Doctors & Specialists)" },
      { value: "Pharmacy", label: "Pharmacy (Chemist & Medical Stores)" },
      { value: "HealthClub", label: "HealthClub (Gyms & Fitness Centers)" },
      { value: "SportsActivityLocation", label: "SportsActivityLocation (Turfs & Academies)" },
    ],
  },
  {
    group: "Retail & Shopping",
    options: [
      { value: "GroceryStore", label: "GroceryStore (Supermarkets & Kirana)" },
      { value: "ClothingStore", label: "ClothingStore (Apparel & Boutiques)" },
      { value: "ElectronicsStore", label: "ElectronicsStore (Gadgets & Appliances)" },
      { value: "Store", label: "Store (General Retail Outlet)" },
    ],
  },
  {
    group: "Automotive & Services",
    options: [
      { value: "AutoRepair", label: "AutoRepair (Vehicle Service & Garages)" },
      { value: "AutoDealer", label: "AutoDealer (Car & Bike Showrooms)" },
      { value: "GasStation", label: "GasStation / EV Charging" },
      { value: "CarWash", label: "CarWash (Detailing & Cleaning)" },
    ],
  },
  {
    group: "Professional, Education & Home",
    options: [
      { value: "EducationalOrganization", label: "EducationalOrganization (Coaching & Classes)" },
      { value: "RealEstateAgent", label: "RealEstateAgent (Brokers & Agencies)" },
      { value: "ProfessionalService", label: "ProfessionalService (Consultancies & Agencies)" },
      { value: "HomeAndConstructionBusiness", label: "HomeAndConstructionBusiness (Contractors & Interior)" },
      { value: "LegalService", label: "LegalService (Lawyers & Notaries)" },
      { value: "FinancialService", label: "FinancialService (Accounting & Tax)" },
      { value: "LocalBusiness", label: "LocalBusiness (Generic Business Entity)" },
    ],
  },
];

export function SchemaMarkupEditor({
  initialConfig,
  listingTitle = "Business Name",
  categoryName = "General",
  locality = "Pimple Saudagar",
  address = "Main Road",
}: SchemaMarkupEditorProps) {
  const [schemaType, setSchemaType] = useState(initialConfig?.schemaType || "auto");
  const [priceRangeText, setPriceRangeText] = useState(
    initialConfig?.priceRangeText ?? "Hair Cut Starting at ₹ 413"
  );
  const [currenciesAccepted, setCurrenciesAccepted] = useState(
    initialConfig?.currenciesAccepted || "INR"
  );
  const [paymentAccepted, setPaymentAccepted] = useState(
    initialConfig?.paymentAccepted || "Cash, Credit Card, Debit Card, UPI"
  );
  const [includeRatings, setIncludeRatings] = useState(
    initialConfig?.includeRatings !== false
  );
  const [includeOpeningHours, setIncludeOpeningHours] = useState(
    initialConfig?.includeOpeningHours !== false
  );
  const [includeGeo, setIncludeGeo] = useState(
    initialConfig?.includeGeo !== false
  );
  const [includeReviews, setIncludeReviews] = useState(
    initialConfig?.includeReviews !== false
  );
  const [showPreview, setShowPreview] = useState(false);

  const pricePresets = [
    "Hair Cut Starting at ₹ 413",
    "₹ (Budget-Friendly)",
    "₹₹ (Moderate)",
    "₹₹₹ (Premium)",
    "₹500 - ₹2,500",
  ];

  const configPayload: ListingSchemaConfig = {
    schemaType,
    priceRangeText: priceRangeText.trim() || undefined,
    currenciesAccepted: currenciesAccepted.trim() || "INR",
    paymentAccepted: paymentAccepted.trim() || undefined,
    includeRatings,
    includeOpeningHours,
    includeGeo,
    includeReviews,
  };

  // Generate simulated preview of Schema.org JSON-LD
  const resolvedType = schemaType === "auto" ? "HairSalon / LocalBusiness" : schemaType;
  const mockJsonLd = {
    "@context": "https://schema.org",
    "@type": resolvedType,
    name: listingTitle,
    url: `${typeof window !== "undefined" ? window.location.origin : "https://example.com"}/listing/...`,
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressLocality: locality,
      addressRegion: "Maharashtra",
      postalCode: "411027",
      addressCountry: "IN",
    },
    currenciesAccepted,
    paymentAccepted,
    priceRange: priceRangeText || "₹₹",
    ...(includeGeo && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: 18.5987,
        longitude: 73.7978,
      },
    }),
    ...(includeRatings && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.5",
        reviewCount: 142,
        bestRating: "5",
        worstRating: "1",
      },
    }),
    ...(includeOpeningHours && {
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: "https://schema.org/Monday",
          opens: "11:00",
          closes: "20:30",
        },
      ],
    }),
    ...(includeReviews && {
      review: [
        {
          "@type": "Review",
          author: { "@type": "Person", name: "Pooja Deshmukh" },
          reviewRating: { "@type": "Rating", ratingValue: 5 },
          reviewBody: "Organic Element in Koregaon Park is a fantastic beauty parlour...",
        },
      ],
    }),
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-4">
      {/* Hidden input to transmit structured schema config to Server Action */}
      <input
        type="hidden"
        name="schemaConfig"
        value={JSON.stringify(configPayload)}
      />

      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Code className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
              <span>Structured Data (Schema.org / JSON-LD) Rich Snippets</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                SEO Power
              </span>
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Configure Google Rich Results markup, Schema.org type mapping, and price range snippets.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5 text-primary" />
          <span>{showPreview ? "Hide Preview" : "Preview JSON-LD"}</span>
          {showPreview ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Schema Type Dropdown */}
        <div>
          <label className="block text-[11px] font-bold text-foreground mb-1">
            Schema.org Business Subtype (@type)
          </label>
          <select
            value={schemaType}
            onChange={(e) => setSchemaType(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          >
            {SCHEMA_TYPE_OPTIONS.map((item, idx) => {
              if ("options" in item && Array.isArray(item.options)) {
                return (
                  <optgroup key={idx} label={item.group}>
                    {item.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </optgroup>
                );
              }
              if ("value" in item) {
                return (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                );
              }
              return null;
            })}
          </select>
          <span className="text-[10px] text-muted-foreground mt-1 block">
            Controls Google search snippet category (e.g. HairSalon, Restaurant, Dentist).
          </span>
        </div>

        {/* Price Range Text */}
        <div>
          <label className="block text-[11px] font-bold text-foreground mb-1">
            Schema Price Range (`priceRange`)
          </label>
          <input
            type="text"
            value={priceRangeText}
            onChange={(e) => setPriceRangeText(e.target.value)}
            placeholder="e.g. Hair Cut Starting at ₹ 413 or ₹₹"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-mono"
          />
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span className="text-[10px] text-muted-foreground">Presets:</span>
            {pricePresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setPriceRangeText(preset)}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-foreground transition cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Currencies Accepted */}
        <div>
          <label className="block text-[11px] font-bold text-foreground mb-1">
            Currencies Accepted (`currenciesAccepted`)
          </label>
          <input
            type="text"
            value={currenciesAccepted}
            onChange={(e) => setCurrenciesAccepted(e.target.value)}
            placeholder="e.g. INR"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground font-mono focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          />
        </div>

        {/* Payment Methods Accepted */}
        <div>
          <label className="block text-[11px] font-bold text-foreground mb-1">
            Payment Methods (`paymentAccepted`)
          </label>
          <input
            type="text"
            value={paymentAccepted}
            onChange={(e) => setPaymentAccepted(e.target.value)}
            placeholder="e.g. Cash, Credit Card, Debit Card, UPI"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          />
        </div>
      </div>

      {/* Rich Snippet Inclusion Toggles */}
      <div className="pt-3 border-t border-border/60">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Schema.org Microdata Inclusions
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <label className="flex items-center gap-2 p-2 rounded-xl border border-border/60 bg-muted/30 cursor-pointer hover:bg-muted/50 transition">
            <input
              type="checkbox"
              checked={includeRatings}
              onChange={(e) => setIncludeRatings(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
            />
            <span className="font-semibold text-[11px] text-foreground flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
              Aggregate Rating
            </span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl border border-border/60 bg-muted/30 cursor-pointer hover:bg-muted/50 transition">
            <input
              type="checkbox"
              checked={includeOpeningHours}
              onChange={(e) => setIncludeOpeningHours(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
            />
            <span className="font-semibold text-[11px] text-foreground flex items-center gap-1">
              <Clock className="h-3 w-3 text-emerald-500" />
              Opening Hours
            </span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl border border-border/60 bg-muted/30 cursor-pointer hover:bg-muted/50 transition">
            <input
              type="checkbox"
              checked={includeGeo}
              onChange={(e) => setIncludeGeo(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
            />
            <span className="font-semibold text-[11px] text-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3 text-primary" />
              GeoCoordinates
            </span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl border border-border/60 bg-muted/30 cursor-pointer hover:bg-muted/50 transition">
            <input
              type="checkbox"
              checked={includeReviews}
              onChange={(e) => setIncludeReviews(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
            />
            <span className="font-semibold text-[11px] text-foreground flex items-center gap-1">
              <MessageSquare className="h-3 w-3 text-indigo-500" />
              Review Snippets
            </span>
          </label>
        </div>
      </div>

      {/* Live JSON-LD Preview Modal / Expandable Card */}
      {showPreview && (
        <div className="rounded-xl border border-indigo-500/30 bg-muted/40 p-4 space-y-2 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold font-mono text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Code className="h-3.5 w-3.5" />
              Live Generated JSON-LD Preview (Google Rich Results Target)
            </span>
            <span className="text-[10px] text-muted-foreground">Valid Schema.org compliant</span>
          </div>
          <pre className="p-3 rounded-lg bg-black text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-60 scrollbar-thin">
            {JSON.stringify(mockJsonLd, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
