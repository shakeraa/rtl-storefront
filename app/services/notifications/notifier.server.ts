/**
 * Notification Service
 * Creates and delivers notifications for translation events
 */

import db from "../../db.server";
import { sendEmail } from "../email";
import type { AlertSeverity } from "../alerts/alerts.server";

export type NotificationType = 
  | "translation_complete"
  | "review_needed" 
  | "error"
  | "weekly_digest"
  | "coverage_alert"
  | "quota_warning";

export interface NotificationPayload {
  shop: string;
  type: NotificationType;
  title: string;
  message: string;
  severity?: "info" | "warning" | "critical";
  locale?: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create and send a notification
 */
export async function notify(payload: NotificationPayload): Promise<void> {
  // Get shop preferences
  const [pref, config] = await Promise.all([
    db.notificationPreference.findUnique({
      where: {
        shop_templateType: {
          shop: payload.shop,
          templateType: payload.type,
        },
      },
    }),
    db.alertConfiguration.findUnique({
      where: { shop: payload.shop },
    }),
  ]);

  // Default to enabled if no preference set
  const emailEnabled = pref?.emailEnabled ?? true;
  const inAppEnabled = pref?.inAppEnabled ?? true;

  // Create in-app notification
  if (inAppEnabled) {
    await createInAppNotification(payload);
  }

  // Send email notification
  if (emailEnabled && config?.enableEmail && config.emailRecipients) {
    const recipients = JSON.parse(config.emailRecipients as string) as string[];
    if (recipients.length > 0) {
      await sendEmailNotification(payload, recipients);
    }
  }
}

/**
 * Create in-app notification/alert
 */
async function createInAppNotification(payload: NotificationPayload): Promise<void> {
  // Map notification types to alert categories
  const categoryMap: Record<NotificationType, string> = {
    translation_complete: "new_content",
    review_needed: "quality",
    error: "untranslated",
    weekly_digest: "coverage_drop",
    coverage_alert: "coverage_drop",
    quota_warning: "untranslated",
  };

  await db.translationAlert.create({
    data: {
      shop: payload.shop,
      category: categoryMap[payload.type] || "new_content",
      severity: (payload.severity || "info") as AlertSeverity,
      title: payload.title,
      message: payload.message,
      locale: payload.locale || "all",
      resourceType: payload.resourceType,
      resourceId: payload.resourceId,
      dismissed: false,
    },
  });
}

/**
 * Send email notification
 */
async function sendEmailNotification(
  payload: NotificationPayload,
  recipients: string[]
): Promise<void> {
  const subject = getEmailSubject(payload);
  const html = buildEmailHtml(payload);

  for (const recipient of recipients) {
    try {
      await sendEmail({
        to: recipient,
        subject,
        html,
      });
    } catch (error) {
      console.error(`[Notifier] Failed to send email to ${recipient}:`, error);
    }
  }
}

/**
 * Get email subject based on notification type
 */
function getEmailSubject(payload: NotificationPayload): string {
  const prefix = "RTL Storefront";
  switch (payload.type) {
    case "translation_complete":
      return `${prefix}: Translation Complete - ${payload.locale?.toUpperCase()}`;
    case "review_needed":
      return `${prefix}: Review Needed - ${payload.title}`;
    case "error":
      return `${prefix}: Translation Error - ${payload.title}`;
    case "quota_warning":
      return `${prefix}: Quota Warning - Action Required`;
    case "coverage_alert":
      return `${prefix}: Coverage Alert - ${payload.locale?.toUpperCase()}`;
    default:
      return `${prefix}: ${payload.title}`;
  }
}

/**
 * Build HTML email content
 */
function buildEmailHtml(payload: NotificationPayload): string {
  const severityColor = {
    info: "#5c6ac4",
    warning: "#c05717",
    critical: "#d72c0d",
  }[payload.severity || "info"];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #5c6ac4; }
    .content { background: #f9fafb; padding: 30px; border-radius: 8px; }
    .alert-bar { background: ${severityColor}; color: white; padding: 10px 15px; border-radius: 6px 6px 0 0; margin: -30px -30px 20px -30px; font-weight: 500; }
    .button { display: inline-block; background: #5c6ac4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    .meta { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .meta-row { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🌍 RTL Storefront</div>
  </div>
  
  <div class="content">
    ${payload.severity !== "info" ? `<div class="alert-bar">${payload.severity?.toUpperCase()}</div>` : ""}
    
    <h2>${payload.title}</h2>
    <p>${payload.message}</p>
    
    ${payload.metadata ? `
    <div class="meta">
      ${Object.entries(payload.metadata).map(([key, value]) => `
        <div class="meta-row">
          <span style="color: #666;">${key}:</span>
          <span style="font-weight: 500;">${value}</span>
        </div>
      `).join("")}
    </div>
    ` : ""}
    
    <center>
      <a href="https://admin.shopify.com/store/${payload.shop.replace(".myshopify.com", "")}/apps/rtl-storefront" class="button">
        View in Dashboard
      </a>
    </center>
  </div>
  
  <div class="footer">
    <p>You're receiving this because you have notifications enabled for RTL Storefront.</p>
    <p>To change your preferences, visit the Notifications page in the app.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Notify when translation is complete
 */
export async function notifyTranslationComplete(params: {
  shop: string;
  locale: string;
  resourceType: string;
  resourceId: string;
  resourceTitle: string;
  characters: number;
  provider: string;
}): Promise<void> {
  await notify({
    shop: params.shop,
    type: "translation_complete",
    title: `Translation Complete: ${params.resourceTitle}`,
    message: `Successfully translated "${params.resourceTitle}" to ${params.locale.toUpperCase()} using ${params.provider}.`,
    severity: "info",
    locale: params.locale,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    metadata: {
      "Content": params.resourceTitle,
      "Type": params.resourceType,
      "Language": params.locale.toUpperCase(),
      "Characters": params.characters.toLocaleString(),
      "Provider": params.provider,
    },
  });
}

/**
 * Notify when translation fails
 */
export async function notifyTranslationError(params: {
  shop: string;
  locale: string;
  resourceType: string;
  resourceId: string;
  resourceTitle: string;
  error: string;
}): Promise<void> {
  await notify({
    shop: params.shop,
    type: "error",
    title: `Translation Failed: ${params.resourceTitle}`,
    message: `Failed to translate "${params.resourceTitle}" to ${params.locale.toUpperCase()}. Error: ${params.error}`,
    severity: "critical",
    locale: params.locale,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    metadata: {
      "Content": params.resourceTitle,
      "Type": params.resourceType,
      "Language": params.locale.toUpperCase(),
      "Error": params.error,
    },
  });
}

/**
 * Notify when review is needed
 */
export async function notifyReviewNeeded(params: {
  shop: string;
  locale: string;
  resourceType: string;
  resourceId: string;
  resourceTitle: string;
  qualityScore: number;
}): Promise<void> {
  await notify({
    shop: params.shop,
    type: "review_needed",
    title: `Review Needed: ${params.resourceTitle}`,
    message: `The translation of "${params.resourceTitle}" to ${params.locale.toUpperCase()} has a quality score of ${params.qualityScore}/100 and may need review.`,
    severity: "warning",
    locale: params.locale,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    metadata: {
      "Content": params.resourceTitle,
      "Type": params.resourceType,
      "Language": params.locale.toUpperCase(),
      "Quality Score": `${params.qualityScore}/100`,
    },
  });
}

/**
 * Notify about quota warning
 */
export async function notifyQuotaWarning(params: {
  shop: string;
  percentUsed: number;
  charactersUsed: number;
  charactersRemaining: number;
}): Promise<void> {
  await notify({
    shop: params.shop,
    type: "quota_warning",
    title: "Translation Quota Warning",
    message: `You have used ${params.percentUsed}% of your monthly translation quota (${params.charactersUsed.toLocaleString()} characters). ${params.charactersRemaining.toLocaleString()} characters remaining.`,
    severity: params.percentUsed >= 90 ? "critical" : "warning",
    metadata: {
      "Usage": `${params.percentUsed}%`,
      "Used": params.charactersUsed.toLocaleString(),
      "Remaining": params.charactersRemaining.toLocaleString(),
    },
  });
}

/**
 * Get unread notification count for badge
 */
export async function getUnreadCount(shop: string): Promise<number> {
  return db.translationAlert.count({
    where: {
      shop,
      dismissed: false,
    },
  });
}

/**
 * Get recent notifications for display
 */
export async function getRecentNotifications(shop: string, limit: number = 10) {
  const alerts = await db.translationAlert.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return alerts.map(alert => ({
    id: alert.id,
    type: mapCategoryToType(alert.category),
    title: alert.title,
    message: alert.message,
    severity: alert.severity,
    locale: alert.locale,
    dismissed: alert.dismissed,
    createdAt: alert.createdAt,
  }));
}

function mapCategoryToType(category: string): NotificationType {
  const map: Record<string, NotificationType> = {
    new_content: "translation_complete",
    quality: "review_needed",
    untranslated: "error",
    coverage_drop: "coverage_alert",
  };
  return map[category] || "translation_complete";
}
