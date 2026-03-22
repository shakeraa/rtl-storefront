/**
 * Popup and modal content translations for RTL Storefront.
 * Covers popup labels, modal types, and button configurations
 * for Arabic (ar), Hebrew (he), and English (en) locales.
 */

/** Popup action labels */
export type PopupLabelKey =
  | "close"
  | "dismiss"
  | "accept"
  | "decline"
  | "yes"
  | "no"
  | "confirm"
  | "cancel"
  | "later"
  | "notNow";

/** Modal types supported by the popup system */
export type ModalType =
  | "welcome"
  | "exitIntent"
  | "promotional"
  | "cookieConsent"
  | "ageVerification";

/** Button configuration for a modal */
export interface ModalButton {
  key: PopupLabelKey;
  label: string;
  variant?: "primary" | "secondary" | "danger";
}

/** Complete popup content structure */
export interface PopupContent {
  title: string;
  message: string;
  buttons: ModalButton[];
  type: ModalType;
}

/** Popup labels in different languages */
const POPUP_LABELS: Record<string, Record<PopupLabelKey, string>> = {
  en: {
    close: "Close",
    dismiss: "Dismiss",
    accept: "Accept",
    decline: "Decline",
    yes: "Yes",
    no: "No",
    confirm: "Confirm",
    cancel: "Cancel",
    later: "Later",
    notNow: "Not now",
  },
  ar: {
    close: "إغلاق",
    dismiss: "تجاهل",
    accept: "قبول",
    decline: "رفض",
    yes: "نعم",
    no: "لا",
    confirm: "تأكيد",
    cancel: "إلغاء",
    later: "لاحقاً",
    notNow: "ليس الآن",
  },
  he: {
    close: "סגור",
    dismiss: "התעלם",
    accept: "קבל",
    decline: "דחה",
    yes: "כן",
    no: "לא",
    confirm: "אשר",
    cancel: "בטל",
    later: "מאוחר יותר",
    notNow: "לא עכשיו",
  },
};

/** Modal-specific button configurations */
const MODAL_BUTTON_CONFIGS: Record<ModalType, PopupLabelKey[]> = {
  welcome: ["accept", "decline"],
  exitIntent: ["yes", "no", "later"],
  promotional: ["accept", "decline", "notNow"],
  cookieConsent: ["accept", "decline"],
  ageVerification: ["confirm", "cancel"],
};

/** Default modal content templates */
const MODAL_CONTENT_TEMPLATES: Record<
  string,
  Record<ModalType, Omit<PopupContent, "buttons">>
> = {
  en: {
    welcome: {
      type: "welcome",
      title: "Welcome!",
      message: "Thank you for visiting our store. Enjoy your shopping experience.",
    },
    exitIntent: {
      type: "exitIntent",
      title: "Wait! Don't Go Yet",
      message: "Before you leave, would you like to save your cart for later?",
    },
    promotional: {
      type: "promotional",
      title: "Special Offer",
      message: "Get 20% off your first order! Limited time offer.",
    },
    cookieConsent: {
      type: "cookieConsent",
      title: "Cookie Consent",
      message: "We use cookies to enhance your browsing experience and analyze our traffic.",
    },
    ageVerification: {
      type: "ageVerification",
      title: "Age Verification",
      message: "You must be 18 years or older to enter this site.",
    },
  },
  ar: {
    welcome: {
      type: "welcome",
      title: "أهلاً وسهلاً!",
      message: "شكراً لزيارتك متجرنا. نتمنى لك تجربة تسوق ممتعة.",
    },
    exitIntent: {
      type: "exitIntent",
      title: "انتظر! لا تغادر بعد",
      message: "قبل أن تغادر، هل ترغب في حفظ سلتك للاستمرار لاحقاً؟",
    },
    promotional: {
      type: "promotional",
      title: "عرض خاص",
      message: "احصل على خصم 20% على طلبك الأول! عرض لفترة محدودة.",
    },
    cookieConsent: {
      type: "cookieConsent",
      title: "الموافقة على ملفات تعريف الارتباط",
      message: "نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح وتحليل حركة المرور.",
    },
    ageVerification: {
      type: "ageVerification",
      title: "التحقق من العمر",
      message: "يجب أن يكون عمرك 18 عاماً أو أكثر للدخول إلى هذا الموقع.",
    },
  },
  he: {
    welcome: {
      type: "welcome",
      title: "ברוכים הבאים!",
      message: "תודה שביקרת בחנות שלנו. אנחנו מאחלים לך חווית קניה נעימה.",
    },
    exitIntent: {
      type: "exitIntent",
      title: "חכה! אל תלך עדיין",
      message: "לפני שאתה עוזב, האם תרצה לשמור את העגלה שלך להמשך מאוחר יותר?",
    },
    promotional: {
      type: "promotional",
      title: "הצעה מיוחדת",
      message: "קבל 20% הנחה בהזמנה הראשונה שלך! הצעה לזמן מוגבל.",
    },
    cookieConsent: {
      type: "cookieConsent",
      title: "הסכמה לעוגיות",
      message: "אנחנו משתמשים בעוגיות כדי לשפר את חוויית הגלישה ולנתח את התנועה באתר.",
    },
    ageVerification: {
      type: "ageVerification",
      title: "אימות גיל",
      message: "הגיל שלך חייב להיות 18 או מעלה כדי להיכנס לאתר זה.",
    },
  },
};

/**
 * Extracts the base locale code from a locale string.
 * Handles formats like "en-US", "ar-SA", "he-IL".
 */
function getBaseLocale(locale: string): string {
  const base = locale.split("-")[0]?.toLowerCase() ?? "en";
  return base;
}

/**
 * Gets a popup label by key for the specified locale.
 * Falls back to English if the locale or key is not found.
 *
 * @param key - The label key to retrieve
 * @param locale - The locale code (e.g., "en", "ar", "he", "en-US")
 * @returns The translated label string
 *
 * @example
 * ```ts
 * getPopupLabel("close", "ar"); // "إغلاق"
 * getPopupLabel("confirm", "he"); // "אשר"
 * ```
 */
export function getPopupLabel(key: PopupLabelKey, locale: string): string {
  const base = getBaseLocale(locale);
  const labels = POPUP_LABELS[base] ?? POPUP_LABELS["en"];
  return labels[key] ?? POPUP_LABELS["en"][key];
}

/**
 * Gets button configurations for a specific modal type and locale.
 * Each button includes the translated label and appropriate variant.
 *
 * @param type - The modal type
 * @param locale - The locale code
 * @returns Array of button configurations
 *
 * @example
 * ```ts
 * getModalButtons("cookieConsent", "ar");
 * // Returns accept/decline buttons with Arabic labels
 * ```
 */
export function getModalButtons(
  type: ModalType,
  locale: string,
): ModalButton[] {
  const base = getBaseLocale(locale);
  const labels = POPUP_LABELS[base] ?? POPUP_LABELS["en"];
  const buttonKeys = MODAL_BUTTON_CONFIGS[type];

  return buttonKeys.map((key, index) => {
    const variant: ModalButton["variant"] =
      index === 0
        ? "primary"
        : index === buttonKeys.length - 1 && key === "decline"
          ? "danger"
          : "secondary";

    return {
      key,
      label: labels[key],
      variant,
    };
  });
}

/**
 * Gets complete popup content including title, message, and buttons
 * for the specified modal type and locale.
 *
 * @param type - The modal type
 * @param locale - The locale code
 * @returns Complete popup content structure
 *
 * @example
 * ```ts
 * getPopupContent("welcome", "he");
 * // Returns Hebrew welcome modal content with buttons
 * ```
 */
export function getPopupContent(type: ModalType, locale: string): PopupContent {
  const base = getBaseLocale(locale);
  const templates = MODAL_CONTENT_TEMPLATES[base] ?? MODAL_CONTENT_TEMPLATES["en"];
  const template = templates[type];
  const buttons = getModalButtons(type, locale);

  return {
    ...template,
    buttons,
  };
}

/**
 * Gets all available popup label keys.
 * Useful for iterating over all possible labels.
 */
export function getPopupLabelKeys(): PopupLabelKey[] {
  return Object.keys(POPUP_LABELS["en"]) as PopupLabelKey[];
}

/**
 * Gets all available modal types.
 * Useful for building dynamic modal configurations.
 */
export function getModalTypes(): ModalType[] {
  return Object.keys(MODAL_BUTTON_CONFIGS) as ModalType[];
}

/**
 * Checks if a modal type requires confirmation.
 * Age verification and cookie consent typically require explicit action.
 */
export function requiresConfirmation(type: ModalType): boolean {
  return type === "ageVerification" || type === "cookieConsent";
}

/**
 * Gets the text direction for the locale.
 * Returns "rtl" for Arabic and Hebrew, "ltr" for others.
 */
export function getPopupDirection(locale: string): "rtl" | "ltr" {
  const base = getBaseLocale(locale);
  return base === "ar" || base === "he" ? "rtl" : "ltr";
}
