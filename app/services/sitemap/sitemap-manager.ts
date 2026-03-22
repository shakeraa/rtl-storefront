/**
 * Sitemap Manager (T0077)
 *
 * Comprehensive multi-language XML sitemap management with:
 * - Single sitemap with all languages
 * - hreflang annotations
 * - x-default specified
 * - Lastmod dates
 * - Priority values
 * - Automatic updates
 */

import type { SitemapConfig, SitemapUrl } from "./types";

export interface SitemapPageEntry {
  path: string;
  lastmod?: string;
  priority?: number;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  /** Alternative URLs for different locales */
  alternates?: Record<string, string>;
}

export interface SitemapManagerConfig extends SitemapConfig {
  /** Auto-update interval in milliseconds (default: 1 hour) */
  autoUpdateInterval?: number;
  /** Maximum URLs per sitemap file (default: 50000) */
  maxUrlsPerSitemap?: number;
  /** Include image sitemaps */
  includeImages?: boolean;
  /** Default priority for pages without explicit priority */
  defaultPriority?: number;
  /** Default changefreq for pages without explicit changefreq */
  defaultChangefreq?: SitemapPageEntry["changefreq"];
}

export interface GeneratedSitemap {
  xml: string;
  urlCount: number;
  languages: string[];
  lastGenerated: string;
  fileSize: number;
}

export interface SitemapIndexEntry {
  loc: string;
  lastmod?: string;
}

/**
 * Sitemap Manager class for comprehensive sitemap handling
 */
export class SitemapManager {
  private config: SitemapManagerConfig;
  private pages: Map<string, SitemapPageEntry> = new Map();
  private lastGenerated: Date | null = null;
  private updateTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: SitemapManagerConfig) {
    this.config = {
      autoUpdateInterval: 60 * 60 * 1000, // 1 hour
      maxUrlsPerSitemap: 50000,
      defaultPriority: 0.5,
      defaultChangefreq: "weekly",
      ...config,
    };
  }

  /**
   * Add or update a page in the sitemap
   */
  addPage(entry: SitemapPageEntry): void {
    const normalizedPath = this.normalizePath(entry.path);
    this.pages.set(normalizedPath, {
      ...entry,
      path: normalizedPath,
      lastmod: entry.lastmod || new Date().toISOString().split("T")[0],
      priority: entry.priority ?? this.config.defaultPriority,
      changefreq: entry.changefreq || this.config.defaultChangefreq,
    });
  }

  /**
   * Remove a page from the sitemap
   */
  removePage(path: string): boolean {
    return this.pages.delete(this.normalizePath(path));
  }

  /**
   * Add multiple pages at once
   */
  addPages(entries: SitemapPageEntry[]): void {
    for (const entry of entries) {
      this.addPage(entry);
    }
  }

  /**
   * Generate the complete multi-language sitemap XML
   */
  generate(): GeneratedSitemap {
    const urls = this.buildUrlEntries();
    const xml = this.buildSitemapXml(urls);
    
    this.lastGenerated = new Date();

    return {
      xml,
      urlCount: urls.length,
      languages: [...this.config.locales],
      lastGenerated: this.lastGenerated.toISOString(),
      fileSize: new Blob([xml]).size,
    };
  }

  /**
   * Generate sitemap index for large sites (when URLs exceed maxUrlsPerSitemap)
   */
  generateSitemapIndex(): { index: string; sitemaps: GeneratedSitemap[] } {
    const allUrls = this.buildUrlEntries();
    const { maxUrlsPerSitemap, baseUrl } = this.config;
    
    if (allUrls.length <= maxUrlsPerSitemap) {
      const sitemap = this.generate();
      return {
        index: this.buildSitemapIndexXml([{ loc: `${baseUrl}/sitemap.xml`, lastmod: new Date().toISOString() }]),
        sitemaps: [sitemap],
      };
    }

    // Split into multiple sitemaps
    const sitemaps: GeneratedSitemap[] = [];
    const indexEntries: SitemapIndexEntry[] = [];
    const chunks = this.chunkArray(allUrls, maxUrlsPerSitemap);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const sitemapNumber = i + 1;
      const xml = this.buildSitemapXml(chunk);
      
      sitemaps.push({
        xml,
        urlCount: chunk.length,
        languages: [...this.config.locales],
        lastGenerated: new Date().toISOString(),
        fileSize: new Blob([xml]).size,
      });

      indexEntries.push({
        loc: `${baseUrl}/sitemap-${sitemapNumber}.xml`,
        lastmod: new Date().toISOString(),
      });
    }

    return {
      index: this.buildSitemapIndexXml(indexEntries),
      sitemaps,
    };
  }

  /**
   * Start automatic sitemap updates
   */
  startAutoUpdate(): void {
    this.stopAutoUpdate();
    this.updateTimer = setInterval(() => {
      this.generate();
    }, this.config.autoUpdateInterval);
  }

  /**
   * Stop automatic sitemap updates
   */
  stopAutoUpdate(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  /**
   * Check if automatic updates are running
   */
  isAutoUpdateRunning(): boolean {
    return this.updateTimer !== null;
  }

  /**
   * Get sitemap statistics
   */
  getStats(): {
    totalPages: number;
    languages: string[];
    defaultLocale: string;
    lastGenerated: string | null;
    autoUpdateEnabled: boolean;
  } {
    return {
      totalPages: this.pages.size,
      languages: [...this.config.locales],
      defaultLocale: this.config.defaultLocale,
      lastGenerated: this.lastGenerated?.toISOString() || null,
      autoUpdateEnabled: this.isAutoUpdateRunning(),
    };
  }

  /**
   * Validate the sitemap for SEO best practices
   */
  validate(): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check locales
    if (!this.config.locales || this.config.locales.length === 0) {
      errors.push("At least one locale must be configured");
    }

    if (!this.config.locales.includes(this.config.defaultLocale)) {
      errors.push("Default locale must be in the locales list");
    }

    // Check base URL
    if (!this.config.baseUrl || !this.config.baseUrl.startsWith("http")) {
      errors.push("Valid base URL (starting with http/https) is required");
    }

    // Check for duplicate URLs
    const urlSet = new Set<string>();
    for (const [path, entry] of this.pages) {
      const fullUrl = this.buildFullUrl(path);
      if (urlSet.has(fullUrl)) {
        errors.push(`Duplicate URL detected: ${fullUrl}`);
      }
      urlSet.add(fullUrl);

      // Validate priority range
      if (entry.priority !== undefined && (entry.priority < 0 || entry.priority > 1)) {
        errors.push(`Invalid priority for ${path}: must be between 0 and 1`);
      }

      // Warnings for missing metadata
      if (!entry.lastmod) {
        warnings.push(`Missing lastmod for ${path}`);
      }
      if (entry.priority === undefined) {
        warnings.push(`Missing priority for ${path}, using default`);
      }
    }

    // Check sitemap size
    const totalUrls = this.pages.size * this.config.locales.length;
    if (totalUrls > 50000) {
      warnings.push(`Sitemap will have ${totalUrls} URLs, exceeding recommended 50,000. Consider using sitemap index.`);
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Clear all pages from the sitemap
   */
  clear(): void {
    this.pages.clear();
    this.lastGenerated = null;
  }

  /**
   * Dispose of the manager and clean up resources
   */
  dispose(): void {
    this.stopAutoUpdate();
    this.clear();
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private buildUrlEntries(): SitemapUrl[] {
    const urls: SitemapUrl[] = [];
    const { baseUrl, locales, defaultLocale } = this.config;

    for (const [path, entry] of this.pages) {
      // Build alternates for all locales
      const alternates = locales.map(locale => ({
        locale,
        href: this.buildLocaleUrl(path, locale, defaultLocale),
      }));

      // Add x-default pointing to default locale
      alternates.push({
        locale: "x-default",
        href: this.buildLocaleUrl(path, defaultLocale, defaultLocale),
      });

      // Create URL entry for each locale
      for (const locale of locales) {
        urls.push({
          loc: this.buildLocaleUrl(path, locale, defaultLocale),
          lastmod: entry.lastmod,
          changefreq: entry.changefreq,
          priority: entry.priority,
          alternates,
        });
      }
    }

    return urls;
  }

  private buildSitemapXml(urls: SitemapUrl[]): string {
    const urlEntries = urls.map(url => {
      const parts: string[] = [];
      parts.push("  <url>");
      parts.push(`    <loc>${this.escapeXml(url.loc)}</loc>`);

      if (url.lastmod) {
        parts.push(`    <lastmod>${this.escapeXml(url.lastmod)}</lastmod>`);
      }
      if (url.changefreq) {
        parts.push(`    <changefreq>${this.escapeXml(url.changefreq)}</changefreq>`);
      }
      if (url.priority !== undefined) {
        parts.push(`    <priority>${url.priority.toFixed(1)}</priority>`);
      }

      if (url.alternates && url.alternates.length > 0) {
        for (const alt of url.alternates) {
          parts.push(
            `    <xhtml:link rel="alternate" hreflang="${this.escapeXml(alt.locale)}" href="${this.escapeXml(alt.href)}" />`
          );
        }
      }

      parts.push("  </url>");
      return parts.join("\n");
    });

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
      '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
      urlEntries.join("\n"),
      "</urlset>",
    ].join("\n");
  }

  private buildSitemapIndexXml(entries: SitemapIndexEntry[]): string {
    const sitemapEntries = entries
      .map(entry => {
        const lastmodTag = entry.lastmod
          ? `\n    <lastmod>${this.escapeXml(entry.lastmod)}</lastmod>`
          : "";
        return `  <sitemap>\n    <loc>${this.escapeXml(entry.loc)}</loc>${lastmodTag}\n  </sitemap>`;
      })
      .join("\n");

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      sitemapEntries,
      "</sitemapindex>",
    ].join("\n");
  }

  private buildLocaleUrl(path: string, locale: string, defaultLocale: string): string {
    const base = this.config.baseUrl.replace(/\/+$/, "");
    const normalizedPath = path === "/" ? "" : path;
    
    if (locale === defaultLocale) {
      return `${base}${normalizedPath}`;
    }
    return `${base}/${locale}${normalizedPath}`;
  }

  private buildFullUrl(path: string): string {
    return this.buildLocaleUrl(path, this.config.defaultLocale, this.config.defaultLocale);
  }

  private normalizePath(path: string): string {
    let p = path.trim();
    if (!p.startsWith("/")) {
      p = `/${p}`;
    }
    if (p.length > 1 && p.endsWith("/")) {
      p = p.slice(0, -1);
    }
    return p;
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// ---------------------------------------------------------------------------
// Standalone functions for simpler use cases
// ---------------------------------------------------------------------------

/**
 * Create a new sitemap manager instance
 */
export function createSitemapManager(config: SitemapManagerConfig): SitemapManager {
  return new SitemapManager(config);
}

/**
 * Generate a complete sitemap from page entries
 */
export function generateMultilingualSitemap(
  pages: SitemapPageEntry[],
  config: SitemapManagerConfig,
): GeneratedSitemap {
  const manager = new SitemapManager(config);
  manager.addPages(pages);
  return manager.generate();
}

/**
 * Generate a sitemap index for large sites
 */
export function generateSitemapIndexWithChunks(
  pages: SitemapPageEntry[],
  config: SitemapManagerConfig,
): { index: string; sitemaps: GeneratedSitemap[] } {
  const manager = new SitemapManager(config);
  manager.addPages(pages);
  return manager.generateSitemapIndex();
}
