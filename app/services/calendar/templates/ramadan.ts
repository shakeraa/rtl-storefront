/**
 * Ramadan Campaign Template
 * T0005: Regional Calendar - Seasonal Campaign Templates
 */

import { fromHijri, toHijri } from '../hijri';

export interface RamadanTemplate {
  id: string;
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
    textColorAr: string;
  };
  cssClasses: string[];
  defaultDiscount: number;
  freeShipping: boolean;
  bundleDeals: boolean;
  countries: string[];
}

export const RAMADAN_TEMPLATE: RamadanTemplate = {
  id: 'ramadan',
  name: 'Ramadan Kareem',
  nameAr: 'رمضان كريم',
  description: 'Ramadan seasonal campaign with Islamic-inspired design',
  descriptionAr: 'حملة رمضان الموسمية بتصميم إسلامي مستوحى',
  bannerText: 'Ramadan Kareem — Blessed Month Special Offers',
  bannerTextAr: 'رمضان كريم — عروض الشهر الفضيل',
  subText: 'Celebrate the holy month with exclusive discounts',
  subTextAr: 'احتفل بالشهر الكريم بخصومات حصرية',
  colorScheme: {
    primaryColor: '#1a5f2a',      // Deep Islamic green
    secondaryColor: '#d4af37',    // Gold
    accentColor: '#c8a951',       // Warm gold
    backgroundColor: '#0d3318',   // Dark forest green
    textColor: '#ffffff',
    textColorAr: '#f5e6c8',       // Warm cream for Arabic
  },
  cssClasses: [
    'rtl-ramadan-banner',
    'rtl-ramadan-overlay',
    'rtl-crescent-decoration',
    'rtl-arabic-pattern-bg',
  ],
  defaultDiscount: 20,
  freeShipping: true,
  bundleDeals: true,
  countries: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'EG', 'JO', 'LB', 'MA', 'DZ', 'TN'],
};

/**
 * Calculate Ramadan start and end dates for a given Gregorian year.
 * Returns approximate dates by finding Hijri month 9 of the corresponding year.
 */
export function getRamadanDates(gregorianYear: number): { start: Date; end: Date } {
  // Approximate the Hijri year by back-calculating from a known reference
  const referenceGregorian = new Date(gregorianYear, 0, 1);
  const referenceHijri = toHijri(referenceGregorian);

  // Ramadan is Hijri month 9
  const ramadanStart = fromHijri({
    year: referenceHijri.month <= 9 ? referenceHijri.year : referenceHijri.year + 1,
    month: 9,
    day: 1,
  });

  // Ramadan lasts 29 or 30 days; use 30 for a safe estimate
  const ramadanEnd = fromHijri({
    year: referenceHijri.month <= 9 ? referenceHijri.year : referenceHijri.year + 1,
    month: 10,
    day: 1,
  });

  return { start: ramadanStart, end: ramadanEnd };
}
