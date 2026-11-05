"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateListingAdminAction, ActionState } from "@/actions/listing";
import { ContentBlockEditor } from "@/components/forms/content-block-editor";
import { ImageUpload } from "@/components/forms/image-upload";
import {
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
  Link2,
} from "lucide-react";

interface AdminEditListingFormProps {
  listing: any;
  categories: Array<{ id: string; name: string; parentId: string | null }>;
  locations: Array<{ id: string; name: string }>;
  plans: Array<{ id: string; name: string; priceMinor: number }>;
  users: Array<{ id: string; name: string; email: string; role: string }>;
}

const POPULAR_AMENITIES = [
  "Air Conditioned",
  "Free Wi-Fi",
  "Parking Available",
  "Wheelchair Accessible",
  "UPI / Online Payment",
  "Credit / Debit Cards",
  "Home Delivery",
  "Washroom Available",
  "Waiting Lounge",
  "Open 7 Days",
  "Valet Parking",
  "EV Charging Nearby",
];

const LOCALITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "Pimple Saudagar": { lat: 18.5987, lng: 73.7978 },
  "Kunal Icon Road": { lat: 18.5992, lng: 73.7925 },
  "Kokane Chowk": { lat: 18.6015, lng: 73.7989 },
  "Shivar Chowk": { lat: 18.5954, lng: 73.7942 },
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

export function AdminEditListingForm({
  listing,
  categories,
  locations,
  plans,
  users,
}: AdminEditListingFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(
    updateListingAdminAction,
    null
  );

  const primaryCategory = listing.categories[0]?.categoryId || categories[0]?.id || "";
  const primaryLocation = listing.locations[0]?.locationId || locations[0]?.id || "";

  const [title, setTitle] = useState(listing.title || "");
  const [slug, setSlug] = useState(listing.slug || "");
  const [selectedLocation, setSelectedLocation] = useState(primaryLocation);
  const [localityText, setLocalityText] = useState(listing.locality || "Pimple Saudagar");
  const [latitude, setLatitude] = useState(listing.latitude ? listing.latitude.toString() : "");
  const [longitude, setLongitude] = useState(listing.longitude ? listing.longitude.toString() : "");
  const [geoDetecting, setGeoDetecting] = useState(false);

  // Amenities
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    listing.amenities || []
  );

  const initialImages = (listing.media || []).map((m: any) => ({
    url: m.url,
    name: m.altText || "Photo",
    mediaId: m.id,
  }));
  const [uploadedPhotos, setUploadedPhotos] = useState<Array<{ url: string }>>(initialImages);

  const initialDescSummary = listing.description ? htmlToPlainText(listing.description).slice(0, 160) : "";
  const initialOgImage = listing.ogImage || (initialImages[0]?.url ?? "");

  // SEO States - default populated from listing title, description, and feature image
  const [seoTitle, setSeoTitle] = useState(listing.seoTitle || listing.title || "");
  const [seoDescription, setSeoDescription] = useState(listing.seoDescription || initialDescSummary);
  const [seoKeywords, setSeoKeywords] = useState(listing.seoKeywords || "");
  const [ogImage, setOgImage] = useState(initialOgImage);
  const [descriptionHtml, setDescriptionHtml] = useState(listing.description || "");

  // Track if user manually customized SEO values
  const [isSeoTitleCustom, setIsSeoTitleCustom] = useState(Boolean(listing.seoTitle));
  const [isSeoDescCustom, setIsSeoDescCustom] = useState(Boolean(listing.seoDescription));
  const [isOgImageCustom, setIsOgImageCustom] = useState(Boolean(listing.ogImage));

  const handleLocationChange = (locId: string) => {
    setSelectedLocation(locId);
    const loc = locations.find((l) => l.id === locId);
    if (loc) {
      setLocalityText(loc.name);
      const preset = LOCALITY_COORDINATES[loc.name];
      if (preset && !latitude && !longitude) {
        setLatitude(preset.lat.toString());
        setLongitude(preset.lng.toString());
      }
    }
  };

  const handleApplyPresetCoords = (lat: number, lng: number) => {
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
        alert("Failed to retrieve location: " + err.message);
        setGeoDetecting(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };


  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
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
    setSeoTitle(title);
    const plain = htmlToPlainText(descriptionHtml);
    setSeoDescription(plain.slice(0, 160));
    if (uploadedPhotos.length > 0 && uploadedPhotos[0]?.url) {
      setOgImage(uploadedPhotos[0].url);
    }
    setIsSeoTitleCustom(false);
    setIsSeoDescCustom(false);
    setIsOgImageCustom(false);
  };

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  // Google SERP Preview computed values
  const previewTitle =
    seoTitle.trim() ||
    `${title || "Business Name"} in ${localityText}, Pimple Saudagar | Directory`;
  const previewDesc =
    seoDescription.trim() ||
    `Contact details, opening hours, photos, ratings, and customer reviews for ${
      title || "Business"
    } in ${localityText}, Pimple Saudagar.`;

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="listingId" value={listing.id} />

      {/* Success Notification */}
      {state?.success && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-emerald-800 dark:text-emerald-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>Listing Updated Successfully!</span>
          </div>
          <p className="text-xs">
            All updates and media changes have been saved to the directory database.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <Link
              href={`/listing/${state.slug || slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
            >
              <span>View Updated Listing</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
            <Link
              href="/admin/listings"
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline"
            >
              ← Back to Directory List
            </Link>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {state?.error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Update Failed</h4>
            <p className="text-xs mt-0.5">{state.error}</p>
          </div>
        </div>
      )}

      {/* 1. Core Profile & Permanent URL */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b pb-3">
          <Store className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">1. Core Profile & Permanent URL</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-foreground mb-1">
              Business Name / Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Kokane Chowk Multi-Speciality Clinic"
              className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
            {state?.fieldErrors?.title && (
              <p className="text-xs text-destructive mt-1">{state.fieldErrors.title[0]}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-foreground mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-primary" />
                <span>Permanent URL Slug *</span>
              </span>
              <span className="text-[11px] text-muted-foreground font-normal">
                https://pimplesaudagar.org/listing/{slug}
              </span>
            </label>
            <div className="flex items-center rounded-lg border bg-background overflow-hidden focus-within:border-primary">
              <span className="px-3 py-2 bg-muted text-xs text-muted-foreground border-r font-mono">
                /listing/
              </span>
              <input
                type="text"
                name="slug"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="kokane-chowk-clinic"
                className="flex-1 bg-transparent px-3 py-2 text-xs font-mono text-foreground focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Keep this URL slug permanent for strong SEO indexation. Only modify if rebranding or correcting an error.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Primary Category *
            </label>
            <select
              name="categoryId"
              required
              defaultValue={primaryCategory}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.parentId ? `↳ ${c.name}` : c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Locality in Pimple Saudagar *
            </label>
            <select
              name="locationId"
              required
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
            <input type="hidden" name="locality" value={localityText} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-foreground mb-1">
              Full Street Address *
            </label>
            <input
              type="text"
              name="address"
              required
              defaultValue={listing.address}
              placeholder="Shop/Office No., Wing, Building Name, Street Name, Pimple Saudagar, Pune - 411027"
              className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Nearby Landmark
            </label>
            <input
              type="text"
              name="landmark"
              defaultValue={listing.landmark || ""}
              placeholder="Opposite Govind Garden / Near Kunal Icon"
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
              defaultValue={listing.yearEstablished || ""}
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
            <span>Listing Description & HTML Content Blocks *</span>
            <span className="text-[10px] font-normal text-muted-foreground">
              (Visual WYSIWYG preview & raw HTML code blocks supported)
            </span>
          </label>
          <ContentBlockEditor
            name="description"
            initialValue={listing.description}
            error={state?.fieldErrors?.description?.[0]}
            onChange={handleDescriptionChange}
          />
        </div>

        {/* Business Showcase Photos */}
        <div className="pt-4 border-t">
          <ImageUpload
            initialImages={initialImages}
            name="imageUrls"
            maxPhotos={15}
            label="Listing Showcase Photos & Media"
            description="Upload storefront, menu, and facility photos. The first image will be set as the main directory cover image."
            onChange={handlePhotosChange}
            onSetOgImage={(url) => { setOgImage(url); setIsOgImageCustom(true); }}
          />
        </div>
      </div>

      {/* 2. Geolocation Coordinates (GPS) */}
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
              Latitude (e.g. 18.598700) *
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
              Longitude (e.g. 73.797800) *
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

        {/* Quick Locality Presets */}
        <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-2">
          <p className="text-[11px] font-semibold text-foreground">
            Quick Locality Presets for Pimple Saudagar:
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(LOCALITY_COORDINATES).map(([name, coords]) => (
              <button
                key={name}
                type="button"
                onClick={() => handleApplyPresetCoords(coords.lat, coords.lng)}
                className="text-[11px] font-medium rounded-md border bg-background px-2.5 py-1 text-muted-foreground hover:text-foreground hover:border-primary/50 transition"
              >
                📍 {name} ({coords.lat}, {coords.lng})
              </button>
            ))}
          </div>
        </div>
      </div>



      {/* 3. Contact & Channels */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b pb-3">
          <Phone className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">3. Contact & Direct Channels</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Primary Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              defaultValue={listing.phone || ""}
              placeholder="+91 98765 43210"
              className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              WhatsApp Contact Number
            </label>
            <input
              type="tel"
              name="whatsapp"
              defaultValue={listing.whatsapp || ""}
              placeholder="+91 98765 43210"
              className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Official Email Address
            </label>
            <input
              type="email"
              name="email"
              defaultValue={listing.email || ""}
              placeholder="contact@business.com"
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
              defaultValue={listing.website || ""}
              placeholder="https://www.business.com"
              className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4. Amenities & Facilities */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <Tag className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">4. Amenities & Facilities</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {POPULAR_AMENITIES.map((amenity) => {
            const checked = selectedAmenities.includes(amenity);
            return (
              <label
                key={amenity}
                className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs font-medium cursor-pointer transition ${
                  checked
                    ? "bg-primary/10 border-primary text-primary"
                    : "hover:bg-muted/40 text-foreground"
                }`}
              >
                <input
                  type="checkbox"
                  name="amenities"
                  value={amenity}
                  checked={checked}
                  onChange={() => toggleAmenity(amenity)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span>{amenity}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 5. Administrative Controls */}
      <div className="rounded-2xl border border-red-500/20 bg-card p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b pb-3">
          <ShieldCheck className="h-5 w-5 text-red-600" />
          <h2 className="text-base font-bold text-foreground">5. Administrative Controls</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Publication Status
            </label>
            <select
              name="status"
              defaultValue={listing.status}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="published">Published (Live to public)</option>
              <option value="pending_review">Pending Review</option>
              <option value="draft">Draft (Hidden)</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Claim / Verification Status
            </label>
            <select
              name="claimStatus"
              defaultValue={listing.claimStatus}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="verified">Verified Business</option>
              <option value="claimed">Claimed</option>
              <option value="unclaimed">Unclaimed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Subscription Plan
            </label>
            <select
              name="planId"
              defaultValue={listing.planId || ""}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">-- Free Tier Default --</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (₹{p.priceMinor / 100})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Assigned Account Owner
            </label>
            <select
              name="ownerId"
              defaultValue={listing.ownerId || ""}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">-- No Owner Assigned --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email}) [{u.role}]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Search Priority (0 to 100)
            </label>
            <input
              type="number"
              name="priority"
              defaultValue={listing.priority || 0}
              min="0"
              max="100"
              className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                value="true"
                defaultChecked={listing.featured}
                className="rounded border-border text-red-600 focus:ring-red-600 h-4 w-4"
              />
              <span className="text-xs font-bold text-foreground">
                Feature on Homepage & Spotlight
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* 6. Search Engine Optimization (SEO) */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-base font-bold text-foreground">
                6. Search Engine Optimization (SEO &amp; Meta Tags)
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Configure search engine title, meta description, and keywords for Google indexation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAutoFillSeo}
            className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Auto-fill from Content</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-foreground">
                SEO Meta Title
              </label>
              <span
                className={`text-[10px] font-mono ${
                  seoTitle.length > 60 ? "text-amber-500 font-bold" : "text-muted-foreground"
                }`}
              >
                {seoTitle.length} / 60 recommended (max 120)
              </span>
            </div>
            <input
              type="text"
              name="seoTitle"
              value={seoTitle}
              onChange={(e) => { setSeoTitle(e.target.value); setIsSeoTitleCustom(true); }}
              placeholder="e.g. Best Dental Clinic in Kokane Chowk, Pimple Saudagar | Dr. Sharma"
              maxLength={120}
              className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-foreground">
                SEO Meta Description
              </label>
              <span
                className={`text-[10px] font-mono ${
                  seoDescription.length > 160 ? "text-amber-500 font-bold" : "text-muted-foreground"
                }`}
              >
                {seoDescription.length} / 160 recommended (max 320)
              </span>
            </div>
            <textarea
              name="seoDescription"
              rows={3}
              value={seoDescription}
              onChange={(e) => { setSeoDescription(e.target.value); setIsSeoDescCustom(true); }}
              placeholder="e.g. Looking for reliable dental care in Pimple Saudagar? Dr. Sharma's Clinic at Kokane Chowk provides painless root canals, implants, and teeth cleaning."
              maxLength={320}
              className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              SEO Keywords (Comma Separated)
            </label>
            <input
              type="text"
              name="seoKeywords"
              value={seoKeywords}
              onChange={(e) => setSeoKeywords(e.target.value)}
              placeholder="e.g. dentist in pimple saudagar, dental clinic kokane chowk, teeth whitening pune"
              maxLength={250}
              className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5 text-red-500" />
                <span>Open Graph Social Share Banner (WhatsApp, Twitter, LinkedIn)</span>
              </label>
              <span className="text-[10px] text-muted-foreground">
                Optimal: 1200x630px
              </span>
            </div>
            <input
              type="url"
              name="ogImage"
              value={ogImage}
              onChange={(e) => { setOgImage(e.target.value); setIsOgImageCustom(true); }}
              placeholder="https://... or click a photo below"
              className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:border-indigo-500 focus:outline-none"
            />
            {uploadedPhotos.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  Quick Select from Gallery Photos:
                </span>
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
          </div>

          {/* Social Open Graph Preview Card */}
          <div className="rounded-xl border border-indigo-500/20 bg-background/80 p-4 space-y-2 mt-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Share2 className="h-3 w-3 text-red-500" />
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
                <p className="font-bold text-xs truncate">
                  {previewTitle}
                </p>
                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                  {previewDesc}
                </p>
                <span className="text-[9px] font-mono text-slate-400 uppercase mt-1 block">
                  PIMPLESUDAGAR.ORG • VERIFIED LISTING
                </span>
              </div>
            </div>
          </div>

          {/* Google SERP Search Snippet Preview */}
          <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-1">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Live Google Search Snippet Preview</span>
            </div>
            <div className="rounded-lg bg-card border p-3.5 shadow-sm space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                <span className="font-semibold text-foreground">pimplesaudagar.org</span>
                <span>›</span>
                <span>listing</span>
                <span>›</span>
                <span>{slug || "business-slug"}</span>
              </div>
              <h3 className="text-base text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer truncate">
                {previewTitle}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {previewDesc}
              </p>
            </div>
          </div>
        </div>
      </div>

            {/* Action Submit Buttons */}
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
          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-6 py-2.5 text-xs font-semibold text-white shadow hover:bg-amber-700 transition disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <span>Save & Update Listing</span>
          )}
        </button>
      </div>
    </form>
  );
}

