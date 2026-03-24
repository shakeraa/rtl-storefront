import { getTextDirection } from "../../utils/rtl";

/**
 * Supported locales for schema translation
 */
export type SupportedSchemaLocale = "ar" | "he" | "en";

/**
 * Schema field translations for different locales
 */
export interface SchemaTranslations {
  product: string;
  offer: string;
  brand: string;
  aggregateRating: string;
  review: string;
  availability: {
    inStock: string;
    outOfStock: string;
    preOrder: string;
    backOrder: string;
  };
  price: string;
  currency: string;
  rating: string;
  reviewCount: string;
  description: string;
  sku: string;
  url: string;
  image: string;
  name: string;
}

/**
 * Product data structure for schema generation
 */
export interface ProductSchemaData {
  name: string;
  description: string;
  sku: string;
  price: number;
  currency: string;
  availability: "InStock" | "OutOfStock" | "PreOrder" | "BackOrder";
  imageUrl?: string;
  brand?: string;
  ratingValue?: number;
  reviewCount?: number;
  url: string;
  category?: string;
  condition?: "New" | "Used" | "Refurbished" | "Damaged";
  gtin?: string;
  mpn?: string;
  color?: string;
  size?: string;
  material?: string;
  weight?: {
    value: number;
    unit: string;
  };
  shippingDetails?: {
    shippingRate: number;
    shippingCurrency: string;
    handlingTime: string;
    transitTime: string;
  };
  hasVariant?: Array<{
    sku: string;
    name: string;
    price: number;
    size?: string;
    color?: string;
  }>;
}

/**
 * Generated product schema result
 */
export interface GeneratedProductSchema {
  jsonLd: Record<string, unknown>;
  html: string;
  locale: SupportedSchemaLocale;
  direction: "rtl" | "ltr";
}

/**
 * Schema field mapping for translation
 */
export interface SchemaFieldMapping {
  field: string;
  value: string | number | boolean | null;
  translatable: boolean;
}

/**
 * Translations for schema fields in supported locales
 */
const SCHEMA_TRANSLATIONS: Record<SupportedSchemaLocale, SchemaTranslations> = {
  ar: {
    product: "منتج",
    offer: "عرض",
    brand: "علامة تجارية",
    aggregateRating: "تقييم إجمالي",
    review: "مراجعة",
    availability: {
      inStock: "متوفر في المخزون",
      outOfStock: "غير متوفر في المخزون",
      preOrder: "طلب مسبق",
      backOrder: "طلب إضافي",
    },
    price: "السعر",
    currency: "العملة",
    rating: "التقييم",
    reviewCount: "عدد المراجعات",
    description: "الوصف",
    sku: "رمز المنتج",
    url: "الرابط",
    image: "الصورة",
    name: "الاسم",
  },
  he: {
    product: "מוצר",
    offer: "הצעה",
    brand: "מותג",
    aggregateRating: "דירוג מצטבר",
    review: "ביקורת",
    availability: {
      inStock: "זמין במלאי",
      outOfStock: "אזל מהמלאי",
      preOrder: "הזמנה מראש",
      backOrder: "הזמנה מאוחרת",
    },
    price: "מחיר",
    currency: "מטבע",
    rating: "דירוג",
    reviewCount: "מספר ביקורות",
    description: "תיאור",
    sku: "מק\"ט",
    url: "כתובת URL",
    image: "תמונה",
    name: "שם",
  },
  en: {
    product: "Product",
    offer: "Offer",
    brand: "Brand",
    aggregateRating: "Aggregate Rating",
    review: "Review",
    availability: {
      inStock: "In Stock",
      outOfStock: "Out of Stock",
      preOrder: "Pre-order",
      backOrder: "Back Order",
    },
    price: "Price",
    currency: "Currency",
    rating: "Rating",
    reviewCount: "Review Count",
    description: "Description",
    sku: "SKU",
    url: "URL",
    image: "Image",
    name: "Name",
  },
};

/**
 * Schema.org availability URL mapping
 */
const AVAILABILITY_URLS: Record<ProductSchemaData["availability"], string> = {
  InStock: "https://schema.org/InStock",
  OutOfStock: "https://schema.org/OutOfStock",
  PreOrder: "https://schema.org/PreOrder",
  BackOrder: "https://schema.org/BackOrder",
};

/**
 * Schema.org item condition URL mapping
 */
const CONDITION_URLS: Record<NonNullable<ProductSchemaData["condition"]>, string> = {
  New: "https://schema.org/NewCondition",
  Used: "https://schema.org/UsedCondition",
  Refurbished: "https://schema.org/RefurbishedCondition",
  Damaged: "https://schema.org/DamagedCondition",
};

/**
 * Get translations for schema fields in the specified locale
 * @param locale - The target locale (ar, he, or en)
 * @returns The schema translations for the locale
 */
export function getSchemaTranslations(locale: SupportedSchemaLocale): SchemaTranslations {
  return SCHEMA_TRANSLATIONS[locale] || SCHEMA_TRANSLATIONS.en;
}

/**
 * Get localized availability text
 * @param availability - The availability status
 * @param locale - The target locale
 * @returns Localized availability text
 */
export function getLocalizedAvailability(
  availability: ProductSchemaData["availability"],
  locale: SupportedSchemaLocale,
): string {
  const translations = getSchemaTranslations(locale);
  switch (availability) {
    case "InStock":
      return translations.availability.inStock;
    case "OutOfStock":
      return translations.availability.outOfStock;
    case "PreOrder":
      return translations.availability.preOrder;
    case "BackOrder":
      return translations.availability.backOrder;
    default:
      return translations.availability.inStock;
  }
}

/**
 * Extract translatable fields from a schema object
 * @param schema - The schema object to extract fields from
 * @returns Array of field mappings with translatable flag
 */
export function extractTranslatableFields(schema: Record<string, unknown>): SchemaFieldMapping[] {
  const fields: SchemaFieldMapping[] = [];
  const translatableKeys = ["name", "description", "brand", "category", "color", "size", "material"];

  for (const [key, value] of Object.entries(schema)) {
    if (translatableKeys.includes(key) && typeof value === "string") {
      fields.push({ field: key, value, translatable: true });
    } else if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      fields.push({ field: key, value, translatable: false });
    } else if (value !== null && typeof value === "object") {
      // Recursively extract from nested objects
      const nestedFields = extractTranslatableFields(value as Record<string, unknown>);
      fields.push(...nestedFields.map(f => ({ ...f, field: `${key}.${f.field}` })));
    }
  }

  return fields;
}

/**
 * Translate schema fields to the target locale
 * Note: This is a translation wrapper that would integrate with the translation service
 * For now, it returns the schema with metadata about the target locale
 * @param schema - The schema object to translate
 * @param targetLocale - The target locale for translation
 * @returns Translated schema object with locale metadata
 */
/**
 * Translation metadata returned alongside (but not embedded in) the JSON-LD.
 */
export interface TranslationMetadata {
  targetLocale: string;
  sourceLocale: string;
  direction: "rtl" | "ltr";
  translatedAt: string;
  availabilityLabel?: string;
}

export function translateSchemaFields(
  schema: Record<string, unknown>,
  targetLocale: SupportedSchemaLocale,
): Record<string, unknown> {
  const translations = getSchemaTranslations(targetLocale);

  // Create a deep copy of the schema
  const translatedSchema: Record<string, unknown> = JSON.parse(JSON.stringify(schema));

  // Always set inLanguage to the target locale
  translatedSchema.inLanguage = targetLocale;

  // Do NOT embed non-standard properties (_translationMeta, availabilityLabel)
  // in the JSON-LD output. Use getTranslationMetadata() for that data.

  return translatedSchema;
}

/**
 * Build translation metadata for a schema object without embedding it in the
 * JSON-LD. Consumers that need this data can call this separately.
 */
export function getTranslationMetadata(
  schema: Record<string, unknown>,
  targetLocale: SupportedSchemaLocale,
): TranslationMetadata {
  const translations = getSchemaTranslations(targetLocale);
  const direction = getTextDirection(targetLocale);
  const sourceLocale = (schema.inLanguage as string) || "en";

  const metadata: TranslationMetadata = {
    targetLocale,
    sourceLocale,
    direction,
    translatedAt: new Date().toISOString(),
  };

  // Include localized availability label if the schema has offers
  if (schema.offers && typeof schema.offers === "object") {
    const offers = schema.offers as Record<string, unknown>;
    if (offers.availability) {
      metadata.availabilityLabel = translations.availability.inStock;
    }
  }

  return metadata;
}

/**
 * Generate a complete Schema.org Product JSON-LD structured data
 * @param product - The product data
 * @param locale - The target locale for the schema
 * @returns The generated product schema with JSON-LD and HTML
 */
export function generateProductSchema(
  product: ProductSchemaData,
  locale: SupportedSchemaLocale,
): GeneratedProductSchema {
  const direction = getTextDirection(locale);
  const translations = getSchemaTranslations(locale);

  // Build the base Product schema
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    url: product.url,
    inLanguage: locale,
  };

  // Add image if provided
  if (product.imageUrl) {
    jsonLd.image = product.imageUrl;
  }

  // Add brand if provided
  if (product.brand) {
    jsonLd.brand = {
      "@type": "Brand",
      name: product.brand,
    };
  }

  // Add category if provided
  if (product.category) {
    jsonLd.category = product.category;
  }

  // Add condition if provided
  if (product.condition) {
    jsonLd.itemCondition = CONDITION_URLS[product.condition];
  }

  // Add GTIN if provided
  if (product.gtin) {
    jsonLd.gtin = product.gtin;
  }

  // Add MPN if provided
  if (product.mpn) {
    jsonLd.mpn = product.mpn;
  }

  // Add color if provided
  if (product.color) {
    jsonLd.color = product.color;
  }

  // Add size if provided
  if (product.size) {
    jsonLd.size = product.size;
  }

  // Add material if provided
  if (product.material) {
    jsonLd.material = product.material;
  }

  // Add weight if provided
  if (product.weight) {
    jsonLd.weight = {
      "@type": "QuantitativeValue",
      value: product.weight.value,
      unitCode: product.weight.unit,
    };
  }

  // Build the Offer object
  const offers: Record<string, unknown> = {
    "@type": "Offer",
    price: product.price,
    priceCurrency: product.currency,
    availability: AVAILABILITY_URLS[product.availability],
    url: product.url,
  };

  // Add shipping details if provided
  if (product.shippingDetails) {
    offers.shippingDetails = {
      "@type": "OfferShippingDetails",
      shippingRate: {
        "@type": "MonetaryAmount",
        value: product.shippingDetails.shippingRate,
        currency: product.shippingDetails.shippingCurrency,
      },
      handlingTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: {
          "@type": "QuantitativeValue",
          value: product.shippingDetails.handlingTime,
        },
        transitTime: {
          "@type": "QuantitativeValue",
          value: product.shippingDetails.transitTime,
        },
      },
    };
  }

  jsonLd.offers = offers;

  // Add aggregate rating if provided
  if (
    product.ratingValue !== undefined &&
    product.reviewCount !== undefined &&
    product.reviewCount > 0
  ) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.ratingValue,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Add variants if provided
  if (product.hasVariant && product.hasVariant.length > 0) {
    jsonLd.hasVariant = product.hasVariant.map(variant => ({
      "@type": "Product",
      sku: variant.sku,
      name: variant.name,
      offers: {
        "@type": "Offer",
        price: variant.price,
        priceCurrency: product.currency,
      },
      ...(variant.size && { size: variant.size }),
      ...(variant.color && { color: variant.color }),
    }));
  }

  // Generate HTML with proper escaping for security
  const html = wrapProductJsonLd(jsonLd);

  return {
    jsonLd,
    html,
    locale,
    direction,
  };
}

/**
 * Wrap a product schema object in a script tag with proper escaping
 * @param schema - The schema object to wrap
 * @returns HTML string with JSON-LD script tag
 */
export function wrapProductJsonLd(schema: Record<string, unknown>): string {
  const json = JSON.stringify(schema, null, 2)
    .replace(/<\//g, "<\\/")
    .replace(/<!--/g, "<\\!--");

  return `<script type="application/ld+json">\n${json}\n</script>`;
}

/**
 * Generate breadcrumb schema for product pages
 * @param productName - The product name
 * @param productUrl - The product URL
 * @param categoryName - Optional category name
 * @param categoryUrl - Optional category URL
 * @param locale - The target locale
 * @returns JSON-LD breadcrumb schema HTML
 */
export function generateProductBreadcrumbSchema(
  productName: string,
  productUrl: string,
  categoryName?: string,
  categoryUrl?: string,
  locale: SupportedSchemaLocale = "en",
): string {
  const items: Array<{ name: string; url: string }> = [
    { name: locale === "ar" ? "الرئيسية" : locale === "he" ? "דף הבית" : "Home", url: "/" },
  ];

  if (categoryName && categoryUrl) {
    items.push({ name: categoryName, url: categoryUrl });
  }

  items.push({ name: productName, url: productUrl });

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return wrapProductJsonLd(schema);
}

/**
 * Generate a translated product schema — convenience wrapper that calls
 * `generateProductSchema` and then applies locale-specific field translations.
 */
export function generateTranslatedProductSchema(
  product: ProductSchemaData,
  locale: SupportedSchemaLocale,
): GeneratedProductSchema {
  const result = generateProductSchema(product, locale);
  const translated = translateSchemaFields(result.jsonLd, locale);
  return {
    ...result,
    jsonLd: translated,
  };
}

/**
 * Validate a product schema for required fields
 * @param schema - The schema to validate
 * @returns Validation result with errors if any
 */
export function validateProductSchema(schema: Record<string, unknown>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!schema.name || typeof schema.name !== "string") {
    errors.push("Product name is required and must be a string");
  }

  if (!schema.description || typeof schema.description !== "string") {
    errors.push("Product description is required and must be a string");
  }

  if (!schema.sku || typeof schema.sku !== "string") {
    errors.push("Product SKU is required and must be a string");
  }

  if (!schema.offers || typeof schema.offers !== "object") {
    errors.push("Product offers are required");
  } else {
    const offers = schema.offers as Record<string, unknown>;
    if (typeof offers.price !== "number") {
      errors.push("Offer price is required and must be a number");
    }
    if (!offers.priceCurrency || typeof offers.priceCurrency !== "string") {
      errors.push("Offer priceCurrency is required and must be a string");
    }
  }

  if (!schema["@context"] || schema["@context"] !== "https://schema.org") {
    errors.push("Schema must have @context set to https://schema.org");
  }

  if (!schema["@type"] || schema["@type"] !== "Product") {
    errors.push("Schema must have @type set to Product");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Merge multiple product schemas for product listings
 * @param schemas - Array of product schemas to merge
 * @returns Merged schema with @graph structure
 */
export function mergeProductSchemas(
  schemas: Array<Record<string, unknown>>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": schemas.map(schema => ({
      ...schema,
      "@context": undefined, // Remove individual contexts
    })),
  };
}
