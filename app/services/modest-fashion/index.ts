/**
 * Modest Fashion AI Auto-Tagging Service (T0388)
 *
 * Keyword-based modesty detection for MENA market product tagging.
 * Supports Arabic, English, and Hebrew fashion terminology.
 */

export type ModestyLevel = 'full_coverage' | 'partial_coverage' | 'not_modest';

export interface ModestyTag {
  level: ModestyLevel;
  hijabFriendly: boolean;
  abayaCompatible: boolean;
  looseFit: boolean;
  opaque: boolean;
  lined: boolean;
}

export interface ProductInput {
  title: string;
  description: string;
  category: string;
}

export interface SeasonalRecommendation {
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

export const MODESTY_KEYWORDS = {
  fullCoverage: {
    en: ['abaya', 'jilbab', 'burqa', 'niqab', 'full coverage', 'maxi dress', 'floor length', 'long sleeve maxi', 'full length'],
    ar: ['عباية', 'جلباب', 'برقع', 'نقاب', 'تغطية كاملة', 'فستان طويل', 'حجاب كامل'],
    he: ['כיסוי מלא', 'שמלה ארוכה', 'חצאית ארוכה'],
  },
  partialCoverage: {
    en: ['midi dress', 'tunic', 'modest swimwear', 'burkini', 'long sleeve', 'knee length', 'loose fit', 'cardigan', 'wrap dress', 'palazzo pants', 'wide leg'],
    ar: ['تونيك', 'بوركيني', 'كم طويل', 'واسع', 'فستان ميدي', 'بنطلون واسع'],
    he: ['טוניקה', 'שרוול ארוך', 'חצאית ברך', 'בגד ים צנוע'],
  },
  hijabRelated: {
    en: ['hijab', 'headscarf', 'head cover', 'scarf', 'khimar', 'shayla', 'al-amira', 'turban wrap'],
    ar: ['حجاب', 'شيلة', 'خمار', 'طرحة', 'غطاء رأس'],
    he: ['כיסוי ראש', 'מטפחת'],
  },
  abayaRelated: {
    en: ['abaya', 'open abaya', 'closed abaya', 'abaya set', 'abaya dress', 'kimono abaya', 'bisht'],
    ar: ['عباية', 'عباية مفتوحة', 'عباية مغلقة', 'بشت', 'عباية كيمونو'],
    he: ['עבאיה'],
  },
  looseFitTerms: {
    en: ['loose fit', 'relaxed fit', 'oversized', 'flowy', 'drape', 'wide', 'baggy', 'palazzo', 'a-line'],
    ar: ['واسع', 'فضفاض', 'مريح'],
    he: ['רחב', 'משוחרר'],
  },
  opaqueTerms: {
    en: ['opaque', 'non-sheer', 'thick fabric', 'lined', 'double layer', 'heavy weight', 'crepe', 'cotton'],
    ar: ['سميك', 'غير شفاف', 'مبطن', 'قطن'],
    he: ['אטום', 'לא שקוף', 'מרופד'],
  },
  linedTerms: {
    en: ['lined', 'fully lined', 'double lined', 'with lining', 'inner layer'],
    ar: ['مبطن', 'بطانة', 'طبقة داخلية'],
    he: ['מרופד', 'בטנה'],
  },
} as const;

function textContainsAny(text: string, keywords: readonly string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

function matchesKeywordGroup(title: string, description: string, category: string, group: { en: readonly string[]; ar: readonly string[]; he: readonly string[] }): boolean {
  const combined = `${title} ${description} ${category}`;
  return textContainsAny(combined, group.en) || textContainsAny(combined, group.ar) || textContainsAny(combined, group.he);
}

/**
 * Tag a single product with modesty attributes based on keyword detection.
 */
export function tagProduct(title: string, description: string, category: string): ModestyTag {
  const isFullCoverage = matchesKeywordGroup(title, description, category, MODESTY_KEYWORDS.fullCoverage);
  const isPartialCoverage = matchesKeywordGroup(title, description, category, MODESTY_KEYWORDS.partialCoverage);
  const hijabFriendly = matchesKeywordGroup(title, description, category, MODESTY_KEYWORDS.hijabRelated);
  const abayaCompatible = matchesKeywordGroup(title, description, category, MODESTY_KEYWORDS.abayaRelated);
  const looseFit = matchesKeywordGroup(title, description, category, MODESTY_KEYWORDS.looseFitTerms);
  const opaque = matchesKeywordGroup(title, description, category, MODESTY_KEYWORDS.opaqueTerms);
  const lined = matchesKeywordGroup(title, description, category, MODESTY_KEYWORDS.linedTerms);

  let level: ModestyLevel = 'not_modest';
  if (isFullCoverage) {
    level = 'full_coverage';
  } else if (isPartialCoverage || hijabFriendly || abayaCompatible) {
    level = 'partial_coverage';
  }

  return { level, hijabFriendly, abayaCompatible, looseFit, opaque, lined };
}

/**
 * Bulk tag an array of products.
 */
export function bulkTag(products: ProductInput[]): ModestyTag[] {
  return products.map((p) => tagProduct(p.title, p.description, p.category));
}

/**
 * Filter products that meet a minimum modesty level.
 */
export function getModestCollection(products: ProductInput[], minLevel: ModestyLevel): ProductInput[] {
  const levelRank: Record<ModestyLevel, number> = {
    full_coverage: 2,
    partial_coverage: 1,
    not_modest: 0,
  };
  const minRank = levelRank[minLevel];

  return products.filter((p) => {
    const tag = tagProduct(p.title, p.description, p.category);
    return levelRank[tag.level] >= minRank;
  });
}

/**
 * Approximate check for Ramadan season.
 * Uses a simplified Hijri calendar estimate (Ramadan shifts ~11 days/year).
 * Reference: Ramadan 2024 started ~March 11, 2025 ~March 1, 2026 ~Feb 18.
 */
export function isRamadanSeason(date: Date): boolean {
  const year = date.getFullYear();
  // Approximate Ramadan start dates (shifts ~11 days earlier each Gregorian year)
  const ramadanEstimates: Record<number, { startMonth: number; startDay: number }> = {
    2024: { startMonth: 2, startDay: 11 },  // March 11
    2025: { startMonth: 1, startDay: 28 },  // Feb 28
    2026: { startMonth: 1, startDay: 18 },  // Feb 18
    2027: { startMonth: 1, startDay: 7 },   // Feb 7
    2028: { startMonth: 0, startDay: 27 },  // Jan 27
  };

  const estimate = ramadanEstimates[year];
  if (!estimate) {
    // Fallback heuristic: check if within a broad window
    const month = date.getMonth();
    return month >= 0 && month <= 3; // Jan-Apr as broad fallback
  }

  const ramadanStart = new Date(year, estimate.startMonth, estimate.startDay);
  const ramadanEnd = new Date(ramadanStart.getTime() + 30 * 24 * 60 * 60 * 1000); // ~30 days

  return date >= ramadanStart && date <= ramadanEnd;
}

/**
 * Get seasonal recommendations based on modesty tags and current date.
 */
export function getSeasonalRecommendations(tags: ModestyTag[], date: Date): SeasonalRecommendation[] {
  const recommendations: SeasonalRecommendation[] = [];
  const isRamadan = isRamadanSeason(date);
  const month = date.getMonth();

  if (isRamadan) {
    recommendations.push({
      suggestion: 'Promote Ramadan collection with special pricing',
      priority: 'high',
      reason: 'Ramadan season detected - peak modest fashion demand',
    });

    const fullCoverageCount = tags.filter((t) => t.level === 'full_coverage').length;
    if (fullCoverageCount > 0) {
      recommendations.push({
        suggestion: 'Feature full coverage items for Eid preparation',
        priority: 'high',
        reason: `${fullCoverageCount} full coverage items available for Eid shoppers`,
      });
    }
  }

  // Summer (June-August): lightweight modest options
  if (month >= 5 && month <= 7) {
    recommendations.push({
      suggestion: 'Highlight breathable and lightweight modest options',
      priority: 'medium',
      reason: 'Summer season - customers seek comfortable modest wear',
    });
  }

  // Back to school (August-September)
  if (month >= 7 && month <= 8) {
    recommendations.push({
      suggestion: 'Promote modest school-appropriate attire',
      priority: 'medium',
      reason: 'Back to school season',
    });
  }

  const hijabCount = tags.filter((t) => t.hijabFriendly).length;
  if (hijabCount > 0) {
    recommendations.push({
      suggestion: 'Create hijab styling guides and bundles',
      priority: 'low',
      reason: `${hijabCount} hijab-friendly items detected in collection`,
    });
  }

  return recommendations;
}
