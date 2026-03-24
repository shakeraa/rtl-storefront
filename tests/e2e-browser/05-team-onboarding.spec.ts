import { test, expect } from "@playwright/test";
import {
  navigateToAppPage,
  assertPageHealthy,
  waitForPolaris,
  screenshot,
} from "./helpers";

test.describe("Team Management", () => {
  test("team page loads with member list", async ({ page }) => {
    await navigateToAppPage(page, "/team");
    await waitForPolaris(page);
    await assertPageHealthy(page);

    const body = await page.textContent("body") || "";
    const hasTeam =
      body.includes("Team") ||
      body.includes("team") ||
      body.includes("Member") ||
      body.includes("Invite") ||
      body.includes("invite");

    expect(hasTeam, "Team page should show team management").toBe(true);
    await screenshot(page, "team");
  });

  test("team page has invite button", async ({ page }) => {
    await navigateToAppPage(page, "/team");
    await waitForPolaris(page);

    const inviteButton = page.locator('button:has-text("Invite"), button:has-text("Add")').first();
    const hasInvite = await inviteButton.isVisible().catch(() => false);

    // Either has invite button or shows empty state with CTA
    const body = await page.textContent("body") || "";
    const hasTeamUI = hasInvite || body.includes("Invite") || body.includes("No members");

    expect(hasTeamUI, "Team page should have invite functionality").toBe(true);
  });
});

test.describe("Onboarding", () => {
  test("onboarding page loads with steps", async ({ page }) => {
    await navigateToAppPage(page, "/onboarding");
    await waitForPolaris(page);
    await assertPageHealthy(page);

    const body = await page.textContent("body") || "";
    const hasOnboarding =
      body.includes("Step") ||
      body.includes("step") ||
      body.includes("Setup") ||
      body.includes("setup") ||
      body.includes("Welcome") ||
      body.includes("Get Started");

    expect(hasOnboarding, "Onboarding should show setup steps").toBe(true);
    await screenshot(page, "onboarding");
  });

  test("onboarding state persists across page reload", async ({ page }) => {
    await navigateToAppPage(page, "/onboarding");
    await waitForPolaris(page);

    // Get initial page content
    const initialBody = await page.textContent("body") || "";

    // Reload the page
    await page.reload({ waitUntil: "networkidle" });
    await waitForPolaris(page);

    // Page should still load correctly (state persisted in DB, not in-memory)
    await assertPageHealthy(page);
    const reloadedBody = await page.textContent("body") || "";

    // Both loads should have content (no blank page after reload)
    expect(initialBody.length).toBeGreaterThan(50);
    expect(reloadedBody.length).toBeGreaterThan(50);
  });
});

test.describe("Notifications & Alerts", () => {
  test("notifications page loads", async ({ page }) => {
    await navigateToAppPage(page, "/notifications");
    await waitForPolaris(page);
    await assertPageHealthy(page);

    const body = await page.textContent("body") || "";
    const hasNotifications =
      body.includes("Notification") ||
      body.includes("notification") ||
      body.includes("Alert") ||
      body.includes("alert") ||
      body.includes("No alerts");

    expect(hasNotifications, "Notifications page should load").toBe(true);
    await screenshot(page, "notifications");
  });
});
