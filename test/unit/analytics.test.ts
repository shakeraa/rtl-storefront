import { describe, it, expect, beforeEach } from 'vitest';
import {
  trackEvent,
  trackTranslation,
  trackConversion,
  trackPageView,
  trackLanguageChange,
  getEventsByType,
  getEventsByLocale,
  getTranslationVolumeByLanguage,
  getConversionMetricsByLanguage,
  getAIConfidenceMetrics,
  clearEvents,
  getEventCount,
} from '../../app/services/analytics/tracker';
import {
  createReportConfigFromDateRange,
  generateTranslationReport,
  generateConversionReport,
  generateCoverageReport,
  generateROIReport,
  exportToCSV,
  resolveDateRange,
} from '../../app/services/analytics/reports';

describe('Analytics Service - T0012', () => {
  beforeEach(() => {
    clearEvents();
  });

  describe('Event Tracking', () => {
    it('should track an event', () => {
      const event = trackEvent('page_view', 'shop-1', 'session-1', { page: '/' });
      expect(event.type).toBe('page_view');
      expect(event.shopId).toBe('shop-1');
      expect(event.metadata.page).toBe('/');
    });

    it('should track translation events', () => {
      const event = trackTranslation('shop-1', 'session-1', {
        sourceLocale: 'en',
        targetLocale: 'ar',
        contentType: 'product',
        charCount: 100,
        wordCount: 20,
        processingTime: 500,
        provider: 'openai',
        confidence: 0.95,
      });

      expect(event.type).toBe('translation');
      expect(event.locale).toBe('ar');
      expect(event.metadata.charCount).toBe(100);
    });

    it('should track conversion events', () => {
      const event = trackConversion('shop-1', 'session-1', {
        locale: 'ar',
        productId: 'prod-1',
        value: 99.99,
        currency: 'USD',
        referrer: 'google',
        userAgent: 'Mozilla/5.0',
      });

      expect(event.type).toBe('conversion');
      expect(event.metadata.value).toBe(99.99);
    });

    it('should track page views', () => {
      const event = trackPageView('shop-1', 'session-1', '/products', 'ar');
      expect(event.type).toBe('page_view');
      expect(event.locale).toBe('ar');
    });

    it('should track language changes', () => {
      const event = trackLanguageChange('shop-1', 'session-1', 'en', 'ar');
      expect(event.type).toBe('language_change');
      expect(event.metadata.fromLocale).toBe('en');
      expect(event.metadata.toLocale).toBe('ar');
    });
  });

  describe('Event Queries', () => {
    it('should get events by type', () => {
      trackEvent('translation', 'shop-1', 'session-1', {});
      trackEvent('translation', 'shop-1', 'session-1', {});
      trackEvent('conversion', 'shop-1', 'session-1', {});

      const translations = getEventsByType('translation');
      expect(translations).toHaveLength(2);
    });

    it('should get events by locale', () => {
      trackTranslation('shop-1', 'session-1', {
        sourceLocale: 'en',
        targetLocale: 'ar',
        contentType: 'product',
        charCount: 100,
        wordCount: 20,
        processingTime: 500,
        provider: 'openai',
        confidence: 0.95,
      });

      const arEvents = getEventsByLocale('ar');
      expect(arEvents).toHaveLength(1);
    });

    it('should expose the total event count', () => {
      trackEvent('page_view', 'shop-1', 'session-1', { page: '/' });
      trackEvent('conversion', 'shop-1', 'session-2', { value: 100 }, 'ar');

      expect(getEventCount()).toBe(2);
    });
  });

  describe('Translation Metrics', () => {
    it('should calculate translation volume by language', () => {
      trackTranslation('shop-1', 'session-1', {
        sourceLocale: 'en',
        targetLocale: 'ar',
        contentType: 'product',
        charCount: 100,
        wordCount: 20,
        processingTime: 500,
        provider: 'openai',
        confidence: 0.95,
      });

      trackTranslation('shop-1', 'session-1', {
        sourceLocale: 'en',
        targetLocale: 'ar',
        contentType: 'collection',
        charCount: 150,
        wordCount: 30,
        processingTime: 600,
        provider: 'openai',
        confidence: 0.92,
      });

      const volume = getTranslationVolumeByLanguage();
      expect(volume.ar.count).toBe(2);
      expect(volume.ar.chars).toBe(250);
      expect(volume.ar.words).toBe(50);
    });

    it('should calculate AI confidence metrics', () => {
      trackTranslation('shop-1', 'session-1', {
        sourceLocale: 'en',
        targetLocale: 'ar',
        contentType: 'product',
        charCount: 100,
        wordCount: 20,
        processingTime: 500,
        provider: 'openai',
        confidence: 0.95,
      });

      trackTranslation('shop-1', 'session-1', {
        sourceLocale: 'en',
        targetLocale: 'ar',
        contentType: 'product',
        charCount: 100,
        wordCount: 20,
        processingTime: 500,
        provider: 'openai',
        confidence: 0.85,
      });

      const metrics = getAIConfidenceMetrics();
      expect(metrics.avgConfidence).toBeCloseTo(0.9, 1);
      expect(metrics.minConfidence).toBe(0.85);
      expect(metrics.maxConfidence).toBe(0.95);
    });
  });

  describe('Conversion Metrics', () => {
    it('should calculate conversion metrics by language', () => {
      trackConversion('shop-1', 'session-1', {
        locale: 'ar',
        productId: 'prod-1',
        value: 100,
        currency: 'USD',
        referrer: 'google',
        userAgent: 'Mozilla/5.0',
      });

      trackConversion('shop-1', 'session-1', {
        locale: 'ar',
        productId: 'prod-2',
        value: 200,
        currency: 'USD',
        referrer: 'direct',
        userAgent: 'Mozilla/5.0',
      });

      const metrics = getConversionMetricsByLanguage();
      expect(metrics.ar.count).toBe(2);
      expect(metrics.ar.totalValue).toBe(300);
      expect(metrics.ar.avgValue).toBe(150);
    });
  });

  describe('Reports', () => {
    it('should resolve preset date ranges', () => {
      const now = new Date('2026-03-22T12:00:00.000Z');

      const today = resolveDateRange({ preset: 'today', now });
      expect(today.startDate.getFullYear()).toBe(2026);
      expect(today.startDate.getMonth()).toBe(2);
      expect(today.startDate.getDate()).toBe(22);
      expect(today.startDate.getHours()).toBe(0);
      expect(today.startDate.getMinutes()).toBe(0);
      expect(today.startDate.getSeconds()).toBe(0);
      expect(today.startDate.getMilliseconds()).toBe(0);
      expect(today.endDate.getFullYear()).toBe(2026);
      expect(today.endDate.getMonth()).toBe(2);
      expect(today.endDate.getDate()).toBe(22);
      expect(today.endDate.getHours()).toBe(23);
      expect(today.endDate.getMinutes()).toBe(59);
      expect(today.endDate.getSeconds()).toBe(59);
      expect(today.endDate.getMilliseconds()).toBe(999);

      const last7Days = resolveDateRange({ preset: 'last7Days', now });
      expect(last7Days.startDate.getFullYear()).toBe(2026);
      expect(last7Days.startDate.getMonth()).toBe(2);
      expect(last7Days.startDate.getDate()).toBe(16);
      expect(last7Days.startDate.getHours()).toBe(0);
      expect(last7Days.startDate.getMinutes()).toBe(0);
      expect(last7Days.startDate.getSeconds()).toBe(0);
      expect(last7Days.startDate.getMilliseconds()).toBe(0);
      expect(last7Days.endDate.getFullYear()).toBe(2026);
      expect(last7Days.endDate.getMonth()).toBe(2);
      expect(last7Days.endDate.getDate()).toBe(22);
      expect(last7Days.endDate.getHours()).toBe(23);
      expect(last7Days.endDate.getMinutes()).toBe(59);
      expect(last7Days.endDate.getSeconds()).toBe(59);
      expect(last7Days.endDate.getMilliseconds()).toBe(999);
    });

    it('should build report config from a custom date range', () => {
      const config = createReportConfigFromDateRange(
        {
          preset: 'custom',
          startDate: new Date('2026-03-01T00:00:00.000Z'),
          endDate: new Date('2026-03-15T23:59:59.999Z'),
        },
        {
          locales: ['ar'],
          metrics: ['translations'],
        }
      );

      expect(config.startDate.toISOString()).toBe('2026-03-01T00:00:00.000Z');
      expect(config.endDate.toISOString()).toBe('2026-03-15T23:59:59.999Z');
      expect(config.locales).toEqual(['ar']);
      expect(config.metrics).toEqual(['translations']);
    });

    it('should reject invalid custom date ranges', () => {
      expect(() =>
        resolveDateRange({
          preset: 'custom',
          startDate: new Date('2026-03-16T00:00:00.000Z'),
          endDate: new Date('2026-03-15T00:00:00.000Z'),
        })
      ).toThrow('startDate must be before or equal to endDate');
    });

    it('should generate translation report', () => {
      const now = new Date();
      trackTranslation('shop-1', 'session-1', {
        sourceLocale: 'en',
        targetLocale: 'ar',
        contentType: 'product',
        charCount: 100,
        wordCount: 20,
        processingTime: 500,
        provider: 'openai',
        confidence: 0.95,
      });

      const report = generateTranslationReport(
        createReportConfigFromDateRange({
          preset: 'custom',
          startDate: new Date(now.getTime() - 86400000),
          endDate: new Date(now.getTime() + 86400000),
        })
      );

      expect(report.totalTranslations).toBe(1);
      expect(report.byLanguage.ar.count).toBe(1);
    });

    it('should generate conversion report', () => {
      const now = new Date();
      trackConversion('shop-1', 'session-1', {
        locale: 'ar',
        productId: 'prod-1',
        value: 100,
        currency: 'USD',
        referrer: 'google',
        userAgent: 'Mozilla/5.0',
      });

      const pageViews: ReturnType<typeof getEventsByType> = [];
      const report = generateConversionReport(
        createReportConfigFromDateRange({
          preset: 'custom',
          startDate: new Date(now.getTime() - 86400000),
          endDate: new Date(now.getTime() + 86400000),
        }),
        pageViews
      );

      expect(report.totalConversions).toBe(1);
      expect(report.totalRevenue).toBe(100);
    });

    it('should generate coverage report', () => {
      const contentStats = {
        en: { total: 100, translated: 100 },
        ar: { total: 100, translated: 80 },
      };

      const report = generateCoverageReport(
        createReportConfigFromDateRange({
          preset: 'custom',
          startDate: new Date(2024, 0, 1),
          endDate: new Date(2024, 11, 31),
        }),
        contentStats
      );

      expect(report.overallCoverage).toBe(90);
      expect(report.byLanguage.ar.coverage).toBe(80);
    });

    it('should generate ROI report', () => {
      const now = new Date();
      trackConversion('shop-1', 'session-1', {
        locale: 'ar',
        productId: 'prod-1',
        value: 5000,
        currency: 'USD',
        referrer: 'google',
        userAgent: 'Mozilla/5.0',
      });

      const costs = { ar: 1000 };
      const report = generateROIReport(
        createReportConfigFromDateRange({
          preset: 'custom',
          startDate: new Date(now.getTime() - 86400000),
          endDate: new Date(now.getTime() + 86400000),
        }),
        costs
      );

      expect(report.translationCost).toBe(1000);
      expect(report.additionalRevenue).toBe(5000);
      expect(report.roi).toBe(400);
    });
  });

  describe('Export', () => {
    it('should export to CSV', () => {
      const data = [
        { locale: 'ar', count: 100, revenue: 5000 },
        { locale: 'he', count: 50, revenue: 2500 },
      ];

      const csv = exportToCSV(data);
      expect(csv).toContain('locale,count,revenue');
      expect(csv).toContain('ar,100,5000');
      expect(csv).toContain('he,50,2500');
    });
  });
});
