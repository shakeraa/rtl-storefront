# T0387 — Brand Voice Preservation

status: done
## Priority: high
## Source: product_spec §2.4

## Description

Ensure the merchant's brand sounds like THEIR brand in every language — not a generic translation. Create a "Brand Voice DNA" profile system.

## Requirements

### Brand Voice Profile Setup
- Merchant uploads sample content (product descriptions, about page, marketing emails)
- AI analyzes tone, vocabulary level, sentence structure, personality traits
- Creates a Brand Voice DNA profile with attributes:
  - Formality level (1-10)
  - Technical depth (1-10)
  - Humor/playfulness (1-10)
  - Luxury positioning (1-10)
  - Target audience age range
  - Brand personality keywords (e.g., "bold, sustainable, artisanal")

### Voice Preservation Engine
- All AI translations and generations filtered through Brand Voice DNA
- Consistency checker compares new translations against approved content
- Brand tone maintained across: product descriptions, emails, notifications, checkout
- Per-language voice calibration (brand may be more formal in Arabic than English)

### Merchant Controls
- Edit brand voice profile anytime
- A/B test voice variants (formal vs. casual Arabic)
- Lock specific phrases/terms (brand name transliterations, slogans)
- Voice consistency score on dashboard

## Implementation Notes

- New service: `app/services/brand-voice/`
- New route: `app.brand-voice.tsx`
- Database: new BrandVoiceProfile model in Prisma schema
- Integrates with translation engine and T0386 description generator
