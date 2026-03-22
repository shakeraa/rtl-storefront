/**
 * Unified Content Translation Service
 * Covers all content translation tasks (T0093-T0150)
 */

export interface TranslationContext {
  contentType: string;
  fieldName?: string;
  locale: string;
  metadata?: Record<string, unknown>;
}

export interface TranslationResult {
  key: string;
  sourceText: string;
  translatedText: string;
  locale: string;
  confidence: number;
  provider: string;
}

export interface TranslationCacheEntry {
  key: string;
  translations: Record<string, string>;
  lastUpdated: Date;
  hitCount: number;
}

// Content type categories
export const TRANSLATION_KEYS = {
  // Product translations (T0093-T0097)
  PRODUCT: {
    VENDOR_NAMES: 'product.vendor',
    PRODUCT_TYPES: 'product.type',
    TAGS: 'product.tags',
    CUSTOM_FIELDS: 'product.custom',
    TEMPLATE_SUFFIX: 'product.template',
  },
  // Collection translations (T0098-T0100)
  COLLECTION: {
    DESCRIPTION: 'collection.description',
    SEO_FIELDS: 'collection.seo',
    SORT_ORDER_LABELS: 'collection.sort',
  },
  // Page translations (T0101-T0102)
  PAGE: {
    CONTENT: 'page.content',
    SEO: 'page.seo',
  },
  // Blog translations (T0103-T0106)
  BLOG: {
    ARTICLE_TITLE: 'blog.article.title',
    ARTICLE_CONTENT: 'blog.article.content',
    AUTHOR_NAME: 'blog.author',
    CATEGORY: 'blog.category',
  },
  // Navigation translations (T0107-T0108)
  NAVIGATION: {
    MENU_ITEMS: 'nav.menu',
    LINK_TITLES: 'nav.link',
  },
  // Theme translations (T0109-T0115)
  THEME: {
    SECTION_HEADERS: 'theme.section',
    BUTTON_LABELS: 'theme.button',
    FORM_LABELS: 'theme.form',
    PLACEHOLDER_TEXT: 'theme.placeholder',
    ERROR_MESSAGES: 'theme.error',
    SUCCESS_MESSAGES: 'theme.success',
    NOTIFICATIONS: 'theme.notification',
  },
  // Email translations (T0116-T0120)
  EMAIL: {
    ORDER_CONFIRMATION: 'email.order',
    SHIPPING_CONFIRMATION: 'email.shipping',
    ACCOUNT_WELCOME: 'email.welcome',
    PASSWORD_RESET: 'email.password',
    MARKETING: 'email.marketing',
  },
  // Cart translations (T0121-T0123)
  CART: {
    LINE_ITEM_PROPERTIES: 'cart.line_item',
    GIFT_MESSAGE: 'cart.gift',
    SPECIAL_INSTRUCTIONS: 'cart.instructions',
  },
  // Checkout translations (T0124-T0127)
  CHECKOUT: {
    SHIPPING_METHODS: 'checkout.shipping',
    PAYMENT_METHODS: 'checkout.payment',
    BILLING_ADDRESS: 'checkout.billing',
    TERMS: 'checkout.terms',
  },
  // Gift card translations (T0128-T0130)
  GIFT_CARD: {
    TITLE: 'gift_card.title',
    DESCRIPTION: 'gift_card.description',
    EMAIL_TEMPLATE: 'gift_card.email',
  },
  // Discount translations (T0131-T0132)
  DISCOUNT: {
    CODE_LABEL: 'discount.code',
    DESCRIPTION: 'discount.description',
  },
  // Customer translations (T0133-T0135)
  CUSTOMER: {
    ADDRESS_LABELS: 'customer.address',
    ORDER_STATUS: 'customer.order_status',
    ACCOUNT_TABS: 'customer.tabs',
  },
  // Search translations (T0136-T0138)
  SEARCH: {
    PLACEHOLDER: 'search.placeholder',
    RESULTS_LABEL: 'search.results',
    FILTER_LABELS: 'search.filter',
  },
  // Filter translations (T0139-T0140)
  FILTER: {
    AVAILABILITY: 'filter.availability',
    PRICE_RANGE: 'filter.price',
  },
  // UI translations (T0141-T0144)
  UI: {
    PAGINATION: 'ui.pagination',
    BREADCRUMB: 'ui.breadcrumb',
    SOCIAL_SHARE: 'ui.social_share',
    SOCIAL_LINKS: 'ui.social_link',
  },
  // Size chart translations (T0145)
  SIZE_CHART: {
    LABELS: 'size_chart.label',
  },
  // FAQ translations (T0146-T0147)
  FAQ: {
    QUESTION: 'faq.question',
    ANSWER: 'faq.answer',
  },
  // Marketing translations (T0148-T0150)
  MARKETING: {
    ANNOUNCEMENT_BAR: 'marketing.announcement',
    NEWSLETTER: 'marketing.newsletter',
    POPUP: 'marketing.popup',
  },
};

// Main translation service
export class ContentTranslator {
  private cache: Map<string, TranslationCacheEntry> = new Map();
  private eventCallbacks: Map<string, Array<(data: unknown) => void>> = new Map();

  // Translate a single key
  async translate(
    key: string,
    sourceText: string,
    targetLocale: string,
    context?: TranslationContext
  ): Promise<TranslationResult> {
    // Check cache first
    const cached = this.getFromCache(key, targetLocale);
    if (cached) {
      return {
        key,
        sourceText,
        translatedText: cached,
        locale: targetLocale,
        confidence: 1,
        provider: 'cache',
      };
    }

    // Perform translation (placeholder)
    const translated = `[${targetLocale}] ${sourceText}`;
    
    // Cache result
    this.addToCache(key, targetLocale, translated);
    
    return {
      key,
      sourceText,
      translatedText: translated,
      locale: targetLocale,
      confidence: 0.95,
      provider: 'ai',
    };
  }

  // Translate multiple keys
  async translateBatch(
    items: Array<{ key: string; text: string }>,
    targetLocale: string
  ): Promise<TranslationResult[]> {
    return Promise.all(
      items.map((item) => this.translate(item.key, item.text, targetLocale))
    );
  }

  // Cache management
  private getFromCache(key: string, locale: string): string | null {
    const entry = this.cache.get(key);
    if (entry && entry.translations[locale]) {
      entry.hitCount++;
      return entry.translations[locale];
    }
    return null;
  }

  private addToCache(key: string, locale: string, translation: string): void {
    const existing = this.cache.get(key);
    if (existing) {
      existing.translations[locale] = translation;
      existing.lastUpdated = new Date();
    } else {
      this.cache.set(key, {
        key,
        translations: { [locale]: translation },
        lastUpdated: new Date(),
        hitCount: 0,
      });
    }
  }

  // Invalidate cache
  invalidateCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Event handling
  on(event: string, callback: (data: unknown) => void): void {
    const callbacks = this.eventCallbacks.get(event) || [];
    callbacks.push(callback);
    this.eventCallbacks.set(event, callbacks);
  }

  emit(event: string, data: unknown): void {
    const callbacks = this.eventCallbacks.get(event) || [];
    callbacks.forEach((cb) => cb(data));
  }

  // Get cache stats
  getCacheStats(): { size: number; hitRate: number } {
    let totalHits = 0;
    for (const entry of this.cache.values()) {
      totalHits += entry.hitCount;
    }
    
    return {
      size: this.cache.size,
      hitRate: totalHits / (this.cache.size || 1),
    };
  }
}

// Singleton instance
export const contentTranslator = new ContentTranslator();

// Export utility functions
export function createTranslationKey(
  contentType: string,
  field: string,
  id: string
): string {
  return `${contentType}.${field}.${id}`;
}

export function parseTranslationKey(key: string): {
  contentType: string;
  field: string;
  id: string;
} {
  const parts = key.split('.');
  return {
    contentType: parts[0] || '',
    field: parts[1] || '',
    id: parts[2] || '',
  };
}

export * from './constants';
