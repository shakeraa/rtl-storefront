import { describe, it, expect } from 'vitest';
import {
  getFaqLabel,
  formatFaqItem,
  getFaqCategories,
  getFaqItemsByCategory,
  getAllFaqItems,
  getFaqCategoryById,
} from '../../app/services/ui-labels/faq';

describe('FAQ Labels', () => {
  describe('getFaqLabel', () => {
    describe('English (en)', () => {
      it('returns "Frequently Asked Questions" for frequentlyAskedQuestions key', () => {
        const label = getFaqLabel('frequentlyAskedQuestions', 'en');
        expect(label).toBe('Frequently Asked Questions');
      });

      it('returns "Question" for question key', () => {
        const label = getFaqLabel('question', 'en');
        expect(label).toBe('Question');
      });

      it('returns "Answer" for answer key', () => {
        const label = getFaqLabel('answer', 'en');
        expect(label).toBe('Answer');
      });

      it('returns "Helpful" for helpful key', () => {
        const label = getFaqLabel('helpful', 'en');
        expect(label).toBe('Helpful');
      });

      it('returns "Not Helpful" for notHelpful key', () => {
        const label = getFaqLabel('notHelpful', 'en');
        expect(label).toBe('Not Helpful');
      });

      it('returns "Read More" for readMore key', () => {
        const label = getFaqLabel('readMore', 'en');
        expect(label).toBe('Read More');
      });

      it('returns "Collapse" for collapse key', () => {
        const label = getFaqLabel('collapse', 'en');
        expect(label).toBe('Collapse');
      });
    });

    describe('Arabic (ar)', () => {
      it('returns Arabic text for frequentlyAskedQuestions key', () => {
        const label = getFaqLabel('frequentlyAskedQuestions', 'ar');
        expect(label).toBe('الأسئلة الشائعة');
      });

      it('returns Arabic text for question key', () => {
        const label = getFaqLabel('question', 'ar');
        expect(label).toBe('السؤال');
      });

      it('returns Arabic text for answer key', () => {
        const label = getFaqLabel('answer', 'ar');
        expect(label).toBe('الإجابة');
      });

      it('returns Arabic text for helpful key', () => {
        const label = getFaqLabel('helpful', 'ar');
        expect(label).toBe('مفيد');
      });

      it('returns Arabic text for notHelpful key', () => {
        const label = getFaqLabel('notHelpful', 'ar');
        expect(label).toBe('غير مفيد');
      });

      it('returns Arabic text for readMore key', () => {
        const label = getFaqLabel('readMore', 'ar');
        expect(label).toBe('اقرأ المزيد');
      });

      it('returns Arabic text for collapse key', () => {
        const label = getFaqLabel('collapse', 'ar');
        expect(label).toBe('طي');
      });
    });

    describe('Hebrew (he)', () => {
      it('returns Hebrew text for frequentlyAskedQuestions key', () => {
        const label = getFaqLabel('frequentlyAskedQuestions', 'he');
        expect(label).toBe('שאלות נפוצות');
      });

      it('returns Hebrew text for question key', () => {
        const label = getFaqLabel('question', 'he');
        expect(label).toBe('שאלה');
      });

      it('returns Hebrew text for answer key', () => {
        const label = getFaqLabel('answer', 'he');
        expect(label).toBe('תשובה');
      });

      it('returns Hebrew text for helpful key', () => {
        const label = getFaqLabel('helpful', 'he');
        expect(label).toBe('מועיל');
      });

      it('returns Hebrew text for notHelpful key', () => {
        const label = getFaqLabel('notHelpful', 'he');
        expect(label).toBe('לא מועיל');
      });

      it('returns Hebrew text for readMore key', () => {
        const label = getFaqLabel('readMore', 'he');
        expect(label).toBe('קרא עוד');
      });

      it('returns Hebrew text for collapse key', () => {
        const label = getFaqLabel('collapse', 'he');
        expect(label).toBe('כווץ');
      });
    });

    describe('Locale fallback', () => {
      it('falls back to English for unknown locale', () => {
        const label = getFaqLabel('question', 'unknown');
        expect(label).toBe('Question');
      });

      it('handles locale with region code by extracting base', () => {
        const label = getFaqLabel('question', 'ar-SA');
        expect(label).toBe('السؤال');
      });

      it('handles Hebrew locale with region code', () => {
        const label = getFaqLabel('question', 'he-IL');
        expect(label).toBe('שאלה');
      });
    });
  });

describe('FAQ Categories', () => {
    describe('getFaqCategories', () => {
      it('returns 5 categories for English locale', () => {
        const categories = getFaqCategories('en');
        expect(categories).toHaveLength(5);
      });

      it('returns 5 categories for Arabic locale', () => {
        const categories = getFaqCategories('ar');
        expect(categories).toHaveLength(5);
      });

      it('returns 5 categories for Hebrew locale', () => {
        const categories = getFaqCategories('he');
        expect(categories).toHaveLength(5);
      });

      it('returns categories with correct IDs', () => {
        const categories = getFaqCategories('en');
        const ids = categories.map(c => c.id);
        expect(ids).toContain('shipping');
        expect(ids).toContain('returns');
        expect(ids).toContain('payment');
        expect(ids).toContain('sizing');
        expect(ids).toContain('general');
      });

      it('returns Arabic category names for ar locale', () => {
        const categories = getFaqCategories('ar');
        const shipping = categories.find(c => c.id === 'shipping');
        expect(shipping?.name).toBe('الشحن والتوصيل');
      });

      it('returns Hebrew category names for he locale', () => {
        const categories = getFaqCategories('he');
        const shipping = categories.find(c => c.id === 'shipping');
        expect(shipping?.name).toBe('משלוח ואספקה');
      });

      it('each category has name and description', () => {
        const categories = getFaqCategories('en');
        for (const category of categories) {
          expect(category).toHaveProperty('id');
          expect(category).toHaveProperty('name');
          expect(category).toHaveProperty('description');
          expect(category.name.length).toBeGreaterThan(0);
          expect(category.description.length).toBeGreaterThan(0);
        }
      });

      it('falls back to English for unknown locale', () => {
        const categories = getFaqCategories('unknown');
        expect(categories).toHaveLength(5);
        expect(categories[0].name).toBeTruthy();
      });
    });

    describe('getFaqCategoryById', () => {
      it('returns shipping category for en locale', () => {
        const category = getFaqCategoryById('shipping', 'en');
        expect(category).not.toBeNull();
        expect(category?.name).toBe('Shipping & Delivery');
      });

      it('returns returns category with correct description', () => {
        const category = getFaqCategoryById('returns', 'en');
        expect(category?.description).toContain('return');
      });

      it('returns null for non-existent category', () => {
        const category = getFaqCategoryById('nonexistent', 'en');
        expect(category).toBeNull();
      });
    });
  });

describe('FAQ Items - Questions and Answers', () => {
    describe('English FAQ items', () => {
      it('returns shipping FAQ items for en locale', () => {
        const items = getFaqItemsByCategory('shipping', 'en');
        expect(items.length).toBeGreaterThan(0);
        expect(items[0].question).toContain('shipping');
      });

      it('returns payment FAQ items with questions and answers', () => {
        const items = getFaqItemsByCategory('payment', 'en');
        expect(items.length).toBeGreaterThan(0);
        for (const item of items) {
          expect(item.question.length).toBeGreaterThan(0);
          expect(item.answer.length).toBeGreaterThan(0);
          expect(item.category).toBe('payment');
        }
      });

      it('returns sizing FAQ with size-related questions', () => {
        const items = getFaqItemsByCategory('sizing', 'en');
        expect(items.length).toBeGreaterThan(0);
        const question = items[0].question.toLowerCase();
        expect(question).toMatch(/size|fit/);
      });
    });

    describe('Arabic FAQ items', () => {
      it('returns shipping FAQ items with Arabic text', () => {
        const items = getFaqItemsByCategory('shipping', 'ar');
        expect(items.length).toBeGreaterThan(0);
        // Check for Arabic characters
        expect(items[0].question).toMatch(/[\u0600-\u06FF]/);
        expect(items[0].answer).toMatch(/[\u0600-\u06FF]/);
      });

      it('returns returns FAQ with Arabic question about return policy', () => {
        const items = getFaqItemsByCategory('returns', 'ar');
        const item = items.find(i => i.question.includes('سياسة'));
        expect(item).toBeDefined();
        expect(item?.answer).toContain('30');
      });

      it('returns payment FAQ with Arabic question about payment methods', () => {
        const items = getFaqItemsByCategory('payment', 'ar');
        const item = items.find(i => i.question.includes('الدفع'));
        expect(item).toBeDefined();
        expect(item?.answer).toContain('تابي');
      });

      it('returns general FAQ with Arabic customer support question', () => {
        const items = getFaqItemsByCategory('general', 'ar');
        const item = items.find(i => i.question.includes('دعم'));
        expect(item).toBeDefined();
        expect(item?.answer).toContain('البريد الإلكتروني');
      });
    });

    describe('Hebrew FAQ items', () => {
      it('returns shipping FAQ items with Hebrew text', () => {
        const items = getFaqItemsByCategory('shipping', 'he');
        expect(items.length).toBeGreaterThan(0);
        // Check for Hebrew characters
        expect(items[0].question).toMatch(/[\u0590-\u05FF]/);
        expect(items[0].answer).toMatch(/[\u0590-\u05FF]/);
      });

      it('returns returns FAQ with Hebrew question about return policy', () => {
        const items = getFaqItemsByCategory('returns', 'he');
        const item = items.find(i => i.question.includes('החזר'));
        expect(item).toBeDefined();
        expect(item?.answer).toContain('30');
      });

      it('returns payment FAQ with Hebrew question about payment methods', () => {
        const items = getFaqItemsByCategory('payment', 'he');
        const item = items.find(i => i.question.includes('תשלום'));
        expect(item).toBeDefined();
        expect(item?.answer).toContain('PayPal');
      });
    });

    describe('getAllFaqItems', () => {
      it('returns all FAQ items for English locale', () => {
        const items = getAllFaqItems('en');
        expect(items.length).toBeGreaterThanOrEqual(10);
      });

      it('returns all FAQ items for Arabic locale', () => {
        const items = getAllFaqItems('ar');
        expect(items.length).toBeGreaterThanOrEqual(10);
        // Verify Arabic content
        expect(items[0].question).toMatch(/[\u0600-\u06FF]/);
      });

      it('returns all FAQ items for Hebrew locale', () => {
        const items = getAllFaqItems('he');
        expect(items.length).toBeGreaterThanOrEqual(10);
        // Verify Hebrew content
        expect(items[0].question).toMatch(/[\u0590-\u05FF]/);
      });
    });
  });

describe('formatFaqItem', () => {
    it('formats FAQ item with rtl direction for Arabic', () => {
      const item = formatFaqItem('سؤال؟', 'إجابة', 'ar', 'general');
      expect(item.direction).toBe('rtl');
      expect(item.locale).toBe('ar');
      expect(item.question).toBe('سؤال؟');
      expect(item.answer).toBe('إجابة');
    });

    it('formats FAQ item with rtl direction for Hebrew', () => {
      const item = formatFaqItem('שאלה?', 'תשובה', 'he', 'general');
      expect(item.direction).toBe('rtl');
      expect(item.locale).toBe('he');
    });

    it('formats FAQ item with ltr direction for English', () => {
      const item = formatFaqItem('Question?', 'Answer', 'en', 'general');
      expect(item.direction).toBe('ltr');
      expect(item.locale).toBe('en');
    });

    it('handles locale with region code', () => {
      const item = formatFaqItem('Q', 'A', 'ar-SA', 'shipping');
      expect(item.locale).toBe('ar');
      expect(item.direction).toBe('rtl');
    });

    it('falls back to English for unknown locale', () => {
      const item = formatFaqItem('Q', 'A', 'unknown', 'general');
      expect(item.locale).toBe('en');
      expect(item.direction).toBe('ltr');
    });

    it('includes category in formatted item', () => {
      const item = formatFaqItem('Q', 'A', 'en', 'payment');
      expect(item.category).toBe('payment');
    });

    it('defaults category to general when not provided', () => {
      const item = formatFaqItem('Q', 'A', 'en');
      expect(item.category).toBe('general');
    });
  });

describe('FAQ Item content validation', () => {
    it('Arabic questions contain proper Arabic text for shipping', () => {
      const items = getFaqItemsByCategory('shipping', 'ar');
      const item = items.find(i => i.question.includes('شحن'));
      expect(item).toBeDefined();
      expect(item?.question).toBe('كم يستغرق الشحن؟');
    });

    it('Arabic questions contain proper Arabic text for sizing', () => {
      const items = getFaqItemsByCategory('sizing', 'ar');
      const item = items.find(i => i.question.includes('مقاسي'));
      expect(item).toBeDefined();
      expect(item?.question).toBe('كيف أجد مقاسي؟');
    });

    it('Hebrew questions contain proper Hebrew text for shipping', () => {
      const items = getFaqItemsByCategory('shipping', 'he');
      const item = items.find(i => i.question.includes('משלוח'));
      expect(item).toBeDefined();
    });

    it('Hebrew questions contain proper Hebrew text for returns', () => {
      const items = getFaqItemsByCategory('returns', 'he');
      const item = items.find(i => i.question.includes('החזר'));
      expect(item).toBeDefined();
    });

    it('English questions are properly formatted', () => {
      const items = getFaqItemsByCategory('shipping', 'en');
      for (const item of items) {
        expect(item.question.endsWith('?')).toBe(true);
        expect(item.answer.length).toBeGreaterThan(10);
      }
    });
  });
});
