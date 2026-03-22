/**
 * T0180 — Code Splitting Service
 *
 * Provides route-based and component-level code splitting recommendations,
 * locale-aware chunk generation, and prefetching strategies for optimized
 * loading of RTL storefront resources.
 */

import type { ConnectionInfo } from "./prefetch";

/** Types of code split points */
export type SplitPointType = "route" | "component" | "locale" | "vendor" | "dynamic";

/** Priority level for chunk loading */
export type ChunkPriority = "critical" | "high" | "medium" | "low" | "deferred";

/** Route definition for splitting analysis */
export interface RouteDefinition {
  id: string;
  path: string;
  component: string;
  imports?: string[];
  weight?: number;
  frequency?: number;
}

/** Component metadata for splitting analysis */
export interface ComponentMetadata {
  id: string;
  name: string;
  path: string;
  size: number;
  dependencies: string[];
  usedIn: string[];
  isLazyLoadable: boolean;
  priority: ChunkPriority;
}

/** Route split point recommendation */
export interface RouteSplitPoint {
  routeId: string;
  path: string;
  chunkName: string;
  estimatedSize: number;
  priority: ChunkPriority;
  preloadTrigger?: string;
  reasons: string[];
}

/** Component split analysis result */
export interface ComponentSplitAnalysis {
  componentId: string;
  componentName: string;
  shouldSplit: boolean;
  recommendedStrategy: SplitStrategy;
  estimatedSavings: number;
  impact: "high" | "medium" | "low";
  dependencies: string[];
  splitReasons: string[];
}

/** Split strategy type */
export type SplitStrategy = "lazy" | "preload" | "inline" | "defer" | "vendor-split";

/** Locale chunk configuration */
export interface LocaleChunkConfig {
  locale: string;
  direction: "rtl" | "ltr";
  estimatedSize: number;
  chunkName: string;
  priority: ChunkPriority;
  includes: string[];
}

/** Locale chunk generation result */
export interface LocaleChunkResult {
  chunks: LocaleChunkConfig[];
  totalSize: number;
  rtlSpecificChunks: number;
  sharedChunks: number;
  recommendations: string[];
}

/** User behavior data for prefetch decisions */
export interface UserBehavior {
  visitedRoutes: string[];
  averageTimeOnPage: number;
  clickPattern: string[];
  scrollDepth: number;
  connectionHistory: ConnectionInfo[];
}

/** Prefetch strategy type */
export type PrefetchStrategyType = "eager" | "lazy" | "viewport" | "interaction" | "predictive" | "none";

/** Prefetch strategy configuration */
export interface PrefetchStrategy {
  type: PrefetchStrategyType;
  routes: string[];
  chunks: string[];
  delay: number;
  priority: ChunkPriority;
  conditions?: PrefetchConditions;
}

/** Conditions for prefetching to occur */
export interface PrefetchConditions {
  minConnectionSpeed?: string;
  maxDataUsage?: number;
  userIdleTime?: number;
  batteryLevel?: number;
}

/** Chunk manifest entry */
export interface ChunkManifestEntry {
  name: string;
  size: number;
  files: string[];
  imports: string[];
  isEntry: boolean;
  isDynamicEntry: boolean;
}

/** Analysis configuration */
export interface AnalysisConfig {
  minComponentSize: number;
  minRouteWeight: number;
  rtlLocaleBoost: number;
  maxPrefetchChunks: number;
  viewportThreshold: number;
}

const DEFAULT_CONFIG: AnalysisConfig = {
  minComponentSize: 10000, // 10KB
  minRouteWeight: 0.1,
  rtlLocaleBoost: 1.5,
  maxPrefetchChunks: 5,
  viewportThreshold: 0.5,
};

/** RTL locales list */
export const RTL_LOCALES = ["ar", "he", "fa", "ur", "ps", "ku", "sd", "yi", "dv"];

/** Popular routes for MENA region */
export const POPULAR_MENA_ROUTES = [
  "/ar",
  "/ar/products",
  "/ar/cart",
  "/ar/checkout",
  "/he/products",
  "/fa/products",
];

/**
 * Analyze routes and generate code splitting recommendations.
 * Returns split points with priority levels and estimated sizes.
 */
export function getRouteSplitPoints(
  routes: RouteDefinition[],
  config: Partial<AnalysisConfig> = {},
): RouteSplitPoint[] {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const splitPoints: RouteSplitPoint[] = [];

  // Sort routes by weight (frequency × size)
  const weightedRoutes = routes
    .map((route) => ({
      ...route,
      effectiveWeight: (route.weight || 0.5) * (route.frequency || 1),
    }))
    .sort((a, b) => b.effectiveWeight - a.effectiveWeight);

  for (const route of weightedRoutes) {
    const reasons: string[] = [];
    let priority: ChunkPriority = "medium";
    let estimatedSize = 50000; // Default 50KB

    // Check if route is RTL-specific
    const isRtlRoute = RTL_LOCALES.some((locale) =>
      route.path.toLowerCase().includes(`/${locale}`),
    );

    if (isRtlRoute) {
      reasons.push("RTL-specific route requires separate styling chunk");
      estimatedSize *= fullConfig.rtlLocaleBoost;
      priority = "high";
    }

    // Check route weight
    if (route.effectiveWeight > 0.8) {
      reasons.push("High-traffic route - prioritize loading");
      priority = "critical";
    } else if (route.effectiveWeight < fullConfig.minRouteWeight) {
      reasons.push("Low-traffic route - defer loading");
      priority = "deferred";
    }

    // Check imports for potential vendor splits
    if (route.imports && route.imports.length > 3) {
      reasons.push(`Multiple imports (${route.imports.length}) suggest vendor split opportunity`);
      estimatedSize += route.imports.length * 10000;
    }

    // Determine preload trigger based on priority
    let preloadTrigger: string | undefined;
    if (priority === "critical") {
      preloadTrigger = "immediate";
    } else if (priority === "high") {
      preloadTrigger = "idle";
    } else if (priority === "medium") {
      preloadTrigger = "viewport";
    }

    splitPoints.push({
      routeId: route.id,
      path: route.path,
      chunkName: generateChunkName(route),
      estimatedSize: Math.round(estimatedSize),
      priority,
      preloadTrigger,
      reasons: reasons.length > 0 ? reasons : ["Standard route splitting"],
    });
  }

  return splitPoints.sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
}

/**
 * Analyze components for optimal splitting opportunities.
 * Returns detailed analysis for each component.
 */
export function analyzeComponentSplits(
  components: ComponentMetadata[],
  config: Partial<AnalysisConfig> = {},
): ComponentSplitAnalysis[] {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const analyses: ComponentSplitAnalysis[] = [];

  // Calculate average component size
  const totalSize = components.reduce((sum, c) => sum + c.size, 0);
  const avgSize = totalSize / components.length || 1;

  for (const component of components) {
    const splitReasons: string[] = [];
    let shouldSplit = false;
    let impact: "high" | "medium" | "low" = "low";
    let strategy: SplitStrategy = "inline";
    let estimatedSavings = 0;

    // Size-based analysis
    if (component.size > fullConfig.minComponentSize * 3) {
      shouldSplit = true;
      splitReasons.push(`Large component (${formatBytes(component.size)})`);
      impact = "high";
      estimatedSavings = Math.round(component.size * 0.7);
    } else if (component.size > fullConfig.minComponentSize) {
      shouldSplit = true;
      splitReasons.push(`Moderate size component (${formatBytes(component.size)})`);
      impact = "medium";
      estimatedSavings = Math.round(component.size * 0.5);
    }

    // Usage pattern analysis
    if (component.usedIn.length > 5) {
      splitReasons.push(`Used in ${component.usedIn.length} routes - shared chunk candidate`);
      if (impact !== "high") impact = "medium";
    } else if (component.usedIn.length === 1) {
      splitReasons.push("Route-specific component - lazy load candidate");
      shouldSplit = true;
    }

    // Dependency analysis
    const heavyDeps = component.dependencies.filter((dep) =>
      dep.includes("chart") || dep.includes("editor") || dep.includes("map"),
    );
    if (heavyDeps.length > 0) {
      splitReasons.push(`Heavy dependencies: ${heavyDeps.join(", ")}`);
      shouldSplit = true;
      impact = "high";
      strategy = "lazy";
    }

    // Lazy loadable check
    if (!component.isLazyLoadable) {
      splitReasons.push("Not lazy-loadable - must be inlined");
      shouldSplit = false;
      strategy = "inline";
    } else if (component.priority === "deferred") {
      strategy = "defer";
    } else if (component.priority === "high" && shouldSplit) {
      strategy = "preload";
    } else if (shouldSplit) {
      strategy = "lazy";
    }

    // Vendor split detection
    if (component.dependencies.some((d) => d.startsWith("vendor/") || d.includes("node_modules"))) {
      splitReasons.push("Contains vendor dependencies - consider vendor split");
      if (shouldSplit) strategy = "vendor-split";
    }

    analyses.push({
      componentId: component.id,
      componentName: component.name,
      shouldSplit,
      recommendedStrategy: strategy,
      estimatedSavings,
      impact,
      dependencies: component.dependencies,
      splitReasons: splitReasons.length > 0 ? splitReasons : ["Small component - inline"],
    });
  }

  // Sort by impact and estimated savings
  return analyses.sort((a, b) => {
    const impactDiff = impactRank(b.impact) - impactRank(a.impact);
    if (impactDiff !== 0) return impactDiff;
    return b.estimatedSavings - a.estimatedSavings;
  });
}

/**
 * Generate locale-aware chunks for translation files.
 * Optimizes chunk sizes based on RTL/LTR direction and locale popularity.
 */
export function generateLocaleChunks(
  locales: string[],
  config: Partial<AnalysisConfig> = {},
): LocaleChunkResult {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const chunks: LocaleChunkConfig[] = [];
  const recommendations: string[] = [];

  let totalSize = 0;
  let rtlSpecificChunks = 0;

  // Separate RTL and LTR locales
  const rtlLocales = locales.filter((locale) => isRtlLocale(locale));
  const ltrLocales = locales.filter((locale) => !isRtlLocale(locale));

  // Generate RTL common chunk
  if (rtlLocales.length > 0) {
    const rtlChunkSize = estimateLocaleSize(rtlLocales, true);
    chunks.push({
      locale: "rtl-common",
      direction: "rtl",
      estimatedSize: rtlChunkSize,
      chunkName: "locales-rtl-common",
      priority: "high",
      includes: rtlLocales,
    });
    totalSize += rtlChunkSize;
    rtlSpecificChunks++;
    recommendations.push(`Create shared RTL chunk for ${rtlLocales.length} locales`);
  }

  // Generate LTR common chunk
  if (ltrLocales.length > 0) {
    const ltrChunkSize = estimateLocaleSize(ltrLocales, false);
    chunks.push({
      locale: "ltr-common",
      direction: "ltr",
      estimatedSize: ltrChunkSize,
      chunkName: "locales-ltr-common",
      priority: "medium",
      includes: ltrLocales,
    });
    totalSize += ltrChunkSize;
  }

  // Generate individual locale chunks for popular locales
  const popularLocales = [...RTL_LOCALES, "en", "es", "fr", "de"];
  for (const locale of locales) {
    const baseLocale = locale.split("-")[0].toLowerCase();
    const isPopular = popularLocales.includes(baseLocale);
    const isRtl = isRtlLocale(locale);

    if (isPopular || isRtl) {
      const size = estimateLocaleSize([locale], isRtl) / (isPopular ? 2 : 1);
      const existingChunk = chunks.find((c) => c.locale === "rtl-common" && isRtl);
      
      // Don't duplicate if already in common chunk unless high priority
      if (!existingChunk || isPopular) {
        chunks.push({
          locale,
          direction: isRtl ? "rtl" : "ltr",
          estimatedSize: Math.round(size),
          chunkName: `locale-${locale.replace("-", "_")}`,
          priority: isPopular ? "high" : "medium",
          includes: [locale],
        });
        totalSize += Math.round(size);
        if (isRtl) rtlSpecificChunks++;
      }
    }
  }

  // Generate recommendations
  if (rtlLocales.length > 3) {
    recommendations.push("Consider regional RTL chunks (Arabic vs Hebrew)");
  }
  if (ltrLocales.length > 5) {
    recommendations.push("Consider splitting LTR locales by region (EU, Americas, Asia)");
  }
  if (totalSize > 500000) {
    recommendations.push("Total locale size > 500KB - consider on-demand loading");
  }

  return {
    chunks: chunks.sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority)),
    totalSize,
    rtlSpecificChunks,
    sharedChunks: chunks.filter((c) => c.locale.endsWith("-common")).length,
    recommendations,
  };
}

/**
 * Determine the optimal prefetch strategy for a route based on user behavior.
 */
export function getPrefetchStrategy(
  route: string,
  userBehavior: UserBehavior,
  connection: ConnectionInfo = {},
): PrefetchStrategy {
  const strategy: PrefetchStrategy = {
    type: "none",
    routes: [],
    chunks: [],
    delay: 0,
    priority: "low",
    conditions: {},
  };

  // Check connection constraints
  if (connection.saveData) {
    strategy.type = "none";
    strategy.conditions = { maxDataUsage: 0 };
    return strategy;
  }

  if (connection.effectiveType === "slow-2g" || connection.effectiveType === "2g") {
    strategy.type = "lazy";
    strategy.priority = "deferred";
    strategy.delay = 5000;
    return strategy;
  }

  // Analyze user patterns
  const visitCount = userBehavior.visitedRoutes.filter((r) => r === route).length;
  const isFrequentRoute = visitCount > 3;
  const isRecentRoute = userBehavior.visitedRoutes.slice(-3).includes(route);
  
  // Predict next routes based on click patterns
  const likelyNextRoutes = predictNextRoutes(route, userBehavior.clickPattern);
  
  // Determine strategy based on behavior
  if (isFrequentRoute && userBehavior.averageTimeOnPage > 5000) {
    // User spends time on this route - eager prefetch
    strategy.type = "eager";
    strategy.routes = likelyNextRoutes.slice(0, 3);
    strategy.priority = "high";
    strategy.delay = 1000;
    strategy.conditions = { userIdleTime: 2000 };
  } else if (isRecentRoute && userBehavior.scrollDepth > 0.7) {
    // User scrolled deep - predictive prefetch
    strategy.type = "predictive";
    strategy.routes = likelyNextRoutes.slice(0, 2);
    strategy.priority = "medium";
    strategy.delay = 2000;
  } else if (POPULAR_MENA_ROUTES.includes(route)) {
    // Popular MENA route - viewport prefetch
    strategy.type = "viewport";
    strategy.routes = likelyNextRoutes.slice(0, 2);
    strategy.priority = "medium";
    strategy.delay = 500;
    strategy.conditions = { minConnectionSpeed: "3g" };
  } else {
    // Default - interaction-based prefetch
    strategy.type = "interaction";
    strategy.routes = likelyNextRoutes.slice(0, 1);
    strategy.priority = "low";
    strategy.delay = 3000;
  }

  // Add locale chunks for RTL routes
  if (isRtlRoute(route)) {
    strategy.chunks.push("locales-rtl-common");
  }

  return strategy;
}

/**
 * Generate a chunk manifest for build-time optimization.
 */
export function generateChunkManifest(
  splitPoints: RouteSplitPoint[],
  analyses: ComponentSplitAnalysis[],
): ChunkManifestEntry[] {
  const manifest: ChunkManifestEntry[] = [];

  // Add route chunks
  for (const point of splitPoints) {
    manifest.push({
      name: point.chunkName,
      size: point.estimatedSize,
      files: [`${point.chunkName}.js`, `${point.chunkName}.css`],
      imports: [],
      isEntry: point.priority === "critical" || point.priority === "high",
      isDynamicEntry: point.priority === "medium" || point.priority === "deferred",
    });
  }

  // Add component chunks
  for (const analysis of analyses.filter((a) => a.shouldSplit)) {
    const chunkName = `component-${analysis.componentName.toLowerCase().replace(/\s+/g, "-")}`;
    manifest.push({
      name: chunkName,
      size: analysis.estimatedSavings,
      files: [`${chunkName}.js`],
      imports: analysis.dependencies,
      isEntry: false,
      isDynamicEntry: analysis.recommendedStrategy === "lazy",
    });
  }

  return manifest;
}

/**
 * Calculate optimal chunk size limits based on connection type.
 */
export function getChunkSizeLimits(connection: ConnectionInfo): {
  maxInitialChunk: number;
  maxAsyncChunk: number;
  maxTotal: number;
} {
  if (connection.saveData) {
    return {
      maxInitialChunk: 50000, // 50KB
      maxAsyncChunk: 30000,   // 30KB
      maxTotal: 200000,       // 200KB
    };
  }

  switch (connection.effectiveType) {
    case "4g":
      return {
        maxInitialChunk: 200000,  // 200KB
        maxAsyncChunk: 150000,    // 150KB
        maxTotal: 1000000,        // 1MB
      };
    case "3g":
      return {
        maxInitialChunk: 100000,  // 100KB
        maxAsyncChunk: 80000,     // 80KB
        maxTotal: 500000,         // 500KB
      };
    case "slow-2g":
    case "2g":
      return {
        maxInitialChunk: 30000,   // 30KB
        maxAsyncChunk: 20000,     // 20KB
        maxTotal: 150000,         // 150KB
      };
    default:
      return {
        maxInitialChunk: 150000,  // 150KB
        maxAsyncChunk: 100000,    // 100KB
        maxTotal: 800000,         // 800KB
      };
  }
}

/**
 * Validate a code splitting configuration against best practices.
 */
export function validateSplitConfiguration(
  splitPoints: RouteSplitPoint[],
  localeChunks: LocaleChunkResult,
): { valid: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check for duplicate chunk names
  const chunkNames = new Set<string>();
  for (const point of splitPoints) {
    if (chunkNames.has(point.chunkName)) {
      errors.push(`Duplicate chunk name: ${point.chunkName}`);
    }
    chunkNames.add(point.chunkName);
  }

  // Check for oversized chunks
  for (const point of splitPoints) {
    if (point.estimatedSize > 500000) {
      warnings.push(`Chunk ${point.chunkName} is > 500KB - consider further splitting`);
    }
  }

  // Check for RTL locale coverage
  const hasRtlChunk = localeChunks.chunks.some((c) => c.direction === "rtl");
  if (!hasRtlChunk && localeChunks.chunks.length > 0) {
    warnings.push("No RTL-specific chunk found - consider adding for MENA markets");
  }

  // Check total locale size
  if (localeChunks.totalSize > 1000000) {
    warnings.push(`Total locale size (${formatBytes(localeChunks.totalSize)}) is > 1MB`);
  }

  // Check priority distribution
  const criticalCount = splitPoints.filter((p) => p.priority === "critical").length;
  if (criticalCount > 5) {
    warnings.push(`Too many critical chunks (${criticalCount}) - may impact initial load`);
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

// Helper functions

function generateChunkName(route: RouteDefinition): string {
  const cleanPath = route.path
    .replace(/^\//, "")
    .replace(/\//g, "-")
    .replace(/:/g, "")
    .replace(/\*/g, "all")
    .replace(/\[|\]/g, "");
  
  return `route-${cleanPath || "index"}`;
}

function isRtlLocale(locale: string): boolean {
  const baseLocale = locale.split("-")[0].toLowerCase();
  return RTL_LOCALES.includes(baseLocale);
}

function estimateLocaleSize(locales: string[], isRtl: boolean): number {
  // Base size per locale (~15KB translations + ~5KB metadata)
  const baseSize = locales.length * 20000;
  // RTL locales have additional formatting rules
  const rtlMultiplier = isRtl ? 1.3 : 1;
  return Math.round(baseSize * rtlMultiplier);
}

function priorityRank(priority: ChunkPriority): number {
  const ranks: Record<ChunkPriority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
    deferred: 4,
  };
  return ranks[priority];
}

function impactRank(impact: "high" | "medium" | "low"): number {
  const ranks = { high: 3, medium: 2, low: 1 };
  return ranks[impact];
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

function predictNextRoutes(currentRoute: string, clickPattern: string[]): string[] {
  const predictions: string[] = [];
  
  // Simple prediction based on common patterns
  const routePatterns: Record<string, string[]> = {
    "/ar": ["/ar/products", "/ar/categories"],
    "/ar/products": ["/ar/cart", "/ar/product/"],
    "/ar/cart": ["/ar/checkout"],
    "/he": ["/he/products"],
    "/he/products": ["/he/cart"],
  };

  // Add pattern-based predictions
  const patternPredictions = routePatterns[currentRoute] || [];
  predictions.push(...patternPredictions);

  // Add click pattern analysis
  const lastClicks = clickPattern.slice(-5);
  for (let i = 0; i < lastClicks.length - 1; i++) {
    if (lastClicks[i] === currentRoute) {
      const next = lastClicks[i + 1];
      if (!predictions.includes(next)) {
        predictions.push(next);
      }
    }
  }

  return predictions.slice(0, 5);
}

function isRtlRoute(route: string): boolean {
  return RTL_LOCALES.some((locale) => route.toLowerCase().includes(`/${locale}`));
}
