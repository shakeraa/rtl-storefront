/**
 * Currency Converter Service
 * Handles price conversions between currencies
 */

import { getCurrency, type RoundingRule, DEFAULT_ROUNDING } from './constants';

export interface ConversionResult {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  targetCurrency: string;
  exchangeRate: number;
  formatted: string;
  timestamp: Date;
}

export interface ConversionOptions {
  round?: boolean;
  roundingRule?: RoundingRule;
  includeSymbol?: boolean;
}

/**
 * Convert amount between currencies
 */
export function convert(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRate: number,
  options: ConversionOptions = {}
): ConversionResult {
  const { round = true, roundingRule = DEFAULT_ROUNDING } = options;
  
  // Calculate converted amount
  let convertedAmount = amount * exchangeRate;
  
  // Apply rounding
  if (round) {
    convertedAmount = applyRounding(convertedAmount, roundingRule);
  }
  
  // Get target currency for formatting
  const targetCurrencyInfo = getCurrency(toCurrency);
  
  return {
    originalAmount: amount,
    originalCurrency: fromCurrency,
    convertedAmount,
    targetCurrency: toCurrency,
    exchangeRate,
    formatted: formatPrice(convertedAmount, toCurrency),
    timestamp: new Date(),
  };
}

/**
 * Apply rounding rule to amount
 */
export function applyRounding(amount: number, rule: RoundingRule): number {
  const factor = 1 / rule.to;
  
  switch (rule.rule) {
    case 'nearest':
      return Math.round(amount * factor) / factor;
    case 'up':
      return Math.ceil(amount * factor) / factor;
    case 'down':
      return Math.floor(amount * factor) / factor;
    case 'none':
    default:
      return amount;
  }
}

/**
 * Format price for display
 */
export function formatPrice(
  amount: number,
  currencyCode: string,
  options: {
    includeSymbol?: boolean;
    useCode?: boolean;
    decimals?: number;
  } = {}
): string {
  const { includeSymbol = true, useCode = false, decimals } = options;
  
  const currency = getCurrency(currencyCode);
  if (!currency) {
    return `${amount} ${currencyCode}`;
  }
  
  const decimalPlaces = decimals ?? currency.decimals;
  
  // Format number with separators
  const formattedNumber = formatNumber(
    amount,
    decimalPlaces,
    currency.thousandsSeparator,
    currency.decimalSeparator
  );
  
  if (!includeSymbol) {
    return formattedNumber;
  }
  
  if (useCode) {
    return `${formattedNumber} ${currencyCode}`;
  }
  
  // Apply symbol position
  if (currency.symbolPosition === 'before') {
    return currency.spaceBetween 
      ? `${currency.symbol} ${formattedNumber}`
      : `${currency.symbol}${formattedNumber}`;
  } else {
    return currency.spaceBetween
      ? `${formattedNumber} ${currency.symbol}`
      : `${formattedNumber}${currency.symbol}`;
  }
}

/**
 * Format number with separators
 */
function formatNumber(
  amount: number,
  decimals: number,
  thousandsSeparator: string,
  decimalSeparator: string
): string {
  // Round to specified decimals
  const factor = Math.pow(10, decimals);
  const rounded = Math.round(amount * factor) / factor;
  
  // Split into integer and decimal parts
  const [integerPart, decimalPart] = rounded.toFixed(decimals).split('.');
  
  // Add thousands separators
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
  
  if (decimals === 0 || !decimalPart) {
    return formattedInteger;
  }
  
  return `${formattedInteger}${decimalSeparator}${decimalPart}`;
}

/**
 * Parse formatted price string back to number
 */
export function parsePrice(priceString: string, currencyCode: string): number {
  const currency = getCurrency(currencyCode);
  if (!currency) {
    // Try generic parsing
    return parseFloat(priceString.replace(/[^0-9.-]/g, ''));
  }
  
  // Remove currency symbol
  let cleaned = priceString.replace(currency.symbol, '').trim();
  
  // Remove currency code if present
  cleaned = cleaned.replace(currencyCode, '').trim();
  
  // Replace thousands separator with empty
  cleaned = cleaned.split(currency.thousandsSeparator).join('');
  
  // Replace decimal separator with standard decimal point
  cleaned = cleaned.replace(currency.decimalSeparator, '.');
  
  return parseFloat(cleaned);
}

/**
 * Batch convert multiple prices
 */
export function batchConvert(
  items: Array<{ amount: number; id?: string }>,
  fromCurrency: string,
  toCurrency: string,
  exchangeRate: number,
  options?: ConversionOptions
): Array<ConversionResult & { id?: string }> {
  return items.map((item) => ({
    ...convert(item.amount, fromCurrency, toCurrency, exchangeRate, options),
    id: item.id,
  }));
}

/**
 * Calculate exchange rate from two amounts
 */
export function calculateExchangeRate(
  fromAmount: number,
  toAmount: number
): number {
  if (fromAmount === 0) return 0;
  return toAmount / fromAmount;
}

/**
 * Check if conversion is needed
 */
export function needsConversion(fromCurrency: string, toCurrency: string): boolean {
  return fromCurrency.toUpperCase() !== toCurrency.toUpperCase();
}

/**
 * Compare prices in different currencies
 */
export function comparePrices(
  price1: { amount: number; currency: string },
  price2: { amount: number; currency: string },
  exchangeRate1to2: number
): number {
  if (price1.currency === price2.currency) {
    return price1.amount - price2.amount;
  }
  
  const converted = convert(price1.amount, price1.currency, price2.currency, exchangeRate1to2);
  return converted.convertedAmount - price2.amount;
}

/**
 * Get price range display
 */
export function formatPriceRange(
  min: number,
  max: number,
  currencyCode: string,
  options?: {
    includeSymbol?: boolean;
    useCode?: boolean;
  }
): string {
  const minFormatted = formatPrice(min, currencyCode, options);
  const maxFormatted = formatPrice(max, currencyCode, options);
  
  if (min === max) {
    return minFormatted;
  }
  
  return `${minFormatted} - ${maxFormatted}`;
}

/**
 * Calculate percentage change between prices
 */
export function calculatePriceChange(
  originalPrice: number,
  newPrice: number,
  currencyCode: string
): {
  absolute: number;
  percentage: number;
  formatted: string;
  direction: 'increase' | 'decrease' | 'same';
} {
  const absolute = newPrice - originalPrice;
  const percentage = originalPrice !== 0 ? (absolute / originalPrice) * 100 : 0;
  
  let direction: 'increase' | 'decrease' | 'same';
  if (absolute > 0) direction = 'increase';
  else if (absolute < 0) direction = 'decrease';
  else direction = 'same';
  
  return {
    absolute,
    percentage,
    formatted: formatPrice(Math.abs(absolute), currencyCode),
    direction,
  };
}

/**
 * Format price with HTML for styling
 */
export function formatPriceHtml(
  amount: number,
  currencyCode: string,
  options?: {
    symbolClass?: string;
    amountClass?: string;
    codeClass?: string;
  }
): string {
  const currency = getCurrency(currencyCode);
  const formattedAmount = formatPrice(amount, currencyCode, { includeSymbol: false });
  
  const symbolSpan = options?.symbolClass 
    ? `<span class="${options.symbolClass}">${currency?.symbol || currencyCode}</span>`
    : (currency?.symbol || currencyCode);
  
  const amountSpan = options?.amountClass
    ? `<span class="${options.amountClass}">${formattedAmount}</span>`
    : formattedAmount;
  
  if (currency?.symbolPosition === 'before') {
    return `${symbolSpan}${currency?.spaceBetween ? ' ' : ''}${amountSpan}`;
  } else {
    return `${amountSpan}${currency?.spaceBetween ? ' ' : ''}${symbolSpan}`;
  }
}
