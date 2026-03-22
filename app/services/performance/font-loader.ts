/**
 * T0015 — RTL font optimization service.
 *
 * Provides locale-aware font configuration and HTML preload link generation
 * so that the correct Arabic / Hebrew / Persian / Urdu fonts load with
 * minimal render-blocking delay.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FontConfig {
  /** CSS font-family name */
  family: string;
  /** Numeric font weights to load (e.g. [400, 700]) */
  weights: number[];
  /** Unicode subsets to include (e.g. ["arabic", "latin"]) */
  subsets: string[];
  /** CSS font-display value */
  display: string;
}

// ---------------------------------------------------------------------------
// Locale detection
// ---------------------------------------------------------------------------

const RTL_LOCALE_BASES = new Set(["ar", "he", "fa", "ur", "ps", "ku", "sd"]);

const ARABIC_LOCALE_BASES = new Set(["ar", "ur", "ps", "sd"]);
const PERSIAN_LOCALE_BASES = new Set(["fa", "ku"]);
const HEBREW_LOCALE_BASES = new Set(["he"]);

function baseLocale(locale: string): string {
  return locale.toLowerCase().split(/[-_]/)[0];
}

function isRTL(locale: string): boolean {
  return RTL_LOCALE_BASES.has(baseLocale(locale));
}

// ---------------------------------------------------------------------------
// Font catalogue
// ---------------------------------------------------------------------------

/** Fonts for Arabic-script locales (ar, ur, ps, sd) */
const ARABIC_FONTS: FontConfig[] = [
  {
    family: "Noto Sans Arabic",
    weights: [400, 700],
    subsets: ["arabic"],
    display: "swap",
  },
  {
    family: "Cairo",
    weights: [400, 600, 700],
    subsets: ["arabic", "latin"],
    display: "swap",
  },
];

/** Fonts for Persian / Farsi / Kurdish locales */
const PERSIAN_FONTS: FontConfig[] = [
  {
    family: "Vazirmatn",
    weights: [400, 700],
    subsets: ["arabic", "latin"],
    display: "swap",
  },
  {
    family: "Noto Sans Arabic",
    weights: [400, 700],
    subsets: ["arabic"],
    display: "swap",
  },
];

/** Fonts for Hebrew locales */
const HEBREW_FONTS: FontConfig[] = [
  {
    family: "Noto Sans Hebrew",
    weights: [400, 700],
    subsets: ["hebrew"],
    display: "swap",
  },
  {
    family: "Assistant",
    weights: [400, 600, 700],
    subsets: ["hebrew", "latin"],
    display: "swap",
  },
];

/** Fallback Latin fonts for LTR locales — lightweight, optional loading */
const LTR_FONTS: FontConfig[] = [
  {
    family: "Inter",
    weights: [400, 500, 700],
    subsets: ["latin", "latin-ext"],
    display: "optional",
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns the ordered list of FontConfig objects that should be loaded for
 * the given locale.  RTL locales receive script-specific fonts with
 * `display: "swap"` to ensure text is visible immediately; LTR locales
 * receive lighter Latin fonts with `display: "optional"`.
 */
export function getOptimalFonts(locale: string): FontConfig[] {
  const base = baseLocale(locale);

  if (ARABIC_LOCALE_BASES.has(base)) return ARABIC_FONTS;
  if (PERSIAN_LOCALE_BASES.has(base)) return PERSIAN_FONTS;
  if (HEBREW_LOCALE_BASES.has(base)) return HEBREW_FONTS;

  // Generic RTL fallback (e.g. future locales added to RTL_LOCALE_BASES)
  if (isRTL(locale)) return ARABIC_FONTS;

  return LTR_FONTS;
}

/**
 * Generates a newline-separated string of HTML `<link rel="preload">` tags
 * for each weight of each font in the given FontConfig array.
 *
 * The URLs follow the Google Fonts CDN pattern and are suitable for use in
 * Remix's `links()` export or directly in a `<head>` element.
 */
export function generateFontPreloadLinks(fonts: FontConfig[]): string {
  const tags: string[] = [];

  for (const font of fonts) {
    for (const weight of font.weights) {
      // Map subset names to Google Fonts URL subset tokens
      const subsetParam = font.subsets.join(",");
      const familyParam = `${font.family.replace(/ /g, "+")}:wght@${weight}`;
      const href = `https://fonts.googleapis.com/css2?family=${familyParam}&subset=${subsetParam}&display=${font.display}`;

      tags.push(
        `<link rel="preload" as="style" href="${href}" crossorigin="anonymous">`,
      );
    }
  }

  return tags.join("\n");
}

/**
 * Generates a CSS `@import` block that loads all fonts in the given list
 * from Google Fonts with the requested subsets and display strategy.
 * Suitable for injection into a `<style>` element.
 */
export function generateFontImportCSS(fonts: FontConfig[]): string {
  const imports: string[] = [];

  for (const font of fonts) {
    const weights = font.weights.join(";");
    const subsetParam = font.subsets.join(",");
    const familyParam = `${font.family.replace(/ /g, "+")}:wght@${weights}`;
    const url = `https://fonts.googleapis.com/css2?family=${familyParam}&subset=${subsetParam}&display=${font.display}`;
    imports.push(`@import url('${url}');`);
  }

  return imports.join("\n");
}

/**
 * Returns true when the locale uses an RTL script.
 * Re-exported for convenience so callers don't need a separate import.
 */
export { isRTL as isRTLLocale };
