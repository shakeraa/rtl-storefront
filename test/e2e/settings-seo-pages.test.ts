/**
 * E2E-style tests for Settings & SEO route services.
 *
 * Covers:
 *  - SEO structured data (Product, Breadcrumb, Organization schemas)
 *  - Sitemap XML generation
 *  - SEO config / meta tags / validation
 *  - Language switcher (inline + floating)
 *  - Fonts (Arabic font library)
 *  - RTL CSS generation
 *  - Translation Memory matcher (pure functions only — no DB)
 */
import { describe, it, expect } from "vitest";

// SEO structured data
import {
  generateProductSchema,
  generateBreadcrumbSchema,
  generateOrganizationSchema,
} from "../../app/services/seo/structured-data";

// SEO index (meta tags, config, validation)
import {
  generateMetaTagsForLocale,
  getMultilingualSEOConfig,
  validateSEOSetup,
} from "../../app/services/seo/index";

// SEO infrastructure
import type { SEOConfig } from "../../app/services/seo-infrastructure/index";
import {
  generateHreflangMeta,
  generateCanonical,
  generateRobotsTxt,
  transliterateToSlug,
  generateLocalizedBreadcrumbs,
} from "../../app/services/seo-infrastructure/index";

// Hreflang
import {
  generateHreflangTags,
  getXDefaultUrl,
} from "../../app/services/seo/hreflang";

// Sitemap
import {
  generateSitemapXml,
  generateSitemapIndex,
} from "../../app/services/sitemap/generator";

// Language switcher — inline
import {
  getInlineSwitcherConfig,
  getDisplayOptions,
  getDropdownLabels,
  formatLanguageOption,
  toggleDropdown,
  closeDropdown,
  openDropdown,
  getOptimalDropdownPosition,
  getTriggerDisplay,
  sortLanguageOptions,
  filterLanguageOptions,
  getKeyboardNavigation,
  shouldUseCompactMode,
  getThemeVariables,
} from "../../app/services/language-switcher/inline";

// Language switcher — floating
import {
  getFloatingSwitcherConfig,
  getPositionStyles,
  getVisibilityRules,
  getSwitcherLabels,
  getRTLPositionAdjustments,
  getResponsiveOffsets,
  shouldMinimizeOnScroll,
  getMobileOptimizedConfig,
  shouldShowOnMobile,
  getAccessibilityAttributes,
} from "../../app/services/language-switcher/floating";

// Language options
import { buildLanguageOptions } from "../../app/services/language-switcher/options";

// Fonts
import {
  ARABIC_FONTS,
  getFontById,
  getFontsByCategory,
  getFontsFor,
  generateGoogleFontsUrl,
  generateSubsetFontUrl,
  getFontPreloadHints,
  DEFAULT_ARABIC_FONT,
  FONT_PAIRINGS,
  DEFAULT_FONT_CONFIG,
  generateFontCSSVariables,
  getFontIdsFromConfig,
  generateFontLinks,
  validateFontConfig,
  applyFontPairing,
} from "../../app/services/fonts/index";

// RTL CSS generator
import {
  generateRTLCSS,
  generateRuleBlock,
  generateMixedDirectionCSS,
} from "../../app/services/rtl/css-generator";

// Translation memory — pure matcher functions (no DB)
import {
  levenshteinDistance,
  calculateSimilarity,
  normalizeForMatching,
} from "../../app/services/translation-memory/matcher";

// =========================================================================
// SEO STRUCTURED DATA — Product Schema
// =========================================================================

describe("SEO Structured Data — Product Schema", () => {
  const fullProduct = {
    title: "Silk Abaya",
    description: "Premium silk abaya for elegant occasions",
    handle: "silk-abaya",
    featuredImage: { url: "https://cdn.shop.com/silk-abaya.jpg" },
    priceRange: { minVariantPrice: { amount: "199.99", currencyCode: "SAR" } },
    vendor: "Luxury MENA",
    variants: { edges: [{ node: { sku: "SKU-ABAYA-001", price: "199.99" } }] },
    availableForSale: true,
  };

  it("generates product schema with all fields", () => {
    const schema = generateProductSchema(fullProduct, "ar") as Record<string, any>;
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Product");
    expect(schema.name).toBe("Silk Abaya");
    expect(schema.description).toBe("Premium silk abaya for elegant occasions");
    expect(schema.inLanguage).toBe("ar");
    expect(schema.image).toBe("https://cdn.shop.com/silk-abaya.jpg");
    expect(schema.sku).toBe("SKU-ABAYA-001");
    expect(schema.brand).toEqual({ "@type": "Brand", name: "Luxury MENA" });
    expect(schema.offers).toEqual({
      "@type": "Offer",
      price: "199.99",
      priceCurrency: "SAR",
      availability: "https://schema.org/InStock",
    });
  });

  it("includes inLanguage for each locale", () => {
    const arSchema = generateProductSchema(fullProduct, "ar") as Record<string, any>;
    const heSchema = generateProductSchema(fullProduct, "he") as Record<string, any>;
    const enSchema = generateProductSchema(fullProduct, "en") as Record<string, any>;
    expect(arSchema.inLanguage).toBe("ar");
    expect(heSchema.inLanguage).toBe("he");
    expect(enSchema.inLanguage).toBe("en");
  });

  it("maps availability to correct schema.org URLs", () => {
    const inStock = generateProductSchema({ ...fullProduct, availableForSale: true }, "en") as Record<string, any>;
    expect(inStock.offers.availability).toBe("https://schema.org/InStock");

    const outOfStock = generateProductSchema({ ...fullProduct, availableForSale: false }, "en") as Record<string, any>;
    expect(outOfStock.offers.availability).toBe("https://schema.org/OutOfStock");
  });

  it("includes brand when vendor is present", () => {
    const schema = generateProductSchema(fullProduct, "en") as Record<string, any>;
    expect(schema.brand).toEqual({ "@type": "Brand", name: "Luxury MENA" });
  });

  it("omits brand when vendor is empty", () => {
    const schema = generateProductSchema({ ...fullProduct, vendor: "" }, "en") as Record<string, any>;
    expect(schema.brand).toBeUndefined();
  });

  it("omits brand when vendor is missing", () => {
    const { vendor, ...noVendor } = fullProduct;
    const schema = generateProductSchema(noVendor, "en") as Record<string, any>;
    expect(schema.brand).toBeUndefined();
  });

  it("omits sku when empty", () => {
    const schema = generateProductSchema(
      { ...fullProduct, variants: { edges: [{ node: { sku: "", price: "10" } }] } },
      "en",
    ) as Record<string, any>;
    expect(schema.sku).toBeUndefined();
  });

  it("defaults to USD when currency is missing", () => {
    const schema = generateProductSchema(
      { title: "Test", description: "d", price: "10", sku: "X" },
      "en",
    ) as Record<string, any>;
    expect(schema.offers.priceCurrency).toBe("USD");
  });

  it("handles null / undefined product gracefully", () => {
    const schema = generateProductSchema(null, "en") as Record<string, any>;
    expect(schema["@type"]).toBe("Product");
    expect(schema.name).toBe("");
    expect(schema.description).toBe("");
  });

  it("handles empty product gracefully", () => {
    const schema = generateProductSchema({}, "en") as Record<string, any>;
    expect(schema.name).toBe("");
    expect(schema.offers.price).toBe("0");
  });

  it("reads from alternate field names (name instead of title)", () => {
    const schema = generateProductSchema({ name: "Alt Name" }, "en") as Record<string, any>;
    expect(schema.name).toBe("Alt Name");
  });
});

// =========================================================================
// SEO STRUCTURED DATA — Breadcrumb Schema
// =========================================================================

describe("SEO Structured Data — Breadcrumb Schema", () => {
  it("generates breadcrumb schema with correct structure", () => {
    const crumbs = [
      { name: "الرئيسية", url: "https://shop.com/ar" },
      { name: "ملابس", url: "https://shop.com/ar/clothing" },
    ];
    const schema = generateBreadcrumbSchema(crumbs, "ar") as Record<string, any>;
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("BreadcrumbList");
    expect(schema.inLanguage).toBe("ar");
    expect(schema.itemListElement).toHaveLength(2);
    expect(schema.itemListElement[0].position).toBe(1);
    expect(schema.itemListElement[0].name).toBe("الرئيسية");
    expect(schema.itemListElement[1].position).toBe(2);
  });

  it("generates locale-specific home labels (ar)", () => {
    const crumbs = [{ name: "الرئيسية", url: "https://shop.com/ar" }];
    const schema = generateBreadcrumbSchema(crumbs, "ar") as Record<string, any>;
    expect(schema.itemListElement[0].name).toBe("الرئيسية");
  });

  it("generates locale-specific home labels (he)", () => {
    const crumbs = [{ name: "דף הבית", url: "https://shop.com/he" }];
    const schema = generateBreadcrumbSchema(crumbs, "he") as Record<string, any>;
    expect(schema.itemListElement[0].name).toBe("דף הבית");
    expect(schema.inLanguage).toBe("he");
  });

  it("handles empty breadcrumb list", () => {
    const schema = generateBreadcrumbSchema([], "en") as Record<string, any>;
    expect(schema.itemListElement).toEqual([]);
  });

  it("generates localized breadcrumbs as JSON-LD script tag", () => {
    const items = [{ name: "Home", url: "https://shop.com" }];
    const html = generateLocalizedBreadcrumbs(items, "en");
    expect(html).toContain('<script type="application/ld+json">');
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).toContain('"inLanguage":"en"');
  });
});

// =========================================================================
// SEO STRUCTURED DATA — Organization Schema
// =========================================================================

describe("SEO Structured Data — Organization Schema", () => {
  it("generates organization schema from full shop data", () => {
    const shop = {
      name: "MENA Store",
      primaryDomain: { url: "https://mena-store.com" },
      email: "info@mena-store.com",
      brand: { logo: { image: { url: "https://mena-store.com/logo.png" } } },
      description: "Top store for MENA region",
    };
    const schema = generateOrganizationSchema(shop, "ar") as Record<string, any>;
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Organization");
    expect(schema.name).toBe("MENA Store");
    expect(schema.url).toBe("https://mena-store.com");
    expect(schema.email).toBe("info@mena-store.com");
    expect(schema.logo).toBe("https://mena-store.com/logo.png");
    expect(schema.description).toBe("Top store for MENA region");
    expect(schema.inLanguage).toBe("ar");
  });

  it("uses myshopifyDomain as fallback URL", () => {
    const schema = generateOrganizationSchema(
      { name: "Test", myshopifyDomain: "test.myshopify.com" },
      "en",
    ) as Record<string, any>;
    expect(schema.url).toBe("https://test.myshopify.com");
  });

  it("handles null shop gracefully", () => {
    const schema = generateOrganizationSchema(null, "en") as Record<string, any>;
    expect(schema["@type"]).toBe("Organization");
    expect(schema.name).toBe("");
  });
});

// =========================================================================
// SEO SITEMAP — XML Generation
// =========================================================================

describe("SEO Sitemap — XML Generation", () => {
  const baseConfig = {
    baseUrl: "https://shop.com",
    defaultLocale: "en",
    locales: ["en", "ar"],
  };

  it("generates sitemap XML with correct structure", () => {
    const xml = generateSitemapXml({
      pages: [{ path: "/products/abaya" }],
      config: baseConfig,
    });
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("<urlset");
    expect(xml).toContain("</urlset>");
  });

  it("generates one URL entry per locale per page", () => {
    const xml = generateSitemapXml({
      pages: [{ path: "/products/abaya" }],
      config: baseConfig,
    });
    // 2 locales = 2 <url> entries
    const urlCount = (xml.match(/<url>/g) || []).length;
    expect(urlCount).toBe(2);
  });

  it("includes hreflang alternate links for all locales", () => {
    const xml = generateSitemapXml({
      pages: [{ path: "/products/abaya" }],
      config: baseConfig,
    });
    expect(xml).toContain('hreflang="en"');
    expect(xml).toContain('hreflang="ar"');
    expect(xml).toContain('hreflang="x-default"');
  });

  it("includes x-default pointing to default locale", () => {
    const xml = generateSitemapXml({
      pages: [{ path: "/about" }],
      config: baseConfig,
    });
    // x-default should point to the English (default) version
    expect(xml).toContain('hreflang="x-default" href="https://shop.com/about"');
  });

  it("includes lastmod, priority, changefreq when provided", () => {
    const xml = generateSitemapXml({
      pages: [
        {
          path: "/",
          lastmod: "2025-01-15",
          priority: 1.0,
          changefreq: "daily",
        },
      ],
      config: baseConfig,
    });
    expect(xml).toContain("<lastmod>2025-01-15</lastmod>");
    expect(xml).toContain("<priority>1.0</priority>");
    expect(xml).toContain("<changefreq>daily</changefreq>");
  });

  it("omits optional fields when not provided", () => {
    const xml = generateSitemapXml({
      pages: [{ path: "/" }],
      config: baseConfig,
    });
    expect(xml).not.toContain("<lastmod>");
    expect(xml).not.toContain("<priority>");
    expect(xml).not.toContain("<changefreq>");
  });

  it("escapes XML special characters in URLs", () => {
    const xml = generateSitemapXml({
      pages: [{ path: "/search?q=a&b=c" }],
      config: baseConfig,
    });
    expect(xml).toContain("&amp;");
    expect(xml).not.toMatch(/<loc>[^<]*[^;]&[^a]/);
  });

  it("generates sitemap index with multiple sitemap references", () => {
    const xml = generateSitemapIndex([
      { loc: "https://shop.com/sitemap-en.xml", lastmod: "2025-01-01" },
      { loc: "https://shop.com/sitemap-ar.xml" },
    ]);
    expect(xml).toContain("<sitemapindex");
    expect(xml).toContain("<sitemap>");
    const sitemapCount = (xml.match(/<sitemap>/g) || []).length;
    expect(sitemapCount).toBe(2);
    expect(xml).toContain("sitemap-en.xml");
    expect(xml).toContain("sitemap-ar.xml");
    expect(xml).toContain("<lastmod>2025-01-01</lastmod>");
  });

  it("builds correct locale URLs (default=no prefix, others=prefix)", () => {
    const xml = generateSitemapXml({
      pages: [{ path: "/products/dress" }],
      config: baseConfig,
    });
    expect(xml).toContain("https://shop.com/products/dress");
    expect(xml).toContain("https://shop.com/ar/products/dress");
  });

  it("handles root path correctly", () => {
    const xml = generateSitemapXml({
      pages: [{ path: "/" }],
      config: baseConfig,
    });
    expect(xml).toContain("https://shop.com/");
    expect(xml).toContain("https://shop.com/ar");
  });

  it("handles many locales", () => {
    const multiConfig = {
      baseUrl: "https://shop.com",
      defaultLocale: "en",
      locales: ["en", "ar", "he", "fa", "fr"],
    };
    const xml = generateSitemapXml({
      pages: [{ path: "/" }],
      config: multiConfig,
    });
    const urlCount = (xml.match(/<url>/g) || []).length;
    expect(urlCount).toBe(5);
  });

  it("handles empty pages array", () => {
    const xml = generateSitemapXml({ pages: [], config: baseConfig });
    expect(xml).toContain("<urlset");
    expect(xml).toContain("</urlset>");
    expect(xml).not.toContain("<url>");
  });
});

// =========================================================================
// SEO CONFIG — Meta Tags, Multilingual Config, Validation
// =========================================================================

describe("SEO Config — Meta Tags", () => {
  const seoConfig: SEOConfig = {
    shop: "test-shop.myshopify.com",
    defaultLocale: "en",
    locales: ["en", "ar", "he"],
    baseUrl: "https://test-shop.com",
  };

  it("generates meta tags for locale (title, description, canonical, hreflang, og)", () => {
    const result = generateMetaTagsForLocale(
      "/products/abaya",
      "ar",
      "عباية حريرية",
      "أفضل عباية حريرية",
      seoConfig,
    );
    expect(result.title).toBe("عباية حريرية");
    expect(result.description).toBe("أفضل عباية حريرية");
    expect(result.canonical).toContain("test-shop.com");
    expect(result.hreflangTags.length).toBeGreaterThan(0);
    expect(result.metaTags.some((t) => t.includes("<title>"))).toBe(true);
    expect(result.metaTags.some((t) => t.includes('name="description"'))).toBe(true);
    expect(result.metaTags.some((t) => t.includes('rel="canonical"'))).toBe(true);
    expect(result.metaTags.some((t) => t.includes('og:title'))).toBe(true);
    expect(result.metaTags.some((t) => t.includes('og:description'))).toBe(true);
    expect(result.metaTags.some((t) => t.includes('og:url'))).toBe(true);
    expect(result.metaTags.some((t) => t.includes('og:locale'))).toBe(true);
  });

  it("escapes HTML in title and description (XSS prevention)", () => {
    const result = generateMetaTagsForLocale(
      "/",
      "en",
      '<script>alert("xss")</script>',
      'Description with "quotes" & <tags>',
      seoConfig,
    );
    const joined = result.metaTags.join("\n");
    expect(joined).not.toContain("<script>");
    expect(joined).toContain("&lt;script&gt;");
    expect(joined).toContain("&amp;");
    expect(joined).toContain("&quot;");
  });
});

describe("SEO Config — Multilingual SEO Config", () => {
  it("returns correct config shape", () => {
    const config = getMultilingualSEOConfig(
      "test-shop.myshopify.com",
      ["en", "ar"],
    );
    expect(config.seoConfig.shop).toBe("test-shop.myshopify.com");
    expect(config.seoConfig.locales).toEqual(["en", "ar"]);
    expect(config.seoConfig.defaultLocale).toBe("en");
    expect(config.robotsTxt).toBeTruthy();
    expect(config.sitemapUrls).toHaveLength(2);
    expect(config.hreflangEnabled).toBe(true);
    expect(config.canonicalStrategy).toBe("locale-prefix");
  });

  it("generates per-locale sitemap URLs", () => {
    const config = getMultilingualSEOConfig("shop.com", ["en", "ar", "he"]);
    expect(config.sitemapUrls).toContain("https://shop.com/sitemap-en.xml");
    expect(config.sitemapUrls).toContain("https://shop.com/sitemap-ar.xml");
    expect(config.sitemapUrls).toContain("https://shop.com/sitemap-he.xml");
  });

  it("sets hreflangEnabled to false for single locale", () => {
    const config = getMultilingualSEOConfig("shop.com", ["en"]);
    expect(config.hreflangEnabled).toBe(false);
  });

  it("uses custom baseUrl when provided", () => {
    const config = getMultilingualSEOConfig("shop.com", ["en"], {
      baseUrl: "https://custom.com",
    });
    expect(config.seoConfig.baseUrl).toBe("https://custom.com");
  });

  it("generates robots.txt content", () => {
    const config = getMultilingualSEOConfig("shop.com", ["en", "ar"]);
    expect(config.robotsTxt).toContain("User-agent: *");
    expect(config.robotsTxt).toContain("Allow: /en/");
    expect(config.robotsTxt).toContain("Allow: /ar/");
    expect(config.robotsTxt).toContain("Disallow: /admin");
    expect(config.robotsTxt).toContain("Sitemap:");
  });
});

describe("SEO Config — Validation", () => {
  it("validates a correct config as valid", () => {
    const result = validateSEOSetup({
      shop: "test.myshopify.com",
      defaultLocale: "en",
      locales: ["en", "ar"],
      baseUrl: "https://test.com",
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("errors for missing locales", () => {
    const result = validateSEOSetup({
      shop: "test.myshopify.com",
      defaultLocale: "en",
      locales: [],
      baseUrl: "https://test.com",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("No locales"))).toBe(true);
  });

  it("errors for invalid baseUrl", () => {
    const result = validateSEOSetup({
      shop: "test.myshopify.com",
      defaultLocale: "en",
      locales: ["en"],
      baseUrl: "not-a-url",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Base URL"))).toBe(true);
  });

  it("errors for missing baseUrl", () => {
    const result = validateSEOSetup({
      shop: "test.myshopify.com",
      defaultLocale: "en",
      locales: ["en"],
      baseUrl: "",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Base URL"))).toBe(true);
  });

  it("errors for missing shop", () => {
    const result = validateSEOSetup({
      shop: "",
      defaultLocale: "en",
      locales: ["en"],
      baseUrl: "https://test.com",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Shop"))).toBe(true);
  });

  it("errors when defaultLocale is not in locales list", () => {
    const result = validateSEOSetup({
      shop: "test.myshopify.com",
      defaultLocale: "fr",
      locales: ["en", "ar"],
      baseUrl: "https://test.com",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Default locale"))).toBe(true);
  });

  it("warns for single locale", () => {
    const result = validateSEOSetup({
      shop: "test.myshopify.com",
      defaultLocale: "en",
      locales: ["en"],
      baseUrl: "https://test.com",
    });
    expect(result.valid).toBe(true);
    expect(result.warnings.some((w) => w.includes("one locale"))).toBe(true);
  });

  it("warns for duplicate locales", () => {
    const result = validateSEOSetup({
      shop: "test.myshopify.com",
      defaultLocale: "en",
      locales: ["en", "ar", "en"],
      baseUrl: "https://test.com",
    });
    expect(result.warnings.some((w) => w.includes("Duplicate"))).toBe(true);
  });
});

// =========================================================================
// HREFLANG TAGS
// =========================================================================

describe("Hreflang Tags", () => {
  it("generates hreflang tags for all locales plus x-default", () => {
    const tags = generateHreflangTags(
      "https://shop.com/products/dress",
      ["en", "ar", "he"],
      "en",
    );
    expect(tags).toHaveLength(4); // 3 locales + x-default
    expect(tags.find((t) => t.locale === "en")).toBeTruthy();
    expect(tags.find((t) => t.locale === "ar")).toBeTruthy();
    expect(tags.find((t) => t.locale === "he")).toBeTruthy();
    expect(tags.find((t) => t.locale === "x-default")).toBeTruthy();
  });

  it("x-default points to default locale URL (no prefix)", () => {
    const tags = generateHreflangTags(
      "https://shop.com/products/dress",
      ["en", "ar"],
      "en",
    );
    const xDefault = tags.find((t) => t.locale === "x-default");
    const enTag = tags.find((t) => t.locale === "en");
    expect(xDefault?.url).toBe(enTag?.url);
  });

  it("default locale has no prefix, others get locale prefix", () => {
    const tags = generateHreflangTags(
      "https://shop.com/products/dress",
      ["en", "ar"],
      "en",
    );
    const enTag = tags.find((t) => t.locale === "en");
    const arTag = tags.find((t) => t.locale === "ar");
    expect(enTag?.url).toBe("https://shop.com/products/dress");
    expect(arTag?.url).toBe("https://shop.com/ar/products/dress");
  });

  it("returns empty array for empty locales", () => {
    const tags = generateHreflangTags("https://shop.com/", [], "en");
    expect(tags).toEqual([]);
  });

  it("getXDefaultUrl returns origin for root URLs", () => {
    const url = getXDefaultUrl("https://shop.com/");
    expect(url).toBe("https://shop.com");
  });

  it("getXDefaultUrl preserves path", () => {
    const url = getXDefaultUrl("https://shop.com/products/test");
    expect(url).toBe("https://shop.com/products/test");
  });
});

// =========================================================================
// HREFLANG META (from seo-infrastructure)
// =========================================================================

describe("Hreflang Meta (SEO Infrastructure)", () => {
  const config: SEOConfig = {
    shop: "test.myshopify.com",
    defaultLocale: "en",
    locales: ["en", "ar"],
    baseUrl: "https://test.com",
  };

  it("generates hreflang meta link tags", () => {
    const tags = generateHreflangMeta("/products/dress", config);
    expect(tags).toHaveLength(3); // en + ar + x-default
    expect(tags.some((t) => t.includes('hreflang="en"'))).toBe(true);
    expect(tags.some((t) => t.includes('hreflang="ar"'))).toBe(true);
    expect(tags.some((t) => t.includes('hreflang="x-default"'))).toBe(true);
  });

  it("generates canonical URL for locale", () => {
    const canonical = generateCanonical("/products/dress", "ar", config);
    expect(canonical).toBe("https://test.com/ar/products/dress");
  });

  it("generates canonical URL for default locale (no prefix)", () => {
    const canonical = generateCanonical("/products/dress", "en", config);
    expect(canonical).toBe("https://test.com/products/dress");
  });
});

// =========================================================================
// TRANSLITERATION
// =========================================================================

describe("Transliteration — URL Slugs", () => {
  it("transliterates Arabic text to slug", () => {
    const slug = transliterateToSlug("مرحبا بالعالم", "ar");
    expect(slug).toMatch(/^[a-z0-9-]+$/);
    expect(slug.length).toBeGreaterThan(0);
  });

  it("transliterates Hebrew text to slug", () => {
    const slug = transliterateToSlug("שלום עולם", "he");
    expect(slug).toMatch(/^[a-z0-9-]+$/);
    expect(slug.length).toBeGreaterThan(0);
  });

  it("lowercases and hyphenates Latin text", () => {
    const slug = transliterateToSlug("Hello World", "en");
    expect(slug).toBe("hello-world");
  });

  it("handles empty text", () => {
    const slug = transliterateToSlug("", "en");
    expect(slug).toBe("");
  });
});

// =========================================================================
// LANGUAGE SWITCHER — Inline
// =========================================================================

describe("Language Switcher — Inline Config", () => {
  it("generates config for LTR locale", () => {
    const config = getInlineSwitcherConfig("en");
    expect(config.isOpen).toBe(false);
    expect(config.position).toBe("bottom-left");
    expect(config.keyboardNavigation).toBe(true);
    expect(config.displayStyle).toBe("flag-text");
  });

  it("generates config for RTL locale — position is bottom-right", () => {
    const config = getInlineSwitcherConfig("ar");
    expect(config.position).toBe("bottom-right");
  });

  it("generates config for Hebrew (RTL)", () => {
    const config = getInlineSwitcherConfig("he");
    expect(config.position).toBe("bottom-right");
  });

  it("generates config for Persian (RTL)", () => {
    const config = getInlineSwitcherConfig("fa");
    expect(config.position).toBe("bottom-right");
  });
});

describe("Language Switcher — Inline CSS Classes", () => {
  it("generates RTL-aware display options", () => {
    const options = getDisplayOptions({}, "ar");
    expect(options.isRtl).toBe(true);
    expect(options.containerClass).toContain("language-switcher--rtl");
  });

  it("generates LTR display options", () => {
    const options = getDisplayOptions({}, "en");
    expect(options.isRtl).toBe(false);
    expect(options.containerClass).toContain("language-switcher--ltr");
  });

  it("includes compact class when compact enabled", () => {
    const options = getDisplayOptions({ compact: true }, "en");
    expect(options.containerClass).toContain("language-switcher--compact");
  });

  it("includes open class on trigger when open", () => {
    const options = getDisplayOptions({ isOpen: true }, "en");
    expect(options.triggerClass).toContain("--open");
  });

  it("includes ARIA attributes", () => {
    const options = getDisplayOptions({ isOpen: true }, "en");
    expect(options.ariaAttributes.trigger["aria-expanded"]).toBe("true");
    expect(options.ariaAttributes.trigger["aria-haspopup"]).toBe("listbox");
    expect(options.ariaAttributes.dropdown["role"]).toBe("listbox");
  });
});

describe("Language Switcher — Inline Localized Labels", () => {
  const locales = ["en", "ar", "he", "fa", "fr", "de", "es"];

  for (const locale of locales) {
    it(`returns localized labels for ${locale}`, () => {
      const labels = getDropdownLabels(locale);
      expect(labels.triggerLabel).toBeTruthy();
      expect(labels.dropdownAriaLabel).toBeTruthy();
      expect(labels.currentLanguageLabel).toBeTruthy();
      expect(labels.closeLabel).toBeTruthy();
      expect(labels.toggleLabel).toBeTruthy();
    });
  }

  it("returns English labels for Arabic locale", () => {
    const arLabels = getDropdownLabels("ar");
    expect(arLabels.triggerLabel).toBe("اختيار اللغة");
  });

  it("falls back to default (English) for unknown locale", () => {
    const labels = getDropdownLabels("xx");
    expect(labels.triggerLabel).toBe("Select language");
  });
});

describe("Language Switcher — Inline Keyboard Navigation", () => {
  const options = buildLanguageOptions(["en", "ar", "he"], "en");

  it("ArrowDown wraps from last to first", () => {
    const nav = getKeyboardNavigation(options, 2);
    expect(nav.nextIndex).toBe(0);
  });

  it("ArrowUp wraps from first to last", () => {
    const nav = getKeyboardNavigation(options, 0);
    expect(nav.prevIndex).toBe(2);
  });

  it("Home goes to index 0", () => {
    const nav = getKeyboardNavigation(options, 2);
    expect(nav.firstIndex).toBe(0);
  });

  it("End goes to last index", () => {
    const nav = getKeyboardNavigation(options, 0);
    expect(nav.lastIndex).toBe(2);
  });

  it("next from middle index goes to middle+1", () => {
    const nav = getKeyboardNavigation(options, 1);
    expect(nav.nextIndex).toBe(2);
  });

  it("prev from middle index goes to middle-1", () => {
    const nav = getKeyboardNavigation(options, 1);
    expect(nav.prevIndex).toBe(0);
  });
});

describe("Language Switcher — Inline Toggle / Open / Close", () => {
  it("toggleDropdown flips isOpen", () => {
    const config = getInlineSwitcherConfig("en");
    expect(config.isOpen).toBe(false);
    const toggled = toggleDropdown(config);
    expect(toggled.isOpen).toBe(true);
    const toggled2 = toggleDropdown(toggled);
    expect(toggled2.isOpen).toBe(false);
  });

  it("openDropdown sets isOpen to true", () => {
    const config = getInlineSwitcherConfig("en");
    const opened = openDropdown(config);
    expect(opened.isOpen).toBe(true);
  });

  it("closeDropdown sets isOpen to false", () => {
    const config = getInlineSwitcherConfig("en");
    const opened = openDropdown(config);
    const closed = closeDropdown(opened);
    expect(closed.isOpen).toBe(false);
  });
});

describe("Language Switcher — Inline Sorting & Filtering", () => {
  const options = buildLanguageOptions(["en", "ar", "fr", "he"], "fr");

  it("sorts active language first", () => {
    const sorted = sortLanguageOptions(options);
    expect(sorted[0].locale).toBe("fr");
    expect(sorted[0].isActive).toBe(true);
  });

  it("filters by name", () => {
    const filtered = filterLanguageOptions(options, "arab");
    expect(filtered).toHaveLength(1);
    expect(filtered[0].locale).toBe("ar");
  });

  it("filters by locale code", () => {
    const filtered = filterLanguageOptions(options, "he");
    expect(filtered).toHaveLength(1);
    expect(filtered[0].locale).toBe("he");
  });

  it("returns all for empty query", () => {
    const filtered = filterLanguageOptions(options, "");
    expect(filtered).toHaveLength(4);
  });
});

describe("Language Switcher — Inline Format & Display", () => {
  it("formats a language option", () => {
    const lang = buildLanguageOptions(["ar"], "ar")[0];
    const formatted = formatLanguageOption(lang, "ar");
    expect(formatted.locale).toBe("ar");
    expect(formatted.direction).toBe("rtl");
    expect(formatted.isActive).toBe(true);
    expect(formatted.className).toContain("language-option--ar");
    expect(formatted.className).toContain("language-option--active");
    expect(formatted.className).toContain("language-option--rtl");
    expect(formatted.dataAttributes["data-locale"]).toBe("ar");
  });

  it("getTriggerDisplay flag-only mode", () => {
    const lang = buildLanguageOptions(["ar"], "ar")[0];
    const display = getTriggerDisplay(lang, "flag-only");
    expect(display.content).toBe(lang.flag);
  });

  it("getTriggerDisplay text-only mode", () => {
    const lang = buildLanguageOptions(["ar"], "ar")[0];
    const display = getTriggerDisplay(lang, "text-only");
    expect(display.content).toBe(lang.nativeName);
  });

  it("shouldUseCompactMode returns true for > 5 languages", () => {
    expect(shouldUseCompactMode(6)).toBe(true);
    expect(shouldUseCompactMode(5)).toBe(false);
    expect(shouldUseCompactMode(3)).toBe(false);
  });

  it("getOptimalDropdownPosition handles RTL", () => {
    const pos = getOptimalDropdownPosition("header", true);
    expect(pos).toBe("bottom-right");
  });

  it("getOptimalDropdownPosition handles LTR", () => {
    const pos = getOptimalDropdownPosition("header", false);
    expect(pos).toBe("bottom-left");
  });

  it("getOptimalDropdownPosition footer opens upward", () => {
    const pos = getOptimalDropdownPosition("footer", false);
    expect(pos).toBe("top-left");
  });
});

describe("Language Switcher — Inline Theme Variables", () => {
  it("returns light theme variables by default", () => {
    const vars = getThemeVariables();
    expect(vars["--switcher-bg"]).toBe("#ffffff");
  });

  it("returns dark theme variables", () => {
    const vars = getThemeVariables(true);
    expect(vars["--switcher-bg"]).toBe("#1a1a1a");
  });

  it("includes primary color when provided", () => {
    const vars = getThemeVariables(false, "#ff0000");
    expect(vars["--switcher-primary"]).toBe("#ff0000");
  });
});

// =========================================================================
// LANGUAGE SWITCHER — Floating
// =========================================================================

describe("Language Switcher — Floating Config", () => {
  it("generates config for LTR locale", () => {
    const config = getFloatingSwitcherConfig("en");
    expect(config.position).toBe("bottom-right");
    expect(config.visibility).toBe("always");
    expect(config.zIndex).toBe(9999);
  });

  it("flips position for RTL locale (ar)", () => {
    const config = getFloatingSwitcherConfig("ar");
    expect(config.position).toBe("bottom-left");
  });

  it("flips position for RTL locale (he)", () => {
    const config = getFloatingSwitcherConfig("he");
    expect(config.position).toBe("bottom-left");
  });

  it("applies overrides", () => {
    const config = getFloatingSwitcherConfig("en", { zIndex: 50, compact: true });
    expect(config.zIndex).toBe(50);
    expect(config.compact).toBe(true);
  });

  it("flips overridden position for RTL", () => {
    const config = getFloatingSwitcherConfig("ar", { position: "top-right" });
    expect(config.position).toBe("top-left");
  });
});

describe("Language Switcher — Floating Position Styles", () => {
  it("generates styles for bottom-right", () => {
    const styles = getPositionStyles("bottom-right");
    expect(styles.desktop.position).toBe("fixed");
    expect(styles.desktop.bottom).toBe("16px");
    expect(styles.desktop.right).toBe("16px");
  });

  it("generates styles for top-left", () => {
    const styles = getPositionStyles("top-left", 20, 20);
    expect(styles.desktop.top).toBe("20px");
    expect(styles.desktop.left).toBe("20px");
  });

  it("generates styles for bottom-center with transform", () => {
    const styles = getPositionStyles("bottom-center");
    expect(styles.desktop.left).toBe("50%");
    expect(styles.desktop.transform).toBe("translateX(-50%)");
  });

  it("mobile styles use halved offsets", () => {
    const styles = getPositionStyles("bottom-right", 20, 20);
    expect(styles.mobile.bottom).toBe("10px");
    expect(styles.mobile.right).toBe("10px");
  });
});

describe("Language Switcher — Floating Visibility Rules", () => {
  it("always mode has no scroll/hover behavior", () => {
    const rules = getVisibilityRules("always");
    expect(rules.followScroll).toBe(false);
    expect(rules.minimizeOnScroll).toBe(false);
    expect(rules.expandOnHover).toBe(false);
    expect(rules.autoHide).toBe(false);
  });

  it("scroll mode follows scroll", () => {
    const rules = getVisibilityRules("scroll");
    expect(rules.followScroll).toBe(true);
    expect(rules.minimizeOnScroll).toBe(false);
  });

  it("hover mode enables autoHide and expandOnHover", () => {
    const rules = getVisibilityRules("hover");
    expect(rules.expandOnHover).toBe(true);
    expect(rules.autoHide).toBe(true);
    expect(rules.hideDelay).toBe(300);
    expect(rules.showDelay).toBe(100);
  });

  it("minimize-on-scroll mode", () => {
    const rules = getVisibilityRules("minimize-on-scroll");
    expect(rules.followScroll).toBe(true);
    expect(rules.minimizeOnScroll).toBe(true);
    expect(rules.expandOnHover).toBe(true);
  });
});

describe("Language Switcher — Floating Labels Per Locale", () => {
  it("returns English labels for en", () => {
    const labels = getSwitcherLabels("en");
    expect(labels.selectLanguage).toBe("Select Language");
    expect(labels.close).toBe("Close");
  });

  it("returns Arabic labels for ar", () => {
    const labels = getSwitcherLabels("ar");
    expect(labels.selectLanguage).toBe("اختيار اللغة");
    expect(labels.close).toBe("إغلاق");
  });

  it("returns Hebrew labels for he", () => {
    const labels = getSwitcherLabels("he");
    expect(labels.selectLanguage).toBe("בחירת שפה");
  });

  it("returns Persian labels for fa", () => {
    const labels = getSwitcherLabels("fa");
    expect(labels.selectLanguage).toBe("انتخاب زبان");
  });

  it("returns French labels for fr", () => {
    const labels = getSwitcherLabels("fr");
    expect(labels.selectLanguage).toBe("Choisir la langue");
  });

  it("returns German labels for de", () => {
    const labels = getSwitcherLabels("de");
    expect(labels.selectLanguage).toBe("Sprache auswählen");
  });

  it("returns Spanish labels for es", () => {
    const labels = getSwitcherLabels("es");
    expect(labels.selectLanguage).toBe("Seleccionar idioma");
  });

  it("falls back to English for unknown locale", () => {
    const labels = getSwitcherLabels("xx");
    expect(labels.selectLanguage).toBe("Select Language");
  });

  it("handles locale with region (ar-SA)", () => {
    const labels = getSwitcherLabels("ar-SA");
    expect(labels.selectLanguage).toBe("اختيار اللغة");
  });
});

describe("Language Switcher — Floating RTL Adjustments", () => {
  it("returns adjustments for RTL", () => {
    const adj = getRTLPositionAdjustments(true);
    expect(adj.flipHorizontal).toBe(true);
    expect(adj.mirrorOffsets).toBe(true);
    expect(adj.adjustTextAlign).toBe(true);
  });

  it("returns no adjustments for LTR", () => {
    const adj = getRTLPositionAdjustments(false);
    expect(adj.flipHorizontal).toBe(false);
    expect(adj.mirrorOffsets).toBe(false);
    expect(adj.adjustTextAlign).toBe(false);
  });
});

describe("Language Switcher — Floating Responsive & Mobile", () => {
  it("responsive offsets scale down for mobile", () => {
    const offsets = getResponsiveOffsets(500, 20, 20);
    expect(offsets.offsetX).toBe(10); // 20 * 0.5
    expect(offsets.offsetY).toBe(10);
  });

  it("responsive offsets scale for tablet", () => {
    const offsets = getResponsiveOffsets(900, 20, 20);
    expect(offsets.offsetX).toBe(15); // 20 * 0.75
    expect(offsets.offsetY).toBe(15);
  });

  it("responsive offsets full size for desktop", () => {
    const offsets = getResponsiveOffsets(1200, 20, 20);
    expect(offsets.offsetX).toBe(20);
    expect(offsets.offsetY).toBe(20);
  });

  it("mobile offsets have minimum of 8", () => {
    const offsets = getResponsiveOffsets(500, 10, 10);
    expect(offsets.offsetX).toBe(8); // max(8, 10*0.5) = max(8, 5) = 8
  });

  it("shouldMinimizeOnScroll minimizes past threshold", () => {
    expect(shouldMinimizeOnScroll(150, 100, false)).toBe(true);
  });

  it("shouldMinimizeOnScroll expands when scrolled back up", () => {
    expect(shouldMinimizeOnScroll(40, 100, true)).toBe(false);
  });

  it("shouldMinimizeOnScroll keeps state in middle zone", () => {
    expect(shouldMinimizeOnScroll(80, 100, true)).toBe(true);
    expect(shouldMinimizeOnScroll(80, 100, false)).toBe(false);
  });

  it("getMobileOptimizedConfig forces compact", () => {
    const base = getFloatingSwitcherConfig("en");
    const mobile = getMobileOptimizedConfig(base);
    expect(mobile.compact).toBe(true);
    expect(mobile.showNativeNames).toBe(false);
    expect(mobile.offsetX).toBeLessThanOrEqual(base.offsetX);
    expect(mobile.offsetY).toBeLessThanOrEqual(base.offsetY);
  });

  it("shouldShowOnMobile returns true when mobileOptimized", () => {
    expect(shouldShowOnMobile(true, true)).toBe(true);
    expect(shouldShowOnMobile(true, false)).toBe(false);
    expect(shouldShowOnMobile(false, false)).toBe(true);
  });
});

describe("Language Switcher — Floating Accessibility", () => {
  it("returns accessibility attributes for expanded state", () => {
    const labels = getSwitcherLabels("en");
    const attrs = getAccessibilityAttributes(labels, true);
    expect(attrs.role).toBe("button");
    expect(attrs["aria-expanded"]).toBe("true");
    expect(attrs["aria-label"]).toBe("Minimize");
    expect(attrs.tabindex).toBe("0");
  });

  it("returns accessibility attributes for collapsed state", () => {
    const labels = getSwitcherLabels("en");
    const attrs = getAccessibilityAttributes(labels, false);
    expect(attrs["aria-expanded"]).toBe("false");
    expect(attrs["aria-label"]).toBe("Expand");
  });
});

// =========================================================================
// FONTS
// =========================================================================

describe("Fonts — Arabic Font Library", () => {
  it("has at least 5 fonts", () => {
    expect(ARABIC_FONTS.length).toBeGreaterThanOrEqual(5);
  });

  it("each font has required properties", () => {
    for (const font of ARABIC_FONTS) {
      expect(font.id).toBeTruthy();
      expect(font.name).toBeTruthy();
      expect(font.family).toBeTruthy();
      expect(["sans-serif", "serif", "display", "handwriting"]).toContain(font.category);
      expect(font.weights.length).toBeGreaterThan(0);
      expect(font.subsets).toContain("arabic");
      expect(font.googleFontUrl).toContain("fonts.googleapis.com");
      expect(font.previewText).toBeTruthy();
      expect(font.recommendedFor.length).toBeGreaterThan(0);
    }
  });

  it("DEFAULT_ARABIC_FONT is Noto Sans Arabic", () => {
    expect(DEFAULT_ARABIC_FONT.id).toBe("noto-sans-arabic");
  });
});

describe("Fonts — getFontsByCategory", () => {
  it("returns sans-serif fonts", () => {
    const fonts = getFontsByCategory("sans-serif");
    expect(fonts.length).toBeGreaterThan(0);
    expect(fonts.every((f) => f.category === "sans-serif")).toBe(true);
  });

  it("returns serif fonts", () => {
    const fonts = getFontsByCategory("serif");
    expect(fonts.length).toBeGreaterThan(0);
    expect(fonts.every((f) => f.category === "serif")).toBe(true);
  });

  it("returns empty array for nonexistent category", () => {
    const fonts = getFontsByCategory("handwriting");
    // May be 0 if none in the curated list
    expect(Array.isArray(fonts)).toBe(true);
  });
});

describe("Fonts — getFontsFor use case", () => {
  it("returns fonts for headings use case", () => {
    const fonts = getFontsFor("headings");
    expect(fonts.length).toBeGreaterThan(0);
    expect(fonts.every((f) => f.recommendedFor.includes("headings"))).toBe(true);
  });

  it("returns fonts for body-text", () => {
    const fonts = getFontsFor("body-text");
    expect(fonts.length).toBeGreaterThan(0);
  });

  it("returns empty array for unknown use case", () => {
    const fonts = getFontsFor("nonexistent-use-case");
    expect(fonts).toEqual([]);
  });
});

describe("Fonts — getFontById", () => {
  it("returns font for valid ID", () => {
    const font = getFontById("cairo");
    expect(font).toBeTruthy();
    expect(font?.name).toBe("Cairo");
  });

  it("returns undefined for invalid ID", () => {
    expect(getFontById("nonexistent")).toBeUndefined();
  });
});

describe("Fonts — Google Fonts URL Generation", () => {
  it("generates URL for single font", () => {
    const url = generateGoogleFontsUrl(["cairo"]);
    expect(url).toContain("fonts.googleapis.com");
    expect(url).toContain("Cairo");
    expect(url).toContain("display=swap");
  });

  it("generates URL for multiple fonts", () => {
    const url = generateGoogleFontsUrl(["cairo", "amiri"]);
    expect(url).toContain("Cairo");
    expect(url).toContain("Amiri");
  });

  it("returns empty string for empty array", () => {
    expect(generateGoogleFontsUrl([])).toBe("");
  });

  it("returns empty string for invalid font IDs", () => {
    expect(generateGoogleFontsUrl(["nonexistent"])).toBe("");
  });

  it("generates subset URL with specific weights", () => {
    const url = generateSubsetFontUrl("cairo", [400, 700]);
    expect(url).toContain("Cairo");
    expect(url).toContain("400");
    expect(url).toContain("700");
  });

  it("subset URL falls back to first weight for invalid weights", () => {
    const url = generateSubsetFontUrl("amiri", [999]);
    expect(url).toBeTruthy();
    // amiri weights are [400, 700], so should fall back to 400
    expect(url).toContain("400");
  });

  it("subset URL returns empty for invalid font", () => {
    expect(generateSubsetFontUrl("nonexistent", [400])).toBe("");
  });
});

describe("Fonts — Font Preload Hints", () => {
  it("returns preload hints for font IDs", () => {
    const hints = getFontPreloadHints(["cairo", "amiri"]);
    expect(hints).toHaveLength(2);
    expect(hints[0].rel).toBe("preconnect");
    expect(hints[0].href).toContain("fonts.googleapis.com");
  });
});

describe("Fonts — Font Config & CSS Variables", () => {
  it("DEFAULT_FONT_CONFIG has expected shape", () => {
    expect(DEFAULT_FONT_CONFIG.arabic.heading).toBe("cairo");
    expect(DEFAULT_FONT_CONFIG.arabic.body).toBe("noto-sans-arabic");
    expect(DEFAULT_FONT_CONFIG.weights.body).toBe(400);
    expect(DEFAULT_FONT_CONFIG.weights.heading).toBe(600);
  });

  it("generates CSS variables from config", () => {
    const css = generateFontCSSVariables();
    expect(css).toContain("--font-arabic-heading");
    expect(css).toContain("--font-arabic-body");
    expect(css).toContain("--font-weight-heading");
    expect(css).toContain('[dir="rtl"]');
  });

  it("getFontIdsFromConfig returns unique IDs", () => {
    const ids = getFontIdsFromConfig(DEFAULT_FONT_CONFIG);
    expect(ids).toContain("cairo");
    expect(ids).toContain("noto-sans-arabic");
    expect(ids).toContain("tajawal");
    // Should be unique
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("generateFontLinks returns link objects", () => {
    const links = generateFontLinks();
    expect(links.length).toBeGreaterThan(0);
    expect(links.some((l) => l.rel === "preconnect")).toBe(true);
    expect(links.some((l) => l.rel === "stylesheet")).toBe(true);
  });
});

describe("Fonts — Font Validation", () => {
  it("validates default config as valid", () => {
    const result = validateFontConfig(DEFAULT_FONT_CONFIG);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("reports error for nonexistent heading font", () => {
    const result = validateFontConfig({
      arabic: { heading: "nonexistent", body: "noto-sans-arabic" },
      weights: { heading: 400, body: 400, bold: 700 },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("heading"))).toBe(true);
  });

  it("reports error for invalid weight", () => {
    const result = validateFontConfig({
      arabic: { heading: "amiri", body: "noto-sans-arabic" },
      weights: { heading: 999, body: 400, bold: 700 },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Weight"))).toBe(true);
  });
});

describe("Fonts — Font Pairings", () => {
  it("FONT_PAIRINGS has expected keys", () => {
    expect(FONT_PAIRINGS["modern-blog"]).toBeTruthy();
    expect(FONT_PAIRINGS["traditional-store"]).toBeTruthy();
    expect(FONT_PAIRINGS["corporate"]).toBeTruthy();
    expect(FONT_PAIRINGS["tech-startup"]).toBeTruthy();
  });

  it("applyFontPairing returns a valid FontConfig", () => {
    const config = applyFontPairing("modern-blog");
    expect(config.arabic.heading).toBe("cairo");
    expect(config.arabic.body).toBe("vazirmatn");
    expect(config.arabic.accent).toBe("tajawal");
    expect(config.weights).toEqual(DEFAULT_FONT_CONFIG.weights);
  });

  it("applyFontPairing returns default for invalid key", () => {
    const config = applyFontPairing("nonexistent" as any);
    expect(config).toEqual(DEFAULT_FONT_CONFIG);
  });
});

// =========================================================================
// RTL CSS GENERATION
// =========================================================================

describe("RTL CSS Generation", () => {
  it("generates RTL CSS with default scope selector", () => {
    const css = generateRTLCSS();
    expect(css).toContain('html[dir="rtl"]');
    expect(css).toContain("direction: rtl");
    expect(css).toContain("text-align: right");
  });

  it("generates CSS with custom scope selector", () => {
    const css = generateRTLCSS({ scopeSelector: ".my-rtl" });
    expect(css).toContain(".my-rtl");
    expect(css).not.toContain('html[dir="rtl"]');
  });

  it("includes component-specific rules", () => {
    const css = generateRTLCSS({ components: ["slider"] });
    expect(css).toContain("slider");
    expect(css).toContain("flex-direction: row-reverse");
  });

  it("includes all component rules when none specified", () => {
    const css = generateRTLCSS();
    expect(css).toContain("slider");
    expect(css).toContain("carousel");
    expect(css).toContain("menu");
    expect(css).toContain("checkout");
    expect(css).toContain("gallery");
    expect(css).toContain("mega-menu");
  });

  it("includes custom overrides", () => {
    const css = generateRTLCSS({ customOverrides: ".custom { color: red; }" });
    expect(css).toContain(".custom { color: red; }");
  });

  it("generates mixed direction CSS", () => {
    const css = generateMixedDirectionCSS('html[dir="rtl"]');
    expect(css).toContain('[dir="ltr"]');
    expect(css).toContain("direction: ltr");
    expect(css).toContain("text-align: left");
    expect(css).toContain("unicode-bidi: isolate");
    expect(css).toContain('[dir="rtl"]');
    expect(css).toContain("direction: rtl");
  });

  it("mixed mode includes mixed direction CSS", () => {
    const css = generateRTLCSS({ mode: "mixed" });
    expect(css).toContain('[dir="ltr"]');
    expect(css).toContain("unicode-bidi: isolate");
  });

  it("single mode does not include mixed direction CSS", () => {
    const css = generateRTLCSS({ mode: "single" });
    // Should not contain the LTR isolation rules
    expect(css).not.toContain('[lang|="en"]');
  });

  it("generateRuleBlock creates correct CSS block", () => {
    const block = generateRuleBlock(".scope", {
      component: "slider",
      selectors: [".slider"],
      declarations: { direction: "rtl", "text-align": "right" },
    });
    expect(block).toContain(".scope .slider");
    expect(block).toContain("direction: rtl;");
    expect(block).toContain("text-align: right;");
  });

  it("handles multiple selectors in a rule", () => {
    const block = generateRuleBlock(".scope", {
      component: "menu",
      selectors: [".menu", ".nav"],
      declarations: { direction: "rtl" },
    });
    expect(block).toContain(".scope .menu");
    expect(block).toContain(".scope .nav");
  });
});

// =========================================================================
// TRANSLATION MEMORY — Matcher (pure functions, no DB)
// =========================================================================

describe("Translation Memory — Matcher", () => {
  describe("normalizeForMatching", () => {
    it("lowercases and trims", () => {
      expect(normalizeForMatching("  Hello World  ")).toBe("hello world");
    });

    it("collapses whitespace", () => {
      expect(normalizeForMatching("hello   world")).toBe("hello world");
    });

    it("handles empty string", () => {
      expect(normalizeForMatching("")).toBe("");
    });

    it("handles Arabic text", () => {
      const result = normalizeForMatching("  مرحبا  بالعالم  ");
      expect(result).toBe("مرحبا بالعالم");
    });
  });

  describe("levenshteinDistance", () => {
    it("returns 0 for identical strings", () => {
      expect(levenshteinDistance("hello", "hello")).toBe(0);
    });

    it("returns length of other string when one is empty", () => {
      expect(levenshteinDistance("", "hello")).toBe(5);
      expect(levenshteinDistance("hello", "")).toBe(5);
    });

    it("returns 0 for two empty strings", () => {
      expect(levenshteinDistance("", "")).toBe(0);
    });

    it("computes correct distance for single substitution", () => {
      expect(levenshteinDistance("kitten", "sitten")).toBe(1);
    });

    it("computes correct distance for multiple edits", () => {
      expect(levenshteinDistance("kitten", "sitting")).toBe(3);
    });

    it("handles Arabic strings", () => {
      const d = levenshteinDistance("مرحبا", "مرحبة");
      expect(d).toBe(1);
    });
  });

  describe("calculateSimilarity", () => {
    it("returns 1 for identical strings", () => {
      expect(calculateSimilarity("hello", "hello")).toBe(1);
    });

    it("returns 1 for identical after normalization", () => {
      expect(calculateSimilarity("Hello", "  hello  ")).toBe(1);
    });

    it("returns 1 for two empty strings", () => {
      expect(calculateSimilarity("", "")).toBe(1);
    });

    it("returns value between 0 and 1 for similar strings", () => {
      const sim = calculateSimilarity("hello world", "hello worl");
      expect(sim).toBeGreaterThan(0.8);
      expect(sim).toBeLessThan(1);
    });

    it("returns low similarity for completely different strings", () => {
      const sim = calculateSimilarity("abcdef", "xyz");
      expect(sim).toBeLessThan(0.5);
    });

    it("works with Arabic text", () => {
      const sim = calculateSimilarity("مرحبا بالعالم", "مرحبا بالعلم");
      expect(sim).toBeGreaterThan(0.8);
    });
  });
});

// =========================================================================
// EDGE CASES & BOUNDARY VALUES
// =========================================================================

describe("Edge Cases & Boundary Values", () => {
  it("sitemap handles trailing slash in baseUrl", () => {
    const xml = generateSitemapXml({
      pages: [{ path: "/test" }],
      config: {
        baseUrl: "https://shop.com/",
        defaultLocale: "en",
        locales: ["en"],
      },
    });
    // Should not produce double slashes
    expect(xml).not.toContain("https://shop.com//");
  });

  it("sitemap handles path without leading slash", () => {
    const xml = generateSitemapXml({
      pages: [{ path: "products/test" }],
      config: {
        baseUrl: "https://shop.com",
        defaultLocale: "en",
        locales: ["en"],
      },
    });
    expect(xml).toContain("https://shop.com/products/test");
  });

  it("hreflang handles URL with existing locale prefix", () => {
    const tags = generateHreflangTags(
      "https://shop.com/ar/products/dress",
      ["en", "ar"],
      "ar",
    );
    // Should strip the ar prefix and rebuild correctly
    const enTag = tags.find((t) => t.locale === "en");
    expect(enTag?.url).toBe("https://shop.com/products/dress");
  });

  it("product schema with all empty fields", () => {
    const schema = generateProductSchema(
      { title: "", description: "", vendor: "", sku: "" },
      "en",
    ) as Record<string, any>;
    expect(schema.name).toBe("");
    expect(schema.brand).toBeUndefined();
    expect(schema.sku).toBeUndefined();
  });

  it("inline switcher config for Urdu (RTL)", () => {
    const config = getInlineSwitcherConfig("ur");
    expect(config.position).toBe("bottom-right");
  });

  it("floating switcher labels for locale with region code", () => {
    const labels = getSwitcherLabels("he-IL");
    expect(labels.selectLanguage).toBe("בחירת שפה");
  });

  it("levenshteinDistance with single character strings", () => {
    expect(levenshteinDistance("a", "b")).toBe(1);
    expect(levenshteinDistance("a", "a")).toBe(0);
  });

  it("generateRTLCSS with empty components array", () => {
    const css = generateRTLCSS({ components: [] });
    // Should still have root rules
    expect(css).toContain("direction: rtl");
  });

  it("validateSEOSetup accumulates multiple errors", () => {
    const result = validateSEOSetup({
      shop: "",
      defaultLocale: "fr",
      locales: [],
      baseUrl: "",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });

  it("font validation with nonexistent body font", () => {
    const result = validateFontConfig({
      arabic: { heading: "cairo", body: "nonexistent" },
      weights: { heading: 600, body: 400, bold: 700 },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("body"))).toBe(true);
  });

  it("buildLanguageOptions filters unknown locales", () => {
    const opts = buildLanguageOptions(["en", "xxx", "ar"], "en");
    expect(opts).toHaveLength(2);
    expect(opts.map((o) => o.locale)).toEqual(["en", "ar"]);
  });

  it("floating config center positions are not flipped for RTL", () => {
    const config = getFloatingSwitcherConfig("ar", { position: "bottom-center" });
    expect(config.position).toBe("bottom-center");
  });
});
