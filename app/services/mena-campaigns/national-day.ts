/**
 * National Day Templates Service - T0061
 * Pre-built templates for MENA National Days
 * UAE: December 2 | Saudi Arabia: September 23
 * Supports Arabic (ar), Hebrew (he), and English (en)
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface NationalDayTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  flagColors: string[];
}

export interface NationalDayMessaging {
  headline: string;
  subheadline: string;
  ctaText: string;
  patrioticSlogan: string;
  discountMessage: string;
  countdownMessage: string;
}

export interface NationalDayTemplate {
  id: string;
  country: string;
  countryCode: string;
  countryNameAr: string;
  countryNameHe: string;
  date: { month: number; day: number };
  foundingYear: number;
  theme: NationalDayTheme;
  messaging: Record<string, NationalDayMessaging>;
  badges: string[];
  emailSubject: Record<string, string>;
  smsMessage: Record<string, string>;
}

export interface NationalDayCampaign {
  id: string;
  country: string;
  year: number;
  template: NationalDayTemplate;
  startDate: Date;
  endDate: Date;
  discount: number;
  isActive: boolean;
  countdown: { days: number; hours: number; minutes: number };
}

// ============================================================================
// Country Data - UAE
// ============================================================================

export const UAE_NATIONAL_DAY: NationalDayTemplate = {
  id: "uae-national-day",
  country: "United Arab Emirates",
  countryCode: "AE",
  countryNameAr: "الإمارات العربية المتحدة",
  countryNameHe: "איחוד האמירויות הערביות",
  date: { month: 12, day: 2 },
  foundingYear: 1971,
  theme: {
    primaryColor: "#FF0000",
    secondaryColor: "#00732F",
    accentColor: "#FFFFFF",
    backgroundColor: "#000000",
    textColor: "#FFFFFF",
    flagColors: ["#FF0000", "#00732F", "#FFFFFF", "#000000"],
  },
  messaging: {
    ar: {
      headline: "عيد وطني سعيد",
      subheadline: "احتفل معنا باليوم الوطني الإماراتي الـ 53",
      ctaText: "تسوق العروض",
      patrioticSlogan: "الإمارات وطن العز والطموح",
      discountMessage: "خصم يصل إلى 52% احتفالاً باليوم الوطني",
      countdownMessage: "متبقي على اليوم الوطني الإماراتي",
    },
    he: {
      headline: "יום לאומי שמח",
      subheadline: "חגוג איתנו את היום הלאומי של איחוד האמירויות ה-53",
      ctaText: "קנה עכשיו",
      patrioticSlogan: "איחוד האמירויות - ארץ הגאווה והשאיפות",
      discountMessage: "הנחה של עד 52% לכבוד היום הלאומי",
      countdownMessage: "נותרו עד ליום הלאומי של איחוד האמירויות",
    },
    en: {
      headline: "Happy National Day",
      subheadline: "Celebrate with us the 53rd UAE National Day",
      ctaText: "Shop Deals",
      patrioticSlogan: "UAE - Land of Pride and Ambition",
      discountMessage: "Up to 52% off for National Day",
      countdownMessage: "Countdown to UAE National Day",
    },
  },
  badges: ["عروض اليوم الوطني", "خصم 52%", "احتفال 53 عاماً"],
  emailSubject: {
    ar: "🇦🇪 عروض اليوم الوطني الإماراتي - خصم 52%",
    he: "🇦🇪 מבצעי יום לאומי של איחוד האמירויות - 52% הנחה",
    en: "🇦🇪 UAE National Day Sale - 52% Off",
  },
  smsMessage: {
    ar: "🎉 عروض اليوم الوطني الإماراتي! خصم 52% على كل شيء. تسوق الآن! 🇦🇪",
    he: "🎉 מבצעי יום לאומי של איחוד האמירויות! 52% הנחה על הכל. קנה עכשיו! 🇦🇪",
    en: "🎉 UAE National Day Sale! 52% off everything. Shop now! 🇦🇪",
  },
};

// ============================================================================
// Country Data - Saudi Arabia
// ============================================================================

export const SAUDI_NATIONAL_DAY: NationalDayTemplate = {
  id: "saudi-national-day",
  country: "Saudi Arabia",
  countryCode: "SA",
  countryNameAr: "المملكة العربية السعودية",
  countryNameHe: "ערב הסעודית",
  date: { month: 9, day: 23 },
  foundingYear: 1932,
  theme: {
    primaryColor: "#006C35",
    secondaryColor: "#FFFFFF",
    accentColor: "#C19A6B",
    backgroundColor: "#004d25",
    textColor: "#FFFFFF",
    flagColors: ["#006C35", "#FFFFFF"],
  },
  messaging: {
    ar: {
      headline: "كل عام وأنتم بخير",
      subheadline: "نحتفل باليوم الوطني السعودي الـ 94",
      ctaText: "اكتشف العروض",
      patrioticSlogan: "وطن التوحيد والعزم",
      discountMessage: "تخفيضات تصل إلى 93% بمناسبة اليوم الوطني",
      countdownMessage: "العد التنازلي لليوم الوطني السعودي",
    },
    he: {
      headline: "שנה טובה ומתוקה",
      subheadline: "אנו חוגגים את היום הלאומי הסעודי ה-94",
      ctaText: "גלה מבצעים",
      patrioticSlogan: "ארץ האיחוד והנחישות",
      discountMessage: "הנחות של עד 93% לכבוד היום הלאומי",
      countdownMessage: "ספירה לאחור ליום הלאומי הסעודי",
    },
    en: {
      headline: "Happy National Day",
      subheadline: "Celebrating the 94th Saudi National Day",
      ctaText: "Discover Deals",
      patrioticSlogan: "Land of Unity and Determination",
      discountMessage: "Up to 93% off for National Day",
      countdownMessage: "Countdown to Saudi National Day",
    },
  },
  badges: ["عروض اليوم الوطني", "خصم 93%", "يوم التأسيس"],
  emailSubject: {
    ar: "🇸🇦 عروض اليوم الوطني السعودي - خصم 93%",
    he: "🇸🇦 מבצעי יום לאומי סעודי - 93% הנחה",
    en: "🇸🇦 Saudi National Day Sale - 93% Off",
  },
  smsMessage: {
    ar: "🎊 عروض اليوم الوطني السعودي! خصم 93% على منتجات مختارة. لا تفوت الفرصة! 🇸🇦",
    he: "🎊 מבצעי יום לאומי סעודי! 93% הנחה על מוצרים נבחרים. אל תפספס! 🇸🇦",
    en: "🎊 Saudi National Day Sale! 93% off selected items. Don't miss out! 🇸🇦",
  },
};

// ============================================================================
// Country Data - Kuwait
// ============================================================================

export const KUWAIT_NATIONAL_DAY: NationalDayTemplate = {
  id: "kuwait-national-day",
  country: "Kuwait",
  countryCode: "KW",
  countryNameAr: "الكويت",
  countryNameHe: "כווית",
  date: { month: 2, day: 25 },
  foundingYear: 1961,
  theme: {
    primaryColor: "#007A3D",
    secondaryColor: "#CE1126",
    accentColor: "#FFFFFF",
    backgroundColor: "#000000",
    textColor: "#FFFFFF",
    flagColors: ["#007A3D", "#FFFFFF", "#CE1126", "#000000"],
  },
  messaging: {
    ar: {
      headline: "عيد وطني مبارك",
      subheadline: "نحتفل بالذكرى الـ 64 لليوم الوطني الكويتي",
      ctaText: "تسوق الآن",
      patrioticSlogan: "الكويت دار السلام",
      discountMessage: "خصم 25% بمناسبة اليوم الوطني الكويتي",
      countdownMessage: "متبقي على اليوم الوطني الكويتي",
    },
    he: {
      headline: "חג לאומי מבורך",
      subheadline: "אנו חוגגים את היום הלאומי הכוויתי ה-64",
      ctaText: "קנה עכשיו",
      patrioticSlogan: "כווית - בית השלום",
      discountMessage: "25% הנחה לכבוד היום הלאומי הכוויתי",
      countdownMessage: "נותרו עד ליום הלאומי הכוויתי",
    },
    en: {
      headline: "Blessed National Day",
      subheadline: "Celebrating the 64th Kuwait National Day",
      ctaText: "Shop Now",
      patrioticSlogan: "Kuwait - Home of Peace",
      discountMessage: "25% off for Kuwait National Day",
      countdownMessage: "Countdown to Kuwait National Day",
    },
  },
  badges: ["عروض اليوم الوطني", "خصم 25%", "ذكرى التحرير"],
  emailSubject: {
    ar: "🇰🇼 عروض اليوم الوطني الكويتي - خصم 25%",
    he: "🇰🇼 מבצעי יום לאומי כוויתי - 25% הנחה",
    en: "🇰🇼 Kuwait National Day Sale - 25% Off",
  },
  smsMessage: {
    ar: "🇰🇼 احتفل باليوم الوطني الكويتي! خصم 25% على كل المنتجات. تسوق اليوم!",
    he: "🇰🇼 חגוג את היום הלאומי הכוויתי! 25% הנחה על כל המוצרים. קנה היום!",
    en: "🇰🇼 Celebrate Kuwait National Day! 25% off all products. Shop today!",
  },
};

// ============================================================================
// Country Data - Bahrain
// ============================================================================

export const BAHRAIN_NATIONAL_DAY: NationalDayTemplate = {
  id: "bahrain-national-day",
  country: "Bahrain",
  countryCode: "BH",
  countryNameAr: "البحرين",
  countryNameHe: "בחריין",
  date: { month: 12, day: 16 },
  foundingYear: 1971,
  theme: {
    primaryColor: "#CE1126",
    secondaryColor: "#FFFFFF",
    accentColor: "#C19A6B",
    backgroundColor: "#8B0000",
    textColor: "#FFFFFF",
    flagColors: ["#CE1126", "#FFFFFF"],
  },
  messaging: {
    ar: {
      headline: "عيد وطني مجيد",
      subheadline: "نحتفل باليوم الوطني البحريني الـ 53",
      ctaText: "اكتشف المزيد",
      patrioticSlogan: "البحرين بلد الكرامة والعطاء",
      discountMessage: "خصم 16% بمناسبة اليوم الوطني البحريني",
      countdownMessage: "متبقي على اليوم الوطني البحريني",
    },
    he: {
      headline: "יום לאומי מפואר",
      subheadline: "אנו חוגגים את היום הלאומי הבחרייני ה-53",
      ctaText: "גלה עוד",
      patrioticSlogan: "בחריין - ארץ הכבוד והנתינה",
      discountMessage: "16% הנחה לכבוד היום הלאומי הבחרייני",
      countdownMessage: "נותרו עד ליום הלאומי הבחרייני",
    },
    en: {
      headline: "Glorious National Day",
      subheadline: "Celebrating the 53rd Bahrain National Day",
      ctaText: "Discover More",
      patrioticSlogan: "Bahrain - Land of Dignity and Giving",
      discountMessage: "16% off for Bahrain National Day",
      countdownMessage: "Countdown to Bahrain National Day",
    },
  },
  badges: ["عروض اليوم الوطني", "خصم 16%", "عيد الاستقلال"],
  emailSubject: {
    ar: "🇧🇭 عروض اليوم الوطني البحريني - خصم 16%",
    he: "🇧🇭 מבצעי יום לאומי בחרייני - 16% הנחה",
    en: "🇧🇭 Bahrain National Day Sale - 16% Off",
  },
  smsMessage: {
    ar: "🇧🇭 احتفل باليوم الوطني البحريني! خصم 16% على جميع المنتجات. تسوق الآن!",
    he: "🇧🇭 חגוג את היום הלאומי הבחרייני! 16% הנחה על כל המוצרים. קנה עכשיו!",
    en: "🇧🇭 Celebrate Bahrain National Day! 16% off all products. Shop now!",
  },
};

// ============================================================================
// Country Data - Qatar
// ============================================================================

export const QATAR_NATIONAL_DAY: NationalDayTemplate = {
  id: "qatar-national-day",
  country: "Qatar",
  countryCode: "QA",
  countryNameAr: "قطر",
  countryNameHe: "קטאר",
  date: { month: 12, day: 18 },
  foundingYear: 1878,
  theme: {
    primaryColor: "#8A1538",
    secondaryColor: "#FFFFFF",
    accentColor: "#C19A6B",
    backgroundColor: "#5C0E26",
    textColor: "#FFFFFF",
    flagColors: ["#8A1538", "#FFFFFF"],
  },
  messaging: {
    ar: {
      headline: "عيد وطني كريم",
      subheadline: "نحتفل باليوم الوطني القطري الـ 146",
      ctaText: "تصفح العروض",
      patrioticSlogan: "قطر دار الفخر والمجد",
      discountMessage: "خصم 18% بمناسبة اليوم الوطني القطري",
      countdownMessage: "متبقي على اليوم الوطني القطري",
    },
    he: {
      headline: "יום לאומי נדיב",
      subheadline: "אנו חוגגים את היום הלאומי הקטרי ה-146",
      ctaText: "עיין במבצעים",
      patrioticSlogan: "קטאר - בית הגאווה והתהילה",
      discountMessage: "18% הנחה לכבוד היום הלאומי הקטרי",
      countdownMessage: "נותרו עד ליום הלאומי הקטרי",
    },
    en: {
      headline: "Noble National Day",
      subheadline: "Celebrating the 146th Qatar National Day",
      ctaText: "Browse Deals",
      patrioticSlogan: "Qatar - Home of Pride and Glory",
      discountMessage: "18% off for Qatar National Day",
      countdownMessage: "Countdown to Qatar National Day",
    },
  },
  badges: ["عروض اليوم الوطني", "خصم 18%", "يوم الشيخ جاسم"],
  emailSubject: {
    ar: "🇶🇦 عروض اليوم الوطني القطري - خصم 18%",
    he: "🇶🇦 מבצעי יום לאומי קטרי - 18% הנחה",
    en: "🇶🇦 Qatar National Day Sale - 18% Off",
  },
  smsMessage: {
    ar: "🇶🇦 احتفل باليوم الوطني القطري! خصم 18% على منتجات مختارة. تسوق الآن!",
    he: "🇶🇦 חגוג את היום הלאומי הקטרי! 18% הנחה על מוצרים נבחרים. קנה עכשיו!",
    en: "🇶🇦 Celebrate Qatar National Day! 18% off selected items. Shop now!",
  },
};

// ============================================================================
// Country Data - Oman
// ============================================================================

export const OMAN_NATIONAL_DAY: NationalDayTemplate = {
  id: "oman-national-day",
  country: "Oman",
  countryCode: "OM",
  countryNameAr: "عمان",
  countryNameHe: "עומאן",
  date: { month: 11, day: 18 },
  foundingYear: 1650,
  theme: {
    primaryColor: "#DB161B",
    secondaryColor: "#FFFFFF",
    accentColor: "#008000",
    backgroundColor: "#9B1013",
    textColor: "#FFFFFF",
    flagColors: ["#DB161B", "#FFFFFF", "#008000"],
  },
  messaging: {
    ar: {
      headline: "عيد وطني عظيم",
      subheadline: "نحتفل باليوم الوطني العماني الـ 54",
      ctaText: "اطلع على العروض",
      patrioticSlogan: "عمان بلد الأمجاد والتاريخ",
      discountMessage: "خصم 18% بمناسبة اليوم الوطني العماني",
      countdownMessage: "متبقي على اليوم الوطني العماني",
    },
    he: {
      headline: "יום לאומי גדול",
      subheadline: "אנו חוגגים את היום הלאומי העומאני ה-54",
      ctaText: "ראה מבצעים",
      patrioticSlogan: "עומאן - ארץ התהילות וההיסטוריה",
      discountMessage: "18% הנחה לכבוד היום הלאומי העומאני",
      countdownMessage: "נותרו עד ליום הלאומי העומאני",
    },
    en: {
      headline: "Great National Day",
      subheadline: "Celebrating the 54th Oman National Day",
      ctaText: "View Deals",
      patrioticSlogan: "Oman - Land of Glories and History",
      discountMessage: "18% off for Oman National Day",
      countdownMessage: "Countdown to Oman National Day",
    },
  },
  badges: ["عروض اليوم الوطني", "خصم 18%", "عيد النهضة"],
  emailSubject: {
    ar: "🇴🇲 عروض اليوم الوطني العماني - خصم 18%",
    he: "🇴🇲 מבצעי יום לאומי עומאני - 18% הנחה",
    en: "🇴🇲 Oman National Day Sale - 18% Off",
  },
  smsMessage: {
    ar: "🇴🇲 احتفل باليوم الوطني العماني! خصم 18% على جميع المنتجات. تسوق اليوم!",
    he: "🇴🇲 חגוג את היום הלאומי העומאני! 18% הנחה על כל המוצרים. קנה היום!",
    en: "🇴🇲 Celebrate Oman National Day! 18% off all products. Shop today!",
  },
};

// ============================================================================
// Registry
// ============================================================================

export const NATIONAL_DAY_TEMPLATES: NationalDayTemplate[] = [
  UAE_NATIONAL_DAY,
  SAUDI_NATIONAL_DAY,
  KUWAIT_NATIONAL_DAY,
  BAHRAIN_NATIONAL_DAY,
  QATAR_NATIONAL_DAY,
  OMAN_NATIONAL_DAY,
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate locale and return supported locale
 */
function validateLocale(locale: string): string {
  const supportedLocales = ["ar", "he", "en"];
  const baseLocale = locale.split("-")[0].toLowerCase();
  return supportedLocales.includes(baseLocale) ? baseLocale : "en";
}

/**
 * Calculate discount based on founding year and anniversary
 */
function calculateDiscount(foundingYear: number, currentYear: number): number {
  const anniversary = currentYear - foundingYear;
  // Special discounts for milestone years
  if (anniversary % 50 === 0) return 50;
  if (anniversary % 25 === 0) return 35;
  if (anniversary % 10 === 0) return 25;
  // Standard discounts by country
  if (anniversary === 52) return 52; // UAE special
  if (anniversary === 93) return 93; // Saudi special
  if (anniversary === 64) return 25; // Kuwait
  if (anniversary === 53) return 16; // Bahrain
  if (anniversary === 146) return 18; // Qatar
  if (anniversary === 54) return 18; // Oman
  return 20; // Default
}

/**
 * Get days in month
 */
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// ============================================================================
// Main Export Functions
// ============================================================================

/**
 * Get national day template for a specific country
 * @param country - Country code (AE, SA, KW, BH, QA, OM)
 * @param locale - Locale code (ar, he, en)
 * @returns NationalDayTemplate or null if not found
 */
export function getNationalDayTemplate(
  country: string,
  locale: string = "en",
): NationalDayTemplate | null {
  const countryCode = country.toUpperCase();
  const template = NATIONAL_DAY_TEMPLATES.find((t) => t.countryCode === countryCode);
  
  if (!template) {
    return null;
  }

  // Return template with localized messaging
  const validatedLocale = validateLocale(locale);
  return {
    ...template,
    messaging: {
      [validatedLocale]: template.messaging[validatedLocale] || template.messaging.en,
    },
  };
}

/**
 * Get all national day themes for a specific country
 * @param country - Country code (AE, SA, KW, BH, QA, OM)
 * @returns NationalDayTheme or null if not found
 */
export function getNationalDayThemes(country: string): NationalDayTheme | null {
  const countryCode = country.toUpperCase();
  const template = NATIONAL_DAY_TEMPLATES.find((t) => t.countryCode === countryCode);
  return template ? template.theme : null;
}

/**
 * Get complete national day campaign for a specific country and year
 * @param country - Country code (AE, SA, KW, BH, QA, OM)
 * @param year - Campaign year
 * @returns NationalDayCampaign or null if not found
 */
export function getNationalDayCampaign(
  country: string,
  year: number,
): NationalDayCampaign | null {
  const countryCode = country.toUpperCase();
  const template = NATIONAL_DAY_TEMPLATES.find((t) => t.countryCode === countryCode);
  
  if (!template) {
    return null;
  }

  // Calculate campaign dates
  const startDate = new Date(year, template.date.month - 1, template.date.day);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 3); // 3-day campaign

  // Calculate countdown
  const now = new Date();
  const diff = startDate.getTime() - now.getTime();
  const countdown = {
    days: Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24))),
    hours: Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))),
    minutes: Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))),
  };

  // Determine if campaign is active
  const isActive = now >= startDate && now <= endDate;

  // Calculate discount
  const discount = calculateDiscount(template.foundingYear, year);

  return {
    id: `${template.id}-${year}`,
    country: template.country,
    year,
    template,
    startDate,
    endDate,
    discount,
    isActive,
    countdown,
  };
}

/**
 * Get all supported countries
 * @returns Array of country codes
 */
export function getSupportedCountries(): string[] {
  return NATIONAL_DAY_TEMPLATES.map((t) => t.countryCode);
}

/**
 * Get country name in specified locale
 * @param country - Country code
 * @param locale - Locale code (ar, he, en)
 * @returns Country name or null if not found
 */
export function getCountryName(country: string, locale: string = "en"): string | null {
  const countryCode = country.toUpperCase();
  const template = NATIONAL_DAY_TEMPLATES.find((t) => t.countryCode === countryCode);
  
  if (!template) {
    return null;
  }

  const validatedLocale = validateLocale(locale);
  
  switch (validatedLocale) {
    case "ar":
      return template.countryNameAr;
    case "he":
      return template.countryNameHe;
    default:
      return template.country;
  }
}

/**
 * Check if a country has a national day template
 * @param country - Country code
 * @returns boolean
 */
export function hasNationalDayTemplate(country: string): boolean {
  const countryCode = country.toUpperCase();
  return NATIONAL_DAY_TEMPLATES.some((t) => t.countryCode === countryCode);
}

/**
 * Get upcoming national days for the current year
 * @param year - Year to check
 * @returns Array of upcoming national day campaigns
 */
export function getUpcomingNationalDays(year: number): NationalDayCampaign[] {
  const now = new Date();
  const campaigns: NationalDayCampaign[] = [];

  for (const template of NATIONAL_DAY_TEMPLATES) {
    const nationalDayDate = new Date(year, template.date.month - 1, template.date.day);
    
    // Include if it's in the future or within the last 3 days
    const daysDiff = Math.floor((nationalDayDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff >= -3) {
      const campaign = getNationalDayCampaign(template.countryCode, year);
      if (campaign) {
        campaigns.push(campaign);
      }
    }
  }

  return campaigns.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

/**
 * Format countdown for display
 * @param countdown - Countdown object
 * @param locale - Locale code (ar, he, en)
 * @returns Formatted countdown string
 */
export function formatCountdown(
  countdown: { days: number; hours: number; minutes: number },
  locale: string = "en",
): string {
  const validatedLocale = validateLocale(locale);
  
  switch (validatedLocale) {
    case "ar":
      return `${countdown.days} يوم ${countdown.hours} ساعة ${countdown.minutes} دقيقة`;
    case "he":
      return `${countdown.days} ימים ${countdown.hours} שעות ${countdown.minutes} דקות`;
    default:
      return `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m`;
  }
}

/**
 * Generate banner HTML for a national day campaign
 * @param country - Country code
 * @param locale - Locale code (ar, he, en)
 * @returns HTML string or empty string if not found
 */
export function generateBannerHtml(country: string, locale: string = "en"): string {
  const template = getNationalDayTemplate(country, locale);
  if (!template) {
    return "";
  }

  const validatedLocale = validateLocale(locale);
  const messaging = template.messaging[validatedLocale] || template.messaging.en;
  const isRTL = validatedLocale === "ar" || validatedLocale === "he";
  const dir = isRTL ? "rtl" : "ltr";
  const fontFamily = isRTL 
    ? "'Noto Naskh Arabic', 'Arial Hebrew', Tahoma, sans-serif"
    : "'Helvetica Neue', Arial, sans-serif";

  const gradientColors = template.theme.flagColors.slice(0, 2).join(", ");
  const flagEmoji = getFlagEmoji(template.countryCode);

  return `<div dir="${dir}" style="background: linear-gradient(135deg, ${gradientColors}); color: ${template.theme.textColor}; padding: 32px; text-align: center; border-radius: 12px; font-family: ${fontFamily}; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
  <div style="font-size: 48px; margin-bottom: 16px;">${flagEmoji}</div>
  <h2 style="margin: 0 0 12px; font-size: 28px; font-weight: bold;">${messaging.headline}</h2>
  <p style="margin: 0 0 20px; font-size: 18px; opacity: 0.95;">${messaging.subheadline}</p>
  <p style="margin: 0 0 24px; font-size: 16px; font-style: italic; opacity: 0.9;">${messaging.patrioticSlogan}</p>
  <button style="background: ${template.theme.accentColor}; color: #000; padding: 14px 32px; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; text-transform: uppercase;">${messaging.ctaText}</button>
</div>`;
}

/**
 * Get flag emoji for country code
 * @param countryCode - ISO country code
 * @returns Flag emoji
 */
export function getFlagEmoji(countryCode: string): string {
  const code = countryCode.toUpperCase();
  const flagMap: Record<string, string> = {
    AE: "🇦🇪",
    SA: "🇸🇦",
    KW: "🇰🇼",
    BH: "🇧🇭",
    QA: "🇶🇦",
    OM: "🇴🇲",
  };
  return flagMap[code] || "🏳️";
}

/**
 * Get patriotic messaging for a specific country and locale
 * @param country - Country code
 * @param locale - Locale code (ar, he, en)
 * @returns Messaging object or null if not found
 */
export function getPatrioticMessaging(
  country: string,
  locale: string = "en",
): NationalDayMessaging | null {
  const template = getNationalDayTemplate(country, locale);
  if (!template) {
    return null;
  }

  const validatedLocale = validateLocale(locale);
  return template.messaging[validatedLocale] || template.messaging.en;
}

/**
 * Get email content for national day campaign
 * @param country - Country code
 * @param locale - Locale code (ar, he, en)
 * @returns Email content object or null if not found
 */
export function getEmailContent(
  country: string,
  locale: string = "en",
): { subject: string; body: string } | null {
  const template = getNationalDayTemplate(country, locale);
  if (!template) {
    return null;
  }

  const validatedLocale = validateLocale(locale);
  const subject = template.emailSubject[validatedLocale] || template.emailSubject.en;
  const messaging = template.messaging[validatedLocale] || template.messaging.en;

  const body = `
${messaging.headline}

${messaging.subheadline}

${messaging.patrioticSlogan}

${messaging.discountMessage}

${messaging.ctaText}
`;

  return { subject, body };
}

/**
 * Get SMS content for national day campaign
 * @param country - Country code
 * @param locale - Locale code (ar, he, en)
 * @returns SMS message or null if not found
 */
export function getSmsContent(country: string, locale: string = "en"): string | null {
  const template = getNationalDayTemplate(country, locale);
  if (!template) {
    return null;
  }

  const validatedLocale = validateLocale(locale);
  return template.smsMessage[validatedLocale] || template.smsMessage.en;
}

/**
 * Calculate years since founding for a country
 * @param country - Country code
 * @param year - Year to calculate for
 * @returns Years since founding or null if not found
 */
export function getYearsSinceFounding(country: string, year: number): number | null {
  const countryCode = country.toUpperCase();
  const template = NATIONAL_DAY_TEMPLATES.find((t) => t.countryCode === countryCode);
  
  if (!template) {
    return null;
  }

  return year - template.foundingYear;
}
