# T0391 — RTL Email Template Builder

## Status: queue
## Priority: medium
## Source: product_spec §4.3

## Description

Visual drag-and-drop RTL email editor with pre-built templates for all Shopify transactional emails.

## Requirements

### Pre-Built RTL Templates
- Order confirmation
- Shipping notification
- Delivery confirmation
- Refund/return confirmation
- Account creation / password reset
- Abandoned cart recovery
- Back-in-stock notification

### Visual Email Builder
- Drag-and-drop RTL email editor (no code required)
- Dynamic content: auto-populate with order data, customer name, product images
- Multi-language: same template serves RTL or LTR based on customer language
- Responsive: mobile-optimized for RTL
- Custom branding: merchant logo, colors, fonts
- Preview & test: send test emails, preview in Gmail/Outlook/Apple Mail

### Technical Requirements
- `dir="rtl"` and `direction: rtl` CSS with email client fallbacks
- Inline CSS for maximum compatibility
- Tables-based layout for Outlook RTL support
- MJML-based renderer for cross-client compatibility
- Tested across 30+ email clients

## Implementation Notes

- New service: `app/services/email-builder/`
- New route: `app.email-templates.tsx`
- Use MJML library for email rendering
- Existing email translation tasks (T0116-T0120) handle content; this handles layout/design
