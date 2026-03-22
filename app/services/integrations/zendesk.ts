/**
 * Zendesk Help Center Integration Service
 * Handles translation of Zendesk articles, categories, sections, and dynamic content
 */

// Zendesk article structure
export interface ZendeskArticle {
  id: string;
  title: string;
  body: string;
  locale: string;
  meta?: {
    title?: string;
    description?: string;
  };
  labels?: string[];
  author?: string;
  created_at?: string;
  updated_at?: string;
}

// Zendesk category structure
export interface ZendeskCategory {
  id: string;
  name: string;
  description?: string;
  locale: string;
  position?: number;
}

// Zendesk section structure
export interface ZendeskSection {
  id: string;
  name: string;
  description?: string;
  locale: string;
  category_id?: string;
  position?: number;
}

// Dynamic content placeholder
export interface DynamicContentPlaceholder {
  placeholder: string;
  key: string;
}

// Translation result for articles
export interface TranslatedArticle {
  id: string;
  title: string;
  body: string;
  locale: string;
  meta?: {
    title?: string;
    description?: string;
  };
  originalLocale: string;
}

// Translation result for categories
export interface TranslatedCategory {
  id: string;
  name: string;
  description?: string;
  locale: string;
  originalLocale: string;
}

// Translation result for sections
export interface TranslatedSection {
  id: string;
  name: string;
  description?: string;
  locale: string;
  originalLocale: string;
}

// Zendesk template structure
export interface ZendeskTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  locale: string;
}

// Regex pattern for Zendesk dynamic content placeholders
const DYNAMIC_CONTENT_REGEX = /\{\{dc\.[\w_\-]+\}\}/g;

// Regex pattern for HTML tags to preserve during translation
const HTML_TAG_REGEX = /<[^>]+>/g;

// Regex pattern for Zendesk placeholders like {{ticket.requester.name}}
const ZENDESK_PLACEHOLDER_REGEX = /\{\{[^}]+\}\}/g;

/**
 * Extract dynamic content placeholders from content
 * Returns array of found placeholders with their keys
 */
export function extractDynamicContent(content: string): DynamicContentPlaceholder[] {
  const matches = content.matchAll(DYNAMIC_CONTENT_REGEX);
  const placeholders: DynamicContentPlaceholder[] = [];
  const seen = new Set<string>();

  for (const match of matches) {
    const placeholder = match[0];
    if (!seen.has(placeholder)) {
      seen.add(placeholder);
      // Extract key from {{dc.key_name}}
      const key = placeholder.slice(5, -2); // Remove {{dc. and }}
      placeholders.push({ placeholder, key });
    }
  }

  return placeholders;
}

/**
 * Replace dynamic content placeholders with temporary markers
 * This preserves them during translation
 */
export function preserveDynamicContent(content: string): {
  processedContent: string;
  placeholders: Map<string, string>;
} {
  const placeholders = new Map<string, string>();
  let counter = 0;

  const processedContent = content.replace(DYNAMIC_CONTENT_REGEX, (match) => {
    const marker = `__DC_PLACEHOLDER_${counter++}__`;
    placeholders.set(marker, match);
    return marker;
  });

  return { processedContent, placeholders };
}

/**
 * Restore dynamic content placeholders after translation
 */
export function restoreDynamicContent(
  content: string,
  placeholders: Map<string, string>
): string {
  let restored = content;
  for (const [marker, original] of placeholders) {
    restored = restored.replaceAll(marker, original);
  }
  return restored;
}

/**
 * Preserve all Zendesk placeholders (including non-dc ones)
 */
export function preserveAllPlaceholders(content: string): {
  processedContent: string;
  placeholders: Map<string, string>;
} {
  const placeholders = new Map<string, string>();
  let counter = 0;

  const processedContent = content.replace(ZENDESK_PLACEHOLDER_REGEX, (match) => {
    const marker = `__ZD_PLACEHOLDER_${counter++}__`;
    placeholders.set(marker, match);
    return marker;
  });

  return { processedContent, placeholders };
}

/**
 * Detect if content contains RTL-sensitive elements
 */
export function containsRTLElements(content: string): boolean {
  // Check for common RTL-sensitive patterns
  const rtlPatterns = [
    /\b(he|ar|fa|ur|yi)\b/, // RTL language codes
    /dir=["']rtl["']/i, // RTL direction attribute
    /lang=["']\w{2}["']/, // Language attributes
  ];
  
  return rtlPatterns.some(pattern => pattern.test(content));
}

/**
 * Apply RTL adaptations to translated content
 */
export function applyRTLAdaptations(content: string, locale: string): string {
  const rtlLocales = ['ar', 'he', 'fa', 'ur', 'yi', 'dv', 'ps', 'sd'];
  
  if (!rtlLocales.includes(locale)) {
    return content;
  }

  // Add RTL direction to HTML elements if not present
  let adapted = content;
  
  // Add dir="rtl" to root html element if present
  adapted = adapted.replace(
    /<html([^>]*)>/i,
    (match, attrs) => {
      if (!attrs.includes('dir=')) {
        return `<html${attrs} dir="rtl">`;
      }
      return match;
    }
  );

  // Add dir="rtl" to body if no dir attribute exists anywhere
  const hasDir = adapted.match(/dir=["'][^"']*["']/i);
  if (!hasDir) {
    adapted = adapted.replace(
      /<body([^>]*)>/i,
      (match, attrs) => {
        if (!attrs.includes('dir=')) {
          return `<body${attrs} dir="rtl">`;
        }
        return match;
      }
    );
  }

  // Add lang attribute
  adapted = adapted.replace(
    /<html([^>]*)>/i,
    (match, attrs) => {
      if (!attrs.includes('lang=')) {
        return `<html${attrs} lang="${locale}">`;
      }
      return match.replace(
        /lang=["'][^"']*["']/i,
        `lang="${locale}"`
      );
    }
  );

  return adapted;
}

/**
 * Translate article while preserving dynamic content and placeholders
 */
export async function translateArticle(
  article: ZendeskArticle,
  targetLocale: string,
  translateFn?: (text: string, target: string) => Promise<string>
): Promise<TranslatedArticle> {
  // Default translation function (marks text for translation)
  const defaultTranslate = async (text: string, target: string): Promise<string> => {
    if (!text || text.trim().length === 0) return text;
    return `[${target}] ${text}`;
  };

  const translate = translateFn || defaultTranslate;

  // Preserve dynamic content in title
  const titlePreserved = preserveDynamicContent(article.title);
  const translatedTitle = await translate(titlePreserved.processedContent, targetLocale);
  const restoredTitle = restoreDynamicContent(translatedTitle, titlePreserved.placeholders);

  // Preserve all placeholders in body (dynamic content + other Zendesk placeholders)
  const bodyPreserved = preserveAllPlaceholders(article.body);
  const translatedBody = await translate(bodyPreserved.processedContent, targetLocale);
  let restoredBody = restoreDynamicContent(translatedBody, bodyPreserved.placeholders);

  // Apply RTL adaptations for RTL locales
  restoredBody = applyRTLAdaptations(restoredBody, targetLocale);

  // Translate meta fields if present
  let translatedMeta: TranslatedArticle['meta'] = undefined;
  if (article.meta) {
    translatedMeta = {};
    if (article.meta.title) {
      const metaTitlePreserved = preserveDynamicContent(article.meta.title);
      const translatedMetaTitle = await translate(metaTitlePreserved.processedContent, targetLocale);
      translatedMeta.title = restoreDynamicContent(translatedMetaTitle, metaTitlePreserved.placeholders);
    }
    if (article.meta.description) {
      const metaDescPreserved = preserveDynamicContent(article.meta.description);
      const translatedMetaDesc = await translate(metaDescPreserved.processedContent, targetLocale);
      translatedMeta.description = restoreDynamicContent(translatedMetaDesc, metaDescPreserved.placeholders);
    }
  }

  return {
    id: article.id,
    title: restoredTitle,
    body: restoredBody,
    locale: targetLocale,
    meta: translatedMeta,
    originalLocale: article.locale,
  };
}

/**
 * Translate category while preserving dynamic content
 */
export async function translateCategory(
  category: ZendeskCategory,
  targetLocale: string,
  translateFn?: (text: string, target: string) => Promise<string>
): Promise<TranslatedCategory> {
  const defaultTranslate = async (text: string, target: string): Promise<string> => {
    if (!text || text.trim().length === 0) return text;
    return `[${target}] ${text}`;
  };

  const translate = translateFn || defaultTranslate;

  // Translate name with dynamic content preservation
  const namePreserved = preserveDynamicContent(category.name);
  const translatedName = await translate(namePreserved.processedContent, targetLocale);
  const restoredName = restoreDynamicContent(translatedName, namePreserved.placeholders);

  // Translate description if present
  let restoredDescription: string | undefined;
  if (category.description) {
    const descPreserved = preserveDynamicContent(category.description);
    const translatedDesc = await translate(descPreserved.processedContent, targetLocale);
    restoredDescription = restoreDynamicContent(translatedDesc, descPreserved.placeholders);
  }

  return {
    id: category.id,
    name: restoredName,
    description: restoredDescription,
    locale: targetLocale,
    originalLocale: category.locale,
  };
}

/**
 * Translate section while preserving dynamic content
 */
export async function translateSection(
  section: ZendeskSection,
  targetLocale: string,
  translateFn?: (text: string, target: string) => Promise<string>
): Promise<TranslatedSection> {
  const defaultTranslate = async (text: string, target: string): Promise<string> => {
    if (!text || text.trim().length === 0) return text;
    return `[${target}] ${text}`;
  };

  const translate = translateFn || defaultTranslate;

  // Translate name with dynamic content preservation
  const namePreserved = preserveDynamicContent(section.name);
  const translatedName = await translate(namePreserved.processedContent, targetLocale);
  const restoredName = restoreDynamicContent(translatedName, namePreserved.placeholders);

  // Translate description if present
  let restoredDescription: string | undefined;
  if (section.description) {
    const descPreserved = preserveDynamicContent(section.description);
    const translatedDesc = await translate(descPreserved.processedContent, targetLocale);
    restoredDescription = restoreDynamicContent(translatedDesc, descPreserved.placeholders);
  }

  return {
    id: section.id,
    name: restoredName,
    description: restoredDescription,
    locale: targetLocale,
    originalLocale: section.locale,
  };
}

/**
 * Get Zendesk templates for a locale
 * Returns a collection of common templates localized for the target locale
 */
export function getZendeskTemplates(locale: string): ZendeskTemplate[] {
  const templates: Record<string, ZendeskTemplate[]> = {
    ar: [
      {
        id: 'welcome_ar',
        name: 'Welcome Email (Arabic)',
        subject: 'مرحباً بك في مركز المساعدة',
        body: '<p>مرحباً {{ticket.requester.name}}،</p><p>شكراً لتواصلك معنا. سنقوم بالرد على استفسارك في أقرب وقت ممكن.</p>',
        locale: 'ar',
      },
      {
        id: 'ticket_update_ar',
        name: 'Ticket Update (Arabic)',
        subject: 'تحديث على طلبك رقم {{ticket.id}}',
        body: '<p>عزيزي {{ticket.requester.name}}،</p><p>تم تحديث حالة طلبك إلى: {{ticket.status}}</p>',
        locale: 'ar',
      },
    ],
    he: [
      {
        id: 'welcome_he',
        name: 'Welcome Email (Hebrew)',
        subject: 'ברוכים הבאים למרכז העזרה',
        body: '<p>שלום {{ticket.requester.name}},</p><p>תודה שפנית אלינו. נשיב לפנייתך בהקדם האפשרי.</p>',
        locale: 'he',
      },
      {
        id: 'ticket_update_he',
        name: 'Ticket Update (Hebrew)',
        subject: 'עדכון בפניה מספר {{ticket.id}}',
        body: '<p>{{ticket.requester.name}} היקר,</p><p>סטטוס הפניה שלך עודכן ל: {{ticket.status}}</p>',
        locale: 'he',
      },
    ],
    en: [
      {
        id: 'welcome_en',
        name: 'Welcome Email (English)',
        subject: 'Welcome to our Help Center',
        body: '<p>Hello {{ticket.requester.name}},</p><p>Thank you for contacting us. We will respond to your inquiry as soon as possible.</p>',
        locale: 'en',
      },
      {
        id: 'ticket_update_en',
        name: 'Ticket Update (English)',
        subject: 'Update on your ticket #{{ticket.id}}',
        body: '<p>Dear {{ticket.requester.name}},</p><p>Your ticket status has been updated to: {{ticket.status}}</p>',
        locale: 'en',
      },
    ],
  };

  // Return templates for the requested locale, or fallback to English
  return templates[locale] || templates['en'] || [];
}

/**
 * Validate if locale is supported by Zendesk
 */
export function isSupportedZendeskLocale(locale: string): boolean {
  const supportedLocales = [
    'en', 'ar', 'he', 'es', 'fr', 'de', 'it', 'pt', 'nl',
    'ja', 'ko', 'zh', 'ru', 'pl', 'tr', 'th', 'vi', 'id',
    'da', 'sv', 'no', 'fi', 'cs', 'hu', 'ro', 'bg', 'hr',
    'sk', 'sl', 'et', 'lv', 'lt', 'uk', 'fa', 'ur', 'hi',
  ];

  return supportedLocales.includes(locale);
}

/**
 * Batch translate multiple articles
 */
export async function batchTranslateArticles(
  articles: ZendeskArticle[],
  targetLocale: string,
  translateFn?: (text: string, target: string) => Promise<string>
): Promise<TranslatedArticle[]> {
  const results: TranslatedArticle[] = [];

  for (const article of articles) {
    try {
      const translated = await translateArticle(article, targetLocale, translateFn);
      results.push(translated);
    } catch (error) {
      // Log error but continue with other articles
      console.error(`Failed to translate article ${article.id}:`, error);
      // Return original article marked as failed - ensure body is a string
      results.push({
        id: article.id,
        title: article.title,
        body: article.body || '',
        locale: targetLocale,
        originalLocale: article.locale,
      });
    }
  }

  return results;
}

/**
 * Batch translate multiple categories
 */
export async function batchTranslateCategories(
  categories: ZendeskCategory[],
  targetLocale: string,
  translateFn?: (text: string, target: string) => Promise<string>
): Promise<TranslatedCategory[]> {
  const results: TranslatedCategory[] = [];

  for (const category of categories) {
    try {
      const translated = await translateCategory(category, targetLocale, translateFn);
      results.push(translated);
    } catch (error) {
      console.error(`Failed to translate category ${category.id}:`, error);
      results.push({
        id: category.id,
        name: category.name,
        description: category.description,
        locale: targetLocale,
        originalLocale: category.locale,
      });
    }
  }

  return results;
}

/**
 * Batch translate multiple sections
 */
export async function batchTranslateSections(
  sections: ZendeskSection[],
  targetLocale: string,
  translateFn?: (text: string, target: string) => Promise<string>
): Promise<TranslatedSection[]> {
  const results: TranslatedSection[] = [];

  for (const section of sections) {
    try {
      const translated = await translateSection(section, targetLocale, translateFn);
      results.push(translated);
    } catch (error) {
      console.error(`Failed to translate section ${section.id}:`, error);
      results.push({
        id: section.id,
        name: section.name,
        description: section.description,
        locale: targetLocale,
        originalLocale: section.locale,
      });
    }
  }

  return results;
}

/**
 * Get RTL-specific CSS for Zendesk content
 */
export function getRTLStyles(): string {
  return `
    .zendesk-content[dir="rtl"] {
      direction: rtl;
      text-align: right;
    }
    .zendesk-content[dir="rtl"] ul,
    .zendesk-content[dir="rtl"] ol {
      padding-right: 20px;
      padding-left: 0;
    }
    .zendesk-content[dir="rtl"] blockquote {
      border-right: 3px solid #ddd;
      border-left: none;
      padding-right: 15px;
      padding-left: 0;
      margin-right: 0;
    }
  `.trim();
}

/**
 * Sanitize content before translation to remove potentially harmful content
 */
export function sanitizeContent(content: string): string {
  // Remove script tags and event handlers
  let sanitized = content;
  
  // Remove script tags
  sanitized = sanitized.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Remove onclick and similar event handlers
  sanitized = sanitized.replace(/\s+on\w+=["'][^"']*["']/gi, '');
  
  // Remove javascript: URLs
  sanitized = sanitized.replace(/href=["']javascript:[^"']*["']/gi, 'href="#"');
  
  return sanitized;
}
