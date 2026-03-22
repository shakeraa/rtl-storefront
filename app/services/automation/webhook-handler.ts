import { createJob } from "./queue";
import { evaluateRules } from "./rules";
import type {
  AutomationRule,
  AutomationRuleAction,
  TranslationJob,
  WebhookEventType,
  WebhookPayload,
} from "./types";

const VALID_TOPICS: Set<string> = new Set<WebhookEventType>([
  "product/create",
  "product/update",
  "product/delete",
  "collection/create",
  "collection/update",
  "collection/delete",
  "page/create",
  "page/update",
]);

export function handleWebhook(
  payload: WebhookPayload,
  rules: AutomationRule[],
): { action: AutomationRuleAction; jobs: TranslationJob[] } {
  const matchedRule = evaluateRules(rules, payload);

  if (!matchedRule) {
    return { action: "skip", jobs: [] };
  }

  const jobs: TranslationJob[] = [];

  if (
    matchedRule.action === "auto_translate" ||
    matchedRule.action === "queue_for_review"
  ) {
    const job = createJob({
      shop: payload.shop,
      resourceType: payload.resourceType,
      resourceId: payload.resourceId,
      sourceLocale: "en",
      targetLocales: matchedRule.targetLocales,
      priority: matchedRule.priority,
      maxRetries: 3,
    });

    jobs.push(job);
  }

  return { action: matchedRule.action, jobs };
}

export function parseShopifyWebhook(
  topic: string,
  body: Record<string, unknown>,
): WebhookPayload {
  if (!VALID_TOPICS.has(topic)) {
    throw new Error(`Unsupported webhook topic: ${topic}`);
  }

  const resourceType = topic.split("/")[0];
  const id = body["id"] ?? body["admin_graphql_api_id"];

  if (id === undefined || id === null) {
    throw new Error("Webhook body missing resource id");
  }

  return {
    topic: topic as WebhookEventType,
    shop: String(body["shop"] ?? body["shop_domain"] ?? ""),
    resourceId: String(id),
    resourceType,
    fields: body,
  };
}
