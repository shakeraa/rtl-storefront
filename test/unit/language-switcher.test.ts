import { describe, it, expect } from 'vitest';
import {
  SUPPORTED_LANGUAGES,
  buildLanguageOptions,
  getDefaultSwitcherConfig,
} from '../../app/services/language-switcher';

describe('SUPPORTED_LANGUAGES', () => {
  it('contains entries for ar, he, en, fa, fr', () => {
    expect(SUPPORTED_LANGUAGES).toHaveProperty('ar');
    expect(SUPPORTED_LANGUAGES).toHaveProperty('he');
    expect(SUPPORTED_LANGUAGES).toHaveProperty('en');
    expect(SUPPORTED_LANGUAGES).toHaveProperty('fa');
    expect(SUPPORTED_LANGUAGES).toHaveProperty('fr');
  });

  it('ar has nativeName "العربية" and direction "rtl"', () => {
    expect(SUPPORTED_LANGUAGES['ar'].nativeName).toBe('العربية');
    expect(SUPPORTED_LANGUAGES['ar'].direction).toBe('rtl');
  });

  it('en has direction "ltr"', () => {
    expect(SUPPORTED_LANGUAGES['en'].direction).toBe('ltr');
  });

  it('he has direction "rtl"', () => {
    expect(SUPPORTED_LANGUAGES['he'].direction).toBe('rtl');
  });

  it('fa has direction "rtl"', () => {
    expect(SUPPORTED_LANGUAGES['fa'].direction).toBe('rtl');
  });

  it('fr has direction "ltr"', () => {
    expect(SUPPORTED_LANGUAGES['fr'].direction).toBe('ltr');
  });
});

describe('buildLanguageOptions', () => {
  it('returns correct number of options for ["en", "ar"]', () => {
    const options = buildLanguageOptions(['en', 'ar'], 'ar');
    expect(options).toHaveLength(2);
  });

  it('marks ar as active when currentLocale is ar', () => {
    const options = buildLanguageOptions(['en', 'ar'], 'ar');
    const arOption = options.find((o) => o.locale === 'ar');
    const enOption = options.find((o) => o.locale === 'en');
    expect(arOption?.isActive).toBe(true);
    expect(enOption?.isActive).toBe(false);
  });

  it('marks en as active when currentLocale is en', () => {
    const options = buildLanguageOptions(['en', 'ar', 'he'], 'en');
    const enOption = options.find((o) => o.locale === 'en');
    expect(enOption?.isActive).toBe(true);
    expect(options).toHaveLength(3);
  });

  it('filters out unknown locales gracefully', () => {
    const options = buildLanguageOptions(['en', 'xx', 'ar'], 'en');
    expect(options).toHaveLength(2);
    expect(options.map((o) => o.locale)).toEqual(['en', 'ar']);
  });

  it('returns options with correct properties', () => {
    const options = buildLanguageOptions(['ar'], 'ar');
    expect(options[0]).toMatchObject({
      locale: 'ar',
      name: 'Arabic',
      nativeName: 'العربية',
      direction: 'rtl',
      isActive: true,
    });
  });

  it('returns empty array when all locales are unknown', () => {
    const options = buildLanguageOptions(['xx', 'yy'], 'xx');
    expect(options).toHaveLength(0);
  });
});

describe('getDefaultSwitcherConfig', () => {
  it('returns config with expected defaults', () => {
    const config = getDefaultSwitcherConfig();
    expect(config.placement).toBe('header');
    expect(config.style).toBe('dropdown');
    expect(config.showNativeNames).toBe(true);
    expect(config.showFlags).toBe(true);
    expect(config.compact).toBe(false);
  });
});
