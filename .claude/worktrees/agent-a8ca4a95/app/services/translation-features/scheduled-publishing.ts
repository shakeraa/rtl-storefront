/**
 * Scheduled Publishing Service
 * T0335: Translation - Scheduled Publishing
 *
 * Allows translations to be scheduled for future publication,
 * with cancellation and batch processing support.
 */

import { saveVersion } from './version-history';

export type ScheduleStatus = 'pending' | 'published' | 'cancelled' | 'failed';

export interface ScheduledPublish {
  id: string;
  shop: string;
  resourceId: string;
  locale: string;
  content: string;
  publishAt: Date;
  status: ScheduleStatus;
  createdAt: Date;
  publishedAt?: Date;
  error?: string;
}

export interface ScheduleResult {
  success: boolean;
  schedule?: ScheduledPublish;
  error?: string;
}

export interface ProcessResult {
  processed: number;
  succeeded: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

// In-memory store (replace with DB/job queue in production)
const scheduleStore: Map<string, ScheduledPublish> = new Map();

function generateScheduleId(): string {
  return `sched_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Schedules a translation for future publication.
 * @param shop - The Shopify shop domain
 * @param resourceId - The resource identifier
 * @param locale - The locale code
 * @param content - The translation content to publish
 * @param publishAt - The future date/time to publish at
 * @returns ScheduleResult with the created schedule or error
 */
export function schedulePublish(
  shop: string,
  resourceId: string,
  locale: string,
  content: string,
  publishAt: Date
): ScheduleResult {
  if (publishAt <= new Date()) {
    return {
      success: false,
      error: 'publishAt must be a future date',
    };
  }

  if (!content || content.trim().length === 0) {
    return {
      success: false,
      error: 'Content cannot be empty',
    };
  }

  const schedule: ScheduledPublish = {
    id: generateScheduleId(),
    shop,
    resourceId,
    locale,
    content,
    publishAt,
    status: 'pending',
    createdAt: new Date(),
  };

  scheduleStore.set(schedule.id, schedule);

  return { success: true, schedule };
}

/**
 * Cancels a scheduled publish.
 * @param id - The schedule ID to cancel
 * @returns true if cancelled, false if not found or already processed
 */
export function cancelScheduledPublish(id: string): boolean {
  const schedule = scheduleStore.get(id);
  if (!schedule) return false;
  if (schedule.status !== 'pending') return false;

  schedule.status = 'cancelled';
  scheduleStore.set(id, schedule);
  return true;
}

/**
 * Processes all pending scheduled publishes that are due.
 * Should be called by a cron job or scheduled task.
 * @returns ProcessResult with counts and errors
 */
export function processScheduledPublishes(): ProcessResult {
  const now = new Date();
  const result: ProcessResult = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    errors: [],
  };

  for (const [id, schedule] of scheduleStore) {
    if (schedule.status !== 'pending') continue;
    if (schedule.publishAt > now) continue;

    result.processed++;

    try {
      saveVersion(
        schedule.shop,
        schedule.resourceId,
        schedule.locale,
        schedule.content
      );

      schedule.status = 'published';
      schedule.publishedAt = now;
      scheduleStore.set(id, schedule);
      result.succeeded++;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      schedule.status = 'failed';
      schedule.error = errorMessage;
      scheduleStore.set(id, schedule);
      result.failed++;
      result.errors.push({ id, error: errorMessage });
    }
  }

  return result;
}

/**
 * Lists all scheduled publishes for a shop.
 * @param shop - The shop domain
 * @param status - Optional filter by status
 * @returns Array of ScheduledPublish records
 */
export function listScheduledPublishes(
  shop: string,
  status?: ScheduleStatus
): ScheduledPublish[] {
  const results: ScheduledPublish[] = [];
  for (const schedule of scheduleStore.values()) {
    if (schedule.shop !== shop) continue;
    if (status && schedule.status !== status) continue;
    results.push(schedule);
  }
  return results.sort((a, b) => a.publishAt.getTime() - b.publishAt.getTime());
}

/**
 * Retrieves a specific scheduled publish by ID.
 * @param id - The schedule ID
 * @returns The ScheduledPublish or null
 */
export function getScheduledPublish(id: string): ScheduledPublish | null {
  return scheduleStore.get(id) ?? null;
}

/**
 * Returns the count of pending scheduled publishes for a shop.
 */
export function getPendingCount(shop: string): number {
  return listScheduledPublishes(shop, 'pending').length;
}
