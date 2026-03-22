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
}

export function TranslationList({
  items,
  onTranslate,
  onBulkTranslate,
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
          content: `Translate ${selectedResources.length} selected`,
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
            Translate
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
        { title: "Content" },
        { title: "Type" },
        { title: "Source Language" },
        { title: "Status" },
        { title: "Last Updated" },
        { title: "Actions" },
      ]}
    >
      {rowMarkup}
    </IndexTable>
  );
}

export default TranslationList;
