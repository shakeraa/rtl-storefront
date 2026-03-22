/**
 * Analytics & Reporting Service
 * Consolidated analytics service covering T0012, T0251-T0262.
 */

// === Original exports (T0012) ===

export interface AnalyticsEvent {
  name: string;
  properties: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

export interface ReportMetrics {
  translationsCompleted: number;
  translationsPending: number;
  costPerLanguage: Record<string, number>;
  avgTranslationTime: number;
  accuracyScore: number;
}

export interface TranslationMetrics {
  sourceLanguage: string;
  targetLanguage: string;
  contentType: string;
  characterCount: number;
  wordCount: number;
  cost: number;
  processingTime: number;
  provider: string;
  timestamp: Date;
}

// Track analytics event
export function trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): void {
  const fullEvent: AnalyticsEvent = {
    ...event,
    timestamp: new Date(),
  };

  // In production, send to analytics service
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event.name, event.properties);
  }

  // Log for development
  console.log('[Analytics]', fullEvent);
}

// Track translation completion
export function trackTranslation(
  sourceLang: string,
  targetLang: string,
  contentType: string,
  metrics: { chars: number; words: number; cost: number; time: number }
): void {
  trackEvent({
    name: 'translation_completed',
    properties: {
      source_language: sourceLang,
      target_language: targetLang,
      content_type: contentType,
      character_count: metrics.chars,
      word_count: metrics.words,
      cost: metrics.cost,
      processing_time_ms: metrics.time,
    },
  });
}

// Generate report
export function generateLegacyReport(
  startDate: Date,
  endDate: Date,
  metrics: TranslationMetrics[]
): ReportMetrics {
  const filtered = metrics.filter(
    (m) => m.timestamp >= startDate && m.timestamp <= endDate
  );

  const completed = filtered.length;
  const costByLang: Record<string, number> = {};
  let totalTime = 0;

  for (const m of filtered) {
    costByLang[m.targetLanguage] = (costByLang[m.targetLanguage] || 0) + m.cost;
    totalTime += m.processingTime;
  }

  return {
    translationsCompleted: completed,
    translationsPending: 0,
    costPerLanguage: costByLang,
    avgTranslationTime: completed > 0 ? totalTime / completed : 0,
    accuracyScore: 0,
  };
}

// Cost tracking
export class CostTracker {
  private dailyCosts: Map<string, number> = new Map();
  private monthlyCosts: Map<string, number> = new Map();

  addCost(amount: number, date: Date = new Date()): void {
    const dayKey = date.toISOString().split('T')[0];
    const monthKey = dayKey.substring(0, 7);

    this.dailyCosts.set(dayKey, (this.dailyCosts.get(dayKey) || 0) + amount);
    this.monthlyCosts.set(monthKey, (this.monthlyCosts.get(monthKey) || 0) + amount);
  }

  getDailyCost(date: Date): number {
    const key = date.toISOString().split('T')[0];
    return this.dailyCosts.get(key) || 0;
  }

  getMonthlyCost(yearMonth: string): number {
    return this.monthlyCosts.get(yearMonth) || 0;
  }

  getTotalCost(): number {
    return Array.from(this.monthlyCosts.values()).reduce((a, b) => a + b, 0);
  }
}

// === Re-exports from consolidated analytics modules (T0251-T0262) ===

export * from './constants';
export * from './types';
export * from './tracker';
export * from './coverage-analyzer';
export * from './content-reports';
export * from './user-analytics';
export * from './roi';
export * from './reports';
export * from './dashboard';
export * from './trends';
