import { describe, it, expect } from 'vitest';
import {
  translateSubscriptionWidget,
  translateNotification,
  translatePortalText,
  getRechargeTemplates,
  formatFrequency,
  getSubscriptionStatusLabel,
  formatSubscriptionPrice,
  RECHARGE_SUPPORTED_LOCALES,
  RECHARGE_DEFAULT_LOCALE,
  type SubscriptionWidgetContent,
  type SubscriptionNotification,
  type PortalText,
  type RechargeLocale,
} from '../../app/services/integrations/recharge';

describe('Recharge Integration', () => {
  describe('Constants', () => {
    it('should export supported locales', () => {
      expect(RECHARGE_SUPPORTED_LOCALES).toContain('ar');
      expect(RECHARGE_SUPPORTED_LOCALES).toContain('he');
      expect(RECHARGE_SUPPORTED_LOCALES).toContain('fa');
      expect(RECHARGE_SUPPORTED_LOCALES).toContain('ur');
      expect(RECHARGE_SUPPORTED_LOCALES).toContain('en');
      expect(RECHARGE_SUPPORTED_LOCALES).toHaveLength(5);
    });

    it('should have English as default locale', () => {
      expect(RECHARGE_DEFAULT_LOCALE).toBe('en');
    });
  });

  describe('translateSubscriptionWidget', () => {
    it('should translate widget content to Arabic', () => {
      const content: SubscriptionWidgetContent = {
        title: 'Subscribe Now',
        description: 'Get regular deliveries',
        frequencyOptions: [
          { value: '1', label: 'Weekly', frequency: 'weekly', interval: 1 },
          { value: '2', label: 'Monthly', frequency: 'monthly', interval: 1 },
        ],
      };

      const result = translateSubscriptionWidget(content, 'ar');
      
      expect(result.subscribeButton).toBe('اشترك ووفر');
      expect(result.oneTimeButton).toBe('شراء لمرة واحدة');
      expect(result.frequencyLabel).toBe('التكرار');
      expect(result.frequencyOptions?.[0].label).toBe('أسبوعياً');
      expect(result.frequencyOptions?.[1].label).toBe('شهرياً');
    });

    it('should translate widget content to Hebrew', () => {
      const content: SubscriptionWidgetContent = {
        title: 'Subscribe',
        frequencyOptions: [
          { value: '1', label: 'Monthly', frequency: 'monthly', interval: 1 },
        ],
      };

      const result = translateSubscriptionWidget(content, 'he');
      
      expect(result.subscribeButton).toBe('הרשם וחסוך');
      expect(result.oneTimeButton).toBe('רכישה חד פעמית');
      expect(result.frequencyOptions?.[0].label).toBe('חודשי');
    });

    it('should translate widget content to Persian (Farsi)', () => {
      const content: SubscriptionWidgetContent = {
        frequencyOptions: [
          { value: '1', label: 'Weekly', frequency: 'weekly', interval: 1 },
          { value: '2', label: 'Daily', frequency: 'daily', interval: 1 },
        ],
      };

      const result = translateSubscriptionWidget(content, 'fa');
      
      expect(result.frequencyOptions?.[0].label).toBe('هفتگی');
      expect(result.frequencyOptions?.[1].label).toBe('روزانه');
    });

    it('should translate widget content to Urdu', () => {
      const content: SubscriptionWidgetContent = {
        frequencyOptions: [
          { value: '1', label: 'Yearly', frequency: 'yearly', interval: 1 },
        ],
      };

      const result = translateSubscriptionWidget(content, 'ur');
      
      expect(result.frequencyOptions?.[0].label).toBe('سالانہ');
    });

    it('should preserve English content when locale is en', () => {
      const content: SubscriptionWidgetContent = {
        title: 'Subscribe',
        frequencyOptions: [
          { value: '1', label: 'Weekly', frequency: 'weekly', interval: 1 },
        ],
      };

      const result = translateSubscriptionWidget(content, 'en');
      
      expect(result.subscribeButton).toBe('Subscribe & Save');
      expect(result.frequencyOptions?.[0].label).toBe('Weekly');
    });

    it('should apply default labels when not provided', () => {
      const content: SubscriptionWidgetContent = {};

      const result = translateSubscriptionWidget(content, 'ar');
      
      expect(result.title).toBe('اشترك ووفر');
      expect(result.frequencyLabel).toBe('التكرار');
      expect(result.deliveryLabel).toBe('توصيل كل');
      expect(result.discountLabel).toBe('وفر حتى');
    });

    it('should handle all frequency types in Arabic', () => {
      const content: SubscriptionWidgetContent = {
        frequencyOptions: [
          { value: '1', label: '', frequency: 'daily', interval: 1 },
          { value: '2', label: '', frequency: 'weekly', interval: 1 },
          { value: '3', label: '', frequency: 'bi_weekly', interval: 1 },
          { value: '4', label: '', frequency: 'monthly', interval: 1 },
          { value: '5', label: '', frequency: 'bi_monthly', interval: 1 },
          { value: '6', label: '', frequency: 'quarterly', interval: 1 },
          { value: '7', label: '', frequency: 'yearly', interval: 1 },
        ],
      };

      const result = translateSubscriptionWidget(content, 'ar');
      
      expect(result.frequencyOptions?.[0].label).toBe('يومياً');
      expect(result.frequencyOptions?.[1].label).toBe('أسبوعياً');
      expect(result.frequencyOptions?.[2].label).toBe('كل أسبوعين');
      expect(result.frequencyOptions?.[3].label).toBe('شهرياً');
      expect(result.frequencyOptions?.[4].label).toBe('كل شهرين');
      expect(result.frequencyOptions?.[5].label).toBe('ربع سنوياً');
      expect(result.frequencyOptions?.[6].label).toBe('سنوياً');
    });
  });

  describe('translateNotification', () => {
    it('should translate subscription created notification to Arabic', () => {
      const notification: SubscriptionNotification = {
        type: 'subscription_created',
        subject: 'Subscription Created',
        body: 'Your subscription has been created',
      };

      const result = translateNotification(notification, 'ar');
      
      expect(result.subject).toBe('تم إنشاء الاشتراك بنجاح');
      expect(result.body).toBeDefined();
      expect(result.actionButton?.text).toBe('عرض التفاصيل');
    });

    it('should translate payment failed notification to Hebrew', () => {
      const notification: SubscriptionNotification = {
        type: 'payment_failed',
        subject: 'Payment Failed',
        body: 'Your payment has failed',
        actionButton: { text: 'Update', url: '/payment' },
      };

      const result = translateNotification(notification, 'he');
      
      expect(result.subject).toBe('התשלום נכשל - יש לעדכן');
      expect(result.actionButton?.text).toBe('עדכן תשלום');
    });

    it('should translate upcoming order notification to Persian', () => {
      const notification: SubscriptionNotification = {
        type: 'upcoming_order',
        subject: 'Upcoming Order',
        body: 'Your next order is coming',
      };

      const result = translateNotification(notification, 'fa');
      
      expect(result.subject).toBe('یادآوری: سفارش بعدی نزدیک است');
      expect(result.body).toBeDefined();
    });

    it('should translate subscription cancelled notification to Urdu', () => {
      const notification: SubscriptionNotification = {
        type: 'subscription_cancelled',
        subject: 'Subscription Cancelled',
        body: 'Your subscription has been cancelled',
      };

      const result = translateNotification(notification, 'ur');
      
      expect(result.subject).toBe('رکنیت منسوخ کر دی گئی');
      expect(result.body).toBeDefined();
    });

    it('should preserve custom preview text when provided', () => {
      const notification: SubscriptionNotification = {
        type: 'subscription_created',
        subject: 'Subject',
        body: 'Body',
        previewText: 'Custom Preview',
      };

      const result = translateNotification(notification, 'ar');
      
      expect(result.previewText).toBe('Custom Preview');
    });

    it('should translate all notification types', () => {
      const types = [
        'subscription_created',
        'subscription_updated',
        'subscription_cancelled',
        'upcoming_order',
        'order_processed',
        'payment_failed',
        'payment_updated',
        'delivery_address_updated',
        'skip_confirmation',
        'swap_confirmation',
      ] as const;

      types.forEach(type => {
        const notification: SubscriptionNotification = {
          type,
          subject: 'Original',
          body: 'Body',
        };

        const result = translateNotification(notification, 'ar');
        
        expect(result.subject).not.toBe('Original');
        expect(result.subject.length).toBeGreaterThan(0);
      });
    });

    it('should set preview text to subject when not provided', () => {
      const notification: SubscriptionNotification = {
        type: 'subscription_created',
        subject: 'Test Subject',
        body: 'Body',
      };

      const result = translateNotification(notification, 'ar');
      
      expect(result.previewText).toBe(result.subject);
    });

    it('should handle notifications without action buttons', () => {
      const notification: SubscriptionNotification = {
        type: 'subscription_created',
        subject: 'Subject',
        body: 'Body',
      };

      const result = translateNotification(notification, 'ar');
      
      expect(result.actionButton).toBeUndefined();
    });
  });

  describe('translatePortalText', () => {
    it('should translate dashboard portal text to Arabic', () => {
      const portal: PortalText = {
        section: 'dashboard',
        title: 'Dashboard',
        actions: [
          { id: 'view', label: 'View' },
          { id: 'update', label: 'Update' },
        ],
        labels: { status: 'Status', nextOrder: 'Next Order' },
      };

      const result = translatePortalText(portal, 'ar');
      
      expect(result.title).toBe('لوحة تحكم الاشتراكات');
      expect(result.actions[0].label).toBe('عرض التفاصيل');
      expect(result.labels.status).toBe('حالة الاشتراك');
      expect(result.labels.nextOrder).toBe('الطلب القادم');
    });

    it('should translate subscriptions portal text to Hebrew', () => {
      const portal: PortalText = {
        section: 'subscriptions',
        title: 'Subscriptions',
        actions: [
          { id: 'pause', label: 'Pause' },
          { id: 'cancel', label: 'Cancel' },
          { id: 'swap', label: 'Swap' },
        ],
        labels: { frequency: 'Frequency' },
      };

      const result = translatePortalText(portal, 'he');
      
      expect(result.title).toBe('המנויים שלי');
      expect(result.actions[0].label).toBe('השהה');
      expect(result.actions[1].label).toBe('בטל מנוי');
      expect(result.actions[2].label).toBe('החלף מוצר');
    });

    it('should translate orders portal text to Persian', () => {
      const portal: PortalText = {
        section: 'orders',
        title: 'Orders',
        actions: [{ id: 'view', label: 'View' }],
        labels: { total: 'Total' },
      };

      const result = translatePortalText(portal, 'fa');
      
      expect(result.title).toBe('سفارش‌های من');
      expect(result.labels.total).toBe('جمع');
    });

    it('should handle confirmation messages in actions', () => {
      const portal: PortalText = {
        section: 'subscriptions',
        title: 'Subscriptions',
        actions: [
          { 
            id: 'cancel', 
            label: 'Cancel',
            confirmationMessage: 'Are you sure?'
          },
        ],
        labels: {},
      };

      const result = translatePortalText(portal, 'ar');
      
      expect(result.actions[0].confirmationMessage).toContain('تأكيد');
    });

    it('should translate all portal sections', () => {
      const sections: PortalText['section'][] = [
        'dashboard',
        'subscriptions',
        'orders',
        'addresses',
        'payment_methods',
        'account_settings',
      ];

      sections.forEach(section => {
        const portal: PortalText = {
          section,
          title: 'Original',
          actions: [],
          labels: {},
        };

        const result = translatePortalText(portal, 'ar');
        
        expect(result.title).not.toBe('Original');
        expect(result.title.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getRechargeTemplates', () => {
    it('should return complete templates for Arabic', () => {
      const templates = getRechargeTemplates('ar');
      
      expect(templates.locale).toBe('ar');
      expect(templates.widget.defaultTitle).toBe('اشترك ووفر');
      expect(templates.widget.frequencyLabels.monthly).toBe('شهرياً');
      expect(templates.notifications.subscription_created.subject).toBe('تم إنشاء الاشتراك بنجاح');
      expect(templates.portal.subscriptions.title).toBe('اشتراكاتي');
    });

    it('should return complete templates for Hebrew', () => {
      const templates = getRechargeTemplates('he');
      
      expect(templates.locale).toBe('he');
      expect(templates.widget.frequencyLabels.weekly).toBe('שבועי');
      expect(templates.notifications.payment_failed.subject).toBe('התשלום נכשל - יש לעדכן');
    });

    it('should return complete templates for Persian', () => {
      const templates = getRechargeTemplates('fa');
      
      expect(templates.locale).toBe('fa');
      expect(templates.widget.frequencyLabels.yearly).toBe('سالانه');
      expect(templates.portal.dashboard.title).toBe('داشبورد اشتراک‌ها');
    });

    it('should return complete templates for Urdu', () => {
      const templates = getRechargeTemplates('ur');
      
      expect(templates.locale).toBe('ur');
      expect(templates.widget.frequencyLabels.quarterly).toBe('سہ ماہی');
      expect(templates.portal.orders.title).toBe('میرے آرڈرز');
    });

    it('should return complete templates for English', () => {
      const templates = getRechargeTemplates('en');
      
      expect(templates.locale).toBe('en');
      expect(templates.widget.frequencyLabels.daily).toBe('Daily');
      expect(templates.notifications.upcoming_order.subject).toBe('Reminder: Your next order is coming up');
    });

    it('should include all notification types in templates', () => {
      const templates = getRechargeTemplates('ar');
      
      expect(templates.notifications.subscription_created).toBeDefined();
      expect(templates.notifications.subscription_updated).toBeDefined();
      expect(templates.notifications.subscription_cancelled).toBeDefined();
      expect(templates.notifications.upcoming_order).toBeDefined();
      expect(templates.notifications.order_processed).toBeDefined();
      expect(templates.notifications.payment_failed).toBeDefined();
      expect(templates.notifications.payment_updated).toBeDefined();
      expect(templates.notifications.delivery_address_updated).toBeDefined();
      expect(templates.notifications.skip_confirmation).toBeDefined();
      expect(templates.notifications.swap_confirmation).toBeDefined();
    });

    it('should include all portal sections in templates', () => {
      const templates = getRechargeTemplates('ar');
      
      expect(templates.portal.dashboard).toBeDefined();
      expect(templates.portal.subscriptions).toBeDefined();
      expect(templates.portal.orders).toBeDefined();
      expect(templates.portal.addresses).toBeDefined();
      expect(templates.portal.payment_methods).toBeDefined();
      expect(templates.portal.account_settings).toBeDefined();
    });

    it('should include all frequency labels in templates', () => {
      const templates = getRechargeTemplates('ar');
      
      expect(templates.widget.frequencyLabels.daily).toBeDefined();
      expect(templates.widget.frequencyLabels.weekly).toBeDefined();
      expect(templates.widget.frequencyLabels.bi_weekly).toBeDefined();
      expect(templates.widget.frequencyLabels.monthly).toBeDefined();
      expect(templates.widget.frequencyLabels.bi_monthly).toBeDefined();
      expect(templates.widget.frequencyLabels.quarterly).toBeDefined();
      expect(templates.widget.frequencyLabels.yearly).toBeDefined();
    });
  });

  describe('formatFrequency', () => {
    it('should format weekly frequency in Arabic', () => {
      expect(formatFrequency('weekly', 1, 'ar')).toBe('أسبوعياً');
      expect(formatFrequency('weekly', 2, 'ar')).toBe('كل 2 أسبوعياً');
    });

    it('should format monthly frequency in Hebrew', () => {
      expect(formatFrequency('monthly', 1, 'he')).toBe('חודשי');
      expect(formatFrequency('monthly', 3, 'he')).toBe('כל 3 חודשי');
    });

    it('should format all frequency types', () => {
      const frequencies: Array<{ freq: Parameters<typeof formatFrequency>[0]; interval: number; ar: string; en: string }> = [
        { freq: 'daily', interval: 1, ar: 'يومياً', en: 'Daily' },
        { freq: 'weekly', interval: 1, ar: 'أسبوعياً', en: 'Weekly' },
        { freq: 'bi_weekly', interval: 1, ar: 'كل أسبوعين', en: 'Bi-weekly' },
        { freq: 'monthly', interval: 1, ar: 'شهرياً', en: 'Monthly' },
        { freq: 'bi_monthly', interval: 1, ar: 'كل شهرين', en: 'Bi-monthly' },
        { freq: 'quarterly', interval: 1, ar: 'ربع سنوياً', en: 'Quarterly' },
        { freq: 'yearly', interval: 1, ar: 'سنوياً', en: 'Yearly' },
      ];

      frequencies.forEach(({ freq, interval, ar, en }) => {
        expect(formatFrequency(freq, interval, 'ar')).toBe(ar);
        expect(formatFrequency(freq, interval, 'en')).toBe(en);
      });
    });

    it('should handle intervals greater than 1 for all RTL locales', () => {
      expect(formatFrequency('monthly', 2, 'ar')).toContain('2');
      expect(formatFrequency('monthly', 2, 'he')).toContain('2');
      expect(formatFrequency('monthly', 2, 'fa')).toContain('2');
      expect(formatFrequency('monthly', 2, 'ur')).toContain('2');
    });
  });

  describe('getSubscriptionStatusLabel', () => {
    it('should return Arabic status labels', () => {
      expect(getSubscriptionStatusLabel('active', 'ar')).toBe('نشط');
      expect(getSubscriptionStatusLabel('paused', 'ar')).toBe('متوقف');
      expect(getSubscriptionStatusLabel('cancelled', 'ar')).toBe('ملغى');
    });

    it('should return Hebrew status labels', () => {
      expect(getSubscriptionStatusLabel('active', 'he')).toBe('פעיל');
      expect(getSubscriptionStatusLabel('paused', 'he')).toBe('מושהה');
      expect(getSubscriptionStatusLabel('cancelled', 'he')).toBe('מבוטל');
    });

    it('should return Persian status labels', () => {
      expect(getSubscriptionStatusLabel('active', 'fa')).toBe('فعال');
      expect(getSubscriptionStatusLabel('paused', 'fa')).toBe('متوقف');
      expect(getSubscriptionStatusLabel('cancelled', 'fa')).toBe('لغو شده');
    });

    it('should return Urdu status labels', () => {
      expect(getSubscriptionStatusLabel('active', 'ur')).toBe('فعال');
      expect(getSubscriptionStatusLabel('paused', 'ur')).toBe('موقوف');
      expect(getSubscriptionStatusLabel('cancelled', 'ur')).toBe('منسوخ');
    });

    it('should return English status labels', () => {
      expect(getSubscriptionStatusLabel('active', 'en')).toBe('Active');
      expect(getSubscriptionStatusLabel('paused', 'en')).toBe('Paused');
      expect(getSubscriptionStatusLabel('cancelled', 'en')).toBe('Cancelled');
    });
  });

  describe('formatSubscriptionPrice', () => {
    it('should format price for RTL locales (currency after amount)', () => {
      expect(formatSubscriptionPrice(99.99, 'USD', 'ar')).toBe('99.99 USD');
      expect(formatSubscriptionPrice(99.99, 'ILS', 'he')).toBe('99.99 ILS');
      expect(formatSubscriptionPrice(99.99, 'IRR', 'fa')).toBe('99.99 IRR');
      expect(formatSubscriptionPrice(99.99, 'PKR', 'ur')).toBe('99.99 PKR');
    });

    it('should format price for LTR locale (currency before amount)', () => {
      expect(formatSubscriptionPrice(99.99, 'USD', 'en')).toBe('USD 99.99');
    });

    it('should format price with 2 decimal places', () => {
      expect(formatSubscriptionPrice(100, 'USD', 'ar')).toBe('100.00 USD');
      expect(formatSubscriptionPrice(49.5, 'USD', 'ar')).toBe('49.50 USD');
    });

    it('should handle various currencies', () => {
      const currencies = ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'ILS'];
      
      currencies.forEach(currency => {
        const result = formatSubscriptionPrice(50, currency, 'ar');
        expect(result).toContain(currency);
        expect(result).toContain('50.00');
      });
    });
  });
});
