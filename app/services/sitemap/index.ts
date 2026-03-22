export type {
  SitemapUrl,
  SitemapConfig,
  SitemapGeneratorInput,
} from "./types";

export {
  generateSitemapXml,
  generateSitemapIndex,
} from "./generator";

export {
  SitemapManager,
  createSitemapManager,
  generateMultilingualSitemap,
  generateSitemapIndexWithChunks,
} from "./sitemap-manager";

export type {
  SitemapPageEntry,
  SitemapManagerConfig,
  GeneratedSitemap,
  SitemapIndexEntry,
} from "./sitemap-manager";
