// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
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
  test("lists the lessons and opens one", async () => {
    await renderWithGame(<AppRoutes />);
    expect(screen.getByText("Giai đoạn thử")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("link", { name: "Bài thử" }));
    expect(await screen.findByText("Thẻ 1/2")).toBeInTheDocument();
  });

  test("a finished lesson is saved and shown as done", async () => {
    const { store } = await renderWithGame(<AppRoutes />);
    await userEvent.click(screen.getByRole("link", { name: "Bài thử 2" }));
    await userEvent.click(await screen.findByRole("button", { name: "Hoàn thành" }));
    await userEvent.click(screen.getByRole("button", { name: "Về danh sách bài" }));
    expect(await screen.findByText("Đã xong")).toBeInTheDocument();
    expect((await store.loadActive())?.state.progress.completedLessons).toEqual(["t.l2"]);
  });

  test("shows a message for an unknown or malformed lesson", async () => {
    window.location.hash = "#/lesson/%E0%A4%A";
    await renderWithGame(<AppRoutes />);
    expect(screen.getByText("Không tìm thấy bài học này.")).toBeInTheDocument();
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
    expect(await screen.findByText("Đã xong")).toBeInTheDocument();
  });

  test("shows the other-tab message when the tab does not own the lock", async () => {
    render(<App bundle={testBundle()} runnerClient={makeClient().client} store={new MemoryStore()} ownsTab={false} />);
    expect(screen.getByText("Py-Pet đang mở ở tab khác. Con dùng tab đó nhé.")).toBeInTheDocument();
  });
});
