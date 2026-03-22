export interface DataExportResult {
  shop: string;
  exportedAt: string;
  data: {
    sessions: Array<Record<string, unknown>>;
    translationCache: Array<Record<string, unknown>>;
    consents: Array<Record<string, unknown>>;
    accessLogs: Array<Record<string, unknown>>;
  };
}

export interface DeletionResult {
  shop: string;
  deletedAt: string;
  deletedCounts: {
    sessions: number;
    translationCache: number;
    consents: number;
    accessLogs: number;
  };
}

export interface ConsentInput {
  shop: string;
  purpose: string;
  granted: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export interface RetentionPolicyInput {
  shop: string;
  dataType: string;
  retentionDays: number;
  autoDelete: boolean;
}

export type ConsentPurpose =
  | "translation_processing"
  | "analytics"
  | "marketing"
  | "third_party_sharing";

export interface PrivacyDashboardData {
  shop: string;
  consents: Array<{
    purpose: string;
    granted: boolean;
    grantedAt: string | null;
  }>;
  retentionPolicies: Array<{
    dataType: string;
    retentionDays: number;
    autoDelete: boolean;
  }>;
  recentAccessLogs: Array<{
    action: string;
    dataType: string;
    createdAt: string;
  }>;
  dataCounts: {
    sessions: number;
    translationCache: number;
    consents: number;
  };
}
