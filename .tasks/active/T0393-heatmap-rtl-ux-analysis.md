# T0393 — Heatmap & RTL UX Analysis

status: active
## Priority: low
## Source: product_spec §5.4

## Description

Understand how RTL users interact with stores — RTL UX patterns differ fundamentally from LTR (mirrored F-pattern scanning).

## Requirements

### Tracking
- Click heatmap overlay showing where RTL users click
- Scroll depth maps per market
- AI-identified "hot zones" calibrated for RTL reading patterns (top-right = primary attention)

### RTL UX Score
- Automated scoring of key pages for RTL usability:
  - CTA in RTL primary attention zone? (top-right quadrant)
  - Navigation flow natural in RTL?
  - Form fields ordered correctly for RTL?
  - Checkout flow RTL-optimized?

### Session Recordings
- Anonymized RTL user sessions to identify UX friction
- Funnel visualization with drop-off analysis
- Device breakdown: mobile vs. desktop for RTL users (mobile = 70%+ in MENA)

### Actionable Recommendations
- AI-generated RTL UX improvement suggestions based on heatmap data

### Privacy Compliance
- No PII collected
- Session recordings anonymized (faces blurred, text masked)
- GDPR / PDPL (Saudi) / Israeli Privacy Law compliant
- Cookie consent integration

## Implementation Notes

- New service: `app/services/heatmap/`
- New route: `app.ux-analysis.tsx`
- Lightweight JS snippet injected via theme extension
- Data stored in analytics pipeline (extend existing analytics service)
- V2 feature — lower priority
