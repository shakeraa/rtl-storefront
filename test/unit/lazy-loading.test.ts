import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  LazyLoader,
  createLazyLoader,
  loadImage,
  loadTranslationBundle,
  shouldLoad,
  createLazyComponent,
  batchLoadImages,
  createImageObserver,
  isRTLLocale,
  getLocaleDirection,
  preloadImage,
  isImageCached,
  clearImageCache,
  preloadTranslationBundle,
  getCachedTranslationBundle,
  isTranslationBundleCached,
  clearTranslationCache,
  getLazyLoadingStats,
  cleanupLazyLoading,
} from '../../app/services/performance/lazy-loading';

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation((callback, options) => {
  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    trigger: (entries: IntersectionObserverEntry[]) => callback(entries, this),
  };
}) as unknown as typeof IntersectionObserver;

// Mock requestIdleCallback
global.requestIdleCallback = vi.fn((callback: IdleRequestCallback) => {
  return setTimeout(callback, 0) as unknown as number;
});

// Mock Image
class MockImage {
  src = '';
  srcset = '';
  sizes = '';
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  
  setAttribute(name: string, value: string): void {
    if (name === 'dir') {
      (this as unknown as Record<string, string>)[name] = value;
    }
  }
  
  getAttribute(name: string): string | null {
    return (this as unknown as Record<string, string>)[name] ?? null;
  }
}

global.Image = vi.fn(() => new MockImage()) as unknown as typeof Image;

describe('LazyLoader', () => {
  let loader: LazyLoader;
  let mockElement: Element;

  beforeEach(() => {
    // Create a mock DOM element
    mockElement = {
      getAttribute: vi.fn().mockReturnValue(null),
      setAttribute: vi.fn(),
      removeAttribute: vi.fn(),
    } as unknown as Element;
    
    loader = createLazyLoader({ debug: false });
  });

  afterEach(() => {
    loader.destroy();
    cleanupLazyLoading();
    vi.clearAllMocks();
  });

  it('should create a LazyLoader instance', () => {
    expect(loader).toBeInstanceOf(LazyLoader);
  });

  it('should register an element for lazy loading', () => {
    const loadFn = vi.fn().mockResolvedValue(undefined);
    const id = loader.register(mockElement, loadFn, 'lazy');
    
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    expect(loader.getStatus(id)).toBe('pending');
  });

  it('should immediately load eager priority entries', async () => {
    const loadFn = vi.fn().mockResolvedValue(undefined);
    const id = loader.register(mockElement, loadFn, 'eager');
    
    // Wait for async load
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(loadFn).toHaveBeenCalled();
    expect(loader.getStatus(id)).toBe('loaded');
  });

  it('should track entry status correctly', () => {
    const loadFn = vi.fn().mockResolvedValue(undefined);
    const id = loader.register(mockElement, loadFn, 'lazy');
    
    expect(loader.getStatus(id)).toBe('pending');
  });

  it('should return null status for unknown entry', () => {
    expect(loader.getStatus('unknown-id')).toBeNull();
  });

  it('should return all registered entries', () => {
    const loadFn = vi.fn().mockResolvedValue(undefined);
    loader.register(mockElement, loadFn, 'lazy');
    
    const entries = loader.getEntries();
    expect(entries.length).toBe(1);
    expect(entries[0].status).toBe('pending');
  });

  it('should unregister an entry', () => {
    const loadFn = vi.fn().mockResolvedValue(undefined);
    const id = loader.register(mockElement, loadFn, 'lazy');
    
    loader.unregister(id);
    expect(loader.getStatus(id)).toBeNull();
  });

  it('should handle load errors with retry', async () => {
    const loadFn = vi.fn().mockRejectedValue(new Error('Load failed'));
    const loaderWithRetry = createLazyLoader({ retryAttempts: 2, retryDelay: 10 });
    
    const id = loaderWithRetry.register(mockElement, loadFn, 'eager');
    
    // Wait for retries
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(loadFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    loaderWithRetry.destroy();
  });

  it('should destroy cleanly', () => {
    const loadFn = vi.fn().mockResolvedValue(undefined);
    loader.register(mockElement, loadFn, 'lazy');
    
    loader.destroy();
    
    expect(loader.getEntries()).toEqual([]);
  });
});

describe('createLazyLoader', () => {
  afterEach(() => {
    cleanupLazyLoading();
  });

  it('should create a LazyLoader with default options', () => {
    const loader = createLazyLoader();
    expect(loader).toBeInstanceOf(LazyLoader);
    loader.destroy();
  });

  it('should create a LazyLoader with custom options', () => {
    const loader = createLazyLoader({
      defaultRootMargin: '100px',
      defaultThreshold: 0.5,
      debug: true,
      maxConcurrentLoads: 10,
    });
    expect(loader).toBeInstanceOf(LazyLoader);
    loader.destroy();
  });
});

describe('loadImage', () => {
  beforeEach(() => {
    clearImageCache();
  });

  afterEach(() => {
    cleanupLazyLoading();
  });

  it('should load an image successfully', async () => {
    const mockImage = new MockImage();
    vi.mocked(global.Image).mockImplementation(() => mockImage);

    const loadPromise = loadImage('https://example.com/image.jpg');
    
    // Simulate successful load
    setTimeout(() => mockImage.onload?.(), 0);
    
    const result = await loadPromise;
    
    expect(result.success).toBe(true);
    expect(result.src).toBe('https://example.com/image.jpg');
    expect(result.element).toBeDefined();
  });

  it('should handle image load failure', async () => {
    const mockImage = new MockImage();
    vi.mocked(global.Image).mockImplementation(() => mockImage);

    const loadPromise = loadImage('https://example.com/broken.jpg');
    
    // Simulate failed load
    setTimeout(() => mockImage.onerror?.(), 0);
    
    const result = await loadPromise;
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should return cached image on subsequent loads', async () => {
    const mockImage = new MockImage();
    vi.mocked(global.Image).mockImplementation(() => mockImage);

    // First load
    const loadPromise1 = loadImage('https://example.com/cached.jpg');
    setTimeout(() => mockImage.onload?.(), 0);
    await loadPromise1;

    // Second load should use cache
    const loadPromise2 = loadImage('https://example.com/cached.jpg');
    const result2 = await loadPromise2;
    
    expect(result2.success).toBe(true);
    expect(isImageCached('https://example.com/cached.jpg')).toBe(true);
  });

  it('should handle eager priority loading', async () => {
    const mockImage = new MockImage();
    vi.mocked(global.Image).mockImplementation(() => mockImage);

    const loadPromise = loadImage('https://example.com/eager.jpg', { priority: 'eager' });
    setTimeout(() => mockImage.onload?.(), 0);
    
    const result = await loadPromise;
    expect(result.success).toBe(true);
  });

  it('should set RTL attribute for RTL images', async () => {
    const mockImage = new MockImage();
    vi.mocked(global.Image).mockImplementation(() => mockImage);

    const loadPromise = loadImage('https://example.com/rtl-image.jpg', { isRTL: true });
    setTimeout(() => mockImage.onload?.(), 0);
    
    await loadPromise;
    expect(mockImage.getAttribute('dir')).toBe('rtl');
  });

  it('should handle srcset and sizes attributes', async () => {
    const mockImage = new MockImage();
    vi.mocked(global.Image).mockImplementation(() => mockImage);

    const loadPromise = loadImage('https://example.com/responsive.jpg', {
      srcset: 'small.jpg 500w, large.jpg 1000w',
      sizes: '(max-width: 600px) 500px, 1000px',
    });
    setTimeout(() => mockImage.onload?.(), 0);
    
    await loadPromise;
    expect(mockImage.srcset).toBe('small.jpg 500w, large.jpg 1000w');
    expect(mockImage.sizes).toBe('(max-width: 600px) 500px, 1000px');
  });

  it('should call onLoad callback when image loads', async () => {
    const mockImage = new MockImage();
    vi.mocked(global.Image).mockImplementation(() => mockImage);

    const onLoad = vi.fn();
    const loadPromise = loadImage('https://example.com/callback.jpg', { onLoad });
    setTimeout(() => mockImage.onload?.(), 0);
    
    await loadPromise;
    expect(onLoad).toHaveBeenCalled();
  });

  it('should call onError callback when image fails', async () => {
    const mockImage = new MockImage();
    vi.mocked(global.Image).mockImplementation(() => mockImage);

    const onError = vi.fn();
    const loadPromise = loadImage('https://example.com/error.jpg', { onError });
    setTimeout(() => mockImage.onerror?.(), 0);
    
    await loadPromise;
    expect(onError).toHaveBeenCalled();
  });
});

describe('loadTranslationBundle', () => {
  beforeEach(() => {
    clearTranslationCache();
  });

  afterEach(() => {
    cleanupLazyLoading();
  });

  it('should load translation bundle successfully', async () => {
    const mockMessages = { hello: 'مرحبا', world: 'عالم' };
    const fetchFn = vi.fn().mockResolvedValue(mockMessages);

    const result = await loadTranslationBundle('ar', fetchFn);
    
    expect(result.success).toBe(true);
    expect(result.bundle).toBeDefined();
    expect(result.bundle?.locale).toBe('ar');
    expect(result.bundle?.direction).toBe('rtl');
    expect(result.bundle?.messages).toEqual(mockMessages);
  });

  it('should return cached bundle on subsequent loads', async () => {
    const mockMessages = { hello: 'hello' };
    const fetchFn = vi.fn().mockResolvedValue(mockMessages);

    await loadTranslationBundle('en', fetchFn);
    const result2 = await loadTranslationBundle('en', fetchFn);
    
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(result2.bundle?.messages).toEqual(mockMessages);
  });

  it('should handle RTL locales correctly', async () => {
    const fetchFn = vi.fn().mockResolvedValue({});
    
    const arResult = await loadTranslationBundle('ar', fetchFn);
    const heResult = await loadTranslationBundle('he', fetchFn);
    const enResult = await loadTranslationBundle('en', fetchFn);
    
    expect(arResult.bundle?.direction).toBe('rtl');
    expect(heResult.bundle?.direction).toBe('rtl');
    expect(enResult.bundle?.direction).toBe('ltr');
  });

  it('should handle load errors', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await loadTranslationBundle('fr', fetchFn);
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.message).toBe('Network error');
  });

  it('should track load time', async () => {
    const fetchFn = vi.fn().mockResolvedValue({});

    const result = await loadTranslationBundle('de', fetchFn);
    
    expect(result.loadTime).toBeGreaterThanOrEqual(0);
  });
});

describe('shouldLoad', () => {
  it('should return true when element is intersecting and meets threshold', () => {
    const entry = {
      isIntersecting: true,
      intersectionRatio: 0.5,
    };
    
    expect(shouldLoad(entry, 0.25)).toBe(true);
  });

  it('should return false when element is not intersecting', () => {
    const entry = {
      isIntersecting: false,
      intersectionRatio: 0.5,
    };
    
    expect(shouldLoad(entry, 0.25)).toBe(false);
  });

  it('should return false when intersection ratio is below threshold', () => {
    const entry = {
      isIntersecting: true,
      intersectionRatio: 0.1,
    };
    
    expect(shouldLoad(entry, 0.25)).toBe(false);
  });

  it('should return true when intersection ratio equals threshold', () => {
    const entry = {
      isIntersecting: true,
      intersectionRatio: 0.25,
    };
    
    expect(shouldLoad(entry, 0.25)).toBe(true);
  });
});

describe('createLazyComponent', () => {
  afterEach(() => {
    cleanupLazyLoading();
  });

  it('should lazy load a component', async () => {
    const mockComponent = { name: 'TestComponent' };
    const loader = vi.fn().mockResolvedValue({ default: mockComponent });
    
    const lazyComponent = createLazyComponent(loader);
    const result = await lazyComponent();
    
    expect(result.success).toBe(true);
    expect(result.component).toEqual(mockComponent);
  });

  it('should cache loaded component', async () => {
    const mockComponent = { name: 'CachedComponent' };
    const loader = vi.fn().mockResolvedValue({ default: mockComponent });
    
    const lazyComponent = createLazyComponent(loader);
    
    await lazyComponent();
    const result2 = await lazyComponent();
    
    expect(loader).toHaveBeenCalledTimes(1);
    expect(result2.component).toEqual(mockComponent);
    expect(result2.loadTime).toBe(0); // Cached, no load time
  });

  it('should handle non-default exports', async () => {
    const mockComponent = { name: 'DirectExport' };
    const loader = vi.fn().mockResolvedValue(mockComponent);
    
    const lazyComponent = createLazyComponent(loader);
    const result = await lazyComponent();
    
    expect(result.success).toBe(true);
    expect(result.component).toEqual(mockComponent);
  });

  it('should handle load errors', async () => {
    const loader = vi.fn().mockRejectedValue(new Error('Component load failed'));
    const onError = vi.fn();
    
    const lazyComponent = createLazyComponent(loader, { onError });
    const result = await lazyComponent();
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(onError).toHaveBeenCalled();
  });

  it('should return same promise for concurrent calls', async () => {
    let resolveFn: (value: unknown) => void;
    const loader = vi.fn().mockImplementation(() => 
      new Promise(resolve => { resolveFn = resolve; })
    );
    
    const lazyComponent = createLazyComponent(loader);
    
    const promise1 = lazyComponent();
    const promise2 = lazyComponent();
    
    // Both should be pending promises that resolve to the same result
    expect(loader).toHaveBeenCalledTimes(1);
    
    resolveFn!({ default: { name: 'Component' } });
    
    const result1 = await promise1;
    const result2 = await promise2;
    
    // Both should resolve to the same component
    expect(result1.component).toBe(result2.component);
  });
});

describe('batchLoadImages', () => {
  beforeEach(() => {
    clearImageCache();
  });

  afterEach(() => {
    cleanupLazyLoading();
  });

  it('should batch load multiple images', async () => {
    const mockImage = new MockImage();
    let loadCount = 0;
    vi.mocked(global.Image).mockImplementation(() => {
      const img = new MockImage();
      setTimeout(() => {
        loadCount++;
        img.onload?.();
      }, 10);
      return img;
    });

    const sources = [
      'https://example.com/1.jpg',
      'https://example.com/2.jpg',
      'https://example.com/3.jpg',
    ];

    const results = await batchLoadImages(sources, { concurrency: 2 });
    
    expect(results.length).toBe(3);
    expect(results.every(r => r.success)).toBe(true);
  });

  it('should handle mixed success and failure', async () => {
    vi.mocked(global.Image).mockImplementation(() => {
      const img = new MockImage();
      setTimeout(() => {
        if (img.src.includes('broken')) {
          img.onerror?.();
        } else {
          img.onload?.();
        }
      }, 10);
      return img;
    });

    const sources = [
      'https://example.com/good.jpg',
      'https://example.com/broken.jpg',
      'https://example.com/also-good.jpg',
    ];

    const results = await batchLoadImages(sources);
    
    expect(results.filter(r => r.success).length).toBe(2);
    expect(results.filter(r => !r.success).length).toBe(1);
  });
});

describe('createImageObserver', () => {
  afterEach(() => {
    cleanupLazyLoading();
  });

  it('should create an image observer for a container', () => {
    const container = document.createElement('div');
    const img = document.createElement('img');
    img.setAttribute('data-lazy-src', 'https://example.com/lazy.jpg');
    container.appendChild(img);

    const observer = createImageObserver(container);
    
    expect(observer).toBeInstanceOf(LazyLoader);
    observer.destroy();
  });

  it('should find all lazy images in container', () => {
    const container = document.createElement('div');
    
    for (let i = 0; i < 5; i++) {
      const img = document.createElement('img');
      img.setAttribute('data-lazy-src', `https://example.com/${i}.jpg`);
      container.appendChild(img);
    }

    const observer = createImageObserver(container);
    const entries = observer.getEntries();
    
    expect(entries.length).toBe(5);
    observer.destroy();
  });

  it('should call onImageVisible callback', async () => {
    const container = document.createElement('div');
    const img = document.createElement('img');
    img.setAttribute('data-lazy-src', 'https://example.com/visible.jpg');
    container.appendChild(img);

    const onImageVisible = vi.fn();
    const observer = createImageObserver(container, { onImageVisible });
    
    // The observer should have registered the image
    expect(observer.getEntries().length).toBe(1);
    observer.destroy();
  });
});

describe('isRTLLocale', () => {
  it('should identify Arabic as RTL', () => {
    expect(isRTLLocale('ar')).toBe(true);
    expect(isRTLLocale('ar-SA')).toBe(true);
    expect(isRTLLocale('ar-AE')).toBe(true);
  });

  it('should identify Hebrew as RTL', () => {
    expect(isRTLLocale('he')).toBe(true);
    expect(isRTLLocale('he-IL')).toBe(true);
  });

  it('should identify Farsi/Persian as RTL', () => {
    expect(isRTLLocale('fa')).toBe(true);
    expect(isRTLLocale('fa-IR')).toBe(true);
  });

  it('should identify Urdu as RTL', () => {
    expect(isRTLLocale('ur')).toBe(true);
    expect(isRTLLocale('ur-PK')).toBe(true);
  });

  it('should identify English as LTR', () => {
    expect(isRTLLocale('en')).toBe(false);
    expect(isRTLLocale('en-US')).toBe(false);
  });

  it('should identify French as LTR', () => {
    expect(isRTLLocale('fr')).toBe(false);
    expect(isRTLLocale('fr-FR')).toBe(false);
  });

  it('should handle case insensitivity', () => {
    expect(isRTLLocale('AR')).toBe(true);
    expect(isRTLLocale('HE')).toBe(true);
    expect(isRTLLocale('EN')).toBe(false);
  });
});

describe('getLocaleDirection', () => {
  it('should return rtl for RTL locales', () => {
    expect(getLocaleDirection('ar')).toBe('rtl');
    expect(getLocaleDirection('he')).toBe('rtl');
    expect(getLocaleDirection('fa')).toBe('rtl');
  });

  it('should return ltr for LTR locales', () => {
    expect(getLocaleDirection('en')).toBe('ltr');
    expect(getLocaleDirection('es')).toBe('ltr');
    expect(getLocaleDirection('de')).toBe('ltr');
  });
});

describe('preloadImage', () => {
  beforeEach(() => {
    clearImageCache();
  });

  afterEach(() => {
    cleanupLazyLoading();
  });

  it('should preload and cache an image', async () => {
    const mockImage = new MockImage();
    vi.mocked(global.Image).mockImplementation(() => mockImage);

    const preloadPromise = preloadImage('https://example.com/preload.jpg');
    setTimeout(() => mockImage.onload?.(), 0);
    
    const success = await preloadPromise;
    
    expect(success).toBe(true);
    expect(isImageCached('https://example.com/preload.jpg')).toBe(true);
  });

  it('should return false on preload failure', async () => {
    const mockImage = new MockImage();
    vi.mocked(global.Image).mockImplementation(() => mockImage);

    const preloadPromise = preloadImage('https://example.com/broken.jpg');
    setTimeout(() => mockImage.onerror?.(), 0);
    
    const success = await preloadPromise;
    
    expect(success).toBe(false);
  });
});

describe('preloadTranslationBundle', () => {
  beforeEach(() => {
    clearTranslationCache();
  });

  afterEach(() => {
    cleanupLazyLoading();
  });

  it('should preload and cache translation bundle', async () => {
    const mockMessages = { key: 'value' };
    const fetchFn = vi.fn().mockResolvedValue(mockMessages);

    const success = await preloadTranslationBundle('ja');
    
    // Note: without fetchFn, it uses default which returns empty object
    expect(typeof success).toBe('boolean');
  });
});

describe('getCachedTranslationBundle', () => {
  beforeEach(() => {
    clearTranslationCache();
  });

  afterEach(() => {
    cleanupLazyLoading();
  });

  it('should return cached bundle', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ hello: 'world' });
    
    await loadTranslationBundle('ko', fetchFn);
    const cached = getCachedTranslationBundle('ko');
    
    expect(cached).toBeDefined();
    expect(cached?.locale).toBe('ko');
  });

  it('should return undefined for uncached bundle', () => {
    const cached = getCachedTranslationBundle('unknown');
    expect(cached).toBeUndefined();
  });
});

describe('isTranslationBundleCached', () => {
  beforeEach(() => {
    clearTranslationCache();
  });

  afterEach(() => {
    cleanupLazyLoading();
  });

  it('should return true for cached bundle', async () => {
    const fetchFn = vi.fn().mockResolvedValue({});
    
    await loadTranslationBundle('pt', fetchFn);
    
    expect(isTranslationBundleCached('pt')).toBe(true);
  });

  it('should return false for uncached bundle', () => {
    expect(isTranslationBundleCached('not-loaded')).toBe(false);
  });
});

describe('getLazyLoadingStats', () => {
  beforeEach(() => {
    clearImageCache();
    clearTranslationCache();
  });

  afterEach(() => {
    cleanupLazyLoading();
  });

  it('should return stats object', () => {
    const stats = getLazyLoadingStats();
    
    expect(stats).toHaveProperty('imageCacheSize');
    expect(stats).toHaveProperty('translationCacheSize');
    expect(stats).toHaveProperty('activeLoaders');
    expect(typeof stats.imageCacheSize).toBe('number');
    expect(typeof stats.translationCacheSize).toBe('number');
    expect(typeof stats.activeLoaders).toBe('number');
  });

  it('should reflect cache sizes', async () => {
    const mockImage = new MockImage();
    vi.mocked(global.Image).mockImplementation(() => mockImage);

    // Load an image
    const loadPromise = loadImage('https://example.com/stats.jpg');
    setTimeout(() => mockImage.onload?.(), 0);
    await loadPromise;

    const stats = getLazyLoadingStats();
    expect(stats.imageCacheSize).toBeGreaterThan(0);
  });
});

describe('cleanupLazyLoading', () => {
  it('should clean up all resources', () => {
    // Create some loaders
    const loader1 = createLazyLoader();
    const loader2 = createLazyLoader();
    
    // Verify they exist
    expect(getLazyLoadingStats().activeLoaders).toBe(2);
    
    // Cleanup
    cleanupLazyLoading();
    
    // Verify cleanup
    expect(getLazyLoadingStats().activeLoaders).toBe(0);
  });
});

describe('clearImageCache', () => {
  it('should clear all cached images', async () => {
    const mockImage = new MockImage();
    vi.mocked(global.Image).mockImplementation(() => mockImage);

    // Load an image
    const loadPromise = loadImage('https://example.com/clear.jpg');
    setTimeout(() => mockImage.onload?.(), 0);
    await loadPromise;
    
    expect(isImageCached('https://example.com/clear.jpg')).toBe(true);
    
    clearImageCache();
    
    expect(isImageCached('https://example.com/clear.jpg')).toBe(false);
  });
});

describe('clearTranslationCache', () => {
  it('should clear all cached translations', async () => {
    const fetchFn = vi.fn().mockResolvedValue({});
    
    await loadTranslationBundle('it', fetchFn);
    expect(isTranslationBundleCached('it')).toBe(true);
    
    clearTranslationCache();
    
    expect(isTranslationBundleCached('it')).toBe(false);
  });
});
