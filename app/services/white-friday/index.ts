/**
 * White Friday Campaign Service
 * T0060: MENA - White Friday Campaign Templates
 */

export interface WhiteFridayCampaign {
  id: string;
  name: string;
  nameAr: string;
  startDate: Date;
  endDate: Date;
  discount: number;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    accentColor: string;
  };
  badges: CampaignBadge[];
  banners: CampaignBanner[];
  emailTemplates: EmailTemplate[];
}

export interface CampaignBadge {
  id: string;
  text: string;
  textAr: string;
  style: 'percentage' | 'fixed' | 'bogo' | 'flash';
  color: string;
}

export interface CampaignBanner {
  id: string;
  headline: string;
  headlineAr: string;
  subheadline: string;
  subheadlineAr: string;
  ctaText: string;
  ctaTextAr: string;
  size: 'hero' | 'large' | 'medium' | 'small';
}

export interface EmailTemplate {
  id: string;
  subject: string;
  subjectAr: string;
  preview: string;
  previewAr: string;
  type: 'announcement' | 'reminder' | 'last-chance' | 'thank-you';
}

// White Friday default theme
export const WHITEFRIDAY_THEME = {
  primaryColor: '#000000',
  secondaryColor: '#FFFFFF',
  backgroundColor: '#F5F5F5',
  accentColor: '#FFD700',
};

// Campaign badges
export const WHITEFRIDAY_BADGES: CampaignBadge[] = [
  { id: 'sale', text: 'Sale', textAr: 'تخفيض', style: 'percentage', color: '#FF0000' },
  { id: 'white-friday', text: 'White Friday', textAr: 'الجمعة البيضاء', style: 'percentage', color: '#000000' },
  { id: 'flash', text: 'Flash Sale', textAr: 'تخفيض فلاش', style: 'flash', color: '#FF6600' },
  { id: 'bogo', text: 'Buy 1 Get 1', textAr: 'اشترِ 1 واحصل على 1', style: 'bogo', color: '#0066CC' },
  { id: '50-off', text: '50% OFF', textAr: 'خصم 50%', style: 'percentage', color: '#CC0000' },
  { id: 'new', text: 'New', textAr: 'جديد', style: 'fixed', color: '#00AA00' },
];

// Banners
export const WHITEFRIDAY_BANNERS: CampaignBanner[] = [
  {
    id: 'hero',
    headline: 'White Friday Sale',
    headlineAr: 'تنزيلات الجمعة البيضاء',
    subheadline: 'Up to 70% off on everything',
    subheadlineAr: 'خصم يصل إلى 70% على كل شيء',
    ctaText: 'Shop Now',
    ctaTextAr: 'تسوق الآن',
    size: 'hero',
  },
  {
    id: 'countdown',
    headline: 'Sale Ends Soon',
    headlineAr: 'التنزيلات تنتهي قريباً',
    subheadline: 'Dont miss out on these deals',
    subheadlineAr: 'لا تفوت هذه العروض',
    ctaText: 'Shop Sale',
    ctaTextAr: 'تسوق التنزيلات',
    size: 'large',
  },
];

// Email templates
export const WHITEFRIDAY_EMAILS: EmailTemplate[] = [
  {
    id: 'announcement',
    subject: 'White Friday Sale is Here!',
    subjectAr: 'تنزيلات الجمعة البيضاء بدأت!',
    preview: 'Up to 70% off starts now',
    previewAr: 'خصم يصل إلى 70% يبدأ الآن',
    type: 'announcement',
  },
  {
    id: 'reminder',
    subject: 'White Friday Ends Tomorrow',
    subjectAr: 'الجمعة البيضاء تنتهي غداً',
    preview: 'Last chance to save big',
    previewAr: 'فرصتك الأخيرة للتوفير الكبير',
    type: 'reminder',
  },
  {
    id: 'last-chance',
    subject: 'Final Hours: White Friday',
    subjectAr: 'الساعات الأخيرة: الجمعة البيضاء',
    preview: 'Sale ends at midnight',
    previewAr: 'التنزيلات تنتهي منتصف الليل',
    type: 'last-chance',
  },
];

/**
 * Create White Friday campaign
 */
export function createWhiteFridayCampaign(year: number): WhiteFridayCampaign {
  // Last Friday of November
  const nov30 = new Date(year, 10, 30);
  const lastFriday = new Date(nov30);
  lastFriday.setDate(nov30.getDate() - ((nov30.getDay() + 2) % 7));
  
  const endDate = new Date(lastFriday);
  endDate.setDate(lastFriday.getDate() + 4); // 4-day sale

  return {
    id: `white-friday-${year}`,
    name: 'White Friday',
    nameAr: 'الجمعة البيضاء',
    startDate: lastFriday,
    endDate,
    discount: 50,
    theme: WHITEFRIDAY_THEME,
    badges: WHITEFRIDAY_BADGES,
    banners: WHITEFRIDAY_BANNERS,
    emailTemplates: WHITEFRIDAY_EMAILS,
  };
}

/**
 * Get countdown to White Friday
 */
export function getWhiteFridayCountdown(year: number): { days: number; hours: number; minutes: number } {
  const campaign = createWhiteFridayCampaign(year);
  const now = new Date();
  const diff = campaign.startDate.getTime() - now.getTime();
  
  if (diff < 0) {
    return { days: 0, hours: 0, minutes: 0 };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return { days, hours, minutes };
}

/**
 * Format countdown for display
 */
export function formatCountdown(
  countdown: { days: number; hours: number; minutes: number },
  locale: 'en' | 'ar' = 'en'
): string {
  if (locale === 'ar') {
    return `${countdown.days} يوم ${countdown.hours} ساعة ${countdown.minutes} دقيقة`;
  }
  return `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m`;
}

/**
 * Get sale badge
 */
export function getSaleBadge(discount: number, locale: 'en' | 'ar' = 'en'): string {
  if (locale === 'ar') {
    return `خصم ${discount}%`;
  }
  return `${discount}% OFF`;
}

/**
 * Check if White Friday is active
 */
export function isWhiteFridayActive(year: number): boolean {
  const campaign = createWhiteFridayCampaign(year);
  const now = new Date();
  return now >= campaign.startDate && now <= campaign.endDate;
}

/**
 * Get discount message
 */
export function getDiscountMessage(discount: number, locale: 'en' | 'ar' = 'en'): string {
  if (locale === 'ar') {
    return `وفّر ${discount}% على كل شيء`;
  }
  return `Save ${discount}% on everything`;
}
