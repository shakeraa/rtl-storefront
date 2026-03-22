/**
 * Cross-sell Apps Integration Service
 * T0218: Integration - Cross-sell Apps
 * 
 * Provides RTL-friendly cross-sell widget translations, bundle discount messaging,
 * frequently bought together labels, and "Complete the Look" sections.
 */

// Supported cross-sell widget types
export type CrossSellWidgetType = 
  | 'frequentlyBoughtTogether'
  | 'completeTheLook'
  | 'relatedProducts'
  | 'youMayAlsoLike'
  | 'productBundles'
  | 'upsellPopup';

// Cross-sell content structure
export interface CrossSellWidgetContent {
  widgetId: string;
  type: CrossSellWidgetType;
  title: string;
  subtitle?: string;
  items: CrossSellItem[];
  metadata?: {
    discount?: BundleDiscount;
    layout?: 'horizontal' | 'vertical' | 'grid';
    maxItems?: number;
  };
}

// Individual cross-sell item
export interface CrossSellItem {
  productId: string;
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  quantity?: number;
  isMainProduct?: boolean;
  imageUrl?: string;
}

// Bundle discount information
export interface BundleDiscount {
  type: 'percentage' | 'fixed' | 'buyXgetY';
  value: number;
  minQuantity?: number;
  description?: string;
}

// Product for bundle formatting
export interface BundleProduct {
  id: string;
  title: string;
  price: number;
  image?: string;
}

// Cross-sell labels structure
export interface CrossSellLabels {
  widgetTitle: string;
  subtitle?: string;
  addToCart: string;
  totalPrice: string;
  youSave: string;
  bundleDeal: string;
  completeTheLook: string;
  frequentlyBoughtTogether: string;
  relatedProducts: string;
  youMayAlsoLike: string;
  itemCount: string;
  discountBadge: string;
  addAllToCart: string;
}

// RTL locales
const RTL_LOCALES = new Set(['ar', 'he', 'fa', 'ur']);

// Translation dictionaries
const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    addToCart: 'Add to Cart',
    totalPrice: 'Total Price',
    youSave: 'You Save',
    bundleDeal: 'Bundle Deal',
    completeTheLook: 'Complete the Look',
    frequentlyBoughtTogether: 'Frequently Bought Together',
    relatedProducts: 'Related Products',
    youMayAlsoLike: 'You May Also Like',
    item: 'item',
    items: 'items',
    addAllToCart: 'Add All to Cart',
    buyTogether: 'Buy Together',
    savePercent: 'Save {percent}%',
    saveAmount: 'Save {amount}',
    bundleIncludes: 'Bundle includes {count} items',
    totalBundlePrice: 'Bundle Price',
    originalPrice: 'Original Price',
    discountApplied: 'Discount Applied',
    mainItem: 'Main Item',
    addItem: 'Add Item',
    removeItem: 'Remove Item',
  },
  ar: {
    addToCart: 'أضف إلى السلة',
    totalPrice: 'السعر الإجمالي',
    youSave: 'وفّرت',
    bundleDeal: 'عرض الحزمة',
    completeTheLook: 'أكمل إطلالتك',
    frequentlyBoughtTogether: 'اشترى العملاء أيضاً',
    relatedProducts: 'منتجات ذات صلة',
    youMayAlsoLike: 'قد يعجبك أيضاً',
    item: 'منتج',
    items: 'منتجات',
    addAllToCart: 'أضف الكل إلى السلة',
    buyTogether: 'اشتري معاً',
    savePercent: 'وفر {percent}%',
    saveAmount: 'وفر {amount}',
    bundleIncludes: 'الحزمة تشمل {count} منتجات',
    totalBundlePrice: 'سعر الحزمة',
    originalPrice: 'السعر الأصلي',
    discountApplied: 'تم تطبيق الخصم',
    mainItem: 'المنتج الرئيسي',
    addItem: 'إضافة منتج',
    removeItem: 'إزالة منتج',
  },
  he: {
    addToCart: 'הוסף לסל',
    totalPrice: 'מחיר כולל',
    youSave: 'חיסכון של',
    bundleDeal: 'מבצע חבילה',
    completeTheLook: 'השלם את המראה',
    frequentlyBoughtTogether: 'נרכשו יחד לעיתים קרובות',
    relatedProducts: 'מוצרים קשורים',
    youMayAlsoLike: 'ייתכן שתאהב גם',
    item: 'פריט',
    items: 'פריטים',
    addAllToCart: 'הוסף הכל לסל',
    buyTogether: 'קנה יחד',
    savePercent: 'חסוך {percent}%',
    saveAmount: 'חסוך {amount}',
    bundleIncludes: 'החבילה כוללת {count} פריטים',
    totalBundlePrice: 'מחיר החבילה',
    originalPrice: 'מחיר מקורי',
    discountApplied: 'הנחה הופעלה',
    mainItem: 'פריט ראשי',
    addItem: 'הוסף פריט',
    removeItem: 'הסר פריט',
  },
};

// Widget title translations by type
const WIDGET_TITLES: Record<string, Record<CrossSellWidgetType, string>> = {
  en: {
    frequentlyBoughtTogether: 'Frequently Bought Together',
    completeTheLook: 'Complete the Look',
    relatedProducts: 'Related Products',
    youMayAlsoLike: 'You May Also Like',
    productBundles: 'Bundle & Save',
    upsellPopup: 'Upgrade Your Selection',
  },
  ar: {
    frequentlyBoughtTogether: 'اشترى العملاء أيضاً',
    completeTheLook: 'أكمل إطلالتك',
    relatedProducts: 'منتجات ذات صلة',
    youMayAlsoLike: 'قد يعجبك أيضاً',
    productBundles: 'حزمة توفير',
    upsellPopup: 'ترقية اختيارك',
  },
  he: {
    frequentlyBoughtTogether: 'נרכשו יחד לעיתים קרובות',
    completeTheLook: 'השלם את המראה',
    relatedProducts: 'מוצרים קשורים',
    youMayAlsoLike: 'ייתכן שתאהב גם',
    productBundles: 'חבילה והנחה',
    upsellPopup: 'שדרג את הבחירה שלך',
  },
};

/**
 * Check if a locale is RTL
 */
export function isRTLLocale(locale: string): boolean {
  const baseLocale = locale.split('-')[0].toLowerCase();
  return RTL_LOCALES.has(baseLocale);
}

/**
 * Get base locale from locale string (e.g., 'ar-SA' -> 'ar')
 */
function getBaseLocale(locale: string): string {
  return locale.split('-')[0].toLowerCase();
}

/**
 * Get translation for a key
 */
function getTranslation(key: string, locale: string): string {
  const baseLocale = getBaseLocale(locale);
  return TRANSLATIONS[baseLocale]?.[key] ?? TRANSLATIONS['en'][key] ?? key;
}

/**
 * Convert Western numerals to Arabic-Indic numerals
 */
function toArabicNumerals(value: string | number): string {
  const str = String(value);
  return str.replace(/[0-9]/g, (w) => String.fromCharCode(w.charCodeAt(0) + 1584));
}

/**
 * Format a template string with replacements
 */
function formatTemplate(
  template: string, 
  replacements: Record<string, string | number>,
  locale?: string
): string {
  const baseLocale = locale ? getBaseLocale(locale) : 'en';
  const isArabic = baseLocale === 'ar';
  
  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    const formattedValue = isArabic && typeof value === 'number' 
      ? toArabicNumerals(value) 
      : String(value);
    result = result.replace(`{${key}}`, formattedValue);
  }
  return result;
}

/**
 * Translate cross-sell widget content
 */
export function translateCrossSellWidget(
  content: CrossSellWidgetContent,
  locale: string
): CrossSellWidgetContent {
  const baseLocale = getBaseLocale(locale);
  const isRTL = isRTLLocale(locale);
  
  // Get translated title based on widget type
  const widgetTitles = WIDGET_TITLES[baseLocale] ?? WIDGET_TITLES['en'];
  const translatedTitle = widgetTitles[content.type] ?? content.title;
  
  // Translate subtitle if exists
  const translatedSubtitle = content.subtitle 
    ? getTranslation(content.subtitle, locale)
    : undefined;
  
  // Translate items
  const translatedItems = content.items.map(item => ({
    ...item,
    title: item.title,
    description: item.description 
      ? getTranslation(item.description, locale) 
      : undefined,
  }));

  return {
    ...content,
    title: translatedTitle,
    subtitle: translatedSubtitle,
    items: translatedItems,
    metadata: {
      ...content.metadata,
      // Add RTL flag to metadata for layout handling
      layout: content.metadata?.layout ?? (isRTL ? 'horizontal' : 'horizontal'),
    },
  };
}

/**
 * Get all cross-sell labels for a locale
 */
export function getCrossSellLabels(locale: string): CrossSellLabels {
  const baseLocale = getBaseLocale(locale);
  const isRTL = isRTLLocale(locale);
  
  // Add RTL markers for mixed content if needed
  const rtlPrefix = isRTL ? '\u202B' : '';
  const rtlSuffix = isRTL ? '\u202C' : '';
  
  const wrapRTL = (text: string): string => `${rtlPrefix}${text}${rtlSuffix}`;
  
  return {
    widgetTitle: wrapRTL(getTranslation('frequentlyBoughtTogether', locale)),
    subtitle: wrapRTL(getTranslation('buyTogether', locale)),
    addToCart: wrapRTL(getTranslation('addToCart', locale)),
    totalPrice: wrapRTL(getTranslation('totalPrice', locale)),
    youSave: wrapRTL(getTranslation('youSave', locale)),
    bundleDeal: wrapRTL(getTranslation('bundleDeal', locale)),
    completeTheLook: wrapRTL(WIDGET_TITLES[baseLocale]?.completeTheLook ?? WIDGET_TITLES['en'].completeTheLook),
    frequentlyBoughtTogether: wrapRTL(WIDGET_TITLES[baseLocale]?.frequentlyBoughtTogether ?? WIDGET_TITLES['en'].frequentlyBoughtTogether),
    relatedProducts: wrapRTL(WIDGET_TITLES[baseLocale]?.relatedProducts ?? WIDGET_TITLES['en'].relatedProducts),
    youMayAlsoLike: wrapRTL(WIDGET_TITLES[baseLocale]?.youMayAlsoLike ?? WIDGET_TITLES['en'].youMayAlsoLike),
    itemCount: wrapRTL(getTranslation('items', locale)),
    discountBadge: wrapRTL(getTranslation('savePercent', locale).replace('{percent}', '{percent}')),
    addAllToCart: wrapRTL(getTranslation('addAllToCart', locale)),
  };
}

/**
 * Format a bundle offer with proper discount messaging
 */
export function formatBundleOffer(
  products: BundleProduct[],
  discount: BundleDiscount,
  locale: string
): {
  formattedProducts: Array<BundleProduct & { formattedPrice: string; position: number }>;
  totalOriginal: number;
  totalDiscounted: number;
  savingsAmount: number;
  savingsPercent: number;
  discountLabel: string;
  bundleLabel: string;
  direction: 'rtl' | 'ltr';
} {
  const baseLocale = getBaseLocale(locale);
  const isRTL = isRTLLocale(locale);
  
  const totalOriginal = products.reduce((sum, p) => sum + p.price, 0);
  
  // Calculate discount
  let savingsAmount = 0;
  let savingsPercent = 0;
  
  switch (discount.type) {
    case 'percentage':
      savingsPercent = discount.value;
      savingsAmount = (totalOriginal * discount.value) / 100;
      break;
    case 'fixed':
      savingsAmount = discount.value;
      savingsPercent = totalOriginal > 0 ? (discount.value / totalOriginal) * 100 : 0;
      break;
    case 'buyXgetY':
      // Complex calculation for buy X get Y
      savingsAmount = products.length > 1 ? Math.min(...products.map(p => p.price)) : 0;
      savingsPercent = totalOriginal > 0 ? (savingsAmount / totalOriginal) * 100 : 0;
      break;
  }
  
  const totalDiscounted = Math.max(0, totalOriginal - savingsAmount);
  
  // Format products with RTL-friendly positioning
  const formattedProducts = products.map((product, index) => {
    // For RTL, reverse the visual order for horizontal layouts
    const position = isRTL ? products.length - 1 - index : index;
    return {
      ...product,
      formattedPrice: formatPrice(product.price, locale),
      position,
    };
  });
  
  // Sort by position for display
  formattedProducts.sort((a, b) => a.position - b.position);
  
  // Generate discount label
  let discountLabel: string;
  if (discount.type === 'percentage') {
    discountLabel = formatTemplate(
      getTranslation('savePercent', locale),
      { percent: Math.round(savingsPercent) },
      locale
    );
  } else {
    discountLabel = formatTemplate(
      getTranslation('saveAmount', locale),
      { amount: formatPrice(savingsAmount, locale) },
      locale
    );
  }
  
  // Generate bundle label
  const bundleLabel = formatTemplate(
    getTranslation('bundleIncludes', locale),
    { count: products.length },
    locale
  );
  
  return {
    formattedProducts,
    totalOriginal,
    totalDiscounted,
    savingsAmount,
    savingsPercent: Math.round(savingsPercent),
    discountLabel,
    bundleLabel,
    direction: isRTL ? 'rtl' : 'ltr',
  };
}

/**
 * Format price with locale-specific formatting
 */
function formatPrice(price: number, locale: string): string {
  const baseLocale = getBaseLocale(locale);
  
  // Use appropriate number formatting
  const formatter = new Intl.NumberFormat(
    locale === 'ar' ? 'ar-SA' : locale === 'he' ? 'he-IL' : 'en-US',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
  
  return formatter.format(price);
}

/**
 * Get frequently bought together label with dynamic item count
 */
export function getFrequentlyBoughtTogetherLabel(
  count: number,
  locale: string
): {
  title: string;
  subtitle: string;
  itemLabel: string;
  direction: 'rtl' | 'ltr';
  itemCount: number;
} {
  const baseLocale = getBaseLocale(locale);
  const isRTL = isRTLLocale(locale);
  
  const title = WIDGET_TITLES[baseLocale]?.frequentlyBoughtTogether ?? 
                WIDGET_TITLES['en'].frequentlyBoughtTogether;
  
  const subtitle = getTranslation('buyTogether', locale);
  
  // Get correct plural form
  const itemKey = count === 1 ? 'item' : 'items';
  const itemLabel = formatTemplate(
    getTranslation(itemKey, locale),
    { count }
  );
  
  return {
    title,
    subtitle,
    itemLabel,
    direction: isRTL ? 'rtl' : 'ltr',
    itemCount: count,
  };
}

/**
 * Get complete the look section labels
 */
export function getCompleteTheLookLabels(
  locale: string,
  itemCount?: number
): {
  title: string;
  subtitle: string;
  addAllLabel: string;
  direction: 'rtl' | 'ltr';
} {
  const baseLocale = getBaseLocale(locale);
  const isRTL = isRTLLocale(locale);
  
  const title = WIDGET_TITLES[baseLocale]?.completeTheLook ?? 
                WIDGET_TITLES['en'].completeTheLook;
  
  const subtitle = itemCount 
    ? formatTemplate(getTranslation('bundleIncludes', locale), { count: itemCount }, locale)
    : getTranslation('buyTogether', locale);
  
  return {
    title,
    subtitle,
    addAllLabel: getTranslation('addAllToCart', locale),
    direction: isRTL ? 'rtl' : 'ltr',
  };
}

/**
 * Get widget-specific labels
 */
export function getWidgetLabels(
  type: CrossSellWidgetType,
  locale: string
): {
  title: string;
  ctaLabel: string;
  direction: 'rtl' | 'ltr';
} {
  const baseLocale = getBaseLocale(locale);
  const isRTL = isRTLLocale(locale);
  
  const titles = WIDGET_TITLES[baseLocale] ?? WIDGET_TITLES['en'];
  
  const ctaLabels: Record<CrossSellWidgetType, string> = {
    frequentlyBoughtTogether: getTranslation('addAllToCart', locale),
    completeTheLook: getTranslation('addAllToCart', locale),
    relatedProducts: getTranslation('addToCart', locale),
    youMayAlsoLike: getTranslation('addToCart', locale),
    productBundles: getTranslation('addAllToCart', locale),
    upsellPopup: getTranslation('addToCart', locale),
  };
  
  return {
    title: titles[type] ?? titles.relatedProducts,
    ctaLabel: ctaLabels[type],
    direction: isRTL ? 'rtl' : 'ltr',
  };
}

/**
 * Format item list for RTL-friendly display
 */
export function formatRTLProductArrangement<T extends { id: string }>(
  items: T[],
  locale: string
): Array<T & { displayOrder: number; isFirst: boolean; isLast: boolean }> {
  const isRTL = isRTLLocale(locale);
  const total = items.length;
  
  return items.map((item, index) => {
    // For RTL, visual order is reversed
    const displayOrder = isRTL ? total - 1 - index : index;
    
    return {
      ...item,
      displayOrder,
      isFirst: isRTL ? index === total - 1 : index === 0,
      isLast: isRTL ? index === 0 : index === total - 1,
    };
  }).sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Get discount badge text
 */
export function getDiscountBadge(
  discount: BundleDiscount,
  locale: string
): {
  text: string;
  ariaLabel: string;
} {
  let text: string;
  let ariaLabel: string;
  
  switch (discount.type) {
    case 'percentage':
      text = formatTemplate(
        getTranslation('savePercent', locale),
        { percent: discount.value }
      );
      ariaLabel = `Save ${discount.value}%`;
      break;
    case 'fixed':
      text = formatTemplate(
        getTranslation('saveAmount', locale),
        { amount: formatPrice(discount.value, locale) }
      );
      ariaLabel = `Save ${formatPrice(discount.value, locale)}`;
      break;
    case 'buyXgetY':
      text = getTranslation('bundleDeal', locale);
      ariaLabel = 'Special bundle deal';
      break;
    default:
      text = getTranslation('bundleDeal', locale);
      ariaLabel = 'Bundle deal available';
  }
  
  return { text, ariaLabel };
}

/**
 * Calculate and format bundle pricing
 */
export function calculateBundlePricing(
  items: CrossSellItem[],
  discount: BundleDiscount,
  locale: string
): {
  originalTotal: string;
  discountedTotal: string;
  savings: string;
  savingsPercent: number;
  perItemPrice: string;
} {
  const originalTotal = items.reduce((sum, item) => 
    sum + (item.originalPrice ?? item.price) * (item.quantity ?? 1), 0
  );
  
  const itemTotal = items.reduce((sum, item) => 
    sum + item.price * (item.quantity ?? 1), 0
  );
  
  let discountedTotal = itemTotal;
  let savings = 0;
  
  switch (discount.type) {
    case 'percentage':
      savings = (itemTotal * discount.value) / 100;
      discountedTotal = itemTotal - savings;
      break;
    case 'fixed':
      savings = Math.min(discount.value, itemTotal);
      discountedTotal = itemTotal - savings;
      break;
    case 'buyXgetY':
      // Get cheapest item free
      const cheapestItem = items.length > 0 
        ? Math.min(...items.map(i => i.price)) 
        : 0;
      savings = cheapestItem;
      discountedTotal = itemTotal - savings;
      break;
  }
  
  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
  const perItemPrice = totalQuantity > 0 ? discountedTotal / totalQuantity : 0;
  const savingsPercent = originalTotal > 0 ? (savings / originalTotal) * 100 : 0;
  
  return {
    originalTotal: formatPrice(originalTotal, locale),
    discountedTotal: formatPrice(discountedTotal, locale),
    savings: formatPrice(savings, locale),
    savingsPercent: Math.round(savingsPercent),
    perItemPrice: formatPrice(perItemPrice, locale),
  };
}
