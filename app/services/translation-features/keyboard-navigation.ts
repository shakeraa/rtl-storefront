/**
 * Keyboard Navigation Translation Service
 * Provides localized labels for keyboard shortcuts, navigation instructions,
 * focus management text, and accessibility help for RTL contexts
 * Supports: ar (Arabic), he (Hebrew), en (English)
 */

export interface KeyboardShortcut {
  id: string;
  keys: string[];
  action: string;
  description?: string;
  category: ShortcutCategory;
}

export type ShortcutCategory = 
  | 'navigation' 
  | 'action' 
  | 'editing' 
  | 'view' 
  | 'help' 
  | 'media' 
  | 'accessibility';

export interface NavigationInstruction {
  id: string;
  instruction: string;
  context: string;
  order: number;
}

export interface FocusManagementLabel {
  id: string;
  label: string;
  ariaLabel?: string;
  role?: string;
}

export interface KeyboardHelpSection {
  id: string;
  title: string;
  description?: string;
  shortcuts: KeyboardShortcut[];
}

const KEYBOARD_SHORTCUTS: Record<string, Record<string, KeyboardShortcut>> = {
  ar: {
    'nav-next': { id: 'nav-next', keys: ['Tab'], action: 'الانتقال للعنصر التالي', description: 'الانتقال إلى العنصر التالي في التسلسل', category: 'navigation' },
    'nav-prev': { id: 'nav-prev', keys: ['Shift', 'Tab'], action: 'الانتقال للعنصر السابق', description: 'الانتقال إلى العنصر السابق في التسلسل', category: 'navigation' },
    'nav-first': { id: 'nav-first', keys: ['Home'], action: 'الانتقال للأول', description: 'الانتقال إلى العنصر الأول', category: 'navigation' },
    'nav-last': { id: 'nav-last', keys: ['End'], action: 'الانتقال للأخير', description: 'الانتقال إلى العنصر الأخير', category: 'navigation' },
    'nav-up': { id: 'nav-up', keys: ['↑'], action: 'الانتقال لأعلى', category: 'navigation' },
    'nav-down': { id: 'nav-down', keys: ['↓'], action: 'الانتقال لأسفل', category: 'navigation' },
    'nav-left': { id: 'nav-left', keys: ['←'], action: 'الانتقال لليسار', description: 'في RTL: الانتقال للعنصر التالي', category: 'navigation' },
    'nav-right': { id: 'nav-right', keys: ['→'], action: 'الانتقال لليمين', description: 'في RTL: الانتقال للعنصر السابق', category: 'navigation' },
    'action-select': { id: 'action-select', keys: ['Enter'], action: 'تحديد', description: 'تنشيط الزر أو الارتباط المحدد', category: 'action' },
    'action-space': { id: 'action-space', keys: ['Space'], action: 'تبديل', description: 'تبديل مربع الاختيار أو زر الاختيار', category: 'action' },
    'action-escape': { id: 'action-escape', keys: ['Esc'], action: 'إغلاق', description: 'إغلاق النافذة المنبثقة أو القائمة', category: 'action' },
    'edit-undo': { id: 'edit-undo', keys: ['Ctrl', 'Z'], action: 'تراجع', category: 'editing' },
    'edit-redo': { id: 'edit-redo', keys: ['Ctrl', 'Y'], action: 'إعادة', category: 'editing' },
    'edit-copy': { id: 'edit-copy', keys: ['Ctrl', 'C'], action: 'نسخ', category: 'editing' },
    'edit-paste': { id: 'edit-paste', keys: ['Ctrl', 'V'], action: 'لصق', category: 'editing' },
    'edit-cut': { id: 'edit-cut', keys: ['Ctrl', 'X'], action: 'قص', category: 'editing' },
    'edit-select-all': { id: 'edit-select-all', keys: ['Ctrl', 'A'], action: 'تحديد الكل', category: 'editing' },
    'help-shortcuts': { id: 'help-shortcuts', keys: ['?'], action: 'عرض اختصارات لوحة المفاتيح', category: 'help' },
    'focus-skip': { id: 'focus-skip', keys: ['Ctrl', 'Home'], action: 'تخطي إلى المحتوى الرئيسي', category: 'accessibility' },
    'focus-landmark': { id: 'focus-landmark', keys: ['D'], action: 'الانتقال للمعالم التالية', category: 'accessibility' },
    'view-zoom-in': { id: 'view-zoom-in', keys: ['Ctrl', '+'], action: 'تكبير', category: 'view' },
    'view-zoom-out': { id: 'view-zoom-out', keys: ['Ctrl', '-'], action: 'تصغير', category: 'view' },
    'view-zoom-reset': { id: 'view-zoom-reset', keys: ['Ctrl', '0'], action: 'إعادة التعيين', category: 'view' },
  },
  he: {
    'nav-next': { id: 'nav-next', keys: ['Tab'], action: 'מעבר לפריט הבא', description: 'מעבר לפריט הבא בסדר', category: 'navigation' },
    'nav-prev': { id: 'nav-prev', keys: ['Shift', 'Tab'], action: 'מעבר לפריט הקודם', description: 'מעבר לפריט הקודם בסדר', category: 'navigation' },
    'nav-first': { id: 'nav-first', keys: ['Home'], action: 'מעבר לראשון', description: 'מעבר לפריט הראשון', category: 'navigation' },
    'nav-last': { id: 'nav-last', keys: ['End'], action: 'מעבר לאחרון', description: 'מעבר לפריט האחרון', category: 'navigation' },
    'nav-up': { id: 'nav-up', keys: ['↑'], action: 'מעבר למעלה', category: 'navigation' },
    'nav-down': { id: 'nav-down', keys: ['↓'], action: 'מעבר למטה', category: 'navigation' },
    'nav-left': { id: 'nav-left', keys: ['←'], action: 'מעבר שמאלה', description: 'ב-RTL: מעבר לפריט הבא', category: 'navigation' },
    'nav-right': { id: 'nav-right', keys: ['→'], action: 'מעבר ימינה', description: 'ב-RTL: מעבר לפריט הקודם', category: 'navigation' },
    'action-select': { id: 'action-select', keys: ['Enter'], action: 'בחירה', description: 'הפעלת כפתור או קישור נבחר', category: 'action' },
    'action-space': { id: 'action-space', keys: ['Space'], action: 'החלפה', description: 'החלפת תיבת סימון או כפתור רדיו', category: 'action' },
    'action-escape': { id: 'action-escape', keys: ['Esc'], action: 'סגירה', description: 'סגירת חלון קופץ או תפריט', category: 'action' },
    'edit-undo': { id: 'edit-undo', keys: ['Ctrl', 'Z'], action: 'ביטול', category: 'editing' },
    'edit-redo': { id: 'edit-redo', keys: ['Ctrl', 'Y'], action: 'ביצוע מחדש', category: 'editing' },
    'edit-copy': { id: 'edit-copy', keys: ['Ctrl', 'C'], action: 'העתקה', category: 'editing' },
    'edit-paste': { id: 'edit-paste', keys: ['Ctrl', 'V'], action: 'הדבקה', category: 'editing' },
    'edit-cut': { id: 'edit-cut', keys: ['Ctrl', 'X'], action: 'גזירה', category: 'editing' },
    'edit-select-all': { id: 'edit-select-all', keys: ['Ctrl', 'A'], action: 'בחירת הכל', category: 'editing' },
    'help-shortcuts': { id: 'help-shortcuts', keys: ['?'], action: 'הצגת קיצורי מקלדת', category: 'help' },
    'focus-skip': { id: 'focus-skip', keys: ['Ctrl', 'Home'], action: 'דילוג לתוכן הראשי', category: 'accessibility' },
    'focus-landmark': { id: 'focus-landmark', keys: ['D'], action: 'מעבר לנקודת ציון הבאה', category: 'accessibility' },
    'view-zoom-in': { id: 'view-zoom-in', keys: ['Ctrl', '+'], action: 'הגדלה', category: 'view' },
    'view-zoom-out': { id: 'view-zoom-out', keys: ['Ctrl', '-'], action: 'הקטנה', category: 'view' },
    'view-zoom-reset': { id: 'view-zoom-reset', keys: ['Ctrl', '0'], action: 'איפוס', category: 'view' },
  },
  en: {
    'nav-next': { id: 'nav-next', keys: ['Tab'], action: 'Next Item', description: 'Move to the next item in sequence', category: 'navigation' },
    'nav-prev': { id: 'nav-prev', keys: ['Shift', 'Tab'], action: 'Previous Item', description: 'Move to the previous item in sequence', category: 'navigation' },
    'nav-first': { id: 'nav-first', keys: ['Home'], action: 'First Item', description: 'Move to the first item', category: 'navigation' },
    'nav-last': { id: 'nav-last', keys: ['End'], action: 'Last Item', description: 'Move to the last item', category: 'navigation' },
    'nav-up': { id: 'nav-up', keys: ['↑'], action: 'Move Up', category: 'navigation' },
    'nav-down': { id: 'nav-down', keys: ['↓'], action: 'Move Down', category: 'navigation' },
    'nav-left': { id: 'nav-left', keys: ['←'], action: 'Move Left', description: 'In RTL: moves to previous item', category: 'navigation' },
    'nav-right': { id: 'nav-right', keys: ['→'], action: 'Move Right', description: 'In RTL: moves to next item', category: 'navigation' },
    'action-select': { id: 'action-select', keys: ['Enter'], action: 'Select', description: 'Activate selected button or link', category: 'action' },
    'action-space': { id: 'action-space', keys: ['Space'], action: 'Toggle', description: 'Toggle checkbox or radio button', category: 'action' },
    'action-escape': { id: 'action-escape', keys: ['Esc'], action: 'Close', description: 'Close modal or menu', category: 'action' },
    'edit-undo': { id: 'edit-undo', keys: ['Ctrl', 'Z'], action: 'Undo', category: 'editing' },
    'edit-redo': { id: 'edit-redo', keys: ['Ctrl', 'Y'], action: 'Redo', category: 'editing' },
    'edit-copy': { id: 'edit-copy', keys: ['Ctrl', 'C'], action: 'Copy', category: 'editing' },
    'edit-paste': { id: 'edit-paste', keys: ['Ctrl', 'V'], action: 'Paste', category: 'editing' },
    'edit-cut': { id: 'edit-cut', keys: ['Ctrl', 'X'], action: 'Cut', category: 'editing' },
    'edit-select-all': { id: 'edit-select-all', keys: ['Ctrl', 'A'], action: 'Select All', category: 'editing' },
    'help-shortcuts': { id: 'help-shortcuts', keys: ['?'], action: 'Show Keyboard Shortcuts', category: 'help' },
    'focus-skip': { id: 'focus-skip', keys: ['Ctrl', 'Home'], action: 'Skip to Main Content', category: 'accessibility' },
    'focus-landmark': { id: 'focus-landmark', keys: ['D'], action: 'Go to Next Landmark', category: 'accessibility' },
    'view-zoom-in': { id: 'view-zoom-in', keys: ['Ctrl', '+'], action: 'Zoom In', category: 'view' },
    'view-zoom-out': { id: 'view-zoom-out', keys: ['Ctrl', '-'], action: 'Zoom Out', category: 'view' },
    'view-zoom-reset': { id: 'view-zoom-reset', keys: ['Ctrl', '0'], action: 'Reset Zoom', category: 'view' },
  },
};

const NAVIGATION_INSTRUCTIONS: Record<string, NavigationInstruction[]> = {
  ar: [
    { id: 'intro', instruction: 'يمكنك التنقل في الموقع باستخدام لوحة المفاتيح', context: 'general', order: 1 },
    { id: 'tab-nav', instruction: 'استخدم مفتاح Tab للانتقال بين العناصر التفاعلية', context: 'basic', order: 2 },
    { id: 'shift-tab', instruction: 'استخدم Shift+Tab للانتقال للخلف', context: 'basic', order: 3 },
    { id: 'rtl-note', instruction: 'في الوضع من اليمين لليسار، مفتاح السهم الأيمن ينقل للأمام ومفتاح السهم الأيسر ينقل للخلف', context: 'rtl', order: 4 },
    { id: 'enter-action', instruction: 'اضغط Enter لتنشيط الروابط والأزرار', context: 'action', order: 5 },
    { id: 'space-toggle', instruction: 'اضغط مفتاح المسافة لتبديل مربعات الاختيار', context: 'action', order: 6 },
    { id: 'escape-close', instruction: 'اضغط Escape لإغلاق النوافذ المنبثقة والقوائم', context: 'modal', order: 7 },
    { id: 'home-end', instruction: 'استخدم Home و End للانتقال للبداية والنهاية', context: 'list', order: 8 },
    { id: 'arrow-keys', instruction: 'استخدم مفاتيح الأسهم للتنقل داخل القوائم والجداول', context: 'list', order: 9 },
    { id: 'skip-link', instruction: 'اضغط Ctrl+Home للانتقال السريع إلى المحتوى الرئيسي', context: 'accessibility', order: 10 },
  ],
  he: [
    { id: 'intro', instruction: 'ניתן לנווט באתר באמצעות המקלדת', context: 'general', order: 1 },
    { id: 'tab-nav', instruction: 'השתמשו במקש Tab כדי לעבור בין פריטים אינטראקטיביים', context: 'basic', order: 2 },
    { id: 'shift-tab', instruction: 'השתמשו ב-Shift+Tab כדי לנווט אחורה', context: 'basic', order: 3 },
    { id: 'rtl-note', instruction: 'במצב RTL, מקש החץ הימני מעביר קדימה ומקש החץ השמאלי מעביר אחורה', context: 'rtl', order: 4 },
    { id: 'enter-action', instruction: 'לחצו Enter כדי להפעיל קישורים וכפתורים', context: 'action', order: 5 },
    { id: 'space-toggle', instruction: 'לחצו על מקש הרווח כדי לשנות תיבות סימון', context: 'action', order: 6 },
    { id: 'escape-close', instruction: 'לחצו Escape כדי לסגור חלונות קופצים ותפריטים', context: 'modal', order: 7 },
    { id: 'home-end', instruction: 'השתמשו ב-Home ו-End כדי לעבור להתחלה ולסוף', context: 'list', order: 8 },
    { id: 'arrow-keys', instruction: 'השתמשו במקשי החצים כדי לנווט בתוך תפריטים וטבלאות', context: 'list', order: 9 },
    { id: 'skip-link', instruction: 'לחצו Ctrl+Home כדי לדלג ישירות לתוכן הראשי', context: 'accessibility', order: 10 },
  ],
  en: [
    { id: 'intro', instruction: 'You can navigate this site using your keyboard', context: 'general', order: 1 },
    { id: 'tab-nav', instruction: 'Use Tab key to move between interactive elements', context: 'basic', order: 2 },
    { id: 'shift-tab', instruction: 'Use Shift+Tab to navigate backward', context: 'basic', order: 3 },
    { id: 'rtl-note', instruction: 'In RTL mode, Right Arrow moves forward and Left Arrow moves backward', context: 'rtl', order: 4 },
    { id: 'enter-action', instruction: 'Press Enter to activate links and buttons', context: 'action', order: 5 },
    { id: 'space-toggle', instruction: 'Press Space to toggle checkboxes', context: 'action', order: 6 },
    { id: 'escape-close', instruction: 'Press Escape to close modals and menus', context: 'modal', order: 7 },
    { id: 'home-end', instruction: 'Use Home and End keys to jump to start and end', context: 'list', order: 8 },
    { id: 'arrow-keys', instruction: 'Use Arrow keys to navigate within menus and tables', context: 'list', order: 9 },
    { id: 'skip-link', instruction: 'Press Ctrl+Home to skip directly to main content', context: 'accessibility', order: 10 },
  ],
};

const FOCUS_MANAGEMENT_LABELS: Record<string, Record<string, FocusManagementLabel>> = {
  ar: {
    'skip-link': { id: 'skip-link', label: 'تخطي إلى المحتوى الرئيسي', ariaLabel: 'تخطي الروابط والانتقال للمحتوى الرئيسي', role: 'link' },
    'focus-indicator': { id: 'focus-indicator', label: 'مؤشر التركيز', ariaLabel: 'العنصر المحدد حالياً', role: 'status' },
    'focus-trap-start': { id: 'focus-trap-start', label: 'بداية منطقة التركيز', ariaLabel: 'بداية نافذة حوار، اضغط Tab للتنقل', role: 'region' },
    'focus-trap-end': { id: 'focus-trap-end', label: 'نهاية منطقة التركيز', ariaLabel: 'نهاية نافذة حوار، اضغط Tab للعودة للبداية', role: 'region' },
    'focus-visible': { id: 'focus-visible', label: 'مرئي عند التركيز', ariaLabel: 'التنقل بواسطة لوحة المفاتيح نشط', role: 'status' },
    'focus-hidden': { id: 'focus-hidden', label: 'مخفي عند التركيز', ariaLabel: 'التركيز غير مرئي حالياً', role: 'status' },
    'roving-tabindex': { id: 'roving-tabindex', label: 'تنقل مرن', ariaLabel: 'استخدم مفاتيح الأسهم للتنقل بين العناصر', role: 'group' },
    'first-focusable': { id: 'first-focusable', label: 'أول عنصر تفاعلي', ariaLabel: 'العنصر التفاعلي الأول في الصفحة', role: 'generic' },
    'last-focusable': { id: 'last-focusable', label: 'آخر عنصر تفاعلي', ariaLabel: 'العنصر التفاعلي الأخير في الصفحة', role: 'generic' },
    'focus-heading': { id: 'focus-heading', label: 'عنوان القسم', ariaLabel: 'انتقل للعنوان التالي بالضغط على H', role: 'heading' },
  },
  he: {
    'skip-link': { id: 'skip-link', label: 'דילוג לתוכן הראשי', ariaLabel: 'דילוג על קישורים ומעבר לתוכן הראשי', role: 'link' },
    'focus-indicator': { id: 'focus-indicator', label: 'מחוון מיקוד', ariaLabel: 'הפריט הנבחר כרגע', role: 'status' },
    'focus-trap-start': { id: 'focus-trap-start', label: 'תחילת אזור המיקוד', ariaLabel: 'תחילת חלון דו-שיח, לחצו Tab לניווט', role: 'region' },
    'focus-trap-end': { id: 'focus-trap-end', label: 'סוף אזור המיקוד', ariaLabel: 'סוף חלון דו-שיח, לחצו Tab לחזרה להתחלה', role: 'region' },
    'focus-visible': { id: 'focus-visible', label: 'נראה במיקוד', ariaLabel: 'ניווט מקלדת פעיל', role: 'status' },
    'focus-hidden': { id: 'focus-hidden', label: 'מוסתר במיקוד', ariaLabel: 'מיקוד אינו נראה כרגע', role: 'status' },
    'roving-tabindex': { id: 'roving-tabindex', label: 'ניווט גמיש', ariaLabel: 'השתמשו במקשי החצים לניווט בין פריטים', role: 'group' },
    'first-focusable': { id: 'first-focusable', label: 'פריט אינטראקטיבי ראשון', ariaLabel: 'הפריט האינטראקטיבי הראשון בדף', role: 'generic' },
    'last-focusable': { id: 'last-focusable', label: 'פריט אינטראקטיבי אחרון', ariaLabel: 'הפריט האינטראקטיבי האחרון בדף', role: 'generic' },
    'focus-heading': { id: 'focus-heading', label: 'כותרת הסעיף', ariaLabel: 'עברו לכותרת הבאה בלחיצה על H', role: 'heading' },
  },
  en: {
    'skip-link': { id: 'skip-link', label: 'Skip to Main Content', ariaLabel: 'Skip links and go to main content', role: 'link' },
    'focus-indicator': { id: 'focus-indicator', label: 'Focus Indicator', ariaLabel: 'Currently focused element', role: 'status' },
    'focus-trap-start': { id: 'focus-trap-start', label: 'Focus Region Start', ariaLabel: 'Start of dialog, press Tab to navigate', role: 'region' },
    'focus-trap-end': { id: 'focus-trap-end', label: 'Focus Region End', ariaLabel: 'End of dialog, press Tab to return to start', role: 'region' },
    'focus-visible': { id: 'focus-visible', label: 'Focus Visible', ariaLabel: 'Keyboard navigation is active', role: 'status' },
    'focus-hidden': { id: 'focus-hidden', label: 'Focus Hidden', ariaLabel: 'Focus is not currently visible', role: 'status' },
    'roving-tabindex': { id: 'roving-tabindex', label: 'Roving Tabindex', ariaLabel: 'Use arrow keys to navigate between items', role: 'group' },
    'first-focusable': { id: 'first-focusable', label: 'First Focusable Element', ariaLabel: 'First interactive element on the page', role: 'generic' },
    'last-focusable': { id: 'last-focusable', label: 'Last Focusable Element', ariaLabel: 'Last interactive element on the page', role: 'generic' },
    'focus-heading': { id: 'focus-heading', label: 'Section Heading', ariaLabel: 'Navigate to next heading by pressing H', role: 'heading' },
  },
};

const KEYBOARD_HELP_SECTIONS: Record<string, KeyboardHelpSection[]> = {
  ar: [
    { id: 'basics', title: 'أساسيات التنقل', description: 'الاختصارات الأساسية للتنقل في الموقع', shortcuts: ['nav-next', 'nav-prev', 'action-select', 'action-escape'].map(id => KEYBOARD_SHORTCUTS.ar[id]) },
    { id: 'navigation', title: 'التنقل المتقدم', description: 'اختصارات للتنقل السريع بين العناصر', shortcuts: ['nav-first', 'nav-last', 'nav-up', 'nav-down', 'nav-left', 'nav-right'].map(id => KEYBOARD_SHORTCUTS.ar[id]) },
    { id: 'editing', title: 'تحرير النصوص', description: 'اختصارات التحرير الشائعة', shortcuts: ['edit-undo', 'edit-redo', 'edit-copy', 'edit-paste', 'edit-cut', 'edit-select-all'].map(id => KEYBOARD_SHORTCUTS.ar[id]) },
    { id: 'accessibility', title: 'إمكانية الوصول', description: 'اختصارات لتحسين تجربة المستخدمين ذوي الاحتياجات الخاصة', shortcuts: ['focus-skip', 'focus-landmark'].map(id => KEYBOARD_SHORTCUTS.ar[id]) },
    { id: 'view', title: 'عرض الصفحة', description: 'التكبير والتصغير والإعدادات المرئية', shortcuts: ['view-zoom-in', 'view-zoom-out', 'view-zoom-reset'].map(id => KEYBOARD_SHORTCUTS.ar[id]) },
  ],
  he: [
    { id: 'basics', title: 'יסודות הניווט', description: 'קיצורי המקשים הבסיסיים לניווט באתר', shortcuts: ['nav-next', 'nav-prev', 'action-select', 'action-escape'].map(id => KEYBOARD_SHORTCUTS.he[id]) },
    { id: 'navigation', title: 'ניווט מתקדם', description: 'קיצורי דרך לניווט מהיר בין פריטים', shortcuts: ['nav-first', 'nav-last', 'nav-up', 'nav-down', 'nav-left', 'nav-right'].map(id => KEYBOARD_SHORTCUTS.he[id]) },
    { id: 'editing', title: 'עריכת טקסט', description: 'קיצורי עריכה נפוצים', shortcuts: ['edit-undo', 'edit-redo', 'edit-copy', 'edit-paste', 'edit-cut', 'edit-select-all'].map(id => KEYBOARD_SHORTCUTS.he[id]) },
    { id: 'accessibility', title: 'נגישות', description: 'קיצורי מקלדת לשיפור חוויית המשתמשים עם צרכים מיוחדים', shortcuts: ['focus-skip', 'focus-landmark'].map(id => KEYBOARD_SHORTCUTS.he[id]) },
    { id: 'view', title: 'תצוגת דף', description: 'הגדלה, הקטנה והגדרות חזותיות', shortcuts: ['view-zoom-in', 'view-zoom-out', 'view-zoom-reset'].map(id => KEYBOARD_SHORTCUTS.he[id]) },
  ],
  en: [
    { id: 'basics', title: 'Navigation Basics', description: 'Basic shortcuts for navigating the site', shortcuts: ['nav-next', 'nav-prev', 'action-select', 'action-escape'].map(id => KEYBOARD_SHORTCUTS.en[id]) },
    { id: 'navigation', title: 'Advanced Navigation', description: 'Shortcuts for quick navigation between elements', shortcuts: ['nav-first', 'nav-last', 'nav-up', 'nav-down', 'nav-left', 'nav-right'].map(id => KEYBOARD_SHORTCUTS.en[id]) },
    { id: 'editing', title: 'Text Editing', description: 'Common editing shortcuts', shortcuts: ['edit-undo', 'edit-redo', 'edit-copy', 'edit-paste', 'edit-cut', 'edit-select-all'].map(id => KEYBOARD_SHORTCUTS.en[id]) },
    { id: 'accessibility', title: 'Accessibility', description: 'Shortcuts to improve experience for users with special needs', shortcuts: ['focus-skip', 'focus-landmark'].map(id => KEYBOARD_SHORTCUTS.en[id]) },
    { id: 'view', title: 'Page View', description: 'Zoom in, zoom out, and visual settings', shortcuts: ['view-zoom-in', 'view-zoom-out', 'view-zoom-reset'].map(id => KEYBOARD_SHORTCUTS.en[id]) },
  ],
};

function normalizeLocale(locale: string): string {
  const normalized = locale.toLowerCase().split('-')[0];
  if (['ar', 'he', 'en'].includes(normalized)) return normalized;
  return 'en';
}

function isRTL(locale: string): boolean {
  const normalized = normalizeLocale(locale);
  return normalized === 'ar' || normalized === 'he';
}

export function getKeyboardShortcutLabel(shortcut: string | KeyboardShortcut, locale: string = 'en'): string {
  const normalizedLocale = normalizeLocale(locale);
  if (typeof shortcut === 'string') {
    const shortcuts = KEYBOARD_SHORTCUTS[normalizedLocale];
    if (shortcuts && shortcuts[shortcut]) {
      const s = shortcuts[shortcut];
      return `${s.keys.join(' + ')}: ${s.action}`;
    }
    return shortcut;
  }
  return `${shortcut.keys.join(' + ')}: ${shortcut.action}`;
}

export function getKeyboardShortcut(shortcutId: string, locale: string = 'en'): KeyboardShortcut | null {
  const normalizedLocale = normalizeLocale(locale);
  const shortcuts = KEYBOARD_SHORTCUTS[normalizedLocale];
  return shortcuts?.[shortcutId] ?? null;
}

export function getAllKeyboardShortcuts(locale: string = 'en'): KeyboardShortcut[] {
  const normalizedLocale = normalizeLocale(locale);
  const shortcuts = KEYBOARD_SHORTCUTS[normalizedLocale];
  return Object.values(shortcuts || {});
}

export function getShortcutsByCategory(category: ShortcutCategory, locale: string = 'en'): KeyboardShortcut[] {
  const allShortcuts = getAllKeyboardShortcuts(locale);
  return allShortcuts.filter(s => s.category === category);
}

export function getNavigationInstructions(locale: string = 'en', context?: string): NavigationInstruction[] {
  const normalizedLocale = normalizeLocale(locale);
  const instructions = NAVIGATION_INSTRUCTIONS[normalizedLocale] || NAVIGATION_INSTRUCTIONS.en;
  let result = [...instructions];
  if (context) result = result.filter(i => i.context === context);
  return result.sort((a, b) => a.order - b.order);
}

export function getNavigationInstructionById(instructionId: string, locale: string = 'en'): NavigationInstruction | null {
  const normalizedLocale = normalizeLocale(locale);
  const instructions = NAVIGATION_INSTRUCTIONS[normalizedLocale] || NAVIGATION_INSTRUCTIONS.en;
  return instructions.find(i => i.id === instructionId) || null;
}

export function getFocusManagementLabels(locale: string = 'en'): Record<string, FocusManagementLabel> {
  const normalizedLocale = normalizeLocale(locale);
  return FOCUS_MANAGEMENT_LABELS[normalizedLocale] || FOCUS_MANAGEMENT_LABELS.en;
}

export function getFocusManagementLabel(labelId: string, locale: string = 'en'): FocusManagementLabel | null {
  const labels = getFocusManagementLabels(locale);
  return labels[labelId] || null;
}

export function getKeyboardHelpText(locale: string = 'en'): KeyboardHelpSection[] {
  const normalizedLocale = normalizeLocale(locale);
  return KEYBOARD_HELP_SECTIONS[normalizedLocale] || KEYBOARD_HELP_SECTIONS.en;
}

export function getKeyboardHelpSection(sectionId: string, locale: string = 'en'): KeyboardHelpSection | null {
  const sections = getKeyboardHelpText(locale);
  return sections.find(s => s.id === sectionId) || null;
}

export function formatShortcutKeys(keys: string[], locale: string = 'en'): string {
  const rtl = isRTL(locale);
  const orderedKeys = rtl ? [...keys].reverse() : keys;
  return orderedKeys.join(' + ');
}

export function getKeySymbol(key: string): string {
  const symbols: Record<string, string> = {
    'Ctrl': '⌘/Ctrl', 'Alt': '⌥/Alt', 'Shift': '⇧/Shift',
    'Enter': '↵', 'Tab': '⇥', 'Esc': 'Esc', 'Space': '␣',
    'Home': 'Home', 'End': 'End', '↑': '↑', '↓': '↓', '←': '←', '→': '→',
  };
  return symbols[key] || key;
}

export function getRTLArrowInstructions(locale: string = 'en'): string {
  const normalizedLocale = normalizeLocale(locale);
  const instructions: Record<string, string> = {
    ar: 'في الوضع من اليمين لليسار: السهم الأيمن للأمام، السهم الأيسر للخلف',
    he: 'במצב RTL: חץ ימני קדימה, חץ שמאלי אחורה',
    en: 'In RTL mode: Right arrow moves forward, Left arrow moves backward',
  };
  return instructions[normalizedLocale] || instructions.en;
}

export function matchesShortcut(event: KeyboardEvent, shortcutId: string, locale: string = 'en'): boolean {
  const shortcut = getKeyboardShortcut(shortcutId, locale);
  if (!shortcut) return false;
  const keys = shortcut.keys;
  const mainKey = keys[keys.length - 1].toLowerCase();
  if (event.key.toLowerCase() !== mainKey && event.code !== mainKey) return false;
  const needsCtrl = keys.includes('Ctrl');
  const needsShift = keys.includes('Shift');
  const needsAlt = keys.includes('Alt');
  if (needsCtrl !== event.ctrlKey && needsCtrl !== event.metaKey) return false;
  if (needsShift !== event.shiftKey) return false;
  if (needsAlt !== event.altKey) return false;
  return true;
}

export function getAccessibleShortcutLabel(shortcutId: string, locale: string = 'en'): string {
  const shortcut = getKeyboardShortcut(shortcutId, locale);
  if (!shortcut) return '';
  const keysLabel = shortcut.keys.map(getKeySymbol).join(' plus ');
  const description = shortcut.description || shortcut.action;
  return `${keysLabel}, ${description}`;
}

export function getSupportedLocales(): string[] {
  return ['ar', 'he', 'en'];
}

export { KEYBOARD_SHORTCUTS, NAVIGATION_INSTRUCTIONS, FOCUS_MANAGEMENT_LABELS, KEYBOARD_HELP_SECTIONS, normalizeLocale, isRTL };
