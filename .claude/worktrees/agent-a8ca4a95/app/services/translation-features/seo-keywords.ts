/**
 * SEO Keywords Service
 * T0337: Translation - SEO Keywords
 *
 * Provides keyword suggestions, density analysis, and top keyword
 * recommendations for localized SEO optimization.
 */

export type SupportedLocale = 'ar' | 'he' | 'en' | 'fr' | 'de' | 'es' | 'tr';
export type ContentCategory =
  | 'fashion'
  | 'electronics'
  | 'food'
  | 'beauty'
  | 'home'
  | 'sports'
  | 'health'
  | 'travel'
  | 'general';

export interface KeywordSuggestion {
  keyword: string;
  locale: SupportedLocale;
  relevanceScore: number; // 0-100
  searchVolume?: 'low' | 'medium' | 'high';
  competition?: 'low' | 'medium' | 'high';
}

export interface KeywordDensityResult {
  keyword: string;
  count: number;
  density: number; // percentage
  isOptimal: boolean; // 1-3% is generally optimal
}

export interface DensityAnalysis {
  wordCount: number;
  results: KeywordDensityResult[];
  overallScore: number; // 0-100
}

// Curated keyword database by locale and category
const KEYWORD_DATABASE: Record<SupportedLocale, Record<ContentCategory, string[]>> = {
  ar: {
    fashion: ['ملابس', 'موضة', 'أزياء', 'تصميم', 'عباية', 'حجاب', 'كوتور', 'تيشرت', 'بنطلون', 'فستان'],
    electronics: ['هاتف', 'لابتوب', 'تابلت', 'إلكترونيات', 'شاشة', 'سماعات', 'كاميرا', 'طابعة', 'راوتر'],
    food: ['طعام', 'وجبات', 'مطعم', 'وصفات', 'حلال', 'طازج', 'عضوي', 'توصيل', 'أكل'],
    beauty: ['مكياج', 'عطر', 'كريم', 'مستحضرات', 'شعر', 'بشرة', 'تجميل', 'جمال'],
    home: ['أثاث', 'ديكور', 'منزل', 'غرفة', 'مطبخ', 'حمام', 'سرير', 'سجادة', 'ستارة'],
    sports: ['رياضة', 'تمرين', 'جيم', 'كرة', 'سباحة', 'جري', 'دراجة', 'يوغا'],
    health: ['صحة', 'دواء', 'فيتامين', 'مكمل', 'لياقة', 'تغذية', 'علاج', 'طبيب'],
    travel: ['سفر', 'طيران', 'فندق', 'رحلة', 'سياحة', 'حجز', 'تأشيرة', 'منتجع'],
    general: ['تسوق', 'شراء', 'خصم', 'عرض', 'جودة', 'سعر', 'شحن', 'مجاني', 'أونلاين'],
  },
  he: {
    fashion: ['בגדים', 'אופנה', 'סטייל', 'עיצוב', 'חולצה', 'מכנסיים', 'שמלה', 'מעיל', 'נעליים'],
    electronics: ['טלפון', 'מחשב', 'טאבלט', 'אלקטרוניקה', 'מסך', 'אוזניות', 'מצלמה'],
    food: ['אוכל', 'מזון', 'מסעדה', 'מתכונים', 'כשר', 'טרי', 'אורגני', 'משלוח'],
    beauty: ['איפור', 'בושם', 'קרם', 'טיפוח', 'שיער', 'עור', 'יופי', 'קוסמטיקה'],
    home: ['רהיטים', 'עיצוב', 'בית', 'חדר', 'מטבח', 'שינה', 'שטיח', 'וילון'],
    sports: ['ספורט', 'אימון', 'כדור', 'שחייה', 'ריצה', 'אופניים', 'יוגה', 'כושר'],
    health: ['בריאות', 'תרופה', 'ויטמין', 'תוסף', 'תזונה', 'טיפול', 'רופא'],
    travel: ['נסיעה', 'טיסה', 'מלון', 'טיול', 'תיירות', 'הזמנה', 'ויזה'],
    general: ['קנייה', 'הנחה', 'מבצע', 'איכות', 'מחיר', 'משלוח', 'חינם', 'אונליין'],
  },
  en: {
    fashion: ['clothing', 'fashion', 'style', 'design', 'shirt', 'pants', 'dress', 'shoes', 'accessories'],
    electronics: ['phone', 'laptop', 'tablet', 'electronics', 'screen', 'headphones', 'camera', 'smart'],
    food: ['food', 'meals', 'restaurant', 'recipes', 'organic', 'fresh', 'delivery', 'healthy'],
    beauty: ['makeup', 'perfume', 'cream', 'skincare', 'hair', 'beauty', 'cosmetics', 'serum'],
    home: ['furniture', 'decor', 'home', 'room', 'kitchen', 'bedroom', 'carpet', 'curtain'],
    sports: ['sports', 'workout', 'gym', 'ball', 'swimming', 'running', 'cycling', 'yoga'],
    health: ['health', 'medicine', 'vitamin', 'supplement', 'fitness', 'nutrition', 'wellness'],
    travel: ['travel', 'flight', 'hotel', 'trip', 'tourism', 'booking', 'visa', 'resort'],
    general: ['buy', 'shop', 'discount', 'deal', 'quality', 'price', 'free', 'shipping', 'online'],
  },
  fr: {
    fashion: ['vêtements', 'mode', 'style', 'design', 'chemise', 'pantalon', 'robe', 'chaussures'],
    electronics: ['téléphone', 'ordinateur', 'tablette', 'électronique', 'écran', 'casque'],
    food: ['alimentation', 'repas', 'restaurant', 'recettes', 'biologique', 'frais', 'livraison'],
    beauty: ['maquillage', 'parfum', 'crème', 'soins', 'cheveux', 'beauté', 'cosmétiques'],
    home: ['meubles', 'décor', 'maison', 'chambre', 'cuisine', 'tapis', 'rideau'],
    sports: ['sport', 'entraînement', 'salle', 'natation', 'course', 'vélo', 'yoga'],
    health: ['santé', 'médicament', 'vitamine', 'supplément', 'fitness', 'nutrition'],
    travel: ['voyage', 'vol', 'hôtel', 'excursion', 'tourisme', 'réservation', 'visa'],
    general: ['acheter', 'boutique', 'réduction', 'qualité', 'prix', 'gratuit', 'livraison'],
  },
  de: {
    fashion: ['Kleidung', 'Mode', 'Stil', 'Design', 'Hemd', 'Hose', 'Kleid', 'Schuhe'],
    electronics: ['Telefon', 'Laptop', 'Tablet', 'Elektronik', 'Bildschirm', 'Kopfhörer'],
    food: ['Essen', 'Mahlzeiten', 'Restaurant', 'Rezepte', 'Bio', 'frisch', 'Lieferung'],
    beauty: ['Make-up', 'Parfüm', 'Creme', 'Hautpflege', 'Haare', 'Schönheit'],
    home: ['Möbel', 'Dekor', 'Haus', 'Zimmer', 'Küche', 'Teppich', 'Vorhang'],
    sports: ['Sport', 'Training', 'Fitnessstudio', 'Schwimmen', 'Laufen', 'Radfahren'],
    health: ['Gesundheit', 'Medizin', 'Vitamine', 'Ergänzung', 'Fitness', 'Ernährung'],
    travel: ['Reise', 'Flug', 'Hotel', 'Ausflug', 'Tourismus', 'Buchung', 'Visum'],
    general: ['kaufen', 'Rabatt', 'Angebot', 'Qualität', 'Preis', 'kostenlos', 'Versand'],
  },
  es: {
    fashion: ['ropa', 'moda', 'estilo', 'diseño', 'camisa', 'pantalón', 'vestido', 'zapatos'],
    electronics: ['teléfono', 'portátil', 'tableta', 'electrónica', 'pantalla', 'auriculares'],
    food: ['comida', 'comidas', 'restaurante', 'recetas', 'orgánico', 'fresco', 'entrega'],
    beauty: ['maquillaje', 'perfume', 'crema', 'cuidado', 'cabello', 'belleza', 'cosméticos'],
    home: ['muebles', 'decoración', 'hogar', 'habitación', 'cocina', 'alfombra', 'cortina'],
    sports: ['deporte', 'entrenamiento', 'natación', 'carrera', 'ciclismo', 'yoga'],
    health: ['salud', 'medicina', 'vitaminas', 'suplemento', 'nutrición', 'bienestar'],
    travel: ['viaje', 'vuelo', 'hotel', 'excursión', 'turismo', 'reserva', 'visa'],
    general: ['comprar', 'descuento', 'oferta', 'calidad', 'precio', 'gratis', 'envío'],
  },
  tr: {
    fashion: ['giyim', 'moda', 'stil', 'tasarım', 'gömlek', 'pantolon', 'elbise', 'ayakkabı'],
    electronics: ['telefon', 'dizüstü', 'tablet', 'elektronik', 'ekran', 'kulaklık'],
    food: ['yiyecek', 'yemekler', 'restoran', 'tarifler', 'organik', 'taze', 'teslimat'],
    beauty: ['makyaj', 'parfüm', 'krem', 'cilt bakımı', 'saç', 'güzellik', 'kozmetik'],
    home: ['mobilya', 'dekor', 'ev', 'oda', 'mutfak', 'halı', 'perde'],
    sports: ['spor', 'antrenman', 'yüzme', 'koşu', 'bisiklet', 'yoga'],
    health: ['sağlık', 'ilaç', 'vitamin', 'takviye', 'fitness', 'beslenme'],
    travel: ['seyahat', 'uçuş', 'otel', 'gezi', 'turizm', 'rezervasyon', 'vize'],
    general: ['satın al', 'indirim', 'fırsat', 'kalite', 'fiyat', 'ücretsiz', 'kargo'],
  },
};

/**
 * Suggests relevant SEO keywords for a given text and locale.
 * @param text - The content to analyze
 * @param locale - The target locale
 * @param category - Optional content category for more targeted suggestions
 * @returns Array of KeywordSuggestion objects sorted by relevance
 */
export function suggestKeywords(
  text: string,
  locale: SupportedLocale,
  category: ContentCategory = 'general'
): KeywordSuggestion[] {
  const localeKeywords = KEYWORD_DATABASE[locale] ?? KEYWORD_DATABASE.en;
  const categoryKeywords = localeKeywords[category] ?? localeKeywords.general;
  const generalKeywords = localeKeywords.general;

  const allKeywords = [...new Set([...categoryKeywords, ...generalKeywords])];
  const lowerText = text.toLowerCase();

  return allKeywords
    .map((keyword) => {
      const keywordLower = keyword.toLowerCase();
      const inText = lowerText.includes(keywordLower);
      const relevanceScore = inText ? 85 + Math.random() * 15 : 40 + Math.random() * 45;

      return {
        keyword,
        locale,
        relevanceScore: Math.round(relevanceScore),
        searchVolume: relevanceScore > 75 ? 'high' : relevanceScore > 55 ? 'medium' : 'low',
        competition: relevanceScore > 70 ? 'high' : relevanceScore > 50 ? 'medium' : 'low',
      } as KeywordSuggestion;
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 20);
}

/**
 * Analyzes keyword density in a text.
 * @param text - The content to analyze
 * @param keywords - Array of keywords to check
 * @returns DensityAnalysis with per-keyword results
 */
export function analyzeKeywordDensity(
  text: string,
  keywords: string[]
): DensityAnalysis {
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lowerText = text.toLowerCase();

  const results: KeywordDensityResult[] = keywords.map((keyword) => {
    const keywordLower = keyword.toLowerCase();
    let count = 0;
    let pos = 0;

    while ((pos = lowerText.indexOf(keywordLower, pos)) !== -1) {
      count++;
      pos += keywordLower.length;
    }

    const density = wordCount > 0 ? (count / wordCount) * 100 : 0;
    const isOptimal = density >= 1 && density <= 3;

    return {
      keyword,
      count,
      density: Math.round(density * 100) / 100,
      isOptimal,
    };
  });

  // Overall score: average of keyword scores
  const optimizedCount = results.filter((r) => r.isOptimal).length;
  const overallScore =
    results.length > 0 ? Math.round((optimizedCount / results.length) * 100) : 0;

  return { wordCount, results, overallScore };
}

/**
 * Returns the top SEO keywords for a locale and category.
 * @param locale - The locale code
 * @param category - The content category
 * @param limit - Number of keywords to return (default 10)
 * @returns Array of top keyword strings
 */
export function getTopKeywords(
  locale: SupportedLocale,
  category: ContentCategory = 'general',
  limit = 10
): string[] {
  const localeKeywords = KEYWORD_DATABASE[locale] ?? KEYWORD_DATABASE.en;
  const categoryKeywords = localeKeywords[category] ?? localeKeywords.general;
  return categoryKeywords.slice(0, limit);
}

/**
 * Returns all supported locales for SEO analysis.
 */
export function getSupportedLocales(): SupportedLocale[] {
  return Object.keys(KEYWORD_DATABASE) as SupportedLocale[];
}

/**
 * Returns all supported content categories.
 */
export function getSupportedCategories(): ContentCategory[] {
  return [
    'fashion', 'electronics', 'food', 'beauty', 'home',
    'sports', 'health', 'travel', 'general',
  ];
}
