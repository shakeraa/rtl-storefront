/**
 * Translation - Accessibility Labels Service
 * T0345: Translation - Accessibility Labels
 * 
 * Provides ARIA-compliant label translations, screen reader text,
 * and accessibility announcements for RTL storefronts.
 * Supports Arabic (ar), Hebrew (he), and English (en) locales.
 */

export type SupportedLocale = 'ar' | 'he' | 'en';
export type AriaLabelCategory = 'navigation' | 'forms' | 'ecommerce' | 'feedback' | 'media' | 'general';
export type ScreenReaderPriority = 'polite' | 'assertive' | 'off';

export interface AriaLabel {
  key: string;
  label: string;
  category: AriaLabelCategory;
  description?: string;
}

export interface ScreenReaderText {
  key: string;
  text: string;
  priority: ScreenReaderPriority;
  context?: string;
}

export interface AccessibilityAnnouncement {
  key: string;
  message: string;
  priority: ScreenReaderPriority;
  interrupt?: boolean;
}

export interface AccessibilityLabelsSet {
  ariaLabels: Record<string, AriaLabel>;
  screenReaderTexts: Record<string, ScreenReaderText>;
  announcements: Record<string, AccessibilityAnnouncement>;
}

export interface AccessibilityLabelsResult {
  locale: SupportedLocale;
  isRTL: boolean;
  labels: AccessibilityLabelsSet;
  timestamp: Date;
}

// ARIA Labels for navigation elements
const NAVIGATION_ARIA_LABELS: Record<string, Record<SupportedLocale, AriaLabel>> = {
  mainNavigation: {
    ar: { key: 'mainNavigation', label: 'التنقل الرئيسي', category: 'navigation', description: 'Main site navigation menu' },
    he: { key: 'mainNavigation', label: 'ניווט ראשי', category: 'navigation', description: 'Main site navigation menu' },
    en: { key: 'mainNavigation', label: 'Main navigation', category: 'navigation', description: 'Main site navigation menu' },
  },
  breadcrumb: {
    ar: { key: 'breadcrumb', label: 'مسار التنقل', category: 'navigation', description: 'Breadcrumb navigation trail' },
    he: { key: 'breadcrumb', label: 'שביל ניווט', category: 'navigation', description: 'Breadcrumb navigation trail' },
    en: { key: 'breadcrumb', label: 'Breadcrumb', category: 'navigation', description: 'Breadcrumb navigation trail' },
  },
  searchButton: {
    ar: { key: 'searchButton', label: 'فتح البحث', category: 'navigation', description: 'Open search dialog' },
    he: { key: 'searchButton', label: 'פתח חיפוש', category: 'navigation', description: 'Open search dialog' },
    en: { key: 'searchButton', label: 'Open search', category: 'navigation', description: 'Open search dialog' },
  },
  menuButton: {
    ar: { key: 'menuButton', label: 'فتح القائمة', category: 'navigation', description: 'Open mobile menu' },
    he: { key: 'menuButton', label: 'פתח תפריט', category: 'navigation', description: 'Open mobile menu' },
    en: { key: 'menuButton', label: 'Open menu', category: 'navigation', description: 'Open mobile menu' },
  },
  closeMenu: {
    ar: { key: 'closeMenu', label: 'إغلاق القائمة', category: 'navigation', description: 'Close navigation menu' },
    he: { key: 'closeMenu', label: 'סגור תפריט', category: 'navigation', description: 'Close navigation menu' },
    en: { key: 'closeMenu', label: 'Close menu', category: 'navigation', description: 'Close navigation menu' },
  },
  skipToContent: {
    ar: { key: 'skipToContent', label: 'تخطي إلى المحتوى الرئيسي', category: 'navigation', description: 'Skip to main content link' },
    he: { key: 'skipToContent', label: 'דלג לתוכן ראשי', category: 'navigation', description: 'Skip to main content link' },
    en: { key: 'skipToContent', label: 'Skip to main content', category: 'navigation', description: 'Skip to main content link' },
  },
  backToTop: {
    ar: { key: 'backToTop', label: 'العودة إلى الأعلى', category: 'navigation', description: 'Back to top button' },
    he: { key: 'backToTop', label: 'חזור למעלה', category: 'navigation', description: 'Back to top button' },
    en: { key: 'backToTop', label: 'Back to top', category: 'navigation', description: 'Back to top button' },
  },
  languageSwitcher: {
    ar: { key: 'languageSwitcher', label: 'تبديل اللغة', category: 'navigation', description: 'Language selector' },
    he: { key: 'languageSwitcher', label: 'מחלף שפה', category: 'navigation', description: 'Language selector' },
    en: { key: 'languageSwitcher', label: 'Language switcher', category: 'navigation', description: 'Language selector' },
  },
  pagination: {
    ar: { key: 'pagination', label: 'ترقيم الصفحات', category: 'navigation', description: 'Pagination controls' },
    he: { key: 'pagination', label: 'עמודים', category: 'navigation', description: 'Pagination controls' },
    en: { key: 'pagination', label: 'Pagination', category: 'navigation', description: 'Pagination controls' },
  },
  nextPage: {
    ar: { key: 'nextPage', label: 'الصفحة التالية', category: 'navigation', description: 'Go to next page' },
    he: { key: 'nextPage', label: 'עמוד הבא', category: 'navigation', description: 'Go to next page' },
    en: { key: 'nextPage', label: 'Next page', category: 'navigation', description: 'Go to next page' },
  },
  previousPage: {
    ar: { key: 'previousPage', label: 'الصفحة السابقة', category: 'navigation', description: 'Go to previous page' },
    he: { key: 'previousPage', label: 'עמוד קודם', category: 'navigation', description: 'Go to previous page' },
    en: { key: 'previousPage', label: 'Previous page', category: 'navigation', description: 'Go to previous page' },
  },
};

// ARIA Labels for form elements
const FORMS_ARIA_LABELS: Record<string, Record<SupportedLocale, AriaLabel>> = {
  searchInput: {
    ar: { key: 'searchInput', label: 'حقل البحث', category: 'forms', description: 'Search input field' },
    he: { key: 'searchInput', label: 'שדה חיפוש', category: 'forms', description: 'Search input field' },
    en: { key: 'searchInput', label: 'Search field', category: 'forms', description: 'Search input field' },
  },
  emailInput: {
    ar: { key: 'emailInput', label: 'حقل البريد الإلكتروني', category: 'forms', description: 'Email input field' },
    he: { key: 'emailInput', label: 'שדה דואר אלקטרוני', category: 'forms', description: 'Email input field' },
    en: { key: 'emailInput', label: 'Email field', category: 'forms', description: 'Email input field' },
  },
  passwordInput: {
    ar: { key: 'passwordInput', label: 'حقل كلمة المرور', category: 'forms', description: 'Password input field' },
    he: { key: 'passwordInput', label: 'שדה סיסמה', category: 'forms', description: 'Password input field' },
    en: { key: 'passwordInput', label: 'Password field', category: 'forms', description: 'Password input field' },
  },
  requiredField: {
    ar: { key: 'requiredField', label: 'حقل مطلوب', category: 'forms', description: 'Required form field indicator' },
    he: { key: 'requiredField', label: 'שדה חובה', category: 'forms', description: 'Required form field indicator' },
    en: { key: 'requiredField', label: 'Required field', category: 'forms', description: 'Required form field indicator' },
  },
  submitButton: {
    ar: { key: 'submitButton', label: 'إرسال النموذج', category: 'forms', description: 'Submit form button' },
    he: { key: 'submitButton', label: 'שלח טופס', category: 'forms', description: 'Submit form button' },
    en: { key: 'submitButton', label: 'Submit form', category: 'forms', description: 'Submit form button' },
  },
  clearInput: {
    ar: { key: 'clearInput', label: 'مسح الإدخال', category: 'forms', description: 'Clear input button' },
    he: { key: 'clearInput', label: 'נקה קלט', category: 'forms', description: 'Clear input button' },
    en: { key: 'clearInput', label: 'Clear input', category: 'forms', description: 'Clear input button' },
  },
  showPassword: {
    ar: { key: 'showPassword', label: 'إظهار كلمة المرور', category: 'forms', description: 'Toggle password visibility' },
    he: { key: 'showPassword', label: 'הצג סיסמה', category: 'forms', description: 'Toggle password visibility' },
    en: { key: 'showPassword', label: 'Show password', category: 'forms', description: 'Toggle password visibility' },
  },
  hidePassword: {
    ar: { key: 'hidePassword', label: 'إخفاء كلمة المرور', category: 'forms', description: 'Toggle password visibility' },
    he: { key: 'hidePassword', label: 'הסתר סיסמה', category: 'forms', description: 'Toggle password visibility' },
    en: { key: 'hidePassword', label: 'Hide password', category: 'forms', description: 'Toggle password visibility' },
  },
  formError: {
    ar: { key: 'formError', label: 'خطأ في النموذج', category: 'forms', description: 'Form error message' },
    he: { key: 'formError', label: 'שגיאת טופס', category: 'forms', description: 'Form error message' },
    en: { key: 'formError', label: 'Form error', category: 'forms', description: 'Form error message' },
  },
  autocompleteResults: {
    ar: { key: 'autocompleteResults', label: 'نتائج الإكمال التلقائي', category: 'forms', description: 'Autocomplete suggestions' },
    he: { key: 'autocompleteResults', label: 'תוצאות השלמה אוטומטית', category: 'forms', description: 'Autocomplete suggestions' },
    en: { key: 'autocompleteResults', label: 'Autocomplete results', category: 'forms', description: 'Autocomplete suggestions' },
  },
};

// ARIA Labels for e-commerce elements
const ECOMMERCE_ARIA_LABELS: Record<string, Record<SupportedLocale, AriaLabel>> = {
  addToCart: {
    ar: { key: 'addToCart', label: 'إضافة إلى سلة التسوق', category: 'ecommerce', description: 'Add product to cart' },
    he: { key: 'addToCart', label: 'הוסף לעגלה', category: 'ecommerce', description: 'Add product to cart' },
    en: { key: 'addToCart', label: 'Add to cart', category: 'ecommerce', description: 'Add product to cart' },
  },
  removeFromCart: {
    ar: { key: 'removeFromCart', label: 'إزالة من سلة التسوق', category: 'ecommerce', description: 'Remove product from cart' },
    he: { key: 'removeFromCart', label: 'הסר מהעגלה', category: 'ecommerce', description: 'Remove product from cart' },
    en: { key: 'removeFromCart', label: 'Remove from cart', category: 'ecommerce', description: 'Remove product from cart' },
  },
  viewCart: {
    ar: { key: 'viewCart', label: 'عرض سلة التسوق', category: 'ecommerce', description: 'View shopping cart' },
    he: { key: 'viewCart', label: 'צפה בעגלה', category: 'ecommerce', description: 'View shopping cart' },
    en: { key: 'viewCart', label: 'View cart', category: 'ecommerce', description: 'View shopping cart' },
  },
  checkout: {
    ar: { key: 'checkout', label: 'إتمام الشراء', category: 'ecommerce', description: 'Proceed to checkout' },
    he: { key: 'checkout', label: 'המשך לקופה', category: 'ecommerce', description: 'Proceed to checkout' },
    en: { key: 'checkout', label: 'Checkout', category: 'ecommerce', description: 'Proceed to checkout' },
  },
  increaseQuantity: {
    ar: { key: 'increaseQuantity', label: 'زيادة الكمية', category: 'ecommerce', description: 'Increase product quantity' },
    he: { key: 'increaseQuantity', label: 'הגדל כמות', category: 'ecommerce', description: 'Increase product quantity' },
    en: { key: 'increaseQuantity', label: 'Increase quantity', category: 'ecommerce', description: 'Increase product quantity' },
  },
  decreaseQuantity: {
    ar: { key: 'decreaseQuantity', label: 'تقليل الكمية', category: 'ecommerce', description: 'Decrease product quantity' },
    he: { key: 'decreaseQuantity', label: 'הפחת כמות', category: 'ecommerce', description: 'Decrease product quantity' },
    en: { key: 'decreaseQuantity', label: 'Decrease quantity', category: 'ecommerce', description: 'Decrease product quantity' },
  },
  productImage: {
    ar: { key: 'productImage', label: 'صورة المنتج', category: 'ecommerce', description: 'Product image gallery' },
    he: { key: 'productImage', label: 'תמונת מוצר', category: 'ecommerce', description: 'Product image gallery' },
    en: { key: 'productImage', label: 'Product image', category: 'ecommerce', description: 'Product image gallery' },
  },
  wishlist: {
    ar: { key: 'wishlist', label: 'المفضلة', category: 'ecommerce', description: 'Add to wishlist' },
    he: { key: 'wishlist', label: 'רשימת משאלות', category: 'ecommerce', description: 'Add to wishlist' },
    en: { key: 'wishlist', label: 'Wishlist', category: 'ecommerce', description: 'Add to wishlist' },
  },
  removeFromWishlist: {
    ar: { key: 'removeFromWishlist', label: 'إزالة من المفضلة', category: 'ecommerce', description: 'Remove from wishlist' },
    he: { key: 'removeFromWishlist', label: 'הסר מרשימת משאלות', category: 'ecommerce', description: 'Remove from wishlist' },
    en: { key: 'removeFromWishlist', label: 'Remove from wishlist', category: 'ecommerce', description: 'Remove from wishlist' },
  },
  filterProducts: {
    ar: { key: 'filterProducts', label: 'تصفية المنتجات', category: 'ecommerce', description: 'Filter products' },
    he: { key: 'filterProducts', label: 'סנן מוצרים', category: 'ecommerce', description: 'Filter products' },
    en: { key: 'filterProducts', label: 'Filter products', category: 'ecommerce', description: 'Filter products' },
  },
  sortProducts: {
    ar: { key: 'sortProducts', label: 'ترتيب المنتجات', category: 'ecommerce', description: 'Sort products' },
    he: { key: 'sortProducts', label: 'מיין מוצרים', category: 'ecommerce', description: 'Sort products' },
    en: { key: 'sortProducts', label: 'Sort products', category: 'ecommerce', description: 'Sort products' },
  },
  applyFilters: {
    ar: { key: 'applyFilters', label: 'تطبيق التصفية', category: 'ecommerce', description: 'Apply selected filters' },
    he: { key: 'applyFilters', label: 'החל סינון', category: 'ecommerce', description: 'Apply selected filters' },
    en: { key: 'applyFilters', label: 'Apply filters', category: 'ecommerce', description: 'Apply selected filters' },
  },
  clearFilters: {
    ar: { key: 'clearFilters', label: 'مسح التصفية', category: 'ecommerce', description: 'Clear all filters' },
    he: { key: 'clearFilters', label: 'נקה סינון', category: 'ecommerce', description: 'Clear all filters' },
    en: { key: 'clearFilters', label: 'Clear filters', category: 'ecommerce', description: 'Clear all filters' },
  },
};

// ARIA Labels for feedback elements
const FEEDBACK_ARIA_LABELS: Record<string, Record<SupportedLocale, AriaLabel>> = {
  successMessage: {
    ar: { key: 'successMessage', label: 'رسالة نجاح', category: 'feedback', description: 'Success notification' },
    he: { key: 'successMessage', label: 'הודעת הצלחה', category: 'feedback', description: 'Success notification' },
    en: { key: 'successMessage', label: 'Success message', category: 'feedback', description: 'Success notification' },
  },
  errorMessage: {
    ar: { key: 'errorMessage', label: 'رسالة خطأ', category: 'feedback', description: 'Error notification' },
    he: { key: 'errorMessage', label: 'הודעת שגיאה', category: 'feedback', description: 'Error notification' },
    en: { key: 'errorMessage', label: 'Error message', category: 'feedback', description: 'Error notification' },
  },
  warningMessage: {
    ar: { key: 'warningMessage', label: 'رسالة تحذير', category: 'feedback', description: 'Warning notification' },
    he: { key: 'warningMessage', label: 'הודעת אזהרה', category: 'feedback', description: 'Warning notification' },
    en: { key: 'warningMessage', label: 'Warning message', category: 'feedback', description: 'Warning notification' },
  },
  infoMessage: {
    ar: { key: 'infoMessage', label: 'رسالة معلومات', category: 'feedback', description: 'Information notification' },
    he: { key: 'infoMessage', label: 'הודעת מידע', category: 'feedback', description: 'Information notification' },
    en: { key: 'infoMessage', label: 'Information message', category: 'feedback', description: 'Information notification' },
  },
  loading: {
    ar: { key: 'loading', label: 'جاري التحميل', category: 'feedback', description: 'Loading indicator' },
    he: { key: 'loading', label: 'טוען', category: 'feedback', description: 'Loading indicator' },
    en: { key: 'loading', label: 'Loading', category: 'feedback', description: 'Loading indicator' },
  },
  closeNotification: {
    ar: { key: 'closeNotification', label: 'إغلاق الإشعار', category: 'feedback', description: 'Close notification' },
    he: { key: 'closeNotification', label: 'סגור הודעה', category: 'feedback', description: 'Close notification' },
    en: { key: 'closeNotification', label: 'Close notification', category: 'feedback', description: 'Close notification' },
  },
};

// ARIA Labels for media elements
const MEDIA_ARIA_LABELS: Record<string, Record<SupportedLocale, AriaLabel>> = {
  playVideo: {
    ar: { key: 'playVideo', label: 'تشغيل الفيديو', category: 'media', description: 'Play video button' },
    he: { key: 'playVideo', label: 'נגן וידאו', category: 'media', description: 'Play video button' },
    en: { key: 'playVideo', label: 'Play video', category: 'media', description: 'Play video button' },
  },
  pauseVideo: {
    ar: { key: 'pauseVideo', label: 'إيقاف الفيديو مؤقتاً', category: 'media', description: 'Pause video button' },
    he: { key: 'pauseVideo', label: 'השהה וידאו', category: 'media', description: 'Pause video button' },
    en: { key: 'pauseVideo', label: 'Pause video', category: 'media', description: 'Pause video button' },
  },
  mute: {
    ar: { key: 'mute', label: 'كتم الصوت', category: 'media', description: 'Mute audio' },
    he: { key: 'mute', label: 'השתק', category: 'media', description: 'Mute audio' },
    en: { key: 'mute', label: 'Mute', category: 'media', description: 'Mute audio' },
  },
  unmute: {
    ar: { key: 'unmute', label: 'إلغاء كتم الصوت', category: 'media', description: 'Unmute audio' },
    he: { key: 'unmute', label: 'בטל השתקה', category: 'media', description: 'Unmute audio' },
    en: { key: 'unmute', label: 'Unmute', category: 'media', description: 'Unmute audio' },
  },
  imageGallery: {
    ar: { key: 'imageGallery', label: 'معرض الصور', category: 'media', description: 'Image gallery carousel' },
    he: { key: 'imageGallery', label: 'גלריית תמונות', category: 'media', description: 'Image gallery carousel' },
    en: { key: 'imageGallery', label: 'Image gallery', category: 'media', description: 'Image gallery carousel' },
  },
  nextImage: {
    ar: { key: 'nextImage', label: 'الصورة التالية', category: 'media', description: 'Next image in gallery' },
    he: { key: 'nextImage', label: 'תמונה הבאה', category: 'media', description: 'Next image in gallery' },
    en: { key: 'nextImage', label: 'Next image', category: 'media', description: 'Next image in gallery' },
  },
  previousImage: {
    ar: { key: 'previousImage', label: 'الصورة السابقة', category: 'media', description: 'Previous image in gallery' },
    he: { key: 'previousImage', label: 'תמונה קודמת', category: 'media', description: 'Previous image in gallery' },
    en: { key: 'previousImage', label: 'Previous image', category: 'media', description: 'Previous image in gallery' },
  },
  zoomImage: {
    ar: { key: 'zoomImage', label: 'تكبير الصورة', category: 'media', description: 'Zoom in on image' },
    he: { key: 'zoomImage', label: 'הגדל תמונה', category: 'media', description: 'Zoom in on image' },
    en: { key: 'zoomImage', label: 'Zoom image', category: 'media', description: 'Zoom in on image' },
  },
};

// General ARIA Labels
const GENERAL_ARIA_LABELS: Record<string, Record<SupportedLocale, AriaLabel>> = {
  close: {
    ar: { key: 'close', label: 'إغلاق', category: 'general', description: 'Close button' },
    he: { key: 'close', label: 'סגור', category: 'general', description: 'Close button' },
    en: { key: 'close', label: 'Close', category: 'general', description: 'Close button' },
  },
  open: {
    ar: { key: 'open', label: 'فتح', category: 'general', description: 'Open button' },
    he: { key: 'open', label: 'פתח', category: 'general', description: 'Open button' },
    en: { key: 'open', label: 'Open', category: 'general', description: 'Open button' },
  },
  expand: {
    ar: { key: 'expand', label: 'توسيع', category: 'general', description: 'Expand content' },
    he: { key: 'expand', label: 'הרחב', category: 'general', description: 'Expand content' },
    en: { key: 'expand', label: 'Expand', category: 'general', description: 'Expand content' },
  },
  collapse: {
    ar: { key: 'collapse', label: 'طي', category: 'general', description: 'Collapse content' },
    he: { key: 'collapse', label: 'כווץ', category: 'general', description: 'Collapse content' },
    en: { key: 'collapse', label: 'Collapse', category: 'general', description: 'Collapse content' },
  },
  selected: {
    ar: { key: 'selected', label: 'محدد', category: 'general', description: 'Selected state' },
    he: { key: 'selected', label: 'נבחר', category: 'general', description: 'Selected state' },
    en: { key: 'selected', label: 'Selected', category: 'general', description: 'Selected state' },
  },
  notSelected: {
    ar: { key: 'notSelected', label: 'غير محدد', category: 'general', description: 'Not selected state' },
    he: { key: 'notSelected', label: 'לא נבחר', category: 'general', description: 'Not selected state' },
    en: { key: 'notSelected', label: 'Not selected', category: 'general', description: 'Not selected state' },
  },
  newWindow: {
    ar: { key: 'newWindow', label: 'يفتح في نافذة جديدة', category: 'general', description: 'Link opens in new window' },
    he: { key: 'newWindow', label: 'נפתח בחלון חדש', category: 'general', description: 'Link opens in new window' },
    en: { key: 'newWindow', label: 'Opens in new window', category: 'general', description: 'Link opens in new window' },
  },
  externalLink: {
    ar: { key: 'externalLink', label: 'رابط خارجي', category: 'general', description: 'External website link' },
    he: { key: 'externalLink', label: 'קישור חיצוני', category: 'general', description: 'External website link' },
    en: { key: 'externalLink', label: 'External link', category: 'general', description: 'External website link' },
  },
};

// Combine all ARIA labels
const ALL_ARIA_LABELS: Record<string, Record<SupportedLocale, AriaLabel>> = {
  ...NAVIGATION_ARIA_LABELS,
  ...FORMS_ARIA_LABELS,
  ...ECOMMERCE_ARIA_LABELS,
  ...FEEDBACK_ARIA_LABELS,
  ...MEDIA_ARIA_LABELS,
  ...GENERAL_ARIA_LABELS,
};

// Screen reader texts
const SCREEN_READER_TEXTS: Record<string, Record<SupportedLocale, ScreenReaderText>> = {
  pageLoaded: {
    ar: { key: 'pageLoaded', text: 'تم تحميل الصفحة', priority: 'polite', context: 'Page navigation' },
    he: { key: 'pageLoaded', text: 'הדף נטען', priority: 'polite', context: 'Page navigation' },
    en: { key: 'pageLoaded', text: 'Page loaded', priority: 'polite', context: 'Page navigation' },
  },
  searchResultsUpdated: {
    ar: { key: 'searchResultsUpdated', text: 'تم تحديث نتائج البحث', priority: 'polite', context: 'Search results' },
    he: { key: 'searchResultsUpdated', text: 'תוצאות החיפוש עודכנו', priority: 'polite', context: 'Search results' },
    en: { key: 'searchResultsUpdated', text: 'Search results updated', priority: 'polite', context: 'Search results' },
  },
  itemAddedToCart: {
    ar: { key: 'itemAddedToCart', text: 'تمت إضافة المنتج إلى سلة التسوق', priority: 'polite', context: 'Cart actions' },
    he: { key: 'itemAddedToCart', text: 'המוצר נוסף לעגלה', priority: 'polite', context: 'Cart actions' },
    en: { key: 'itemAddedToCart', text: 'Item added to cart', priority: 'polite', context: 'Cart actions' },
  },
  itemRemovedFromCart: {
    ar: { key: 'itemRemovedFromCart', text: 'تمت إزالة المنتج من سلة التسوق', priority: 'polite', context: 'Cart actions' },
    he: { key: 'itemRemovedFromCart', text: 'המוצר הוסר מהעגלה', priority: 'polite', context: 'Cart actions' },
    en: { key: 'itemRemovedFromCart', text: 'Item removed from cart', priority: 'polite', context: 'Cart actions' },
  },
  cartUpdated: {
    ar: { key: 'cartUpdated', text: 'تم تحديث سلة التسوق', priority: 'polite', context: 'Cart actions' },
    he: { key: 'cartUpdated', text: 'העגלה עודכנה', priority: 'polite', context: 'Cart actions' },
    en: { key: 'cartUpdated', text: 'Cart updated', priority: 'polite', context: 'Cart actions' },
  },
  formSubmitted: {
    ar: { key: 'formSubmitted', text: 'تم إرسال النموذج بنجاح', priority: 'polite', context: 'Form submission' },
    he: { key: 'formSubmitted', text: 'הטופס נשלח בהצלחה', priority: 'polite', context: 'Form submission' },
    en: { key: 'formSubmitted', text: 'Form submitted successfully', priority: 'polite', context: 'Form submission' },
  },
  formErrors: {
    ar: { key: 'formErrors', text: 'يرجى تصحيح الأخطاء في النموذج', priority: 'assertive', context: 'Form validation' },
    he: { key: 'formErrors', text: 'אנא תקן את השגיאות בטופס', priority: 'assertive', context: 'Form validation' },
    en: { key: 'formErrors', text: 'Please correct the errors in the form', priority: 'assertive', context: 'Form validation' },
  },
  requiredFieldMissing: {
    ar: { key: 'requiredFieldMissing', text: 'حقل مطلوب مفقود', priority: 'assertive', context: 'Form validation' },
    he: { key: 'requiredFieldMissing', text: 'שדה חובה חסר', priority: 'assertive', context: 'Form validation' },
    en: { key: 'requiredFieldMissing', text: 'Required field missing', priority: 'assertive', context: 'Form validation' },
  },
  loadingContent: {
    ar: { key: 'loadingContent', text: 'جاري تحميل المحتوى', priority: 'polite', context: 'Loading states' },
    he: { key: 'loadingContent', text: 'טוען תוכן', priority: 'polite', context: 'Loading states' },
    en: { key: 'loadingContent', text: 'Loading content', priority: 'polite', context: 'Loading states' },
  },
  contentLoaded: {
    ar: { key: 'contentLoaded', text: 'تم تحميل المحتوى', priority: 'polite', context: 'Loading states' },
    he: { key: 'contentLoaded', text: 'התוכן נטען', priority: 'polite', context: 'Loading states' },
    en: { key: 'contentLoaded', text: 'Content loaded', priority: 'polite', context: 'Loading states' },
  },
  modalOpened: {
    ar: { key: 'modalOpened', text: 'تم فتح نافذة منبثقة', priority: 'assertive', context: 'Modal dialogs' },
    he: { key: 'modalOpened', text: 'חלון קופץ נפתח', priority: 'assertive', context: 'Modal dialogs' },
    en: { key: 'modalOpened', text: 'Dialog opened', priority: 'assertive', context: 'Modal dialogs' },
  },
  modalClosed: {
    ar: { key: 'modalClosed', text: 'تم إغلاق النافذة المنبثقة', priority: 'polite', context: 'Modal dialogs' },
    he: { key: 'modalClosed', text: 'חלון קופץ נסגר', priority: 'polite', context: 'Modal dialogs' },
    en: { key: 'modalClosed', text: 'Dialog closed', priority: 'polite', context: 'Modal dialogs' },
  },
  menuOpened: {
    ar: { key: 'menuOpened', text: 'تم فتح القائمة', priority: 'polite', context: 'Menu actions' },
    he: { key: 'menuOpened', text: 'התפריט נפתח', priority: 'polite', context: 'Menu actions' },
    en: { key: 'menuOpened', text: 'Menu opened', priority: 'polite', context: 'Menu actions' },
  },
  menuClosed: {
    ar: { key: 'menuClosed', text: 'تم إغلاق القائمة', priority: 'polite', context: 'Menu actions' },
    he: { key: 'menuClosed', text: 'התפריט נסגר', priority: 'polite', context: 'Menu actions' },
    en: { key: 'menuClosed', text: 'Menu closed', priority: 'polite', context: 'Menu actions' },
  },
  currentPage: {
    ar: { key: 'currentPage', text: 'الصفحة الحالية', priority: 'polite', context: 'Pagination' },
    he: { key: 'currentPage', text: 'עמוד נוכחי', priority: 'polite', context: 'Pagination' },
    en: { key: 'currentPage', text: 'Current page', priority: 'polite', context: 'Pagination' },
  },
  totalPages: {
    ar: { key: 'totalPages', text: 'من إجمالي الصفحات', priority: 'polite', context: 'Pagination' },
    he: { key: 'totalPages', text: 'מתוך סה"כ עמודים', priority: 'polite', context: 'Pagination' },
    en: { key: 'totalPages', text: 'of total pages', priority: 'polite', context: 'Pagination' },
  },
  itemCount: {
    ar: { key: 'itemCount', text: 'عدد العناصر', priority: 'polite', context: 'List information' },
    he: { key: 'itemCount', text: 'מספר פריטים', priority: 'polite', context: 'List information' },
    en: { key: 'itemCount', text: 'Item count', priority: 'polite', context: 'List information' },
  },
  filtersApplied: {
    ar: { key: 'filtersApplied', text: 'تم تطبيق عوامل التصفية', priority: 'polite', context: 'Filter actions' },
    he: { key: 'filtersApplied', text: 'מסננים הוחלו', priority: 'polite', context: 'Filter actions' },
    en: { key: 'filtersApplied', text: 'Filters applied', priority: 'polite', context: 'Filter actions' },
  },
  filtersCleared: {
    ar: { key: 'filtersCleared', text: 'تم مسح عوامل التصفية', priority: 'polite', context: 'Filter actions' },
    he: { key: 'filtersCleared', text: 'מסננים נוקו', priority: 'polite', context: 'Filter actions' },
    en: { key: 'filtersCleared', text: 'Filters cleared', priority: 'polite', context: 'Filter actions' },
  },
  languageChanged: {
    ar: { key: 'languageChanged', text: 'تم تغيير اللغة', priority: 'polite', context: 'Language switch' },
    he: { key: 'languageChanged', text: 'השפה שונתה', priority: 'polite', context: 'Language switch' },
    en: { key: 'languageChanged', text: 'Language changed', priority: 'polite', context: 'Language switch' },
  },
  copiedToClipboard: {
    ar: { key: 'copiedToClipboard', text: 'تم النسخ إلى الحافظة', priority: 'polite', context: 'Clipboard actions' },
    he: { key: 'copiedToClipboard', text: 'הועתק ללוח', priority: 'polite', context: 'Clipboard actions' },
    en: { key: 'copiedToClipboard', text: 'Copied to clipboard', priority: 'polite', context: 'Clipboard actions' },
  },
  wishlistUpdated: {
    ar: { key: 'wishlistUpdated', text: 'تم تحديث المفضلة', priority: 'polite', context: 'Wishlist actions' },
    he: { key: 'wishlistUpdated', text: 'רשימת המשאלות עודכנה', priority: 'polite', context: 'Wishlist actions' },
    en: { key: 'wishlistUpdated', text: 'Wishlist updated', priority: 'polite', context: 'Wishlist actions' },
  },
  productImageChanged: {
    ar: { key: 'productImageChanged', text: 'تم تغيير صورة المنتج', priority: 'polite', context: 'Image gallery' },
    he: { key: 'productImageChanged', text: 'תמונת המוצר השתנתה', priority: 'polite', context: 'Image gallery' },
    en: { key: 'productImageChanged', text: 'Product image changed', priority: 'polite', context: 'Image gallery' },
  },
  quantityUpdated: {
    ar: { key: 'quantityUpdated', text: 'تم تحديث الكمية', priority: 'polite', context: 'Cart actions' },
    he: { key: 'quantityUpdated', text: 'הכמות עודכנה', priority: 'polite', context: 'Cart actions' },
    en: { key: 'quantityUpdated', text: 'Quantity updated', priority: 'polite', context: 'Cart actions' },
  },
};

// Accessibility announcements
const ACCESSIBILITY_ANNOUNCEMENTS: Record<string, Record<SupportedLocale, AccessibilityAnnouncement>> = {
  cartEmpty: {
    ar: { key: 'cartEmpty', message: 'سلة التسوق فارغة', priority: 'polite', interrupt: false },
    he: { key: 'cartEmpty', message: 'עגלת הקניות ריקה', priority: 'polite', interrupt: false },
    en: { key: 'cartEmpty', message: 'Your cart is empty', priority: 'polite', interrupt: false },
  },
  cartHasItems: {
    ar: { key: 'cartHasItems', message: 'تحتوي سلة التسوق على منتجات', priority: 'polite', interrupt: false },
    he: { key: 'cartHasItems', message: 'יש פריטים בעגלה', priority: 'polite', interrupt: false },
    en: { key: 'cartHasItems', message: 'Your cart has items', priority: 'polite', interrupt: false },
  },
  checkoutComplete: {
    ar: { key: 'checkoutComplete', message: 'تم إتمام الشراء بنجاح، شكراً لك', priority: 'assertive', interrupt: true },
    he: { key: 'checkoutComplete', message: 'הקנייה הושלמה בהצלחה, תודה לך', priority: 'assertive', interrupt: true },
    en: { key: 'checkoutComplete', message: 'Checkout completed successfully, thank you', priority: 'assertive', interrupt: true },
  },
  sessionExpired: {
    ar: { key: 'sessionExpired', message: 'انتهت جلستك، يرجى تسجيل الدخول مرة أخرى', priority: 'assertive', interrupt: true },
    he: { key: 'sessionExpired', message: 'פג תוקף ההתחברות, אנא התחבר שוב', priority: 'assertive', interrupt: true },
    en: { key: 'sessionExpired', message: 'Your session has expired, please log in again', priority: 'assertive', interrupt: true },
  },
  connectionLost: {
    ar: { key: 'connectionLost', message: 'فقدان الاتصال بالإنترنت', priority: 'assertive', interrupt: true },
    he: { key: 'connectionLost', message: 'חיבור האינטרנט אבד', priority: 'assertive', interrupt: true },
    en: { key: 'connectionLost', message: 'Internet connection lost', priority: 'assertive', interrupt: true },
  },
  connectionRestored: {
    ar: { key: 'connectionRestored', message: 'تم استعادة الاتصال بالإنترنت', priority: 'polite', interrupt: false },
    he: { key: 'connectionRestored', message: 'חיבור האינטרנט שוחזר', priority: 'polite', interrupt: false },
    en: { key: 'connectionRestored', message: 'Internet connection restored', priority: 'polite', interrupt: false },
  },
  errorOccurred: {
    ar: { key: 'errorOccurred', message: 'حدث خطأ، يرجى المحاولة مرة أخرى', priority: 'assertive', interrupt: true },
    he: { key: 'errorOccurred', message: 'אירעה שגיאה, אנא נסה שוב', priority: 'assertive', interrupt: true },
    en: { key: 'errorOccurred', message: 'An error occurred, please try again', priority: 'assertive', interrupt: true },
  },
  savingChanges: {
    ar: { key: 'savingChanges', message: 'جاري حفظ التغييرات', priority: 'polite', interrupt: false },
    he: { key: 'savingChanges', message: 'שומר שינויים', priority: 'polite', interrupt: false },
    en: { key: 'savingChanges', message: 'Saving changes', priority: 'polite', interrupt: false },
  },
  changesSaved: {
    ar: { key: 'changesSaved', message: 'تم حفظ التغييرات بنجاح', priority: 'polite', interrupt: false },
    he: { key: 'changesSaved', message: 'השינויים נשמרו בהצלחה', priority: 'polite', interrupt: false },
    en: { key: 'changesSaved', message: 'Changes saved successfully', priority: 'polite', interrupt: false },
  },
  searchNoResults: {
    ar: { key: 'searchNoResults', message: 'لم يتم العثور على نتائج للبحث', priority: 'polite', interrupt: false },
    he: { key: 'searchNoResults', message: 'לא נמצאו תוצאות חיפוש', priority: 'polite', interrupt: false },
    en: { key: 'searchNoResults', message: 'No search results found', priority: 'polite', interrupt: false },
  },
  itemOutOfStock: {
    ar: { key: 'itemOutOfStock', message: 'المنتج غير متوفر حالياً', priority: 'assertive', interrupt: true },
    he: { key: 'itemOutOfStock', message: 'המוצר אזל מהמלאי', priority: 'assertive', interrupt: true },
    en: { key: 'itemOutOfStock', message: 'Item is out of stock', priority: 'assertive', interrupt: true },
  },
  itemLowStock: {
    ar: { key: 'itemLowStock', message: 'المنتج متوفر بكمية محدودة', priority: 'polite', interrupt: false },
    he: { key: 'itemLowStock', message: 'המוצר במלאי מוגבל', priority: 'polite', interrupt: false },
    en: { key: 'itemLowStock', message: 'Item is low in stock', priority: 'polite', interrupt: false },
  },
  discountApplied: {
    ar: { key: 'discountApplied', message: 'تم تطبيق الخصم', priority: 'polite', interrupt: false },
    he: { key: 'discountApplied', message: 'הנחה הוחלה', priority: 'polite', interrupt: false },
    en: { key: 'discountApplied', message: 'Discount applied', priority: 'polite', interrupt: false },
  },
  discountRemoved: {
    ar: { key: 'discountRemoved', message: 'تم إزالة الخصم', priority: 'polite', interrupt: false },
    he: { key: 'discountRemoved', message: 'הנחה הוסרה', priority: 'polite', interrupt: false },
    en: { key: 'discountRemoved', message: 'Discount removed', priority: 'polite', interrupt: false },
  },
  shippingAddressUpdated: {
    ar: { key: 'shippingAddressUpdated', message: 'تم تحديث عنوان الشحن', priority: 'polite', interrupt: false },
    he: { key: 'shippingAddressUpdated', message: 'כתובת המשלוח עודכנה', priority: 'polite', interrupt: false },
    en: { key: 'shippingAddressUpdated', message: 'Shipping address updated', priority: 'polite', interrupt: false },
  },
  paymentMethodUpdated: {
    ar: { key: 'paymentMethodUpdated', message: 'تم تحديث طريقة الدفع', priority: 'polite', interrupt: false },
    he: { key: 'paymentMethodUpdated', message: 'אמצעי התשלום עודכן', priority: 'polite', interrupt: false },
    en: { key: 'paymentMethodUpdated', message: 'Payment method updated', priority: 'polite', interrupt: false },
  },
};

// RTL locales
const RTL_LOCALES: SupportedLocale[] = ['ar', 'he'];

// Default locale
const DEFAULT_LOCALE: SupportedLocale = 'en';

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
