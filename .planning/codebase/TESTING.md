---
last_mapped_commit: d477ba9a8095b24b7bd59f7726557d82cce578aa
last_mapped_at: 2026-11-12
---
# Testing Patterns

**Analysis Date:** 2026-11-12

## Test Framework

**Runner:**
- Vitest 5.1.0 configured in `vitest.config.mts`.
- Native ESM execution with TypeScript support and `@/*` path alias resolution.

**Assertion Library:**
- Built-in Vitest assertions (`expect()`, `describe()`, `it()`).

**Run Commands:**
```bash
npm test                 # Run all tests once (vitest run)
npx vitest               # Run tests in watch mode
npm run typecheck        # Verify TypeScript static types (tsc --noEmit)
npm run lint             # Verify code style and linting (eslint .)
```

## Test File Organization

**Location:**
- Dedicated `tests/` directory structured by test category:
  - `tests/unit/`: Pure business logic, utilities, formatting, and algorithm tests.
  - `tests/integration/`: Cross-service and database interaction tests.

**Naming:**
- Matches target domain: `<feature>.test.ts` (e.g. `analytics.test.ts`, `opening-hours.test.ts`, `plan.test.ts`, `sanitize.test.ts`, `seo.test.ts`).

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect } from "vitest";
import { AnalyticsService } from "@/lib/services/analytics.service";

describe("Analytics Service & Telemetry Intelligence", () => {
  describe("DPDP-Compliant Salted Visitor Hashing", () => {
    it("generates deterministic 32-char hex hash for same IP, UA, and date", () => {
      const hash1 = AnalyticsService.generateVisitorHash("192.168.1.100", "Mozilla/5.0", "2026-11-09");
      const hash2 = AnalyticsService.generateVisitorHash("192.168.1.100", "Mozilla/5.0", "2026-11-09");

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(32);
    });

    it("ensures cross-day unlinkability by rotating hash on different calendar dates", () => {
      const day1 = AnalyticsService.generateVisitorHash("192.168.1.100", "Mozilla/5.0", "2026-11-09");
      const day2 = AnalyticsService.generateVisitorHash("192.168.1.100", "Mozilla/5.0", "2026-11-10");

      expect(day1).not.toBe(day2);
    });
  });
});
```

## Mocking & Isolation

**What to Mock:**
- External network requests (Stripe, Razorpay, Resend email APIs).
- Direct browser APIs when running in Node test environments (e.g., `window`, `navigator.sendBeacon`).

**What NOT to Mock:**
- Pure utilities: `opening-hours.ts`, `opening-hours-parser.ts`, `sanitize.ts`, `analytics.service.ts` hash calculations. Test these with real execution and edge case fixtures.
- Database fallback fixtures: Verify that services properly return offline fallback data structures when the database is unreachable.

## Fixtures and Factories

**Test Fixtures:**
- Defined inline or within test files to maintain self-contained test contexts:
  - Mock schedules in `tests/unit/opening-hours.test.ts`.
  - HTML injection payloads in `tests/unit/sanitize.test.ts`.
  - Schema input fixtures in `tests/unit/seo.test.ts`.

## Coverage & Quality Gates

**Current Suite Status:**
- 5 test suites, 23 passing tests:
  - `tests/unit/opening-hours.test.ts` (3 tests)
  - `tests/unit/analytics.test.ts` (9 tests)
  - `tests/unit/seo.test.ts` (2 tests)
  - `tests/unit/sanitize.test.ts` (5 tests)
  - `tests/unit/plan.test.ts` (4 tests)
- Pre-commit & CI requirement: 100% pass rate on `npm test` and 0 errors on `npm run typecheck`.

---

*Testing analysis: 2026-11-12*
