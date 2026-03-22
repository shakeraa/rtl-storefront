import {
  getOptionNameTranslation,
  getOptionValueTranslation,
} from "./common-options";
import type {
  ProductOption,
  ProductVariant,
  TranslatedProductOption,
  TranslatedVariant,
  VariantTranslationConfig,
} from "./types";

/**
 * Translates product options (names + values) for the target locale.
 *
 * Uses the common-options dictionary as a fast path. For option names or
 * values that are not in the dictionary, the original text is preserved
 * as-is -- the caller (route level) is responsible for wiring in the
 * translation engine for those cases.
 */
export async function translateProductOptions(
  options: ProductOption[],
  config: VariantTranslationConfig,
): Promise<TranslatedProductOption[]> {
  const { targetLocale } = config;

  return options.map((option) => {
    const translatedName =
      getOptionNameTranslation(option.name, targetLocale) ?? option.name;

    const translatedValues = option.values.map((value) => ({
      original: value,
      translated:
        getOptionValueTranslation(value, targetLocale) ?? value,
    }));

    return {
      id: option.id,
      originalName: option.name,
      translatedName,
      values: translatedValues,
    };
  });
}

/**
 * Builds translated variants from previously-translated options.
 *
 * SKU and barcode fields are ALWAYS preserved regardless of config flags --
 * these are inventory identifiers and must never be translated.
 */
export async function translateVariants(
  variants: ProductVariant[],
  translatedOptions: TranslatedProductOption[],
  config: VariantTranslationConfig,
): Promise<TranslatedVariant[]> {
  return variants.map((variant) => {
    const translatedTitle = translateVariantTitle(
      variant.title,
      translatedOptions,
    );

    const translatedMetafields =
      config.translateMetafields && variant.metafields
        ? variant.metafields.map((mf) => ({ ...mf }))
        : undefined;

    return {
      id: variant.id,
      originalTitle: variant.title,
      translatedTitle,
      sku: variant.sku, // NEVER translated
      barcode: variant.barcode, // NEVER translated
      price: variant.price,
      options: variant.options,
      translatedMetafields,
    };
  });
}

/**
 * Rebuilds a variant title from translated option values.
 *
 * Shopify variant titles follow the pattern "Value1 / Value2 / Value3".
 * This function splits on that separator, looks up each segment in the
 * translated options, and reassembles the title.
 */
export function translateVariantTitle(
  title: string,
  translatedOptions: TranslatedProductOption[],
): string {
  const SEPARATOR = " / ";
  const segments = title.split(SEPARATOR);

  // Build a lookup: original value -> translated value across all options
  const valueMap = new Map<string, string>();
  for (const option of translatedOptions) {
    for (const { original, translated } of option.values) {
      valueMap.set(original, translated);
    }
  }

  const translatedSegments = segments.map(
    (segment) => valueMap.get(segment.trim()) ?? segment,
  );

  return translatedSegments.join(SEPARATOR);
}
