import { describe, it, expect } from 'vitest';
import {
  validateMetaTags,
  calculateSEOScore,
  DEFAULT_SEO_LIMITS,
} from '../../app/services/meta-tags/validator';
import {
  assembleTranslatedMeta,
  generateHreflangTags,
  generateOGTags,
  generateTwitterTags,
} from '../../app/services/meta-tags/translator';
import type { MetaTagSet, MetaTranslationInput } from '../../app/services/meta-tags/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeMeta(overrides: Partial<MetaTagSet> = {}): MetaTagSet {
  return {
    title: 'A Good SEO Title That Is Long Enough',
    description:
      'This is a well-crafted meta description that is long enough to satisfy minimum SEO length requirements for search engines.',
    ...overrides,
  };
}

function makeInput(
  targetLocale: string,
  meta: MetaTagSet = makeMeta(),
): MetaTranslationInput {
  return {
    sourceLocale: 'en',
    targetLocale,
    resourceType: 'product',
    resourceId: 'gid://shopify/Product/1',
    meta,
  };
}

// ---------------------------------------------------------------------------
// Validator
// ---------------------------------------------------------------------------

describe('Meta Tags - Validator', () => {
  describe('validateMetaTags', () => {
    it('warns on missing title', () => {
      const warnings = validateMetaTags(makeMeta({ title: '' }));
      const titleWarning = warnings.find((w) => w.field === 'title' && w.type === 'missing');
      expect(titleWarning).toBeDefined();
    });

    it('warns on too-long title (>60)', () => {
      const longTitle = 'A'.repeat(61);
      const warnings = validateMetaTags(makeMeta({ title: longTitle }));
      const titleWarning = warnings.find((w) => w.field === 'title' && w.type === 'too_long');
      expect(titleWarning).toBeDefined();
      expect(titleWarning!.limit).toBe(60);
      expect(titleWarning!.actual).toBe(61);
    });

    it('warns on too-short description', () => {
      const warnings = validateMetaTags(makeMeta({ description: 'Short.' }));
      const descWarning = warnings.find(
        (w) => w.field === 'description' && w.type === 'too_short',
      );
      expect(descWarning).toBeDefined();
    });

    it('produces no warnings for valid meta', () => {
      const meta = makeMeta({
        title: 'A Good Title That Is Just Right OK',
        description:
          'This description is carefully crafted to be within the acceptable range of characters for SEO best practices and search engine display.',
      });
      const warnings = validateMetaTags(meta);
      expect(warnings).toHaveLength(0);
    });

    it('warns on missing description', () => {
      const warnings = validateMetaTags(makeMeta({ description: '' }));
      const descWarning = warnings.find(
        (w) => w.field === 'description' && w.type === 'missing',
      );
      expect(descWarning).toBeDefined();
    });

    it('warns on too-long OG title', () => {
      const warnings = validateMetaTags(makeMeta({ ogTitle: 'A'.repeat(91) }));
      const ogWarning = warnings.find((w) => w.field === 'ogTitle' && w.type === 'too_long');
      expect(ogWarning).toBeDefined();
    });
  });

  describe('calculateSEOScore', () => {
    it('returns 0 for empty meta', () => {
      const score = calculateSEOScore({ title: '', description: '' });
      expect(score.totalScore).toBe(0);
    });

    it('returns high score for complete meta', () => {
      const meta = makeMeta({
        title: 'A Good Title That Is Just Right OK',
        description:
          'This description is carefully crafted to be within the acceptable range of characters for SEO best practices and search engine display.',
        ogTitle: 'OG Title',
        ogDescription: 'OG Description',
        ogImage: 'https://example.com/image.jpg',
        ogType: 'product',
        twitterTitle: 'Twitter Title',
        twitterDescription: 'Twitter Desc',
        twitterImage: 'https://example.com/tw.jpg',
        twitterCard: 'summary_large_image',
        canonicalUrl: 'https://example.com/product',
        alternateUrls: [{ locale: 'ar', url: 'https://example.com/ar/product' }],
      });

      const score = calculateSEOScore(meta);
      expect(score.totalScore).toBeGreaterThanOrEqual(80);
    });

    it('title contributes to score', () => {
      const withTitle = calculateSEOScore(
        makeMeta({ title: 'A Good Title That Is Just Right OK' }),
      );
      const withoutTitle = calculateSEOScore(makeMeta({ title: '' }));
      expect(withTitle.titleScore).toBeGreaterThan(withoutTitle.titleScore);
    });

    it('OG tags contribute to score', () => {
      const withOG = calculateSEOScore(
        makeMeta({
          ogTitle: 'OG Title',
          ogDescription: 'OG Desc',
          ogImage: 'https://example.com/img.jpg',
          ogType: 'product',
        }),
      );
      const withoutOG = calculateSEOScore(makeMeta());
      expect(withOG.ogTagsScore).toBeGreaterThan(withoutOG.ogTagsScore);
    });

    it('twitter cards contribute to score', () => {
      const withTwitter = calculateSEOScore(
        makeMeta({
          twitterCard: 'summary',
          twitterTitle: 'T',
          twitterDescription: 'D',
          twitterImage: 'https://example.com/tw.jpg',
        }),
      );
      expect(withTwitter.twitterCardsScore).toBe(10);
    });

    it('alternate URLs contribute to score', () => {
      const withAlternates = calculateSEOScore(
        makeMeta({
          canonicalUrl: 'https://example.com',
          alternateUrls: [{ locale: 'ar', url: 'https://example.com/ar' }],
        }),
      );
      expect(withAlternates.alternateUrlsScore).toBe(10);
    });
  });
});

// ---------------------------------------------------------------------------
// Translator
// ---------------------------------------------------------------------------

describe('Meta Tags - Translator', () => {
  describe('assembleTranslatedMeta', () => {
    it('preserves images (not translated)', () => {
      const input = makeInput('ar', makeMeta({
        ogImage: 'https://cdn.example.com/image.jpg',
        twitterImage: 'https://cdn.example.com/tw.jpg',
      }));

      const result = assembleTranslatedMeta(input, {
        title: 'عنوان مترجم',
        description: 'وصف مترجم طويل بما فيه الكفاية لتلبية الحد الأدنى لمتطلبات تحسين محركات البحث',
      });

      expect(result.translated.ogImage).toBe('https://cdn.example.com/image.jpg');
      expect(result.translated.twitterImage).toBe('https://cdn.example.com/tw.jpg');
    });

    it('applies translated fields', () => {
      const input = makeInput('ar');
      const result = assembleTranslatedMeta(input, {
        title: 'عنوان',
        description: 'وصف',
      });

      expect(result.translated.title).toBe('عنوان');
      expect(result.translated.description).toBe('وصف');
    });

    it('sets correct direction for Arabic', () => {
      const result = assembleTranslatedMeta(makeInput('ar'), {});
      expect(result.direction).toBe('rtl');
      expect(result.locale).toBe('ar');
    });

    it('sets ltr direction for English', () => {
      const result = assembleTranslatedMeta(makeInput('en'), {});
      expect(result.direction).toBe('ltr');
    });

    it('cascades translated title to ogTitle and twitterTitle when not separately provided', () => {
      const input = makeInput('ar', makeMeta());
      const result = assembleTranslatedMeta(input, {
        title: 'عنوان مترجم',
      });

      expect(result.translated.ogTitle).toBe('عنوان مترجم');
      expect(result.translated.twitterTitle).toBe('عنوان مترجم');
    });
  });

  describe('generateHreflangTags', () => {
    const alternates = [
      { locale: 'en', url: 'https://example.com/en/product' },
      { locale: 'ar', url: 'https://example.com/ar/product' },
      { locale: 'he', url: 'https://example.com/he/product' },
    ];

    it('generates correct hreflang HTML', () => {
      const tags = generateHreflangTags(alternates, 'en');
      expect(tags).toHaveLength(4); // 3 locales + x-default
      expect(tags[0]).toContain('hreflang="en"');
      expect(tags[1]).toContain('hreflang="ar"');
      expect(tags[2]).toContain('hreflang="he"');
    });

    it('includes x-default pointing to default locale', () => {
      const tags = generateHreflangTags(alternates, 'en');
      const xDefault = tags.find((t) => t.includes('x-default'));
      expect(xDefault).toBeDefined();
      expect(xDefault).toContain('https://example.com/en/product');
    });
  });

  describe('generateOGTags', () => {
    it('generates og:title and og:description tags', () => {
      const meta = makeMeta({
        ogTitle: 'My Product',
        ogDescription: 'A great product',
        ogType: 'product',
      });

      const tags = generateOGTags(meta, 'en');
      expect(tags.some((t) => t.includes('og:title') && t.includes('My Product'))).toBe(true);
      expect(tags.some((t) => t.includes('og:description') && t.includes('A great product'))).toBe(true);
      expect(tags.some((t) => t.includes('og:type') && t.includes('product'))).toBe(true);
      expect(tags.some((t) => t.includes('og:locale') && t.includes('en'))).toBe(true);
    });

    it('includes og:image when present', () => {
      const meta = makeMeta({ ogImage: 'https://example.com/img.jpg' });
      const tags = generateOGTags(meta, 'en');
      expect(tags.some((t) => t.includes('og:image'))).toBe(true);
    });
  });

  describe('generateTwitterTags', () => {
    it('generates twitter:card tags', () => {
      const meta = makeMeta({
        twitterCard: 'summary_large_image',
        twitterTitle: 'Tweet Title',
        twitterDescription: 'Tweet Desc',
        twitterImage: 'https://example.com/tw.jpg',
      });

      const tags = generateTwitterTags(meta);
      expect(tags.some((t) => t.includes('twitter:card') && t.includes('summary_large_image'))).toBe(true);
      expect(tags.some((t) => t.includes('twitter:title') && t.includes('Tweet Title'))).toBe(true);
      expect(tags.some((t) => t.includes('twitter:description'))).toBe(true);
      expect(tags.some((t) => t.includes('twitter:image'))).toBe(true);
    });

    it('generates empty array when no twitter fields present', () => {
      const tags = generateTwitterTags(makeMeta());
      expect(tags).toHaveLength(0);
    });
  });

  describe('HTML escaping', () => {
    it('escapes ampersands in generated OG tags', () => {
      const meta = makeMeta({ ogTitle: 'Tom & Jerry' });
      const tags = generateOGTags(meta, 'en');
      const titleTag = tags.find((t) => t.includes('og:title'));
      expect(titleTag).toContain('Tom &amp; Jerry');
      expect(titleTag).not.toContain('Tom & Jerry');
    });

    it('escapes double quotes in generated tags', () => {
      const meta = makeMeta({ ogTitle: 'The "Best" Product' });
      const tags = generateOGTags(meta, 'en');
      const titleTag = tags.find((t) => t.includes('og:title'));
      expect(titleTag).toContain('&quot;Best&quot;');
    });

    it('passes URLs through to hreflang tags', () => {
      const alternates = [
        { locale: 'en', url: 'https://example.com/?a=1&b=test' },
      ];
      const tags = generateHreflangTags(alternates, 'en');
      expect(tags[0]).toContain('hreflang="en"');
      expect(tags[0]).toContain('href="https://example.com/?a=1&b=test"');
    });
  });
});
