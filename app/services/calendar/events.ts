/**
 * Calendar Events Service
 * T0005: Regional Calendar - Event Detection and Scheduling
 */

import { HIJRI_EVENTS, NATIONAL_DAYS, getNationalDay, getUpcomingEvents, toHijri } from './hijri';

export interface CampaignEvent {
  id: string;
  name: string;
  nameAr: string;
  startDate: Date;
  endDate: Date;
  type: 'ramadan' | 'eid-fitr' | 'eid-adha' | 'white-friday' | 'national-day' | 'seasonal';
  countries: string[];
  template: string;
  autoSchedule: boolean;
  discount?: number;
}

export interface SeasonalTemplate {
  id: string;
  name: string;
  nameAr: string;
  type: CampaignEvent['type'];
  bannerText: string;
  bannerTextAr: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundImage?: string;
    fontFamily?: string;
  };
  presets: {
    discount?: number;
    freeShipping?: boolean;
    bundleDeals?: boolean;
  };
}

// Ramadan template
export const RAMADAN_TEMPLATE: SeasonalTemplate = {
  id: 'ramadan-2024',
  name: 'Ramadan Kareem',
  nameAr: 'رمضان كريم',
  type: 'ramadan',
  bannerText: 'Ramadan Kareem - Special Offers',
  bannerTextAr: 'رمضان كريم - عروض خاصة',
  theme: {
    primaryColor: '#1a5f2a',
    secondaryColor: '#d4af37',
    fontFamily: 'Noto Sans Arabic',
  },
  presets: {
    discount: 20,
    freeShipping: true,
    bundleDeals: true,
  },
};

// Eid al-Fitr template
export const EID_AL_FITR_TEMPLATE: SeasonalTemplate = {
  id: 'eid-al-fitr-2024',
  name: 'Eid Mubarak',
  nameAr: 'عيد مبارك',
  type: 'eid-fitr',
  bannerText: 'Celebrate Eid with Style',
  bannerTextAr: 'احتفل بالعيد بأناقة',
  theme: {
    primaryColor: '#2e8b57',
    secondaryColor: '#ffd700',
    fontFamily: 'Noto Sans Arabic',
  },
  presets: {
    discount: 25,
    freeShipping: true,
    bundleDeals: false,
  },
};

// Eid al-Adha template
export const EID_AL_ADHA_TEMPLATE: SeasonalTemplate = {
  id: 'eid-al-adha-2024',
  name: 'Eid Al-Adha Mubarak',
  nameAr: 'عيد الأضحى مبارك',
  type: 'eid-adha',
  bannerText: 'Blessed Eid Al-Adha - Special Offers',
  bannerTextAr: 'عيد أضحى مبارك - عروض خاصة',
  theme: {
    primaryColor: '#8b4513',
    secondaryColor: '#f4a460',
    fontFamily: 'Noto Sans Arabic',
  },
  presets: {
    discount: 30,
    freeShipping: true,
    bundleDeals: true,
  },
};

// White Friday (MENA Black Friday) template
export const WHITE_FRIDAY_TEMPLATE: SeasonalTemplate = {
  id: 'white-friday-2024',
  name: 'White Friday',
  nameAr: 'الجمعة البيضاء',
  type: 'white-friday',
  bannerText: 'White Friday - Biggest Sale of the Year',
  bannerTextAr: 'الجمعة البيضاء - أكبر تنزيلات السنة',
  theme: {
    primaryColor: '#ffffff',
    secondaryColor: '#000000',
    backgroundImage: '/images/white-friday-bg.jpg',
  },
  presets: {
    discount: 50,
    freeShipping: true,
    bundleDeals: true,
  },
};

// UAE National Day template
export const UAE_NATIONAL_DAY_TEMPLATE: SeasonalTemplate = {
  id: 'uae-national-day-2024',
  name: 'UAE National Day',
  nameAr: 'اليوم الوطني الإماراتي',
  type: 'national-day',
  bannerText: 'Celebrate UAE National Day',
  bannerTextAr: 'احتفل باليوم الوطني الإماراتي',
  theme: {
    primaryColor: '#00732f',
    secondaryColor: '#ff0000',
    backgroundImage: '/images/uae-flag.jpg',
  },
  presets: {
    discount: 15,
    freeShipping: false,
    bundleDeals: false,
  },
};

// Saudi National Day template
export const SAUDI_NATIONAL_DAY_TEMPLATE: SeasonalTemplate = {
  id: 'saudi-national-day-2024',
  name: 'Saudi National Day',
  nameAr: 'اليوم الوطني السعودي',
  type: 'national-day',
  bannerText: 'Celebrate Saudi National Day',
  bannerTextAr: 'احتفل باليوم الوطني السعودي',
  theme: {
    primaryColor: '#006c35',
    secondaryColor: '#ffffff',
    backgroundImage: '/images/saudi-flag.jpg',
  },
  presets: {
    discount: 23, // 23% for Sept 23
    freeShipping: true,
    bundleDeals: false,
  },
};

// All templates
export const SEASONAL_TEMPLATES: SeasonalTemplate[] = [
  RAMADAN_TEMPLATE,
  EID_AL_FITR_TEMPLATE,
  EID_AL_ADHA_TEMPLATE,
  WHITE_FRIDAY_TEMPLATE,
  UAE_NATIONAL_DAY_TEMPLATE,
  SAUDI_NATIONAL_DAY_TEMPLATE,
];

/**
 * Get template by type
 */
export function getTemplateByType(type: SeasonalTemplate['type']): SeasonalTemplate | undefined {
  return SEASONAL_TEMPLATES.find((t) => t.type === type);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): SeasonalTemplate | undefined {
  return SEASONAL_TEMPLATES.find((t) => t.id === id);
}

/**
 * Detect upcoming campaign events
 */
export function detectUpcomingCampaigns(date: Date = new Date()): CampaignEvent[] {
  const campaigns: CampaignEvent[] = [];
  const year = date.getFullYear();
  
  // Ramadan
  const ramadanStart = new Date(year, 2, 1); // Approximate
  campaigns.push({
    id: `ramadan-${year}`,
    name: 'Ramadan Kareem',
    nameAr: 'رمضان كريم',
    startDate: ramadanStart,
    endDate: new Date(ramadanStart.getTime() + 30 * 24 * 60 * 60 * 1000),
    type: 'ramadan',
    countries: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'EG', 'JO', 'LB'],
    template: 'ramadan',
    autoSchedule: true,
    discount: 20,
  });
  
  // White Friday (Last Friday of November)
  const nov30 = new Date(year, 10, 30);
  const lastFriday = new Date(nov30);
  lastFriday.setDate(nov30.getDate() - ((nov30.getDay() + 2) % 7));
  
  campaigns.push({
    id: `white-friday-${year}`,
    name: 'White Friday',
    nameAr: 'الجمعة البيضاء',
    startDate: lastFriday,
    endDate: new Date(lastFriday.getTime() + 4 * 24 * 60 * 60 * 1000),
    type: 'white-friday',
    countries: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'EG'],
    template: 'white-friday',
    autoSchedule: true,
    discount: 50,
  });
  
  // UAE National Day (Dec 2)
  campaigns.push({
    id: `uae-national-day-${year}`,
    name: 'UAE National Day',
    nameAr: 'اليوم الوطني الإماراتي',
    startDate: new Date(year, 11, 2),
    endDate: new Date(year, 11, 3),
    type: 'national-day',
    countries: ['AE'],
    template: 'uae-national-day',
    autoSchedule: true,
    discount: 15,
  });
  
  // Saudi National Day (Sept 23)
  campaigns.push({
    id: `saudi-national-day-${year}`,
    name: 'Saudi National Day',
    nameAr: 'اليوم الوطني السعودي',
    startDate: new Date(year, 8, 23),
    endDate: new Date(year, 8, 24),
    type: 'national-day',
    countries: ['SA'],
    template: 'saudi-national-day',
    autoSchedule: true,
    discount: 23,
  });
  
  return campaigns.filter((c) => c.startDate > date);
}

/**
 * Schedule a campaign
 */
export function scheduleCampaign(event: CampaignEvent): { success: boolean; message: string } {
  // This would integrate with a scheduling system
  return {
    success: true,
    message: `Campaign "${event.name}" scheduled for ${event.startDate.toISOString()}`,
  };
}

/**
 * Get active campaigns for a date
 */
export function getActiveCampaigns(date: Date = new Date()): CampaignEvent[] {
  return detectUpcomingCampaigns(date).filter(
    (c) => c.startDate <= date && c.endDate >= date
  );
}
