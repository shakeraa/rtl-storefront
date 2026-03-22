import type { MetaTagSet, MetaWarning, SEOLimits, SEOScoreBreakdown } from "./types";

const DEFAULT_SEO_LIMITS: SEOLimits = {
  titleMin: 30,
  titleMax: 60,
  descriptionMin: 120,
  descriptionMax: 160,
  ogTitleMax: 90,
  ogDescriptionMax: 200,
};

/**
 * Validate meta tags against SEO best practices and return warnings.
 */
export function validateMetaTags(
  meta: MetaTagSet,
  limits: SEOLimits = DEFAULT_SEO_LIMITS,
): MetaWarning[] {
  const warnings: MetaWarning[] = [];

  if (!meta.title) {
    warnings.push({ field: "title", type: "missing", message: "Meta title is missing" });
  } else {
    if (meta.title.length < limits.titleMin) {
      warnings.push({
        field: "title",
        type: "too_short",
        message: `Title is too short (${meta.title.length}/${limits.titleMin} min)`,
        limit: limits.titleMin,
        actual: meta.title.length,
      });
    }
    if (meta.title.length > limits.titleMax) {
      warnings.push({
        field: "title",
        type: "too_long",
        message: `Title is too long (${meta.title.length}/${limits.titleMax} max)`,
        limit: limits.titleMax,
        actual: meta.title.length,
      });
    }
  }

  if (!meta.description) {
    warnings.push({ field: "description", type: "missing", message: "Meta description is missing" });
  } else {
    if (meta.description.length < limits.descriptionMin) {
      warnings.push({
        field: "description",
        type: "too_short",
        message: `Description is too short (${meta.description.length}/${limits.descriptionMin} min)`,
        limit: limits.descriptionMin,
        actual: meta.description.length,
      });
    }
    if (meta.description.length > limits.descriptionMax) {
      warnings.push({
        field: "description",
        type: "too_long",
        message: `Description is too long (${meta.description.length}/${limits.descriptionMax} max)`,
        limit: limits.descriptionMax,
        actual: meta.description.length,
      });
    }
  }

  if (meta.ogTitle && meta.ogTitle.length > limits.ogTitleMax) {
    warnings.push({
      field: "ogTitle",
      type: "too_long",
      message: `OG title is too long (${meta.ogTitle.length}/${limits.ogTitleMax} max)`,
      limit: limits.ogTitleMax,
      actual: meta.ogTitle.length,
    });
  }

  if (meta.ogDescription && meta.ogDescription.length > limits.ogDescriptionMax) {
    warnings.push({
      field: "ogDescription",
      type: "too_long",
      message: `OG description is too long (${meta.ogDescription.length}/${limits.ogDescriptionMax} max)`,
      limit: limits.ogDescriptionMax,
      actual: meta.ogDescription.length,
    });
  }

  return warnings;
}

/**
 * Calculate an SEO score (0-100) based on meta tag completeness and quality.
 */
export function calculateSEOScore(
  meta: MetaTagSet,
  limits: SEOLimits = DEFAULT_SEO_LIMITS,
): SEOScoreBreakdown {
  let titleScore = 0;
  if (meta.title) {
    titleScore = 10;
    if (meta.title.length >= limits.titleMin && meta.title.length <= limits.titleMax) {
      titleScore = 25;
    } else if (meta.title.length >= limits.titleMin) {
      titleScore = 15;
    }
  }

  let descriptionScore = 0;
  if (meta.description) {
    descriptionScore = 10;
    if (meta.description.length >= limits.descriptionMin && meta.description.length <= limits.descriptionMax) {
      descriptionScore = 25;
    } else if (meta.description.length >= limits.descriptionMin) {
      descriptionScore = 15;
    }
  }

  let ogTagsScore = 0;
  if (meta.ogTitle) ogTagsScore += 5;
  if (meta.ogDescription) ogTagsScore += 5;
  if (meta.ogImage) ogTagsScore += 5;
  if (meta.ogType) ogTagsScore += 5;

  let twitterCardsScore = 0;
  if (meta.twitterTitle) twitterCardsScore += 3;
  if (meta.twitterDescription) twitterCardsScore += 3;
  if (meta.twitterImage) twitterCardsScore += 2;
  if (meta.twitterCard) twitterCardsScore += 2;

  let alternateUrlsScore = 0;
  if (meta.canonicalUrl) alternateUrlsScore += 5;
  if (meta.alternateUrls && meta.alternateUrls.length > 0) alternateUrlsScore += 5;

  const totalScore = titleScore + descriptionScore + ogTagsScore + twitterCardsScore + alternateUrlsScore;

  return {
    titleScore,
    descriptionScore,
    ogTagsScore,
    twitterCardsScore,
    alternateUrlsScore,
    totalScore,
  };
}

export { DEFAULT_SEO_LIMITS };
