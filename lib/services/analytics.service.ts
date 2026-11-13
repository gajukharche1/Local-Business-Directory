import db from "@/lib/db/client";
import crypto from "crypto";
import { Prisma } from "@prisma/client";

export type AnalyticsEventType =
  | "page_view"
  | "click_call"
  | "click_whatsapp"
  | "click_directions"
  | "click_website"
  | "click_enquire";

export interface RecordEventInput {
  listingId: string;
  eventType: AnalyticsEventType;
  metadata?: {
    referrer?: string;
    device?: "mobile" | "desktop" | "tablet";
    userAgent?: string;
  };
  ip?: string;
  userAgent?: string;
}

export interface DailyDataPoint {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  actions: number;
  calls: number;
  whatsapp: number;
  directions: number;
  website: number;
  enquiries: number;
}

export interface ListingAnalyticsSummary {
  periodDays: number;
  totalViews: number;
  uniqueVisitors: number;
  totalActions: number;
  conversionRate: number; // Percentage, e.g. 5.4
  actionBreakdown: {
    calls: number;
    whatsapp: number;
    directions: number;
    website: number;
    enquiries: number;
  };
  dailySeries: DailyDataPoint[];
  deltas: {
    viewsPct: number;
    actionsPct: number;
    conversionRatePct: number;
  };
}

export interface DirectoryAnalyticsSummary {
  periodDays: number;
  totalViews: number;
  uniqueVisitors: number;
  totalActions: number;
  totalEnquiries: number;
  overallConversionRate: number;
  dailySeries: DailyDataPoint[];
  topListings: Array<{
    id: string;
    title: string;
    slug: string;
    views: number;
    actions: number;
    locality: string;
  }>;
}

export class AnalyticsService {
  /**
   * Generates a DPDP-compliant, privacy-first salted SHA-256 hash.
   * Rotates daily to prevent tracking users across different calendar days.
   */
  static generateVisitorHash(ip?: string, userAgent?: string, dateStr?: string): string {
    const rawIp = ip || "127.0.0.1";
    const rawUa = userAgent || "unknown";
    const salt = (process.env.SESSION_SECRET || "pimple-saudagar-directory") + (dateStr || new Date().toISOString().slice(0, 10));
    return crypto
      .createHash("sha256")
      .update(`${rawIp}:${rawUa}:${salt}`)
      .digest("hex")
      .slice(0, 32);
  }

  /**
   * Ingests a telemetry event asynchronously and increments the corresponding daily summary.
   */
  static async recordEvent(input: RecordEventInput): Promise<void> {
    const { listingId, eventType, metadata, ip, userAgent } = input;
    if (!listingId || !eventType) return;

    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const dateStr = today.toISOString().slice(0, 10);
    const visitorHash = this.generateVisitorHash(ip, userAgent, dateStr);

    try {
      // Determine if this is a first-time visitor today for this listing
      let isFirstVisitToday = false;
      if (eventType === "page_view") {
        const existingToday = await db.analyticsEvent.findFirst({
          where: {
            listingId,
            eventType: "page_view",
            visitorHash,
            createdAt: { gte: today },
          },
          select: { id: true },
        });
        isFirstVisitToday = !existingToday;
      }

      // 1. Create the detailed event
      await db.analyticsEvent.create({
        data: {
          listingId,
          eventType,
          visitorHash,
          metadata: metadata ? (metadata as Prisma.InputJsonValue) : Prisma.DbNull,
        },
      });

      // 2. Prepare field increments for Daily Summary
      const summaryUpdate: Prisma.AnalyticsDailySummaryUpdateInput = {};
      const summaryCreate: Prisma.AnalyticsDailySummaryCreateInput = {
        listing: { connect: { id: listingId } },
        date: today,
      };

      if (eventType === "page_view") {
        summaryUpdate.pageViews = { increment: 1 };
        summaryCreate.pageViews = 1;
        if (isFirstVisitToday) {
          summaryUpdate.uniqueVisitors = { increment: 1 };
          summaryCreate.uniqueVisitors = 1;
        }
      } else if (eventType === "click_call") {
        summaryUpdate.callClicks = { increment: 1 };
        summaryCreate.callClicks = 1;
      } else if (eventType === "click_whatsapp") {
        summaryUpdate.whatsappClicks = { increment: 1 };
        summaryCreate.whatsappClicks = 1;
      } else if (eventType === "click_directions") {
        summaryUpdate.directionsClicks = { increment: 1 };
        summaryCreate.directionsClicks = 1;
      } else if (eventType === "click_website") {
        summaryUpdate.websiteClicks = { increment: 1 };
        summaryCreate.websiteClicks = 1;
      } else if (eventType === "click_enquire") {
        summaryUpdate.enquiries = { increment: 1 };
        summaryCreate.enquiries = 1;
      }

      await db.analyticsDailySummary.upsert({
        where: {
          listingId_date: {
            listingId,
            date: today,
          },
        },
        update: summaryUpdate,
        create: summaryCreate,
      });
    } catch (err) {
      console.error("[AnalyticsService] Error recording telemetry event:", err);
    }
  }

  /**
   * Retrieves analytics metrics and historical series for a specific listing.
   */
  static async getListingAnalytics(
    listingId: string,
    periodDays: number = 30
  ): Promise<ListingAnalyticsSummary> {
    const now = new Date();
    const currentEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    const currentStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - periodDays + 1));

    const priorEnd = new Date(currentStart);
    const priorStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (periodDays * 2) + 1));

    // Fetch summaries for current and previous period concurrently
    const [currentRows, priorRows] = await Promise.all([
      db.analyticsDailySummary.findMany({
        where: {
          listingId,
          date: { gte: currentStart, lt: currentEnd },
        },
        orderBy: { date: "asc" },
      }),
      db.analyticsDailySummary.findMany({
        where: {
          listingId,
          date: { gte: priorStart, lt: priorEnd },
        },
      }),
    ]);

    // Build day map for uninterrupted daily time series
    const dayMap = new Map<string, DailyDataPoint>();
    for (let i = 0; i < periodDays; i++) {
      const d = new Date(currentStart);
      d.setUTCDate(d.getUTCDate() + i);
      const key = d.toISOString().slice(0, 10);
      dayMap.set(key, {
        date: key,
        pageViews: 0,
        uniqueVisitors: 0,
        actions: 0,
        calls: 0,
        whatsapp: 0,
        directions: 0,
        website: 0,
        enquiries: 0,
      });
    }

    let totalViews = 0;
    let uniqueVisitors = 0;
    let calls = 0;
    let whatsapp = 0;
    let directions = 0;
    let website = 0;
    let enquiries = 0;

    for (const row of currentRows) {
      const dateKey = row.date.toISOString().slice(0, 10);
      const rowActions = row.callClicks + row.whatsappClicks + row.directionsClicks + row.websiteClicks + row.enquiries;
      
      totalViews += row.pageViews;
      uniqueVisitors += row.uniqueVisitors;
      calls += row.callClicks;
      whatsapp += row.whatsappClicks;
      directions += row.directionsClicks;
      website += row.websiteClicks;
      enquiries += row.enquiries;

      dayMap.set(dateKey, {
        date: dateKey,
        pageViews: row.pageViews,
        uniqueVisitors: row.uniqueVisitors,
        actions: rowActions,
        calls: row.callClicks,
        whatsapp: row.whatsappClicks,
        directions: row.directionsClicks,
        website: row.websiteClicks,
        enquiries: row.enquiries,
      });
    }

    const totalActions = calls + whatsapp + directions + website + enquiries;
    const conversionRate = totalViews > 0 ? Number(((totalActions / totalViews) * 100).toFixed(1)) : 0;

    // Prior period calculations
    let priorViews = 0;
    let priorActions = 0;
    for (const row of priorRows) {
      priorViews += row.pageViews;
      priorActions += row.callClicks + row.whatsappClicks + row.directionsClicks + row.websiteClicks + row.enquiries;
    }
    const priorConversion = priorViews > 0 ? Number(((priorActions / priorViews) * 100).toFixed(1)) : 0;

    const viewsPct = priorViews > 0 ? Number((((totalViews - priorViews) / priorViews) * 100).toFixed(1)) : (totalViews > 0 ? 100 : 0);
    const actionsPct = priorActions > 0 ? Number((((totalActions - priorActions) / priorActions) * 100).toFixed(1)) : (totalActions > 0 ? 100 : 0);
    const conversionRatePct = priorConversion > 0 ? Number((((conversionRate - priorConversion) / priorConversion) * 100).toFixed(1)) : 0;

    return {
      periodDays,
      totalViews,
      uniqueVisitors,
      totalActions,
      conversionRate,
      actionBreakdown: {
        calls,
        whatsapp,
        directions,
        website,
        enquiries,
      },
      dailySeries: Array.from(dayMap.values()),
      deltas: {
        viewsPct,
        actionsPct,
        conversionRatePct,
      },
    };
  }

  /**
   * Directory-wide aggregate analytics for administrator overview.
   */
  static async getDirectoryAnalytics(periodDays: number = 30): Promise<DirectoryAnalyticsSummary> {
    const now = new Date();
    const currentEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    const currentStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - periodDays + 1));

    const [rows, topListingsRaw] = await Promise.all([
      db.analyticsDailySummary.findMany({
        where: {
          date: { gte: currentStart, lt: currentEnd },
        },
        orderBy: { date: "asc" },
      }),
      db.analyticsDailySummary.groupBy({
        by: ["listingId"],
        where: {
          date: { gte: currentStart, lt: currentEnd },
        },
        _sum: {
          pageViews: true,
          callClicks: true,
          whatsappClicks: true,
          directionsClicks: true,
          websiteClicks: true,
          enquiries: true,
        },
        orderBy: {
          _sum: {
            pageViews: "desc",
          },
        },
        take: 10,
      }),
    ]);

    // Build aggregate daily series
    const dayMap = new Map<string, DailyDataPoint>();
    for (let i = 0; i < periodDays; i++) {
      const d = new Date(currentStart);
      d.setUTCDate(d.getUTCDate() + i);
      const key = d.toISOString().slice(0, 10);
      dayMap.set(key, {
        date: key,
        pageViews: 0,
        uniqueVisitors: 0,
        actions: 0,
        calls: 0,
        whatsapp: 0,
        directions: 0,
        website: 0,
        enquiries: 0,
      });
    }

    let totalViews = 0;
    let uniqueVisitors = 0;
    let totalActions = 0;
    let totalEnquiries = 0;

    for (const row of rows) {
      const dateKey = row.date.toISOString().slice(0, 10);
      const rowActions = row.callClicks + row.whatsappClicks + row.directionsClicks + row.websiteClicks + row.enquiries;

      totalViews += row.pageViews;
      uniqueVisitors += row.uniqueVisitors;
      totalActions += rowActions;
      totalEnquiries += row.enquiries;

      const existing = dayMap.get(dateKey);
      if (existing) {
        existing.pageViews += row.pageViews;
        existing.uniqueVisitors += row.uniqueVisitors;
        existing.actions += rowActions;
        existing.calls += row.callClicks;
        existing.whatsapp += row.whatsappClicks;
        existing.directions += row.directionsClicks;
        existing.website += row.websiteClicks;
        existing.enquiries += row.enquiries;
      }
    }

    const overallConversionRate = totalViews > 0 ? Number(((totalActions / totalViews) * 100).toFixed(1)) : 0;

    // Fetch listing details for top listings
    const listingIds = topListingsRaw.map((t) => t.listingId);
    const listings = await db.listing.findMany({
      where: { id: { in: listingIds } },
      select: { id: true, title: true, slug: true, locality: true },
    });
    const listingMap = new Map(listings.map((l) => [l.id, l]));

    const topListings = topListingsRaw.map((t) => {
      const info = listingMap.get(t.listingId);
      const pViews = t._sum.pageViews || 0;
      const pActions =
        (t._sum.callClicks || 0) +
        (t._sum.whatsappClicks || 0) +
        (t._sum.directionsClicks || 0) +
        (t._sum.websiteClicks || 0) +
        (t._sum.enquiries || 0);

      return {
        id: t.listingId,
        title: info?.title || "Unknown Business",
        slug: info?.slug || "",
        locality: info?.locality || "Pimple Saudagar",
        views: pViews,
        actions: pActions,
      };
    });

    return {
      periodDays,
      totalViews,
      uniqueVisitors,
      totalActions,
      totalEnquiries,
      overallConversionRate,
      dailySeries: Array.from(dayMap.values()),
      topListings,
    };
  }
}
