# RTL Storefront — Frequently Asked Questions

## General

**What does RTL Storefront do?**
RTL Storefront is a Shopify embedded app that adds AI-powered multilingual translation and right-to-left (RTL) layout support to your store. It supports Arabic, Hebrew, Persian, Urdu, and 11 additional languages, and is specifically built for merchants selling into the MENA region.

**Which Shopify plans is RTL Storefront compatible with?**
RTL Storefront works with all Shopify plans (Basic, Shopify, Advanced, and Plus). Some features (like team collaboration and MENA payment gateways) require an Enterprise app plan.

**Does RTL Storefront replace Shopify's built-in translation tools?**
No. RTL Storefront builds on top of Shopify's native Translatable Resources API. Your translations are stored in Shopify and served by Shopify's infrastructure. The app adds AI translation, a translation memory, glossary management, and RTL layout on top of that foundation.

**Is RTL Storefront compatible with all Shopify themes?**
The translation features work with any theme because Shopify manages locale-based content serving. RTL layout is applied via a theme extension; compatibility depends on the theme not using hard-coded LTR-only CSS. Most modern themes (Dawn, Sense, Crave) work out of the box.

---

## RTL Support

**Which languages require RTL layout?**
Arabic (`ar`), Hebrew (`he`), Persian (`fa`), and Urdu (`ur`) are right-to-left languages. The app automatically applies RTL layout when any of these is the active locale.

**How does RTL layout work technically?**
A Shopify theme extension sets `dir="rtl"` on the `<html>` element when the current locale is RTL. This triggers CSS logical properties (margin-inline-start, padding-inline-end, etc.) in the theme. The app also injects locale-appropriate fonts (Noto Sans Arabic, Heebo, etc.) via CSS variables.

**Can I customize the RTL CSS?**
Yes. Go to RTL Settings (`/app/rtl-settings`) and use the CSS override field to add custom rules that apply only when RTL mode is active.

**Will RTL layout break my existing LTR theme?**
No. RTL styles are scoped to RTL locales. When a customer views your store in English (or any LTR language), no RTL-specific CSS is applied.

**Does the app handle mixed Arabic-English text?**
Yes. The BiDi (bidirectional) preservation service (`~/services/bidi`) automatically wraps embedded LTR text (URLs, product codes, prices) in Unicode directional marks so they render correctly inside RTL paragraphs.

**What about Arabic fonts? Can I use my brand font?**
You can override the font via the RTL Settings CSS override field. The app ships with a curated library of Arabic and Hebrew fonts covering both decorative (calligraphy) and functional (UI) use cases. See the font settings in `/app/rtl-settings`.

**Does the app support Arabic Tashkeel (diacritics)?**
Yes. Enable Tashkeel support in RTL Settings. This applies CSS properties that ensure diacritical marks render correctly with the selected Arabic font.

---

## Translation Quality

**How accurate are AI translations?**
AI translation quality varies by language and content type. For Arabic, the app uses cultural context analysis (`~/services/cultural-ai`) to improve accuracy for MENA-specific content (fashion, food, prayer times, regional terminology). For critical content (legal, medical), we recommend human review via the translation review queue.

**Can I control how specific terms are translated?**
Yes. Use the Glossary (`/app/glossary`) to define exactly how any term should be translated, or mark it as "never translate" (useful for brand names, product codes, and SKUs).

**What is translation memory?**
Translation memory (TM) stores every translation the app produces. When you translate similar content again, TM matches it and reuses the existing translation instead of calling the AI provider again. This saves API costs and keeps terminology consistent. TM is stored in the Prisma `TranslationMemory` model, scoped per shop.

**What is the fuzzy match threshold?**
When TM finds a similar (but not identical) source text, it compares similarity as a percentage. If similarity exceeds the configured threshold (default 80%), the stored translation is reused with a warning that human review is recommended. You can adjust this threshold in Settings.

**How does cultural context affect translation?**
The cultural AI module classifies content by category (fashion, food, lifestyle, etc.) and applies region-specific prompting when calling the AI provider. For example, it recognizes Gulf Arabic fashion terminology and chooses dialect-appropriate wording over generic Modern Standard Arabic.

**Can I get translations reviewed by a human?**
The translation review queue feature (T0327) is on the roadmap. Currently, you can manually edit any field in the translate screen after auto-translation.

---

## Billing & Plans

**Is there a free trial?**
Yes. All new installs get a 14-day free trial with access to core features (up to 2 languages, 5,000 words/month). No credit card is required to start.

**How does billing work?**
Billing is handled by Shopify's native subscription system (`app_subscriptions` API). Charges appear on your Shopify invoice — there is no separate billing portal.

**What counts as a "word"?**
One word equals one word of source content sent to an AI translation provider. Content served from translation memory does not consume words. The word count resets monthly.

**What happens if I exceed my monthly word limit?**
Auto-translate is disabled until the monthly counter resets. You can still view and manually edit existing translations. Upgrade your plan to increase the limit.

**Can I downgrade my plan?**
Yes. Downgrading takes effect at the end of the current billing period. If the lower plan supports fewer languages than you currently have active, the extra languages will be disabled and their translations will be retained but not served.

**What is plan "Frozen" status?**
If a Shopify charge fails (e.g., payment method expired), the subscription enters "frozen" status. Translation data is preserved but auto-translate is disabled. Resolve the billing issue in your Shopify billing settings.

---

## MENA Payments

**What MENA payment methods are supported?**
The app integrates with Tamara, Tabby, Mada, STC Pay, and Telr. These are configured via the Payments page (`/app/payments`) and require an Enterprise plan.

**What currencies are supported?**
SAR (Saudi Riyal), AED (UAE Dirham), KWD (Kuwaiti Dinar), QAR (Qatari Riyal), BHD (Bahraini Dinar), OMR (Omani Rial), EGP (Egyptian Pound), JOD (Jordanian Dinar).

**How is GCC VAT handled?**
The VAT calculation service (`~/services/vat`) applies the correct rate per country: Saudi Arabia 15%, UAE 5%, Bahrain 10%. VAT is calculated at checkout and displayed in the customer's locale.

**Is Tamara buy-now-pay-later supported?**
Yes. Tamara is one of the supported MENA payment providers. Customers in Saudi Arabia and the UAE can split purchases into 3 interest-free payments.

---

## Supported Languages

**Which languages does the app support?**

| Code | Language | RTL |
|------|----------|-----|
| `ar` | Arabic | Yes |
| `he` | Hebrew | Yes |
| `fa` | Persian | Yes |
| `ur` | Urdu | Yes |
| `en` | English | No |
| `fr` | French | No |
| `de` | German | No |
| `es` | Spanish | No |
| `it` | Italian | No |
| `pt` | Portuguese | No |
| `tr` | Turkish | No |
| `ru` | Russian | No |
| `zh` | Chinese | No |
| `ja` | Japanese | No |
| `ko` | Korean | No |

**Does the app support Arabic dialects?**
Yes. The cultural AI module (`~/services/cultural-ai`) can adapt translations to Gulf Arabic, Egyptian Arabic, Levantine Arabic, and Modern Standard Arabic based on the customer's country or explicit configuration.

**Can I add a language that isn't listed?**
Custom language support is not available in the current version. Languages must be supported by both the app and your chosen translation provider. Contact support to request a new language.

---

## Privacy & GDPR

**Does the app store customer data?**
The app does not store individual customer data. It stores shop-level translation data, glossary terms, and subscription information. All data is scoped per Shopify shop.

**What data is stored in the database?**
- Translation cache (source text, translated text, locale, provider) — automatically expires.
- Translation memory (shop-level pairs).
- Glossary entries.
- Subscription and billing records.
- GDPR consent records and audit logs.

**How do I export or delete my shop data?**
Use the GDPR functions: `exportShopData(shop)` exports all data as JSON. `deleteShopData(shop)` removes all records for your shop. These are triggered automatically by Shopify's GDPR webhooks when you uninstall the app.

**Is the app GDPR compliant?**
Yes. The app implements Shopify's mandatory GDPR webhooks (customer data request, customer data erasure, shop data erasure) and maintains a consent record and audit log.

---

## Technical

**Can I use RTL Storefront on a headless/Hydrogen storefront?**
The translation storage layer (Shopify Translatable Resources) works with any storefront, including Hydrogen. The RTL theme extension only applies to Online Store 2.0 themes. Headless implementations need to apply RTL CSS themselves based on the locale.

**Does the app work with Shopify Markets?**
Yes. Translations are tied to Shopify locales, which integrate with Shopify Markets. Publish a locale in Markets to make it available to customers.

**Can multiple team members access the app?**
Yes on Enterprise plans (team collaboration feature). On lower plans, any Shopify staff member with admin access can use the app, but there are no role-based permissions.

**How do I report a bug or request a feature?**
Open an issue in the GitHub repository or contact support via the Shopify App Store listing page.
