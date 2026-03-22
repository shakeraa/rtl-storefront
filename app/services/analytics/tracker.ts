/**
 * Analytics Tracking Service
 * T0012: Analytics - Translation & Conversion Tracking
 */

export interface AnalyticsEvent {
  id: string;
  type: 'translation' | 'conversion' | 'page_view' | 'language_change' | 'purchase';
  timestamp: Date;
  shopId: string;
  sessionId: string;
  locale?: string;
  metadata: Record<string, unknown>;
}

export interface TranslationMetrics {
  sourceLocale: string;
  targetLocale: string;
  contentType: string;
  charCount: number;
  wordCount: number;
  processingTime: number;
  provider: string;
  confidence: number;
}

export interface ConversionMetrics {
  locale: string;
  productId?: string;
  collectionId?: string;
  value: number;
  currency: string;
  referrer: string;
  userAgent: string;
}

// Event storage (in production, this would be a database)
const eventStore: AnalyticsEvent[] = [];
const MAX_EVENTS = 10000;

/**
 * Track an analytics event
 */
export function trackEvent(
  type: AnalyticsEvent['type'],
  shopId: string,
  sessionId: string,
  metadata: Record<string, unknown> = {},
  locale?: string
): AnalyticsEvent {
  const event: AnalyticsEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    timestamp: new Date(),
    shopId,
    sessionId,
    locale,
    metadata,
  };

  eventStore.push(event);

  // Keep only last MAX_EVENTS
  if (eventStore.length > MAX_EVENTS) {
    eventStore.shift();
  }

  // In production, send to analytics service
  console.log(`[Analytics] ${type}:`, event);

  return event;
}

/**
 * Track translation completion
 */
export function trackTranslation(
  shopId: string,
  sessionId: string,
  metrics: TranslationMetrics
): AnalyticsEvent {
  return trackEvent(
    'translation',
    shopId,
    sessionId,
    {
      sourceLocale: metrics.sourceLocale,
      targetLocale: metrics.targetLocale,
      contentType: metrics.contentType,
      charCount: metrics.charCount,
      wordCount: metrics.wordCount,
      processingTime: metrics.processingTime,
      provider: metrics.provider,
      confidence: metrics.confidence,
    },
    metrics.targetLocale
  );
}

/**
 * Track conversion (add to cart, purchase, etc.)
 */
export function trackConversion(
  shopId: string,
  sessionId: string,
  metrics: ConversionMetrics
): AnalyticsEvent {
  return trackEvent(
    'conversion',
    shopId,
    sessionId,
    {
      productId: metrics.productId,
      collectionId: metrics.collectionId,
      value: metrics.value,
      currency: metrics.currency,
      referrer: metrics.referrer,
      userAgent: metrics.userAgent,
    },
    metrics.locale
  );
}

/**
 * Track page view
 */
export function trackPageView(
  shopId: string,
  sessionId: string,
  page: string,
  locale: string
): AnalyticsEvent {
  return trackEvent(
    'page_view',
    shopId,
    sessionId,
    { page, url: typeof window !== 'undefined' ? window.location.href : '' },
    locale
  );
}

/**
 * Track language change
 */
export function trackLanguageChange(
  shopId: string,
  sessionId: string,
  fromLocale: string,
  toLocale: string
): AnalyticsEvent {
  return trackEvent(
    'language_change',
    shopId,
    sessionId,
    { fromLocale, toLocale },
    toLocale
  );
}

/**
 * Get events by type
 */
export function getEventsByType(
  type: AnalyticsEvent['type'],
  startDate?: Date,
  endDate?: Date
): AnalyticsEvent[] {
  return eventStore.filter((event) => {
    if (event.type !== type) return false;
    if (startDate && event.timestamp < startDate) return false;
    if (endDate && event.timestamp > endDate) return false;
    return true;
  });
}

/**
 * Get events by locale
 */
export function getEventsByLocale(
  locale: string,
  startDate?: Date,
  endDate?: Date
): AnalyticsEvent[] {
  return eventStore.filter((event) => {
    if (event.locale !== locale) return false;
    if (startDate && event.timestamp < startDate) return false;
    if (endDate && event.timestamp > endDate) return false;
    return true;
  });
}

/**
 * Get translation volume by language
 */
export function getTranslationVolumeByLanguage(
  startDate?: Date,
  endDate?: Date
): Record<string, { count: number; chars: number; words: number }> {
  const translations = getEventsByType('translation', startDate, endDate);
  const volume: Record<string, { count: number; chars: number; words: number }> = {};

  for (const event of translations) {
    const locale = event.locale || 'unknown';
    if (!volume[locale]) {
      volume[locale] = { count: 0, chars: 0, words: 0 };
    }
    volume[locale].count++;
    volume[locale].chars += (event.metadata.charCount as number) || 0;
    volume[locale].words += (event.metadata.wordCount as number) || 0;
  }

  return volume;
}

/**
 * Get conversion metrics by language
 */
export function getConversionMetricsByLanguage(
  startDate?: Date,
  endDate?: Date
): Record<string, { count: number; totalValue: number; avgValue: number }> {
  const conversions = getEventsByType('conversion', startDate, endDate);
  const metrics: Record<string, { count: number; totalValue: number; values: number[] }> = {};

  for (const event of conversions) {
    const locale = event.locale || 'unknown';
    if (!metrics[locale]) {
      metrics[locale] = { count: 0, totalValue: 0, values: [] };
    }
    const value = (event.metadata.value as number) || 0;
    metrics[locale].count++;
    metrics[locale].totalValue += value;
    metrics[locale].values.push(value);
  }

  // Calculate averages
  const result: Record<string, { count: number; totalValue: number; avgValue: number }> = {};
  for (const [locale, data] of Object.entries(metrics)) {
    result[locale] = {
      count: data.count,
      totalValue: data.totalValue,
      avgValue: data.count > 0 ? data.totalValue / data.count : 0,
    };
  }

  return result;
}

/**
 * Get AI confidence scoring
 */
export function getAIConfidenceMetrics(
  startDate?: Date,
  endDate?: Date
): { avgConfidence: number; minConfidence: number; maxConfidence: number; count: number } {
  const translations = getEventsByType('translation', startDate, endDate);
  
  if (translations.length === 0) {
    return { avgConfidence: 0, minConfidence: 0, maxConfidence: 0, count: 0 };
  }

  const confidences = translations.map((t) => (t.metadata.confidence as number) || 0);
  
  return {
    avgConfidence: confidences.reduce((a, b) => a + b, 0) / confidences.length,
    minConfidence: Math.min(...confidences),
    maxConfidence: Math.max(...confidences),
    count: translations.length,
  };
}

/**
 * Clear all events (for testing)
 */
export function clearEvents(): void {
  eventStore.length = 0;
}

/**
 * Get total event count
 */
export function getEventCount(): number {
  return eventStore.length;
}
