import { describe, it, expect } from "vitest";
import {
  runSEOAudit,
  auditHreflang,
  auditMetaTags,
  auditBrokenLinks,
  auditDuplicateContent,
  calculateLanguageScores,
  calculateOverallScore,
  generateRecommendations,
  quickAuditPage,
} from "../../../app/services/seo/audit";
import type { AuditPage, SEOConfig } from "../../../app/services/seo/audit";

describe("SEO Audit Tool (T0076)", () => {
  const seoConfig: SEOConfig = {
    shop: "example.myshopify.com",
    defaultLocale: "en",
    locales: ["en", "ar", "he"],
    baseUrl: "https://example.com",
  };

  const createMockPage = (overrides?: Partial<AuditPage>): AuditPage => ({
    url: "https://example.com/products/dress",
    locale: "en",
    title: "Summer Dress - Fashion Store",
    description: "A beautiful summer dress perfect for warm days. Shop now!",
    canonical: "https://example.com/products/dress",
    hreflangTags: [
      { locale: "en", url: "https://example.com/products/dress" },
      { locale: "ar", url: "https://example.com/ar/products/dress" },
      { locale: "he", url: "https://example.com/he/products/dress" },
      { locale: "x-default", url: "https://example.com/products/dress" },
    ],
    ...overrides,
  });

  describe("runSEOAudit", () => {
    it("should run complete SEO audit", () => {
      const pages: AuditPage[] = [
        createMockPage(),
        createMockPage({
          url: "https://example.com/ar/products/dress",
          locale: "ar",
          title: "فستان صيفي",
          description: "فستان صيفي جميل",
          canonical: "https://example.com/ar/products/dress",
        }),
      ];

      const result = runSEOAudit(pages, seoConfig);

      expect(result.timestamp).toBeDefined();
      expect(result.config).toEqual(seoConfig);
      expect(result.summary.totalPages).toBe(2);
      expect(result.summary.totalLanguages).toBe(3);
      expect(result.scores).toHaveLength(2);
      expect(result.recommendations).toBeDefined();
    });

    it("should calculate overall score", () => {
      const pages: AuditPage[] = [
        createMockPage(),
        createMockPage({ url: "https://example.com/products/shoes" }),
      ];

      const result = runSEOAudit(pages, seoConfig);

      expect(result.summary.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.summary.overallScore).toBeLessThanOrEqual(100);
    });
  });

  describe("auditHreflang", () => {
    it("should validate correct hreflang setup", () => {
      const pages: AuditPage[] = [
        createMockPage(),
        createMockPage({
          url: "https://example.com/ar/products/dress",
          locale: "ar",
          hreflangTags: [
            { locale: "en", url: "https://example.com/products/dress" },
            { locale: "ar", url: "https://example.com/ar/products/dress" },
            { locale: "x-default", url: "https://example.com/products/dress" },
          ],
        }),
      ];

      const result = auditHreflang(pages, seoConfig);

      expect(result.valid).toBe(true);
      expect(result.issues.filter(i => i.severity === "error")).toHaveLength(0);
    });

    it("should detect missing self-referencing hreflang", () => {
      const pages: AuditPage[] = [
        createMockPage({
          hreflangTags: [
            { locale: "ar", url: "https://example.com/ar/products/dress" },
            { locale: "he", url: "https://example.com/he/products/dress" },
          ],
        }),
      ];

      const result = auditHreflang(pages, seoConfig);

      expect(result.valid).toBe(false);
      expect(result.issues.some(i => i.type === "self-referencing-missing")).toBe(true);
    });

    it("should detect missing x-default", () => {
      const pages: AuditPage[] = [
        createMockPage({
          hreflangTags: [
            { locale: "en", url: "https://example.com/products/dress" },
            { locale: "ar", url: "https://example.com/ar/products/dress" },
          ],
        }),
      ];

      const result = auditHreflang(pages, seoConfig);

      expect(result.issues.some(i => i.type === "missing-x-default")).toBe(true);
    });

    it("should detect invalid locales", () => {
      const pages: AuditPage[] = [
        createMockPage({
          hreflangTags: [
            { locale: "en", url: "https://example.com/products/dress" },
            { locale: "fr", url: "https://example.com/fr/products/dress" },
          ],
        }),
      ];

      const result = auditHreflang(pages, seoConfig);

      expect(result.issues.some(i => i.type === "invalid-locale")).toBe(true);
    });

    it("should detect missing return links", () => {
      const pages: AuditPage[] = [
        createMockPage(),
        createMockPage({
          url: "https://example.com/ar/products/dress",
          locale: "ar",
          hreflangTags: [
            { locale: "ar", url: "https://example.com/ar/products/dress" },
            // Missing link back to English version
          ],
        }),
      ];

      const result = auditHreflang(pages, seoConfig);

      expect(result.issues.some(i => i.type === "missing-return")).toBe(true);
    });
  });

  describe("auditMetaTags", () => {
    it("should validate correct meta tags", () => {
      const pages: AuditPage[] = [createMockPage()];

      const result = auditMetaTags(pages, {
        checkBrokenLinks: true,
        checkDuplicateContent: true,
        duplicateThreshold: 0.8,
        minTitleLength: 30,
        maxTitleLength: 60,
        minDescriptionLength: 120,
        maxDescriptionLength: 160,
      });

      expect(result.valid).toBe(true);
    });

    it("should detect missing title", () => {
      const pages: AuditPage[] = [createMockPage({ title: undefined })];

      const result = auditMetaTags(pages, {
        checkBrokenLinks: true,
        checkDuplicateContent: true,
        duplicateThreshold: 0.8,
        minTitleLength: 30,
        maxTitleLength: 60,
        minDescriptionLength: 120,
        maxDescriptionLength: 160,
      });

      expect(result.issues.some(i => i.type === "missing-title")).toBe(true);
    });

    it("should detect missing description", () => {
      const pages: AuditPage[] = [createMockPage({ description: undefined })];

      const result = auditMetaTags(pages, {
        checkBrokenLinks: true,
        checkDuplicateContent: true,
        duplicateThreshold: 0.8,
        minTitleLength: 30,
        maxTitleLength: 60,
        minDescriptionLength: 120,
        maxDescriptionLength: 160,
      });

      expect(result.issues.some(i => i.type === "missing-description")).toBe(true);
    });

    it("should detect title too long", () => {
      const pages: AuditPage[] = [createMockPage({ title: "A".repeat(70) })];

      const result = auditMetaTags(pages, {
        checkBrokenLinks: true,
        checkDuplicateContent: true,
        duplicateThreshold: 0.8,
        minTitleLength: 30,
        maxTitleLength: 60,
        minDescriptionLength: 120,
        maxDescriptionLength: 160,
      });

      expect(result.issues.some(i => i.type === "title-too-long")).toBe(true);
    });

    it("should detect title too short", () => {
      const pages: AuditPage[] = [createMockPage({ title: "Dress" })];

      const result = auditMetaTags(pages, {
        checkBrokenLinks: true,
        checkDuplicateContent: true,
        duplicateThreshold: 0.8,
        minTitleLength: 30,
        maxTitleLength: 60,
        minDescriptionLength: 120,
        maxDescriptionLength: 160,
      });

      expect(result.issues.some(i => i.type === "title-too-short")).toBe(true);
    });

    it("should detect duplicate canonicals", () => {
      const pages: AuditPage[] = [
        createMockPage({ url: "https://example.com/products/dress1" }),
        createMockPage({ url: "https://example.com/products/dress2" }),
      ];

      const result = auditMetaTags(pages, {
        checkBrokenLinks: true,
        checkDuplicateContent: true,
        duplicateThreshold: 0.8,
        minTitleLength: 30,
        maxTitleLength: 60,
        minDescriptionLength: 120,
        maxDescriptionLength: 160,
      });

      expect(result.issues.some(i => i.type === "duplicate-canonical")).toBe(true);
    });
  });

  describe("auditBrokenLinks", () => {
    it("should find broken internal links", () => {
      const pages: AuditPage[] = [
        createMockPage({
          links: ["https://example.com/broken-page"],
        }),
      ];

      const result = auditBrokenLinks(pages);

      expect(result.links.length).toBeGreaterThan(0);
      expect(result.links[0].target).toBe("https://example.com/broken-page");
    });

    it("should pass when no broken links", () => {
      const pages: AuditPage[] = [
        createMockPage({
          url: "https://example.com/page1",
          links: ["https://example.com/page2"],
        }),
        createMockPage({
          url: "https://example.com/page2",
          links: [],
        }),
      ];

      const result = auditBrokenLinks(pages);

      expect(result.valid).toBe(true);
      expect(result.links).toHaveLength(0);
    });
  });

  describe("auditDuplicateContent", () => {
    it("should detect duplicate content", () => {
      const pages: AuditPage[] = [
        createMockPage({
          url: "https://example.com/page1",
          content: "This is a sample product description with many words.",
        }),
        createMockPage({
          url: "https://example.com/page2",
          content: "This is a sample product description with many words.",
        }),
      ];

      const result = auditDuplicateContent(pages, 0.8);

      expect(result.groups.length).toBeGreaterThan(0);
      expect(result.groups[0].urls).toContain("https://example.com/page1");
      expect(result.groups[0].urls).toContain("https://example.com/page2");
    });

    it("should pass when content is unique", () => {
      const pages: AuditPage[] = [
        createMockPage({
          url: "https://example.com/page1",
          content: "Unique content for page one with different words.",
        }),
        createMockPage({
          url: "https://example.com/page2",
          content: "Completely different content for page two here.",
        }),
      ];

      const result = auditDuplicateContent(pages, 0.8);

      expect(result.valid).toBe(true);
      expect(result.groups).toHaveLength(0);
    });
  });

  describe("calculateLanguageScores", () => {
    it("should calculate scores for each language", () => {
      const pages: AuditPage[] = [
        createMockPage({ locale: "en" }),
        createMockPage({ locale: "ar", url: "https://example.com/ar/page" }),
      ];

      const scores = calculateLanguageScores(pages, [], [], [], []);

      expect(scores).toHaveLength(2);
      expect(scores[0].locale).toBe("en");
      expect(scores[1].locale).toBe("ar");
    });

    it("should calculate score breakdown", () => {
      const pages: AuditPage[] = [createMockPage()];

      const scores = calculateLanguageScores(pages, [], [], [], []);

      expect(scores[0].breakdown).toBeDefined();
      expect(scores[0].breakdown.hreflang).toBeGreaterThanOrEqual(0);
      expect(scores[0].breakdown.metaTags).toBeGreaterThanOrEqual(0);
    });
  });

  describe("calculateOverallScore", () => {
    it("should calculate average of language scores", () => {
      const scores = [
        { score: 80, locale: "en", issues: 0, warnings: 0, passed: 0, breakdown: { hreflang: 80, metaTags: 80, links: 80, content: 80 } },
        { score: 90, locale: "ar", issues: 0, warnings: 0, passed: 0, breakdown: { hreflang: 90, metaTags: 90, links: 90, content: 90 } },
      ];

      const overall = calculateOverallScore(scores);

      expect(overall).toBe(85);
    });

    it("should return 100 when no scores", () => {
      const overall = calculateOverallScore([]);
      expect(overall).toBe(100);
    });
  });

  describe("generateRecommendations", () => {
    it("should generate recommendations based on issues", () => {
      const recommendations = generateRecommendations(
        [{ type: "missing-return", page: "/page", locale: "en", details: "test", severity: "error" }],
        [{ type: "missing-title", page: "/page", locale: "en", details: "test", severity: "error" }],
        [{ source: "/page", target: "/broken", locale: "en", statusCode: 404 }],
        [{ urls: ["/page1", "/page2"], similarity: 0.9, locales: ["en"] }],
      );

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(r => r.includes("hreflang"))).toBe(true);
      expect(recommendations.some(r => r.includes("title"))).toBe(true);
      expect(recommendations.some(r => r.includes("broken"))).toBe(true);
      expect(recommendations.some(r => r.includes("duplicate"))).toBe(true);
    });

    it("should return positive message when no issues", () => {
      const recommendations = generateRecommendations([], [], [], []);

      expect(recommendations.length).toBe(1);
      expect(recommendations[0]).toContain("Great job");
    });
  });

  describe("quickAuditPage", () => {
    it("should perform quick audit on single page", () => {
      const page = createMockPage();
      const result = quickAuditPage(page, seoConfig);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.errors).toBeDefined();
      expect(result.warnings).toBeDefined();
    });

    it("should detect missing title in quick audit", () => {
      const page = createMockPage({ title: undefined });
      const result = quickAuditPage(page, seoConfig);

      expect(result.errors).toContain("Missing title tag");
    });

    it("should detect missing description in quick audit", () => {
      const page = createMockPage({ description: undefined });
      const result = quickAuditPage(page, seoConfig);

      expect(result.errors).toContain("Missing meta description");
    });
  });
});
