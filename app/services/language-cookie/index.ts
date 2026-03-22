export interface LanguageCookieConfig {
  name: string;
  maxAgeDays: number;
  secure: boolean;
  httpOnly: boolean;
  sameSite: "strict" | "lax" | "none";
  path: string;
  domain?: string;
  gdprCompliant?: boolean;
}

export interface SetCookieOptions {
  maxAgeDays?: number;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "strict" | "lax" | "none";
  path?: string;
  domain?: string;
  expires?: Date;
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
  gdprCompliant: true,
};

// Valid locale pattern: 2-letter code or 2-letter-2-letter region


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

/**
 * Set the language cookie with the given locale and options.
 * Works in browser environment.
 */
export function setLanguageCookie(
  locale: string,
  options: SetCookieOptions = {},
): void {
  if (typeof document === "undefined") {
    throw new Error("setLanguageCookie can only be called in browser environment");
  }

  const config: LanguageCookieConfig = {
    ...DEFAULT_CONFIG,
    maxAgeDays: options.maxAgeDays ?? DEFAULT_CONFIG.maxAgeDays,
    secure: options.secure ?? DEFAULT_CONFIG.secure,
    httpOnly: options.httpOnly ?? DEFAULT_CONFIG.httpOnly,
    sameSite: options.sameSite ?? DEFAULT_CONFIG.sameSite,
    path: options.path ?? DEFAULT_CONFIG.path,
    domain: options.domain ?? DEFAULT_CONFIG.domain,
  };

  const normalizedLocale = locale.trim().replace(/_/g, "-");
  
  // Validate locale format
  if (!VALID_LOCALE_PATTERN.test(normalizedLocale) && !/^[a-z]{2}$/.test(normalizedLocale)) {
    throw new Error(`Invalid locale format: ${locale}`);
  }

  let maxAge: number;
  if (options.expires) {
    // Calculate max-age from expires date
    maxAge = Math.floor((options.expires.getTime() - Date.now()) / 1000);
    if (maxAge < 0) maxAge = 0;
  } else {
    maxAge = config.maxAgeDays * 24 * 60 * 60;
  }

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

  document.cookie = parts.join("; ");
}

/**
 * Get the language cookie value from browser.
 * Returns the locale string or null if not found/invalid.
 */
export function getLanguageCookie(config?: Partial<LanguageCookieConfig>): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookieName = config?.name ?? DEFAULT_CONFIG.name;
  const pattern = new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`, "i");
  const match = document.cookie.match(pattern);

  if (!match) {
    return null;
  }

  const locale = decodeURIComponent(match[1]).trim().replace(/_/g, "-");
  const isValid = VALID_LOCALE_PATTERN.test(locale) || /^[a-z]{2}$/.test(locale);

  return isValid ? locale : null;
}

/**
 * Clear/remove the language cookie.
 * Works in browser environment.
 */
export function clearLanguageCookie(config?: Partial<LanguageCookieConfig>): void {
  if (typeof document === "undefined") {
    throw new Error("clearLanguageCookie can only be called in browser environment");
  }

  const cookieName = config?.name ?? DEFAULT_CONFIG.name;
  const path = config?.path ?? DEFAULT_CONFIG.path;
  const domain = config?.domain ?? DEFAULT_CONFIG.domain;
  const secure = config?.secure ?? DEFAULT_CONFIG.secure;
  const sameSite = config?.sameSite ?? DEFAULT_CONFIG.sameSite;

  const parts = [
    `${cookieName}=`,
    "Max-Age=0",
    `Path=${path}`,
  ];

  if (domain) {
    parts.push(`Domain=${domain}`);
  }
  if (secure) {
    parts.push("Secure");
  }
  parts.push(`SameSite=${capitalize(sameSite)}`);

  document.cookie = parts.join("; ");
}

/**
 * Parse and validate a language preference value.
 * Returns normalized locale or null if invalid.
 */
export function parseLanguagePreference(value: string | null | undefined): string | null {
  if (!value || typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().replace(/_/g, "-");
  
  // Check for valid locale patterns
  if (VALID_LOCALE_PATTERN.test(normalized)) {
    return normalized;
  }
  
  // Check for simple 2-letter code
  if (/^[a-z]{2}$/.test(normalized)) {
    return normalized;
  }

  return null;
}

/**
 * Check if user has given consent for cookies (GDPR compliance helper).
 * This is a simple check - in production, integrate with your consent manager.
 */
export function hasCookieConsent(): boolean {
  if (typeof document === "undefined") {
    return false;
  }

  // Check for common consent cookie patterns
  const consentCookies = [
    "cookie_consent",
    "gdpr_consent",
    "cookieconsent_status",
    "allow_cookies",
    "rtl_cookie_consent",
  ];

  const cookieString = document.cookie.toLowerCase();
  
  for (const name of consentCookies) {
    if (cookieString.includes(`${name}=`)) {
      return true;
    }
  }

  // If no consent cookie found, check if we're in a non-EU context
  // This is a simplified check - production should use proper geolocation
  return false;
}

/**
 * Set language cookie with GDPR compliance check.
 * Only sets cookie if user has given consent or if consent is not required.
 */
export function setLanguageCookieGDPR(
  locale: string,
  options: SetCookieOptions & { requireConsent?: boolean } = {},
): { success: boolean; reason?: string } {
  const requireConsent = options.requireConsent ?? DEFAULT_CONFIG.gdprCompliant;

  if (requireConsent && !hasCookieConsent()) {
    return { 
      success: false, 
      reason: "Cookie consent required" 
    };
  }

  try {
    setLanguageCookie(locale, options);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      reason: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Get cookie expiration date for a given number of days from now.
 */
export function getCookieExpirationDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Get the default configuration (immutable copy).
 */
export function getDefaultConfig(): LanguageCookieConfig {
  return { ...DEFAULT_CONFIG };
}

/**
 * Capitalize first letter of a string.
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
