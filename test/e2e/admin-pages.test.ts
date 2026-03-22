/**
 * E2E-style tests for admin route service functions and data structures.
 *
 * Covers: Alerts, Analytics/Tracker, Analytics/Reports, AI Usage, Billing, Notifications
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------
import {
  createUntranslatedAlert,
  createNewContentAlert,
  createCoverageDropAlert,
  buildAlertSummary,
  filterAlerts,
  getDefaultAlertConfig,
  DEFAULT_THRESHOLDS,
  type TranslationAlert,
  type AlertSeverity,
} from "../../app/services/alerts/index";

// ---------------------------------------------------------------------------
// Analytics — tracker
// ---------------------------------------------------------------------------
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
} from "../../app/services/analytics/tracker";

// ---------------------------------------------------------------------------
// Analytics — reports
// ---------------------------------------------------------------------------
import {
  resolveDateRange,
  createReportConfigFromDateRange,
  generateTranslationReport,
  generateConversionReport,
  generateCoverageReport,
  generateROIReport,
  exportToCSV,
  type ReportConfig,
} from "../../app/services/analytics/reports";

// ---------------------------------------------------------------------------
// AI Usage
// ---------------------------------------------------------------------------
import {
  calculateCost,
  getProviderCostRate,
  trackAIUsage,
  trackAITranslation,
  getAIUsageStats,
  getCostByProvider,
  getCostForProvider,
  getUsageByLanguage,
  getCharactersByEngine,
  getApiCallCounts,
  clearAIUsageData,
  getAIUsageEntryCount,
  getQuotaStatus,
  setCharacterQuota,
  getCharacterQuota,
  exportAIUsageToCSV,
  type UsagePeriod,
} from "../../app/services/analytics/ai-usage";

// ---------------------------------------------------------------------------
// Billing (pure functions only — no DB)
// ---------------------------------------------------------------------------
import {
  formatPriceForShopify,
  parsePlanFeatures,
  getTrialDaysRemaining,
  isTrialExpired,
  isGated,
  isAdmin,
} from "../../app/services/billing/index";
import type { SubscriptionWithPlan, BillingContext } from "../../app/services/billing/types";

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------
import {
  NOTIFICATION_TEMPLATES,
  buildNotification,
  getNotificationPreferences,
  formatEmailHTML,
} from "../../app/services/notifications/index";

// ═══════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════

function makeSub(overrides: Partial<SubscriptionWithPlan> = {}): SubscriptionWithPlan {
  return {
    id: "sub_1",
    shop: "test.myshopify.com",
    planId: null,
    plan: null,
    status: "active",
    shopifyChargeId: null,
    trialStartedAt: null,
    trialEndsAt: null,
    currentPeriodStart: null,
    currentPeriodEnd: null,
    ...overrides,
  };
}

function widePeriod(): UsagePeriod {
  const start = new Date("2020-01-01");
  const end = new Date("2099-12-31");
  return { start, end };
}

function todayPeriod(): UsagePeriod {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { start, end };
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERTS (app.alerts)
// ═══════════════════════════════════════════════════════════════════════════

describe("Alerts — app.alerts", () => {
  // -----------------------------------------------------------------------
  // createUntranslatedAlert
  // -----------------------------------------------------------------------
  describe("createUntranslatedAlert", () => {
    it("creates alerts for multiple RTL locales (ar, he, fa) with correct severity", () => {
      const arCritical = createUntranslatedAlert("shop1", "ar", 60);
      const heWarning = createUntranslatedAlert("shop1", "he", 20);
      const faInfo = createUntranslatedAlert("shop1", "fa", 5);

      expect(arCritical).not.toBeNull();
      expect(arCritical!.severity).toBe("critical");
      expect(arCritical!.locale).toBe("ar");
      expect(arCritical!.count).toBe(60);

      expect(heWarning).not.toBeNull();
      expect(heWarning!.severity).toBe("warning");
      expect(heWarning!.locale).toBe("he");

      expect(faInfo).not.toBeNull();
      expect(faInfo!.severity).toBe("info");
      expect(faInfo!.locale).toBe("fa");
    });

    it("returns null when untranslated count is zero", () => {
      expect(createUntranslatedAlert("shop1", "ar", 0)).toBeNull();
    });

    it("severity boundary: exactly at warning threshold => warning", () => {
      const alert = createUntranslatedAlert("shop1", "ar", 10); // default warning=10
      expect(alert!.severity).toBe("warning");
    });

    it("severity boundary: exactly at critical threshold => critical", () => {
      const alert = createUntranslatedAlert("shop1", "ar", 50); // default critical=50
      expect(alert!.severity).toBe("critical");
    });

    it("severity boundary: just below warning threshold => info", () => {
      const alert = createUntranslatedAlert("shop1", "ar", 9);
      expect(alert!.severity).toBe("info");
    });

    it("uses custom thresholds", () => {
      const custom = { ...DEFAULT_THRESHOLDS, untranslatedCritical: 5, untranslatedWarning: 2 };
      const alert = createUntranslatedAlert("shop1", "ar", 3, custom);
      expect(alert!.severity).toBe("warning");

      const crit = createUntranslatedAlert("shop1", "ar", 5, custom);
      expect(crit!.severity).toBe("critical");
    });

    it("includes correct message for critical severity", () => {
      const alert = createUntranslatedAlert("shop1", "ar", 100);
      expect(alert!.message).toContain("Immediate attention required");
    });

    it("includes advisory message for non-critical severity", () => {
      const alert = createUntranslatedAlert("shop1", "ar", 5);
      expect(alert!.message).toContain("Consider translating");
    });
  });

  // -----------------------------------------------------------------------
  // createNewContentAlert
  // -----------------------------------------------------------------------
  describe("createNewContentAlert", () => {
    it("creates alerts for products, pages, collections", () => {
      const product = createNewContentAlert("shop1", "ar", "product", "gid://product/1", "Cool T-Shirt");
      const page = createNewContentAlert("shop1", "he", "page", "gid://page/2", "About Us");
      const collection = createNewContentAlert("shop1", "fa", "collection", "gid://collection/3", "Summer Sale");

      expect(product.category).toBe("new_content");
      expect(product.severity).toBe("info");
      expect(product.resourceType).toBe("product");
      expect(product.title).toContain("product");
      expect(product.title).toContain("Cool T-Shirt");

      expect(page.resourceType).toBe("page");
      expect(page.locale).toBe("he");

      expect(collection.resourceType).toBe("collection");
      expect(collection.resourceId).toBe("gid://collection/3");
    });

    it("alert is not dismissed by default", () => {
      const alert = createNewContentAlert("shop1", "ar", "product", "id1", "Test");
      expect(alert.dismissed).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // createCoverageDropAlert
  // -----------------------------------------------------------------------
  describe("createCoverageDropAlert", () => {
    it("returns null when drop < threshold (4% drop, threshold 5%)", () => {
      const alert = createCoverageDropAlert("shop1", "ar", 90, 86);
      expect(alert).toBeNull();
    });

    it("returns warning when drop == threshold (5% drop)", () => {
      const alert = createCoverageDropAlert("shop1", "ar", 90, 85);
      expect(alert).not.toBeNull();
      expect(alert!.severity).toBe("warning");
      expect(alert!.category).toBe("coverage_drop");
    });

    it("returns critical when drop >= 2x threshold (10% drop)", () => {
      const alert = createCoverageDropAlert("shop1", "ar", 90, 80);
      expect(alert).not.toBeNull();
      expect(alert!.severity).toBe("critical");
    });

    it("returns warning when drop between 1x and 2x threshold (7% drop)", () => {
      const alert = createCoverageDropAlert("shop1", "ar", 90, 83);
      expect(alert).not.toBeNull();
      expect(alert!.severity).toBe("warning");
    });

    it("message includes coverage percentages", () => {
      const alert = createCoverageDropAlert("shop1", "ar", 90, 80);
      expect(alert!.message).toContain("90%");
      expect(alert!.message).toContain("80%");
    });

    it("returns null when current > previous (no drop)", () => {
      const alert = createCoverageDropAlert("shop1", "ar", 80, 90);
      expect(alert).toBeNull();
    });

    it("returns null when coverage is equal", () => {
      const alert = createCoverageDropAlert("shop1", "ar", 85, 85);
      expect(alert).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // buildAlertSummary
  // -----------------------------------------------------------------------
  describe("buildAlertSummary", () => {
    it("counts by severity and locale", () => {
      const alerts: TranslationAlert[] = [
        createUntranslatedAlert("s", "ar", 60)!, // critical
        createUntranslatedAlert("s", "ar", 20)!, // warning
        createUntranslatedAlert("s", "he", 5)!,  // info
        createNewContentAlert("s", "fa", "product", "id1", "T"),
      ];

      const summary = buildAlertSummary(alerts);

      expect(summary.total).toBe(4);
      expect(summary.critical).toBe(1);
      expect(summary.warning).toBe(1);
      expect(summary.info).toBe(2);
      expect(summary.byLocale["ar"]).toBe(2);
      expect(summary.byLocale["he"]).toBe(1);
      expect(summary.byLocale["fa"]).toBe(1);
      expect(summary.byCategory["untranslated"]).toBe(3);
      expect(summary.byCategory["new_content"]).toBe(1);
    });

    it("empty array yields zero summary", () => {
      const summary = buildAlertSummary([]);
      expect(summary.total).toBe(0);
      expect(summary.critical).toBe(0);
      expect(summary.warning).toBe(0);
      expect(summary.info).toBe(0);
    });

    it("excludes dismissed alerts from summary", () => {
      const alert = createUntranslatedAlert("s", "ar", 60)!;
      alert.dismissed = true;

      const summary = buildAlertSummary([alert]);
      expect(summary.total).toBe(0);
      expect(summary.critical).toBe(0);
    });
  });

  // -----------------------------------------------------------------------
  // filterAlerts
  // -----------------------------------------------------------------------
  describe("filterAlerts", () => {
    let alerts: TranslationAlert[];

    beforeEach(() => {
      const dismissed = createUntranslatedAlert("s", "ar", 60)!;
      dismissed.dismissed = true;

      alerts = [
        createUntranslatedAlert("s", "ar", 60)!, // critical
        createUntranslatedAlert("s", "he", 20)!, // warning
        createUntranslatedAlert("s", "fa", 5)!,  // info
        createNewContentAlert("s", "ar", "product", "id1", "T"), // info
        dismissed, // dismissed critical
      ];
    });

    it("filters by severity", () => {
      const criticals = filterAlerts(alerts, { severity: "critical" });
      expect(criticals).toHaveLength(1);
      expect(criticals[0].severity).toBe("critical");
    });

    it("filters by category", () => {
      const newContent = filterAlerts(alerts, { category: "new_content" });
      expect(newContent).toHaveLength(1);
      expect(newContent[0].category).toBe("new_content");
    });

    it("filters by locale", () => {
      const arAlerts = filterAlerts(alerts, { locale: "ar" });
      expect(arAlerts).toHaveLength(2); // one untranslated + one new_content
    });

    it("excludes dismissed alerts by default", () => {
      const all = filterAlerts(alerts, {});
      expect(all).toHaveLength(4); // 5 total - 1 dismissed
    });

    it("includes dismissed alerts with includeDismissed flag", () => {
      const all = filterAlerts(alerts, { includeDismissed: true });
      expect(all).toHaveLength(5);
    });

    it("combines multiple filters", () => {
      const result = filterAlerts(alerts, { severity: "info", locale: "ar" });
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe("new_content");
    });

    it("returns empty array when no matches", () => {
      const result = filterAlerts(alerts, { severity: "critical", locale: "fa" });
      expect(result).toHaveLength(0);
    });
  });

  // -----------------------------------------------------------------------
  // Dismiss alert and verify exclusion
  // -----------------------------------------------------------------------
  describe("dismiss alert flow", () => {
    it("dismissed alert excluded from summary but included with flag", () => {
      const alert = createUntranslatedAlert("s", "ar", 100)!;
      expect(alert.dismissed).toBe(false);

      // Simulate dismissal
      alert.dismissed = true;

      const summary = buildAlertSummary([alert]);
      expect(summary.total).toBe(0);

      const filtered = filterAlerts([alert], { includeDismissed: true });
      expect(filtered).toHaveLength(1);

      const filteredDefault = filterAlerts([alert], {});
      expect(filteredDefault).toHaveLength(0);
    });
  });

  // -----------------------------------------------------------------------
  // getDefaultAlertConfig
  // -----------------------------------------------------------------------
  describe("getDefaultAlertConfig", () => {
    it("has correct default thresholds", () => {
      const config = getDefaultAlertConfig("test.myshopify.com");
      expect(config.shop).toBe("test.myshopify.com");
      expect(config.enableInApp).toBe(true);
      expect(config.enableEmail).toBe(false);
      expect(config.emailDigestFrequency).toBe("weekly");
      expect(config.emailRecipients).toEqual([]);
      expect(config.thresholds.untranslatedCritical).toBe(50);
      expect(config.thresholds.untranslatedWarning).toBe(10);
      expect(config.thresholds.coverageDropPercent).toBe(5);
      expect(config.thresholds.staleTranslationDays).toBe(90);
    });

    it("returns independent config objects (no shared state)", () => {
      const a = getDefaultAlertConfig("a");
      const b = getDefaultAlertConfig("b");
      a.thresholds.untranslatedCritical = 999;
      expect(b.thresholds.untranslatedCritical).toBe(50);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ANALYTICS / TRACKER (app.analytics)
// ═══════════════════════════════════════════════════════════════════════════

describe("Analytics Tracker — app.analytics", () => {
  beforeEach(() => {
    clearEvents();
  });

  describe("trackEvent and query by type/locale", () => {
    it("tracks events and retrieves by type", () => {
      trackEvent("page_view", "shop1", "sess1", { page: "/home" }, "ar");
      trackEvent("translation", "shop1", "sess1", {}, "ar");
      trackEvent("page_view", "shop1", "sess2", { page: "/products" }, "he");

      const pageViews = getEventsByType("page_view");
      expect(pageViews).toHaveLength(2);

      const translations = getEventsByType("translation");
      expect(translations).toHaveLength(1);
    });

    it("queries by locale", () => {
      trackEvent("page_view", "shop1", "sess1", {}, "ar");
      trackEvent("page_view", "shop1", "sess1", {}, "he");
      trackEvent("page_view", "shop1", "sess1", {}, "ar");

      const arEvents = getEventsByLocale("ar");
      expect(arEvents).toHaveLength(2);
    });

    it("returns empty for non-existent type", () => {
      expect(getEventsByType("purchase")).toHaveLength(0);
    });
  });

  describe("getTranslationVolumeByLanguage", () => {
    it("calculates volume for tracked translations", () => {
      trackTranslation("shop1", "s1", {
        sourceLocale: "en",
        targetLocale: "ar",
        contentType: "product",
        charCount: 500,
        wordCount: 80,
        processingTime: 120,
        provider: "openai",
        confidence: 0.95,
      });
      trackTranslation("shop1", "s2", {
        sourceLocale: "en",
        targetLocale: "ar",
        contentType: "page",
        charCount: 300,
        wordCount: 50,
        processingTime: 80,
        provider: "deepl",
        confidence: 0.92,
      });
      trackTranslation("shop1", "s3", {
        sourceLocale: "en",
        targetLocale: "he",
        contentType: "product",
        charCount: 200,
        wordCount: 30,
        processingTime: 60,
        provider: "google",
        confidence: 0.88,
      });

      const volume = getTranslationVolumeByLanguage();
      expect(volume["ar"].count).toBe(2);
      expect(volume["ar"].chars).toBe(800);
      expect(volume["ar"].words).toBe(130);
      expect(volume["he"].count).toBe(1);
      expect(volume["he"].chars).toBe(200);
    });

    it("returns empty object when no translations", () => {
      const volume = getTranslationVolumeByLanguage();
      expect(Object.keys(volume)).toHaveLength(0);
    });
  });

  describe("getAIConfidenceMetrics", () => {
    it("calculates correct confidence stats", () => {
      trackTranslation("shop1", "s1", {
        sourceLocale: "en", targetLocale: "ar",
        contentType: "product", charCount: 100, wordCount: 20,
        processingTime: 50, provider: "openai", confidence: 0.90,
      });
      trackTranslation("shop1", "s2", {
        sourceLocale: "en", targetLocale: "ar",
        contentType: "product", charCount: 100, wordCount: 20,
        processingTime: 50, provider: "openai", confidence: 0.70,
      });
      trackTranslation("shop1", "s3", {
        sourceLocale: "en", targetLocale: "he",
        contentType: "page", charCount: 100, wordCount: 20,
        processingTime: 50, provider: "deepl", confidence: 1.0,
      });

      const metrics = getAIConfidenceMetrics();
      expect(metrics.count).toBe(3);
      expect(metrics.minConfidence).toBeCloseTo(0.70);
      expect(metrics.maxConfidence).toBeCloseTo(1.0);
      expect(metrics.avgConfidence).toBeCloseTo((0.90 + 0.70 + 1.0) / 3);
    });

    it("returns zeros when no translations exist", () => {
      const metrics = getAIConfidenceMetrics();
      expect(metrics.count).toBe(0);
      expect(metrics.avgConfidence).toBe(0);
      expect(metrics.minConfidence).toBe(0);
      expect(metrics.maxConfidence).toBe(0);
    });
  });

  describe("getConversionMetricsByLanguage", () => {
    it("aggregates conversions by locale with average", () => {
      trackConversion("shop1", "s1", {
        locale: "ar", value: 100, currency: "SAR",
        referrer: "google", userAgent: "test",
      });
      trackConversion("shop1", "s2", {
        locale: "ar", value: 200, currency: "SAR",
        referrer: "google", userAgent: "test",
      });
      trackConversion("shop1", "s3", {
        locale: "he", value: 150, currency: "ILS",
        referrer: "direct", userAgent: "test",
      });

      const metrics = getConversionMetricsByLanguage();
      expect(metrics["ar"].count).toBe(2);
      expect(metrics["ar"].totalValue).toBe(300);
      expect(metrics["ar"].avgValue).toBe(150);
      expect(metrics["he"].count).toBe(1);
      expect(metrics["he"].avgValue).toBe(150);
    });

    it("returns empty for no conversions", () => {
      const metrics = getConversionMetricsByLanguage();
      expect(Object.keys(metrics)).toHaveLength(0);
    });
  });

  describe("event count", () => {
    it("reflects tracked events", () => {
      expect(getEventCount()).toBe(0);
      trackEvent("page_view", "shop1", "s1", {}, "ar");
      trackEvent("page_view", "shop1", "s1", {}, "ar");
      expect(getEventCount()).toBe(2);
    });

    it("clearEvents resets count", () => {
      trackEvent("page_view", "shop1", "s1", {}, "ar");
      clearEvents();
      expect(getEventCount()).toBe(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ANALYTICS / REPORTS
// ═══════════════════════════════════════════════════════════════════════════

describe("Analytics Reports — app.analytics", () => {
  beforeEach(() => {
    clearEvents();
  });

  describe("resolveDateRange", () => {
    const now = new Date("2026-03-23T12:00:00Z");

    it("today preset", () => {
      const range = resolveDateRange({ preset: "today", now });
      expect(range.startDate.getHours()).toBe(0);
      expect(range.endDate.getHours()).toBe(23);
    });

    it("last7Days preset", () => {
      const range = resolveDateRange({ preset: "last7Days", now });
      const diffDays = Math.round(
        (range.endDate.getTime() - range.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      // Start is 6 days ago at 00:00, end is today at 23:59:59 => ~7 day span
      expect(diffDays).toBeGreaterThanOrEqual(6);
      expect(diffDays).toBeLessThanOrEqual(7);
    });

    it("last30Days preset", () => {
      const range = resolveDateRange({ preset: "last30Days", now });
      const diffDays = Math.round(
        (range.endDate.getTime() - range.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      // Start is 29 days ago at 00:00, end is today at 23:59:59 => ~30 day span
      expect(diffDays).toBeGreaterThanOrEqual(29);
      expect(diffDays).toBeLessThanOrEqual(30);
    });

    it("custom preset requires dates", () => {
      expect(() => resolveDateRange({ preset: "custom" })).toThrow("startDate and endDate");
    });

    it("custom preset rejects start > end", () => {
      expect(() =>
        resolveDateRange({
          preset: "custom",
          startDate: new Date("2026-04-01"),
          endDate: new Date("2026-03-01"),
        })
      ).toThrow("before or equal");
    });

    it("custom preset works with valid dates", () => {
      const range = resolveDateRange({
        preset: "custom",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-01-31"),
      });
      expect(range.startDate.getFullYear()).toBe(2026);
    });
  });

  describe("generateTranslationReport", () => {
    it("generates report with tracked translations", () => {
      trackTranslation("shop1", "s1", {
        sourceLocale: "en", targetLocale: "ar",
        contentType: "product", charCount: 500, wordCount: 80,
        processingTime: 100, provider: "openai", confidence: 0.95,
      });

      // Use a date range close to "now" so retention pruning doesn't discard events
      const now = new Date();
      const config: ReportConfig = {
        startDate: new Date(now.getTime() - 60 * 1000),
        endDate: new Date(now.getTime() + 60 * 1000),
      };

      const report = generateTranslationReport(config);
      expect(report.totalTranslations).toBe(1);
      expect(report.byLanguage["ar"].count).toBe(1);
      expect(report.byLanguage["ar"].chars).toBe(500);
      expect(report.avgProcessingTime).toBe(100);
      expect(report.aiConfidence.avg).toBeCloseTo(0.95);
    });

    it("generates empty report when no data", () => {
      const now = new Date();
      const config: ReportConfig = {
        startDate: new Date(now.getTime() - 60 * 1000),
        endDate: new Date(now.getTime() + 60 * 1000),
      };

      const report = generateTranslationReport(config);
      expect(report.totalTranslations).toBe(0);
      expect(report.avgProcessingTime).toBe(0);
    });
  });

  describe("generateConversionReport", () => {
    it("calculates conversion rate from page views", () => {
      const now = new Date();
      trackConversion("shop1", "s1", {
        locale: "ar", value: 100, currency: "SAR",
        referrer: "google", userAgent: "test",
      });

      const config: ReportConfig = {
        startDate: new Date(now.getTime() - 60 * 1000),
        endDate: new Date(now.getTime() + 60 * 1000),
      };

      // Provide mock page views
      const pageViews = Array.from({ length: 10 }, (_, i) => ({
        id: `pv_${i}`,
        type: "page_view" as const,
        timestamp: now,
        shopId: "shop1",
        sessionId: `s${i}`,
        locale: "ar",
        metadata: {},
      }));

      const report = generateConversionReport(config, pageViews);
      expect(report.totalConversions).toBe(1);
      expect(report.totalRevenue).toBe(100);
      expect(report.conversionRate).toBe(10); // 1/10 * 100
    });

    it("handles zero page views (no division by zero)", () => {
      const now = new Date();
      const config: ReportConfig = {
        startDate: new Date(now.getTime() - 60 * 1000),
        endDate: new Date(now.getTime() + 60 * 1000),
      };

      const report = generateConversionReport(config, []);
      expect(report.conversionRate).toBe(0);
      expect(report.totalConversions).toBe(0);
    });
  });

  describe("generateCoverageReport", () => {
    it("calculates overall and per-language coverage", () => {
      const now = new Date();
      const config: ReportConfig = {
        startDate: new Date(now.getTime() - 60 * 1000),
        endDate: new Date(now.getTime() + 60 * 1000),
      };

      const contentStats = {
        ar: { total: 100, translated: 80 },
        he: { total: 100, translated: 50 },
      };

      const report = generateCoverageReport(config, contentStats);
      expect(report.byLanguage["ar"].coverage).toBe(80);
      expect(report.byLanguage["he"].coverage).toBe(50);
      expect(report.overallCoverage).toBeCloseTo(65); // (80+50)/(100+100)*100
    });

    it("handles zero total content", () => {
      const now = new Date();
      const config: ReportConfig = {
        startDate: new Date(now.getTime() - 60 * 1000),
        endDate: new Date(now.getTime() + 60 * 1000),
      };

      const report = generateCoverageReport(config, {
        ar: { total: 0, translated: 0 },
      });
      expect(report.byLanguage["ar"].coverage).toBe(0);
      expect(report.overallCoverage).toBe(0);
    });

    it("filters by locales if specified", () => {
      const now = new Date();
      const config: ReportConfig = {
        startDate: new Date(now.getTime() - 60 * 1000),
        endDate: new Date(now.getTime() + 60 * 1000),
        locales: ["ar"],
      };

      const contentStats = {
        ar: { total: 100, translated: 80 },
        he: { total: 100, translated: 50 },
      };

      const report = generateCoverageReport(config, contentStats);
      expect(report.byLanguage["ar"]).toBeDefined();
      expect(report.byLanguage["he"]).toBeUndefined();
    });
  });

  describe("generateROIReport", () => {
    it("calculates ROI correctly", () => {
      trackConversion("shop1", "s1", {
        locale: "ar", value: 5000, currency: "SAR",
        referrer: "google", userAgent: "test",
      });

      const now = new Date();
      const config: ReportConfig = {
        startDate: new Date(now.getTime() - 60 * 1000),
        endDate: new Date(now.getTime() + 60 * 1000),
      };

      const costs = { ar: 1000 };
      const report = generateROIReport(config, costs);
      expect(report.translationCost).toBe(1000);
      expect(report.additionalRevenue).toBe(5000);
      expect(report.roi).toBe(400); // (5000-1000)/1000 * 100
      expect(report.byLanguage["ar"].roi).toBe(400);
    });

    it("handles zero cost (no division by zero)", () => {
      const now = new Date();
      const config: ReportConfig = {
        startDate: new Date(now.getTime() - 60 * 1000),
        endDate: new Date(now.getTime() + 60 * 1000),
      };

      const report = generateROIReport(config, {});
      expect(report.roi).toBe(0);
    });
  });

  describe("exportToCSV", () => {
    it("exports array of objects to CSV format", () => {
      const data = [
        { name: "Arabic", count: 10, coverage: 80 },
        { name: "Hebrew", count: 5, coverage: 50 },
      ];

      const csv = exportToCSV(data);
      const lines = csv.split("\n");
      expect(lines[0]).toBe("name,count,coverage");
      expect(lines[1]).toBe("Arabic,10,80");
      expect(lines[2]).toBe("Hebrew,5,50");
    });

    it("returns empty string for empty array", () => {
      expect(exportToCSV([])).toBe("");
    });

    it("handles commas in values by replacing with semicolons", () => {
      const data = [{ text: "hello, world" }];
      const csv = exportToCSV(data);
      expect(csv).toContain("hello; world");
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// AI USAGE (app.ai-usage)
// ═══════════════════════════════════════════════════════════════════════════

describe("AI Usage — app.ai-usage", () => {
  beforeEach(() => {
    clearAIUsageData();
  });

  describe("calculateCost", () => {
    it("calculates OpenAI cost: $0.02 per 1K chars", () => {
      expect(calculateCost("openai", 1000)).toBeCloseTo(0.02);
      expect(calculateCost("openai", 5000)).toBeCloseTo(0.10);
    });

    it("calculates DeepL cost: $0.025 per 1K chars", () => {
      expect(calculateCost("deepl", 1000)).toBeCloseTo(0.025);
    });

    it("calculates Google cost: $0.01 per 1K chars", () => {
      expect(calculateCost("google", 1000)).toBeCloseTo(0.01);
    });

    it("returns 0 for 0 characters", () => {
      expect(calculateCost("openai", 0)).toBe(0);
    });
  });

  describe("getProviderCostRate", () => {
    it("returns correct rates for all providers", () => {
      expect(getProviderCostRate("openai")).toBe(0.02);
      expect(getProviderCostRate("deepl")).toBe(0.025);
      expect(getProviderCostRate("google")).toBe(0.01);
    });
  });

  describe("trackAIUsage & trackAITranslation", () => {
    it("tracks characters per provider and increments entry count", () => {
      trackAIUsage("openai", 1000, "en", "ar");
      trackAIUsage("deepl", 2000, "en", "he");
      expect(getAIUsageEntryCount()).toBe(2);
    });

    it("trackAITranslation calculates characters from text length", () => {
      const entry = trackAITranslation("openai", "Hello World", "en", "ar");
      expect(entry.characters).toBe(11);
      expect(entry.cost).toBeCloseTo(calculateCost("openai", 11));
    });

    it("entry has correct structure", () => {
      const entry = trackAIUsage("google", 500, "en", "fa", 3);
      expect(entry.provider).toBe("google");
      expect(entry.characters).toBe(500);
      expect(entry.sourceLocale).toBe("en");
      expect(entry.targetLocale).toBe("fa");
      expect(entry.apiCalls).toBe(3);
      expect(entry.id).toMatch(/^ai_/);
    });
  });

  describe("getAIUsageStats", () => {
    it("aggregates stats within period", () => {
      trackAIUsage("openai", 1000, "en", "ar");
      trackAIUsage("deepl", 2000, "en", "ar");
      trackAIUsage("google", 500, "en", "he");

      const stats = getAIUsageStats(widePeriod());
      expect(stats.totalCharacters).toBe(3500);
      expect(stats.totalApiCalls).toBe(3);
      expect(stats.byProvider["openai"].characters).toBe(1000);
      expect(stats.byProvider["deepl"].characters).toBe(2000);
      expect(stats.byProvider["google"].characters).toBe(500);
      expect(stats.byLanguagePair["en-ar"].characters).toBe(3000);
      expect(stats.byLanguagePair["en-he"].characters).toBe(500);
    });

    it("returns zeros for empty period", () => {
      const stats = getAIUsageStats({
        start: new Date("2000-01-01"),
        end: new Date("2000-01-02"),
      });
      expect(stats.totalCharacters).toBe(0);
      expect(stats.totalCost).toBe(0);
    });
  });

  describe("getCostByProvider", () => {
    it("returns sorted by cost descending", () => {
      trackAIUsage("google", 1000, "en", "ar");  // cost: 0.01
      trackAIUsage("deepl", 1000, "en", "ar");   // cost: 0.025
      trackAIUsage("openai", 1000, "en", "ar");  // cost: 0.02

      const breakdown = getCostByProvider();
      expect(breakdown[0].provider).toBe("deepl");
      expect(breakdown[1].provider).toBe("openai");
      expect(breakdown[2].provider).toBe("google");
    });

    it("calculates avgCostPer1KChars", () => {
      trackAIUsage("openai", 2000, "en", "ar");
      const breakdown = getCostByProvider();
      const openai = breakdown.find((b) => b.provider === "openai")!;
      expect(openai.avgCostPer1KChars).toBeCloseTo(0.02);
    });
  });

  describe("getCostForProvider", () => {
    it("returns cost for specific provider", () => {
      trackAIUsage("openai", 5000, "en", "ar");
      trackAIUsage("deepl", 3000, "en", "ar");

      expect(getCostForProvider("openai")).toBeCloseTo(0.10);
      expect(getCostForProvider("deepl")).toBeCloseTo(0.075);
      expect(getCostForProvider("google")).toBe(0);
    });
  });

  describe("getUsageByLanguage", () => {
    it("aggregates by language pair with primary provider", () => {
      trackAIUsage("openai", 3000, "en", "ar");
      trackAIUsage("deepl", 1000, "en", "ar");
      trackAIUsage("google", 2000, "en", "he");

      const usage = getUsageByLanguage();
      const enAr = usage.find((u) => u.targetLocale === "ar")!;
      expect(enAr.characters).toBe(4000);
      expect(enAr.primaryProvider).toBe("openai"); // most chars
      expect(enAr.calls).toBe(2);

      const enHe = usage.find((u) => u.targetLocale === "he")!;
      expect(enHe.characters).toBe(2000);
      expect(enHe.primaryProvider).toBe("google");
    });

    it("sorted by characters descending", () => {
      trackAIUsage("openai", 100, "en", "ar");
      trackAIUsage("openai", 500, "en", "he");

      const usage = getUsageByLanguage();
      expect(usage[0].targetLocale).toBe("he");
      expect(usage[1].targetLocale).toBe("ar");
    });
  });

  describe("getCharactersByEngine & getApiCallCounts", () => {
    it("returns per-provider character counts and call counts", () => {
      trackAIUsage("openai", 1000, "en", "ar", 2);
      trackAIUsage("deepl", 3000, "en", "ar", 1);
      trackAIUsage("openai", 500, "en", "he", 1);

      const chars = getCharactersByEngine();
      expect(chars["openai"]).toBe(1500);
      expect(chars["deepl"]).toBe(3000);
      expect(chars["google"]).toBe(0);

      const calls = getApiCallCounts();
      expect(calls["openai"]).toBe(3);
      expect(calls["deepl"]).toBe(1);
      expect(calls["google"]).toBe(0);
    });
  });

  describe("quota management", () => {
    it("default quota is 1,000,000", () => {
      expect(getCharacterQuota()).toBe(1_000_000);
    });

    it("setCharacterQuota updates the quota", () => {
      setCharacterQuota(500_000);
      expect(getCharacterQuota()).toBe(500_000);
    });

    it("clearAIUsageData resets quota to default", () => {
      setCharacterQuota(123);
      clearAIUsageData();
      expect(getCharacterQuota()).toBe(1_000_000);
    });
  });

  describe("exportAIUsageToCSV", () => {
    it("returns header-only when no entries", () => {
      const csv = exportAIUsageToCSV();
      expect(csv).toContain("timestamp,provider,source_locale");
    });

    it("includes tracked entries", () => {
      trackAIUsage("openai", 1000, "en", "ar");
      const csv = exportAIUsageToCSV();
      const lines = csv.split("\n");
      expect(lines.length).toBe(2); // header + 1 entry
      expect(lines[1]).toContain("openai");
      expect(lines[1]).toContain("en");
      expect(lines[1]).toContain("ar");
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// BILLING (app.billing) — Pure functions only
// ═══════════════════════════════════════════════════════════════════════════

describe("Billing — app.billing", () => {
  describe("formatPriceForShopify", () => {
    it("converts cents to dollars with 2 decimals", () => {
      expect(formatPriceForShopify(0)).toBe("0.00");
      expect(formatPriceForShopify(100)).toBe("1.00");
      expect(formatPriceForShopify(999)).toBe("9.99");
      expect(formatPriceForShopify(1050)).toBe("10.50");
      expect(formatPriceForShopify(2999)).toBe("29.99");
    });

    it("handles large values", () => {
      expect(formatPriceForShopify(99999)).toBe("999.99");
    });

    it("handles single cent", () => {
      expect(formatPriceForShopify(1)).toBe("0.01");
    });
  });

  describe("parsePlanFeatures", () => {
    it("parses valid JSON array", () => {
      const features = parsePlanFeatures('["basic_translation","rtl_support"]');
      expect(features).toEqual(["basic_translation", "rtl_support"]);
    });

    it("returns empty array for invalid JSON", () => {
      expect(parsePlanFeatures("not json")).toEqual([]);
    });

    it("returns empty array for non-array JSON", () => {
      expect(parsePlanFeatures('{"key":"value"}')).toEqual([]);
    });

    it("returns empty array for empty string", () => {
      expect(parsePlanFeatures("")).toEqual([]);
    });
  });

  describe("getTrialDaysRemaining", () => {
    it("returns 0 for null trialEndsAt", () => {
      expect(getTrialDaysRemaining(null)).toBe(0);
    });

    it("returns 0 for past date", () => {
      const past = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      expect(getTrialDaysRemaining(past)).toBe(0);
    });

    it("returns positive days for future date", () => {
      const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const days = getTrialDaysRemaining(future);
      expect(days).toBeGreaterThanOrEqual(7);
      expect(days).toBeLessThanOrEqual(8); // ceil rounding
    });

    it("returns 1 for a date just hours from now", () => {
      const almostExpired = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
      expect(getTrialDaysRemaining(almostExpired)).toBe(1); // ceil
    });
  });

  describe("isTrialExpired", () => {
    it("returns false for non-trial subscriptions", () => {
      expect(isTrialExpired(makeSub({ status: "active" }))).toBe(false);
      expect(isTrialExpired(makeSub({ status: "cancelled" }))).toBe(false);
    });

    it("returns true for trial with null trialEndsAt", () => {
      expect(isTrialExpired(makeSub({ status: "trial", trialEndsAt: null }))).toBe(true);
    });

    it("returns true for expired trial", () => {
      const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(isTrialExpired(makeSub({ status: "trial", trialEndsAt: past }))).toBe(true);
    });

    it("returns false for active trial", () => {
      const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      expect(isTrialExpired(makeSub({ status: "trial", trialEndsAt: future }))).toBe(false);
    });
  });

  describe("isGated", () => {
    it("returns true for null subscription", () => {
      expect(isGated(null)).toBe(true);
    });

    it("returns false for active subscription", () => {
      expect(isGated(makeSub({ status: "active" }))).toBe(false);
    });

    it("returns false for frozen subscription", () => {
      expect(isGated(makeSub({ status: "frozen" }))).toBe(false);
    });

    it("returns true for cancelled subscription", () => {
      expect(isGated(makeSub({ status: "cancelled" }))).toBe(true);
    });

    it("returns true for expired subscription", () => {
      expect(isGated(makeSub({ status: "expired" }))).toBe(true);
    });

    it("returns false for active trial (not expired)", () => {
      const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      expect(isGated(makeSub({ status: "trial", trialEndsAt: future }))).toBe(false);
    });

    it("returns true for expired trial", () => {
      const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(isGated(makeSub({ status: "trial", trialEndsAt: past }))).toBe(true);
    });
  });

  describe("isAdmin", () => {
    afterEach(() => {
      delete process.env.ADMIN_SHOP_IDS;
    });

    it("returns false when ADMIN_SHOP_IDS is not set", () => {
      delete process.env.ADMIN_SHOP_IDS;
      expect(isAdmin("test.myshopify.com")).toBe(false);
    });

    it("returns true when shop is in ADMIN_SHOP_IDS", () => {
      process.env.ADMIN_SHOP_IDS = "admin.myshopify.com,test.myshopify.com";
      expect(isAdmin("test.myshopify.com")).toBe(true);
    });

    it("returns false when shop is not in ADMIN_SHOP_IDS", () => {
      process.env.ADMIN_SHOP_IDS = "admin.myshopify.com";
      expect(isAdmin("test.myshopify.com")).toBe(false);
    });

    it("handles whitespace in ADMIN_SHOP_IDS", () => {
      process.env.ADMIN_SHOP_IDS = " admin.myshopify.com , test.myshopify.com ";
      expect(isAdmin("test.myshopify.com")).toBe(true);
    });

    it("returns false for empty string shop", () => {
      process.env.ADMIN_SHOP_IDS = "admin.myshopify.com";
      expect(isAdmin("")).toBe(false);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

describe("Notifications — app.notifications", () => {
  describe("NOTIFICATION_TEMPLATES", () => {
    it("has expected template count", () => {
      expect(NOTIFICATION_TEMPLATES.length).toBeGreaterThanOrEqual(5);
    });

    it("all templates have required fields", () => {
      for (const tmpl of NOTIFICATION_TEMPLATES) {
        expect(tmpl.id).toBeTruthy();
        expect(tmpl.type).toBeTruthy();
        expect(tmpl.subject).toBeTruthy();
        expect(tmpl.subjectAr).toBeTruthy();
        expect(tmpl.body).toBeTruthy();
        expect(tmpl.bodyAr).toBeTruthy();
        expect(Array.isArray(tmpl.variables)).toBe(true);
      }
    });

    it("templates have unique IDs", () => {
      const ids = NOTIFICATION_TEMPLATES.map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe("buildNotification", () => {
    it("renders English template with variables", () => {
      const result = buildNotification("translation_complete", {
        userName: "John",
        locale: "Arabic",
        resourceType: "product",
        resourceTitle: "Cool Shirt",
        count: "50",
        coverage: "85",
      });

      expect(result.subject).toContain("Arabic");
      expect(result.subject).toContain("product");
      expect(result.body).toContain("John");
      expect(result.body).toContain("50");
      expect(result.body).toContain("85%");
    });

    it("renders Arabic template when locale is ar", () => {
      const result = buildNotification(
        "translation_complete",
        {
          userName: "أحمد",
          locale: "العربية",
          resourceType: "منتج",
          resourceTitle: "قميص",
          count: "50",
          coverage: "85",
        },
        "ar"
      );

      expect(result.subject).toContain("العربية");
      expect(result.body).toContain("أحمد");
    });

    it("throws for unknown template ID", () => {
      expect(() => buildNotification("nonexistent", {})).toThrow("not found");
    });

    it("leaves unreplaced placeholders when variables missing", () => {
      const result = buildNotification("translation_complete", {});
      expect(result.subject).toContain("{{locale}}");
    });
  });

  describe("getNotificationPreferences", () => {
    it("returns preferences for all templates", () => {
      const prefs = getNotificationPreferences("test.myshopify.com");
      const templateIds = NOTIFICATION_TEMPLATES.map((t) => t.id);

      for (const id of templateIds) {
        expect(prefs[id]).toBeDefined();
        expect(prefs[id].email).toBe(true);
        expect(prefs[id].inApp).toBe(true);
      }
    });
  });

  describe("formatEmailHTML", () => {
    it("generates RTL HTML for Arabic locale", () => {
      const html = formatEmailHTML("Test Subject", "Test body line 1\nLine 2", "ar");
      expect(html).toContain('dir="rtl"');
      expect(html).toContain('lang="ar"');
      expect(html).toContain("Noto Naskh Arabic");
      expect(html).toContain("أرسل بواسطة");
    });

    it("generates LTR HTML for English locale", () => {
      const html = formatEmailHTML("Test Subject", "Body text", "en");
      expect(html).toContain('dir="ltr"');
      expect(html).toContain('lang="en"');
      expect(html).toContain("Sent by RTL Storefront");
    });

    it("supports Hebrew as RTL", () => {
      const html = formatEmailHTML("Subject", "Body", "he");
      expect(html).toContain('dir="rtl"');
    });

    it("supports Farsi as RTL", () => {
      const html = formatEmailHTML("Subject", "Body", "fa");
      expect(html).toContain('dir="rtl"');
    });

    it("renders list items when body has dash-prefixed lines", () => {
      const html = formatEmailHTML("Subject", "Intro\n- Item 1\n- Item 2", "en");
      expect(html).toContain("<li>Item 1</li>");
      expect(html).toContain("<li>Item 2</li>");
      expect(html).toContain("<ul");
    });

    it("contains proper HTML structure", () => {
      const html = formatEmailHTML("Subject", "Body", "en");
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("<title>Subject</title>");
      expect(html).toContain("</html>");
    });
  });
});
