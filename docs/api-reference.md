# RTL Storefront — API Reference

This document covers both the HTTP REST API endpoints exposed by the app and the internal TypeScript service APIs available to developers extending the codebase.

---

## HTTP REST API

All HTTP endpoints are embedded Shopify app routes. Authentication is handled via Shopify's session-based OAuth flow (`authenticate.admin(request)` from `~/shopify.server`). There is no separate API key system for the REST layer — session cookies from the Shopify Admin are required.

Base URL: `https://<your-app-host>`

### Rate Limits

The app inherits Shopify's API rate limits. Calls to external translation providers are governed by those providers' own quotas:

| Provider | Limit |
|----------|-------|
| OpenAI | Per your OpenAI plan (typically 10,000 RPM) |
| DeepL | Per your DeepL plan (500,000 chars/month on free) |
| Google Translate | Per your Google Cloud quota |

---

### GET /api/v1/status

Health check, translation coverage stats, and job queue status for the authenticated shop.

**Query parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `locale` | string | No | Filter coverage for a specific locale (e.g., `ar`) |

**Response 200**

```json
{
  "health": {
    "status": "ok",
    "timestamp": "2026-03-22T10:00:00.000Z",
    "shop": "example.myshopify.com"
  },
  "coverage": {
    "locales": [
      {
        "locale": "ar",
        "totalResources": 120,
        "translatedResources": 95,
        "coveragePercent": 79.17,
        "level": "medium",
        "byResourceType": { "product": 80, "collection": 15 },
        "trend": { "direction": "up", "changePercent": 5.2, "period": "week" }
      }
    ],
    "summary": { "totalLocales": 1, "averageCoverage": 79.17 }
  },
  "queue": {
    "pendingJobs": 3,
    "runningJobs": 1,
    "failedJobs": 0,
    "completedLast24h": 42
  }
}
```

---

### GET /api/v1/translations

Fetches existing translations and translatable content for a Shopify resource.

**Query parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `resourceType` | string | Yes | `product`, `collection`, `page`, `blog`, `article`, or `link` |
| `resourceId` | string | Yes | Numeric Shopify resource ID |
| `locale` | string | No | Target locale code (e.g., `ar`). Defaults to shop primary locale. |

**Example**

```
GET /api/v1/translations?resourceType=product&resourceId=8187654321&locale=ar
```

**Response 200**

```json
{
  "shop": "example.myshopify.com",
  "resourceType": "product",
  "resourceId": "8187654321",
  "locale": "ar",
  "fields": ["title", "body_html", "handle", "meta_title", "meta_description"],
  "translations": [
    { "key": "title", "value": "حذاء رياضي", "locale": "ar", "outdated": false }
  ],
  "translatableContent": [
    { "key": "title", "value": "Running Shoe", "digest": "abc123", "locale": "en" }
  ]
}
```

**Response 400**

```json
{ "error": "Missing required query parameters: resourceType, resourceId" }
```

---

### POST /api/v1/translations

Registers translations for a Shopify resource. Internally calls Shopify's `translationsRegister` GraphQL mutation.

**Request body**

```json
{
  "resourceType": "product",
  "resourceId": "8187654321",
  "locale": "ar",
  "translations": [
    { "key": "title", "value": "حذاء رياضي", "translatableContentDigest": "abc123" },
    { "key": "body_html", "value": "<p>وصف المنتج</p>", "translatableContentDigest": "def456" }
  ]
}
```

The `translatableContentDigest` value comes from the GET response — Shopify uses it for conflict detection.

**Response 200**

```json
{
  "success": true,
  "shop": "example.myshopify.com",
  "resourceId": "gid://shopify/Product/8187654321",
  "locale": "ar",
  "translations": [
    { "key": "title", "value": "حذاء رياضي", "locale": "ar" }
  ]
}
```

**Response 422**

```json
{
  "error": "Translation registration failed",
  "userErrors": [{ "field": "translations", "message": "Invalid digest for key title" }]
}
```

---

### GET /api/v1/glossary

Returns glossary entries for the authenticated shop (data from Prisma `GlossaryEntry` model).

**Query parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `locale` | string | No | Filter by target locale |

**Response 200**

```json
{
  "shop": "example.myshopify.com",
  "locale": "ar",
  "count": 2,
  "terms": [
    {
      "id": "clxyz123",
      "sourceLocale": "en",
      "targetLocale": "ar",
      "sourceTerm": "Nike",
      "translatedTerm": "نايك",
      "neverTranslate": false,
      "caseSensitive": true,
      "category": "brand",
      "notes": null,
      "createdAt": "2026-01-15T08:00:00.000Z"
    }
  ]
}
```

---

### POST /api/v1/glossary

Creates a new glossary entry.

**Request body**

```json
{
  "term": {
    "sourceLocale": "en",
    "targetLocale": "ar",
    "sourceTerm": "checkout",
    "translatedTerm": "الدفع",
    "neverTranslate": false,
    "caseSensitive": false,
    "category": "ui",
    "notes": "Used in button labels"
  }
}
```

**Response 200**

```json
{ "success": true, "term": { "id": "clxyz789", "sourceTerm": "checkout", "translatedTerm": "الدفع" } }
```

---

### DELETE /api/v1/glossary

Deletes a glossary entry by ID.

**Request body**

```json
{ "id": "clxyz789" }
```

**Response 200**

```json
{ "success": true, "deleted": "clxyz789" }
```

---

### GET /api/translations/products

Internal route for fetching and auto-translating product content. Used by the `/app/translate` UI.

### GET /api/translations/collections

Internal route for fetching and auto-translating collection content.

### GET /api/currency/rates

Returns current currency exchange rates for MENA currencies. Used by the payments and pricing features.

---

## Webhook Endpoints

All webhooks are validated with Shopify HMAC signatures (handled automatically by `@shopify/shopify-app-remix`).

| Topic | Endpoint | Description |
|-------|----------|-------------|
| `products/update` | `POST /webhooks/products` | Marks product translations as outdated |
| `collections/update` | `POST /webhooks/collections` | Marks collection translations as outdated |
| `app/uninstalled` | `POST /webhooks/app/uninstalled` | Clears shop session |
| `app/subscriptions/update` | `POST /webhooks/app/subscription_update` | Syncs billing status |
| `app/scopes_update` | `POST /webhooks/app/scopes_update` | Handles scope changes |

---

## Internal TypeScript Service APIs

These are importable modules for use within the Remix app (server-side only).

### Translation Engine

**`createTranslationEngine(options?)`** — `~/services/translation/engine`

Creates a translation engine instance backed by OpenAI, DeepL, or Google Translate.

```typescript
import { createTranslationEngine } from "~/services/translation/engine";

const engine = createTranslationEngine({
  env: { OPENAI_API_KEY: "sk-..." },
});

const result = await engine.translate({
  text: "Hello world",
  sourceLocale: "en",
  targetLocale: "ar",
});
```

Options:

| Field | Type | Description |
|-------|------|-------------|
| `env` | `TranslationServiceEnv` | Provider API keys |
| `providers` | `TranslationProvider[]` | Custom provider instances |
| `cache` | `TranslationCacheStore` | Custom cache store |

---

### Cultural AI — `~/services/cultural-ai`

| Function | Description |
|----------|-------------|
| `analyzeCulturalContext(input)` | Returns cultural context metadata and enhanced translation prompts |
| `checkSensitivity(text, locale)` | Flags religiously or culturally sensitive content |
| `detectDialect(text)` | Detects Arabic dialect from text |
| `getDialectFromCountry(countryCode)` | Maps ISO country code to Arabic dialect (SA → gulf, EG → egyptian) |

---

### Translation Memory — `~/services/translation-memory`

| Function | Description |
|----------|-------------|
| `addEntry(shop, entry)` | Store a translation for future reuse |
| `search(shop, sourceLocale, targetLocale, sourceText)` | Exact and fuzzy match lookup |
| `addTerm(shop, term)` | Add a glossary term |
| `getAllTerms(shop, locale?)` | Get all glossary entries |
| `getNeverTranslateTerms(shop, sourceLocale)` | Terms that must not be translated |
| `deleteTerm(id)` | Delete a glossary entry |

---

### Billing — `~/services/billing`

| Function | Description |
|----------|-------------|
| `getActivePlans()` | Returns all active billing plans from DB |
| `getSubscription(shop)` | Returns current subscription for a shop |
| `getPlanById(id)` | Looks up a plan by ID |
| `isGated(subscription)` | Returns true if the shop is on an expired or cancelled plan |
| `getTrialDaysRemaining(trialEndsAt)` | Days left in trial period |
| `formatPriceForShopify(cents)` | Converts cents to decimal string for Shopify API |

---

### Coverage — `~/services/coverage`

| Function | Description |
|----------|-------------|
| `calculateCoverage(translated, total)` | Returns coverage percentage |
| `getCoverageLevel(percent)` | Returns `"low"`, `"medium"`, or `"high"` |
| `getCoverageSummary(locales)` | Aggregated summary across all locales |

---

### BiDi Preservation — `~/services/bidi`

```typescript
import { bidiPreserver } from "~/services/bidi";

const result = bidiPreserver.preserve("مرحبا Hello عالم", "ar");
const analysis = bidiPreserver.detectMixedContent("مرحبا Hello");
```

---

### MENA Payments — `~/services/payments/mena`

```typescript
import { createMENAPaymentOrchestrator } from "~/services/payments/mena";

const payments = createMENAPaymentOrchestrator();
const providers = payments.getAvailableProviders("SAR", "SA");

const response = await payments.createPayment("tamara", {
  orderId: "order_123",
  amount: 299.99,
  currency: "SAR",
  customerEmail: "customer@example.com",
  customerName: "Ahmed",
  returnUrl: "https://store.com/success",
  cancelUrl: "https://store.com/cancel",
  webhookUrl: "https://store.com/webhooks/payment",
});
```

Supported providers: `tamara`, `tabby`, `mada`, `stc_pay`, `telr`

---

### GCC VAT — `~/services/vat`

| Function | Description |
|----------|-------------|
| `calculateVAT(subtotal, countryCode, currency, locale?)` | Returns VAT amount (SA 15%, AE 5%, BH 10%) |
| `validateVATNumber(vatNumber, countryCode)` | Validates VAT/TRN format for GCC countries |

---

### URL Structure — `~/services/url-structure`

| Function | Description |
|----------|-------------|
| `resolveLocaleFromPath(path, config)` | Extracts locale from URL path (e.g., `/ar/products` → `ar`) |
| `buildLocalizedPath(path, locale, config)` | Builds locale-prefixed URL |
| `getAlternateUrls(path, baseUrl, config)` | Generates hreflang alternate URLs for all active locales |

---

### Sitemap — `~/services/sitemap`

| Function | Description |
|----------|-------------|
| `generateSitemapXml(input)` | Generates multilingual XML sitemap with hreflang |
| `generateSitemapIndex(sitemaps)` | Generates sitemap index XML |

---

### GDPR / Privacy — `~/services/gdpr`

| Function | Description |
|----------|-------------|
| `exportShopData(shop)` | Exports all shop data as GDPR-compliant JSON |
| `deleteShopData(shop)` | Deletes all shop data (right to erasure) |
| `updateConsent(input)` | Records consent grant or revocation in `ConsentRecord` |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SHOPIFY_API_KEY` | Yes | Shopify app API key |
| `SHOPIFY_API_SECRET` | Yes | Shopify app API secret |
| `OPENAI_API_KEY` | For OpenAI | OpenAI API key |
| `DEEPL_API_KEY` | For DeepL | DeepL API key |
| `GOOGLE_TRANSLATE_ACCESS_TOKEN` | For Google | Google Cloud access token |
| `TAMARA_API_KEY` | For Tamara | Tamara BNPL API key |
| `TABBY_API_KEY` | For Tabby | Tabby BNPL API key |
| `MADA_API_KEY` | For Mada | Mada gateway API key |
| `STC_PAY_API_KEY` | For STC Pay | STC Pay API key |
| `TELR_API_KEY` | For Telr | Telr gateway API key |
| `REDIS_URL` | Optional | Redis URL for caching |

---

## Error Format

All HTTP error responses:

```json
{
  "error": "Human-readable message",
  "detail": "Optional additional context"
}
```

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request — missing or invalid parameters |
| 401 | Unauthorized — invalid or expired Shopify session |
| 405 | Method not allowed |
| 422 | Unprocessable — Shopify rejected the data |
| 500 | Internal server error |
