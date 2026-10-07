// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import type { RobotForm } from "../game/look";
import { LangProvider } from "../i18n/LangProvider";
import { EvolutionShow } from "./EvolutionShow";

function show(
  from: RobotForm,
  to: RobotForm,
  options: { graduated?: boolean; reducedMotion?: boolean; equipped?: string[] } = {},
) {
  const onDone = vi.fn();
  const ui: ReactElement = (
    <LangProvider initialLang="vi">
      <EvolutionShow
        from={{ form: from, graduated: false }}
        to={{ form: to, graduated: options.graduated ?? false }}
        equipped={options.equipped ?? []}
        robotName="Robo"
        onDone={onDone}
        reducedMotion={options.reducedMotion ?? false}
      />
    </LangProvider>
  );
  return { onDone, ...render(ui) };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("EvolutionShow", () => {
  test("with reduced motion it ends at once and shows no overlay", () => {
    const { onDone } = show(1, 2, { reducedMotion: true });
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("a full-screen dialog with the old form, then the new form", () => {
    show(2, 3, { equipped: ["mu-luoi-trai"] });
    const dialog = screen.getByRole("dialog", { name: "Robo đã tiến hóa!" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveClass("evolution-show");
    const robots = screen.getAllByRole("img", { name: "Robo" });
    expect(robots.map((robot) => robot.getAttribute("data-form"))).toEqual(["2", "3"]);
    expect(screen.getByText("Robo đang lớn lên…")).toBeInTheDocument();
  });

  test("the skip button has the focus at open and ends the show", async () => {
    const { onDone } = show(1, 2);
    const skip = screen.getByRole("button", { name: "Bỏ qua" });
    expect(skip).toHaveFocus();
    await userEvent.click(skip);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  test("Esc skips the show, and the show ends only once", async () => {
    const { onDone } = show(1, 2);
    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByRole("button", { name: "Bỏ qua" }));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  test.each([
    [1, 2, "Robo có thêm ăng-ten!"],
    [2, 3, "Robo có thêm 2 cánh tay!"],
    [3, 4, "Robo có thêm màn hình ngực!"],
  ] as const)("from form %i to %i names the new part", (from, to, line) => {
    show(from, to);
    expect(screen.getByText(line)).toBeInTheDocument();
  });

  test("after the last stage it says Robo has finished all the stages", () => {
    show(4, 4, { graduated: true });
    expect(screen.getByText("Robo đã học xong cả 4 giai đoạn!")).toBeInTheDocument();
    expect(screen.queryByText(/có thêm/)).not.toBeInTheDocument();
  });

  test("the end of the last step ends the show; other steps do not", () => {
    const { onDone, container } = show(1, 2);
    fireEvent.animationEnd(container.querySelector(".evo-old")!);
    expect(onDone).not.toHaveBeenCalled();
    fireEvent.animationEnd(container.querySelector(".evo-part")!);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  test("a timer ends the show after 6 seconds if no animation ends", () => {
    vi.useFakeTimers();
    const { onDone } = show(1, 2);
    act(() => vi.advanceTimersByTime(5900));
    expect(onDone).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(200));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  test("without matchMedia the show plays", () => {
    const onDone = vi.fn();
    expect(window.matchMedia).toBeUndefined();
    render(
      <LangProvider initialLang="vi">
        <EvolutionShow
          from={{ form: 1, graduated: false }}
          to={{ form: 2, graduated: false }}
          equipped={[]}
          robotName="Robo"
          onDone={onDone}
        />
      </LangProvider>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(onDone).not.toHaveBeenCalled();
  });

  test("a reduce preference from matchMedia ends the show at once", () => {
    const onDone = vi.fn();
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: query === "(prefers-reduced-motion: reduce)" }));
    try {
      render(
        <LangProvider initialLang="vi">
          <EvolutionShow
            from={{ form: 1, graduated: false }}
            to={{ form: 2, graduated: false }}
            equipped={[]}
            robotName="Robo"
            onDone={onDone}
          />
        </LangProvider>,
      );
    } finally {
      vi.unstubAllGlobals();
    }
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
