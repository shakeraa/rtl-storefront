import { describe, it, expect } from 'vitest';
import {
  createUntranslatedAlert,
  createNewContentAlert,
  createCoverageDropAlert,
  buildAlertSummary,
  filterAlerts,
  getDefaultAlertConfig,
} from '../../app/services/alerts';
import type { TranslationAlert } from '../../app/services/alerts';

describe('createUntranslatedAlert', () => {
  it('returns severity "critical" for 60 items', () => {
    const alert = createUntranslatedAlert('shop1', 'ar', 60);
    expect(alert).not.toBeNull();
    expect(alert!.severity).toBe('critical');
    expect(alert!.category).toBe('untranslated');
    expect(alert!.count).toBe(60);
  });

  it('returns severity "warning" for 20 items', () => {
    const alert = createUntranslatedAlert('shop1', 'ar', 20);
    expect(alert).not.toBeNull();
    expect(alert!.severity).toBe('warning');
  });

  it('returns severity "info" for 5 items', () => {
    const alert = createUntranslatedAlert('shop1', 'ar', 5);
    expect(alert).not.toBeNull();
    expect(alert!.severity).toBe('info');
  });

  it('returns null for 0 items', () => {
    const alert = createUntranslatedAlert('shop1', 'ar', 0);
    expect(alert).toBeNull();
  });

  it('sets correct shop and locale', () => {
    const alert = createUntranslatedAlert('myshop', 'he', 15);
    expect(alert!.shop).toBe('myshop');
    expect(alert!.locale).toBe('he');
  });
});

describe('createNewContentAlert', () => {
  it('returns info alert with resource details', () => {
    const alert = createNewContentAlert('shop1', 'ar', 'product', 'prod-123', 'Blue T-Shirt');
    expect(alert.severity).toBe('info');
    expect(alert.category).toBe('new_content');
    expect(alert.resourceType).toBe('product');
    expect(alert.resourceId).toBe('prod-123');
    expect(alert.title).toContain('Blue T-Shirt');
    expect(alert.locale).toBe('ar');
  });

  it('is not dismissed by default', () => {
    const alert = createNewContentAlert('shop1', 'ar', 'page', 'p-1', 'About Us');
    expect(alert.dismissed).toBe(false);
  });
});

describe('createCoverageDropAlert', () => {
  it('returns warning alert when drop >= threshold but < 2x threshold', () => {
    const alert = createCoverageDropAlert('shop1', 'ar', 80, 74);
    expect(alert).not.toBeNull();
    // drop is 6, threshold is 5, 2x threshold is 10 -> warning
    expect(alert!.severity).toBe('warning');
    expect(alert!.category).toBe('coverage_drop');
  });

  it('returns critical when drop >= 2x threshold', () => {
    const alert = createCoverageDropAlert('shop1', 'ar', 80, 70);
    expect(alert).not.toBeNull();
    // drop is 12, threshold is 5, 2x threshold is 10 -> critical
    expect(alert!.severity).toBe('critical');
  });

  it('returns null when drop < threshold', () => {
    const alert = createCoverageDropAlert('shop1', 'ar', 80, 78);
    expect(alert).toBeNull();
  });

  it('returns null when coverage increased', () => {
    const alert = createCoverageDropAlert('shop1', 'ar', 70, 80);
    expect(alert).toBeNull();
  });
});

describe('buildAlertSummary', () => {
  const makeAlert = (severity: 'critical' | 'warning' | 'info', category: 'untranslated' | 'new_content', locale: string, dismissed = false): TranslationAlert => ({
    id: `test-${Math.random()}`,
    shop: 'shop1',
    category,
    severity,
    title: 'Test alert',
    message: 'Test message',
    locale,
    dismissed,
    createdAt: new Date(),
  });

  it('counts by severity and category correctly', () => {
    const alerts = [
      makeAlert('critical', 'untranslated', 'ar'),
      makeAlert('warning', 'untranslated', 'ar'),
      makeAlert('info', 'new_content', 'he'),
    ];
    const summary = buildAlertSummary(alerts);
    expect(summary.total).toBe(3);
    expect(summary.critical).toBe(1);
    expect(summary.warning).toBe(1);
    expect(summary.info).toBe(1);
    expect(summary.byCategory.untranslated).toBe(2);
    expect(summary.byCategory.new_content).toBe(1);
  });

  it('excludes dismissed alerts from the summary', () => {
    const alerts = [
      makeAlert('critical', 'untranslated', 'ar'),
      makeAlert('warning', 'untranslated', 'ar', true), // dismissed
    ];
    const summary = buildAlertSummary(alerts);
    expect(summary.total).toBe(1);
    expect(summary.warning).toBe(0);
  });

  it('counts by locale', () => {
    const alerts = [
      makeAlert('info', 'new_content', 'ar'),
      makeAlert('info', 'new_content', 'ar'),
      makeAlert('info', 'new_content', 'he'),
    ];
    const summary = buildAlertSummary(alerts);
    expect(summary.byLocale['ar']).toBe(2);
    expect(summary.byLocale['he']).toBe(1);
  });
});

describe('filterAlerts', () => {
  const makeAlert = (severity: 'critical' | 'warning' | 'info', category: 'untranslated' | 'new_content', locale: string, dismissed = false): TranslationAlert => ({
    id: `test-${Math.random()}`,
    shop: 'shop1',
    category,
    severity,
    title: 'Test',
    message: 'Test',
    locale,
    dismissed,
    createdAt: new Date(),
  });

  it('filters by severity', () => {
    const alerts = [
      makeAlert('critical', 'untranslated', 'ar'),
      makeAlert('info', 'new_content', 'ar'),
    ];
    const result = filterAlerts(alerts, { severity: 'critical' });
    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe('critical');
  });

  it('filters by category', () => {
    const alerts = [
      makeAlert('info', 'untranslated', 'ar'),
      makeAlert('info', 'new_content', 'he'),
    ];
    const result = filterAlerts(alerts, { category: 'new_content' });
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('new_content');
  });

  it('excludes dismissed alerts by default', () => {
    const alerts = [
      makeAlert('critical', 'untranslated', 'ar', true),
      makeAlert('info', 'new_content', 'ar'),
    ];
    const result = filterAlerts(alerts, {});
    expect(result).toHaveLength(1);
  });

  it('includes dismissed when includeDismissed is true', () => {
    const alerts = [
      makeAlert('critical', 'untranslated', 'ar', true),
      makeAlert('info', 'new_content', 'ar'),
    ];
    const result = filterAlerts(alerts, { includeDismissed: true });
    expect(result).toHaveLength(2);
  });
});

describe('getDefaultAlertConfig', () => {
  it('returns config with expected thresholds', () => {
    const config = getDefaultAlertConfig('myshop');
    expect(config.shop).toBe('myshop');
    expect(config.enableInApp).toBe(true);
    expect(config.enableEmail).toBe(false);
    expect(config.emailDigestFrequency).toBe('weekly');
    expect(config.thresholds.untranslatedCritical).toBe(50);
    expect(config.thresholds.untranslatedWarning).toBe(10);
    expect(config.thresholds.coverageDropPercent).toBe(5);
    expect(config.thresholds.staleTranslationDays).toBe(90);
  });
});
