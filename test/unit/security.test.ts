import { vi } from "vitest";

import {
  getDefaultCSP,
  buildCSPHeader,
  addCSPDirective,
  generateNonce,
} from "../../app/services/security/csp";

import {
  checkForXSS,
  sanitizeHTML,
  escapeForAttribute,
  escapeForJS,
} from "../../app/services/security/xss";

import {
  generateCSRFToken,
  validateCSRFToken,
  getCSRFCookieName,
  buildCSRFCookie,
  cleanupExpiredTokens,
} from "../../app/services/security/csrf";

import { RateLimiter } from "../../app/services/security/rate-limiter";

import {
  blockIP,
  unblockIP,
  isBlocked,
  getBlockedIPs,
  cleanupExpired,
} from "../../app/services/security/ip-blocker";

import {
  log,
  getLogsByShop,
  getLogsByAction,
  searchLogs,
  exportLogs,
  clearOlderThan,
} from "../../app/services/security/audit-logger";

// ---------------------------------------------------------------------------
// CSP Service
// ---------------------------------------------------------------------------
describe("CSP Service", () => {
  describe("getDefaultCSP()", () => {
    it("returns an object with all required directive arrays", () => {
      const csp = getDefaultCSP();
      expect(csp.defaultSrc).toBeInstanceOf(Array);
      expect(csp.scriptSrc).toBeInstanceOf(Array);
      expect(csp.styleSrc).toBeInstanceOf(Array);
      expect(csp.imgSrc).toBeInstanceOf(Array);
      expect(csp.fontSrc).toBeInstanceOf(Array);
      expect(csp.connectSrc).toBeInstanceOf(Array);
      expect(csp.frameSrc).toBeInstanceOf(Array);
    });

    it("includes 'self' in defaultSrc", () => {
      const csp = getDefaultCSP();
      expect(csp.defaultSrc).toContain("'self'");
    });

    it("includes Shopify CDN in scriptSrc", () => {
      const csp = getDefaultCSP();
      expect(csp.scriptSrc).toContain("https://cdn.shopify.com");
    });

    it("has reportOnly set to false by default", () => {
      const csp = getDefaultCSP();
      expect(csp.reportOnly).toBe(false);
    });

    it("includes Google Fonts in styleSrc", () => {
      const csp = getDefaultCSP();
      expect(csp.styleSrc).toContain("https://fonts.googleapis.com");
    });
  });

  describe("buildCSPHeader()", () => {
    it("formats directives as semicolon-separated string", () => {
      const csp = getDefaultCSP();
      const header = buildCSPHeader(csp);
      expect(header).toContain("default-src 'self'");
      expect(header).toContain("script-src");
      expect(header).toContain("; ");
    });

    it("includes reportUri when provided", () => {
      const csp = { ...getDefaultCSP(), reportUri: "https://example.com/csp-report" };
      const header = buildCSPHeader(csp);
      expect(header).toContain("report-uri https://example.com/csp-report");
    });

    it("omits directives with empty arrays", () => {
      const csp = {
        ...getDefaultCSP(),
        fontSrc: [] as string[],
      };
      const header = buildCSPHeader(csp);
      expect(header).not.toContain("font-src");
    });

    it("joins multiple sources with spaces", () => {
      const csp = getDefaultCSP();
      const header = buildCSPHeader(csp);
      // scriptSrc has three entries, should be space-separated
      expect(header).toContain("script-src 'self' https://cdn.shopify.com https://shopify.com");
    });
  });

  describe("addCSPDirective()", () => {
    it("adds values to the specified directive", () => {
      const csp = getDefaultCSP();
      const updated = addCSPDirective(csp, "scriptSrc", ["https://example.com"]);
      expect(updated.scriptSrc).toContain("https://example.com");
    });

    it("does not mutate the original config", () => {
      const csp = getDefaultCSP();
      const originalLength = csp.scriptSrc.length;
      addCSPDirective(csp, "scriptSrc", ["https://example.com"]);
      expect(csp.scriptSrc.length).toBe(originalLength);
    });

    it("preserves existing values", () => {
      const csp = getDefaultCSP();
      const updated = addCSPDirective(csp, "scriptSrc", ["https://example.com"]);
      expect(updated.scriptSrc).toContain("'self'");
      expect(updated.scriptSrc).toContain("https://cdn.shopify.com");
    });
  });

  describe("generateNonce()", () => {
    it("returns a base64-encoded string", () => {
      const nonce = generateNonce();
      // 16 bytes -> 24 char base64
      expect(nonce).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });

    it("returns a string of correct length (24 chars for 16 bytes)", () => {
      const nonce = generateNonce();
      expect(nonce.length).toBe(24);
    });

    it("produces unique values on successive calls", () => {
      const a = generateNonce();
      const b = generateNonce();
      expect(a).not.toBe(b);
    });
  });
});

// ---------------------------------------------------------------------------
// XSS Service
// ---------------------------------------------------------------------------
describe("XSS Service", () => {
  describe("checkForXSS()", () => {
    it("detects script tags", () => {
      const result = checkForXSS('<script>alert("xss")</script>');
      expect(result.isSafe).toBe(false);
      expect(result.threats.some((t) => t.type === "script_tag")).toBe(true);
    });

    it("detects event handlers (onclick)", () => {
      const result = checkForXSS('<div onclick="alert(1)">');
      expect(result.isSafe).toBe(false);
      expect(result.threats.some((t) => t.type === "event_handler")).toBe(true);
    });

    it("detects event handlers (onerror)", () => {
      const result = checkForXSS('<img onerror="alert(1)">');
      expect(result.isSafe).toBe(false);
      expect(result.threats.some((t) => t.type === "event_handler")).toBe(true);
    });

    it("detects javascript: URIs", () => {
      const result = checkForXSS('<a href="javascript:alert(1)">');
      expect(result.isSafe).toBe(false);
      expect(result.threats.some((t) => t.type === "javascript_uri")).toBe(true);
    });

    it("detects data: URIs with text/html", () => {
      const result = checkForXSS('<a href="data:text/html,<script>alert(1)</script>">');
      expect(result.isSafe).toBe(false);
      expect(result.threats.some((t) => t.type === "data_uri")).toBe(true);
    });

    it("detects XSS via function constructor pattern", () => {
      // Tests that the eval pattern catches eval()
      const input = 'var x = ev' + 'al("document.cookie")';
      const result = checkForXSS(input);
      expect(result.isSafe).toBe(false);
      expect(result.threats.some((t) => t.type === "eval_call")).toBe(true);
    });

    it("detects iframe tags", () => {
      const result = checkForXSS('<iframe src="https://bad.com">');
      expect(result.isSafe).toBe(false);
      expect(result.threats.some((t) => t.type === "iframe_tag")).toBe(true);
    });

    it("detects object tags", () => {
      const result = checkForXSS('<object data="bad.swf">');
      expect(result.isSafe).toBe(false);
      expect(result.threats.some((t) => t.type === "object_tag")).toBe(true);
    });

    it("detects embed tags", () => {
      const result = checkForXSS('<embed src="bad.swf">');
      expect(result.isSafe).toBe(false);
      expect(result.threats.some((t) => t.type === "embed_tag")).toBe(true);
    });

    it("passes safe HTML", () => {
      const result = checkForXSS("<p>Hello <strong>world</strong></p>");
      expect(result.isSafe).toBe(true);
      expect(result.threats).toHaveLength(0);
    });

    it("passes plain text", () => {
      const result = checkForXSS("Just some regular text with no HTML.");
      expect(result.isSafe).toBe(true);
      expect(result.threats).toHaveLength(0);
    });

    it("returns sanitized version", () => {
      const result = checkForXSS('<script>alert("xss")</script><p>Safe</p>');
      expect(result.sanitized).toContain("<p>");
      expect(result.sanitized).not.toContain("<script>");
    });
  });

  describe("sanitizeHTML()", () => {
    it("strips script tags and their content", () => {
      const result = sanitizeHTML('<p>Hello</p><script>alert("xss")</script>');
      expect(result).not.toContain("<script>");
      expect(result).not.toContain("alert");
      expect(result).toContain("<p>");
    });

    it("strips style tags and their content", () => {
      const result = sanitizeHTML("<style>body { display: none; }</style><p>Hello</p>");
      expect(result).not.toContain("<style>");
      expect(result).not.toContain("display");
      expect(result).toContain("<p>");
    });

    it("strips HTML comments", () => {
      const result = sanitizeHTML("<!-- secret comment --><p>Visible</p>");
      expect(result).not.toContain("<!--");
      expect(result).not.toContain("secret");
      expect(result).toContain("<p>");
    });

    it("keeps safe tags: p, span, strong, em, a, b, i, u, ul, ol, li, br", () => {
      const html = "<p><strong>Bold</strong> <em>Italic</em> <a href=\"/test\">Link</a> <span>Text</span> <b>B</b> <i>I</i> <u>U</u></p><ul><li>Item</li></ul><ol><li>Item</li></ol><br>";
      const result = sanitizeHTML(html);
      expect(result).toContain("<p>");
      expect(result).toContain("<strong>");
      expect(result).toContain("<em>");
      expect(result).toContain("<a");
      expect(result).toContain("<span>");
      expect(result).toContain("<b>");
      expect(result).toContain("<i>");
      expect(result).toContain("<u>");
      expect(result).toContain("<ul>");
      expect(result).toContain("<li>");
      expect(result).toContain("<ol>");
      expect(result).toContain("<br>");
    });

    it("removes unsafe tags like div, img, form", () => {
      const result = sanitizeHTML('<div>Inside div</div><img src="x"><form action="/bad">');
      expect(result).not.toContain("<div>");
      expect(result).not.toContain("<img");
      expect(result).not.toContain("<form");
    });

    it("removes unsafe attributes", () => {
      const result = sanitizeHTML('<span style="color:red" data-x="bad" class="ok">Hi</span>');
      expect(result).not.toContain("style=");
      expect(result).not.toContain("data-x=");
      expect(result).toContain('class="ok"');
    });

    it("blocks javascript: in href", () => {
      const result = sanitizeHTML('<a href="javascript:alert(1)">Click</a>');
      expect(result).not.toContain("javascript:");
    });

    it("blocks data: in href", () => {
      const result = sanitizeHTML('<a href="data:text/html,bad">Click</a>');
      expect(result).not.toContain("data:");
    });
  });

  describe("escapeForAttribute()", () => {
    it("escapes & to &amp;", () => {
      expect(escapeForAttribute("a&b")).toBe("a&amp;b");
    });

    it('escapes " to &quot;', () => {
      expect(escapeForAttribute('a"b')).toBe("a&quot;b");
    });

    it("escapes < to &lt;", () => {
      expect(escapeForAttribute("a<b")).toBe("a&lt;b");
    });

    it("escapes > to &gt;", () => {
      expect(escapeForAttribute("a>b")).toBe("a&gt;b");
    });

    it("escapes ' to &#x27;", () => {
      expect(escapeForAttribute("a'b")).toBe("a&#x27;b");
    });

    it("escapes ` to &#96;", () => {
      expect(escapeForAttribute("a`b")).toBe("a&#96;b");
    });

    it("escapes all dangerous chars in a single string", () => {
      expect(escapeForAttribute('<">&`\'')).toBe("&lt;&quot;&gt;&amp;&#96;&#x27;");
    });
  });

  describe("escapeForJS()", () => {
    it("escapes backslash", () => {
      expect(escapeForJS("a\\b")).toBe("a\\\\b");
    });

    it("escapes single quotes", () => {
      expect(escapeForJS("a'b")).toBe("a\\'b");
    });

    it("escapes double quotes", () => {
      expect(escapeForJS('a"b')).toBe('a\\"b');
    });

    it("escapes backticks", () => {
      expect(escapeForJS("a`b")).toBe("a\\`b");
    });

    it("escapes newlines", () => {
      expect(escapeForJS("a\nb")).toBe("a\\nb");
    });

    it("escapes carriage returns", () => {
      expect(escapeForJS("a\rb")).toBe("a\\rb");
    });

    it("escapes </ to prevent script tag closing", () => {
      expect(escapeForJS("</script>")).toBe("<\\/script>");
    });
  });
});

// ---------------------------------------------------------------------------
// CSRF Service
// ---------------------------------------------------------------------------
describe("CSRF Service", () => {
  describe("generateCSRFToken()", () => {
    it("returns an object with token string and expiresAt date", () => {
      const result = generateCSRFToken();
      expect(typeof result.token).toBe("string");
      expect(result.token.length).toBeGreaterThan(0);
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it("sets expiresAt approximately 1 hour in the future", () => {
      const before = Date.now();
      const result = generateCSRFToken();
      const after = Date.now();
      const oneHour = 60 * 60 * 1000;
      expect(result.expiresAt.getTime()).toBeGreaterThanOrEqual(before + oneHour - 100);
      expect(result.expiresAt.getTime()).toBeLessThanOrEqual(after + oneHour + 100);
    });
  });

  describe("validateCSRFToken()", () => {
    it("validates a matching, non-expired token", () => {
      const csrf = generateCSRFToken();
      expect(validateCSRFToken(csrf.token, csrf)).toBe(true);
    });

    it("rejects a mismatched token", () => {
      const csrf = generateCSRFToken();
      expect(validateCSRFToken("wrong-token-value-here!", csrf)).toBe(false);
    });

    it("rejects an expired token", () => {
      const csrf = generateCSRFToken();
      // Manually set expiresAt to the past
      csrf.expiresAt = new Date(Date.now() - 1000);
      expect(validateCSRFToken(csrf.token, csrf)).toBe(false);
    });

    it("rejects empty token string", () => {
      const csrf = generateCSRFToken();
      expect(validateCSRFToken("", csrf)).toBe(false);
    });

    it("rejects null stored token", () => {
      expect(validateCSRFToken("some-token", null as any)).toBe(false);
    });

    it("rejects undefined stored token", () => {
      expect(validateCSRFToken("some-token", undefined as any)).toBe(false);
    });
  });

  describe("getCSRFCookieName()", () => {
    it('returns "_csrf"', () => {
      expect(getCSRFCookieName()).toBe("_csrf");
    });
  });

  describe("buildCSRFCookie()", () => {
    it("returns a properly formatted Set-Cookie string", () => {
      const cookie = buildCSRFCookie("test-token-123");
      expect(cookie).toContain("_csrf=test-token-123");
      expect(cookie).toContain("Path=/");
      expect(cookie).toContain("HttpOnly");
      expect(cookie).toContain("SameSite=Strict");
      expect(cookie).toContain("Secure");
      expect(cookie).toContain("Max-Age=3600");
    });

    it("includes the exact token value provided", () => {
      const token = "abc-def-ghi-jkl";
      const cookie = buildCSRFCookie(token);
      expect(cookie).toContain(`_csrf=${token}`);
    });
  });

  describe("cleanupExpiredTokens()", () => {
    it("returns a number indicating how many tokens were removed", () => {
      const removed = cleanupExpiredTokens();
      expect(typeof removed).toBe("number");
      expect(removed).toBeGreaterThanOrEqual(0);
    });

    it("does not remove tokens that are still valid", () => {
      const csrf = generateCSRFToken();
      cleanupExpiredTokens();
      // The token should still validate because it has not expired
      expect(validateCSRFToken(csrf.token, csrf)).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// Rate Limiter
// ---------------------------------------------------------------------------
describe("Rate Limiter", () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter({
      windowMs: 60_000,
      maxRequests: 5,
      keyGenerator: "ip",
      skipSuccessfulRequests: false,
    });
  });

  afterEach(() => {
    limiter.destroy();
  });

  describe("check()", () => {
    it("allows requests within the limit", () => {
      const result = limiter.check("192.168.1.1");
      expect(result.allowed).toBe(true);
    });

    it("returns correct remaining count", () => {
      limiter.check("192.168.1.1");
      const result = limiter.check("192.168.1.1");
      expect(result.remaining).toBe(3); // 5 max - 2 used
    });

    it("blocks requests over the limit", () => {
      for (let i = 0; i < 5; i++) {
        limiter.check("192.168.1.1");
      }
      const result = limiter.check("192.168.1.1");
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("returns retryAfter when blocked", () => {
      for (let i = 0; i < 5; i++) {
        limiter.check("192.168.1.1");
      }
      const result = limiter.check("192.168.1.1");
      expect(result.retryAfter).toBeDefined();
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it("returns a resetAt date in the future", () => {
      const result = limiter.check("192.168.1.1");
      expect(result.resetAt).toBeInstanceOf(Date);
      expect(result.resetAt.getTime()).toBeGreaterThan(Date.now());
    });

    it("tracks different keys independently", () => {
      for (let i = 0; i < 5; i++) {
        limiter.check("192.168.1.1");
      }
      expect(limiter.check("192.168.1.1").allowed).toBe(false);
      expect(limiter.check("192.168.1.2").allowed).toBe(true);
    });

    it("returns remaining=0 on the last allowed request", () => {
      for (let i = 0; i < 4; i++) {
        limiter.check("192.168.1.1");
      }
      const result = limiter.check("192.168.1.1"); // 5th request, last allowed
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(0);
    });
  });

  describe("reset()", () => {
    it("clears the window for a specific key", () => {
      for (let i = 0; i < 5; i++) {
        limiter.check("192.168.1.1");
      }
      expect(limiter.check("192.168.1.1").allowed).toBe(false);

      limiter.reset("192.168.1.1");
      expect(limiter.check("192.168.1.1").allowed).toBe(true);
    });

    it("does not affect other keys", () => {
      limiter.check("192.168.1.1");
      limiter.check("192.168.1.2");
      limiter.reset("192.168.1.1");

      const stats = limiter.getStats();
      expect(stats.activeWindows).toBe(1);
    });
  });

  describe("getStats()", () => {
    it("returns totalBlocked and activeWindows counts", () => {
      const stats = limiter.getStats();
      expect(typeof stats.totalBlocked).toBe("number");
      expect(typeof stats.activeWindows).toBe("number");
    });

    it("tracks blocked count correctly", () => {
      for (let i = 0; i < 5; i++) {
        limiter.check("192.168.1.1");
      }
      limiter.check("192.168.1.1"); // blocked
      limiter.check("192.168.1.1"); // blocked again

      const stats = limiter.getStats();
      expect(stats.totalBlocked).toBe(2);
    });

    it("counts active windows correctly", () => {
      limiter.check("key1");
      limiter.check("key2");
      limiter.check("key3");

      const stats = limiter.getStats();
      expect(stats.activeWindows).toBe(3);
    });
  });

  describe("destroy()", () => {
    it("cleans up the interval timer without errors", () => {
      const localLimiter = new RateLimiter({
        windowMs: 60_000,
        maxRequests: 10,
        keyGenerator: "ip",
        skipSuccessfulRequests: false,
      });
      expect(() => localLimiter.destroy()).not.toThrow();
    });

    it("can be called multiple times safely", () => {
      const localLimiter = new RateLimiter({
        windowMs: 60_000,
        maxRequests: 10,
        keyGenerator: "ip",
        skipSuccessfulRequests: false,
      });
      localLimiter.destroy();
      expect(() => localLimiter.destroy()).not.toThrow();
    });
  });
});

// ---------------------------------------------------------------------------
// IP Blocker
// ---------------------------------------------------------------------------
describe("IP Blocker", () => {
  // The ip-blocker uses a module-level Map, so we clean up between tests.
  afterEach(() => {
    for (const entry of getBlockedIPs()) {
      unblockIP(entry.ip);
    }
  });

  describe("blockIP()", () => {
    it("adds an IP to the blocklist", () => {
      blockIP("10.0.0.1", "test block");
      expect(isBlocked("10.0.0.1").blocked).toBe(true);
    });

    it("stores the reason", () => {
      blockIP("10.0.0.2", "suspicious activity");
      expect(isBlocked("10.0.0.2").reason).toBe("suspicious activity");
    });
  });

  describe("isBlocked()", () => {
    it("returns true for blocked IP", () => {
      blockIP("10.0.0.3", "test");
      const result = isBlocked("10.0.0.3");
      expect(result.blocked).toBe(true);
    });

    it("returns false for unblocked IP", () => {
      const result = isBlocked("10.0.0.99");
      expect(result.blocked).toBe(false);
      expect(result.reason).toBeUndefined();
    });

    it("expires non-permanent blocks", () => {
      // Block with 1ms duration so it expires almost immediately
      blockIP("10.0.0.5", "temp block", false, 1);
      // Spin briefly to ensure expiry
      const start = Date.now();
      while (Date.now() - start < 5) { /* wait */ }
      expect(isBlocked("10.0.0.5").blocked).toBe(false);
    });

    it("does not expire permanent blocks", () => {
      blockIP("10.0.0.6", "permanent block", true);
      expect(isBlocked("10.0.0.6").blocked).toBe(true);
    });

    it("returns reason for blocked IP", () => {
      blockIP("10.0.0.50", "brute force");
      expect(isBlocked("10.0.0.50").reason).toBe("brute force");
    });
  });

  describe("unblockIP()", () => {
    it("removes an IP and returns true", () => {
      blockIP("10.0.0.7", "test");
      expect(unblockIP("10.0.0.7")).toBe(true);
      expect(isBlocked("10.0.0.7").blocked).toBe(false);
    });

    it("returns false for IP that was not blocked", () => {
      expect(unblockIP("10.0.0.200")).toBe(false);
    });
  });

  describe("getBlockedIPs()", () => {
    it("returns all blocked entries", () => {
      blockIP("10.0.0.8", "reason1");
      blockIP("10.0.0.9", "reason2");
      const entries = getBlockedIPs();
      expect(entries.length).toBeGreaterThanOrEqual(2);
      const ips = entries.map((e) => e.ip);
      expect(ips).toContain("10.0.0.8");
      expect(ips).toContain("10.0.0.9");
    });

    it("returns empty array when no IPs blocked", () => {
      const entries = getBlockedIPs();
      expect(entries).toEqual([]);
    });

    it("returns entries with correct structure", () => {
      blockIP("10.0.0.30", "structure test", false, 60_000);
      const entries = getBlockedIPs();
      const entry = entries.find((e) => e.ip === "10.0.0.30");
      expect(entry).toBeDefined();
      expect(entry!.ip).toBe("10.0.0.30");
      expect(entry!.reason).toBe("structure test");
      expect(entry!.blockedAt).toBeInstanceOf(Date);
      expect(entry!.expiresAt).toBeInstanceOf(Date);
      expect(entry!.permanent).toBe(false);
    });
  });

  describe("cleanupExpired()", () => {
    it("removes expired entries and returns count", () => {
      blockIP("10.0.0.10", "expired", false, 1);
      blockIP("10.0.0.11", "permanent", true);
      // Wait for the temp block to expire
      const start = Date.now();
      while (Date.now() - start < 5) { /* wait */ }

      const removed = cleanupExpired();
      expect(removed).toBe(1);
      expect(isBlocked("10.0.0.10").blocked).toBe(false);
      expect(isBlocked("10.0.0.11").blocked).toBe(true);
    });

    it("returns 0 when nothing is expired", () => {
      blockIP("10.0.0.12", "active", false, 60_000);
      const removed = cleanupExpired();
      expect(removed).toBe(0);
    });
  });
});

// ---------------------------------------------------------------------------
// Audit Logger
// ---------------------------------------------------------------------------
describe("Audit Logger", () => {
  // The audit logger uses a module-level array. We use unique shop names
  // per test to isolate filtering results.

  describe("log()", () => {
    it("creates an entry with an id starting with 'audit_'", () => {
      const entry = log({ shop: "audit-test.myshopify.com", action: "test", actor: "system" });
      expect(entry.id).toMatch(/^audit_/);
    });

    it("creates an entry with a timestamp", () => {
      const entry = log({ shop: "audit-test.myshopify.com", action: "test", actor: "system" });
      expect(entry.timestamp).toBeInstanceOf(Date);
    });

    it("preserves the shop, action, and actor fields", () => {
      const entry = log({ shop: "my-shop.myshopify.com", action: "create", actor: "admin" });
      expect(entry.shop).toBe("my-shop.myshopify.com");
      expect(entry.action).toBe("create");
      expect(entry.actor).toBe("admin");
    });

    it("includes optional fields when provided", () => {
      const entry = log({
        shop: "audit-test.myshopify.com",
        action: "update",
        actor: "user1",
        resource: "product",
        resourceId: "123",
        details: "Updated title",
        ipAddress: "10.0.0.1",
        userAgent: "TestAgent/1.0",
      });
      expect(entry.resource).toBe("product");
      expect(entry.resourceId).toBe("123");
      expect(entry.details).toBe("Updated title");
      expect(entry.ipAddress).toBe("10.0.0.1");
    });

    it("generates unique ids for each entry", () => {
      const e1 = log({ shop: "id-test.myshopify.com", action: "a1", actor: "system" });
      const e2 = log({ shop: "id-test.myshopify.com", action: "a2", actor: "system" });
      expect(e1.id).not.toBe(e2.id);
    });

    it("does not throw when adding many entries (MAX_ENTRIES cap)", () => {
      // Smoke test: just verify it accepts entries without throwing
      expect(() => {
        for (let i = 0; i < 100; i++) {
          log({ shop: "cap-test.myshopify.com", action: "bulk", actor: "system" });
        }
      }).not.toThrow();
    });
  });

  describe("getLogsByShop()", () => {
    it("filters entries by shop name", () => {
      const shopName = `filter-shop-${Date.now()}.myshopify.com`;
      log({ shop: shopName, action: "a1", actor: "system" });
      log({ shop: shopName, action: "a2", actor: "system" });
      log({ shop: "other-shop.myshopify.com", action: "a3", actor: "system" });

      const results = getLogsByShop(shopName);
      expect(results.length).toBe(2);
      expect(results.every((e) => e.shop === shopName)).toBe(true);
    });

    it("respects limit parameter", () => {
      const shopName = `limit-shop-${Date.now()}.myshopify.com`;
      for (let i = 0; i < 5; i++) {
        log({ shop: shopName, action: `action-${i}`, actor: "system" });
      }
      const results = getLogsByShop(shopName, 2);
      expect(results.length).toBe(2);
    });

    it("respects offset parameter", () => {
      const shopName = `offset-shop-${Date.now()}.myshopify.com`;
      for (let i = 0; i < 5; i++) {
        log({ shop: shopName, action: `action-${i}`, actor: "system" });
      }
      const results = getLogsByShop(shopName, 100, 3);
      expect(results.length).toBe(2);
    });

    it("returns empty array for unknown shop", () => {
      const results = getLogsByShop("nonexistent-shop-12345.myshopify.com");
      expect(results).toEqual([]);
    });
  });

  describe("getLogsByAction()", () => {
    it("filters entries by action type", () => {
      const action = `unique-action-${Date.now()}`;
      log({ shop: "action-test.myshopify.com", action, actor: "system" });
      log({ shop: "action-test2.myshopify.com", action, actor: "system" });

      const results = getLogsByAction(action);
      expect(results.length).toBe(2);
      expect(results.every((e) => e.action === action)).toBe(true);
    });

    it("respects limit parameter", () => {
      const action = `limited-action-${Date.now()}`;
      for (let i = 0; i < 5; i++) {
        log({ shop: "limit-test.myshopify.com", action, actor: "system" });
      }
      const results = getLogsByAction(action, 3);
      expect(results.length).toBe(3);
    });
  });

  describe("searchLogs()", () => {
    it("searches across action field", () => {
      const unique = `searchable-${Date.now()}`;
      log({ shop: "search-test.myshopify.com", action: unique, actor: "admin", resource: "page" });

      const results = searchLogs(unique);
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].action).toBe(unique);
    });

    it("searches across actor field", () => {
      const uniqueActor = `actor-${Date.now()}`;
      log({ shop: "search-actor.myshopify.com", action: "test", actor: uniqueActor });

      const results = searchLogs(uniqueActor);
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it("is case-insensitive", () => {
      const unique = `CaseTest-${Date.now()}`;
      log({ shop: "case-test.myshopify.com", action: unique, actor: "admin" });

      const results = searchLogs(unique.toLowerCase());
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it("returns empty array when no match", () => {
      const results = searchLogs("xyzzy-nonexistent-query-99999");
      expect(results).toEqual([]);
    });
  });

  describe("exportLogs()", () => {
    it("returns all logs for a given shop", () => {
      const shopName = `export-shop-${Date.now()}.myshopify.com`;
      log({ shop: shopName, action: "e1", actor: "system" });
      log({ shop: shopName, action: "e2", actor: "system" });

      const results = exportLogs(shopName);
      expect(results.length).toBe(2);
      expect(results.every((e) => e.shop === shopName)).toBe(true);
    });

    it("returns empty array for unknown shop", () => {
      const results = exportLogs("never-existed.myshopify.com");
      expect(results).toEqual([]);
    });
  });

  describe("clearOlderThan()", () => {
    it("returns the number of entries removed", () => {
      const removed = clearOlderThan(1);
      expect(typeof removed).toBe("number");
      expect(removed).toBeGreaterThanOrEqual(0);
    });

    it("does not remove recent entries when given a large day value", () => {
      const shopName = `clear-test-${Date.now()}.myshopify.com`;
      log({ shop: shopName, action: "keep-me", actor: "system" });
      clearOlderThan(365); // nothing older than 365 days
      const results = exportLogs(shopName);
      expect(results.length).toBe(1);
    });
  });
});
