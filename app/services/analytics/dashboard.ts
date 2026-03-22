/**
 * Dashboard - T0261: Real-time Dashboard Data
 * Aggregates analytics data for the dashboard view.
 */

import type { DashboardData } from "./types";
import { analyticsTracker } from "./tracker";
import { getLanguagePreferences } from "./user-analytics";

// In-memory recent activity log
const recentActivityLog = new Map<
  string,
  Array<{ action: string; locale: string; timestamp: string }>
>();

const MAX_RECENT_ACTIVITY = 100;

/**
 * Record an activity event for the dashboard feed.
 */
export function recordActivity(
  shop: string,
  action: string,
  locale: string,
): void {
  if (!recentActivityLog.has(shop)) {
    recentActivityLog.set(shop, []);
  }
  const log = recentActivityLog.get(shop)!;

  log.unshift({
    action,
    locale,
    timestamp: new Date().toISOString(),
  });

  // Keep only the most recent entries
  if (log.length > MAX_RECENT_ACTIVITY) {
    log.length = MAX_RECENT_ACTIVITY;
  }
}

/**
 * Get aggregated dashboard data for a shop.
 */
export function getDashboardData(shop: string): DashboardData {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  // Calculate date boundaries
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split("T")[0];

  const monthAgo = new Date(now);
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  const monthAgoStr = monthAgo.toISOString().split("T")[0];

  // Get volume data for different periods
  const todayVolume = analyticsTracker.getVolumeByDate(shop, today, today);
  const weekVolume = analyticsTracker.getVolumeByDate(shop, weekAgoStr, today);
  const monthVolume = analyticsTracker.getVolumeByDate(shop, monthAgoStr, today);

  const sumCost = (
    entries: Array<{ cost: number }>,
  ): number => entries.reduce((sum, e) => sum + e.cost, 0);

  return {
    translationVolume: monthVolume,
    coverageByLanguage: [],
    topLanguages: getLanguagePreferences(shop).slice(0, 5),
    recentActivity: (recentActivityLog.get(shop) || []).slice(0, 20),
    costSummary: {
      today: Math.round(sumCost(todayVolume) * 100) / 100,
      thisWeek: Math.round(sumCost(weekVolume) * 100) / 100,
      thisMonth: Math.round(sumCost(monthVolume) * 100) / 100,
    },
  };
}

/**
 * Get real-time stats snapshot for the dashboard.
 */
export function getRealtimeStats(
  shop: string,
): { activeVisitors: number; translationsInProgress: number; queueSize: number } {
  // In production, these would come from live session tracking and job queues.
  // Returns zeros as baseline; real values populated by integration with
  // session tracking and translation queue services.
  return {
    activeVisitors: 0,
    translationsInProgress: 0,
    queueSize: 0,
  };
}
