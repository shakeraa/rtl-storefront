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

/**
 * Mada card integration for Saudi Arabia.
 * Mada is the national payment network connecting all ATMs and POS in Saudi Arabia.
 * Typically processed through a payment gateway (e.g., HyperPay, PayFort).
 */
export function createMadaGateway(config: MENAPaymentConfig): PaymentGateway {
  const baseUrl = config.sandbox
    ? "https://test.oppwa.com/v1"
    : "https://oppwa.com/v1";

  async function madaFetch<T>(path: string, body: URLSearchParams): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Mada gateway error (${response.status}): ${error}`);
    }

    return response.json() as Promise<T>;
  }

  return {
    provider: "mada",
    supportedCurrencies: ["SAR"] as SupportedCurrency[],
    supportedCountries: ["SA"],

    isConfigured(): boolean {
      return Boolean(config.apiKey && config.merchantId);
    },

    async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
      const params = new URLSearchParams({
        entityId: config.merchantId ?? "",
        amount: request.amount.toFixed(2),
        currency: request.currency,
        paymentBrand: "MADA",
        paymentType: "DB",
        "merchant.transactionId": request.orderId,
        "customer.email": request.customerEmail,
        "customer.givenName": request.customerName.split(" ")[0] ?? request.customerName,
        "customer.surname": request.customerName.split(" ").slice(1).join(" ") || request.customerName,
        shopperResultUrl: request.returnUrl,
      });

      if (request.shippingAddress) {
        params.set("shipping.street1", request.shippingAddress.line1);
        params.set("shipping.city", request.shippingAddress.city);
        params.set("shipping.country", request.shippingAddress.country);
        if (request.shippingAddress.postalCode) {
          params.set("shipping.postcode", request.shippingAddress.postalCode);
        }
      }

      const result = await madaFetch<{
        id: string;
        result: { code: string; description: string };
        redirect?: { url: string };
      }>("/checkouts", params);

      const isSuccess = result.result.code.startsWith("000.");

      return {
        provider: "mada",
        transactionId: result.id,
        status: isSuccess ? "pending" : "declined",
        checkoutUrl: result.redirect?.url,
        amount: request.amount,
        currency: request.currency,
        metadata: {
          resultCode: result.result.code,
          resultDescription: result.result.description,
        },
      };
    },

    async getPaymentStatus(transactionId: string): Promise<PaymentResponse> {
      const params = new URLSearchParams({
        entityId: config.merchantId ?? "",
      });

      const response = await fetch(
        `${baseUrl}/checkouts/${transactionId}/payment?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${config.apiKey}` },
        },
      );

      if (!response.ok) {
        throw new Error(`Mada status check failed: ${response.status}`);
      }

      const result = (await response.json()) as {
        id: string;
        result: { code: string };
        amount: string;
        currency: string;
      };

      return {
        provider: "mada",
        transactionId: result.id,
        status: mapMadaStatus(result.result.code),
        amount: Number(result.amount),
        currency: result.currency as SupportedCurrency,
      };
    },

    async refund(request: RefundRequest): Promise<RefundResponse> {
      const params = new URLSearchParams({
        entityId: config.merchantId ?? "",
        amount: String(request.amount ?? 0),
        currency: "SAR",
        paymentType: "RF",
      });

      const result = await madaFetch<{
        id: string;
        result: { code: string };
        amount: string;
        currency: string;
      }>(`/payments/${request.transactionId}`, params);

      return {
        provider: "mada",
        refundId: result.id,
        transactionId: request.transactionId,
        amount: Number(result.amount),
        currency: result.currency as SupportedCurrency,
        status: result.result.code.startsWith("000.") ? "completed" : "failed",
      };
    },

    verifyWebhook(payload: string, signature: string): boolean {
      if (!config.webhookSecret) return false;
      const expected = createHmac("sha256", config.webhookSecret).update(payload).digest("hex");
      return expected === signature;
    },

    parseWebhookEvent(payload: Record<string, unknown>): WebhookEvent {
      const result = payload.result as Record<string, unknown> | undefined;
      return {
        provider: "mada",
        eventType: String(payload.type ?? "payment"),
        transactionId: String(payload.id ?? ""),
        status: mapMadaStatus(String(result?.code ?? "unknown")),
        amount: Number(payload.amount ?? 0),
        currency: (String(payload.currency ?? "SAR")) as SupportedCurrency,
        rawPayload: payload,
        timestamp: new Date(String(payload.timestamp ?? new Date().toISOString())),
      };
    },
  };
}

function mapMadaStatus(code: string): PaymentResponse["status"] {
  if (code.startsWith("000.000.") || code.startsWith("000.100.")) return "captured";
  if (code.startsWith("000.200.")) return "pending";
  if (code.startsWith("800.")) return "declined";
  if (code.startsWith("700.")) return "declined";
  return "pending";
}
