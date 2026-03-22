/**
 * Content Translation Service
 *
 * Unified service for Shopify translatable resource field mappings:
 * - T0008: Product & collection translation fields
 * - T0093: Vendor name translation
 * - T0094: Product type translation
 * - T0095: Tag translation
 * - T0096: Custom/metafield translation
 * - T0097: Template translation
 * - T0098: Collection description translation
 */

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

export type TranslatableResourceType =
  | "product"
  | "collection"
  | "page"
  | "blog"
  | "navigation"
  | "theme";

export interface TranslatableField {
  key: string;
  value: string;
  locale: string;
  resourceType: TranslatableResourceType;
  resourceId: string;
}

// ---------------------------------------------------------------------------
// T0008 - Product & collection translation fields
// ---------------------------------------------------------------------------

/**
 * Standard translatable fields for a Shopify product.
 */
export function getProductTranslatableFields(): string[] {
  return [
    "title",
    "description",
    "seo_title",
    "seo_description",
    "handle",
  ];
}

/**
 * Standard translatable fields for a Shopify collection.
 */
export function getCollectionTranslatableFields(): string[] {
  return [
    "title",
    "description",
    "seo_title",
    "seo_description",
  ];
}

// ---------------------------------------------------------------------------
// T0093 - Vendor name field
// ---------------------------------------------------------------------------

export function getVendorNameField(productId: string): TranslatableField {
  return {
    key: "vendor",
    value: "",
    locale: "",
    resourceType: "product",
    resourceId: productId,
  };
}

// ---------------------------------------------------------------------------
// T0094 - Product type field
// ---------------------------------------------------------------------------

export function getProductTypeField(productId: string): TranslatableField {
  return {
    key: "product_type",
    value: "",
    locale: "",
    resourceType: "product",
    resourceId: productId,
  };
}

// ---------------------------------------------------------------------------
// T0095 - Tag fields
// ---------------------------------------------------------------------------

export function getTagFields(
  productId: string,
  tags: string[],
): TranslatableField[] {
  return tags.map((tag, index) => ({
    key: `tag_${index}`,
    value: tag,
    locale: "",
    resourceType: "product" as const,
    resourceId: productId,
  }));
}

// ---------------------------------------------------------------------------
// T0096 - Custom / metafield fields
// ---------------------------------------------------------------------------

export function getCustomFields(
  productId: string,
  metafields: Array<{ key: string; value: string }>,
): TranslatableField[] {
  return metafields.map((mf) => ({
    key: `metafield_${mf.key}`,
    value: mf.value,
    locale: "",
    resourceType: "product" as const,
    resourceId: productId,
  }));
}

// ---------------------------------------------------------------------------
// T0097 - Template fields
// ---------------------------------------------------------------------------

export function getTemplateFields(productId: string): TranslatableField[] {
  return [
    {
      key: "template_suffix",
      value: "",
      locale: "",
      resourceType: "product",
      resourceId: productId,
    },
    {
      key: "template_title",
      value: "",
      locale: "",
      resourceType: "product",
      resourceId: productId,
    },
  ];
}

// ---------------------------------------------------------------------------
// T0098 - Collection description field
// ---------------------------------------------------------------------------

export function getCollectionDescriptionField(
  collectionId: string,
): TranslatableField {
  return {
    key: "description",
    value: "",
    locale: "",
    resourceType: "collection",
    resourceId: collectionId,
  };
}

// ---------------------------------------------------------------------------
// Field registry
// ---------------------------------------------------------------------------

/**
 * Complete registry of translatable fields per resource type.
 */
export const TRANSLATABLE_FIELDS: Record<TranslatableResourceType, string[]> = {
  product: [
    "title",
    "description",
    "seo_title",
    "seo_description",
    "handle",
    "vendor",
    "product_type",
    "tags",
    "template_suffix",
    "template_title",
  ],
  collection: [
    "title",
    "description",
    "seo_title",
    "seo_description",
  ],
  page: [
    "title",
    "body_html",
    "seo_title",
    "seo_description",
    "handle",
  ],
  blog: [
    "title",
    "seo_title",
    "seo_description",
    "handle",
  ],
  navigation: [
    "title",
    "items",
  ],
  theme: [
    "locale_strings",
    "section_settings",
    "block_settings",
  ],
};

/**
 * Build TranslatableField entries for every known field on a resource.
 */
export function getAllTranslatableFields(
  resourceType: TranslatableResourceType,
  resourceId: string,
): TranslatableField[] {
  const keys = TRANSLATABLE_FIELDS[resourceType] ?? [];

  return keys.map((key) => ({
    key,
    value: "",
    locale: "",
    resourceType,
    resourceId,
  }));
}
