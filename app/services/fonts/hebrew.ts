/**
 * Hebrew Font Library
 * Curated collection of Hebrew fonts optimized for RTL storefronts
 */

export interface HebrewFont {
  id: string;
  name: string;
  family: string;
  category: 'sans-serif' | 'serif' | 'monospace' | 'display';
  weights: number[];
  subsets: string[];
  googleFontUrl: string;
  previewText: string;
  description: string;
  recommendedFor: string[];
}

export const HEBREW_FONTS: HebrewFont[] = [
  {
    id: 'heebo',
    name: 'Heebo',
    family: '"Heebo", sans-serif',
    category: 'sans-serif',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    subsets: ['hebrew', 'latin'],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Heebo:wght@100..900&display=swap',
    previewText: 'שלום עולם',
    description: 'Modern Hebrew font with excellent readability. Designed specifically for Hebrew text with clean, geometric letterforms.',
    recommendedFor: ['body-text', 'ui-elements', 'modern-designs'],
  },
  {
    id: 'rubik',
    name: 'Rubik',
    family: '"Rubik", sans-serif',
    category: 'sans-serif',
    weights: [300, 400, 500, 600, 700, 800, 900],
    subsets: ['hebrew', 'latin', 'cyrillic'],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Rubik:wght@300..900&display=swap',
    previewText: 'ברוכים הבאים לחנות שלנו',
    description: 'Versatile font family supporting Hebrew, Latin, and Cyrillic. Slightly rounded corners give it a friendly feel.',
    recommendedFor: ['headings', 'branding', 'multilingual'],
  },
  {
    id: 'assistant',
    name: 'Assistant',
    family: '"Assistant", sans-serif',
    category: 'sans-serif',
    weights: [200, 300, 400, 500, 600, 700, 800],
    subsets: ['hebrew', 'latin'],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Assistant:wght@200..800&display=swap',
    previewText: 'מבצע מיוחד - הנחות ענק',
    description: 'Open-source Hebrew font designed for UI and screen reading. Excellent for long-form content and mobile apps.',
    recommendedFor: ['body-text', 'mobile-apps', 'ui-elements'],
  },
  {
    id: 'david-libre',
    name: 'David Libre',
    family: '"David Libre", serif',
    category: 'serif',
    weights: [400, 500, 700],
    subsets: ['hebrew', 'latin'],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=David+Libre:wght@400;500;700&display=swap',
    previewText: 'ספר דוד המלך',
    description: 'Classic Hebrew serif font based on the traditional David typeface. Perfect for formal and traditional content.',
    recommendedFor: ['traditional-content', 'books', 'formal-documents'],
  },
  {
    id: 'miriam-libre',
    name: 'Miriam Libre',
    family: '"Miriam Libre", sans-serif',
    category: 'sans-serif',
    weights: [400, 700],
    subsets: ['hebrew', 'latin'],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Miriam+Libre:wght@400;700&display=swap',
    previewText: 'מירים ליברה קריאה נעימה',
    description: 'Clean and readable Hebrew font with open letterforms. Great for educational materials and childrens content.',
    recommendedFor: ['educational', 'children', 'accessibility'],
  },
  {
    id: 'frank-ruhl-libre',
    name: 'Frank Ruhl Libre',
    family: '"Frank Ruhl Libre", serif',
    category: 'serif',
    weights: [300, 400, 500, 700, 900],
    subsets: ['hebrew', 'latin'],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@300..900&display=swap',
    previewText: 'פרנק רוהל ליברה כתב יפה',
    description: 'Elegant Hebrew serif with traditional letterforms. Excellent for premium brands and editorial design.',
    recommendedFor: ['premium-brands', 'editorial', 'luxury'],
  },
  {
    id: 'noto-sans-hebrew',
    name: 'Noto Sans Hebrew',
    family: '"Noto Sans Hebrew", sans-serif',
    category: 'sans-serif',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    subsets: ['hebrew', 'latin'],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@100..900&display=swap',
    previewText: 'נוטו סנס עברית כתב ברור',
    description: 'Googles Noto font family for Hebrew. Unicode-compliant with extensive language coverage.',
    recommendedFor: ['general-purpose', 'multilingual', 'technical'],
  },
  {
    id: 'secular-one',
    name: 'Secular One',
    family: '"Secular One", sans-serif',
    category: 'sans-serif',
    weights: [400],
    subsets: ['hebrew', 'latin'],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Secular+One&display=swap',
    previewText: 'חילוני אחד עוצמה',
    description: 'Bold and impactful Hebrew font with strong character. Perfect for headlines and attention-grabbing elements.',
    recommendedFor: ['headlines', 'banners', 'call-to-action'],
  },
  {
    id: 'suez-one',
    name: 'Suez One',
    family: '"Suez One", serif',
    category: 'serif',
    weights: [400],
    subsets: ['hebrew', 'latin'],
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Suez+One&display=swap',
    previewText: 'תעלת סואץ כותרת גדולה',
    description: 'Strong Hebrew serif with distinctive character. Excellent for impactful headings and brand names.',
    recommendedFor: ['headings', 'logos', 'display-text'],
  },
];

export function getHebrewFontById(id: string): HebrewFont | undefined {
  return HEBREW_FONTS.find((font) => font.id === id);
}

export function getHebrewFontsByCategory(category: HebrewFont['category']): HebrewFont[] {
  return HEBREW_FONTS.filter((font) => font.category === category);
}

export function getHebrewFontsFor(useCase: string): HebrewFont[] {
  return HEBREW_FONTS.filter((font) => font.recommendedFor.includes(useCase));
}

export function generateHebrewGoogleFontsUrl(fontIds: string[]): string {
  const fonts = fontIds
    .map((id) => getHebrewFontById(id))
    .filter(Boolean) as HebrewFont[];
  
  if (fonts.length === 0) return '';
  
  const familyParams = fonts.map((font) => {
    const familyName = font.name.replace(/\s+/g, '+');
    const weights = font.weights.join(',');
    return `family=${familyName}:wght@${weights}`;
  });
  
  return `https://fonts.googleapis.com/css2?${familyParams.join('&')}&display=swap`;
}

export const DEFAULT_HEBREW_FONT = HEBREW_FONTS[0];

export const HEBREW_FONT_PAIRINGS = {
  'modern-blog': { heading: 'secular-one', body: 'heebo', accent: 'rubik' },
  'traditional': { heading: 'suez-one', body: 'david-libre', accent: 'frank-ruhl-libre' },
  'tech-startup': { heading: 'rubik', body: 'assistant', accent: 'heebo' },
} as const;

export type HebrewFontPairingKey = keyof typeof HEBREW_FONT_PAIRINGS;
