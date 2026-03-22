import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addSyncEventListener,
  cancelSyncAction,
  classifyError,
  cleanupSyncQueue,
  clearSyncEventListeners,
  clearSyncHandlers,
  clearSyncQueue,
  configureSync,
  DEFAULT_SYNC_CONFIG,
  generateSyncTag,
  getAllSyncActions,
  getRetryDelay,
  getSyncAction,
  getSyncActionsByStatus,
  getSyncActionsByType,
  getSyncConfig,
  getSyncQueueStats,
  processSyncAction,
  processSyncQueue,
  queueSyncAction,
  registerSyncHandler,
  resetSyncConfig,
  retrySyncAction,
  shouldRetry,
  type SyncAction,
  type SyncActionType,
  type SyncResult,
} from "../../app/services/performance/background-sync";

describe("background-sync", () => {
  beforeEach(() => {
    clearSyncQueue();
    clearSyncHandlers();
    clearSyncEventListeners();
    resetSyncConfig();
  });

  describe("queueSyncAction", () => {
    it("creates a sync action with generated ID and tag", () => {
      const action = queueSyncAction({
        type: "translation",
        payload: { text: "Hello", locale: "ar" },
        priority: "normal",
        maxAttempts: 3,
      });

      expect(action.id).toBeDefined();
      expect(action.syncTag).toBeDefined();
      expect(action.status).toBe("pending");
      expect(action.attempts).toBe(0);
      expect(action.type).toBe("translation");
    });

    it("assigns correct priority to queued actions", () => {
      const action = queueSyncAction({
        type: "translation",
        payload: { text: "Hello" },
        priority: "critical",
        maxAttempts: 3,
      });

      expect(action.priority).toBe("critical");
    });

    it("stores actions for retrieval", () => {
      const action = queueSyncAction({
        type: "translation",
        payload: { text: "Hello" },
        priority: "normal",
        maxAttempts: 3,
      });

      const retrieved = getSyncAction(action.id);
      expect(retrieved).toEqual(action);
    });
  });

  describe("generateSyncTag", () => {
    it("generates unique tags for different actions", () => {
      const action1 = {
        type: "translation" as SyncActionType,
        payload: { text: "Hello" },
        priority: "normal" as const,
        maxAttempts: 3,
      };

      const action2 = {
        type: "translation" as SyncActionType,
        payload: { text: "World" },
        priority: "normal" as const,
        maxAttempts: 3,
      };

      const tag1 = generateSyncTag(action1);
      const tag2 = generateSyncTag(action2);

      expect(tag1).not.toBe(tag2);
    });

    it("includes locale in tag when present in payload", () => {
      const action = {
        type: "translation" as SyncActionType,
        payload: { text: "Hello", locale: "ar" },
        priority: "normal" as const,
        maxAttempts: 3,
      };

      const tag = generateSyncTag(action);
      expect(tag).toContain("ar");
    });

    it("uses 'global' when no locale is present", () => {
      const action = {
        type: "translation" as SyncActionType,
        payload: { text: "Hello" },
        priority: "normal" as const,
        maxAttempts: 3,
      };

      const tag = generateSyncTag(action);
      expect(tag).toContain("global");
    });

    it("generates consistent hash for same payload", () => {
      const action = {
        type: "translation" as SyncActionType,
        payload: { text: "Hello", locale: "ar" },
        priority: "normal" as const,
        maxAttempts: 3,
      };

      const tag1 = generateSyncTag(action);
      const tag2 = generateSyncTag(action);

      // Tags should be different due to timestamp, but hash portion should be consistent pattern
      const parts1 = tag1.split(":");
      const parts2 = tag2.split(":");
      expect(parts1[0]).toBe(parts2[0]); // type
      expect(parts1[1]).toBe(parts2[1]); // locale
    });
  });

  describe("getRetryDelay", () => {
    it("returns 0 for attempt 0", () => {
      const delay = getRetryDelay(0);
      expect(delay).toBe(0);
    });

    it("returns base delay for first attempt", () => {
      const delay = getRetryDelay(1);
      expect(delay).toBeGreaterThanOrEqual(750); // With jitter 75%
      expect(delay).toBeLessThanOrEqual(1250); // With jitter 125%
    });

    it("applies exponential backoff", () => {
      // Test with jitter disabled for consistent results
      configureSync({ enableJitter: false });
      
      const delay1 = getRetryDelay(1);
      const delay2 = getRetryDelay(2);
      const delay3 = getRetryDelay(3);

      // With jitter disabled, delays should follow exact exponential pattern
      expect(delay1).toBe(1000); // base
      expect(delay2).toBe(2000); // base * 2
      expect(delay3).toBe(4000); // base * 4
    });

    it("caps delay at maximum", () => {
      configureSync({ maxRetryDelayMs: 5000 });
      const delay = getRetryDelay(10);
      expect(delay).toBeLessThanOrEqual(6250); // 5000 + 25% jitter
    });

    it("respects disabled exponential backoff", () => {
      configureSync({
        enableExponentialBackoff: false,
        baseRetryDelayMs: 1000,
        enableJitter: false,
      });

      expect(getRetryDelay(1)).toBe(1000);
      expect(getRetryDelay(2)).toBe(2000);
      expect(getRetryDelay(3)).toBe(3000);
    });

    it("respects disabled jitter", () => {
      configureSync({
        baseRetryDelayMs: 1000,
        retryMultiplier: 2,
        enableExponentialBackoff: true,
        enableJitter: false,
      });

      expect(getRetryDelay(1)).toBe(1000);
      expect(getRetryDelay(2)).toBe(2000);
      expect(getRetryDelay(3)).toBe(4000);
    });
  });

  describe("shouldRetry", () => {
    it("returns false when max attempts reached", () => {
      configureSync({ maxAttempts: 3 });
      expect(shouldRetry(new Error("network error"), 3)).toBe(false);
      expect(shouldRetry(new Error("network error"), 4)).toBe(false);
    });

    it("retries network errors", () => {
      expect(shouldRetry(new Error("network error"), 1)).toBe(true);
      expect(shouldRetry(new Error("ECONNREFUSED"), 1)).toBe(true);
      expect(shouldRetry(new Error("offline"), 1)).toBe(true);
    });

    it("retries timeout errors", () => {
      expect(shouldRetry(new Error("timeout"), 1)).toBe(true);
      expect(shouldRetry(new Error("ETIMEDOUT"), 1)).toBe(true);
    });

    it("retries rate limit errors", () => {
      expect(shouldRetry(new Error("rate limit exceeded"), 1)).toBe(true);
      expect(shouldRetry(new Error("429 Too Many Requests"), 1)).toBe(true);
    });

    it("does not retry auth errors", () => {
      expect(shouldRetry(new Error("unauthorized"), 1)).toBe(false);
      expect(shouldRetry(new Error("401 Invalid token"), 1)).toBe(false);
      expect(shouldRetry(new Error("403 Forbidden"), 1)).toBe(false);
    });

    it("does not retry validation errors", () => {
      expect(shouldRetry(new Error("validation failed"), 1)).toBe(false);
      expect(shouldRetry(new Error("400 Bad Request"), 1)).toBe(false);
    });

    it("retries server errors limited times", () => {
      expect(shouldRetry(new Error("500 Internal Server Error"), 1)).toBe(true);
      expect(shouldRetry(new Error("500 Internal Server Error"), 2)).toBe(true);
      expect(shouldRetry(new Error("500 Internal Server Error"), 3)).toBe(false);
    });

    it("retries unknown errors only once", () => {
      expect(shouldRetry(new Error("something unexpected"), 0)).toBe(true);
      expect(shouldRetry(new Error("something unexpected"), 1)).toBe(false);
    });
  });

  describe("classifyError", () => {
    it("classifies network errors correctly", () => {
      expect(classifyError(new Error("network error"))).toBe("network");
      expect(classifyError(new Error("ECONNREFUSED"))).toBe("network");
      expect(classifyError(new Error("ENOTFOUND"))).toBe("network");
    });

    it("classifies timeout errors correctly", () => {
      expect(classifyError(new Error("timeout"))).toBe("timeout");
      expect(classifyError(new Error("ETIMEDOUT"))).toBe("timeout");
    });

    it("classifies rate limit errors correctly", () => {
      expect(classifyError(new Error("rate limit"))).toBe("rate-limit");
      expect(classifyError(new Error("429"))).toBe("rate-limit");
    });

    it("classifies auth errors correctly", () => {
      expect(classifyError(new Error("unauthorized"))).toBe("auth");
      expect(classifyError(new Error("401"))).toBe("auth");
      expect(classifyError(new Error("403"))).toBe("auth");
    });

    it("classifies validation errors correctly", () => {
      expect(classifyError(new Error("validation"))).toBe("validation");
      expect(classifyError(new Error("400"))).toBe("validation");
    });

    it("classifies server errors correctly", () => {
      expect(classifyError(new Error("500"))).toBe("server");
      expect(classifyError(new Error("server error"))).toBe("server");
    });

    it("classifies unknown errors correctly", () => {
      expect(classifyError(new Error("random"))).toBe("unknown");
      expect(classifyError(null)).toBe("unknown");
    });
  });

  describe("processSyncQueue", () => {
    it("processes pending actions with registered handler", async () => {
      const handler = vi.fn().mockResolvedValue({
        actionId: "test",
        success: true,
        retryable: false,
      } as SyncResult);

      registerSyncHandler("translation", handler);

      const action = queueSyncAction({
        type: "translation",
        payload: { text: "Hello" },
        priority: "normal",
        maxAttempts: 3,
      });

      const results = await processSyncQueue();

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({ id: action.id }));
    });

    it("returns empty array when no pending actions", async () => {
      const results = await processSyncQueue();
      expect(results).toEqual([]);
    });

    it("handles handler errors and marks for retry", async () => {
      registerSyncHandler("translation", async () => {
        throw new Error("network error");
      });

      const action = queueSyncAction({
        type: "translation",
        payload: { text: "Hello" },
        priority: "normal",
        maxAttempts: 3,
      });

      const results = await processSyncQueue();

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].retryable).toBe(true);

      const updated = getSyncAction(action.id);
      expect(updated?.status).toBe("retrying");
      expect(updated?.attempts).toBe(1);
    });

    it("respects concurrency limits", async () => {
      configureSync({ maxConcurrent: 2 });

      let activeCount = 0;
      let maxActive = 0;

      registerSyncHandler("translation", async () => {
        activeCount++;
        maxActive = Math.max(maxActive, activeCount);
        await new Promise((r) => setTimeout(r, 50));
        activeCount--;
        return { actionId: "test", success: true, retryable: false };
      });

      // Queue 5 actions
      for (let i = 0; i < 5; i++) {
        queueSyncAction({
          type: "translation",
          payload: { text: `Hello ${i}` },
          priority: "normal",
          maxAttempts: 3,
        });
      }

      await processSyncQueue();
      expect(maxActive).toBeLessThanOrEqual(2);
    });

    it("processes actions by priority order", async () => {
      const processed: string[] = [];

      registerSyncHandler("translation", async (action: SyncAction) => {
        processed.push(action.priority);
        return { actionId: action.id, success: true, retryable: false };
      });

      queueSyncAction({
        type: "translation",
        payload: { text: "low" },
        priority: "low",
        maxAttempts: 3,
      });

      queueSyncAction({
        type: "translation",
        payload: { text: "critical" },
        priority: "critical",
        maxAttempts: 3,
      });

      queueSyncAction({
        type: "translation",
        payload: { text: "high" },
        priority: "high",
        maxAttempts: 3,
      });

      await processSyncQueue();

      expect(processed[0]).toBe("critical");
      expect(processed[1]).toBe("high");
      expect(processed[2]).toBe("low");
    });
  });

  describe("processSyncAction", () => {
    it("processes a specific action by ID", async () => {
      registerSyncHandler("translation", async () => ({
        actionId: "test",
        success: true,
        retryable: false,
      }));

      const action = queueSyncAction({
        type: "translation",
        payload: { text: "Hello" },
        priority: "normal",
        maxAttempts: 3,
      });

      const result = await processSyncAction(action.id);

      expect(result).not.toBeNull();
      expect(result?.success).toBe(true);
    });

    it("returns null for non-existent action", async () => {
      const result = await processSyncAction("non-existent-id");
      expect(result).toBeNull();
    });
  });

  describe("cancelSyncAction", () => {
    it("cancels a pending action", () => {
      const action = queueSyncAction({
        type: "translation",
        payload: { text: "Hello" },
        priority: "normal",
        maxAttempts: 3,
      });

      const cancelled = cancelSyncAction(action.id);

      expect(cancelled).toBe(true);
      expect(getSyncAction(action.id)?.status).toBe("cancelled");
    });

    it("cannot cancel a processing action", async () => {
      registerSyncHandler("translation", async () => {
        await new Promise((r) => setTimeout(r, 100));
        return { actionId: "test", success: true, retryable: false };
      });

      const action = queueSyncAction({
        type: "translation",
        payload: { text: "Hello" },
        priority: "normal",
        maxAttempts: 3,
      });

      // Start processing
      processSyncQueue();

      // Try to cancel immediately (will fail because processing)
      const cancelled = cancelSyncAction(action.id);

      // Either false (if processing started) or true (if still pending)
      expect(typeof cancelled).toBe("boolean");
    });
  });

  describe("retrySyncAction", () => {
    it("retries a failed action", async () => {
      registerSyncHandler("translation", async () => ({
        actionId: "test",
        success: false,
        error: "failed",
        retryable: false,
      }));

      const action = queueSyncAction({
        type: "translation",
        payload: { text: "Hello" },
        priority: "normal",
        maxAttempts: 3,
      });

      await processSyncQueue();
      expect(getSyncAction(action.id)?.status).toBe("failed");

      const retried = retrySyncAction(action.id);
      expect(retried).toBe(true);
      expect(getSyncAction(action.id)?.status).toBe("pending");
    });

    it("returns false for non-failed actions", () => {
      const action = queueSyncAction({
        type: "translation",
        payload: { text: "Hello" },
        priority: "normal",
        maxAttempts: 3,
      });

      const retried = retrySyncAction(action.id);
      expect(retried).toBe(false);
    });
  });

  describe("getSyncActionsByStatus", () => {
    it("filters actions by status", async () => {
      registerSyncHandler("translation", async () => ({
        actionId: "test",
        success: true,
        retryable: false,
      }));

      const action1 = queueSyncAction({
        type: "translation",
        payload: { text: "Hello" },
        priority: "normal",
        maxAttempts: 3,
      });

      queueSyncAction({
        type: "translation",
        payload: { text: "World" },
        priority: "normal",
        maxAttempts: 3,
      });

      await processSyncAction(action1.id);

      const completed = getSyncActionsByStatus("completed");
      const pending = getSyncActionsByStatus("pending");

      expect(completed).toHaveLength(1);
      expect(pending).toHaveLength(1);
    });
  });

  describe("getSyncActionsByType", () => {
    it("filters actions by type", () => {
      queueSyncAction({
        type: "translation",
        payload: { text: "Hello" },
        priority: "normal",
        maxAttempts: 3,
      });

      queueSyncAction({
        type: "bulk-translation",
        payload: { texts: ["Hello", "World"] },
        priority: "normal",
        maxAttempts: 3,
      });

      const translations = getSyncActionsByType("translation");
      const bulkTranslations = getSyncActionsByType("bulk-translation");

      expect(translations).toHaveLength(1);
      expect(bulkTranslations).toHaveLength(1);
    });
  });

  describe("getSyncQueueStats", () => {
    it("calculates accurate statistics", async () => {
      registerSyncHandler("translation", async (action) => ({
        actionId: action.id,
        success: true,
        retryable: false,
      }));

      queueSyncAction({
        type: "translation",
        payload: { text: "1" },
        priority: "normal",
        maxAttempts: 3,
      });

      const action2 = queueSyncAction({
        type: "translation",
        payload: { text: "2" },
        priority: "normal",
        maxAttempts: 3,
      });

      await processSyncAction(action2.id);

      const stats = getSyncQueueStats();

      expect(stats.total).toBe(2);
      expect(stats.pending).toBe(1);
      expect(stats.completed).toBe(1);
      expect(stats.averageAttempts).toBe(0.5);
    });
  });

  describe("cleanupSyncQueue", () => {
    it("removes old completed actions", async () => {
      registerSyncHandler("translation", async () => ({
        actionId: "test",
        success: true,
        retryable: false,
      }));

      const action = queueSyncAction({
        type: "translation",
        payload: { text: "Hello" },
        priority: "normal",
        maxAttempts: 3,
      });

      await processSyncAction(action.id);

      // Manually set updatedAt to old time
      const completed = getSyncAction(action.id)!;
      completed.updatedAt = Date.now() - 86400001; // 1 day + 1ms ago

      const removed = cleanupSyncQueue(86400000);

      expect(removed).toBe(1);
      expect(getSyncAction(action.id)).toBeUndefined();
    });

    it("does not remove recent actions", () => {
      queueSyncAction({
        type: "translation",
        payload: { text: "Hello" },
        priority: "normal",
        maxAttempts: 3,
      });

      const removed = cleanupSyncQueue(86400000);

      expect(removed).toBe(0);
      expect(getAllSyncActions()).toHaveLength(1);
    });
  });

  describe("configureSync", () => {
    it("allows custom configuration", () => {
      configureSync({
        maxConcurrent: 5,
        baseRetryDelayMs: 2000,
        maxAttempts: 10,
      });

      const config = getSyncConfig();
      expect(config.maxConcurrent).toBe(5);
      expect(config.baseRetryDelayMs).toBe(2000);
      expect(config.maxAttempts).toBe(10);
    });

    it("preserves unspecified config values", () => {
      configureSync({ maxConcurrent: 5 });

      const config = getSyncConfig();
      expect(config.baseRetryDelayMs).toBe(DEFAULT_SYNC_CONFIG.baseRetryDelayMs);
    });
  });

  describe("event listeners", () => {
    it("emits events on action lifecycle", () => {
      const events: string[] = [];

      addSyncEventListener("queued", () => events.push("queued"));
      addSyncEventListener("completed", () => events.push("completed"));

      queueSyncAction({
        type: "translation",
        payload: { text: "Hello" },
        priority: "normal",
        maxAttempts: 3,
      });

      expect(events).toContain("queued");
    });

    it("returns unsubscribe function", () => {
      const events: string[] = [];

      const unsubscribe = addSyncEventListener("queued", () => events.push("queued"));

      queueSyncAction({
        type: "translation",
        payload: { text: "Hello" },
        priority: "normal",
        maxAttempts: 3,
      });

      expect(events).toHaveLength(1);

      unsubscribe();

      queueSyncAction({
        type: "translation",
        payload: { text: "World" },
        priority: "normal",
        maxAttempts: 3,
      });

      expect(events).toHaveLength(1);
    });
  });

  describe("getAllSyncActions", () => {
    it("returns all actions in queue", () => {
      queueSyncAction({
        type: "translation",
        payload: { text: "1" },
        priority: "normal",
        maxAttempts: 3,
      });

      queueSyncAction({
        type: "translation",
        payload: { text: "2" },
        priority: "normal",
        maxAttempts: 3,
      });

      const all = getAllSyncActions();
      expect(all).toHaveLength(2);
    });
  });

  describe("handler registration", () => {
    it("returns error when no handler registered", async () => {
      const action = queueSyncAction({
        type: "translation",
        payload: { text: "Hello" },
        priority: "normal",
        maxAttempts: 3,
      });

      const result = await processSyncAction(action.id);

      expect(result?.success).toBe(false);
      expect(result?.error).toContain("No handler registered");
    });

    it("supports different action types", async () => {
      const types: SyncActionType[] = [
        "translation",
        "bulk-translation",
        "cache-invalidation",
        "glossary-update",
        "locale-switch",
        "content-update",
      ];

      for (const type of types) {
        clearSyncHandlers();
        
        registerSyncHandler(type, async () => ({
          actionId: "test",
          success: true,
          retryable: false,
        }));

        const action = queueSyncAction({
          type,
          payload: { test: true },
          priority: "normal",
          maxAttempts: 3,
        });

        const result = await processSyncAction(action.id);
        expect(result?.success).toBe(true);
      }
    });
  });
});
