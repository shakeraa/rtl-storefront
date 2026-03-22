/**
 * Email Template Translation Labels
 * Tasks: T0116 - T0120
 *
 * Provides translated labels for email templates across 4 locales:
 * English (en), Arabic (ar), Hebrew (he), Farsi/Persian (fa)
 */

// ---------------------------------------------------------------------------
// T0116 - Order confirmation email (15 labels × 4 locales)
// ---------------------------------------------------------------------------
export const ORDER_CONFIRMATION_LABELS: Record<string, Record<string, string>> = {
  subject: {
    en: 'Order Confirmation',
    ar: 'تأكيد الطلب',
    he: 'אישור הזמנה',
    fa: 'تأیید سفارش',
  },
  greeting: {
    en: 'Thank you for your order!',
    ar: 'شكراً لطلبك!',
    he: '!תודה על ההזמנה שלך',
    fa: '!با تشکر از سفارش شما',
  },
  order_number: {
    en: 'Order Number',
    ar: 'رقم الطلب',
    he: 'מספר הזמנה',
    fa: 'شماره سفارش',
  },
  order_date: {
    en: 'Order Date',
    ar: 'تاريخ الطلب',
    he: 'תאריך הזמנה',
    fa: 'تاریخ سفارش',
  },
  items_ordered: {
    en: 'Items Ordered',
    ar: 'المنتجات المطلوبة',
    he: 'פריטים שהוזמנו',
    fa: 'اقلام سفارش داده شده',
  },
  subtotal: {
    en: 'Subtotal',
    ar: 'المجموع الفرعي',
    he: 'סכום ביניים',
    fa: 'جمع جزئی',
  },
  shipping: {
    en: 'Shipping',
    ar: 'الشحن',
    he: 'משלוח',
    fa: 'حمل و نقل',
  },
  tax: {
    en: 'Tax',
    ar: 'الضريبة',
    he: 'מס',
    fa: 'مالیات',
  },
  total: {
    en: 'Total',
    ar: 'المجموع',
    he: 'סה״כ',
    fa: 'مجموع',
  },
  shipping_address: {
    en: 'Shipping Address',
    ar: 'عنوان الشحن',
    he: 'כתובת למשלוח',
    fa: 'آدرس ارسال',
  },
  billing_address: {
    en: 'Billing Address',
    ar: 'عنوان الفوترة',
    he: 'כתובת לחיוב',
    fa: 'آدرس صورتحساب',
  },
  payment_method: {
    en: 'Payment Method',
    ar: 'طريقة الدفع',
    he: 'אמצעי תשלום',
    fa: 'روش پرداخت',
  },
  thank_you: {
    en: 'Thank you for shopping with us!',
    ar: 'شكراً لتسوقكم معنا!',
    he: '!תודה שקניתם אצלנו',
    fa: '!با تشکر از خرید شما از ما',
  },
  track_order: {
    en: 'Track Your Order',
    ar: 'تتبع طلبك',
    he: 'עקוב אחרי ההזמנה',
    fa: 'پیگیری سفارش',
  },
  contact_us: {
    en: 'Contact Us',
    ar: 'اتصل بنا',
    he: 'צרו קשר',
    fa: 'تماس با ما',
  },
};

// ---------------------------------------------------------------------------
// T0117 - Shipping confirmation email (10 labels × 4 locales)
// ---------------------------------------------------------------------------
export const SHIPPING_CONFIRMATION_LABELS: Record<string, Record<string, string>> = {
  subject: {
    en: 'Your Order Has Been Shipped',
    ar: 'تم شحن طلبك',
    he: 'ההזמנה שלך נשלחה',
    fa: 'سفارش شما ارسال شد',
  },
  greeting: {
    en: 'Great news!',
    ar: 'أخبار رائعة!',
    he: '!חדשות טובות',
    fa: '!خبر خوب',
  },
  shipped_message: {
    en: 'Your order is on its way.',
    ar: 'طلبك في الطريق إليك.',
    he: 'ההזמנה שלך בדרך אליך.',
    fa: 'سفارش شما در راه است.',
  },
  tracking_number: {
    en: 'Tracking Number',
    ar: 'رقم التتبع',
    he: 'מספר מעקב',
    fa: 'شماره پیگیری',
  },
  carrier: {
    en: 'Carrier',
    ar: 'شركة الشحن',
    he: 'חברת שילוח',
    fa: 'شرکت حمل و نقل',
  },
  estimated_delivery: {
    en: 'Estimated Delivery',
    ar: 'التسليم المتوقع',
    he: 'מועד משלוח משוער',
    fa: 'تحویل تخمینی',
  },
  items_shipped: {
    en: 'Items Shipped',
    ar: 'المنتجات المشحونة',
    he: 'פריטים שנשלחו',
    fa: 'اقلام ارسال شده',
  },
  shipping_address: {
    en: 'Shipping Address',
    ar: 'عنوان الشحن',
    he: 'כתובת למשלוח',
    fa: 'آدرس ارسال',
  },
  track_package: {
    en: 'Track Your Package',
    ar: 'تتبع شحنتك',
    he: 'עקוב אחרי החבילה',
    fa: 'پیگیری بسته',
  },
  contact_us: {
    en: 'Contact Us',
    ar: 'اتصل بنا',
    he: 'צרו קשר',
    fa: 'تماس با ما',
  },
};

// ---------------------------------------------------------------------------
// T0118 - Account welcome email (7 labels × 4 locales)
// ---------------------------------------------------------------------------
export const ACCOUNT_WELCOME_LABELS: Record<string, Record<string, string>> = {
  subject: {
    en: 'Welcome to Our Store!',
    ar: 'مرحباً بك في متجرنا!',
    he: '!ברוכים הבאים לחנות שלנו',
    fa: '!به فروشگاه ما خوش آمدید',
  },
  greeting: {
    en: 'Hello and welcome!',
    ar: 'مرحباً وأهلاً بك!',
    he: '!שלום וברוכים הבאים',
    fa: '!سلام و خوش آمدید',
  },
  welcome_message: {
    en: 'Your account has been created successfully.',
    ar: 'تم إنشاء حسابك بنجاح.',
    he: 'החשבון שלך נוצר בהצלחה.',
    fa: 'حساب شما با موفقیت ایجاد شد.',
  },
  account_benefits: {
    en: 'Account Benefits',
    ar: 'مزايا الحساب',
    he: 'יתרונות החשבון',
    fa: 'مزایای حساب کاربری',
  },
  shop_now: {
    en: 'Shop Now',
    ar: 'تسوق الآن',
    he: 'קנה עכשיו',
    fa: 'همین حالا خرید کنید',
  },
  need_help: {
    en: 'Need Help?',
    ar: 'هل تحتاج مساعدة؟',
    he: 'צריכים עזרה?',
    fa: 'به کمک نیاز دارید؟',
  },
  contact_us: {
    en: 'Contact Us',
    ar: 'اتصل بنا',
    he: 'צרו קשר',
    fa: 'تماس با ما',
  },
};

// ---------------------------------------------------------------------------
// T0119 - Password reset email (7 labels × 4 locales)
// ---------------------------------------------------------------------------
export const PASSWORD_RESET_LABELS: Record<string, Record<string, string>> = {
  subject: {
    en: 'Reset Your Password',
    ar: 'إعادة تعيين كلمة المرور',
    he: 'איפוס סיסמה',
    fa: 'بازنشانی رمز عبور',
  },
  greeting: {
    en: 'Password Reset Request',
    ar: 'طلب إعادة تعيين كلمة المرور',
    he: 'בקשה לאיפוס סיסמה',
    fa: 'درخواست بازنشانی رمز عبور',
  },
  reset_message: {
    en: 'We received a request to reset your password.',
    ar: 'تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك.',
    he: 'קיבלנו בקשה לאיפוס הסיסמה שלך.',
    fa: 'ما درخواستی برای بازنشانی رمز عبور شما دریافت کردیم.',
  },
  reset_button: {
    en: 'Reset Password',
    ar: 'إعادة تعيين كلمة المرور',
    he: 'איפוס סיסמה',
    fa: 'بازنشانی رمز عبور',
  },
  expiry_note: {
    en: 'This link will expire in 24 hours.',
    ar: 'ستنتهي صلاحية هذا الرابط خلال 24 ساعة.',
    he: 'קישור זה יפוג תוך 24 שעות.',
    fa: 'این لینک تا ۲۴ ساعت دیگر منقضی خواهد شد.',
  },
  ignore_message: {
    en: 'If you did not request this, please ignore this email.',
    ar: 'إذا لم تطلب ذلك، يرجى تجاهل هذا البريد الإلكتروني.',
    he: 'אם לא ביקשת זאת, אנא התעלם מהודעה זו.',
    fa: 'اگر شما این درخواست را ارسال نکرده‌اید، لطفاً این ایمیل را نادیده بگیرید.',
  },
  contact_us: {
    en: 'Contact Us',
    ar: 'اتصل بنا',
    he: 'צרו קשר',
    fa: 'تماس با ما',
  },
};

// ---------------------------------------------------------------------------
// T0120 - Marketing email (9 labels × 4 locales)
// ---------------------------------------------------------------------------
export const MARKETING_EMAIL_LABELS: Record<string, Record<string, string>> = {
  shop_now: {
    en: 'Shop Now',
    ar: 'تسوق الآن',
    he: 'קנה עכשיו',
    fa: 'همین حالا خرید کنید',
  },
  view_collection: {
    en: 'View Collection',
    ar: 'عرض المجموعة',
    he: 'צפה באוסף',
    fa: 'مشاهده مجموعه',
  },
  limited_offer: {
    en: 'Limited Time Offer',
    ar: 'عرض لفترة محدودة',
    he: 'מבצע לזמן מוגבל',
    fa: 'پیشنهاد با زمان محدود',
  },
  ends_soon: {
    en: 'Ends Soon',
    ar: 'ينتهي قريباً',
    he: 'מסתיים בקרוב',
    fa: 'به زودی پایان می‌یابد',
  },
  free_shipping: {
    en: 'Free Shipping',
    ar: 'شحن مجاني',
    he: 'משלוח חינם',
    fa: 'ارسال رایگان',
  },
  new_arrivals: {
    en: 'New Arrivals',
    ar: 'وصل حديثاً',
    he: 'פריטים חדשים',
    fa: 'محصولات جدید',
  },
  best_sellers: {
    en: 'Best Sellers',
    ar: 'الأكثر مبيعاً',
    he: 'רבי מכר',
    fa: 'پرفروش‌ترین‌ها',
  },
  unsubscribe: {
    en: 'Unsubscribe',
    ar: 'إلغاء الاشتراك',
    he: 'ביטול הרשמה',
    fa: 'لغو اشتراک',
  },
  privacy_policy: {
    en: 'Privacy Policy',
    ar: 'سياسة الخصوصية',
    he: 'מדיניות פרטיות',
    fa: 'سیاست حفظ حریم خصوصی',
  },
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type EmailTemplateType =
  | 'order_confirmation'
  | 'shipping_confirmation'
  | 'account_welcome'
  | 'password_reset'
  | 'marketing';

// ---------------------------------------------------------------------------
// Internal mapping
// ---------------------------------------------------------------------------
const TEMPLATE_MAP: Record<EmailTemplateType, Record<string, Record<string, string>>> = {
  order_confirmation: ORDER_CONFIRMATION_LABELS,
  shipping_confirmation: SHIPPING_CONFIRMATION_LABELS,
  account_welcome: ACCOUNT_WELCOME_LABELS,
  password_reset: PASSWORD_RESET_LABELS,
  marketing: MARKETING_EMAIL_LABELS,
};

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

/**
 * Get a single translated label for a given email template type, key, and locale.
 * Falls back to English if the locale is not found, and returns the key itself
 * if neither the locale nor English is available.
 */
export function getEmailLabel(templateType: string, key: string, locale: string): string {
  const template = TEMPLATE_MAP[templateType as EmailTemplateType];
  if (!template) return key;

  const entry = template[key];
  if (!entry) return key;

  return entry[locale] ?? entry['en'] ?? key;
}

/**
 * Get all translated labels for a given email template type and locale.
 * Returns a flat Record<string, string> mapping each key to its translated value.
 */
export function getAllEmailLabels(templateType: string, locale: string): Record<string, string> {
  const template = TEMPLATE_MAP[templateType as EmailTemplateType];
  if (!template) return {};

  const result: Record<string, string> = {};
  for (const [key, translations] of Object.entries(template)) {
    result[key] = translations[locale] ?? translations['en'] ?? key;
  }
  return result;
}
