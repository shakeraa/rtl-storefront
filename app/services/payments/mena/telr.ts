import { createHmac } from "node:crypto";
import type {
  MENAPaymentConfig,
  PaymentGateway,
  PaymentRequest,
  PaymentResponse,
  RefundRequest,
  RefundResponse,
  SupportedCurrency,
  WebhookEvent,
} from "./types";

const TELR_SANDBOX_URL = "https://secure.telr.com/gateway/order.json";
const TELR_PRODUCTION_URL = "https://secure.telr.com/gateway/order.json";

/**
 * Telr payment gateway integration.
 * Supports UAE and Saudi Arabia with multiple card types.
 */
export function createTelrGateway(config: MENAPaymentConfig): PaymentGateway {
  async function telrFetch<T>(body: Record<string, unknown>): Promise<T> {
    const url = config.sandbox ? TELR_SANDBOX_URL : TELR_PRODUCTION_URL;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        method: "create",
        store: config.merchantId,
        authkey: config.apiKey,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Telr API error (${response.status}): ${error}`);
    }

    return response.json() as Promise<T>;
  }

  return {
    provider: "telr",
    supportedCurrencies: ["AED", "SAR", "USD", "BHD", "KWD", "QAR", "OMR"] as SupportedCurrency[],
    supportedCountries: ["AE", "SA", "BH", "KW", "QA", "OM"],

    isConfigured(): boolean {
      return Boolean(config.apiKey && config.merchantId);
    },

    async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
      const result = await telrFetch<{
        order: { ref: string; url: string };
        error?: { message: string };
      }>({
        order: {
          cartid: request.orderId,
          test: config.sandbox ? "1" : "0",
          amount: request.amount.toFixed(2),
          currency: request.currency,
          description: request.description ?? `Order ${request.orderId}`,
        },
        return: {
          authorised: request.returnUrl,
          declined: request.cancelUrl,
          cancelled: request.cancelUrl,
        },
        customer: {
          email: request.customerEmail,
          name: {
            forenames: request.customerName.split(" ")[0] ?? request.customerName,
            surname: request.customerName.split(" ").slice(1).join(" ") || request.customerName,
          },
          phone: request.customerPhone ?? "",
          address: request.shippingAddress
            ? {
                line1: request.shippingAddress.line1,
                city: request.shippingAddress.city,
                country: request.shippingAddress.country,
              }
            : undefined,
        },
      });

      if (result.error) {
        throw new Error(`Telr error: ${result.error.message}`);
      }

      return {
        provider: "telr",
        transactionId: result.order.ref,
        status: "pending",
        checkoutUrl: result.order.url,
        amount: request.amount,
        currency: request.currency,
      };
    },

    async getPaymentStatus(transactionId: string): Promise<PaymentResponse> {
      const url = config.sandbox ? TELR_SANDBOX_URL : TELR_PRODUCTION_URL;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "check",
          store: config.merchantId,
          authkey: config.apiKey,
          order: { ref: transactionId },
        }),
      });

      if (!response.ok) {
        throw new Error(`Telr status check failed: ${response.status}`);
      }

      const result = (await response.json()) as {
        order: {
          ref: string;
          status: { code: number; text: string };
          amount: string;
          currency: string;
        };
      };

      return {
        provider: "telr",
        transactionId: result.order.ref,
        status: mapTelrStatus(result.order.status.code),
        amount: Number(result.order.amount),
        currency: result.order.currency as SupportedCurrency,
      };
    },

    async refund(request: RefundRequest): Promise<RefundResponse> {
      const url = config.sandbox ? TELR_SANDBOX_URL : TELR_PRODUCTION_URL;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "refund",
          store: config.merchantId,
          authkey: config.apiKey,
          transaction: { ref: request.transactionId },
          refund: {
            amount: request.amount?.toFixed(2),
            note: request.reason ?? "Refund",
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Telr refund failed: ${response.status}`);
      }

      const result = (await response.json()) as {
        refund: { ref: string; status: string; amount: string; currency: string };
      };

      return {
        provider: "telr",
        refundId: result.refund.ref,
        transactionId: request.transactionId,
        amount: Number(result.refund.amount),
        currency: result.refund.currency as SupportedCurrency,
        status: result.refund.status === "A" ? "completed" : "pending",
      };
    },

    verifyWebhook(payload: string, signature: string): boolean {
      if (!config.webhookSecret) return false;
      const expected = createHmac("sha256", config.webhookSecret).update(payload).digest("hex");
      return expected === signature;
    },

    parseWebhookEvent(payload: Record<string, unknown>): WebhookEvent {
      const order = payload.order as Record<string, unknown> | undefined;
      const status = order?.status as Record<string, unknown> | undefined;
      return {
        provider: "telr",
        eventType: String(payload.event ?? "payment_update"),
        transactionId: String(order?.ref ?? ""),
        status: mapTelrStatus(Number(status?.code ?? 0)),
        amount: Number(order?.amount ?? 0),
        currency: (String(order?.currency ?? "AED")) as SupportedCurrency,
        rawPayload: payload,
        timestamp: new Date(),
      };
    },
  };
}

function mapTelrStatus(code: number): PaymentResponse["status"] {
  // Telr status codes: 1=pending, 2=authorized, 3=captured, -1=declined, -2=cancelled, -3=expired
  const statusMap: Record<number, PaymentResponse["status"]> = {
    1: "pending",
    2: "authorized",
    3: "captured",
    [-1]: "declined",
    [-2]: "cancelled",
    [-3]: "expired",
  };
  return statusMap[code] ?? "pending";
}
