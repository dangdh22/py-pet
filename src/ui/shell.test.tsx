// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { fakeRunner, okResult, renderWithApp } from "../test/render";
import { useContent } from "./contexts";
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
