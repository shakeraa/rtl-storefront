/**
 * Translated JSON-LD structured data generators (T0007).
 *
 * Produces schema.org-compliant JSON-LD objects for:
 * - Product
 * - BreadcrumbList
 * - Organization
 *
 * All text fields are localised via the `locale` parameter.
 */

// ---------------------------------------------------------------------------
// Product schema
// ---------------------------------------------------------------------------

/**
 * Generate a schema.org/Product JSON-LD object for the given product and
 * locale.
 *
 * The `product` object follows the Shopify Admin GraphQL shape but only
 * a subset of fields is required:
 *   - title / name
 *   - description
 *   - url / onlineStoreUrl
 *   - images[0].url / featuredImage?.url
 *   - priceRange / variants.edges[0].node.price
 *   - vendor
 *   - sku / variants.edges[0].node.sku
 *   - available / availableForSale
 */
export function generateProductSchema(product: any, locale: string): object {
  const name: string = product?.title ?? product?.name ?? "";
  const description: string = product?.description ?? product?.descriptionHtml ?? "";
  const url: string =
    product?.url ?? product?.onlineStoreUrl ?? product?.handle
      ? `/${product.handle}`
      : "";
  const imageUrl: string =
    product?.featuredImage?.url ??
    product?.images?.edges?.[0]?.node?.url ??
    product?.images?.[0]?.url ??
    "";

  const price: string =
    product?.priceRange?.minVariantPrice?.amount ??
    product?.variants?.edges?.[0]?.node?.price ??
    product?.price ??
    "0";

  const currency: string =
    product?.priceRange?.minVariantPrice?.currencyCode ??
    product?.variants?.edges?.[0]?.node?.currencyCode ??
    "USD";

  const sku: string =
    product?.variants?.edges?.[0]?.node?.sku ?? product?.sku ?? "";

  const vendor: string = product?.vendor ?? "";
  const available: boolean =
    product?.availableForSale ?? product?.available ?? true;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    inLanguage: locale,
  };

  if (imageUrl) {
    schema.image = imageUrl;
  }
  if (url) {
    schema.url = url;
  }
  if (vendor) {
    schema.brand = { "@type": "Brand", name: vendor };
  }
  if (sku) {
    schema.sku = sku;
  }

  schema.offers = {
    "@type": "Offer",
    price,
    priceCurrency: currency,
    availability: available
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
  };

  return schema;
}

// ---------------------------------------------------------------------------
// BreadcrumbList schema
// ---------------------------------------------------------------------------

/**
 * Generate a schema.org/BreadcrumbList JSON-LD object for the given
 * breadcrumb trail.
 */
export function generateBreadcrumbSchema(
  breadcrumbs: { name: string; url: string }[],
  locale: string,
): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    inLanguage: locale,
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

// ---------------------------------------------------------------------------
// Organization schema
// ---------------------------------------------------------------------------

/**
 * Generate a schema.org/Organization JSON-LD object for the given shop and
 * locale.
 *
 * The `shop` object follows a minimal Shopify shop shape:
 *   - name
 *   - primaryDomain?.url / url / myshopifyDomain
 *   - email
 *   - brand?.logo?.image?.url / logo
 *   - description
 */
export function generateOrganizationSchema(shop: any, locale: string): object {
  const name: string = shop?.name ?? "";
  const url: string =
    shop?.primaryDomain?.url ??
    shop?.url ??
    (shop?.myshopifyDomain ? `https://${shop.myshopifyDomain}` : "");
  const email: string = shop?.email ?? "";
  const logoUrl: string =
    shop?.brand?.logo?.image?.url ?? shop?.logo ?? "";
  const description: string = shop?.description ?? "";

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    inLanguage: locale,
  };

  if (url) schema.url = url;
  if (email) schema.email = email;
  if (logoUrl) schema.logo = logoUrl;
  if (description) schema.description = description;

  return schema;
}
