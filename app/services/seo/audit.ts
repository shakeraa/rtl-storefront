/**
 * SEO Audit Tool (T0076)
 *
 * Automated SEO audit for multilingual stores checking hreflang, tags, and issues.
 * Features:
 * - Hreflang validation
 * - Missing meta tags detection
 * - Broken links per language
 * - Duplicate content detection
 * - SEO score by language
 */

import type { SEOConfig } from "../seo-infrastructure";

export interface AuditPage {
  url: string;
  locale: string;
  title?: string;
  description?: string;
  canonical?: string;
  hreflangTags?: Array<{ locale: string; url: string }>;
  content?: string;
  statusCode?: number;
  links?: string[];
}

export interface HreflangIssue {
  type: "missing-return" | "self-referencing-missing" | "invalid-locale" | "inconsistent-url" | "missing-x-default";
  page: string;
  locale: string;
  details: string;
  severity: "error" | "warning";
}

export interface MetaTagIssue {
  type: "missing-title" | "missing-description" | "title-too-short" | "title-too-long" | "description-too-short" | "description-too-long" | "missing-canonical" | "duplicate-canonical";
  page: string;
  locale: string;
  details: string;
  severity: "error" | "warning";
}

export interface BrokenLink {
  source: string;
  target: string;
  locale: string;
  statusCode: number;
}

export interface DuplicateContentGroup {
  urls: string[];
  similarity: number;
  locales: string[];
}

export interface LanguageScore {
  locale: string;
  score: number;
  issues: number;
  warnings: number;
  passed: number;
  breakdown: {
    hreflang: number;
    metaTags: number;
    links: number;
    content: number;
  };
}

export interface SEOAuditResult {
  timestamp: string;
  config: SEOConfig;
  summary: {
    totalPages: number;
    totalLanguages: number;
    totalErrors: number;
    totalWarnings: number;
    overallScore: number;
  };
  hreflang: {
    valid: boolean;
    issues: HreflangIssue[];
  };
  metaTags: {
    valid: boolean;
    issues: MetaTagIssue[];
  };
  brokenLinks: {
    valid: boolean;
    links: BrokenLink[];
  };
  duplicateContent: {
    valid: boolean;
    groups: DuplicateContentGroup[];
  };
  scores: LanguageScore[];
  recommendations: string[];
}

export interface AuditOptions {
  /** Check for broken links */
  checkBrokenLinks?: boolean;
  /** Check for duplicate content */
  checkDuplicateContent?: boolean;
  /** Minimum similarity threshold for duplicate detection (0-1) */
  duplicateThreshold?: number;
  /** Minimum title length */
  minTitleLength?: number;
  /** Maximum title length */
  maxTitleLength?: number;
  /** Minimum description length */
  minDescriptionLength?: number;
  /** Maximum description length */
  maxDescriptionLength?: number;
}

const DEFAULT_OPTIONS: Required<AuditOptions> = {
  checkBrokenLinks: true,
  checkDuplicateContent: true,
  duplicateThreshold: 0.8,
  minTitleLength: 30,
  maxTitleLength: 60,
  minDescriptionLength: 120,
  maxDescriptionLength: 160,
};

/**
 * Run a comprehensive SEO audit
 * @param pages - Array of pages to audit
 * @param config - SEO configuration
 * @param options - Audit options
 * @returns Complete audit result
 */
export function runSEOAudit(
  pages: AuditPage[],
  config: SEOConfig,
  options: AuditOptions = {},
): SEOAuditResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const hreflangResult = auditHreflang(pages, config);
  const metaTagsResult = auditMetaTags(pages, opts);
  const brokenLinksResult = opts.checkBrokenLinks ? auditBrokenLinks(pages) : { valid: true, links: [] };
  const duplicateContentResult = opts.checkDuplicateContent 
    ? auditDuplicateContent(pages, opts.duplicateThreshold) 
    : { valid: true, groups: [] };

  const scores = calculateLanguageScores(
    pages,
    hreflangResult.issues,
    metaTagsResult.issues,
    brokenLinksResult.links,
    duplicateContentResult.groups,
  );

  const totalErrors = 
    hreflangResult.issues.filter(i => i.severity === "error").length +
    metaTagsResult.issues.filter(i => i.severity === "error").length +
    brokenLinksResult.links.length +
    duplicateContentResult.groups.length;

  const totalWarnings = 
    hreflangResult.issues.filter(i => i.severity === "warning").length +
    metaTagsResult.issues.filter(i => i.severity === "warning").length;

  const overallScore = calculateOverallScore(scores);

  const recommendations = generateRecommendations(
    hreflangResult.issues,
    metaTagsResult.issues,
    brokenLinksResult.links,
    duplicateContentResult.groups,
  );

  return {
    timestamp: new Date().toISOString(),
    config,
    summary: {
      totalPages: pages.length,
      totalLanguages: config.locales.length,
      totalErrors,
      totalWarnings,
      overallScore,
    },
    hreflang: hreflangResult,
    metaTags: metaTagsResult,
    brokenLinks: brokenLinksResult,
    duplicateContent: duplicateContentResult,
    scores,
    recommendations,
  };
}

/**
 * Audit hreflang tags for issues
 */
export function auditHreflang(
  pages: AuditPage[],
  config: SEOConfig,
): { valid: boolean; issues: HreflangIssue[] } {
  const issues: HreflangIssue[] = [];
  const pageMap = new Map(pages.map(p => [p.url, p]));

  for (const page of pages) {
    const hreflangTags = page.hreflangTags || [];

    // Check for missing self-referencing hreflang
    const hasSelfReference = hreflangTags.some(tag => tag.locale === page.locale);
    if (!hasSelfReference) {
      issues.push({
        type: "self-referencing-missing",
        page: page.url,
        locale: page.locale,
        details: `Page ${page.url} is missing self-referencing hreflang tag for locale ${page.locale}`,
        severity: "error",
      });
    }

    // Check for missing x-default
    const hasXDefault = hreflangTags.some(tag => tag.locale === "x-default");
    if (!hasXDefault) {
      issues.push({
        type: "missing-x-default",
        page: page.url,
        locale: page.locale,
        details: `Page ${page.url} is missing x-default hreflang tag`,
        severity: "warning",
      });
    }

    // Check each hreflang tag
    for (const tag of hreflangTags) {
      // Check for invalid locales
      if (tag.locale !== "x-default" && !config.locales.includes(tag.locale)) {
        issues.push({
          type: "invalid-locale",
          page: page.url,
          locale: tag.locale,
          details: `Hreflang tag references invalid locale "${tag.locale}"`,
          severity: "error",
        });
      }

      // Check for return links (bidirectional validation)
      if (tag.locale !== "x-default" && tag.locale !== page.locale) {
        const targetPage = pageMap.get(tag.url);
        if (targetPage) {
          const targetHreflangs = targetPage.hreflangTags || [];
          const hasReturnLink = targetHreflangs.some(
            t => t.locale === page.locale && t.url === page.url
          );
          if (!hasReturnLink) {
            issues.push({
              type: "missing-return",
              page: page.url,
              locale: tag.locale,
              details: `Page ${page.url} links to ${tag.url} with hreflang="${tag.locale}", but ${tag.url} doesn't link back`,
              severity: "error",
            });
          }
        }
      }
    }
  }

  return {
    valid: issues.filter(i => i.severity === "error").length === 0,
    issues,
  };
}

/**
 * Audit meta tags for issues
 */
export function auditMetaTags(
  pages: AuditPage[],
  options: Required<AuditOptions>,
): { valid: boolean; issues: MetaTagIssue[] } {
  const issues: MetaTagIssue[] = [];

  for (const page of pages) {
    // Check for missing title
    if (!page.title || page.title.trim().length === 0) {
      issues.push({
        type: "missing-title",
        page: page.url,
        locale: page.locale,
        details: `Page ${page.url} is missing title tag`,
        severity: "error",
      });
    } else {
      // Check title length
      if (page.title.length < options.minTitleLength) {
        issues.push({
          type: "title-too-short",
          page: page.url,
          locale: page.locale,
          details: `Title is too short (${page.title.length} chars, minimum ${options.minTitleLength})`,
          severity: "warning",
        });
      }
      if (page.title.length > options.maxTitleLength) {
        issues.push({
          type: "title-too-long",
          page: page.url,
          locale: page.locale,
          details: `Title is too long (${page.title.length} chars, maximum ${options.maxTitleLength})`,
          severity: "warning",
        });
      }
    }

    // Check for missing description
    if (!page.description || page.description.trim().length === 0) {
      issues.push({
        type: "missing-description",
        page: page.url,
        locale: page.locale,
        details: `Page ${page.url} is missing meta description`,
        severity: "error",
      });
    } else {
      // Check description length
      if (page.description.length < options.minDescriptionLength) {
        issues.push({
          type: "description-too-short",
          page: page.url,
          locale: page.locale,
          details: `Description is too short (${page.description.length} chars, minimum ${options.minDescriptionLength})`,
          severity: "warning",
        });
      }
      if (page.description.length > options.maxDescriptionLength) {
        issues.push({
          type: "description-too-long",
          page: page.url,
          locale: page.locale,
          details: `Description is too long (${page.description.length} chars, maximum ${options.maxDescriptionLength})`,
          severity: "warning",
        });
      }
    }

    // Check for missing canonical
    if (!page.canonical || page.canonical.trim().length === 0) {
      issues.push({
        type: "missing-canonical",
        page: page.url,
        locale: page.locale,
        details: `Page ${page.url} is missing canonical tag`,
        severity: "warning",
      });
    }
  }

  // Check for duplicate canonicals
  const canonicalMap = new Map<string, string[]>();
  for (const page of pages) {
    if (page.canonical) {
      const existing = canonicalMap.get(page.canonical) || [];
      existing.push(page.url);
      canonicalMap.set(page.canonical, existing);
    }
  }
  
  for (const [canonical, urls] of canonicalMap) {
    if (urls.length > 1) {
      for (const url of urls) {
        issues.push({
          type: "duplicate-canonical",
          page: url,
          locale: pages.find(p => p.url === url)?.locale || "unknown",
          details: `Canonical URL "${canonical}" is used by ${urls.length} pages: ${urls.join(", ")}`,
          severity: "warning",
        });
      }
    }
  }

  return {
    valid: issues.filter(i => i.severity === "error").length === 0,
    issues,
  };
}

/**
 * Audit for broken links
 */
export function auditBrokenLinks(
  pages: AuditPage[],
): { valid: boolean; links: BrokenLink[] } {
  const brokenLinks: BrokenLink[] = [];
  const pageUrls = new Set(pages.map(p => p.url));

  for (const page of pages) {
    if (!page.links) continue;

    for (const link of page.links) {
      // Check if link is internal and doesn't exist
      if (link.startsWith("/") || link.includes(page.url.split("/").slice(0, 3).join("/"))) {
        const normalizedLink = link.startsWith("http") ? link : new URL(link, page.url).href;
        
        if (!pageUrls.has(normalizedLink)) {
          // In a real implementation, we'd check the actual HTTP status
          // For now, simulate based on whether the page exists in our dataset
          const targetPage = pages.find(p => p.url === normalizedLink);
          
          if (!targetPage || targetPage.statusCode === 404) {
            brokenLinks.push({
              source: page.url,
              target: normalizedLink,
              locale: page.locale,
              statusCode: targetPage?.statusCode || 404,
            });
          }
        }
      }
    }
  }

  return {
    valid: brokenLinks.length === 0,
    links: brokenLinks,
  };
}

/**
 * Audit for duplicate content
 */
export function auditDuplicateContent(
  pages: AuditPage[],
  threshold: number,
): { valid: boolean; groups: DuplicateContentGroup[] } {
  const groups: DuplicateContentGroup[] = [];
  const processed = new Set<string>();

  for (let i = 0; i < pages.length; i++) {
    const page1 = pages[i];
    if (!page1.content || processed.has(page1.url)) continue;

    const duplicates: AuditPage[] = [page1];
    
    for (let j = i + 1; j < pages.length; j++) {
      const page2 = pages[j];
      if (!page2.content || processed.has(page2.url)) continue;

      const similarity = calculateSimilarity(page1.content, page2.content);
      
      if (similarity >= threshold) {
        duplicates.push(page2);
      }
    }

    if (duplicates.length > 1) {
      const urls = duplicates.map(p => p.url);
      const locales = [...new Set(duplicates.map(p => p.locale))];
      
      groups.push({
        urls,
        similarity: calculateSimilarity(
          duplicates[0].content!,
          duplicates[1]?.content || duplicates[0].content!
        ),
        locales,
      });

      for (const dup of duplicates) {
        processed.add(dup.url);
      }
    }
  }

  return {
    valid: groups.length === 0,
    groups,
  };
}

/**
 * Calculate language-specific SEO scores
 */
export function calculateLanguageScores(
  pages: AuditPage[],
  hreflangIssues: HreflangIssue[],
  metaTagIssues: MetaTagIssue[],
  brokenLinks: BrokenLink[],
  duplicateGroups: DuplicateContentGroup[],
): LanguageScore[] {
  const localeStats = new Map<string, { issues: number; warnings: number; passed: number }>();

  // Initialize stats for all locales
  const allLocales = [...new Set(pages.map(p => p.locale))];
  for (const locale of allLocales) {
    localeStats.set(locale, { issues: 0, warnings: 0, passed: 0 });
  }

  // Count hreflang issues
  for (const issue of hreflangIssues) {
    const stats = localeStats.get(issue.locale);
    if (stats) {
      if (issue.severity === "error") {
        stats.issues++;
      } else {
        stats.warnings++;
      }
    }
  }

  // Count meta tag issues
  for (const issue of metaTagIssues) {
    const stats = localeStats.get(issue.locale);
    if (stats) {
      if (issue.severity === "error") {
        stats.issues++;
      } else {
        stats.warnings++;
      }
    }
  }

  // Count broken links
  for (const link of brokenLinks) {
    const stats = localeStats.get(link.locale);
    if (stats) {
      stats.issues++;
    }
  }

  // Count duplicate content issues
  for (const group of duplicateGroups) {
    for (const locale of group.locales) {
      const stats = localeStats.get(locale);
      if (stats) {
        stats.issues++;
      }
    }
  }

  // Calculate passed checks (approximate based on total possible checks)
  const checksPerPage = 5; // hreflang, title, description, canonical, links
  for (const locale of allLocales) {
    const localePages = pages.filter(p => p.locale === locale);
    const totalChecks = localePages.length * checksPerPage;
    const stats = localeStats.get(locale)!;
    stats.passed = Math.max(0, totalChecks - stats.issues - stats.warnings);
  }

  // Calculate scores
  return allLocales.map(locale => {
    const stats = localeStats.get(locale)!;
    const totalChecks = stats.issues + stats.warnings + stats.passed;
    
    // Score breakdown by category
    const localeHreflangIssues = hreflangIssues.filter(i => i.locale === locale).length;
    const localeMetaIssues = metaTagIssues.filter(i => i.locale === locale).length;
    const localeBrokenLinks = brokenLinks.filter(l => l.locale === locale).length;
    const localeDuplicates = duplicateGroups.filter(g => g.locales.includes(locale)).length;

    const hreflangScore = Math.max(0, 100 - localeHreflangIssues * 10);
    const metaScore = Math.max(0, 100 - localeMetaIssues * 5);
    const linksScore = Math.max(0, 100 - localeBrokenLinks * 15);
    const contentScore = Math.max(0, 100 - localeDuplicates * 20);

    const overallScore = totalChecks > 0 
      ? Math.round((stats.passed / totalChecks) * 100)
      : 100;

    return {
      locale,
      score: overallScore,
      issues: stats.issues,
      warnings: stats.warnings,
      passed: stats.passed,
      breakdown: {
        hreflang: hreflangScore,
        metaTags: metaScore,
        links: linksScore,
        content: contentScore,
      },
    };
  });
}

/**
 * Calculate overall SEO score across all languages
 */
export function calculateOverallScore(scores: LanguageScore[]): number {
  if (scores.length === 0) return 100;
  const total = scores.reduce((sum, s) => sum + s.score, 0);
  return Math.round(total / scores.length);
}

/**
 * Generate actionable recommendations based on audit results
 */
export function generateRecommendations(
  hreflangIssues: HreflangIssue[],
  metaTagIssues: MetaTagIssue[],
  brokenLinks: BrokenLink[],
  duplicateGroups: DuplicateContentGroup[],
): string[] {
  const recommendations: string[] = [];

  // Hreflang recommendations
  const missingReturnLinks = hreflangIssues.filter(i => i.type === "missing-return").length;
  if (missingReturnLinks > 0) {
    recommendations.push(`Fix ${missingReturnLinks} missing return hreflang links to ensure bidirectional linking`);
  }

  const missingXDefault = hreflangIssues.filter(i => i.type === "missing-x-default").length;
  if (missingXDefault > 0) {
    recommendations.push(`Add x-default hreflang tags to ${missingXDefault} pages for better fallback handling`);
  }

  // Meta tag recommendations
  const missingTitles = metaTagIssues.filter(i => i.type === "missing-title").length;
  if (missingTitles > 0) {
    recommendations.push(`Add title tags to ${missingTitles} pages - this is critical for SEO`);
  }

  const missingDescriptions = metaTagIssues.filter(i => i.type === "missing-description").length;
  if (missingDescriptions > 0) {
    recommendations.push(`Add meta descriptions to ${missingDescriptions} pages to improve click-through rates`);
  }

  const titleLengthIssues = metaTagIssues.filter(i => i.type === "title-too-short" || i.type === "title-too-long").length;
  if (titleLengthIssues > 0) {
    recommendations.push(`Optimize ${titleLengthIssues} title tags to be between 30-60 characters`);
  }

  // Broken link recommendations
  if (brokenLinks.length > 0) {
    recommendations.push(`Fix ${brokenLinks.length} broken links to improve user experience and SEO`);
  }

  // Duplicate content recommendations
  if (duplicateGroups.length > 0) {
    recommendations.push(`Address ${duplicateGroups.length} duplicate content issues by adding canonical tags or unique content`);
  }

  // Default recommendation if everything looks good
  if (recommendations.length === 0) {
    recommendations.push("Great job! Your multilingual SEO implementation looks solid. Continue monitoring for any new issues.");
  }

  return recommendations;
}

/**
 * Calculate text similarity using simplified Jaccard index
 */
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

/**
 * Quick audit function for a single page
 */
export function quickAuditPage(
  page: AuditPage,
  config: SEOConfig,
  options: AuditOptions = {},
): {
  score: number;
  errors: string[];
  warnings: string[];
} {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check title
  if (!page.title) {
    errors.push("Missing title tag");
  } else if (page.title.length < opts.minTitleLength!) {
    warnings.push(`Title too short (${page.title.length} chars)`);
  } else if (page.title.length > opts.maxTitleLength!) {
    warnings.push(`Title too long (${page.title.length} chars)`);
  }

  // Check description
  if (!page.description) {
    errors.push("Missing meta description");
  } else if (page.description.length < opts.minDescriptionLength!) {
    warnings.push(`Description too short (${page.description.length} chars)`);
  } else if (page.description.length > opts.maxDescriptionLength!) {
    warnings.push(`Description too long (${page.description.length} chars)`);
  }

  // Check canonical
  if (!page.canonical) {
    warnings.push("Missing canonical tag");
  }

  // Check hreflang
  if (!page.hreflangTags || page.hreflangTags.length === 0) {
    warnings.push("No hreflang tags found");
  } else {
    const hasSelf = page.hreflangTags.some(t => t.locale === page.locale);
    if (!hasSelf) {
      errors.push("Missing self-referencing hreflang tag");
    }
    const hasXDefault = page.hreflangTags.some(t => t.locale === "x-default");
    if (!hasXDefault) {
      warnings.push("Missing x-default hreflang tag");
    }
  }

  const totalChecks = 4; // title, description, canonical, hreflang
  const passed = totalChecks - errors.length - warnings.length;
  const score = Math.round((passed / totalChecks) * 100);

  return { score, errors, warnings };
}
