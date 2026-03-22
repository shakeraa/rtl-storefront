/**
 * Metafield Translation Service (T0008)
 *
 * Provides functions to discover and translate Shopify metafields attached to
 * products, collections, or other owner resources.
 */

import { contentTranslator } from "../content-translator/index";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MetafieldTranslation {
  namespace: string;
  key: string;
  value: string;
  locale: string;
}

export interface RawMetafield {
  namespace: string;
  key: string;
  value: string;
  type?: string;
}

// ---------------------------------------------------------------------------
// getTranslatableMetafields
// ---------------------------------------------------------------------------

/**
 * Fetch all metafields for a given owner resource from Shopify.
 *
 * Only returns metafields whose type is one of the translatable string types
 * (`single_line_text_field`, `multi_line_text_field`, `rich_text_field`).
 *
 * @param ownerId - Shopify owner GID (e.g. "gid://shopify/Product/123").
 * @param admin   - Shopify Admin GraphQL client.
 */
export async function getTranslatableMetafields(
  ownerId: string,
  admin: { graphql: (query: string, options?: { variables?: Record<string, unknown> }) => Promise<{ json: () => Promise<unknown> }> },
): Promise<RawMetafield[]> {
  const response = await admin.graphql(
    `#graphql
    query GetMetafields($ownerId: ID!) {
      node(id: $ownerId) {
        ... on Product {
          metafields(first: 50) {
            edges {
              node {
                namespace
                key
                value
                type
              }
            }
          }
        }
        ... on Collection {
          metafields(first: 50) {
            edges {
              node {
                namespace
                key
                value
                type
              }
            }
          }
        }
        ... on ProductVariant {
          metafields(first: 50) {
            edges {
              node {
                namespace
                key
                value
                type
              }
            }
          }
        }
      }
    }`,
    { variables: { ownerId } },
  );

  const data = await (response as { json: () => Promise<unknown> }).json() as {
    data?: {
      node?: {
        metafields?: {
          edges: Array<{
            node: { namespace: string; key: string; value: string; type: string };
          }>;
        };
      };
    };
  };

  const TRANSLATABLE_TYPES = new Set([
    "single_line_text_field",
    "multi_line_text_field",
    "rich_text_field",
    "string",
  ]);

  const edges = data?.data?.node?.metafields?.edges ?? [];

  return edges
    .map((e) => e.node)
    .filter((mf) => TRANSLATABLE_TYPES.has(mf.type) && mf.value?.trim().length > 0)
    .map(({ namespace, key, value }) => ({ namespace, key, value }));
}

// ---------------------------------------------------------------------------
// translateMetafield
// ---------------------------------------------------------------------------

/**
 * Translate a single metafield value into `targetLocale`.
 *
 * This function only performs the AI translation — it does not persist the
 * result back to Shopify. Callers should use the `translationsRegister`
 * mutation with the returned value.
 *
 * @param ownerId      - Shopify owner GID.
 * @param namespace    - Metafield namespace (e.g. "custom").
 * @param key          - Metafield key (e.g. "care_instructions").
 * @param targetLocale - BCP-47 locale code (e.g. "ar").
 */
export async function translateMetafield(
  ownerId: string,
  namespace: string,
  key: string,
  targetLocale: string,
): Promise<MetafieldTranslation> {
  // We don't have the source value here, so callers must supply it via
  // translateMetafieldValue when a value is available.  This entry point
  // is kept as a lightweight wrapper that fetches value from cache if present.
  const cacheKey = `metafield.${ownerId}.${namespace}.${key}`;
  const result = await contentTranslator.translate(
    cacheKey,
    `${namespace}.${key}`,       // fallback placeholder if no real source text
    targetLocale,
    { contentType: "metafield", fieldName: key, locale: targetLocale },
  );

  return {
    namespace,
    key,
    value: result.translatedText,
    locale: targetLocale,
  };
}

// ---------------------------------------------------------------------------
// translateMetafieldValue
// ---------------------------------------------------------------------------

/**
 * Translate a metafield's actual source value into `targetLocale`.
 *
 * @param ownerId      - Shopify owner GID.
 * @param namespace    - Metafield namespace.
 * @param key          - Metafield key.
 * @param sourceValue  - The current plain-text value of the metafield.
 * @param targetLocale - BCP-47 locale code.
 */
export async function translateMetafieldValue(
  ownerId: string,
  namespace: string,
  key: string,
  sourceValue: string,
  targetLocale: string,
): Promise<MetafieldTranslation> {
  const cacheKey = `metafield.${ownerId}.${namespace}.${key}`;
  const result = await contentTranslator.translate(
    cacheKey,
    sourceValue,
    targetLocale,
    { contentType: "metafield", fieldName: key, locale: targetLocale },
  );

  return {
    namespace,
    key,
    value: result.translatedText,
    locale: targetLocale,
  };
}

// ---------------------------------------------------------------------------
// bulkTranslateMetafields
// ---------------------------------------------------------------------------

/**
 * Translate all provided metafield values for an owner into `targetLocale`.
 *
 * @param ownerId      - Shopify owner GID.
 * @param metafields   - Array of raw metafield objects with namespace, key, value.
 * @param targetLocale - BCP-47 locale code.
 */
export async function bulkTranslateMetafields(
  ownerId: string,
  metafields: RawMetafield[],
  targetLocale: string,
): Promise<MetafieldTranslation[]> {
  return Promise.all(
    metafields.map((mf) =>
      translateMetafieldValue(ownerId, mf.namespace, mf.key, mf.value, targetLocale),
    ),
  );
}
