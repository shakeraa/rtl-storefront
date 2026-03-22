import { describe, it, expect } from "vitest";
import {
  getAnnouncementLabel,
  getAllAnnouncementLabels,
  formatAnnouncement,
  formatCustomAnnouncement,
  getAnnouncementTypes,
  getAnnouncementTypeById,
  getAnnouncementDirection,
  getTemplateKeys,
  isRTLLocale,
  getSupportedLocales,
} from "../../app/services/ui-labels/announcement";

describe("Announcement Bar Translation", () => {
  describe("getAnnouncementLabel", () => {
    it("returns English 'close' label", () => {
      expect(getAnnouncementLabel("close", "en")).toBe("Close");
    });
    it("returns Arabic 'close' label", () => {
      expect(getAnnouncementLabel("close", "ar")).toBe("إغلاق");
    });
    it("returns Hebrew 'close' label", () => {
      expect(getAnnouncementLabel("close", "he")).toBe("סגור");
    });
    it("returns English 'shopNow' label", () => {
      expect(getAnnouncementLabel("shopNow", "en")).toBe("Shop now");
    });
    it("returns Arabic 'shopNow' label", () => {
      expect(getAnnouncementLabel("shopNow", "ar")).toBe("تسوق الآن");
    });
    it("returns Hebrew 'shopNow' label", () => {
      expect(getAnnouncementLabel("shopNow", "he")).toBe("קנה עכשיו");
    });
    it("returns English 'freeShipping' label", () => {
      expect(getAnnouncementLabel("freeShipping", "en")).toBe("Free shipping");
    });
    it("returns Arabic 'freeShipping' label", () => {
      expect(getAnnouncementLabel("freeShipping", "ar")).toBe("شحن مجاني");
    });
    it("returns Hebrew 'freeShipping' label", () => {
      expect(getAnnouncementLabel("freeShipping", "he")).toBe("משלוח חינם");
    });
    it("falls back to English for unknown locale", () => {
      expect(getAnnouncementLabel("learnMore", "unknown")).toBe("Learn more");
    });
    it("handles locale with region code (ar-SA)", () => {
      expect(getAnnouncementLabel("dismiss", "ar-SA")).toBe("تجاهل");
    });
    it("handles locale with region code (he-IL)", () => {
      expect(getAnnouncementLabel("dismiss", "he-IL")).toBe("התעלם");
    });
  });

  describe("getAllAnnouncementLabels", () => {
    it("returns all English labels", () => {
      const labels = getAllAnnouncementLabels("en");
      expect(labels).toHaveProperty("close");
      expect(labels).toHaveProperty("dismiss");
      expect(labels).toHaveProperty("learnMore");
      expect(labels).toHaveProperty("shopNow");
      expect(labels).toHaveProperty("limitedTime");
      expect(labels).toHaveProperty("freeShipping");
      expect(labels).toHaveProperty("sale");
    });
    it("returns all Arabic labels", () => {
      const labels = getAllAnnouncementLabels("ar");
      expect(labels.sale).toBe("تخفيضات");
      expect(labels.limitedTime).toBe("لفترة محدودة");
      expect(labels.learnMore).toBe("اعرف المزيد");
    });
    it("returns all Hebrew labels", () => {
      const labels = getAllAnnouncementLabels("he");
      expect(labels.sale).toBe("מבצע");
      expect(labels.limitedTime).toBe("לזמן מוגבל");
      expect(labels.learnMore).toBe("למד עוד");
    });
    it("falls back to English for unsupported locale", () => {
      const labels = getAllAnnouncementLabels("fr");
      expect(labels.close).toBe("Close");
    });
  });

  describe("formatAnnouncement", () => {
    it("formats free shipping template in English", () => {
      expect(formatAnnouncement("freeShippingOverAmount", { amount: "$50" }, "en")).toBe("Free shipping on orders over $50");
    });
    it("formats free shipping template in Arabic", () => {
      expect(formatAnnouncement("freeShippingOverAmount", { amount: "50$" }, "ar")).toBe("شحن مجاني للطلبات التي تزيد عن 50$");
    });
    it("formats free shipping template in Hebrew", () => {
      expect(formatAnnouncement("freeShippingOverAmount", { amount: "₪100" }, "he")).toBe("משלוח חינם בהזמנות מעל ₪100");
    });
    it("formats limited time discount template in English", () => {
      expect(formatAnnouncement("limitedTimeDiscount", { discount: "20" }, "en")).toBe("20% off - Limited time");
    });
    it("formats limited time discount template in Arabic", () => {
      expect(formatAnnouncement("limitedTimeDiscount", { discount: "30" }, "ar")).toBe("خصم 30% - لفترة محدودة");
    });
    it("formats flash sale template with discount", () => {
      expect(formatAnnouncement("flashSale", { discount: "50" }, "en")).toBe("Flash Sale! Up to 50% off");
    });
    it("formats new arrival template with product name", () => {
      expect(formatAnnouncement("newArrival", { product: "Summer Collection" }, "en")).toBe("New arrivals - Shop the latest Summer Collection");
    });
    it("formats back in stock template with product name", () => {
      expect(formatAnnouncement("backInStock", { product: "Air Max Shoes" }, "en")).toBe("Back in stock! Get your Air Max Shoes now");
    });
    it("formats pre-order template with product and date", () => {
      expect(formatAnnouncement("preOrder", { product: "iPhone 15", date: "Sept 15" }, "en")).toBe("Pre-order iPhone 15 - Available Sept 15");
    });
    it("handles multiple variables in template", () => {
      expect(formatCustomAnnouncement("Get {{discount}}% off with code {{code}}", { discount: 25, code: "SALE25" }, "en")).toBe("Get 25% off with code SALE25");
    });
    it("falls back to English template for unknown locale", () => {
      expect(formatAnnouncement("freeShippingOverAmount", { amount: "$100" }, "unknown")).toBe("Free shipping on orders over $100");
    });
  });

  describe("formatCustomAnnouncement", () => {
    it("formats custom template with single variable", () => {
      expect(formatCustomAnnouncement("Hello {{name}}!", { name: "World" }, "en")).toBe("Hello World!");
    });
    it("formats custom template with multiple variables", () => {
      expect(formatCustomAnnouncement("{{greeting}} {{name}}, you have {{count}} messages", { greeting: "Hello", name: "John", count: 5 }, "en")).toBe("Hello John, you have 5 messages");
    });
    it("preserves template when variable not provided", () => {
      expect(formatCustomAnnouncement("Hello {{name}}!", {}, "en")).toBe("Hello {{name}}!");
    });
  });

  describe("getAnnouncementTypes", () => {
    it("returns 7 announcement types for English", () => {
      expect(getAnnouncementTypes("en")).toHaveLength(7);
    });
    it("returns 7 announcement types for Arabic", () => {
      expect(getAnnouncementTypes("ar")).toHaveLength(7);
    });
    it("returns 7 announcement types for Hebrew", () => {
      expect(getAnnouncementTypes("he")).toHaveLength(7);
    });
    it("returns types with correct structure", () => {
      const types = getAnnouncementTypes("en");
      const promotion = types.find((t) => t.id === "promotion");
      expect(promotion).toBeDefined();
      expect(promotion?.name).toBe("Promotion");
      expect(promotion?.icon).toBe("tag");
    });
    it("returns Arabic type names for Arabic locale", () => {
      const types = getAnnouncementTypes("ar");
      expect(types.find((t) => t.id === "promotion")?.name).toBe("عرض ترويجي");
    });
    it("returns Hebrew type names for Hebrew locale", () => {
      const types = getAnnouncementTypes("he");
      expect(types.find((t) => t.id === "shipping")?.name).toBe("משלוח");
    });
  });

  describe("getAnnouncementTypeById", () => {
    it("returns promotion type by ID", () => {
      const type = getAnnouncementTypeById("promotion", "en");
      expect(type?.id).toBe("promotion");
      expect(type?.name).toBe("Promotion");
    });
    it("returns shipping type by ID in Arabic", () => {
      const type = getAnnouncementTypeById("shipping", "ar");
      expect(type?.id).toBe("shipping");
      expect(type?.name).toBe("الشحن");
    });
    it("returns undefined for unknown type ID", () => {
      expect(getAnnouncementTypeById("unknown", "en")).toBeUndefined();
    });
  });

  describe("getAnnouncementDirection", () => {
    it("returns 'rtl' for Arabic locale", () => {
      expect(getAnnouncementDirection("ar")).toBe("rtl");
    });
    it("returns 'rtl' for Arabic with region (ar-SA)", () => {
      expect(getAnnouncementDirection("ar-SA")).toBe("rtl");
    });
    it("returns 'rtl' for Hebrew locale", () => {
      expect(getAnnouncementDirection("he")).toBe("rtl");
    });
    it("returns 'rtl' for Hebrew with region (he-IL)", () => {
      expect(getAnnouncementDirection("he-IL")).toBe("rtl");
    });
    it("returns 'ltr' for English locale", () => {
      expect(getAnnouncementDirection("en")).toBe("ltr");
    });
    it("returns 'ltr' for English with region (en-US)", () => {
      expect(getAnnouncementDirection("en-US")).toBe("ltr");
    });
    it("returns 'ltr' for unknown locale", () => {
      expect(getAnnouncementDirection("unknown")).toBe("ltr");
    });
  });

  describe("getTemplateKeys", () => {
    it("returns 6 template keys", () => {
      expect(getTemplateKeys()).toHaveLength(6);
    });
    it("includes freeShippingOverAmount key", () => {
      expect(getTemplateKeys()).toContain("freeShippingOverAmount");
    });
    it("includes limitedTimeDiscount key", () => {
      expect(getTemplateKeys()).toContain("limitedTimeDiscount");
    });
  });

  describe("isRTLLocale", () => {
    it("returns true for Arabic locale", () => {
      expect(isRTLLocale("ar")).toBe(true);
    });
    it("returns true for Hebrew locale", () => {
      expect(isRTLLocale("he")).toBe(true);
    });
    it("returns false for English locale", () => {
      expect(isRTLLocale("en")).toBe(false);
    });
    it("returns true for Arabic with region", () => {
      expect(isRTLLocale("ar-EG")).toBe(true);
    });
    it("returns false for other locales", () => {
      expect(isRTLLocale("fr")).toBe(false);
      expect(isRTLLocale("de")).toBe(false);
    });
  });

  describe("getSupportedLocales", () => {
    it("returns 3 supported locales", () => {
      expect(getSupportedLocales()).toHaveLength(3);
    });
    it("includes en, ar, and he", () => {
      const locales = getSupportedLocales();
      expect(locales).toContain("en");
      expect(locales).toContain("ar");
      expect(locales).toContain("he");
    });
  });
});
