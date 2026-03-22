import { constants, createBrotliCompress, brotliCompressSync } from "node:zlib";

export const BROTLI_CONTENT_TYPES = [
  "text/",
  "application/javascript",
  "application/json",
  "application/xml",
  "image/svg+xml",
];

/** Minimum response size in bytes to apply compression. Smaller responses aren't worth the CPU cost. */
export const MIN_COMPRESSION_SIZE = 1024;

/** Brotli quality level (1-11). 5 is a good balance of speed and compression ratio. */
export const BROTLI_QUALITY = 5;

export function acceptsBrotli(acceptEncoding: string | null): boolean {
  if (!acceptEncoding) {
    return false;
  }

  return acceptEncoding
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .some((value) => value === "br" || value.startsWith("br;"));
}

export function isCompressibleContentType(contentType: string | null): boolean {
  if (!contentType) {
    return false;
  }

  const normalized = contentType.toLowerCase();
  return BROTLI_CONTENT_TYPES.some((candidate) => normalized.includes(candidate));
}

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

export function applyBrotliHeaders(headers: Headers): Headers {
  headers.set("Content-Encoding", "br");
  headers.delete("Content-Length");

  const vary = headers.get("Vary");
  if (!vary) {
    headers.set("Vary", "Accept-Encoding");
    return headers;
  }

  if (!vary.toLowerCase().includes("accept-encoding")) {
    headers.set("Vary", `${vary}, Accept-Encoding`);
  }

  return headers;
}

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

export function compressWithBrotli(input: string | Uint8Array): Buffer {
  return brotliCompressSync(input, {
    params: {
      [constants.BROTLI_PARAM_QUALITY]: BROTLI_QUALITY,
      [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT,
    },
  });
}
