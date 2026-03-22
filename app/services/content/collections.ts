/**
 * Collection Translation Service (T0008)
 *
 * Provides functions to translate Shopify collections via the Admin GraphQL API.
 */

import { contentTranslator } from "../content-translator/index";
import { getCollectionTranslatableFields } from "../content-translation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CollectionTranslation {
  id: string;
  title: string;
  description: string;
  handle: string;
  locale: string;
}

// ---------------------------------------------------------------------------
// translateCollection
// ---------------------------------------------------------------------------

/**
 * Fetch a collection from Shopify, translate its translatable fields into
 * `targetLocale`, register the translations back via `translationsRegister`,
 * and return the translated values.
 *
 * @param collectionId - The Shopify collection GID (e.g. "gid://shopify/Collection/123")
 *                       or a plain numeric ID string.
 * @param targetLocale - BCP-47 locale code (e.g. "ar", "he").
 * @param admin        - Shopify Admin GraphQL client from `authenticate.admin`.
 */
export async function translateCollection(
  collectionId: string,
  targetLocale: string,
  admin: { graphql: (query: string, options?: { variables?: Record<string, unknown> }) => Promise<{ json: () => Promise<unknown> }> },
): Promise<CollectionTranslation> {
  const gid = normalizeGid(collectionId, "Collection");

  // 1. Fetch translatable content from Shopify
  const fetchResponse = await admin.graphql(
    `#graphql
    query GetCollectionTranslatableContent($id: ID!, $locale: String!) {
      translatableResource(resourceId: $id) {
        resourceId
        translatableContent {
          key
          value
          digest
          locale
        }
        translations(locale: $locale) {
          key
          value
          locale
        }
      }
    }`,
    { variables: { id: gid, locale: targetLocale } },
  );

  const fetchData = await (fetchResponse as { json: () => Promise<unknown> }).json() as {
    data?: {
      translatableResource?: {
        resourceId: string;
        translatableContent: Array<{ key: string; value: string; digest: string; locale: string }>;
        translations: Array<{ key: string; value: string; locale: string }>;
      };
    };
  };

  const resource = fetchData?.data?.translatableResource;
  const translatableContent = resource?.translatableContent ?? [];

  // 2. Translate each field using the content translator
  const translationKeys = getCollectionTranslatableFields();
  const translationInputs: Array<{ key: string; value: string; translatableContentDigest: string }> = [];

  const translatedValues: Record<string, string> = {};

  for (const entry of translatableContent) {
    if (!translationKeys.includes(entry.key) || !entry.value?.trim()) {
      continue;
    }

    const result = await contentTranslator.translate(
      `collection.${collectionId}.${entry.key}`,
      entry.value,
      targetLocale,
      { contentType: "collection", fieldName: entry.key, locale: targetLocale },
    );

    translatedValues[entry.key] = result.translatedText;
    translationInputs.push({
      key: entry.key,
      value: result.translatedText,
      translatableContentDigest: entry.digest,
    });
  }

  // 3. Register translations with Shopify
  if (translationInputs.length > 0) {
    const registerResponse = await admin.graphql(
      `#graphql
      mutation TranslationsRegister($resourceId: ID!, $translations: [TranslationInput!]!) {
        translationsRegister(resourceId: $resourceId, translations: $translations) {
          translations {
            key
            value
            locale
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          resourceId: gid,
          translations: translationInputs.map((t) => ({
            key: t.key,
            value: t.value,
            locale: targetLocale,
            translatableContentDigest: t.translatableContentDigest,
          })),
        },
      },
    );

    await (registerResponse as { json: () => Promise<unknown> }).json();
  }

  return {
    id: gid,
    title: translatedValues["title"] ?? "",
    description: translatedValues["description"] ?? "",
    handle: translatedValues["handle"] ?? "",
    locale: targetLocale,
  };
}

// ---------------------------------------------------------------------------
// bulkTranslateCollections
// ---------------------------------------------------------------------------

/**
 * Translate multiple collections into the same target locale.
 *
 * @param collectionIds - Array of collection GIDs or numeric IDs.
 * @param targetLocale  - BCP-47 locale code.
 * @param admin         - Shopify Admin GraphQL client.
 */
export async function bulkTranslateCollections(
  collectionIds: string[],
  targetLocale: string,
  admin: { graphql: (query: string, options?: { variables?: Record<string, unknown> }) => Promise<{ json: () => Promise<unknown> }> },
): Promise<CollectionTranslation[]> {
  const results: CollectionTranslation[] = [];

  for (const id of collectionIds) {
    try {
      const translation = await translateCollection(id, targetLocale, admin);
      results.push(translation);
    } catch (error) {
      // Log and continue so one failure doesn't abort the whole batch
      console.error(`[collections] Failed to translate collection ${id}:`, error);
      results.push({
        id: normalizeGid(id, "Collection"),
        title: "",
        description: "",
        handle: "",
        locale: targetLocale,
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeGid(id: string, type: string): string {
  if (id.startsWith("gid://")) {
    return id;
  }
  return `gid://shopify/${type}/${id}`;
}
