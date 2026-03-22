/**
 * White Friday Campaign Service
 * T0060: MENA - White Friday Campaign Templates
 * 
 * White Friday (الجمعة البيضاء) is the MENA region's equivalent of Black Friday,
 * typically held on the last Friday of November.
 */

export interface WhiteFridayCampaign {
  id: string;
  name: string;
  nameAr: string;
  nameHe: string;
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
  textHe: string;
  style: 'percentage' | 'fixed' | 'bogo' | 'flash' | 'limited';
  color: string;
}

export interface CampaignBanner {
  id: string;
  headline: string;
  headlineAr: string;
  headlineHe: string;
  subheadline: string;
  subheadlineAr: string;
  subheadlineHe: string;
  ctaText: string;
  ctaTextAr: string;
  ctaTextHe: string;
  size: 'hero' | 'large' | 'medium' | 'small';
}

export interface EmailTemplate {
  id: string;
  subject: string;
  subjectAr: string;
  subjectHe: string;
  preview: string;
  previewAr: string;
  previewHe: string;
  type: 'announcement' | 'reminder' | 'last-chance' | 'thank-you' | 'exclusive';
}

export type TemplateType = 'hero' | 'countdown' | 'sale-badge' | 'product-card' | 'email-announcement' | 'email-reminder' | 'email-last-chance';
export type Locale = 'en' | 'ar' | 'he';

// White Friday default theme - Black, White, Gold
export const WHITEFRIDAY_THEME = {
  primaryColor: '#000000',
  secondaryColor: '#FFFFFF',
  backgroundColor: '#F5F5F5',
  accentColor: '#FFD700',
};

// Campaign badges
export const WHITEFRIDAY_BADGES: CampaignBadge[] = [
  { id: 'sale', text: 'Sale', textAr: 'تخفيض', textHe: 'מבצע', style: 'percentage', color: '#FF0000' },
  { id: 'white-friday', text: 'White Friday', textAr: 'الجمعة البيضاء', textHe: 'היום הלבן', style: 'percentage', color: '#000000' },
  { id: 'flash', text: 'Flash Sale', textAr: 'تخفيض فلاش', textHe: 'מבצע פלאש', style: 'flash', color: '#FF6600' },
  { id: 'bogo', text: 'Buy 1 Get 1', textAr: 'اشترِ 1 واحصل على 1', textHe: 'קנה 1 קבל 1', style: 'bogo', color: '#0066CC' },
  { id: '50-off', text: '50% OFF', textAr: 'خصم 50%', textHe: '50% הנחה', style: 'percentage', color: '#CC0000' },
  { id: 'new', text: 'New', textAr: 'جديد', textHe: 'חדש', style: 'fixed', color: '#00AA00' },
  { id: 'limited', text: 'Limited Time', textAr: 'وقت محدود', textHe: 'זמן מוגבל', style: 'limited', color: '#9900CC' },
  { id: '70-off', text: 'Up to 70% OFF', textAr: 'خصم يصل إلى 70%', textHe: 'עד 70% הנחה', style: 'percentage', color: '#CC0000' },
];

// Banners
export const WHITEFRIDAY_BANNERS: CampaignBanner[] = [
  {
    id: 'hero',
    headline: 'White Friday Sale',
    headlineAr: 'تنزيلات الجمعة البيضاء',
    headlineHe: 'מבצע היום הלבן',
    subheadline: 'Up to 70% off on everything',
    subheadlineAr: 'خصم يصل إلى 70% على كل شيء',
    subheadlineHe: 'עד 70% הנחה על הכל',
    ctaText: 'Shop Now',
    ctaTextAr: 'تسوق الآن',
    ctaTextHe: 'קנה עכשיו',
    size: 'hero',
  },
  {
    id: 'countdown',
    headline: 'Sale Ends Soon',
    headlineAr: 'التنزيلات تنتهي قريباً',
    headlineHe: 'המבצע מסתיים בקרוב',
    subheadline: "Don't miss out on these deals",
    subheadlineAr: 'لا تفوت هذه العروض',
    subheadlineHe: 'אל תפספסו את המבצעים האלה',
    ctaText: 'Shop Sale',
    ctaTextAr: 'تسوق التنزيلات',
    ctaTextHe: 'קנה במבצע',
    size: 'large',
  },
  {
    id: 'flash',
    headline: 'Flash Sale',
    headlineAr: 'تخفيض فلاش',
    headlineHe: 'מבצע פלאש',
    subheadline: '24 hours only - Extra 20% off',
    subheadlineAr: '24 ساعة فقط - خصم إضافي 20%',
    subheadlineHe: '24 שעות בלבד - 20% הנחה נוספת',
    ctaText: 'Shop Flash Sale',
    ctaTextAr: 'تسوق تخفيض الفلاش',
    ctaTextHe: 'קנה במבצע פלאש',
    size: 'medium',
  },
];

// Email templates
export const WHITEFRIDAY_EMAILS: EmailTemplate[] = [
  {
    id: 'announcement',
    subject: 'White Friday Sale is Here!',
    subjectAr: 'تنزيلات الجمعة البيضاء بدأت!',
    subjectHe: 'מבצע היום הלבן כאן!',
    preview: 'Up to 70% off starts now',
    previewAr: 'خصم يصل إلى 70% يبدأ الآن',
    previewHe: 'עד 70% הנחה מתחילה עכשיו',
    type: 'announcement',
  },
  {
    id: 'reminder',
    subject: 'White Friday Ends Tomorrow',
    subjectAr: 'الجمعة البيضاء تنتهي غداً',
    subjectHe: 'היום הלבן מסתיים מחר',
    preview: 'Last chance to save big',
    previewAr: 'فرصتك الأخيرة للتوفير الكبير',
    previewHe: 'הזדמנות אחרונה לחסוך גדול',
    type: 'reminder',
  },
  {
    id: 'last-chance',
    subject: 'Final Hours: White Friday',
    subjectAr: 'الساعات الأخيرة: الجمعة البيضاء',
    subjectHe: 'שעות אחרונות: היום הלבן',
    preview: 'Sale ends at midnight',
    previewAr: 'التنزيلات تنتهي منتصف الليل',
    previewHe: 'המבצע מסתיים בחצות',
    type: 'last-chance',
  },
  {
    id: 'exclusive',
    subject: 'Exclusive: Early Access to White Friday',
    subjectAr: 'حصري: دخول مبكر للجمعة البيضاء',
    subjectHe: 'בלעדי: גישה מוקדמת ליום הלבן',
    preview: 'VIP customers shop 24 hours early',
    previewAr: 'عملاء VIP يتسوقون قبل 24 ساعة',
    previewHe: 'לקוחות VIP קונים 24 שעות מוקדם',
    type: 'exclusive',
  },
];

// Countdown labels
export const COUNTDOWN_LABELS = {
  en: { days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds', startsIn: 'Starts In', endsIn: 'Ends In', ended: 'Sale Ended', startsSoon: 'Starts Soon' },
  ar: { days: 'يوم', hours: 'ساعة', minutes: 'دقيقة', seconds: 'ثانية', startsIn: 'يبدأ خلال', endsIn: 'ينتهي خلال', ended: 'انتهى التخفيض', startsSoon: 'يبدأ قريباً' },
  he: { days: 'ימים', hours: 'שעות', minutes: 'דקות', seconds: 'שניות', startsIn: 'מתחיל בעוד', endsIn: 'מסתיים בעוד', ended: 'המבצע הסתיים', startsSoon: 'מתחיל בקרוב' },
};

// Promotional text templates
export const PROMOTIONAL_TEXT = {
  en: {
    saveUpTo: (discount: number) => `Save up to ${discount}%`,
    startingFrom: (price: number) => `Starting from $${price}`,
    limitedTime: 'Limited Time Offer',
    freeShipping: 'Free Shipping on All Orders',
    buyNow: 'Buy Now',
    addToCart: 'Add to Cart',
    whileSuppliesLast: 'While Supplies Last',
    exclusiveDeal: 'Exclusive Deal',
    vipEarlyAccess: 'VIP Early Access',
    lowestPrice: 'Lowest Price of the Year',
  },
  ar: {
    saveUpTo: (discount: number) => `وفّر حتى ${discount}%`,
    startingFrom: (price: number) => `يبدأ من ${price}$`,
    limitedTime: 'عرض لوقت محدود',
    freeShipping: 'شحن مجاني على جميع الطلبات',
    buyNow: 'اشترِ الآن',
    addToCart: 'أضف إلى السلة',
    whileSuppliesLast: 'حتى نفاد الكمية',
    exclusiveDeal: 'عرض حصري',
    vipEarlyAccess: 'دخول مبكر للـ VIP',
    lowestPrice: 'أقل سعر في السنة',
  },
  he: {
    saveUpTo: (discount: number) => `חסוך עד ${discount}%`,
    startingFrom: (price: number) => `החל מ-$${price}`,
    limitedTime: 'הצעה לזמן מוגבל',
    freeShipping: 'משלוח חינם על כל ההזמנות',
    buyNow: 'קנה עכשיו',
    addToCart: 'הוסף לסל',
    whileSuppliesLast: 'עד גמר המלאי',
    exclusiveDeal: 'מבצע בלעדי',
    vipEarlyAccess: 'גישה מוקדמת ל-VIP',
    lowestPrice: 'המחיר הכי נמוך בשנה',
  },
};

// Template definitions
export const TEMPLATES: Record<TemplateType, Record<Locale, { title: string; description: string; content: string }>> = {
  hero: {
    en: { title: 'White Friday Sale', description: 'Hero banner for main landing page', content: 'Up to 70% off on everything' },
    ar: { title: 'تنزيلات الجمعة البيضاء', description: 'بانر رئيسي للصفحة الرئيسية', content: 'خصم يصل إلى 70% على كل شيء' },
    he: { title: 'מבצע היום הלבן', description: 'באנר ראשי לדף הנחיתה', content: 'עד 70% הנחה על הכל' },
  },
  countdown: {
    en: { title: 'Sale Ends In', description: 'Countdown timer banner', content: 'Hurry! Sale ends soon' },
    ar: { title: 'التنزيلات تنتهي بعد', description: 'بانر عداد تنازلي', content: 'أسرع! التنزيلات تنتهي قريباً' },
    he: { title: 'המבצע מסתיים בעוד', description: 'באנר טיימר ספירה לאחור', content: 'מהר! המבצע מסתיים בקרוב' },
  },
  'sale-badge': {
    en: { title: 'Sale Badge', description: 'Product sale badge', content: '50% OFF' },
    ar: { title: 'شارة التخفيض', description: 'شارة تخفيض للمنتج', content: 'خصم 50%' },
    he: { title: 'תג מבצע', description: 'תג מבצע למוצר', content: '50% הנחה' },
  },
  'product-card': {
    en: { title: 'Product Card', description: 'Product card with discount', content: 'Special White Friday Price' },
    ar: { title: 'بطاقة المنتج', description: 'بطاقة منتج مع خصم', content: 'سعر خاص للجمعة البيضاء' },
    he: { title: 'כרטיס מוצר', description: 'כרטיס מוצר עם הנחה', content: 'מחיר מיוחד ליום הלבן' },
  },
  'email-announcement': {
    en: { title: 'Sale Announcement Email', description: 'Initial announcement email', content: 'White Friday is here! Shop now for the best deals.' },
    ar: { title: 'بريد إعلان التنزيلات', description: 'بريد الإعلان الأولي', content: 'الجمعة البيضاء هنا! تسوق الآن للحصول على أفضل العروض.' },
    he: { title: 'מייל הכרזה על מבצע', description: 'מייל הכרזה ראשוני', content: 'היום הלבן כאן! קנה עכשיו למבצעים הטובים ביותר.' },
  },
  'email-reminder': {
    en: { title: 'Sale Reminder Email', description: 'Reminder before sale ends', content: 'Last chance! Sale ends tomorrow.' },
    ar: { title: 'بريد تذكير بالتنزيلات', description: 'تذكير قبل انتهاء التنزيلات', content: 'فرصة أخيرة! التنزيلات تنتهي غداً.' },
    he: { title: 'מייל תזכורת למבצע', description: 'תזכורת לפני סיום המבצע', content: 'הזדמנות אחרונה! המבצע מסתיים מחר.' },
  },
  'email-last-chance': {
    en: { title: 'Last Chance Email', description: 'Final hours notification', content: 'Final hours! Shop before midnight.' },
    ar: { title: 'بريد الفرصة الأخيرة', description: 'إشعار الساعات الأخيرة', content: 'الساعات الأخيرة! تسوق قبل منتصف الليل.' },
    he: { title: 'מייל הזדמנות אחרונה', description: 'הודעת שעות אחרונות', content: 'שעות אחרונות! קנה לפני חצות.' },
  },
};

/** Get White Friday template by type and locale */
export function getWhiteFridayTemplate(type: TemplateType, locale: Locale = 'en'): { title: string; description: string; content: string } {
  const template = TEMPLATES[type];
  if (!template) throw new Error(`Template type "${type}" not found`);
  return template[locale] || template.en;
}

/** Get countdown labels for locale */
export function getCountdownLabels(locale: Locale = 'en'): typeof COUNTDOWN_LABELS.en {
  return COUNTDOWN_LABELS[locale] || COUNTDOWN_LABELS.en;
}

/** Get promotional text for offer and locale */
export function getPromotionalText(offer: keyof typeof PROMOTIONAL_TEXT.en, locale: Locale = 'en', ...args: (string | number)[]): string {
  const texts = PROMOTIONAL_TEXT[locale] || PROMOTIONAL_TEXT.en;
  const text = texts[offer];
  if (typeof text === 'function') return text(args[0] as number);
  return text || '';
}

/** Create White Friday campaign */
export function createWhiteFridayCampaign(year: number): WhiteFridayCampaign {
  const nov30 = new Date(year, 10, 30);
  const lastFriday = new Date(nov30);
  lastFriday.setDate(nov30.getDate() - ((nov30.getDay() + 2) % 7));
  const endDate = new Date(lastFriday);
  endDate.setDate(lastFriday.getDate() + 4);

  return {
    id: `white-friday-${year}`,
    name: 'White Friday',
    nameAr: 'الجمعة البيضاء',
    nameHe: 'היום הלבן',
    startDate: lastFriday,
    endDate,
    discount: 50,
    theme: WHITEFRIDAY_THEME,
    badges: WHITEFRIDAY_BADGES,
    banners: WHITEFRIDAY_BANNERS,
    emailTemplates: WHITEFRIDAY_EMAILS,
  };
}

/** Get countdown to White Friday */
export function getWhiteFridayCountdown(year: number): { days: number; hours: number; minutes: number } {
  const campaign = createWhiteFridayCampaign(year);
  const now = new Date();
  const diff = campaign.startDate.getTime() - now.getTime();
  if (diff < 0) return { days: 0, hours: 0, minutes: 0 };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes };
}

/** Format countdown for display */
export function formatCountdown(countdown: { days: number; hours: number; minutes: number }, locale: Locale = 'en'): string {
  const labels = getCountdownLabels(locale);
  if (locale === 'ar' || locale === 'he') {
    return `${countdown.days} ${labels.days} ${countdown.hours} ${labels.hours} ${countdown.minutes} ${labels.minutes}`;
  }
  return `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m`;
}

/** Get sale badge */
export function getSaleBadge(discount: number, locale: Locale = 'en'): string {
  if (locale === 'ar') return `خصم ${discount}%`;
  if (locale === 'he') return `${discount}% הנחה`;
  return `${discount}% OFF`;
}

/** Check if White Friday is active */
export function isWhiteFridayActive(year: number): boolean {
  const campaign = createWhiteFridayCampaign(year);
  const now = new Date();
  return now >= campaign.startDate && now <= campaign.endDate;
}

/** Get discount message */
export function getDiscountMessage(discount: number, locale: Locale = 'en'): string {
  if (locale === 'ar') return `وفّر ${discount}% على كل شيء`;
  if (locale === 'he') return `${discount}% הנחה על הכל`;
  return `Save ${discount}% on everything`;
}

/** Get banner by ID and locale */
export function getBanner(id: string, locale: Locale = 'en'): { headline: string; subheadline: string; ctaText: string; size: string } | null {
  const banner = WHITEFRIDAY_BANNERS.find(b => b.id === id);
  if (!banner) return null;
  let headline: string, subheadline: string, ctaText: string;
  switch (locale) {
    case 'ar': headline = banner.headlineAr; subheadline = banner.subheadlineAr; ctaText = banner.ctaTextAr; break;
    case 'he': headline = banner.headlineHe; subheadline = banner.subheadlineHe; ctaText = banner.ctaTextHe; break;
    default: headline = banner.headline; subheadline = banner.subheadline; ctaText = banner.ctaText;
  }
  return { headline, subheadline, ctaText, size: banner.size };
}

/** Get badge by ID and locale */
export function getBadge(id: string, locale: Locale = 'en'): { text: string; style: string; color: string } | null {
  const badge = WHITEFRIDAY_BADGES.find(b => b.id === id);
  if (!badge) return null;
  let text: string;
  switch (locale) {
    case 'ar': text = badge.textAr; break;
    case 'he': text = badge.textHe; break;
    default: text = badge.text;
  }
  return { text, style: badge.style, color: badge.color };
}

/** Get email template by type and locale */
export function getEmailTemplate(type: EmailTemplate['type'], locale: Locale = 'en'): { subject: string; preview: string } | null {
  const template = WHITEFRIDAY_EMAILS.find(t => t.type === type);
  if (!template) return null;
  let subject: string, preview: string;
  switch (locale) {
    case 'ar': subject = template.subjectAr; preview = template.previewAr; break;
    case 'he': subject = template.subjectHe; preview = template.previewHe; break;
    default: subject = template.subject; preview = template.preview;
  }
  return { subject, preview };
}

/** Get all badges for locale */
export function getAllBadges(locale: Locale = 'en'): Array<{ id: string; text: string; style: string; color: string }> {
  return WHITEFRIDAY_BADGES.map(badge => {
    let text: string;
    switch (locale) {
      case 'ar': text = badge.textAr; break;
      case 'he': text = badge.textHe; break;
      default: text = badge.text;
    }
    return { id: badge.id, text, style: badge.style, color: badge.color };
  });
}

/** Get campaign status */
export function getCampaignStatus(year: number): 'upcoming' | 'active' | 'ended' {
  const campaign = createWhiteFridayCampaign(year);
  const now = new Date();
  if (now < campaign.startDate) return 'upcoming';
  if (now > campaign.endDate) return 'ended';
  return 'active';
}
