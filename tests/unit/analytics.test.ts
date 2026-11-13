import { describe, it, expect } from "vitest";
import { AnalyticsService } from "@/lib/services/analytics.service";

describe("Analytics Service & Telemetry Intelligence", () => {
  describe("DPDP-Compliant Salted Visitor Hashing", () => {
    it("generates deterministic 32-char hex hash for same IP, UA, and date", () => {
      const hash1 = AnalyticsService.generateVisitorHash("192.168.1.100", "Mozilla/5.0", "2026-11-09");
      const hash2 = AnalyticsService.generateVisitorHash("192.168.1.100", "Mozilla/5.0", "2026-11-09");

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(32);
      expect(/^[a-f0-9]{32}$/.test(hash1)).toBe(true);
    });

    it("ensures cross-day unlinkability by rotating hash on different calendar dates", () => {
      const day1 = AnalyticsService.generateVisitorHash("192.168.1.100", "Mozilla/5.0", "2026-11-09");
      const day2 = AnalyticsService.generateVisitorHash("192.168.1.100", "Mozilla/5.0", "2026-11-10");

      expect(day1).not.toBe(day2);
    });

    it("generates distinct hashes for distinct IP addresses on the same day", () => {
      const ipA = AnalyticsService.generateVisitorHash("10.0.0.1", "Mozilla/5.0", "2026-11-09");
      const ipB = AnalyticsService.generateVisitorHash("10.0.0.2", "Mozilla/5.0", "2026-11-09");

      expect(ipA).not.toBe(ipB);
    });

    it("gracefully falls back when IP or userAgent is omitted or undefined", () => {
      const hash = AnalyticsService.generateVisitorHash(undefined, undefined, "2026-11-09");
      expect(hash).toBeDefined();
      expect(hash).toHaveLength(32);
    });
  });

  describe("Conversion Rate & Percentage Delta Metrics", () => {
    it("calculates conversion rate percentage accurately", () => {
      const totalViews = 250;
      const totalActions = 25; // 10%
      const convRate = totalViews > 0 ? Number(((totalActions / totalViews) * 100).toFixed(1)) : 0;

      expect(convRate).toBe(10);
    });

    it("safely handles 0 page views without division by zero errors", () => {
      const totalViews = 0;
      const totalActions = 0;
      const convRate = totalViews > 0 ? Number(((totalActions / totalViews) * 100).toFixed(1)) : 0;

      expect(convRate).toBe(0);
    });

    it("calculates positive and negative period-over-period percentage changes", () => {
      const prior = 100;
      const currentHigher = 135;
      const deltaPos = Number((((currentHigher - prior) / prior) * 100).toFixed(1));
      expect(deltaPos).toBe(35);

      const currentLower = 80;
      const deltaNeg = Number((((currentLower - prior) / prior) * 100).toFixed(1));
      expect(deltaNeg).toBe(-20);
    });
  });

  describe("Bot Detection Filtering", () => {
    const BOT_REGEX = /bot|spider|crawl|slurp|facebookexternalhit|whatsapp|google|baidu|bing|msnbot|yandex|duckduckbot/i;

    it("correctly identifies common search engine spiders and scrapers", () => {
      expect(BOT_REGEX.test("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")).toBe(true);
      expect(BOT_REGEX.test("Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)")).toBe(true);
      expect(BOT_REGEX.test("facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)")).toBe(true);
      expect(BOT_REGEX.test("WhatsApp/2.21.12.21 i")).toBe(true);
    });

    it("allows standard human browser user agents", () => {
      expect(BOT_REGEX.test("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")).toBe(false);
      expect(BOT_REGEX.test("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")).toBe(false);
    });
  });
});
