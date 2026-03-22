import type {
  AutomationCondition,
  AutomationRule,
  WebhookPayload,
} from "./types";

export function evaluateRules(
  rules: AutomationRule[],
  payload: WebhookPayload,
): AutomationRule | null {
  const sorted = [...rules].sort((a, b) => b.priority - a.priority);

  for (const rule of sorted) {
    if (!rule.enabled) {
      continue;
    }

    if (rule.trigger !== payload.topic) {
      continue;
    }

    const allConditionsMet = rule.conditions.every((condition) =>
      evaluateCondition(condition, payload),
    );

    if (allConditionsMet) {
      return rule;
    }
  }

  return null;
}

export function evaluateCondition(
  condition: AutomationCondition,
  payload: WebhookPayload,
): boolean {
  const fieldValue = getFieldValue(condition.field, payload);

  switch (condition.operator) {
    case "equals":
      return String(fieldValue) === condition.value;

    case "contains":
      return String(fieldValue ?? "")
        .toLowerCase()
        .includes(condition.value.toLowerCase());

    case "starts_with":
      return String(fieldValue ?? "")
        .toLowerCase()
        .startsWith(condition.value.toLowerCase());

    case "in_collection": {
      const collections = payload.fields?.["collections"];

      if (!Array.isArray(collections)) {
        return false;
      }

      return collections.some(
        (c) =>
          (typeof c === "string" && c === condition.value) ||
          (typeof c === "object" &&
            c !== null &&
            "id" in c &&
            String(c.id) === condition.value),
      );
    }

    case "has_tag": {
      const tags = payload.fields?.["tags"];

      if (typeof tags === "string") {
        return tags
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .includes(condition.value.toLowerCase());
      }

      if (Array.isArray(tags)) {
        return tags.some(
          (t) =>
            typeof t === "string" &&
            t.toLowerCase() === condition.value.toLowerCase(),
        );
      }

      return false;
    }

    case "not_empty":
      return (
        fieldValue !== undefined &&
        fieldValue !== null &&
        String(fieldValue).trim() !== ""
      );

    default:
      return false;
  }
}

export function getDefaultRules(shop: string): AutomationRule[] {
  return [
    {
      id: crypto.randomUUID(),
      shop,
      name: "Auto-translate new products",
      enabled: true,
      trigger: "product/create",
      conditions: [
        {
          field: "title",
          operator: "not_empty",
          value: "",
        },
      ],
      action: "auto_translate",
      targetLocales: ["ar", "he"],
      priority: 10,
    },
    {
      id: crypto.randomUUID(),
      shop,
      name: "Queue updated products for review",
      enabled: true,
      trigger: "product/update",
      conditions: [],
      action: "queue_for_review",
      targetLocales: ["ar", "he"],
      priority: 5,
    },
    {
      id: crypto.randomUUID(),
      shop,
      name: "Auto-translate new collections",
      enabled: true,
      trigger: "collection/create",
      conditions: [],
      action: "auto_translate",
      targetLocales: ["ar", "he"],
      priority: 8,
    },
    {
      id: crypto.randomUUID(),
      shop,
      name: "Auto-translate new pages",
      enabled: true,
      trigger: "page/create",
      conditions: [],
      action: "auto_translate",
      targetLocales: ["ar", "he"],
      priority: 7,
    },
  ];
}

function getFieldValue(
  field: string,
  payload: WebhookPayload,
): unknown {
  if (field === "resourceType") {
    return payload.resourceType;
  }

  if (field === "resourceId") {
    return payload.resourceId;
  }

  if (field === "shop") {
    return payload.shop;
  }

  return payload.fields?.[field];
}
