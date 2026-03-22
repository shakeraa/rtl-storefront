/**
 * XSS Prevention Service (T0184)
 *
 * Detects and sanitizes cross-site scripting threats using regex patterns.
 * No external dependencies.
 */

import type { XSSCheckResult } from "./types";

// Patterns that indicate potential XSS attacks
const XSS_PATTERNS: Array<{ type: string; pattern: RegExp }> = [
  { type: "script_tag", pattern: /<script[\s>]/i },
  { type: "script_close", pattern: /<\/script>/i },
  { type: "event_handler", pattern: /\bon\w+\s*=\s*["'`]/i },
  { type: "javascript_uri", pattern: /javascript\s*:/i },
  { type: "data_uri", pattern: /data\s*:\s*text\/html/i },
  { type: "vbscript_uri", pattern: /vbscript\s*:/i },
  { type: "expression_css", pattern: /expression\s*\(/i },
  { type: "eval_call", pattern: /\beval\s*\(/i },
  { type: "iframe_tag", pattern: /<iframe[\s>]/i },
  { type: "object_tag", pattern: /<object[\s>]/i },
  { type: "embed_tag", pattern: /<embed[\s>]/i },
  { type: "form_tag", pattern: /<form[\s>]/i },
  { type: "svg_onload", pattern: /<svg[^>]*\bon\w+/i },
  { type: "meta_refresh", pattern: /<meta[^>]*http-equiv\s*=\s*["']?refresh/i },
  { type: "base_tag", pattern: /<base[\s>]/i },
];

// Safe HTML tags allowed through sanitization
const SAFE_TAGS = new Set(["p", "span", "br", "strong", "em", "a", "b", "i", "u", "ul", "ol", "li"]);

// Safe attributes per tag
const SAFE_ATTRIBUTES: Record<string, Set<string>> = {
  a: new Set(["href", "title", "rel"]),
  span: new Set(["class"]),
  p: new Set(["class"]),
};

/**
 * Checks an input string for potential XSS threats.
 */
export function checkForXSS(input: string): XSSCheckResult {
  const threats: Array<{ type: string; location: string; pattern: string }> = [];

  for (const { type, pattern } of XSS_PATTERNS) {
    const match = pattern.exec(input);
    if (match) {
      threats.push({
        type,
        location: `index ${match.index}`,
        pattern: match[0],
      });
    }
  }

  return {
    isSafe: threats.length === 0,
    threats,
    sanitized: sanitizeHTML(input),
  };
}

/**
 * Sanitizes HTML by stripping dangerous tags and attributes.
 * Keeps safe tags: p, span, br, strong, em, a (with href), b, i, u, ul, ol, li.
 */
export function sanitizeHTML(html: string): string {
  // Remove script tags and their content entirely
  let result = html.replace(/<script[\s\S]*?<\/script>/gi, "");

  // Remove style tags and their content
  result = result.replace(/<style[\s\S]*?<\/style>/gi, "");

  // Remove comments
  result = result.replace(/<!--[\s\S]*?-->/g, "");

  // Process all HTML tags
  result = result.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)?\/?>/g, (fullMatch, tagName: string, attrs: string) => {
    const tag = tagName.toLowerCase();
    const isClosing = fullMatch.startsWith("</");

    if (!SAFE_TAGS.has(tag)) {
      return "";
    }

    if (isClosing) {
      return `</${tag}>`;
    }

    // Filter attributes
    const allowedAttrs = SAFE_ATTRIBUTES[tag];
    if (!allowedAttrs || !attrs) {
      return tag === "br" ? "<br>" : `<${tag}>`;
    }

    const safeAttrs: string[] = [];
    const attrRegex = /([a-zA-Z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
    let attrMatch;

    while ((attrMatch = attrRegex.exec(attrs)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? "";

      if (!allowedAttrs.has(attrName)) continue;

      // Block dangerous URIs in href
      if (attrName === "href") {
        const trimmed = attrValue.trim().toLowerCase();
        if (trimmed.startsWith("javascript:") || trimmed.startsWith("data:") || trimmed.startsWith("vbscript:")) {
          continue;
        }
      }

      safeAttrs.push(`${attrName}="${escapeForAttribute(attrValue)}"`);
    }

    const attrString = safeAttrs.length > 0 ? ` ${safeAttrs.join(" ")}` : "";
    return `<${tag}${attrString}>`;
  });

  // Remove any remaining event handlers that might have survived
  result = result.replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "");

  return result;
}

/**
 * Escapes a string for safe use inside an HTML attribute value.
 */
export function escapeForAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/`/g, "&#96;");
}

/**
 * Escapes a string for safe embedding inside a JavaScript string context.
 */
export function escapeForJS(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/`/g, "\\`")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/<\//g, "<\\/")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
