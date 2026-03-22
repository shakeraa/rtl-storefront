/**
 * T0156 — Font Subsetting Service
 *
 * Provides font subsetting capabilities to optimize font loading performance
 * by only loading character subsets that are actually needed for the content.
 */

import { getFontById } from '../fonts/arabic';
import { getHebrewFontById } from '../fonts/hebrew';

/**
 * Unicode range definitions for different scripts
 * These ranges define which Unicode code points belong to each script
 */
export const UNICODE_RANGES = {
  /** Arabic script: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF */
  arabic: {
    name: 'Arabic',
    ranges: [
      'U+0600-06FF',   // Arabic
      'U+0750-077F',   // Arabic Supplement
      'U+08A0-08FF',   // Arabic Extended-A
      'U+FB50-FDFF',   // Arabic Presentation Forms-A
      'U+FE70-FEFF',   // Arabic Presentation Forms-B
    ],
    codePoints: [0x0600, 0x06FF],
    locales: ['ar', 'ar-SA', 'ar-AE', 'ar-EG', 'ar-IQ', 'ar-JO', 'ar-KW', 'ar-LB', 'ar-LY', 'ar-MA', 'ar-OM', 'ar-QA', 'ar-SD', 'ar-SY', 'ar-TN', 'ar-YE', 'fa', 'ur', 'ps', 'ku', 'sd', 'ug'],
  },
  /** Hebrew script: U+0590-05FF, U+FB1D-FB4F */
  hebrew: {
    name: 'Hebrew',
    ranges: [
      'U+0590-05FF',   // Hebrew
      'U+FB1D-FB4F',   // Hebrew Presentation Forms
    ],
    codePoints: [0x0590, 0x05FF],
    locales: ['he', 'he-IL', 'iw', 'iw-IL', 'yi', 'lad'],
  },
  /** Latin script: U+0000-007F, U+0080-00FF, U+0100-017F, U+0180-024F */
  latin: {
    name: 'Latin',
    ranges: [
      'U+0000-007F',   // Basic Latin
      'U+0080-00FF',   // Latin-1 Supplement
      'U+0100-017F',   // Latin Extended-A
      'U+0180-024F',   // Latin Extended-B
    ],
    codePoints: [0x0000, 0x024F],
    locales: ['en', 'en-US', 'en-GB', 'en-CA', 'en-AU', 'de', 'de-DE', 'fr', 'fr-FR', 'es', 'es-ES', 'it', 'it-IT', 'pt', 'pt-BR', 'nl', 'nl-NL'],
  },
  /** Latin Extended: U+1E00-1EFF, U+2C60-2C7F */
  latinExtended: {
    name: 'Latin Extended',
    ranges: [
      'U+1E00-1EFF',   // Latin Extended Additional
      'U+2C60-2C7F',   // Latin Extended-C
    ],
    codePoints: [0x1E00, 0x1EFF],
    locales: ['vi', 'pl', 'cs', 'sk', 'hu', 'ro'],
  },
  /** Common punctuation and symbols */
  common: {
    name: 'Common',
    ranges: [
      'U+2000-206F',   // General Punctuation
      'U+2070-209F',   // Superscripts and Subscripts
      'U+20A0-20CF',   // Currency Symbols
      'U+2100-214F',   // Letterlike Symbols
      'U+2200-22FF',   // Mathematical Operators
    ],
    codePoints: [0x2000, 0x22FF],
    locales: [],
  },
} as const;

export type ScriptType = keyof typeof UNICODE_RANGES;

/**
 * Font subset configuration
 */
export interface FontSubsetConfig {
  /** Font family name */
  family: string;
  /** Script types to include */
  scripts: ScriptType[];
  /** Font weights to include */
  weights: number[];
  /** Font style */
  style?: 'normal' | 'italic';
  /** Display strategy */
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
}

/**
 * Subset file naming convention options
 */
export interface SubsetNamingOptions {
  /** Font family name (kebab-case) */
  family: string;
  /** Font weight */
  weight: number;
  /** Font style */
  style?: 'normal' | 'italic';
  /** Script subset */
  script?: ScriptType;
  /** Version for cache busting */
  version?: string;
  /** File format */
  format?: 'woff2' | 'woff' | 'ttf' | 'otf';
}

/**
 * Font loading strategy
 */
export type FontLoadingStrategy = 'preload' | 'prefetch' | 'lazy' | 'auto';

/**
 * Get the Unicode range string for a specific script
 * @param script - The script type (arabic, hebrew, latin, etc.)
 * @returns Unicode range string for CSS @font-face
 */
export function getUnicodeRange(script: ScriptType): string {
  const range = UNICODE_RANGES[script];
  if (!range) {
    return '';
  }
  return range.ranges.join(', ');
}

/**
 * Get multiple Unicode ranges for a set of scripts
 * @param scripts - Array of script types
 * @returns Combined Unicode range string
 */
export function getUnicodeRanges(scripts: ScriptType[]): string {
  const allRanges = scripts
    .map((script) => UNICODE_RANGES[script]?.ranges || [])
    .flat();
  return [...new Set(allRanges)].join(', ');
}

/**
 * Get the primary script for a given locale
 * @param locale - Locale code (e.g., 'ar', 'he', 'en')
 * @returns The primary script type for the locale
 */
export function getScriptForLocale(locale: string): ScriptType {
  const normalizedLocale = locale.toLowerCase().split('-')[0];
  
  for (const [script, data] of Object.entries(UNICODE_RANGES)) {
    if (data.locales.some((l) => l.toLowerCase().startsWith(normalizedLocale))) {
      return script as ScriptType;
    }
  }
  
  return 'latin';
}

/**
 * Get all scripts needed for a locale (primary + common)
 * @param locale - Locale code
 * @returns Array of required script types
 */
export function getScriptsForLocale(locale: string): ScriptType[] {
  const primaryScript = getScriptForLocale(locale);
  const scripts: ScriptType[] = [primaryScript];
  
  // Always include common symbols for all locales
  if (!scripts.includes('common')) {
    scripts.push('common');
  }
  
  // For mixed content, include latin with RTL scripts
  if (primaryScript === 'arabic' || primaryScript === 'hebrew') {
    if (!scripts.includes('latin')) {
      scripts.push('latin');
    }
  }
  
  return scripts;
}

/**
 * Detect scripts present in content
 * @param content - Text content to analyze
 * @returns Array of script types found in content
 */
export function detectScriptsInContent(content: string): ScriptType[] {
  const scripts: Set<ScriptType> = new Set();
  
  for (const char of content) {
    const codePoint = char.codePointAt(0);
    if (!codePoint) continue;
    
    // Check Arabic range
    if ((codePoint >= 0x0600 && codePoint <= 0x06FF) ||
        (codePoint >= 0x0750 && codePoint <= 0x077F) ||
        (codePoint >= 0x08A0 && codePoint <= 0x08FF) ||
        (codePoint >= 0xFB50 && codePoint <= 0xFDFF) ||
        (codePoint >= 0xFE70 && codePoint <= 0xFEFF)) {
      scripts.add('arabic');
    }
    
    // Check Hebrew range
    if ((codePoint >= 0x0590 && codePoint <= 0x05FF) ||
        (codePoint >= 0xFB1D && codePoint <= 0xFB4F)) {
      scripts.add('hebrew');
    }
    
    // Check Latin ranges
    if ((codePoint >= 0x0000 && codePoint <= 0x024F) ||
        (codePoint >= 0x1E00 && codePoint <= 0x1EFF)) {
      scripts.add('latin');
    }
    
    // Check common symbols
    if ((codePoint >= 0x2000 && codePoint <= 0x22FF)) {
      scripts.add('common');
    }
  }
  
  return Array.from(scripts);
}

/**
 * Get required font subsets based on content
 * @param content - Text content to analyze
 * @returns Array of script types required for the content
 */
export function getRequiredSubsets(content: string): ScriptType[] {
  const detected = detectScriptsInContent(content);
  
  // Always include common if we have any content
  if (content.trim().length > 0 && !detected.includes('common')) {
    detected.push('common');
  }
  
  return detected.length > 0 ? detected : ['latin'];
}

/**
 * Get font subset URL for a specific font family and locale
 * Uses Google Fonts API with subset parameters
 * @param fontFamily - Font family name or ID
 * @param locale - Locale code
 * @returns URL for the font subset
 */
export function getFontSubsetUrl(fontFamily: string, locale: string): string {
  const scripts = getScriptsForLocale(locale);
  const scriptNames = scripts
    .filter((s) => s !== 'common')
    .map((s) => UNICODE_RANGES[s]?.name.toLowerCase() || s)
    .join(',');
  
  // Try to get font from Arabic or Hebrew fonts
  const arabicFont = getFontById(fontFamily);
  const hebrewFont = getHebrewFontById(fontFamily);
  const font = arabicFont || hebrewFont;
  
  if (!font) {
    // Generate URL for custom font family
    const familyName = fontFamily.replace(/\s+/g, '+');
    return `https://fonts.googleapis.com/css2?family=${familyName}&subset=${scriptNames}&display=swap`;
  }
  
  const familyName = font.name.replace(/\s+/g, '+');
  const weights = font.weights.join(',');
  
  return `https://fonts.googleapis.com/css2?family=${familyName}:wght@${weights}&subset=${scriptNames}&display=swap`;
}

/**
 * Generate a subset file name following naming conventions
 * @param options - Subset naming options
 * @returns Formatted file name
 */
export function generateSubsetFileName(options: SubsetNamingOptions): string {
  const { family, weight, style = 'normal', script = 'latin', version, format = 'woff2' } = options;
  
  const parts = [family.toLowerCase().replace(/\s+/g, '-')];
  
  if (version) {
    parts.push(`v${version}`);
  }
  
  parts.push(script);
  
  if (weight !== 400) {
    parts.push(String(weight));
  }
  
  if (style === 'italic') {
    parts.push('italic');
  }
  
  return `${parts.join('-')}.${format}`;
}

/**
 * Generate @font-face CSS for font subsets
 * @param fontFamily - Font family name
 * @param subsets - Array of subset configurations
 * @returns CSS string with @font-face declarations
 */
export function generateFontFaceCSS(
  fontFamily: string,
  subsets: FontSubsetConfig[],
): string {
  const declarations: string[] = [];
  
  for (const subset of subsets) {
    const unicodeRange = getUnicodeRanges(subset.scripts);
    const display = subset.display || 'swap';
    const style = subset.style || 'normal';
    
    for (const weight of subset.weights) {
      const fileName = generateSubsetFileName({
        family: fontFamily,
        weight,
        style,
        script: subset.scripts[0],
      });
      
      const declaration = `@font-face {
  font-family: '${fontFamily}';
  font-style: ${style};
  font-weight: ${weight};
  font-display: ${display};
  src: url('/fonts/${fileName}') format('woff2');
  unicode-range: ${unicodeRange};
}`;
      
      declarations.push(declaration);
    }
  }
  
  return declarations.join('\n\n');
}

/**
 * Generate optimized font loading CSS with subsetting
 * @param fontConfigs - Array of font subset configurations
 * @returns Complete CSS string for font loading
 */
export function generateOptimizedFontCSS(fontConfigs: FontSubsetConfig[]): string {
  const cssParts: string[] = [];
  
  // Add @font-face declarations
  for (const config of fontConfigs) {
    cssParts.push(generateFontFaceCSS(config.family, [config]));
  }
  
  // Add font-family CSS variables
  cssParts.push(':root {');
  for (const config of fontConfigs) {
    const varName = config.family.toLowerCase().replace(/\s+/g, '-');
    cssParts.push(`  --font-${varName}: '${config.family}', sans-serif;`);
  }
  cssParts.push('}');
  
  return cssParts.join('\n');
}

/**
 * Determine the optimal font loading strategy based on content priority
 * @param isCritical - Whether the font is for critical above-fold content
 * @param isRTL - Whether the locale is RTL
 * @returns Font loading strategy
 */
export function getFontLoadingStrategy(isCritical: boolean, isRTL: boolean): FontLoadingStrategy {
  if (isCritical) {
    return 'preload';
  }
  if (isRTL) {
    return 'prefetch';
  }
  return 'lazy';
}

/**
 * Generate preload link tags for critical font subsets
 * @param fontFamily - Font family name
 * @param subsets - Subset configurations to preload
 * @returns Array of preload link tag strings
 */
export function generatePreloadLinks(
  fontFamily: string,
  subsets: FontSubsetConfig[],
): string[] {
  const links: string[] = [];
  
  for (const subset of subsets) {
    for (const weight of subset.weights.slice(0, 2)) { // Limit to first 2 weights
      const fileName = generateSubsetFileName({
        family: fontFamily,
        weight,
        style: subset.style,
        script: subset.scripts[0],
      });
      
      links.push(
        `<link rel="preload" href="/fonts/${fileName}" as="font" type="font/woff2" crossorigin="anonymous">`,
      );
    }
  }
  
  return links;
}

/**
 * Calculate estimated font file size savings from subsetting
 * @param originalSize - Original font file size in bytes
 * @param scripts - Scripts being used
 * @returns Estimated savings percentage
 */
export function calculateSubsetSavings(
  originalSize: number,
  scripts: ScriptType[],
): { savingsPercent: number; estimatedSize: number } {
  // Approximate character coverage percentages
  const coverageFactors: Record<ScriptType, number> = {
    arabic: 0.15,      // ~15% of typical font
    hebrew: 0.08,      // ~8% of typical font
    latin: 0.25,       // ~25% of typical font
    latinExtended: 0.10, // ~10% of typical font
    common: 0.05,      // ~5% of typical font
  };
  
  let totalCoverage = 0;
  for (const script of scripts) {
    totalCoverage += coverageFactors[script] || 0.1;
  }
  
  // Cap at reasonable maximum and add overhead
  totalCoverage = Math.min(totalCoverage * 1.2, 0.6);
  
  const estimatedSize = Math.round(originalSize * totalCoverage);
  const savingsPercent = Math.round((1 - totalCoverage) * 100);
  
  return { savingsPercent, estimatedSize };
}

/**
 * Validate if a font subset configuration is valid
 * @param config - Font subset configuration to validate
 * @returns Validation result
 */
export function validateSubsetConfig(config: FontSubsetConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!config.family || config.family.trim() === '') {
    errors.push('Font family is required');
  }
  
  if (!config.scripts || config.scripts.length === 0) {
    errors.push('At least one script must be specified');
  } else {
    for (const script of config.scripts) {
      if (!UNICODE_RANGES[script]) {
        errors.push(`Invalid script: ${script}`);
      }
    }
  }
  
  if (!config.weights || config.weights.length === 0) {
    errors.push('At least one weight must be specified');
  } else {
    for (const weight of config.weights) {
      if (weight < 100 || weight > 900 || weight % 100 !== 0) {
        errors.push(`Invalid weight: ${weight}. Must be multiple of 100 between 100-900`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get recommended subset configuration for a locale
 * @param locale - Locale code
 * @returns Recommended font subset configuration
 */
export function getRecommendedSubsetConfig(locale: string): FontSubsetConfig {
  const scripts = getScriptsForLocale(locale);
  const isRTL = scripts.includes('arabic') || scripts.includes('hebrew');
  
  return {
    family: isRTL ? 'Noto Sans Arabic' : 'Inter',
    scripts,
    weights: [400, 600, 700],
    style: 'normal',
    display: isRTL ? 'swap' : 'optional',
  };
}

/**
 * Create a font subset manifest for build-time optimization
 * @param fontConfigs - Array of font configurations
 * @returns JSON-serializable manifest object
 */
export function createSubsetManifest(
  fontConfigs: FontSubsetConfig[],
): Record<string, unknown> {
  const manifest: Record<string, unknown> = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    subsets: {},
  };
  
  for (const config of fontConfigs) {
    const key = config.family.toLowerCase().replace(/\s+/g, '-');
    manifest.subsets[key] = {
      family: config.family,
      scripts: config.scripts,
      unicodeRanges: config.scripts.map((s) => UNICODE_RANGES[s]?.ranges || []),
      weights: config.weights,
      files: config.weights.map((weight) =>
        generateSubsetFileName({
          family: config.family,
          weight,
          style: config.style,
          script: config.scripts[0],
        }),
      ),
    };
  }
  
  return manifest;
}
