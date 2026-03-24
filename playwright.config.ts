import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E test configuration for rtl-storefront.
 *
 * These tests run against the actual Shopify embedded app.
 * Set BASE_URL to your app's URL (local dev or deployed).
 *
 * Usage:
 *   npx playwright test                    # run all E2E tests
 *   npx playwright test --headed           # run with visible browser
 *   npx playwright test --ui               # interactive UI mode
 *   npx playwright test tests/e2e-browser  # run specific directory
 */
export default defineConfig({
  testDir: "./tests/e2e-browser",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { open: "never" }],
    ["list"],
  ],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Don't start the dev server automatically — Shopify CLI manages it
  // webServer: { command: "npm run dev", url: "http://localhost:3000" },
});
