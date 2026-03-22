import { describe, it, expect, vi } from 'vitest';
import {
  // Types
  type ZendeskArticle,
  type ZendeskCategory,
  type ZendeskSection,
  // Main functions
  translateArticle,
  translateCategory,
  translateSection,
  extractDynamicContent,
  preserveDynamicContent,
  restoreDynamicContent,
  preserveAllPlaceholders,
  getZendeskTemplates,
  // Utility functions
  containsRTLElements,
  applyRTLAdaptations,
  isSupportedZendeskLocale,
  batchTranslateArticles,
  batchTranslateCategories,
  batchTranslateSections,
  getRTLStyles,
  sanitizeContent,
} from '../../app/services/integrations/zendesk';

describe('Zendesk Integration Service', () => {
  describe('extractDynamicContent', () => {
    it('should extract dynamic content placeholders from text', () => {
      const content = 'Welcome {{dc.welcome_message}} to our help center {{dc.contact_info}}';
      const placeholders = extractDynamicContent(content);
      
      expect(placeholders).toHaveLength(2);
      expect(placeholders[0]).toEqual({ placeholder: '{{dc.welcome_message}}', key: 'welcome_message' });
      expect(placeholders[1]).toEqual({ placeholder: '{{dc.contact_info}}', key: 'contact_info' });
    });

    it('should return empty array when no dynamic content found', () => {
      const content = 'Welcome to our help center';
      const placeholders = extractDynamicContent(content);
      
      expect(placeholders).toHaveLength(0);
    });

    it('should deduplicate repeated placeholders', () => {
      const content = '{{dc.greeting}} Hello {{dc.greeting}} World';
      const placeholders = extractDynamicContent(content);
      
      expect(placeholders).toHaveLength(1);
      expect(placeholders[0].key).toBe('greeting');
    });

    it('should handle placeholders with underscores and hyphens', () => {
      const content = '{{dc.my_placeholder}} and {{dc.my-placeholder}}';
      const placeholders = extractDynamicContent(content);
      
      expect(placeholders).toHaveLength(2);
      expect(placeholders[0].key).toBe('my_placeholder');
      expect(placeholders[1].key).toBe('my-placeholder');
    });

    it('should handle empty string', () => {
      const placeholders = extractDynamicContent('');
      expect(placeholders).toHaveLength(0);
    });
  });

  describe('preserveDynamicContent', () => {
    it('should replace dynamic content with markers', () => {
      const content = 'Welcome {{dc.message}} to our site';
      const result = preserveDynamicContent(content);
      
      expect(result.processedContent).not.toContain('{{dc.message}}');
      expect(result.processedContent).toContain('__DC_PLACEHOLDER_0__');
      expect(result.placeholders.get('__DC_PLACEHOLDER_0__')).toBe('{{dc.message}}');
    });

    it('should handle multiple placeholders', () => {
      const content = '{{dc.a}} {{dc.b}} {{dc.c}}';
      const result = preserveDynamicContent(content);
      
      expect(result.placeholders.size).toBe(3);
      expect(result.processedContent).toContain('__DC_PLACEHOLDER_0__');
      expect(result.processedContent).toContain('__DC_PLACEHOLDER_1__');
      expect(result.processedContent).toContain('__DC_PLACEHOLDER_2__');
    });

    it('should handle content without placeholders', () => {
      const content = 'Plain text without placeholders';
      const result = preserveDynamicContent(content);
      
      expect(result.processedContent).toBe(content);
      expect(result.placeholders.size).toBe(0);
    });
  });

  describe('restoreDynamicContent', () => {
    it('should restore placeholders from markers', () => {
      const content = 'Welcome __DC_PLACEHOLDER_0__ to our site';
      const placeholders = new Map([['__DC_PLACEHOLDER_0__', '{{dc.message}}']]);
      const result = restoreDynamicContent(content, placeholders);
      
      expect(result).toBe('Welcome {{dc.message}} to our site');
    });

    it('should restore multiple placeholders', () => {
      const content = '__DC_PLACEHOLDER_0__ and __DC_PLACEHOLDER_1__';
      const placeholders = new Map([
        ['__DC_PLACEHOLDER_0__', '{{dc.first}}'],
        ['__DC_PLACEHOLDER_1__', '{{dc.second}}'],
      ]);
      const result = restoreDynamicContent(content, placeholders);
      
      expect(result).toBe('{{dc.first}} and {{dc.second}}');
    });

    it('should handle text without markers', () => {
      const content = 'Plain text';
      const placeholders = new Map();
      const result = restoreDynamicContent(content, placeholders);
      
      expect(result).toBe('Plain text');
    });
  });

  describe('preserveAllPlaceholders', () => {
    it('should preserve all Zendesk placeholders including non-dc ones', () => {
      const content = 'Hello {{ticket.requester.name}} and {{dc.greeting}}';
      const result = preserveAllPlaceholders(content);
      
      expect(result.processedContent).not.toContain('{{ticket.requester.name}}');
      expect(result.processedContent).not.toContain('{{dc.greeting}}');
      expect(result.placeholders.size).toBe(2);
    });

    it('should handle nested placeholders', () => {
      const content = '{{ticket.comments.last.body}} and {{dc.signature}}';
      const result = preserveAllPlaceholders(content);
      
      expect(result.placeholders.size).toBe(2);
    });
  });

  describe('translateArticle', () => {
    it('should translate article title and body', async () => {
      const article: ZendeskArticle = {
        id: '123',
        title: 'How to reset password',
        body: '<p>Click the reset button</p>',
        locale: 'en',
      };

      const result = await translateArticle(article, 'ar');
      
      expect(result.title).toContain('[ar]');
      expect(result.body).toContain('[ar]');
      expect(result.locale).toBe('ar');
      expect(result.originalLocale).toBe('en');
    });

    it('should preserve dynamic content in article', async () => {
      const article: ZendeskArticle = {
        id: '123',
        title: 'Welcome {{dc.user_name}}',
        body: '<p>Hello {{dc.greeting}}</p>',
        locale: 'en',
      };

      const result = await translateArticle(article, 'ar');
      
      expect(result.title).toContain('{{dc.user_name}}');
      expect(result.body).toContain('{{dc.greeting}}');
    });

    it('should translate meta fields', async () => {
      const article: ZendeskArticle = {
        id: '123',
        title: 'Title',
        body: '<p>Body</p>',
        locale: 'en',
        meta: {
          title: 'Meta Title',
          description: 'Meta Description',
        },
      };

      const result = await translateArticle(article, 'ar');
      
      expect(result.meta?.title).toContain('[ar]');
      expect(result.meta?.description).toContain('[ar]');
    });

    it('should use custom translate function', async () => {
      const customTranslate = vi.fn().mockResolvedValue('Translated Text');
      const article: ZendeskArticle = {
        id: '123',
        title: 'Title',
        body: '<p>Body</p>',
        locale: 'en',
      };

      await translateArticle(article, 'ar', customTranslate);
      
      expect(customTranslate).toHaveBeenCalled();
    });

    it('should handle empty meta', async () => {
      const article: ZendeskArticle = {
        id: '123',
        title: 'Title',
        body: '<p>Body</p>',
        locale: 'en',
      };

      const result = await translateArticle(article, 'ar');
      
      expect(result.meta).toBeUndefined();
    });

    it('should apply RTL adaptations for Arabic locale', async () => {
      const article: ZendeskArticle = {
        id: '123',
        title: 'Title',
        body: '<html><body>Content</body></html>',
        locale: 'en',
      };

      const result = await translateArticle(article, 'ar');
      
      expect(result.body).toContain('dir="rtl"');
    });

    it('should preserve all Zendesk placeholders in body', async () => {
      const article: ZendeskArticle = {
        id: '123',
        title: 'Title',
        body: '<p>Ticket: {{ticket.id}} Status: {{ticket.status}}</p>',
        locale: 'en',
      };

      const result = await translateArticle(article, 'he');
      
      expect(result.body).toContain('{{ticket.id}}');
      expect(result.body).toContain('{{ticket.status}}');
    });
  });

  describe('translateCategory', () => {
    it('should translate category name and description', async () => {
      const category: ZendeskCategory = {
        id: 'cat1',
        name: 'General Questions',
        description: 'Common questions and answers',
        locale: 'en',
      };

      const result = await translateCategory(category, 'ar');
      
      expect(result.name).toContain('[ar]');
      expect(result.description).toContain('[ar]');
      expect(result.locale).toBe('ar');
      expect(result.originalLocale).toBe('en');
    });

    it('should preserve dynamic content in category', async () => {
      const category: ZendeskCategory = {
        id: 'cat1',
        name: '{{dc.category_name}}',
        description: '{{dc.category_desc}}',
        locale: 'en',
      };

      const result = await translateCategory(category, 'ar');
      
      expect(result.name).toContain('{{dc.category_name}}');
      expect(result.description).toContain('{{dc.category_desc}}');
    });

    it('should handle missing description', async () => {
      const category: ZendeskCategory = {
        id: 'cat1',
        name: 'Category Name',
        locale: 'en',
      };

      const result = await translateCategory(category, 'ar');
      
      expect(result.name).toContain('[ar]');
      expect(result.description).toBeUndefined();
    });
  });

  describe('translateSection', () => {
    it('should translate section name and description', async () => {
      const section: ZendeskSection = {
        id: 'sec1',
        name: 'Getting Started',
        description: 'First steps to begin',
        locale: 'en',
        category_id: 'cat1',
      };

      const result = await translateSection(section, 'he');
      
      expect(result.name).toContain('[he]');
      expect(result.description).toContain('[he]');
      expect(result.locale).toBe('he');
    });

    it('should preserve dynamic content in section', async () => {
      const section: ZendeskSection = {
        id: 'sec1',
        name: 'Section {{dc.section_title}}',
        locale: 'en',
      };

      const result = await translateSection(section, 'ar');
      
      expect(result.name).toContain('{{dc.section_title}}');
    });
  });

  describe('getZendeskTemplates', () => {
    it('should return Arabic templates for ar locale', () => {
      const templates = getZendeskTemplates('ar');
      
      expect(templates.length).toBeGreaterThan(0);
      expect(templates[0].locale).toBe('ar');
      expect(templates[0].subject).toContain('مرحباً');
    });

    it('should return Hebrew templates for he locale', () => {
      const templates = getZendeskTemplates('he');
      
      expect(templates.length).toBeGreaterThan(0);
      expect(templates[0].locale).toBe('he');
    });

    it('should return English templates for en locale', () => {
      const templates = getZendeskTemplates('en');
      
      expect(templates.length).toBeGreaterThan(0);
      expect(templates[0].locale).toBe('en');
    });

    it('should fallback to English for unknown locale', () => {
      const templates = getZendeskTemplates('unknown');
      
      expect(templates.length).toBeGreaterThan(0);
      expect(templates[0].locale).toBe('en');
    });

    it('should preserve Zendesk placeholders in templates', () => {
      const templates = getZendeskTemplates('en');
      
      templates.forEach(template => {
        expect(template.body).toContain('{{ticket.requester.name}}');
      });
    });
  });

  describe('containsRTLElements', () => {
    it('should detect RTL language codes', () => {
      expect(containsRTLElements('This is ar content')).toBe(true);
      expect(containsRTLElements('This is he content')).toBe(true);
      expect(containsRTLElements('This is fa content')).toBe(true);
    });

    it('should detect dir=rtl attribute', () => {
      expect(containsRTLElements('<div dir="rtl">Content</div>')).toBe(true);
      expect(containsRTLElements("<div dir='rtl'>Content</div>")).toBe(true);
    });

    it('should return false for non-RTL content', () => {
      expect(containsRTLElements('Regular English content')).toBe(false);
      expect(containsRTLElements('<div>Plain content</div>')).toBe(false);
    });
  });

  describe('applyRTLAdaptations', () => {
    it('should add dir=rtl for RTL locales', () => {
      const html = '<html><body>Content</body></html>';
      const result = applyRTLAdaptations(html, 'ar');
      
      expect(result).toContain('dir="rtl"');
    });

    it('should not modify for LTR locales', () => {
      const html = '<html><body>Content</body></html>';
      const result = applyRTLAdaptations(html, 'en');
      
      expect(result).not.toContain('dir="rtl"');
    });

    it('should add lang attribute', () => {
      const html = '<html><body>Content</body></html>';
      const result = applyRTLAdaptations(html, 'ar');
      
      expect(result).toContain('lang="ar"');
    });

    it('should not duplicate existing dir attribute on html', () => {
      const html = '<html dir="ltr"><body>Content</body></html>';
      const result = applyRTLAdaptations(html, 'ar');
      
      // html dir="ltr" is preserved, body should not get dir="rtl"
      expect(result.match(/dir=/g)?.length).toBe(1); // Only one dir attribute
    });
  });

  describe('isSupportedZendeskLocale', () => {
    it('should return true for supported locales', () => {
      expect(isSupportedZendeskLocale('en')).toBe(true);
      expect(isSupportedZendeskLocale('ar')).toBe(true);
      expect(isSupportedZendeskLocale('he')).toBe(true);
      expect(isSupportedZendeskLocale('es')).toBe(true);
    });

    it('should return false for unsupported locales', () => {
      expect(isSupportedZendeskLocale('xx')).toBe(false);
      expect(isSupportedZendeskLocale('unsupported')).toBe(false);
    });
  });

  describe('batchTranslateArticles', () => {
    it('should translate multiple articles', async () => {
      const articles: ZendeskArticle[] = [
        { id: '1', title: 'Article 1', body: '<p>Body 1</p>', locale: 'en' },
        { id: '2', title: 'Article 2', body: '<p>Body 2</p>', locale: 'en' },
      ];

      const results = await batchTranslateArticles(articles, 'ar');
      
      expect(results).toHaveLength(2);
      expect(results[0].title).toContain('[ar]');
      expect(results[1].title).toContain('[ar]');
    });

    it('should continue on individual failures', async () => {
      // First article succeeds, second fails
      // Note: translateArticle calls translateFn multiple times (title, body, preserve/restore)
      const customTranslate = vi.fn().mockImplementation((text) => {
        // Fail when processing the second article's title
        if (text.includes('Article 2')) {
          return Promise.reject(new Error('Translation failed'));
        }
        return Promise.resolve(`Translated: ${text}`);
      });
      
      const articles: ZendeskArticle[] = [
        { id: '1', title: 'Article 1', body: '<p>Body 1</p>', locale: 'en' },
        { id: '2', title: 'Article 2', body: '<p>Body 2</p>', locale: 'en' },
      ];

      const results = await batchTranslateArticles(articles, 'ar', customTranslate);
      
      expect(results).toHaveLength(2);
      // First article should be translated (contains Translated: prefix from our mock)
      expect(results[0].title).toContain('Translated:');
      // Second article falls back to original (translation failed, uses original title)
      expect(results[1].title).toBe('Article 2');
    });
  });

  describe('batchTranslateCategories', () => {
    it('should translate multiple categories', async () => {
      const categories: ZendeskCategory[] = [
        { id: '1', name: 'Category 1', locale: 'en' },
        { id: '2', name: 'Category 2', locale: 'en' },
      ];

      const results = await batchTranslateCategories(categories, 'he');
      
      expect(results).toHaveLength(2);
      expect(results[0].name).toContain('[he]');
      expect(results[1].name).toContain('[he]');
    });
  });

  describe('batchTranslateSections', () => {
    it('should translate multiple sections', async () => {
      const sections: ZendeskSection[] = [
        { id: '1', name: 'Section 1', locale: 'en' },
        { id: '2', name: 'Section 2', locale: 'en' },
      ];

      const results = await batchTranslateSections(sections, 'ar');
      
      expect(results).toHaveLength(2);
      expect(results[0].name).toContain('[ar]');
      expect(results[1].name).toContain('[ar]');
    });
  });

  describe('getRTLStyles', () => {
    it('should return CSS string for RTL styling', () => {
      const styles = getRTLStyles();
      
      expect(typeof styles).toBe('string');
      expect(styles).toContain('dir="rtl"');
      expect(styles).toContain('text-align: right');
    });

    it('should include list styling', () => {
      const styles = getRTLStyles();
      
      expect(styles).toContain('padding-right');
      expect(styles).toContain('padding-left: 0');
    });

    it('should include blockquote styling', () => {
      const styles = getRTLStyles();
      
      expect(styles).toContain('border-right');
      expect(styles).toContain('blockquote');
    });
  });

  describe('sanitizeContent', () => {
    it('should remove script tags', () => {
      const content = '<p>Safe content</p><script>alert("hack")</script>';
      const result = sanitizeContent(content);
      
      expect(result).not.toContain('<script');
      expect(result).toContain('<p>Safe content</p>');
    });

    it('should remove event handlers', () => {
      const content = '<p onclick="alert(1)">Click me</p>';
      const result = sanitizeContent(content);
      
      expect(result).not.toContain('onclick');
    });

    it('should remove javascript URLs', () => {
      const content = '<a href="javascript:alert(1)">Link</a>';
      const result = sanitizeContent(content);
      
      expect(result).not.toContain('javascript:');
      expect(result).toContain('href="#"');
    });

    it('should handle content without scripts', () => {
      const content = '<p>Safe content</p>';
      const result = sanitizeContent(content);
      
      expect(result).toBe(content);
    });
  });
});
