import { describe, expect, it } from "vitest";
import {
  analyzeBundleSize,
  findDuplicateModules,
  findUnusedExports,
  generateRecommendations,
  calculateBundleScore,
  getSplitPointsByLocale,
  getAllLocaleSplitConfigs,
  calculateLocaleSplitSavings,
  detectDeadCode,
  getLazyImportCandidates,
  analyzeImportPatterns,
  estimateSavings,
  estimateSavingsByType,
  formatBytes,
  calculateReduction,
  generateBundleReport,
  validateBundleBudget,
  SIZE_THRESHOLDS,
  COMPRESSION_RATIOS,
  type BundleStats,
  type ModuleInfo,
  type BundleAnalysis,
} from "../../app/services/performance/bundle-optimizer";

describe("Bundle Optimizer", () => {
  // ---------------------------------------------------------------------------
  // Test Fixtures
  // ---------------------------------------------------------------------------

  const createMockModule = (overrides: Partial<ModuleInfo> = {}): ModuleInfo => ({
    id: `mod-${Math.random().toString(36).slice(2)}`,
    path: "~/components/Button.tsx",
    size: 1024,
    dependencies: [],
    importedBy: [],
    isNodeModule: false,
    ...overrides,
  });

  const createMockBundleStats = (overrides: Partial<BundleStats> = {}): BundleStats => ({
    totalSize: 1024 * 1024,
    modules: [],
    chunks: [],
    entryPoints: ["app/entry.tsx"],
    ...overrides,
  });

  // ---------------------------------------------------------------------------
  // Bundle Analysis
  // ---------------------------------------------------------------------------

  describe("analyzeBundleSize", () => {
    it("analyzes bundle and returns complete analysis object", () => {
      const stats = createMockBundleStats({
        totalSize: 2 * 1024 * 1024,
        modules: [
          createMockModule({ path: "~/utils/large.ts", size: 150 * 1024 }),
          createMockModule({ path: "~/utils/medium.ts", size: 60 * 1024 }),
        ],
      });

      const analysis = analyzeBundleSize(stats);

      expect(analysis.totalSize).toBe(2 * 1024 * 1024);
      expect(analysis.moduleCount).toBe(2);
      expect(analysis.score).toBeGreaterThanOrEqual(0);
      expect(analysis.score).toBeLessThanOrEqual(100);
      expect(Array.isArray(analysis.largeModules)).toBe(true);
      expect(Array.isArray(analysis.optimizationRecommendations)).toBe(true);
    });

    it("identifies large modules exceeding threshold", () => {
      const stats = createMockBundleStats({
        modules: [
          createMockModule({ path: "small.ts", size: 1024 }),
          createMockModule({ path: "large.ts", size: 100 * 1024 }),
          createMockModule({ path: "very-large.ts", size: 200 * 1024 }),
        ],
      });

      const analysis = analyzeBundleSize(stats);

      expect(analysis.largeModules.length).toBe(2);
      expect(analysis.largeModules[0].path).toBe("very-large.ts");
      expect(analysis.largeModules[1].path).toBe("large.ts");
    });

    it("calculates compressed size estimate", () => {
      const stats = createMockBundleStats({ totalSize: 100 * 1024 });
      const analysis = analyzeBundleSize(stats);

      const expectedBrotli = Math.round(100 * 1024 * COMPRESSION_RATIOS.brotli);
      expect(analysis.compressedSize).toBe(expectedBrotli);
    });

    it("sorts recommendations by priority and savings", () => {
      const stats = createMockBundleStats({
        modules: [
          createMockModule({ path: "huge.ts", size: 500 * 1024 }),
          createMockModule({ path: "dup1.ts", size: 50 * 1024, dependencies: ["shared"] }),
          createMockModule({ path: "dup2.ts", size: 50 * 1024, dependencies: ["shared"] }),
        ],
      });

      const analysis = analyzeBundleSize(stats);
      const recs = analysis.optimizationRecommendations;

      expect(recs.length).toBeGreaterThan(0);
      if (recs.length >= 2) {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        expect(priorityOrder[recs[0].priority]).toBeLessThanOrEqual(priorityOrder[recs[1].priority]);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Duplicate Detection
  // ---------------------------------------------------------------------------

  describe("findDuplicateModules", () => {
    it("detects duplicate modules across chunks", () => {
      const modules = [
        createMockModule({ path: "shared/utils.ts", size: 10 * 1024 }),
        createMockModule({ path: "shared/utils.ts", size: 10 * 1024 }),
        createMockModule({ path: "shared/utils.ts", size: 10 * 1024 }),
        createMockModule({ path: "unique.ts", size: 5 * 1024 }),
      ];

      const duplicates = findDuplicateModules(modules);

      expect(duplicates.length).toBe(1);
      expect(duplicates[0].path).toBe("shared/utils.ts");
      expect(duplicates[0].occurrences).toBe(3);
      expect(duplicates[0].totalWasted).toBe(20 * 1024);
    });

    it("sorts duplicates by wasted bytes descending", () => {
      const modules = [
        createMockModule({ path: "small-dup.ts", size: 5 * 1024 }),
        createMockModule({ path: "small-dup.ts", size: 5 * 1024 }),
        createMockModule({ path: "large-dup.ts", size: 50 * 1024 }),
        createMockModule({ path: "large-dup.ts", size: 50 * 1024 }),
        createMockModule({ path: "large-dup.ts", size: 50 * 1024 }),
      ];

      const duplicates = findDuplicateModules(modules);

      expect(duplicates[0].path).toBe("large-dup.ts");
      expect(duplicates[1].path).toBe("small-dup.ts");
    });

    it("returns empty array when no duplicates exist", () => {
      const modules = [
        createMockModule({ path: "a.ts", size: 1024 }),
        createMockModule({ path: "b.ts", size: 1024 }),
        createMockModule({ path: "c.ts", size: 1024 }),
      ];

      const duplicates = findDuplicateModules(modules);

      expect(duplicates).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  // Unused Exports
  // ---------------------------------------------------------------------------

  describe("findUnusedExports", () => {
    it("identifies modules with no used exports", () => {
      const modules = [
        createMockModule({ path: "used.ts", size: 1024, usedExports: ["foo", "bar"] }),
        createMockModule({ path: "unused.ts", size: 2048, usedExports: [] }),
      ];

      const unused = findUnusedExports(modules);

      expect(unused.length).toBe(1);
      expect(unused[0].module).toBe("unused.ts");
      expect(unused[0].size).toBe(2048);
    });

    it("sorts unused exports by size descending", () => {
      const modules = [
        createMockModule({ path: "small.ts", size: 1024, usedExports: [] }),
        createMockModule({ path: "large.ts", size: 10000, usedExports: [] }),
      ];

      const unused = findUnusedExports(modules);

      expect(unused[0].module).toBe("large.ts");
    });
  });

  // ---------------------------------------------------------------------------
  // Recommendations
  // ---------------------------------------------------------------------------

  describe("generateRecommendations", () => {
    it("recommends splitting very large modules", () => {
      const modules = [createMockModule({ path: "huge.ts", size: 150 * 1024 })];
      const recs = generateRecommendations(modules, [], []);

      const splitRec = recs.find(r => r.type === "split");
      expect(splitRec).toBeDefined();
      expect(splitRec?.priority).toBe("high");
      expect(splitRec?.estimatedSavings).toBeGreaterThan(0);
    });

    it("recommends lazy loading for heavy UI components", () => {
      const modules = [
        createMockModule({ 
          path: "~/components/RichTextEditor.tsx", 
          size: 100 * 1024,
          importedBy: ["~/pages/Home.tsx"],
        }),
      ];
      const recs = generateRecommendations(modules, [], []);

      const lazyRec = recs.find(r => r.type === "lazy");
      expect(lazyRec).toBeDefined();
      expect(lazyRec?.module).toContain("RichTextEditor");
    });

    it("recommends deduplication for duplicate modules", () => {
      const duplicates = [
        { path: "dup.ts", size: 50 * 1024, occurrences: 3, totalWasted: 100 * 1024, locations: ["a", "b", "c"] },
      ];
      const recs = generateRecommendations([], duplicates, []);

      const dedupeRec = recs.find(r => r.type === "dedupe");
      expect(dedupeRec).toBeDefined();
      expect(dedupeRec?.estimatedSavings).toBe(100 * 1024);
    });
  });

  // ---------------------------------------------------------------------------
  // Bundle Score
  // ---------------------------------------------------------------------------

  describe("calculateBundleScore", () => {
    it("returns 100 for optimal bundle", () => {
      const score = calculateBundleScore(500 * 1024, 0, 0, 0);
      expect(score).toBe(100);
    });

    it("deducts points for large total size", () => {
      const score = calculateBundleScore(3 * 1024 * 1024, 0, 0, 0);
      expect(score).toBeLessThan(100);
    });

    it("deducts points for many large modules", () => {
      const score = calculateBundleScore(500 * 1024, 10, 0, 0);
      expect(score).toBeLessThan(100);
    });

    it("deducts points for duplicates", () => {
      const score = calculateBundleScore(500 * 1024, 0, 5, 0);
      expect(score).toBeLessThan(100);
    });

    it("never returns negative score", () => {
      const score = calculateBundleScore(10 * 1024 * 1024, 100, 100, 100);
      expect(score).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Locale-based Splitting
  // ---------------------------------------------------------------------------

  describe("getSplitPointsByLocale", () => {
    it("returns config for Arabic locale", () => {
      const config = getSplitPointsByLocale("ar");

      expect(config.locale).toBe("ar");
      expect(config.requiredModules.length).toBeGreaterThan(0);
      expect(config.splitPoints.length).toBeGreaterThan(0);
      expect(config.estimatedSize).toBeGreaterThan(0);
    });

    it("returns config for Hebrew locale", () => {
      const config = getSplitPointsByLocale("he");

      expect(config.locale).toBe("he");
      expect(config.splitPoints.some(sp => sp.category === "rtl")).toBe(true);
    });

    it("returns config for English locale", () => {
      const config = getSplitPointsByLocale("en");

      expect(config.locale).toBe("en");
      expect(config.requiredModules).toBeDefined();
      expect(config.optionalModules).toBeDefined();
    });

    it("marks fonts as required modules", () => {
      const config = getSplitPointsByLocale("ar");

      expect(config.requiredModules.some(m => m.includes("font"))).toBe(true);
    });

    it("marks calendar as optional module", () => {
      const config = getSplitPointsByLocale("ar");

      expect(config.optionalModules.some(m => m.includes("calendar"))).toBe(true);
    });

    it("identifies lazy-loadable split points", () => {
      const config = getSplitPointsByLocale("ar");

      const lazyPoints = config.splitPoints.filter(sp => sp.lazyLoadable);
      expect(lazyPoints.length).toBeGreaterThan(0);
    });
  });

  describe("getAllLocaleSplitConfigs", () => {
    it("returns configs for all supported locales", () => {
      const configs = getAllLocaleSplitConfigs();

      expect(configs.ar).toBeDefined();
      expect(configs.he).toBeDefined();
      expect(configs.en).toBeDefined();
    });

    it("each locale has required and optional modules", () => {
      const configs = getAllLocaleSplitConfigs();

      for (const config of Object.values(configs)) {
        expect(config.requiredModules).toBeDefined();
        expect(config.optionalModules).toBeDefined();
        expect(config.splitPoints.length).toBeGreaterThan(0);
      }
    });
  });

  describe("calculateLocaleSplitSavings", () => {
    it("calculates per-visit savings for locale", () => {
      const savings = calculateLocaleSplitSavings(500 * 1024, "ar");

      expect(savings.perVisit).toBeGreaterThan(0);
      expect(savings.averagePerVisit).toBeGreaterThan(0);
      expect(savings.explanation).toContain("ar");
    });

    it("returns explanation string", () => {
      const savings = calculateLocaleSplitSavings(500 * 1024, "he");

      expect(typeof savings.explanation).toBe("string");
      expect(savings.explanation.length).toBeGreaterThan(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Dead Code Detection
  // ---------------------------------------------------------------------------

  describe("detectDeadCode", () => {
    it("detects orphaned modules with no importers", () => {
      const modules = [
        createMockModule({ path: "used.ts", importedBy: ["app.ts"] }),
        createMockModule({ path: "orphan.ts", importedBy: [], dependencies: [] }),
      ];

      const result = detectDeadCode(modules);

      expect(result.deadModules.some(m => m.path === "orphan.ts")).toBe(true);
      expect(result.orphanedExports).toContain("orphan.ts");
    });

    it("detects circular dependencies", () => {
      const modules = [
        createMockModule({ path: "a.ts", dependencies: ["b.ts"] }),
        createMockModule({ path: "b.ts", dependencies: ["c.ts"] }),
        createMockModule({ path: "c.ts", dependencies: ["a.ts"] }),
      ];

      const result = detectDeadCode(modules);

      expect(result.circularDependencies.length).toBeGreaterThan(0);
    });

    it("returns empty results for healthy module tree", () => {
      const modules = [
        createMockModule({ path: "entry.ts", dependencies: ["a.ts"], importedBy: [] }),
        createMockModule({ path: "a.ts", dependencies: [], importedBy: ["entry.ts"] }),
      ];

      const result = detectDeadCode(modules);

      expect(result.deadModules).toEqual([]);
      expect(result.circularDependencies).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  // Import Optimization
  // ---------------------------------------------------------------------------

  describe("getLazyImportCandidates", () => {
    it("identifies chart libraries as lazy candidates", () => {
      const modules = [
        createMockModule({ 
          path: "~/vendor/chart-library.js", 
          size: 200 * 1024,
          importedBy: ["~/pages/Dashboard.tsx"],
          isNodeModule: true,
        }),
      ];

      const candidates = getLazyImportCandidates(modules);

      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates[0].module).toContain("chart");
    });

    it("identifies editor components as lazy candidates", () => {
      const modules = [
        createMockModule({ 
          path: "~/components/RichEditor.tsx", 
          size: 150 * 1024,
          importedBy: ["~/pages/Edit.tsx"],
        }),
      ];

      const candidates = getLazyImportCandidates(modules);

      expect(candidates.some(c => c.module.includes("Editor"))).toBe(true);
    });

    it("skips small modules", () => {
      const modules = [
        createMockModule({ path: "~/vendor/chart.js", size: 5 * 1024 }),
      ];

      const candidates = getLazyImportCandidates(modules);

      expect(candidates.length).toBe(0);
    });

    it("sorts candidates by estimated savings", () => {
      const modules = [
        createMockModule({ path: "~/vendor/small-chart.js", size: 50 * 1024, importedBy: ["a"] }),
        createMockModule({ path: "~/vendor/large-editor.js", size: 300 * 1024, importedBy: ["b"] }),
      ];

      const candidates = getLazyImportCandidates(modules);

      if (candidates.length >= 2) {
        expect(candidates[0].estimatedSavings).toBeGreaterThanOrEqual(candidates[1].estimatedSavings);
      }
    });

    it("assigns high impact to very large modules", () => {
      const modules = [
        createMockModule({ 
          path: "~/vendor/huge-map.js", 
          size: 500 * 1024,
          importedBy: ["page"],
          isNodeModule: true,
        }),
      ];

      const candidates = getLazyImportCandidates(modules);

      expect(candidates[0]?.impact).toBe("high");
    });
  });

  describe("analyzeImportPatterns", () => {
    it("identifies barrel imports", () => {
      const modules = [
        createMockModule({ path: "~/components/index", size: 1024 }),
        createMockModule({ path: "~/utils/index", size: 1024 }),
      ];

      const analysis = analyzeImportPatterns(modules);

      expect(analysis.barrelImports.length).toBe(2);
    });

    it("generates optimization opportunities for large barrel files", () => {
      const modules = [
        createMockModule({ path: "~/components/index", size: 100 * 1024 }),
      ];

      const analysis = analyzeImportPatterns(modules);

      expect(analysis.optimizationOpportunities.length).toBeGreaterThan(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Savings Estimation
  // ---------------------------------------------------------------------------

  describe("estimateSavings", () => {
    it("calculates potential savings from analysis", () => {
      const analysis: BundleAnalysis = {
        totalSize: 1024 * 1024,
        compressedSize: 256 * 1024,
        moduleCount: 100,
        largeModules: [],
        duplicateModules: [
          { path: "dup.ts", size: 50 * 1024, occurrences: 2, totalWasted: 50 * 1024, locations: ["a", "b"] },
        ],
        unusedExports: [],
        optimizationRecommendations: [
          { type: "split", priority: "high", module: "large.ts", description: "", estimatedSavings: 100 * 1024, action: "" },
        ],
        score: 80,
      };

      const savings = estimateSavings(analysis);

      expect(savings.original).toBe(1024 * 1024);
      expect(savings.compressed.gzip).toBeGreaterThan(0);
      expect(savings.compressed.brotli).toBeGreaterThan(0);
      expect(savings.potentialSavings.gzip).toBeGreaterThan(0);
      expect(savings.potentialSavings.brotli).toBeGreaterThan(0);
    });

    it("caps savings at compressed size", () => {
      const analysis: BundleAnalysis = {
        totalSize: 100 * 1024,
        compressedSize: 25 * 1024,
        moduleCount: 10,
        largeModules: [],
        duplicateModules: [],
        unusedExports: [],
        optimizationRecommendations: [
          { type: "split", priority: "high", module: "huge.ts", description: "", estimatedSavings: 500 * 1024, action: "" },
        ],
        score: 50,
      };

      const savings = estimateSavings(analysis);

      expect(savings.potentialSavings.gzip).toBeLessThanOrEqual(savings.compressed.gzip);
      expect(savings.potentialSavings.brotli).toBeLessThanOrEqual(savings.compressed.brotli);
    });
  });

  describe("estimateSavingsByType", () => {
    it("sums savings for specific recommendation type", () => {
      const analysis: BundleAnalysis = {
        totalSize: 1024 * 1024,
        compressedSize: 256 * 1024,
        moduleCount: 100,
        largeModules: [],
        duplicateModules: [],
        unusedExports: [],
        optimizationRecommendations: [
          { type: "lazy", priority: "high", module: "a.ts", description: "", estimatedSavings: 100 * 1024, action: "" },
          { type: "lazy", priority: "high", module: "b.ts", description: "", estimatedSavings: 50 * 1024, action: "" },
          { type: "split", priority: "high", module: "c.ts", description: "", estimatedSavings: 200 * 1024, action: "" },
        ],
        score: 80,
      };

      const lazySavings = estimateSavingsByType(analysis, "lazy");
      expect(lazySavings).toBe(150 * 1024);
    });

    it("returns 0 when no recommendations of type exist", () => {
      const analysis: BundleAnalysis = {
        totalSize: 1024 * 1024,
        compressedSize: 256 * 1024,
        moduleCount: 100,
        largeModules: [],
        duplicateModules: [],
        unusedExports: [],
        optimizationRecommendations: [],
        score: 80,
      };

      const savings = estimateSavingsByType(analysis, "lazy");
      expect(savings).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Utilities
  // ---------------------------------------------------------------------------

  describe("formatBytes", () => {
    it("formats bytes correctly", () => {
      expect(formatBytes(0)).toBe("0 B");
      expect(formatBytes(1024)).toBe("1 KB");
      expect(formatBytes(1024 * 1024)).toBe("1 MB");
    });

    it("respects decimal places parameter", () => {
      expect(formatBytes(1536, 0)).toBe("2 KB");
      expect(formatBytes(1536, 2)).toBe("1.50 KB");
    });

    it("handles large values", () => {
      expect(formatBytes(1024 * 1024 * 1024)).toBe("1 GB");
    });
  });

  describe("calculateReduction", () => {
    it("calculates percentage reduction", () => {
      expect(calculateReduction(100, 75)).toBe(25);
      expect(calculateReduction(100, 50)).toBe(50);
      expect(calculateReduction(100, 100)).toBe(0);
    });

    it("returns 0 for zero original", () => {
      expect(calculateReduction(0, 0)).toBe(0);
    });
  });

  describe("generateBundleReport", () => {
    it("generates markdown report", () => {
      const analysis = analyzeBundleSize(createMockBundleStats());
      const report = generateBundleReport(analysis);

      expect(report).toContain("# Bundle Analysis Report");
      expect(report).toContain("Score:");
      expect(report).toContain("Summary");
    });

    it("includes recommendations in report", () => {
      const stats = createMockBundleStats({
        modules: [createMockModule({ path: "huge.ts", size: 200 * 1024 })],
      });
      const analysis = analyzeBundleSize(stats);
      const report = generateBundleReport(analysis);

      expect(report).toContain("Recommendations");
    });
  });

  describe("validateBundleBudget", () => {
    it("validates bundle within budget", () => {
      const stats = createMockBundleStats({ totalSize: 500 * 1024 });
      const result = validateBundleBudget(stats, { maxSize: 1024 * 1024 });

      expect(result.valid).toBe(true);
      expect(result.violations).toEqual([]);
    });

    it("fails when exceeding size budget", () => {
      const stats = createMockBundleStats({ totalSize: 2 * 1024 * 1024 });
      const result = validateBundleBudget(stats, { maxSize: 1024 * 1024 });

      expect(result.valid).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.violations[0]).toContain("exceeds budget");
    });

    it("validates chunk count budget", () => {
      const stats = createMockBundleStats({
        chunks: [
          { name: "a", size: 1024, modules: [], isLazy: false },
          { name: "b", size: 1024, modules: [], isLazy: false },
          { name: "c", size: 1024, modules: [], isLazy: false },
        ],
      });
      const result = validateBundleBudget(stats, { maxSize: 10 * 1024 * 1024, maxChunks: 2 });

      expect(result.valid).toBe(false);
      expect(result.violations.some(v => v.includes("Chunk count"))).toBe(true);
    });

    it("warns about oversized chunks", () => {
      const stats = createMockBundleStats({
        chunks: [
          { name: "huge", size: 1024 * 1024, modules: [], isLazy: false },
        ],
      });
      const result = validateBundleBudget(stats, { maxSize: 10 * 1024 * 1024 });

      expect(result.violations.some(v => v.includes("exceeds warning threshold"))).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------------

  describe("constants", () => {
    it("exports size thresholds", () => {
      expect(SIZE_THRESHOLDS.LARGE_MODULE).toBe(50 * 1024);
      expect(SIZE_THRESHOLDS.VERY_LARGE_MODULE).toBe(100 * 1024);
      expect(SIZE_THRESHOLDS.CHUNK_WARNING).toBe(500 * 1024);
    });

    it("exports compression ratios", () => {
      expect(COMPRESSION_RATIOS.gzip).toBe(0.3);
      expect(COMPRESSION_RATIOS.brotli).toBe(0.25);
    });
  });
});
