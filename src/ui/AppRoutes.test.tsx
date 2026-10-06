// @vitest-environment jsdom
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { GAME_STATE_VERSION, initialGameState, type GameState } from "../game/state";
import { RunnerClient } from "../runner/client";
import { MemoryStore } from "../storage/memoryStore";
import { hashPin } from "../storage/pin";
import { answerPaper } from "../test/answerExam";
import { examBundle } from "../test/examBundle";
import { FakeWorker } from "../test/fakeWorker";
import { testBundle } from "../test/fixtures";
import { fakeRunner, okResult } from "../test/render";
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

  test.each(["#/lesson/khong-co", "#/lesson/%E0%A4%A"])("shows a message for the unknown lesson %s", async (hash) => {
    window.location.hash = hash;
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
    delete old.remedial;
    delete old.pet.stageStartXp;
    delete old.progress.completedReviews;
    delete old.progress.topicTests;
    delete old.progress.evolutionTests;
    delete old.wallet.history;
    delete old.activity.seconds;
    delete old.inventory;
    delete old.rewards;
    delete old.vacation;
    delete old.assigned;
    delete old.badges;
    await store.createProfile(testProfile(), old);
    render(<App bundle={testBundle()} runnerClient={makeClient().client} store={store} clock={() => FIXED_NOW} />);
    expect(await screen.findByRole("heading", { name: "Phòng của Robo" })).toBeInTheDocument();
    await waitFor(async () => expect((await store.loadActive())?.state.version).toBe(GAME_STATE_VERSION));
  });

  test("a profile saved by a newer app is not opened", async () => {
    const store = new MemoryStore({ persistent: true });
    await store.createProfile(testProfile(), { ...initialGameState(TODAY), version: 99 });
    render(<App bundle={testBundle()} runnerClient={makeClient().client} store={store} clock={() => FIXED_NOW} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("phiên bản Py-Pet mới hơn");
    expect((await store.loadActive())?.state.version).toBe(99);
  });

  test("a damaged profile is logged and its data can be exported as it is", async () => {
    const store = new MemoryStore({ persistent: true });
    const damaged = { ...initialGameState(TODAY), wallet: "lots" } as unknown as GameState;
    await store.createProfile(testProfile(), damaged);
    await store.writeMeta({ pin: await hashPin("1234"), autoBackups: ["encoded-backup"] });
    render(<App bundle={testBundle()} runnerClient={makeClient().client} store={store} clock={() => FIXED_NOW} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Robo bị trục trặc rồi.");
    await waitFor(async () => expect((await store.readMeta()).errorLog).toMatchObject([{ kind: "load-failed" }]));
    await userEvent.click(screen.getByRole("button", { name: "Xuất dữ liệu để gửi hỗ trợ" }));
    const [fileName, text] = vi.mocked(downloadText).mock.calls.at(-1)!;
    expect(fileName).toBe("py-pet-data-2026-10-06.json");
    expect(JSON.parse(text).profiles[0].state.wallet).toBe("lots");
    // The file is for support: no PIN hash to brute-force and no copies of old data.
    expect(JSON.parse(text).meta.pin ?? null).toBeNull();
    expect(JSON.parse(text).meta.autoBackups ?? []).toEqual([]);
    expect(text).not.toContain("encoded-backup");
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

describe("tests and evolution", () => {
  test.each([
    ["#/topic-test/khong-co", "Không tìm thấy bài kiểm tra này."],
    ["#/topic-test/x.l1", "Không tìm thấy bài kiểm tra này."],
    ["#/evolution/khong-co", "Không tìm thấy bài kiểm tra này."],
    ["#/topic-test/x.t", "Bài kiểm tra này chưa mở. Con học các bài trước đã nhé."],
    ["#/evolution/x", "Bài kiểm tra này chưa mở. Con học các bài trước đã nhé."],
  ])("%s shows a message", async (hash, message) => {
    window.location.hash = hash;
    await renderWithGame(<AppRoutes />, { bundle: examBundle() });
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  test("an open focused review set comes before the retake", async () => {
    const state = initialGameState(TODAY);
    state.progress.completedLessons = ["x.l1", "x.l2"];
    state.progress.topicTests["x.t"] = { attempts: 1, best: 6, max: 6, passed: true, lastItems: [] };
    state.remedial = { stage: 1, items: ["x.q1"] };
    window.location.hash = "#/evolution/x";
    await renderWithGame(<AppRoutes />, { bundle: examBundle(), state });
    expect(screen.getByText("Con làm xong bộ ôn tập trọng tâm trước rồi thi lại nhé.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Bắt đầu ôn tập trọng tâm" })).toHaveAttribute("href", "#/remedial");
  });

  test("a passed evolution test cannot be taken again from the map", async () => {
    const state = initialGameState(TODAY);
    state.progress.completedLessons = ["x.l1", "x.l2"];
    state.progress.topicTests["x.t"] = { attempts: 1, best: 6, max: 6, passed: true, lastItems: [] };
    state.pet.stage = 2;
    window.location.hash = "#/evolution/x";
    await renderWithGame(<AppRoutes />, { bundle: examBundle(), state });
    expect(screen.getByText("Robo đã tiến hóa ở giai đoạn này rồi!")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Kiểm tra tiến hóa" })).not.toBeInTheDocument();
  });

  test("topic test, failed evolution, focused review, retake, evolution", async () => {
    let output = "Hi\n";
    const state = initialGameState(TODAY);
    state.progress.completedLessons = ["x.l1", "x.l2"];
    const { store } = await renderWithGame(<AppRoutes />, {
      bundle: examBundle(),
      state,
      runner: fakeRunner(() => okResult(output)),
    });
    const saved = async () => (await store.loadActive())!.state;

    await userEvent.click(screen.getByRole("link", { name: "Học tiếp" }));
    expect(await screen.findByRole("heading", { name: "Kiểm tra chủ đề: Chủ đề thi" })).toBeInTheDocument();
    await answerPaper("Đúng");
    await userEvent.click(screen.getByRole("link", { name: "Học tiếp" }));

    output = "Ho\n";
    expect(await screen.findByRole("heading", { name: "Kiểm tra tiến hóa" })).toBeInTheDocument();
    await answerPaper("Sai");
    expect(screen.getByRole("heading", { name: "Lần này chưa đạt" })).toBeInTheDocument();
    await waitFor(async () => expect((await saved()).remedial).not.toBeNull());
    await userEvent.click(screen.getByRole("button", { name: "Về phòng" }));
    await userEvent.click(await screen.findByRole("link", { name: "Học tiếp" }));

    expect(await screen.findByRole("heading", { name: "Ôn tập trọng tâm" })).toBeInTheDocument();
    const remedialCount = (await saved()).remedial!.items.length;
    for (let n = 0; n < remedialCount; n += 1) {
      await userEvent.click(screen.getByRole("radio", { name: "Đúng" }));
      await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
      await userEvent.click(screen.getByRole("button", { name: /^(Tiếp|Hoàn thành)$/ }));
    }
    await waitFor(async () => expect((await saved()).remedial).toBeNull());
    await userEvent.click(screen.getByRole("link", { name: "Học tiếp" }));

    output = "Hi\n";
    expect(await screen.findByRole("heading", { name: "Kiểm tra tiến hóa" })).toBeInTheDocument();
    await answerPaper("Đúng");
    expect(screen.getByRole("heading", { name: "Robo đã tiến hóa!" })).toBeInTheDocument();
    await waitFor(async () => expect((await saved()).pet.stage).toBe(2));
    const attempts = (await saved()).progress.evolutionTests;
    expect(attempts.map((attempt) => attempt.passed)).toEqual([false, true]);
  });
});

describe("M4a routes", () => {
  test.each([
    ["#/shop", "Cửa hàng"],
    ["#/achievements", "Sổ thành tích"],
  ])("%s opens its screen", async (hash, heading) => {
    window.location.hash = hash;
    await renderWithGame(<AppRoutes />);
    expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
  });

  test("an unknown practice from the parents says so", async () => {
    window.location.hash = "#/assigned/nope";
    await renderWithGame(<AppRoutes />);
    expect(screen.getByText("Không tìm thấy bài luyện này.")).toBeInTheDocument();
  });
});
