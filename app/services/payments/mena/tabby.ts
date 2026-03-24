import { createHmac, timingSafeEqual } from "node:crypto";
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

const TABBY_SANDBOX_URL = "https://api-sandbox.tabby.ai/api/v2";
const TABBY_PRODUCTION_URL = "https://api.tabby.ai/api/v2";

/**
 * Tabby BNPL integration.
 * Supports MENA-wide markets with installment payments.
 */
export function createTabbyGateway(config: MENAPaymentConfig): PaymentGateway {
  const baseUrl = config.sandbox ? TABBY_SANDBOX_URL : TABBY_PRODUCTION_URL;

  async function tabbyFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.secretKey ?? config.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Tabby API error (${response.status}): ${error}`);
    }

    return response.json() as Promise<T>;
  }

  return {
    provider: "tabby",
    supportedCurrencies: ["SAR", "AED", "KWD", "BHD", "QAR", "EGP"] as SupportedCurrency[],
    supportedCountries: ["SA", "AE", "KW", "BH", "QA", "EG"],

    isConfigured(): boolean {
      return Boolean(config.apiKey);
    },

    async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
      const payload = {
        payment: {
          amount: String(request.amount),
          currency: request.currency,
          description: request.description ?? `Order ${request.orderId}`,
          buyer: {
            phone: request.customerPhone ?? "",
            email: request.customerEmail,
            name: request.customerName,
          },
          shipping_address: request.shippingAddress
            ? {
                city: request.shippingAddress.city,
                address: request.shippingAddress.line1,
                zip: request.shippingAddress.postalCode ?? "",
              }
            : undefined,
          order: {
            reference_id: request.orderId,
            items: (request.lineItems ?? []).map((item) => ({
              title: item.name,
              quantity: item.quantity,
              unit_price: String(item.unitPrice),
              reference_id: item.sku ?? item.name,
              image_url: item.imageUrl,
              category: "general",
            })),
          },
          buyer_history: {
            registered_since: new Date().toISOString(),
            loyalty_level: 0,
          },
        },
        lang: "ar",
        merchant_code: config.merchantId ?? "",
        merchant_urls: {
          success: request.returnUrl,
          cancel: request.cancelUrl,
          failure: request.cancelUrl,
        },
      };

      const result = await tabbyFetch<{
        id: string;
        configuration: { available_products: { installments: { web_url: string } } };
        status: string;
      }>("/checkout", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return {
        provider: "tabby",
        transactionId: result.id,
        status: "pending",
        checkoutUrl: result.configuration?.available_products?.installments?.web_url,
        amount: request.amount,
        currency: request.currency,
      };
    },

    async getPaymentStatus(transactionId: string): Promise<PaymentResponse> {
      const result = await tabbyFetch<{
        id: string;
        status: string;
        amount: string;
        currency: string;
      }>(`/payments/${transactionId}`);

      return {
        provider: "tabby",
        transactionId: result.id,
        status: mapTabbyStatus(result.status),
        amount: Number(result.amount),
        currency: result.currency as SupportedCurrency,
      };
    },

    async refund(request: RefundRequest): Promise<RefundResponse> {
      const result = await tabbyFetch<{
        id: string;
        status: string;
        amount: string;
        currency: string;
      }>(`/payments/${request.transactionId}/refunds`, {
        method: "POST",
        body: JSON.stringify({
          amount: String(request.amount ?? 0),
          reason: request.reason,
        }),
      });

      return {
        provider: "tabby",
        refundId: result.id,
        transactionId: request.transactionId,
        amount: Number(result.amount),
        currency: result.currency as SupportedCurrency,
        status: result.status === "refunded" ? "completed" : "pending",
      };
    },

    verifyWebhook(payload: string, signature: string): boolean {
      if (!config.webhookSecret) return false;
      const expected = createHmac("sha256", config.webhookSecret).update(payload).digest("hex");
      try {
        return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
      } catch {
        return false;
      }
    },

    parseWebhookEvent(payload: Record<string, unknown>): WebhookEvent {
      return {
        provider: "tabby",
        eventType: String(payload.type ?? "unknown"),
        transactionId: String(payload.id ?? ""),
        status: mapTabbyStatus(String(payload.status ?? "unknown")),
        amount: Number(payload.amount ?? 0),
        currency: (String(payload.currency ?? "SAR")) as SupportedCurrency,
        rawPayload: payload,
        timestamp: new Date(String(payload.created_at ?? new Date().toISOString())),
      };
    },
  };
}

function mapTabbyStatus(status: string): PaymentResponse["status"] {
  const statusMap: Record<string, PaymentResponse["status"]> = {
    created: "pending",
    approved: "authorized",
    authorized: "authorized",
    closed: "captured",
    rejected: "declined",
    refunded: "refunded",
    expired: "expired",
  };
  return statusMap[status.toLowerCase()] ?? "pending";
}
