/**
 * Klaviyo Email Templates Integration
 * T0201: Integration - Klaviyo Email Templates
 * 
 * Provides email template translation with Klaviyo variable preservation,
 * RTL email layout support, and template management for MENA markets.
 */

// Template types supported by Klaviyo
export type KlaviyoTemplateType = 'welcome' | 'abandoned_cart' | 'order_confirm' | 'shipping';

// Supported locales for RTL email templates
export type SupportedLocale = 'ar' | 'he' | 'fa' | 'ur' | 'en' | 'fr';

// RTL locales
export const RTL_LOCALES: SupportedLocale[] = ['ar', 'he', 'fa', 'ur'];

// Klaviyo variable types
export interface KlaviyoVariable {
  raw: string;
  type: 'variable' | 'tag' | 'filter' | 'comment';
  name?: string;
  property?: string;
  filters?: string[];
}

// Translation options
export interface TranslateOptions {
  preserveVariables?: boolean;
  applyRTLFormatting?: boolean;
  translateSubject?: boolean;
  preserveUrls?: boolean;
  customDictionary?: Record<string, string>;
}

// Email template structure
export interface KlaviyoEmailTemplate {
  type: KlaviyoTemplateType;
  locale: SupportedLocale;
  subject: string;
  preheader?: string;
  html: string;
  text?: string;
  metadata?: {
    createdAt?: Date;
    updatedAt?: Date;
    version?: string;
  };
}

// RTL validation result
export interface RTLValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Default translation options
const DEFAULT_OPTIONS: TranslateOptions = {
  preserveVariables: true,
  applyRTLFormatting: true,
  translateSubject: true,
  preserveUrls: true,
  customDictionary: {},
};

/**
 * Detects all Klaviyo variables in a template
 * Supports: {{variable}}, {% tag %}, {{variable|filter}}, {# comment #}
 */
export function detectKlaviyoVariables(template: string): KlaviyoVariable[] {
  const variables: KlaviyoVariable[] = [];
  
  // Pattern for {{variable}} or {{variable.property}} or {{variable|filter}}
  const variablePattern = /\{\{\s*([^}|]+)(?:\|([^}]+))?\s*\}\}/g;
  
  // Pattern for {% tag %} - control flow, loops, conditionals
  const tagPattern = /\{%\s*([^}%]+)\s*%\}/g;
  
  // Pattern for {# comment #}
  const commentPattern = /\{#\s*([^}#]+)\s*#\}/g;
  
  let match;
  
  // Extract variables
  while ((match = variablePattern.exec(template)) !== null) {
    const raw = match[0];
    const content = match[1].trim();
    const filterPart = match[2];
    
    const parts = content.split('.');
    const name = parts[0];
    const property = parts.slice(1).join('.') || undefined;
    
    variables.push({
      raw,
      type: 'variable',
      name,
      property,
      filters: filterPart ? filterPart.split('|').map(f => f.trim()) : undefined,
    });
  }
  
  // Extract tags
  while ((match = tagPattern.exec(template)) !== null) {
    const raw = match[0];
    const content = match[1].trim();
    const parts = content.split(/\s+/);
    
    variables.push({
      raw,
      type: 'tag',
      name: parts[0],
      property: parts.slice(1).join(' ') || undefined,
    });
  }
  
  // Extract comments
  while ((match = commentPattern.exec(template)) !== null) {
    variables.push({
      raw: match[0],
      type: 'comment',
    });
  }
  
  return variables;
}

/**
 * Creates a placeholder for a Klaviyo variable
 */
function createPlaceholder(index: number): string {
  return `__KLAVIYO_VAR_${index}__`;
}

/**
 * Extracts and replaces Klaviyo variables with placeholders
 */
function extractVariables(template: string): { cleaned: string; variables: KlaviyoVariable[] } {
  const variables = detectKlaviyoVariables(template);
  let cleaned = template;
  
  // Sort by length descending to avoid partial replacements
  const sortedVars = [...variables].sort((a, b) => b.raw.length - a.raw.length);
  
  sortedVars.forEach((variable, index) => {
    const placeholder = createPlaceholder(index);
    cleaned = cleaned.split(variable.raw).join(placeholder);
    variable._placeholder = placeholder;
  });
  
  return { cleaned, variables };
}

// Extend KlaviyoVariable interface for internal use
declare module './klaviyo' {
  interface KlaviyoVariable {
    _placeholder?: string;
  }
}

/**
 * Restores Klaviyo variables from placeholders
 */
function restoreVariables(translated: string, variables: KlaviyoVariable[]): string {
  let result = translated;
  
  variables.forEach((variable, index) => {
    const placeholder = createPlaceholder(index);
    result = result.split(placeholder).join(variable.raw);
  });
  
  return result;
}

/**
 * Simple translation function (placeholder for actual translation service)
 * In production, this would call a translation API
 */
function translateText(text: string, targetLocale: SupportedLocale, customDictionary?: Record<string, string>): string {
  // Check custom dictionary first
  if (customDictionary && customDictionary[text]) {
    return customDictionary[text];
  }
  
  // Basic translation dictionary for common email terms
  const translations: Record<SupportedLocale, Record<string, string>> = {
    ar: {
      'Welcome': 'مرحباً',
      'Hello': 'مرحباً',
      'Hi': 'أهلاً',
      'Welcome to': 'مرحباً بك في',
      'Thank you': 'شكراً لك',
      'Order Confirmation': 'تأكيد الطلب',
      'Your order': 'طلبك',
      'has been confirmed': 'تم تأكيده',
      'Shipping Confirmation': 'تأكيد الشحن',
      'Your order has shipped': 'تم شحن طلبك',
      'Track your order': 'تتبع طلبك',
      'Abandoned Cart': 'سلة مهجورة',
      'You left something behind': 'لقد تركت شيئاً خلفك',
      'Complete your purchase': 'أكمل عملية الشراء',
      'View Cart': 'عرض السلة',
      'Checkout': 'إتمام الشراء',
      'Subtotal': 'المجموع الفرعي',
      'Total': 'المجموع',
      'Discount': 'الخصم',
      'Shipping': 'الشحن',
      'Tax': 'الضريبة',
      'Continue Shopping': 'مواصلة التسوق',
      'Shop Now': 'تسوق الآن',
      'Unsubscribe': 'إلغاء الاشتراك',
      'View in Browser': 'عرض في المتصفح',
      'Contact Us': 'اتصل بنا',
      'Follow Us': 'تابعنا',
    },
    he: {
      'Welcome': 'ברוך הבא',
      'Hello': 'שלום',
      'Hi': 'היי',
      'Welcome to': 'ברוך הבא ל',
      'Thank you': 'תודה לך',
      'Order Confirmation': 'אישור הזמנה',
      'Your order': 'ההזמנה שלך',
      'has been confirmed': 'אושרה',
      'Shipping Confirmation': 'אישור משלוח',
      'Your order has shipped': 'ההזמנה שלך נשלחה',
      'Track your order': 'עקוב אחרי ההזמנה',
      'Abandoned Cart': 'עגלת קניות נטושה',
      'You left something behind': 'שכחת משהו מאחוריך',
      'Complete your purchase': 'השלם את הרכישה',
      'View Cart': 'צפה בעגלה',
      'Checkout': 'קופה',
      'Subtotal': 'סכום ביניים',
      'Total': 'סה"כ',
      'Discount': 'הנחה',
      'Shipping': 'משלוח',
      'Tax': 'מס',
      'Continue Shopping': 'המשך בקניות',
      'Shop Now': 'קנה עכשיו',
      'Unsubscribe': 'בטל מנוי',
      'View in Browser': 'צפה בדפדפן',
      'Contact Us': 'צור קשר',
      'Follow Us': 'עקוב אחרינו',
    },
    fa: {
      'Welcome': 'خوش آمدید',
      'Hello': 'سلام',
      'Hi': 'سلام',
      'Thank you': 'متشکرم',
      'Order Confirmation': 'تأیید سفارش',
      'Your order': 'سفارش شما',
      'has been confirmed': 'تأیید شده است',
      'Shipping Confirmation': 'تأیید ارسال',
      'Complete your purchase': 'خرید خود را تکمیل کنید',
      'Unsubscribe': 'لغو اشتراک',
    },
    ur: {
      'Welcome': 'خوش آمدید',
      'Hello': 'سلام',
      'Thank you': 'شکریہ',
      'Order Confirmation': 'آرڈر کی تصدیق',
      'Your order': 'آپ کا آرڈر',
      'Unsubscribe': 'رکنیت ختم کریں',
    },
    en: {},
    fr: {},
  };
  
  // If no translation available, return original
  if (!translations[targetLocale] || Object.keys(translations[targetLocale]).length === 0) {
    return text;
  }
  
  // Try exact match first
  if (translations[targetLocale][text]) {
    return translations[targetLocale][text];
  }
  
  // Try case-insensitive match
  const lowerText = text.toLowerCase();
  for (const [key, value] of Object.entries(translations[targetLocale])) {
    if (key.toLowerCase() === lowerText) {
      return value;
    }
  }
  
  // Try partial matches for phrases
  let result = text;
  for (const [key, value] of Object.entries(translations[targetLocale])) {
    // Use word boundaries to avoid partial word replacements
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    result = result.replace(regex, value);
  }
  
  return result;
}

/**
 * Translates a Klaviyo email template while preserving template variables
 */
export function translateTemplate(
  template: string,
  targetLocale: SupportedLocale,
  options: TranslateOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  if (opts.preserveVariables) {
    const { cleaned, variables } = extractVariables(template);
    const translated = translateText(cleaned, targetLocale, opts.customDictionary);
    return restoreVariables(translated, variables);
  }
  
  return translateText(template, targetLocale, opts.customDictionary);
}

/**
 * Generates RTL-specific email CSS
 */
export function generateRTLEmailCSS(): string {
  return `
    /* RTL Email Styles */
    body {
      direction: rtl;
      text-align: right;
    }
    
    .rtl-container {
      direction: rtl;
      text-align: right;
    }
    
    .rtl-text {
      direction: rtl;
      text-align: right;
      unicode-bidi: embed;
    }
    
    /* Flip margins for RTL */
    .rtl-margin-left {
      margin-left: 0;
      margin-right: auto;
    }
    
    .rtl-margin-right {
      margin-right: 0;
      margin-left: auto;
    }
    
    /* Flip padding for RTL */
    .rtl-padding-left {
      padding-left: 0;
      padding-right: 20px;
    }
    
    .rtl-padding-right {
      padding-right: 0;
      padding-left: 20px;
    }
    
    /* Text alignment */
    .rtl-align-left {
      text-align: right !important;
    }
    
    .rtl-align-right {
      text-align: left !important;
    }
    
    /* Float flip for RTL */
    .rtl-float-left {
      float: right !important;
    }
    
    .rtl-float-right {
      float: left !important;
    }
    
    /* Table cell alignment */
    td.rtl-cell {
      text-align: right;
      direction: rtl;
    }
    
    /* Button flip for RTL */
    .rtl-button {
      direction: rtl;
    }
    
    /* List item marker position */
    .rtl-list {
      padding-right: 20px;
      padding-left: 0;
    }
    
    /* Gmail iOS fix for RTL */
    u + .body .rtl-container {
      direction: rtl !important;
    }
  `.trim();
}

/**
 * Wraps email content with RTL formatting
 */
export function applyRTLEmailFormatting(content: string, locale: SupportedLocale): string {
  if (!RTL_LOCALES.includes(locale)) {
    return content;
  }
  
  const rtlStyles = generateRTLEmailCSS();
  
  // Check if already wrapped
  if (content.includes('rtl-container')) {
    return content;
  }
  
  // Apply RTL class to body or main container
  let formatted = content;
  
  // Add RTL styles if not present
  if (!formatted.includes('<style')) {
    formatted = `<style>${rtlStyles}</style>\n${formatted}`;
  }
  
  // Wrap body content
  if (formatted.includes('<body')) {
    formatted = formatted.replace(
      /<body([^>]*)>/i,
      `<body$1 dir="rtl" style="direction: rtl; text-align: right;">`
    );
  }
  
  // Add rtl-container class to main table or div
  formatted = formatted.replace(
    /<(table|div)([^>]*)class="([^"]*)"/gi,
    (match, tag, attrs, classes) => {
      if (classes.includes('main') || classes.includes('container') || classes.includes('wrapper')) {
        return `<${tag}${attrs}class="${classes} rtl-container"`;
      }
      return match;
    }
  );
  
  return formatted;
}

/**
 * Validates RTL email content for common issues
 */
export function validateRTLEmail(content: string): RTLValidationResult {
  const result: RTLValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    suggestions: [],
  };
  
  // Check for RTL direction attribute
  if (!content.includes('dir="rtl"') && !content.includes('direction: rtl')) {
    result.warnings.push('Missing RTL direction attribute or CSS');
    result.suggestions.push('Add dir="rtl" to body element or direction: rtl CSS');
  }
  
  // Check for proper character encoding
  if (!content.includes('charset=utf-8') && !content.includes('charset="utf-8"')) {
    result.warnings.push('UTF-8 charset declaration recommended for RTL languages');
    result.suggestions.push('Add <meta charset="utf-8"> in email head');
  }
  
  // Check for hardcoded LTR text alignment
  const ltrAlignmentMatches = content.match(/text-align:\s*left/gi);
  if (ltrAlignmentMatches && ltrAlignmentMatches.length >= 1) {
    result.warnings.push(`Found ${ltrAlignmentMatches.length} instances of 'text-align: left'`);
    result.suggestions.push('Consider using text-align: right for RTL content');
  }
  
  // Check for preserved Klaviyo variables
  const variables = detectKlaviyoVariables(content);
  if (variables.length === 0) {
    result.warnings.push('No Klaviyo template variables detected');
    result.suggestions.push('Ensure template variables are properly formatted: {{variable.property}}');
  }
  
  // Check for broken variable syntax (unmatched braces)
  const openDoubleBraces = (content.match(/\{\{/g) || []).length;
  const closeDoubleBraces = (content.match(/\}\}/g) || []).length;
  const openTagBraces = (content.match(/\{%/g) || []).length;
  const closeTagBraces = (content.match(/%\}/g) || []).length;
  
  if (openDoubleBraces !== closeDoubleBraces || openTagBraces !== closeTagBraces) {
    result.errors.push('Mismatched or broken Klaviyo variable/tag syntax detected');
    result.valid = false;
  }
  
  // Check for unsubscribe link (required for CAN-SPAM compliance)
  const hasUnsubscribe = content.includes('{% unsubscribe') || 
                         content.includes('{{unsubscribe_url}}') ||
                         content.includes('unsubscribe');
  if (!hasUnsubscribe) {
    result.warnings.push('No unsubscribe link detected');
    result.suggestions.push('Add {% unsubscribe %} or {{unsubscribe_url}} for CAN-SPAM compliance');
  }
  
  // Check for view in browser link
  if (!content.includes('{% web_view') && !content.includes('{{web_view_url}}')) {
    result.suggestions.push('Consider adding {% web_view %} link for email client compatibility');
  }
  
  // Check for images without alt text
  const imgWithoutAlt = content.match(/<img(?![^>]*alt=)[^>]*>/gi);
  if (imgWithoutAlt && imgWithoutAlt.length > 0) {
    result.warnings.push(`${imgWithoutAlt.length} image(s) without alt text`);
    result.suggestions.push('Add alt attributes to all images for accessibility');
  }
  
  // Check for table-based layout (good for email)
  if (!content.includes('<table')) {
    result.suggestions.push('Consider using table-based layout for better email client compatibility');
  }
  
  return result;
}

/**
 * Gets a default Klaviyo template by type and locale
 */
export function getKlaviyoTemplate(type: KlaviyoTemplateType, locale: SupportedLocale = 'en'): KlaviyoEmailTemplate {
  const templates: Record<KlaviyoTemplateType, Omit<KlaviyoEmailTemplate, 'locale'>> = {
    welcome: {
      type: 'welcome',
      subject: 'Welcome to {{organization.name}}!',
      preheader: 'Thanks for joining us',
      html: getWelcomeTemplate(),
    },
    abandoned_cart: {
      type: 'abandoned_cart',
      subject: 'You left something behind...',
      preheader: 'Complete your purchase',
      html: getAbandonedCartTemplate(),
    },
    order_confirm: {
      type: 'order_confirm',
      subject: 'Order Confirmation - {{event.order_id}}',
      preheader: 'Thank you for your order',
      html: getOrderConfirmTemplate(),
    },
    shipping: {
      type: 'shipping',
      subject: 'Your order has shipped!',
      preheader: 'Track your package',
      html: getShippingTemplate(),
    },
  };
  
  const template = templates[type];
  
  // Translate if needed
  if (locale !== 'en') {
    return {
      ...template,
      locale,
      subject: translateTemplate(template.subject, locale),
      preheader: template.preheader ? translateTemplate(template.preheader, locale) : undefined,
      html: applyRTLEmailFormatting(
        translateTemplate(template.html, locale),
        locale
      ),
    };
  }
  
  return {
    ...template,
    locale,
  };
}

/**
 * Welcome email template
 */
function getWelcomeTemplate(): string {
  return `<!DOCTYPE html>
<html lang="{{event.language|default:'en'}}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px;">
          <tr>
            <td style="text-align: center; padding: 20px;">
              <h1 style="color: #333; margin: 0;">Welcome to {{organization.name}}!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; color: #666; font-size: 16px; line-height: 1.5;">
              <p>Hi {{person.first_name|default:'there'}},</p>
              <p>Thank you for joining {{organization.name}}. We're excited to have you on board!</p>
              <p>Start exploring our collection and discover amazing products.</p>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 30px;">
              <a href="{{event.shop_url}}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Shop Now</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
              <p>{% unsubscribe %}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Abandoned cart email template
 */
function getAbandonedCartTemplate(): string {
  return `<!DOCTYPE html>
<html lang="{{event.language|default:'en'}}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You left something behind</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px;">
          <tr>
            <td style="text-align: center; padding: 20px;">
              <h1 style="color: #333; margin: 0;">You left something behind</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; color: #666; font-size: 16px; line-height: 1.5;">
              <p>Hi {{person.first_name|default:'there'}},</p>
              <p>We noticed you left some items in your cart. Don't worry, we've saved them for you!</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px;">
              <table role="presentation" width="100%" style="border: 1px solid #ddd;">
                <tr>
                  <td style="padding: 15px;">
                    <strong>{{event.product_name}}</strong><br>
                    {{event.product_price}}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 30px;">
              <a href="{{event.checkout_url}}" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Complete Your Purchase</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
              <p>{% unsubscribe %}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Order confirmation email template
 */
function getOrderConfirmTemplate(): string {
  return `<!DOCTYPE html>
<html lang="{{event.language|default:'en'}}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px;">
          <tr>
            <td style="text-align: center; padding: 20px;">
              <h1 style="color: #333; margin: 0;">Order Confirmation</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; color: #666; font-size: 16px; line-height: 1.5;">
              <p>Hi {{person.first_name|default:'there'}},</p>
              <p>Thank you for your order! We've received your order and are processing it now.</p>
              <p><strong>Order Number:</strong> {{event.order_id}}</p>
              <p><strong>Order Total:</strong> {{event.total_price}}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px;">
              <h3 style="color: #333;">Order Details</h3>
              <table role="presentation" width="100%" style="border: 1px solid #ddd;">
                <tr style="background: #f5f5f5;">
                  <th style="padding: 10px; text-align: left;">Item</th>
                  <th style="padding: 10px; text-align: right;">Price</th>
                </tr>
                {% for item in event.items %}
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd;">{{item.name}} x {{item.quantity}}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">{{item.price}}</td>
                </tr>
                {% endfor %}
                <tr>
                  <td style="padding: 10px;"><strong>Total</strong></td>
                  <td style="padding: 10px; text-align: right;"><strong>{{event.total_price}}</strong></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
              <p>{% unsubscribe %}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Shipping confirmation email template
 */
function getShippingTemplate(): string {
  return `<!DOCTYPE html>
<html lang="{{event.language|default:'en'}}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shipping Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px;">
          <tr>
            <td style="text-align: center; padding: 20px;">
              <h1 style="color: #333; margin: 0;">Your Order Has Shipped!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; color: #666; font-size: 16px; line-height: 1.5;">
              <p>Hi {{person.first_name|default:'there'}},</p>
              <p>Great news! Your order is on its way.</p>
              <p><strong>Order Number:</strong> {{event.order_id}}</p>
              <p><strong>Tracking Number:</strong> {{event.tracking_number}}</p>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 30px;">
              <a href="{{event.tracking_url}}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Track Your Order</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; color: #666; font-size: 14px;">
              <p>Expected delivery: {{event.estimated_delivery}}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
              <p>{% unsubscribe %}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Checks if a locale requires RTL formatting
 */
export function isRTLLocale(locale: SupportedLocale): boolean {
  return RTL_LOCALES.includes(locale);
}

/**
 * Batch translate multiple templates
 */
export function batchTranslateTemplates(
  templates: Array<{ template: string; locale: SupportedLocale }>,
  options: TranslateOptions = {}
): string[] {
  return templates.map(({ template, locale }) => translateTemplate(template, locale, options));
}

/**
 * Extracts translatable text segments from a template
 * Returns segments with their positions for reconstruction
 */
export function extractTranslatableSegments(template: string): Array<{
  text: string;
  start: number;
  end: number;
  type: 'text' | 'html' | 'variable';
}> {
  const segments: Array<{ text: string; start: number; end: number; type: 'text' | 'html' | 'variable' }> = [];
  
  // Find all Klaviyo variables
  const variables = detectKlaviyoVariables(template);
  
  let lastIndex = 0;
  
  // Sort variables by position in template
  const varPositions = variables.map(v => ({
    variable: v,
    start: template.indexOf(v.raw),
    end: template.indexOf(v.raw) + v.raw.length,
  })).sort((a, b) => a.start - b.start);
  
  for (const pos of varPositions) {
    // Add text segment before variable
    if (pos.start > lastIndex) {
      const text = template.slice(lastIndex, pos.start);
      // Only add if contains translatable text (not just whitespace/html tags)
      if (text.trim().length > 0 && !/^\s*<[^>]+>\s*$/.test(text)) {
        segments.push({
          text,
          start: lastIndex,
          end: pos.start,
          type: 'text',
        });
      } else if (text.trim().length > 0) {
        segments.push({
          text,
          start: lastIndex,
          end: pos.start,
          type: 'html',
        });
      }
    }
    
    // Add variable segment
    segments.push({
      text: pos.variable.raw,
      start: pos.start,
      end: pos.end,
      type: 'variable',
    });
    
    lastIndex = pos.end;
  }
  
  // Add remaining text
  if (lastIndex < template.length) {
    const text = template.slice(lastIndex);
    if (text.trim().length > 0 && !/^\s*<[^>]+>\s*$/.test(text)) {
      segments.push({
        text,
        start: lastIndex,
        end: template.length,
        type: 'text',
      });
    }
  }
  
  return segments;
}

/**
 * Validates Klaviyo template syntax
 */
export function validateKlaviyoSyntax(template: string): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for unclosed variable tags
  const openVarCount = (template.match(/\{\{/g) || []).length;
  const closeVarCount = (template.match(/\}\}/g) || []).length;
  if (openVarCount !== closeVarCount) {
    errors.push(`Mismatched variable tags: ${openVarCount} opening, ${closeVarCount} closing`);
  }
  
  // Check for unclosed tag blocks
  const openTagCount = (template.match(/\{%/g) || []).length;
  const closeTagCount = (template.match(/%\}/g) || []).length;
  if (openTagCount !== closeTagCount) {
    errors.push(`Mismatched tag blocks: ${openTagCount} opening, ${closeTagCount} closing`);
  }
  
  // Check for unclosed comment blocks
  const openCommentCount = (template.match(/\{#/g) || []).length;
  const closeCommentCount = (template.match(/#\}/g) || []).length;
  if (openCommentCount !== closeCommentCount) {
    errors.push(`Mismatched comment blocks: ${openCommentCount} opening, ${closeCommentCount} closing`);
  }
  
  // Check for common syntax errors
  if (template.includes('{{ ')) {
    warnings.push('Variables with extra space after opening braces detected');
  }
  
  if (template.includes(' }}')) {
    warnings.push('Variables with extra space before closing braces detected');
  }
  
  // Check for invalid variable names
  const invalidVarPattern = /\{\{\s*[^}]*[^\w.}|][^}]*\}\}/g;
  if (invalidVarPattern.test(template)) {
    warnings.push('Potentially invalid characters in variable names');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Gets email subject line suggestions based on template type
 */
export function getSubjectSuggestions(type: KlaviyoTemplateType, locale: SupportedLocale = 'en'): string[] {
  const suggestions: Record<KlaviyoTemplateType, Record<SupportedLocale, string[]>> = {
    welcome: {
      ar: ['مرحباً بك في {{organization.name}}!', 'أهلاً {{person.first_name}}!'],
      he: ['ברוך הבא ל-{{organization.name}}!', 'היי {{person.first_name}}!'],
      fa: ['{{organization.name}} خوش آمدید!'],
      ur: ['{{organization.name}} میں خوش آمدید!'],
      en: ['Welcome to {{organization.name}}!', 'Hi {{person.first_name}}, welcome aboard!'],
      fr: ['Bienvenue chez {{organization.name}}!', 'Bonjour {{person.first_name}}!'],
    },
    abandoned_cart: {
      ar: ['نسيت شيئاً في سلتك...', 'أكمل عملية الشراء - بقيت منتجات في سلتك'],
      he: ['שכחת משהו בעגלה...', 'השלם את הקניה - נשארו פריטים בעגלה'],
      fa: ['چیزی در سبد خرید خود فراموش کرده اید...'],
      ur: ['آپ نے اپنی ٹوکری میں کچھ چھوڑ دیا ہے...'],
      en: ['You left something behind...', 'Complete your purchase - items still in cart'],
      fr: ['Vous avez oublié quelque chose...', 'Complétez votre achat'],
    },
    order_confirm: {
      ar: ['تأكيد الطلب {{event.order_id}}', 'شكراً لطلبك!'],
      he: ['אישור הזמנה {{event.order_id}}', 'תודה על ההזמנה!'],
      fa: ['تأیید سفارش {{event.order_id}}'],
      ur: ['آرڈر کی تصدیق {{event.order_id}}'],
      en: ['Order Confirmation {{event.order_id}}', 'Thank you for your order!'],
      fr: ['Confirmation de commande {{event.order_id}}', 'Merci pour votre commande!'],
    },
    shipping: {
      ar: ['تم شحن طلبك!', 'طلبك في الطريق - {{event.order_id}}'],
      he: ['ההזמנה שלך נשלחה!', 'ההזמנה בדרך - {{event.order_id}}'],
      fa: ['سفارش شما ارسال شد!'],
      ur: ['آپ کا آرڈر بھیج دیا گیا ہے!'],
      en: ['Your order has shipped!', 'On its way - Order {{event.order_id}}'],
      fr: ['Votre commande a été expédiée!', 'En route - Commande {{event.order_id}}'],
    },
  };
  
  return suggestions[type][locale] || suggestions[type]['en'];
}
