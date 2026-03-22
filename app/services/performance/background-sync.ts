/**
 * T0177 — Background Sync for Translations
 *
 * Manages offline action queuing with retry strategies,
 * exponential backoff, and sync tag generation for translation operations.
 */

import { randomUUID } from "node:crypto";

/** Types of sync actions supported */
export type SyncActionType =
  | "translation"
  | "bulk-translation"
  | "cache-invalidation"
  | "glossary-update"
  | "locale-switch"
  | "content-update";

/** Priority levels for sync actions */
export type SyncPriority = "critical" | "high" | "normal" | "low";

/** Status of a sync action */
export type SyncStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "retrying"
  | "cancelled";

/** Error types that determine retry behavior */
export type SyncErrorType =
  | "network"
  | "timeout"
  | "rate-limit"
  | "auth"
  | "validation"
  | "server"
  | "unknown";

/** Sync action data structure */
export interface SyncAction {
  id: string;
  type: SyncActionType;
  payload: Record<string, unknown>;
  priority: SyncPriority;
  status: SyncStatus;
  createdAt: number;
  updatedAt: number;
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  errorType?: SyncErrorType;
  syncTag: string;
  dependencies?: string[];
}

/** Configuration for background sync */
export interface BackgroundSyncConfig {
  maxConcurrent: number;
  baseRetryDelayMs: number;
  maxRetryDelayMs: number;
  retryMultiplier: number;
  maxAttempts: number;
  enableExponentialBackoff: boolean;
  enableJitter: boolean;
}

/** Default configuration values */
export const DEFAULT_SYNC_CONFIG: BackgroundSyncConfig = {
  maxConcurrent: 3,
  baseRetryDelayMs: 1000,
  maxRetryDelayMs: 60000,
  retryMultiplier: 2,
  maxAttempts: 5,
  enableExponentialBackoff: true,
  enableJitter: true,
};

/** Result of processing a sync action */
export interface SyncResult {
  actionId: string;
  success: boolean;
  error?: string;
  errorType?: SyncErrorType;
  retryable: boolean;
  nextRetryAt?: number;
}

/** Queue statistics */
export interface SyncQueueStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  retrying: number;
  cancelled: number;
  averageAttempts: number;
}

/** Handler function type for processing actions */
export type SyncActionHandler = (
  action: SyncAction,
) => Promise<SyncResult>;

// In-memory queue storage
const syncQueue = new Map<string, SyncAction>();
const processingActions = new Set<string>();
const handlers = new Map<SyncActionType, SyncActionHandler>();

// Configuration (can be overridden)
let currentConfig: BackgroundSyncConfig = { ...DEFAULT_SYNC_CONFIG };

// Event listeners
const eventListeners = new Map<string, Set<(action: SyncAction) => void>>();

/**
 * Configure the background sync service
 */
export function configureSync(config: Partial<BackgroundSyncConfig>): void {
  currentConfig = { ...currentConfig, ...config };
}

/**
 * Get current configuration
 */
export function getSyncConfig(): BackgroundSyncConfig {
  return { ...currentConfig };
}

/**
 * Reset configuration to defaults (for testing)
 */
export function resetSyncConfig(): void {
  currentConfig = { ...DEFAULT_SYNC_CONFIG };
}

/**
 * Register a handler for a specific action type
 */
export function registerSyncHandler(
  type: SyncActionType,
  handler: SyncActionHandler,
): void {
  handlers.set(type, handler);
}

/**
 * Unregister a handler for a specific action type
 */
export function unregisterSyncHandler(type: SyncActionType): void {
  handlers.delete(type);
}

/**
 * Clear all handlers (for testing)
 */
export function clearSyncHandlers(): void {
  handlers.clear();
}

/**
 * Generate a unique sync tag for an action
 * Format: {type}:{locale}:{timestamp}:{hash}
 */
export function generateSyncTag(action: Omit<SyncAction, "id" | "syncTag">): string {
  const timestamp = Date.now();
  const payloadHash = hashPayload(action.payload);
  const locale = extractLocaleFromPayload(action.payload) || "global";
  return action.type + ":" + locale + ":" + timestamp + ":" + payloadHash;
}

/**
 * Add a sync action to the queue
 */
export function queueSyncAction(
  actionData: Omit<SyncAction, "id" | "syncTag" | "status" | "createdAt" | "updatedAt" | "attempts">,
): SyncAction {
  const id = randomUUID();
  const now = Date.now();
  const syncTag = generateSyncTag(actionData as Omit<SyncAction, "id" | "syncTag">);

  const action: SyncAction = {
    ...actionData,
    id,
    syncTag,
    status: "pending",
    createdAt: now,
    updatedAt: now,
    attempts: 0,
  };

  syncQueue.set(id, action);
  emitEvent("queued", action);

  return action;
}

/**
 * Get an action by ID
 */
export function getSyncAction(id: string): SyncAction | undefined {
  return syncQueue.get(id);
}

/**
 * Get all actions in the queue
 */
export function getAllSyncActions(): SyncAction[] {
  return Array.from(syncQueue.values());
}

/**
 * Get actions by status
 */
export function getSyncActionsByStatus(status: SyncStatus): SyncAction[] {
  return Array.from(syncQueue.values()).filter((a) => a.status === status);
}

/**
 * Get actions by type
 */
export function getSyncActionsByType(type: SyncActionType): SyncAction[] {
  return Array.from(syncQueue.values()).filter((a) => a.type === type);
}

/**
 * Cancel a pending or retrying action
 */
export function cancelSyncAction(id: string): boolean {
  const action = syncQueue.get(id);
  if (!action || (action.status !== "pending" && action.status !== "retrying")) {
    return false;
  }

  action.status = "cancelled";
  action.updatedAt = Date.now();
  emitEvent("cancelled", action);
  return true;
}

/**
 * Remove completed/failed/cancelled actions older than the specified age (ms)
 */
export function cleanupSyncQueue(maxAgeMs: number = 86400000): number {
  const cutoff = Date.now() - maxAgeMs;
  let removed = 0;

  for (const [id, action] of syncQueue) {
    if (
      (action.status === "completed" ||
        action.status === "failed" ||
        action.status === "cancelled") &&
      action.updatedAt < cutoff
    ) {
      syncQueue.delete(id);
      removed++;
    }
  }

  return removed;
}

/**
 * Clear the entire queue (for testing)
 */
export function clearSyncQueue(): void {
  syncQueue.clear();
  processingActions.clear();
}

/**
 * Get queue statistics
 */
export function getSyncQueueStats(): SyncQueueStats {
  const actions = Array.from(syncQueue.values());
  const totalAttempts = actions.reduce((sum, a) => sum + a.attempts, 0);

  return {
    total: actions.length,
    pending: actions.filter((a) => a.status === "pending").length,
    processing: actions.filter((a) => a.status === "processing").length,
    completed: actions.filter((a) => a.status === "completed").length,
    failed: actions.filter((a) => a.status === "failed").length,
    retrying: actions.filter((a) => a.status === "retrying").length,
    cancelled: actions.filter((a) => a.status === "cancelled").length,
    averageAttempts: actions.length > 0 ? totalAttempts / actions.length : 0,
  };
}

/**
 * Calculate retry delay using exponential backoff with optional jitter
 */
export function getRetryDelay(attempt: number): number {
  const { baseRetryDelayMs, maxRetryDelayMs, retryMultiplier, enableExponentialBackoff, enableJitter } =
    currentConfig;

  if (attempt < 1) {
    return 0;
  }

  let delay: number;

  if (enableExponentialBackoff) {
    // Exponential backoff: base * multiplier^(attempt-1)
    delay = baseRetryDelayMs * Math.pow(retryMultiplier, attempt - 1);
  } else {
    // Linear backoff: base * attempt
    delay = baseRetryDelayMs * attempt;
  }

  // Cap at maximum delay
  delay = Math.min(delay, maxRetryDelayMs);

  // Add jitter to prevent thundering herd (+/-25%)
  if (enableJitter) {
    const jitterFactor = 0.75 + Math.random() * 0.5;
    delay = Math.floor(delay * jitterFactor);
  }

  return delay;
}

/**
 * Determine if an error should trigger a retry
 */
export function shouldRetry(error: unknown, attempt: number): boolean {
  const errorType = classifyError(error);
  const { maxAttempts } = currentConfig;

  // Don't retry if we've exceeded max attempts
  if (attempt >= maxAttempts) {
    return false;
  }

  // Always retry network errors
  if (errorType === "network") {
    return true;
  }

  // Always retry timeout errors
  if (errorType === "timeout") {
    return true;
  }

  // Always retry rate-limit errors
  if (errorType === "rate-limit") {
    return true;
  }

  // Retry server errors (5xx) with limited attempts
  if (errorType === "server" && attempt < 3) {
    return true;
  }

  // Don't retry auth errors (requires user intervention)
  if (errorType === "auth") {
    return false;
  }

  // Don't retry validation errors (requires fixing input)
  if (errorType === "validation") {
    return false;
  }

  // Unknown errors: retry once
  if (errorType === "unknown" && attempt < 1) {
    return true;
  }

  return false;
}

/**
 * Classify an error into a SyncErrorType
 */
export function classifyError(error: unknown): SyncErrorType {
  if (error == null) {
    return "unknown";
  }

  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();

  // Network errors
  if (
    lowerMessage.includes("network") ||
    lowerMessage.includes("enetunreach") ||
    lowerMessage.includes("econnrefused") ||
    lowerMessage.includes("econnreset") ||
    lowerMessage.includes("enotfound") ||
    lowerMessage.includes("offline")
  ) {
    return "network";
  }

  // Timeout errors
  if (
    lowerMessage.includes("timeout") ||
    lowerMessage.includes("etimedout") ||
    lowerMessage.includes("request timeout")
  ) {
    return "timeout";
  }

  // Rate limit errors
  if (
    lowerMessage.includes("rate limit") ||
    lowerMessage.includes("too many requests") ||
    lowerMessage.includes("429") ||
    lowerMessage.includes("throttled")
  ) {
    return "rate-limit";
  }

  // Auth errors
  if (
    lowerMessage.includes("unauthorized") ||
    lowerMessage.includes("forbidden") ||
    lowerMessage.includes("401") ||
    lowerMessage.includes("403") ||
    lowerMessage.includes("authentication") ||
    lowerMessage.includes("auth")
  ) {
    return "auth";
  }

  // Validation errors
  if (
    lowerMessage.includes("validation") ||
    lowerMessage.includes("invalid") ||
    lowerMessage.includes("bad request") ||
    lowerMessage.includes("400")
  ) {
    return "validation";
  }

  // Server errors (5xx)
  if (
    lowerMessage.includes("server error") ||
    lowerMessage.includes("internal error") ||
    /5\d{2}/.test(lowerMessage)
  ) {
    return "server";
  }

  return "unknown";
}

/**
 * Process a single sync action
 */
async function processAction(action: SyncAction): Promise<SyncResult> {
  const handler = handlers.get(action.type);

  if (!handler) {
    return {
      actionId: action.id,
      success: false,
      error: "No handler registered for action type: " + action.type,
      errorType: "unknown",
      retryable: false,
    };
  }

  try {
    action.status = "processing";
    action.updatedAt = Date.now();
    action.attempts += 1;
    processingActions.add(action.id);
    emitEvent("processing", action);

    const result = await handler(action);

    if (result.success) {
      action.status = "completed";
      action.updatedAt = Date.now();
      delete action.lastError;
      delete action.errorType;
      emitEvent("completed", action);
    } else {
      action.lastError = result.error;
      action.errorType = result.errorType;

      if (result.retryable && shouldRetry(result.error, action.attempts)) {
        action.status = "retrying";
        action.updatedAt = Date.now();
        result.nextRetryAt = Date.now() + getRetryDelay(action.attempts);
        emitEvent("retrying", action);
      } else {
        action.status = "failed";
        action.updatedAt = Date.now();
        emitEvent("failed", action);
      }
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorType = classifyError(error);

    action.lastError = errorMessage;
    action.errorType = errorType;

    const retryable = shouldRetry(error, action.attempts);

    if (retryable) {
      action.status = "retrying";
      action.updatedAt = Date.now();
      emitEvent("retrying", action);
    } else {
      action.status = "failed";
      action.updatedAt = Date.now();
      emitEvent("failed", action);
    }

    return {
      actionId: action.id,
      success: false,
      error: errorMessage,
      errorType,
      retryable,
      nextRetryAt: retryable ? Date.now() + getRetryDelay(action.attempts) : undefined,
    };
  } finally {
    processingActions.delete(action.id);
  }
}

/**
 * Process the sync queue
 * Handles concurrent processing based on configuration
 */
export async function processSyncQueue(): Promise<SyncResult[]> {
  const { maxConcurrent } = currentConfig;
  const pendingActions = getPendingActionsOrdered();

  if (pendingActions.length === 0) {
    return [];
  }

  const availableSlots = maxConcurrent - processingActions.size;
  const actionsToProcess = pendingActions.slice(0, availableSlots);

  const results = await Promise.all(
    actionsToProcess.map((action) => processAction(action)),
  );

  return results;
}

/**
 * Process a specific action by ID
 */
export async function processSyncAction(id: string): Promise<SyncResult | null> {
  const action = syncQueue.get(id);
  if (!action || action.status === "processing") {
    return null;
  }

  return processAction(action);
}

/**
 * Retry a failed action manually
 */
export function retrySyncAction(id: string): boolean {
  const action = syncQueue.get(id);
  if (!action || (action.status !== "failed" && action.status !== "retrying")) {
    return false;
  }

  action.status = "pending";
  action.updatedAt = Date.now();
  emitEvent("queued", action);
  return true;
}

/**
 * Add an event listener
 */
export function addSyncEventListener(
  event: string,
  listener: (action: SyncAction) => void,
): () => void {
  if (!eventListeners.has(event)) {
    eventListeners.set(event, new Set());
  }

  eventListeners.get(event)!.add(listener);

  // Return unsubscribe function
  return () => {
    eventListeners.get(event)?.delete(listener);
  };
}

/**
 * Remove all event listeners (for testing)
 */
export function clearSyncEventListeners(): void {
  eventListeners.clear();
}

// Helper functions

function getPendingActionsOrdered(): SyncAction[] {
  const priorityOrder: Record<SyncPriority, number> = {
    critical: 0,
    high: 1,
    normal: 2,
    low: 3,
  };

  return Array.from(syncQueue.values())
    .filter(
      (a) =>
        (a.status === "pending" || a.status === "retrying") &&
        !processingActions.has(a.id),
    )
    .sort((a, b) => {
      // Sort by priority first
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by creation time (oldest first)
      return a.createdAt - b.createdAt;
    });
}

function hashPayload(payload: Record<string, unknown>): string {
  const str = JSON.stringify(payload, Object.keys(payload).sort());
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }

  return Math.abs(hash).toString(36).substring(0, 8);
}

function extractLocaleFromPayload(payload: Record<string, unknown>): string | null {
  if (typeof payload.locale === "string") {
    return payload.locale;
  }
  if (typeof payload.targetLocale === "string") {
    return payload.targetLocale;
  }
  if (typeof payload.sourceLocale === "string") {
    return payload.sourceLocale;
  }
  return null;
}

function emitEvent(event: string, action: SyncAction): void {
  const listeners = eventListeners.get(event);
  if (listeners) {
    listeners.forEach((listener) => {
      try {
        listener(action);
      } catch {
        // Ignore listener errors
      }
    });
  }
}
