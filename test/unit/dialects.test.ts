import { describe, it, expect } from 'vitest';
import {
  ARABIC_DIALECTS,
  DIALECT_VOCABULARY,
  DIALECT_PHRASES,
  DIALECT_REGIONS,
  detectDialect,
  detectDialectFromCountry,
  getDialectConfig,
  getDialectVocabulary,
  getDialectRegions,
  getDialectPhrase,
  getGreeting,
  getAvailableDialects,
  getAllDialectOptions,
  getDialectStats,
  translateToDialect,
  batchTranslateToDialect,
  compareDialectTranslations,
  formatDialectName,
  containsDialectTerms,
  suggestDialect,
  isValidDialect,
} from '../../app/services/dialects';

describe('Dialects Service - T0066', () => {
  describe('Dialect Configurations', () => {
    it('should have all dialect configurations defined', () => {
      expect(ARABIC_DIALECTS.gulf).toBeDefined();
      expect(ARABIC_DIALECTS.levant).toBeDefined();
      expect(ARABIC_DIALECTS.maghreb).toBeDefined();
      expect(ARABIC_DIALECTS.egyptian).toBeDefined();
      expect(ARABIC_DIALECTS.standard).toBeDefined();
    });

    it('should have correct Gulf dialect configuration', () => {
      const config = getDialectConfig('gulf');
      expect(config.nameEn).toBe('Gulf Arabic');
      expect(config.nameAr).toBe('خليجي');
      expect(config.countries).toContain('SA');
      expect(config.countries).toContain('AE');
      expect(config.markers.length).toBeGreaterThan(0);
    });

    it('should have correct Levant dialect configuration', () => {
      const config = getDialectConfig('levant');
      expect(config.nameEn).toBe('Levantine Arabic');
      expect(config.nameAr).toBe('شامي');
      expect(config.countries).toContain('SY');
      expect(config.countries).toContain('JO');
    });

    it('should have correct Maghreb dialect configuration', () => {
      const config = getDialectConfig('maghreb');
      expect(config.nameEn).toBe('Maghrebi Arabic');
      expect(config.nameAr).toBe('مغربي');
      expect(config.countries).toContain('MA');
      expect(config.countries).toContain('DZ');
    });

    it('should have correct Egyptian dialect configuration', () => {
      const config = getDialectConfig('egyptian');
      expect(config.nameEn).toBe('Egyptian Arabic');
      expect(config.nameAr).toBe('مصري');
      expect(config.countries).toContain('EG');
    });

    it('should have correct Standard Arabic configuration', () => {
      const config = getDialectConfig('standard');
      expect(config.nameEn).toBe('Modern Standard Arabic');
      expect(config.nameAr).toBe('فصحى');
      expect(config.countries).toContain('ALL');
    });
  });

  describe('Country-Based Dialect Detection', () => {
    it('should detect Gulf dialect for Saudi Arabia', () => {
      expect(detectDialectFromCountry('SA')).toBe('gulf');
    });

    it('should detect Gulf dialect for UAE', () => {
      expect(detectDialectFromCountry('AE')).toBe('gulf');
    });

    it('should detect Gulf dialect for Qatar', () => {
      expect(detectDialectFromCountry('QA')).toBe('gulf');
    });

    it('should detect Gulf dialect for Kuwait', () => {
      expect(detectDialectFromCountry('KW')).toBe('gulf');
    });

    it('should detect Gulf dialect for Bahrain', () => {
      expect(detectDialectFromCountry('BH')).toBe('gulf');
    });

    it('should detect Gulf dialect for Oman', () => {
      expect(detectDialectFromCountry('OM')).toBe('gulf');
    });

    it('should detect Levant dialect for Syria', () => {
      expect(detectDialectFromCountry('SY')).toBe('levant');
    });

    it('should detect Levant dialect for Jordan', () => {
      expect(detectDialectFromCountry('JO')).toBe('levant');
    });

    it('should detect Levant dialect for Lebanon', () => {
      expect(detectDialectFromCountry('LB')).toBe('levant');
    });

    it('should detect Levant dialect for Palestine', () => {
      expect(detectDialectFromCountry('PS')).toBe('levant');
    });

    it('should detect Levant dialect for Iraq', () => {
      expect(detectDialectFromCountry('IQ')).toBe('levant');
    });

    it('should detect Maghreb dialect for Morocco', () => {
      expect(detectDialectFromCountry('MA')).toBe('maghreb');
    });

    it('should detect Maghreb dialect for Algeria', () => {
      expect(detectDialectFromCountry('DZ')).toBe('maghreb');
    });

    it('should detect Maghreb dialect for Tunisia', () => {
      expect(detectDialectFromCountry('TN')).toBe('maghreb');
    });

    it('should detect Maghreb dialect for Libya', () => {
      expect(detectDialectFromCountry('LY')).toBe('maghreb');
    });

    it('should detect Maghreb dialect for Mauritania', () => {
      expect(detectDialectFromCountry('MR')).toBe('maghreb');
    });

    it('should detect Egyptian dialect for Egypt', () => {
      expect(detectDialectFromCountry('EG')).toBe('egyptian');
    });

    it('should detect Egyptian dialect for Sudan', () => {
      expect(detectDialectFromCountry('SD')).toBe('egyptian');
    });

    it('should default to standard for unknown countries', () => {
      expect(detectDialectFromCountry('XX')).toBe('standard');
    });

    it('should handle lowercase country codes', () => {
      expect(detectDialectFromCountry('sa')).toBe('gulf');
      expect(detectDialectFromCountry('eg')).toBe('egyptian');
    });
  });

  describe('Text-Based Dialect Detection', () => {
    it('should detect Gulf dialect from text markers', () => {
      const result = detectDialect('شلونك اليوم؟');
      expect(result.dialect).toBe('gulf');
      expect(result.markers).toContain('شلون');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should detect Levant dialect from text markers', () => {
      const result = detectDialect('شو بدك؟');
      expect(result.dialect).toBe('levant');
      expect(result.markers).toContain('شو');
    });

    it('should detect Maghreb dialect from text markers', () => {
      const result = detectDialect('واش تبغي؟');
      expect(result.dialect).toBe('maghreb');
      expect(result.markers).toContain('واش');
    });

    it('should detect Egyptian dialect from text markers', () => {
      const result = detectDialect('إزاي النهاردة؟');
      expect(result.dialect).toBe('egyptian');
      expect(result.markers).toContain('إزاي');
    });

    it('should return standard for empty text', () => {
      const result = detectDialect('');
      expect(result.dialect).toBe('standard');
      expect(result.confidence).toBe(0);
    });

    it('should include confidence score in detection result', () => {
      const result = detectDialect('شلونك يا هلا');
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('Dialect Vocabulary', () => {
    it('should get dialect-specific vocabulary for Gulf', () => {
      const gulfVocab = getDialectVocabulary('gulf');
      expect(gulfVocab['hello']).toBe('هلا');
    });

    it('should get dialect-specific vocabulary for Levant', () => {
      const levantVocab = getDialectVocabulary('levant');
      expect(levantVocab['hello']).toBe('مرحبتين');
    });

    it('should get dialect-specific vocabulary for Maghreb', () => {
      const maghrebVocab = getDialectVocabulary('maghreb');
      expect(maghrebVocab['hello']).toBe('سلام');
    });

    it('should get dialect-specific vocabulary for Egyptian', () => {
      const egyptianVocab = getDialectVocabulary('egyptian');
      expect(egyptianVocab['hello']).toBe('أهلاً');
    });

    it('should have different greetings for each dialect', () => {
      expect(DIALECT_VOCABULARY['hello'].gulf).toBe('هلا');
      expect(DIALECT_VOCABULARY['hello'].levant).toBe('مرحبتين');
      expect(DIALECT_VOCABULARY['hello'].maghreb).toBe('سلام');
      expect(DIALECT_VOCABULARY['hello'].egyptian).toBe('أهلاً');
      expect(DIALECT_VOCABULARY['hello'].standard).toBe('مرحباً');
    });

    it('should have commerce-specific vocabulary', () => {
      expect(DIALECT_VOCABULARY['product']).toBeDefined();
      expect(DIALECT_VOCABULARY['price']).toBeDefined();
      expect(DIALECT_VOCABULARY['discount']).toBeDefined();
      expect(DIALECT_VOCABULARY['store']).toBeDefined();
    });
  });

  describe('Translation Functions', () => {
    it('should get greeting in Gulf dialect', () => {
      expect(getGreeting('gulf')).toBe('هلا');
    });

    it('should get greeting in Levant dialect', () => {
      expect(getGreeting('levant')).toBe('مرحبتين');
    });

    it('should get greeting in Maghreb dialect', () => {
      expect(getGreeting('maghreb')).toBe('سلام');
    });

    it('should get greeting in Egyptian dialect', () => {
      expect(getGreeting('egyptian')).toBe('أهلاً');
    });

    it('should get greeting in Standard Arabic', () => {
      expect(getGreeting('standard')).toBe('مرحباً');
    });

    it('should translate simple terms to dialect', () => {
      const translated = translateToDialect('مرحباً', 'gulf', 'مرحباً');
      expect(typeof translated).toBe('string');
    });

    it('should return original text for standard dialect', () => {
      const text = 'مرحباً كيف حالك';
      const result = translateToDialect(text, 'standard');
      expect(result).toBe(text);
    });

    it('should handle empty text in translation', () => {
      const result = translateToDialect('', 'gulf');
      expect(result).toBe('');
    });

    it('should batch translate multiple terms', () => {
      const terms = ['hello', 'how_are_you', 'thank_you'];
      const results = batchTranslateToDialect(terms, 'gulf');
      expect(results).toHaveLength(3);
      expect(results[0].original).toBe('hello');
    });

    it('should compare translations across dialects', () => {
      const comparison = compareDialectTranslations('hello');
      expect(comparison).not.toBeNull();
      expect(comparison?.gulf).toBe('هلا');
      expect(comparison?.levant).toBe('مرحبتين');
    });

    it('should return null for unknown term comparison', () => {
      const comparison = compareDialectTranslations('unknown_term_xyz');
      expect(comparison).toBeNull();
    });
  });

  describe('Dialect Regions', () => {
    it('should get regions for Gulf dialect', () => {
      const regions = getDialectRegions('gulf');
      expect(regions.some(r => r.country === 'SA' && r.isPrimary)).toBe(true);
      expect(regions.some(r => r.country === 'AE' && r.isPrimary)).toBe(true);
    });

    it('should get regions for Levant dialect', () => {
      const regions = getDialectRegions('levant');
      expect(regions.some(r => r.country === 'SY')).toBe(true);
      expect(regions.some(r => r.country === 'JO')).toBe(true);
    });

    it('should get regions for Maghreb dialect', () => {
      const regions = getDialectRegions('maghreb');
      expect(regions.some(r => r.country === 'MA')).toBe(true);
      expect(regions.some(r => r.country === 'DZ')).toBe(true);
    });

    it('should get regions for Egyptian dialect', () => {
      const regions = getDialectRegions('egyptian');
      expect(regions.some(r => r.country === 'EG')).toBe(true);
    });

    it('should mark primary dialects correctly', () => {
      const gulfRegions = getDialectRegions('gulf');
      const saRegion = gulfRegions.find(r => r.country === 'SA');
      expect(saRegion?.isPrimary).toBe(true);
    });
  });

  describe('Available Dialects', () => {
    it('should get available dialects for Saudi Arabia', () => {
      const dialects = getAvailableDialects('SA');
      expect(dialects).toContain('gulf');
      expect(dialects).toContain('standard');
    });

    it('should get available dialects for Egypt', () => {
      const dialects = getAvailableDialects('EG');
      expect(dialects).toContain('egyptian');
      expect(dialects).toContain('standard');
    });

    it('should get available dialects for Morocco', () => {
      const dialects = getAvailableDialects('MA');
      expect(dialects).toContain('maghreb');
      expect(dialects).toContain('standard');
    });

    it('should get available dialects for Jordan', () => {
      const dialects = getAvailableDialects('JO');
      expect(dialects).toContain('levant');
      expect(dialects).toContain('standard');
    });

    it('should return only standard for unknown countries', () => {
      const dialects = getAvailableDialects('XX');
      expect(dialects).toEqual(['standard']);
    });
  });

  describe('Dialect Phrases', () => {
    it('should get Gulf dialect-specific phrases', () => {
      expect(getDialectPhrase('gulf', 'welcome_phrase')).toBe('هلا والله');
      expect(getDialectPhrase('gulf', 'hello_response')).toBe('هلا بيك');
    });

    it('should get Levant dialect-specific phrases', () => {
      expect(getDialectPhrase('levant', 'welcome_phrase')).toBe('أهلاً وسهلاً');
      expect(getDialectPhrase('levant', 'hello_response')).toBe('أهلاً فيك');
    });

    it('should get Maghreb dialect-specific phrases', () => {
      expect(getDialectPhrase('maghreb', 'welcome_phrase')).toBe('أهلاً وسهلاً');
      expect(getDialectPhrase('maghreb', 'how_are_you_response')).toBe('لاباس الحمدلله');
    });

    it('should get Egyptian dialect-specific phrases', () => {
      expect(getDialectPhrase('egyptian', 'welcome_phrase')).toBe('نورت');
      expect(getDialectPhrase('egyptian', 'what_do_you_want')).toBe('عايز إيه');
    });

    it('should have phrases defined for all dialects', () => {
      for (const dialect of ['gulf', 'levant', 'maghreb', 'egyptian', 'standard'] as const) {
        expect(getDialectPhrase(dialect, 'hello_response')).toBeDefined();
        expect(getDialectPhrase(dialect, 'welcome_phrase')).toBeDefined();
      }
    });
  });

  describe('Format and Display', () => {
    it('should format Gulf dialect name in English', () => {
      expect(formatDialectName('gulf', 'en')).toBe('Gulf Arabic');
    });

    it('should format Levant dialect name in English', () => {
      expect(formatDialectName('levant', 'en')).toBe('Levantine Arabic');
    });

    it('should format Maghreb dialect name in English', () => {
      expect(formatDialectName('maghreb', 'en')).toBe('Maghrebi Arabic');
    });

    it('should format Egyptian dialect name in English', () => {
      expect(formatDialectName('egyptian', 'en')).toBe('Egyptian Arabic');
    });

    it('should format dialect name in Arabic', () => {
      expect(formatDialectName('gulf', 'ar')).toBe('خليجي');
      expect(formatDialectName('levant', 'ar')).toBe('شامي');
      expect(formatDialectName('maghreb', 'ar')).toBe('مغربي');
      expect(formatDialectName('egyptian', 'ar')).toBe('مصري');
    });

    it('should default to English when locale not specified', () => {
      expect(formatDialectName('gulf')).toBe('Gulf Arabic');
      expect(formatDialectName('levant')).toBe('Levantine Arabic');
    });
  });

  describe('Dialect Term Detection', () => {
    it('should detect Gulf dialect terms', () => {
      expect(containsDialectTerms('yallah lets go', 'gulf')).toBe(true);
      expect(containsDialectTerms('inshallah tomorrow', 'gulf')).toBe(true);
    });

    it('should detect Levant dialect terms', () => {
      expect(containsDialectTerms('kifak how are you', 'levant')).toBe(true);
      expect(containsDialectTerms('sho what do you want', 'levant')).toBe(true);
    });

    it('should detect Maghreb dialect terms', () => {
      expect(containsDialectTerms('labas how are you', 'maghreb')).toBe(true);
      expect(containsDialectTerms('shkon who are you', 'maghreb')).toBe(true);
    });

    it('should detect Egyptian dialect terms', () => {
      expect(containsDialectTerms('izzayak how are you', 'egyptian')).toBe(true);
      expect(containsDialectTerms('eh what do you mean', 'egyptian')).toBe(true);
    });

    it('should return false for non-dialect text', () => {
      expect(containsDialectTerms('hello world', 'gulf')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(containsDialectTerms('YALLAH hurry', 'gulf')).toBe(true);
      expect(containsDialectTerms('KIFAK friend', 'levant')).toBe(true);
    });
  });

  describe('All Dialect Options', () => {
    it('should get all dialect options', () => {
      const options = getAllDialectOptions();
      expect(options.length).toBe(5);
      expect(options.some(o => o.code === 'gulf')).toBe(true);
      expect(options.some(o => o.code === 'levant')).toBe(true);
      expect(options.some(o => o.code === 'maghreb')).toBe(true);
      expect(options.some(o => o.code === 'egyptian')).toBe(true);
      expect(options.some(o => o.code === 'standard')).toBe(true);
    });

    it('should include both English and Arabic names', () => {
      const options = getAllDialectOptions();
      for (const option of options) {
        expect(option.name).toBeDefined();
        expect(option.nameAr).toBeDefined();
      }
    });
  });

  describe('Dialect Statistics', () => {
    it('should get statistics for Gulf dialect', () => {
      const stats = getDialectStats('gulf');
      expect(stats.markerCount).toBeGreaterThan(0);
      expect(stats.vocabularyCount).toBeGreaterThan(0);
      expect(stats.phraseCount).toBeGreaterThan(0);
      expect(stats.countryCount).toBeGreaterThan(0);
    });

    it('should get statistics for Levant dialect', () => {
      const stats = getDialectStats('levant');
      expect(stats.markerCount).toBeGreaterThan(0);
      expect(stats.vocabularyCount).toBeGreaterThan(0);
    });

    it('should get statistics for Maghreb dialect', () => {
      const stats = getDialectStats('maghreb');
      expect(stats.markerCount).toBeGreaterThan(0);
      expect(stats.vocabularyCount).toBeGreaterThan(0);
    });

    it('should get statistics for Egyptian dialect', () => {
      const stats = getDialectStats('egyptian');
      expect(stats.markerCount).toBeGreaterThan(0);
      expect(stats.vocabularyCount).toBeGreaterThan(0);
    });

    it('should have different stats for different dialects', () => {
      const gulfStats = getDialectStats('gulf');
      const levantStats = getDialectStats('levant');
      expect(gulfStats.countryCount).not.toBe(levantStats.countryCount);
    });
  });

  describe('Dialect Suggestions', () => {
    it('should suggest Gulf dialect for Saudi Arabia', () => {
      const suggestion = suggestDialect('SA');
      expect(suggestion.dialect).toBe('gulf');
      expect(suggestion.confidence).toBeGreaterThan(0);
      expect(suggestion.reason).toContain('location');
    });

    it('should suggest Egyptian dialect for Egypt', () => {
      const suggestion = suggestDialect('EG');
      expect(suggestion.dialect).toBe('egyptian');
    });

    it('should suggest dialect based on text', () => {
      const suggestion = suggestDialect(undefined, 'شلونك يا هلا');
      expect(suggestion.dialect).toBe('gulf');
      expect(suggestion.reason).toContain('writing');
    });

    it('should default to standard when no clues provided', () => {
      const suggestion = suggestDialect();
      expect(suggestion.dialect).toBe('standard');
      expect(suggestion.confidence).toBeLessThan(0.5);
    });

    it('should prioritize country over text', () => {
      const suggestion = suggestDialect('EG', 'شلونك');
      expect(suggestion.dialect).toBe('egyptian');
    });
  });

  describe('Dialect Validation', () => {
    it('should validate Gulf dialect code', () => {
      expect(isValidDialect('gulf')).toBe(true);
    });

    it('should validate Levant dialect code', () => {
      expect(isValidDialect('levant')).toBe(true);
    });

    it('should validate Maghreb dialect code', () => {
      expect(isValidDialect('maghreb')).toBe(true);
    });

    it('should validate Egyptian dialect code', () => {
      expect(isValidDialect('egyptian')).toBe(true);
    });

    it('should validate Standard dialect code', () => {
      expect(isValidDialect('standard')).toBe(true);
    });

    it('should reject invalid dialect codes', () => {
      expect(isValidDialect('invalid')).toBe(false);
      expect(isValidDialect('')).toBe(false);
      expect(isValidDialect('arabic')).toBe(false);
    });
  });

  describe('Regional Variations', () => {
    it('should have regional mappings defined for GCC countries', () => {
      expect(DIALECT_REGIONS['SA']).toBeDefined();
      expect(DIALECT_REGIONS['AE']).toBeDefined();
      expect(DIALECT_REGIONS['QA']).toBeDefined();
    });

    it('should have regional mappings defined for Levant', () => {
      expect(DIALECT_REGIONS['SY']).toBeDefined();
      expect(DIALECT_REGIONS['JO']).toBeDefined();
      expect(DIALECT_REGIONS['LB']).toBeDefined();
    });

    it('should have regional mappings defined for Maghreb', () => {
      expect(DIALECT_REGIONS['MA']).toBeDefined();
      expect(DIALECT_REGIONS['DZ']).toBeDefined();
      expect(DIALECT_REGIONS['TN']).toBeDefined();
    });

    it('should have regional mappings defined for Egypt', () => {
      expect(DIALECT_REGIONS['EG']).toBeDefined();
      expect(DIALECT_REGIONS['SD']).toBeDefined();
    });

    it('should categorize Gulf countries correctly', () => {
      expect(DIALECT_REGIONS['SA'].region).toBe('Arabian Peninsula');
      expect(DIALECT_REGIONS['AE'].region).toBe('Arabian Peninsula');
    });

    it('should categorize Levant countries correctly', () => {
      expect(DIALECT_REGIONS['SY'].region).toBe('Levant');
      expect(DIALECT_REGIONS['JO'].region).toBe('Levant');
    });

    it('should categorize Maghreb countries correctly', () => {
      expect(DIALECT_REGIONS['MA'].region).toBe('Maghreb');
      expect(DIALECT_REGIONS['DZ'].region).toBe('Maghreb');
    });

    it('should have secondary dialects for each region', () => {
      for (const [country, info] of Object.entries(DIALECT_REGIONS)) {
        expect(info.secondaryDialects).toBeDefined();
        expect(info.secondaryDialects.length).toBeGreaterThan(0);
        expect(info.secondaryDialects).toContain('standard');
      }
    });
  });

  describe('Commerce-Specific Vocabulary', () => {
    it('should have different "product" translations', () => {
      expect(DIALECT_VOCABULARY['product'].levant).toBe('بضاعة');
      expect(DIALECT_VOCABULARY['product'].egyptian).toBe('سلعة');
      expect(DIALECT_VOCABULARY['product'].maghreb).toBe('منتوج');
    });

    it('should have different "order" translations', () => {
      expect(DIALECT_VOCABULARY['order'].gulf).toBe('طلبية');
      expect(DIALECT_VOCABULARY['order'].egyptian).toBe('أوردر');
      expect(DIALECT_VOCABULARY['order'].maghreb).toBe('كوموند');
    });

    it('should have different "money" translations', () => {
      expect(DIALECT_VOCABULARY['money'].gulf).toBe('فلوس');
      expect(DIALECT_VOCABULARY['money'].levant).toBe('مصاري');
      expect(DIALECT_VOCABULARY['money'].maghreb).toBe('دراهم');
    });

    it('should have "delivery" translations', () => {
      expect(DIALECT_VOCABULARY['delivery']).toBeDefined();
      expect(DIALECT_VOCABULARY['delivery'].maghreb).toBe('ليفريزون');
    });

    it('should have "store" translations', () => {
      expect(DIALECT_VOCABULARY['store']).toBeDefined();
      expect(DIALECT_VOCABULARY['store'].gulf).toBe('محل');
    });
  });

  describe('Greeting Variations', () => {
    it('should have morning greeting variations', () => {
      expect(DIALECT_VOCABULARY['good_morning'].egyptian).toBe('صباح الفل');
      expect(DIALECT_VOCABULARY['good_morning'].gulf).toBe('صباح النور');
    });

    it('should have evening greeting variations', () => {
      expect(DIALECT_VOCABULARY['good_evening'].egyptian).toBe('مساء الفل');
      expect(DIALECT_VOCABULARY['good_evening'].gulf).toBe('مساء النور');
    });

    it('should have goodbye variations', () => {
      expect(DIALECT_VOCABULARY['goodbye'].levant).toBe('بخاطرك');
      expect(DIALECT_VOCABULARY['goodbye'].maghreb).toBe('بسلامة');
      expect(DIALECT_VOCABULARY['goodbye'].gulf).toBe('في أمان الله');
    });

    it('should have thank you variations', () => {
      expect(DIALECT_VOCABULARY['thank_you'].levant).toBe('يسلمو');
      expect(DIALECT_VOCABULARY['thank_you'].gulf).toBe('مشكور');
      expect(DIALECT_VOCABULARY['thank_you'].maghreb).toBe('بارك الله فيك');
    });
  });
});
