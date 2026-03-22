/**
 * Language Service Constants
 */

export const RTL_LOCALES = ['ar', 'he', 'fa', 'ur', 'yi'];

export const DEFAULT_LOCALE = 'en';

export const LOCALE_NAMES: Record<string, { name: string; native: string }> = {
  en: { name: 'English', native: 'English' },
  ar: { name: 'Arabic', native: 'العربية' },
  he: { name: 'Hebrew', native: 'עברית' },
  fa: { name: 'Persian', native: 'فارسی' },
  ur: { name: 'Urdu', native: 'اردو' },
};
