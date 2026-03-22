import type {
  QueueStats,
  TranslationJob,
  TranslationJobStatus,
} from "./types";

const jobs = new Map<string, TranslationJob>();

export function createJob(
  job: Omit<TranslationJob, "id" | "createdAt" | "status" | "retryCount">,
): TranslationJob {
  const newJob: TranslationJob = {
    ...job,
    id: crypto.randomUUID(),
    status: "queued",
    retryCount: 0,
    createdAt: new Date(),
  };

  jobs.set(newJob.id, newJob);
  return newJob;
}

export function getJob(id: string): TranslationJob | undefined {
  return jobs.get(id);
}

export function getNextJob(): TranslationJob | undefined {
  let best: TranslationJob | undefined;

  for (const job of jobs.values()) {
    if (job.status !== "queued") {
      continue;
    }

    if (!best || job.priority > best.priority) {
      best = job;
    }
  }

  return best;
}

export function updateJobStatus(
  id: string,
  status: TranslationJobStatus,
  error?: string,
): void {
  const job = jobs.get(id);

  if (!job) {
    return;
  }

  job.status = status;

  if (error !== undefined) {
    job.error = error;
  }

  if (status === "processing" && !job.startedAt) {
    job.startedAt = new Date();
  }

  if (status === "completed" || status === "failed") {
    job.completedAt = new Date();
  }
}

export function retryJob(id: string): boolean {
  const job = jobs.get(id);

  if (!job) {
    return false;
  }

  if (job.retryCount >= job.maxRetries) {
    return false;
  }

  job.retryCount += 1;
  job.status = "queued";
  job.error = undefined;
  job.startedAt = undefined;
  job.completedAt = undefined;

  return true;
}

export function getJobsByShop(
  shop: string,
  status?: TranslationJobStatus,
): TranslationJob[] {
  const result: TranslationJob[] = [];

  for (const job of jobs.values()) {
    if (job.shop !== shop) {
      continue;
    }

    if (status !== undefined && job.status !== status) {
      continue;
    }

    result.push(job);
  }

  return result;
}

export function getQueueStats(shop: string): QueueStats {
  const now = new Date();
  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  let queued = 0;
  let processing = 0;
  let completed = 0;
  let failed = 0;
  let totalToday = 0;

  for (const job of jobs.values()) {
    if (job.shop !== shop) {
      continue;
    }

    switch (job.status) {
      case "queued":
        queued++;
        break;
      case "processing":
        processing++;
        break;
      case "completed":
        completed++;
        break;
      case "failed":
        failed++;
        break;
    }

    if (job.createdAt >= startOfDay) {
      totalToday++;
    }
  }

  return { queued, processing, completed, failed, totalToday };
}

export function cancelJob(id: string): boolean {
  const job = jobs.get(id);

  if (!job) {
    return false;
  }

  if (job.status === "completed" || job.status === "cancelled") {
    return false;
  }

  job.status = "cancelled";
  job.completedAt = new Date();
  return true;
}

export function clearCompleted(shop: string): number {
  let removed = 0;

  for (const [id, job] of jobs.entries()) {
    if (job.shop === shop && job.status === "completed") {
      jobs.delete(id);
      removed++;
    }
  }

  return removed;
}
