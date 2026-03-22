/**
 * Content field definitions and label dictionaries for collections, pages, blogs, and navigation.
 * Covers tasks T0099 through T0108.
 *
 * All labels provided in en, ar (Arabic), he (Hebrew), fa (Farsi/Persian).
 */

// ---------------------------------------------------------------------------
// T0099 - Collection SEO fields
// ---------------------------------------------------------------------------
export const COLLECTION_SEO_LABELS: Record<string, Record<string, string>> = {
  seo_title: {
    en: "SEO Title",
    ar: "\u0639\u0646\u0648\u0627\u0646 \u062A\u062D\u0633\u064A\u0646 \u0645\u062D\u0631\u0643\u0627\u062A \u0627\u0644\u0628\u062D\u062B",
    he: "\u05DB\u05D5\u05EA\u05E8\u05EA SEO",
    fa: "\u0639\u0646\u0648\u0627\u0646 \u0633\u0626\u0648",
  },
  seo_description: {
    en: "SEO Description",
    ar: "\u0648\u0635\u0641 \u062A\u062D\u0633\u064A\u0646 \u0645\u062D\u0631\u0643\u0627\u062A \u0627\u0644\u0628\u062D\u062B",
    he: "\u05EA\u05D9\u05D0\u05D5\u05E8 SEO",
    fa: "\u062A\u0648\u0636\u06CC\u062D\u0627\u062A \u0633\u0626\u0648",
  },
  og_title: {
    en: "Social Sharing Title",
    ar: "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629 \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u064A\u0629",
    he: "\u05DB\u05D5\u05EA\u05E8\u05EA \u05E9\u05D9\u05EA\u05D5\u05E3 \u05D7\u05D1\u05E8\u05EA\u05D9",
    fa: "\u0639\u0646\u0648\u0627\u0646 \u0627\u0634\u062A\u0631\u0627\u06A9\u200C\u06AF\u0630\u0627\u0631\u06CC \u0627\u062C\u062A\u0645\u0627\u0639\u06CC",
  },
  og_description: {
    en: "Social Sharing Description",
    ar: "\u0648\u0635\u0641 \u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629 \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u064A\u0629",
    he: "\u05EA\u05D9\u05D0\u05D5\u05E8 \u05E9\u05D9\u05EA\u05D5\u05E3 \u05D7\u05D1\u05E8\u05EA\u05D9",
    fa: "\u062A\u0648\u0636\u06CC\u062D\u0627\u062A \u0627\u0634\u062A\u0631\u0627\u06A9\u200C\u06AF\u0630\u0627\u0631\u06CC \u0627\u062C\u062A\u0645\u0627\u0639\u06CC",
  },
};

// ---------------------------------------------------------------------------
// T0100 - Collection sort order labels
// ---------------------------------------------------------------------------
export const SORT_ORDER_LABELS: Record<string, Record<string, string>> = {
  best_selling: {
    en: "Best Selling",
    ar: "\u0627\u0644\u0623\u0643\u062B\u0631 \u0645\u0628\u064A\u0639\u064B\u0627",
    he: "\u05E0\u05DE\u05DB\u05E8\u05D9\u05DD \u05D1\u05D9\u05D5\u05EA\u05E8",
    fa: "\u067E\u0631\u0641\u0631\u0648\u0634\u200C\u062A\u0631\u06CC\u0646",
  },
  alphabetically_az: {
    en: "Alphabetically, A-Z",
    ar: "\u0623\u0628\u062C\u062F\u064A\u064B\u0627\u060C \u0623-\u064A",
    he: "\u05D0\u05DC\u05E4\u05D1\u05D9\u05EA\u05D9\u05EA, \u05D0-\u05EA",
    fa: "\u0627\u0644\u0641\u0628\u0627\u06CC\u06CC\u060C \u0627\u0644\u0641-\u06CC",
  },
  alphabetically_za: {
    en: "Alphabetically, Z-A",
    ar: "\u0623\u0628\u062C\u062F\u064A\u064B\u0627\u060C \u064A-\u0623",
    he: "\u05D0\u05DC\u05E4\u05D1\u05D9\u05EA\u05D9\u05EA, \u05EA-\u05D0",
    fa: "\u0627\u0644\u0641\u0628\u0627\u06CC\u06CC\u060C \u06CC-\u0627\u0644\u0641",
  },
  price_low_high: {
    en: "Price, Low to High",
    ar: "\u0627\u0644\u0633\u0639\u0631\u060C \u0645\u0646 \u0627\u0644\u0623\u0642\u0644 \u0625\u0644\u0649 \u0627\u0644\u0623\u0639\u0644\u0649",
    he: "\u05DE\u05D7\u05D9\u05E8, \u05DE\u05D4\u05E0\u05DE\u05D5\u05DA \u05DC\u05D2\u05D1\u05D5\u05D4",
    fa: "\u0642\u06CC\u0645\u062A\u060C \u0627\u0632 \u06A9\u0645 \u0628\u0647 \u0632\u06CC\u0627\u062F",
  },
  price_high_low: {
    en: "Price, High to Low",
    ar: "\u0627\u0644\u0633\u0639\u0631\u060C \u0645\u0646 \u0627\u0644\u0623\u0639\u0644\u0649 \u0625\u0644\u0649 \u0627\u0644\u0623\u0642\u0644",
    he: "\u05DE\u05D7\u05D9\u05E8, \u05DE\u05D4\u05D2\u05D1\u05D5\u05D4 \u05DC\u05E0\u05DE\u05D5\u05DA",
    fa: "\u0642\u06CC\u0645\u062A\u060C \u0627\u0632 \u0632\u06CC\u0627\u062F \u0628\u0647 \u06A9\u0645",
  },
  date_new_old: {
    en: "Date, New to Old",
    ar: "\u0627\u0644\u062A\u0627\u0631\u064A\u062E\u060C \u0645\u0646 \u0627\u0644\u0623\u062D\u062F\u062B \u0625\u0644\u0649 \u0627\u0644\u0623\u0642\u062F\u0645",
    he: "\u05EA\u05D0\u05E8\u05D9\u05DA, \u05DE\u05D4\u05D7\u05D3\u05E9 \u05DC\u05D9\u05E9\u05DF",
    fa: "\u062A\u0627\u0631\u06CC\u062E\u060C \u0627\u0632 \u062C\u062F\u06CC\u062F \u0628\u0647 \u0642\u062F\u06CC\u0645",
  },
  date_old_new: {
    en: "Date, Old to New",
    ar: "\u0627\u0644\u062A\u0627\u0631\u064A\u062E\u060C \u0645\u0646 \u0627\u0644\u0623\u0642\u062F\u0645 \u0625\u0644\u0649 \u0627\u0644\u0623\u062D\u062F\u062B",
    he: "\u05EA\u05D0\u05E8\u05D9\u05DA, \u05DE\u05D4\u05D9\u05E9\u05DF \u05DC\u05D7\u05D3\u05E9",
    fa: "\u062A\u0627\u0631\u06CC\u062E\u060C \u0627\u0632 \u0642\u062F\u06CC\u0645 \u0628\u0647 \u062C\u062F\u06CC\u062F",
  },
  manual: {
    en: "Manual",
    ar: "\u064A\u062F\u0648\u064A",
    he: "\u05D9\u05D3\u05E0\u05D9",
    fa: "\u062F\u0633\u062A\u06CC",
  },
};

// ---------------------------------------------------------------------------
// T0101 - Page static page translation fields
// ---------------------------------------------------------------------------
export const PAGE_FIELDS: string[] = [
  "title",
  "body_html",
  "seo_title",
  "seo_description",
  "handle",
];

export const PAGE_LABELS: Record<string, Record<string, string>> = {
  title: {
    en: "Page Title",
    ar: "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0635\u0641\u062D\u0629",
    he: "\u05DB\u05D5\u05EA\u05E8\u05EA \u05D4\u05D3\u05E3",
    fa: "\u0639\u0646\u0648\u0627\u0646 \u0635\u0641\u062D\u0647",
  },
  body_html: {
    en: "Page Content",
    ar: "\u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u0635\u0641\u062D\u0629",
    he: "\u05EA\u05D5\u05DB\u05DF \u05D4\u05D3\u05E3",
    fa: "\u0645\u062D\u062A\u0648\u0627\u06CC \u0635\u0641\u062D\u0647",
  },
  seo_title: {
    en: "SEO Title",
    ar: "\u0639\u0646\u0648\u0627\u0646 \u062A\u062D\u0633\u064A\u0646 \u0645\u062D\u0631\u0643\u0627\u062A \u0627\u0644\u0628\u062D\u062B",
    he: "\u05DB\u05D5\u05EA\u05E8\u05EA SEO",
    fa: "\u0639\u0646\u0648\u0627\u0646 \u0633\u0626\u0648",
  },
  seo_description: {
    en: "SEO Description",
    ar: "\u0648\u0635\u0641 \u062A\u062D\u0633\u064A\u0646 \u0645\u062D\u0631\u0643\u0627\u062A \u0627\u0644\u0628\u062D\u062B",
    he: "\u05EA\u05D9\u05D0\u05D5\u05E8 SEO",
    fa: "\u062A\u0648\u0636\u06CC\u062D\u0627\u062A \u0633\u0626\u0648",
  },
  handle: {
    en: "URL Handle",
    ar: "\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0631\u0627\u0628\u0637",
    he: "\u05DB\u05EA\u05D5\u05D1\u05EA URL",
    fa: "\u0634\u0646\u0627\u0633\u0647 \u0646\u0634\u0627\u0646\u06CC",
  },
};

// ---------------------------------------------------------------------------
// T0102 - Page SEO translation
// ---------------------------------------------------------------------------
export const PAGE_SEO_LABELS: Record<string, Record<string, string>> = {
  seo_title: {
    en: "Page SEO Title",
    ar: "\u0639\u0646\u0648\u0627\u0646 \u0633\u064A\u0648 \u0627\u0644\u0635\u0641\u062D\u0629",
    he: "\u05DB\u05D5\u05EA\u05E8\u05EA SEO \u05E9\u05DC \u05D4\u05D3\u05E3",
    fa: "\u0639\u0646\u0648\u0627\u0646 \u0633\u0626\u0648\u06CC \u0635\u0641\u062D\u0647",
  },
  seo_description: {
    en: "Page SEO Description",
    ar: "\u0648\u0635\u0641 \u0633\u064A\u0648 \u0627\u0644\u0635\u0641\u062D\u0629",
    he: "\u05EA\u05D9\u05D0\u05D5\u05E8 SEO \u05E9\u05DC \u05D4\u05D3\u05E3",
    fa: "\u062A\u0648\u0636\u06CC\u062D\u0627\u062A \u0633\u0626\u0648\u06CC \u0635\u0641\u062D\u0647",
  },
  meta_keywords: {
    en: "Meta Keywords",
    ar: "\u0627\u0644\u0643\u0644\u0645\u0627\u062A \u0627\u0644\u0645\u0641\u062A\u0627\u062D\u064A\u0629",
    he: "\u05DE\u05D9\u05DC\u05D5\u05EA \u05DE\u05E4\u05EA\u05D7",
    fa: "\u06A9\u0644\u0645\u0627\u062A \u06A9\u0644\u06CC\u062F\u06CC",
  },
  canonical_url: {
    en: "Canonical URL",
    ar: "\u0627\u0644\u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u0639\u062A\u0645\u062F",
    he: "\u05DB\u05EA\u05D5\u05D1\u05EA URL \u05E7\u05E0\u05D5\u05E0\u05D9\u05EA",
    fa: "\u0646\u0634\u0627\u0646\u06CC \u0627\u06CC\u0646\u062A\u0631\u0646\u062A\u06CC \u0645\u0639\u062A\u0628\u0631",
  },
};

// ---------------------------------------------------------------------------
// T0103 - Blog article title
// ---------------------------------------------------------------------------
export const BLOG_TITLE_LABELS: Record<string, Record<string, string>> = {
  blog_title: {
    en: "Blog Title",
    ar: "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0645\u062F\u0648\u0646\u0629",
    he: "\u05DB\u05D5\u05EA\u05E8\u05EA \u05D4\u05D1\u05DC\u05D5\u05D2",
    fa: "\u0639\u0646\u0648\u0627\u0646 \u0648\u0628\u0644\u0627\u06AF",
  },
  article_title: {
    en: "Article Title",
    ar: "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0645\u0642\u0627\u0644",
    he: "\u05DB\u05D5\u05EA\u05E8\u05EA \u05D4\u05DE\u05D0\u05DE\u05E8",
    fa: "\u0639\u0646\u0648\u0627\u0646 \u0645\u0642\u0627\u0644\u0647",
  },
  subtitle: {
    en: "Subtitle",
    ar: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0641\u0631\u0639\u064A",
    he: "\u05DB\u05D5\u05EA\u05E8\u05EA \u05DE\u05E9\u05E0\u05D4",
    fa: "\u0632\u06CC\u0631\u0639\u0646\u0648\u0627\u0646",
  },
};

// ---------------------------------------------------------------------------
// T0104 - Blog article content
// ---------------------------------------------------------------------------
export const BLOG_CONTENT_LABELS: Record<string, Record<string, string>> = {
  title: {
    en: "Title",
    ar: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646",
    he: "\u05DB\u05D5\u05EA\u05E8\u05EA",
    fa: "\u0639\u0646\u0648\u0627\u0646",
  },
  content: {
    en: "Content",
    ar: "\u0627\u0644\u0645\u062D\u062A\u0648\u0649",
    he: "\u05EA\u05D5\u05DB\u05DF",
    fa: "\u0645\u062D\u062A\u0648\u0627",
  },
  excerpt: {
    en: "Excerpt",
    ar: "\u0627\u0644\u0645\u0642\u062A\u0637\u0641",
    he: "\u05EA\u05E7\u05E6\u05D9\u05E8",
    fa: "\u062E\u0644\u0627\u0635\u0647",
  },
  seo_title: {
    en: "SEO Title",
    ar: "\u0639\u0646\u0648\u0627\u0646 \u062A\u062D\u0633\u064A\u0646 \u0645\u062D\u0631\u0643\u0627\u062A \u0627\u0644\u0628\u062D\u062B",
    he: "\u05DB\u05D5\u05EA\u05E8\u05EA SEO",
    fa: "\u0639\u0646\u0648\u0627\u0646 \u0633\u0626\u0648",
  },
  seo_description: {
    en: "SEO Description",
    ar: "\u0648\u0635\u0641 \u062A\u062D\u0633\u064A\u0646 \u0645\u062D\u0631\u0643\u0627\u062A \u0627\u0644\u0628\u062D\u062B",
    he: "\u05EA\u05D9\u05D0\u05D5\u05E8 SEO",
    fa: "\u062A\u0648\u0636\u06CC\u062D\u0627\u062A \u0633\u0626\u0648",
  },
  tags: {
    en: "Tags",
    ar: "\u0627\u0644\u0648\u0633\u0648\u0645",
    he: "\u05EA\u05D2\u05D9\u05D5\u05EA",
    fa: "\u0628\u0631\u0686\u0633\u0628\u200C\u0647\u0627",
  },
};

// ---------------------------------------------------------------------------
// T0105 - Blog author name
// ---------------------------------------------------------------------------
export const BLOG_AUTHOR_LABELS: Record<string, Record<string, string>> = {
  author_name: {
    en: "Author Name",
    ar: "\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u062A\u0628",
    he: "\u05E9\u05DD \u05D4\u05DE\u05D7\u05D1\u05E8",
    fa: "\u0646\u0627\u0645 \u0646\u0648\u06CC\u0633\u0646\u062F\u0647",
  },
  author_bio: {
    en: "Author Bio",
    ar: "\u0646\u0628\u0630\u0629 \u0639\u0646 \u0627\u0644\u0643\u0627\u062A\u0628",
    he: "\u05D0\u05D5\u05D3\u05D5\u05EA \u05D4\u05DE\u05D7\u05D1\u05E8",
    fa: "\u0628\u06CC\u0648\u06AF\u0631\u0627\u0641\u06CC \u0646\u0648\u06CC\u0633\u0646\u062F\u0647",
  },
};

// ---------------------------------------------------------------------------
// T0106 - Blog category
// ---------------------------------------------------------------------------
export const BLOG_CATEGORY_LABELS: Record<string, Record<string, string>> = {
  category_name: {
    en: "Category",
    ar: "\u0627\u0644\u0641\u0626\u0629",
    he: "\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4",
    fa: "\u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC",
  },
  subcategory: {
    en: "Subcategory",
    ar: "\u0627\u0644\u0641\u0626\u0629 \u0627\u0644\u0641\u0631\u0639\u064A\u0629",
    he: "\u05EA\u05EA-\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4",
    fa: "\u0632\u06CC\u0631\u062F\u0633\u062A\u0647",
  },
  all_categories: {
    en: "All Categories",
    ar: "\u062C\u0645\u064A\u0639 \u0627\u0644\u0641\u0626\u0627\u062A",
    he: "\u05DB\u05DC \u05D4\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D5\u05EA",
    fa: "\u0647\u0645\u0647 \u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC\u200C\u0647\u0627",
  },
  uncategorized: {
    en: "Uncategorized",
    ar: "\u063A\u064A\u0631 \u0645\u0635\u0646\u0641",
    he: "\u05DC\u05DC\u05D0 \u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4",
    fa: "\u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC \u0646\u0634\u062F\u0647",
  },
};

// ---------------------------------------------------------------------------
// T0107 - Navigation menu items
// ---------------------------------------------------------------------------
export const NAVIGATION_LABELS: Record<string, Record<string, string>> = {
  home: {
    en: "Home",
    ar: "\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629",
    he: "\u05D3\u05E3 \u05D4\u05D1\u05D9\u05EA",
    fa: "\u0635\u0641\u062D\u0647 \u0627\u0635\u0644\u06CC",
  },
  shop: {
    en: "Shop",
    ar: "\u0627\u0644\u0645\u062A\u062C\u0631",
    he: "\u05D7\u05E0\u05D5\u05EA",
    fa: "\u0641\u0631\u0648\u0634\u06AF\u0627\u0647",
  },
  collections: {
    en: "Collections",
    ar: "\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0627\u062A",
    he: "\u05E7\u05D5\u05DC\u05E7\u05E6\u05D9\u05D5\u05EA",
    fa: "\u0645\u062C\u0645\u0648\u0639\u0647\u200C\u0647\u0627",
  },
  about: {
    en: "About Us",
    ar: "\u0645\u0646 \u0646\u062D\u0646",
    he: "\u05D0\u05D5\u05D3\u05D5\u05EA\u05D9\u05E0\u05D5",
    fa: "\u062F\u0631\u0628\u0627\u0631\u0647 \u0645\u0627",
  },
  contact: {
    en: "Contact Us",
    ar: "\u0627\u062A\u0635\u0644 \u0628\u0646\u0627",
    he: "\u05E6\u05D5\u05E8 \u05E7\u05E9\u05E8",
    fa: "\u062A\u0645\u0627\u0633 \u0628\u0627 \u0645\u0627",
  },
  blog: {
    en: "Blog",
    ar: "\u0627\u0644\u0645\u062F\u0648\u0646\u0629",
    he: "\u05D1\u05DC\u05D5\u05D2",
    fa: "\u0648\u0628\u0644\u0627\u06AF",
  },
  faq: {
    en: "FAQ",
    ar: "\u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0634\u0627\u0626\u0639\u0629",
    he: "\u05E9\u05D0\u05DC\u05D5\u05EA \u05E0\u05E4\u05D5\u05E6\u05D5\u05EA",
    fa: "\u0633\u0648\u0627\u0644\u0627\u062A \u0645\u062A\u062F\u0627\u0648\u0644",
  },
  cart: {
    en: "Cart",
    ar: "\u0633\u0644\u0629 \u0627\u0644\u062A\u0633\u0648\u0642",
    he: "\u05E2\u05D2\u05DC\u05D4",
    fa: "\u0633\u0628\u062F \u062E\u0631\u06CC\u062F",
  },
  account: {
    en: "Account",
    ar: "\u0627\u0644\u062D\u0633\u0627\u0628",
    he: "\u05D7\u05E9\u05D1\u05D5\u05DF",
    fa: "\u062D\u0633\u0627\u0628 \u06A9\u0627\u0631\u0628\u0631\u06CC",
  },
  search: {
    en: "Search",
    ar: "\u0627\u0644\u0628\u062D\u062B",
    he: "\u05D7\u05D9\u05E4\u05D5\u05E9",
    fa: "\u062C\u0633\u062A\u062C\u0648",
  },
};

// ---------------------------------------------------------------------------
// T0108 - Navigation link title (aria labels for navigation links)
// ---------------------------------------------------------------------------
export const LINK_TITLE_LABELS: Record<string, Record<string, string>> = {
  home_link: {
    en: "Go to homepage",
    ar: "\u0627\u0646\u062A\u0642\u0644 \u0625\u0644\u0649 \u0627\u0644\u0635\u0641\u062D\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629",
    he: "\u05E2\u05D1\u05D5\u05E8 \u05DC\u05D3\u05E3 \u05D4\u05D1\u05D9\u05EA",
    fa: "\u0631\u0641\u062A\u0646 \u0628\u0647 \u0635\u0641\u062D\u0647 \u0627\u0635\u0644\u06CC",
  },
  shop_link: {
    en: "Browse products",
    ar: "\u062A\u0635\u0641\u062D \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A",
    he: "\u05E2\u05D9\u05D9\u05DF \u05D1\u05DE\u05D5\u05E6\u05E8\u05D9\u05DD",
    fa: "\u0645\u0631\u0648\u0631 \u0645\u062D\u0635\u0648\u0644\u0627\u062A",
  },
  collections_link: {
    en: "View collections",
    ar: "\u0639\u0631\u0636 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0627\u062A",
    he: "\u05E6\u05E4\u05D4 \u05D1\u05E7\u05D5\u05DC\u05E7\u05E6\u05D9\u05D5\u05EA",
    fa: "\u0645\u0634\u0627\u0647\u062F\u0647 \u0645\u062C\u0645\u0648\u0639\u0647\u200C\u0647\u0627",
  },
  about_link: {
    en: "Learn about us",
    ar: "\u062A\u0639\u0631\u0641 \u0639\u0644\u064A\u0646\u0627",
    he: "\u05DC\u05DE\u05D3 \u05E2\u05DC\u05D9\u05E0\u05D5",
    fa: "\u062F\u0631\u0628\u0627\u0631\u0647 \u0645\u0627 \u0628\u06CC\u0634\u062A\u0631 \u0628\u062F\u0627\u0646\u06CC\u062F",
  },
  contact_link: {
    en: "Get in touch",
    ar: "\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627",
    he: "\u05E6\u05D5\u05E8 \u05E7\u05E9\u05E8",
    fa: "\u0628\u0627 \u0645\u0627 \u062F\u0631 \u062A\u0645\u0627\u0633 \u0628\u0627\u0634\u06CC\u062F",
  },
  blog_link: {
    en: "Read our blog",
    ar: "\u0627\u0642\u0631\u0623 \u0645\u062F\u0648\u0646\u062A\u0646\u0627",
    he: "\u05E7\u05E8\u05D0 \u05D0\u05EA \u05D4\u05D1\u05DC\u05D5\u05D2 \u05E9\u05DC\u05E0\u05D5",
    fa: "\u0648\u0628\u0644\u0627\u06AF \u0645\u0627 \u0631\u0627 \u0628\u062E\u0648\u0627\u0646\u06CC\u062F",
  },
  faq_link: {
    en: "View frequently asked questions",
    ar: "\u0639\u0631\u0636 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0634\u0627\u0626\u0639\u0629",
    he: "\u05E6\u05E4\u05D4 \u05D1\u05E9\u05D0\u05DC\u05D5\u05EA \u05E0\u05E4\u05D5\u05E6\u05D5\u05EA",
    fa: "\u0645\u0634\u0627\u0647\u062F\u0647 \u0633\u0648\u0627\u0644\u0627\u062A \u0645\u062A\u062F\u0627\u0648\u0644",
  },
  cart_link: {
    en: "View your cart",
    ar: "\u0639\u0631\u0636 \u0633\u0644\u0629 \u0627\u0644\u062A\u0633\u0648\u0642",
    he: "\u05E6\u05E4\u05D4 \u05D1\u05E2\u05D2\u05DC\u05D4 \u05E9\u05DC\u05DA",
    fa: "\u0645\u0634\u0627\u0647\u062F\u0647 \u0633\u0628\u062F \u062E\u0631\u06CC\u062F",
  },
  account_link: {
    en: "Manage your account",
    ar: "\u0625\u062F\u0627\u0631\u0629 \u062D\u0633\u0627\u0628\u0643",
    he: "\u05E0\u05D4\u05DC \u05D0\u05EA \u05D4\u05D7\u05E9\u05D1\u05D5\u05DF \u05E9\u05DC\u05DA",
    fa: "\u0645\u062F\u06CC\u0631\u06CC\u062A \u062D\u0633\u0627\u0628 \u06A9\u0627\u0631\u0628\u0631\u06CC",
  },
  search_link: {
    en: "Search our store",
    ar: "\u0627\u0628\u062D\u062B \u0641\u064A \u0645\u062A\u062C\u0631\u0646\u0627",
    he: "\u05D7\u05E4\u05E9 \u05D1\u05D7\u05E0\u05D5\u05EA \u05E9\u05DC\u05E0\u05D5",
    fa: "\u062C\u0633\u062A\u062C\u0648 \u062F\u0631 \u0641\u0631\u0648\u0634\u06AF\u0627\u0647 \u0645\u0627",
  },
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type ContentFieldType =
  | "collection_seo"
  | "sort_order"
  | "page"
  | "page_seo"
  | "blog_title"
  | "blog_content"
  | "blog_author"
  | "blog_category"
  | "navigation"
  | "link_title";

// ---------------------------------------------------------------------------
// Internal mapping from field type to dictionary
// ---------------------------------------------------------------------------
const FIELD_TYPE_MAP: Record<ContentFieldType, Record<string, Record<string, string>>> = {
  collection_seo: COLLECTION_SEO_LABELS,
  sort_order: SORT_ORDER_LABELS,
  page: PAGE_LABELS,
  page_seo: PAGE_SEO_LABELS,
  blog_title: BLOG_TITLE_LABELS,
  blog_content: BLOG_CONTENT_LABELS,
  blog_author: BLOG_AUTHOR_LABELS,
  blog_category: BLOG_CATEGORY_LABELS,
  navigation: NAVIGATION_LABELS,
  link_title: LINK_TITLE_LABELS,
};

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

/**
 * Get a single translated label for a given field type, field name, and locale.
 * Falls back to English if the locale is not found, or returns the fieldName
 * itself if neither locale nor English are available.
 */
export function getFieldLabel(
  fieldType: string,
  fieldName: string,
  locale: string,
): string {
  const dict = FIELD_TYPE_MAP[fieldType as ContentFieldType];
  if (!dict) return fieldName;
  const entry = dict[fieldName];
  if (!entry) return fieldName;
  return entry[locale] ?? entry["en"] ?? fieldName;
}

/**
 * Get all translated labels for a given field type in a specific locale.
 * Returns a flat Record<fieldName, translatedLabel>.
 */
export function getAllFieldLabels(
  fieldType: string,
  locale: string,
): Record<string, string> {
  const dict = FIELD_TYPE_MAP[fieldType as ContentFieldType];
  if (!dict) return {};
  const result: Record<string, string> = {};
  for (const [key, translations] of Object.entries(dict)) {
    result[key] = translations[locale] ?? translations["en"] ?? key;
  }
  return result;
}
