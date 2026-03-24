import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@remix-run/react", () => ({
  Links: () => null,
  Meta: () => null,
  Outlet: () => null,
  Scripts: () => null,
  ScrollRestoration: () => null,
}));

describe("Root RTL document", () => {
  it("renders html with default lang and dir attributes", async () => {
    const { default: App } = await import("../../app/root");
    const view = renderToStaticMarkup(<App />);

    expect(view).toContain('lang="en"');
    expect(view).toContain('dir="ltr"');
    expect(view).toContain("cdn.shopify.com");
  });
});
