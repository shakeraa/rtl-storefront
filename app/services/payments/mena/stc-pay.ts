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

const STC_SANDBOX_URL = "https://sandbox.stcpay.com.sa/api/v1";
const STC_PRODUCTION_URL = "https://api.stcpay.com.sa/api/v1";

/**
 * STC Pay mobile wallet integration for Saudi Arabia.
 * STC Pay is the leading mobile wallet in Saudi Arabia.
 */
export function createStcPayGateway(config: MENAPaymentConfig): PaymentGateway {
  const baseUrl = config.sandbox ? STC_SANDBOX_URL : STC_PRODUCTION_URL;

  async function stcFetch<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": config.apiKey,
        "X-Merchant-Id": config.merchantId ?? "",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`STC Pay API error (${response.status}): ${error}`);
    }

    return response.json() as Promise<T>;
  }

  return {
    provider: "stc_pay",
    supportedCurrencies: ["SAR"] as SupportedCurrency[],
    supportedCountries: ["SA"],

    isConfigured(): boolean {
      return Boolean(config.apiKey && config.merchantId);
    },

    async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
      const result = await stcFetch<{
        paymentReference: string;
        redirectUrl: string;
        status: string;
      }>("/payments/initiate", {
        merchantId: config.merchantId,
        amount: request.amount,
        currency: request.currency,
        orderId: request.orderId,
        customerMobile: request.customerPhone ?? "",
        customerEmail: request.customerEmail,
        description: request.description ?? `Order ${request.orderId}`,
        returnUrl: request.returnUrl,
        cancelUrl: request.cancelUrl,
        notificationUrl: request.webhookUrl,
      });

      return {
        provider: "stc_pay",
        transactionId: result.paymentReference,
        status: "pending",
        checkoutUrl: result.redirectUrl,
        amount: request.amount,
        currency: request.currency,
      };
    },

    async getPaymentStatus(transactionId: string): Promise<PaymentResponse> {
      const result = await stcFetch<{
        paymentReference: string;
        status: string;
        amount: number;
        currency: string;
      }>("/payments/status", {
        merchantId: config.merchantId,
        paymentReference: transactionId,
      });

      return {
        provider: "stc_pay",
        transactionId: result.paymentReference,
        status: mapStcStatus(result.status),
        amount: result.amount,
        currency: result.currency as SupportedCurrency,
      };
    },

    async refund(request: RefundRequest): Promise<RefundResponse> {
      const result = await stcFetch<{
        refundReference: string;
        status: string;
        amount: number;
        currency: string;
      }>("/payments/refund", {
        merchantId: config.merchantId,
        paymentReference: request.transactionId,
        amount: request.amount,
        reason: request.reason ?? "Customer refund",
      });

      return {
        provider: "stc_pay",
        refundId: result.refundReference,
        transactionId: request.transactionId,
        amount: result.amount,
        currency: result.currency as SupportedCurrency,
        status: result.status === "REFUNDED" ? "completed" : "pending",
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
        provider: "stc_pay",
        eventType: String(payload.eventType ?? "payment_update"),
        transactionId: String(payload.paymentReference ?? ""),
        status: mapStcStatus(String(payload.status ?? "unknown")),
        amount: Number(payload.amount ?? 0),
        currency: (String(payload.currency ?? "SAR")) as SupportedCurrency,
        rawPayload: payload,
        timestamp: new Date(String(payload.timestamp ?? new Date().toISOString())),
      };
    },
  };
}

function mapStcStatus(status: string): PaymentResponse["status"] {
  const statusMap: Record<string, PaymentResponse["status"]> = {
    INITIATED: "pending",
    AUTHORIZED: "authorized",
    CAPTURED: "captured",
    PAID: "captured",
    DECLINED: "declined",
    FAILED: "declined",
    REFUNDED: "refunded",
    CANCELLED: "cancelled",
    EXPIRED: "expired",
  };
  return statusMap[status.toUpperCase()] ?? "pending";
}
