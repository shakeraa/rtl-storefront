/**
 * Currency Service - Main entry point
 */

export * from './constants';
export * from './converter';
export * from './exchange';

import { getCurrency, CURRENCIES, type Currency } from './constants';
import { formatPrice, convert, parsePrice } from './converter';
import { getExchangeRate, getExchangeRates } from './exchange';

/**
 * Currency configuration for a store
 */
export interface CurrencyConfig {
  baseCurrency: string;
  supportedCurrencies: string[];
  defaultDisplayCurrency?: string;
  autoDetectLocation?: boolean;
  roundingRules?: Record<string, { rule: 'nearest' | 'up' | 'down'; to: number }>;
}

/**
 * Get all supported currencies for a store
 */
export function getSupportedCurrencies(config: CurrencyConfig): Currency[] {
  return config.supportedCurrencies
    .map((code) => getCurrency(code))
    .filter((c): c is Currency => c !== undefined);
}

/**
 * Format price in store's default currency
 */
export async function formatStorePrice(
  amount: number,
  config: CurrencyConfig,
  targetCurrency?: string
): Promise<string> {
  const displayCurrency = targetCurrency || config.defaultDisplayCurrency || config.baseCurrency;
  
  if (displayCurrency === config.baseCurrency) {
    return formatPrice(amount, displayCurrency);
  }
  
  // Convert to display currency
  const rate = await getExchangeRate(config.baseCurrency, displayCurrency);
  const converted = convert(amount, config.baseCurrency, displayCurrency, rate.rate);
  
  return converted.formatted;
}

/**
 * Detect currency from country code
 */
export function detectCurrencyFromCountry(countryCode: string): Currency | undefined {
  return CURRENCIES.find((c) => c.countries.includes(countryCode.toUpperCase()));
}

/**
 * Validate currency configuration
 */
export function validateCurrencyConfig(config: CurrencyConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check base currency
  if (!getCurrency(config.baseCurrency)) {
    errors.push(`Invalid base currency: ${config.baseCurrency}`);
  }
  
  // Check supported currencies
  config.supportedCurrencies.forEach((code) => {
    if (!getCurrency(code)) {
      errors.push(`Invalid supported currency: ${code}`);
    }
  });
  
  // Check default display currency
  if (config.defaultDisplayCurrency && !getCurrency(config.defaultDisplayCurrency)) {
    errors.push(`Invalid default display currency: ${config.defaultDisplayCurrency}`);
  }
  
  // Ensure base currency is in supported list
  if (!config.supportedCurrencies.includes(config.baseCurrency)) {
    errors.push('Base currency must be in supported currencies list');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Default currency configuration
 */
export const DEFAULT_CURRENCY_CONFIG: CurrencyConfig = {
  baseCurrency: 'USD',
  supportedCurrencies: ['USD', 'EUR', 'GBP', 'SAR', 'AED'],
  autoDetectLocation: true,
};
