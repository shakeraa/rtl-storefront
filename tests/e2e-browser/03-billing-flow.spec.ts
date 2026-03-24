import { test, expect } from "@playwright/test";
import {
  navigateToAppPage,
  assertPageHealthy,
  waitForPolaris,
  screenshot,
} from "./helpers";

test.describe("Billing Flow", () => {
  test("billing page shows pricing plans", async ({ page }) => {
    await navigateToAppPage(page, "/billing");
    await waitForPolaris(page);
    await assertPageHealthy(page);

    const body = await page.textContent("body") || "";

    // Should show at least one plan
    const hasPlans =
      body.includes("Starter") ||
      body.includes("Professional") ||
      body.includes("Enterprise") ||
      body.includes("plan") ||
      body.includes("Plan");

    expect(hasPlans, "Billing page should show pricing plans").toBe(true);
    await screenshot(page, "billing-plans");
  });

  test("billing page shows pricing amounts", async ({ page }) => {
    await navigateToAppPage(page, "/billing");
    await waitForPolaris(page);

    const body = await page.textContent("body") || "";

    // Should show dollar amounts
    const hasPricing =
      body.includes("$") ||
      body.includes("month") ||
      body.includes("mo") ||
      body.includes("free") ||
      body.includes("Free");

    expect(hasPricing, "Billing page should show pricing").toBe(true);
  });

  test("billing page has subscribe buttons", async ({ page }) => {
    await navigateToAppPage(page, "/billing");
    await waitForPolaris(page);

    // Look for action buttons
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();

    expect(buttonCount, "Billing page should have action buttons").toBeGreaterThan(0);
    await screenshot(page, "billing-buttons");
  });

  test("billing page does not show error param as raw text", async ({ page }) => {
    // Test the XSS fix — error param should be validated against allowlist
    await navigateToAppPage(page, "/billing?error=<script>alert(1)</script>");
    await waitForPolaris(page);

    const body = await page.textContent("body") || "";

    // The script tag should NOT appear in the page
    expect(body).not.toContain("<script>");
    expect(body).not.toContain("alert(1)");

    // Should show generic error or no error (unknown key rejected)
    if (body.includes("error") || body.includes("Error")) {
      expect(body).toContain("An error occurred");
    }
  });
});
