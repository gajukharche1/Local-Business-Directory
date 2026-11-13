"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createListingAdminAction, ActionState } from "@/actions/listing";
import { ContentBlockEditor } from "@/components/forms/content-block-editor";
import { ImageUpload } from "@/components/forms/image-upload";
import { OpeningHoursScheduler } from "@/components/forms/opening-hours-scheduler";
import { ModularSectionsManager } from "@/components/forms/modular-sections-manager";
import { SchemaMarkupEditor } from "@/components/forms/schema-markup-editor";
import { useOrigin } from "@/lib/hooks/use-origin";
import {
  Clock,
  Share2,
  Store,
  MapPin,
  Phone,
  Mail,
  Globe,
  Tag,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Compass,
  Search,
  Crosshair,
  ExternalLink,
} from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
  parentId: string | null;
}

interface LocationOption {
  id: string;
  name: string;
}

interface PlanOption {
  id: string;
  name: string;
  priceMinor: number;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminListingFormProps {
  categories: CategoryOption[];
  locations: LocationOption[];
  plans: PlanOption[];
  users: UserOption[];
}

const FIELD_SECTION_MAP: Record<string, { label: string; section: string }> = {
  title: { label: "Business Name / Title", section: "1. Business Profile" },
  categoryId: { label: "Primary Category", section: "1. Business Profile" },
  locationId: { label: "Locality / Location", section: "1. Business Profile" },
  address: { label: "Street Address", section: "1. Business Profile" },
  landmark: { label: "Nearby Landmark", section: "1. Business Profile" },
  yearEstablished: { label: "Year Established", section: "1. Business Profile" },
  description: { label: "Listing Description & Content", section: "1. Business Profile" },
  latitude: { label: "Latitude GPS Coordinate", section: "2. Geolocation Coordinates" },
  longitude: { label: "Longitude GPS Coordinate", section: "2. Geolocation Coordinates" },
  phone: { label: "Primary Phone Number", section: "3. Contact & Digital Channels" },
  whatsapp: { label: "WhatsApp Contact Number", section: "3. Contact & Digital Channels" },
  email: { label: "Official Email Address", section: "3. Contact & Digital Channels" },
  website: { label: "Official Website URL", section: "3. Contact & Digital Channels" },
  amenities: { label: "Amenities & Facilities", section: "3. Contact & Digital Channels" },
  status: { label: "Publication Status", section: "4. Admin Management Controls" },
  claimStatus: { label: "Claim / Verification Status", section: "4. Admin Management Controls" },
  planId: { label: "Subscription Plan", section: "4. Admin Management Controls" },
  ownerId: { label: "Assigned Owner", section: "4. Admin Management Controls" },
  priority: { label: "Search Priority", section: "4. Admin Management Controls" },
  seoTitle: { label: "SEO Meta Title", section: "5. Search Engine Optimization" },
  seoDescription: { label: "SEO Meta Description", section: "5. Search Engine Optimization" },
  seoKeywords: { label: "SEO Keywords Tag", section: "5. Search Engine Optimization" },
  ogImage: { label: "OpenGraph Banner Image", section: "5. Search Engine Optimization" },
};

const AVAILABLE_AMENITIES = [
  "Air Conditioning",
  "Free Wi-Fi",
  "Dedicated Parking",
  "Credit/Debit Cards Accepted",
  "UPI Payments Accepted",
  "Wheelchair Accessible",
  "Home Delivery",
  "Outdoor Seating",
  "Pet Friendly",
  "Restroom Available",
];

const LOCALITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "Pimple Saudagar": { lat: 18.5987, lng: 73.7978 },
  "Kunal Icon Road": { lat: 18.5992, lng: 73.7955 },
  "Kokane Chowk": { lat: 18.5954, lng: 73.7998 },
  "Shivar Chowk": { lat: 18.5998, lng: 73.7925 },
  "Govind Garden Area": { lat: 18.5971, lng: 73.8012 },
};


/** Strip HTML tags and decode common entities to produce plain text for SEO description. */
function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function AdminListingForm({
  categories,
  locations,
  plans,
  users,
}: AdminListingFormProps) {
  const router = useRouter();
  const { origin, host } = useOrigin();
  const [selectedLocation, setSelectedLocation] = useState(locations[0]?.id || "");
  const [localityText, setLocalityText] = useState(locations[0]?.name || "Pimple Saudagar");

  // Geolocation state
  const [latitude, setLatitude] = useState<string>("18.5987");
  const [longitude, setLongitude] = useState<string>("73.7978");
  const [geoDetecting, setGeoDetecting] = useState(false);

  // SEO state with auto-population tracking
  const [listingTitle, setListingTitle] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<Array<{ url: string }>>([]);
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [isSeoTitleCustom, setIsSeoTitleCustom] = useState(false);
  const [isSeoDescCustom, setIsSeoDescCustom] = useState(false);
  const [isOgImageCustom, setIsOgImageCustom] = useState(false);

  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(
    async (prev, formData) => {
      const res = await createListingAdminAction(prev, formData);
      if (res.success && res.slug) {
        setTimeout(() => {
          router.push("/admin/listings");
        }, 1500);
      }
      return res;
    },
    null
  );

  const handleTitleChange = (newTitle: string) => {
    setListingTitle(newTitle);
    if (!isSeoTitleCustom) {
      setSeoTitle(newTitle);
    }
  };

  const handleDescriptionChange = (newHtml: string) => {
    setDescriptionHtml(newHtml);
    if (!isSeoDescCustom) {
      const summary = htmlToPlainText(newHtml).slice(0, 160);
      setSeoDescription(summary);
    }
  };

  const handlePhotosChange = (photos: Array<{ url: string }>) => {
    setUploadedPhotos(photos);
    if (!isOgImageCustom && photos.length > 0 && photos[0]?.url) {
      setOgImage(photos[0].url);
    }
  };

  const handleAutoFillSeo = () => {
    setSeoTitle(listingTitle);
    const plain = htmlToPlainText(descriptionHtml);
    setSeoDescription(plain.slice(0, 160));
    if (uploadedPhotos.length > 0 && uploadedPhotos[0]?.url) {
      setOgImage(uploadedPhotos[0].url);
    }
    setIsSeoTitleCustom(false);
    setIsSeoDescCustom(false);
    setIsOgImageCustom(false);
  };

  const handleLocationChange = (locId: string) => {
    setSelectedLocation(locId);
    const loc = locations.find((l) => l.id === locId);
    if (loc) {
      setLocalityText(loc.name);
      const preset = LOCALITY_COORDINATES[loc.name];
      if (preset) {
        setLatitude(preset.lat.toString());
        setLongitude(preset.lng.toString());
      }
    }
  };

  const handleApplyPresetCoords = (name: string, lat: number, lng: number) => {
    setLatitude(lat.toString());
    setLongitude(lng.toString());
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGeoDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setGeoDetecting(false);
      },
      (err) => {
        alert("Failed to retrieve GPS location: " + err.message);
        setGeoDetecting(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Google preview computed values
  const previewTitle =
    seoTitle || (listingTitle ? `${listingTitle} in ${localityText}, Pimple Saudagar` : "Business Name | Local Business Directory");
  const previewDesc =
    seoDescription ||
    "Find contact phone, opening hours, WhatsApp, ratings, and customer reviews for verified businesses in Pimple Saudagar, PCMC.";

  return (
    <form action={formAction} className="space-y-8">
      {/* Error Notification with detailed invalid fields breakdown */}
      {state?.error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Action Failed — Please correct the invalid fields below:</h4>
              <p className="text-xs mt-0.5 opacity-90">{state.error}</p>
            </div>
          </div>

          {state.fieldErrors && Object.keys(state.fieldErrors).length > 0 && (
            <div className="rounded-lg bg-card/80 border border-destructive/20 p-3 space-y-2 mt-2">
              <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
                Fields needing attention:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(state.fieldErrors).map(([field, errs]) => {
                  const info = FIELD_SECTION_MAP[field] || { label: field, section: "General" };
                  return (
                    <div key={field} className="rounded-md border border-destructive/20 bg-background/80 p-2 text-xs">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-foreground">{info.label}</span>
                        <span className="text-[10px] text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded">
                          {info.section}
                        </span>
                      </div>
                      <p className="text-[11px] text-destructive font-medium mt-1">
                        → {errs.join(", ")}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {state?.success && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-emerald-600" />
          <div>
            <p className="font-semibold">Listing created successfully!</p>
            <p className="text-xs mt-0.5">Redirecting back to listings directory...</p>
          </div>
        </div>
      )}

      {/* 1. Core Business Information */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b pb-3">
          <Store className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">1. Business Profile Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-foreground mb-1">
              Business Title / Shop Name
            </label>
            <input
              type="text"
              name="title"
              value={listingTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Govind Garden Restaurant & Banquets"
              className={`w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none ${state?.fieldErrors?.title ? "border-destructive ring-1 ring-destructive bg-destructive/5" : "focus:border-primary"}`}
            />
            {state?.fieldErrors?.title && (
              <p className="text-xs text-destructive mt-1">{state.fieldErrors.title[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Primary Category
            </label>
            <select
              name="categoryId"
              className={`w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none ${state?.fieldErrors?.categoryId ? "border-destructive ring-1 ring-destructive bg-destructive/5" : "focus:border-primary"}`}
            >
              <option value="">-- Select Category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.parentId ? `↳ ${c.name}` : c.name}
                </option>
              ))}
            </select>
            {state?.fieldErrors?.categoryId && (
              <p className="text-xs text-destructive mt-1">{state.fieldErrors.categoryId[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Locality in Pimple Saudagar
            </label>
            <select
              name="locationId"
              value={selectedLocation}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
            {state?.fieldErrors?.locationId && <p className="text-xs text-destructive mt-1 font-medium">✕ {state.fieldErrors.locationId[0]}</p>}
            <input type="hidden" name="locality" value={localityText} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-foreground mb-1">
              Full Physical Address
            </label>
            <input
              type="text"
              name="address"
              placeholder="Shop No. 12, Ground Floor, Kunal Icon Commercial Complex, Pimple Saudagar, Pune - 411027"
              className={`w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none ${state?.fieldErrors?.address ? "border-destructive ring-1 ring-destructive bg-destructive/5" : "focus:border-primary"}`}
            />
            {state?.fieldErrors?.address && (
              <p className="text-xs text-destructive mt-1">{state.fieldErrors.address[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Nearby Landmark
            </label>
            <input
              type="text"
              name="landmark"
              placeholder="Opposite Roseland Residency / Near Kokane Chowk"
              className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Year Established
            </label>
            <input
              type="number"
              name="yearEstablished"
              placeholder="e.g. 2018"
              min="1950"
              max={new Date().getFullYear()}
              className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Content Area with Visual & HTML Code Editor */}
        <div className="pt-2 border-t">
          <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
            <span>Listing Description & HTML Content Blocks</span>
            <span className="text-[10px] font-normal text-muted-foreground">
              (Visual WYSIWYG preview & raw HTML code blocks supported)
            </span>
          </label>
          <ContentBlockEditor
            name="description"
            error={state?.fieldErrors?.description?.[0]}
          />
        </div>

        {/* Business Showcase Photos */}
        <div className="pt-4 border-t">
          <ImageUpload
            name="imageUrls"
            maxPhotos={15}
            label="Listing Showcase Photos & Media"
            description="Upload storefront, menu, and facility photos. The first image will be set as the main directory cover image."
          />
        </div>
      </div>

      {/* 2. Geolocation & Map Coordinates */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-base font-bold text-foreground">2. Geolocation Coordinates (GPS)</h2>
              <p className="text-[11px] text-muted-foreground">
                Powers pinpoint map markers on OpenStreetMap and distance filtering
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={geoDetecting}
            className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition"
          >
            {geoDetecting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Crosshair className="h-3.5 w-3.5 text-primary" />
            )}
            <span>Detect Current GPS</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Latitude (e.g. 18.598700)
            </label>
            <input
              type="number"
              step="any"
              name="latitude"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="18.598700"
              className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm font-mono text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Longitude (e.g. 73.797800)
            </label>
            <input
              type="number"
              step="any"
              name="longitude"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="73.797800"
              className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm font-mono text-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Quick Locality Coordinate Presets */}
        <div className="rounded-xl bg-muted/40 p-3 text-xs space-y-2">
          <span className="font-semibold text-muted-foreground block text-[11px]">
            Quick Presets for Pimple Saudagar Neighborhoods:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(LOCALITY_COORDINATES).map(([name, coords]) => (
              <button
                key={name}
                type="button"
                onClick={() => handleApplyPresetCoords(name, coords.lat, coords.lng)}
                className="rounded-md border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground hover:border-primary hover:text-primary transition"
              >
                📍 {name} ({coords.lat}, {coords.lng})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Contact & Online Presence */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b pb-3">
          <Phone className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">3. Contact & Digital Channels</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Direct Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="+919822001122"
              className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              WhatsApp Chat Number
            </label>
            <input
              type="tel"
              name="whatsapp"
              placeholder="+919822001122"
              className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Business Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="contact@business.local"
              className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Official Website URL
            </label>
            <input
              type="url"
              name="website"
              placeholder="https://mybusiness.in"
              className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Price Range Level
            </label>
            <select
              name="priceRange"
              defaultValue="2"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="1">₹ (Budget / Affordable)</option>
              <option value="2">₹₹ (Moderate / Standard)</option>
              <option value="3">₹₹₹ (Premium / Upscale)</option>
              <option value="4">₹₹₹₹ (Luxury / High-End)</option>
            </select>
          </div>
        </div>

        {/* Amenities Selection */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-foreground mb-2">
            Available Amenities & Services
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {AVAILABLE_AMENITIES.map((amenity) => (
              <label
                key={amenity}
                className="flex items-center gap-2 rounded-lg border p-2.5 text-xs text-foreground hover:bg-muted/40 cursor-pointer transition select-none"
              >
                <input
                  type="checkbox"
                  name="amenities"
                  value={amenity}
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                <span>{amenity}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Operating Hours & Schedule */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <Clock className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-base font-bold text-foreground">4. Operating Hours &amp; Schedule</h2>
            <p className="text-[11px] text-muted-foreground">
              Define weekly opening times and closed days for customer visibility &amp; schema markup
            </p>
          </div>
        </div>

        <OpeningHoursScheduler name="openingHours" />
      </div>

      {/* 5. Modular Frontend Sections & Components */}
      <div className="space-y-4">
        <ModularSectionsManager />
      </div>

      {/* 6. Administration & Status Controls */}
      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-red-500/20 pb-3">
          <ShieldCheck className="h-5 w-5 text-red-600" />
          <h2 className="text-base font-bold text-foreground">5. Admin Management Controls</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Directory Status
            </label>
            <select
              name="status"
              defaultValue="published"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground font-semibold focus:border-primary focus:outline-none"
            >
              <option value="published">Published (Live)</option>
              <option value="pending_review">Pending Review</option>
              <option value="draft">Draft</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Ownership / Verification
            </label>
            <select
              name="claimStatus"
              defaultValue="verified"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="verified">Verified Official</option>
              <option value="claimed">Claimed</option>
              <option value="unclaimed">Unclaimed Directory Entry</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Pricing Tier Plan
            </label>
            <select
              name="planId"
              defaultValue={plans[0]?.id || ""}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.priceMinor > 0 ? `(₹${p.priceMinor / 100}/yr)` : "(Free)"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Assign Business Owner
            </label>
            <select
              name="ownerId"
              defaultValue=""
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">-- Current Administrator --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role}) - {u.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              name="featured"
              value="true"
              className="rounded border-input text-primary focus:ring-primary h-4 w-4"
            />
            <span className="text-xs font-semibold text-foreground flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Feature on Homepage & Spotlight Section
            </span>
          </label>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-foreground whitespace-nowrap">
              Search Priority (0-10):
            </label>
            <input
              type="number"
              name="priority"
              defaultValue="5"
              min="0"
              max="10"
              className="w-20 rounded-lg border bg-background px-2.5 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 6. SEO Meta Settings & Google SERP Preview */}
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-indigo-500/20 pb-3">
          <Search className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h2 className="text-base font-bold text-foreground">6. Search Engine Optimization (SEO &amp; Meta Tags)</h2>
            <p className="text-[11px] text-muted-foreground">
              Configure meta tags and keyword indexation for Google, Bing, and social shares
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-foreground">
                SEO Meta Title
              </label>
              <span className={`text-[10px] font-mono ${seoTitle.length > 60 ? "text-amber-600 font-bold" : "text-muted-foreground"}`}>
                {seoTitle.length} / 60 characters
              </span>
            </div>
            <input
              type="text"
              name="seoTitle"
              value={seoTitle}
              onChange={(e) => { setSeoTitle(e.target.value); setIsSeoTitleCustom(true); }}
              placeholder="e.g. Govind Garden Restaurant | Best North Indian in Pimple Saudagar"
              className={`w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none ${state?.fieldErrors?.seoTitle ? "border-destructive ring-1 ring-destructive bg-destructive/5" : "focus:border-indigo-500"}`}
            />
            <span className="text-[10px] text-muted-foreground mt-0.5 block">
              Leave blank to automatically use business title + neighborhood format.
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-foreground">
                SEO Meta Description
              </label>
              <span className={`text-[10px] font-mono ${seoDescription.length > 160 ? "text-amber-600 font-bold" : "text-muted-foreground"}`}>
                {seoDescription.length} / 160 characters
              </span>
            </div>
            <textarea
              name="seoDescription"
              rows={2}
              value={seoDescription}
              onChange={(e) => { setSeoDescription(e.target.value); setIsSeoDescCustom(true); }}
              placeholder="e.g. Visit Govind Garden Restaurant on Kunal Icon Road, Pimple Saudagar. Authentic North Indian & coastal seafood with outdoor lawn seating. View menu & hours."
              className={`w-full rounded-lg border bg-background p-3 text-sm text-foreground focus:outline-none ${state?.fieldErrors?.seoDescription ? "border-destructive ring-1 ring-destructive bg-destructive/5" : "focus:border-indigo-500"}`}
            ></textarea>
            <span className="text-[10px] text-muted-foreground mt-0.5 block">
              Optimal length: 140–160 characters. Appears under the link in search results.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              SEO Keywords Tag (Comma-Separated)
            </label>
            <input
              type="text"
              name="seoKeywords"
              value={seoKeywords}
              onChange={(e) => setSeoKeywords(e.target.value)}
              placeholder="e.g. restaurants in pimple saudagar, family dining, punjabi food, kokane chowk dining, ac banquet hall"
              className={`w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none ${state?.fieldErrors?.seoKeywords ? "border-destructive ring-1 ring-destructive bg-destructive/5" : "focus:border-indigo-500"}`}
            />
            <span className="text-[10px] text-muted-foreground mt-0.5 block">
              Separate keywords with commas. Used for meta keywords tags and internal search matching.
            </span>
          </div>

          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-foreground">
                Open Graph Social Share Banner (1200x630)
              </label>
              {uploadedPhotos.length > 0 && (
                <span className="text-[10px] text-muted-foreground font-medium">
                  Select from uploaded photos or paste URL
                </span>
              )}
            </div>
            <input
              type="url"
              name="ogImage"
              value={ogImage}
              onChange={(e) => { setOgImage(e.target.value); setIsOgImageCustom(true); }}
              placeholder="https://... or click a photo below"
              className={`w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none ${state?.fieldErrors?.ogImage ? "border-destructive ring-1 ring-destructive bg-destructive/5" : "focus:border-indigo-500"}`}
            />
            {uploadedPhotos.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 items-center">
                <span className="text-[11px] font-semibold text-muted-foreground">Pick from listing photos:</span>
                {uploadedPhotos.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setOgImage(p.url); setIsOgImageCustom(true); }}
                    className={`relative h-11 w-16 rounded-md overflow-hidden border transition ${
                      ogImage === p.url ? "ring-2 ring-indigo-500 border-indigo-500" : "hover:border-primary opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img src={p.url} alt="Thumbnail" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <span className="text-[10px] text-muted-foreground mt-0.5 block">
              Used when shared on WhatsApp, Facebook, LinkedIn, or Twitter.
            </span>
          </div>

          {/* Social Open Graph Preview Card */}
          <div className="rounded-xl border border-indigo-500/20 bg-card p-4 space-y-2 mt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Share2 className="h-3 w-3 text-indigo-500" />
              Social Media (Open Graph / WhatsApp / Twitter) Preview
            </span>
            <div className="rounded-xl border overflow-hidden bg-background max-w-sm">
              {(ogImage || uploadedPhotos[0]?.url) ? (
                <div
                  className="h-32 bg-cover bg-center border-b"
                  style={{ backgroundImage: `url(${ogImage || uploadedPhotos[0]?.url})` }}
                />
              ) : (
                <div className="h-20 bg-muted/60 border-b flex items-center justify-center text-xs text-muted-foreground">
                  No OpenGraph Banner Selected
                </div>
              )}
              <div className="p-3">
                <p className="font-bold text-xs truncate text-foreground">{previewTitle}</p>
                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{previewDesc}</p>
                <span className="text-[9px] font-mono text-slate-400 uppercase mt-1 block" suppressHydrationWarning>
                  {host}
                </span>
              </div>
            </div>
          </div>

          {/* Live Google Search Result Preview */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-2 mt-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Globe className="h-3 w-3 text-indigo-500" />
              Live Google Search Snippet Preview
            </span>
            <div className="bg-background rounded-lg border p-3.5 space-y-1 font-sans">
              <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                <span suppressHydrationWarning>{origin}</span>
                <span>›</span>
                <span>listing</span>
                <span>›</span>
                <span className="text-slate-600 font-medium">
                  {listingTitle
                    ? listingTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                    : "business-slug"}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate cursor-pointer leading-tight">
                {previewTitle}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {previewDesc}
              </p>
            </div>
          </div>

          {/* Structured Data / Schema.org Rich Results Configuration */}
          <div className="pt-2">
            <SchemaMarkupEditor
              listingTitle={listingTitle || "Business Name"}
              locality={localityText}
            />
          </div>
        </div>
      </div>

      

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Link
          href="/admin/listings"
          className="rounded-lg border px-5 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted transition"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-2.5 text-xs font-semibold text-white shadow hover:bg-red-700 transition disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving Business Listing...</span>
            </>
          ) : (
            <span>Publish / Save Listing</span>
          )}
        </button>
      </div>
    </form>
  );
}
