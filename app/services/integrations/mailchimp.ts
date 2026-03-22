/**
 * Mailchimp Integration Service
 * T0203: Integration - Mailchimp Templates
 * 
 * Provides email template translation with merge tag preservation
 */

// Mailchimp merge tag patterns
const MERGE_TAG_PATTERNS = {
  // Standard merge tags: *|FNAME|*, *|EMAIL|*
  standard: /\*\|([^|*]+)\|\*/g,
  // Conditional tags: *|IF:FNAME|*
  conditional: /\*\|IF:([^|*]+)\|\*/gi,
  // End conditional: *|END:IF|*
  endConditional: /\*\|END:IF\|\*/gi,
  // RSS merge tags
  rss: /\*\|RSS:([^|*]+)\|\*/gi,
  // Date tags
  date: /\*\|DATE:([^|*]+)\|\*/gi,
};

export interface MailchimpTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  text?: string;
  type: 'welcome' | 'newsletter' | 'promotional' | 'transactional' | 'automation';
}

export interface MergeTag {
  name: string;
  fullMatch: string;
  type: 'standard' | 'conditional' | 'end' | 'rss' | 'date';
}

// Translations for common email elements
const EMAIL_TRANSLATIONS: Record<string, Record<string, string>> = {
  ar: {
    welcome: 'مرحباً',
    greeting: 'مرحباً بك',
    dear: 'عزيزي',
    hello: 'أهلاً',
    thank_you: 'شكراً لك',
    thanks: 'شكراً',
    order_confirmation: 'تأكيد الطلب',
    shipping_update: 'تحديث الشحن',
    special_offer: 'عرض خاص',
    newsletter: 'النشرة البريدية',
    unsubscribe: 'إلغاء الاشتراك',
    view_online: 'عرض في المتصفح',
    update_preferences: 'تحديث التفضيلات',
    contact_us: 'اتصل بنا',
    follow_us: 'تابعنا',
    privacy_policy: 'سياسة الخصوصية',
    terms: 'الشروط والأحكام',
    shop_now: 'تسوق الآن',
    learn_more: 'اعرف المزيد',
    get_started: 'ابدأ الآن',
    claim_offer: 'احصل على العرض',
  },
  he: {
    welcome: 'ברוך הבא',
    greeting: 'שלום',
    dear: 'לכבוד',
    hello: 'שלום',
    thank_you: 'תודה רבה',
    thanks: 'תודה',
    order_confirmation: 'אישור הזמנה',
    shipping_update: 'עדכון משלוח',
    special_offer: 'הצעה מיוחדת',
    newsletter: 'ניוזלטר',
    unsubscribe: 'בטל מנוי',
    view_online: 'צפה בדפדפן',
    update_preferences: 'עדכן העדפות',
    contact_us: 'צור קשר',
    follow_us: 'עקוב אחרינו',
    privacy_policy: 'מדיניות פרטיות',
    terms: 'תנאי שימוש',
    shop_now: 'קנה עכשיו',
    learn_more: 'למד עוד',
    get_started: 'התחל עכשיו',
    claim_offer: 'קבל הצעה',
  },
  en: {
    welcome: 'Welcome',
    greeting: 'Welcome',
    dear: 'Dear',
    hello: 'Hello',
    thank_you: 'Thank you',
    thanks: 'Thanks',
    order_confirmation: 'Order Confirmation',
    shipping_update: 'Shipping Update',
    special_offer: 'Special Offer',
    newsletter: 'Newsletter',
    unsubscribe: 'Unsubscribe',
    view_online: 'View in Browser',
    update_preferences: 'Update Preferences',
    contact_us: 'Contact Us',
    follow_us: 'Follow Us',
    privacy_policy: 'Privacy Policy',
    terms: 'Terms & Conditions',
    shop_now: 'Shop Now',
    learn_more: 'Learn More',
    get_started: 'Get Started',
    claim_offer: 'Claim Offer',
  },
};

/**
 * Extract all merge tags from Mailchimp template
 */
export function extractMergeTags(template: string): MergeTag[] {
  const tags: MergeTag[] = [];
  const seen = new Set<string>();

  // Extract standard merge tags
  let match;
  const standardRegex = new RegExp(MERGE_TAG_PATTERNS.standard.source, 'g');
  while ((match = standardRegex.exec(template)) !== null) {
    const fullMatch = match[0];
    if (!seen.has(fullMatch)) {
      seen.add(fullMatch);
      tags.push({
        name: match[1].trim(),
        fullMatch,
        type: 'standard',
      });
    }
  }

  // Extract conditional tags
  const condRegex = new RegExp(MERGE_TAG_PATTERNS.conditional.source, 'gi');
  while ((match = condRegex.exec(template)) !== null) {
    const fullMatch = match[0];
    if (!seen.has(fullMatch)) {
      seen.add(fullMatch);
      tags.push({
        name: match[1].trim(),
        fullMatch,
        type: 'conditional',
      });
    }
  }

  // Extract RSS tags
  const rssRegex = new RegExp(MERGE_TAG_PATTERNS.rss.source, 'gi');
  while ((match = rssRegex.exec(template)) !== null) {
    const fullMatch = match[0];
    if (!seen.has(fullMatch)) {
      seen.add(fullMatch);
      tags.push({
        name: match[1].trim(),
        fullMatch,
        type: 'rss',
      });
    }
  }

  // Extract date tags
  const dateRegex = new RegExp(MERGE_TAG_PATTERNS.date.source, 'gi');
  while ((match = dateRegex.exec(template)) !== null) {
    const fullMatch = match[0];
    if (!seen.has(fullMatch)) {
      seen.add(fullMatch);
      tags.push({
        name: match[1].trim(),
        fullMatch,
        type: 'date',
      });
    }
  }

  return tags;
}

/**
 * Protect merge tags by replacing with placeholders
 */
export function protectMergeTags(template: string): {
  protectedTemplate: string;
  placeholders: Map<string, string>;
} {
  const placeholders = new Map<string, string>();
  let counter = 0;

  // Replace all merge tag patterns
  const protectedTemplate = template
    .replace(MERGE_TAG_PATTERNS.standard, (match) => {
      const key = `__MC_TAG_${counter++}__`;
      placeholders.set(key, match);
      return key;
    })
    .replace(MERGE_TAG_PATTERNS.conditional, (match) => {
      const key = `__MC_COND_${counter++}__`;
      placeholders.set(key, match);
      return key;
    })
    .replace(MERGE_TAG_PATTERNS.endConditional, (match) => {
      const key = `__MC_END_${counter++}__`;
      placeholders.set(key, match);
      return key;
    })
    .replace(MERGE_TAG_PATTERNS.rss, (match) => {
      const key = `__MC_RSS_${counter++}__`;
      placeholders.set(key, match);
      return key;
    })
    .replace(MERGE_TAG_PATTERNS.date, (match) => {
      const key = `__MC_DATE_${counter++}__`;
      placeholders.set(key, match);
      return key;
    });

  return { protectedTemplate, placeholders };
}

/**
 * Restore merge tags after translation
 */
export function restoreMergeTags(
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
 * Translate template content
 */
function translateTemplateContent(content: string, locale: string): string {
  const translations = EMAIL_TRANSLATIONS[locale] || EMAIL_TRANSLATIONS.en;
  let translated = content;

  // Replace common email terms
  Object.entries(EMAIL_TRANSLATIONS.en).forEach(([key, englishText]) => {
    const localizedText = translations[key];
    if (localizedText && localizedText !== englishText) {
      // Case-insensitive replacement for whole words
      const regex = new RegExp(`\\b${englishText}\\b`, 'gi');
      translated = translated.replace(regex, localizedText);
    }
  });

  return translated;
}

/**
 * Apply RTL formatting for Arabic/Hebrew
 */
export function applyRTLFormatting(html: string, locale: string): string {
  const isRTL = ['ar', 'he', 'fa', 'ur'].includes(locale.split('-')[0]?.toLowerCase());
  
  if (!isRTL) return html;

  let formatted = html;
  
  // Add dir="rtl" to body
  if (!formatted.includes('dir=')) {
    formatted = formatted.replace(/<body/i, '<body dir="rtl"');
  }

  // Add RTL styles
  const rtlStyles = `
    <style>
      body[dir="rtl"] { direction: rtl; text-align: right; }
      body[dir="rtl"] .text-left { text-align: right !important; }
      body[dir="rtl"] .text-right { text-align: left !important; }
      body[dir="rtl"] table { direction: rtl; }
      body[dir="rtl"] td { text-align: right; }
    </style>
  `;

  if (!formatted.includes('dir="rtl"')) {
    formatted = formatted.replace('</head>', `${rtlStyles}</head>`);
  }

  return formatted;
}

/**
 * Main translation function
 */
export function translateMailchimpTemplate(
  template: string,
  targetLocale: string,
  options: { applyRTL?: boolean } = {}
): string {
  const locale = targetLocale.split('-')[0]?.toLowerCase() || 'en';
  
  // Protect merge tags
  const { protectedTemplate, placeholders } = protectMergeTags(template);
  
  // Translate content
  let translated = translateTemplateContent(protectedTemplate, locale);
  
  // Restore merge tags
  translated = restoreMergeTags(translated, placeholders);
  
  // Apply RTL if needed
  if (options.applyRTL !== false && ['ar', 'he', 'fa', 'ur'].includes(locale)) {
    translated = applyRTLFormatting(translated, locale);
  }
  
  return translated;
}

/**
 * Get Mailchimp template by type
 */
export function getMailchimpTemplate(
  type: MailchimpTemplate['type'],
  locale: string
): Partial<MailchimpTemplate> {
  const translations = EMAIL_TRANSLATIONS[locale] || EMAIL_TRANSLATIONS.en;
  
  const templates: Record<string, Partial<MailchimpTemplate>> = {
    welcome: {
      subject: translations.welcome,
      type: 'welcome',
    },
    newsletter: {
      subject: translations.newsletter,
      type: 'newsletter',
    },
    promotional: {
      subject: translations.special_offer,
      type: 'promotional',
    },
    transactional: {
      subject: translations.order_confirmation,
      type: 'transactional',
    },
    automation: {
      subject: translations.welcome,
      type: 'automation',
    },
  };
  
  return templates[type] || { type: 'newsletter' };
}

/**
 * Check if template has merge tags
 */
export function hasMergeTags(template: string): boolean {
  return MERGE_TAG_PATTERNS.standard.test(template);
}

/**
 * Get supported template types
 */
export function getSupportedTemplateTypes(): Array<{
  type: MailchimpTemplate['type'];
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
      type: 'newsletter',
      name: 'Newsletter',
      description: 'Regular newsletter content',
    },
    {
      type: 'promotional',
      name: 'Promotional',
      description: 'Sales and special offers',
    },
    {
      type: 'transactional',
      name: 'Transactional',
      description: 'Order confirmations, shipping updates',
    },
    {
      type: 'automation',
      name: 'Automation',
      description: 'Automated email sequences',
    },
  ];
}
