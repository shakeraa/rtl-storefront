/**
 * API v1 — Translations (T0020)
 *
 * GET  /api/v1/translations?resourceType=product&resourceId=123&locale=ar
 * POST /api/v1/translations  { resourceType, resourceId, locale, translations }
 */

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import {
  type TranslatableResourceType,
  getAllTranslatableFields,
} from "../services/content-translation";

// ---------------------------------------------------------------------------
// GET loader
// ---------------------------------------------------------------------------

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);

  const url = new URL(request.url);
  const resourceType = url.searchParams.get("resourceType") as TranslatableResourceType | null;
  const resourceId = url.searchParams.get("resourceId");
  const locale = url.searchParams.get("locale");

  if (!resourceType || !resourceId) {
    return json(
      { error: "Missing required query parameters: resourceType, resourceId" },
      { status: 400 },
    );
  }

  // Get all translatable field definitions for the resource type
  const fields = getAllTranslatableFields(resourceType, resourceId);

  // Fetch existing translations from Shopify
  const response = await admin.graphql(
    `#graphql
    query GetTranslations($resourceId: ID!, $locale: String!) {
      translatableResource(resourceId: $resourceId) {
        resourceId
        translations(locale: $locale) {
          key
          value
          locale
          outdated
        }
        translatableContent {
          key
          value
          digest
          locale
        }
      }
    }`,
    {
      variables: {
        resourceId: `gid://shopify/${capitalize(resourceType)}/${resourceId}`,
        locale: locale ?? session.shop.split(".")[0] ?? "en",
      },
    },
  );

  const data = await response.json();

  return json({
    shop: session.shop,
    resourceType,
    resourceId,
    locale,
    fields: fields.map((f) => f.key),
    translations: data?.data?.translatableResource?.translations ?? [],
    translatableContent: data?.data?.translatableResource?.translatableContent ?? [],
  });
}

// ---------------------------------------------------------------------------
// POST action
// ---------------------------------------------------------------------------

export async function action({ request }: ActionFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const body = await request.json();
  const { resourceType, resourceId, locale, translations } = body as {
    resourceType?: string;
    resourceId?: string;
    locale?: string;
    translations?: Array<{ key: string; value: string; translatableContentDigest: string }>;
  };

  if (!resourceType || !resourceId || !locale || !translations) {
    return json(
      {
        error:
          "Missing required fields: resourceType, resourceId, locale, translations",
      },
      { status: 400 },
    );
  }

  const shopifyResourceId = `gid://shopify/${capitalize(resourceType)}/${resourceId}`;

  const response = await admin.graphql(
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
        resourceId: shopifyResourceId,
        translations: translations.map((t) => ({
          key: t.key,
          value: t.value,
          locale,
          translatableContentDigest: t.translatableContentDigest,
        })),
      },
    },
  );

  const data = await response.json();
  const result = data?.data?.translationsRegister;

  if (result?.userErrors?.length > 0) {
    return json(
      { error: "Translation registration failed", userErrors: result.userErrors },
      { status: 422 },
    );
  }

  return json({
    success: true,
    shop: session.shop,
    resourceId: shopifyResourceId,
    locale,
    translations: result?.translations ?? [],
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
