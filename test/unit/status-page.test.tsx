import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@remix-run/react", () => ({
  useLoaderData: () => ({
    service: "rtl-storefront",
    status: "operational",
    updatedAt: "2026-03-22T20:00:00.000Z",
    components: [
      {
        name: "Admin app",
        status: "operational",
        description: "Embedded Shopify admin experience",
      },
    ],
  }),
}));

const { getPublicStatusPageData } = await import("../../app/services/system/status");
const { loader, default: StatusPage } = await import("../../app/routes/status");

describe("status page", () => {
  it("builds public status data", () => {
    const data = getPublicStatusPageData();

    expect(data.service).toBe("rtl-storefront");
    expect(data.status).toBe("operational");
    expect(data.components.length).toBeGreaterThan(0);
  });

  it("returns cacheable public status data", async () => {
    const response = await loader({
      request: new Request("https://example.com/status"),
      params: {},
      context: {},
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("public, max-age=60");
    await expect(response.json()).resolves.toMatchObject({
      service: "rtl-storefront",
      status: "operational",
    });
  });

  it("renders the status page", () => {
    render(<StatusPage />);

    expect(screen.getByRole("heading", { level: 1, name: "rtl-storefront" })).toBeInTheDocument();
    expect(screen.getByText("Current status:")).toBeInTheDocument();
    expect(screen.getByText("Admin app")).toBeInTheDocument();
  });
});
