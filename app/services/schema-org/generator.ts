import type {
  BreadcrumbSchemaInput,
  ProductSchemaInput,
  TranslatedProductSchema,
} from "./types";
import {
  generateProductSchema as generateProductSchemaCanonical,
  generateTranslatedProductSchema,
  type SupportedSchemaLocale,
} from "./product-schema";

// Re-export the translated helper directly
export { generateTranslatedProductSchema } from "./product-schema";

/**
 * Generate a Product JSON-LD schema from a ProductSchemaInput.
 *
 * Delegates to the canonical implementation in product-schema.ts, adapting
 * the single-object `ProductSchemaInput` shape to its two-argument API.
 */
export function generateProductSchema(
  input: ProductSchemaInput,
): TranslatedProductSchema {
  const locale = (input.locale || "en") as SupportedSchemaLocale;
  const result = generateProductSchemaCanonical(
    {
      name: input.name,
      description: input.description,
      sku: input.sku,
      price: input.price,
      currency: input.currency,
      availability: input.availability,
      imageUrl: input.imageUrl,
      brand: input.brand,
      ratingValue: input.ratingValue,
      reviewCount: input.reviewCount,
      url: input.url,
    },
    locale,
  );

  return {
    jsonLd: result.jsonLd,
    html: result.html,
    locale: result.locale,
  };
}

/**
 * Generate a BreadcrumbList JSON-LD schema.
 */
export function generateBreadcrumbSchema(
  input: BreadcrumbSchemaInput,
): string {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: input.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return wrapJsonLd(schema);
}

/**
 * Generate a basic Organization JSON-LD schema.
 */
export function generateOrganizationSchema(
  name: string,
  url: string,
  locale: string,
): string {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    inLanguage: locale,
  };

  return wrapJsonLd(schema);
}

/**
 * Wrap a schema object in a `<script type="application/ld+json">` tag
 * with proper JSON escaping to prevent XSS via embedded `</script>` sequences.
 */
export function wrapJsonLd(schema: Record<string, unknown>): string {
  const json = JSON.stringify(schema, null, 2)
    .replace(/<\//g, "<\\/")
    .replace(/<!--/g, "<\\!--");

  return `<script type="application/ld+json">\n${json}\n</script>`;
}
