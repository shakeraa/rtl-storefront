/**
 * T0157 — Critical CSS extraction for RTL
 *
 * Extracts above-the-fold CSS, generates RTL-specific critical styles,
 * and provides utilities to inline them into the HTML document.
 */

const RTL_LOCALES = new Set(["ar", "he", "fa", "ur", "ps", "ku", "sd"]);

/** Selectors considered above-the-fold for each viewport */
const CRITICAL_SELECTORS: Record<"mobile" | "desktop", RegExp[]> = {
  mobile: [
    /^(html|body|header|nav|\.header|\.nav|\.hero|\.banner|\.announcement)/,
    /@media[^{]*max-width:\s*(768|480|640)px/,
  ],
  desktop: [
    /^(html|body|header|nav|\.header|\.nav|\.hero|\.banner|\.announcement|\.sidebar)/,
    /@media[^{]*min-width:\s*(769|1024)px/,
  ],
};

/**
 * Naively extract above-fold CSS rules from the full stylesheet.
 * Matches rules whose selectors are commonly above-the-fold for the
 * given viewport.
 *
 * NOTE: This is a heuristic extraction suitable for SSR — a full
 * implementation would use a headless browser or AST-based parser.
 */
export function extractCriticalCSS(
  fullCSS: string,
  viewport: "mobile" | "desktop",
): string {
  const patterns = CRITICAL_SELECTORS[viewport];
  // Split on top-level rule boundaries (very simplified)
  const rules = fullCSS.split(/(?<=\})\s*(?=[^\s@])/).filter(Boolean);

  const critical: string[] = [];
  for (const rule of rules) {
    const selector = rule.slice(0, rule.indexOf("{")).trim();
    if (patterns.some((p) => p.test(selector))) {
      critical.push(rule.trim());
    }
  }

  // Always include :root / CSS custom properties
  for (const rule of rules) {
    if (/^:root\s*\{/.test(rule.trim()) && !critical.includes(rule.trim())) {
      critical.unshift(rule.trim());
    }
  }

  return critical.join("\n\n");
}

/**
 * Generate direction-specific critical CSS for a locale.
 * For RTL locales this includes direction, text-align, and font-family overrides.
 * For LTR locales a minimal reset is returned.
 */
export function generateRTLCriticalCSS(locale: string): string {
  const base = locale.toLowerCase().split("-")[0];
  const isRTL = RTL_LOCALES.has(base);

  if (!isRTL) {
    return [
      "html { direction: ltr; }",
      "body { text-align: left; }",
    ].join("\n");
  }

  return [
    "html { direction: rtl; }",
    "body {",
    "  text-align: right;",
    "  font-family: 'Noto Sans Arabic', 'Cairo', 'Vazirmatn', system-ui, sans-serif;",
    "}",
    "/* Flip margins & paddings for common layout classes */",
    ".container, .content, .main { direction: rtl; }",
    "input, textarea, select { direction: rtl; text-align: right; }",
  ].join("\n");
}

/**
 * Inject critical CSS into the `<head>` of the HTML string as an inline
 * `<style>` block. Inserts just before `</head>`.
 */
export function inlineCSS(html: string, criticalCSS: string): string {
  const styleTag = `<style data-critical="true">${criticalCSS}</style>`;
  const headClose = "</head>";
  const idx = html.indexOf(headClose);

  if (idx === -1) {
    // No </head> found — prepend to the document
    return styleTag + html;
  }

  return html.slice(0, idx) + styleTag + html.slice(idx);
}

/**
 * Generate a `<link>` tag that preloads a stylesheet and then applies it
 * once loaded, keeping the non-critical CSS off the critical path.
 */
export function generateNonCriticalLink(cssUrl: string): string {
  return (
    `<link rel="preload" href="${cssUrl}" as="style" onload="this.onload=null;this.rel='stylesheet'">` +
    `<noscript><link rel="stylesheet" href="${cssUrl}"></noscript>`
  );
}
