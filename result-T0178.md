# Task T0178: Performance - Bundle Size Optimization

## Summary
Successfully implemented the Bundle Optimizer service with comprehensive bundle analysis utilities, locale-based code splitting, dead code detection, and import optimization features.

## Files Created/Modified

### New Files
- `/app/services/performance/bundle-optimizer.ts` - Main implementation (23KB)
- `/test/unit/bundle-optimizer.test.ts` - Comprehensive tests

### Modified Files
- `/app/services/performance/index.ts` - Added export for bundle-optimizer

## Features Implemented

### 1. Bundle Analysis Utilities
- `analyzeBundleSize(stats)` - Complete bundle analysis with score calculation
- `findDuplicateModules(modules)` - Detects duplicate modules across chunks
- `findUnusedExports(modules)` - Identifies unused module exports
- `generateRecommendations()` - Creates prioritized optimization recommendations
- `calculateBundleScore()` - Health score (0-100) based on size, duplicates, unused exports

### 2. Locale-based Code Splitting
- `getSplitPointsByLocale(locale)` - Returns split config for specific locale (ar, he, en)
- `getAllLocaleSplitConfigs()` - Returns configs for all supported locales
- `calculateLocaleSplitSavings()` - Estimates savings from locale-specific lazy loading

### 3. Dead Code Detection
- `detectDeadCode(modules)` - Finds orphaned modules and circular dependencies
- DFS-based circular dependency detection algorithm

### 4. Import Optimization
- `getLazyImportCandidates(modules)` - Identifies modules suitable for lazy loading
- Pattern matching for charts, editors, maps, PDF viewers, media players, calendars
- `analyzeImportPatterns()` - Detects barrel imports and star imports

### 5. Size Calculation Utilities
- `estimateSavings(analysis)` - Calculates potential gzip/brotli savings
- `estimateSavingsByType()` - Savings breakdown by optimization type
- `formatBytes()` - Human-readable byte formatting
- `calculateReduction()` - Percentage reduction calculation
- `generateBundleReport()` - Markdown report generation
- `validateBundleBudget()` - Validates bundle against size budget

## Constants Exported
- `SIZE_THRESHOLDS` - Large module (50KB), Very large (100KB), Chunk warning (500KB)
- `COMPRESSION_RATIOS` - Gzip (0.3), Brotli (0.25)

## Test Results
- **Total Tests**: 54
- **Passing**: 54
- **Failing**: 0

### Test Coverage
- Bundle analysis (4 tests)
- Duplicate detection (3 tests)
- Unused exports (2 tests)
- Recommendations (3 tests)
- Bundle score (5 tests)
- Locale splitting (9 tests)
- Dead code detection (3 tests)
- Import optimization (7 tests)
- Savings estimation (4 tests)
- Utilities (7 tests)
- Constants (2 tests)

## Types Exported
- `BundleStats`, `ModuleInfo`, `ChunkInfo`
- `BundleAnalysis`, `DuplicateModule`, `UnusedExport`
- `OptimizationRecommendation`, `LocaleSplitConfig`, `SplitPoint`
- `ImportCandidate`, `SizeEstimate`

## Usage Example
```typescript
import { analyzeBundleSize, getSplitPointsByLocale, getLazyImportCandidates } from '~/services/performance';

// Analyze bundle
const analysis = analyzeBundleSize(bundleStats);
console.log(`Bundle score: ${analysis.score}/100`);

// Get locale-specific split points
const arConfig = getSplitPointsByLocale('ar');
console.log(`Required: ${arConfig.requiredModules}`);
console.log(`Optional: ${arConfig.optionalModules}`);

// Find lazy import candidates
const candidates = getLazyImportCandidates(modules);
```
