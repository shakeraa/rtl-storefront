// ---------------------------------------------------------------------------
// Third-Party App Integrations (T0032 + T0033)
// Reviews apps, page builders, SEO, marketing
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AppType = "reviews" | "page_builder" | "seo" | "marketing";

export interface ThirdPartyApp {
  id: string;
  name: string;
  type: AppType;
  webhookUrl?: string;
  apiEndpoint?: string;
}

export interface Review {
  rating: number;
  title: string;
  body: string;
  locale: string;
}

export interface ReviewAppIntegration {
  appId: string;
  getReviews: (productId: string) => Promise<Review[]>;
  translateReview: (review: Review, targetLocale: string) => Promise<Review>;
}

export interface PageSection {
  sectionId: string;
  content: string;
  type: string;
}

export interface PageBuilderIntegration {
  appId: string;
  getPageContent: (pageId: string) => Promise<PageSection[]>;
  translateSection: (
    section: PageSection,
    targetLocale: string,
  ) => Promise<PageSection>;
}

export interface AppDescriptor {
  id: string;
  name: string;
  apiPattern: string;
}

export interface AppTranslationField {
  key: string;
  value: string;
  translatable: boolean;
}

// ---------------------------------------------------------------------------
// Supported apps registries
// ---------------------------------------------------------------------------

export const SUPPORTED_REVIEW_APPS: AppDescriptor[] = [
  { id: "judge-me", name: "Judge.me", apiPattern: "https://judge.me/api/v1" },
  { id: "loox", name: "Loox", apiPattern: "https://api.loox.io/v1" },
  { id: "stamped", name: "Stamped", apiPattern: "https://stamped.io/api/v2" },
  { id: "yotpo", name: "Yotpo", apiPattern: "https://api.yotpo.com/v1" },
  { id: "rivyo", name: "Rivyo", apiPattern: "https://api.rivyo.com/v1" },
];

export const SUPPORTED_PAGE_BUILDERS: AppDescriptor[] = [
  { id: "shogun", name: "Shogun", apiPattern: "https://api.getshogun.com/v1" },
  {
    id: "gempages",
    name: "GemPages",
    apiPattern: "https://api.gempages.net/v1",
  },
  {
    id: "pagefly",
    name: "PageFly",
    apiPattern: "https://api.pagefly.io/v1",
  },
  { id: "zipify", name: "Zipify", apiPattern: "https://api.zipify.com/v1" },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Detect which third-party apps are installed for a given shop.
 * Stub: returns empty array. Requires Shopify Admin API integration.
 */
export function detectInstalledApps(_shop: string): string[] {
  // TODO: Query Shopify Admin API for installed apps and match against
  // SUPPORTED_REVIEW_APPS and SUPPORTED_PAGE_BUILDERS
  return [];
}

/**
 * Get translation fields for a specific third-party app and resource.
 * Stub: returns empty array. Requires app-specific API integration.
 */
export function getAppTranslationFields(
  _appId: string,
  _resourceId: string,
): AppTranslationField[] {
  // TODO: Call the app's API to retrieve translatable content fields
  return [];
}

/**
 * Build the webhook URL that a third-party app should POST to
 * when content changes and needs re-translation.
 */
export function buildIntegrationWebhookUrl(
  shop: string,
  appId: string,
): string {
  const shopDomain = shop.replace(/\.myshopify\.com$/, "");
  return `https://${shopDomain}.myshopify.com/api/rtl-storefront/webhooks/integrations/${appId}`;
}

/**
 * Create a review app integration stub.
 * Returns an integration object with placeholder async methods.
 */
export function createReviewAppIntegration(
  appId: string,
): ReviewAppIntegration {
  return {
    appId,
    getReviews: async (_productId: string): Promise<Review[]> => {
      // TODO: Wire to actual review app API
      return [];
    },
    translateReview: async (
      review: Review,
      targetLocale: string,
    ): Promise<Review> => {
      // Stub: returns the review as-is with updated locale
      return { ...review, locale: targetLocale };
    },
  };
}

/**
 * Create a page builder integration stub.
 * Returns an integration object with placeholder async methods.
 */
export function createPageBuilderIntegration(
  appId: string,
): PageBuilderIntegration {
  return {
    appId,
    getPageContent: async (_pageId: string): Promise<PageSection[]> => {
      // TODO: Wire to actual page builder API
      return [];
    },
    translateSection: async (
      section: PageSection,
      _targetLocale: string,
    ): Promise<PageSection> => {
      // Stub: returns the section as-is
      return { ...section };
    },
  };
}
