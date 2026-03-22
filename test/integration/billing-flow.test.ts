import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.mock is hoisted, so we must use vi.hoisted to create the mock object
const mockPrisma = vi.hoisted(() => ({
  billingPlan: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  shopSubscription: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  shopUsage: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
}));

vi.mock("../../app/db.server", () => ({
  default: mockPrisma,
}));

import {
  formatPriceForShopify,
  parsePlanFeatures,
  getTrialDaysRemaining,
  isTrialExpired,
  isGated,
  getActivePlans,
  getPlanById,
} from "../../app/services/billing/index";
import type {
  SubscriptionWithPlan,
  PlanWithFeatures,
} from "../../app/services/billing/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSub(
  overrides: Partial<SubscriptionWithPlan> = {},
): SubscriptionWithPlan {
  return {
    id: "sub-1",
    shop: "test.myshopify.com",
    planId: null,
    plan: null,
    status: "active",
    shopifyChargeId: null,
    trialStartedAt: null,
    trialEndsAt: null,
    currentPeriodStart: null,
    currentPeriodEnd: null,
    ...overrides,
  };
}

function makePlan(overrides: Partial<PlanWithFeatures> = {}): PlanWithFeatures {
  return {
    id: "plan-1",
    name: "Basic",
    slug: "basic",
    priceInCents: 999,
    trialDays: 14,
    maxLanguages: 3,
    maxWordsPerMonth: 50000,
    features: ["basic_translation", "rtl_support"],
    sortOrder: 1,
    isActive: true,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Billing Flow - Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("formatPriceForShopify", () => {
    it("converts cents to dollars with two decimal places", () => {
      expect(formatPriceForShopify(999)).toBe("9.99");
      expect(formatPriceForShopify(0)).toBe("0.00");
      expect(formatPriceForShopify(10000)).toBe("100.00");
      expect(formatPriceForShopify(1)).toBe("0.01");
      expect(formatPriceForShopify(50)).toBe("0.50");
    });

    it("handles large amounts", () => {
      expect(formatPriceForShopify(1999900)).toBe("19999.00");
    });
  });

  describe("parsePlanFeatures", () => {
    it("parses valid JSON array", () => {
      const result = parsePlanFeatures(
        '["basic_translation","rtl_support"]',
      );
      expect(result).toEqual(["basic_translation", "rtl_support"]);
    });

    it("returns empty array for invalid JSON", () => {
      expect(parsePlanFeatures("not-json")).toEqual([]);
    });

    it("returns empty array for non-array JSON", () => {
      expect(parsePlanFeatures('{"key":"value"}')).toEqual([]);
    });

    it("returns empty array for empty string", () => {
      expect(parsePlanFeatures("")).toEqual([]);
    });
  });

  describe("getTrialDaysRemaining", () => {
    it("returns 0 when trialEndsAt is null", () => {
      expect(getTrialDaysRemaining(null)).toBe(0);
    });

    it("returns 0 when trial has expired", () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(getTrialDaysRemaining(pastDate)).toBe(0);
    });

    it("returns positive days when trial is active", () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const remaining = getTrialDaysRemaining(futureDate);
      expect(remaining).toBeGreaterThanOrEqual(6);
      expect(remaining).toBeLessThanOrEqual(8);
    });

    it("returns 1 when trial ends within 24h", () => {
      const soonDate = new Date(Date.now() + 12 * 60 * 60 * 1000);
      expect(getTrialDaysRemaining(soonDate)).toBe(1);
    });
  });

  describe("isTrialExpired", () => {
    it("returns false for non-trial subscriptions", () => {
      const sub = makeSub({ status: "active" });
      expect(isTrialExpired(sub)).toBe(false);
    });

    it("returns true for trial with no trialEndsAt", () => {
      const sub = makeSub({ status: "trial", trialEndsAt: null });
      expect(isTrialExpired(sub)).toBe(true);
    });

    it("returns true when trial end date is in the past", () => {
      const sub = makeSub({
        status: "trial",
        trialEndsAt: new Date(Date.now() - 1000),
      });
      expect(isTrialExpired(sub)).toBe(true);
    });

    it("returns false when trial end date is in the future", () => {
      const sub = makeSub({
        status: "trial",
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      expect(isTrialExpired(sub)).toBe(false);
    });
  });

  describe("isGated", () => {
    it("returns true when subscription is null", () => {
      expect(isGated(null)).toBe(true);
    });

    it("returns false for active subscriptions", () => {
      expect(isGated(makeSub({ status: "active" }))).toBe(false);
    });

    it("returns false for frozen subscriptions", () => {
      expect(isGated(makeSub({ status: "frozen" }))).toBe(false);
    });

    it("returns true for cancelled subscriptions", () => {
      expect(isGated(makeSub({ status: "cancelled" }))).toBe(true);
    });

    it("returns true for expired subscriptions", () => {
      expect(isGated(makeSub({ status: "expired" }))).toBe(true);
    });

    it("returns false for active trial (not expired)", () => {
      const sub = makeSub({
        status: "trial",
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      expect(isGated(sub)).toBe(false);
    });

    it("returns true for expired trial", () => {
      const sub = makeSub({
        status: "trial",
        trialEndsAt: new Date(Date.now() - 1000),
      });
      expect(isGated(sub)).toBe(true);
    });
  });

  describe("Database plan queries (mock prisma)", () => {
    it("getActivePlans returns parsed plans", async () => {
      mockPrisma.billingPlan.findMany.mockResolvedValue([
        {
          id: "plan-1",
          name: "Basic",
          slug: "basic",
          priceInCents: 999,
          trialDays: 14,
          maxLanguages: 3,
          maxWordsPerMonth: 50000,
          features: '["basic_translation","rtl_support"]',
          sortOrder: 1,
          isActive: true,
        },
        {
          id: "plan-2",
          name: "Pro",
          slug: "pro",
          priceInCents: 2999,
          trialDays: 14,
          maxLanguages: 10,
          maxWordsPerMonth: 200000,
          features: '["basic_translation","rtl_support","premium_ai","analytics"]',
          sortOrder: 2,
          isActive: true,
        },
      ]);

      const plans = await getActivePlans();
      expect(plans).toHaveLength(2);
      expect(plans[0].features).toEqual(["basic_translation", "rtl_support"]);
      expect(plans[1].features).toContain("premium_ai");
      expect(mockPrisma.billingPlan.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      });
    });

    it("getPlanById returns null when plan not found", async () => {
      mockPrisma.billingPlan.findUnique.mockResolvedValue(null);
      const plan = await getPlanById("nonexistent");
      expect(plan).toBeNull();
    });

    it("getPlanById parses features JSON", async () => {
      mockPrisma.billingPlan.findUnique.mockResolvedValue({
        id: "plan-1",
        name: "Basic",
        slug: "basic",
        priceInCents: 999,
        trialDays: 14,
        maxLanguages: 3,
        maxWordsPerMonth: 50000,
        features: '["basic_translation"]',
        sortOrder: 1,
        isActive: true,
      });

      const plan = await getPlanById("plan-1");
      expect(plan).not.toBeNull();
      expect(plan!.features).toEqual(["basic_translation"]);
    });
  });
});
