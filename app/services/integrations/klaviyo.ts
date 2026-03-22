/**
 * Klaviyo Email Template Translation Service
 * T0201: Integration - Klaviyo Email Templates
 */

export interface KlaviyoTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  text?: string;
  type: 'welcome' | 'abandoned_cart' | 'order_confirm' | 'shipping' | 'custom';
}

export interface KlaviyoVariable {
  name: string;
  type: 'event' | 'person' | 'organization' | 'template';
  fullMatch: string;
}

// Klaviyo template variable patterns
const KLAVIYO_PATTERNS = {
  variable: /{{\s*([^}]+)\s*}}/g,
  tag: /{%\s*([^%]+)\s*%}/g,
  comment: /{#\s*([^#]+)\s*#}/g,
};

// Arabic translations for common email elements
const ARABIC_EMAIL_LABELS = {
  welcome: 'مرحباً بك',
  greeting: 'مرحباً',
  dear: 'عزيزي',
  thank_you: 'شكراً لك',
  order_confirmation: 'تأكيد الطلب',
  shipping_notification: 'إشعار الشحن',
  abandoned_cart: 'سلة التسوق المتروكة',
  view_order: 'عرض الطلب',
  track_shipment: 'تتبع الشحنة',
  continue_shopping: 'مواصلة التسوق',
  unsubscribe: 'إلغاء الاشتراك',
  view_in_browser: 'عرض في المتصفح',
  update_preferences: 'تحديث التفضيلات',
  contact_us: 'اتصل بنا',
  privacy_policy: 'سياسة الخصوصية',
  terms_of_service: 'شروط الخدمة',
};

// Hebrew translations
const HEBREW_EMAIL_LABELS = {
  welcome: 'ברוך הבא',
  greeting: 'שלום',
  dear: 'לכבוד',
  thank_you: 'תודה רבה',
  order_confirmation: 'אישור הזמנה',
  shipping_notification: 'עדכון משלוח',
  abandoned_cart: 'עגלת קניות נטושה',
  view_order: 'צפה בהזמנה',
  track_shipment: 'מעקב אחרי המשלוח',
  continue_shopping: 'המשך בקניות',
  unsubscribe: 'בטל מנוי',
  view_in_browser: 'צפה בדפדפן',
  update_preferences: 'עדכן העדפות',
  contact_us: 'צור קשר',
  privacy_policy: 'מדיניות פרטיות',
  terms_of_service: 'תנאי שירות',
};

const EMAIL_LABELS: Record<string, Record<string, string>> = {
  ar: ARABIC_EMAIL_LABELS,
  he: HEBREW_EMAIL_LABELS,
  en: {
    welcome: 'Welcome',
    greeting: 'Hello',
    dear: 'Dear',
    thank_you: 'Thank you',
    order_confirmation: 'Order Confirmation',
    shipping_notification: 'Shipping Notification',
    abandoned_cart: 'Abandoned Cart',
    view_order: 'View Order',
    track_shipment: 'Track Shipment',
    continue_shopping: 'Continue Shopping',
    unsubscribe: 'Unsubscribe',
    view_in_browser: 'View in Browser',
    update_preferences: 'Update Preferences',
    contact_us: 'Contact Us',
    privacy_policy: 'Privacy Policy',
    terms_of_service: 'Terms of Service',
  },
};

/**
 * Extract Klaviyo variables from template
 */
export function extractKlaviyoVariables(template: string): KlaviyoVariable[] {
  const variables: KlaviyoVariable[] = [];
  const seen = new Set<string>();

  // Create new regex to avoid state issues
  const regex = new RegExp(KLAVIYO_PATTERNS.variable.source, 'g');
  let match;
  while ((match = regex.exec(template)) !== null) {
    const fullMatch = match[0];
    const content = match[1].trim();
    
    if (!seen.has(fullMatch)) {
      seen.add(fullMatch);
      const parts = content.split('.');
      variables.push({
        name: parts[parts.length - 1] || content,
        type: parts[0] as KlaviyoVariable['type'],
        fullMatch,
      });
    }
  }

  return variables;
}

/**
 * Extract Klaviyo tags (control flow)
 */
export function extractKlaviyoTags(template: string): Array<{
  type: string;
  content: string;
  fullMatch: string;
}> {
  const tags: Array<{ type: string; content: string; fullMatch: string }> = [];
  
  // Create new regex to avoid state issues
  const regex = new RegExp(KLAVIYO_PATTERNS.tag.source, 'g');
  let match;

  while ((match = regex.exec(template)) !== null) {
    const content = match[1].trim();
    const parts = content.split(/\s+/);
    tags.push({
      type: parts[0] || 'unknown',
      content,
      fullMatch: match[0],
    });
  }

  return tags;
}

/**
 * Replace template variables with placeholders
 */
export function protectKlaviyoSyntax(template: string): {
  protectedTemplate: string;
  placeholders: Map<string, string>;
} {
  const placeholders = new Map<string, string>();
  let counter = 0;

  const protectedTemplate = template
    .replace(KLAVIYO_PATTERNS.variable, (match) => {
      const key = `__KLAVIYO_VAR_${counter++}__`;
      placeholders.set(key, match);
      return key;
    })
    .replace(KLAVIYO_PATTERNS.tag, (match) => {
      const key = `__KLAVIYO_TAG_${counter++}__`;
      placeholders.set(key, match);
      return key;
    })
    .replace(KLAVIYO_PATTERNS.comment, (match) => {
      const key = `__KLAVIYO_COMMENT_${counter++}__`;
      placeholders.set(key, match);
      return key;
    });

  return { protectedTemplate, placeholders };
}

/**
 * Restore Klaviyo syntax after translation
 */
export function restoreKlaviyoSyntax(
  translatedTemplate: string,
  placeholders: Map<string, string>
): string {
  let result = translatedTemplate;
  placeholders.forEach((original, placeholder) => {
    result = result.replace(placeholder, original);
  });
  return result;
}

/**
 * Translate email template content
 */
function translateEmailContent(content: string, locale: string): string {
  const labels = EMAIL_LABELS[locale] || EMAIL_LABELS.en;
  let translated = content;

  // Replace common email labels
  Object.entries(EMAIL_LABELS.en).forEach(([key, englishText]) => {
    const localizedText = labels[key];
    if (localizedText && localizedText !== englishText) {
      const regex = new RegExp(`\\b${englishText}\\b`, 'gi');
      translated = translated.replace(regex, localizedText);
    }
  });

  return translated;
}

/**
 * Apply RTL formatting to HTML email
 */
export function applyRTLEmailFormatting(html: string, locale: string): string {
  const isRTL = ['ar', 'he', 'fa', 'ur'].includes(locale.split('-')[0]?.toLowerCase());
  
  if (!isRTL) return html;

  // Add RTL direction to HTML
  let formatted = html;
  
  // Add dir="rtl" to body or main container
  if (!formatted.includes('dir=')) {
    formatted = formatted.replace(
      /<body/i,
      '<body dir="rtl"'
    );
  }

  // Add RTL CSS
  const rtlStyles = `
    <style>
      body[dir="rtl"] { direction: rtl; text-align: right; }
      body[dir="rtl"] .text-left { text-align: right; }
      body[dir="rtl"] .text-right { text-align: left; }
      body[dir="rtl"] table { direction: rtl; }
    </style>
  `;

  if (!formatted.includes('dir="rtl"')) {
    formatted = formatted.replace('</head>', `${rtlStyles}</head>`);
  }

  return formatted;
}

/**
 * Validate RTL email content
 */
export function validateRTLEmail(content: string): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check for RTL direction
  if (!content.includes('dir="rtl"') && !content.includes('dir=rtl')) {
    issues.push('Missing RTL direction attribute');
  }

  // Check for proper text alignment
  if (content.includes('text-align: left') && !content.includes('dir="rtl"')) {
    issues.push('Potential alignment issue: left alignment without RTL context');
  }

  // Check for preserved variables
  const hasProtectedVars = /__KLAVIYO_VAR_\d+__/.test(content);
  if (hasProtectedVars) {
    issues.push('Unrestored Klaviyo variables found');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Main translation function for Klaviyo templates
 */
export function translateKlaviyoTemplate(
  template: string,
  targetLocale: string,
  options: { applyRTL?: boolean; preserveSubject?: boolean } = {}
): string {
  const locale = targetLocale.split('-')[0]?.toLowerCase() || 'en';
  
  // Protect Klaviyo syntax
  const { protectedTemplate, placeholders } = protectKlaviyoSyntax(template);
  
  // Translate content
  let translated = translateEmailContent(protectedTemplate, locale);
  
  // Restore Klaviyo syntax
  translated = restoreKlaviyoSyntax(translated, placeholders);
  
  // Apply RTL formatting if requested
  if (options.applyRTL !== false && ['ar', 'he', 'fa', 'ur'].includes(locale)) {
    translated = applyRTLEmailFormatting(translated, locale);
  }
  
  return translated;
}

/**
 * Get Klaviyo template by type
 */
export function getKlaviyoTemplate(
  type: KlaviyoTemplate['type'],
  locale: string
): Partial<KlaviyoTemplate> {
  const labels = EMAIL_LABELS[locale] || EMAIL_LABELS.en;
  
  const templates: Record<string, Partial<KlaviyoTemplate>> = {
    welcome: {
      subject: labels.welcome,
      type: 'welcome',
    },
    abandoned_cart: {
      subject: labels.abandoned_cart,
      type: 'abandoned_cart',
    },
    order_confirm: {
      subject: labels.order_confirmation,
      type: 'order_confirm',
    },
    shipping: {
      subject: labels.shipping_notification,
      type: 'shipping',
    },
  };
  
  return templates[type] || { type: 'custom' };
}

/**
 * Detect if content has Klaviyo variables
 */
export function hasKlaviyoVariables(content: string): boolean {
  const regex = new RegExp(KLAVIYO_PATTERNS.variable.source);
  return regex.test(content);
}

/**
 * Get supported Klaviyo template types
 */
export function getSupportedTemplateTypes(): Array<{
  type: KlaviyoTemplate['type'];
  name: string;
  description: string;
}> {
  return [
    {
      type: 'welcome',
      name: 'Welcome Email',
      description: 'Sent to new subscribers',
    },
    {
      type: 'abandoned_cart',
      name: 'Abandoned Cart',
      description: 'Sent when customer leaves items in cart',
    },
    {
      type: 'order_confirm',
      name: 'Order Confirmation',
      description: 'Sent after purchase',
    },
    {
      type: 'shipping',
      name: 'Shipping Notification',
      description: 'Sent when order ships',
    },
    {
      type: 'custom',
      name: 'Custom Template',
      description: 'User-defined template',
    },
  ];
}
