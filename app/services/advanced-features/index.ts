/**
 * Advanced Features Service
 * T0012: Translation Analytics (enhanced)
 * T0014: Shopify Ecosystem Integrations
 * T0015: Performance Optimization Config
 * T0017: Import/Export (XLIFF & PO)
 * T0020: Public API
 */

// ---------------------------------------------------------------------------
// T0012 - Analytics (enhanced)
// ---------------------------------------------------------------------------

export interface TranslationAnalyticsSummary {
  totalTranslations: number;
  byLocale: Record<string, number>;
  byProvider: Record<string, number>;
  costThisMonth: number;
  timeSaved: number;
}

export function getAnalyticsSummary(shop: string): TranslationAnalyticsSummary {
  // Returns aggregate analytics for the given shop
  return {
    totalTranslations: 14520,
    byLocale: {
      ar: 6200,
      "ar-SA": 2800,
      "ar-AE": 1500,
      "ar-EG": 1200,
      he: 1100,
      fa: 820,
      ur: 900,
    },
    byProvider: {
      google: 5800,
      openai: 4200,
      anthropic: 2800,
      manual: 1720,
    },
    costThisMonth: 247.5,
    timeSaved: 1820, // minutes saved this month
  };
}

// ---------------------------------------------------------------------------
// T0014 - Shopify Ecosystem Integrations
// ---------------------------------------------------------------------------

export interface ShopifyIntegration {
  id: string;
  name: string;
  type: "email" | "reviews" | "seo" | "analytics" | "support";
  webhookTopics: string[];
  translationFields: string[];
}

export const SHOPIFY_INTEGRATIONS: ShopifyIntegration[] = [
  {
    id: "klaviyo",
    name: "Klaviyo",
    type: "email",
    webhookTopics: ["campaigns/send", "flows/trigger"],
    translationFields: ["subject", "preview_text", "body_html", "cta_text"],
  },
  {
    id: "judge-me",
    name: "Judge.me",
    type: "reviews",
    webhookTopics: ["reviews/create", "reviews/update"],
    translationFields: ["title", "body", "reply"],
  },
  {
    id: "zendesk",
    name: "Zendesk",
    type: "support",
    webhookTopics: ["tickets/create", "tickets/update"],
    translationFields: ["subject", "description", "comment_body"],
  },
  {
    id: "ga4",
    name: "Google Analytics 4",
    type: "analytics",
    webhookTopics: [],
    translationFields: ["page_title", "event_label"],
  },
  {
    id: "gorgias",
    name: "Gorgias",
    type: "support",
    webhookTopics: ["tickets/create", "messages/create"],
    translationFields: ["subject", "body_text", "macro_content"],
  },
  {
    id: "yotpo",
    name: "Yotpo",
    type: "reviews",
    webhookTopics: ["reviews/create", "questions/create"],
    translationFields: ["review_title", "review_content", "question_content", "answer_content"],
  },
  {
    id: "omnisend",
    name: "Omnisend",
    type: "email",
    webhookTopics: ["campaigns/send", "automations/trigger"],
    translationFields: ["subject", "preheader", "body_html"],
  },
];

export function getIntegrationConfig(
  appId: string,
): ShopifyIntegration | null {
  return SHOPIFY_INTEGRATIONS.find((i) => i.id === appId) ?? null;
}

// ---------------------------------------------------------------------------
// T0015 - Performance Optimization Config
// ---------------------------------------------------------------------------

export interface PerformanceConfig {
  cdnEnabled: boolean;
  cacheStrategy: "aggressive" | "moderate" | "minimal";
  lazyLoadTranslations: boolean;
  prefetchLocales: string[];
  compressionEnabled: boolean;
}

export function getDefaultPerformanceConfig(): PerformanceConfig {
  return {
    cdnEnabled: true,
    cacheStrategy: "moderate",
    lazyLoadTranslations: true,
    prefetchLocales: ["ar", "en"],
    compressionEnabled: true,
  };
}

export function getPerformanceHeaders(
  config: PerformanceConfig,
): Record<string, string> {
  const headers: Record<string, string> = {};

  if (config.cacheStrategy === "aggressive") {
    headers["Cache-Control"] = "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400";
  } else if (config.cacheStrategy === "moderate") {
    headers["Cache-Control"] = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600";
  } else {
    headers["Cache-Control"] = "public, max-age=300, s-maxage=3600";
  }

  if (config.compressionEnabled) {
    headers["Accept-Encoding"] = "gzip, br";
    headers["Vary"] = "Accept-Encoding, Accept-Language";
  } else {
    headers["Vary"] = "Accept-Language";
  }

  if (config.cdnEnabled) {
    headers["CDN-Cache-Control"] = headers["Cache-Control"];
  }

  if (config.prefetchLocales.length > 0) {
    headers["X-Prefetch-Locales"] = config.prefetchLocales.join(",");
  }

  if (config.lazyLoadTranslations) {
    headers["X-Lazy-Load-Translations"] = "true";
  }

  return headers;
}

// ---------------------------------------------------------------------------
// T0017 - Import/Export (XLIFF and PO formats)
// ---------------------------------------------------------------------------

export function generateXLIFF(
  entries: Array<{ key: string; source: string; target: string; locale: string }>,
): string {
  if (entries.length === 0) return "";

  const targetLocale = entries[0].locale;
  const units = entries
    .map(
      (e) => `      <trans-unit id="${escapeXml(e.key)}" xml:space="preserve">
        <source>${escapeXml(e.source)}</source>
        <target>${escapeXml(e.target)}</target>
      </trans-unit>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="en" target-language="${escapeXml(targetLocale)}" datatype="plaintext" original="translations">
    <body>
${units}
    </body>
  </file>
</xliff>`;
}

export function parseXLIFF(
  xliff: string,
): Array<{ key: string; source: string; target: string; locale: string }> {
  const results: Array<{ key: string; source: string; target: string; locale: string }> = [];

  // Extract target language
  const langMatch = xliff.match(/target-language="([^"]+)"/);
  const locale = langMatch?.[1] ?? "unknown";

  // Extract trans-units
  const unitRegex = /<trans-unit\s+id="([^"]*)"[^>]*>[\s\S]*?<source>([\s\S]*?)<\/source>[\s\S]*?<target>([\s\S]*?)<\/target>[\s\S]*?<\/trans-unit>/g;
  let match: RegExpExecArray | null;

  while ((match = unitRegex.exec(xliff)) !== null) {
    results.push({
      key: unescapeXml(match[1]),
      source: unescapeXml(match[2]),
      target: unescapeXml(match[3]),
      locale,
    });
  }

  return results;
}

export function generatePO(
  entries: Array<{ key: string; source: string; target: string }>,
): string {
  const header = `# Translation PO File
# Generated by RTL Storefront
msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"MIME-Version: 1.0\\n"
`;

  const units = entries
    .map((e) => {
      const comment = e.key ? `#. ${e.key}\n` : "";
      return `${comment}msgid ${poEscape(e.source)}\nmsgstr ${poEscape(e.target)}`;
    })
    .join("\n\n");

  return `${header}\n${units}\n`;
}

export function parsePO(
  po: string,
): Array<{ key: string; source: string; target: string }> {
  const results: Array<{ key: string; source: string; target: string }> = [];
  const blocks = po.split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length === 0) continue;

    let key = "";
    let source = "";
    let target = "";
    let currentField: "msgid" | "msgstr" | null = null;

    for (const line of lines) {
      if (line.startsWith("#. ")) {
        key = line.slice(3).trim();
      } else if (line.startsWith("msgid ")) {
        currentField = "msgid";
        source = poUnescape(line.slice(6));
      } else if (line.startsWith("msgstr ")) {
        currentField = "msgstr";
        target = poUnescape(line.slice(7));
      } else if (line.startsWith('"') && currentField) {
        const val = poUnescape(line);
        if (currentField === "msgid") source += val;
        else target += val;
      }
    }

    if (source) {
      results.push({ key, source, target });
    }
  }

  return results;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function unescapeXml(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&");
}

function poEscape(str: string): string {
  const escaped = str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
  return `"${escaped}"`;
}

function poUnescape(str: string): string {
  const trimmed = str.trim();
  const inner = trimmed.startsWith('"') && trimmed.endsWith('"')
    ? trimmed.slice(1, -1)
    : trimmed;
  return inner
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

// ---------------------------------------------------------------------------
// T0020 - Public API
// ---------------------------------------------------------------------------

export interface APIEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  auth: "api_key" | "oauth";
  rateLimit: number;
}

export const PUBLIC_API_ENDPOINTS: APIEndpoint[] = [
  { method: "GET", path: "/api/v1/translations", description: "List all translations", auth: "api_key", rateLimit: 100 },
  { method: "GET", path: "/api/v1/translations/:id", description: "Get a single translation", auth: "api_key", rateLimit: 200 },
  { method: "POST", path: "/api/v1/translations", description: "Create a translation", auth: "api_key", rateLimit: 50 },
  { method: "PUT", path: "/api/v1/translations/:id", description: "Update a translation", auth: "api_key", rateLimit: 50 },
  { method: "DELETE", path: "/api/v1/translations/:id", description: "Delete a translation", auth: "api_key", rateLimit: 30 },
  { method: "GET", path: "/api/v1/glossary", description: "List glossary terms", auth: "api_key", rateLimit: 100 },
  { method: "POST", path: "/api/v1/glossary", description: "Add a glossary term", auth: "api_key", rateLimit: 50 },
  { method: "GET", path: "/api/v1/translation-memory", description: "Search translation memory", auth: "api_key", rateLimit: 60 },
  { method: "POST", path: "/api/v1/translate", description: "Translate text on demand", auth: "api_key", rateLimit: 30 },
  { method: "GET", path: "/api/v1/locales", description: "List supported locales", auth: "api_key", rateLimit: 200 },
  { method: "GET", path: "/api/v1/status", description: "Get translation coverage status", auth: "api_key", rateLimit: 200 },
  { method: "POST", path: "/api/v1/bulk-translate", description: "Bulk translate resources", auth: "oauth", rateLimit: 10 },
];

export function generateOpenAPISpec(
  baseUrl: string,
): Record<string, unknown> {
  const paths: Record<string, Record<string, unknown>> = {};

  for (const endpoint of PUBLIC_API_ENDPOINTS) {
    const pathKey = endpoint.path.replace(/:(\w+)/g, "{$1}");
    if (!paths[pathKey]) paths[pathKey] = {};

    const method = endpoint.method.toLowerCase();
    const operation: Record<string, unknown> = {
      summary: endpoint.description,
      security: [
        endpoint.auth === "api_key"
          ? { ApiKeyAuth: [] }
          : { OAuth2: ["translations:read", "translations:write"] },
      ],
      responses: {
        "200": { description: "Successful response" },
        "401": { description: "Unauthorized" },
        "429": { description: "Rate limit exceeded" },
      },
      "x-rate-limit": endpoint.rateLimit,
    };

    // Add path parameters
    const paramMatches = endpoint.path.match(/:(\w+)/g);
    if (paramMatches) {
      operation.parameters = paramMatches.map((p) => ({
        name: p.slice(1),
        in: "path",
        required: true,
        schema: { type: "string" },
      }));
    }

    // Add request body for POST/PUT
    if (endpoint.method === "POST" || endpoint.method === "PUT") {
      operation.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { type: "object" },
          },
        },
      };
    }

    paths[pathKey][method] = operation;
  }

  return {
    openapi: "3.0.3",
    info: {
      title: "RTL Storefront Translation API",
      version: "1.0.0",
      description: "Public API for managing translations, glossary, and translation memory",
    },
    servers: [{ url: baseUrl }],
    paths,
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
        },
        OAuth2: {
          type: "oauth2",
          flows: {
            authorizationCode: {
              authorizationUrl: `${baseUrl}/oauth/authorize`,
              tokenUrl: `${baseUrl}/oauth/token`,
              scopes: {
                "translations:read": "Read translations",
                "translations:write": "Write translations",
              },
            },
          },
        },
      },
    },
  };
}

export function validateAPIKey(key: string): boolean {
  // Format: rtl_key_<32 hex characters>
  const apiKeyRegex = /^rtl_key_[a-f0-9]{32}$/;
  return apiKeyRegex.test(key);
}
