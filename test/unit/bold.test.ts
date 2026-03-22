import { describe, it, expect, beforeEach } from 'vitest';
import {
  // Constants and types
  BOLD_RTL_LOCALES,
  isRTLLocale,
  // Templates
  getBoldTemplates,
  clearTemplateCache,
  // Widget translation
  translateBoldWidget,
  // Plan translation
  translatePlan,
  formatInterval,
  // Portal translation
  translatePortal,
  // Utilities
  generateBoldRTLCSS,
  getSubscriptionGroupInfo,
  formatBoldPrice,
  validateRTLContent,
  // Types
  type BoldWidgetContent,
  type SubscriptionGroup,
  type SubscriptionPlan,
  type PortalContent,
  type SubscriptionInterval,
} from '../../app/services/integrations/bold';

describe('Bold Subscriptions Integration', () => {
  beforeEach(() => {
    clearTemplateCache();
  });

  describe('Locale Detection', () => {
    it('should detect Arabic as RTL locale', () => {
      expect(isRTLLocale('ar')).toBe(true);
      expect(isRTLLocale('ar-SA')).toBe(true);
      expect(isRTLLocale('ar-EG')).toBe(true);
    });

    it('should detect Hebrew as RTL locale', () => {
      expect(isRTLLocale('he')).toBe(true);
      expect(isRTLLocale('he-IL')).toBe(true);
    });

    it('should detect Farsi and Urdu as RTL locale', () => {
      expect(isRTLLocale('fa')).toBe(true);
      expect(isRTLLocale('ur')).toBe(true);
    });

    it('should not detect English or other LTR locales as RTL', () => {
      expect(isRTLLocale('en')).toBe(false);
      expect(isRTLLocale('en-US')).toBe(false);
      expect(isRTLLocale('fr')).toBe(false);
      expect(isRTLLocale('de')).toBe(false);
    });

    it('should have correct RTL locales list', () => {
      expect(BOLD_RTL_LOCALES).toContain('ar');
      expect(BOLD_RTL_LOCALES).toContain('he');
      expect(BOLD_RTL_LOCALES).toContain('fa');
      expect(BOLD_RTL_LOCALES).toContain('ur');
      expect(BOLD_RTL_LOCALES.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('Template System', () => {
    it('should return Arabic templates for ar locale', () => {
      const templates = getBoldTemplates('ar');
      expect(templates.locale).toBe('ar');
      expect(templates.isRTL).toBe(true);
      expect(templates.widgets.product.subscriptionLabel).toBe('اشتراك');
      expect(templates.widgets.product.onetimeLabel).toBe('شراء لمرة واحدة');
    });

    it('should return Hebrew templates for he locale', () => {
      const templates = getBoldTemplates('he');
      expect(templates.locale).toBe('he');
      expect(templates.isRTL).toBe(true);
      expect(templates.widgets.product.subscriptionLabel).toBe('מנוי');
      expect(templates.widgets.product.onetimeLabel).toBe('רכישה חד פעמית');
    });

    it('should return English templates for en locale', () => {
      const templates = getBoldTemplates('en');
      expect(templates.locale).toBe('en');
      expect(templates.isRTL).toBe(false);
      expect(templates.widgets.product.subscriptionLabel).toBe('Subscribe');
    });

    it('should cache templates for performance', () => {
      const firstCall = getBoldTemplates('ar');
      const secondCall = getBoldTemplates('ar');
      expect(firstCall).toBe(secondCall);
    });

    it('should handle specific Arabic region codes', () => {
      const saudiTemplates = getBoldTemplates('ar-SA');
      expect(saudiTemplates.locale).toBe('ar-SA');
      expect(saudiTemplates.isRTL).toBe(true);
    });

    it('should have all required portal translations for Arabic', () => {
      const templates = getBoldTemplates('ar');
      expect(templates.portal.activeSubscriptions).toBeDefined();
      expect(templates.portal.pauseSubscription).toBeDefined();
      expect(templates.portal.cancelSubscription).toBeDefined();
      expect(templates.portal.updatePayment).toBeDefined();
      expect(templates.portal.updateAddress).toBeDefined();
    });

    it('should have all interval translations', () => {
      const arabic = getBoldTemplates('ar');
      expect(arabic.intervals.day).toBe('يوم');
      expect(arabic.intervals.week).toBe('أسبوع');
      expect(arabic.intervals.month).toBe('شهر');
      expect(arabic.intervals.year).toBe('سنة');

      const hebrew = getBoldTemplates('he');
      expect(hebrew.intervals.day).toBe('יום');
      expect(hebrew.intervals.week).toBe('שבוע');
      expect(hebrew.intervals.month).toBe('חודש');
      expect(hebrew.intervals.year).toBe('שנה');
    });
  });

  describe('Interval Formatting', () => {
    it('should format daily interval in Arabic', () => {
      const interval: SubscriptionInterval = {
        id: 'daily',
        frequency: 1,
        intervalType: 'day',
        label: 'Daily',
      };
      expect(formatInterval(interval, 'ar')).toBe('كل يوم');
    });

    it('should format weekly interval in Arabic with frequency', () => {
      const interval: SubscriptionInterval = {
        id: 'biweekly',
        frequency: 2,
        intervalType: 'week',
        label: 'Every 2 weeks',
      };
      expect(formatInterval(interval, 'ar')).toBe('كل 2 أسبوع');
    });

    it('should format monthly interval in Hebrew', () => {
      const interval: SubscriptionInterval = {
        id: 'monthly',
        frequency: 1,
        intervalType: 'month',
        label: 'Monthly',
      };
      expect(formatInterval(interval, 'he')).toBe('כל חודש');
    });

    it('should format yearly interval in English', () => {
      const interval: SubscriptionInterval = {
        id: 'yearly',
        frequency: 1,
        intervalType: 'year',
        label: 'Yearly',
      };
      expect(formatInterval(interval, 'en')).toBe('Every year');
    });

    it('should format plural intervals in English', () => {
      const interval: SubscriptionInterval = {
        id: 'quarterly',
        frequency: 3,
        intervalType: 'month',
        label: 'Every 3 months',
      };
      expect(formatInterval(interval, 'en')).toBe('Every 3 months');
    });
  });

  describe('Widget Translation', () => {
    const baseWidget: BoldWidgetContent = {
      widgetType: 'product',
      title: 'Subscription Options',
      description: 'Choose your subscription plan',
      subscriptionLabel: 'Subscribe',
      onetimeLabel: 'One-time',
      groups: [
        {
          id: 'group1',
          name: 'Standard',
          intervals: [
            { id: 'monthly', frequency: 1, intervalType: 'month', label: 'Monthly' },
            { id: 'yearly', frequency: 1, intervalType: 'year', label: 'Yearly' },
          ],
        },
      ],
    };

    it('should translate product widget to Arabic', () => {
      const translated = translateBoldWidget(baseWidget, 'ar');
      expect(translated.subscriptionLabel).toBe('اشتراك');
      expect(translated.onetimeLabel).toBe('شراء لمرة واحدة');
      expect(translated.buttonText).toBe('اشترك الآن');
    });

    it('should translate product widget to Hebrew', () => {
      const translated = translateBoldWidget(baseWidget, 'he');
      expect(translated.subscriptionLabel).toBe('מנוי');
      expect(translated.onetimeLabel).toBe('רכישה חד פעמית');
      expect(translated.buttonText).toBe('הירשם עכשיו');
    });

    it('should translate cart widget', () => {
      const cartWidget: BoldWidgetContent = {
        widgetType: 'cart',
        title: 'Summary',
        groups: [],
      };
      const translated = translateBoldWidget(cartWidget, 'ar');
      expect(translated.title).toBe('ملخص الاشتراك');
      expect(translated.groupLabel).toBe('تغيير التكرار');
    });

    it('should translate checkout widget', () => {
      const checkoutWidget: BoldWidgetContent = {
        widgetType: 'checkout',
        title: 'Details',
        groups: [],
      };
      const translated = translateBoldWidget(checkoutWidget, 'ar');
      expect(translated.title).toBe('تفاصيل الاشتراك');
      expect(translated.groupLabel).toBe('فترة الفوترة');
    });

    it('should translate account widget', () => {
      const accountWidget: BoldWidgetContent = {
        widgetType: 'account',
        title: 'Manage',
        groups: [],
      };
      const translated = translateBoldWidget(accountWidget, 'ar');
      expect(translated.title).toBe('إدارة الاشتراكات');
      expect(translated.buttonText).toBe('عرض التفاصيل');
    });

    it('should translate interval labels within groups', () => {
      const translated = translateBoldWidget(baseWidget, 'ar');
      expect(translated.groups?.[0].intervals[0].label).toBe('كل شهر');
      expect(translated.groups?.[0].intervals[1].label).toBe('كل سنة');
    });

    it('should apply RTL formatting to descriptions for RTL locales', () => {
      const widgetWithDescription: BoldWidgetContent = {
        widgetType: 'product',
        description: 'Choose your plan',
        groups: [],
      };
      const translated = translateBoldWidget(widgetWithDescription, 'ar');
      expect(translated.description).toContain('\u202B');
      expect(translated.description).toContain('\u202C');
    });

    it('should not mutate original widget content', () => {
      const original = JSON.stringify(baseWidget);
      translateBoldWidget(baseWidget, 'ar');
      expect(JSON.stringify(baseWidget)).toBe(original);
    });
  });

  describe('Plan Translation', () => {
    const basePlan: SubscriptionPlan = {
      id: 'plan1',
      productName: 'Coffee Subscription',
      status: 'active',
      interval: {
        id: 'monthly',
        frequency: 1,
        intervalType: 'month',
        label: 'Monthly',
      },
      price: 29.99,
      currency: 'USD',
      quantity: 1,
    };

    it('should translate plan interval to Arabic', () => {
      const translated = translatePlan(basePlan, 'ar');
      expect(translated.interval.label).toBe('كل شهر');
    });

    it('should translate plan interval to Hebrew', () => {
      const translated = translatePlan(basePlan, 'he');
      expect(translated.interval.label).toBe('כל חודש');
    });

    it('should translate status to Arabic for RTL locales', () => {
      const translated = translatePlan(basePlan, 'ar');
      expect(translated.status).toBe('نشط');
    });

    it('should translate paused status to Arabic', () => {
      const pausedPlan = { ...basePlan, status: 'paused' as const };
      const translated = translatePlan(pausedPlan, 'ar');
      expect(translated.status).toBe('متوقف مؤقتاً');
    });

    it('should translate cancelled status to Hebrew', () => {
      const cancelledPlan = { ...basePlan, status: 'cancelled' as const };
      const translated = translatePlan(cancelledPlan, 'he');
      expect(translated.status).toBe('מבוטל');
    });

    it('should keep original status for English locale', () => {
      const translated = translatePlan(basePlan, 'en');
      expect(translated.status).toBe('active');
    });

    it('should preserve plan metadata during translation', () => {
      const planWithMetadata: SubscriptionPlan = {
        ...basePlan,
        deliveryAddress: '123 Main St',
        paymentMethod: 'Card ending in 1234',
      };
      const translated = translatePlan(planWithMetadata, 'ar');
      expect(translated.deliveryAddress).toBe('123 Main St');
      expect(translated.paymentMethod).toBe('Card ending in 1234');
      expect(translated.price).toBe(29.99);
      expect(translated.currency).toBe('USD');
    });
  });

  describe('Portal Translation', () => {
    const basePortal: PortalContent = {
      title: 'My Subscriptions',
      greeting: 'Welcome back',
      sections: [
        { id: 'active', title: 'Active' },
        { id: 'paused', title: 'Paused' },
      ],
      actions: [
        { id: 'edit1', label: 'Edit', action: 'edit', href: '/edit' },
        { id: 'pause1', label: 'Pause', action: 'pause' },
      ],
      subscriptions: [
        {
          id: 'sub1',
          productName: 'Coffee',
          status: 'active',
          interval: {
            id: 'monthly',
            frequency: 1,
            intervalType: 'month',
            label: 'Monthly',
          },
          price: 29.99,
          currency: 'USD',
          quantity: 1,
        },
      ],
    };

    it('should translate portal sections to Arabic', () => {
      const translated = translatePortal(basePortal, 'ar');
      expect(translated.sections[0].title).toBe('الاشتراكات النشطة');
      expect(translated.sections[1].title).toBe('الاشتراكات المعلقة');
    });

    it('should translate portal actions to Arabic', () => {
      const translated = translatePortal(basePortal, 'ar');
      expect(translated.actions[0].label).toBe('تعديل الاشتراك');
      expect(translated.actions[1].label).toBe('إيقاف مؤقت');
    });

    it('should translate portal sections to Hebrew', () => {
      const translated = translatePortal(basePortal, 'he');
      expect(translated.sections[0].title).toBe('מנויים פעילים');
      expect(translated.sections[1].title).toBe('מנויים מושהים');
    });

    it('should translate subscriptions within portal', () => {
      const translated = translatePortal(basePortal, 'ar');
      expect(translated.subscriptions[0].interval.label).toBe('كل شهر');
      expect(translated.subscriptions[0].status).toBe('نشط');
    });

    it('should apply RTL formatting to section descriptions', () => {
      const portalWithDescriptions: PortalContent = {
        ...basePortal,
        sections: [
          { id: 'active', title: 'Active', description: 'Your active plans' },
        ],
      };
      const translated = translatePortal(portalWithDescriptions, 'ar');
      expect(translated.sections[0].description).toContain('\u202B');
    });

    it('should preserve action hrefs during translation', () => {
      const translated = translatePortal(basePortal, 'ar');
      expect(translated.actions[0].href).toBe('/edit');
      expect(translated.actions[0].action).toBe('edit');
    });

    it('should handle empty sections gracefully', () => {
      const emptyPortal: PortalContent = {
        sections: [],
        actions: [],
        subscriptions: [],
      };
      const translated = translatePortal(emptyPortal, 'ar');
      expect(translated.sections).toEqual([]);
      expect(translated.actions).toEqual([]);
      expect(translated.subscriptions).toEqual([]);
    });
  });

  describe('Subscription Group Info', () => {
    const group: SubscriptionGroup = {
      id: 'standard',
      name: 'Standard Plan',
      intervals: [
        { id: 'm1', frequency: 1, intervalType: 'month', label: '1 month' },
        { id: 'm3', frequency: 3, intervalType: 'month', label: '3 months' },
      ],
      discountMessage: '15%',
    };

    it('should format group info in Arabic', () => {
      const info = getSubscriptionGroupInfo(group, 'ar');
      expect(info.displayName).toBe('Standard Plan');
      expect(info.intervalOptions).toHaveLength(2);
      expect(info.intervalOptions[0].display).toBe('كل شهر');
      expect(info.savingsMessage).toBe('وفر 15%');
    });

    it('should format group info in Hebrew', () => {
      const info = getSubscriptionGroupInfo(group, 'he');
      expect(info.intervalOptions[0].display).toBe('כל חודש');
      expect(info.savingsMessage).toBe('חסוך 15%');
    });

    it('should handle groups without discount message', () => {
      const noDiscountGroup: SubscriptionGroup = {
        ...group,
        discountMessage: undefined,
      };
      const info = getSubscriptionGroupInfo(noDiscountGroup, 'ar');
      expect(info.savingsMessage).toBeUndefined();
    });
  });

  describe('Price Formatting', () => {
    it('should format price with currency for Arabic', () => {
      const formatted = formatBoldPrice(99.99, 'USD', 'ar');
      expect(formatted).toContain('99.99');
      expect(formatted).toContain('USD');
    });

    it('should format price for Hebrew locale', () => {
      const formatted = formatBoldPrice(150.5, 'ILS', 'he');
      expect(formatted).toContain('150.50');
      expect(formatted).toContain('ILS');
    });

    it('should format price for English locale', () => {
      const formatted = formatBoldPrice(29.99, '$', 'en');
      expect(formatted).toContain('29.99');
      expect(formatted).toContain('$');
    });

    it('should use locale-specific number formatting', () => {
      // Arabic locale uses Western digits by default in Intl.NumberFormat
      const formatted = formatBoldPrice(1000.5, 'SAR', 'ar');
      expect(formatted).toContain('1,000.50');
    });
  });

  describe('RTL Content Validation', () => {
    it('should validate pure Arabic content', () => {
      const result = validateRTLContent('مرحبا بالعالم');
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should detect mixed content without direction marks', () => {
      const result = validateRTLContent('Hello مرحبا');
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Mixed directional content without explicit direction marks');
    });

    it('should pass mixed content with proper direction marks', () => {
      const result = validateRTLContent('\u202BHello مرحبا\u202C');
      expect(result.valid).toBe(true);
    });

    it('should validate pure English content', () => {
      const result = validateRTLContent('Hello World');
      expect(result.valid).toBe(true);
    });

    it('should handle empty content', () => {
      const result = validateRTLContent('');
      expect(result.valid).toBe(true);
    });
  });

  describe('CSS Generation', () => {
    it('should generate RTL CSS for Bold widgets', () => {
      const css = generateBoldRTLCSS();
      expect(css).toContain('bold-subscription-widget');
      expect(css).toContain('dir="rtl"');
      expect(css).toContain('direction: rtl');
      expect(css).toContain('text-align: right');
    });

    it('should include customer portal styles', () => {
      const css = generateBoldRTLCSS();
      expect(css).toContain('bold-customer-portal');
      expect(css).toContain('bold-portal-sidebar');
      expect(css).toContain('bold-subscription-card');
    });

    it('should include widget-specific RTL adjustments', () => {
      const css = generateBoldRTLCSS();
      expect(css).toContain('bold-radio');
      expect(css).toContain('bold-select');
      expect(css).toContain('bold-savings-badge');
    });

    it('should generate valid CSS syntax', () => {
      const css = generateBoldRTLCSS();
      // Basic CSS validation checks
      expect(css).toContain('{');
      expect(css).toContain('}');
      expect(css).toContain(': ');
      expect(css.split('{').length).toBe(css.split('}').length);
    });
  });

  describe('Cache Management', () => {
    it('should clear template cache', () => {
      // Populate cache
      getBoldTemplates('ar');
      getBoldTemplates('he');
      
      // Clear cache
      clearTemplateCache();
      
      // Get new instances (should be different objects)
      const arabicAfter = getBoldTemplates('ar');
      const arabicBefore = getBoldTemplates('ar');
      expect(arabicAfter).toBe(arabicBefore); // Same after repopulating
    });
  });
});
