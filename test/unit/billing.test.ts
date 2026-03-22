import { describe, it, expect } from "vitest";
import {
  formatPriceForShopify,
  parsePlanFeatures,
  getTrialDaysRemaining,
  isTrialExpired,
  isGated,
} from "../../app/services/billing/index";
import type { SubscriptionWithPlan } from "../../app/services/billing/types";

describe("billing service", () => {
  describe("formatPriceForShopify", () => {
    it("converts cents to dollar string", () => {
      expect(formatPriceForShopify(999)).toBe("9.99");
      expect(formatPriceForShopify(2499)).toBe("24.99");
      expect(formatPriceForShopify(5999)).toBe("59.99");
      expect(formatPriceForShopify(0)).toBe("0.00");
      expect(formatPriceForShopify(100)).toBe("1.00");
    });
  });

  describe("parsePlanFeatures", () => {
    it("parses JSON string to feature array", () => {
      const features = parsePlanFeatures('["rtl_support","glossary"]');
      expect(features).toEqual(["rtl_support", "glossary"]);
    });

    it("returns empty array for invalid JSON", () => {
      expect(parsePlanFeatures("invalid")).toEqual([]);
      expect(parsePlanFeatures("")).toEqual([]);
    });
  });

  describe("getTrialDaysRemaining", () => {
    it("returns positive days when trial is active", () => {
      const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      expect(getTrialDaysRemaining(futureDate)).toBe(5);
    });

    it("returns 0 when trial has expired", () => {
      const pastDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      expect(getTrialDaysRemaining(pastDate)).toBe(0);
    });

    it("returns 0 for null", () => {
      expect(getTrialDaysRemaining(null)).toBe(0);
    });
  });

  describe("isTrialExpired", () => {
    it("returns true when trial end date is in the past", () => {
      const sub = makeSub({ status: "trial", trialEndsAt: new Date(Date.now() - 1000) });
      expect(isTrialExpired(sub)).toBe(true);
    });

    it("returns false when trial end date is in the future", () => {
      const sub = makeSub({ status: "trial", trialEndsAt: new Date(Date.now() + 86400000) });
      expect(isTrialExpired(sub)).toBe(false);
    });

    it("returns false for non-trial status", () => {
      const sub = makeSub({ status: "active" });
      expect(isTrialExpired(sub)).toBe(false);
    });
  });

  describe("isGated", () => {
    it("returns true when no subscription", () => {
      expect(isGated(null)).toBe(true);
    });

    it("returns false for active subscription", () => {
      expect(isGated(makeSub({ status: "active" }))).toBe(false);
    });

    it("returns false for active trial", () => {
      const sub = makeSub({ status: "trial", trialEndsAt: new Date(Date.now() + 86400000) });
      expect(isGated(sub)).toBe(false);
    });

    it("returns true for expired trial", () => {
      const sub = makeSub({ status: "trial", trialEndsAt: new Date(Date.now() - 1000) });
      expect(isGated(sub)).toBe(true);
    });

    it("returns false for frozen (still accessible with warning)", () => {
      expect(isGated(makeSub({ status: "frozen" }))).toBe(false);
    });

    it("returns true for cancelled", () => {
      expect(isGated(makeSub({ status: "cancelled" }))).toBe(true);
    });

    it("returns true for expired", () => {
      expect(isGated(makeSub({ status: "expired" }))).toBe(true);
    });
  });
});

function makeSub(overrides: Partial<SubscriptionWithPlan> = {}): SubscriptionWithPlan {
  return {
    id: "sub_1",
    shop: "test.myshopify.com",
    planId: null,
    plan: null,
    status: "trial",
    shopifyChargeId: null,
    trialStartedAt: new Date(),
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    currentPeriodStart: null,
    currentPeriodEnd: null,
    ...overrides,
  };
}
