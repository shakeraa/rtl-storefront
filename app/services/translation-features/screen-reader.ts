/**
 * Screen Reader Optimization Service
 * Provides text-to-speech optimization, pronunciation guides, and accessibility hints
 * Supports: ar (Arabic), he (Hebrew), en (English)
 * 
 * Features:
 * - Screen reader optimized text transformation
 * - Pronunciation guides for complex terms
 * - Text simplification for audio narration
 * - Screen reader hints for UI elements
 * - RTL-aware text processing
 */

// Screen reader configuration for each locale
export interface ScreenReaderConfig {
  locale: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
  voicePreferences: {
    gender: 'male' | 'female' | 'neutral';
    pitch: 'low' | 'medium' | 'high';
    rate: 'slow' | 'normal' | 'fast';
  };
  numberReading: 'western' | 'arabic' | 'hebrew';
  currencyReading: 'before' | 'after';
  dateReading: 'dmy' | 'mdy' | 'ymd';
  pauseMarks: {
    short: string;
    medium: string;
    long: string;
  };
}

export const SCREEN_READER_CONFIGS: Record<string, ScreenReaderConfig> = {
  ar: {
    locale: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    isRTL: true,
    voicePreferences: { gender: 'female', pitch: 'medium', rate: 'normal' },
    numberReading: 'arabic',
    currencyReading: 'after',
    dateReading: 'dmy',
    pauseMarks: { short: '،', medium: '. ', long: '. ' },
  },
  'ar-sa': {
    locale: 'ar-sa',
    name: 'Arabic (Saudi Arabia)',
    nativeName: 'العربية (السعودية)',
    isRTL: true,
    voicePreferences: { gender: 'female', pitch: 'medium', rate: 'normal' },
    numberReading: 'arabic',
    currencyReading: 'after',
    dateReading: 'dmy',
    pauseMarks: { short: '،', medium: '. ', long: '. ' },
  },
  he: {
    locale: 'he',
    name: 'Hebrew',
    nativeName: 'עברית',
    isRTL: true,
    voicePreferences: { gender: 'female', pitch: 'medium', rate: 'normal' },
    numberReading: 'hebrew',
    currencyReading: 'before',
    dateReading: 'dmy',
    pauseMarks: { short: ', ', medium: '. ', long: '. ' },
  },
  'he-il': {
    locale: 'he-il',
    name: 'Hebrew (Israel)',
    nativeName: 'עברית (ישראל)',
    isRTL: true,
    voicePreferences: { gender: 'female', pitch: 'medium', rate: 'normal' },
    numberReading: 'hebrew',
    currencyReading: 'before',
    dateReading: 'dmy',
    pauseMarks: { short: ', ', medium: '. ', long: '. ' },
  },
  en: {
    locale: 'en',
    name: 'English',
    nativeName: 'English',
    isRTL: false,
    voicePreferences: { gender: 'neutral', pitch: 'medium', rate: 'normal' },
    numberReading: 'western',
    currencyReading: 'before',
    dateReading: 'mdy',
    pauseMarks: { short: ', ', medium: '. ', long: '. ' },
  },
  'en-us': {
    locale: 'en-us',
    name: 'English (US)',
    nativeName: 'English (US)',
    isRTL: false,
    voicePreferences: { gender: 'neutral', pitch: 'medium', rate: 'normal' },
    numberReading: 'western',
    currencyReading: 'before',
    dateReading: 'mdy',
    pauseMarks: { short: ', ', medium: '. ', long: '. ' },
  },
  'en-gb': {
    locale: 'en-gb',
    name: 'English (UK)',
    nativeName: 'English (UK)',
    isRTL: false,
    voicePreferences: { gender: 'neutral', pitch: 'medium', rate: 'normal' },
    numberReading: 'western',
    currencyReading: 'before',
    dateReading: 'dmy',
    pauseMarks: { short: ', ', medium: '. ', long: '. ' },
  },
};

// Pronunciation guide entry
export interface PronunciationGuide {
  term: string;
  phonetic: string;
  audioHint: string;
  context?: string;
  syllables?: string[];
  stressIndex?: number;
}

// Pronunciation guides organized by locale and category
export const PRONUNCIATION_GUIDES: Record<string, Record<string, PronunciationGuide[]>> = {
  ar: {
    common: [
      { term: 'ريال', phonetic: 'ree-YAAL', audioHint: 'ree-YAAL', syllables: ['ree', 'YAAL'], stressIndex: 1 },
      { term: 'درهم', phonetic: 'dir-HAM', audioHint: 'dir-HAM', syllables: ['dir', 'HAM'], stressIndex: 1 },
      { term: 'شيقل', phonetic: 'SHEH-kel', audioHint: 'SHEH-kel', syllables: ['SHEH', 'kel'], stressIndex: 0 },
      { term: 'جنيه', phonetic: 'guh-NEEH', audioHint: 'guh-NEEH', syllables: ['guh', 'NEEH'], stressIndex: 1 },
    ],
    ecommerce: [
      { term: 'سلة التسوق', phonetic: 'salat at-tasawwuq', audioHint: 'salat at-tasawwuq', context: 'shopping cart' },
      { term: 'دفع', phonetic: 'da-FAA', audioHint: 'da-FAA', syllables: ['da', 'FAA'], stressIndex: 1 },
      { term: 'خصم', phonetic: 'kha-SAM', audioHint: 'kha-SAM', syllables: ['kha', 'SAM'], stressIndex: 1 },
      { term: 'توصيل', phonetic: 'taw-SEEL', audioHint: 'taw-SEEL', syllables: ['taw', 'SEEL'], stressIndex: 1 },
      { term: 'مخزون', phonetic: 'makh-ZOON', audioHint: 'makh-ZOON', syllables: ['makh', 'ZOON'], stressIndex: 1 },
      { term: 'فاتورة', phonetic: 'faa-TOO-rah', audioHint: 'fah-TOO-rah', syllables: ['faa', 'TOO', 'rah'], stressIndex: 1 },
    ],
    numbers: [
      { term: 'صفر', phonetic: 'SIF-r', audioHint: 'SIF-r', context: 'zero' },
      { term: 'مليون', phonetic: 'mil-YOON', audioHint: 'mil-YOON', syllables: ['mil', 'YOON'], stressIndex: 1 },
      { term: 'مليار', phonetic: 'mil-YAAR', audioHint: 'mil-YAAR', syllables: ['mil', 'YAAR'], stressIndex: 1 },
      { term: 'ألف', phonetic: 'ALF', audioHint: 'ALF', context: 'thousand' },
    ],
  },
  he: {
    common: [
      { term: 'שקל', phonetic: 'SHEH-kel', audioHint: 'SHEH-kel', syllables: ['SHEH', 'kel'], stressIndex: 0 },
      { term: 'אגורה', phonetic: 'ah-goh-RAH', audioHint: 'ah-goh-RAH', syllables: ['ah', 'goh', 'RAH'], stressIndex: 2 },
    ],
    ecommerce: [
      { term: 'עגלת קניות', phonetic: 'agalat kniyot', audioHint: 'ah-GAH-laht knee-YOHT', context: 'shopping cart' },
      { term: 'תשלום', phonetic: 'tash-LOOM', audioHint: 'tash-LOOM', syllables: ['tash', 'LOOM'], stressIndex: 1 },
      { term: 'הנחה', phonetic: 'he-na-KHAH', audioHint: 'heh-nah-KHAH', syllables: ['he', 'na', 'KHAH'], stressIndex: 2 },
      { term: 'משלוח', phonetic: 'mish-LOO-akh', audioHint: 'meesh-LOO-akh', syllables: ['mish', 'LOO', 'akh'], stressIndex: 1 },
      { term: 'מלאי', phonetic: 'me-LAI', audioHint: 'meh-LAI', syllables: ['me', 'LAI'], stressIndex: 1 },
      { term: 'חשבונית', phonetic: 'khesh-bo-NEET', audioHint: 'khesh-boh-NEET', syllables: ['khesh', 'bo', 'NEET'], stressIndex: 2 },
    ],
    numbers: [
      { term: 'אפס', phonetic: 'EF-es', audioHint: 'EH-fes', context: 'zero' },
      { term: 'מיליון', phonetic: 'mil-YON', audioHint: 'meel-YON', syllables: ['mil', 'YON'], stressIndex: 1 },
      { term: 'מיליארד', phonetic: 'mil-YARD', audioHint: 'meel-YAHRD', syllables: ['mil', 'YARD'], stressIndex: 1 },
      { term: 'אלף', phonetic: 'EH-lef', audioHint: 'EH-lef', context: 'thousand' },
    ],
  },
  en: {
    common: [
      { term: 'USD', phonetic: 'yoo-es-DEE', audioHint: 'U-S dollars', context: 'US currency' },
      { term: 'EUR', phonetic: 'YOO-roh', audioHint: 'EU-ros', context: 'European currency' },
      { term: 'GBP', phonetic: 'jee-bee-PEE', audioHint: 'pounds sterling', context: 'British currency' },
      { term: 'SAR', phonetic: 'sar', audioHint: 'Saudi riyals', context: 'Saudi currency' },
    ],
    ecommerce: [
      { term: 'SKU', phonetic: 'SKYOO', audioHint: 'SKU', context: 'stock keeping unit' },
      { term: 'checkout', phonetic: 'CHEK-out', audioHint: 'CHECK-out', syllables: ['CHEK', 'out'], stressIndex: 0 },
      { term: 'cart', phonetic: 'kart', audioHint: 'cart' },
      { term: 'discount', phonetic: 'DIS-kownt', audioHint: 'DIS-count', syllables: ['DIS', 'kownt'], stressIndex: 0 },
      { term: 'shipping', phonetic: 'SHIP-ing', audioHint: 'SHIP-ping', syllables: ['SHIP', 'ing'], stressIndex: 0 },
      { term: 'inventory', phonetic: 'IN-vun-tor-ee', audioHint: 'IN-ven-tor-y', syllables: ['IN', 'vun', 'tor', 'ee'], stressIndex: 0 },
      { term: 'receipt', phonetic: 'ri-SEET', audioHint: 're-CEIPT', syllables: ['ri', 'SEET'], stressIndex: 1 },
    ],
    numbers: [
      { term: '0', phonetic: 'ZEE-roh', audioHint: 'zero' },
      { term: 'K', phonetic: 'kay', audioHint: 'thousand', context: 'abbreviation for thousand' },
      { term: 'M', phonetic: 'em', audioHint: 'million', context: 'abbreviation for million' },
      { term: 'B', phonetic: 'bee', audioHint: 'billion', context: 'abbreviation for billion' },
    ],
  },
};

// Simplified text mapping for complex terms
export const TEXT_SIMPLIFICATIONS: Record<string, Record<string, string>> = {
  ar: {
    // Abbreviations and symbols
    '%': 'بالمئة',
    '$': 'دولار',
    '€': 'يورو',
    '£': 'جنيه',
    '¥': 'ين',
    '+': 'زائد',
    '-': 'ناقص',
    '×': 'ضرب',
    '÷': 'قسمة',
    '=': 'يساوي',
    '/': 'علامة slash',
    '&': 'و',
    '@': 'at',
    '#': 'hash tag',
    // Common abbreviations
    'م.م': 'متر مربع',
    'ك.م': 'كيلومتر',
    'سم': 'سنتيمتر',
    'كغ': 'كيلوغرام',
    'غ': 'غرام',
    'مل': 'ملليلتر',
    'ل.إ': 'درهم إماراتي',
    'ر.س': 'ريال سعودي',
    'د.ك': 'دينار كويتي',
    // UI elements
    'إلغاء': 'إلغاء',
    'موافق': 'موافق',
    'إرسال': 'إرسال',
    'حفظ': 'حفظ',
  },
  he: {
    '%': 'אחוז',
    '$': 'דולר',
    '€': 'אירו',
    '£': 'לירה',
    '¥': 'ין',
    '+': 'ועוד',
    '-': 'פחות',
    '×': 'כפול',
    '÷': 'חלקי',
    '=': 'שווה',
    '/': 'לוכסן',
    '&': 'ו',
    '@': 'שטרודל',
    '#': 'סולמית',
    'מ"ר': 'מטר רבוע',
    'ק"מ': 'קילומטר',
    'ס"מ': 'סנטימטר',
    'ק"ג': 'קילוגרם',
    'ג': 'גרם',
    'מ"ל': 'מיליליטר',
    '₪': 'שקלים',
    'ביטול': 'ביטול',
    'אישור': 'אישור',
    'שליחה': 'שליחה',
    'שמירה': 'שמירה',
  },
  en: {
    '%': 'percent',
    '$': 'dollars',
    '€': 'euros',
    '£': 'pounds',
    '¥': 'yen',
    '+': 'plus',
    '-': 'minus',
    '×': 'times',
    '÷': 'divided by',
    '=': 'equals',
    '/': 'slash',
    '&': 'and',
    '@': 'at',
    '#': 'hash',
    'sq ft': 'square feet',
    'km': 'kilometers',
    'cm': 'centimeters',
    'kg': 'kilograms',
    'g': 'grams',
    'ml': 'milliliters',
    'USD': 'US dollars',
    'EUR': 'euros',
    'GBP': 'British pounds',
    'cancel': 'cancel',
    'ok': 'OK',
    'submit': 'submit',
    'save': 'save',
  },
};

// Screen reader hints for UI elements
export interface ScreenReaderHint {
  elementType: string;
  role: string;
  labelTemplate: string;
  stateDescription?: string;
  actionDescription?: string;
  priority: 'critical' | 'important' | 'optional';
}

export const SCREEN_READER_HINTS: Record<string, Record<string, ScreenReaderHint[]>> = {
  ar: {
    button: [
      { elementType: 'button', role: 'زر', labelTemplate: '{label}، زر', priority: 'critical', actionDescription: 'انقر للتفعيل' },
      { elementType: 'submit', role: 'زر إرسال', labelTemplate: '{label}، زر إرسال', priority: 'critical', actionDescription: 'انقر لإرسال النموذج' },
    ],
    link: [
      { elementType: 'link', role: 'رابط', labelTemplate: '{label}، رابط', priority: 'critical', actionDescription: 'انقر للانتقال' },
      { elementType: 'external-link', role: 'رابط خارجي', labelTemplate: '{label}، رابط خارجي، سيتم فتحه في نافذة جديدة', priority: 'important', actionDescription: 'انقر للفتح في نافذة جديدة' },
    ],
    form: [
      { elementType: 'input', role: 'حقل إدخال', labelTemplate: '{label}، حقل إدخال', priority: 'critical' },
      { elementType: 'input-required', role: 'حقل إدخال مطلوب', labelTemplate: '{label}، حقل إدخال مطلوب', priority: 'critical', stateDescription: 'هذا الحقل مطلوب' },
      { elementType: 'checkbox', role: 'مربع اختيار', labelTemplate: '{label}، مربع اختيار {state}', priority: 'important', stateDescription: '{checked ? "محدد" : "غير محدد"}' },
      { elementType: 'radio', role: 'زر اختيار', labelTemplate: '{label}، زر اختيار {state}', priority: 'important', stateDescription: '{selected ? "محدد" : "غير محدد"}' },
      { elementType: 'select', role: 'قائمة منسدلة', labelTemplate: '{label}، قائمة منسدلة', priority: 'critical', actionDescription: 'انقر لفتح القائمة' },
    ],
    navigation: [
      { elementType: 'nav', role: 'تنقل', labelTemplate: 'تنقل: {label}', priority: 'important' },
      { elementType: 'breadcrumb', role: 'مسار التنقل', labelTemplate: 'أنت هنا: {items}', priority: 'optional' },
    ],
    status: [
      { elementType: 'alert', role: 'تنبيه', labelTemplate: 'تنبيه: {message}', priority: 'critical', stateDescription: '{type}' },
      { elementType: 'error', role: 'خطأ', labelTemplate: 'خطأ: {message}', priority: 'critical', stateDescription: 'هناك خطأ يجب تصحيحه' },
      { elementType: 'success', role: 'نجاح', labelTemplate: 'نجاح: {message}', priority: 'important', stateDescription: 'تمت العملية بنجاح' },
      { elementType: 'loading', role: 'جاري التحميل', labelTemplate: 'جاري {action}، الرجاء الانتظار', priority: 'important', stateDescription: 'جاري التحميل' },
    ],
    commerce: [
      { elementType: 'price', role: 'سعر', labelTemplate: 'السعر: {amount} {currency}', priority: 'critical' },
      { elementType: 'sale-price', role: 'سعر مخفض', labelTemplate: 'سعر مخفض: {amount} {currency}، كان {original}', priority: 'important' },
      { elementType: 'out-of-stock', role: 'غير متوفر', labelTemplate: '{product} غير متوفر حالياً', priority: 'critical', stateDescription: 'نفذت الكمية' },
      { elementType: 'in-cart', role: 'في السلة', labelTemplate: '{product}، الكمية: {quantity}، في السلة', priority: 'important' },
    ],
  },
  he: {
    button: [
      { elementType: 'button', role: 'לחצן', labelTemplate: '{label}, לחצן', priority: 'critical', actionDescription: 'לחץ להפעלה' },
      { elementType: 'submit', role: 'לחצן שליחה', labelTemplate: '{label}, לחצן שליחה', priority: 'critical', actionDescription: 'לחץ לשליחת הטופס' },
    ],
    link: [
      { elementType: 'link', role: 'קישור', labelTemplate: '{label}, קישור', priority: 'critical', actionDescription: 'לחץ למעבר' },
      { elementType: 'external-link', role: 'קישור חיצוני', labelTemplate: '{label}, קישור חיצוני, ייפתח בחלון חדש', priority: 'important', actionDescription: 'לחץ לפתיחה בחלון חדש' },
    ],
    form: [
      { elementType: 'input', role: 'שדה קלט', labelTemplate: '{label}, שדה קלט', priority: 'critical' },
      { elementType: 'input-required', role: 'שדה קלט חובה', labelTemplate: '{label}, שדה קלט חובה', priority: 'critical', stateDescription: 'שדה זה חובה' },
      { elementType: 'checkbox', role: 'תיבת סימון', labelTemplate: '{label}, תיבת סימון {state}', priority: 'important', stateDescription: '{checked ? "מסומן" : "לא מסומן"}' },
      { elementType: 'radio', role: 'לחצן בחירה', labelTemplate: '{label}, לחצן בחירה {state}', priority: 'important', stateDescription: '{selected ? "נבחר" : "לא נבחר"}' },
      { elementType: 'select', role: 'רשימה נפתחת', labelTemplate: '{label}, רשימה נפתחת', priority: 'critical', actionDescription: 'לחץ לפתיחת הרשימה' },
    ],
    navigation: [
      { elementType: 'nav', role: 'ניווט', labelTemplate: 'ניווט: {label}', priority: 'important' },
      { elementType: 'breadcrumb', role: 'שביל ניווט', labelTemplate: 'אתה כאן: {items}', priority: 'optional' },
    ],
    status: [
      { elementType: 'alert', role: 'התראה', labelTemplate: 'התראה: {message}', priority: 'critical', stateDescription: '{type}' },
      { elementType: 'error', role: 'שגיאה', labelTemplate: 'שגיאה: {message}', priority: 'critical', stateDescription: 'יש שגיאה שיש לתקן' },
      { elementType: 'success', role: 'הצלחה', labelTemplate: 'הצלחה: {message}', priority: 'important', stateDescription: 'הפעולה הושלמה בהצלחה' },
      { elementType: 'loading', role: 'טוען', labelTemplate: '{action} בטעינה, אנא המתן', priority: 'important', stateDescription: 'טוען' },
    ],
    commerce: [
      { elementType: 'price', role: 'מחיר', labelTemplate: 'מחיר: {amount} {currency}', priority: 'critical' },
      { elementType: 'sale-price', role: 'מחיר מוזל', labelTemplate: 'מחיר מוזל: {amount} {currency}, היה {original}', priority: 'important' },
      { elementType: 'out-of-stock', role: 'אזל מהמלאי', labelTemplate: '{product} אזל מהמלאי', priority: 'critical', stateDescription: 'אין במלאי' },
      { elementType: 'in-cart', role: 'בעגלה', labelTemplate: '{product}, כמות: {quantity}, בעגלה', priority: 'important' },
    ],
  },
  en: {
    button: [
      { elementType: 'button', role: 'button', labelTemplate: '{label}, button', priority: 'critical', actionDescription: 'click to activate' },
      { elementType: 'submit', role: 'submit button', labelTemplate: '{label}, submit button', priority: 'critical', actionDescription: 'click to submit form' },
    ],
    link: [
      { elementType: 'link', role: 'link', labelTemplate: '{label}, link', priority: 'critical', actionDescription: 'click to navigate' },
      { elementType: 'external-link', role: 'external link', labelTemplate: '{label}, external link, opens in new window', priority: 'important', actionDescription: 'click to open in new window' },
    ],
    form: [
      { elementType: 'input', role: 'input field', labelTemplate: '{label}, input field', priority: 'critical' },
      { elementType: 'input-required', role: 'required input field', labelTemplate: '{label}, required input field', priority: 'critical', stateDescription: 'this field is required' },
      { elementType: 'checkbox', role: 'checkbox', labelTemplate: '{label}, checkbox {state}', priority: 'important', stateDescription: '{checked ? "checked" : "not checked"}' },
      { elementType: 'radio', role: 'radio button', labelTemplate: '{label}, radio button {state}', priority: 'important', stateDescription: '{selected ? "selected" : "not selected"}' },
      { elementType: 'select', role: 'dropdown', labelTemplate: '{label}, dropdown', priority: 'critical', actionDescription: 'click to open dropdown' },
    ],
    navigation: [
      { elementType: 'nav', role: 'navigation', labelTemplate: 'navigation: {label}', priority: 'important' },
      { elementType: 'breadcrumb', role: 'breadcrumb', labelTemplate: 'you are here: {items}', priority: 'optional' },
    ],
    status: [
      { elementType: 'alert', role: 'alert', labelTemplate: 'alert: {message}', priority: 'critical', stateDescription: '{type}' },
      { elementType: 'error', role: 'error', labelTemplate: 'error: {message}', priority: 'critical', stateDescription: 'there is an error to correct' },
      { elementType: 'success', role: 'success', labelTemplate: 'success: {message}', priority: 'important', stateDescription: 'operation completed successfully' },
      { elementType: 'loading', role: 'loading', labelTemplate: '{action} loading, please wait', priority: 'important', stateDescription: 'loading' },
    ],
    commerce: [
      { elementType: 'price', role: 'price', labelTemplate: 'price: {amount} {currency}', priority: 'critical' },
      { elementType: 'sale-price', role: 'sale price', labelTemplate: 'sale price: {amount} {currency}, was {original}', priority: 'important' },
      { elementType: 'out-of-stock', role: 'out of stock', labelTemplate: '{product} is out of stock', priority: 'critical', stateDescription: 'out of stock' },
      { elementType: 'in-cart', role: 'in cart', labelTemplate: '{product}, quantity: {quantity}, in cart', priority: 'important' },
    ],
  },
};

// Number reading rules for TTS
export const NUMBER_READING_RULES: Record<string, Record<string, string>> = {
  ar: {
    '0': 'صفر',
    '1': 'واحد',
    '2': 'اثنان',
    '3': 'ثلاثة',
    '4': 'أربعة',
    '5': 'خمسة',
    '6': 'ستة',
    '7': 'سبعة',
    '8': 'ثمانية',
    '9': 'تسعة',
    '10': 'عشرة',
    '11': 'أحد عشر',
    '12': 'اثنا عشر',
    '13': 'ثلاثة عشر',
    '14': 'أربعة عشر',
    '15': 'خمسة عشر',
    '16': 'ستة عشر',
    '17': 'سبعة عشر',
    '18': 'ثمانية عشر',
    '19': 'تسعة عشر',
    '20': 'عشرون',
    '30': 'ثلاثون',
    '40': 'أربعون',
    '50': 'خمسون',
    '60': 'ستون',
    '70': 'سبعون',
    '80': 'ثمانون',
    '90': 'تسعون',
    '100': 'مائة',
    '1000': 'ألف',
    '1000000': 'مليون',
    '1000000000': 'مليار',
  },
  he: {
    '0': 'אפס',
    '1': 'אחת',
    '2': 'שתיים',
    '3': 'שלוש',
    '4': 'ארבע',
    '5': 'חמש',
    '6': 'שש',
    '7': 'שבע',
    '8': 'שמונה',
    '9': 'תשע',
    '10': 'עשר',
    '11': 'אחת-עשרה',
    '12': 'שתיים-עשרה',
    '13': 'שלוש-עשרה',
    '14': 'ארבע-עשרה',
    '15': 'חמש-עשרה',
    '16': 'שש-עשרה',
    '17': 'שבע-עשרה',
    '18': 'שמונה-עשרה',
    '19': 'תשע-עשרה',
    '20': 'עשרים',
    '30': 'שלושים',
    '40': 'ארבעים',
    '50': 'חמישים',
    '60': 'שישים',
    '70': 'שבעים',
    '80': 'שמונים',
    '90': 'תשעים',
    '100': 'מאה',
    '1000': 'אלף',
    '1000000': 'מיליון',
    '1000000000': 'מיליארד',
  },
  en: {
    '0': 'zero',
    '1': 'one',
    '2': 'two',
    '3': 'three',
    '4': 'four',
    '5': 'five',
    '6': 'six',
    '7': 'seven',
    '8': 'eight',
    '9': 'nine',
    '10': 'ten',
    '11': 'eleven',
    '12': 'twelve',
    '13': 'thirteen',
    '14': 'fourteen',
    '15': 'fifteen',
    '16': 'sixteen',
    '17': 'seventeen',
    '18': 'eighteen',
    '19': 'nineteen',
    '20': 'twenty',
    '30': 'thirty',
    '40': 'forty',
    '50': 'fifty',
    '60': 'sixty',
    '70': 'seventy',
    '80': 'eighty',
    '90': 'ninety',
    '100': 'one hundred',
    '1000': 'one thousand',
    '1000000': 'one million',
    '1000000000': 'one billion',
  },
};

// Optimization options
export interface ScreenReaderOptions {
  preservePunctuation?: boolean;
  addPauses?: boolean;
  expandAbbreviations?: boolean;
  speakNumbersAsWords?: boolean;
  simplifyComplexTerms?: boolean;
  maxSentenceLength?: number;
  emphasisOnKeyTerms?: boolean;
}

// Default options
const DEFAULT_OPTIONS: ScreenReaderOptions = {
  preservePunctuation: true,
  addPauses: true,
  expandAbbreviations: true,
  speakNumbersAsWords: false,
  simplifyComplexTerms: true,
  maxSentenceLength: 20,
  emphasisOnKeyTerms: true,
};

/**
 * Normalize locale string
 */
function normalizeLocale(locale: string): string {
  const normalized = locale.toLowerCase().trim();
  if (SCREEN_READER_CONFIGS[normalized]) {
    return normalized;
  }
  const baseLocale = normalized.split('-')[0];
  if (SCREEN_READER_CONFIGS[baseLocale]) {
    return baseLocale;
  }
  return 'en';
}

/**
 * Get screen reader configuration for a locale
 */
export function getScreenReaderConfig(locale: string): ScreenReaderConfig {
  const normalized = normalizeLocale(locale);
  return SCREEN_READER_CONFIGS[normalized] || SCREEN_READER_CONFIGS['en'];
}

/**
 * Check if a locale is RTL
 */
export function isRTLLocale(locale: string): boolean {
  const config = getScreenReaderConfig(locale);
  return config.isRTL;
}

/**
 * Add pauses to text for better TTS reading
 */
function addPausesToText(text: string, locale: string): string {
  const config = getScreenReaderConfig(locale);
  const { short, medium } = config.pauseMarks;
  
  // Add pause after punctuation
  let optimized = text
    .replace(/([،,])/g, `${short}`)
    .replace(/([.!?]\s+)/g, `${medium}`);
  
  // Add pause between list items
  optimized = optimized.replace(/(\S+)([;；])/g, `$1${short}`);
  
  return optimized;
}

/**
 * Expand abbreviations in text
 */
function expandAbbreviationsInText(text: string, locale: string): string {
  const simplifications = TEXT_SIMPLIFICATIONS[normalizeLocale(locale)] || TEXT_SIMPLIFICATIONS['en'];
  let expanded = text;
  
  for (const [abbreviation, expansion] of Object.entries(simplifications)) {
    const regex = new RegExp(`\\b${abbreviation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    expanded = expanded.replace(regex, expansion);
  }
  
  return expanded;
}

/**
 * Simplify complex sentences by breaking them down
 */
function simplifySentence(text: string, locale: string, maxLength: number): string {
  if (text.length <= maxLength * 5) {
    return text;
  }
  
  const config = getScreenReaderConfig(locale);
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  return sentences.map(sentence => {
    if (sentence.length > maxLength * 8) {
      // Break long sentences at conjunctions
      const conjunctions = locale.startsWith('ar') 
        ? [' و', ' أو', ' لكن', ' بينما']
        : locale.startsWith('he')
        ? [' ו', ' או', ' אבל', ' בזמן ש']
        : [' and ', ' or ', ' but ', ' while '];
      
      let broken = sentence;
      for (const conj of conjunctions) {
        broken = broken.replace(new RegExp(conj, 'g'), `${config.pauseMarks.short}${conj.trim()} `);
      }
      return broken;
    }
    return sentence;
  }).join(' ');
}

/**
 * Convert number to spoken words
 */
function numberToWords(num: number, locale: string): string {
  const rules = NUMBER_READING_RULES[normalizeLocale(locale)] || NUMBER_READING_RULES['en'];
  
  if (rules[String(num)]) {
    return rules[String(num)];
  }
  
  if (num < 20) {
    return rules[String(num)] || String(num);
  }
  
  if (num < 100) {
    const tens = Math.floor(num / 10) * 10;
    const ones = num % 10;
    const tensWord = rules[String(tens)] || String(tens);
    const onesWord = ones > 0 ? rules[String(ones)] || String(ones) : '';
    
    if (locale.startsWith('ar')) {
      return onesWord ? `${onesWord} و${tensWord}` : tensWord;
    } else if (locale.startsWith('he')) {
      return onesWord ? `${tensWord} ו-${onesWord}` : tensWord;
    } else {
      return onesWord ? `${tensWord}-${onesWord}` : tensWord;
    }
  }
  
  if (num < 1000) {
    const hundreds = Math.floor(num / 100);
    const remainder = num % 100;
    const hundredsWord = rules['100'] || 'hundred';
    
    let result = locale === 'en' 
      ? `${rules[String(hundreds)] || hundreds} ${hundredsWord}`
      : hundredsWord;
    
    if (remainder > 0) {
      result += ` ${numberToWords(remainder, locale)}`;
    }
    return result;
  }
  
  // For larger numbers, return as-is
  return String(num);
}

/**
 * Replace numbers with words in text
 */
function replaceNumbersWithWords(text: string, locale: string): string {
  return text.replace(/\b\d+\b/g, (match) => {
    const num = parseInt(match, 10);
    if (num <= 9999) {
      return numberToWords(num, locale);
    }
    return match;
  });
}

/**
 * Optimize text for screen reader
 * Main function that applies all optimizations
 */
export function optimizeForScreenReader(
  text: string,
  locale: string = 'en',
  options: ScreenReaderOptions = {}
): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let optimized = text.trim();
  
  // Expand abbreviations
  if (opts.expandAbbreviations) {
    optimized = expandAbbreviationsInText(optimized, locale);
  }
  
  // Simplify complex sentences
  if (opts.simplifyComplexTerms && opts.maxSentenceLength) {
    optimized = simplifySentence(optimized, locale, opts.maxSentenceLength);
  }
  
  // Convert numbers to words
  if (opts.speakNumbersAsWords) {
    optimized = replaceNumbersWithWords(optimized, locale);
  }
  
  // Add pauses
  if (opts.addPauses) {
    optimized = addPausesToText(optimized, locale);
  }
  
  // Clean up extra whitespace
  optimized = optimized.replace(/\s+/g, ' ').trim();
  
  return optimized;
}

/**
 * Get pronunciation guide for a term
 */
export function getPronunciationGuide(
  term: string,
  locale: string = 'en',
  category?: string
): PronunciationGuide | null {
  const normalizedLocale = normalizeLocale(locale);
  const guides = PRONUNCIATION_GUIDES[normalizedLocale];
  
  if (!guides) {
    return null;
  }
  
  // Search in specified category or all categories
  const categories = category ? [category] : Object.keys(guides);
  
  for (const cat of categories) {
    const categoryGuides = guides[cat];
    if (categoryGuides) {
      const guide = categoryGuides.find(g => 
        g.term.toLowerCase() === term.toLowerCase()
      );
      if (guide) {
        return guide;
      }
    }
  }
  
  return null;
}

/**
 * Search for pronunciation guides by partial match
 */
export function searchPronunciationGuides(
  searchTerm: string,
  locale: string = 'en'
): PronunciationGuide[] {
  const normalizedLocale = normalizeLocale(locale);
  const guides = PRONUNCIATION_GUIDES[normalizedLocale];
  const results: PronunciationGuide[] = [];
  
  if (!guides) {
    return results;
  }
  
  const lowerSearch = searchTerm.toLowerCase();
  
  for (const categoryGuides of Object.values(guides)) {
    for (const guide of categoryGuides) {
      if (guide.term.toLowerCase().includes(lowerSearch) ||
          guide.phonetic.toLowerCase().includes(lowerSearch) ||
          (guide.context && guide.context.toLowerCase().includes(lowerSearch))) {
        results.push(guide);
      }
    }
  }
  
  return results;
}

/**
 * Get all pronunciation guides for a locale
 */
export function getAllPronunciationGuides(
  locale: string = 'en'
): Record<string, PronunciationGuide[]> {
  const normalizedLocale = normalizeLocale(locale);
  return PRONUNCIATION_GUIDES[normalizedLocale] || {};
}

/**
 * Simplify text specifically for audio narration
 * More aggressive simplification than optimizeForScreenReader
 */
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
  
  // Remove non-essential punctuation
  simplified = simplified
    .replace(/[()\[\]{}]/g, ' ')
    .replace(/[\*#_~`]/g, ' ');
  
  // Expand all symbols
  const simplifications = TEXT_SIMPLIFICATIONS[normalizedLocale] || TEXT_SIMPLIFICATIONS['en'];
  for (const [symbol, expansion] of Object.entries(simplifications)) {
    simplified = simplified.replace(
      new RegExp(symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      ` ${expansion} `
    );
  }
  
  // Apply reading level simplification
  if (readingLevel === 'basic') {
    // Break into shorter sentences
    const sentences = simplified.match(/[^.!?]+[.!?]+/g) || [simplified];
    simplified = sentences.map(s => {
      if (s.length > 50) {
        // Find a good breaking point
        const breakPoint = s.indexOf(',', 30);
        if (breakPoint > 0 && breakPoint < s.length - 10) {
          return s.slice(0, breakPoint) + '.' + s.slice(breakPoint + 1);
        }
      }
      return s;
    }).join(' ');
  }
  
  // Convert numbers to words for basic level
  if (readingLevel === 'basic') {
    simplified = replaceNumbersWithWords(simplified, locale);
  }
  
  // Clean up
  simplified = simplified
    .replace(/\s+/g, ' ')
    .replace(/\s+([.،,])/g, '$1')
    .trim();
  
  return simplified;
}

/**
 * UI Element descriptor for screen reader hints
 */
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

/**
 * Get screen reader hints for a UI element
 */
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
  
  // Find matching hint category
  let hint: ScreenReaderHint | undefined;
  
  for (const categoryHints of Object.values(hints)) {
    hint = categoryHints.find(h => {
      // Match exact type or subtype
      if (h.elementType === element.type) return true;
      // Check for required/disabled states
      if (element.required && h.elementType === 'input-required') return true;
      if (element.checked !== undefined && h.elementType === 'checkbox') return true;
      if (element.selected !== undefined && h.elementType === 'radio') return true;
      return false;
    });
    if (hint) break;
  }
  
  if (!hint) {
    // Fallback to basic role announcement
    result.ariaLabel = element.label || element.type;
    return result;
  }
  
  // Build label from template
  let label = hint.labelTemplate;
  
  // Replace {label} placeholder
  if (element.label) {
    label = label.replace(/{label}/g, element.label);
  }
  
  // Replace state placeholders
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
  
  // Replace value placeholder
  if (element.value !== undefined) {
    label = label.replace(/{value}/g, String(element.value));
  }
  
  // Replace amount/currency placeholders for commerce elements
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
  
  // Add description if available
  if (hint.stateDescription && (element.disabled || element.required || element.checked !== undefined)) {
    result.ariaDescription = hint.stateDescription;
  }
  
  if (hint.actionDescription && !element.disabled) {
    result.ariaDescription = hint.actionDescription;
  }
  
  // Add live region for status messages
  if (hint.elementType === 'alert' || hint.elementType === 'error' || hint.elementType === 'success') {
    result.liveRegion = 'assertive';
  } else if (hint.elementType === 'loading') {
    result.liveRegion = 'polite';
  }
  
  return result;
}

/**
 * Get all available categories for pronunciation guides
 */
export function getPronunciationCategories(locale: string = 'en'): string[] {
  const normalizedLocale = normalizeLocale(locale);
  const guides = PRONUNCIATION_GUIDES[normalizedLocale];
  return guides ? Object.keys(guides) : [];
}

/**
 * Add a custom pronunciation guide
 */
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

/**
 * Batch optimize multiple texts
 */
export function batchOptimizeForScreenReader(
  texts: string[],
  locale: string = 'en',
  options: ScreenReaderOptions = {}
): string[] {
  return texts.map(text => optimizeForScreenReader(text, locale, options));
}

/**
 * Detect if text needs screen reader optimization
 */
export function needsScreenReaderOptimization(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }
  
  // Check for complex patterns that need optimization
  const patterns = [
    /[0-9]{4,}/, // Long numbers
    /[A-Z]{3,}/, // All caps abbreviations
    /[\$€£¥]/,   // Currency symbols
    /[%@#&]/,    // Special symbols
    /\b[A-Z]{2,}\b/, // Acronyms
  ];
  
  return patterns.some(pattern => pattern.test(text));
}

/**
 * Get text statistics for screen reader optimization
 */
export interface TextStatistics {
  wordCount: number;
  sentenceCount: number;
  averageWordsPerSentence: number;
  hasComplexTerms: boolean;
  hasNumbers: boolean;
  hasAbbreviations: boolean;
  estimatedReadingTime: number; // in seconds
  recommendedOptimizations: string[];
}

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
  
  // Estimate reading time (average speaking rate: 130-150 words per minute)
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

/**
 * Create an aria-live region announcement
 */
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

/**
 * Generate skip link text for navigation
 */
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

/**
 * Generate loading announcement
 */
export function getLoadingAnnouncement(action: string, locale: string = 'en'): string {
  const texts: Record<string, (action: string) => string> = {
    ar: (a) => `جاري ${a}، الرجاء الانتظار`,
    he: (a) => `${a} בטעינה, אנא המתן`,
    en: (a) => `Loading ${a}, please wait`,
  };
  
  const normalizedLocale = normalizeLocale(locale);
  return texts[normalizedLocale]?.(action) || texts['en'](action);
}

/**
 * Generate error announcement
 */
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

/**
 * Generate success announcement
 */
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
