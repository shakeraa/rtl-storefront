export type {
  LocaleSubfolder,
  SubfolderConfig,
  ResolvedLocale,
  RedirectRule,
} from "./types";

export {
  resolveLocaleFromPath,
  buildLocalizedPath,
  getAlternateUrls,
  generateRedirectRules,
} from "./resolver";
