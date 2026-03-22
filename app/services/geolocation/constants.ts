/**
 * Geolocation Service Constants
 */

export const MENA_COUNTRIES = [
  'SA', 'AE', 'QA', 'KW', 'BH', 'OM', // GCC
  'EG', 'IQ', 'JO', 'LB', 'SY', 'YE', 'PS', // Levant
  'DZ', 'MA', 'TN', 'LY', 'MR', // North Africa
];

export const RTL_COUNTRIES = [
  ...MENA_COUNTRIES,
  'IL', // Israel (Hebrew)
  'IR', // Iran (Persian)
  'PK', // Pakistan (Urdu)
];

export const DEFAULT_GEO_CONFIG = {
  autoDetect: true,
  redirectOnDetect: false,
  allowedCountries: [],
  blockedCountries: [],
};
