// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, test, vi } from "vitest";
import { useRovingTabs } from "./useRovingTabs";

const LABELS = ["One", "Two", "Three"];

/** A tab list with 1 tab per label; `count` can be lower than the labels to try a list with no tabs. */
function Tabs({
  orientation = "horizontal",
  count = LABELS.length,
  onSelect,
}: {
  orientation?: "horizontal" | "vertical";
  count?: number;
  onSelect?(index: number): void;
}) {
  const [current, setCurrent] = useState(0);
  const { tabRef, select, onKeyDown } = useRovingTabs({
    count,
    current,
    orientation,
    onSelect: (index) => {
      onSelect?.(index);
      setCurrent(index);
    },
  });
  return (
    <div role="tablist" aria-orientation={orientation} onKeyDown={onKeyDown}>
      {LABELS.slice(0, count).map((label, index) => (
        <button
          key={label}
          ref={tabRef(index)}
          type="button"
          role="tab"
          aria-selected={index === current}
          tabIndex={index === current ? 0 : -1}
          onClick={() => select(index)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

const tab = (name: string) => screen.getByRole("tab", { name });

describe("useRovingTabs", () => {
  test("ArrowRight selects and focuses the next tab and wraps from the last to the first", () => {
    render(<Tabs />);
    tab("One").focus();
    fireEvent.keyDown(tab("One"), { key: "ArrowRight" });
    expect(tab("Two")).toHaveAttribute("aria-selected", "true");
    expect(tab("Two")).toHaveFocus();
    expect(tab("Two")).toHaveAttribute("tabindex", "0");
    expect(tab("One")).toHaveAttribute("tabindex", "-1");
    fireEvent.keyDown(tab("Two"), { key: "ArrowRight" });
    fireEvent.keyDown(tab("Three"), { key: "ArrowRight" });
    expect(tab("One")).toHaveAttribute("aria-selected", "true");
    expect(tab("One")).toHaveFocus();
    fireEvent.keyDown(tab("One"), { key: "ArrowLeft" });
    expect(tab("Three")).toHaveAttribute("aria-selected", "true");
    expect(tab("Three")).toHaveFocus();
  });

  test("Home and End go to the first and the last tab", () => {
    render(<Tabs />);
    tab("One").focus();
    fireEvent.keyDown(tab("One"), { key: "End" });
    expect(tab("Three")).toHaveAttribute("aria-selected", "true");
    expect(tab("Three")).toHaveFocus();
    fireEvent.keyDown(tab("Three"), { key: "Home" });
    expect(tab("One")).toHaveAttribute("aria-selected", "true");
    expect(tab("One")).toHaveFocus();
  });

  test("a vertical list answers to ArrowDown and ArrowUp and ignores ArrowRight", () => {
    render(<Tabs orientation="vertical" />);
    tab("One").focus();
    expect(fireEvent.keyDown(tab("One"), { key: "ArrowRight" })).toBe(true);
    expect(fireEvent.keyDown(tab("One"), { key: "ArrowLeft" })).toBe(true);
    expect(tab("One")).toHaveAttribute("aria-selected", "true");
    expect(fireEvent.keyDown(tab("One"), { key: "ArrowDown" })).toBe(false);
    expect(tab("Two")).toHaveAttribute("aria-selected", "true");
    expect(tab("Two")).toHaveFocus();
    fireEvent.keyDown(tab("Two"), { key: "ArrowUp" });
    fireEvent.keyDown(tab("One"), { key: "ArrowUp" });
    expect(tab("Three")).toHaveAttribute("aria-selected", "true");
    expect(tab("Three")).toHaveFocus();
  });

  test("Alt, Ctrl or Meta with an arrow changes nothing and is not prevented", () => {
    const onSelect = vi.fn();
    render(<Tabs onSelect={onSelect} />);
    tab("One").focus();
    for (const modifier of [{ altKey: true }, { ctrlKey: true }, { metaKey: true }]) {
      expect(fireEvent.keyDown(tab("One"), { key: "ArrowRight", ...modifier })).toBe(true);
      expect(fireEvent.keyDown(tab("One"), { key: "End", ...modifier })).toBe(true);
    }
    expect(onSelect).not.toHaveBeenCalled();
    expect(tab("One")).toHaveAttribute("aria-selected", "true");
    expect(tab("One")).toHaveFocus();
  });

  test("a key that is not a tab key is not prevented", () => {
    const onSelect = vi.fn();
    render(<Tabs onSelect={onSelect} />);
    tab("One").focus();
    for (const key of ["a", "Tab", "Enter", " ", "ArrowDown", "PageDown"]) {
      expect(fireEvent.keyDown(tab("One"), { key })).toBe(true);
    }
    expect(onSelect).not.toHaveBeenCalled();
    expect(tab("One")).toHaveFocus();
  });

  test("a list with no tabs ignores the keys", () => {
    const onSelect = vi.fn();
    render(<Tabs count={0} onSelect={onSelect} />);
    const list = screen.getByRole("tablist");
    for (const key of ["ArrowRight", "ArrowLeft", "Home", "End"]) {
      expect(fireEvent.keyDown(list, { key })).toBe(true);
    }
    expect(onSelect).not.toHaveBeenCalled();
  });
});
