/**
 * Judge.me Reviews Integration
 * T0014: Integrations - Shopify Ecosystem & Third-Party Apps
 *
 * Fetches reviews from Judge.me and provides translation utilities.
 */

export interface JudgeMeReview {
  id: string;
  productId: string;
  productHandle: string;
  author: string;
  email?: string;
  rating: number;
  title?: string;
  body: string;
  createdAt: string;
  locale?: string;
  verified?: boolean;
}

export interface JudgeMeTranslatedReview extends JudgeMeReview {
  originalTitle?: string;
  originalBody: string;
  translatedLocale: string;
}

export interface JudgeMeApiConfig {
  apiToken: string;
  shopDomain: string;
  /** Base URL override for testing */
  baseUrl?: string;
}

export interface JudgeMeFetchOptions {
  productHandle?: string;
  page?: number;
  perPage?: number;
  minRating?: number;
}

const DEFAULT_BASE_URL = 'https://judge.me/api/v1';

/**
 * Fetch reviews for a shop from the Judge.me public API.
 * Returns raw review objects; call translateJudgeMeReview on each as needed.
 */
export async function fetchJudgeMeReviews(
  config: JudgeMeApiConfig,
  options: JudgeMeFetchOptions = {}
): Promise<JudgeMeReview[]> {
  const { apiToken, shopDomain, baseUrl = DEFAULT_BASE_URL } = config;
  const { productHandle, page = 1, perPage = 50, minRating } = options;

  const params = new URLSearchParams({
    api_token: apiToken,
    shop_domain: shopDomain,
    page: String(page),
    per_page: String(perPage),
  });

  if (productHandle) params.set('product_handle', productHandle);

  const url = `${baseUrl}/reviews?${params.toString()}`;

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Judge.me API error ${response.status}: ${response.statusText}`);
  }

  const data = (await response.json()) as {
    reviews?: Array<{
      id: number;
      product_handle: string;
      reviewer: { name: string; email?: string };
      rating: number;
      title?: string;
      body: string;
      created_at: string;
      verified: boolean;
    }>;
  };

  const reviews: JudgeMeReview[] = (data.reviews ?? [])
    .filter((r) => !minRating || r.rating >= minRating)
    .map((r) => ({
      id: String(r.id),
      productId: r.product_handle,
      productHandle: r.product_handle,
      author: r.reviewer.name,
      email: r.reviewer.email,
      rating: r.rating,
      title: r.title,
      body: r.body,
      createdAt: r.created_at,
      verified: r.verified,
    }));

  return reviews;
}

/**
 * Translate a single Judge.me review into a target locale.
 * The placeholder implementation prefixes text; replace with a real translation engine.
 */
export async function translateJudgeMeReview(
  review: JudgeMeReview,
  targetLocale: string
): Promise<JudgeMeTranslatedReview> {
  return {
    ...review,
    originalBody: review.body,
    originalTitle: review.title,
    title: review.title ? `[${targetLocale}] ${review.title}` : undefined,
    body: `[${targetLocale}] ${review.body}`,
    translatedLocale: targetLocale,
  };
}

/**
 * Translate multiple reviews in a batch.
 */
export async function translateJudgeMeReviews(
  reviews: JudgeMeReview[],
  targetLocale: string
): Promise<JudgeMeTranslatedReview[]> {
  return Promise.all(reviews.map((r) => translateJudgeMeReview(r, targetLocale)));
}

/**
 * Detect the locale of a review body using a simple heuristic.
 * In production, replace with a language-detection library.
 */
export function detectReviewLocale(body: string): string {
  const rtlPattern = /[\u0600-\u06FF\u0590-\u05FF]/;
  if (rtlPattern.test(body)) {
    // Arabic or Hebrew
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(body) ? 'ar' : 'he';
  }
  return 'en';
}

/**
 * Filter reviews that are not yet translated for a given locale.
 */
export function getUntranslatedReviews(
  reviews: JudgeMeReview[],
  targetLocale: string
): JudgeMeReview[] {
  const baseLocale = targetLocale.split('-')[0]?.toLowerCase();
  return reviews.filter((r) => {
    const reviewLocale = (r.locale ?? detectReviewLocale(r.body)).split('-')[0]?.toLowerCase();
    return reviewLocale !== baseLocale;
  });
}
