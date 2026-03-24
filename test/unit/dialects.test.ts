import { describe, it, expect } from 'vitest';
import {
  ARABIC_DIALECTS, DIALECT_VOCABULARY, DIALECT_PHRASES, DIALECT_REGIONS,
  detectDialect, detectDialectFromCountry, getDialectConfig, getDialectVocabulary,
  getDialectRegions, getDialectPhrase, getGreeting, getAvailableDialects,
  getAllDialectOptions, getDialectStats, translateToDialect, batchTranslateToDialect,
  compareDialectTranslations, formatDialectName, containsDialectTerms, suggestDialect, isValidDialect
} from '../../app/services/dialects';

describe('Dialects Service - T0066', () => {
  describe('Dialect Configurations', () => {
    it('should have all dialect configurations', () => {
      expect(ARABIC_DIALECTS.gulf).toBeDefined();
      expect(ARABIC_DIALECTS.levantine).toBeDefined();
      expect(ARABIC_DIALECTS.maghrebi).toBeDefined();
      expect(ARABIC_DIALECTS.egyptian).toBeDefined();
      expect(ARABIC_DIALECTS.msa).toBeDefined();
    });
    it('should have correct Gulf config', () => {
      const c = getDialectConfig('gulf');
      expect(c.nameEn).toBe('Gulf Arabic');
      expect(c.nameAr).toBe('خليجي');
      expect(c.countries).toContain('SA');
    });
    it('should have correct Levant config', () => {
      const c = getDialectConfig('levantine');
      expect(c.nameEn).toBe('Levantine Arabic');
      expect(c.nameAr).toBe('شامي');
      expect(c.countries).toContain('SY');
    });
    it('should have correct Maghreb config', () => {
      const c = getDialectConfig('maghrebi');
      expect(c.nameEn).toBe('Maghrebi Arabic');
      expect(c.nameAr).toBe('مغربي');
      expect(c.countries).toContain('MA');
    });
    it('should have correct Egyptian config', () => {
      const c = getDialectConfig('egyptian');
      expect(c.nameEn).toBe('Egyptian Arabic');
      expect(c.nameAr).toBe('مصري');
      expect(c.countries).toContain('EG');
    });
  });

  describe('Country Detection', () => {
    it('detects Gulf for SA', () => expect(detectDialectFromCountry('SA')).toBe('gulf'));
    it('detects Gulf for AE', () => expect(detectDialectFromCountry('AE')).toBe('gulf'));
    it('detects Levant for SY', () => expect(detectDialectFromCountry('SY')).toBe('levantine'));
    it('detects Levant for JO', () => expect(detectDialectFromCountry('JO')).toBe('levantine'));
    it('detects Maghreb for MA', () => expect(detectDialectFromCountry('MA')).toBe('maghrebi'));
    it('detects Egyptian for EG', () => expect(detectDialectFromCountry('EG')).toBe('egyptian'));
    it('defaults to standard for unknown', () => expect(detectDialectFromCountry('XX')).toBe('msa'));
    it('handles lowercase', () => expect(detectDialectFromCountry('sa')).toBe('gulf'));
  });

  describe('Text Detection', () => {
    it('detects Gulf from شلون', () => { const r = detectDialect('شلونك'); expect(r.dialect).toBe('gulf'); expect(r.markers).toContain('شلون'); });
    it('detects Levant from شو', () => { const r = detectDialect('شو بدك'); expect(r.dialect).toBe('levantine'); expect(r.markers).toContain('شو'); });
    it('detects Maghreb from واش', () => { const r = detectDialect('واش تبغي'); expect(r.dialect).toBe('maghrebi'); expect(r.markers).toContain('واش'); });
    it('detects Egyptian from إزاي', () => { const r = detectDialect('إزاي'); expect(r.dialect).toBe('egyptian'); expect(r.markers).toContain('إزاي'); });
    it('returns standard for empty', () => { const r = detectDialect(''); expect(r.dialect).toBe('msa'); expect(r.confidence).toBe(0); });
    it('returns confidence score', () => { const r = detectDialect('شلونك هلا'); expect(typeof r.confidence).toBe('number'); expect(r.confidence).toBeGreaterThanOrEqual(0); });
  });

  describe('Vocabulary', () => {
    it('gets Gulf vocabulary', () => expect(getDialectVocabulary('gulf').hello).toBe('هلا'));
    it('gets Levant vocabulary', () => expect(getDialectVocabulary('levantine').hello).toBe('مرحبتين'));
    it('has different greetings', () => {
      expect(DIALECT_VOCABULARY.hello.gulf).toBe('هلا');
      expect(DIALECT_VOCABULARY.hello.levantine).toBe('مرحبتين');
      expect(DIALECT_VOCABULARY.hello.maghrebi).toBe('سلام');
      expect(DIALECT_VOCABULARY.hello.egyptian).toBe('أهلاً');
    });
    it('has commerce vocabulary', () => { expect(DIALECT_VOCABULARY.product).toBeDefined(); expect(DIALECT_VOCABULARY.price).toBeDefined(); });
  });

  describe('Translations', () => {
    it('gets greetings', () => { expect(getGreeting('gulf')).toBe('هلا'); expect(getGreeting('levantine')).toBe('مرحبتين'); expect(getGreeting('maghrebi')).toBe('سلام'); expect(getGreeting('egyptian')).toBe('أهلاً'); });
    it('translates text', () => expect(typeof translateToDialect('test', 'gulf')).toBe('string'));
    it('returns original for standard', () => { const t = 'مرحباً'; expect(translateToDialect(t, 'msa')).toBe(t); });
    it('handles empty', () => expect(translateToDialect('', 'gulf')).toBe(''));
    it('batch translates', () => { const r = batchTranslateToDialect(['a', 'b'], 'gulf'); expect(r).toHaveLength(2); expect(r[0].original).toBe('a'); });
    it('compares translations', () => { const c = compareDialectTranslations('hello'); expect(c).not.toBeNull(); expect(c?.gulf).toBe('هلا'); });
    it('returns null for unknown term', () => expect(compareDialectTranslations('xyz')).toBeNull());
  });

  describe('Regions', () => {
    it('gets Gulf regions', () => { const r = getDialectRegions('gulf'); expect(r.some(x => x.country === 'SA')).toBe(true); expect(r.some(x => x.country === 'AE')).toBe(true); });
    it('gets Levant regions', () => { const r = getDialectRegions('levantine'); expect(r.some(x => x.country === 'SY')).toBe(true); expect(r.some(x => x.country === 'JO')).toBe(true); });
    it('gets Maghreb regions', () => { const r = getDialectRegions('maghrebi'); expect(r.some(x => x.country === 'MA')).toBe(true); });
    it('marks primary correctly', () => { const r = getDialectRegions('gulf').find(x => x.country === 'SA'); expect(r?.isPrimary).toBe(true); });
  });

  describe('Available Dialects', () => {
    it('for SA', () => { const d = getAvailableDialects('SA'); expect(d).toContain('gulf'); expect(d).toContain('msa'); });
    it('for EG', () => { const d = getAvailableDialects('EG'); expect(d).toContain('egyptian'); expect(d).toContain('msa'); });
    it('for unknown', () => expect(getAvailableDialects('XX')).toEqual(['msa']));
  });

  describe('Phrases', () => {
    it('gets Gulf phrases', () => { expect(getDialectPhrase('gulf', 'welcome_phrase')).toBe('هلا والله'); expect(getDialectPhrase('gulf', 'hello_response')).toBe('هلا بيك'); });
    it('gets Levant phrases', () => { expect(getDialectPhrase('levantine', 'welcome_phrase')).toBe('أهلاً وسهلاً'); expect(getDialectPhrase('levantine', 'hello_response')).toBe('أهلاً فيك'); });
    it('has phrases for all dialects', () => ['gulf', 'levantine', 'maghrebi', 'egyptian', 'msa'].forEach(d => { expect(getDialectPhrase(d as any, 'welcome_phrase')).toBeDefined(); }));
  });

  describe('Format', () => {
    it('formats Gulf', () => expect(formatDialectName('gulf', 'en')).toBe('Gulf Arabic'));
    it('formats Levant', () => expect(formatDialectName('levantine', 'en')).toBe('Levantine Arabic'));
    it('formats in Arabic', () => { expect(formatDialectName('gulf', 'ar')).toBe('خليجي'); expect(formatDialectName('levantine', 'ar')).toBe('شامي'); });
    it('defaults to English', () => expect(formatDialectName('gulf')).toBe('Gulf Arabic'));
  });

  describe('Term Detection', () => {
    it('detects Gulf terms', () => { expect(containsDialectTerms('yallah', 'gulf')).toBe(true); expect(containsDialectTerms('inshallah', 'gulf')).toBe(true); });
    it('detects Levant terms', () => { expect(containsDialectTerms('kifak', 'levantine')).toBe(true); expect(containsDialectTerms('sho', 'levantine')).toBe(true); });
    it('detects Maghreb terms', () => { expect(containsDialectTerms('labas', 'maghrebi')).toBe(true); expect(containsDialectTerms('shkon', 'maghrebi')).toBe(true); });
    it('detects Egyptian terms', () => { expect(containsDialectTerms('izzayak', 'egyptian')).toBe(true); expect(containsDialectTerms('eh', 'egyptian')).toBe(true); });
    it('returns false for generic', () => expect(containsDialectTerms('hello', 'gulf')).toBe(false));
    it('is case insensitive', () => expect(containsDialectTerms('YALLAH', 'gulf')).toBe(true));
  });

  describe('All Options', () => {
    it('gets all options', () => { const o = getAllDialectOptions(); expect(o).toHaveLength(5); expect(o.some(x => x.code === 'gulf')).toBe(true); });
    it('has name and nameAr', () => getAllDialectOptions().forEach(o => { expect(o.name).toBeDefined(); expect(o.nameAr).toBeDefined(); }));
  });

  describe('Statistics', () => {
    it('stats for Gulf', () => { const s = getDialectStats('gulf'); expect(s.markerCount).toBeGreaterThan(0); expect(s.vocabularyCount).toBeGreaterThan(0); expect(s.phraseCount).toBeGreaterThan(0); expect(s.countryCount).toBeGreaterThan(0); });
    it('stats differ', () => { expect(getDialectStats('gulf').countryCount).not.toBe(getDialectStats('levantine').countryCount); });
  });

  describe('Suggestions', () => {
    it('suggests Gulf for SA', () => { const s = suggestDialect('SA'); expect(s.dialect).toBe('gulf'); expect(s.confidence).toBeGreaterThan(0); expect(s.reason).toContain('location'); });
    it('suggests Egyptian for EG', () => expect(suggestDialect('EG').dialect).toBe('egyptian'));
    it('suggests from text', () => { const s = suggestDialect(undefined, 'شلونك'); expect(s.dialect).toBe('gulf'); expect(s.reason).toContain('writing'); });
    it('defaults to standard', () => { const s = suggestDialect(); expect(s.dialect).toBe('msa'); expect(s.confidence).toBeLessThan(0.5); });
  });

  describe('Validation', () => {
    it('validates valid codes', () => { expect(isValidDialect('gulf')).toBe(true); expect(isValidDialect('levantine')).toBe(true); expect(isValidDialect('maghrebi')).toBe(true); expect(isValidDialect('egyptian')).toBe(true); expect(isValidDialect('msa')).toBe(true); });
    it('rejects invalid codes', () => { expect(isValidDialect('invalid')).toBe(false); expect(isValidDialect('')).toBe(false); expect(isValidDialect('arabic')).toBe(false); });
  });

  describe('Regional Variations', () => {
    it('has GCC mappings', () => { expect(DIALECT_REGIONS.SA).toBeDefined(); expect(DIALECT_REGIONS.AE).toBeDefined(); });
    it('has Levant mappings', () => { expect(DIALECT_REGIONS.SY).toBeDefined(); expect(DIALECT_REGIONS.JO).toBeDefined(); });
    it('has Maghreb mappings', () => { expect(DIALECT_REGIONS.MA).toBeDefined(); expect(DIALECT_REGIONS.DZ).toBeDefined(); });
    it('has Egypt mapping', () => expect(DIALECT_REGIONS.EG).toBeDefined());
    it('categorizes correctly', () => { expect(DIALECT_REGIONS.SA.region).toBe('Arabian Peninsula'); expect(DIALECT_REGIONS.SY.region).toBe('Levant'); expect(DIALECT_REGIONS.MA.region).toBe('Maghreb'); });
    it('has secondary dialects', () => Object.values(DIALECT_REGIONS).forEach(r => { expect(r.secondaryDialects).toBeDefined(); expect(r.secondaryDialects).toContain('msa'); }));
  });
});
