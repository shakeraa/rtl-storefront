import { describe, it, expect } from 'vitest';
import {
  CURRENCIES,
  getCurrency,
  getCurrencyByCountry,
  getAllCurrencyCodes,
  MENA_CURRENCIES,
  POPULAR_CURRENCIES,
  DEFAULT_CURRENCY,
} from '../../app/services/currency/constants';
import {
  convert,
  formatPrice,
  parsePrice,
  applyRounding,
  calculateExchangeRate,
  needsConversion,
  comparePrices,
  formatPriceRange,
} from '../../app/services/currency/converter';

describe('Currency Service', () => {
  describe('Constants', () => {
    it('has 50+ currencies', () => {
      expect(CURRENCIES.length).toBeGreaterThanOrEqual(50);
    });

    it('includes USD', () => {
      const usd = getCurrency('USD');
      expect(usd).toBeDefined();
      expect(usd?.name).toBe('US Dollar');
      expect(usd?.symbol).toBe('$');
      expect(usd?.decimals).toBe(2);
    });

    it('includes EUR', () => {
      const eur = getCurrency('EUR');
      expect(eur).toBeDefined();
      expect(eur?.symbol).toBe('€');
    });

    it('includes MENA currencies', () => {
      MENA_CURRENCIES.forEach((code) => {
        expect(getCurrency(code)).toBeDefined();
      });
    });

    it('includes SAR with Arabic symbol', () => {
      const sar = getCurrency('SAR');
      expect(sar).toBeDefined();
      expect(sar?.symbol).toBe('ر.س');
      expect(sar?.symbolPosition).toBe('after');
    });

    it('includes AED with Arabic symbol', () => {
      const aed = getCurrency('AED');
      expect(aed).toBeDefined();
      expect(aed?.symbol).toBe('د.إ');
    });

    it('can find currency by country code', () => {
      const usd = getCurrencyByCountry('US');
      expect(usd?.code).toBe('USD');
      
      const sar = getCurrencyByCountry('SA');
      expect(sar?.code).toBe('SAR');
    });

    it('returns all currency codes', () => {
      const codes = getAllCurrencyCodes();
      expect(codes.length).toBe(CURRENCIES.length);
      expect(codes).toContain('USD');
      expect(codes).toContain('EUR');
      expect(codes).toContain('SAR');
    });

    it('has correct default currency', () => {
      expect(DEFAULT_CURRENCY).toBe('USD');
    });
  });

  describe('Converter', () => {
    describe('convert', () => {
      it('converts USD to EUR', () => {
        const result = convert(100, 'USD', 'EUR', 0.92);
        expect(result.originalAmount).toBe(100);
        expect(result.originalCurrency).toBe('USD');
        expect(result.targetCurrency).toBe('EUR');
        expect(result.convertedAmount).toBe(92);
        expect(result.exchangeRate).toBe(0.92);
      });

      it('converts USD to SAR', () => {
        const result = convert(100, 'USD', 'SAR', 3.75);
        expect(result.convertedAmount).toBe(375);
      });

      it('applies rounding', () => {
        const result = convert(100.555, 'USD', 'EUR', 0.92);
        expect(result.convertedAmount).toBe(92.51);
      });

      it('handles same currency', () => {
        const result = convert(100, 'USD', 'USD', 1);
        expect(result.convertedAmount).toBe(100);
      });
    });

    describe('formatPrice', () => {
      it('formats USD correctly', () => {
        const formatted = formatPrice(100.5, 'USD');
        expect(formatted).toBe('$100.50');
      });

      it('formats EUR correctly', () => {
        const formatted = formatPrice(100.5, 'EUR');
        expect(formatted).toContain('100,50');
        expect(formatted).toContain('€');
      });

      it('formats SAR correctly with Arabic symbol', () => {
        const formatted = formatPrice(100.5, 'SAR');
        expect(formatted).toContain('100.50');
        expect(formatted).toContain('ر.س');
      });

      it('formats JPY without decimals', () => {
        const formatted = formatPrice(1000, 'JPY');
        expect(formatted).toBe('¥1,000');
      });

      it('returns code for unknown currency', () => {
        const formatted = formatPrice(100, 'XXX');
        expect(formatted).toBe('100 XXX');
      });

      it('can exclude symbol', () => {
        const formatted = formatPrice(100.5, 'USD', { includeSymbol: false });
        expect(formatted).toBe('100.50');
      });

      it('can use currency code instead of symbol', () => {
        const formatted = formatPrice(100.5, 'USD', { useCode: true });
        expect(formatted).toBe('100.50 USD');
      });
    });

    describe('parsePrice', () => {
      it('parses USD price', () => {
        const amount = parsePrice('$100.50', 'USD');
        expect(amount).toBe(100.5);
      });

      it('parses price without symbol', () => {
        const amount = parsePrice('100.50', 'USD');
        expect(amount).toBe(100.5);
      });

      it('parses price with thousands separator', () => {
        const amount = parsePrice('$1,000.50', 'USD');
        expect(amount).toBe(1000.5);
      });
    });

    describe('applyRounding', () => {
      it('rounds to nearest', () => {
        const result = applyRounding(100.555, { rule: 'nearest', to: 0.01 });
        expect(result).toBe(100.56);
      });

      it('rounds up', () => {
        const result = applyRounding(100.001, { rule: 'up', to: 0.01 });
        expect(result).toBe(100.01);
      });

      it('rounds down', () => {
        const result = applyRounding(100.999, { rule: 'down', to: 0.01 });
        expect(result).toBe(100.99);
      });

      it('no rounding', () => {
        const result = applyRounding(100.555, { rule: 'none', to: 0.01 });
        expect(result).toBe(100.555);
      });
    });

    describe('calculateExchangeRate', () => {
      it('calculates rate correctly', () => {
        const rate = calculateExchangeRate(100, 375);
        expect(rate).toBe(3.75);
      });

      it('handles zero amount', () => {
        const rate = calculateExchangeRate(0, 100);
        expect(rate).toBe(0);
      });
    });

    describe('needsConversion', () => {
      it('returns true for different currencies', () => {
        expect(needsConversion('USD', 'EUR')).toBe(true);
      });

      it('returns false for same currency', () => {
        expect(needsConversion('USD', 'USD')).toBe(false);
      });

      it('is case insensitive', () => {
        expect(needsConversion('usd', 'USD')).toBe(false);
      });
    });

    describe('comparePrices', () => {
      it('compares same currency', () => {
        const result = comparePrices(
          { amount: 100, currency: 'USD' },
          { amount: 90, currency: 'USD' },
          1
        );
        expect(result).toBe(10);
      });

      it('compares different currencies', () => {
        const result = comparePrices(
          { amount: 100, currency: 'USD' },
          { amount: 400, currency: 'SAR' },
          3.75
        );
        expect(result).toBeLessThan(0); // 375 SAR < 400 SAR
      });
    });

    describe('formatPriceRange', () => {
      it('formats range', () => {
        const range = formatPriceRange(100, 200, 'USD');
        expect(range).toBe('$100.00 - $200.00');
      });

      it('formats same price as single', () => {
        const range = formatPriceRange(100, 100, 'USD');
        expect(range).toBe('$100.00');
      });
    });
  });
});
