import { useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Badge,
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  DataTable,
  InlineStack,
  Layout,
  Page,
  ProgressBar,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import {
  buildCoverageData,
  calculateCoverage,
  getCoverageLevel,
  getCoverageSummary,
  sortByPriority,
} from "../services/coverage";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // Build coverage data from the coverage service for each locale
  const localeCoverageList = LANGUAGE_COVERAGE.map((lang) => {
    return buildCoverageData(
      lang.code,
      CONTENT_TYPE_COVERAGE.map((c) => ({
        type: c.type,
        total: c.total,
        translated: Math.round(c.translated * (lang.translated / lang.total)),
      })),
    );
  });

  const summary = getCoverageSummary(localeCoverageList);
  const prioritized = sortByPriority(localeCoverageList);

  return json({ summary, prioritized });
};

interface LanguageCoverage {
  code: string;
  name: string;
  nativeName: string;
  translated: number;
  total: number;
}

interface ContentTypeCoverage {
  type: string;
  total: number;
  translated: number;
}

const LANGUAGE_COVERAGE: LanguageCoverage[] = [
  { code: "ar", name: "Arabic", nativeName: "العربية", translated: 892, total: 1284 },
  { code: "he", name: "Hebrew", nativeName: "עברית", translated: 641, total: 1284 },
  { code: "fa", name: "Farsi", nativeName: "فارسی", translated: 384, total: 1284 },
  { code: "fr", name: "French", nativeName: "Français", translated: 1156, total: 1284 },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", translated: 512, total: 1284 },
  { code: "ur", name: "Urdu", nativeName: "اردو", translated: 198, total: 1284 },
];

const CONTENT_TYPE_COVERAGE: ContentTypeCoverage[] = [
  { type: "Products", total: 486, translated: 342 },
  { type: "Collections", total: 24, translated: 22 },
  { type: "Pages", total: 18, translated: 12 },
  { type: "Blog Posts", total: 45, translated: 28 },
  { type: "Navigation", total: 8, translated: 8 },
  { type: "Theme", total: 703, translated: 389 },
];

interface WeeklyTrend {
  week: string;
  ar: number;
  he: number;
  fa: number;
  fr: number;
  tr: number;
  ur: number;
  overall: number;
}

const WEEKLY_TREND_DATA: WeeklyTrend[] = [
  { week: "Mar 2", ar: 62, he: 44, fa: 24, fr: 82, tr: 34, ur: 10, overall: 43 },
  { week: "Mar 9", ar: 65, he: 46, fa: 27, fr: 85, tr: 36, ur: 12, overall: 45 },
  { week: "Mar 16", ar: 67, he: 48, fa: 28, fr: 88, tr: 38, ur: 14, overall: 47 },
  { week: "Mar 23", ar: 69, he: 50, fa: 30, fr: 90, tr: 40, ur: 15, overall: 49 },
];

interface CoverageGoalEntry {
  code: string;
  name: string;
  currentPercent: number;
  goalPercent: number;
}

const DEFAULT_COVERAGE_GOALS: CoverageGoalEntry[] = LANGUAGE_COVERAGE.map((lang) => ({
  code: lang.code,
  name: lang.name,
  currentPercent: Math.round((lang.translated / lang.total) * 100),
  goalPercent: 90,
}));

function getCoveragePercent(translated: number, total: number): number {
  return total === 0 ? 0 : Math.round((translated / total) * 100);
}

function getCoverageBadge(percent: number): { label: string; tone: "success" | "warning" | "critical" | "attention" } {
  if (percent >= 90) return { label: "Excellent", tone: "success" };
  if (percent >= 70) return { label: "Good", tone: "attention" };
  if (percent >= 50) return { label: "Warning", tone: "warning" };
  return { label: "Critical", tone: "critical" };
}

function getStatusBadge(percent: number): { label: string; tone: "success" | "warning" | "critical" | "attention" } {
  if (percent === 100) return { label: "Complete", tone: "success" };
  if (percent >= 75) return { label: "In Progress", tone: "attention" };
  if (percent >= 50) return { label: "Partial", tone: "warning" };
  return { label: "Needs Work", tone: "critical" };
}

export default function CoveragePage() {
  const overallTranslated = LANGUAGE_COVERAGE.reduce(
    (sum, l) => sum + l.translated,
    0,
  );
  const overallTotal = LANGUAGE_COVERAGE.reduce((sum, l) => sum + l.total, 0);
  const overallPercent = getCoveragePercent(overallTranslated, overallTotal);

  const hasLowCoverage = LANGUAGE_COVERAGE.some(
    (l) => getCoveragePercent(l.translated, l.total) < 50,
  );

  const contentRows = CONTENT_TYPE_COVERAGE.map((c) => {
    const pct = getCoveragePercent(c.translated, c.total);
    const status = getStatusBadge(pct);
    return [c.type, c.total, c.translated, `${pct}%`, status.label];
  });

  return (
    <Page>
      <TitleBar title="Translation Coverage" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Untranslated Content Alert */}
            {hasLowCoverage && (
              <Banner tone="warning" title="Low Coverage Detected">
                Some languages have less than 50% translation coverage. Consider
                running a bulk translation to improve your store's
                accessibility.
              </Banner>
            )}

            {/* Overall Coverage */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Overall Coverage
                </Text>
                <InlineStack gap="400" blockAlign="end">
                  <Text as="span" variant="heading2xl">
                    {overallPercent}%
                  </Text>
                  <Text as="span" variant="bodyMd" tone="subdued">
                    {overallTranslated.toLocaleString()} of{" "}
                    {overallTotal.toLocaleString()} items translated across all
                    languages
                  </Text>
                </InlineStack>
                <ProgressBar progress={overallPercent} size="small" />
              </BlockStack>
            </Card>

            {/* Coverage by Language */}
            <Text as="h2" variant="headingLg">
              Coverage by Language
            </Text>
            {LANGUAGE_COVERAGE.map((lang) => {
              const pct = getCoveragePercent(lang.translated, lang.total);
              const badge = getCoverageBadge(pct);
              return (
                <Card key={lang.code}>
                  <BlockStack gap="300">
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="200" blockAlign="center">
                        <Text as="h3" variant="headingMd">
                          {lang.name}
                        </Text>
                        <Text as="span" variant="bodyMd" tone="subdued">
                          {lang.nativeName}
                        </Text>
                      </InlineStack>
                      <InlineStack gap="200" blockAlign="center">
                        <Badge tone={badge.tone}>{badge.label}</Badge>
                        <Text as="span" variant="headingSm">
                          {pct}%
                        </Text>
                      </InlineStack>
                    </InlineStack>
                    <ProgressBar
                      progress={pct}
                      size="small"
                      tone={pct < 50 ? "critical" : undefined}
                    />
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="span" variant="bodySm" tone="subdued">
                        {lang.translated} of {lang.total} items translated
                      </Text>
                      <Button>Translate Missing</Button>
                    </InlineStack>
                  </BlockStack>
                </Card>
              );
            })}

            {/* Coverage by Content Type */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Coverage by Content Type
                </Text>
                <DataTable
                  columnContentTypes={[
                    "text",
                    "numeric",
                    "numeric",
                    "numeric",
                    "text",
                  ]}
                  headings={[
                    "Type",
                    "Total",
                    "Translated",
                    "Coverage %",
                    "Status",
                  ]}
                  rows={contentRows}
                />
              </BlockStack>
            </Card>

            {/* Coverage Trend Over Time */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Coverage Trend (Last 4 Weeks)
                </Text>
                <DataTable
                  columnContentTypes={[
                    "text",
                    "numeric",
                    "numeric",
                    "numeric",
                    "numeric",
                    "numeric",
                    "numeric",
                    "numeric",
                  ]}
                  headings={[
                    "Week",
                    "Arabic",
                    "Hebrew",
                    "Farsi",
                    "French",
                    "Turkish",
                    "Urdu",
                    "Overall",
                  ]}
                  rows={WEEKLY_TREND_DATA.map((w) => [
                    w.week,
                    `${w.ar}%`,
                    `${w.he}%`,
                    `${w.fa}%`,
                    `${w.fr}%`,
                    `${w.tr}%`,
                    `${w.ur}%`,
                    `${w.overall}%`,
                  ])}
                />
                <InlineStack align="space-between">
                  <Text as="span" variant="bodySm" tone="subdued">
                    Data shown as weekly snapshots of translation coverage
                    percentage
                  </Text>
                  {(() => {
                    const first = WEEKLY_TREND_DATA[0].overall;
                    const last =
                      WEEKLY_TREND_DATA[WEEKLY_TREND_DATA.length - 1].overall;
                    const delta = last - first;
                    return (
                      <Badge tone={delta >= 0 ? "success" : "critical"}>
                        {delta >= 0 ? "+" : ""}
                        {delta}% overall change
                      </Badge>
                    );
                  })()}
                </InlineStack>
              </BlockStack>
            </Card>

            {/* Coverage Goals */}
            <CoverageGoalsSection />
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function CoverageGoalsSection() {
  const [goals, setGoals] = useState<CoverageGoalEntry[]>(
    () => DEFAULT_COVERAGE_GOALS,
  );

  const updateGoal = (code: string, value: string) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) return;
    setGoals((prev) =>
      prev.map((g) => (g.code === code ? { ...g, goalPercent: parsed } : g)),
    );
  };

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h2" variant="headingMd">
            Coverage Goals
          </Text>
          <Text as="span" variant="bodySm" tone="subdued">
            Set a target coverage percentage for each language
          </Text>
        </InlineStack>
        {goals.map((goal) => {
          const met = goal.currentPercent >= goal.goalPercent;
          const progressToGoal = Math.min(
            100,
            Math.round((goal.currentPercent / goal.goalPercent) * 100),
          );
          return (
            <Card key={goal.code}>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h3" variant="headingSm">
                    {goal.name}
                  </Text>
                  <InlineStack gap="200" blockAlign="center">
                    <Badge tone={met ? "success" : "warning"}>
                      {met ? "Goal Met" : "In Progress"}
                    </Badge>
                    <Text as="span" variant="bodySm">
                      {goal.currentPercent}% / {goal.goalPercent}%
                    </Text>
                  </InlineStack>
                </InlineStack>
                <ProgressBar
                  progress={progressToGoal}
                  size="small"
                  tone={met ? "success" : "highlight"}
                />
                <InlineStack gap="200" blockAlign="center">
                  <Box minWidth="160px">
                    <Select
                      label="Goal"
                      labelHidden
                      options={[
                        { label: "70%", value: "70" },
                        { label: "80%", value: "80" },
                        { label: "90%", value: "90" },
                        { label: "95%", value: "95" },
                        { label: "100%", value: "100" },
                      ]}
                      value={String(goal.goalPercent)}
                      onChange={(value) => updateGoal(goal.code, value)}
                    />
                  </Box>
                  <Text as="span" variant="bodySm" tone="subdued">
                    {met
                      ? "Target reached!"
                      : `${goal.goalPercent - goal.currentPercent}% remaining to goal`}
                  </Text>
                </InlineStack>
              </BlockStack>
            </Card>
          );
        })}
      </BlockStack>
    </Card>
  );
}
