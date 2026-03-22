/**
 * Announcement Bar Translation Service
 */

export type Locale = "en" | "ar" | "he";
export type AnnouncementLabelKey = "close" | "dismiss" | "learnMore" | "shopNow" | "limitedTime" | "freeShipping" | "sale";

export interface AnnouncementLabels { close: string; dismiss: string; learnMore: string; shopNow: string; limitedTime: string; freeShipping: string; sale: string; }
export interface AnnouncementTemplates { freeShippingOverAmount: string; limitedTimeDiscount: string; flashSale: string; newArrival: string; backInStock: string; preOrder: string; }
export interface AnnouncementType { id: string; name: string; description: string; icon?: string; }

const ANNOUNCEMENT_LABELS: Record<Locale, AnnouncementLabels> = {
  en: { close: "Close", dismiss: "Dismiss", learnMore: "Learn more", shopNow: "Shop now", limitedTime: "Limited time", freeShipping: "Free shipping", sale: "Sale" },
  ar: { close: "إغلاق", dismiss: "تجاهل", learnMore: "اعرف المزيد", shopNow: "تسوق الآن", limitedTime: "لفترة محدودة", freeShipping: "شحن مجاني", sale: "تخفيضات" },
  he: { close: "סגור", dismiss: "התעלם", learnMore: "למד עוד", shopNow: "קנה עכשיו", limitedTime: "לזמן מוגבל", freeShipping: "משלוח חינם", sale: "מבצע" },
};

const ANNOUNCEMENT_TEMPLATES: Record<Locale, AnnouncementTemplates> = {
  en: {
    freeShippingOverAmount: "Free shipping on orders over {{amount}}",
    limitedTimeDiscount: "{{discount}}% off - Limited time",
    flashSale: "Flash Sale! Up to {{discount}}% off",
    newArrival: "New arrivals - Shop the latest {{product}}",
    backInStock: "Back in stock! Get your {{product}} now",
    preOrder: "Pre-order {{product}} - Available {{date}}",
  },
  ar: {
    freeShippingOverAmount: "شحن مجاني للطلبات التي تزيد عن {{amount}}",
    limitedTimeDiscount: "خصم {{discount}}% - لفترة محدودة",
    flashSale: "تخفيضات فلاش! خصم يصل إلى {{discount}}%",
    newArrival: "وصل حديثاً - تسّق أحدث {{product}}",
    backInStock: "عاد للمخزون! احصل على {{product}} الآن",
    preOrder: "اطلب {{product}} مسبقاً - متوفر بتاريخ {{date}}",
  },
  he: {
    freeShippingOverAmount: "משלוח חינם בהזמנות מעל {{amount}}",
    limitedTimeDiscount: "{{discount}}% הנחה - לזמן מוגבל",
    flashSale: "מבצע פלאש! עד {{discount}}% הנחה",
    newArrival: "חידושים - קנה את ה-{{product}} החדש ביותר",
    backInStock: "חזר במלאי! השג את {{product}} עכשיו",
    preOrder: "הזמנה מוקדמת {{product}} - זמין ב-{{date}}",
  },
};

const ANNOUNCEMENT_TYPES: Record<Locale, AnnouncementType[]> = {
  en: [
    { id: "promotion", name: "Promotion", description: "Sales and promotional offers", icon: "tag" },
    { id: "shipping", name: "Shipping", description: "Free shipping and delivery info", icon: "truck" },
    { id: "limited", name: "Limited Time", description: "Time-sensitive offers", icon: "clock" },
    { id: "new", name: "New Arrival", description: "New products and collections", icon: "sparkles" },
    { id: "restock", name: "Back in Stock", description: "Previously out of stock items", icon: "package" },
    { id: "preorder", name: "Pre-order", description: "Upcoming product releases", icon: "calendar" },
    { id: "announcement", name: "General", description: "General store announcements", icon: "megaphone" },
  ],
  ar: [
    { id: "promotion", name: "عرض ترويجي", description: "عروض الخصم والتخفيضات", icon: "tag" },
    { id: "shipping", name: "الشحن", description: "معلومات الشحن المجاني والتوصيل", icon: "truck" },
    { id: "limited", name: "لفترة محدودة", description: "عروض محدودة الوقت", icon: "clock" },
    { id: "new", name: "وصل حديثاً", description: "المنتجات والمجموعات الجديدة", icon: "sparkles" },
    { id: "restock", name: "عاد للمخزون", description: "المنتجات التي نفذت وعادت", icon: "package" },
    { id: "preorder", name: "طلب مسبق", description: "المنتجات القادمة قريباً", icon: "calendar" },
    { id: "announcement", name: "إعلان عام", description: "إعلانات المتجر العامة", icon: "megaphone" },
  ],
  he: [
    { id: "promotion", name: "מבצע", description: "מכירות והצעות מיוחדות", icon: "tag" },
    { id: "shipping", name: "משלוח", description: "משלוח חינם ומידע על משלוח", icon: "truck" },
    { id: "limited", name: "לזמן מוגבל", description: "הצעות לזמן מוגבל", icon: "clock" },
    { id: "new", name: "חדש", description: "מוצרים וקולקציות חדשות", icon: "sparkles" },
    { id: "restock", name: "חזר למלאי", description: "פריטים שהיו אזלו וחזרו", icon: "package" },
    { id: "preorder", name: "הזמנה מוקדמת", description: "השקות מוצרים צפויות", icon: "calendar" },
    { id: "announcement", name: "כללי", description: "הודעות כלליות מהחנות", icon: "megaphone" },
  ],
};

function normalizeLocale(locale: string): Locale {
  const base = locale.split("-")[0]?.toLowerCase() ?? "en";
  if (base === "ar") return "ar";
  if (base === "he") return "he";
  return "en";
}

export function getAnnouncementLabel(key: AnnouncementLabelKey, locale: string): string {
  const normalizedLocale = normalizeLocale(locale);
  const labels = ANNOUNCEMENT_LABELS[normalizedLocale];
  return labels[key] ?? ANNOUNCEMENT_LABELS.en[key] ?? key;
}

export function getAllAnnouncementLabels(locale: string): AnnouncementLabels {
  const normalizedLocale = normalizeLocale(locale);
  return ANNOUNCEMENT_LABELS[normalizedLocale] ?? ANNOUNCEMENT_LABELS.en;
}

export function formatAnnouncement(templateKey: keyof AnnouncementTemplates, vars: Record<string, string | number>, locale: string): string {
  const normalizedLocale = normalizeLocale(locale);
  const templates = ANNOUNCEMENT_TEMPLATES[normalizedLocale] ?? ANNOUNCEMENT_TEMPLATES.en;
  let template = templates[templateKey] ?? ANNOUNCEMENT_TEMPLATES.en[templateKey] ?? "";
  for (const [key, value] of Object.entries(vars)) {
    template = template.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value));
  }
  return template;
}

export function formatCustomAnnouncement(template: string, vars: Record<string, string | number>, _locale: string): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value));
  }
  return result;
}

export function getAnnouncementTypes(locale: string): AnnouncementType[] {
  const normalizedLocale = normalizeLocale(locale);
  return ANNOUNCEMENT_TYPES[normalizedLocale] ?? ANNOUNCEMENT_TYPES.en;
}

export function getAnnouncementTypeById(typeId: string, locale: string): AnnouncementType | undefined {
  const types = getAnnouncementTypes(locale);
  return types.find((type) => type.id === typeId);
}

export function getAnnouncementDirection(locale: string): "rtl" | "ltr" {
  const normalizedLocale = normalizeLocale(locale);
  return normalizedLocale === "ar" || normalizedLocale === "he" ? "rtl" : "ltr";
}

export function getTemplateKeys(): (keyof AnnouncementTemplates)[] {
  return Object.keys(ANNOUNCEMENT_TEMPLATES.en) as (keyof AnnouncementTemplates)[];
}

export function isRTLLocale(locale: string): boolean {
  const normalizedLocale = normalizeLocale(locale);
  return normalizedLocale === "ar" || normalizedLocale === "he";
}

export function getSupportedLocales(): Locale[] {
  return ["en", "ar", "he"];
}
