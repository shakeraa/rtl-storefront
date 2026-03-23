import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  notifyTranslationComplete,
  notifyTranslationError,
  notifyReviewNeeded,
  getUnreadCount,
} from "../../app/services/notifications/notifier.server";
import db from "../../app/db.server";

// Mock the email service
vi.mock("../../app/services/email", () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
}));

describe("Notification Service", () => {
  const testShop = "test-shop.myshopify.com";

  beforeEach(async () => {
    // Clean up test data
    await db.translationAlert.deleteMany({ where: { shop: testShop } });
    await db.notificationPreference.deleteMany({ where: { shop: testShop } });
    await db.alertConfiguration.deleteMany({ where: { shop: testShop } });

    // Setup default preferences
    await db.alertConfiguration.create({
      data: {
        shop: testShop,
        enableInApp: true,
        enableEmail: true,
        emailDigestFrequency: "weekly",
        emailRecipients: JSON.stringify(["admin@test.com"]),
      },
    });
  });

  describe("notifyTranslationComplete", () => {
    it("should create an in-app notification for translation completion", async () => {
      await notifyTranslationComplete({
        shop: testShop,
        locale: "ar",
        resourceType: "product",
        resourceId: "gid://shopify/Product/123",
        resourceTitle: "Test Product",
        characters: 150,
        provider: "openai",
      });

      const alerts = await db.translationAlert.findMany({
        where: { shop: testShop },
      });

      expect(alerts).toHaveLength(1);
      expect(alerts[0].category).toBe("new_content");
      expect(alerts[0].severity).toBe("info");
      expect(alerts[0].title).toContain("Test Product");
      expect(alerts[0].locale).toBe("ar");
    });

    it("should increment unread count", async () => {
      const initialCount = await getUnreadCount(testShop);
      expect(initialCount).toBe(0);

      await notifyTranslationComplete({
        shop: testShop,
        locale: "he",
        resourceType: "collection",
        resourceId: "gid://shopify/Collection/456",
        resourceTitle: "Summer Collection",
        characters: 250,
        provider: "deepl",
      });

      const newCount = await getUnreadCount(testShop);
      expect(newCount).toBe(1);
    });
  });

  describe("notifyTranslationError", () => {
    it("should create a critical alert for translation errors", async () => {
      await notifyTranslationError({
        shop: testShop,
        locale: "fa",
        resourceType: "page",
        resourceId: "gid://shopify/Page/789",
        resourceTitle: "About Us",
        error: "API rate limit exceeded",
      });

      const alerts = await db.translationAlert.findMany({
        where: { shop: testShop, severity: "critical" },
      });

      expect(alerts).toHaveLength(1);
      expect(alerts[0].category).toBe("untranslated");
      expect(alerts[0].message).toContain("API rate limit exceeded");
    });
  });

  describe("notifyReviewNeeded", () => {
    it("should create a warning alert for low quality translations", async () => {
      await notifyReviewNeeded({
        shop: testShop,
        locale: "ur",
        resourceType: "product",
        resourceId: "gid://shopify/Product/999",
        resourceTitle: "Premium Watch",
        qualityScore: 55,
      });

      const alerts = await db.translationAlert.findMany({
        where: { shop: testShop, severity: "warning" },
      });

      expect(alerts).toHaveLength(1);
      expect(alerts[0].title).toContain("Review Needed");
      expect(alerts[0].message).toContain("55/100");
    });
  });

  describe("getUnreadCount", () => {
    it("should return 0 when no alerts exist", async () => {
      const count = await getUnreadCount(testShop);
      expect(count).toBe(0);
    });

    it("should not count dismissed alerts", async () => {
      // Create an alert
      await notifyTranslationComplete({
        shop: testShop,
        locale: "ar",
        resourceType: "product",
        resourceId: "gid://shopify/Product/111",
        resourceTitle: "Test",
        characters: 100,
        provider: "openai",
      });

      // Dismiss it
      const alert = await db.translationAlert.findFirst({
        where: { shop: testShop },
      });

      if (alert) {
        await db.translationAlert.update({
          where: { id: alert.id },
          data: { dismissed: true },
        });
      }

      const count = await getUnreadCount(testShop);
      expect(count).toBe(0);
    });
  });
});
