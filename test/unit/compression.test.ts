import { brotliDecompressSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import {
  acceptsBrotli,
  acceptsEncoding,
  applyBrotliHeaders,
  applyEncodingHeaders,
  BROTLI_QUALITY,
  compressWithBrotli,
  COMPRESSIBLE_CONTENT_TYPES,
  COMPRESSION_LEVELS,
  createBrotliCompressionStream,
  ENCODING_PRIORITY,
  generateVaryHeader,
  getCompressionLevel,
  getContentEncodingHeader,
  getExpectedCompressionRatio,
  getSupportedEncodings,
  isCompressibleContentType,
  MAX_COMPRESSION_SIZE,
  MIN_COMPRESSION_SIZE,
  NON_COMPRESSIBLE_CONTENT_TYPES,
  parseAcceptEncoding,
  selectEncoding,
  shouldCompress,
  shouldCompressResponse,
  shouldUseBrotliCompression,
} from "../../app/services/performance/compression";

describe("Compression Service", () => {
  describe("Content Type Detection", () => {
    it("recognizes compressible text content types", () => {
      expect(isCompressibleContentType("text/html; charset=utf-8")).toBe(true);
      expect(isCompressibleContentType("text/css")).toBe(true);
      expect(isCompressibleContentType("application/javascript")).toBe(true);
      expect(isCompressibleContentType("application/json")).toBe(true);
      expect(isCompressibleContentType("application/xml")).toBe(true);
      expect(isCompressibleContentType("image/svg+xml")).toBe(true);
    });

    it("rejects non-compressible binary content types", () => {
      expect(isCompressibleContentType("image/png")).toBe(false);
      expect(isCompressibleContentType("image/jpeg")).toBe(false);
      expect(isCompressibleContentType("video/mp4")).toBe(false);
      expect(isCompressibleContentType("audio/mpeg")).toBe(false);
      expect(isCompressibleContentType("application/zip")).toBe(false);
      expect(isCompressibleContentType("application/pdf")).toBe(false);
      expect(isCompressibleContentType("font/woff2")).toBe(false);
    });

    it("handles null or empty content types", () => {
      expect(isCompressibleContentType(null)).toBe(false);
      expect(isCompressibleContentType("")).toBe(false);
    });

    it("exports content type constants", () => {
      expect(COMPRESSIBLE_CONTENT_TYPES).toContain("text/");
      expect(COMPRESSIBLE_CONTENT_TYPES).toContain("application/javascript");
      expect(NON_COMPRESSIBLE_CONTENT_TYPES).toContain("image/");
      expect(NON_COMPRESSIBLE_CONTENT_TYPES).toContain("video/");
    });
  });

  describe("Accept-Encoding Parsing", () => {
    it("parses simple Accept-Encoding header", () => {
      const result = parseAcceptEncoding("gzip, deflate, br");
      expect(result).toHaveLength(3);
      expect(result[0].encoding).toBe("br");
      expect(result[1].encoding).toBe("gzip");
      expect(result[2].encoding).toBe("deflate");
    });

    it("parses Accept-Encoding with quality values", () => {
      const result = parseAcceptEncoding("br;q=1.0, gzip;q=0.8, deflate;q=0.6");
      expect(result[0].encoding).toBe("br");
      expect(result[0].quality).toBe(1);
      expect(result[1].encoding).toBe("gzip");
      expect(result[1].quality).toBe(0.8);
      expect(result[2].encoding).toBe("deflate");
      expect(result[2].quality).toBe(0.6);
    });

    it("handles wildcard encoding", () => {
      const result = parseAcceptEncoding("gzip, *;q=0.1");
      expect(result.some((p) => p.encoding === "br")).toBe(true);
      expect(result.some((p) => p.encoding === "deflate")).toBe(true);
    });

    it("handles empty or null Accept-Encoding", () => {
      const result = parseAcceptEncoding(null);
      expect(result).toHaveLength(1);
      expect(result[0].encoding).toBe("identity");
      expect(result[0].quality).toBe(1);
    });

    it("sorts by quality then by encoding priority", () => {
      const result = parseAcceptEncoding("gzip;q=0.9, br;q=0.9, deflate;q=0.5");
      expect(result[0].encoding).toBe("br"); // Same quality, higher priority
      expect(result[1].encoding).toBe("gzip");
      expect(result[2].encoding).toBe("deflate");
    });

    it("handles identity encoding explicitly", () => {
      const result = parseAcceptEncoding("identity;q=0.5");
      expect(result[0].encoding).toBe("identity");
      expect(result[0].quality).toBe(0.5);
    });
  });

  describe("Encoding Selection", () => {
    it("selects brotli when available", () => {
      expect(selectEncoding("gzip, deflate, br")).toBe("br");
    });

    it("selects gzip when brotli is not available", () => {
      expect(selectEncoding("gzip, deflate")).toBe("gzip");
    });

    it("selects deflate as fallback", () => {
      expect(selectEncoding("deflate")).toBe("deflate");
    });

    it("selects identity when no compression supported", () => {
      expect(selectEncoding("identity")).toBe("identity");
      expect(selectEncoding("")).toBe("identity");
      expect(selectEncoding(null)).toBe("identity");
    });

    it("respects quality values in selection", () => {
      expect(selectEncoding("br;q=0, gzip")).toBe("gzip");
      expect(selectEncoding("br;q=0.1, gzip;q=0.5")).toBe("gzip");
    });
  });

  describe("Encoding Support Checks", () => {
    it("detects brotli support", () => {
      expect(acceptsEncoding("gzip, deflate, br", "br")).toBe(true);
      expect(acceptsEncoding("gzip, deflate", "br")).toBe(false);
    });

    it("detects gzip support", () => {
      expect(acceptsEncoding("gzip, deflate, br", "gzip")).toBe(true);
      expect(acceptsEncoding("deflate, br", "gzip")).toBe(false);
    });

    it("detects deflate support", () => {
      expect(acceptsEncoding("gzip, deflate, br", "deflate")).toBe(true);
      expect(acceptsEncoding("gzip, br", "deflate")).toBe(false);
    });

    it("legacy acceptsBrotli function works", () => {
      expect(acceptsBrotli("gzip, deflate, br")).toBe(true);
      expect(acceptsBrotli("br;q=1.0, gzip;q=0.8")).toBe(true);
      expect(acceptsBrotli("gzip, deflate")).toBe(false);
      expect(acceptsBrotli(null)).toBe(false);
    });
  });

  describe("Should Compress Decision", () => {
    it("compresses text content above minimum size", () => {
      expect(shouldCompress("text/html", 2000)).toBe(true);
      expect(shouldCompress("application/json", 5000)).toBe(true);
    });

    it("does not compress content below minimum size", () => {
      expect(shouldCompress("text/html", 500)).toBe(false);
      expect(shouldCompress("text/html", MIN_COMPRESSION_SIZE - 1)).toBe(false);
    });

    it("does not compress content above maximum size", () => {
      expect(shouldCompress("text/html", MAX_COMPRESSION_SIZE + 1)).toBe(false);
    });

    it("does not compress non-compressible content types", () => {
      expect(shouldCompress("image/png", 5000)).toBe(false);
      expect(shouldCompress("application/zip", 5000)).toBe(false);
    });

    it("exports size constants", () => {
      expect(MIN_COMPRESSION_SIZE).toBe(1024);
      expect(MAX_COMPRESSION_SIZE).toBe(10 * 1024 * 1024);
    });
  });

  describe("Compression Level Recommendations", () => {
    it("returns default levels for unknown content types", () => {
      const levels = getCompressionLevel("application/unknown");
      expect(levels.brotli).toBe(BROTLI_QUALITY);
      expect(levels.gzip).toBe(6);
      expect(levels.deflate).toBe(6);
    });

    it("returns specific levels for CSS", () => {
      const levels = getCompressionLevel("text/css");
      expect(levels.brotli).toBe(7);
      expect(levels.gzip).toBe(9);
    });

    it("returns specific levels for JavaScript", () => {
      const levels = getCompressionLevel("application/javascript");
      expect(levels.brotli).toBe(7);
      expect(levels.gzip).toBe(9);
    });

    it("returns specific levels for HTML", () => {
      const levels = getCompressionLevel("text/html; charset=utf-8");
      expect(levels.brotli).toBe(4);
      expect(levels.gzip).toBe(6);
    });

    it("returns specific levels for JSON", () => {
      const levels = getCompressionLevel("application/json");
      expect(levels.brotli).toBe(6);
      expect(levels.gzip).toBe(8);
    });

    it("handles null content type gracefully", () => {
      const levels = getCompressionLevel(null);
      expect(levels.brotli).toBeDefined();
      expect(levels.gzip).toBeDefined();
      expect(levels.deflate).toBeDefined();
    });
  });

  describe("Vary Header Management", () => {
    it("generates Vary header with no existing header", () => {
      expect(generateVaryHeader(null)).toBe("Accept-Encoding");
      expect(generateVaryHeader("")).toBe("Accept-Encoding");
    });

    it("adds Accept-Encoding to existing Vary header", () => {
      expect(generateVaryHeader("Origin")).toBe("Origin, Accept-Encoding");
    });

    it("does not duplicate Accept-Encoding", () => {
      expect(generateVaryHeader("Accept-Encoding")).toBe("Accept-Encoding");
      expect(generateVaryHeader("Origin, Accept-Encoding")).toBe("Origin, Accept-Encoding");
    });

    it("handles case-insensitive matching", () => {
      expect(generateVaryHeader("accept-encoding")).toBe("accept-encoding");
      expect(generateVaryHeader("Origin, ACCEPT-ENCODING")).toBe("Origin, ACCEPT-ENCODING");
    });
  });

  describe("Encoding Headers Application", () => {
    it("applies brotli encoding headers", () => {
      const headers = new Headers({
        "Content-Length": "1024",
      });

      applyEncodingHeaders(headers, "br");

      expect(headers.get("Content-Encoding")).toBe("br");
      expect(headers.has("Content-Length")).toBe(false);
      expect(headers.get("Vary")).toBe("Accept-Encoding");
    });

    it("applies gzip encoding headers", () => {
      const headers = new Headers();

      applyEncodingHeaders(headers, "gzip");

      expect(headers.get("Content-Encoding")).toBe("gzip");
      expect(headers.get("Vary")).toBe("Accept-Encoding");
    });

    it("preserves existing Vary values", () => {
      const headers = new Headers({
        Vary: "Origin",
      });

      applyEncodingHeaders(headers, "deflate");

      expect(headers.get("Vary")).toBe("Origin, Accept-Encoding");
    });

    it("does not set Content-Encoding for identity", () => {
      const headers = new Headers();

      applyEncodingHeaders(headers, "identity");

      expect(headers.has("Content-Encoding")).toBe(false);
      expect(headers.get("Vary")).toBe("Accept-Encoding");
    });

    it("legacy applyBrotliHeaders works", () => {
      const headers = new Headers({
        Vary: "Origin",
        "Content-Length": "512",
      });

      applyBrotliHeaders(headers);

      expect(headers.get("Content-Encoding")).toBe("br");
      expect(headers.get("Vary")).toBe("Origin, Accept-Encoding");
      expect(headers.has("Content-Length")).toBe(false);
    });
  });

  describe("Content Encoding Header Value", () => {
    it("returns correct header values", () => {
      expect(getContentEncodingHeader("br")).toBe("br");
      expect(getContentEncodingHeader("gzip")).toBe("gzip");
      expect(getContentEncodingHeader("deflate")).toBe("deflate");
      expect(getContentEncodingHeader("identity")).toBe(null);
    });
  });

  describe("Expected Compression Ratios", () => {
    it("returns ratios for different content types", () => {
      expect(getExpectedCompressionRatio("text/css")).toBe(0.25);
      expect(getExpectedCompressionRatio("application/javascript")).toBe(0.25);
      expect(getExpectedCompressionRatio("text/html")).toBe(0.3);
      expect(getExpectedCompressionRatio("application/json")).toBe(0.35);
      expect(getExpectedCompressionRatio("text/plain")).toBe(0.4);
      expect(getExpectedCompressionRatio("image/svg+xml")).toBe(0.5);
    });

    it("returns 1 for unknown content types", () => {
      expect(getExpectedCompressionRatio("image/png")).toBe(1);
      expect(getExpectedCompressionRatio(null)).toBe(1);
    });
  });

  describe("Should Compress Response", () => {
    it("recommends compression for compressible content with brotli support", () => {
      const request = new Request("https://example.com", {
        headers: { "accept-encoding": "gzip, br" },
      });

      const result = shouldCompressResponse(request, "text/html", 2000);

      expect(result.shouldCompress).toBe(true);
      expect(result.encoding).toBe("br");
    });

    it("recommends gzip when brotli not supported", () => {
      const request = new Request("https://example.com", {
        headers: { "accept-encoding": "gzip, deflate" },
      });

      const result = shouldCompressResponse(request, "text/html", 2000);

      expect(result.shouldCompress).toBe(true);
      expect(result.encoding).toBe("gzip");
    });

    it("does not recommend compression for small content", () => {
      const request = new Request("https://example.com", {
        headers: { "accept-encoding": "gzip, br" },
      });

      const result = shouldCompressResponse(request, "text/html", 500);

      expect(result.shouldCompress).toBe(false);
      expect(result.encoding).toBe("identity");
    });

    it("does not recommend compression for non-compressible content", () => {
      const request = new Request("https://example.com", {
        headers: { "accept-encoding": "gzip, br" },
      });

      const result = shouldCompressResponse(request, "image/png", 5000);

      expect(result.shouldCompress).toBe(false);
      expect(result.encoding).toBe("identity");
    });

    it("does not recommend compression when client doesn't support it", () => {
      const request = new Request("https://example.com", {
        headers: { "accept-encoding": "identity" },
      });

      const result = shouldCompressResponse(request, "text/html", 2000);

      expect(result.shouldCompress).toBe(false);
      expect(result.encoding).toBe("identity");
    });
  });

  describe("Legacy Brotli Functions", () => {
    it("uses brotli only when the request supports it and content is compressible", () => {
      const request = new Request("https://example.com", {
        headers: { "accept-encoding": "gzip, br" },
      });

      expect(shouldUseBrotliCompression(request, "text/html")).toBe(true);
      expect(shouldUseBrotliCompression(request, "image/png")).toBe(false);
      expect(
        shouldUseBrotliCompression(new Request("https://example.com"), "text/html"),
      ).toBe(false);
    });

    it("skips compression for responses smaller than MIN_COMPRESSION_SIZE", () => {
      const request = new Request("https://example.com", {
        headers: { "accept-encoding": "gzip, br" },
      });

      expect(shouldUseBrotliCompression(request, "text/html", 500)).toBe(false);
      expect(shouldUseBrotliCompression(request, "text/html", MIN_COMPRESSION_SIZE)).toBe(true);
      expect(shouldUseBrotliCompression(request, "text/html", 2000)).toBe(true);
    });
  });

  describe("Brotli Compression", () => {
    it("compresses text that can be round-tripped with Brotli", () => {
      const input = "RTL storefront translations should compress well with Brotli.";
      const compressed = compressWithBrotli(input);
      const decompressed = brotliDecompressSync(compressed).toString("utf8");

      expect(compressed.byteLength).toBeGreaterThan(0);
      expect(decompressed).toBe(input);
    });

    it("exports quality constant", () => {
      expect(BROTLI_QUALITY).toBe(5);
      expect(MIN_COMPRESSION_SIZE).toBe(1024);
    });

    it("creates brotli compression stream", () => {
      const stream = createBrotliCompressionStream();
      expect(stream).toBeDefined();
      stream.destroy();
    });
  });

  describe("Utility Functions", () => {
    it("exports encoding priority array", () => {
      expect(ENCODING_PRIORITY).toContain("br");
      expect(ENCODING_PRIORITY).toContain("gzip");
      expect(ENCODING_PRIORITY).toContain("deflate");
      expect(ENCODING_PRIORITY).toContain("identity");
    });

    it("returns supported encodings list", () => {
      const encodings = getSupportedEncodings();
      expect(encodings).toContain("br");
      expect(encodings).toContain("gzip");
      expect(encodings).toContain("deflate");
      expect(encodings).not.toContain("identity");
    });
  });
});
