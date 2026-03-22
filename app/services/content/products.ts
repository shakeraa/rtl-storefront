/**
 * Content / Products Service (T0008)
 *
 * Provides helpers for extracting translatable content from Shopify products
 * and collections, and building Shopify translationsRegister mutation payloads.
 */

import {
  type TranslatableField,
  getProductTranslatableFields,
  getCollectionTranslatableFields,
  getCustomFields,
  getTagFields,
} from "../content-translation";

// ---------------------------------------------------------------------------
// Constants — Shopify translatable resource keys
// ---------------------------------------------------------------------------

/**
 * All Shopify product resource keys that can be submitted to the
 * `translationsRegister` mutation.
 */
export const PRODUCT_TRANSLATABLE_KEYS = [
  "title",
  "body_html",
  "handle",
  "meta_title",
  "meta_description",
  "product_type",
  "vendor",
  "tags",
] as const;

/**
 * All Shopify collection resource keys that can be submitted to the
 * `translationsRegister` mutation.
 */
export const COLLECTION_TRANSLATABLE_KEYS = [
  "title",
  "body_html",
  "handle",
  "meta_title",
  "meta_description",
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TranslatableContent {
  resourceId: string;
  resourceType: "product" | "collection";
  fields: TranslatableField[];
  variantFields?: TranslatableField[];
  metafieldFields?: TranslatableField[];
}

export interface TranslationPayloadEntry {
  key: string;
  value: string;
  locale: string;
  translatableContentDigest: string;
}

export interface TranslationPayload {
  resourceId: string;
  translations: TranslationPayloadEntry[];
}

// ---------------------------------------------------------------------------
// getProductTranslatableContent
// ---------------------------------------------------------------------------

/**
 * Return all translatable fields for a product, including base fields,
 * variant option names, and metafield values.
 *
 * @param productId - The Shopify product GID or numeric ID
 * @param options - Optional variant and metafield data to include
 */
export function getProductTranslatableContent(
  productId: string,
  options?: {
    variants?: Array<{ id: string; title: string; options: string[] }>;
    metafields?: Array<{ key: string; value: string }>;
    tags?: string[];
  },
): TranslatableContent {
  const baseKeys = getProductTranslatableFields();
  const fields: TranslatableField[] = baseKeys.map((key) => ({
    key,
    value: "",
    locale: "",
    resourceType: "product" as const,
    resourceId: productId,
  }));

  // Variant fields (each variant's title and option values)
  const variantFields: TranslatableField[] = [];
  if (options?.variants) {
    for (const variant of options.variants) {
      variantFields.push({
        key: "title",
        value: variant.title,
        locale: "",
        resourceType: "product",
        resourceId: variant.id,
      });
      for (let i = 0; i < variant.options.length; i++) {
        variantFields.push({
          key: `option${i + 1}`,
          value: variant.options[i],
          locale: "",
          resourceType: "product",
          resourceId: variant.id,
        });
      }
    }
  }

  // Metafield fields
  const metafieldFields = options?.metafields
    ? getCustomFields(productId, options.metafields)
    : [];

  // Tag fields
  if (options?.tags) {
    const tagFields = getTagFields(productId, options.tags);
    fields.push(...tagFields);
  }

  return {
    resourceId: productId,
    resourceType: "product",
    fields,
    variantFields: variantFields.length > 0 ? variantFields : undefined,
    metafieldFields: metafieldFields.length > 0 ? metafieldFields : undefined,
  };
}

// ---------------------------------------------------------------------------
// getCollectionTranslatableContent
// ---------------------------------------------------------------------------

/**
 * Return all translatable fields for a collection.
 *
 * @param collectionId - The Shopify collection GID or numeric ID
 * @param options - Optional metafield data
 */
export function getCollectionTranslatableContent(
  collectionId: string,
  options?: {
    metafields?: Array<{ key: string; value: string }>;
  },
): TranslatableContent {
  const baseKeys = getCollectionTranslatableFields();
  const fields: TranslatableField[] = baseKeys.map((key) => ({
    key,
    value: "",
    locale: "",
    resourceType: "collection" as const,
    resourceId: collectionId,
  }));

  const metafieldFields = options?.metafields
    ? getCustomFields(collectionId, options.metafields)
    : [];

  return {
    resourceId: collectionId,
    resourceType: "collection",
    fields,
    metafieldFields: metafieldFields.length > 0 ? metafieldFields : undefined,
  };
}

// ---------------------------------------------------------------------------
// buildTranslationPayload
// ---------------------------------------------------------------------------

/**
 * Build a Shopify `translationsRegister` mutation payload from translatable
 * content and target locale values.
 *
 * @param content - The translatable content (from getProduct/CollectionTranslatableContent)
 * @param targetLocale - The BCP-47 locale code to translate into
 * @param translations - Map of field key to translated value
 */
export function buildTranslationPayload(
  content: TranslatableContent,
  targetLocale: string,
  translations: Record<string, string>,
): TranslationPayload {
  const allFields = [
    ...content.fields,
    ...(content.variantFields ?? []),
    ...(content.metafieldFields ?? []),
  ];

  const entries: TranslationPayloadEntry[] = [];

  for (const field of allFields) {
    const translatedValue = translations[field.key];
    if (translatedValue === undefined || translatedValue.trim().length === 0) {
      continue;
    }

    entries.push({
      key: field.key,
      value: translatedValue,
      locale: targetLocale,
      // The digest is normally fetched from Shopify's translatableContent query.
      // We use a placeholder that callers should replace with the real digest.
      translatableContentDigest: computeDigestPlaceholder(
        content.resourceId,
        field.key,
      ),
    });
  }

  return {
    resourceId: content.resourceId,
    translations: entries,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Generate a placeholder digest string. In production, digests come from
 * Shopify's `translatableContent` GraphQL query. This placeholder signals
 * that the caller must hydrate it with the real value.
 */
function computeDigestPlaceholder(resourceId: string, key: string): string {
  return `__DIGEST_PLACEHOLDER__${resourceId}__${key}`;
}
