import { createHash, createHmac, timingSafeEqual } from "node:crypto";
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

const PAYFORT_SANDBOX_URL = "https://sbpaymentservices.payfort.com/FortAPI/paymentApi";
const PAYFORT_PRODUCTION_URL = "https://paymentservices.payfort.com/FortAPI/paymentApi";

/**
 * PayFort (Amazon Payment Services) integration.
 * Major MENA payment gateway supporting UAE, Saudi Arabia, Egypt, and GCC countries.
 */
export function createPayFortGateway(config: MENAPaymentConfig): PaymentGateway {
  const apiUrl = config.sandbox ? PAYFORT_SANDBOX_URL : PAYFORT_PRODUCTION_URL;

  /**
   * Generate PayFort signature for requests.
   * SHA-256 hash of sorted request parameters concatenated with request passphrase.
   */
  function generateSignature(params: Record<string, string>, passphrase?: string): string {
    const phrase = passphrase ?? config.secretKey ?? "";
    const sortedKeys = Object.keys(params).sort();
    const signatureString =
      phrase +
      sortedKeys.map((key) => `${key}=${params[key]}`).join("") +
      phrase;
    return createHash("sha256").update(signatureString).digest("hex");
  }

  /**
   * Currency-aware minor unit multiplier.
   * KWD, BHD, OMR use 3 decimal places; JPY uses 0; others use 2.
   */
  const getMinorUnitMultiplier = (currency: string): number => {
    const threeDecimal = ['KWD', 'BHD', 'OMR'];
    const zeroDecimal = ['JPY'];
    if (threeDecimal.includes(currency.toUpperCase())) return 1000;
    if (zeroDecimal.includes(currency.toUpperCase())) return 1;
    return 100;
  };

  async function payfortFetch<T>(params: Record<string, string>): Promise<T> {
    const signature = generateSignature(params);
    const body = { ...params, signature };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`PayFort API error (${response.status}): ${error}`);
    }

    return response.json() as Promise<T>;
  }

  return {
    provider: "payfort",
    supportedCurrencies: ["AED", "SAR", "EGP", "BHD", "KWD", "QAR", "OMR"] as SupportedCurrency[],
    supportedCountries: ["AE", "SA", "EG", "BH", "KW", "QA", "OM"],

    isConfigured(): boolean {
      return Boolean(config.apiKey && config.secretKey && config.merchantId);
    },

    async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
      const params: Record<string, string> = {
        command: "PURCHASE",
        access_code: config.apiKey,
        merchant_identifier: config.merchantId ?? "",
        merchant_reference: request.orderId,
        amount: String(Math.round(request.amount * getMinorUnitMultiplier(request.currency))),
        currency: request.currency,
        language: "ar",
        customer_email: request.customerEmail,
        customer_name: request.customerName,
        return_url: request.returnUrl,
      };

      if (request.customerPhone) {
        params.phone_number = request.customerPhone;
      }

      if (request.shippingAddress) {
        params.shipping_address = [
          request.shippingAddress.line1,
          request.shippingAddress.city,
          request.shippingAddress.country,
        ].join(", ");
      }

      const result = await payfortFetch<{
        fort_id: string;
        merchant_reference: string;
        response_code: string;
        response_message: string;
        status: string;
        "3ds_url"?: string;
      }>(params);

      return {
        provider: "payfort",
        transactionId: result.fort_id,
        status: mapPayFortStatus(result.status),
        checkoutUrl: result["3ds_url"],
        amount: request.amount,
        currency: request.currency,
        metadata: {
          responseCode: result.response_code,
          responseMessage: result.response_message,
          merchantReference: result.merchant_reference,
        },
      };
    },

    async getPaymentStatus(transactionId: string): Promise<PaymentResponse> {
      const params: Record<string, string> = {
        query_command: "CHECK_STATUS",
        access_code: config.apiKey,
        merchant_identifier: config.merchantId ?? "",
        fort_id: transactionId,
        language: "ar",
      };

      const result = await payfortFetch<{
        fort_id: string;
        status: string;
        amount: string;
        currency: string;
        response_code: string;
      }>(params);

      return {
        provider: "payfort",
        transactionId: result.fort_id,
        status: mapPayFortStatus(result.status),
        amount: Number(result.amount) / 100,
        currency: result.currency as SupportedCurrency,
      };
    },

    async refund(request: RefundRequest): Promise<RefundResponse> {
      const params: Record<string, string> = {
        command: "REFUND",
        access_code: config.apiKey,
        merchant_identifier: config.merchantId ?? "",
        fort_id: request.transactionId,
        amount: String(Math.round((request.amount ?? 0) * getMinorUnitMultiplier(request.currency ?? "AED"))),
        currency: request.currency ?? "AED",
        language: "ar",
      };

      const result = await payfortFetch<{
        fort_id: string;
        maintenance_reference: string;
        status: string;
        amount: string;
        currency: string;
      }>(params);

      return {
        provider: "payfort",
        refundId: result.maintenance_reference,
        transactionId: request.transactionId,
        amount: Number(result.amount) / 100,
        currency: result.currency as SupportedCurrency,
        status: result.status === "14" ? "completed" : "pending",
      };
    },

    verifyWebhook(payload: string, signature: string): boolean {
      if (!config.webhookSecret) return false;
      const data = JSON.parse(payload) as Record<string, string>;
      const { signature: _sig, ...params } = data;
      const expected = generateSignature(params, config.webhookSecret);
      try {
        return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
      } catch {
        return false;
      }
    },

    parseWebhookEvent(payload: Record<string, unknown>): WebhookEvent {
      return {
        provider: "payfort",
        eventType: String(payload.command ?? "PURCHASE"),
        transactionId: String(payload.fort_id ?? ""),
        status: mapPayFortStatus(String(payload.status ?? "00")),
        amount: Number(payload.amount ?? 0) / 100,
        currency: (String(payload.currency ?? "AED")) as SupportedCurrency,
        rawPayload: payload,
        timestamp: new Date(),
      };
    },
  };
}

/**
 * Map PayFort status codes to unified payment status.
 * 14 = success, 02 = pending, others = declined.
 */
function mapPayFortStatus(status: string): PaymentResponse["status"] {
  const statusMap: Record<string, PaymentResponse["status"]> = {
    "02": "pending",
    "14": "captured",
    "04": "authorized",
    "06": "refunded",
    "08": "declined",
    "00": "pending",
    "01": "pending",
    "03": "declined",
    "07": "declined",
    "19": "pending",
  };
  return statusMap[status] ?? "declined";
}
