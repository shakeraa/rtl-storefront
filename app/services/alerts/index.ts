export type AlertSeverity = "critical" | "warning" | "info";
export type AlertCategory = "untranslated" | "new_content" | "stale_translation" | "coverage_drop" | "quality";

export interface TranslationAlert {
  id: string;
  shop: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  message: string;
  locale: string;
  resourceType?: string;
  resourceId?: string;
  count?: number;
  dismissed: boolean;
  createdAt: Date;
}

export interface AlertConfig {
  shop: string;
  enableInApp: boolean;
  enableEmail: boolean;
  emailDigestFrequency: "daily" | "weekly" | "never";
  emailRecipients: string[];
  thresholds: AlertThresholds;
}

export interface AlertThresholds {
  untranslatedCritical: number;  // alert when untranslated > this count
  untranslatedWarning: number;
  coverageDropPercent: number;   // alert when coverage drops by this %
  staleTranslationDays: number;  // alert when translation older than this
}

export interface AlertSummary {
  total: number;
  critical: number;
  warning: number;
  info: number;
  byCategory: Record<AlertCategory, number>;
  byLocale: Record<string, number>;
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  untranslatedCritical: 50,
  untranslatedWarning: 10,
  coverageDropPercent: 5,
  staleTranslationDays: 90,
};

/**
 * Create an untranslated content alert.
 */
export function createUntranslatedAlert(
  shop: string,
  locale: string,
  untranslatedCount: number,
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS,
): TranslationAlert | null {
  if (untranslatedCount === 0) return null;

  const severity: AlertSeverity =
    untranslatedCount >= thresholds.untranslatedCritical ? "critical" :
    untranslatedCount >= thresholds.untranslatedWarning ? "warning" : "info";

  return {
    id: `untranslated-${shop}-${locale}-${Date.now()}`,
    shop,
    category: "untranslated",
    severity,
    title: `${untranslatedCount} untranslated items for ${locale}`,
    message: `There are ${untranslatedCount} content items that have not been translated to ${locale}. ${severity === "critical" ? "Immediate attention required." : "Consider translating these items."}`,
    locale,
    count: untranslatedCount,
    dismissed: false,
    createdAt: new Date(),
  };
}

/**
 * Create a new content alert (content added that needs translation).
 */
export function createNewContentAlert(
  shop: string,
  locale: string,
  resourceType: string,
  resourceId: string,
  title: string,
): TranslationAlert {
  return {
    id: `new-content-${shop}-${resourceId}-${Date.now()}`,
    shop,
    category: "new_content",
    severity: "info",
    title: `New ${resourceType} needs translation: ${title}`,
    message: `A new ${resourceType} "${title}" has been created and needs translation to ${locale}.`,
    locale,
    resourceType,
    resourceId,
    dismissed: false,
    createdAt: new Date(),
  };
}

/**
 * Create a coverage drop alert.
 */
export function createCoverageDropAlert(
  shop: string,
  locale: string,
  previousPercent: number,
  currentPercent: number,
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS,
): TranslationAlert | null {
  const drop = previousPercent - currentPercent;
  if (drop < thresholds.coverageDropPercent) return null;

  return {
    id: `coverage-drop-${shop}-${locale}-${Date.now()}`,
    shop,
    category: "coverage_drop",
    severity: drop >= thresholds.coverageDropPercent * 2 ? "critical" : "warning",
    title: `Coverage dropped ${drop}% for ${locale}`,
    message: `Translation coverage for ${locale} dropped from ${previousPercent}% to ${currentPercent}%. This may be due to new content being added without translation.`,
    locale,
    dismissed: false,
    createdAt: new Date(),
  };
}

/**
 * Build an alert summary from a list of alerts.
 */
export function buildAlertSummary(alerts: TranslationAlert[]): AlertSummary {
  const active = alerts.filter((a) => !a.dismissed);

  const byCategory = {} as Record<AlertCategory, number>;
  const byLocale = {} as Record<string, number>;

  for (const alert of active) {
    byCategory[alert.category] = (byCategory[alert.category] ?? 0) + 1;
    byLocale[alert.locale] = (byLocale[alert.locale] ?? 0) + 1;
  }

  return {
    total: active.length,
    critical: active.filter((a) => a.severity === "critical").length,
    warning: active.filter((a) => a.severity === "warning").length,
    info: active.filter((a) => a.severity === "info").length,
    byCategory,
    byLocale,
  };
}

/**
 * Filter alerts by severity and category.
 */
export function filterAlerts(
  alerts: TranslationAlert[],
  options: { severity?: AlertSeverity; category?: AlertCategory; locale?: string; includeDismissed?: boolean },
): TranslationAlert[] {
  return alerts.filter((alert) => {
    if (!options.includeDismissed && alert.dismissed) return false;
    if (options.severity && alert.severity !== options.severity) return false;
    if (options.category && alert.category !== options.category) return false;
    if (options.locale && alert.locale !== options.locale) return false;
    return true;
  });
}

/**
 * Get default alert configuration.
 */
export function getDefaultAlertConfig(shop: string): AlertConfig {
  return {
    shop,
    enableInApp: true,
    enableEmail: false,
    emailDigestFrequency: "weekly",
    emailRecipients: [],
    thresholds: { ...DEFAULT_THRESHOLDS },
  };
}

export { DEFAULT_THRESHOLDS };
