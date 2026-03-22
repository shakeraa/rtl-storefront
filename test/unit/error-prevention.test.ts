import { describe, it, expect } from 'vitest';
import {
  getErrorPreventionLabel,
  getConfirmationDialogText,
  getUndoLabels,
  getErrorRecoveryText,
  getErrorPreventionTypes,
  getConfirmationActions,
  getErrorTypes,
  getSupportedLocales,
  isValidErrorPreventionType,
  isValidConfirmationAction,
  isValidErrorType,
  isSupportedLocale,
  ERROR_PREVENTION_LABELS,
  CONFIRMATION_DIALOG_TEXT,
  UNDO_LABELS_BY_LOCALE,
  ERROR_RECOVERY_TEXT,
  Locale,
  ErrorPreventionType,
  ConfirmationAction,
  ErrorType,
} from '../../app/services/translation-features/error-prevention';

describe('Error Prevention Translation Service - T0349', () => {
  describe('getErrorPreventionLabel', () => {
    it('returns English warning label', () => {
      const label = getErrorPreventionLabel('warning', 'en');
      expect(label.title).toBe('Warning');
      expect(label.message).toBe('Please review before proceeding');
      expect(label.icon).toBe('⚠️');
    });

    it('returns Arabic warning label', () => {
      const label = getErrorPreventionLabel('warning', 'ar');
      expect(label.title).toBe('تحذير');
      expect(label.message).toBe('يرجى المراجعة قبل المتابعة');
    });

    it('returns Hebrew warning label', () => {
      const label = getErrorPreventionLabel('warning', 'he');
      expect(label.title).toBe('אזהרה');
      expect(label.message).toBe('אנא בדוק לפני המשך');
    });

    it('returns English error label', () => {
      const label = getErrorPreventionLabel('error', 'en');
      expect(label.title).toBe('Error');
      expect(label.message).toBe('Something went wrong');
      expect(label.icon).toBe('❌');
    });

    it('returns Arabic error label', () => {
      const label = getErrorPreventionLabel('error', 'ar');
      expect(label.title).toBe('خطأ');
      expect(label.message).toBe('حدث خطأ ما');
    });

    it('returns Hebrew error label', () => {
      const label = getErrorPreventionLabel('error', 'he');
      expect(label.title).toBe('שגיאה');
      expect(label.message).toBe('משהו השתבש');
    });

    it('returns success labels in all locales', () => {
      const en = getErrorPreventionLabel('success', 'en');
      const ar = getErrorPreventionLabel('success', 'ar');
      const he = getErrorPreventionLabel('success', 'he');

      expect(en.title).toBe('Success');
      expect(ar.title).toBe('نجاح');
      expect(he.title).toBe('הצלחה');
    });

    it('returns unsaved changes labels in all locales', () => {
      const en = getErrorPreventionLabel('unsaved_changes', 'en');
      const ar = getErrorPreventionLabel('unsaved_changes', 'ar');
      const he = getErrorPreventionLabel('unsaved_changes', 'he');

      expect(en.title).toBe('Unsaved Changes');
      expect(ar.title).toBe('تغييرات غير محفوظة');
      expect(he.title).toBe('שינויים שלא נשמרו');
    });

    it('falls back to English for unsupported locale', () => {
      const label = getErrorPreventionLabel('info', 'fr' as Locale);
      expect(label.title).toBe('Information');
    });

    it('falls back to info type for invalid type', () => {
      const label = getErrorPreventionLabel('invalid' as ErrorPreventionType, 'en');
      expect(label.title).toBe('Information');
    });
  });

  describe('getConfirmationDialogText', () => {
    it('returns delete confirmation in English', () => {
      const dialog = getConfirmationDialogText('delete', 'en');
      expect(dialog.title).toBe('Confirm Delete');
      expect(dialog.message).toContain('cannot be undone');
      expect(dialog.confirmButton).toBe('Delete');
      expect(dialog.cancelButton).toBe('Cancel');
      expect(dialog.destructive).toBe(true);
    });

    it('returns delete confirmation in Arabic', () => {
      const dialog = getConfirmationDialogText('delete', 'ar');
      expect(dialog.title).toBe('تأكيد الحذف');
      expect(dialog.confirmButton).toBe('حذف');
      expect(dialog.cancelButton).toBe('إلغاء');
    });

    it('returns delete confirmation in Hebrew', () => {
      const dialog = getConfirmationDialogText('delete', 'he');
      expect(dialog.title).toBe('אשר מחיקה');
      expect(dialog.confirmButton).toBe('מחק');
      expect(dialog.cancelButton).toBe('בטל');
    });

    it('returns save confirmation in all locales', () => {
      const en = getConfirmationDialogText('save', 'en');
      const ar = getConfirmationDialogText('save', 'ar');
      const he = getConfirmationDialogText('save', 'he');

      expect(en.confirmButton).toBe('Save');
      expect(ar.confirmButton).toBe('حفظ');
      expect(he.confirmButton).toBe('שמור');
      expect(en.destructive).toBe(false);
    });

    it('returns discard confirmation in all locales', () => {
      const en = getConfirmationDialogText('discard', 'en');
      const ar = getConfirmationDialogText('discard', 'ar');
      const he = getConfirmationDialogText('discard', 'he');

      expect(en.title).toBe('Discard Changes');
      expect(ar.title).toBe('تجاهل التغييرات');
      expect(he.title).toBe('השלך שינויים');
      expect(en.destructive).toBe(true);
    });

    it('returns publish confirmation in all locales', () => {
      const en = getConfirmationDialogText('publish', 'en');
      const ar = getConfirmationDialogText('publish', 'ar');
      const he = getConfirmationDialogText('publish', 'he');

      expect(en.title).toBe('Publish Content');
      expect(ar.title).toBe('نشر المحتوى');
      expect(he.title).toBe('פרסם תוכן');
    });

    it('returns navigate away confirmation in all locales', () => {
      const en = getConfirmationDialogText('navigate_away', 'en');
      const ar = getConfirmationDialogText('navigate_away', 'ar');
      const he = getConfirmationDialogText('navigate_away', 'he');

      expect(en.title).toBe('Leave Page?');
      expect(ar.title).toBe('مغادرة الصفحة؟');
      expect(he.title).toBe('לעזוב את הדף?');
      expect(en.destructive).toBe(true);
    });

    it('returns bulk action confirmation in all locales', () => {
      const en = getConfirmationDialogText('bulk_action', 'en');
      const ar = getConfirmationDialogText('bulk_action', 'ar');
      const he = getConfirmationDialogText('bulk_action', 'he');

      expect(en.title).toBe('Confirm Bulk Action');
      expect(ar.title).toBe('تأكيد الإجراء الجماعي');
      expect(he.title).toBe('אשר פעולה מרובה');
    });

    it('falls back to English for unsupported locale', () => {
      const dialog = getConfirmationDialogText('save', 'fr' as Locale);
      expect(dialog.title).toBe('Save Changes');
    });

    it('falls back to cancel action for invalid action', () => {
      const dialog = getConfirmationDialogText('invalid' as ConfirmationAction, 'en');
      expect(dialog.title).toBe('Cancel Operation');
    });
  });

  describe('getUndoLabels', () => {
    it('returns English undo labels', () => {
      const labels = getUndoLabels('en');
      expect(labels.undo).toBe('Undo');
      expect(labels.redo).toBe('Redo');
      expect(labels.actionUndone).toBe('Action undone');
      expect(labels.actionRedone).toBe('Action redone');
      expect(labels.undoFailed).toBe('Could not undo action');
      expect(labels.redoFailed).toBe('Could not redo action');
      expect(labels.nothingToUndo).toBe('Nothing to undo');
      expect(labels.nothingToRedo).toBe('Nothing to redo');
      expect(labels.undoHistory).toBe('Undo History');
      expect(labels.clearHistory).toBe('Clear History');
    });

    it('returns Arabic undo labels', () => {
      const labels = getUndoLabels('ar');
      expect(labels.undo).toBe('تراجع');
      expect(labels.redo).toBe('إعادة');
      expect(labels.actionUndone).toBe('تم التراجع عن الإجراء');
      expect(labels.actionRedone).toBe('تمت إعادة الإجراء');
      expect(labels.undoFailed).toBe('تعذر التراجع عن الإجراء');
      expect(labels.redoFailed).toBe('تعذرت إعادة الإجراء');
      expect(labels.nothingToUndo).toBe('لا يوجد شيء للتراجع عنه');
      expect(labels.nothingToRedo).toBe('لا يوجد شيء لإعادته');
      expect(labels.undoHistory).toBe('سجل التراجع');
      expect(labels.clearHistory).toBe('مسح السجل');
    });

    it('returns Hebrew undo labels', () => {
      const labels = getUndoLabels('he');
      expect(labels.undo).toBe('בטל פעולה');
      expect(labels.redo).toBe('בצע שוב');
      expect(labels.actionUndone).toBe('הפעולה בוטלה');
      expect(labels.actionRedone).toBe('הפעולה בוצעה שוב');
      expect(labels.undoFailed).toBe('לא ניתן לבטל את הפעולה');
      expect(labels.redoFailed).toBe('לא ניתן לבצע שוב את הפעולה');
      expect(labels.nothingToUndo).toBe('אין מה לבטל');
      expect(labels.nothingToRedo).toBe('אין מה לבצע שוב');
      expect(labels.undoHistory).toBe('היסטוריית ביטולים');
      expect(labels.clearHistory).toBe('נקה היסטוריה');
    });

    it('falls back to English for unsupported locale', () => {
      const labels = getUndoLabels('fr' as Locale);
      expect(labels.undo).toBe('Undo');
    });
  });

  describe('getErrorRecoveryText', () => {
    it('returns network error recovery in English', () => {
      const recovery = getErrorRecoveryText('network_error', 'en');
      expect(recovery.title).toBe('Connection Error');
      expect(recovery.message).toContain('internet connection');
      expect(recovery.retryButton).toBe('Retry');
      expect(recovery.dismissButton).toBe('Dismiss');
      expect(recovery.alternativeAction).toBe('Work Offline');
    });

    it('returns network error recovery in Arabic', () => {
      const recovery = getErrorRecoveryText('network_error', 'ar');
      expect(recovery.title).toBe('خطأ في الاتصال');
      expect(recovery.retryButton).toBe('إعادة المحاولة');
      expect(recovery.alternativeAction).toBe('العمل بدون اتصال');
    });

    it('returns network error recovery in Hebrew', () => {
      const recovery = getErrorRecoveryText('network_error', 'he');
      expect(recovery.title).toBe('שגיאת חיבור');
      expect(recovery.alternativeAction).toBe('עבוד במצב לא מקוון');
    });

    it('returns server error recovery in all locales', () => {
      const en = getErrorRecoveryText('server_error', 'en');
      const ar = getErrorRecoveryText('server_error', 'ar');
      const he = getErrorRecoveryText('server_error', 'he');

      expect(en.title).toBe('Server Error');
      expect(ar.title).toBe('خطأ في الخادم');
      expect(he.title).toBe('שגיאת שרת');
      expect(en.helpLink).toBe('Contact Support');
    });

    it('returns permission error recovery in all locales', () => {
      const en = getErrorRecoveryText('permission_error', 'en');
      const ar = getErrorRecoveryText('permission_error', 'ar');
      const he = getErrorRecoveryText('permission_error', 'he');

      expect(en.title).toBe('Access Denied');
      expect(ar.title).toBe('الوصول مرفوض');
      expect(he.title).toBe('גישה נדחתה');
    });

    it('returns not found error recovery in all locales', () => {
      const en = getErrorRecoveryText('not_found', 'en');
      const ar = getErrorRecoveryText('not_found', 'ar');
      const he = getErrorRecoveryText('not_found', 'he');

      expect(en.title).toBe('Not Found');
      expect(ar.title).toBe('غير موجود');
      expect(he.title).toBe('לא נמצא');
    });

    it('returns timeout error recovery in all locales', () => {
      const en = getErrorRecoveryText('timeout', 'en');
      const ar = getErrorRecoveryText('timeout', 'ar');
      const he = getErrorRecoveryText('timeout', 'he');

      expect(en.title).toBe('Request Timeout');
      expect(ar.title).toBe('انتهاء مهلة الطلب');
      expect(he.title).toBe('פסק זמן בקשה');
    });

    it('returns conflict error recovery in all locales', () => {
      const en = getErrorRecoveryText('conflict', 'en');
      const ar = getErrorRecoveryText('conflict', 'ar');
      const he = getErrorRecoveryText('conflict', 'he');

      expect(en.title).toBe('Conflict Detected');
      expect(ar.title).toBe('تم اكتشاف تعارض');
      expect(he.title).toBe('זוהה קונפליקט');
    });

    it('returns rate limit error recovery in all locales', () => {
      const en = getErrorRecoveryText('rate_limit', 'en');
      const ar = getErrorRecoveryText('rate_limit', 'ar');
      const he = getErrorRecoveryText('rate_limit', 'he');

      expect(en.title).toBe('Too Many Requests');
      expect(ar.title).toBe('طلبات كثيرة جداً');
      expect(he.title).toBe('יותר מדי בקשות');
    });

    it('returns unknown error recovery in all locales', () => {
      const en = getErrorRecoveryText('unknown_error', 'en');
      const ar = getErrorRecoveryText('unknown_error', 'ar');
      const he = getErrorRecoveryText('unknown_error', 'he');

      expect(en.title).toBe('Something Went Wrong');
      expect(ar.title).toBe('حدث خطأ ما');
      expect(he.title).toBe('משהו השתבש');
    });

    it('falls back to English for unsupported locale', () => {
      const recovery = getErrorRecoveryText('network_error', 'fr' as Locale);
      expect(recovery.title).toBe('Connection Error');
    });

    it('falls back to unknown error for invalid error type', () => {
      const recovery = getErrorRecoveryText('invalid' as ErrorType, 'en');
      expect(recovery.title).toBe('Something Went Wrong');
    });
  });

  describe('getErrorPreventionTypes', () => {
    it('returns all error prevention types', () => {
      const types = getErrorPreventionTypes();
      expect(types).toContain('warning');
      expect(types).toContain('error');
      expect(types).toContain('info');
      expect(types).toContain('success');
      expect(types).toContain('critical');
      expect(types).toContain('validation');
      expect(types).toContain('confirmation');
      expect(types).toContain('unsaved_changes');
      expect(types.length).toBe(8);
    });
  });

  describe('getConfirmationActions', () => {
    it('returns all confirmation actions', () => {
      const actions = getConfirmationActions();
      expect(actions).toContain('delete');
      expect(actions).toContain('save');
      expect(actions).toContain('discard');
      expect(actions).toContain('publish');
      expect(actions).toContain('unpublish');
      expect(actions).toContain('archive');
      expect(actions).toContain('restore');
      expect(actions).toContain('logout');
      expect(actions).toContain('navigate_away');
      expect(actions).toContain('bulk_action');
      expect(actions).toContain('reset');
      expect(actions).toContain('cancel');
      expect(actions.length).toBe(12);
    });
  });

  describe('getErrorTypes', () => {
    it('returns all error types', () => {
      const types = getErrorTypes();
      expect(types).toContain('network_error');
      expect(types).toContain('server_error');
      expect(types).toContain('validation_error');
      expect(types).toContain('permission_error');
      expect(types).toContain('not_found');
      expect(types).toContain('timeout');
      expect(types).toContain('conflict');
      expect(types).toContain('rate_limit');
      expect(types).toContain('unknown_error');
      expect(types.length).toBe(9);
    });
  });

  describe('getSupportedLocales', () => {
    it('returns all supported locales', () => {
      const locales = getSupportedLocales();
      expect(locales).toContain('ar');
      expect(locales).toContain('he');
      expect(locales).toContain('en');
      expect(locales.length).toBe(3);
    });
  });

  describe('isValidErrorPreventionType', () => {
    it('returns true for valid types', () => {
      expect(isValidErrorPreventionType('warning')).toBe(true);
      expect(isValidErrorPreventionType('error')).toBe(true);
      expect(isValidErrorPreventionType('success')).toBe(true);
    });

    it('returns false for invalid types', () => {
      expect(isValidErrorPreventionType('invalid')).toBe(false);
      expect(isValidErrorPreventionType('')).toBe(false);
    });
  });

  describe('isValidConfirmationAction', () => {
    it('returns true for valid actions', () => {
      expect(isValidConfirmationAction('delete')).toBe(true);
      expect(isValidConfirmationAction('save')).toBe(true);
      expect(isValidConfirmationAction('publish')).toBe(true);
    });

    it('returns false for invalid actions', () => {
      expect(isValidConfirmationAction('invalid')).toBe(false);
      expect(isValidConfirmationAction('')).toBe(false);
    });
  });

  describe('isValidErrorType', () => {
    it('returns true for valid error types', () => {
      expect(isValidErrorType('network_error')).toBe(true);
      expect(isValidErrorType('server_error')).toBe(true);
      expect(isValidErrorType('validation_error')).toBe(true);
    });

    it('returns false for invalid error types', () => {
      expect(isValidErrorType('invalid')).toBe(false);
      expect(isValidErrorType('')).toBe(false);
    });
  });

  describe('isSupportedLocale', () => {
    it('returns true for supported locales', () => {
      expect(isSupportedLocale('ar')).toBe(true);
      expect(isSupportedLocale('he')).toBe(true);
      expect(isSupportedLocale('en')).toBe(true);
    });

    it('returns false for unsupported locales', () => {
      expect(isSupportedLocale('fr')).toBe(false);
      expect(isSupportedLocale('es')).toBe(false);
      expect(isSupportedLocale('')).toBe(false);
    });
  });

  describe('Constants', () => {
    it('exports ERROR_PREVENTION_LABELS', () => {
      expect(ERROR_PREVENTION_LABELS).toBeDefined();
      expect(ERROR_PREVENTION_LABELS.warning).toBeDefined();
      expect(ERROR_PREVENTION_LABELS.warning.en).toBeDefined();
      expect(ERROR_PREVENTION_LABELS.warning.ar).toBeDefined();
      expect(ERROR_PREVENTION_LABELS.warning.he).toBeDefined();
    });

    it('exports CONFIRMATION_DIALOG_TEXT', () => {
      expect(CONFIRMATION_DIALOG_TEXT).toBeDefined();
      expect(CONFIRMATION_DIALOG_TEXT.delete).toBeDefined();
      expect(CONFIRMATION_DIALOG_TEXT.delete.en).toBeDefined();
      expect(CONFIRMATION_DIALOG_TEXT.delete.ar).toBeDefined();
      expect(CONFIRMATION_DIALOG_TEXT.delete.he).toBeDefined();
    });

    it('exports UNDO_LABELS_BY_LOCALE', () => {
      expect(UNDO_LABELS_BY_LOCALE).toBeDefined();
      expect(UNDO_LABELS_BY_LOCALE.en).toBeDefined();
      expect(UNDO_LABELS_BY_LOCALE.ar).toBeDefined();
      expect(UNDO_LABELS_BY_LOCALE.he).toBeDefined();
    });

    it('exports ERROR_RECOVERY_TEXT', () => {
      expect(ERROR_RECOVERY_TEXT).toBeDefined();
      expect(ERROR_RECOVERY_TEXT.network_error).toBeDefined();
      expect(ERROR_RECOVERY_TEXT.network_error.en).toBeDefined();
      expect(ERROR_RECOVERY_TEXT.network_error.ar).toBeDefined();
      expect(ERROR_RECOVERY_TEXT.network_error.he).toBeDefined();
    });
  });

  describe('Critical error handling', () => {
    it('returns critical error labels in all locales', () => {
      const en = getErrorPreventionLabel('critical', 'en');
      const ar = getErrorPreventionLabel('critical', 'ar');
      const he = getErrorPreventionLabel('critical', 'he');

      expect(en.title).toBe('Critical Error');
      expect(ar.title).toBe('خطأ حرج');
      expect(he.title).toBe('שגיאה קריטית');
    });

    it('returns validation error labels in all locales', () => {
      const en = getErrorPreventionLabel('validation', 'en');
      const ar = getErrorPreventionLabel('validation', 'ar');
      const he = getErrorPreventionLabel('validation', 'he');

      expect(en.title).toBe('Validation Error');
      expect(ar.title).toBe('خطأ في التحقق');
      expect(he.title).toBe('שגיאת אימות');
    });
  });

  describe('Archive and restore actions', () => {
    it('returns archive confirmation in all locales', () => {
      const en = getConfirmationDialogText('archive', 'en');
      const ar = getConfirmationDialogText('archive', 'ar');
      const he = getConfirmationDialogText('archive', 'he');

      expect(en.title).toBe('Archive Item');
      expect(ar.title).toBe('أرشفة العنصر');
      expect(he.title).toBe('העבר לארכיון');
    });

    it('returns restore confirmation in all locales', () => {
      const en = getConfirmationDialogText('restore', 'en');
      const ar = getConfirmationDialogText('restore', 'ar');
      const he = getConfirmationDialogText('restore', 'he');

      expect(en.title).toBe('Restore Item');
      expect(ar.title).toBe('استعادة العنصر');
      expect(he.title).toBe('שחזר פריט');
    });
  });

  describe('Logout action', () => {
    it('returns logout confirmation in all locales', () => {
      const en = getConfirmationDialogText('logout', 'en');
      const ar = getConfirmationDialogText('logout', 'ar');
      const he = getConfirmationDialogText('logout', 'he');

      expect(en.title).toBe('Confirm Logout');
      expect(ar.title).toBe('تأكيد تسجيل الخروج');
      expect(he.title).toBe('אשר יציאה');
    });
  });

  describe('Unpublish and reset actions', () => {
    it('returns unpublish confirmation in all locales', () => {
      const en = getConfirmationDialogText('unpublish', 'en');
      const ar = getConfirmationDialogText('unpublish', 'ar');
      const he = getConfirmationDialogText('unpublish', 'he');

      expect(en.title).toBe('Unpublish Content');
      expect(ar.title).toBe('إلغاء نشر المحتوى');
      expect(he.title).toBe('בטל פרסום תוכן');
    });

    it('returns reset confirmation in all locales', () => {
      const en = getConfirmationDialogText('reset', 'en');
      const ar = getConfirmationDialogText('reset', 'ar');
      const he = getConfirmationDialogText('reset', 'he');

      expect(en.title).toBe('Reset to Default');
      expect(ar.title).toBe('إعادة التعيين للإعدادات الافتراضية');
      expect(he.title).toBe('אפס להגדרות ברירת מחדל');
      expect(en.destructive).toBe(true);
    });
  });
});
