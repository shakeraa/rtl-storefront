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

const SADAD_SANDBOX_URL = "https://api-s.sadad.qa/api/v1";
const SADAD_PRODUCTION_URL = "https://api.sadad.qa/api/v1";

/**
 * Saudi SADAD billing system integration.
 * SADAD is the national Electronic Bill Presentment and Payment (EBPP) system
 * in Saudi Arabia, enabling customers to pay bills through banks and ATMs.
 * Saudi-only, SAR currency.
 */
export function createSadadGateway(config: MENAPaymentConfig): PaymentGateway {
  const baseUrl = config.sandbox ? SADAD_SANDBOX_URL : SADAD_PRODUCTION_URL;

  async function sadadFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
        "X-Merchant-Id": config.merchantId ?? "",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SADAD API error (${response.status}): ${error}`);
    }

    return response.json() as Promise<T>;
  }

  return {
    provider: "sadad",
    supportedCurrencies: ["SAR"] as SupportedCurrency[],
    supportedCountries: ["SA"],

    isConfigured(): boolean {
      return Boolean(config.apiKey && config.merchantId);
    },

    async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
      if (request.currency !== "SAR") {
        throw new Error("SADAD only supports SAR currency");
      }

      const payload = {
        billNumber: request.orderId,
        amount: request.amount,
        currency: "SAR",
        description: request.description ?? `Order ${request.orderId}`,
        customerName: request.customerName,
        customerEmail: request.customerEmail,
        customerPhone: request.customerPhone,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        callbackUrl: request.webhookUrl,
        returnUrl: request.returnUrl,
        cancelUrl: request.cancelUrl,
        metadata: request.metadata,
      };

      const result = await sadadFetch<{
        billId: string;
        sadadNumber: string;
        status: string;
        paymentUrl?: string;
      }>("/bills", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return {
        provider: "sadad",
        transactionId: result.billId,
        status: mapSadadStatus(result.status),
        checkoutUrl: result.paymentUrl,
        amount: request.amount,
        currency: "SAR",
        metadata: {
          sadadNumber: result.sadadNumber,
        },
      };
    },

    async getPaymentStatus(transactionId: string): Promise<PaymentResponse> {
      const result = await sadadFetch<{
        billId: string;
        status: string;
        amount: number;
        currency: string;
        sadadNumber: string;
        paidAt?: string;
      }>(`/bills/${transactionId}`);

      return {
        provider: "sadad",
        transactionId: result.billId,
        status: mapSadadStatus(result.status),
        amount: result.amount,
        currency: "SAR",
        metadata: {
          sadadNumber: result.sadadNumber,
          ...(result.paidAt ? { paidAt: result.paidAt } : {}),
        },
      };
    },

    async refund(request: RefundRequest): Promise<RefundResponse> {
      const payload = {
        billId: request.transactionId,
        amount: request.amount,
        reason: request.reason ?? "Refund requested",
      };

      const result = await sadadFetch<{
        refundId: string;
        billId: string;
        status: string;
        amount: number;
      }>(`/bills/${request.transactionId}/refund`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return {
        provider: "sadad",
        refundId: result.refundId,
        transactionId: request.transactionId,
        amount: result.amount,
        currency: "SAR",
        status: result.status === "REFUNDED" ? "completed" : "pending",
      };
    },

    verifyWebhook(payload: string, signature: string): boolean {
      if (!config.webhookSecret) return false;
      const expected = createHmac("sha256", config.webhookSecret).update(payload).digest("hex");
      return expected === signature;
    },

    parseWebhookEvent(payload: Record<string, unknown>): WebhookEvent {
      return {
        provider: "sadad",
        eventType: String(payload.eventType ?? "PAYMENT_UPDATE"),
        transactionId: String(payload.billId ?? ""),
        status: mapSadadStatus(String(payload.status ?? "PENDING")),
        amount: Number(payload.amount ?? 0),
        currency: "SAR",
        rawPayload: payload,
        timestamp: new Date(String(payload.timestamp ?? new Date().toISOString())),
      };
    },
  };
}

/**
 * Map SADAD statuses to unified payment status.
 * SADAD uses: PAID, PENDING, EXPIRED, CANCELLED.
 */
function mapSadadStatus(status: string): PaymentResponse["status"] {
  const statusMap: Record<string, PaymentResponse["status"]> = {
    PAID: "captured",
    PENDING: "pending",
    EXPIRED: "expired",
    CANCELLED: "cancelled",
    CREATED: "pending",
    REFUNDED: "refunded",
    PARTIALLY_REFUNDED: "partially_refunded",
    FAILED: "declined",
  };
  return statusMap[status.toUpperCase()] ?? "pending";
}
