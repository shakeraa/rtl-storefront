// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BulkJobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export interface BulkJobProgress {
  total: number;
  completed: number;
  failed: number;
}

export interface BulkJob {
  id: string;
  shop: string;
  resourceIds: string[];
  resourceType: string;
  targetLocales: string[];
  status: BulkJobStatus;
  progress: BulkJobProgress;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// In-memory storage
// ---------------------------------------------------------------------------

const bulkJobs = new Map<string, BulkJob>();
let idCounter = 0;

function generateId(): string {
  idCounter += 1;
  return `bulk-${Date.now()}-${idCounter}`;
}

// ---------------------------------------------------------------------------
// Default processing-rate constants
// ---------------------------------------------------------------------------

const DEFAULT_ITEMS_PER_MINUTE = 12;
const DEFAULT_AVG_COST_PER_ITEM = 0.02; // USD

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a new bulk translation job.
 */
export function createBulkJob(
  shop: string,
  resourceType: string,
  resourceIds: string[],
  targetLocales: string[],
): BulkJob {
  const job: BulkJob = {
    id: generateId(),
    shop,
    resourceIds,
    resourceType,
    targetLocales,
    status: "pending",
    progress: {
      total: resourceIds.length * targetLocales.length,
      completed: 0,
      failed: 0,
    },
    createdAt: new Date(),
  };
  bulkJobs.set(job.id, job);
  return job;
}

/**
 * Retrieve a bulk job by id, or null if not found.
 */
export function getBulkJob(id: string): BulkJob | null {
  return bulkJobs.get(id) ?? null;
}

/**
 * Update the progress counters for a running bulk job.
 */
export function updateProgress(
  id: string,
  completed: number,
  failed: number,
): void {
  const job = bulkJobs.get(id);
  if (!job) return;

  job.progress.completed = completed;
  job.progress.failed = failed;

  // Auto-transition status
  if (job.status === "pending") {
    job.status = "processing";
  }

  const processed = completed + failed;
  if (processed >= job.progress.total) {
    job.status = failed === job.progress.total ? "failed" : "completed";
  }
}

/**
 * Return all bulk jobs belonging to a shop, sorted newest-first.
 */
export function getBulkJobsByShop(shop: string): BulkJob[] {
  const result: BulkJob[] = [];
  for (const job of bulkJobs.values()) {
    if (job.shop === shop) {
      result.push(job);
    }
  }
  return result.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

/**
 * Cancel a bulk job. Returns false if the job does not exist or is already
 * in a terminal state.
 */
export function cancelBulkJob(id: string): boolean {
  const job = bulkJobs.get(id);
  if (!job) return false;
  if (job.status === "completed" || job.status === "failed" || job.status === "cancelled") {
    return false;
  }
  job.status = "cancelled";
  return true;
}

/**
 * Estimate the time and cost for a bulk translation run.
 */
export function estimateTime(
  resourceCount: number,
  targetLocaleCount: number,
): { estimatedMinutes: number; estimatedCost: number } {
  const totalItems = resourceCount * targetLocaleCount;
  const estimatedMinutes = Math.ceil(totalItems / DEFAULT_ITEMS_PER_MINUTE);
  const estimatedCost =
    Math.round(totalItems * DEFAULT_AVG_COST_PER_ITEM * 100) / 100;
  return { estimatedMinutes, estimatedCost };
}

/**
 * Return default processing-rate metrics.
 */
export function getProcessingRate(): {
  itemsPerMinute: number;
  avgCostPerItem: number;
} {
  return {
    itemsPerMinute: DEFAULT_ITEMS_PER_MINUTE,
    avgCostPerItem: DEFAULT_AVG_COST_PER_ITEM,
  };
}
