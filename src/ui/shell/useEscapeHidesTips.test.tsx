// @vitest-environment jsdom
import { fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
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
  vi.restoreAllMocks();
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
    // The pointer moving inside the place it is already in is not a new place: only `pointerover` shows the notes again.
    fireEvent.pointerMove(button);
    fireEvent.mouseMove(button);
    expect(hidden()).toBe(true);
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

  // The parent PIN gate unmounts and the parent area mounts: 2 frames, 1 after the other, each with its own call of the hook.
  test("2 frames one after the other: the second one takes over and the first one no longer listens", () => {
    const add = vi.spyOn(document, "addEventListener");
    const remove = vi.spyOn(document, "removeEventListener");
    /** The listeners of a type that were added and not removed. */
    const live = (type: string) => {
      const removed = remove.mock.calls.filter(([name]) => name === type).map(([, listener]) => listener);
      return add.mock.calls.filter(([name, listener]) => name === type && !removed.includes(listener));
    };

    const { rerender } = render(<Host key="gate" />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(hidden()).toBe(true);
    // The first frame leaves: the notes of the next frame start shown.
    rerender(<Host key="area" />);
    expect(hidden()).toBe(false);
    for (const type of ["keydown", "focusin", "pointerover"]) expect(live(type), type).toHaveLength(1);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(hidden()).toBe(true);
    fireEvent.focusIn(document.body);
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
