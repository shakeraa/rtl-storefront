
/**
 * Validate if locale is supported
 */
export function isValidLocale(locale: string): locale is SupportedLocale {
  return ['ar', 'he', 'en'].includes(locale);
}

/**
 * Get normalized locale (fallback to default if invalid)
 */
export function getNormalizedLocale(locale: string): SupportedLocale {
  return isValidLocale(locale) ? locale : DEFAULT_LOCALE;
}

/**
 * Check if locale is RTL
 */
export function isRTLLocale(locale: SupportedLocale): boolean {
  return RTL_LOCALES.includes(locale);
}

/**
 * Get ARIA label for a specific key and locale
 * Returns the label in the requested locale with fallback to English
 */
export function getARIALabel(key: string, locale: string): AriaLabel | undefined {
  const normalizedLocale = getNormalizedLocale(locale);
  const labelSet = ALL_ARIA_LABELS[key];
  
  if (!labelSet) {
    return undefined;
  }
  
  // Return requested locale or fallback to English
  return labelSet[normalizedLocale] || labelSet.en;
}

/**
 * Get screen reader text for a specific key and locale
 */
export function getScreenReaderText(key: string, locale: string): ScreenReaderText | undefined {
  const normalizedLocale = getNormalizedLocale(locale);
  const textSet = SCREEN_READER_TEXTS[key];
  
  if (!textSet) {
    return undefined;
  }
  
  return textSet[normalizedLocale] || textSet.en;
}

/**
 * Get accessibility announcement for a specific key and locale
 */
export function getAccessibilityAnnouncement(key: string, locale: string): AccessibilityAnnouncement | undefined {
  const normalizedLocale = getNormalizedLocale(locale);
  const announcementSet = ACCESSIBILITY_ANNOUNCEMENTS[key];
  
  if (!announcementSet) {
    return undefined;
  }
  
  return announcementSet[normalizedLocale] || announcementSet.en;
}

/**
 * Get all accessibility labels for a locale
 */
export function getAccessibilityLabels(locale: string): AccessibilityLabelsResult {
  const normalizedLocale = getNormalizedLocale(locale);
  
  const ariaLabels: Record<string, AriaLabel> = {};
  const screenReaderTexts: Record<string, ScreenReaderText> = {};
  const announcements: Record<string, AccessibilityAnnouncement> = {};
  
  // Collect all ARIA labels
  for (const [key, labelSet] of Object.entries(ALL_ARIA_LABELS)) {
    const label = labelSet[normalizedLocale] || labelSet.en;
    if (label) {
      ariaLabels[key] = label;
    }
  }
  
  // Collect all screen reader texts
  for (const [key, textSet] of Object.entries(SCREEN_READER_TEXTS)) {
    const text = textSet[normalizedLocale] || textSet.en;
    if (text) {
      screenReaderTexts[key] = text;
    }
  }
  
  // Collect all announcements
  for (const [key, announcementSet] of Object.entries(ACCESSIBILITY_ANNOUNCEMENTS)) {
    const announcement = announcementSet[normalizedLocale] || announcementSet.en;
    if (announcement) {
      announcements[key] = announcement;
    }
  }
  
  return {
    locale: normalizedLocale,
    isRTL: isRTLLocale(normalizedLocale),
    labels: {
      ariaLabels,
      screenReaderTexts,
      announcements,
    },
    timestamp: new Date(),
  };
}

/**
 * Get ARIA labels by category
 */
export function getARIALabelsByCategory(category: AriaLabelCategory, locale: string): AriaLabel[] {
  const normalizedLocale = getNormalizedLocale(locale);
  const labels: AriaLabel[] = [];
  
  for (const [key, labelSet] of Object.entries(ALL_ARIA_LABELS)) {
    const label = labelSet[normalizedLocale] || labelSet.en;
    if (label && label.category === category) {
      labels.push(label);
    }
  }
  
  return labels;
}

/**
 * Get all available ARIA label keys
 */
export function getAllARIALabelKeys(): string[] {
  return Object.keys(ALL_ARIA_LABELS);
}

/**
 * Get all available screen reader text keys
 */
export function getAllScreenReaderTextKeys(): string[] {
  return Object.keys(SCREEN_READER_TEXTS);
}

/**
 * Get all available accessibility announcement keys
 */
export function getAllAccessibilityAnnouncementKeys(): string[] {
  return Object.keys(ACCESSIBILITY_ANNOUNCEMENTS);
}

/**
 * Get available categories
 */
export function getAvailableCategories(): AriaLabelCategory[] {
  return ['navigation', 'forms', 'ecommerce', 'feedback', 'media', 'general'];
}

/**
 * Get supported locales
 */
export function getSupportedLocales(): SupportedLocale[] {
  return ['ar', 'he', 'en'];
}

/**
 * Search ARIA labels by query string
 */
export function searchARIALabels(query: string, locale: string): AriaLabel[] {
  const normalizedLocale = getNormalizedLocale(locale);
  const normalizedQuery = query.toLowerCase();
  const results: AriaLabel[] = [];
  
  for (const [key, labelSet] of Object.entries(ALL_ARIA_LABELS)) {
    const label = labelSet[normalizedLocale] || labelSet.en;
    if (label) {
      const searchableText = `${key} ${label.label} ${label.description || ''}`.toLowerCase();
      if (searchableText.includes(normalizedQuery)) {
        results.push(label);
      }
    }
  }
  
  return results;
}

/**
 * Get ARIA label count by category
 */
export function getARIALabelCountByCategory(): Record<AriaLabelCategory, number> {
  const counts: Record<string, number> = {
    navigation: 0,
    forms: 0,
    ecommerce: 0,
    feedback: 0,
    media: 0,
    general: 0,
  };
  
  for (const labelSet of Object.values(ALL_ARIA_LABELS)) {
    const label = labelSet.en; // Use English as reference
    if (label) {
      counts[label.category] = (counts[label.category] || 0) + 1;
    }
  }
  
  return counts as Record<AriaLabelCategory, number>;
}

/**
 * Get accessibility summary for a locale
 */
export function getAccessibilitySummary(locale: string): {
  locale: SupportedLocale;
  isRTL: boolean;
  ariaLabelCount: number;
  screenReaderTextCount: number;
  announcementCount: number;
  categoryBreakdown: Record<AriaLabelCategory, number>;
} {
  const normalizedLocale = getNormalizedLocale(locale);
  const labels = getAccessibilityLabels(normalizedLocale);
  
  return {
    locale: normalizedLocale,
    isRTL: labels.isRTL,
    ariaLabelCount: Object.keys(labels.labels.ariaLabels).length,
    screenReaderTextCount: Object.keys(labels.labels.screenReaderTexts).length,
    announcementCount: Object.keys(labels.labels.announcements).length,
    categoryBreakdown: getARIALabelCountByCategory(),
  };
}

/**
 * Format ARIA label with dynamic values
 */
export function formatARIALabel(
  key: string,
  locale: string,
  values: Record<string, string | number>
): string | undefined {
  const label = getARIALabel(key, locale);
  
  if (!label) {
    return undefined;
  }
  
  let formattedLabel = label.label;
  
  for (const [key, value] of Object.entries(values)) {
    formattedLabel = formattedLabel.replace(new RegExp(`{${key}}`, 'g'), String(value));
  }
  
  return formattedLabel;
}

/**
 * Format screen reader text with dynamic values
 */
export function formatScreenReaderText(
  key: string,
  locale: string,
  values: Record<string, string | number>
): string | undefined {
  const text = getScreenReaderText(key, locale);
  
  if (!text) {
    return undefined;
  }
  
  let formattedText = text.text;
  
  for (const [key, value] of Object.entries(values)) {
    formattedText = formattedText.replace(new RegExp(`{${key}}`, 'g'), String(value));
  }
  
  return formattedText;
}

/**
 * Format accessibility announcement with dynamic values
 */
export function formatAccessibilityAnnouncement(
  key: string,
  locale: string,
  values: Record<string, string | number>
): AccessibilityAnnouncement | undefined {
  const announcement = getAccessibilityAnnouncement(key, locale);
  
  if (!announcement) {
    return undefined;
  }
  
  let formattedMessage = announcement.message;
  
  for (const [key, value] of Object.entries(values)) {
    formattedMessage = formattedMessage.replace(new RegExp(`{${key}}`, 'g'), String(value));
  }
  
  return {
    ...announcement,
    message: formattedMessage,
  };
}

/**
 * Get live region attributes for screen reader announcements
 */
export function getLiveRegionAttributes(
  priority: ScreenReaderPriority,
  relevant?: string
): {
  'aria-live': ScreenReaderPriority;
  'aria-atomic'?: string;
  'aria-relevant'?: string;
} {
  const attrs: {
    'aria-live': ScreenReaderPriority;
    'aria-atomic'?: string;
    'aria-relevant'?: string;
  } = {
    'aria-live': priority,
  };
  
  if (priority !== 'off') {
    attrs['aria-atomic'] = 'true';
  }
  
  if (relevant) {
    attrs['aria-relevant'] = relevant;
  }
  
  return attrs;
}

/**
 * Get skip link configuration
 */
export function getSkipLinkConfig(locale: string): {
  mainContent: { label: string; target: string };
  search: { label: string; target: string };
  navigation: { label: string; target: string };
} {
  const normalizedLocale = getNormalizedLocale(locale);
  
  const configs: Record<SupportedLocale, {
    mainContent: { label: string; target: string };
    search: { label: string; target: string };
    navigation: { label: string; target: string };
  }> = {
    ar: {
      mainContent: { label: 'تخطي إلى المحتوى الرئيسي', target: '#main-content' },
      search: { label: 'تخطي إلى البحث', target: '#search' },
      navigation: { label: 'تخطي إلى التنقل', target: '#main-nav' },
    },
    he: {
      mainContent: { label: 'דלג לתוכן ראשי', target: '#main-content' },
      search: { label: 'דלג לחיפוש', target: '#search' },
      navigation: { label: 'דלג לניווט', target: '#main-nav' },
    },
    en: {
      mainContent: { label: 'Skip to main content', target: '#main-content' },
      search: { label: 'Skip to search', target: '#search' },
      navigation: { label: 'Skip to navigation', target: '#main-nav' },
    },
  };
  
  return configs[normalizedLocale];
}

/**
 * Get focus management labels
 */
export function getFocusManagementLabels(locale: string): {
  focusIndicator: string;
  focusTrapStart: string;
  focusTrapEnd: string;
  focusReturned: string;
} {
  const normalizedLocale = getNormalizedLocale(locale);
  
  const labels: Record<SupportedLocale, {
    focusIndicator: string;
    focusTrapStart: string;
    focusTrapEnd: string;
    focusReturned: string;
  }> = {
    ar: {
      focusIndicator: 'تم التركيز على',
      focusTrapStart: 'بداية منطقة التركيز',
      focusTrapEnd: 'نهاية منطقة التركيز',
      focusReturned: 'تم إرجاع التركيز',
    },
    he: {
      focusIndicator: 'מוקד על',
      focusTrapStart: 'תחילת אזור מוקד',
      focusTrapEnd: 'סוף אזור מוקד',
      focusReturned: 'המוקד הוחזר',
    },
    en: {
      focusIndicator: 'Focused on',
      focusTrapStart: 'Start of focus trap',
      focusTrapEnd: 'End of focus trap',
      focusReturned: 'Focus returned',
    },
  };
  
  return labels[normalizedLocale];
}

/**
 * Validate ARIA label key exists
 */
export function hasARIALabel(key: string): boolean {
  return key in ALL_ARIA_LABELS;
}

/**
 * Validate screen reader text key exists
 */
export function hasScreenReaderText(key: string): boolean {
  return key in SCREEN_READER_TEXTS;
}

/**
 * Validate accessibility announcement key exists
 */
export function hasAccessibilityAnnouncement(key: string): boolean {
  return key in ACCESSIBILITY_ANNOUNCEMENTS;
}

// Default export with all functions
export default {
  getARIALabel,
  getScreenReaderText,
  getAccessibilityAnnouncement,
  getAccessibilityLabels,
  getARIALabelsByCategory,
  getAllARIALabelKeys,
  getAllScreenReaderTextKeys,
  getAllAccessibilityAnnouncementKeys,
  getAvailableCategories,
  getSupportedLocales,
  isValidLocale,
  isRTLLocale,
  searchARIALabels,
  getARIALabelCountByCategory,
  getAccessibilitySummary,
  formatARIALabel,
  formatScreenReaderText,
  formatAccessibilityAnnouncement,
  getLiveRegionAttributes,
  getSkipLinkConfig,
  getFocusManagementLabels,
  hasARIALabel,
  hasScreenReaderText,
  hasAccessibilityAnnouncement,
};
