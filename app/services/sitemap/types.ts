export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
  alternates?: Array<{ locale: string; href: string }>;
}

export interface SitemapConfig {
  baseUrl: string;
  defaultLocale: string;
  locales: string[];
  includeImages?: boolean;
}

export interface SitemapGeneratorInput {
  pages: Array<{
    path: string;
    lastmod?: string;
    priority?: number;
    changefreq?: SitemapUrl["changefreq"];
  }>;
  config: SitemapConfig;
}
