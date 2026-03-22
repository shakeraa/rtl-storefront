/**
 * Webhook Handler — Product & Collection Sync (T0008)
 *
 * Handles Shopify webhooks for PRODUCTS_CREATE, PRODUCTS_UPDATE, and
 * COLLECTIONS_UPDATE.  When triggered, this module auto-translates the
 * affected resource into all configured target locales.
 *
 * Note: HMAC validation is handled upstream by the Shopify Remix package.
 * These functions only perform the business logic after authentication.
 */

import { contentTranslator } from "../content-translator/index";
import { AUTO_TRANSLATE_ON_WEBHOOK, WEBHOOK_RETRY_ATTEMPTS } from "../content/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ShopifyProductPayload {
  id: number;
  title?: string;
  body_html?: string;
  handle?: string;
  vendor?: string;
  product_type?: string;
  tags?: string;
  variants?: Array<{ id: number; title: string }>;
}

interface ShopifyCollectionPayload {
  id: number;
  title?: string;
  body_html?: string;
  handle?: string;
}

// ---------------------------------------------------------------------------
// Auto-translation locale configuration
// ---------------------------------------------------------------------------

/**
 * Returns the list of locales to auto-translate into for a given shop.
 * In production this would be fetched from the database per-shop settings.
 */
function getAutoTranslateLocales(_shop: string): string[] {
  return ["ar", "he"];
}

// ---------------------------------------------------------------------------
// handleProductCreate
// ---------------------------------------------------------------------------

/**
 * Triggered when a new product is created in Shopify.
 *
 * @param shop    - The shop domain (e.g. "my-store.myshopify.com").
 * @param payload - The raw webhook payload from Shopify.
 */
export async function handleProductCreate(
  shop: string,
  payload: ShopifyProductPayload,
): Promise<void> {
  if (!AUTO_TRANSLATE_ON_WEBHOOK) {
    return;
  }

  const productGid = `gid://shopify/Product/${payload.id}`;
  const locales = getAutoTranslateLocales(shop);

  await translateProductPayload(productGid, payload, locales);
}

// ---------------------------------------------------------------------------
// handleProductUpdate
// ---------------------------------------------------------------------------

/**
 * Triggered when an existing product is updated in Shopify.
 *
 * @param shop    - The shop domain.
 * @param payload - The raw webhook payload from Shopify.
 */
export async function handleProductUpdate(
  shop: string,
  payload: ShopifyProductPayload,
): Promise<void> {
  if (!AUTO_TRANSLATE_ON_WEBHOOK) {
    return;
  }

  const productGid = `gid://shopify/Product/${payload.id}`;
  const locales = getAutoTranslateLocales(shop);

  // Invalidate cached translations so they are refreshed
  contentTranslator.invalidateCache(`product.${productGid}`);

  await translateProductPayload(productGid, payload, locales);
}

// ---------------------------------------------------------------------------
// handleCollectionUpdate
// ---------------------------------------------------------------------------

/**
 * Triggered when a collection is updated in Shopify.
 *
 * @param shop    - The shop domain.
 * @param payload - The raw webhook payload from Shopify.
 */
export async function handleCollectionUpdate(
  shop: string,
  payload: ShopifyCollectionPayload,
): Promise<void> {
  if (!AUTO_TRANSLATE_ON_WEBHOOK) {
    return;
  }

  const collectionGid = `gid://shopify/Collection/${payload.id}`;
  const locales = getAutoTranslateLocales(shop);

  contentTranslator.invalidateCache(`collection.${collectionGid}`);

  await translateCollectionPayload(collectionGid, payload, locales);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function translateProductPayload(
  productGid: string,
  payload: ShopifyProductPayload,
  locales: string[],
): Promise<void> {
  const fieldsToTranslate: Array<{ key: string; value: string }> = [
    { key: "title", value: payload.title ?? "" },
    { key: "body_html", value: payload.body_html ?? "" },
    { key: "handle", value: payload.handle ?? "" },
    { key: "vendor", value: payload.vendor ?? "" },
    { key: "product_type", value: payload.product_type ?? "" },
  ].filter((f) => f.value.trim().length > 0);

  for (const locale of locales) {
    await withRetry(WEBHOOK_RETRY_ATTEMPTS, async () => {
      for (const field of fieldsToTranslate) {
        await contentTranslator.translate(
          `product.${productGid}.${field.key}`,
          field.value,
          locale,
          { contentType: "product", fieldName: field.key, locale },
        );
      }
    });
  }
}

async function translateCollectionPayload(
  collectionGid: string,
  payload: ShopifyCollectionPayload,
  locales: string[],
): Promise<void> {
  const fieldsToTranslate: Array<{ key: string; value: string }> = [
    { key: "title", value: payload.title ?? "" },
    { key: "body_html", value: payload.body_html ?? "" },
    { key: "handle", value: payload.handle ?? "" },
  ].filter((f) => f.value.trim().length > 0);

  for (const locale of locales) {
    await withRetry(WEBHOOK_RETRY_ATTEMPTS, async () => {
      for (const field of fieldsToTranslate) {
        await contentTranslator.translate(
          `collection.${collectionGid}.${field.key}`,
          field.value,
          locale,
          { contentType: "collection", fieldName: field.key, locale },
        );
      }
    });
  }
}

/**
 * Retry a function up to `attempts` times on failure.
 */
async function withRetry<T>(attempts: number, fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`[webhook-handler] Attempt ${i + 1}/${attempts} failed:`, error);
    }
  }

  throw lastError;
}
