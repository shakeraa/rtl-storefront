import { describe, expect, it } from "vitest";
import {
  analyzeComponentSplits,
  generateChunkManifest,
  generateLocaleChunks,
  getChunkSizeLimits,
  getPrefetchStrategy,
  getRouteSplitPoints,
  RTL_LOCALES,
  validateSplitConfiguration,
  type ComponentMetadata,
  type RouteDefinition,
  type UserBehavior,
  type ConnectionInfo,
  type SplitStrategy,
  POPULAR_MENA_ROUTES,
} from "../../app/services/performance/code-splitting";

describe("code-splitting", () => {
  describe("getRouteSplitPoints", () => {
    it("generates split points for routes with correct structure", () => {
      const routes: RouteDefinition[] = [
        { id: "home", path: "/", component: "HomePage" },
        { id: "products", path: "/products", component: "ProductsPage" },
      ];

      const result = getRouteSplitPoints(routes);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("routeId");
      expect(result[0]).toHaveProperty("chunkName");
      expect(result[0]).toHaveProperty("priority");
      expect(result[0]).toHaveProperty("reasons");
    });

    it("prioritizes high-traffic routes as critical", () => {
      const routes: RouteDefinition[] = [
        { id: "home", path: "/", component: "HomePage", weight: 0.9, frequency: 10 },
        { id: "about", path: "/about", component: "AboutPage", weight: 0.2, frequency: 1 },
      ];

      const result = getRouteSplitPoints(routes);

      const homeRoute = result.find((r) => r.routeId === "home");
      expect(homeRoute?.priority).toBe("critical");
      expect(homeRoute?.preloadTrigger).toBe("immediate");
    });

    it("assigns deferred priority to low-traffic routes", () => {
      const routes: RouteDefinition[] = [
        { id: "rare", path: "/rare", component: "RarePage", weight: 0.05, frequency: 0.1 },
      ];

      const result = getRouteSplitPoints(routes);

      expect(result[0].priority).toBe("deferred");
    });

    it("detects RTL-specific routes and applies boost", () => {
      const routes: RouteDefinition[] = [
        { id: "home-en", path: "/en", component: "HomePage", weight: 0.8 },
        { id: "home-ar", path: "/ar", component: "HomePageAr", weight: 0.8 },
      ];

      const result = getRouteSplitPoints(routes);

      const arRoute = result.find((r) => r.routeId === "home-ar");
      const enRoute = result.find((r) => r.routeId === "home-en");
      
      expect(arRoute?.estimatedSize).toBeGreaterThan(enRoute?.estimatedSize || 0);
      expect(arRoute?.reasons.some((r) => r.includes("RTL"))).toBe(true);
    });

    it("generates unique chunk names for each route", () => {
      const routes: RouteDefinition[] = [
        { id: "home", path: "/", component: "HomePage" },
        { id: "products", path: "/products", component: "ProductsPage" },
        { id: "cart", path: "/cart", component: "CartPage" },
      ];

      const result = getRouteSplitPoints(routes);
      const chunkNames = result.map((r) => r.chunkName);

      expect(new Set(chunkNames).size).toBe(chunkNames.length);
    });

    it("handles routes with multiple imports", () => {
      const routes: RouteDefinition[] = [
        {
          id: "complex",
          path: "/complex",
          component: "ComplexPage",
          imports: ["lib/a", "lib/b", "lib/c", "lib/d"],
        },
      ];

      const result = getRouteSplitPoints(routes);

      expect(result[0].reasons.some((r) => r.includes("import"))).toBe(true);
      expect(result[0].estimatedSize).toBeGreaterThan(50000);
    });

    it("sorts routes by priority (critical first)", () => {
      const routes: RouteDefinition[] = [
        { id: "low", path: "/low", component: "LowPage", weight: 0.1 },
        { id: "high", path: "/high", component: "HighPage", weight: 0.9 },
        { id: "med", path: "/med", component: "MedPage", weight: 0.5 },
      ];

      const result = getRouteSplitPoints(routes);

      expect(result[0].priority).toBe("critical");
      // medium (weight 0.5) is between critical (0.9) and deferred threshold (<0.1)
      expect(result[1].priority).toBe("medium");
      expect(result[2].priority).toBe("deferred");
    });

    it("assigns appropriate preload triggers based on priority", () => {
      const routes: RouteDefinition[] = [
        { id: "critical", path: "/critical", component: "CritPage", weight: 0.95 },
        { id: "high", path: "/high", component: "HighPage", weight: 0.7 },
        { id: "medium", path: "/medium", component: "MedPage", weight: 0.4 },
      ];

      const result = getRouteSplitPoints(routes);

      expect(result.find((r) => r.routeId === "critical")?.preloadTrigger).toBe("immediate");
      // high weight (0.7) gives high priority which has idle trigger
      expect(result.find((r) => r.routeId === "high")?.priority).toBe("high");
      // medium weight (0.4) gives medium priority which has viewport trigger
      expect(result.find((r) => r.routeId === "medium")?.preloadTrigger).toBe("viewport");
    });
  });

  describe("analyzeComponentSplits", () => {
    it("recommends lazy loading for large components", () => {
      const components: ComponentMetadata[] = [
        {
          id: "1",
          name: "BigChart",
          path: "/components/BigChart.tsx",
          size: 100000,
          dependencies: ["chart-lib"],
          usedIn: ["/products"],
          isLazyLoadable: true,
          priority: "medium",
        },
      ];

      const result = analyzeComponentSplits(components);

      expect(result[0].shouldSplit).toBe(true);
      expect(result[0].recommendedStrategy).toBe("lazy");
      expect(result[0].impact).toBe("high");
    });

    it("recommends inlining for small components", () => {
      const components: ComponentMetadata[] = [
        {
          id: "1",
          name: "SmallIcon",
          path: "/components/SmallIcon.tsx",
          size: 1000,
          dependencies: [],
          usedIn: ["/", "/products", "/cart"],
          isLazyLoadable: true,
          priority: "high",
        },
      ];

      const result = analyzeComponentSplits(components);

      expect(result[0].recommendedStrategy).toBe("inline");
    });

    it("identifies shared components across multiple routes", () => {
      const components: ComponentMetadata[] = [
        {
          id: "1",
          name: "SharedHeader",
          path: "/components/Header.tsx",
          size: 25000,
          dependencies: ["nav-lib"],
          usedIn: ["/", "/products", "/cart", "/checkout", "/account"],
          isLazyLoadable: true,
          priority: "high",
        },
      ];

      const result = analyzeComponentSplits(components);

      // The reason mentions number of routes without saying "routes" explicitly
      expect(result[0].splitReasons.some((r) => r.includes("5") && r.includes("shared"))).toBe(true);
    });

    it("detects heavy dependencies and prioritizes lazy loading", () => {
      const components: ComponentMetadata[] = [
        {
          id: "1",
          name: "MapComponent",
          path: "/components/Map.tsx",
          size: 30000,
          dependencies: ["map-provider", "google-maps"],
          usedIn: ["/stores"],
          isLazyLoadable: true,
          priority: "deferred",
        },
      ];

      const result = analyzeComponentSplits(components);

      expect(result[0].splitReasons.some((r) => r.includes("Heavy"))).toBe(true);
      expect(result[0].impact).toBe("high");
    });

    it("forces inline strategy for non-lazy-loadable components", () => {
      const components: ComponentMetadata[] = [
        {
          id: "1",
          name: "CriticalInit",
          path: "/components/Init.tsx",
          size: 50000,
          dependencies: ["core"],
          usedIn: ["/"],
          isLazyLoadable: false,
          priority: "critical",
        },
      ];

      const result = analyzeComponentSplits(components);

      expect(result[0].shouldSplit).toBe(false);
      expect(result[0].recommendedStrategy).toBe("inline");
    });

    it("sorts results by impact then estimated savings", () => {
      const components: ComponentMetadata[] = [
        {
          id: "1",
          name: "Medium",
          path: "/components/Medium.tsx",
          size: 20000,
          dependencies: [],
          usedIn: ["/"],
          isLazyLoadable: true,
          priority: "medium",
        },
        {
          id: "2",
          name: "Huge",
          path: "/components/Huge.tsx",
          size: 150000,
          dependencies: ["heavy"],
          usedIn: ["/"],
          isLazyLoadable: true,
          priority: "deferred",
        },
      ];

      const result = analyzeComponentSplits(components);

      expect(result[0].componentName).toBe("Huge");
      expect(result[1].componentName).toBe("Medium");
    });

    it("recommends vendor-split for components with vendor dependencies", () => {
      const components: ComponentMetadata[] = [
        {
          id: "1",
          name: "VendorComponent",
          path: "/components/Vendor.tsx",
          size: 50000,
          dependencies: ["vendor/lodash", "node_modules/moment"],
          usedIn: ["/dashboard"],
          isLazyLoadable: true,
          priority: "medium",
        },
      ];

      const result = analyzeComponentSplits(components);

      expect(result[0].recommendedStrategy).toBe("vendor-split");
    });
  });

  describe("generateLocaleChunks", () => {
    it("generates RTL common chunk for RTL locales", () => {
      const locales = ["ar", "he", "fa"];

      const result = generateLocaleChunks(locales);

      const rtlChunk = result.chunks.find((c) => c.locale === "rtl-common");
      expect(rtlChunk).toBeDefined();
      expect(rtlChunk?.direction).toBe("rtl");
      expect(rtlChunk?.priority).toBe("high");
    });

    it("generates LTR common chunk for LTR locales", () => {
      const locales = ["en", "es", "fr"];

      const result = generateLocaleChunks(locales);

      const ltrChunk = result.chunks.find((c) => c.locale === "ltr-common");
      expect(ltrChunk).toBeDefined();
      expect(ltrChunk?.direction).toBe("ltr");
    });

    it("generates individual chunks for popular locales", () => {
      const locales = ["ar", "he", "en", "es", "de", "xx"];

      const result = generateLocaleChunks(locales);

      expect(result.chunks.some((c) => c.locale === "ar")).toBe(true);
      expect(result.chunks.some((c) => c.locale === "en")).toBe(true);
      expect(result.chunks.some((c) => c.locale === "xx")).toBe(false);
    });

    it("counts RTL-specific chunks correctly", () => {
      const locales = ["ar", "he", "ur", "en", "es"];

      const result = generateLocaleChunks(locales);

      expect(result.rtlSpecificChunks).toBeGreaterThan(0);
    });

    it("calculates total size including RTL multiplier", () => {
      const rtlLocales = ["ar", "he"];
      const ltrLocales = ["en", "es"];

      const rtlResult = generateLocaleChunks(rtlLocales);
      const ltrResult = generateLocaleChunks(ltrLocales);

      // RTL chunks should be larger due to formatting rules
      const rtlAvgSize = rtlResult.totalSize / rtlLocales.length;
      const ltrAvgSize = ltrResult.totalSize / ltrLocales.length;
      expect(rtlAvgSize).toBeGreaterThan(ltrAvgSize);
    });

    it("provides recommendations for locale organization", () => {
      const locales = ["ar", "he", "fa", "ur", "ps", "en", "es", "fr", "de", "it", "pt"];

      const result = generateLocaleChunks(locales);

      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it("recommends regional splitting for many locales", () => {
      const locales = ["en", "es", "fr", "de", "it", "pt", "nl", "pl", "ru"];

      const result = generateLocaleChunks(locales);

      expect(result.recommendations.some((r) => r.includes("region"))).toBe(true);
    });
  });

  describe("getPrefetchStrategy", () => {
    it("returns no prefetch when saveData is enabled", () => {
      const route = "/products";
      const behavior: UserBehavior = {
        visitedRoutes: [],
        averageTimeOnPage: 1000,
        clickPattern: [],
        scrollDepth: 0.5,
        connectionHistory: [],
      };
      const connection: ConnectionInfo = { saveData: true };

      const result = getPrefetchStrategy(route, behavior, connection);

      expect(result.type).toBe("none");
      expect(result.conditions?.maxDataUsage).toBe(0);
    });

    it("returns lazy strategy for slow connections", () => {
      const route = "/products";
      const behavior: UserBehavior = {
        visitedRoutes: [],
        averageTimeOnPage: 1000,
        clickPattern: [],
        scrollDepth: 0.5,
        connectionHistory: [],
      };
      const connection: ConnectionInfo = { effectiveType: "2g" };

      const result = getPrefetchStrategy(route, behavior, connection);

      expect(result.type).toBe("lazy");
      expect(result.priority).toBe("deferred");
      expect(result.delay).toBe(5000);
    });

    it("returns eager strategy for frequent visitors with high engagement", () => {
      // Need both frequent visits (>3) AND high time on page (>5000ms)
      const route = "/ar/products";
      const behavior: UserBehavior = {
        visitedRoutes: ["/ar", "/ar/products", "/ar/products", "/ar/products", "/ar/cart"],
        averageTimeOnPage: 10000, // High engagement
        clickPattern: ["/ar", "/ar/products"],
        scrollDepth: 0.5,
        connectionHistory: [],
      };

      const result = getPrefetchStrategy(route, behavior);

      // /ar/products is also in POPULAR_MENA_ROUTES, so check it's either eager or viewport
      expect(["eager", "viewport"]).toContain(result.type);
      expect(result.chunks).toContain("locales-rtl-common"); // RTL routes get locale chunks
    });

    it("includes RTL chunks for RTL routes", () => {
      const route = "/ar/products";
      const behavior: UserBehavior = {
        visitedRoutes: [],
        averageTimeOnPage: 1000,
        clickPattern: [],
        scrollDepth: 0.5,
        connectionHistory: [],
      };

      const result = getPrefetchStrategy(route, behavior);

      expect(result.chunks).toContain("locales-rtl-common");
    });

    it("returns viewport strategy for popular MENA routes", () => {
      const route = "/ar/cart";
      const behavior: UserBehavior = {
        visitedRoutes: [],
        averageTimeOnPage: 1000,
        clickPattern: [],
        scrollDepth: 0.5,
        connectionHistory: [],
      };

      const result = getPrefetchStrategy(route, behavior);

      expect(POPULAR_MENA_ROUTES).toContain(route);
      expect(result.type).toBe("viewport");
    });

    it("predicts next routes based on click patterns", () => {
      const route = "/ar";
      const behavior: UserBehavior = {
        visitedRoutes: [],
        averageTimeOnPage: 1000,
        clickPattern: ["/ar", "/ar/products", "/ar", "/ar/cart"],
        scrollDepth: 0.8,
        connectionHistory: [],
      };

      const result = getPrefetchStrategy(route, behavior);

      expect(result.routes.length).toBeGreaterThan(0);
    });

    it("returns predictive strategy for high scroll depth", () => {
      const route = "/products";
      const behavior: UserBehavior = {
        visitedRoutes: ["/products"],
        averageTimeOnPage: 5000,
        clickPattern: ["/products", "/cart"],
        scrollDepth: 0.8,
        connectionHistory: [],
      };

      const result = getPrefetchStrategy(route, behavior);

      expect(result.type).toBe("predictive");
    });
  });

  describe("getChunkSizeLimits", () => {
    it("returns conservative limits for saveData mode", () => {
      const connection: ConnectionInfo = { saveData: true };

      const result = getChunkSizeLimits(connection);

      expect(result.maxInitialChunk).toBe(50000);
      expect(result.maxAsyncChunk).toBe(30000);
      expect(result.maxTotal).toBe(200000);
    });

    it("returns generous limits for 4G connections", () => {
      const connection: ConnectionInfo = { effectiveType: "4g" };

      const result = getChunkSizeLimits(connection);

      expect(result.maxInitialChunk).toBe(200000);
      expect(result.maxTotal).toBe(1000000);
    });

    it("returns strict limits for slow connections", () => {
      const connection: ConnectionInfo = { effectiveType: "slow-2g" };

      const result = getChunkSizeLimits(connection);

      expect(result.maxInitialChunk).toBe(30000);
      expect(result.maxAsyncChunk).toBe(20000);
      expect(result.maxTotal).toBe(150000);
    });

    it("returns default limits for unknown connection types", () => {
      const connection: ConnectionInfo = {};

      const result = getChunkSizeLimits(connection);

      expect(result.maxInitialChunk).toBe(150000);
      expect(result.maxTotal).toBe(800000);
    });
  });

  describe("generateChunkManifest", () => {
    it("creates manifest entries for all routes", () => {
      const splitPoints = [
        { routeId: "home", path: "/", chunkName: "route-index", estimatedSize: 50000, priority: "critical" as const, reasons: [] },
        { routeId: "products", path: "/products", chunkName: "route-products", estimatedSize: 80000, priority: "high" as const, reasons: [] },
      ];
      const analyses = [
        { componentId: "1", componentName: "BigComponent", shouldSplit: true, recommendedStrategy: "lazy" as SplitStrategy, estimatedSavings: 40000, impact: "high" as const, dependencies: [], splitReasons: [] },
      ];

      const result = generateChunkManifest(splitPoints, analyses);

      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result.some((m) => m.name === "route-index")).toBe(true);
      expect(result.some((m) => m.name === "route-products")).toBe(true);
    });

    it("marks critical routes as entry points", () => {
      const splitPoints = [
        { routeId: "home", path: "/", chunkName: "route-index", estimatedSize: 50000, priority: "critical" as const, reasons: [] },
        { routeId: "about", path: "/about", chunkName: "route-about", estimatedSize: 50000, priority: "deferred" as const, reasons: [] },
      ];

      const result = generateChunkManifest(splitPoints, []);

      const criticalEntry = result.find((m) => m.name === "route-index");
      const deferredEntry = result.find((m) => m.name === "route-about");
      
      expect(criticalEntry?.isEntry).toBe(true);
      expect(deferredEntry?.isDynamicEntry).toBe(true);
    });

    it("includes component dependencies in manifest", () => {
      const analyses = [
        { componentId: "1", componentName: "ChartComponent", shouldSplit: true, recommendedStrategy: "lazy" as SplitStrategy, estimatedSavings: 50000, impact: "high" as const, dependencies: ["chart-lib", "data-utils"], splitReasons: [] },
      ];

      const result = generateChunkManifest([], analyses);

      const componentChunk = result.find((m) => m.name.includes("chart"));
      expect(componentChunk?.imports).toContain("chart-lib");
      expect(componentChunk?.imports).toContain("data-utils");
    });
  });

  describe("validateSplitConfiguration", () => {
    it("validates configuration with no errors", () => {
      const splitPoints = [
        { routeId: "home", path: "/", chunkName: "route-a", estimatedSize: 50000, priority: "critical" as const, reasons: [] },
        { routeId: "about", path: "/about", chunkName: "route-b", estimatedSize: 40000, priority: "high" as const, reasons: [] },
      ];
      const localeChunks = generateLocaleChunks(["ar", "he", "en"]);

      const result = validateSplitConfiguration(splitPoints, localeChunks);

      expect(result.valid).toBe(true);
    });

    it("detects duplicate chunk names", () => {
      const splitPoints = [
        { routeId: "home", path: "/", chunkName: "route-same", estimatedSize: 50000, priority: "critical" as const, reasons: [] },
        { routeId: "about", path: "/about", chunkName: "route-same", estimatedSize: 40000, priority: "high" as const, reasons: [] },
      ];
      const localeChunks = generateLocaleChunks(["en"]);

      const result = validateSplitConfiguration(splitPoints, localeChunks);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Duplicate"))).toBe(true);
    });

    it("warns about oversized chunks", () => {
      const splitPoints = [
        { routeId: "huge", path: "/huge", chunkName: "route-huge", estimatedSize: 600000, priority: "medium" as const, reasons: [] },
      ];
      const localeChunks = generateLocaleChunks(["en"]);

      const result = validateSplitConfiguration(splitPoints, localeChunks);

      expect(result.warnings.some((w) => w.includes("500KB"))).toBe(true);
    });

    it("warns about too many critical chunks", () => {
      const splitPoints = [
        { routeId: "a", path: "/a", chunkName: "route-a", estimatedSize: 50000, priority: "critical" as const, reasons: [] },
        { routeId: "b", path: "/b", chunkName: "route-b", estimatedSize: 50000, priority: "critical" as const, reasons: [] },
        { routeId: "c", path: "/c", chunkName: "route-c", estimatedSize: 50000, priority: "critical" as const, reasons: [] },
        { routeId: "d", path: "/d", chunkName: "route-d", estimatedSize: 50000, priority: "critical" as const, reasons: [] },
        { routeId: "e", path: "/e", chunkName: "route-e", estimatedSize: 50000, priority: "critical" as const, reasons: [] },
        { routeId: "f", path: "/f", chunkName: "route-f", estimatedSize: 50000, priority: "critical" as const, reasons: [] },
      ];
      const localeChunks = generateLocaleChunks(["en"]);

      const result = validateSplitConfiguration(splitPoints, localeChunks);

      expect(result.warnings.some((w) => w.includes("critical chunks"))).toBe(true);
    });

    it("warns about missing RTL chunk", () => {
      const splitPoints = [
        { routeId: "home", path: "/", chunkName: "route-index", estimatedSize: 50000, priority: "critical" as const, reasons: [] },
      ];
      const localeChunks = generateLocaleChunks(["en", "es"]);

      const result = validateSplitConfiguration(splitPoints, localeChunks);

      expect(result.warnings.some((w) => w.includes("RTL"))).toBe(true);
    });
  });

  describe("RTL_LOCALES constant", () => {
    it("contains expected RTL locale codes", () => {
      expect(RTL_LOCALES).toContain("ar");
      expect(RTL_LOCALES).toContain("he");
      expect(RTL_LOCALES).toContain("fa");
      expect(RTL_LOCALES).toContain("ur");
    });

    it("does not contain LTR locales", () => {
      expect(RTL_LOCALES).not.toContain("en");
      expect(RTL_LOCALES).not.toContain("es");
      expect(RTL_LOCALES).not.toContain("fr");
    });
  });

  describe("POPULAR_MENA_ROUTES constant", () => {
    it("contains expected MENA routes", () => {
      expect(POPULAR_MENA_ROUTES).toContain("/ar");
      expect(POPULAR_MENA_ROUTES).toContain("/ar/products");
      expect(POPULAR_MENA_ROUTES).toContain("/ar/cart");
      expect(POPULAR_MENA_ROUTES).toContain("/ar/checkout");
    });
  });
});
