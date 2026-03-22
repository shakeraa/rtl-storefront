# Task T0203: Integration - Mailchimp Templates

## Summary
Successfully implemented Mailchimp email template translation service with full RTL support and merge tag preservation.

## Files Created/Modified

### New Files
- `/app/services/integrations/mailchimp.ts` - Main Mailchimp integration service (602 lines)
- `/test/unit/mailchimp.test.ts` - Comprehensive test suite (51 tests)

### Modified Files
- `/app/services/integrations/constants.ts` - Added 'mailchimp' to SUPPORTED_EMAIL_APPS
- `/app/services/integrations/index.ts` - Added Mailchimp integration export and registry entry
- `/app/services/translation/types.ts` - Added Locale type and SUPPORTED_LOCALES

## Features Implemented

### Core Functions
1. **translateMailchimpTemplate(template, locale)** - Translates templates while preserving merge tags
2. **extractMergeTags(template)** - Extracts *|TAG|* merge tags with fallback support
3. **restoreMergeTags(translated, tags)** - Restores merge tags after translation
4. **getMailchimpTemplates(locale)** - Retrieves templates filtered by locale

### Campaign & Automation Support
- **translateMailchimpCampaign()** - Translates campaign content and subject lines
- **translateMailchimpAutomationEmail()** - Translates automation emails
- **translateMailchimpAutomation()** - Translates entire automation workflows

### RTL Layout Support
- Automatic RTL detection for Arabic, Hebrew, Urdu, and Persian locales
- HTML dir="rtl" and lang attributes injection
- RTL CSS styles for email templates

### Template Management
- In-memory template store (save, get, delete, list)
- Template filtering by locale and type
- Template validation (merge tag syntax, conditional blocks, accessibility)

### Merge Tag Features
- Standard merge tags: *|FNAME|*, *|LNAME|*, *|EMAIL|*
- Special merge tags: *|UNSUB|*, *|UPDATE_PROFILE|*, *|ARCHIVE|*
- Social merge tags: *|TWITTER:FULLURL|*, *|FACEBOOK:FULLURL|*
- Fallback values: *|FNAME:Guest|*
- Conditional blocks: *|IF:TAG|* ... *|END:IF|*

## Test Results

```
✓ test/unit/mailchimp.test.ts (51 tests) 9ms

Test Files  1 passed (1)
     Tests  51 passed (51)
```

### Test Coverage Areas
- Merge Tag Extraction (9 tests)
- Merge Tag Restoration (4 tests)
- Template Translation (11 tests)
- RTL Support (6 tests)
- Template Management (6 tests)
- Campaign Translation (2 tests)
- Automation Translation (2 tests)
- Template Validation (5 tests)
- Conditional Block Extraction (2 tests)
- Translatable Segment Extraction (3 tests)
- Merge Tag Descriptions (1 test)
- Batch Translation (1 test)
- Constants (2 tests)

## Merge Tags Preserved

| Tag | Purpose |
|-----|---------|
| *\|FNAME\|* | Subscriber first name |
| *\|LNAME\|* | Subscriber last name |
| *\|EMAIL\|* | Subscriber email |
| *\|UNSUB\|* | Unsubscribe link |
| *\|UPDATE_PROFILE\|* | Update profile link |
| *\|ARCHIVE\|* | View in browser |
| *\|FORWARD\|* | Forward to friend |
| *\|LIST:ADDRESS\|* | List physical address |
| *\|MC:SUBJECT\|* | Email subject |

## Branch
`feature/T0203-mailchimp`

## Status
✅ Completed
