import { describe, expect, it } from "vitest";
import { createISRHeaders, mergeISRHeaders } from "../../app/services/performance/isr";

describe("ISR headers", () => {
  it("builds cache headers from the cache strategy", () => {
    const headers = createISRHeaders({
      contentType: "static-page",
      locale: "ar",
      tags: ["route:index"],
    });

    expect(headers.get("Cache-Control")).toBe(
      "public, max-age=0, s-maxage=86400, stale-while-revalidate=172800",
    );
    expect(headers.get("Vary")).toBe("Accept-Language");
    expect(headers.get("X-ISR")).toBe("enabled");
    expect(headers.get("X-ISR-Tier")).toBe("cdn");
    expect(headers.get("X-ISR-Tags")).toBe(
      "route:index,content:static-page,locale:ar",
    );
  });

  it("merges ISR headers into an existing headers object", () => {
    const headers = mergeISRHeaders(
      new Headers({ "Content-Type": "application/json" }),
      {
        contentType: "dynamic-fragment",
        locale: "en",
        revalidateSeconds: 120,
        staleWhileRevalidateSeconds: 600,
      },
    );

    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("Cache-Control")).toBe(
      "public, max-age=0, s-maxage=120, stale-while-revalidate=600",
    );
    expect(headers.get("X-ISR-Tier")).toBe("memory");
  });
});
