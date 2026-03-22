/**
 * RTL Design Service
 * T0068: Islamic Geometric Patterns
 * T0069: Arabic Calligraphy Styles
 * T0070: Right-Aligned Product Gallery
 * T0071: Mixed Arabic+English Product Cards
 * T0055: Custom CSS Override
 */

// ---------------------------------------------------------------------------
// T0068 - Islamic Geometric Patterns
// ---------------------------------------------------------------------------

export interface GeometricPattern {
  id: string;
  name: string;
  nameAr: string;
  svgPath: string;
  colors: string[];
  category: "stars" | "arabesque" | "lattice" | "floral";
}

export const ISLAMIC_PATTERNS: GeometricPattern[] = [
  {
    id: "eight-point-star",
    name: "Eight-Point Star",
    nameAr: "نجمة ثمانية",
    svgPath: "M50,2 L61,35 L98,35 L68,57 L79,90 L50,70 L21,90 L32,57 L2,35 L39,35 Z",
    colors: ["#1A472A", "#D4AF37", "#FFFFFF"],
    category: "stars",
  },
  {
    id: "six-point-star",
    name: "Six-Point Star (Seal of Solomon)",
    nameAr: "نجمة سداسية",
    svgPath: "M50,5 L65,35 L95,35 L75,55 L85,90 L50,70 L15,90 L25,55 L5,35 L35,35 Z",
    colors: ["#0D47A1", "#FFD700", "#FAFAFA"],
    category: "stars",
  },
  {
    id: "arabesque-vine",
    name: "Arabesque Vine",
    nameAr: "زخرفة نباتية",
    svgPath: "M10,50 Q25,25 50,50 T90,50 Q75,75 50,50 T10,50",
    colors: ["#2E7D32", "#C8E6C9", "#FFFFFF"],
    category: "arabesque",
  },
  {
    id: "interlaced-circles",
    name: "Interlaced Circles",
    nameAr: "دوائر متشابكة",
    svgPath: "M50,10 A40,40 0 1,1 50,90 A40,40 0 1,1 50,10 M25,50 A25,25 0 1,1 75,50 A25,25 0 1,1 25,50",
    colors: ["#4A148C", "#CE93D8", "#FFFFFF"],
    category: "lattice",
  },
  {
    id: "diamond-lattice",
    name: "Diamond Lattice",
    nameAr: "شبكة معينية",
    svgPath: "M50,0 L100,50 L50,100 L0,50 Z M25,25 L75,25 L75,75 L25,75 Z",
    colors: ["#B71C1C", "#FFCDD2", "#FFFFFF"],
    category: "lattice",
  },
  {
    id: "floral-rosette",
    name: "Floral Rosette",
    nameAr: "زهرة وردية",
    svgPath: "M50,20 Q60,30 50,50 Q40,30 50,20 M80,50 Q70,60 50,50 Q70,40 80,50 M50,80 Q40,70 50,50 Q60,70 50,80 M20,50 Q30,40 50,50 Q30,60 20,50",
    colors: ["#E65100", "#FFE0B2", "#FFF3E0"],
    category: "floral",
  },
  {
    id: "muqarnas-honeycomb",
    name: "Muqarnas Honeycomb",
    nameAr: "مقرنصات سداسية",
    svgPath: "M50,0 L93,25 L93,75 L50,100 L7,75 L7,25 Z",
    colors: ["#006064", "#80DEEA", "#E0F7FA"],
    category: "lattice",
  },
  {
    id: "tulip-motif",
    name: "Tulip Motif",
    nameAr: "زخرفة الخزامى",
    svgPath: "M50,90 L50,40 Q30,20 50,5 Q70,20 50,40 M35,55 Q50,40 65,55",
    colors: ["#AD1457", "#F48FB1", "#FCE4EC"],
    category: "floral",
  },
];

export function generatePatternCSS(
  patternId: string,
  opacity: number = 0.1,
): string {
  const pattern = ISLAMIC_PATTERNS.find((p) => p.id === patternId);
  if (!pattern) return "";

  const svgEncoded = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><path d="${pattern.svgPath}" fill="${pattern.colors[0]}" opacity="${opacity}"/></svg>`,
  );

  return `.pattern-${patternId} {
  background-image: url("data:image/svg+xml,${svgEncoded}");
  background-repeat: repeat;
  background-size: 100px 100px;
}`;
}

export function getPatternsByCategory(
  category: string,
): GeometricPattern[] {
  return ISLAMIC_PATTERNS.filter((p) => p.category === category);
}

// ---------------------------------------------------------------------------
// T0069 - Arabic Calligraphy Styles
// ---------------------------------------------------------------------------

export interface CalligraphyStyle {
  id: string;
  name: string;
  nameAr: string;
  fontFamily: string;
  cssClass: string;
  bestFor: string[];
}

export const CALLIGRAPHY_STYLES: CalligraphyStyle[] = [
  {
    id: "naskh",
    name: "Naskh",
    nameAr: "نسخ",
    fontFamily: "'Noto Naskh Arabic', 'Traditional Arabic', serif",
    cssClass: "calligraphy-naskh",
    bestFor: ["body text", "product descriptions", "long-form content"],
  },
  {
    id: "thuluth",
    name: "Thuluth",
    nameAr: "ثلث",
    fontFamily: "'Aref Ruqaa', 'Scheherazade New', serif",
    cssClass: "calligraphy-thuluth",
    bestFor: ["headings", "titles", "banners", "decorative headers"],
  },
  {
    id: "diwani",
    name: "Diwani",
    nameAr: "ديواني",
    fontFamily: "'Diwani Letter', 'Lateef', serif",
    cssClass: "calligraphy-diwani",
    bestFor: ["invitations", "luxury branding", "certificates"],
  },
  {
    id: "ruqaa",
    name: "Ruqaa",
    nameAr: "رقعة",
    fontFamily: "'Aref Ruqaa', 'Harmattan', sans-serif",
    cssClass: "calligraphy-ruqaa",
    bestFor: ["everyday text", "handwritten style", "informal content"],
  },
  {
    id: "kufi",
    name: "Kufi",
    nameAr: "كوفي",
    fontFamily: "'Reem Kufi', 'Kufi Standard GK', sans-serif",
    cssClass: "calligraphy-kufi",
    bestFor: ["logos", "geometric designs", "architectural inscriptions"],
  },
  {
    id: "nastaliq",
    name: "Nastaliq",
    nameAr: "نستعليق",
    fontFamily: "'Nafees Nastaleeq', 'Jameel Noori Nastaleeq', serif",
    cssClass: "calligraphy-nastaliq",
    bestFor: ["Urdu text", "Persian text", "poetic content"],
  },
];

export function getCalligraphyCSS(styleId: string): string {
  const style = CALLIGRAPHY_STYLES.find((s) => s.id === styleId);
  if (!style) return "";

  return `.${style.cssClass} {
  font-family: ${style.fontFamily};
  font-feature-settings: "liga" 1, "calt" 1;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.8;
}

.${style.cssClass} h1,
.${style.cssClass} h2,
.${style.cssClass} h3 {
  font-family: ${style.fontFamily};
  line-height: 1.4;
  letter-spacing: 0;
}`;
}

// ---------------------------------------------------------------------------
// T0070 - Right-Aligned Product Gallery
// ---------------------------------------------------------------------------

export function generateRTLGalleryCSS(): string {
  return `/* RTL Product Gallery Layout */
[dir="rtl"] .product-gallery {
  direction: rtl;
  display: flex;
  flex-direction: row-reverse;
  gap: 16px;
}

[dir="rtl"] .product-gallery__thumbnails {
  order: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

[dir="rtl"] .product-gallery__main {
  order: 0;
  flex: 1;
}

[dir="rtl"] .product-gallery__nav {
  direction: rtl;
}

[dir="rtl"] .product-gallery__nav--prev {
  right: auto;
  left: 8px;
}

[dir="rtl"] .product-gallery__nav--next {
  left: auto;
  right: 8px;
}

[dir="rtl"] .product-gallery__thumbnails .thumbnail {
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 4px;
  transition: border-color 0.2s ease;
}

[dir="rtl"] .product-gallery__thumbnails .thumbnail.active {
  border-color: var(--color-primary, #000);
}

[dir="rtl"] .product-gallery__scroll {
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline-end: 16px;
}

[dir="rtl"] .product-gallery__scroll::-webkit-scrollbar {
  display: none;
}

/* LTR fallback */
[dir="ltr"] .product-gallery {
  direction: ltr;
  display: flex;
  gap: 16px;
}

[dir="ltr"] .product-gallery__thumbnails {
  order: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

[dir="ltr"] .product-gallery__main {
  order: 1;
  flex: 1;
}`;
}

export function getGalleryLayout(
  direction: "rtl" | "ltr",
): { thumbnailPosition: string; scrollDirection: string } {
  if (direction === "rtl") {
    return { thumbnailPosition: "right", scrollDirection: "rtl" };
  }
  return { thumbnailPosition: "left", scrollDirection: "ltr" };
}

// ---------------------------------------------------------------------------
// T0071 - Mixed Arabic+English Product Cards
// ---------------------------------------------------------------------------

export function generateMixedLanguageCardCSS(): string {
  return `/* Mixed Language Product Card */
.product-card--mixed {
  unicode-bidi: plaintext;
}

.product-card--mixed .product-card__title {
  text-align: start;
  unicode-bidi: plaintext;
  direction: inherit;
}

.product-card--mixed .product-card__title[lang="ar"] {
  direction: rtl;
  font-family: 'Noto Naskh Arabic', 'Tahoma', sans-serif;
  line-height: 1.6;
}

.product-card--mixed .product-card__title[lang="en"] {
  direction: ltr;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.4;
}

.product-card--mixed .product-card__description {
  unicode-bidi: plaintext;
}

.product-card--mixed .product-card__brand {
  direction: ltr;
  unicode-bidi: embed;
  display: inline-block;
}

.product-card--mixed .product-card__price {
  direction: ltr;
  unicode-bidi: embed;
  text-align: start;
  font-variant-numeric: tabular-nums;
}

[dir="rtl"] .product-card--mixed .product-card__price {
  text-align: right;
}

.product-card--mixed .product-card__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

[dir="rtl"] .product-card--mixed .product-card__meta {
  flex-direction: row-reverse;
}

/* Bidirectional text isolation */
.product-card--mixed .bidi-isolate {
  unicode-bidi: isolate;
}`;
}

export function detectMixedLanguageContent(
  title: string,
  description: string,
): { hasMixed: boolean; primaryDirection: "rtl" | "ltr" } {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  const latinRegex = /[a-zA-Z]/;

  const combined = `${title} ${description}`;
  const hasArabic = arabicRegex.test(combined);
  const hasLatin = latinRegex.test(combined);
  const hasMixed = hasArabic && hasLatin;

  // Count characters to determine primary direction
  let arabicCount = 0;
  let latinCount = 0;
  for (const char of combined) {
    if (arabicRegex.test(char)) arabicCount++;
    if (latinRegex.test(char)) latinCount++;
  }

  const primaryDirection = arabicCount >= latinCount ? "rtl" : "ltr";

  return { hasMixed, primaryDirection };
}

// ---------------------------------------------------------------------------
// T0055 - Custom CSS Override
// ---------------------------------------------------------------------------

export interface CSSOverride {
  shop: string;
  locale: string;
  css: string;
  enabled: boolean;
}

export function validateCSS(
  css: string,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!css || css.trim().length === 0) {
    errors.push("CSS content is empty");
    return { valid: false, errors };
  }

  // Check balanced braces
  let braceDepth = 0;
  for (let i = 0; i < css.length; i++) {
    if (css[i] === "{") braceDepth++;
    if (css[i] === "}") braceDepth--;
    if (braceDepth < 0) {
      errors.push(`Unexpected closing brace at position ${i}`);
      break;
    }
  }
  if (braceDepth > 0) {
    errors.push(`Unclosed brace: ${braceDepth} opening brace(s) without matching close`);
  }

  // Check for dangerous patterns
  const dangerousPatterns = [
    { pattern: /@import\s/, message: "@import rules are not allowed in overrides" },
    { pattern: /expression\s*\(/, message: "CSS expressions are not allowed" },
    { pattern: /javascript\s*:/, message: "JavaScript URLs are not allowed" },
    { pattern: /behavior\s*:/, message: "behavior property is not allowed" },
    { pattern: /-moz-binding\s*:/, message: "-moz-binding is not allowed" },
  ];

  for (const { pattern, message } of dangerousPatterns) {
    if (pattern.test(css)) {
      errors.push(message);
    }
  }

  // Check for basic property validity (key: value inside braces)
  const insideBraces = css.match(/\{([^}]*)\}/g);
  if (insideBraces) {
    for (const block of insideBraces) {
      const content = block.slice(1, -1).trim();
      if (content.length > 0) {
        const declarations = content.split(";").filter((d) => d.trim().length > 0);
        for (const decl of declarations) {
          if (!decl.includes(":")) {
            errors.push(`Invalid declaration: "${decl.trim()}" (missing colon)`);
          }
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function buildOverrideStyleTag(
  overrides: CSSOverride[],
  locale: string,
): string {
  const activeOverrides = overrides.filter(
    (o) => o.enabled && (o.locale === locale || o.locale === "*"),
  );

  if (activeOverrides.length === 0) return "";

  const combinedCSS = activeOverrides.map((o) => o.css).join("\n\n");

  return `<style data-rtl-override="true" data-locale="${locale}">
${combinedCSS}
</style>`;
}
