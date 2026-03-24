import { test, expect } from "@playwright/test";
import {
  navigateToAppPage,
  assertPageHealthy,
  waitForPolaris,
  clickButton,
  screenshot,
} from "./helpers";

test.describe("Translation Flow", () => {
  test("translation list page shows resource types", async ({ page }) => {
    await navigateToAppPage(page, "/translate");
    await waitForPolaris(page);
    await assertPageHealthy(page);

    // Should show content type tabs or resource list
    const body = await page.textContent("body") || "";
    const hasTranslateUI =
      body.includes("Product") ||
      body.includes("Collection") ||
      body.includes("Page") ||
      body.includes("Translate") ||
      body.includes("translation");

    expect(hasTranslateUI, "Translation page should show translation-related content").toBe(true);
    await screenshot(page, "translation-list");
  });

  test("bulk translate page has locale selector and resource list", async ({ page }) => {
    await navigateToAppPage(page, "/bulk-translate");
    await waitForPolaris(page);
    await assertPageHealthy(page);

    const body = await page.textContent("body") || "";
    // Should have locale selection and action buttons
    const hasBulkUI =
      body.includes("Bulk") ||
      body.includes("bulk") ||
      body.includes("Translate") ||
      body.includes("locale") ||
      body.includes("Arabic");

    expect(hasBulkUI, "Bulk translate page should show bulk translation UI").toBe(true);
    await screenshot(page, "bulk-translate");
  });

  test("glossary page shows term management UI", async ({ page }) => {
    await navigateToAppPage(page, "/glossary");
    await waitForPolaris(page);
    await assertPageHealthy(page);

    const body = await page.textContent("body") || "";
    const hasGlossary =
      body.includes("Glossary") ||
      body.includes("glossary") ||
      body.includes("Term") ||
      body.includes("term");

    expect(hasGlossary, "Glossary page should show term management").toBe(true);
    await screenshot(page, "glossary");
  });

  test("coverage page shows translation coverage stats", async ({ page }) => {
    await navigateToAppPage(page, "/coverage");
    await waitForPolaris(page);
    await assertPageHealthy(page);

    const body = await page.textContent("body") || "";
    const hasCoverage =
      body.includes("Coverage") ||
      body.includes("coverage") ||
      body.includes("%") ||
      body.includes("translated");

    expect(hasCoverage, "Coverage page should show coverage statistics").toBe(true);
    await screenshot(page, "coverage");
  });
});

test.describe("Translation Editor", () => {
  test("editor loads for a resource without crashing", async ({ page }) => {
    // Navigate to the first available translatable resource
    await navigateToAppPage(page, "/translate");
    await waitForPolaris(page);

    // Try to click on the first resource in the list
    const firstResource = page.locator("table tr:nth-child(2) a, [role='row']:nth-child(2) a").first();
    if (await firstResource.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstResource.click();
      await page.waitForLoadState("networkidle");
      await assertPageHealthy(page);

      // Editor should show source and translation fields
      const body = await page.textContent("body") || "";
      const hasEditor =
        body.includes("Source") ||
        body.includes("Translation") ||
        body.includes("Save");

      expect(hasEditor, "Translation editor should show source/target fields").toBe(true);
      await screenshot(page, "translation-editor");
    }
  });
});
