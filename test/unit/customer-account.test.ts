import { describe, it, expect } from 'vitest';
import {
  getAccountLabels,
  getOrderStatusLabels,
  getOrderStatusLabel,
} from '../../app/services/customer-account/labels';
import {
  translateAccountPage,
  translateOrderStatus,
} from '../../app/services/customer-account/translator';
import type { AccountTranslationConfig } from '../../app/services/customer-account/types';

describe('Customer Account - Labels', () => {
  describe('getAccountLabels', () => {
    it('returns English labels for "en"', () => {
      const labels = getAccountLabels('en');
      expect(labels.login.signIn).toBe('Sign in');
      expect(labels.registration.createAccount).toBe('Create account');
      expect(labels.passwordReset.resetPassword).toBe('Reset password');
      expect(labels.accountDetails.myAccount).toBe('My account');
      expect(labels.orderHistory.orderHistory).toBe('Order history');
      expect(labels.addressBook.addressBook).toBe('Address book');
    });

    it('returns Arabic labels for "ar"', () => {
      const labels = getAccountLabels('ar');
      expect(labels.login.signIn).toBe('تسجيل الدخول');
      expect(labels.login.email).toBe('البريد الإلكتروني');
      expect(labels.registration.createAccount).toBe('إنشاء حساب');
      expect(labels.accountDetails.myAccount).toBe('حسابي');
    });

    it('returns Hebrew labels for "he"', () => {
      const labels = getAccountLabels('he');
      expect(labels.login.signIn).toBe('התחברות');
      expect(labels.login.password).toBe('סיסמה');
      expect(labels.registration.firstName).toBe('שם פרטי');
    });

    it('falls back to English for unknown locale', () => {
      const labels = getAccountLabels('unknown');
      expect(labels.login.signIn).toBe('Sign in');
      expect(labels.registration.createAccount).toBe('Create account');
    });

    it('handles locale with region subtag', () => {
      const labels = getAccountLabels('ar-SA');
      expect(labels.login.signIn).toBe('تسجيل الدخول');
    });
  });

  describe('getOrderStatusLabels', () => {
    it('returns Arabic status labels', () => {
      const labels = getOrderStatusLabels('ar');
      expect(labels).toHaveLength(7);

      const pending = labels.find((l) => l.status === 'pending');
      expect(pending?.label).toBe('قيد الانتظار');

      const shipped = labels.find((l) => l.status === 'shipped');
      expect(shipped?.label).toBe('تم الشحن');
    });

    it('returns English status labels', () => {
      const labels = getOrderStatusLabels('en');
      const delivered = labels.find((l) => l.status === 'delivered');
      expect(delivered?.label).toBe('Delivered');
    });

    it('falls back to English for unknown locale', () => {
      const labels = getOrderStatusLabels('zz');
      const cancelled = labels.find((l) => l.status === 'cancelled');
      expect(cancelled?.label).toBe('Cancelled');
    });
  });

  describe('getOrderStatusLabel', () => {
    it('returns specific Arabic status for "shipped"', () => {
      expect(getOrderStatusLabel('ar', 'shipped')).toBe('تم الشحن');
    });

    it('returns Hebrew status for "delivered"', () => {
      expect(getOrderStatusLabel('he', 'delivered')).toBe('נמסר');
    });

    it('returns the raw status string for unknown status', () => {
      expect(getOrderStatusLabel('ar', 'on_hold')).toBe('on_hold');
    });
  });
});

describe('Customer Account - Translator', () => {
  const makeConfig = (targetLocale: string): AccountTranslationConfig => ({
    sourceLocale: 'en',
    targetLocale,
    shop: 'test-shop.myshopify.com',
  });

  describe('translateAccountPage', () => {
    it('returns rtl direction for Arabic', () => {
      const result = translateAccountPage(makeConfig('ar'));
      expect(result.direction).toBe('rtl');
      expect(result.locale).toBe('ar');
    });

    it('returns ltr direction for English', () => {
      const result = translateAccountPage(makeConfig('en'));
      expect(result.direction).toBe('ltr');
      expect(result.locale).toBe('en');
    });

    it('includes Arabic labels for Arabic locale', () => {
      const result = translateAccountPage(makeConfig('ar'));
      expect(result.labels.login.signIn).toBe('تسجيل الدخول');
      expect(result.labels.addressBook.city).toBe('المدينة');
    });

    it('applies custom label overrides', () => {
      const result = translateAccountPage(makeConfig('en'), {
        login: { signIn: 'Log in' },
      });
      expect(result.labels.login.signIn).toBe('Log in');
      // Other labels remain unchanged
      expect(result.labels.login.email).toBe('Email');
    });
  });

  describe('translateOrderStatus', () => {
    it('returns localized status string for Arabic', () => {
      expect(translateOrderStatus('pending', 'ar')).toBe('قيد الانتظار');
    });

    it('returns localized status string for Hebrew', () => {
      expect(translateOrderStatus('cancelled', 'he')).toBe('בוטל');
    });

    it('returns raw status for unknown status value', () => {
      expect(translateOrderStatus('backorder', 'ar')).toBe('backorder');
    });
  });
});
