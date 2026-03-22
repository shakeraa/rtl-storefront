// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DraftTranslationStatus =
  | "queued"
  | "translating"
  | "preview_ready"
  | "published"
  | "cancelled";

export interface DraftTranslationJob {
  id: string;
  productId: string;
  shop: string;
  status: DraftTranslationStatus;
  sourceLocale: string;
  targetLocales: string[];
  createdAt: Date;
  scheduledPublishAt?: Date;
}

export interface TranslationPreviewEntry {
  locale: string;
  fields: Record<string, string>;
}

export interface DraftAutoSaveOptions {
  delayMs?: number;
}

interface PendingAutoSave {
  timer: ReturnType<typeof setTimeout>;
  previews: TranslationPreviewEntry[];
}

// ---------------------------------------------------------------------------
// In-memory storage
// ---------------------------------------------------------------------------

const jobs = new Map<string, DraftTranslationJob>();

/**
 * Simulated translation previews keyed by job id.
 * In production these would come from the translation engine.
 */
const previews = new Map<string, TranslationPreviewEntry[]>();
const pendingAutoSaves = new Map<string, PendingAutoSave>();

const DEFAULT_AUTO_SAVE_DELAY_MS = 500;

let idCounter = 0;

function generateId(): string {
  idCounter += 1;
  return `draft-job-${Date.now()}-${idCounter}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Queue a draft product for translation into the given target locales.
 */
export function queueDraftTranslation(
  shop: string,
  productId: string,
  targetLocales: string[],
): DraftTranslationJob {
  const job: DraftTranslationJob = {
    id: generateId(),
    productId,
    shop,
    status: "queued",
    sourceLocale: "en",
    targetLocales,
    createdAt: new Date(),
  };
  jobs.set(job.id, job);

  // Generate placeholder preview entries so callers can inspect them
  const previewEntries: TranslationPreviewEntry[] = targetLocales.map(
    (locale) => ({
      locale,
      fields: {
        title: `[${locale}] Draft translation pending`,
        description: `[${locale}] Draft translation pending`,
      },
    }),
  );
  previews.set(job.id, previewEntries);

  return job;
}

/**
 * Schedule a debounced update to a job's translation preview.
 * Repeated saves for the same job collapse into a single write using
 * the latest preview payload.
 */
export function scheduleDraftAutoSave(
  jobId: string,
  nextPreviews: TranslationPreviewEntry[],
  options: DraftAutoSaveOptions = {},
): { scheduled: boolean } {
  const job = jobs.get(jobId);
  if (!job || job.status === "published" || job.status === "cancelled") {
    return { scheduled: false };
  }

  const existing = pendingAutoSaves.get(jobId);
  if (existing) {
    clearTimeout(existing.timer);
  }

  const delayMs = options.delayMs ?? DEFAULT_AUTO_SAVE_DELAY_MS;
  const previewsSnapshot = clonePreviews(nextPreviews);
  const timer = setTimeout(() => {
    applyDraftAutoSave(jobId, previewsSnapshot);
  }, delayMs);

  pendingAutoSaves.set(jobId, {
    timer,
    previews: previewsSnapshot,
  });

  return { scheduled: true };
}

/**
 * Immediately persist the latest pending auto-save for a job.
 */
export function flushDraftAutoSave(jobId: string): boolean {
  const pending = pendingAutoSaves.get(jobId);
  if (!pending) {
    return false;
  }

  clearTimeout(pending.timer);
  applyDraftAutoSave(jobId, pending.previews);
  return true;
}

/**
 * Cancel a pending auto-save for a job.
 */
export function cancelPendingAutoSave(jobId: string): boolean {
  const pending = pendingAutoSaves.get(jobId);
  if (!pending) {
    return false;
  }

  clearTimeout(pending.timer);
  pendingAutoSaves.delete(jobId);
  return true;
}

/**
 * Return all pending (non-terminal) draft translation jobs for a shop.
 */
export function getDraftQueue(shop: string): DraftTranslationJob[] {
  const result: DraftTranslationJob[] = [];
  for (const job of jobs.values()) {
    if (
      job.shop === shop &&
      job.status !== "published" &&
      job.status !== "cancelled"
    ) {
      result.push(job);
    }
  }
  return result.sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );
}

/**
 * Mark a draft translation job as ready to publish.
 */
export function publishTranslatedDraft(
  jobId: string,
): { success: boolean } {
  const job = jobs.get(jobId);
  if (!job) return { success: false };
  if (job.status === "cancelled" || job.status === "published") {
    return { success: false };
  }
  cancelPendingAutoSave(jobId);
  job.status = "published";
  return { success: true };
}

/**
 * Cancel a draft translation job. Returns false if the job does not exist
 * or has already been published.
 */
export function cancelDraft(jobId: string): boolean {
  const job = jobs.get(jobId);
  if (!job) return false;
  if (job.status === "published") return false;
  cancelPendingAutoSave(jobId);
  job.status = "cancelled";
  return true;
}

/**
 * Retrieve the translation preview for a job (one entry per target locale).
 */
export function getTranslationPreview(
  jobId: string,
): TranslationPreviewEntry[] {
  return previews.get(jobId) ?? [];
}

export function clearDraftTranslationStateForTesting(): void {
  for (const pending of pendingAutoSaves.values()) {
    clearTimeout(pending.timer);
  }

  jobs.clear();
  previews.clear();
  pendingAutoSaves.clear();
  idCounter = 0;
}

function applyDraftAutoSave(
  jobId: string,
  nextPreviews: TranslationPreviewEntry[],
): void {
  const job = jobs.get(jobId);
  pendingAutoSaves.delete(jobId);

  if (!job || job.status === "published" || job.status === "cancelled") {
    return;
  }

  previews.set(jobId, clonePreviews(nextPreviews));
  if (job.status === "queued" || job.status === "translating") {
    job.status = "preview_ready";
  }
}

function clonePreviews(
  entries: TranslationPreviewEntry[],
): TranslationPreviewEntry[] {
  return entries.map((entry) => ({
    locale: entry.locale,
    fields: { ...entry.fields },
  }));
}
