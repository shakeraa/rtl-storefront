/**
 * Collection Translation API Route (T0008)
 *
 * GET  /api/translations/collections?collectionId=<id>&locale=<locale>
 *   → Returns existing translations and translatable content for a collection.
 *
 * POST /api/translations/collections
 *   Body: { collectionId: string; locale: string; autoTranslate?: boolean }
 *   → Triggers AI translation for the collection and registers with Shopify.
 */

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { contentTranslator } from "../services/content-translator/index";
import { getCollectionTranslatableFields } from "../services/content-translation";

// ---------------------------------------------------------------------------
// GET loader — fetch existing translations
// ---------------------------------------------------------------------------

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);

  const url = new URL(request.url);
  const collectionId = url.searchParams.get("collectionId");
  const locale = url.searchParams.get("locale");

  if (!collectionId) {
    return json(
      { error: "Missing required query parameter: collectionId" },
      { status: 400 },
    );
  }

  if (!locale) {
    return json(
      { error: "Missing required query parameter: locale" },
      { status: 400 },
    );
  }

  const gid = normalizeGid(collectionId, "Collection");

  const response = await admin.graphql(
    `#graphql
    query GetCollectionTranslations($resourceId: ID!, $locale: String!) {
      translatableResource(resourceId: $resourceId) {
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
          outdated
        }
      }
    }`,
    { variables: { resourceId: gid, locale } },
  );

  const data = await response.json() as {
    data?: {
      translatableResource?: {
        resourceId: string;
        translatableContent: Array<{ key: string; value: string; digest: string; locale: string }>;
        translations: Array<{ key: string; value: string; locale: string; outdated: boolean }>;
      };
    };
  };

  const resource = data?.data?.translatableResource;
  const fields = getCollectionTranslatableFields();

  return json({
    shop: session.shop,
    collectionId: gid,
    locale,
    fields,
    translatableContent: resource?.translatableContent ?? [],
    translations: resource?.translations ?? [],
  });
}

// ---------------------------------------------------------------------------
// POST action — trigger AI translation and register with Shopify
// ---------------------------------------------------------------------------

export async function action({ request }: ActionFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const body = await request.json() as {
    collectionId?: string;
    locale?: string;
    autoTranslate?: boolean;
  };

  const { collectionId, locale, autoTranslate = true } = body;

  if (!collectionId || !locale) {
    return json(
      { error: "Missing required fields: collectionId, locale" },
      { status: 400 },
    );
  }

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
      }
    }`,
    { variables: { id: gid, locale } },
  );

  const fetchData = await fetchResponse.json() as {
    data?: {
      translatableResource?: {
        translatableContent: Array<{ key: string; value: string; digest: string; locale: string }>;
      };
    };
  };

  const translatableContent =
    fetchData?.data?.translatableResource?.translatableContent ?? [];

  if (translatableContent.length === 0) {
    return json(
      { error: "No translatable content found for this collection" },
      { status: 404 },
    );
  }

  // 2. AI-translate each field (if autoTranslate is requested)
  const translationInputs: Array<{
    key: string;
    value: string;
    translatableContentDigest: string;
  }> = [];

  if (autoTranslate) {
    const fields = getCollectionTranslatableFields();

    for (const entry of translatableContent) {
      if (!fields.includes(entry.key) || !entry.value?.trim()) {
        continue;
      }

      const result = await contentTranslator.translate(
        `collection.${gid}.${entry.key}`,
        entry.value,
        locale,
        { contentType: "collection", fieldName: entry.key, locale },
      );

      translationInputs.push({
        key: entry.key,
        value: result.translatedText,
        translatableContentDigest: entry.digest,
      });
    }
  }

  // 3. Register translations with Shopify
  if (translationInputs.length === 0) {
    return json({
      success: true,
      shop: session.shop,
      collectionId: gid,
      locale,
      translations: [],
      message: "No fields required translation",
    });
  }

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
          locale,
          translatableContentDigest: t.translatableContentDigest,
        })),
      },
    },
  );

  const registerData = await registerResponse.json() as {
    data?: {
      translationsRegister?: {
        translations: Array<{ key: string; value: string; locale: string }>;
        userErrors: Array<{ field: string; message: string }>;
      };
    };
  };

  const result = registerData?.data?.translationsRegister;

  if (result?.userErrors && result.userErrors.length > 0) {
    return json(
      {
        error: "Translation registration failed",
        userErrors: result.userErrors,
      },
      { status: 422 },
    );
  }

  return json({
    success: true,
    shop: session.shop,
    collectionId: gid,
    locale,
    translations: result?.translations ?? [],
  });
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
