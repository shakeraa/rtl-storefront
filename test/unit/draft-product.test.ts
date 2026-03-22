import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createDraft,
  saveDraft,
  getDraft,
  publishDraft,
  listDrafts,
  scheduleAutoSave,
  flushAutoSave,
  cancelPendingAutoSave,
  discardDraft,
  approveDraft,
  getDraftVersion,
  restoreVersion,
  listVersions,
  compareVersions,
  listAllDrafts,
  getDraftsByStatus,
  getDraftStats,
  clearDraftStateForTesting,
  type DraftContent,
} from '../../app/services/draft-translation/product';

describe('Draft Product Translation Service (T0079)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearDraftStateForTesting();
  });

  // ==========================================================================
  // createDraft tests
  // ==========================================================================
  describe('createDraft', () => {
    it('should create a new draft with default values', () => {
      const draft = createDraft('product-1', 'ar');

      expect(draft.id).toBeDefined();
      expect(draft.productId).toBe('product-1');
      expect(draft.locale).toBe('ar');
      expect(draft.status).toBe('draft');
      expect(draft.content).toEqual({});
      expect(draft.versions).toEqual([]);
      expect(draft.shop).toBe('default');
    });

    it('should create a draft with initial content', () => {
      const content: DraftContent = {
        title: 'Test Product',
        description: 'Test Description',
        tags: ['tag1', 'tag2'],
      };

      const draft = createDraft('product-1', 'ar', { initialContent: content });

      expect(draft.content.title).toBe('Test Product');
      expect(draft.content.description).toBe('Test Description');
      expect(draft.content.tags).toEqual(['tag1', 'tag2']);
    });

    it('should create a draft with custom shop', () => {
      const draft = createDraft('product-1', 'ar', { shop: 'my-shop' });

      expect(draft.shop).toBe('my-shop');
    });

    it('should create unique draft IDs', () => {
      const draft1 = createDraft('product-1', 'ar');
      const draft2 = createDraft('product-1', 'ar');

      expect(draft1.id).not.toBe(draft2.id);
    });

    it('should set createdAt and updatedAt timestamps', () => {
      const before = new Date();
      const draft = createDraft('product-1', 'ar');
      const after = new Date();

      expect(draft.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(draft.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(draft.updatedAt.getTime()).toBe(draft.createdAt.getTime());
    });
  });

  // ==========================================================================
  // saveDraft tests
  // ==========================================================================
  describe('saveDraft', () => {
    it('should save draft content and create a version', () => {
      const draft = createDraft('product-1', 'ar');
      const content: DraftContent = {
        title: 'Arabic Title',
        description: 'Arabic Description',
      };

      const result = saveDraft(draft.id, content);

      expect(result.success).toBe(true);
      expect(result.draft!.content.title).toBe('Arabic Title');
      expect(result.draft!.status).toBe('ready_for_review');
      expect(result.draft!.versions.length).toBe(1);
      expect(result.draft!.versions[0].autoSave).toBe(false);
    });

    it('should update status from draft to ready_for_review', () => {
      const draft = createDraft('product-1', 'ar');
      expect(draft.status).toBe('draft');

      saveDraft(draft.id, { title: 'Title' });
      const updated = getDraft(draft.id);

      expect(updated!.status).toBe('ready_for_review');
    });

    it('should update status from auto_saved to ready_for_review', () => {
      const draft = createDraft('product-1', 'ar');
      scheduleAutoSave(draft.id, { title: 'Auto' }, { delayMs: 100 });
      vi.advanceTimersByTime(100);

      saveDraft(draft.id, { title: 'Manual' });
      const updated = getDraft(draft.id);

      expect(updated!.status).toBe('ready_for_review');
    });

    it('should fail to save non-existent draft', () => {
      const result = saveDraft('non-existent', { title: 'Title' });
      expect(result.success).toBe(false);
    });

    it('should fail to save published draft', () => {
      const draft = createDraft('product-1', 'ar');
      saveDraft(draft.id, { title: 'Title' });
      publishDraft(draft.id);

      const result = saveDraft(draft.id, { title: 'New Title' });
      expect(result.success).toBe(false);
    });

    it('should fail to save discarded draft', () => {
      const draft = createDraft('product-1', 'ar');
      discardDraft(draft.id);

      const result = saveDraft(draft.id, { title: 'Title' });
      expect(result.success).toBe(false);
    });

    it('should create multiple versions on successive saves', () => {
      const draft = createDraft('product-1', 'ar');

      saveDraft(draft.id, { title: 'Version 1' });
      saveDraft(draft.id, { title: 'Version 2' });
      saveDraft(draft.id, { title: 'Version 3' });

      const updated = getDraft(draft.id);
      expect(updated!.versions.length).toBe(3);
      expect(updated!.versions[0].versionNumber).toBe(1);
      expect(updated!.versions[2].versionNumber).toBe(3);
    });

    it('should cancel pending auto-save on manual save', () => {
      const draft = createDraft('product-1', 'ar');
      scheduleAutoSave(draft.id, { title: 'Auto' }, { delayMs: 500 });

      saveDraft(draft.id, { title: 'Manual' });
      vi.advanceTimersByTime(500);

      const updated = getDraft(draft.id);
      expect(updated!.content.title).toBe('Manual');
    });
  });

  // ==========================================================================
  // getDraft tests
  // ==========================================================================
  describe('getDraft', () => {
    it('should retrieve existing draft', () => {
      const draft = createDraft('product-1', 'ar');
      const retrieved = getDraft(draft.id);

      expect(retrieved).toBeDefined();
      expect(retrieved!.id).toBe(draft.id);
    });

    it('should return undefined for non-existent draft', () => {
      const retrieved = getDraft('non-existent');
      expect(retrieved).toBeUndefined();
    });

    it('should return undefined for discarded draft', () => {
      const draft = createDraft('product-1', 'ar');
      discardDraft(draft.id);

      const retrieved = getDraft(draft.id);
      expect(retrieved).toBeUndefined();
    });

    it('should return published draft', () => {
      const draft = createDraft('product-1', 'ar');
      saveDraft(draft.id, { title: 'Title' });
      publishDraft(draft.id);

      const retrieved = getDraft(draft.id);
      expect(retrieved).toBeDefined();
      expect(retrieved!.status).toBe('published');
    });
  });

  // ==========================================================================
  // publishDraft tests
  // ==========================================================================
  describe('publishDraft', () => {
    it('should publish a ready_for_review draft', () => {
      const draft = createDraft('product-1', 'ar');
      saveDraft(draft.id, { title: 'Title' });

      const result = publishDraft(draft.id);

      expect(result.success).toBe(true);
      expect(result.draft!.status).toBe('published');
      expect(result.draft!.publishedAt).toBeDefined();
    });

    it('should publish an approved draft', () => {
      const draft = createDraft('product-1', 'ar');
      saveDraft(draft.id, { title: 'Title' });
      approveDraft(draft.id, 'user-1');

      const result = publishDraft(draft.id);

      expect(result.success).toBe(true);
      expect(result.draft!.status).toBe('published');
    });

    it('should flush pending auto-save before publishing', () => {
      const draft = createDraft('product-1', 'ar');
      saveDraft(draft.id, { title: 'Original' });
      scheduleAutoSave(draft.id, { title: 'Auto Updated' }, { delayMs: 5000 });

      publishDraft(draft.id);

      const updated = getDraft(draft.id);
      expect(updated!.content.title).toBe('Auto Updated');
    });

    it('should fail to publish non-existent draft', () => {
      const result = publishDraft('non-existent');
      expect(result.success).toBe(false);
    });

    it('should fail to publish already published draft', () => {
      const draft = createDraft('product-1', 'ar');
      saveDraft(draft.id, { title: 'Title' });
      publishDraft(draft.id);

      const result = publishDraft(draft.id);
      expect(result.success).toBe(false);
    });

    it('should fail to publish discarded draft', () => {
      const draft = createDraft('product-1', 'ar');
      saveDraft(draft.id, { title: 'Title' });
      discardDraft(draft.id);

      const result = publishDraft(draft.id);
      expect(result.success).toBe(false);
    });

    it('should fail to publish draft without review', () => {
      const draft = createDraft('product-1', 'ar');
      // Don't save - stays in 'draft' status

      const result = publishDraft(draft.id);
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // listDrafts tests
  // ==========================================================================
  describe('listDrafts', () => {
    it('should list drafts for a product', () => {
      const draft1 = createDraft('product-1', 'ar');
      const draft2 = createDraft('product-1', 'he');
      createDraft('product-2', 'ar');

      const drafts = listDrafts('product-1');

      expect(drafts.length).toBe(2);
      expect(drafts.map((d) => d.id)).toContain(draft1.id);
      expect(drafts.map((d) => d.id)).toContain(draft2.id);
    });

    it('should filter by status', () => {
      const draft = createDraft('product-1', 'ar');
      saveDraft(draft.id, { title: 'Title' });
      createDraft('product-1', 'he');

      const readyDrafts = listDrafts('product-1', { status: 'ready_for_review' });
      const draftStatus = listDrafts('product-1', { status: 'draft' });

      expect(readyDrafts.length).toBe(1);
      expect(readyDrafts[0].id).toBe(draft.id);
      expect(draftStatus.length).toBe(1);
    });

    it('should filter by locale', () => {
      createDraft('product-1', 'ar');
      createDraft('product-1', 'he');
      createDraft('product-1', 'fr');

      const arabicDrafts = listDrafts('product-1', { locale: 'ar' });

      expect(arabicDrafts.length).toBe(1);
      expect(arabicDrafts[0].locale).toBe('ar');
    });

    it('should exclude discarded drafts by default', () => {
      const draft = createDraft('product-1', 'ar');
      discardDraft(draft.id);

      const drafts = listDrafts('product-1');
      expect(drafts.length).toBe(0);
    });

    it('should include discarded drafts when requested', () => {
      const draft = createDraft('product-1', 'ar');
      discardDraft(draft.id);

      const drafts = listDrafts('product-1', { includeDiscarded: true });
      expect(drafts.length).toBe(1);
    });

    it('should sort drafts by updatedAt descending', () => {
      const draft1 = createDraft('product-1', 'ar');
      vi.advanceTimersByTime(1000);
      const draft2 = createDraft('product-1', 'he');

      const drafts = listDrafts('product-1');

      expect(drafts[0].id).toBe(draft2.id);
      expect(drafts[1].id).toBe(draft1.id);
    });

    it('should return empty array for product with no drafts', () => {
      const drafts = listDrafts('non-existent');
      expect(drafts).toEqual([]);
    });
  });

  // ==========================================================================
  // Auto-save tests
  // ==========================================================================
  describe('scheduleAutoSave', () => {
    it('should schedule auto-save with debouncing', () => {
      const draft = createDraft('product-1', 'ar');

      scheduleAutoSave(draft.id, { title: 'First' }, { delayMs: 500 });
      scheduleAutoSave(draft.id, { title: 'Second' }, { delayMs: 500 });
      scheduleAutoSave(draft.id, { title: 'Third' }, { delayMs: 500 });

      vi.advanceTimersByTime(500);

      const updated = getDraft(draft.id);
      expect(updated!.content.title).toBe('Third');
      expect(updated!.status).toBe('auto_saved');
    });

    it('should create auto-save version', () => {
      const draft = createDraft('product-1', 'ar');

      scheduleAutoSave(draft.id, { title: 'Auto' }, { delayMs: 100 });
      vi.advanceTimersByTime(100);

      const updated = getDraft(draft.id);
      expect(updated!.versions.length).toBe(1);
      expect(updated!.versions[0].autoSave).toBe(true);
    });

    it('should fail for non-existent draft', () => {
      const result = scheduleAutoSave('non-existent', { title: 'Title' });
      expect(result.scheduled).toBe(false);
    });

    it('should fail for published draft', () => {
      const draft = createDraft('product-1', 'ar');
      saveDraft(draft.id, { title: 'Title' });
      publishDraft(draft.id);

      const result = scheduleAutoSave(draft.id, { title: 'New' });
      expect(result.scheduled).toBe(false);
    });

    it('should fail for discarded draft', () => {
      const draft = createDraft('product-1', 'ar');
      discardDraft(draft.id);

      const result = scheduleAutoSave(draft.id, { title: 'New' });
      expect(result.scheduled).toBe(false);
    });

    it('should use default delay when not specified', () => {
      const draft = createDraft('product-1', 'ar');

      scheduleAutoSave(draft.id, { title: 'Auto' });
      expect(getDraft(draft.id)!.content.title).toBeUndefined();

      vi.advanceTimersByTime(999);
      expect(getDraft(draft.id)!.content.title).toBeUndefined();

      vi.advanceTimersByTime(1);
      expect(getDraft(draft.id)!.content.title).toBe('Auto');
    });
  });

  describe('flushAutoSave', () => {
    it('should immediately flush pending auto-save', () => {
      const draft = createDraft('product-1', 'ar');

      scheduleAutoSave(draft.id, { title: 'Flushed' }, { delayMs: 5000 });
      const flushed = flushAutoSave(draft.id);

      expect(flushed).toBe(true);
      expect(getDraft(draft.id)!.content.title).toBe('Flushed');
    });

    it('should return false when no pending auto-save', () => {
      const draft = createDraft('product-1', 'ar');
      const flushed = flushAutoSave(draft.id);

      expect(flushed).toBe(false);
    });

    it('should clear pending auto-save after flush', () => {
      const draft = createDraft('product-1', 'ar');

      scheduleAutoSave(draft.id, { title: 'Auto' }, { delayMs: 500 });
      flushAutoSave(draft.id);

      vi.advanceTimersByTime(500);

      // Should not double-apply
      const updated = getDraft(draft.id);
      expect(updated!.versions.length).toBe(1);
    });
  });

  describe('cancelPendingAutoSave', () => {
    it('should cancel pending auto-save', () => {
      const draft = createDraft('product-1', 'ar');

      scheduleAutoSave(draft.id, { title: 'Cancelled' }, { delayMs: 500 });
      const cancelled = cancelPendingAutoSave(draft.id);

      expect(cancelled).toBe(true);

      vi.advanceTimersByTime(500);

      expect(getDraft(draft.id)!.content.title).toBeUndefined();
    });

    it('should return false when no pending auto-save', () => {
      const draft = createDraft('product-1', 'ar');
      const cancelled = cancelPendingAutoSave(draft.id);

      expect(cancelled).toBe(false);
    });
  });

  // ==========================================================================
  // discardDraft tests
  // ==========================================================================
  describe('discardDraft', () => {
    it('should discard a draft', () => {
      const draft = createDraft('product-1', 'ar');
      const discarded = discardDraft(draft.id);

      expect(discarded).toBe(true);
      expect(getDraft(draft.id)).toBeUndefined();
    });

    it('should cancel pending auto-save on discard', () => {
      const draft = createDraft('product-1', 'ar');

      scheduleAutoSave(draft.id, { title: 'Auto' }, { delayMs: 500 });
      discardDraft(draft.id);

      vi.advanceTimersByTime(500);

      // Should not have saved
      const updated = getDraft(draft.id);
      expect(updated).toBeUndefined();
    });

    it('should fail to discard non-existent draft', () => {
      const discarded = discardDraft('non-existent');
      expect(discarded).toBe(false);
    });

    it('should fail to discard published draft', () => {
      const draft = createDraft('product-1', 'ar');
      saveDraft(draft.id, { title: 'Title' });
      publishDraft(draft.id);

      const discarded = discardDraft(draft.id);
      expect(discarded).toBe(false);
    });
  });

  // ==========================================================================
  // approveDraft tests
  // ==========================================================================
  describe('approveDraft', () => {
    it('should approve a ready_for_review draft', () => {
      const draft = createDraft('product-1', 'ar');
      saveDraft(draft.id, { title: 'Title' });

      const result = approveDraft(draft.id, 'user-1');

      expect(result.success).toBe(true);
      expect(result.draft!.status).toBe('approved');
      expect(result.draft!.approvedBy).toBe('user-1');
      expect(result.draft!.approvedAt).toBeDefined();
    });

    it('should approve an auto_saved draft', () => {
      const draft = createDraft('product-1', 'ar');
      scheduleAutoSave(draft.id, { title: 'Auto' }, { delayMs: 100 });
      vi.advanceTimersByTime(100);

      const result = approveDraft(draft.id, 'user-1');

      expect(result.success).toBe(true);
      expect(result.draft!.status).toBe('approved');
    });

    it('should flush pending auto-save before approval', () => {
      const draft = createDraft('product-1', 'ar');
      scheduleAutoSave(draft.id, { title: 'Auto' }, { delayMs: 5000 });

      approveDraft(draft.id, 'user-1');

      expect(getDraft(draft.id)!.content.title).toBe('Auto');
    });

    it('should fail for non-existent draft', () => {
      const result = approveDraft('non-existent', 'user-1');
      expect(result.success).toBe(false);
    });

    it('should fail for published draft', () => {
      const draft = createDraft('product-1', 'ar');
      saveDraft(draft.id, { title: 'Title' });
      publishDraft(draft.id);

      const result = approveDraft(draft.id, 'user-1');
      expect(result.success).toBe(false);
    });

    it('should fail for discarded draft', () => {
      const draft = createDraft('product-1', 'ar');
      discardDraft(draft.id);

      const result = approveDraft(draft.id, 'user-1');
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // Versioning tests
  // ==========================================================================
  describe('Version Management', () => {
    describe('getDraftVersion', () => {
      it('should get specific version', () => {
        const draft = createDraft('product-1', 'ar');
        saveDraft(draft.id, { title: 'V1' });
        saveDraft(draft.id, { title: 'V2' });

        const version = getDraftVersion(draft.id, 1);

        expect(version).toBeDefined();
        expect(version!.versionNumber).toBe(1);
        expect(version!.content.title).toBe('V1');
      });

      it('should return undefined for non-existent version', () => {
        const draft = createDraft('product-1', 'ar');
        saveDraft(draft.id, { title: 'V1' });

        const version = getDraftVersion(draft.id, 999);
        expect(version).toBeUndefined();
      });

      it('should return undefined for non-existent draft', () => {
        const version = getDraftVersion('non-existent', 1);
        expect(version).toBeUndefined();
      });
    });

    describe('restoreVersion', () => {
      it('should restore to specific version', () => {
        const draft = createDraft('product-1', 'ar');
        saveDraft(draft.id, { title: 'Original' });
        saveDraft(draft.id, { title: 'Changed' });

        const result = restoreVersion(draft.id, 1);

        expect(result.success).toBe(true);
        expect(result.draft!.content.title).toBe('Original');
      });

      it('should create new version on restore', () => {
        const draft = createDraft('product-1', 'ar');
        saveDraft(draft.id, { title: 'V1' });
        saveDraft(draft.id, { title: 'V2' });

        restoreVersion(draft.id, 1);

        const updated = getDraft(draft.id);
        expect(updated!.versions.length).toBe(3);
      });

      it('should fail for non-existent draft', () => {
        const result = restoreVersion('non-existent', 1);
        expect(result.success).toBe(false);
      });

      it('should fail for non-existent version', () => {
        const draft = createDraft('product-1', 'ar');
        saveDraft(draft.id, { title: 'V1' });

        const result = restoreVersion(draft.id, 999);
        expect(result.success).toBe(false);
      });

      it('should fail for published draft', () => {
        const draft = createDraft('product-1', 'ar');
        saveDraft(draft.id, { title: 'V1' });
        saveDraft(draft.id, { title: 'V2' });
        publishDraft(draft.id);

        const result = restoreVersion(draft.id, 1);
        expect(result.success).toBe(false);
      });
    });

    describe('listVersions', () => {
      it('should list all versions sorted', () => {
        const draft = createDraft('product-1', 'ar');
        saveDraft(draft.id, { title: 'V1' });
        saveDraft(draft.id, { title: 'V2' });
        saveDraft(draft.id, { title: 'V3' });

        const versions = listVersions(draft.id);

        expect(versions.length).toBe(3);
        expect(versions[0].versionNumber).toBe(1);
        expect(versions[2].versionNumber).toBe(3);
      });

      it('should return empty array for non-existent draft', () => {
        const versions = listVersions('non-existent');
        expect(versions).toEqual([]);
      });
    });

    describe('compareVersions', () => {
      it('should compare two versions', () => {
        const draft = createDraft('product-1', 'ar');
        saveDraft(draft.id, { title: 'First', description: 'Desc' });
        saveDraft(draft.id, { title: 'Second', description: 'Desc' });

        const result = compareVersions(draft.id, 1, 2);

        expect(result.success).toBe(true);
        expect(result.differences).toHaveLength(1);
        expect(result.differences![0].field).toBe('title');
      });

      it('should return empty differences for identical versions', () => {
        const draft = createDraft('product-1', 'ar');
        saveDraft(draft.id, { title: 'Same' });
        saveDraft(draft.id, { title: 'Same' });

        const result = compareVersions(draft.id, 1, 2);

        expect(result.success).toBe(true);
        expect(result.differences).toEqual([]);
      });

      it('should fail for non-existent draft', () => {
        const result = compareVersions('non-existent', 1, 2);
        expect(result.success).toBe(false);
      });

      it('should fail for non-existent version', () => {
        const draft = createDraft('product-1', 'ar');
        saveDraft(draft.id, { title: 'V1' });

        const result = compareVersions(draft.id, 1, 999);
        expect(result.success).toBe(false);
      });
    });
  });

  // ==========================================================================
  // listAllDrafts tests
  // ==========================================================================
  describe('listAllDrafts', () => {
    it('should list all drafts for a shop', () => {
      createDraft('product-1', 'ar', { shop: 'shop-a' });
      createDraft('product-2', 'ar', { shop: 'shop-a' });
      createDraft('product-3', 'ar', { shop: 'shop-b' });

      const drafts = listAllDrafts('shop-a');

      expect(drafts.length).toBe(2);
    });

    it('should filter by status', () => {
      const draft = createDraft('product-1', 'ar', { shop: 'shop-a' });
      saveDraft(draft.id, { title: 'Title' });
      createDraft('product-2', 'ar', { shop: 'shop-a' });

      const readyDrafts = listAllDrafts('shop-a', { status: 'ready_for_review' });

      expect(readyDrafts.length).toBe(1);
      expect(readyDrafts[0].id).toBe(draft.id);
    });

    it('should exclude discarded by default', () => {
      const draft = createDraft('product-1', 'ar', { shop: 'shop-a' });
      discardDraft(draft.id);

      const drafts = listAllDrafts('shop-a');
      expect(drafts.length).toBe(0);
    });

    it('should include discarded when requested', () => {
      const draft = createDraft('product-1', 'ar', { shop: 'shop-a' });
      discardDraft(draft.id);

      const drafts = listAllDrafts('shop-a', { includeDiscarded: true });
      expect(drafts.length).toBe(1);
    });
  });

  // ==========================================================================
  // getDraftsByStatus tests
  // ==========================================================================
  describe('getDraftsByStatus', () => {
    it('should get drafts by status', () => {
      const draft1 = createDraft('product-1', 'ar');
      saveDraft(draft1.id, { title: 'Title' });
      const draft2 = createDraft('product-2', 'ar');
      saveDraft(draft2.id, { title: 'Title' });
      createDraft('product-3', 'ar');

      const readyDrafts = getDraftsByStatus('ready_for_review');

      expect(readyDrafts.length).toBe(2);
    });

    it('should return empty array when no drafts match', () => {
      createDraft('product-1', 'ar');

      const published = getDraftsByStatus('published');
      expect(published).toEqual([]);
    });
  });

  // ==========================================================================
  // getDraftStats tests
  // ==========================================================================
  describe('getDraftStats', () => {
    it('should return stats for product drafts', () => {
      const draft1 = createDraft('product-1', 'ar');
      saveDraft(draft1.id, { title: 'Title' });
      createDraft('product-1', 'he');
      createDraft('product-1', 'fr');
      discardDraft(createDraft('product-1', 'de').id);

      const stats = getDraftStats('product-1');

      expect(stats.totalDrafts).toBe(4);
      expect(stats.byStatus.ready_for_review).toBe(1);
      expect(stats.byStatus.draft).toBe(2);
      expect(stats.byStatus.discarded).toBe(1);
      expect(stats.byLocale.ar).toBe(1);
      expect(stats.byLocale.he).toBe(1);
      expect(stats.byLocale.fr).toBe(1);
      expect(stats.byLocale.de).toBe(1);
    });

    it('should return zero stats for product with no drafts', () => {
      const stats = getDraftStats('non-existent');

      expect(stats.totalDrafts).toBe(0);
      expect(stats.byStatus.draft).toBe(0);
    });
  });

  // ==========================================================================
  // Content cloning tests
  // ==========================================================================
  describe('Content Handling', () => {
    it('should clone content to avoid mutations', () => {
      const draft = createDraft('product-1', 'ar');
      const content: DraftContent = {
        title: 'Title',
        tags: ['tag1', 'tag2'],
        variantTitles: { v1: 'Variant 1' },
        customFields: { field1: 'value1' },
      };

      saveDraft(draft.id, content);

      // Mutate original
      content.title = 'Mutated';
      content.tags!.push('tag3');
      content.variantTitles!.v1 = 'Mutated';
      content.customFields!.field1 = 'mutated';

      const updated = getDraft(draft.id);
      expect(updated!.content.title).toBe('Title');
      expect(updated!.content.tags).toEqual(['tag1', 'tag2']);
      expect(updated!.content.variantTitles).toEqual({ v1: 'Variant 1' });
      expect(updated!.content.customFields).toEqual({ field1: 'value1' });
    });

    it('should preserve all content fields', () => {
      const draft = createDraft('product-1', 'ar');
      const content: DraftContent = {
        title: 'Title',
        description: 'Description',
        metaTitle: 'Meta Title',
        metaDescription: 'Meta Description',
        handle: 'product-handle',
        productType: 'Type',
        vendor: 'Vendor',
        tags: ['tag1'],
        variantTitles: { v1: 'Variant' },
        customFields: { custom: 'value' },
      };

      saveDraft(draft.id, content);

      const updated = getDraft(draft.id);
      expect(updated!.content).toEqual(content);
    });
  });

  // ==========================================================================
  // Workflow tests
  // ==========================================================================
  describe('Translation Workflow', () => {
    it('should complete full workflow: create -> auto-save -> save -> approve -> publish', () => {
      // Create draft
      const draft = createDraft('product-1', 'ar', { shop: 'my-shop' });
      expect(draft.status).toBe('draft');

      // Auto-save
      scheduleAutoSave(draft.id, { title: 'Auto Title' }, { delayMs: 100 });
      vi.advanceTimersByTime(100);
      expect(getDraft(draft.id)!.status).toBe('auto_saved');

      // Manual save
      saveDraft(draft.id, { title: 'Final Title', description: 'Description' });
      expect(getDraft(draft.id)!.status).toBe('ready_for_review');

      // Approve
      approveDraft(draft.id, 'translator-1');
      expect(getDraft(draft.id)!.status).toBe('approved');
      expect(getDraft(draft.id)!.approvedBy).toBe('translator-1');

      // Publish
      publishDraft(draft.id);
      expect(getDraft(draft.id)!.status).toBe('published');
      expect(getDraft(draft.id)!.publishedAt).toBeDefined();
    });

    it('should handle multiple locales for same product', () => {
      const arDraft = createDraft('product-1', 'ar');
      const heDraft = createDraft('product-1', 'he');
      const frDraft = createDraft('product-1', 'fr');

      saveDraft(arDraft.id, { title: 'Arabic' });
      saveDraft(heDraft.id, { title: 'Hebrew' });
      saveDraft(frDraft.id, { title: 'French' });

      const allDrafts = listDrafts('product-1');
      expect(allDrafts.length).toBe(3);

      const locales = allDrafts.map((d) => d.locale).sort();
      expect(locales).toEqual(['ar', 'fr', 'he']);
    });

    it('should track version history through workflow', () => {
      const draft = createDraft('product-1', 'ar');

      // Initial auto-save
      scheduleAutoSave(draft.id, { title: 'Draft 1' }, { delayMs: 100 });
      vi.advanceTimersByTime(100);

      // Manual save
      saveDraft(draft.id, { title: 'Draft 2' });

      // Another auto-save
      scheduleAutoSave(draft.id, { title: 'Draft 3' }, { delayMs: 100 });
      vi.advanceTimersByTime(100);

      // Final manual save
      saveDraft(draft.id, { title: 'Final' });

      const versions = listVersions(draft.id);
      expect(versions.length).toBe(4);
      expect(versions[0].autoSave).toBe(true);
      expect(versions[1].autoSave).toBe(false);
      expect(versions[2].autoSave).toBe(true);
      expect(versions[3].autoSave).toBe(false);
    });
  });
});
