import { describe, it, expect } from "vitest";
import {
  getSocialLabel,
  getSocialAriaLabel,
  getAllSocialLinks,
  getSocialLinksForPlatforms,
  isValidSocialPlatform,
  type SocialPlatform,
} from "../../app/services/ui-labels/social-links";

describe("Social Links - Labels", () => {
  describe("getSocialLabel", () => {
    it("returns English label for Facebook", () => {
      expect(getSocialLabel("facebook", "en")).toBe("Facebook");
    });
    it("returns Arabic label for Instagram", () => {
      expect(getSocialLabel("instagram", "ar")).toBe("إنستغرام");
    });
    it("returns Hebrew label for Twitter", () => {
      expect(getSocialLabel("twitter", "he")).toBe("טוויטר");
    });
    it("returns correct Arabic labels for all platforms", () => {
      expect(getSocialLabel("facebook", "ar")).toBe("فيسبوك");
      expect(getSocialLabel("youtube", "ar")).toBe("يوتيوب");
      expect(getSocialLabel("tiktok", "ar")).toBe("تيك توك");
      expect(getSocialLabel("linkedin", "ar")).toBe("لينكدإن");
    });
    it("returns correct Hebrew labels for all platforms", () => {
      expect(getSocialLabel("pinterest", "he")).toBe("פינטרסט");
      expect(getSocialLabel("snapchat", "he")).toBe("סנאפצ'אט");
      expect(getSocialLabel("youtube", "he")).toBe("יוטיוב");
      expect(getSocialLabel("tiktok", "he")).toBe("טיקטוק");
    });
    it("handles locale with region subtag (ar-SA)", () => {
      expect(getSocialLabel("facebook", "ar-SA")).toBe("فيسبوك");
    });
    it("handles locale with region subtag (he-IL)", () => {
      expect(getSocialLabel("linkedin", "he-IL")).toBe("לינקדאין");
    });
    it("falls back to English for unknown locale", () => {
      expect(getSocialLabel("twitter", "unknown")).toBe("Twitter");
    });
  });
  describe("getSocialAriaLabel", () => {
    it("returns English aria-label for Facebook", () => {
      expect(getSocialAriaLabel("facebook", "en")).toBe("Visit our Facebook page");
    });
    it("returns Arabic aria-label for YouTube", () => {
      expect(getSocialAriaLabel("youtube", "ar")).toBe("زيارة قناتنا على يوتيوب");
    });
    it("returns Hebrew aria-label for Instagram", () => {
      expect(getSocialAriaLabel("instagram", "he")).toBe("בקרו בפרופיל האינסטגרם שלנו");
    });
    it("returns correct Arabic aria-labels for all platforms", () => {
      expect(getSocialAriaLabel("twitter", "ar")).toBe("زيارة ملفنا على تويتر");
    });
    it("returns correct Hebrew aria-labels for all platforms", () => {
      expect(getSocialAriaLabel("linkedin", "he")).toBe("בקרו בעמוד הלינקדאין שלנו");
    });
    it("handles locale with region subtag for aria-labels", () => {
      expect(getSocialAriaLabel("facebook", "ar-SA")).toBe("زيارة صفحتنا على فيسبوك");
    });
    it("falls back to English aria-label for unknown locale", () => {
      expect(getSocialAriaLabel("linkedin", "unknown")).toBe("Visit our LinkedIn page");
    });
  });
  describe("getAllSocialLinks", () => {
    it("returns all 8 platforms for English", () => {
      expect(getAllSocialLinks("en")).toHaveLength(8);
    });
    it("returns all 8 platforms for Arabic", () => {
      expect(getAllSocialLinks("ar")).toHaveLength(8);
    });
    it("returns all 8 platforms for Hebrew", () => {
      expect(getAllSocialLinks("he")).toHaveLength(8);
    });
    it("each link has required properties", () => {
      const links = getAllSocialLinks("en");
      for (const link of links) {
        expect(link).toHaveProperty("platform");
        expect(link).toHaveProperty("label");
        expect(link).toHaveProperty("ariaLabel");
      }
    });
    it("returns Arabic labels in getAllSocialLinks", () => {
      const links = getAllSocialLinks("ar");
      const facebookLink = links.find((l) => l.platform === "facebook");
      expect(facebookLink?.label).toBe("فيسبوك");
    });
    it("returns Hebrew labels in getAllSocialLinks", () => {
      const links = getAllSocialLinks("he");
      const instagramLink = links.find((l) => l.platform === "instagram");
      expect(instagramLink?.label).toBe("אינסטגרם");
    });
    it("falls back to English for unknown locale", () => {
      const links = getAllSocialLinks("unknown");
      expect(links).toHaveLength(8);
    });
  });
  describe("getSocialLinksForPlatforms", () => {
    it("returns only specified platforms", () => {
      const platforms: SocialPlatform[] = ["facebook", "instagram", "twitter"];
      const links = getSocialLinksForPlatforms(platforms, "en");
      expect(links).toHaveLength(3);
    });
    it("returns Arabic labels for subset of platforms", () => {
      const platforms: SocialPlatform[] = ["youtube", "tiktok"];
      const links = getSocialLinksForPlatforms(platforms, "ar");
      expect(links[0].label).toBe("يوتيوب");
    });
    it("returns Hebrew labels for subset of platforms", () => {
      const platforms: SocialPlatform[] = ["linkedin", "pinterest"];
      const links = getSocialLinksForPlatforms(platforms, "he");
      expect(links[0].label).toBe("לינקדאין");
    });
    it("returns empty array for empty platforms array", () => {
      expect(getSocialLinksForPlatforms([], "en")).toHaveLength(0);
    });
    it("handles single platform selection", () => {
      const links = getSocialLinksForPlatforms(["snapchat"], "en");
      expect(links).toHaveLength(1);
      expect(links[0].platform).toBe("snapchat");
    });
  });
  describe("isValidSocialPlatform", () => {
    it("returns true for valid platforms", () => {
      expect(isValidSocialPlatform("facebook")).toBe(true);
      expect(isValidSocialPlatform("instagram")).toBe(true);
    });
    it("returns false for invalid platforms", () => {
      expect(isValidSocialPlatform("myspace")).toBe(false);
    });
    it("returns false for platform with different case", () => {
      expect(isValidSocialPlatform("Facebook")).toBe(false);
    });
  });
});
