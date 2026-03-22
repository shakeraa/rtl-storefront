/**
 * Rate Limiting Service (T0186)
 *
 * In-memory sliding window rate limiter.
 */

import type { RateLimitConfig, RateLimitResult } from "./types";

interface WindowEntry {
  timestamps: number[];
  blocked: number;
}

/**
 * Sliding-window rate limiter with automatic cleanup of expired windows.
 */
export class RateLimiter {
  private config: RateLimitConfig;
  private windows: Map<string, WindowEntry> = new Map();
  private totalBlocked: number = 0;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: RateLimitConfig) {
    this.config = config;

    // Auto-cleanup every minute
    this.cleanupTimer = setInterval(() => this.cleanup(), 60_000);

    // Allow the timer to not block Node from exiting
    if (this.cleanupTimer && typeof this.cleanupTimer === "object" && "unref" in this.cleanupTimer) {
      this.cleanupTimer.unref();
    }
  }

  /**
   * Checks whether a request identified by `key` is allowed.
   */
  check(key: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    let entry = this.windows.get(key);
    if (!entry) {
      entry = { timestamps: [], blocked: 0 };
      this.windows.set(key, entry);
    }

    // Remove timestamps outside the sliding window
    entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

    const resetAt = new Date(now + this.config.windowMs);

    if (entry.timestamps.length >= this.config.maxRequests) {
      // Rate limited
      const oldestInWindow = entry.timestamps[0];
      const retryAfter = Math.ceil((oldestInWindow + this.config.windowMs - now) / 1000);

      entry.blocked++;
      this.totalBlocked++;

      return {
        allowed: false,
        remaining: 0,
        resetAt,
        retryAfter: Math.max(retryAfter, 1),
      };
    }

    // Allow the request
    entry.timestamps.push(now);

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.timestamps.length,
      resetAt,
    };
  }

  /**
   * Resets the rate limit window for a given key.
   */
  reset(key: string): void {
    this.windows.delete(key);
  }

  /**
   * Returns aggregate statistics.
   */
  getStats(): { totalBlocked: number; activeWindows: number } {
    return {
      totalBlocked: this.totalBlocked,
      activeWindows: this.windows.size,
    };
  }

  /**
   * Cleans up expired windows.
   */
  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    for (const [key, entry] of this.windows) {
      entry.timestamps = entry.timestamps.filter((t) => t > windowStart);
      if (entry.timestamps.length === 0) {
        this.windows.delete(key);
      }
    }
  }

  /**
   * Stops the auto-cleanup timer. Call when shutting down.
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}
