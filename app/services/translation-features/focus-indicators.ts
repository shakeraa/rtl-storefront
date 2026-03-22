/**
 * Focus Indicators Translation Service
 * Provides translated labels and announcements for focus management
 * Supports Arabic (ar), Hebrew (he), and English (en) locales
 */

export type SupportedLocale = 'ar' | 'he' | 'en' | 'ar-SA' | 'ar-EG' | 'he-IL';

export interface FocusIndicatorLabels {
  /** Skip to main content link text */
  skipToContent: string;
  /** Skip to navigation link text */
  skipToNavigation: string;
  /** Skip to search link text */
  skipToSearch: string;
  /** Skip to footer link text */
  skipToFooter: string;
  /** Skip to products section */
  skipToProducts: string;
  /** Skip to cart section */
  skipToCart: string;
  /** Focus visible indicator label */
  focusVisible: string;
  /** Focus trapped notification */
  focusTrapped: string;
  /** Focus returned notification */
  focusReturned: string;
  /** Element in focus label */
  currentlyFocused: string;
  /** Focus moved announcement */
  focusMoved: string;
  /** Focus mode active */
  keyboardMode: string;
  /** Mouse mode active */
  mouseMode: string;
  /** Focus ring visible */
  focusRingVisible: string;
  /** Focus ring hidden */
  focusRingHidden: string;
}

export interface SkipLinkTarget {
  /** Target element ID */
  id: string;
  /** Target section name (for translation lookup) */
  section: 'content' | 'navigation' | 'search' | 'footer' | 'products' | 'cart' | 'main' | 'header' | 'filters' | 'sort' | 'pagination';
}

export interface FocusChangeContext {
  /** Previous focused element description */
  fromElement: string;
  /** New focused element description */
  toElement: string;
  /** Element type (button, link, input, etc.) */
  elementType?: string;
  /** Section name */
  section?: string;
}

/** Arabic focus indicator labels */
export const ARABIC_FOCUS_LABELS: FocusIndicatorLabels = {
  skipToContent: 'تخطى إلى المحتوى الرئيسي',
  skipToNavigation: 'تخطى إلى القائمة',
  skipToSearch: 'تخطى إلى البحث',
  skipToFooter: 'تخطى إلى تذييل الصفحة',
  skipToProducts: 'تخطى إلى المنتجات',
  skipToCart: 'تخطى إلى سلة التسوق',
  focusVisible: 'مؤشر التركيز مرئي',
  focusTrapped: 'التركيز محبوس في النافذة المنبثقة',
  focusReturned: 'تم إرجاع التركيز إلى العنصر السابق',
  currentlyFocused: 'العنصر الحالي في التركيز',
  focusMoved: 'تم نقل التركيز',
  keyboardMode: 'وضع لوحة المفاتيح نشط',
  mouseMode: 'وضع الماوس نشط',
  focusRingVisible: 'حلقة التركيز مرئية',
  focusRingHidden: 'حلقة التركيز مخفية',
};

/** Hebrew focus indicator labels */
export const HEBREW_FOCUS_LABELS: FocusIndicatorLabels = {
  skipToContent: 'דלג לתוכן הראשי',
  skipToNavigation: 'דלג לתפריט הניווט',
  skipToSearch: 'דלג לחיפוש',
  skipToFooter: 'דלג לכותרת תחתונה',
  skipToProducts: 'דלג למוצרים',
  skipToCart: 'דלג לעגלת הקניות',
  focusVisible: 'מחוון המיקוד גלוי',
  focusTrapped: 'המיקוד לכוד בחלון קופץ',
  focusReturned: 'המיקוד חזר לרכיב הקודם',
  currentlyFocused: 'הרכיב הנוכחי במיקוד',
  focusMoved: 'המיקוד הועבר',
  keyboardMode: 'מצב מקלדת פעיל',
  mouseMode: 'מצב עכבר פעיל',
  focusRingVisible: 'טבעת המיקוד גלויה',
  focusRingHidden: 'טבעת המיקוד מוסתרת',
};

/** English focus indicator labels */
export const ENGLISH_FOCUS_LABELS: FocusIndicatorLabels = {
  skipToContent: 'Skip to main content',
  skipToNavigation: 'Skip to navigation',
  skipToSearch: 'Skip to search',
  skipToFooter: 'Skip to footer',
  skipToProducts: 'Skip to products',
  skipToCart: 'Skip to cart',
  focusVisible: 'Focus indicator visible',
  focusTrapped: 'Focus trapped in modal',
  focusReturned: 'Focus returned to previous element',
  currentlyFocused: 'Currently focused element',
  focusMoved: 'Focus moved',
  keyboardMode: 'Keyboard mode active',
  mouseMode: 'Mouse mode active',
  focusRingVisible: 'Focus ring visible',
  focusRingHidden: 'Focus ring hidden',
};

/** Skip link text variations by target section */
const SKIP_LINK_TEXT: Record<string, Record<SupportedLocale, string>> = {
  content: {
    ar: 'تخطى إلى المحتوى الرئيسي',
    'ar-SA': 'تخطى إلى المحتوى الرئيسي',
    'ar-EG': 'تخطى إلى المحتوى الرئيسي',
    he: 'דלג לתוכן הראשי',
    'he-IL': 'דלג לתוכן הראשי',
    en: 'Skip to main content',
  },
  navigation: {
    ar: 'تخطى إلى القائمة',
    'ar-SA': 'تخطى إلى القائمة',
    'ar-EG': 'تخطى إلى القائمة',
    he: 'דלג לתפריט הניווט',
    'he-IL': 'דלג לתפריט הניווט',
    en: 'Skip to navigation',
  },
  search: {
    ar: 'تخطى إلى البحث',
    'ar-SA': 'تخطى إلى البحث',
    'ar-EG': 'تخطى إلى البحث',
    he: 'דלג לחיפוש',
    'he-IL': 'דלג לחיפוש',
    en: 'Skip to search',
  },
  footer: {
    ar: 'تخطى إلى تذييل الصفحة',
    'ar-SA': 'تخطى إلى تذييل الصفحة',
    'ar-EG': 'تخطى إلى تذييل الصفحة',
    he: 'דלג לכותרת תחתונה',
    'he-IL': 'דלג לכותרת תחתונה',
    en: 'Skip to footer',
  },
  products: {
    ar: 'تخطى إلى المنتجات',
    'ar-SA': 'تخطى إلى المنتجات',
    'ar-EG': 'تخطى إلى المنتجات',
    he: 'דלג למוצרים',
    'he-IL': 'דלג למוצרים',
    en: 'Skip to products',
  },
  cart: {
    ar: 'تخطى إلى سلة التسوق',
    'ar-SA': 'تخطى إلى سلة التسوق',
    'ar-EG': 'تخطى إلى سلة التسوق',
    he: 'דלג לעגלת הקניות',
    'he-IL': 'דלג לעגלת הקניות',
    en: 'Skip to cart',
  },
  main: {
    ar: 'تخطى إلى المحتوى الرئيسي',
    'ar-SA': 'تخطى إلى المحتوى الرئيسي',
    'ar-EG': 'تخطى إلى المحتوى الرئيسي',
    he: 'דלג לתוכן הראשי',
    'he-IL': 'דלג לתוכן הראשי',
    en: 'Skip to main content',
  },
  header: {
    ar: 'تخطى إلى الرأس',
    'ar-SA': 'تخطى إلى الرأس',
    'ar-EG': 'تخطى إلى الرأس',
    he: 'דלג לכותרת עליונה',
    'he-IL': 'דלג לכותרת עליונה',
    en: 'Skip to header',
  },
  filters: {
    ar: 'تخطى إلى الفلاتر',
    'ar-SA': 'تخطى إلى الفلاتر',
    'ar-EG': 'تخطى إلى الفلاتر',
    he: 'דלג למסננים',
    'he-IL': 'דלג למסננים',
    en: 'Skip to filters',
  },
  sort: {
    ar: 'تخطى إلى الترتيب',
    'ar-SA': 'تخطى إلى الترتيب',
    'ar-EG': 'تخطى إلى الترتيب',
    he: 'דלג למיון',
    'he-IL': 'דלג למיון',
    en: 'Skip to sorting',
  },
  pagination: {
    ar: 'تخطى إلى ترقيم الصفحات',
    'ar-SA': 'تخطى إلى ترقيم الصفحات',
    'ar-EG': 'تخطى إلى ترقيم الصفحات',
    he: 'דלג לדפדוף',
    'he-IL': 'דלג לדפדוף',
    en: 'Skip to pagination',
  },
};

/** Focus change announcement templates */
const FOCUS_CHANGE_TEMPLATES: Record<string, Record<SupportedLocale, string>> = {
  movedTo: {
    ar: 'تم نقل التركيز إلى {{element}}',
    'ar-SA': 'تم نقل التركيز إلى {{element}}',
    'ar-EG': 'تم نقل التركيز إلى {{element}}',
    he: 'המיקוד הועבר אל {{element}}',
    'he-IL': 'המיקוד הועבר אל {{element}}',
    en: 'Focus moved to {{element}}',
  },
  movedFromTo: {
    ar: 'تم نقل التركيز من {{from}} إلى {{to}}',
    'ar-SA': 'تم نقل التركيز من {{from}} إلى {{to}}',
    'ar-EG': 'تم نقل التركيز من {{from}} إلى {{to}}',
    he: 'המיקוד הועבר מ{{from}} אל {{to}}',
    'he-IL': 'המיקוד הועבר מ{{from}} אל {{to}}',
    en: 'Focus moved from {{from}} to {{to}}',
  },
  enteredSection: {
    ar: 'تم دخول قسم {{section}}',
    'ar-SA': 'تم دخول قسم {{section}}',
    'ar-EG': 'تم دخول قسم {{section}}',
    he: 'נכנסת ל{{section}}',
    'he-IL': 'נכנסת ל{{section}}',
    en: 'Entered {{section}} section',
  },
  leftSection: {
    ar: 'تم مغادرة قسم {{section}}',
    'ar-SA': 'تم مغادرة قسم {{section}}',
    'ar-EG': 'تم مغادرة قسم {{section}}',
    he: 'יצאת מה{{section}}',
    'he-IL': 'יצאת מה{{section}}',
    en: 'Left {{section}} section',
  },
};

/** Element type translations for focus announcements */
const ELEMENT_TYPE_NAMES: Record<string, Record<SupportedLocale, string>> = {
  button: {
    ar: 'زر',
    'ar-SA': 'زر',
    'ar-EG': 'زر',
    he: 'כפתור',
    'he-IL': 'כפתור',
    en: 'button',
  },
  link: {
    ar: 'رابط',
    'ar-SA': 'رابط',
    'ar-EG': 'رابط',
    he: 'קישור',
    'he-IL': 'קישור',
    en: 'link',
  },
  input: {
    ar: 'حقل إدخال',
    'ar-SA': 'حقل إدخال',
    'ar-EG': 'حقل إدخال',
    he: 'שדה קלט',
    'he-IL': 'שדה קלט',
    en: 'input field',
  },
  checkbox: {
    ar: 'مربع اختيار',
    'ar-SA': 'مربع اختيار',
    'ar-EG': 'مربع اختيار',
    he: 'תיבת סימון',
    'he-IL': 'תיבת סימון',
    en: 'checkbox',
  },
  radio: {
    ar: 'زر اختيار',
    'ar-SA': 'زر اختيار',
    'ar-EG': 'زر اختيار',
    he: 'כפתור בחירה',
    'he-IL': 'כפתור בחירה',
    en: 'radio button',
  },
  select: {
    ar: 'قائمة منسدلة',
    'ar-SA': 'قائمة منسدلة',
    'ar-EG': 'قائمة منسدلة',
    he: 'תפריט נפתח',
    'he-IL': 'תפריט נפתח',
    en: 'dropdown',
  },
  textarea: {
    ar: 'منطقة نص',
    'ar-SA': 'منطقة نص',
    'ar-EG': 'منطقة نص',
    he: 'אזור טקסט',
    'he-IL': 'אזור טקסט',
    en: 'text area',
  },
  menuitem: {
    ar: 'عنصر قائمة',
    'ar-SA': 'عنصر قائمة',
    'ar-EG': 'عنصر قائمة',
    he: 'פריט תפריט',
    'he-IL': 'פריט תפריט',
    en: 'menu item',
  },
  tab: {
    ar: 'علامة تبويب',
    'ar-SA': 'علامة تبويب',
    'ar-EG': 'علامة تبويب',
    he: 'לשונית',
    'he-IL': 'לשונית',
    en: 'tab',
  },
  dialog: {
    ar: 'حوار',
    'ar-SA': 'حوار',
    'ar-EG': 'حوار',
    he: 'דו-שיח',
    'he-IL': 'דו-שיח',
    en: 'dialog',
  },
};

/** Section name translations */
const SECTION_NAMES: Record<string, Record<SupportedLocale, string>> = {
  navigation: {
    ar: 'التنقل',
    'ar-SA': 'التنقل',
    'ar-EG': 'التنقل',
    he: 'ניווט',
    'he-IL': 'ניווט',
    en: 'navigation',
  },
  main: {
    ar: 'المحتوى الرئيسي',
    'ar-SA': 'المحتوى الرئيسي',
    'ar-EG': 'المحتوى الرئيسي',
    he: 'תוכן ראשי',
    'he-IL': 'תוכן ראשי',
    en: 'main content',
  },
  sidebar: {
    ar: 'الشريط الجانبي',
    'ar-SA': 'الشريط الجانبي',
    'ar-EG': 'الشريط الجانبي',
    he: 'סרגל צד',
    'he-IL': 'סרגל צד',
    en: 'sidebar',
  },
  footer: {
    ar: 'تذييل الصفحة',
    'ar-SA': 'تذييل الصفحة',
    'ar-EG': 'تذييل الصفحة',
    he: 'כותרת תחתונה',
    'he-IL': 'כותרת תחתונה',
    en: 'footer',
  },
  header: {
    ar: 'رأس الصفحة',
    'ar-SA': 'رأس الصفحة',
    'ar-EG': 'رأس الصفحة',
    he: 'כותרת עליונה',
    'he-IL': 'כותרת עליונה',
    en: 'header',
  },
  search: {
    ar: 'البحث',
    'ar-SA': 'البحث',
    'ar-EG': 'البحث',
    he: 'חיפוש',
    'he-IL': 'חיפוש',
    en: 'search',
  },
  cart: {
    ar: 'سلة التسوق',
    'ar-SA': 'سلة التسوق',
    'ar-EG': 'سلة التسوق',
    he: 'עגלת קניות',
    'he-IL': 'עגלת קניות',
    en: 'shopping cart',
  },
  products: {
    ar: 'المنتجات',
    'ar-SA': 'المنتجات',
    'ar-EG': 'المنتجات',
    he: 'מוצרים',
    'he-IL': 'מוצרים',
    en: 'products',
  },
  filters: {
    ar: 'الفلاتر',
    'ar-SA': 'الفلاتر',
    'ar-EG': 'الفلاتر',
    he: 'מסננים',
    'he-IL': 'מסננים',
    en: 'filters',
  },
};

/**
 * Normalize locale to base form
 */
function normalizeLocale(locale: string): SupportedLocale {
  if (locale.startsWith('ar')) return 'ar';
  if (locale.startsWith('he')) return 'he';
  return 'en';
}

/**
 * Get the appropriate label set for a locale
 */
function getLabelSet(locale: SupportedLocale): FocusIndicatorLabels {
  const normalized = normalizeLocale(locale);
  switch (normalized) {
    case 'ar':
      return ARABIC_FOCUS_LABELS;
    case 'he':
      return HEBREW_FOCUS_LABELS;
    default:
      return ENGLISH_FOCUS_LABELS;
  }
}

/**
 * Get all focus indicator labels for a locale
 * @param locale - The locale code (ar, he, en)
 * @returns Complete set of focus indicator labels
 */
export function getFocusLabels(locale: SupportedLocale): FocusIndicatorLabels {
  return getLabelSet(locale);
}

/**
 * Get a specific focus indicator label for an element type
 * @param element - The element type or label key
 * @param locale - The locale code
 * @returns The translated label
 */
export function getFocusIndicatorLabel(
  element: keyof FocusIndicatorLabels | string,
  locale: SupportedLocale
): string {
  const labels = getLabelSet(locale);
  return labels[element as keyof FocusIndicatorLabels] || String(element);
}

/**
 * Get skip link text for a target section
 * @param target - The target section or SkipLinkTarget object
 * @param locale - The locale code
 * @returns The translated skip link text
 */
export function getSkipLinkText(
  target: SkipLinkTarget | string,
  locale: SupportedLocale
): string {
  const normalizedLocale = normalizeLocale(locale);
  const section = typeof target === 'string' ? target : target.section;
  
  const linkTexts = SKIP_LINK_TEXT[section];
  if (linkTexts) {
    return linkTexts[normalizedLocale] || linkTexts['en'];
  }
  
  // Fallback to generic skip message
  const labels = getLabelSet(locale);
  return `${labels.skipToContent} (${section})`;
}

/**
 * Replace template placeholders with values
 */
function replaceTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => values[key] || match);
}

/**
 * Get element type name in the specified locale
 */
function getElementTypeName(elementType: string, locale: SupportedLocale): string {
  const normalizedLocale = normalizeLocale(locale);
  const names = ELEMENT_TYPE_NAMES[elementType];
  if (names) {
    return names[normalizedLocale] || names['en'];
  }
  return elementType;
}

/**
 * Get section name in the specified locale
 */
function getSectionName(section: string, locale: SupportedLocale): string {
  const normalizedLocale = normalizeLocale(locale);
  const names = SECTION_NAMES[section];
  if (names) {
    return names[normalizedLocale] || names['en'];
  }
  return section;
}

/**
 * Generate a focus change announcement
 * @param from - Previous element description or FocusChangeContext
 * @param to - New element description (optional if from is FocusChangeContext)
 * @param locale - The locale code
 * @returns The translated focus change announcement
 */
export function getFocusAnnouncement(
  from: string | FocusChangeContext,
  to?: string | SupportedLocale,
  locale?: SupportedLocale
): string {
  // Handle overloaded signature
  let context: FocusChangeContext;
  let targetLocale: SupportedLocale;
  
  if (typeof from === 'object') {
    context = from;
    targetLocale = to as SupportedLocale || 'en';
  } else {
    context = {
      fromElement: from,
      toElement: to as string,
    };
    targetLocale = locale || 'en';
  }
  
  const normalizedLocale = normalizeLocale(targetLocale);
  
  // If we have section information, use section-based announcement
  if (context.section) {
    const sectionName = getSectionName(context.section, normalizedLocale);
    const template = FOCUS_CHANGE_TEMPLATES.enteredSection[normalizedLocale];
    return replaceTemplate(template, { section: sectionName });
  }
  
  // If we have both from and to, use movedFromTo template
  if (context.fromElement && context.toElement) {
    const template = FOCUS_CHANGE_TEMPLATES.movedFromTo[normalizedLocale];
    return replaceTemplate(template, {
      from: context.fromElement,
      to: context.toElement,
    });
  }
  
  // If we only have toElement, use movedTo template
  if (context.toElement) {
    const template = FOCUS_CHANGE_TEMPLATES.movedTo[normalizedLocale];
    return replaceTemplate(template, { element: context.toElement });
  }
  
  // Fallback
  return getLabelSet(normalizedLocale).focusMoved;
}

/**
 * Check if locale is RTL
 * @param locale - The locale code
 * @returns True if RTL locale
 */
export function isRTLLocale(locale: string): boolean {
  return locale.startsWith('ar') || locale.startsWith('he');
}

/**
 * Get focus visibility announcement
 * @param visible - Whether focus is visible
 * @param locale - The locale code
 * @returns The translated announcement
 */
export function getFocusVisibilityAnnouncement(
  visible: boolean,
  locale: SupportedLocale
): string {
  const labels = getLabelSet(locale);
  return visible ? labels.focusRingVisible : labels.focusRingHidden;
}

/**
 * Get input mode announcement
 * @param mode - The input mode ('keyboard' or 'mouse')
 * @param locale - The locale code
 * @returns The translated announcement
 */
export function getInputModeAnnouncement(
  mode: 'keyboard' | 'mouse',
  locale: SupportedLocale
): string {
  const labels = getLabelSet(locale);
  return mode === 'keyboard' ? labels.keyboardMode : labels.mouseMode;
}

/**
 * Get all available skip link sections
 * @returns Array of available section keys
 */
export function getAvailableSkipLinkSections(): string[] {
  return Object.keys(SKIP_LINK_TEXT);
}

/**
 * Generate skip link HTML attributes
 * @param target - The target section
 * @param locale - The locale code
 * @returns Object with href and text properties
 */
export function generateSkipLinkAttributes(
  target: SkipLinkTarget | string,
  locale: SupportedLocale
): { href: string; text: string; 'aria-label': string } {
  const targetId = typeof target === 'string' ? target : target.id;
  const text = getSkipLinkText(target, locale);
  
  return {
    href: `#${targetId}`,
    text,
    'aria-label': text,
  };
}

/**
 * Format element description for focus announcement
 * @param elementType - Type of element
 * @param elementName - Name/label of element
 * @param locale - The locale code
 * @returns Formatted description
 */
export function formatElementDescription(
  elementType: string,
  elementName: string,
  locale: SupportedLocale
): string {
  const normalizedLocale = normalizeLocale(locale);
  const typeName = getElementTypeName(elementType, normalizedLocale);
  
  if (normalizedLocale === 'ar') {
    return `${typeName}: ${elementName}`;
  } else if (normalizedLocale === 'he') {
    return `${typeName}: ${elementName}`;
  } else {
    return `${typeName}: ${elementName}`;
  }
}

/**
 * Get trap focus announcement for modals
 * @param trapped - Whether focus is trapped
 * @param locale - The locale code
 * @returns The translated announcement
 */
export function getFocusTrapAnnouncement(
  trapped: boolean,
  locale: SupportedLocale
): string {
  const labels = getLabelSet(locale);
  return trapped ? labels.focusTrapped : labels.focusReturned;
}
