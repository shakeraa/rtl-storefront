import { createHyperPayGateway } from "./hyperpay";
import { createMadaGateway } from "./mada";
import { createNetworkInternationalGateway } from "./network-international";
import { createPayFortGateway } from "./payfort";
import { createSadadGateway } from "./sadad";
import { createStcPayGateway } from "./stc-pay";
import { createTabbyGateway } from "./tabby";
import { createTamaraGateway } from "./tamara";
import { createTelrGateway } from "./telr";
import type {
  MENAPaymentConfig,
  MENAPaymentProvider,
  PaymentGateway,
  PaymentRequest,
  PaymentResponse,
  RefundRequest,
  RefundResponse,
  SupportedCurrency,
} from "./types";

export * from "./types";
export { createTamaraGateway } from "./tamara";
export { createTabbyGateway } from "./tabby";
export { createMadaGateway } from "./mada";
export { createStcPayGateway } from "./stc-pay";
export { createTelrGateway } from "./telr";
export { createPayFortGateway } from "./payfort";
export { createHyperPayGateway } from "./hyperpay";
export { createNetworkInternationalGateway } from "./network-international";
export { createSadadGateway } from "./sadad";

interface MENAPaymentOrchestratorConfig {
  tamara?: MENAPaymentConfig;
  tabby?: MENAPaymentConfig;
  mada?: MENAPaymentConfig;
  stc_pay?: MENAPaymentConfig;
  telr?: MENAPaymentConfig;
  payfort?: MENAPaymentConfig;
  hyperpay?: MENAPaymentConfig;
  network_international?: MENAPaymentConfig;
  sadad?: MENAPaymentConfig;
}

/**
 * MENA Payment Orchestrator
 * Manages multiple MENA payment gateways and routes payments
 * to the appropriate provider based on currency, country, and type.
 */
export class MENAPaymentOrchestrator {
  private readonly gateways: Map<MENAPaymentProvider, PaymentGateway> = new Map();

  constructor(config: MENAPaymentOrchestratorConfig) {
    if (config.tamara) {
      this.gateways.set("tamara", createTamaraGateway(config.tamara));
    }
    if (config.tabby) {
      this.gateways.set("tabby", createTabbyGateway(config.tabby));
    }
    if (config.mada) {
      this.gateways.set("mada", createMadaGateway(config.mada));
    }
    if (config.stc_pay) {
      this.gateways.set("stc_pay", createStcPayGateway(config.stc_pay));
    }
    if (config.telr) {
      this.gateways.set("telr", createTelrGateway(config.telr));
    }
    if (config.payfort) {
      this.gateways.set("payfort", createPayFortGateway(config.payfort));
    }
    if (config.hyperpay) {
      this.gateways.set("hyperpay", createHyperPayGateway(config.hyperpay));
    }
    if (config.network_international) {
      this.gateways.set("network_international", createNetworkInternationalGateway(config.network_international));
    }
    if (config.sadad) {
      this.gateways.set("sadad", createSadadGateway(config.sadad));
    }
  }

  getConfiguredProviders(): MENAPaymentProvider[] {
    return [...this.gateways.entries()]
      .filter(([, gateway]) => gateway.isConfigured())
      .map(([name]) => name);
  }

  getGateway(provider: MENAPaymentProvider): PaymentGateway | undefined {
    return this.gateways.get(provider);
  }

  /**
   * Get available payment providers for a given currency and country.
   */
  getAvailableProviders(currency: SupportedCurrency, countryCode: string): MENAPaymentProvider[] {
    return [...this.gateways.entries()]
      .filter(([, gateway]) => {
        if (!gateway.isConfigured()) return false;
        if (!gateway.supportedCurrencies.includes(currency)) return false;
        if (!gateway.supportedCountries.includes(countryCode)) return false;
        return true;
      })
      .map(([name]) => name);
  }

  /**
   * Create a payment with the specified provider.
   */
  async createPayment(
    provider: MENAPaymentProvider,
    request: PaymentRequest,
  ): Promise<PaymentResponse> {
    const gateway = this.gateways.get(provider);
    if (!gateway) {
      throw new Error(`Payment provider "${provider}" is not configured`);
    }
    if (!gateway.isConfigured()) {
      throw new Error(`Payment provider "${provider}" is not properly configured`);
    }
    return gateway.createPayment(request);
  }

  /**
   * Check payment status.
   */
  async getPaymentStatus(
    provider: MENAPaymentProvider,
    transactionId: string,
  ): Promise<PaymentResponse> {
    const gateway = this.gateways.get(provider);
    if (!gateway) {
      throw new Error(`Payment provider "${provider}" is not configured`);
    }
    return gateway.getPaymentStatus(transactionId);
  }

  /**
   * Process a refund.
   */
  async refund(
    provider: MENAPaymentProvider,
    request: RefundRequest,
  ): Promise<RefundResponse> {
    const gateway = this.gateways.get(provider);
    if (!gateway) {
      throw new Error(`Payment provider "${provider}" is not configured`);
    }
    return gateway.refund(request);
  }

  /**
   * Verify and parse a webhook event from any configured provider.
   */
  verifyAndParseWebhook(
    provider: MENAPaymentProvider,
    payload: string,
    signature: string,
  ): { verified: boolean; event: ReturnType<PaymentGateway["parseWebhookEvent"]> | null } {
    const gateway = this.gateways.get(provider);
    if (!gateway) {
      return { verified: false, event: null };
    }

    const verified = gateway.verifyWebhook(payload, signature);
    if (!verified) {
      return { verified: false, event: null };
    }

    const event = gateway.parseWebhookEvent(JSON.parse(payload));
    return { verified: true, event };
  }
}

/**
 * Create a MENA payment orchestrator from environment variables.
 */
// COD and Installments
export {
  isCODAvailable,
  calculateCODSurcharge,
  getCODLabel,
  getCODTerms,
  getDefaultCODConfig,
} from "./cod";
export type { CODConfig } from "./cod";

export {
  getAvailablePlans,
  calculateInstallmentSchedule,
  formatInstallmentLabel,
  getInstallmentWidget,
  INSTALLMENT_PLANS,
} from "./installments";
export type { InstallmentPlan } from "./installments";

export function createMENAPaymentOrchestrator(env: Record<string, string | undefined> = process.env as Record<string, string | undefined>): MENAPaymentOrchestrator {
  const sandbox = env.NODE_ENV !== "production";

  return new MENAPaymentOrchestrator({
    tamara: env.TAMARA_API_KEY
      ? {
          provider: "tamara",
          apiKey: env.TAMARA_API_KEY,
          sandbox,
          webhookSecret: env.TAMARA_WEBHOOK_SECRET,
        }
      : undefined,
    tabby: env.TABBY_API_KEY
      ? {
          provider: "tabby",
          apiKey: env.TABBY_API_KEY,
          secretKey: env.TABBY_SECRET_KEY,
          merchantId: env.TABBY_MERCHANT_CODE,
          sandbox,
          webhookSecret: env.TABBY_WEBHOOK_SECRET,
        }
      : undefined,
    mada: env.MADA_API_KEY
      ? {
          provider: "mada",
          apiKey: env.MADA_API_KEY,
          merchantId: env.MADA_ENTITY_ID,
          sandbox,
          webhookSecret: env.MADA_WEBHOOK_SECRET,
        }
      : undefined,
    stc_pay: env.STC_PAY_API_KEY
      ? {
          provider: "stc_pay",
          apiKey: env.STC_PAY_API_KEY,
          merchantId: env.STC_PAY_MERCHANT_ID,
          sandbox,
          webhookSecret: env.STC_PAY_WEBHOOK_SECRET,
        }
      : undefined,
    telr: env.TELR_API_KEY
      ? {
          provider: "telr",
          apiKey: env.TELR_API_KEY,
          merchantId: env.TELR_STORE_ID,
          sandbox,
          webhookSecret: env.TELR_WEBHOOK_SECRET,
        }
      : undefined,
    payfort: env.PAYFORT_ACCESS_CODE
      ? {
          provider: "payfort",
          apiKey: env.PAYFORT_ACCESS_CODE,
          secretKey: env.PAYFORT_SHA_REQUEST_PHRASE,
          merchantId: env.PAYFORT_MERCHANT_IDENTIFIER,
          sandbox,
          webhookSecret: env.PAYFORT_SHA_RESPONSE_PHRASE,
        }
      : undefined,
    hyperpay: env.HYPERPAY_API_KEY
      ? {
          provider: "hyperpay",
          apiKey: env.HYPERPAY_API_KEY,
          merchantId: env.HYPERPAY_ENTITY_ID,
          sandbox,
          webhookSecret: env.HYPERPAY_WEBHOOK_SECRET,
        }
      : undefined,
    network_international: env.NGENIUS_API_KEY
      ? {
          provider: "network_international",
          apiKey: env.NGENIUS_API_KEY,
          merchantId: env.NGENIUS_OUTLET_REF,
          sandbox,
          webhookSecret: env.NGENIUS_WEBHOOK_SECRET,
        }
      : undefined,
    sadad: env.SADAD_API_KEY
      ? {
          provider: "sadad",
          apiKey: env.SADAD_API_KEY,
          merchantId: env.SADAD_MERCHANT_ID,
          sandbox,
          webhookSecret: env.SADAD_WEBHOOK_SECRET,
        }
      : undefined,
  });
}
