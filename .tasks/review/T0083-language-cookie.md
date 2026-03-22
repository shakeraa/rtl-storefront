---
id: "T0083"
title: "Automation - Language Preference Cookie"
priority: medium
assigned: kimi
branch: feature/T0083-language-cookie
status: review
created: 2026-03-22
depends_on: []
locks: []
test_command: ""
---

## Description
Store user language preference in cookie for persistent experience.

## Acceptance criteria
- [x] Language cookie set
- [x] Cookie expiration (1 year)
- [x] Cookie read on visit
- [x] Secure/HttpOnly flags
- [x] GDPR compliance

## Implementation
- Branch: `feature/T0083-language-cookie`
- Status: **COMPLETED**
- Tests: 79 passing
- Test Results: `test/unit/result-T0083.md`

### Functions Added
- `setLanguageCookie(locale, options)` - Set cookie in browser
- `getLanguageCookie(config?)` - Get cookie value from browser
- `clearLanguageCookie(config?)` - Clear/remove cookie
- `parseLanguagePreference(value)` - Parse and validate locale
- `hasCookieConsent()` - Check for GDPR consent
- `setLanguageCookieGDPR(locale, options)` - GDPR-compliant cookie setting
- `getCookieExpirationDate(days)` - Calculate expiration date
