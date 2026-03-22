export type {
  DataExportResult,
  DeletionResult,
  ConsentInput,
  RetentionPolicyInput,
  ConsentPurpose,
  PrivacyDashboardData,
} from "./types";

export { exportShopData } from "./data-export";
export { deleteShopData } from "./data-deletion";
export {
  updateConsent,
  getConsent,
  getAllConsents,
  hasConsent,
} from "./consent";
export {
  setRetentionPolicy,
  getRetentionPolicies,
  enforceRetention,
} from "./retention";
export { getPrivacyDashboard } from "./dashboard";
