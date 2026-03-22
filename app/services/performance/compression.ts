import { constants, createBrotliCompress, brotliCompressSync } from "node:zlib";

export const BROTLI_CONTENT_TYPES = [
  "text/",
  "application/javascript",
  "application/json",
  "application/xml",
  "image/svg+xml",
];

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
): boolean {
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
  return createBrotliCompress({
    params: {
      [constants.BROTLI_PARAM_QUALITY]: 5,
      [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT,
    },
  });
}

export function compressWithBrotli(input: string | Uint8Array): Buffer {
  return brotliCompressSync(input, {
    params: {
      [constants.BROTLI_PARAM_QUALITY]: 5,
      [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT,
    },
  });
}
