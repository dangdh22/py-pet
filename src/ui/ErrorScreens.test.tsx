// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { RunnerClient } from "../runner/client";
import { MemoryStore } from "../storage/memoryStore";
import { FakeWorker } from "../test/fakeWorker";
import { testBundle } from "../test/fixtures";
import { FIXED_NOW, renderWithGame } from "../test/renderGame";
import { App } from "./App";
import { ErrorBoundary } from "./ErrorBoundary";
import { RailLayout } from "./shell/RailLayout";
import { SideNav } from "./shell/SideNav";

beforeEach(() => {
  window.location.hash = "";
});

afterEach(() => {
  vi.restoreAllMocks();
});

function makeClient() {
  return new RunnerClient(() => new FakeWorker(), "http://localhost/pyodide/");
}

/** A screen that has drawn its own title when it crashes: React drops the whole subtree, so that title must go too. */
function BrokenScreen(): never {
  throw new Error("boom");
}
function ScreenWithTitle() {
  return (
    <>
      <h1>Cửa hàng</h1>
      <BrokenScreen />
    </>
  );
}

describe("error screens: 1 card with Robo drained", () => {
  test("a crash inside the frame: the card is the one h1 of the page and the side menu stays", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    await renderWithGame(
      <RailLayout nav={<SideNav current="shop" />}>
        <ErrorBoundary>
          <ScreenWithTitle />
        </ErrorBoundary>
      </RailLayout>,
    );
    const alert = screen.getByRole("alert");
    expect(within(alert).getByRole("heading", { level: 1, name: "Robo gặp sự cố" })).toBeInTheDocument();
    expect(within(alert).getByText("Robo bị trục trặc rồi. Con tải lại trang nhé.")).toBeInTheDocument();
    expect(within(alert).getByRole("button", { name: "Tải lại trang" })).toBeInTheDocument();
    expect(within(alert).getByRole("img", { name: "Robo" })).toHaveAttribute("data-mood", "drained");
    expect(within(alert).getByRole("img", { name: "Robo" })).toHaveAttribute("data-form", "1");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("navigation", { name: "Menu chính" })).toBeInTheDocument();
  });

  test("the card sits in a white box, not on the bare page", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    await renderWithGame(
      <ErrorBoundary>
        <BrokenScreen />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("heading", { level: 1 }).closest(".card.error-card")).not.toBeNull();
  });

  test("a second tab: a title and the sentence, no button", () => {
    render(<App bundle={testBundle()} runnerClient={makeClient()} store={new MemoryStore()} ownsTab={false} />);
    expect(screen.getByRole("heading", { level: 1, name: "Mở Py-Pet ở 1 tab thôi nhé" })).toBeInTheDocument();
    expect(screen.getByText("Py-Pet đang mở ở tab khác. Con dùng tab đó nhé.")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Robo" })).toHaveAttribute("data-mood", "drained");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  test("a profile that does not load: a title, the reload button and the raw export", async () => {
    class UnreadableStore extends MemoryStore {
      override async loadActive(): Promise<never> {
        throw new Error("read failed");
      }
    }
    render(<App bundle={testBundle()} runnerClient={makeClient()} store={new UnreadableStore()} clock={() => FIXED_NOW} />);
    const alert = await screen.findByRole("alert");
    expect(within(alert).getByRole("heading", { level: 1, name: "Chưa mở được hồ sơ" })).toBeInTheDocument();
    expect(within(alert).getByText("Robo bị trục trặc rồi. Con tải lại trang nhé.")).toBeInTheDocument();
    expect(within(alert).getByRole("button", { name: "Tải lại trang" })).toBeInTheDocument();
    expect(within(alert).getByRole("button", { name: "Xuất dữ liệu để gửi hỗ trợ" })).toBeInTheDocument();
    expect(within(alert).getByRole("img", { name: "Robo" })).toHaveAttribute("data-mood", "drained");
  });

  test("a profile that does not load keeps the main landmark: the alert is inside it and holds the heading", async () => {
    class UnreadableStore extends MemoryStore {
      override async loadActive(): Promise<never> {
        throw new Error("read failed");
      }
    }
    render(<App bundle={testBundle()} runnerClient={makeClient()} store={new UnreadableStore()} clock={() => FIXED_NOW} />);
    const main = await screen.findByRole("main");
    expect(main).not.toHaveAttribute("role");
    const alert = within(main).getByRole("alert");
    expect(within(alert).getByRole("heading", { level: 1, name: "Chưa mở được hồ sơ" })).toBeInTheDocument();
  });
});
