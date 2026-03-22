# Tutorial: Translating Product Content

This tutorial covers translating all product-related content: titles, descriptions, variants, SEO fields, and collections. It also covers using the glossary to ensure brand names are always handled correctly.

**Prerequisites**
- RTL Storefront installed and a translation provider configured (see [Getting Started](./getting-started.md))
- At least one product in your store

---

## What Content Can Be Translated?

The app translates all fields exposed by Shopify's Translatable Resources API for products:

| Field | Description |
|-------|-------------|
| `title` | Product name |
| `body_html` | Product description (HTML preserved) |
| `handle` | URL slug |
| `meta_title` | SEO page title |
| `meta_description` | SEO meta description |
| Variant `title` | Option names (Color, Size) and option values |
| Variant `option1/2/3` | Specific variant values |

For collections:

| Field | Description |
|-------|-------------|
| `title` | Collection name |
| `body_html` | Collection description |
| `handle` | URL slug |
| `meta_title` | SEO page title |
| `meta_description` | SEO meta description |

---

## Translating a Single Product

### 1. Open the translate screen

Navigate to **Translate** (`/app/translate`) and choose **Products** from the resource type selector.

### 2. Select the product

Use the search bar to find the product by name or scroll the product list. Click **Translate** on the row.

### 3. Choose the target language

A language selector appears at the top of the translation screen. Pick the target locale (e.g., Arabic `ar`).

The left column shows the original (source) content. The right column shows any existing translations.

### 4. Auto-translate

Click **Auto-translate all fields** to run AI translation for all empty fields. Already-translated fields are skipped unless you check **Re-translate existing**.

The app:
1. Reads each field's `translatableContentDigest` from Shopify.
2. Checks translation memory for a match — if found, uses it without an AI call.
3. For unmatched fields, applies glossary substitutions, sends the text to the AI provider, then restores glossary terms.
4. Displays the result in the right column.

For Arabic, the cultural AI module (`~/services/cultural-ai`) applies MENA-specific context based on your product category (fashion, electronics, food, etc.).

### 5. Review and edit

Read through each translated field. Pay particular attention to:

- **Title**: Should be concise and match regional naming conventions.
- **body_html**: HTML tags are preserved. Check that lists, headings, and line breaks are still correct.
- **handle**: URL slugs are usually left in the source language for SEO continuity. You can override this.
- **meta_title / meta_description**: SEO fields should include regional keywords, not just direct translations.

Click any field to edit it inline.

### 6. Save

Click **Save translations**. The app calls Shopify's `translationsRegister` mutation (via `POST /api/v1/translations`) to store the translations in Shopify.

A success banner confirms the save. Shopify serves the translations to customers immediately.

---

## Bulk Translation

For stores with many products, translate in bulk from the **Translations** dashboard (`/app/translations`).

### Filter by coverage

The dashboard shows all resources grouped by type. Use the **Coverage** filter to show only untranslated or partially translated resources.

### Bulk auto-translate

1. Select products using the checkboxes.
2. Click **Auto-translate selected**.
3. Choose the target locale.
4. The app queues translation jobs. Progress is visible in the status bar.

Bulk jobs run in the background. You can navigate away and return to check progress. The job status is visible at `GET /api/v1/status`.

---

## Using the Glossary for Consistent Terminology

Before running bulk translation, set up your glossary (`/app/glossary`) to ensure critical terms are always handled correctly.

### Brand names (never translate)

1. Click **Add term**.
2. Source locale: `en`, Target locale: `ar`.
3. Source term: `Nike`.
4. Toggle on **Never translate**.
5. Click **Save**.

The word "Nike" will now be left unchanged in all Arabic translations.

### Product type terminology

If your store sells abayas, you want the Arabic translation to be consistent and accurate:

1. Source term: `abaya`, Translated term: `عباية`.
2. Leave **Never translate** off.
3. Category: `fashion`.
4. Click **Save**.

Every translation that contains "abaya" will now use "عباية" consistently.

---

## Translating Collections

The workflow is identical to products. Navigate to **Translate** (`/app/translate`), choose **Collections**, and follow the same steps.

Collections are important because their SEO titles and descriptions appear in search engine results for category pages.

---

## Handling HTML Content

Product descriptions often contain HTML. The translation engine preserves HTML tags — only the text content between tags is sent to the AI provider.

For example:
```html
<p>Premium quality leather shoes.</p>
<ul><li>Genuine leather</li><li>Handmade in Italy</li></ul>
```

Is translated as:
```html
<p>أحذية جلدية فاخرة.</p>
<ul><li>جلد طبيعي</li><li>مصنوعة يدوياً في إيطاليا</li></ul>
```

If you see broken HTML in the translated output, edit the field manually and fix the tags. HTML structure errors in the source content can cause issues.

---

## SEO Considerations for MENA Markets

When translating `meta_title` and `meta_description`, consider:

1. **Use regional Arabic keywords** — Direct translations of English SEO keywords may not match what MENA users actually search for. Research Arabic keywords specific to your product category.

2. **Character limits differ** — Google's title limit is ~60 characters. Arabic text is often shorter in character count but wider in rendered width due to the font. Test in Google Search Console.

3. **URL slugs** — Most merchants keep the English URL slug for products (e.g., `/products/leather-shoes`). For maximum SEO impact in Arabic markets, you can set an Arabic slug via the `handle` field, but ensure your theme supports it.

4. **hreflang tags** — The app's sitemap generator (`/sitemap.xml`) automatically adds `hreflang` alternate tags for all active locales, which helps Google understand your multilingual structure.

---

## Checking Translation Quality

After saving, preview the product page in your target locale:

1. Open `https://your-store.myshopify.com/products/your-product?locale=ar`.
2. Check that:
   - Text is displayed right-to-left (if Arabic, Hebrew, Persian, or Urdu).
   - Images have no embedded text that still shows in English.
   - Prices are formatted correctly for the locale.
   - Variant selectors show translated option names.

Any issues with RTL layout that are not caused by translations are addressed in the [RTL Configuration tutorial](./rtl-configuration.md).
