# Task T0144 - Social Link Title Translation

## Summary
Created social link label translation service with full support for Arabic, Hebrew, and English.

## Files Created
- `app/services/ui-labels/social-links.ts` - Main service with translations and helper functions
- `test/unit/social-links.test.ts` - Comprehensive test suite (30 tests)

## Functions Implemented
- `getSocialLabel(platform, locale)` - Get display label for a social platform
- `getSocialAriaLabel(platform, locale)` - Get accessibility label for a social platform
- `getAllSocialLinks(locale)` - Get all social platforms with labels
- `getSocialLinksForPlatforms(platforms, locale)` - Get subset of platforms
- `isValidSocialPlatform(platform)` - Validate platform name

## Supported Platforms
- Facebook, Instagram, Twitter, YouTube, TikTok, LinkedIn, Pinterest, Snapchat

## Supported Locales
- English (en)
- Arabic (ar) - including ar-SA, ar-EG variants
- Hebrew (he) - including he-IL variant

## Test Results

```
 RUN  v3.0.9 /Users/shaker/shopify-dev/rtl-storefront

 ✓ test/unit/social-links.test.ts > Social Links - Labels > getSocialLabel > returns English label for Facebook
 ✓ test/unit/social-links.test.ts > Social Links - Labels > getSocialLabel > returns Arabic label for Instagram
 ✓ test/unit/social-links.test.ts > Social Links - Labels > getSocialLabel > returns Hebrew label for Twitter
 ✓ test/unit/social-links.test.ts > Social Links - Labels > getSocialLabel > returns correct Arabic labels for all platforms
 ✓ test/unit/social-links.test.ts > Social Links - Labels > getSocialLabel > returns correct Hebrew labels for all platforms
 ✓ test/unit/social-links.test.ts > Social Links - Labels > getSocialLabel > handles locale with region subtag (ar-SA)
 ✓ test/unit/social-links.test.ts > Social Links - Labels > getSocialLabel > handles locale with region subtag (he-IL)
 ✓ test/unit/social-links.test.ts > Social Links - Labels > getSocialLabel > falls back to English for unknown locale
 ✓ test/unit/social-links.test.ts > Social Links - Labels > getSocialAriaLabel > returns English aria-label for Facebook
 ✓ test/unit/social-links.test.ts > Social Links - Labels > getSocialAriaLabel > returns Arabic aria-label for YouTube
 ✓ test/unit/social-links.test.ts > Social Links - Labels > getSocialAriaLabel > returns Hebrew aria-label for Instagram
 ✓ test/unit/social-links.test.ts > Social Links - Labels > getSocialAriaLabel > returns correct Arabic aria-labels for all platforms
 ✓ test/unit/social-links.test.ts > Social Links - Labels > getSocialAriaLabel > returns correct Hebrew aria-labels for all platforms
 ✓ test/unit/social-links.test.ts > Social Links - Labels > getSocialAriaLabel > handles locale with region subtag for aria-labels
 ✓ test/unit/social-links.test.ts > Social Links - Labels > getSocialAriaLabel > falls back to English aria-label for unknown locale
 ✓ test/unit/social-links.test.ts > Social Links - Labels > getAllSocialLinks > returns all 8 platforms for English
 ✓ test/unit/social-links.test.ts > Social Links - Labels > getAllSocialLinks > returns all 8 platforms for Arabic
 ✓ test/unit/social-links.test.ts > Social Links - Labels > getAllSocialLinks > returns all 8 platforms for Hebrew
 ✓ test/unit/social-links.test.ts > Social Links - Labels > getAllSocialLinks > each link has required properties
 ✓ test/unit/social-links.test.ts > Social Links - Labels > getAllSocialLinks > returns Arabic labels in getAllSocialLinks
 ✓ test/unit/social-links.test.ts > Social Links - Labels > getAllSocialLinks > returns Hebrew labels in getAllSocialLinks
 ✓ test/unit/social-links.test.ts > Social Links - Labels > getAllSocialLinks > falls back to English for unknown locale
 ✓ test/unit/social-links.test.ts > Social Links - Labels > getSocialLinksForPlatforms > returns only specified platforms
 ✓ test/unit/social-links.test.ts > Social Links - Labels > getSocialLinksForPlatforms > returns Arabic labels for subset of platforms
 ✓ test/unit/social-links.test.ts > Social Links - Labels > getSocialLinksForPlatforms > returns Hebrew labels for subset of platforms
 ✓ test/unit/social-links.test.ts > Social Links - Labels > getSocialLinksForPlatforms > returns empty array for empty platforms array
 ✓ test/unit/social-links.test.ts > Social Links - Labels > getSocialLinksForPlatforms > handles single platform selection
 ✓ test/unit/social-links.test.ts > Social Links - Labels > isValidSocialPlatform > returns true for valid platforms
 ✓ test/unit/social-links.test.ts > Social Links - Labels > isValidSocialPlatform > returns false for invalid platforms
 ✓ test/unit/social-links.test.ts > Social Links - Labels > isValidSocialPlatform > returns false for platform with different case

 Test Files  1 passed (1)
      Tests  30 passed (30)
   Start at  17:19:38
   Duration  1.76s
```

## Acceptance Criteria
- [x] Feature implemented
- [x] Tests passing (30 tests, 100% pass rate)
- [x] Documentation updated (result file created)

## Notes
- All translations use real Arabic and Hebrew text (no stubs)
- Full ARIA label support for accessibility
- Consistent with existing project patterns (similar to cart-checkout and customer-account labels)
- Tests use relative imports as required
