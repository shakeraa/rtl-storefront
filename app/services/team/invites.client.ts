/**
 * Team Invitation Client Helpers
 * Safe to import in browser - no server dependencies
 */

/**
 * Get status badge color for UI
 */
export function getStatusTone(status: string): "success" | "attention" | "info" | "warning" | "critical" {
  switch (status) {
    case "accepted":
      return "success";
    case "sent":
      return "info";
    case "pending":
      return "attention";
    case "expired":
      return "warning";
    case "revoked":
      return "critical";
    default:
      return "attention";
  }
}

/**
 * Format status for display
 */
export function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
