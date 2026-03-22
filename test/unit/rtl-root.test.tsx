import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useLoaderData = vi.fn();

vi.mock("@remix-run/react", () => ({
  Links: () => null,
  Meta: () => null,
  Outlet: () => null,
  Scripts: () => null,
  ScrollRestoration: () => null,
  useLoaderData: () => useLoaderData(),
}));

describe("Root RTL document", () => {
  beforeEach(() => {
    useLoaderData.mockReset();
  });

  it("renders html direction attributes and RTL theme stylesheet", async () => {
    useLoaderData.mockReturnValue({
      htmlAttributes: {
        lang: "ar",
        dir: "rtl",
        className: "app-shell locale-ar dir-rtl directionality-mixed",
        dataLocale: "ar",
        dataDirectionality: "mixed",
      },
      injectRTLStyles: true,
    });

    const { default: App } = await import("../../app/root");
    const view = renderToStaticMarkup(<App />);

    expect(view).toContain('lang="ar"');
    expect(view).toContain('dir="rtl"');
    expect(view).toContain('data-directionality="mixed"');
    expect(view).toContain('href="/rtl-themes/default.css"');
  });
});
