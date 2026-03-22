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

const NGENIUS_SANDBOX_URL = "https://api-gateway.sandbox.ngenius-payments.com";
const NGENIUS_PRODUCTION_URL = "https://api-gateway.ngenius-payments.com";

/**
 * Network International (N-Genius) payment gateway integration.
 * Leading payment processor across the Middle East and Africa.
 * Uses outlet reference + order reference pattern with Bearer token auth.
 */
export function createNetworkInternationalGateway(config: MENAPaymentConfig): PaymentGateway {
  const baseUrl = config.sandbox ? NGENIUS_SANDBOX_URL : NGENIUS_PRODUCTION_URL;
  let accessToken: string | null = null;
  let tokenExpiry = 0;

  /**
   * Get or refresh the access token using the API key.
   */
  async function getAccessToken(): Promise<string> {
    const now = Date.now();
    if (accessToken && now < tokenExpiry) {
      return accessToken;
    }

    const response = await fetch(`${baseUrl}/identity/auth/access-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.ni-identity.v1+json",
        Authorization: `Basic ${config.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`N-Genius auth error (${response.status}): ${error}`);
    }

    const result = (await response.json()) as { access_token: string; expires_in: number };
    accessToken = result.access_token;
    // Refresh 60 seconds before expiry
    tokenExpiry = now + (result.expires_in - 60) * 1000;
    return accessToken;
  }

  async function ngeniusFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await getAccessToken();

    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/vnd.ni-payment.v2+json",
        Accept: "application/vnd.ni-payment.v2+json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`N-Genius API error (${response.status}): ${error}`);
    }

    return response.json() as Promise<T>;
  }

  /** The outlet reference (merchant ID in our config) */
  function outletRef(): string {
    return config.merchantId ?? "";
  }

  return {
    provider: "network_international",
    supportedCurrencies: ["AED", "SAR", "EGP", "BHD", "OMR", "QAR"] as SupportedCurrency[],
    supportedCountries: ["AE", "SA", "EG", "BH", "OM", "QA"],

    isConfigured(): boolean {
      return Boolean(config.apiKey && config.merchantId);
    },

    async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
      const payload = {
        action: "SALE",
        amount: {
          currencyCode: request.currency,
          value: Math.round(request.amount * 100),
        },
        merchantAttributes: {
          redirectUrl: request.returnUrl,
          cancelUrl: request.cancelUrl,
          skipConfirmationPage: true,
        },
        emailAddress: request.customerEmail,
        merchantOrderReference: request.orderId,
        billingAddress: request.billingAddress
          ? {
              firstName: request.billingAddress.firstName,
              lastName: request.billingAddress.lastName,
              address1: request.billingAddress.line1,
              address2: request.billingAddress.line2,
              city: request.billingAddress.city,
              countryCode: request.billingAddress.country,
            }
          : undefined,
        phoneNumber: request.customerPhone
          ? { countryCode: "+971", subscriber: request.customerPhone }
          : undefined,
      };

      const result = await ngeniusFetch<{
        reference: string;
        _links: {
          payment: { href: string };
          self: { href: string };
        };
        _embedded?: {
          payment?: Array<{ state: string }>;
        };
      }>(`/transactions/outlets/${outletRef()}/orders`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return {
        provider: "network_international",
        transactionId: result.reference,
        status: "pending",
        checkoutUrl: result._links.payment.href,
        amount: request.amount,
        currency: request.currency,
        metadata: {
          orderReference: result.reference,
        },
      };
    },

    async getPaymentStatus(transactionId: string): Promise<PaymentResponse> {
      const result = await ngeniusFetch<{
        reference: string;
        amount: { currencyCode: string; value: number };
        _embedded?: {
          payment?: Array<{
            state: string;
            amount: { currencyCode: string; value: number };
          }>;
        };
      }>(`/transactions/outlets/${outletRef()}/orders/${transactionId}`);

      const payment = result._embedded?.payment?.[0];
      const state = payment?.state ?? "AWAITING_PAYMENT";

      return {
        provider: "network_international",
        transactionId: result.reference,
        status: mapNGeniusStatus(state),
        amount: result.amount.value / 100,
        currency: result.amount.currencyCode as SupportedCurrency,
      };
    },

    async refund(request: RefundRequest): Promise<RefundResponse> {
      const payload = {
        amount: {
          currencyCode: "AED",
          value: Math.round((request.amount ?? 0) * 100),
        },
        reason: request.reason ?? "Refund requested",
      };

      // N-Genius requires getting the payment reference first for the capture ID
      const order = await ngeniusFetch<{
        _embedded?: {
          payment?: Array<{
            _id: string;
            _links: { "cnp:refund"?: { href: string } };
          }>;
        };
      }>(`/transactions/outlets/${outletRef()}/orders/${request.transactionId}`);

      const payment = order._embedded?.payment?.[0];
      const refundUrl = payment?._links?.["cnp:refund"]?.href;

      if (!refundUrl) {
        throw new Error("N-Genius: Payment is not eligible for refund");
      }

      const result = await ngeniusFetch<{
        reference: string;
        state: string;
        amount: { currencyCode: string; value: number };
      }>(new URL(refundUrl).pathname, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return {
        provider: "network_international",
        refundId: result.reference,
        transactionId: request.transactionId,
        amount: result.amount.value / 100,
        currency: result.amount.currencyCode as SupportedCurrency,
        status: result.state === "SUCCESS" ? "completed" : "pending",
      };
    },

    verifyWebhook(payload: string, signature: string): boolean {
      if (!config.webhookSecret) return false;
      const expected = createHmac("sha256", config.webhookSecret).update(payload).digest("hex");
      return expected === signature;
    },

    parseWebhookEvent(payload: Record<string, unknown>): WebhookEvent {
      const eventType = String(payload.eventName ?? "PAYMENT_UPDATE");
      const order = payload.order as Record<string, unknown> | undefined;
      const embedded = order?._embedded as Record<string, unknown> | undefined;
      const payments = embedded?.payment as Array<Record<string, unknown>> | undefined;
      const payment = payments?.[0];
      const amount = order?.amount as Record<string, unknown> | undefined;

      return {
        provider: "network_international",
        eventType,
        transactionId: String(order?.reference ?? ""),
        status: mapNGeniusStatus(String(payment?.state ?? "AWAITING_PAYMENT")),
        amount: Number(amount?.value ?? 0) / 100,
        currency: (String(amount?.currencyCode ?? "AED")) as SupportedCurrency,
        rawPayload: payload,
        timestamp: new Date(),
      };
    },
  };
}

function mapNGeniusStatus(state: string): PaymentResponse["status"] {
  const statusMap: Record<string, PaymentResponse["status"]> = {
    PURCHASED: "captured",
    CAPTURED: "captured",
    AUTHORISED: "authorized",
    AWAITING_PAYMENT: "pending",
    STARTED: "pending",
    FAILED: "declined",
    DECLINED: "declined",
    PARTIALLY_REFUNDED: "partially_refunded",
    FULLY_REFUNDED: "refunded",
    CANCELLED: "cancelled",
    EXPIRED: "expired",
    POST_AUTH_REVIEW: "pending",
  };
  return statusMap[state] ?? "pending";
}
