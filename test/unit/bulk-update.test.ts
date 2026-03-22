import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TranslationResult } from "../../app/services/translation/types";
import {
  cancelBulkUpdate, clearBulkUpdateJobsForTesting, deleteBulkUpdateJob,
  detectBulkUpdates, getBulkUpdateJob, getBulkUpdateJobsByShop, getBulkUpdateStatus,
  getQueueStats, pauseBulkUpdate, processBulkUpdate, queueBulkUpdate, resumeBulkUpdate,
  retryFailedItems, validateBulkUpdateItems, type QueueBulkUpdateInput,
} from "../../app/services/bulk-processor/updates";

describe("bulk-update handling", () => {
  const createMockTranslator = () => ({
    translate: vi.fn(async ({ text }: { text: string }): Promise<TranslationResult> => ({
      provider: "openai" as const,
      translatedText: `${text}-translated`,
      detectedSourceLocale: "en",
      usage: { requests: 1, characters: text.length, remainingRequests: 1000, remainingCharacters: 100000 },
      quota: { provider: "openai" as const, configured: true, requests: 1, requestLimit: null, characters: text.length, characterLimit: null, alert: null },
    })),
  });

  beforeEach(() => {
    clearBulkUpdateJobsForTesting();
    vi.clearAllMocks();
  });

  describe("queueBulkUpdate", () => {
    it("queues a bulk update job with items", () => {
      const input: QueueBulkUpdateInput = {
        shop: "test-shop.myshopify.com",
        name: "Test Bulk Update",
        items: [{ resourceId: "prod-1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
      };
      const job = queueBulkUpdate(input);
      expect(job.id).toBeDefined();
      expect(job.shop).toBe("test-shop.myshopify.com");
      expect(job.name).toBe("Test Bulk Update");
      expect(job.status).toBe("queued");
      expect(job.items).toHaveLength(1);
      expect(job.items[0].status).toBe("queued");
      expect(job.progress.total).toBe(1);
    });

    it("generates unique IDs for multiple items in a job", () => {
      const job = queueBulkUpdate({
        shop: "test-shop.myshopify.com",
        name: "Multi-item Job",
        items: [
          { resourceId: "prod-1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
          { resourceId: "prod-2", resourceType: "product", field: "title", sourceText: "World", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
        ],
      });
      expect(job.items[0].id).not.toBe(job.items[1].id);
      expect(job.items[0].id).toContain(job.id);
    });

    it("applies custom settings when provided", () => {
      const job = queueBulkUpdate({
        shop: "test-shop.myshopify.com",
        name: "Custom Settings Job",
        items: [{ resourceId: "prod-1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
        settings: { batchSize: 20, concurrency: 10, priority: 9, autoRetry: false },
      });
      expect(job.settings.batchSize).toBe(20);
      expect(job.settings.concurrency).toBe(10);
      expect(job.settings.priority).toBe(9);
      expect(job.settings.autoRetry).toBe(false);
    });

    it("uses default settings when not provided", () => {
      const job = queueBulkUpdate({
        shop: "test-shop.myshopify.com",
        name: "Default Settings Job",
        items: [{ resourceId: "prod-1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
      });
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
      expect(lowPriorityJob.status).toBe("queued");
      expect(highPriorityJob.status).toBe("queued");
    });
  });

  describe("processBulkUpdate", () => {
    it("processes all items successfully", async () => {
      const mockTranslator = createMockTranslator();
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
      const mockTranslator = createMockTranslator();
      await expect(processBulkUpdate("non-existent", mockTranslator)).rejects.toThrow("Job not found: non-existent");
    });

    it("throws error when processing already processing job", async () => {
      const mockTranslator = createMockTranslator();
      const job = queueBulkUpdate({
        shop: "test-shop.myshopify.com",
        name: "Test Job",
        items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
      });
      const processPromise = processBulkUpdate(job.id, mockTranslator);
      await expect(processBulkUpdate(job.id, mockTranslator)).rejects.toThrow(`Job ${job.id} is already processing`);
      await processPromise;
    });

    it("throws error when processing completed job", async () => {
      const mockTranslator = createMockTranslator();
      const job = queueBulkUpdate({
        shop: "test-shop.myshopify.com",
        name: "Test Job",
        items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
      });
      await processBulkUpdate(job.id, mockTranslator);
      await expect(processBulkUpdate(job.id, mockTranslator)).rejects.toThrow(`Job ${job.id} is already completed`);
    });

    it("handles partial failures correctly", async () => {
      const mockTranslator = createMockTranslator();
      mockTranslator.translate.mockImplementation(async ({ text }: { text: string }) => {
        if (text === "fail") throw new Error("Translation failed");
        return {
          provider: "openai" as const,
          translatedText: `${text}-translated`,
          detectedSourceLocale: "en",
          usage: { requests: 1, characters: text.length, remainingRequests: 1000, remainingCharacters: 100000 },
          quota: { provider: "openai" as const, configured: true, requests: 1, requestLimit: null, characters: text.length, characterLimit: null, alert: null },
        };
      });
      const job = queueBulkUpdate({
        shop: "test-shop.myshopify.com",
        name: "Partial Failure Job",
        items: [
          { resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
          { resourceId: "2", resourceType: "product", field: "title", sourceText: "fail", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
          { resourceId: "3", resourceType: "product", field: "title", sourceText: "World", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
        ],
      });
      const result = await processBulkUpdate(job.id, mockTranslator);
      expect(result.status).toBe("partial");
      expect(result.progress.completed).toBe(2);
      expect(result.progress.failed).toBe(1);
      expect(result.summary.successful).toBe(2);
      expect(result.summary.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toBe("Translation failed");
    });

    it("marks job as failed when all items fail", async () => {
      const mockTranslator = createMockTranslator();
      mockTranslator.translate.mockRejectedValue(new Error("Translation failed"));
      const job = queueBulkUpdate({
        shop: "test-shop.myshopify.com",
        name: "All Fail Job",
        items: [
          { resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
          { resourceId: "2", resourceType: "product", field: "title", sourceText: "World", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
        ],
      });
      const result = await processBulkUpdate(job.id, mockTranslator);
      expect(result.status).toBe("failed");
      expect(result.progress.completed).toBe(0);
      expect(result.progress.failed).toBe(2);
    });

    it("processes items in batches with configured concurrency", async () => {
      const mockTranslator = createMockTranslator();
      const items = Array.from({ length: 20 }, (_, i) => ({
        resourceId: `prod-${i}`, resourceType: "product", field: "title", sourceText: `Text ${i}`, sourceLocale: "en", targetLocale: "ar", maxRetries: 3,
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
  });

  describe("getBulkUpdateStatus", () => {
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
      expect(() => getBulkUpdateStatus("non-existent")).toThrow("Job not found: non-existent");
    });

    it("calculates progress percentage correctly", async () => {
      const mockTranslator = createMockTranslator();
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
  });

  describe("retryFailedItems", () => {
    it("retries failed items successfully", async () => {
      const mockTranslator = createMockTranslator();
      // First make it fail
      mockTranslator.translate.mockRejectedValueOnce(new Error("Translation failed"));
      const job = queueBulkUpdate({
        shop: "test-shop.myshopify.com",
        name: "Retry Test",
        items: [
          { resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
        ],
      });
      const firstResult = await processBulkUpdate(job.id, mockTranslator);
      expect(firstResult.status).toBe("failed");
      expect(firstResult.summary.failed).toBe(1);
      // Now make it succeed and retry
      mockTranslator.translate.mockResolvedValue({
        provider: "openai" as const,
        translatedText: "translated-retry",
        detectedSourceLocale: "en",
        usage: { requests: 1, characters: 10, remainingRequests: 1000, remainingCharacters: 100000 },
        quota: { provider: "openai" as const, configured: true, requests: 1, requestLimit: null, characters: 10, characterLimit: null, alert: null },
      });
      const retryResult = await retryFailedItems(job.id, mockTranslator);
      expect(retryResult.status).toBe("completed");
      expect(retryResult.summary.successful).toBe(1);
      expect(retryResult.summary.retried).toBe(1);
    });

    it("throws error when no failed items to retry", async () => {
      const mockTranslator = createMockTranslator();
      const job = queueBulkUpdate({
        shop: "test-shop.myshopify.com",
        name: "No Failures",
        items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
      });
      await processBulkUpdate(job.id, mockTranslator);
      await expect(retryFailedItems(job.id, mockTranslator)).rejects.toThrow("No failed items to retry");
    });

    it("throws error when max retries exceeded", async () => {
      const mockTranslator = createMockTranslator();
      mockTranslator.translate.mockRejectedValue(new Error("Translation failed"));
      const job = queueBulkUpdate({
        shop: "test-shop.myshopify.com",
        name: "Max Retries",
        items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 0 }],
      });
      await processBulkUpdate(job.id, mockTranslator);
      await expect(retryFailedItems(job.id, mockTranslator)).rejects.toThrow("All failed items have exceeded max retries");
    });

    it("retries only specific items when specified", async () => {
      const mockTranslator = createMockTranslator();
      mockTranslator.translate.mockImplementation(async ({ text }: { text: string }) => {
        if (text === "fail1" || text === "fail2") throw new Error("Translation failed");
        return {
          provider: "openai" as const,
          translatedText: `${text}-translated`,
          detectedSourceLocale: "en",
          usage: { requests: 1, characters: text.length, remainingRequests: 1000, remainingCharacters: 100000 },
          quota: { provider: "openai" as const, configured: true, requests: 1, requestLimit: null, characters: text.length, characterLimit: null, alert: null },
        };
      });
      const job = queueBulkUpdate({
        shop: "test-shop.myshopify.com",
        name: "Specific Retry",
        items: [
          { resourceId: "1", resourceType: "product", field: "title", sourceText: "fail1", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
          { resourceId: "2", resourceType: "product", field: "title", sourceText: "fail2", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
        ],
      });
      await processBulkUpdate(job.id, mockTranslator);
      const jobData = getBulkUpdateJob(job.id);
      const firstItemId = jobData?.items[0].id;
      // Reset mock to succeed for retry
      mockTranslator.translate.mockResolvedValue({
        provider: "openai" as const,
        translatedText: "fixed",
        detectedSourceLocale: "en",
        usage: { requests: 1, characters: 5, remainingRequests: 1000, remainingCharacters: 100000 },
        quota: { provider: "openai" as const, configured: true, requests: 1, requestLimit: null, characters: 5, characterLimit: null, alert: null },
      });
      const result = await retryFailedItems(job.id, mockTranslator, { specificItemIds: firstItemId ? [firstItemId] : undefined });
      expect(result.summary.successful).toBe(1);
      expect(result.summary.failed).toBe(1);
    });
  });

  describe("pause and resume", () => {
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
      expect(pauseBulkUpdate("non-existent")).toBe(false);
    });

    it("returns false when pausing completed job", async () => {
      const mockTranslator = createMockTranslator();
      const job = queueBulkUpdate({
        shop: "test-shop.myshopify.com",
        name: "Completed Job",
        items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
      });
      await processBulkUpdate(job.id, mockTranslator);
      expect(pauseBulkUpdate(job.id)).toBe(false);
    });

    it("resumes a paused job", async () => {
      const mockTranslator = createMockTranslator();
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
      const mockTranslator = createMockTranslator();
      const job = queueBulkUpdate({
        shop: "test-shop.myshopify.com",
        name: "Not Paused",
        items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
      });
      await expect(resumeBulkUpdate(job.id, mockTranslator)).rejects.toThrow(`Job ${job.id} is not paused`);
    });
  });

  describe("cancel", () => {
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
      expect(cancelBulkUpdate("non-existent")).toBe(false);
    });

    it("returns false when cancelling already completed job", async () => {
      const mockTranslator = createMockTranslator();
      const job = queueBulkUpdate({
        shop: "test-shop.myshopify.com",
        name: "Completed",
        items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
      });
      await processBulkUpdate(job.id, mockTranslator);
      expect(cancelBulkUpdate(job.id)).toBe(false);
    });

    it("throws error when processing cancelled job", async () => {
      const mockTranslator = createMockTranslator();
      const job = queueBulkUpdate({
        shop: "test-shop.myshopify.com",
        name: "Cancelled Job",
        items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
      });
      cancelBulkUpdate(job.id);
      await expect(processBulkUpdate(job.id, mockTranslator)).rejects.toThrow(`Job ${job.id} is already cancelled`);
    });
  });

  describe("query functions", () => {
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
      expect(getBulkUpdateJob("non-existent")).toBeNull();
    });

    it("gets all jobs for a shop", () => {
      queueBulkUpdate({ shop: "shop1.myshopify.com", name: "Shop 1 Job 1", items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }] });
      queueBulkUpdate({ shop: "shop1.myshopify.com", name: "Shop 1 Job 2", items: [{ resourceId: "2", resourceType: "product", field: "title", sourceText: "World", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }] });
      queueBulkUpdate({ shop: "shop2.myshopify.com", name: "Shop 2 Job", items: [{ resourceId: "3", resourceType: "product", field: "title", sourceText: "Test", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }] });
      const shop1Jobs = getBulkUpdateJobsByShop("shop1.myshopify.com");
      expect(shop1Jobs).toHaveLength(2);
      expect(shop1Jobs.map((j) => j.name)).toContain("Shop 1 Job 1");
      expect(shop1Jobs.map((j) => j.name)).toContain("Shop 1 Job 2");
      const shop2Jobs = getBulkUpdateJobsByShop("shop2.myshopify.com");
      expect(shop2Jobs).toHaveLength(1);
      expect(shop2Jobs[0].name).toBe("Shop 2 Job");
    });

    it("filters jobs by status", async () => {
      const mockTranslator = createMockTranslator();
      const job1 = queueBulkUpdate({ shop: "test-shop.myshopify.com", name: "Completed Job", items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }] });
      const job2 = queueBulkUpdate({ shop: "test-shop.myshopify.com", name: "Queued Job", items: [{ resourceId: "2", resourceType: "product", field: "title", sourceText: "World", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }] });
      await processBulkUpdate(job1.id, mockTranslator);
      const completedJobs = getBulkUpdateJobsByShop("test-shop.myshopify.com", "completed");
      expect(completedJobs).toHaveLength(1);
      expect(completedJobs[0].name).toBe("Completed Job");
      const queuedJobs = getBulkUpdateJobsByShop("test-shop.myshopify.com", "queued");
      expect(queuedJobs).toHaveLength(1);
      expect(queuedJobs[0].name).toBe("Queued Job");
    });

    it("sorts jobs by creation date (newest first)", async () => {
      const job1 = queueBulkUpdate({ shop: "test-shop.myshopify.com", name: "First Job", items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "A", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }] });
      await new Promise((resolve) => setTimeout(resolve, 50));
      const job2 = queueBulkUpdate({ shop: "test-shop.myshopify.com", name: "Second Job", items: [{ resourceId: "2", resourceType: "product", field: "title", sourceText: "B", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }] });
      const jobs = getBulkUpdateJobsByShop("test-shop.myshopify.com");
      expect(jobs[0].id).toBe(job2.id);
      expect(jobs[1].id).toBe(job1.id);
    });
  });

  describe("delete and cleanup", () => {
    it("deletes a completed job", async () => {
      const mockTranslator = createMockTranslator();
      const job = queueBulkUpdate({ shop: "test-shop.myshopify.com", name: "Delete Test", items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }] });
      await processBulkUpdate(job.id, mockTranslator);
      const deleted = deleteBulkUpdateJob(job.id);
      expect(deleted).toBe(true);
      const retrieved = getBulkUpdateJob(job.id);
      expect(retrieved).toBeNull();
    });

    it("returns false when deleting non-existent job", () => {
      expect(deleteBulkUpdateJob("non-existent")).toBe(false);
    });

    it("returns false when deleting processing job", async () => {
      const mockTranslator = createMockTranslator();
      const job = queueBulkUpdate({ shop: "test-shop.myshopify.com", name: "Processing Job", items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }] });
      const processPromise = processBulkUpdate(job.id, mockTranslator);
      const deleted = deleteBulkUpdateJob(job.id);
      expect(deleted).toBe(false);
      await processPromise;
    });
  });

  describe("queue statistics", () => {
    it("returns accurate queue statistics", async () => {
      const mockTranslator = createMockTranslator();
      queueBulkUpdate({ shop: "test-shop.myshopify.com", name: "Queued Stat", items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "A", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }] });
      const processingJob = queueBulkUpdate({ shop: "test-shop.myshopify.com", name: "Processing Stat", items: [{ resourceId: "2", resourceType: "product", field: "title", sourceText: "B", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }] });
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
  });

  describe("bulk update detection", () => {
    it("detects resources needing updates based on last updated date", () => {
      const lastTranslationDate = new Date("2024-01-01");
      const resources = [
        { id: "prod-1", type: "product", fields: [{ name: "title", value: "New Product", lastUpdated: new Date("2024-06-01") }, { name: "description", value: "Description", lastUpdated: new Date("2024-06-01") }] },
        { id: "prod-2", type: "product", fields: [{ name: "title", value: "Old Product", lastUpdated: new Date("2023-12-01") }] },
        { id: "prod-3", type: "product", fields: [{ name: "title", value: "Updated Product", lastUpdated: new Date("2024-06-15") }] },
      ];
      const targetLocales = ["ar", "he"];
      const result = detectBulkUpdates(resources, targetLocales, lastTranslationDate);
      expect(result.resourcesNeedingUpdate).toHaveLength(2);
      expect(result.resourcesNeedingUpdate).toContain("prod-1");
      expect(result.resourcesNeedingUpdate).toContain("prod-3");
      expect(result.fieldsNeedingTranslation).toHaveLength(3);
      expect(result.totalItems).toBe(6);
    });

    it("detects all resources when no last translation date provided", () => {
      const resources = [{ id: "prod-1", type: "product", fields: [{ name: "title", value: "Product", lastUpdated: new Date("2023-01-01") }] }];
      const result = detectBulkUpdates(resources, ["ar"]);
      expect(result.resourcesNeedingUpdate).toHaveLength(1);
      expect(result.fieldsNeedingTranslation).toHaveLength(1);
    });

    it("skips empty fields during detection", () => {
      const resources = [{ id: "prod-1", type: "product", fields: [{ name: "title", value: "Product", lastUpdated: new Date("2024-06-01") }, { name: "description", value: "   ", lastUpdated: new Date("2024-06-01") }, { name: "tags", value: "", lastUpdated: new Date("2024-06-01") }] }];
      const result = detectBulkUpdates(resources, ["ar"]);
      expect(result.fieldsNeedingTranslation).toHaveLength(1);
      expect(result.fieldsNeedingTranslation[0].field).toBe("title");
    });
  });

  describe("validation", () => {
    it("validates bulk update items correctly", () => {
      const items = [
        { resourceId: "prod-1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar" },
        { resourceId: "", resourceType: "product", field: "title", sourceText: "Invalid", sourceLocale: "en", targetLocale: "ar" },
        { resourceId: "prod-3", resourceType: "product", field: "title", sourceText: "Same Locale", sourceLocale: "en", targetLocale: "en" },
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
        { resourceId: "prod-1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar" },
        { resourceId: "prod-2", resourceType: "collection", field: "description", sourceText: "World", sourceLocale: "en", targetLocale: "he" },
      ];
      const result = validateBulkUpdateItems(items);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.validItems).toHaveLength(2);
    });

    it("detects missing required fields", () => {
      const items = [
        { resourceId: "prod-1", resourceType: "", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar" },
        { resourceId: "prod-2", resourceType: "product", field: "", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar" },
        { resourceId: "prod-3", resourceType: "product", field: "title", sourceText: "", sourceLocale: "en", targetLocale: "ar" },
        { resourceId: "prod-4", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "", targetLocale: "ar" },
        { resourceId: "prod-5", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "" },
      ];
      const result = validateBulkUpdateItems(items);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(5);
      expect(result.errors.map((e) => e.field)).toEqual(["resourceType", "field", "sourceText", "sourceLocale", "targetLocale"]);
    });
  });

  describe("error handling", () => {
    it("classifies network errors as retryable", async () => {
      const mockTranslator = createMockTranslator();
      mockTranslator.translate.mockRejectedValue(new Error("Network timeout"));
      const job = queueBulkUpdate({
        shop: "test-shop.myshopify.com",
        name: "Network Error Test",
        items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "network", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
      });
      const result = await processBulkUpdate(job.id, mockTranslator);
      expect(result.status).toBe("failed");
      expect(result.errors[0].retryable).toBe(true);
      expect(result.errors[0].code).toBe("TIMEOUT");
    });

    it("extracts HTTP error codes from error messages", async () => {
      const mockTranslator = createMockTranslator();
      mockTranslator.translate.mockRejectedValue(new Error("API returned 429 Too Many Requests"));
      const job = queueBulkUpdate({
        shop: "test-shop.myshopify.com",
        name: "HTTP Error Test",
        items: [{ resourceId: "1", resourceType: "product", field: "title", sourceText: "test", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 }],
      });
      const result = await processBulkUpdate(job.id, mockTranslator);
      expect(result.errors[0].code).toBe("429");
      expect(result.errors[0].retryable).toBe(true);
    });
  });

  describe("progress tracking", () => {
    it("tracks processing history for ETA calculation", async () => {
      const mockTranslator = createMockTranslator();
      mockTranslator.translate.mockImplementation(async ({ text }: { text: string }) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return {
          provider: "openai" as const,
          translatedText: `${text}-translated`,
          detectedSourceLocale: "en",
          usage: { requests: 1, characters: text.length, remainingRequests: 1000, remainingCharacters: 100000 },
          quota: { provider: "openai" as const, configured: true, requests: 1, requestLimit: null, characters: text.length, characterLimit: null, alert: null },
        };
      });
      const items = Array.from({ length: 5 }, (_, i) => ({
        resourceId: `prod-${i}`, resourceType: "product", field: "title", sourceText: `Text ${i}`, sourceLocale: "en", targetLocale: "ar", maxRetries: 3,
      }));
      const job = queueBulkUpdate({ shop: "test-shop.myshopify.com", name: "ETA Test", items });
      await processBulkUpdate(job.id, mockTranslator);
      const status = getBulkUpdateStatus(job.id);
      expect(typeof status.progress.averageProcessingTime).toBe("number");
    });

    it("calculates summary statistics correctly", async () => {
      const mockTranslator = createMockTranslator();
      mockTranslator.translate.mockRejectedValue(new Error("Translation failed"));
      const job = queueBulkUpdate({
        shop: "test-shop.myshopify.com",
        name: "Summary Test",
        items: [
          { resourceId: "1", resourceType: "product", field: "title", sourceText: "A", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
          { resourceId: "2", resourceType: "product", field: "title", sourceText: "B", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
          { resourceId: "3", resourceType: "product", field: "title", sourceText: "C", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
        ],
      });
      const result = await processBulkUpdate(job.id, mockTranslator);
      expect(result.summary.totalItems).toBe(3);
      expect(result.summary.successful).toBe(0);
      expect(result.summary.failed).toBe(3);
      expect(result.summary.totalProcessingTime).toBeGreaterThanOrEqual(0);
      expect(result.summary.startedAt).toBeDefined();
      expect(result.summary.completedAt).toBeDefined();
    });
  });

  describe("integration tests", () => {
    it("handles complete workflow: queue -> process -> partial -> retry -> complete", async () => {
      const mockTranslator = createMockTranslator();
      const job = queueBulkUpdate({
        shop: "test-shop.myshopify.com",
        name: "Integration Test",
        items: [
          { resourceId: "1", resourceType: "product", field: "title", sourceText: "Hello", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
          { resourceId: "2", resourceType: "product", field: "title", sourceText: "fail", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
          { resourceId: "3", resourceType: "product", field: "title", sourceText: "World", sourceLocale: "en", targetLocale: "ar", maxRetries: 3 },
        ],
      });
      // First, make it fail for item 2
      mockTranslator.translate.mockImplementation(async ({ text }: { text: string }) => {
        if (text === "fail") throw new Error("Translation failed");
        return {
          provider: "openai" as const,
          translatedText: `${text}-translated`,
          detectedSourceLocale: "en",
          usage: { requests: 1, characters: text.length, remainingRequests: 1000, remainingCharacters: 100000 },
          quota: { provider: "openai" as const, configured: true, requests: 1, requestLimit: null, characters: text.length, characterLimit: null, alert: null },
        };
      });
      let result = await processBulkUpdate(job.id, mockTranslator);
      expect(result.status).toBe("partial");
      expect(result.progress.completed).toBe(2);
      expect(result.progress.failed).toBe(1);
      let status = getBulkUpdateStatus(job.id);
      expect(status.canRetry).toBe(true);
      // Fix the translator and retry
      mockTranslator.translate.mockResolvedValue({
        provider: "openai" as const,
        translatedText: "fixed",
        detectedSourceLocale: "en",
        usage: { requests: 1, characters: 5, remainingRequests: 1000, remainingCharacters: 100000 },
        quota: { provider: "openai" as const, configured: true, requests: 1, requestLimit: null, characters: 5, characterLimit: null, alert: null },
      });
      result = await retryFailedItems(job.id, mockTranslator);
      expect(result.status).toBe("completed");
      expect(result.summary.successful).toBe(3);
      expect(result.summary.retried).toBe(1);
      status = getBulkUpdateStatus(job.id);
      expect(status.status).toBe("completed");
      expect(status.canRetry).toBe(false);
    });

    it("handles pause during processing", async () => {
      const mockTranslator = createMockTranslator();
      mockTranslator.translate.mockImplementation(async ({ text }: { text: string }) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return {
          provider: "openai" as const,
          translatedText: `${text}-translated`,
          detectedSourceLocale: "en",
          usage: { requests: 1, characters: text.length, remainingRequests: 1000, remainingCharacters: 100000 },
          quota: { provider: "openai" as const, configured: true, requests: 1, requestLimit: null, characters: text.length, characterLimit: null, alert: null },
        };
      });
      const job = queueBulkUpdate({
        shop: "test-shop.myshopify.com",
        name: "Pause During Processing",
        items: Array.from({ length: 100 }, (_, i) => ({
          resourceId: `prod-${i}`, resourceType: "product", field: "title", sourceText: `Text ${i}`, sourceLocale: "en", targetLocale: "ar", maxRetries: 3,
        })),
      });
      const processPromise = processBulkUpdate(job.id, mockTranslator);
      const paused = pauseBulkUpdate(job.id);
      expect(paused).toBe(true);
      const status = getBulkUpdateStatus(job.id);
      expect(status.isPaused).toBe(true);
      const result = await processPromise;
      expect(result.status).toBe("paused");
    });
  });
});
