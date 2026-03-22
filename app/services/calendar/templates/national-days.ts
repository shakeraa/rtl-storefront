/**
 * National Days Campaign Templates
 * T0005: Regional Calendar - UAE National Day & Saudi National Day
 *
 * UAE National Day  — December 2 (fixed Gregorian date)
 * Saudi National Day — September 23 (fixed Gregorian date)
 */

export interface NationalDayTemplate {
  id: string;
  country: string;
  countryCode: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  bannerText: string;
  bannerTextAr: string;
  subText: string;
  subTextAr: string;
  colorScheme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
  };
  cssClasses: string[];
  defaultDiscount: number;
  freeShipping: boolean;
  bundleDeals: boolean;
  /** Fixed Gregorian date: month is 1-indexed */
  date: { month: number; day: number };
  /** How many days before the date to start the campaign */
  leadDays: number;
  /** How many days after the date to end the campaign */
  trailDays: number;
}

// ---------------------------------------------------------------------------
// UAE National Day — December 2
// ---------------------------------------------------------------------------

export const UAE_NATIONAL_DAY_TEMPLATE: NationalDayTemplate = {
  id: 'uae-national-day',
  country: 'United Arab Emirates',
  countryCode: 'AE',
  name: 'UAE National Day',
  nameAr: 'اليوم الوطني الإماراتي',
  description: 'UAE National Day (December 2) — celebrate the union of the Emirates',
  descriptionAr: 'اليوم الوطني الإماراتي (2 ديسمبر) — احتفل باتحاد الإمارات',
  bannerText: 'Happy UAE National Day — December 2',
  bannerTextAr: 'بمناسبة اليوم الوطني الإماراتي — 2 ديسمبر',
  subText: 'Celebrating 50+ years of unity, progress, and prosperity',
  subTextAr: 'نحتفل بأكثر من 50 عاماً من الوحدة والتقدم والازدهار',
  colorScheme: {
    primaryColor: '#00732f',   // UAE flag green
    secondaryColor: '#ff0000', // UAE flag red
    accentColor: '#ffffff',    // UAE flag white
    backgroundColor: '#000000',// UAE flag black
    textColor: '#ffffff',
  },
  cssClasses: [
    'rtl-uae-national-day-banner',
    'rtl-flag-colors-ae',
    'rtl-fireworks-decoration',
    'rtl-unity-theme',
  ],
  defaultDiscount: 15,
  freeShipping: false,
  bundleDeals: false,
  date: { month: 12, day: 2 },
  leadDays: 3,
  trailDays: 1,
};

// ---------------------------------------------------------------------------
// Saudi National Day — September 23
// ---------------------------------------------------------------------------

export const SAUDI_NATIONAL_DAY_TEMPLATE: NationalDayTemplate = {
  id: 'saudi-national-day',
  country: 'Kingdom of Saudi Arabia',
  countryCode: 'SA',
  name: 'Saudi National Day',
  nameAr: 'اليوم الوطني السعودي',
  description: 'Saudi National Day (September 23) — celebrate the Kingdom of Saudi Arabia',
  descriptionAr: 'اليوم الوطني السعودي (23 سبتمبر) — احتفل بالمملكة العربية السعودية',
  bannerText: 'Happy Saudi National Day — September 23',
  bannerTextAr: 'بمناسبة اليوم الوطني السعودي — 23 سبتمبر',
  subText: 'Celebrating the founding of the Kingdom with 23% off',
  subTextAr: 'نحتفل بتأسيس المملكة بخصم 23٪',
  colorScheme: {
    primaryColor: '#006c35',   // Saudi flag green
    secondaryColor: '#ffffff', // Saudi flag white (sword & shahada)
    accentColor: '#c8a951',    // Gold accent
    backgroundColor: '#004a25',
    textColor: '#ffffff',
  },
  cssClasses: [
    'rtl-saudi-national-day-banner',
    'rtl-flag-colors-sa',
    'rtl-palm-sword-decoration',
    'rtl-kingdom-theme',
  ],
  defaultDiscount: 23, // 23% discount to match September 23
  freeShipping: true,
  bundleDeals: false,
  date: { month: 9, day: 23 },
  leadDays: 3,
  trailDays: 1,
};

// All national day templates
export const NATIONAL_DAY_TEMPLATES: NationalDayTemplate[] = [
  UAE_NATIONAL_DAY_TEMPLATE,
  SAUDI_NATIONAL_DAY_TEMPLATE,
];

/**
 * Get the national day campaign date range for a given country and year.
 * Returns null if the country is not configured.
 */
export function getNationalDayCampaignRange(
  countryCode: string,
  year: number
): { start: Date; end: Date; template: NationalDayTemplate } | null {
  const template = NATIONAL_DAY_TEMPLATES.find((t) => t.countryCode === countryCode);
  if (!template) return null;

  // month in template is 1-indexed; Date constructor uses 0-indexed months
  const eventDate = new Date(year, template.date.month - 1, template.date.day);

  const start = new Date(eventDate);
  start.setDate(eventDate.getDate() - template.leadDays);

  const end = new Date(eventDate);
  end.setDate(eventDate.getDate() + template.trailDays);

  return { start, end, template };
}
