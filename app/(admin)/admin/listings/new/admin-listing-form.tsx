"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createListingAdminAction, ActionState } from "@/actions/listing";
import {
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

export function AdminListingForm({
  categories,
  locations,
  plans,
  users,
}: AdminListingFormProps) {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState(locations[0]?.id || "");
  const [localityText, setLocalityText] = useState(locations[0]?.name || "Pimple Saudagar");

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

  const handleLocationChange = (locId: string) => {
    setSelectedLocation(locId);
    const loc = locations.find((l) => l.id === locId);
    if (loc) {
      setLocalityText(loc.name);
    }
  };

  return (
    <form action={formAction} className="space-y-8">
      {state?.error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{state.error}</p>
          </div>
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
              Business Title / Shop Name *
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Govind Garden Restaurant & Banquets"
              className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
            {state?.fieldErrors?.title && (
              <p className="text-xs text-destructive mt-1">{state.fieldErrors.title[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Primary Category *
            </label>
            <select
              name="categoryId"
              required
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
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
              Full Physical Address *
            </label>
            <input
              type="text"
              name="address"
              required
              placeholder="Shop No. 12, Ground Floor, Kunal Icon Commercial Complex, Pimple Saudagar, Pune - 411027"
              className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
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

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-foreground mb-1">
              Detailed Description *
            </label>
            <textarea
              name="description"
              required
              rows={4}
              placeholder="Describe services, specialities, doctor qualifications, menu highlights, or store offerings..."
              className="w-full rounded-lg border bg-background p-3 text-sm text-foreground focus:border-primary focus:outline-none"
            ></textarea>
            {state?.fieldErrors?.description && (
              <p className="text-xs text-destructive mt-1">{state.fieldErrors.description[0]}</p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Contact & Online Presence */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b pb-3">
          <Phone className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">2. Contact & Digital Channels</h2>
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

      {/* 3. Administration & Status Controls */}
      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-red-500/20 pb-3">
          <ShieldCheck className="h-5 w-5 text-red-600" />
          <h2 className="text-base font-bold text-foreground">3. Admin Management Controls</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Directory Status *
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
              Ownership / Verification *
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

