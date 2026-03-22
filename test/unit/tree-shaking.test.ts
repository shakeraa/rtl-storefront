import { describe, expect, it } from "vitest";
import {
  analyzeExports,
  isTreeShakable,
  findSideEffects,
  optimizeBarrelFile,
  detectUnusedExports,
  generateTreeShakingReport,
  getTreeShakingRecommendations,
  analyzeImportPatterns,
  type ModuleInfo,
  type ReExportInfo,
} from "../../app/services/performance/tree-shaking";

describe("Tree Shaking Analysis", () => {
  describe("analyzeExports", () => {
    it("detects named function exports", () => {
      const code = `
export function calculateTotal(price: number, quantity: number): number {
  return price * quantity;
}
`;
      const result = analyzeExports(code, "test.ts");
      
      expect(result.exports).toHaveLength(1);
      expect(result.exports[0].name).toBe("calculateTotal");
      expect(result.exports[0].type).toBe("function");
      expect(result.exports[0].isPure).toBe(false);
    });

    it("detects const variable exports", () => {
      const code = `
export const MAX_ITEMS = 100;
export const DEFAULT_CONFIG = { timeout: 5000 };
`;
      const result = analyzeExports(code, "test.ts");
      
      expect(result.exports).toHaveLength(2);
      expect(result.exports[0].name).toBe("MAX_ITEMS");
      expect(result.exports[1].name).toBe("DEFAULT_CONFIG");
    });

    it("detects class exports", () => {
      const code = `
export class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }
}
`;
      const result = analyzeExports(code, "test.ts");
      
      expect(result.exports).toHaveLength(1);
      expect(result.exports[0].name).toBe("Calculator");
      expect(result.exports[0].type).toBe("class");
    });

    it("detects type and interface exports", () => {
      const code = `
export type UserId = string;
export interface User {
  id: UserId;
  name: string;
}
`;
      const result = analyzeExports(code, "test.ts");
      
      expect(result.exports).toHaveLength(2);
      expect(result.exports[0].type).toBe("type");
      expect(result.exports[1].type).toBe("interface");
    });

    it("detects named export blocks", () => {
      const code = `
const foo = 1;
const bar = 2;
export { foo, bar };
`;
      const result = analyzeExports(code, "test.ts");
      
      expect(result.exports.length).toBeGreaterThanOrEqual(1);
    });

    it("detects re-exports as barrel file pattern", () => {
      const code = `
export * from "./utils";
export * from "./helpers";
`;
      const result = analyzeExports(code, "index.ts");
      
      expect(result.isBarrelFile).toBe(true);
      expect(result.reExports).toHaveLength(2);
      expect(result.reExports[0].isWildcard).toBe(true);
    });

    it("detects named re-exports", () => {
      const code = `
export { helper1, helper2 as h2 } from "./helpers";
`;
      const result = analyzeExports(code, "index.ts");
      
      expect(result.reExports).toHaveLength(1);
      expect(result.reExports[0].isWildcard).toBe(false);
      expect(result.reExports[0].exports).toContain("helper1");
    });

    it("extracts import information", () => {
      const code = `
import { helper } from "./helpers";
import * as utils from "./utils";
import defaultExport from "./default";
`;
      const result = analyzeExports(code, "test.ts");
      
      expect(result.imports.length).toBeGreaterThanOrEqual(2);
    });

    it("captures export location information", () => {
      const code = `export const test = 1;`;
      const result = analyzeExports(code, "test.ts");
      
      expect(result.exports[0].location.line).toBe(1);
      expect(result.exports[0].location.column).toBeGreaterThan(0);
    });
  });

  describe("isTreeShakable", () => {
    it("reports module as tree-shakable when no issues exist", () => {
      const module: ModuleInfo = {
        path: "pure.ts",
        exports: [
          { name: "add", type: "function", hasSideEffects: false, isPure: true, isUsed: true, dependencies: [], location: { line: 1, column: 1 } },
        ],
        hasSideEffects: false,
        sideEffects: [],
        isBarrelFile: false,
        reExports: [],
        imports: [],
      };
      
      const result = isTreeShakable(module);
      
      expect(result.isTreeShakable).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it("reports module as non-tree-shakable when side effects exist", () => {
      const module: ModuleInfo = {
        path: "side-effect.ts",
        exports: [
          { name: "init", type: "function", hasSideEffects: true, isPure: false, isUsed: true, dependencies: [], location: { line: 1, column: 1 } },
        ],
        hasSideEffects: true,
        sideEffects: ["Line 5: window.foo = 'bar'"],
        isBarrelFile: false,
        reExports: [],
        imports: [],
      };
      
      const result = isTreeShakable(module);
      
      expect(result.isTreeShakable).toBe(false);
      expect(result.issues.some(i => i.toLowerCase().includes("side effect"))).toBe(true);
      expect(result.recommendations.some(r => r.includes("isolating side effects"))).toBe(true);
    });

    it("identifies unused exports as an issue", () => {
      const module: ModuleInfo = {
        path: "unused.ts",
        exports: [
          { name: "used", type: "function", hasSideEffects: false, isPure: true, isUsed: true, dependencies: [], location: { line: 1, column: 1 } },
          { name: "unused", type: "function", hasSideEffects: false, isPure: true, isUsed: false, dependencies: [], location: { line: 5, column: 1 } },
        ],
        hasSideEffects: false,
        sideEffects: [],
        isBarrelFile: false,
        reExports: [],
        imports: [],
      };
      
      const result = isTreeShakable(module);
      
      expect(result.unusedExports).toHaveLength(1);
      expect(result.unusedExports[0].name).toBe("unused");
    });

    it("warns about large barrel files", () => {
      const module: ModuleInfo = {
        path: "barrel.ts",
        exports: [],
        hasSideEffects: false,
        sideEffects: [],
        isBarrelFile: true,
        reExports: Array(6).fill(null).map((_, i) => ({ source: `./module${i}`, exports: [], isWildcard: true })),
        imports: [],
      };
      
      const result = isTreeShakable(module);
      
      expect(result.issues.some(i => i.includes("barrel"))).toBe(true);
    });

    it("suggests adding sideEffects field to package.json", () => {
      const module: ModuleInfo = {
        path: "pure-module.ts",
        exports: [{ name: "foo", type: "function", hasSideEffects: false, isPure: true, isUsed: true, dependencies: [], location: { line: 1, column: 1 } }],
        hasSideEffects: false,
        sideEffects: [],
        isBarrelFile: false,
        reExports: [],
        imports: [],
      };
      
      const result = isTreeShakable(module);
      
      expect(result.recommendations.some(r => r.includes("sideEffects: false"))).toBe(true);
    });
  });

  describe("findSideEffects", () => {
    it("detects global mutations as critical side effects", () => {
      const modules: ModuleInfo[] = [
        {
          path: "global-mutate.ts",
          exports: [],
          hasSideEffects: true,
          sideEffects: ["Line 1: window.globalVar = 'value'"],
          isBarrelFile: false,
          reExports: [],
          imports: [],
        },
      ];
      
      const results = findSideEffects(modules);
      const detection = results.get("global-mutate.ts")!;
      
      expect(detection.hasSideEffects).toBe(true);
      expect(detection.severity).toBe("critical");
    });

    it("detects network calls as high severity side effects", () => {
      const modules: ModuleInfo[] = [
        {
          path: "network.ts",
          exports: [],
          hasSideEffects: true,
          sideEffects: ["Line 3: fetch('/api/config')"],
          isBarrelFile: false,
          reExports: [],
          imports: [],
        },
      ];
      
      const results = findSideEffects(modules);
      const detection = results.get("network.ts")!;
      
      expect(detection.severity).toBe("high");
    });

    it("detects DOM manipulation as medium severity", () => {
      const modules: ModuleInfo[] = [
        {
          path: "dom.ts",
          exports: [],
          hasSideEffects: true,
          sideEffects: ["Line 2: document.write('content')"],
          isBarrelFile: false,
          reExports: [],
          imports: [],
        },
      ];
      
      const results = findSideEffects(modules);
      const detection = results.get("dom.ts")!;
      
      expect(detection.severity).toBe("medium");
    });

    it("tracks multiple side effect locations", () => {
      const modules: ModuleInfo[] = [
        {
          path: "multi-side-effects.ts",
          exports: [],
          hasSideEffects: true,
          sideEffects: [
            "Line 1: console.log('init')",
            "Line 5: setTimeout(fn, 1000)",
            "Line 10: localStorage.setItem('key', 'value')",
          ],
          isBarrelFile: false,
          reExports: [],
          imports: [],
        },
      ];
      
      const results = findSideEffects(modules);
      const detection = results.get("multi-side-effects.ts")!;
      
      expect(detection.locations).toHaveLength(3);
    });

    it("returns low severity for modules without side effects", () => {
      const modules: ModuleInfo[] = [
        {
          path: "pure.ts",
          exports: [],
          hasSideEffects: false,
          sideEffects: [],
          isBarrelFile: false,
          reExports: [],
          imports: [],
        },
      ];
      
      const results = findSideEffects(modules);
      const detection = results.get("pure.ts")!;
      
      expect(detection.hasSideEffects).toBe(false);
      expect(detection.severity).toBe("low");
    });
  });

  describe("optimizeBarrelFile", () => {
    it("flags wildcard exports as preventing tree-shaking", () => {
      const exports: ReExportInfo[] = [
        { source: "./utils", exports: [], isWildcard: true },
      ];
      
      const result = optimizeBarrelFile(exports);
      
      expect(result.isOptimized).toBe(false);
      expect(result.issues.some(i => i.includes("Wildcard"))).toBe(true);
    });

    it("detects deep re-exports as problematic", () => {
      const exports: ReExportInfo[] = [
        { source: "./deep/nested/index", exports: ["a", "b"], isWildcard: false },
      ];
      
      const result = optimizeBarrelFile(exports);
      
      expect(result.deepReExports).toContain("./deep/nested/index");
      expect(result.issues.some(i => i.includes("Deep re-export"))).toBe(true);
    });

    it("identifies potential circular dependencies", () => {
      const exports: ReExportInfo[] = [
        { source: "./moduleA", exports: ["foo"], isWildcard: false },
        { source: "./moduleA", exports: ["bar"], isWildcard: false },
      ];
      
      const result = optimizeBarrelFile(exports);
      
      expect(result.circularDependencies).toContain("./moduleA");
    });

    it("reports optimized status when no issues found", () => {
      const exports: ReExportInfo[] = [
        { source: "./utils", exports: ["helper"], isWildcard: false },
      ];
      
      const result = optimizeBarrelFile(exports);
      
      expect(result.isOptimized).toBe(true);
    });

    it("provides size comparison metrics", () => {
      const exports: ReExportInfo[] = [
        { source: "./utils", exports: [], isWildcard: true },
        { source: "./helpers", exports: ["a", "b", "c"], isWildcard: false },
      ];
      
      const result = optimizeBarrelFile(exports);
      
      expect(result.size.current).toBeGreaterThan(result.size.potential);
    });

    it("recommends splitting large export lists", () => {
      const exports: ReExportInfo[] = [
        { source: "./huge-module", exports: Array(15).fill("item"), isWildcard: false },
      ];
      
      const result = optimizeBarrelFile(exports);
      
      expect(result.recommendations.some(r => r.includes("splitting"))).toBe(true);
    });
  });

  describe("detectUnusedExports", () => {
    it("identifies exports not present in usage data", () => {
      const usage = new Map([["module.ts", ["usedExport"]]]);
      const modules: ModuleInfo[] = [
        {
          path: "module.ts",
          exports: [
            { name: "usedExport", type: "function", hasSideEffects: false, isPure: true, isUsed: false, dependencies: [], location: { line: 1, column: 1 } },
            { name: "unusedExport", type: "function", hasSideEffects: false, isPure: true, isUsed: false, dependencies: [], location: { line: 5, column: 1 } },
          ],
          hasSideEffects: false,
          sideEffects: [],
          isBarrelFile: false,
          reExports: [],
          imports: [],
        },
      ];
      
      const results = detectUnusedExports(usage, modules);
      const report = results.get("module.ts")!;
      
      expect(report.unusedExports).toHaveLength(1);
      expect(report.unusedExports[0].name).toBe("unusedExport");
    });

    it("calculates usage rate correctly", () => {
      const usage = new Map([["module.ts", ["a", "b"]]]);
      const modules: ModuleInfo[] = [
        {
          path: "module.ts",
          exports: [
            { name: "a", type: "function", hasSideEffects: false, isPure: true, isUsed: false, dependencies: [], location: { line: 1, column: 1 } },
            { name: "b", type: "function", hasSideEffects: false, isPure: true, isUsed: false, dependencies: [], location: { line: 2, column: 1 } },
            { name: "c", type: "function", hasSideEffects: false, isPure: true, isUsed: false, dependencies: [], location: { line: 3, column: 1 } },
            { name: "d", type: "function", hasSideEffects: false, isPure: true, isUsed: false, dependencies: [], location: { line: 4, column: 1 } },
          ],
          hasSideEffects: false,
          sideEffects: [],
          isBarrelFile: false,
          reExports: [],
          imports: [],
        },
      ];
      
      const results = detectUnusedExports(usage, modules);
      const report = results.get("module.ts")!;
      
      expect(report.totalExports).toBe(4);
      expect(report.unusedCount).toBe(2);
      expect(report.usageRate).toBe(0.5);
    });

    it("includes location information for unused exports", () => {
      const usage = new Map<string, string[]>([]);
      const modules: ModuleInfo[] = [
        {
          path: "module.ts",
          exports: [
            { name: "unused", type: "function", hasSideEffects: false, isPure: true, isUsed: false, dependencies: [], location: { line: 10, column: 5 } },
          ],
          hasSideEffects: false,
          sideEffects: [],
          isBarrelFile: false,
          reExports: [],
          imports: [],
        },
      ];
      
      const results = detectUnusedExports(usage, modules);
      const report = results.get("module.ts")!;
      
      expect(report.unusedExports[0].location).toBe("module.ts:10:5");
    });

    it("handles empty usage data", () => {
      const usage = new Map<string, string[]>();
      const modules: ModuleInfo[] = [
        {
          path: "module.ts",
          exports: [
            { name: "export1", type: "function", hasSideEffects: false, isPure: true, isUsed: false, dependencies: [], location: { line: 1, column: 1 } },
          ],
          hasSideEffects: false,
          sideEffects: [],
          isBarrelFile: false,
          reExports: [],
          imports: [],
        },
      ];
      
      const results = detectUnusedExports(usage, modules);
      const report = results.get("module.ts")!;
      
      expect(report.unusedCount).toBe(1);
      expect(report.usageRate).toBe(0);
    });
  });

  describe("generateTreeShakingReport", () => {
    it("generates summary statistics", () => {
      const modules: ModuleInfo[] = [
        {
          path: "pure.ts",
          exports: [{ name: "foo", type: "function", hasSideEffects: false, isPure: true, isUsed: true, dependencies: [], location: { line: 1, column: 1 } }],
          hasSideEffects: false,
          sideEffects: [],
          isBarrelFile: false,
          reExports: [],
          imports: [],
        },
        {
          path: "barrel.ts",
          exports: [],
          hasSideEffects: false,
          sideEffects: [],
          isBarrelFile: true,
          reExports: [{ source: "./utils", exports: [], isWildcard: true }],
          imports: [],
        },
      ];
      
      const report = generateTreeShakingReport(modules);
      
      expect(report.summary.totalModules).toBe(2);
      expect(report.summary.barrelFiles).toBe(1);
      expect(report.summary.totalExports).toBe(1);
    });

    it("includes side effect report for all modules", () => {
      const modules: ModuleInfo[] = [
        {
          path: "module.ts",
          exports: [],
          hasSideEffects: true,
          sideEffects: ["Line 1: console.log('test')"],
          isBarrelFile: false,
          reExports: [],
          imports: [],
        },
      ];
      
      const report = generateTreeShakingReport(modules);
      
      expect(report.sideEffectReport.has("module.ts")).toBe(true);
    });

    it("includes barrel file optimizations", () => {
      const modules: ModuleInfo[] = [
        {
          path: "barrel.ts",
          exports: [],
          hasSideEffects: false,
          sideEffects: [],
          isBarrelFile: true,
          reExports: [{ source: "./utils", exports: [], isWildcard: true }],
          imports: [],
        },
      ];
      
      const report = generateTreeShakingReport(modules);
      
      expect(report.barrelFileOptimizations.has("barrel.ts")).toBe(true);
    });
  });

  describe("getTreeShakingRecommendations", () => {
    it("recommends addressing side effects when present", () => {
      const report = generateTreeShakingReport([
        {
          path: "side-effect.ts",
          exports: [],
          hasSideEffects: true,
          sideEffects: ["Line 1: window.foo = 'bar'"],
          isBarrelFile: false,
          reExports: [],
          imports: [],
        },
      ]);
      
      const recommendations = getTreeShakingRecommendations(report);
      
      expect(recommendations.some(r => r.includes("side effects"))).toBe(true);
    });

    it("recommends removing unused exports when threshold exceeded", () => {
      const usage = new Map<string, string[]>();
      const modules: ModuleInfo[] = [
        {
          path: "module.ts",
          exports: Array(10).fill(null).map((_, i) => ({
            name: `export${i}`,
            type: "function" as const,
            hasSideEffects: false,
            isPure: true,
            isUsed: false,
            dependencies: [],
            location: { line: i + 1, column: 1 },
          })),
          hasSideEffects: false,
          sideEffects: [],
          isBarrelFile: false,
          reExports: [],
          imports: [],
        },
      ];
      
      const report = generateTreeShakingReport(modules, usage);
      const recommendations = getTreeShakingRecommendations(report);
      
      expect(recommendations.some(r => r.includes("unused exports"))).toBe(true);
    });

    it("includes best practice recommendations", () => {
      const report = generateTreeShakingReport([]);
      
      const recommendations = getTreeShakingRecommendations(report);
      
      expect(recommendations.some(r => r.includes("sideEffects: false"))).toBe(true);
      expect(recommendations.some(r => r.includes("PURE"))).toBe(true);
    });
  });

  describe("analyzeImportPatterns", () => {
    it("identifies deep imports from barrel files", () => {
      const modules: ModuleInfo[] = [
        {
          path: "consumer.ts",
          exports: [],
          hasSideEffects: false,
          sideEffects: [],
          isBarrelFile: false,
          reExports: [],
          imports: [
            { source: "./deep/nested/index", names: ["helper"], isDefault: false, isNamespace: false },
          ],
        },
      ];
      
      const result = analyzeImportPatterns(modules);
      
      expect(result.deepImports).toHaveLength(1);
      expect(result.suboptimalImports[0].suggestion).toContain("directly");
    });

    it("flags namespace imports as suboptimal", () => {
      const modules: ModuleInfo[] = [
        {
          path: "consumer.ts",
          exports: [],
          hasSideEffects: false,
          sideEffects: [],
          isBarrelFile: false,
          reExports: [],
          imports: [
            { source: "./utils", names: [], isDefault: false, isNamespace: true },
          ],
        },
      ];
      
      const result = analyzeImportPatterns(modules);
      
      expect(result.wildcardImports).toHaveLength(1);
      expect(result.suboptimalImports[0].suggestion).toContain("named imports");
    });

    it("warns about importing many items from same source", () => {
      const modules: ModuleInfo[] = [
        {
          path: "consumer.ts",
          exports: [],
          hasSideEffects: false,
          sideEffects: [],
          isBarrelFile: false,
          reExports: [],
          imports: [
            { source: "./huge-module", names: Array(15).fill("item"), isDefault: false, isNamespace: false },
          ],
        },
      ];
      
      const result = analyzeImportPatterns(modules);
      
      expect(result.suboptimalImports.some(i => i.suggestion.includes("splitting"))).toBe(true);
    });
  });

  describe("side effect detection in code", () => {
    it("detects console.log as side effect", () => {
      const code = `console.log('debug message');`;
      const result = analyzeExports(code, "test.ts");
      
      expect(result.hasSideEffects).toBe(true);
    });

    it("detects timer functions as side effects", () => {
      const code = `setTimeout(() => {}, 1000);`;
      const result = analyzeExports(code, "test.ts");
      
      expect(result.hasSideEffects).toBe(true);
    });

    it("detects localStorage access as side effect", () => {
      const code = `localStorage.setItem('key', 'value');`;
      const result = analyzeExports(code, "test.ts");
      
      expect(result.hasSideEffects).toBe(true);
    });

    it("detects fetch calls as side effects", () => {
      const code = `fetch('/api/data');`;
      const result = analyzeExports(code, "test.ts");
      
      expect(result.hasSideEffects).toBe(true);
    });
  });
});
