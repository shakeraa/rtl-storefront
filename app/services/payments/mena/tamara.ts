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

const TAMARA_SANDBOX_URL = "https://api-sandbox.tamara.co";
const TAMARA_PRODUCTION_URL = "https://api.tamara.co";

/**
 * Tamara BNPL (Buy Now Pay Later) integration.
 * Supports UAE, Saudi Arabia, and Kuwait markets.
 */
export function createTamaraGateway(config: MENAPaymentConfig): PaymentGateway {
  const baseUrl = config.sandbox ? TAMARA_SANDBOX_URL : TAMARA_PRODUCTION_URL;

  async function tamaraFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Tamara API error (${response.status}): ${error}`);
    }

    return response.json() as Promise<T>;
  }

  return {
    provider: "tamara",
    supportedCurrencies: ["SAR", "AED", "KWD", "BHD"] as SupportedCurrency[],
    supportedCountries: ["SA", "AE", "KW", "BH"],

    isConfigured(): boolean {
      return Boolean(config.apiKey);
    },

    async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
      const payload = {
        order_reference_id: request.orderId,
        total_amount: {
          amount: request.amount,
          currency: request.currency,
        },
        description: request.description ?? `Order ${request.orderId}`,
        country_code: request.shippingAddress?.country ?? "SA",
        payment_type: "PAY_BY_INSTALMENTS",
        instalments: 3,
        locale: "ar_SA",
        items: (request.lineItems ?? []).map((item) => ({
          reference_id: item.sku ?? item.name,
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
          unit_price: { amount: item.unitPrice, currency: request.currency },
          total_amount: { amount: item.totalAmount, currency: request.currency },
          image_url: item.imageUrl,
        })),
        consumer: {
          first_name: request.customerName.split(" ")[0] ?? request.customerName,
          last_name: request.customerName.split(" ").slice(1).join(" ") || request.customerName,
          email: request.customerEmail,
          phone_number: request.customerPhone ?? "",
        },
        shipping_address: request.shippingAddress
          ? {
              first_name: request.shippingAddress.firstName,
              last_name: request.shippingAddress.lastName,
              line1: request.shippingAddress.line1,
              line2: request.shippingAddress.line2 ?? "",
              city: request.shippingAddress.city,
              country_code: request.shippingAddress.country,
              phone_number: request.shippingAddress.phone ?? "",
            }
          : undefined,
        merchant_url: {
          success: request.returnUrl,
          failure: request.cancelUrl,
          cancel: request.cancelUrl,
          notification: request.webhookUrl,
        },
      };

      const result = await tamaraFetch<{ order_id: string; checkout_url: string }>("/checkout", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return {
        provider: "tamara",
        transactionId: result.order_id,
        status: "pending",
        checkoutUrl: result.checkout_url,
        amount: request.amount,
        currency: request.currency,
      };
    },

    async getPaymentStatus(transactionId: string): Promise<PaymentResponse> {
      const result = await tamaraFetch<{
        order_id: string;
        status: string;
        total_amount: { amount: number; currency: string };
      }>(`/orders/${transactionId}`);

      return {
        provider: "tamara",
        transactionId: result.order_id,
        status: mapTamaraStatus(result.status),
        amount: result.total_amount.amount,
        currency: result.total_amount.currency as SupportedCurrency,
      };
    },

    async refund(request: RefundRequest): Promise<RefundResponse> {
      const result = await tamaraFetch<{
        refund_id: string;
        status: string;
      }>(`/orders/${request.transactionId}/refunds`, {
        method: "POST",
        body: JSON.stringify({
          total_amount: request.amount ? { amount: request.amount, currency: "SAR" } : undefined,
          comment: request.reason ?? "Refund requested",
        }),
      });

      return {
        provider: "tamara",
        refundId: result.refund_id,
        transactionId: request.transactionId,
        amount: request.amount ?? 0,
        currency: "SAR",
        status: result.status === "fully_refunded" ? "completed" : "pending",
      };
    },

    verifyWebhook(payload: string, signature: string): boolean {
      if (!config.webhookSecret) return false;
      const expected = createHmac("sha256", config.webhookSecret).update(payload).digest("hex");
      return expected === signature;
    },

    parseWebhookEvent(payload: Record<string, unknown>): WebhookEvent {
      return {
        provider: "tamara",
        eventType: String(payload.event_type ?? "unknown"),
        transactionId: String(payload.order_id ?? ""),
        status: mapTamaraStatus(String(payload.order_status ?? "unknown")),
        amount: Number(payload.amount ?? 0),
        currency: (String(payload.currency ?? "SAR")) as SupportedCurrency,
        rawPayload: payload,
        timestamp: new Date(String(payload.created_at ?? new Date().toISOString())),
      };
    },
  };
}

function mapTamaraStatus(status: string): PaymentResponse["status"] {
  const statusMap: Record<string, PaymentResponse["status"]> = {
    new: "pending",
    approved: "authorized",
    authorised: "authorized",
    captured: "captured",
    fully_captured: "captured",
    declined: "declined",
    fully_refunded: "refunded",
    partially_refunded: "partially_refunded",
    canceled: "cancelled",
    expired: "expired",
  };
  return statusMap[status.toLowerCase()] ?? "pending";
}
