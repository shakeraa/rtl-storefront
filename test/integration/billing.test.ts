import { describe, it, expect } from "vitest";
import { SHOPIFY_SUBSCRIPTION_STATUS_MAP } from "../../app/services/billing/types";

describe("billing integration", () => {
  describe("Shopify status mapping", () => {
    it("maps ACTIVE to active", () => {
      expect(SHOPIFY_SUBSCRIPTION_STATUS_MAP["ACTIVE"]).toBe("active");
    });

    it("maps FROZEN to frozen", () => {
      expect(SHOPIFY_SUBSCRIPTION_STATUS_MAP["FROZEN"]).toBe("frozen");
    });

    it("maps DECLINED to cancelled", () => {
      expect(SHOPIFY_SUBSCRIPTION_STATUS_MAP["DECLINED"]).toBe("cancelled");
    });

    it("maps EXPIRED to cancelled", () => {
      expect(SHOPIFY_SUBSCRIPTION_STATUS_MAP["EXPIRED"]).toBe("cancelled");
    });

    it("does not map PENDING", () => {
      expect(SHOPIFY_SUBSCRIPTION_STATUS_MAP["PENDING"]).toBeUndefined();
    });
  });
});
