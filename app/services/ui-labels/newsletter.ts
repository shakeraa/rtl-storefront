/**
 * Newsletter labels and translations for RTL Storefront
 * Supports Arabic (ar), Hebrew (he), and English (en)
 */

export interface NewsletterLabels {
  subscribe: string;
  emailPlaceholder: string;
  subscribeButton: string;
  successMessage: string;
  errorMessage: string;
  privacyNotice: string;
  unsubscribe: string;
}

export interface SubscribeFormLabels {
  title: string;
  description: string;
  emailLabel: string;
  emailPlaceholder: string;
  submitButton: string;
  requiredError: string;
  invalidEmailError: string;
  privacyText: string;
  privacyLink: string;
}

export interface UnsubscribeLabels {
  title: string;
  description: string;
  emailLabel: string;
  emailPlaceholder: string;
  submitButton: string;
  successMessage: string;
  errorMessage: string;
}

const NEWSLETTER_LABELS: Record<string, NewsletterLabels> = {
  en: {
    subscribe: "Subscribe to our newsletter",
    emailPlaceholder: "Enter your email address",
    subscribeButton: "Subscribe",
    successMessage: "Thank you for subscribing! Please check your email to confirm.",
    errorMessage: "Something went wrong. Please try again later.",
    privacyNotice: "By subscribing, you agree to our Privacy Policy and consent to receive updates.",
    unsubscribe: "Unsubscribe",
  },
  ar: {
    subscribe: "اشترك في نشرتنا الإخبارية",
    emailPlaceholder: "أدخل عنوان بريدك الإلكتروني",
    subscribeButton: "اشتراك",
    successMessage: "شكراً لاشتراكك! يرجى التحقق من بريدك الإلكتروني للتأكيد.",
    errorMessage: "حدث خطأ ما. يرجى المحاولة مرة أخرى لاحقاً.",
    privacyNotice: "بالاشتراك، فإنك توافق على سياسة الخصوصية الخاصة بنا وتوافق على استلام التحديثات.",
    unsubscribe: "إلغاء الاشتراك",
  },
  he: {
    subscribe: "הירשם לניוזלטר שלנו",
    emailPlaceholder: "הזן את כתובת האימייל שלך",
    subscribeButton: "הרשמה",
    successMessage: "תודה שנרשמת! אנא בדוק את תיבת האימייל שלך לאישור.",
    errorMessage: "משהו השתבש. אנא נסה שוב מאוחר יותר.",
    privacyNotice: "בהרשמה, אתה מסכים למדיניות הפרטיות שלנו ומסכים לקבל עדכונים.",
    unsubscribe: "ביטול הרשמה",
  },
};

const SUBSCRIBE_FORM_LABELS: Record<string, SubscribeFormLabels> = {
  en: {
    title: "Stay Updated",
    description: "Get the latest news, updates, and exclusive offers directly to your inbox.",
    emailLabel: "Email Address",
    emailPlaceholder: "you@example.com",
    submitButton: "Subscribe Now",
    requiredError: "Email address is required",
    invalidEmailError: "Please enter a valid email address",
    privacyText: "We respect your privacy. Read our",
    privacyLink: "Privacy Policy",
  },
  ar: {
    title: "ابقَ على اطلاع",
    description: "احصل على أحدث الأخبار والتحديثات والعروض الحصرية مباشرة إلى صندوق الوارد الخاص بك.",
    emailLabel: "عنوان البريد الإلكتروني",
    emailPlaceholder: "you@example.com",
    submitButton: "اشترك الآن",
    requiredError: "عنوان البريد الإلكتروني مطلوب",
    invalidEmailError: "يرجى إدخال عنوان بريد إلكتروني صالح",
    privacyText: "نحن نحترم خصوصيتك. اقرأ",
    privacyLink: "سياسة الخصوصية",
  },
  he: {
    title: "הישאר מעודכן",
    description: "קבל את החדשות, העדכונים וההצעות הבלעדיות האחרונות ישירות לתיבת הדואר שלך.",
    emailLabel: "כתובת אימייל",
    emailPlaceholder: "you@example.com",
    submitButton: "הירשם עכשיו",
    requiredError: "כתובת אימייל נדרשת",
    invalidEmailError: "אנא הזן כתובת אימייל חוקית",
    privacyText: "אנו מכבדים את פרטיותך. קרא את",
    privacyLink: "מדיניות הפרטיות",
  },
};

const UNSUBSCRIBE_LABELS: Record<string, UnsubscribeLabels> = {
  en: {
    title: "Unsubscribe from Newsletter",
    description: "We're sorry to see you go. Enter your email below to unsubscribe.",
    emailLabel: "Email Address",
    emailPlaceholder: "Enter your email address",
    submitButton: "Unsubscribe",
    successMessage: "You have been successfully unsubscribed.",
    errorMessage: "Unable to unsubscribe. Please try again or contact support.",
  },
  ar: {
    title: "إلغاء الاشتراك في النشرة الإخبارية",
    description: "نأسف لرحيلك. أدخل بريدك الإلكتروني أدناه لإلغاء الاشتراك.",
    emailLabel: "عنوان البريد الإلكتروني",
    emailPlaceholder: "أدخل عنوان بريدك الإلكتروني",
    submitButton: "إلغاء الاشتراك",
    successMessage: "تم إلغاء اشتراكك بنجاح.",
    errorMessage: "تعذر إلغاء الاشتراك. يرجى المحاولة مرة أخرى أو الاتصال بالدعم.",
  },
  he: {
    title: "ביטול הרשמה לניוזלטר",
    description: "אנו מצטערים לראות אותך עוזב. הזן את האימייל שלך למטה לביטול הרשמה.",
    emailLabel: "כתובת אימייל",
    emailPlaceholder: "הזן את כתובת האימייל שלך",
    submitButton: "ביטול הרשמה",
    successMessage: "ההרשמה שלך בוטלה בהצלחה.",
    errorMessage: "לא ניתן לבטל את ההרשמה. אנא נסה שוב או צור קשר עם התמיכה.",
  },
};

/**
 * Get a specific newsletter label by key for a given locale
 * @param key - The label key to retrieve
 * @param locale - The locale code (e.g., 'en', 'ar', 'he')
 * @returns The translated label string
 */
export function getNewsletterLabel(
  key: keyof NewsletterLabels,
  locale: string
): string {
  const base = locale.split("-")[0]?.toLowerCase() ?? "en";
  const labels = NEWSLETTER_LABELS[base] ?? NEWSLETTER_LABELS["en"];
  return labels[key];
}

/**
 * Get all subscribe form labels for a given locale
 * @param locale - The locale code (e.g., 'en', 'ar', 'he')
 * @returns The SubscribeFormLabels object
 */
export function getSubscribeForm(locale: string): SubscribeFormLabels {
  const base = locale.split("-")[0]?.toLowerCase() ?? "en";
  return SUBSCRIBE_FORM_LABELS[base] ?? SUBSCRIBE_FORM_LABELS["en"];
}

/**
 * Get a personalized success message for a subscriber
 * @param email - The subscriber's email address
 * @param locale - The locale code (e.g., 'en', 'ar', 'he')
 * @returns A personalized success message string
 */
export function getSuccessMessage(email: string, locale: string): string {
  const base = locale.split("-")[0]?.toLowerCase() ?? "en";
  
  switch (base) {
    case "ar":
      return `شكراً لك! لقد تم إرسال رسالة تأكيد إلى ${email}. يرجى التحقق من صندوق الوارد الخاص بك.`;
    case "he":
      return `תודה! נשלחה הודעת אישור אל ${email}. אנא בדוק את תיבת הדואר שלך.`;
    case "en":
    default:
      return `Thank you! A confirmation email has been sent to ${email}. Please check your inbox.`;
  }
}

/**
 * Get all unsubscribe labels for a given locale
 * @param locale - The locale code (e.g., 'en', 'ar', 'he')
 * @returns The UnsubscribeLabels object
 */
export function getUnsubscribeLabels(locale: string): UnsubscribeLabels {
  const base = locale.split("-")[0]?.toLowerCase() ?? "en";
  return UNSUBSCRIBE_LABELS[base] ?? UNSUBSCRIBE_LABELS["en"];
}

/**
 * Get all newsletter labels for a given locale
 * @param locale - The locale code (e.g., 'en', 'ar', 'he')
 * @returns The NewsletterLabels object
 */
export function getAllNewsletterLabels(locale: string): NewsletterLabels {
  const base = locale.split("-")[0]?.toLowerCase() ?? "en";
  return NEWSLETTER_LABELS[base] ?? NEWSLETTER_LABELS["en"];
}

/**
 * Get validation error message for invalid email
 * @param locale - The locale code (e.g., 'en', 'ar', 'he')
 * @returns The validation error message string
 */
export function getEmailValidationError(locale: string): string {
  const base = locale.split("-")[0]?.toLowerCase() ?? "en";
  const formLabels = SUBSCRIBE_FORM_LABELS[base] ?? SUBSCRIBE_FORM_LABELS["en"];
  return formLabels.invalidEmailError;
}

/**
 * Get required field error message
 * @param locale - The locale code (e.g., 'en', 'ar', 'he')
 * @returns The required field error message string
 */
export function getRequiredFieldError(locale: string): string {
  const base = locale.split("-")[0]?.toLowerCase() ?? "en";
  const formLabels = SUBSCRIBE_FORM_LABELS[base] ?? SUBSCRIBE_FORM_LABELS["en"];
  return formLabels.requiredError;
}

/**
 * Check if the given locale is RTL
 * @param locale - The locale code (e.g., 'en', 'ar', 'he')
 * @returns boolean indicating if the locale is RTL
 */
export function isRtlLocale(locale: string): boolean {
  const base = locale.split("-")[0]?.toLowerCase() ?? "en";
  return base === "ar" || base === "he";
}

/**
 * Get the text direction for a locale
 * @param locale - The locale code (e.g., 'en', 'ar', 'he')
 * @returns 'rtl' or 'ltr'
 */
export function getTextDirection(locale: string): "rtl" | "ltr" {
  return isRtlLocale(locale) ? "rtl" : "ltr";
}
