import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AnalyticsService, AnalyticsEventType } from "@/lib/services/analytics.service";

export const dynamic = "force-dynamic";

const trackSchema = z.object({
  listingId: z.string().min(1),
  eventType: z.enum([
    "page_view",
    "click_call",
    "click_whatsapp",
    "click_directions",
    "click_website",
    "click_enquire",
  ]),
  metadata: z
    .object({
      referrer: z.string().optional(),
      device: z.enum(["mobile", "desktop", "tablet"]).optional(),
      userAgent: z.string().optional(),
    })
    .optional(),
});

// Simple bot detection regex
const BOT_REGEX = /bot|spider|crawl|slurp|facebookexternalhit|whatsapp|google|baidu|bing|msnbot|yandex|duckduckbot/i;

// In-memory sliding window rate-limiter: max 30 telemetry events per IP per minute
const ipHitMap = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const userAgent = req.headers.get("user-agent") || "";
    if (BOT_REGEX.test(userAgent)) {
      // Discard bot traffic cleanly
      return new NextResponse(null, { status: 204 });
    }

    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? (forwardedFor.split(",")[0]?.trim() || "127.0.0.1") : req.headers.get("x-real-ip") || "127.0.0.1";

    // Rate limiting check
    const now = Date.now();
    const hitRecord = ipHitMap.get(ip);
    if (hitRecord && now < hitRecord.resetAt) {
      if (hitRecord.count >= 60) {
        // Discard spam clicks without error
        return new NextResponse(null, { status: 204 });
      }
      hitRecord.count += 1;
    } else {
      ipHitMap.set(ip, { count: 1, resetAt: now + 60000 });
      // Clean up old entries periodically
      if (ipHitMap.size > 2000) {
        for (const [key, val] of ipHitMap.entries()) {
          if (now > val.resetAt) ipHitMap.delete(key);
        }
      }
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = trackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const { listingId, eventType, metadata } = parsed.data;

    // Asynchronously record event without blocking client response
    AnalyticsService.recordEvent({
      listingId,
      eventType: eventType as AnalyticsEventType,
      metadata,
      ip,
      userAgent,
    }).catch((err) => {
      console.error("[Analytics Track Route] Failed to record event:", err);
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[Analytics Track Route] Error:", error);
    return new NextResponse(null, { status: 204 });
  }
}
