import { test, expect } from "@playwright/test";
import {
  navigateToAppPage,
  assertPageHealthy,
  waitForPolaris,
  screenshot,
} from "./helpers";

test.describe("SEO Features", () => {
  test("SEO schema page loads", async ({ page }) => {
    await navigateToAppPage(page, "/seo-schema");
    await waitForPolaris(page);
    await assertPageHealthy(page);

    const body = await page.textContent("body") || "";
    const hasSEO =
      body.includes("Schema") ||
      body.includes("schema") ||
      body.includes("SEO") ||
      body.includes("Structured");

    expect(hasSEO, "SEO schema page should show schema management").toBe(true);
    await screenshot(page, "seo-schema");
  });

  test("SEO sitemap page loads", async ({ page }) => {
    await navigateToAppPage(page, "/seo-sitemap");
    await waitForPolaris(page);
    await assertPageHealthy(page);

    const body = await page.textContent("body") || "";
    const hasSitemap =
      body.includes("Sitemap") ||
      body.includes("sitemap") ||
      body.includes("URL") ||
      body.includes("hreflang");

    expect(hasSitemap, "SEO sitemap page should show sitemap info").toBe(true);
    await screenshot(page, "seo-sitemap");
  });
});

test.describe("Analytics", () => {
  test("analytics page loads with charts or empty state", async ({ page }) => {
    await navigateToAppPage(page, "/analytics");
    await waitForPolaris(page);
    await assertPageHealthy(page);

    const body = await page.textContent("body") || "";
    const hasAnalytics =
      body.includes("Analytics") ||
      body.includes("analytics") ||
      body.includes("Translation") ||
      body.includes("Usage") ||
      body.includes("No data");

    expect(hasAnalytics, "Analytics page should load").toBe(true);
    await screenshot(page, "analytics");
  });

  test("AI usage page loads with provider stats or empty state", async ({ page }) => {
    await navigateToAppPage(page, "/ai-usage");
    await waitForPolaris(page);
    await assertPageHealthy(page);

    const body = await page.textContent("body") || "";
    const hasUsage =
      body.includes("Usage") ||
      body.includes("usage") ||
      body.includes("Provider") ||
      body.includes("provider") ||
      body.includes("OpenAI") ||
      body.includes("DeepL") ||
      body.includes("No data") ||
      body.includes("No usage");

    expect(hasUsage, "AI usage page should load").toBe(true);
    await screenshot(page, "ai-usage");
  });
});

test.describe("Import/Export", () => {
  test("import page has file upload", async ({ page }) => {
    await navigateToAppPage(page, "/import");
    await waitForPolaris(page);
    await assertPageHealthy(page);

    const body = await page.textContent("body") || "";
    const hasImport =
      body.includes("Import") ||
      body.includes("import") ||
      body.includes("Upload") ||
      body.includes("upload") ||
      body.includes("CSV") ||
      body.includes("JSON") ||
      body.includes("file");

    expect(hasImport, "Import page should show file upload").toBe(true);
    await screenshot(page, "import");
  });

  test("export page has export options", async ({ page }) => {
    await navigateToAppPage(page, "/export");
    await waitForPolaris(page);
    await assertPageHealthy(page);

    const body = await page.textContent("body") || "";
    const hasExport =
      body.includes("Export") ||
      body.includes("export") ||
      body.includes("Download") ||
      body.includes("download") ||
      body.includes("CSV") ||
      body.includes("JSON");

    expect(hasExport, "Export page should show export options").toBe(true);
    await screenshot(page, "export");
  });
});
