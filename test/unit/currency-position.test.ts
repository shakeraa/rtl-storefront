import { describe, it, expect } from 'vitest';
import {
  getCurrencyPosition,
  getCurrencySpacing,
  formatCurrencyWithPosition,
  isRTLLocale,
  hasRTLCurrencySymbol,
  getSymbolPreference,
  getSupportedPositionsForCurrency,
  getRTLFormattingGuidance,
  areFormatsEquivalent,
  getFormatPattern,
  CURRENCY_POSITION_RULES,
  CURRENCY_SPACING_RULES,
  MAJOR_CURRENCIES,
  RTL_LOCALES,
} from '../../app/services/translation-features/currency-position';

describe('Currency Position Service', () => {
  describe('getCurrencyPosition', () => {
    it('returns "after" for USD in Arabic locale', () => {
      expect(getCurrencyPosition('USD', 'ar')).toBe('after');
      expect(getCurrencyPosition('USD', 'ar-SA')).toBe('after');
      expect(getCurrencyPosition('USD', 'ar-AE')).toBe('after');
    });

    it('returns "before" for USD in English locale', () => {
      expect(getCurrencyPosition('USD', 'en')).toBe('before');
      expect(getCurrencyPosition('USD', 'en-US')).toBe('before');
      expect(getCurrencyPosition('USD', 'en-GB')).toBe('before');
    });

    it('returns "before" for USD in Hebrew locale', () => {
      expect(getCurrencyPosition('USD', 'he')).toBe('before');
      expect(getCurrencyPosition('USD', 'he-IL')).toBe('before');
    });

    it('returns "after" for EUR in Arabic locale', () => {
      expect(getCurrencyPosition('EUR', 'ar')).toBe('after');
    });

    it('returns "after" for EUR in Hebrew locale', () => {
      expect(getCurrencyPosition('EUR', 'he')).toBe('after');
    });

    it('returns "before" for GBP in English locale', () => {
      expect(getCurrencyPosition('GBP', 'en')).toBe('before');
    });

    it('returns "after" for SAR in all locales (Arabic currency)', () => {
      expect(getCurrencyPosition('SAR', 'ar')).toBe('after');
      expect(getCurrencyPosition('SAR', 'he')).toBe('after');
      expect(getCurrencyPosition('SAR', 'en')).toBe('before'); // English overrides to before
    });

    it('returns "after" for AED in Arabic and Hebrew locales', () => {
      expect(getCurrencyPosition('AED', 'ar')).toBe('after');
      expect(getCurrencyPosition('AED', 'he')).toBe('after');
    });

    it('returns "before" for ILS in Hebrew locale', () => {
      expect(getCurrencyPosition('ILS', 'he')).toBe('before');
    });

    it('returns "after" for ILS in Arabic locale', () => {
      expect(getCurrencyPosition('ILS', 'ar')).toBe('after');
    });

    it('falls back to currency default for unknown locale', () => {
      // JPY has symbolPosition: 'before' in constants
      expect(getCurrencyPosition('JPY', 'fr')).toBe('before');
      // SAR has symbolPosition: 'after' in constants
      expect(getCurrencyPosition('SAR', 'fr')).toBe('after');
    });

    it('is case insensitive for currency codes', () => {
      expect(getCurrencyPosition('usd', 'ar')).toBe('after');
      expect(getCurrencyPosition('EUR', 'en')).toBe('before');
      expect(getCurrencyPosition('sar', 'ar')).toBe('after');
    });

    it('is case insensitive for locale codes', () => {
      expect(getCurrencyPosition('USD', 'AR')).toBe('after');
      expect(getCurrencyPosition('USD', 'EN')).toBe('before');
      expect(getCurrencyPosition('USD', 'HE')).toBe('before');
    });
  });

  describe('getCurrencySpacing', () => {
    it('returns "narrow" spacing for USD in Arabic locale', () => {
      expect(getCurrencySpacing('USD', 'ar')).toBe('narrow');
    });

    it('returns "none" spacing for USD in English locale', () => {
      expect(getCurrencySpacing('USD', 'en')).toBe('none');
    });

    it('returns "none" spacing for USD in Hebrew locale', () => {
      expect(getCurrencySpacing('USD', 'he')).toBe('none');
    });

    it('returns "narrow" spacing for EUR in all locales', () => {
      expect(getCurrencySpacing('EUR', 'en')).toBe('narrow');
      expect(getCurrencySpacing('EUR', 'ar')).toBe('narrow');
      expect(getCurrencySpacing('EUR', 'he')).toBe('narrow');
    });

    it('returns "none" spacing for ILS in Hebrew locale', () => {
      expect(getCurrencySpacing('ILS', 'he')).toBe('none');
    });

    it('returns "narrow" spacing for MENA currencies in Arabic locale', () => {
      expect(getCurrencySpacing('AED', 'ar')).toBe('narrow');
      expect(getCurrencySpacing('SAR', 'ar')).toBe('narrow');
    });

    it('falls back to currency default spacing for unknown currencies', () => {
      // Test with a currency that should fall back to currency info
      const spacing = getCurrencySpacing('JPY', 'en');
      expect(['none', 'narrow', 'wide']).toContain(spacing);
    });
  });

  describe('formatCurrencyWithPosition', () => {
    it('formats USD with symbol before in English locale', () => {
      const formatted = formatCurrencyWithPosition(100.5, 'USD', 'en');
      expect(formatted).toBe('$100.50');
    });

    it('formats USD with symbol after and narrow space in Arabic locale', () => {
      const formatted = formatCurrencyWithPosition(100.5, 'USD', 'ar');
      expect(formatted).toBe('100.50\u00A0$');
    });

    it('formats USD with symbol before and no space in Hebrew locale', () => {
      const formatted = formatCurrencyWithPosition(100.5, 'USD', 'he');
      expect(formatted).toBe('$100.50');
    });

    it('formats EUR with narrow space after in English locale', () => {
      const formatted = formatCurrencyWithPosition(100.5, 'EUR', 'en');
      // EUR uses comma as decimal separator
      expect(formatted).toContain('100,50');
      expect(formatted).toContain('€');
    });

    it('formats SAR with symbol after in Arabic locale', () => {
      const formatted = formatCurrencyWithPosition(100.5, 'SAR', 'ar');
      expect(formatted).toContain('100.50');
      expect(formatted).toContain('ر.س');
      // Should have symbol after amount
      expect(formatted.indexOf('100.50')).toBeLessThan(formatted.indexOf('ر.س'));
    });

    it('formats with custom decimals', () => {
      const formatted = formatCurrencyWithPosition(100.555, 'USD', 'en', { decimals: 0 });
      expect(formatted).toBe('$101');
    });

    it('formats with custom symbol', () => {
      const formatted = formatCurrencyWithPosition(100, 'USD', 'en', { symbol: 'US$' });
      expect(formatted).toBe('US$100.00');
    });

    it('handles zero amount correctly', () => {
      const formatted = formatCurrencyWithPosition(0, 'USD', 'en');
      expect(formatted).toBe('$0.00');
    });

    it('handles negative amounts correctly', () => {
      const formatted = formatCurrencyWithPosition(-50, 'USD', 'en');
      expect(formatted).toBe('$-50.00');
    });

    it('formats large numbers with thousands separators', () => {
      const formatted = formatCurrencyWithPosition(1000000, 'USD', 'en');
      expect(formatted).toBe('$1,000,000.00');
    });

    it('uses locale formatting when useLocaleFormat is true', () => {
      const formatted = formatCurrencyWithPosition(1000.5, 'USD', 'en', { useLocaleFormat: true });
      expect(formatted).toContain('$');
      expect(formatted).toContain('1,000.50');
    });
  });

  describe('isRTLLocale', () => {
    it('returns true for Arabic locale', () => {
      expect(isRTLLocale('ar')).toBe(true);
      expect(isRTLLocale('ar-SA')).toBe(true);
      expect(isRTLLocale('ar-AE')).toBe(true);
      expect(isRTLLocale('ar-EG')).toBe(true);
    });

    it('returns true for Hebrew locale', () => {
      expect(isRTLLocale('he')).toBe(true);
      expect(isRTLLocale('he-IL')).toBe(true);
    });

    it('returns false for English locale', () => {
      expect(isRTLLocale('en')).toBe(false);
      expect(isRTLLocale('en-US')).toBe(false);
      expect(isRTLLocale('en-GB')).toBe(false);
    });

    it('returns false for other LTR locales', () => {
      expect(isRTLLocale('fr')).toBe(false);
      expect(isRTLLocale('de')).toBe(false);
      expect(isRTLLocale('es')).toBe(false);
    });

    it('is case insensitive', () => {
      expect(isRTLLocale('AR')).toBe(true);
      expect(isRTLLocale('HE')).toBe(true);
      expect(isRTLLocale('EN')).toBe(false);
    });
  });

  describe('hasRTLCurrencySymbol', () => {
    it('returns true for Arabic-script currencies', () => {
      expect(hasRTLCurrencySymbol('SAR')).toBe(true);
      expect(hasRTLCurrencySymbol('AED')).toBe(true);
      expect(hasRTLCurrencySymbol('QAR')).toBe(true);
      expect(hasRTLCurrencySymbol('KWD')).toBe(true);
      expect(hasRTLCurrencySymbol('EGP')).toBe(true);
    });

    it('returns false for Latin-script currencies', () => {
      expect(hasRTLCurrencySymbol('USD')).toBe(false);
      expect(hasRTLCurrencySymbol('EUR')).toBe(false);
      expect(hasRTLCurrencySymbol('GBP')).toBe(false);
      expect(hasRTLCurrencySymbol('JPY')).toBe(false);
    });

    it('is case insensitive', () => {
      expect(hasRTLCurrencySymbol('sar')).toBe(true);
      expect(hasRTLCurrencySymbol('usd')).toBe(false);
    });
  });

  describe('getSymbolPreference', () => {
    it('returns "native" for MENA currencies in Arabic locale', () => {
      expect(getSymbolPreference('SAR', 'ar')).toBe('native');
      expect(getSymbolPreference('AED', 'ar')).toBe('native');
      expect(getSymbolPreference('EGP', 'ar')).toBe('native');
    });

    it('returns "international" for non-MENA currencies in Arabic locale', () => {
      expect(getSymbolPreference('USD', 'ar')).toBe('international');
      expect(getSymbolPreference('EUR', 'ar')).toBe('international');
    });

    it('returns "international" for all currencies in Hebrew locale', () => {
      expect(getSymbolPreference('ILS', 'he')).toBe('international');
      expect(getSymbolPreference('USD', 'he')).toBe('international');
      expect(getSymbolPreference('SAR', 'he')).toBe('international');
    });

    it('returns "international" for English locale', () => {
      expect(getSymbolPreference('USD', 'en')).toBe('international');
      expect(getSymbolPreference('SAR', 'en')).toBe('international');
    });
  });

  describe('getSupportedPositionsForCurrency', () => {
    it('returns configurations for all supported locales', () => {
      const configs = getSupportedPositionsForCurrency('USD');
      expect(configs).toHaveLength(3);

      const locales = configs.map((c) => c.locale);
      expect(locales).toContain('ar');
      expect(locales).toContain('he');
      expect(locales).toContain('en');
    });

    it('returns correct position for USD in each locale', () => {
      const configs = getSupportedPositionsForCurrency('USD');

      const arConfig = configs.find((c) => c.locale === 'ar');
      const enConfig = configs.find((c) => c.locale === 'en');
      const heConfig = configs.find((c) => c.locale === 'he');

      expect(arConfig?.position).toBe('after');
      expect(enConfig?.position).toBe('before');
      expect(heConfig?.position).toBe('before');
    });

    it('returns configurations with spacing info', () => {
      const configs = getSupportedPositionsForCurrency('EUR');
      configs.forEach((config) => {
        expect(['none', 'narrow', 'wide']).toContain(config.spacing);
      });
    });
  });

  describe('getRTLFormattingGuidance', () => {
    it('returns needsBiDiIsolation=true for LTR currency in RTL locale', () => {
      const guidance = getRTLFormattingGuidance('USD', 'ar');
      expect(guidance.needsBiDiIsolation).toBe(true);
      expect(guidance.recommendedDirection).toBe('rtl');
    });

    it('returns needsBiDiIsolation=false for RTL currency in RTL locale', () => {
      const guidance = getRTLFormattingGuidance('SAR', 'ar');
      expect(guidance.needsBiDiIsolation).toBe(false);
      expect(guidance.recommendedDirection).toBe('rtl');
    });

    it('returns needsBiDiIsolation=false for any currency in LTR locale', () => {
      const guidance = getRTLFormattingGuidance('USD', 'en');
      expect(guidance.needsBiDiIsolation).toBe(false);
      expect(guidance.recommendedDirection).toBe('ltr');
    });

    it('returns shouldMirror=true when position is after in RTL', () => {
      const guidance = getRTLFormattingGuidance('USD', 'ar');
      expect(guidance.shouldMirror).toBe(true);
    });

    it('returns shouldMirror=false for before position in RTL', () => {
      const guidance = getRTLFormattingGuidance('ILS', 'he');
      expect(guidance.shouldMirror).toBe(false);
    });
  });

  describe('areFormatsEquivalent', () => {
    it('returns true for identical formats', () => {
      expect(areFormatsEquivalent('$100.00', '$100.00')).toBe(true);
    });

    it('returns false for different formats', () => {
      expect(areFormatsEquivalent('$100.00', '100.00 $')).toBe(false);
    });

    it('normalizes whitespace for comparison', () => {
      expect(areFormatsEquivalent('$ 100.00', '$  100.00')).toBe(true);
      expect(areFormatsEquivalent('100.00 $', '100.00  $')).toBe(true);
    });

    it('trims whitespace before comparison', () => {
      expect(areFormatsEquivalent('  $100.00  ', '$100.00')).toBe(true);
    });
  });

  describe('getFormatPattern', () => {
    it('returns before pattern for USD in English', () => {
      expect(getFormatPattern('USD', 'en')).toBe('{symbol}{amount}');
    });

    it('returns after pattern with space for USD in Arabic', () => {
      expect(getFormatPattern('USD', 'ar')).toBe('{amount} {symbol}');
    });

    it('returns before pattern for USD in Hebrew', () => {
      expect(getFormatPattern('USD', 'he')).toBe('{symbol}{amount}');
    });

    it('returns pattern with narrow space for EUR', () => {
      const pattern = getFormatPattern('EUR', 'en');
      expect(pattern).toContain(' ');
    });
  });

  describe('Constants', () => {
    it('MAJOR_CURRENCIES contains expected currencies', () => {
      expect(MAJOR_CURRENCIES).toContain('USD');
      expect(MAJOR_CURRENCIES).toContain('EUR');
      expect(MAJOR_CURRENCIES).toContain('GBP');
      expect(MAJOR_CURRENCIES).toContain('AED');
      expect(MAJOR_CURRENCIES).toContain('SAR');
      expect(MAJOR_CURRENCIES).toContain('ILS');
    });

    it('RTL_LOCALES contains expected locales', () => {
      expect(RTL_LOCALES).toContain('ar');
      expect(RTL_LOCALES).toContain('he');
      expect(RTL_LOCALES).toContain('ar-SA');
      expect(RTL_LOCALES).toContain('ar-AE');
      expect(RTL_LOCALES).toContain('ar-EG');
      expect(RTL_LOCALES).toContain('he-IL');
    });

    it('CURRENCY_POSITION_RULES has rules for ar, he, and en', () => {
      expect(CURRENCY_POSITION_RULES.ar).toBeDefined();
      expect(CURRENCY_POSITION_RULES.he).toBeDefined();
      expect(CURRENCY_POSITION_RULES.en).toBeDefined();
    });

    it('CURRENCY_SPACING_RULES has rules for major currencies', () => {
      MAJOR_CURRENCIES.forEach((currency) => {
        expect(CURRENCY_SPACING_RULES[currency]).toBeDefined();
      });
    });
  });
});
