"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { submitListingPublicAction, ActionState } from "@/actions/listing";
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Globe,
  Tag,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  Building,
  User,
  Lock,
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
  slug: string;
  priceMinor: number;
  description: string;
  maxPhotos: number;
  badgeVisible: boolean;
  searchPriority: number;
}

interface CurrentUserProps {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface SubmitFormProps {
  categories: CategoryOption[];
  locations: LocationOption[];
  plans: PlanOption[];
  currentUser: CurrentUserProps | null;
}

const AVAILABLE_AMENITIES = [
  "Air Conditioning",
  "Free Wi-Fi",
  "Dedicated Customer Parking",
  "Credit/Debit Cards Accepted",
  "UPI / Google Pay / PhonePe Accepted",
  "Wheelchair Accessible",
  "Home Delivery Service",
  "Outdoor Seating",
  "Restroom Facilities",
  "Appointment / Booking Required",
];

export function SubmitListingForm({
  categories,
  locations,
  plans,
  currentUser,
}: SubmitFormProps) {
  const router = useRouter();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    plans.find((p) => p.slug === "free")?.id || plans[0]?.id || ""
  );
  const [selectedLocation, setSelectedLocation] = useState<string>(locations[0]?.id || "");
  const [localityText, setLocalityText] = useState<string>(locations[0]?.name || "Pimple Saudagar");

  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(
    async (prev, formData) => {
      const res = await submitListingPublicAction(prev, formData);
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

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-card p-8 md:p-12 text-center shadow-lg max-w-xl mx-auto space-y-6">
        <div className="h-16 w-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Listing Submitted Successfully!
          </h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Thank you for registering your business in the Pimple Saudagar Directory.
            Your listing has been submitted and is currently in the verification queue.
          </p>
        </div>

        <div className="rounded-xl border bg-muted/40 p-4 text-xs text-muted-foreground text-left space-y-2">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>What happens next?</span>
          </div>
          <p>
            1. Our local moderation team verifies business address and phone details.
          </p>
          <p>
            2. Once approved, your listing goes live across search results and interactive maps.
          </p>
          <p>
            3. You can manage opening hours, customer reviews, and photos anytime from your dashboard.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard/listings"
            className="w-full sm:w-auto rounded-lg bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-600 transition shadow"
          >
            Go to My Dashboard
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto rounded-lg border bg-background px-6 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition"
          >
            Explore Directory
          </Link>
        </div>
      </div>
    );
  }

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

      {/* 1. Account / Contact Information */}
      <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-card space-y-5">
        <div className="flex items-center gap-2 border-b pb-3">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">1. Merchant / Owner Information</h2>
        </div>

        {currentUser ? (
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Logged in as</p>
              <p className="text-sm font-bold text-foreground">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">{currentUser.email}</p>
            </div>
            <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase">
              {currentUser.role} Account
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-muted/40 p-4 text-xs text-muted-foreground flex items-center justify-between gap-4">
              <p>Already have an account in the directory?</p>
              <Link
                href="/login?redirectTo=/submit"
                className="font-bold text-primary hover:underline shrink-0"
              >
                Sign In First →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  name="ownerName"
                  required
                  placeholder="e.g. Ramesh Patil"
                  className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Your Email Address *
                </label>
                <input
                  type="email"
                  name="ownerEmail"
                  required
                  placeholder="ramesh@example.com"
                  className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  name="ownerPhone"
                  placeholder="+919876543210"
                  className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Set Account Password (Optional)
                </label>
                <input
                  type="password"
                  name="ownerPassword"
                  placeholder="••••••••••••"
                  className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  Leave blank to receive an auto-generated temporary access link.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Business Details */}
      <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-card space-y-5">
        <div className="flex items-center gap-2 border-b pb-3">
          <Building className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">2. Business Profile Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-foreground mb-1">
              Business Name / Establishment Name *
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Kokane Chowk Multi-Speciality Dental Clinic"
              className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
            {state?.fieldErrors?.title && (
              <p className="text-xs text-destructive mt-1">{state.fieldErrors.title[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Business Category *
            </label>
            <select
              name="categoryId"
              required
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">-- Choose Category --</option>
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
              Complete Physical Address *
            </label>
            <input
              type="text"
              name="address"
              required
              placeholder="Shop/Office No., Wing, Building Name, Street Name, Pimple Saudagar, Pune - 411027"
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
              placeholder="e.g. 2019"
              min="1950"
              max={new Date().getFullYear()}
              className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-foreground mb-1">
              About the Business & Services *
            </label>
            <textarea
              name="description"
              required
              rows={4}
              placeholder="Provide a comprehensive description of your offerings, products, doctor/technician qualifications, menu highlights, and why customers in Pimple Saudagar should choose you."
              className="w-full rounded-lg border bg-background p-3 text-sm text-foreground focus:border-primary focus:outline-none"
            ></textarea>
            {state?.fieldErrors?.description && (
              <p className="text-xs text-destructive mt-1">{state.fieldErrors.description[0]}</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Direct Contact Channels */}
      <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-card space-y-5">
        <div className="flex items-center gap-2 border-b pb-3">
          <Phone className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">3. Customer Contact Channels</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Calling Telephone / Mobile *
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="+919876543210"
              className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
            <span className="text-[10px] text-muted-foreground mt-0.5 block">
              Used for customer direct telephone calls.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              WhatsApp Business Number
            </label>
            <input
              type="tel"
              name="whatsapp"
              placeholder="+919876543210"
              className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
            <span className="text-[10px] text-muted-foreground mt-0.5 block">
              Enables 1-click WhatsApp chat button on your profile.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Customer Enquiry Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="contact@mybusiness.local"
              className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Website or Google Profile
            </label>
            <input
              type="url"
              name="website"
              placeholder="https://example.com"
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
              <option value="1">₹ (Affordable / Budget-Friendly)</option>
              <option value="2">₹₹ (Moderate / Standard)</option>
              <option value="3">₹₹₹ (Premium / Upscale)</option>
              <option value="4">₹₹₹₹ (Luxury)</option>
            </select>
          </div>
        </div>

        {/* Amenities Selection */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-foreground mb-2">
            Features & Amenities
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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

      {/* 4. Plan Selection */}
      <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-card space-y-5">
        <div className="flex items-center gap-2 border-b pb-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">4. Choose Directory Plan</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => {
            const isSelected = selectedPlanId === p.id;
            return (
              <label
                key={p.id}
                onClick={() => setSelectedPlanId(p.id)}
                className={`relative flex flex-col justify-between rounded-xl border p-5 cursor-pointer transition ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary"
                    : "border-border bg-background hover:border-primary/50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-foreground">{p.name}</span>
                    <input
                      type="radio"
                      name="planId"
                      value={p.id}
                      checked={isSelected}
                      onChange={() => setSelectedPlanId(p.id)}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                  </div>
                  <div className="text-xl font-extrabold text-foreground mb-2">
                    {p.priceMinor === 0 ? "Free" : `₹${p.priceMinor / 100}`}
                    {p.priceMinor > 0 && <span className="text-xs font-normal text-muted-foreground"> /year</span>}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t text-[11px] text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    <span>Up to {p.maxPhotos} High-Res Photos</span>
                  </div>
                  {p.badgeVisible && (
                    <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Verified Business Badge</span>
                    </div>
                  )}
                  {p.searchPriority > 5 && (
                    <div className="flex items-center gap-1.5 text-amber-600 font-semibold">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Top Placement in Search</span>
                    </div>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
        <p className="text-xs text-muted-foreground">
          By submitting, you agree to Pimple Saudagar Directory terms and community guidelines.
        </p>

        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary-600 transition disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Submitting Your Business...</span>
            </>
          ) : (
            <span>Submit Business for Verification</span>
          )}
        </button>
      </div>
    </form>
  );
}

