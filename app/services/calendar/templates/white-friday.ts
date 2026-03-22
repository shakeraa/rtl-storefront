/**
 * White Friday Campaign Template
 * T0005: Regional Calendar - White Friday (MENA Black Friday)
 *
 * White Friday is the MENA equivalent of Black Friday, popularized by Souq.com
 * (now Amazon.ae). It falls on the last Friday of November.
 */

export interface WhiteFridayTemplate {
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
  durationDays: number;
}

export const WHITE_FRIDAY_TEMPLATE: WhiteFridayTemplate = {
  id: 'white-friday',
  name: 'White Friday',
  nameAr: 'الجمعة البيضاء',
  description: 'White Friday — the biggest sale event in the MENA region',
  descriptionAr: 'الجمعة البيضاء — أكبر حدث تخفيضات في منطقة الشرق الأوسط وشمال أفريقيا',
  bannerText: 'White Friday — Biggest Sale of the Year',
  bannerTextAr: 'الجمعة البيضاء — أكبر تنزيلات السنة',
  subText: 'Limited time offers — shop now before it is too late!',
  subTextAr: 'عروض لوقت محدود — تسوق الآن قبل فوات الأوان!',
  colorScheme: {
    primaryColor: '#ffffff',      // Clean white (signature)
    secondaryColor: '#000000',    // High-contrast black
    accentColor: '#ff0000',       // Urgency red
    backgroundColor: '#f5f5f5',
    textColor: '#111111',
  },
  cssClasses: [
    'rtl-white-friday-banner',
    'rtl-countdown-timer',
    'rtl-flash-sale-badge',
    'rtl-urgency-strip',
  ],
  defaultDiscount: 50,
  freeShipping: true,
  bundleDeals: true,
  countries: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'EG'],
  durationDays: 4, // Friday through Monday
};

/**
 * Calculate the White Friday date for a given year.
 * White Friday = last Friday of November.
 */
export function getWhiteFridayDate(year: number): Date {
  // Start from Nov 30 and walk backward to the previous Friday (day 5)
  const nov30 = new Date(year, 10, 30); // month is 0-indexed
  const dayOfWeek = nov30.getDay(); // 0 = Sunday, 5 = Friday

  // Days to subtract to reach the last Friday on or before Nov 30
  const daysToSubtract = (dayOfWeek + 2) % 7; // shift so Friday=0
  const lastFriday = new Date(nov30);
  lastFriday.setDate(nov30.getDate() - daysToSubtract);

  return lastFriday;
}

/**
 * Get the full White Friday campaign date range for a given year.
 */
export function getWhiteFridayDateRange(year: number): { start: Date; end: Date } {
  const start = getWhiteFridayDate(year);
  const end = new Date(start);
  end.setDate(start.getDate() + WHITE_FRIDAY_TEMPLATE.durationDays);
  return { start, end };
}
