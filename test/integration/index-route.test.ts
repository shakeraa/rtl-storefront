import { describe, expect, it, vi } from "vitest";

vi.mock("../../app/shopify.server", () => ({
  login: true,
}));

const { loader } = await import("../../app/routes/_index/route");

describe("marketing index route", () => {
  it("returns ISR headers for translated landing-page requests", async () => {
    const response = await loader({
      request: new Request("https://example.com/?contentLocale=ar"),
      params: {},
      context: {},
    });

    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=0, s-maxage=86400, stale-while-revalidate=172800",
    );
    expect(response.headers.get("X-ISR")).toBe("enabled");
    expect(response.headers.get("X-ISR-Tags")).toBe(
      "route:index,page:landing,content:static-page,locale:ar",
    );
    await expect(response.json()).resolves.toEqual({ showForm: true });
  });
});
