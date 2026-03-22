import { describe, it, expect } from 'vitest';
import {
  getARIALabel,
  getScreenReaderText,
  getAccessibilityAnnouncement,
  getAccessibilityLabels,
  getARIALabelsByCategory,
  getAllARIALabelKeys,
  getAllScreenReaderTextKeys,
  getAllAccessibilityAnnouncementKeys,
  getAvailableCategories,
  getSupportedLocales,
  isValidLocale,
  isRTLLocale,
  searchARIALabels,
  getARIALabelCountByCategory,
  getAccessibilitySummary,
  formatARIALabel,
  formatScreenReaderText,
  formatAccessibilityAnnouncement,
  getLiveRegionAttributes,
  getSkipLinkConfig,
  getFocusManagementLabels,
  hasARIALabel,
  hasScreenReaderText,
  hasAccessibilityAnnouncement,
  getNormalizedLocale,
} from '../../app/services/translation-features/accessibility-labels';

describe('Accessibility Labels Service - T0345', () => {
  describe('getARIALabel', () => {
    it('should return ARIA label in Arabic', () => {
      const label = getARIALabel('addToCart', 'ar');
      expect(label).toBeDefined();
      expect(label?.label).toBe('إضافة إلى سلة التسوق');
      expect(label?.category).toBe('ecommerce');
    });

    it('should return ARIA label in Hebrew', () => {
      const label = getARIALabel('addToCart', 'he');
      expect(label).toBeDefined();
      expect(label?.label).toBe('הוסף לעגלה');
      expect(label?.category).toBe('ecommerce');
    });

    it('should return ARIA label in English', () => {
      const label = getARIALabel('addToCart', 'en');
      expect(label).toBeDefined();
      expect(label?.label).toBe('Add to cart');
      expect(label?.category).toBe('ecommerce');
    });

    it('should fallback to English for unknown locale', () => {
      const label = getARIALabel('addToCart', 'fr');
      expect(label).toBeDefined();
      expect(label?.label).toBe('Add to cart');
    });

    it('should return undefined for unknown key', () => {
      const label = getARIALabel('unknownKey', 'en');
      expect(label).toBeUndefined();
    });

    it('should return navigation category labels', () => {
      const label = getARIALabel('mainNavigation', 'ar');
      expect(label).toBeDefined();
      expect(label?.category).toBe('navigation');
      expect(label?.label).toBe('التنقل الرئيسي');
    });

    it('should return form category labels', () => {
      const label = getARIALabel('searchInput', 'he');
      expect(label).toBeDefined();
      expect(label?.category).toBe('forms');
      expect(label?.label).toBe('שדה חיפוש');
    });
  });

  describe('getScreenReaderText', () => {
    it('should return screen reader text in Arabic', () => {
      const text = getScreenReaderText('itemAddedToCart', 'ar');
      expect(text).toBeDefined();
      expect(text?.text).toBe('تمت إضافة المنتج إلى سلة التسوق');
      expect(text?.priority).toBe('polite');
    });

    it('should return screen reader text in Hebrew', () => {
      const text = getScreenReaderText('itemAddedToCart', 'he');
      expect(text).toBeDefined();
      expect(text?.text).toBe('המוצר נוסף לעגלה');
      expect(text?.priority).toBe('polite');
    });

    it('should return screen reader text in English', () => {
      const text = getScreenReaderText('itemAddedToCart', 'en');
      expect(text).toBeDefined();
      expect(text?.text).toBe('Item added to cart');
      expect(text?.priority).toBe('polite');
    });

    it('should fallback to English for unknown locale', () => {
      const text = getScreenReaderText('itemAddedToCart', 'es');
      expect(text).toBeDefined();
      expect(text?.text).toBe('Item added to cart');
    });

    it('should return undefined for unknown key', () => {
      const text = getScreenReaderText('unknownKey', 'en');
      expect(text).toBeUndefined();
    });

    it('should return assertive priority texts', () => {
      const text = getScreenReaderText('formErrors', 'ar');
      expect(text).toBeDefined();
      expect(text?.priority).toBe('assertive');
    });
  });

  describe('getAccessibilityAnnouncement', () => {
    it('should return accessibility announcement in Arabic', () => {
      const announcement = getAccessibilityAnnouncement('checkoutComplete', 'ar');
      expect(announcement).toBeDefined();
      expect(announcement?.message).toBe('تم إتمام الشراء بنجاح، شكراً لك');
      expect(announcement?.priority).toBe('assertive');
      expect(announcement?.interrupt).toBe(true);
    });

    it('should return accessibility announcement in Hebrew', () => {
      const announcement = getAccessibilityAnnouncement('checkoutComplete', 'he');
      expect(announcement).toBeDefined();
      expect(announcement?.message).toBe('הקנייה הושלמה בהצלחה, תודה לך');
      expect(announcement?.priority).toBe('assertive');
    });

    it('should return accessibility announcement in English', () => {
      const announcement = getAccessibilityAnnouncement('checkoutComplete', 'en');
      expect(announcement).toBeDefined();
      expect(announcement?.message).toBe('Checkout completed successfully, thank you');
      expect(announcement?.priority).toBe('assertive');
    });

    it('should fallback to English for unknown locale', () => {
      const announcement = getAccessibilityAnnouncement('cartEmpty', 'de');
      expect(announcement).toBeDefined();
      expect(announcement?.message).toBe('Your cart is empty');
    });

    it('should return undefined for unknown key', () => {
      const announcement = getAccessibilityAnnouncement('unknownKey', 'en');
      expect(announcement).toBeUndefined();
    });

    it('should return polite priority announcements', () => {
      const announcement = getAccessibilityAnnouncement('changesSaved', 'en');
      expect(announcement).toBeDefined();
      expect(announcement?.priority).toBe('polite');
      expect(announcement?.interrupt).toBe(false);
    });
  });

  describe('getAccessibilityLabels', () => {
    it('should return all accessibility labels for Arabic', () => {
      const result = getAccessibilityLabels('ar');
      expect(result.locale).toBe('ar');
      expect(result.isRTL).toBe(true);
      expect(Object.keys(result.labels.ariaLabels).length).toBeGreaterThan(0);
      expect(Object.keys(result.labels.screenReaderTexts).length).toBeGreaterThan(0);
      expect(Object.keys(result.labels.announcements).length).toBeGreaterThan(0);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should return all accessibility labels for Hebrew', () => {
      const result = getAccessibilityLabels('he');
      expect(result.locale).toBe('he');
      expect(result.isRTL).toBe(true);
    });

    it('should return all accessibility labels for English', () => {
      const result = getAccessibilityLabels('en');
      expect(result.locale).toBe('en');
      expect(result.isRTL).toBe(false);
    });

    it('should fallback to English for unknown locale', () => {
      const result = getAccessibilityLabels('unknown');
      expect(result.locale).toBe('en');
      expect(result.isRTL).toBe(false);
    });

    it('should include specific ARIA labels', () => {
      const result = getAccessibilityLabels('ar');
      expect(result.labels.ariaLabels['addToCart']).toBeDefined();
      expect(result.labels.ariaLabels['searchInput']).toBeDefined();
      expect(result.labels.ariaLabels['mainNavigation']).toBeDefined();
    });

    it('should include specific screen reader texts', () => {
      const result = getAccessibilityLabels('ar');
      expect(result.labels.screenReaderTexts['itemAddedToCart']).toBeDefined();
      expect(result.labels.screenReaderTexts['formSubmitted']).toBeDefined();
    });

    it('should include specific announcements', () => {
      const result = getAccessibilityLabels('ar');
      expect(result.labels.announcements['checkoutComplete']).toBeDefined();
      expect(result.labels.announcements['cartEmpty']).toBeDefined();
    });
  });

  describe('getARIALabelsByCategory', () => {
    it('should return navigation labels', () => {
      const labels = getARIALabelsByCategory('navigation', 'en');
      expect(labels.length).toBeGreaterThan(0);
      expect(labels.every(l => l.category === 'navigation')).toBe(true);
    });

    it('should return ecommerce labels', () => {
      const labels = getARIALabelsByCategory('ecommerce', 'ar');
      expect(labels.length).toBeGreaterThan(0);
      expect(labels.some(l => l.key === 'addToCart')).toBe(true);
    });

    it('should return form labels', () => {
      const labels = getARIALabelsByCategory('forms', 'he');
      expect(labels.length).toBeGreaterThan(0);
      expect(labels.every(l => l.category === 'forms')).toBe(true);
    });

    it('should return labels in specified locale', () => {
      const labels = getARIALabelsByCategory('general', 'ar');
      const closeLabel = labels.find(l => l.key === 'close');
      expect(closeLabel?.label).toBe('إغلاق');
    });
  });

  describe('getAllARIALabelKeys', () => {
    it('should return array of keys', () => {
      const keys = getAllARIALabelKeys();
      expect(Array.isArray(keys)).toBe(true);
      expect(keys.length).toBeGreaterThan(0);
      expect(keys).toContain('addToCart');
      expect(keys).toContain('searchInput');
      expect(keys).toContain('mainNavigation');
    });
  });

  describe('getAllScreenReaderTextKeys', () => {
    it('should return array of keys', () => {
      const keys = getAllScreenReaderTextKeys();
      expect(Array.isArray(keys)).toBe(true);
      expect(keys.length).toBeGreaterThan(0);
      expect(keys).toContain('itemAddedToCart');
      expect(keys).toContain('formSubmitted');
    });
  });

  describe('getAllAccessibilityAnnouncementKeys', () => {
    it('should return array of keys', () => {
      const keys = getAllAccessibilityAnnouncementKeys();
      expect(Array.isArray(keys)).toBe(true);
      expect(keys.length).toBeGreaterThan(0);
      expect(keys).toContain('checkoutComplete');
      expect(keys).toContain('cartEmpty');
    });
  });

  describe('getAvailableCategories', () => {
    it('should return all categories', () => {
      const categories = getAvailableCategories();
      expect(categories).toContain('navigation');
      expect(categories).toContain('forms');
      expect(categories).toContain('ecommerce');
      expect(categories).toContain('feedback');
      expect(categories).toContain('media');
      expect(categories).toContain('general');
    });
  });

  describe('getSupportedLocales', () => {
    it('should return supported locales', () => {
      const locales = getSupportedLocales();
      expect(locales).toContain('ar');
      expect(locales).toContain('he');
      expect(locales).toContain('en');
      expect(locales.length).toBe(3);
    });
  });

  describe('isValidLocale', () => {
    it('should return true for valid locales', () => {
      expect(isValidLocale('ar')).toBe(true);
      expect(isValidLocale('he')).toBe(true);
      expect(isValidLocale('en')).toBe(true);
    });

    it('should return false for invalid locales', () => {
      expect(isValidLocale('fr')).toBe(false);
      expect(isValidLocale('es')).toBe(false);
      expect(isValidLocale('de')).toBe(false);
      expect(isValidLocale('')).toBe(false);
    });
  });

  describe('isRTLLocale', () => {
    it('should return true for RTL locales', () => {
      expect(isRTLLocale('ar')).toBe(true);
      expect(isRTLLocale('he')).toBe(true);
    });

    it('should return false for LTR locales', () => {
      expect(isRTLLocale('en')).toBe(false);
    });
  });

  describe('searchARIALabels', () => {
    it('should search by key', () => {
      const results = searchARIALabels('addToCart', 'en');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.key === 'addToCart')).toBe(true);
    });

    it('should search by label text', () => {
      const results = searchARIALabels('search', 'en');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should be case insensitive', () => {
      const results1 = searchARIALabels('CART', 'en');
      const results2 = searchARIALabels('cart', 'en');
      expect(results1.length).toBe(results2.length);
    });

    it('should return empty array for no matches', () => {
      const results = searchARIALabels('xyz123nonexistent', 'en');
      expect(results).toEqual([]);
    });
  });

  describe('getARIALabelCountByCategory', () => {
    it('should return count for each category', () => {
      const counts = getARIALabelCountByCategory();
      expect(counts.navigation).toBeGreaterThan(0);
      expect(counts.forms).toBeGreaterThan(0);
      expect(counts.ecommerce).toBeGreaterThan(0);
      expect(counts.feedback).toBeGreaterThan(0);
      expect(counts.media).toBeGreaterThan(0);
      expect(counts.general).toBeGreaterThan(0);
    });
  });

  describe('getAccessibilitySummary', () => {
    it('should return summary for Arabic', () => {
      const summary = getAccessibilitySummary('ar');
      expect(summary.locale).toBe('ar');
      expect(summary.isRTL).toBe(true);
      expect(summary.ariaLabelCount).toBeGreaterThan(0);
      expect(summary.screenReaderTextCount).toBeGreaterThan(0);
      expect(summary.announcementCount).toBeGreaterThan(0);
      expect(summary.categoryBreakdown).toBeDefined();
    });

    it('should return summary for English', () => {
      const summary = getAccessibilitySummary('en');
      expect(summary.locale).toBe('en');
      expect(summary.isRTL).toBe(false);
    });
  });

  describe('formatARIALabel', () => {
    it('should return undefined for unknown key', () => {
      const result = formatARIALabel('unknown', 'en', { name: 'Test' });
      expect(result).toBeUndefined();
    });
  });

  describe('formatScreenReaderText', () => {
    it('should return undefined for unknown key', () => {
      const result = formatScreenReaderText('unknown', 'en', { count: 5 });
      expect(result).toBeUndefined();
    });
  });

  describe('formatAccessibilityAnnouncement', () => {
    it('should return undefined for unknown key', () => {
      const result = formatAccessibilityAnnouncement('unknown', 'en', { item: 'Test' });
      expect(result).toBeUndefined();
    });
  });

  describe('getLiveRegionAttributes', () => {
    it('should return attributes for polite priority', () => {
      const attrs = getLiveRegionAttributes('polite');
      expect(attrs['aria-live']).toBe('polite');
      expect(attrs['aria-atomic']).toBe('true');
    });

    it('should return attributes for assertive priority', () => {
      const attrs = getLiveRegionAttributes('assertive');
      expect(attrs['aria-live']).toBe('assertive');
      expect(attrs['aria-atomic']).toBe('true');
    });

    it('should not include aria-atomic for off priority', () => {
      const attrs = getLiveRegionAttributes('off');
      expect(attrs['aria-live']).toBe('off');
      expect(attrs['aria-atomic']).toBeUndefined();
    });

    it('should include aria-relevant when provided', () => {
      const attrs = getLiveRegionAttributes('polite', 'additions');
      expect(attrs['aria-relevant']).toBe('additions');
    });
  });

  describe('getSkipLinkConfig', () => {
    it('should return config for Arabic', () => {
      const config = getSkipLinkConfig('ar');
      expect(config.mainContent.label).toBe('تخطي إلى المحتوى الرئيسي');
      expect(config.mainContent.target).toBe('#main-content');
      expect(config.search.label).toBe('تخطي إلى البحث');
      expect(config.navigation.label).toBe('تخطي إلى التنقل');
    });

    it('should return config for Hebrew', () => {
      const config = getSkipLinkConfig('he');
      expect(config.mainContent.label).toBe('דלג לתוכן ראשי');
      expect(config.search.label).toBe('דלג לחיפוש');
      expect(config.navigation.label).toBe('דלג לניווט');
    });

    it('should return config for English', () => {
      const config = getSkipLinkConfig('en');
      expect(config.mainContent.label).toBe('Skip to main content');
      expect(config.search.label).toBe('Skip to search');
      expect(config.navigation.label).toBe('Skip to navigation');
    });

    it('should fallback to English for unknown locale', () => {
      const config = getSkipLinkConfig('fr');
      expect(config.mainContent.label).toBe('Skip to main content');
    });
  });

  describe('getFocusManagementLabels', () => {
    it('should return labels for Arabic', () => {
      const labels = getFocusManagementLabels('ar');
      expect(labels.focusIndicator).toBe('تم التركيز على');
      expect(labels.focusTrapStart).toBe('بداية منطقة التركيز');
      expect(labels.focusTrapEnd).toBe('نهاية منطقة التركيز');
      expect(labels.focusReturned).toBe('تم إرجاع التركيز');
    });

    it('should return labels for Hebrew', () => {
      const labels = getFocusManagementLabels('he');
      expect(labels.focusIndicator).toBe('מוקד על');
      expect(labels.focusTrapStart).toBe('תחילת אזור מוקד');
      expect(labels.focusTrapEnd).toBe('סוף אזור מוקד');
      expect(labels.focusReturned).toBe('המוקד הוחזר');
    });

    it('should return labels for English', () => {
      const labels = getFocusManagementLabels('en');
      expect(labels.focusIndicator).toBe('Focused on');
      expect(labels.focusTrapStart).toBe('Start of focus trap');
      expect(labels.focusTrapEnd).toBe('End of focus trap');
      expect(labels.focusReturned).toBe('Focus returned');
    });
  });

  describe('hasARIALabel', () => {
    it('should return true for existing key', () => {
      expect(hasARIALabel('addToCart')).toBe(true);
      expect(hasARIALabel('searchInput')).toBe(true);
    });

    it('should return false for non-existing key', () => {
      expect(hasARIALabel('unknownKey')).toBe(false);
    });
  });

  describe('hasScreenReaderText', () => {
    it('should return true for existing key', () => {
      expect(hasScreenReaderText('itemAddedToCart')).toBe(true);
    });

    it('should return false for non-existing key', () => {
      expect(hasScreenReaderText('unknownKey')).toBe(false);
    });
  });

  describe('hasAccessibilityAnnouncement', () => {
    it('should return true for existing key', () => {
      expect(hasAccessibilityAnnouncement('checkoutComplete')).toBe(true);
    });

    it('should return false for non-existing key', () => {
      expect(hasAccessibilityAnnouncement('unknownKey')).toBe(false);
    });
  });

  describe('getNormalizedLocale', () => {
    it('should return locale as-is for valid locales', () => {
      expect(getNormalizedLocale('ar')).toBe('ar');
      expect(getNormalizedLocale('he')).toBe('he');
      expect(getNormalizedLocale('en')).toBe('en');
    });

    it('should fallback to en for invalid locales', () => {
      expect(getNormalizedLocale('fr')).toBe('en');
      expect(getNormalizedLocale('es')).toBe('en');
      expect(getNormalizedLocale('')).toBe('en');
    });
  });

  describe('Accessibility coverage', () => {
    it('should have ecommerce labels for cart actions', () => {
      expect(hasARIALabel('addToCart')).toBe(true);
      expect(hasARIALabel('removeFromCart')).toBe(true);
      expect(hasARIALabel('viewCart')).toBe(true);
      expect(hasARIALabel('checkout')).toBe(true);
    });

    it('should have screen reader texts for cart actions', () => {
      expect(hasScreenReaderText('itemAddedToCart')).toBe(true);
      expect(hasScreenReaderText('itemRemovedFromCart')).toBe(true);
      expect(hasScreenReaderText('cartUpdated')).toBe(true);
    });

    it('should have accessibility announcements for checkout flow', () => {
      expect(hasAccessibilityAnnouncement('checkoutComplete')).toBe(true);
      expect(hasAccessibilityAnnouncement('cartEmpty')).toBe(true);
      expect(hasAccessibilityAnnouncement('cartHasItems')).toBe(true);
    });

    it('should have form-related accessibility labels', () => {
      expect(hasARIALabel('searchInput')).toBe(true);
      expect(hasARIALabel('emailInput')).toBe(true);
      expect(hasARIALabel('passwordInput')).toBe(true);
      expect(hasARIALabel('requiredField')).toBe(true);
      expect(hasScreenReaderText('formSubmitted')).toBe(true);
      expect(hasScreenReaderText('formErrors')).toBe(true);
    });

    it('should have navigation-related accessibility labels', () => {
      expect(hasARIALabel('mainNavigation')).toBe(true);
      expect(hasARIALabel('breadcrumb')).toBe(true);
      expect(hasARIALabel('skipToContent')).toBe(true);
      expect(hasScreenReaderText('menuOpened')).toBe(true);
      expect(hasScreenReaderText('menuClosed')).toBe(true);
    });
  });

  describe('ARIA label descriptions', () => {
    it('should include descriptions for labels', () => {
      const label = getARIALabel('addToCart', 'en');
      expect(label?.description).toBeDefined();
      expect(label?.description).toBe('Add product to cart');
    });

    it('should include context for screen reader texts', () => {
      const text = getScreenReaderText('itemAddedToCart', 'en');
      expect(text?.context).toBeDefined();
      expect(text?.context).toBe('Cart actions');
    });
  });

  describe('Label translations consistency', () => {
    it('should have all keys in all locales for ARIA labels', () => {
      const keys = getAllARIALabelKeys();
      for (const key of keys) {
        const arLabel = getARIALabel(key, 'ar');
        const heLabel = getARIALabel(key, 'he');
        const enLabel = getARIALabel(key, 'en');
        expect(arLabel).toBeDefined();
        expect(heLabel).toBeDefined();
        expect(enLabel).toBeDefined();
      }
    });

    it('should have all keys in all locales for screen reader texts', () => {
      const keys = getAllScreenReaderTextKeys();
      for (const key of keys) {
        const arText = getScreenReaderText(key, 'ar');
        const heText = getScreenReaderText(key, 'he');
        const enText = getScreenReaderText(key, 'en');
        expect(arText).toBeDefined();
        expect(heText).toBeDefined();
        expect(enText).toBeDefined();
      }
    });

    it('should have all keys in all locales for announcements', () => {
      const keys = getAllAccessibilityAnnouncementKeys();
      for (const key of keys) {
        const arAnn = getAccessibilityAnnouncement(key, 'ar');
        const heAnn = getAccessibilityAnnouncement(key, 'he');
        const enAnn = getAccessibilityAnnouncement(key, 'en');
        expect(arAnn).toBeDefined();
        expect(heAnn).toBeDefined();
        expect(enAnn).toBeDefined();
      }
    });
  });

  describe('RTL-specific accessibility', () => {
    it('should identify RTL locales correctly', () => {
      expect(isRTLLocale('ar')).toBe(true);
      expect(isRTLLocale('he')).toBe(true);
      expect(isRTLLocale('en')).toBe(false);
    });

    it('should mark RTL in accessibility results', () => {
      const arResult = getAccessibilityLabels('ar');
      const heResult = getAccessibilityLabels('he');
      const enResult = getAccessibilityLabels('en');
      
      expect(arResult.isRTL).toBe(true);
      expect(heResult.isRTL).toBe(true);
      expect(enResult.isRTL).toBe(false);
    });
  });

  describe('Accessibility summary statistics', () => {
    it('should provide accurate counts in summary', () => {
      const summary = getAccessibilitySummary('en');
      const allLabels = getAccessibilityLabels('en');
      
      expect(summary.ariaLabelCount).toBe(Object.keys(allLabels.labels.ariaLabels).length);
      expect(summary.screenReaderTextCount).toBe(Object.keys(allLabels.labels.screenReaderTexts).length);
      expect(summary.announcementCount).toBe(Object.keys(allLabels.labels.announcements).length);
    });
  });
});
