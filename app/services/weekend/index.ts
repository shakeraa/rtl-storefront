/**
 * Weekend Adjustment Service
 * T0062: Regional Calendar - Weekend Adjustment
 */

export type WeekendType = 'fri-sat' | 'sat-sun';

export interface WeekendConfig {
  country: string;
  weekendType: WeekendType;
  weekendDays: number[];
  workWeekStart: number;
  workWeekEnd: number;
}

export interface DeliveryCalculation {
  orderDate: Date;
  businessDays: number;
  deliveryDate: Date;
  weekendDays: number;
}

// Country weekend configurations
export const WEEKEND_CONFIGS: Record<string, WeekendConfig> = {
  // GCC countries - Friday-Saturday weekend
  SA: { country: 'SA', weekendType: 'fri-sat', weekendDays: [5, 6], workWeekStart: 0, workWeekEnd: 4 },
  AE: { country: 'AE', weekendType: 'fri-sat', weekendDays: [5, 6], workWeekStart: 0, workWeekEnd: 4 },
  QA: { country: 'QA', weekendType: 'fri-sat', weekendDays: [5, 6], workWeekStart: 0, workWeekEnd: 4 },
  KW: { country: 'KW', weekendType: 'fri-sat', weekendDays: [5, 6], workWeekStart: 0, workWeekEnd: 4 },
  BH: { country: 'BH', weekendType: 'fri-sat', weekendDays: [5, 6], workWeekStart: 0, workWeekEnd: 4 },
  OM: { country: 'OM', weekendType: 'fri-sat', weekendDays: [5, 6], workWeekStart: 0, workWeekEnd: 4 },
  // Other MENA countries
  EG: { country: 'EG', weekendType: 'fri-sat', weekendDays: [5, 6], workWeekStart: 0, workWeekEnd: 4 },
  JO: { country: 'JO', weekendType: 'fri-sat', weekendDays: [5, 6], workWeekStart: 0, workWeekEnd: 4 },
  IQ: { country: 'IQ', weekendType: 'fri-sat', weekendDays: [5, 6], workWeekStart: 0, workWeekEnd: 4 },
  // Global - Saturday-Sunday weekend
  US: { country: 'US', weekendType: 'sat-sun', weekendDays: [0, 6], workWeekStart: 1, workWeekEnd: 5 },
  GB: { country: 'GB', weekendType: 'sat-sun', weekendDays: [0, 6], workWeekStart: 1, workWeekEnd: 5 },
  FR: { country: 'FR', weekendType: 'sat-sun', weekendDays: [0, 6], workWeekStart: 1, workWeekEnd: 5 },
  DE: { country: 'DE', weekendType: 'sat-sun', weekendDays: [0, 6], workWeekStart: 1, workWeekEnd: 5 },
  // Israel
  IL: { country: 'IL', weekendType: 'fri-sat', weekendDays: [5, 6], workWeekStart: 0, workWeekEnd: 4 },
};

const DAY_NAMES: Record<string, string[]> = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  ar: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  he: ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'שבת'],
};

/**
 * Get weekend configuration for country
 */
export function getWeekendConfig(countryCode: string): WeekendConfig {
  return WEEKEND_CONFIGS[countryCode] || WEEKEND_CONFIGS['US'];
}

/**
 * Check if date is weekend
 */
export function isWeekend(date: Date, countryCode: string): boolean {
  const config = getWeekendConfig(countryCode);
  const day = date.getDay();
  return config.weekendDays.includes(day);
}

/**
 * Get next business day
 */
export function getNextBusinessDay(date: Date, countryCode: string): Date {
  const config = getWeekendConfig(countryCode);
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  
  while (config.weekendDays.includes(next.getDay())) {
    next.setDate(next.getDate() + 1);
  }
  
  return next;
}

/**
 * Calculate delivery date
 */
export function calculateDeliveryDate(
  orderDate: Date,
  businessDays: number,
  countryCode: string
): DeliveryCalculation {
  const config = getWeekendConfig(countryCode);
  let deliveryDate = new Date(orderDate);
  let weekendCount = 0;
  let daysAdded = 0;
  
  while (daysAdded < businessDays) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    
    if (config.weekendDays.includes(deliveryDate.getDay())) {
      weekendCount++;
    } else {
      daysAdded++;
    }
  }
  
  return {
    orderDate: new Date(orderDate),
    businessDays,
    deliveryDate,
    weekendDays: weekendCount,
  };
}

/**
 * Get business days between dates
 */
export function getBusinessDaysBetween(
  startDate: Date,
  endDate: Date,
  countryCode: string
): number {
  const config = getWeekendConfig(countryCode);
  let count = 0;
  const current = new Date(startDate);
  
  while (current < endDate) {
    current.setDate(current.getDate() + 1);
    if (!config.weekendDays.includes(current.getDay())) {
      count++;
    }
  }
  
  return count;
}

/**
 * Get support hours display
 */
export function getSupportHours(countryCode: string, locale: string = 'en'): string {
  const config = getWeekendConfig(countryCode);
  const days = DAY_NAMES[locale] || DAY_NAMES['en'];
  
  const workStart = days[config.workWeekStart];
  const workEnd = days[config.workWeekEnd];
  
  if (locale === 'ar') {
    return `من ${workStart} إلى ${workEnd}`;
  }
  if (locale === 'he') {
    return `מ-${workStart} עד ${workEnd}`;
  }
  
  return `${workStart} - ${workEnd}`;
}

/**
 * Format weekend days for display
 */
export function formatWeekendDays(countryCode: string, locale: string = 'en'): string {
  const config = getWeekendConfig(countryCode);
  const days = DAY_NAMES[locale] || DAY_NAMES['en'];
  
  const weekendDayNames = config.weekendDays.map((d) => days[d]);
  
  if (locale === 'ar') {
    return weekendDayNames.join(' و ');
  }
  
  return weekendDayNames.join(' & ');
}

/**
 * Get weekend type for country
 */
export function getWeekendType(countryCode: string): WeekendType {
  return getWeekendConfig(countryCode).weekendType;
}

/**
 * Is Friday-Saturday weekend country
 */
export function isFriSatWeekend(countryCode: string): boolean {
  return getWeekendType(countryCode) === 'fri-sat';
}

/**
 * Auto-detect weekend config from country
 */
export function autoDetectWeekend(countryCode: string): WeekendConfig {
  return getWeekendConfig(countryCode);
}
