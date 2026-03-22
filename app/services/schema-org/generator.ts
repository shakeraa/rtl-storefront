import { getTextDirection } from "../../utils/rtl";
import type {
  BreadcrumbSchemaInput,
  ProductSchemaInput,
  TranslatedProductSchema,
} from "./types";

/**
 * Maps availability enum values to their Schema.org URLs.
 */
const AVAILABILITY_MAP: Record<ProductSchemaInput["availability"], string> = {
  InStock: "https://schema.org/InStock",
  OutOfStock: "https://schema.org/OutOfStock",
  PreOrder: "https://schema.org/PreOrder",
  BackOrder: "https://schema.org/BackOrder",
};

/**
 * Generate a Product JSON-LD schema with translated fields.
 */
export function generateProductSchema(
  input: ProductSchemaInput,
): TranslatedProductSchema {
  const direction = getTextDirection(input.locale);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description,
    sku: input.sku,
    url: input.url,
    offers: {
      "@type": "Offer",
      price: input.price,
      priceCurrency: input.currency,
      availability: AVAILABILITY_MAP[input.availability],
      url: input.url,
    },
    inLanguage: input.locale,
  };

  if (input.imageUrl) {
    jsonLd.image = input.imageUrl;
  }

  if (input.brand) {
    jsonLd.brand = {
      "@type": "Brand",
      name: input.brand,
    };
  }

  if (
    input.ratingValue !== undefined &&
    input.reviewCount !== undefined &&
    input.reviewCount > 0
  ) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: input.ratingValue,
      reviewCount: input.reviewCount,
    };
  }

  return {
    jsonLd,
    html: wrapJsonLd(jsonLd),
    locale: input.locale,
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
