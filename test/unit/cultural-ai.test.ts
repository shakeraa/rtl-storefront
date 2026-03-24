import { describe, it, expect } from 'vitest';
import { analyzeCulturalContext } from '../../app/services/cultural-ai/context-analyzer';
import {
  findFashionTerms,
  getFashionTermsByCategory,
} from '../../app/services/cultural-ai/fashion-corpus';
import { checkSensitivity } from '../../app/services/cultural-ai/religious-filter';
import {
  detectDialect,
  getDialectFromCountry,
  getDialectPromptModifier,
} from '../../app/services/cultural-ai/dialect-detector';

describe('Cultural AI Service', () => {
  describe('analyzeCulturalContext()', () => {
    it('returns an enhanced prompt string', () => {
      const result = analyzeCulturalContext({
        text: 'A beautiful silk abaya',
        category: 'fashion',
        targetLocale: 'ar-SA',
      });
      expect(result.enhancedPrompt).toBeTruthy();
      expect(typeof result.enhancedPrompt).toBe('string');
      expect(result.enhancedPrompt.length).toBeGreaterThan(0);
    });

    it('detects Gulf dialect from ar-SA locale', () => {
      const result = analyzeCulturalContext({
        text: 'A beautiful product',
        category: 'fashion',
        targetLocale: 'ar-SA',
      });
      expect(result.dialect).toBe('gulf');
    });

    it('detects Egyptian dialect from ar-EG locale', () => {
      const result = analyzeCulturalContext({
        text: 'A beautiful product',
        category: 'fashion',
        targetLocale: 'ar-EG',
      });
      expect(result.dialect).toBe('egyptian');
    });

    it('sets formality level based on category default', () => {
      const result = analyzeCulturalContext({
        text: 'A nice dress',
        category: 'fashion',
        targetLocale: 'ar-SA',
      });
      expect(result.formalityLevel).toBe('formal');
    });

    it('allows overriding formality level', () => {
      const result = analyzeCulturalContext({
        text: 'A nice dress',
        category: 'fashion',
        targetLocale: 'ar-SA',
        formalityLevel: 'casual',
      });
      expect(result.formalityLevel).toBe('casual');
    });

    it('includes cultural notes for fashion category', () => {
      const result = analyzeCulturalContext({
        text: 'Modest silk dress',
        category: 'fashion',
        targetLocale: 'ar-SA',
      });
      expect(result.culturalNotes.length).toBeGreaterThan(0);
    });

    it('includes sensitivity flags for pork content', () => {
      const result = analyzeCulturalContext({
        text: 'Delicious bacon sandwich',
        category: 'food',
        targetLocale: 'ar-SA',
      });
      expect(result.sensitivityFlags.length).toBeGreaterThan(0);
      expect(result.sensitivityFlags.some((f) => f.includes('dietary'))).toBe(true);
    });

    it('uses explicit dialect when provided', () => {
      const result = analyzeCulturalContext({
        text: 'A beautiful product',
        category: 'fashion',
        targetLocale: 'ar',
        dialect: 'levantine',
      });
      expect(result.dialect).toBe('levantine');
    });
  });

  describe('findFashionTerms()', () => {
    it('finds "abaya" in text', () => {
      const terms = findFashionTerms('Beautiful abaya collection');
      expect(terms.length).toBeGreaterThan(0);
      expect(terms.some((t) => t.english.toLowerCase().includes('abaya'))).toBe(true);
    });

    it('finds "hijab" in text', () => {
      const terms = findFashionTerms('Silk hijab for sale');
      expect(terms.length).toBeGreaterThan(0);
      expect(terms.some((t) => t.english.toLowerCase().includes('hijab'))).toBe(true);
    });

    it('is case-insensitive for English terms', () => {
      const terms = findFashionTerms('Beautiful ABAYA collection');
      expect(terms.some((t) => t.english.toLowerCase().includes('abaya'))).toBe(true);
    });

    it('returns empty array for non-fashion text', () => {
      const terms = findFashionTerms('Software development tools');
      expect(terms).toEqual([]);
    });

    it('finds Arabic fashion terms', () => {
      const terms = findFashionTerms('عباءة جميلة');
      expect(terms.length).toBeGreaterThan(0);
    });
  });

  describe('getFashionTermsByCategory()', () => {
    it('returns traditional fashion terms', () => {
      const terms = getFashionTermsByCategory('traditional wear');
      expect(terms.length).toBeGreaterThan(0);
      expect(terms.every((t) => t.category === 'traditional wear')).toBe(true);
    });

    it('returns modest fashion terms', () => {
      const terms = getFashionTermsByCategory('modest fashion');
      expect(terms.length).toBeGreaterThan(0);
      expect(terms.every((t) => t.category === 'modest fashion')).toBe(true);
    });

    it('returns accessories terms', () => {
      const terms = getFashionTermsByCategory('accessories');
      expect(terms.length).toBeGreaterThan(0);
      expect(terms.every((t) => t.category === 'accessories')).toBe(true);
    });

    it('returns empty array for unknown category', () => {
      const terms = getFashionTermsByCategory('nonexistent');
      expect(terms).toEqual([]);
    });
  });

  describe('checkSensitivity()', () => {
    it('flags religious content for Arabic locale', () => {
      const result = checkSensitivity('Visit the church for Sunday service', 'ar');
      expect(result.hasSensitiveContent).toBe(true);
      expect(result.flags.some((f) => f.type === 'religious')).toBe(true);
    });

    it('flags dietary content (pork) for Arabic locale', () => {
      const result = checkSensitivity('Contains pork and bacon', 'ar');
      expect(result.hasSensitiveContent).toBe(true);
      expect(result.flags.some((f) => f.type === 'dietary')).toBe(true);
    });

    it('flags alcohol content for Arabic locale', () => {
      const result = checkSensitivity('Pair with a glass of wine', 'ar-SA');
      expect(result.hasSensitiveContent).toBe(true);
      expect(result.flags.some((f) => f.type === 'dietary')).toBe(true);
    });

    it('returns no flags for clean text in Arabic locale', () => {
      const result = checkSensitivity('Beautiful silk dress in blue', 'ar');
      expect(result.hasSensitiveContent).toBe(false);
      expect(result.flags).toEqual([]);
    });

    it('returns no flags for non-MENA locale', () => {
      const result = checkSensitivity('Contains pork and wine', 'en');
      expect(result.hasSensitiveContent).toBe(false);
      expect(result.flags).toEqual([]);
    });
  });

  describe('detectDialect()', () => {
    it('detects Gulf Arabic markers', () => {
      // "شلونك" is a Gulf marker
      expect(detectDialect('شلونك يا صديقي')).toBe('gulf');
    });

    it('detects Levantine Arabic markers', () => {
      // "كيفك" is a Levantine marker
      expect(detectDialect('كيفك اليوم')).toBe('levantine');
    });

    it('detects Egyptian Arabic markers', () => {
      // "ازاي" is an Egyptian marker
      expect(detectDialect('ازاي الحال')).toBe('egyptian');
    });

    it('detects Maghreb Arabic markers', () => {
      // "واش" is a Maghreb marker
      expect(detectDialect('واش الحال')).toBe('maghrebi');
    });

    it('returns "msa" for standard Arabic without dialect markers', () => {
      expect(detectDialect('هذا نص عربي فصيح')).toBe('msa');
    });

    it('returns "msa" for non-Arabic text', () => {
      expect(detectDialect('Hello World')).toBe('msa');
    });
  });

  describe('getDialectFromCountry()', () => {
    it('maps SA to gulf', () => {
      expect(getDialectFromCountry('SA')).toBe('gulf');
    });

    it('maps EG to egyptian', () => {
      expect(getDialectFromCountry('EG')).toBe('egyptian');
    });

    it('maps SY to levantine', () => {
      expect(getDialectFromCountry('SY')).toBe('levantine');
    });

    it('maps MA to maghrebi', () => {
      expect(getDialectFromCountry('MA')).toBe('maghrebi');
    });

    it('returns msa for unknown country code', () => {
      expect(getDialectFromCountry('XX')).toBe('msa');
    });

    it('handles lowercase country codes', () => {
      expect(getDialectFromCountry('sa')).toBe('gulf');
    });
  });

  describe('getDialectPromptModifier()', () => {
    it('returns non-empty string for gulf', () => {
      const modifier = getDialectPromptModifier('gulf');
      expect(modifier.length).toBeGreaterThan(0);
      expect(modifier).toContain('Gulf');
    });

    it('returns non-empty string for levantine', () => {
      const modifier = getDialectPromptModifier('levantine');
      expect(modifier.length).toBeGreaterThan(0);
      expect(modifier).toContain('Levantine');
    });

    it('returns non-empty string for egyptian', () => {
      const modifier = getDialectPromptModifier('egyptian');
      expect(modifier.length).toBeGreaterThan(0);
      expect(modifier).toContain('Egyptian');
    });

    it('returns non-empty string for maghrebi', () => {
      const modifier = getDialectPromptModifier('maghrebi');
      expect(modifier.length).toBeGreaterThan(0);
      expect(modifier).toContain('Maghrebi');
    });

    it('returns non-empty string for msa', () => {
      const modifier = getDialectPromptModifier('msa');
      expect(modifier.length).toBeGreaterThan(0);
      expect(modifier).toContain('Modern Standard Arabic');
    });
  });
});
