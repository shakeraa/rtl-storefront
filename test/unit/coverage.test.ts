import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateCoverage,
  getCoverageLevel,
  getCoverageColor,
  buildCoverageData,
  sortByPriority,
  isGoalMet,
  getCoverageSummary,
  getCoverageStats,
  getProgressMetrics,
  getMissingTranslations,
  filterMissingByPriority,
  sortMissingByPriority,
  groupMissingByResourceType,
  generateCoverageReport,
  getTrendData,
  clearProgressHistory,
  getGoalStatus,
  compareCoveragePeriods,
  type CoverageData,
  type CoverageGoal,
  type MissingTranslation,
} from '../../app/services/coverage';

describe('calculateCoverage', () => {
  it('returns 80 for 80 of 100 translated', () => {
    expect(calculateCoverage(100, 80)).toBe(80);
  });

  it('returns 100 when total is 0', () => {
    expect(calculateCoverage(0, 0)).toBe(100);
  });

  it('returns 0 when nothing is translated', () => {
    expect(calculateCoverage(100, 0)).toBe(0);
  });

  it('rounds to nearest integer', () => {
    expect(calculateCoverage(3, 1)).toBe(33);
  });

  it('handles exact 50% correctly', () => {
    expect(calculateCoverage(100, 50)).toBe(50);
  });

  it('handles 100% coverage', () => {
    expect(calculateCoverage(100, 100)).toBe(100);
  });
});

describe('getCoverageLevel', () => {
  it('returns "excellent" for 95%', () => {
    expect(getCoverageLevel(95)).toBe('excellent');
  });

  it('returns "excellent" for exactly 90%', () => {
    expect(getCoverageLevel(90)).toBe('excellent');
  });

  it('returns "good" for 75%', () => {
    expect(getCoverageLevel(75)).toBe('good');
  });

  it('returns "good" for exactly 70%', () => {
    expect(getCoverageLevel(70)).toBe('good');
  });

  it('returns "warning" for 50%', () => {
    expect(getCoverageLevel(50)).toBe('warning');
  });

  it('returns "warning" for exactly 40%', () => {
    expect(getCoverageLevel(40)).toBe('warning');
  });

  it('returns "critical" for 20%', () => {
    expect(getCoverageLevel(20)).toBe('critical');
  });

  it('returns "critical" for 0%', () => {
    expect(getCoverageLevel(0)).toBe('critical');
  });
});

describe('getCoverageColor', () => {
  it('returns green for "excellent"', () => {
    expect(getCoverageColor('excellent')).toBe('#22c55e');
  });

  it('returns blue for "good"', () => {
    expect(getCoverageColor('good')).toBe('#3b82f6');
  });

  it('returns amber for "warning"', () => {
    expect(getCoverageColor('warning')).toBe('#f59e0b');
  });

  it('returns red for "critical"', () => {
    expect(getCoverageColor('critical')).toBe('#ef4444');
  });
});

describe('buildCoverageData', () => {
  it('computes correct totals from resource counts', () => {
    const data = buildCoverageData('ar', [
      { type: 'product', total: 50, translated: 40 },
      { type: 'page', total: 50, translated: 40 },
    ]);
    expect(data.totalResources).toBe(100);
    expect(data.translatedResources).toBe(80);
    expect(data.coveragePercent).toBe(80);
    expect(data.locale).toBe('ar');
  });

  it('sets trend to "stable" when no previousPercent given', () => {
    const data = buildCoverageData('ar', [{ type: 'product', total: 10, translated: 10 }]);
    expect(data.trend.direction).toBe('stable');
    expect(data.trend.changePercent).toBe(0);
  });

  it('sets trend direction to "up" when coverage increased', () => {
    const data = buildCoverageData('ar', [{ type: 'product', total: 100, translated: 80 }], 70);
    expect(data.trend.direction).toBe('up');
    expect(data.trend.changePercent).toBe(10);
  });

  it('sets trend direction to "down" when coverage decreased', () => {
    const data = buildCoverageData('ar', [{ type: 'product', total: 100, translated: 60 }], 80);
    expect(data.trend.direction).toBe('down');
    expect(data.trend.changePercent).toBe(20);
  });

  it('includes goal when provided', () => {
    const data = buildCoverageData('ar', [{ type: 'product', total: 10, translated: 8 }], undefined, 90);
    expect(data.goal).toBe(90);
  });

  it('calculates per-resource-type coverage', () => {
    const data = buildCoverageData('ar', [
      { type: 'product', total: 100, translated: 80 },
      { type: 'page', total: 50, translated: 25 },
    ]);
    expect(data.byResourceType.product.percent).toBe(80);
    expect(data.byResourceType.page.percent).toBe(50);
  });
});

describe('sortByPriority', () => {
  it('sorts lowest coverage first', () => {
    const list: CoverageData[] = [
      buildCoverageData('en', [{ type: 'p', total: 100, translated: 90 }]),
      buildCoverageData('ar', [{ type: 'p', total: 100, translated: 30 }]),
      buildCoverageData('he', [{ type: 'p', total: 100, translated: 60 }]),
    ];
    const sorted = sortByPriority(list);
    expect(sorted[0].locale).toBe('ar');
    expect(sorted[1].locale).toBe('he');
    expect(sorted[2].locale).toBe('en');
  });
});

describe('isGoalMet', () => {
  it('returns true when coverage >= goal', () => {
    const data = buildCoverageData('ar', [{ type: 'p', total: 100, translated: 90 }], undefined, 90);
    expect(isGoalMet(data)).toBe(true);
  });

  it('returns false when coverage < goal', () => {
    const data = buildCoverageData('ar', [{ type: 'p', total: 100, translated: 80 }], undefined, 90);
    expect(isGoalMet(data)).toBe(false);
  });

  it('returns true when no goal is set', () => {
    const data = buildCoverageData('ar', [{ type: 'p', total: 100, translated: 50 }]);
    expect(isGoalMet(data)).toBe(true);
  });
});

describe('getCoverageSummary', () => {
  it('returns correct avg and locale names', () => {
    const list = [
      buildCoverageData('ar', [{ type: 'p', total: 100, translated: 60 }]),
      buildCoverageData('he', [{ type: 'p', total: 100, translated: 80 }]),
    ];
    const summary = getCoverageSummary(list);
    expect(summary.totalLocales).toBe(2);
    expect(summary.avgCoverage).toBe(70);
    expect(summary.lowestLocale).toBe('ar');
    expect(summary.highestLocale).toBe('he');
  });

  it('returns nulls and zero for empty list', () => {
    const summary = getCoverageSummary([]);
    expect(summary.totalLocales).toBe(0);
    expect(summary.avgCoverage).toBe(0);
    expect(summary.lowestLocale).toBeNull();
    expect(summary.highestLocale).toBeNull();
  });
});

describe('getCoverageStats', () => {
  it('returns comprehensive stats for a locale', () => {
    const stats = getCoverageStats('ar', [
      { type: 'product', total: 100, translated: 80 },
    ]);
    expect(stats.locale).toBe('ar');
    expect(stats.coveragePercent).toBe(80);
    expect(stats.missingCount).toBe(20);
    expect(stats.level).toBe('good');
    expect(stats.color).toBe('#3b82f6');
    expect(stats.goalMet).toBe(true);
  });

  it('calculates correct missing count', () => {
    const stats = getCoverageStats('he', [
      { type: 'product', total: 100, translated: 50 },
    ]);
    expect(stats.missingCount).toBe(50);
  });

  it('includes goal information when provided', () => {
    const goal: CoverageGoal = { locale: 'ar', targetPercent: 90, deadline: '2025-12-31' };
    const stats = getCoverageStats('ar', [{ type: 'p', total: 100, translated: 80 }], undefined, goal);
    expect(stats.goal).toEqual(goal);
    expect(stats.goalMet).toBe(false);
  });

  it('tracks trend when previousPercent provided', () => {
    const stats = getCoverageStats('ar', [{ type: 'p', total: 100, translated: 85 }], 75);
    expect(stats.trend.direction).toBe('up');
    expect(stats.trend.changePercent).toBe(10);
  });
});

describe('getProgressMetrics', () => {
  beforeEach(() => {
    clearProgressHistory();
  });

  it('calculates progress metrics correctly', () => {
    const metrics = getProgressMetrics('ar', 80, 70, 'week');
    expect(metrics.locale).toBe('ar');
    expect(metrics.currentPercent).toBe(80);
    expect(metrics.previousPercent).toBe(70);
    expect(metrics.changePercent).toBe(10);
    expect(metrics.changeDirection).toBe('up');
    expect(metrics.remainingToGoal).toBe(20);
    expect(metrics.period).toBe('week');
  });

  it('detects downward trend', () => {
    const metrics = getProgressMetrics('ar', 60, 80, 'week');
    expect(metrics.changeDirection).toBe('down');
    expect(metrics.changePercent).toBe(20);
  });

  it('detects stable trend', () => {
    const metrics = getProgressMetrics('ar', 80, 80, 'week');
    expect(metrics.changeDirection).toBe('stable');
    expect(metrics.changePercent).toBe(0);
  });

  it('estimates days to goal based on translation rate', () => {
    const metrics = getProgressMetrics('ar', 80, 70, 'week', 5);
    expect(metrics.estimatedDaysToGoal).toBe(4); // 20% remaining / 5 per day = 4 days
  });

  it('returns null estimated days when rate is 0', () => {
    const metrics = getProgressMetrics('ar', 80, 70, 'week', 0);
    expect(metrics.estimatedDaysToGoal).toBeNull();
  });

  it('stores metrics in history', () => {
    getProgressMetrics('ar', 80, 70);
    const history = getTrendData('ar');
    expect(history.length).toBe(1);
    expect(history[0].percent).toBe(80);
  });
});

describe('getTrendData', () => {
  beforeEach(() => {
    clearProgressHistory();
  });

  it('returns empty array for unknown locale', () => {
    const history = getTrendData('unknown');
    expect(history).toEqual([]);
  });

  it('returns stored trend data', () => {
    getProgressMetrics('ar', 70, 60);
    getProgressMetrics('ar', 80, 70);
    const history = getTrendData('ar');
    expect(history.length).toBe(2);
  });
});

describe('clearProgressHistory', () => {
  it('clears history for specific locale', () => {
    getProgressMetrics('ar', 80, 70);
    getProgressMetrics('he', 90, 80);
    clearProgressHistory('ar');
    expect(getTrendData('ar').length).toBe(0);
    expect(getTrendData('he').length).toBe(1);
  });

  it('clears all history when no locale specified', () => {
    getProgressMetrics('ar', 80, 70);
    getProgressMetrics('he', 90, 80);
    clearProgressHistory();
    expect(getTrendData('ar').length).toBe(0);
    expect(getTrendData('he').length).toBe(0);
  });
});

describe('getMissingTranslations', () => {
  const allResources = [
    { key: 'product.title', resourceType: 'product', resourceId: '1', sourceValue: 'Title', priority: 'high' as const },
    { key: 'product.desc', resourceType: 'product', resourceId: '1', sourceValue: 'Desc', priority: 'medium' as const },
    { key: 'page.about', resourceType: 'page', resourceId: '2', sourceValue: 'About', priority: 'low' as const },
  ];

  it('returns only untranslated items', () => {
    const translatedKeys = ['product.title'];
    const missing = getMissingTranslations('ar', allResources, translatedKeys);
    expect(missing.length).toBe(2);
    expect(missing.map((m) => m.key)).toContain('product.desc');
    expect(missing.map((m) => m.key)).toContain('page.about');
  });

  it('returns empty array when all translated', () => {
    const translatedKeys = ['product.title', 'product.desc', 'page.about'];
    const missing = getMissingTranslations('ar', allResources, translatedKeys);
    expect(missing).toEqual([]);
  });

  it('preserves resource metadata', () => {
    const translatedKeys: string[] = [];
    const missing = getMissingTranslations('ar', allResources, translatedKeys);
    expect(missing[0].key).toBe('product.title');
    expect(missing[0].resourceType).toBe('product');
    expect(missing[0].sourceValue).toBe('Title');
    expect(missing[0].priority).toBe('high');
  });

  it('defaults priority to medium when not specified', () => {
    const resources = [
      { key: 'key1', resourceType: 'type', resourceId: '1', sourceValue: 'Value' },
    ];
    const missing = getMissingTranslations('ar', resources, []);
    expect(missing[0].priority).toBe('medium');
  });
});

describe('filterMissingByPriority', () => {
  const missingTranslations: MissingTranslation[] = [
    { key: '1', resourceType: 'product', resourceId: '1', sourceValue: 'A', priority: 'high' },
    { key: '2', resourceType: 'product', resourceId: '2', sourceValue: 'B', priority: 'medium' },
    { key: '3', resourceType: 'product', resourceId: '3', sourceValue: 'C', priority: 'high' },
    { key: '4', resourceType: 'page', resourceId: '4', sourceValue: 'D', priority: 'low' },
  ];

  it('filters by high priority', () => {
    const filtered = filterMissingByPriority(missingTranslations, 'high');
    expect(filtered.length).toBe(2);
    expect(filtered.every((t) => t.priority === 'high')).toBe(true);
  });

  it('filters by low priority', () => {
    const filtered = filterMissingByPriority(missingTranslations, 'low');
    expect(filtered.length).toBe(1);
    expect(filtered[0].key).toBe('4');
  });

  it('returns empty array when no matches', () => {
    const empty: MissingTranslation[] = [];
    const filtered = filterMissingByPriority(empty, 'high');
    expect(filtered).toEqual([]);
  });
});

describe('sortMissingByPriority', () => {
  it('sorts high priority first', () => {
    const missing: MissingTranslation[] = [
      { key: '1', resourceType: 't', resourceId: '1', sourceValue: 'A', priority: 'low' },
      { key: '2', resourceType: 't', resourceId: '2', sourceValue: 'B', priority: 'high' },
      { key: '3', resourceType: 't', resourceId: '3', sourceValue: 'C', priority: 'medium' },
    ];
    const sorted = sortMissingByPriority(missing);
    expect(sorted[0].priority).toBe('high');
    expect(sorted[1].priority).toBe('medium');
    expect(sorted[2].priority).toBe('low');
  });

  it('does not mutate original array', () => {
    const missing: MissingTranslation[] = [
      { key: '1', resourceType: 't', resourceId: '1', sourceValue: 'A', priority: 'low' },
    ];
    sortMissingByPriority(missing);
    expect(missing[0].priority).toBe('low');
  });
});

describe('groupMissingByResourceType', () => {
  it('groups translations by resource type', () => {
    const missing: MissingTranslation[] = [
      { key: '1', resourceType: 'product', resourceId: '1', sourceValue: 'A', priority: 'high' },
      { key: '2', resourceType: 'product', resourceId: '2', sourceValue: 'B', priority: 'medium' },
      { key: '3', resourceType: 'page', resourceId: '3', sourceValue: 'C', priority: 'low' },
    ];
    const grouped = groupMissingByResourceType(missing);
    expect(grouped.product.length).toBe(2);
    expect(grouped.page.length).toBe(1);
  });

  it('returns empty object for empty array', () => {
    const grouped = groupMissingByResourceType([]);
    expect(grouped).toEqual({});
  });
});

describe('generateCoverageReport', () => {
  beforeEach(() => {
    clearProgressHistory();
  });

  it('generates comprehensive report', () => {
    const locales = [
      { locale: 'ar', resourceCounts: [{ type: 'p', total: 100, translated: 80 }], previousPercent: 70 },
      { locale: 'he', resourceCounts: [{ type: 'p', total: 100, translated: 90 }] },
    ];
    const report = generateCoverageReport(locales);
    expect(report.generatedAt).toBeDefined();
    expect(report.overallStats.totalLocales).toBe(2);
    expect(report.overallStats.avgCoverage).toBe(85);
    expect(report.localeStats.length).toBe(2);
    expect(report.progressMetrics.length).toBe(1); // Only ar has previousPercent
  });

  it('calculates overall coverage correctly', () => {
    const locales = [
      { locale: 'ar', resourceCounts: [{ type: 'p', total: 100, translated: 50 }] },
      { locale: 'he', resourceCounts: [{ type: 'p', total: 100, translated: 100 }] },
    ];
    const report = generateCoverageReport(locales);
    expect(report.overallStats.totalResources).toBe(200);
    expect(report.overallStats.totalTranslated).toBe(150);
    expect(report.overallStats.overallPercent).toBe(75);
  });

  it('includes missing translations when resources provided', () => {
    const locales = [{ locale: 'ar', resourceCounts: [{ type: 'p', total: 3, translated: 1 }] }];
    const allResources = {
      ar: [
        { key: '1', resourceType: 'product', resourceId: '1', sourceValue: 'A' },
        { key: '2', resourceType: 'product', resourceId: '2', sourceValue: 'B' },
        { key: '3', resourceType: 'product', resourceId: '3', sourceValue: 'C' },
      ],
    };
    const translatedKeysByLocale = { ar: ['1'] };
    const report = generateCoverageReport(locales, allResources, translatedKeysByLocale);
    expect(report.missingTranslations.ar.length).toBe(2);
  });

  it('identifies locales needing attention', () => {
    const locales = [
      { locale: 'ar', resourceCounts: [{ type: 'p', total: 100, translated: 50 }] },
      { locale: 'he', resourceCounts: [{ type: 'p', total: 100, translated: 95 }] },
    ];
    const report = generateCoverageReport(locales);
    expect(report.attentionNeeded).toContain('ar');
    expect(report.attentionNeeded).not.toContain('he');
  });

  it('tracks goals in report', () => {
    const goal: CoverageGoal = { locale: 'ar', targetPercent: 90, deadline: '2025-12-31' };
    const locales = [{ locale: 'ar', resourceCounts: [{ type: 'p', total: 100, translated: 80 }], goal }];
    const report = generateCoverageReport(locales);
    expect(report.goals.length).toBe(1);
    expect(report.goals[0].targetPercent).toBe(90);
  });
});

describe('getGoalStatus', () => {
  it('returns "met" when coverage >= goal', () => {
    const stats = getCoverageStats('ar', [{ type: 'p', total: 100, translated: 95 }], undefined, {
      locale: 'ar',
      targetPercent: 90,
    });
    const status = getGoalStatus(stats);
    expect(status.status).toBe('met');
    expect(status.progressToGoal).toBe(100);
  });

  it('returns "on-track" when close to goal', () => {
    const stats = getCoverageStats('ar', [{ type: 'p', total: 100, translated: 75 }], undefined, {
      locale: 'ar',
      targetPercent: 80,
    });
    const status = getGoalStatus(stats);
    expect(status.status).toBe('on-track');
    expect(status.progressToGoal).toBe(94);
  });

  it('returns "at-risk" when far from goal', () => {
    const stats = getCoverageStats('ar', [{ type: 'p', total: 100, translated: 50 }], undefined, {
      locale: 'ar',
      targetPercent: 90,
    });
    const status = getGoalStatus(stats);
    expect(status.status).toBe('at-risk');
  });

  it('returns "overdue" when past deadline', () => {
    const stats = getCoverageStats('ar', [{ type: 'p', total: 100, translated: 50 }], undefined, {
      locale: 'ar',
      targetPercent: 90,
      deadline: '2020-01-01',
    });
    const status = getGoalStatus(stats, new Date('2025-01-01'));
    expect(status.status).toBe('overdue');
    expect(status.daysRemaining).toBeLessThan(0);
  });

  it('calculates days remaining correctly', () => {
    const stats = getCoverageStats('ar', [{ type: 'p', total: 100, translated: 80 }], undefined, {
      locale: 'ar',
      targetPercent: 90,
      deadline: '2025-12-31',
    });
    const status = getGoalStatus(stats, new Date('2025-01-01'));
    expect(status.daysRemaining).toBe(364);
  });

  it('handles no deadline', () => {
    const stats = getCoverageStats('ar', [{ type: 'p', total: 100, translated: 85 }], undefined, {
      locale: 'ar',
      targetPercent: 90,
    });
    const status = getGoalStatus(stats);
    expect(status.daysRemaining).toBeNull();
  });
});

describe('compareCoveragePeriods', () => {
  it('detects improving trend', () => {
    const current = buildCoverageData('ar', [{ type: 'p', total: 100, translated: 85 }]);
    const previous = buildCoverageData('ar', [{ type: 'p', total: 100, translated: 70 }]);
    const comparison = compareCoveragePeriods(current, previous);
    expect(comparison.coverageChange).toBe(15);
    expect(comparison.trendDirection).toBe('improving');
  });

  it('detects declining trend', () => {
    const current = buildCoverageData('ar', [{ type: 'p', total: 100, translated: 60 }]);
    const previous = buildCoverageData('ar', [{ type: 'p', total: 100, translated: 80 }]);
    const comparison = compareCoveragePeriods(current, previous);
    expect(comparison.coverageChange).toBe(-20);
    expect(comparison.trendDirection).toBe('declining');
  });

  it('detects stable trend', () => {
    const current = buildCoverageData('ar', [{ type: 'p', total: 100, translated: 81 }]);
    const previous = buildCoverageData('ar', [{ type: 'p', total: 100, translated: 80 }]);
    const comparison = compareCoveragePeriods(current, previous);
    expect(comparison.coverageChange).toBe(1);
    expect(comparison.trendDirection).toBe('stable');
  });

  it('calculates resources added', () => {
    const current = buildCoverageData('ar', [
      { type: 'p', total: 120, translated: 100 },
    ]);
    const previous = buildCoverageData('ar', [
      { type: 'p', total: 100, translated: 80 },
    ]);
    const comparison = compareCoveragePeriods(current, previous);
    expect(comparison.resourcesAdded).toBe(20);
    expect(comparison.newResources).toBe(20);
  });

  it('calculates resources translated', () => {
    const current = buildCoverageData('ar', [{ type: 'p', total: 100, translated: 90 }]);
    const previous = buildCoverageData('ar', [{ type: 'p', total: 100, translated: 70 }]);
    const comparison = compareCoveragePeriods(current, previous);
    expect(comparison.resourcesTranslated).toBe(20);
  });
});
