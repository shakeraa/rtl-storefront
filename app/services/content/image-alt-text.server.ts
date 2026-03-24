import { TranslationEngine } from "../translation/engine";

interface ImageAltText {
  imageId: string;
  imageUrl: string;
  altText: string;
  locale?: string;
}

interface TranslatedAltText extends ImageAltText {
  translatedAltText: string;
  targetLocale: string;
  provider: string;
}

/**
 * Translates image alt-text for a product or collection.
 * Critical for SEO (Google Images) and accessibility (screen readers) in RTL markets.
 */
export async function translateImageAltTexts(
  images: ImageAltText[],
  targetLocale: string,
  shop: string,
  options?: {
    sourceLocale?: string;
    provider?: string;
  }
): Promise<TranslatedAltText[]> {
  const engine = new TranslationEngine();
  const sourceLocale = options?.sourceLocale || "en";
  const results: TranslatedAltText[] = [];

  for (const image of images) {
    if (!image.altText || image.altText.trim() === "") {
      // Skip images with no alt text — can't translate nothing
      results.push({
        ...image,
        translatedAltText: "",
        targetLocale,
        provider: "skipped",
      });
      continue;
    }

    try {
      const result = await engine.translate({
        text: image.altText,
        sourceLocale,
        targetLocale,
        shop,
        context: "image_alt_text",
        preferredProvider: options?.provider as Parameters<typeof engine.translate>[0]["preferredProvider"],
      });

      results.push({
        ...image,
        translatedAltText: result.translatedText,
        targetLocale,
        provider: result.provider,
      });
    } catch (error) {
      // On failure, keep original alt text rather than losing it
      console.error(`Failed to translate alt text for image ${image.imageId}:`, error);
      results.push({
        ...image,
        translatedAltText: image.altText,
        targetLocale,
        provider: "fallback",
      });
    }
  }

  return results;
}

/**
 * Extract image alt texts from a Shopify product via GraphQL response.
 */
export function extractProductImageAlts(product: {
  images?: { edges?: Array<{ node: { id: string; url: string; altText?: string } }> };
}): ImageAltText[] {
  if (!product.images?.edges) return [];

  return product.images.edges.map(({ node }) => ({
    imageId: node.id,
    imageUrl: node.url,
    altText: node.altText || "",
  }));
}

/**
 * Extract image alt texts from a Shopify collection.
 */
export function extractCollectionImageAlt(collection: {
  image?: { id: string; url: string; altText?: string };
}): ImageAltText[] {
  if (!collection.image) return [];

  return [{
    imageId: collection.image.id,
    imageUrl: collection.image.url,
    altText: collection.image.altText || "",
  }];
}

/**
 * Generate SEO-friendly alt text for images missing alt text.
 * Uses product title + variant info as a fallback.
 */
export function generateFallbackAltText(
  productTitle: string,
  imageIndex: number,
  variant?: string
): string {
  if (variant) {
    return `${productTitle} - ${variant}`;
  }
  if (imageIndex === 0) {
    return productTitle;
  }
  return `${productTitle} - Image ${imageIndex + 1}`;
}

export type { ImageAltText, TranslatedAltText };
