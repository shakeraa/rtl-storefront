/**
 * Breadcrumb Labels Translation Service
 * T0142: Breadcrumb - Separator Translation
 * 
 * Provides translations for breadcrumb UI elements including:
 * - Navigation labels (home, back, etc.)
 * - Separators (/, >, ») with RTL-appropriate alternatives
 * - Breadcrumb path generation with localization
 */

export interface BreadcrumbLabels {
  home: string;
  back: string;
  separator: string;
  separatorRTL: string;
  altSeparator: string;
  altSeparatorRTL: string;
  ariaLabel: string;
  ariaCurrent: string;
  collapse: string;
  expand: string;
  navigateTo: string;
  youAreHere: string;
}

export interface BreadcrumbItem {
  name: string;
  nameAr?: string;
  nameHe?: string;
  item: string;
  position: number;
}

// Arabic translations
export const ARABIC_BREADCRUMB_LABELS: BreadcrumbLabels = {
  home: 'الرئيسية',
  back: 'رجوع',
  separator: '/',
  separatorRTL: '\\',
  altSeparator: '«',
  altSeparatorRTL: '»',
  ariaLabel: 'مسار التنقل',
  ariaCurrent: 'الصفحة الحالية',
  collapse: 'طي',
  expand: 'توسيع',
  navigateTo: 'انتقل إلى',
  youAreHere: 'أنت هنا',
};

// Hebrew translations
export const HEBREW_BREADCRUMB_LABELS: BreadcrumbLabels = {
  home: 'בית',
  back: 'חזור',
  separator: '/',
  separatorRTL: '\\',
  altSeparator: '«',
  altSeparatorRTL: '»',
  ariaLabel: 'שביל ניווט',
  ariaCurrent: 'דף נוכחי',
  collapse: 'כווץ',
  expand: 'הרחב',
  navigateTo: 'נווט אל',
  youAreHere: 'אתה כאן',
};

// English translations (default)
export const ENGLISH_BREADCRUMB_LABELS: BreadcrumbLabels = {
  home: 'Home',
  back: 'Back',
  separator: '/',
  separatorRTL: '\\',
  altSeparator: '>',
  altSeparatorRTL: '<',
  ariaLabel: 'Breadcrumb',
  ariaCurrent: 'Current page',
  collapse: 'Collapse',
  expand: 'Expand',
  navigateTo: 'Navigate to',
  youAreHere: 'You are here',
};

// Labels by locale
const LABELS_BY_LOCALE: Record<string, BreadcrumbLabels> = {
  ar: ARABIC_BREADCRUMB_LABELS,
  he: HEBREW_BREADCRUMB_LABELS,
  en: ENGLISH_BREADCRUMB_LABELS,
};

// Separator styles
export const SEPARATOR_STYLES = {
  slash: '/',
  backslash: '\\',
  arrow: '>',
  arrowLeft: '<',
  doubleArrow: '»',
  doubleArrowLeft: '«',
  bullet: '•',
  dash: '-',
  pipe: '|',
  caret: '›',
  caretLeft: '‹',
  raquo: '»',
  laquo: '«',
} as const;

export type SeparatorStyle = keyof typeof SEPARATOR_STYLES;

/**
 * Check if a locale is RTL
 */
export function isRTLLocale(locale: string): boolean {
  const rtlLocales = ['ar', 'he', 'fa', 'ur', 'yi', 'dv'];
  const normalizedLocale = locale.split('-')[0]?.toLowerCase() || 'en';
  return rtlLocales.includes(normalizedLocale);
}

/**
 * Get breadcrumb labels for a locale
 */
export function getBreadcrumbLabels(locale: string): BreadcrumbLabels {
  const normalizedLocale = locale.split('-')[0]?.toLowerCase() || 'en';
  return LABELS_BY_LOCALE[normalizedLocale] || ENGLISH_BREADCRUMB_LABELS;
}

/**
 * Get a specific breadcrumb label by key
 */
export function getBreadcrumbLabel(
  key: keyof BreadcrumbLabels,
  locale: string
): string {
  const labels = getBreadcrumbLabels(locale);
  return labels[key] || ENGLISH_BREADCRUMB_LABELS[key];
}

/**
 * Get appropriate separator for locale
 * Returns RTL-appropriate separator for RTL locales
 */
export function getSeparator(locale: string, style?: SeparatorStyle): string {
  const isRTL = isRTLLocale(locale);
  
  if (style) {
    const separator = SEPARATOR_STYLES[style];
    // For RTL locales, try to use RTL-appropriate version
    if (isRTL) {
      if (style === 'arrow') return SEPARATOR_STYLES.arrowLeft;
      if (style === 'doubleArrow') return SEPARATOR_STYLES.doubleArrowLeft;
      if (style === 'caret') return SEPARATOR_STYLES.caretLeft;
      if (style === 'raquo') return SEPARATOR_STYLES.laquo;
    }
    return separator;
  }
  
  // Default separator based on locale direction
  const labels = getBreadcrumbLabels(locale);
  return isRTL ? labels.separatorRTL : labels.separator;
}

/**
 * Get alternative separator (for secondary breadcrumb styles)
 */
export function getAltSeparator(locale: string): string {
  const isRTL = isRTLLocale(locale);
  const labels = getBreadcrumbLabels(locale);
  return isRTL ? labels.altSeparatorRTL : labels.altSeparator;
}

/**
 * Format breadcrumb path with appropriate separators
 */
export function formatBreadcrumbPath(
  items: Array<{ name: string; item?: string }>,
  locale: string,
  style?: SeparatorStyle
): string {
  const separator = getSeparator(locale, style);
  return items.map((item) => item.name).join(` ${separator} `);
}

/**
 * Generate breadcrumb items with translations
 */
export function getBreadcrumbPath(
  items: BreadcrumbItem[],
  locale: string
): Array<{ name: string; item: string; position: number }> {
  return items.map((item) => ({
    name: getTranslatedItemName(item, locale),
    item: item.item,
    position: item.position,
  }));
}

/**
 * Get translated item name based on locale
 */
function getTranslatedItemName(item: BreadcrumbItem, locale: string): string {
  if (locale === 'ar' && item.nameAr) {
    return item.nameAr;
  }
  if (locale === 'he' && item.nameHe) {
    return item.nameHe;
  }
  
  // Check for common translations
  const commonTranslation = COMMON_BREADCRUMB_NAMES[item.name]?.[locale];
  if (commonTranslation) {
    return commonTranslation;
  }
  
  return item.name;
}

// Common breadcrumb name translations
export const COMMON_BREADCRUMB_NAMES: Record<string, Record<string, string>> = {
  'Home': { ar: 'الرئيسية', he: 'בית', fr: 'Accueil', de: 'Startseite' },
  'Products': { ar: 'المنتجات', he: 'מוצרים', fr: 'Produits', de: 'Produkte' },
  'Collections': { ar: 'المجموعات', he: 'אוספים', fr: 'Collections', de: 'Kollektionen' },
  'Pages': { ar: 'الصفحات', he: 'דפים', fr: 'Pages', de: 'Seiten' },
  'Blog': { ar: 'المدونة', he: 'בלוג', fr: 'Blog', de: 'Blog' },
  'Search': { ar: 'بحث', he: 'חיפוש', fr: 'Recherche', de: 'Suche' },
  'Cart': { ar: 'عربة التسوق', he: 'עגלה', fr: 'Panier', de: 'Warenkorb' },
  'Checkout': { ar: 'الدفع', he: 'תשלום', fr: 'Paiement', de: 'Kasse' },
  'Account': { ar: 'الحساب', he: 'חשבון', fr: 'Compte', de: 'Konto' },
  'Contact': { ar: 'اتصل بنا', he: 'צור קשר', fr: 'Contact', de: 'Kontakt' },
  'About': { ar: 'عن الشركة', he: 'אודות', fr: 'À propos', de: 'Über uns' },
  'FAQ': { ar: 'الأسئلة الشائعة', he: 'שאלות נפוצות', fr: 'FAQ', de: 'FAQ' },
  'Help': { ar: 'المساعدة', he: 'עזרה', fr: 'Aide', de: 'Hilfe' },
  'Support': { ar: 'الدعم', he: 'תמיכה', fr: 'Support', de: 'Support' },
  'Store': { ar: 'المتجر', he: 'חנות', fr: 'Boutique', de: 'Geschäft' },
  'Category': { ar: 'الفئة', he: 'קטגוריה', fr: 'Catégorie', de: 'Kategorie' },
};

/**
 * Generate HTML for breadcrumb navigation
 */
export function renderBreadcrumbHTML(
  items: BreadcrumbItem[],
  locale: string,
  options?: {
    separatorStyle?: SeparatorStyle;
    showHome?: boolean;
    homeUrl?: string;
    className?: string;
  }
): string {
  const isRTL = isRTLLocale(locale);
  const labels = getBreadcrumbLabels(locale);
  const separator = getSeparator(locale, options?.separatorStyle);
  const { showHome = true, homeUrl = '/', className = 'breadcrumb' } = options || {};
  
  let breadcrumbItems = [...items];
  
  // Add home item if needed
  if (showHome && breadcrumbItems[0]?.name !== 'Home') {
    breadcrumbItems.unshift({
      name: 'Home',
      nameAr: 'الرئيسية',
      nameHe: 'בית',
      item: homeUrl,
      position: 1,
    });
  }
  
  const listItems = breadcrumbItems.map((item, index) => {
    const name = getTranslatedItemName(item, locale);
    const isLast = index === breadcrumbItems.length - 1;
    
    if (isLast) {
      return `    <li class="${className}__item ${className}__item--current" aria-current="page">
      <span>${name}</span>
    </li>`;
    }
    
    return `    <li class="${className}__item">
      <a href="${item.item}" class="${className}__link">${name}</a>
      <span class="${className}__separator" aria-hidden="true">${separator}</span>
    </li>`;
  }).join('\n');
  
  return `<nav aria-label="${labels.ariaLabel}" class="${className}" dir="${isRTL ? 'rtl' : 'ltr'}">
  <ol class="${className}__list">
${listItems}
  </ol>
</nav>`;
}

/**
 * Get breadcrumb navigation data for structured data/schema
 */
export function getBreadcrumbStructuredData(
  items: BreadcrumbItem[],
  locale: string,
  baseUrl: string
): {
  '@context': string;
  '@type': string;
  itemListElement: Array<{
    '@type': string;
    position: number;
    name: string;
    item: string;
  }>;
} {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: getTranslatedItemName(item, locale),
      item: item.item.startsWith('http') ? item.item : `${baseUrl}${item.item}`,
    })),
  };
}

/**
 * Collapse breadcrumb items for mobile display
 */
export function collapseBreadcrumbs(
  items: BreadcrumbItem[],
  maxItems: number = 3
): Array<BreadcrumbItem | { name: string; item: string; position: number; isCollapsed: true }> {
  if (items.length <= maxItems) {
    return items;
  }
  
  // Always keep first and last item only, collapse everything in between
  const firstItem = items[0];
  const lastItem = items[items.length - 1];
  
  return [
    firstItem,
    {
      name: '...',
      item: '#',
      position: 2,
      isCollapsed: true as const,
    },
    {
      ...lastItem,
      position: 3,
    },
  ];
}

/**
 * Get back navigation data
 */
export function getBackNavigation(
  items: BreadcrumbItem[],
  locale: string
): { label: string; url: string; available: boolean } {
  const labels = getBreadcrumbLabels(locale);
  
  if (items.length < 2) {
    return { label: labels.back, url: '/', available: false };
  }
  
  // Get parent item (second to last)
  const parentItem = items[items.length - 2];
  return {
    label: `${labels.back}: ${getTranslatedItemName(parentItem, locale)}`,
    url: parentItem.item,
    available: true,
  };
}

/**
 * Add custom breadcrumb name translation
 */
export function addBreadcrumbNameTranslation(
  key: string,
  translations: Record<string, string>
): void {
  COMMON_BREADCRUMB_NAMES[key] = { ...COMMON_BREADCRUMB_NAMES[key], ...translations };
}

/**
 * Get all available separator styles
 */
export function getAvailableSeparators(): Array<{ key: SeparatorStyle; symbol: string; name: string }> {
  return [
    { key: 'slash', symbol: '/', name: 'Slash' },
    { key: 'backslash', symbol: '\\', name: 'Backslash' },
    { key: 'arrow', symbol: '>', name: 'Arrow' },
    { key: 'doubleArrow', symbol: '»', name: 'Double Arrow' },
    { key: 'bullet', symbol: '•', name: 'Bullet' },
    { key: 'dash', symbol: '-', name: 'Dash' },
    { key: 'pipe', symbol: '|', name: 'Pipe' },
    { key: 'caret', symbol: '›', name: 'Caret' },
    { key: 'raquo', symbol: '»', name: 'Right-Pointing Angle' },
  ];
}

/**
 * Validate breadcrumb items
 */
export function validateBreadcrumbItems(items: BreadcrumbItem[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!Array.isArray(items) || items.length === 0) {
    errors.push('Breadcrumb items must be a non-empty array');
    return { valid: false, errors };
  }
  
  items.forEach((item, index) => {
    if (!item.name) {
      errors.push(`Item at index ${index} is missing a name`);
    }
    if (!item.item) {
      errors.push(`Item at index ${index} is missing an item URL`);
    }
    if (typeof item.position !== 'number' || item.position < 1) {
      errors.push(`Item at index ${index} has an invalid position`);
    }
  });
  
  // Check for sequential positions
  const positions = items.map((item) => item.position).sort((a, b) => a - b);
  for (let i = 0; i < positions.length; i++) {
    if (positions[i] !== i + 1) {
      errors.push('Breadcrumb positions should be sequential starting from 1');
      break;
    }
  }
  
  return { valid: errors.length === 0, errors };
}
