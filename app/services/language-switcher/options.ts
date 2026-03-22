import type { LanguageOption, SwitcherConfig } from "./types";

interface LanguageInfo {
  name: string;
  nativeName: string;
  direction: "rtl" | "ltr";
  flag: string;
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageInfo> = {
  en: { name: "English", nativeName: "English", direction: "ltr", flag: "\uD83C\uDDFA\uD83C\uDDF8" },
  ar: { name: "Arabic", nativeName: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629", direction: "rtl", flag: "\uD83C\uDDF8\uD83C\uDDE6" },
  he: { name: "Hebrew", nativeName: "\u05E2\u05D1\u05E8\u05D9\u05EA", direction: "rtl", flag: "\uD83C\uDDEE\uD83C\uDDF1" },
  fa: { name: "Persian", nativeName: "\u0641\u0627\u0631\u0633\u06CC", direction: "rtl", flag: "\uD83C\uDDEE\uD83C\uDDF7" },
  fr: { name: "French", nativeName: "Fran\u00E7ais", direction: "ltr", flag: "\uD83C\uDDEB\uD83C\uDDF7" },
  de: { name: "German", nativeName: "Deutsch", direction: "ltr", flag: "\uD83C\uDDE9\uD83C\uDDEA" },
  es: { name: "Spanish", nativeName: "Espa\u00F1ol", direction: "ltr", flag: "\uD83C\uDDEA\uD83C\uDDF8" },
  it: { name: "Italian", nativeName: "Italiano", direction: "ltr", flag: "\uD83C\uDDEE\uD83C\uDDF9" },
  pt: { name: "Portuguese", nativeName: "Portugu\u00EAs", direction: "ltr", flag: "\uD83C\uDDE7\uD83C\uDDF7" },
  tr: { name: "Turkish", nativeName: "T\u00FCrk\u00E7e", direction: "ltr", flag: "\uD83C\uDDF9\uD83C\uDDF7" },
  ru: { name: "Russian", nativeName: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439", direction: "ltr", flag: "\uD83C\uDDF7\uD83C\uDDFA" },
  zh: { name: "Chinese", nativeName: "\u4E2D\u6587", direction: "ltr", flag: "\uD83C\uDDE8\uD83C\uDDF3" },
  ja: { name: "Japanese", nativeName: "\u65E5\u672C\u8A9E", direction: "ltr", flag: "\uD83C\uDDEF\uD83C\uDDF5" },
  ko: { name: "Korean", nativeName: "\uD55C\uAD6D\uC5B4", direction: "ltr", flag: "\uD83C\uDDF0\uD83C\uDDF7" },
  ur: { name: "Urdu", nativeName: "\u0627\u0631\u062F\u0648", direction: "rtl", flag: "\uD83C\uDDF5\uD83C\uDDF0" },
};

/**
 * Build an array of LanguageOption objects from a list of available locale codes,
 * marking the current locale as active.
 */
export function buildLanguageOptions(
  availableLocales: string[],
  currentLocale: string,
): LanguageOption[] {
  return availableLocales
    .filter((locale) => locale in SUPPORTED_LANGUAGES)
    .map((locale) => {
      const info = SUPPORTED_LANGUAGES[locale];
      return {
        locale,
        name: info.name,
        nativeName: info.nativeName,
        direction: info.direction,
        flag: info.flag,
        isActive: locale === currentLocale,
      };
    });
}

/**
 * Return sensible default switcher configuration.
 */
export function getDefaultSwitcherConfig(): SwitcherConfig {
  return {
    placement: "header",
    style: "dropdown",
    showFlags: true,
    showNativeNames: true,
    compact: false,
  };
}
