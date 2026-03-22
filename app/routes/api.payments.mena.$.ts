import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import {
  createMENAPaymentOrchestrator,
} from "../services/payments/mena/index";
import type {
  MENAPaymentProvider,
  PaymentRequest,
  RefundRequest,
} from "../services/payments/mena/types";

const VALID_PROVIDERS: MENAPaymentProvider[] = [
  "tamara",
  "tabby",
  "mada",
  "stc_pay",
  "telr",
  "payfort",
  "hyperpay",
  "network_international",
  "sadad",
];

function isValidProvider(value: string): value is MENAPaymentProvider {
  return VALID_PROVIDERS.includes(value as MENAPaymentProvider);
}

/**
 * Parse the splat segment to extract provider and sub-action.
 *
 * URL patterns:
 *   GET  /api/payments/mena/:provider/status/:transactionId
 *   GET  /api/payments/mena/:provider/providers?currency=SAR&country=SA
 *   POST /api/payments/mena/:provider/pay
 *   POST /api/payments/mena/:provider/refund
 *   POST /api/payments/mena/:provider/webhook
 */
function parseSplat(splat: string | undefined): {
  provider: string | null;
  action: string;
  extra: string | null;
} {
  const parts = (splat ?? "").split("/").filter(Boolean);
  const provider = parts[0] ?? null;
  const action = parts[1] ?? "pay";
  const extra = parts[2] ?? null;
  return { provider, action, extra };
}

// ---------------------------------------------------------------------------
// GET — status checks and provider listing
// ---------------------------------------------------------------------------
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const splat = params["*"];
  const { provider, action, extra } = parseSplat(splat);
  const url = new URL(request.url);

  // GET /api/payments/mena/providers — list available providers (no provider segment)
  if (provider === "providers" || action === "providers") {
    const currency = url.searchParams.get("currency") ?? "SAR";
    const country = url.searchParams.get("country") ?? "SA";
    const orchestrator = createMENAPaymentOrchestrator();
    const available = orchestrator.getAvailableProviders(currency as any, country);
    const configured = orchestrator.getConfiguredProviders();
    return json({ configured, available, currency, country });
  }

  if (!provider || !isValidProvider(provider)) {
    return json(
      { error: `Invalid or missing payment provider: "${provider ?? ""}"` },
      { status: 400 },
    );
  }

  const orchestrator = createMENAPaymentOrchestrator();

  // GET /api/payments/mena/:provider/status/:transactionId
  if (action === "status") {
    const transactionId = extra ?? url.searchParams.get("transactionId");
    if (!transactionId) {
      return json({ error: "transactionId is required" }, { status: 400 });
    }
    try {
      const status = await orchestrator.getPaymentStatus(provider, transactionId);
      return json({ success: true, payment: status });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return json({ error: message }, { status: 502 });
    }
  }

  // Default GET: return provider info
  const gateway = orchestrator.getGateway(provider);
  if (!gateway) {
    return json({ error: `Provider "${provider}" is not configured` }, { status: 404 });
  }
  return json({
    provider,
    configured: gateway.isConfigured(),
    supportedCurrencies: gateway.supportedCurrencies,
    supportedCountries: gateway.supportedCountries,
  });
};

// ---------------------------------------------------------------------------
// POST — initiate payment, refund, webhook
// ---------------------------------------------------------------------------
export const action = async ({ request, params }: ActionFunctionArgs) => {
  await authenticate.admin(request);

  const splat = params["*"];
  const { provider, action: subAction } = parseSplat(splat);

  if (!provider || !isValidProvider(provider)) {
    return json(
      { error: `Invalid or missing payment provider: "${provider ?? ""}"` },
      { status: 400 },
    );
  }

  const orchestrator = createMENAPaymentOrchestrator();
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // POST /api/payments/mena/:provider/refund
  if (subAction === "refund") {
    const refundRequest = body as RefundRequest;
    if (!refundRequest.transactionId) {
      return json({ error: "transactionId is required for refunds" }, { status: 400 });
    }
    try {
      const refund = await orchestrator.refund(provider, refundRequest);
      return json({ success: true, refund });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return json({ error: message }, { status: 502 });
    }
  }

  // POST /api/payments/mena/:provider/webhook
  if (subAction === "webhook") {
    const rawPayload = JSON.stringify(body);
    const signature =
      request.headers.get("x-signature") ??
      request.headers.get("x-webhook-signature") ??
      "";
    const result = orchestrator.verifyAndParseWebhook(provider, rawPayload, signature);
    if (!result.verified) {
      return json({ error: "Webhook signature verification failed" }, { status: 401 });
    }
    return json({ success: true, event: result.event });
  }

  // POST /api/payments/mena/:provider/pay  (default action)
  const paymentRequest = body as PaymentRequest;
  const requiredFields: (keyof PaymentRequest)[] = [
    "orderId",
    "amount",
    "currency",
    "customerEmail",
    "customerName",
    "returnUrl",
    "cancelUrl",
    "webhookUrl",
  ];
  const missing = requiredFields.filter((f) => !paymentRequest[f]);
  if (missing.length > 0) {
    return json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 },
    );
  }

  try {
    const payment = await orchestrator.createPayment(provider, paymentRequest);
    return json({ success: true, payment }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return json({ error: message }, { status: 502 });
  }
};
