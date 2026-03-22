export interface CoverageData {
  locale: string;
  totalResources: number;
  translatedResources: number;
  coveragePercent: number;
  byResourceType: Record<string, ResourceCoverage>;
  trend: CoverageTrend;
  goal?: number;
}

export interface ResourceCoverage {
  resourceType: string;
  total: number;
  translated: number;
  percent: number;
}

export interface CoverageTrend {
  direction: "up" | "down" | "stable";
  changePercent: number;
  period: "day" | "week" | "month";
}

export interface CoverageGoal {
  locale: string;
  targetPercent: number;
  deadline?: string;
}

export type CoverageLevel = "excellent" | "good" | "warning" | "critical";

/**
 * Calculate coverage percentage for a locale.
 */
export function calculateCoverage(total: number, translated: number): number {
  if (total === 0) return 100;
  return Math.round((translated / total) * 100);
}

/**
 * Get coverage level with color coding.
 */
export function getCoverageLevel(percent: number): CoverageLevel {
  if (percent >= 90) return "excellent";
  if (percent >= 70) return "good";
  if (percent >= 40) return "warning";
  return "critical";
}

/**
 * Get display color for coverage level.
 */
export function getCoverageColor(level: CoverageLevel): string {
  const colors: Record<CoverageLevel, string> = {
    excellent: "#22c55e", // green
    good: "#3b82f6",     // blue
    warning: "#f59e0b",  // amber
    critical: "#ef4444", // red
  };
  return colors[level];
}

/**
 * Build coverage data for a locale from resource counts.
 */
export function buildCoverageData(
  locale: string,
  resourceCounts: Array<{ type: string; total: number; translated: number }>,
  previousPercent?: number,
  goal?: number,
): CoverageData {
  const byResourceType: Record<string, ResourceCoverage> = {};
  let totalResources = 0;
  let translatedResources = 0;

  for (const rc of resourceCounts) {
    byResourceType[rc.type] = {
      resourceType: rc.type,
      total: rc.total,
      translated: rc.translated,
      percent: calculateCoverage(rc.total, rc.translated),
    };
    totalResources += rc.total;
    translatedResources += rc.translated;
  }

  const coveragePercent = calculateCoverage(totalResources, translatedResources);

  let trend: CoverageTrend;
  if (previousPercent === undefined) {
    trend = { direction: "stable", changePercent: 0, period: "week" };
  } else {
    const change = coveragePercent - previousPercent;
    trend = {
      direction: change > 0 ? "up" : change < 0 ? "down" : "stable",
      changePercent: Math.abs(change),
      period: "week",
    };
  }

  return {
    locale,
    totalResources,
    translatedResources,
    coveragePercent,
    byResourceType,
    trend,
    goal,
  };
}

/**
 * Get locales sorted by coverage (lowest first — most attention needed).
 */
export function sortByPriority(coverageList: CoverageData[]): CoverageData[] {
  return [...coverageList].sort((a, b) => a.coveragePercent - b.coveragePercent);
}

/**
 * Check if a coverage goal is met.
 */
export function isGoalMet(coverage: CoverageData): boolean {
  if (coverage.goal === undefined) return true;
  return coverage.coveragePercent >= coverage.goal;
}

/**
 * Get a human-readable summary of coverage status.
 */
export function getCoverageSummary(
  coverageList: CoverageData[],
): { totalLocales: number; avgCoverage: number; lowestLocale: string | null; highestLocale: string | null } {
  if (coverageList.length === 0) {
    return { totalLocales: 0, avgCoverage: 0, lowestLocale: null, highestLocale: null };
  }

  const sorted = sortByPriority(coverageList);
  const avg = Math.round(
    coverageList.reduce((sum, c) => sum + c.coveragePercent, 0) / coverageList.length,
  );

  return {
    totalLocales: coverageList.length,
    avgCoverage: avg,
    lowestLocale: sorted[0]?.locale ?? null,
    highestLocale: sorted[sorted.length - 1]?.locale ?? null,
  };
}
