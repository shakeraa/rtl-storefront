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
      expect(getSocialLabel("instagram", "ar-EG")).toBe("إنستغرام");
    });

    it("handles locale with region subtag (he-IL)", () => {
      expect(getSocialLabel("linkedin", "he-IL")).toBe("לינקדאין");
    });

    it("falls back to English for unknown locale", () => {
      expect(getSocialLabel("twitter", "unknown")).toBe("Twitter");
      expect(getSocialLabel("youtube", "fr")).toBe("YouTube");
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
      expect(getSocialAriaLabel("tiktok", "ar")).toBe("زيارة ملفنا على تيك توك");
      expect(getSocialAriaLabel("snapchat", "ar")).toBe("زيارة ملفنا على سناب شات");
    });

    it("returns correct Hebrew aria-labels for all platforms", () => {
      expect(getSocialAriaLabel("linkedin", "he")).toBe("בקרו בעמוד הלינקדאין שלנו");
      expect(getSocialAriaLabel("pinterest", "he")).toBe("בקרו בפרופיל הפינטרסט שלנו");
    });

    it("handles locale with region subtag for aria-labels", () => {
      expect(getSocialAriaLabel("facebook", "ar-SA")).toBe("زيارة صفحتنا على فيسبوك");
      expect(getSocialAriaLabel("twitter", "he-IL")).toBe("בקרו בפרופיל הטוויטר שלנו");
    });

    it("falls back to English aria-label for unknown locale", () => {
      expect(getSocialAriaLabel("linkedin", "unknown")).toBe("Visit our LinkedIn page");
    });
  });

  describe("getAllSocialLinks", () => {
    it("returns all 8 platforms for English", () => {
      const links = getAllSocialLinks("en");
      expect(links).toHaveLength(8);
    });

    it("returns all 8 platforms for Arabic", () => {
      const links = getAllSocialLinks("ar");
      expect(links).toHaveLength(8);
    });

    it("returns all 8 platforms for Hebrew", () => {
      const links = getAllSocialLinks("he");
      expect(links).toHaveLength(8);
    });

    it("each link has required properties", () => {
      const links = getAllSocialLinks("en");
      for (const link of links) {
        expect(link).toHaveProperty("platform");
        expect(link).toHaveProperty("label");
        expect(link).toHaveProperty("ariaLabel");
        expect(typeof link.platform).toBe("string");
        expect(typeof link.label).toBe("string");
        expect(typeof link.ariaLabel).toBe("string");
      }
    });

    it("returns Arabic labels in getAllSocialLinks", () => {
      const links = getAllSocialLinks("ar");
      const facebookLink = links.find((l) => l.platform === "facebook");
      expect(facebookLink?.label).toBe("فيسبوك");
      expect(facebookLink?.ariaLabel).toBe("زيارة صفحتنا على فيسبوك");
    });

    it("returns Hebrew labels in getAllSocialLinks", () => {
      const links = getAllSocialLinks("he");
      const instagramLink = links.find((l) => l.platform === "instagram");
      expect(instagramLink?.label).toBe("אינסטגרם");
      expect(instagramLink?.ariaLabel).toBe("בקרו בפרופיל האינסטגרם שלנו");
    });

    it("falls back to English for unknown locale", () => {
      const links = getAllSocialLinks("unknown");
      expect(links).toHaveLength(8);
      const twitterLink = links.find((l) => l.platform === "twitter");
      expect(twitterLink?.label).toBe("Twitter");
    });
  });

  describe("getSocialLinksForPlatforms", () => {
    it("returns only specified platforms", () => {
      const platforms: SocialPlatform[] = ["facebook", "instagram", "twitter"];
      const links = getSocialLinksForPlatforms(platforms, "en");
      expect(links).toHaveLength(3);
      expect(links.map((l) => l.platform)).toContain("facebook");
      expect(links.map((l) => l.platform)).toContain("instagram");
      expect(links.map((l) => l.platform)).toContain("twitter");
    });

    it("returns Arabic labels for subset of platforms", () => {
      const platforms: SocialPlatform[] = ["youtube", "tiktok"];
      const links = getSocialLinksForPlatforms(platforms, "ar");
      expect(links[0].label).toBe("يوتيوب");
      expect(links[1].label).toBe("تيك توك");
    });

    it("returns Hebrew labels for subset of platforms", () => {
      const platforms: SocialPlatform[] = ["linkedin", "pinterest"];
      const links = getSocialLinksForPlatforms(platforms, "he");
      expect(links[0].label).toBe("לינקדאין");
      expect(links[1].label).toBe("פינטרסט");
    });

    it("returns empty array for empty platforms array", () => {
      const links = getSocialLinksForPlatforms([], "en");
      expect(links).toHaveLength(0);
    });

    it("handles single platform selection", () => {
      const links = getSocialLinksForPlatforms(["snapchat"], "en");
      expect(links).toHaveLength(1);
      expect(links[0].platform).toBe("snapchat");
      expect(links[0].label).toBe("Snapchat");
    });
  });

  describe("isValidSocialPlatform", () => {
    it("returns true for valid platforms", () => {
      expect(isValidSocialPlatform("facebook")).toBe(true);
      expect(isValidSocialPlatform("instagram")).toBe(true);
      expect(isValidSocialPlatform("twitter")).toBe(true);
      expect(isValidSocialPlatform("youtube")).toBe(true);
      expect(isValidSocialPlatform("tiktok")).toBe(true);
      expect(isValidSocialPlatform("linkedin")).toBe(true);
      expect(isValidSocialPlatform("pinterest")).toBe(true);
      expect(isValidSocialPlatform("snapchat")).toBe(true);
    });

    it("returns false for invalid platforms", () => {
      expect(isValidSocialPlatform("myspace")).toBe(false);
      expect(isValidSocialPlatform("whatsapp")).toBe(false);
      expect(isValidSocialPlatform("telegram")).toBe(false);
      expect(isValidSocialPlatform("")).toBe(false);
      expect(isValidSocialPlatform("random")).toBe(false);
    });

    it("returns false for platform with different case", () => {
      expect(isValidSocialPlatform("Facebook")).toBe(false);
      expect(isValidSocialPlatform("FACEBOOK")).toBe(false);
      expect(isValidSocialPlatform("Twitter")).toBe(false);
    });
  });
});
