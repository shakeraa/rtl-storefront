import { createHash } from "node:crypto";
import { json } from "@remix-run/node";
import type { CacheStore } from "./types";

export interface ApiResponseCacheOptions {
  ttlSeconds?: number;
  tags?: string[];
  includeHeaders?: string[];
  vary?: string[];
}

export interface CachedResolverResult<T> {
  data: T;
  status?: number;
  headers?: HeadersInit;
  tags?: string[];
}

interface StoredApiResponse<T> {
  data: T;
  status: number;
  etag: string;
  headers: Array<[string, string]>;
  tags: string[];
}

const DEFAULT_TTL_SECONDS = 300;

export class ApiResponseCache {
  private readonly tagIndex = new Map<string, Set<string>>();
  private readonly store: CacheStore;
  private readonly defaultTtlSeconds: number;

  constructor(store: CacheStore, defaultTtlSeconds: number = DEFAULT_TTL_SECONDS) {
    this.store = store;
    this.defaultTtlSeconds = defaultTtlSeconds;
  }

  async getOrSet<T>(
    request: Request,
    resolver: () => Promise<CachedResolverResult<T>> | CachedResolverResult<T>,
    options: ApiResponseCacheOptions = {},
  ): Promise<Response> {
    if (!isCacheableMethod(request.method)) {
      const result = await resolver();
      return createCachedJsonResponse(result, "BYPASS");
    }

    const cacheKey = createApiRequestCacheKey(request, options.includeHeaders);
    const cached = await this.store.get<StoredApiResponse<T>>(cacheKey);

    if (cached) {
      if (request.headers.get("if-none-match") === cached.etag) {
        const headers = new Headers(cached.headers);
        headers.set("ETag", cached.etag);
        headers.set("X-Cache", "HIT");
        return new Response(null, { status: 304, headers });
      }

      return createCachedJsonResponse(
        {
          data: cached.data,
          status: cached.status,
          headers: cached.headers,
        },
        "HIT",
      );
    }

    const result = await resolver();
    const response = createCachedJsonResponse(result, "MISS", options.vary);
    const headers = new Headers(response.headers);
    const tags = dedupeTags(options.tags, result.tags);
    const etag = headers.get("ETag") ?? createEtag(result.data);

    headers.set("ETag", etag);
    if (tags.length > 0) {
      headers.set("X-Cache-Tags", tags.join(","));
    }

    await this.store.set<StoredApiResponse<T>>(
      cacheKey,
      {
        data: result.data,
        status: result.status ?? 200,
        etag,
        headers: [...headers.entries()],
        tags,
      },
      options.ttlSeconds ?? this.defaultTtlSeconds,
    );

    this.trackTags(cacheKey, tags);

    return new Response(await response.text(), {
      status: response.status,
      headers,
    });
  }

  async invalidateTag(tag: string): Promise<void> {
    const keys = this.tagIndex.get(tag);
    if (!keys) {
      return;
    }

    for (const key of keys) {
      await this.store.delete(key);
    }

    this.tagIndex.delete(tag);
  }

  private trackTags(cacheKey: string, tags: string[]) {
    for (const tag of tags) {
      let keys = this.tagIndex.get(tag);
      if (!keys) {
        keys = new Set<string>();
        this.tagIndex.set(tag, keys);
      }
      keys.add(cacheKey);
    }
  }
}

export function createApiRequestCacheKey(
  request: Request,
  includeHeaders: string[] = [],
): string {
  const url = new URL(request.url);
  const query = [...url.searchParams.entries()].sort(([leftKey, leftValue], [rightKey, rightValue]) => {
    if (leftKey === rightKey) {
      return leftValue.localeCompare(rightValue);
    }
    return leftKey.localeCompare(rightKey);
  });

  const headers = includeHeaders
    .map((header) => [header.toLowerCase(), request.headers.get(header) ?? ""])
    .sort(([left], [right]) => left.localeCompare(right));

  return createHash("sha256")
    .update(
      JSON.stringify({
        method: request.method.toUpperCase(),
        pathname: url.pathname,
        query,
        headers,
      }),
    )
    .digest("hex");
}

export function createEtag(data: unknown): string {
  return `"${createHash("sha1").update(JSON.stringify(data)).digest("hex")}"`;
}

function createCachedJsonResponse<T>(
  result: CachedResolverResult<T> | { data: T; status?: number; headers?: HeadersInit },
  cacheState: "HIT" | "MISS" | "BYPASS",
  varyHeaders: string[] = [],
): Response {
  const response = json(result.data, {
    status: result.status ?? 200,
    headers: result.headers,
  });
  const headers = new Headers(response.headers);
  headers.set("X-Cache", cacheState);
  if (!headers.has("Cache-Control")) {
    headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
  }
  if (!headers.has("ETag")) {
    headers.set("ETag", createEtag(result.data));
  }
  if (varyHeaders.length > 0) {
    headers.set("Vary", dedupeHeaderValues(headers.get("Vary"), varyHeaders));
  }

  return new Response(response.body, {
    status: response.status,
    headers,
  });
}

function dedupeTags(...tagGroups: Array<string[] | undefined>): string[] {
  return [...new Set(tagGroups.flatMap((group) => group ?? []).filter(Boolean))];
}

function dedupeHeaderValues(current: string | null, next: string[]): string {
  return [...new Set([...(current?.split(",").map((value) => value.trim()).filter(Boolean) ?? []), ...next])]
    .join(", ");
}

function isCacheableMethod(method: string): boolean {
  const normalized = method.toUpperCase();
  return normalized === "GET" || normalized === "HEAD";
}
