/**
 * Team Management Service
 *
 * Consolidated service covering:
 * - T0009: Admin dashboard widget definitions and layout
 * - T0016: Role-based permissions for translation management
 * - T0091: Translation queue status widget
 */

// ---------------------------------------------------------------------------
// T0009 - Admin dashboard data
// ---------------------------------------------------------------------------

export interface DashboardWidget {
  id: string;
  title: string;
  titleAr: string;
  type: "stat" | "chart" | "list" | "progress";
  size: "small" | "medium" | "large";
}

/**
 * The eight default dashboard widgets.
 */
export const DASHBOARD_WIDGETS: DashboardWidget[] = [
  {
    id: "translation-progress",
    title: "Translation Progress",
    titleAr: "تقدم الترجمة",
    type: "progress",
    size: "large",
  },
  {
    id: "locale-coverage",
    title: "Locale Coverage",
    titleAr: "تغطية اللغات",
    type: "chart",
    size: "medium",
  },
  {
    id: "recent-activity",
    title: "Recent Activity",
    titleAr: "النشاط الأخير",
    type: "list",
    size: "medium",
  },
  {
    id: "ai-usage",
    title: "AI Usage",
    titleAr: "استخدام الذكاء الاصطناعي",
    type: "stat",
    size: "small",
  },
  {
    id: "cost-summary",
    title: "Cost Summary",
    titleAr: "ملخص التكاليف",
    type: "stat",
    size: "small",
  },
  {
    id: "queue-status",
    title: "Queue Status",
    titleAr: "حالة قائمة الانتظار",
    type: "stat",
    size: "small",
  },
  {
    id: "alerts",
    title: "Alerts",
    titleAr: "التنبيهات",
    type: "list",
    size: "medium",
  },
  {
    id: "team-overview",
    title: "Team",
    titleAr: "الفريق",
    type: "list",
    size: "medium",
  },
];

/**
 * Return the dashboard widget set with titles resolved for the given locale.
 * The layout order stays the same; only `title` changes.
 */
export function getDashboardLayout(locale: string): DashboardWidget[] {
  const isArabic = locale.startsWith("ar");

  return DASHBOARD_WIDGETS.map((widget) => ({
    ...widget,
    title: isArabic ? widget.titleAr : widget.title,
  }));
}

// ---------------------------------------------------------------------------
// T0016 - Role-based permissions
// ---------------------------------------------------------------------------

export type UserRole = "owner" | "admin" | "editor" | "translator" | "viewer";

export interface Permission {
  action: string;
  resource: string;
}

/**
 * Permission matrix for each role.
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [
    { action: "*", resource: "*" },
  ],
  admin: [
    { action: "read", resource: "*" },
    { action: "write", resource: "*" },
    { action: "delete", resource: "*" },
    { action: "manage", resource: "team" },
    { action: "manage", resource: "settings" },
    { action: "manage", resource: "billing" },
  ],
  editor: [
    { action: "read", resource: "*" },
    { action: "write", resource: "translation" },
    { action: "write", resource: "content" },
    { action: "delete", resource: "translation" },
    { action: "approve", resource: "translation" },
    { action: "publish", resource: "translation" },
  ],
  translator: [
    { action: "read", resource: "*" },
    { action: "write", resource: "translation" },
    { action: "submit", resource: "translation" },
  ],
  viewer: [
    { action: "read", resource: "*" },
  ],
};

/**
 * Check whether a given role has a specific permission.
 */
export function hasPermission(
  role: UserRole,
  action: string,
  resource: string,
): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  return permissions.some(
    (p) =>
      (p.action === "*" || p.action === action) &&
      (p.resource === "*" || p.resource === resource),
  );
}

const ROLE_LABELS: Record<UserRole, Record<string, string>> = {
  owner: { en: "Owner", ar: "المالك", he: "בעלים", fr: "Propriétaire" },
  admin: { en: "Admin", ar: "مدير", he: "מנהל", fr: "Administrateur" },
  editor: { en: "Editor", ar: "محرر", he: "עורך", fr: "Éditeur" },
  translator: { en: "Translator", ar: "مترجم", he: "מתרגם", fr: "Traducteur" },
  viewer: { en: "Viewer", ar: "مشاهد", he: "צופה", fr: "Lecteur" },
};

/**
 * Return the human-readable label for a role in the given locale.
 */
export function getRoleLabel(role: UserRole, locale: string): string {
  const base = locale.split("-")[0];
  return ROLE_LABELS[role]?.[base] ?? ROLE_LABELS[role]?.en ?? role;
}

// ---------------------------------------------------------------------------
// T0091 - Queue status widget
// ---------------------------------------------------------------------------

export interface QueueStatusWidget {
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  avgProcessingTime: number;
  estimatedCompletion: string;
}

/**
 * Get current queue status for a shop (mock data for now).
 */
export function getQueueStatus(_shop: string): QueueStatusWidget {
  return {
    queued: 42,
    processing: 8,
    completed: 1247,
    failed: 3,
    avgProcessingTime: 2.4,
    estimatedCompletion: "~15 minutes",
  };
}

/**
 * Format queue status values into locale-appropriate display strings.
 */
export function formatQueueStatus(
  status: QueueStatusWidget,
  locale: string,
): Record<string, string> {
  const isArabic = locale.startsWith("ar");

  if (isArabic) {
    return {
      queued: `${status.queued} في الانتظار`,
      processing: `${status.processing} قيد المعالجة`,
      completed: `${status.completed} مكتمل`,
      failed: `${status.failed} فشل`,
      avgProcessingTime: `${status.avgProcessingTime} ثانية`,
      estimatedCompletion: status.estimatedCompletion,
    };
  }

  return {
    queued: `${status.queued} queued`,
    processing: `${status.processing} processing`,
    completed: `${status.completed} completed`,
    failed: `${status.failed} failed`,
    avgProcessingTime: `${status.avgProcessingTime}s avg`,
    estimatedCompletion: status.estimatedCompletion,
  };
}
