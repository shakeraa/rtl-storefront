import { describe, it, expect } from 'vitest';
import {
  calculateCoverage,
  getCoverageLevel,
  getCoverageColor,
  buildCoverageData,
  sortByPriority,
  isGoalMet,
  getCoverageSummary,
} from '../../app/services/coverage';
import type { CoverageData } from '../../app/services/coverage';

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

  it('returns "warning" for 50%', () => {
    expect(getCoverageLevel(50)).toBe('warning');
  });

  it('returns "critical" for 20%', () => {
    expect(getCoverageLevel(20)).toBe('critical');
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

  it('includes goal when provided', () => {
    const data = buildCoverageData('ar', [{ type: 'product', total: 10, translated: 8 }], undefined, 90);
    expect(data.goal).toBe(90);
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
