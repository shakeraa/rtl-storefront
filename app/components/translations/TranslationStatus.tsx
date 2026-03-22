import { Badge } from "@shopify/polaris";

export type TranslationStatusValue = "translated" | "partial" | "untranslated" | "pending";

interface TranslationStatusProps {
  status: TranslationStatusValue | string;
}

export function TranslationStatus({ status }: TranslationStatusProps) {
  switch (status.toLowerCase()) {
    case "translated":
      return <Badge tone="success">Translated</Badge>;
    case "partial":
      return <Badge tone="warning">Partial</Badge>;
    case "untranslated":
      return <Badge tone="critical">Untranslated</Badge>;
    case "pending":
      return <Badge tone="info">Pending</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export default TranslationStatus;
