/**
 * Error Prevention Translation Service
 * Provides localized labels for error prevention, confirmation dialogs, undo/redo actions, and error recovery
 * Supports: ar (Arabic), he (Hebrew), en (English)
 */

export type Locale = 'ar' | 'he' | 'en';
export type ErrorPreventionType = 
  | 'warning'
  | 'error'
  | 'info'
  | 'success'
  | 'critical'
  | 'validation'
  | 'confirmation'
  | 'unsaved_changes';

export type ConfirmationAction =
  | 'delete'
  | 'save'
  | 'discard'
  | 'publish'
  | 'unpublish'
  | 'archive'
  | 'restore'
  | 'logout'
  | 'navigate_away'
  | 'bulk_action'
  | 'reset'
  | 'cancel';

export type ErrorType =
  | 'network_error'
  | 'server_error'
  | 'validation_error'
  | 'permission_error'
  | 'not_found'
  | 'timeout'
  | 'conflict'
  | 'rate_limit'
  | 'unknown_error';

export interface ErrorPreventionLabel {
  title: string;
  message: string;
  icon?: string;
}

export interface ConfirmationDialogText {
  title: string;
  message: string;
  confirmButton: string;
  cancelButton: string;
  destructive?: boolean;
}

export interface UndoLabels {
  undo: string;
  redo: string;
  actionUndone: string;
  actionRedone: string;
  undoFailed: string;
  redoFailed: string;
  nothingToUndo: string;
  nothingToRedo: string;
  undoHistory: string;
  clearHistory: string;
}

export interface ErrorRecoveryText {
  title: string;
  message: string;
  retryButton: string;
  dismissButton: string;
  alternativeAction?: string;
  helpLink?: string;
}

// Error prevention labels by type and locale
const ERROR_PREVENTION_LABELS: Record<ErrorPreventionType, Record<Locale, ErrorPreventionLabel>> = {
  warning: {
    en: {
      title: 'Warning',
      message: 'Please review before proceeding',
      icon: '⚠️',
    },
    ar: {
      title: 'تحذير',
      message: 'يرجى المراجعة قبل المتابعة',
      icon: '⚠️',
    },
    he: {
      title: 'אזהרה',
      message: 'אנא בדוק לפני המשך',
      icon: '⚠️',
    },
  },
  error: {
    en: {
      title: 'Error',
      message: 'Something went wrong',
      icon: '❌',
    },
    ar: {
      title: 'خطأ',
      message: 'حدث خطأ ما',
      icon: '❌',
    },
    he: {
      title: 'שגיאה',
      message: 'משהו השתבש',
      icon: '❌',
    },
  },
  info: {
    en: {
      title: 'Information',
      message: 'Please note the following',
      icon: 'ℹ️',
    },
    ar: {
      title: 'معلومات',
      message: 'يرجى ملاحظة ما يلي',
      icon: 'ℹ️',
    },
    he: {
      title: 'מידע',
      message: 'שים לב לדברים הבאים',
      icon: 'ℹ️',
    },
  },
  success: {
    en: {
      title: 'Success',
      message: 'Action completed successfully',
      icon: '✅',
    },
    ar: {
      title: 'نجاح',
      message: 'تمت العملية بنجاح',
      icon: '✅',
    },
    he: {
      title: 'הצלחה',
      message: 'הפעולה הושלמה בהצלחה',
      icon: '✅',
    },
  },
  critical: {
    en: {
      title: 'Critical Error',
      message: 'A critical error has occurred',
      icon: '🚨',
    },
    ar: {
      title: 'خطأ حرج',
      message: 'حدث خطأ حرج',
      icon: '🚨',
    },
    he: {
      title: 'שגיאה קריטית',
      message: 'אירעה שגיאה קריטית',
      icon: '🚨',
    },
  },
  validation: {
    en: {
      title: 'Validation Error',
      message: 'Please check your input',
      icon: '📝',
    },
    ar: {
      title: 'خطأ في التحقق',
      message: 'يرجى التحقق من المدخلات',
      icon: '📝',
    },
    he: {
      title: 'שגיאת אימות',
      message: 'אנא בדוק את הקלט שלך',
      icon: '📝',
    },
  },
  confirmation: {
    en: {
      title: 'Confirmation Required',
      message: 'Please confirm this action',
      icon: '❓',
    },
    ar: {
      title: 'التأكيد مطلوب',
      message: 'يرجى تأكيد هذا الإجراء',
      icon: '❓',
    },
    he: {
      title: 'נדרש אישור',
      message: 'אנא אשר פעולה זו',
      icon: '❓',
    },
  },
  unsaved_changes: {
    en: {
      title: 'Unsaved Changes',
      message: 'You have unsaved changes',
      icon: '💾',
    },
    ar: {
      title: 'تغييرات غير محفوظة',
      message: 'لديك تغييرات غير محفوظة',
      icon: '💾',
    },
    he: {
      title: 'שינויים שלא נשמרו',
      message: 'יש לך שינויים שלא נשמרו',
      icon: '💾',
    },
  },
};

// Confirmation dialog text by action and locale
const CONFIRMATION_DIALOG_TEXT: Record<ConfirmationAction, Record<Locale, ConfirmationDialogText>> = {
  delete: {
    en: {
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
      confirmButton: 'Delete',
      cancelButton: 'Cancel',
      destructive: true,
    },
    ar: {
      title: 'تأكيد الحذف',
      message: 'هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.',
      confirmButton: 'حذف',
      cancelButton: 'إلغاء',
      destructive: true,
    },
    he: {
      title: 'אשר מחיקה',
      message: 'האם אתה בטוח שברצונך למחוק פריט זה? לא ניתן לבטל פעולה זו.',
      confirmButton: 'מחק',
      cancelButton: 'בטל',
      destructive: true,
    },
  },
  save: {
    en: {
      title: 'Save Changes',
      message: 'Do you want to save your changes?',
      confirmButton: 'Save',
      cancelButton: 'Don\'t Save',
      destructive: false,
    },
    ar: {
      title: 'حفظ التغييرات',
      message: 'هل تريد حفظ التغييرات؟',
      confirmButton: 'حفظ',
      cancelButton: 'عدم الحفظ',
      destructive: false,
    },
    he: {
      title: 'שמור שינויים',
      message: 'האם ברצונך לשמור את השינויים?',
      confirmButton: 'שמור',
      cancelButton: 'אל תשמור',
      destructive: false,
    },
  },
  discard: {
    en: {
      title: 'Discard Changes',
      message: 'Are you sure you want to discard your changes? All unsaved work will be lost.',
      confirmButton: 'Discard',
      cancelButton: 'Keep Editing',
      destructive: true,
    },
    ar: {
      title: 'تجاهل التغييرات',
      message: 'هل أنت متأكد من تجاهل التغييرات؟ سيتم فقدان جميع العمل غير المحفوظ.',
      confirmButton: 'تجاهل',
      cancelButton: 'مواصلة التعديل',
      destructive: true,
    },
    he: {
      title: 'השלך שינויים',
      message: 'האם אתה בטוח שברצונך להשליך את השינויים? כל העבודה שלא נשמרה תאבד.',
      confirmButton: 'השלך',
      cancelButton: 'המשך עריכה',
      destructive: true,
    },
  },
  publish: {
    en: {
      title: 'Publish Content',
      message: 'Are you sure you want to publish this content? It will be visible to all users.',
      confirmButton: 'Publish',
      cancelButton: 'Cancel',
      destructive: false,
    },
    ar: {
      title: 'نشر المحتوى',
      message: 'هل أنت متأكد من نشر هذا المحتوى؟ سيكون مرئياً لجميع المستخدمين.',
      confirmButton: 'نشر',
      cancelButton: 'إلغاء',
      destructive: false,
    },
    he: {
      title: 'פרסם תוכן',
      message: 'האם אתה בטוח שברצונך לפרסם תוכן זה? הוא יהיה גלוי לכל המשתמשים.',
      confirmButton: 'פרסם',
      cancelButton: 'בטל',
      destructive: false,
    },
  },
  unpublish: {
    en: {
      title: 'Unpublish Content',
      message: 'Are you sure you want to unpublish this content? It will no longer be visible to users.',
      confirmButton: 'Unpublish',
      cancelButton: 'Cancel',
      destructive: false,
    },
    ar: {
      title: 'إلغاء نشر المحتوى',
      message: 'هل أنت متأكد من إلغاء نشر هذا المحتوى؟ لن يكون مرئياً للمستخدمين بعد الآن.',
      confirmButton: 'إلغاء النشر',
      cancelButton: 'إلغاء',
      destructive: false,
    },
    he: {
      title: 'בטל פרסום תוכן',
      message: 'האם אתה בטוח שברצונך לבטל את פרסום תוכן זה? הוא לא יהיה גלוי למשתמשים.',
      confirmButton: 'בטל פרסום',
      cancelButton: 'בטל',
      destructive: false,
    },
  },
  archive: {
    en: {
      title: 'Archive Item',
      message: 'Are you sure you want to archive this item? You can restore it later.',
      confirmButton: 'Archive',
      cancelButton: 'Cancel',
      destructive: false,
    },
    ar: {
      title: 'أرشفة العنصر',
      message: 'هل أنت متأكد من أرشفة هذا العنصر؟ يمكنك استعادته لاحقاً.',
      confirmButton: 'أرشفة',
      cancelButton: 'إلغاء',
      destructive: false,
    },
    he: {
      title: 'העבר לארכיון',
      message: 'האם אתה בטוח שברצונך להעביר פריט זה לארכיון? תוכל לשחזר אותו מאוחר יותר.',
      confirmButton: 'העבר לארכיון',
      cancelButton: 'בטל',
      destructive: false,
    },
  },
  restore: {
    en: {
      title: 'Restore Item',
      message: 'Are you sure you want to restore this item?',
      confirmButton: 'Restore',
      cancelButton: 'Cancel',
      destructive: false,
    },
    ar: {
      title: 'استعادة العنصر',
      message: 'هل أنت متأكد من استعادة هذا العنصر؟',
      confirmButton: 'استعادة',
      cancelButton: 'إلغاء',
      destructive: false,
    },
    he: {
      title: 'שחזר פריט',
      message: 'האם אתה בטוח שברצונך לשחזר פריט זה?',
      confirmButton: 'שחזר',
      cancelButton: 'בטל',
      destructive: false,
    },
  },
  logout: {
    en: {
      title: 'Confirm Logout',
      message: 'Are you sure you want to log out? Any unsaved changes will be lost.',
      confirmButton: 'Log Out',
      cancelButton: 'Stay Logged In',
      destructive: false,
    },
    ar: {
      title: 'تأكيد تسجيل الخروج',
      message: 'هل أنت متأكد من تسجيل الخروج؟ سيتم فقدان أي تغييرات غير محفوظة.',
      confirmButton: 'تسجيل الخروج',
      cancelButton: 'البقاء متصلاً',
      destructive: false,
    },
    he: {
      title: 'אשר יציאה',
      message: 'האם אתה בטוח שברצונך להתנתק? כל שינוי שלא נשמר יאבד.',
      confirmButton: 'התנתק',
      cancelButton: 'השאר מחובר',
      destructive: false,
    },
  },
  navigate_away: {
    en: {
      title: 'Leave Page?',
      message: 'You have unsaved changes. If you leave this page, your changes will be lost.',
      confirmButton: 'Leave Page',
      cancelButton: 'Stay on Page',
      destructive: true,
    },
    ar: {
      title: 'مغادرة الصفحة؟',
      message: 'لديك تغييرات غير محفوظة. إذا غادرت هذه الصفحة، ستفقد تغييراتك.',
      confirmButton: 'مغادرة الصفحة',
      cancelButton: 'البقاء في الصفحة',
      destructive: true,
    },
    he: {
      title: 'לעזוב את הדף?',
      message: 'יש לך שינויים שלא נשמרו. אם תעזוב דף זה, השינויים שלך יאבדו.',
      confirmButton: 'עזוב את הדף',
      cancelButton: 'הישאר בדף',
      destructive: true,
    },
  },
  bulk_action: {
    en: {
      title: 'Confirm Bulk Action',
      message: 'This action will affect multiple items. Are you sure you want to continue?',
      confirmButton: 'Continue',
      cancelButton: 'Cancel',
      destructive: false,
    },
    ar: {
      title: 'تأكيد الإجراء الجماعي',
      message: 'سيؤثر هذا الإجراء على عدة عناصر. هل أنت متأكد من المتابعة؟',
      confirmButton: 'متابعة',
      cancelButton: 'إلغاء',
      destructive: false,
    },
    he: {
      title: 'אשר פעולה מרובה',
      message: 'פעולה זו תשפיע על מספר פריטים. האם אתה בטוח שברצונך להמשיך?',
      confirmButton: 'המשך',
      cancelButton: 'בטל',
      destructive: false,
    },
  },
  reset: {
    en: {
      title: 'Reset to Default',
      message: 'Are you sure you want to reset to default settings? All customizations will be lost.',
      confirmButton: 'Reset',
      cancelButton: 'Cancel',
      destructive: true,
    },
    ar: {
      title: 'إعادة التعيين للإعدادات الافتراضية',
      message: 'هل أنت متأكد من إعادة التعيين للإعدادات الافتراضية؟ ستفقد جميع التخصيصات.',
      confirmButton: 'إعادة تعيين',
      cancelButton: 'إلغاء',
      destructive: true,
    },
    he: {
      title: 'אפס להגדרות ברירת מחדל',
      message: 'האם אתה בטוח שברצונך לאפס להגדרות ברירת מחדל? כל ההתאמות האישיות יאבדו.',
      confirmButton: 'אפס',
      cancelButton: 'בטל',
      destructive: true,
    },
  },
  cancel: {
    en: {
      title: 'Cancel Operation',
      message: 'Are you sure you want to cancel this operation?',
      confirmButton: 'Cancel Operation',
      cancelButton: 'Continue',
      destructive: false,
    },
    ar: {
      title: 'إلغاء العملية',
      message: 'هل أنت متأكد من إلغاء هذه العملية؟',
      confirmButton: 'إلغاء العملية',
      cancelButton: 'متابعة',
      destructive: false,
    },
    he: {
      title: 'בטל פעולה',
      message: 'האם אתה בטוח שברצונך לבטל פעולה זו?',
      confirmButton: 'בטל פעולה',
      cancelButton: 'המשך',
      destructive: false,
    },
  },
};

// Undo/Redo labels by locale
const UNDO_LABELS_BY_LOCALE: Record<Locale, UndoLabels> = {
  en: {
    undo: 'Undo',
    redo: 'Redo',
    actionUndone: 'Action undone',
    actionRedone: 'Action redone',
    undoFailed: 'Could not undo action',
    redoFailed: 'Could not redo action',
    nothingToUndo: 'Nothing to undo',
    nothingToRedo: 'Nothing to redo',
    undoHistory: 'Undo History',
    clearHistory: 'Clear History',
  },
  ar: {
    undo: 'تراجع',
    redo: 'إعادة',
    actionUndone: 'تم التراجع عن الإجراء',
    actionRedone: 'تمت إعادة الإجراء',
    undoFailed: 'تعذر التراجع عن الإجراء',
    redoFailed: 'تعذرت إعادة الإجراء',
    nothingToUndo: 'لا يوجد شيء للتراجع عنه',
    nothingToRedo: 'لا يوجد شيء لإعادته',
    undoHistory: 'سجل التراجع',
    clearHistory: 'مسح السجل',
  },
  he: {
    undo: 'בטל פעולה',
    redo: 'בצע שוב',
    actionUndone: 'הפעולה בוטלה',
    actionRedone: 'הפעולה בוצעה שוב',
    undoFailed: 'לא ניתן לבטל את הפעולה',
    redoFailed: 'לא ניתן לבצע שוב את הפעולה',
    nothingToUndo: 'אין מה לבטל',
    nothingToRedo: 'אין מה לבצע שוב',
    undoHistory: 'היסטוריית ביטולים',
    clearHistory: 'נקה היסטוריה',
  },
};

// Error recovery text by error type and locale
const ERROR_RECOVERY_TEXT: Record<ErrorType, Record<Locale, ErrorRecoveryText>> = {
  network_error: {
    en: {
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
      retryButton: 'Retry',
      dismissButton: 'Dismiss',
      alternativeAction: 'Work Offline',
    },
    ar: {
      title: 'خطأ في الاتصال',
      message: 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
      retryButton: 'إعادة المحاولة',
      dismissButton: 'إغلاق',
      alternativeAction: 'العمل بدون اتصال',
    },
    he: {
      title: 'שגיאת חיבור',
      message: 'לא ניתן להתחבר לשרת. אנא בדוק את חיבור האינטרנט שלך.',
      retryButton: 'נסה שוב',
      dismissButton: 'סגור',
      alternativeAction: 'עבוד במצב לא מקוון',
    },
  },
  server_error: {
    en: {
      title: 'Server Error',
      message: 'The server encountered an error. Please try again later.',
      retryButton: 'Retry',
      dismissButton: 'Dismiss',
      helpLink: 'Contact Support',
    },
    ar: {
      title: 'خطأ في الخادم',
      message: 'واجه الخادم خطأ. يرجى المحاولة مرة أخرى لاحقاً.',
      retryButton: 'إعادة المحاولة',
      dismissButton: 'إغلاق',
      helpLink: 'الاتصال بالدعم',
    },
    he: {
      title: 'שגיאת שרת',
      message: 'השרת נתקל בשגיאה. אנא נסה שוב מאוחר יותר.',
      retryButton: 'נסה שוב',
      dismissButton: 'סגור',
      helpLink: 'צור קשר עם תמיכה',
    },
  },
  validation_error: {
    en: {
      title: 'Validation Failed',
      message: 'Please check your input and try again.',
      retryButton: 'Try Again',
      dismissButton: 'Close',
    },
    ar: {
      title: 'فشل التحقق',
      message: 'يرجى التحقق من المدخلات والمحاولة مرة أخرى.',
      retryButton: 'حاول مرة أخرى',
      dismissButton: 'إغلاق',
    },
    he: {
      title: 'אימות נכשל',
      message: 'אנא בדוק את הקלט שלך ונסה שוב.',
      retryButton: 'נסה שוב',
      dismissButton: 'סגור',
    },
  },
  permission_error: {
    en: {
      title: 'Access Denied',
      message: 'You do not have permission to perform this action.',
      retryButton: 'Request Access',
      dismissButton: 'Close',
      alternativeAction: 'Go Back',
    },
    ar: {
      title: 'الوصول مرفوض',
      message: 'ليس لديك إذن لتنفيذ هذا الإجراء.',
      retryButton: 'طلب وصول',
      dismissButton: 'إغلاق',
      alternativeAction: 'العودة',
    },
    he: {
      title: 'גישה נדחתה',
      message: 'אין לך הרשאה לבצע פעולה זו.',
      retryButton: 'בקש גישה',
      dismissButton: 'סגור',
      alternativeAction: 'חזור',
    },
  },
  not_found: {
    en: {
      title: 'Not Found',
      message: 'The requested item could not be found.',
      retryButton: 'Refresh',
      dismissButton: 'Close',
      alternativeAction: 'Go Home',
    },
    ar: {
      title: 'غير موجود',
      message: 'تعذر العثور على العنصر المطلوب.',
      retryButton: 'تحديث',
      dismissButton: 'إغلاق',
      alternativeAction: 'الصفحة الرئيسية',
    },
    he: {
      title: 'לא נמצא',
      message: 'הפריט המבוקש לא נמצא.',
      retryButton: 'רענן',
      dismissButton: 'סגור',
      alternativeAction: 'עבור לראשי',
    },
  },
  timeout: {
    en: {
      title: 'Request Timeout',
      message: 'The request took too long to complete. Please try again.',
      retryButton: 'Retry',
      dismissButton: 'Cancel',
      alternativeAction: 'Try Later',
    },
    ar: {
      title: 'انتهاء مهلة الطلب',
      message: 'استغرق الطلب وقتاً طويلاً. يرجى المحاولة مرة أخرى.',
      retryButton: 'إعادة المحاولة',
      dismissButton: 'إلغاء',
      alternativeAction: 'المحاولة لاحقاً',
    },
    he: {
      title: 'פסק זמן בקשה',
      message: 'הבקשה ארכה זמן רב מדי. אנא נסה שוב.',
      retryButton: 'נסה שוב',
      dismissButton: 'בטל',
      alternativeAction: 'נסה מאוחר יותר',
    },
  },
  conflict: {
    en: {
      title: 'Conflict Detected',
      message: 'This item has been modified by another user. Please refresh and try again.',
      retryButton: 'Refresh',
      dismissButton: 'Close',
      alternativeAction: 'View Changes',
    },
    ar: {
      title: 'تم اكتشاف تعارض',
      message: 'تم تعديل هذا العنصر من قبل مستخدم آخر. يرجى التحديث والمحاولة مرة أخرى.',
      retryButton: 'تحديث',
      dismissButton: 'إغلاق',
      alternativeAction: 'عرض التغييرات',
    },
    he: {
      title: 'זוהה קונפליקט',
      message: 'פריט זה שונה על ידי משתמש אחר. אנא רענן ונסה שוב.',
      retryButton: 'רענן',
      dismissButton: 'סגור',
      alternativeAction: 'הצג שינויים',
    },
  },
  rate_limit: {
    en: {
      title: 'Too Many Requests',
      message: 'You have made too many requests. Please wait a moment and try again.',
      retryButton: 'Retry',
      dismissButton: 'Close',
      alternativeAction: 'Wait 1 minute',
    },
    ar: {
      title: 'طلبات كثيرة جداً',
      message: 'لقد قمت بإرسال طلبات كثيرة. يرجى الانتظار قليلاً والمحاولة مرة أخرى.',
      retryButton: 'إعادة المحاولة',
      dismissButton: 'إغلاق',
      alternativeAction: 'الانتظار لدقيقة',
    },
    he: {
      title: 'יותר מדי בקשות',
      message: 'ביצעת יותר מדי בקשות. אנא המתן רגע ונסה שוב.',
      retryButton: 'נסה שוב',
      dismissButton: 'סגור',
      alternativeAction: 'המתן דקה',
    },
  },
  unknown_error: {
    en: {
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred. Please try again.',
      retryButton: 'Retry',
      dismissButton: 'Close',
      helpLink: 'Report Issue',
    },
    ar: {
      title: 'حدث خطأ ما',
      message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
      retryButton: 'إعادة المحاولة',
      dismissButton: 'إغلاق',
      helpLink: 'الإبلاغ عن المشكلة',
    },
    he: {
      title: 'משהו השתבש',
      message: 'אירעה שגיאה בלתי צפויה. אנא נסה שוב.',
      retryButton: 'נסה שוב',
      dismissButton: 'סגור',
      helpLink: 'דווח על בעיה',
    },
  },
};

/**
 * Gets the error prevention label for a specific type and locale
 * @param type - The error prevention type
 * @param locale - The locale code ('ar', 'he', or 'en')
 * @returns ErrorPreventionLabel object with localized strings
 */
export function getErrorPreventionLabel(
  type: ErrorPreventionType,
  locale: Locale
): ErrorPreventionLabel {
  const labels = ERROR_PREVENTION_LABELS[type];
  if (!labels) {
    return ERROR_PREVENTION_LABELS.info.en;
  }
  return labels[locale] ?? labels.en;
}

/**
 * Gets the confirmation dialog text for a specific action and locale
 * @param action - The confirmation action type
 * @param locale - The locale code ('ar', 'he', or 'en')
 * @returns ConfirmationDialogText object with localized strings
 */
export function getConfirmationDialogText(
  action: ConfirmationAction,
  locale: Locale
): ConfirmationDialogText {
  const dialogText = CONFIRMATION_DIALOG_TEXT[action];
  if (!dialogText) {
    return CONFIRMATION_DIALOG_TEXT.cancel[locale] ?? CONFIRMATION_DIALOG_TEXT.cancel.en;
  }
  return dialogText[locale] ?? dialogText.en;
}

/**
 * Gets all undo/redo labels for a specific locale
 * @param locale - The locale code ('ar', 'he', or 'en')
 * @returns UndoLabels object with localized strings
 */
export function getUndoLabels(locale: Locale): UndoLabels {
  return UNDO_LABELS_BY_LOCALE[locale] ?? UNDO_LABELS_BY_LOCALE.en;
}

/**
 * Gets the error recovery text for a specific error type and locale
 * @param error - The error type
 * @param locale - The locale code ('ar', 'he', or 'en')
 * @returns ErrorRecoveryText object with localized strings
 */
export function getErrorRecoveryText(
  error: ErrorType,
  locale: Locale
): ErrorRecoveryText {
  const recoveryText = ERROR_RECOVERY_TEXT[error];
  if (!recoveryText) {
    return ERROR_RECOVERY_TEXT.unknown_error[locale] ?? ERROR_RECOVERY_TEXT.unknown_error.en;
  }
  return recoveryText[locale] ?? recoveryText.en;
}

/**
 * Gets all available error prevention types
 * @returns Array of error prevention type strings
 */
export function getErrorPreventionTypes(): ErrorPreventionType[] {
  return Object.keys(ERROR_PREVENTION_LABELS) as ErrorPreventionType[];
}

/**
 * Gets all available confirmation actions
 * @returns Array of confirmation action strings
 */
export function getConfirmationActions(): ConfirmationAction[] {
  return Object.keys(CONFIRMATION_DIALOG_TEXT) as ConfirmationAction[];
}

/**
 * Gets all available error types
 * @returns Array of error type strings
 */
export function getErrorTypes(): ErrorType[] {
  return Object.keys(ERROR_RECOVERY_TEXT) as ErrorType[];
}

/**
 * Gets all supported locales
 * @returns Array of locale codes
 */
export function getSupportedLocales(): Locale[] {
  return ['ar', 'he', 'en'];
}

/**
 * Checks if a given type is a valid error prevention type
 * @param type - The type to check
 * @returns Boolean indicating if the type is valid
 */
export function isValidErrorPreventionType(type: string): type is ErrorPreventionType {
  return type in ERROR_PREVENTION_LABELS;
}

/**
 * Checks if a given action is a valid confirmation action
 * @param action - The action to check
 * @returns Boolean indicating if the action is valid
 */
export function isValidConfirmationAction(action: string): action is ConfirmationAction {
  return action in CONFIRMATION_DIALOG_TEXT;
}

/**
 * Checks if a given error is a valid error type
 * @param error - The error to check
 * @returns Boolean indicating if the error type is valid
 */
export function isValidErrorType(error: string): error is ErrorType {
  return error in ERROR_RECOVERY_TEXT;
}

/**
 * Checks if a given locale is supported
 * @param locale - The locale to check
 * @returns Boolean indicating if the locale is supported
 */
export function isSupportedLocale(locale: string): locale is Locale {
  return ['ar', 'he', 'en'].includes(locale);
}

// Export constants for testing
export {
  ERROR_PREVENTION_LABELS,
  CONFIRMATION_DIALOG_TEXT,
  UNDO_LABELS_BY_LOCALE,
  ERROR_RECOVERY_TEXT,
};
