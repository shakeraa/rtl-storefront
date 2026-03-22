/**
 * Enhanced Product Schema.org Translation (T0074)
 *
 * Translate JSON-LD Product schema for rich snippets in each language.
 * Features:
 * - Product name in schema
 * - Product description in schema
 * - Price with currency
 * - Availability status
 * - Review ratings
 */

import type { SupportedSchemaLocale } from "./product-schema";

export interface ProductReview {
  author: string;
  ratingValue: number;
  reviewBody: string;
  datePublished?: string;
}

export interface ProductAggregateRating {
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}

export interface EnhancedProductData {
  /** Product name (translated) */
  name: string;
  /** Product description (translated) */
  description: string;
  /** Product SKU */
  sku: string;
  /** Product price */
  price: number;
  /** Currency code (e.g., USD, AED, SAR) */
  currency: string;
  /** Availability status */
  availability: "InStock" | "OutOfStock" | "PreOrder" | "BackOrder";
  /** Product URL */
  url: string;
  /** Product image URL */
  imageUrl?: string;
  /** Product images for gallery */
  imageUrls?: string[];
  /** Brand name */
  brand?: string;
  /** Product category */
  category?: string;
  /** Product condition */
  condition?: "New" | "Used" | "Refurbished" | "Damaged";
  /** Global Trade Item Number */
  gtin?: string;
  /** Manufacturer Part Number */
  mpn?: string;
  /** Product color */
  color?: string;
  /** Product size */
  size?: string;
  /** Product material */
  material?: string;
  /** Product weight */
  weight?: {
    value: number;
    unit: string;
  };
  /** Product dimensions */
  dimensions?: {
    width: number;
    height: number;
    depth: number;
    unit: string;
  };
  /** Aggregate rating */
  aggregateRating?: ProductAggregateRating;
  /** Individual reviews */
  reviews?: ProductReview[];
  /** Product variants */
  hasVariant?: Array<{
    sku: string;
    name: string;
    price: number;
    size?: string;
    color?: string;
    imageUrl?: string;
  }>;
  /** Shipping details */
  shippingDetails?: {
    shippingRate: number;
    shippingCurrency: string;
    handlingTime: string;
    transitTime: string;
  };
  /** Seller information */
  seller?: {
    name: string;
    url?: string;
  };
  /** Offer valid from date */
  validFrom?: string;
  /** Offer valid until date */
  validUntil?: string;
  /** Item identifier */
  identifier?: string;
}

export interface GeneratedEnhancedProductSchema {
  /** The JSON-LD schema object */
  jsonLd: Record<string, unknown>;
  /** HTML script tag with JSON-LD */
  html: string;
  /** Target locale */
  locale: SupportedSchemaLocale;
  /** Text direction (rtl/ltr) */
  direction: "rtl" | "ltr";
  /** Schema validation status */
  isValid: boolean;
  /** Validation errors if any */
  validationErrors: string[];
}

// Schema.org availability URL mapping
const AVAILABILITY_URLS: Record<EnhancedProductData["availability"], string> = {
  InStock: "https://schema.org/InStock",
  OutOfStock: "https://schema.org/OutOfStock",
  PreOrder: "https://schema.org/PreOrder",
  BackOrder: "https://schema.org/BackOrder",
};

// Schema.org condition URL mapping
const CONDITION_URLS: Record<NonNullable<EnhancedProductData["condition"]>, string> = {
  New: "https://schema.org/NewCondition",
  Used: "https://schema.org/UsedCondition",
  Refurbished: "https://schema.org/RefurbishedCondition",
  Damaged: "https://schema.org/DamagedCondition",
};

/**
 * Generate a complete Schema.org Product JSON-LD with all T0074 requirements
 * @param product - The product data
 * @param locale - The target locale
 * @returns The generated product schema with validation
 */
export function generateEnhancedProductSchema(
  product: EnhancedProductData,
  locale: SupportedSchemaLocale,
): GeneratedEnhancedProductSchema {
  const direction = locale === "ar" || locale === "he" ? "rtl" : "ltr";
  
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

  // Add identifier if provided
  if (product.identifier) {
    jsonLd["@id"] = product.identifier;
  }

  // Add images
  if (product.imageUrls && product.imageUrls.length > 0) {
    jsonLd.image = product.imageUrls;
  } else if (product.imageUrl) {
    jsonLd.image = product.imageUrl;
  }

  // Add brand
  if (product.brand) {
    jsonLd.brand = {
      "@type": "Brand",
      name: product.brand,
    };
  }

  // Add category
  if (product.category) {
    jsonLd.category = product.category;
  }

  // Add condition
  if (product.condition) {
    jsonLd.itemCondition = CONDITION_URLS[product.condition];
  }

  // Add GTIN
  if (product.gtin) {
    jsonLd.gtin = product.gtin;
  }

  // Add MPN
  if (product.mpn) {
    jsonLd.mpn = product.mpn;
  }

  // Add color
  if (product.color) {
    jsonLd.color = product.color;
  }

  // Add size
  if (product.size) {
    jsonLd.size = product.size;
  }

  // Add material
  if (product.material) {
    jsonLd.material = product.material;
  }

  // Add weight
  if (product.weight) {
    jsonLd.weight = {
      "@type": "QuantitativeValue",
      value: product.weight.value,
      unitCode: product.weight.unit,
    };
  }

  // Add dimensions
  if (product.dimensions) {
    jsonLd.depth = {
      "@type": "QuantitativeValue",
      value: product.dimensions.depth,
      unitCode: product.dimensions.unit,
    };
    jsonLd.width = {
      "@type": "QuantitativeValue",
      value: product.dimensions.width,
      unitCode: product.dimensions.unit,
    };
    jsonLd.height = {
      "@type": "QuantitativeValue",
      value: product.dimensions.height,
      unitCode: product.dimensions.unit,
    };
  }

  // Build the Offer object with price and availability
  const offers: Record<string, unknown> = {
    "@type": "Offer",
    price: product.price,
    priceCurrency: product.currency,
    availability: AVAILABILITY_URLS[product.availability],
    url: product.url,
  };

  // Add seller
  if (product.seller) {
    offers.seller = {
      "@type": "Organization",
      name: product.seller.name,
      ...(product.seller.url && { url: product.seller.url }),
    };
  }

  // Add validity dates
  if (product.validFrom) {
    offers.validFrom = product.validFrom;
  }
  if (product.validUntil) {
    offers.priceValidUntil = product.validUntil;
  }

  // Add shipping details
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

  // Add aggregate rating with reviews
  if (product.aggregateRating && product.aggregateRating.reviewCount > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.aggregateRating.ratingValue,
      reviewCount: product.aggregateRating.reviewCount,
      bestRating: product.aggregateRating.bestRating ?? 5,
      worstRating: product.aggregateRating.worstRating ?? 1,
    };
  }

  // Add individual reviews
  if (product.reviews && product.reviews.length > 0) {
    jsonLd.review = product.reviews.map(review => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.author,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.ratingValue,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: review.reviewBody,
      ...(review.datePublished && { datePublished: review.datePublished }),
    }));
  }

  // Add variants
  if (product.hasVariant && product.hasVariant.length > 0) {
    jsonLd.hasVariant = product.hasVariant.map(variant => ({
      "@type": "Product",
      sku: variant.sku,
      name: variant.name,
      offers: {
        "@type": "Offer",
        price: variant.price,
        priceCurrency: product.currency,
        availability: AVAILABILITY_URLS[product.availability],
      },
      ...(variant.size && { size: variant.size }),
      ...(variant.color && { color: variant.color }),
      ...(variant.imageUrl && { image: variant.imageUrl }),
    }));
  }

  // Validate the schema
  const validation = validateEnhancedProductSchema(jsonLd);

  // Generate HTML
  const html = wrapEnhancedProductJsonLd(jsonLd);

  return {
    jsonLd,
    html,
    locale,
    direction,
    isValid: validation.valid,
    validationErrors: validation.errors,
  };
}

/**
 * Wrap a product schema object in a script tag with proper escaping
 * @param schema - The schema object to wrap
 * @returns HTML string with JSON-LD script tag
 */
export function wrapEnhancedProductJsonLd(schema: Record<string, unknown>): string {
  const json = JSON.stringify(schema, null, 2)
    .replace(/<\//g, "<\\/")
    .replace(/<!--/g, "<\\!--");

  return `<script type="application/ld+json">\n${json}\n</script>`;
}

/**
 * Validate an enhanced product schema for required fields
 * @param schema - The schema to validate
 * @returns Validation result with errors if any
 */
export function validateEnhancedProductSchema(schema: Record<string, unknown>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required: Product name
  if (!schema.name || typeof schema.name !== "string" || schema.name.trim().length === 0) {
    errors.push("Product name is required and must be a non-empty string");
  }

  // Required: Product description
  if (!schema.description || typeof schema.description !== "string" || schema.description.trim().length === 0) {
    errors.push("Product description is required and must be a non-empty string");
  }

  // Required: SKU
  if (!schema.sku || typeof schema.sku !== "string" || schema.sku.trim().length === 0) {
    errors.push("Product SKU is required and must be a non-empty string");
  }

  // Required: Offers with price and currency
  if (!schema.offers || typeof schema.offers !== "object") {
    errors.push("Product offers are required");
  } else {
    const offers = schema.offers as Record<string, unknown>;
    
    // Required: Price
    if (typeof offers.price !== "number") {
      errors.push("Offer price is required and must be a number");
    }
    
    // Required: Price currency
    if (!offers.priceCurrency || typeof offers.priceCurrency !== "string") {
      errors.push("Offer priceCurrency is required and must be a string");
    }
    
    // Required: Availability
    if (!offers.availability || typeof offers.availability !== "string") {
      errors.push("Offer availability is required");
    }
  }

  // Validate schema.org context
  if (!schema["@context"] || schema["@context"] !== "https://schema.org") {
    errors.push("Schema must have @context set to https://schema.org");
  }

  // Validate Product type
  if (!schema["@type"] || schema["@type"] !== "Product") {
    errors.push("Schema must have @type set to Product");
  }

  // Validate URL
  if (!schema.url || typeof schema.url !== "string") {
    errors.push("Product URL is required");
  }

  // Validate aggregate rating if present
  if (schema.aggregateRating) {
    const rating = schema.aggregateRating as Record<string, unknown>;
    if (typeof rating.ratingValue !== "number") {
      errors.push("Aggregate rating must have a numeric ratingValue");
    }
    if (typeof rating.reviewCount !== "number") {
      errors.push("Aggregate rating must have a numeric reviewCount");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Extract pricing information from a product schema
 * @param schema - The product schema
 * @returns Price information or null
 */
export function extractPriceFromSchema(schema: Record<string, unknown>): {
  price: number;
  currency: string;
  availability: string;
} | null {
  if (!schema.offers || typeof schema.offers !== "object") {
    return null;
  }
  
  const offers = schema.offers as Record<string, unknown>;
  
  return {
    price: offers.price as number,
    currency: offers.priceCurrency as string,
    availability: offers.availability as string,
  };
}

/**
 * Extract review information from a product schema
 * @param schema - The product schema
 * @returns Review information or null
 */
export function extractReviewsFromSchema(schema: Record<string, unknown>): {
  ratingValue: number;
  reviewCount: number;
  reviews: Array<{
    author: string;
    ratingValue: number;
    reviewBody: string;
  }>;
} | null {
  const result: {
    ratingValue: number;
    reviewCount: number;
    reviews: Array<{
      author: string;
      ratingValue: number;
      reviewBody: string;
    }>;
  } = {
    ratingValue: 0,
    reviewCount: 0,
    reviews: [],
  };

  // Get aggregate rating
  if (schema.aggregateRating) {
    const rating = schema.aggregateRating as Record<string, unknown>;
    result.ratingValue = rating.ratingValue as number;
    result.reviewCount = rating.reviewCount as number;
  }

  // Get individual reviews
  if (schema.review) {
    const reviews = Array.isArray(schema.review) 
      ? schema.review 
      : [schema.review];
    
    result.reviews = reviews.map((review: Record<string, unknown>) => ({
      author: (review.author as Record<string, string>)?.name || "Anonymous",
      ratingValue: (review.reviewRating as Record<string, number>)?.ratingValue || 0,
      reviewBody: (review.reviewBody as string) || "",
    }));
  }

  return result.reviewCount > 0 || result.reviews.length > 0 ? result : null;
}

/**
 * Generate multiple product schemas for a product listing page
 * @param products - Array of product data
 * @param locale - The target locale
 * @returns Array of generated schemas
 */
export function generateMultipleProductSchemas(
  products: EnhancedProductData[],
  locale: SupportedSchemaLocale,
): GeneratedEnhancedProductSchema[] {
  return products.map(product => generateEnhancedProductSchema(product, locale));
}

/**
 * Merge multiple product schemas into a single @graph structure
 * @param schemas - Array of generated schemas
 * @returns Combined schema object
 */
export function mergeEnhancedProductSchemas(
  schemas: GeneratedEnhancedProductSchema[],
): {
  jsonLd: Record<string, unknown>;
  html: string;
} {
  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": schemas.map(s => s.jsonLd),
  };

  return {
    jsonLd: combinedSchema,
    html: wrapEnhancedProductJsonLd(combinedSchema),
  };
}
