"use client";

import { useEffect } from "react";
import { trackListingEvent } from "./track-event";

interface ListingAnalyticsTrackerProps {
  listingId: string;
}

export function ListingAnalyticsTracker({ listingId }: ListingAnalyticsTrackerProps) {
  useEffect(() => {
    if (!listingId) return;

    const storageKey = `listing_view_${listingId}`;
    try {
      const alreadyTracked = sessionStorage.getItem(storageKey);
      if (!alreadyTracked) {
        trackListingEvent(listingId, "page_view");
        sessionStorage.setItem(storageKey, Date.now().toString());
      }
    } catch {
      // If sessionStorage is disabled (e.g. strict private mode), fire directly
      trackListingEvent(listingId, "page_view");
    }
  }, [listingId]);

  return null;
}
