/**
 * Product Translation Service
 * T0093: Vendor Names Translation
 * T0094: Product Types Translation
 * T0095: Tags Translation
 */

export interface VendorTranslation {
  originalName: string;
  translations: Record<string, string>;
  preserveOriginal: boolean;
  transliteration?: Record<string, string>;
}

export interface ProductTypeTranslation {
  originalType: string;
  translations: Record<string, string>;
  category: string;
}

export interface TagTranslation {
  originalTag: string;
  translations: Record<string, string>;
  category?: string;
  color?: string;
}

// Common vendor/brand names with translations
export const VENDOR_TRANSLATIONS: Record<string, VendorTranslation> = {
  'Nike': {
    originalName: 'Nike',
    translations: { ar: 'نايك', he: 'נייק', fr: 'Nike', de: 'Nike' },
    preserveOriginal: true,
    transliteration: { ar: 'نايكي' },
  },
  'Adidas': {
    originalName: 'Adidas',
    translations: { ar: 'أديداس', he: 'אדידס', fr: 'Adidas', de: 'Adidas' },
    preserveOriginal: true,
  },
  'Apple': {
    originalName: 'Apple',
    translations: { ar: 'آبل', he: 'אפל', fr: 'Apple', de: 'Apple' },
    preserveOriginal: true,
    transliteration: { ar: 'أبل' },
  },
  'Samsung': {
    originalName: 'Samsung',
    translations: { ar: 'سامسونج', he: 'סמסונג', fr: 'Samsung', de: 'Samsung' },
    preserveOriginal: true,
  },
  'Zara': {
    originalName: 'Zara',
    translations: { ar: 'زارا', he: 'זארה', fr: 'Zara', de: 'Zara' },
    preserveOriginal: true,
  },
  'Gucci': {
    originalName: 'Gucci',
    translations: { ar: 'غوتشي', he: 'גוצ\'י', fr: 'Gucci', de: 'Gucci' },
    preserveOriginal: true,
  },
  'Prada': {
    originalName: 'Prada',
    translations: { ar: 'برادا', he: 'פראדה', fr: 'Prada', de: 'Prada' },
    preserveOriginal: true,
  },
  'Chanel': {
    originalName: 'Chanel',
    translations: { ar: 'شانيل', he: 'שאנל', fr: 'Chanel', de: 'Chanel' },
    preserveOriginal: true,
  },
};

// Product type translations
export const PRODUCT_TYPE_TRANSLATIONS: Record<string, ProductTypeTranslation> = {
  'Clothing': {
    originalType: 'Clothing',
    translations: { ar: 'ملابس', he: 'ביגוד', fr: 'Vêtements', de: 'Kleidung' },
    category: 'fashion',
  },
  'Shoes': {
    originalType: 'Shoes',
    translations: { ar: 'أحذية', he: 'נעליים', fr: 'Chaussures', de: 'Schuhe' },
    category: 'fashion',
  },
  'Accessories': {
    originalType: 'Accessories',
    translations: { ar: 'إكسسوارات', he: 'אביזרים', fr: 'Accessoires', de: 'Accessoires' },
    category: 'fashion',
  },
  'Abaya': {
    originalType: 'Abaya',
    translations: { ar: 'عباية', he: 'עבאיה', fr: 'Abaya', de: 'Abaya' },
    category: 'modest-fashion',
  },
  'Hijab': {
    originalType: 'Hijab',
    translations: { ar: 'حجاب', he: 'חיג\'אב', fr: 'Hijab', de: 'Hidschab' },
    category: 'modest-fashion',
  },
  'Electronics': {
    originalType: 'Electronics',
    translations: { ar: 'إلكترونيات', he: 'אלקטרוניקה', fr: 'Électronique', de: 'Elektronik' },
    category: 'electronics',
  },
  'Beauty': {
    originalType: 'Beauty',
    translations: { ar: 'الجمال', he: 'יופי', fr: 'Beauté', de: 'Schönheit' },
    category: 'beauty',
  },
  'Sports': {
    originalType: 'Sports',
    translations: { ar: 'رياضة', he: 'ספורט', fr: 'Sport', de: 'Sport' },
    category: 'sports',
  },
};

// Product tag translations
export const TAG_TRANSLATIONS: Record<string, TagTranslation> = {
  'New': {
    originalTag: 'New',
    translations: { ar: 'جديد', he: 'חדש', fr: 'Nouveau', de: 'Neu' },
    category: 'status',
    color: '#00C853',
  },
  'Sale': {
    originalTag: 'Sale',
    translations: { ar: 'تخفيض', he: 'מבצע', fr: 'Soldes', de: 'Angebote' },
    category: 'promotion',
    color: '#FF1744',
  },
  'Bestseller': {
    originalTag: 'Bestseller',
    translations: { ar: 'الأكثر مبيعاً', he: 'רב-מכר', fr: 'Meilleures ventes', de: 'Bestseller' },
    category: 'status',
    color: '#FFD600',
  },
  'Limited Edition': {
    originalTag: 'Limited Edition',
    translations: { ar: 'إصدار محدود', he: 'מהדורה מוגבלת', fr: 'Édition limitée', de: 'Limitierte Auflage' },
    category: 'status',
    color: '#AA00FF',
  },
  'Eco-Friendly': {
    originalTag: 'Eco-Friendly',
    translations: { ar: 'صديق للبيئة', he: 'ידידותי לסביבה', fr: 'Écologique', de: 'Umweltfreundlich' },
    category: 'attribute',
    color: '#00BFA5',
  },
  'Premium': {
    originalTag: 'Premium',
    translations: { ar: 'ممتاز', he: 'פרימיום', fr: 'Premium', de: 'Premium' },
    category: 'quality',
    color: '#FFAB00',
  },
  'Modest': {
    originalTag: 'Modest',
    translations: { ar: 'محتشم', he: 'צנוע', fr: 'Modeste', de: 'Bescheiden' },
    category: 'style',
    color: '#2962FF',
  },
  'Ramadan': {
    originalTag: 'Ramadan',
    translations: { ar: 'رمضان', he: 'רמדאן', fr: 'Ramadan', de: 'Ramadan' },
    category: 'seasonal',
    color: '#1A5F2A',
  },
  'Eid': {
    originalTag: 'Eid',
    translations: { ar: 'عيد', he: 'עיד', fr: 'Aïd', de: 'Fest' },
    category: 'seasonal',
    color: '#2E8B57',
  },
};

/**
 * Translate vendor name
 */
export function translateVendor(
  vendorName: string,
  locale: string,
  options: { includeOriginal?: boolean; useTransliteration?: boolean } = {}
): string {
  const vendor = VENDOR_TRANSLATIONS[vendorName];
  
  if (!vendor) {
    return vendorName;
  }

  let translation = vendor.translations[locale];
  
  if (!translation && options.useTransliteration && vendor.transliteration) {
    translation = vendor.transliteration[locale];
  }

  if (!translation) {
    return vendorName;
  }

  if (vendor.preserveOriginal && options.includeOriginal && locale !== 'en') {
    return `${translation} (${vendorName})`;
  }

  return translation;
}

/**
 * Translate product type
 */
export function translateProductType(type: string, locale: string): string {
  const typeData = PRODUCT_TYPE_TRANSLATIONS[type];
  return typeData?.translations[locale] || type;
}

/**
 * Translate product tag
 */
export function translateTag(tag: string, locale: string): string {
  const tagData = TAG_TRANSLATIONS[tag];
  return tagData?.translations[locale] || tag;
}

/**
 * Get tag styling
 */
export function getTagStyle(tag: string): { color?: string; category?: string } {
  const tagData = TAG_TRANSLATIONS[tag];
  return {
    color: tagData?.color,
    category: tagData?.category,
  };
}

/**
 * Translate multiple tags
 */
export function translateTags(tags: string[], locale: string): string[] {
  return tags.map((tag) => translateTag(tag, locale));
}

/**
 * Check if vendor has translation
 */
export function hasVendorTranslation(vendorName: string, locale: string): boolean {
  const vendor = VENDOR_TRANSLATIONS[vendorName];
  return !!vendor?.translations[locale];
}

/**
 * Add custom vendor translation
 */
export function addVendorTranslation(
  vendorName: string,
  translations: Record<string, string>,
  options: { preserveOriginal?: boolean; transliteration?: Record<string, string> } = {}
): void {
  VENDOR_TRANSLATIONS[vendorName] = {
    originalName: vendorName,
    translations,
    preserveOriginal: options.preserveOriginal ?? true,
    transliteration: options.transliteration,
  };
}

/**
 * Add custom product type translation
 */
export function addProductTypeTranslation(
  type: string,
  translations: Record<string, string>,
  category: string
): void {
  PRODUCT_TYPE_TRANSLATIONS[type] = {
    originalType: type,
    translations,
    category,
  };
}

/**
 * Add custom tag translation
 */
export function addTagTranslation(
  tag: string,
  translations: Record<string, string>,
  options: { category?: string; color?: string } = {}
): void {
  TAG_TRANSLATIONS[tag] = {
    originalTag: tag,
    translations,
    category: options.category,
    color: options.color,
  };
}
