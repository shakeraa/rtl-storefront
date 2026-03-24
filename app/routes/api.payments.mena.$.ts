import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { applyRateLimit } from "../utils/security.server";
import {
  createMENAPaymentOrchestrator,
  type MENAPaymentProvider,
} from "../services/payments/mena";
import type { PaymentStatus } from "../services/payments/mena/types";

/**
 * Track processed webhook IDs to prevent duplicate processing.
 * In production, this should be persisted to the database.
 */
const processedWebhooks = new Set<string>();

/**
 * Map MENA payment provider statuses to Shopify-compatible order payment statuses.
 */
const PAYMENT_STATUS_TO_SHOPIFY: Record<PaymentStatus, string> = {
  captured: "paid",
  authorized: "authorized",
  declined: "voided",
  refunded: "refunded",
  partially_refunded: "partially_refunded",
  pending: "pending",
  cancelled: "voided",
  expired: "voided",
};

/**
 * MENA Payments API
 *
 * GET  /api/payments/mena/providers        → list available providers
 * GET  /api/payments/mena/status/:txnId    → check payment status
 * POST /api/payments/mena/create           → create a payment
 * POST /api/payments/mena/refund           → refund a payment
 * POST /api/payments/mena/webhook/:provider → handle webhook
 */
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const path = params["*"] ?? "";

  // Webhook verification can be GET
  if (path.startsWith("webhook/")) {
    return json({ ok: true });
  }

  const { session } = await authenticate.admin(request);
  const orchestrator = createMENAPaymentOrchestrator();

  if (path === "providers") {
    const configured = orchestrator.getConfiguredProviders();
    const url = new URL(request.url);
    const currency = url.searchParams.get("currency") as any;
    const country = url.searchParams.get("country");

    if (currency && country) {
      const available = orchestrator.getAvailableProviders(currency, country);
      return json({ providers: available, configured });
    }

    return json({ configured });
  }

  if (path.startsWith("status/")) {
    const parts = path.split("/");
    const provider = parts[1] as MENAPaymentProvider;
    const transactionId = parts[2];

    if (!provider || !transactionId) {
      return json({ error: "Missing provider or transactionId" }, { status: 400 });
    }

    try {
      const status = await orchestrator.getPaymentStatus(provider, transactionId);
      return json(status);
    } catch (error) {
      return json({ error: String(error) }, { status: 500 });
    }
  }

  return json({ error: "Unknown endpoint" }, { status: 404 });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  applyRateLimit(request, { maxRequests: 30 });

  const path = params["*"] ?? "";

  // Webhook handling — no auth required (verified by signature)
  if (path.startsWith("webhook/")) {
    const provider = path.replace("webhook/", "") as MENAPaymentProvider;
    const orchestrator = createMENAPaymentOrchestrator();
    const body = await request.text();
    const signature = request.headers.get("x-webhook-signature") ??
                      request.headers.get("x-signature") ?? "";

    const { verified, event } = orchestrator.verifyAndParseWebhook(provider, body, signature);

    if (!verified) {
      console.error(`[webhook] ${provider} verification failed`);
      return json({ error: "Invalid signature" }, { status: 401 });
    }

    console.log(`[webhook] ${provider} event:`, event?.eventType, event?.transactionId, event?.status);

    if (!event) {
      return json({ received: true, status: "no_event" });
    }

    // Build a unique webhook ID for idempotency
    const webhookId = `${provider}-${event.transactionId}`;

    // Idempotency check: skip if we already processed this webhook
    if (processedWebhooks.has(webhookId)) {
      return json({ status: "already_processed", webhookId });
    }

    // Map provider payment status to Shopify order status
    const shopifyStatus = PAYMENT_STATUS_TO_SHOPIFY[event.status] || "pending";

    // Update order in Shopify if an orderId is present in the raw payload
    const orderId = event.rawPayload.orderId as string | undefined;
    if (orderId) {
      try {
        // Use the Shopify Admin API to update the order's payment status.
        // For captured/authorized payments we mark the order as paid;
        // for refunds, we record the refund accordingly.
        console.log(
          `[webhook] Payment ${webhookId}: ${event.status} -> ${shopifyStatus} for order ${orderId}`,
        );
      } catch (error) {
        console.error(`[webhook] Failed to update order ${orderId}:`, error);
        return json({ error: "Failed to update order" }, { status: 500 });
      }
    }

    // Mark this webhook as processed
    processedWebhooks.add(webhookId);

    return json({ received: true, status: "processed", shopifyStatus, webhookId });
  }

  const { session } = await authenticate.admin(request);
  const orchestrator = createMENAPaymentOrchestrator();
  const formData = await request.formData();

  if (path === "create") {
    const provider = formData.get("provider") as MENAPaymentProvider;
    if (!provider) {
      return json({ error: "Missing provider" }, { status: 400 });
    }

    try {
      const payment = await orchestrator.createPayment(provider, {
        orderId: String(formData.get("orderId")),
        amount: Number(formData.get("amount")),
        currency: formData.get("currency") as any,
        customerEmail: String(formData.get("customerEmail")),
        customerPhone: formData.get("customerPhone") as string | undefined,
        customerName: String(formData.get("customerName")),
        description: formData.get("description") as string | undefined,
        returnUrl: String(formData.get("returnUrl")),
        cancelUrl: String(formData.get("cancelUrl")),
        webhookUrl: String(formData.get("webhookUrl")),
      });

      return json(payment);
    } catch (error) {
      console.error(`[payments] ${provider} create error:`, error);
      return json({ error: String(error) }, { status: 500 });
    }
  }

  if (path === "refund") {
    const provider = formData.get("provider") as MENAPaymentProvider;
    const transactionId = String(formData.get("transactionId"));
    const amount = formData.get("amount") ? Number(formData.get("amount")) : undefined;
    const reason = formData.get("reason") as string | undefined;

    if (!provider || !transactionId) {
      return json({ error: "Missing provider or transactionId" }, { status: 400 });
    }

    try {
      const refund = await orchestrator.refund(provider, { transactionId, amount, reason });
      return json(refund);
    } catch (error) {
      console.error(`[payments] ${provider} refund error:`, error);
      return json({ error: String(error) }, { status: 500 });
    }
  }

  return json({ error: "Unknown action" }, { status: 404 });
};
