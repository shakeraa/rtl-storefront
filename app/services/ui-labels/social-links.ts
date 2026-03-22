/**
 * Social Link Labels and ARIA Labels
 * Provides translations for social media platform links
 * Supports Arabic (ar), Hebrew (he), and English (en)
 */

export type SocialPlatform =
  | "facebook"
  | "instagram"
  | "twitter"
  | "youtube"
  | "tiktok"
  | "linkedin"
  | "pinterest"
  | "snapchat";

export type SupportedLocale = "en" | "ar" | "he";

export interface SocialLinkData {
  platform: SocialPlatform;
  label: string;
  ariaLabel: string;
}

const SOCIAL_LABELS: Record<SupportedLocale, Record<SocialPlatform, string>> = {
  en: {
    facebook: "Facebook",
    instagram: "Instagram",
    twitter: "Twitter",
    youtube: "YouTube",
    tiktok: "TikTok",
    linkedin: "LinkedIn",
    pinterest: "Pinterest",
    snapchat: "Snapchat",
  },
  ar: {
    facebook: "فيسبوك",
    instagram: "إنستغرام",
    twitter: "تويتر",
    youtube: "يوتيوب",
    tiktok: "تيك توك",
    linkedin: "لينكدإن",
    pinterest: "بينتيريست",
    snapchat: "سناب شات",
  },
  he: {
    facebook: "פייסבוק",
    instagram: "אינסטגרם",
    twitter: "טוויטר",
    youtube: "יוטיוב",
    tiktok: "טיקטוק",
    linkedin: "לינקדאין",
    pinterest: "פינטרסט",
    snapchat: "סנאפצ'אט",
  },
};

const SOCIAL_ARIA_LABELS: Record<SupportedLocale, Record<SocialPlatform, string>> = {
  en: {
    facebook: "Visit our Facebook page",
    instagram: "Visit our Instagram profile",
    twitter: "Visit our Twitter profile",
    youtube: "Visit our YouTube channel",
    tiktok: "Visit our TikTok profile",
    linkedin: "Visit our LinkedIn page",
    pinterest: "Visit our Pinterest profile",
    snapchat: "Visit our Snapchat profile",
  },
  ar: {
    facebook: "زيارة صفحتنا على فيسبوك",
    instagram: "زيارة ملفنا على إنستغرام",
    twitter: "زيارة ملفنا على تويتر",
    youtube: "زيارة قناتنا على يوتيوب",
    tiktok: "زيارة ملفنا على تيك توك",
    linkedin: "زيارة صفحتنا على لينكدإن",
    pinterest: "زيارة ملفنا على بينتيريست",
    snapchat: "زيارة ملفنا على سناب شات",
  },
  he: {
    facebook: "בקרו בעמוד הפייסבוק שלנו",
    instagram: "בקרו בפרופיל האינסטגרם שלנו",
    twitter: "בקרו בפרופיל הטוויטר שלנו",
    youtube: "בקרו בערוץ היוטיוב שלנו",
    tiktok: "בקרו בפרופיל הטיקטוק שלנו",
    linkedin: "בקרו בעמוד הלינקדאין שלנו",
    pinterest: "בקרו בפרופיל הפינטרסט שלנו",
    snapchat: "בקרו בפרופיל הסנאפצ'אט שלנו",
  },
};

const ALL_PLATFORMS: SocialPlatform[] = [
  "facebook",
  "instagram",
  "twitter",
  "youtube",
  "tiktok",
  "linkedin",
  "pinterest",
  "snapchat",
];

function getBaseLocale(locale: string): SupportedLocale {
  const base = locale.split("-")[0]?.toLowerCase() ?? "en";
  if (base === "ar" || base === "he") {
    return base;
  }
  return "en";
}

export function getSocialLabel(platform: SocialPlatform, locale: string): string {
  const baseLocale = getBaseLocale(locale);
  return SOCIAL_LABELS[baseLocale][platform];
}

export function getSocialAriaLabel(platform: SocialPlatform, locale: string): string {
  const baseLocale = getBaseLocale(locale);
  return SOCIAL_ARIA_LABELS[baseLocale][platform];
}

export function getAllSocialLinks(locale: string): SocialLinkData[] {
  const baseLocale = getBaseLocale(locale);
  return ALL_PLATFORMS.map((platform) => ({
    platform,
    label: SOCIAL_LABELS[baseLocale][platform],
    ariaLabel: SOCIAL_ARIA_LABELS[baseLocale][platform],
  }));
}

export function getSocialLinksForPlatforms(
  platforms: SocialPlatform[],
  locale: string
): SocialLinkData[] {
  const baseLocale = getBaseLocale(locale);
  return platforms.map((platform) => ({
    platform,
    label: SOCIAL_LABELS[baseLocale][platform],
    ariaLabel: SOCIAL_ARIA_LABELS[baseLocale][platform],
  }));
}

export function isValidSocialPlatform(platform: string): platform is SocialPlatform {
  return ALL_PLATFORMS.includes(platform as SocialPlatform);
}
