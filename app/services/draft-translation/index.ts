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

// ---------------------------------------------------------------------------
// In-memory storage
// ---------------------------------------------------------------------------

const jobs = new Map<string, DraftTranslationJob>();

/**
 * Simulated translation previews keyed by job id.
 * In production these would come from the translation engine.
 */
const previews = new Map<string, TranslationPreviewEntry[]>();

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
