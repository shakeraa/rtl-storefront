/**
 * Regional Trust Badge Library (T0390)
 *
 * Provides localized trust badges for MENA and Israeli markets,
 * including certifications, payment methods, shipping, and security.
 */

export type BadgeCategory = 'certification' | 'payment' | 'shipping' | 'support' | 'security';

export interface TrustBadge {
  id: string;
  name: string;
  nameAr: string;
  nameHe: string;
  category: BadgeCategory;
  countries: string[];
  icon: string;
  description: string;
}

export const TRUST_BADGES: TrustBadge[] = [
  // Certification badges
  { id: 'halal_certified', name: 'Halal Certified', nameAr: 'حلال معتمد', nameHe: 'כשר חלאל', category: 'certification', countries: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'EG', 'JO', 'IQ', 'MA', 'TN', 'DZ', 'LB', 'TR'], icon: 'halal-badge', description: 'Product meets halal certification standards' },
  { id: 'kosher_certified', name: 'Kosher Certified', nameAr: 'شهادة كوشر', nameHe: 'כשרות מאושרת', category: 'certification', countries: ['IL'], icon: 'kosher-badge', description: 'Product meets kosher certification standards' },
  { id: 'saso_approved', name: 'SASO Approved', nameAr: 'معتمد من ساسو', nameHe: 'מאושר SASO', category: 'certification', countries: ['SA'], icon: 'saso-badge', description: 'Saudi Standards, Metrology and Quality Organization approved' },
  { id: 'esma_approved', name: 'ESMA Approved', nameAr: 'معتمد من إسما', nameHe: 'מאושר ESMA', category: 'certification', countries: ['AE'], icon: 'esma-badge', description: 'Emirates Authority for Standardization and Metrology approved' },
  { id: 'gso_compliant', name: 'GSO Compliant', nameAr: 'متوافق مع هيئة التقييس', nameHe: 'תואם GSO', category: 'certification', countries: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM'], icon: 'gso-badge', description: 'GCC Standardization Organization compliant' },
  { id: 'iso_9001', name: 'ISO 9001', nameAr: 'آيزو 9001', nameHe: 'ISO 9001', category: 'certification', countries: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'EG', 'JO', 'IL', 'TR', 'MA', 'TN'], icon: 'iso-badge', description: 'ISO 9001 quality management certified' },
  { id: 'organic_mena', name: 'Organic Certified', nameAr: 'عضوي معتمد', nameHe: 'אורגני מאושר', category: 'certification', countries: ['SA', 'AE', 'EG', 'JO', 'IL', 'TR'], icon: 'organic-badge', description: 'Certified organic product' },

  // Payment badges
  { id: 'cod_available', name: 'Cash on Delivery', nameAr: 'الدفع عند الاستلام', nameHe: 'תשלום במסירה', category: 'payment', countries: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'EG', 'JO', 'IQ'], icon: 'cod-badge', description: 'Cash on delivery payment accepted' },
  { id: 'mada_accepted', name: 'Mada Accepted', nameAr: 'مدى مقبول', nameHe: 'Mada מקובל', category: 'payment', countries: ['SA'], icon: 'mada-badge', description: 'Saudi Mada debit card accepted' },
  { id: 'knet_accepted', name: 'KNET Accepted', nameAr: 'كي نت مقبول', nameHe: 'KNET מקובל', category: 'payment', countries: ['KW'], icon: 'knet-badge', description: 'Kuwait KNET payment accepted' },
  { id: 'benefit_accepted', name: 'Benefit Accepted', nameAr: 'بنفت مقبول', nameHe: 'Benefit מקובל', category: 'payment', countries: ['BH'], icon: 'benefit-badge', description: 'Bahrain Benefit payment accepted' },
  { id: 'tamara_available', name: 'Tamara BNPL', nameAr: 'تمارا - اشتر الآن وادفع لاحقاً', nameHe: 'Tamara קנה עכשיו שלם אחר כך', category: 'payment', countries: ['SA', 'AE', 'KW'], icon: 'tamara-badge', description: 'Buy now pay later with Tamara' },
  { id: 'tabby_available', name: 'Tabby BNPL', nameAr: 'تابي - اشتر الآن وادفع لاحقاً', nameHe: 'Tabby קנה עכשיו שלם אחר כך', category: 'payment', countries: ['SA', 'AE', 'QA', 'KW', 'BH'], icon: 'tabby-badge', description: 'Buy now pay later with Tabby' },
  { id: 'apple_pay', name: 'Apple Pay', nameAr: 'آبل باي', nameHe: 'Apple Pay', category: 'payment', countries: ['SA', 'AE', 'QA', 'KW', 'BH', 'IL', 'JO', 'EG'], icon: 'apple-pay-badge', description: 'Apple Pay accepted' },
  { id: 'stc_pay', name: 'STC Pay', nameAr: 'إس تي سي باي', nameHe: 'STC Pay', category: 'payment', countries: ['SA'], icon: 'stc-pay-badge', description: 'STC Pay mobile payment accepted' },
  { id: 'fawry_accepted', name: 'Fawry Accepted', nameAr: 'فوري مقبول', nameHe: 'Fawry מקובל', category: 'payment', countries: ['EG'], icon: 'fawry-badge', description: 'Egypt Fawry payment accepted' },

  // Shipping badges
  { id: 'aramex_partner', name: 'Aramex Partner', nameAr: 'شريك أرامكس', nameHe: 'שותף Aramex', category: 'shipping', countries: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'EG', 'JO'], icon: 'aramex-badge', description: 'Shipped via Aramex' },
  { id: 'smsa_express', name: 'SMSA Express', nameAr: 'سمسا إكسبرس', nameHe: 'SMSA Express', category: 'shipping', countries: ['SA'], icon: 'smsa-badge', description: 'SMSA Express delivery in Saudi Arabia' },
  { id: 'fetchr_delivery', name: 'Fetchr Delivery', nameAr: 'فتشر للتوصيل', nameHe: 'Fetchr משלוח', category: 'shipping', countries: ['AE', 'SA', 'BH'], icon: 'fetchr-badge', description: 'Fetchr delivery service' },
  { id: 'local_returns', name: 'Local Returns', nameAr: 'إرجاع محلي', nameHe: 'החזרות מקומיות', category: 'shipping', countries: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'EG', 'JO', 'IL'], icon: 'returns-badge', description: 'Easy local returns accepted' },
  { id: 'same_day_delivery', name: 'Same Day Delivery', nameAr: 'توصيل في نفس اليوم', nameHe: 'משלוח באותו יום', category: 'shipping', countries: ['SA', 'AE', 'KW'], icon: 'same-day-badge', description: 'Same day delivery available' },
  { id: 'free_shipping_gcc', name: 'Free Shipping GCC', nameAr: 'شحن مجاني للخليج', nameHe: 'משלוח חינם למפרץ', category: 'shipping', countries: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM'], icon: 'free-shipping-badge', description: 'Free shipping within GCC countries' },

  // Support badges
  { id: 'arabic_support', name: 'Arabic Support', nameAr: 'دعم بالعربية', nameHe: 'תמיכה בערבית', category: 'support', countries: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'EG', 'JO', 'IQ', 'LB', 'MA', 'TN', 'DZ'], icon: 'arabic-support-badge', description: 'Customer support available in Arabic' },
  { id: 'hebrew_support', name: 'Hebrew Support', nameAr: 'دعم بالعبرية', nameHe: 'תמיכה בעברית', category: 'support', countries: ['IL'], icon: 'hebrew-support-badge', description: 'Customer support available in Hebrew' },
  { id: 'whatsapp_support', name: 'WhatsApp Support', nameAr: 'دعم واتساب', nameHe: 'תמיכה בוואטסאפ', category: 'support', countries: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'EG', 'JO'], icon: 'whatsapp-badge', description: 'Customer support via WhatsApp' },

  // Security badges
  { id: 'ssl_secured', name: 'SSL Secured', nameAr: 'محمي بـ SSL', nameHe: 'מאובטח SSL', category: 'security', countries: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'EG', 'JO', 'IL', 'TR', 'IQ', 'LB', 'MA', 'TN', 'DZ'], icon: 'ssl-badge', description: 'SSL encrypted secure shopping' },
  { id: 'pci_compliant', name: 'PCI Compliant', nameAr: 'متوافق مع PCI', nameHe: 'תואם PCI', category: 'security', countries: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'EG', 'JO', 'IL', 'TR', 'IQ', 'LB', 'MA', 'TN', 'DZ'], icon: 'pci-badge', description: 'PCI DSS compliant payment processing' },
  { id: 'gdpr_compliant', name: 'GDPR Compliant', nameAr: 'متوافق مع GDPR', nameHe: 'תואם GDPR', category: 'security', countries: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'EG', 'JO', 'IL', 'TR', 'IQ', 'LB', 'MA', 'TN', 'DZ'], icon: 'gdpr-badge', description: 'GDPR data protection compliant' },
  { id: 'buyer_protection', name: 'Buyer Protection', nameAr: 'حماية المشتري', nameHe: 'הגנת קונים', category: 'security', countries: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'EG', 'JO', 'IL'], icon: 'buyer-protection-badge', description: 'Buyer protection guarantee' },
  { id: 'verified_merchant', name: 'Verified Merchant', nameAr: 'تاجر موثق', nameHe: 'סוחר מאומת', category: 'security', countries: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'EG', 'JO', 'IL', 'TR'], icon: 'verified-badge', description: 'Verified and trusted merchant' },
];

/**
 * Get all trust badges applicable to a specific country.
 */
export function getBadgesForCountry(countryCode: string): TrustBadge[] {
  return TRUST_BADGES.filter((badge) => badge.countries.includes(countryCode));
}

/**
 * Get all trust badges in a specific category.
 */
export function getBadgesByCategory(category: BadgeCategory): TrustBadge[] {
  return TRUST_BADGES.filter((badge) => badge.category === category);
}

/**
 * Match badges based on merchant certifications and country.
 */
export function getApplicableBadges(merchantCertifications: string[], country: string): TrustBadge[] {
  const countryBadges = getBadgesForCountry(country);
  return countryBadges.filter((badge) => {
    // Security and support badges always apply for the country
    if (badge.category === 'security' || badge.category === 'support') {
      return true;
    }
    // Other badges require merchant to have the certification
    return merchantCertifications.includes(badge.id);
  });
}

/**
 * Get localized labels for a specific badge.
 */
export function getBadgeLabels(badgeId: string, locale: string): { name: string; description: string } | null {
  const badge = TRUST_BADGES.find((b) => b.id === badgeId);
  if (!badge) {
    return null;
  }

  let name = badge.name;
  if (locale.startsWith('ar')) {
    name = badge.nameAr;
  } else if (locale.startsWith('he')) {
    name = badge.nameHe;
  }

  return { name, description: badge.description };
}
