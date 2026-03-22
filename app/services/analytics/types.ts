/**
 * Analytics Service Types
 * Consolidated type definitions for all analytics tasks (T0251-T0262)
 */

export interface TranslationVolumeEntry {
  date: string;
  locale: string;
  provider: string;
  characters: number;
  requests: number;
  cost: number;
}

export interface CoverageByLanguage {
  locale: string;
  localeName: string;
  totalResources: number;
  translatedResources: number;
  coveragePercent: number;
  trend: "up" | "down" | "stable";
}

export interface ContentReport {
  resourceType: string;
  resourceId: string;
  title: string;
  translationCount: number;
  lastTranslatedAt?: string;
  locales: string[];
}

export interface LanguagePreference {
  locale: string;
  visitors: number;
  percentage: number;
  source: "browser" | "cookie" | "url" | "geolocation";
}

export interface GeolocationEntry {
  country: string;
  countryName: string;
  visitors: number;
  preferredLocale: string;
  conversionRate?: number;
}

export interface ROIMetrics {
  locale: string;
  translationCost: number;
  revenue: number;
  orders: number;
  roi: number;
  revenuePerOrder: number;
}

export interface ReportConfig {
  shop: string;
  type: "volume" | "coverage" | "content" | "preferences" | "geolocation" | "roi" | "trends";
  dateRange: { from: string; to: string };
  locales?: string[];
  format: "json" | "csv" | "pdf";
}

export interface ScheduledReport {
  id: string;
  shop: string;
  config: ReportConfig;
  frequency: "daily" | "weekly" | "monthly";
  recipients: string[];
  nextRunAt: string;
  enabled: boolean;
}

export interface DashboardData {
  translationVolume: TranslationVolumeEntry[];
  coverageByLanguage: CoverageByLanguage[];
  topLanguages: LanguagePreference[];
  recentActivity: Array<{ action: string; locale: string; timestamp: string }>;
  costSummary: { today: number; thisWeek: number; thisMonth: number };
}

export interface HistoricalTrend {
  date: string;
  metric: string;
  value: number;
  locale?: string;
}
