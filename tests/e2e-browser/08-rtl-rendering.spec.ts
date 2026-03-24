import { test, expect } from "@playwright/test";
import {
  navigateToAppPage,
  assertPageHealthy,
  waitForPolaris,
  screenshot,
} from "./helpers";

test.describe("RTL Rendering", () => {
  test("RTL preview page renders without layout issues", async ({ page }) => {
    await navigateToAppPage(page, "/rtl-preview");
    await waitForPolaris(page);
    await assertPageHealthy(page);

    // Check for RTL-specific attributes
    const htmlDir = await page.getAttribute("html", "dir");
    const bodyDir = await page.locator("[dir='rtl']").count();

    // The page itself may be LTR (admin), but should contain RTL preview content
    const body = await page.textContent("body") || "";
    const hasRTLContent =
      body.includes("RTL") ||
      body.includes("rtl") ||
      body.includes("Preview") ||
      body.includes("preview") ||
      bodyDir > 0;

    expect(hasRTLContent, "RTL preview should show RTL content").toBe(true);
    await screenshot(page, "rtl-preview");
  });

  test("language switcher page loads", async ({ page }) => {
    await navigateToAppPage(page, "/language-switcher");
    await waitForPolaris(page);
    await assertPageHealthy(page);

    const body = await page.textContent("body") || "";
    const hasLanguage =
      body.includes("Language") ||
      body.includes("language") ||
      body.includes("Switcher") ||
      body.includes("switcher");

    expect(hasLanguage, "Language switcher page should load").toBe(true);
    await screenshot(page, "language-switcher");
  });
});

test.describe("Accessibility Basics", () => {
  test("all pages have a main heading", async ({ page }) => {
    const criticalPages = [
      "/billing",
      "/settings",
      "/translate",
      "/glossary",
      "/team",
    ];

    for (const path of criticalPages) {
      await navigateToAppPage(page, path);
      await waitForPolaris(page);

      // Should have at least one heading element
      const headingCount = await page.locator("h1, h2, [role='heading']").count();
      expect(
        headingCount,
        `Page ${path} should have at least one heading`
      ).toBeGreaterThan(0);
    }
  });

  test("interactive elements are keyboard-focusable", async ({ page }) => {
    await navigateToAppPage(page, "/settings");
    await waitForPolaris(page);

    // Tab through the page
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Something should be focused
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedTag).toBeTruthy();
    expect(["BUTTON", "INPUT", "SELECT", "TEXTAREA", "A", "DIV"]).toContain(focusedTag);
  });

  test("images have alt attributes", async ({ page }) => {
    await navigateToAppPage(page, "");
    await waitForPolaris(page);

    const images = page.locator("img");
    const imageCount = await images.count();

    for (let i = 0; i < Math.min(imageCount, 10); i++) {
      const alt = await images.nth(i).getAttribute("alt");
      // Images should have alt attribute (can be empty for decorative)
      expect(alt, `Image ${i} should have alt attribute`).not.toBeNull();
    }
  });
});
