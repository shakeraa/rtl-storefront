/**
 * Sort Order Labels Translation Service
 * T0100: Collection - Sort Order Labels
 */

export interface SortOption {
  value: string;
  label: string;
  labelAr?: string;
  labelHe?: string;
}

// Default Shopify sort options
export const DEFAULT_SORT_OPTIONS: SortOption[] = [
  { value: 'manual', label: 'Featured', labelAr: 'مميز', labelHe: 'מומלץ' },
  { value: 'best-selling', label: 'Best selling', labelAr: 'الأكثر مبيعاً', labelHe: 'הנמכר ביותר' },
  { value: 'title-ascending', label: 'Alphabetically, A-Z', labelAr: 'أبجدياً، أ-ي', labelHe: 'א-ת' },
  { value: 'title-descending', label: 'Alphabetically, Z-A', labelAr: 'أبجدياً، ي-أ', labelHe: 'ת-א' },
  { value: 'price-ascending', label: 'Price, low to high', labelAr: 'السعر: من الأقل للأعلى', labelHe: 'מחיר: נמוך לגבוה' },
  { value: 'price-descending', label: 'Price, high to low', labelAr: 'السعر: من الأعلى للأقل', labelHe: 'מחיר: גבוה לנמוך' },
  { value: 'created-ascending', label: 'Date, old to new', labelAr: 'التاريخ: من القديم للجديد', labelHe: 'תאריך: ישן לחדש' },
  { value: 'created-descending', label: 'Date, new to old', labelAr: 'التاريخ: من الجديد للقديم', labelHe: 'תאריך: חדש לישן' },
];

// RTL-optimized sort options with icons
export const RTL_SORT_OPTIONS: SortOption[] = [
  { value: 'manual', label: 'Featured', labelAr: 'مميز' },
  { value: 'best-selling', label: 'Best Selling', labelAr: 'الأكثر مبيعاً' },
  { value: 'price-ascending', label: 'Price: Low to High', labelAr: 'السعر: من الأقل للأعلى' },
  { value: 'price-descending', label: 'Price: High to Low', labelAr: 'السعر: من الأعلى للأقل' },
  { value: 'title-ascending', label: 'Name: A-Z', labelAr: 'الاسم: أ-ي' },
  { value: 'created-descending', label: 'Newest First', labelAr: 'الأحدث أولاً' },
];

// Fashion-specific sort options
export const FASHION_SORT_OPTIONS: SortOption[] = [
  { value: 'manual', label: 'Featured', labelAr: 'مميز' },
  { value: 'new-arrivals', label: 'New Arrivals', labelAr: 'وصل حديثاً' },
  { value: 'trending', label: 'Trending Now', labelAr: 'الأكثر رواجاً' },
  { value: 'best-selling', label: 'Best Sellers', labelAr: 'الأكثر مبيعاً' },
  { value: 'price-ascending', label: 'Price: Low to High', labelAr: 'السعر: من الأقل للأعلى' },
  { value: 'price-descending', label: 'Price: High to Low', labelAr: 'السعر: من الأعلى للأقل' },
  { value: 'modesty-level', label: 'Modesty Level', labelAr: 'مستوى الاحتشام' },
];

/**
 * Get sort option label for locale
 */
export function getSortLabel(
  value: string,
  locale: 'en' | 'ar' | 'he' = 'en',
  options: SortOption[] = DEFAULT_SORT_OPTIONS
): string {
  const option = options.find((o) => o.value === value);
  if (!option) return value;

  if (locale === 'ar' && option.labelAr) {
    return option.labelAr;
  }
  if (locale === 'he' && option.labelHe) {
    return option.labelHe;
  }
  return option.label;
}

/**
 * Get all sort options for a locale
 */
export function getSortOptionsForLocale(
  locale: 'en' | 'ar' | 'he' = 'en',
  options: SortOption[] = DEFAULT_SORT_OPTIONS
): Array<{ value: string; label: string }> {
  return options.map((option) => ({
    value: option.value,
    label: getSortLabel(option.value, locale, options),
  }));
}

/**
 * Create custom sort options
 */
export function createSortOptions(
  labels: Record<string, { en: string; ar: string; he?: string }>
): SortOption[] {
  return Object.entries(labels).map(([value, label]) => ({
    value,
    label: label.en,
    labelAr: label.ar,
    labelHe: label.he,
  }));
}

/**
 * Sort products by option
 */
export function sortProducts<T extends { [key: string]: unknown }>(
  products: T[],
  sortBy: string,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  const sorted = [...products];

  switch (sortBy) {
    case 'price':
      sorted.sort((a, b) => {
        const priceA = (a.price as number) || 0;
        const priceB = (b.price as number) || 0;
        return direction === 'asc' ? priceA - priceB : priceB - priceA;
      });
      break;

    case 'title':
      sorted.sort((a, b) => {
        const titleA = String(a.title || '').toLowerCase();
        const titleB = String(b.title || '').toLowerCase();
        return direction === 'asc'
          ? titleA.localeCompare(titleB)
          : titleB.localeCompare(titleA);
      });
      break;

    case 'created':
      sorted.sort((a, b) => {
        const dateA = new Date(a.createdAt as string).getTime();
        const dateB = new Date(b.createdAt as string).getTime();
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      });
      break;

    case 'best-selling':
      sorted.sort((a, b) => {
        const salesA = (a.salesCount as number) || 0;
        const salesB = (b.salesCount as number) || 0;
        return salesB - salesA;
      });
      break;

    case 'modesty-level':
      sorted.sort((a, b) => {
        const levels: Record<string, number> = { conservative: 3, moderate: 2, casual: 1 };
        const levelA = levels[a.modestyLevel as string] || 0;
        const levelB = levels[b.modestyLevel as string] || 0;
        return levelB - levelA;
      });
      break;

    default:
      // Manual order - no sorting
      break;
  }

  return sorted;
}
