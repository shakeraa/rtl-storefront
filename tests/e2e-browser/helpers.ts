import { type Page, expect } from "@playwright/test";

/**
 * Shopify embedded apps require OAuth. These helpers handle the auth flow
 * and provide utilities for navigating the admin UI.
 *
 * For local testing: set SHOPIFY_TEST_STORE and SHOPIFY_TEST_TOKEN env vars
 * For CI: use the app's direct URL with test session cookies
 */

export const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
export const TEST_STORE = process.env.SHOPIFY_TEST_STORE || "test-store.myshopify.com";

/**
 * Navigate to an app page within the Shopify admin embed.
 * Handles the Shopify OAuth redirect if needed.
 */
export async function navigateToAppPage(page: Page, path: string) {
  const url = `${BASE_URL}/app${path}`;
  await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });

  // If redirected to Shopify OAuth, we're in an unauthenticated state
  // For E2E tests, we expect the app to be accessible
  const currentUrl = page.url();
  if (currentUrl.includes("/auth") || currentUrl.includes("accounts.shopify.com")) {
    throw new Error(
      `Redirected to auth (${currentUrl}). ` +
      "Ensure the app is running with an authenticated session. " +
      "Run: npm run dev, then authenticate via Shopify Partners dashboard."
    );
  }
}

/**
 * Wait for the Polaris UI to be fully loaded.
 */
export async function waitForPolaris(page: Page) {
  // Polaris renders inside the app frame
  await page.waitForSelector('[class*="Polaris"]', { timeout: 10000 }).catch(() => {
    // Some pages may not use Polaris components directly
  });
}

/**
 * Check that a page loaded without crashing.
 * Verifies no error boundaries, 500 pages, or blank screens.
 */
export async function assertPageHealthy(page: Page) {
  // No error boundary rendered
  const errorBoundary = page.locator("text=Something went wrong");
  const hasError = await errorBoundary.isVisible().catch(() => false);
  expect(hasError, "Error boundary should not be visible").toBe(false);

  // No 500/404 error pages
  const body = await page.textContent("body") || "";
  expect(body).not.toContain("Internal Server Error");
  expect(body).not.toContain("404 Not Found");

  // Page has actual content (not blank)
  expect(body.length).toBeGreaterThan(50);
}

/**
 * Assert that a Polaris Page component rendered with a title.
 */
export async function assertPageTitle(page: Page, expectedTitle: string) {
  const title = page.locator(`h1:has-text("${expectedTitle}"), [class*="Header"] h1`).first();
  await expect(title).toBeVisible({ timeout: 5000 });
}

/**
 * Click a Polaris Button by its text label.
 */
export async function clickButton(page: Page, label: string) {
  const button = page.locator(`button:has-text("${label}")`).first();
  await expect(button).toBeVisible({ timeout: 5000 });
  await button.click();
}

/**
 * Check that no console errors were logged during page load.
 * Returns collected errors for assertion.
 */
export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });
  return errors;
}

/**
 * Take a labeled screenshot for test evidence.
 */
export async function screenshot(page: Page, name: string) {
  await page.screenshot({
    path: `tests/e2e-browser/screenshots/${name}.png`,
    fullPage: true,
  });
}
