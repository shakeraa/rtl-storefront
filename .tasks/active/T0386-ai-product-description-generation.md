# T0386 — AI Product Description Generation

status: active
## Priority: high
## Source: product_spec §2.3

## Description

Generate compelling, localized product descriptions natively in Arabic and Hebrew — not translated from English.

## Requirements

- AI-generated product descriptions from product attributes (title, images, specs, category)
- Native generation in Arabic or Hebrew (not translate-from-English)
- Adapt writing style per vertical: fashion, electronics, beauty, food, home goods
- Bulk generation (entire catalog in one click)
- SEO-optimized output (target keywords in local language)

## Inputs

- Product title, images, attributes, category
- Target language + dialect
- Brand voice profile (see T0387)
- Tone preference: Professional / Casual / Luxury / Playful

## Outputs

- Short description (50-80 words)
- Long description (150-300 words)
- Meta title + meta description (SEO)
- Social media caption (Instagram/TikTok ready)

## Quality Controls

- Human review queue before publishing
- Confidence score per generation (low confidence = flagged for review)
- Edit history tracked
- Regenerate with different parameters

## Implementation Notes

- New service: `app/services/description-generator/`
- New route: `app.generate-descriptions.tsx`
- Integrate with existing translation engine and cultural-ai services
- Use Claude API for generation
