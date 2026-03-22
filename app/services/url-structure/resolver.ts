import type {
  SubfolderConfig,
  ResolvedLocale,
  RedirectRule,
  LocaleSubfolder,
} from "./types";

/**
 * Resolve a locale from a URL path by matching the first path segment
 * against the configured locale prefixes.
 *
 * Example: /ar/products/dress -> { locale: "ar", prefix: "/ar", path: "/products/dress" }
 */
export function resolveLocaleFromPath(
  path: string,
  config: SubfolderConfig,
): ResolvedLocale {
  const normalizedPath = normalizePath(path);

  // Try to match a locale prefix from the path
  for (const localeEntry of config.locales) {
    const prefix = localeEntry.prefix;

    // Check if the path starts with this locale prefix followed by "/" or is exactly the prefix
    if (
      normalizedPath === prefix ||
      normalizedPath.startsWith(`${prefix}/`)
    ) {
      const strippedPath = normalizedPath.slice(prefix.length) || "/";
      return {
        locale: localeEntry.locale,
        prefix,
        path: strippedPath,
        fullPath: normalizedPath,
        isDefault: localeEntry.isDefault,
      };
    }
  }

  // No prefix matched — resolve to default locale
  const defaultEntry = findDefaultLocale(config);

  return {
    locale: defaultEntry.locale,
    prefix: config.includeDefaultPrefix ? defaultEntry.prefix : "",
    path: normalizedPath,
    fullPath: normalizedPath,
    isDefault: true,
  };
}

/**
 * Build a localized path by prepending the correct locale prefix.
 *
 * If the locale is the default and `includeDefaultPrefix` is false,
 * the path is returned without a prefix.
 */
export function buildLocalizedPath(
  path: string,
  locale: string,
  config: SubfolderConfig,
): string {
  const normalizedPath = normalizePath(path);

  // Strip any existing locale prefix before rebuilding
  const cleanPath = stripLocalePrefix(normalizedPath, config);

  const localeEntry = findLocaleEntry(locale, config);

  if (!localeEntry) {
    // Unknown locale — return the clean path as-is
    return cleanPath;
  }

  // Skip prefix for the default locale when includeDefaultPrefix is false
  if (localeEntry.isDefault && !config.includeDefaultPrefix) {
    return cleanPath;
  }

  const result = `${localeEntry.prefix}${cleanPath === "/" ? "" : cleanPath}`;
  return result || "/";
}

/**
 * Generate alternate URLs for every configured locale.
 * Useful for building `<link rel="alternate" hreflang="...">` tags.
 */
export function getAlternateUrls(
  path: string,
  baseUrl: string,
  config: SubfolderConfig,
): Array<{ locale: string; url: string }> {
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const cleanPath = stripLocalePrefix(normalizePath(path), config);

  return config.locales.map((localeEntry) => {
    const localizedPath = buildLocalizedPath(cleanPath, localeEntry.locale, config);
    return {
      locale: localeEntry.locale,
      url: `${normalizedBase}${localizedPath}`,
    };
  });
}

/**
 * Generate 301 redirect rules for a list of old paths.
 *
 * For each old path, a redirect rule is created for every non-default locale
 * (pointing the unprefixed path to the prefixed version) and, when
 * `includeDefaultPrefix` is true, for the default locale as well.
 */
export function generateRedirectRules(
  oldPaths: string[],
  config: SubfolderConfig,
): RedirectRule[] {
  const rules: RedirectRule[] = [];

  for (const rawPath of oldPaths) {
    const path = normalizePath(rawPath);

    for (const localeEntry of config.locales) {
      // Skip the default locale when it doesn't use a prefix
      if (localeEntry.isDefault && !config.includeDefaultPrefix) {
        continue;
      }

      const localizedPath = `${localeEntry.prefix}${path === "/" ? "" : path}` || "/";

      // Only create a rule when the source and target differ
      if (path !== localizedPath) {
        rules.push({
          from: path,
          to: localizedPath,
          statusCode: 301,
          locale: localeEntry.locale,
        });
      }
    }
  }

  return rules;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Ensure a path starts with "/" and has no trailing slash (except for root).
 */
function normalizePath(path: string): string {
  let p = path.trim();
  if (!p.startsWith("/")) {
    p = `/${p}`;
  }
  // Remove trailing slash unless it's the root
  if (p.length > 1 && p.endsWith("/")) {
    p = p.slice(0, -1);
  }
  return p;
}

/**
 * Remove any locale prefix from a path.
 */
function stripLocalePrefix(path: string, config: SubfolderConfig): string {
  for (const localeEntry of config.locales) {
    const prefix = localeEntry.prefix;
    if (path === prefix) {
      return "/";
    }
    if (path.startsWith(`${prefix}/`)) {
      return path.slice(prefix.length) || "/";
    }
  }
  return path;
}

/**
 * Find the default locale entry from the config.
 * Falls back to the first entry if none is marked as default.
 */
function findDefaultLocale(config: SubfolderConfig): LocaleSubfolder {
  return (
    config.locales.find((l) => l.isDefault) ??
    config.locales.find((l) => l.locale === config.defaultLocale) ??
    config.locales[0]
  );
}

/**
 * Find a locale entry by locale code.
 */
function findLocaleEntry(
  locale: string,
  config: SubfolderConfig,
): LocaleSubfolder | undefined {
  return config.locales.find((l) => l.locale === locale);
}
