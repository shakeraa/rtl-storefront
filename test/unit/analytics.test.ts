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
  classifyDevice,
  getDeviceBreakdownByLanguage,
  getAIConfidenceMetrics,
  clearEvents,
  getEventCount,
} from '../../app/services/analytics/tracker';
import {
  generateTranslationReport,
  generateConversionReport,
  generateCoverageReport,
  generateROIReport,
  exportToCSV,
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
      const originalWindow = globalThis.window;
      Object.defineProperty(globalThis, 'window', {
        value: {
          location: { href: 'http://localhost:3000/' },
          navigator: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' },
        },
        configurable: true,
      });

      const event = trackPageView('shop-1', 'session-1', '/products', 'ar');
      expect(event.type).toBe('page_view');
      expect(event.locale).toBe('ar');
      expect(event.metadata.userAgent).toContain('iPhone');

      if (originalWindow) {
        Object.defineProperty(globalThis, 'window', {
          value: originalWindow,
          configurable: true,
        });
      } else {
        Reflect.deleteProperty(globalThis, 'window');
      }
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

    it('should classify device types', () => {
      expect(classifyDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBe('mobile');
      expect(classifyDevice('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)')).toBe('tablet');
      expect(classifyDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)')).toBe('desktop');
      expect(classifyDevice('')).toBe('unknown');
    });

    it('should calculate device breakdown by language', () => {
      trackEvent(
        'page_view',
        'shop-1',
        'session-1',
        { page: '/', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' },
        'ar'
      );
      trackConversion('shop-1', 'session-2', {
        locale: 'ar',
        productId: 'prod-1',
        value: 120,
        currency: 'USD',
        referrer: 'google',
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8)',
      });
      trackEvent(
        'page_view',
        'shop-1',
        'session-3',
        { page: '/', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)' },
        'en'
      );
      trackConversion('shop-1', 'session-4', {
        locale: 'en',
        productId: 'prod-2',
        value: 80,
        currency: 'USD',
        referrer: 'email',
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)',
      });

      const breakdown = getDeviceBreakdownByLanguage();
      expect(breakdown.ar).toEqual({
        mobile: 2,
        tablet: 0,
        desktop: 0,
        unknown: 0,
      });
      expect(breakdown.en).toEqual({
        mobile: 0,
        tablet: 1,
        desktop: 1,
        unknown: 0,
      });
    });
  });

  describe('Reports', () => {
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

      const report = generateTranslationReport({
        startDate: new Date(now.getTime() - 86400000),
        endDate: new Date(now.getTime() + 86400000),
      });

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
        { startDate: new Date(now.getTime() - 86400000), endDate: new Date(now.getTime() + 86400000) },
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
        { startDate: new Date(2024, 0, 1), endDate: new Date(2024, 11, 31) },
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
        { startDate: new Date(now.getTime() - 86400000), endDate: new Date(now.getTime() + 86400000) },
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
