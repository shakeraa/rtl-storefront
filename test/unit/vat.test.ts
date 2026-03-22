import { describe, it, expect } from 'vitest';
import {
  getVATConfig,
  calculateVAT,
  isGCCCountry,
  getGCCCountries,
  validateVATNumber,
  generateInvoiceNumber,
} from '../../app/services/vat/index';

describe('VAT Service', () => {
  describe('getVATConfig', () => {
    it('returns rate 0.15 for SA', () => {
      const config = getVATConfig('SA');
      expect(config).not.toBeNull();
      expect(config!.rate).toBe(0.15);
    });

    it('returns rate 0.05 for AE', () => {
      const config = getVATConfig('AE');
      expect(config).not.toBeNull();
      expect(config!.rate).toBe(0.05);
    });

    it('returns rate 0 for KW', () => {
      const config = getVATConfig('KW');
      expect(config).not.toBeNull();
      expect(config!.rate).toBe(0);
    });

    it('returns null for unknown country XX', () => {
      expect(getVATConfig('XX')).toBeNull();
    });
  });

  describe('calculateVAT', () => {
    it('SA 15% inclusive: vatAmount ~13.04, total=100', () => {
      const result = calculateVAT(100, 'SA', 'SAR');
      expect(result.total).toBe(100);
      expect(result.vatAmount).toBeCloseTo(13.04, 2);
      expect(result.inclusive).toBe(true);
    });

    it('AE 5% inclusive: vatAmount ~4.76, total=100', () => {
      const result = calculateVAT(100, 'AE', 'AED');
      expect(result.total).toBe(100);
      expect(result.vatAmount).toBeCloseTo(4.76, 2);
      expect(result.inclusive).toBe(true);
    });

    it('KW 0%: vatAmount=0, total=100', () => {
      const result = calculateVAT(100, 'KW', 'KWD');
      expect(result.total).toBe(100);
      expect(result.vatAmount).toBe(0);
    });
  });

  describe('isGCCCountry', () => {
    it('returns true for SA', () => {
      expect(isGCCCountry('SA')).toBe(true);
    });

    it('returns false for US', () => {
      expect(isGCCCountry('US')).toBe(false);
    });
  });

  describe('getGCCCountries', () => {
    it('returns 6 countries', () => {
      const countries = getGCCCountries();
      expect(countries).toHaveLength(6);
      expect(countries).toContain('SA');
      expect(countries).toContain('AE');
      expect(countries).toContain('KW');
    });
  });

  describe('validateVATNumber', () => {
    it('validates correct SA VAT number (15 digits, starts/ends with 3)', () => {
      expect(validateVATNumber('300000000000003', 'SA')).toBe(true);
    });

    it('rejects too-short SA VAT number', () => {
      expect(validateVATNumber('123', 'SA')).toBe(false);
    });
  });

  describe('generateInvoiceNumber', () => {
    it('returns non-empty string with date pattern', () => {
      const invoice = generateInvoiceNumber('test-shop');
      expect(invoice).toBeTruthy();
      expect(invoice.length).toBeGreaterThan(0);
      // Format: PREFIX-YYMMDD-RANDOM
      expect(invoice).toMatch(/^[A-Z]{1,4}-\d{6}-[A-Z0-9]{4}$/);
    });
  });
});
