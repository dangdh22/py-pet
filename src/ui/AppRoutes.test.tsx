// @vitest-environment jsdom
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { initialGameState, type GameState } from "../game/state";
import { RunnerClient } from "../runner/client";
import { MemoryStore } from "../storage/memoryStore";
import { FakeWorker } from "../test/fakeWorker";
import { testBundle } from "../test/fixtures";
import { FIXED_NOW, renderWithGame, TODAY, testProfile } from "../test/renderGame";
import { reviewBundle } from "../test/reviewBundle";
import { App } from "./App";
import { downloadText } from "./download";
import { AppRoutes } from "./AppRoutes";
import { ErrorBoundary } from "./ErrorBoundary";

vi.mock("./download", () => ({ downloadText: vi.fn() }));

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

describe("review routes", () => {
  test.each([
    ["#/review/r.r1", "Trạm ôn này chưa mở. Con học các bài trước đã nhé."],
    ["#/review/nope", "Không tìm thấy trạm ôn này."],
    ["#/review/r.l1", "Không tìm thấy trạm ôn này."],
  ])("%s shows a message", async (hash, message) => {
    window.location.hash = hash;
    await renderWithGame(<AppRoutes />, { bundle: reviewBundle() });
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  test("the room opens the station once its lessons are done", async () => {
    const state = initialGameState(TODAY);
    state.progress.completedLessons = ["r.l1", "r.l2"];
    await renderWithGame(<AppRoutes />, { bundle: reviewBundle(), state });
    await userEvent.click(screen.getByRole("link", { name: "Học tiếp" }));
    expect(await screen.findByRole("heading", { name: "Trạm ôn" })).toBeInTheDocument();
    expect(screen.getByText("Câu 1/5")).toBeInTheDocument();
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

  test("a crash while the game starts shows the crash screen, not a blank page", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    class BrokenStateStore extends MemoryStore {
      override async loadActive() {
        const loaded = await super.loadActive();
        return loaded && { ...loaded, state: {} as GameState };
      }
    }
    const store = new BrokenStateStore({ persistent: true });
    await store.createProfile(testProfile(), initialGameState(TODAY));
    render(<App bundle={testBundle()} runnerClient={makeClient().client} store={store} clock={() => FIXED_NOW} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Robo bị trục trặc rồi.");
  });

  test("a profile saved by an older app is upgraded when it opens", async () => {
    const store = new MemoryStore({ persistent: true });
    const old = JSON.parse(JSON.stringify(initialGameState(TODAY)));
    old.version = 1;
    delete old.mastery;
    delete old.reviews;
    delete old.retry;
    delete old.progress.completedReviews;
    await store.createProfile(testProfile(), old);
    render(<App bundle={testBundle()} runnerClient={makeClient().client} store={store} clock={() => FIXED_NOW} />);
    expect(await screen.findByRole("heading", { name: "Phòng của Robo" })).toBeInTheDocument();
    await waitFor(async () => expect((await store.loadActive())?.state.version).toBe(2));
  });

  test("a profile saved by a newer app is not opened", async () => {
    const store = new MemoryStore({ persistent: true });
    await store.createProfile(testProfile(), { ...initialGameState(TODAY), version: 99 });
    render(<App bundle={testBundle()} runnerClient={makeClient().client} store={store} clock={() => FIXED_NOW} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("phiên bản Py-Pet mới hơn");
    expect((await store.loadActive())?.state.version).toBe(99);
  });

  test("shows the other-tab message when the tab does not own the lock", async () => {
    render(<App bundle={testBundle()} runnerClient={makeClient().client} store={new MemoryStore()} ownsTab={false} />);
    expect(screen.getByText("Py-Pet đang mở ở tab khác. Con dùng tab đó nhé.")).toBeInTheDocument();
  });
});

function Boom(): never {
  throw new Error("boom");
}

describe("crash screen", () => {
  test("logs the crash and offers a backup export", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { store } = await renderWithGame(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("button", { name: "Xuất file sao lưu" })).toBeInTheDocument();
    await waitFor(async () => expect((await store.readMeta()).errorLog[0]).toMatchObject({ kind: "ui-crash" }));
  });

  test("the crash screen exports a backup file", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(downloadText).mockClear();
    await renderWithGame(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Xuất file sao lưu" }));
    await waitFor(() => expect(downloadText).toHaveBeenCalledOnce());
    expect(vi.mocked(downloadText).mock.calls[0]![0]).toMatch(/\.pypet$/);
  });

  test("the crash screen reports a failed export", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    class BrokenStore extends MemoryStore {
      broken = false;
      override async readMeta() {
        if (this.broken) throw new Error("broken");
        return super.readMeta();
      }
      override async exportProfiles(): Promise<never> {
        throw new Error("broken");
      }
    }
    const store = new BrokenStore({ persistent: true });
    await renderWithGame(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
      { store },
    );
    store.broken = true;
    await userEvent.click(screen.getByRole("button", { name: "Xuất file sao lưu" }));
    expect(await screen.findByText("Chưa xuất được file sao lưu.")).toBeInTheDocument();
  });

  test("the backup route opens the backup screen", async () => {
    window.location.hash = "#/backup";
    await renderWithGame(<AppRoutes />);
    expect(screen.getByRole("heading", { name: "Sao lưu" })).toBeInTheDocument();
  });
});
