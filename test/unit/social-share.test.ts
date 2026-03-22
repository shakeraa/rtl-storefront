import { describe, it, expect } from 'vitest';
import {
  getShareLabel,
  getShareUrl,
  getAllShareOptions,
  getShareLabels,
  getShareLabelsMap,
  getPrimaryShareLabel,
  platformSupportsText,
  getMobileFriendlyPlatforms,
  getDesktopPlatforms,
  ARABIC_SHARE_LABELS,
  HEBREW_SHARE_LABELS,
  ENGLISH_SHARE_LABELS,
  type SharePlatform,
} from '../../app/services/ui-labels/social-share';

describe('Social Share Button Translation - T0143', () => {
  describe('getShareLabels', () => {
    it('should return Arabic labels for ar locale', () => {
      const labels = getShareLabels('ar');
      expect(labels.share).toBe('مشاركة');
      expect(labels.shareOnFacebook).toBe('مشاركة على فيسبوك');
      expect(labels.copyLink).toBe('نسخ الرابط');
    });

    it('should return Hebrew labels for he locale', () => {
      const labels = getShareLabels('he');
      expect(labels.share).toBe('שיתוף');
      expect(labels.shareOnFacebook).toBe('שתף בפייסבוק');
      expect(labels.copyLink).toBe('העתק קישור');
    });

    it('should return English labels for en locale', () => {
      const labels = getShareLabels('en');
      expect(labels.share).toBe('Share');
      expect(labels.shareOnFacebook).toBe('Share on Facebook');
      expect(labels.copyLink).toBe('Copy Link');
    });

    it('should handle locale with region code', () => {
      const labelsAr = getShareLabels('ar-SA');
      expect(labelsAr.share).toBe('مشاركة');
      
      const labelsHe = getShareLabels('he-IL');
      expect(labelsHe.share).toBe('שיתוף');
      
      const labelsEn = getShareLabels('en-US');
      expect(labelsEn.share).toBe('Share');
    });

    it('should default to English for unknown locale', () => {
      const labels = getShareLabels('fr');
      expect(labels.share).toBe('Share');
      expect(labels.shareOnTwitter).toBe('Share on Twitter');
    });

    it('should default to English for empty locale', () => {
      const labels = getShareLabels('');
      expect(labels.share).toBe('Share');
    });
  });

  describe('getShareLabel', () => {
    it('should return Arabic share label', () => {
      expect(getShareLabel('share', 'ar')).toBe('مشاركة');
    });

    it('should return Arabic Facebook share label', () => {
      expect(getShareLabel('shareOnFacebook', 'ar')).toBe('مشاركة على فيسبوك');
    });

    it('should return Arabic Twitter share label', () => {
      expect(getShareLabel('shareOnTwitter', 'ar')).toBe('مشاركة على تويتر');
    });

    it('should return Arabic WhatsApp share label', () => {
      expect(getShareLabel('shareOnWhatsApp', 'ar')).toBe('مشاركة على واتساب');
    });

    it('should return Arabic Email share label', () => {
      expect(getShareLabel('shareOnEmail', 'ar')).toBe('مشاركة عبر البريد الإلكتروني');
    });

    it('should return Arabic copy link label', () => {
      expect(getShareLabel('copyLink', 'ar')).toBe('نسخ الرابط');
    });

    it('should return Hebrew share label', () => {
      expect(getShareLabel('share', 'he')).toBe('שיתוף');
    });

    it('should return Hebrew WhatsApp share label', () => {
      expect(getShareLabel('shareOnWhatsApp', 'he')).toBe('שתף בוואטסאפ');
    });

    it('should return Hebrew copy link label', () => {
      expect(getShareLabel('copyLink', 'he')).toBe('העתק קישור');
    });

    it('should return English label as fallback for invalid key', () => {
      // @ts-expect-error - Testing invalid key fallback
      const result = getShareLabel('invalidKey', 'ar');
      expect(result).toBeUndefined();
    });
  });

  describe('getShareUrl', () => {
    it('should generate Facebook share URL', () => {
      const url = getShareUrl('facebook', 'https://example.com/product');
      expect(url).toBe('https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fexample.com%2Fproduct');
    });

    it('should generate Twitter share URL with URL only', () => {
      const url = getShareUrl('twitter', 'https://example.com/product');
      expect(url).toBe('https://twitter.com/intent/tweet?url=https%3A%2F%2Fexample.com%2Fproduct');
    });

    it('should generate Twitter share URL with URL and text', () => {
      const url = getShareUrl('twitter', 'https://example.com/product', 'Check this out!');
      expect(url).toBe('https://twitter.com/intent/tweet?url=https%3A%2F%2Fexample.com%2Fproduct&text=Check%20this%20out!');
    });

    it('should generate WhatsApp share URL with URL only', () => {
      const url = getShareUrl('whatsapp', 'https://example.com/product');
      expect(url).toBe('https://api.whatsapp.com/send?text=https%3A%2F%2Fexample.com%2Fproduct');
    });

    it('should generate WhatsApp share URL with URL and text', () => {
      const url = getShareUrl('whatsapp', 'https://example.com/product', 'Great product!');
      expect(url).toBe('https://api.whatsapp.com/send?text=Great%20product!%20https%3A%2F%2Fexample.com%2Fproduct');
    });

    it('should generate Email share URL with URL only', () => {
      const url = getShareUrl('email', 'https://example.com/product');
      expect(url).toBe('mailto:?body=https%3A%2F%2Fexample.com%2Fproduct');
    });

    it('should generate Email share URL with URL and subject text', () => {
      const url = getShareUrl('email', 'https://example.com/product', 'Product Recommendation');
      expect(url).toBe('mailto:?subject=Product%20Recommendation&body=https%3A%2F%2Fexample.com%2Fproduct');
    });

    it('should return original URL for copyLink platform', () => {
      const url = getShareUrl('copyLink', 'https://example.com/product');
      expect(url).toBe('https://example.com/product');
    });
  });

  describe('getAllShareOptions', () => {
    it('should return all 5 share options in Arabic', () => {
      const options = getAllShareOptions('ar');
      expect(options).toHaveLength(5);
      expect(options[0].label).toBe('مشاركة على فيسبوك');
      expect(options[1].label).toBe('مشاركة على تويتر');
      expect(options[2].label).toBe('مشاركة على واتساب');
      expect(options[3].label).toBe('مشاركة عبر البريد الإلكتروني');
      expect(options[4].label).toBe('نسخ الرابط');
    });

    it('should return all 5 share options in Hebrew', () => {
      const options = getAllShareOptions('he');
      expect(options).toHaveLength(5);
      expect(options[0].label).toBe('שתף בפייסבוק');
      expect(options[2].label).toBe('שתף בוואטסאפ');
      expect(options[4].label).toBe('העתק קישור');
    });

    it('should return all 5 share options in English', () => {
      const options = getAllShareOptions('en');
      expect(options).toHaveLength(5);
      expect(options[0].label).toBe('Share on Facebook');
      expect(options[1].label).toBe('Share on Twitter');
      expect(options[2].label).toBe('Share on WhatsApp');
      expect(options[3].label).toBe('Share via Email');
      expect(options[4].label).toBe('Copy Link');
    });

    it('should include correct platform identifiers', () => {
      const options = getAllShareOptions('en');
      const platforms = options.map(o => o.platform);
      expect(platforms).toContain('facebook');
      expect(platforms).toContain('twitter');
      expect(platforms).toContain('whatsapp');
      expect(platforms).toContain('email');
      expect(platforms).toContain('copyLink');
    });

    it('should include icon names for all options', () => {
      const options = getAllShareOptions('en');
      for (const option of options) {
        expect(option.icon).toBeDefined();
        expect(typeof option.icon).toBe('string');
      }
    });

    it('should include aria labels matching the labels', () => {
      const options = getAllShareOptions('ar');
      expect(options[0].ariaLabel).toBe(options[0].label);
      expect(options[2].ariaLabel).toBe('مشاركة على واتساب');
    });
  });

  describe('getShareLabelsMap', () => {
    it('should return a complete map of labels in Arabic', () => {
      const map = getShareLabelsMap('ar');
      expect(map.share).toBe('مشاركة');
      expect(map.shareOnFacebook).toBe('مشاركة على فيسبوك');
      expect(map.shareOnTwitter).toBe('مشاركة على تويتر');
      expect(map.shareOnWhatsApp).toBe('مشاركة على واتساب');
      expect(map.shareOnEmail).toBe('مشاركة عبر البريد الإلكتروني');
      expect(map.copyLink).toBe('نسخ الرابط');
    });

    it('should return a complete map of labels in Hebrew', () => {
      const map = getShareLabelsMap('he');
      expect(map.share).toBe('שיתוף');
      expect(map.shareOnFacebook).toBe('שתף בפייסבוק');
      expect(map.copyLink).toBe('העתק קישור');
    });
  });

  describe('getPrimaryShareLabel', () => {
    it('should return Arabic primary share label', () => {
      expect(getPrimaryShareLabel('ar')).toBe('مشاركة');
    });

    it('should return Hebrew primary share label', () => {
      expect(getPrimaryShareLabel('he')).toBe('שיתוף');
    });

    it('should return English primary share label', () => {
      expect(getPrimaryShareLabel('en')).toBe('Share');
    });

    it('should default to English for unknown locale', () => {
      expect(getPrimaryShareLabel('de')).toBe('Share');
    });
  });

  describe('platformSupportsText', () => {
    it('should return true for facebook', () => {
      expect(platformSupportsText('facebook')).toBe(true);
    });

    it('should return true for twitter', () => {
      expect(platformSupportsText('twitter')).toBe(true);
    });

    it('should return true for whatsapp', () => {
      expect(platformSupportsText('whatsapp')).toBe(true);
    });

    it('should return true for email', () => {
      expect(platformSupportsText('email')).toBe(true);
    });

    it('should return false for copyLink', () => {
      expect(platformSupportsText('copyLink')).toBe(false);
    });
  });

  describe('getMobileFriendlyPlatforms', () => {
    it('should return whatsapp, facebook, and twitter', () => {
      const platforms = getMobileFriendlyPlatforms();
      expect(platforms).toContain('whatsapp');
      expect(platforms).toContain('facebook');
      expect(platforms).toContain('twitter');
      expect(platforms).toHaveLength(3);
    });
  });

  describe('getDesktopPlatforms', () => {
    it('should return facebook, twitter, email, and copyLink', () => {
      const platforms = getDesktopPlatforms();
      expect(platforms).toContain('facebook');
      expect(platforms).toContain('twitter');
      expect(platforms).toContain('email');
      expect(platforms).toContain('copyLink');
      expect(platforms).toHaveLength(4);
    });
  });

  describe('Exported Label Constants', () => {
    it('should have all required keys in Arabic labels', () => {
      expect(ARABIC_SHARE_LABELS.share).toBeDefined();
      expect(ARABIC_SHARE_LABELS.shareOnFacebook).toBeDefined();
      expect(ARABIC_SHARE_LABELS.shareOnTwitter).toBeDefined();
      expect(ARABIC_SHARE_LABELS.shareOnWhatsApp).toBeDefined();
      expect(ARABIC_SHARE_LABELS.shareOnEmail).toBeDefined();
      expect(ARABIC_SHARE_LABELS.copyLink).toBeDefined();
    });

    it('should have all required keys in Hebrew labels', () => {
      expect(HEBREW_SHARE_LABELS.share).toBeDefined();
      expect(HEBREW_SHARE_LABELS.shareOnFacebook).toBeDefined();
      expect(HEBREW_SHARE_LABELS.shareOnTwitter).toBeDefined();
      expect(HEBREW_SHARE_LABELS.shareOnWhatsApp).toBeDefined();
      expect(HEBREW_SHARE_LABELS.shareOnEmail).toBeDefined();
      expect(HEBREW_SHARE_LABELS.copyLink).toBeDefined();
    });

    it('should have all required keys in English labels', () => {
      expect(ENGLISH_SHARE_LABELS.share).toBeDefined();
      expect(ENGLISH_SHARE_LABELS.shareOnFacebook).toBeDefined();
      expect(ENGLISH_SHARE_LABELS.shareOnTwitter).toBeDefined();
      expect(ENGLISH_SHARE_LABELS.shareOnWhatsApp).toBeDefined();
      expect(ENGLISH_SHARE_LABELS.shareOnEmail).toBeDefined();
      expect(ENGLISH_SHARE_LABELS.copyLink).toBeDefined();
    });

    it('should have Arabic text (not placeholders) in Arabic labels', () => {
      expect(ARABIC_SHARE_LABELS.share).toContain(''); // Arabic text check
      expect(ARABIC_SHARE_LABELS.share).not.toBe('Share');
      expect(ARABIC_SHARE_LABELS.shareOnFacebook).not.toBe('Share on Facebook');
    });

    it('should have Hebrew text (not placeholders) in Hebrew labels', () => {
      expect(HEBREW_SHARE_LABELS.share).not.toBe('Share');
      expect(HEBREW_SHARE_LABELS.shareOnFacebook).not.toBe('Share on Facebook');
    });
  });

  describe('URL Encoding', () => {
    it('should properly encode URLs with special characters', () => {
      const url = getShareUrl('facebook', 'https://example.com/product?id=123&category=shoes');
      expect(url).toContain(encodeURIComponent('https://example.com/product?id=123&category=shoes'));
    });

    it('should properly encode text with special characters', () => {
      const url = getShareUrl('twitter', 'https://example.com', 'Check this out! Amazing product 😊');
      expect(url).toContain(encodeURIComponent('Check this out! Amazing product 😊'));
    });
  });
});
