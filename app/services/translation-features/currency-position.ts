/**
 * Currency Symbol Position Service
 * Handles currency symbol positioning based on locale and currency
 * - Arabic (ar): Symbol typically after amount
 * - Hebrew (he): Symbol typically before amount
 * - English (en): Symbol typically before amount
 */

import { getCurrency } from '../currency/constants';

/**
 * Position of currency symbol relative to amount
 */
export type CurrencyPosition = 'before' | 'after';

/**
 * Spacing between symbol and amount
 */
export type CurrencySpacing = 'none' | 'narrow' | 'wide';

/**
 * Supported locales
 */
export type SupportedLocale = 'ar' | 'he' | 'en' | string;

/**
 * Major currencies supported
 */
export const MAJOR_CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'ILS'] as const;

/**
 * RTL locales (Arabic and Hebrew)
 */
export const RTL_LOCALES = ['ar', 'he', 'ar-SA', 'ar-AE', 'ar-EG', 'he-IL'];

/**
 * Currency position rules by currency and locale
 * These override default currency behavior when specific locale is present
 */
export const CURRENCY_POSITION_RULES: Record<string, Record<string, CurrencyPosition>> = {
  // Arabic (ar) - Symbol typically after amount for most currencies
  ar: {
    USD: 'after',
    EUR: 'after',
    GBP: 'after',
    AED: 'after',
    SAR: 'after',
    ILS: 'after',
  },
  // Hebrew (he) - Symbol typically before amount for most currencies
  he: {
    USD: 'before',
    EUR: 'after', // EUR is typically after in Hebrew too
    GBP: 'before',
    AED: 'after', // Arabic currencies stay after
    SAR: 'after',
    ILS: 'before',
  },
  // English (en) - Symbol typically before amount for most currencies
  en: {
    USD: 'before',
    EUR: 'before',
    GBP: 'before',
    AED: 'before',
    SAR: 'before',
    ILS: 'before',
  },
};

/**
 * Default spacing rules by currency
 */
export const CURRENCY_SPACING_RULES: Record<string, CurrencySpacing> = {
  USD: 'none',
  EUR: 'narrow',
  GBP: 'none',
  AED: 'narrow',
  SAR: 'narrow',
  ILS: 'none',
};

/**
 * Spacing overrides by locale
 */
export const LOCALE_SPACING_OVERRIDES: Record<string, Record<string, CurrencySpacing>> = {
  ar: {
    USD: 'narrow',
    EUR: 'narrow',
    GBP: 'narrow',
    AED: 'narrow',
    SAR: 'narrow',
    ILS: 'narrow',
  },
  he: {
    USD: 'none',
    EUR: 'narrow',
    GBP: 'none',
    AED: 'narrow',
    SAR: 'narrow',
    ILS: 'none',
  },
};

/**
 * Get the currency symbol position for a given currency and locale
 * @param currency - Currency code (e.g., 'USD', 'EUR', 'SAR')
 * @param locale - Locale code (e.g., 'ar', 'he', 'en')
 * @returns The position ('before' or 'after')
 */
export function getCurrencyPosition(currency: string, locale: string): CurrencyPosition {
  const normalizedCurrency = currency.toUpperCase();
  const normalizedLocale = locale.toLowerCase().split('-')[0]; // Get base locale (e.g., 'ar' from 'ar-SA')

  // Check for locale-specific override
  const localeRules = CURRENCY_POSITION_RULES[normalizedLocale];
  if (localeRules && normalizedCurrency in localeRules) {
    return localeRules[normalizedCurrency];
  }

  // Fall back to currency's default position from constants
  const currencyInfo = getCurrency(normalizedCurrency);
  if (currencyInfo) {
    return currencyInfo.symbolPosition;
  }

  // Default fallback based on RTL status
  return isRTLLocale(locale) ? 'after' : 'before';
}

/**
 * Get the spacing between currency symbol and amount
 * @param currency - Currency code
 * @param locale - Locale code
 * @returns The spacing type ('none', 'narrow', or 'wide')
 */
export function getCurrencySpacing(currency: string, locale: string): CurrencySpacing {
  const normalizedCurrency = currency.toUpperCase();
  const normalizedLocale = locale.toLowerCase().split('-')[0];

  // Check for locale-specific spacing override
  const localeOverrides = LOCALE_SPACING_OVERRIDES[normalizedLocale];
  if (localeOverrides && normalizedCurrency in localeOverrides) {
    return localeOverrides[normalizedCurrency];
  }

  // Fall back to currency's default spacing
  if (normalizedCurrency in CURRENCY_SPACING_RULES) {
    return CURRENCY_SPACING_RULES[normalizedCurrency];
  }

  // Get from currency info if available
  const currencyInfo = getCurrency(normalizedCurrency);
  if (currencyInfo) {
    return currencyInfo.spaceBetween ? 'narrow' : 'none';
  }

  // Default spacing
  return isRTLLocale(locale) ? 'narrow' : 'none';
}

/**
 * Format currency with proper symbol position based on locale
 * @param amount - The amount to format
 * @param currency - Currency code
 * @param locale - Locale code
 * @param options - Additional formatting options
 * @returns Formatted currency string
 */
export function formatCurrencyWithPosition(
  amount: number,
  currency: string,
  locale: string,
  options: {
    decimals?: number;
    useLocaleFormat?: boolean;
    symbol?: string;
  } = {}
): string {
  const normalizedCurrency = currency.toUpperCase();
  const position = getCurrencyPosition(normalizedCurrency, locale);
  const spacing = getCurrencySpacing(normalizedCurrency, locale);

  // Get currency info for defaults
  const currencyInfo = getCurrency(normalizedCurrency);
  const symbol = options.symbol || currencyInfo?.symbol || normalizedCurrency;
  const decimals = options.decimals ?? currencyInfo?.decimals ?? 2;

  // Format the number
  let formattedNumber: string;
  if (options.useLocaleFormat && typeof Intl !== 'undefined') {
    formattedNumber = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  } else {
    formattedNumber = formatNumberWithSeparators(
      amount,
      decimals,
      currencyInfo?.thousandsSeparator || ',',
      currencyInfo?.decimalSeparator || '.'
    );
  }

  // Apply spacing
  const spaceChar = spacing === 'wide' ? '\u00A0\u00A0' : spacing === 'narrow' ? '\u00A0' : '';

  // Apply position
  if (position === 'before') {
    return `${symbol}${spaceChar}${formattedNumber}`;
  } else {
    return `${formattedNumber}${spaceChar}${symbol}`;
  }
}

/**
 * Format number with thousands and decimal separators
 */
function formatNumberWithSeparators(
  amount: number,
  decimals: number,
  thousandsSeparator: string,
  decimalSeparator: string
): string {
  const factor = Math.pow(10, decimals);
  const rounded = Math.round(amount * factor) / factor;

  const [integerPart, decimalPart] = rounded.toFixed(decimals).split('.');
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

  if (decimals === 0 || !decimalPart) {
    return formattedInteger;
  }

  return `${formattedInteger}${decimalSeparator}${decimalPart}`;
}

/**
 * Check if a locale is RTL (Right-to-Left)
 * @param locale - Locale code
 * @returns true if RTL locale
 */
export function isRTLLocale(locale: string): boolean {
  const rtlLocales = ['ar', 'he', 'fa', 'ur', 'yi', 'ji'];
  const baseLocale = locale.toLowerCase().split('-')[0];
  return rtlLocales.includes(baseLocale);
}

/**
 * Check if a currency has an RTL script symbol
 * @param currency - Currency code
 * @returns true if currency uses RTL script symbol
 */
export function hasRTLCurrencySymbol(currency: string): boolean {
  const rtlCurrencies = ['SAR', 'AED', 'QAR', 'KWD', 'BHD', 'OMR', 'EGP', 'JOD', 'LBP', 'MAD', 'TND', 'DZD'];
  return rtlCurrencies.includes(currency.toUpperCase());
}

/**
 * Get symbol display preference for locale
 * Some locales prefer native symbols over international ones
 * @param currency - Currency code
 * @param locale - Locale code
 * @returns Preferred symbol type
 */
export function getSymbolPreference(
  currency: string,
  locale: string
): 'native' | 'international' | 'code' {
  const normalizedLocale = locale.toLowerCase();
  const normalizedCurrency = currency.toUpperCase();

  // Arabic locales prefer native Arabic symbols for MENA currencies
  if (normalizedLocale.startsWith('ar')) {
    if (['SAR', 'AED', 'QAR', 'KWD', 'BHD', 'OMR', 'EGP', 'JOD'].includes(normalizedCurrency)) {
      return 'native';
    }
  }

  // Hebrew locales prefer international symbols for most currencies
  if (normalizedLocale.startsWith('he')) {
    return 'international';
  }

  return 'international';
}

/**
 * Get all supported position configurations for a currency
 * Useful for displaying currency format options
 * @param currency - Currency code
 * @returns Array of locale-position configurations
 */
export function getSupportedPositionsForCurrency(currency: string): Array<{
  locale: string;
  position: CurrencyPosition;
  spacing: CurrencySpacing;
}> {
  const normalizedCurrency = currency.toUpperCase();
  const supportedLocales: SupportedLocale[] = ['ar', 'he', 'en'];

  return supportedLocales.map((locale) => ({
    locale,
    position: getCurrencyPosition(normalizedCurrency, locale),
    spacing: getCurrencySpacing(normalizedCurrency, locale),
  }));
}

/**
 * Detect if currency formatting needs special handling for RTL
 * @param currency - Currency code
 * @param locale - Locale code
 * @returns Object with RTL-specific formatting guidance
 */
export function getRTLFormattingGuidance(
  currency: string,
  locale: string
): {
  needsBiDiIsolation: boolean;
  recommendedDirection: 'ltr' | 'rtl';
  shouldMirror: boolean;
} {
  const normalizedLocale = locale.toLowerCase();
  const normalizedCurrency = currency.toUpperCase();

  const isRTL = isRTLLocale(normalizedLocale);
  const isRTLCurrency = hasRTLCurrencySymbol(normalizedCurrency);

  return {
    needsBiDiIsolation: isRTL && !isRTLCurrency,
    recommendedDirection: isRTL ? 'rtl' : 'ltr',
    shouldMirror: isRTL && getCurrencyPosition(normalizedCurrency, normalizedLocale) === 'after',
  };
}

/**
 * Compare two currency formats
 * @param format1 - First format string
 * @param format2 - Second format string
 * @returns true if formats are equivalent
 */
export function areFormatsEquivalent(format1: string, format2: string): boolean {
  // Normalize whitespace for comparison
  const normalized1 = format1.replace(/\s+/g, ' ').trim();
  const normalized2 = format2.replace(/\s+/g, ' ').trim();
  return normalized1 === normalized2;
}

/**
 * Get default format pattern for currency and locale
 * @param currency - Currency code
 * @param locale - Locale code
 * @returns Pattern string showing symbol placement
 */
export function getFormatPattern(currency: string, locale: string): string {
  const position = getCurrencyPosition(currency, locale);
  const spacing = getCurrencySpacing(currency, locale);
  const spaceChar = spacing === 'none' ? '' : spacing === 'narrow' ? ' ' : '  ';

  if (position === 'before') {
    return `{symbol}${spaceChar}{amount}`;
  } else {
    return `{amount}${spaceChar}{symbol}`;
  }
}
