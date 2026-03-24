/**
 * RTL (Right-to-Left) utilities used by the embedded app and the theme transformer.
 */

export type TextDirection = "rtl" | "ltr";
export type DirectionalityMode = "single" | "mixed";

export interface LocaleDirectionContext {
  locale: string;
  baseLocale: string;
  direction: TextDirection;
  isRTL: boolean;
  mode: DirectionalityMode;
  htmlAttributes: {
    lang: string;
    dir: TextDirection;
    className: string;
    dataLocale: string;
    dataDirectionality: DirectionalityMode;
  };
}

export interface RequestLocaleOptions {
  fallbackLocale?: string;
  contentLocale?: string | null;
  forceDirection?: TextDirection | null;
}

export interface MixedDirectionSegment {
  locale: string;
  direction: TextDirection;
  attributes: {
    lang: string;
    dir: TextDirection;
    className: string;
  };
}

export const RTL_LANGUAGES = ["ar", "he", "fa", "ur", "yi", "ji"] as const;

const RTL_LANGUAGE_SET = new Set<string>(RTL_LANGUAGES);

export const RTL_LOCALES = new Set(["ar", "he", "fa", "ur", "yi", "ar-SA", "ar-AE", "ar-EG", "ar-MA", "he-IL"]);

export function isRtlLocale(locale: string): boolean {
  return RTL_LOCALES.has(locale) || RTL_LOCALES.has(locale.split("-")[0]);
}

export function normalizeLocale(locale: string): string {
  return locale.trim().replace(/_/g, "-");
}

export function getBaseLocale(locale: string): string {
  return normalizeLocale(locale).split("-")[0]?.toLowerCase() ?? "en";
}

export function isRTLLanguage(locale: string): boolean {
  return RTL_LANGUAGE_SET.has(getBaseLocale(locale));
}

export function getTextDirection(locale: string): TextDirection {
  return isRTLLanguage(locale) ? "rtl" : "ltr";
}

export function getDirAttribute(locale: string): TextDirection {
  return getTextDirection(locale);
}

export function getOppositeDirection(dir: TextDirection): TextDirection {
  return dir === "rtl" ? "ltr" : "rtl";
}

export function getDirectionalityMode(
  primaryLocale: string,
  contentLocale?: string | null,
): DirectionalityMode {
  if (!contentLocale) {
    return "single";
  }

  return getTextDirection(primaryLocale) === getTextDirection(contentLocale)
    ? "single"
    : "mixed";
}

export function getLocaleDirectionContext(
  locale: string,
  options: Omit<RequestLocaleOptions, "fallbackLocale"> = {},
): LocaleDirectionContext {
  const normalizedLocale = normalizeLocale(locale || "en");
  const direction = options.forceDirection ?? getTextDirection(normalizedLocale);
  const mode = getDirectionalityMode(normalizedLocale, options.contentLocale);

  return {
    locale: normalizedLocale,
    baseLocale: getBaseLocale(normalizedLocale),
    direction,
    isRTL: direction === "rtl",
    mode,
    htmlAttributes: {
      lang: normalizedLocale,
      dir: direction,
      className: [
        "app-shell",
        `locale-${getBaseLocale(normalizedLocale)}`,
        `dir-${direction}`,
        `directionality-${mode}`,
      ].join(" "),
      dataLocale: normalizedLocale,
      dataDirectionality: mode,
    },
  };
}

export function getDocumentDirectionContext(
  request: Request,
  options: RequestLocaleOptions = {},
): LocaleDirectionContext {
  const locale = detectLocaleFromRequest(request, options.fallbackLocale);
  return getLocaleDirectionContext(locale, options);
}

export function detectLocaleFromRequest(
  request: Request,
  fallbackLocale: string = "en",
): string {
  const url = new URL(request.url);
  const queryLocale = url.searchParams.get("locale") ?? url.searchParams.get("lang");

  if (queryLocale) {
    return normalizeLocale(queryLocale);
  }

  const cookieLocale = getLocaleFromCookie(request.headers.get("cookie"));

  if (cookieLocale) {
    return cookieLocale;
  }

  const headerLocale = getLocaleFromAcceptLanguage(
    request.headers.get("accept-language"),
  );

  return headerLocale ?? normalizeLocale(fallbackLocale);
}

export function getMixedDirectionSegment(locale: string): MixedDirectionSegment {
  const normalizedLocale = normalizeLocale(locale);
  const direction = getTextDirection(normalizedLocale);

  return {
    locale: normalizedLocale,
    direction,
    attributes: {
      lang: normalizedLocale,
      dir: direction,
      className: `segment-${direction}`,
    },
  };
}

export function shouldInjectRTLStyles(locale: string, contentLocale?: string | null): boolean {
  return getTextDirection(locale) === "rtl" || getDirectionalityMode(locale, contentLocale) === "mixed";
}

export function flipCSSProperty(
  property: string,
  value: string,
  locale: string,
): { property: string; value: string } {
  if (!isRTLLanguage(locale)) {
    return { property, value };
  }

  const flippableProperties: Record<string, string> = {
    "margin-left": "margin-right",
    "margin-right": "margin-left",
    "padding-left": "padding-right",
    "padding-right": "padding-left",
    "border-left": "border-right",
    "border-right": "border-left",
    "border-left-width": "border-right-width",
    "border-right-width": "border-left-width",
    "border-left-color": "border-right-color",
    "border-right-color": "border-left-color",
    left: "right",
    right: "left",
    float: value === "left" ? "right" : value === "right" ? "left" : value,
    clear: value === "left" ? "right" : value === "right" ? "left" : value,
    "text-align": value === "left" ? "right" : value === "right" ? "left" : value,
  };

  if (property in flippableProperties) {
    const newProperty = flippableProperties[property];

    if (property === "text-align" || property === "float" || property === "clear") {
      return { property, value: newProperty };
    }

    return { property: newProperty, value };
  }

  return { property, value };
}

export function wrapBiDi(text: string, locale: string): string {
  if (!isRTLLanguage(locale)) {
    return text;
  }

  const RLM = "\u200F";
  const hasLatin = /[a-zA-Z]/.test(text);
  const hasArabic = /[\u0600-\u06FF]/.test(text);

  if (hasLatin && hasArabic) {
    return `${RLM}${text}${RLM}`;
  }

  return text;
}

export function formatNumberForRTL(num: number, locale: string): string {
  const formatted = num.toLocaleString(locale);

  if (!isRTLLanguage(locale)) {
    return formatted;
  }

  return formatted.replace(/[0-9]/g, (digit) =>
    String.fromCharCode(digit.charCodeAt(0) + 1584),
  );
}

function getLocaleFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }

  const match = cookieHeader.match(/(?:^|;\s*)(?:locale|lang)=([^;]+)/i);
  return match ? normalizeLocale(decodeURIComponent(match[1])) : null;
}

function getLocaleFromAcceptLanguage(header: string | null): string | null {
  if (!header) {
    return null;
  }

  const locale = header.split(",")[0]?.split(";")[0]?.trim();
  return locale ? normalizeLocale(locale) : null;
}
