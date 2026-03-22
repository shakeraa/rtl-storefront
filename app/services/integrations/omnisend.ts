/**
 * Omnisend Integration Service
 * T0202: Integration - Omnisend Campaigns
 * 
 * Handles translation of Omnisend email campaigns, automation workflows, and SMS content
 * while preserving merge tags and dynamic content.
 */

// Omnisend merge tag patterns that should be preserved during translation
const OMNISEND_MERGE_TAGS = [
  // Contact merge tags
  /\{\{\s*contact\.\w+\s*\}\}/g,
  /\{\{\s*contact\.firstName\s*\}\}/gi,
  /\{\{\s*contact\.lastName\s*\}\}/gi,
  /\{\{\s*contact\.email\s*\}\}/gi,
  /\{\{\s*contact\.phone\s*\}\}/gi,
  /\{\{\s*contact\.address\s*\}\}/gi,
  /\{\{\s*contact\.city\s*\}\}/gi,
  /\{\{\s*contact\.country\s*\}\}/gi,
  /\{\{\s*contact\.postalCode\s*\}\}/gi,
  /\{\{\s*contact\.birthday\s*\}\}/gi,
  /\{\{\s*contact\.company\s*\}\}/gi,
  /\{\{\s*contact\.title\s*\}\}/gi,
  
  // Order merge tags
  /\{\{\s*order\.\w+\s*\}\}/g,
  /\{\{\s*order\.id\s*\}\}/gi,
  /\{\{\s*order\.number\s*\}\}/gi,
  /\{\{\s*order\.total\s*\}\}/gi,
  /\{\{\s*order\.subtotal\s*\}\}/gi,
  /\{\{\s*order\.tax\s*\}\}/gi,
  /\{\{\s*order\.shipping\s*\}\}/gi,
  /\{\{\s*order\.discount\s*\}\}/gi,
  /\{\{\s*order\.currency\s*\}\}/gi,
  /\{\{\s*order\.date\s*\}\}/gi,
  /\{\{\s*order\.status\s*\}\}/gi,
  /\{\{\s*order\.trackingNumber\s*\}\}/gi,
  /\{\{\s*order\.trackingUrl\s*\}\}/gi,
  
  // Product merge tags
  /\{\{\s*product\.\w+\s*\}\}/g,
  /\{\{\s*product\.name\s*\}\}/gi,
  /\{\{\s*product\.price\s*\}\}/gi,
  /\{\{\s*product\.sku\s*\}\}/gi,
  /\{\{\s*product\.url\s*\}\}/gi,
  /\{\{\s*product\.imageUrl\s*\}\}/gi,
  /\{\{\s*product\.description\s*\}\}/gi,
  
  // Cart merge tags
  /\{\{\s*cart\.\w+\s*\}\}/g,
  /\{\{\s*cart\.total\s*\}\}/gi,
  /\{\{\s*cart\.itemCount\s*\}\}/gi,
  /\{\{\s*cart\.abandonedUrl\s*\}\}/gi,
  /\{\{\s*cart\.recoveryUrl\s*\}\}/gi,
  
  // Campaign merge tags
  /\{\{\s*campaign\.\w+\s*\}\}/g,
  /\{\{\s*campaign\.name\s*\}\}/gi,
  /\{\{\s*campaign\.subject\s*\}\}/gi,
  
  // Shop/Store merge tags
  /\{\{\s*shop\.\w+\s*\}\}/g,
  /\{\{\s*shop\.name\s*\}\}/gi,
  /\{\{\s*shop\.url\s*\}\}/gi,
  /\{\{\s*shop\.email\s*\}\}/gi,
  /\{\{\s*shop\.phone\s*\}\}/gi,
  /\{\{\s*shop\.address\s*\}\}/gi,
  
  // Store (alternative) merge tags
  /\{\{\s*store\.\w+\s*\}\}/g,
  /\{\{\s*store\.name\s*\}\}/gi,
  /\{\{\s*store\.url\s*\}\}/gi,
  
  // URL/Link merge tags
  /\{\{\s*unsubscribeUrl\s*\}\}/gi,
  /\{\{\s*viewInBrowserUrl\s*\}\}/gi,
  /\{\{\s*preferencesUrl\s*\}\}/gi,
  /\{\{\s*unsubscribe_link\s*\}\}/gi,
  /\{\{\s*browser_link\s*\}\}/gi,
  
  // Date merge tags
  /\{\{\s*current_date\s*\}\}/gi,
  /\{\{\s*current_year\s*\}\}/gi,
  /\{\{\s*current_month\s*\}\}/gi,
  
  // Conditional blocks
  /\{\{#if\s+[^}]+\}\}/g,
  /\{\{\/if\}\}/g,
  /\{\{#each\s+[^}]+\}\}/g,
  /\{\{\/each\}\}/g,
  /\{\{else\}\}/g,
  
  // Dynamic content blocks
  /\{%\s*[^%]+%\}/g,
  
  // Coupon/Discount merge tags
  /\{\{\s*coupon\.\w+\s*\}\}/g,
  /\{\{\s*coupon\.code\s*\}\}/gi,
  /\{\{\s*coupon\.discount\s*\}\}/gi,
  /\{\{\s*coupon\.expiryDate\s*\}\}/gi,
  /\{\{\s*discount\.\w+\s*\}\}/g,
  
  // Recommendation merge tags
  /\{\{\s*recommendations\.\w+\s*\}\}/g,
  /\{\{\s*recommendations\s*\}\}/gi,
];

// Combined regex for all merge tags
const ALL_MERGE_TAGS_REGEX = new RegExp(
  OMNISEND_MERGE_TAGS.map(r => r.source).join('|'),
  'gi'
);

/**
 * Omnisend Campaign structure
 */
export interface OmnisendCampaign {
  campaignId: string;
  name: string;
  subject: string;
  preheader?: string;
  htmlContent: string;
  textContent?: string;
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
  language?: string;
  status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  metadata?: Record<string, unknown>;
}

/**
 * Omnisend Automation Workflow structure
 */
export interface OmnisendAutomationWorkflow {
  workflowId: string;
  name: string;
  triggerType: 'welcome' | 'abandoned_cart' | 'browse_abandonment' | 'post_purchase' | 'custom';
  enabled: boolean;
  emails: OmnisendAutomationEmail[];
  smsMessages?: OmnisendSMSMessage[];
  metadata?: Record<string, unknown>;
}

/**
 * Omnisend Automation Email structure
 */
export interface OmnisendAutomationEmail {
  emailId: string;
  name: string;
  subject: string;
  preheader?: string;
  htmlContent: string;
  textContent?: string;
  delayDays?: number;
  delayHours?: number;
  delayMinutes?: number;
  fromName?: string;
  fromEmail?: string;
  conditionalLogic?: string;
}

/**
 * Omnisend SMS Message structure
 */
export interface OmnisendSMSMessage {
  messageId: string;
  content: string;
  delayDays?: number;
  delayHours?: number;
  delayMinutes?: number;
  conditionalLogic?: string;
}

/**
 * Omnisend Template structure
 */
export interface OmnisendTemplate {
  templateId: string;
  name: string;
  type: 'email' | 'sms';
  htmlContent?: string;
  textContent?: string;
  smsContent?: string;
  thumbnailUrl?: string;
  category?: string;
  tags?: string[];
  language?: string;
}

/**
 * Translation result for campaigns
 */
export interface TranslatedCampaign extends OmnisendCampaign {
  translatedAt: string;
  targetLocale: string;
  originalLanguage?: string;
}

/**
 * Translation result for automation workflows
 */
export interface TranslatedAutomation extends OmnisendAutomationWorkflow {
  translatedAt: string;
  targetLocale: string;
  originalLanguage?: string;
}

/**
 * Translation result for SMS
 */
export interface TranslatedSMS {
  messageId: string;
  originalContent: string;
  translatedContent: string;
  targetLocale: string;
  translatedAt: string;
  characterCount: number;
  segmentCount: number;
}

/**
 * Extract merge tags from content and return them with placeholders
 */
function extractMergeTags(content: string): { 
  cleanedContent: string; 
  tags: string[]; 
  placeholders: string[];
} {
  const tags: string[] = [];
  const placeholders: string[] = [];
  let tagIndex = 0;
  
  const cleanedContent = content.replace(ALL_MERGE_TAGS_REGEX, (match) => {
    const placeholder = `__OMNISEND_TAG_${tagIndex}__`;
    tags.push(match);
    placeholders.push(placeholder);
    tagIndex++;
    return placeholder;
  });
  
  return { cleanedContent, tags, placeholders };
}

/**
 * Restore merge tags from placeholders
 */
function restoreMergeTags(content: string, tags: string[], placeholders: string[]): string {
  let result = content;
  for (let i = 0; i < tags.length; i++) {
    result = result.replace(placeholders[i], tags[i]);
  }
  return result;
}

/**
 * Simple mock translation function (to be replaced with actual translation service)
 * In production, this would integrate with the translation engine
 */
async function translateText(text: string, targetLocale: string): Promise<string> {
  if (!text || text.trim().length === 0) {
    return text;
  }
  
  // Arabic translations for common email marketing terms
  const arabicTranslations: Record<string, string> = {
    'hello': 'مرحبا',
    'hi': 'مرحبا',
    'dear': 'عزيزي',
    'customer': 'عميل',
    'welcome': 'أهلا وسهلا',
    'thank you': 'شكرا لك',
    'thanks': 'شكرا',
    'order': 'طلب',
    'purchase': 'شراء',
    'cart': 'سلة التسوق',
    'abandoned': 'مهجور',
    'complete your order': 'أكمل طلبك',
    'checkout': 'الدفع',
    'discount': 'خصم',
    'sale': 'تخفيض',
    'special offer': 'عرض خاص',
    'limited time': 'وقت محدود',
    'free shipping': 'شحن مجاني',
    'shop now': 'تسوق الآن',
    'buy now': 'اشتر الآن',
    'view products': 'عرض المنتجات',
    'view details': 'عرض التفاصيل',
    'click here': 'اضغط هنا',
    'unsubscribe': 'إلغاء الاشتراك',
    'update preferences': 'تحديث التفضيلات',
    'view in browser': 'عرض في المتصفح',
    'new arrival': 'وصل حديثا',
    'best seller': 'الأكثر مبيعا',
    'recommended for you': 'موصى به لك',
    'you may also like': 'قد يعجبك أيضا',
    'follow us': 'تابعنا',
    'contact us': 'اتصل بنا',
    'help': 'مساعدة',
    'support': 'دعم',
    'terms': 'الشروط',
    'privacy policy': 'سياسة الخصوصية',
    'shipping': 'الشحن',
    'returns': 'الإرجاع',
    'track your order': 'تتبع طلبك',
    'your order is confirmed': 'تم تأكيد طلبك',
    'order shipped': 'تم شحن الطلب',
    'order delivered': 'تم توصيل الطلب',
    'password reset': 'إعادة تعيين كلمة المرور',
    'verify your email': 'تحقق من بريدك الإلكتروني',
    'welcome to': 'مرحبا بك في',
    'we miss you': 'نحن نفتقدك',
    'come back': 'عد إلينا',
    'exclusive': 'حصري',
    'members only': 'للأعضاء فقط',
    'vip': 'كبار الشخصيات',
    'reward': 'مكافأة',
    'points': 'نقاط',
    'birthday': 'عيد الميلاد',
    'anniversary': 'الذكرى السنوية',
    'gift': 'هدية',
    'coupon': 'قسيمة',
    'promo code': 'رمز ترويجي',
    'expiring soon': 'تنتهي قريبا',
    'last chance': 'الفرصة الأخيرة',
    'don\'t miss out': 'لا تفوت الفرصة',
    'hurry': 'أسرع',
    'today only': 'اليوم فقط',
    'while supplies last': 'حتى نفاد الكمية',
  };
  
  // Hebrew translations
  const hebrewTranslations: Record<string, string> = {
    'hello': 'שלום',
    'hi': 'היי',
    'dear': 'יקר',
    'customer': 'לקוח',
    'welcome': 'ברוך הבא',
    'thank you': 'תודה לך',
    'thanks': 'תודה',
    'order': 'הזמנה',
    'purchase': 'רכישה',
    'cart': 'עגלת קניות',
    'abandoned': 'ניטש',
    'complete your order': 'השלם את ההזמנה שלך',
    'checkout': 'תשלום',
    'discount': 'הנחה',
    'sale': 'מבצע',
    'special offer': 'הצעה מיוחדת',
    'limited time': 'זמן מוגבל',
    'free shipping': 'משלוח חינם',
    'shop now': 'קנה עכשיו',
    'buy now': 'קנה עכשיו',
    'unsubscribe': 'ביטול מינוי',
  };
  
  const translations = targetLocale.startsWith('ar') ? arabicTranslations : 
                      targetLocale.startsWith('he') ? hebrewTranslations : null;
  
  if (!translations) {
    // Fallback for unsupported locales
    return `[${targetLocale}] ${text}`;
  }
  
  // Simple translation by replacement (case-insensitive)
  let translated = text;
  const lowerText = text.toLowerCase();
  
  for (const [key, value] of Object.entries(translations)) {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    translated = translated.replace(regex, value);
  }
  
  // If no translation was applied, mark it
  if (translated === text) {
    return `[${targetLocale}] ${text}`;
  }
  
  return translated;
}

/**
 * Translate HTML content while preserving merge tags and HTML structure
 */
async function translateHtmlContent(htmlContent: string, targetLocale: string): Promise<string> {
  if (!htmlContent) return htmlContent;
  
  // Extract merge tags
  const { cleanedContent, tags, placeholders } = extractMergeTags(htmlContent);
  
  // Extract translatable text from HTML
  // Match text content between tags, excluding script and style tags
  const textRegex = />([^<]+)</g;
  const textMatches: Array<{ fullMatch: string; text: string; index: number }> = [];
  
  let match;
  const tempContent = cleanedContent;
  while ((match = textRegex.exec(tempContent)) !== null) {
    const text = match[1].trim();
    if (text.length > 0 && !text.match(/^\s*$/)) {
      textMatches.push({
        fullMatch: match[0],
        text: match[1],
        index: match.index,
      });
    }
  }
  
  // Translate each text segment
  let translatedContent = cleanedContent;
  let offset = 0;
  
  for (const { text } of textMatches) {
    const trimmedText = text.trim();
    if (trimmedText.length > 0) {
      const translated = await translateText(trimmedText, targetLocale);
      // Replace preserving whitespace
      const leadingSpace = text.match(/^\s*/)?.[0] || '';
      const trailingSpace = text.match(/\s*$/)?.[0] || '';
      translatedContent = translatedContent.replace(
        text,
        leadingSpace + translated + trailingSpace
      );
    }
  }
  
  // Restore merge tags
  return restoreMergeTags(translatedContent, tags, placeholders);
}

/**
 * Translate plain text content while preserving merge tags
 */
async function translateTextContent(textContent: string, targetLocale: string): Promise<string> {
  if (!textContent) return textContent;
  
  // Extract merge tags
  const { cleanedContent, tags, placeholders } = extractMergeTags(textContent);
  
  // Translate the cleaned content
  const translated = await translateText(cleanedContent, targetLocale);
  
  // Restore merge tags
  return restoreMergeTags(translated, tags, placeholders);
}

/**
 * Translate an Omnisend campaign
 * @param campaign - The campaign to translate
 * @param locale - Target locale (e.g., 'ar', 'he', 'ar-SA', 'he-IL')
 * @returns Translated campaign
 */
export async function translateCampaign(
  campaign: OmnisendCampaign,
  locale: string
): Promise<TranslatedCampaign> {
  const originalLanguage = campaign.language || 'en';
  
  // Translate subject line
  const translatedSubject = await translateTextContent(campaign.subject, locale);
  
  // Translate preheader if exists
  const translatedPreheader = campaign.preheader 
    ? await translateTextContent(campaign.preheader, locale)
    : undefined;
  
  // Translate HTML content
  const translatedHtmlContent = await translateHtmlContent(campaign.htmlContent, locale);
  
  // Translate text content if exists
  const translatedTextContent = campaign.textContent
    ? await translateTextContent(campaign.textContent, locale)
    : undefined;
  
  // Translate from name if exists
  const translatedFromName = campaign.fromName
    ? await translateText(campaign.fromName, locale)
    : undefined;
  
  return {
    ...campaign,
    subject: translatedSubject,
    preheader: translatedPreheader,
    htmlContent: translatedHtmlContent,
    textContent: translatedTextContent,
    fromName: translatedFromName,
    language: locale,
    originalLanguage,
    translatedAt: new Date().toISOString(),
    targetLocale: locale,
  };
}

/**
 * Translate an Omnisend automation workflow
 * @param workflow - The workflow to translate
 * @param locale - Target locale
 * @returns Translated workflow
 */
export async function translateAutomation(
  workflow: OmnisendAutomationWorkflow,
  locale: string
): Promise<TranslatedAutomation> {
  // Translate each email in the workflow
  const translatedEmails: OmnisendAutomationEmail[] = [];
  
  for (const email of workflow.emails) {
    const translatedEmail: OmnisendAutomationEmail = {
      ...email,
      subject: await translateTextContent(email.subject, locale),
      preheader: email.preheader 
        ? await translateTextContent(email.preheader, locale)
        : undefined,
      htmlContent: await translateHtmlContent(email.htmlContent, locale),
      textContent: email.textContent
        ? await translateTextContent(email.textContent, locale)
        : undefined,
      fromName: email.fromName
        ? await translateText(email.fromName, locale)
        : undefined,
    };
    translatedEmails.push(translatedEmail);
  }
  
  // Translate SMS messages if any
  const translatedSmsMessages: OmnisendSMSMessage[] = [];
  
  if (workflow.smsMessages) {
    for (const sms of workflow.smsMessages) {
      const translatedSms: OmnisendSMSMessage = {
        ...sms,
        content: await translateTextContent(sms.content, locale),
      };
      translatedSmsMessages.push(translatedSms);
    }
  }
  
  return {
    ...workflow,
    name: await translateText(workflow.name, locale),
    emails: translatedEmails,
    smsMessages: translatedSmsMessages.length > 0 ? translatedSmsMessages : undefined,
    translatedAt: new Date().toISOString(),
    targetLocale: locale,
    originalLanguage: 'en',
  };
}

/**
 * Translate SMS content
 * Handles the shorter character limits and specific constraints of SMS
 * @param content - SMS content to translate
 * @param locale - Target locale
 * @returns Translated SMS result with character and segment counts
 */
export async function translateSMS(
  content: string,
  locale: string
): Promise<TranslatedSMS> {
  // Extract merge tags
  const { cleanedContent, tags, placeholders } = extractMergeTags(content);
  
  // Translate the content
  const translated = await translateText(cleanedContent, locale);
  
  // Restore merge tags
  const translatedContent = restoreMergeTags(translated, tags, placeholders);
  
  // Calculate character and segment counts
  const characterCount = translatedContent.length;
  
  // SMS segments: 160 chars for GSM-7, 70 for Unicode (Arabic/Hebrew)
  const isUnicode = /[\u0600-\u06FF\u0590-\u05FF]/.test(translatedContent);
  const charsPerSegment = isUnicode ? 70 : 160;
  const segmentCount = Math.ceil(characterCount / charsPerSegment);
  
  return {
    messageId: `sms-${Date.now()}`,
    originalContent: content,
    translatedContent,
    targetLocale: locale,
    translatedAt: new Date().toISOString(),
    characterCount,
    segmentCount,
  };
}

/**
 * Translate multiple SMS messages
 * @param messages - Array of SMS messages
 * @param locale - Target locale
 * @returns Array of translated SMS results
 */
export async function translateSMSMessages(
  messages: string[],
  locale: string
): Promise<TranslatedSMS[]> {
  return Promise.all(
    messages.map(content => translateSMS(content, locale))
  );
}

/**
 * Get Omnisend templates for a specific locale
 * Returns localized versions of common email and SMS templates
 * @param locale - Target locale
 * @returns Array of templates
 */
export async function getOmnisendTemplates(locale: string): Promise<OmnisendTemplate[]> {
  const templates: OmnisendTemplate[] = [
    // Welcome email templates
    {
      templateId: 'welcome-email-1',
      name: locale.startsWith('ar') ? 'ترحيب - كلاسيكي' : 
            locale.startsWith('he') ? 'ברוכים הבאים - קלאסי' : 
            'Welcome - Classic',
      type: 'email',
      htmlContent: getWelcomeEmailHtml(locale),
      textContent: getWelcomeEmailText(locale),
      category: 'welcome',
      tags: ['welcome', 'onboarding'],
      language: locale,
    },
    {
      templateId: 'welcome-email-2',
      name: locale.startsWith('ar') ? 'ترحيب - مع خصم' : 
            locale.startsWith('he') ? 'ברוכים הבאים - עם הנחה' : 
            'Welcome - With Discount',
      type: 'email',
      htmlContent: getWelcomeDiscountEmailHtml(locale),
      textContent: getWelcomeDiscountEmailText(locale),
      category: 'welcome',
      tags: ['welcome', 'discount', 'coupon'],
      language: locale,
    },
    
    // Abandoned cart templates
    {
      templateId: 'abandoned-cart-1',
      name: locale.startsWith('ar') ? 'سلة مهجورة - تذكير 1' : 
            locale.startsWith('he') ? 'עגלה נטושה - תזכורת 1' : 
            'Abandoned Cart - Reminder 1',
      type: 'email',
      htmlContent: getAbandonedCartEmailHtml(locale, 1),
      textContent: getAbandonedCartEmailText(locale, 1),
      category: 'abandoned_cart',
      tags: ['abandoned_cart', 'recovery'],
      language: locale,
    },
    {
      templateId: 'abandoned-cart-2',
      name: locale.startsWith('ar') ? 'سلة مهجورة - تذكير 2' : 
            locale.startsWith('he') ? 'עגלה נטושה - תזכורת 2' : 
            'Abandoned Cart - Reminder 2',
      type: 'email',
      htmlContent: getAbandonedCartEmailHtml(locale, 2),
      textContent: getAbandonedCartEmailText(locale, 2),
      category: 'abandoned_cart',
      tags: ['abandoned_cart', 'recovery', 'urgent'],
      language: locale,
    },
    
    // Order confirmation templates
    {
      templateId: 'order-confirmation',
      name: locale.startsWith('ar') ? 'تأكيد الطلب' : 
            locale.startsWith('he') ? 'אישור הזמנה' : 
            'Order Confirmation',
      type: 'email',
      htmlContent: getOrderConfirmationEmailHtml(locale),
      textContent: getOrderConfirmationEmailText(locale),
      category: 'transactional',
      tags: ['order', 'confirmation', 'transactional'],
      language: locale,
    },
    
    // Shipping confirmation templates
    {
      templateId: 'shipping-confirmation',
      name: locale.startsWith('ar') ? 'تأكيد الشحن' : 
            locale.startsWith('he') ? 'אישור משלוח' : 
            'Shipping Confirmation',
      type: 'email',
      htmlContent: getShippingConfirmationEmailHtml(locale),
      textContent: getShippingConfirmationEmailText(locale),
      category: 'transactional',
      tags: ['shipping', 'tracking', 'transactional'],
      language: locale,
    },
    
    // SMS templates
    {
      templateId: 'sms-welcome',
      name: locale.startsWith('ar') ? 'SMS - ترحيب' : 
            locale.startsWith('he') ? 'SMS - ברוכים הבאים' : 
            'SMS - Welcome',
      type: 'sms',
      smsContent: getWelcomeSmsContent(locale),
      category: 'welcome',
      tags: ['welcome', 'sms'],
      language: locale,
    },
    {
      templateId: 'sms-abandoned-cart',
      name: locale.startsWith('ar') ? 'SMS - سلة مهجورة' : 
            locale.startsWith('he') ? 'SMS - עגלה נטושה' : 
            'SMS - Abandoned Cart',
      type: 'sms',
      smsContent: getAbandonedCartSmsContent(locale),
      category: 'abandoned_cart',
      tags: ['abandoned_cart', 'sms', 'recovery'],
      language: locale,
    },
    {
      templateId: 'sms-order-confirmation',
      name: locale.startsWith('ar') ? 'SMS - تأكيد الطلب' : 
            locale.startsWith('he') ? 'SMS - אישור הזמנה' : 
            'SMS - Order Confirmation',
      type: 'sms',
      smsContent: getOrderConfirmationSmsContent(locale),
      category: 'transactional',
      tags: ['order', 'confirmation', 'sms'],
      language: locale,
    },
    {
      templateId: 'sms-shipping',
      name: locale.startsWith('ar') ? 'SMS - تم الشحن' : 
            locale.startsWith('he') ? 'SMS - נשלח' : 
            'SMS - Shipped',
      type: 'sms',
      smsContent: getShippingSmsContent(locale),
      category: 'transactional',
      tags: ['shipping', 'sms', 'tracking'],
      language: locale,
    },
  ];
  
  return templates;
}

// Template content generators

function getWelcomeEmailHtml(locale: string): string {
  if (locale.startsWith('ar')) {
    return `<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"></head>
<body>
  <h1>مرحبا {{contact.firstName}}!</h1>
  <p>أهلا وسهلا بك في {{shop.name}}!</p>
  <p>نحن سعداء بانضمامك إلينا.</p>
  <p><a href="{{shop.url}}">تسوق الآن</a></p>
  <p><a href="{{unsubscribeUrl}}">إلغاء الاشتراك</a></p>
</body>
</html>`;
  }
  if (locale.startsWith('he')) {
    return `<html dir="rtl" lang="he">
<head><meta charset="UTF-8"></head>
<body>
  <h1>שלום {{contact.firstName}}!</h1>
  <p>ברוך הבא ל-{{shop.name}}!</p>
  <p>אנו שמחים שהצטרפת אלינו.</p>
  <p><a href="{{shop.url}}">קנה עכשיו</a></p>
  <p><a href="{{unsubscribeUrl}}">ביטול מינוי</a></p>
</body>
</html>`;
  }
  return `<html lang="en">
<head><meta charset="UTF-8"></head>
<body>
  <h1>Hello {{contact.firstName}}!</h1>
  <p>Welcome to {{shop.name}}!</p>
  <p>We're excited to have you join us.</p>
  <p><a href="{{shop.url}}">Shop Now</a></p>
  <p><a href="{{unsubscribeUrl}}">Unsubscribe</a></p>
</body>
</html>`;
}

function getWelcomeEmailText(locale: string): string {
  if (locale.startsWith('ar')) {
    return `مرحبا {{contact.firstName}}!

أهلا وسهلا بك في {{shop.name}}!

نحن سعداء بانضمامك إلينا.

تسوق الآن: {{shop.url}}

إلغاء الاشتراك: {{unsubscribeUrl}}`;
  }
  if (locale.startsWith('he')) {
    return `שלום {{contact.firstName}}!

ברוך הבא ל-{{shop.name}}!

אנו שמחים שהצטרפת אלינו.

קנה עכשיו: {{shop.url}}

ביטול מינוי: {{unsubscribeUrl}}`;
  }
  return `Hello {{contact.firstName}}!

Welcome to {{shop.name}}!

We're excited to have you join us.

Shop Now: {{shop.url}}

Unsubscribe: {{unsubscribeUrl}}`;
}

function getWelcomeDiscountEmailHtml(locale: string): string {
  if (locale.startsWith('ar')) {
    return `<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"></head>
<body>
  <h1>مرحبا {{contact.firstName}}!</h1>
  <p>أهلا وسهلا بك في {{shop.name}}!</p>
  <p>استخدم الكود {{coupon.code}} واحصل على خصم {{coupon.discount}}</p>
  <p><a href="{{shop.url}}">تسوق الآن</a></p>
</body>
</html>`;
  }
  return `<html lang="en">
<head><meta charset="UTF-8"></head>
<body>
  <h1>Hello {{contact.firstName}}!</h1>
  <p>Welcome to {{shop.name}}!</p>
  <p>Use code {{coupon.code}} for {{coupon.discount}} off your first order!</p>
  <p><a href="{{shop.url}}">Shop Now</a></p>
</body>
</html>`;
}

function getWelcomeDiscountEmailText(locale: string): string {
  if (locale.startsWith('ar')) {
    return `مرحبا {{contact.firstName}}!

أهلا وسهلا بك في {{shop.name}}!

استخدم الكود {{coupon.code}} واحصل على خصم {{coupon.discount}}

{{shop.url}}`;
  }
  return `Hello {{contact.firstName}}!

Welcome to {{shop.name}}!

Use code {{coupon.code}} for {{coupon.discount}} off your first order!

{{shop.url}}`;
}

function getAbandonedCartEmailHtml(locale: string, reminder: number): string {
  const isArabic = locale.startsWith('ar');
  const isHebrew = locale.startsWith('he');
  
  if (isArabic) {
    return `<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"></head>
<body>
  <h1>نسيت شيئا ما؟</h1>
  <p>مرحبا {{contact.firstName}}،</p>
  <p>لديك عناصر في سلة التسوق بانتظارك!</p>
  <p>أكمل طلبك الآن: <a href="{{cart.abandonedUrl}}">اضغط هنا</a></p>
  ${reminder > 1 ? '<p>خصم خاص: استخدم الكود SAVE10</p>' : ''}
</body>
</html>`;
  }
  if (isHebrew) {
    return `<html dir="rtl" lang="he">
<head><meta charset="UTF-8"></head>
<body>
  <h1>שכחת משהו?</h1>
  <p>שלום {{contact.firstName}},</p>
  <p>יש לך פריטים בעגלה שמחכים לך!</p>
  <p>השלם את ההזמנה: <a href="{{cart.abandonedUrl}}">לחץ כאן</a></p>
  ${reminder > 1 ? '<p>הנחה מיוחדת: השתמש בקוד SAVE10</p>' : ''}
</body>
</html>`;
  }
  return `<html lang="en">
<head><meta charset="UTF-8"></head>
<body>
  <h1>Did you forget something?</h1>
  <p>Hi {{contact.firstName}},</p>
  <p>You have items in your cart waiting for you!</p>
  <p>Complete your order: <a href="{{cart.abandonedUrl}}">Click here</a></p>
  ${reminder > 1 ? '<p>Special discount: Use code SAVE10</p>' : ''}
</body>
</html>`;
}

function getAbandonedCartEmailText(locale: string, reminder: number): string {
  const isArabic = locale.startsWith('ar');
  const isHebrew = locale.startsWith('he');
  
  if (isArabic) {
    return `نسيت شيئا ما؟

مرحبا {{contact.firstName}}،

لديك عناصر في سلة التسوق بانتظارك!

أكمل طلبك: {{cart.abandonedUrl}}
${reminder > 1 ? '\nخصم خاص: استخدم الكود SAVE10' : ''}`;
  }
  if (isHebrew) {
    return `שכחת משהו?

שלום {{contact.firstName}},

יש לך פריטים בעגלה שמחכים לך!

השלם את ההזמנה: {{cart.abandonedUrl}}
${reminder > 1 ? '\nהנחה מיוחדת: השתמש בקוד SAVE10' : ''}`;
  }
  return `Did you forget something?

Hi {{contact.firstName}},

You have items in your cart waiting for you!

Complete your order: {{cart.abandonedUrl}}
${reminder > 1 ? '\nSpecial discount: Use code SAVE10' : ''}`;
}

function getOrderConfirmationEmailHtml(locale: string): string {
  if (locale.startsWith('ar')) {
    return `<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"></head>
<body>
  <h1>تم تأكيد طلبك!</h1>
  <p>مرحبا {{contact.firstName}}،</p>
  <p>شكرا لطلبك. رقم الطلب: {{order.number}}</p>
  <p>الإجمالي: {{order.total}} {{order.currency}}</p>
  <p>سنرسل لك تحديثا عند شحن طلبك.</p>
</body>
</html>`;
  }
  if (locale.startsWith('he')) {
    return `<html dir="rtl" lang="he">
<head><meta charset="UTF-8"></head>
<body>
  <h1>ההזמנה אושרה!</h1>
  <p>שלום {{contact.firstName}},</p>
  <p>תודה על ההזמנה. מספר הזמנה: {{order.number}}</p>
  <p>סכום: {{order.total}} {{order.currency}}</p>
  <p>נעדכן אותך כשההזמנה תישלח.</p>
</body>
</html>`;
  }
  return `<html lang="en">
<head><meta charset="UTF-8"></head>
<body>
  <h1>Order Confirmed!</h1>
  <p>Hi {{contact.firstName}},</p>
  <p>Thank you for your order. Order #: {{order.number}}</p>
  <p>Total: {{order.total}} {{order.currency}}</p>
  <p>We'll send you an update when your order ships.</p>
</body>
</html>`;
}

function getOrderConfirmationEmailText(locale: string): string {
  if (locale.startsWith('ar')) {
    return `تم تأكيد طلبك!

مرحبا {{contact.firstName}}،

شكرا لطلبك. رقم الطلب: {{order.number}}
الإجمالي: {{order.total}} {{order.currency}}

سنرسل لك تحديثا عند شحن طلبك.`;
  }
  if (locale.startsWith('he')) {
    return `ההזמנה אושרה!

שלום {{contact.firstName}},

תודה על ההזמנה. מספר הזמנה: {{order.number}}
סכום: {{order.total}} {{order.currency}}

נעדכן אותך כשההזמנה תישלח.`;
  }
  return `Order Confirmed!

Hi {{contact.firstName}},

Thank you for your order. Order #: {{order.number}
Total: {{order.total}} {{order.currency}}

We'll send you an update when your order ships.`;
}

function getShippingConfirmationEmailHtml(locale: string): string {
  if (locale.startsWith('ar')) {
    return `<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"></head>
<body>
  <h1>تم شحن طلبك!</h1>
  <p>مرحبا {{contact.firstName}}،</p>
  <p>طلبك {{order.number}} في الطريق إليك!</p>
  <p>رقم التتبع: {{order.trackingNumber}}</p>
  <p><a href="{{order.trackingUrl}}">تتبع طلبك</a></p>
</body>
</html>`;
  }
  if (locale.startsWith('he')) {
    return `<html dir="rtl" lang="he">
<head><meta charset="UTF-8"></head>
<body>
  <h1>ההזמנה נשלחה!</h1>
  <p>שלום {{contact.firstName}},</p>
  <p>ההזמנה {{order.number}} בדרך אליך!</p>
  <p>מספר מעקב: {{order.trackingNumber}}</p>
  <p><a href="{{order.trackingUrl}}">עקוב אחרי ההזמנה</a></p>
</body>
</html>`;
  }
  return `<html lang="en">
<head><meta charset="UTF-8"></head>
<body>
  <h1>Your Order Has Shipped!</h1>
  <p>Hi {{contact.firstName}},</p>
  <p>Order {{order.number}} is on its way to you!</p>
  <p>Tracking #: {{order.trackingNumber}}</p>
  <p><a href="{{order.trackingUrl}}">Track Your Order</a></p>
</body>
</html>`;
}

function getShippingConfirmationEmailText(locale: string): string {
  if (locale.startsWith('ar')) {
    return `تم شحن طلبك!

مرحبا {{contact.firstName}}،

طلبك {{order.number}} في الطريق إليك!

رقم التتبع: {{order.trackingNumber}}
تتبع طلبك: {{order.trackingUrl}}`;
  }
  if (locale.startsWith('he')) {
    return `ההזמנה נשלחה!

שלום {{contact.firstName}},

ההזמנה {{order.number}} בדרך אליך!

מספר מעקב: {{order.trackingNumber}}
עקוב אחרי ההזמנה: {{order.trackingUrl}}`;
  }
  return `Your Order Has Shipped!

Hi {{contact.firstName}},

Order {{order.number}} is on its way to you!

Tracking #: {{order.trackingNumber}}
Track Your Order: {{order.trackingUrl}}`;
}

function getWelcomeSmsContent(locale: string): string {
  if (locale.startsWith('ar')) {
    return `مرحبا {{contact.firstName}}! أهلا بك في {{shop.name}}. تسوق الآن: {{shop.url}}`;
  }
  if (locale.startsWith('he')) {
    return `שלום {{contact.firstName}}! ברוכים הבאים ל-{{shop.name}}. קנה עכשיו: {{shop.url}}`;
  }
  return `Hi {{contact.firstName}}! Welcome to {{shop.name}}. Shop now: {{shop.url}}`;
}

function getAbandonedCartSmsContent(locale: string): string {
  if (locale.startsWith('ar')) {
    return `مرحبا {{contact.firstName}}، نسيت شيئا؟ أكمل طلبك: {{cart.abandonedUrl}}`;
  }
  if (locale.startsWith('he')) {
    return `שלום {{contact.firstName}}, שכחת משהו? השלם את ההזמנה: {{cart.abandonedUrl}}`;
  }
  return `Hi {{contact.firstName}}, forgot something? Complete your order: {{cart.abandonedUrl}}`;
}

function getOrderConfirmationSmsContent(locale: string): string {
  if (locale.startsWith('ar')) {
    return `شكرا لطلبك! رقم الطلب: {{order.number}}. الإجمالي: {{order.total}}`;
  }
  if (locale.startsWith('he')) {
    return `תודה על ההזמנה! מספר הזמנה: {{order.number}}. סכום: {{order.total}}`;
  }
  return `Thanks for your order! Order #: {{order.number}}. Total: {{order.total}}`;
}

function getShippingSmsContent(locale: string): string {
  if (locale.startsWith('ar')) {
    return `تم شحن طلبك {{order.number}}! تتبع: {{order.trackingUrl}}`;
  }
  if (locale.startsWith('he')) {
    return `ההזמנה {{order.number}} נשלחה! מעקב: {{order.trackingUrl}}`;
  }
  return `Order {{order.number}} shipped! Track: {{order.trackingUrl}}`;
}

/**
 * Validate Omnisend merge tags in content
 * Returns any invalid or malformed merge tags found
 */
export function validateMergeTags(content: string): {
  valid: boolean;
  invalidTags: string[];
  warnings: string[];
} {
  const invalidTags: string[] = [];
  const warnings: string[] = [];
  
  // Find all potential merge tags
  const potentialTags = content.match(/\{\{[^}]+\}\}/g) || [];
  
  for (const tag of potentialTags) {
    // Check if it's a valid Omnisend tag
    let isValid = false;
    for (const pattern of OMNISEND_MERGE_TAGS) {
      const testPattern = new RegExp(pattern.source, 'i');
      if (testPattern.test(tag)) {
        isValid = true;
        break;
      }
    }
    
    if (!isValid) {
      invalidTags.push(tag);
    }
    
    // Check for common issues
    if (tag.includes('  ')) {
      warnings.push(`Double spaces in tag: ${tag}`);
    }
    if (!tag.match(/^\{\{\s*\w/)) {
      warnings.push(`Tag should start with letters: ${tag}`);
    }
  }
  
  return {
    valid: invalidTags.length === 0,
    invalidTags,
    warnings,
  };
}

/**
 * Get character count for SMS (accounts for Unicode)
 */
export function getSMSCharacterCount(content: string): {
  characterCount: number;
  isUnicode: boolean;
  charsPerSegment: number;
  segmentCount: number;
} {
  const characterCount = content.length;
  const isUnicode = /[\u0600-\u06FF\u0590-\u05FF\u0080-\u00FF]/.test(content);
  const charsPerSegment = isUnicode ? 70 : 160;
  const segmentCount = Math.ceil(characterCount / charsPerSegment);
  
  return {
    characterCount,
    isUnicode,
    charsPerSegment,
    segmentCount,
  };
}

/**
 * Batch translate multiple campaigns
 */
export async function translateCampaigns(
  campaigns: OmnisendCampaign[],
  locale: string
): Promise<TranslatedCampaign[]> {
  return Promise.all(
    campaigns.map(campaign => translateCampaign(campaign, locale))
  );
}

/**
 * Batch translate multiple automation workflows
 */
export async function translateAutomations(
  workflows: OmnisendAutomationWorkflow[],
  locale: string
): Promise<TranslatedAutomation[]> {
  return Promise.all(
    workflows.map(workflow => translateAutomation(workflow, locale))
  );
}
