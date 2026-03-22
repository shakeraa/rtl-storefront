import { describe, it, expect } from "vitest";
import {
  calculateCoverage,
  getCoverageLevel,
  getCoverageColor,
  buildCoverageData,
  sortByPriority,
  isGoalMet,
  getCoverageSummary,
} from "../../app/services/coverage/index";
import type { CoverageData } from "../../app/services/coverage/index";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Coverage Flow - Integration", () => {
  describe("calculateCoverage", () => {
    it("returns 100 when total is 0 (nothing to translate)", () => {
      expect(calculateCoverage(0, 0)).toBe(100);
    });

    it("returns 0 when nothing is translated", () => {
      expect(calculateCoverage(100, 0)).toBe(0);
    });

    it("returns 100 when everything is translated", () => {
      expect(calculateCoverage(50, 50)).toBe(100);
    });

    it("rounds to nearest integer", () => {
      expect(calculateCoverage(3, 1)).toBe(33); // 33.33...
      expect(calculateCoverage(3, 2)).toBe(67); // 66.66...
    });

    it("handles large numbers", () => {
      expect(calculateCoverage(10000, 7500)).toBe(75);
    });
  });

  describe("getCoverageLevel thresholds", () => {
    it("returns 'excellent' for 90% and above", () => {
      expect(getCoverageLevel(90)).toBe("excellent");
      expect(getCoverageLevel(95)).toBe("excellent");
      expect(getCoverageLevel(100)).toBe("excellent");
    });

    it("returns 'good' for 70%-89%", () => {
      expect(getCoverageLevel(70)).toBe("good");
      expect(getCoverageLevel(80)).toBe("good");
      expect(getCoverageLevel(89)).toBe("good");
    });

    it("returns 'warning' for 40%-69%", () => {
      expect(getCoverageLevel(40)).toBe("warning");
      expect(getCoverageLevel(55)).toBe("warning");
      expect(getCoverageLevel(69)).toBe("warning");
    });

    it("returns 'critical' for below 40%", () => {
      expect(getCoverageLevel(0)).toBe("critical");
      expect(getCoverageLevel(20)).toBe("critical");
      expect(getCoverageLevel(39)).toBe("critical");
    });

    it("maps each level to a color string", () => {
      expect(getCoverageColor("excellent")).toMatch(/^#/);
      expect(getCoverageColor("good")).toMatch(/^#/);
      expect(getCoverageColor("warning")).toMatch(/^#/);
      expect(getCoverageColor("critical")).toMatch(/^#/);
    });
  });

  describe("buildCoverageData aggregation", () => {
    it("aggregates multiple resource types", () => {
      const data = buildCoverageData("ar", [
        { type: "product", total: 100, translated: 80 },
        { type: "collection", total: 50, translated: 50 },
        { type: "page", total: 50, translated: 20 },
      ]);

      expect(data.locale).toBe("ar");
      expect(data.totalResources).toBe(200);
      expect(data.translatedResources).toBe(150);
      expect(data.coveragePercent).toBe(75);

      expect(data.byResourceType["product"].percent).toBe(80);
      expect(data.byResourceType["collection"].percent).toBe(100);
      expect(data.byResourceType["page"].percent).toBe(40);
    });

    it("calculates upward trend when coverage increased", () => {
      const data = buildCoverageData(
        "ar",
        [{ type: "product", total: 100, translated: 80 }],
        70, // previous was 70%, now 80%
      );

      expect(data.trend.direction).toBe("up");
      expect(data.trend.changePercent).toBe(10);
    });

    it("calculates downward trend when coverage decreased", () => {
      const data = buildCoverageData(
        "ar",
        [{ type: "product", total: 100, translated: 50 }],
        70, // previous was 70%, now 50%
      );

      expect(data.trend.direction).toBe("down");
      expect(data.trend.changePercent).toBe(20);
    });

    it("shows stable trend when coverage unchanged", () => {
      const data = buildCoverageData(
        "ar",
        [{ type: "product", total: 100, translated: 70 }],
        70,
      );

      expect(data.trend.direction).toBe("stable");
      expect(data.trend.changePercent).toBe(0);
    });

    it("shows stable trend when no previous data", () => {
      const data = buildCoverageData("ar", [
        { type: "product", total: 100, translated: 50 },
      ]);

      expect(data.trend.direction).toBe("stable");
    });

    it("includes goal when provided", () => {
      const data = buildCoverageData(
        "ar",
        [{ type: "product", total: 100, translated: 80 }],
        undefined,
        90,
      );

      expect(data.goal).toBe(90);
    });

    it("handles empty resource list", () => {
      const data = buildCoverageData("ar", []);
      expect(data.totalResources).toBe(0);
      expect(data.translatedResources).toBe(0);
      expect(data.coveragePercent).toBe(100); // 0/0 = 100%
    });
  });

  describe("sortByPriority ordering", () => {
    it("sorts locales by coverage ascending (lowest first)", () => {
      const list: CoverageData[] = [
        buildCoverageData("en", [{ type: "p", total: 100, translated: 90 }]),
        buildCoverageData("ar", [{ type: "p", total: 100, translated: 30 }]),
        buildCoverageData("he", [{ type: "p", total: 100, translated: 60 }]),
      ];

      const sorted = sortByPriority(list);
      expect(sorted[0].locale).toBe("ar");
      expect(sorted[1].locale).toBe("he");
      expect(sorted[2].locale).toBe("en");
    });

    it("does not mutate the original array", () => {
      const list: CoverageData[] = [
        buildCoverageData("en", [{ type: "p", total: 100, translated: 90 }]),
        buildCoverageData("ar", [{ type: "p", total: 100, translated: 30 }]),
      ];

      const sorted = sortByPriority(list);
      expect(sorted).not.toBe(list);
      expect(list[0].locale).toBe("en"); // original unchanged
    });

    it("handles single-item list", () => {
      const list = [
        buildCoverageData("ar", [{ type: "p", total: 100, translated: 50 }]),
      ];
      const sorted = sortByPriority(list);
      expect(sorted).toHaveLength(1);
      expect(sorted[0].locale).toBe("ar");
    });

    it("handles empty list", () => {
      expect(sortByPriority([])).toEqual([]);
    });
  });

  describe("isGoalMet", () => {
    it("returns true when no goal is set", () => {
      const data = buildCoverageData("ar", [
        { type: "p", total: 100, translated: 10 },
      ]);
      expect(isGoalMet(data)).toBe(true);
    });

    it("returns true when coverage meets goal", () => {
      const data = buildCoverageData(
        "ar",
        [{ type: "p", total: 100, translated: 90 }],
        undefined,
        90,
      );
      expect(isGoalMet(data)).toBe(true);
    });

    it("returns false when coverage is below goal", () => {
      const data = buildCoverageData(
        "ar",
        [{ type: "p", total: 100, translated: 50 }],
        undefined,
        90,
      );
      expect(isGoalMet(data)).toBe(false);
    });
  });

  describe("getCoverageSummary", () => {
    it("returns zeros for empty list", () => {
      const summary = getCoverageSummary([]);
      expect(summary.totalLocales).toBe(0);
      expect(summary.avgCoverage).toBe(0);
      expect(summary.lowestLocale).toBeNull();
      expect(summary.highestLocale).toBeNull();
    });

    it("computes correct summary for multiple locales", () => {
      const list = [
        buildCoverageData("ar", [{ type: "p", total: 100, translated: 30 }]),
        buildCoverageData("he", [{ type: "p", total: 100, translated: 60 }]),
        buildCoverageData("en", [{ type: "p", total: 100, translated: 90 }]),
      ];

      const summary = getCoverageSummary(list);
      expect(summary.totalLocales).toBe(3);
      expect(summary.avgCoverage).toBe(60); // (30+60+90)/3
      expect(summary.lowestLocale).toBe("ar");
      expect(summary.highestLocale).toBe("en");
    });
  });
});
