import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TranslationResult } from "../../app/services/translation/types";
import {
  cancelBulkUpdate,
  clearBulkUpdateJobsForTesting,
  deleteBulkUpdateJob,
  detectBulkUpdates,
  getBulkUpdateJob,
  getBulkUpdateJobsByShop,
  getBulkUpdateStatus,
  getQueueStats,
  pauseBulkUpdate,
  processBulkUpdate,
  queueBulkUpdate,
  resumeBulkUpdate,
  retryFailedItems,
  validateBulkUpdateItems,
  type QueueBulkUpdateInput,
} from "../../app/services/bulk-processor/updates";

describe("bulk-update handling", () => {
  const mockTranslator = {
    translate: vi.fn(async ({ text }): Promise<TranslationResult> => ({
      provider: "openai" as const,
      translatedText: `${text}-translated`,
      detectedSourceLocale: "en",
      usage: {
        requests: 1,
        characters: text.length,
        remainingRequests: 1000,
        remainingCharacters: 100000,
      },
      quota: {
        provider: "openai" as const,
        configured: true,
        requests: 1,
        requestLimit: null,
        characters: text.length,
        characterLimit: null,
        alert: null,
      },
    })),
  };

  const mockFailingTranslator = {
    translate: vi.fn(async ({ text }): Promise<TranslationResult> => {
      if (text === "fail") {
        throw new Error("Translation failed");
      }
      return {
        provider: "openai" as const,
        translatedText: `${text}-translated`,
        detectedSourceLocale: "en",
        usage: {
          requests: 1,
          characters: text.length,
          remainingRequests: 1000,
          remainingCharacters: 100000,
        },
        quota: {
          provider: "openai" as const,
          configured: true,
          requests: 1,
          requestLimit: null,
          characters: text.length,
          characterLimit: null,
          alert: null,
        },
      };
    }),
  };

  const mockNetworkErrorTranslator = {
    translate: vi.fn(async ({ text }): Promise<TranslationResult> => {
      if (text === "network") {
        const error = new Error("Network timeout");
        error.name = "NetworkError";
        throw error;
      }
      return {
        provider: "openai" as const,
        translatedText: `${text}-translated`,
        detectedSourceLocale: "en",
        usage: {
          requests: 1,
          characters: text.length,
          remainingRequests: 1000,
          remainingCharacters: 100000,
        },
        quota: {
          provider: "openai" as const,
          configured: true,
          requests: 1,
          requestLimit: null,
          characters: text.length,
          characterLimit: null,
          alert: null,
        },
      };
    }),
  };

  beforeEach(() => {
    clearBulkUpdateJobsForTesting();
    vi.clearAllMocks();
  });

  // =============================================================================
  // queueBulkUpdate Tests
  // =============================================================================

  it("queues a bulk update job with items", () => {
    const input: QueueBulkUpdateInput = {
      shop: "test-shop.myshopify.com",
      name: "Test Bulk Update",
      items: [
        {
          resourceId: "prod-1",
          resourceType: "product",
          field: "title",
          sourceText: "Hello",
          sourceLocale: "en",
          targetLocale: "ar",
          maxRetries: 3,
        },
      ],
    };

    const job = queueBulkUpdate(input);

    expect(job.id).toBeDefined();
    expect(job.shop).toBe("test-shop.myshopify.com");
    expect(job.name).toBe("Test Bulk Update");
    expect(job.status).toBe("queued");
    expect(job.items).toHaveLength(1);
    expect(job.items[0].status).toBe("queued");
    expect(job.progress.total).toBe(1);
    expect(job.progress.queued).toBe(1);
  });

  it("generates unique IDs for multiple items in a job", () => {
    const input: QueueBulkUpdateInput = {
      shop: "test-shop.myshopify.com",
      name: "Multi-item Job",
      items: [
        {
          resourceId: "prod-1",
          resourceType: "product",
          field: "title",
          sourceText: "Hello",
          sourceLocale: "en",
          targetLocale: "ar",
          maxRetries: 3,
        },
        {
          resourceId: "prod-2",
          resourceType: "product",
          field: "title",
          sourceText: "World",
          sourceLocale: "en",
          targetLocale: "ar",
          maxRetries: 3,
        },
      ],
    };

    const job = queueBulkUpdate(input);

    expect(job.items[0].id).not.toBe(job.items[1].id);
    expect(job.items[0].id).toContain(job.id);
    expect(job.items[1].id).toContain(job.id);
  });

  it("applies custom settings when provided", () => {
    const input: QueueBulkUpdateInput = {
      shop: "test-shop.myshopify.com",
      name: "Custom Settings Job",
      items: [
        {
          resourceId: "prod-1",
          resourceType: "product",
          field: "title",
          sourceText: "Hello",
          sourceLocale: "en",
          targetLocale: "ar",
          maxRetries: 3,
        },
      ],
      settings: {
        batchSize: 20,
        concurrency: 10,
        priority: 9,
        autoRetry: false,
      },
    };

    const job = queueBulkUpdate(input);

    expect(job.settings.batchSize).toBe(20);
    expect(job.settings.concurrency).toBe(10);
    expect(job.settings.priority).toBe(9);
    expect(job.settings.autoRetry).toBe(false);
  });

  it("uses default settings when not provided", () => {
    const input: QueueBulkUpdateInput = {
      shop: "test-shop.myshopify.com",
      name: "Default Settings Job",
      items: [
        {
          resourceId: "prod-1",
          resourceType: "product",
          field: "title",
          sourceText: "Hello",
          sourceLocale: "en",
          targetLocale: "ar",
          maxRetries: 3,
        },
      ],
    };

    const job = queueBulkUpdate(input);

    expect(job.settings.batchSize).toBe(10);
    expect(job.settings.concurrency).toBe(5);
    expect(job.settings.maxRetries).toBe(3);
    expect(job.settings.priority).toBe(5);
    expect(job.settings.autoRetry).toBe(true);
  });

  it("prioritizes jobs by priority value", () => {
    const lowPriorityJob = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Low Priority",
      items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "A", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
      settings: { priority: 1 },
    });

    const highPriorityJob = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "High Priority",
      items: [{ resourceId: "2", resourceType: "product", field: "title", sourceText: "B", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
      settings: { priority: 10 },
    });

    const mediumPriorityJob = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Medium Priority",
      items: [{ resourceId: "3", resourceType: "product", field: "title", sourceText: "C", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
      settings: { priority: 5 },
    });

    // All jobs should be queued successfully
    expect(lowPriorityJob.status).toBe("queued");
    expect(highPriorityJob.status).toBe("queued");
    expect(mediumPriorityJob.status).toBe("queued");
  });

  // =============================================================================
  // processBulkUpdate Tests
  // =============================================================================

  it("processes all items successfully", async () => {
    const job = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Test Job",
      items: [
        { resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
        { resourceId: "2", resourceType: "product", field: "title", sourceText: "World", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
      ],
    });

    const result = await processBulkUpdate(job.id, mockTranslator);

    expect(result.status).toBe("completed");
    expect(result.progress.completed).toBe(2);
    expect(result.progress.failed).toBe(0);
    expect(result.summary.successful).toBe(2);
    expect(mockTranslator.translate).toHaveBeenCalledTimes(2);
  });

  it("throws error for non-existent job", async () => {
    await expect(processBulkUpdate("non-existent", mockTranslator)).rejects.toThrow(
      "Job not found: non-existent"
    );
  });

  it("throws error when processing already processing job", async () => {
    const job = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Test Job",
      items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
    });

    // Start processing but don't await
    const processPromise = processBulkUpdate(job.id, mockTranslator);
    
    // Immediately try to process again - this should fail
    await expect(processBulkUpdate(job.id, mockTranslator)).rejects.toThrow(
      `Job ${job.id} is already processing`
    );

    await processPromise;
  });

  it("throws error when processing completed job", async () => {
    const job = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Test Job",
      items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
    });

    await processBulkUpdate(job.id, mockTranslator);

    await expect(processBulkUpdate(job.id, mockTranslator)).rejects.toThrow(
      `Job ${job.id} is already completed`
    );
  });

  it("handles partial failures correctly", async () => {
    const job = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Partial Failure Job",
      items: [
        { resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
        { resourceId: "2", resourceType: "product", field: "title", sourceText: "fail", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
        { resourceId: "3", resourceType: "product", field: "title", sourceText: "World", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
      ],
    });

    const result = await processBulkUpdate(job.id, mockFailingTranslator);

    expect(result.status).toBe("partial");
    expect(result.progress.completed).toBe(2);
    expect(result.progress.failed).toBe(1);
    expect(result.summary.successful).toBe(2);
    expect(result.summary.failed).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].error).toBe("Translation failed");
  });

  it("marks job as failed when all items fail", async () => {
    const job = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "All Fail Job",
      items: [
        { resourceId: "1", resourceType: "product", field: "title", sourceText: "fail", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
        { resourceId: "2", resourceType: "product", field: "title", sourceText: "fail", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
      ],
    });

    const result = await processBulkUpdate(job.id, mockFailingTranslator);

    expect(result.status).toBe("failed");
    expect(result.progress.completed).toBe(0);
    expect(result.progress.failed).toBe(2);
  });

  it("processes items in batches with configured concurrency", async () => {
    const items = Array.from({ length: 20 }, (_, i) => ({
      resourceId: `prod-${i}`,
      resourceType: "product",
      field: "title",
      sourceText: `Text ${i}`,
      sourceLocale: "en",
      targetLocale: "ar",
      maxRetries: 3,
    }));

    const job = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Batch Test Job",
      items,
      settings: { batchSize: 5, concurrency: 2 },
    });

    const result = await processBulkUpdate(job.id, mockTranslator);

    expect(result.status).toBe("completed");
    expect(result.progress.total).toBe(20);
    expect(result.progress.completed).toBe(20);
    expect(mockTranslator.translate).toHaveBeenCalledTimes(20);
  });

  // =============================================================================
  // getBulkUpdateStatus Tests
  // =============================================================================

  it("returns correct status for queued job", () => {
    const job = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Status Test",
      items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
    });

    const status = getBulkUpdateStatus(job.id);

    expect(status.jobId).toBe(job.id);
    expect(status.status).toBe("queued");
    expect(status.isPaused).toBe(false);
    expect(status.canCancel).toBe(true);
    expect(status.canResume).toBe(false);
    expect(status.canRetry).toBe(false);
  });

  it("throws error for non-existent job status request", () => {
    expect(() => getBulkUpdateStatus("non-existent")).toThrow(
      "Job not found: non-existent"
    );
  });

  it("calculates progress percentage correctly", async () => {
    const job = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Progress Test",
      items: [
        { resourceId: "1", resourceType: "product", field: "title", sourceText: "A", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
        { resourceId: "2", resourceType: "product", field: "title", sourceText: "B", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
        { resourceId: "3", resourceType: "product", field: "title", sourceText: "C", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
        { resourceId: "4", resourceType: "product", field: "title", sourceText: "D", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
      ],
    });

    const statusBefore = getBulkUpdateStatus(job.id);
    expect(statusBefore.progress.percentage).toBe(0);

    await processBulkUpdate(job.id, mockTranslator);

    const statusAfter = getBulkUpdateStatus(job.id);
    expect(statusAfter.progress.percentage).toBe(100);
    expect(statusAfter.progress.completed).toBe(4);
  });

  // =============================================================================
  // retryFailedItems Tests
  // =============================================================================

  it("retries failed items successfully", async () => {
    const job = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Retry Test",
      items: [
        { resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
        { resourceId: "2", resourceType: "product", field: "title", sourceText: "fail", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
      ],
    });

    // First processing - one fails
    const firstResult = await processBulkUpdate(job.id, mockFailingTranslator);
    expect(firstResult.status).toBe("partial");
    expect(firstResult.summary.failed).toBe(1);

    // Change the mock to succeed on retry
    mockFailingTranslator.translate.mockImplementation(async ({ text }): Promise<TranslationResult> => ({
      provider: "openai" as const,
      translatedText: `${text}-translated-retry`,
      detectedSourceLocale: "en",
      usage: { requests: 1, characters: text.length, remainingRequests: 1000, remainingCharacters: 100000 },
      quota: { provider: "openai" as const, configured: true, requests: 1, requestLimit: null, characters: text.length, characterLimit: null, alert: null },
    }));

    // Retry failed items
    const retryResult = await retryFailedItems(job.id, mockFailingTranslator);
    expect(retryResult.status).toBe("completed");
    expect(retryResult.summary.successful).toBe(1);
    expect(retryResult.summary.retried).toBe(1);
  });

  it("throws error when no failed items to retry", async () => {
    const job = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "No Failures",
      items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
    });

    await processBulkUpdate(job.id, mockTranslator);

    await expect(retryFailedItems(job.id, mockTranslator)).rejects.toThrow(
      "No failed items to retry"
    );
  });

  it("throws error when max retries exceeded", async () => {
    const job = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Max Retries",
      items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "fail", sourceLocale: "en", targetLocale: "ar", maxRetries: 1 }],
    });

    await processBulkUpdate(job.id, mockFailingTranslator);

    // First retry - should fail because item already has 1 retry
    await expect(retryFailedItems(job.id, mockFailingTranslator)).rejects.toThrow(
      "All failed items have exceeded max retries"
    );
  });

  it("retries only specific items when specified", async () => {
    const job = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Specific Retry",
      items: [
        { resourceId: "1", resourceType: "product", field: "title", sourceText: "fail1", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
        { resourceId: "2", resourceType: "product", field: "title", sourceText: "fail2", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
      ],
    });

    await processBulkUpdate(job.id, mockFailingTranslator);

    // Get the item ID for the first item
    const jobData = getBulkUpdateJob(job.id);
    const firstItemId = jobData?.items[0].id;

    // Mock success for retry
    mockFailingTranslator.translate.mockImplementation(async ({ text }): Promise<TranslationResult> => ({
      provider: "openai" as const,
      translatedText: `${text}-fixed`,
      detectedSourceLocale: "en",
      usage: { requests: 1, characters: text.length, remainingRequests: 1000, remainingCharacters: 100000 },
      quota: { provider: "openai" as const, configured: true, requests: 1, requestLimit: null, characters: text.length, characterLimit: null, alert: null },
    }));

    // Retry only the first item
    const result = await retryFailedItems(job.id, mockFailingTranslator, {
      specificItemIds: firstItemId ? [firstItemId] : undefined,
    });

    expect(result.summary.successful).toBe(1);
    expect(result.summary.failed).toBe(1); // Second item still failed
  });

  // =============================================================================
  // Pause and Resume Tests
  // =============================================================================

  it("pauses a processing job", () => {
    const job = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Pause Test",
      items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
    });

    const paused = pauseBulkUpdate(job.id);
    expect(paused).toBe(true);

    const status = getBulkUpdateStatus(job.id);
    expect(status.status).toBe("paused");
    expect(status.isPaused).toBe(true);
    expect(status.canResume).toBe(true);
  });

  it("returns false when pausing non-existent job", () => {
    const paused = pauseBulkUpdate("non-existent");
    expect(paused).toBe(false);
  });

  it("returns false when pausing completed job", async () => {
    const job = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Completed Job",
      items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
    });

    await processBulkUpdate(job.id, mockTranslator);

    const paused = pauseBulkUpdate(job.id);
    expect(paused).toBe(false);
  });

  it("resumes a paused job", async () => {
    const job = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Resume Test",
      items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
    });

    pauseBulkUpdate(job.id);

    const result = await resumeBulkUpdate(job.id, mockTranslator);
    expect(result.status).toBe("completed");
  });

  it("throws error when resuming non-paused job", async () => {
    const job = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Not Paused",
      items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
    });

    await expect(resumeBulkUpdate(job.id, mockTranslator)).rejects.toThrow(
      `Job ${job.id} is not paused`
    );
  });

  // =============================================================================
  // Cancel Tests
  // =============================================================================

  it("cancels a queued job", () => {
    const job = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Cancel Test",
      items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
    });

    const cancelled = cancelBulkUpdate(job.id);
    expect(cancelled).toBe(true);

    const status = getBulkUpdateStatus(job.id);
    expect(status.status).toBe("cancelled");
    expect(status.canCancel).toBe(false);
  });

  it("returns false when cancelling non-existent job", () => {
    const cancelled = cancelBulkUpdate("non-existent");
    expect(cancelled).toBe(false);
  });

  it("returns false when cancelling already completed job", async () => {
    const job = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Completed",
      items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
    });

    await processBulkUpdate(job.id, mockTranslator);

    const cancelled = cancelBulkUpdate(job.id);
    expect(cancelled).toBe(false);
  });

  it("throws error when processing cancelled job", async () => {
    const job = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Cancelled Job",
      items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
    });

    cancelBulkUpdate(job.id);

    await expect(processBulkUpdate(job.id, mockTranslator)).rejects.toThrow(
      `Job ${job.id} is already cancelled`
    );
  });

  // =============================================================================
  // Query Functions Tests
  // =============================================================================

  it("retrieves job by ID", () => {
    const job = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Get Job Test",
      items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
    });

    const retrieved = getBulkUpdateJob(job.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(job.id);
    expect(retrieved?.name).toBe("Get Job Test");
  });

  it("returns null for non-existent job", () => {
    const retrieved = getBulkUpdateJob("non-existent");
    expect(retrieved).toBeNull();
  });

  it("gets all jobs for a shop", () => {
    queueBulkUpdate({
      shop: "shop1.myshopify.com",
      name: "Shop 1 Job 1",
      items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
    });

    queueBulkUpdate({
      shop: "shop1.myshopify.com",
      name: "Shop 1 Job 2",
      items: [{ resourceId: "2", resourceType: "product", field: "title", sourceText: "World", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
    });

    queueBulkUpdate({
      shop: "shop2.myshopify.com",
      name: "Shop 2 Job",
      items: [{ resourceId: "3", resourceType: "product", field: "title", sourceText: "Test", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
    });

    const shop1Jobs = getBulkUpdateJobsByShop("shop1.myshopify.com");
    expect(shop1Jobs).toHaveLength(2);
    expect(shop1Jobs.map((j) => j.name)).toContain("Shop 1 Job 1");
    expect(shop1Jobs.map((j) => j.name)).toContain("Shop 1 Job 2");

    const shop2Jobs = getBulkUpdateJobsByShop("shop2.myshopify.com");
    expect(shop2Jobs).toHaveLength(1);
    expect(shop2Jobs[0].name).toBe("Shop 2 Job");
  });

  it("filters jobs by status", async () => {
    const job1 = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Completed Job",
      items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
    });

    const job2 = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Queued Job",
      items: [{ resourceId: "2", resourceType: "product", field: "title", sourceText: "World", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
    });

    await processBulkUpdate(job1.id, mockTranslator);

    const completedJobs = getBulkUpdateJobsByShop("test-shop.myshopify.com", "completed");
    expect(completedJobs).toHaveLength(1);
    expect(completedJobs[0].name).toBe("Completed Job");

    const queuedJobs = getBulkUpdateJobsByShop("test-shop.myshopify.com", "queued");
    expect(queuedJobs).toHaveLength(1);
    expect(queuedJobs[0].name).toBe("Queued Job");
  });

  it("sorts jobs by creation date (newest first)", () => {
    const job1 = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "First Job",
      items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "A", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
    });

    // Small delay to ensure different timestamps
    vi.advanceTimersByTime(100);

    const job2 = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Second Job",
      items: [{ resourceId: "2", resourceType: "product", field: "title", sourceText: "B", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
    });

    const jobs = getBulkUpdateJobsByShop("test-shop.myshopify.com");
    expect(jobs[0].id).toBe(job2.id);
    expect(jobs[1].id).toBe(job1.id);
  });

  // =============================================================================
  // Delete and Cleanup Tests
  // =============================================================================

  it("deletes a completed job", async () => {
    const job = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Delete Test",
      items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
    });

    await processBulkUpdate(job.id, mockTranslator);

    const deleted = deleteBulkUpdateJob(job.id);
    expect(deleted).toBe(true);

    const retrieved = getBulkUpdateJob(job.id);
    expect(retrieved).toBeNull();
  });

  it("returns false when deleting non-existent job", () => {
    const deleted = deleteBulkUpdateJob("non-existent");
    expect(deleted).toBe(false);
  });

  it("returns false when deleting processing job", async () => {
    const job = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Processing Job",
      items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
    });

    // Start processing but don't await
    const processPromise = processBulkUpdate(job.id, mockTranslator);

    const deleted = deleteBulkUpdateJob(job.id);
    expect(deleted).toBe(false);

    await processPromise;
  });

  // =============================================================================
  // Queue Statistics Tests
  // =============================================================================

  it("returns accurate queue statistics", async () => {
    queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Queued Stat",
      items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "A", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
    });

    const processingJob = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Processing Stat",
      items: [{ resourceId: "2", resourceType: "product", field: "title", sourceText: "B", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
    });

    await processBulkUpdate(processingJob.id, mockTranslator);

    const stats = getQueueStats("test-shop.myshopify.com");
    expect(stats.total).toBe(2);
    expect(stats.queued).toBe(1);
    expect(stats.completed).toBe(1);
  });

  it("returns zero stats for shop with no jobs", () => {
    const stats = getQueueStats("empty-shop.myshopify.com");
    expect(stats.total).toBe(0);
    expect(stats.averageWaitTime).toBe(0);
  });

  // =============================================================================
  // Bulk Update Detection Tests
  // =============================================================================

  it("detects resources needing updates based on last updated date", () => {
    const lastTranslationDate = new Date("2024-01-01");

    const resources = [
      {
        id: "prod-1",
        type: "product",
        fields: [
          { name: "title", value: "New Product", lastUpdated: new Date("2024-06-01") },
          { name: "description", value: "Description", lastUpdated: new Date("2024-06-01") },
        ],
      },
      {
        id: "prod-2",
        type: "product",
        fields: [
          { name: "title", value: "Old Product", lastUpdated: new Date("2023-12-01") },
        ],
      },
      {
        id: "prod-3",
        type: "product",
        fields: [
          { name: "title", value: "Updated Product", lastUpdated: new Date("2024-06-15") },
        ],
      },
    ];

    const targetLocales = ["ar", "he"];
    const result = detectBulkUpdates(resources, targetLocales, lastTranslationDate);

    expect(result.resourcesNeedingUpdate).toHaveLength(2);
    expect(result.resourcesNeedingUpdate).toContain("prod-1");
    expect(result.resourcesNeedingUpdate).toContain("prod-3");
    expect(result.fieldsNeedingTranslation).toHaveLength(3);
    expect(result.totalItems).toBe(6); // 3 fields * 2 locales
  });

  it("detects all resources when no last translation date provided", () => {
    const resources = [
      {
        id: "prod-1",
        type: "product",
        fields: [
          { name: "title", value: "Product", lastUpdated: new Date("2023-01-01") },
        ],
      },
    ];

    const result = detectBulkUpdates(resources, ["ar"]);

    expect(result.resourcesNeedingUpdate).toHaveLength(1);
    expect(result.fieldsNeedingTranslation).toHaveLength(1);
  });

  it("skips empty fields during detection", () => {
    const resources = [
      {
        id: "prod-1",
        type: "product",
        fields: [
          { name: "title", value: "Product", lastUpdated: new Date("2024-06-01") },
          { name: "description", value: "   ", lastUpdated: new Date("2024-06-01") },
          { name: "tags", value: "", lastUpdated: new Date("2024-06-01") },
        ],
      },
    ];

    const result = detectBulkUpdates(resources, ["ar"]);

    expect(result.fieldsNeedingTranslation).toHaveLength(1);
    expect(result.fieldsNeedingTranslation[0].field).toBe("title");
  });

  // =============================================================================
  // Validation Tests
  // =============================================================================

  it("validates bulk update items correctly", () => {
    const items = [
      {
        resourceId: "prod-1",
        resourceType: "product",
        field: "title",
        sourceText: "Hello",
        sourceLocale: "en",
        targetLocale: "ar",
      },
      {
        resourceId: "",
        resourceType: "product",
        field: "title",
        sourceText: "Invalid",
        sourceLocale: "en",
        targetLocale: "ar",
      },
      {
        resourceId: "prod-3",
        resourceType: "product",
        field: "title",
        sourceText: "Same Locale",
        sourceLocale: "en",
        targetLocale: "en",
      },
    ];

    const result = validateBulkUpdateItems(items);

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0]).toEqual({ item: 1, field: "resourceId", message: "Resource ID is required" });
    expect(result.errors[1]).toEqual({ item: 2, field: "targetLocale", message: "Source and target locales must be different" });
    expect(result.validItems).toHaveLength(1);
    expect(result.validItems[0].resourceId).toBe("prod-1");
  });

  it("returns valid for all correct items", () => {
    const items = [
      {
        resourceId: "prod-1",
        resourceType: "product",
        field: "title",
        sourceText: "Hello",
        sourceLocale: "en",
        targetLocale: "ar",
      },
      {
        resourceId: "prod-2",
        resourceType: "collection",
        field: "description",
        sourceText: "World",
        sourceLocale: "en",
        targetLocale: "he",
      },
    ];

    const result = validateBulkUpdateItems(items);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.validItems).toHaveLength(2);
  });

  it("detects missing required fields", () => {
    const items = [
      {
        resourceId: "prod-1",
        resourceType: "",
        field: "title",
        sourceText: "Hello",
        sourceLocale: "en",
        targetLocale: "ar",
      },
      {
        resourceId: "prod-2",
        resourceType: "product",
        field: "",
        sourceText: "Hello",
        sourceLocale: "en",
        targetLocale: "ar",
      },
      {
        resourceId: "prod-3",
        resourceType: "product",
        field: "title",
        sourceText: "",
        sourceLocale: "en",
        targetLocale: "ar",
      },
      {
        resourceId: "prod-4",
        resourceType: "product",
        field: "title",
        sourceText: "Hello",
        sourceLocale: "",
        targetLocale: "ar",
      },
      {
        resourceId: "prod-5",
        resourceType: "product",
        field: "title",
        sourceText: "Hello",
        sourceLocale: "en",
        targetLocale: "",
      },
    ];

    const result = validateBulkUpdateItems(items);

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(5);
    expect(result.errors.map((e) => e.field)).toEqual([
      "resourceType",
      "field",
      "sourceText",
      "sourceLocale",
      "targetLocale",
    ]);
  });

  // =============================================================================
  // Error Handling Tests
  // =============================================================================

  it("classifies network errors as retryable", async () => {
    const job = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Network Error Test",
      items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "network", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
    });

    const result = await processBulkUpdate(job.id, mockNetworkErrorTranslator);

    expect(result.status).toBe("failed");
    expect(result.errors[0].retryable).toBe(true);
    expect(result.errors[0].code).toBe("TIMEOUT");
  });

  it("extracts HTTP error codes from error messages", async () => {
    const mockHttpErrorTranslator = {
      translate: vi.fn(async (): Promise<TranslationResult> => {
        throw new Error("API returned 429 Too Many Requests");
      }),
    };

    const job = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "HTTP Error Test",
      items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "test", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
    });

    const result = await processBulkUpdate(job.id, mockHttpErrorTranslator);

    expect(result.errors[0].code).toBe("429");
    expect(result.errors[0].retryable).toBe(true);
  });

  // =============================================================================
  // Progress Tracking Tests
  // =============================================================================

  it("tracks processing history for ETA calculation", async () => {
    const items = Array.from({ length: 5 }, (_, i) => ({
      resourceId: `prod-${i}`,
      resourceType: "product",
      field: "title",
      sourceText: `Text ${i}`,
      sourceLocale: "en",
      targetLocale: "ar",
      maxRetries: 3,
    }));

    const job = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "ETA Test",
      items,
    });

    await processBulkUpdate(job.id, mockTranslator);

    const status = getBulkUpdateStatus(job.id);
    expect(status.progress.averageProcessingTime).toBeGreaterThan(0);
  });

  it("calculates summary statistics correctly", async () => {
    const job = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Summary Test",
      items: [
        { resourceId: "1", resourceType: "product", field: "title", sourceText: "A", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
        { resourceId: "2", resourceType: "product", field: "title", sourceText: "fail", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
        { resourceId: "3", resourceType: "product", field: "title", sourceText: "C", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
      ],
    });

    const result = await processBulkUpdate(job.id, mockFailingTranslator);

    expect(result.summary.totalItems).toBe(3);
    expect(result.summary.successful).toBe(2);
    expect(result.summary.failed).toBe(1);
    expect(result.summary.totalProcessingTime).toBeGreaterThan(0);
    expect(result.summary.startedAt).toBeDefined();
    expect(result.summary.completedAt).toBeDefined();
  });

  // =============================================================================
  // Integration Tests
  // =============================================================================

  it("handles complete workflow: queue -> process -> partial -> retry -> complete", async () => {
    // Queue job with mixed success/failure
    const job = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Integration Test",
      items: [
        { resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
        { resourceId: "2", resourceType: "product", field: "title", sourceText: "fail", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
        { resourceId: "3", resourceType: "product", field: "title", sourceText: "World", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
      ],
    });

    // Initial processing - partial success
    let result = await processBulkUpdate(job.id, mockFailingTranslator);
    expect(result.status).toBe("partial");
    expect(result.progress.completed).toBe(2);
    expect(result.progress.failed).toBe(1);

    // Status check
    let status = getBulkUpdateStatus(job.id);
    expect(status.canRetry).toBe(true);

    // Fix the translator and retry
    mockFailingTranslator.translate.mockImplementation(async ({ text }): Promise<TranslationResult> => ({
      provider: "openai" as const,
      translatedText: `${text}-fixed`,
      detectedSourceLocale: "en",
      usage: { requests: 1, characters: text.length, remainingRequests: 1000, remainingCharacters: 100000 },
      quota: { provider: "openai" as const, configured: true, requests: 1, requestLimit: null, characters: text.length, characterLimit: null, alert: null },
    }));

    result = await retryFailedItems(job.id, mockFailingTranslator);
    expect(result.status).toBe("completed");
    expect(result.summary.successful).toBe(1);
    expect(result.summary.retried).toBe(1);

    // Final status
    status = getBulkUpdateStatus(job.id);
    expect(status.status).toBe("completed");
    expect(status.canRetry).toBe(false);
  });

  it("handles pause during processing", async () => {
    const job = queueBulkUpdate({
      shop: "test-shop.myshopify.com",
      name: "Pause During Processing",
      items: Array.from({ length: 100 }, (_, i) => ({
        resourceId: `prod-${i}`,
        resourceType: "product",
        field: "title",
        sourceText: `Text ${i}`,
        sourceLocale: "en",
        targetLocale: "ar",
        maxRetries: 3,
      })),
    });

    // Start processing
    const processPromise = processBulkUpdate(job.id, {
      translate: vi.fn(async ({ text }) => {
        // Simulate some processing time
        await new Promise((resolve) => setTimeout(resolve, 10));
        return {
          provider: "openai" as const,
          translatedText: `${text}-translated`,
          detectedSourceLocale: "en",
          usage: { requests: 1, characters: text.length, remainingRequests: 1000, remainingCharacters: 100000 },
          quota: { provider: "openai" as const, configured: true, requests: 1, requestLimit: null, characters: text.length, characterLimit: null, alert: null },
        };
      }),
    });

    // Immediately pause
    const paused = pauseBulkUpdate(job.id);
    expect(paused).toBe(true);

    const status = getBulkUpdateStatus(job.id);
    expect(status.isPaused).toBe(true);

    // Wait for processing to complete (it should have stopped)
    const result = await processPromise;
    expect(result.status).toBe("paused");
  });
});
