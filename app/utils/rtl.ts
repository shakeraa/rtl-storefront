/**
 * RTL (Right-to-Left) Utilities
 * Helper functions for handling RTL languages
 */

// List of RTL language codes
export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur', 'yi', 'ji'];

/**
 * Check if a language is RTL
 * @param locale - Language code (e.g., 'ar', 'he')
 * @returns boolean indicating if the language is RTL
 */
export function isRTLLanguage(locale: string): boolean {
  const normalizedLocale = locale.split('-')[0].toLowerCase();
  return RTL_LANGUAGES.includes(normalizedLocale);
}

/**
 * Get the text direction for a locale
 * @param locale - Language code
 * @returns 'rtl' | 'ltr'
 */
export function getTextDirection(locale: string): 'rtl' | 'ltr' {
  return isRTLLanguage(locale) ? 'rtl' : 'ltr';
}

/**
 * Get the HTML dir attribute value for a locale
 * @param locale - Language code
 * @returns 'rtl' | 'ltr'
 */
export function getDirAttribute(locale: string): 'rtl' | 'ltr' {
  return getTextDirection(locale);
}

/**
 * Flip CSS logical properties for RTL
 * @param property - CSS property name
 * @param value - CSS property value
 * @param locale - Language code
 * @returns Adjusted CSS property value
 */
export function flipCSSProperty(
  property: string,
  value: string,
  locale: string
): { property: string; value: string } {
  if (!isRTLLanguage(locale)) {
    return { property, value };
  }

  // Handle specific properties that need flipping
  const flippableProperties: Record<string, string> = {
    'margin-left': 'margin-right',
    'margin-right': 'margin-left',
    'padding-left': 'padding-right',
    'padding-right': 'padding-left',
    'border-left': 'border-right',
    'border-right': 'border-left',
    'border-left-width': 'border-right-width',
    'border-right-width': 'border-left-width',
    'border-left-color': 'border-right-color',
    'border-right-color': 'border-left-color',
    'left': 'right',
    'right': 'left',
    'text-align': value === 'left' ? 'right' : value === 'right' ? 'left' : value,
  };

  if (property in flippableProperties) {
    const newProperty = flippableProperties[property];
    // For text-align, value is also transformed
    if (property === 'text-align') {
      return { property, value: newProperty };
    }
    return { property: newProperty, value };
  }

  return { property, value };
}

/**
 * Wrap text with proper BiDi marks for mixed content
 * @param text - Text content
 * @param locale - Language code
 * @returns Text with BiDi marks if needed
 */
export function wrapBiDi(text: string, locale: string): string {
  if (!isRTLLanguage(locale)) {
    return text;
  }

  // Add RLM (Right-to-Left Mark) for proper BiDi handling
  const RLM = '\u200F';
  const LRM = '\u200E';
  
  // Detect if text contains mixed scripts
  const hasLatin = /[a-zA-Z]/.test(text);
  const hasArabic = /[\u0600-\u06FF]/.test(text);
  
  if (hasLatin && hasArabic) {
    // Wrap with RLM for proper display
    return `${RLM}${text}${RLM}`;
  }
  
  return text;
}

/**
 * Get the opposite direction
 * @param dir - Current direction
 * @returns Opposite direction
 */
export function getOppositeDirection(dir: 'rtl' | 'ltr'): 'rtl' | 'ltr' {
  return dir === 'rtl' ? 'ltr' : 'rtl';
}

/**
 * Format number for RTL display
 * @param num - Number to format
 * @param locale - Language code
 * @returns Formatted number string
 */
export function formatNumberForRTL(num: number, locale: string): string {
  const formatted = num.toLocaleString(locale);
  
  if (isRTLLanguage(locale)) {
    // For Arabic locales, optionally use Arabic numerals
    const arabicNumerals = formatted.replace(/[0-9]/g, (w) => {
      return String.fromCharCode(w.charCodeAt(0) + 1584);
    });
    return arabicNumerals;
  }
  
  return formatted;
}
