/**
 * T0207 - Bold Subscriptions Integration
 * RTL support for Bold Subscriptions widgets, plans, and customer portal.
 * 
 * Bold has unique UI patterns including:
 * - Subscription groups with customizable intervals
 * - Customer portal with subscription management
 * - Different widget placements (product page, cart, checkout)
 */

// Supported RTL locales for Bold
export const BOLD_RTL_LOCALES = ['ar', 'ar-SA', 'ar-EG', 'he', 'he-IL', 'fa', 'ur'];

// Bold widget types
export type BoldWidgetType = 'product' | 'cart' | 'checkout' | 'account';

// Subscription interval types
export type IntervalType = 'day' | 'week' | 'month' | 'year';

// Subscription group configuration
export interface SubscriptionGroup {
  id: string;
  name: string;
  intervals: SubscriptionInterval[];
  defaultIntervalId?: string;
  discountMessage?: string;
  savingsLabel?: string;
}

// Subscription interval configuration
export interface SubscriptionInterval {
  id: string;
  frequency: number;
  intervalType: IntervalType;
  label: string;
  discountPercent?: number;
  discountAmount?: number;
}

// Bold widget content structure
export interface BoldWidgetContent {
  widgetType: BoldWidgetType;
  title?: string;
  description?: string;
  subscriptionLabel?: string;
  onetimeLabel?: string;
  groupLabel?: string;
  intervalLabel?: string;
  savingsLabel?: string;
  buttonText?: string;
  groups?: SubscriptionGroup[];
  selectedGroupId?: string;
  selectedIntervalId?: string;
}

// Subscription plan for customer portal
export interface SubscriptionPlan {
  id: string;
  productName: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  nextOrderDate?: string;
  interval: SubscriptionInterval;
  price: number;
  currency: string;
  quantity: number;
  deliveryAddress?: string;
  paymentMethod?: string;
}

// Customer portal content
export interface PortalContent {
  title?: string;
  greeting?: string;
  sections: PortalSection[];
  actions: PortalAction[];
  subscriptions: SubscriptionPlan[];
}

// Portal section
export interface PortalSection {
  id: string;
  title: string;
  description?: string;
}

// Portal action button/link
export interface PortalAction {
  id: string;
  label: string;
  action: string;
  href?: string;
}

// Bold templates for different locales
export interface BoldTemplates {
  locale: string;
  isRTL: boolean;
  widgets: {
    product: {
      subscriptionLabel: string;
      onetimeLabel: string;
      selectInterval: string;
      selectGroup: string;
      savingsBadge: string;
      subscribeButton: string;
      addToCartButton: string;
    };
    cart: {
      subscriptionSummary: string;
      changeInterval: string;
      nextDelivery: string;
    };
    checkout: {
      subscriptionDetails: string;
      billingInterval: string;
      recurringTotal: string;
    };
    account: {
      manageSubscriptions: string;
      viewDetails: string;
    };
  };
  portal: {
    activeSubscriptions: string;
    pausedSubscriptions: string;
    cancelledSubscriptions: string;
    nextOrder: string;
    editSubscription: string;
    pauseSubscription: string;
    resumeSubscription: string;
    cancelSubscription: string;
    skipOrder: string;
    updatePayment: string;
    updateAddress: string;
    swapProduct: string;
    orderHistory: string;
  };
  intervals: Record<IntervalType, string>;
}

// Default Arabic templates
const ARABIC_TEMPLATES: BoldTemplates = {
  locale: 'ar',
  isRTL: true,
  widgets: {
    product: {
      subscriptionLabel: 'اشتراك',
      onetimeLabel: 'شراء لمرة واحدة',
      selectInterval: 'اختر التكرار',
      selectGroup: 'اختر مجموعة الاشتراك',
      savingsBadge: 'وفر {amount}',
      subscribeButton: 'اشترك الآن',
      addToCartButton: 'أضف إلى السلة',
    },
    cart: {
      subscriptionSummary: 'ملخص الاشتراك',
      changeInterval: 'تغيير التكرار',
      nextDelivery: 'التوصيل التالي',
    },
    checkout: {
      subscriptionDetails: 'تفاصيل الاشتراك',
      billingInterval: 'فترة الفوترة',
      recurringTotal: 'المجموع المتكرر',
    },
    account: {
      manageSubscriptions: 'إدارة الاشتراكات',
      viewDetails: 'عرض التفاصيل',
    },
  },
  portal: {
    activeSubscriptions: 'الاشتراكات النشطة',
    pausedSubscriptions: 'الاشتراكات المعلقة',
    cancelledSubscriptions: 'الاشتراكات الملغاة',
    nextOrder: 'الطلب القادم',
    editSubscription: 'تعديل الاشتراك',
    pauseSubscription: 'إيقاف مؤقت',
    resumeSubscription: 'استئناف',
    cancelSubscription: 'إلغاء الاشتراك',
    skipOrder: 'تخطي الطلب',
    updatePayment: 'تحديث الدفع',
    updateAddress: 'تحديث العنوان',
    swapProduct: 'تبديل المنتج',
    orderHistory: 'تاريخ الطلبات',
  },
  intervals: {
    day: 'يوم',
    week: 'أسبوع',
    month: 'شهر',
    year: 'سنة',
  },
};

// Default Hebrew templates
const HEBREW_TEMPLATES: BoldTemplates = {
  locale: 'he',
  isRTL: true,
  widgets: {
    product: {
      subscriptionLabel: 'מנוי',
      onetimeLabel: 'רכישה חד פעמית',
      selectInterval: 'בחר תדירות',
      selectGroup: 'בחר קבוצת מנוי',
      savingsBadge: 'חסוך {amount}',
      subscribeButton: 'הירשם עכשיו',
      addToCartButton: 'הוסף לסל',
    },
    cart: {
      subscriptionSummary: 'סיכום מנוי',
      changeInterval: 'שנה תדירות',
      nextDelivery: 'משלוח הבא',
    },
    checkout: {
      subscriptionDetails: 'פרטי מנוי',
      billingInterval: 'מחזור חיוב',
      recurringTotal: 'סכום חוזר',
    },
    account: {
      manageSubscriptions: 'ניהול מנויים',
      viewDetails: 'הצג פרטים',
    },
  },
  portal: {
    activeSubscriptions: 'מנויים פעילים',
    pausedSubscriptions: 'מנויים מושהים',
    cancelledSubscriptions: 'מנויים מבוטלים',
    nextOrder: 'הזמנה הבאה',
    editSubscription: 'ערוך מנוי',
    pauseSubscription: 'השהה מנוי',
    resumeSubscription: 'חדש מנוי',
    cancelSubscription: 'בטל מנוי',
    skipOrder: 'דלג על הזמנה',
    updatePayment: 'עדכן תשלום',
    updateAddress: 'עדכן כתובת',
    swapProduct: 'החלף מוצר',
    orderHistory: 'היסטוריית הזמנות',
  },
  intervals: {
    day: 'יום',
    week: 'שבוע',
    month: 'חודש',
    year: 'שנה',
  },
};

// Default English templates (for reference/comparison)
const ENGLISH_TEMPLATES: BoldTemplates = {
  locale: 'en',
  isRTL: false,
  widgets: {
    product: {
      subscriptionLabel: 'Subscribe',
      onetimeLabel: 'One-time purchase',
      selectInterval: 'Select frequency',
      selectGroup: 'Select subscription group',
      savingsBadge: 'Save {amount}',
      subscribeButton: 'Subscribe Now',
      addToCartButton: 'Add to Cart',
    },
    cart: {
      subscriptionSummary: 'Subscription Summary',
      changeInterval: 'Change Frequency',
      nextDelivery: 'Next Delivery',
    },
    checkout: {
      subscriptionDetails: 'Subscription Details',
      billingInterval: 'Billing Interval',
      recurringTotal: 'Recurring Total',
    },
    account: {
      manageSubscriptions: 'Manage Subscriptions',
      viewDetails: 'View Details',
    },
  },
  portal: {
    activeSubscriptions: 'Active Subscriptions',
    pausedSubscriptions: 'Paused Subscriptions',
    cancelledSubscriptions: 'Cancelled Subscriptions',
    nextOrder: 'Next Order',
    editSubscription: 'Edit Subscription',
    pauseSubscription: 'Pause',
    resumeSubscription: 'Resume',
    cancelSubscription: 'Cancel Subscription',
    skipOrder: 'Skip Order',
    updatePayment: 'Update Payment',
    updateAddress: 'Update Address',
    swapProduct: 'Swap Product',
    orderHistory: 'Order History',
  },
  intervals: {
    day: 'day',
    week: 'week',
    month: 'month',
    year: 'year',
  },
};

// Template cache
const templateCache: Map<string, BoldTemplates> = new Map();

/**
 * Check if a locale is RTL
 */
export function isRTLLocale(locale: string): boolean {
  return BOLD_RTL_LOCALES.some(
    (rtlLocale) => locale === rtlLocale || locale.startsWith(rtlLocale)
  );
}

/**
 * Get Bold templates for a specific locale
 */
export function getBoldTemplates(locale: string): BoldTemplates {
  // Check cache first
  if (templateCache.has(locale)) {
    return templateCache.get(locale)!;
  }

  let templates: BoldTemplates;

  if (locale.startsWith('ar')) {
    templates = { ...ARABIC_TEMPLATES, locale };
  } else if (locale.startsWith('he')) {
    templates = { ...HEBREW_TEMPLATES, locale };
  } else {
    templates = { ...ENGLISH_TEMPLATES, locale };
  }

  // Cache and return
  templateCache.set(locale, templates);
  return templates;
}

/**
 * Format interval text for display
 */
export function formatInterval(
  interval: SubscriptionInterval,
  locale: string
): string {
  const templates = getBoldTemplates(locale);
  const intervalName = templates.intervals[interval.intervalType];
  
  if (locale.startsWith('ar')) {
    // Arabic pluralization
    if (interval.frequency === 1) {
      return `كل ${intervalName}`;
    }
    return `كل ${interval.frequency} ${intervalName}`;
  }
  
  if (locale.startsWith('he')) {
    // Hebrew format
    if (interval.frequency === 1) {
      return `כל ${intervalName}`;
    }
    return `כל ${interval.frequency} ${intervalName}ים`;
  }
  
  // English format
  if (interval.frequency === 1) {
    return `Every ${intervalName}`;
  }
  return `Every ${interval.frequency} ${intervalName}s`;
}

/**
 * Translate Bold widget content for RTL
 */
export function translateBoldWidget(
  content: BoldWidgetContent,
  locale: string
): BoldWidgetContent {
  const templates = getBoldTemplates(locale);
  const isRTL = isRTLLocale(locale);
  
  // Deep clone to avoid mutation
  const translated: BoldWidgetContent = {
    ...content,
    groups: content.groups?.map((group) => ({ ...group })),
  };

  // Translate based on widget type
  switch (content.widgetType) {
    case 'product':
      translated.subscriptionLabel = templates.widgets.product.subscriptionLabel;
      translated.onetimeLabel = templates.widgets.product.onetimeLabel;
      translated.groupLabel = templates.widgets.product.selectGroup;
      translated.intervalLabel = templates.widgets.product.selectInterval;
      translated.savingsLabel = templates.widgets.product.savingsBadge;
      translated.buttonText = templates.widgets.product.subscribeButton;
      break;
      
    case 'cart':
      translated.title = templates.widgets.cart.subscriptionSummary;
      translated.groupLabel = templates.widgets.cart.changeInterval;
      translated.intervalLabel = templates.widgets.cart.nextDelivery;
      break;
      
    case 'checkout':
      translated.title = templates.widgets.checkout.subscriptionDetails;
      translated.groupLabel = templates.widgets.checkout.billingInterval;
      translated.intervalLabel = templates.widgets.checkout.recurringTotal;
      break;
      
    case 'account':
      translated.title = templates.widgets.account.manageSubscriptions;
      translated.buttonText = templates.widgets.account.viewDetails;
      break;
  }

  // Translate group names and intervals
  if (translated.groups) {
    translated.groups = translated.groups.map((group) => ({
      ...group,
      intervals: group.intervals.map((interval) => ({
        ...interval,
        label: formatInterval(interval, locale),
      })),
    }));
  }

  // Apply RTL formatting to text content if needed
  if (isRTL && translated.description) {
    translated.description = applyRTLFormatting(translated.description);
  }

  return translated;
}

/**
 * Translate a subscription plan for display
 */
export function translatePlan(
  plan: SubscriptionPlan,
  locale: string
): SubscriptionPlan {
  const templates = getBoldTemplates(locale);
  const isRTL = isRTLLocale(locale);
  
  // Format the interval
  const translatedInterval = {
    ...plan.interval,
    label: formatInterval(plan.interval, locale),
  };

  // Translate status based on locale
  const statusTranslations: Record<string, Record<string, string>> = {
    ar: {
      active: 'نشط',
      paused: 'متوقف مؤقتاً',
      cancelled: 'ملغى',
      expired: 'منتهي',
    },
    he: {
      active: 'פעיל',
      paused: 'מושהה',
      cancelled: 'מבוטל',
      expired: 'פג תוקף',
    },
  };

  const translatedStatus = 
    statusTranslations[locale]?.[plan.status] ||
    statusTranslations[locale.split('-')[0]]?.[plan.status] ||
    plan.status;

  return {
    ...plan,
    interval: translatedInterval,
    status: isRTL ? (translatedStatus as SubscriptionPlan['status']) : plan.status,
  };
}

/**
 * Translate customer portal content
 */
export function translatePortal(
  content: PortalContent,
  locale: string
): PortalContent {
  const templates = getBoldTemplates(locale);
  const isRTL = isRTLLocale(locale);

  // Translate sections
  const translatedSections: PortalSection[] = content.sections.map((section) => ({
    ...section,
    title: translateSectionTitle(section.id, templates),
    description: section.description 
      ? isRTL 
        ? applyRTLFormatting(section.description)
        : section.description
      : undefined,
  }));

  // Translate actions
  const translatedActions: PortalAction[] = content.actions.map((action) => ({
    ...action,
    label: translateActionLabel(action.action, templates),
  }));

  // Translate subscriptions
  const translatedSubscriptions = content.subscriptions.map((sub) =>
    translatePlan(sub, locale)
  );

  return {
    ...content,
    title: templates.portal.activeSubscriptions,
    greeting: content.greeting,
    sections: translatedSections,
    actions: translatedActions,
    subscriptions: translatedSubscriptions,
  };
}

/**
 * Apply RTL formatting to text
 * Adds RTL marks and handles text direction
 */
function applyRTLFormatting(text: string): string {
  // Add RTL embedding mark at start and pop directional formatting at end
  return `\u202B${text}\u202C`;
}

/**
 * Translate section title based on section ID
 */
function translateSectionTitle(
  sectionId: string,
  templates: BoldTemplates
): string {
  const titleMap: Record<string, string> = {
    active: templates.portal.activeSubscriptions,
    paused: templates.portal.pausedSubscriptions,
    cancelled: templates.portal.cancelledSubscriptions,
    history: templates.portal.orderHistory,
  };

  return titleMap[sectionId] || sectionId;
}

/**
 * Translate action label based on action type
 */
function translateActionLabel(
  action: string,
  templates: BoldTemplates
): string {
  const actionMap: Record<string, string> = {
    edit: templates.portal.editSubscription,
    pause: templates.portal.pauseSubscription,
    resume: templates.portal.resumeSubscription,
    cancel: templates.portal.cancelSubscription,
    skip: templates.portal.skipOrder,
    updatePayment: templates.portal.updatePayment,
    updateAddress: templates.portal.updateAddress,
    swap: templates.portal.swapProduct,
  };

  return actionMap[action] || action;
}

/**
 * Generate CSS for Bold widget RTL support
 */
export function generateBoldRTLCSS(): string {
  return `
/* Bold Subscriptions RTL Styles */
.bold-subscription-widget[dir="rtl"],
.bold-subscription-widget.rtl {
  direction: rtl;
  text-align: right;
}

.bold-subscription-widget[dir="rtl"] .bold-radio,
.bold-subscription-widget.rtl .bold-radio {
  margin-left: 8px;
  margin-right: 0;
}

.bold-subscription-widget[dir="rtl"] .bold-select,
.bold-subscription-widget.rtl .bold-select {
  background-position: left 8px center;
  padding-left: 32px;
  padding-right: 12px;
}

.bold-subscription-widget[dir="rtl"] .bold-savings-badge,
.bold-subscription-widget.rtl .bold-savings-badge {
  margin-right: 8px;
  margin-left: 0;
}

/* Bold Customer Portal RTL */
.bold-customer-portal[dir="rtl"],
.bold-customer-portal.rtl {
  direction: rtl;
  text-align: right;
}

.bold-customer-portal[dir="rtl"] .bold-portal-sidebar,
.bold-customer-portal.rtl .bold-portal-sidebar {
  border-left: 1px solid #ddd;
  border-right: none;
}

.bold-customer-portal[dir="rtl"] .bold-subscription-card,
.bold-customer-portal.rtl .bold-subscription-card {
  text-align: right;
}

.bold-customer-portal[dir="rtl"] .bold-action-button,
.bold-customer-portal.rtl .bold-action-button {
  margin-left: 8px;
  margin-right: 0;
}
`;
}

/**
 * Get subscription group display info with translations
 */
export function getSubscriptionGroupInfo(
  group: SubscriptionGroup,
  locale: string
): {
  displayName: string;
  intervalOptions: Array<{ id: string; display: string }>;
  savingsMessage?: string;
} {
  const templates = getBoldTemplates(locale);
  
  const intervalOptions = group.intervals.map((interval) => ({
    id: interval.id,
    display: formatInterval(interval, locale),
  }));

  let savingsMessage: string | undefined;
  if (group.discountMessage) {
    savingsMessage = templates.widgets.product.savingsBadge.replace(
      '{amount}',
      group.discountMessage
    );
  }

  return {
    displayName: group.name,
    intervalOptions,
    savingsMessage,
  };
}

/**
 * Format price with proper RTL currency display
 */
export function formatBoldPrice(
  amount: number,
  currency: string,
  locale: string
): string {
  const isRTL = isRTLLocale(locale);
  
  // Format number based on locale
  const numberFormat = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  const formattedNumber = numberFormat.format(amount);
  
  if (isRTL) {
    // For RTL, currency symbol typically comes after the number
    return `${formattedNumber} ${currency}`;
  }
  
  // For LTR
  return `${currency} ${formattedNumber}`;
}

/**
 * Validate subscription content for RTL compatibility
 */
export function validateRTLContent(content: string): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check for mixed directional content issues
  const hasLatinChars = /[a-zA-Z]/.test(content);
  const hasArabicChars = /[\u0600-\u06FF]/.test(content);
  const hasHebrewChars = /[\u0590-\u05FF]/.test(content);

  if ((hasArabicChars || hasHebrewChars) && hasLatinChars) {
    // Check for proper directional marks
    if (!content.includes('\u202B') && !content.includes('\u202A')) {
      issues.push('Mixed directional content without explicit direction marks');
    }
  }

  // Check for proper number formatting in Arabic
  if (hasArabicChars) {
    const westernDigits = /\d/.test(content);
    if (westernDigits) {
      // Western digits are fine, but Eastern Arabic digits are also acceptable
      const hasEasternDigits = /[\u0660-\u0669]/.test(content);
      if (hasEasternDigits && westernDigits) {
        issues.push('Mixed Western and Eastern Arabic digits detected');
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Clear the template cache (useful for testing or locale switching)
 */
export function clearTemplateCache(): void {
  templateCache.clear();
}
