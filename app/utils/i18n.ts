/**
 * Simple i18n utility for admin UI strings.
 * Supports English, Arabic, and Hebrew.
 */

type Locale = 'en' | 'ar' | 'he';

const translations: Record<string, Record<Locale, string>> = {
  // Common
  'save': { en: 'Save', ar: 'حفظ', he: 'שמור' },
  'cancel': { en: 'Cancel', ar: 'إلغاء', he: 'ביטול' },
  'delete': { en: 'Delete', ar: 'حذف', he: 'מחק' },
  'loading': { en: 'Loading...', ar: 'جاري التحميل...', he: 'טוען...' },
  'saving': { en: 'Saving...', ar: 'جاري الحفظ...', he: 'שומר...' },
  'saved': { en: 'Saved', ar: 'تم الحفظ', he: 'נשמר' },
  'error': { en: 'Error', ar: 'خطأ', he: 'שגיאה' },
  'save_error': { en: 'Save Error', ar: 'خطأ في الحفظ', he: 'שגיאת שמירה' },
  'unsaved': { en: 'Unsaved', ar: 'غير محفوظ', he: 'לא נשמר' },
  'search': { en: 'Search', ar: 'بحث', he: 'חיפוש' },
  'close': { en: 'Close', ar: 'إغلاق', he: 'סגור' },
  'confirm': { en: 'Confirm', ar: 'تأكيد', he: 'אישור' },
  'clear_all': { en: 'Clear all', ar: 'مسح الكل', he: 'נקה הכל' },
  'no_data': { en: 'No data available', ar: 'لا توجد بيانات', he: 'אין נתונים' },
  'selected': { en: 'selected', ar: 'محدد', he: 'נבחר' },

  // Navigation
  'source': { en: 'Source', ar: 'المصدر', he: 'מקור' },
  'translation': { en: 'Translation', ar: 'الترجمة', he: 'תרגום' },
  'target_language': { en: 'Target language', ar: 'اللغة المستهدفة', he: 'שפת יעד' },
  'auto_translate': { en: 'Auto-translate', ar: 'ترجمة تلقائية', he: 'תרגום אוטומטי' },

  // Translation Editor
  'unsaved_changes': { en: 'Unsaved changes', ar: 'تغييرات غير محفوظة', he: 'שינויים שלא נשמרו' },
  'save_all': { en: 'Save All', ar: 'حفظ الكل', he: 'שמור הכל' },
  'translation_editor': { en: 'Translation Editor', ar: 'محرر الترجمة', he: 'עורך תרגום' },
  'characters': { en: 'characters', ar: 'حرف', he: 'תווים' },
  'rtl_preview': { en: 'RTL Preview', ar: 'معاينة RTL', he: 'תצוגה מקדימה RTL' },
  'save_translation': { en: 'Save Translation', ar: 'حفظ الترجمة', he: 'שמור תרגום' },

  // Content
  'content': { en: 'Content', ar: 'المحتوى', he: 'תוכן' },
  'type': { en: 'Type', ar: 'النوع', he: 'סוג' },
  'source_language': { en: 'Source Language', ar: 'لغة المصدر', he: 'שפת מקור' },
  'status': { en: 'Status', ar: 'الحالة', he: 'סטטוס' },
  'last_updated': { en: 'Last Updated', ar: 'آخر تحديث', he: 'עדכון אחרון' },
  'actions': { en: 'Actions', ar: 'إجراءات', he: 'פעולות' },
  'translate': { en: 'Translate', ar: 'ترجم', he: 'תרגם' },

  // Dashboard
  'system_health': { en: 'System Health', ar: 'صحة النظام', he: 'תקינות המערכת' },
  'healthy': { en: 'Healthy', ar: 'سليم', he: 'תקין' },
  'degraded': { en: 'Degraded', ar: 'متدهور', he: 'ירוד' },
  'down': { en: 'Down', ar: 'معطل', he: 'מושבת' },
  'latency': { en: 'Latency', ar: 'زمن الاستجابة', he: 'זמן תגובה' },
  'last_checked': { en: 'Last checked', ar: 'آخر فحص', he: 'בדיקה אחרונה' },

  // Analytics
  'total_translations': { en: 'Total Translations', ar: 'إجمالي الترجمات', he: 'סה"כ תרגומים' },
  'words_translated': { en: 'Words Translated', ar: 'الكلمات المترجمة', he: 'מילים שתורגמו' },
  'api_requests': { en: 'API Requests', ar: 'طلبات API', he: 'בקשות API' },
  'ai_confidence': { en: 'AI Confidence', ar: 'ثقة الذكاء الاصطناعي', he: 'ביטחון AI' },
  'by_provider': { en: 'By Provider', ar: 'حسب المزود', he: 'לפי ספק' },
  'usage_summary': { en: 'Usage Summary', ar: 'ملخص الاستخدام', he: 'סיכום שימוש' },
  'translations_by_language': { en: 'Translations by Language', ar: 'الترجمات حسب اللغة', he: 'תרגומים לפי שפה' },
  'conversions_by_language': { en: 'Conversions by Language', ar: 'التحويلات حسب اللغة', he: 'המרות לפי שפה' },
  'words': { en: 'words', ar: 'كلمة', he: 'מילים' },

  // Notifications
  'notifications': { en: 'Notifications', ar: 'الإشعارات', he: 'התראות' },
  'no_notifications': { en: 'No notifications', ar: 'لا توجد إشعارات', he: 'אין התראות' },
  'dismiss': { en: 'Dismiss', ar: 'تجاهل', he: 'בטל' },

  // System
  'all_systems_operational': { en: 'All Systems Operational', ar: 'جميع الأنظمة تعمل', he: 'כל המערכות פועלות' },
  'service_disruption': { en: 'Service Disruption Detected', ar: 'تم اكتشاف انقطاع في الخدمة', he: 'זוהה שיבוש בשירות' },
  'partial_degradation': { en: 'Partial Service Degradation', ar: 'تدهور جزئي في الخدمة', he: 'ירידה חלקית בשירות' },
  'backups': { en: 'Backups', ar: 'النسخ الاحتياطية', he: 'גיבויים' },
  'create_backup': { en: 'Create Backup', ar: 'إنشاء نسخة احتياطية', he: 'צור גיבוי' },
  'restore': { en: 'Restore', ar: 'استعادة', he: 'שחזר' },
  'disaster_recovery': { en: 'Disaster Recovery', ar: 'التعافي من الكوارث', he: 'התאוששות מאסון' },

  // Editor tools
  'find_replace': { en: 'Find & Replace', ar: 'بحث واستبدال', he: 'חיפוש והחלפה' },
  'find': { en: 'Find', ar: 'بحث', he: 'חפש' },
  'replace': { en: 'Replace', ar: 'استبدال', he: 'החלף' },
  'replace_all': { en: 'Replace All', ar: 'استبدال الكل', he: 'החלף הכל' },
  'no_spelling_errors': { en: 'No spelling errors', ar: 'لا توجد أخطاء إملائية', he: 'אין שגיאות כתיב' },
  'spelling_issues': { en: 'Spelling Issues', ar: 'مشاكل إملائية', he: 'בעיות כתיב' },
  'suggestions': { en: 'Suggestions', ar: 'اقتراحات', he: 'הצעות' },
  'keyboard_shortcuts': { en: 'Keyboard Shortcuts', ar: 'اختصارات لوحة المفاتيح', he: 'קיצורי מקלדת' },
  'columns': { en: 'Columns', ar: 'أعمدة', he: 'עמודות' },
  'filters': { en: 'Filters', ar: 'مرصفات', he: 'מסננים' },
  'active': { en: 'active', ar: 'نشط', he: 'פעיל' },
  'dark_mode': { en: 'Dark mode', ar: 'الوضع الداكن', he: 'מצב כהה' },

  // Import/Export
  'export_preview': { en: 'Export Preview', ar: 'معاينة التصدير', he: 'תצוגה מקדימה לייצוא' },
  'import_preview': { en: 'Import Preview', ar: 'معاينة الاستيراد', he: 'תצוגה מקדימה לייבוא' },
  'no_data_to_export': { en: 'No data to export', ar: 'لا توجد بيانات للتصدير', he: 'אין נתונים לייצוא' },
  'export': { en: 'Export', ar: 'تصدير', he: 'ייצוא' },

  // Misc
  'saved_searches': { en: 'Saved Searches', ar: 'عمليات البحث المحفوظة', he: 'חיפושים שמורים' },
  'no_saved_searches': { en: 'No saved searches yet', ar: 'لا توجد عمليات بحث محفوظة', he: 'אין חיפושים שמורים' },
  'resolve_conflicts': { en: 'Resolve Conflicts', ar: 'حل التعارضات', he: 'פתור קונפליקטים' },
  'remaining': { en: 'remaining', ar: 'متبقي', he: 'נותר' },
  'current': { en: 'Current', ar: 'الحالي', he: 'נוכחי' },
  'incoming': { en: 'Incoming', ar: 'الوارد', he: 'נכנס' },
  'keep_current': { en: 'Keep Current', ar: 'إبقاء الحالي', he: 'שמור נוכחי' },
  'accept_incoming': { en: 'Accept Incoming', ar: 'قبول الوارد', he: 'קבל נכנס' },
  'offline_message': { en: 'You are currently offline. Changes will sync when connected.', ar: 'أنت غير متصل حالياً. ستتم مزامنة التغييرات عند الاتصال.', he: 'אתה לא מחובר כרגע. השינויים יסונכרנו בחיבור מחדש.' },
  'best_on_desktop': { en: 'Best viewed on desktop', ar: 'يفضل العرض على الحاسوب', he: 'מומלץ לצפייה במחשב' },
  'seo_preview': { en: 'SEO Preview', ar: 'معاينة SEO', he: 'תצוגת SEO' },
  'page_title': { en: 'Page Title', ar: 'عنوان الصفحة', he: 'כותרת העמוד' },
  'min_read': { en: 'min read', ar: 'دقيقة للقراءة', he: 'דקות קריאה' },
};

/**
 * Get a translated string for the given key and locale.
 * Falls back to English if key or locale not found.
 */
export function t(key: string, locale: string = 'en'): string {
  const normalizedLocale = (locale.split('-')[0] as Locale);
  const entry = translations[key];
  if (!entry) return key;
  return entry[normalizedLocale] || entry.en || key;
}

/**
 * Template function for strings with interpolation.
 * Usage: tpl('selected', { count: 5 }, 'ar') → "5 محدد"
 */
export function tpl(key: string, params: Record<string, string | number>, locale: string = 'en'): string {
  let result = t(key, locale);
  for (const [k, v] of Object.entries(params)) {
    result = result.replace(`{${k}}`, String(v));
  }
  return result;
}

export type { Locale };
