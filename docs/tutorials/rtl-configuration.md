# Tutorial: Configuring RTL Layout

This tutorial covers everything needed to make your Shopify store display correctly for right-to-left languages: enabling the theme extension, selecting fonts, handling mixed-direction text, and writing custom CSS overrides.

**Prerequisites**
- RTL Storefront installed (see [Getting Started](./getting-started.md))
- At least one RTL locale active (Arabic, Hebrew, Persian, or Urdu)

---

## How RTL Layout Works

When a customer views your store with an RTL locale active, the RTL Storefront theme extension:

1. Reads `Shopify.locale` on the storefront.
2. Checks whether the locale is in the RTL set (`ar`, `he`, `fa`, `ur`).
3. Sets `dir="rtl"` on the `<html>` element.
4. Injects font-face CSS for the configured Arabic/Hebrew font.
5. Applies CSS custom properties that override the theme's directional values.

Modern Shopify themes built with CSS logical properties (`margin-inline-start`, `padding-inline-end`, `text-align: start`, etc.) automatically flip their layout. Older themes built with `margin-left` / `float: left` may need manual overrides.

---

## Step 1 — Enable the Theme Extension

The RTL layout theme extension must be enabled in your theme.

1. In Shopify Admin, go to **Online Store > Themes**.
2. Click **Customize** on your active theme.
3. In the theme editor sidebar, click **App embeds** (bottom of the left panel).
4. Find **RTL Storefront — RTL Layout** and toggle it on.
5. Click **Save** in the top-right corner.
6. Click **Publish** if the theme was a draft.

The extension is now active. It will apply RTL styling automatically whenever a customer's locale is Arabic, Hebrew, Persian, or Urdu.

---

## Step 2 — Configure RTL Settings

Open **RTL Settings** (`/app/rtl-settings`) in the RTL Storefront dashboard.

### Auto-detect RTL

Keep this enabled (default). It detects RTL locales at the locale level and applies RTL layout globally. Disabling it means you would need to handle RTL detection manually.

### Arabic Font

Choose from the bundled Arabic font library:

| Font | Style | Best for |
|------|-------|---------|
| Noto Sans Arabic | Clean, modern | Product pages, body text |
| Cairo | Geometric, contemporary | Headers, marketing copy |
| Tajawal | Minimal | UI labels, navigation |
| Amiri | Traditional | Editorial, luxury brands |
| Scheherazade | Calligraphic | Decorative headings |

Click **Preview** next to any font to see it rendered with sample Arabic text before applying.

### Hebrew Font

| Font | Style | Best for |
|------|-------|---------|
| Heebo | Geometric | General use (default) |
| Rubik | Rounded, friendly | Consumer brands |
| Frank Ruhl Libre | Serif | Editorial, premium |
| Secular One | Bold | Headers |

### Tashkeel (Arabic diacritics)

Enable Tashkeel support if your translations include Arabic diacritical marks (short vowel signs, shadda, etc.). This applies CSS properties that ensure marks render at the correct vertical position and spacing for the selected font.

Leave this off if you are not using diacritics — some fonts render the baseline differently when Tashkeel CSS is applied.

---

## Step 3 — Test RTL Layout

Open your storefront and append `?locale=ar` to any URL:

```
https://your-store.myshopify.com?locale=ar
https://your-store.myshopify.com/products/your-product?locale=ar
https://your-store.myshopify.com/collections/all?locale=ar
```

Check the following on each page type:

**Homepage**
- Navigation is right-aligned
- Hero banner text starts from the right
- Product grid cards are mirrored (image on right, text on left)
- Footer links align right

**Product page**
- Title is right-aligned
- Description text flows right-to-left with correct line breaks
- Images remain visible (images are not flipped — only the layout direction changes)
- Add to Cart button is on the correct side
- Variant selectors (size, color) are right-aligned
- Price is displayed correctly (Arabic-Indic numerals are optional — see below)

**Cart and checkout**
- Line items show product titles in Arabic
- Totals and prices are right-aligned
- Checkout button is accessible and labeled in Arabic

---

## Step 4 — Fix Common RTL Layout Issues

### Issue: Text alignment is wrong in one section

Some theme sections use `text-align: left` explicitly instead of `text-align: start`. These do not flip automatically.

**Fix**: Add a CSS override in RTL Settings:

```css
.your-section-class {
  text-align: right;
}
```

Find the class name by inspecting the element in your browser's developer tools.

### Issue: Icons/chevrons point the wrong direction

Navigation arrows and carousel chevrons are often LTR-specific icons. In RTL, a "next" chevron should point left.

**Fix**: Use a CSS transform override:

```css
.icon-chevron-right,
.slick-next {
  transform: scaleX(-1);
}
```

Or use the CSS logical property approach if the theme supports it:

```css
[dir="rtl"] .icon-chevron-right {
  transform: scaleX(-1);
}
```

### Issue: Floated elements are not flipping

Old themes using `float: left` and `float: right` do not respect `dir="rtl"`.

**Fix**: Add overrides that swap floats:

```css
[dir="rtl"] .float-left { float: right; }
[dir="rtl"] .float-right { float: left; }
[dir="rtl"] .text-left { text-align: right; }
[dir="rtl"] .text-right { text-align: left; }
```

### Issue: Mixed Arabic and English text wraps incorrectly

Inline LTR text (prices, product codes, URLs) inside an RTL paragraph can cause incorrect wrapping.

**Fix**: The BiDi preservation service handles this automatically for translated content. For static template text that is not run through the translation engine, wrap LTR spans with the `dir="ltr"` attribute:

```html
<span dir="ltr">SKU-12345</span>
```

Or use Unicode directional marks in the text itself:

```
\u200E (Left-to-Right Mark) before LTR text in an RTL context
\u200F (Right-to-Left Mark) before RTL text in an LTR context
```

---

## Step 5 — CSS Override Field

The RTL Settings page includes a CSS override field. Any CSS you enter here is injected only when the active locale is RTL. This is the recommended place for theme-specific RTL fixes — it keeps your overrides in one place and does not affect the LTR experience.

Example: override the theme header layout for RTL:

```css
/* Ensure logo stays on the right in RTL */
.site-header__logo-image {
  margin-inline-start: 0;
  margin-inline-end: auto;
}

/* Flip the mobile menu icon position */
.site-header__menu-toggle {
  order: -1;
}
```

Save, then refresh your storefront with `?locale=ar` to preview the change.

---

## Step 6 — Arabic Numeral Display (Optional)

By default, prices and quantities use Western Arabic-Indic numerals (0–9). To display Eastern Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩) for Arabic locale customers:

Enable **Arabic numerals** in RTL Settings. This uses CSS `font-feature-settings` and Unicode number form substitution for content served in Arabic locale.

Note: Most MENA e-commerce customers are accustomed to both numeral systems. Western numerals are safe for international stores.

---

## Step 7 — Language Switcher

A language switcher widget lets customers change locale without modifying the URL manually. Configure it in **Settings** (`/app/settings`) > **Language Switcher**.

Options:
- **Placement**: Header, footer, or floating button
- **Style**: Dropdown, flag icons, or text list
- **Show flags**: Display country flag emoji alongside the language name
- **Show native names**: Display language name in its own script (e.g., "العربية" instead of "Arabic")
- **Compact mode**: Icon-only display for header space savings

The switcher is injected via the theme extension using the same App Embeds mechanism as the RTL layout.

---

## Verifying the Complete RTL Setup

Run through this checklist before launching to an Arabic/Hebrew audience:

- [ ] Theme extension enabled in Themes > Customize > App Embeds
- [ ] Arabic/Hebrew locale published in Shopify Markets
- [ ] Target language enabled in RTL Storefront Settings
- [ ] Translation provider API key verified
- [ ] Key products translated (title, description, SEO fields)
- [ ] Glossary populated with brand names and product codes
- [ ] RTL layout checked on: homepage, product page, collection page, cart, checkout
- [ ] Mixed-direction text (prices, codes) renders correctly
- [ ] Language switcher visible and functional in storefront
- [ ] Translation coverage at 80%+ for the target locale (`/app/coverage`)
