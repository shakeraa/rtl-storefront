import { describe, it, expect } from 'vitest';
import {
  getNewsletterLabel,
  getSubscribeForm,
  getSuccessMessage,
  getUnsubscribeLabels,
  getAllNewsletterLabels,
  getEmailValidationError,
  getRequiredFieldError,
  isRtlLocale,
  getTextDirection,
} from '../../app/services/ui-labels/newsletter';

describe('Newsletter - Labels', () => {
  describe('getNewsletterLabel', () => {
    it('returns English subscribe label for "en" locale', () => {
      const result = getNewsletterLabel('subscribe', 'en');
      expect(result).toBe('Subscribe to our newsletter');
    });

    it('returns Arabic subscribe label for "ar" locale', () => {
      const result = getNewsletterLabel('subscribe', 'ar');
      expect(result).toBe('اشترك في نشرتنا الإخبارية');
    });

    it('returns Hebrew subscribe label for "he" locale', () => {
      const result = getNewsletterLabel('subscribe', 'he');
      expect(result).toBe('הירשם לניוזלטר שלנו');
    });

    it('returns English email placeholder for "en" locale', () => {
      const result = getNewsletterLabel('emailPlaceholder', 'en');
      expect(result).toBe('Enter your email address');
    });

    it('returns Arabic email placeholder for "ar" locale', () => {
      const result = getNewsletterLabel('emailPlaceholder', 'ar');
      expect(result).toBe('أدخل عنوان بريدك الإلكتروني');
    });

    it('returns Hebrew email placeholder for "he" locale', () => {
      const result = getNewsletterLabel('emailPlaceholder', 'he');
      expect(result).toBe('הזן את כתובת האימייל שלך');
    });

    it('returns correct subscribe button labels for all locales', () => {
      expect(getNewsletterLabel('subscribeButton', 'en')).toBe('Subscribe');
      expect(getNewsletterLabel('subscribeButton', 'ar')).toBe('اشتراك');
      expect(getNewsletterLabel('subscribeButton', 'he')).toBe('הרשמה');
    });

    it('returns correct unsubscribe labels for all locales', () => {
      expect(getNewsletterLabel('unsubscribe', 'en')).toBe('Unsubscribe');
      expect(getNewsletterLabel('unsubscribe', 'ar')).toBe('إلغاء الاشتراك');
      expect(getNewsletterLabel('unsubscribe', 'he')).toBe('ביטול הרשמה');
    });

    it('falls back to English for unknown locale', () => {
      const result = getNewsletterLabel('subscribe', 'unknown');
      expect(result).toBe('Subscribe to our newsletter');
    });

    it('handles locale with region subtag (ar-SA)', () => {
      const result = getNewsletterLabel('subscribe', 'ar-SA');
      expect(result).toBe('اشترك في نشرتنا الإخبارية');
    });

    it('handles locale with region subtag (he-IL)', () => {
      const result = getNewsletterLabel('subscribe', 'he-IL');
      expect(result).toBe('הירשם לניוזלטר שלנו');
    });
  });

  describe('getSubscribeForm', () => {
    it('returns English form labels for "en" locale', () => {
      const labels = getSubscribeForm('en');
      expect(labels.title).toBe('Stay Updated');
      expect(labels.description).toBe('Get the latest news, updates, and exclusive offers directly to your inbox.');
      expect(labels.emailLabel).toBe('Email Address');
      expect(labels.submitButton).toBe('Subscribe Now');
    });

    it('returns Arabic form labels for "ar" locale', () => {
      const labels = getSubscribeForm('ar');
      expect(labels.title).toBe('ابقَ على اطلاع');
      expect(labels.emailLabel).toBe('عنوان البريد الإلكتروني');
      expect(labels.submitButton).toBe('اشترك الآن');
    });

    it('returns Hebrew form labels for "he" locale', () => {
      const labels = getSubscribeForm('he');
      expect(labels.title).toBe('הישאר מעודכן');
      expect(labels.emailLabel).toBe('כתובת אימייל');
      expect(labels.submitButton).toBe('הירשם עכשיו');
    });

    it('includes validation error messages in form labels', () => {
      const labelsEn = getSubscribeForm('en');
      expect(labelsEn.requiredError).toBe('Email address is required');
      expect(labelsEn.invalidEmailError).toBe('Please enter a valid email address');

      const labelsAr = getSubscribeForm('ar');
      expect(labelsAr.requiredError).toBe('عنوان البريد الإلكتروني مطلوب');
      expect(labelsAr.invalidEmailError).toBe('يرجى إدخال عنوان بريد إلكتروني صالح');
    });

    it('includes privacy text and link in form labels', () => {
      const labelsEn = getSubscribeForm('en');
      expect(labelsEn.privacyText).toBe('We respect your privacy. Read our');
      expect(labelsEn.privacyLink).toBe('Privacy Policy');

      const labelsHe = getSubscribeForm('he');
      expect(labelsHe.privacyLink).toBe('מדיניות הפרטיות');
    });

    it('falls back to English for unknown locale', () => {
      const labels = getSubscribeForm('unknown');
      expect(labels.title).toBe('Stay Updated');
    });
  });

  describe('getSuccessMessage', () => {
    it('returns English success message with email', () => {
      const result = getSuccessMessage('test@example.com', 'en');
      expect(result).toContain('test@example.com');
      expect(result).toContain('Thank you!');
      expect(result).toContain('confirmation email');
    });

    it('returns Arabic success message with email', () => {
      const result = getSuccessMessage('test@example.com', 'ar');
      expect(result).toContain('test@example.com');
      expect(result).toContain('شكراً لك!');
    });

    it('returns Hebrew success message with email', () => {
      const result = getSuccessMessage('test@example.com', 'he');
      expect(result).toContain('test@example.com');
      expect(result).toContain('תודה!');
    });

    it('falls back to English for unknown locale', () => {
      const result = getSuccessMessage('user@test.com', 'unknown');
      expect(result).toContain('user@test.com');
      expect(result).toContain('Thank you!');
    });

    it('handles locale with region subtag', () => {
      const result = getSuccessMessage('user@test.com', 'ar-SA');
      expect(result).toContain('شكراً لك!');
    });
  });

  describe('getUnsubscribeLabels', () => {
    it('returns English unsubscribe labels', () => {
      const labels = getUnsubscribeLabels('en');
      expect(labels.title).toBe('Unsubscribe from Newsletter');
      expect(labels.submitButton).toBe('Unsubscribe');
      expect(labels.successMessage).toBe('You have been successfully unsubscribed.');
    });

    it('returns Arabic unsubscribe labels', () => {
      const labels = getUnsubscribeLabels('ar');
      expect(labels.title).toBe('إلغاء الاشتراك في النشرة الإخبارية');
      expect(labels.submitButton).toBe('إلغاء الاشتراك');
      expect(labels.successMessage).toBe('تم إلغاء اشتراكك بنجاح.');
    });

    it('returns Hebrew unsubscribe labels', () => {
      const labels = getUnsubscribeLabels('he');
      expect(labels.title).toBe('ביטול הרשמה לניוזלטר');
      expect(labels.submitButton).toBe('ביטול הרשמה');
      expect(labels.successMessage).toBe('ההרשמה שלך בוטלה בהצלחה.');
    });

    it('falls back to English for unknown locale', () => {
      const labels = getUnsubscribeLabels('unknown');
      expect(labels.title).toBe('Unsubscribe from Newsletter');
    });
  });

  describe('getAllNewsletterLabels', () => {
    it('returns all newsletter labels for English locale', () => {
      const labels = getAllNewsletterLabels('en');
      expect(labels.subscribe).toBe('Subscribe to our newsletter');
      expect(labels.emailPlaceholder).toBe('Enter your email address');
      expect(labels.subscribeButton).toBe('Subscribe');
      expect(labels.successMessage).toBeDefined();
      expect(labels.errorMessage).toBeDefined();
      expect(labels.privacyNotice).toBeDefined();
      expect(labels.unsubscribe).toBe('Unsubscribe');
    });

    it('returns all newsletter labels for Arabic locale', () => {
      const labels = getAllNewsletterLabels('ar');
      expect(labels.subscribe).toBe('اشترك في نشرتنا الإخبارية');
      expect(labels.unsubscribe).toBe('إلغاء الاشتراك');
    });

    it('returns all newsletter labels for Hebrew locale', () => {
      const labels = getAllNewsletterLabels('he');
      expect(labels.subscribe).toBe('הירשם לניוזלטר שלנו');
      expect(labels.unsubscribe).toBe('ביטול הרשמה');
    });
  });

  describe('getEmailValidationError', () => {
    it('returns English validation error', () => {
      expect(getEmailValidationError('en')).toBe('Please enter a valid email address');
    });

    it('returns Arabic validation error', () => {
      expect(getEmailValidationError('ar')).toBe('يرجى إدخال عنوان بريد إلكتروني صالح');
    });

    it('returns Hebrew validation error', () => {
      expect(getEmailValidationError('he')).toBe('אנא הזן כתובת אימייל חוקית');
    });

    it('falls back to English for unknown locale', () => {
      expect(getEmailValidationError('unknown')).toBe('Please enter a valid email address');
    });
  });

  describe('getRequiredFieldError', () => {
    it('returns English required field error', () => {
      expect(getRequiredFieldError('en')).toBe('Email address is required');
    });

    it('returns Arabic required field error', () => {
      expect(getRequiredFieldError('ar')).toBe('عنوان البريد الإلكتروني مطلوب');
    });

    it('returns Hebrew required field error', () => {
      expect(getRequiredFieldError('he')).toBe('כתובת אימייל נדרשת');
    });

    it('falls back to English for unknown locale', () => {
      expect(getRequiredFieldError('unknown')).toBe('Email address is required');
    });
  });

  describe('isRtlLocale', () => {
    it('returns true for Arabic locale', () => {
      expect(isRtlLocale('ar')).toBe(true);
      expect(isRtlLocale('ar-SA')).toBe(true);
      expect(isRtlLocale('ar-EG')).toBe(true);
    });

    it('returns true for Hebrew locale', () => {
      expect(isRtlLocale('he')).toBe(true);
      expect(isRtlLocale('he-IL')).toBe(true);
    });

    it('returns false for English locale', () => {
      expect(isRtlLocale('en')).toBe(false);
      expect(isRtlLocale('en-US')).toBe(false);
      expect(isRtlLocale('en-GB')).toBe(false);
    });

    it('returns false for unknown locale', () => {
      expect(isRtlLocale('unknown')).toBe(false);
    });
  });

  describe('getTextDirection', () => {
    it('returns "rtl" for Arabic locale', () => {
      expect(getTextDirection('ar')).toBe('rtl');
      expect(getTextDirection('ar-SA')).toBe('rtl');
    });

    it('returns "rtl" for Hebrew locale', () => {
      expect(getTextDirection('he')).toBe('rtl');
      expect(getTextDirection('he-IL')).toBe('rtl');
    });

    it('returns "ltr" for English locale', () => {
      expect(getTextDirection('en')).toBe('ltr');
      expect(getTextDirection('en-US')).toBe('ltr');
    });

    it('returns "ltr" for unknown locale', () => {
      expect(getTextDirection('unknown')).toBe('ltr');
    });
  });
});
