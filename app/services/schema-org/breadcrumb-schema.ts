/**
 * Breadcrumb Schema Translation (T0075)
 *
 * Translate breadcrumb schema for navigation rich snippets.
 * Features:
 * - Breadcrumb items translated
 * - Collection names in breadcrumbs
 * - Product names in breadcrumbs
 * - Valid schema markup
 */

import type { SupportedSchemaLocale } from "./product-schema";

export interface BreadcrumbItem {
  /** Display name for the breadcrumb (translated) */
  name: string;
  /** URL for the breadcrumb item */
  url: string;
  /** Optional item identifier */
  item?: string;
  /** Optional item type (e.g., "Collection", "Product", "Page") */
  type?: string;
}

export interface BreadcrumbSchemaConfig {
  /** Whether to include the home page as the first item */
  includeHome?: boolean;
  /** Custom home page label */
  homeLabel?: string;
  /** Home page URL */
  homeUrl?: string;
  /** Whether to include the current page as the last item */
  includeCurrentPage?: boolean;
}

export interface GeneratedBreadcrumbSchema {
  /** The JSON-LD schema object */
  jsonLd: Record<string, unknown>;
  /** HTML script tag with JSON-LD */
  html: string;
  /** Target locale */
  locale: SupportedSchemaLocale;
  /** Text direction (rtl/ltr) */
  direction: "rtl" | "ltr";
  /** Number of breadcrumb items */
  itemCount: number;
  /** Schema validation status */
  isValid: boolean;
  /** Validation errors if any */
  validationErrors: string[];
}

// Translations for common breadcrumb labels
const BREADCRUMB_TRANSLATIONS: Record<SupportedSchemaLocale, { home: string }> = {
  ar: {
    home: "الرئيسية",
  },
  he: {
    home: "דף הבית",
  },
  en: {
    home: "Home",
  },
};

// Default home labels by locale
function getHomeLabel(locale: SupportedSchemaLocale): string {
  return BREADCRUMB_TRANSLATIONS[locale]?.home || BREADCRUMB_TRANSLATIONS.en.home;
}

/**
 * Generate a BreadcrumbList JSON-LD schema
 * @param items - Array of breadcrumb items
 * @param locale - The target locale
 * @param config - Optional configuration
 * @returns Generated breadcrumb schema
 */
export function generateBreadcrumbSchema(
  items: BreadcrumbItem[],
  locale: SupportedSchemaLocale,
  config?: BreadcrumbSchemaConfig,
): GeneratedBreadcrumbSchema {
  const direction = locale === "ar" || locale === "he" ? "rtl" : "ltr";
  const finalConfig: Required<BreadcrumbSchemaConfig> = {
    includeHome: true,
    homeLabel: getHomeLabel(locale),
    homeUrl: "/",
    includeCurrentPage: true,
    ...config,
  };

  // Build the breadcrumb items list
  let breadcrumbItems: BreadcrumbItem[] = [...items];

  // Add home page if requested and not already present
  if (finalConfig.includeHome) {
    const hasHome = breadcrumbItems.some(
      item => item.url === finalConfig.homeUrl || item.url === "/"
    );
    if (!hasHome) {
      breadcrumbItems.unshift({
        name: finalConfig.homeLabel,
        url: finalConfig.homeUrl,
        type: "WebPage",
      });
    }
  }

  // Ensure current page is included
  if (!finalConfig.includeCurrentPage && breadcrumbItems.length > 0) {
    breadcrumbItems = breadcrumbItems.slice(0, -1);
  }

  // Build schema item list elements
  const itemListElement = breadcrumbItems.map((item, index) => {
    const element: Record<string, unknown> = {
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
    };

    // Add item URL with proper Schema.org structure
    if (item.url) {
      element.item = {
        "@type": item.type || "WebPage",
        "@id": item.url,
        name: item.name,
        url: item.url,
      };
    }

    // Add custom item identifier if provided
    if (item.item) {
      (element.item as Record<string, unknown>)["@id"] = item.item;
    }

    return element;
  });

  // Build the complete schema
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    inLanguage: locale,
    itemListElement,
  };

  // Validate the schema
  const validation = validateBreadcrumbSchema(jsonLd);

  // Generate HTML
  const html = wrapBreadcrumbJsonLd(jsonLd);

  return {
    jsonLd,
    html,
    locale,
    direction,
    itemCount: breadcrumbItems.length,
    isValid: validation.valid,
    validationErrors: validation.errors,
  };
}

/**
 * Generate a product breadcrumb schema with collection and product names
 * @param productName - The translated product name
 * @param productUrl - The product URL
 * @param collectionName - Optional collection name (translated)
 * @param collectionUrl - Optional collection URL
 * @param locale - The target locale
 * @param config - Optional configuration
 * @returns Generated breadcrumb schema
 */
export function generateProductBreadcrumbSchema(
  productName: string,
  productUrl: string,
  collectionName?: string,
  collectionUrl?: string,
  locale: SupportedSchemaLocale = "en",
  config?: BreadcrumbSchemaConfig,
): GeneratedBreadcrumbSchema {
  const items: BreadcrumbItem[] = [];

  // Add collection if provided
  if (collectionName && collectionUrl) {
    items.push({
      name: collectionName,
      url: collectionUrl,
      type: "CollectionPage",
    });
  }

  // Add product
  items.push({
    name: productName,
    url: productUrl,
    type: "Product",
  });

  return generateBreadcrumbSchema(items, locale, config);
}

/**
 * Generate a collection breadcrumb schema
 * @param collectionName - The translated collection name
 * @param collectionUrl - The collection URL
 * @param parentCollectionName - Optional parent collection name
 * @param parentCollectionUrl - Optional parent collection URL
 * @param locale - The target locale
 * @param config - Optional configuration
 * @returns Generated breadcrumb schema
 */
export function generateCollectionBreadcrumbSchema(
  collectionName: string,
  collectionUrl: string,
  parentCollectionName?: string,
  parentCollectionUrl?: string,
  locale: SupportedSchemaLocale = "en",
  config?: BreadcrumbSchemaConfig,
): GeneratedBreadcrumbSchema {
  const items: BreadcrumbItem[] = [];

  // Add parent collection if provided
  if (parentCollectionName && parentCollectionUrl) {
    items.push({
      name: parentCollectionName,
      url: parentCollectionUrl,
      type: "CollectionPage",
    });
  }

  // Add current collection
  items.push({
    name: collectionName,
    url: collectionUrl,
    type: "CollectionPage",
  });

  return generateBreadcrumbSchema(items, locale, config);
}

/**
 * Generate a page breadcrumb schema
 * @param pageTitle - The translated page title
 * @param pageUrl - The page URL
 * @param parentPages - Optional array of parent pages
 * @param locale - The target locale
 * @param config - Optional configuration
 * @returns Generated breadcrumb schema
 */
export function generatePageBreadcrumbSchema(
  pageTitle: string,
  pageUrl: string,
  parentPages?: Array<{ name: string; url: string }>,
  locale: SupportedSchemaLocale = "en",
  config?: BreadcrumbSchemaConfig,
): GeneratedBreadcrumbSchema {
  const items: BreadcrumbItem[] = [];

  // Add parent pages if provided
  if (parentPages) {
    for (const parent of parentPages) {
      items.push({
        name: parent.name,
        url: parent.url,
        type: "WebPage",
      });
    }
  }

  // Add current page
  items.push({
    name: pageTitle,
    url: pageUrl,
    type: "WebPage",
  });

  return generateBreadcrumbSchema(items, locale, config);
}

/**
 * Wrap a breadcrumb schema object in a script tag with proper escaping
 * @param schema - The schema object to wrap
 * @returns HTML string with JSON-LD script tag
 */
export function wrapBreadcrumbJsonLd(schema: Record<string, unknown>): string {
  const json = JSON.stringify(schema, null, 2)
    .replace(/<\//g, "<\\/")
    .replace(/<!--/g, "<\\!--");

  return `<script type="application/ld+json">\n${json}\n</script>`;
}

/**
 * Validate a breadcrumb schema
 * @param schema - The schema to validate
 * @returns Validation result
 */
export function validateBreadcrumbSchema(schema: Record<string, unknown>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate @context
  if (!schema["@context"] || schema["@context"] !== "https://schema.org") {
    errors.push("Schema must have @context set to https://schema.org");
  }

  // Validate @type
  if (!schema["@type"] || schema["@type"] !== "BreadcrumbList") {
    errors.push("Schema must have @type set to BreadcrumbList");
  }

  // Validate itemListElement
  if (!schema.itemListElement || !Array.isArray(schema.itemListElement)) {
    errors.push("Schema must have itemListElement as an array");
  } else {
    const items = schema.itemListElement as Array<Record<string, unknown>>;
    
    if (items.length === 0) {
      errors.push("BreadcrumbList must have at least one item");
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Check @type
      if (!item["@type"] || item["@type"] !== "ListItem") {
        errors.push(`Item ${i + 1} must have @type set to ListItem`);
      }

      // Check position
      if (typeof item.position !== "number" || item.position < 1) {
        errors.push(`Item ${i + 1} must have a valid position number`);
      }

      // Check for sequential positions
      if (item.position !== i + 1) {
        errors.push(`Item ${i + 1} has incorrect position. Expected ${i + 1}, got ${item.position}`);
      }

      // Check name
      if (!item.name || typeof item.name !== "string") {
        errors.push(`Item ${i + 1} must have a name`);
      }

      // Check item structure if present
      if (item.item && typeof item.item === "object") {
        const itemObj = item.item as Record<string, unknown>;
        if (!itemObj["@id"] && !itemObj.url) {
          errors.push(`Item ${i + 1} must have either @id or url in the item property`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Extract breadcrumb items from a schema
 * @param schema - The breadcrumb schema
 * @returns Array of breadcrumb items or null
 */
export function extractBreadcrumbItems(schema: Record<string, unknown>): Array<{
  name: string;
  url?: string;
  position: number;
}> | null {
  if (!schema.itemListElement || !Array.isArray(schema.itemListElement)) {
    return null;
  }

  const items = schema.itemListElement as Array<Record<string, unknown>>;
  
  return items.map(item => {
    const itemObj = item.item as Record<string, unknown> | undefined;
    return {
      name: item.name as string,
      url: itemObj?.url as string | undefined,
      position: item.position as number,
    };
  });
}

/**
 * Create a breadcrumb schema builder for fluent API
 * @param locale - The target locale
 * @returns Breadcrumb builder instance
 */
export function createBreadcrumbBuilder(locale: SupportedSchemaLocale) {
  const items: BreadcrumbItem[] = [];

  return {
    /**
     * Add a home page item
     */
    addHome(url: string = "/", name?: string): typeof this {
      items.unshift({
        name: name || getHomeLabel(locale),
        url,
        type: "WebPage",
      });
      return this;
    },

    /**
     * Add a collection item
     */
    addCollection(name: string, url: string): typeof this {
      items.push({
        name,
        url,
        type: "CollectionPage",
      });
      return this;
    },

    /**
     * Add a product item
     */
    addProduct(name: string, url: string): typeof this {
      items.push({
        name,
        url,
        type: "Product",
      });
      return this;
    },

    /**
     * Add a page item
     */
    addPage(name: string, url: string): typeof this {
      items.push({
        name,
        url,
        type: "WebPage",
      });
      return this;
    },

    /**
     * Add a custom item
     */
    addItem(item: BreadcrumbItem): typeof this {
      items.push(item);
      return this;
    },

    /**
     * Build the breadcrumb schema
     */
    build(config?: BreadcrumbSchemaConfig): GeneratedBreadcrumbSchema {
      return generateBreadcrumbSchema(items, locale, {
        includeHome: false, // Already handled by builder
        ...config,
      });
    },

    /**
     * Get the current items
     */
    getItems(): BreadcrumbItem[] {
      return [...items];
    },

    /**
     * Clear all items
     */
    clear(): typeof this {
      items.length = 0;
      return this;
    },
  };
}
