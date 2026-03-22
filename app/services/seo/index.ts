/**
 * SEO Service Module
 * 
 * Comprehensive SEO functionality including:
 * - T0007: Multilingual SEO infrastructure
 * - T0038: Translated URL slugs
 * - T0074: Product Schema.org Translation
 * - T0075: Breadcrumb Schema Translation
 * - T0076: SEO Audit Tool
 * - T0077: Multi-language XML Sitemap
 * - T0078: Language-specific Robots.txt
 */

// Export from seo-infrastructure
export {
  type SEOConfig,
  generateHreflangMeta,
  generateCanonical,
  transliterateToSlug,
  buildTranslatedUrl,
  generateLocalizedBreadcrumbs,
  generateRobotsTxt,
  getRobotsHeaders,
  TRANSLITERATION_MAP,
} from "../seo-infrastructure";

// Export meta tag functionality
export type {
  LocaleMetaTags,
  MultilingualSEOConfig,
  SEOValidationResult,
} from "./meta-tags";

export {
  generateMetaTagsForLocale,
  getMultilingualSEOConfig,
  validateSEOSetup,
} from "./meta-tags";

// Export structured data
export {
  generateProductSchema,
  generateBreadcrumbSchema,
  generateOrganizationSchema,
} from "./structured-data";

// Export hreflang
export type {
  HreflangTag,
} from "./hreflang";

export {
  generateHreflangTags,
  getXDefaultUrl,
} from "./hreflang";

// Export sitemap
export type {
  SitemapUrlEntry,
  GeneratedSitemap,
} from "./sitemap";

export {
  generateSitemap,
} from "./sitemap";

// Export URL translator
export {
  translateUrlSlug,
  generateLocalizedUrl,
} from "./url-translator";

// Export audit functionality
export type {
  AuditPage,
  HreflangIssue,
  MetaTagIssue,
  BrokenLink,
  DuplicateContentGroup,
  LanguageScore,
  SEOAuditResult,
  AuditOptions,
} from "./audit";

export {
  runSEOAudit,
  auditHreflang,
  auditMetaTags,
  auditBrokenLinks,
  auditDuplicateContent,
  calculateLanguageScores,
  calculateOverallScore,
  generateRecommendations,
  quickAuditPage,
} from "./audit";

// Export robots.txt functionality
export type {
  RobotsTxtConfig,
  UserAgentRules,
  GeneratedRobotsTxt,
} from "./robots-txt";

export {
  generateLanguageSpecificRobotsTxt,
  generateMultiUserAgentRobotsTxt,
  generateRobotsTxtWithCrawlDelay,
  generateBotSpecificRobotsTxt,
  validateRobotsTxt,
  parseRobotsTxt,
  isUrlAllowed,
  createRobotsTxtBuilder,
} from "./robots-txt";

// Export sitemap manager
export type {
  SitemapPageEntry,
  SitemapManagerConfig,
  SitemapIndexEntry,
} from "../sitemap/sitemap-manager";

export {
  SitemapManager,
  createSitemapManager,
  generateMultilingualSitemap,
  generateSitemapIndexWithChunks,
} from "../sitemap/sitemap-manager";

// Re-export sitemap types and functions
export type {
  SitemapUrl,
  SitemapConfig,
  SitemapGeneratorInput,
} from "../sitemap";

export {
  generateSitemapXml,
  generateSitemapIndex,
} from "../sitemap";
