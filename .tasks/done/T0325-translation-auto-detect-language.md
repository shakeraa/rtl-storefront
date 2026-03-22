# T0325 - Translation Auto Detect Language

**Status:** In Progress  
**Priority:** High  
**Created:** 2026-03-22  
**Branch:** feature/T0325-auto-detect

## Description
Implement automatic language detection service for the RTL Storefront translation system. This service will detect the language of text content and HTML documents, providing confidence scores for each detection.

## Requirements

### Functional Requirements
1. Detect language from text content using character patterns
2. Detect language from HTML/meta tags
3. Provide confidence scoring for detections
4. Support Arabic, Hebrew, English, French, German, Spanish, and other languages
5. Use Unicode character ranges for detection:
   - Arabic: [\u0600-\u06FF]
   - Hebrew: [\u0590-\u05FF]

### API Functions
- `detectLanguage(text)` - Detect language from plain text
- `detectFromHTML(html)` - Detect language from HTML content
- `getDetectionConfidence(text, detectedLang)` - Get confidence score
- `supportsLanguageDetection()` - Check if detection is supported

### Technical Requirements
- NO STUBS - full implementation required
- Character pattern matching for detection
- Confidence scoring based on character match ratios
- HTML meta tag parsing (lang attribute, og:locale, etc.)

## Implementation

### Files to Create
1. `/app/services/translation-features/language-detection.ts` - Main service
2. `/test/unit/language-detection.test.ts` - Unit tests (25+ tests)

## Acceptance Criteria
- [ ] Language detection works for all supported languages
- [ ] Confidence scoring is accurate
- [ ] HTML detection parses meta tags correctly
- [ ] All 25+ tests pass
- [ ] Code follows project patterns
- [ ] Result file created

## Notes
- Use existing service patterns from translation-features
- Follow TypeScript best practices
- Include comprehensive JSDoc comments
