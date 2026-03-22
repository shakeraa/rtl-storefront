/**
 * Translation Utilities
 * Helper functions for managing translations
 */

export interface TranslationEntry {
  key: string;
  value: string;
  locale: string;
  translatableContent?: {
    digest: string;
    locale: string;
    value: string;
  };
}

export interface TranslationStats {
  total: number;
  translated: number;
  untranslated: number;
  coverage: number;
}

/**
 * Calculate translation coverage percentage
 * @param total - Total number of translatable items
 * @param translated - Number of translated items
 * @returns Coverage percentage (0-100)
 */
export function calculateCoverage(total: number, translated: number): number {
  if (total === 0) return 0;
  return Math.round((translated / total) * 100);
}

/**
 * Get translation statistics
 * @param entries - Array of translation entries
 * @returns TranslationStats object
 */
export function getTranslationStats(entries: TranslationEntry[]): TranslationStats {
  const total = entries.length;
  const translated = entries.filter(
    (entry) => entry.value && entry.value.trim() !== ''
  ).length;
  const untranslated = total - translated;
  const coverage = calculateCoverage(total, translated);

  return {
    total,
    translated,
    untranslated,
    coverage,
  };
}

/**
 * Check if a translation is complete
 * @param entry - Translation entry
 * @returns boolean
 */
export function isTranslationComplete(entry: TranslationEntry): boolean {
  return !!(entry.value && entry.value.trim() !== '');
}

/**
 * Get untranslated keys from a list
 * @param entries - Array of translation entries
 * @returns Array of untranslated keys
 */
export function getUntranslatedKeys(entries: TranslationEntry[]): string[] {
  return entries
    .filter((entry) => !isTranslationComplete(entry))
    .map((entry) => entry.key);
}

/**
 * Validate a translation entry
 * @param entry - Translation entry to validate
 * @returns Validation result
 */
export function validateTranslation(
  entry: TranslationEntry
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!entry.key || entry.key.trim() === '') {
    errors.push('Key is required');
  }

  if (!entry.locale || entry.locale.trim() === '') {
    errors.push('Locale is required');
  }

  if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(entry.locale)) {
    errors.push('Invalid locale format (expected: en or en-US)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Normalize locale code
 * @param locale - Locale code
 * @returns Normalized locale code
 */
export function normalizeLocale(locale: string): string {
  return locale.toLowerCase().replace('_', '-');
}

/**
 * Check if a locale needs translation
 * @param sourceLocale - Source language
 * @param targetLocale - Target language
 * @returns boolean
 */
export function needsTranslation(sourceLocale: string, targetLocale: string): boolean {
  return normalizeLocale(sourceLocale) !== normalizeLocale(targetLocale);
}

/**
 * Group translations by locale
 * @param entries - Array of translation entries
 * @returns Record<locale, entries[]>
 */
export function groupByLocale(
  entries: TranslationEntry[]
): Record<string, TranslationEntry[]> {
  return entries.reduce((acc, entry) => {
    const locale = normalizeLocale(entry.locale);
    if (!acc[locale]) {
      acc[locale] = [];
    }
    acc[locale].push(entry);
    return acc;
  }, {} as Record<string, TranslationEntry[]>);
}

/**
 * Create a translation key from components
 * @param resource - Resource type (e.g., 'product', 'collection')
 * @param id - Resource ID
 * @param field - Field name
 * @returns Formatted key
 */
export function createTranslationKey(
  resource: string,
  id: string,
  field: string
): string {
  return `${resource}:${id}:${field}`;
}

/**
 * Parse a translation key
 * @param key - Translation key
 * @returns Parsed components or null if invalid
 */
export function parseTranslationKey(
  key: string
): { resource: string; id: string; field: string } | null {
  const parts = key.split(':');
  if (parts.length < 3) {
    return null;
  }
  return {
    resource: parts[0],
    id: parts[1],
    field: parts.slice(2).join(':'),
  };
}

/**
 * Escape special characters for translation storage
 * @param text - Text to escape
 * @returns Escaped text
 */
export function escapeTranslation(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Unescape special characters from translation storage
 * @param text - Text to unescape
 * @returns Unescaped text
 */
export function unescapeTranslation(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\');
}

/**
 * Truncate text for preview display
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export function truncateForPreview(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Compare translations for changes
 * @param oldValue - Previous translation
 * @param newValue - New translation
 * @returns boolean indicating if changed
 */
export function hasTranslationChanged(
  oldValue: string | null | undefined,
  newValue: string | null | undefined
): boolean {
  const oldTrimmed = (oldValue || '').trim();
  const newTrimmed = (newValue || '').trim();
  return oldTrimmed !== newTrimmed;
}

/**
 * Get language name from locale code
 * @param locale - Locale code
 * @returns Language name
 */
export function getLanguageName(locale: string): string {
  const names: Record<string, string> = {
    en: 'English',
    ar: 'Arabic',
    he: 'Hebrew',
    fr: 'French',
    de: 'German',
    es: 'Spanish',
    it: 'Italian',
    pt: 'Portuguese',
    ru: 'Russian',
    zh: 'Chinese',
    ja: 'Japanese',
    ko: 'Korean',
    tr: 'Turkish',
    fa: 'Persian (Farsi)',
    ur: 'Urdu',
  };

  return names[normalizeLocale(locale).split('-')[0]] || locale;
}

/**
 * Get native language name from locale code
 * @param locale - Locale code
 * @returns Native language name
 */
export function getNativeLanguageName(locale: string): string {
  const names: Record<string, string> = {
    en: 'English',
    ar: 'العربية',
    he: 'עברית',
    fr: 'Français',
    de: 'Deutsch',
    es: 'Español',
    it: 'Italiano',
    pt: 'Português',
    ru: 'Русский',
    zh: '中文',
    ja: '日本語',
    ko: '한국어',
    tr: 'Türkçe',
    fa: 'فارسی',
    ur: 'اردو',
  };

  return names[normalizeLocale(locale).split('-')[0]] || locale;
}
