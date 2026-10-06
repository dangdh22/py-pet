// @vitest-environment jsdom
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { initialGameState } from "../game/state";
import { RunnerClient } from "../runner/client";
import { MemoryStore } from "../storage/memoryStore";
import { FakeWorker } from "../test/fakeWorker";
import { testBundle } from "../test/fixtures";
import { FIXED_NOW, renderWithGame, TODAY, testProfile } from "../test/renderGame";
import { App } from "./App";
import { AppRoutes } from "./AppRoutes";
import { ErrorBoundary } from "./ErrorBoundary";

beforeEach(() => {
  window.location.hash = "";
});

function makeClient() {
  const workers: FakeWorker[] = [];
  const client = new RunnerClient(() => {
    const worker = new FakeWorker();
    workers.push(worker);
    return worker;
  }, "http://localhost/pyodide/");
  return { client, workers };
}

describe("AppRoutes", () => {
  test("the room opens the next lesson", async () => {
    await renderWithGame(<AppRoutes />);
    expect(screen.getByRole("heading", { name: "Phòng của Robo" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("link", { name: "Học tiếp" }));
    expect(await screen.findByText("Thẻ 1/2")).toBeInTheDocument();
  });

  test("a finished lesson is saved and counted in today's goal", async () => {
    const state = initialGameState(TODAY);
    state.progress.completedLessons = ["t.l1"];
    const { store } = await renderWithGame(<AppRoutes />, { state });
    await userEvent.click(screen.getByRole("link", { name: "Học tiếp" }));
    await userEvent.click(await screen.findByRole("button", { name: "Hoàn thành" }));
    await userEvent.click(screen.getByRole("button", { name: "Về phòng" }));
    expect(await screen.findByText("Mục tiêu hôm nay: 1/2")).toBeInTheDocument();
    expect((await store.loadActive())?.state.progress.completedLessons).toEqual(["t.l1", "t.l2"]);
  });

  test("shows a message for an unknown or malformed lesson", async () => {
    window.location.hash = "#/lesson/%E0%A4%A";
    await renderWithGame(<AppRoutes />);
    expect(screen.getByText("Không tìm thấy bài học này.")).toBeInTheDocument();
  });

  test("the map opens from the room and a locked lesson cannot be opened by URL", async () => {
    await renderWithGame(<AppRoutes />);
    await userEvent.click(screen.getByRole("link", { name: "Bản đồ học" }));
    expect(await screen.findByRole("heading", { name: "Bản đồ học" })).toBeInTheDocument();
    window.location.hash = "#/lesson/t.l2";
    expect(await screen.findByText("Bài này chưa mở. Con học các bài trước đã nhé.")).toBeInTheDocument();
  });
});

describe("ErrorBoundary", () => {
  test("shows a friendly message when a screen throws", async () => {
    function Boom(): never {
      throw new Error("boom");
    }
    vi.spyOn(console, "error").mockImplementation(() => {});
    await renderWithGame(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Robo bị trục trặc rồi.");
  });
});

describe("App", () => {
  test("first run: loading, then the onboarding screen and the runner status", async () => {
    const { client, workers } = makeClient();
    render(<App bundle={testBundle()} runnerClient={client} store={new MemoryStore()} clock={() => FIXED_NOW} />);
    expect(screen.getByText("Robo đang khởi động...")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Chào mừng đến với Py-Pet!" })).toBeInTheDocument();
    act(() => workers[0]!.emit({ type: "ready" }));
    expect(await screen.findByText("Robo sẵn sàng")).toBeInTheDocument();
  });

  test("an existing profile opens the app directly", async () => {
    const store = new MemoryStore({ persistent: true });
    const state = initialGameState(TODAY);
    state.progress.completedLessons = ["t.l1"];
    await store.createProfile(testProfile(), state);
    render(<App bundle={testBundle()} runnerClient={makeClient().client} store={store} clock={() => FIXED_NOW} />);
    expect(await screen.findByRole("heading", { name: "Phòng của Robo" })).toBeInTheDocument();
  });

  test("a failed profile read shows an error and never the onboarding screen", async () => {
    class UnreadableStore extends MemoryStore {
      override async loadActive(): Promise<never> {
        throw new Error("read failed");
      }
    }
    render(<App bundle={testBundle()} runnerClient={makeClient().client} store={new UnreadableStore()} clock={() => FIXED_NOW} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Robo bị trục trặc rồi.");
    expect(screen.getByRole("button", { name: "Tải lại trang" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Chào mừng đến với Py-Pet!" })).not.toBeInTheDocument();
  });

  test("shows the other-tab message when the tab does not own the lock", async () => {
    render(<App bundle={testBundle()} runnerClient={makeClient().client} store={new MemoryStore()} ownsTab={false} />);
    expect(screen.getByText("Py-Pet đang mở ở tab khác. Con dùng tab đó nhé.")).toBeInTheDocument();
  });
});

describe("crash screen", () => {
  test("logs the crash and offers a backup export", async () => {
    function Boom(): never {
      throw new Error("boom");
    }
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { store } = await renderWithGame(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("button", { name: "Xuất file sao lưu" })).toBeInTheDocument();
    await waitFor(async () => expect((await store.readMeta()).errorLog[0]).toMatchObject({ kind: "ui-crash" }));
  });

  test("the backup route opens the backup screen", async () => {
    window.location.hash = "#/backup";
    await renderWithGame(<AppRoutes />);
    expect(screen.getByRole("heading", { name: "Sao lưu" })).toBeInTheDocument();
  });
});
