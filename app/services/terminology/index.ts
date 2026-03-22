/**
 * Fashion Terminology Database
 * T0063: Fashion Terminology DB
 */

export interface TermEntry {
  id: string;
  term: string;
  category: 'fabric' | 'garment' | 'style' | 'measurement' | 'care' | 'color';
  translations: Record<string, string>;
  definitions: Record<string, string>;
  images?: string[];
  relatedTerms?: string[];
}

export interface TerminologyDatabase {
  terms: TermEntry[];
  categories: string[];
  languages: string[];
}

// Fashion terminology database
export const FASHION_TERMS: TermEntry[] = [
  {
    id: 'abaya',
    term: 'Abaya',
    category: 'garment',
    translations: {
      ar: 'عباءة',
      en: 'Abaya',
    },
    definitions: {
      ar: 'رداء فضفاض يرتديه النساء في العالم الإسلامي',
      en: 'A loose robe worn by women in the Muslim world',
    },
    relatedTerms: ['kaftan', 'jalabiya'],
  },
  {
    id: 'hijab',
    term: 'Hijab',
    category: 'garment',
    translations: {
      ar: 'حجاب',
      en: 'Hijab',
    },
    definitions: {
      ar: 'غطاء الرأس الذي ترتديه المرأة المسلمة',
      en: 'Head covering worn by Muslim women',
    },
    relatedTerms: ['niqab', 'khimar'],
  },
  {
    id: 'kaftan',
    term: 'Kaftan',
    category: 'garment',
    translations: {
      ar: 'قفطان',
      en: 'Kaftan',
    },
    definitions: {
      ar: 'فستان فضفاض بأكمام طويلة',
      en: 'Long loose dress with long sleeves',
    },
  },
  {
    id: 'jalabiya',
    term: 'Jalabiya',
    category: 'garment',
    translations: {
      ar: 'جلابية',
      en: 'Jalabiya',
    },
    definitions: {
      ar: 'فستان تقليدي من الشرق الأوسط',
      en: 'Traditional Middle Eastern dress',
    },
  },
  {
    id: 'chiffon',
    term: 'Chiffon',
    category: 'fabric',
    translations: {
      ar: 'شيفون',
      en: 'Chiffon',
    },
    definitions: {
      ar: 'قماش خفيف وشفاف',
      en: 'Lightweight sheer fabric',
    },
  },
  {
    id: 'crepe',
    term: 'Crepe',
    category: 'fabric',
    translations: {
      ar: 'كريب',
      en: 'Crepe',
    },
    definitions: {
      ar: 'قماش ناعم بملمس مجعد',
      en: 'Soft fabric with wrinkled texture',
    },
  },
  {
    id: 'embroidery',
    term: 'Embroidery',
    category: 'style',
    translations: {
      ar: 'تطريز',
      en: 'Embroidery',
    },
    definitions: {
      ar: 'زخرفة القماش بالخياطة اليدوية أو الآلية',
      en: 'Decorating fabric with needle and thread',
    },
  },
  {
    id: 'bust',
    term: 'Bust',
    category: 'measurement',
    translations: {
      ar: 'الصدر',
      en: 'Bust',
    },
    definitions: {
      ar: 'قياس محيط أعرض جزء من الصدر',
      en: 'Measurement around fullest part of chest',
    },
  },
  {
    id: 'waist',
    term: 'Waist',
    category: 'measurement',
    translations: {
      ar: 'الخصر',
      en: 'Waist',
    },
    definitions: {
      ar: 'قياس محيط الخصر الطبيعي',
      en: 'Measurement around natural waistline',
    },
  },
  {
    id: 'hand_wash',
    term: 'Hand Wash',
    category: 'care',
    translations: {
      ar: 'غسل يدوي',
      en: 'Hand Wash',
    },
    definitions: {
      ar: 'غسل الملابس باليد بماء فاتر',
      en: 'Wash garment by hand in lukewarm water',
    },
  },
];

// Search terms
export function searchTerms(
  query: string,
  language: string = 'en'
): TermEntry[] {
  const lowerQuery = query.toLowerCase();
  
  return FASHION_TERMS.filter((term) => {
    const termText = term.term.toLowerCase();
    const translation = term.translations[language]?.toLowerCase() || '';
    const definition = term.definitions[language]?.toLowerCase() || '';
    
    return (
      termText.includes(lowerQuery) ||
      translation.includes(lowerQuery) ||
      definition.includes(lowerQuery)
    );
  });
}

// Get term by ID
export function getTermById(id: string): TermEntry | undefined {
  return FASHION_TERMS.find((t) => t.id === id);
}

// Get terms by category
export function getTermsByCategory(category: TermEntry['category']): TermEntry[] {
  return FASHION_TERMS.filter((t) => t.category === category);
}

// Translate fashion term
export function translateTerm(
  term: string,
  from: string,
  to: string
): string | null {
  const entry = FASHION_TERMS.find(
    (t) => t.term.toLowerCase() === term.toLowerCase() ||
          t.translations[from]?.toLowerCase() === term.toLowerCase()
  );
  
  return entry?.translations[to] || null;
}

// Export all
export * from './constants';
