/**
 * Storefront Widgets Service
 *
 * Consolidated service covering:
 * - T0010: Language switcher widget (HTML/CSS generation)
 * - T0043: Native script display names for 15+ locales
 * - T0086: Modal popup language switcher
 * - T0087: Country-specific locale variants
 */

// ---------------------------------------------------------------------------
// T0010 - Language switcher widget
// ---------------------------------------------------------------------------

export interface LanguageSwitcherProps {
  locales: Array<{
    code: string;
    name: string;
    nativeName: string;
    flag?: string;
  }>;
  currentLocale: string;
  position: "header" | "footer" | "floating";
}

/**
 * Generate the HTML markup for a language switcher dropdown.
 */
export function generateSwitcherHTML(props: LanguageSwitcherProps): string {
  const { locales, currentLocale, position } = props;
  const current = locales.find((l) => l.code === currentLocale) ?? locales[0];

  const optionItems = locales
    .map((locale) => {
      const selected = locale.code === currentLocale ? ' aria-selected="true"' : "";
      const flag = locale.flag ? `<span class="rtl-switcher__flag">${locale.flag}</span>` : "";
      return `<li class="rtl-switcher__item" data-locale="${locale.code}"${selected} role="option">${flag}<span class="rtl-switcher__native">${locale.nativeName}</span><span class="rtl-switcher__name">${locale.name}</span></li>`;
    })
    .join("\n      ");

  return `<div class="rtl-switcher rtl-switcher--${position}" role="listbox" aria-label="Language selector">
  <button class="rtl-switcher__toggle" aria-expanded="false" aria-haspopup="listbox">
    ${current.flag ? `<span class="rtl-switcher__flag">${current.flag}</span>` : ""}
    <span class="rtl-switcher__current">${current.nativeName}</span>
    <svg class="rtl-switcher__arrow" width="12" height="12" viewBox="0 0 12 12"><path d="M3 5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
  </button>
  <ul class="rtl-switcher__menu" role="listbox" hidden>
      ${optionItems}
  </ul>
</div>`;
}

/**
 * Generate the CSS for the switcher widget, direction-aware.
 */
export function generateSwitcherCSS(
  position: string,
  direction: "rtl" | "ltr",
): string {
  const isRtl = direction === "rtl";
  const floatSide = isRtl ? "left" : "right";
  const textAlign = isRtl ? "right" : "left";

  const positionCSS = position === "floating"
    ? `position: fixed; bottom: 20px; ${floatSide}: 20px; z-index: 9999;`
    : position === "header"
      ? `position: relative; display: inline-flex;`
      : `position: relative; display: inline-flex; margin-top: 8px;`;

  return `.rtl-switcher--${position} {
  ${positionCSS}
  direction: ${direction};
  font-family: inherit;
}
.rtl-switcher__toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  text-align: ${textAlign};
}
.rtl-switcher__menu {
  position: absolute;
  top: 100%;
  ${floatSide}: 0;
  min-width: 180px;
  margin-top: 4px;
  padding: 4px 0;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  list-style: none;
  text-align: ${textAlign};
}
.rtl-switcher__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
}
.rtl-switcher__item:hover {
  background: #f5f5f5;
}
.rtl-switcher__item[aria-selected="true"] {
  font-weight: 600;
  background: #f0f0ff;
}
.rtl-switcher__flag {
  font-size: 1.2em;
}
.rtl-switcher__name {
  color: #666;
  font-size: 0.85em;
  margin-inline-start: auto;
}
.rtl-switcher__arrow {
  transition: transform 0.2s;
}
.rtl-switcher__toggle[aria-expanded="true"] .rtl-switcher__arrow {
  transform: rotate(180deg);
}`;
}

// ---------------------------------------------------------------------------
// T0043 - Native script display names
// ---------------------------------------------------------------------------

/**
 * Locale code → native script name (15 locales).
 */
export const NATIVE_SCRIPT_NAMES: Record<string, string> = {
  ar: "العربية",
  he: "עברית",
  fa: "فارسی",
  ur: "اردو",
  en: "English",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
  pt: "Português",
  it: "Italiano",
  nl: "Nederlands",
  tr: "Türkçe",
  ja: "日本語",
  ko: "한국어",
  zh: "中文",
};

/**
 * Get the display name for a locale. When `displayLocale` is provided,
 * return the name as rendered in that locale; otherwise return the native
 * script name.
 */
export function getLocaleDisplayName(
  locale: string,
  displayLocale?: string,
): string {
  // If no display locale is requested, return native name
  if (!displayLocale || displayLocale === locale) {
    return NATIVE_SCRIPT_NAMES[locale] ?? locale;
  }

  // Cross-locale display names (common pairs)
  const crossLocaleNames: Record<string, Record<string, string>> = {
    en: {
      ar: "Arabic",
      he: "Hebrew",
      fa: "Persian",
      ur: "Urdu",
      fr: "French",
      de: "German",
      es: "Spanish",
      pt: "Portuguese",
      it: "Italian",
      nl: "Dutch",
      tr: "Turkish",
      ja: "Japanese",
      ko: "Korean",
      zh: "Chinese",
    },
    ar: {
      en: "الإنجليزية",
      fr: "الفرنسية",
      de: "الألمانية",
      es: "الإسبانية",
      he: "العبرية",
      fa: "الفارسية",
      ur: "الأردية",
      tr: "التركية",
      ja: "اليابانية",
      ko: "الكورية",
      zh: "الصينية",
    },
    he: {
      en: "אנגלית",
      ar: "ערבית",
      fr: "צרפתית",
      de: "גרמנית",
      es: "ספרדית",
      fa: "פרסית",
    },
  };

  return crossLocaleNames[displayLocale]?.[locale]
    ?? NATIVE_SCRIPT_NAMES[locale]
    ?? locale;
}

// ---------------------------------------------------------------------------
// T0086 - Modal popup language switcher
// ---------------------------------------------------------------------------

/**
 * Generate the HTML for a full-screen modal language switcher overlay.
 */
export function generateModalSwitcherHTML(
  locales: Array<{
    code: string;
    name: string;
    nativeName: string;
    flag?: string;
  }>,
  currentLocale: string,
): string {
  const gridItems = locales
    .map((locale) => {
      const active = locale.code === currentLocale ? " rtl-modal-switcher__card--active" : "";
      const flag = locale.flag ?? "";
      return `<button class="rtl-modal-switcher__card${active}" data-locale="${locale.code}" aria-pressed="${locale.code === currentLocale}">
      ${flag ? `<span class="rtl-modal-switcher__flag">${flag}</span>` : ""}
      <span class="rtl-modal-switcher__native">${locale.nativeName}</span>
      <span class="rtl-modal-switcher__label">${locale.name}</span>
    </button>`;
    })
    .join("\n    ");

  return `<div class="rtl-modal-switcher" role="dialog" aria-modal="true" aria-label="Choose language" hidden>
  <div class="rtl-modal-switcher__backdrop"></div>
  <div class="rtl-modal-switcher__panel">
    <div class="rtl-modal-switcher__header">
      <h2 class="rtl-modal-switcher__title">Choose your language</h2>
      <button class="rtl-modal-switcher__close" aria-label="Close">&times;</button>
    </div>
    <div class="rtl-modal-switcher__grid">
    ${gridItems}
    </div>
  </div>
</div>`;
}

// ---------------------------------------------------------------------------
// T0087 - Country-specific locale variants
// ---------------------------------------------------------------------------

export interface CountryVariant {
  locale: string;
  country: string;
  label: string;
}

/**
 * Registry of country-specific variants per base locale.
 */
export const LOCALE_COUNTRY_VARIANTS: Record<string, CountryVariant[]> = {
  fr: [
    { locale: "fr-FR", country: "FR", label: "Français (France)" },
    { locale: "fr-CA", country: "CA", label: "Français (Canada)" },
    { locale: "fr-MA", country: "MA", label: "Français (Maroc)" },
    { locale: "fr-TN", country: "TN", label: "Français (Tunisie)" },
  ],
  ar: [
    { locale: "ar-SA", country: "SA", label: "العربية (السعودية)" },
    { locale: "ar-AE", country: "AE", label: "العربية (الإمارات)" },
    { locale: "ar-EG", country: "EG", label: "العربية (مصر)" },
    { locale: "ar-MA", country: "MA", label: "العربية (المغرب)" },
    { locale: "ar-KW", country: "KW", label: "العربية (الكويت)" },
  ],
  en: [
    { locale: "en-US", country: "US", label: "English (United States)" },
    { locale: "en-GB", country: "GB", label: "English (United Kingdom)" },
    { locale: "en-AU", country: "AU", label: "English (Australia)" },
  ],
  es: [
    { locale: "es-ES", country: "ES", label: "Español (España)" },
    { locale: "es-MX", country: "MX", label: "Español (México)" },
    { locale: "es-AR", country: "AR", label: "Español (Argentina)" },
  ],
  pt: [
    { locale: "pt-BR", country: "BR", label: "Português (Brasil)" },
    { locale: "pt-PT", country: "PT", label: "Português (Portugal)" },
  ],
  de: [
    { locale: "de-DE", country: "DE", label: "Deutsch (Deutschland)" },
    { locale: "de-AT", country: "AT", label: "Deutsch (Österreich)" },
    { locale: "de-CH", country: "CH", label: "Deutsch (Schweiz)" },
  ],
  zh: [
    { locale: "zh-CN", country: "CN", label: "中文 (简体)" },
    { locale: "zh-TW", country: "TW", label: "中文 (繁體)" },
    { locale: "zh-HK", country: "HK", label: "中文 (香港)" },
  ],
};

/**
 * Return all country-specific variants for a base locale.
 */
export function getCountryVariants(baseLocale: string): CountryVariant[] {
  // Strip country suffix if a full locale like "fr-FR" is passed
  const base = baseLocale.split("-")[0];
  return LOCALE_COUNTRY_VARIANTS[base] ?? [];
}
