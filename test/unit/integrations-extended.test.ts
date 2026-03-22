import { describe, it, expect } from 'vitest';

// T0206/T0207 - Subscription integrations
import {
  FREQUENCY_TRANSLATIONS,
  getFrequencyTranslation,
  getSubscriptionTranslatableFields,
  getRechargeFields,
  getBoldFields,
  validateSubscriptionContent,
  type SubscriptionContent,
} from '../../app/services/integrations/subscriptions';

// T0209/T0210 - Wishlist & Compare integrations
import {
  WISHLIST_TRANSLATIONS,
  COMPARE_TRANSLATIONS,
  getWishlistTranslation,
  getCompareTranslation,
  getWishlistTranslatableFields,
  getCompareTranslatableFields,
} from '../../app/services/integrations/wishlist-compare';

// T0260/T0261/T0262/T0279 - Analytics reports
import {
  resolveDateRange,
  createReportConfigFromDateRange,
  type DateRange,
  type DateRangePreset,
  type DateRangeInput,
} from '../../app/services/analytics/reports';

// T0084 - Floating language switcher
import {
  getFloatingSwitcherConfig,
  getPositionStyles,
  getVisibilityRules,
  getSwitcherLabels,
  getRTLPositionAdjustments,
  getResponsiveOffsets,
  shouldMinimizeOnScroll,
  getMobileOptimizedConfig,
  shouldShowOnMobile,
  getAccessibilityAttributes,
  getBestPositionForLocale,
} from '../../app/services/language-switcher/floating';

// ─── T0206/T0207: Subscription Integration ───

describe('Subscription Integration (T0206 Recharge / T0207 Bold)', () => {
  describe('getFrequencyTranslation', () => {
    it('returns Arabic frequency translations', () => {
      expect(getFrequencyTranslation('daily', 'ar')).toBe('يومي');
      expect(getFrequencyTranslation('weekly', 'ar')).toBe('أسبوعي');
      expect(getFrequencyTranslation('monthly', 'ar')).toBe('شهري');
      expect(getFrequencyTranslation('yearly', 'ar')).toBe('سنوي');
    });

    it('returns Hebrew frequency translations', () => {
      expect(getFrequencyTranslation('daily', 'he')).toBe('יומי');
      expect(getFrequencyTranslation('monthly', 'he')).toBe('חודשי');
    });

    it('falls back to English for unknown locale', () => {
      expect(getFrequencyTranslation('daily', 'fr')).toBe('Daily');
    });

    it('returns raw frequency if key not found', () => {
      expect(getFrequencyTranslation('biweekly', 'en')).toBe('biweekly');
    });

    it('is case-insensitive for frequency key', () => {
      expect(getFrequencyTranslation('DAILY', 'ar')).toBe('يومي');
      expect(getFrequencyTranslation('Monthly', 'en')).toBe('Monthly');
    });
  });

  describe('FREQUENCY_TRANSLATIONS', () => {
    it('has entries for en, ar, he', () => {
      expect(Object.keys(FREQUENCY_TRANSLATIONS)).toEqual(
        expect.arrayContaining(['en', 'ar', 'he']),
      );
    });
  });

  describe('getSubscriptionTranslatableFields', () => {
    it('returns base translatable fields', () => {
      const fields = getSubscriptionTranslatableFields();
      expect(fields).toContain('name');
      expect(fields).toContain('description');
      expect(fields).toContain('frequency');
      expect(fields).toContain('benefits');
      expect(fields).toContain('cancellation_policy');
    });
  });

  describe('getRechargeFields', () => {
    it('extends base fields with Recharge-specific ones', () => {
      const fields = getRechargeFields();
      expect(fields).toContain('subscription_widget_title');
      expect(fields).toContain('delivery_schedule');
      expect(fields).toContain('name'); // inherited
    });
  });

  describe('getBoldFields', () => {
    it('extends base fields with Bold-specific ones', () => {
      const fields = getBoldFields();
      expect(fields).toContain('group_name');
      expect(fields).toContain('discount_text');
      expect(fields).toContain('name'); // inherited
    });
  });

  describe('validateSubscriptionContent', () => {
    const validContent: SubscriptionContent = {
      id: '1',
      platform: 'recharge',
      name: 'Monthly Box',
      description: 'A monthly subscription box',
      frequency: 'monthly',
      locale: 'en',
    };

    it('validates correct content', () => {
      const result = validateSubscriptionContent(validContent);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects missing name', () => {
      const result = validateSubscriptionContent({ ...validContent, name: '' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Subscription name is required');
    });

    it('rejects missing description', () => {
      const result = validateSubscriptionContent({ ...validContent, description: '' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Subscription description is required');
    });

    it('rejects missing frequency', () => {
      const result = validateSubscriptionContent({ ...validContent, frequency: '' });
      expect(result.valid).toBe(false);
    });

    it('rejects invalid platform', () => {
      const result = validateSubscriptionContent({
        ...validContent,
        platform: 'stripe' as any,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Platform must be recharge or bold');
    });

    it('collects multiple errors', () => {
      const result = validateSubscriptionContent({
        ...validContent,
        name: '',
        description: '',
        frequency: '',
      });
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });
  });
});

// ─── T0209/T0210: Wishlist & Compare Integration ───

describe('Wishlist & Compare Integration (T0209 / T0210)', () => {
  describe('getWishlistTranslation', () => {
    it('returns Arabic wishlist translations', () => {
      const ar = getWishlistTranslation('ar');
      expect(ar.buttonText).toBe('أضف إلى المفضلة');
      expect(ar.locale).toBe('ar');
    });

    it('returns Hebrew wishlist translations', () => {
      const he = getWishlistTranslation('he');
      expect(he.buttonText).toBe('הוסף למועדפים');
    });

    it('falls back to English for unknown locale', () => {
      const fallback = getWishlistTranslation('ja');
      expect(fallback.locale).toBe('en');
      expect(fallback.buttonText).toBe('Add to Wishlist');
    });
  });

  describe('getCompareTranslation', () => {
    it('returns Arabic compare translations', () => {
      const ar = getCompareTranslation('ar');
      expect(ar.buttonText).toBe('قارن');
      expect(ar.pageTitle).toBe('مقارنة المنتجات');
    });

    it('returns English compare translations', () => {
      const en = getCompareTranslation('en');
      expect(en.maxItemsMessage).toBe('Maximum 4 products');
    });

    it('falls back to English for unknown locale', () => {
      const fallback = getCompareTranslation('zh');
      expect(fallback.locale).toBe('en');
    });
  });

  describe('WISHLIST_TRANSLATIONS', () => {
    it('has en, ar, he locales', () => {
      expect(WISHLIST_TRANSLATIONS).toHaveProperty('en');
      expect(WISHLIST_TRANSLATIONS).toHaveProperty('ar');
      expect(WISHLIST_TRANSLATIONS).toHaveProperty('he');
    });
  });

  describe('COMPARE_TRANSLATIONS', () => {
    it('has en, ar, he locales', () => {
      expect(COMPARE_TRANSLATIONS).toHaveProperty('en');
      expect(COMPARE_TRANSLATIONS).toHaveProperty('ar');
      expect(COMPARE_TRANSLATIONS).toHaveProperty('he');
    });
  });

  describe('getWishlistTranslatableFields', () => {
    it('includes expected fields', () => {
      const fields = getWishlistTranslatableFields();
      expect(fields).toContain('buttonText');
      expect(fields).toContain('emptyMessage');
      expect(fields).toContain('shareText');
      expect(fields).toContain('removeText');
      expect(fields).toContain('addedNotification');
      expect(fields.length).toBe(6);
    });
  });

  describe('getCompareTranslatableFields', () => {
    it('includes expected fields', () => {
      const fields = getCompareTranslatableFields();
      expect(fields).toContain('buttonText');
      expect(fields).toContain('pageTitle');
      expect(fields).toContain('featureLabel');
      expect(fields).toContain('differenceLabel');
      expect(fields.length).toBe(6);
    });
  });
});

// ─── T0260/T0261/T0262/T0279: Analytics Reports ───

describe('Analytics Reports (T0260/T0261/T0262/T0279)', () => {
  const fixedNow = new Date('2026-03-15T12:00:00Z');

  describe('resolveDateRange', () => {
    it('resolves "today" preset', () => {
      const range = resolveDateRange({ preset: 'today', now: fixedNow });
      expect(range.startDate.getDate()).toBe(fixedNow.getDate());
      expect(range.endDate.getDate()).toBe(fixedNow.getDate());
    });

    it('resolves "last7Days" preset', () => {
      const range = resolveDateRange({ preset: 'last7Days', now: fixedNow });
      const diffMs = range.endDate.getTime() - range.startDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      expect(diffDays).toBeGreaterThanOrEqual(6);
    });

    it('resolves "last30Days" preset', () => {
      const range = resolveDateRange({ preset: 'last30Days', now: fixedNow });
      const diffMs = range.endDate.getTime() - range.startDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      expect(diffDays).toBeGreaterThanOrEqual(29);
    });

    it('resolves "monthToDate" preset', () => {
      const range = resolveDateRange({ preset: 'monthToDate', now: fixedNow });
      expect(range.startDate.getDate()).toBe(1);
      expect(range.startDate.getMonth()).toBe(fixedNow.getMonth());
    });

    it('resolves custom date range', () => {
      const start = new Date('2026-01-01');
      const end = new Date('2026-01-31');
      const range = resolveDateRange({ preset: 'custom', startDate: start, endDate: end });
      expect(range.startDate.getTime()).toBe(start.getTime());
      expect(range.endDate.getTime()).toBe(end.getTime());
    });

    it('throws for custom without dates', () => {
      expect(() => resolveDateRange({ preset: 'custom' })).toThrow(
        'Custom date range requires startDate and endDate',
      );
    });

    it('throws for custom with inverted dates', () => {
      expect(() =>
        resolveDateRange({
          preset: 'custom',
          startDate: new Date('2026-02-01'),
          endDate: new Date('2026-01-01'),
        }),
      ).toThrow('startDate must be before or equal to endDate');
    });
  });

  describe('createReportConfigFromDateRange', () => {
    it('creates config from preset', () => {
      const config = createReportConfigFromDateRange({ preset: 'today', now: fixedNow });
      expect(config).toHaveProperty('startDate');
      expect(config).toHaveProperty('endDate');
    });

    it('includes optional locales and metrics', () => {
      const config = createReportConfigFromDateRange(
        { preset: 'last7Days', now: fixedNow },
        { locales: ['ar', 'he'], metrics: ['volume'] },
      );
      expect(config.locales).toEqual(['ar', 'he']);
      expect(config.metrics).toEqual(['volume']);
    });
  });
});

// ─── T0084: Floating Language Switcher Widget ───

describe('Floating Language Switcher (T0084)', () => {
  describe('getFloatingSwitcherConfig', () => {
    it('returns default config for LTR locale', () => {
      const config = getFloatingSwitcherConfig('en');
      expect(config.position).toBeDefined();
      expect(config.visibility).toBeDefined();
      expect(config.zIndex).toBeGreaterThan(0);
    });

    it('flips position for RTL locale (ar)', () => {
      const ltrConfig = getFloatingSwitcherConfig('en');
      const rtlConfig = getFloatingSwitcherConfig('ar');
      // RTL should mirror horizontal position
      if (ltrConfig.position === 'bottom-right') {
        expect(rtlConfig.position).toBe('bottom-left');
      } else if (ltrConfig.position === 'bottom-left') {
        expect(rtlConfig.position).toBe('bottom-right');
      }
    });

    it('applies overrides', () => {
      const config = getFloatingSwitcherConfig('en', { compact: true, zIndex: 5000 });
      expect(config.compact).toBe(true);
      expect(config.zIndex).toBe(5000);
    });
  });

  describe('getPositionStyles', () => {
    it('returns desktop, mobile, and tablet styles', () => {
      const styles = getPositionStyles('bottom-right');
      expect(styles).toHaveProperty('desktop');
      expect(styles).toHaveProperty('mobile');
      expect(styles).toHaveProperty('tablet');
      expect(styles.desktop.position).toBe('fixed');
    });

    it('applies custom offsets', () => {
      const styles = getPositionStyles('bottom-right', 20, 30);
      expect(styles.desktop.bottom).toBe('30px');
      expect(styles.desktop.right).toBe('20px');
    });
  });

  describe('getVisibilityRules', () => {
    it('returns correct rules for "always"', () => {
      const rules = getVisibilityRules('always');
      expect(rules.followScroll).toBe(false);
      expect(rules.autoHide).toBe(false);
    });

    it('returns correct rules for "hover"', () => {
      const rules = getVisibilityRules('hover');
      expect(rules.expandOnHover).toBe(true);
      expect(rules.autoHide).toBe(true);
      expect(rules.hideDelay).toBeGreaterThan(0);
    });

    it('returns correct rules for "minimize-on-scroll"', () => {
      const rules = getVisibilityRules('minimize-on-scroll');
      expect(rules.followScroll).toBe(true);
      expect(rules.minimizeOnScroll).toBe(true);
    });
  });

  describe('getSwitcherLabels', () => {
    it('returns English labels', () => {
      const labels = getSwitcherLabels('en');
      expect(labels.selectLanguage).toBeDefined();
      expect(labels.minimize).toBeDefined();
    });

    it('returns Arabic labels', () => {
      const labels = getSwitcherLabels('ar');
      expect(labels.selectLanguage).toBeDefined();
    });

    it('falls back to English for unknown locale', () => {
      const labels = getSwitcherLabels('xx');
      const enLabels = getSwitcherLabels('en');
      expect(labels.selectLanguage).toBe(enLabels.selectLanguage);
    });
  });

  describe('getRTLPositionAdjustments', () => {
    it('returns flip adjustments for RTL', () => {
      const adj = getRTLPositionAdjustments(true);
      expect(adj.flipHorizontal).toBe(true);
      expect(adj.mirrorOffsets).toBe(true);
      expect(adj.adjustTextAlign).toBe(true);
    });

    it('returns no adjustments for LTR', () => {
      const adj = getRTLPositionAdjustments(false);
      expect(adj.flipHorizontal).toBe(false);
      expect(adj.mirrorOffsets).toBe(false);
    });
  });

  describe('getResponsiveOffsets', () => {
    it('returns reduced offsets for mobile viewport', () => {
      const offsets = getResponsiveOffsets(400, 20, 20);
      expect(offsets.offsetX).toBeLessThan(20);
      expect(offsets.offsetY).toBeLessThan(20);
    });

    it('returns original offsets for desktop viewport', () => {
      const offsets = getResponsiveOffsets(1200, 20, 20);
      expect(offsets.offsetX).toBe(20);
      expect(offsets.offsetY).toBe(20);
    });

    it('returns intermediate offsets for tablet viewport', () => {
      const offsets = getResponsiveOffsets(900, 20, 20);
      expect(offsets.offsetX).toBe(15); // 20 * 0.75
      expect(offsets.offsetY).toBe(15);
    });
  });

  describe('shouldMinimizeOnScroll', () => {
    it('minimizes when scrolled past threshold', () => {
      expect(shouldMinimizeOnScroll(500, 300, false)).toBe(true);
    });

    it('stays minimized when still scrolled', () => {
      expect(shouldMinimizeOnScroll(400, 300, true)).toBe(true);
    });

    it('expands when scrolled back near top', () => {
      expect(shouldMinimizeOnScroll(100, 300, true)).toBe(false);
    });

    it('stays expanded when not past threshold', () => {
      expect(shouldMinimizeOnScroll(100, 300, false)).toBe(false);
    });
  });

  describe('getMobileOptimizedConfig', () => {
    it('sets compact mode and reduces offsets', () => {
      const base = getFloatingSwitcherConfig('en');
      const mobile = getMobileOptimizedConfig(base);
      expect(mobile.compact).toBe(true);
      expect(mobile.showNativeNames).toBe(false);
      expect(mobile.offsetX).toBeLessThanOrEqual(base.offsetX);
    });
  });

  describe('shouldShowOnMobile', () => {
    it('always shows on desktop', () => {
      expect(shouldShowOnMobile(false, false)).toBe(true);
    });

    it('shows on mobile when optimized', () => {
      expect(shouldShowOnMobile(true, true)).toBe(true);
    });

    it('hides on mobile when not optimized', () => {
      expect(shouldShowOnMobile(true, false)).toBe(false);
    });
  });

  describe('getAccessibilityAttributes', () => {
    it('returns correct attributes when expanded', () => {
      const labels = getSwitcherLabels('en');
      const attrs = getAccessibilityAttributes(labels, true);
      expect(attrs.role).toBe('button');
      expect(attrs['aria-expanded']).toBe('true');
      expect(attrs['aria-label']).toBe(labels.minimize);
    });

    it('returns correct attributes when collapsed', () => {
      const labels = getSwitcherLabels('en');
      const attrs = getAccessibilityAttributes(labels, false);
      expect(attrs['aria-expanded']).toBe('false');
      expect(attrs['aria-label']).toBe(labels.expand);
    });
  });

  describe('getBestPositionForLocale', () => {
    it('flips position for RTL locale', () => {
      expect(getBestPositionForLocale('bottom-right', 'ar')).toBe('bottom-left');
    });

    it('keeps position for LTR locale', () => {
      expect(getBestPositionForLocale('bottom-right', 'en')).toBe('bottom-right');
    });
  });
});
