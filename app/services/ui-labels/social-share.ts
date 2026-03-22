/**
 * Social Share Button Translation Service
 * T0143: Social Share Button Translation
 * 
 * Provides translated labels and URL generators for social sharing buttons
 * supporting Arabic (ar), Hebrew (he), and English (en) locales.
 */

/**
 * Supported social share platforms
 */
export type SharePlatform = 'facebook' | 'twitter' | 'whatsapp' | 'email' | 'copyLink';

/**
 * Share label keys for translation lookup
 */
export type ShareLabelKey =
  | 'share'
  | 'shareOnFacebook'
  | 'shareOnTwitter'
  | 'shareOnWhatsApp'
  | 'shareOnEmail'
  | 'copyLink';

/**
 * Interface for a single share option
 */
export interface ShareOption {
  platform: SharePlatform;
  label: string;
  ariaLabel: string;
  icon?: string;
}

/**
 * Interface for complete share labels set
 */
export interface ShareLabelsSet {
  share: string;
  shareOnFacebook: string;
  shareOnTwitter: string;
  shareOnWhatsApp: string;
  shareOnEmail: string;
  copyLink: string;
}

// Arabic translations
export const ARABIC_SHARE_LABELS: ShareLabelsSet = {
  share: 'مشاركة',
  shareOnFacebook: 'مشاركة على فيسبوك',
  shareOnTwitter: 'مشاركة على تويتر',
  shareOnWhatsApp: 'مشاركة على واتساب',
  shareOnEmail: 'مشاركة عبر البريد الإلكتروني',
  copyLink: 'نسخ الرابط',
};

// Hebrew translations
export const HEBREW_SHARE_LABELS: ShareLabelsSet = {
  share: 'שיתוף',
  shareOnFacebook: 'שתף בפייסבוק',
  shareOnTwitter: 'שתף בטוויטר',
  shareOnWhatsApp: 'שתף בוואטסאפ',
  shareOnEmail: 'שתף באימייל',
  copyLink: 'העתק קישור',
};

// English translations (default)
export const ENGLISH_SHARE_LABELS: ShareLabelsSet = {
  share: 'Share',
  shareOnFacebook: 'Share on Facebook',
  shareOnTwitter: 'Share on Twitter',
  shareOnWhatsApp: 'Share on WhatsApp',
  shareOnEmail: 'Share via Email',
  copyLink: 'Copy Link',
};

// Map of locales to their label sets
const LABELS_BY_LOCALE: Record<string, ShareLabelsSet> = {
  ar: ARABIC_SHARE_LABELS,
  he: HEBREW_SHARE_LABELS,
  en: ENGLISH_SHARE_LABELS,
};

/**
 * Get normalized base locale from full locale string
 * e.g., 'ar-SA' -> 'ar', 'he-IL' -> 'he'
 */
function normalizeLocale(locale: string): string {
  return locale.split('-')[0]?.toLowerCase() || 'en';
}

/**
 * Get all share labels for a locale
 * @param locale - The locale code (e.g., 'ar', 'he', 'en', 'ar-SA')
 * @returns ShareLabelsSet with translated labels
 */
export function getShareLabels(locale: string): ShareLabelsSet {
  const normalizedLocale = normalizeLocale(locale);
  return LABELS_BY_LOCALE[normalizedLocale] || ENGLISH_SHARE_LABELS;
}

/**
 * Get a specific share label by key
 * @param key - The label key to retrieve
 * @param locale - The locale code
 * @returns The translated label string
 */
export function getShareLabel(key: ShareLabelKey, locale: string): string {
  const labels = getShareLabels(locale);
  return labels[key] || ENGLISH_SHARE_LABELS[key];
}

/**
 * Generate share URL for a specific platform
 * @param platform - The social platform
 * @param url - The URL to share
 * @param text - Optional text/description to include
 * @returns The platform-specific share URL
 */
export function getShareUrl(
  platform: SharePlatform,
  url: string,
  text?: string
): string {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = text ? encodeURIComponent(text) : '';

  switch (platform) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    
    case 'twitter':
      return text
        ? `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`
        : `https://twitter.com/intent/tweet?url=${encodedUrl}`;
    
    case 'whatsapp':
      return text
        ? `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`
        : `https://api.whatsapp.com/send?text=${encodedUrl}`;
    
    case 'email':
      return text
        ? `mailto:?subject=${encodedText}&body=${encodedUrl}`
        : `mailto:?body=${encodedUrl}`;
    
    case 'copyLink':
      // copyLink doesn't have a URL, it's a local action
      return url;
    
    default:
      return url;
  }
}

/**
 * Get all share options for a locale with complete configuration
 * @param locale - The locale code
 * @param url - Optional URL to include in share options
 * @param text - Optional text for sharing
 * @returns Array of ShareOption with labels and URLs
 */
export function getAllShareOptions(
  locale: string,
  url?: string,
  text?: string
): ShareOption[] {
  const labels = getShareLabels(locale);

  const options: ShareOption[] = [
    {
      platform: 'facebook',
      label: labels.shareOnFacebook,
      ariaLabel: labels.shareOnFacebook,
      icon: 'facebook',
    },
    {
      platform: 'twitter',
      label: labels.shareOnTwitter,
      ariaLabel: labels.shareOnTwitter,
      icon: 'twitter',
    },
    {
      platform: 'whatsapp',
      label: labels.shareOnWhatsApp,
      ariaLabel: labels.shareOnWhatsApp,
      icon: 'whatsapp',
    },
    {
      platform: 'email',
      label: labels.shareOnEmail,
      ariaLabel: labels.shareOnEmail,
      icon: 'email',
    },
    {
      platform: 'copyLink',
      label: labels.copyLink,
      ariaLabel: labels.copyLink,
      icon: 'link',
    },
  ];

  // Add URLs if provided
  if (url) {
    return options.map((option) => ({
      ...option,
      url: getShareUrl(option.platform, url, text),
    })) as ShareOption[];
  }

  return options;
}

/**
 * Get share options as a simple key-value map for UI components
 * @param locale - The locale code
 * @returns Record of label keys to translated strings
 */
export function getShareLabelsMap(locale: string): Record<ShareLabelKey, string> {
  const labels = getShareLabels(locale);
  return {
    share: labels.share,
    shareOnFacebook: labels.shareOnFacebook,
    shareOnTwitter: labels.shareOnTwitter,
    shareOnWhatsApp: labels.shareOnWhatsApp,
    shareOnEmail: labels.shareOnEmail,
    copyLink: labels.copyLink,
  };
}

/**
 * Check if a platform supports text content
 * @param platform - The platform to check
 * @returns boolean indicating if text is supported
 */
export function platformSupportsText(platform: SharePlatform): boolean {
  return platform !== 'copyLink';
}

/**
 * Get the primary share button label (generic "Share")
 * @param locale - The locale code
 * @returns The translated "Share" label
 */
export function getPrimaryShareLabel(locale: string): string {
  return getShareLabel('share', locale);
}

/**
 * Get share platforms that are mobile-friendly
 * @returns Array of mobile-optimized platforms
 */
export function getMobileFriendlyPlatforms(): SharePlatform[] {
  return ['whatsapp', 'facebook', 'twitter'];
}

/**
 * Get share platforms that work on desktop
 * @returns Array of desktop-compatible platforms
 */
export function getDesktopPlatforms(): SharePlatform[] {
  return ['facebook', 'twitter', 'email', 'copyLink'];
}
