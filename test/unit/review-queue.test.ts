import { describe, it, expect, beforeEach } from 'vitest';
import {
  addToQueue,
  getQueueItems,
  getQueueItemById,
  updateItemStatus,
  assignToReviewer,
  unassignReviewer,
  updateQueueItem,
  removeFromQueue,
  getQueueStats,
  getReviewerQueue,
  getUrgentItems,
  bulkAssignToReviewer,
  bulkUpdateStatus,
  clearQueue,
  getOldestPendingItems,
  reassignReviewerItems,
  isValidStatusTransition,
  QueueItem,
  QueueItemInput,
  ReviewStatus,
  PriorityLevel,
  PRIORITY_WEIGHTS,
  VALID_TRANSITIONS,
} from '../../app/services/translation-features/review-queue';

describe('Translation Review Queue Service', () => {
  beforeEach(() => {
    clearQueue();
  });

  describe('addToQueue', () => {
    it('adds a basic item to the queue', () => {
      const input: QueueItemInput = {
        type: 'product',
        sourceText: 'Hello World',
        translatedText: 'مرحبا بالعالم',
        sourceLocale: 'en',
        targetLocale: 'ar',
      };

      const item = addToQueue(input);

      expect(item.id).toBeDefined();
      expect(item.status).toBe('pending');
      expect(item.priority).toBe('normal');
      expect(item.sourceText).toBe('Hello World');
      expect(item.translatedText).toBe('مرحبا بالعالم');
    });

    it('adds item with custom priority', () => {
      const item = addToQueue({
        type: 'product',
        sourceText: 'Urgent text',
        translatedText: 'نص عاجل',
        sourceLocale: 'en',
        targetLocale: 'ar',
        priority: 'urgent',
      });

      expect(item.priority).toBe('urgent');
    });

    it('calculates word and character count automatically', () => {
      const item = addToQueue({
        type: 'product',
        sourceText: 'This is a test',
        translatedText: 'هذا اختبار',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      expect(item.metadata.wordCount).toBe(4);
      expect(item.metadata.characterCount).toBe(14);
    });

    it('includes metadata in queue item', () => {
      const item = addToQueue({
        type: 'product',
        sourceText: 'Test',
        translatedText: 'اختبار',
        sourceLocale: 'en',
        targetLocale: 'ar',
        metadata: {
          productId: 'prod_123',
          aiConfidence: 0.95,
          tags: ['homepage', 'featured'],
        },
      });

      expect(item.metadata.productId).toBe('prod_123');
      expect(item.metadata.aiConfidence).toBe(0.95);
      expect(item.metadata.tags).toEqual(['homepage', 'featured']);
    });

    it('throws error when source text is empty', () => {
      expect(() =>
        addToQueue({
          type: 'product',
          sourceText: '',
          translatedText: 'اختبار',
          sourceLocale: 'en',
          targetLocale: 'ar',
        })
      ).toThrow('Source text and translated text are required');
    });

    it('throws error when locales are missing', () => {
      expect(() =>
        addToQueue({
          type: 'product',
          sourceText: 'Test',
          translatedText: 'اختبار',
          sourceLocale: '',
          targetLocale: 'ar',
        })
      ).toThrow('Source locale and target locale are required');
    });

    it('generates unique IDs for each item', () => {
      const item1 = addToQueue({
        type: 'product',
        sourceText: 'Text 1',
        translatedText: 'نص 1',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      const item2 = addToQueue({
        type: 'product',
        sourceText: 'Text 2',
        translatedText: 'نص 2',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      expect(item1.id).not.toBe(item2.id);
    });
  });

  describe('getQueueItems', () => {
    it('returns all items when no filters applied', () => {
      addToQueue({
        type: 'product',
        sourceText: 'Text 1',
        translatedText: 'نص 1',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });
      addToQueue({
        type: 'collection',
        sourceText: 'Text 2',
        translatedText: 'نص 2',
        sourceLocale: 'en',
        targetLocale: 'he',
      });

      const items = getQueueItems();
      expect(items).toHaveLength(2);
    });

    it('filters by status', () => {
      const item1 = addToQueue({
        type: 'product',
        sourceText: 'Pending text',
        translatedText: 'نص معلق',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      const item2 = addToQueue({
        type: 'product',
        sourceText: 'Another text',
        translatedText: 'نص آخر',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      // Must go through in_review first before approved
      updateItemStatus(item2.id, 'in_review', { reviewerId: 'reviewer_1' });
      updateItemStatus(item2.id, 'approved', { reviewerId: 'reviewer_1' });

      const pendingItems = getQueueItems({ status: 'pending' });
      expect(pendingItems).toHaveLength(1);
      expect(pendingItems[0].id).toBe(item1.id);
    });

    it('filters by priority', () => {
      addToQueue({
        type: 'product',
        sourceText: 'Normal priority',
        translatedText: 'أولوية عادية',
        sourceLocale: 'en',
        targetLocale: 'ar',
        priority: 'normal',
      });

      addToQueue({
        type: 'product',
        sourceText: 'High priority',
        translatedText: 'أولوية عالية',
        sourceLocale: 'en',
        targetLocale: 'ar',
        priority: 'high',
      });

      const highPriorityItems = getQueueItems({ priority: 'high' });
      expect(highPriorityItems).toHaveLength(1);
      expect(highPriorityItems[0].sourceText).toBe('High priority');
    });

    it('filters by assigned reviewer', () => {
      const item = addToQueue({
        type: 'product',
        sourceText: 'Assigned text',
        translatedText: 'نص مخصص',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      assignToReviewer(item.id, 'reviewer_123');

      const assignedItems = getQueueItems({ assignedTo: 'reviewer_123' });
      expect(assignedItems).toHaveLength(1);
    });

    it('filters by target locale', () => {
      addToQueue({
        type: 'product',
        sourceText: 'To Arabic',
        translatedText: 'للعربية',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      addToQueue({
        type: 'product',
        sourceText: 'To Hebrew',
        translatedText: 'לעברית',
        sourceLocale: 'en',
        targetLocale: 'he',
      });

      const arabicItems = getQueueItems({ targetLocale: 'ar' });
      expect(arabicItems).toHaveLength(1);
      expect(arabicItems[0].targetLocale).toBe('ar');
    });

    it('filters by item type', () => {
      addToQueue({
        type: 'product',
        sourceText: 'Product text',
        translatedText: 'نص المنتج',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      addToQueue({
        type: 'collection',
        sourceText: 'Collection text',
        translatedText: 'نص المجموعة',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      const productItems = getQueueItems({ itemType: 'product' });
      expect(productItems).toHaveLength(1);
      expect(productItems[0].type).toBe('product');
    });

    it('filters by search term in source text', () => {
      addToQueue({
        type: 'product',
        sourceText: 'Blue shoes',
        translatedText: 'حذاء أزرق',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      addToQueue({
        type: 'product',
        sourceText: 'Red shirt',
        translatedText: 'قميص أحمر',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      const results = getQueueItems({ searchTerm: 'shoes' });
      expect(results).toHaveLength(1);
      expect(results[0].sourceText).toBe('Blue shoes');
    });

    it('filters by search term in translated text', () => {
      addToQueue({
        type: 'product',
        sourceText: 'Blue shoes',
        translatedText: 'حذاء أزرق',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      const results = getQueueItems({ searchTerm: 'أزرق' });
      expect(results).toHaveLength(1);
    });

    it('filters by date range', () => {
      const oldDate = new Date('2024-01-01');
      const newDate = new Date('2024-06-01');

      const item1 = addToQueue({
        type: 'product',
        sourceText: 'Old text',
        translatedText: 'نص قديم',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });
      // Manually override createdAt for testing
      updateQueueItem(item1.id, { createdAt: oldDate });

      const item2 = addToQueue({
        type: 'product',
        sourceText: 'New text',
        translatedText: 'نص جديد',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });
      updateQueueItem(item2.id, { createdAt: newDate });

      const results = getQueueItems({
        dateFrom: new Date('2024-03-01'),
        dateTo: new Date('2024-12-31'),
      });

      expect(results).toHaveLength(1);
      expect(results[0].sourceText).toBe('New text');
    });

    it('filters by tags', () => {
      addToQueue({
        type: 'product',
        sourceText: 'Tagged text',
        translatedText: 'نص موسوم',
        sourceLocale: 'en',
        targetLocale: 'ar',
        metadata: { tags: ['urgent', 'homepage'] },
      });

      addToQueue({
        type: 'product',
        sourceText: 'Untagged text',
        translatedText: 'نص غير موسوم',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      const results = getQueueItems({ tags: ['urgent'] });
      expect(results).toHaveLength(1);
    });

    it('sorts by priority', () => {
      addToQueue({
        type: 'product',
        sourceText: 'Low priority',
        translatedText: 'أولوية منخفضة',
        sourceLocale: 'en',
        targetLocale: 'ar',
        priority: 'low',
      });

      addToQueue({
        type: 'product',
        sourceText: 'High priority',
        translatedText: 'أولوية عالية',
        sourceLocale: 'en',
        targetLocale: 'ar',
        priority: 'high',
      });

      const results = getQueueItems({}, { sortBy: 'priority' });
      expect(results[0].priority).toBe('high');
      expect(results[1].priority).toBe('low');
    });

    it('sorts by date', () => {
      const oldDate = new Date('2024-01-01');
      const newDate = new Date('2024-06-01');

      const item1 = addToQueue({
        type: 'product',
        sourceText: 'Older',
        translatedText: 'أقدم',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });
      updateQueueItem(item1.id, { createdAt: oldDate });

      const item2 = addToQueue({
        type: 'product',
        sourceText: 'Newer',
        translatedText: 'أحدث',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });
      updateQueueItem(item2.id, { createdAt: newDate });

      const results = getQueueItems({}, { sortBy: 'date' });
      expect(results[0].id).toBe(item2.id);
      expect(results[1].id).toBe(item1.id);
    });

    it('applies limit and offset', () => {
      for (let i = 0; i < 5; i++) {
        addToQueue({
          type: 'product',
          sourceText: `Text ${i}`,
          translatedText: `نص ${i}`,
          sourceLocale: 'en',
          targetLocale: 'ar',
        });
      }

      const results = getQueueItems({}, { limit: 2, offset: 1 });
      expect(results).toHaveLength(2);
    });
  });

  describe('getQueueItemById', () => {
    it('returns item by ID', () => {
      const item = addToQueue({
        type: 'product',
        sourceText: 'Test text',
        translatedText: 'نص تجريبي',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      const found = getQueueItemById(item.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(item.id);
    });

    it('returns undefined for non-existent ID', () => {
      const found = getQueueItemById('non_existent_id');
      expect(found).toBeUndefined();
    });
  });

  describe('updateItemStatus', () => {
    it('updates status from pending to in_review', () => {
      const item = addToQueue({
        type: 'product',
        sourceText: 'Test',
        translatedText: 'اختبار',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      const updated = updateItemStatus(item.id, 'in_review', { reviewerId: 'reviewer_1' });
      expect(updated.status).toBe('in_review');
    });

    it('updates status from in_review to approved', () => {
      const item = addToQueue({
        type: 'product',
        sourceText: 'Test',
        translatedText: 'اختبار',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      updateItemStatus(item.id, 'in_review', { reviewerId: 'reviewer_1' });
      const updated = updateItemStatus(item.id, 'approved', { reviewerId: 'reviewer_1' });

      expect(updated.status).toBe('approved');
      expect(updated.reviewedAt).toBeDefined();
      expect(updated.reviewedBy).toBe('reviewer_1');
    });

    it('updates status from in_review to rejected', () => {
      const item = addToQueue({
        type: 'product',
        sourceText: 'Test',
        translatedText: 'اختبار',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      updateItemStatus(item.id, 'in_review', { reviewerId: 'reviewer_1' });
      const updated = updateItemStatus(item.id, 'rejected', {
        reviewerId: 'reviewer_1',
        reviewNotes: 'Translation quality is poor',
      });

      expect(updated.status).toBe('rejected');
      expect(updated.reviewNotes).toBe('Translation quality is poor');
    });

    it('throws error for invalid status transition', () => {
      const item = addToQueue({
        type: 'product',
        sourceText: 'Test',
        translatedText: 'اختبار',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      expect(() =>
        updateItemStatus(item.id, 'approved', { reviewerId: 'reviewer_1' })
      ).toThrow('Invalid status transition');
    });

    it('throws error when item not found', () => {
      expect(() =>
        updateItemStatus('non_existent', 'approved', { reviewerId: 'reviewer_1' })
      ).toThrow('Queue item with ID non_existent not found');
    });
  });

  describe('assignToReviewer', () => {
    it('assigns item to reviewer', () => {
      const item = addToQueue({
        type: 'product',
        sourceText: 'Test',
        translatedText: 'اختبار',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      const updated = assignToReviewer(item.id, 'reviewer_123');
      expect(updated.assignedTo).toBe('reviewer_123');
    });

    it('throws error for empty reviewer ID', () => {
      const item = addToQueue({
        type: 'product',
        sourceText: 'Test',
        translatedText: 'اختبار',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      expect(() => assignToReviewer(item.id, '')).toThrow('Reviewer ID is required');
    });

    it('throws error when item not found', () => {
      expect(() => assignToReviewer('non_existent', 'reviewer_1')).toThrow(
        'Queue item with ID non_existent not found'
      );
    });
  });

  describe('unassignReviewer', () => {
    it('removes reviewer assignment', () => {
      const item = addToQueue({
        type: 'product',
        sourceText: 'Test',
        translatedText: 'اختبار',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      assignToReviewer(item.id, 'reviewer_123');
      const updated = unassignReviewer(item.id);

      expect(updated.assignedTo).toBeUndefined();
    });

    it('throws error when item not found', () => {
      expect(() => unassignReviewer('non_existent')).toThrow(
        'Queue item with ID non_existent not found'
      );
    });
  });

  describe('updateQueueItem', () => {
    it('updates item fields', () => {
      const item = addToQueue({
        type: 'product',
        sourceText: 'Original',
        translatedText: 'أصلي',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      const updated = updateQueueItem(item.id, {
        translatedText: 'محدث',
        priority: 'high',
      });

      expect(updated.translatedText).toBe('محدث');
      expect(updated.priority).toBe('high');
      expect(updated.sourceText).toBe('Original');
    });

    it('throws error when item not found', () => {
      expect(() =>
        updateQueueItem('non_existent', { priority: 'high' })
      ).toThrow('Queue item with ID non_existent not found');
    });
  });

  describe('removeFromQueue', () => {
    it('removes item from queue', () => {
      const item = addToQueue({
        type: 'product',
        sourceText: 'Test',
        translatedText: 'اختبار',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      const removed = removeFromQueue(item.id);
      expect(removed).toBe(true);
      expect(getQueueItemById(item.id)).toBeUndefined();
    });

    it('returns false for non-existent item', () => {
      const removed = removeFromQueue('non_existent');
      expect(removed).toBe(false);
    });
  });

  describe('getQueueStats', () => {
    it('returns zero stats for empty queue', () => {
      const stats = getQueueStats();

      expect(stats.total).toBe(0);
      expect(stats.pending).toBe(0);
      expect(stats.approved).toBe(0);
      expect(stats.rejected).toBe(0);
    });

    it('calculates status counts correctly', () => {
      const item1 = addToQueue({
        type: 'product',
        sourceText: 'Pending',
        translatedText: 'معلق',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      const item2 = addToQueue({
        type: 'product',
        sourceText: 'To approve',
        translatedText: 'للموافقة',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      updateItemStatus(item2.id, 'in_review', { reviewerId: 'r1' });
      updateItemStatus(item2.id, 'approved', { reviewerId: 'r1' });

      const stats = getQueueStats();

      expect(stats.total).toBe(2);
      expect(stats.pending).toBe(1);
      expect(stats.approved).toBe(1);
    });

    it('counts by priority levels', () => {
      addToQueue({
        type: 'product',
        sourceText: 'Urgent',
        translatedText: 'عاجل',
        sourceLocale: 'en',
        targetLocale: 'ar',
        priority: 'urgent',
      });

      addToQueue({
        type: 'product',
        sourceText: 'Normal',
        translatedText: 'عادي',
        sourceLocale: 'en',
        targetLocale: 'ar',
        priority: 'normal',
      });

      addToQueue({
        type: 'product',
        sourceText: 'Low',
        translatedText: 'منخفض',
        sourceLocale: 'en',
        targetLocale: 'ar',
        priority: 'low',
      });

      const stats = getQueueStats();

      expect(stats.byPriority.urgent).toBe(1);
      expect(stats.byPriority.normal).toBe(1);
      expect(stats.byPriority.low).toBe(1);
      expect(stats.byPriority.high).toBe(0);
    });

    it('counts by target locale', () => {
      addToQueue({
        type: 'product',
        sourceText: 'To Arabic',
        translatedText: 'للعربية',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      addToQueue({
        type: 'product',
        sourceText: 'To Hebrew',
        translatedText: 'לעברית',
        sourceLocale: 'en',
        targetLocale: 'he',
      });

      addToQueue({
        type: 'product',
        sourceText: 'Also to Arabic',
        translatedText: 'أيضا للعربية',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      const stats = getQueueStats();

      expect(stats.byLocale.ar).toBe(2);
      expect(stats.byLocale.he).toBe(1);
    });

    it('counts by item type', () => {
      addToQueue({
        type: 'product',
        sourceText: 'Product',
        translatedText: 'منتج',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      addToQueue({
        type: 'collection',
        sourceText: 'Collection',
        translatedText: 'مجموعة',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      addToQueue({
        type: 'page',
        sourceText: 'Page',
        translatedText: 'صفحة',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      const stats = getQueueStats();

      expect(stats.byType.product).toBe(1);
      expect(stats.byType.collection).toBe(1);
      expect(stats.byType.page).toBe(1);
      expect(stats.byType.blog).toBe(0);
    });

    it('counts unassigned items', () => {
      const item = addToQueue({
        type: 'product',
        sourceText: 'Test',
        translatedText: 'اختبار',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      addToQueue({
        type: 'product',
        sourceText: 'Another',
        translatedText: 'آخر',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      assignToReviewer(item.id, 'reviewer_1');

      const stats = getQueueStats();
      expect(stats.unassigned).toBe(1);
    });

    it('counts overdue items', () => {
      const oldItem = addToQueue({
        type: 'product',
        sourceText: 'Old',
        translatedText: 'قديم',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      // Override createdAt to be more than 48 hours ago
      updateQueueItem(oldItem.id, {
        createdAt: new Date(Date.now() - 49 * 60 * 60 * 1000),
      });

      const stats = getQueueStats();
      expect(stats.overdue).toBe(1);
    });

    it('calculates average review time', () => {
      const item1 = addToQueue({
        type: 'product',
        sourceText: 'Quick',
        translatedText: 'سريع',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      // Simulate 2 hours review time
      updateItemStatus(item1.id, 'in_review', { reviewerId: 'r1' });
      updateQueueItem(item1.id, {
        reviewedAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      });
      updateItemStatus(item1.id, 'approved', { reviewerId: 'r1' });

      const stats = getQueueStats();
      expect(stats.averageReviewTime).toBeDefined();
    });
  });

  describe('getReviewerQueue', () => {
    it('returns items assigned to specific reviewer', () => {
      const item1 = addToQueue({
        type: 'product',
        sourceText: 'Assigned to Alice',
        translatedText: 'مخصص لأليس',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      addToQueue({
        type: 'product',
        sourceText: 'Assigned to Bob',
        translatedText: 'مخصص لبوب',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      assignToReviewer(item1.id, 'alice');

      const aliceQueue = getReviewerQueue('alice');
      expect(aliceQueue).toHaveLength(1);
      expect(aliceQueue[0].assignedTo).toBe('alice');
    });
  });

  describe('getUrgentItems', () => {
    it('returns urgent pending items', () => {
      addToQueue({
        type: 'product',
        sourceText: 'Urgent 1',
        translatedText: 'عاجل 1',
        sourceLocale: 'en',
        targetLocale: 'ar',
        priority: 'urgent',
      });

      addToQueue({
        type: 'product',
        sourceText: 'Normal priority',
        translatedText: 'أولوية عادية',
        sourceLocale: 'en',
        targetLocale: 'ar',
        priority: 'normal',
      });

      const urgent = getUrgentItems();
      expect(urgent).toHaveLength(1);
      expect(urgent[0].sourceText).toBe('Urgent 1');
    });

    it('does not return approved urgent items', () => {
      const item = addToQueue({
        type: 'product',
        sourceText: 'Urgent',
        translatedText: 'عاجل',
        sourceLocale: 'en',
        targetLocale: 'ar',
        priority: 'urgent',
      });

      updateItemStatus(item.id, 'in_review', { reviewerId: 'r1' });
      updateItemStatus(item.id, 'approved', { reviewerId: 'r1' });

      const urgent = getUrgentItems();
      expect(urgent).toHaveLength(0);
    });
  });

  describe('bulkAssignToReviewer', () => {
    it('assigns multiple items to reviewer', () => {
      const item1 = addToQueue({
        type: 'product',
        sourceText: 'Text 1',
        translatedText: 'نص 1',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      const item2 = addToQueue({
        type: 'product',
        sourceText: 'Text 2',
        translatedText: 'نص 2',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      const results = bulkAssignToReviewer([item1.id, item2.id], 'reviewer_1');

      expect(results).toHaveLength(2);
      expect(results[0].assignedTo).toBe('reviewer_1');
      expect(results[1].assignedTo).toBe('reviewer_1');
    });

    it('skips non-existent items gracefully', () => {
      const item = addToQueue({
        type: 'product',
        sourceText: 'Text',
        translatedText: 'نص',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      const results = bulkAssignToReviewer([item.id, 'non_existent'], 'reviewer_1');

      expect(results).toHaveLength(1);
    });
  });

  describe('bulkUpdateStatus', () => {
    it('updates status for multiple items', () => {
      const item1 = addToQueue({
        type: 'product',
        sourceText: 'Text 1',
        translatedText: 'نص 1',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      const item2 = addToQueue({
        type: 'product',
        sourceText: 'Text 2',
        translatedText: 'نص 2',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      assignToReviewer(item1.id, 'reviewer_1');
      assignToReviewer(item2.id, 'reviewer_1');

      const results = bulkUpdateStatus([item1.id, item2.id], 'in_review', {
        reviewerId: 'reviewer_1',
      });

      expect(results).toHaveLength(2);
      expect(results[0].status).toBe('in_review');
      expect(results[1].status).toBe('in_review');
    });

    it('skips items with invalid transitions', () => {
      const item = addToQueue({
        type: 'product',
        sourceText: 'Text',
        translatedText: 'نص',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      // Cannot go from pending to approved directly
      const results = bulkUpdateStatus([item.id], 'approved', { reviewerId: 'r1' });

      expect(results).toHaveLength(0);
    });
  });

  describe('getOldestPendingItems', () => {
    it('returns oldest pending items first', () => {
      const item1 = addToQueue({
        type: 'product',
        sourceText: 'Older',
        translatedText: 'أقدم',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      // Simulate time passing
      updateQueueItem(item1.id, {
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      });

      const item2 = addToQueue({
        type: 'product',
        sourceText: 'Newer',
        translatedText: 'أحدث',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      const oldest = getOldestPendingItems(2);

      expect(oldest).toHaveLength(2);
      expect(oldest[0].id).toBe(item1.id);
    });

    it('respects limit parameter', () => {
      for (let i = 0; i < 5; i++) {
        addToQueue({
          type: 'product',
          sourceText: `Text ${i}`,
          translatedText: `نص ${i}`,
          sourceLocale: 'en',
          targetLocale: 'ar',
        });
      }

      const oldest = getOldestPendingItems(3);
      expect(oldest).toHaveLength(3);
    });
  });

  describe('reassignReviewerItems', () => {
    it('reassigns all items from one reviewer to another', () => {
      const item1 = addToQueue({
        type: 'product',
        sourceText: 'Text 1',
        translatedText: 'نص 1',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      const item2 = addToQueue({
        type: 'product',
        sourceText: 'Text 2',
        translatedText: 'نص 2',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      assignToReviewer(item1.id, 'alice');
      assignToReviewer(item2.id, 'alice');

      const count = reassignReviewerItems('alice', 'bob');

      expect(count).toBe(2);
      expect(getQueueItemById(item1.id)?.assignedTo).toBe('bob');
      expect(getQueueItemById(item2.id)?.assignedTo).toBe('bob');
    });

    it('returns zero when no items to reassign', () => {
      const count = reassignReviewerItems('alice', 'bob');
      expect(count).toBe(0);
    });
  });

  describe('isValidStatusTransition', () => {
    it('allows pending to in_review with reviewer', () => {
      expect(isValidStatusTransition('pending', 'in_review', true)).toBe(true);
    });

    it('disallows pending to approved without going through in_review', () => {
      expect(isValidStatusTransition('pending', 'approved', true)).toBe(false);
    });

    it('allows in_review to approved with reviewer', () => {
      expect(isValidStatusTransition('in_review', 'approved', true)).toBe(true);
    });

    it('allows in_review to rejected with reviewer', () => {
      expect(isValidStatusTransition('in_review', 'rejected', true)).toBe(true);
    });

    it('allows returning from approved to pending', () => {
      expect(isValidStatusTransition('approved', 'pending', false)).toBe(true);
    });

    it('disallows invalid transitions', () => {
      expect(isValidStatusTransition('approved', 'pending', false)).toBe(true);
      expect(isValidStatusTransition('rejected', 'unknown' as ReviewStatus, false)).toBe(false);
    });
  });

  describe('clearQueue', () => {
    it('removes all items from queue', () => {
      addToQueue({
        type: 'product',
        sourceText: 'Text 1',
        translatedText: 'نص 1',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      addToQueue({
        type: 'product',
        sourceText: 'Text 2',
        translatedText: 'نص 2',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      clearQueue();

      expect(getQueueItems()).toHaveLength(0);
    });
  });

  describe('constants', () => {
    it('exports PRIORITY_WEIGHTS', () => {
      expect(PRIORITY_WEIGHTS.urgent).toBe(4);
      expect(PRIORITY_WEIGHTS.high).toBe(3);
      expect(PRIORITY_WEIGHTS.normal).toBe(2);
      expect(PRIORITY_WEIGHTS.low).toBe(1);
    });

    it('exports VALID_TRANSITIONS', () => {
      expect(VALID_TRANSITIONS).toBeDefined();
      expect(VALID_TRANSITIONS.length).toBeGreaterThan(0);

      const pendingToReview = VALID_TRANSITIONS.find(
        (t) => t.from === 'pending' && t.to === 'in_review'
      );
      expect(pendingToReview?.allowed).toBe(true);
    });
  });

  describe('edge cases and complex scenarios', () => {
    it('handles items with all metadata fields', () => {
      const item = addToQueue({
        type: 'product',
        sourceText: 'Complete product description',
        translatedText: 'وصف المنتج الكامل',
        sourceLocale: 'en',
        targetLocale: 'ar',
        priority: 'high',
        metadata: {
          productId: 'prod_789',
          productTitle: 'Blue Running Shoes',
          shopDomain: 'my-shop.myshopify.com',
          aiConfidence: 0.87,
          glossaryTerms: ['running', 'shoes'],
          previousTranslation: 'وصف قديم',
          tags: ['sports', 'footwear'],
          category: 'athletic',
        },
      });

      expect(item.metadata.productId).toBe('prod_789');
      expect(item.metadata.aiConfidence).toBe(0.87);
      expect(item.metadata.glossaryTerms).toEqual(['running', 'shoes']);
      expect(item.metadata.wordCount).toBe(3);
    });

    it('handles multiple status transitions', () => {
      const item = addToQueue({
        type: 'product',
        sourceText: 'Test',
        translatedText: 'اختبار',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      // pending -> in_review
      updateItemStatus(item.id, 'in_review', { reviewerId: 'r1' });
      expect(getQueueItemById(item.id)?.status).toBe('in_review');

      // in_review -> pending (return for revision)
      updateItemStatus(item.id, 'pending', {});
      expect(getQueueItemById(item.id)?.status).toBe('pending');

      // pending -> in_review (reassign)
      updateItemStatus(item.id, 'in_review', { reviewerId: 'r2' });
      expect(getQueueItemById(item.id)?.status).toBe('in_review');

      // in_review -> approved
      updateItemStatus(item.id, 'approved', { reviewerId: 'r2' });
      expect(getQueueItemById(item.id)?.status).toBe('approved');
    });

    it('handles complex filtering with multiple criteria', () => {
      addToQueue({
        type: 'product',
        sourceText: 'Arabic product',
        translatedText: 'منتج عربي',
        sourceLocale: 'en',
        targetLocale: 'ar',
        priority: 'high',
        metadata: { tags: ['featured'] },
      });

      addToQueue({
        type: 'collection',
        sourceText: 'Hebrew collection',
        translatedText: 'אוסף עברי',
        sourceLocale: 'en',
        targetLocale: 'he',
        priority: 'high',
        metadata: { tags: ['featured'] },
      });

      addToQueue({
        type: 'product',
        sourceText: 'Another Arabic product',
        translatedText: 'منتج عربي آخر',
        sourceLocale: 'en',
        targetLocale: 'ar',
        priority: 'normal',
      });

      const results = getQueueItems({
        targetLocale: 'ar',
        priority: 'high',
      });

      expect(results).toHaveLength(1);
      expect(results[0].sourceText).toBe('Arabic product');
    });

    it('maintains updatedAt timestamp on modifications', () => {
      const item = addToQueue({
        type: 'product',
        sourceText: 'Test',
        translatedText: 'اختبار',
        sourceLocale: 'en',
        targetLocale: 'ar',
      });

      const originalUpdatedAt = item.updatedAt;

      // Small delay then update
      const beforeTime = Date.now();
      assignToReviewer(item.id, 'reviewer_1');
      const updatedItem = getQueueItemById(item.id)!;
      
      expect(updatedItem.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime()
      );
    });

    it('supports all item types', () => {
      const types: Array<QueueItemInput['type']> = [
        'product',
        'collection',
        'page',
        'blog',
        'menu',
        'metafield',
        'theme',
      ];

      types.forEach((type, index) => {
        const item = addToQueue({
          type,
          sourceText: `${type} text`,
          translatedText: `نص ${type}`,
          sourceLocale: 'en',
          targetLocale: 'ar',
        });

        expect(item.type).toBe(type);
      });

      const stats = getQueueStats();
      expect(stats.total).toBe(7);
      expect(stats.byType.product).toBe(1);
      expect(stats.byType.collection).toBe(1);
      expect(stats.byType.page).toBe(1);
      expect(stats.byType.blog).toBe(1);
      expect(stats.byType.menu).toBe(1);
      expect(stats.byType.metafield).toBe(1);
      expect(stats.byType.theme).toBe(1);
    });
  });
});
