import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import {
  createMENAPaymentOrchestrator,
  type MENAPaymentProvider,
} from "../services/payments/mena";

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

    // TODO: Update order status in Shopify based on payment event
    // await updateOrderPaymentStatus(event);

    return json({ received: true });
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
