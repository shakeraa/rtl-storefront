/**
 * Currency Rounding Rules
 * Per-currency price rounding strategies
 */

export interface RoundingRule {
  currency: string;
  strategy: 'none' | 'nearest' | 'up' | 'down';
  precision: number;
}

/**
 * Default rounding rules per currency
 * precision = number of decimal places to round to
 */
const DEFAULT_ROUNDING_RULES: RoundingRule[] = [
  // Zero-decimal currencies — round to nearest integer
  { currency: 'JPY', strategy: 'nearest', precision: 0 },
  { currency: 'KRW', strategy: 'nearest', precision: 0 },
  { currency: 'VND', strategy: 'nearest', precision: 0 },
  { currency: 'CLP', strategy: 'nearest', precision: 0 },
  { currency: 'UGX', strategy: 'nearest', precision: 0 },
  { currency: 'RWF', strategy: 'nearest', precision: 0 },
  { currency: 'XOF', strategy: 'nearest', precision: 0 },
  { currency: 'XAF', strategy: 'nearest', precision: 0 },

  // Three-decimal currencies
  { currency: 'KWD', strategy: 'nearest', precision: 3 },
  { currency: 'BHD', strategy: 'nearest', precision: 3 },
  { currency: 'OMR', strategy: 'nearest', precision: 3 },
  { currency: 'JOD', strategy: 'nearest', precision: 3 },
  { currency: 'TND', strategy: 'nearest', precision: 3 },

  // Standard two-decimal currencies — explicit entries for MENA where
  // merchants often prefer rounding up to avoid fractional pricing
  { currency: 'SAR', strategy: 'nearest', precision: 2 },
  { currency: 'AED', strategy: 'nearest', precision: 2 },
  { currency: 'QAR', strategy: 'nearest', precision: 2 },
  { currency: 'EGP', strategy: 'nearest', precision: 2 },
  { currency: 'MAD', strategy: 'nearest', precision: 2 },
  { currency: 'DZD', strategy: 'nearest', precision: 2 },
  { currency: 'LBP', strategy: 'nearest', precision: 2 },

  // Major two-decimal currencies
  { currency: 'USD', strategy: 'nearest', precision: 2 },
  { currency: 'EUR', strategy: 'nearest', precision: 2 },
  { currency: 'GBP', strategy: 'nearest', precision: 2 },
  { currency: 'CAD', strategy: 'nearest', precision: 2 },
  { currency: 'AUD', strategy: 'nearest', precision: 2 },
  { currency: 'CHF', strategy: 'nearest', precision: 2 },
  { currency: 'CNY', strategy: 'nearest', precision: 2 },
  { currency: 'INR', strategy: 'nearest', precision: 2 },
  { currency: 'BRL', strategy: 'nearest', precision: 2 },
  { currency: 'MXN', strategy: 'nearest', precision: 2 },
  { currency: 'TRY', strategy: 'nearest', precision: 2 },
  { currency: 'ZAR', strategy: 'nearest', precision: 2 },
  { currency: 'SEK', strategy: 'nearest', precision: 2 },
  { currency: 'NOK', strategy: 'nearest', precision: 2 },
  { currency: 'DKK', strategy: 'nearest', precision: 2 },
  { currency: 'PLN', strategy: 'nearest', precision: 2 },
  { currency: 'CZK', strategy: 'nearest', precision: 2 },
  { currency: 'HUF', strategy: 'nearest', precision: 2 },
  { currency: 'ILS', strategy: 'nearest', precision: 2 },
  { currency: 'SGD', strategy: 'nearest', precision: 2 },
  { currency: 'HKD', strategy: 'nearest', precision: 2 },
  { currency: 'NZD', strategy: 'nearest', precision: 2 },
  { currency: 'THB', strategy: 'nearest', precision: 2 },
  { currency: 'MYR', strategy: 'nearest', precision: 2 },
  { currency: 'IDR', strategy: 'nearest', precision: 2 },
  { currency: 'PHP', strategy: 'nearest', precision: 2 },
  { currency: 'PKR', strategy: 'nearest', precision: 2 },
  { currency: 'NGN', strategy: 'nearest', precision: 2 },
  { currency: 'KES', strategy: 'nearest', precision: 2 },
  { currency: 'GHS', strategy: 'nearest', precision: 2 },
  { currency: 'RUB', strategy: 'nearest', precision: 2 },
  { currency: 'COP', strategy: 'nearest', precision: 2 },
  { currency: 'ARS', strategy: 'nearest', precision: 2 },
  { currency: 'PEN', strategy: 'nearest', precision: 2 },
];

// Fallback rule for currencies not explicitly listed
const FALLBACK_RULE: RoundingRule = {
  currency: 'DEFAULT',
  strategy: 'nearest',
  precision: 2,
};

/**
 * Get the default rounding rules for all currencies
 */
export function getDefaultRoundingRules(): RoundingRule[] {
  return [...DEFAULT_ROUNDING_RULES];
}

/**
 * Get rounding rule for a specific currency code.
 * Returns the fallback rule if the currency is not in the list.
 */
export function getRoundingRule(currency: string): RoundingRule {
  const rule = DEFAULT_ROUNDING_RULES.find(
    (r) => r.currency === currency.toUpperCase()
  );
  return rule ?? { ...FALLBACK_RULE, currency: currency.toUpperCase() };
}

/**
 * Round a price amount according to the rule for the given currency.
 *
 * @param amount   Raw amount (e.g. result of a conversion)
 * @param currency ISO 4217 currency code
 * @returns        Rounded amount
 */
export function roundPrice(amount: number, currency: string): number {
  const rule = getRoundingRule(currency);
  return applyStrategy(amount, rule.strategy, rule.precision);
}

/**
 * Apply a specific rounding strategy with a given precision.
 */
function applyStrategy(
  amount: number,
  strategy: RoundingRule['strategy'],
  precision: number
): number {
  const factor = Math.pow(10, precision);

  switch (strategy) {
    case 'up':
      return Math.ceil(amount * factor) / factor;
    case 'down':
      return Math.floor(amount * factor) / factor;
    case 'none':
      return amount;
    case 'nearest':
    default:
      return Math.round(amount * factor) / factor;
  }
}
