/**
 * Bundle Optimizer Service
 * 
 * Provides utilities for analyzing bundle size, detecting optimization opportunities,
 * and generating locale-based code splitting recommendations.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BundleStats {
  totalSize: number;
  modules: ModuleInfo[];
  chunks: ChunkInfo[];
  entryPoints: string[];
}

export interface ModuleInfo {
  id: string;
  path: string;
  size: number;
  dependencies: string[];
  usedExports?: string[];
  importedBy: string[];
  isNodeModule: boolean;
  category?: string;
}

export interface ChunkInfo {
  name: string;
  size: number;
  modules: string[];
  isLazy: boolean;
}

export interface BundleAnalysis {
  totalSize: number;
  compressedSize: number;
  moduleCount: number;
  largeModules: ModuleInfo[];
  duplicateModules: DuplicateModule[];
  unusedExports: UnusedExport[];
  optimizationRecommendations: OptimizationRecommendation[];
  score: number;
}

export interface DuplicateModule {
  path: string;
  size: number;
  occurrences: number;
  totalWasted: number;
  locations: string[];
}

export interface UnusedExport {
  module: string;
  export: string;
  size: number;
}

export interface OptimizationRecommendation {
  type: 'split' | 'lazy' | 'dedupe' | 'tree-shake' | 'compress';
  priority: 'high' | 'medium' | 'low';
  module: string;
  description: string;
  estimatedSavings: number;
  action: string;
}

export interface LocaleSplitConfig {
  locale: string;
  requiredModules: string[];
  optionalModules: string[];
  estimatedSize: number;
  splitPoints: SplitPoint[];
}

export interface SplitPoint {
  id: string;
  path: string;
  reason: string;
  currentSize: number;
  lazyLoadable: boolean;
  category?: string;
}

export interface ImportCandidate {
  module: string;
  currentImport: string;
  suggestedImport: string;
  estimatedSavings: number;
  impact: 'high' | 'medium' | 'low';
  reason: string;
}

export interface SizeEstimate {
  original: number;
  compressed: {
    gzip: number;
    brotli: number;
  };
  potentialSavings: {
    gzip: number;
    brotli: number;
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const SIZE_THRESHOLDS = {
  LARGE_MODULE: 50 * 1024,      // 50KB
  VERY_LARGE_MODULE: 100 * 1024, // 100KB
  CHUNK_WARNING: 500 * 1024,     // 500KB
  CRITICAL_CHUNK: 1000 * 1024,   // 1MB
} as const;

export const COMPRESSION_RATIOS = {
  gzip: 0.3,
  brotli: 0.25,
} as const;

// Locale-specific module patterns
const LOCALE_MODULE_PATTERNS: Record<string, string[]> = {
  ar: [
    'arabic',
    'ar-SA',
    'ar-AE',
    'hijri',
    'arabic-font',
    'rtl',
    '/ar/',
    'arabic-translation',
  ],
  he: [
    'hebrew',
    'he-IL',
    'hebrew-font',
    'rtl',
    '/he/',
    'jewish-calendar',
  ],
  en: [
    'english',
    'en-US',
    'en-GB',
    'latin-font',
    '/en/',
  ],
};

// Known heavy modules that should be lazy-loaded
const LAZY_CANDIDATE_PATTERNS = [
  /chart|graph|visualization/i,
  /editor|rich-text|wysiwyg/i,
  /map|location|geocode/i,
  /pdf|document-viewer/i,
  /video|audio|media-player/i,
  /calendar|date-picker/i,
  /analytics|tracking/i,
  /ai|ml|model/i,
];

// ---------------------------------------------------------------------------
// Bundle Analysis Utilities
// ---------------------------------------------------------------------------

/**
 * Analyze bundle statistics and generate optimization report.
 */
export function analyzeBundleSize(stats: BundleStats): BundleAnalysis {
  const modules = stats.modules;
  const totalSize = stats.totalSize;
  
  // Find large modules
  const largeModules = modules
    .filter(m => m.size >= SIZE_THRESHOLDS.LARGE_MODULE)
    .sort((a, b) => b.size - a.size);

  // Find duplicate modules
  const duplicates = findDuplicateModules(modules);

  // Find unused exports
  const unusedExports = findUnusedExports(modules);

  // Generate recommendations
  const recommendations = generateRecommendations(modules, duplicates, unusedExports);

  // Calculate score (0-100)
  const score = calculateBundleScore(totalSize, largeModules.length, duplicates.length, unusedExports.length);

  return {
    totalSize,
    compressedSize: Math.round(totalSize * COMPRESSION_RATIOS.brotli),
    moduleCount: modules.length,
    largeModules,
    duplicateModules: duplicates,
    unusedExports,
    optimizationRecommendations: recommendations,
    score,
  };
}

/**
 * Find duplicate modules across chunks.
 */
export function findDuplicateModules(modules: ModuleInfo[]): DuplicateModule[] {
  const moduleMap = new Map<string, ModuleInfo[]>();
  
  for (const mod of modules) {
    const key = mod.path;
    if (!moduleMap.has(key)) {
      moduleMap.set(key, []);
    }
    moduleMap.get(key)!.push(mod);
  }

  return Array.from(moduleMap.entries())
    .filter(([_, instances]) => instances.length > 1)
    .map(([path, instances]) => ({
      path,
      size: instances[0].size,
      occurrences: instances.length,
      totalWasted: instances[0].size * (instances.length - 1),
      locations: instances.map(i => i.id),
    }))
    .sort((a, b) => b.totalWasted - a.totalWasted);
}

/**
 * Find unused exports in modules.
 */
export function findUnusedExports(modules: ModuleInfo[]): UnusedExport[] {
  const unused: UnusedExport[] = [];
  
  for (const mod of modules) {
    if (mod.usedExports && mod.usedExports.length === 0) {
      // Entire module might be unused
      unused.push({
        module: mod.path,
        export: '*',
        size: mod.size,
      });
    }
  }
  
  return unused.sort((a, b) => b.size - a.size);
}

/**
 * Generate optimization recommendations based on analysis.
 */
export function generateRecommendations(
  modules: ModuleInfo[],
  duplicates: DuplicateModule[],
  unusedExports: UnusedExport[],
): OptimizationRecommendation[] {
  const recommendations: OptimizationRecommendation[] = [];

  // Recommend splitting large modules
  for (const mod of modules) {
    if (mod.size >= SIZE_THRESHOLDS.VERY_LARGE_MODULE) {
      recommendations.push({
        type: 'split',
        priority: 'high',
        module: mod.path,
        description: `Module is ${formatBytes(mod.size)} - consider code splitting`,
        estimatedSavings: Math.round(mod.size * 0.4),
        action: `Split ${mod.path} into smaller chunks or lazy-load`,
      });
    }
  }

  // Recommend lazy loading for certain patterns
  for (const mod of modules) {
    if (LAZY_CANDIDATE_PATTERNS.some(pattern => pattern.test(mod.path))) {
      const isAlreadyLazy = mod.importedBy.length === 0 || mod.category === 'lazy';
      if (!isAlreadyLazy && mod.size > 20 * 1024) {
        recommendations.push({
          type: 'lazy',
          priority: 'medium',
          module: mod.path,
          description: `Heavy ${mod.path} module may benefit from lazy loading`,
          estimatedSavings: mod.size,
          action: `Convert import of ${mod.path} to dynamic import()`,
        });
      }
    }
  }

  // Recommend deduplication
  for (const dup of duplicates.slice(0, 5)) {
    recommendations.push({
      type: 'dedupe',
      priority: dup.totalWasted > 50 * 1024 ? 'high' : 'medium',
      module: dup.path,
      description: `Duplicate module found in ${dup.occurrences} locations`,
      estimatedSavings: dup.totalWasted,
      action: `Ensure ${dup.path} is in a shared chunk`,
    });
  }

  // Recommend tree-shaking for unused exports
  for (const unused of unusedExports.slice(0, 5)) {
    recommendations.push({
      type: 'tree-shake',
      priority: 'medium',
      module: unused.module,
      description: `Unused export: ${unused.export}`,
      estimatedSavings: unused.size,
      action: `Remove or properly export from ${unused.module}`,
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority] || 
           b.estimatedSavings - a.estimatedSavings;
  });
}

/**
 * Calculate overall bundle health score (0-100).
 */
export function calculateBundleScore(
  totalSize: number,
  largeModuleCount: number,
  duplicateCount: number,
  unusedExportCount: number,
): number {
  let score = 100;
  
  // Deduct for total size
  if (totalSize > 1024 * 1024) {
    score -= Math.min(30, Math.round((totalSize - 1024 * 1024) / (1024 * 1024) * 10));
  }
  
  // Deduct for large modules
  score -= Math.min(20, largeModuleCount * 2);
  
  // Deduct for duplicates
  score -= Math.min(20, duplicateCount * 4);
  
  // Deduct for unused exports
  score -= Math.min(15, unusedExportCount * 3);
  
  return Math.max(0, score);
}

// ---------------------------------------------------------------------------
// Locale-based Code Splitting
// ---------------------------------------------------------------------------

interface LocaleModule {
  path: string;
  category: string;
  required: boolean;
  reason: string;
  estimatedSize: number;
}

function detectLocaleSpecificModules(patterns: string[]): LocaleModule[] {
  const modules: LocaleModule[] = [];
  
  for (const pattern of patterns) {
    if (pattern.includes('font')) {
      modules.push({
        path: `~/services/fonts/${pattern}`,
        category: 'fonts',
        required: true,
        reason: 'Locale-specific fonts are required for proper rendering',
        estimatedSize: 25 * 1024,
      });
    }
    
    if (pattern.includes('calendar') || pattern.includes('hijri')) {
      modules.push({
        path: `~/services/calendar/${pattern}`,
        category: 'calendar',
        required: false,
        reason: 'Calendar utilities can be lazy-loaded until needed',
        estimatedSize: 15 * 1024,
      });
    }
    
    if (pattern.includes('rtl')) {
      modules.push({
        path: '~/services/rtl/transformer',
        category: 'rtl',
        required: true,
        reason: 'RTL support is required for layout',
        estimatedSize: 12 * 1024,
      });
    }
    
    if (pattern.includes('translation')) {
      modules.push({
        path: `~/translations/${pattern}`,
        category: 'translations',
        required: true,
        reason: 'Translation files are required for UI',
        estimatedSize: 50 * 1024,
      });
    }
  }
  
  return modules;
}

/**
 * Get recommended code split points based on locale.
 */
export function getSplitPointsByLocale(locale: string): LocaleSplitConfig {
  const patterns = LOCALE_MODULE_PATTERNS[locale] || [];
  const allModules = detectLocaleSpecificModules(patterns);
  
  const requiredModules = allModules.filter(m => m.required).map(m => m.path);
  const optionalModules = allModules.filter(m => !m.required).map(m => m.path);
  
  const splitPoints: SplitPoint[] = allModules.map(mod => ({
    id: `locale-${locale}-${mod.category}`,
    path: mod.path,
    reason: mod.reason,
    currentSize: mod.estimatedSize,
    lazyLoadable: !mod.required,
    category: mod.category,
  }));

  const estimatedSize = allModules.reduce((sum, m) => sum + m.estimatedSize, 0);

  return {
    locale,
    requiredModules,
    optionalModules,
    estimatedSize,
    splitPoints,
  };
}

/**
 * Get recommended split points for all supported locales.
 */
export function getAllLocaleSplitConfigs(): Record<string, LocaleSplitConfig> {
  const locales = Object.keys(LOCALE_MODULE_PATTERNS);
  const configs: Record<string, LocaleSplitConfig> = {};
  
  for (const locale of locales) {
    configs[locale] = getSplitPointsByLocale(locale);
  }
  
  return configs;
}

/**
 * Calculate estimated bundle savings from locale splitting.
 */
export function calculateLocaleSplitSavings(
  currentSize: number,
  targetLocale: string,
): { 
  perVisit: number;
  averagePerVisit: number;
  explanation: string;
} {
  const config = getSplitPointsByLocale(targetLocale);
  const optionalSize = config.optionalModules.length * 20 * 1024; // Estimate
  
  // Assume user only loads 30% of optional modules per visit
  const typicalSavings = Math.round(optionalSize * 0.7);
  
  return {
    perVisit: typicalSavings,
    averagePerVisit: Math.round(typicalSavings * 0.6), // Averaged across all locales
    explanation: `Lazy-loading ${config.optionalModules.length} optional modules ` +
                 `saves ~${formatBytes(typicalSavings)} per ${targetLocale} visit`,
  };
}

// ---------------------------------------------------------------------------
// Dead Code Detection
// ---------------------------------------------------------------------------

function buildDependencyGraph(modules: ModuleInfo[]): Map<string, Set<string>> {
  const graph = new Map<string, Set<string>>();
  
  for (const mod of modules) {
    graph.set(mod.path, new Set(mod.dependencies));
  }
  
  return graph;
}

function detectCircularDependencies(graph: Map<string, Set<string>>): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(node: string, path: string[]): void {
    if (recursionStack.has(node)) {
      const cycleStart = path.indexOf(node);
      cycles.push(path.slice(cycleStart).concat([node]));
      return;
    }

    if (visited.has(node)) return;

    visited.add(node);
    recursionStack.add(node);
    path.push(node);

    const deps = graph.get(node) || new Set();
    for (const dep of deps) {
      dfs(dep, [...path]);
    }

    recursionStack.delete(node);
  }

  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      dfs(node, []);
    }
  }

  return cycles;
}

/**
 * Detect potentially dead code in module tree.
 */
export function detectDeadCode(modules: ModuleInfo[]): {
  deadModules: ModuleInfo[];
  orphanedExports: string[];
  circularDependencies: string[][];
} {
  const dependencyGraph = buildDependencyGraph(modules);
  
  // Find modules with no importers (except entry points)
  const deadModules = modules.filter(mod => {
    const isEntry = mod.importedBy.length === 0 && mod.dependencies.length > 0;
    const isOrphaned = mod.importedBy.length === 0 && mod.dependencies.length === 0;
    return !isEntry && (isOrphaned || mod.importedBy.length === 0);
  });

  // Find circular dependencies
  const circularDeps = detectCircularDependencies(dependencyGraph);

  return {
    deadModules,
    orphanedExports: deadModules.map(m => m.path),
    circularDependencies: circularDeps,
  };
}

// ---------------------------------------------------------------------------
// Import Optimization
// ---------------------------------------------------------------------------

/**
 * Get lazy import candidates from module list.
 */
export function getLazyImportCandidates(modules: ModuleInfo[]): ImportCandidate[] {
  const candidates: ImportCandidate[] = [];
  
  for (const mod of modules) {
    // Skip small modules
    if (mod.size < 10 * 1024) continue;
    
    // Check if matches lazy candidate patterns
    for (const pattern of LAZY_CANDIDATE_PATTERNS) {
      if (pattern.test(mod.path)) {
        const isBelowFold = mod.category === 'below-fold' || mod.importedBy.some(
          importer => importer.includes('lazy') || importer.includes('dynamic')
        );
        
        if (!isBelowFold) {
          candidates.push({
            module: mod.path,
            currentImport: `import { ... } from '${mod.path}';`,
            suggestedImport: `const module = await import('${mod.path}');`,
            estimatedSavings: mod.size,
            impact: mod.size > 100 * 1024 ? 'high' : mod.size > 50 * 1024 ? 'medium' : 'low',
            reason: `Large ${mod.path} module loaded eagerly but may not be needed immediately`,
          });
        }
        break;
      }
    }
    
    // Check for heavy third-party libraries
    if (mod.isNodeModule && mod.size > 50 * 1024) {
      const alreadyLazy = mod.importedBy.every(importer => 
        importer.includes('lazy') || importer.includes('dynamic')
      );
      
      if (!alreadyLazy) {
        candidates.push({
          module: mod.path,
          currentImport: `import Library from '${mod.path}';`,
          suggestedImport: `const Library = (await import('${mod.path}')).default;`,
          estimatedSavings: mod.size,
          impact: mod.size > 100 * 1024 ? 'high' : 'medium',
          reason: `Heavy third-party library can be lazy-loaded on interaction`,
        });
      }
    }
  }
  
  return candidates
    .sort((a, b) => b.estimatedSavings - a.estimatedSavings)
    .slice(0, 20);
}

/**
 * Analyze import patterns for optimization opportunities.
 */
export function analyzeImportPatterns(
  modules: ModuleInfo[],
): {
  barrelImports: string[];
  starImports: string[];
  sideEffectImports: string[];
  optimizationOpportunities: ImportCandidate[];
} {
  const barrelImports: string[] = [];
  const starImports: string[] = [];
  const sideEffectImports: string[] = [];
  
  for (const mod of modules) {
    if (mod.path.endsWith('/index')) {
      barrelImports.push(mod.path);
    }
    
    if (mod.category === 'star-import') {
      starImports.push(mod.path);
    }
    
    if (mod.category === 'side-effect') {
      sideEffectImports.push(mod.path);
    }
  }
  
  const opportunities: ImportCandidate[] = [];
  
  // Suggest tree-shakeable imports for barrel files
  for (const barrel of barrelImports) {
    const mod = modules.find(m => m.path === barrel);
    if (mod && mod.size > 30 * 1024) {
      opportunities.push({
        module: barrel,
        currentImport: `import { a, b, c } from '${barrel}';`,
        suggestedImport: `import { a } from '${barrel}/a';\\nimport { b } from '${barrel}/b';`,
        estimatedSavings: Math.round(mod.size * 0.5),
        impact: 'medium',
        reason: 'Barrel file imports may pull in unused exports',
      });
    }
  }
  
  return {
    barrelImports,
    starImports,
    sideEffectImports,
    optimizationOpportunities: opportunities,
  };
}

// ---------------------------------------------------------------------------
// Savings Estimation
// ---------------------------------------------------------------------------

/**
 * Estimate potential savings from analysis results.
 */
export function estimateSavings(analysis: BundleAnalysis): SizeEstimate {
  const original = analysis.totalSize;
  
  let potentialSavingsGzip = 0;
  let potentialSavingsBrotli = 0;
  
  // Calculate from recommendations
  for (const rec of analysis.optimizationRecommendations) {
    const savings = rec.estimatedSavings;
    potentialSavingsGzip += Math.round(savings * COMPRESSION_RATIOS.gzip);
    potentialSavingsBrotli += Math.round(savings * COMPRESSION_RATIOS.brotli);
  }
  
  // Add duplicate savings
  for (const dup of analysis.duplicateModules) {
    potentialSavingsGzip += Math.round(dup.totalWasted * COMPRESSION_RATIOS.gzip);
    potentialSavingsBrotli += Math.round(dup.totalWasted * COMPRESSION_RATIOS.brotli);
  }
  
  const compressedGzip = Math.round(original * COMPRESSION_RATIOS.gzip);
  const compressedBrotli = Math.round(original * COMPRESSION_RATIOS.brotli);
  
  return {
    original,
    compressed: {
      gzip: compressedGzip,
      brotli: compressedBrotli,
    },
    potentialSavings: {
      gzip: Math.min(potentialSavingsGzip, compressedGzip),
      brotli: Math.min(potentialSavingsBrotli, compressedBrotli),
    },
  };
}

/**
 * Estimate savings from specific optimization type.
 */
export function estimateSavingsByType(
  analysis: BundleAnalysis,
  type: OptimizationRecommendation['type'],
): number {
  const typeRecs = analysis.optimizationRecommendations.filter(r => r.type === type);
  return typeRecs.reduce((sum, r) => sum + r.estimatedSavings, 0);
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Format bytes to human-readable string.
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Calculate percentage reduction.
 */
export function calculateReduction(original: number, reduced: number): number {
  if (original === 0) return 0;
  return Math.round(((original - reduced) / original) * 100);
}

/**
 * Generate bundle report in markdown format.
 */
export function generateBundleReport(analysis: BundleAnalysis): string {
  const savings = estimateSavings(analysis);
  
  let report = `# Bundle Analysis Report\\n\\n`;
  report += `**Score:** ${analysis.score}/100\\n\\n`;
  report += `## Summary\\n\\n`;
  report += `- Total Size: ${formatBytes(analysis.totalSize)}\\n`;
  report += `- Compressed (Brotli): ${formatBytes(savings.compressed.brotli)}\\n`;
  report += `- Modules: ${analysis.moduleCount}\\n`;
  report += `- Potential Savings: ${formatBytes(savings.potentialSavings.brotli)}\\n\\n`;
  
  if (analysis.largeModules.length > 0) {
    report += `## Large Modules\\n\\n`;
    for (const mod of analysis.largeModules.slice(0, 10)) {
      report += `- ${mod.path}: ${formatBytes(mod.size)}\\n`;
    }
    report += `\\n`;
  }
  
  if (analysis.duplicateModules.length > 0) {
    report += `## Duplicate Modules\\n\\n`;
    for (const dup of analysis.duplicateModules.slice(0, 5)) {
      report += `- ${dup.path}: ${dup.occurrences}x (${formatBytes(dup.totalWasted)} wasted)\\n`;
    }
    report += `\\n`;
  }
  
  if (analysis.optimizationRecommendations.length > 0) {
    report += `## Recommendations\\n\\n`;
    for (const rec of analysis.optimizationRecommendations.slice(0, 10)) {
      report += `### [${rec.priority.toUpperCase()}] ${rec.type}\\n`;
      report += `- Module: ${rec.module}\\n`;
      report += `- Description: ${rec.description}\\n`;
      report += `- Estimated Savings: ${formatBytes(rec.estimatedSavings)}\\n`;
      report += `- Action: ${rec.action}\\n\\n`;
    }
  }
  
  return report;
}

/**
 * Validate if bundle meets size budget.
 */
export function validateBundleBudget(
  stats: BundleStats,
  budget: { maxSize: number; maxChunks?: number },
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];
  
  if (stats.totalSize > budget.maxSize) {
    violations.push(
      `Bundle size ${formatBytes(stats.totalSize)} exceeds budget ${formatBytes(budget.maxSize)}`
    );
  }
  
  if (budget.maxChunks && stats.chunks.length > budget.maxChunks) {
    violations.push(
      `Chunk count ${stats.chunks.length} exceeds budget ${budget.maxChunks}`
    );
  }
  
  for (const chunk of stats.chunks) {
    if (chunk.size > SIZE_THRESHOLDS.CHUNK_WARNING) {
      violations.push(
        `Chunk ${chunk.name} (${formatBytes(chunk.size)}) exceeds warning threshold`
      );
    }
  }
  
  return { valid: violations.length === 0, violations };
}
