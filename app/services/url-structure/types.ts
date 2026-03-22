export interface LocaleSubfolder {
  locale: string;
  prefix: string; // e.g., "/ar", "/he", "/fr"
  isDefault: boolean;
}

export interface SubfolderConfig {
  defaultLocale: string;
  locales: LocaleSubfolder[];
  includeDefaultPrefix: boolean; // whether default locale gets a prefix
}

export interface ResolvedLocale {
  locale: string;
  prefix: string;
  path: string; // path without locale prefix
  fullPath: string; // original full path
  isDefault: boolean;
}

export interface RedirectRule {
  from: string;
  to: string;
  statusCode: 301 | 302;
  locale: string;
}
