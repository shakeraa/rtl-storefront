/**
 * Eid Campaign Templates
 * T0005: Regional Calendar - Eid al-Fitr and Eid al-Adha Templates
 */

import { fromHijri, toHijri } from '../hijri';

export interface EidTemplate {
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
  };
  cssClasses: string[];
  defaultDiscount: number;
  freeShipping: boolean;
  bundleDeals: boolean;
  countries: string[];
}

// ---------------------------------------------------------------------------
// Eid al-Fitr — end of Ramadan (Hijri month 10, day 1)
// ---------------------------------------------------------------------------

export const EID_AL_FITR_TEMPLATE: EidTemplate = {
  id: 'eid-al-fitr',
  name: 'Eid al-Fitr Mubarak',
  nameAr: 'عيد الفطر المبارك',
  description: 'Eid al-Fitr celebration campaign with festive design',
  descriptionAr: 'حملة احتفالية بعيد الفطر المبارك بتصميم مبهج',
  bannerText: 'Eid al-Fitr Mubarak — Celebrate With Joy',
  bannerTextAr: 'عيد الفطر المبارك — احتفل بالفرحة',
  subText: 'Eid gifts & exclusive offers for you and your loved ones',
  subTextAr: 'هدايا العيد وعروض حصرية لك ولأحبائك',
  colorScheme: {
    primaryColor: '#2e8b57',      // Sea green
    secondaryColor: '#ffd700',    // Gold
    accentColor: '#ff8c00',       // Dark orange
    backgroundColor: '#1a5c38',
    textColor: '#ffffff',
  },
  cssClasses: [
    'rtl-eid-fitr-banner',
    'rtl-eid-stars-decoration',
    'rtl-gold-accents',
    'rtl-festive-pattern',
  ],
  defaultDiscount: 25,
  freeShipping: true,
  bundleDeals: false,
  countries: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'EG', 'JO', 'LB', 'MA', 'DZ', 'TN'],
};

// ---------------------------------------------------------------------------
// Eid al-Adha — Feast of Sacrifice (Hijri month 12, day 10)
// ---------------------------------------------------------------------------

export const EID_AL_ADHA_TEMPLATE: EidTemplate = {
  id: 'eid-al-adha',
  name: 'Eid al-Adha Mubarak',
  nameAr: 'عيد الأضحى المبارك',
  description: 'Eid al-Adha campaign with warm earthy tones',
  descriptionAr: 'حملة عيد الأضحى بألوان دافئة وترابية',
  bannerText: 'Eid al-Adha Mubarak — Blessed Feast of Sacrifice',
  bannerTextAr: 'عيد الأضحى المبارك — أضحى مقبول',
  subText: 'Share the joy of Eid with special deals',
  subTextAr: 'شارك فرحة العيد مع عروض مميزة',
  colorScheme: {
    primaryColor: '#8b4513',      // Saddle brown
    secondaryColor: '#f4a460',    // Sandy brown
    accentColor: '#daa520',       // Goldenrod
    backgroundColor: '#5c2a0a',
    textColor: '#fff8f0',
  },
  cssClasses: [
    'rtl-eid-adha-banner',
    'rtl-kaaba-silhouette',
    'rtl-warm-gradient',
    'rtl-desert-pattern',
  ],
  defaultDiscount: 30,
  freeShipping: true,
  bundleDeals: true,
  countries: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'EG', 'JO', 'LB', 'MA', 'DZ', 'TN'],
};

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/**
 * Get Eid al-Fitr date for a given Gregorian year (approximate).
 * Eid al-Fitr = Hijri month 10, day 1.
 */
export function getEidAlFitrDate(gregorianYear: number): Date {
  const referenceHijri = toHijri(new Date(gregorianYear, 0, 1));
  const hijriYear = referenceHijri.month <= 10 ? referenceHijri.year : referenceHijri.year + 1;
  return fromHijri({ year: hijriYear, month: 10, day: 1 });
}

/**
 * Get Eid al-Adha date for a given Gregorian year (approximate).
 * Eid al-Adha = Hijri month 12, day 10.
 */
export function getEidAlAdhaDate(gregorianYear: number): Date {
  const referenceHijri = toHijri(new Date(gregorianYear, 0, 1));
  const hijriYear = referenceHijri.month <= 12 ? referenceHijri.year : referenceHijri.year + 1;
  return fromHijri({ year: hijriYear, month: 12, day: 10 });
}
