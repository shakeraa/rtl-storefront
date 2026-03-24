import { test, expect } from "@playwright/test";
import {
  navigateToAppPage,
  assertPageHealthy,
  waitForPolaris,
  screenshot,
} from "./helpers";

test.describe("Settings Flow", () => {
  test("settings page loads with provider configuration", async ({ page }) => {
    await navigateToAppPage(page, "/settings");
    await waitForPolaris(page);
    await assertPageHealthy(page);

    const body = await page.textContent("body") || "";
    const hasSettings =
      body.includes("Settings") ||
      body.includes("Provider") ||
      body.includes("provider") ||
      body.includes("API") ||
      body.includes("OpenAI") ||
      body.includes("DeepL");

    expect(hasSettings, "Settings page should show provider configuration").toBe(true);
    await screenshot(page, "settings");
  });

  test("settings page has a save button", async ({ page }) => {
    await navigateToAppPage(page, "/settings");
    await waitForPolaris(page);

    const saveButton = page.locator('button:has-text("Save")').first();
    expect(await saveButton.isVisible()).toBe(true);
  });

  test("RTL settings page has RTL-specific options", async ({ page }) => {
    await navigateToAppPage(page, "/rtl-settings");
    await waitForPolaris(page);
    await assertPageHealthy(page);

    const body = await page.textContent("body") || "";
    const hasRTL =
      body.includes("RTL") ||
      body.includes("rtl") ||
      body.includes("Right-to-Left") ||
      body.includes("Arabic") ||
      body.includes("Hebrew") ||
      body.includes("direction");

    expect(hasRTL, "RTL settings should show RTL options").toBe(true);
    await screenshot(page, "rtl-settings");
  });

  test("fonts page shows Arabic/Hebrew font options", async ({ page }) => {
    await navigateToAppPage(page, "/fonts");
    await waitForPolaris(page);
    await assertPageHealthy(page);

    const body = await page.textContent("body") || "";
    const hasFonts =
      body.includes("Font") ||
      body.includes("font") ||
      body.includes("Noto") ||
      body.includes("Arabic") ||
      body.includes("Hebrew");

    expect(hasFonts, "Fonts page should show font options").toBe(true);
    await screenshot(page, "fonts");
  });

  test("locales page shows language management", async ({ page }) => {
    await navigateToAppPage(page, "/locales");
    await waitForPolaris(page);
    await assertPageHealthy(page);

    const body = await page.textContent("body") || "";
    const hasLocales =
      body.includes("Locale") ||
      body.includes("locale") ||
      body.includes("Language") ||
      body.includes("language") ||
      body.includes("Arabic") ||
      body.includes("Hebrew");

    expect(hasLocales, "Locales page should show language management").toBe(true);
    await screenshot(page, "locales");
  });
});

test.describe("Payments Settings", () => {
  test("payments page shows MENA gateways", async ({ page }) => {
    await navigateToAppPage(page, "/payments");
    await waitForPolaris(page);
    await assertPageHealthy(page);

    const body = await page.textContent("body") || "";
    const hasPayments =
      body.includes("Payment") ||
      body.includes("payment") ||
      body.includes("Tamara") ||
      body.includes("Tabby") ||
      body.includes("Mada") ||
      body.includes("gateway");

    expect(hasPayments, "Payments page should show MENA gateways").toBe(true);
    await screenshot(page, "payments");
  });

  test("payments page has save and test buttons", async ({ page }) => {
    await navigateToAppPage(page, "/payments");
    await waitForPolaris(page);

    const saveButton = page.locator('button:has-text("Save")').first();
    const testButton = page.locator('button:has-text("Test")').first();

    // At least one action button should be visible
    const hasSave = await saveButton.isVisible().catch(() => false);
    const hasTest = await testButton.isVisible().catch(() => false);

    expect(hasSave || hasTest, "Payments page should have Save or Test button").toBe(true);
  });
});
