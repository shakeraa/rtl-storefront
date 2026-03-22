/**
 * Arabic Font Library
 * Curated collection of Arabic fonts optimized for RTL storefronts
 */

export interface ArabicFont {
  id: string;
  name: string;
  family: string;
  category: 'sans-serif' | 'serif' | 'display' | 'handwriting';
  weights: number[];
  subsets: string[];
  googleFontUrl: string;
  previewText: string;
  description: string;
  recommendedFor: string[];
}

export const ARABIC_FONTS: ArabicFont[] = [
  {
    id: 'noto-sans-arabic',
    name: 'Noto Sans Arabic',
    family: '"Noto Sans Arabic", sans-serif',
    category: 'sans-serif',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    subsets: ['arabic', 'latin'],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@100..900&display=swap',
    previewText: 'مرحباً بالعالم',
    description: 'Unicode-compliant Arabic font with excellent readability. Best for body text and UI elements.',
    recommendedFor: ['body-text', 'ui-elements', 'general-purpose'],
  },
  {
    id: 'cairo',
    name: 'Cairo',
    family: '"Cairo", sans-serif',
    category: 'sans-serif',
    weights: [200, 300, 400, 500, 600, 700, 800, 900],
    subsets: ['arabic', 'latin'],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cairo:wght@200..1000&display=swap',
    previewText: 'خط عربي جميل',
    description: 'Modern Arabic font inspired by Kufi script. Great for headings and modern designs.',
    recommendedFor: ['headings', 'modern-designs', 'branding'],
  },
  {
    id: 'vazirmatn',
    name: 'Vazirmatn',
    family: '"Vazirmatn", sans-serif',
    category: 'sans-serif',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    subsets: ['arabic', 'latin'],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100..900&display=swap',
    previewText: 'فازيرمتن خط فارسي عربي',
    description: 'Persian-Arabic font optimized for screen readability. Excellent for long-form content.',
    recommendedFor: ['long-form-content', 'blogs', 'articles'],
  },
  {
    id: 'amiri',
    name: 'Amiri',
    family: '"Amiri", serif',
    category: 'serif',
    weights: [400, 700],
    subsets: ['arabic', 'latin'],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap',
    previewText: 'خط أميري الكلاسيكي',
    description: 'Classical Naskh-style font. Perfect for traditional content and religious text.',
    recommendedFor: ['traditional-content', 'religious-text', 'books'],
  },
  {
    id: 'aref-ruqaa',
    name: 'Aref Ruqaa',
    family: '"Aref Ruqaa", serif',
    category: 'serif',
    weights: [400, 700],
    subsets: ['arabic', 'latin'],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&display=swap',
    previewText: 'خط الرقعة الأنيق',
    description: 'Ruqaa-style calligraphic font. Beautiful for creative headings and artistic content.',
    recommendedFor: ['creative-headings', 'artistic-content', 'quotes'],
  },
  {
    id: 'almarai',
    name: 'Almarai',
    family: '"Almarai", sans-serif',
    category: 'sans-serif',
    weights: [300, 400, 700, 800],
    subsets: ['arabic', 'latin'],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap',
    previewText: 'خط المريع المميز',
    description: 'Saudi-designed font optimized for digital displays. Clean and professional.',
    recommendedFor: ['business', 'professional', 'corporate'],
  },
  {
    id: 'tajawal',
    name: 'Tajawal',
    family: '"Tajawal", sans-serif',
    category: 'sans-serif',
    weights: [200, 300, 400, 500, 700, 800, 900],
    subsets: ['arabic', 'latin'],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Tajawal:wght@200..900&display=swap',
    previewText: 'خط تجوال العصري',
    description: 'Modern geometric Arabic font. Excellent for tech and startup brands.',
    recommendedFor: ['tech', 'startups', 'apps'],
  },
  {
    id: 'readex-pro',
    name: 'Readex Pro',
    family: '"Readex Pro", sans-serif',
    category: 'sans-serif',
    weights: [200, 300, 400, 500, 600, 700],
    subsets: ['arabic', 'latin'],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Readex+Pro:wght@200..700&display=swap',
    previewText: 'ريدكس برو للقراءة',
    description: 'Designed for maximum readability on screens. Great for educational content.',
    recommendedFor: ['educational-content', 'e-learning', 'children'],
  },
];

/**
 * Get font by ID
 */
export function getFontById(id: string): ArabicFont | undefined {
  return ARABIC_FONTS.find((font) => font.id === id);
}

/**
 * Get fonts by category
 */
export function getFontsByCategory(category: ArabicFont['category']): ArabicFont[] {
  return ARABIC_FONTS.filter((font) => font.category === category);
}

/**
 * Get fonts recommended for specific use case
 */
export function getFontsFor(useCase: string): ArabicFont[] {
  return ARABIC_FONTS.filter((font) => 
    font.recommendedFor.includes(useCase)
  );
}

/**
 * Generate Google Fonts URL for multiple fonts
 */
export function generateGoogleFontsUrl(fontIds: string[]): string {
  const fonts = fontIds
    .map((id) => getFontById(id))
    .filter(Boolean) as ArabicFont[];
  
  if (fonts.length === 0) {
    return '';
  }
  
  const familyParams = fonts.map((font) => {
    const familyName = font.name.replace(/\s+/g, '+');
    const weights = font.weights.join(',');
    return `family=${familyName}:wght@${weights}`;
  });
  
  return `https://fonts.googleapis.com/css2?${familyParams.join('&')}&display=swap`;
}

/**
 * Generate font subset URL for better performance
 * Only includes weights actually used
 */
export function generateSubsetFontUrl(fontId: string, usedWeights: number[]): string {
  const font = getFontById(fontId);
  if (!font) return '';
  
  // Filter to only requested weights that exist for this font
  const validWeights = usedWeights.filter((w) => font.weights.includes(w));
  if (validWeights.length === 0) {
    validWeights.push(font.weights[0]); // Default to first weight
  }
  
  const familyName = font.name.replace(/\s+/g, '+');
  return `https://fonts.googleapis.com/css2?family=${familyName}:wght@${validWeights.join(';')}&display=swap`;
}

/**
 * Get font preload hints for critical fonts
 */
export function getFontPreloadHints(fontIds: string[]): Array<{
  rel: string;
  href: string;
  as: string;
  type: string;
  crossOrigin: string;
}> {
  return fontIds.map((id) => ({
    rel: 'preconnect',
    href: 'https://fonts.googleapis.com',
    as: '',
    type: '',
    crossOrigin: 'anonymous',
  }));
}

/**
 * Default font for Arabic text
 */
export const DEFAULT_ARABIC_FONT = ARABIC_FONTS[0]; // Noto Sans Arabic

/**
 * Font pairings for common use cases
 */
export const FONT_PAIRINGS = {
  'modern-blog': {
    heading: 'cairo',
    body: 'vazirmatn',
    accent: 'tajawal',
  },
  'traditional-store': {
    heading: 'amiri',
    body: 'noto-sans-arabic',
    accent: 'aref-ruqaa',
  },
  'corporate': {
    heading: 'almarai',
    body: 'noto-sans-arabic',
    accent: 'tajawal',
  },
  'tech-startup': {
    heading: 'tajawal',
    body: 'readex-pro',
    accent: 'cairo',
  },
} as const;

export type FontPairingKey = keyof typeof FONT_PAIRINGS;
