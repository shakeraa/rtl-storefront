import { createJob } from "./queue";
import type { TranslationJob } from "./types";

const DEFAULT_SOURCE_LOCALE = "en";
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_PRIORITY = 5;

export function syncResource(
  shop: string,
  resourceType: string,
  resourceId: string,
  targetLocales: string[],
): TranslationJob {
  return createJob({
    shop,
    resourceType,
    resourceId,
    sourceLocale: DEFAULT_SOURCE_LOCALE,
    targetLocales,
    priority: DEFAULT_PRIORITY,
    maxRetries: DEFAULT_MAX_RETRIES,
  });
}

export function bulkSync(
  shop: string,
  resources: Array<{ type: string; id: string }>,
  targetLocales: string[],
): TranslationJob[] {
  return resources.map((resource) =>
    createJob({
      shop,
      resourceType: resource.type,
      resourceId: resource.id,
      sourceLocale: DEFAULT_SOURCE_LOCALE,
      targetLocales,
      priority: DEFAULT_PRIORITY,
      maxRetries: DEFAULT_MAX_RETRIES,
    }),
  );
}

/**
 * Returns resources that have not yet been translated for the given locale.
 *
 * This is a stub implementation. A production version would query the Shopify
 * Admin API (e.g., `translatableResources`) to compare available translations
 * against the requested locale.
 */
export function getUntranslatedResources(
  _shop: string,
  locale: string,
): Array<{ resourceType: string; resourceId: string }> {
  // Mock implementation: returns sample resources that need translation
  // based on the target locale. A production version would query the Shopify
  // Admin API (translatableResources) and filter by missing translations.
  const baseResources = [
    { resourceType: "Product", resourceId: "gid://shopify/Product/1001" },
    { resourceType: "Product", resourceId: "gid://shopify/Product/1002" },
    { resourceType: "Product", resourceId: "gid://shopify/Product/1003" },
    { resourceType: "Collection", resourceId: "gid://shopify/Collection/2001" },
    { resourceType: "Collection", resourceId: "gid://shopify/Collection/2002" },
    { resourceType: "Page", resourceId: "gid://shopify/Page/3001" },
    { resourceType: "Page", resourceId: "gid://shopify/Page/3002" },
  ];

  // Vary the set by locale to simulate different translation coverage
  if (locale.startsWith("ar")) {
    return baseResources;
  }
  if (locale.startsWith("he")) {
    return baseResources.slice(0, 5);
  }
  // Other locales: fewer missing translations
  return baseResources.slice(0, 3);
}
