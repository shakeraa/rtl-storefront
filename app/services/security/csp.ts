/**
 * Content Security Policy Service (T0183)
 *
 * Builds and manages CSP headers for Shopify embedded apps.
 */

import { randomBytes } from "crypto";
import type { CSPConfig } from "./types";

/**
 * Returns sensible CSP defaults for a Shopify embedded app.
 * Allows Shopify CDN, Google Fonts, and self.
 */
export function getDefaultCSP(): CSPConfig {
  return {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "https://cdn.shopify.com",
      "https://shopify.com",
    ],
    styleSrc: [
      "'self'",
      // TODO: Replace with nonce-based approach when CSP middleware is wired in.
      // Use generateNonce() and pass `'nonce-<value>'` per-request instead of 'unsafe-inline'.
      // For now, 'unsafe-inline' is required because Polaris injects inline styles.
      "'unsafe-inline'",
      "https://cdn.shopify.com",
      "https://fonts.googleapis.com",
    ],
    imgSrc: [
      "'self'",
      "data:",
      "https://cdn.shopify.com",
      "https://*.shopifycdn.com",
    ],
    fontSrc: [
      "'self'",
      "https://fonts.gstatic.com",
      "https://cdn.shopify.com",
    ],
    connectSrc: [
      "'self'",
      "https://*.shopify.com",
      "https://*.myshopify.com",
    ],
    frameSrc: [
      "'self'",
      "https://admin.shopify.com",
      "https://*.myshopify.com",
    ],
    reportOnly: false,
  };
}

/**
 * Builds a CSP header string from a config object.
 */
export function buildCSPHeader(config: CSPConfig): string {
  const directives: string[] = [];

  if (config.defaultSrc.length > 0) {
    directives.push(`default-src ${config.defaultSrc.join(" ")}`);
  }
  if (config.scriptSrc.length > 0) {
    directives.push(`script-src ${config.scriptSrc.join(" ")}`);
  }
  if (config.styleSrc.length > 0) {
    directives.push(`style-src ${config.styleSrc.join(" ")}`);
  }
  if (config.imgSrc.length > 0) {
    directives.push(`img-src ${config.imgSrc.join(" ")}`);
  }
  if (config.fontSrc.length > 0) {
    directives.push(`font-src ${config.fontSrc.join(" ")}`);
  }
  if (config.connectSrc.length > 0) {
    directives.push(`connect-src ${config.connectSrc.join(" ")}`);
  }
  if (config.frameSrc.length > 0) {
    directives.push(`frame-src ${config.frameSrc.join(" ")}`);
  }
  if (config.reportUri) {
    directives.push(`report-uri ${config.reportUri}`);
  }

  return directives.join("; ");
}

/**
 * Adds values to a specific CSP directive, returning a new config.
 */
export function addCSPDirective(
  config: CSPConfig,
  directive: keyof Omit<CSPConfig, "reportUri" | "reportOnly">,
  values: string[],
): CSPConfig {
  return {
    ...config,
    [directive]: [...config[directive], ...values],
  };
}

/**
 * Generates a cryptographically random nonce for inline scripts.
 * Use as: `'nonce-<value>'` in script-src.
 */
export function generateNonce(): string {
  return randomBytes(16).toString("base64");
}
