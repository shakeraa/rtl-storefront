import { describe, it, expect } from 'vitest';
import {
  generateSitemapXml,
  generateSitemapIndex,
} from '../../app/services/sitemap/generator';
import type { SitemapGeneratorInput } from '../../app/services/sitemap/types';

const baseInput: SitemapGeneratorInput = {
  pages: [
    { path: '/products/dress', lastmod: '2026-01-15', priority: 0.8, changefreq: 'weekly' },
    { path: '/about' },
  ],
  config: {
    baseUrl: 'https://example.com',
    defaultLocale: 'en',
    locales: ['en', 'ar', 'he'],
  },
};

describe('Sitemap — generateSitemapXml', () => {
  it('starts with an XML declaration', () => {
    const xml = generateSitemapXml(baseInput);
    expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  });

  it('contains a <urlset root element with xmlns', () => {
    const xml = generateSitemapXml(baseInput);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  });

  it('contains the xhtml namespace declaration', () => {
    const xml = generateSitemapXml(baseInput);
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
  });

  it('generates <url><loc> entries', () => {
    const xml = generateSitemapXml(baseInput);
    expect(xml).toContain('<url>');
    expect(xml).toContain('<loc>');
    expect(xml).toContain('</url>');
  });

  it('includes loc entries for each locale x page combination', () => {
    const xml = generateSitemapXml(baseInput);
    // 2 pages * 3 locales = 6 <url> entries
    const urlCount = (xml.match(/<url>/g) || []).length;
    expect(urlCount).toBe(6);
  });

  it('contains xhtml:link hreflang annotations', () => {
    const xml = generateSitemapXml(baseInput);
    expect(xml).toContain('xhtml:link rel="alternate"');
    expect(xml).toContain('hreflang="ar"');
    expect(xml).toContain('hreflang="en"');
    expect(xml).toContain('hreflang="he"');
  });

  it('contains x-default hreflang', () => {
    const xml = generateSitemapXml(baseInput);
    expect(xml).toContain('hreflang="x-default"');
  });

  it('contains <lastmod> when provided', () => {
    const xml = generateSitemapXml(baseInput);
    expect(xml).toContain('<lastmod>2026-01-15</lastmod>');
  });

  it('does not contain <lastmod> for pages without it', () => {
    const singleInput: SitemapGeneratorInput = {
      pages: [{ path: '/about' }],
      config: baseInput.config,
    };
    const xml = generateSitemapXml(singleInput);
    expect(xml).not.toContain('<lastmod>');
  });

  it('contains <priority> when provided', () => {
    const xml = generateSitemapXml(baseInput);
    expect(xml).toContain('<priority>0.8</priority>');
  });

  it('contains <changefreq> when provided', () => {
    const xml = generateSitemapXml(baseInput);
    expect(xml).toContain('<changefreq>weekly</changefreq>');
  });

  it('builds correct locale URLs — default locale has no prefix', () => {
    const xml = generateSitemapXml(baseInput);
    expect(xml).toContain('https://example.com/products/dress');
    expect(xml).toContain('https://example.com/ar/products/dress');
    expect(xml).toContain('https://example.com/he/products/dress');
  });

  it('escapes & in URLs to &amp;', () => {
    const input: SitemapGeneratorInput = {
      pages: [{ path: '/search?q=a&b=c' }],
      config: baseInput.config,
    };
    const xml = generateSitemapXml(input);
    expect(xml).toContain('&amp;');
    expect(xml).not.toMatch(/<loc>[^<]*[^p]&[^a][^<]*<\/loc>/);
  });

  it('strips trailing slash from base URL', () => {
    const input: SitemapGeneratorInput = {
      pages: [{ path: '/about' }],
      config: { ...baseInput.config, baseUrl: 'https://example.com/' },
    };
    const xml = generateSitemapXml(input);
    expect(xml).toContain('https://example.com/about');
    expect(xml).not.toContain('https://example.com//about');
  });
});

describe('Sitemap — generateSitemapIndex', () => {
  it('starts with an XML declaration', () => {
    const xml = generateSitemapIndex([
      { loc: 'https://example.com/sitemap-1.xml' },
    ]);
    expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  });

  it('contains a <sitemapindex root element with xmlns', () => {
    const xml = generateSitemapIndex([
      { loc: 'https://example.com/sitemap-1.xml' },
    ]);
    expect(xml).toContain('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  });

  it('contains <sitemap><loc> entries', () => {
    const xml = generateSitemapIndex([
      { loc: 'https://example.com/sitemap-1.xml' },
      { loc: 'https://example.com/sitemap-2.xml' },
    ]);
    const sitemapCount = (xml.match(/<sitemap>/g) || []).length;
    expect(sitemapCount).toBe(2);
    expect(xml).toContain('<loc>https://example.com/sitemap-1.xml</loc>');
    expect(xml).toContain('<loc>https://example.com/sitemap-2.xml</loc>');
  });

  it('includes <lastmod> in sitemap index when provided', () => {
    const xml = generateSitemapIndex([
      { loc: 'https://example.com/sitemap-1.xml', lastmod: '2026-03-01' },
    ]);
    expect(xml).toContain('<lastmod>2026-03-01</lastmod>');
  });

  it('omits <lastmod> in sitemap index when not provided', () => {
    const xml = generateSitemapIndex([
      { loc: 'https://example.com/sitemap-1.xml' },
    ]);
    expect(xml).not.toContain('<lastmod>');
  });
});
