/**
 * Performance Service Constants
 */

export const CACHE_DURATIONS = {
  translation: 86400, // 24 hours
  font: 31536000, // 1 year
  static: 604800, // 1 week
  api: 300, // 5 minutes
};

export const COMPRESSION_LEVELS = {
  gzip: 6,
  brotli: 4,
};

export const LAZY_LOAD_CONFIG = {
  rootMargin: '50px',
  threshold: 0.1,
};

export const FONT_DISPLAY = 'swap';

export const RESOURCE_HINTS = {
  preconnect: [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdn.shopify.com',
  ],
  prefetch: [],
  preload: [],
};
