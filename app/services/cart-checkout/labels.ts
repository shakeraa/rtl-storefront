import type { CartLabels, CheckoutLabels, DynamicButtonTranslation, DynamicPaymentButton } from "./types";

/**
 * Default cart labels per locale.
 * Covers Arabic (ar), Hebrew (he), and English (en) as fallback.
 */
const CART_LABELS: Record<string, CartLabels> = {
  en: {
    subtotal: "Subtotal",
    total: "Total",
    checkout: "Checkout",
    shipping: "Shipping",
    discount: "Discount",
    tax: "Tax",
    note: "Order notes",
    emptyCart: "Your cart is empty",
    continueShopping: "Continue shopping",
    removeItem: "Remove",
    updateQuantity: "Update quantity",
    addToCart: "Add to cart",
    buyNow: "Buy now",
    shippingCalculator: "Estimate shipping",
    discountCode: "Discount code",
    applyDiscount: "Apply",
    giftCard: "Gift card",
    applyGiftCard: "Apply gift card",
    estimatedTotal: "Estimated total",
    freeShipping: "Free shipping",
  },
  ar: {
    subtotal: "المجموع الفرعي",
    total: "الإجمالي",
    checkout: "إتمام الشراء",
    shipping: "الشحن",
    discount: "الخصم",
    tax: "الضريبة",
    note: "ملاحظات الطلب",
    emptyCart: "سلة التسوق فارغة",
    continueShopping: "متابعة التسوق",
    removeItem: "إزالة",
    updateQuantity: "تحديث الكمية",
    addToCart: "أضف إلى السلة",
    buyNow: "اشترِ الآن",
    shippingCalculator: "حساب تكلفة الشحن",
    discountCode: "رمز الخصم",
    applyDiscount: "تطبيق",
    giftCard: "بطاقة هدية",
    applyGiftCard: "تطبيق بطاقة الهدية",
    estimatedTotal: "الإجمالي المقدر",
    freeShipping: "شحن مجاني",
  },
  he: {
    subtotal: "סכום ביניים",
    total: "סה״כ",
    checkout: "לתשלום",
    shipping: "משלוח",
    discount: "הנחה",
    tax: "מס",
    note: "הערות להזמנה",
    emptyCart: "העגלה שלך ריקה",
    continueShopping: "המשך בקניות",
    removeItem: "הסר",
    updateQuantity: "עדכן כמות",
    addToCart: "הוסף לעגלה",
    buyNow: "קנה עכשיו",
    shippingCalculator: "חישוב משלוח",
    discountCode: "קוד הנחה",
    applyDiscount: "החל",
    giftCard: "כרטיס מתנה",
    applyGiftCard: "החל כרטיס מתנה",
    estimatedTotal: "סה״כ משוער",
    freeShipping: "משלוח חינם",
  },
  fa: {
    subtotal: "جمع فرعی",
    total: "مجموع",
    checkout: "تسویه حساب",
    shipping: "ارسال",
    discount: "تخفیف",
    tax: "مالیات",
    note: "یادداشت سفارش",
    emptyCart: "سبد خرید شما خالی است",
    continueShopping: "ادامه خرید",
    removeItem: "حذف",
    updateQuantity: "بروزرسانی تعداد",
    addToCart: "افزودن به سبد",
    buyNow: "خرید فوری",
    shippingCalculator: "محاسبه هزینه ارسال",
    discountCode: "کد تخفیف",
    applyDiscount: "اعمال",
    giftCard: "کارت هدیه",
    applyGiftCard: "اعمال کارت هدیه",
    estimatedTotal: "مجموع تخمینی",
    freeShipping: "ارسال رایگان",
  },
};

const CHECKOUT_LABELS: Record<string, CheckoutLabels> = {
  en: {
    shippingAddress: "Shipping address",
    billingAddress: "Billing address",
    paymentMethod: "Payment method",
    shippingMethod: "Shipping method",
    orderSummary: "Order summary",
    placeOrder: "Place order",
    termsAndConditions: "Terms and conditions",
    returnPolicy: "Return policy",
    secureCheckout: "Secure checkout",
    expressCheckout: "Express checkout",
    orContinueWith: "Or continue with",
    contactInfo: "Contact information",
    email: "Email",
    phone: "Phone",
    firstName: "First name",
    lastName: "Last name",
    address: "Address",
    city: "City",
    country: "Country",
    postalCode: "Postal code",
    saveInfo: "Save this information",
  },
  ar: {
    shippingAddress: "عنوان الشحن",
    billingAddress: "عنوان الفاتورة",
    paymentMethod: "طريقة الدفع",
    shippingMethod: "طريقة الشحن",
    orderSummary: "ملخص الطلب",
    placeOrder: "تأكيد الطلب",
    termsAndConditions: "الشروط والأحكام",
    returnPolicy: "سياسة الإرجاع",
    secureCheckout: "دفع آمن",
    expressCheckout: "الدفع السريع",
    orContinueWith: "أو المتابعة بـ",
    contactInfo: "معلومات الاتصال",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    address: "العنوان",
    city: "المدينة",
    country: "الدولة",
    postalCode: "الرمز البريدي",
    saveInfo: "حفظ هذه المعلومات",
  },
  he: {
    shippingAddress: "כתובת למשלוח",
    billingAddress: "כתובת לחיוב",
    paymentMethod: "אמצעי תשלום",
    shippingMethod: "שיטת משלוח",
    orderSummary: "סיכום הזמנה",
    placeOrder: "ביצוע הזמנה",
    termsAndConditions: "תנאים והגבלות",
    returnPolicy: "מדיניות החזרות",
    secureCheckout: "תשלום מאובטח",
    expressCheckout: "תשלום מהיר",
    orContinueWith: "או המשך עם",
    contactInfo: "פרטי התקשרות",
    email: "אימייל",
    phone: "טלפון",
    firstName: "שם פרטי",
    lastName: "שם משפחה",
    address: "כתובת",
    city: "עיר",
    country: "מדינה",
    postalCode: "מיקוד",
    saveInfo: "שמור מידע זה",
  },
  fa: {
    shippingAddress: "آدرس ارسال",
    billingAddress: "آدرس صورتحساب",
    paymentMethod: "روش پرداخت",
    shippingMethod: "روش ارسال",
    orderSummary: "خلاصه سفارش",
    placeOrder: "ثبت سفارش",
    termsAndConditions: "شرایط و ضوابط",
    returnPolicy: "سیاست بازگشت",
    secureCheckout: "پرداخت امن",
    expressCheckout: "پرداخت سریع",
    orContinueWith: "یا ادامه با",
    contactInfo: "اطلاعات تماس",
    email: "ایمیل",
    phone: "تلفن",
    firstName: "نام",
    lastName: "نام خانوادگی",
    address: "آدرس",
    city: "شهر",
    country: "کشور",
    postalCode: "کد پستی",
    saveInfo: "ذخیره این اطلاعات",
  },
};

const DYNAMIC_BUTTON_LABELS: Record<string, Record<DynamicPaymentButton, DynamicButtonTranslation>> = {
  en: {
    apple_pay: { type: "apple_pay", label: "Apple Pay", ariaLabel: "Pay with Apple Pay" },
    google_pay: { type: "google_pay", label: "Google Pay", ariaLabel: "Pay with Google Pay" },
    paypal: { type: "paypal", label: "PayPal", ariaLabel: "Pay with PayPal" },
    shop_pay: { type: "shop_pay", label: "Shop Pay", ariaLabel: "Pay with Shop Pay" },
    tamara: { type: "tamara", label: "Tamara", ariaLabel: "Split in payments with Tamara" },
    tabby: { type: "tabby", label: "Tabby", ariaLabel: "Split in payments with Tabby" },
  },
  ar: {
    apple_pay: { type: "apple_pay", label: "Apple Pay", ariaLabel: "الدفع باستخدام Apple Pay" },
    google_pay: { type: "google_pay", label: "Google Pay", ariaLabel: "الدفع باستخدام Google Pay" },
    paypal: { type: "paypal", label: "PayPal", ariaLabel: "الدفع باستخدام PayPal" },
    shop_pay: { type: "shop_pay", label: "Shop Pay", ariaLabel: "الدفع باستخدام Shop Pay" },
    tamara: { type: "tamara", label: "تمارا", ariaLabel: "تقسيط المدفوعات مع تمارا" },
    tabby: { type: "tabby", label: "تابي", ariaLabel: "تقسيط المدفوعات مع تابي" },
  },
  he: {
    apple_pay: { type: "apple_pay", label: "Apple Pay", ariaLabel: "שלם עם Apple Pay" },
    google_pay: { type: "google_pay", label: "Google Pay", ariaLabel: "שלם עם Google Pay" },
    paypal: { type: "paypal", label: "PayPal", ariaLabel: "שלם עם PayPal" },
    shop_pay: { type: "shop_pay", label: "Shop Pay", ariaLabel: "שלם עם Shop Pay" },
    tamara: { type: "tamara", label: "Tamara", ariaLabel: "חלק תשלומים עם Tamara" },
    tabby: { type: "tabby", label: "Tabby", ariaLabel: "חלק תשלומים עם Tabby" },
  },
};

export function getCartLabels(locale: string): CartLabels {
  const base = locale.split("-")[0]?.toLowerCase() ?? "en";
  return CART_LABELS[base] ?? CART_LABELS["en"];
}

export function getCheckoutLabels(locale: string): CheckoutLabels {
  const base = locale.split("-")[0]?.toLowerCase() ?? "en";
  return CHECKOUT_LABELS[base] ?? CHECKOUT_LABELS["en"];
}

export function getDynamicButtonTranslation(
  locale: string,
  buttonType: DynamicPaymentButton,
): DynamicButtonTranslation {
  const base = locale.split("-")[0]?.toLowerCase() ?? "en";
  const localeButtons = DYNAMIC_BUTTON_LABELS[base] ?? DYNAMIC_BUTTON_LABELS["en"];
  return localeButtons[buttonType];
}

export function getAllDynamicButtonTranslations(
  locale: string,
): DynamicButtonTranslation[] {
  const base = locale.split("-")[0]?.toLowerCase() ?? "en";
  const localeButtons = DYNAMIC_BUTTON_LABELS[base] ?? DYNAMIC_BUTTON_LABELS["en"];
  return Object.values(localeButtons);
}
