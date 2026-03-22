# Tutorial: Getting Started with RTL Storefront

This tutorial walks you through installing the app and completing initial setup so your store is ready to serve customers in Arabic (or any other supported language) within 15 minutes.

**Prerequisites**
- A Shopify store with at least one published product
- Admin access to the store

---

## Step 1 — Install the App

1. Go to the [RTL Storefront listing](https://apps.shopify.com) on the Shopify App Store.
2. Click **Add app**.
3. Review the requested permissions:
   - `write_translations` — to save translated content
   - `read_products` / `read_collections` — to fetch content to translate
4. Click **Install app**.

You are redirected to the RTL Storefront dashboard inside your Shopify Admin.

---

## Step 2 — Complete the Onboarding Wizard

The onboarding wizard at `/app/onboarding` guides you through five steps. A progress bar at the top shows how far along you are.

### 2a. Welcome

Read the feature overview and click **Get started**.

### 2b. Choose target languages

Toggle on the languages you want to translate into. For a MENA-focused store, start with:

- Arabic (`ar`) — required for Saudi Arabia, UAE, Egypt, and most GCC markets
- Hebrew (`he`) — required for Israel

You can add more languages later in Settings. The number of languages you can enable simultaneously depends on your plan (2 on trial, up to unlimited on Enterprise).

Click **Next**.

### 2c. Connect a translation provider

The app needs an AI translation provider to auto-translate your content.

**Option A — OpenAI (recommended for MENA content)**

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
2. Create a new API key.
3. Paste it in the **OpenAI API Key** field.
4. Click **Verify** to confirm it works.

**Option B — DeepL (recommended for European languages)**

1. Go to [deepl.com/pro-api](https://www.deepl.com/pro-api).
2. Sign up for a free or paid plan and copy your API key.
3. Paste it in the **DeepL API Key** field.

**Option C — Google Translate**

1. Enable the Cloud Translation API in your Google Cloud project.
2. Create a service account and download the access token.
3. Paste it in the **Google Translate Access Token** field.

You can configure additional providers later in Settings (`/app/settings`). Click **Next**.

### 2d. Enable RTL layout

If you enabled Arabic, Hebrew, Persian, or Urdu, toggle on **Auto-detect RTL**. This automatically applies right-to-left layout when customers view your store in those languages.

Optionally select an Arabic font. The default (Noto Sans Arabic) is a safe choice that renders correctly on all devices. Click **Next**.

### 2e. Done

Your setup is complete. Click **Go to dashboard** to open the main app.

---

## Step 3 — Publish the Target Language in Shopify Markets

Before customers can see your translated content, you need to publish the locale in Shopify.

1. In Shopify Admin, go to **Settings > Markets**.
2. Click on the market you're targeting (or create a new one, e.g., "Gulf States").
3. Under **Languages**, click **Add language** and select Arabic.
4. Click **Publish**.

Shopify will now serve Arabic content to customers whose browser or Shopify session is set to Arabic.

---

## Step 4 — Translate Your First Product

1. In RTL Storefront, click **Translate** in the left nav (route: `/app/translate`).
2. Select **Products** from the resource type dropdown.
3. Find a product in the list and click **Translate**.
4. In the translation screen, click **Auto-translate all fields**.

The app sends each field (title, description, SEO fields) to your configured AI provider and displays the results. For Arabic, it applies cultural context analysis to improve accuracy.

5. Review the translations. You can edit any field directly in the text boxes.
6. Click **Save translations**.

Your product is now translated. Customers viewing your store with Arabic as their active locale will see the Arabic version.

---

## Step 5 — Verify RTL Layout in Your Storefront

1. Open your storefront URL.
2. Append `?locale=ar` to the URL (e.g., `https://mystore.myshopify.com?locale=ar`).
3. Your store should:
   - Display all text right-to-left
   - Show the Arabic font you selected
   - Align navigation and layout elements correctly

If RTL layout is not applying, verify that the RTL Storefront theme extension is enabled:

1. Go to Shopify Admin > **Online Store > Themes**.
2. Click **Customize** on your active theme.
3. In the theme editor, click **App embeds** (or check the Extensions panel).
4. Enable **RTL Storefront — RTL Layout**.
5. Save and republish.

---

## Step 6 — Check Translation Coverage

Go to **Coverage** (`/app/coverage`) to see how much of your store content has been translated. The dashboard shows:

- Overall coverage percentage per language
- Breakdown by resource type (products, collections, pages)
- A trend indicator showing if coverage is improving

Aim for 80%+ coverage (green) before launching to a new market.

---

## Next Steps

- **Translate more content**: Collections, pages, and blog articles — see [Translating Products](./translating-products.md).
- **Set up RTL in detail**: Font selection, CSS overrides, Tashkeel — see [RTL Configuration](./rtl-configuration.md).
- **Add glossary terms**: Ensure brand names and product codes are always consistent — see the Glossary section in the [User Guide](../user-guide.md).
- **Review billing**: Upgrade from the trial when you're ready — `/app/billing`.
