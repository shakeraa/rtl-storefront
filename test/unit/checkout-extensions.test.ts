import { describe, it, expect } from 'vitest';
import {
  buildCheckoutConfig,
  buildCheckoutBranding,
  getCheckoutTranslations,
} from '../../app/services/checkout-extensions/config';

describe('Checkout Extensions - buildCheckoutConfig', () => {
  it('returns config with locale, direction, and available locales', () => {
    const config = buildCheckoutConfig('test-shop', 'en');

    expect(config.shop).toBe('test-shop');
    expect(config.locale).toBe('en');
    expect(config.direction).toBeDefined();
    expect(config.availableLocales).toBeInstanceOf(Array);
    expect(config.availableLocales.length).toBeGreaterThan(0);
  });

  it('sets direction to "rtl" for Arabic locale', () => {
    const config = buildCheckoutConfig('test-shop', 'ar');

    expect(config.direction).toBe('rtl');
  });

  it('sets direction to "ltr" for English locale', () => {
    const config = buildCheckoutConfig('test-shop', 'en');

    expect(config.direction).toBe('ltr');
  });

  it('enables MENA payments for RTL locales', () => {
    const config = buildCheckoutConfig('test-shop', 'ar');

    expect(config.enableMenaPayments).toBe(true);
  });

  it('disables MENA payments for LTR locales', () => {
    const config = buildCheckoutConfig('test-shop', 'en');

    expect(config.enableMenaPayments).toBe(false);
  });

  it('includes available currencies', () => {
    const config = buildCheckoutConfig('test-shop', 'ar');

    expect(config.availableCurrencies.length).toBeGreaterThan(0);
    const codes = config.availableCurrencies.map((c) => c.code);
    expect(codes).toContain('SAR');
    expect(codes).toContain('AED');
  });

  it('sets direction to "rtl" for Hebrew locale', () => {
    const config = buildCheckoutConfig('test-shop', 'he');

    expect(config.direction).toBe('rtl');
  });
});

describe('Checkout Extensions - buildCheckoutBranding', () => {
  it('returns direction "rtl" and has fontFamily for Arabic', () => {
    const branding = buildCheckoutBranding('ar');

    expect(branding.direction).toBe('rtl');
    expect(branding.fontFamily).toBeDefined();
    expect(branding.fontFamily).toContain('Noto Sans Arabic');
  });

  it('returns direction "ltr" for English', () => {
    const branding = buildCheckoutBranding('en');

    expect(branding.direction).toBe('ltr');
    expect(branding.fontFamily).toContain('Inter');
  });

  it('includes all expected branding properties', () => {
    const branding = buildCheckoutBranding('ar');

    expect(branding.primaryColor).toBeDefined();
    expect(branding.backgroundColor).toBeDefined();
    expect(branding.textColor).toBeDefined();
    expect(branding.borderRadius).toBeDefined();
  });
});

describe('Checkout Extensions - getCheckoutTranslations', () => {
  it('returns Arabic labels for "ar" locale', () => {
    const translations = getCheckoutTranslations('ar');

    expect(translations.locale).toBe('ar');
    expect(translations.labels.orderSummary).toBe('ملخص الطلب');
    expect(translations.labels.payNow).toBe('ادفع الآن');
  });

  it('returns English labels for "en" locale', () => {
    const translations = getCheckoutTranslations('en');

    expect(translations.locale).toBe('en');
    expect(translations.labels.orderSummary).toBe('Order summary');
    expect(translations.labels.total).toBe('Total');
  });

  it('falls back to English for unknown locale', () => {
    const translations = getCheckoutTranslations('unknown');

    expect(translations.labels.orderSummary).toBe('Order summary');
    expect(translations.labels.payNow).toBe('Pay now');
  });
});
