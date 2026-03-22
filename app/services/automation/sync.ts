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
  _locale: string,
): Array<{ resourceType: string; resourceId: string }> {
  // Stub: actual implementation requires Shopify API calls to enumerate
  // translatable resources and check which lack translations for the locale.
  return [];
}
