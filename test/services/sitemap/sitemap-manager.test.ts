import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  SitemapManager,
  createSitemapManager,
  generateMultilingualSitemap,
  generateSitemapIndexWithChunks,
} from "../../../app/services/sitemap/sitemap-manager";
import type { SitemapManagerConfig } from "../../../app/services/sitemap/sitemap-manager";

describe("SitemapManager", () => {
  const baseConfig: SitemapManagerConfig = {
    baseUrl: "https://example.com",
    defaultLocale: "en",
    locales: ["en", "ar", "he"],
  };

  describe("initialization", () => {
    it("should create a sitemap manager with default config", () => {
      const manager = new SitemapManager(baseConfig);
      const stats = manager.getStats();

      expect(stats.totalPages).toBe(0);
      expect(stats.languages).toEqual(["en", "ar", "he"]);
      expect(stats.defaultLocale).toBe("en");
      expect(stats.autoUpdateEnabled).toBe(false);
    });

    it("should apply custom config options", () => {
      const manager = new SitemapManager({
        ...baseConfig,
        autoUpdateInterval: 30 * 60 * 1000,
        defaultPriority: 0.8,
        defaultChangefreq: "daily",
      });

      expect(manager).toBeDefined();
    });
  });

  describe("page management", () => {
    let manager: SitemapManager;

    beforeEach(() => {
      manager = new SitemapManager(baseConfig);
    });

    it("should add a single page", () => {
      manager.addPage({
        path: "/products/dress",
        priority: 0.8,
        changefreq: "weekly",
      });

      expect(manager.getStats().totalPages).toBe(1);
    });

    it("should add multiple pages", () => {
      manager.addPages([
        { path: "/products/dress", priority: 0.8 },
        { path: "/products/shoes", priority: 0.7 },
        { path: "/collections/summer", priority: 0.6 },
      ]);

      expect(manager.getStats().totalPages).toBe(3);
    });

    it("should remove a page", () => {
      manager.addPage({ path: "/products/dress" });
      const removed = manager.removePage("/products/dress");

      expect(removed).toBe(true);
      expect(manager.getStats().totalPages).toBe(0);
    });

    it("should normalize paths", () => {
      manager.addPage({ path: "products/dress" });
      manager.addPage({ path: "/products/dress/" });

      // Should treat as same path
      expect(manager.getStats().totalPages).toBe(1);
    });

    it("should clear all pages", () => {
      manager.addPages([
        { path: "/products/1" },
        { path: "/products/2" },
      ]);
      manager.clear();

      expect(manager.getStats().totalPages).toBe(0);
    });
  });

  describe("sitemap generation", () => {
    let manager: SitemapManager;

    beforeEach(() => {
      manager = new SitemapManager(baseConfig);
    });

    it("should generate valid XML sitemap", () => {
      manager.addPage({
        path: "/products/dress",
        lastmod: "2026-03-20",
        priority: 0.8,
        changefreq: "weekly",
      });

      const result = manager.generate();

      expect(result.xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(result.xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
      expect(result.xml).toContain("https://example.com/products/dress");
      expect(result.urlCount).toBe(3); // One for each locale
      expect(result.languages).toEqual(["en", "ar", "he"]);
    });

    it("should include hreflang alternates", () => {
      manager.addPage({ path: "/products/dress" });
      const result = manager.generate();

      expect(result.xml).toContain('rel="alternate"');
      expect(result.xml).toContain('hreflang="en"');
      expect(result.xml).toContain('hreflang="ar"');
      expect(result.xml).toContain('hreflang="he"');
      expect(result.xml).toContain('hreflang="x-default"');
    });

    it("should generate locale-specific URLs", () => {
      manager.addPage({ path: "/products/dress" });
      const result = manager.generate();

      expect(result.xml).toContain("https://example.com/products/dress"); // default (en)
      expect(result.xml).toContain("https://example.com/ar/products/dress");
      expect(result.xml).toContain("https://example.com/he/products/dress");
    });

    it("should include lastmod, priority, and changefreq", () => {
      manager.addPage({
        path: "/products/dress",
        lastmod: "2026-03-20",
        priority: 0.8,
        changefreq: "weekly",
      });
      const result = manager.generate();

      expect(result.xml).toContain("<lastmod>2026-03-20</lastmod>");
      expect(result.xml).toContain("<priority>0.8</priority>");
      expect(result.xml).toContain("<changefreq>weekly</changefreq>");
    });

    it("should generate sitemap index for large sites", () => {
      // Set low max URLs to force index generation
      const smallManager = new SitemapManager({
        ...baseConfig,
        maxUrlsPerSitemap: 3,
      });

      for (let i = 0; i < 5; i++) {
        smallManager.addPage({ path: `/products/${i}` });
      }

      const result = smallManager.generateSitemapIndex();

      expect(result.index).toContain("<sitemapindex");
      expect(result.sitemaps.length).toBeGreaterThan(1);
    });
  });

  describe("validation", () => {
    let manager: SitemapManager;

    beforeEach(() => {
      manager = new SitemapManager(baseConfig);
    });

    it("should validate valid sitemap", () => {
      manager.addPage({ path: "/products/dress", priority: 0.8 });
      const validation = manager.validate();

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should detect invalid priority", () => {
      manager.addPage({ path: "/products/dress", priority: 1.5 });
      const validation = manager.validate();

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes("priority"))).toBe(true);
    });

    it("should not warn about auto-generated lastmod", () => {
      manager.addPage({ path: "/products/dress" });
      const validation = manager.validate();

      // Auto-generated lastmod should not trigger warning
      expect(validation.warnings.some(w => w.includes("lastmod"))).toBe(false);
    });
  });

  describe("auto-update", () => {
    it("should start and stop auto-update", () => {
      vi.useFakeTimers();
      const manager = new SitemapManager({
        ...baseConfig,
        autoUpdateInterval: 1000,
      });

      expect(manager.isAutoUpdateRunning()).toBe(false);

      manager.startAutoUpdate();
      expect(manager.isAutoUpdateRunning()).toBe(true);

      manager.stopAutoUpdate();
      expect(manager.isAutoUpdateRunning()).toBe(false);

      vi.useRealTimers();
    });
  });

  describe("standalone functions", () => {
    it("should generate sitemap with standalone function", () => {
      const result = generateMultilingualSitemap(
        [
          { path: "/products/dress", priority: 0.8 },
          { path: "/products/shoes", priority: 0.7 },
        ],
        baseConfig,
      );

      expect(result.xml).toContain("<urlset");
      expect(result.urlCount).toBe(6); // 2 pages × 3 locales
    });

    it("should create sitemap manager with factory function", () => {
      const manager = createSitemapManager(baseConfig);
      expect(manager).toBeInstanceOf(SitemapManager);
    });
  });
});
