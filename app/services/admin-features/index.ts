// ---------------------------------------------------------------------------
// Admin Features Bundle
// T0041 (Auto-redirect banner), T0044 (Team invitations),
// T0047+T0048 (Sales & conversion analytics), T0076 (SEO audit),
// T0084 (Floating language switcher), T0090 (AI usage metrics)
// ---------------------------------------------------------------------------

// ===========================================================================
// T0041 - Auto-redirect Banner
// ===========================================================================

export interface RedirectBannerConfig {
  enabled: boolean;
  detectedLocale: string;
  currentLocale: string;
  message: string;
  messageAr: string;
  acceptLabel: string;
  acceptLabelAr: string;
  dismissLabel: string;
  dismissLabelAr: string;
  position: "top" | "bottom";
  autoRedirectAfterMs?: number;
}

/**
 * Get a default banner configuration for a detected vs current locale pair.
 */
export function getDefaultBannerConfig(
  detectedLocale: string,
  currentLocale: string,
): RedirectBannerConfig {
  return {
    enabled: true,
    detectedLocale,
    currentLocale,
    message: `We detected your language is ${detectedLocale}. Would you like to switch?`,
    messageAr: `اكتشفنا أن لغتك هي ${detectedLocale}. هل ترغب في التبديل؟`,
    acceptLabel: "Switch language",
    acceptLabelAr: "تبديل اللغة",
    dismissLabel: "Stay on current",
    dismissLabelAr: "البقاء على الحالي",
    position: "top",
    autoRedirectAfterMs: undefined,
  };
}

/**
 * Generate the HTML for a redirect banner.
 */
export function generateBannerHTML(
  config: RedirectBannerConfig,
  locale: string,
): string {
  const isAr = locale.startsWith("ar");
  const dir = isAr ? "rtl" : "ltr";
  const message = isAr ? config.messageAr : config.message;
  const acceptLabel = isAr ? config.acceptLabelAr : config.acceptLabel;
  const dismissLabel = isAr ? config.dismissLabelAr : config.dismissLabel;

  const positionStyle =
    config.position === "top"
      ? "top:0;left:0;right:0;"
      : "bottom:0;left:0;right:0;";

  return `<div class="rtl-redirect-banner" dir="${dir}" style="position:fixed;${positionStyle}z-index:9999;padding:12px 16px;background:#1a1a2e;color:#fff;display:flex;align-items:center;justify-content:space-between;font-family:system-ui,sans-serif;font-size:14px;">
  <span>${message}</span>
  <div style="display:flex;gap:8px;">
    <button class="rtl-banner-accept" style="padding:6px 16px;border:none;border-radius:4px;background:#6c63ff;color:#fff;cursor:pointer;font-size:13px;">${acceptLabel}</button>
    <button class="rtl-banner-dismiss" style="padding:6px 16px;border:1px solid #fff;border-radius:4px;background:transparent;color:#fff;cursor:pointer;font-size:13px;">${dismissLabel}</button>
  </div>
</div>`;
}

/**
 * Determine whether the redirect banner should be shown.
 */
export function shouldShowBanner(
  detectedLocale: string,
  currentLocale: string,
  dismissed: boolean,
): boolean {
  if (dismissed) return false;
  if (!detectedLocale || !currentLocale) return false;
  return detectedLocale !== currentLocale;
}

// ===========================================================================
// T0044 - Team Invitations
// ===========================================================================

export type TeamRole = "admin" | "editor" | "translator" | "viewer";
export type InviteStatus = "pending" | "accepted" | "expired";

export interface TeamInvite {
  id: string;
  email: string;
  role: TeamRole;
  status: InviteStatus;
  invitedBy: string;
  createdAt: Date;
  expiresAt: Date;
}

// In-memory storage
const invites = new Map<string, TeamInvite>();
// Shop -> invite IDs mapping
const shopInvites = new Map<string, string[]>();
let inviteCounter = 0;

/**
 * Create a new team invite.
 */
export function createInvite(
  email: string,
  role: TeamRole,
  invitedBy: string,
  shop?: string,
): TeamInvite {
  inviteCounter++;
  const id = `invite-${Date.now()}-${inviteCounter}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invite: TeamInvite = {
    id,
    email,
    role,
    status: "pending",
    invitedBy,
    createdAt: now,
    expiresAt,
  };

  invites.set(id, invite);

  if (shop) {
    const ids = shopInvites.get(shop) || [];
    ids.push(id);
    shopInvites.set(shop, ids);
  }

  return invite;
}

/**
 * Accept a pending invite.
 */
export function acceptInvite(id: string): { success: boolean } {
  const invite = invites.get(id);
  if (!invite) return { success: false };
  if (invite.status !== "pending") return { success: false };
  if (new Date() > invite.expiresAt) {
    invite.status = "expired";
    return { success: false };
  }

  invite.status = "accepted";
  return { success: true };
}

/**
 * Get all invites for a shop.
 */
export function getInvites(shop: string): TeamInvite[] {
  const ids = shopInvites.get(shop) || [];
  return ids
    .map((id) => invites.get(id))
    .filter((invite): invite is TeamInvite => invite !== undefined);
}

/**
 * Revoke a pending invite.
 */
export function revokeInvite(id: string): boolean {
  const invite = invites.get(id);
  if (!invite || invite.status !== "pending") return false;
  invites.delete(id);

  // Remove from shop mapping
  shopInvites.forEach((ids, shopKey) => {
    const idx = ids.indexOf(id);
    if (idx !== -1) {
      ids.splice(idx, 1);
      shopInvites.set(shopKey, ids);
    }
  });

  return true;
}

// ===========================================================================
// T0047 + T0048 - Sales & Conversion Analytics
// ===========================================================================

export interface SalesByLanguage {
  locale: string;
  orders: number;
  revenue: number;
  avgOrderValue: number;
  currency: string;
}

export interface ConversionByLanguage {
  locale: string;
  visitors: number;
  addToCart: number;
  checkout: number;
  purchase: number;
  conversionRate: number;
}

/**
 * Get sales data broken down by language. Returns mock data.
 */
export function getSalesByLanguage(_shop: string): SalesByLanguage[] {
  return [
    { locale: "en", orders: 1250, revenue: 89500, avgOrderValue: 71.6, currency: "USD" },
    { locale: "ar", orders: 430, revenue: 38700, avgOrderValue: 90.0, currency: "USD" },
    { locale: "fr", orders: 215, revenue: 17200, avgOrderValue: 80.0, currency: "USD" },
    { locale: "de", orders: 180, revenue: 14400, avgOrderValue: 80.0, currency: "USD" },
    { locale: "ja", orders: 95, revenue: 9500, avgOrderValue: 100.0, currency: "USD" },
  ];
}

/**
 * Get conversion funnel data broken down by language. Returns mock data.
 */
export function getConversionByLanguage(_shop: string): ConversionByLanguage[] {
  return [
    { locale: "en", visitors: 50000, addToCart: 7500, checkout: 3000, purchase: 1250, conversionRate: 2.5 },
    { locale: "ar", visitors: 12000, addToCart: 2160, checkout: 860, purchase: 430, conversionRate: 3.58 },
    { locale: "fr", visitors: 8000, addToCart: 1200, checkout: 480, purchase: 215, conversionRate: 2.69 },
    { locale: "de", visitors: 6500, addToCart: 910, checkout: 364, purchase: 180, conversionRate: 2.77 },
    { locale: "ja", visitors: 3000, addToCart: 390, checkout: 190, purchase: 95, conversionRate: 3.17 },
  ];
}

// ===========================================================================
// T0076 - SEO Audit
// ===========================================================================

export interface SEOIssue {
  type: string;
  severity: "error" | "warning" | "info";
  message: string;
  fix?: string;
}

export interface SEOAuditResult {
  url: string;
  locale: string;
  score: number;
  issues: SEOIssue[];
}

/**
 * Run an SEO audit for a URL and locale.
 * Checks hreflang, canonical, meta tags, alt text, structured data, page speed.
 */
export function runSEOAudit(url: string, locale: string): SEOAuditResult {
  const issues: SEOIssue[] = [];
  let score = 100;

  // Check: hreflang tags
  issues.push({
    type: "hreflang",
    severity: "warning",
    message: `Verify hreflang tags include "${locale}" and point to the correct URL`,
    fix: `Add <link rel="alternate" hreflang="${locale}" href="${url}" /> to the page head`,
  });
  score -= 5;

  // Check: canonical URL
  issues.push({
    type: "canonical",
    severity: "info",
    message: "Verify canonical URL is set and matches the localized page URL",
    fix: `Ensure <link rel="canonical" href="${url}" /> is present`,
  });
  score -= 3;

  // Check: meta title length
  issues.push({
    type: "meta_title",
    severity: "warning",
    message: "Meta title should be between 30-60 characters for the target locale",
    fix: "Review and adjust the translated meta title length",
  });
  score -= 5;

  // Check: meta description length
  issues.push({
    type: "meta_description",
    severity: "warning",
    message: "Meta description should be between 120-160 characters for the target locale",
    fix: "Review and adjust the translated meta description length",
  });
  score -= 5;

  // Check: image alt text
  issues.push({
    type: "alt_text",
    severity: "warning",
    message: "Verify all images have translated alt text for the target locale",
    fix: "Add localized alt attributes to all <img> elements",
  });
  score -= 5;

  // Check: structured data
  issues.push({
    type: "structured_data",
    severity: "info",
    message: "Verify JSON-LD structured data includes localized values",
    fix: "Update schema.org markup with translated name, description, etc.",
  });
  score -= 2;

  // Check: page speed indicators (RTL CSS may add weight)
  if (locale.startsWith("ar") || locale.startsWith("he") || locale.startsWith("fa")) {
    issues.push({
      type: "page_speed",
      severity: "info",
      message: "RTL stylesheet may increase page weight; verify performance is acceptable",
      fix: "Ensure RTL CSS is loaded conditionally and minified",
    });
    score -= 2;
  }

  return {
    url,
    locale,
    score: Math.max(score, 0),
    issues,
  };
}

// ===========================================================================
// T0084 - Floating Language Switcher
// ===========================================================================

export type SwitcherPosition = "bottom-left" | "bottom-right" | "top-left" | "top-right";
export type SwitcherShape = "circle" | "pill";
export type SwitcherAnimation = "slide" | "fade" | "none";

export interface FloatingSwitcherConfig {
  position: SwitcherPosition;
  shape: SwitcherShape;
  showFlag: boolean;
  showLabel: boolean;
  animation: SwitcherAnimation;
}

/**
 * Get the default floating switcher configuration.
 */
export function getDefaultFloatingConfig(): FloatingSwitcherConfig {
  return {
    position: "bottom-right",
    shape: "pill",
    showFlag: true,
    showLabel: true,
    animation: "slide",
  };
}

/**
 * Generate CSS for the floating language switcher.
 */
export function generateFloatingSwitcherCSS(
  config: FloatingSwitcherConfig,
  locale: string,
): string {
  const isRtl = locale.startsWith("ar") || locale.startsWith("he") || locale.startsWith("fa");

  // Position mapping
  const positionMap: Record<SwitcherPosition, string> = {
    "bottom-left": "bottom:20px;left:20px;",
    "bottom-right": "bottom:20px;right:20px;",
    "top-left": "top:20px;left:20px;",
    "top-right": "top:20px;right:20px;",
  };

  // Mirror position for RTL
  let effectivePosition = config.position;
  if (isRtl) {
    if (effectivePosition === "bottom-left") effectivePosition = "bottom-right";
    else if (effectivePosition === "bottom-right") effectivePosition = "bottom-left";
    else if (effectivePosition === "top-left") effectivePosition = "top-right";
    else if (effectivePosition === "top-right") effectivePosition = "top-left";
  }

  const shapeStyles =
    config.shape === "circle"
      ? "width:48px;height:48px;border-radius:50%;"
      : "padding:8px 16px;border-radius:24px;";

  let animationStyles = "";
  if (config.animation === "slide") {
    animationStyles = `
.rtl-floating-switcher{transition:transform 0.3s ease,opacity 0.3s ease;}
.rtl-floating-switcher:hover{transform:scale(1.05);}`;
  } else if (config.animation === "fade") {
    animationStyles = `
.rtl-floating-switcher{transition:opacity 0.3s ease;}
.rtl-floating-switcher:hover{opacity:0.85;}`;
  }

  return `.rtl-floating-switcher{position:fixed;${positionMap[effectivePosition]}${shapeStyles}z-index:9998;background:#6c63ff;color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-family:system-ui,sans-serif;font-size:14px;box-shadow:0 2px 12px rgba(0,0,0,0.15);}
.rtl-floating-switcher .flag{${config.showFlag ? "display:inline;" : "display:none;"}}
.rtl-floating-switcher .label{${config.showLabel ? "display:inline;" : "display:none;"}}${animationStyles}`;
}

// ===========================================================================
// T0090 - AI Usage Metrics
// ===========================================================================

export interface AIUsageMetrics {
  provider: string;
  requestsToday: number;
  requestsThisMonth: number;
  charactersToday: number;
  charactersThisMonth: number;
  costToday: number;
  costThisMonth: number;
  avgLatencyMs: number;
  errorRate: number;
}

/**
 * Get AI usage metrics per provider. Returns mock data.
 */
export function getAIUsageMetrics(_shop: string): AIUsageMetrics[] {
  return [
    {
      provider: "openai",
      requestsToday: 145,
      requestsThisMonth: 3200,
      charactersToday: 58000,
      charactersThisMonth: 1280000,
      costToday: 1.16,
      costThisMonth: 25.6,
      avgLatencyMs: 820,
      errorRate: 0.012,
    },
    {
      provider: "google",
      requestsToday: 89,
      requestsThisMonth: 1800,
      charactersToday: 35600,
      charactersThisMonth: 720000,
      costToday: 0.53,
      costThisMonth: 10.8,
      avgLatencyMs: 650,
      errorRate: 0.008,
    },
    {
      provider: "deepl",
      requestsToday: 210,
      requestsThisMonth: 4500,
      charactersToday: 84000,
      charactersThisMonth: 1800000,
      costToday: 1.68,
      costThisMonth: 36.0,
      avgLatencyMs: 420,
      errorRate: 0.005,
    },
  ];
}

/**
 * Get a summary of AI usage across all providers.
 */
export function getAIUsageSummary(
  shop: string,
): { totalCost: number; totalRequests: number; fastestProvider: string; cheapestProvider: string } {
  const metrics = getAIUsageMetrics(shop);

  const totalCost = metrics.reduce((sum, m) => sum + m.costThisMonth, 0);
  const totalRequests = metrics.reduce((sum, m) => sum + m.requestsThisMonth, 0);

  const fastest = metrics.reduce((prev, curr) =>
    curr.avgLatencyMs < prev.avgLatencyMs ? curr : prev,
  );

  // Cheapest = lowest cost per character this month
  const cheapest = metrics.reduce((prev, curr) => {
    const prevCpc = prev.charactersThisMonth > 0 ? prev.costThisMonth / prev.charactersThisMonth : Infinity;
    const currCpc = curr.charactersThisMonth > 0 ? curr.costThisMonth / curr.charactersThisMonth : Infinity;
    return currCpc < prevCpc ? curr : prev;
  });

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    totalRequests,
    fastestProvider: fastest.provider,
    cheapestProvider: cheapest.provider,
  };
}
