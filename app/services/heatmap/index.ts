/**
 * Heatmap / UX Analysis Service (lightweight)
 * T0393: RTL UX scoring, attention zones, and recommendations
 */

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface RTLUXScore {
  overall: number;
  ctaPlacement: number;
  navigationFlow: number;
  formFields: number;
  checkoutFlow: number;
}

export interface HeatmapZone {
  x: number;
  y: number;
  width: number;
  height: number;
  clicks: number;
  label: string;
}

export interface ClickEvent {
  x: number;
  y: number;
  timestamp?: Date;
}

export interface PageMetrics {
  /** CTA button X position as fraction of page width (0 = left, 1 = right) */
  ctaPositionX: number;
  /** Whether primary nav is right-aligned */
  navRightAligned: boolean;
  /** Whether form labels are right-aligned */
  formLabelsRightAligned: boolean;
  /** Whether form inputs use RTL direction */
  formInputsRtl: boolean;
  /** Whether checkout flow progresses right-to-left */
  checkoutRtlFlow: boolean;
  /** Whether checkout has Arabic/Hebrew payment labels */
  checkoutLocalizedPayments: boolean;
  /** Bounce rate (0-1) */
  bounceRate: number;
  /** Average time on page in seconds */
  avgTimeOnPage: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * RTL attention zones (where users look first in RTL layouts).
 * Coordinates are fractions of viewport width/height.
 */
export const RTL_ATTENTION_ZONES = {
  primary: { label: "top-right", x: 0.6, y: 0, width: 0.4, height: 0.33 },
  secondary: { label: "center-right", x: 0.6, y: 0.33, width: 0.4, height: 0.34 },
  tertiary: { label: "bottom-right", x: 0.6, y: 0.67, width: 0.4, height: 0.33 },
} as const;

const LTR_ATTENTION_ZONES = {
  primary: { label: "top-left", x: 0, y: 0, width: 0.4, height: 0.33 },
  secondary: { label: "center-left", x: 0, y: 0.33, width: 0.4, height: 0.34 },
  tertiary: { label: "bottom-left", x: 0, y: 0.67, width: 0.4, height: 0.33 },
} as const;

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate an RTL UX score (0-100 per dimension) based on page metrics.
 */
export function calculateRTLUXScore(pageMetrics: PageMetrics): RTLUXScore {
  // CTA placement: higher score if CTA is on the right side (RTL primary zone)
  const ctaPlacement = clamp(Math.round(pageMetrics.ctaPositionX * 100), 0, 100);

  // Navigation flow: right-aligned nav is ideal for RTL
  const navigationFlow = pageMetrics.navRightAligned ? 90 : 30;

  // Form fields: both labels and inputs should be RTL
  let formFields = 0;
  if (pageMetrics.formLabelsRightAligned) formFields += 50;
  if (pageMetrics.formInputsRtl) formFields += 50;

  // Checkout flow
  let checkoutFlow = 0;
  if (pageMetrics.checkoutRtlFlow) checkoutFlow += 60;
  if (pageMetrics.checkoutLocalizedPayments) checkoutFlow += 40;

  // Overall is weighted average
  const overall = clamp(
    Math.round(
      ctaPlacement * 0.25 +
        navigationFlow * 0.25 +
        formFields * 0.25 +
        checkoutFlow * 0.25,
    ),
    0,
    100,
  );

  return { overall, ctaPlacement, navigationFlow, formFields, checkoutFlow };
}

// ---------------------------------------------------------------------------
// Hot zones
// ---------------------------------------------------------------------------

/**
 * Partition click events into heatmap zones and return the top zones by click count.
 * For RTL layouts, the primary zone is top-right; for LTR it is top-left.
 *
 * @param clicks - Array of click events with x/y as fractions (0-1) of viewport
 * @param isRtl - Whether the page uses RTL layout
 * @returns Sorted HeatmapZone array (highest clicks first)
 */
export function getHotZones(clicks: ClickEvent[], isRtl: boolean): HeatmapZone[] {
  const zones = isRtl ? RTL_ATTENTION_ZONES : LTR_ATTENTION_ZONES;

  const zoneEntries = Object.values(zones);
  const results: HeatmapZone[] = zoneEntries.map((zone) => ({
    x: zone.x,
    y: zone.y,
    width: zone.width,
    height: zone.height,
    clicks: 0,
    label: zone.label,
  }));

  for (const click of clicks) {
    for (const zone of results) {
      if (
        click.x >= zone.x &&
        click.x <= zone.x + zone.width &&
        click.y >= zone.y &&
        click.y <= zone.y + zone.height
      ) {
        zone.clicks++;
        break; // A click belongs to at most one zone
      }
    }
  }

  return results.sort((a, b) => b.clicks - a.clicks);
}

// ---------------------------------------------------------------------------
// Recommendations
// ---------------------------------------------------------------------------

/**
 * Generate UX improvement recommendations based on RTL UX scores.
 */
export function getUXRecommendations(score: RTLUXScore): string[] {
  const recommendations: string[] = [];

  if (score.ctaPlacement < 60) {
    recommendations.push(
      "Move primary CTA buttons to the right side of the page for RTL users (top-right attention zone).",
    );
  }

  if (score.navigationFlow < 60) {
    recommendations.push(
      "Align main navigation to the right. RTL users scan from right to left.",
    );
  }

  if (score.formFields < 60) {
    recommendations.push(
      "Ensure form labels are right-aligned and input fields use dir=\"rtl\" for Arabic/Hebrew content.",
    );
  }

  if (score.checkoutFlow < 60) {
    recommendations.push(
      "Adapt checkout flow for RTL: progress indicators should flow right-to-left, and payment methods should show localized names.",
    );
  }

  if (score.overall >= 80) {
    recommendations.push("RTL UX is well-optimized. Consider A/B testing minor layout tweaks for further gains.");
  }

  if (recommendations.length === 0) {
    recommendations.push("RTL layout meets baseline standards. Focus on content quality and cultural adaptation.");
  }

  return recommendations;
}

/**
 * Check if a page is considered RTL-optimized (overall score >= 70).
 */
export function isRTLOptimized(score: RTLUXScore): boolean {
  return score.overall >= 70;
}
