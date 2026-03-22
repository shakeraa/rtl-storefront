import { createMadaGateway } from "./mada";
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

interface MENAPaymentOrchestratorConfig {
  tamara?: MENAPaymentConfig;
  tabby?: MENAPaymentConfig;
  mada?: MENAPaymentConfig;
  stc_pay?: MENAPaymentConfig;
  telr?: MENAPaymentConfig;
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
  });
}
