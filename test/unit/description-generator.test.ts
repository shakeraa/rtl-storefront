import { describe, it, expect } from 'vitest';
import {
  buildPrompt,
  validateInput,
  estimateWordCount,
  checkConfidence,
  needsHumanReview,
  getToneDescriptor,
  getVerticalVocabulary,
  getAvailableTones,
  getAvailableVerticals,
  DEFAULT_CONFIG,
  TONE_DESCRIPTORS,
  VERTICAL_VOCABULARY,
  type GenerationInput,
  type GeneratedDescription,
} from '../../app/services/description-generator';

function makeInput(overrides: Partial<GenerationInput> = {}): GenerationInput {
  return {
    title: 'Silk Abaya',
    category: 'Fashion',
    attributes: { color: 'Black', material: 'Silk' },
    targetLocale: 'ar',
    tone: 'luxury',
    vertical: 'fashion',
    ...overrides,
  };
}

function makeDescription(overrides: Partial<GeneratedDescription> = {}): GeneratedDescription {
  return {
    shortDescription: 'A beautiful silk abaya with elegant design and premium craftsmanship for modern women.',
    longDescription: 'Long description here with many words to fill the space adequately for testing purposes.',
    metaTitle: 'Silk Abaya - Premium Collection',
    metaDescription: 'Discover our premium silk abaya collection designed for the modern woman.',
    socialCaption: 'Elevate your style with our Silk Abaya collection',
    confidenceScore: 0.85,
    needsReview: false,
    locale: 'ar',
    generatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('Description Generator Service (T0386)', () => {
  describe('DEFAULT_CONFIG', () => {
    it('has correct default values', () => {
      expect(DEFAULT_CONFIG.maxShortWords).toBe(80);
      expect(DEFAULT_CONFIG.maxLongWords).toBe(300);
      expect(DEFAULT_CONFIG.metaTitleMaxChars).toBe(60);
      expect(DEFAULT_CONFIG.metaDescriptionMaxChars).toBe(160);
      expect(DEFAULT_CONFIG.confidenceThreshold).toBe(0.7);
    });
  });

  describe('TONE_DESCRIPTORS', () => {
    it('contains all four tones', () => {
      expect(Object.keys(TONE_DESCRIPTORS)).toEqual(['professional', 'casual', 'luxury', 'playful']);
    });

    it('has Arabic text containing Arabic script for each tone', () => {
      const arabicPattern = /[\u0600-\u06FF]/;
      expect(TONE_DESCRIPTORS.professional.ar).toMatch(arabicPattern);
      expect(TONE_DESCRIPTORS.casual.ar).toMatch(arabicPattern);
      expect(TONE_DESCRIPTORS.luxury.ar).toMatch(arabicPattern);
      expect(TONE_DESCRIPTORS.playful.ar).toMatch(arabicPattern);
    });

    it('has Hebrew text containing Hebrew script for each tone', () => {
      const hebrewPattern = /[\u0590-\u05FF]/;
      expect(TONE_DESCRIPTORS.professional.he).toMatch(hebrewPattern);
      expect(TONE_DESCRIPTORS.casual.he).toMatch(hebrewPattern);
      expect(TONE_DESCRIPTORS.luxury.he).toMatch(hebrewPattern);
      expect(TONE_DESCRIPTORS.playful.he).toMatch(hebrewPattern);
    });

    it('has distinct English descriptions per tone', () => {
      const enValues = Object.values(TONE_DESCRIPTORS).map(t => t.en);
      expect(new Set(enValues).size).toBe(4);
    });
  });

  describe('VERTICAL_VOCABULARY', () => {
    it('contains all six verticals', () => {
      expect(Object.keys(VERTICAL_VOCABULARY).sort()).toEqual(
        ['beauty', 'electronics', 'fashion', 'food', 'general', 'home_goods']
      );
    });

    it('each vertical has exactly 3 English hints', () => {
      for (const vertical of Object.values(VERTICAL_VOCABULARY)) {
        expect(vertical.en).toHaveLength(3);
      }
    });

    it('fashion Arabic vocabulary contains Arabic script', () => {
      const arabicPattern = /[\u0600-\u06FF]/;
      for (const word of VERTICAL_VOCABULARY.fashion.ar) {
        expect(word).toMatch(arabicPattern);
      }
    });

    it('electronics Hebrew vocabulary contains Hebrew script', () => {
      const hebrewPattern = /[\u0590-\u05FF]/;
      for (const word of VERTICAL_VOCABULARY.electronics.he) {
        expect(word).toMatch(hebrewPattern);
      }
    });

    it('different verticals have different vocabulary', () => {
      expect(VERTICAL_VOCABULARY.fashion.en).not.toEqual(VERTICAL_VOCABULARY.electronics.en);
      expect(VERTICAL_VOCABULARY.beauty.en).not.toEqual(VERTICAL_VOCABULARY.food.en);
    });
  });

  describe('buildPrompt', () => {
    it('includes product title in quotes', () => {
      const prompt = buildPrompt(makeInput());
      expect(prompt).toContain('"Silk Abaya"');
    });

    it('includes target locale', () => {
      const prompt = buildPrompt(makeInput({ targetLocale: 'he' }));
      expect(prompt).toContain('in he for:');
    });

    it('includes category', () => {
      const prompt = buildPrompt(makeInput());
      expect(prompt).toContain('Category: Fashion');
    });

    it('includes attributes formatted as key: value', () => {
      const prompt = buildPrompt(makeInput());
      expect(prompt).toContain('color: Black');
      expect(prompt).toContain('material: Silk');
    });

    it('includes Arabic tone descriptor when locale is ar', () => {
      const prompt = buildPrompt(makeInput({ targetLocale: 'ar', tone: 'luxury' }));
      expect(prompt).toContain('أنيق وراقي');
    });

    it('includes Hebrew tone descriptor when locale is he', () => {
      const prompt = buildPrompt(makeInput({ targetLocale: 'he', tone: 'casual' }));
      expect(prompt).toContain('ידידותי ושיחתי');
    });

    it('includes vertical vocabulary hints for the locale', () => {
      const prompt = buildPrompt(makeInput({ targetLocale: 'ar', vertical: 'fashion' }));
      expect(prompt).toContain('أنيق');
      expect(prompt).toContain('موضة');
    });

    it('includes keywords when provided', () => {
      const prompt = buildPrompt(makeInput({ keywords: ['premium', 'handmade'] }));
      expect(prompt).toContain('Target keywords: premium, handmade');
    });

    it('omits keywords line when no keywords', () => {
      const prompt = buildPrompt(makeInput({ keywords: [] }));
      expect(prompt).not.toContain('Target keywords');
    });

    it('includes dialect when provided', () => {
      const prompt = buildPrompt(makeInput({ dialect: 'Gulf Arabic' }));
      expect(prompt).toContain('Dialect: Gulf Arabic');
    });

    it('omits dialect line when not provided', () => {
      const prompt = buildPrompt(makeInput());
      expect(prompt).not.toContain('Dialect:');
    });

    it('falls back to English tone when locale not found', () => {
      const prompt = buildPrompt(makeInput({ targetLocale: 'fr', tone: 'professional' }));
      expect(prompt).toContain('Professional and authoritative');
    });

    it('falls back to English vocabulary when locale not found', () => {
      const prompt = buildPrompt(makeInput({ targetLocale: 'fr', vertical: 'electronics' }));
      expect(prompt).toContain('innovative');
    });

    it('omits attributes line when attributes are empty', () => {
      const prompt = buildPrompt(makeInput({ attributes: {} }));
      expect(prompt).not.toContain('Attributes:');
    });
  });

  describe('validateInput', () => {
    it('returns valid for correct input', () => {
      const result = validateInput(makeInput());
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('rejects empty title', () => {
      const result = validateInput(makeInput({ title: '' }));
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product title is required');
    });

    it('rejects whitespace-only title', () => {
      const result = validateInput(makeInput({ title: '   ' }));
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product title is required');
    });

    it('rejects empty category', () => {
      const result = validateInput(makeInput({ category: '' }));
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Category is required');
    });

    it('rejects empty targetLocale', () => {
      const result = validateInput(makeInput({ targetLocale: '' }));
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Target locale is required');
    });

    it('rejects invalid tone', () => {
      const result = validateInput(makeInput({ tone: 'angry' as any }));
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid tone');
    });

    it('rejects invalid vertical', () => {
      const result = validateInput(makeInput({ vertical: 'cars' as any }));
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid vertical');
    });

    it('returns multiple errors for multiple issues', () => {
      const result = validateInput(makeInput({ title: '', category: '', tone: 'bad' as any }));
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(3);
    });
  });

  describe('estimateWordCount', () => {
    it('counts words in a simple sentence', () => {
      expect(estimateWordCount('hello world foo bar')).toBe(4);
    });

    it('returns 0 for empty string', () => {
      expect(estimateWordCount('')).toBe(0);
    });

    it('returns 0 for whitespace-only string', () => {
      expect(estimateWordCount('   ')).toBe(0);
    });

    it('handles multiple spaces between words', () => {
      expect(estimateWordCount('hello    world')).toBe(2);
    });

    it('counts Arabic words', () => {
      expect(estimateWordCount('مرحبا بالعالم العربي')).toBe(3);
    });

    it('returns 1 for a single word', () => {
      expect(estimateWordCount('hello')).toBe(1);
    });
  });

  describe('checkConfidence', () => {
    it('returns true when confidence >= threshold', () => {
      expect(checkConfidence(makeDescription({ confidenceScore: 0.7 }))).toBe(true);
      expect(checkConfidence(makeDescription({ confidenceScore: 0.95 }))).toBe(true);
    });

    it('returns false when confidence < threshold', () => {
      expect(checkConfidence(makeDescription({ confidenceScore: 0.69 }))).toBe(false);
      expect(checkConfidence(makeDescription({ confidenceScore: 0.1 }))).toBe(false);
    });

    it('respects custom config threshold', () => {
      const config = { ...DEFAULT_CONFIG, confidenceThreshold: 0.9 };
      expect(checkConfidence(makeDescription({ confidenceScore: 0.85 }), config)).toBe(false);
      expect(checkConfidence(makeDescription({ confidenceScore: 0.95 }), config)).toBe(true);
    });
  });

  describe('needsHumanReview', () => {
    it('returns false for high-confidence, short description within limits', () => {
      expect(needsHumanReview(makeDescription({ confidenceScore: 0.9 }))).toBe(false);
    });

    it('returns true for low confidence', () => {
      expect(needsHumanReview(makeDescription({ confidenceScore: 0.5 }))).toBe(true);
    });

    it('returns true when short description exceeds 120% of maxShortWords', () => {
      // DEFAULT_CONFIG.maxShortWords = 80, so 120% = 96 words
      const longShort = Array(100).fill('word').join(' ');
      expect(needsHumanReview(makeDescription({ shortDescription: longShort, confidenceScore: 0.9 }))).toBe(true);
    });

    it('returns true when metaTitle exceeds maxChars', () => {
      const longTitle = 'A'.repeat(61); // 61 > 60
      expect(needsHumanReview(makeDescription({ metaTitle: longTitle, confidenceScore: 0.9 }))).toBe(true);
    });

    it('returns false when metaTitle is exactly at limit', () => {
      const exactTitle = 'A'.repeat(60);
      expect(needsHumanReview(makeDescription({ metaTitle: exactTitle, confidenceScore: 0.9 }))).toBe(false);
    });
  });

  describe('getToneDescriptor', () => {
    it('returns Arabic descriptor for ar locale', () => {
      expect(getToneDescriptor('luxury', 'ar')).toBe('أنيق وراقي');
    });

    it('returns Hebrew descriptor for he locale', () => {
      expect(getToneDescriptor('playful', 'he')).toBe('כיפי ואנרגטי');
    });

    it('returns English descriptor for en locale', () => {
      expect(getToneDescriptor('professional', 'en')).toBe('Professional and authoritative');
    });

    it('falls back to English for unknown locale', () => {
      expect(getToneDescriptor('casual', 'zh')).toBe('Friendly and conversational');
    });

    it('returns different values for different tones', () => {
      const pro = getToneDescriptor('professional', 'en');
      const cas = getToneDescriptor('casual', 'en');
      expect(pro).not.toBe(cas);
    });
  });

  describe('getVerticalVocabulary', () => {
    it('returns Arabic words for ar locale', () => {
      const vocab = getVerticalVocabulary('beauty', 'ar');
      expect(vocab).toEqual(['مشرق', 'مغذي', 'فاخر']);
    });

    it('returns Hebrew words for he locale', () => {
      const vocab = getVerticalVocabulary('food', 'he');
      expect(vocab).toEqual(['טרי', 'אותנטי', 'טעים']);
    });

    it('falls back to English for unknown locale', () => {
      const vocab = getVerticalVocabulary('general', 'ja');
      expect(vocab).toEqual(['quality', 'value', 'reliable']);
    });

    it('returns different vocab for different verticals', () => {
      const fashion = getVerticalVocabulary('fashion', 'en');
      const electronics = getVerticalVocabulary('electronics', 'en');
      expect(fashion).not.toEqual(electronics);
    });
  });

  describe('getAvailableTones', () => {
    it('returns exactly four tones', () => {
      const tones = getAvailableTones();
      expect(tones).toHaveLength(4);
      expect(tones).toEqual(['professional', 'casual', 'luxury', 'playful']);
    });
  });

  describe('getAvailableVerticals', () => {
    it('returns exactly six verticals', () => {
      const verticals = getAvailableVerticals();
      expect(verticals).toHaveLength(6);
      expect(verticals).toContain('fashion');
      expect(verticals).toContain('electronics');
      expect(verticals).toContain('beauty');
      expect(verticals).toContain('food');
      expect(verticals).toContain('home_goods');
      expect(verticals).toContain('general');
    });
  });
});
