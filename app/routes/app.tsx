import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import { Banner } from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { authenticate } from "../shopify.server";
import { getBillingContext } from "../services/billing/index";
import type { BillingContext } from "../services/billing/types";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const billing = await getBillingContext(session.shop);

  const url = new URL(request.url);

  // Skip gate for billing routes (must be accessible to select/confirm plans)
  if (!url.pathname.startsWith("/app/billing")) {
    if (billing.isGated) {
      return redirect("/app/billing");
    }
  }

  return json({
    apiKey: process.env.SHOPIFY_API_KEY || "",
    billing,
  });
};

export default function App() {
  const { apiKey, billing } = useLoaderData<typeof loader>();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">Dashboard</Link>
        <Link to="/app/translate">Translate</Link>
        <Link to="/app/rtl-settings">RTL Settings</Link>
        <Link to="/app/glossary">Glossary</Link>
        <Link to="/app/coverage">Coverage</Link>
        <Link to="/app/analytics">Analytics</Link>
        <Link to="/app/export">Export</Link>
        <Link to="/app/rtl-preview">RTL Preview</Link>
        <Link to="/app/locales">Languages</Link>
        <Link to="/app/payments">MENA Payments</Link>
        <Link to="/app/billing">Plans & Billing</Link>
      </NavMenu>
      {billing.isTrial && billing.trialDaysRemaining > 0 && (
        <div style={{ padding: "0 20px" }}>
          <Banner tone="info">
            <p>
              Free trial: {billing.trialDaysRemaining} day
              {billing.trialDaysRemaining !== 1 ? "s" : ""} remaining.{" "}
              <Link to="/app/billing">Choose a plan</Link>
            </p>
          </Banner>
        </div>
      )}
      {billing.isFrozen && (
        <div style={{ padding: "0 20px" }}>
          <Banner tone="warning">
            <p>
              There is a payment issue with your subscription. Please update
              your billing in Shopify Admin.
            </p>
          </Banner>
        </div>
      )}
      <Outlet context={billing satisfies BillingContext} />
    </AppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
