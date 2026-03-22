export type MENAPaymentProvider = "tamara" | "tabby" | "mada" | "stc_pay" | "telr" | "payfort" | "hyperpay" | "network_international" | "sadad";

export type PaymentStatus =
  | "pending"
  | "authorized"
  | "captured"
  | "declined"
  | "refunded"
  | "partially_refunded"
  | "cancelled"
  | "expired";

export type SupportedCurrency = "SAR" | "AED" | "KWD" | "BHD" | "QAR" | "OMR" | "USD" | "EGP" | "JOD";

export interface MENAPaymentConfig {
  provider: MENAPaymentProvider;
  apiKey: string;
  secretKey?: string;
  merchantId?: string;
  sandbox: boolean;
  webhookSecret?: string;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: SupportedCurrency;
  customerEmail: string;
  customerPhone?: string;
  customerName: string;
  description?: string;
  returnUrl: string;
  cancelUrl: string;
  webhookUrl: string;
  lineItems?: PaymentLineItem[];
  shippingAddress?: PaymentAddress;
  billingAddress?: PaymentAddress;
  metadata?: Record<string, string>;
}

export interface PaymentLineItem {
  name: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  imageUrl?: string;
}

export interface PaymentAddress {
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  phone?: string;
}

export interface PaymentResponse {
  provider: MENAPaymentProvider;
  transactionId: string;
  status: PaymentStatus;
  checkoutUrl?: string;
  amount: number;
  currency: SupportedCurrency;
  metadata?: Record<string, string>;
}

export interface RefundRequest {
  transactionId: string;
  amount?: number;
  reason?: string;
}

export interface RefundResponse {
  provider: MENAPaymentProvider;
  refundId: string;
  transactionId: string;
  amount: number;
  currency: SupportedCurrency;
  status: "pending" | "completed" | "failed";
}

export interface WebhookEvent {
  provider: MENAPaymentProvider;
  eventType: string;
  transactionId: string;
  status: PaymentStatus;
  amount: number;
  currency: SupportedCurrency;
  rawPayload: Record<string, unknown>;
  timestamp: Date;
}

export interface PaymentGateway {
  readonly provider: MENAPaymentProvider;
  readonly supportedCurrencies: SupportedCurrency[];
  readonly supportedCountries: string[];
  isConfigured(): boolean;
  createPayment(request: PaymentRequest): Promise<PaymentResponse>;
  getPaymentStatus(transactionId: string): Promise<PaymentResponse>;
  refund(request: RefundRequest): Promise<RefundResponse>;
  verifyWebhook(payload: string, signature: string): boolean;
  parseWebhookEvent(payload: Record<string, unknown>): WebhookEvent;
}
