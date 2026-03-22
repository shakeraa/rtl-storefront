import { describe, expect, it, vi } from "vitest";
import { ApiResponseCache, createApiRequestCacheKey, createEtag } from "../../app/services/cache/api-response-cache";
import { MemoryCacheStore } from "../../app/services/cache";

describe("ApiResponseCache", () => {
  it("creates deterministic cache keys regardless of query order", () => {
    const requestA = new Request("https://example.com/api/products?b=2&a=1");
    const requestB = new Request("https://example.com/api/products?a=1&b=2");

    expect(createApiRequestCacheKey(requestA)).toBe(createApiRequestCacheKey(requestB));
  });

  it("includes selected headers in the cache key", () => {
    const requestA = new Request("https://example.com/api/products", {
      headers: { "accept-language": "ar" },
    });
    const requestB = new Request("https://example.com/api/products", {
      headers: { "accept-language": "en" },
    });

    expect(createApiRequestCacheKey(requestA, ["accept-language"])).not.toBe(
      createApiRequestCacheKey(requestB, ["accept-language"]),
    );
  });

  it("returns cached GET responses without re-running the resolver", async () => {
    const cache = new ApiResponseCache(new MemoryCacheStore({ prefix: "api:" }));
    const resolver = vi.fn().mockResolvedValue({
      data: { ok: true, source: "resolver" },
      tags: ["products"],
    });
    const request = new Request("https://example.com/api/products");

    const first = await cache.getOrSet(request, resolver);
    const second = await cache.getOrSet(request, resolver);

    expect(await first.json()).toEqual({ ok: true, source: "resolver" });
    expect(await second.json()).toEqual({ ok: true, source: "resolver" });
    expect(first.headers.get("X-Cache")).toBe("MISS");
    expect(second.headers.get("X-Cache")).toBe("HIT");
    expect(second.headers.get("X-Cache-Tags")).toBe("products");
    expect(resolver).toHaveBeenCalledTimes(1);
  });

  it("returns 304 when If-None-Match matches the cached ETag", async () => {
    const cache = new ApiResponseCache(new MemoryCacheStore({ prefix: "api:" }));
    const request = new Request("https://example.com/api/products");

    const initial = await cache.getOrSet(request, () => ({
      data: { products: 3 },
    }));
    const etag = initial.headers.get("ETag");

    const notModified = await cache.getOrSet(
      new Request("https://example.com/api/products", {
        headers: { "if-none-match": etag ?? "" },
      }),
      () => ({
        data: { products: 4 },
      }),
    );

    expect(notModified.status).toBe(304);
    expect(notModified.headers.get("X-Cache")).toBe("HIT");
  });

  it("bypasses the cache for non-GET requests", async () => {
    const cache = new ApiResponseCache(new MemoryCacheStore({ prefix: "api:" }));
    const resolver = vi.fn()
      .mockResolvedValueOnce({ data: { count: 1 } })
      .mockResolvedValueOnce({ data: { count: 2 } });

    const first = await cache.getOrSet(
      new Request("https://example.com/api/products", { method: "POST" }),
      resolver,
    );
    const second = await cache.getOrSet(
      new Request("https://example.com/api/products", { method: "POST" }),
      resolver,
    );

    expect(await first.json()).toEqual({ count: 1 });
    expect(await second.json()).toEqual({ count: 2 });
    expect(first.headers.get("X-Cache")).toBe("BYPASS");
    expect(second.headers.get("X-Cache")).toBe("BYPASS");
    expect(resolver).toHaveBeenCalledTimes(2);
  });

  it("invalidates tagged cache entries", async () => {
    const cache = new ApiResponseCache(new MemoryCacheStore({ prefix: "api:" }));
    const resolver = vi.fn()
      .mockResolvedValueOnce({ data: { version: 1 }, tags: ["products"] })
      .mockResolvedValueOnce({ data: { version: 2 }, tags: ["products"] });
    const request = new Request("https://example.com/api/products");

    await cache.getOrSet(request, resolver);
    await cache.invalidateTag("products");
    const refreshed = await cache.getOrSet(request, resolver);

    expect(await refreshed.json()).toEqual({ version: 2 });
    expect(refreshed.headers.get("X-Cache")).toBe("MISS");
    expect(resolver).toHaveBeenCalledTimes(2);
  });

  it("creates stable ETags from response payloads", () => {
    expect(createEtag({ ok: true })).toBe(createEtag({ ok: true }));
    expect(createEtag({ ok: true })).not.toBe(createEtag({ ok: false }));
  });
});
