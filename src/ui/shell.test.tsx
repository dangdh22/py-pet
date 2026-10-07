// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { fakeRunner, okResult, renderWithApp } from "../test/render";
import { useContent } from "./contexts";
import { DevGalleryGate } from "./GalleryScreen";
import { Header } from "./Header";
import { Robot } from "./Robot";
import { RobotBubble } from "./RobotBubble";

describe("Header", () => {
  test("shows the runner status", () => {
    renderWithApp(<Header />, { runner: fakeRunner(() => okResult(""), "loading") });
    expect(screen.getByText("Robo đang khởi động...")).toBeInTheDocument();
  });

  test("offers retry when the runner failed", async () => {
    const runner = fakeRunner(() => okResult(""), "failed");
    renderWithApp(<Header />, { runner });
    expect(screen.getByText("Robo chưa khởi động được.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(runner.retry).toHaveBeenCalledOnce();
    expect(screen.getByText("Nếu vẫn lỗi, con tải lại trang nhé.")).toBeInTheDocument();
  });

  test("switches the interface language", async () => {
    renderWithApp(<Header />);
    expect(screen.getByText("Robo sẵn sàng")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "EN" }));
    expect(screen.getByText("Robo is ready")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "EN" })).toHaveAttribute("aria-pressed", "true");
  });
});

describe("Robot", () => {
  test("exposes the mood", () => {
    render(<Robot mood="happy" />);
    expect(screen.getByRole("img", { name: "Robo" })).toHaveAttribute("data-mood", "happy");
  });

  test("defaults to the neutral capsule", () => {
    render(<Robot />);
    const robot = screen.getByRole("img", { name: "Robo" });
    expect(robot).toHaveAttribute("data-mood", "neutral");
    expect(robot).toHaveAttribute("data-form", "1");
    expect(robot).toHaveAttribute("data-size", "56");
    expect(robot).toHaveAttribute("viewBox", "0 0 64 72");
  });

  test("each form adds a new part", () => {
    const parts = (form: 1 | 2 | 3 | 4) => {
      const { container, unmount } = render(<Robot form={form} />);
      const found = ["antenna", "arms", "chest", "star"].filter((part) => container.querySelector(`[data-part="${part}"]`));
      unmount();
      return found;
    };
    expect(parts(1)).toEqual([]);
    expect(parts(2)).toEqual(["antenna"]);
    expect(parts(3)).toEqual(["antenna", "arms"]);
    expect(parts(4)).toEqual(["antenna", "arms", "chest"]);
  });

  test("a graduated robot wears a star on its chest screen", () => {
    const { container } = render(<Robot form={4} graduated />);
    expect(container.querySelector('[data-part="chest"] [data-part="star"]')).not.toBeNull();
  });

  test("draws every form with every face", () => {
    const moods = ["happy", "neutral", "sleepy", "drained", "vacation", "sad", "thinking"] as const;
    for (const form of [1, 2, 3, 4] as const) {
      for (const mood of moods) {
        const { container, unmount } = render(<Robot form={form} mood={mood} size={112} />);
        const robot = screen.getByRole("img", { name: "Robo" });
        expect(robot).toHaveAttribute("data-form", String(form));
        expect(robot).toHaveAttribute("height", "126");
        expect(container.querySelector(`[data-part="face"][data-face="${mood}"]`)).not.toBeNull();
        expect(container.querySelector('[data-part="zzz"]') !== null).toBe(mood === "sleepy");
        expect(container.querySelector('[data-part="battery"]') !== null).toBe(mood === "drained");
        unmount();
      }
    }
  });

  test("has sleepy and drained moods", () => {
    render(<Robot mood="sleepy" />);
    render(<Robot mood="drained" />);
    expect(screen.getAllByRole("img", { name: "Robo" }).map((el) => el.getAttribute("data-mood"))).toEqual(["sleepy", "drained"]);
  });
});

describe("DevGalleryGate", () => {
  test("shows the gallery at #/gallery instead of the app, without a game", () => {
    window.location.hash = "#/gallery";
    try {
      render(
        <DevGalleryGate>
          <p>app</p>
        </DevGalleryGate>,
      );
      expect(screen.getByRole("heading", { name: "Robo gallery (dev only)" })).toBeInTheDocument();
      expect(screen.queryByText("app")).not.toBeInTheDocument();
      // 4 forms and the graduate × 7 faces, 10 accessories and 6 outfits × 4 forms, the 12 room sizes, 5 states × 3
      // room scenes and 4 drained forms, and 12 bubbles.
      expect(screen.getAllByRole("img", { name: "Robo" })).toHaveLength(35 + 64 + 12 + 15 + 4 + 12);
    } finally {
      window.location.hash = "";
    }
  });

  test("shows the app on any other hash", () => {
    render(
      <DevGalleryGate>
        <p>app</p>
      </DevGalleryGate>,
    );
    expect(screen.getByText("app")).toBeInTheDocument();
  });
});

describe("RobotBubble", () => {
  test("shows the message, the hint and a collapsed raw error", () => {
    renderWithApp(
      <RobotBubble mood="sad" message="Dòng 1: lỗi" hint="Gợi ý nhỏ" rawError="NameError: name 'x' is not defined" />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Dòng 1: lỗi");
    expect(screen.getByText("Gợi ý nhỏ")).toBeInTheDocument();
    expect(screen.getByText("Xem lỗi gốc")).toBeInTheDocument();
  });

  test("hides the hint and raw error when they are absent", () => {
    renderWithApp(<RobotBubble mood="happy" message="Tuyệt" />);
    expect(screen.queryByText("Xem lỗi gốc")).not.toBeInTheDocument();
  });
});

describe("contexts", () => {
  test("useContent outside the providers throws", () => {
    function Probe() {
      useContent();
      return null;
    }
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow("useContent must be used inside <AppProviders>");
  });
});
