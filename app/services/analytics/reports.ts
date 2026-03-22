/**
 * Analytics Reports Service
 * T0012: Analytics - Report Generation
 */

import {
  getTranslationVolumeByLanguage,
  getConversionMetricsByLanguage,
  getAIConfidenceMetrics,
  getEventsByType,
  type AnalyticsEvent,
} from './tracker';

export interface ReportConfig {
  startDate: Date;
  endDate: Date;
  locales?: string[];
  metrics?: string[];
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export type DateRangePreset =
  | 'today'
  | 'last7Days'
  | 'last30Days'
  | 'monthToDate'
  | 'custom';

export interface DateRangeInput {
  preset: DateRangePreset;
  startDate?: Date;
  endDate?: Date;
  now?: Date;
}

export interface TranslationReport {
  period: { start: Date; end: Date };
  totalTranslations: number;
  byLanguage: Record<string, { count: number; chars: number; words: number }>;
  avgProcessingTime: number;
  aiConfidence: { avg: number; min: number; max: number };
}

export interface ConversionReport {
  period: { start: Date; end: Date };
  totalConversions: number;
  totalRevenue: number;
  byLanguage: Record<string, { count: number; revenue: number; avgOrderValue: number }>;
  conversionRate: number;
}

export interface CoverageReport {
  period: { start: Date; end: Date };
  overallCoverage: number;
  byLanguage: Record<string, { translated: number; total: number; coverage: number }>;
  untranslatedContent: string[];
}

export interface ROIReport {
  period: { start: Date; end: Date };
  translationCost: number;
  additionalRevenue: number;
  roi: number;
  byLanguage: Record<string, { cost: number; revenue: number; roi: number }>;
}

export function resolveDateRange(input: DateRangeInput): DateRange {
  const now = input.now ?? new Date();
  const endOfNow = new Date(now);
  endOfNow.setHours(23, 59, 59, 999);

  switch (input.preset) {
    case 'today': {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return { startDate: start, endDate: endOfNow };
    }
    case 'last7Days': {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return { startDate: start, endDate: endOfNow };
    }
    case 'last30Days': {
      const start = new Date(now);
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      return { startDate: start, endDate: endOfNow };
    }
    case 'monthToDate': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      return { startDate: start, endDate: endOfNow };
    }
    case 'custom': {
      if (!input.startDate || !input.endDate) {
        throw new Error('Custom date range requires startDate and endDate');
      }
      if (input.startDate > input.endDate) {
        throw new Error('startDate must be before or equal to endDate');
      }
      return {
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
      };
    }
  }
}

export function createReportConfigFromDateRange(
  input: DateRangeInput,
  options: Pick<ReportConfig, 'locales' | 'metrics'> = {}
): ReportConfig {
  const range = resolveDateRange(input);

  return {
    startDate: range.startDate,
    endDate: range.endDate,
    locales: options.locales,
    metrics: options.metrics,
  };
}

/**
 * Generate translation report
 */
export function generateTranslationReport(config: ReportConfig): TranslationReport {
  const volume = getTranslationVolumeByLanguage(config.startDate, config.endDate);
  const confidence = getAIConfidenceMetrics(config.startDate, config.endDate);
  const translations = getEventsByType('translation', config.startDate, config.endDate);

  const totalProcessingTime = translations.reduce(
    (sum, t) => sum + ((t.metadata.processingTime as number) || 0),
    0
  );

  const totalTranslations = Object.values(volume).reduce((sum, v) => sum + v.count, 0);

  return {
    period: { start: config.startDate, end: config.endDate },
    totalTranslations,
    byLanguage: volume,
    avgProcessingTime: translations.length > 0 ? totalProcessingTime / translations.length : 0,
    aiConfidence: {
      avg: confidence.avgConfidence,
      min: confidence.minConfidence,
      max: confidence.maxConfidence,
    },
  };
}

/**
 * Generate conversion report
 */
export function generateConversionReport(
  config: ReportConfig,
  pageViews: AnalyticsEvent[]
): ConversionReport {
  const byLanguage = getConversionMetricsByLanguage(config.startDate, config.endDate);

  const totalRevenue = Object.values(byLanguage).reduce((sum, v) => sum + v.totalValue, 0);
  const totalConversions = Object.values(byLanguage).reduce((sum, v) => sum + v.count, 0);

  // Calculate conversion rate
  const pageViewCount = pageViews.filter(
    (pv) =>
      pv.timestamp >= config.startDate &&
      pv.timestamp <= config.endDate
  ).length;
  
  const conversionRate = pageViewCount > 0 ? (totalConversions / pageViewCount) * 100 : 0;

  return {
    period: { start: config.startDate, end: config.endDate },
    totalConversions,
    totalRevenue,
    byLanguage: Object.fromEntries(
      Object.entries(byLanguage).map(([locale, data]) => [
        locale,
        { count: data.count, revenue: data.totalValue, avgOrderValue: data.avgValue },
      ])
    ),
    conversionRate,
  };
}

/**
 * Generate coverage report
 */
export function generateCoverageReport(
  config: ReportConfig,
  contentStats: Record<string, { total: number; translated: number }>
): CoverageReport {
  const byLanguage: Record<string, { translated: number; total: number; coverage: number }> = {};

  for (const [locale, stats] of Object.entries(contentStats)) {
    if (config.locales && !config.locales.includes(locale)) continue;
    
    byLanguage[locale] = {
      translated: stats.translated,
      total: stats.total,
      coverage: stats.total > 0 ? (stats.translated / stats.total) * 100 : 0,
    };
  }

  const totalTranslated = Object.values(byLanguage).reduce((sum, v) => sum + v.translated, 0);
  const totalContent = Object.values(byLanguage).reduce((sum, v) => sum + v.total, 0);

  return {
    period: { start: config.startDate, end: config.endDate },
    overallCoverage: totalContent > 0 ? (totalTranslated / totalContent) * 100 : 0,
    byLanguage,
    untranslatedContent: [], // Would be populated from actual content analysis
  };
}

/**
 * Generate ROI report
 */
export function generateROIReport(
  config: ReportConfig,
  costs: Record<string, number>
): ROIReport {
  const conversions = getConversionMetricsByLanguage(config.startDate, config.endDate);

  const byLanguage: Record<string, { cost: number; revenue: number; roi: number }> = {};

  for (const [locale, data] of Object.entries(conversions)) {
    const cost = costs[locale] || 0;
    const revenue = data.totalValue;
    byLanguage[locale] = {
      cost,
      revenue,
      roi: cost > 0 ? ((revenue - cost) / cost) * 100 : 0,
    };
  }

  const totalCost = Object.values(costs).reduce((sum, c) => sum + c, 0);
  const totalRevenue = Object.values(byLanguage).reduce((sum, v) => sum + v.revenue, 0);

  return {
    period: { start: config.startDate, end: config.endDate },
    translationCost: totalCost,
    additionalRevenue: totalRevenue,
    roi: totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0,
    byLanguage,
  };
}

/**
 * Export report to CSV
 */
export function exportToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const value = row[h];
      if (value === null || value === undefined) return '';
      if (value instanceof Date) return value.toISOString();
      return String(value).replace(/,/g, ';');
    })
  );

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Generate comprehensive analytics report
 */
export function generateComprehensiveReport(config: ReportConfig): {
  translation: TranslationReport;
  conversion: ConversionReport;
  coverage: CoverageReport;
  roi: ROIReport;
} {
  const pageViews = getEventsByType('page_view', config.startDate, config.endDate);
  
  // Mock content stats and costs - in production these would come from actual data
  const contentStats: Record<string, { total: number; translated: number }> = {
    en: { total: 1000, translated: 1000 },
    ar: { total: 1000, translated: 850 },
    he: { total: 1000, translated: 720 },
  };
  
  const costs: Record<string, number> = {
    ar: 1500,
    he: 1800,
  };

  return {
    translation: generateTranslationReport(config),
    conversion: generateConversionReport(config, pageViews),
    coverage: generateCoverageReport(config, contentStats),
    roi: generateROIReport(config, costs),
  };
}
