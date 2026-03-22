/**
 * Geolocation & Browser Language Detection Service
 * T0040: Geolocation Detection
 */

export interface GeoLocation {
  country: string;
  countryCode: string;
  city?: string;
  region?: string;
  timezone: string;
  currency: string;
  language: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isVPN?: boolean;
  privacyConsent?: boolean;
}

export interface GeoConfig {
  autoDetect: boolean;
  redirectOnDetect: boolean;
  allowedCountries: string[];
  blockedCountries: string[];
  privacyMode: 'strict' | 'balanced' | 'relaxed';
}

// Country to language mapping
export const COUNTRY_LANGUAGE_MAP: Record<string, string> = {
  SA: 'ar', AE: 'ar', QA: 'ar', KW: 'ar', BH: 'ar', OM: 'ar',
  EG: 'ar', IQ: 'ar', JO: 'ar', LB: 'ar', SY: 'ar', YE: 'ar', PS: 'ar',
  IL: 'he', IR: 'fa', PK: 'ur', TR: 'tr',
};

// Country to currency mapping
export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  SA: 'SAR', AE: 'AED', QA: 'QAR', KW: 'KWD', BH: 'BHD', OM: 'OMR',
  EG: 'EGP', IL: 'ILS', TR: 'TRY', IR: 'IRR', PK: 'PKR',
  US: 'USD', GB: 'GBP', EU: 'EUR',
};

// VPN/proxy detection patterns (simplified)
const VPN_INDICATORS = [
  'datacenter',
  'hosting',
  'cloud',
  'proxy',
  'tor',
];

const COUNTRY_NAME_MAP: Record<string, string> = {
  SA: 'Saudi Arabia', AE: 'United Arab Emirates', QA: 'Qatar',
  KW: 'Kuwait', BH: 'Bahrain', OM: 'Oman', EG: 'Egypt',
  IQ: 'Iraq', JO: 'Jordan', LB: 'Lebanon', SY: 'Syria',
  YE: 'Yemen', PS: 'Palestine', IL: 'Israel', IR: 'Iran',
  PK: 'Pakistan', TR: 'Turkey', US: 'United States', GB: 'United Kingdom',
};

const COUNTRY_TIMEZONE_MAP: Record<string, string> = {
  SA: 'Asia/Riyadh', AE: 'Asia/Dubai', QA: 'Asia/Qatar',
  KW: 'Asia/Kuwait', BH: 'Asia/Bahrain', OM: 'Asia/Muscat',
  EG: 'Africa/Cairo', IL: 'Asia/Jerusalem', TR: 'Europe/Istanbul',
  IR: 'Asia/Tehran', PK: 'Asia/Karachi', US: 'America/New_York',
};

/**
 * Detect location from request headers (CDN geolocation)
 */
export async function detectLocation(request?: Request): Promise<GeoLocation | null> {
  try {
    if (!request) return null;

    const headers = request.headers;
    const countryCode =
      headers.get('CF-IPCountry') ||
      headers.get('X-Vercel-IP-Country') ||
      headers.get('X-Country-Code');

    if (!countryCode || countryCode === 'XX' || countryCode === 'T1') {
      return null;
    }

    const code = countryCode.toUpperCase();
    return {
      country: COUNTRY_NAME_MAP[code] || code,
      countryCode: code,
      timezone: COUNTRY_TIMEZONE_MAP[code] || 'UTC',
      currency: COUNTRY_CURRENCY_MAP[code] || 'USD',
      language: COUNTRY_LANGUAGE_MAP[code] || 'en',
    };
  } catch {
    return null;
  }
}

/**
 * Detect browser language
 */
export function detectBrowserLanguage(): string {
  if (typeof window === 'undefined') return 'en';
  
  const browserLang = navigator.language || (navigator as any).userLanguage || 'en';
  return browserLang.split('-')[0];
}

/**
 * Detect browser locale (with region)
 */
export function detectBrowserLocale(): string {
  if (typeof window === 'undefined') return 'en-US';
  
  return navigator.language || (navigator as any).userLanguage || 'en-US';
}

/**
 * Get suggested settings based on location
 */
export function getSuggestedSettings(location: GeoLocation): {
  language: string;
  currency: string;
  direction: 'ltr' | 'rtl';
} {
  const lang = location.language || 'en';
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  
  return {
    language: lang,
    currency: location.currency || 'USD',
    direction: rtlLanguages.includes(lang) ? 'rtl' : 'ltr',
  };
}

/**
 * Check if country is allowed
 */
export function isCountryAllowed(
  countryCode: string,
  config: GeoConfig
): boolean {
  if (config.blockedCountries.includes(countryCode)) {
    return false;
  }
  
  if (config.allowedCountries.length > 0) {
    return config.allowedCountries.includes(countryCode);
  }
  
  return true;
}

/**
 * Detect if user is likely using VPN (simplified)
 */
export function detectVPN(location: GeoLocation, request?: Request): boolean {
  if (!request) return false;

  const headers = request.headers;

  // Check for Tor exit nodes (Cloudflare reports T1)
  if (headers.get('CF-IPCountry') === 'T1') return true;

  // Check X-Forwarded-For for long proxy chains (3+ hops)
  const xff = headers.get('X-Forwarded-For');
  if (xff && xff.split(',').length > 3) return true;

  // Check Via header for datacenter/proxy indicators
  const via = headers.get('Via') || '';
  if (VPN_INDICATORS.some((ind) => via.toLowerCase().includes(ind))) return true;

  return false;
}

/**
 * Check if geolocation is privacy-compliant
 */
export function checkPrivacyCompliance(
  location: GeoLocation,
  config: GeoConfig
): { compliant: boolean; reason?: string } {
  if (config.privacyMode === 'strict' && !location.privacyConsent) {
    return { compliant: false, reason: 'Privacy consent required in strict mode' };
  }
  
  if (config.privacyMode === 'strict' && location.isVPN) {
    return { compliant: false, reason: 'VPN detected in strict mode' };
  }
  
  return { compliant: true };
}

/**
 * Store location preference
 */
export function storeLocationPreference(location: Partial<GeoLocation>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('detected_location', JSON.stringify(location));
}

/**
 * Get stored location preference
 */
export function getStoredLocationPreference(): Partial<GeoLocation> | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('detected_location');
  return stored ? JSON.parse(stored) : null;
}

/**
 * Get timezone offset
 */
export function getTimezoneOffset(): number {
  return new Date().getTimezoneOffset();
}

/**
 * Format location for display
 */
export function formatLocation(location: GeoLocation, locale: string = 'en'): string {
  const parts = [location.city, location.region, location.country].filter(Boolean);
  return parts.join(', ');
}

/**
 * Get language from country code
 */
export function getLanguageFromCountry(countryCode: string): string {
  return COUNTRY_LANGUAGE_MAP[countryCode] || 'en';
}

/**
 * Get currency from country code
 */
export function getCurrencyFromCountry(countryCode: string): string {
  return COUNTRY_CURRENCY_MAP[countryCode] || 'USD';
}
