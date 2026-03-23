/**
 * Alerts Service - Server-side with database
 * Manages translation alerts and notifications
 */

import db from "../../db.server";

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
  untranslatedCritical: number;
  untranslatedWarning: number;
  coverageDropPercent: number;
  staleTranslationDays: number;
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
 * Create an alert in the database
 */
export async function createAlert(params: {
  shop: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  message: string;
  locale: string;
  resourceType?: string;
  resourceId?: string;
  count?: number;
}): Promise<TranslationAlert> {
  const alert = await db.translationAlert.create({
    data: {
      shop: params.shop,
      category: params.category,
      severity: params.severity,
      title: params.title,
      message: params.message,
      locale: params.locale,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      count: params.count,
      dismissed: false,
    },
  });

  return alert as TranslationAlert;
}

/**
 * Create an untranslated content alert
 */
export async function createUntranslatedAlert(
  shop: string,
  locale: string,
  untranslatedCount: number,
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS,
): Promise<TranslationAlert | null> {
  if (untranslatedCount === 0) return null;

  const severity: AlertSeverity =
    untranslatedCount >= thresholds.untranslatedCritical ? "critical" :
    untranslatedCount >= thresholds.untranslatedWarning ? "warning" : "info";

  return createAlert({
    shop,
    category: "untranslated",
    severity,
    title: `${untranslatedCount} untranslated items for ${locale}`,
    message: `There are ${untranslatedCount} content items that have not been translated to ${locale}. ${severity === "critical" ? "Immediate attention required." : "Consider translating these items."}`,
    locale,
    count: untranslatedCount,
  });
}

/**
 * Create a new content alert
 */
export async function createNewContentAlert(
  shop: string,
  locale: string,
  resourceType: string,
  resourceId: string,
  title: string,
): Promise<TranslationAlert> {
  return createAlert({
    shop,
    category: "new_content",
    severity: "info",
    title: `New ${resourceType} needs translation: ${title}`,
    message: `A new ${resourceType} "${title}" has been created and needs translation to ${locale}.`,
    locale,
    resourceType,
    resourceId,
  });
}

/**
 * Create a coverage drop alert
 */
export async function createCoverageDropAlert(
  shop: string,
  locale: string,
  previousPercent: number,
  currentPercent: number,
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS,
): Promise<TranslationAlert | null> {
  const drop = previousPercent - currentPercent;
  if (drop < thresholds.coverageDropPercent) return null;

  const severity: AlertSeverity = drop >= thresholds.coverageDropPercent * 2 ? "critical" : "warning";

  return createAlert({
    shop,
    category: "coverage_drop",
    severity,
    title: `Coverage dropped ${drop}% for ${locale}`,
    message: `Translation coverage for ${locale} dropped from ${previousPercent}% to ${currentPercent}%. This may be due to new content being added without translation.`,
    locale,
  });
}

/**
 * Get active (non-dismissed) alerts for a shop
 */
export async function getActiveAlerts(shop: string): Promise<TranslationAlert[]> {
  const alerts = await db.translationAlert.findMany({
    where: {
      shop,
      dismissed: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50, // Limit to recent 50 alerts
  });

  return alerts as TranslationAlert[];
}

/**
 * Get recent alerts (including dismissed, limited)
 */
export async function getRecentAlerts(shop: string, limit: number = 10): Promise<TranslationAlert[]> {
  const alerts = await db.translationAlert.findMany({
    where: {
      shop,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  return alerts as TranslationAlert[];
}

/**
 * Dismiss an alert
 */
export async function dismissAlert(
  alertId: string,
  dismissedBy?: string,
): Promise<void> {
  await db.translationAlert.update({
    where: { id: alertId },
    data: {
      dismissed: true,
      dismissedAt: new Date(),
      dismissedBy: dismissedBy || null,
    },
  });
}

/**
 * Build an alert summary
 */
export async function buildAlertSummary(shop: string): Promise<AlertSummary> {
  const activeAlerts = await db.translationAlert.findMany({
    where: {
      shop,
      dismissed: false,
    },
  });

  const byCategory = {} as Record<AlertCategory, number>;
  const byLocale = {} as Record<string, number>;

  for (const alert of activeAlerts) {
    const category = alert.category as AlertCategory;
    byCategory[category] = (byCategory[category] ?? 0) + 1;
    byLocale[alert.locale] = (byLocale[alert.locale] ?? 0) + 1;
  }

  return {
    total: activeAlerts.length,
    critical: activeAlerts.filter((a) => a.severity === "critical").length,
    warning: activeAlerts.filter((a) => a.severity === "warning").length,
    info: activeAlerts.filter((a) => a.severity === "info").length,
    byCategory,
    byLocale,
  };
}

/**
 * Get or create alert configuration
 */
export async function getAlertConfig(shop: string): Promise<AlertConfig> {
  const config = await db.alertConfiguration.findUnique({
    where: { shop },
  });

  if (!config) {
    // Create default config
    const newConfig = await db.alertConfiguration.create({
      data: {
        shop,
        enableInApp: true,
        enableEmail: false,
        emailDigestFrequency: "weekly",
        emailRecipients: "[]",
        untranslatedCritical: 50,
        untranslatedWarning: 10,
        coverageDropPercent: 5,
        staleTranslationDays: 90,
      },
    });

    return {
      shop: newConfig.shop,
      enableInApp: newConfig.enableInApp,
      enableEmail: newConfig.enableEmail,
      emailDigestFrequency: newConfig.emailDigestFrequency as "daily" | "weekly" | "never",
      emailRecipients: JSON.parse(newConfig.emailRecipients),
      thresholds: {
        untranslatedCritical: newConfig.untranslatedCritical,
        untranslatedWarning: newConfig.untranslatedWarning,
        coverageDropPercent: newConfig.coverageDropPercent,
        staleTranslationDays: newConfig.staleTranslationDays,
      },
    };
  }

  return {
    shop: config.shop,
    enableInApp: config.enableInApp,
    enableEmail: config.enableEmail,
    emailDigestFrequency: config.emailDigestFrequency as "daily" | "weekly" | "never",
    emailRecipients: JSON.parse(config.emailRecipients),
    thresholds: {
      untranslatedCritical: config.untranslatedCritical,
      untranslatedWarning: config.untranslatedWarning,
      coverageDropPercent: config.coverageDropPercent,
      staleTranslationDays: config.staleTranslationDays,
    },
  };
}

/**
 * Update alert configuration
 */
export async function updateAlertConfig(
  shop: string,
  updates: Partial<AlertConfig>,
): Promise<AlertConfig> {
  const data: any = {};

  if (updates.enableInApp !== undefined) data.enableInApp = updates.enableInApp;
  if (updates.enableEmail !== undefined) data.enableEmail = updates.enableEmail;
  if (updates.emailDigestFrequency) data.emailDigestFrequency = updates.emailDigestFrequency;
  if (updates.emailRecipients) data.emailRecipients = JSON.stringify(updates.emailRecipients);
  if (updates.thresholds) {
    data.untranslatedCritical = updates.thresholds.untranslatedCritical;
    data.untranslatedWarning = updates.thresholds.untranslatedWarning;
    data.coverageDropPercent = updates.thresholds.coverageDropPercent;
    data.staleTranslationDays = updates.thresholds.staleTranslationDays;
  }

  const config = await db.alertConfiguration.upsert({
    where: { shop },
    create: {
      shop,
      enableInApp: updates.enableInApp ?? true,
      enableEmail: updates.enableEmail ?? false,
      emailDigestFrequency: updates.emailDigestFrequency ?? "weekly",
      emailRecipients: JSON.stringify(updates.emailRecipients ?? []),
      untranslatedCritical: updates.thresholds?.untranslatedCritical ?? 50,
      untranslatedWarning: updates.thresholds?.untranslatedWarning ?? 10,
      coverageDropPercent: updates.thresholds?.coverageDropPercent ?? 5,
      staleTranslationDays: updates.thresholds?.staleTranslationDays ?? 90,
    },
    update: data,
  });

  return {
    shop: config.shop,
    enableInApp: config.enableInApp,
    enableEmail: config.enableEmail,
    emailDigestFrequency: config.emailDigestFrequency as "daily" | "weekly" | "never",
    emailRecipients: JSON.parse(config.emailRecipients),
    thresholds: {
      untranslatedCritical: config.untranslatedCritical,
      untranslatedWarning: config.untranslatedWarning,
      coverageDropPercent: config.coverageDropPercent,
      staleTranslationDays: config.staleTranslationDays,
    },
  };
}

/**
 * Get notification preferences for a shop
 */
export async function getNotificationPreferences(
  shop: string,
): Promise<Record<string, { email: boolean; inApp: boolean }>> {
  const prefs = await db.notificationPreference.findMany({
    where: { shop },
  });

  const defaultTypes = [
    "translation_complete",
    "review_needed",
    "error",
    "weekly_digest",
  ];

  const result: Record<string, { email: boolean; inApp: boolean }> = {};

  for (const type of defaultTypes) {
    const pref = prefs.find((p) => p.templateType === type);
    result[type] = {
      email: pref?.emailEnabled ?? true,
      inApp: pref?.inAppEnabled ?? true,
    };
  }

  return result;
}

/**
 * Update notification preference
 */
export async function updateNotificationPreference(
  shop: string,
  templateType: string,
  email: boolean,
  inApp: boolean,
): Promise<void> {
  await db.notificationPreference.upsert({
    where: {
      shop_templateType: {
        shop,
        templateType,
      },
    },
    create: {
      shop,
      templateType,
      emailEnabled: email,
      inAppEnabled: inApp,
    },
    update: {
      emailEnabled: email,
      inAppEnabled: inApp,
    },
  });
}

export { DEFAULT_THRESHOLDS };
