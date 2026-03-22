# RTL Storefront API Reference

## Translation Engine

### `createTranslationEngine(options?)`
Creates a new translation engine instance.

```typescript
import { createTranslationEngine } from "~/services/translation";

const engine = createTranslationEngine({
  env: { OPENAI_API_KEY: "sk-..." },
});

const result = await engine.translate({
  text: "Hello world",
  sourceLocale: "en",
  targetLocale: "ar",
});
```

**Options:**
| Field | Type | Description |
|-------|------|-------------|
| `env` | `TranslationServiceEnv` | Environment variables for providers |
| `providers` | `TranslationProvider[]` | Custom provider instances |
| `cache` | `TranslationCacheStore` | Custom cache store |

**Returns:** `TranslationEngine`

---

## Cultural AI

### `analyzeCulturalContext(input)`
Analyzes text for cultural context and returns enhanced translation prompts.

```typescript
import { analyzeCulturalContext } from "~/services/cultural-ai";

const result = analyzeCulturalContext({
  text: "Black abaya with gold embroidery",
  category: "fashion",
  targetLocale: "ar-SA",
  dialect: "gulf",
});
```

### `checkSensitivity(text, locale)`
Checks text for cultural/religious sensitivity.

### `detectDialect(text)`
Detects Arabic dialect from text content.

### `getDialectFromCountry(countryCode)`
Maps country code to Arabic dialect (SA→gulf, EG→egyptian, etc.)

---

## MENA Payments

### `createMENAPaymentOrchestrator(env?)`
Creates a payment orchestrator from environment variables.

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

**Supported Providers:** tamara, tabby, mada, stc_pay, telr

---

## Translation Memory

### `addEntry(shop, entry)`
Add a translation to memory for future reuse.

### `search(shop, sourceLocale, targetLocale, sourceText)`
Search for existing translations (exact + fuzzy matching).

### `addTerm(shop, term)`
Add a glossary term for consistent translations.

### `getNeverTranslateTerms(shop, sourceLocale)`
Get terms that should never be translated (brands, SKUs).

---

## Cart & Checkout Translation

### `translateCart(config, input)`
Translate cart UI labels for a target locale.

### `translateCheckout(config, input)`
Translate checkout UI labels.

### `formatPrice(amount, currency, locale)`
Format price with locale-appropriate currency display.

---

## BiDi Text Preservation

### `BiDiPreserver`
Handles mixed LTR/RTL text preservation.

```typescript
import { bidiPreserver } from "~/services/bidi";

const result = bidiPreserver.preserve("مرحبا Hello عالم", "ar");
const analysis = bidiPreserver.detectMixedContent("مرحبا Hello");
```

---

## URL Structure

### `resolveLocaleFromPath(path, config)`
Extract locale from URL path (e.g., `/ar/products` → `ar`).

### `buildLocalizedPath(path, locale, config)`
Build a localized URL path with locale prefix.

### `getAlternateUrls(path, baseUrl, config)`
Generate alternate URLs for all locales (for hreflang).

---

## Sitemap Generation

### `generateSitemapXml(input)`
Generate multilingual XML sitemap with hreflang annotations.

### `generateSitemapIndex(sitemaps)`
Generate sitemap index XML.

---

## Privacy / GDPR

### `exportShopData(shop)`
Export all shop data in GDPR-compliant JSON format.

### `deleteShopData(shop)`
Delete all data for a shop (right to erasure).

### `updateConsent(input)`
Record consent grant or revocation.

---

## GCC VAT

### `calculateVAT(subtotal, countryCode, currency, locale?)`
Calculate VAT for GCC countries (SA 15%, AE 5%, BH 10%).

### `validateVATNumber(vatNumber, countryCode)`
Validate VAT/TRN number format for GCC countries.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | For OpenAI | OpenAI API key |
| `DEEPL_API_KEY` | For DeepL | DeepL API key |
| `GOOGLE_TRANSLATE_ACCESS_TOKEN` | For Google | Google Cloud access token |
| `TAMARA_API_KEY` | For Tamara | Tamara BNPL API key |
| `TABBY_API_KEY` | For Tabby | Tabby BNPL API key |
| `MADA_API_KEY` | For Mada | Mada gateway API key |
| `STC_PAY_API_KEY` | For STC Pay | STC Pay API key |
| `TELR_API_KEY` | For Telr | Telr gateway API key |
| `REDIS_URL` | Optional | Redis connection URL |
