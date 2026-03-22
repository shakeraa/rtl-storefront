/**
 * T0163 — Batch translation API calls
 *
 * Utilities for grouping translation requests into batches, tracking
 * their progress, and estimating cost.
 */

import { randomUUID } from "node:crypto";

export interface BatchRequest {
  id: string;
  text: string;
  sourceLocale: string;
  targetLocale: string;
}

export interface BatchResult {
  id: string;
  translatedText: string;
  error?: string;
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

  const chunks: BatchRequest[][] = [];
  for (let i = 0; i < requests.length; i += maxBatchSize) {
    chunks.push(requests.slice(i, i + maxBatchSize));
  }
  return chunks;
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
