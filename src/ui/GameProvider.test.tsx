// @vitest-environment jsdom
import { act, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { initialGameState } from "../game/state";
import { useLang } from "../i18n/LangProvider";
import { decodeBackup } from "../storage/backup";
import { MemoryStore } from "../storage/memoryStore";
import type { AppMeta, ProfileBundle } from "../storage/types";
import { hashPin } from "../storage/pin";
import { sampleBackupPayload } from "../test/backupSample";
import { FIXED_NOW, renderWithGame, TODAY } from "../test/renderGame";
import { fakeRunner, okResult } from "../test/render";
import { useLogError, useRunner } from "./contexts";
import { DRAFT_SAVE_DELAY_MS, useGame } from "./GameProvider";

afterEach(() => {
  vi.useRealTimers();
});

function Probe() {
  const game = useGame();
  const { setUiLang, t } = useLang();
  const logError = useLogError();
  return (
    <div>
      <p>xp:{game.state.pet.xp}</p>
      <p>pin:{game.state.pet.pin}</p>
      <p>today:{game.today}</p>
      <p>lang:{game.state.settings.uiLang}</p>
      <p>{t("lesson.next")}</p>
      <p>failed:{String(game.writeFailed)}</p>
      <p>reminder:{String(game.needsBackupReminder)}</p>
      <button onClick={() => game.dispatch({ type: "LessonCompleted", lessonId: "t.l1" })}>complete</button>
      <button
        onClick={() =>
          game.dispatch(
            { type: "QuestionAnswered", questionId: "t.l1.q1", correct: true },
            { kind: "choice", itemId: "t.l1.q1", choiceIndex: 0, correct: true, lang: "vi" },
          )
        }
      >
        answer
      </button>
      <button onClick={() => game.saveDraft("t.l1.ex1", "print(1)")}>draft</button>
      <button onClick={() => setUiLang("en")}>to-en</button>
      <button onClick={() => logError({ kind: "unknown-python-error", detail: "KeyError: 'a'" })}>log</button>
    </div>
  );
}

describe("GameProvider", () => {
  test("dispatch updates the state and saves it with the attempt", async () => {
    const { store } = await renderWithGame(<Probe />);
    await userEvent.click(screen.getByRole("button", { name: "complete" }));
    await userEvent.click(screen.getByRole("button", { name: "answer" }));
    expect(screen.getByText("xp:13")).toBeInTheDocument();
    await waitFor(async () => expect((await store.loadActive())?.state.pet.xp).toBe(13));
    const [bundle] = await store.exportProfiles();
    expect(bundle!.attempts).toEqual([
      expect.objectContaining({ kind: "choice", profileId: "p1", itemId: "t.l1.q1", at: FIXED_NOW.toISOString() }),
    ]);
  });

  test("runs a day rollover on mount", async () => {
    const state = initialGameState("2026-10-01");
    state.activity.lastActiveDay = "2026-10-01";
    await renderWithGame(<Probe />, { state });
    expect(await screen.findByText("pin:1")).toBeInTheDocument();
  });

  test("runs a day rollover at midnight while the app stays open", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    let now = new Date(2026, 9, 6, 23, 59, 30);
    const state = initialGameState(TODAY);
    state.activity.lastActiveDay = "2026-10-04";
    await renderWithGame(<Probe />, { state, clock: () => now });
    expect(screen.getByText("pin:4")).toBeInTheDocument();
    expect(screen.getByText("today:2026-10-06")).toBeInTheDocument();
    now = new Date(2026, 9, 7, 0, 0, 1);
    act(() => {
      vi.advanceTimersByTime(31_000);
    });
    expect(screen.getByText("pin:3")).toBeInTheDocument();
    expect(screen.getByText("today:2026-10-07")).toBeInTheDocument();
  });

  test("runs a day rollover when the page becomes visible again", async () => {
    let now = FIXED_NOW;
    const state = initialGameState(TODAY);
    state.activity.lastActiveDay = TODAY;
    await renderWithGame(<Probe />, { state, clock: () => now });
    expect(screen.getByText("pin:4")).toBeInTheDocument();
    now = new Date(2026, 9, 9, 9, 0, 0);
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(await screen.findByText("pin:3")).toBeInTheDocument();
  });

  test("starts in the saved language", async () => {
    const state = initialGameState(TODAY);
    state.settings.uiLang = "en";
    await renderWithGame(<Probe />, { state });
    expect(await screen.findByText("Next")).toBeInTheDocument();
    expect(screen.getByText("lang:en")).toBeInTheDocument();
  });

  test("saves a language change", async () => {
    const { store } = await renderWithGame(<Probe />);
    expect(screen.getByText("lang:vi")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "to-en" }));
    expect(await screen.findByText("lang:en")).toBeInTheDocument();
    await waitFor(async () => expect((await store.loadActive())?.state.settings.uiLang).toBe("en"));
  });

  test("saves a pending draft at once when the page is hidden", async () => {
    const { store } = await renderWithGame(<Probe />);
    await userEvent.click(screen.getByRole("button", { name: "draft" }));
    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect((await store.loadActive())?.drafts.get("t.l1.ex1")).toBe("print(1)");
  });

  test("saves a draft after a short delay", async () => {
    const { store } = await renderWithGame(<Probe />);
    await userEvent.click(screen.getByRole("button", { name: "draft" }));
    expect((await store.loadActive())?.drafts.get("t.l1.ex1")).toBeUndefined();
    await waitFor(async () => expect((await store.loadActive())?.drafts.get("t.l1.ex1")).toBe("print(1)"));
  });

  test("marks writeFailed after a save fails twice", async () => {
    class FailingStore extends MemoryStore {
      override async saveState(): Promise<void> {
        throw new Error("QuotaExceededError");
      }
    }
    await renderWithGame(<Probe />, { store: new FailingStore({ persistent: true }) });
    expect(await screen.findByText("failed:true")).toBeInTheDocument();
  });

  test("logs errors into the meta", async () => {
    const { store } = await renderWithGame(<Probe />);
    await userEvent.click(screen.getByRole("button", { name: "log" }));
    await waitFor(async () =>
      expect((await store.readMeta()).errorLog).toEqual([
        { at: FIXED_NOW.toISOString(), kind: "unknown-python-error", detail: "KeyError: 'a'" },
      ]),
    );
  });

  test("needsBackupReminder after 7 days without a backup", async () => {
    await renderWithGame(<Probe />, { meta: { lastBackupAt: new Date(2026, 8, 29, 9).toISOString() } });
    expect(screen.getByText("reminder:true")).toBeInTheDocument();
  });

  test("no reminder 3 days after a backup", async () => {
    await renderWithGame(<Probe />, { meta: { lastBackupAt: new Date(2026, 9, 3, 9).toISOString() } });
    expect(screen.getByText("reminder:false")).toBeInTheDocument();
  });
});

describe("GameProvider backups", () => {
  function BackupProbe() {
    const game = useGame();
    return (
      <div>
        <p>last:{game.lastBackupAt ?? "none"}</p>
        <button
          onClick={async () => {
            const file = await game.exportBackup();
            document.title = `${file.fileName}|${file.text.length > 0}`;
          }}
        >
          export
        </button>
        <button
          onClick={async () => {
            document.title = `pin:${await game.checkPin("1234")}:${await game.checkPin("9999")}`;
          }}
        >
          pin
        </button>
        <button onClick={() => void game.importBackup(sampleBackupPayload("Bình"))}>import</button>
      </div>
    );
  }

  test("exportBackup returns a decodable file and records the time", async () => {
    const { store } = await renderWithGame(<BackupProbe />);
    await userEvent.click(screen.getByRole("button", { name: "export" }));
    await waitFor(() => expect(document.title).toBe("py-pet-an-2026-10-06.pypet|true"));
    expect(screen.getByText(`last:${FIXED_NOW.toISOString()}`)).toBeInTheDocument();
    expect((await store.readMeta()).lastBackupAt).toBe(FIXED_NOW.toISOString());
  });

  function ExportProbe() {
    const game = useGame();
    const [exported, setExported] = useState<string | null>(null);
    return (
      <div>
        <p>last:{game.lastBackupAt ?? "none"}</p>
        <button onClick={() => game.dispatch({ type: "LessonCompleted", lessonId: "t.l1" })}>complete</button>
        <button onClick={() => game.saveDraft("t.l1.ex1", "print(7)")}>draft</button>
        <button onClick={async () => setExported((await game.exportBackup()).text)}>export</button>
        <button onClick={() => void game.importBackup(sampleBackupPayload("Bình"))}>import</button>
        {exported && <p data-testid="exported">{exported}</p>}
      </div>
    );
  }

  async function exportedPayload() {
    const result = await decodeBackup((await screen.findByTestId("exported")).textContent ?? "");
    if (!result.ok) throw new Error("the exported file does not decode");
    return result.payload;
  }

  test("exportBackup saves the in-memory progress when saving the state fails", async () => {
    class NoSaveStore extends MemoryStore {
      override async saveState(): Promise<void> {
        throw new Error("QuotaExceededError");
      }
    }
    await renderWithGame(<ExportProbe />, { store: new NoSaveStore({ persistent: true }) });
    await userEvent.click(screen.getByRole("button", { name: "complete" }));
    await userEvent.click(screen.getByRole("button", { name: "draft" }));
    await userEvent.click(screen.getByRole("button", { name: "export" }));
    const payload = await exportedPayload();
    expect(payload.profiles).toHaveLength(1);
    expect(payload.profiles[0]!.state.pet.xp).toBe(10);
    expect(payload.profiles[0]!.state.progress.completedLessons).toEqual(["t.l1"]);
    expect(payload.profiles[0]!.drafts).toEqual([{ profileId: "p1", itemId: "t.l1.ex1", code: "print(7)" }]);
  });

  test("exportBackup still returns the file when no write works", async () => {
    class NoWriteStore extends MemoryStore {
      override async saveState(): Promise<void> {
        throw new Error("QuotaExceededError");
      }
      override async writeMeta(): Promise<void> {
        throw new Error("QuotaExceededError");
      }
    }
    await renderWithGame(<ExportProbe />, { store: new NoWriteStore({ persistent: true }) });
    await userEvent.click(screen.getByRole("button", { name: "complete" }));
    await userEvent.click(screen.getByRole("button", { name: "export" }));
    expect((await exportedPayload()).profiles[0]!.state.pet.xp).toBe(10);
    expect(screen.getByText(`last:${FIXED_NOW.toISOString()}`)).toBeInTheDocument();
  });

  test("exportBackup exports no attempts when they cannot be read", async () => {
    class NoReadStore extends MemoryStore {
      override async exportProfiles(): Promise<never> {
        throw new Error("read failed");
      }
    }
    await renderWithGame(<ExportProbe />, { store: new NoReadStore({ persistent: true }) });
    await userEvent.click(screen.getByRole("button", { name: "complete" }));
    await userEvent.click(screen.getByRole("button", { name: "export" }));
    const payload = await exportedPayload();
    expect(payload.profiles[0]!.state.pet.xp).toBe(10);
    expect(payload.profiles[0]!.attempts).toEqual([]);
  });

  test("the automatic backup taken by an import keeps the in-memory progress", async () => {
    class NoSaveStore extends MemoryStore {
      override async saveState(): Promise<void> {
        throw new Error("QuotaExceededError");
      }
    }
    const onReplaced = vi.fn();
    const { store } = await renderWithGame(<ExportProbe />, { store: new NoSaveStore({ persistent: true }), onReplaced });
    await userEvent.click(screen.getByRole("button", { name: "complete" }));
    await userEvent.click(screen.getByRole("button", { name: "import" }));
    await waitFor(() => expect(onReplaced).toHaveBeenCalledOnce());
    const kept = await decodeBackup((await store.readMeta()).autoBackups[0]!);
    expect(kept.ok && kept.payload.profiles[0]!.state.pet.xp).toBe(10);
  });

  test("importBackup fills in the meta fields the file does not have", async () => {
    let written: AppMeta | null = null;
    class RecordingStore extends MemoryStore {
      override async replaceAll(meta: AppMeta, profiles: ProfileBundle[]): Promise<void> {
        written = meta;
        await super.replaceAll(meta, profiles);
      }
    }
    function PartialImport() {
      const game = useGame();
      const payload = sampleBackupPayload("Bình");
      const meta = { schemaVersion: 1, activeProfileId: "p1" } as unknown as AppMeta;
      return <button onClick={() => void game.importBackup({ ...payload, meta })}>import</button>;
    }
    const onReplaced = vi.fn();
    await renderWithGame(<PartialImport />, { store: new RecordingStore({ persistent: true }), onReplaced });
    await userEvent.click(screen.getByRole("button", { name: "import" }));
    await waitFor(() => expect(onReplaced).toHaveBeenCalledOnce());
    expect(written).toMatchObject({ errorLog: [], pin: null, lastBackupAt: null, activeProfileId: "p1" });
    expect(written!.autoBackups).toHaveLength(1);
  });

  test("checkPin verifies against the stored hash", async () => {
    await renderWithGame(<BackupProbe />, { meta: { pin: await hashPin("1234", 1000) } });
    await userEvent.click(screen.getByRole("button", { name: "pin" }));
    await waitFor(() => expect(document.title).toBe("pin:true:false"));
  });

  test("importBackup keeps an automatic backup, replaces the data and reloads", async () => {
    const onReplaced = vi.fn();
    const { store } = await renderWithGame(<BackupProbe />, { onReplaced });
    await userEvent.click(screen.getByRole("button", { name: "import" }));
    await waitFor(() => expect(onReplaced).toHaveBeenCalledOnce());
    expect((await store.loadActive())?.profile.childName).toBe("Bình");
    const meta = await store.readMeta();
    expect(meta.autoBackups).toHaveLength(1);
    const kept = await decodeBackup(meta.autoBackups[0]!);
    expect(kept.ok && kept.payload.profiles[0]!.profile.childName).toBe("An");
  });
});

describe("GameProvider import race", () => {
  function RaceProbe() {
    const game = useGame();
    return (
      <div>
        <button
          onClick={() => {
            void game.importBackup(sampleBackupPayload("Bình"));
            game.dispatch({ type: "LessonCompleted", lessonId: "t.l1" });
            game.saveDraft("t.l1.ex1", "print(9)");
          }}
        >
          race
        </button>
        <button
          onClick={() => {
            game.importBackup(sampleBackupPayload("Bình")).catch(() => {
              document.title = "import-failed";
            });
          }}
        >
          failing
        </button>
        <button onClick={() => game.dispatch({ type: "LessonCompleted", lessonId: "t.l1" })}>complete</button>
      </div>
    );
  }

  test("writes made after an import starts do not overwrite the imported data", async () => {
    const onReplaced = vi.fn();
    const { store } = await renderWithGame(<RaceProbe />, { onReplaced });
    await userEvent.click(screen.getByRole("button", { name: "race" }));
    await waitFor(() => expect(onReplaced).toHaveBeenCalledOnce());
    await new Promise((resolve) => setTimeout(resolve, DRAFT_SAVE_DELAY_MS + 200));
    const loaded = await store.loadActive();
    expect(loaded?.profile.childName).toBe("Bình");
    expect(loaded?.state.wallet.xu).toBe(120);
    expect(loaded?.state.progress.completedLessons).toEqual([]);
    expect(loaded?.drafts.get("t.l1.ex1")).toBeUndefined();
  });

  test("a failing import rejects, skips onReplaced and lets later saves through", async () => {
    class FailingReplace extends MemoryStore {
      override async replaceAll(): Promise<void> {
        throw new Error("boom");
      }
    }
    const onReplaced = vi.fn();
    const { store } = await renderWithGame(<RaceProbe />, { store: new FailingReplace({ persistent: true }), onReplaced });
    await userEvent.click(screen.getByRole("button", { name: "failing" }));
    await waitFor(() => expect(document.title).toBe("import-failed"));
    expect(onReplaced).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "complete" }));
    await waitFor(async () =>
      expect((await store.loadActive())?.state.progress.completedLessons).toContain("t.l1"),
    );
  });
});

describe("the parent's settings in the app", () => {
  test("code runs with the time limit and questions start in the default question language", async () => {
    const state = initialGameState(TODAY);
    state.settings.runSeconds = 5;
    state.settings.questionLang = "both";
    const runner = fakeRunner(() => okResult(""));
    function Probe() {
      const { run } = useRunner();
      const { questionLang } = useLang();
      return (
        <>
          <p>{questionLang}</p>
          <button onClick={() => void run("x", "")}>run</button>
        </>
      );
    }
    await renderWithGame(<Probe />, { state, runner });
    expect(await screen.findByText("both")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "run" }));
    expect(runner.calls.at(-1)).toMatchObject({ code: "x", timeoutMs: 5000 });
  });
});
