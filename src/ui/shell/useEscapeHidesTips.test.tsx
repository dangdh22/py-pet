// @vitest-environment jsdom
import { fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { renderWithGame } from "../../test/renderGame";
import { RailLayout } from "./RailLayout";
import { SideNav } from "./SideNav";
import { useEscapeHidesTips } from "./useEscapeHidesTips";

function Host() {
  useEscapeHidesTips();
  return <button type="button">target</button>;
}

const hidden = () => document.documentElement.hasAttribute("data-tips-hidden");

afterEach(() => {
  delete document.documentElement.dataset.tipsHidden;
});

describe("useEscapeHidesTips", () => {
  test("Escape hides the tips", () => {
    render(<Host />);
    expect(hidden()).toBe(false);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(hidden()).toBe(true);
  });

  test("another key does not hide the tips", () => {
    render(<Host />);
    fireEvent.keyDown(document, { key: "Enter" });
    fireEvent.keyDown(document, { key: "Tab" });
    expect(hidden()).toBe(false);
  });

  test("the next focus or pointer move shows them again", () => {
    const { getByRole } = render(<Host />);
    const button = getByRole("button", { name: "target" });
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.focusIn(button);
    expect(hidden()).toBe(false);
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.pointerOver(button);
    expect(hidden()).toBe(false);
  });

  test("Escape is not prevented", () => {
    render(<Host />);
    // `fireEvent` returns false when a listener called `preventDefault`.
    expect(fireEvent.keyDown(document, { key: "Escape" })).toBe(true);
  });

  test("unmounting removes the attribute", () => {
    const { unmount } = render(<Host />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(hidden()).toBe(true);
    unmount();
    expect(hidden()).toBe(false);
  });

  test("unmounting removes the listeners", () => {
    const { unmount } = render(<Host />);
    unmount();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(hidden()).toBe(false);
  });
});

describe("RailLayout", () => {
  test("Escape hides the tips, and leaving the layout shows them again", async () => {
    const { unmount } = await renderWithGame(
      <RailLayout nav={<SideNav current="room" />}>
        <p>page</p>
      </RailLayout>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(hidden()).toBe(true);
    unmount();
    expect(hidden()).toBe(false);
  });
});
