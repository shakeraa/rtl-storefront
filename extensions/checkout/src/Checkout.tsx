import {
  reactExtension,
  BlockStack,
  Heading,
  Text,
  Divider,
  useLocalizationCountry,
  useLocalizationLanguage,
  useTranslate,
} from "@shopify/ui-extensions-react/checkout";

const RTL_LOCALES = new Set(["ar", "he", "fa", "ur", "ps", "ku", "sd", "yi"]);

interface OrderSummaryLabels {
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
  orderSummary: string;
}

const LOCALIZED_LABELS: Record<string, OrderSummaryLabels> = {
  ar: {
    orderSummary: "\u0645\u0644\u062E\u0635 \u0627\u0644\u0637\u0644\u0628",
    subtotal: "\u0627\u0644\u0645\u062C\u0645\u0648\u0639 \u0627\u0644\u0641\u0631\u0639\u064A",
    shipping: "\u0627\u0644\u0634\u062D\u0646",
    tax: "\u0627\u0644\u0636\u0631\u064A\u0628\u0629",
    total: "\u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A",
  },
  he: {
    orderSummary: "\u05E1\u05D9\u05DB\u05D5\u05DD \u05D4\u05D6\u05DE\u05E0\u05D4",
    subtotal: "\u05E1\u05DB\u05D5\u05DD \u05D1\u05D9\u05E0\u05D9\u05D9\u05DD",
    shipping: "\u05DE\u05E9\u05DC\u05D5\u05D7",
    tax: "\u05DE\u05E1",
    total: "\u05E1\u05DA \u05D4\u05DB\u05DC",
  },
  fa: {
    orderSummary: "\u062E\u0644\u0627\u0635\u0647 \u0633\u0641\u0627\u0631\u0634",
    subtotal: "\u062C\u0645\u0639 \u0641\u0631\u0639\u06CC",
    shipping: "\u0627\u0631\u0633\u0627\u0644",
    tax: "\u0645\u0627\u0644\u06CC\u0627\u062A",
    total: "\u0645\u062C\u0645\u0648\u0639",
  },
  en: {
    orderSummary: "Order Summary",
    subtotal: "Subtotal",
    shipping: "Shipping",
    tax: "Tax",
    total: "Total",
  },
};

function getLabels(languageCode: string): OrderSummaryLabels {
  const lang = languageCode.split("-")[0].toLowerCase();
  return LOCALIZED_LABELS[lang] ?? LOCALIZED_LABELS.en;
}

function isRtlLocale(languageCode: string): boolean {
  const lang = languageCode.split("-")[0].toLowerCase();
  return RTL_LOCALES.has(lang);
}

export default reactExtension(
  "purchase.checkout.block.render",
  () => <RTLCheckout />,
);

function RTLCheckout() {
  const language = useLocalizationLanguage();
  const languageCode = language?.isoCode ?? "en";
  const direction = isRtlLocale(languageCode) ? "rtl" : "ltr";
  const labels = getLabels(languageCode);

  return (
    <BlockStack
      spacing="base"
      inlineAlignment={direction === "rtl" ? "end" : "start"}
    >
      <Heading level={2}>{labels.orderSummary}</Heading>
      <Divider />
      <BlockStack spacing="extraTight">
        <Text size="base">{labels.subtotal}</Text>
        <Text size="base">{labels.shipping}</Text>
        <Text size="base">{labels.tax}</Text>
      </BlockStack>
      <Divider />
      <Text size="large" emphasis="bold">
        {labels.total}
      </Text>
    </BlockStack>
  );
}
