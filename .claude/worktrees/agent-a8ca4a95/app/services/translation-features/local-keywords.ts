/**
 * Local Keywords Service
 * T0338: Translation - Local Keywords
 *
 * Provides locale-specific keyword databases and keyword translation
 * utilities to support culturally-aware SEO strategies.
 */

export type SupportedLocale = 'ar' | 'he' | 'en' | 'fr' | 'de' | 'es' | 'tr';
export type KeywordCategory =
  | 'fashion'
  | 'electronics'
  | 'food'
  | 'beauty'
  | 'home'
  | 'sports'
  | 'health'
  | 'travel'
  | 'general';

export interface LocalKeyword {
  keyword: string;
  locale: SupportedLocale;
  category: KeywordCategory;
  isRTL: boolean;
  culturalNote?: string;
}

export interface TranslatedKeyword {
  original: string;
  originalLocale: SupportedLocale;
  translated: string;
  targetLocale: SupportedLocale;
  confidence: 'high' | 'medium' | 'low';
}

// Bilingual keyword mapping (en <-> ar, en <-> he)
const TRANSLATION_MAP: Record<string, Partial<Record<SupportedLocale, string>>> = {
  // Fashion
  clothing: { ar: 'ملابس', he: 'בגדים', fr: 'vêtements', de: 'Kleidung', es: 'ropa', tr: 'giyim' },
  fashion: { ar: 'موضة', he: 'אופנה', fr: 'mode', de: 'Mode', es: 'moda', tr: 'moda' },
  dress: { ar: 'فستان', he: 'שמלה', fr: 'robe', de: 'Kleid', es: 'vestido', tr: 'elbise' },
  shoes: { ar: 'أحذية', he: 'נעליים', fr: 'chaussures', de: 'Schuhe', es: 'zapatos', tr: 'ayakkabı' },
  // Electronics
  phone: { ar: 'هاتف', he: 'טלפון', fr: 'téléphone', de: 'Telefon', es: 'teléfono', tr: 'telefon' },
  laptop: { ar: 'لابتوب', he: 'מחשב נייד', fr: 'ordinateur', de: 'Laptop', es: 'portátil', tr: 'dizüstü' },
  // Food
  food: { ar: 'طعام', he: 'אוכל', fr: 'nourriture', de: 'Essen', es: 'comida', tr: 'yiyecek' },
  organic: { ar: 'عضوي', he: 'אורגני', fr: 'biologique', de: 'Bio', es: 'orgánico', tr: 'organik' },
  // Beauty
  makeup: { ar: 'مكياج', he: 'איפור', fr: 'maquillage', de: 'Make-up', es: 'maquillaje', tr: 'makyaj' },
  skincare: { ar: 'عناية بالبشرة', he: 'טיפוח עור', fr: 'soins', de: 'Hautpflege', es: 'cuidado', tr: 'cilt bakımı' },
  // Home
  furniture: { ar: 'أثاث', he: 'רהיטים', fr: 'meubles', de: 'Möbel', es: 'muebles', tr: 'mobilya' },
  decor: { ar: 'ديكور', he: 'עיצוב', fr: 'décor', de: 'Dekor', es: 'decoración', tr: 'dekor' },
  // Sports
  sports: { ar: 'رياضة', he: 'ספורט', fr: 'sport', de: 'Sport', es: 'deporte', tr: 'spor' },
  gym: { ar: 'صالة رياضة', he: 'חדר כושר', fr: 'salle', de: 'Fitnessstudio', es: 'gimnasio', tr: 'spor salonu' },
  // Health
  health: { ar: 'صحة', he: 'בריאות', fr: 'santé', de: 'Gesundheit', es: 'salud', tr: 'sağlık' },
  vitamin: { ar: 'فيتامين', he: 'ויטמין', fr: 'vitamine', de: 'Vitamin', es: 'vitamina', tr: 'vitamin' },
  // Travel
  travel: { ar: 'سفر', he: 'נסיעה', fr: 'voyage', de: 'Reise', es: 'viaje', tr: 'seyahat' },
  hotel: { ar: 'فندق', he: 'מלון', fr: 'hôtel', de: 'Hotel', es: 'hotel', tr: 'otel' },
  // General commerce
  buy: { ar: 'شراء', he: 'קנייה', fr: 'acheter', de: 'kaufen', es: 'comprar', tr: 'satın al' },
  discount: { ar: 'خصم', he: 'הנחה', fr: 'réduction', de: 'Rabatt', es: 'descuento', tr: 'indirim' },
  free: { ar: 'مجاني', he: 'חינם', fr: 'gratuit', de: 'kostenlos', es: 'gratis', tr: 'ücretsiz' },
  shipping: { ar: 'شحن', he: 'משלוח', fr: 'livraison', de: 'Versand', es: 'envío', tr: 'kargo' },
  price: { ar: 'سعر', he: 'מחיר', fr: 'prix', de: 'Preis', es: 'precio', tr: 'fiyat' },
  quality: { ar: 'جودة', he: 'איכות', fr: 'qualité', de: 'Qualität', es: 'calidad', tr: 'kalite' },
  online: { ar: 'أونلاين', he: 'אונליין', fr: 'en ligne', de: 'online', es: 'en línea', tr: 'çevrimiçi' },
};

// RTL locales
const RTL_LOCALES: Set<SupportedLocale> = new Set(['ar', 'he']);

// Local keyword database indexed by locale and category
const LOCAL_KEYWORD_DB: Record<SupportedLocale, Record<KeywordCategory, string[]>> = {
  ar: {
    fashion: ['ملابس', 'موضة', 'أزياء', 'عباية', 'كوتور', 'تصميم', 'أكسسوارات'],
    electronics: ['هاتف ذكي', 'لابتوب', 'تابلت', 'سماعات لاسلكية', 'شاحن'],
    food: ['طعام حلال', 'وجبات صحية', 'مطبخ عربي', 'توصيل', 'عضوي'],
    beauty: ['مستحضرات تجميل', 'عطور', 'كريم', 'مكياج', 'حجاب'],
    home: ['أثاث', 'ديكور عربي', 'سجادة', 'ستارة', 'إضاءة'],
    sports: ['رياضة', 'تمارين', 'لياقة بدنية', 'كرة القدم', 'سباحة'],
    health: ['صحة', 'مكملات غذائية', 'فيتامينات', 'طب عربي'],
    travel: ['سفر', 'رحلات', 'فنادق', 'حج', 'عمرة', 'سياحة'],
    general: ['تسوق', 'خصم', 'عروض', 'شحن مجاني', 'جودة عالية'],
  },
  he: {
    fashion: ['בגדים', 'אופנה', 'סטייל', 'עיצוב', 'אקססוריז'],
    electronics: ['סמארטפון', 'מחשב נייד', 'טאבלט', 'אוזניות אלחוטיות'],
    food: ['אוכל כשר', 'אורגני', 'בריאות', 'משלוח', 'מסעדה'],
    beauty: ['קוסמטיקה', 'בושם', 'קרם', 'איפור', 'טיפוח'],
    home: ['רהיטים', 'עיצוב פנים', 'שטיח', 'וילון', 'תאורה'],
    sports: ['ספורט', 'כושר', 'אימון', 'כדורגל', 'שחייה'],
    health: ['בריאות', 'תוספי תזונה', 'ויטמינים', 'מרפאה'],
    travel: ['נסיעות', 'טיסות', 'מלונות', 'תיירות', 'הזמנות'],
    general: ['קנייה', 'הנחה', 'מבצע', 'משלוח חינם', 'איכות'],
  },
  en: {
    fashion: ['clothing', 'fashion', 'style', 'outfit', 'accessories', 'trendy'],
    electronics: ['smartphone', 'laptop', 'tablet', 'wireless earbuds', 'charger'],
    food: ['organic food', 'healthy meals', 'delivery', 'restaurant', 'vegan'],
    beauty: ['cosmetics', 'perfume', 'skincare', 'makeup', 'moisturizer'],
    home: ['furniture', 'home decor', 'carpet', 'curtain', 'lighting'],
    sports: ['sports', 'fitness', 'workout', 'gym', 'running', 'yoga'],
    health: ['health', 'supplements', 'vitamins', 'wellness', 'nutrition'],
    travel: ['travel', 'flights', 'hotels', 'tourism', 'booking'],
    general: ['buy', 'discount', 'deal', 'free shipping', 'quality'],
  },
  fr: {
    fashion: ['vêtements', 'mode', 'style', 'tenue', 'accessoires'],
    electronics: ['smartphone', 'ordinateur', 'tablette', 'écouteurs'],
    food: ['alimentation bio', 'repas sains', 'livraison', 'restaurant'],
    beauty: ['cosmétiques', 'parfum', 'soin', 'maquillage', 'hydratant'],
    home: ['meubles', 'décoration', 'tapis', 'rideau', 'éclairage'],
    sports: ['sport', 'fitness', 'entraînement', 'course', 'yoga'],
    health: ['santé', 'suppléments', 'vitamines', 'bien-être'],
    travel: ['voyage', 'vols', 'hôtels', 'tourisme', 'réservation'],
    general: ['acheter', 'remise', 'offre', 'livraison gratuite', 'qualité'],
  },
  de: {
    fashion: ['Kleidung', 'Mode', 'Stil', 'Outfit', 'Accessoires'],
    electronics: ['Smartphone', 'Laptop', 'Tablet', 'kabellose Kopfhörer'],
    food: ['Bio-Lebensmittel', 'gesunde Mahlzeiten', 'Lieferung', 'Restaurant'],
    beauty: ['Kosmetik', 'Parfüm', 'Pflege', 'Make-up', 'Feuchtigkeitscreme'],
    home: ['Möbel', 'Heimdeko', 'Teppich', 'Vorhang', 'Beleuchtung'],
    sports: ['Sport', 'Fitness', 'Training', 'Laufen', 'Yoga'],
    health: ['Gesundheit', 'Nahrungsergänzung', 'Vitamine', 'Wellness'],
    travel: ['Reisen', 'Flüge', 'Hotels', 'Tourismus', 'Buchung'],
    general: ['kaufen', 'Rabatt', 'Angebot', 'kostenloser Versand', 'Qualität'],
  },
  es: {
    fashion: ['ropa', 'moda', 'estilo', 'atuendo', 'accesorios'],
    electronics: ['smartphone', 'portátil', 'tableta', 'auriculares inalámbricos'],
    food: ['alimentos orgánicos', 'comidas saludables', 'entrega', 'restaurante'],
    beauty: ['cosméticos', 'perfume', 'cuidado', 'maquillaje', 'hidratante'],
    home: ['muebles', 'decoración', 'alfombra', 'cortina', 'iluminación'],
    sports: ['deporte', 'fitness', 'entrenamiento', 'correr', 'yoga'],
    health: ['salud', 'suplementos', 'vitaminas', 'bienestar'],
    travel: ['viajes', 'vuelos', 'hoteles', 'turismo', 'reserva'],
    general: ['comprar', 'descuento', 'oferta', 'envío gratis', 'calidad'],
  },
  tr: {
    fashion: ['giyim', 'moda', 'stil', 'kıyafet', 'aksesuar'],
    electronics: ['akıllı telefon', 'dizüstü', 'tablet', 'kablosuz kulaklık'],
    food: ['organik gıda', 'sağlıklı yemek', 'teslimat', 'restoran'],
    beauty: ['kozmetik', 'parfüm', 'cilt bakımı', 'makyaj', 'nemlendirici'],
    home: ['mobilya', 'ev dekorasyonu', 'halı', 'perde', 'aydınlatma'],
    sports: ['spor', 'fitness', 'antrenman', 'koşu', 'yoga'],
    health: ['sağlık', 'takviyeler', 'vitaminler', 'wellness'],
    travel: ['seyahat', 'uçuşlar', 'oteller', 'turizm', 'rezervasyon'],
    general: ['satın al', 'indirim', 'fırsat', 'ücretsiz kargo', 'kalite'],
  },
};

/**
 * Returns locale-specific keywords for a given category.
 * @param locale - The target locale
 * @param category - The keyword category
 * @param limit - Max number of keywords to return (default 10)
 * @returns Array of LocalKeyword objects
 */
export function getLocalKeywords(
  locale: SupportedLocale,
  category: KeywordCategory = 'general',
  limit = 10
): LocalKeyword[] {
  const localeDb = LOCAL_KEYWORD_DB[locale] ?? LOCAL_KEYWORD_DB.en;
  const keywords = localeDb[category] ?? localeDb.general;
  const isRTL = RTL_LOCALES.has(locale);

  return keywords.slice(0, limit).map((keyword) => ({
    keyword,
    locale,
    category,
    isRTL,
  }));
}

/**
 * Translates an array of keywords from one locale to another.
 * Uses the curated translation map for high-confidence translations.
 * @param keywords - Array of keyword strings to translate
 * @param sourceLocale - The source locale (used to find en base)
 * @param targetLocale - The target locale
 * @returns Array of TranslatedKeyword objects
 */
export function translateKeywords(
  keywords: string[],
  sourceLocale: SupportedLocale,
  targetLocale: SupportedLocale
): TranslatedKeyword[] {
  return keywords.map((keyword) => {
    const keywordLower = keyword.toLowerCase();

    // Try direct lookup in translation map
    const translations = TRANSLATION_MAP[keywordLower];
    if (translations) {
      const translated =
        translations[targetLocale] ??
        (sourceLocale !== 'en' ? TRANSLATION_MAP[keywordLower]?.en : undefined);

      if (translated) {
        return {
          original: keyword,
          originalLocale: sourceLocale,
          translated,
          targetLocale,
          confidence: 'high',
        };
      }
    }

    // Reverse lookup: find the English key for this word
    for (const [enKey, map] of Object.entries(TRANSLATION_MAP)) {
      if (map[sourceLocale]?.toLowerCase() === keywordLower) {
        const translated = map[targetLocale] ?? enKey;
        return {
          original: keyword,
          originalLocale: sourceLocale,
          translated,
          targetLocale,
          confidence: 'high',
        };
      }
    }

    // Fallback: return original with low confidence
    return {
      original: keyword,
      originalLocale: sourceLocale,
      translated: keyword,
      targetLocale,
      confidence: 'low',
    };
  });
}

/**
 * Returns whether a locale uses RTL text direction.
 */
export function isRTLLocale(locale: SupportedLocale): boolean {
  return RTL_LOCALES.has(locale);
}

/**
 * Returns all supported locales.
 */
export function getSupportedLocales(): SupportedLocale[] {
  return Object.keys(LOCAL_KEYWORD_DB) as SupportedLocale[];
}

/**
 * Returns all supported keyword categories.
 */
export function getSupportedCategories(): KeywordCategory[] {
  return [
    'fashion', 'electronics', 'food', 'beauty', 'home',
    'sports', 'health', 'travel', 'general',
  ];
}
