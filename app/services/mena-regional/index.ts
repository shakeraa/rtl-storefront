/**
 * MENA Regional Integrations Service
 *
 * T0298 - Local Influencer Integration
 * T0299 - Regional Social Platforms
 * T0300 - Local Legal Compliance
 */

// ---------------------------------------------------------------------------
// T0298 - Local Influencer Integration
// ---------------------------------------------------------------------------

export interface InfluencerPlatform {
  id: string;
  name: string;
  nameAr: string;
  url: string;
  countries: string[];
  category: "fashion" | "beauty" | "lifestyle" | "food" | "tech";
}

export const MENA_INFLUENCER_PLATFORMS: InfluencerPlatform[] = [
  {
    id: "boutiqaat",
    name: "Boutiqaat",
    nameAr: "بوتيكات",
    url: "https://www.boutiqaat.com",
    countries: ["KW", "SA", "AE", "BH"],
    category: "beauty",
  },
  {
    id: "namshi-influencers",
    name: "Namshi Influencers",
    nameAr: "نمشي للمؤثرين",
    url: "https://www.namshi.com",
    countries: ["AE", "SA", "KW", "BH", "OM", "QA"],
    category: "fashion",
  },
  {
    id: "sephora-me",
    name: "Sephora Middle East",
    nameAr: "سيفورا الشرق الأوسط",
    url: "https://www.sephora.ae",
    countries: ["AE", "SA", "KW", "BH"],
    category: "beauty",
  },
  {
    id: "ounass",
    name: "Ounass",
    nameAr: "أناس",
    url: "https://www.ounass.com",
    countries: ["AE", "SA", "KW", "QA", "OM", "BH"],
    category: "fashion",
  },
  {
    id: "modanisa",
    name: "Modanisa",
    nameAr: "مودانيسا",
    url: "https://www.modanisa.com",
    countries: ["TR", "SA", "AE", "KW", "EG"],
    category: "fashion",
  },
  {
    id: "the-luxury-closet",
    name: "The Luxury Closet",
    nameAr: "ذا لاكجري كلوزيت",
    url: "https://www.theluxurycloset.com",
    countries: ["AE", "SA", "KW", "QA"],
    category: "lifestyle",
  },
  {
    id: "mumzworld",
    name: "Mumzworld",
    nameAr: "ممز ورلد",
    url: "https://www.mumzworld.com",
    countries: ["AE", "SA", "KW", "BH", "OM", "QA"],
    category: "lifestyle",
  },
  {
    id: "noon-influencers",
    name: "Noon Influencers",
    nameAr: "نون للمؤثرين",
    url: "https://www.noon.com",
    countries: ["AE", "SA", "EG"],
    category: "tech",
  },
  {
    id: "elabelz",
    name: "Elabelz",
    nameAr: "إيلابلز",
    url: "https://www.elabelz.com",
    countries: ["AE", "SA", "KW", "BH", "OM", "QA"],
    category: "fashion",
  },
  {
    id: "talabat-partners",
    name: "Talabat Partners",
    nameAr: "شركاء طلبات",
    url: "https://www.talabat.com",
    countries: ["KW", "AE", "SA", "BH", "QA", "OM", "EG", "JO"],
    category: "food",
  },
];

export function getInfluencerPlatforms(country: string): InfluencerPlatform[] {
  const upper = country.toUpperCase();
  return MENA_INFLUENCER_PLATFORMS.filter((p) => p.countries.includes(upper));
}

export function getInfluencerPlatformsByCategory(
  category: string,
): InfluencerPlatform[] {
  return MENA_INFLUENCER_PLATFORMS.filter((p) => p.category === category);
}

// ---------------------------------------------------------------------------
// T0299 - Regional Social Platforms
// ---------------------------------------------------------------------------

export interface SocialPlatform {
  id: string;
  name: string;
  nameAr: string;
  shareUrl: string;
  icon: string;
  popular: string[];
}

export const MENA_SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    nameAr: "واتساب",
    shareUrl: "https://api.whatsapp.com/send?text={text}%20{url}",
    icon: "whatsapp",
    popular: ["SA", "AE", "KW", "BH", "QA", "OM", "EG", "JO", "LB", "IQ"],
  },
  {
    id: "instagram",
    name: "Instagram",
    nameAr: "إنستغرام",
    shareUrl: "https://www.instagram.com/",
    icon: "instagram",
    popular: ["SA", "AE", "KW", "BH", "QA", "OM", "EG", "JO", "LB"],
  },
  {
    id: "snapchat",
    name: "Snapchat",
    nameAr: "سناب شات",
    shareUrl: "https://www.snapchat.com/scan?attachmentUrl={url}",
    icon: "snapchat",
    popular: ["SA", "AE", "KW"],
  },
  {
    id: "tiktok",
    name: "TikTok",
    nameAr: "تيك توك",
    shareUrl: "https://www.tiktok.com/",
    icon: "tiktok",
    popular: ["SA", "AE", "KW", "EG", "BH", "QA", "OM", "JO"],
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    nameAr: "إكس (تويتر)",
    shareUrl: "https://twitter.com/intent/tweet?text={text}&url={url}",
    icon: "twitter",
    popular: ["SA", "AE", "KW", "EG"],
  },
  {
    id: "telegram",
    name: "Telegram",
    nameAr: "تليجرام",
    shareUrl: "https://t.me/share/url?url={url}&text={text}",
    icon: "telegram",
    popular: ["SA", "AE", "KW", "BH", "QA", "OM", "EG", "IQ"],
  },
  {
    id: "pinterest",
    name: "Pinterest",
    nameAr: "بنترست",
    shareUrl: "https://pinterest.com/pin/create/button/?url={url}&description={text}",
    icon: "pinterest",
    popular: ["AE", "SA"],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    nameAr: "لينكد إن",
    shareUrl: "https://www.linkedin.com/sharing/share-offsite/?url={url}",
    icon: "linkedin",
    popular: ["AE", "SA"],
  },
];

export function getSocialPlatforms(country: string): SocialPlatform[] {
  const upper = country.toUpperCase();
  return MENA_SOCIAL_PLATFORMS.filter((p) => p.popular.includes(upper));
}

export function buildShareUrl(
  platform: SocialPlatform,
  url: string,
  text: string,
): string {
  return platform.shareUrl
    .replace("{url}", encodeURIComponent(url))
    .replace("{text}", encodeURIComponent(text));
}

export function getSocialShareButtons(
  country: string,
  url: string,
  text: string,
): Array<{ name: string; nameAr: string; url: string; icon: string }> {
  const platforms = getSocialPlatforms(country);
  return platforms.map((p) => ({
    name: p.name,
    nameAr: p.nameAr,
    url: buildShareUrl(p, url, text),
    icon: p.icon,
  }));
}

// ---------------------------------------------------------------------------
// T0300 - Local Legal Compliance
// ---------------------------------------------------------------------------

export interface LegalRequirement {
  id: string;
  country: string;
  category:
    | "ecommerce"
    | "data_privacy"
    | "consumer_protection"
    | "tax"
    | "advertising";
  requirement: string;
  requirementAr: string;
  mandatory: boolean;
  reference?: string;
}

export const MENA_LEGAL_REQUIREMENTS: LegalRequirement[] = [
  // --- Saudi Arabia (SA) ---
  {
    id: "sa-ecommerce-law",
    country: "SA",
    category: "ecommerce",
    requirement: "Comply with Saudi E-Commerce Law (Royal Decree M/126)",
    requirementAr: "الامتثال لنظام التجارة الإلكترونية (المرسوم الملكي م/126)",
    mandatory: true,
    reference: "https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/7a23cb4a-10ba-4be8-a22b-aa72009f6b47",
  },
  {
    id: "sa-pdpl",
    country: "SA",
    category: "data_privacy",
    requirement: "Comply with Personal Data Protection Law (PDPL)",
    requirementAr: "الامتثال لنظام حماية البيانات الشخصية",
    mandatory: true,
    reference: "https://sdaia.gov.sa/en/SDAIA/aboutSDaia/Pages/PersonalDataProtection.aspx",
  },
  {
    id: "sa-vat",
    country: "SA",
    category: "tax",
    requirement: "Display prices inclusive of 15% VAT, show VAT registration number",
    requirementAr: "عرض الأسعار شاملة ضريبة القيمة المضافة 15٪ وعرض رقم التسجيل الضريبي",
    mandatory: true,
    reference: "https://zatca.gov.sa",
  },
  {
    id: "sa-citc-advertising",
    country: "SA",
    category: "advertising",
    requirement: "Comply with CITC regulations on digital advertising and disclosure",
    requirementAr: "الامتثال لأنظمة هيئة الاتصالات بشأن الإعلان الرقمي والإفصاح",
    mandatory: true,
    reference: "https://www.citc.gov.sa",
  },
  {
    id: "sa-consumer-protection",
    country: "SA",
    category: "consumer_protection",
    requirement: "Provide 7-day return policy, clear refund terms per consumer protection regulations",
    requirementAr: "توفير سياسة إرجاع لمدة 7 أيام وشروط استرداد واضحة وفقاً لأنظمة حماية المستهلك",
    mandatory: true,
  },

  // --- United Arab Emirates (AE) ---
  {
    id: "ae-ecommerce-law",
    country: "AE",
    category: "ecommerce",
    requirement: "Comply with Federal Decree-Law No. 14/2023 on E-Commerce and Digital Activities",
    requirementAr: "الامتثال للمرسوم الاتحادي رقم 14/2023 بشأن التجارة الإلكترونية والأنشطة الرقمية",
    mandatory: true,
  },
  {
    id: "ae-data-protection",
    country: "AE",
    category: "data_privacy",
    requirement: "Comply with Federal Decree-Law No. 45/2021 on Personal Data Protection",
    requirementAr: "الامتثال للمرسوم الاتحادي رقم 45/2021 بشأن حماية البيانات الشخصية",
    mandatory: true,
  },
  {
    id: "ae-consumer-protection",
    country: "AE",
    category: "consumer_protection",
    requirement: "Comply with Federal Law No. 15/2020 on Consumer Protection, provide clear pricing and return policies",
    requirementAr: "الامتثال للقانون الاتحادي رقم 15/2020 بشأن حماية المستهلك وتوفير أسعار واضحة وسياسات إرجاع",
    mandatory: true,
  },
  {
    id: "ae-vat",
    country: "AE",
    category: "tax",
    requirement: "Display prices inclusive of 5% VAT, show Tax Registration Number (TRN)",
    requirementAr: "عرض الأسعار شاملة ضريبة القيمة المضافة 5٪ وعرض رقم التسجيل الضريبي",
    mandatory: true,
    reference: "https://tax.gov.ae",
  },
  {
    id: "ae-advertising",
    country: "AE",
    category: "advertising",
    requirement: "Comply with National Media Council advertising standards and disclosure rules",
    requirementAr: "الامتثال لمعايير المجلس الوطني للإعلام بشأن الإعلان وقواعد الإفصاح",
    mandatory: true,
  },

  // --- Kuwait (KW) ---
  {
    id: "kw-consumer-protection",
    country: "KW",
    category: "consumer_protection",
    requirement: "Comply with Kuwait Consumer Protection Law No. 39/2014",
    requirementAr: "الامتثال لقانون حماية المستهلك الكويتي رقم 39/2014",
    mandatory: true,
  },
  {
    id: "kw-commercial-law",
    country: "KW",
    category: "ecommerce",
    requirement: "Comply with Kuwait Commercial Code, display commercial license number",
    requirementAr: "الامتثال لقانون التجارة الكويتي وعرض رقم الرخصة التجارية",
    mandatory: true,
  },
  {
    id: "kw-advertising",
    country: "KW",
    category: "advertising",
    requirement: "Comply with Ministry of Commerce advertising guidelines",
    requirementAr: "الامتثال لإرشادات وزارة التجارة بشأن الإعلان",
    mandatory: false,
  },

  // --- Bahrain (BH) ---
  {
    id: "bh-data-protection",
    country: "BH",
    category: "data_privacy",
    requirement: "Comply with Bahrain Personal Data Protection Law (PDPL) No. 30/2018",
    requirementAr: "الامتثال لقانون حماية البيانات الشخصية البحريني رقم 30/2018",
    mandatory: true,
  },
  {
    id: "bh-consumer-rights",
    country: "BH",
    category: "consumer_protection",
    requirement: "Comply with Consumer Protection Law, provide clear return and refund policies",
    requirementAr: "الامتثال لقانون حماية المستهلك وتوفير سياسات إرجاع واسترداد واضحة",
    mandatory: true,
  },
  {
    id: "bh-ecommerce",
    country: "BH",
    category: "ecommerce",
    requirement: "Register e-commerce activity with MOIC, display commercial registration number",
    requirementAr: "تسجيل النشاط الإلكتروني لدى وزارة الصناعة والتجارة وعرض رقم السجل التجاري",
    mandatory: true,
  },

  // --- Qatar (QA) ---
  {
    id: "qa-consumer-protection",
    country: "QA",
    category: "consumer_protection",
    requirement: "Comply with Qatar Consumer Protection Law No. 8/2008",
    requirementAr: "الامتثال لقانون حماية المستهلك القطري رقم 8/2008",
    mandatory: true,
  },
  {
    id: "qa-data-privacy",
    country: "QA",
    category: "data_privacy",
    requirement: "Comply with Qatar Data Privacy Law No. 13/2016",
    requirementAr: "الامتثال لقانون حماية البيانات القطري رقم 13/2016",
    mandatory: true,
  },

  // --- Oman (OM) ---
  {
    id: "om-consumer-protection",
    country: "OM",
    category: "consumer_protection",
    requirement: "Comply with Consumer Protection Law (Royal Decree 66/2014)",
    requirementAr: "الامتثال لقانون حماية المستهلك (المرسوم السلطاني 66/2014)",
    mandatory: true,
  },
  {
    id: "om-ecommerce",
    country: "OM",
    category: "ecommerce",
    requirement: "Comply with Electronic Transactions Law (Royal Decree 69/2008)",
    requirementAr: "الامتثال لقانون المعاملات الإلكترونية (المرسوم السلطاني 69/2008)",
    mandatory: true,
  },
];

export function getLegalRequirements(country: string): LegalRequirement[] {
  const upper = country.toUpperCase();
  return MENA_LEGAL_REQUIREMENTS.filter((r) => r.country === upper);
}

export function getMandatoryRequirements(country: string): LegalRequirement[] {
  return getLegalRequirements(country).filter((r) => r.mandatory);
}

export function getLegalChecklist(
  country: string,
  locale: string,
): Array<{ requirement: string; mandatory: boolean; met: boolean }> {
  const requirements = getLegalRequirements(country);
  const isArabic = locale.startsWith("ar");

  return requirements.map((r) => ({
    requirement: isArabic ? r.requirementAr : r.requirement,
    mandatory: r.mandatory,
    met: false, // Default to not met; consumers check and update
  }));
}
