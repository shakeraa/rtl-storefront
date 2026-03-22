/**
 * Notifications Service
 * T0021 - Email Notifications & Alerts
 *
 * Handles notification templates, rendering, and preferences
 * for translation workflow events.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NotificationChannel = "email" | "in_app" | "webhook";

export interface NotificationTemplate {
  id: string;
  type:
    | "translation_complete"
    | "review_needed"
    | "error"
    | "weekly_digest";
  subject: string;
  subjectAr: string;
  body: string;
  bodyAr: string;
  variables: string[];
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: "translation_complete",
    type: "translation_complete",
    subject: "Translation Complete: {{locale}} for {{resourceType}}",
    subjectAr: "اكتملت الترجمة: {{locale}} لـ {{resourceType}}",
    body: "Hi {{userName}},\n\nThe {{locale}} translation for {{resourceType}} \"{{resourceTitle}}\" has been completed.\n\nTotal translated: {{count}} items.\nCoverage is now at {{coverage}}%.\n\nView it in your dashboard to review.",
    bodyAr: "مرحباً {{userName}}،\n\nاكتملت ترجمة {{locale}} لـ {{resourceType}} \"{{resourceTitle}}\".\n\nإجمالي المترجم: {{count}} عنصر.\nالتغطية الآن {{coverage}}%.\n\nعرضها في لوحة التحكم للمراجعة.",
    variables: ["userName", "locale", "resourceType", "resourceTitle", "count", "coverage"],
  },
  {
    id: "review_needed",
    type: "review_needed",
    subject: "Review Needed: {{count}} translations awaiting approval",
    subjectAr: "مراجعة مطلوبة: {{count}} ترجمة بانتظار الموافقة",
    body: "Hi {{userName}},\n\n{{count}} translations for {{locale}} need your review.\n\nResource: {{resourceType}} - \"{{resourceTitle}}\"\n\nPlease review them at your earliest convenience to maintain translation quality.",
    bodyAr: "مرحباً {{userName}}،\n\n{{count}} ترجمة لـ {{locale}} تحتاج مراجعتك.\n\nالمورد: {{resourceType}} - \"{{resourceTitle}}\"\n\nيرجى مراجعتها في أقرب وقت للحفاظ على جودة الترجمة.",
    variables: ["userName", "locale", "resourceType", "resourceTitle", "count"],
  },
  {
    id: "translation_error",
    type: "error",
    subject: "Translation Error: {{errorType}} in {{locale}}",
    subjectAr: "خطأ في الترجمة: {{errorType}} في {{locale}}",
    body: "Hi {{userName}},\n\nAn error occurred during translation:\n\nType: {{errorType}}\nLocale: {{locale}}\nResource: {{resourceType}} - \"{{resourceTitle}}\"\nDetails: {{errorDetails}}\n\nPlease check the error and retry if necessary.",
    bodyAr: "مرحباً {{userName}}،\n\nحدث خطأ أثناء الترجمة:\n\nالنوع: {{errorType}}\nاللغة: {{locale}}\nالمورد: {{resourceType}} - \"{{resourceTitle}}\"\nالتفاصيل: {{errorDetails}}\n\nيرجى التحقق من الخطأ وإعادة المحاولة إذا لزم الأمر.",
    variables: ["userName", "errorType", "locale", "resourceType", "resourceTitle", "errorDetails"],
  },
  {
    id: "weekly_digest",
    type: "weekly_digest",
    subject: "Weekly Translation Digest - {{weekDate}}",
    subjectAr: "ملخص الترجمة الأسبوعي - {{weekDate}}",
    body: "Hi {{userName}},\n\nHere's your weekly translation summary:\n\n- Translations completed: {{completedCount}}\n- Pending reviews: {{pendingCount}}\n- Overall coverage: {{coverage}}%\n- Languages active: {{activeLocales}}\n\nKeep up the great work!",
    bodyAr: "مرحباً {{userName}}،\n\nإليك ملخص الترجمة الأسبوعي:\n\n- الترجمات المكتملة: {{completedCount}}\n- المراجعات المعلقة: {{pendingCount}}\n- التغطية الإجمالية: {{coverage}}%\n- اللغات النشطة: {{activeLocales}}\n\nاستمر في العمل الرائع!",
    variables: ["userName", "weekDate", "completedCount", "pendingCount", "coverage", "activeLocales"],
  },
  {
    id: "coverage_alert",
    type: "error",
    subject: "Coverage Alert: {{locale}} dropped to {{coverage}}%",
    subjectAr: "تنبيه التغطية: {{locale}} انخفضت إلى {{coverage}}%",
    body: "Hi {{userName}},\n\nTranslation coverage for {{locale}} has dropped to {{coverage}}%.\n\nPrevious coverage: {{previousCoverage}}%\nNew untranslated items: {{newUntranslated}}\n\nThis may be due to new content being added. Please review and translate the missing items.",
    bodyAr: "مرحباً {{userName}}،\n\nانخفضت تغطية الترجمة لـ {{locale}} إلى {{coverage}}%.\n\nالتغطية السابقة: {{previousCoverage}}%\nالعناصر غير المترجمة الجديدة: {{newUntranslated}}\n\nقد يكون هذا بسبب إضافة محتوى جديد. يرجى المراجعة وترجمة العناصر المفقودة.",
    variables: ["userName", "locale", "coverage", "previousCoverage", "newUntranslated"],
  },
  {
    id: "new_content",
    type: "review_needed",
    subject: "New Content Detected: {{count}} items need translation",
    subjectAr: "محتوى جديد: {{count}} عنصر يحتاج ترجمة",
    body: "Hi {{userName}},\n\n{{count}} new content items have been detected and need translation:\n\nResource type: {{resourceType}}\nLocales needing translation: {{locales}}\n\nAuto-translation is {{autoTranslateStatus}} for your store.",
    bodyAr: "مرحباً {{userName}}،\n\nتم اكتشاف {{count}} عنصر محتوى جديد يحتاج ترجمة:\n\nنوع المورد: {{resourceType}}\nاللغات التي تحتاج ترجمة: {{locales}}\n\nالترجمة التلقائية {{autoTranslateStatus}} لمتجرك.",
    variables: ["userName", "count", "resourceType", "locales", "autoTranslateStatus"],
  },
];

// ---------------------------------------------------------------------------
// Functions
// ---------------------------------------------------------------------------

/**
 * Build a notification by rendering a template with the given variables.
 */
export function buildNotification(
  templateId: string,
  variables: Record<string, string>,
  locale: string = "en",
): { subject: string; body: string } {
  const template = NOTIFICATION_TEMPLATES.find((t) => t.id === templateId);
  if (!template) {
    throw new Error(`Notification template not found: ${templateId}`);
  }

  const isArabic = locale === "ar" || locale.startsWith("ar-");
  let subject = isArabic ? template.subjectAr : template.subject;
  let body = isArabic ? template.bodyAr : template.body;

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    subject = subject.split(placeholder).join(value);
    body = body.split(placeholder).join(value);
  }

  return { subject, body };
}

/**
 * Get notification preferences for a shop.
 * Returns default preferences (all enabled) as a stub.
 */
export function getNotificationPreferences(
  _shop: string,
): Record<string, { email: boolean; inApp: boolean }> {
  const prefs: Record<string, { email: boolean; inApp: boolean }> = {};

  for (const template of NOTIFICATION_TEMPLATES) {
    prefs[template.id] = {
      email: true,
      inApp: true,
    };
  }

  return prefs;
}

/**
 * Format notification content as an HTML email with RTL support.
 */
export function formatEmailHTML(
  subject: string,
  body: string,
  locale: string = "en",
): string {
  const isRTL = locale === "ar" || locale.startsWith("ar-") || locale === "he" || locale === "fa";
  const dir = isRTL ? "rtl" : "ltr";
  const align = isRTL ? "right" : "left";
  const fontFamily = isRTL
    ? "'Noto Naskh Arabic', 'Tahoma', 'Arial', sans-serif"
    : "'Helvetica Neue', 'Arial', sans-serif";

  const bodyHtml = body
    .split("\n")
    .map((line) => {
      if (line.trim() === "") return "<br/>";
      if (line.startsWith("- ")) return `<li>${line.slice(2)}</li>`;
      return `<p style="margin: 4px 0;">${line}</p>`;
    })
    .join("\n");

  // Wrap list items in <ul> if present
  const finalBody = bodyHtml.includes("<li>")
    ? bodyHtml
        .replace(/<li>/, `<ul style="padding-${isRTL ? "right" : "left"}: 20px; margin: 8px 0;"><li>`)
        .replace(/<\/li>(?![\s\S]*<li>)/, "</li></ul>")
    : bodyHtml;

  return `<!DOCTYPE html>
<html lang="${locale}" dir="${dir}">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: ${fontFamily};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 24px 0;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="background-color: #008060; padding: 20px 32px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; text-align: ${align};">${subject}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px; text-align: ${align}; direction: ${dir}; color: #333333; font-size: 14px; line-height: 1.6;">
              ${finalBody}
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px; background-color: #f9f9f9; text-align: center; color: #888888; font-size: 12px;">
              ${isRTL ? "أرسل بواسطة تطبيق ترجمة RTL Storefront" : "Sent by RTL Storefront Translation App"}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
