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

export interface MissingTranslation {
  key: string;
  resourceType: string;
  resourceId: string;
  sourceValue: string;
  priority: "high" | "medium" | "low";
}

export interface CoverageStats {
  locale: string;
  totalResources: number;
  translatedResources: number;
  coveragePercent: number;
  missingCount: number;
  level: CoverageLevel;
  color: string;
  trend: CoverageTrend;
  goal?: CoverageGoal;
  goalMet: boolean;
}

export interface ProgressMetrics {
  locale: string;
  currentPercent: number;
  previousPercent: number;
  changePercent: number;
  changeDirection: "up" | "down" | "stable";
  translatedThisPeriod: number;
  remainingToGoal: number;
  estimatedDaysToGoal: number | null;
  period: "day" | "week" | "month";
}

export interface CoverageReport {
  generatedAt: string;
  overallStats: {
    totalLocales: number;
    avgCoverage: number;
    totalResources: number;
    totalTranslated: number;
    overallPercent: number;
  };
  localeStats: CoverageStats[];
  progressMetrics: ProgressMetrics[];
  missingTranslations: Record<string, MissingTranslation[]>;
  goals: CoverageGoal[];
  attentionNeeded: string[];
}

// In-memory storage for progress tracking
const progressHistory: Map<string, Array<{ percent: number; timestamp: string }>> = new Map();

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

/**
 * Get comprehensive coverage statistics for a locale.
 */
export function getCoverageStats(
  locale: string,
  resourceCounts: Array<{ type: string; total: number; translated: number }>,
  previousPercent?: number,
  goal?: CoverageGoal,
): CoverageStats {
  const coverageData = buildCoverageData(locale, resourceCounts, previousPercent, goal?.targetPercent);
  const level = getCoverageLevel(coverageData.coveragePercent);
  const color = getCoverageColor(level);

  return {
    locale,
    totalResources: coverageData.totalResources,
    translatedResources: coverageData.translatedResources,
    coveragePercent: coverageData.coveragePercent,
    missingCount: coverageData.totalResources - coverageData.translatedResources,
    level,
    color,
    trend: coverageData.trend,
    goal,
    goalMet: isGoalMet(coverageData),
  };
}

/**
 * Get progress metrics for a locale comparing current to historical data.
 */
export function getProgressMetrics(
  locale: string,
  currentPercent: number,
  previousPercent: number,
  period: "day" | "week" | "month" = "week",
  translationRatePerDay: number = 10,
): ProgressMetrics {
  const changePercent = currentPercent - previousPercent;
  const changeDirection = changePercent > 0 ? "up" : changePercent < 0 ? "down" : "stable";

  // Store in history for trend tracking
  const history = progressHistory.get(locale) ?? [];
  history.push({ percent: currentPercent, timestamp: new Date().toISOString() });
  progressHistory.set(locale, history.slice(-30)); // Keep last 30 entries

  // Calculate translated this period (estimated from percentage change)
  const translatedThisPeriod = Math.max(0, changePercent);

  // Calculate remaining to goal (assuming 100% as default goal)
  const remainingToGoal = Math.max(0, 100 - currentPercent);

  // Estimate days to goal based on translation rate
  let estimatedDaysToGoal: number | null = null;
  if (translationRatePerDay > 0 && remainingToGoal > 0) {
    estimatedDaysToGoal = Math.ceil(remainingToGoal / translationRatePerDay);
  }

  return {
    locale,
    currentPercent,
    previousPercent,
    changePercent: Math.abs(changePercent),
    changeDirection,
    translatedThisPeriod,
    remainingToGoal,
    estimatedDaysToGoal,
    period,
  };
}

/**
 * Get trend data from historical records for a locale.
 */
export function getTrendData(locale: string): Array<{ percent: number; timestamp: string }> {
  return progressHistory.get(locale) ?? [];
}

/**
 * Get missing translations for a locale.
 */
export function getMissingTranslations(
  locale: string,
  allResources: Array<{
    key: string;
    resourceType: string;
    resourceId: string;
    sourceValue: string;
    priority?: "high" | "medium" | "low";
  }>,
  translatedKeys: string[],
): MissingTranslation[] {
  const translatedSet = new Set(translatedKeys);

  return allResources
    .filter((resource) => !translatedSet.has(resource.key))
    .map((resource) => ({
      key: resource.key,
      resourceType: resource.resourceType,
      resourceId: resource.resourceId,
      sourceValue: resource.sourceValue,
      priority: resource.priority ?? "medium",
    }));
}

/**
 * Filter missing translations by priority.
 */
export function filterMissingByPriority(
  missingTranslations: MissingTranslation[],
  priority: "high" | "medium" | "low",
): MissingTranslation[] {
  return missingTranslations.filter((t) => t.priority === priority);
}

/**
 * Sort missing translations by priority (high to low).
 */
export function sortMissingByPriority(
  missingTranslations: MissingTranslation[],
): MissingTranslation[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return [...missingTranslations].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
  );
}

/**
 * Group missing translations by resource type.
 */
export function groupMissingByResourceType(
  missingTranslations: MissingTranslation[],
): Record<string, MissingTranslation[]> {
  return missingTranslations.reduce((groups, translation) => {
    const type = translation.resourceType;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(translation);
    return groups;
  }, {} as Record<string, MissingTranslation[]>);
}

/**
 * Generate a comprehensive coverage report.
 */
export function generateCoverageReport(
  locales: Array<{
    locale: string;
    resourceCounts: Array<{ type: string; total: number; translated: number }>;
    previousPercent?: number;
    goal?: CoverageGoal;
  }>,
  allResources?: Record<string, Array<{
    key: string;
    resourceType: string;
    resourceId: string;
    sourceValue: string;
    priority?: "high" | "medium" | "low";
  }>>,
  translatedKeysByLocale?: Record<string, string[]>,
): CoverageReport {
  const generatedAt = new Date().toISOString();

  // Calculate stats for each locale
  const localeStats: CoverageStats[] = [];
  const progressMetrics: ProgressMetrics[] = [];
  const missingTranslations: Record<string, MissingTranslation[]> = {};
  const goals: CoverageGoal[] = [];

  let totalResourcesAll = 0;
  let totalTranslatedAll = 0;

  for (const localeData of locales) {
    const { locale, resourceCounts, previousPercent, goal } = localeData;

    // Get coverage stats
    const stats = getCoverageStats(locale, resourceCounts, previousPercent, goal);
    localeStats.push(stats);

    totalResourcesAll += stats.totalResources;
    totalTranslatedAll += stats.translatedResources;

    // Get progress metrics
    if (previousPercent !== undefined) {
      const metrics = getProgressMetrics(locale, stats.coveragePercent, previousPercent);
      progressMetrics.push(metrics);
    }

    // Get missing translations if resources provided
    if (allResources?.[locale] && translatedKeysByLocale?.[locale]) {
      const missing = getMissingTranslations(
        locale,
        allResources[locale],
        translatedKeysByLocale[locale],
      );
      missingTranslations[locale] = missing;
    }

    // Track goals
    if (goal) {
      goals.push(goal);
    }
  }

  // Calculate overall stats
  const overallPercent = totalResourcesAll > 0
    ? Math.round((totalTranslatedAll / totalResourcesAll) * 100)
    : 100;

  const overallStats = {
    totalLocales: locales.length,
    avgCoverage: localeStats.length > 0
      ? Math.round(localeStats.reduce((sum, s) => sum + s.coveragePercent, 0) / localeStats.length)
      : 0,
    totalResources: totalResourcesAll,
    totalTranslated: totalTranslatedAll,
    overallPercent,
  };

  // Determine locales needing attention (coverage < 70% or goal not met)
  const attentionNeeded = localeStats
    .filter((s) => s.coveragePercent < 70 || !s.goalMet)
    .map((s) => s.locale);

  return {
    generatedAt,
    overallStats,
    localeStats,
    progressMetrics,
    missingTranslations,
    goals,
    attentionNeeded,
  };
}

/**
 * Clear progress history for a locale or all locales.
 */
export function clearProgressHistory(locale?: string): void {
  if (locale) {
    progressHistory.delete(locale);
  } else {
    progressHistory.clear();
  }
}

/**
 * Get coverage goal status with deadline check.
 */
export function getGoalStatus(
  coverage: CoverageStats,
  currentDate: Date = new Date(),
): {
  status: "met" | "on-track" | "at-risk" | "overdue";
  daysRemaining: number | null;
  progressToGoal: number;
} {
  if (!coverage.goal) {
    return { status: "met", daysRemaining: null, progressToGoal: 100 };
  }

  const progressToGoal = Math.min(100, Math.round((coverage.coveragePercent / coverage.goal.targetPercent) * 100));

  if (coverage.coveragePercent >= coverage.goal.targetPercent) {
    return { status: "met", daysRemaining: null, progressToGoal };
  }

  if (!coverage.goal.deadline) {
    return { status: coverage.coveragePercent >= coverage.goal.targetPercent * 0.8 ? "on-track" : "at-risk", daysRemaining: null, progressToGoal };
  }

  const deadline = new Date(coverage.goal.deadline);
  const daysRemaining = Math.ceil((deadline.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return { status: "overdue", daysRemaining, progressToGoal };
  }

  // Calculate if on track (needs to translate remaining items within deadline)
  const remaining = coverage.goal.targetPercent - coverage.coveragePercent;
  const dailyRateNeeded = remaining / Math.max(1, daysRemaining);
  const isOnTrack = dailyRateNeeded <= 5; // Assuming 5% per day is achievable

  return {
    status: isOnTrack ? "on-track" : "at-risk",
    daysRemaining,
    progressToGoal,
  };
}

/**
 * Compare coverage between two periods.
 */
export function compareCoveragePeriods(
  current: CoverageData,
  previous: CoverageData,
): {
  coverageChange: number;
  resourcesAdded: number;
  resourcesTranslated: number;
  newResources: number;
  trendDirection: "improving" | "declining" | "stable";
} {
  const coverageChange = current.coveragePercent - previous.coveragePercent;
  const resourcesAdded = current.totalResources - previous.totalResources;
  const resourcesTranslated = current.translatedResources - previous.translatedResources;

  let trendDirection: "improving" | "declining" | "stable";
  if (coverageChange > 2) {
    trendDirection = "improving";
  } else if (coverageChange < -2) {
    trendDirection = "declining";
  } else {
    trendDirection = "stable";
  }

  return {
    coverageChange,
    resourcesAdded,
    resourcesTranslated,
    newResources: Math.max(0, resourcesAdded),
    trendDirection,
  };
}
