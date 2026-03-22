export type TranslationJobStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export type WebhookEventType =
  | "product/create"
  | "product/update"
  | "product/delete"
  | "collection/create"
  | "collection/update"
  | "collection/delete"
  | "page/create"
  | "page/update";

export type AutomationRuleAction =
  | "auto_translate"
  | "queue_for_review"
  | "skip"
  | "notify";

export interface TranslationJob {
  id: string;
  shop: string;
  resourceType: string;
  resourceId: string;
  sourceLocale: string;
  targetLocales: string[];
  status: TranslationJobStatus;
  priority: number;
  retryCount: number;
  maxRetries: number;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface AutomationRule {
  id: string;
  shop: string;
  name: string;
  enabled: boolean;
  trigger: WebhookEventType;
  conditions: AutomationCondition[];
  action: AutomationRuleAction;
  targetLocales: string[];
  priority: number;
}

export interface AutomationCondition {
  field: string;
  operator:
    | "equals"
    | "contains"
    | "starts_with"
    | "in_collection"
    | "has_tag"
    | "not_empty";
  value: string;
}

export interface WebhookPayload {
  topic: WebhookEventType;
  shop: string;
  resourceId: string;
  resourceType: string;
  fields?: Record<string, unknown>;
}

export interface QueueStats {
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  totalToday: number;
}
