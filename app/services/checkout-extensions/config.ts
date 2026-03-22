import { getBaseLocale, getTextDirection } from "../../utils/rtl";
import type {
  CheckoutBranding,
  CheckoutExtensionConfig,
  CheckoutTranslation,
} from "./types";

/**
 * Default available locales for RTL storefront checkout.
 */
const DEFAULT_LOCALES: CheckoutExtensionConfig["availableLocales"] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "he", name: "Hebrew", nativeName: "עברית" },
  { code: "fa", name: "Persian", nativeName: "فارسی" },
];

/**
 * Default available currencies for MENA-focused checkout.
 */
const DEFAULT_CURRENCIES: CheckoutExtensionConfig["availableCurrencies"] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "SAR", symbol: "ر.س", name: "Saudi Riyal" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar" },
  { code: "BHD", symbol: "د.ب", name: "Bahraini Dinar" },
  { code: "QAR", symbol: "ر.ق", name: "Qatari Riyal" },
  { code: "EGP", symbol: "ج.م", name: "Egyptian Pound" },
  { code: "ILS", symbol: "₪", name: "Israeli Shekel" },
];

/**
 * Default MENA payment methods available at checkout.
 */
const DEFAULT_MENA_PAYMENT_METHODS: CheckoutExtensionConfig["menaPaymentMethods"] = [
  { id: "tamara", name: "Tamara", icon: "tamara-logo", enabled: true },
  { id: "tabby", name: "Tabby", icon: "tabby-logo", enabled: true },
  { id: "mada", name: "mada", icon: "mada-logo", enabled: true },
  { id: "stc_pay", name: "STC Pay", icon: "stc-pay-logo", enabled: true },
  { id: "telr", name: "Telr", icon: "telr-logo", enabled: false },
];

/**
 * RTL-aware font families per locale.
 */
const FONT_FAMILIES: Record<string, string> = {
  ar: "'Noto Sans Arabic', 'Tahoma', sans-serif",
  he: "'Noto Sans Hebrew', 'Arial', sans-serif",
  fa: "'Noto Sans Arabic', 'Tahoma', sans-serif",
  en: "'Inter', 'Helvetica Neue', sans-serif",
};

/**
 * Checkout-specific translation labels per locale.
 */
const CHECKOUT_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    orderSummary: "Order summary",
    subtotal: "Subtotal",
    shipping: "Shipping",
    tax: "Tax",
    total: "Total",
    payNow: "Pay now",
    paymentMethod: "Payment method",
    shippingMethod: "Shipping method",
    shippingAddress: "Shipping address",
    billingAddress: "Billing address",
    contactInfo: "Contact information",
    email: "Email",
    phone: "Phone",
    firstName: "First name",
    lastName: "Last name",
    address: "Address",
    city: "City",
    country: "Country",
    postalCode: "Postal code",
    discountCode: "Discount code",
    apply: "Apply",
    secureCheckout: "Secure checkout",
    returnToCart: "Return to cart",
    continueShopping: "Continue shopping",
    estimatedDelivery: "Estimated delivery",
    freeShipping: "Free shipping",
    installments: "Pay in installments",
  },
  ar: {
    orderSummary: "ملخص الطلب",
    subtotal: "المجموع الفرعي",
    shipping: "الشحن",
    tax: "الضريبة",
    total: "الإجمالي",
    payNow: "ادفع الآن",
    paymentMethod: "طريقة الدفع",
    shippingMethod: "طريقة الشحن",
    shippingAddress: "عنوان الشحن",
    billingAddress: "عنوان الفاتورة",
    contactInfo: "معلومات الاتصال",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    address: "العنوان",
    city: "المدينة",
    country: "الدولة",
    postalCode: "الرمز البريدي",
    discountCode: "رمز الخصم",
    apply: "تطبيق",
    secureCheckout: "دفع آمن",
    returnToCart: "العودة إلى السلة",
    continueShopping: "متابعة التسوق",
    estimatedDelivery: "التسليم المتوقع",
    freeShipping: "شحن مجاني",
    installments: "الدفع بالتقسيط",
  },
  he: {
    orderSummary: "סיכום הזמנה",
    subtotal: "סכום ביניים",
    shipping: "משלוח",
    tax: "מס",
    total: "סה״כ",
    payNow: "שלם עכשיו",
    paymentMethod: "אמצעי תשלום",
    shippingMethod: "שיטת משלוח",
    shippingAddress: "כתובת למשלוח",
    billingAddress: "כתובת לחיוב",
    contactInfo: "פרטי התקשרות",
    email: "אימייל",
    phone: "טלפון",
    firstName: "שם פרטי",
    lastName: "שם משפחה",
    address: "כתובת",
    city: "עיר",
    country: "מדינה",
    postalCode: "מיקוד",
    discountCode: "קוד הנחה",
    apply: "החל",
    secureCheckout: "תשלום מאובטח",
    returnToCart: "חזרה לעגלה",
    continueShopping: "המשך בקניות",
    estimatedDelivery: "זמן משלוח משוער",
    freeShipping: "משלוח חינם",
    installments: "תשלומים",
  },
  fa: {
    orderSummary: "خلاصه سفارش",
    subtotal: "جمع فرعی",
    shipping: "ارسال",
    tax: "مالیات",
    total: "مجموع",
    payNow: "پرداخت",
    paymentMethod: "روش پرداخت",
    shippingMethod: "روش ارسال",
    shippingAddress: "آدرس ارسال",
    billingAddress: "آدرس صورتحساب",
    contactInfo: "اطلاعات تماس",
    email: "ایمیل",
    phone: "تلفن",
    firstName: "نام",
    lastName: "نام خانوادگی",
    address: "آدرس",
    city: "شهر",
    country: "کشور",
    postalCode: "کد پستی",
    discountCode: "کد تخفیف",
    apply: "اعمال",
    secureCheckout: "پرداخت امن",
    returnToCart: "بازگشت به سبد",
    continueShopping: "ادامه خرید",
    estimatedDelivery: "زمان تخمینی تحویل",
    freeShipping: "ارسال رایگان",
    installments: "پرداخت اقساطی",
  },
};

/**
 * Build checkout extension configuration with sensible defaults.
 */
export function buildCheckoutConfig(
  shop: string,
  locale: string,
): CheckoutExtensionConfig {
  const base = getBaseLocale(locale);
  const direction = getTextDirection(locale);

  return {
    shop,
    locale: base,
    direction,
    enableLanguageSwitcher: true,
    enableCurrencySwitcher: true,
    enableMenaPayments: direction === "rtl",
    availableLocales: DEFAULT_LOCALES,
    availableCurrencies: DEFAULT_CURRENCIES,
    menaPaymentMethods: DEFAULT_MENA_PAYMENT_METHODS.map((method) => ({
      ...method,
      enabled: direction === "rtl" ? method.enabled : false,
    })),
  };
}

/**
 * Build checkout branding with RTL-aware defaults.
 */
export function buildCheckoutBranding(locale: string): CheckoutBranding {
  const base = getBaseLocale(locale);
  const direction = getTextDirection(locale);

  return {
    primaryColor: "#1A1A2E",
    backgroundColor: "#FFFFFF",
    textColor: "#333333",
    fontFamily: FONT_FAMILIES[base] ?? FONT_FAMILIES["en"],
    borderRadius: "8px",
    direction,
  };
}

/**
 * Get checkout-specific translations for the given locale.
 */
export function getCheckoutTranslations(locale: string): CheckoutTranslation {
  const base = getBaseLocale(locale);
  const labels = CHECKOUT_TRANSLATIONS[base] ?? CHECKOUT_TRANSLATIONS["en"];

  return {
    locale: base,
    labels,
  };
}
