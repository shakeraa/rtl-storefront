import { useState } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Badge,
  Button,
  Checkbox,
  TextField,
  Banner,
  Box,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import {
  NOTIFICATION_TEMPLATES,
  getNotificationPreferences,
} from "../services/notifications";
import type { NotificationTemplate } from "../services/notifications";
import {
  getDefaultAlertConfig,
  createUntranslatedAlert,
  createNewContentAlert,
  buildAlertSummary,
} from "../services/alerts";
import type { TranslationAlert, AlertConfig } from "../services/alerts";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const preferences = getNotificationPreferences(shop);
  const alertConfig = getDefaultAlertConfig(shop);

  // Generate sample recent alerts for display
  const recentAlerts: TranslationAlert[] = [
    createUntranslatedAlert(shop, "ar", 23)!,
    createNewContentAlert(shop, "he", "product", "gid://shopify/Product/1", "Summer Collection Dress"),
    createUntranslatedAlert(shop, "he", 8)!,
  ].filter(Boolean) as TranslationAlert[];

  const alertSummary = buildAlertSummary(recentAlerts);

  return json({
    templates: NOTIFICATION_TEMPLATES,
    preferences,
    alertConfig,
    recentAlerts,
    alertSummary,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "save_preferences") {
    // In production, persist to database
    return json({ ok: true, message: "Preferences saved" });
  }

  if (intent === "dismiss_alert") {
    const alertId = formData.get("alertId");
    // In production, mark alert as dismissed in database
    return json({ ok: true, dismissed: alertId });
  }

  return json({ ok: false });
};

function severityTone(severity: string) {
  switch (severity) {
    case "critical":
      return "critical";
    case "warning":
      return "warning";
    default:
      return "info";
  }
}

function templateLabel(type: string): string {
  switch (type) {
    case "translation_complete":
      return "Translation Complete";
    case "review_needed":
      return "Review Needed";
    case "error":
      return "Error / Coverage Alert";
    case "weekly_digest":
      return "Weekly Digest";
    default:
      return type;
  }
}

export default function NotificationsPage() {
  const { templates, preferences, alertConfig, recentAlerts, alertSummary } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  // Local preference state
  const [prefs, setPrefs] = useState<
    Record<string, { email: boolean; inApp: boolean }>
  >(preferences);

  // Email recipients state
  const [emailRecipients, setEmailRecipients] = useState<string>(
    (alertConfig as AlertConfig).emailRecipients.join(", "),
  );

  const togglePref = (
    templateId: string,
    channel: "email" | "inApp",
  ) => {
    setPrefs((prev) => ({
      ...prev,
      [templateId]: {
        ...prev[templateId],
        [channel]: !prev[templateId]?.[channel],
      },
    }));
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.set("intent", "save_preferences");
    formData.set("preferences", JSON.stringify(prefs));
    formData.set("emailRecipients", emailRecipients);
    fetcher.submit(formData, { method: "post" });
  };

  const handleDismiss = (alertId: string) => {
    const formData = new FormData();
    formData.set("intent", "dismiss_alert");
    formData.set("alertId", alertId);
    fetcher.submit(formData, { method: "post" });
  };

  // Deduplicate notification types for display
  const notificationTypes = templates.reduce<NotificationTemplate[]>(
    (acc, t) => {
      if (!acc.find((x) => x.type === t.type)) acc.push(t);
      return acc;
    },
    [],
  );

  return (
    <Page>
      <TitleBar title="Notifications" />
      <Layout>
        {/* Alert Summary */}
        {alertSummary.total > 0 && (
          <Layout.Section>
            <Banner
              title={`${alertSummary.total} active alerts`}
              tone={alertSummary.critical > 0 ? "critical" : "warning"}
            >
              <InlineStack gap="300">
                {alertSummary.critical > 0 && (
                  <Badge tone="critical">{`${alertSummary.critical} critical`}</Badge>
                )}
                {alertSummary.warning > 0 && (
                  <Badge tone="warning">{`${alertSummary.warning} warning`}</Badge>
                )}
                {alertSummary.info > 0 && (
                  <Badge tone="info">{`${alertSummary.info} info`}</Badge>
                )}
              </InlineStack>
            </Banner>
          </Layout.Section>
        )}

        {/* Notification Preferences */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Notification Preferences
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                Choose which notifications you want to receive and how.
              </Text>
              <BlockStack gap="300">
                {notificationTypes.map((template) => (
                  <Box
                    key={template.id}
                    padding="300"
                    background="bg-surface-secondary"
                    borderRadius="200"
                  >
                    <BlockStack gap="200">
                      <Text as="h3" variant="headingSm">
                        {templateLabel(template.type)}
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        {template.subject}
                      </Text>
                      <InlineStack gap="400">
                        <Checkbox
                          label="Email"
                          checked={prefs[template.id]?.email ?? true}
                          onChange={() => togglePref(template.id, "email")}
                        />
                        <Checkbox
                          label="In-app"
                          checked={prefs[template.id]?.inApp ?? true}
                          onChange={() => togglePref(template.id, "inApp")}
                        />
                      </InlineStack>
                    </BlockStack>
                  </Box>
                ))}
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Email Recipients */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Email Recipients
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                Comma-separated list of email addresses to receive notifications.
              </Text>
              <TextField
                label="Recipients"
                value={emailRecipients}
                onChange={setEmailRecipients}
                placeholder="admin@example.com, team@example.com"
                autoComplete="email"
                multiline={2}
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Save Button */}
        <Layout.Section>
          <InlineStack align="end">
            <Button variant="primary" onClick={handleSave}>
              Save Preferences
            </Button>
          </InlineStack>
        </Layout.Section>

        {/* Recent Alerts */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Recent Alerts
              </Text>
              {recentAlerts.length === 0 ? (
                <Text as="p" variant="bodyMd" tone="subdued">
                  No recent alerts.
                </Text>
              ) : (
                <BlockStack gap="300">
                  {(recentAlerts as unknown as TranslationAlert[]).map((alert) => (
                    <Box
                      key={alert.id}
                      padding="400"
                      background="bg-surface-secondary"
                      borderRadius="200"
                    >
                      <BlockStack gap="200">
                        <InlineStack
                          align="space-between"
                          blockAlign="center"
                        >
                          <InlineStack gap="200" blockAlign="center">
                            <Badge tone={severityTone(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            <Badge>{alert.category.replace(/_/g, " ")}</Badge>
                            <Text as="span" variant="headingSm">
                              {alert.title}
                            </Text>
                          </InlineStack>
                          <Button
                            variant="plain"
                            onClick={() => handleDismiss(alert.id)}
                          >
                            Dismiss
                          </Button>
                        </InlineStack>
                        <Text as="p" variant="bodyMd">
                          {alert.message}
                        </Text>
                        <InlineStack gap="200">
                          <Badge tone="info">{alert.locale}</Badge>
                          <Text as="span" variant="bodySm" tone="subdued">
                            {new Date(alert.createdAt).toLocaleDateString()}
                          </Text>
                        </InlineStack>
                      </BlockStack>
                    </Box>
                  ))}
                </BlockStack>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
