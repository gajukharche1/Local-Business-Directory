import { AnalyticsEventType } from "@/lib/services/analytics.service";

/**
 * Fires a non-blocking client telemetry event to /api/analytics/track.
 * Uses navigator.sendBeacon when possible, falling back to fetch with keepalive.
 */
export function trackListingEvent(
  listingId: string,
  eventType: AnalyticsEventType,
  extraMetadata?: Record<string, unknown>
): void {
  if (typeof window === "undefined" || !listingId) return;

  const device = window.innerWidth < 768 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop";
  const payload = {
    listingId,
    eventType,
    metadata: {
      referrer: document.referrer ? new URL(document.referrer, window.location.origin).hostname : undefined,
      device,
      ...extraMetadata,
    },
  };

  const payloadString = JSON.stringify(payload);

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    try {
      const blob = new Blob([payloadString], { type: "application/json" });
      const sent = navigator.sendBeacon("/api/analytics/track", blob);
      if (sent) return;
    } catch {
      // Fall through to fetch
    }
  }

  // Fallback to fetch with keepalive: true
  fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payloadString,
    keepalive: true,
  }).catch(() => {
    // Silent catch — telemetry should never break UI interactions
  });
}
