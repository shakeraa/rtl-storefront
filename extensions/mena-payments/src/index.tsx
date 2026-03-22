import {
  reactExtension,
  useSettings,
  useCartLines,
  useTotalAmount,
  BlockStack,
  Text,
  Banner,
} from "@shopify/ui-extensions-react/checkout";

const PROVIDER_LABELS: Record<string, string> = {
  tamara: "Tamara — Buy Now, Pay Later",
  tabby: "Tabby — Split in 4",
  mada: "Mada",
  stc_pay: "STC Pay",
  telr: "Telr",
  payfort: "PayFort (Amazon Payment Services)",
  hyperpay: "HyperPay",
  network_international: "Network International",
  sadad: "SADAD",
};

/**
 * MENA Payment Methods checkout UI extension.
 *
 * Renders after the standard payment method list to surface
 * region-specific MENA payment options configured by the merchant.
 */
export default reactExtension(
  "purchase.checkout.payment-method-list.render-after",
  () => <MENAPaymentMethods />,
);

function MENAPaymentMethods() {
  const settings = useSettings<{
    enabled_providers?: string;
    store_currency?: string;
    store_country?: string;
  }>();

  const totalAmount = useTotalAmount();
  const cartLines = useCartLines();

  const rawProviders = settings.enabled_providers ?? "";
  const enabledProviders = rawProviders
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  // Nothing to render when no providers are configured by the merchant
  if (enabledProviders.length === 0) {
    return null;
  }

  const currency = settings.store_currency ?? "SAR";
  const country = settings.store_country ?? "SA";
  const amount = totalAmount?.amount ?? 0;
  const hasItems = cartLines.length > 0;

  if (!hasItems) {
    return null;
  }

  return (
    <BlockStack spacing="base">
      <Text size="medium" emphasis="bold">
        {country === "SA" || country === "AE" || country === "KW"
          ? "طرق الدفع الإقليمية"
          : "Regional Payment Methods"}
      </Text>

      {enabledProviders.map((provider) => {
        const label = PROVIDER_LABELS[provider] ?? provider;
        return (
          <Banner key={provider} status="info">
            <Text>
              {label} — {currency} {amount.toFixed(2)}
            </Text>
          </Banner>
        );
      })}
    </BlockStack>
  );
}
