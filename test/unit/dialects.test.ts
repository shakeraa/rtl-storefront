import { describe, it, expect } from 'vitest';
import {
  detectDialectFromCountry,
  getDialectConfig,
  translateToDialect,
  getGreeting,
  getAvailableDialects,
  formatDialectName,
  containsDialectTerms,
  getAllDialectOptions,
  ARABIC_DIALECTS,
  DIALECT_VOCABULARY,
} from '../../app/services/dialects';

describe('Dialects Service - T0066', () => {
  describe('Dialect Detection', () => {
    it('should detect Gulf dialect for GCC countries', () => {
      expect(detectDialectFromCountry('SA')).toBe('gulf');
      expect(detectDialectFromCountry('AE')).toBe('gulf');
      expect(detectDialectFromCountry('QA')).toBe('gulf');
    });

    it('should detect Levant dialect for Levant countries', () => {
      expect(detectDialectFromCountry('SY')).toBe('levant');
      expect(detectDialectFromCountry('JO')).toBe('levant');
      expect(detectDialectFromCountry('LB')).toBe('levant');
    });

    it('should detect Maghreb dialect for Maghreb countries', () => {
      expect(detectDialectFromCountry('MA')).toBe('maghreb');
      expect(detectDialectFromCountry('DZ')).toBe('maghreb');
    });

    it('should detect Egyptian dialect for Egypt', () => {
      expect(detectDialectFromCountry('EG')).toBe('egyptian');
    });

    it('should default to standard for unknown countries', () => {
      expect(detectDialectFromCountry('XX')).toBe('standard');
    });
  });

  describe('Dialect Config', () => {
    it('should get Gulf dialect config', () => {
      const config = getDialectConfig('gulf');
      expect(config.nameEn).toBe('Gulf Arabic');
      expect(config.nameAr).toBe('خليجي');
      expect(config.countries).toContain('SA');
    });

    it('should get Levant dialect config', () => {
      const config = getDialectConfig('levant');
      expect(config.nameEn).toBe('Levantine Arabic');
      expect(config.countries).toContain('SY');
    });
  });

  describe('Dialect Translations', () => {
    it('should get greeting in different dialects', () => {
      expect(getGreeting('gulf')).toBe('هلا');
      expect(getGreeting('levant')).toBe('مرحبتين');
      expect(getGreeting('maghreb')).toBe('سلام');
      expect(getGreeting('egyptian')).toBe('أهلاً');
    });

    it('should translate to dialect', () => {
      const translated = translateToDialect('hello', 'gulf', 'مرحباً');
      expect(typeof translated).toBe('string');
    });
  });

  describe('Available Dialects', () => {
    it('should get available dialects for country', () => {
      const dialects = getAvailableDialects('SA');
      expect(dialects).toContain('gulf');
      expect(dialects).toContain('standard');
    });

    it('should format dialect name in English', () => {
      expect(formatDialectName('gulf', 'en')).toBe('Gulf Arabic');
      expect(formatDialectName('levant', 'en')).toBe('Levantine Arabic');
    });

    it('should format dialect name in Arabic', () => {
      expect(formatDialectName('gulf', 'ar')).toBe('خليجي');
      expect(formatDialectName('levant', 'ar')).toBe('شامي');
    });
  });

  describe('Dialect Detection', () => {
    it('should detect dialect terms in text', () => {
      expect(containsDialectTerms('yallah lets go', 'gulf')).toBe(true);
      expect(containsDialectTerms('kifak how are you', 'levant')).toBe(true);
    });
  });

  describe('All Dialect Options', () => {
    it('should get all dialect options', () => {
      const options = getAllDialectOptions();
      expect(options.length).toBeGreaterThan(0);
      expect(options.some((o) => o.code === 'gulf')).toBe(true);
      expect(options.some((o) => o.code === 'levant')).toBe(true);
    });
  });

  describe('Vocabulary', () => {
    it('should have vocabulary entries', () => {
      expect(DIALECT_VOCABULARY['hello']).toBeDefined();
      expect(DIALECT_VOCABULARY['how_are_you']).toBeDefined();
    });

    it('should have different translations per dialect', () => {
      const hello = DIALECT_VOCABULARY['hello'];
      expect(hello.gulf).not.toBe(hello.levant);
      expect(hello.standard).toBe('مرحباً');
    });
  });
});
