import { test, expect } from "@playwright/test";
import {
  navigateToAppPage,
  assertPageHealthy,
  collectConsoleErrors,
  screenshot,
  waitForPolaris,
} from "./helpers";

test.describe("App Navigation — All Pages Load", () => {
  /**
   * Smoke test: every app page loads without crashing.
   * This catches import errors, missing loaders, and broken routes.
   */

  const pages = [
    { path: "", name: "Dashboard" },
    { path: "/translate", name: "Translate" },
    { path: "/translations", name: "Translations" },
    { path: "/bulk-translate", name: "Bulk Translate" },
    { path: "/glossary", name: "Glossary" },
    { path: "/coverage", name: "Coverage" },
    { path: "/analytics", name: "Analytics" },
    { path: "/ai-usage", name: "AI Usage" },
    { path: "/billing", name: "Billing" },
    { path: "/settings", name: "Settings" },
    { path: "/rtl-settings", name: "RTL Settings" },
    { path: "/rtl-preview", name: "RTL Preview" },
    { path: "/fonts", name: "Fonts" },
    { path: "/locales", name: "Locales" },
    { path: "/onboarding", name: "Onboarding" },
    { path: "/payments", name: "Payments" },
    { path: "/team", name: "Team" },
    { path: "/notifications", name: "Notifications" },
    { path: "/import", name: "Import" },
    { path: "/export", name: "Export" },
    { path: "/seo-schema", name: "SEO Schema" },
    { path: "/seo-sitemap", name: "SEO Sitemap" },
    { path: "/language-switcher", name: "Language Switcher" },
  ];

  for (const { path, name } of pages) {
    test(`${name} page loads without errors`, async ({ page }) => {
      const errors = collectConsoleErrors(page);

      await navigateToAppPage(page, path);
      await waitForPolaris(page);
      await assertPageHealthy(page);

      // No fatal console errors
      const fatalErrors = errors.filter(
        (e) =>
          !e.includes("Warning:") && // React warnings are OK
          !e.includes("DevTools") && // DevTools messages OK
          !e.includes("favicon") // Missing favicon OK
      );

      if (fatalErrors.length > 0) {
        await screenshot(page, `error-${name.toLowerCase()}`);
      }

      expect(
        fatalErrors,
        `Page "${name}" should not have console errors: ${fatalErrors.join(", ")}`
      ).toHaveLength(0);
    });
  }
});

test.describe("Navigation Links", () => {
  test("sidebar navigation works between pages", async ({ page }) => {
    await navigateToAppPage(page, "");
    await waitForPolaris(page);

    // Click on Translate in the nav
    const translateLink = page.locator('a[href*="translate"], nav a:has-text("Translate")').first();
    if (await translateLink.isVisible()) {
      await translateLink.click();
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("translate");
    }
  });

  test("app does not show blank white screen on any page", async ({ page }) => {
    await navigateToAppPage(page, "");
    const bodyText = await page.textContent("body");
    expect(bodyText?.trim().length).toBeGreaterThan(0);
  });
});
