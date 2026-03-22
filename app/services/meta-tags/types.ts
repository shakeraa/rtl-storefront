export interface MetaTagSet {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: "summary" | "summary_large_image" | "player";
  canonicalUrl?: string;
  alternateUrls?: Array<{ locale: string; url: string }>;
}

export interface MetaTranslationInput {
  sourceLocale: string;
  targetLocale: string;
  resourceType: "product" | "collection" | "page" | "blog_post" | "home";
  resourceId?: string;
  meta: MetaTagSet;
}

export interface TranslatedMetaTags {
  original: MetaTagSet;
  translated: MetaTagSet;
  locale: string;
  direction: "rtl" | "ltr";
  warnings: MetaWarning[];
  seoScore: number;
}

export interface MetaWarning {
  field: string;
  type: "too_long" | "too_short" | "missing" | "truncated";
  message: string;
  limit?: number;
  actual?: number;
}

export interface SEOLimits {
  titleMin: number;
  titleMax: number;
  descriptionMin: number;
  descriptionMax: number;
  ogTitleMax: number;
  ogDescriptionMax: number;
}

export interface SEOScoreBreakdown {
  titleScore: number;
  descriptionScore: number;
  ogTagsScore: number;
  twitterCardsScore: number;
  alternateUrlsScore: number;
  totalScore: number;
}
