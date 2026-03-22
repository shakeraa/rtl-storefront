import { getCacheStrategy } from "./translation-cache-strategy";

export interface ISRHeadersOptions {
  contentType: string;
  locale?: string;
  revalidateSeconds?: number;
  staleWhileRevalidateSeconds?: number;
  tags?: string[];
}

export function createISRHeaders(options: ISRHeadersOptions): Headers {
  const strategy = getCacheStrategy(options.contentType);
  const revalidateSeconds = options.revalidateSeconds ?? strategy.ttlSeconds;
  const staleWhileRevalidateSeconds =
    options.staleWhileRevalidateSeconds ?? revalidateSeconds * 2;
  const varyValues = dedupeValues(["Accept-Language"]);
  const tags = dedupeValues([
    ...(options.tags ?? []),
    `content:${options.contentType}`,
    options.locale ? `locale:${options.locale}` : "",
  ]);

  const headers = new Headers();
  headers.set(
    "Cache-Control",
    `public, max-age=0, s-maxage=${revalidateSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`,
  );
  headers.set("Vary", varyValues.join(", "));
  headers.set("X-ISR", "enabled");
  headers.set("X-ISR-Tier", strategy.tier);

  if (tags.length > 0) {
    headers.set("X-ISR-Tags", tags.join(","));
  }

  return headers;
}

export function mergeISRHeaders(
  target: Headers,
  options: ISRHeadersOptions,
): Headers {
  const isrHeaders = createISRHeaders(options);

  for (const [key, value] of isrHeaders.entries()) {
    target.set(key, value);
  }

  return target;
}

function dedupeValues(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}
