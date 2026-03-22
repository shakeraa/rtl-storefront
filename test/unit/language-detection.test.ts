import { describe, it, expect } from 'vitest';
import {
  detectLanguage,
  detectFromHTML,
  getDetectionConfidence,
  supportsLanguageDetection,
  getSupportedLanguages,
  getLanguageInfo,
  isRTLLanguage,
  getConfidenceLevel,
  batchDetectLanguages,
  detectDominantLanguage,
  LANGUAGE_PATTERNS,
} from '../../app/services/translation-features/language-detection';

describe('Language Detection Service - T0325', () => {
  describe('supportsLanguageDetection', () => {
    it('should return true indicating detection is supported', () => {
      expect(supportsLanguageDetection()).toBe(true);
    });
  });

  describe('LANGUAGE_PATTERNS', () => {
    it('should have Arabic language pattern', () => {
      expect(LANGUAGE_PATTERNS['ar']).toBeDefined();
      expect(LANGUAGE_PATTERNS['ar'].name).toBe('Arabic');
      expect(LANGUAGE_PATTERNS['ar'].isRTL).toBe(true);
      expect(LANGUAGE_PATTERNS['ar'].script).toBe('Arabic');
    });

    it('should have Hebrew language pattern', () => {
      expect(LANGUAGE_PATTERNS['he']).toBeDefined();
      expect(LANGUAGE_PATTERNS['he'].name).toBe('Hebrew');
      expect(LANGUAGE_PATTERNS['he'].isRTL).toBe(true);
      expect(LANGUAGE_PATTERNS['he'].script).toBe('Hebrew');
    });

    it('should have English language pattern', () => {
      expect(LANGUAGE_PATTERNS['en']).toBeDefined();
      expect(LANGUAGE_PATTERNS['en'].name).toBe('English');
      expect(LANGUAGE_PATTERNS['en'].isRTL).toBe(false);
      expect(LANGUAGE_PATTERNS['en'].script).toBe('Latin');
    });

    it('should have French language pattern', () => {
      expect(LANGUAGE_PATTERNS['fr']).toBeDefined();
      expect(LANGUAGE_PATTERNS['fr'].name).toBe('French');
    });

    it('should have German language pattern', () => {
      expect(LANGUAGE_PATTERNS['de']).toBeDefined();
      expect(LANGUAGE_PATTERNS['de'].name).toBe('German');
    });

    it('should have Spanish language pattern', () => {
      expect(LANGUAGE_PATTERNS['es']).toBeDefined();
      expect(LANGUAGE_PATTERNS['es'].name).toBe('Spanish');
    });

    it('should have Russian language pattern', () => {
      expect(LANGUAGE_PATTERNS['ru']).toBeDefined();
      expect(LANGUAGE_PATTERNS['ru'].script).toBe('Cyrillic');
    });

    it('should have Chinese language pattern', () => {
      expect(LANGUAGE_PATTERNS['zh']).toBeDefined();
      expect(LANGUAGE_PATTERNS['zh'].script).toBe('CJK');
    });
  });

  describe('detectLanguage - Arabic', () => {
    it('should detect Arabic from simple text', () => {
      const result = detectLanguage('مرحبا بالعالم');
      expect(result.language).toBe('ar');
      expect(result.script).toBe('Arabic');
      expect(result.isRTL).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should detect Arabic from longer text', () => {
      const result = detectLanguage('هذا نص عربي طويل يحتوي على كلمات متعددة للاختبار');
      expect(result.language).toBe('ar');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should detect Arabic with confidence for mixed content', () => {
      const result = detectLanguage('مرحبا hello world بالعالم');
      expect(result.language).toBe('ar');
      expect(result.isRTL).toBe(true);
    });
  });

  describe('detectLanguage - Hebrew', () => {
    it('should detect Hebrew from simple text', () => {
      const result = detectLanguage('שלום עולם');
      expect(result.language).toBe('he');
      expect(result.script).toBe('Hebrew');
      expect(result.isRTL).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it('should detect Hebrew from longer text', () => {
      const result = detectLanguage('זהו טקסט בעברית שמכיל מילים רבות לבדיקה');
      expect(result.language).toBe('he');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should detect Hebrew with common words', () => {
      const result = detectLanguage('את שלי ואת שלו');
      expect(result.language).toBe('he');
    });
  });

  describe('detectLanguage - English', () => {
    it('should detect English from simple text', () => {
      const result = detectLanguage('Hello world');
      expect(result.language).toBe('en');
      expect(result.script).toBe('Latin');
      expect(result.isRTL).toBe(false);
    });

    it('should detect Latin script for English text', () => {
      const result = detectLanguage('The quick brown fox jumps over the lazy dog in the countryside');
      expect(result.script).toBe('Latin');
      expect(result.isRTL).toBe(false);
    });

    it('should provide alternatives for English detection', () => {
      const result = detectLanguage('This is a test of the English language detection system that works well');
      expect(result.script).toBe('Latin');
      expect(result.alternatives).toBeDefined();
      expect(Array.isArray(result.alternatives)).toBe(true);
    });
  });

  describe('detectLanguage - European Languages', () => {
    it('should detect French text', () => {
      const result = detectLanguage('Bonjour le monde et les amis');
      expect(result.language).toBe('fr');
      expect(result.script).toBe('Latin');
    });

    it('should detect French with accents', () => {
      const result = detectLanguage('Le café français est délicieux');
      expect(result.language).toBe('fr');
    });

    it('should detect German text', () => {
      const result = detectLanguage('Hallo Welt und die Freunde');
      expect(result.language).toBe('de');
    });

    it('should detect German with umlauts', () => {
      const result = detectLanguage('Die Straße ist schön und größer');
      expect(result.language).toBe('de');
    });

    it('should detect Spanish text', () => {
      const result = detectLanguage('Hola mundo y los amigos');
      expect(result.language).toBe('es');
    });

    it('should detect Spanish with accents', () => {
      const result = detectLanguage('El niño juega en el jardín');
      expect(result.language).toBe('es');
    });

    it('should detect Italian text', () => {
      const result = detectLanguage('Ciao mondo e gli amici');
      expect(result.language).toBe('it');
    });

    it('should detect Portuguese text', () => {
      const result = detectLanguage('Olá mundo e os amigos');
      expect(result.language).toBe('pt');
    });
  });

  describe('detectLanguage - Other Scripts', () => {
    it('should detect Russian (Cyrillic)', () => {
      const result = detectLanguage('Привет мир');
      expect(result.language).toBe('ru');
      expect(result.script).toBe('Cyrillic');
    });

    it('should detect Chinese', () => {
      const result = detectLanguage('你好世界');
      expect(result.language).toBe('zh');
      expect(result.script).toBe('CJK');
    });

    it('should detect Japanese', () => {
      const result = detectLanguage('こんにちは世界');
      expect(result.language).toBe('ja');
      expect(result.script).toBe('Japanese');
    });

    it('should detect Korean', () => {
      const result = detectLanguage('안녕하세요 세계');
      expect(result.language).toBe('ko');
      expect(result.script).toBe('Korean');
    });

    it('should detect Hindi (Devanagari)', () => {
      const result = detectLanguage('नमस्ते दुनिया');
      expect(result.language).toBe('hi');
      expect(result.script).toBe('Devanagari');
    });
  });

  describe('detectLanguage - Edge Cases', () => {
    it('should return unknown for empty string', () => {
      const result = detectLanguage('');
      expect(result.language).toBe('unknown');
      expect(result.confidence).toBe(0);
    });

    it('should return unknown for whitespace only', () => {
      const result = detectLanguage('   \n\t  ');
      expect(result.language).toBe('unknown');
      expect(result.confidence).toBe(0);
    });

    it('should handle null input gracefully', () => {
      const result = detectLanguage(null as unknown as string);
      expect(result.language).toBe('unknown');
      expect(result.confidence).toBe(0);
    });

    it('should handle undefined input gracefully', () => {
      const result = detectLanguage(undefined as unknown as string);
      expect(result.language).toBe('unknown');
      expect(result.confidence).toBe(0);
    });

    it('should handle numbers only', () => {
      const result = detectLanguage('123456789');
      expect(result.language).toBe('unknown');
    });

    it('should handle special characters', () => {
      const result = detectLanguage('!@#$%^&*()');
      expect(result.language).toBe('unknown');
    });

    it('should reduce confidence for short text', () => {
      const shortResult = detectLanguage('hi');
      const longResult = detectLanguage('hello world this is a much longer text for testing');
      expect(shortResult.confidence).toBeLessThan(longResult.confidence);
    });
  });

  describe('getDetectionConfidence', () => {
    it('should return high confidence for pure Arabic text', () => {
      const text = 'هذا نص عربي خالص';
      const confidence = getDetectionConfidence(text, 'ar');
      expect(confidence).toBeGreaterThan(0.7);
    });

    it('should return high confidence for pure Hebrew text', () => {
      const text = 'זהו טקסט עברי טהור';
      const confidence = getDetectionConfidence(text, 'he');
      expect(confidence).toBeGreaterThan(0.7);
    });

    it('should return confidence for English text', () => {
      const text = 'This is English text';
      const confidence = getDetectionConfidence(text, 'en');
      expect(confidence).toBeGreaterThan(0);
    });

    it('should return 0 for empty text', () => {
      const confidence = getDetectionConfidence('', 'en');
      expect(confidence).toBe(0);
    });

    it('should return 0 for invalid language code', () => {
      const confidence = getDetectionConfidence('hello world', 'xyz');
      expect(confidence).toBe(0);
    });

    it('should boost confidence for common words', () => {
      const textWithCommonWords = 'the quick brown fox jumps over the lazy dog';
      const confidence = getDetectionConfidence(textWithCommonWords, 'en');
      expect(confidence).toBeGreaterThan(0.1);
    });
  });

  describe('detectFromHTML - HTML Lang Attribute', () => {
    it('should detect language from html lang attribute', () => {
      const html = '<html lang="ar"><body>محتوى</body></html>';
      const result = detectFromHTML(html);
      expect(result.language).toBe('ar');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should detect language from html lang with region', () => {
      const html = '<html lang="en-US"><body>Content</body></html>';
      const result = detectFromHTML(html);
      expect(result.language).toBe('en');
    });

    it('should detect Hebrew from html lang', () => {
      const html = '<html lang="he"><body>תוכן</body></html>';
      const result = detectFromHTML(html);
      expect(result.language).toBe('he');
      expect(result.isRTL).toBe(true);
    });

    it('should be case insensitive for lang attribute', () => {
      const html = '<HTML LANG="FR"><body>Contenu</body></HTML>';
      const result = detectFromHTML(html);
      expect(result.language).toBe('fr');
    });
  });

  describe('detectFromHTML - Meta Tags', () => {
    it('should detect from meta name="language" tag', () => {
      const html = '<html><head><meta name="language" content="de"></head><body>Content</body></html>';
      const result = detectFromHTML(html);
      expect(result.language).toBe('de');
    });

    it('should detect from meta http-equiv="content-language"', () => {
      const html = '<html><head><meta http-equiv="content-language" content="es"></head><body>Content</body></html>';
      const result = detectFromHTML(html);
      expect(result.language).toBe('es');
    });

    it('should detect from og:locale meta tag', () => {
      const html = '<html><head><meta property="og:locale" content="it_IT"></head><body>Content</body></html>';
      const result = detectFromHTML(html);
      expect(result.language).toBe('it');
    });

    it('should detect from twitter:locale meta tag', () => {
      const html = '<html><head><meta name="twitter:locale" content="pt-BR"></head><body>Content</body></html>';
      const result = detectFromHTML(html);
      expect(result.language).toBe('pt');
    });

    it('should prefer html lang over meta tags', () => {
      const html = '<html lang="ar"><head><meta name="language" content="en"></head><body>محتوى</body></html>';
      const result = detectFromHTML(html);
      expect(result.language).toBe('ar');
    });
  });

  describe('detectFromHTML - Content Analysis', () => {
    it('should fallback to content analysis when no meta info', () => {
      const html = '<html><body>مرحبا بالعالم هذا نص عربي</body></html>';
      const result = detectFromHTML(html);
      expect(result.language).toBe('ar');
    });

    it('should detect from body content', () => {
      const html = '<html><body>Hello world this is English content</body></html>';
      const result = detectFromHTML(html);
      expect(result.language).toBe('en');
    });

    it('should ignore script tags in content analysis', () => {
      const html = '<html><body><script>var x = "Hello";</script>مرحبا بالعالم</body></html>';
      const result = detectFromHTML(html);
      expect(result.language).toBe('ar');
    });

    it('should ignore style tags in content analysis', () => {
      const html = '<html><body><style>body { color: red; }</style>שלום עולם</body></html>';
      const result = detectFromHTML(html);
      expect(result.language).toBe('he');
    });
  });

  describe('detectFromHTML - Edge Cases', () => {
    it('should return unknown for empty HTML', () => {
      const result = detectFromHTML('');
      expect(result.language).toBe('unknown');
      expect(result.confidence).toBe(0);
    });

    it('should handle null HTML', () => {
      const result = detectFromHTML(null as unknown as string);
      expect(result.language).toBe('unknown');
      expect(result.confidence).toBe(0);
    });

    it('should handle HTML with no text content', () => {
      const html = '<html><head></head><body><div></div></body></html>';
      const result = detectFromHTML(html);
      expect(result.language).toBe('unknown');
    });

    it('should handle malformed HTML gracefully', () => {
      const html = '<html><body>مرحبا';
      const result = detectFromHTML(html);
      expect(result.language).toBe('ar');
    });
  });

  describe('getSupportedLanguages', () => {
    it('should return array of language codes', () => {
      const languages = getSupportedLanguages();
      expect(Array.isArray(languages)).toBe(true);
      expect(languages.length).toBeGreaterThan(0);
      expect(languages).toContain('ar');
      expect(languages).toContain('he');
      expect(languages).toContain('en');
    });

    it('should include all major languages', () => {
      const languages = getSupportedLanguages();
      expect(languages).toContain('ar');
      expect(languages).toContain('he');
      expect(languages).toContain('en');
      expect(languages).toContain('fr');
      expect(languages).toContain('de');
      expect(languages).toContain('es');
    });
  });

  describe('getLanguageInfo', () => {
    it('should return info for Arabic', () => {
      const info = getLanguageInfo('ar');
      expect(info).toBeDefined();
      expect(info?.name).toBe('Arabic');
      expect(info?.isRTL).toBe(true);
    });

    it('should return info for Hebrew', () => {
      const info = getLanguageInfo('he');
      expect(info).toBeDefined();
      expect(info?.name).toBe('Hebrew');
      expect(info?.isRTL).toBe(true);
    });

    it('should return info for English', () => {
      const info = getLanguageInfo('en');
      expect(info).toBeDefined();
      expect(info?.name).toBe('English');
      expect(info?.isRTL).toBe(false);
    });

    it('should be case insensitive', () => {
      const info = getLanguageInfo('AR');
      expect(info).toBeDefined();
      expect(info?.name).toBe('Arabic');
    });

    it('should return null for unknown language', () => {
      const info = getLanguageInfo('xyz');
      expect(info).toBeNull();
    });
  });

  describe('isRTLLanguage', () => {
    it('should return true for Arabic', () => {
      expect(isRTLLanguage('ar')).toBe(true);
    });

    it('should return true for Hebrew', () => {
      expect(isRTLLanguage('he')).toBe(true);
    });

    it('should return false for English', () => {
      expect(isRTLLanguage('en')).toBe(false);
    });

    it('should return false for French', () => {
      expect(isRTLLanguage('fr')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isRTLLanguage('AR')).toBe(true);
      expect(isRTLLanguage('HE')).toBe(true);
    });

    it('should return false for unknown language', () => {
      expect(isRTLLanguage('xyz')).toBe(false);
    });
  });

  describe('getConfidenceLevel', () => {
    it('should return high for confidence >= 0.8', () => {
      expect(getConfidenceLevel(0.9)).toBe('high');
      expect(getConfidenceLevel(0.8)).toBe('high');
    });

    it('should return medium for confidence >= 0.5', () => {
      expect(getConfidenceLevel(0.7)).toBe('medium');
      expect(getConfidenceLevel(0.5)).toBe('medium');
    });

    it('should return low for confidence >= 0.3', () => {
      expect(getConfidenceLevel(0.4)).toBe('low');
      expect(getConfidenceLevel(0.3)).toBe('low');
    });

    it('should return unknown for confidence < 0.3', () => {
      expect(getConfidenceLevel(0.2)).toBe('unknown');
      expect(getConfidenceLevel(0)).toBe('unknown');
    });
  });

  describe('batchDetectLanguages', () => {
    it('should detect multiple texts', () => {
      const texts = ['Hello world', 'مرحبا بالعالم', 'שלום עולם'];
      const results = batchDetectLanguages(texts);
      expect(results).toHaveLength(3);
      expect(results[0].language).toBe('en');
      expect(results[1].language).toBe('ar');
      expect(results[2].language).toBe('he');
    });

    it('should handle empty array', () => {
      const results = batchDetectLanguages([]);
      expect(results).toHaveLength(0);
    });

    it('should handle mixed valid and invalid texts', () => {
      const texts = ['Hello world', '', 'مرحبا', '12345'];
      const results = batchDetectLanguages(texts);
      expect(results).toHaveLength(4);
      expect(results[0].language).toBe('en');
      expect(results[1].language).toBe('unknown');
      expect(results[2].language).toBe('ar');
      expect(results[3].language).toBe('unknown');
    });
  });

  describe('detectDominantLanguage', () => {
    it('should detect dominant language from samples', () => {
      const texts = ['مرحبا بالعالم', 'هذا نص عربي', 'اللغة العربية', 'Hello'];
      const result = detectDominantLanguage(texts);
      expect(result.language).toBe('ar');
    });

    it('should return unknown for empty array', () => {
      const result = detectDominantLanguage([]);
      expect(result.language).toBe('unknown');
    });

    it('should handle all unknown texts', () => {
      const texts = ['123', '!!!', '...'];
      const result = detectDominantLanguage(texts);
      expect(result.language).toBe('unknown');
    });

    it('should handle mixed languages with tie-breaker', () => {
      const texts = ['مرحبا', 'Hello world this is a longer text', 'Hi'];
      const result = detectDominantLanguage(texts);
      expect(result.language).toBeDefined();
    });

    it('should average confidence across samples', () => {
      const texts = ['مرحبا بالعالم هذا نص طويل', 'اللغة العربية جميلة'];
      const result = detectDominantLanguage(texts);
      expect(result.language).toBe('ar');
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle real-world Arabic product description', () => {
      const text = 'قميص رجالي أنيق من القطن 100% متوفر بمقاسات متعددة و ألوان جذابة';
      const result = detectLanguage(text);
      expect(result.language).toBe('ar');
      expect(result.isRTL).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should handle real-world Hebrew product description', () => {
      const text = 'חולצה אלגנטית לגברים עשויה מכותנה 100% זמינה במגוון מידות וצבעים';
      const result = detectLanguage(text);
      expect(result.language).toBe('he');
      expect(result.isRTL).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should handle real-world English product description', () => {
      const text = 'Elegant men\'s shirt made from 100% cotton available in multiple sizes and attractive colors';
      const result = detectLanguage(text);
      expect(result.script).toBe('Latin');
      expect(result.isRTL).toBe(false);
    });

    it('should handle HTML with multiple language indicators', () => {
      const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="language" content="en"><meta property="og:locale" content="fr_FR"></head><body><h1>مرحبا بالعالم</h1></body></html>`;
      const result = detectFromHTML(html);
      expect(result.language).toBe('ar');
    });

    it('should handle multilingual text with dominant language', () => {
      const text = 'مرحبا بالعالم هذا نص عربي طويل والنص الانجليزي قليل hello';
      const result = detectLanguage(text);
      expect(result.language).toBe('ar');
    });
  });
});
