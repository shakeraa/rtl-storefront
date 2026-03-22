/**
 * Commerce Element Translation Labels
 * Tasks: T0121 - T0138
 *
 * Provides translated labels for cart, checkout, gift cards, discounts,
 * customer account, and search elements across 4 locales:
 * English (en), Arabic (ar), Hebrew (he), Farsi/Persian (fa)
 */

// ---------------------------------------------------------------------------
// T0121 - Cart line item properties (11 labels × 4 locales)
// ---------------------------------------------------------------------------
export const LINE_ITEM_LABELS: Record<string, Record<string, string>> = {
  size: {
    en: 'Size',
    ar: 'المقاس',
    he: 'מידה',
    fa: 'اندازه',
  },
  color: {
    en: 'Color',
    ar: 'اللون',
    he: 'צבע',
    fa: 'رنگ',
  },
  material: {
    en: 'Material',
    ar: 'الخامة',
    he: 'חומר',
    fa: 'جنس',
  },
  quantity: {
    en: 'Quantity',
    ar: 'الكمية',
    he: 'כמות',
    fa: 'تعداد',
  },
  price: {
    en: 'Price',
    ar: 'السعر',
    he: 'מחיר',
    fa: 'قیمت',
  },
  total: {
    en: 'Total',
    ar: 'المجموع',
    he: 'סה״כ',
    fa: 'مجموع',
  },
  remove: {
    en: 'Remove',
    ar: 'إزالة',
    he: 'הסר',
    fa: 'حذف',
  },
  update: {
    en: 'Update',
    ar: 'تحديث',
    he: 'עדכן',
    fa: 'به‌روزرسانی',
  },
  gift_wrap: {
    en: 'Gift Wrap',
    ar: 'تغليف هدية',
    he: 'עטיפת מתנה',
    fa: 'کادوپیچی',
  },
  engraving: {
    en: 'Engraving',
    ar: 'نقش',
    he: 'חריטה',
    fa: 'حکاکی',
  },
  personalization: {
    en: 'Personalization',
    ar: 'تخصيص',
    he: 'התאמה אישית',
    fa: 'شخصی‌سازی',
  },
};

// ---------------------------------------------------------------------------
// T0122 - Cart gift message (7 labels × 4 locales)
// ---------------------------------------------------------------------------
export const GIFT_MESSAGE_LABELS: Record<string, Record<string, string>> = {
  add_gift_message: {
    en: 'Add a Gift Message',
    ar: 'أضف رسالة هدية',
    he: 'הוסף הודעת מתנה',
    fa: 'افزودن پیام هدیه',
  },
  to: {
    en: 'To',
    ar: 'إلى',
    he: 'אל',
    fa: 'به',
  },
  from: {
    en: 'From',
    ar: 'من',
    he: 'מאת',
    fa: 'از',
  },
  message: {
    en: 'Message',
    ar: 'الرسالة',
    he: 'הודעה',
    fa: 'پیام',
  },
  gift_wrap: {
    en: 'Gift Wrap',
    ar: 'تغليف هدية',
    he: 'עטיפת מתנה',
    fa: 'کادوپیچی',
  },
  gift_receipt: {
    en: 'Gift Receipt',
    ar: 'إيصال هدية',
    he: 'קבלת מתנה',
    fa: 'رسید هدیه',
  },
  remove_gift: {
    en: 'Remove Gift Options',
    ar: 'إزالة خيارات الهدية',
    he: 'הסר אפשרויות מתנה',
    fa: 'حذف گزینه‌های هدیه',
  },
};

// ---------------------------------------------------------------------------
// T0123 - Cart special instructions (5 labels × 4 locales)
// ---------------------------------------------------------------------------
export const SPECIAL_INSTRUCTIONS_LABELS: Record<string, Record<string, string>> = {
  special_instructions: {
    en: 'Special Instructions',
    ar: 'تعليمات خاصة',
    he: 'הוראות מיוחדות',
    fa: 'دستورالعمل‌های ویژه',
  },
  delivery_notes: {
    en: 'Delivery Notes',
    ar: 'ملاحظات التوصيل',
    he: 'הערות למשלוח',
    fa: 'یادداشت‌های تحویل',
  },
  packaging_preference: {
    en: 'Packaging Preference',
    ar: 'تفضيل التغليف',
    he: 'העדפת אריזה',
    fa: 'ترجیح بسته‌بندی',
  },
  allergies: {
    en: 'Allergies & Dietary Restrictions',
    ar: 'الحساسية والقيود الغذائية',
    he: 'אלרגיות והגבלות תזונתיות',
    fa: 'آلرژی‌ها و محدودیت‌های غذایی',
  },
  placeholder: {
    en: 'Add any special requests here...',
    ar: 'أضف أي طلبات خاصة هنا...',
    he: '...הוסף בקשות מיוחדות כאן',
    fa: '...درخواست‌های ویژه خود را اینجا بنویسید',
  },
};

// ---------------------------------------------------------------------------
// T0124 - Checkout shipping method names (8 labels × 4 locales)
// ---------------------------------------------------------------------------
export const SHIPPING_METHOD_LABELS: Record<string, Record<string, string>> = {
  standard: {
    en: 'Standard Shipping',
    ar: 'الشحن العادي',
    he: 'משלוח רגיל',
    fa: 'ارسال عادی',
  },
  express: {
    en: 'Express Shipping',
    ar: 'الشحن السريع',
    he: 'משלוח מהיר',
    fa: 'ارسال سریع',
  },
  overnight: {
    en: 'Overnight Shipping',
    ar: 'شحن خلال ليلة واحدة',
    he: 'משלוח תוך לילה',
    fa: 'ارسال یک‌شبه',
  },
  same_day: {
    en: 'Same Day Delivery',
    ar: 'التوصيل في نفس اليوم',
    he: 'משלוח באותו יום',
    fa: 'تحویل در همان روز',
  },
  pickup: {
    en: 'Store Pickup',
    ar: 'الاستلام من المتجر',
    he: 'איסוף מהחנות',
    fa: 'تحویل حضوری از فروشگاه',
  },
  free_shipping: {
    en: 'Free Shipping',
    ar: 'شحن مجاني',
    he: 'משלוח חינם',
    fa: 'ارسال رایگان',
  },
  international: {
    en: 'International Shipping',
    ar: 'الشحن الدولي',
    he: 'משלוח בינלאומי',
    fa: 'ارسال بین‌المللی',
  },
  economy: {
    en: 'Economy Shipping',
    ar: 'الشحن الاقتصادي',
    he: 'משלוח חסכוני',
    fa: 'ارسال اقتصادی',
  },
};

// ---------------------------------------------------------------------------
// T0125 - Checkout payment method labels (12 labels × 4 locales)
// ---------------------------------------------------------------------------
export const PAYMENT_METHOD_LABELS: Record<string, Record<string, string>> = {
  credit_card: {
    en: 'Credit Card',
    ar: 'بطاقة ائتمان',
    he: 'כרטיס אשראי',
    fa: 'کارت اعتباری',
  },
  debit_card: {
    en: 'Debit Card',
    ar: 'بطاقة خصم',
    he: 'כרטיס חיוב',
    fa: 'کارت نقدی',
  },
  paypal: {
    en: 'PayPal',
    ar: 'باي بال',
    he: 'PayPal',
    fa: 'پی‌پال',
  },
  apple_pay: {
    en: 'Apple Pay',
    ar: 'أبل باي',
    he: 'Apple Pay',
    fa: 'اپل پی',
  },
  google_pay: {
    en: 'Google Pay',
    ar: 'جوجل باي',
    he: 'Google Pay',
    fa: 'گوگل پی',
  },
  shop_pay: {
    en: 'Shop Pay',
    ar: 'شوب باي',
    he: 'Shop Pay',
    fa: 'شاپ پی',
  },
  bank_transfer: {
    en: 'Bank Transfer',
    ar: 'تحويل بنكي',
    he: 'העברה בנקאית',
    fa: 'انتقال بانکی',
  },
  cash_on_delivery: {
    en: 'Cash on Delivery',
    ar: 'الدفع عند الاستلام',
    he: 'תשלום במסירה',
    fa: 'پرداخت در محل',
  },
  tamara: {
    en: 'Tamara - Buy Now Pay Later',
    ar: 'تمارا - اشترِ الآن وادفع لاحقاً',
    he: 'Tamara - קנה עכשיו שלם אחר כך',
    fa: 'تمارا - الان بخر بعداً پرداخت کن',
  },
  tabby: {
    en: 'Tabby - Pay in Installments',
    ar: 'تابي - ادفع على أقساط',
    he: 'Tabby - שלם בתשלומים',
    fa: 'تبی - پرداخت اقساطی',
  },
  mada: {
    en: 'mada',
    ar: 'مدى',
    he: 'mada',
    fa: 'مدی',
  },
  stc_pay: {
    en: 'STC Pay',
    ar: 'إس تي سي باي',
    he: 'STC Pay',
    fa: 'اس‌تی‌سی پی',
  },
};

// ---------------------------------------------------------------------------
// T0126 - Checkout billing address labels (11 labels × 4 locales)
// ---------------------------------------------------------------------------
export const BILLING_LABELS: Record<string, Record<string, string>> = {
  same_as_shipping: {
    en: 'Same as shipping address',
    ar: 'نفس عنوان الشحن',
    he: 'זהה לכתובת המשלוח',
    fa: 'همان آدرس ارسال',
  },
  first_name: {
    en: 'First Name',
    ar: 'الاسم الأول',
    he: 'שם פרטי',
    fa: 'نام',
  },
  last_name: {
    en: 'Last Name',
    ar: 'اسم العائلة',
    he: 'שם משפחה',
    fa: 'نام خانوادگی',
  },
  company: {
    en: 'Company',
    ar: 'الشركة',
    he: 'חברה',
    fa: 'شرکت',
  },
  address1: {
    en: 'Address',
    ar: 'العنوان',
    he: 'כתובת',
    fa: 'آدرس',
  },
  address2: {
    en: 'Apartment, suite, etc.',
    ar: 'الشقة، الجناح، إلخ.',
    he: 'דירה, קומה וכו׳',
    fa: 'آپارتمان، واحد و غیره',
  },
  city: {
    en: 'City',
    ar: 'المدينة',
    he: 'עיר',
    fa: 'شهر',
  },
  country: {
    en: 'Country/Region',
    ar: 'الدولة/المنطقة',
    he: 'מדינה/אזור',
    fa: 'کشور/منطقه',
  },
  province: {
    en: 'State/Province',
    ar: 'الولاية/المحافظة',
    he: 'מחוז/מדינה',
    fa: 'استان',
  },
  postal_code: {
    en: 'Postal Code',
    ar: 'الرمز البريدي',
    he: 'מיקוד',
    fa: 'کد پستی',
  },
  phone: {
    en: 'Phone',
    ar: 'الهاتف',
    he: 'טלפון',
    fa: 'تلفن',
  },
};

// ---------------------------------------------------------------------------
// T0127 - Checkout terms and conditions (6 labels × 4 locales)
// ---------------------------------------------------------------------------
export const TERMS_LABELS: Record<string, Record<string, string>> = {
  i_agree: {
    en: 'I agree to the',
    ar: 'أوافق على',
    he: 'אני מסכים/ה ל',
    fa: 'من موافقم با',
  },
  terms_and_conditions: {
    en: 'Terms and Conditions',
    ar: 'الشروط والأحكام',
    he: 'תנאים והגבלות',
    fa: 'شرایط و ضوابط',
  },
  privacy_policy: {
    en: 'Privacy Policy',
    ar: 'سياسة الخصوصية',
    he: 'מדיניות פרטיות',
    fa: 'سیاست حفظ حریم خصوصی',
  },
  refund_policy: {
    en: 'Refund Policy',
    ar: 'سياسة الاسترجاع',
    he: 'מדיניות החזרים',
    fa: 'سیاست بازپرداخت',
  },
  shipping_policy: {
    en: 'Shipping Policy',
    ar: 'سياسة الشحن',
    he: 'מדיניות משלוחים',
    fa: 'سیاست ارسال',
  },
  read_more: {
    en: 'Read More',
    ar: 'اقرأ المزيد',
    he: 'קרא עוד',
    fa: 'ادامه مطلب',
  },
};

// ---------------------------------------------------------------------------
// T0128 - Gift card title (4 labels × 4 locales)
// ---------------------------------------------------------------------------
export const GIFT_CARD_TITLE_LABELS: Record<string, Record<string, string>> = {
  gift_card: {
    en: 'Gift Card',
    ar: 'بطاقة هدية',
    he: 'כרטיס מתנה',
    fa: 'کارت هدیه',
  },
  digital_gift_card: {
    en: 'Digital Gift Card',
    ar: 'بطاقة هدية رقمية',
    he: 'כרטיס מתנה דיגיטלי',
    fa: 'کارت هدیه دیجیتال',
  },
  gift_card_for: {
    en: 'Gift Card for',
    ar: 'بطاقة هدية لـ',
    he: 'כרטיס מתנה עבור',
    fa: 'کارت هدیه برای',
  },
  redeem_gift_card: {
    en: 'Redeem Gift Card',
    ar: 'استخدام بطاقة الهدية',
    he: 'מימוש כרטיס מתנה',
    fa: 'استفاده از کارت هدیه',
  },
};

// ---------------------------------------------------------------------------
// T0129 - Gift card description (5 labels × 4 locales)
// ---------------------------------------------------------------------------
export const GIFT_CARD_DESC_LABELS: Record<string, Record<string, string>> = {
  perfect_gift: {
    en: 'The Perfect Gift',
    ar: 'الهدية المثالية',
    he: 'המתנה המושלמת',
    fa: 'هدیه‌ای عالی',
  },
  choose_amount: {
    en: 'Choose an Amount',
    ar: 'اختر المبلغ',
    he: 'בחר סכום',
    fa: 'مبلغ را انتخاب کنید',
  },
  personalize: {
    en: 'Personalize Your Card',
    ar: 'خصّص بطاقتك',
    he: 'התאם אישית את הכרטיס',
    fa: 'کارت خود را شخصی‌سازی کنید',
  },
  instant_delivery: {
    en: 'Instant Email Delivery',
    ar: 'تسليم فوري عبر البريد الإلكتروني',
    he: 'משלוח מיידי במייל',
    fa: 'تحویل فوری از طریق ایمیل',
  },
  no_expiry: {
    en: 'No Expiry Date',
    ar: 'بدون تاريخ انتهاء',
    he: 'ללא תאריך תפוגה',
    fa: 'بدون تاریخ انقضا',
  },
};

// ---------------------------------------------------------------------------
// T0130 - Gift card email template (8 labels × 4 locales)
// ---------------------------------------------------------------------------
export const GIFT_CARD_EMAIL_LABELS: Record<string, Record<string, string>> = {
  subject: {
    en: 'You Received a Gift Card!',
    ar: 'لقد تلقيت بطاقة هدية!',
    he: '!קיבלת כרטיס מתנה',
    fa: '!شما یک کارت هدیه دریافت کردید',
  },
  you_received: {
    en: 'You received a gift card',
    ar: 'لقد تلقيت بطاقة هدية',
    he: 'קיבלת כרטיס מתנה',
    fa: 'شما یک کارت هدیه دریافت کردید',
  },
  from_sender: {
    en: 'From',
    ar: 'من',
    he: 'מאת',
    fa: 'از طرف',
  },
  message: {
    en: 'Message',
    ar: 'الرسالة',
    he: 'הודעה',
    fa: 'پیام',
  },
  redeem_now: {
    en: 'Redeem Now',
    ar: 'استخدم الآن',
    he: 'ממש עכשיו',
    fa: 'همین حالا استفاده کنید',
  },
  gift_code: {
    en: 'Gift Code',
    ar: 'رمز الهدية',
    he: 'קוד מתנה',
    fa: 'کد هدیه',
  },
  balance: {
    en: 'Balance',
    ar: 'الرصيد',
    he: 'יתרה',
    fa: 'موجودی',
  },
  expires: {
    en: 'Expires',
    ar: 'تنتهي الصلاحية',
    he: 'תוקף',
    fa: 'تاریخ انقضا',
  },
};

// ---------------------------------------------------------------------------
// T0131 - Discount code label (7 labels × 4 locales)
// ---------------------------------------------------------------------------
export const DISCOUNT_CODE_LABELS: Record<string, Record<string, string>> = {
  discount_code: {
    en: 'Discount Code',
    ar: 'رمز الخصم',
    he: 'קוד הנחה',
    fa: 'کد تخفیف',
  },
  enter_code: {
    en: 'Enter discount code',
    ar: 'أدخل رمز الخصم',
    he: 'הזן קוד הנחה',
    fa: 'کد تخفیف را وارد کنید',
  },
  apply: {
    en: 'Apply',
    ar: 'تطبيق',
    he: 'החל',
    fa: 'اعمال',
  },
  remove: {
    en: 'Remove',
    ar: 'إزالة',
    he: 'הסר',
    fa: 'حذف',
  },
  invalid_code: {
    en: 'Invalid discount code',
    ar: 'رمز خصم غير صالح',
    he: 'קוד הנחה לא תקין',
    fa: 'کد تخفیف نامعتبر',
  },
  expired_code: {
    en: 'This discount code has expired',
    ar: 'انتهت صلاحية رمز الخصم هذا',
    he: 'קוד הנחה זה פג תוקף',
    fa: 'این کد تخفیف منقضی شده است',
  },
  minimum_not_met: {
    en: 'Minimum purchase amount not met',
    ar: 'لم يتم تحقيق الحد الأدنى للشراء',
    he: 'לא הגעת לסכום הרכישה המינימלי',
    fa: 'حداقل مبلغ خرید برآورده نشده است',
  },
};

// ---------------------------------------------------------------------------
// T0132 - Discount description (6 labels × 4 locales)
// ---------------------------------------------------------------------------
export const DISCOUNT_DESC_LABELS: Record<string, Record<string, string>> = {
  percent_off: {
    en: '% Off',
    ar: '% خصم',
    he: '% הנחה',
    fa: '% تخفیف',
  },
  amount_off: {
    en: 'Off',
    ar: 'خصم',
    he: 'הנחה',
    fa: 'تخفیف',
  },
  free_shipping: {
    en: 'Free Shipping',
    ar: 'شحن مجاني',
    he: 'משלוח חינם',
    fa: 'ارسال رایگان',
  },
  buy_x_get_y: {
    en: 'Buy X Get Y',
    ar: 'اشترِ X واحصل على Y',
    he: 'קנה X קבל Y',
    fa: 'X بخر Y بگیر',
  },
  automatic: {
    en: 'Automatic Discount',
    ar: 'خصم تلقائي',
    he: 'הנחה אוטומטית',
    fa: 'تخفیف خودکار',
  },
  limited_time: {
    en: 'Limited Time',
    ar: 'لفترة محدودة',
    he: 'לזמן מוגבל',
    fa: 'زمان محدود',
  },
};

// ---------------------------------------------------------------------------
// T0133 - Customer address label (15 labels × 4 locales)
// ---------------------------------------------------------------------------
export const ADDRESS_LABELS: Record<string, Record<string, string>> = {
  default_address: {
    en: 'Default Address',
    ar: 'العنوان الافتراضي',
    he: 'כתובת ברירת מחדל',
    fa: 'آدرس پیش‌فرض',
  },
  add_new: {
    en: 'Add New Address',
    ar: 'إضافة عنوان جديد',
    he: 'הוסף כתובת חדשה',
    fa: 'افزودن آدرس جدید',
  },
  edit: {
    en: 'Edit',
    ar: 'تعديل',
    he: 'ערוך',
    fa: 'ویرایش',
  },
  delete: {
    en: 'Delete',
    ar: 'حذف',
    he: 'מחק',
    fa: 'حذف',
  },
  set_default: {
    en: 'Set as Default',
    ar: 'تعيين كعنوان افتراضي',
    he: 'הגדר כברירת מחדל',
    fa: 'تنظیم به عنوان پیش‌فرض',
  },
  first_name: {
    en: 'First Name',
    ar: 'الاسم الأول',
    he: 'שם פרטי',
    fa: 'نام',
  },
  last_name: {
    en: 'Last Name',
    ar: 'اسم العائلة',
    he: 'שם משפחה',
    fa: 'نام خانوادگی',
  },
  company: {
    en: 'Company',
    ar: 'الشركة',
    he: 'חברה',
    fa: 'شرکت',
  },
  address1: {
    en: 'Address',
    ar: 'العنوان',
    he: 'כתובת',
    fa: 'آدرس',
  },
  address2: {
    en: 'Apartment, suite, etc.',
    ar: 'الشقة، الجناح، إلخ.',
    he: 'דירה, קומה וכו׳',
    fa: 'آپارتمان، واحد و غیره',
  },
  city: {
    en: 'City',
    ar: 'المدينة',
    he: 'עיר',
    fa: 'شهر',
  },
  country: {
    en: 'Country/Region',
    ar: 'الدولة/المنطقة',
    he: 'מדינה/אזור',
    fa: 'کشور/منطقه',
  },
  province: {
    en: 'State/Province',
    ar: 'الولاية/المحافظة',
    he: 'מחוז/מדינה',
    fa: 'استان',
  },
  postal_code: {
    en: 'Postal Code',
    ar: 'الرمز البريدي',
    he: 'מיקוד',
    fa: 'کد پستی',
  },
  phone: {
    en: 'Phone',
    ar: 'الهاتف',
    he: 'טלפון',
    fa: 'تلفن',
  },
};

// ---------------------------------------------------------------------------
// T0134 - Customer order status (10 labels × 4 locales)
// ---------------------------------------------------------------------------
export const ORDER_STATUS_LABELS: Record<string, Record<string, string>> = {
  pending: {
    en: 'Pending',
    ar: 'قيد الانتظار',
    he: 'ממתין',
    fa: 'در انتظار',
  },
  confirmed: {
    en: 'Confirmed',
    ar: 'مؤكد',
    he: 'אושר',
    fa: 'تأیید شده',
  },
  processing: {
    en: 'Processing',
    ar: 'قيد المعالجة',
    he: 'בעיבוד',
    fa: 'در حال پردازش',
  },
  shipped: {
    en: 'Shipped',
    ar: 'تم الشحن',
    he: 'נשלח',
    fa: 'ارسال شده',
  },
  out_for_delivery: {
    en: 'Out for Delivery',
    ar: 'في الطريق للتوصيل',
    he: 'יצא למשלוח',
    fa: 'در مسیر تحویل',
  },
  delivered: {
    en: 'Delivered',
    ar: 'تم التوصيل',
    he: 'נמסר',
    fa: 'تحویل داده شده',
  },
  cancelled: {
    en: 'Cancelled',
    ar: 'ملغي',
    he: 'בוטל',
    fa: 'لغو شده',
  },
  refunded: {
    en: 'Refunded',
    ar: 'تم الاسترداد',
    he: 'הוחזר כספית',
    fa: 'بازپرداخت شده',
  },
  returned: {
    en: 'Returned',
    ar: 'تم الإرجاع',
    he: 'הוחזר',
    fa: 'مرجوع شده',
  },
  partially_fulfilled: {
    en: 'Partially Fulfilled',
    ar: 'تم التنفيذ جزئياً',
    he: 'מולא חלקית',
    fa: 'تکمیل شده به صورت جزئی',
  },
};

// ---------------------------------------------------------------------------
// T0135 - Customer account tab labels (8 labels × 4 locales)
// ---------------------------------------------------------------------------
export const ACCOUNT_TAB_LABELS: Record<string, Record<string, string>> = {
  orders: {
    en: 'Orders',
    ar: 'الطلبات',
    he: 'הזמנות',
    fa: 'سفارشات',
  },
  addresses: {
    en: 'Addresses',
    ar: 'العناوين',
    he: 'כתובות',
    fa: 'آدرس‌ها',
  },
  profile: {
    en: 'Profile',
    ar: 'الملف الشخصي',
    he: 'פרופיל',
    fa: 'پروفایل',
  },
  wishlist: {
    en: 'Wishlist',
    ar: 'قائمة الأمنيات',
    he: 'רשימת משאלות',
    fa: 'لیست علاقه‌مندی‌ها',
  },
  recently_viewed: {
    en: 'Recently Viewed',
    ar: 'شوهد مؤخراً',
    he: 'נצפה לאחרונה',
    fa: 'بازدیدهای اخیر',
  },
  loyalty_points: {
    en: 'Loyalty Points',
    ar: 'نقاط الولاء',
    he: 'נקודות נאמנות',
    fa: 'امتیازات وفاداری',
  },
  gift_cards: {
    en: 'Gift Cards',
    ar: 'بطاقات الهدايا',
    he: 'כרטיסי מתנה',
    fa: 'کارت‌های هدیه',
  },
  subscriptions: {
    en: 'Subscriptions',
    ar: 'الاشتراكات',
    he: 'מנויים',
    fa: 'اشتراک‌ها',
  },
};

// ---------------------------------------------------------------------------
// T0136 - Search placeholder (4 labels × 4 locales)
// ---------------------------------------------------------------------------
export const SEARCH_PLACEHOLDER_LABELS: Record<string, Record<string, string>> = {
  search_store: {
    en: 'Search our store',
    ar: 'ابحث في متجرنا',
    he: 'חפש בחנות שלנו',
    fa: 'جستجو در فروشگاه ما',
  },
  search_products: {
    en: 'Search products',
    ar: 'البحث عن منتجات',
    he: 'חפש מוצרים',
    fa: 'جستجوی محصولات',
  },
  type_to_search: {
    en: 'Type to search...',
    ar: 'اكتب للبحث...',
    he: '...הקלד לחיפוש',
    fa: '...برای جستجو تایپ کنید',
  },
  what_are_you_looking_for: {
    en: 'What are you looking for?',
    ar: 'عن ماذا تبحث؟',
    he: 'מה אתה מחפש?',
    fa: 'به دنبال چه می‌گردید؟',
  },
};

// ---------------------------------------------------------------------------
// T0137 - Search results label (6 labels × 4 locales)
// ---------------------------------------------------------------------------
export const SEARCH_RESULTS_LABELS: Record<string, Record<string, string>> = {
  results_for: {
    en: 'Results for',
    ar: 'نتائج البحث عن',
    he: 'תוצאות עבור',
    fa: 'نتایج برای',
  },
  no_results: {
    en: 'No results found',
    ar: 'لم يتم العثور على نتائج',
    he: 'לא נמצאו תוצאות',
    fa: 'نتیجه‌ای یافت نشد',
  },
  showing_x_of_y: {
    en: 'Showing {x} of {y} results',
    ar: 'عرض {x} من {y} نتيجة',
    he: 'מציג {x} מתוך {y} תוצאות',
    fa: 'نمایش {x} از {y} نتیجه',
  },
  did_you_mean: {
    en: 'Did you mean',
    ar: 'هل تقصد',
    he: 'האם התכוונת ל',
    fa: 'آیا منظور شما',
  },
  popular_searches: {
    en: 'Popular Searches',
    ar: 'عمليات بحث شائعة',
    he: 'חיפושים פופולריים',
    fa: 'جستجوهای محبوب',
  },
  try_again: {
    en: 'Try searching with different keywords',
    ar: 'حاول البحث بكلمات مختلفة',
    he: 'נסה לחפש עם מילות מפתח אחרות',
    fa: 'با کلمات کلیدی دیگر جستجو کنید',
  },
};

// ---------------------------------------------------------------------------
// T0138 - Search filter label (13 labels × 4 locales)
// ---------------------------------------------------------------------------
export const FILTER_LABELS: Record<string, Record<string, string>> = {
  filter_by: {
    en: 'Filter By',
    ar: 'تصفية حسب',
    he: 'סנן לפי',
    fa: 'فیلتر بر اساس',
  },
  sort_by: {
    en: 'Sort By',
    ar: 'ترتيب حسب',
    he: 'מיין לפי',
    fa: 'مرتب‌سازی بر اساس',
  },
  price_range: {
    en: 'Price Range',
    ar: 'نطاق السعر',
    he: 'טווח מחירים',
    fa: 'محدوده قیمت',
  },
  availability: {
    en: 'Availability',
    ar: 'التوفر',
    he: 'זמינות',
    fa: 'موجودی',
  },
  in_stock: {
    en: 'In Stock',
    ar: 'متوفر',
    he: 'במלאי',
    fa: 'موجود',
  },
  out_of_stock: {
    en: 'Out of Stock',
    ar: 'غير متوفر',
    he: 'אזל מהמלאי',
    fa: 'ناموجود',
  },
  color: {
    en: 'Color',
    ar: 'اللون',
    he: 'צבע',
    fa: 'رنگ',
  },
  size: {
    en: 'Size',
    ar: 'المقاس',
    he: 'מידה',
    fa: 'اندازه',
  },
  brand: {
    en: 'Brand',
    ar: 'العلامة التجارية',
    he: 'מותג',
    fa: 'برند',
  },
  material: {
    en: 'Material',
    ar: 'الخامة',
    he: 'חומר',
    fa: 'جنس',
  },
  clear_all: {
    en: 'Clear All',
    ar: 'مسح الكل',
    he: 'נקה הכל',
    fa: 'پاک کردن همه',
  },
  apply_filters: {
    en: 'Apply Filters',
    ar: 'تطبيق الفلاتر',
    he: 'החל מסננים',
    fa: 'اعمال فیلترها',
  },
  show_results: {
    en: 'Show Results',
    ar: 'عرض النتائج',
    he: 'הצג תוצאות',
    fa: 'نمایش نتایج',
  },
};

// ---------------------------------------------------------------------------
// Internal mapping of all commerce label categories
// ---------------------------------------------------------------------------
const CATEGORY_MAP: Record<string, Record<string, Record<string, string>>> = {
  line_item: LINE_ITEM_LABELS,
  gift_message: GIFT_MESSAGE_LABELS,
  special_instructions: SPECIAL_INSTRUCTIONS_LABELS,
  shipping_method: SHIPPING_METHOD_LABELS,
  payment_method: PAYMENT_METHOD_LABELS,
  billing: BILLING_LABELS,
  terms: TERMS_LABELS,
  gift_card_title: GIFT_CARD_TITLE_LABELS,
  gift_card_desc: GIFT_CARD_DESC_LABELS,
  gift_card_email: GIFT_CARD_EMAIL_LABELS,
  discount_code: DISCOUNT_CODE_LABELS,
  discount_desc: DISCOUNT_DESC_LABELS,
  address: ADDRESS_LABELS,
  order_status: ORDER_STATUS_LABELS,
  account_tab: ACCOUNT_TAB_LABELS,
  search_placeholder: SEARCH_PLACEHOLDER_LABELS,
  search_results: SEARCH_RESULTS_LABELS,
  filter: FILTER_LABELS,
};

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

/**
 * Get a single translated label for a given commerce category, key, and locale.
 * Falls back to English if the locale is not found, and returns the key itself
 * if neither the locale nor English is available.
 */
export function getCommerceLabel(category: string, key: string, locale: string): string {
  const labels = CATEGORY_MAP[category];
  if (!labels) return key;

  const entry = labels[key];
  if (!entry) return key;

  return entry[locale] ?? entry['en'] ?? key;
}

/**
 * Get all translated labels for a given commerce category and locale.
 * Returns a flat Record<string, string> mapping each key to its translated value.
 */
export function getAllCommerceLabels(category: string, locale: string): Record<string, string> {
  const labels = CATEGORY_MAP[category];
  if (!labels) return {};

  const result: Record<string, string> = {};
  for (const [key, translations] of Object.entries(labels)) {
    result[key] = translations[locale] ?? translations['en'] ?? key;
  }
  return result;
}
