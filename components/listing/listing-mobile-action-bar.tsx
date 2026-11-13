"use client";

import { Phone, MessageCircle, Zap } from "lucide-react";
import { EnquiryModal } from "@/components/forms/enquiry-modal";
import { trackListingEvent } from "@/components/analytics/track-event";

interface ListingMobileActionBarProps {
  listingId: string;
  title: string;
  phone?: string | null;
  whatsapp?: string | null;
  callAllowed?: boolean;
  whatsappAllowed?: boolean;
}

export function ListingMobileActionBar({
  listingId,
  title,
  phone,
  whatsapp,
  callAllowed = true,
  whatsappAllowed = true,
}: ListingMobileActionBarProps) {
  const cleanPhone = phone?.replace(/\D/g, "");
  const cleanWhatsapp = (whatsapp || phone)?.replace(/\D/g, "");

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/80 p-3 shadow-lg flex items-center gap-2">
      {/* Call Button */}
      {callAllowed && cleanPhone ? (
        <a
          href={`tel:${cleanPhone}`}
          onClick={() => trackListingEvent(listingId, "click_call")}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-98"
        >
          <Phone className="h-4 w-4" />
          <span>Call Now</span>
        </a>
      ) : (
        <button
          disabled
          className="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-muted text-muted-foreground font-medium text-xs cursor-not-allowed"
        >
          <Phone className="h-4 w-4" />
          <span>Call</span>
        </button>
      )}

      {/* WhatsApp Button */}
      {whatsappAllowed && cleanWhatsapp ? (
        <a
          href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
            `Hi, I found ${title} on Pimple Saudagar Directory and would like more details.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackListingEvent(listingId, "click_whatsapp")}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs shadow-xs transition active:scale-98"
        >
          <MessageCircle className="h-4 w-4" />
          <span>WhatsApp</span>
        </a>
      ) : (
        <button
          disabled
          className="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-muted text-muted-foreground font-medium text-xs cursor-not-allowed"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Chat</span>
        </button>
      )}

      {/* Enquiry Modal Button */}
      <div className="shrink-0" onClick={() => trackListingEvent(listingId, "click_enquire")}>
        <EnquiryModal listingId={listingId} listingTitle={title} />
      </div>
    </div>
  );
}
