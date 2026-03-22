/**
 * Recharge Subscriptions Integration
 * T0206: Integration - Recharge Subscriptions
 * 
 * Handles translation of subscription-related content including:
 * - Subscription widget text (frequency selectors, delivery schedules)
 * - Email notification templates
 * - Customer portal text (manage subscriptions, skip, swap)
 * - Subscription-specific terminology
 */

// Supported locales for Recharge integration
export type RechargeLocale = 'ar' | 'he' | 'fa' | 'ur' | 'en';

// Subscription frequency types
export type SubscriptionFrequency = 'daily' | 'weekly' | 'bi_weekly' | 'monthly' | 'bi_monthly' | 'quarterly' | 'yearly';

// Subscription widget content interface
export interface SubscriptionWidgetContent {
  title?: string;
  description?: string;
  frequencyLabel?: string;
  frequencyOptions?: Array<{
    value: string;
    label: string;
    frequency: SubscriptionFrequency;
    interval?: number;
  }>;
  deliveryLabel?: string;
  discountLabel?: string;
  subscribeButton?: string;
  oneTimeButton?: string;
  savingsText?: string;
  nextDeliveryText?: string;
}

// Email notification types
export type NotificationType = 
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_cancelled'
  | 'upcoming_order'
  | 'order_processed'
  | 'payment_failed'
  | 'payment_updated'
  | 'delivery_address_updated'
  | 'skip_confirmation'
  | 'swap_confirmation';

// Email notification interface
export interface SubscriptionNotification {
  type: NotificationType;
  subject: string;
  body: string;
  previewText?: string;
  actionButton?: {
    text: string;
    url: string;
  };
  metadata?: Record<string, unknown>;
}

// Portal section types
export type PortalSection = 
  | 'dashboard'
  | 'subscriptions'
  | 'orders'
  | 'addresses'
  | 'payment_methods'
  | 'account_settings';

// Customer portal text interface
export interface PortalText {
  section: PortalSection;
  title: string;
  description?: string;
  actions: Array<{
    id: string;
    label: string;
    confirmationMessage?: string;
  }>;
  labels: Record<string, string>;
}

// Recharge template collection
export interface RechargeTemplates {
  locale: RechargeLocale;
  widget: {
    defaultTitle: string;
    defaultDescription: string;
    frequencyLabels: Record<SubscriptionFrequency, string>;
  };
  notifications: Record<NotificationType, {
    subject: string;
    body: string;
    actionText: string;
  }>;
  portal: Record<PortalSection, {
    title: string;
    actions: Record<string, string>;
  }>;
}

// Translations database for subscription terms
const SUBSCRIPTION_TRANSLATIONS: Record<RechargeLocale, {
  frequencies: Record<SubscriptionFrequency, string>;
  actions: Record<string, string>;
  notifications: Record<string, string>;
  portal: Record<string, string>;
  common: Record<string, string>;
}> = {
  ar: {
    frequencies: {
      daily: 'يومياً',
      weekly: 'أسبوعياً',
      bi_weekly: 'كل أسبوعين',
      monthly: 'شهرياً',
      bi_monthly: 'كل شهرين',
      quarterly: 'ربع سنوياً',
      yearly: 'سنوياً',
    },
    actions: {
      subscribe: 'اشتراك',
      subscribeSave: 'اشتراك وتوفير',
      oneTimePurchase: 'شراء لمرة واحدة',
      manage: 'إدارة الاشتراك',
      pause: 'إيقاف مؤقت',
      resume: 'استئناف',
      cancel: 'إلغاء الاشتراك',
      skip: 'تخطي الطلب القادم',
      swap: 'تبديل المنتج',
      update: 'تحديث',
      save: 'حفظ التغييرات',
      confirm: 'تأكيد',
    },
    notifications: {
      subscriptionCreated: 'تم إنشاء الاشتراك بنجاح',
      subscriptionUpdated: 'تم تحديث الاشتراك',
      subscriptionCancelled: 'تم إلغاء الاشتراك',
      upcomingOrder: 'تذكير: طلبك القادم قريباً',
      orderProcessed: 'تم معالجة طلبك',
      paymentFailed: 'فشلت عملية الدفع - يرجى التحديث',
      paymentUpdated: 'تم تحديث طريقة الدفع',
      addressUpdated: 'تم تحديث عنوان التوصيل',
      skipConfirmed: 'تم تخطي الطلب القادم',
      swapConfirmed: 'تم تبديل المنتج بنجاح',
      nextDelivery: 'التوصيل القادم',
      subscriptionDetails: 'تفاصيل الاشتراك',
      billingInfo: 'معلومات الفوترة',
      shippingInfo: 'معلومات الشحن',
    },
    portal: {
      dashboardTitle: 'لوحة تحكم الاشتراكات',
      subscriptionsTitle: 'اشتراكاتي',
      ordersTitle: 'طلباتي',
      addressesTitle: 'عناويني',
      paymentTitle: 'طرق الدفع',
      settingsTitle: 'إعدادات الحساب',
      nextOrder: 'الطلب القادم',
      orderHistory: 'سجل الطلبات',
      editSubscription: 'تعديل الاشتراك',
      deliverySchedule: 'جدولة التوصيل',
      changeProduct: 'تغيير المنتج',
      changeFrequency: 'تغيير التكرار',
      updatePayment: 'تحديث الدفع',
      updateAddress: 'تحديث العنوان',
      viewDetails: 'عرض التفاصيل',
      subscriptionStatus: 'حالة الاشتراك',
      active: 'نشط',
      paused: 'متوقف',
      cancelled: 'ملغى',
    },
    common: {
      deliveryEvery: 'توصيل كل',
      saveUpTo: 'وفر حتى',
      off: 'خصم',
      subscribeAndSave: 'اشترك ووفر',
      subscription: 'اشتراك',
      oneTime: 'مرة واحدة',
      frequency: 'التكرار',
      nextBilling: 'الفوترة القادمة',
      amount: 'المبلغ',
      quantity: 'الكمية',
      total: 'الإجمالي',
      subtotal: 'المجموع الفرعي',
      shipping: 'الشحن',
      tax: 'الضريبة',
      discount: 'الخصم',
      freeShipping: 'شحن مجاني',
    },
  },
  he: {
    frequencies: {
      daily: 'יומי',
      weekly: 'שבועי',
      bi_weekly: 'דו שבועי',
      monthly: 'חודשי',
      bi_monthly: 'דו חודשי',
      quarterly: 'רבעוני',
      yearly: 'שנתי',
    },
    actions: {
      subscribe: 'הרשמה למנוי',
      subscribeSave: 'הרשם וחסוך',
      oneTimePurchase: 'רכישה חד פעמית',
      manage: 'ניהול מנוי',
      pause: 'השהה',
      resume: 'המשך',
      cancel: 'בטל מנוי',
      skip: 'דלג על ההזמנה הבאה',
      swap: 'החלף מוצר',
      update: 'עדכן',
      save: 'שמור שינויים',
      confirm: 'אשר',
    },
    notifications: {
      subscriptionCreated: 'המנוי נוצר בהצלחה',
      subscriptionUpdated: 'המנוי עודכן',
      subscriptionCancelled: 'המנוי בוטל',
      upcomingOrder: 'תזכורת: ההזמנה הבאה קרובה',
      orderProcessed: 'ההזמנה שלך עובדה',
      paymentFailed: 'התשלום נכשל - יש לעדכן',
      paymentUpdated: 'אמצעי התשלום עודכן',
      addressUpdated: 'כתובת המשלוח עודכנה',
      skipConfirmed: 'ההזמנה הבאה דולגה',
      swapConfirmed: 'המוצר הוחלף בהצלחה',
      nextDelivery: 'המשלוח הבא',
      subscriptionDetails: 'פרטי המנוי',
      billingInfo: 'פרטי חיוב',
      shippingInfo: 'פרטי משלוח',
    },
    portal: {
      dashboardTitle: 'לוח בקרת מנויים',
      subscriptionsTitle: 'המנויים שלי',
      ordersTitle: 'ההזמנות שלי',
      addressesTitle: 'הכתובות שלי',
      paymentTitle: 'אמצעי תשלום',
      settingsTitle: 'הגדרות חשבון',
      nextOrder: 'ההזמנה הבאה',
      orderHistory: 'היסטוריית הזמנות',
      editSubscription: 'ערוך מנוי',
      deliverySchedule: 'לוח משלוחים',
      changeProduct: 'החלף מוצר',
      changeFrequency: 'שנה תדירות',
      updatePayment: 'עדכן תשלום',
      updateAddress: 'עדכן כתובת',
      viewDetails: 'הצג פרטים',
      subscriptionStatus: 'סטטוס מנוי',
      active: 'פעיל',
      paused: 'מושהה',
      cancelled: 'מבוטל',
    },
    common: {
      deliveryEvery: 'משלוח כל',
      saveUpTo: 'חסוך עד',
      off: 'הנחה',
      subscribeAndSave: 'הרשם וחסוך',
      subscription: 'מנוי',
      oneTime: 'חד פעמי',
      frequency: 'תדירות',
      nextBilling: 'חיוב הבא',
      amount: 'סכום',
      quantity: 'כמות',
      total: 'סה"כ',
      subtotal: 'סכום ביניים',
      shipping: 'משלוח',
      tax: 'מע"מ',
      discount: 'הנחה',
      freeShipping: 'משלוח חינם',
    },
  },
  fa: {
    frequencies: {
      daily: 'روزانه',
      weekly: 'هفتگی',
      bi_weekly: 'دو هفته یک بار',
      monthly: 'ماهانه',
      bi_monthly: 'دو ماه یک بار',
      quarterly: 'سه ماهه',
      yearly: 'سالانه',
    },
    actions: {
      subscribe: 'اشتراک',
      subscribeSave: 'اشتراک و صرفه‌جویی',
      oneTimePurchase: 'خرید یکباره',
      manage: 'مدیریت اشتراک',
      pause: 'توقف موقت',
      resume: 'از سرگیری',
      cancel: 'لغو اشتراک',
      skip: 'رد کردن سفارش بعدی',
      swap: 'تعویض محصول',
      update: 'به‌روزرسانی',
      save: 'ذخیره تغییرات',
      confirm: 'تأیید',
    },
    notifications: {
      subscriptionCreated: 'اشتراک با موفقیت ایجاد شد',
      subscriptionUpdated: 'اشتراک به‌روزرسانی شد',
      subscriptionCancelled: 'اشتراک لغو شد',
      upcomingOrder: 'یادآوری: سفارش بعدی نزدیک است',
      orderProcessed: 'سفارش شما پردازش شد',
      paymentFailed: 'پرداخت ناموفق - لطفاً به‌روزرسانی کنید',
      paymentUpdated: 'روش پرداخت به‌روزرسانی شد',
      addressUpdated: 'آدرس ارسال به‌روزرسانی شد',
      skipConfirmed: 'سفارش بعدی رد شد',
      swapConfirmed: 'محصول با موفقیت تعویض شد',
      nextDelivery: 'تحویل بعدی',
      subscriptionDetails: 'جزئیات اشتراک',
      billingInfo: 'اطلاعات صورتحساب',
      shippingInfo: 'اطلاعات ارسال',
    },
    portal: {
      dashboardTitle: 'داشبورد اشتراک‌ها',
      subscriptionsTitle: 'اشتراک‌های من',
      ordersTitle: 'سفارش‌های من',
      addressesTitle: 'آدرس‌های من',
      paymentTitle: 'روش‌های پرداخت',
      settingsTitle: 'تنظیمات حساب',
      nextOrder: 'سفارش بعدی',
      orderHistory: 'تاریخچه سفارش‌ها',
      editSubscription: 'ویرایش اشتراک',
      deliverySchedule: 'برنامه تحویل',
      changeProduct: 'تغییر محصول',
      changeFrequency: 'تغییر تناوب',
      updatePayment: 'به‌روزرسانی پرداخت',
      updateAddress: 'به‌روزرسانی آدرس',
      viewDetails: 'مشاهده جزئیات',
      subscriptionStatus: 'وضعیت اشتراک',
      active: 'فعال',
      paused: 'متوقف',
      cancelled: 'لغو شده',
    },
    common: {
      deliveryEvery: 'تحویل هر',
      saveUpTo: 'صرفه‌جویی تا',
      off: 'تخفیف',
      subscribeAndSave: 'اشتراک و صرفه‌جویی',
      subscription: 'اشتراک',
      oneTime: 'یکباره',
      frequency: 'تناوب',
      nextBilling: 'صورتحساب بعدی',
      amount: 'مبلغ',
      quantity: 'تعداد',
      total: 'جمع',
      subtotal: 'جمع جزء',
      shipping: 'ارسال',
      tax: 'مالیات',
      discount: 'تخفیف',
      freeShipping: 'ارسال رایگان',
    },
  },
  ur: {
    frequencies: {
      daily: 'روزانہ',
      weekly: 'ہفتہ وار',
      bi_weekly: 'دو ہفتے میں ایک بار',
      monthly: 'ماہانہ',
      bi_monthly: 'دو ماہ میں ایک بار',
      quarterly: 'سہ ماہی',
      yearly: 'سالانہ',
    },
    actions: {
      subscribe: 'رکن بنیں',
      subscribeSave: 'رکن بنیں اور بچت کریں',
      oneTimePurchase: 'ایک بار کی خریداری',
      manage: 'رکنیت کا انتظام',
      pause: 'موقوف کریں',
      resume: 'دوبارہ شروع کریں',
      cancel: 'رکنیت منسوخ کریں',
      skip: 'اگلے آرڈر کو چھوڑ دیں',
      swap: 'پروڈکٹ تبدیل کریں',
      update: 'اپ ڈیٹ',
      save: 'تبدیلیاں محفوظ کریں',
      confirm: 'تصدیق کریں',
    },
    notifications: {
      subscriptionCreated: 'رکنیت کامیابی سے بنائی گئی',
      subscriptionUpdated: 'رکنیت اپ ڈیٹ کر دی گئی',
      subscriptionCancelled: 'رکنیت منسوخ کر دی گئی',
      upcomingOrder: 'یاد دہانی: اگلا آرڈر قریب ہے',
      orderProcessed: 'آپ کا آرڈر پروسیس کر دیا گیا',
      paymentFailed: 'ادائیگی ناکام - براہ کرم اپ ڈیٹ کریں',
      paymentUpdated: 'ادائیگی کا طریقہ اپ ڈیٹ کر دیا گیا',
      addressUpdated: 'ترسیل کا پتہ اپ ڈیٹ کر دیا گیا',
      skipConfirmed: 'اگلا آرڈر چھوڑ دیا گیا',
      swapConfirmed: 'پروڈکٹ کامیابی سے تبدیل کر دی گئی',
      nextDelivery: 'اگلی ترسیل',
      subscriptionDetails: 'رکنیت کی تفصیلات',
      billingInfo: 'بلنگ کی معلومات',
      shippingInfo: 'شپنگ کی معلومات',
    },
    portal: {
      dashboardTitle: 'رکنیت کا ڈیش بورڈ',
      subscriptionsTitle: 'میری رکنیتیں',
      ordersTitle: 'میرے آرڈرز',
      addressesTitle: 'میرے پتے',
      paymentTitle: 'ادائیگی کے طریقے',
      settingsTitle: 'اکاؤنٹ کی ترتیبات',
      nextOrder: 'اگلا آرڈر',
      orderHistory: 'آرڈر کی تاریخ',
      editSubscription: 'رکنیت میں ترمیم',
      deliverySchedule: 'ترسیل کا شیڈول',
      changeProduct: 'پروڈکٹ تبدیل کریں',
      changeFrequency: 'تعدد تبدیل کریں',
      updatePayment: 'ادائیگی اپ ڈیٹ کریں',
      updateAddress: 'پتہ اپ ڈیٹ کریں',
      viewDetails: 'تفصیلات دیکھیں',
      subscriptionStatus: 'رکنیت کی حالت',
      active: 'فعال',
      paused: 'موقوف',
      cancelled: 'منسوخ',
    },
    common: {
      deliveryEvery: 'ہر ترسیل',
      saveUpTo: 'تک بچت کریں',
      off: 'رعایت',
      subscribeAndSave: 'رکن بنیں اور بچت کریں',
      subscription: 'رکنیت',
      oneTime: 'ایک بار',
      frequency: 'تعدد',
      nextBilling: 'اگلا بل',
      amount: 'رقم',
      quantity: 'مقدار',
      total: 'کل',
      subtotal: 'ذیلی کل',
      shipping: 'شپنگ',
      tax: 'ٹیکس',
      discount: 'رعایت',
      freeShipping: 'مفت شپنگ',
    },
  },
  en: {
    frequencies: {
      daily: 'Daily',
      weekly: 'Weekly',
      bi_weekly: 'Bi-weekly',
      monthly: 'Monthly',
      bi_monthly: 'Bi-monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly',
    },
    actions: {
      subscribe: 'Subscribe',
      subscribeSave: 'Subscribe & Save',
      oneTimePurchase: 'One-time Purchase',
      manage: 'Manage Subscription',
      pause: 'Pause',
      resume: 'Resume',
      cancel: 'Cancel Subscription',
      skip: 'Skip Next Order',
      swap: 'Swap Product',
      update: 'Update',
      save: 'Save Changes',
      confirm: 'Confirm',
    },
    notifications: {
      subscriptionCreated: 'Subscription created successfully',
      subscriptionUpdated: 'Subscription updated',
      subscriptionCancelled: 'Subscription cancelled',
      upcomingOrder: 'Reminder: Your next order is coming up',
      orderProcessed: 'Your order has been processed',
      paymentFailed: 'Payment failed - please update',
      paymentUpdated: 'Payment method updated',
      addressUpdated: 'Delivery address updated',
      skipConfirmed: 'Next order skipped',
      swapConfirmed: 'Product swapped successfully',
      nextDelivery: 'Next Delivery',
      subscriptionDetails: 'Subscription Details',
      billingInfo: 'Billing Information',
      shippingInfo: 'Shipping Information',
    },
    portal: {
      dashboardTitle: 'Subscription Dashboard',
      subscriptionsTitle: 'My Subscriptions',
      ordersTitle: 'My Orders',
      addressesTitle: 'My Addresses',
      paymentTitle: 'Payment Methods',
      settingsTitle: 'Account Settings',
      nextOrder: 'Next Order',
      orderHistory: 'Order History',
      editSubscription: 'Edit Subscription',
      deliverySchedule: 'Delivery Schedule',
      changeProduct: 'Change Product',
      changeFrequency: 'Change Frequency',
      updatePayment: 'Update Payment',
      updateAddress: 'Update Address',
      viewDetails: 'View Details',
      subscriptionStatus: 'Subscription Status',
      active: 'Active',
      paused: 'Paused',
      cancelled: 'Cancelled',
    },
    common: {
      deliveryEvery: 'Deliver every',
      saveUpTo: 'Save up to',
      off: 'off',
      subscribeAndSave: 'Subscribe & Save',
      subscription: 'Subscription',
      oneTime: 'One-time',
      frequency: 'Frequency',
      nextBilling: 'Next Billing',
      amount: 'Amount',
      quantity: 'Quantity',
      total: 'Total',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      tax: 'Tax',
      discount: 'Discount',
      freeShipping: 'Free Shipping',
    },
  },
};

/**
 * Translate subscription widget content
 */
export function translateSubscriptionWidget(
  content: SubscriptionWidgetContent,
  locale: RechargeLocale
): SubscriptionWidgetContent {
  const translations = SUBSCRIPTION_TRANSLATIONS[locale];
  
  return {
    ...content,
    title: content.title || translations.common.subscribeAndSave,
    description: content.description || '',
    frequencyLabel: content.frequencyLabel || translations.common.frequency,
    deliveryLabel: content.deliveryLabel || translations.common.deliveryEvery,
    discountLabel: content.discountLabel || translations.common.saveUpTo,
    subscribeButton: content.subscribeButton || translations.actions.subscribeSave,
    oneTimeButton: content.oneTimeButton || translations.actions.oneTimePurchase,
    savingsText: content.savingsText || translations.common.saveUpTo,
    nextDeliveryText: content.nextDeliveryText || translations.notifications.nextDelivery,
    frequencyOptions: content.frequencyOptions?.map(option => ({
      ...option,
      label: translations.frequencies[option.frequency] || option.label,
    })),
  };
}

/**
 * Build notification subject based on type and locale
 */
function buildNotificationSubject(type: NotificationType, locale: RechargeLocale): string {
  const translations = SUBSCRIPTION_TRANSLATIONS[locale];
  
  const subjectMap: Record<NotificationType, string> = {
    subscription_created: translations.notifications.subscriptionCreated,
    subscription_updated: translations.notifications.subscriptionUpdated,
    subscription_cancelled: translations.notifications.subscriptionCancelled,
    upcoming_order: translations.notifications.upcomingOrder,
    order_processed: translations.notifications.orderProcessed,
    payment_failed: translations.notifications.paymentFailed,
    payment_updated: translations.notifications.paymentUpdated,
    delivery_address_updated: translations.notifications.addressUpdated,
    skip_confirmation: translations.notifications.skipConfirmed,
    swap_confirmation: translations.notifications.swapConfirmed,
  };
  
  return subjectMap[type];
}

/**
 * Build notification body based on type and locale
 */
function buildNotificationBody(type: NotificationType, locale: RechargeLocale, customBody?: string): string {
  const translations = SUBSCRIPTION_TRANSLATIONS[locale];
  
  if (customBody) {
    return customBody;
  }
  
  const bodyMap: Record<NotificationType, string> = {
    subscription_created: `${translations.notifications.subscriptionCreated}\n\n${translations.notifications.subscriptionDetails}`,
    subscription_updated: `${translations.notifications.subscriptionUpdated}\n\n${translations.common.frequency}: [FREQUENCY]`,
    subscription_cancelled: `${translations.notifications.subscriptionCancelled}\n\n${translations.portal.subscriptionStatus}: ${translations.portal.cancelled}`,
    upcoming_order: `${translations.notifications.upcomingOrder}\n\n${translations.notifications.nextDelivery}: [DATE]`,
    order_processed: `${translations.notifications.orderProcessed}\n\n${translations.common.total}: [AMOUNT]`,
    payment_failed: `${translations.notifications.paymentFailed}\n\n${translations.portal.updatePayment}`,
    payment_updated: `${translations.notifications.paymentUpdated}\n\n${translations.notifications.billingInfo}`,
    delivery_address_updated: `${translations.notifications.addressUpdated}\n\n${translations.notifications.shippingInfo}`,
    skip_confirmation: `${translations.notifications.skipConfirmed}\n\n${translations.portal.nextOrder}: [NEXT_DATE]`,
    swap_confirmation: `${translations.notifications.swapConfirmed}\n\n${translations.portal.changeProduct}: [NEW_PRODUCT]`,
  };
  
  return bodyMap[type];
}

/**
 * Build action button text based on notification type
 */
function buildActionText(type: NotificationType, locale: RechargeLocale): string {
  const translations = SUBSCRIPTION_TRANSLATIONS[locale];
  
  const actionMap: Record<NotificationType, string> = {
    subscription_created: translations.portal.viewDetails,
    subscription_updated: translations.portal.viewDetails,
    subscription_cancelled: translations.portal.dashboardTitle,
    upcoming_order: translations.portal.viewDetails,
    order_processed: translations.ordersTitle,
    payment_failed: translations.portal.updatePayment,
    payment_updated: translations.portal.viewDetails,
    delivery_address_updated: translations.portal.viewDetails,
    skip_confirmation: translations.portal.viewDetails,
    swap_confirmation: translations.portal.viewDetails,
  };
  
  return actionMap[type];
}

/**
 * Translate email notification
 */
export function translateNotification(
  notification: SubscriptionNotification,
  locale: RechargeLocale
): SubscriptionNotification {
  const translatedSubject = buildNotificationSubject(notification.type, locale);
  const translatedBody = buildNotificationBody(notification.type, locale, notification.body);
  const translatedActionText = buildActionText(notification.type, locale);
  
  return {
    ...notification,
    subject: translatedSubject,
    body: translatedBody,
    previewText: notification.previewText || translatedSubject,
    actionButton: notification.actionButton
      ? {
          ...notification.actionButton,
          text: translatedActionText,
        }
      : undefined,
  };
}

/**
 * Translate customer portal text
 */
export function translatePortalText(
  text: PortalText,
  locale: RechargeLocale
): PortalText {
  const translations = SUBSCRIPTION_TRANSLATIONS[locale];
  
  const sectionTitleMap: Record<PortalSection, string> = {
    dashboard: translations.portal.dashboardTitle,
    subscriptions: translations.portal.subscriptionsTitle,
    orders: translations.portal.ordersTitle,
    addresses: translations.portal.addressesTitle,
    payment_methods: translations.portal.paymentTitle,
    account_settings: translations.portal.settingsTitle,
  };
  
  const actionLabelMap: Record<string, string> = {
    pause: translations.actions.pause,
    resume: translations.actions.resume,
    cancel: translations.actions.cancel,
    skip: translations.actions.skip,
    swap: translations.actions.swap,
    update: translations.actions.update,
    save: translations.actions.save,
    edit: translations.portal.editSubscription,
    view: translations.portal.viewDetails,
    change_product: translations.portal.changeProduct,
    change_frequency: translations.portal.changeFrequency,
    update_payment: translations.portal.updatePayment,
    update_address: translations.portal.updateAddress,
  };
  
  const translatedActions = text.actions.map(action => ({
    ...action,
    label: actionLabelMap[action.id] || action.label,
    confirmationMessage: action.confirmationMessage
      ? `${translations.actions.confirm}: ${action.confirmationMessage}`
      : undefined,
  }));
  
  const translatedLabels: Record<string, string> = {};
  for (const [key, value] of Object.entries(text.labels)) {
    const labelKey = key.toLowerCase();
    if (labelKey.includes('status')) {
      translatedLabels[key] = translations.portal.subscriptionStatus;
    } else if (labelKey.includes('next')) {
      translatedLabels[key] = translations.portal.nextOrder;
    } else if (labelKey.includes('frequency')) {
      translatedLabels[key] = translations.common.frequency;
    } else if (labelKey.includes('amount')) {
      translatedLabels[key] = translations.common.amount;
    } else if (labelKey.includes('total')) {
      translatedLabels[key] = translations.common.total;
    } else {
      translatedLabels[key] = value;
    }
  }
  
  return {
    ...text,
    title: sectionTitleMap[text.section] || text.title,
    actions: translatedActions,
    labels: translatedLabels,
  };
}

/**
 * Get complete Recharge templates for a locale
 */
export function getRechargeTemplates(locale: RechargeLocale): RechargeTemplates {
  const translations = SUBSCRIPTION_TRANSLATIONS[locale];
  
  return {
    locale,
    widget: {
      defaultTitle: translations.common.subscribeAndSave,
      defaultDescription: '',
      frequencyLabels: { ...translations.frequencies },
    },
    notifications: {
      subscription_created: {
        subject: translations.notifications.subscriptionCreated,
        body: buildNotificationBody('subscription_created', locale),
        actionText: translations.portal.viewDetails,
      },
      subscription_updated: {
        subject: translations.notifications.subscriptionUpdated,
        body: buildNotificationBody('subscription_updated', locale),
        actionText: translations.portal.viewDetails,
      },
      subscription_cancelled: {
        subject: translations.notifications.subscriptionCancelled,
        body: buildNotificationBody('subscription_cancelled', locale),
        actionText: translations.portal.dashboardTitle,
      },
      upcoming_order: {
        subject: translations.notifications.upcomingOrder,
        body: buildNotificationBody('upcoming_order', locale),
        actionText: translations.portal.viewDetails,
      },
      order_processed: {
        subject: translations.notifications.orderProcessed,
        body: buildNotificationBody('order_processed', locale),
        actionText: translations.ordersTitle,
      },
      payment_failed: {
        subject: translations.notifications.paymentFailed,
        body: buildNotificationBody('payment_failed', locale),
        actionText: translations.portal.updatePayment,
      },
      payment_updated: {
        subject: translations.notifications.paymentUpdated,
        body: buildNotificationBody('payment_updated', locale),
        actionText: translations.portal.viewDetails,
      },
      delivery_address_updated: {
        subject: translations.notifications.addressUpdated,
        body: buildNotificationBody('delivery_address_updated', locale),
        actionText: translations.portal.viewDetails,
      },
      skip_confirmation: {
        subject: translations.notifications.skipConfirmed,
        body: buildNotificationBody('skip_confirmation', locale),
        actionText: translations.portal.viewDetails,
      },
      swap_confirmation: {
        subject: translations.notifications.swapConfirmed,
        body: buildNotificationBody('swap_confirmation', locale),
        actionText: translations.portal.viewDetails,
      },
    },
    portal: {
      dashboard: {
        title: translations.portal.dashboardTitle,
        actions: {
          view_subscriptions: translations.portal.subscriptionsTitle,
          view_orders: translations.portal.ordersTitle,
          update_settings: translations.portal.settingsTitle,
        },
      },
      subscriptions: {
        title: translations.portal.subscriptionsTitle,
        actions: {
          pause: translations.actions.pause,
          resume: translations.actions.resume,
          cancel: translations.actions.cancel,
          skip: translations.actions.skip,
          swap: translations.actions.swap,
          edit: translations.portal.editSubscription,
        },
      },
      orders: {
        title: translations.portal.ordersTitle,
        actions: {
          view: translations.portal.viewDetails,
          track: translations.portal.viewDetails,
        },
      },
      addresses: {
        title: translations.portal.addressesTitle,
        actions: {
          add: translations.actions.update,
          edit: translations.portal.updateAddress,
          delete: translations.actions.cancel,
        },
      },
      payment_methods: {
        title: translations.portal.paymentTitle,
        actions: {
          add: translations.actions.update,
          update: translations.portal.updatePayment,
          delete: translations.actions.cancel,
        },
      },
      account_settings: {
        title: translations.portal.settingsTitle,
        actions: {
          update_profile: translations.actions.update,
          change_password: translations.actions.update,
          notifications: translations.actions.update,
        },
      },
    },
  };
}

/**
 * Format subscription frequency with interval
 */
export function formatFrequency(
  frequency: SubscriptionFrequency,
  interval: number,
  locale: RechargeLocale
): string {
  const translations = SUBSCRIPTION_TRANSLATIONS[locale];
  const frequencyLabel = translations.frequencies[frequency];
  
  if (interval <= 1) {
    return frequencyLabel;
  }
  
  // For intervals > 1, format as "Every X [frequency]"
  if (locale === 'ar') {
    return `كل ${interval} ${frequencyLabel}`;
  } else if (locale === 'he') {
    return `כל ${interval} ${frequencyLabel}`;
  } else if (locale === 'fa') {
    return `هر ${interval} ${frequencyLabel}`;
  } else if (locale === 'ur') {
    return `ہر ${interval} ${frequencyLabel}`;
  }
  
  return `Every ${interval} ${frequencyLabel}`;
}

/**
 * Get subscription status label
 */
export function getSubscriptionStatusLabel(
  status: 'active' | 'paused' | 'cancelled',
  locale: RechargeLocale
): string {
  const translations = SUBSCRIPTION_TRANSLATIONS[locale];
  
  const statusMap = {
    active: translations.portal.active,
    paused: translations.portal.paused,
    cancelled: translations.portal.cancelled,
  };
  
  return statusMap[status];
}

/**
 * Format price with currency for RTL locales
 */
export function formatSubscriptionPrice(
  amount: number,
  currency: string,
  locale: RechargeLocale
): string {
  const isRTL = ['ar', 'he', 'fa', 'ur'].includes(locale);
  
  if (isRTL) {
    // For RTL: amount first, then currency
    return `${amount.toFixed(2)} ${currency}`;
  }
  
  return `${currency} ${amount.toFixed(2)}`;
}

// Export constants for external use
export const RECHARGE_SUPPORTED_LOCALES: RechargeLocale[] = ['ar', 'he', 'fa', 'ur', 'en'];
export const RECHARGE_DEFAULT_LOCALE: RechargeLocale = 'en';
