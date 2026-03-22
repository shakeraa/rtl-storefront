/**
 * Hijri Calendar Service
 * T0005: Hijri Calendar Integration
 */

export interface HijriDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
  monthNameEn: string;
}

export interface HijriEvent {
  id: string;
  name: string;
  nameEn: string;
  hijriDate: { month: number; day: number };
  gregorianDate?: Date;
  type: 'religious' | 'cultural' | 'national';
  description?: string;
}

// Hijri month names
const HIJRI_MONTHS = [
  { ar: 'المحرم', en: 'Muharram' },
  { ar: 'صفر', en: 'Safar' },
  { ar: 'ربيع الأول', en: 'Rabi al-Awwal' },
  { ar: 'ربيع الثاني', en: 'Rabi al-Thani' },
  { ar: 'جمادى الأولى', en: 'Jumada al-Awwal' },
  { ar: 'جمادى الآخرة', en: 'Jumada al-Thani' },
  { ar: 'رجب', en: 'Rajab' },
  { ar: 'شعبان', en: 'Shaban' },
  { ar: 'رمضان', en: 'Ramadan' },
  { ar: 'شوال', en: 'Shawwal' },
  { ar: 'ذو القعدة', en: 'Dhu al-Qadah' },
  { ar: 'ذو الحجة', en: 'Dhu al-Hijjah' },
];

// Important Islamic dates
const HIJRI_EVENTS: HijriEvent[] = [
  { id: 'new_year', name: 'رأس السنة الهجرية', nameEn: 'Islamic New Year', hijriDate: { month: 1, day: 1 }, type: 'religious' },
  { id: 'ashura', name: 'عاشوراء', nameEn: 'Ashura', hijriDate: { month: 1, day: 10 }, type: 'religious' },
  { id: 'mawlid', name: 'المولد النبوي الشريف', nameEn: 'Mawlid al-Nabi', hijriDate: { month: 3, day: 12 }, type: 'religious' },
  { id: 'isra_miraj', name: 'الإسراء والمعراج', nameEn: 'Isra and Miraj', hijriDate: { month: 7, day: 27 }, type: 'religious' },
  { id: 'ramadan_start', name: 'بداية رمضان', nameEn: 'Ramadan Begins', hijriDate: { month: 9, day: 1 }, type: 'religious' },
  { id: 'qadr', name: 'ليلة القدر', nameEn: 'Laylat al-Qadr', hijriDate: { month: 9, day: 27 }, type: 'religious' },
  { id: 'eid_fitr', name: 'عيد الفطر المبارك', nameEn: 'Eid al-Fitr', hijriDate: { month: 10, day: 1 }, type: 'religious' },
  { id: 'arafah', name: 'يوم عرفة', nameEn: 'Day of Arafah', hijriDate: { month: 12, day: 9 }, type: 'religious' },
  { id: 'eid_adha', name: 'عيد الأضحى المبارك', nameEn: 'Eid al-Adha', hijriDate: { month: 12, day: 10 }, type: 'religious' },
];

/**
 * Convert Gregorian date to Hijri
 * Using the approximation algorithm
 */
export function toHijri(date: Date): HijriDate {
  const gd = date.getDate();
  const gm = date.getMonth() + 1;
  const gy = date.getFullYear();
  
  let jd = Math.floor((1461 * (gy + 4800 + Math.floor((gm - 14) / 12))) / 4) +
    Math.floor((367 * (gm - 2 - 12 * Math.floor((gm - 14) / 12))) / 12) -
    Math.floor((3 * Math.floor((gy + 4900 + Math.floor((gm - 14) / 12)) / 100)) / 4) +
    gd - 32075;
  
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const j = l - 10631 * n + 354;
  
  const j1 = (Math.floor((10985 - j) / 5316)) * (Math.floor((50 * j) / 17719)) +
    (Math.floor(j / 5670)) * (Math.floor((43 * j) / 15238));
  
  const j2 = j1 - (Math.floor((30 - j1) / 15)) * (Math.floor((17719 * j1) / 50)) -
    (Math.floor(j1 / 16)) * (Math.floor((15238 * j1) / 43)) + 29;
  
  let month = Math.floor((24 * j2) / 709);
  let day = j2 - Math.floor((709 * month) / 24);
  const year = 30 * n + j1 - 30;
  
  // Handle edge cases
  if (month < 1) month = 1;
  if (month > 12) month = 12;
  if (day < 1) day = 1;
  
  return {
    year,
    month,
    day,
    monthName: HIJRI_MONTHS[month - 1]?.ar || '',
    monthNameEn: HIJRI_MONTHS[month - 1]?.en || '',
  };
}

/**
 * Convert Hijri date to Gregorian
 */
export function fromHijri(hijri: Omit<HijriDate, 'monthName' | 'monthNameEn'>): Date {
  const iy = hijri.year;
  const im = hijri.month;
  const id = hijri.day;
  
  const jd = Math.floor((11 * iy + 3) / 30) + 354 * iy + 30 * im -
    Math.floor((im - 1) / 2) + id + 1948440 - 385;
  
  const l = jd + 68569;
  const n = Math.floor((4 * l) / 146097);
  const j = l - Math.floor((146097 * n + 3) / 4);
  const i = Math.floor((4000 * (j + 1)) / 1461001);
  const j1 = j - Math.floor((1461 * i) / 4) + 31;
  const k = Math.floor((80 * j1) / 2447);
  const idg = j1 - Math.floor((2447 * k) / 80);
  const j2 = Math.floor(k / 11);
  const img = k + 2 - 12 * j2;
  const iyg = 100 * (n - 49) + i + j2;
  
  return new Date(iyg, img - 1, idg);
}

/**
 * Format Hijri date
 */
export function formatHijri(
  hijri: HijriDate,
  locale: 'ar' | 'en' = 'ar',
  format: 'full' | 'short' | 'numeric' = 'full'
): string {
  const day = hijri.day.toString();
  const year = hijri.year.toString();
  
  if (format === 'numeric') {
    return `${day}/${hijri.month}/${year}`;
  }
  
  const monthName = locale === 'ar' ? hijri.monthName : hijri.monthNameEn;
  
  if (format === 'short') {
    return locale === 'ar'
      ? `${day} ${monthName}`
      : `${monthName} ${day}`;
  }
  
  return locale === 'ar'
    ? `${day} ${monthName} ${year} هـ`
    : `${day} ${monthName} ${year} AH`;
}

/**
 * Get upcoming events
 */
export function getUpcomingEvents(date: Date = new Date(), days: number = 365): HijriEvent[] {
  const hijri = toHijri(date);
  const events: HijriEvent[] = [];
  
  for (let i = 0; i < days; i++) {
    const checkDate = new Date(date);
    checkDate.setDate(date.getDate() + i);
    const checkHijri = toHijri(checkDate);
    
    for (const event of HIJRI_EVENTS) {
      if (event.hijriDate.month === checkHijri.month && 
          event.hijriDate.day === checkHijri.day) {
        events.push({
          ...event,
          gregorianDate: checkDate,
        });
      }
    }
  }
  
  return events;
}

/**
 * Check if a date is a special Islamic day
 */
export function getEventForDate(date: Date): HijriEvent | null {
  const hijri = toHijri(date);
  
  return HIJRI_EVENTS.find(
    (e) => e.hijriDate.month === hijri.month && e.hijriDate.day === hijri.day
  ) || null;
}

/**
 * Get days until next Ramadan
 */
export function getDaysUntilRamadan(date: Date = new Date()): number {
  const hijri = toHijri(date);
  let targetDate: Date;
  
  if (hijri.month < 9) {
    // Ramadan is this year
    targetDate = fromHijri({ year: hijri.year, month: 9, day: 1 });
  } else {
    // Ramadan is next year
    targetDate = fromHijri({ year: hijri.year + 1, month: 9, day: 1 });
  }
  
  const diffTime = targetDate.getTime() - date.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get Eid countdown
 */
export function getEidCountdown(date: Date = new Date()): { eidFitr: number; eidAdha: number } {
  const hijri = toHijri(date);
  
  let fitrDate: Date;
  let adhaDate: Date;
  
  if (hijri.month < 10) {
    fitrDate = fromHijri({ year: hijri.year, month: 10, day: 1 });
  } else {
    fitrDate = fromHijri({ year: hijri.year + 1, month: 10, day: 1 });
  }
  
  if (hijri.month < 12) {
    adhaDate = fromHijri({ year: hijri.year, month: 12, day: 10 });
  } else {
    adhaDate = fromHijri({ year: hijri.year + 1, month: 12, day: 10 });
  }
  
  const now = date.getTime();
  
  return {
    eidFitr: Math.ceil((fitrDate.getTime() - now) / (1000 * 60 * 60 * 24)),
    eidAdha: Math.ceil((adhaDate.getTime() - now) / (1000 * 60 * 60 * 24)),
  };
}

// Re-export for convenience
export { HIJRI_MONTHS, HIJRI_EVENTS };
