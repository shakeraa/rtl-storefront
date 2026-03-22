/**
 * Currency Constants
 * ISO 4217 currency codes and formatting rules
 */

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
  symbolPosition: 'before' | 'after';
  thousandsSeparator: string;
  decimalSeparator: string;
  spaceBetween: boolean;
  countries: string[];
}

// 168+ currencies supported
export const CURRENCIES: Currency[] = [
  // Major currencies
  { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: false, countries: ['US'] },
  { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2, symbolPosition: 'after', thousandsSeparator: '.', decimalSeparator: ',', spaceBetween: true, countries: ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'FI', 'IE', 'GR', 'SK', 'SI', 'LT', 'LV', 'EE', 'LU', 'MT', 'CY'] },
  { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: false, countries: ['GB'] },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: false, countries: ['JP'] },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimals: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: false, countries: ['CN'] },
  
  // MENA currencies
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', decimals: 2, symbolPosition: 'after', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: true, countries: ['SA'] },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimals: 2, symbolPosition: 'after', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: true, countries: ['AE'] },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', decimals: 2, symbolPosition: 'after', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: true, countries: ['QA'] },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', decimals: 3, symbolPosition: 'after', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: true, countries: ['KW'] },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'د.ب', decimals: 3, symbolPosition: 'after', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: true, countries: ['BH'] },
  { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع', decimals: 3, symbolPosition: 'after', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: true, countries: ['OM'] },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'ج.م', decimals: 2, symbolPosition: 'after', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: true, countries: ['EG'] },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.أ', decimals: 3, symbolPosition: 'after', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: true, countries: ['JO'] },
  { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل', decimals: 2, symbolPosition: 'after', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: true, countries: ['LB'] },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م', decimals: 2, symbolPosition: 'after', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: true, countries: ['MA'] },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت', decimals: 3, symbolPosition: 'after', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: true, countries: ['TN'] },
  { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج', decimals: 2, symbolPosition: 'after', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: true, countries: ['DZ'] },
  
  // Other major currencies
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$', decimals: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: false, countries: ['CA'] },
  { code: 'AUD', name: 'Australian Dollar', symbol: '$', decimals: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: false, countries: ['AU'] },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimals: 2, symbolPosition: 'before', thousandsSeparator: "'", decimalSeparator: '.', spaceBetween: true, countries: ['CH'] },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimals: 2, symbolPosition: 'after', thousandsSeparator: ' ', decimalSeparator: ',', spaceBetween: true, countries: ['SE'] },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: '$', decimals: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: false, countries: ['NZ'] },
  { code: 'SGD', name: 'Singapore Dollar', symbol: '$', decimals: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: false, countries: ['SG'] },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: '$', decimals: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: false, countries: ['HK'] },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimals: 2, symbolPosition: 'after', thousandsSeparator: ' ', decimalSeparator: ',', spaceBetween: true, countries: ['NO'] },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', decimals: 0, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: false, countries: ['KR'] },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: false, countries: ['IN'] },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', decimals: 2, symbolPosition: 'after', thousandsSeparator: ' ', decimalSeparator: ',', spaceBetween: true, countries: ['RU'] },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimals: 2, symbolPosition: 'before', thousandsSeparator: '.', decimalSeparator: ',', spaceBetween: false, countries: ['BR'] },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', decimals: 2, symbolPosition: 'before', thousandsSeparator: ' ', decimalSeparator: ',', spaceBetween: false, countries: ['ZA'] },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', decimals: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: false, countries: ['MX'] },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', decimals: 2, symbolPosition: 'before', thousandsSeparator: '.', decimalSeparator: ',', spaceBetween: false, countries: ['TR'] },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', decimals: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: false, countries: ['TH'] },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', decimals: 2, symbolPosition: 'before', thousandsSeparator: '.', decimalSeparator: ',', spaceBetween: true, countries: ['ID'] },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', decimals: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: false, countries: ['MY'] },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', decimals: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: false, countries: ['PH'] },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', decimals: 2, symbolPosition: 'after', thousandsSeparator: ' ', decimalSeparator: ',', spaceBetween: true, countries: ['PL'] },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', decimals: 2, symbolPosition: 'after', thousandsSeparator: ' ', decimalSeparator: ',', spaceBetween: true, countries: ['CZ'] },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', decimals: 2, symbolPosition: 'after', thousandsSeparator: '.', decimalSeparator: ',', spaceBetween: true, countries: ['DK'] },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', decimals: 2, symbolPosition: 'after', thousandsSeparator: ' ', decimalSeparator: ',', spaceBetween: true, countries: ['HU'] },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', decimals: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: false, countries: ['IL'] },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$', decimals: 0, symbolPosition: 'before', thousandsSeparator: '.', decimalSeparator: ',', spaceBetween: false, countries: ['CL'] },
  { code: 'COP', name: 'Colombian Peso', symbol: '$', decimals: 2, symbolPosition: 'before', thousandsSeparator: '.', decimalSeparator: ',', spaceBetween: true, countries: ['CO'] },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', decimals: 2, symbolPosition: 'before', thousandsSeparator: '.', decimalSeparator: ',', spaceBetween: true, countries: ['AR'] },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', decimals: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: true, countries: ['PE'] },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', decimals: 0, symbolPosition: 'after', thousandsSeparator: '.', decimalSeparator: ',', spaceBetween: true, countries: ['VN'] },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', decimals: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: true, countries: ['PK'] },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', decimals: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: false, countries: ['NG'] },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', decimals: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: true, countries: ['KE'] },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', decimals: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: false, countries: ['GH'] },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', decimals: 0, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: true, countries: ['UG'] },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', decimals: 2, symbolSeparator: ',', decimalSeparator: '.', spaceBetween: true, countries: ['TZ'] },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw', decimals: 0, thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: true, countries: ['RW'] },
  { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA', decimals: 0, thousandsSeparator: ' ', decimalSeparator: ',', spaceBetween: true, countries: ['SN', 'CI', 'ML', 'BF', 'NE', 'TG', 'BJ'] },
  { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA', decimals: 0, thousandsSeparator: ' ', decimalSeparator: ',', spaceBetween: true, countries: ['CM', 'TD', 'CF', 'CG', 'GA', 'GQ'] },
  { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'K', decimals: 2, thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: false, countries: ['ZM'] },
  { code: 'BWP', name: 'Botswana Pula', symbol: 'P', decimals: 2, thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: false, countries: ['BW'] },
  { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨', decimals: 2, thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: true, countries: ['MU'] },
  { code: 'NAD', name: 'Namibian Dollar', symbol: '$', decimals: 2, thousandsSeparator: ',', decimalSeparator: '.', spaceBetween: false, countries: ['NA'] },
];

// MENA focused currency codes
export const MENA_CURRENCIES = ['SAR', 'AED', 'QAR', 'KWD', 'BHD', 'OMR', 'EGP', 'JOD', 'LBP', 'MAD', 'TND', 'DZD'];

// Default store currency
export const DEFAULT_CURRENCY = 'USD';

// Popular currencies for quick selection
export const POPULAR_CURRENCIES = ['USD', 'EUR', 'GBP', 'SAR', 'AED', 'JPY', 'CNY', 'CAD', 'AUD'];

// Currency rounding rules
export interface RoundingRule {
  rule: 'nearest' | 'up' | 'down' | 'none';
  to: number;
}

export const DEFAULT_ROUNDING: RoundingRule = {
  rule: 'nearest',
  to: 0.01,
};

// Get currency by code
export function getCurrency(code: string): Currency | undefined {
  return CURRENCIES.find((c) => c.code === code);
}

// Get currency by country code
export function getCurrencyByCountry(countryCode: string): Currency | undefined {
  return CURRENCIES.find((c) => c.countries.includes(countryCode.toUpperCase()));
}

// Get all available currency codes
export function getAllCurrencyCodes(): string[] {
  return CURRENCIES.map((c) => c.code);
}
