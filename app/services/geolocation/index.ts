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

/**
 * Detect location from IP (placeholder for actual geolocation API)
 */
export async function detectLocation(): Promise<GeoLocation | null> {
  try {
    // In production, this would call a geolocation API
    // For now, return a mock detection
    return {
      country: 'Saudi Arabia',
      countryCode: 'SA',
      timezone: 'Asia/Riyadh',
      currency: 'SAR',
      language: 'ar',
      coordinates: { latitude: 24.7136, longitude: 46.6753 },
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
export function detectVPN(location: GeoLocation): boolean {
  // In production, this would check against known VPN/datacenter IP ranges
  // For now, return false as placeholder
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
