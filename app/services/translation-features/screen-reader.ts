
// Simplify text specifically for audio narration
export function simplifyForAudio(
  text: string,
  locale: string = 'en',
  readingLevel: 'basic' | 'standard' | 'advanced' = 'standard'
): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  let simplified = text.trim();
  const normalizedLocale = normalizeLocale(locale);
  
  simplified = simplified
    .replace(/[()\[\]{}]/g, ' ')
    .replace(/[\*#_~`]/g, ' ');
  
  const simplifications = TEXT_SIMPLIFICATIONS[normalizedLocale] || TEXT_SIMPLIFICATIONS['en'];
  for (const [symbol, expansion] of Object.entries(simplifications)) {
    simplified = simplified.replace(
      new RegExp(symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      ` ${expansion} `
    );
  }
  
  if (readingLevel === 'basic') {
    const sentences = simplified.match(/[^.!?]+[.!?]+/g) || [simplified];
    simplified = sentences.map(s => {
      if (s.length > 50) {
        const breakPoint = s.indexOf(',', 30);
        if (breakPoint > 0 && breakPoint < s.length - 10) {
          return s.slice(0, breakPoint) + '.' + s.slice(breakPoint + 1);
        }
      }
      return s;
    }).join(' ');
  }
  
  if (readingLevel === 'basic') {
    simplified = replaceNumbersWithWords(simplified, locale);
  }
  
  simplified = simplified
    .replace(/\s+/g, ' ')
    .replace(/\s+([.،,])/g, '$1')
    .trim();
  
  return simplified;
}

// UI Element descriptor for screen reader hints
export interface UIElement {
  type: string;
  label?: string;
  state?: Record<string, unknown>;
  value?: string | number;
  disabled?: boolean;
  required?: boolean;
  checked?: boolean;
  selected?: boolean;
  expanded?: boolean;
  pressed?: boolean;
}

// Get screen reader hints for a UI element
export function getScreenReaderHints(
  element: UIElement,
  locale: string = 'en'
): { ariaLabel: string; ariaDescription?: string; liveRegion?: string } {
  const normalizedLocale = normalizeLocale(locale);
  const hints = SCREEN_READER_HINTS[normalizedLocale];
  const result: { ariaLabel: string; ariaDescription?: string; liveRegion?: string } = {
    ariaLabel: '',
  };
  
  if (!hints) {
    result.ariaLabel = element.label || element.type;
    return result;
  }
  
  let hint: ScreenReaderHint | undefined;
  
  for (const categoryHints of Object.values(hints)) {
    hint = categoryHints.find(h => {
      if (h.elementType === element.type) return true;
      if (element.required && h.elementType === 'input-required') return true;
      if (element.checked !== undefined && h.elementType === 'checkbox') return true;
      if (element.selected !== undefined && h.elementType === 'radio') return true;
      return false;
    });
    if (hint) break;
  }
  
  if (!hint) {
    result.ariaLabel = element.label || element.type;
    return result;
  }
  
  let label = hint.labelTemplate;
  
  if (element.label) {
    label = label.replace(/{label}/g, element.label);
  }
  
  if (element.checked !== undefined) {
    const checkedText = element.checked 
      ? (normalizedLocale === 'ar' ? 'محدد' : normalizedLocale === 'he' ? 'מסומן' : 'checked')
      : (normalizedLocale === 'ar' ? 'غير محدد' : normalizedLocale === 'he' ? 'לא מסומן' : 'not checked');
    label = label.replace(/{state}/g, checkedText);
    label = label.replace(/{checked\s*\?\s*"[^"]*"\s*:\s*"[^"]*"}/g, element.checked ? checkedText : '');
  }
  
  if (element.selected !== undefined) {
    const selectedText = element.selected
      ? (normalizedLocale === 'ar' ? 'محدد' : normalizedLocale === 'he' ? 'נבחר' : 'selected')
      : (normalizedLocale === 'ar' ? 'غير محدد' : normalizedLocale === 'he' ? 'לא נבחר' : 'not selected');
    label = label.replace(/{state}/g, selectedText);
    label = label.replace(/{selected\s*\?\s*"[^"]*"\s*:\s*"[^"]*"}/g, element.selected ? selectedText : '');
  }
  
  if (element.value !== undefined) {
    label = label.replace(/{value}/g, String(element.value));
  }
  
  if (element.state?.amount !== undefined) {
    label = label.replace(/{amount}/g, String(element.state.amount));
  }
  if (element.state?.currency !== undefined) {
    label = label.replace(/{currency}/g, String(element.state.currency));
  }
  if (element.state?.original !== undefined) {
    label = label.replace(/{original}/g, String(element.state.original));
  }
  if (element.state?.product !== undefined) {
    label = label.replace(/{product}/g, String(element.state.product));
  }
  if (element.state?.quantity !== undefined) {
    label = label.replace(/{quantity}/g, String(element.state.quantity));
  }
  if (element.state?.message !== undefined) {
    label = label.replace(/{message}/g, String(element.state.message));
  }
  if (element.state?.type !== undefined) {
    label = label.replace(/{type}/g, String(element.state.type));
  }
  if (element.state?.action !== undefined) {
    label = label.replace(/{action}/g, String(element.state.action));
  }
  
  result.ariaLabel = label;
  
  if (hint.stateDescription && (element.disabled || element.required || element.checked !== undefined)) {
    result.ariaDescription = hint.stateDescription;
  }
  
  if (hint.actionDescription && !element.disabled) {
    result.ariaDescription = hint.actionDescription;
  }
  
  if (hint.elementType === 'alert' || hint.elementType === 'error' || hint.elementType === 'success') {
    result.liveRegion = 'assertive';
  } else if (hint.elementType === 'loading') {
    result.liveRegion = 'polite';
  }
  
  return result;
}

// Get all available categories for pronunciation guides
export function getPronunciationCategories(locale: string = 'en'): string[] {
  const normalizedLocale = normalizeLocale(locale);
  const guides = PRONUNCIATION_GUIDES[normalizedLocale];
  return guides ? Object.keys(guides) : [];
}

// Add a custom pronunciation guide
export function addPronunciationGuide(
  guide: PronunciationGuide,
  locale: string,
  category: string = 'custom'
): void {
  const normalizedLocale = normalizeLocale(locale);
  if (!PRONUNCIATION_GUIDES[normalizedLocale]) {
    PRONUNCIATION_GUIDES[normalizedLocale] = {};
  }
  if (!PRONUNCIATION_GUIDES[normalizedLocale][category]) {
    PRONUNCIATION_GUIDES[normalizedLocale][category] = [];
  }
  PRONUNCIATION_GUIDES[normalizedLocale][category].push(guide);
}

// Batch optimize multiple texts
export function batchOptimizeForScreenReader(
  texts: string[],
  locale: string = 'en',
  options: ScreenReaderOptions = {}
): string[] {
  return texts.map(text => optimizeForScreenReader(text, locale, options));
}

// Detect if text needs screen reader optimization
export function needsScreenReaderOptimization(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }
  
  const patterns = [
    /[0-9]{4,}/,
    /[A-Z]{3,}/,
    /[\$€£¥]/,
    /[%@#&]/,
    /\b[A-Z]{2,}\b/,
  ];
  
  return patterns.some(pattern => pattern.test(text));
}

// Text statistics interface
export interface TextStatistics {
  wordCount: number;
  sentenceCount: number;
  averageWordsPerSentence: number;
  hasComplexTerms: boolean;
  hasNumbers: boolean;
  hasAbbreviations: boolean;
  estimatedReadingTime: number;
  recommendedOptimizations: string[];
}

// Get text statistics for screen reader optimization
export function getTextStatistics(text: string, locale: string = 'en'): TextStatistics {
  if (!text || typeof text !== 'string') {
    return {
      wordCount: 0,
      sentenceCount: 0,
      averageWordsPerSentence: 0,
      hasComplexTerms: false,
      hasNumbers: false,
      hasAbbreviations: false,
      estimatedReadingTime: 0,
      recommendedOptimizations: [],
    };
  }
  
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const wordCount = words.length;
  const sentenceCount = sentences.length;
  const averageWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  
  const hasComplexTerms = /\b[A-Z]{2,}\b|[\(\)\[\]]/.test(text);
  const hasNumbers = /\d/.test(text);
  const hasAbbreviations = /\b[A-Z]{2,}\b|\b[a-z]+\.[a-z]+\./.test(text);
  
  const wordsPerMinute = 140;
  const estimatedReadingTime = Math.ceil((wordCount / wordsPerMinute) * 60);
  
  const recommendedOptimizations: string[] = [];
  
  if (averageWordsPerSentence > 20) {
    recommendedOptimizations.push('break-long-sentences');
  }
  if (hasAbbreviations) {
    recommendedOptimizations.push('expand-abbreviations');
  }
  if (hasNumbers) {
    recommendedOptimizations.push('convert-numbers');
  }
  if (hasComplexTerms) {
    recommendedOptimizations.push('simplify-terms');
  }
  
  return {
    wordCount,
    sentenceCount,
    averageWordsPerSentence,
    hasComplexTerms,
    hasNumbers,
    hasAbbreviations,
    estimatedReadingTime,
    recommendedOptimizations,
  };
}

// Create an aria-live region announcement
export function createLiveAnnouncement(
  message: string,
  priority: 'polite' | 'assertive' = 'polite',
  locale: string = 'en'
): { text: string; priority: 'polite' | 'assertive'; locale: string } {
  const optimized = optimizeForScreenReader(message, locale, {
    addPauses: true,
    expandAbbreviations: true,
    speakNumbersAsWords: true,
  });
  
  return {
    text: optimized,
    priority,
    locale,
  };
}

// Generate skip link text for navigation
export function getSkipLinkText(section: string, locale: string = 'en'): string {
  const texts: Record<string, Record<string, string>> = {
    ar: {
      main: 'تخطي إلى المحتوى الرئيسي',
      navigation: 'تخطي إلى التنقل',
      search: 'تخطي إلى البحث',
      cart: 'تخطي إلى سلة التسوق',
      footer: 'تخطي إلى تذييل الصفحة',
    },
    he: {
      main: 'דלג לתוכן הראשי',
      navigation: 'דלג לניווט',
      search: 'דלג לחיפוש',
      cart: 'דלג לעגלת הקניות',
      footer: 'דלג לתחתית העמוד',
    },
    en: {
      main: 'Skip to main content',
      navigation: 'Skip to navigation',
      search: 'Skip to search',
      cart: 'Skip to cart',
      footer: 'Skip to footer',
    },
  };
  
  const normalizedLocale = normalizeLocale(locale);
  return texts[normalizedLocale]?.[section] || texts['en'][section] || `Skip to ${section}`;
}

// Generate loading announcement
export function getLoadingAnnouncement(action: string, locale: string = 'en'): string {
  const texts: Record<string, (action: string) => string> = {
    ar: (a) => `جاري ${a}، الرجاء الانتظار`,
    he: (a) => `${a} בטעינה, אנא המתן`,
    en: (a) => `Loading ${a}, please wait`,
  };
  
  const normalizedLocale = normalizeLocale(locale);
  return texts[normalizedLocale]?.(action) || texts['en'](action);
}

// Generate error announcement
export function getErrorAnnouncement(error: string, locale: string = 'en'): string {
  const prefixes: Record<string, string> = {
    ar: 'خطأ: ',
    he: 'שגיאה: ',
    en: 'Error: ',
  };
  
  const normalizedLocale = normalizeLocale(locale);
  const prefix = prefixes[normalizedLocale] || prefixes['en'];
  return prefix + error;
}

// Generate success announcement
export function getSuccessAnnouncement(message: string, locale: string = 'en'): string {
  const prefixes: Record<string, string> = {
    ar: 'نجاح: ',
    he: 'הצלחה: ',
    en: 'Success: ',
  };
  
  const normalizedLocale = normalizeLocale(locale);
  const prefix = prefixes[normalizedLocale] || prefixes['en'];
  return prefix + message;
}
