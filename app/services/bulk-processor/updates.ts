/**
 * Bulk Update Processing Service
 * T0080: Automation - Bulk Update Queue Processing
 *
 * Features:
 * - Queue-based processing for bulk translation updates
 * - Progress tracking with detailed status
 * - Error handling with partial success support
 * - Pause/resume capability
 * - Retry mechanism for failed items
 */

import type { TranslationResult } from "../translation/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BulkUpdateStatus =
  | "pending"
  | "queued"
  | "processing"
  | "paused"
  | "completed"
  | "failed"
  | "partial"
  | "cancelled";

export type BulkItemStatus =
  | "pending"
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "retrying";

export interface BulkUpdateItem {
  id: string;
  resourceId: string;
  resourceType: string;
  field: string;
  sourceText: string;
  sourceLocale: string;
  targetLocale: string;
  status: BulkItemStatus;
  result?: TranslationResult;
  error?: string;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface BulkUpdateJob {
  id: string;
  shop: string;
  name: string;
  status: BulkUpdateStatus;
  items: BulkUpdateItem[];
  progress: BulkUpdateProgress;
  settings: BulkUpdateSettings;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  pausedAt?: Date;
  resumedAt?: Date;
}

export interface BulkUpdateProgress {
  total: number;
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  retried: number;
  percentage: number;
  estimatedTimeRemaining?: number; // in seconds
  averageProcessingTime?: number; // in ms per item
}

export interface BulkUpdateSettings {
  batchSize: number;
  concurrency: number;
  maxRetries: number;
  retryDelay: number; // in ms
  priority: number; // 1-10, higher = more priority
  autoRetry: boolean;
  pauseOnError: boolean;
}

export interface BulkUpdateResult {
  jobId: string;
  status: BulkUpdateStatus;
  progress: BulkUpdateProgress;
  results: BulkUpdateItemResult[];
  errors: BulkUpdateError[];
  summary: BulkUpdateSummary;
}

export interface BulkUpdateItemResult {
  itemId: string;
  resourceId: string;
  resourceType: string;
  field: string;
  success: boolean;
  translatedText?: string;
  error?: string;
  processingTime: number; // in ms
}

export interface BulkUpdateError {
  itemId: string;
  resourceId: string;
  field: string;
  error: string;
  code: string;
  retryable: boolean;
  timestamp: Date;
}

export interface BulkUpdateSummary {
  totalItems: number;
  successful: number;
  failed: number;
  retried: number;
  totalProcessingTime: number;
  averageItemTime: number;
  startedAt?: Date;
  completedAt?: Date;
}

export interface QueueBulkUpdateInput {
  shop: string;
  name: string;
  items: Omit<
    BulkUpdateItem,
    | "id"
    | "status"
    | "retryCount"
    | "createdAt"
    | "updatedAt"
    | "result"
    | "error"
    | "completedAt"
  >[];
  settings?: Partial<BulkUpdateSettings>;
}

export interface BulkUpdateStatusResponse {
  jobId: string;
  status: BulkUpdateStatus;
  progress: BulkUpdateProgress;
  isPaused: boolean;
  isRetrying: boolean;
  canResume: boolean;
  canCancel: boolean;
  canRetry: boolean;
  estimatedCompletion?: Date;
}

// ---------------------------------------------------------------------------
// Default Configuration
// ---------------------------------------------------------------------------

const DEFAULT_SETTINGS: BulkUpdateSettings = {
  batchSize: 10,
  concurrency: 5,
  maxRetries: 3,
  retryDelay: 1000,
  priority: 5,
  autoRetry: true,
  pauseOnError: false,
};

const PROCESSING_HISTORY_WINDOW = 10; // items to track for ETA calculation

// ---------------------------------------------------------------------------
// In-memory Storage
// ---------------------------------------------------------------------------

const bulkUpdateJobs = new Map<string, BulkUpdateJob>();
const processingQueue: string[] = []; // job IDs ordered by priority
const processingHistory = new Map<string, number[]>(); // jobId -> processing times

let idCounter = Math.floor(Math.random() * 100000);

// ---------------------------------------------------------------------------
// ID Generation
// ---------------------------------------------------------------------------

function generateJobId(): string {
  idCounter += 1;
  return `bulk-update-${Date.now()}-${idCounter}`;
}

function generateItemId(jobId: string, index: number): string {
  return `${jobId}-item-${index}`;
}

// ---------------------------------------------------------------------------
// Progress Calculation
// ---------------------------------------------------------------------------

function calculateProgress(job: BulkUpdateJob): BulkUpdateProgress {
  const total = job.items.length;
  const queued = job.items.filter((i) => i.status === "queued").length;
  const processing = job.items.filter((i) => i.status === "processing").length;
  const completed = job.items.filter((i) => i.status === "completed").length;
  const failed = job.items.filter((i) => i.status === "failed").length;
  const retried = job.items.filter((i) => i.retryCount > 0).length;

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Calculate estimated time remaining
  let estimatedTimeRemaining: number | undefined;
  const history = processingHistory.get(job.id);

  if (history && history.length > 0 && processing > 0) {
    const avgTime =
      history.reduce((a, b) => a + b, 0) / history.length;
    const remaining = total - completed - failed;
    estimatedTimeRemaining = Math.ceil((remaining * avgTime) / 1000);
  }

  return {
    total,
    queued,
    processing,
    completed,
    failed,
    retried,
    percentage,
    estimatedTimeRemaining,
    averageProcessingTime: history && history.length > 0
      ? Math.round(history.reduce((a, b) => a + b, 0) / history.length)
      : undefined,
  };
}

// ---------------------------------------------------------------------------
// Queue Management
// ---------------------------------------------------------------------------

function enqueueJob(jobId: string, priority: number): void {
  // Insert based on priority (higher first), then FIFO for same priority
  const insertIndex = processingQueue.findIndex((id) => {
    const job = bulkUpdateJobs.get(id);
    return job ? job.settings.priority < priority : false;
  });

  if (insertIndex === -1) {
    processingQueue.push(jobId);
  } else {
    processingQueue.splice(insertIndex, 0, jobId);
  }
}

function dequeueJob(): string | undefined {
  return processingQueue.shift();
}

function removeFromQueue(jobId: string): boolean {
  const index = processingQueue.indexOf(jobId);
  if (index !== -1) {
    processingQueue.splice(index, 1);
    return true;
  }
  return false;
}

function getQueuePosition(jobId: string): number {
  return processingQueue.indexOf(jobId);
}

// ---------------------------------------------------------------------------
// Core Functions
// ---------------------------------------------------------------------------

/**
 * Queue a new bulk update job
 */
export function queueBulkUpdate(input: QueueBulkUpdateInput): BulkUpdateJob {
  const now = new Date();
  const jobId = generateJobId();

  const settings: BulkUpdateSettings = {
    ...DEFAULT_SETTINGS,
    ...input.settings,
  };

  const items: BulkUpdateItem[] = input.items.map((item, index) => ({
    ...item,
    id: generateItemId(jobId, index),
    status: "queued",
    retryCount: 0,
    maxRetries: item.maxRetries ?? settings.maxRetries,
    createdAt: now,
    updatedAt: now,
  }));

  const job: BulkUpdateJob = {
    id: jobId,
    shop: input.shop,
    name: input.name,
    status: "queued",
    items,
    progress: calculateInitialProgress(items.length),
    settings,
    createdAt: now,
    updatedAt: now,
  };

  bulkUpdateJobs.set(jobId, job);
  processingHistory.set(jobId, []);
  enqueueJob(jobId, settings.priority);

  return job;
}

function calculateInitialProgress(total: number): BulkUpdateProgress {
  return {
    total,
    queued: total,
    processing: 0,
    completed: 0,
    failed: 0,
    retried: 0,
    percentage: 0,
  };
}

/**
 * Process a bulk update job
 * This function processes items in batches with configurable concurrency
 */
export async function processBulkUpdate(
  jobId: string,
  translator: {
    translate: (input: {
      text: string;
      sourceLocale: string;
      targetLocale: string;
    }) => Promise<TranslationResult>;
  },
): Promise<BulkUpdateResult> {
  const job = bulkUpdateJobs.get(jobId);
  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }

  if (job.status === "processing") {
    throw new Error(`Job ${jobId} is already processing`);
  }

  if (job.status === "completed" || job.status === "cancelled") {
    throw new Error(`Job ${jobId} is already ${job.status}`);
  }

  // Update job status
  job.status = "processing";
  job.startedAt = new Date();
  job.updatedAt = new Date();
  removeFromQueue(jobId);

  const startTime = Date.now();
  const results: BulkUpdateItemResult[] = [];
  const errors: BulkUpdateError[] = [];

  // Process items in batches
  const pendingItems = job.items.filter(
    (item) => item.status === "queued" || item.status === "failed",
  );

  const { batchSize, concurrency } = job.settings;

  for (let i = 0; i < pendingItems.length; i += batchSize * concurrency) {
    // Check if job was paused or cancelled
    if (job.status === "paused") {
      job.pausedAt = new Date();
      break;
    }
    if (job.status === "cancelled") {
      break;
    }

    // Create batches for this round
    const batchPromises: Promise<void>[] = [];

    for (
      let batchIndex = 0;
      batchIndex < concurrency && i + batchIndex * batchSize < pendingItems.length;
      batchIndex++
    ) {
      const batchStart = i + batchIndex * batchSize;
      const batch = pendingItems.slice(batchStart, batchStart + batchSize);

      if (batch.length === 0) continue;

      batchPromises.push(
        processBatch(job, batch, translator, results, errors),
      );
    }

    await Promise.all(batchPromises);

    // Update progress after each round
    job.progress = calculateProgress(job);
    job.updatedAt = new Date();
  }

  // Finalize job status
  const completedItems = job.items.filter((i) => i.status === "completed").length;
  const failedItems = job.items.filter((i) => i.status === "failed").length;

  if (job.status !== "paused" && job.status !== "cancelled") {
    if (failedItems === 0) {
      job.status = "completed";
    } else if (completedItems === 0) {
      job.status = "failed";
    } else {
      job.status = "partial";
    }
    job.completedAt = new Date();
  }

  const totalTime = Date.now() - startTime;

  return {
    jobId,
    status: job.status,
    progress: job.progress,
    results,
    errors,
    summary: {
      totalItems: job.items.length,
      successful: completedItems,
      failed: failedItems,
      retried: job.items.filter((i) => i.retryCount > 0).length,
      totalProcessingTime: totalTime,
      averageItemTime: job.items.length > 0 ? totalTime / job.items.length : 0,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
    },
  };
}

async function processBatch(
  job: BulkUpdateJob,
  batch: BulkUpdateItem[],
  translator: {
    translate: (input: {
      text: string;
      sourceLocale: string;
      targetLocale: string;
    }) => Promise<TranslationResult>;
  },
  results: BulkUpdateItemResult[],
  errors: BulkUpdateError[],
): Promise<void> {
  const processingPromises = batch.map(async (item) => {
    const itemStartTime = Date.now();

    try {
      // Update item status
      item.status = "processing";
      item.updatedAt = new Date();

      // Perform translation
      const result = await translator.translate({
        text: item.sourceText,
        sourceLocale: item.sourceLocale,
        targetLocale: item.targetLocale,
      });

      // Update item with success
      item.status = "completed";
      item.result = result;
      item.completedAt = new Date();
      item.updatedAt = new Date();

      const processingTime = Date.now() - itemStartTime;

      // Track processing time
      const history = processingHistory.get(job.id);
      if (history) {
        history.push(processingTime);
        if (history.length > PROCESSING_HISTORY_WINDOW) {
          history.shift();
        }
      }

      results.push({
        itemId: item.id,
        resourceId: item.resourceId,
        resourceType: item.resourceType,
        field: item.field,
        success: true,
        translatedText: result.translatedText,
        processingTime,
      });
    } catch (error) {
      const processingTime = Date.now() - itemStartTime;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Update item with failure
      item.status = "failed";
      item.error = errorMessage;
      item.updatedAt = new Date();

      const isRetryable = isRetryableError(error);

      errors.push({
        itemId: item.id,
        resourceId: item.resourceId,
        field: item.field,
        error: errorMessage,
        code: extractErrorCode(error),
        retryable: isRetryable,
        timestamp: new Date(),
      });

      results.push({
        itemId: item.id,
        resourceId: item.resourceId,
        resourceType: item.resourceType,
        field: item.field,
        success: false,
        error: errorMessage,
        processingTime,
      });

      // Handle pause on error
      if (job.settings.pauseOnError) {
        job.status = "paused";
        job.error = `Paused due to error: ${errorMessage}`;
      }
    }
  });

  await Promise.all(processingPromises);
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const retryablePatterns = [
      "network",
      "timeout",
      "rate limit",
      "429",
      "503",
      "temporary",
      "ECONNRESET",
      "ETIMEDOUT",
    ];
    const message = error.message.toLowerCase();
    return retryablePatterns.some((pattern) => message.includes(pattern));
  }
  return false;
}

function extractErrorCode(error: unknown): string {
  if (error instanceof Error) {
    // Try to extract HTTP status codes or known error codes
    const codeMatch = error.message.match(/\b(\d{3})\b/);
    if (codeMatch) return codeMatch[1];

    if (error.message.includes("timeout")) return "TIMEOUT";
    if (error.message.includes("rate limit")) return "RATE_LIMIT";
    if (error.message.includes("network")) return "NETWORK_ERROR";
    if (error.message.includes("auth")) return "AUTH_ERROR";
  }
  return "UNKNOWN_ERROR";
}

/**
 * Get the current status of a bulk update job
 */
export function getBulkUpdateStatus(jobId: string): BulkUpdateStatusResponse {
  const job = bulkUpdateJobs.get(jobId);
  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }

  // Update progress before returning
  job.progress = calculateProgress(job);

  const queuePosition = getQueuePosition(jobId);
  const isPaused = job.status === "paused";
  const isProcessing = job.status === "processing";
  const isQueued = job.status === "queued";
  const hasFailedItems = job.items.some((i) => i.status === "failed");

  // Calculate estimated completion
  let estimatedCompletion: Date | undefined;
  if (isProcessing && job.progress.estimatedTimeRemaining) {
    estimatedCompletion = new Date(
      Date.now() + job.progress.estimatedTimeRemaining * 1000,
    );
  } else if (isQueued && queuePosition >= 0) {
    // Rough estimate: 30 seconds per position in queue
    estimatedCompletion = new Date(Date.now() + (queuePosition + 1) * 30000);
  }

  return {
    jobId,
    status: job.status,
    progress: job.progress,
    isPaused,
    isRetrying: job.items.some((i) => i.status === "retrying"),
    canResume: isPaused || (isProcessing && job.status !== "cancelled"),
    canCancel: job.status !== "completed" &&
      job.status !== "failed" &&
      job.status !== "cancelled",
    canRetry: hasFailedItems && !isProcessing && !isQueued,
    estimatedCompletion,
  };
}

/**
 * Retry failed items in a bulk update job
 */
export async function retryFailedItems(
  jobId: string,
  translator: {
    translate: (input: {
      text: string;
      sourceLocale: string;
      targetLocale: string;
    }) => Promise<TranslationResult>;
  },
  options?: { maxRetries?: number; specificItemIds?: string[] },
): Promise<BulkUpdateResult> {
  const job = bulkUpdateJobs.get(jobId);
  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }

  // Get items to retry
  let itemsToRetry = job.items.filter((i) => i.status === "failed");

  // Filter to specific items if requested
  if (options?.specificItemIds) {
    itemsToRetry = itemsToRetry.filter((i) =>
      options.specificItemIds!.includes(i.id)
    );
  }

  if (itemsToRetry.length === 0) {
    throw new Error("No failed items to retry");
  }

  // Check max retries
  const maxRetries = options?.maxRetries ?? job.settings.maxRetries;
  const retryableItems = itemsToRetry.filter(
    (i) => i.retryCount < maxRetries && i.retryCount < i.maxRetries,
  );

  if (retryableItems.length === 0) {
    throw new Error("All failed items have exceeded max retries");
  }

  // Reset items for retry
  for (const item of retryableItems) {
    item.status = "queued";
    item.retryCount += 1;
    item.error = undefined;
    item.updatedAt = new Date();
  }

  // Reset job status
  job.status = "processing";
  job.error = undefined;
  job.updatedAt = new Date();
  job.resumedAt = new Date();

  // Process the retried items
  return processBulkUpdate(jobId, translator);
}

/**
 * Pause a running bulk update job
 */
export function pauseBulkUpdate(jobId: string): boolean {
  const job = bulkUpdateJobs.get(jobId);
  if (!job) {
    return false;
  }

  if (job.status !== "processing" && job.status !== "queued") {
    return false;
  }

  job.status = "paused";
  job.pausedAt = new Date();
  job.updatedAt = new Date();

  // Remove from queue if queued
  if (processingQueue.includes(jobId)) {
    removeFromQueue(jobId);
  }

  return true;
}

/**
 * Resume a paused bulk update job
 */
export async function resumeBulkUpdate(
  jobId: string,
  translator: {
    translate: (input: {
      text: string;
      sourceLocale: string;
      targetLocale: string;
    }) => Promise<TranslationResult>;
  },
): Promise<BulkUpdateResult> {
  const job = bulkUpdateJobs.get(jobId);
  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }

  if (job.status !== "paused") {
    throw new Error(`Job ${jobId} is not paused`);
  }

  job.status = "processing";
  job.resumedAt = new Date();
  job.updatedAt = new Date();

  return processBulkUpdate(jobId, translator);
}

/**
 * Cancel a bulk update job
 */
export function cancelBulkUpdate(jobId: string): boolean {
  const job = bulkUpdateJobs.get(jobId);
  if (!job) {
    return false;
  }

  if (
    job.status === "completed" ||
    job.status === "failed" ||
    job.status === "cancelled"
  ) {
    return false;
  }

  job.status = "cancelled";
  job.updatedAt = new Date();

  // Remove from queue
  removeFromQueue(jobId);

  return true;
}

/**
 * Get all jobs for a shop
 */
export function getBulkUpdateJobsByShop(
  shop: string,
  status?: BulkUpdateStatus,
): BulkUpdateJob[] {
  const jobs: BulkUpdateJob[] = [];

  for (const job of bulkUpdateJobs.values()) {
    if (job.shop === shop) {
      if (!status || job.status === status) {
        jobs.push(job);
      }
    }
  }

  return jobs.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

/**
 * Get detailed job information
 */
export function getBulkUpdateJob(jobId: string): BulkUpdateJob | null {
  const job = bulkUpdateJobs.get(jobId);
  if (job) {
    // Update progress
    job.progress = calculateProgress(job);
  }
  return job ?? null;
}

/**
 * Delete a completed or cancelled job
 */
export function deleteBulkUpdateJob(jobId: string): boolean {
  const job = bulkUpdateJobs.get(jobId);
  if (!job) {
    return false;
  }

  if (job.status === "processing" || job.status === "queued") {
    return false;
  }

  bulkUpdateJobs.delete(jobId);
  processingHistory.delete(jobId);
  return true;
}

/**
 * Clear all jobs for testing purposes
 */
export function clearBulkUpdateJobsForTesting(): void {
  bulkUpdateJobs.clear();
  processingQueue.length = 0;
  processingHistory.clear();
  idCounter = Math.floor(Math.random() * 100000);
}

/**
 * Get queue statistics for a shop
 */
export function getQueueStats(shop: string): {
  total: number;
  queued: number;
  processing: number;
  paused: number;
  completed: number;
  failed: number;
  partial: number;
  averageWaitTime: number;
} {
  const jobs = getBulkUpdateJobsByShop(shop);

  const now = Date.now();
  const waitTimes: number[] = [];

  for (const job of jobs) {
    if (job.startedAt && job.createdAt) {
      waitTimes.push(job.startedAt.getTime() - job.createdAt.getTime());
    }
  }

  return {
    total: jobs.length,
    queued: jobs.filter((j) => j.status === "queued").length,
    processing: jobs.filter((j) => j.status === "processing").length,
    paused: jobs.filter((j) => j.status === "paused").length,
    completed: jobs.filter((j) => j.status === "completed").length,
    failed: jobs.filter((j) => j.status === "failed").length,
    partial: jobs.filter((j) => j.status === "partial").length,
    averageWaitTime: waitTimes.length > 0
      ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length)
      : 0,
  };
}

/**
 * Batch detect if updates are needed for resources
 */
export function detectBulkUpdates(
  resources: Array<{
    id: string;
    type: string;
    fields: Array<{ name: string; value: string; lastUpdated: Date }>;
  }>,
  targetLocales: string[],
  lastTranslationDate?: Date,
): {
  resourcesNeedingUpdate: string[];
  fieldsNeedingTranslation: Array<{
    resourceId: string;
    field: string;
    sourceText: string;
  }>;
  totalItems: number;
} {
  const resourcesNeedingUpdate: string[] = [];
  const fieldsNeedingTranslation: Array<{
    resourceId: string;
    field: string;
    sourceText: string;
  }> = [];

  for (const resource of resources) {
    let needsUpdate = false;

    for (const field of resource.fields) {
      // Check if field has been updated since last translation
      const needsTranslation = !lastTranslationDate ||
        field.lastUpdated > lastTranslationDate;

      if (needsTranslation && field.value.trim()) {
        needsUpdate = true;
        fieldsNeedingTranslation.push({
          resourceId: resource.id,
          field: field.name,
          sourceText: field.value,
        });
      }
    }

    if (needsUpdate) {
      resourcesNeedingUpdate.push(resource.id);
    }
  }

  return {
    resourcesNeedingUpdate,
    fieldsNeedingTranslation,
    totalItems: fieldsNeedingTranslation.length * targetLocales.length,
  };
}

/**
 * Validate bulk update items before queuing
 */
export function validateBulkUpdateItems(
  items: Array<{
    resourceId: string;
    resourceType: string;
    field: string;
    sourceText: string;
    sourceLocale: string;
    targetLocale: string;
  }>,
): {
  valid: boolean;
  errors: Array<{ item: number; field: string; message: string }>;
  validItems: typeof items;
} {
  const errors: Array<{ item: number; field: string; message: string }> = [];
  const validItems: typeof items = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let isValid = true;

    if (!item.resourceId?.trim()) {
      errors.push({ item: i, field: "resourceId", message: "Resource ID is required" });
      isValid = false;
    }

    if (!item.resourceType?.trim()) {
      errors.push({ item: i, field: "resourceType", message: "Resource type is required" });
      isValid = false;
    }

    if (!item.field?.trim()) {
      errors.push({ item: i, field: "field", message: "Field name is required" });
      isValid = false;
    }

    if (!item.sourceText?.trim()) {
      errors.push({ item: i, field: "sourceText", message: "Source text is required" });
      isValid = false;
    }

    if (!item.sourceLocale?.trim()) {
      errors.push({ item: i, field: "sourceLocale", message: "Source locale is required" });
      isValid = false;
    }

    if (!item.targetLocale?.trim()) {
      errors.push({ item: i, field: "targetLocale", message: "Target locale is required" });
      isValid = false;
    }

    if (item.sourceLocale === item.targetLocale) {
      errors.push({
        item: i,
        field: "targetLocale",
        message: "Source and target locales must be different",
      });
      isValid = false;
    }

    if (isValid) {
      validItems.push(item);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    validItems,
  };
}
