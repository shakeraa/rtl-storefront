import { useCallback } from "react";
import {
  IndexTable,
  Text,
  Badge,
  Button,
  useIndexResourceState,
  InlineStack,
} from "@shopify/polaris";
import { TranslationStatus } from "./TranslationStatus";
import { t } from "../../utils/i18n";

export interface TranslationItem {
  id: string;
  title: string;
  type: string;
  sourceLang: string;
  status: string;
  lastUpdated?: string;
}

interface TranslationListProps {
  items: TranslationItem[];
  onTranslate?: (id: string) => void;
  onBulkTranslate?: (ids: string[]) => void;
  locale?: string;
}

export function TranslationList({
  items,
  onTranslate,
  onBulkTranslate,
  locale = 'en',
}: TranslationListProps) {
  const resourceName = { singular: "content item", plural: "content items" };
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(items);

  const handleBulkTranslate = useCallback(() => {
    onBulkTranslate?.(selectedResources);
  }, [selectedResources, onBulkTranslate]);

  const promotedBulkActions = onBulkTranslate
    ? [
        {
          content: `${t('translate', locale)} ${selectedResources.length} ${t('selected', locale)}`,
          onAction: handleBulkTranslate,
        },
      ]
    : [];

  const rowMarkup = items.map((item, index) => (
    <IndexTable.Row
      id={item.id}
      key={item.id}
      selected={selectedResources.includes(item.id)}
      position={index}
    >
      <IndexTable.Cell>
        <Text as="span" variant="bodyMd" fontWeight="bold">
          {item.title}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge>{item.type}</Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" variant="bodyMd">
          {item.sourceLang}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <TranslationStatus status={item.status} />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" variant="bodySm" tone="subdued">
          {item.lastUpdated ?? "—"}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <InlineStack gap="200">
          <Button size="slim" onClick={() => onTranslate?.(item.id)}>
            {t('translate', locale)}
          </Button>
        </InlineStack>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <IndexTable
      resourceName={resourceName}
      itemCount={items.length}
      selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
      onSelectionChange={handleSelectionChange}
      promotedBulkActions={promotedBulkActions}
      headings={[
        { title: t('content', locale) },
        { title: t('type', locale) },
        { title: t('source_language', locale) },
        { title: t('status', locale) },
        { title: t('last_updated', locale) },
        { title: t('actions', locale) },
      ]}
    >
      {rowMarkup}
    </IndexTable>
  );
}

export default TranslationList;
