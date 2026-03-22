/**
 * Font Service - Main entry point for font management
 * Handles Arabic, Hebrew, and Latin font orchestration
 */

import {
  ARABIC_FONTS,
  type ArabicFont,
  getFontById,
  getFontsByCategory,
  getFontsFor,
  generateGoogleFontsUrl,
  generateSubsetFontUrl,
  getFontPreloadHints,
  DEFAULT_ARABIC_FONT,
  FONT_PAIRINGS,
  type FontPairingKey,
} from './arabic';

export type { ArabicFont, FontPairingKey };

export {
  ARABIC_FONTS,
  getFontById,
  getFontsByCategory,
  getFontsFor,
  generateGoogleFontsUrl,
  generateSubsetFontUrl,
  getFontPreloadHints,
  DEFAULT_ARABIC_FONT,
  FONT_PAIRINGS,
};

/**
 * Font configuration for a storefront
 */
export interface FontConfig {
  arabic: {
    heading: string;
    body: string;
    accent?: string;
  };
  latin?: {
    heading?: string;
    body?: string;
  };
  weights: {
    heading: number;
    body: number;
    bold: number;
  };
}

/**
 * Default font configuration
 */
export const DEFAULT_FONT_CONFIG: FontConfig = {
  arabic: {
    heading: 'cairo',
    body: 'noto-sans-arabic',
    accent: 'tajawal',
  },
  weights: {
    heading: 600,
    body: 400,
    bold: 700,
  },
};

/**
 * Generate CSS custom properties for fonts
 */
export function generateFontCSSVariables(config: FontConfig = DEFAULT_FONT_CONFIG): string {
  const headingFont = getFontById(config.arabic.heading);
  const bodyFont = getFontById(config.arabic.body);
  const accentFont = config.arabic.accent ? getFontById(config.arabic.accent) : null;
  
  return `
    :root {
      --font-arabic-heading: ${headingFont?.family || DEFAULT_ARABIC_FONT.family};
      --font-arabic-body: ${bodyFont?.family || DEFAULT_ARABIC_FONT.family};
      --font-arabic-accent: ${accentFont?.family || headingFont?.family || DEFAULT_ARABIC_FONT.family};
      
      --font-weight-heading: ${config.weights.heading};
      --font-weight-body: ${config.weights.body};
      --font-weight-bold: ${config.weights.bold};
    }
    
    [dir="rtl"] {
      font-family: var(--font-arabic-body);
    }
    
    [dir="rtl"] h1, [dir="rtl"] h2, [dir="rtl"] h3, 
    [dir="rtl"] h4, [dir="rtl"] h5, [dir="rtl"] h6 {
      font-family: var(--font-arabic-heading);
      font-weight: var(--font-weight-heading);
    }
  `;
}

/**
 * Get all font IDs needed for a configuration
 */
export function getFontIdsFromConfig(config: FontConfig): string[] {
  const ids = [config.arabic.heading, config.arabic.body];
  if (config.arabic.accent) {
    ids.push(config.arabic.accent);
  }
  return [...new Set(ids)];
}

/**
 * Generate link tags for font loading
 */
export function generateFontLinks(config: FontConfig = DEFAULT_FONT_CONFIG): Array<{
  rel: string;
  href: string;
  as?: string;
  type?: string;
  crossOrigin?: string;
}> {
  const fontIds = getFontIdsFromConfig(config);
  const href = generateGoogleFontsUrl(fontIds);
  
  if (!href) return [];
  
  return [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'stylesheet',
      href,
    },
  ];
}

/**
 * Validate font configuration
 */
export function validateFontConfig(config: FontConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check heading font exists
  if (!getFontById(config.arabic.heading)) {
    errors.push(`Arabic heading font "${config.arabic.heading}" not found`);
  }
  
  // Check body font exists
  if (!getFontById(config.arabic.body)) {
    errors.push(`Arabic body font "${config.arabic.body}" not found`);
  }
  
  // Check accent font if specified
  if (config.arabic.accent && !getFontById(config.arabic.accent)) {
    errors.push(`Arabic accent font "${config.arabic.accent}" not found`);
  }
  
  // Check weights are valid
  const headingFont = getFontById(config.arabic.heading);
  if (headingFont && !headingFont.weights.includes(config.weights.heading)) {
    errors.push(`Weight ${config.weights.heading} not available for ${headingFont.name}`);
  }
  
  const bodyFont = getFontById(config.arabic.body);
  if (bodyFont && !bodyFont.weights.includes(config.weights.body)) {
    errors.push(`Weight ${config.weights.body} not available for ${bodyFont.name}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Apply font pairing preset
 */
export function applyFontPairing(pairingKey: FontPairingKey): FontConfig {
  const pairing = FONT_PAIRINGS[pairingKey];
  if (!pairing) return DEFAULT_FONT_CONFIG;
  
  return {
    arabic: {
      heading: pairing.heading,
      body: pairing.body,
      accent: pairing.accent,
    },
    weights: DEFAULT_FONT_CONFIG.weights,
  };
}
