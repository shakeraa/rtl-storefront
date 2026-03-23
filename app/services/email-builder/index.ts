/**
 * RTL Email Template Builder (T0391)
 *
 * Builds and renders email templates with proper RTL/LTR direction
 * support for Arabic, Hebrew, and English locales.
 */

export type EmailTemplateType =
  | 'order_confirmation'
  | 'shipping'
  | 'delivery'
  | 'refund'
  | 'account'
  | 'abandoned_cart'
  | 'back_in_stock';

export interface EmailTemplate {
  id: string;
  name: string;
  type: EmailTemplateType;
  subject: string;
  subjectAr: string;
  subjectHe: string;
  bodyHtml: string;
  isRtl: boolean;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tpl_order_confirmation',
    name: 'Order Confirmation',
    type: 'order_confirmation',
    subject: 'Order Confirmed - #{{orderNumber}}',
    subjectAr: 'تأكيد الطلب - #{{orderNumber}}',
    subjectHe: 'אישור הזמנה - #{{orderNumber}}',
    bodyHtml: '<h1>Thank you for your order!</h1><p>Order #{{orderNumber}} has been confirmed.</p><p>Total: {{total}}</p><p>We will notify you when your order ships.</p>',
    isRtl: false,
  },
  {
    id: 'tpl_shipping',
    name: 'Shipping Notification',
    type: 'shipping',
    subject: 'Your order has shipped - #{{orderNumber}}',
    subjectAr: 'تم شحن طلبك - #{{orderNumber}}',
    subjectHe: 'ההזמנה שלך נשלחה - #{{orderNumber}}',
    bodyHtml: '<h1>Your order is on its way!</h1><p>Order #{{orderNumber}} has been shipped.</p><p>Tracking: {{trackingNumber}}</p><p>Estimated delivery: {{estimatedDelivery}}</p>',
    isRtl: false,
  },
  {
    id: 'tpl_delivery',
    name: 'Delivery Confirmation',
    type: 'delivery',
    subject: 'Your order has been delivered - #{{orderNumber}}',
    subjectAr: 'تم توصيل طلبك - #{{orderNumber}}',
    subjectHe: 'ההזמנה שלך נמסרה - #{{orderNumber}}',
    bodyHtml: '<h1>Your order has been delivered!</h1><p>Order #{{orderNumber}} was delivered successfully.</p><p>We hope you enjoy your purchase!</p>',
    isRtl: false,
  },
  {
    id: 'tpl_refund',
    name: 'Refund Notification',
    type: 'refund',
    subject: 'Refund processed - #{{orderNumber}}',
    subjectAr: 'تم معالجة الاسترداد - #{{orderNumber}}',
    subjectHe: 'החזר כספי בוצע - #{{orderNumber}}',
    bodyHtml: '<h1>Refund Processed</h1><p>A refund of {{refundAmount}} for order #{{orderNumber}} has been processed.</p><p>Please allow 5-10 business days for the amount to appear in your account.</p>',
    isRtl: false,
  },
  {
    id: 'tpl_account',
    name: 'Account Welcome',
    type: 'account',
    subject: 'Welcome to {{shopName}}!',
    subjectAr: 'مرحباً بك في {{shopName}}!',
    subjectHe: 'ברוכים הבאים ל-{{shopName}}!',
    bodyHtml: '<h1>Welcome, {{customerName}}!</h1><p>Thank you for creating an account with {{shopName}}.</p><p>Start shopping our latest collection today.</p>',
    isRtl: false,
  },
  {
    id: 'tpl_abandoned_cart',
    name: 'Abandoned Cart',
    type: 'abandoned_cart',
    subject: 'You left something behind!',
    subjectAr: 'لقد تركت شيئاً في سلتك!',
    subjectHe: 'השארת משהו מאחור!',
    bodyHtml: '<h1>Do not forget your items!</h1><p>You have {{itemCount}} item(s) in your cart.</p><p>Complete your purchase before they sell out.</p><p>Cart total: {{cartTotal}}</p>',
    isRtl: false,
  },
  {
    id: 'tpl_back_in_stock',
    name: 'Back in Stock',
    type: 'back_in_stock',
    subject: '{{productName}} is back in stock!',
    subjectAr: '{{productName}} عاد للمخزون!',
    subjectHe: '{{productName}} חזר למלאי!',
    bodyHtml: '<h1>Great news!</h1><p>{{productName}} is back in stock.</p><p>Do not miss out - grab yours before it sells out again!</p>',
    isRtl: false,
  },
];

const RTL_LOCALES = ['ar', 'he', 'fa', 'ur'];

/**
 * Get the text direction for a given locale.
 */
export function getEmailDirection(locale: string): 'rtl' | 'ltr' {
  const lang = locale.split('-')[0].split('_')[0].toLowerCase();
  return RTL_LOCALES.includes(lang) ? 'rtl' : 'ltr';
}

/**
 * Get a template by type.
 */
export function getTemplate(type: EmailTemplateType): EmailTemplate | undefined {
  return EMAIL_TEMPLATES.find((t) => t.type === type);
}

/**
 * Get all available template types.
 */
export function getAvailableTemplateTypes(): EmailTemplateType[] {
  return EMAIL_TEMPLATES.map((t) => t.type);
}

/**
 * Replace template placeholders with actual data values.
 */
function interpolate(template: string, data: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    const placeholder = '{{' + key + '}}';
    while (result.includes(placeholder)) {
      result = result.replace(placeholder, value);
    }
  }
  return result;
}

/**
 * Render a template with data and locale-appropriate direction.
 */
export function renderTemplate(
  template: EmailTemplate,
  data: Record<string, string>,
  locale: string,
): string {
  const direction = getEmailDirection(locale);
  const lang = locale.split('-')[0].split('_')[0].toLowerCase();

  // Pick the appropriate subject
  let subject = template.subject;
  if (lang === 'ar') {
    subject = template.subjectAr;
  } else if (lang === 'he') {
    subject = template.subjectHe;
  }

  const renderedSubject = interpolate(subject, data);
  const renderedBody = interpolate(template.bodyHtml, data);

  const fontFamily = direction === 'rtl'
    ? "'Noto Sans Arabic', 'Noto Sans Hebrew', Arial, sans-serif"
    : 'Arial, sans-serif';
  const textAlign = direction === 'rtl' ? 'right' : 'left';

  const lines = [
    '<!DOCTYPE html>',
    '<html lang="' + lang + '" dir="' + direction + '">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<title>' + renderedSubject + '</title>',
    '<style>',
    'body { direction: ' + direction + '; text-align: ' + textAlign + '; font-family: ' + fontFamily + '; margin: 0; padding: 20px; }',
    'table { direction: ' + direction + '; }',
    '</style>',
    '</head>',
    '<body dir="' + direction + '">',
    renderedBody,
    '</body>',
    '</html>',
  ];

  return lines.join('\n');
}

/**
 * Inline CSS styles into HTML elements for email client compatibility.
 * Simplified implementation that converts style blocks to inline styles.
 */
export function inlineCSS(html: string): string {
  // Extract styles from <style> tags
  const styleStart = html.indexOf('<style');
  const styleContentStart = html.indexOf('>', styleStart) + 1;
  const styleEnd = html.indexOf('</style>');

  if (styleStart === -1 || styleEnd === -1) {
    return html;
  }

  const styles = html.substring(styleContentStart, styleEnd);
  let result = html;

  // Parse simple selectors (body, table, etc.)
  const rules: Array<{ selector: string; declarations: string }> = [];
  let i = 0;
  while (i < styles.length) {
    const braceOpen = styles.indexOf('{', i);
    if (braceOpen === -1) break;
    const braceClose = styles.indexOf('}', braceOpen);
    if (braceClose === -1) break;

    const selector = styles.substring(i, braceOpen).trim().toLowerCase();
    const declarations = styles.substring(braceOpen + 1, braceClose).trim().replace(/\s+/g, ' ');

    if (selector && declarations) {
      rules.push({ selector, declarations });
    }
    i = braceClose + 1;
  }

  for (const rule of rules) {
    const selector = rule.selector;
    // Only handle simple element selectors
    if (!/^\w+$/.test(selector)) continue;

    // Find and update matching opening tags
    const tagPattern = '<' + selector;
    let searchFrom = 0;
    while (true) {
      const idx = result.toLowerCase().indexOf(tagPattern, searchFrom);
      if (idx === -1) break;
      const tagEnd = result.indexOf('>', idx);
      if (tagEnd === -1) break;

      const tag = result.substring(idx, tagEnd + 1);
      if (tag.includes('style="')) {
        // Merge styles
        const newTag = tag.replace(/style="([^"]*)"/, 'style="$1 ' + rule.declarations + '"');
        result = result.substring(0, idx) + newTag + result.substring(tagEnd + 1);
        searchFrom = idx + newTag.length;
      } else {
        const insertPos = idx + tagPattern.length;
        const newTag = result.substring(idx, insertPos) + ' style="' + rule.declarations + '"' + result.substring(insertPos, tagEnd + 1);
        result = result.substring(0, idx) + newTag + result.substring(tagEnd + 1);
        searchFrom = idx + newTag.length;
      }
    }
  }

  return result;
}

/**
 * Wrap HTML content with appropriate dir attribute for the locale.
 */
export function addRTLWrapper(html: string, locale: string): string {
  const direction = getEmailDirection(locale);
  const lang = locale.split('-')[0].split('_')[0].toLowerCase();
  const alignment = direction === 'rtl' ? 'right' : 'left';

  return '<div dir="' + direction + '" lang="' + lang + '" style="direction: ' + direction + '; text-align: ' + alignment + ';">' + html + '</div>';
}
