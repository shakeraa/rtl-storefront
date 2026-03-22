import { describe, it, expect } from 'vitest';
import {
  SCREEN_READER_CONFIGS,
  PRONUNCIATION_GUIDES,
  TEXT_SIMPLIFICATIONS,
  SCREEN_READER_HINTS,
  NUMBER_READING_RULES,
  getScreenReaderConfig,
  isRTLLocale,
  optimizeForScreenReader,
  getPronunciationGuide,
  searchPronunciationGuides,
  getAllPronunciationGuides,
  simplifyForAudio,
  getScreenReaderHints,
  getPronunciationCategories,
  addPronunciationGuide,
  batchOptimizeForScreenReader,
  needsScreenReaderOptimization,
  getTextStatistics,
  createLiveAnnouncement,
  getSkipLinkText,
  getLoadingAnnouncement,
  getErrorAnnouncement,
  getSuccessAnnouncement,
} from '../../app/services/translation-features/screen-reader';

describe('Screen Reader Service - T0346', () => {
  describe('SCREEN_READER_CONFIGS', () => {
    it('should have config for Arabic locale', () => {
      expect(SCREEN_READER_CONFIGS['ar']).toBeDefined();
      expect(SCREEN_READER_CONFIGS['ar'].isRTL).toBe(true);
      expect(SCREEN_READER_CONFIGS['ar'].nativeName).toBe('العربية');
    });

    it('should have config for Hebrew locale', () => {
      expect(SCREEN_READER_CONFIGS['he']).toBeDefined();
      expect(SCREEN_READER_CONFIGS['he'].isRTL).toBe(true);
      expect(SCREEN_READER_CONFIGS['he'].nativeName).toBe('עברית');
    });

    it('should have config for English locale', () => {
      expect(SCREEN_READER_CONFIGS['en']).toBeDefined();
      expect(SCREEN_READER_CONFIGS['en'].isRTL).toBe(false);
      expect(SCREEN_READER_CONFIGS['en'].nativeName).toBe('English');
    });

    it('should have extended locale configs', () => {
      expect(SCREEN_READER_CONFIGS['ar-sa']).toBeDefined();
      expect(SCREEN_READER_CONFIGS['he-il']).toBeDefined();
      expect(SCREEN_READER_CONFIGS['en-us']).toBeDefined();
      expect(SCREEN_READER_CONFIGS['en-gb']).toBeDefined();
    });

    it('should have correct voice preferences per locale', () => {
      expect(SCREEN_READER_CONFIGS['ar'].voicePreferences.gender).toBe('female');
      expect(SCREEN_READER_CONFIGS['he'].voicePreferences.gender).toBe('female');
      expect(SCREEN_READER_CONFIGS['en'].voicePreferences.gender).toBe('neutral');
    });
  });

  describe('getScreenReaderConfig', () => {
    it('should return exact locale match', () => {
      const config = getScreenReaderConfig('ar');
      expect(config.locale).toBe('ar');
      expect(config.isRTL).toBe(true);
    });

    it('should return base locale for extended locale', () => {
      const config = getScreenReaderConfig('ar-SA');
      expect(config.locale).toBe('ar');
    });

    it('should be case insensitive', () => {
      const config = getScreenReaderConfig('AR');
      expect(config.locale).toBe('ar');
    });

    it('should fallback to English for unknown locale', () => {
      const config = getScreenReaderConfig('xx');
      expect(config.locale).toBe('en');
    });

    it('should return Hebrew config for he-IL', () => {
      const config = getScreenReaderConfig('he-IL');
      expect(config.isRTL).toBe(true);
      expect(config.numberReading).toBe('hebrew');
    });
  });

  describe('isRTLLocale', () => {
    it('should return true for Arabic', () => {
      expect(isRTLLocale('ar')).toBe(true);
      expect(isRTLLocale('ar-sa')).toBe(true);
    });

    it('should return true for Hebrew', () => {
      expect(isRTLLocale('he')).toBe(true);
      expect(isRTLLocale('he-IL')).toBe(true);
    });

    it('should return false for English', () => {
      expect(isRTLLocale('en')).toBe(false);
      expect(isRTLLocale('en-US')).toBe(false);
    });

    it('should fallback to English (false) for unknown locale', () => {
      expect(isRTLLocale('xx')).toBe(false);
    });
  });

  describe('optimizeForScreenReader', () => {
    it('should return empty string for empty input', () => {
      expect(optimizeForScreenReader('')).toBe('');
      expect(optimizeForScreenReader(null as unknown as string)).toBe('');
    });

    it('should expand abbreviations in Arabic', () => {
      const result = optimizeForScreenReader('السعر 100 ر.س', 'ar');
      expect(result).toContain('ريال');
    });

    it('should expand abbreviations in Hebrew', () => {
      const result = optimizeForScreenReader('המחיר הוא 100 ₪', 'he');
      expect(result).toContain('שקלים');
    });

    it('should expand abbreviations in English', () => {
      const result = optimizeForScreenReader('Price is $100', 'en');
      expect(result).toContain('dollars');
    });

    it('should add pauses when option is enabled', () => {
      const result = optimizeForScreenReader('Hello world. How are you?', 'en', { addPauses: true });
      expect(result).toContain('.');
    });

    it('should convert numbers to words when enabled', () => {
      const result = optimizeForScreenReader('I have 5 items', 'en', { speakNumbersAsWords: true });
      expect(result.toLowerCase()).toContain('five');
    });

    it('should preserve original when options disabled', () => {
      const text = 'Price: $100 (USD)';
      const result = optimizeForScreenReader(text, 'en', {
        expandAbbreviations: false,
        addPauses: false,
      });
      expect(result).toContain('$100');
    });

    it('should simplify complex sentences', () => {
      const longText = 'This is a very long sentence that has many words and should be processed to make it easier for screen readers to handle efficiently and effectively.';
      const result = optimizeForScreenReader(longText, 'en', { simplifyComplexTerms: true });
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getPronunciationGuide', () => {
    it('should return guide for Arabic ecommerce term', () => {
      const guide = getPronunciationGuide('سلة التسوق', 'ar');
      expect(guide).not.toBeNull();
      expect(guide?.phonetic).toBeDefined();
    });

    it('should return guide for Hebrew ecommerce term', () => {
      const guide = getPronunciationGuide('עגלת קניות', 'he');
      expect(guide).not.toBeNull();
      expect(guide?.context).toBe('shopping cart');
    });

    it('should return guide for English ecommerce term', () => {
      const guide = getPronunciationGuide('checkout', 'en');
      expect(guide).not.toBeNull();
      expect(guide?.phonetic).toBe('CHEK-out');
    });

    it('should return guide with syllables when available', () => {
      const guide = getPronunciationGuide('discount', 'en');
      expect(guide).not.toBeNull();
      expect(guide?.syllables).toBeDefined();
      expect(guide?.syllables?.length).toBeGreaterThan(1);
    });

    it('should return null for unknown term', () => {
      const guide = getPronunciationGuide('xyz-unknown-term', 'en');
      expect(guide).toBeNull();
    });

    it('should search in specific category', () => {
      const guide = getPronunciationGuide('SKU', 'en', 'ecommerce');
      expect(guide).not.toBeNull();
      expect(guide?.context).toBe('stock keeping unit');
    });

    it('should be case insensitive', () => {
      const guide = getPronunciationGuide('CHECKOUT', 'en');
      expect(guide).not.toBeNull();
    });
  });

  describe('searchPronunciationGuides', () => {
    it('should find guides by term partial match', () => {
      const results = searchPronunciationGuides('cart', 'en');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find guides by phonetic match', () => {
      const results = searchPronunciationGuides('CHEK', 'en');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find guides by context', () => {
      const results = searchPronunciationGuides('shopping', 'en');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for no matches', () => {
      const results = searchPronunciationGuides('xyz-no-match', 'en');
      expect(results).toEqual([]);
    });
  });

  describe('getAllPronunciationGuides', () => {
    it('should return all guides for a locale', () => {
      const guides = getAllPronunciationGuides('en');
      expect(Object.keys(guides).length).toBeGreaterThan(0);
    });

    it('should have ecommerce category', () => {
      const guides = getAllPronunciationGuides('en');
      expect(guides['ecommerce']).toBeDefined();
      expect(guides['ecommerce'].length).toBeGreaterThan(0);
    });

    it('should return empty object for unknown locale', () => {
      const guides = getAllPronunciationGuides('xx');
      expect(Object.keys(guides).length).toBe(0);
    });
  });

  describe('simplifyForAudio', () => {
    it('should remove non-essential punctuation', () => {
      const result = simplifyForAudio('Hello (world) [test]', 'en');
      expect(result).not.toContain('(');
      expect(result).not.toContain(')');
    });

    it('should expand symbols in basic mode', () => {
      const result = simplifyForAudio('Price: $100', 'en', 'basic');
      expect(result).toContain('dollars');
    });

    it('should convert numbers to words in basic mode', () => {
      const result = simplifyForAudio('I have 5 items', 'en', 'basic');
      expect(result.toLowerCase()).toContain('five');
    });

    it('should preserve more content in standard mode', () => {
      const text = 'Price: $100 (USD)';
      const result = simplifyForAudio(text, 'en', 'standard');
      expect(result.length).toBeGreaterThan(10);
    });

    it('should handle Arabic text', () => {
      const result = simplifyForAudio('السعر 100$', 'ar', 'basic');
      expect(result).toContain('دولار');
    });

    it('should handle Hebrew text', () => {
      const result = simplifyForAudio('המחיר הוא 100 ₪', 'he', 'basic');
      expect(result).toContain('שקלים');
    });

    it('should return empty string for empty input', () => {
      expect(simplifyForAudio('')).toBe('');
    });
  });

  describe('getScreenReaderHints', () => {
    it('should return hint for button element', () => {
      const hint = getScreenReaderHints({ type: 'button', label: 'Submit' }, 'en');
      expect(hint.ariaLabel).toContain('button');
      expect(hint.ariaLabel).toContain('Submit');
    });

    it('should return hint for link element', () => {
      const hint = getScreenReaderHints({ type: 'link', label: 'Home' }, 'en');
      expect(hint.ariaLabel).toContain('link');
    });

    it('should return hint for input element', () => {
      const hint = getScreenReaderHints({ type: 'input', label: 'Email' }, 'en');
      expect(hint.ariaLabel).toContain('input field');
    });

    it('should return required state for required input', () => {
      const hint = getScreenReaderHints({ type: 'input', label: 'Name', required: true }, 'en');
      expect(hint.ariaLabel).toContain('required');
    });

    it('should return checked state for checkbox', () => {
      const hint = getScreenReaderHints({ type: 'checkbox', label: 'Agree', checked: true }, 'en');
      expect(hint.ariaLabel).toContain('checked');
    });

    it('should return selected state for radio', () => {
      const hint = getScreenReaderHints({ type: 'radio', label: 'Option 1', selected: true }, 'en');
      expect(hint.ariaLabel).toContain('selected');
    });

    it('should handle commerce price element', () => {
      const hint = getScreenReaderHints({ 
        type: 'price', 
        state: { amount: '100', currency: 'USD' } 
      }, 'en');
      expect(hint.ariaLabel).toContain('price');
      expect(hint.ariaLabel).toContain('100');
    });

    it('should handle Arabic locale hints', () => {
      const hint = getScreenReaderHints({ type: 'button', label: 'إرسال' }, 'ar');
      expect(hint.ariaLabel).toContain('زر');
    });

    it('should handle Hebrew locale hints', () => {
      const hint = getScreenReaderHints({ type: 'button', label: 'שלח' }, 'he');
      expect(hint.ariaLabel).toContain('לחצן');
    });

    it('should include live region for alerts', () => {
      const hint = getScreenReaderHints({ 
        type: 'alert', 
        state: { message: 'Error occurred' } 
      }, 'en');
      expect(hint.liveRegion).toBe('assertive');
    });

    it('should include description when available', () => {
      const hint = getScreenReaderHints({ 
        type: 'button', 
        label: 'Submit',
        disabled: false 
      }, 'en');
      expect(hint.ariaDescription).toBeDefined();
    });
  });

  describe('getPronunciationCategories', () => {
    it('should return categories for English', () => {
      const categories = getPronunciationCategories('en');
      expect(categories).toContain('ecommerce');
      expect(categories).toContain('common');
    });

    it('should return categories for Arabic', () => {
      const categories = getPronunciationCategories('ar');
      expect(categories).toContain('ecommerce');
      expect(categories).toContain('numbers');
    });

    it('should return empty array for unknown locale', () => {
      const categories = getPronunciationCategories('xx');
      expect(categories).toEqual([]);
    });
  });

  describe('addPronunciationGuide', () => {
    it('should add custom pronunciation guide', () => {
      const newGuide = {
        term: 'custom-term',
        phonetic: 'CUS-tom term',
        audioHint: 'custom term',
      };
      addPronunciationGuide(newGuide, 'en', 'custom');
      
      const retrieved = getPronunciationGuide('custom-term', 'en', 'custom');
      expect(retrieved).not.toBeNull();
      expect(retrieved?.phonetic).toBe('CUS-tom term');
    });

    it('should create category if not exists', () => {
      const newGuide = {
        term: 'new-cat-term',
        phonetic: 'NEW cat term',
        audioHint: 'new category term',
      };
      addPronunciationGuide(newGuide, 'en', 'newcategory');
      
      const guides = getAllPronunciationGuides('en');
      expect(guides['newcategory']).toBeDefined();
    });
  });

  describe('batchOptimizeForScreenReader', () => {
    it('should optimize multiple texts', () => {
      const texts = ['Hello $100', 'Price: 50%'];
      const results = batchOptimizeForScreenReader(texts, 'en');
      expect(results).toHaveLength(2);
      expect(results[0]).toContain('dollars');
    });

    it('should return empty array for empty input', () => {
      const results = batchOptimizeForScreenReader([], 'en');
      expect(results).toEqual([]);
    });

    it('should apply options to all texts', () => {
      const texts = ['Test 1', 'Test 2'];
      const results = batchOptimizeForScreenReader(texts, 'en', { addPauses: true });
      expect(results).toHaveLength(2);
    });
  });

  describe('needsScreenReaderOptimization', () => {
    it('should return true for long numbers', () => {
      expect(needsScreenReaderOptimization('Code: 12345678')).toBe(true);
    });

    it('should return true for abbreviations', () => {
      expect(needsScreenReaderOptimization('Enter your PIN')).toBe(true);
    });

    it('should return true for currency symbols', () => {
      expect(needsScreenReaderOptimization('Price: $100')).toBe(true);
    });

    it('should return true for special symbols', () => {
      expect(needsScreenReaderOptimization('Email: test@example.com')).toBe(true);
    });

    it('should return false for simple text', () => {
      expect(needsScreenReaderOptimization('Hello world')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(needsScreenReaderOptimization('')).toBe(false);
    });
  });

  describe('getTextStatistics', () => {
    it('should count words correctly', () => {
      const stats = getTextStatistics('Hello world test');
      expect(stats.wordCount).toBe(3);
    });

    it('should count sentences correctly', () => {
      const stats = getTextStatistics('Hello. World. Test.');
      expect(stats.sentenceCount).toBe(3);
    });

    it('should detect abbreviations', () => {
      const stats = getTextStatistics('Enter PIN or use ATM');
      expect(stats.hasAbbreviations).toBe(true);
    });

    it('should detect numbers', () => {
      const stats = getTextStatistics('Price is 100 dollars');
      expect(stats.hasNumbers).toBe(true);
    });

    it('should calculate reading time', () => {
      const stats = getTextStatistics('This is a test sentence with enough words to measure reading time');
      expect(stats.estimatedReadingTime).toBeGreaterThan(0);
    });

    it('should recommend optimizations for complex text', () => {
      const stats = getTextStatistics('The PIN is 1234 and costs $50 (USD) at ATM');
      expect(stats.recommendedOptimizations.length).toBeGreaterThan(0);
    });

    it('should return zero stats for empty text', () => {
      const stats = getTextStatistics('');
      expect(stats.wordCount).toBe(0);
      expect(stats.sentenceCount).toBe(0);
    });
  });

  describe('createLiveAnnouncement', () => {
    it('should create polite announcement', () => {
      const announcement = createLiveAnnouncement('Loading complete', 'polite', 'en');
      expect(announcement.priority).toBe('polite');
      expect(announcement.text).toContain('Loading');
    });

    it('should create assertive announcement', () => {
      const announcement = createLiveAnnouncement('Error occurred', 'assertive', 'en');
      expect(announcement.priority).toBe('assertive');
    });

    it('should optimize announcement text', () => {
      const announcement = createLiveAnnouncement('Loaded $100', 'polite', 'en');
      expect(announcement.text).toContain('dollars');
    });
  });

  describe('getSkipLinkText', () => {
    it('should return English skip link text', () => {
      expect(getSkipLinkText('main', 'en')).toBe('Skip to main content');
      expect(getSkipLinkText('navigation', 'en')).toBe('Skip to navigation');
    });

    it('should return Arabic skip link text', () => {
      expect(getSkipLinkText('main', 'ar')).toContain('المحتوى');
      expect(getSkipLinkText('cart', 'ar')).toContain('سلة');
    });

    it('should return Hebrew skip link text', () => {
      expect(getSkipLinkText('main', 'he')).toContain('תוכן');
      expect(getSkipLinkText('cart', 'he')).toContain('עגלה');
    });

    it('should fallback to English for unknown locale', () => {
      expect(getSkipLinkText('main', 'xx')).toBe('Skip to main content');
    });
  });

  describe('getLoadingAnnouncement', () => {
    it('should return English loading text', () => {
      expect(getLoadingAnnouncement('products', 'en')).toContain('Loading');
    });

    it('should return Arabic loading text', () => {
      const result = getLoadingAnnouncement('المنتجات', 'ar');
      expect(result).toContain('جاري');
    });

    it('should return Hebrew loading text', () => {
      const result = getLoadingAnnouncement('מוצרים', 'he');
      expect(result).toContain('בטעינה');
    });
  });

  describe('getErrorAnnouncement', () => {
    it('should return English error text', () => {
      expect(getErrorAnnouncement('Invalid input', 'en')).toBe('Error: Invalid input');
    });

    it('should return Arabic error text', () => {
      expect(getErrorAnnouncement('خطأ في الإدخال', 'ar')).toContain('خطأ');
    });

    it('should return Hebrew error text', () => {
      expect(getErrorAnnouncement('קלט לא תקין', 'he')).toContain('שגיאה');
    });
  });

  describe('getSuccessAnnouncement', () => {
    it('should return English success text', () => {
      expect(getSuccessAnnouncement('Order placed', 'en')).toBe('Success: Order placed');
    });

    it('should return Arabic success text', () => {
      expect(getSuccessAnnouncement('تم الطلب', 'ar')).toContain('نجاح');
    });

    it('should return Hebrew success text', () => {
      expect(getSuccessAnnouncement('ההזמנה בוצעה', 'he')).toContain('הצלחה');
    });
  });

  describe('NUMBER_READING_RULES', () => {
    it('should have Arabic numbers 0-10', () => {
      expect(NUMBER_READING_RULES['ar']['0']).toBe('صفر');
      expect(NUMBER_READING_RULES['ar']['5']).toBe('خمسة');
      expect(NUMBER_READING_RULES['ar']['10']).toBe('عشرة');
    });

    it('should have Hebrew numbers 0-10', () => {
      expect(NUMBER_READING_RULES['he']['0']).toBe('אפס');
      expect(NUMBER_READING_RULES['he']['5']).toBe('חמש');
      expect(NUMBER_READING_RULES['he']['10']).toBe('עשר');
    });

    it('should have English numbers 0-10', () => {
      expect(NUMBER_READING_RULES['en']['0']).toBe('zero');
      expect(NUMBER_READING_RULES['en']['5']).toBe('five');
      expect(NUMBER_READING_RULES['en']['10']).toBe('ten');
    });

    it('should have large number words', () => {
      expect(NUMBER_READING_RULES['ar']['1000']).toBe('ألف');
      expect(NUMBER_READING_RULES['he']['1000']).toBe('אלף');
      expect(NUMBER_READING_RULES['en']['1000']).toContain('thousand');
    });
  });

  describe('TEXT_SIMPLIFICATIONS', () => {
    it('should have Arabic currency symbol mappings', () => {
      expect(TEXT_SIMPLIFICATIONS['ar']['$']).toBe('دولار');
      expect(TEXT_SIMPLIFICATIONS['ar']['€']).toBe('يورو');
    });

    it('should have Hebrew currency symbol mappings', () => {
      expect(TEXT_SIMPLIFICATIONS['he']['$']).toBe('דולר');
      expect(TEXT_SIMPLIFICATIONS['he']['₪']).toBe('שקלים');
    });

    it('should have English currency symbol mappings', () => {
      expect(TEXT_SIMPLIFICATIONS['en']['$']).toBe('dollars');
      expect(TEXT_SIMPLIFICATIONS['en']['€']).toBe('euros');
    });
  });

  describe('SCREEN_READER_HINTS', () => {
    it('should have button hints for all locales', () => {
      expect(SCREEN_READER_HINTS['ar']['button']).toBeDefined();
      expect(SCREEN_READER_HINTS['he']['button']).toBeDefined();
      expect(SCREEN_READER_HINTS['en']['button']).toBeDefined();
    });

    it('should have commerce hints for all locales', () => {
      expect(SCREEN_READER_HINTS['ar']['commerce']).toBeDefined();
      expect(SCREEN_READER_HINTS['he']['commerce']).toBeDefined();
      expect(SCREEN_READER_HINTS['en']['commerce']).toBeDefined();
    });

    it('should have status hints for all locales', () => {
      expect(SCREEN_READER_HINTS['ar']['status']).toBeDefined();
      expect(SCREEN_READER_HINTS['he']['status']).toBeDefined();
      expect(SCREEN_READER_HINTS['en']['status']).toBeDefined();
    });
  });
});
