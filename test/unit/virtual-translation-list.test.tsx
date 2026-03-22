import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  calculateVisibleRange,
  VirtualTranslationList,
} from "../../app/components/translation/VirtualTranslationList";

describe("calculateVisibleRange", () => {
  it("returns the visible slice with overscan applied", () => {
    expect(calculateVisibleRange(100, 40, 120, 0, 1)).toEqual({
      startIndex: 0,
      endIndex: 4,
    });
  });

  it("clamps the range near the end of the list", () => {
    expect(calculateVisibleRange(10, 50, 100, 400, 1)).toEqual({
      startIndex: 7,
      endIndex: 9,
    });
  });
});

describe("VirtualTranslationList", () => {
  const items = Array.from({ length: 20 }, (_, index) => ({
    id: `item-${index}`,
    label: `Translation ${index}`,
  }));

  it("renders only the visible rows on initial mount", () => {
    render(
      <VirtualTranslationList
        items={items}
        height={120}
        itemHeight={40}
        overscan={1}
        renderItem={(item) => <div>{item.label}</div>}
      />,
    );

    expect(screen.getByText("Translation 0")).toBeInTheDocument();
    expect(screen.getByText("Translation 4")).toBeInTheDocument();
    expect(screen.queryByText("Translation 5")).not.toBeInTheDocument();
  });

  it("updates the rendered slice after scrolling", () => {
    render(
      <VirtualTranslationList
        items={items}
        height={120}
        itemHeight={40}
        overscan={1}
        renderItem={(item) => <div>{item.label}</div>}
      />,
    );

    const container = screen.getByTestId("virtual-translation-list");
    Object.defineProperty(container, "scrollTop", {
      configurable: true,
      value: 200,
      writable: true,
    });

    fireEvent.scroll(container);

    expect(screen.getByText("Translation 4")).toBeInTheDocument();
    expect(screen.getByText("Translation 8")).toBeInTheDocument();
    expect(screen.queryByText("Translation 0")).not.toBeInTheDocument();
  });
});
