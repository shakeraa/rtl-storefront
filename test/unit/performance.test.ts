/**
 * T0015 — Performance: Redis cache client, edge caching, font loader, cache middleware
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";

// ---------------------------------------------------------------------------
// redis.ts — CacheClient
// ---------------------------------------------------------------------------
import {
  createCacheClient,
  resetCacheClient,
  type CacheClient,
} from "../../app/services/cache/redis";

describe("createCacheClient (in-memory fallback)", () => {
  beforeEach(() => {
    resetCacheClient();
    // Ensure REDIS_URL is absent so the in-memory fallback is used
    delete process.env.REDIS_URL;
  });

  afterEach(() => {
    resetCacheClient();
  });

  it("returns a CacheClient instance", () => {
    const client: CacheClient = createCacheClient();
    expect(typeof client.get).toBe("function");
    expect(typeof client.set).toBe("function");
    expect(typeof client.del).toBe("function");
  });

  it("returns the same singleton on repeated calls", () => {
    const a = createCacheClient();
    const b = createCacheClient();
    expect(a).toBe(b);
  });

  it("get returns null for a missing key", async () => {
    const client = createCacheClient();
    const result = await client.get("nonexistent");
    expect(result).toBeNull();
  });

  it("set then get round-trips a string value", async () => {
    const client = createCacheClient();
    await client.set("greeting", "hello");
    const result = await client.get("greeting");
    expect(result).toBe("hello");
  });

  it("del removes an entry", async () => {
    const client = createCacheClient();
    await client.set("to-delete", "value");
    await client.del("to-delete");
    const result = await client.get("to-delete");
    expect(result).toBeNull();
  });

  it("entry expires after TTL", async () => {
    const client = createCacheClient();
    await client.set("short-lived", "data", 1); // 1 second
    // Confirm it exists immediately
    expect(await client.get("short-lived")).toBe("data");
    // Wait for expiry
    await new Promise((r) => setTimeout(r, 1100));
    expect(await client.get("short-lived")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// edge.ts — Edge caching strategy
// ---------------------------------------------------------------------------
import {
  getEdgeCacheHeaders,
  getNoCacheHeaders,
  getBrowserCacheHeaders,
  shouldCache,
  getCacheKey,
} from "../../app/services/cache/edge";

describe("getEdgeCacheHeaders", () => {
  it("includes public and s-maxage directives", () => {
    const headers = getEdgeCacheHeaders(300);
    const cc = headers["Cache-Control"];
    expect(cc).toContain("public");
    expect(cc).toContain("s-maxage=300");
    expect(cc).toContain("max-age=300");
  });

  it("defaults stale-while-revalidate to maxAge", () => {
    const headers = getEdgeCacheHeaders(600);
    expect(headers["Cache-Control"]).toContain("stale-while-revalidate=600");
  });

  it("uses explicit stale-while-revalidate when provided", () => {
    const headers = getEdgeCacheHeaders(300, 60);
    expect(headers["Cache-Control"]).toContain("stale-while-revalidate=60");
  });

  it("sets Vary header", () => {
    const headers = getEdgeCacheHeaders(300);
    expect(headers["Vary"]).toBeDefined();
    expect(headers["Vary"]).toContain("Accept-Language");
  });
});

describe("getNoCacheHeaders", () => {
  it("returns private, no-store", () => {
    const headers = getNoCacheHeaders();
    expect(headers["Cache-Control"]).toContain("no-store");
    expect(headers["Cache-Control"]).toContain("private");
  });
});

describe("getBrowserCacheHeaders", () => {
  it("returns private max-age header", () => {
    const headers = getBrowserCacheHeaders(120);
    expect(headers["Cache-Control"]).toContain("private");
    expect(headers["Cache-Control"]).toContain("max-age=120");
  });
});

describe("shouldCache", () => {
  function makeRequest(url: string, method = "GET", headers: Record<string, string> = {}): Request {
    return new Request(url, { method, headers });
  }

  it("returns true for a plain GET request", () => {
    expect(shouldCache(makeRequest("https://example.com/products"))).toBe(true);
  });

  it("returns true for a HEAD request", () => {
    expect(shouldCache(makeRequest("https://example.com/products", "HEAD"))).toBe(true);
  });

  it("returns false for POST", () => {
    expect(shouldCache(makeRequest("https://example.com/products", "POST"))).toBe(false);
  });

  it("returns false for auth paths", () => {
    expect(shouldCache(makeRequest("https://example.com/auth/login"))).toBe(false);
    expect(shouldCache(makeRequest("https://example.com/api/auth/token"))).toBe(false);
  });

  it("returns false when Authorization header is present", () => {
    expect(
      shouldCache(makeRequest("https://example.com/products", "GET", { Authorization: "Bearer tok" })),
    ).toBe(false);
  });
});

describe("getCacheKey", () => {
  it("returns URL with sorted query params", () => {
    const req = new Request("https://example.com/api?z=1&a=2&m=3");
    const key = getCacheKey(req);
    expect(key).toBe("https://example.com/api?a=2&m=3&z=1");
  });

  it("returns plain URL when no query params", () => {
    const req = new Request("https://example.com/products");
    expect(getCacheKey(req)).toBe("https://example.com/products");
  });
});

// ---------------------------------------------------------------------------
// font-loader.ts — RTL font optimization
// ---------------------------------------------------------------------------
import {
  getOptimalFonts,
  generateFontPreloadLinks,
  isRTLLocale,
  type FontConfig,
} from "../../app/services/performance/font-loader";

describe("getOptimalFonts", () => {
  it("returns Arabic fonts for ar locale", () => {
    const fonts = getOptimalFonts("ar");
    expect(fonts.length).toBeGreaterThan(0);
    const families = fonts.map((f) => f.family);
    expect(families.some((f) => f.toLowerCase().includes("arabic") || f === "Cairo")).toBe(true);
  });

  it("returns Persian fonts for fa locale", () => {
    const fonts = getOptimalFonts("fa");
    expect(fonts.length).toBeGreaterThan(0);
    const families = fonts.map((f) => f.family);
    expect(families.some((f) => f === "Vazirmatn")).toBe(true);
  });

  it("returns Hebrew fonts for he locale", () => {
    const fonts = getOptimalFonts("he");
    expect(fonts.length).toBeGreaterThan(0);
    const families = fonts.map((f) => f.family);
    expect(families.some((f) => f.toLowerCase().includes("hebrew") || f === "Assistant")).toBe(true);
  });

  it("returns LTR fonts for en locale", () => {
    const fonts = getOptimalFonts("en");
    expect(fonts.length).toBeGreaterThan(0);
    // LTR fonts use 'optional' display
    expect(fonts[0].display).toBe("optional");
  });

  it("RTL fonts use swap display strategy", () => {
    const fonts = getOptimalFonts("ar");
    fonts.forEach((f) => {
      expect(f.display).toBe("swap");
    });
  });

  it("each FontConfig has required fields", () => {
    const fonts = getOptimalFonts("ar");
    fonts.forEach((font: FontConfig) => {
      expect(typeof font.family).toBe("string");
      expect(font.family.length).toBeGreaterThan(0);
      expect(Array.isArray(font.weights)).toBe(true);
      expect(font.weights.length).toBeGreaterThan(0);
      expect(Array.isArray(font.subsets)).toBe(true);
      expect(font.subsets.length).toBeGreaterThan(0);
      expect(typeof font.display).toBe("string");
    });
  });

  it("handles locale tags with region codes (ar-AE)", () => {
    const fonts = getOptimalFonts("ar-AE");
    expect(fonts.length).toBeGreaterThan(0);
    expect(fonts[0].display).toBe("swap");
  });
});

describe("generateFontPreloadLinks", () => {
  it("generates one link per weight per font", () => {
    const fonts: FontConfig[] = [
      { family: "Cairo", weights: [400, 700], subsets: ["arabic"], display: "swap" },
    ];
    const html = generateFontPreloadLinks(fonts);
    const tags = html.split("\n").filter(Boolean);
    // 2 weights → 2 tags
    expect(tags).toHaveLength(2);
  });

  it("each tag contains rel=preload and as=style", () => {
    const fonts = getOptimalFonts("ar");
    const html = generateFontPreloadLinks(fonts);
    const tags = html.split("\n").filter(Boolean);
    tags.forEach((tag) => {
      expect(tag).toContain('rel="preload"');
      expect(tag).toContain('as="style"');
    });
  });

  it("links point to fonts.googleapis.com", () => {
    const fonts = getOptimalFonts("ar");
    const html = generateFontPreloadLinks(fonts);
    expect(html).toContain("fonts.googleapis.com");
  });

  it("returns empty string for empty font list", () => {
    expect(generateFontPreloadLinks([])).toBe("");
  });
});

describe("isRTLLocale", () => {
  it.each(["ar", "he", "fa", "ur"])("returns true for %s", (locale) => {
    expect(isRTLLocale(locale)).toBe(true);
  });

  it.each(["en", "fr", "de", "zh"])("returns false for %s", (locale) => {
    expect(isRTLLocale(locale)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// middleware/cache.ts — withCache
// ---------------------------------------------------------------------------
import { withCache, invalidateCache } from "../../app/middleware/cache";

describe("withCache", () => {
  beforeEach(() => {
    resetCacheClient();
    delete process.env.REDIS_URL;
  });

  afterEach(() => {
    resetCacheClient();
  });

  it("calls factory on first access and returns value", async () => {
    let callCount = 0;
    const result = await withCache("test:first", 60, async () => {
      callCount++;
      return { data: "hello" };
    });
    expect(result).toEqual({ data: "hello" });
    expect(callCount).toBe(1);
  });

  it("returns cached value on second call without re-invoking factory", async () => {
    let callCount = 0;
    const factory = async () => {
      callCount++;
      return { count: callCount };
    };

    const first = await withCache("test:second", 60, factory);
    const second = await withCache("test:second", 60, factory);

    expect(first).toEqual({ count: 1 });
    expect(second).toEqual({ count: 1 }); // same cached value
    expect(callCount).toBe(1);
  });

  it("works with primitive values", async () => {
    const result = await withCache("test:prim", 60, async () => 42);
    expect(result).toBe(42);
  });

  it("works with array values", async () => {
    const result = await withCache("test:arr", 60, async () => [1, 2, 3]);
    expect(result).toEqual([1, 2, 3]);
  });
});

describe("invalidateCache", () => {
  beforeEach(() => {
    resetCacheClient();
    delete process.env.REDIS_URL;
  });

  afterEach(() => {
    resetCacheClient();
  });

  it("removes a cached entry so factory is called again", async () => {
    let callCount = 0;
    const factory = async () => {
      callCount++;
      return `value-${callCount}`;
    };

    await withCache("test:invalidate", 60, factory); // populates cache
    await invalidateCache("test:invalidate");         // removes it
    const second = await withCache("test:invalidate", 60, factory); // should re-fetch

    expect(callCount).toBe(2);
    expect(second).toBe("value-2");
  });
});
