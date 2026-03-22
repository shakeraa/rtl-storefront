/**
 * T0289 - WhatsApp Business Integration
 * WhatsApp Cloud API integration for order notifications and customer messaging.
 */

const WHATSAPP_API_BASE = "https://graph.facebook.com/v18.0";

export interface WhatsAppConfig {
  apiKey: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookVerifyToken: string;
}

export interface WhatsAppTemplate {
  name: string;
  language: string;
  components: Array<{
    type: "header" | "body" | "button";
    text: string;
  }>;
}

interface SendResult {
  messageId: string;
  status: string;
}

/**
 * Pre-defined order notification templates.
 */
const ORDER_TEMPLATES: Record<string, Record<string, string>> = {
  order_confirmed: {
    ar: "order_confirmed_ar",
    en: "order_confirmed_en",
  },
  order_shipped: {
    ar: "order_shipped_ar",
    en: "order_shipped_en",
  },
  order_delivered: {
    ar: "order_delivered_ar",
    en: "order_delivered_en",
  },
  return_initiated: {
    ar: "return_initiated_ar",
    en: "return_initiated_en",
  },
};

async function whatsappFetch<T>(
  config: WhatsAppConfig,
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${WHATSAPP_API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WhatsApp API error (${response.status}): ${error}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Send a pre-approved template message via WhatsApp Business API.
 */
export async function sendTemplateMessage(
  config: WhatsAppConfig,
  to: string,
  templateName: string,
  locale: string,
  variables: Record<string, string>,
): Promise<SendResult> {
  const language = locale.startsWith("ar") ? "ar" : "en";
  const parameters = Object.values(variables).map((value) => ({
    type: "text",
    text: value,
  }));

  const result = await whatsappFetch<{
    messages: Array<{ id: string }>;
  }>(config, `/${config.phoneNumberId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: language },
        components: [
          {
            type: "body",
            parameters,
          },
        ],
      },
    }),
  });

  return {
    messageId: result.messages[0]?.id ?? "",
    status: "sent",
  };
}

/**
 * Send a free-form text message (only within the 24-hour messaging window).
 */
export async function sendTextMessage(
  config: WhatsAppConfig,
  to: string,
  text: string,
): Promise<{ messageId: string }> {
  const result = await whatsappFetch<{
    messages: Array<{ id: string }>;
  }>(config, `/${config.phoneNumberId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  });

  return {
    messageId: result.messages[0]?.id ?? "",
  };
}

/**
 * Send an order status update via the appropriate WhatsApp template.
 */
export async function sendOrderUpdate(
  config: WhatsAppConfig,
  to: string,
  orderId: string,
  status: string,
  locale: string,
): Promise<SendResult> {
  const language = locale.startsWith("ar") ? "ar" : "en";
  const templateMap = ORDER_TEMPLATES[status];
  const templateName = templateMap?.[language] ?? templateMap?.en ?? status;

  return sendTemplateMessage(config, to, templateName, locale, {
    orderId,
    status,
  });
}

/**
 * Verify a WhatsApp webhook subscription request.
 * Returns the challenge string if verification succeeds, or null if it fails.
 */
export function verifyWebhook(
  params: { mode: string; token: string; challenge: string },
  config: WhatsAppConfig,
): string | null {
  if (params.mode === "subscribe" && params.token === config.webhookVerifyToken) {
    return params.challenge;
  }
  return null;
}

/**
 * Parse an incoming WhatsApp webhook event into a normalized structure.
 */
export function parseWebhookEvent(
  body: Record<string, unknown>,
): {
  type: "message" | "status";
  from?: string;
  text?: string;
  messageId?: string;
} {
  const entry = (body.entry as Array<Record<string, unknown>> | undefined)?.[0];
  const changes = (entry?.changes as Array<Record<string, unknown>> | undefined)?.[0];
  const value = changes?.value as Record<string, unknown> | undefined;

  // Check for incoming messages
  const messages = value?.messages as Array<Record<string, unknown>> | undefined;
  if (messages && messages.length > 0) {
    const msg = messages[0];
    const textObj = msg.text as Record<string, unknown> | undefined;
    return {
      type: "message",
      from: String(msg.from ?? ""),
      text: textObj ? String(textObj.body ?? "") : undefined,
      messageId: String(msg.id ?? ""),
    };
  }

  // Check for status updates
  const statuses = value?.statuses as Array<Record<string, unknown>> | undefined;
  if (statuses && statuses.length > 0) {
    const statusObj = statuses[0];
    return {
      type: "status",
      messageId: String(statusObj.id ?? ""),
      from: String(statusObj.recipient_id ?? ""),
    };
  }

  // Default: treat as status event
  return { type: "status" };
}
