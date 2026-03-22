/**
 * Size Guide Constants
 */

export const MEASUREMENT_UNITS = {
  cm: { factor: 1, label: 'cm', labelAr: 'سم' },
  inch: { factor: 0.393701, label: 'in', labelAr: 'بوصة' },
};

export const REGIONAL_SIZE_SYSTEMS = {
  GCC: { label: 'GCC', labelAr: 'دول الخليج' },
  MENA: { label: 'MENA', labelAr: 'الشرق الأوسط' },
  EU: { label: 'EU', labelAr: 'أوروبا' },
  US: { label: 'US', labelAr: 'أمريكا' },
  UK: { label: 'UK', labelAr: 'بريطانيا' },
};

export const SIZE_CATEGORIES = [
  'clothing',
  'shoes',
  'accessories',
  'hijab',
] as const;
