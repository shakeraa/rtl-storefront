# RTL Storefront — User Guide

## Overview

RTL Storefront is a Shopify embedded app that adds multilingual translation and right-to-left (RTL) layout support to your store. It supports Arabic, Hebrew, Persian, Urdu, and 11 additional languages, with AI-powered translation via OpenAI, DeepL, and Google Translate.

---

## Installation

1. Find **RTL Storefront** in the Shopify App Store and click **Add app**.
2. Review the requested permissions and click **Install**.
3. You are redirected to the onboarding wizard inside your Shopify Admin (`/app/onboarding`).

---

## Initial Setup (Onboarding Wizard)

The onboarding wizard at `/app/onboarding` guides you through five steps:

| Step | What you do |
|------|-------------|
| 1. Welcome | Review the feature overview |
| 2. Languages | Pick your target languages |
| 3. Provider | Connect a translation API key |
| 4. RTL | Enable RTL layout for Arabic/Hebrew/Persian/Urdu |
| 5. Done | Launch your multilingual store |

Progress is saved automatically. You can return to any step from the **Settings** page (`/app/settings`).

---

## Configuring Languages

Go to **Settings** (`/app/settings`) > **Languages**.

Supported languages and their text direction:

| Code | Language | Direction |
|------|----------|-----------|
| `ar` | Arabic | RTL |
| `he` | Hebrew | RTL |
| `fa` | Persian | RTL |
| `ur` | Urdu | RTL |
| `en` | English | LTR |
| `fr` | French | LTR |
| `de` | German | LTR |
| `es` | Spanish | LTR |
| `it` | Italian | LTR |
| `pt` | Portuguese | LTR |
| `tr` | Turkish | LTR |
| `ru` | Russian | LTR |
| `zh` | Chinese | LTR |
| `ja` | Japanese | LTR |
| `ko` | Korean | LTR |

To add a language, toggle it on in the language list. Your active subscription determines how many languages you can enable simultaneously (see [Billing & Plans](#billing--plans)).

---

## Translation Providers

The app supports three AI translation providers. Configure them in **Settings** (`/app/settings`):

| Provider | Environment Variable | Notes |
|----------|---------------------|-------|
| OpenAI | `OPENAI_API_KEY` | Default provider, best for nuanced MENA content |
| DeepL | `DEEPL_API_KEY` | High accuracy for European languages |
| Google Translate | `GOOGLE_TRANSLATE_ACCESS_TOKEN` | Broad language coverage |

Only one provider is active at a time. The app falls back gracefully if a provider call fails.

---

## Translation Workflow

### Translating Products

1. Navigate to **Translate** (`/app/translate`) and select **Products**.
2. Find the product in the list and click **Translate**.
3. The app fetches all translatable fields (title, description, SEO fields, variants) from Shopify's Translatable Resources API.
4. Click **Auto-translate** to run AI translation, or edit fields manually.
5. Click **Save** to register translations back to Shopify via the GraphQL `translationsRegister` mutation.

Translations are stored by Shopify and served automatically to customers based on their locale.

### Translating Collections

Go to `/app/translate` > **Collections**. The workflow is identical to products.

### Bulk Translation

Use the **Translations** dashboard (`/app/translations`) to view coverage across all resources and trigger bulk translation jobs for any untranslated content.

### Translation Memory

The app automatically stores past translations in a translation memory (Prisma model `TranslationMemory`). When you translate similar text again, it suggests existing translations and skips the AI call if a match exceeds the fuzzy threshold (default 80%).

---

## RTL Settings

Go to **RTL Settings** (`/app/rtl-settings`) to configure the RTL layout behavior:

- **Auto-detect RTL**: Automatically applies RTL CSS when the active locale is Arabic, Hebrew, Persian, or Urdu.
- **Arabic font**: Choose from the bundled Arabic font library (default: Noto Sans Arabic).
- **Hebrew font**: Choose from the bundled Hebrew font library (default: Heebo).
- **RTL CSS overrides**: Add custom CSS rules that apply only in RTL mode.
- **Tashkeel support**: Enable Arabic diacritics rendering.

RTL is applied at the theme level via a Shopify theme extension. No manual code editing is required.

---

## Glossary Management

The glossary at `/app/glossary` lets you define terms that should always be translated a specific way or never translated at all (brand names, product codes, etc.).

### Adding a term

1. Click **Add term**.
2. Enter the source term and its translation in the target language.
3. Toggle **Never translate** if the term should be kept verbatim (e.g., `Nike`).
4. Optionally tag it with a category and notes.

### Glossary enforcement

During AI translation, all glossary terms are matched before the text is sent to the provider. Matched terms are substituted with placeholders, the translation runs, and then the correct values are restored. This ensures brand names and technical terms are always consistent.

---

## Translation Coverage

The **Coverage** dashboard (`/app/coverage`) shows the percentage of translatable content that has been translated for each active language. A color-coded indicator shows:

- Green: 80%+ covered
- Yellow: 40–79% covered
- Red: below 40% covered

---

## Analytics

The **Analytics** page (`/app/analytics`) shows:

- Translation volume by language and time period
- AI provider usage and token costs
- Sales and conversion data segmented by language

---

## Billing & Plans

Go to **Billing** (`/app/billing`) to view and change your plan.

| Plan | Languages | Words/month | Features |
|------|-----------|-------------|---------|
| Free trial | Up to 2 | 5,000 | Basic translation, RTL support |
| Starter | Up to 5 | 50,000 | + Glossary |
| Growth | Up to 10 | 200,000 | + Premium AI, Analytics |
| Enterprise | Unlimited | Unlimited | + Team collaboration, MENA payments, Priority support |

The free trial lasts 14 days. No credit card is required to start. Billing is handled by Shopify's native subscription system, so charges appear on your Shopify invoice.

### MENA Payment Methods

Enterprise plans include MENA-specific payment gateway support (Tabby, Tamara, Mada, and others). Configure payment methods in **Payments** (`/app/payments`).

---

## Webhooks

The app registers the following Shopify webhooks automatically on install:

| Topic | Route | Purpose |
|-------|-------|---------|
| `products/update` | `/webhooks/products` | Sync product translations |
| `collections/update` | `/webhooks/collections` | Sync collection translations |
| `app/uninstalled` | `/webhooks/app/uninstalled` | Clean up shop data |
| `app/subscriptions/update` | `/webhooks/app/subscription_update` | Sync billing status |

---

## Troubleshooting

**Translations are not appearing in my storefront**
- Confirm the target language is published in Shopify Admin > Markets.
- Check that the translation was saved successfully (no error banner in the translate screen).
- Shopify may cache translations for up to 5 minutes.

**Auto-translate button is disabled**
- Verify your translation provider API key is saved in Settings.
- Check that you have words remaining in your monthly quota (visible in Billing).

**RTL layout is not applying**
- Confirm the theme extension is enabled in Shopify Admin > Online Store > Themes > Customize.
- Ensure the customer's locale is set to an RTL language.

**I see "Plan limit reached" errors**
- You have hit the maximum languages or word count for your plan. Upgrade in Billing or wait for the monthly counter to reset.
