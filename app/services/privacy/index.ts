export type {
  DataExportResult,
  DeletionResult,
  ConsentInput,
  RetentionPolicyInput,
  ConsentPurpose,
  PrivacyDashboardData,
} from "./types";

export { exportShopData, formatExportAsJson, formatExportAsCsv } from "./data-export";
export { deleteShopData, scheduleDataDeletion } from "./data-deletion";
export {
  updateConsent,
  getConsent,
  getAllConsents,
  hasConsent,
  grantConsent,
  revokeConsent,
  getConsentStatus,
} from "./consent";
export {
  setRetentionPolicy,
  getRetentionPolicies,
  enforceRetention,
} from "./retention";
export { getPrivacyDashboard } from "./dashboard";
