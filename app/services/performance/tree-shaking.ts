/**
 * Tree Shaking Analysis Module
 * 
 * Provides utilities to analyze code for tree-shakeability, detect side effects,
 * optimize barrel files, and identify unused exports.
 */

export interface ExportInfo {
  name: string;
  type: "function" | "class" | "variable" | "const" | "let" | "type" | "interface";
  hasSideEffects: boolean;
  isPure: boolean;
  isUsed: boolean;
  dependencies: string[];
  location: {
    line: number;
    column: number;
  };
}

export interface ModuleInfo {
  path: string;
  exports: ExportInfo[];
  hasSideEffects: boolean;
  sideEffects: string[];
  isBarrelFile: boolean;
  reExports: ReExportInfo[];
  imports: ImportInfo[];
}

export interface ReExportInfo {
  source: string;
  exports: string[];
  isWildcard: boolean;
}

export interface ImportInfo {
  source: string;
  names: string[];
  isDefault: boolean;
  isNamespace: boolean;
}

export interface TreeShakeReport {
  module: string;
  isTreeShakable: boolean;
  issues: string[];
  recommendations: string[];
  unusedExports: ExportInfo[];
  sideEffectLocations: string[];
}

export interface BarrelFileOptimization {
  isOptimized: boolean;
  issues: string[];
  recommendations: string[];
  deepReExports: string[];
  circularDependencies: string[];
  size: {
    current: number;
    potential: number;
  };
}

export interface SideEffectDetection {
  hasSideEffects: boolean;
  locations: SideEffectLocation[];
  severity: "low" | "medium" | "high" | "critical";
}

export interface SideEffectLocation {
  type: string;
  location: string;
  description: string;
}

export interface UnusedExportReport {
  totalExports: number;
  unusedCount: number;
  unusedExports: UnusedExport[];
  usageRate: number;
}

export interface UnusedExport {
  name: string;
  type: string;
  location: string;
  lastUsed?: Date;
}

// Patterns that indicate side effects
const SIDE_EFFECT_PATTERNS = {
  // Global mutations
  globalAssignment: /(?:window|global|globalThis)\s*\.\s*\w+\s*=/,
  globalMutation: /(?:window|global|globalThis)\s*\.\s*\w+\s*\[.*?\]\s*=/,
  prototypeModification: /\w+\.prototype\.[\w$]+\s*=/,
  
  // DOM operations
  domManipulation: /document\.(write|writeln|open|close)\s*\(/,
  
  // Console and logging (can be side effects in some contexts)
  consoleCall: /console\.(log|warn|error|info|debug)\s*\(/,
  
  // Timer functions
  timerCalls: /(?:setTimeout|setInterval|clearTimeout|clearInterval)\s*\(/,
  
  // Event listeners at module level
  eventListener: /\.(addEventListener|removeEventListener)\s*\(/,
  
  // IIFE
  iife: /\(\s*function\s*\([^)]*\)\s*\{/,
  
  // Object property mutations
  propertyMutation: /\w+\.[\w$]+\s*=[^=]/,
  
  // Array mutations
  arrayMutation: /\w+\.(push|pop|shift|unshift|splice|reverse|sort|fill)\s*\(/,
  
  // Import with side effects
  sideEffectImport: /^import\s+['"][^'"]+['"]\s*;?$/m,
  
  // React-specific side effects
  reactHookCall: /use(?:Effect|LayoutEffect|InsertionEffect|Callback|Memo)\s*\(/,
  
  // Module-level execution
  topLevelCall: /^[\w$]+\s*\([^)]*\)\s*;?$/m,
  
  // Fetch/network calls
  networkCall: /(?:fetch|axios|XMLHttpRequest)\s*\(/,
  
  // Storage access
  storageAccess: /(?:localStorage|sessionStorage)\s*\.\w+/,
  
  // Dynamic imports
  dynamicImport: /import\s*\(\s*['"][^'"]+['"]\s*\)/,
};

// Pure function patterns (for tree-shaking optimization)
const PURE_PATTERNS = {
  // Math operations
  mathOperation: /Math\.(abs|ceil|floor|round|max|min|pow|sqrt|random)\s*\(/,
  // Array pure methods
  arrayPure: /\w+\.(map|filter|reduce|concat|slice|join|indexOf|includes|find|some|every)\s*\(/,
  // String pure methods
  stringPure: /\w+\.(split|slice|substring|toLowerCase|toUpperCase|trim|replace|match)\s*\(/,
  // Object creation
  objectCreation: /\{\s*\[?\s*['"]\w+['"]\s*\]?\s*:/,
  // Array literal
  arrayLiteral: /\[\s*[^\]]*\]/,
};

/**
 * Analyzes a module to extract export information
 */
export function analyzeExports(moduleCode: string, modulePath: string): ModuleInfo {
  const exports: ExportInfo[] = [];
  const sideEffects: string[] = [];
  const reExports: ReExportInfo[] = [];
  const imports: ImportInfo[] = [];
  
  const lines = moduleCode.split("\n");
  let hasSideEffects = false;
  let isBarrelFile = true;
  
  // Track export patterns
  const exportPatterns = [
    // Named exports: export const/let/var/function/class
    {
      pattern: /^export\s+(const|let|var)\s+(\w+)/,
      type: "variable" as const,
      getName: (match: RegExpMatchArray) => match[2],
    },
    {
      pattern: /^export\s+function\s+(\w+)/,
      type: "function" as const,
      getName: (match: RegExpMatchArray) => match[1],
    },
    {
      pattern: /^export\s+class\s+(\w+)/,
      type: "class" as const,
      getName: (match: RegExpMatchArray) => match[1],
    },
    // Type exports
    {
      pattern: /^export\s+type\s+(\w+)/,
      type: "type" as const,
      getName: (match: RegExpMatchArray) => match[1],
    },
    {
      pattern: /^export\s+interface\s+(\w+)/,
      type: "interface" as const,
      getName: (match: RegExpMatchArray) => match[1],
    },
    // Export { x, y }
    {
      pattern: /^export\s*\{\s*([^}]+)\}/,
      type: "variable" as const,
      getName: (match: RegExpMatchArray) => match[1].split(",").map(s => s.trim().split(/\s+as\s+/)[0])[0],
    },
  ];
  
  // Analyze each line
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();
    
    // Check for exports
    for (const { pattern, type, getName } of exportPatterns) {
      const match = trimmedLine.match(pattern);
      if (match) {
        const names = getName(match);
        const nameList = Array.isArray(names) ? names : [names];
        
        for (const name of nameList) {
          const exportInfo: ExportInfo = {
            name,
            type,
            hasSideEffects: checkLineForSideEffects(trimmedLine),
            isPure: checkLineForPurity(trimmedLine),
            isUsed: false, // Will be determined by usage analysis
            dependencies: extractDependencies(trimmedLine, moduleCode),
            location: { line: lineNum, column: line.indexOf(name) + 1 },
          };
          exports.push(exportInfo);
          
          if (exportInfo.hasSideEffects) {
            sideEffects.push(`${name} at line ${lineNum}`);
            hasSideEffects = true;
          }
        }
        break;
      }
    }
    
    // Check for re-exports (barrel file pattern)
    const reExportMatch = trimmedLine.match(/^export\s+\*\s+from\s+['"]([^'"]+)['"]/);
    if (reExportMatch) {
      reExports.push({
        source: reExportMatch[1],
        exports: [],
        isWildcard: true,
      });
    }
    
    const namedReExportMatch = trimmedLine.match(/^export\s*\{\s*([^}]+)\}\s*from\s+['"]([^'"]+)['"]/);
    if (namedReExportMatch) {
      const exportedNames = namedReExportMatch[1].split(",").map(s => s.trim().split(/\s+as\s+/).pop() || "");
      reExports.push({
        source: namedReExportMatch[2],
        exports: exportedNames,
        isWildcard: false,
      });
      isBarrelFile = true;
    }
    
    // Check for imports
    const importMatch = trimmedLine.match(/^import\s+\{?\s*([^}'"]+)\}?\s+from\s+['"]([^'"]+)['"]/);
    if (importMatch) {
      const names = importMatch[1].split(",").map(s => s.trim());
      imports.push({
        source: importMatch[2],
        names,
        isDefault: !trimmedLine.includes("{"),
        isNamespace: trimmedLine.includes("* as"),
      });
    }
    
    // Check for side effects
    if (checkLineForSideEffects(trimmedLine) && !trimmedLine.startsWith("export")) {
      hasSideEffects = true;
      sideEffects.push(`Line ${lineNum}: ${trimmedLine.slice(0, 80)}`);
    }
  });
  
  // A module is not a barrel file if it has actual implementation
  if (exports.some(e => e.type === "function" || e.type === "class") && reExports.length === 0) {
    isBarrelFile = false;
  }
  
  return {
    path: modulePath,
    exports,
    hasSideEffects,
    sideEffects,
    isBarrelFile,
    reExports,
    imports,
  };
}

/**
 * Checks if a line of code has side effects
 */
function checkLineForSideEffects(line: string): boolean {
  return Object.entries(SIDE_EFFECT_PATTERNS).some(([_, pattern]) => pattern.test(line));
}

/**
 * Checks if a line of code is pure (no side effects)
 */
function checkLineForPurity(line: string): boolean {
  // A line is pure if it creates values without side effects
  return Object.values(PURE_PATTERNS).some(pattern => pattern.test(line)) &&
    !checkLineForSideEffects(line);
}

/**
 * Extracts dependencies from an export
 */
function extractDependencies(line: string, fullCode: string): string[] {
  const dependencies: string[] = [];
  
  // Find function calls
  const callMatches = line.matchAll(/(\w+)\s*\(/g);
  for (const match of callMatches) {
    if (!["if", "while", "for", "switch", "catch"].includes(match[1])) {
      dependencies.push(match[1]);
    }
  }
  
  // Find variable references
  const varMatches = fullCode.match(new RegExp(`\\b\\w+\\b(?=\\s*[=:][^=])`, "g"));
  if (varMatches) {
    dependencies.push(...varMatches);
  }
  
  return [...new Set(dependencies)];
}

/**
 * Determines if a module is fully tree-shakable
 */
export function isTreeShakable(module: ModuleInfo): TreeShakeReport {
  const issues: string[] = [];
  const recommendations: string[] = [];
  const unusedExports = module.exports.filter(e => !e.isUsed);
  const sideEffectLocations = module.sideEffects;
  
  // Check for side effects
  if (module.hasSideEffects) {
    issues.push(`Module has ${module.sideEffects.length} side effect(s)`);
    recommendations.push("Consider isolating side effects into separate modules");
    recommendations.push("Use /*#__PURE__*/ annotation before pure function calls");
  }
  
  // Check for unused exports
  if (unusedExports.length > 0) {
    issues.push(`${unusedExports.length} unused export(s) detected`);
    recommendations.push("Remove unused exports or mark them as @internal");
  }
  
  // Check for non-pure exports
  const nonPureExports = module.exports.filter(e => !e.isPure && !e.hasSideEffects);
  if (nonPureExports.length > 0) {
    issues.push(`${nonPureExports.length} export(s) may have hidden dependencies`);
  }
  
  // Check for circular dependencies in barrel files
  if (module.isBarrelFile && module.reExports.length > 5) {
    issues.push("Large barrel file with many re-exports may prevent tree-shaking");
    recommendations.push("Split barrel files into smaller, focused modules");
    recommendations.push("Consider using direct imports instead of barrel exports");
  }
  
  // Check for missing sideEffects field indicator
  if (module.exports.length > 0 && !module.hasSideEffects) {
    recommendations.push("Add 'sideEffects: false' to package.json for better tree-shaking");
  }
  
  const isTreeShakable = issues.length === 0 || (!module.hasSideEffects && unusedExports.length < 3);
  
  return {
    module: module.path,
    isTreeShakable,
    issues,
    recommendations,
    unusedExports,
    sideEffectLocations,
  };
}

/**
 * Analyzes multiple modules for side effects
 */
export function findSideEffects(modules: ModuleInfo[]): Map<string, SideEffectDetection> {
  const results = new Map<string, SideEffectDetection>();
  
  for (const module of modules) {
    const locations: SideEffectLocation[] = [];
    
    for (const sideEffect of module.sideEffects) {
      // Parse side effect string (format: "Line N: code" or "name at line N")
      const lineMatch = sideEffect.match(/Line\s+(\d+):?\s*(.*)/);
      const atLineMatch = sideEffect.match(/(\w+)\s+at\s+line\s+(\d+)/);
      
      if (lineMatch) {
        locations.push({
          type: "top-level-execution",
          location: `Line ${lineMatch[1]}`,
          description: lineMatch[2] || "Side effect detected",
        });
      } else if (atLineMatch) {
        locations.push({
          type: "export-side-effect",
          location: `Line ${atLineMatch[2]}`,
          description: `Export '${atLineMatch[1]}' has side effects`,
        });
      }
    }
    
    // Determine severity
    let severity: "low" | "medium" | "high" | "critical" = "low";
    const hasGlobalMutation = locations.some(l => 
      l.description.includes("window") || 
      l.description.includes("global") ||
      l.description.includes("prototype")
    );
    const hasNetworkCall = locations.some(l =>
      l.description.includes("fetch") ||
      l.description.includes("axios")
    );
    const hasDOMManipulation = locations.some(l =>
      l.description.includes("document")
    );
    
    if (hasGlobalMutation) severity = "critical";
    else if (hasNetworkCall) severity = "high";
    else if (hasDOMManipulation) severity = "medium";
    else if (locations.length > 3) severity = "medium";
    
    results.set(module.path, {
      hasSideEffects: module.hasSideEffects,
      locations,
      severity,
    });
  }
  
  return results;
}

/**
 * Analyzes and provides optimization recommendations for barrel files
 */
export function optimizeBarrelFile(exports: ReExportInfo[]): BarrelFileOptimization {
  const issues: string[] = [];
  const recommendations: string[] = [];
  const deepReExports: string[] = [];
  const circularDependencies: string[] = [];
  
  // Track seen sources to detect circular dependencies
  const seenSources = new Set<string>();
  
  for (const reExport of exports) {
    // Check for wildcard exports
    if (reExport.isWildcard) {
      issues.push(`Wildcard export from '${reExport.source}' prevents precise tree-shaking`);
      recommendations.push(`Use named exports: export { specificItem } from '${reExport.source}'`);
    }
    
    // Check for deep nesting
    if (reExport.source.includes("/index") || reExport.source.endsWith("/")) {
      deepReExports.push(reExport.source);
      issues.push(`Deep re-export from '${reExport.source}' may cause circular dependencies`);
    }
    
    // Check for potential circular dependencies
    if (seenSources.has(reExport.source)) {
      circularDependencies.push(reExport.source);
      issues.push(`Potential circular dependency with '${reExport.source}'`);
    }
    seenSources.add(reExport.source);
    
    // Check for many exports from same source
    if (reExport.exports.length > 10) {
      recommendations.push(`Consider splitting '${reExport.source}' into smaller modules`);
    }
  }
  
  // Calculate size metrics
  const currentSize = exports.reduce((sum, e) => sum + e.exports.length + (e.isWildcard ? 100 : 0), 0);
  const potentialSize = exports.reduce((sum, e) => {
    if (e.isWildcard) {
      return sum + 10; // Assuming 10 named exports replace wildcard
    }
    return sum + e.exports.length;
  }, 0);
  
  // General recommendations
  if (exports.length > 10) {
    recommendations.push("Large barrel file - consider splitting by feature/domain");
  }
  
  if (deepReExports.length > 0) {
    recommendations.push("Avoid deep re-exports; import directly from source modules");
  }
  
  if (exports.filter(e => e.isWildcard).length > exports.length / 2) {
    recommendations.push("Too many wildcard exports - replace with named exports for better tree-shaking");
  }
  
  recommendations.push("Add 'sideEffects: false' to package.json if module has no side effects");
  recommendations.push("Consider using explicit import paths instead of barrel files for large libraries");
  
  const isOptimized = issues.length === 0 && deepReExports.length === 0;
  
  return {
    isOptimized,
    issues,
    recommendations,
    deepReExports,
    circularDependencies,
    size: {
      current: currentSize,
      potential: potentialSize,
    },
  };
}

/**
 * Detects unused exports based on usage data
 */
export function detectUnusedExports(
  usage: Map<string, string[]>,
  exports: ModuleInfo[]
): Map<string, UnusedExportReport> {
  const reports = new Map<string, UnusedExportReport>();
  
  for (const module of exports) {
    const moduleUsage = usage.get(module.path) || [];
    const unusedExports: UnusedExport[] = [];
    
    for (const exportInfo of module.exports) {
      const isUsed = moduleUsage.includes(exportInfo.name) || exportInfo.isUsed;
      
      if (!isUsed) {
        unusedExports.push({
          name: exportInfo.name,
          type: exportInfo.type,
          location: `${module.path}:${exportInfo.location.line}:${exportInfo.location.column}`,
        });
      }
      
      // Mark as used in the export info
      exportInfo.isUsed = isUsed;
    }
    
    const totalExports = module.exports.length;
    const unusedCount = unusedExports.length;
    const usageRate = totalExports > 0 ? (totalExports - unusedCount) / totalExports : 1;
    
    reports.set(module.path, {
      totalExports,
      unusedCount,
      unusedExports,
      usageRate,
    });
  }
  
  return reports;
}

/**
 * Generates a comprehensive tree-shaking analysis report
 */
export function generateTreeShakingReport(
  modules: ModuleInfo[],
  usageData?: Map<string, string[]>
): {
  summary: {
    totalModules: number;
    treeShakableModules: number;
    totalExports: number;
    unusedExports: number;
    totalSideEffects: number;
    barrelFiles: number;
  };
  moduleReports: TreeShakeReport[];
  sideEffectReport: Map<string, SideEffectDetection>;
  unusedExportReport: Map<string, UnusedExportReport>;
  barrelFileOptimizations: Map<string, BarrelFileOptimization>;
} {
  const moduleReports: TreeShakeReport[] = [];
  let treeShakableCount = 0;
  let totalExports = 0;
  let totalSideEffects = 0;
  let barrelFileCount = 0;
  
  for (const module of modules) {
    const report = isTreeShakable(module);
    moduleReports.push(report);
    
    if (report.isTreeShakable) {
      treeShakableCount++;
    }
    
    totalExports += module.exports.length;
    totalSideEffects += module.sideEffects.length;
    
    if (module.isBarrelFile) {
      barrelFileCount++;
    }
  }
  
  const sideEffectReport = findSideEffects(modules);
  
  const usage = usageData || new Map();
  const unusedExportReport = detectUnusedExports(usage, modules);
  
  const barrelFileOptimizations = new Map<string, BarrelFileOptimization>();
  for (const module of modules) {
    if (module.isBarrelFile) {
      const optimization = optimizeBarrelFile(module.reExports);
      barrelFileOptimizations.set(module.path, optimization);
    }
  }
  
  const unusedExportsCount = Array.from(unusedExportReport.values())
    .reduce((sum, r) => sum + r.unusedCount, 0);
  
  return {
    summary: {
      totalModules: modules.length,
      treeShakableModules: treeShakableCount,
      totalExports,
      unusedExports: unusedExportsCount,
      totalSideEffects,
      barrelFiles: barrelFileCount,
    },
    moduleReports,
    sideEffectReport,
    unusedExportReport,
    barrelFileOptimizations,
  };
}

/**
 * Provides actionable recommendations for improving tree-shaking
 */
export function getTreeShakingRecommendations(report: ReturnType<typeof generateTreeShakingReport>): string[] {
  const recommendations: string[] = [];
  
  const { summary } = report;
  
  if (summary.totalSideEffects > 0) {
    recommendations.push(`Address ${summary.totalSideEffects} side effects in ${summary.totalModules - summary.treeShakableModules} modules`);
  }
  
  if (summary.unusedExports > summary.totalExports * 0.2) {
    recommendations.push(`Remove ${summary.unusedExports} unused exports (${Math.round(summary.unusedExports / summary.totalExports * 100)}% of total)`);
  }
  
  if (summary.barrelFiles > summary.totalModules * 0.3) {
    recommendations.push(`Consider reducing ${summary.barrelFiles} barrel files - they may prevent effective tree-shaking`);
  }
  
  recommendations.push("Add 'sideEffects: false' to package.json for packages without side effects");
  recommendations.push("Use /*#__PURE__*/ annotation for pure function calls");
  recommendations.push("Avoid wildcard exports (export * from 'module')");
  recommendations.push("Use named exports instead of default exports for better tree-shaking");
  recommendations.push("Split large modules into smaller, focused ones");
  
  return recommendations;
}

/**
 * Analyzes import patterns to identify suboptimal imports
 */
export function analyzeImportPatterns(modules: ModuleInfo[]): {
  suboptimalImports: Array<{
    module: string;
    import: string;
    suggestion: string;
  }>;
  deepImports: string[];
  wildcardImports: string[];
} {
  const suboptimalImports: Array<{
    module: string;
    import: string;
    suggestion: string;
  }> = [];
  const deepImports: string[] = [];
  const wildcardImports: string[] = [];
  
  for (const module of modules) {
    for (const imp of module.imports) {
      // Check for deep imports from barrel files
      if (imp.source.includes("/index") || imp.source.endsWith("/")) {
        deepImports.push(`${module.path} -> ${imp.source}`);
        suboptimalImports.push({
          module: module.path,
          import: imp.source,
          suggestion: `Import directly from specific module instead of ${imp.source}`,
        });
      }
      
      // Check for wildcard imports
      if (imp.isNamespace) {
        wildcardImports.push(`${module.path} -> ${imp.source}`);
        suboptimalImports.push({
          module: module.path,
          import: imp.source,
          suggestion: `Use named imports instead of namespace import from ${imp.source}`,
        });
      }
      
      // Check for importing from large barrel files
      if (imp.names.length > 10) {
        suboptimalImports.push({
          module: module.path,
          import: imp.source,
          suggestion: `Consider splitting imports from ${imp.source} - importing ${imp.names.length} items`,
        });
      }
    }
  }
  
  return {
    suboptimalImports,
    deepImports,
    wildcardImports,
  };
}
