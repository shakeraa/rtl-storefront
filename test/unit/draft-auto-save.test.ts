import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cancelDraft,
  clearDraftTranslationStateForTesting,
  flushDraftAutoSave,
  getDraftQueue,
  getTranslationPreview,
  queueDraftTranslation,
  scheduleDraftAutoSave,
} from '../../app/services/draft-translation';

describe('draft auto-save', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearDraftTranslationStateForTesting();
  });

  it('debounces repeated auto-save requests for the same draft', () => {
    const job = queueDraftTranslation('shop-a', 'product-1', ['ar']);

    scheduleDraftAutoSave(
      job.id,
      [{ locale: 'ar', fields: { title: 'draft one' } }],
      { delayMs: 500 },
    );
    scheduleDraftAutoSave(
      job.id,
      [{ locale: 'ar', fields: { title: 'draft two' } }],
      { delayMs: 500 },
    );

    vi.advanceTimersByTime(499);
    expect(getTranslationPreview(job.id)[0]?.fields.title).toBe(
      '[ar] Draft translation pending',
    );

    vi.advanceTimersByTime(1);

    expect(getTranslationPreview(job.id)).toEqual([
      { locale: 'ar', fields: { title: 'draft two' } },
    ]);
    expect(getDraftQueue('shop-a')[0]?.status).toBe('preview_ready');
  });

  it('flushes a pending auto-save immediately', () => {
    const job = queueDraftTranslation('shop-a', 'product-1', ['ar']);

    scheduleDraftAutoSave(
      job.id,
      [{ locale: 'ar', fields: { title: 'flush me' } }],
      { delayMs: 5_000 },
    );

    expect(flushDraftAutoSave(job.id)).toBe(true);
    expect(getTranslationPreview(job.id)).toEqual([
      { locale: 'ar', fields: { title: 'flush me' } },
    ]);
  });

  it('does not persist auto-saves for cancelled drafts', () => {
    const job = queueDraftTranslation('shop-a', 'product-1', ['ar']);

    scheduleDraftAutoSave(
      job.id,
      [{ locale: 'ar', fields: { title: 'should not save' } }],
      { delayMs: 500 },
    );
    expect(cancelDraft(job.id)).toBe(true);

    vi.advanceTimersByTime(500);

    expect(getTranslationPreview(job.id)[0]?.fields.title).toBe(
      '[ar] Draft translation pending',
    );
  });
});
