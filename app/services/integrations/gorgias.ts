/**
 * Gorgias Support Tickets Integration
 * Handles translation of tickets, macros, and responses while preserving Gorgias variables
 */

// Gorgias ticket data structure
export interface GorgiasTicket {
  id: string;
  subject: string;
  comment: string;
  status: 'open' | 'pending' | 'closed' | 'snoozed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channel: 'email' | 'chat' | 'sms' | 'social' | 'phone';
  tags?: string[];
  customFields?: Record<string, string>;
}

// Gorgias macro (response template) structure
export interface GorgiasMacro {
  id: string;
  name: string;
  content: string;
  description?: string;
  tags?: string[];
}

// Gorgias response structure
export interface GorgiasResponse {
  id: string;
  ticketId: string;
  content: string;
  agentName?: string;
  isInternal?: boolean;
}

// Gorgias template types
export type GorgiasTemplateType = 'ticket' | 'macro' | 'response' | 'signature';

// Gorgias template definition
export interface GorgiasTemplate {
  id: string;
  type: GorgiasTemplateType;
  name: string;
  content: string;
  locale: string;
}

// Common Gorgias variables that should be preserved
const GORGIAS_VARIABLES = [
  // Ticket variables
  '{{ticket.id}}',
  '{{ticket.subject}}',
  '{{ticket.status}}',
  '{{ticket.priority}}',
  '{{ticket.channel}}',
  '{{ticket.created_at}}',
  '{{ticket.updated_at}}',
  '{{ticket.tags}}',
  // Requester variables
  '{{ticket.requester}}',
  '{{ticket.requester.email}}',
  '{{ticket.requester.name}}',
  '{{ticket.requester.first_name}}',
  '{{ticket.requester.last_name}}',
  '{{ticket.requester.phone}}',
  // Customer variables
  '{{customer}}',
  '{{customer.email}}',
  '{{customer.name}}',
  '{{customer.first_name}}',
  '{{customer.last_name}}',
  '{{customer.phone}}',
  // Agent variables
  '{{agent}}',
  '{{agent.name}}',
  '{{agent.first_name}}',
  '{{agent.last_name}}',
  '{{agent.email}}',
  // Order variables
  '{{order}}',
  '{{order.id}}',
  '{{order.name}}',
  '{{order.total}}',
  '{{order.status}}',
  // Shopify variables
  '{{shop}}',
  '{{shop.name}}',
  '{{shop.domain}}',
  '{{shop.email}}',
  // Custom fields
  '{{custom_field.*}}',
  // Date/time variables
  '{{now}}',
  '{{today}}',
  // Generic pattern for any {{variable}}
];

// Variable pattern regex
const VARIABLE_REGEX = /\{\{[^{}]+\}\}/g;

/**
 * Extract Gorgias variables from text and replace with placeholders
 * Returns the text with placeholders and a map to restore variables
 */
function extractVariables(text: string): {
  textWithPlaceholders: string;
  variableMap: Map<string, string>;
} {
  const variableMap = new Map<string, string>();
  let placeholderIndex = 0;

  const textWithPlaceholders = text.replace(VARIABLE_REGEX, (match) => {
    const placeholder = `__VAR_${placeholderIndex}__`;
    variableMap.set(placeholder, match);
    placeholderIndex++;
    return placeholder;
  });

  return { textWithPlaceholders, variableMap };
}

/**
 * Restore Gorgias variables from placeholders
 */
function restoreVariables(
  text: string,
  variableMap: Map<string, string>
): string {
  let result = text;
  for (const [placeholder, variable] of variableMap.entries()) {
    result = result.replace(placeholder, variable);
  }
  return result;
}

/**
 * Basic translation simulation - in production, this would call a translation service
 */
function simulateTranslation(text: string, locale: string): string {
  // Simple prefix-based translation for testing
  return `[${locale}] ${text}`;
}

/**
 * Translate a Gorgias ticket while preserving variables
 */
export async function translateTicket(
  ticket: GorgiasTicket,
  locale: string
): Promise<GorgiasTicket> {
  // Extract variables from subject
  const subjectExtraction = extractVariables(ticket.subject);
  const translatedSubjectContent = simulateTranslation(
    subjectExtraction.textWithPlaceholders,
    locale
  );
  const translatedSubject = restoreVariables(
    translatedSubjectContent,
    subjectExtraction.variableMap
  );

  // Extract variables from comment
  const commentExtraction = extractVariables(ticket.comment);
  const translatedCommentContent = simulateTranslation(
    commentExtraction.textWithPlaceholders,
    locale
  );
  const translatedComment = restoreVariables(
    translatedCommentContent,
    commentExtraction.variableMap
  );

  return {
    ...ticket,
    subject: translatedSubject,
    comment: translatedComment,
  };
}

/**
 * Translate a Gorgias macro (response template) while preserving variables
 */
export async function translateMacro(
  macro: GorgiasMacro,
  locale: string
): Promise<GorgiasMacro> {
  // Extract variables from content
  const contentExtraction = extractVariables(macro.content);
  const translatedContent = simulateTranslation(
    contentExtraction.textWithPlaceholders,
    locale
  );
  const finalContent = restoreVariables(
    translatedContent,
    contentExtraction.variableMap
  );

  // Translate name (no variables expected in name)
  const translatedName = simulateTranslation(macro.name, locale);

  // Translate description if exists
  let translatedDescription = macro.description;
  if (macro.description) {
    const descExtraction = extractVariables(macro.description);
    const translatedDesc = simulateTranslation(
      descExtraction.textWithPlaceholders,
      locale
    );
    translatedDescription = restoreVariables(translatedDesc, descExtraction.variableMap);
  }

  return {
    ...macro,
    name: translatedName,
    content: finalContent,
    description: translatedDescription,
  };
}

/**
 * Translate a Gorgias response while preserving variables
 */
export async function translateResponse(
  response: GorgiasResponse,
  locale: string
): Promise<GorgiasResponse> {
  // Extract variables from content
  const contentExtraction = extractVariables(response.content);
  const translatedContent = simulateTranslation(
    contentExtraction.textWithPlaceholders,
    locale
  );
  const finalContent = restoreVariables(
    translatedContent,
    contentExtraction.variableMap
  );

  return {
    ...response,
    content: finalContent,
  };
}

/**
 * Get pre-defined Gorgias templates for a locale
 */
export function getGorgiasTemplates(locale: string): GorgiasTemplate[] {
  const templates: GorgiasTemplate[] = [
    {
      id: `greeting-${locale}`,
      type: 'macro',
      name: locale === 'ar' ? 'تحية عامة' : 'General Greeting',
      content:
        locale === 'ar'
          ? 'مرحبًا {{ticket.requester.first_name}}، شكرًا لتواصلك معنا!'
          : `Hello {{ticket.requester.first_name}}, thank you for reaching out!`,
      locale,
    },
    {
      id: `order-inquiry-${locale}`,
      type: 'macro',
      name: locale === 'ar' ? 'استفسار عن الطلب' : 'Order Inquiry Response',
      content:
        locale === 'ar'
          ? 'تم استلام استفسارك بخصوص الطلب رقم {{order.name}}. سنتحقق من حالة طلبك ونرد عليك قريبًا.'
          : `We received your inquiry about order {{order.name}}. We'll check your order status and get back to you soon.`,
      locale,
    },
    {
      id: `shipping-update-${locale}`,
      type: 'macro',
      name: locale === 'ar' ? 'تحديث الشحن' : 'Shipping Update',
      content:
        locale === 'ar'
          ? 'عزيزي {{customer.name}}، طلبك {{order.name}} قيد الشحن حاليًا. رقم التتبع: {{custom_field.tracking_number}}'
          : `Dear {{customer.name}}, your order {{order.name}} is currently being shipped. Tracking number: {{custom_field.tracking_number}}`,
      locale,
    },
    {
      id: `close-ticket-${locale}`,
      type: 'macro',
      name: locale === 'ar' ? 'إغلاق التذكرة' : 'Close Ticket',
      content:
        locale === 'ar'
          ? 'تم حل المشكلة. إذا كنت بحاجة إلى مزيد من المساعدة، فلا تتردد في فتح تذكرة جديدة. تحياتي، {{agent.name}}'
          : `The issue has been resolved. If you need further assistance, please don't hesitate to open a new ticket. Best regards, {{agent.name}}`,
      locale,
    },
    {
      id: `signature-${locale}`,
      type: 'signature',
      name: locale === 'ar' ? 'التوقيع الافتراضي' : 'Default Signature',
      content:
        locale === 'ar'
          ? 'مع أطيب التحيات،\n{{agent.name}}\n{{shop.name}}\n{{shop.email}}'
          : `Best regards,\n{{agent.name}}\n{{shop.name}}\n{{shop.email}}`,
      locale,
    },
    {
      id: `refund-confirmation-${locale}`,
      type: 'response',
      name: locale === 'ar' ? 'تأكيد الاسترداد' : 'Refund Confirmation',
      content:
        locale === 'ar'
          ? 'تم معالجة استردادك لطلب {{order.name}} بمبلغ {{order.total}}. سيستغرق الأمر 5-10 أيام عمل ليظهر في حسابك.'
          : `Your refund for order {{order.name}} in the amount of {{order.total}} has been processed. It will take 5-10 business days to appear in your account.`,
      locale,
    },
    {
      id: `escalation-${locale}`,
      type: 'macro',
      name: locale === 'ar' ? 'رفع الأولوية' : 'Escalation Notice',
      content:
        locale === 'ar'
          ? 'تم رفع تذكرتك رقم {{ticket.id}} إلى الفريق المختص. الأولوية: {{ticket.priority}}. سنتواصل معك خلال 24 ساعة.'
          : `Your ticket {{ticket.id}} has been escalated to the appropriate team. Priority: {{ticket.priority}}. We will contact you within 24 hours.`,
      locale,
    },
    {
      id: `feedback-request-${locale}`,
      type: 'macro',
      name: locale === 'ar' ? 'طلب تقييم' : 'Feedback Request',
      content:
        locale === 'ar'
          ? 'نأمل أن تكون راضيًا عن خدمتنا. يرجى مشاركة ملاحظاتك حول تذكرة رقم {{ticket.id}}.'
          : `We hope you were satisfied with our service. Please share your feedback about ticket {{ticket.id}}.`,
      locale,
    },
  ];

  return templates;
}

/**
 * Translate multiple tickets in batch
 */
export async function translateTicketsBatch(
  tickets: GorgiasTicket[],
  locale: string
): Promise<GorgiasTicket[]> {
  return Promise.all(tickets.map((ticket) => translateTicket(ticket, locale)));
}

/**
 * Translate multiple macros in batch
 */
export async function translateMacrosBatch(
  macros: GorgiasMacro[],
  locale: string
): Promise<GorgiasMacro[]> {
  return Promise.all(macros.map((macro) => translateMacro(macro, locale)));
}

/**
 * Check if text contains Gorgias variables
 */
export function containsVariables(text: string): boolean {
  return new RegExp(VARIABLE_REGEX.source).test(text);
}

/**
 * Extract all variables from text
 */
export function extractAllVariables(text: string): string[] {
  const matches = text.match(VARIABLE_REGEX);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Validate that all variables in original are preserved in translated
 */
export function validateVariablePreservation(
  original: string,
  translated: string
): { valid: boolean; missing: string[] } {
  const originalVars = extractAllVariables(original);
  const translatedVars = extractAllVariables(translated);

  const missing = originalVars.filter((v) => !translatedVars.includes(v));

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Get list of supported Gorgias variable categories
 */
export function getVariableCategories(): Record<string, string[]> {
  return {
    ticket: [
      '{{ticket.id}}',
      '{{ticket.subject}}',
      '{{ticket.status}}',
      '{{ticket.priority}}',
      '{{ticket.channel}}',
      '{{ticket.created_at}}',
      '{{ticket.updated_at}}',
      '{{ticket.tags}}',
    ],
    requester: [
      '{{ticket.requester}}',
      '{{ticket.requester.email}}',
      '{{ticket.requester.name}}',
      '{{ticket.requester.first_name}}',
      '{{ticket.requester.last_name}}',
      '{{ticket.requester.phone}}',
    ],
    customer: [
      '{{customer}}',
      '{{customer.email}}',
      '{{customer.name}}',
      '{{customer.first_name}}',
      '{{customer.last_name}}',
      '{{customer.phone}}',
    ],
    agent: [
      '{{agent}}',
      '{{agent.name}}',
      '{{agent.first_name}}',
      '{{agent.last_name}}',
      '{{agent.email}}',
    ],
    order: [
      '{{order}}',
      '{{order.id}}',
      '{{order.name}}',
      '{{order.total}}',
      '{{order.status}}',
    ],
    shop: [
      '{{shop}}',
      '{{shop.name}}',
      '{{shop.domain}}',
      '{{shop.email}}',
    ],
    date: ['{{now}}', '{{today}}'],
  };
}
