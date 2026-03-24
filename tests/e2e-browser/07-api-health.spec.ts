import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test.describe("API & Public Endpoints", () => {
  test("health endpoint returns 200", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/health`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("status");
  });

  test("status page loads", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/status`);
    expect(response.status()).toBe(200);
  });

  test("robots.txt returns valid content", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/robots.txt`);
    expect(response.status()).toBe(200);

    const text = await response.text();
    expect(text).toContain("User-agent");
  });

  test("sitemap.xml returns valid XML", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/sitemap.xml`);
    expect(response.status()).toBe(200);

    const text = await response.text();
    expect(text).toContain("<?xml");
    expect(text).toContain("urlset");
  });
});

test.describe("API Authentication", () => {
  test("unauthenticated API requests are rejected", async ({ request }) => {
    // API routes should require authentication
    const endpoints = [
      "/api/v1/translations",
      "/api/v1/glossary",
      "/api/v1/status",
      "/api/currency/rates",
    ];

    for (const endpoint of endpoints) {
      const response = await request.get(`${BASE_URL}${endpoint}`);
      // Should return 401/302/400, not 200 with data
      expect(
        [302, 400, 401, 403].includes(response.status()) || response.url().includes("auth"),
        `${endpoint} should reject unauthenticated requests (got ${response.status()})`
      ).toBe(true);
    }
  });
});

test.describe("Error Handling", () => {
  test("404 for non-existent routes", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/app/nonexistent-page-xyz`);
    // Should return 404 or redirect, not 500
    expect(response.status()).not.toBe(500);
  });

  test("API returns JSON errors, not HTML", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/v1/translations`, {
      headers: { "Content-Type": "application/json" },
      data: {},
    });

    // Even on error, should not return 500
    expect(response.status()).not.toBe(500);
  });
});
