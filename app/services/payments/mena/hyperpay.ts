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

const HYPERPAY_SANDBOX_URL = "https://test.oppwa.com/v1";
const HYPERPAY_PRODUCTION_URL = "https://oppwa.com/v1";

/**
 * HyperPay payment gateway integration.
 * Major MENA gateway supporting VISA, MasterCard, MADA, and Apple Pay.
 * Uses the same OPP (Open Payment Platform) as the Mada gateway but with
 * multi-brand support and broader regional coverage.
 */
export function createHyperPayGateway(config: MENAPaymentConfig): PaymentGateway {
  const baseUrl = config.sandbox ? HYPERPAY_SANDBOX_URL : HYPERPAY_PRODUCTION_URL;

  async function hyperPayFetch<T>(
    path: string,
    body: URLSearchParams,
    method: "POST" | "GET" = "POST",
  ): Promise<T> {
    const url = method === "GET"
      ? `${baseUrl}${path}?${body.toString()}`
      : `${baseUrl}${path}`;

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        ...(method === "POST" ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
      },
      ...(method === "POST" ? { body: body.toString() } : {}),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HyperPay API error (${response.status}): ${error}`);
    }

    return response.json() as Promise<T>;
  }

  return {
    provider: "hyperpay",
    supportedCurrencies: ["SAR", "AED", "EGP", "BHD", "KWD", "JOD"] as SupportedCurrency[],
    supportedCountries: ["SA", "AE", "EG", "BH", "KW", "JO"],

    isConfigured(): boolean {
      return Boolean(config.apiKey && config.merchantId);
    },

    async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
      const params = new URLSearchParams({
        entityId: config.merchantId ?? "",
        amount: request.amount.toFixed(2),
        currency: request.currency,
        paymentType: "DB",
        "merchant.transactionId": request.orderId,
        "customer.email": request.customerEmail,
        "customer.givenName": request.customerName.split(" ")[0] ?? request.customerName,
        "customer.surname": request.customerName.split(" ").slice(1).join(" ") || request.customerName,
        shopperResultUrl: request.returnUrl,
        notificationUrl: request.webhookUrl,
      });

      // HyperPay supports multiple payment brands in a single checkout
      params.set("paymentBrand", "VISA MASTER MADA APPLEPAY");

      if (request.customerPhone) {
        params.set("customer.phone", request.customerPhone);
      }

      if (request.shippingAddress) {
        params.set("shipping.street1", request.shippingAddress.line1);
        params.set("shipping.city", request.shippingAddress.city);
        params.set("shipping.country", request.shippingAddress.country);
        if (request.shippingAddress.postalCode) {
          params.set("shipping.postcode", request.shippingAddress.postalCode);
        }
      }

      if (request.billingAddress) {
        params.set("billing.street1", request.billingAddress.line1);
        params.set("billing.city", request.billingAddress.city);
        params.set("billing.country", request.billingAddress.country);
        if (request.billingAddress.postalCode) {
          params.set("billing.postcode", request.billingAddress.postalCode);
        }
      }

      const result = await hyperPayFetch<{
        id: string;
        result: { code: string; description: string };
        redirect?: { url: string };
        ndc: string;
      }>("/checkouts", params);

      const isSuccess = result.result.code.startsWith("000.");

      return {
        provider: "hyperpay",
        transactionId: result.id,
        status: isSuccess ? "pending" : "declined",
        checkoutUrl: result.redirect?.url,
        amount: request.amount,
        currency: request.currency,
        metadata: {
          resultCode: result.result.code,
          resultDescription: result.result.description,
          ndc: result.ndc,
        },
      };
    },

    async getPaymentStatus(transactionId: string): Promise<PaymentResponse> {
      const params = new URLSearchParams({
        entityId: config.merchantId ?? "",
      });

      const result = await hyperPayFetch<{
        id: string;
        result: { code: string; description: string };
        amount: string;
        currency: string;
        paymentBrand?: string;
      }>(`/checkouts/${transactionId}/payment`, params, "GET");

      return {
        provider: "hyperpay",
        transactionId: result.id,
        status: mapHyperPayStatus(result.result.code),
        amount: Number(result.amount),
        currency: result.currency as SupportedCurrency,
        metadata: {
          resultCode: result.result.code,
          resultDescription: result.result.description,
          ...(result.paymentBrand ? { paymentBrand: result.paymentBrand } : {}),
        },
      };
    },

    async refund(request: RefundRequest): Promise<RefundResponse> {
      const params = new URLSearchParams({
        entityId: config.merchantId ?? "",
        amount: String(request.amount ?? 0),
        currency: request.currency ?? "SAR",
        paymentType: "RF",
      });

      const result = await hyperPayFetch<{
        id: string;
        result: { code: string; description: string };
        amount: string;
        currency: string;
      }>(`/payments/${request.transactionId}`, params);

      return {
        provider: "hyperpay",
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
      try {
        return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
      } catch {
        return false;
      }
    },

    parseWebhookEvent(payload: Record<string, unknown>): WebhookEvent {
      const result = payload.result as Record<string, unknown> | undefined;
      return {
        provider: "hyperpay",
        eventType: String(payload.type ?? "payment"),
        transactionId: String(payload.id ?? ""),
        status: mapHyperPayStatus(String(result?.code ?? "unknown")),
        amount: Number(payload.amount ?? 0),
        currency: (String(payload.currency ?? "SAR")) as SupportedCurrency,
        rawPayload: payload,
        timestamp: new Date(String(payload.timestamp ?? new Date().toISOString())),
      };
    },
  };
}

/**
 * Map HyperPay/OPP result codes to unified payment status.
 * Uses the same OPP result code patterns as the Mada gateway.
 */
function mapHyperPayStatus(code: string): PaymentResponse["status"] {
  if (code.startsWith("000.000.") || code.startsWith("000.100.")) return "captured";
  if (code.startsWith("000.200.")) return "pending";
  if (code.startsWith("000.300.")) return "authorized";
  if (code.startsWith("800.")) return "declined";
  if (code.startsWith("700.")) return "declined";
  if (code.startsWith("600.")) return "declined";
  if (code.startsWith("100.")) return "declined";
  return "pending";
}
