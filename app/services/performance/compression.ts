import { constants, createBrotliCompress, brotliCompressSync } from "node:zlib";

/**
 * Content types that benefit from compression.
 * Text-based content compresses well, while binary content doesn't.
 */
export const COMPRESSIBLE_CONTENT_TYPES = [
  "text/",
  "application/javascript",
  "application/json",
  "application/xml",
  "application/rss+xml",
  "application/atom+xml",
  "application/graphql",
  "application/x-javascript",
  "application/ecmascript",
  "image/svg+xml",
];

/**
 * Content types that should NOT be compressed.
 * Already compressed formats or streaming content.
 */
export const NON_COMPRESSIBLE_CONTENT_TYPES = [
  "image/",
  "video/",
  "audio/",
  "application/zip",
  "application/gzip",
  "application/x-7z-compressed",
  "application/x-rar-compressed",
  "application/pdf",
  "font/",
  "application/x-font",
];

/** Minimum response size in bytes to apply compression. Smaller responses aren't worth the CPU cost. */
export const MIN_COMPRESSION_SIZE = 1024;

/** Maximum size to compress (10MB) - very large responses may cause memory issues */
export const MAX_COMPRESSION_SIZE = 10 * 1024 * 1024;

/** Compression encoding priority (best to worst compression ratio) */
export const ENCODING_PRIORITY = ["br", "gzip", "deflate", "identity"] as const;

export type EncodingType = (typeof ENCODING_PRIORITY)[number];

/** Brotli quality level (1-11). 5 is a good balance of speed and compression ratio. */
export const BROTLI_QUALITY = 5;

/** Gzip compression level (1-9). 6 is the default, good balance. */
export const GZIP_LEVEL = 6;

/** Deflate compression level (1-9). 6 is the default. */
export const DEFLATE_LEVEL = 6;

/**
 * Compression level recommendations by content type.
 * More aggressive compression for static assets, lighter for dynamic content.
 */
export const COMPRESSION_LEVELS: Record<string, { brotli: number; gzip: number; deflate: number }> = {
  default: { brotli: BROTLI_QUALITY, gzip: GZIP_LEVEL, deflate: DEFLATE_LEVEL },
  // Static assets - can use higher compression since they're cached
  "text/css": { brotli: 7, gzip: 9, deflate: 9 },
  "application/javascript": { brotli: 7, gzip: 9, deflate: 9 },
  "application/json": { brotli: 6, gzip: 8, deflate: 8 },
  // HTML - balance between compression and TTFB
  "text/html": { brotli: 4, gzip: 6, deflate: 6 },
  "text/plain": { brotli: 5, gzip: 7, deflate: 7 },
  // API responses - lighter compression for speed
  "application/graphql": { brotli: 4, gzip: 5, deflate: 5 },
  "application/xml": { brotli: 5, gzip: 6, deflate: 6 },
};

/**
 * Parsed encoding preference from Accept-Encoding header
 */
export interface EncodingPreference {
  encoding: EncodingType;
  quality: number;
}

/**
 * Parse Accept-Encoding header to extract supported encodings with quality values.
 * Handles formats like: "gzip, deflate, br;q=0.8, *;q=0.1"
 */
export function parseAcceptEncoding(acceptEncoding: string | null): EncodingPreference[] {
  if (!acceptEncoding || acceptEncoding.trim() === "") {
    return [{ encoding: "identity", quality: 1 }];
  }

  const preferences: EncodingPreference[] = [];
  const encodings = acceptEncoding.split(",").map((e) => e.trim());

  for (const encoding of encodings) {
    if (!encoding) continue;

    const parts = encoding.split(";");
    const name = parts[0].trim().toLowerCase();
    
    // Parse quality value (q-factor)
    let quality = 1;
    for (let i = 1; i < parts.length; i++) {
      const param = parts[i].trim();
      if (param.startsWith("q=")) {
        const qValue = parseFloat(param.slice(2));
        if (!isNaN(qValue) && qValue >= 0 && qValue <= 1) {
          quality = qValue;
        }
      }
    }

    // Map common encoding names
    let mappedEncoding: EncodingType;
    switch (name) {
      case "br":
        mappedEncoding = "br";
        break;
      case "gzip":
        mappedEncoding = "gzip";
        break;
      case "deflate":
        mappedEncoding = "deflate";
        break;
      case "identity":
        mappedEncoding = "identity";
        break;
      case "*":
        // Wildcard - add remaining supported encodings with this quality
        for (const enc of ENCODING_PRIORITY) {
          if (enc !== "identity" && !preferences.some((p) => p.encoding === enc)) {
            preferences.push({ encoding: enc, quality });
          }
        }
        continue;
      default:
        // Unknown encoding, skip
        continue;
    }

    preferences.push({ encoding: mappedEncoding, quality });
  }

  // Sort by quality descending, then by priority order
  return preferences.sort((a, b) => {
    if (b.quality !== a.quality) {
      return b.quality - a.quality;
    }
    return ENCODING_PRIORITY.indexOf(a.encoding) - ENCODING_PRIORITY.indexOf(b.encoding);
  });
}

/**
 * Select the best encoding based on Accept-Encoding header and server capabilities.
 * Returns the encoding with highest quality that we support.
 */
export function selectEncoding(acceptEncoding: string | null): EncodingType {
  const preferences = parseAcceptEncoding(acceptEncoding);
  
  for (const pref of preferences) {
    if (pref.quality > 0 && ENCODING_PRIORITY.includes(pref.encoding)) {
      return pref.encoding;
    }
  }
  
  return "identity";
}

/**
 * Check if a specific encoding is supported by the client.
 */
export function acceptsEncoding(acceptEncoding: string | null, encoding: EncodingType): boolean {
  const preferences = parseAcceptEncoding(acceptEncoding);
  const pref = preferences.find((p) => p.encoding === encoding);
  return pref !== undefined && pref.quality > 0;
}

/**
 * Legacy function: Check if client accepts brotli.
 * @deprecated Use acceptsEncoding() instead
 */
export function acceptsBrotli(acceptEncoding: string | null): boolean {
  return acceptsEncoding(acceptEncoding, "br");
}

/**
 * Check if content type is compressible.
 * Returns true for text-based content, false for already-compressed binary formats.
 */
export function isCompressibleContentType(contentType: string | null): boolean {
  if (!contentType) {
    return false;
  }

  const normalized = contentType.toLowerCase().split(";")[0].trim();

  // Check compressible types first (exception: SVG is image/svg+xml but compressible)
  for (const compressible of COMPRESSIBLE_CONTENT_TYPES) {
    if (normalized.includes(compressible) || normalized.startsWith(compressible)) {
      return true;
    }
  }

  // Check non-compressible types
  for (const nonCompressible of NON_COMPRESSIBLE_CONTENT_TYPES) {
    if (normalized.startsWith(nonCompressible)) {
      return false;
    }
  }

  return false;
}

/**
 * Determine if content should be compressed based on content type and size.
 */
export function shouldCompress(contentType: string | null, size: number): boolean {
  // Size checks
  if (size < MIN_COMPRESSION_SIZE || size > MAX_COMPRESSION_SIZE) {
    return false;
  }

  return isCompressibleContentType(contentType);
}

/**
 * Legacy function: Check if brotli compression should be used.
 * @deprecated Use shouldCompress() and selectEncoding() instead
 */
export function shouldUseBrotliCompression(
  request: Request,
  contentType: string | null,
  contentLength?: number,
): boolean {
  if (contentLength !== undefined && contentLength < MIN_COMPRESSION_SIZE) {
    return false;
  }

  return (
    acceptsBrotli(request.headers.get("accept-encoding")) &&
    isCompressibleContentType(contentType)
  );
}

/**
 * Get compression level for a specific content type.
 * Returns appropriate levels for brotli, gzip, and deflate.
 */
export function getCompressionLevel(
  contentType: string | null,
): { brotli: number; gzip: number; deflate: number } {
  if (!contentType) {
    return COMPRESSION_LEVELS.default;
  }

  const normalized = contentType.toLowerCase().split(";")[0].trim();

  // Exact match
  if (COMPRESSION_LEVELS[normalized]) {
    return COMPRESSION_LEVELS[normalized];
  }

  // Partial match (e.g., "text/html; charset=utf-8" matches "text/html")
  for (const [type, levels] of Object.entries(COMPRESSION_LEVELS)) {
    if (normalized.startsWith(type) || type.startsWith(normalized)) {
      return levels;
    }
  }

  return COMPRESSION_LEVELS.default;
}

/**
 * Generate Vary header value for encoding-based content negotiation.
 * Ensures Accept-Encoding is included in the Vary header.
 */
export function generateVaryHeader(existingVary?: string | null): string {
  if (!existingVary || existingVary.trim() === "") {
    return "Accept-Encoding";
  }

  const varyValues = existingVary.split(",").map((v) => v.trim());
  const lowerValues = varyValues.map((v) => v.toLowerCase());

  if (!lowerValues.includes("accept-encoding")) {
    varyValues.push("Accept-Encoding");
  }

  return varyValues.join(", ");
}

/**
 * Apply encoding-specific headers to response headers.
 * Updates Content-Encoding, Vary, and removes Content-Length (since it changes after compression).
 */
export function applyEncodingHeaders(
  headers: Headers,
  encoding: EncodingType,
): Headers {
  if (encoding !== "identity") {
    headers.set("Content-Encoding", encoding === "br" ? "br" : encoding);
    headers.delete("Content-Length");
  }

  const vary = headers.get("Vary");
  headers.set("Vary", generateVaryHeader(vary));

  return headers;
}

/**
 * Legacy function: Apply brotli-specific headers.
 * @deprecated Use applyEncodingHeaders() instead
 */
export function applyBrotliHeaders(headers: Headers): Headers {
  return applyEncodingHeaders(headers, "br");
}

/**
 * Get content encoding header value for an encoding type.
 */
export function getContentEncodingHeader(encoding: EncodingType): string | null {
  if (encoding === "identity") {
    return null;
  }
  return encoding === "br" ? "br" : encoding;
}

/**
 * Calculate expected compression ratio for a content type.
 * Useful for estimating bandwidth savings.
 */
export function getExpectedCompressionRatio(contentType: string | null): number {
  if (!contentType) return 1;

  const normalized = contentType.toLowerCase();

  // Highly compressible text formats
  if (normalized.includes("text/css") || normalized.includes("application/javascript")) {
    return 0.25; // ~75% reduction
  }
  if (normalized.includes("text/html")) {
    return 0.3; // ~70% reduction
  }
  if (normalized.includes("application/json")) {
    return 0.35; // ~65% reduction
  }
  if (normalized.includes("text/plain")) {
    return 0.4; // ~60% reduction
  }
  if (normalized.includes("image/svg+xml")) {
    return 0.5; // ~50% reduction
  }

  return 1; // No compression expected
}

/**
 * Check if a request should receive compressed response based on all factors.
 * This is the main decision function for compression.
 */
export function shouldCompressResponse(
  request: Request,
  contentType: string | null,
  contentLength: number,
): { shouldCompress: boolean; encoding: EncodingType } {
  // Check if content is compressible and size is appropriate
  if (!shouldCompress(contentType, contentLength)) {
    return { shouldCompress: false, encoding: "identity" };
  }

  // Select best encoding based on Accept-Encoding
  const acceptEncoding = request.headers.get("accept-encoding");
  const encoding = selectEncoding(acceptEncoding);

  if (encoding === "identity") {
    return { shouldCompress: false, encoding: "identity" };
  }

  return { shouldCompress: true, encoding };
}

/**
 * Create a brotli compression stream with configured settings.
 */
export function createBrotliCompressionStream() {
  const stream = createBrotliCompress({
    params: {
      [constants.BROTLI_PARAM_QUALITY]: BROTLI_QUALITY,
      [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT,
    },
  });

  // Handle compression errors gracefully — log and pass through uncompressed
  stream.on("error", (error) => {
    console.error("Brotli compression error:", error.message);
    stream.destroy();
  });

  return stream;
}

/**
 * Compress data with Brotli synchronously.
 */
export function compressWithBrotli(input: string | Uint8Array): Buffer {
  return brotliCompressSync(input, {
    params: {
      [constants.BROTLI_PARAM_QUALITY]: BROTLI_QUALITY,
      [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT,
    },
  });
}

/**
 * Get all supported encodings as a comma-separated list.
 * Useful for debugging or server information endpoints.
 */
export function getSupportedEncodings(): string {
  return ENCODING_PRIORITY.filter((e) => e !== "identity").join(", ");
}
