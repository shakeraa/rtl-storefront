import { getTextDirection } from "../../utils/rtl";
import { getCartLabels, getCheckoutLabels } from "./labels";
import type {
  CartTranslationConfig,
  CartTranslationInput,
  CheckoutTranslationInput,
  TranslatedCart,
  TranslatedCheckout,
} from "./types";

/**
 * Translates cart content and labels for the target locale.
 * Line item titles should already be translated via the translation engine;
 * this service handles cart-specific UI labels and structural adjustments.
 */
export function translateCart(
  config: CartTranslationConfig,
  input: CartTranslationInput,
): TranslatedCart {
  const labels = getCartLabels(config.targetLocale);
  const direction = getTextDirection(config.targetLocale);

  // Apply custom label overrides if provided
  const mergedLabels = input.customLabels
    ? { ...labels, ...pickValidLabels(input.customLabels, labels) }
    : labels;

  return {
    lineItems: input.lineItems.map((item) => ({
      ...item,
      properties: item.properties?.map((prop) => ({
        key: prop.key,
        value: prop.value,
      })),
    })),
    labels: mergedLabels,
    direction,
    locale: config.targetLocale,
  };
}

/**
 * Translates checkout labels for the target locale.
 * Shipping/payment method labels should already be translated;
 * this service provides the surrounding UI labels.
 */
export function translateCheckout(
  config: CartTranslationConfig,
  input: CheckoutTranslationInput,
): TranslatedCheckout {
  const labels = getCheckoutLabels(config.targetLocale);
  const direction = getTextDirection(config.targetLocale);

  const mergedLabels = input.customLabels
    ? { ...labels, ...pickValidLabels(input.customLabels, labels) }
    : labels;

  return {
    shippingMethods: input.shippingMethods,
    paymentMethods: input.paymentMethods,
    labels: mergedLabels,
    direction,
    locale: config.targetLocale,
  };
}

/**
 * Formats a price string for the target locale.
 * Handles currency symbol position (before/after) based on locale conventions.
 */
export function formatPrice(
  amount: number,
  currencyCode: string,
  locale: string,
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

/**
 * Formats shipping cost, returning "Free" label when cost is zero.
 */
export function formatShippingCost(
  amount: number,
  currencyCode: string,
  locale: string,
): string {
  if (amount === 0) {
    const labels = getCartLabels(locale);
    return labels.freeShipping;
  }
  return formatPrice(amount, currencyCode, locale);
}

function pickValidLabels<T extends Record<string, string>>(
  overrides: Record<string, string>,
  defaults: T,
): Partial<T> {
  const result: Partial<T> = {};
  for (const key of Object.keys(defaults)) {
    if (key in overrides && overrides[key]) {
      (result as Record<string, string>)[key] = overrides[key];
    }
  }
  return result;
}
