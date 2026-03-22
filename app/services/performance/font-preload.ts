/**
 * T0155 — RTL font preloading service
 *
 * Generates preload tags and @font-face declarations for RTL fonts
 * so that text renders correctly on first paint.
 */

const RTL_LOCALES = new Set(["ar", "he", "fa", "ur", "ps", "ku", "sd"]);

export interface FontPreloadEntry {
  family: string;
  url: string;
  weight: string;
  format: string;
}

export const RTL_FONT_PRELOADS: FontPreloadEntry[] = [
  {
    family: "Noto Sans Arabic",
    url: "/fonts/noto-sans-arabic-v18-arabic-regular.woff2",
    weight: "400",
    format: "woff2",
  },
  {
    family: "Noto Sans Arabic",
    url: "/fonts/noto-sans-arabic-v18-arabic-700.woff2",
    weight: "700",
    format: "woff2",
  },
  {
    family: "Cairo",
    url: "/fonts/cairo-v22-arabic-regular.woff2",
    weight: "400",
    format: "woff2",
  },
  {
    family: "Cairo",
    url: "/fonts/cairo-v22-arabic-700.woff2",
    weight: "700",
    format: "woff2",
  },
  {
    family: "Vazirmatn",
    url: "/fonts/vazirmatn-v13-latin-regular.woff2",
    weight: "400",
    format: "woff2",
  },
  {
    family: "Vazirmatn",
    url: "/fonts/vazirmatn-v13-latin-700.woff2",
    weight: "700",
    format: "woff2",
  },
];

function isRTLLocale(locale: string): boolean {
  return RTL_LOCALES.has(locale.toLowerCase().split("-")[0]);
}

/**
 * Generate `<link rel="preload">` tags for RTL fonts when the locale is RTL.
 * Returns an empty array for LTR locales.
 */
export function generatePreloadTags(locale: string): string[] {
  if (!isRTLLocale(locale)) {
    return [];
  }

  return RTL_FONT_PRELOADS.map(
    (font) =>
      `<link rel="preload" href="${font.url}" as="font" type="font/${font.format}" crossorigin="anonymous">`,
  );
}

/**
 * Return the font-display strategy for a locale.
 * RTL locales use "swap" to ensure text is visible immediately even before
 * the custom font loads. LTR locales use "optional" to avoid layout shifts.
 */
export function getFontDisplayStrategy(locale: string): "swap" | "optional" {
  return isRTLLocale(locale) ? "swap" : "optional";
}

/**
 * Generate @font-face CSS declarations for the given font entries.
 */
export function generateFontFaceCSS(
  fonts: FontPreloadEntry[] = RTL_FONT_PRELOADS,
): string {
  return fonts
    .map(
      (font) =>
        `@font-face {\n` +
        `  font-family: '${font.family}';\n` +
        `  src: url('${font.url}') format('${font.format}');\n` +
        `  font-weight: ${font.weight};\n` +
        `  font-display: swap;\n` +
        `  unicode-range: U+0600-06FF, U+0750-077F, U+0590-05FF, U+FB50-FDFF, U+FE70-FEFF;\n` +
        `}`,
    )
    .join("\n\n");
}
