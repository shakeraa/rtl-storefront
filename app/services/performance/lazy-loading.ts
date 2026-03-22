/**
 * T0152 — Performance Lazy Loading Implementation
 *
 * Provides lazy loading capabilities for images, components, and translation bundles
 * with RTL-specific optimizations and IntersectionObserver-based loading.
 */

/** Loading priority levels */
export type LoadingPriority = "eager" | "lazy" | "auto";

/** RTL text direction */
export type TextDirection = "rtl" | "ltr";

/** Image loading options */
export interface ImageLoadOptions {
  /** Source URL of the image */
  src: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Loading priority */
  priority?: LoadingPriority;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Threshold for intersection observer (0-1) */
  threshold?: number;
  /** Callback when image loads */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: (error: Error) => void;
  /** Whether the image is for RTL content (affects placeholder/sizing) */
  isRTL?: boolean;
  /** Placeholder image URL while loading */
  placeholderSrc?: string;
  /** Image sizes for responsive loading */
  sizes?: string;
  /** Srcset for responsive images */
  srcset?: string;
}

/** Lazy loader configuration */
export interface LazyLoaderConfig {
  /** Default root margin for intersection observer */
  defaultRootMargin?: string;
  /** Default threshold for intersection observer */
  defaultThreshold?: number;
  /** Whether to enable debug logging */
  debug?: boolean;
  /** Maximum concurrent loads */
  maxConcurrentLoads?: number;
  /** Retry attempts for failed loads */
  retryAttempts?: number;
  /** Delay between retries in ms */
  retryDelay?: number;
}

/** Translation bundle metadata */
export interface TranslationBundle {
  locale: string;
  direction: TextDirection;
  messages: Record<string, string>;
  loadedAt: number;
}

/** Component loader function type */
export type ComponentLoader<T> = () => Promise<{ default: T } | T>;

/** Lazy load entry for tracking */
export interface LazyLoadEntry {
  id: string;
  priority: LoadingPriority;
  element?: Element;
  loadFn: () => Promise<void>;
  status: "pending" | "loading" | "loaded" | "error";
  retryCount: number;
  error?: Error;
}

/** Intersection observer entry wrapper */
export interface IntersectionEntry {
  target: Element;
  isIntersecting: boolean;
  intersectionRatio: number;
  boundingClientRect: DOMRectReadOnly;
  intersectionRect: DOMRectReadOnly;
  rootBounds: DOMRectReadOnly | null;
  time: number;
}

/** Image load result */
export interface ImageLoadResult {
  success: boolean;
  src: string;
  element?: HTMLImageElement;
  error?: Error;
  loadTime: number;
}

/** Component load result */
export interface ComponentLoadResult<T> {
  success: boolean;
  component?: T;
  error?: Error;
  loadTime: number;
}

/** Translation load result */
export interface TranslationLoadResult {
  success: boolean;
  bundle?: TranslationBundle;
  error?: Error;
  loadTime: number;
}

/** Default configuration */
const DEFAULT_CONFIG: Required<LazyLoaderConfig> = {
  defaultRootMargin: "50px",
  defaultThreshold: 0.01,
  debug: false,
  maxConcurrentLoads: 6,
  retryAttempts: 3,
  retryDelay: 1000,
};

/** RTL locales set for quick lookup */
const RTL_LOCALES = new Set([
  "ar", "ar-SA", "ar-AE", "ar-EG", "ar-IQ", "ar-JO", "ar-KW", "ar-LB",
  "ar-LY", "ar-MA", "ar-OM", "ar-QA", "ar-SD", "ar-SY", "ar-TN", "ar-YE",
  "he", "he-IL",
  "fa", "fa-IR",
  "ur", "ur-PK",
  "ps", "ps-AF",
  "ku", "ku-IQ",
  "sd", "sd-PK",
  "ug", "ug-CN",
  "dv", "dv-MV",
]);

/** In-memory cache for loaded images */
const imageCache = new Map<string, HTMLImageElement>();

/** In-memory cache for translation bundles */
const translationCache = new Map<string, TranslationBundle>();

/** Active lazy loaders registry */
const activeLoaders = new Set<LazyLoader>();

/**
 * Check if a locale is RTL
 */
export function isRTLLocale(locale: string): boolean {
  const baseLocale = locale.toLowerCase().split("-")[0];
  return RTL_LOCALES.has(locale.toLowerCase()) || RTL_LOCALES.has(baseLocale);
}

/**
 * Get text direction for a locale
 */
export function getLocaleDirection(locale: string): TextDirection {
  return isRTLLocale(locale) ? "rtl" : "ltr";
}

/**
 * LazyLoader class - manages lazy loading with IntersectionObserver
 */
export class LazyLoader {
  private observer: IntersectionObserver | null = null;
  private entries = new Map<string, LazyLoadEntry>();
  private config: Required<LazyLoaderConfig>;
  private loadingCount = 0;
  private pendingQueue: LazyLoadEntry[] = [];

  constructor(config: LazyLoaderConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    if (typeof window !== "undefined") {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          rootMargin: this.config.defaultRootMargin,
          threshold: this.config.defaultThreshold,
        }
      );
    }
    
    activeLoaders.add(this);
  }

  /**
   * Handle intersection observer callbacks
   */
  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    for (const entry of entries) {
      const id = this.getEntryId(entry.target);
      const lazyEntry = this.entries.get(id);
      
      if (!lazyEntry) continue;

      if (entry.isIntersecting) {
        this.loadEntry(lazyEntry);
      }
    }
  }

  /**
   * Get unique ID for an element
   */
  private getEntryId(element: Element): string {
    // Use data attribute or generate unique ID
    let id = element.getAttribute("data-lazy-id");
    if (!id) {
      id = `lazy-${Math.random().toString(36).substring(2, 11)}`;
      element.setAttribute("data-lazy-id", id);
    }
    return id;
  }

  /**
   * Register an element for lazy loading
   */
  register(
    element: Element,
    loadFn: () => Promise<void>,
    priority: LoadingPriority = "lazy"
  ): string {
    const id = this.getEntryId(element);
    
    const entry: LazyLoadEntry = {
      id,
      priority,
      element,
      loadFn,
      status: "pending",
      retryCount: 0,
    };

    this.entries.set(id, entry);

    // Eager loads happen immediately
    if (priority === "eager") {
      this.loadEntry(entry);
    } else if (this.observer) {
      this.observer.observe(element);
    }

    return id;
  }

  /**
   * Load a specific entry
   */
  private async loadEntry(entry: LazyLoadEntry): Promise<void> {
    // Check concurrency limit
    if (this.loadingCount >= this.config.maxConcurrentLoads) {
      this.pendingQueue.push(entry);
      return;
    }

    // Stop observing once loading starts
    if (entry.element && this.observer) {
      this.observer.unobserve(entry.element);
    }

    entry.status = "loading";
    this.loadingCount++;

    const startTime = performance.now();

    try {
      await entry.loadFn();
      entry.status = "loaded";
      
      if (this.config.debug) {
        console.log(`[LazyLoader] Loaded ${entry.id} in ${performance.now() - startTime}ms`);
      }
    } catch (error) {
      entry.status = "error";
      entry.error = error instanceof Error ? error : new Error(String(error));
      
      // Retry logic
      if (entry.retryCount < this.config.retryAttempts) {
        entry.retryCount++;
        entry.status = "pending";
        
        await this.delay(this.config.retryDelay * entry.retryCount);
        this.loadingCount--;
        this.processQueue();
        await this.loadEntry(entry);
        return;
      }

      if (this.config.debug) {
        console.error(`[LazyLoader] Failed to load ${entry.id}:`, entry.error);
      }
    }

    this.loadingCount--;
    this.processQueue();
  }

  /**
   * Process the pending queue
   */
  private processQueue(): void {
    while (
      this.pendingQueue.length > 0 &&
      this.loadingCount < this.config.maxConcurrentLoads
    ) {
      const entry = this.pendingQueue.shift();
      if (entry) {
        this.loadEntry(entry);
      }
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Unregister an entry
   */
  unregister(id: string): void {
    const entry = this.entries.get(id);
    if (entry?.element && this.observer) {
      this.observer.unobserve(entry.element);
    }
    this.entries.delete(id);
  }

  /**
   * Get entry status
   */
  getStatus(id: string): LazyLoadEntry["status"] | null {
    return this.entries.get(id)?.status ?? null;
  }

  /**
   * Get all entries
   */
  getEntries(): LazyLoadEntry[] {
    return Array.from(this.entries.values());
  }

  /**
   * Destroy the loader
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.entries.clear();
    this.pendingQueue = [];
    activeLoaders.delete(this);
  }
}

/**
 * Create a new lazy loader instance
 */
export function createLazyLoader(options: LazyLoaderConfig = {}): LazyLoader {
  return new LazyLoader(options);
}

/**
 * Load an image with lazy loading support
 */
export function loadImage(src: string, options: Partial<ImageLoadOptions> = {}): Promise<ImageLoadResult> {
  const startTime = performance.now();

  return new Promise((resolve) => {
    // Check cache first
    const cached = imageCache.get(src);
    if (cached) {
      resolve({
        success: true,
        src,
        element: cached,
        loadTime: performance.now() - startTime,
      });
      return;
    }

    // Handle eager loading immediately
    if (options.priority === "eager") {
      performImageLoad(src, options, startTime, resolve);
      return;
    }

    // For lazy/auto, use IntersectionObserver if element provided
    if (options.priority === "lazy" && typeof window !== "undefined") {
      // If no element provided, load immediately but defer
      if (!options.onLoad) {
        requestIdleCallback(() => {
          performImageLoad(src, options, startTime, resolve);
        });
        return;
      }
    }

    performImageLoad(src, options, startTime, resolve);
  });
}

/**
 * Perform actual image loading
 */
function performImageLoad(
  src: string,
  options: Partial<ImageLoadOptions>,
  startTime: number,
  resolve: (result: ImageLoadResult) => void
): void {
  const img = new Image();
  
  if (options.srcset) {
    img.srcset = options.srcset;
  }
  
  if (options.sizes) {
    img.sizes = options.sizes;
  }

  // Set RTL attribute if needed
  if (options.isRTL) {
    img.setAttribute("dir", "rtl");
  }

  img.onload = () => {
    imageCache.set(src, img);
    options.onLoad?.();
    resolve({
      success: true,
      src,
      element: img,
      loadTime: performance.now() - startTime,
    });
  };

  img.onerror = () => {
    const error = new Error(`Failed to load image: ${src}`);
    options.onError?.(error);
    resolve({
      success: false,
      src,
      error,
      loadTime: performance.now() - startTime,
    });
  };

  // Use placeholder while loading if provided
  if (options.placeholderSrc) {
    const placeholderImg = new Image();
    placeholderImg.src = options.placeholderSrc;
  }

  img.src = src;
}

/**
 * Preload an image into cache
 */
export function preloadImage(src: string): Promise<boolean> {
  return loadImage(src, { priority: "eager" })
    .then((result) => result.success)
    .catch(() => false);
}

/**
 * Check if an image is in cache
 */
export function isImageCached(src: string): boolean {
  return imageCache.has(src);
}

/**
 * Clear image cache
 */
export function clearImageCache(): void {
  imageCache.clear();
}

/**
 * Load a translation bundle for a locale
 */
export async function loadTranslationBundle(
  locale: string,
  fetchFn?: (locale: string) => Promise<Record<string, string>>
): Promise<TranslationLoadResult> {
  const startTime = performance.now();

  // Check cache first
  const cached = translationCache.get(locale);
  if (cached) {
    return {
      success: true,
      bundle: cached,
      loadTime: performance.now() - startTime,
    };
  }

  try {
    let messages: Record<string, string>;

    if (fetchFn) {
      messages = await fetchFn(locale);
    } else {
      // Default fetch implementation
      messages = await defaultFetchTranslationBundle(locale);
    }

    const bundle: TranslationBundle = {
      locale,
      direction: getLocaleDirection(locale),
      messages,
      loadedAt: Date.now(),
    };

    translationCache.set(locale, bundle);

    return {
      success: true,
      bundle,
      loadTime: performance.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
      loadTime: performance.now() - startTime,
    };
  }
}

/**
 * Default translation bundle fetcher
 */
async function defaultFetchTranslationBundle(locale: string): Promise<Record<string, string>> {
  // In a real app, this would fetch from an API or CDN
  // For now, return empty object as placeholder
  return {};
}

/**
 * Preload a translation bundle
 */
export function preloadTranslationBundle(locale: string): Promise<boolean> {
  return loadTranslationBundle(locale)
    .then((result) => result.success)
    .catch(() => false);
}

/**
 * Get cached translation bundle
 */
export function getCachedTranslationBundle(locale: string): TranslationBundle | undefined {
  return translationCache.get(locale);
}

/**
 * Clear translation cache
 */
export function clearTranslationCache(): void {
  translationCache.clear();
}

/**
 * Check if a translation bundle is cached
 */
export function isTranslationBundleCached(locale: string): boolean {
  return translationCache.has(locale);
}

/**
 * Determine if an entry should be loaded based on intersection and threshold
 */
export function shouldLoad(
  entry: Pick<IntersectionEntry, "isIntersecting" | "intersectionRatio">,
  threshold: number
): boolean {
  if (!entry.isIntersecting) {
    return false;
  }
  return entry.intersectionRatio >= threshold;
}

/**
 * Create a lazy loading component wrapper
 */
export function createLazyComponent<T>(
  loader: ComponentLoader<T>,
  options: {
    priority?: LoadingPriority;
    fallback?: T;
    onError?: (error: Error) => void;
  } = {}
): () => Promise<ComponentLoadResult<T>> {
  let cachedComponent: T | undefined;
  let loadingPromise: Promise<ComponentLoadResult<T>> | null = null;

  return async (): Promise<ComponentLoadResult<T>> => {
    // Return cached if available
    if (cachedComponent) {
      return {
        success: true,
        component: cachedComponent,
        loadTime: 0,
      };
    }

    // Return existing promise if loading
    if (loadingPromise) {
      return loadingPromise;
    }

    const startTime = performance.now();

    loadingPromise = loader()
      .then((module) => {
        const component = "default" in module ? module.default : module;
        cachedComponent = component as T;
        
        return {
          success: true,
          component: cachedComponent,
          loadTime: performance.now() - startTime,
        };
      })
      .catch((error) => {
        const err = error instanceof Error ? error : new Error(String(error));
        options.onError?.(err);
        
        return {
          success: false,
          error: err,
          loadTime: performance.now() - startTime,
        };
      })
      .finally(() => {
        loadingPromise = null;
      });

    return loadingPromise;
  };
}

/**
 * Batch load multiple images
 */
export async function batchLoadImages(
  sources: string[],
  options: { concurrency?: number; priority?: LoadingPriority } = {}
): Promise<ImageLoadResult[]> {
  const { concurrency = 3, priority = "lazy" } = options;
  const results: ImageLoadResult[] = [];
  const queue = [...sources];

  async function processNext(): Promise<void> {
    const src = queue.shift();
    if (!src) return;

    const result = await loadImage(src, { priority });
    results.push(result);

    if (queue.length > 0) {
      await processNext();
    }
  }

  // Start concurrent workers
  const workers = Array(Math.min(concurrency, sources.length))
    .fill(null)
    .map(() => processNext());

  await Promise.all(workers);
  return results;
}

/**
 * Create an image observer for a container element
 */
export function createImageObserver(
  container: Element,
  options: {
    rootMargin?: string;
    threshold?: number;
    onImageVisible?: (img: HTMLImageElement) => void;
  } = {}
): LazyLoader {
  const loader = createLazyLoader({
    defaultRootMargin: options.rootMargin,
    defaultThreshold: options.threshold,
  });

  // Find all lazy images in container
  const images = container.querySelectorAll("img[data-lazy-src]");
  
  images.forEach((img) => {
    const src = img.getAttribute("data-lazy-src");
    if (!src) return;

    loader.register(
      img,
      async () => {
        const result = await loadImage(src, {
          priority: "lazy",
        });
        
        if (result.success && result.element) {
          const targetImg = img as HTMLImageElement;
          targetImg.src = src;
          targetImg.removeAttribute("data-lazy-src");
          options.onImageVisible?.(targetImg);
        }
      },
      "lazy"
    );
  });

  return loader;
}

/**
 * Get loading stats for debugging
 */
export function getLazyLoadingStats(): {
  imageCacheSize: number;
  translationCacheSize: number;
  activeLoaders: number;
} {
  return {
    imageCacheSize: imageCache.size,
    translationCacheSize: translationCache.size,
    activeLoaders: activeLoaders.size,
  };
}

/**
 * Clean up all lazy loaders and caches
 */
export function cleanupLazyLoading(): void {
  activeLoaders.forEach((loader) => loader.destroy());
  activeLoaders.clear();
  clearImageCache();
  clearTranslationCache();
}

// Polyfill for requestIdleCallback
function requestIdleCallback(callback: () => void): void {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(callback);
  } else {
    setTimeout(callback, 1);
  }
}
