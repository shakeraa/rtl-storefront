import { describe, it, expect } from 'vitest';
import {
  FASHION_TERMS,
  searchTerms,
  getTermById,
  getTermsByCategory,
  translateTerm,
} from '../../app/services/terminology/index';

describe('Terminology Service', () => {
  describe('Fashion Terms', () => {
    it('should have abaya term', () => {
      const abaya = getTermById('abaya');
      expect(abaya).toBeDefined();
      expect(abaya?.term).toBe('Abaya');
      expect(abaya?.translations.ar).toBe('عباءة');
    });

    it('should have hijab term', () => {
      const hijab = getTermById('hijab');
      expect(hijab).toBeDefined();
      expect(hijab?.category).toBe('garment');
    });

    it('should have fabric terms', () => {
      const fabrics = getTermsByCategory('fabric');
      expect(fabrics.length).toBeGreaterThan(0);
      expect(fabrics.map((f) => f.id)).toContain('chiffon');
      expect(fabrics.map((f) => f.id)).toContain('crepe');
    });

    it('should have measurement terms', () => {
      const measurements = getTermsByCategory('measurement');
      expect(measurements.map((m) => m.id)).toContain('bust');
      expect(measurements.map((m) => m.id)).toContain('waist');
    });
  });

  describe('Term Search', () => {
    it('should search by English term', () => {
      const results = searchTerms('abaya', 'en');
      expect(results.map((r) => r.id)).toContain('abaya');
    });

    it('should search by Arabic translation', () => {
      const results = searchTerms('عباءة', 'ar');
      expect(results.map((r) => r.id)).toContain('abaya');
    });

    it('should search in definitions', () => {
      const results = searchTerms('robe', 'en');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty for no matches', () => {
      const results = searchTerms('xyz123', 'en');
      expect(results).toHaveLength(0);
    });
  });

  describe('Term Lookup', () => {
    it('should get term by ID', () => {
      const term = getTermById('kaftan');
      expect(term?.term).toBe('Kaftan');
      expect(term?.translations.ar).toBe('قفطان');
    });

    it('should return undefined for unknown ID', () => {
      const term = getTermById('unknown');
      expect(term).toBeUndefined();
    });
  });

  describe('Category Filtering', () => {
    it('should get terms by category', () => {
      const garments = getTermsByCategory('garment');
      expect(garments.map((g) => g.id)).toContain('abaya');
      expect(garments.map((g) => g.id)).toContain('hijab');
    });

    it('should return empty for empty category', () => {
      const styles = getTermsByCategory('style');
      expect(Array.isArray(styles)).toBe(true);
    });
  });

  describe('Term Translation', () => {
    it('should translate English to Arabic', () => {
      const translation = translateTerm('Abaya', 'en', 'ar');
      expect(translation).toBe('عباءة');
    });

    it('should translate Arabic to English', () => {
      const translation = translateTerm('حجاب', 'ar', 'en');
      expect(translation).toBe('Hijab');
    });

    it('should handle case insensitivity', () => {
      const translation = translateTerm('ABAYA', 'en', 'ar');
      expect(translation).toBe('عباءة');
    });

    it('should return null for unknown term', () => {
      const translation = translateTerm('unknown', 'en', 'ar');
      expect(translation).toBeNull();
    });
  });

  describe('Related Terms', () => {
    it('should have related terms for abaya', () => {
      const abaya = getTermById('abaya');
      expect(abaya?.relatedTerms).toContain('kaftan');
    });
  });
});
