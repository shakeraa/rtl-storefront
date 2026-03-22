/**
 * T0163 / T0171 — Batch translation request utilities
 *
 * Groups translation requests into batches, deduplicates identical
 * translation inputs, executes them in bounded chunks, and tracks
 * progress in-memory for polling.
 */

import { randomUUID } from "node:crypto";
import type {
  TranslationEngineInput,
  TranslationProviderName,
  TranslationResult,
} from "../translation";

export interface BatchRequest {
  id: string;
  text: string;
  sourceLocale: string;
  targetLocale: string;
  context?: string;
  format?: TranslationEngineInput["format"];
  preferredProvider?: TranslationProviderName;
  bypassCache?: boolean;
}

export interface BatchResult {
  id: string;
  translatedText: string;
  provider?: TranslationProviderName;
  cached?: boolean;
  fallbackUsed?: boolean;
  error?: string;
}

export interface BatchTranslator {
  translate(input: TranslationEngineInput): Promise<TranslationResult>;
}

export interface BatchExecutionOptions {
  maxBatchSize?: number;
  concurrency?: number;
}

export interface BatchExecutionSummary {
  batchId: string;
  total: number;
  completed: number;
  uniqueRequests: number;
  batchCount: number;
  results: BatchResult[];
}

interface BatchRecord {
  id: string;
  requests: BatchRequest[];
  results: BatchResult[];
}

const DEFAULT_MAX_BATCH_SIZE = 50;

/** Cost per character in USD */
const COST_PER_CHAR = 0.01 / 1_000; // $0.01 per 1 000 characters

/** In-memory store of active batches keyed by batchId */
const batches = new Map<string, BatchRecord>();

/**
 * Create a new batch from an array of translation requests.
 * Returns a unique batchId that can be used to query status later.
 */
export function createBatch(requests: BatchRequest[]): string {
  const batchId = randomUUID();
  batches.set(batchId, {
    id: batchId,
    requests: [...requests],
    results: [],
  });
  return batchId;
}

/**
 * Return the current status of a batch, including how many items
 * have been completed and any results accumulated so far.
 */
export function getBatchStatus(
  batchId: string,
): { total: number; completed: number; results: BatchResult[] } {
  const batch = batches.get(batchId);
  if (!batch) {
    return { total: 0, completed: 0, results: [] };
  }
  return {
    total: batch.requests.length,
    completed: batch.results.length,
    results: [...batch.results],
  };
}

/**
 * Split an array of requests into sub-arrays of at most `maxBatchSize`.
 */
export function splitIntoBatches(
  requests: BatchRequest[],
  maxBatchSize: number = DEFAULT_MAX_BATCH_SIZE,
): BatchRequest[][] {
  if (maxBatchSize <= 0) {
    throw new Error("maxBatchSize must be a positive integer");
  }

  return chunkArray(requests, maxBatchSize);
}

/**
 * Estimate the cost of translating a set of requests based on total
 * character count at the standard rate of $0.01 per 1 000 characters.
 */
export function estimateBatchCost(
  requests: BatchRequest[],
): { totalCharacters: number; estimatedCost: number } {
  const totalCharacters = requests.reduce((sum, r) => sum + r.text.length, 0);
  const estimatedCost = Math.round(totalCharacters * COST_PER_CHAR * 100) / 100;
  return { totalCharacters, estimatedCost };
}

/**
 * Create a batch and process it immediately.
 */
export async function translateRequestsInBatches(
  requests: BatchRequest[],
  translator: BatchTranslator,
  options: BatchExecutionOptions = {},
): Promise<BatchExecutionSummary> {
  const batchId = createBatch(requests);
  return processBatch(batchId, translator, options);
}

/**
 * Execute an existing batch by ID.
 */
export async function processBatch(
  batchId: string,
  translator: BatchTranslator,
  options: BatchExecutionOptions = {},
): Promise<BatchExecutionSummary> {
  const batch = batches.get(batchId);
  if (!batch) {
    throw new Error(`Batch not found: ${batchId}`);
  }

  if (batch.requests.length === 0) {
    batch.results = [];
    return {
      batchId,
      total: 0,
      completed: 0,
      uniqueRequests: 0,
      batchCount: 0,
      results: [],
    };
  }

  const groupedRequests = groupRequests(batch.requests);
  const requestGroups = chunkArray(
    groupedRequests,
    normalizePositiveInteger(options.maxBatchSize, DEFAULT_MAX_BATCH_SIZE),
  );
  const concurrency = normalizePositiveInteger(options.concurrency, 1);
  const resultsById = new Map<string, BatchResult>();
  let nextBatchIndex = 0;

  await Promise.all(
    Array.from({
      length: Math.min(concurrency, requestGroups.length),
    }).map(async () => {
      while (nextBatchIndex < requestGroups.length) {
        const batchIndex = nextBatchIndex;
        nextBatchIndex += 1;
        const requestGroup = requestGroups[batchIndex];

        await Promise.all(
          requestGroup.map(async ({ request, ids }) => {
            const results = await translateGroupedRequest(request, ids, translator);
            for (const result of results) {
              resultsById.set(result.id, result);
            }
            syncBatchResults(batch, resultsById);
          }),
        );
      }
    }),
  );

  return {
    batchId,
    total: batch.requests.length,
    completed: batch.results.length,
    uniqueRequests: groupedRequests.length,
    batchCount: requestGroups.length,
    results: [...batch.results],
  };
}

export function clearBatchesForTesting(): void {
  batches.clear();
}

async function translateGroupedRequest(
  request: BatchRequest,
  ids: string[],
  translator: BatchTranslator,
): Promise<BatchResult[]> {
  try {
    const translation = await translator.translate({
      text: request.text,
      sourceLocale: request.sourceLocale,
      targetLocale: request.targetLocale,
      context: request.context,
      format: request.format,
      preferredProvider: request.preferredProvider,
      bypassCache: request.bypassCache,
    });

    return ids.map((id) => ({
      id,
      translatedText: translation.translatedText,
      provider: translation.provider,
      cached: translation.cached,
      fallbackUsed: translation.fallbackUsed,
    }));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown translation error";

    return ids.map((id) => ({
      id,
      translatedText: "",
      error: message,
    }));
  }
}

function syncBatchResults(
  batch: BatchRecord,
  resultsById: Map<string, BatchResult>,
): void {
  batch.results = batch.requests
    .filter((request) => resultsById.has(request.id))
    .map((request) => resultsById.get(request.id) as BatchResult);
}

function groupRequests(requests: BatchRequest[]): Array<{
  request: BatchRequest;
  ids: string[];
}> {
  const grouped = new Map<string, { request: BatchRequest; ids: string[] }>();

  for (const request of requests) {
    const key = buildRequestKey(request);
    const existing = grouped.get(key);

    if (existing) {
      existing.ids.push(request.id);
      continue;
    }

    grouped.set(key, {
      request,
      ids: [request.id],
    });
  }

  return Array.from(grouped.values());
}

function buildRequestKey(request: BatchRequest): string {
  return JSON.stringify({
    text: request.text,
    sourceLocale: request.sourceLocale,
    targetLocale: request.targetLocale,
    context: request.context ?? "",
    format: request.format ?? "text",
    preferredProvider: request.preferredProvider ?? null,
    bypassCache: request.bypassCache ?? false,
  });
}

function chunkArray<T>(items: T[], maxBatchSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += maxBatchSize) {
    chunks.push(items.slice(i, i + maxBatchSize));
  }
  return chunks;
}

function normalizePositiveInteger(
  value: number | undefined,
  fallback: number,
): number {
  if (value == null) {
    return fallback;
  }

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error("Batch options must be positive integers");
  }

  return value;
}
