/**
 * Zendesk Support Integration
 * T0014: Integrations - Shopify Ecosystem & Third-Party Apps
 *
 * Translates Zendesk Help Center articles and detects ticket language.
 */

export interface ZendeskArticle {
  id: string;
  title: string;
  body: string;
  locale: string;
  sectionId?: string;
  authorId?: string;
  draft?: boolean;
  createdAt?: string;
  updatedAt?: string;
  url?: string;
}

export interface ZendeskTranslatedArticle extends ZendeskArticle {
  originalTitle: string;
  originalBody: string;
  translatedLocale: string;
  sourceLocale: string;
}

export interface ZendeskTicket {
  id: string;
  subject: string;
  description: string;
  status: 'new' | 'open' | 'pending' | 'hold' | 'solved' | 'closed';
  requesterLocale?: string;
  tags?: string[];
  createdAt?: string;
}

export interface ZendeskApiConfig {
  subdomain: string;
  email: string;
  apiToken: string;
  /** Base URL override for testing */
  baseUrl?: string;
}

function buildBaseUrl(config: ZendeskApiConfig): string {
  return config.baseUrl ?? `https://${config.subdomain}.zendesk.com/api/v2`;
}

function authHeader(config: ZendeskApiConfig): string {
  const credentials = Buffer.from(`${config.email}/token:${config.apiToken}`).toString('base64');
  return `Basic ${credentials}`;
}

/**
 * Fetch Help Center articles for a given locale.
 */
export async function fetchZendeskArticles(
  config: ZendeskApiConfig,
  options: { locale?: string; sectionId?: string; page?: number; perPage?: number } = {}
): Promise<ZendeskArticle[]> {
  const { locale = 'en-us', sectionId, page = 1, perPage = 30 } = options;

  const path = sectionId
    ? `/help_center/${locale}/sections/${sectionId}/articles`
    : `/help_center/${locale}/articles`;

  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  const url = `${buildBaseUrl(config)}${path}?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      Authorization: authHeader(config),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Zendesk API error ${response.status}: ${response.statusText}`);
  }

  const data = (await response.json()) as {
    articles?: Array<{
      id: number;
      title: string;
      body: string;
      locale: string;
      section_id: number;
      author_id: number;
      draft: boolean;
      created_at: string;
      updated_at: string;
      html_url: string;
    }>;
  };

  return (data.articles ?? []).map((a) => ({
    id: String(a.id),
    title: a.title,
    body: a.body,
    locale: a.locale,
    sectionId: String(a.section_id),
    authorId: String(a.author_id),
    draft: a.draft,
    createdAt: a.created_at,
    updatedAt: a.updated_at,
    url: a.html_url,
  }));
}

/**
 * Fetch a single Zendesk Help Center article.
 */
export async function fetchZendeskArticle(
  config: ZendeskApiConfig,
  articleId: string,
  locale = 'en-us'
): Promise<ZendeskArticle> {
  const url = `${buildBaseUrl(config)}/help_center/${locale}/articles/${articleId}`;

  const response = await fetch(url, {
    headers: {
      Authorization: authHeader(config),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Zendesk API error ${response.status}: ${response.statusText}`);
  }

  const data = (await response.json()) as {
    article: {
      id: number;
      title: string;
      body: string;
      locale: string;
      section_id: number;
      author_id: number;
      draft: boolean;
      created_at: string;
      updated_at: string;
      html_url: string;
    };
  };

  const a = data.article;
  return {
    id: String(a.id),
    title: a.title,
    body: a.body,
    locale: a.locale,
    sectionId: String(a.section_id),
    authorId: String(a.author_id),
    draft: a.draft,
    createdAt: a.created_at,
    updatedAt: a.updated_at,
    url: a.html_url,
  };
}

/**
 * Translate a single Zendesk Help Center article.
 * Placeholder implementation — replace with a real translation engine.
 */
export async function translateZendeskArticle(
  article: ZendeskArticle,
  targetLocale: string
): Promise<ZendeskTranslatedArticle> {
  return {
    ...article,
    originalTitle: article.title,
    originalBody: article.body,
    title: `[${targetLocale}] ${article.title}`,
    body: `[${targetLocale}] ${article.body}`,
    locale: targetLocale,
    translatedLocale: targetLocale,
    sourceLocale: article.locale,
  };
}

/**
 * Translate multiple articles in a batch.
 */
export async function translateZendeskArticles(
  articles: ZendeskArticle[],
  targetLocale: string
): Promise<ZendeskTranslatedArticle[]> {
  return Promise.all(articles.map((a) => translateZendeskArticle(a, targetLocale)));
}

/**
 * Detect the language of a support ticket using a basic Unicode heuristic.
 * In production, replace with a language-detection library such as `franc`.
 */
export function detectTicketLanguage(ticket: ZendeskTicket): string {
  if (ticket.requesterLocale) return ticket.requesterLocale;

  const text = `${ticket.subject} ${ticket.description}`;

  const arabicRange = /[\u0600-\u06FF]/;
  const hebrewRange = /[\u0590-\u05FF]/;
  const persianRange = /[\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

  if (arabicRange.test(text)) return 'ar';
  if (hebrewRange.test(text)) return 'he';
  if (persianRange.test(text)) return 'fa';

  return 'en';
}

/**
 * Translate a ticket's subject and description.
 */
export async function translateZendeskTicket(
  ticket: ZendeskTicket,
  targetLocale: string
): Promise<ZendeskTicket & { translatedLocale: string; detectedLocale: string }> {
  const detectedLocale = detectTicketLanguage(ticket);

  return {
    ...ticket,
    subject: `[${targetLocale}] ${ticket.subject}`,
    description: `[${targetLocale}] ${ticket.description}`,
    translatedLocale: targetLocale,
    detectedLocale,
  };
}

/**
 * Push a translated article back to Zendesk as a translation resource.
 * Requires Zendesk Guide Professional or higher.
 */
export async function publishZendeskTranslation(
  config: ZendeskApiConfig,
  articleId: string,
  translated: ZendeskTranslatedArticle
): Promise<void> {
  const url = `${buildBaseUrl(config)}/help_center/articles/${articleId}/translations`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: authHeader(config),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      translation: {
        locale: translated.translatedLocale,
        title: translated.title,
        body: translated.body,
        draft: translated.draft ?? false,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Zendesk publish translation error ${response.status}: ${response.statusText}`
    );
  }
}
