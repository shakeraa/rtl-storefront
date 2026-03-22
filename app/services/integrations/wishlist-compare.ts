/**
 * Wishlist & Compare Integration Service
 * T0209 - Wishlist Apps Translation
 * T0210 - Compare Apps Translation
 */

export interface WishlistContent {
  buttonText: string;
  emptyMessage: string;
  pageTitle: string;
  shareText: string;
  locale: string;
}

export interface CompareContent {
  buttonText: string;
  pageTitle: string;
  emptyMessage: string;
  maxItemsMessage: string;
  locale: string;
}

export const WISHLIST_TRANSLATIONS: Record<string, WishlistContent> = {
  en: { buttonText: 'Add to Wishlist', emptyMessage: 'Your wishlist is empty', pageTitle: 'My Wishlist', shareText: 'Share Wishlist', locale: 'en' },
  ar: { buttonText: 'أضف إلى المفضلة', emptyMessage: 'قائمة المفضلة فارغة', pageTitle: 'المفضلة', shareText: 'شارك المفضلة', locale: 'ar' },
  he: { buttonText: 'הוסף למועדפים', emptyMessage: 'רשימת המועדפים ריקה', pageTitle: 'המועדפים שלי', shareText: 'שתף מועדפים', locale: 'he' },
};

export const COMPARE_TRANSLATIONS: Record<string, CompareContent> = {
  en: { buttonText: 'Compare', pageTitle: 'Compare Products', emptyMessage: 'No products to compare', maxItemsMessage: 'Maximum 4 products', locale: 'en' },
  ar: { buttonText: 'قارن', pageTitle: 'مقارنة المنتجات', emptyMessage: 'لا توجد منتجات للمقارنة', maxItemsMessage: 'الحد الأقصى 4 منتجات', locale: 'ar' },
  he: { buttonText: 'השווה', pageTitle: 'השוואת מוצרים', emptyMessage: 'אין מוצרים להשוואה', maxItemsMessage: 'מקסימום 4 מוצרים', locale: 'he' },
};

export function getWishlistTranslation(locale: string): WishlistContent {
  return WISHLIST_TRANSLATIONS[locale] ?? WISHLIST_TRANSLATIONS.en;
}

export function getCompareTranslation(locale: string): CompareContent {
  return COMPARE_TRANSLATIONS[locale] ?? COMPARE_TRANSLATIONS.en;
}

export function getWishlistTranslatableFields(): string[] {
  return ['buttonText', 'emptyMessage', 'pageTitle', 'shareText', 'removeText', 'addedNotification'];
}

export function getCompareTranslatableFields(): string[] {
  return ['buttonText', 'pageTitle', 'emptyMessage', 'maxItemsMessage', 'featureLabel', 'differenceLabel'];
}
