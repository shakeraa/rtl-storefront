import { useState } from "react";

export interface VirtualTranslationListItem {
  id: string;
}

export interface VisibleRange {
  startIndex: number;
  endIndex: number;
}

export interface VirtualTranslationListProps<T extends VirtualTranslationListItem> {
  items: T[];
  height: number;
  itemHeight: number;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}

export function calculateVisibleRange(
  itemCount: number,
  itemHeight: number,
  containerHeight: number,
  scrollTop: number,
  overscan: number = 2,
): VisibleRange {
  if (itemCount === 0) {
    return { startIndex: 0, endIndex: 0 };
  }

  const safeOverscan = Math.max(0, overscan);
  const visibleCount = Math.max(1, Math.ceil(containerHeight / itemHeight));
  const rawStartIndex = Math.floor(scrollTop / itemHeight) - safeOverscan;
  const startIndex = Math.max(0, rawStartIndex);
  const endIndex = Math.min(
    itemCount - 1,
    startIndex + visibleCount + safeOverscan * 2 - 1,
  );

  return { startIndex, endIndex };
}

export function VirtualTranslationList<T extends VirtualTranslationListItem>({
  items,
  height,
  itemHeight,
  overscan = 2,
  renderItem,
}: VirtualTranslationListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const { startIndex, endIndex } = calculateVisibleRange(
    items.length,
    itemHeight,
    height,
    scrollTop,
    overscan,
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;

  return (
    <div
      data-testid="virtual-translation-list"
      onScroll={(event) =>
        setScrollTop((event.currentTarget as HTMLDivElement).scrollTop)
      }
      style={{
        height,
        overflowY: "auto",
        position: "relative",
      }}
    >
      <div
        style={{
          height: totalHeight,
          position: "relative",
        }}
      >
        {visibleItems.map((item, visibleIndex) => {
          const index = startIndex + visibleIndex;

          return (
            <div
              key={item.id}
              data-testid={`virtual-item-${item.id}`}
              style={{
                boxSizing: "border-box",
                height: itemHeight,
                left: 0,
                position: "absolute",
                right: 0,
                top: index * itemHeight,
              }}
            >
              {renderItem(item, index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
