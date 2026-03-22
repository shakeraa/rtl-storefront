import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearBatchesForTesting,
  createBatch,
  getBatchStatus,
  processBatch,
  splitIntoBatches,
  translateRequestsInBatches,
  type BatchRequest,
} from "../../app/services/performance/batch-translator";

describe("batch-translator", () => {
  beforeEach(() => {
    clearBatchesForTesting();
  });

  it("splits requests into bounded chunks", () => {
    const requests: BatchRequest[] = [
      { id: "1", text: "a", sourceLocale: "en", targetLocale: "ar" },
      { id: "2", text: "b", sourceLocale: "en", targetLocale: "ar" },
      { id: "3", text: "c", sourceLocale: "en", targetLocale: "ar" },
    ];

    expect(splitIntoBatches(requests, 2)).toEqual([
      [
        { id: "1", text: "a", sourceLocale: "en", targetLocale: "ar" },
        { id: "2", text: "b", sourceLocale: "en", targetLocale: "ar" },
      ],
      [{ id: "3", text: "c", sourceLocale: "en", targetLocale: "ar" }],
    ]);
  });

  it("deduplicates identical requests and preserves original order", async () => {
    const translator = {
      translate: vi.fn(async ({ text }) => ({
        provider: "openai" as const,
        translatedText: `${text}-translated`,
        cached: false,
        fallbackUsed: false,
        usage: {
          requests: 1,
          characters: text.length,
          remainingRequests: null,
          remainingCharacters: null,
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

    const summary = await translateRequestsInBatches(
      [
        { id: "1", text: "Hello", sourceLocale: "en", targetLocale: "ar" },
        { id: "2", text: "Hello", sourceLocale: "en", targetLocale: "ar" },
        { id: "3", text: "Bye", sourceLocale: "en", targetLocale: "ar" },
      ],
      translator,
      { maxBatchSize: 2, concurrency: 2 },
    );

    expect(translator.translate).toHaveBeenCalledTimes(2);
    expect(summary.uniqueRequests).toBe(2);
    expect(summary.batchCount).toBe(1);
    expect(summary.results).toEqual([
      {
        id: "1",
        translatedText: "Hello-translated",
        provider: "openai",
        cached: false,
        fallbackUsed: false,
      },
      {
        id: "2",
        translatedText: "Hello-translated",
        provider: "openai",
        cached: false,
        fallbackUsed: false,
      },
      {
        id: "3",
        translatedText: "Bye-translated",
        provider: "openai",
        cached: false,
        fallbackUsed: false,
      },
    ]);
    expect(getBatchStatus(summary.batchId)).toEqual({
      total: 3,
      completed: 3,
      results: summary.results,
    });
  });

  it("processes existing batches and records per-request errors", async () => {
    const batchId = createBatch([
      { id: "1", text: "Hello", sourceLocale: "en", targetLocale: "ar" },
      { id: "2", text: "Fail", sourceLocale: "en", targetLocale: "ar" },
      { id: "3", text: "Later", sourceLocale: "en", targetLocale: "ar" },
    ]);
    const translator = {
      translate: vi.fn(async ({ text }) => {
        if (text === "Fail") {
          throw new Error("provider failure");
        }

        return {
          provider: "google" as const,
          translatedText: `${text}-ok`,
          cached: true,
          fallbackUsed: false,
          usage: {
            requests: 1,
            characters: text.length,
            remainingRequests: null,
            remainingCharacters: null,
          },
          quota: {
            provider: "google" as const,
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

    const summary = await processBatch(batchId, translator, {
      maxBatchSize: 2,
      concurrency: 1,
    });

    expect(summary).toEqual({
      batchId,
      total: 3,
      completed: 3,
      uniqueRequests: 3,
      batchCount: 2,
      results: [
        {
          id: "1",
          translatedText: "Hello-ok",
          provider: "google",
          cached: true,
          fallbackUsed: false,
        },
        {
          id: "2",
          translatedText: "",
          error: "provider failure",
        },
        {
          id: "3",
          translatedText: "Later-ok",
          provider: "google",
          cached: true,
          fallbackUsed: false,
        },
      ],
    });
  });
});
