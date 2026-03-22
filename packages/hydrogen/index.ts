/**
 * RTL Storefront - Hydrogen Headless Translation Package
 *
 * Stub package for future Hydrogen integration.
 * Provides type definitions and factory functions for the headless translation API.
 */

// --- Type Definitions ---

export interface TranslationResource {
  key: string;
  value: string;
  locale: string;
  updatedAt?: string;
}

export interface TranslationQuery {
  locale: string;
  resourceType?: string;
  keys?: string[];
  limit?: number;
  cursor?: string;
}

export interface TranslationMutation {
  locale: string;
  translations: Array<{ key: string; value: string }>;
}

export interface TranslationResponse<T> {
  data: T;
  errors?: Array<{ message: string; code: string }>;
  pagination?: {
    hasNextPage: boolean;
    cursor: string;
  };
}

export interface HeadlessTranslationClientConfig {
  shopDomain: string;
  accessToken: string;
  apiVersion?: string;
  defaultLocale?: string;
  cacheStrategy?: "no-cache" | "short" | "long" | "custom";
  cacheTtl?: number;
}

/**
 * Available API endpoint paths for the headless translation service.
 */
export const TranslationEndpoints = {
  /** List all available locales for the shop */
  locales: "/api/translations/locales",
  /** Get translations for a specific locale */
  translations: "/api/translations/:locale",
  /** Get translations for a specific resource type */
  resource: "/api/translations/:locale/:resourceType",
  /** Get a single translation by key */
  single: "/api/translations/:locale/key/:key",
  /** Batch create/update translations */
  batch: "/api/translations/batch",
  /** Get translation status/progress for a locale */
  status: "/api/translations/:locale/status",
  /** Trigger AI translation for missing keys */
  aiTranslate: "/api/translations/:locale/ai-translate",
  /** Get RTL layout configuration */
  rtlConfig: "/api/translations/rtl-config",
} as const;

export type TranslationEndpointKey = keyof typeof TranslationEndpoints;

/**
 * Headless translation client for use with Hydrogen storefronts.
 */
export interface HeadlessTranslationClient {
  /** Fetch translations for a locale */
  getTranslations(query: TranslationQuery): Promise<TranslationResponse<TranslationResource[]>>;

  /** Fetch a single translation by key */
  getTranslation(locale: string, key: string): Promise<TranslationResponse<TranslationResource>>;

  /** Create or update translations */
  setTranslations(mutation: TranslationMutation): Promise<TranslationResponse<TranslationResource[]>>;

  /** List available locales */
  getLocales(): Promise<TranslationResponse<Array<{ code: string; name: string; isRtl: boolean }>>>;

  /** Check if a locale uses RTL direction */
  isRtlLocale(locale: string): boolean;

  /** Get the API endpoint URL for a given path */
  getEndpointUrl(endpoint: TranslationEndpointKey, params?: Record<string, string>): string;

  /** Get RTL configuration for the storefront */
  getRtlConfig(): Promise<TranslationResponse<{ rtlLocales: string[]; defaultDirection: string }>>;
}

// --- RTL Locale Detection ---

const RTL_LOCALE_CODES = new Set([
  "ar", "he", "fa", "ur", "ps", "ku", "sd", "yi",
  "ar-SA", "ar-EG", "ar-AE", "ar-MA", "he-IL", "fa-IR", "ur-PK",
]);

function isRtl(locale: string): boolean {
  if (RTL_LOCALE_CODES.has(locale)) return true;
  const lang = locale.split("-")[0].toLowerCase();
  return RTL_LOCALE_CODES.has(lang);
}

// --- Factory ---

/**
 * Create a headless translation client for Hydrogen storefronts.
 *
 * @example
 * ```ts
 * const client = createHeadlessClient({
 *   shopDomain: "my-store.myshopify.com",
 *   accessToken: "shpat_xxxxx",
 *   defaultLocale: "en",
 * });
 *
 * const { data } = await client.getTranslations({ locale: "ar" });
 * ```
 */
export function createHeadlessClient(
  config: HeadlessTranslationClientConfig,
): HeadlessTranslationClient {
  const {
    shopDomain,
    accessToken,
    apiVersion = "2025-01",
    defaultLocale = "en",
  } = config;

  const baseUrl = `https://${shopDomain}/api/${apiVersion}`;

  function buildUrl(
    endpoint: TranslationEndpointKey,
    params?: Record<string, string>,
  ): string {
    let path: string = TranslationEndpoints[endpoint];
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        path = path.replace(`:${key}`, encodeURIComponent(value));
      }
    }
    return `${baseUrl}${path}`;
  }

  async function request<T>(url: string, options?: RequestInit): Promise<TranslationResponse<T>> {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      return {
        data: null as unknown as T,
        errors: [{ message: response.statusText, code: `HTTP_${response.status}` }],
      };
    }

    return response.json();
  }

  return {
    async getTranslations(query) {
      const url = buildUrl("translations", { locale: query.locale });
      const params = new URLSearchParams();
      if (query.resourceType) params.set("resourceType", query.resourceType);
      if (query.limit) params.set("limit", String(query.limit));
      if (query.cursor) params.set("cursor", query.cursor);
      if (query.keys?.length) params.set("keys", query.keys.join(","));
      const fullUrl = params.toString() ? `${url}?${params}` : url;
      return request(fullUrl);
    },

    async getTranslation(locale, key) {
      const url = buildUrl("single", { locale, key });
      return request(url);
    },

    async setTranslations(mutation) {
      const url = buildUrl("batch");
      return request(url, {
        method: "POST",
        body: JSON.stringify(mutation),
      });
    },

    async getLocales() {
      const url = buildUrl("locales");
      return request(url);
    },

    isRtlLocale: isRtl,

    getEndpointUrl: buildUrl,

    async getRtlConfig() {
      const url = buildUrl("rtlConfig");
      return request(url);
    },
  };
}
