import { describe, it, expect } from 'vitest';
import {
  NeverTranslateProtector,
  createDefaultConfig,
  addSkuTerms,
  addBrandTerms,
  type NeverTranslateConfig,
} from '../../app/services/never-translate/index';

function makeConfig(overrides: Partial<NeverTranslateConfig> = {}): NeverTranslateConfig {
  return {
    terms: [],
    preserveAllCaps: false,
    preserveNumbers: false,
    preserveEmails: false,
    preserveUrls: false,
    ...overrides,
  };
}

describe('NeverTranslate Service', () => {
  describe('protect and restore', () => {
    it('replaces brand terms with placeholders', () => {
      const config = makeConfig({
        terms: [
          { term: 'Nike', type: 'exact', caseSensitive: false, category: 'brand' },
        ],
      });
      const protector = new NeverTranslateProtector(config);
      const result = protector.protect('Buy Nike shoes today');
      expect(result.protectedText).not.toContain('Nike');
      expect(result.protectedTerms).toContain('Nike');
      expect(result.placeholders.size).toBe(1);
    });

    it('restores placeholders back to original terms', () => {
      const config = makeConfig({
        terms: [
          { term: 'Adidas', type: 'exact', caseSensitive: false, category: 'brand' },
        ],
      });
      const protector = new NeverTranslateProtector(config);
      const result = protector.protect('Buy Adidas gear');
      const restored = protector.restore(result.protectedText, result.placeholders);
      expect(restored).toContain('Adidas');
    });

    it('round-trip: protect then restore returns original terms', () => {
      const config = makeConfig({
        terms: [
          { term: 'Samsung', type: 'exact', caseSensitive: false, category: 'brand' },
          { term: 'Galaxy S24', type: 'exact', caseSensitive: true, category: 'sku' },
        ],
      });
      const protector = new NeverTranslateProtector(config);
      const original = 'The Samsung Galaxy S24 is available now';
      const result = protector.protect(original);
      const restored = protector.restore(result.protectedText, result.placeholders);
      expect(restored).toBe(original);
    });
  });

  describe('email preservation', () => {
    it('protects emails when preserveEmails is true', () => {
      const config = makeConfig({ preserveEmails: true });
      const protector = new NeverTranslateProtector(config);
      const result = protector.protect('Contact us at info@example.com today');
      expect(result.protectedText).not.toContain('info@example.com');
      expect(result.protectedTerms).toContain('info@example.com');
    });
  });

  describe('URL preservation', () => {
    it('protects URLs when preserveUrls is true', () => {
      const config = makeConfig({ preserveUrls: true });
      const protector = new NeverTranslateProtector(config);
      const result = protector.protect('Visit https://example.com/shop for deals');
      expect(result.protectedText).not.toContain('https://example.com/shop');
      expect(result.protectedTerms).toContain('https://example.com/shop');
    });
  });

  describe('ALL_CAPS preservation', () => {
    it('protects ALL_CAPS words when preserveAllCaps is true', () => {
      const config = makeConfig({ preserveAllCaps: true });
      const protector = new NeverTranslateProtector(config);
      const result = protector.protect('Use the API and SDK for integration');
      expect(result.protectedText).not.toContain('API');
      expect(result.protectedText).not.toContain('SDK');
      expect(result.protectedTerms).toContain('API');
      expect(result.protectedTerms).toContain('SDK');
    });
  });

  describe('addSkuTerms', () => {
    it('adds sku-type terms to config', () => {
      const config = createDefaultConfig();
      const updated = addSkuTerms(config, ['SKU-001', 'SKU-002']);
      expect(updated.terms).toHaveLength(2);
      expect(updated.terms[0].category).toBe('sku');
      expect(updated.terms[0].type).toBe('exact');
      expect(updated.terms[0].caseSensitive).toBe(true);
    });
  });

  describe('addBrandTerms', () => {
    it('adds brand-type terms to config', () => {
      const config = createDefaultConfig();
      const updated = addBrandTerms(config, ['Nike', 'Adidas']);
      expect(updated.terms).toHaveLength(2);
      expect(updated.terms[0].category).toBe('brand');
      expect(updated.terms[0].caseSensitive).toBe(false);
    });
  });

  describe('createDefaultConfig', () => {
    it('returns config with empty terms array', () => {
      const config = createDefaultConfig();
      expect(config.terms).toEqual([]);
      expect(config.preserveAllCaps).toBe(true);
      expect(config.preserveEmails).toBe(true);
      expect(config.preserveUrls).toBe(true);
    });
  });

  describe('case-insensitive matching', () => {
    it('matches brand terms regardless of case', () => {
      const config = makeConfig({
        terms: [
          { term: 'Nike', type: 'exact', caseSensitive: false, category: 'brand' },
        ],
      });
      const protector = new NeverTranslateProtector(config);
      const result = protector.protect('Buy nike and NIKE products');
      expect(result.protectedTerms).toContain('nike');
      expect(result.protectedTerms).toContain('NIKE');
    });
  });

  describe('longest-first matching', () => {
    it('matches longer terms before shorter ones', () => {
      const config = makeConfig({
        terms: [
          { term: 'Galaxy', type: 'exact', caseSensitive: true, category: 'brand' },
          { term: 'Galaxy S24', type: 'exact', caseSensitive: true, category: 'sku' },
        ],
      });
      const protector = new NeverTranslateProtector(config);
      const result = protector.protect('The Galaxy S24 is great');
      // "Galaxy S24" should be matched first (longest), so "Galaxy" alone is consumed
      expect(result.protectedTerms[0]).toBe('Galaxy S24');
    });
  });
});
