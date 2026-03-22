/**
 * Fashion Section Preview Generator
 * T0006: RTL-First Fashion Design - Pre-built Theme Sections
 */

export interface SectionPreview {
  name: string;
  description: string;
  thumbnail: string;
  category: "hero" | "gallery" | "grid" | "lookbook";
  rtlOptimized: boolean;
}

const AVAILABLE_SECTIONS: SectionPreview[] = [
  {
    name: "modesty-hero",
    description:
      "Full-width hero section for modest wear collections with RTL layout and Arabic typography support",
    thumbnail: "/assets/previews/modesty-hero.svg",
    category: "hero",
    rtlOptimized: true,
  },
  {
    name: "abaya-gallery",
    description:
      "RTL-optimized product gallery for abaya collections with right-to-left CSS grid layout",
    thumbnail: "/assets/previews/abaya-gallery.svg",
    category: "gallery",
    rtlOptimized: true,
  },
  {
    name: "hijab-grid",
    description:
      "Compact product grid for hijab collections with RTL styling and color swatch support",
    thumbnail: "/assets/previews/hijab-grid.svg",
    category: "grid",
    rtlOptimized: true,
  },
];

/**
 * Returns the list of all available RTL fashion section previews.
 */
export function getAvailableSections(): SectionPreview[] {
  return AVAILABLE_SECTIONS;
}

/**
 * Generates a preview HTML snippet for a given section type and locale.
 * The locale controls whether the placeholder text is Arabic (RTL) or English (LTR).
 */
export function generatePreviewHtml(
  sectionType: string,
  locale: string
): string {
  const isRtl =
    locale.startsWith("ar") ||
    locale.startsWith("he") ||
    locale.startsWith("fa") ||
    locale.startsWith("ur");

  const dir = isRtl ? "rtl" : "ltr";

  switch (sectionType) {
    case "modesty-hero":
      return generateModestyHeroPreview(dir, isRtl);
    case "abaya-gallery":
      return generateAbayaGalleryPreview(dir, isRtl);
    case "hijab-grid":
      return generateHijabGridPreview(dir, isRtl);
    default:
      return generateFallbackPreview(sectionType, dir);
  }
}

function generateModestyHeroPreview(
  dir: "rtl" | "ltr",
  isRtl: boolean
): string {
  const heading = isRtl ? "أناقة العباءة الحديثة" : "Modern Abaya Elegance";
  const subheading = isRtl
    ? "اكتشفي مجموعتنا من العباءات الفاخرة"
    : "Discover our luxury abaya collection";
  const cta = isRtl ? "تسوقي الآن" : "Shop Now";

  return `<div class="rtl-preview rtl-preview--hero" dir="${dir}">
  <div class="rtl-preview__hero-inner">
    <div class="rtl-preview__content">
      <h2 class="rtl-preview__heading rtl-arabic-heading">${heading}</h2>
      <p class="rtl-preview__subheading">${subheading}</p>
      <button class="rtl-preview__cta">${cta}</button>
    </div>
    <div class="rtl-preview__image-placeholder">
      <div class="rtl-preview__geometric-pattern"></div>
    </div>
  </div>
</div>`;
}

function generateAbayaGalleryPreview(
  dir: "rtl" | "ltr",
  isRtl: boolean
): string {
  const title = isRtl ? "مجموعة العباءات" : "Abaya Collection";
  const itemLabels = isRtl
    ? ["عباءة كلاسيكية", "عباءة مطرزة", "عباءة أنيقة"]
    : ["Classic Abaya", "Embroidered Abaya", "Elegant Abaya"];
  const viewText = isRtl ? "عرض التفاصيل" : "View Details";

  const cards = itemLabels
    .map(
      (label) => `
    <div class="rtl-preview__card">
      <div class="rtl-preview__card-image"></div>
      <div class="rtl-preview__card-body">
        <p class="rtl-preview__card-title">${label}</p>
        <a class="rtl-preview__card-link">${viewText}</a>
      </div>
    </div>`
    )
    .join("");

  return `<div class="rtl-preview rtl-preview--gallery" dir="${dir}">
  <h3 class="rtl-preview__section-title rtl-arabic-heading">${title}</h3>
  <div class="rtl-preview__grid rtl-preview__grid--3col">
    ${cards}
  </div>
</div>`;
}

function generateHijabGridPreview(
  dir: "rtl" | "ltr",
  isRtl: boolean
): string {
  const title = isRtl ? "تشكيلة الحجاب" : "Hijab Collection";
  const itemLabels = isRtl
    ? ["حجاب شيفون", "حجاب قطن", "حجاب حرير", "حجاب جيرسي"]
    : ["Chiffon Hijab", "Cotton Hijab", "Silk Hijab", "Jersey Hijab"];
  const addText = isRtl ? "أضف للسلة" : "Add to Cart";

  const cards = itemLabels
    .map(
      (label) => `
    <div class="rtl-preview__card rtl-preview__card--compact">
      <div class="rtl-preview__card-image rtl-preview__card-image--square"></div>
      <p class="rtl-preview__card-title">${label}</p>
      <button class="rtl-preview__add-btn">${addText}</button>
    </div>`
    )
    .join("");

  return `<div class="rtl-preview rtl-preview--grid" dir="${dir}">
  <h3 class="rtl-preview__section-title rtl-arabic-heading">${title}</h3>
  <div class="rtl-preview__grid rtl-preview__grid--4col">
    ${cards}
  </div>
</div>`;
}

function generateFallbackPreview(sectionType: string, dir: "rtl" | "ltr"): string {
  return `<div class="rtl-preview rtl-preview--unknown" dir="${dir}">
  <p>Preview not available for section type: ${sectionType}</p>
</div>`;
}
