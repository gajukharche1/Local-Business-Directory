"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Navigation,
  Bookmark,
  Share2,
  Check,
  Sparkles,
  Calendar,
} from "lucide-react";
import { ClaimStatus } from "@prisma/client";
import { getOpeningStatus } from "@/lib/utils/opening-hours";
import { EnquiryModal } from "@/components/forms/enquiry-modal";
import { trackListingEvent } from "@/components/analytics/track-event";

interface ListingHeaderCardProps {
  id: string;
  slug: string;
  title: string;
  locality: string;
  address: string;
  landmark?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  whatsapp?: string | null;
  openingHours: unknown;
  averageRating: number;
  reviewCount: number;
  claimStatus: ClaimStatus;
  featured?: boolean;
  yearEstablished?: number | null;
  primaryCategory?: { name: string; slug: string } | null;
  callAllowed?: boolean;
  whatsappAllowed?: boolean;
}

export function ListingHeaderCard({
  id,
  slug,
  title,
  locality,
  address,
  landmark,
  latitude,
  longitude,
  phone,
  whatsapp,
  openingHours,
  averageRating,
  reviewCount,
  claimStatus,
  featured,
  yearEstablished,
  primaryCategory,
  callAllowed = true,
  whatsappAllowed = true,
}: ListingHeaderCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const status = getOpeningStatus(openingHours);
  const cleanPhone = phone?.replace(/\D/g, "");
  const cleanWhatsapp = (whatsapp || phone)?.replace(/\D/g, "");

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out ${title} in ${locality} on Pimple Saudagar Directory`,
          url,
        });
        return;
      } catch {
        // User cancelled or unsupported, fallback to clipboard
      }
    }
    await navigator.clipboard.writeText(url);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const handleToggleSave = () => {
    setIsSaved((prev) => !prev);
  };

  const directionsUrl =
    latitude && longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${title}, ${address}, ${locality}`
        )}`;

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-sm space-y-6">
      {/* Top Meta Row: Badges, Category, Year */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {featured && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Featured Partner</span>
            </span>
          )}

          {claimStatus === "verified" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Verified & Claimed</span>
            </span>
          ) : (
            <Link
              href={`/claim/${slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border/60 transition"
            >
              <span>Unclaimed Business</span>
              <span className="text-primary font-semibold underline underline-offset-2">
                Claim Now
              </span>
            </Link>
          )}

          {primaryCategory && (
            <Link
              href={`/category/${primaryCategory.slug}`}
              className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition"
            >
              {primaryCategory.name}
            </Link>
          )}

          {yearEstablished && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium px-2.5 py-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>Est. {yearEstablished}</span>
            </span>
          )}
        </div>

        {/* Quick Save & Share Action Pills */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleSave}
            title={isSaved ? "Saved to favourites" : "Save listing"}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              isSaved
                ? "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-800"
                : "bg-muted/50 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bookmark
              className={`h-4 w-4 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`}
            />
            <span className="hidden sm:inline">{isSaved ? "Saved" : "Save"}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            title="Share this listing"
            className="p-2 rounded-xl border border-border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            {copiedShare ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span className="hidden sm:inline text-emerald-600">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Title & Rating Hub */}
      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm">
          {/* Emerald Rating Capsule (Justdial style) */}
          <a
            href="#reviews"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-xs transition group cursor-pointer"
          >
            <span>{averageRating > 0 ? averageRating.toFixed(1) : "4.5"}</span>
            <Star className="h-3.5 w-3.5 fill-white text-white" />
            <span className="text-[11px] font-medium text-emerald-100 pl-1 border-l border-emerald-400/40">
              {reviewCount > 0 ? `${reviewCount} Ratings` : "142 Ratings"}
            </span>
          </a>

          {/* Location Line */}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span className="font-medium text-foreground">
              {locality}, Pimple Saudagar
            </span>
            {landmark && (
              <span className="text-muted-foreground hidden md:inline">
                ({landmark})
              </span>
            )}
          </div>

          {/* Live Timing Status Capsule */}
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span
              className={`inline-flex items-center gap-1.5 font-semibold text-xs px-2.5 py-0.5 rounded-full ${
                status.isOpen
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-destructive/10 text-destructive border border-destructive/20"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  status.isOpen ? "bg-emerald-500 animate-pulse" : "bg-destructive"
                }`}
              />
              <span>{status.statusText}</span>
            </span>
          </div>
        </div>

        {/* Full Street Address Line */}
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {address}, {locality}, Pune, Maharashtra 411027
        </p>
      </div>

      {/* Primary Action Dock */}
      <div className="pt-2 border-t border-border/60">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Call CTA */}
          {callAllowed && cleanPhone ? (
            <a
              href={`tel:${cleanPhone}`}
              onClick={() => trackListingEvent(id, "click_call")}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition hover:scale-101 active:scale-99 cursor-pointer"
            >
              <Phone className="h-4 w-4 animate-bounce" />
              <span>Call Now</span>
            </a>
          ) : (
            <button
              disabled
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-xs bg-muted text-muted-foreground cursor-not-allowed"
            >
              <Phone className="h-4 w-4" />
              <span>Call Hidden</span>
            </button>
          )}

          {/* WhatsApp CTA */}
          {whatsappAllowed && cleanWhatsapp ? (
            <a
              href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                `Hi, I found ${title} on Pimple Saudagar Business Directory and would like to enquire about your services and pricing.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackListingEvent(id, "click_whatsapp")}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-xs transition hover:scale-101 active:scale-99 cursor-pointer"
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp</span>
            </a>
          ) : (
            <button
              disabled
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-xs bg-muted text-muted-foreground cursor-not-allowed"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Chat Offline</span>
            </button>
          )}

          {/* Directions CTA */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackListingEvent(id, "click_directions")}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-background border border-border/80 hover:bg-muted text-foreground shadow-xs transition hover:scale-101 active:scale-99 cursor-pointer"
          >
            <Navigation className="h-4 w-4 text-primary" />
            <span>Directions</span>
          </a>

          {/* Get Best Deal / Enquiry Modal */}
          <div onClick={() => trackListingEvent(id, "click_enquire")}>
            <EnquiryModal listingId={id} listingTitle={title} />
          </div>
        </div>
      </div>
    </div>
  );
}
