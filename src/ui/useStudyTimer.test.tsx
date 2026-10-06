// @vitest-environment jsdom
import { act, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { renderWithGame } from "../test/renderGame";
import { useGame } from "./GameProvider";
import { useStudyTimer } from "./useStudyTimer";

function Timer({ active }: { active: boolean }) {
  useStudyTimer(active);
  const { state, today } = useGame();
  return <p>{state.activity.seconds[today] ?? 0}</p>;
}

/** A study screen the test can close. */
function Closable() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Timer active={open} />
      <button onClick={() => setOpen(false)}>close</button>
    </>
  );
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});
afterEach(() => {
  vi.useRealTimers();
});

describe("useStudyTimer", () => {
  test("saves a minute of active time, then stops counting after a minute without input", async () => {
    const { container } = await renderWithGame(<Timer active />);
    await act(async () => {
      vi.advanceTimersByTime(60_000);
    });
    expect(container.textContent).toBe("60");
    await act(async () => {
      vi.advanceTimersByTime(120_000);
    });
    expect(container.textContent).toBe("60");
    fireEvent.keyDown(window);
    await act(async () => {
      vi.advanceTimersByTime(60_000);
    });
    expect(container.textContent).toBe("120");
  });

  test("saves the seconds left when the page is being closed", async () => {
    const view = await renderWithGame(<Timer active />);
    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });
    expect(view.container.textContent).toBe("0");
    await act(async () => {
      window.dispatchEvent(new Event("pagehide"));
    });
    expect(view.container.textContent).toBe("30");
  });

  test("saves the seconds left when the study screen closes", async () => {
    const view = await renderWithGame(<Closable />);
    const seconds = () => view.container.querySelector("p")!.textContent;
    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });
    expect(seconds()).toBe("0");
    fireEvent.click(view.getByRole("button", { name: "close" }));
    expect(seconds()).toBe("30");
  });
});
