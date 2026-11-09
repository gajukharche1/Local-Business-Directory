"use client";

import { useState, useActionState, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  ShieldCheck,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageCircle,
  Globe,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { submitEnquiryAction, EnquiryActionState } from "@/actions/enquiry";
import { ClaimStatus } from "@prisma/client";

interface ListingLeadSidebarProps {
  listingId: string;
  slug: string;
  title: string;
  phone?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  address: string;
  locality: string;
  landmark?: string | null;
  claimStatus: ClaimStatus;
  callAllowed?: boolean;
  whatsappAllowed?: boolean;
}

export function ListingLeadSidebar({
  listingId,
  slug,
  title,
  phone,
  whatsapp,
  website,
  address,
  locality,
  landmark,
  claimStatus,
  callAllowed = true,
  whatsappAllowed = true,
}: ListingLeadSidebarProps) {
  const [formLoadedAt, setFormLoadedAt] = useState<number>(0);
  const [sendOnWhatsapp, setSendOnWhatsapp] = useState(true);

  useEffect(() => {
    setFormLoadedAt(Date.now());
  }, []);

  const [state, formAction, isPending] = useActionState<EnquiryActionState | null, FormData>(
    submitEnquiryAction,
    null
  );

  const cleanPhone = phone?.replace(/\D/g, "");
  const cleanWhatsapp = (whatsapp || phone)?.replace(/\D/g, "");

  return (
    <aside className="space-y-6 sticky top-28">
      {/* High-Converting Lead Capture Card */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-5 relative overflow-hidden">
        {/* Accent Top Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-emerald-500 to-primary" />

        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <Zap className="h-3 w-3 fill-emerald-500" />
            <span>Fast Response in ~15 mins</span>
          </div>
          <h3 className="font-extrabold text-base text-foreground">
            Get Best Deal & Free Quote
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Connect directly with {title} for customized discounts and appointment booking.
          </p>
        </div>

        {/* Enquiry Form */}
        {state?.success ? (
          <div className="py-6 text-center space-y-2 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 rounded-2xl p-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-sm text-foreground">Enquiry Dispatched!</h4>
            <p className="text-xs text-muted-foreground">
              {state.message || "Your inquiry has been routed to the business team. Expect a prompt response via phone or WhatsApp."}
            </p>
          </div>
        ) : (
          <form action={formAction} className="space-y-3.5">
            <input type="hidden" name="listingId" value={listingId} />
            <input type="hidden" name="form_loaded_at" value={formLoadedAt} />

            {/* Anti-spam honeypot */}
            <div className="hidden" aria-hidden="true">
              <input type="text" name="website_url" tabIndex={-1} autoComplete="off" />
            </div>

            {state?.error && (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            <div>
              <label htmlFor="lead-name" className="block text-xs font-bold text-foreground mb-1">
                Your Name <span className="text-destructive">*</span>
              </label>
              <input
                id="lead-name"
                name="name"
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>

            <div>
              <label htmlFor="lead-phone" className="block text-xs font-bold text-foreground mb-1">
                Phone Number <span className="text-destructive">*</span>
              </label>
              <div className="relative flex rounded-xl border border-border bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition">
                <span className="flex items-center pl-3 text-xs font-bold text-muted-foreground select-none">
                  +91
                </span>
                <input
                  id="lead-phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="98765 43210"
                  className="w-full bg-transparent px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label htmlFor="lead-email" className="block text-xs font-bold text-foreground mb-1">
                Email Address <span className="text-destructive">*</span>
              </label>
              <input
                id="lead-email"
                name="email"
                type="email"
                required
                placeholder="rahul@example.com"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>

            <div>
              <label htmlFor="lead-message" className="block text-xs font-bold text-foreground mb-1">
                Requirement / Service Needed <span className="text-destructive">*</span>
              </label>
              <textarea
                id="lead-message"
                name="message"
                rows={2}
                required
                placeholder="e.g. Looking for haircut & organic hair spa package this Saturday..."
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={sendOnWhatsapp}
                onChange={(e) => setSendOnWhatsapp(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-[11px] text-muted-foreground font-medium select-none">
                Send quote & updates on WhatsApp
              </span>
            </label>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-600 py-3 px-4 text-xs font-bold text-primary-foreground shadow-md transition hover:scale-101 active:scale-99 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting Enquiry...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Request Free Quote</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>100% Verified Business • No spam guarantee</span>
            </p>
          </form>
        )}
      </div>

      {/* Quick Business Contact Hub */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4 text-xs">
        <h4 className="font-extrabold text-sm text-foreground">
          Direct Contact Information
        </h4>

        <div className="space-y-3">
          {callAllowed && cleanPhone && (
            <a
              href={`tel:${cleanPhone}`}
              className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 hover:bg-muted text-foreground transition"
            >
              <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Phone className="h-4 w-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[11px] text-muted-foreground font-medium">Telephone</p>
                <p className="font-bold font-mono truncate">{phone}</p>
              </div>
            </a>
          )}

          {whatsappAllowed && cleanWhatsapp && (
            <a
              href={`https://wa.me/${cleanWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 hover:bg-muted text-foreground transition"
            >
              <div className="h-8 w-8 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[11px] text-muted-foreground font-medium">WhatsApp</p>
                <p className="font-bold font-mono truncate">{whatsapp || phone}</p>
              </div>
            </a>
          )}

          {website && (
            <a
              href={website.startsWith("http") ? website : `https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 hover:bg-muted text-foreground transition group"
            >
              <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Globe className="h-4 w-4" />
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-[11px] text-muted-foreground font-medium">Official Website</p>
                <p className="font-bold truncate group-hover:text-primary transition-colors">
                  {website.replace(/^https?:\/\//, "")}
                </p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition" />
            </a>
          )}
        </div>

        {/* Claim Listing Footnote */}
        <div className="pt-3 border-t border-border/60 text-center">
          <p className="text-[11px] text-muted-foreground">
            Own or manage this business?
          </p>
          <Link
            href={`/claim/${slug}`}
            className="inline-block mt-1 font-bold text-xs text-primary hover:underline"
          >
            Claim listing to update details & photos
          </Link>
        </div>
      </div>
    </aside>
  );
}
