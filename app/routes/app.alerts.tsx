import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useCallback, useState } from "react";
import {
  Badge,
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  Checkbox,
  DataTable,
  InlineStack,
  Layout,
  Page,
  Select,
  Text,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import {
  buildAlertSummary,
  createNewContentAlert,
  createUntranslatedAlert,
  filterAlerts,
  getDefaultAlertConfig,
  type AlertSeverity,
  type TranslationAlert,
} from "../services/alerts";

const LOCALE_INFO: Record<string, { name: string; nativeName: string }> = {
  ar: { name: "Arabic", nativeName: "العربية" },
  he: { name: "Hebrew", nativeName: "עברית" },
  fa: { name: "Farsi", nativeName: "فارسی" },
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;

  // Query real untranslated counts per locale
  let untranslatedCounts: Record<string, number> = {};
  try {
    // Get total distinct source content
    const distinctSources = await db.translationCache.groupBy({
      by: ["sourceText"],
      _count: true,
    });
    const totalSourceItems = distinctSources.length;

    // Get translated count per locale
    const translatedGroups = await db.translationCache.groupBy({
      by: ["targetLocale"],
      _count: true,
    });

    // Also check shop settings for configured target locales
    let targetLocales = Object.keys(LOCALE_INFO);
    try {
      const settings = await db.shopSettings.findUnique({ where: { shop } });
      if (settings?.targetLocales) {
        const parsed = JSON.parse(settings.targetLocales);
        if (Array.isArray(parsed) && parsed.length > 0) {
          targetLocales = parsed;
        }
      }
    } catch {
      // keep defaults
    }

    const translatedByLocale: Record<string, number> = {};
    for (const g of translatedGroups) {
      translatedByLocale[g.targetLocale] = g._count;
    }

    for (const locale of targetLocales) {
      const translated = translatedByLocale[locale] ?? 0;
      untranslatedCounts[locale] = Math.max(0, totalSourceItems - translated);
    }
  } catch {
    // On failure, set all to 0 so no false alerts
    for (const locale of Object.keys(LOCALE_INFO)) {
      untranslatedCounts[locale] = 0;
    }
  }

  // Query for recently added content that may need translation
  let newContentItems: Array<{ locale: string; resourceType: string; resourceId: string; title: string }> = [];
  try {
    // Check DataAccessLog for recent content additions
    const recentLogs = await db.dataAccessLog.findMany({
      where: {
        shop,
        action: { in: ["create", "add", "new"] },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const targetLocales = Object.keys(untranslatedCounts).length > 0
      ? Object.keys(untranslatedCounts)
      : Object.keys(LOCALE_INFO);

    for (const log of recentLogs) {
      // Create an alert for each configured locale
      for (const locale of targetLocales.slice(0, 1)) { // one alert per new content
        newContentItems.push({
          locale,
          resourceType: log.dataType ?? "Content",
          resourceId: log.id,
          title: log.details ?? log.dataType ?? "New content",
        });
      }
    }
  } catch {
    // ignore — no new content alerts
  }

  // Generate alerts from real data
  const alerts: TranslationAlert[] = [];

  for (const locale of Object.keys(untranslatedCounts)) {
    const count = untranslatedCounts[locale];
    if (count > 0) {
      const untranslated = createUntranslatedAlert(shop, locale, count);
      if (untranslated) alerts.push(untranslated);
    }
  }

  for (const item of newContentItems) {
    alerts.push(
      createNewContentAlert(shop, item.locale, item.resourceType, item.resourceId, item.title),
    );
  }

  const summary = buildAlertSummary(alerts);
  const config = getDefaultAlertConfig(shop);

  return json({
    alerts: alerts.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })),
    summary,
    config,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "dismiss") {
    const alertId = formData.get("alertId");
    return json({ success: true, dismissed: alertId });
  }

  return json({ success: false });
};

function getSeverityBadgeTone(severity: AlertSeverity): "critical" | "warning" | "info" {
  return severity;
}

function getBannerTone(severity: AlertSeverity): "critical" | "warning" | "info" {
  return severity;
}

export default function AlertsPage() {
  const { alerts, summary, config } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [localeFilter, setLocaleFilter] = useState<string>("all");
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [emailEnabled, setEmailEnabled] = useState(config.enableEmail);
  const [emailFrequency, setEmailFrequency] = useState(config.emailDigestFrequency);
  const [inAppEnabled, setInAppEnabled] = useState(config.enableInApp);

  const handleDismiss = useCallback(
    (alertId: string) => {
      setDismissedIds((prev) => new Set([...prev, alertId]));
      const formData = new FormData();
      formData.set("intent", "dismiss");
      formData.set("alertId", alertId);
      submit(formData, { method: "post" });
    },
    [submit],
  );

  const visibleAlerts = alerts.filter((a) => {
    if (dismissedIds.has(a.id)) return false;
    if (severityFilter !== "all" && a.severity !== severityFilter) return false;
    if (localeFilter !== "all" && a.locale !== localeFilter) return false;
    return true;
  });

  const untranslatedAlerts = visibleAlerts.filter((a) => a.category === "untranslated");
  const newContentAlerts = visibleAlerts.filter((a) => a.category === "new_content");

  const untranslatedRows = untranslatedAlerts.map((a) => {
    const info = LOCALE_INFO[a.locale] || { name: a.locale, nativeName: "" };
    return [
      `${info.name} (${info.nativeName})`,
      String(a.count ?? 0),
      a.severity,
    ];
  });

  return (
    <Page>
      <TitleBar title="Untranslated Content Alerts" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Alert Summary Cards */}
            <InlineStack gap="400" wrap>
              <Box minWidth="180px">
                <Card>
                  <BlockStack gap="200">
                    <Text as="span" variant="bodySm" tone="subdued">Total Active</Text>
                    <Text as="span" variant="heading2xl">{summary.total}</Text>
                  </BlockStack>
                </Card>
              </Box>
              <Box minWidth="180px">
                <Card>
                  <BlockStack gap="200">
                    <InlineStack gap="200" blockAlign="center">
                      <Text as="span" variant="bodySm" tone="subdued">Critical</Text>
                      <Badge tone="critical">{String(summary.critical)}</Badge>
                    </InlineStack>
                    <Text as="span" variant="heading2xl">{summary.critical}</Text>
                  </BlockStack>
                </Card>
              </Box>
              <Box minWidth="180px">
                <Card>
                  <BlockStack gap="200">
                    <InlineStack gap="200" blockAlign="center">
                      <Text as="span" variant="bodySm" tone="subdued">Warning</Text>
                      <Badge tone="warning">{String(summary.warning)}</Badge>
                    </InlineStack>
                    <Text as="span" variant="heading2xl">{summary.warning}</Text>
                  </BlockStack>
                </Card>
              </Box>
              <Box minWidth="180px">
                <Card>
                  <BlockStack gap="200">
                    <InlineStack gap="200" blockAlign="center">
                      <Text as="span" variant="bodySm" tone="subdued">Info</Text>
                      <Badge tone="info">{String(summary.info)}</Badge>
                    </InlineStack>
                    <Text as="span" variant="heading2xl">{summary.info}</Text>
                  </BlockStack>
                </Card>
              </Box>
            </InlineStack>

            {/* Filters */}
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">Filters</Text>
                <InlineStack gap="400">
                  <Box minWidth="200px">
                    <Select
                      label="Severity"
                      options={[
                        { label: "All", value: "all" },
                        { label: "Critical", value: "critical" },
                        { label: "Warning", value: "warning" },
                        { label: "Info", value: "info" },
                      ]}
                      value={severityFilter}
                      onChange={setSeverityFilter}
                    />
                  </Box>
                  <Box minWidth="200px">
                    <Select
                      label="Locale"
                      options={[
                        { label: "All", value: "all" },
                        { label: "Arabic (ar)", value: "ar" },
                        { label: "Hebrew (he)", value: "he" },
                        { label: "Farsi (fa)", value: "fa" },
                      ]}
                      value={localeFilter}
                      onChange={setLocaleFilter}
                    />
                  </Box>
                </InlineStack>
              </BlockStack>
            </Card>

            {/* Critical Alerts Banner */}
            {summary.critical > 0 && (
              <Banner tone="critical" title="Critical alerts require attention">
                You have {summary.critical} critical alert{summary.critical > 1 ? "s" : ""} that
                need immediate attention. Languages with over 50 untranslated items are marked
                critical.
              </Banner>
            )}

            {/* Untranslated Count per Language */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Untranslated Content by Language</Text>
                {untranslatedAlerts.length === 0 ? (
                  <Text as="p" variant="bodyMd" tone="subdued">
                    No untranslated content alerts match your filters.
                  </Text>
                ) : (
                  <DataTable
                    columnContentTypes={["text", "numeric", "text"]}
                    headings={["Language", "Untranslated Items", "Severity"]}
                    rows={untranslatedRows}
                  />
                )}
              </BlockStack>
            </Card>

            {/* Priority Content Alerts */}
            <Text as="h2" variant="headingLg">Priority Content Alerts</Text>
            {untranslatedAlerts.length === 0 ? (
              <Card>
                <Text as="p" variant="bodyMd" tone="subdued">
                  No priority alerts to display.
                </Text>
              </Card>
            ) : (
              untranslatedAlerts.map((alert) => (
                <Banner
                  key={alert.id}
                  tone={getBannerTone(alert.severity as AlertSeverity)}
                  title={alert.title}
                  onDismiss={() => handleDismiss(alert.id)}
                >
                  {alert.message}
                </Banner>
              ))
            )}

            {/* New Content Notifications */}
            <Text as="h2" variant="headingLg">New Content Notifications</Text>
            {newContentAlerts.length === 0 ? (
              <Card>
                <Text as="p" variant="bodyMd" tone="subdued">
                  No new content notifications match your filters.
                </Text>
              </Card>
            ) : (
              newContentAlerts.map((alert) => (
                <Banner
                  key={alert.id}
                  tone="info"
                  title={alert.title}
                  onDismiss={() => handleDismiss(alert.id)}
                >
                  {alert.message}
                </Banner>
              ))
            )}

            {/* Email Digest Configuration */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Email Digest Configuration</Text>
                <Checkbox
                  label="Enable email digest notifications"
                  checked={emailEnabled}
                  onChange={setEmailEnabled}
                />
                {emailEnabled && (
                  <Box paddingInlineStart="400">
                    <Select
                      label="Digest frequency"
                      options={[
                        { label: "Daily", value: "daily" },
                        { label: "Weekly", value: "weekly" },
                        { label: "Never", value: "never" },
                      ]}
                      value={emailFrequency}
                      onChange={(v) => setEmailFrequency(v as "daily" | "weekly" | "never")}
                    />
                  </Box>
                )}
              </BlockStack>
            </Card>

            {/* In-App Notification Settings */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">In-App Notification Settings</Text>
                <Checkbox
                  label="Show in-app notifications for new alerts"
                  checked={inAppEnabled}
                  onChange={setInAppEnabled}
                />
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">Alert Thresholds</Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Critical: {config.thresholds.untranslatedCritical}+ untranslated items
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Warning: {config.thresholds.untranslatedWarning}+ untranslated items
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Coverage drop: {config.thresholds.coverageDropPercent}% or more
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Stale translations: {config.thresholds.staleTranslationDays} days
                  </Text>
                </BlockStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
