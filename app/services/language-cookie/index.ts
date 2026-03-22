export interface LanguageCookieConfig {
  name: string;
  maxAgeDays: number;
  secure: boolean;
  httpOnly: boolean;
  sameSite: "strict" | "lax" | "none";
  path: string;
  domain?: string;
}

export interface CookieParseResult {
  locale: string | null;
  isValid: boolean;
}

const DEFAULT_CONFIG: LanguageCookieConfig = {
  name: "rtl_lang",
  maxAgeDays: 365,
  secure: true,
  httpOnly: false, // needs JS access for client-side switcher
  sameSite: "lax",
  path: "/",
};

const VALID_LOCALE_PATTERN = /^[a-z]{2}(-[A-Z]{2})?$/;

/**
 * Build a Set-Cookie header string for language preference.
 */
export function buildLanguageCookie(
  locale: string,
  config: LanguageCookieConfig = DEFAULT_CONFIG,
): string {
  const normalizedLocale = locale.trim().replace(/_/g, "-");
  const maxAge = config.maxAgeDays * 24 * 60 * 60;

  const parts = [
    `${config.name}=${encodeURIComponent(normalizedLocale)}`,
    `Max-Age=${maxAge}`,
    `Path=${config.path}`,
  ];

  if (config.domain) {
    parts.push(`Domain=${config.domain}`);
  }
  if (config.secure) {
    parts.push("Secure");
  }
  if (config.httpOnly) {
    parts.push("HttpOnly");
  }
  parts.push(`SameSite=${capitalize(config.sameSite)}`);

  return parts.join("; ");
}

/**
 * Parse the language cookie from a Cookie header string.
 */
export function parseLanguageCookie(
  cookieHeader: string | null,
  config: LanguageCookieConfig = DEFAULT_CONFIG,
): CookieParseResult {
  if (!cookieHeader) {
    return { locale: null, isValid: false };
  }

  const pattern = new RegExp(`(?:^|;\\s*)${config.name}=([^;]+)`, "i");
  const match = cookieHeader.match(pattern);

  if (!match) {
    return { locale: null, isValid: false };
  }

  const locale = decodeURIComponent(match[1]).trim().replace(/_/g, "-");
  const isValid = VALID_LOCALE_PATTERN.test(locale) || /^[a-z]{2}$/.test(locale);

  return { locale: isValid ? locale : null, isValid };
}

/**
 * Build a cookie that clears/deletes the language preference.
 */
export function buildClearCookie(
  config: LanguageCookieConfig = DEFAULT_CONFIG,
): string {
  const parts = [
    `${config.name}=`,
    "Max-Age=0",
    `Path=${config.path}`,
  ];

  if (config.domain) {
    parts.push(`Domain=${config.domain}`);
  }
  if (config.secure) {
    parts.push("Secure");
  }
  parts.push(`SameSite=${capitalize(config.sameSite)}`);

  return parts.join("; ");
}

/**
 * Create response headers that set the language cookie.
 */
export function setLanguageCookieHeaders(
  locale: string,
  config?: LanguageCookieConfig,
): Headers {
  const headers = new Headers();
  headers.set("Set-Cookie", buildLanguageCookie(locale, config));
  return headers;
}

/**
 * Extract language preference from a Request (cookie → query → accept-language).
 */
export function getLanguageFromRequest(
  request: Request,
  config?: LanguageCookieConfig,
): string | null {
  const cookieHeader = request.headers.get("cookie");
  const { locale } = parseLanguageCookie(cookieHeader, config);
  return locale;
}

export function getDefaultConfig(): LanguageCookieConfig {
  return { ...DEFAULT_CONFIG };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
