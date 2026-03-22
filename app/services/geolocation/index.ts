/**
 * Geolocation Detection Service
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
}

export interface GeoConfig {
  autoDetect: boolean;
  redirectOnDetect: boolean;
  allowedCountries: string[];
  blockedCountries: string[];
}

// Country to language mapping
export const COUNTRY_LANGUAGE_MAP: Record<string, string> = {
  SA: 'ar',
  AE: 'ar',
  QA: 'ar',
  KW: 'ar',
  BH: 'ar',
  OM: 'ar',
  EG: 'ar',
  IQ: 'ar',
  JO: 'ar',
  LB: 'ar',
  SY: 'ar',
  YE: 'ar',
  PS: 'ar',
  IL: 'he',
  IR: 'fa',
  PK: 'ur',
};

// Country to currency mapping
export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  SA: 'SAR',
  AE: 'AED',
  QA: 'QAR',
  KW: 'KWD',
  BH: 'BHD',
  OM: 'OMR',
  EG: 'EGP',
  IL: 'ILS',
  TR: 'TRY',
};

// Detect location from IP (placeholder)
export async function detectLocation(): Promise<GeoLocation | null> {
  try {
    // In production, this would call a geolocation API
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      country: data.country_name,
      countryCode: data.country_code,
      city: data.city,
      region: data.region,
      timezone: data.timezone,
      currency: COUNTRY_CURRENCY_MAP[data.country_code] || 'USD',
      language: COUNTRY_LANGUAGE_MAP[data.country_code] || 'en',
      coordinates: {
        latitude: data.latitude,
        longitude: data.longitude,
      },
    };
  } catch {
    return null;
  }
}

// Get suggested settings based on location
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

// Check if country is allowed
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

// Export all
export * from './constants';
