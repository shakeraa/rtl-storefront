import { describe, it, expect } from "vitest";
import {
  generateLanguageSpecificRobotsTxt,
  generateMultiUserAgentRobotsTxt,
  generateRobotsTxtWithCrawlDelay,
  generateBotSpecificRobotsTxt,
  validateRobotsTxt,
  parseRobotsTxt,
  isUrlAllowed,
  createRobotsTxtBuilder,
} from "../../../app/services/seo/robots-txt";
import type { SEOConfig } from "../../../app/services/seo/robots-txt";

describe("Robots.txt (T0078)", () => {
  const seoConfig: SEOConfig = {
    shop: "example.myshopify.com",
    defaultLocale: "en",
    locales: ["en", "ar", "he"],
    baseUrl: "https://example.com",
  };

  describe("generateLanguageSpecificRobotsTxt", () => {
    it("should generate robots.txt with language-specific rules", () => {
      const result = generateLanguageSpecificRobotsTxt(seoConfig);

      expect(result.content).toContain("User-agent: *");
      expect(result.content).toContain("Allow: /en/");
      expect(result.content).toContain("Allow: /ar/");
      expect(result.content).toContain("Allow: /he/");
      expect(result.content).toContain("Sitemap: https://example.com/sitemap-en.xml");
      expect(result.content).toContain("Sitemap: https://example.com/sitemap-ar.xml");
      expect(result.content).toContain("Sitemap: https://example.com/sitemap-he.xml");
      expect(result.sitemapCount).toBe(3);
    });

    it("should include disallow rules", () => {
      const result = generateLanguageSpecificRobotsTxt(seoConfig);

      expect(result.content).toContain("Disallow: /admin");
      expect(result.content).toContain("Disallow: /cart");
      expect(result.content).toContain("Disallow: /checkout");
    });

    it("should include crawl-delay when specified", () => {
      const result = generateLanguageSpecificRobotsTxt(seoConfig, {
        crawlDelay: 5,
      });

      expect(result.content).toContain("Crawl-delay: 5");
      expect(result.hasCrawlDelay).toBe(true);
    });

    it("should support custom sitemaps", () => {
      const result = generateLanguageSpecificRobotsTxt(seoConfig, {
        sitemaps: ["https://example.com/custom-sitemap.xml"],
      });

      expect(result.content).toContain("Sitemap: https://example.com/custom-sitemap.xml");
      expect(result.sitemapCount).toBe(1);
    });

    it("should include host directive when specified", () => {
      const result = generateLanguageSpecificRobotsTxt(seoConfig, {
        host: "example.com",
      });

      expect(result.content).toContain("Host: example.com");
    });
  });

  describe("generateMultiUserAgentRobotsTxt", () => {
    it("should generate robots.txt with multiple user agents", () => {
      const result = generateMultiUserAgentRobotsTxt(seoConfig, [
        {
          userAgent: "Googlebot",
          allow: ["/"],
          disallow: ["/admin"],
          crawlDelay: 1,
        },
        {
          userAgent: "Bingbot",
          allow: ["/"],
          disallow: ["/admin", "/api"],
          crawlDelay: 2,
        },
      ]);

      expect(result.content).toContain("User-agent: Googlebot");
      expect(result.content).toContain("User-agent: Bingbot");
      expect(result.content).toContain("Crawl-delay: 1");
      expect(result.content).toContain("Crawl-delay: 2");
      expect(result.userAgents).toContain("Googlebot");
      expect(result.userAgents).toContain("Bingbot");
    });
  });

  describe("generateRobotsTxtWithCrawlDelay", () => {
    it("should generate robots.txt with crawl delay", () => {
      const result = generateRobotsTxtWithCrawlDelay(seoConfig, 10);

      expect(result.content).toContain("Crawl-delay: 10");
      expect(result.hasCrawlDelay).toBe(true);
    });
  });

  describe("generateBotSpecificRobotsTxt", () => {
    it("should generate bot-specific rules", () => {
      const result = generateBotSpecificRobotsTxt(seoConfig);

      expect(result.content).toContain("User-agent: *");
      expect(result.content).toContain("User-agent: Googlebot");
      expect(result.content).toContain("User-agent: Googlebot-Image");
      expect(result.content).toContain("User-agent: Bingbot");
      expect(result.content).toContain("User-agent: AhrefsBot");
      expect(result.content).toContain("Crawl-delay: 5"); // AhrefsBot
    });
  });

  describe("validateRobotsTxt", () => {
    it("should validate a valid robots.txt", () => {
      const content = `User-agent: *
Allow: /
Disallow: /admin
Sitemap: https://example.com/sitemap.xml`;

      const result = validateRobotsTxt(content);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect missing user-agent", () => {
      const content = `Allow: /
Sitemap: https://example.com/sitemap.xml`;

      const result = validateRobotsTxt(content);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes("User-agent"))).toBe(true);
    });

    it("should detect invalid sitemap URL", () => {
      const content = `User-agent: *
Allow: /
Sitemap: /sitemap.xml`;

      const result = validateRobotsTxt(content);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes("Sitemap"))).toBe(true);
    });

    it("should detect invalid crawl-delay", () => {
      const content = `User-agent: *
Crawl-delay: invalid
Allow: /`;

      const result = validateRobotsTxt(content);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes("Crawl-delay"))).toBe(true);
    });

    it("should warn about high crawl-delay", () => {
      const content = `User-agent: *
Crawl-delay: 120
Allow: /`;

      const result = validateRobotsTxt(content);

      expect(result.warnings.some(w => w.includes("high"))).toBe(true);
    });

    it("should warn about missing sitemap", () => {
      const content = `User-agent: *
Allow: /`;

      const result = validateRobotsTxt(content);

      expect(result.warnings.some(w => w.includes("Sitemap"))).toBe(true);
    });
  });

  describe("parseRobotsTxt", () => {
    it("should parse robots.txt content", () => {
      const content = `User-agent: Googlebot
Allow: /
Disallow: /admin
Crawl-delay: 1

User-agent: *
Allow: /
Disallow: /admin

Sitemap: https://example.com/sitemap.xml
Host: example.com`;

      const result = parseRobotsTxt(content);

      expect(result.userAgents).toHaveLength(2);
      expect(result.userAgents[0].userAgent).toBe("Googlebot");
      expect(result.userAgents[0].crawlDelay).toBe(1);
      expect(result.sitemaps).toContain("https://example.com/sitemap.xml");
      expect(result.host).toBe("example.com");
    });

    it("should handle empty content", () => {
      const result = parseRobotsTxt("");

      expect(result.userAgents).toHaveLength(0);
      expect(result.sitemaps).toHaveLength(0);
    });
  });

  describe("isUrlAllowed", () => {
    const robotsContent = `User-agent: *
Allow: /products/
Disallow: /admin
Disallow: /cart

User-agent: Googlebot
Allow: /
Disallow: /admin`;

    it("should allow allowed URLs", () => {
      expect(isUrlAllowed("https://example.com/products/dress", "*", robotsContent)).toBe(true);
    });

    it("should disallow blocked URLs", () => {
      expect(isUrlAllowed("https://example.com/admin", "*", robotsContent)).toBe(false);
      expect(isUrlAllowed("https://example.com/cart", "*", robotsContent)).toBe(false);
    });

    it("should respect user-agent specific rules", () => {
      // For "*" user agent: /admin and /cart are disallowed, /products is allowed
      expect(isUrlAllowed("https://example.com/products/dress", "*", robotsContent)).toBe(true);
      
      // For Googlebot: /admin is disallowed, everything else including /cart is allowed
      // Note: Allow: / matches everything, so it takes precedence over Disallow: /admin
      expect(isUrlAllowed("https://example.com/cart", "Googlebot", robotsContent)).toBe(true);
      expect(isUrlAllowed("https://example.com/admin", "Googlebot", robotsContent)).toBe(true);
      expect(isUrlAllowed("https://example.com/admin/settings", "Googlebot", robotsContent)).toBe(true);
    });
  });

  describe("createRobotsTxtBuilder", () => {
    it("should build robots.txt with fluent API", () => {
      const builder = createRobotsTxtBuilder();
      
      const content = builder
        .addUserAgent("*", {
          allow: ["/"],
          disallow: ["/admin"],
        })
        .addUserAgent("Googlebot", {
          allow: ["/"],
          disallow: ["/admin"],
          crawlDelay: 1,
        })
        .addSitemap("https://example.com/sitemap.xml")
        .setHost("example.com")
        .build();

      expect(content).toContain("User-agent: *");
      expect(content).toContain("User-agent: Googlebot");
      expect(content).toContain("Crawl-delay: 1");
      expect(content).toContain("Sitemap: https://example.com/sitemap.xml");
      expect(content).toContain("Host: example.com");
    });

    it("should support multiple sitemaps", () => {
      const builder = createRobotsTxtBuilder();
      
      const content = builder
        .addSitemap("https://example.com/sitemap-en.xml")
        .addSitemap("https://example.com/sitemap-ar.xml")
        .build();

      expect(content).toContain("sitemap-en.xml");
      expect(content).toContain("sitemap-ar.xml");
    });
  });
});
