/**
 * T0197 — WCAG Accessibility Compliance Service
 *
 * Runs a lightweight set of WCAG 2.1 AA checks against an HTML string,
 * with additional RTL-specific rules for Arabic / Hebrew locales.
 */

import type { AccessibilityCheck, AccessibilityReport } from "./types";

const RTL_LOCALES = ["ar", "he", "fa", "ur"];

/**
 * Run all accessibility checks against the provided HTML and locale.
 */
export function runAccessibilityCheck(
  html: string,
  locale: string,
): AccessibilityReport {
  const checks: AccessibilityCheck[] = [
    checkLangAttribute(html, locale),
    checkDirAttribute(html, locale),
    checkAltTextPresence(html),
    checkColorContrast(html),
    checkHeadingHierarchy(html),
    checkLinkText(html),
    checkFormLabels(html),
    checkAriaRoles(html),
  ];

  if (isRTLLocale(locale)) {
    checks.push(...getRTLSpecificChecks(locale, html));
  }

  const passedCount = checks.filter((c) => c.passed).length;
  const failedCount = checks.filter((c) => !c.passed).length;
  const score = getAccessibilityScore({
    url: "",
    locale,
    score: 0,
    checks,
    passedCount,
    failedCount,
  });

  return {
    url: "",
    locale,
    score,
    checks,
    passedCount,
    failedCount,
  };
}

/**
 * Calculate an accessibility score from 0-100 based on weighted checks.
 */
export function getAccessibilityScore(
  report: AccessibilityReport,
): number {
  const total = report.checks.length;
  if (total === 0) return 100;

  // Weight by WCAG level
  const weights: Record<string, number> = { A: 3, AA: 2, AAA: 1 };
  let maxWeight = 0;
  let earnedWeight = 0;

  for (const check of report.checks) {
    const w = weights[check.level] ?? 1;
    maxWeight += w;
    if (check.passed) earnedWeight += w;
  }

  return Math.round((earnedWeight / maxWeight) * 100);
}

/**
 * Return RTL-specific accessibility checks.
 */
export function getRTLSpecificChecks(
  locale: string,
  html?: string,
): AccessibilityCheck[] {
  const checks: AccessibilityCheck[] = [];
  const content = html ?? "";

  // dir attribute on root element
  const hasDirRTL = /dir\s*=\s*["']rtl["']/i.test(content);
  checks.push({
    rule: "rtl-dir-attribute",
    level: "A",
    passed: hasDirRTL,
    description: `Document must have dir="rtl" for ${locale} locale.`,
    fix: hasDirRTL
      ? undefined
      : 'Add dir="rtl" to the <html> or root element.',
  });

  // Logical CSS properties (check for physical margin-left/right instead of margin-inline)
  const hasPhysicalProperties =
    /margin-left|margin-right|padding-left|padding-right|text-align:\s*(left|right)/i.test(
      content,
    );
  checks.push({
    rule: "rtl-logical-properties",
    level: "AA",
    passed: !hasPhysicalProperties,
    description:
      "Use CSS logical properties (margin-inline, padding-inline) instead of physical properties for RTL support.",
    fix: hasPhysicalProperties
      ? "Replace margin-left/right with margin-inline-start/end and padding-left/right with padding-inline-start/end."
      : undefined,
  });

  // Reading order — check for explicit direction overrides that may break reading order
  const hasBadUnicodeBidi = /unicode-bidi\s*:\s*bidi-override/i.test(content);
  checks.push({
    rule: "rtl-reading-order",
    level: "AA",
    passed: !hasBadUnicodeBidi,
    description:
      "Avoid unicode-bidi: bidi-override which can disrupt natural reading order.",
    fix: hasBadUnicodeBidi
      ? "Remove unicode-bidi: bidi-override and let the browser handle bidirectional text naturally."
      : undefined,
  });

  return checks;
}

// ---------------------------------------------------------------------------
// Individual WCAG checks
// ---------------------------------------------------------------------------

function checkLangAttribute(html: string, locale: string): AccessibilityCheck {
  const hasLang = /lang\s*=\s*["'][a-z]{2}/i.test(html);
  const langMatch = new RegExp(`lang\\s*=\\s*["']${locale.slice(0, 2)}`, "i").test(html);

  return {
    rule: "html-has-lang",
    level: "A",
    passed: hasLang && langMatch,
    description: `<html> element must have a lang attribute matching the page locale (${locale}).`,
    fix:
      hasLang && langMatch
        ? undefined
        : `Add lang="${locale.slice(0, 2)}" to the <html> element.`,
  };
}

function checkDirAttribute(html: string, locale: string): AccessibilityCheck {
  const needsRTL = isRTLLocale(locale);
  if (!needsRTL) {
    return {
      rule: "html-has-dir",
      level: "A",
      passed: true,
      description: "LTR locale — dir attribute check not required.",
    };
  }

  const hasDirRTL = /dir\s*=\s*["']rtl["']/i.test(html);
  return {
    rule: "html-has-dir",
    level: "A",
    passed: hasDirRTL,
    description: 'RTL locale requires dir="rtl" on the document.',
    fix: hasDirRTL ? undefined : 'Add dir="rtl" to the <html> element.',
  };
}

function checkAltTextPresence(html: string): AccessibilityCheck {
  const imgTags = html.match(/<img\b[^>]*>/gi) ?? [];
  const missingAlt = imgTags.filter(
    (tag) => !/alt\s*=\s*["'][^"']*["']/i.test(tag),
  );

  return {
    rule: "img-alt",
    level: "A",
    passed: missingAlt.length === 0,
    description: "All <img> elements must have an alt attribute.",
    fix:
      missingAlt.length > 0
        ? `${missingAlt.length} image(s) missing alt text.`
        : undefined,
  };
}

function checkColorContrast(html: string): AccessibilityCheck {
  // Basic heuristic: flag common low-contrast patterns in inline styles
  const lowContrast =
    /color\s*:\s*#[cdef]{3}\b/i.test(html) ||
    /color\s*:\s*lightgr[ae]y/i.test(html);

  return {
    rule: "color-contrast",
    level: "AA",
    passed: !lowContrast,
    description:
      "Text must have a contrast ratio of at least 4.5:1 against its background.",
    fix: lowContrast
      ? "Review inline styles for low-contrast text colors."
      : undefined,
  };
}

function checkHeadingHierarchy(html: string): AccessibilityCheck {
  const headings = html.match(/<h([1-6])\b/gi) ?? [];
  const levels = headings.map((h) => parseInt(h.replace(/<h/i, ""), 10));

  let valid = true;
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] > levels[i - 1] + 1) {
      valid = false;
      break;
    }
  }

  return {
    rule: "heading-order",
    level: "AA",
    passed: valid,
    description:
      "Heading levels should increase by one (no skipping, e.g. h1 -> h3).",
    fix: valid
      ? undefined
      : "Restructure headings so levels increase sequentially.",
  };
}

function checkLinkText(html: string): AccessibilityCheck {
  const badLinks =
    />click here</i.test(html) ||
    />here</i.test(html) ||
    />read more</i.test(html);

  return {
    rule: "link-name",
    level: "A",
    passed: !badLinks,
    description:
      'Links must have descriptive text (avoid "click here", "here", "read more").',
    fix: badLinks
      ? "Replace generic link text with descriptive labels."
      : undefined,
  };
}

function checkFormLabels(html: string): AccessibilityCheck {
  const inputs = html.match(/<input\b[^>]*>/gi) ?? [];
  const inputsNeedingLabels = inputs.filter(
    (tag) =>
      !/type\s*=\s*["'](hidden|submit|button|reset|image)["']/i.test(tag),
  );
  const missingLabels = inputsNeedingLabels.filter(
    (tag) =>
      !/aria-label\s*=/i.test(tag) &&
      !/aria-labelledby\s*=/i.test(tag) &&
      !/id\s*=/i.test(tag), // Simplified: assume id means a <label for=...> exists
  );

  return {
    rule: "label",
    level: "A",
    passed: missingLabels.length === 0,
    description: "Form inputs must have associated labels or aria-label.",
    fix:
      missingLabels.length > 0
        ? `${missingLabels.length} input(s) may be missing labels.`
        : undefined,
  };
}

function checkAriaRoles(html: string): AccessibilityCheck {
  const hasLandmarks =
    /role\s*=\s*["'](main|navigation|banner|contentinfo)["']/i.test(html) ||
    /<(main|nav|header|footer)\b/i.test(html);

  return {
    rule: "landmark-one-main",
    level: "A",
    passed: hasLandmarks,
    description:
      "Page should contain landmark roles (main, navigation, banner) or semantic HTML5 elements.",
    fix: hasLandmarks
      ? undefined
      : "Add semantic HTML5 elements (<main>, <nav>, <header>, <footer>) or ARIA landmark roles.",
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isRTLLocale(locale: string): boolean {
  return RTL_LOCALES.some((rtl) => locale.startsWith(rtl));
}
