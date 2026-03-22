/**
 * Klaviyo Email Marketing Integration
 * T0014: Integrations - Shopify Ecosystem & Third-Party Apps
 *
 * Translates Klaviyo email templates while preserving dynamic merge tags.
 */

export interface KlaviyoTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  text?: string;
  /** Template category; used to choose the correct translation strategy */
  category?: 'welcome' | 'abandoned-cart' | 'order-confirmation' | 'newsletter' | 'promotional';
}

export interface KlaviyoTranslationResult {
  templateId: string;
  locale: string;
  subject: string;
  html: string;
  text?: string;
  mergeTagsPreserved: number;
}

export interface KlaviyoApiConfig {
  apiKey: string;
  /** Base URL override for testing */
  baseUrl?: string;
}

const DEFAULT_BASE_URL = 'https://a.klaviyo.com/api';

/**
 * Klaviyo dynamic tag patterns that must not be translated.
 *   {{ first_name }}              — Liquid-style
 *   {% if condition %}...{% endif %}
 *   {# comment #}
 */
const KLAVIYO_TAG_PATTERNS: RegExp[] = [
  /\{%-?\s*.*?-?%\}/gs,   // block tags {% … %}
  /\{\{-?\s*.*?-?\}\}/gs, // variable tags {{ … }}
  /\{#.*?#\}/gs,          // comment tags {# … #}
];

interface ProtectedTemplate {
  template: string;
  placeholders: Map<string, string>;
}

/**
 * Replace all Klaviyo dynamic tags with stable placeholders so they survive translation.
 */
export function protectKlaviyoTags(template: string): ProtectedTemplate {
  const placeholders = new Map<string, string>();
  let counter = 0;
  let result = template;

  for (const pattern of KLAVIYO_TAG_PATTERNS) {
    result = result.replace(pattern, (match) => {
      const key = `__KLV_${counter++}__`;
      placeholders.set(key, match);
      return key;
    });
  }

  return { template: result, placeholders };
}

/**
 * Restore placeholders to their original Klaviyo tags.
 */
export function restoreKlaviyoTags(
  template: string,
  placeholders: Map<string, string>
): string {
  let result = template;
  placeholders.forEach((original, key) => {
    result = result.split(key).join(original);
  });
  return result;
}

/**
 * Apply RTL attributes for right-to-left locales.
 */
function applyRTL(html: string): string {
  let result = html;
  if (!result.match(/dir\s*=/i)) {
    result = result.replace(/<body/i, '<body dir="rtl"');
  }
  const rtlStyle = `<style>body[dir="rtl"]{direction:rtl;text-align:right}</style>`;
  result = result.replace('</head>', `${rtlStyle}</head>`);
  return result;
}

const RTL_LOCALES = new Set(['ar', 'he', 'fa', 'ur']);

/**
 * Translate a single Klaviyo template for a target locale.
 * Placeholder implementation — replace the translation step with a real engine.
 */
export async function translateKlaviyoTemplate(
  template: KlaviyoTemplate,
  targetLocale: string
): Promise<KlaviyoTranslationResult> {
  const locale = targetLocale.split('-')[0]?.toLowerCase() ?? 'en';

  // Protect dynamic tags in subject
  const { template: protectedSubject, placeholders: subjectPlaceholders } =
    protectKlaviyoTags(template.subject);

  // Protect dynamic tags in HTML body
  const { template: protectedHtml, placeholders: htmlPlaceholders } =
    protectKlaviyoTags(template.html);

  // --- Placeholder translation (replace with real engine) ---
  let translatedSubject = `[${locale}] ${protectedSubject}`;
  let translatedHtml = `[${locale}] ${protectedHtml}`;

  // Restore tags
  translatedSubject = restoreKlaviyoTags(translatedSubject, subjectPlaceholders);
  translatedHtml = restoreKlaviyoTags(translatedHtml, htmlPlaceholders);

  // RTL formatting
  if (RTL_LOCALES.has(locale)) {
    translatedHtml = applyRTL(translatedHtml);
  }

  // Translate plain-text version if present
  let translatedText: string | undefined;
  if (template.text) {
    const { template: protectedText, placeholders: textPlaceholders } =
      protectKlaviyoTags(template.text);
    translatedText = restoreKlaviyoTags(`[${locale}] ${protectedText}`, textPlaceholders);
  }

  return {
    templateId: template.id,
    locale: targetLocale,
    subject: translatedSubject,
    html: translatedHtml,
    text: translatedText,
    mergeTagsPreserved: htmlPlaceholders.size + subjectPlaceholders.size,
  };
}

/**
 * Fetch a Klaviyo template by ID from the Klaviyo API (v2024-10-15).
 */
export async function fetchKlaviyoTemplate(
  config: KlaviyoApiConfig,
  templateId: string
): Promise<KlaviyoTemplate> {
  const url = `${config.baseUrl ?? DEFAULT_BASE_URL}/templates/${templateId}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Klaviyo-API-Key ${config.apiKey}`,
      revision: '2024-10-15',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Klaviyo API error ${response.status}: ${response.statusText}`);
  }

  const data = (await response.json()) as {
    data: {
      id: string;
      attributes: {
        name: string;
        subject?: string;
        html?: string;
        text?: string;
      };
    };
  };

  return {
    id: data.data.id,
    name: data.data.attributes.name,
    subject: data.data.attributes.subject ?? '',
    html: data.data.attributes.html ?? '',
    text: data.data.attributes.text,
  };
}

/**
 * List all templates for a Klaviyo account.
 */
export async function listKlaviyoTemplates(
  config: KlaviyoApiConfig
): Promise<Pick<KlaviyoTemplate, 'id' | 'name'>[]> {
  const url = `${config.baseUrl ?? DEFAULT_BASE_URL}/templates`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Klaviyo-API-Key ${config.apiKey}`,
      revision: '2024-10-15',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Klaviyo API error ${response.status}: ${response.statusText}`);
  }

  const data = (await response.json()) as {
    data: Array<{ id: string; attributes: { name: string } }>;
  };

  return data.data.map((t) => ({ id: t.id, name: t.attributes.name }));
}
