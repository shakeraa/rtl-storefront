import { describe, it, expect } from 'vitest';
import {
  SCREEN_READER_CONFIGS, PRONUNCIATION_GUIDES, TEXT_SIMPLIFICATIONS, SCREEN_READER_HINTS, NUMBER_READING_RULES,
  getScreenReaderConfig, isRTLLocale, optimizeForScreenReader, getPronunciationGuide, searchPronunciationGuides,
  getAllPronunciationGuides, simplifyForAudio, getScreenReaderHints, getPronunciationCategories, addPronunciationGuide,
  batchOptimizeForScreenReader, needsScreenReaderOptimization, getTextStatistics, createLiveAnnouncement,
  getSkipLinkText, getLoadingAnnouncement, getErrorAnnouncement, getSuccessAnnouncement,
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
    });
    it('should have correct voice preferences', () => {
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
    it('should return specific locale for extended locale', () => {
      const config = getScreenReaderConfig('ar-SA');
      // ar-sa has its own config, so it returns that
      expect(config.nativeName).toBe('العربية (السعودية)');
    });
    it('should return base locale for unknown extended locale', () => {
      // de-DE doesn't have a specific config, so should fallback to base (if exists) or English
      const config = getScreenReaderConfig('de-DE');
      expect(config.locale).toBe('en'); // Fallback to English since de is not defined
    });
    it('should be case insensitive', () => {
      const config = getScreenReaderConfig('AR');
      expect(config.locale).toBe('ar');
    });
    it('should fallback to English for unknown locale', () => {
      const config = getScreenReaderConfig('xx');
      expect(config.locale).toBe('en');
    });
  });

  describe('isRTLLocale', () => {
    it('should return true for Arabic', () => {
      expect(isRTLLocale('ar')).toBe(true);
      expect(isRTLLocale('ar-sa')).toBe(true);
    });
    it('should return true for Hebrew', () => {
      expect(isRTLLocale('he')).toBe(true);
    });
    it('should return false for English', () => {
      expect(isRTLLocale('en')).toBe(false);
    });
    it('should fallback to English for unknown locale', () => {
      expect(isRTLLocale('xx')).toBe(false);
    });
  });

  describe('optimizeForScreenReader', () => {
    it('should return empty string for empty input', () => {
      expect(optimizeForScreenReader('')).toBe('');
    });
    it('should expand abbreviations in English', () => {
      const result = optimizeForScreenReader('Price is $100', 'en');
      expect(result).toContain('dollars');
    });
    it('should convert numbers to words when enabled', () => {
      const result = optimizeForScreenReader('I have 5 items', 'en', { speakNumbersAsWords: true });
      expect(result.toLowerCase()).toContain('five');
    });
    it('should preserve original when options disabled', () => {
      const text = 'Price: $100';
      const result = optimizeForScreenReader(text, 'en', { expandAbbreviations: false });
      expect(result).toContain('$100');
    });
  });

  describe('getPronunciationGuide', () => {
    it('should return guide for English ecommerce term', () => {
      const guide = getPronunciationGuide('checkout', 'en');
      expect(guide).not.toBeNull();
      expect(guide?.phonetic).toBe('CHEK-out');
    });
    it('should return guide with syllables', () => {
      const guide = getPronunciationGuide('discount', 'en');
      expect(guide?.syllables).toBeDefined();
    });
    it('should return null for unknown term', () => {
      expect(getPronunciationGuide('xyz', 'en')).toBeNull();
    });
    it('should be case insensitive', () => {
      expect(getPronunciationGuide('CHECKOUT', 'en')).not.toBeNull();
    });
  });

  describe('searchPronunciationGuides', () => {
    it('should find guides by term partial match', () => {
      expect(searchPronunciationGuides('cart', 'en').length).toBeGreaterThan(0);
    });
    it('should return empty array for no matches', () => {
      expect(searchPronunciationGuides('xyz', 'en')).toEqual([]);
    });
  });

  describe('getAllPronunciationGuides', () => {
    it('should return all guides for a locale', () => {
      expect(Object.keys(getAllPronunciationGuides('en')).length).toBeGreaterThan(0);
    });
    it('should have ecommerce category', () => {
      expect(getAllPronunciationGuides('en')['ecommerce']).toBeDefined();
    });
  });

  describe('simplifyForAudio', () => {
    it('should remove punctuation', () => {
      expect(simplifyForAudio('Hello (world)', 'en')).not.toContain('(');
    });
    it('should expand symbols in basic mode', () => {
      expect(simplifyForAudio('Price: $100', 'en', 'basic')).toContain('dollars');
    });
    it('should return empty string for empty input', () => {
      expect(simplifyForAudio('')).toBe('');
    });
  });

  describe('getScreenReaderHints', () => {
    it('should return hint for button element', () => {
      const hint = getScreenReaderHints({ type: 'button', label: 'Submit' }, 'en');
      expect(hint.ariaLabel).toContain('button');
    });
    it('should return hint for input element', () => {
      const hint = getScreenReaderHints({ type: 'input', label: 'Email' }, 'en');
      expect(hint.ariaLabel).toContain('input field');
    });
    it('should return checked state for checkbox', () => {
      const hint = getScreenReaderHints({ type: 'checkbox', label: 'Agree', checked: true }, 'en');
      expect(hint.ariaLabel).toContain('checked');
    });
    it('should handle Arabic locale', () => {
      const hint = getScreenReaderHints({ type: 'button', label: 'إرسال' }, 'ar');
      expect(hint.ariaLabel).toContain('زر');
    });
    it('should include live region for alerts', () => {
      const hint = getScreenReaderHints({ type: 'alert', state: { message: 'Error' } }, 'en');
      expect(hint.liveRegion).toBe('assertive');
    });
  });

  describe('getPronunciationCategories', () => {
    it('should return categories for English', () => {
      expect(getPronunciationCategories('en')).toContain('ecommerce');
    });
    it('should return empty array for completely unknown locale', () => {
      expect(getPronunciationCategories('xyz-unknown')).toEqual([]);
    });
  });

  describe('addPronunciationGuide', () => {
    it('should add custom guide', () => {
      addPronunciationGuide({ term: 'custom', phonetic: 'CUS-tom', audioHint: 'custom' }, 'en', 'custom');
      expect(getPronunciationGuide('custom', 'en', 'custom')).not.toBeNull();
    });
  });

  describe('batchOptimizeForScreenReader', () => {
    it('should optimize multiple texts', () => {
      const results = batchOptimizeForScreenReader(['Hello $100', 'Price: 50%'], 'en');
      expect(results).toHaveLength(2);
      expect(results[0]).toContain('dollars');
    });
    it('should return empty array for empty input', () => {
      expect(batchOptimizeForScreenReader([], 'en')).toEqual([]);
    });
  });

  describe('needsScreenReaderOptimization', () => {
    it('should return true for long numbers', () => {
      expect(needsScreenReaderOptimization('Code: 12345678')).toBe(true);
    });
    it('should return true for currency symbols', () => {
      expect(needsScreenReaderOptimization('Price: $100')).toBe(true);
    });
    it('should return false for simple text', () => {
      expect(needsScreenReaderOptimization('Hello world')).toBe(false);
    });
  });

  describe('getTextStatistics', () => {
    it('should count words correctly', () => {
      expect(getTextStatistics('Hello world test').wordCount).toBe(3);
    });
    it('should detect abbreviations', () => {
      expect(getTextStatistics('Enter PIN').hasAbbreviations).toBe(true);
    });
    it('should return zero stats for empty text', () => {
      expect(getTextStatistics('').wordCount).toBe(0);
    });
  });

  describe('createLiveAnnouncement', () => {
    it('should create polite announcement', () => {
      const ann = createLiveAnnouncement('Loading', 'polite', 'en');
      expect(ann.priority).toBe('polite');
    });
  });

  describe('getSkipLinkText', () => {
    it('should return English text', () => {
      expect(getSkipLinkText('main', 'en')).toBe('Skip to main content');
    });
    it('should return Arabic text', () => {
      expect(getSkipLinkText('main', 'ar')).toContain('المحتوى');
    });
  });

  describe('getLoadingAnnouncement', () => {
    it('should return English text', () => {
      expect(getLoadingAnnouncement('products', 'en')).toContain('Loading');
    });
  });

  describe('getErrorAnnouncement', () => {
    it('should return English error', () => {
      expect(getErrorAnnouncement('Error', 'en')).toBe('Error: Error');
    });
  });

  describe('getSuccessAnnouncement', () => {
    it('should return English success', () => {
      expect(getSuccessAnnouncement('Done', 'en')).toBe('Success: Done');
    });
  });

  describe('NUMBER_READING_RULES', () => {
    it('should have Arabic numbers', () => {
      expect(NUMBER_READING_RULES['ar']['5']).toBe('خمسة');
    });
    it('should have English numbers', () => {
      expect(NUMBER_READING_RULES['en']['5']).toBe('five');
    });
  });

  describe('TEXT_SIMPLIFICATIONS', () => {
    it('should have currency symbols', () => {
      expect(TEXT_SIMPLIFICATIONS['en']['$']).toBe('dollars');
      expect(TEXT_SIMPLIFICATIONS['ar']['$']).toBe('دولار');
    });
  });

  describe('SCREEN_READER_HINTS', () => {
    it('should have button hints', () => {
      expect(SCREEN_READER_HINTS['en']['button']).toBeDefined();
      expect(SCREEN_READER_HINTS['ar']['button']).toBeDefined();
    });
  });
});
