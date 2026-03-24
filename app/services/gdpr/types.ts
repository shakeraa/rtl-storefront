export interface DataExportRequest {
  shop: string;
  requestedBy: string;
  format: "json" | "csv";
  includeTranslations: boolean;
  includeAnalytics: boolean;
}

export interface DataExportPackage {
  shop: string;
  exportedAt: string;
  format: string;
  sections: Record<string, unknown[]>;
  metadata: { totalRecords: number; sizeBytes: number };
}

export interface ErasureRequest {
  shop: string;
  requestedBy: string;
  scope: "all" | "translations" | "analytics" | "personal";
  confirmation: string;
}

export interface ErasureResult {
  shop: string;
  erasedAt: string;
  scope: string;
  recordsDeleted: number;
  tablesAffected: string[];
}

export interface ConsentPreferences {
  shop: string;
  translationProcessing: boolean;
  analyticsTracking: boolean;
  thirdPartySharing: boolean;
  marketingCommunications: boolean;
  updatedAt: string;
}

export interface CookieConsentConfig {
  shop: string;
  bannerText: string;
  bannerTextAr: string;
  acceptButtonText: string;
  acceptButtonTextAr: string;
  rejectButtonText: string;
  rejectButtonTextAr: string;
  privacyPolicyUrl: string;
  cookieCategories: CookieCategory[];
  position: "top" | "bottom";
  style: "banner" | "modal";
}

export interface CookieCategory {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  required: boolean;
  defaultEnabled: boolean;
}

export interface CCPAConfig {
  shop: string;
  doNotSellEnabled: boolean;
  doNotSellUrl: string;
  privacyPolicyUrl: string;
  dataCategories: string[];
}

export interface AccessibilityCheck {
  rule: string;
  level: "A" | "AA" | "AAA";
  passed: boolean;
  description: string;
  fix?: string;
}

export interface AccessibilityReport {
  url: string;
  locale: string;
  score: number;
  checks: AccessibilityCheck[];
  passedCount: number;
  failedCount: number;
}

export interface DeletionResult {
  shop: string;
  deletedAt: string;
  deletedCounts: Record<string, number>;
}

export type ConsentPurpose =
  | "translation_processing"
  | "analytics_tracking"
  | "third_party_sharing"
  | "marketing_communications";

export interface ConsentInput {
  shop: string;
  purpose: ConsentPurpose;
  granted: boolean;
  grantedBy: string;
}

export interface RetentionPolicyInput {
  shop: string;
  dataType: string;
  retentionDays: number;
  autoDelete: boolean;
}

export interface PrivacyDashboardData {
  shop: string;
  consents: Array<{ purpose: string; granted: boolean; grantedAt: string | null }>;
  retentionPolicies: Array<{ dataType: string; retentionDays: number; autoDelete: boolean }>;
  recentAccessLogs: Array<{ action: string; dataType: string; createdAt: string }>;
  dataCounts: { sessions: number; translationCache: number; consents: number };
}
