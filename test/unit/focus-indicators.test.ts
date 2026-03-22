import { describe, it, expect } from 'vitest';
import {
  getFocusLabels,
  getFocusIndicatorLabel,
  getSkipLinkText,
  getFocusAnnouncement,
  isRTLLocale,
  getFocusVisibilityAnnouncement,
  getInputModeAnnouncement,
  getAvailableSkipLinkSections,
  generateSkipLinkAttributes,
  formatElementDescription,
  getFocusTrapAnnouncement,
  ARABIC_FOCUS_LABELS,
  HEBREW_FOCUS_LABELS,
  ENGLISH_FOCUS_LABELS,
  type SupportedLocale,
  type SkipLinkTarget,
  type FocusChangeContext,
} from '../../app/services/translation-features/focus-indicators';

describe('Focus Indicators Service - T0348', () => {
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

    it('should detect English as LTR locale', () => {
      expect(isRTLLocale('en')).toBe(false);
      expect(isRTLLocale('en-US')).toBe(false);
      expect(isRTLLocale('en-GB')).toBe(false);
    });

    it('should treat unknown locales as LTR', () => {
      expect(isRTLLocale('fr')).toBe(false);
      expect(isRTLLocale('de')).toBe(false);
      expect(isRTLLocale('es')).toBe(false);
    });
  });

  describe('Focus Label Sets', () => {
    it('should return Arabic labels for ar locale', () => {
      const labels = getFocusLabels('ar');
      expect(labels.skipToContent).toBe('تخطى إلى المحتوى الرئيسي');
      expect(labels.skipToNavigation).toBe('تخطى إلى القائمة');
      expect(labels.focusVisible).toBe('مؤشر التركيز مرئي');
    });

    it('should return Hebrew labels for he locale', () => {
      const labels = getFocusLabels('he');
      expect(labels.skipToContent).toBe('דלג לתוכן הראשי');
      expect(labels.skipToNavigation).toBe('דלג לתפריט הניווט');
      expect(labels.focusVisible).toBe('מחוון המיקוד גלוי');
    });

    it('should return English labels for en locale', () => {
      const labels = getFocusLabels('en');
      expect(labels.skipToContent).toBe('Skip to main content');
      expect(labels.skipToNavigation).toBe('Skip to navigation');
      expect(labels.focusVisible).toBe('Focus indicator visible');
    });

    it('should handle locale with region code', () => {
      const labelsArSA = getFocusLabels('ar-SA');
      expect(labelsArSA.skipToContent).toBe('تخطى إلى المحتوى الرئيسي');
      
      const labelsHeIL = getFocusLabels('he-IL');
      expect(labelsHeIL.skipToContent).toBe('דלג לתוכן הראשי');
    });

    it('should default to English for unknown locale', () => {
      const labels = getFocusLabels('fr' as SupportedLocale);
      expect(labels.skipToContent).toBe('Skip to main content');
      expect(labels.skipToNavigation).toBe('Skip to navigation');
    });
  });

  describe('Individual Focus Indicator Labels', () => {
    it('should get Arabic skip to content label', () => {
      expect(getFocusIndicatorLabel('skipToContent', 'ar')).toBe('تخطى إلى المحتوى الرئيسي');
    });

    it('should get Hebrew skip to search label', () => {
      expect(getFocusIndicatorLabel('skipToSearch', 'he')).toBe('דלג לחיפוש');
    });

    it('should get English focus trapped label', () => {
      expect(getFocusIndicatorLabel('focusTrapped', 'en')).toBe('Focus trapped in modal');
    });

    it('should get keyboard mode label in Arabic', () => {
      expect(getFocusIndicatorLabel('keyboardMode', 'ar')).toBe('وضع لوحة المفاتيح نشط');
    });

    it('should get mouse mode label in Hebrew', () => {
      expect(getFocusIndicatorLabel('mouseMode', 'he')).toBe('מצב עכבר פעיל');
    });

    it('should handle unknown element keys gracefully', () => {
      expect(getFocusIndicatorLabel('unknownKey' as any, 'en')).toBe('unknownKey');
    });
  });

  describe('Skip Link Text Generation', () => {
    it('should generate Arabic skip to content text', () => {
      const text = getSkipLinkText('content', 'ar');
      expect(text).toBe('تخطى إلى المحتوى الرئيسي');
    });

    it('should generate Hebrew skip to navigation text', () => {
      const text = getSkipLinkText('navigation', 'he');
      expect(text).toBe('דלג לתפריט הניווט');
    });

    it('should generate English skip to footer text', () => {
      const text = getSkipLinkText('footer', 'en');
      expect(text).toBe('Skip to footer');
    });

    it('should handle SkipLinkTarget object', () => {
      const target: SkipLinkTarget = { id: 'main-content', section: 'content' };
      const text = getSkipLinkText(target, 'ar');
      expect(text).toBe('تخطى إلى المحتوى الرئيسي');
    });

    it('should handle all available skip link sections', () => {
      const sections = getAvailableSkipLinkSections();
      expect(sections.length).toBeGreaterThan(0);
      
      sections.forEach((section) => {
        const textAr = getSkipLinkText(section, 'ar');
        const textHe = getSkipLinkText(section, 'he');
        const textEn = getSkipLinkText(section, 'en');
        
        expect(textAr).toBeTruthy();
        expect(textHe).toBeTruthy();
        expect(textEn).toBeTruthy();
      });
    });

    it('should provide specific skip link for products section', () => {
      const textAr = getSkipLinkText('products', 'ar');
      const textHe = getSkipLinkText('products', 'he');
      const textEn = getSkipLinkText('products', 'en');
      
      expect(textAr).toBe('تخطى إلى المنتجات');
      expect(textHe).toBe('דלג למוצרים');
      expect(textEn).toBe('Skip to products');
    });

    it('should provide specific skip link for cart section', () => {
      const textAr = getSkipLinkText('cart', 'ar');
      const textHe = getSkipLinkText('cart', 'he');
      const textEn = getSkipLinkText('cart', 'en');
      
      expect(textAr).toBe('تخطى إلى سلة التسوق');
      expect(textHe).toBe('דלג לעגלת הקניות');
      expect(textEn).toBe('Skip to cart');
    });
  });

  describe('Focus Change Announcements', () => {
    it('should generate focus moved to announcement in Arabic', () => {
      const announcement = getFocusAnnouncement('', 'زر الإرسال', 'ar');
      expect(announcement).toContain('تم نقل التركيز');
      expect(announcement).toContain('زر الإرسال');
    });

    it('should generate focus moved from-to announcement in Hebrew', () => {
      const context: FocusChangeContext = {
        fromElement: 'حقل الاسم',
        toElement: 'حقل البريد الإلكتروني',
      };
      const announcement = getFocusAnnouncement(context, 'he');
      expect(announcement).toContain('המיקוד הועבר');
    });

    it('should generate focus moved to announcement in English', () => {
      const announcement = getFocusAnnouncement('', 'Submit button', 'en');
      expect(announcement).toBe('Focus moved to Submit button');
    });

    it('should handle FocusChangeContext object with section', () => {
      const context: FocusChangeContext = {
        fromElement: '',
        toElement: '',
        section: 'navigation',
      };
      const announcementAr = getFocusAnnouncement(context, 'ar');
      expect(announcementAr).toContain('التنقل');
      
      const announcementHe = getFocusAnnouncement(context, 'he');
      expect(announcementHe).toContain('ניווט');
    });

    it('should handle both from and to elements in context', () => {
      const context: FocusChangeContext = {
        fromElement: 'Home link',
        toElement: 'Products link',
      };
      const announcement = getFocusAnnouncement(context, 'en');
      expect(announcement).toContain('Focus moved from Home link to Products link');
    });
  });

  describe('Focus Visibility Announcements', () => {
    it('should announce focus ring visible in Arabic', () => {
      const announcement = getFocusVisibilityAnnouncement(true, 'ar');
      expect(announcement).toBe('حلقة التركيز مرئية');
    });

    it('should announce focus ring hidden in Arabic', () => {
      const announcement = getFocusVisibilityAnnouncement(false, 'ar');
      expect(announcement).toBe('حلقة التركيز مخفية');
    });

    it('should announce focus ring visible in Hebrew', () => {
      const announcement = getFocusVisibilityAnnouncement(true, 'he');
      expect(announcement).toBe('טבעת המיקוד גלויה');
    });

    it('should announce focus ring hidden in Hebrew', () => {
      const announcement = getFocusVisibilityAnnouncement(false, 'he');
      expect(announcement).toBe('טבעת המיקוד מוסתרת');
    });

    it('should announce focus ring visible in English', () => {
      const announcement = getFocusVisibilityAnnouncement(true, 'en');
      expect(announcement).toBe('Focus ring visible');
    });

    it('should announce focus ring hidden in English', () => {
      const announcement = getFocusVisibilityAnnouncement(false, 'en');
      expect(announcement).toBe('Focus ring hidden');
    });
  });

  describe('Input Mode Announcements', () => {
    it('should announce keyboard mode in Arabic', () => {
      const announcement = getInputModeAnnouncement('keyboard', 'ar');
      expect(announcement).toBe('وضع لوحة المفاتيح نشط');
    });

    it('should announce mouse mode in Arabic', () => {
      const announcement = getInputModeAnnouncement('mouse', 'ar');
      expect(announcement).toBe('وضع الماوس نشط');
    });

    it('should announce keyboard mode in Hebrew', () => {
      const announcement = getInputModeAnnouncement('keyboard', 'he');
      expect(announcement).toBe('מצב מקלדת פעיל');
    });

    it('should announce mouse mode in Hebrew', () => {
      const announcement = getInputModeAnnouncement('mouse', 'he');
      expect(announcement).toBe('מצב עכבר פעיל');
    });

    it('should announce keyboard mode in English', () => {
      const announcement = getInputModeAnnouncement('keyboard', 'en');
      expect(announcement).toBe('Keyboard mode active');
    });

    it('should announce mouse mode in English', () => {
      const announcement = getInputModeAnnouncement('mouse', 'en');
      expect(announcement).toBe('Mouse mode active');
    });
  });

  describe('Focus Trap Announcements', () => {
    it('should announce focus trapped in modal in Arabic', () => {
      const announcement = getFocusTrapAnnouncement(true, 'ar');
      expect(announcement).toBe('التركيز محبوس في النافذة المنبثقة');
    });

    it('should announce focus returned in Arabic', () => {
      const announcement = getFocusTrapAnnouncement(false, 'ar');
      expect(announcement).toBe('تم إرجاع التركيز إلى العنصر السابق');
    });

    it('should announce focus trapped in modal in Hebrew', () => {
      const announcement = getFocusTrapAnnouncement(true, 'he');
      expect(announcement).toBe('המיקוד לכוד בחלון קופץ');
    });

    it('should announce focus returned in Hebrew', () => {
      const announcement = getFocusTrapAnnouncement(false, 'he');
      expect(announcement).toBe('המיקוד חזר לרכיב הקודם');
    });

    it('should announce focus trapped in modal in English', () => {
      const announcement = getFocusTrapAnnouncement(true, 'en');
      expect(announcement).toBe('Focus trapped in modal');
    });

    it('should announce focus returned in English', () => {
      const announcement = getFocusTrapAnnouncement(false, 'en');
      expect(announcement).toBe('Focus returned to previous element');
    });
  });

  describe('Skip Link Attributes Generation', () => {
    it('should generate correct attributes for content skip link in Arabic', () => {
      const target: SkipLinkTarget = { id: 'main-content', section: 'content' };
      const attrs = generateSkipLinkAttributes(target, 'ar');
      
      expect(attrs.href).toBe('#main-content');
      expect(attrs.text).toBe('تخطى إلى المحتوى الرئيسي');
      expect(attrs['aria-label']).toBe('تخطى إلى المحتوى الرئيسي');
    });

    it('should generate correct attributes for navigation skip link in Hebrew', () => {
      const target: SkipLinkTarget = { id: 'nav-menu', section: 'navigation' };
      const attrs = generateSkipLinkAttributes(target, 'he');
      
      expect(attrs.href).toBe('#nav-menu');
      expect(attrs.text).toBe('דלג לתפריט הניווט');
    });

    it('should generate correct attributes with string target', () => {
      const attrs = generateSkipLinkAttributes('footer', 'en');
      
      expect(attrs.href).toBe('#footer');
      expect(attrs.text).toBe('Skip to footer');
    });
  });

  describe('Element Description Formatting', () => {
    it('should format button description in Arabic', () => {
      const description = formatElementDescription('button', 'إرسال', 'ar');
      expect(description).toBe('زر: إرسال');
    });

    it('should format link description in Hebrew', () => {
      const description = formatElementDescription('link', 'דף הבית', 'he');
      expect(description).toBe('קישור: דף הבית');
    });

    it('should format input description in English', () => {
      const description = formatElementDescription('input', 'Email address', 'en');
      expect(description).toBe('input field: Email address');
    });

    it('should format checkbox description in Arabic', () => {
      const description = formatElementDescription('checkbox', 'الموافقة على الشروط', 'ar');
      expect(description).toBe('مربع اختيار: الموافقة على الشروط');
    });

    it('should format select description in Hebrew', () => {
      const description = formatElementDescription('select', 'בחירת מידה', 'he');
      expect(description).toBe('תפריט נפתח: בחירת מידה');
    });
  });

  describe('Label Set Constants', () => {
    it('should have all required labels in Arabic set', () => {
      expect(ARABIC_FOCUS_LABELS.skipToContent).toBeDefined();
      expect(ARABIC_FOCUS_LABELS.skipToNavigation).toBeDefined();
      expect(ARABIC_FOCUS_LABELS.skipToSearch).toBeDefined();
      expect(ARABIC_FOCUS_LABELS.skipToFooter).toBeDefined();
      expect(ARABIC_FOCUS_LABELS.focusVisible).toBeDefined();
      expect(ARABIC_FOCUS_LABELS.focusTrapped).toBeDefined();
      expect(ARABIC_FOCUS_LABELS.focusReturned).toBeDefined();
      expect(ARABIC_FOCUS_LABELS.keyboardMode).toBeDefined();
      expect(ARABIC_FOCUS_LABELS.mouseMode).toBeDefined();
    });

    it('should have all required labels in Hebrew set', () => {
      expect(HEBREW_FOCUS_LABELS.skipToContent).toBeDefined();
      expect(HEBREW_FOCUS_LABELS.skipToNavigation).toBeDefined();
      expect(HEBREW_FOCUS_LABELS.skipToSearch).toBeDefined();
      expect(HEBREW_FOCUS_LABELS.skipToFooter).toBeDefined();
      expect(HEBREW_FOCUS_LABELS.focusVisible).toBeDefined();
      expect(HEBREW_FOCUS_LABELS.focusTrapped).toBeDefined();
      expect(HEBREW_FOCUS_LABELS.focusReturned).toBeDefined();
    });

    it('should have all required labels in English set', () => {
      expect(ENGLISH_FOCUS_LABELS.skipToContent).toBeDefined();
      expect(ENGLISH_FOCUS_LABELS.skipToNavigation).toBeDefined();
      expect(ENGLISH_FOCUS_LABELS.skipToSearch).toBeDefined();
      expect(ENGLISH_FOCUS_LABELS.skipToFooter).toBeDefined();
      expect(ENGLISH_FOCUS_LABELS.focusVisible).toBeDefined();
      expect(ENGLISH_FOCUS_LABELS.focusTrapped).toBeDefined();
      expect(ENGLISH_FOCUS_LABELS.focusReturned).toBeDefined();
    });

    it('should have matching label keys across all locales', () => {
      const arKeys = Object.keys(ARABIC_FOCUS_LABELS);
      const heKeys = Object.keys(HEBREW_FOCUS_LABELS);
      const enKeys = Object.keys(ENGLISH_FOCUS_LABELS);
      
      expect(arKeys.sort()).toEqual(heKeys.sort());
      expect(heKeys.sort()).toEqual(enKeys.sort());
    });
  });

  describe('Available Skip Link Sections', () => {
    it('should return array of section keys', () => {
      const sections = getAvailableSkipLinkSections();
      expect(Array.isArray(sections)).toBe(true);
      expect(sections.length).toBeGreaterThan(0);
    });

    it('should include common sections', () => {
      const sections = getAvailableSkipLinkSections();
      expect(sections).toContain('content');
      expect(sections).toContain('navigation');
      expect(sections).toContain('footer');
      expect(sections).toContain('products');
      expect(sections).toContain('cart');
    });

    it('should include filter and sort sections', () => {
      const sections = getAvailableSkipLinkSections();
      expect(sections).toContain('filters');
      expect(sections).toContain('sort');
      expect(sections).toContain('pagination');
    });
  });
});
