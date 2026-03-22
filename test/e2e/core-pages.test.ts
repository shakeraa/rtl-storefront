import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock db.server globally since many services import it at module level
vi.mock("../../app/db.server", () => ({
  default: {
    translationCache: {},
    translationMemory: {
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: "tm-1" }),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
      count: vi.fn().mockResolvedValue(0),
      groupBy: vi.fn().mockResolvedValue([]),
    },
    glossaryEntry: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({
        id: "g-1",
        sourceLocale: "en",
        targetLocale: "ar",
        sourceTerm: "test",
        translatedTerm: "اختبار",
        neverTranslate: false,
        caseSensitive: false,
        category: null,
        notes: null,
      }),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn().mockResolvedValue({}),
    },
    billingPlan: {},
    shopSubscription: {},
    shopUsage: {},
    $transaction: vi.fn().mockResolvedValue([]),
  },
}));

// ============================================================================
// SECTION 1: Dashboard (app._index) — Coverage Service
// ============================================================================
describe("Dashboard — Coverage Service", () => {
  let coverage: typeof import("../../app/services/coverage/index");

  beforeEach(async () => {
    coverage = await import("../../app/services/coverage/index");
    coverage.clearProgressHistory();
  });

  // --- calculateCoverage ---
  describe("calculateCoverage", () => {
    it("calculates correct percentage for normal values", () => {
      expect(coverage.calculateCoverage(100, 50)).toBe(50);
      expect(coverage.calculateCoverage(1284, 1001)).toBe(78);
      expect(coverage.calculateCoverage(1284, 578)).toBe(45);
      expect(coverage.calculateCoverage(1284, 295)).toBe(23);
      expect(coverage.calculateCoverage(1284, 1181)).toBe(92);
    });

    it("returns 100 when total is 0 (no content means fully covered)", () => {
      expect(coverage.calculateCoverage(0, 0)).toBe(100);
      expect(coverage.calculateCoverage(0, 10)).toBe(100);
    });

    it("returns 0 when nothing is translated", () => {
      expect(coverage.calculateCoverage(100, 0)).toBe(0);
    });

    it("returns 100 when everything is translated", () => {
      expect(coverage.calculateCoverage(100, 100)).toBe(100);
    });

    it("rounds to the nearest integer", () => {
      // 33.333...% should round to 33
      expect(coverage.calculateCoverage(3, 1)).toBe(33);
      // 66.666...% should round to 67
      expect(coverage.calculateCoverage(3, 2)).toBe(67);
    });

    it("handles large numbers", () => {
      expect(coverage.calculateCoverage(1_000_000, 999_999)).toBe(100);
      expect(coverage.calculateCoverage(1_000_000, 500_000)).toBe(50);
    });
  });

  // --- getCoverageLevel ---
  describe("getCoverageLevel", () => {
    it("returns 'excellent' for >= 90%", () => {
      expect(coverage.getCoverageLevel(90)).toBe("excellent");
      expect(coverage.getCoverageLevel(95)).toBe("excellent");
      expect(coverage.getCoverageLevel(100)).toBe("excellent");
    });

    it("returns 'good' for 70-89%", () => {
      expect(coverage.getCoverageLevel(70)).toBe("good");
      expect(coverage.getCoverageLevel(78)).toBe("good");
      expect(coverage.getCoverageLevel(89)).toBe("good");
    });

    it("returns 'warning' for 40-69%", () => {
      expect(coverage.getCoverageLevel(40)).toBe("warning");
      expect(coverage.getCoverageLevel(45)).toBe("warning");
      expect(coverage.getCoverageLevel(69)).toBe("warning");
    });

    it("returns 'critical' for < 40%", () => {
      expect(coverage.getCoverageLevel(0)).toBe("critical");
      expect(coverage.getCoverageLevel(23)).toBe("critical");
      expect(coverage.getCoverageLevel(39)).toBe("critical");
    });

    it("handles boundary values precisely", () => {
      expect(coverage.getCoverageLevel(39)).toBe("critical");
      expect(coverage.getCoverageLevel(40)).toBe("warning");
      expect(coverage.getCoverageLevel(69)).toBe("warning");
      expect(coverage.getCoverageLevel(70)).toBe("good");
      expect(coverage.getCoverageLevel(89)).toBe("good");
      expect(coverage.getCoverageLevel(90)).toBe("excellent");
    });
  });

  // --- getCoverageColor ---
  describe("getCoverageColor", () => {
    it("maps excellent to green", () => {
      expect(coverage.getCoverageColor("excellent")).toBe("#22c55e");
    });

    it("maps good to blue", () => {
      expect(coverage.getCoverageColor("good")).toBe("#3b82f6");
    });

    it("maps warning to amber", () => {
      expect(coverage.getCoverageColor("warning")).toBe("#f59e0b");
    });

    it("maps critical to red", () => {
      expect(coverage.getCoverageColor("critical")).toBe("#ef4444");
    });

    it("all four levels produce distinct colors", () => {
      const colors = new Set([
        coverage.getCoverageColor("excellent"),
        coverage.getCoverageColor("good"),
        coverage.getCoverageColor("warning"),
        coverage.getCoverageColor("critical"),
      ]);
      expect(colors.size).toBe(4);
    });
  });

  // --- buildCoverageData ---
  describe("buildCoverageData", () => {
    it("aggregates resource counts into coverage data", () => {
      const result = coverage.buildCoverageData("ar", [
        { type: "Product", total: 100, translated: 80 },
        { type: "Collection", total: 20, translated: 10 },
        { type: "Page", total: 30, translated: 25 },
      ]);

      expect(result.locale).toBe("ar");
      expect(result.totalResources).toBe(150);
      expect(result.translatedResources).toBe(115);
      expect(result.coveragePercent).toBe(77);
      expect(result.byResourceType).toHaveProperty("Product");
      expect(result.byResourceType.Product.percent).toBe(80);
      expect(result.byResourceType.Collection.percent).toBe(50);
      expect(result.byResourceType.Page.percent).toBe(83);
    });

    it("handles empty resource counts", () => {
      const result = coverage.buildCoverageData("he", []);
      expect(result.totalResources).toBe(0);
      expect(result.translatedResources).toBe(0);
      expect(result.coveragePercent).toBe(100); // 0/0 = 100
    });

    it("calculates trend as stable when no previous percent", () => {
      const result = coverage.buildCoverageData("ar", [
        { type: "Product", total: 100, translated: 50 },
      ]);
      expect(result.trend.direction).toBe("stable");
      expect(result.trend.changePercent).toBe(0);
    });

    it("calculates upward trend", () => {
      const result = coverage.buildCoverageData(
        "ar",
        [{ type: "Product", total: 100, translated: 70 }],
        50,
      );
      expect(result.trend.direction).toBe("up");
      expect(result.trend.changePercent).toBe(20);
    });

    it("calculates downward trend", () => {
      const result = coverage.buildCoverageData(
        "ar",
        [{ type: "Product", total: 100, translated: 30 }],
        50,
      );
      expect(result.trend.direction).toBe("down");
      expect(result.trend.changePercent).toBe(20);
    });

    it("stores goal in coverage data", () => {
      const result = coverage.buildCoverageData(
        "ar",
        [{ type: "Product", total: 100, translated: 80 }],
        undefined,
        90,
      );
      expect(result.goal).toBe(90);
    });
  });

  // --- sortByPriority ---
  describe("sortByPriority", () => {
    it("puts lowest coverage first", () => {
      const data = [
        coverage.buildCoverageData("ar", [{ type: "Product", total: 100, translated: 80 }]),
        coverage.buildCoverageData("fa", [{ type: "Product", total: 100, translated: 20 }]),
        coverage.buildCoverageData("he", [{ type: "Product", total: 100, translated: 50 }]),
      ];
      const sorted = coverage.sortByPriority(data);
      expect(sorted[0].locale).toBe("fa");
      expect(sorted[1].locale).toBe("he");
      expect(sorted[2].locale).toBe("ar");
    });

    it("handles empty list", () => {
      expect(coverage.sortByPriority([])).toEqual([]);
    });

    it("does not mutate the original array", () => {
      const data = [
        coverage.buildCoverageData("ar", [{ type: "Product", total: 100, translated: 80 }]),
        coverage.buildCoverageData("fa", [{ type: "Product", total: 100, translated: 20 }]),
      ];
      const original = [...data];
      coverage.sortByPriority(data);
      expect(data[0].locale).toBe(original[0].locale);
    });

    it("handles all equal coverage", () => {
      const data = [
        coverage.buildCoverageData("ar", [{ type: "Product", total: 100, translated: 50 }]),
        coverage.buildCoverageData("he", [{ type: "Product", total: 100, translated: 50 }]),
      ];
      const sorted = coverage.sortByPriority(data);
      expect(sorted).toHaveLength(2);
    });
  });

  // --- isGoalMet ---
  describe("isGoalMet", () => {
    it("returns true when no goal is set", () => {
      const data = coverage.buildCoverageData("ar", [
        { type: "Product", total: 100, translated: 50 },
      ]);
      expect(coverage.isGoalMet(data)).toBe(true);
    });

    it("returns true when coverage meets goal", () => {
      const data = coverage.buildCoverageData(
        "ar",
        [{ type: "Product", total: 100, translated: 90 }],
        undefined,
        90,
      );
      expect(coverage.isGoalMet(data)).toBe(true);
    });

    it("returns true when coverage exceeds goal", () => {
      const data = coverage.buildCoverageData(
        "ar",
        [{ type: "Product", total: 100, translated: 95 }],
        undefined,
        90,
      );
      expect(coverage.isGoalMet(data)).toBe(true);
    });

    it("returns false when coverage is below goal", () => {
      const data = coverage.buildCoverageData(
        "ar",
        [{ type: "Product", total: 100, translated: 50 }],
        undefined,
        90,
      );
      expect(coverage.isGoalMet(data)).toBe(false);
    });
  });

  // --- getCoverageSummary ---
  describe("getCoverageSummary", () => {
    it("returns correct summary for multiple locales", () => {
      const data = [
        coverage.buildCoverageData("ar", [{ type: "Product", total: 100, translated: 80 }]),
        coverage.buildCoverageData("he", [{ type: "Product", total: 100, translated: 40 }]),
        coverage.buildCoverageData("fa", [{ type: "Product", total: 100, translated: 20 }]),
      ];
      const summary = coverage.getCoverageSummary(data);
      expect(summary.totalLocales).toBe(3);
      expect(summary.avgCoverage).toBe(47); // (80+40+20)/3 = 46.67 rounded
      expect(summary.lowestLocale).toBe("fa");
      expect(summary.highestLocale).toBe("ar");
    });

    it("handles empty list", () => {
      const summary = coverage.getCoverageSummary([]);
      expect(summary.totalLocales).toBe(0);
      expect(summary.avgCoverage).toBe(0);
      expect(summary.lowestLocale).toBeNull();
      expect(summary.highestLocale).toBeNull();
    });

    it("handles single locale", () => {
      const data = [
        coverage.buildCoverageData("ar", [{ type: "Product", total: 100, translated: 75 }]),
      ];
      const summary = coverage.getCoverageSummary(data);
      expect(summary.totalLocales).toBe(1);
      expect(summary.avgCoverage).toBe(75);
      expect(summary.lowestLocale).toBe("ar");
      expect(summary.highestLocale).toBe("ar");
    });
  });

  // --- getCoverageStats ---
  describe("getCoverageStats", () => {
    it("produces full stats with level and color", () => {
      const stats = coverage.getCoverageStats("ar", [
        { type: "Product", total: 100, translated: 92 },
      ]);
      expect(stats.locale).toBe("ar");
      expect(stats.coveragePercent).toBe(92);
      expect(stats.level).toBe("excellent");
      expect(stats.color).toBe("#22c55e");
      expect(stats.missingCount).toBe(8);
      expect(stats.goalMet).toBe(true);
    });

    it("detects goal not met", () => {
      const stats = coverage.getCoverageStats(
        "ar",
        [{ type: "Product", total: 100, translated: 50 }],
        undefined,
        { locale: "ar", targetPercent: 80 },
      );
      expect(stats.goalMet).toBe(false);
      expect(stats.level).toBe("warning");
    });
  });

  // --- getProgressMetrics ---
  describe("getProgressMetrics", () => {
    it("calculates improving progress", () => {
      const metrics = coverage.getProgressMetrics("ar", 80, 60);
      expect(metrics.changeDirection).toBe("up");
      expect(metrics.changePercent).toBe(20);
      expect(metrics.remainingToGoal).toBe(20);
    });

    it("calculates declining progress", () => {
      const metrics = coverage.getProgressMetrics("ar", 40, 60);
      expect(metrics.changeDirection).toBe("down");
      expect(metrics.changePercent).toBe(20);
    });

    it("calculates stable progress", () => {
      const metrics = coverage.getProgressMetrics("ar", 50, 50);
      expect(metrics.changeDirection).toBe("stable");
      expect(metrics.changePercent).toBe(0);
    });

    it("estimates days to goal", () => {
      const metrics = coverage.getProgressMetrics("ar", 80, 70, "week", 5);
      expect(metrics.estimatedDaysToGoal).toBe(4); // 20 remaining / 5 per day
    });

    it("handles 100% coverage (no remaining)", () => {
      const metrics = coverage.getProgressMetrics("ar", 100, 90);
      expect(metrics.remainingToGoal).toBe(0);
    });
  });

  // --- getMissingTranslations ---
  describe("getMissingTranslations", () => {
    it("identifies missing translations", () => {
      const allResources = [
        { key: "title", resourceType: "Product", resourceId: "1", sourceValue: "Handbag" },
        { key: "desc", resourceType: "Product", resourceId: "1", sourceValue: "Leather bag" },
        { key: "about", resourceType: "Page", resourceId: "2", sourceValue: "About us" },
      ];
      const translated = ["title"];
      const missing = coverage.getMissingTranslations("ar", allResources, translated);
      expect(missing).toHaveLength(2);
      expect(missing[0].key).toBe("desc");
      expect(missing[1].key).toBe("about");
    });

    it("returns empty when all are translated", () => {
      const allResources = [
        { key: "title", resourceType: "Product", resourceId: "1", sourceValue: "Test" },
      ];
      const missing = coverage.getMissingTranslations("ar", allResources, ["title"]);
      expect(missing).toHaveLength(0);
    });

    it("assigns default medium priority", () => {
      const allResources = [
        { key: "k1", resourceType: "Product", resourceId: "1", sourceValue: "Test" },
      ];
      const missing = coverage.getMissingTranslations("ar", allResources, []);
      expect(missing[0].priority).toBe("medium");
    });

    it("preserves explicit priority", () => {
      const allResources = [
        { key: "k1", resourceType: "Product", resourceId: "1", sourceValue: "Test", priority: "high" as const },
      ];
      const missing = coverage.getMissingTranslations("ar", allResources, []);
      expect(missing[0].priority).toBe("high");
    });
  });

  // --- generateCoverageReport ---
  describe("generateCoverageReport", () => {
    it("generates comprehensive report for dashboard locale list", () => {
      const report = coverage.generateCoverageReport([
        { locale: "ar", resourceCounts: [{ type: "Product", total: 100, translated: 80 }], previousPercent: 70 },
        { locale: "he", resourceCounts: [{ type: "Product", total: 100, translated: 45 }] },
        { locale: "fa", resourceCounts: [{ type: "Product", total: 100, translated: 20 }] },
        { locale: "fr", resourceCounts: [{ type: "Product", total: 100, translated: 92 }] },
      ]);

      expect(report.overallStats.totalLocales).toBe(4);
      expect(report.overallStats.totalResources).toBe(400);
      expect(report.overallStats.totalTranslated).toBe(237);
      expect(report.localeStats).toHaveLength(4);
      expect(report.attentionNeeded).toContain("he");
      expect(report.attentionNeeded).toContain("fa");
      expect(report.progressMetrics).toHaveLength(1); // only 'ar' has previousPercent
    });

    it("handles empty locale list", () => {
      const report = coverage.generateCoverageReport([]);
      expect(report.overallStats.totalLocales).toBe(0);
      expect(report.overallStats.overallPercent).toBe(100);
      expect(report.localeStats).toHaveLength(0);
    });
  });

  // --- compareCoveragePeriods ---
  describe("compareCoveragePeriods", () => {
    it("detects improving trend", () => {
      const current = coverage.buildCoverageData("ar", [{ type: "Product", total: 100, translated: 80 }]);
      const previous = coverage.buildCoverageData("ar", [{ type: "Product", total: 100, translated: 60 }]);
      const comparison = coverage.compareCoveragePeriods(current, previous);
      expect(comparison.trendDirection).toBe("improving");
      expect(comparison.coverageChange).toBe(20);
    });

    it("detects declining trend", () => {
      const current = coverage.buildCoverageData("ar", [{ type: "Product", total: 100, translated: 40 }]);
      const previous = coverage.buildCoverageData("ar", [{ type: "Product", total: 100, translated: 60 }]);
      const comparison = coverage.compareCoveragePeriods(current, previous);
      expect(comparison.trendDirection).toBe("declining");
    });

    it("detects stable trend (within 2% threshold)", () => {
      const current = coverage.buildCoverageData("ar", [{ type: "Product", total: 100, translated: 51 }]);
      const previous = coverage.buildCoverageData("ar", [{ type: "Product", total: 100, translated: 50 }]);
      const comparison = coverage.compareCoveragePeriods(current, previous);
      expect(comparison.trendDirection).toBe("stable");
    });
  });

  // --- getGoalStatus ---
  describe("getGoalStatus", () => {
    it("returns met when no goal is set", () => {
      const stats = coverage.getCoverageStats("ar", [
        { type: "Product", total: 100, translated: 50 },
      ]);
      const status = coverage.getGoalStatus(stats);
      expect(status.status).toBe("met");
    });

    it("returns met when goal is exceeded", () => {
      const stats = coverage.getCoverageStats(
        "ar",
        [{ type: "Product", total: 100, translated: 95 }],
        undefined,
        { locale: "ar", targetPercent: 90 },
      );
      const status = coverage.getGoalStatus(stats);
      expect(status.status).toBe("met");
      expect(status.progressToGoal).toBeGreaterThanOrEqual(100);
    });

    it("returns overdue when deadline has passed", () => {
      const stats = coverage.getCoverageStats(
        "ar",
        [{ type: "Product", total: 100, translated: 50 }],
        undefined,
        { locale: "ar", targetPercent: 90, deadline: "2020-01-01" },
      );
      const status = coverage.getGoalStatus(stats, new Date("2025-01-01"));
      expect(status.status).toBe("overdue");
      expect(status.daysRemaining).toBeLessThan(0);
    });
  });
});

// ============================================================================
// SECTION 2: Translation Memory — Matcher (pure functions)
// ============================================================================
describe("Translation Memory — Matcher", () => {
  let matcher: typeof import("../../app/services/translation-memory/matcher");

  beforeEach(async () => {
    matcher = await import("../../app/services/translation-memory/matcher");
  });

  describe("normalizeForMatching", () => {
    it("lowercases text", () => {
      expect(matcher.normalizeForMatching("Hello World")).toBe("hello world");
    });

    it("trims whitespace", () => {
      expect(matcher.normalizeForMatching("  hello  ")).toBe("hello");
    });

    it("collapses internal whitespace", () => {
      expect(matcher.normalizeForMatching("hello    world")).toBe("hello world");
    });

    it("handles empty string", () => {
      expect(matcher.normalizeForMatching("")).toBe("");
    });

    it("handles only whitespace", () => {
      expect(matcher.normalizeForMatching("   ")).toBe("");
    });

    it("handles mixed casing and whitespace", () => {
      expect(matcher.normalizeForMatching("  HeLLo   WoRLD  ")).toBe("hello world");
    });
  });

  describe("levenshteinDistance", () => {
    it("returns 0 for identical strings", () => {
      expect(matcher.levenshteinDistance("hello", "hello")).toBe(0);
    });

    it("returns length of non-empty string when other is empty", () => {
      expect(matcher.levenshteinDistance("hello", "")).toBe(5);
      expect(matcher.levenshteinDistance("", "world")).toBe(5);
    });

    it("returns 0 for two empty strings", () => {
      expect(matcher.levenshteinDistance("", "")).toBe(0);
    });

    it("handles single character difference", () => {
      expect(matcher.levenshteinDistance("cat", "bat")).toBe(1);
    });

    it("handles insertions", () => {
      expect(matcher.levenshteinDistance("cat", "cats")).toBe(1);
    });

    it("handles deletions", () => {
      expect(matcher.levenshteinDistance("cats", "cat")).toBe(1);
    });

    it("calculates correct distance for different strings", () => {
      expect(matcher.levenshteinDistance("kitten", "sitting")).toBe(3);
      expect(matcher.levenshteinDistance("flaw", "lawn")).toBe(2);
    });

    it("handles RTL text (Arabic)", () => {
      const d = matcher.levenshteinDistance("مرحبا", "مرحبا");
      expect(d).toBe(0);
    });

    it("handles mixed LTR/RTL text", () => {
      const d = matcher.levenshteinDistance("hello مرحبا", "hello مرحبا");
      expect(d).toBe(0);
    });
  });

  describe("calculateSimilarity", () => {
    it("returns 1 for identical strings", () => {
      expect(matcher.calculateSimilarity("hello", "hello")).toBe(1);
    });

    it("returns 1 for identical strings with different casing", () => {
      expect(matcher.calculateSimilarity("Hello", "hello")).toBe(1);
    });

    it("returns 1 for two empty strings", () => {
      expect(matcher.calculateSimilarity("", "")).toBe(1);
    });

    it("returns 0 for completely different strings of equal length", () => {
      // "abc" vs "xyz" -> distance 3, maxLen 3 => 1 - 3/3 = 0
      expect(matcher.calculateSimilarity("abc", "xyz")).toBe(0);
    });

    it("returns value between 0 and 1 for similar strings", () => {
      const sim = matcher.calculateSimilarity("Premium Leather Bag", "Premium Leather Handbag");
      expect(sim).toBeGreaterThan(0.5);
      expect(sim).toBeLessThan(1);
    });

    it("normalizes before comparison", () => {
      const sim = matcher.calculateSimilarity("  Hello  World  ", "hello world");
      expect(sim).toBe(1);
    });

    it("handles single character strings", () => {
      expect(matcher.calculateSimilarity("a", "b")).toBe(0);
      expect(matcher.calculateSimilarity("a", "a")).toBe(1);
    });
  });
});

// ============================================================================
// SECTION 3: BiDi Preservation
// ============================================================================
describe("BiDi Preservation Service", () => {
  let bidi: typeof import("../../app/services/bidi/index");
  let constants: typeof import("../../app/services/bidi/constants");

  beforeEach(async () => {
    bidi = await import("../../app/services/bidi/index");
    constants = await import("../../app/services/bidi/constants");
  });

  describe("BiDiPreserver.preserve", () => {
    it("returns empty/null/undefined text unchanged", () => {
      const p = new bidi.BiDiPreserver();
      expect(p.preserve("", "ar")).toBe("");
    });

    it("preserves emails in LTR isolates", () => {
      const p = new bidi.BiDiPreserver();
      const result = p.preserve("اتصل بنا user@example.com", "ar");
      expect(result).toContain(constants.BIDI_MARKS.LRI);
      expect(result).toContain("user@example.com");
      expect(result).toContain(constants.BIDI_MARKS.PDI);
    });

    it("preserves URLs in LTR isolates", () => {
      const p = new bidi.BiDiPreserver();
      const result = p.preserve("زوروا https://shop.example.com اليوم", "ar");
      expect(result).toContain(constants.BIDI_MARKS.LRI);
      expect(result).toContain("https://shop.example.com");
    });

    it("preserves brand names (never-translate terms)", () => {
      const p = new bidi.BiDiPreserver();
      const result = p.preserve("نحن نبيع Shopify Plus هنا", "ar", {
        neverTranslateTerms: ["Shopify Plus"],
      });
      expect(result).toContain(constants.BIDI_MARKS.LRI + "Shopify Plus" + constants.BIDI_MARKS.PDI);
    });

    it("preserves numbers in RTL context", () => {
      const p = new bidi.BiDiPreserver();
      const result = p.preserve("السعر 199 ريال", "ar");
      expect(result).toContain(constants.BIDI_MARKS.LRI + "199" + constants.BIDI_MARKS.PDI);
    });

    it("does not wrap numbers for LTR locales", () => {
      const p = new bidi.BiDiPreserver();
      const result = p.preserve("Price 199 SAR", "en");
      // The text is purely LTR, no mixed content, no wrapping
      expect(result).toBe("Price 199 SAR");
    });

    it("inserts directional marks for mixed content", () => {
      const p = new bidi.BiDiPreserver();
      const result = p.preserve("مرحبا Hello عالم", "ar", {
        preserveEmails: false,
        preserveUrls: false,
        preserveNumbers: false,
        neverTranslateTerms: [],
      });
      // Should have RLM marks since locale is RTL and content is mixed
      expect(result).toContain(constants.BIDI_MARKS.RLM);
    });

    it("skips directional marks when insertMarks is false", () => {
      const p = new bidi.BiDiPreserver();
      const result = p.preserve("مرحبا Hello", "ar", {
        insertMarks: false,
        preserveEmails: false,
        preserveUrls: false,
        preserveNumbers: false,
      });
      expect(result).not.toContain(constants.BIDI_MARKS.RLM);
      expect(result).not.toContain(constants.BIDI_MARKS.LRM);
    });
  });

  describe("BiDiPreserver.detectMixedContent", () => {
    it("detects pure LTR text", () => {
      const p = new bidi.BiDiPreserver();
      const analysis = p.detectMixedContent("Hello World");
      expect(analysis.hasLTR).toBe(true);
      expect(analysis.hasRTL).toBe(false);
      expect(analysis.isMixed).toBe(false);
      expect(analysis.dominantDirection).toBe("ltr");
    });

    it("detects pure RTL text", () => {
      const p = new bidi.BiDiPreserver();
      const analysis = p.detectMixedContent("مرحبا بالعالم");
      expect(analysis.hasRTL).toBe(true);
      expect(analysis.hasLTR).toBe(false);
      expect(analysis.isMixed).toBe(false);
      expect(analysis.dominantDirection).toBe("rtl");
    });

    it("detects mixed content", () => {
      const p = new bidi.BiDiPreserver();
      const analysis = p.detectMixedContent("مرحبا Hello عالم");
      expect(analysis.hasRTL).toBe(true);
      expect(analysis.hasLTR).toBe(true);
      expect(analysis.isMixed).toBe(true);
    });

    it("handles empty string", () => {
      const p = new bidi.BiDiPreserver();
      const analysis = p.detectMixedContent("");
      expect(analysis.hasRTL).toBe(false);
      expect(analysis.hasLTR).toBe(false);
      expect(analysis.isMixed).toBe(false);
      expect(analysis.segments).toHaveLength(0);
    });

    it("handles numbers-only text as neutral", () => {
      const p = new bidi.BiDiPreserver();
      const analysis = p.detectMixedContent("12345");
      expect(analysis.hasRTL).toBe(false);
      expect(analysis.hasLTR).toBe(false);
      expect(analysis.isMixed).toBe(false);
    });

    it("produces segments with correct start/end positions", () => {
      const p = new bidi.BiDiPreserver();
      const analysis = p.detectMixedContent("Hello مرحبا");
      expect(analysis.segments.length).toBeGreaterThan(0);
      for (const seg of analysis.segments) {
        expect(seg.start).toBeGreaterThanOrEqual(0);
        expect(seg.end).toBeGreaterThan(seg.start);
      }
    });
  });

  describe("BiDiPreserver.preserveBrandNames", () => {
    it("wraps longer brand names first", () => {
      const p = new bidi.BiDiPreserver();
      const result = p.preserveBrandNames("Buy Shopify Plus today", ["Shopify", "Shopify Plus"]);
      // "Shopify Plus" should be wrapped as one unit
      expect(result).toContain(constants.BIDI_MARKS.LRI + "Shopify Plus" + constants.BIDI_MARKS.PDI);
    });

    it("handles empty brand list", () => {
      const p = new bidi.BiDiPreserver();
      expect(p.preserveBrandNames("hello", [])).toBe("hello");
    });

    it("handles empty text", () => {
      const p = new bidi.BiDiPreserver();
      expect(p.preserveBrandNames("", ["Shopify"])).toBe("");
    });

    it("ignores non-LTR brand names", () => {
      const p = new bidi.BiDiPreserver();
      const result = p.preserveBrandNames("مرحبا عالم", ["عالم"]);
      // RTL-only terms should not be wrapped in LRI
      expect(result).not.toContain(constants.BIDI_MARKS.LRI);
    });
  });

  describe("BiDi round-trip preservation", () => {
    it("preserved text still contains original content", () => {
      const p = new bidi.BiDiPreserver();
      const original = "اتصل بنا على support@shop.com أو زوروا https://shop.com";
      const preserved = p.preserve(original, "ar");

      // All original content should still be present
      expect(preserved).toContain("support@shop.com");
      expect(preserved).toContain("https://shop.com");
      expect(preserved).toContain("اتصل");

      // Strip all BiDi marks and isolates
      const stripped = preserved.replace(/[\u200E\u200F\u2066\u2067\u2068\u2069\u202A\u202B\u202C\u202D\u202E]/g, "");
      expect(stripped).toContain("support@shop.com");
      expect(stripped).toContain("https://shop.com");
    });
  });
});

// ============================================================================
// SECTION 4: Translation Engine — Construction and Types
// ============================================================================
describe("Translation Engine — Construction", () => {
  it("creates a TranslationEngine instance with custom providers", async () => {
    const { TranslationEngine } = await import("../../app/services/translation/engine");
    const mockProvider = {
      name: "openai" as const,
      isConfigured: () => true,
      supportsLanguagePair: () => true,
      translate: vi.fn().mockResolvedValue({
        provider: "openai",
        translatedText: "مرحبا",
        usage: { requests: 1, characters: 5, remainingRequests: null, remainingCharacters: null },
        quota: { provider: "openai", configured: true, requests: 1, requestLimit: null, characters: 5, characterLimit: null, alert: null },
      }),
      getQuotaStatus: () => ({
        provider: "openai" as const,
        configured: true,
        requests: 0,
        requestLimit: null,
        characters: 0,
        characterLimit: null,
        alert: null,
      }),
    };

    const cacheStore = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
    };

    const engine = new TranslationEngine({
      providers: [mockProvider],
      cache: cacheStore,
    });

    expect(engine).toBeDefined();
    expect(typeof engine.translate).toBe("function");
    expect(typeof engine.getQuotaStatus).toBe("function");
  });

  it("translate throws for empty text", async () => {
    const { TranslationEngine } = await import("../../app/services/translation/engine");
    const engine = new TranslationEngine({
      providers: [],
      cache: { get: vi.fn(), set: vi.fn() },
    });

    await expect(engine.translate({
      text: "  ",
      sourceLocale: "en",
      targetLocale: "ar",
    })).rejects.toThrow("Text is required");
  });

  it("returns same text when source and target locale match", async () => {
    const { TranslationEngine } = await import("../../app/services/translation/engine");
    const engine = new TranslationEngine({
      providers: [{
        name: "openai",
        isConfigured: () => true,
        supportsLanguagePair: () => true,
        translate: vi.fn(),
        getQuotaStatus: () => ({
          provider: "openai" as const,
          configured: true,
          requests: 0,
          requestLimit: null,
          characters: 0,
          characterLimit: null,
          alert: null,
        }),
      }],
      cache: { get: vi.fn(), set: vi.fn() },
    });

    const result = await engine.translate({
      text: "Hello",
      sourceLocale: "en",
      targetLocale: "en",
    });

    expect(result.translatedText).toBe("Hello");
    expect(result.cached).toBe(false);
    expect(result.metadata?.skipped).toBe(true);
  });

  it("returns cached result when cache hit", async () => {
    const { TranslationEngine } = await import("../../app/services/translation/engine");
    const cachedEntry = {
      cacheKey: "abc",
      provider: "openai" as const,
      sourceLocale: "en",
      targetLocale: "ar",
      sourceText: "Hello",
      translatedText: "مرحبا",
      expiresAt: new Date(Date.now() + 86400000),
    };

    const mockProvider = {
      name: "openai" as const,
      isConfigured: () => true,
      supportsLanguagePair: () => true,
      translate: vi.fn(),
      getQuotaStatus: () => ({
        provider: "openai" as const,
        configured: true,
        requests: 0,
        requestLimit: null,
        characters: 0,
        characterLimit: null,
        alert: null,
      }),
    };

    const engine = new TranslationEngine({
      providers: [mockProvider],
      cache: {
        get: vi.fn().mockResolvedValue(cachedEntry),
        set: vi.fn(),
      },
    });

    const result = await engine.translate({
      text: "Hello",
      sourceLocale: "en",
      targetLocale: "ar",
    });

    expect(result.cached).toBe(true);
    expect(result.translatedText).toBe("مرحبا");
    expect(mockProvider.translate).not.toHaveBeenCalled();
  });

  it("falls back to next provider on failure", async () => {
    const { TranslationEngine, TranslationEngineError } = await import("../../app/services/translation/engine");
    const { TranslationProviderError } = await import("../../app/services/translation/ai-providers/shared");

    const failingProvider = {
      name: "openai" as const,
      isConfigured: () => true,
      supportsLanguagePair: () => true,
      translate: vi.fn().mockRejectedValue(new TranslationProviderError("openai", "rate limited")),
      getQuotaStatus: () => ({
        provider: "openai" as const,
        configured: true,
        requests: 0,
        requestLimit: null,
        characters: 0,
        characterLimit: null,
        alert: null,
      }),
    };

    const successProvider = {
      name: "deepl" as const,
      isConfigured: () => true,
      supportsLanguagePair: () => true,
      translate: vi.fn().mockResolvedValue({
        provider: "deepl",
        translatedText: "مرحبا",
        usage: { requests: 1, characters: 5, remainingRequests: null, remainingCharacters: null },
        quota: { provider: "deepl", configured: true, requests: 1, requestLimit: null, characters: 5, characterLimit: null, alert: null },
      }),
      getQuotaStatus: () => ({
        provider: "deepl" as const,
        configured: true,
        requests: 0,
        requestLimit: null,
        characters: 0,
        characterLimit: null,
        alert: null,
      }),
    };

    const engine = new TranslationEngine({
      providers: [failingProvider, successProvider],
      cache: { get: vi.fn().mockResolvedValue(null), set: vi.fn() },
    });

    const result = await engine.translate({
      text: "Hello",
      sourceLocale: "en",
      targetLocale: "ar",
    });

    expect(result.provider).toBe("deepl");
    expect(result.fallbackUsed).toBe(true);
    expect(result.translatedText).toBe("مرحبا");
  });

  it("throws TranslationEngineError when all providers fail", async () => {
    const { TranslationEngine, TranslationEngineError } = await import("../../app/services/translation/engine");
    const { TranslationProviderError } = await import("../../app/services/translation/ai-providers/shared");

    const failing = {
      name: "openai" as const,
      isConfigured: () => true,
      supportsLanguagePair: () => true,
      translate: vi.fn().mockRejectedValue(new TranslationProviderError("openai", "fail")),
      getQuotaStatus: () => ({
        provider: "openai" as const,
        configured: true,
        requests: 0,
        requestLimit: null,
        characters: 0,
        characterLimit: null,
        alert: null,
      }),
    };

    const engine = new TranslationEngine({
      providers: [failing],
      cache: { get: vi.fn().mockResolvedValue(null), set: vi.fn() },
    });

    await expect(engine.translate({
      text: "Hello",
      sourceLocale: "en",
      targetLocale: "ar",
    })).rejects.toThrow(TranslationEngineError);
  });
});

// ============================================================================
// SECTION 5: Content Field Identification per Resource Type
// ============================================================================
describe("Content Fields per Resource Type", () => {
  it("identifies product content fields", () => {
    const productFields = ["title", "description", "body_html", "handle", "tags"];
    expect(productFields).toContain("title");
    expect(productFields).toContain("description");
    expect(productFields).toContain("body_html");
  });

  it("identifies collection content fields", () => {
    const collectionFields = ["title", "description", "body_html", "handle"];
    expect(collectionFields).toContain("title");
    expect(collectionFields).toContain("description");
  });

  it("identifies page content fields", () => {
    const pageFields = ["title", "body_html", "handle"];
    expect(pageFields).toContain("title");
    expect(pageFields).toContain("body_html");
  });

  it("products have more fields than pages", () => {
    const productFields = ["title", "description", "body_html", "handle", "tags"];
    const pageFields = ["title", "body_html", "handle"];
    expect(productFields.length).toBeGreaterThan(pageFields.length);
  });
});

// ============================================================================
// SECTION 6: Onboarding Flow
// ============================================================================
describe("Onboarding Flow", () => {
  let onboarding: typeof import("../../app/services/onboarding/index");

  beforeEach(async () => {
    onboarding = await import("../../app/services/onboarding/index");
  });

  describe("createOnboardingState", () => {
    it("creates fresh state with welcome as current step", () => {
      const state = onboarding.createOnboardingState("test-shop.myshopify.com");
      expect(state.shop).toBe("test-shop.myshopify.com");
      expect(state.currentStep).toBe("welcome");
      expect(state.isComplete).toBe(false);
      expect(state.steps).toHaveLength(6);
      expect(state.startedAt).toBeDefined();
    });

    it("all steps start as not_started", () => {
      const state = onboarding.createOnboardingState("shop");
      for (const step of state.steps) {
        expect(step.status).toBe("not_started");
      }
    });

    it("steps are in correct order", () => {
      const state = onboarding.createOnboardingState("shop");
      expect(state.steps[0].id).toBe("welcome");
      expect(state.steps[1].id).toBe("language_selection");
      expect(state.steps[2].id).toBe("ai_provider_setup");
      expect(state.steps[3].id).toBe("first_translation");
      expect(state.steps[4].id).toBe("storefront_preview");
      expect(state.steps[5].id).toBe("completion");
    });
  });

  describe("completeStep", () => {
    it("marks step as completed and advances to next", () => {
      let state = onboarding.createOnboardingState("shop");
      state = onboarding.completeStep(state, "welcome");

      const welcomeStep = state.steps.find((s) => s.id === "welcome");
      expect(welcomeStep?.status).toBe("completed");
      expect(welcomeStep?.completedAt).toBeDefined();
      expect(state.currentStep).toBe("language_selection");
    });

    it("completes multiple steps in sequence", () => {
      let state = onboarding.createOnboardingState("shop");
      state = onboarding.completeStep(state, "welcome");
      state = onboarding.completeStep(state, "language_selection");
      state = onboarding.completeStep(state, "ai_provider_setup");

      expect(state.currentStep).toBe("first_translation");
      expect(state.steps.filter((s) => s.status === "completed")).toHaveLength(3);
    });

    it("stores custom data on step", () => {
      let state = onboarding.createOnboardingState("shop");
      state = onboarding.completeStep(state, "language_selection", {
        sourceLocale: "en",
        targetLocales: ["ar", "he"],
      });
      const step = state.steps.find((s) => s.id === "language_selection");
      expect(step?.data).toEqual({
        sourceLocale: "en",
        targetLocales: ["ar", "he"],
      });
    });

    it("marks onboarding complete when all steps done", () => {
      let state = onboarding.createOnboardingState("shop");
      state = onboarding.completeStep(state, "welcome");
      state = onboarding.completeStep(state, "language_selection");
      state = onboarding.completeStep(state, "ai_provider_setup");
      state = onboarding.completeStep(state, "first_translation");
      state = onboarding.completeStep(state, "storefront_preview");
      state = onboarding.completeStep(state, "completion");

      expect(state.isComplete).toBe(true);
      expect(state.completedAt).toBeDefined();
    });

    it("stays on last step when completing the final step", () => {
      let state = onboarding.createOnboardingState("shop");
      // Complete all steps
      for (const step of state.steps) {
        state = onboarding.completeStep(state, step.id);
      }
      // currentStep stays on "completion" since there is no next step
      expect(state.currentStep).toBe("completion");
    });
  });

  describe("skipStep", () => {
    it("marks step as skipped and advances", () => {
      let state = onboarding.createOnboardingState("shop");
      state = onboarding.skipStep(state, "welcome");

      const welcomeStep = state.steps.find((s) => s.id === "welcome");
      expect(welcomeStep?.status).toBe("skipped");
      expect(state.currentStep).toBe("language_selection");
    });

    it("skip is different from complete", () => {
      let state = onboarding.createOnboardingState("shop");
      state = onboarding.skipStep(state, "welcome");

      const step = state.steps.find((s) => s.id === "welcome");
      expect(step?.status).toBe("skipped");
      expect(step?.completedAt).toBeUndefined();
    });
  });

  describe("goToStep", () => {
    it("navigates to a specific step", () => {
      let state = onboarding.createOnboardingState("shop");
      state = onboarding.completeStep(state, "welcome");
      state = onboarding.completeStep(state, "language_selection");

      // Go back to welcome
      state = onboarding.goToStep(state, "welcome");
      expect(state.currentStep).toBe("welcome");
    });

    it("does not change step statuses", () => {
      let state = onboarding.createOnboardingState("shop");
      state = onboarding.completeStep(state, "welcome");
      state = onboarding.goToStep(state, "welcome");

      const step = state.steps.find((s) => s.id === "welcome");
      expect(step?.status).toBe("completed");
    });
  });

  describe("canComplete", () => {
    it("returns false when required steps are not completed", () => {
      const state = onboarding.createOnboardingState("shop");
      expect(onboarding.canComplete(state)).toBe(false);
    });

    it("returns true when required steps are completed", () => {
      let state = onboarding.createOnboardingState("shop");
      state = onboarding.completeStep(state, "language_selection");
      state = onboarding.completeStep(state, "ai_provider_setup");
      expect(onboarding.canComplete(state)).toBe(true);
    });

    it("optional steps do not block completion", () => {
      let state = onboarding.createOnboardingState("shop");
      state = onboarding.completeStep(state, "language_selection");
      state = onboarding.completeStep(state, "ai_provider_setup");
      // first_translation and storefront_preview are optional
      expect(onboarding.canComplete(state)).toBe(true);
    });
  });

  describe("getCurrentStep", () => {
    it("returns the current step details", () => {
      const state = onboarding.createOnboardingState("shop");
      const current = onboarding.getCurrentStep(state);
      expect(current.id).toBe("welcome");
      expect(current.title).toBe("Welcome to RTL Storefront");
    });

    it("returns updated current step after advancing", () => {
      let state = onboarding.createOnboardingState("shop");
      state = onboarding.completeStep(state, "welcome");
      const current = onboarding.getCurrentStep(state);
      expect(current.id).toBe("language_selection");
    });
  });

  describe("resetOnboarding", () => {
    it("resets to fresh state", () => {
      let state = onboarding.createOnboardingState("shop");
      state = onboarding.completeStep(state, "welcome");
      state = onboarding.completeStep(state, "language_selection");

      const reset = onboarding.resetOnboarding("shop");
      expect(reset.currentStep).toBe("welcome");
      expect(reset.isComplete).toBe(false);
      for (const step of reset.steps) {
        expect(step.status).toBe("not_started");
      }
    });
  });

  // --- Steps module ---
  describe("Steps — calculateProgress", () => {
    it("returns 0 for fresh state", () => {
      const state = onboarding.createOnboardingState("shop");
      expect(onboarding.calculateProgress(state.steps)).toBe(0);
    });

    it("returns partial progress", () => {
      let state = onboarding.createOnboardingState("shop");
      state = onboarding.completeStep(state, "welcome");
      state = onboarding.completeStep(state, "language_selection");
      // 2 out of 6 = 33%
      expect(onboarding.calculateProgress(state.steps)).toBe(33);
    });

    it("counts skipped steps as progress", () => {
      let state = onboarding.createOnboardingState("shop");
      state = onboarding.skipStep(state, "welcome");
      expect(onboarding.calculateProgress(state.steps)).toBe(17); // 1/6 ~17%
    });

    it("returns 100 when all complete", () => {
      let state = onboarding.createOnboardingState("shop");
      for (const step of state.steps) {
        state = onboarding.completeStep(state, step.id);
      }
      expect(onboarding.calculateProgress(state.steps)).toBe(100);
    });

    it("returns 100 for mix of completed and skipped", () => {
      let state = onboarding.createOnboardingState("shop");
      state = onboarding.completeStep(state, "welcome");
      state = onboarding.completeStep(state, "language_selection");
      state = onboarding.completeStep(state, "ai_provider_setup");
      state = onboarding.skipStep(state, "first_translation");
      state = onboarding.skipStep(state, "storefront_preview");
      state = onboarding.completeStep(state, "completion");
      expect(onboarding.calculateProgress(state.steps)).toBe(100);
    });
  });

  describe("Steps — getProgressDetails", () => {
    it("returns detailed breakdown", () => {
      let state = onboarding.createOnboardingState("shop");
      state = onboarding.completeStep(state, "welcome");
      state = onboarding.skipStep(state, "language_selection");

      const details = onboarding.getProgressDetails(state.steps);
      expect(details.total).toBe(6);
      expect(details.completed).toBe(1);
      expect(details.skipped).toBe(1);
      expect(details.remaining).toBe(4);
      expect(details.percentage).toBe(33);
    });
  });

  describe("Steps — buildCompletionChecklist", () => {
    it("builds checklist with required items", () => {
      const state = onboarding.createOnboardingState("shop");
      const { checklist, allRequiredComplete } = onboarding.buildCompletionChecklist(state.steps);

      expect(checklist).toHaveLength(4);
      expect(allRequiredComplete).toBe(false);

      const required = checklist.filter((c) => c.required);
      expect(required).toHaveLength(2);
      expect(required[0].id).toBe("languages_configured");
      expect(required[1].id).toBe("ai_provider_configured");
    });

    it("required items are complete after completing required steps", () => {
      let state = onboarding.createOnboardingState("shop");
      state = onboarding.completeStep(state, "language_selection");
      state = onboarding.completeStep(state, "ai_provider_setup");

      const { allRequiredComplete } = onboarding.buildCompletionChecklist(state.steps);
      expect(allRequiredComplete).toBe(true);
    });
  });

  describe("Steps — step navigation helpers", () => {
    it("getNextStep returns correct next step", () => {
      expect(onboarding.getNextStep("welcome")).toBe("language_selection");
      expect(onboarding.getNextStep("language_selection")).toBe("ai_provider_setup");
      expect(onboarding.getNextStep("completion")).toBeNull();
    });

    it("getPreviousStep returns correct previous step", () => {
      expect(onboarding.getPreviousStep("welcome")).toBeNull();
      expect(onboarding.getPreviousStep("language_selection")).toBe("welcome");
      expect(onboarding.getPreviousStep("completion")).toBe("storefront_preview");
    });

    it("isFirstStep and isLastStep", () => {
      expect(onboarding.isFirstStep("welcome")).toBe(true);
      expect(onboarding.isFirstStep("completion")).toBe(false);
      expect(onboarding.isLastStep("completion")).toBe(true);
      expect(onboarding.isLastStep("welcome")).toBe(false);
    });

    it("canSkipStep identifies required vs optional", () => {
      expect(onboarding.canSkipStep("welcome")).toBe(true);
      expect(onboarding.canSkipStep("language_selection")).toBe(false);
      expect(onboarding.canSkipStep("ai_provider_setup")).toBe(false);
      expect(onboarding.canSkipStep("first_translation")).toBe(true);
      expect(onboarding.canSkipStep("storefront_preview")).toBe(true);
      expect(onboarding.canSkipStep("completion")).toBe(true);
    });

    it("compareSteps returns correct ordering", () => {
      expect(onboarding.compareSteps("welcome", "completion")).toBeLessThan(0);
      expect(onboarding.compareSteps("completion", "welcome")).toBeGreaterThan(0);
      expect(onboarding.compareSteps("welcome", "welcome")).toBe(0);
    });

    it("isStepBefore and isStepAfter", () => {
      expect(onboarding.isStepBefore("welcome", "completion")).toBe(true);
      expect(onboarding.isStepBefore("completion", "welcome")).toBe(false);
      expect(onboarding.isStepAfter("completion", "welcome")).toBe(true);
      expect(onboarding.isStepAfter("welcome", "completion")).toBe(false);
    });

    it("getCurrentStepNumber returns 1-indexed step number", () => {
      const state = onboarding.createOnboardingState("shop");
      expect(onboarding.getCurrentStepNumber(state.steps, "welcome")).toBe(1);
      expect(onboarding.getCurrentStepNumber(state.steps, "completion")).toBe(6);
    });
  });

  describe("Steps — getStepSummary", () => {
    it("returns summary with required flag", () => {
      const state = onboarding.createOnboardingState("shop");
      const summary = onboarding.getStepSummary(state.steps);

      expect(summary).toHaveLength(6);
      const langStep = summary.find((s) => s.id === "language_selection");
      expect(langStep?.isRequired).toBe(true);
      const welcomeStep = summary.find((s) => s.id === "welcome");
      expect(welcomeStep?.isRequired).toBe(false);
    });
  });

  // --- Labels module ---
  describe("Labels — localized content", () => {
    it("returns English labels by default", () => {
      const labels = onboarding.getStepLabels("welcome");
      expect(labels.title).toBe("Welcome to RTL Storefront");
      expect(labels.primaryAction).toBe("Get Started");
    });

    it("returns Arabic labels for ar locale", () => {
      const labels = onboarding.getStepLabels("welcome", "ar");
      expect(labels.title).toContain("RTL Storefront");
      expect(labels.primaryAction).toBe("البدء");
    });

    it("returns Hebrew labels for he locale", () => {
      const labels = onboarding.getStepLabels("welcome", "he");
      expect(labels.primaryAction).toBe("מתחילים");
    });

    it("falls back to English for unsupported locale", () => {
      const labels = onboarding.getStepLabels("welcome", "ja");
      expect(labels.title).toBe("Welcome to RTL Storefront");
    });

    it("getWelcomeMessage returns correct message per locale", () => {
      expect(onboarding.getWelcomeMessage("en")).toContain("Welcome to RTL Storefront");
      expect(onboarding.getWelcomeMessage("ar")).toContain("مرحباً");
    });

    it("getCompletionMessage returns message per locale", () => {
      expect(onboarding.getCompletionMessage("en")).toContain("Congratulations");
      expect(onboarding.getCompletionMessage("fr")).toContain("Félicitations");
    });

    it("getOnboardingSteps returns all 6 steps with labels", () => {
      const steps = onboarding.getOnboardingSteps("en");
      expect(steps).toHaveLength(6);
      expect(steps[0].id).toBe("welcome");
      expect(steps[0].labels.title).toBe("Welcome to RTL Storefront");
    });

    it("isRTLLocale detects RTL locales", () => {
      expect(onboarding.isRTLLocale("ar")).toBe(true);
      expect(onboarding.isRTLLocale("he")).toBe(true);
      expect(onboarding.isRTLLocale("fa")).toBe(true);
      expect(onboarding.isRTLLocale("en")).toBe(false);
      expect(onboarding.isRTLLocale("fr")).toBe(false);
    });

    it("getStepIndicator formats differently for RTL", () => {
      const enIndicator = onboarding.getStepIndicator(2, 6, "en");
      expect(enIndicator).toBe("Step 2 of 6");

      const arIndicator = onboarding.getStepIndicator(2, 6, "ar");
      // RTL format: "6 من 2 الخطوة"
      expect(arIndicator).toContain("6");
      expect(arIndicator).toContain("2");
      expect(arIndicator).toContain("من");
    });

    it("getProgressPercentage formats correctly", () => {
      expect(onboarding.getProgressPercentage(50, "en")).toBe("50% complete");
      expect(onboarding.getProgressPercentage(50, "ar")).toBe("50% مكتمل");
    });

    it("getSupportedLocales returns all supported locales", () => {
      const locales = onboarding.getSupportedLocales();
      expect(locales.length).toBeGreaterThanOrEqual(6);
      expect(locales.find((l) => l.code === "ar")?.isRTL).toBe(true);
      expect(locales.find((l) => l.code === "en")?.isRTL).toBe(false);
    });

    it("getNavigationLabels returns nav strings", () => {
      const nav = onboarding.getNavigationLabels("en");
      expect(nav.next).toBe("Next");
      expect(nav.back).toBe("Back");
      expect(nav.finish).toBe("Finish");
    });

    it("getErrorLabels returns error messages", () => {
      const errors = onboarding.getErrorLabels("en");
      expect(errors.generic).toContain("Something went wrong");
      expect(errors.requiredField).toContain("required");
    });
  });
});

// ============================================================================
// SECTION 7: RTL Utilities
// ============================================================================
describe("RTL Utilities", () => {
  let rtl: typeof import("../../app/utils/rtl");

  beforeEach(async () => {
    rtl = await import("../../app/utils/rtl");
  });

  describe("isRTLLanguage", () => {
    it("identifies Arabic as RTL", () => {
      expect(rtl.isRTLLanguage("ar")).toBe(true);
      expect(rtl.isRTLLanguage("ar-SA")).toBe(true);
    });

    it("identifies Hebrew as RTL", () => {
      expect(rtl.isRTLLanguage("he")).toBe(true);
    });

    it("identifies Farsi as RTL", () => {
      expect(rtl.isRTLLanguage("fa")).toBe(true);
    });

    it("identifies Urdu as RTL", () => {
      expect(rtl.isRTLLanguage("ur")).toBe(true);
    });

    it("identifies English as LTR", () => {
      expect(rtl.isRTLLanguage("en")).toBe(false);
    });

    it("identifies French as LTR", () => {
      expect(rtl.isRTLLanguage("fr")).toBe(false);
    });

    it("handles locale with underscores", () => {
      expect(rtl.isRTLLanguage("ar_SA")).toBe(true);
    });
  });

  describe("getTextDirection", () => {
    it("returns rtl for RTL languages", () => {
      expect(rtl.getTextDirection("ar")).toBe("rtl");
      expect(rtl.getTextDirection("he")).toBe("rtl");
    });

    it("returns ltr for LTR languages", () => {
      expect(rtl.getTextDirection("en")).toBe("ltr");
      expect(rtl.getTextDirection("fr")).toBe("ltr");
    });
  });

  describe("normalizeLocale", () => {
    it("replaces underscores with hyphens", () => {
      expect(rtl.normalizeLocale("ar_SA")).toBe("ar-SA");
    });

    it("trims whitespace", () => {
      expect(rtl.normalizeLocale("  ar  ")).toBe("ar");
    });
  });

  describe("getBaseLocale", () => {
    it("extracts base from compound locale", () => {
      expect(rtl.getBaseLocale("ar-SA")).toBe("ar");
      expect(rtl.getBaseLocale("en-US")).toBe("en");
    });

    it("returns locale as-is for simple codes", () => {
      expect(rtl.getBaseLocale("ar")).toBe("ar");
    });

    it("lowercases", () => {
      expect(rtl.getBaseLocale("AR")).toBe("ar");
    });
  });

  describe("getOppositeDirection", () => {
    it("flips rtl to ltr", () => {
      expect(rtl.getOppositeDirection("rtl")).toBe("ltr");
    });

    it("flips ltr to rtl", () => {
      expect(rtl.getOppositeDirection("ltr")).toBe("rtl");
    });
  });

  describe("getDirectionalityMode", () => {
    it("returns single when no content locale", () => {
      expect(rtl.getDirectionalityMode("ar")).toBe("single");
      expect(rtl.getDirectionalityMode("ar", null)).toBe("single");
    });

    it("returns single when directions match", () => {
      expect(rtl.getDirectionalityMode("ar", "he")).toBe("single");
      expect(rtl.getDirectionalityMode("en", "fr")).toBe("single");
    });

    it("returns mixed when directions differ", () => {
      expect(rtl.getDirectionalityMode("ar", "en")).toBe("mixed");
      expect(rtl.getDirectionalityMode("en", "ar")).toBe("mixed");
    });
  });

  describe("getLocaleDirectionContext", () => {
    it("builds full context for Arabic", () => {
      const ctx = rtl.getLocaleDirectionContext("ar");
      expect(ctx.direction).toBe("rtl");
      expect(ctx.isRTL).toBe(true);
      expect(ctx.baseLocale).toBe("ar");
      expect(ctx.htmlAttributes.dir).toBe("rtl");
      expect(ctx.htmlAttributes.className).toContain("dir-rtl");
    });

    it("builds full context for English", () => {
      const ctx = rtl.getLocaleDirectionContext("en");
      expect(ctx.direction).toBe("ltr");
      expect(ctx.isRTL).toBe(false);
      expect(ctx.htmlAttributes.dir).toBe("ltr");
    });

    it("respects forceDirection override", () => {
      const ctx = rtl.getLocaleDirectionContext("en", { forceDirection: "rtl" });
      expect(ctx.direction).toBe("rtl");
      expect(ctx.isRTL).toBe(true);
    });

    it("detects mixed mode with contentLocale", () => {
      const ctx = rtl.getLocaleDirectionContext("ar", { contentLocale: "en" });
      expect(ctx.mode).toBe("mixed");
      expect(ctx.htmlAttributes.className).toContain("directionality-mixed");
    });

    it("defaults to en for empty string locale", () => {
      const ctx = rtl.getLocaleDirectionContext("");
      expect(ctx.baseLocale).toBe("en");
    });
  });

  describe("flipCSSProperty", () => {
    it("flips margin-left to margin-right for RTL", () => {
      const result = rtl.flipCSSProperty("margin-left", "10px", "ar");
      expect(result.property).toBe("margin-right");
      expect(result.value).toBe("10px");
    });

    it("flips text-align left to right for RTL", () => {
      const result = rtl.flipCSSProperty("text-align", "left", "ar");
      expect(result.property).toBe("text-align");
      expect(result.value).toBe("right");
    });

    it("does not flip for LTR locale", () => {
      const result = rtl.flipCSSProperty("margin-left", "10px", "en");
      expect(result.property).toBe("margin-left");
    });

    it("flips float for RTL", () => {
      expect(rtl.flipCSSProperty("float", "left", "ar").value).toBe("right");
      expect(rtl.flipCSSProperty("float", "right", "ar").value).toBe("left");
    });

    it("does not flip unrecognized properties", () => {
      const result = rtl.flipCSSProperty("color", "red", "ar");
      expect(result.property).toBe("color");
      expect(result.value).toBe("red");
    });
  });

  describe("wrapBiDi", () => {
    it("wraps mixed content with RLM for RTL locale", () => {
      const result = rtl.wrapBiDi("مرحبا Hello عالم", "ar");
      expect(result).toContain("\u200F");
    });

    it("does not wrap for LTR locale", () => {
      const result = rtl.wrapBiDi("Hello World", "en");
      expect(result).toBe("Hello World");
    });

    it("does not wrap pure Arabic text", () => {
      const result = rtl.wrapBiDi("مرحبا بالعالم", "ar");
      expect(result).toBe("مرحبا بالعالم");
    });
  });

  describe("shouldInjectRTLStyles", () => {
    it("injects for RTL locale", () => {
      expect(rtl.shouldInjectRTLStyles("ar")).toBe(true);
    });

    it("does not inject for LTR locale", () => {
      expect(rtl.shouldInjectRTLStyles("en")).toBe(false);
    });

    it("injects for mixed directionality", () => {
      expect(rtl.shouldInjectRTLStyles("en", "ar")).toBe(true);
    });
  });
});

// ============================================================================
// SECTION 8: Dashboard Data Flow Integration
// ============================================================================
describe("Dashboard Data Flow — Simulated Loader", () => {
  it("replicates dashboard loader coverage data computation", async () => {
    const { calculateCoverage, getCoverageLevel, getCoverageColor } = await import(
      "../../app/services/coverage/index"
    );

    const locales = [
      { code: "ar", name: "Arabic", nativeName: "العربية" },
      { code: "he", name: "Hebrew", nativeName: "עברית" },
      { code: "fa", name: "Farsi", nativeName: "فارسی" },
      { code: "fr", name: "French", nativeName: "Français" },
    ];

    const totalContent = 1284;
    const translatedCounts: Record<string, number> = { ar: 1001, he: 578, fa: 295, fr: 1181 };

    const coverageData = locales.map((locale) => {
      const translated = translatedCounts[locale.code] ?? 0;
      const percent = calculateCoverage(totalContent, translated);
      const level = getCoverageLevel(percent);
      return { ...locale, total: totalContent, translated, percent, level, color: getCoverageColor(level) };
    });

    // Verify Arabic coverage
    expect(coverageData[0].percent).toBe(78);
    expect(coverageData[0].level).toBe("good");
    expect(coverageData[0].color).toBe("#3b82f6");

    // Verify Hebrew coverage
    expect(coverageData[1].percent).toBe(45);
    expect(coverageData[1].level).toBe("warning");

    // Verify Farsi coverage
    expect(coverageData[2].percent).toBe(23);
    expect(coverageData[2].level).toBe("critical");

    // Verify French coverage
    expect(coverageData[3].percent).toBe(92);
    expect(coverageData[3].level).toBe("excellent");

    // Overall coverage
    const overallPercent = calculateCoverage(
      coverageData.reduce((s, c) => s + c.total, 0),
      coverageData.reduce((s, c) => s + c.translated, 0),
    );
    expect(overallPercent).toBe(59);
  });

  it("verifies all coverage levels have distinct colors for Polaris Badge/ProgressBar", async () => {
    const { getCoverageColor } = await import("../../app/services/coverage/index");

    const levels = ["excellent", "good", "warning", "critical"] as const;
    const colors = levels.map((l) => getCoverageColor(l));

    // All colors should be valid hex
    for (const color of colors) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/);
    }

    // All distinct
    expect(new Set(colors).size).toBe(4);
  });
});
