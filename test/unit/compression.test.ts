import { brotliDecompressSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import {
  acceptsBrotli,
  applyBrotliHeaders,
  compressWithBrotli,
  isCompressibleContentType,
  shouldUseBrotliCompression,
} from "../../app/services/performance/compression";

describe("Brotli compression", () => {
  it("detects brotli support from Accept-Encoding", () => {
    expect(acceptsBrotli("gzip, deflate, br")).toBe(true);
    expect(acceptsBrotli("br;q=1.0, gzip;q=0.8")).toBe(true);
    expect(acceptsBrotli("gzip, deflate")).toBe(false);
    expect(acceptsBrotli(null)).toBe(false);
  });

  it("recognizes compressible asset content types", () => {
    expect(isCompressibleContentType("text/html; charset=utf-8")).toBe(true);
    expect(isCompressibleContentType("text/css")).toBe(true);
    expect(isCompressibleContentType("application/javascript")).toBe(true);
    expect(isCompressibleContentType("application/json")).toBe(true);
    expect(isCompressibleContentType("image/png")).toBe(false);
  });

  it("uses brotli only when the request supports it and content is compressible", () => {
    const request = new Request("https://example.com", {
      headers: {
        "accept-encoding": "gzip, br",
      },
    });

    expect(shouldUseBrotliCompression(request, "text/html")).toBe(true);
    expect(shouldUseBrotliCompression(request, "image/png")).toBe(false);
    expect(
      shouldUseBrotliCompression(new Request("https://example.com"), "text/html"),
    ).toBe(false);
  });

  it("applies brotli headers and preserves existing Vary values", () => {
    const headers = new Headers({
      Vary: "Origin",
      "Content-Length": "512",
    });

    applyBrotliHeaders(headers);

    expect(headers.get("Content-Encoding")).toBe("br");
    expect(headers.get("Vary")).toBe("Origin, Accept-Encoding");
    expect(headers.has("Content-Length")).toBe(false);
  });

  it("compresses text that can be round-tripped with Brotli", () => {
    const input = "RTL storefront translations should compress well with Brotli.";
    const compressed = compressWithBrotli(input);
    const decompressed = brotliDecompressSync(compressed).toString("utf8");

    expect(compressed.byteLength).toBeGreaterThan(0);
    expect(decompressed).toBe(input);
  });
});
