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
      const result = getAnnouncementLabel("close", "en");
      expect(result).toBe("Close");
    });

    it("returns Arabic 'close' label", () => {
      const result = getAnnouncementLabel("close", "ar");
      expect(result).toBe("إغلاق");
    });

    it("returns Hebrew 'close' label", () => {
      const result = getAnnouncementLabel("close", "he");
      expect(result).toBe("סגור");
    });

    it("returns English 'shopNow' label", () => {
      const result = getAnnouncementLabel("shopNow", "en");
      expect(result).toBe("Shop now");
    });

    it("returns Arabic 'shopNow' label", () => {
      const result = getAnnouncementLabel("shopNow", "ar");
      expect(result).toBe("تسوق الآن");
    });

    it("returns Hebrew 'shopNow' label", () => {
      const result = getAnnouncementLabel("shopNow", "he");
      expect(result).toBe("קנה עכשיו");
    });

    it("returns English 'freeShipping' label", () => {
      const result = getAnnouncementLabel("freeShipping", "en");
      expect(result).toBe("Free shipping");
    });

    it("returns Arabic 'freeShipping' label", () => {
      const result = getAnnouncementLabel("freeShipping", "ar");
      expect(result).toBe("شحن مجاني");
    });

    it("returns Hebrew 'freeShipping' label", () => {
      const result = getAnnouncementLabel("freeShipping", "he");
      expect(result).toBe("משלוח חינם");
    });

    it("falls back to English for unknown locale", () => {
      const result = getAnnouncementLabel("learnMore", "unknown");
      expect(result).toBe("Learn more");
    });

    it("handles locale with region code (ar-SA)", () => {
      const result = getAnnouncementLabel("dismiss", "ar-SA");
      expect(result).toBe("تجاهل");
    });

    it("handles locale with region code (he-IL)", () => {
      const result = getAnnouncementLabel("dismiss", "he-IL");
      expect(result).toBe("התעלם");
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
      const result = formatAnnouncement("freeShippingOverAmount", { amount: "$50" }, "en");
      expect(result).toBe("Free shipping on orders over $50");
    });

    it("formats free shipping template in Arabic", () => {
      const result = formatAnnouncement("freeShippingOverAmount", { amount: "50$" }, "ar");
      expect(result).toBe("شحن مجاني للطلبات التي تزيد عن 50$");
    });

    it("formats free shipping template in Hebrew", () => {
      const result = formatAnnouncement("freeShippingOverAmount", { amount: "₪100" }, "he");
      expect(result).toBe("משלוח חינם בהזמנות מעל ₪100");
    });

    it("formats limited time discount template in English", () => {
      const result = formatAnnouncement("limitedTimeDiscount", { discount: "20" }, "en");
      expect(result).toBe("20% off - Limited time");
    });

    it("formats limited time discount template in Arabic", () => {
      const result = formatAnnouncement("limitedTimeDiscount", { discount: "30" }, "ar");
      expect(result).toBe("خصم 30% - لفترة محدودة");
    });

    it("formats flash sale template with discount", () => {
      const result = formatAnnouncement("flashSale", { discount: "50" }, "en");
      expect(result).toBe("Flash Sale! Up to 50% off");
    });

    it("formats new arrival template with product name", () => {
      const result = formatAnnouncement("newArrival", { product: "Summer Collection" }, "en");
      expect(result).toBe("New arrivals - Shop the latest Summer Collection");
    });

    it("formats back in stock template with product name", () => {
      const result = formatAnnouncement("backInStock", { product: "Air Max Shoes" }, "en");
      expect(result).toBe("Back in stock! Get your Air Max Shoes now");
    });

    it("formats pre-order template with product and date", () => {
      const result = formatAnnouncement("preOrder", { product: "iPhone 15", date: "Sept 15" }, "en");
      expect(result).toBe("Pre-order iPhone 15 - Available Sept 15");
    });

    it("handles multiple variables in template", () => {
      const result = formatCustomAnnouncement(
        "Get {{discount}}% off with code {{code}}",
        { discount: 25, code: "SALE25" },
        "en"
      );
      expect(result).toBe("Get 25% off with code SALE25");
    });

    it("falls back to English template for unknown locale", () => {
      const result = formatAnnouncement("freeShippingOverAmount", { amount: "$100" }, "unknown");
      expect(result).toBe("Free shipping on orders over $100");
    });
  });

  describe("formatCustomAnnouncement", () => {
    it("formats custom template with single variable", () => {
      const result = formatCustomAnnouncement("Hello {{name}}!", { name: "World" }, "en");
      expect(result).toBe("Hello World!");
    });

    it("formats custom template with multiple variables", () => {
      const result = formatCustomAnnouncement(
        "{{greeting}} {{name}}, you have {{count}} messages",
        { greeting: "Hello", name: "John", count: 5 },
        "en"
      );
      expect(result).toBe("Hello John, you have 5 messages");
    });

    it("preserves template when variable not provided", () => {
      const result = formatCustomAnnouncement("Hello {{name}}!", {}, "en");
      expect(result).toBe("Hello {{name}}!");
    });
  });

  describe("getAnnouncementTypes", () => {
    it("returns 7 announcement types for English", () => {
      const types = getAnnouncementTypes("en");
      expect(types).toHaveLength(7);
    });

    it("returns 7 announcement types for Arabic", () => {
      const types = getAnnouncementTypes("ar");
      expect(types).toHaveLength(7);
    });

    it("returns 7 announcement types for Hebrew", () => {
      const types = getAnnouncementTypes("he");
      expect(types).toHaveLength(7);
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
      const promotion = types.find((t) => t.id === "promotion");
      expect(promotion?.name).toBe("عرض ترويجي");
    });

    it("returns Hebrew type names for Hebrew locale", () => {
      const types = getAnnouncementTypes("he");
      const shipping = types.find((t) => t.id === "shipping");
      expect(shipping?.name).toBe("משלוח");
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
      const type = getAnnouncementTypeById("unknown", "en");
      expect(type).toBeUndefined();
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
      const keys = getTemplateKeys();
      expect(keys).toHaveLength(6);
    });

    it("includes freeShippingOverAmount key", () => {
      const keys = getTemplateKeys();
      expect(keys).toContain("freeShippingOverAmount");
    });

    it("includes limitedTimeDiscount key", () => {
      const keys = getTemplateKeys();
      expect(keys).toContain("limitedTimeDiscount");
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
      const locales = getSupportedLocales();
      expect(locales).toHaveLength(3);
    });

    it("includes en, ar, and he", () => {
      const locales = getSupportedLocales();
      expect(locales).toContain("en");
      expect(locales).toContain("ar");
      expect(locales).toContain("he");
    });
  });
});
