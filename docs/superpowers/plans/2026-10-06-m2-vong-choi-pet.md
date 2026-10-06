# M2 – Vòng chơi pet: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Biến bản M1 thành vòng chơi có trí nhớ: con tạo hồ sơ một lần, học bài để nhận XP và xu, chăm robot qua chỉ số Pin và Vui, giữ chuỗi ngày học, xem Phòng robot và Bản đồ học, và mọi tiến độ được lưu trong IndexedDB, sao lưu và khôi phục được bằng file `.pypet`.

**Architecture:** Luật chơi là hàm thuần `apply(state, event, now)` trong `src/game/`, không phụ thuộc React hay trình duyệt. Lưu trữ đứng sau interface `GameStore` có 2 bản cài đặt: `DexieStore` (IndexedDB qua Dexie 4) và `MemoryStore` (dự phòng khi trình duyệt chặn lưu, và dùng cho test). `GameProvider` giữ trạng thái trong React, gọi `apply` cho mỗi sự kiện rồi xếp hàng ghi xuống store. Các màn hình mới (chào hỏi, Phòng robot, Bản đồ học, kết quả bài học, Sao lưu) chỉ đọc `useGame()`.

**Tech Stack:** Dự án M1 (React 19, TypeScript 5.9.3, Vite 8, Vitest 5, Playwright 1.63, Pyodide 314) + Dexie 4.4.6 (IndexedDB) + fake-indexeddb 6.2.5 (chỉ dùng cho test) + WebCrypto (PBKDF2, SHA-256) + Web Locks API.

**Spec:** `docs/superpowers/specs/2026-10-06-py-pet-design.md`

## Global Constraints

- Phạm vi M2 theo spec mục 12.3: state game, Phòng robot, Bản đồ học, màn hình kết quả, lưu trữ, xuất/nhập, màn hình chào hỏi. Thêm các mục M1 dời sang M2: lưu nháp code (spec 4.5), ghi nhật ký lỗi lạ (spec 4.3, 10), chặn mở 2 tab bằng Web Locks (spec 10), nút xuất file trên màn hình lỗi (spec 10).
- Ngoài phạm vi M2 (đừng làm): trạm ôn, điểm thành thạo, hộp Leitner, kiểm tra chủ đề, kiểm tra tiến hóa và tiến hóa (M3); cửa hàng, phụ kiện thưởng chuỗi, khu phụ huynh, chế độ nghỉ, đặt lại PIN, đo thời gian học, lịch sử giao dịch xu (M4); hình robot 4 dạng (M6). `pet.stage` luôn là 1 trong M2.
- Mọi luật chơi là hàm thuần nhận `now: Date` từ ngoài. `GameState` chỉ chứa dữ liệu JSON (không `Set`, `Map`, `Date`). Ngày học tính theo giờ địa phương, dạng `YYYY-MM-DD`.
- Con số thưởng (spec 5.4, 5.5, phần thuộc M2): hoàn thành bài học 10 XP; bài code đúng ngay lần đầu 15 XP, đúng sau vài lần 10 XP, đúng sau khi xem lời giải 3 XP; câu trắc nghiệm hoặc đoán đầu ra đúng 3 XP; bài code đúng ở lần nộp đầu 5 xu, thêm 3 xu nếu không mở gợi ý; đúng sau ít nhất 3 lần sai thêm 5 xu; chuỗi 3 / 7 / 14 / 30 ngày được 20 / 50 / 100 / 250 xu; đạt kế hoạch tuần 50 xu, vượt từ 130% được 100 xu. Làm lại bài đã xong không nhận lại XP, xu hay điểm hoạt động.
- Pin và Vui (spec 5.6): mỗi chỉ số từ 0 đến 5, bắt đầu ở 4. Hoàn thành bài học Pin +1. 3 lần đúng liên tiếp (bài code đúng ngay lần đầu, hoặc câu hỏi trả lời đúng lần đầu) Vui +1. Ngày vắng đầu tiên được miễn; từ ngày thứ 2, mỗi ngày Pin −1 và Vui −1; thấp nhất là 0. Trạng thái hiển thị: Hết pin (có chỉ số bằng 0), Buồn ngủ (có chỉ số ≤ 2), Vui vẻ (cả 2 ≥ 4), còn lại Bình thường.
- Chuỗi ngày (spec 5.8): 1 ngày "đạt" khi có từ 2 điểm hoạt động; mỗi bài học hoàn thành lần đầu được 1 điểm. Lỡ ngày thì tự dùng thẻ giữ chuỗi, mỗi ngày lỡ tốn 1 thẻ; không đủ thẻ thì chuỗi về 1 ở ngày đạt tiếp theo. Mỗi 7 ngày liên tục được 1 thẻ, giữ tối đa 2 thẻ. Kế hoạch tuần mặc định 10 bài, tuần tính từ thứ 2.
- Đồng hồ máy bị lùi (spec 5.14): không trừ Pin/Vui, không tính điểm chuỗi hay kế hoạch tuần, không đổi ngày hoạt động cuối; ghi 1 cảnh báo mỗi ngày.
- Lưu trữ (spec 6.1): IndexedDB tên `py-pet`, các bảng `meta`, `profiles`, `states`, `attempts`, `drafts`. Mỗi sự kiện ghi state và bản ghi lịch sử trong cùng 1 giao dịch. Giữ 10 lượt làm gần nhất mỗi bài. Nhật ký lỗi giữ 50 mục. Giữ 3 bản sao lưu tự động. Nhắc sao lưu khi đã từ 7 ngày chưa sao lưu (tính từ lúc tạo hồ sơ nếu chưa sao lưu lần nào).
- PIN (spec 6.3): 4 đến 6 chữ số, lưu dạng PBKDF2-SHA-256 có muối 16 byte, mặc định 100 000 vòng.
- File sao lưu (spec 6.4, 6.5): tên `py-pet-<ten-con>-YYYY-MM-DD.pypet` (tên con bỏ dấu, chữ thường, nối bằng `-`); nội dung là base64 của JSON `{ format: "py-pet-backup", schemaVersion, appVersion, exportedAt, meta, profiles, checksum }`; `checksum` = SHA-256 (hex) của JSON phần còn lại nối với 1 chuỗi bí mật cố định. Nhập file bắt buộc PIN, từ chối file từ phiên bản mới hơn, cảnh báo khi checksum sai, hiện bản xem trước, tự sao lưu dữ liệu hiện tại trước khi ghi đè.
- Mọi chuỗi giao diện đi qua `t(key)` với 2 bộ `vi`/`en` cùng khóa và cùng placeholder.
- Không gọi mạng. Không thêm thư viện ngoài Dexie và fake-indexeddb.
- Mọi commit message kết thúc bằng 2 dòng trailer, đúng như các lệnh commit trong kế hoạch:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  ```

## Review Focus

1. Mở app ở tab thứ 2: tab đó không được ghi dữ liệu, chỉ báo "đang mở ở tab khác". Test: Task 6 (`a second request does not get the lock`), Task 9 (`shows the other-tab message when the tab does not own the lock`).
2. Con để app mở qua nửa đêm, hoặc quay lại sau nhiều ngày: Pin/Vui phải giảm đúng số ngày và không bị trừ 2 lần khi app chạy rollover nhiều lần. Test: Task 2 (`rollover is idempotent within a day`), Task 7 (`runs a day rollover when the page becomes visible again`).
3. Đồng hồ máy bị chỉnh lùi: không cộng chuỗi, không trừ chỉ số, có cảnh báo. Test: Task 2 (`clock rollback skips streak and decay and logs one warning per day`).
4. Trình duyệt chặn IndexedDB (chế độ ẩn danh) hoặc ghi thất bại (hết dung lượng): app vẫn học được, có banner đỏ và lối xuất file. Test: Task 6 (`falls back to MemoryStore when opening fails`), Task 7 (`marks writeFailed after a save fails twice`), Task 9 (`shows the storage banners`).
5. Nhập file rác, file bị sửa tay, file từ bản mới hơn, hoặc PIN sai: không bao giờ ghi đè dữ liệu khi chưa xác nhận, và luôn giữ bản sao lưu tự động. Test: Task 5 (`rejects garbage`, `flags a tampered file`, `refuses a newer schema`), Task 13 (`wrong PIN keeps the file picker hidden`, `import keeps an automatic backup and replaces the data`).

---

## File Structure

```
src/game/
  dates.ts          localDay, addDays, daysBetween, weekStart
  state.ts          GameState, GameSettings, initialGameState, hằng số
  rewards.ts        Bảng thưởng XP/xu/chuỗi/kế hoạch tuần
  apply.ts          GameEvent, apply(state, event, now)
  progress.ts       Trạng thái bài học, bài tiếp theo, XP tối đa giai đoạn, kích cỡ, tình trạng pet, chuỗi hiển thị
src/storage/
  types.ts          StoredProfile, AttemptRecord, AppMeta, GameStore, LoadedGame, hằng số
  memoryStore.ts    MemoryStore
  dexieStore.ts     DexieStore (IndexedDB)
  encoding.ts       base64, UTF-8, SHA-256
  pin.ts            hashPin, verifyPin
  backup.ts         Đóng gói, mã hóa, giải mã, migration, xem trước, tên file
  bootstrap.ts      openGameStore, acquireTabLock, requestPersistence
  fixtures/backup-v1.pypet   File mẫu schema 1 (sinh bằng tools/make_backup_fixture.ts)
src/ui/
  GameProvider.tsx  Context game: state, dispatch, nháp, nhật ký lỗi, sao lưu
  GameRoot.tsx      Đọc hồ sơ: đang mở / chào hỏi / vào app
  OnboardingScreen.tsx, RoomScreen.tsx, MapScreen.tsx, ResultView.tsx, BackupScreen.tsx
  Banners.tsx, SecondTabScreen.tsx, download.ts
  (sửa) App.tsx, AppRoutes.tsx, LessonScreen.tsx, CodeExerciseView.tsx, QuestionCard.tsx,
        Robot.tsx, ErrorBoundary.tsx, contexts.tsx, useExplain.ts, routing.ts, main.tsx, styles.css
  (xóa) HomeScreen.tsx
src/test/
  renderGame.tsx    renderWithGame, FIXED_NOW, TODAY, testProfile
  backupSample.ts   sampleBackupPayload
tools/make_backup_fixture.ts
```

---

### Task 1: Ngày, trạng thái game và bảng thưởng

**Files:**
- Create: `src/game/dates.ts`, `src/game/state.ts`, `src/game/rewards.ts`
- Test: `src/game/dates.test.ts`

**Interfaces:**
- Consumes: `Lang` từ `src/i18n/lang.ts`.
- Produces:
  - `localDay(date: Date): string`, `addDays(day: string, n: number): string`, `daysBetween(from: string, to: string): number`, `weekStart(day: string): string` (thứ 2 của tuần).
  - `interface GameSettings { dailyGoal: number; weeklyTarget: number; graceDays: number; uiLang: Lang }`
  - `interface GameState` (định nghĩa đầy đủ ở Step 3), `GAME_STATE_VERSION = 1`, `STAT_MAX = 5`, `STAT_START = 4`, `WARNING_LIMIT = 20`, `DEFAULT_SETTINGS`, `initialGameState(today: string): GameState`.
  - `XP`, `XU`, `PERSISTENCE_FAILS`, `STREAK_MILESTONES`, `FREEZE_EVERY`, `MAX_FREEZES`, `WEEK_EXCEED_RATIO`, `POINTS`, `CORRECT_RUN_FOR_VUI`.

- [ ] **Step 1: Viết test thất bại**

`src/game/dates.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { addDays, daysBetween, localDay, weekStart } from "./dates";
import { initialGameState } from "./state";

describe("dates", () => {
  test("localDay uses the local calendar", () => {
    expect(localDay(new Date(2026, 9, 6, 23, 59))).toBe("2026-10-06");
    expect(localDay(new Date(2026, 0, 1, 0, 0))).toBe("2026-01-01");
  });

  test("addDays crosses months and years", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-10-06", -6)).toBe("2026-09-30");
  });

  test("daysBetween counts calendar days", () => {
    expect(daysBetween("2026-10-06", "2026-10-06")).toBe(0);
    expect(daysBetween("2026-10-05", "2026-10-08")).toBe(3);
    expect(daysBetween("2026-10-08", "2026-10-05")).toBe(-3);
    expect(daysBetween("2026-12-31", "2027-01-01")).toBe(1);
  });

  test("weekStart returns the Monday", () => {
    expect(weekStart("2026-10-05")).toBe("2026-10-05");
    expect(weekStart("2026-10-06")).toBe("2026-10-05");
    expect(weekStart("2026-10-11")).toBe("2026-10-05");
    expect(weekStart("2026-10-12")).toBe("2026-10-12");
  });
});

describe("initialGameState", () => {
  test("starts with full defaults", () => {
    expect(initialGameState("2026-10-06")).toEqual({
      version: 1,
      pet: { stage: 1, xp: 0, pin: 4, vui: 4, correctRun: 0 },
      wallet: { xu: 0 },
      activity: { lastActiveDay: null, decayApplied: 0 },
      streak: { current: 0, best: 0, freezes: 0, lastAchievedDay: null, pointsDay: null, points: 0 },
      week: { start: "2026-10-05", lessonsDone: 0 },
      settings: { dailyGoal: 2, weeklyTarget: 10, graceDays: 1, uiLang: "vi" },
      progress: { completedLessons: [], solvedExercises: [], answeredQuestions: [] },
      warnings: [],
    });
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/game/dates.test.ts`
Expected: FAIL vì chưa có `./dates`, `./state`.

- [ ] **Step 3: Viết code**

`src/game/dates.ts`:

```ts
const DAY_MS = 86_400_000;

/** The local calendar day of a moment, as YYYY-MM-DD. */
export function localDay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toUtcMs(day: string): number {
  const [year, month, date] = day.split("-").map(Number);
  return Date.UTC(year as number, (month as number) - 1, date as number);
}

export function addDays(day: string, n: number): string {
  return new Date(toUtcMs(day) + n * DAY_MS).toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / DAY_MS);
}

/** The Monday of the week that contains `day`. */
export function weekStart(day: string): string {
  const weekday = new Date(toUtcMs(day)).getUTCDay();
  return addDays(day, -((weekday + 6) % 7));
}
```

`src/game/state.ts`:

```ts
import type { Lang } from "../i18n/lang";
import { weekStart } from "./dates";

export const GAME_STATE_VERSION = 1;
export const STAT_MAX = 5;
export const STAT_START = 4;
export const WARNING_LIMIT = 20;

export interface GameSettings {
  dailyGoal: number;
  weeklyTarget: number;
  graceDays: number;
  uiLang: Lang;
}

export interface GameState {
  version: number;
  pet: { stage: number; xp: number; pin: number; vui: number; correctRun: number };
  wallet: { xu: number };
  activity: { lastActiveDay: string | null; decayApplied: number };
  streak: {
    current: number;
    best: number;
    freezes: number;
    lastAchievedDay: string | null;
    pointsDay: string | null;
    points: number;
  };
  week: { start: string; lessonsDone: number };
  settings: GameSettings;
  progress: { completedLessons: string[]; solvedExercises: string[]; answeredQuestions: string[] };
  warnings: { at: string; kind: "clock-rollback" }[];
}

export const DEFAULT_SETTINGS: GameSettings = { dailyGoal: 2, weeklyTarget: 10, graceDays: 1, uiLang: "vi" };

export function initialGameState(today: string): GameState {
  return {
    version: GAME_STATE_VERSION,
    pet: { stage: 1, xp: 0, pin: STAT_START, vui: STAT_START, correctRun: 0 },
    wallet: { xu: 0 },
    activity: { lastActiveDay: null, decayApplied: 0 },
    streak: { current: 0, best: 0, freezes: 0, lastAchievedDay: null, pointsDay: null, points: 0 },
    week: { start: weekStart(today), lessonsDone: 0 },
    settings: { ...DEFAULT_SETTINGS },
    progress: { completedLessons: [], solvedExercises: [], answeredQuestions: [] },
    warnings: [],
  };
}
```

`src/game/rewards.ts`:

```ts
export const XP = { lesson: 10, codeFirstTry: 15, codeAfterRetries: 10, codeAfterSolution: 3, question: 3 } as const;

export const XU = {
  codeFirstSubmit: 5,
  noHintBonus: 3,
  persistenceBonus: 5,
  weekPlanMet: 50,
  weekPlanExceeded: 100,
} as const;

/** Failed submits before a correct one that earn the persistence bonus. */
export const PERSISTENCE_FAILS = 3;

/** Streak length -> bonus xu. */
export const STREAK_MILESTONES: Readonly<Record<number, number>> = { 3: 20, 7: 50, 14: 100, 30: 250 };

export const FREEZE_EVERY = 7;
export const MAX_FREEZES = 2;
export const WEEK_EXCEED_RATIO = 1.3;
export const POINTS = { lesson: 1 } as const;
export const CORRECT_RUN_FOR_VUI = 3;
```

- [ ] **Step 4: Chạy test, xác nhận thành công**

Run: `npx vitest run src/game && npm run typecheck`
Expected: PASS toàn bộ.

- [ ] **Step 5: Commit**

```bash
git add src/game
git commit -F - <<'EOF'
feat(game): add local-day helpers, game state shape and reward table

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 2: Luật chơi `apply`

**Files:**
- Create: `src/game/apply.ts`
- Test: `src/game/apply.test.ts`

**Interfaces:**
- Consumes: Task 1.
- Produces:
  - ```ts
    type GameEvent =
      | { type: "DayRollover" }
      | { type: "SettingsChanged"; patch: Partial<GameSettings> }
      | { type: "LessonCompleted"; lessonId: string }
      | { type: "ExerciseJudged"; exerciseId: string; accepted: boolean; failedSubmitsBefore: number; hintsUsed: number; viewedSolution: boolean }
      | { type: "QuestionAnswered"; questionId: string; correct: boolean };
    ```
  - `apply(state: GameState, event: GameEvent, now: Date): GameState` — không sửa `state` đầu vào. Mọi sự kiện chạy rollover trước (chốt tuần, trừ Pin/Vui). `LessonCompleted`, `ExerciseJudged`, `QuestionAnswered` là hoạt động: sau khi xử lý thì `activity.lastActiveDay = today`, `decayApplied = 0` (trừ khi đồng hồ bị lùi).

- [ ] **Step 1: Viết test thất bại**

`src/game/apply.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { apply, type GameEvent } from "./apply";
import { initialGameState, type GameState } from "./state";

const at = (day: string, hour = 10) => new Date(`${day}T${String(hour).padStart(2, "0")}:00:00`);

function run(state: GameState, steps: [string, GameEvent][]): GameState {
  return steps.reduce((s, [day, event]) => apply(s, event, at(day)), state);
}

const lesson = (lessonId: string): GameEvent => ({ type: "LessonCompleted", lessonId });
const solved = (exerciseId: string, extra: Partial<Extract<GameEvent, { type: "ExerciseJudged" }>> = {}): GameEvent => ({
  type: "ExerciseJudged",
  exerciseId,
  accepted: true,
  failedSubmitsBefore: 0,
  hintsUsed: 0,
  viewedSolution: false,
  ...extra,
});

describe("LessonCompleted", () => {
  test("rewards the first completion only", () => {
    const start = initialGameState("2026-10-06");
    const once = apply(start, lesson("a"), at("2026-10-06"));
    expect(once.pet.xp).toBe(10);
    expect(once.pet.pin).toBe(5);
    expect(once.progress.completedLessons).toEqual(["a"]);
    expect(once.week.lessonsDone).toBe(1);
    expect(once.streak).toMatchObject({ pointsDay: "2026-10-06", points: 1, current: 0 });
    expect(once.activity).toEqual({ lastActiveDay: "2026-10-06", decayApplied: 0 });
    const twice = apply(once, lesson("a"), at("2026-10-06", 11));
    expect(twice.pet.xp).toBe(10);
    expect(twice.week.lessonsDone).toBe(1);
    expect(twice.streak.points).toBe(1);
  });

  test("does not mutate the input state", () => {
    const start = initialGameState("2026-10-06");
    const before = JSON.stringify(start);
    apply(start, lesson("a"), at("2026-10-06"));
    expect(JSON.stringify(start)).toBe(before);
  });

  test("Pin never goes above 5", () => {
    const state = run(initialGameState("2026-10-06"), [
      ["2026-10-06", lesson("a")],
      ["2026-10-06", lesson("b")],
    ]);
    expect(state.pet.pin).toBe(5);
  });
});

describe("streak", () => {
  test("2 lessons in a day achieve the day", () => {
    const state = run(initialGameState("2026-10-06"), [
      ["2026-10-06", lesson("a")],
      ["2026-10-06", lesson("b")],
    ]);
    expect(state.streak).toMatchObject({ current: 1, best: 1, lastAchievedDay: "2026-10-06", points: 2 });
  });

  test("consecutive days grow the streak and a missed day without a saver resets it", () => {
    const state = run(initialGameState("2026-10-06"), [
      ["2026-10-06", lesson("a")],
      ["2026-10-06", lesson("b")],
      ["2026-10-07", lesson("c")],
      ["2026-10-07", lesson("d")],
    ]);
    expect(state.streak.current).toBe(2);
    const later = run(state, [
      ["2026-10-09", lesson("e")],
      ["2026-10-09", lesson("f")],
    ]);
    expect(later.streak).toMatchObject({ current: 1, best: 2 });
  });

  test("a streak saver covers a missed day", () => {
    const state = initialGameState("2026-10-06");
    state.settings.dailyGoal = 1;
    state.streak = { current: 5, best: 5, freezes: 1, lastAchievedDay: "2026-10-04", pointsDay: null, points: 0 };
    const next = apply(state, lesson("a"), at("2026-10-06"));
    expect(next.streak).toMatchObject({ current: 6, freezes: 0 });
  });

  test("milestones pay xu and every 7 days gives a saver up to 2", () => {
    const three = initialGameState("2026-10-06");
    three.settings.dailyGoal = 1;
    three.streak = { current: 2, best: 2, freezes: 0, lastAchievedDay: "2026-10-05", pointsDay: null, points: 0 };
    expect(apply(three, lesson("a"), at("2026-10-06")).wallet.xu).toBe(20);

    const seven = initialGameState("2026-10-06");
    seven.settings.dailyGoal = 1;
    seven.streak = { current: 6, best: 6, freezes: 0, lastAchievedDay: "2026-10-05", pointsDay: null, points: 0 };
    const afterSeven = apply(seven, lesson("a"), at("2026-10-06"));
    expect(afterSeven.wallet.xu).toBe(50);
    expect(afterSeven.streak.freezes).toBe(1);

    seven.streak.freezes = 2;
    expect(apply(seven, lesson("a"), at("2026-10-06")).streak.freezes).toBe(2);
  });
});

describe("ExerciseJudged", () => {
  test("first try without hints: 15 XP and 8 xu", () => {
    const next = apply(initialGameState("2026-10-06"), solved("x"), at("2026-10-06"));
    expect(next.pet.xp).toBe(15);
    expect(next.wallet.xu).toBe(8);
    expect(next.progress.solvedExercises).toEqual(["x"]);
  });

  test("first try with a hint: 5 xu", () => {
    expect(apply(initialGameState("2026-10-06"), solved("x", { hintsUsed: 1 }), at("2026-10-06")).wallet.xu).toBe(5);
  });

  test("after retries: 10 XP, persistence bonus from 3 failures", () => {
    const one = apply(initialGameState("2026-10-06"), solved("x", { failedSubmitsBefore: 1 }), at("2026-10-06"));
    expect(one.pet.xp).toBe(10);
    expect(one.wallet.xu).toBe(0);
    const three = apply(initialGameState("2026-10-06"), solved("x", { failedSubmitsBefore: 3 }), at("2026-10-06"));
    expect(three.wallet.xu).toBe(5);
  });

  test("after viewing the solution: 3 XP and no xu", () => {
    const next = apply(
      initialGameState("2026-10-06"),
      solved("x", { failedSubmitsBefore: 3, viewedSolution: true }),
      at("2026-10-06"),
    );
    expect(next.pet.xp).toBe(3);
    expect(next.wallet.xu).toBe(0);
  });

  test("a wrong submit gives nothing and a solved exercise pays only once", () => {
    const wrong = apply(initialGameState("2026-10-06"), solved("x", { accepted: false }), at("2026-10-06"));
    expect(wrong.pet.xp).toBe(0);
    expect(wrong.progress.solvedExercises).toEqual([]);
    const again = run(initialGameState("2026-10-06"), [
      ["2026-10-06", solved("x")],
      ["2026-10-06", solved("x")],
    ]);
    expect(again.pet.xp).toBe(15);
  });
});

describe("QuestionAnswered and Vui", () => {
  test("only a correct first answer pays 3 XP", () => {
    const state = run(initialGameState("2026-10-06"), [
      ["2026-10-06", { type: "QuestionAnswered", questionId: "q", correct: true }],
      ["2026-10-06", { type: "QuestionAnswered", questionId: "q", correct: true }],
      ["2026-10-06", { type: "QuestionAnswered", questionId: "r", correct: false }],
      ["2026-10-06", { type: "QuestionAnswered", questionId: "r", correct: true }],
    ]);
    expect(state.pet.xp).toBe(3);
    expect(state.progress.answeredQuestions).toEqual(["q", "r"]);
  });

  test("3 correct in a row raise Vui, a mistake resets the run", () => {
    const state = run(initialGameState("2026-10-06"), [
      ["2026-10-06", solved("x")],
      ["2026-10-06", solved("y")],
      ["2026-10-06", { type: "QuestionAnswered", questionId: "q", correct: true }],
    ]);
    expect(state.pet.vui).toBe(5);
    const broken = run(initialGameState("2026-10-06"), [
      ["2026-10-06", solved("x")],
      ["2026-10-06", solved("y", { accepted: false })],
      ["2026-10-06", solved("y", { failedSubmitsBefore: 1 })],
      ["2026-10-06", solved("z")],
    ]);
    expect(broken.pet.vui).toBe(4);
  });
});

describe("day rollover", () => {
  function activeOn(day: string): GameState {
    const state = initialGameState(day);
    state.activity.lastActiveDay = day;
    return state;
  }

  test("the first absent day is free, then 1 point per day", () => {
    const start = activeOn("2026-10-05");
    expect(apply(start, { type: "DayRollover" }, at("2026-10-07")).pet).toMatchObject({ pin: 4, vui: 4 });
    expect(apply(start, { type: "DayRollover" }, at("2026-10-08")).pet).toMatchObject({ pin: 3, vui: 3 });
  });

  test("rollover is idempotent within a day", () => {
    const once = apply(activeOn("2026-10-05"), { type: "DayRollover" }, at("2026-10-08", 9));
    const twice = apply(once, { type: "DayRollover" }, at("2026-10-08", 20));
    expect(twice.pet.pin).toBe(3);
    const later = apply(twice, { type: "DayRollover" }, at("2026-10-10"));
    expect(later.pet.pin).toBe(1);
  });

  test("stats never go below 0", () => {
    expect(apply(activeOn("2026-09-01"), { type: "DayRollover" }, at("2026-10-06")).pet).toMatchObject({ pin: 0, vui: 0 });
  });

  test("activity after an absence applies the decay, then rewards and resets the counter", () => {
    const next = apply(activeOn("2026-10-01"), lesson("a"), at("2026-10-06"));
    expect(next.pet.pin).toBe(2);
    expect(next.pet.vui).toBe(1);
    expect(next.activity).toEqual({ lastActiveDay: "2026-10-06", decayApplied: 0 });
  });

  test("a new week pays the weekly plan bonus and resets the count", () => {
    const met = initialGameState("2026-09-30");
    met.week.lessonsDone = 10;
    const afterMet = apply(met, { type: "DayRollover" }, at("2026-10-06"));
    expect(afterMet.wallet.xu).toBe(50);
    expect(afterMet.week).toEqual({ start: "2026-10-05", lessonsDone: 0 });

    const exceeded = initialGameState("2026-09-30");
    exceeded.week.lessonsDone = 13;
    expect(apply(exceeded, { type: "DayRollover" }, at("2026-10-06")).wallet.xu).toBe(100);

    const missed = initialGameState("2026-09-30");
    missed.week.lessonsDone = 9;
    expect(apply(missed, { type: "DayRollover" }, at("2026-10-06")).wallet.xu).toBe(0);
  });

  test("clock rollback skips streak and decay and logs one warning per day", () => {
    const start = activeOn("2026-10-08");
    start.streak.points = 1;
    start.streak.pointsDay = "2026-10-08";
    const first = apply(start, lesson("a"), at("2026-10-06", 9));
    expect(first.pet.xp).toBe(10);
    expect(first.week.lessonsDone).toBe(0);
    expect(first.streak).toMatchObject({ points: 1, pointsDay: "2026-10-08", current: 0 });
    expect(first.activity.lastActiveDay).toBe("2026-10-08");
    expect(first.warnings).toHaveLength(1);
    expect(first.warnings[0]).toMatchObject({ kind: "clock-rollback" });
    const second = apply(first, { type: "DayRollover" }, at("2026-10-06", 15));
    expect(second.warnings).toHaveLength(1);
    expect(second.pet.pin).toBe(5);
  });
});

describe("SettingsChanged", () => {
  test("updates settings without counting as activity", () => {
    const next = apply(initialGameState("2026-10-06"), { type: "SettingsChanged", patch: { uiLang: "en" } }, at("2026-10-06"));
    expect(next.settings.uiLang).toBe("en");
    expect(next.activity.lastActiveDay).toBeNull();
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/game/apply.test.ts`
Expected: FAIL vì chưa có `./apply`.

- [ ] **Step 3: Viết `src/game/apply.ts`**

```ts
import { daysBetween, localDay, weekStart } from "./dates";
import {
  CORRECT_RUN_FOR_VUI,
  FREEZE_EVERY,
  MAX_FREEZES,
  PERSISTENCE_FAILS,
  POINTS,
  STREAK_MILESTONES,
  WEEK_EXCEED_RATIO,
  XP,
  XU,
} from "./rewards";
import { STAT_MAX, WARNING_LIMIT, type GameSettings, type GameState } from "./state";

export type GameEvent =
  | { type: "DayRollover" }
  | { type: "SettingsChanged"; patch: Partial<GameSettings> }
  | { type: "LessonCompleted"; lessonId: string }
  | {
      type: "ExerciseJudged";
      exerciseId: string;
      accepted: boolean;
      failedSubmitsBefore: number;
      hintsUsed: number;
      viewedSolution: boolean;
    }
  | { type: "QuestionAnswered"; questionId: string; correct: boolean };

const ACTIVITY_EVENTS: ReadonlySet<GameEvent["type"]> = new Set([
  "LessonCompleted",
  "ExerciseJudged",
  "QuestionAnswered",
]);

export function apply(state: GameState, event: GameEvent, now: Date): GameState {
  const next = JSON.parse(JSON.stringify(state)) as GameState;
  const today = localDay(now);
  const lastActive = next.activity.lastActiveDay;
  const rollback = lastActive !== null && today < lastActive;

  if (rollback) recordRollback(next, now, today);
  else rollover(next, today);

  switch (event.type) {
    case "DayRollover":
      break;
    case "SettingsChanged":
      next.settings = { ...next.settings, ...event.patch };
      break;
    case "LessonCompleted":
      completeLesson(next, event.lessonId, today, rollback);
      break;
    case "ExerciseJudged":
      judgeExercise(next, event);
      break;
    case "QuestionAnswered":
      answerQuestion(next, event);
      break;
  }

  if (ACTIVITY_EVENTS.has(event.type) && !rollback) {
    next.activity.lastActiveDay = today;
    next.activity.decayApplied = 0;
  }
  return next;
}

function recordRollback(s: GameState, now: Date, today: string): void {
  const last = s.warnings[s.warnings.length - 1];
  if (last && localDay(new Date(last.at)) === today) return;
  s.warnings = [...s.warnings, { at: now.toISOString(), kind: "clock-rollback" as const }].slice(-WARNING_LIMIT);
}

function rollover(s: GameState, today: string): void {
  settleWeek(s, today);
  const lastActive = s.activity.lastActiveDay;
  if (lastActive === null) return;
  const absentDays = daysBetween(lastActive, today) - 1;
  const due = Math.max(0, absentDays - s.settings.graceDays);
  const delta = due - s.activity.decayApplied;
  if (delta <= 0) return;
  s.pet.pin = Math.max(0, s.pet.pin - delta);
  s.pet.vui = Math.max(0, s.pet.vui - delta);
  s.activity.decayApplied = due;
}

function settleWeek(s: GameState, today: string): void {
  const current = weekStart(today);
  if (s.week.start >= current) return;
  const target = s.settings.weeklyTarget;
  if (target > 0 && s.week.lessonsDone >= target * WEEK_EXCEED_RATIO) s.wallet.xu += XU.weekPlanExceeded;
  else if (target > 0 && s.week.lessonsDone >= target) s.wallet.xu += XU.weekPlanMet;
  s.week = { start: current, lessonsDone: 0 };
}

function completeLesson(s: GameState, lessonId: string, today: string, rollback: boolean): void {
  if (s.progress.completedLessons.includes(lessonId)) return;
  s.progress.completedLessons.push(lessonId);
  s.pet.xp += XP.lesson;
  s.pet.pin = Math.min(STAT_MAX, s.pet.pin + 1);
  if (rollback) return;
  s.week.lessonsDone += 1;
  addPoints(s, POINTS.lesson, today);
}

function addPoints(s: GameState, points: number, today: string): void {
  if (s.streak.pointsDay !== today) {
    s.streak.pointsDay = today;
    s.streak.points = 0;
  }
  const before = s.streak.points;
  s.streak.points += points;
  if (before < s.settings.dailyGoal && s.streak.points >= s.settings.dailyGoal) achieveDay(s, today);
}

function achieveDay(s: GameState, today: string): void {
  const last = s.streak.lastAchievedDay;
  if (last === null) {
    s.streak.current = 1;
  } else {
    const missed = daysBetween(last, today) - 1;
    if (missed <= 0) {
      s.streak.current += 1;
    } else if (s.streak.freezes >= missed) {
      s.streak.freezes -= missed;
      s.streak.current += 1;
    } else {
      s.streak.current = 1;
    }
  }
  s.streak.lastAchievedDay = today;
  s.streak.best = Math.max(s.streak.best, s.streak.current);
  const bonus = STREAK_MILESTONES[s.streak.current];
  if (bonus) s.wallet.xu += bonus;
  if (s.streak.current % FREEZE_EVERY === 0) s.streak.freezes = Math.min(MAX_FREEZES, s.streak.freezes + 1);
}

function bumpCorrectRun(s: GameState): void {
  s.pet.correctRun += 1;
  if (s.pet.correctRun % CORRECT_RUN_FOR_VUI === 0) s.pet.vui = Math.min(STAT_MAX, s.pet.vui + 1);
}

function judgeExercise(s: GameState, e: Extract<GameEvent, { type: "ExerciseJudged" }>): void {
  if (!e.accepted) {
    s.pet.correctRun = 0;
    return;
  }
  if (s.progress.solvedExercises.includes(e.exerciseId)) return;
  s.progress.solvedExercises.push(e.exerciseId);
  if (e.viewedSolution) {
    s.pet.xp += XP.codeAfterSolution;
    s.pet.correctRun = 0;
    return;
  }
  if (e.failedSubmitsBefore === 0) {
    s.pet.xp += XP.codeFirstTry;
    s.wallet.xu += XU.codeFirstSubmit + (e.hintsUsed === 0 ? XU.noHintBonus : 0);
    bumpCorrectRun(s);
    return;
  }
  s.pet.xp += XP.codeAfterRetries;
  if (e.failedSubmitsBefore >= PERSISTENCE_FAILS) s.wallet.xu += XU.persistenceBonus;
  s.pet.correctRun = 0;
}

function answerQuestion(s: GameState, e: Extract<GameEvent, { type: "QuestionAnswered" }>): void {
  const first = !s.progress.answeredQuestions.includes(e.questionId);
  if (first) s.progress.answeredQuestions.push(e.questionId);
  if (!e.correct) {
    s.pet.correctRun = 0;
    return;
  }
  if (!first) return;
  s.pet.xp += XP.question;
  bumpCorrectRun(s);
}
```

- [ ] **Step 4: Chạy test, xác nhận thành công**

Run: `npx vitest run src/game && npm run typecheck`
Expected: PASS toàn bộ. Nếu 1 test về con số sai, đối chiếu với Global Constraints trước khi sửa: sửa code nếu code sai so với bảng thưởng, không sửa con số trong test.

- [ ] **Step 5: Commit**

```bash
git add src/game/apply.ts src/game/apply.test.ts
git commit -F - <<'EOF'
feat(game): apply events for XP, xu, Pin/Vui decay, streaks and weekly plan

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 3: Tiến độ và các giá trị hiển thị

**Files:**
- Create: `src/game/progress.ts`
- Test: `src/game/progress.test.ts`

**Interfaces:**
- Consumes: `allLessons` (`src/content/lookup.ts`), `ContentBundle`, `Stage` (`src/content/types.ts`), Task 1.
- Produces: `type LessonStatus = "done" | "next" | "locked"`, `type PetCondition = "happy" | "normal" | "sleepy" | "drained"`, `type GrowthSize = 1 | 2 | 3`, `lessonStatuses(bundle, state): Map<string, LessonStatus>`, `nextLessonId(bundle, state): string | null`, `currentStage(bundle, state): Stage | null`, `stageXpMax(stage): number`, `growthPercent(xp, max): number`, `growthSize(xp, max): GrowthSize`, `petCondition(state): PetCondition`, `displayStreak(state, today): number`, `todayPoints(state, today): number`, `weekLessons(state, today): number`.

- [ ] **Step 1: Viết test thất bại**

`src/game/progress.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { testBundle } from "../test/fixtures";
import {
  currentStage,
  displayStreak,
  growthPercent,
  growthSize,
  lessonStatuses,
  nextLessonId,
  petCondition,
  stageXpMax,
  todayPoints,
  weekLessons,
} from "./progress";
import { initialGameState } from "./state";

const bundle = testBundle();

describe("lessons", () => {
  test("the first unfinished lesson is next, the rest are locked", () => {
    const state = initialGameState("2026-10-06");
    expect([...lessonStatuses(bundle, state)]).toEqual([
      ["t.l1", "next"],
      ["t.l2", "locked"],
    ]);
    expect(nextLessonId(bundle, state)).toBe("t.l1");
    state.progress.completedLessons = ["t.l1"];
    expect([...lessonStatuses(bundle, state)]).toEqual([
      ["t.l1", "done"],
      ["t.l2", "next"],
    ]);
    state.progress.completedLessons = ["t.l1", "t.l2"];
    expect(nextLessonId(bundle, state)).toBeNull();
  });

  test("currentStage follows pet.stage", () => {
    expect(currentStage(bundle, initialGameState("2026-10-06"))?.id).toBe("t");
  });
});

describe("growth", () => {
  test("stageXpMax sums lesson, code and question XP", () => {
    expect(stageXpMax(bundle.stages[0]!)).toBe(38);
  });

  test("growthSize splits the stage into thirds", () => {
    expect(growthSize(0, 38)).toBe(1);
    expect(growthSize(12, 38)).toBe(1);
    expect(growthSize(13, 38)).toBe(2);
    expect(growthSize(26, 38)).toBe(3);
    expect(growthSize(5, 0)).toBe(1);
  });

  test("growthPercent is capped at 100", () => {
    expect(growthPercent(19, 38)).toBe(50);
    expect(growthPercent(50, 38)).toBe(100);
    expect(growthPercent(5, 0)).toBe(0);
  });
});

describe("pet condition", () => {
  test.each([
    [4, 4, "happy"],
    [3, 4, "normal"],
    [2, 5, "sleepy"],
    [0, 5, "drained"],
    [5, 0, "drained"],
  ] as const)("pin %i, vui %i -> %s", (pin, vui, expected) => {
    const state = initialGameState("2026-10-06");
    state.pet.pin = pin;
    state.pet.vui = vui;
    expect(petCondition(state)).toBe(expected);
  });
});

describe("streak and goals for display", () => {
  test("displayStreak keeps the streak while savers cover the gap", () => {
    const state = initialGameState("2026-10-06");
    expect(displayStreak(state, "2026-10-06")).toBe(0);
    state.streak = { current: 4, best: 4, freezes: 0, lastAchievedDay: "2026-10-05", pointsDay: null, points: 0 };
    expect(displayStreak(state, "2026-10-06")).toBe(4);
    expect(displayStreak(state, "2026-10-07")).toBe(0);
    state.streak.freezes = 1;
    expect(displayStreak(state, "2026-10-07")).toBe(4);
  });

  test("todayPoints and weekLessons reset on a new day or week", () => {
    const state = initialGameState("2026-10-06");
    state.streak.pointsDay = "2026-10-06";
    state.streak.points = 1;
    state.week.lessonsDone = 3;
    expect(todayPoints(state, "2026-10-06")).toBe(1);
    expect(todayPoints(state, "2026-10-07")).toBe(0);
    expect(weekLessons(state, "2026-10-11")).toBe(3);
    expect(weekLessons(state, "2026-10-12")).toBe(0);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/game/progress.test.ts`
Expected: FAIL vì chưa có `./progress`.

- [ ] **Step 3: Viết `src/game/progress.ts`**

```ts
import { allLessons } from "../content/lookup";
import type { ContentBundle, Stage } from "../content/types";
import { daysBetween, weekStart } from "./dates";
import { XP } from "./rewards";
import type { GameState } from "./state";

export type LessonStatus = "done" | "next" | "locked";
export type PetCondition = "happy" | "normal" | "sleepy" | "drained";
export type GrowthSize = 1 | 2 | 3;

export function lessonStatuses(bundle: ContentBundle, state: GameState): Map<string, LessonStatus> {
  const done = new Set(state.progress.completedLessons);
  const statuses = new Map<string, LessonStatus>();
  let nextGiven = false;
  for (const lesson of allLessons(bundle)) {
    if (done.has(lesson.id)) {
      statuses.set(lesson.id, "done");
    } else if (!nextGiven) {
      statuses.set(lesson.id, "next");
      nextGiven = true;
    } else {
      statuses.set(lesson.id, "locked");
    }
  }
  return statuses;
}

export function nextLessonId(bundle: ContentBundle, state: GameState): string | null {
  const done = new Set(state.progress.completedLessons);
  return allLessons(bundle).find((lesson) => !done.has(lesson.id))?.id ?? null;
}

export function currentStage(bundle: ContentBundle, state: GameState): Stage | null {
  return bundle.stages[state.pet.stage - 1] ?? bundle.stages[bundle.stages.length - 1] ?? null;
}

/** The XP a child can earn in a stage from lessons and their exercises. */
export function stageXpMax(stage: Stage): number {
  return stage.topics
    .flatMap((topic) => topic.lessons)
    .reduce(
      (sum, lesson) =>
        sum +
        XP.lesson +
        lesson.exercises.reduce((part, exercise) => part + (exercise.type === "code" ? XP.codeFirstTry : XP.question), 0),
      0,
    );
}

export function growthPercent(xp: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(100, Math.round((xp / max) * 100));
}

export function growthSize(xp: number, max: number): GrowthSize {
  const ratio = max > 0 ? xp / max : 0;
  if (ratio >= 2 / 3) return 3;
  if (ratio >= 1 / 3) return 2;
  return 1;
}

export function petCondition(state: GameState): PetCondition {
  const { pin, vui } = state.pet;
  if (pin === 0 || vui === 0) return "drained";
  if (pin <= 2 || vui <= 2) return "sleepy";
  if (pin >= 4 && vui >= 4) return "happy";
  return "normal";
}

/** The streak to show today: 0 once the missed days exceed the savers. */
export function displayStreak(state: GameState, today: string): number {
  const { current, freezes, lastAchievedDay } = state.streak;
  if (lastAchievedDay === null) return 0;
  const missed = daysBetween(lastAchievedDay, today) - 1;
  if (missed <= 0) return current;
  return freezes >= missed ? current : 0;
}

export function todayPoints(state: GameState, today: string): number {
  return state.streak.pointsDay === today ? state.streak.points : 0;
}

export function weekLessons(state: GameState, today: string): number {
  return state.week.start === weekStart(today) ? state.week.lessonsDone : 0;
}
```

- [ ] **Step 4: Chạy test, xác nhận thành công**

Run: `npx vitest run src/game && npm run typecheck`
Expected: PASS toàn bộ.

- [ ] **Step 5: Commit**

```bash
git add src/game/progress.ts src/game/progress.test.ts
git commit -F - <<'EOF'
feat(game): derive lesson status, growth, pet condition and display streak

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 4: Kho lưu trữ (MemoryStore và DexieStore)

**Files:**
- Create: `src/storage/types.ts`, `src/storage/memoryStore.ts`, `src/storage/dexieStore.ts`
- Modify: `package.json` (thêm `dexie`, `fake-indexeddb`)
- Test: `src/storage/store.test.ts`

**Interfaces:**
- Consumes: `GameState` (Task 1), `JudgeStatus` (`src/runner/judge.ts`), `QuestionLang` (`src/i18n/lang.ts`).
- Produces (định nghĩa đầy đủ ở Step 3): `SCHEMA_VERSION = 1`, `ATTEMPTS_PER_ITEM = 10`, `ERROR_LOG_LIMIT = 50`, `AUTO_BACKUPS = 3`; `StoredProfile`, `CodeAttempt`, `ChoiceAttempt`, `AttemptRecord`, `DistributiveOmit`, `AttemptInput`, `DraftRecord`, `PinHash`, `ErrorLogEntry`, `AppMeta`, `ProfileBundle`, `LoadedGame`, `GameStore`; `emptyMeta()`, `appendErrorLog(log, entry)`; `class MemoryStore implements GameStore` (constructor `{ persistent?: boolean }`, mặc định `false`); `class DexieStore implements GameStore` với `static open(name = "py-pet", options?: DexieOptions): Promise<DexieStore>` và `close()`.

- [ ] **Step 1: Cài gói**

```bash
npm install dexie@4.4.6
npm install -D fake-indexeddb@6.2.5
```

- [ ] **Step 2: Viết test thất bại**

`src/storage/store.test.ts`:

```ts
import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import { describe, expect, test } from "vitest";
import { initialGameState } from "../game/state";
import { DexieStore } from "./dexieStore";
import { MemoryStore } from "./memoryStore";
import { emptyMeta, type AttemptRecord, type GameStore, type StoredProfile } from "./types";

const profile: StoredProfile = { id: "p1", childName: "An", robotName: "Robo", createdAt: "2026-10-06T02:00:00.000Z" };

function codeAttempt(itemId: string, n: number): AttemptRecord {
  return {
    kind: "code",
    profileId: "p1",
    itemId,
    at: `2026-10-06T02:00:${String(n).padStart(2, "0")}.000Z`,
    code: `print(${n})`,
    status: "wrong-answer",
    passedCount: 0,
    total: 1,
    misconceptions: [],
  };
}

let dbCounter = 0;
const stores: [string, () => Promise<GameStore>][] = [
  ["MemoryStore", async () => new MemoryStore()],
  ["DexieStore", () => DexieStore.open(`test-${(dbCounter += 1)}`, { indexedDB: new IDBFactory(), IDBKeyRange })],
];

describe.each(stores)("%s", (_name, makeStore) => {
  test("starts with empty meta and no active profile", async () => {
    const store = await makeStore();
    expect(await store.readMeta()).toEqual(emptyMeta());
    expect(await store.loadActive()).toBeNull();
  });

  test("createProfile makes the profile active and loadable", async () => {
    const store = await makeStore();
    const state = initialGameState("2026-10-06");
    await store.createProfile(profile, state);
    const loaded = await store.loadActive();
    expect(loaded?.profile).toEqual(profile);
    expect(loaded?.state).toEqual(state);
    expect(loaded?.drafts.size).toBe(0);
    expect(loaded?.meta.activeProfileId).toBe("p1");
  });

  test("saveState stores the state and keeps the 10 latest attempts per item", async () => {
    const store = await makeStore();
    await store.createProfile(profile, initialGameState("2026-10-06"));
    const state = initialGameState("2026-10-06");
    state.pet.xp = 25;
    for (let n = 0; n < 12; n += 1) await store.saveState("p1", state, codeAttempt("ex1", n));
    await store.saveState("p1", state, codeAttempt("ex2", 0));
    expect((await store.loadActive())?.state.pet.xp).toBe(25);
    const [bundle] = await store.exportProfiles();
    const ex1 = bundle!.attempts.filter((a) => a.itemId === "ex1");
    expect(ex1).toHaveLength(10);
    expect(ex1.map((a) => (a.kind === "code" ? a.code : ""))).toEqual(
      Array.from({ length: 10 }, (_, i) => `print(${i + 2})`),
    );
    expect(bundle!.attempts.filter((a) => a.itemId === "ex2")).toHaveLength(1);
  });

  test("drafts are saved per item and loaded with the profile", async () => {
    const store = await makeStore();
    await store.createProfile(profile, initialGameState("2026-10-06"));
    await store.saveDraft("p1", "ex1", "print(1)");
    await store.saveDraft("p1", "ex1", "print(2)");
    await store.saveDraft("p1", "ex2", "x = 1");
    const loaded = await store.loadActive();
    expect(Object.fromEntries(loaded!.drafts)).toEqual({ ex1: "print(2)", ex2: "x = 1" });
  });

  test("writeMeta merges and the error log keeps the 50 latest entries", async () => {
    const store = await makeStore();
    await store.writeMeta({ lastBackupAt: "2026-10-06T02:00:00.000Z" });
    for (let n = 0; n < 55; n += 1) {
      await store.appendErrorLog({ at: `2026-10-06T02:00:${String(n).padStart(2, "0")}.000Z`, kind: "ui-crash", detail: `e${n}` });
    }
    const meta = await store.readMeta();
    expect(meta.lastBackupAt).toBe("2026-10-06T02:00:00.000Z");
    expect(meta.errorLog).toHaveLength(50);
    expect(meta.errorLog[0]!.detail).toBe("e5");
  });

  test("exportProfiles and replaceAll round-trip into another store", async () => {
    const source = await makeStore();
    const state = initialGameState("2026-10-06");
    state.wallet.xu = 40;
    await source.createProfile(profile, state);
    await source.saveState("p1", state, codeAttempt("ex1", 1));
    await source.saveDraft("p1", "ex1", "print(1)");
    const target = await makeStore();
    await target.createProfile({ ...profile, id: "old", childName: "Cũ" }, initialGameState("2026-10-06"));
    await target.replaceAll({ ...emptyMeta(), activeProfileId: "p1" }, await source.exportProfiles());
    const loaded = await target.loadActive();
    expect(loaded?.profile.childName).toBe("An");
    expect(loaded?.state.wallet.xu).toBe(40);
    expect(Object.fromEntries(loaded!.drafts)).toEqual({ ex1: "print(1)" });
    const exported = await target.exportProfiles();
    expect(exported.map((p) => p.profile.id)).toEqual(["p1"]);
    expect(exported[0]!.attempts).toHaveLength(1);
  });
});

describe("persistence flags", () => {
  test("MemoryStore is not persistent unless asked", () => {
    expect(new MemoryStore().persistent).toBe(false);
    expect(new MemoryStore({ persistent: true }).persistent).toBe(true);
  });

  test("DexieStore keeps data after reopening the same database", async () => {
    const indexedDB = new IDBFactory();
    const first = await DexieStore.open("reopen", { indexedDB, IDBKeyRange });
    expect(first.persistent).toBe(true);
    await first.createProfile(profile, initialGameState("2026-10-06"));
    first.close();
    const second = await DexieStore.open("reopen", { indexedDB, IDBKeyRange });
    expect((await second.loadActive())?.profile.id).toBe("p1");
  });
});
```

- [ ] **Step 3: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/storage`
Expected: FAIL vì chưa có các module trong `src/storage`.

- [ ] **Step 4: Viết code**

`src/storage/types.ts`:

```ts
import type { GameState } from "../game/state";
import type { QuestionLang } from "../i18n/lang";
import type { JudgeStatus } from "../runner/judge";

export const SCHEMA_VERSION = 1;
export const ATTEMPTS_PER_ITEM = 10;
export const ERROR_LOG_LIMIT = 50;
export const AUTO_BACKUPS = 3;

export interface StoredProfile {
  id: string;
  childName: string;
  robotName: string;
  createdAt: string;
}

interface AttemptBase {
  id?: number;
  profileId: string;
  itemId: string;
  at: string;
}

export interface CodeAttempt extends AttemptBase {
  kind: "code";
  code: string;
  status: JudgeStatus;
  passedCount: number;
  total: number;
  misconceptions: string[];
}

export interface ChoiceAttempt extends AttemptBase {
  kind: "choice";
  choiceIndex: number;
  correct: boolean;
  lang: QuestionLang;
}

export type AttemptRecord = CodeAttempt | ChoiceAttempt;
export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
/** What the UI supplies; the provider adds id-less profileId and time. */
export type AttemptInput = DistributiveOmit<AttemptRecord, "id" | "profileId" | "at">;

export interface DraftRecord {
  profileId: string;
  itemId: string;
  code: string;
}

export interface PinHash {
  salt: string;
  hash: string;
  iterations: number;
}

export interface ErrorLogEntry {
  at: string;
  kind: "unknown-python-error" | "ui-crash";
  detail: string;
}

export interface AppMeta {
  schemaVersion: number;
  activeProfileId: string | null;
  pin: PinHash | null;
  lastBackupAt: string | null;
  errorLog: ErrorLogEntry[];
  autoBackups: string[];
}

export interface ProfileBundle {
  profile: StoredProfile;
  state: GameState;
  attempts: AttemptRecord[];
  drafts: DraftRecord[];
}

export interface LoadedGame {
  profile: StoredProfile;
  state: GameState;
  drafts: Map<string, string>;
  meta: AppMeta;
}

export interface GameStore {
  readonly persistent: boolean;
  readMeta(): Promise<AppMeta>;
  writeMeta(patch: Partial<AppMeta>): Promise<void>;
  appendErrorLog(entry: ErrorLogEntry): Promise<void>;
  loadActive(): Promise<LoadedGame | null>;
  createProfile(profile: StoredProfile, state: GameState): Promise<void>;
  saveState(profileId: string, state: GameState, attempt?: AttemptRecord): Promise<void>;
  saveDraft(profileId: string, itemId: string, code: string): Promise<void>;
  exportProfiles(): Promise<ProfileBundle[]>;
  replaceAll(meta: AppMeta, profiles: ProfileBundle[]): Promise<void>;
}

export function emptyMeta(): AppMeta {
  return { schemaVersion: SCHEMA_VERSION, activeProfileId: null, pin: null, lastBackupAt: null, errorLog: [], autoBackups: [] };
}

export function appendErrorLog(log: ErrorLogEntry[], entry: ErrorLogEntry): ErrorLogEntry[] {
  return [...log, entry].slice(-ERROR_LOG_LIMIT);
}
```

`src/storage/memoryStore.ts`:

```ts
import type { GameState } from "../game/state";
import {
  ATTEMPTS_PER_ITEM,
  appendErrorLog,
  emptyMeta,
  type AppMeta,
  type AttemptRecord,
  type DraftRecord,
  type ErrorLogEntry,
  type GameStore,
  type LoadedGame,
  type ProfileBundle,
  type StoredProfile,
} from "./types";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const draftKey = (profileId: string, itemId: string) => `${profileId}\u0000${itemId}`;

/** Keeps everything in memory: the fallback when IndexedDB is blocked, and a test double. */
export class MemoryStore implements GameStore {
  readonly persistent: boolean;
  private meta: AppMeta = emptyMeta();
  private profiles = new Map<string, StoredProfile>();
  private states = new Map<string, GameState>();
  private attempts: AttemptRecord[] = [];
  private drafts = new Map<string, DraftRecord>();
  private nextAttemptId = 1;

  constructor(options: { persistent?: boolean } = {}) {
    this.persistent = options.persistent ?? false;
  }

  async readMeta(): Promise<AppMeta> {
    return clone(this.meta);
  }

  async writeMeta(patch: Partial<AppMeta>): Promise<void> {
    this.meta = { ...this.meta, ...clone(patch) };
  }

  async appendErrorLog(entry: ErrorLogEntry): Promise<void> {
    this.meta = { ...this.meta, errorLog: appendErrorLog(this.meta.errorLog, clone(entry)) };
  }

  async loadActive(): Promise<LoadedGame | null> {
    const id = this.meta.activeProfileId;
    if (id === null) return null;
    const profile = this.profiles.get(id);
    const state = this.states.get(id);
    if (!profile || !state) return null;
    const drafts = new Map<string, string>();
    for (const draft of this.drafts.values()) if (draft.profileId === id) drafts.set(draft.itemId, draft.code);
    return { profile: clone(profile), state: clone(state), drafts, meta: clone(this.meta) };
  }

  async createProfile(profile: StoredProfile, state: GameState): Promise<void> {
    this.profiles.set(profile.id, clone(profile));
    this.states.set(profile.id, clone(state));
    this.meta = { ...this.meta, activeProfileId: profile.id };
  }

  async saveState(profileId: string, state: GameState, attempt?: AttemptRecord): Promise<void> {
    this.states.set(profileId, clone(state));
    if (!attempt) return;
    this.attempts.push({ ...clone(attempt), id: this.nextAttemptId++ });
    const same = this.attempts.filter((a) => a.profileId === profileId && a.itemId === attempt.itemId);
    const extra = same.length - ATTEMPTS_PER_ITEM;
    if (extra > 0) {
      const dropped = new Set(same.slice(0, extra));
      this.attempts = this.attempts.filter((a) => !dropped.has(a));
    }
  }

  async saveDraft(profileId: string, itemId: string, code: string): Promise<void> {
    this.drafts.set(draftKey(profileId, itemId), { profileId, itemId, code });
  }

  async exportProfiles(): Promise<ProfileBundle[]> {
    return [...this.profiles.values()].map((profile) => ({
      profile: clone(profile),
      state: clone(this.states.get(profile.id) as GameState),
      attempts: clone(this.attempts.filter((a) => a.profileId === profile.id)),
      drafts: clone([...this.drafts.values()].filter((d) => d.profileId === profile.id)),
    }));
  }

  async replaceAll(meta: AppMeta, profiles: ProfileBundle[]): Promise<void> {
    this.meta = clone(meta);
    this.profiles = new Map(profiles.map((p) => [p.profile.id, clone(p.profile)]));
    this.states = new Map(profiles.map((p) => [p.profile.id, clone(p.state)]));
    this.attempts = clone(profiles.flatMap((p) => p.attempts));
    this.drafts = new Map(profiles.flatMap((p) => p.drafts).map((d) => [draftKey(d.profileId, d.itemId), clone(d)]));
    this.nextAttemptId = Math.max(0, ...this.attempts.map((a) => a.id ?? 0)) + 1;
  }
}
```

`src/storage/dexieStore.ts`:

```ts
import Dexie, { type DexieOptions, type Table } from "dexie";
import type { GameState } from "../game/state";
import {
  ATTEMPTS_PER_ITEM,
  appendErrorLog,
  emptyMeta,
  type AppMeta,
  type AttemptRecord,
  type DraftRecord,
  type ErrorLogEntry,
  type GameStore,
  type LoadedGame,
  type ProfileBundle,
  type StoredProfile,
} from "./types";

interface MetaRow {
  key: "app";
  value: AppMeta;
}

interface StateRow {
  profileId: string;
  state: GameState;
}

class PyPetDatabase extends Dexie {
  meta!: Table<MetaRow, string>;
  profiles!: Table<StoredProfile, string>;
  states!: Table<StateRow, string>;
  attempts!: Table<AttemptRecord, number>;
  drafts!: Table<DraftRecord, [string, string]>;

  constructor(name: string, options?: DexieOptions) {
    super(name, options);
    this.version(1).stores({
      meta: "key",
      profiles: "id",
      states: "profileId",
      attempts: "++id, [profileId+itemId], profileId",
      drafts: "[profileId+itemId], profileId",
    });
  }
}

export class DexieStore implements GameStore {
  readonly persistent = true;

  private constructor(private readonly db: PyPetDatabase) {}

  static async open(name = "py-pet", options?: DexieOptions): Promise<DexieStore> {
    const db = new PyPetDatabase(name, options);
    await db.open();
    return new DexieStore(db);
  }

  close(): void {
    this.db.close();
  }

  async readMeta(): Promise<AppMeta> {
    return (await this.db.meta.get("app"))?.value ?? emptyMeta();
  }

  async writeMeta(patch: Partial<AppMeta>): Promise<void> {
    await this.db.transaction("rw", this.db.meta, async () => {
      const current = await this.readMeta();
      await this.db.meta.put({ key: "app", value: { ...current, ...patch } });
    });
  }

  async appendErrorLog(entry: ErrorLogEntry): Promise<void> {
    await this.db.transaction("rw", this.db.meta, async () => {
      const current = await this.readMeta();
      await this.db.meta.put({ key: "app", value: { ...current, errorLog: appendErrorLog(current.errorLog, entry) } });
    });
  }

  async loadActive(): Promise<LoadedGame | null> {
    const meta = await this.readMeta();
    const id = meta.activeProfileId;
    if (id === null) return null;
    const [profile, stateRow, drafts] = await Promise.all([
      this.db.profiles.get(id),
      this.db.states.get(id),
      this.db.drafts.where("profileId").equals(id).toArray(),
    ]);
    if (!profile || !stateRow) return null;
    return { profile, state: stateRow.state, drafts: new Map(drafts.map((d) => [d.itemId, d.code])), meta };
  }

  async createProfile(profile: StoredProfile, state: GameState): Promise<void> {
    await this.db.transaction("rw", [this.db.meta, this.db.profiles, this.db.states], async () => {
      await this.db.profiles.put(profile);
      await this.db.states.put({ profileId: profile.id, state });
      const meta = await this.readMeta();
      await this.db.meta.put({ key: "app", value: { ...meta, activeProfileId: profile.id } });
    });
  }

  async saveState(profileId: string, state: GameState, attempt?: AttemptRecord): Promise<void> {
    await this.db.transaction("rw", this.db.states, this.db.attempts, async () => {
      await this.db.states.put({ profileId, state });
      if (!attempt) return;
      await this.db.attempts.add(attempt);
      const keys = await this.db.attempts.where("[profileId+itemId]").equals([profileId, attempt.itemId]).primaryKeys();
      const extra = keys.length - ATTEMPTS_PER_ITEM;
      if (extra > 0) await this.db.attempts.bulkDelete(keys.slice(0, extra));
    });
  }

  async saveDraft(profileId: string, itemId: string, code: string): Promise<void> {
    await this.db.drafts.put({ profileId, itemId, code });
  }

  async exportProfiles(): Promise<ProfileBundle[]> {
    const profiles = await this.db.profiles.toArray();
    return Promise.all(
      profiles.map(async (profile) => ({
        profile,
        state: ((await this.db.states.get(profile.id)) as StateRow).state,
        attempts: await this.db.attempts.where("profileId").equals(profile.id).toArray(),
        drafts: await this.db.drafts.where("profileId").equals(profile.id).toArray(),
      })),
    );
  }

  async replaceAll(meta: AppMeta, profiles: ProfileBundle[]): Promise<void> {
    const tables = [this.db.meta, this.db.profiles, this.db.states, this.db.attempts, this.db.drafts];
    await this.db.transaction("rw", tables, async () => {
      await Promise.all(tables.map((table) => table.clear()));
      await this.db.meta.put({ key: "app", value: meta });
      await this.db.profiles.bulkPut(profiles.map((p) => p.profile));
      await this.db.states.bulkPut(profiles.map((p) => ({ profileId: p.profile.id, state: p.state })));
      await this.db.attempts.bulkPut(profiles.flatMap((p) => p.attempts));
      await this.db.drafts.bulkPut(profiles.flatMap((p) => p.drafts));
    });
  }
}
```

- [ ] **Step 5: Chạy test, xác nhận thành công**

Run: `npx vitest run src/storage && npm run typecheck`
Expected: PASS toàn bộ (6 test cho mỗi store + 2 test persistence). Nếu TypeScript báo lỗi kiểu ở tham số `Table`/`transaction` của Dexie 4, chỉ sửa kiểu (ép kiểu tối thiểu), không đổi hành vi.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/storage
git commit -F - <<'EOF'
feat(storage): add the GameStore contract with IndexedDB (Dexie) and memory stores

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 5: Mã hóa, PIN và file sao lưu

**Files:**
- Create: `src/storage/encoding.ts`, `src/storage/pin.ts`, `src/storage/backup.ts`, `src/test/backupSample.ts`, `tools/make_backup_fixture.ts`, `src/storage/fixtures/backup-v1.pypet` (sinh ra ở Step 4)
- Test: `src/storage/backup.test.ts`

**Interfaces:**
- Consumes: Task 4.
- Produces:
  - `bytesToBase64(bytes: Uint8Array): string`, `base64ToBytes(text: string): Uint8Array`, `utf8ToBase64(text: string): string`, `base64ToUtf8(text: string): string`, `sha256Hex(text: string): Promise<string>`.
  - `PIN_PATTERN`, `PIN_ITERATIONS = 100_000`, `isValidPin(pin): boolean`, `hashPin(pin, iterations?): Promise<PinHash>` (ném lỗi khi PIN sai dạng), `verifyPin(pin, stored): Promise<boolean>`.
  - `BACKUP_FORMAT = "py-pet-backup"`, `APP_VERSION = "0.2.0"`, `interface BackupPayload { format; schemaVersion; appVersion; exportedAt; meta: AppMeta; profiles: ProfileBundle[] }`, `buildBackupPayload(store, now): Promise<BackupPayload>` (bỏ `autoBackups` khỏi meta), `encodeBackup(payload): Promise<string>`, `type DecodeResult = { ok: true; payload: BackupPayload; checksumValid: boolean } | { ok: false; reason: "not-a-backup" | "newer-version" }`, `decodeBackup(text): Promise<DecodeResult>`, `migrateBackup(payload): BackupPayload`, `interface BackupPreview { childName; stage; xu; lastActiveDay }`, `previewOf(payload): BackupPreview | null`, `backupFileName(childName, today): string`.
  - Test helper `sampleBackupPayload(childName = "An"): BackupPayload`.

- [ ] **Step 1: Viết test helper và test thất bại**

`src/test/backupSample.ts`:

```ts
import { initialGameState } from "../game/state";
import { APP_VERSION, BACKUP_FORMAT, type BackupPayload } from "../storage/backup";
import { emptyMeta, SCHEMA_VERSION } from "../storage/types";

export function sampleBackupPayload(childName = "An"): BackupPayload {
  const state = initialGameState("2026-10-06");
  state.wallet.xu = 120;
  state.pet.xp = 30;
  state.activity.lastActiveDay = "2026-10-06";
  return {
    format: BACKUP_FORMAT,
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    exportedAt: "2026-10-06T12:00:00.000Z",
    meta: { ...emptyMeta(), activeProfileId: "p1", lastBackupAt: "2026-10-06T12:00:00.000Z" },
    profiles: [
      {
        profile: { id: "p1", childName, robotName: "Robo", createdAt: "2026-10-01T02:00:00.000Z" },
        state,
        attempts: [],
        drafts: [{ profileId: "p1", itemId: "s1.lam-quen.l1.ex1", code: 'print("Xin chào")' }],
      },
    ],
  };
}
```

`src/storage/backup.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { initialGameState } from "../game/state";
import { sampleBackupPayload } from "../test/backupSample";
import {
  backupFileName,
  buildBackupPayload,
  decodeBackup,
  encodeBackup,
  migrateBackup,
  previewOf,
} from "./backup";
import { base64ToUtf8, sha256Hex, utf8ToBase64 } from "./encoding";
import { MemoryStore } from "./memoryStore";
import { hashPin, isValidPin, verifyPin } from "./pin";

describe("encoding", () => {
  test("UTF-8 base64 round-trips Vietnamese text", () => {
    expect(base64ToUtf8(utf8ToBase64("Xin chào Robo – đẹp"))).toBe("Xin chào Robo – đẹp");
  });

  test("sha256Hex", async () => {
    expect(await sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
});

describe("PIN", () => {
  test("isValidPin accepts 4 to 6 digits", () => {
    expect(["1234", "123456"].map(isValidPin)).toEqual([true, true]);
    expect(["123", "1234567", "12a4", ""].map(isValidPin)).toEqual([false, false, false, false]);
  });

  test("hash then verify", async () => {
    const stored = await hashPin("2468", 1000);
    expect(stored.iterations).toBe(1000);
    expect(await verifyPin("2468", stored)).toBe(true);
    expect(await verifyPin("2469", stored)).toBe(false);
    const again = await hashPin("2468", 1000);
    expect(again.salt).not.toBe(stored.salt);
  });

  test("hashPin rejects an invalid PIN", async () => {
    await expect(hashPin("12", 1000)).rejects.toThrow("PIN");
  });
});

describe("backup file", () => {
  test("encode then decode round-trips with a valid checksum", async () => {
    const payload = sampleBackupPayload();
    const result = await decodeBackup(await encodeBackup(payload));
    expect(result).toEqual({ ok: true, payload, checksumValid: true });
  });

  test("flags a tampered file", async () => {
    const text = await encodeBackup(sampleBackupPayload());
    const edited = JSON.parse(base64ToUtf8(text));
    edited.profiles[0].state.wallet.xu = 99999;
    const result = await decodeBackup(utf8ToBase64(JSON.stringify(edited)));
    expect(result.ok).toBe(true);
    expect(result.ok && result.checksumValid).toBe(false);
  });

  test("rejects garbage and other JSON", async () => {
    expect(await decodeBackup("%%% not base64 %%%")).toEqual({ ok: false, reason: "not-a-backup" });
    expect(await decodeBackup(utf8ToBase64('{"hello":1}'))).toEqual({ ok: false, reason: "not-a-backup" });
    expect(await decodeBackup(utf8ToBase64("[1,2]"))).toEqual({ ok: false, reason: "not-a-backup" });
  });

  test("refuses a newer schema", async () => {
    const text = await encodeBackup({ ...sampleBackupPayload(), schemaVersion: 99 });
    expect(await decodeBackup(text)).toEqual({ ok: false, reason: "newer-version" });
  });

  test("migrateBackup throws when a migration step is missing", () => {
    expect(() => migrateBackup({ ...sampleBackupPayload(), schemaVersion: 0 })).toThrow("Missing migration from schema 0");
  });

  test("previewOf shows the active profile", () => {
    expect(previewOf(sampleBackupPayload("Bình"))).toEqual({ childName: "Bình", stage: 1, xu: 120, lastActiveDay: "2026-10-06" });
    expect(previewOf({ ...sampleBackupPayload(), profiles: [] })).toBeNull();
  });

  test("backupFileName removes accents", () => {
    expect(backupFileName("Đặng Minh An", "2026-10-06")).toBe("py-pet-dang-minh-an-2026-10-06.pypet");
    expect(backupFileName("  ", "2026-10-06")).toBe("py-pet-con-2026-10-06.pypet");
  });

  test("buildBackupPayload leaves the automatic backups out", async () => {
    const store = new MemoryStore();
    await store.createProfile(sampleBackupPayload().profiles[0]!.profile, initialGameState("2026-10-06"));
    await store.writeMeta({ autoBackups: ["old"] });
    const payload = await buildBackupPayload(store, new Date("2026-10-06T12:00:00.000Z"));
    expect(payload.meta.autoBackups).toEqual([]);
    expect(payload.exportedAt).toBe("2026-10-06T12:00:00.000Z");
    expect(payload.profiles).toHaveLength(1);
  });

  test("decodes the committed schema 1 sample file", async () => {
    const text = readFileSync("src/storage/fixtures/backup-v1.pypet", "utf8");
    const result = await decodeBackup(text);
    expect(result.ok && result.checksumValid).toBe(true);
    expect(result.ok && previewOf(result.payload)?.childName).toBe("An");
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/storage/backup.test.ts`
Expected: FAIL vì chưa có `./backup`, `./encoding`, `./pin`.

- [ ] **Step 3: Viết code**

`src/storage/encoding.ts`:

```ts
export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function base64ToBytes(text: string): Uint8Array {
  const binary = atob(text);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export function utf8ToBase64(text: string): string {
  return bytesToBase64(new TextEncoder().encode(text));
}

export function base64ToUtf8(text: string): string {
  return new TextDecoder().decode(base64ToBytes(text));
}

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
```

`src/storage/pin.ts`:

```ts
import { base64ToBytes, bytesToBase64 } from "./encoding";
import type { PinHash } from "./types";

export const PIN_PATTERN = /^\d{4,6}$/;
export const PIN_ITERATIONS = 100_000;

export function isValidPin(pin: string): boolean {
  return PIN_PATTERN.test(pin);
}

async function derive(pin: string, salt: Uint8Array, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
  return bytesToBase64(new Uint8Array(bits));
}

export async function hashPin(pin: string, iterations: number = PIN_ITERATIONS): Promise<PinHash> {
  if (!isValidPin(pin)) throw new Error("PIN must have 4 to 6 digits");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { salt: bytesToBase64(salt), hash: await derive(pin, salt, iterations), iterations };
}

export async function verifyPin(pin: string, stored: PinHash): Promise<boolean> {
  return (await derive(pin, base64ToBytes(stored.salt), stored.iterations)) === stored.hash;
}
```

`src/storage/backup.ts`:

```ts
import { base64ToUtf8, sha256Hex, utf8ToBase64 } from "./encoding";
import { SCHEMA_VERSION, type AppMeta, type GameStore, type ProfileBundle } from "./types";

export const BACKUP_FORMAT = "py-pet-backup";
export const APP_VERSION = "0.2.0";
/** Detects hand edits; it is not a security measure. */
const CHECKSUM_SECRET = "py-pet/backup/checksum/2026";

export interface BackupPayload {
  format: string;
  schemaVersion: number;
  appVersion: string;
  exportedAt: string;
  meta: AppMeta;
  profiles: ProfileBundle[];
}

export type DecodeResult =
  | { ok: true; payload: BackupPayload; checksumValid: boolean }
  | { ok: false; reason: "not-a-backup" | "newer-version" };

export interface BackupPreview {
  childName: string;
  stage: number;
  xu: number;
  lastActiveDay: string | null;
}

/** schemaVersion N -> function that turns an N payload into an N+1 payload. */
const MIGRATIONS: Record<number, (payload: BackupPayload) => BackupPayload> = {};

export async function buildBackupPayload(store: GameStore, now: Date): Promise<BackupPayload> {
  const meta = await store.readMeta();
  return {
    format: BACKUP_FORMAT,
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    exportedAt: now.toISOString(),
    meta: { ...meta, autoBackups: [] },
    profiles: await store.exportProfiles(),
  };
}

export async function encodeBackup(payload: BackupPayload): Promise<string> {
  const checksum = await sha256Hex(JSON.stringify(payload) + CHECKSUM_SECRET);
  return utf8ToBase64(JSON.stringify({ ...payload, checksum }));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function decodeBackup(text: string): Promise<DecodeResult> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(base64ToUtf8(text.trim()));
  } catch {
    return { ok: false, reason: "not-a-backup" };
  }
  if (
    !isRecord(parsed) ||
    parsed.format !== BACKUP_FORMAT ||
    typeof parsed.schemaVersion !== "number" ||
    !Array.isArray(parsed.profiles) ||
    !isRecord(parsed.meta)
  ) {
    return { ok: false, reason: "not-a-backup" };
  }
  if (parsed.schemaVersion > SCHEMA_VERSION) return { ok: false, reason: "newer-version" };
  const { checksum, ...rest } = parsed;
  const expected = await sha256Hex(JSON.stringify(rest) + CHECKSUM_SECRET);
  return { ok: true, payload: migrateBackup(rest as unknown as BackupPayload), checksumValid: checksum === expected };
}

export function migrateBackup(payload: BackupPayload): BackupPayload {
  let current = payload;
  for (let version = payload.schemaVersion; version < SCHEMA_VERSION; version += 1) {
    const step = MIGRATIONS[version];
    if (!step) throw new Error(`Missing migration from schema ${version}`);
    current = step(current);
  }
  return current;
}

export function previewOf(payload: BackupPayload): BackupPreview | null {
  const active =
    payload.profiles.find((p) => p.profile.id === payload.meta.activeProfileId) ?? payload.profiles[0];
  if (!active) return null;
  return {
    childName: active.profile.childName,
    stage: active.state.pet.stage,
    xu: active.state.wallet.xu,
    lastActiveDay: active.state.activity.lastActiveDay,
  };
}

export function backupFileName(childName: string, today: string): string {
  const slug = childName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `py-pet-${slug || "con"}-${today}.pypet`;
}
```

`tools/make_backup_fixture.ts`:

```ts
import { mkdirSync, writeFileSync } from "node:fs";
import { encodeBackup } from "../src/storage/backup";
import { SCHEMA_VERSION } from "../src/storage/types";
import { sampleBackupPayload } from "../src/test/backupSample";

// Run once per schema version and commit the file: future versions must still import it.
const out = `src/storage/fixtures/backup-v${SCHEMA_VERSION}.pypet`;
mkdirSync("src/storage/fixtures", { recursive: true });
writeFileSync(out, await encodeBackup(sampleBackupPayload()));
console.log(`Wrote ${out}`);
```

- [ ] **Step 4: Sinh file mẫu và chạy test**

```bash
npx tsx tools/make_backup_fixture.ts
npx vitest run src/storage && npm run typecheck
```

Expected: dòng `Wrote src/storage/fixtures/backup-v1.pypet`; PASS toàn bộ. Nếu TypeScript báo `Uint8Array<ArrayBufferLike>` không gán được cho `BufferSource` ở `pin.ts`, ép kiểu tham số `salt` thành `Uint8Array<ArrayBuffer>`, không đổi hành vi.

- [ ] **Step 5: Commit**

```bash
git add src/storage src/test/backupSample.ts tools/make_backup_fixture.ts
git commit -F - <<'EOF'
feat(storage): hash the parent PIN and encode, verify and migrate .pypet backups

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 6: Khởi động lưu trữ

**Files:**
- Create: `src/storage/bootstrap.ts`
- Test: `src/storage/bootstrap.test.ts`

**Interfaces:**
- Consumes: `DexieStore`, `MemoryStore`, `GameStore` (Task 4).
- Produces: `openGameStore(open?: () => Promise<GameStore>): Promise<GameStore>` (lỗi khi mở thì trả `MemoryStore` không bền); `interface LocksLike`; `acquireTabLock(locks?: LocksLike): Promise<boolean>` (giữ lock suốt đời tab; `true` khi tab này được ghi); `requestPersistence(storage?: { persist?: () => Promise<boolean> }): Promise<boolean>`.

- [ ] **Step 1: Viết test thất bại**

`src/storage/bootstrap.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { acquireTabLock, openGameStore, requestPersistence, type LocksLike } from "./bootstrap";
import { MemoryStore } from "./memoryStore";

class FakeLocks implements LocksLike {
  held = new Set<string>();
  async request(name: string, _options: { ifAvailable: boolean }, callback: (lock: unknown) => Promise<void>): Promise<unknown> {
    if (this.held.has(name)) return callback(null);
    this.held.add(name);
    return callback({ name });
  }
}

describe("openGameStore", () => {
  test("returns the opened store", async () => {
    const store = new MemoryStore({ persistent: true });
    expect(await openGameStore(async () => store)).toBe(store);
  });

  test("falls back to MemoryStore when opening fails", async () => {
    const store = await openGameStore(async () => {
      throw new Error("IndexedDB blocked");
    });
    expect(store).toBeInstanceOf(MemoryStore);
    expect(store.persistent).toBe(false);
  });
});

describe("acquireTabLock", () => {
  test("allows writing when the browser has no Web Locks", async () => {
    expect(await acquireTabLock(undefined)).toBe(true);
  });

  test("a second request does not get the lock", async () => {
    const locks = new FakeLocks();
    expect(await acquireTabLock(locks)).toBe(true);
    expect(await acquireTabLock(locks)).toBe(false);
  });
});

describe("requestPersistence", () => {
  test("returns what the browser answers, and false on errors", async () => {
    expect(await requestPersistence({ persist: async () => true })).toBe(true);
    expect(
      await requestPersistence({
        persist: async () => {
          throw new Error("no");
        },
      }),
    ).toBe(false);
    expect(await requestPersistence({})).toBe(false);
    expect(await requestPersistence(undefined)).toBe(false);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/storage/bootstrap.test.ts`
Expected: FAIL vì chưa có `./bootstrap`.

- [ ] **Step 3: Viết `src/storage/bootstrap.ts`**

```ts
import { DexieStore } from "./dexieStore";
import { MemoryStore } from "./memoryStore";
import type { GameStore } from "./types";

export async function openGameStore(open: () => Promise<GameStore> = () => DexieStore.open()): Promise<GameStore> {
  try {
    return await open();
  } catch {
    return new MemoryStore();
  }
}

export interface LocksLike {
  request(name: string, options: { ifAvailable: boolean }, callback: (lock: unknown) => Promise<void>): Promise<unknown>;
}

const LOCK_NAME = "py-pet-writer";

function browserLocks(): LocksLike | undefined {
  return (globalThis.navigator as { locks?: LocksLike } | undefined)?.locks;
}

/** Holds the writer lock for the life of the tab. Resolves false when another tab holds it. */
export function acquireTabLock(locks: LocksLike | undefined = browserLocks()): Promise<boolean> {
  if (!locks) return Promise.resolve(true);
  return new Promise((resolve) => {
    void locks.request(LOCK_NAME, { ifAvailable: true }, (lock) => {
      if (lock === null) {
        resolve(false);
        return Promise.resolve();
      }
      resolve(true);
      return new Promise<void>(() => {});
    });
  });
}

export async function requestPersistence(
  storage: { persist?: () => Promise<boolean> } | undefined = globalThis.navigator?.storage,
): Promise<boolean> {
  try {
    return (await storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Chạy test, xác nhận thành công**

Run: `npx vitest run src/storage && npm run typecheck`
Expected: PASS toàn bộ.

- [ ] **Step 5: Commit**

```bash
git add src/storage/bootstrap.ts src/storage/bootstrap.test.ts
git commit -F - <<'EOF'
feat(storage): open the store with a memory fallback, hold a tab lock, ask for persistence

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 7: Chuỗi giao diện M2 và GameProvider

**Files:**
- Create: `src/ui/GameProvider.tsx`, `src/test/renderGame.tsx`
- Modify: `src/i18n/vi.ts`, `src/i18n/en.ts`, `src/ui/contexts.tsx`, `src/ui/useExplain.ts`
- Test: `src/ui/GameProvider.test.tsx`

**Interfaces:**
- Consumes: Task 1 đến 5; `useLang` (có `setUiLang`); `explainWithChain`.
- Produces:
  - Khóa i18n M2 (Step 3) dùng ở Task 8 đến 13.
  - Trong `src/ui/contexts.tsx`: `ErrorLogContext` (mặc định không làm gì), `useLogError(): (entry: Omit<ErrorLogEntry, "at">) => void`.
  - `useExplain()` ghi `{ kind: "unknown-python-error", detail: "<type>: <message>" }` khi không có giải thích.
  - `BACKUP_REMINDER_DAYS = 7`, `DRAFT_SAVE_DELAY_MS = 400`.
  - ```ts
    interface GameApi {
      profile: StoredProfile; state: GameState; today: string;
      persistent: boolean; writeFailed: boolean; lastBackupAt: string | null; needsBackupReminder: boolean;
      dispatch(event: GameEvent, attempt?: AttemptInput): void;
      draftFor(itemId: string): string | undefined; saveDraft(itemId: string, code: string): void;
      exportBackup(): Promise<{ fileName: string; text: string }>;
      checkPin(pin: string): Promise<boolean>;
      importBackup(payload: BackupPayload): Promise<void>;
    }
    ```
  - `<GameProvider store loaded clock onReplaced>`, `useGame(): GameApi`, `useOptionalGame(): GameApi | null`. Khi mount và mỗi lần trang hiện lại (`visibilitychange`), provider gửi `DayRollover`. Lần đầu, provider đặt ngôn ngữ giao diện theo `state.settings.uiLang`; sau đó mỗi lần đổi ngôn ngữ thì gửi `SettingsChanged`.
  - Test helper: `FIXED_NOW = new Date(2026, 9, 6, 9, 0, 0)`, `TODAY = "2026-10-06"`, `testProfile()`, `renderWithGame(ui, options?): Promise<RenderResult & { store: GameStore }>` với `options: { bundle?, runner?, lang?, state?, meta?, drafts?, store?, clock?, onReplaced? }`.

- [ ] **Step 1: Thêm khóa i18n**

Thêm vào cuối object `vi` trong `src/i18n/vi.ts` (trước `} as const;`):

```ts
  "app.loading": "Đang mở hồ sơ...",
  "app.otherTab": "Py-Pet đang mở ở tab khác. Con dùng tab đó nhé.",
  "nav.room": "Về phòng",
  "room.title": "Phòng của {name}",
  "room.greeting": "Chào {child}!",
  "room.pin": "Pin",
  "room.vui": "Vui",
  "room.growth": "Lớn lên",
  "room.today": "Mục tiêu hôm nay: {done}/{goal}",
  "room.week": "Tuần này: {done}/{target} bài",
  "room.streak": "Chuỗi: {days} ngày",
  "room.freezes": "Thẻ giữ chuỗi: {count}",
  "room.xu": "Xu: {xu}",
  "room.continue": "Học tiếp",
  "room.allDone": "Con đã học hết các bài hiện có. Robo chờ bài mới nhé!",
  "room.map": "Bản đồ học",
  "room.backup": "Sao lưu",
  "pet.happy": "{name} đang rất vui!",
  "pet.normal": "{name} đang chờ con học.",
  "pet.sleepy": "{name} buồn ngủ quá, nhớ con lắm!",
  "pet.drained": "{name} hết pin rồi. Con học 1 bài để sạc cho {name} nhé!",
  "map.title": "Bản đồ học",
  "map.done": "Đã xong",
  "map.next": "Bài tiếp theo",
  "map.locked": "Chưa mở",
  "lesson.locked": "Bài này chưa mở. Con học các bài trước đã nhé.",
  "result.xp": "+{n} XP",
  "result.xu": "+{n} xu",
  "result.pin": "Pin +{n}",
  "result.next": "Học bài tiếp",
  "onboarding.title": "Chào mừng đến với Py-Pet!",
  "onboarding.language": "Chọn ngôn ngữ",
  "onboarding.langVi": "Tiếng Việt",
  "onboarding.langEn": "English",
  "onboarding.childName": "Tên của con",
  "onboarding.robotName": "Tên robot",
  "onboarding.pin": "Mã PIN của bố mẹ (4 đến 6 chữ số)",
  "onboarding.pinConfirm": "Nhập lại mã PIN",
  "onboarding.start": "Bắt đầu",
  "onboarding.errorName": "Con hãy nhập tên nhé.",
  "onboarding.errorPin": "Mã PIN phải gồm 4 đến 6 chữ số.",
  "onboarding.errorPinMatch": "Hai mã PIN chưa giống nhau.",
  "backup.title": "Sao lưu",
  "backup.export": "Xuất file sao lưu",
  "backup.exported": "Đã tạo file {file}",
  "backup.lastBackup": "Lần sao lưu gần nhất: {date}",
  "backup.never": "Chưa sao lưu lần nào",
  "backup.import": "Nhập file sao lưu",
  "backup.pinPrompt": "Bố mẹ nhập mã PIN để nhập file",
  "backup.pinLabel": "Mã PIN",
  "backup.pinCheck": "Xác nhận",
  "backup.pinWrong": "Mã PIN chưa đúng.",
  "backup.chooseFile": "Chọn file .pypet",
  "backup.notABackup": "File này không phải file sao lưu của Py-Pet.",
  "backup.newerVersion": "File này từ phiên bản mới hơn. Hãy tải lại trang để cập nhật app.",
  "backup.tampered": "Cảnh báo: file đã bị chỉnh sửa.",
  "backup.preview": "Hồ sơ trong file: {name}, giai đoạn {stage}, {xu} xu, hoạt động cuối {day}",
  "backup.confirmImport": "Nhập dữ liệu (thay dữ liệu hiện tại)",
  "backup.cancel": "Hủy",
  "banner.notPersistent": "Trình duyệt đang chặn lưu dữ liệu. Tiến độ sẽ không được lưu.",
  "banner.writeFailed": "Không lưu được tiến độ. Hãy xuất file sao lưu ngay.",
  "banner.backupReminder": "Đã 7 ngày chưa sao lưu.",
  "banner.backupNow": "Sao lưu ngay",
```

Thêm vào cuối object `en` trong `src/i18n/en.ts`:

```ts
  "app.loading": "Opening the profile...",
  "app.otherTab": "Py-Pet is open in another tab. Please use that tab.",
  "nav.room": "Back to the room",
  "room.title": "{name}'s room",
  "room.greeting": "Hi {child}!",
  "room.pin": "Battery",
  "room.vui": "Joy",
  "room.growth": "Growth",
  "room.today": "Today's goal: {done}/{goal}",
  "room.week": "This week: {done}/{target} lessons",
  "room.streak": "Streak: {days} days",
  "room.freezes": "Streak savers: {count}",
  "room.xu": "Coins: {xu}",
  "room.continue": "Continue learning",
  "room.allDone": "You finished all the lessons for now. Robo waits for new ones!",
  "room.map": "Lesson map",
  "room.backup": "Backup",
  "pet.happy": "{name} is very happy!",
  "pet.normal": "{name} is waiting for you.",
  "pet.sleepy": "{name} is sleepy and misses you!",
  "pet.drained": "{name} has no battery. Finish 1 lesson to charge {name}!",
  "map.title": "Lesson map",
  "map.done": "Done",
  "map.next": "Next lesson",
  "map.locked": "Locked",
  "lesson.locked": "This lesson is locked. Finish the lessons before it first.",
  "result.xp": "+{n} XP",
  "result.xu": "+{n} coins",
  "result.pin": "Battery +{n}",
  "result.next": "Go to the next lesson",
  "onboarding.title": "Welcome to Py-Pet!",
  "onboarding.language": "Choose a language",
  "onboarding.langVi": "Tiếng Việt",
  "onboarding.langEn": "English",
  "onboarding.childName": "Your name",
  "onboarding.robotName": "Robot name",
  "onboarding.pin": "Parent PIN (4 to 6 digits)",
  "onboarding.pinConfirm": "Type the PIN again",
  "onboarding.start": "Start",
  "onboarding.errorName": "Please type your name.",
  "onboarding.errorPin": "The PIN must have 4 to 6 digits.",
  "onboarding.errorPinMatch": "The 2 PINs are not the same.",
  "backup.title": "Backup",
  "backup.export": "Export a backup file",
  "backup.exported": "Created the file {file}",
  "backup.lastBackup": "Last backup: {date}",
  "backup.never": "No backup yet",
  "backup.import": "Import a backup file",
  "backup.pinPrompt": "Parent: type the PIN to import a file",
  "backup.pinLabel": "PIN",
  "backup.pinCheck": "Confirm",
  "backup.pinWrong": "The PIN is not correct.",
  "backup.chooseFile": "Choose a .pypet file",
  "backup.notABackup": "This file is not a Py-Pet backup.",
  "backup.newerVersion": "This file is from a newer version. Reload the page to update the app.",
  "backup.tampered": "Warning: someone changed this file.",
  "backup.preview": "Profile in the file: {name}, stage {stage}, {xu} coins, last active {day}",
  "backup.confirmImport": "Import (replace the current data)",
  "backup.cancel": "Cancel",
  "banner.notPersistent": "The browser blocks storage. Your progress will not be saved.",
  "banner.writeFailed": "Your progress could not be saved. Export a backup file now.",
  "banner.backupReminder": "No backup for 7 days.",
  "banner.backupNow": "Back up now",
```

- [ ] **Step 2: Viết test helper và test thất bại**

`src/test/renderGame.tsx`:

```tsx
import { render, type RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";
import type { ContentBundle } from "../content/types";
import { initialGameState, type GameState } from "../game/state";
import type { Lang } from "../i18n/lang";
import { MemoryStore } from "../storage/memoryStore";
import type { AppMeta, GameStore, LoadedGame, StoredProfile } from "../storage/types";
import { AppProviders, type RunnerApi } from "../ui/contexts";
import { GameProvider } from "../ui/GameProvider";
import { testBundle } from "./fixtures";
import { fakeRunner, okResult } from "./render";

/** Tuesday 2026-10-06 09:00 local time. */
export const FIXED_NOW = new Date(2026, 9, 6, 9, 0, 0);
export const TODAY = "2026-10-06";

export function testProfile(): StoredProfile {
  return { id: "p1", childName: "An", robotName: "Robo", createdAt: FIXED_NOW.toISOString() };
}

export interface GameRenderOptions {
  bundle?: ContentBundle;
  runner?: RunnerApi;
  lang?: Lang;
  state?: GameState;
  meta?: Partial<AppMeta>;
  drafts?: Record<string, string>;
  store?: GameStore;
  clock?: () => Date;
  onReplaced?: () => void;
}

export async function renderWithGame(
  ui: ReactElement,
  options: GameRenderOptions = {},
): Promise<RenderResult & { store: GameStore }> {
  const store = options.store ?? new MemoryStore({ persistent: true });
  const state: GameState = JSON.parse(JSON.stringify(options.state ?? initialGameState(TODAY)));
  if (options.lang) state.settings.uiLang = options.lang;
  const profile = testProfile();
  await store.createProfile(profile, state);
  if (options.meta) await store.writeMeta(options.meta);
  const loaded: LoadedGame = {
    profile,
    state,
    drafts: new Map(Object.entries(options.drafts ?? {})),
    meta: await store.readMeta(),
  };
  const result = render(
    <AppProviders
      bundle={options.bundle ?? testBundle()}
      runner={options.runner ?? fakeRunner(() => okResult(""))}
      initialLang={options.lang ?? "vi"}
    >
      <GameProvider
        store={store}
        loaded={loaded}
        clock={options.clock ?? (() => FIXED_NOW)}
        onReplaced={options.onReplaced ?? (() => {})}
      >
        {ui}
      </GameProvider>
    </AppProviders>,
  );
  return { ...result, store };
}
```

`src/ui/GameProvider.test.tsx`:

```tsx
// @vitest-environment jsdom
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { initialGameState } from "../game/state";
import { useLang } from "../i18n/LangProvider";
import { decodeBackup } from "../storage/backup";
import { MemoryStore } from "../storage/memoryStore";
import { hashPin } from "../storage/pin";
import { sampleBackupPayload } from "../test/backupSample";
import { FIXED_NOW, renderWithGame, TODAY } from "../test/renderGame";
import { useLogError } from "./contexts";
import { useGame } from "./GameProvider";

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
```

- [ ] **Step 3: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/ui/GameProvider.test.tsx`
Expected: FAIL vì chưa có `./GameProvider` và `useLogError`.

- [ ] **Step 4: Viết code**

Thêm vào `src/ui/contexts.tsx` (thêm `import type { ErrorLogEntry } from "../storage/types";` ở đầu file):

```tsx
export type LogError = (entry: Omit<ErrorLogEntry, "at">) => void;

/** Defaults to doing nothing outside a GameProvider. */
export const ErrorLogContext = createContext<LogError>(() => {});

export function useLogError(): LogError {
  return useContext(ErrorLogContext);
}
```

Thay toàn bộ `src/ui/useExplain.ts`:

```ts
import { useCallback } from "react";
import { explainWithChain } from "../explain/providers";
import { useLang } from "../i18n/LangProvider";
import type { PyErrorInfo } from "../runner/types";
import { useExplainProviders, useLogError } from "./contexts";
import type { Explain } from "./feedback";

export function useExplain(): Explain {
  const providers = useExplainProviders();
  const { uiLang } = useLang();
  const logError = useLogError();
  return useCallback(
    async (error: PyErrorInfo, code: string) => {
      const explanation = await explainWithChain(providers, { error, code, lang: uiLang });
      if (!explanation) logError({ kind: "unknown-python-error", detail: `${error.type}: ${error.message}` });
      return explanation;
    },
    [providers, uiLang, logError],
  );
}
```

`src/ui/GameProvider.tsx`:

```tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { apply, type GameEvent } from "../game/apply";
import { daysBetween, localDay } from "../game/dates";
import type { GameState } from "../game/state";
import type { Lang } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { backupFileName, buildBackupPayload, encodeBackup, type BackupPayload } from "../storage/backup";
import { verifyPin } from "../storage/pin";
import {
  appendErrorLog,
  AUTO_BACKUPS,
  type AppMeta,
  type AttemptInput,
  type AttemptRecord,
  type ErrorLogEntry,
  type GameStore,
  type LoadedGame,
  type StoredProfile,
} from "../storage/types";
import { ErrorLogContext, type LogError } from "./contexts";

export const BACKUP_REMINDER_DAYS = 7;
export const DRAFT_SAVE_DELAY_MS = 400;

export interface GameApi {
  profile: StoredProfile;
  state: GameState;
  today: string;
  persistent: boolean;
  writeFailed: boolean;
  lastBackupAt: string | null;
  needsBackupReminder: boolean;
  dispatch(event: GameEvent, attempt?: AttemptInput): void;
  draftFor(itemId: string): string | undefined;
  saveDraft(itemId: string, code: string): void;
  exportBackup(): Promise<{ fileName: string; text: string }>;
  checkPin(pin: string): Promise<boolean>;
  importBackup(payload: BackupPayload): Promise<void>;
}

const GameContext = createContext<GameApi | null>(null);

export function useGame(): GameApi {
  const value = useContext(GameContext);
  if (!value) throw new Error("useGame must be used inside <GameProvider>");
  return value;
}

export function useOptionalGame(): GameApi | null {
  return useContext(GameContext);
}

export interface GameProviderProps {
  store: GameStore;
  loaded: LoadedGame;
  clock: () => Date;
  onReplaced(): void;
  children: ReactNode;
}

export function GameProvider({ store, loaded, clock, onReplaced, children }: GameProviderProps) {
  const { uiLang, setUiLang } = useLang();
  const profile = loaded.profile;
  const [state, setState] = useState<GameState>(loaded.state);
  const stateRef = useRef<GameState>(loaded.state);
  const [meta, setMeta] = useState<AppMeta>(loaded.meta);
  const [writeFailed, setWriteFailed] = useState(false);
  const drafts = useRef(new Map(loaded.drafts));
  const draftTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const queue = useRef<Promise<void>>(Promise.resolve());

  /** Writes run one after another; a failed write is retried once, then flagged. */
  const enqueue = useCallback((work: () => Promise<void>) => {
    queue.current = queue.current.then(async () => {
      try {
        await work();
      } catch {
        try {
          await work();
        } catch {
          setWriteFailed(true);
        }
      }
    });
  }, []);

  const dispatch = useCallback(
    (event: GameEvent, attempt?: AttemptInput) => {
      const now = clock();
      const next = apply(stateRef.current, event, now);
      stateRef.current = next;
      setState(next);
      const record = attempt ? ({ ...attempt, profileId: profile.id, at: now.toISOString() } as AttemptRecord) : undefined;
      enqueue(() => store.saveState(profile.id, next, record));
    },
    [clock, enqueue, store, profile.id],
  );

  useEffect(() => {
    dispatch({ type: "DayRollover" });
    const onVisibility = () => {
      if (document.visibilityState === "visible") dispatch({ type: "DayRollover" });
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [dispatch]);

  // First run: show the saved language. Later runs: save the language the child picks.
  const langInitialised = useRef(false);
  const waitingForLang = useRef<Lang | null>(null);
  useEffect(() => {
    const saved = stateRef.current.settings.uiLang;
    if (!langInitialised.current) {
      langInitialised.current = true;
      if (uiLang !== saved) {
        waitingForLang.current = saved;
        setUiLang(saved);
      }
      return;
    }
    if (waitingForLang.current !== null) {
      if (uiLang === waitingForLang.current) waitingForLang.current = null;
      return;
    }
    if (uiLang !== saved) dispatch({ type: "SettingsChanged", patch: { uiLang } });
  }, [uiLang, setUiLang, dispatch]);

  const draftFor = useCallback((itemId: string) => drafts.current.get(itemId), []);

  const saveDraft = useCallback(
    (itemId: string, code: string) => {
      drafts.current.set(itemId, code);
      const timers = draftTimers.current;
      const pending = timers.get(itemId);
      if (pending) clearTimeout(pending);
      timers.set(
        itemId,
        setTimeout(() => {
          timers.delete(itemId);
          enqueue(() => store.saveDraft(profile.id, itemId, code));
        }, DRAFT_SAVE_DELAY_MS),
      );
    },
    [enqueue, store, profile.id],
  );

  useEffect(() => {
    const timers = draftTimers.current;
    return () => {
      for (const [itemId, timer] of timers) {
        clearTimeout(timer);
        const code = drafts.current.get(itemId);
        if (code !== undefined) enqueue(() => store.saveDraft(profile.id, itemId, code));
      }
      timers.clear();
    };
  }, [enqueue, store, profile.id]);

  const logError = useCallback<LogError>(
    (entry) => {
      const full: ErrorLogEntry = { ...entry, at: clock().toISOString() };
      setMeta((current) => ({ ...current, errorLog: appendErrorLog(current.errorLog, full) }));
      enqueue(() => store.appendErrorLog(full));
    },
    [clock, enqueue, store],
  );

  const exportBackup = useCallback(async () => {
    await queue.current;
    const now = clock();
    const text = await encodeBackup(await buildBackupPayload(store, now));
    const lastBackupAt = now.toISOString();
    await store.writeMeta({ lastBackupAt });
    setMeta((current) => ({ ...current, lastBackupAt }));
    return { fileName: backupFileName(profile.childName, localDay(now)), text };
  }, [clock, store, profile.childName]);

  const checkPin = useCallback(
    async (pin: string) => (meta.pin ? verifyPin(pin, meta.pin) : false),
    [meta.pin],
  );

  const importBackup = useCallback(
    async (payload: BackupPayload) => {
      await queue.current;
      const current = await encodeBackup(await buildBackupPayload(store, clock()));
      const existing = await store.readMeta();
      const autoBackups = [current, ...existing.autoBackups].slice(0, AUTO_BACKUPS);
      const activeProfileId = payload.meta.activeProfileId ?? payload.profiles[0]?.profile.id ?? null;
      await store.replaceAll({ ...payload.meta, activeProfileId, autoBackups }, payload.profiles);
      onReplaced();
    },
    [clock, store, onReplaced],
  );

  const today = localDay(clock());
  const reference = meta.lastBackupAt ?? profile.createdAt;
  const needsBackupReminder = daysBetween(localDay(new Date(reference)), today) >= BACKUP_REMINDER_DAYS;

  const api = useMemo<GameApi>(
    () => ({
      profile,
      state,
      today,
      persistent: store.persistent,
      writeFailed,
      lastBackupAt: meta.lastBackupAt,
      needsBackupReminder,
      dispatch,
      draftFor,
      saveDraft,
      exportBackup,
      checkPin,
      importBackup,
    }),
    [profile, state, today, store.persistent, writeFailed, meta.lastBackupAt, needsBackupReminder, dispatch, draftFor, saveDraft, exportBackup, checkPin, importBackup],
  );

  return (
    <GameContext.Provider value={api}>
      <ErrorLogContext.Provider value={logError}>{children}</ErrorLogContext.Provider>
    </GameContext.Provider>
  );
}
```

- [ ] **Step 5: Chạy test, xác nhận thành công**

Run: `npx vitest run src/ui src/i18n && npm test && npm run typecheck`
Expected: PASS toàn bộ, kể cả test i18n về khóa và placeholder giống nhau.

- [ ] **Step 6: Commit**

```bash
git add src/i18n src/ui/contexts.tsx src/ui/useExplain.ts src/ui/GameProvider.tsx src/ui/GameProvider.test.tsx src/test/renderGame.tsx
git commit -F - <<'EOF'
feat(ui): add GameProvider with queued saves, drafts, error log, backups and M2 strings

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 8: Màn hình chào hỏi

**Files:**
- Create: `src/ui/OnboardingScreen.tsx`
- Modify: `src/styles.css`
- Test: `src/ui/OnboardingScreen.test.tsx`

**Interfaces:**
- Consumes: `GameStore`, `LoadedGame`, `StoredProfile` (Task 4); `hashPin`, `isValidPin` (Task 5); `requestPersistence` (Task 6); `initialGameState`, `localDay` (Task 1); `Robot`.
- Produces: `<OnboardingScreen store clock onCreated(loaded: LoadedGame) requestPersist?>`. Tạo hồ sơ với `id = crypto.randomUUID()`, tên con đã cắt khoảng trắng, tên robot (rỗng thì là "Robo"), `state.settings.uiLang` theo ngôn ngữ đang chọn; ghi `meta.pin`; gọi `requestPersist()`; rồi `onCreated(await store.loadActive())`.

- [ ] **Step 1: Viết test thất bại**

`src/ui/OnboardingScreen.test.tsx`:

```tsx
// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { MemoryStore } from "../storage/memoryStore";
import { verifyPin } from "../storage/pin";
import { renderWithApp } from "../test/render";
import { FIXED_NOW } from "../test/renderGame";
import { OnboardingScreen } from "./OnboardingScreen";

async function fill(name: string, pin: string, pinAgain = pin) {
  await userEvent.type(screen.getByLabelText("Tên của con"), name);
  await userEvent.type(screen.getByLabelText("Mã PIN của bố mẹ (4 đến 6 chữ số)"), pin);
  await userEvent.type(screen.getByLabelText("Nhập lại mã PIN"), pinAgain);
}

describe("OnboardingScreen", () => {
  test("creates the profile, the PIN and the starting state", async () => {
    const store = new MemoryStore();
    const onCreated = vi.fn();
    const requestPersist = vi.fn(async () => true);
    renderWithApp(<OnboardingScreen store={store} clock={() => FIXED_NOW} onCreated={onCreated} requestPersist={requestPersist} />);
    expect(screen.getByRole("heading", { name: "Chào mừng đến với Py-Pet!" })).toBeInTheDocument();
    expect(screen.getByLabelText("Tên robot")).toHaveValue("Robo");
    await fill("  An  ", "2468");
    await userEvent.click(screen.getByRole("button", { name: "Bắt đầu" }));
    await waitFor(() => expect(onCreated).toHaveBeenCalledOnce());
    const loaded = onCreated.mock.calls[0]![0];
    expect(loaded.profile).toMatchObject({ childName: "An", robotName: "Robo", createdAt: FIXED_NOW.toISOString() });
    expect(loaded.state.settings.uiLang).toBe("vi");
    expect(loaded.state.week.start).toBe("2026-10-05");
    const meta = await store.readMeta();
    expect(await verifyPin("2468", meta.pin!)).toBe(true);
    expect(requestPersist).toHaveBeenCalledOnce();
  });

  test("the language choice switches the screen and is saved", async () => {
    const store = new MemoryStore();
    const onCreated = vi.fn();
    renderWithApp(<OnboardingScreen store={store} clock={() => FIXED_NOW} onCreated={onCreated} requestPersist={async () => true} />);
    await userEvent.click(screen.getByRole("button", { name: "English" }));
    expect(screen.getByRole("heading", { name: "Welcome to Py-Pet!" })).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Your name"), "Mai");
    await userEvent.clear(screen.getByLabelText("Robot name"));
    await userEvent.type(screen.getByLabelText("Parent PIN (4 to 6 digits)"), "1234");
    await userEvent.type(screen.getByLabelText("Type the PIN again"), "1234");
    await userEvent.click(screen.getByRole("button", { name: "Start" }));
    await waitFor(() => expect(onCreated).toHaveBeenCalledOnce());
    expect(onCreated.mock.calls[0]![0].state.settings.uiLang).toBe("en");
    expect(onCreated.mock.calls[0]![0].profile.robotName).toBe("Robo");
  });

  test.each([
    ["", "1234", "1234", "Con hãy nhập tên nhé."],
    ["An", "12", "12", "Mã PIN phải gồm 4 đến 6 chữ số."],
    ["An", "1234", "4321", "Hai mã PIN chưa giống nhau."],
  ])("rejects name %j with PIN %j / %j", async (name, pin, again, message) => {
    const onCreated = vi.fn();
    renderWithApp(<OnboardingScreen store={new MemoryStore()} clock={() => FIXED_NOW} onCreated={onCreated} requestPersist={async () => true} />);
    if (name) await userEvent.type(screen.getByLabelText("Tên của con"), name);
    await userEvent.type(screen.getByLabelText("Mã PIN của bố mẹ (4 đến 6 chữ số)"), pin);
    await userEvent.type(screen.getByLabelText("Nhập lại mã PIN"), again);
    await userEvent.click(screen.getByRole("button", { name: "Bắt đầu" }));
    expect(screen.getByRole("alert")).toHaveTextContent(message);
    expect(onCreated).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/ui/OnboardingScreen.test.tsx`
Expected: FAIL vì chưa có `./OnboardingScreen`.

- [ ] **Step 3: Viết code**

`src/ui/OnboardingScreen.tsx`:

```tsx
import { useState, type FormEvent } from "react";
import { localDay } from "../game/dates";
import { initialGameState } from "../game/state";
import { useLang } from "../i18n/LangProvider";
import type { MessageKey } from "../i18n/vi";
import { requestPersistence } from "../storage/bootstrap";
import { hashPin, isValidPin } from "../storage/pin";
import type { GameStore, LoadedGame, StoredProfile } from "../storage/types";
import { Robot } from "./Robot";

export interface OnboardingProps {
  store: GameStore;
  clock: () => Date;
  onCreated(loaded: LoadedGame): void;
  requestPersist?: () => Promise<boolean>;
}

export function OnboardingScreen({ store, clock, onCreated, requestPersist = requestPersistence }: OnboardingProps) {
  const { t, uiLang, setUiLang } = useLang();
  const [childName, setChildName] = useState("");
  const [robotName, setRobotName] = useState("Robo");
  const [pin, setPin] = useState("");
  const [pinAgain, setPinAgain] = useState("");
  const [error, setError] = useState<MessageKey | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!childName.trim()) return setError("onboarding.errorName");
    if (!isValidPin(pin)) return setError("onboarding.errorPin");
    if (pin !== pinAgain) return setError("onboarding.errorPinMatch");
    setError(null);
    setBusy(true);
    const now = clock();
    const profile: StoredProfile = {
      id: crypto.randomUUID(),
      childName: childName.trim(),
      robotName: robotName.trim() || "Robo",
      createdAt: now.toISOString(),
    };
    const state = initialGameState(localDay(now));
    state.settings.uiLang = uiLang;
    await store.createProfile(profile, state);
    await store.writeMeta({ pin: await hashPin(pin) });
    void requestPersist();
    const loaded = await store.loadActive();
    if (loaded) onCreated(loaded);
  }

  return (
    <main className="onboarding">
      <Robot mood="happy" size={96} />
      <h1>{t("onboarding.title")}</h1>
      <form onSubmit={submit}>
        <div role="group" aria-label={t("onboarding.language")} className="lang-switch">
          <button type="button" aria-pressed={uiLang === "vi"} onClick={() => setUiLang("vi")}>
            {t("onboarding.langVi")}
          </button>
          <button type="button" aria-pressed={uiLang === "en"} onClick={() => setUiLang("en")}>
            {t("onboarding.langEn")}
          </button>
        </div>
        <label>
          {t("onboarding.childName")}
          <input value={childName} maxLength={30} onChange={(e) => setChildName(e.target.value)} />
        </label>
        <label>
          {t("onboarding.robotName")}
          <input value={robotName} maxLength={20} onChange={(e) => setRobotName(e.target.value)} />
        </label>
        <label>
          {t("onboarding.pin")}
          <input type="password" inputMode="numeric" autoComplete="new-password" value={pin} onChange={(e) => setPin(e.target.value)} />
        </label>
        <label>
          {t("onboarding.pinConfirm")}
          <input type="password" inputMode="numeric" autoComplete="new-password" value={pinAgain} onChange={(e) => setPinAgain(e.target.value)} />
        </label>
        {error && <p role="alert">{t(error)}</p>}
        <button className="primary" type="submit" disabled={busy}>
          {t("onboarding.start")}
        </button>
      </form>
    </main>
  );
}
```

Nối vào cuối `src/styles.css`:

```css
.onboarding, .backup { max-width: 560px; margin: 0 auto; padding: 24px; text-align: center; }
.onboarding form, .backup form { display: grid; gap: 12px; text-align: left; margin-top: 16px; }
.onboarding label, .backup label { display: grid; gap: 4px; font-weight: 600; }
.onboarding input, .backup input { font: inherit; padding: 8px 10px; border: 1px solid var(--border); border-radius: 6px; }
[role="alert"] { color: var(--danger); }
```

- [ ] **Step 4: Chạy test, xác nhận thành công**

Run: `npx vitest run src/ui/OnboardingScreen.test.tsx && npm run typecheck`
Expected: PASS toàn bộ (băm PIN 100 000 vòng mất khoảng dưới 1 giây mỗi test).

- [ ] **Step 5: Commit**

```bash
git add src/ui/OnboardingScreen.tsx src/ui/OnboardingScreen.test.tsx src/styles.css
git commit -F - <<'EOF'
feat(ui): add the first-run screen for language, names and parent PIN

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 9: Ghép app với lưu trữ

**Files:**
- Create: `src/ui/GameRoot.tsx`, `src/ui/SecondTabScreen.tsx`, `src/ui/Banners.tsx`
- Modify: `src/ui/App.tsx`, `src/ui/AppRoutes.tsx`, `src/ui/HomeScreen.tsx`, `src/ui/LessonScreen.tsx`, `src/main.tsx`, `src/styles.css`, `e2e/lesson.spec.ts`
- Test: `src/ui/AppRoutes.test.tsx` (viết lại), `src/ui/LessonScreen.test.tsx` (sửa), `src/ui/Banners.test.tsx`

**Interfaces:**
- Consumes: Task 4 đến 8.
- Produces:
  - `interface AppProps { bundle: ContentBundle; runnerClient: RunnerClient; store: GameStore; ownsTab?: boolean; clock?: () => Date; onReplaced?: () => void }`, `<App ...>`.
  - `<GameRoot store clock onReplaced>`: đang đọc thì hiện "Đang mở hồ sơ..."; chưa có hồ sơ thì hiện `OnboardingScreen`; có hồ sơ thì hiện `GameProvider` + `AppRoutes`.
  - `<SecondTabScreen>`, `<Banners>`.
  - `LessonScreen` bỏ prop `onComplete`; bước cuối gọi `game.dispatch({ type: "LessonCompleted", lessonId })`. Props còn `{ lesson, onExit }`.
  - `HomeScreen` bỏ prop `completed`, đọc `game.state.progress.completedLessons`.
  - e2e helper `startApp(page)` đi qua màn hình chào hỏi (tên "An", PIN "1234").

- [ ] **Step 1: Viết test thất bại**

`src/ui/Banners.test.tsx`:

```tsx
// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { MemoryStore } from "../storage/memoryStore";
import { renderWithGame } from "../test/renderGame";
import { Banners } from "./Banners";

test("shows the storage banners", async () => {
  await renderWithGame(<Banners />, {
    store: new MemoryStore({ persistent: false }),
    meta: { lastBackupAt: new Date(2026, 8, 20, 9).toISOString() },
  });
  expect(screen.getByText("Trình duyệt đang chặn lưu dữ liệu. Tiến độ sẽ không được lưu.")).toBeInTheDocument();
  expect(screen.getByText(/Đã 7 ngày chưa sao lưu\./)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Sao lưu ngay" })).toHaveAttribute("href", "#/backup");
});

test("shows nothing when everything is fine", async () => {
  const { container } = await renderWithGame(<Banners />, { meta: { lastBackupAt: new Date(2026, 9, 5, 9).toISOString() } });
  expect(container.querySelector(".banner")).toBeNull();
});
```

Thay toàn bộ `src/ui/AppRoutes.test.tsx`:

```tsx
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
```

Sửa `src/ui/LessonScreen.test.tsx`: đổi `import { fakeRunner, okResult, renderWithApp } from "../test/render";` thành `import { fakeRunner, okResult } from "../test/render";` và thêm `import { renderWithGame } from "../test/renderGame";`; thay mọi `renderWithApp(<LessonScreen lesson={...} onComplete={...} onExit={...} />, options)` bằng `await renderWithGame(<LessonScreen lesson={...} onExit={...} />, options)`. Trong test đầu tiên, bỏ `const onComplete = vi.fn();` và thay `expect(onComplete).toHaveBeenCalledWith("t.l1");` bằng:

```tsx
  await waitFor(async () => expect((await store.loadActive())?.state.progress.completedLessons).toEqual(["t.l1"]));
```

với `const { store } = await renderWithGame(...)` ở đầu test và `waitFor` import từ `@testing-library/react`.

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/ui/Banners.test.tsx src/ui/AppRoutes.test.tsx src/ui/LessonScreen.test.tsx`
Expected: FAIL vì chưa có `./Banners`, App chưa nhận `store`, LessonScreen chưa dùng game.

- [ ] **Step 3: Viết code**

`src/ui/Banners.tsx`:

```tsx
import { useLang } from "../i18n/LangProvider";
import { useGame } from "./GameProvider";

export function Banners() {
  const game = useGame();
  const { t } = useLang();
  return (
    <div className="banners">
      {!game.persistent && (
        <p role="alert" className="banner banner-danger">
          {t("banner.notPersistent")}
        </p>
      )}
      {game.writeFailed && (
        <p role="alert" className="banner banner-danger">
          {t("banner.writeFailed")} <a href="#/backup">{t("banner.backupNow")}</a>
        </p>
      )}
      {game.needsBackupReminder && (
        <p className="banner">
          {t("banner.backupReminder")} <a href="#/backup">{t("banner.backupNow")}</a>
        </p>
      )}
    </div>
  );
}
```

`src/ui/SecondTabScreen.tsx`:

```tsx
import { useLang } from "../i18n/LangProvider";
import { Robot } from "./Robot";

export function SecondTabScreen() {
  const { t } = useLang();
  return (
    <main className="crash">
      <Robot mood="neutral" size={80} />
      <p>{t("app.otherTab")}</p>
    </main>
  );
}
```

`src/ui/GameRoot.tsx`:

```tsx
import { useEffect, useState } from "react";
import { useLang } from "../i18n/LangProvider";
import type { GameStore, LoadedGame } from "../storage/types";
import { AppRoutes } from "./AppRoutes";
import { GameProvider } from "./GameProvider";
import { Header } from "./Header";
import { OnboardingScreen } from "./OnboardingScreen";

export function GameRoot({ store, clock, onReplaced }: { store: GameStore; clock: () => Date; onReplaced(): void }) {
  const { t } = useLang();
  const [loaded, setLoaded] = useState<LoadedGame | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    store.loadActive().then(
      (result) => {
        if (alive) setLoaded(result);
      },
      () => {
        if (alive) setLoaded(null);
      },
    );
    return () => {
      alive = false;
    };
  }, [store]);

  if (loaded === undefined) {
    return (
      <>
        <Header />
        <main className="room">
          <p>{t("app.loading")}</p>
        </main>
      </>
    );
  }
  if (loaded === null) {
    return (
      <>
        <Header />
        <OnboardingScreen store={store} clock={clock} onCreated={setLoaded} />
      </>
    );
  }
  return (
    <GameProvider store={store} loaded={loaded} clock={clock} onReplaced={onReplaced}>
      <AppRoutes />
    </GameProvider>
  );
}
```

Thay toàn bộ `src/ui/App.tsx`:

```tsx
import type { ContentBundle } from "../content/types";
import type { RunnerClient } from "../runner/client";
import type { GameStore } from "../storage/types";
import { AppProviders } from "./contexts";
import { GameRoot } from "./GameRoot";
import { SecondTabScreen } from "./SecondTabScreen";
import { useRunnerClient } from "./useRunnerClient";

export interface AppProps {
  bundle: ContentBundle;
  runnerClient: RunnerClient;
  store: GameStore;
  ownsTab?: boolean;
  clock?: () => Date;
  onReplaced?: () => void;
}

const systemClock = () => new Date();
const reloadPage = () => window.location.reload();

export function App({ bundle, runnerClient, store, ownsTab = true, clock = systemClock, onReplaced = reloadPage }: AppProps) {
  const runner = useRunnerClient(runnerClient);
  return (
    <AppProviders bundle={bundle} runner={runner}>
      {ownsTab ? <GameRoot store={store} clock={clock} onReplaced={onReplaced} /> : <SecondTabScreen />}
    </AppProviders>
  );
}
```

Trong `src/ui/AppRoutes.tsx`: xóa `useState` và state `completed`; thêm `import { Banners } from "./Banners";`; render `<HomeScreen />` (không prop); render `<LessonScreen key={lesson.id} lesson={lesson} onExit={() => navigate({ name: "home" })} />`; trong phần return thêm `<Banners />` ngay sau `<Header />`.

Trong `src/ui/HomeScreen.tsx`: đổi chữ ký thành `export function HomeScreen()`; thêm `import { useGame } from "./GameProvider";` và ở đầu hàm `const completed = new Set(useGame().state.progress.completedLessons);`. Phần còn lại giữ nguyên.

Trong `src/ui/LessonScreen.tsx`: bỏ `onComplete` khỏi `LessonScreenProps` và tham số; thêm `import { useGame } from "./GameProvider";` và `const game = useGame();` ở đầu hàm; trong `next()` thay `onComplete(lesson.id);` bằng `game.dispatch({ type: "LessonCompleted", lessonId: lesson.id });`.

Thay toàn bộ `src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { contentBundle } from "./content/bundle";
import { translate } from "./i18n/translate";
import { createBrowserRunner } from "./runner/browser";
import { acquireTabLock, openGameStore } from "./storage/bootstrap";
import { App } from "./ui/App";
import { isBrowserSupported } from "./ui/browserSupport";
import "./styles.css";

const container = document.getElementById("root");
if (!container) throw new Error("Missing #root element");
const root = createRoot(container);

async function start() {
  const [store, ownsTab] = await Promise.all([openGameStore(), acquireTabLock()]);
  root.render(
    <StrictMode>
      <App bundle={contentBundle} runnerClient={createBrowserRunner()} store={store} ownsTab={ownsTab} />
    </StrictMode>,
  );
}

if (isBrowserSupported()) {
  void start();
} else {
  root.render(<p className="crash">{translate("vi", "browser.unsupported")}</p>);
}
```

Nối vào cuối `src/styles.css`:

```css
.banners { max-width: 1200px; margin: 8px auto 0; padding: 0 20px; display: grid; gap: 6px; }
.banner { margin: 0; padding: 8px 12px; border-radius: var(--radius); background: #fff8ea; border: 1px solid #f0d9a8; }
.banner-danger { background: #fdecec; border-color: var(--danger); }
```

- [ ] **Step 4: Sửa e2e cho màn hình chào hỏi**

Trong `e2e/lesson.spec.ts`, thêm helper và dùng nó thay cho mọi `await page.goto("./");` (trong `openFirstExercise` và trong test đầu tiên):

```ts
async function startApp(page: Page) {
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Chào mừng đến với Py-Pet!" })).toBeVisible();
  await page.getByLabel("Tên của con").fill("An");
  await page.getByLabel("Mã PIN của bố mẹ (4 đến 6 chữ số)").fill("1234");
  await page.getByLabel("Nhập lại mã PIN").fill("1234");
  await page.getByRole("button", { name: "Bắt đầu" }).click();
}
```

Lệnh `await expect(page.getByText("Robo sẵn sàng")).toBeVisible({ timeout: 60_000 });` vẫn giữ ngay sau `startApp(page)`.

- [ ] **Step 5: Chạy toàn bộ kiểm tra**

Run: `npm run check`
Expected: typecheck sạch; Vitest PASS; pytest PASS; nội dung hợp lệ; Playwright 5/5 PASS.

- [ ] **Step 6: Commit**

```bash
git add src/ui src/main.tsx src/styles.css e2e/lesson.spec.ts
git commit -F - <<'EOF'
feat(ui): load or create the profile on start, persist lesson completion, add banners

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 10: Robot và Phòng robot

**Files:**
- Create: `src/ui/RoomScreen.tsx`
- Modify: `src/ui/Robot.tsx`, `src/ui/AppRoutes.tsx`, `src/i18n/vi.ts`, `src/i18n/en.ts`, `src/styles.css`, `e2e/lesson.spec.ts`, `src/ui/AppRoutes.test.tsx`
- Delete: `src/ui/HomeScreen.tsx`
- Test: `src/ui/RoomScreen.test.tsx`, `src/ui/shell.test.tsx` (thêm 1 test)

**Interfaces:**
- Consumes: Task 3 (`currentStage`, `stageXpMax`, `growthPercent`, `growthSize`, `petCondition`, `nextLessonId`, `displayStreak`, `todayPoints`, `weekLessons`), `useGame`.
- Produces:
  - `type RobotMood = "happy" | "neutral" | "sad" | "thinking" | "sleepy" | "drained"`.
  - `ROBOT_SIZES: Record<GrowthSize, number> = { 1: 96, 2: 128, 3: 160 }`, `CONDITION_MOOD: Record<PetCondition, RobotMood>`, `<RoomScreen>` ở route `#/`.
  - Xóa khóa `home.title`, `home.done` (không còn dùng).

- [ ] **Step 1: Viết test thất bại**

`src/ui/RoomScreen.test.tsx`:

```tsx
// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { initialGameState } from "../game/state";
import { renderWithGame, TODAY } from "../test/renderGame";
import { RoomScreen } from "./RoomScreen";

describe("RoomScreen", () => {
  test("shows the robot, the stats, the goals and the next lesson", async () => {
    await renderWithGame(<RoomScreen />);
    expect(screen.getByRole("heading", { name: "Phòng của Robo" })).toBeInTheDocument();
    expect(screen.getByText("Chào An!")).toBeInTheDocument();
    expect(screen.getByText("Robo đang rất vui!")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Robo" })).toHaveAttribute("data-mood", "happy");
    expect(screen.getByRole("img", { name: "Robo" })).toHaveAttribute("width", "96");
    expect(screen.getByText("Pin: 4/5")).toBeInTheDocument();
    expect(screen.getByText("Vui: 4/5")).toBeInTheDocument();
    expect(screen.getByText("Lớn lên: 0%")).toBeInTheDocument();
    expect(screen.getByText("Mục tiêu hôm nay: 0/2")).toBeInTheDocument();
    expect(screen.getByText("Tuần này: 0/10 bài")).toBeInTheDocument();
    expect(screen.getByText("Chuỗi: 0 ngày")).toBeInTheDocument();
    expect(screen.getByText("Thẻ giữ chuỗi: 0")).toBeInTheDocument();
    expect(screen.getByText("Xu: 0")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Học tiếp" })).toHaveAttribute("href", "#/lesson/t.l1");
    expect(screen.getByRole("link", { name: "Bản đồ học" })).toHaveAttribute("href", "#/map");
    expect(screen.getByRole("link", { name: "Sao lưu" })).toHaveAttribute("href", "#/backup");
  });

  test("a grown, tired robot after progress and absence", async () => {
    const state = initialGameState(TODAY);
    state.pet.xp = 30;
    state.pet.pin = 0;
    state.wallet.xu = 75;
    state.progress.completedLessons = ["t.l1", "t.l2"];
    await renderWithGame(<RoomScreen />, { state });
    expect(screen.getByRole("img", { name: "Robo" })).toHaveAttribute("data-mood", "drained");
    expect(screen.getByRole("img", { name: "Robo" })).toHaveAttribute("width", "160");
    expect(screen.getByText("Robo hết pin rồi. Con học 1 bài để sạc cho Robo nhé!")).toBeInTheDocument();
    expect(screen.getByText("Lớn lên: 79%")).toBeInTheDocument();
    expect(screen.getByText("Xu: 75")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Học tiếp" })).not.toBeInTheDocument();
    expect(screen.getByText("Con đã học hết các bài hiện có. Robo chờ bài mới nhé!")).toBeInTheDocument();
  });
});
```

Thêm vào `src/ui/shell.test.tsx` trong `describe("Robot", ...)`:

```tsx
  test("has sleepy and drained moods", () => {
    render(<Robot mood="sleepy" />);
    render(<Robot mood="drained" />);
    expect(screen.getAllByRole("img", { name: "Robo" }).map((el) => el.getAttribute("data-mood"))).toEqual(["sleepy", "drained"]);
  });
```

Trong `src/ui/AppRoutes.test.tsx`: test "lists the lessons and opens one" đổi thành mở bài bằng nút "Học tiếp":

```tsx
  test("the room opens the next lesson", async () => {
    await renderWithGame(<AppRoutes />);
    expect(screen.getByRole("heading", { name: "Phòng của Robo" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("link", { name: "Học tiếp" }));
    expect(await screen.findByText("Thẻ 1/2")).toBeInTheDocument();
  });
```

Test "a finished lesson is saved and shown as done" đổi thành (bài thử 1 đã xong sẵn, nên "Học tiếp" mở bài thử 2; không mở bằng URL vì Task 11 sẽ khóa bài chưa tới lượt):

```tsx
  test("a finished lesson is saved and counted in today's goal", async () => {
    const state = initialGameState(TODAY);
    state.progress.completedLessons = ["t.l1"];
    const { store } = await renderWithGame(<AppRoutes />, { state });
    await userEvent.click(screen.getByRole("link", { name: "Học tiếp" }));
    await userEvent.click(await screen.findByRole("button", { name: "Hoàn thành" }));
    await userEvent.click(screen.getByRole("button", { name: "Về danh sách bài" }));
    expect(await screen.findByText("Mục tiêu hôm nay: 1/2")).toBeInTheDocument();
    expect((await store.loadActive())?.state.progress.completedLessons).toEqual(["t.l1", "t.l2"]);
  });
```

Trong describe "App", test "an existing profile opens the app directly" đổi khẳng định thành `expect(await screen.findByRole("heading", { name: "Phòng của Robo" })).toBeInTheDocument();`.

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/ui/RoomScreen.test.tsx src/ui/shell.test.tsx src/ui/AppRoutes.test.tsx`
Expected: FAIL vì chưa có `./RoomScreen` và mood mới.

- [ ] **Step 3: Viết code**

Trong `src/ui/Robot.tsx`: đổi `export type RobotMood = "happy" | "neutral" | "sad" | "thinking";` thành `export type RobotMood = "happy" | "neutral" | "sad" | "thinking" | "sleepy" | "drained";` và thêm 2 mục vào `EYES`:

```tsx
  sleepy: <path d="M20 21 h6 M30 21 h6" stroke="#6ff" strokeWidth="2" />,
  drained: (
    <>
      <circle cx="23" cy="20" r="2.5" fill="#4a5578" />
      <circle cx="33" cy="20" r="2.5" fill="#4a5578" />
    </>
  ),
```

`src/ui/RoomScreen.tsx`:

```tsx
import {
  currentStage,
  displayStreak,
  growthPercent,
  growthSize,
  nextLessonId,
  petCondition,
  stageXpMax,
  todayPoints,
  weekLessons,
  type GrowthSize,
  type PetCondition,
} from "../game/progress";
import { STAT_MAX } from "../game/state";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";
import { Robot, type RobotMood } from "./Robot";
import { routeToHash } from "./routing";

export const ROBOT_SIZES: Record<GrowthSize, number> = { 1: 96, 2: 128, 3: 160 };

export const CONDITION_MOOD: Record<PetCondition, RobotMood> = {
  happy: "happy",
  normal: "neutral",
  sleepy: "sleepy",
  drained: "drained",
};

export function RoomScreen() {
  const game = useGame();
  const bundle = useContent();
  const { t } = useLang();
  const { state, profile, today } = game;
  const stage = currentStage(bundle, state);
  const max = stage ? stageXpMax(stage) : 0;
  const condition = petCondition(state);
  const nextId = nextLessonId(bundle, state);

  return (
    <main className="room">
      <h1>{t("room.title", { name: profile.robotName })}</h1>
      <p>{t("room.greeting", { child: profile.childName })}</p>
      <div className={`room-scene condition-${condition}`}>
        <Robot mood={CONDITION_MOOD[condition]} size={ROBOT_SIZES[growthSize(state.pet.xp, max)]} />
        <p className="pet-says">{t(`pet.${condition}`, { name: profile.robotName })}</p>
      </div>
      <ul className="room-stats">
        <li>
          {t("room.pin")}: {state.pet.pin}/{STAT_MAX}
        </li>
        <li>
          {t("room.vui")}: {state.pet.vui}/{STAT_MAX}
        </li>
        <li>
          {t("room.growth")}: {growthPercent(state.pet.xp, max)}%
        </li>
      </ul>
      <ul className="room-goals">
        <li>{t("room.today", { done: todayPoints(state, today), goal: state.settings.dailyGoal })}</li>
        <li>{t("room.week", { done: weekLessons(state, today), target: state.settings.weeklyTarget })}</li>
        <li>{t("room.streak", { days: displayStreak(state, today) })}</li>
        <li>{t("room.freezes", { count: state.streak.freezes })}</li>
        <li>{t("room.xu", { xu: state.wallet.xu })}</li>
      </ul>
      <nav className="room-actions">
        {nextId ? (
          <a className="button primary" href={routeToHash({ name: "lesson", lessonId: nextId })}>
            {t("room.continue")}
          </a>
        ) : (
          <p>{t("room.allDone")}</p>
        )}
        <a className="button" href="#/map">
          {t("room.map")}
        </a>
        <a className="button" href="#/backup">
          {t("room.backup")}
        </a>
      </nav>
    </main>
  );
}
```

Ghi chú: `{t("room.pin")}: {state.pet.pin}/{STAT_MAX}` tạo nhiều nút chữ trong cùng 1 `<li>`; Testing Library ghép chúng lại nên `getByText("Pin: 4/5")` khớp.

Trong `src/ui/AppRoutes.tsx`: đổi `import { HomeScreen } from "./HomeScreen";` thành `import { RoomScreen } from "./RoomScreen";` và `<HomeScreen />` thành `<RoomScreen />`. Xóa file `src/ui/HomeScreen.tsx`. Xóa 2 khóa `"home.title"` và `"home.done"` khỏi `src/i18n/vi.ts` và `src/i18n/en.ts`.

Nối vào cuối `src/styles.css`:

```css
.room { max-width: 900px; margin: 0 auto; padding: 20px; text-align: center; }
.room-scene { display: grid; justify-items: center; gap: 8px; padding: 16px; border-radius: var(--radius); background: linear-gradient(#e7f0ff 65%, #e8dcc4 65%); }
.room-scene.condition-sleepy, .room-scene.condition-drained { filter: brightness(0.85); }
.pet-says { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 6px 12px; }
.room-stats, .room-goals { list-style: none; padding: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 20px; }
.room-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 12px; }
a.button { display: inline-block; padding: 8px 16px; border-radius: 6px; border: 1px solid var(--border); background: var(--surface); color: var(--text); text-decoration: none; }
a.button.primary { background: var(--primary); border-color: var(--primary); color: #fff; font-size: 1.1rem; }
```

- [ ] **Step 4: Sửa e2e mở bài bằng "Học tiếp"**

Trong `e2e/lesson.spec.ts`, thay mọi `await page.getByRole("link", { name: "Chương trình là gì?" }).click();` bằng:

```ts
  await page.getByRole("link", { name: "Học tiếp" }).click();
```

- [ ] **Step 5: Chạy toàn bộ kiểm tra**

Run: `npm run check`
Expected: PASS toàn bộ, Playwright 5/5.

- [ ] **Step 6: Commit**

```bash
git add -A src/ui src/i18n src/styles.css e2e/lesson.spec.ts
git commit -F - <<'EOF'
feat(ui): replace the lesson list with the robot room, growth and goals

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 11: Bản đồ học

**Files:**
- Create: `src/ui/MapScreen.tsx`
- Modify: `src/ui/routing.ts`, `src/ui/AppRoutes.tsx`, `src/styles.css`
- Test: `src/ui/MapScreen.test.tsx`, `src/ui/routing.test.ts` (thêm), `src/ui/AppRoutes.test.tsx` (thêm)

**Interfaces:**
- Consumes: `lessonStatuses` (Task 3), `useGame`.
- Produces: `type Route = { name: "home" } | { name: "map" } | { name: "backup" } | { name: "lesson"; lessonId: string }` (`#/map`, `#/backup`); `<MapScreen>`; bài học bị khóa mở bằng URL thì hiện "Bài này chưa mở...". Route `backup` tạm hiện Phòng robot cho tới Task 13.

- [ ] **Step 1: Viết test thất bại**

`src/ui/MapScreen.test.tsx`:

```tsx
// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { initialGameState } from "../game/state";
import { renderWithGame, TODAY } from "../test/renderGame";
import { MapScreen } from "./MapScreen";

test("shows done, next and locked lessons", async () => {
  const state = initialGameState(TODAY);
  await renderWithGame(<MapScreen />, { state });
  expect(screen.getByRole("heading", { name: "Bản đồ học" })).toBeInTheDocument();
  const items = screen.getAllByRole("listitem");
  expect(within(items[0]!).getByRole("link", { name: "Bài thử" })).toHaveAttribute("href", "#/lesson/t.l1");
  expect(within(items[0]!).getByText("Bài tiếp theo")).toBeInTheDocument();
  expect(within(items[1]!).queryByRole("link")).not.toBeInTheDocument();
  expect(within(items[1]!).getByText("Chưa mở")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Về phòng" })).toHaveAttribute("href", "#/");
});

test("a done lesson stays open", async () => {
  const state = initialGameState(TODAY);
  state.progress.completedLessons = ["t.l1"];
  await renderWithGame(<MapScreen />, { state });
  const items = screen.getAllByRole("listitem");
  expect(within(items[0]!).getByText("Đã xong")).toBeInTheDocument();
  expect(within(items[1]!).getByRole("link", { name: "Bài thử 2" })).toBeInTheDocument();
});
```

Thêm vào `src/ui/routing.test.ts` trong `describe("routing", ...)`:

```ts
  test("parses the map and backup hashes", () => {
    expect(parseHash("#/map")).toEqual({ name: "map" });
    expect(parseHash("#/backup")).toEqual({ name: "backup" });
    expect(routeToHash({ name: "map" })).toBe("#/map");
    expect(routeToHash({ name: "backup" })).toBe("#/backup");
  });
```

Thêm vào `src/ui/AppRoutes.test.tsx` trong `describe("AppRoutes", ...)`:

```tsx
  test("the map opens from the room and a locked lesson cannot be opened by URL", async () => {
    await renderWithGame(<AppRoutes />);
    await userEvent.click(screen.getByRole("link", { name: "Bản đồ học" }));
    expect(await screen.findByRole("heading", { name: "Bản đồ học" })).toBeInTheDocument();
    window.location.hash = "#/lesson/t.l2";
    expect(await screen.findByText("Bài này chưa mở. Con học các bài trước đã nhé.")).toBeInTheDocument();
  });
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/ui/MapScreen.test.tsx src/ui/routing.test.ts src/ui/AppRoutes.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Viết code**

Trong `src/ui/routing.ts`, thay `Route`, `parseHash`, `routeToHash`:

```ts
export type Route = { name: "home" } | { name: "map" } | { name: "backup" } | { name: "lesson"; lessonId: string };

export function parseHash(hash: string): Route {
  if (hash === "#/map") return { name: "map" };
  if (hash === "#/backup") return { name: "backup" };
  const match = /^#\/lesson\/(.+)$/.exec(hash);
  if (!match) return { name: "home" };
  const raw = match[1] as string;
  try {
    return { name: "lesson", lessonId: decodeURIComponent(raw) };
  } catch {
    return { name: "lesson", lessonId: raw };
  }
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case "lesson":
      return `#/lesson/${encodeURIComponent(route.lessonId)}`;
    case "map":
      return "#/map";
    case "backup":
      return "#/backup";
    default:
      return "#/";
  }
}
```

`src/ui/MapScreen.tsx`:

```tsx
import { lessonStatuses } from "../game/progress";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";
import { routeToHash } from "./routing";

export function MapScreen() {
  const bundle = useContent();
  const game = useGame();
  const { t, uiLang } = useLang();
  const statuses = lessonStatuses(bundle, game.state);
  return (
    <main className="map">
      <h1>{t("map.title")}</h1>
      {bundle.stages.map((stage) => (
        <section key={stage.id}>
          <h2>{pick(stage.title, uiLang)}</h2>
          {stage.topics.map((topic) => (
            <div key={topic.id} className="topic">
              <h3>{pick(topic.title, uiLang)}</h3>
              <ol className="map-path">
                {topic.lessons.map((lesson) => {
                  const status = statuses.get(lesson.id) ?? "locked";
                  const title = pick(lesson.title, uiLang);
                  return (
                    <li key={lesson.id} className={`map-node node-${status}`}>
                      {status === "locked" ? (
                        <span aria-disabled="true">{title}</span>
                      ) : (
                        <a href={routeToHash({ name: "lesson", lessonId: lesson.id })}>{title}</a>
                      )}
                      <span className="node-status">{t(`map.${status}`)}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </section>
      ))}
      <a href="#/">{t("nav.room")}</a>
    </main>
  );
}
```

Thay phần chọn màn hình trong `src/ui/AppRoutes.tsx` bằng:

```tsx
  const game = useGame();
  let screen;
  if (route.name === "map") {
    screen = <MapScreen />;
  } else if (route.name === "lesson") {
    const lesson = findLesson(bundle, route.lessonId);
    if (!lesson) {
      screen = <Notice message={t("lesson.notFound")} />;
    } else if (lessonStatuses(bundle, game.state).get(lesson.id) === "locked") {
      screen = <Notice message={t("lesson.locked")} />;
    } else {
      screen = <LessonScreen key={lesson.id} lesson={lesson} onExit={() => navigate({ name: "home" })} />;
    }
  } else {
    screen = <RoomScreen />;
  }
```

và thêm ở cuối file:

```tsx
function Notice({ message }: { message: string }) {
  const { t } = useLang();
  return (
    <main className="room">
      <p>{message}</p>
      <a href="#/map">{t("room.map")}</a>
    </main>
  );
}
```

cùng các import `useGame` (`./GameProvider`), `MapScreen` (`./MapScreen`), `lessonStatuses` (`../game/progress`).

Nối vào cuối `src/styles.css`:

```css
.map { max-width: 900px; margin: 0 auto; padding: 20px; }
.map-path { list-style: none; padding: 0; display: grid; gap: 8px; justify-items: center; }
.map-node { min-width: 260px; display: flex; justify-content: space-between; gap: 12px; padding: 8px 14px; border-radius: 20px; border: 2px solid var(--border); background: var(--surface); }
.node-done { border-color: var(--success); background: #e6f7ea; }
.node-next { border-color: var(--primary); font-weight: 700; }
.node-locked { color: var(--muted); }
```

- [ ] **Step 4: Chạy test, xác nhận thành công**

Run: `npx vitest run src/ui && npm run typecheck`
Expected: PASS toàn bộ.

- [ ] **Step 5: Commit**

```bash
git add src/ui src/i18n src/styles.css
git commit -F - <<'EOF'
feat(ui): add the lesson map and block locked lessons opened by URL

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 12: Bài học ghi sự kiện, nháp code và màn hình kết quả

**Files:**
- Create: `src/ui/ResultView.tsx`
- Modify: `src/ui/CodeExerciseView.tsx`, `src/ui/QuestionCard.tsx`, `src/ui/LessonScreen.tsx`, `src/i18n/vi.ts`, `src/i18n/en.ts`, `src/styles.css`
- Test: `src/ui/CodeExerciseView.test.tsx` (thêm), `src/ui/QuestionCard.test.tsx` (thêm), `src/ui/LessonScreen.test.tsx` (sửa)

**Interfaces:**
- Consumes: `useGame`, `nextLessonId`, `todayPoints`, `displayStreak` (Task 3), `AttemptInput` (Task 4).
- Produces:
  - `interface JudgedInfo { result: JudgeResult; code: string; failedSubmitsBefore: number; hintsUsed: number; viewedSolution: boolean }`; `CodeExerciseView` thêm props tùy chọn `initialCode?: string`, `onCodeChange?(code: string): void`, `onJudged?(info: JudgedInfo): void` (gọi sau mỗi lần chấm, trước `onComplete`).
  - `QuestionCard` đổi `onAnswered(correct: boolean, detail: { choiceIndex: number; lang: QuestionLang }): void`.
  - `<ResultView before after onExit>`: hiện "+n XP", "+n xu", "Pin +n" (chỉ khi > 0), mục tiêu hôm nay, chuỗi, link "Học bài tiếp" (khi còn bài) và nút "Về phòng".
  - `LessonScreen` gửi `ExerciseJudged` + lượt làm `kind: "code"`, `QuestionAnswered` + lượt làm `kind: "choice"`, dùng `game.draftFor` / `game.saveDraft`, và khi xong hiện `ResultView` (trạng thái trước lấy lúc mở bài).

- [ ] **Step 1: Viết test thất bại**

Thêm vào `src/ui/CodeExerciseView.test.tsx` trong `describe("CodeExerciseView", ...)`:

```tsx
  test("starts from a saved draft and reports edits", async () => {
    const onCodeChange = vi.fn();
    renderWithApp(
      <CodeExerciseView exercise={fixtureCodeExercise} initialCode="print(1)" onCodeChange={onCodeChange} onComplete={() => {}} />,
    );
    expect(editor()).toHaveValue("print(1)");
    await userEvent.type(editor(), "2");
    expect(onCodeChange).toHaveBeenLastCalledWith("print(1)2");
  });

  test("reports every judged submit with the counts before it", async () => {
    const onJudged = vi.fn();
    let stdout = "x\n";
    renderWithApp(<CodeExerciseView exercise={fixtureCodeExercise} onJudged={onJudged} onComplete={() => {}} />, {
      runner: fakeRunner(() => okResult(stdout)),
    });
    await userEvent.click(screen.getByRole("button", { name: "Gợi ý" }));
    await submitOnce();
    stdout = "Hi\n";
    await submitOnce();
    expect(onJudged.mock.calls.map(([info]) => [info.result.status, info.failedSubmitsBefore, info.hintsUsed, info.viewedSolution])).toEqual([
      ["wrong-answer", 0, 1, false],
      ["accepted", 1, 1, false],
    ]);
  });
```

Thêm vào `src/ui/QuestionCard.test.tsx` trong `describe("QuestionCard", ...)`:

```tsx
  test("reports the chosen index and the question language", async () => {
    const onAnswered = vi.fn();
    renderWithApp(<QuestionCard question={fixtureQuestion} onAnswered={onAnswered} />);
    await userEvent.click(screen.getByRole("button", { name: "EN" }));
    await userEvent.click(screen.getByRole("radio", { name: "Error" }));
    await userEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(onAnswered).toHaveBeenCalledWith(false, { choiceIndex: 1, lang: "en" });
  });
```

Thay test đầu tiên của `src/ui/LessonScreen.test.tsx` ("goes through cards, a code exercise and a question, then finishes") bằng:

```tsx
test("goes through the lesson, records the attempts and shows the rewards", async () => {
  const onExit = vi.fn();
  const { store } = await renderWithGame(<LessonScreen lesson={fixtureLesson} onExit={onExit} />, {
    runner: fakeRunner(() => okResult("Hi\n")),
  });

  expect(screen.getByText("Thẻ 1/2")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Tiếp" }));
  await userEvent.click(screen.getByRole("button", { name: "Tiếp" }));
  expect(screen.getByRole("button", { name: "Tiếp" })).toBeDisabled();
  await userEvent.click(screen.getByRole("button", { name: "Nộp bài" }));
  expect(await screen.findByText("Đúng hết 2/2 test!")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Tiếp" }));
  await userEvent.click(screen.getByRole("radio", { name: "A" }));
  await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
  await userEvent.click(screen.getByRole("button", { name: "Hoàn thành" }));

  expect(screen.getByText("Hoàn thành bài học!")).toBeInTheDocument();
  expect(screen.getByText("+28 XP")).toBeInTheDocument();
  expect(screen.getByText("+8 xu")).toBeInTheDocument();
  expect(screen.getByText("Pin +1")).toBeInTheDocument();
  expect(screen.getByText("Mục tiêu hôm nay: 1/2")).toBeInTheDocument();
  expect(screen.getByText("Chuỗi: 0 ngày")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Học bài tiếp" })).toHaveAttribute("href", "#/lesson/t.l2");

  await waitFor(async () => expect((await store.loadActive())?.state.pet.xp).toBe(28));
  const [bundle] = await store.exportProfiles();
  expect(bundle!.attempts.map((a) => [a.kind, a.itemId])).toEqual([
    ["code", "t.l1.ex1"],
    ["choice", "t.l1.q1"],
  ]);
  await userEvent.click(screen.getByRole("button", { name: "Về phòng" }));
  expect(onExit).toHaveBeenCalledOnce();
});

test("restores and saves the code draft of an exercise", async () => {
  const { store } = await renderWithGame(<LessonScreen lesson={{ ...fixtureLesson, cards: [] }} onExit={() => {}} />, {
    drafts: { "t.l1.ex1": "print(42)" },
  });
  const editor = screen.getByRole("textbox", { name: "Trình soạn code" });
  expect(editor).toHaveValue("print(42)");
  await userEvent.type(editor, "!");
  await waitFor(async () => expect((await store.loadActive())?.drafts.get("t.l1.ex1")).toBe("print(42)!"));
});
```

Trong `src/ui/AppRoutes.test.tsx`, test "a finished lesson is saved and counted in today's goal" đổi `"Về danh sách bài"` thành `"Về phòng"`. Sau Task 12, khóa `lesson.backHome` không còn chỗ nào dùng (Task 11 đã thay nó trong `Notice`): xóa khóa này khỏi `src/i18n/vi.ts` và `src/i18n/en.ts` ở Step 3.

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/ui`
Expected: FAIL ở các test mới.

- [ ] **Step 3: Viết code**

Trong `src/ui/CodeExerciseView.tsx`:

1. Thêm kiểu và props:

```tsx
export interface JudgedInfo {
  result: JudgeResult;
  code: string;
  failedSubmitsBefore: number;
  hintsUsed: number;
  viewedSolution: boolean;
}
```

và đổi chữ ký component thành:

```tsx
export function CodeExerciseView({
  exercise,
  onComplete,
  initialCode,
  onCodeChange,
  onJudged,
}: {
  exercise: CodeExercise;
  onComplete(outcome: ExerciseOutcome): void;
  initialCode?: string;
  onCodeChange?(code: string): void;
  onJudged?(info: JudgedInfo): void;
}) {
```

2. `const [code, setCode] = useState(exercise.starter);` đổi thành `const [code, setCode] = useState(initialCode ?? exercise.starter);`.
3. Ngay sau `setJudgeResult(result);` trong `handleSubmit` thêm:

```tsx
      onJudged?.({ result, code, failedSubmitsBefore: failedSubmits, hintsUsed: hintsShown, viewedSolution: solutionShown });
```

4. Prop `onChange` của `<CodeEditor>` đổi thành:

```tsx
onChange={(value) => {
  setCode(value);
  onCodeChange?.(value);
}}
```

Trong `src/ui/QuestionCard.tsx`: đổi kiểu prop thành `onAnswered(correct: boolean, detail: { choiceIndex: number; lang: QuestionLang }): void;` và trong `check()` đổi `onAnswered(isCorrect);` thành `onAnswered(isCorrect, { choiceIndex: selected, lang });`.

`src/ui/ResultView.tsx`:

```tsx
import { displayStreak, nextLessonId, todayPoints } from "../game/progress";
import type { GameState } from "../game/state";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";
import { Robot } from "./Robot";
import { routeToHash } from "./routing";

export function ResultView({ before, after, onExit }: { before: GameState; after: GameState; onExit(): void }) {
  const { t } = useLang();
  const bundle = useContent();
  const { today } = useGame();
  const xp = after.pet.xp - before.pet.xp;
  const xu = after.wallet.xu - before.wallet.xu;
  const pin = after.pet.pin - before.pet.pin;
  const nextId = nextLessonId(bundle, after);
  return (
    <main className="lesson-done">
      <Robot mood="happy" size={96} />
      <h2>{t("lesson.doneTitle")}</h2>
      <p>{t("lesson.doneBody")}</p>
      <ul className="result-rewards">
        {xp > 0 && <li>{t("result.xp", { n: xp })}</li>}
        {xu > 0 && <li>{t("result.xu", { n: xu })}</li>}
        {pin > 0 && <li>{t("result.pin", { n: pin })}</li>}
      </ul>
      <p>{t("room.today", { done: todayPoints(after, today), goal: after.settings.dailyGoal })}</p>
      <p>{t("room.streak", { days: displayStreak(after, today) })}</p>
      <nav className="room-actions">
        {nextId && (
          <a className="button primary" href={routeToHash({ name: "lesson", lessonId: nextId })}>
            {t("result.next")}
          </a>
        )}
        <button onClick={onExit}>{t("nav.room")}</button>
      </nav>
    </main>
  );
}
```

Trong `src/ui/LessonScreen.tsx`:

1. Thêm `import { ResultView } from "./ResultView";`, thêm `const [before] = useState(() => game.state);` ngay sau `const game = useGame();`, xóa import `Robot` nếu không còn dùng.
2. Thay toàn bộ khối `if (finished || step === undefined) { return (...); }` bằng:

```tsx
  if (finished || step === undefined) {
    return <ResultView before={before} after={game.state} onExit={onExit} />;
  }
```

3. Thay khối dựng `body` cho bài tập bằng:

```tsx
  } else if (step.exercise.type === "code") {
    const exercise = step.exercise;
    body = (
      <CodeExerciseView
        key={exercise.id}
        exercise={exercise}
        initialCode={game.draftFor(exercise.id)}
        onCodeChange={(code) => game.saveDraft(exercise.id, code)}
        onJudged={(info) =>
          game.dispatch(
            {
              type: "ExerciseJudged",
              exerciseId: exercise.id,
              accepted: info.result.status === "accepted",
              failedSubmitsBefore: info.failedSubmitsBefore,
              hintsUsed: info.hintsUsed,
              viewedSolution: info.viewedSolution,
            },
            {
              kind: "code",
              itemId: exercise.id,
              code: info.code,
              status: info.result.status,
              passedCount: info.result.passedCount,
              total: info.result.total,
              misconceptions: info.result.misconceptions,
            },
          )
        }
        onComplete={() => markDone(index)}
      />
    );
  } else {
    const question = step.exercise;
    body = (
      <QuestionCard
        key={question.id}
        question={question}
        onAnswered={(correct, detail) => {
          markDone(index);
          game.dispatch(
            { type: "QuestionAnswered", questionId: question.id, correct },
            { kind: "choice", itemId: question.id, choiceIndex: detail.choiceIndex, correct, lang: detail.lang },
          );
        }}
      />
    );
  }
```

Nối vào cuối `src/styles.css`:

```css
.result-rewards { list-style: none; padding: 0; display: flex; justify-content: center; gap: 16px; font-size: 1.3rem; font-weight: 700; color: var(--success); }
```

- [ ] **Step 4: Chạy toàn bộ kiểm tra**

Run: `npm run check`
Expected: PASS toàn bộ, Playwright 5/5.

- [ ] **Step 5: Commit**

```bash
git add src/ui src/i18n src/styles.css
git commit -F - <<'EOF'
feat(ui): record exercise and question attempts, keep code drafts, show lesson rewards

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 13: Màn hình Sao lưu và nút xuất file khi app lỗi

**Files:**
- Create: `src/ui/BackupScreen.tsx`, `src/ui/download.ts`
- Modify: `src/ui/AppRoutes.tsx`, `src/ui/ErrorBoundary.tsx`
- Test: `src/ui/BackupScreen.test.tsx`, `src/ui/AppRoutes.test.tsx` (thêm)

**Interfaces:**
- Consumes: `useGame` (`exportBackup`, `checkPin`, `importBackup`, `lastBackupAt`), `decodeBackup`, `previewOf` (Task 5), `useLogError`, `useOptionalGame`.
- Produces: `downloadText(fileName: string, text: string): void`; `<BackupScreen>` ở route `#/backup`; `ErrorBoundary` ghi `{ kind: "ui-crash" }` vào nhật ký lỗi và màn hình lỗi có nút "Xuất file sao lưu" khi có game.

- [ ] **Step 1: Viết test thất bại**

`src/ui/BackupScreen.test.tsx`:

```tsx
// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { decodeBackup, encodeBackup } from "../storage/backup";
import { base64ToUtf8, utf8ToBase64 } from "../storage/encoding";
import { hashPin } from "../storage/pin";
import { sampleBackupPayload } from "../test/backupSample";
import { renderWithGame } from "../test/renderGame";
import { BackupScreen } from "./BackupScreen";
import { downloadText } from "./download";

vi.mock("./download", () => ({ downloadText: vi.fn() }));

async function unlock(pin: string) {
  await userEvent.type(screen.getByLabelText("Mã PIN"), pin);
  await userEvent.click(screen.getByRole("button", { name: "Xác nhận" }));
}

function fileOf(text: string) {
  return new File([text], "backup.pypet", { type: "application/octet-stream" });
}

describe("BackupScreen", () => {
  test("exports a decodable file and shows the last backup day", async () => {
    await renderWithGame(<BackupScreen />);
    expect(screen.getByText("Chưa sao lưu lần nào")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Xuất file sao lưu" }));
    await waitFor(() => expect(downloadText).toHaveBeenCalledOnce());
    const [fileName, text] = vi.mocked(downloadText).mock.calls[0]!;
    expect(fileName).toBe("py-pet-an-2026-10-06.pypet");
    expect((await decodeBackup(text)).ok).toBe(true);
    expect(screen.getByRole("status")).toHaveTextContent("Đã tạo file py-pet-an-2026-10-06.pypet");
    expect(screen.getByText("Lần sao lưu gần nhất: 2026-10-06")).toBeInTheDocument();
  });

  test("wrong PIN keeps the file picker hidden", async () => {
    await renderWithGame(<BackupScreen />, { meta: { pin: await hashPin("1234", 1000) } });
    await unlock("9999");
    expect(screen.getByRole("alert")).toHaveTextContent("Mã PIN chưa đúng.");
    expect(screen.queryByLabelText("Chọn file .pypet")).not.toBeInTheDocument();
  });

  test("rejects files that are not backups or come from a newer version", async () => {
    await renderWithGame(<BackupScreen />, { meta: { pin: await hashPin("1234", 1000) } });
    await unlock("1234");
    await userEvent.upload(screen.getByLabelText("Chọn file .pypet"), fileOf("hello"));
    expect(await screen.findByText("File này không phải file sao lưu của Py-Pet.")).toBeInTheDocument();
    const newer = await encodeBackup({ ...sampleBackupPayload(), schemaVersion: 99 });
    await userEvent.upload(screen.getByLabelText("Chọn file .pypet"), fileOf(newer));
    expect(await screen.findByText("File này từ phiên bản mới hơn. Hãy tải lại trang để cập nhật app.")).toBeInTheDocument();
  });

  test("import keeps an automatic backup and replaces the data", async () => {
    const onReplaced = vi.fn();
    const { store } = await renderWithGame(<BackupScreen />, { meta: { pin: await hashPin("1234", 1000) }, onReplaced });
    await unlock("1234");
    const edited = JSON.parse(base64ToUtf8(await encodeBackup(sampleBackupPayload("Bình"))));
    edited.profiles[0].state.wallet.xu = 500;
    await userEvent.upload(screen.getByLabelText("Chọn file .pypet"), fileOf(utf8ToBase64(JSON.stringify(edited))));
    expect(await screen.findByText("Cảnh báo: file đã bị chỉnh sửa.")).toBeInTheDocument();
    expect(screen.getByText("Hồ sơ trong file: Bình, giai đoạn 1, 500 xu, hoạt động cuối 2026-10-06")).toBeInTheDocument();
    expect((await store.loadActive())?.profile.childName).toBe("An");
    await userEvent.click(screen.getByRole("button", { name: "Nhập dữ liệu (thay dữ liệu hiện tại)" }));
    await waitFor(() => expect(onReplaced).toHaveBeenCalledOnce());
    expect((await store.loadActive())?.profile.childName).toBe("Bình");
    expect((await store.readMeta()).autoBackups).toHaveLength(1);
  });

  test("cancel returns to the file picker without importing", async () => {
    const onReplaced = vi.fn();
    await renderWithGame(<BackupScreen />, { meta: { pin: await hashPin("1234", 1000) }, onReplaced });
    await unlock("1234");
    await userEvent.upload(screen.getByLabelText("Chọn file .pypet"), fileOf(await encodeBackup(sampleBackupPayload("Bình"))));
    await userEvent.click(await screen.findByRole("button", { name: "Hủy" }));
    expect(screen.getByLabelText("Chọn file .pypet")).toBeInTheDocument();
    expect(onReplaced).not.toHaveBeenCalled();
  });
});
```

Thêm vào `src/ui/AppRoutes.test.tsx`:

```tsx
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
```

(thêm `waitFor` vào import từ `@testing-library/react`).

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/ui/BackupScreen.test.tsx src/ui/AppRoutes.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Viết code**

`src/ui/download.ts`:

```ts
export function downloadText(fileName: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: "application/octet-stream" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
```

`src/ui/BackupScreen.tsx`:

```tsx
import { useState, type ChangeEvent, type FormEvent } from "react";
import { localDay } from "../game/dates";
import { useLang } from "../i18n/LangProvider";
import type { MessageKey } from "../i18n/vi";
import { decodeBackup, previewOf, type BackupPayload, type BackupPreview } from "../storage/backup";
import { downloadText } from "./download";
import { useGame } from "./GameProvider";

type ImportStep =
  | { kind: "locked" }
  | { kind: "choose" }
  | { kind: "error"; message: MessageKey }
  | { kind: "preview"; payload: BackupPayload; preview: BackupPreview; tampered: boolean };

export function BackupScreen() {
  const game = useGame();
  const { t } = useLang();
  const [exported, setExported] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [pinWrong, setPinWrong] = useState(false);
  const [step, setStep] = useState<ImportStep>({ kind: "locked" });

  async function onExport() {
    const { fileName, text } = await game.exportBackup();
    downloadText(fileName, text);
    setExported(fileName);
  }

  async function onPin(event: FormEvent) {
    event.preventDefault();
    if (await game.checkPin(pin)) {
      setPinWrong(false);
      setStep({ kind: "choose" });
    } else {
      setPinWrong(true);
    }
  }

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const result = await decodeBackup(await file.text());
    if (!result.ok) {
      setStep({ kind: "error", message: result.reason === "newer-version" ? "backup.newerVersion" : "backup.notABackup" });
      return;
    }
    const preview = previewOf(result.payload);
    if (!preview) {
      setStep({ kind: "error", message: "backup.notABackup" });
      return;
    }
    setStep({ kind: "preview", payload: result.payload, preview, tampered: !result.checksumValid });
  }

  return (
    <main className="backup">
      <h1>{t("backup.title")}</h1>
      <section>
        <p>{game.lastBackupAt ? t("backup.lastBackup", { date: localDay(new Date(game.lastBackupAt)) }) : t("backup.never")}</p>
        <button className="primary" onClick={onExport}>
          {t("backup.export")}
        </button>
        {exported && <p role="status">{t("backup.exported", { file: exported })}</p>}
      </section>
      <section>
        <h2>{t("backup.import")}</h2>
        {step.kind === "locked" && (
          <form onSubmit={onPin}>
            <p>{t("backup.pinPrompt")}</p>
            <label>
              {t("backup.pinLabel")}
              <input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} />
            </label>
            <button type="submit">{t("backup.pinCheck")}</button>
            {pinWrong && <p role="alert">{t("backup.pinWrong")}</p>}
          </form>
        )}
        {(step.kind === "choose" || step.kind === "error") && (
          <label>
            {t("backup.chooseFile")}
            <input type="file" accept=".pypet" onChange={onFile} />
          </label>
        )}
        {step.kind === "error" && <p role="alert">{t(step.message)}</p>}
        {step.kind === "preview" && (
          <div>
            {step.tampered && <p role="alert">{t("backup.tampered")}</p>}
            <p>
              {t("backup.preview", {
                name: step.preview.childName,
                stage: step.preview.stage,
                xu: step.preview.xu,
                day: step.preview.lastActiveDay ?? "-",
              })}
            </p>
            <button className="primary" onClick={() => void game.importBackup(step.payload)}>
              {t("backup.confirmImport")}
            </button>
            <button onClick={() => setStep({ kind: "choose" })}>{t("backup.cancel")}</button>
          </div>
        )}
      </section>
      <a href="#/">{t("nav.room")}</a>
    </main>
  );
}
```

Trong `src/ui/AppRoutes.tsx`: thêm `import { BackupScreen } from "./BackupScreen";` và nhánh `else if (route.name === "backup") { screen = <BackupScreen />; }` ngay sau nhánh `map`.

Thay toàn bộ `src/ui/ErrorBoundary.tsx`:

```tsx
import { Component, type ReactNode } from "react";
import { useLang } from "../i18n/LangProvider";
import { ErrorLogContext, type LogError } from "./contexts";
import { downloadText } from "./download";
import { useOptionalGame } from "./GameProvider";
import { Robot } from "./Robot";

function CrashFallback() {
  const { t } = useLang();
  const game = useOptionalGame();
  return (
    <div role="alert" className="crash">
      <Robot mood="sad" size={80} />
      <p>{t("app.crash")}</p>
      <button onClick={() => window.location.reload()}>{t("app.reload")}</button>
      {game && (
        <button
          onClick={async () => {
            const { fileName, text } = await game.exportBackup();
            downloadText(fileName, text);
          }}
        >
          {t("backup.export")}
        </button>
      )}
    </div>
  );
}

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  static contextType = ErrorLogContext;
  declare context: LogError;
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(error: unknown): void {
    console.error(error);
    this.context({ kind: "ui-crash", detail: String(error) });
  }

  render(): ReactNode {
    return this.state.failed ? <CrashFallback /> : this.props.children;
  }
}
```

- [ ] **Step 4: Chạy test, xác nhận thành công**

Run: `npx vitest run src/ui && npm run typecheck`
Expected: PASS toàn bộ.

- [ ] **Step 5: Commit**

```bash
git add src/ui
git commit -F - <<'EOF'
feat(ui): add the backup screen with PIN-gated import and a crash-screen export

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 14: Test đầu cuối M2 và tài liệu

**Files:**
- Modify: `e2e/lesson.spec.ts`, `docs/manual-test-checklist.md`, `README.md`
- Create: `e2e/progress.spec.ts`

**Interfaces:**
- Consumes: toàn bộ app; nội dung bài `s1.lam-quen.l1` (bài tập 1 in `Xin chào Robo`; câu 2 là `mcq` có đáp án đúng `print("Hello")`).
- Produces: e2e cho lưu tiến độ qua tải lại trang, và xuất/nhập file giữa 2 máy giả lập.

- [ ] **Step 1: Viết e2e mới**

`e2e/progress.spec.ts`:

```ts
import { expect, test, type Page } from "@playwright/test";

async function startApp(page: Page, name = "An", pin = "1234") {
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Chào mừng đến với Py-Pet!" })).toBeVisible();
  await page.getByLabel("Tên của con").fill(name);
  await page.getByLabel("Mã PIN của bố mẹ (4 đến 6 chữ số)").fill(pin);
  await page.getByLabel("Nhập lại mã PIN").fill(pin);
  await page.getByRole("button", { name: "Bắt đầu" }).click();
  await expect(page.getByRole("heading", { name: "Phòng của Robo" })).toBeVisible();
}

async function finishLessonOne(page: Page) {
  await expect(page.getByText("Robo sẵn sàng")).toBeVisible({ timeout: 60_000 });
  await page.getByRole("link", { name: "Học tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  const editor = page.getByRole("textbox", { name: "Trình soạn code" });
  await editor.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type('print("Xin chào Robo")');
  await page.getByRole("button", { name: "Nộp bài" }).click();
  await expect(page.getByText("Đúng hết 1/1 test!")).toBeVisible();
  await page.getByRole("button", { name: "Tiếp" }).click();
  await page.getByRole("radio", { name: 'print("Hello")' }).check();
  await page.getByRole("button", { name: "Kiểm tra" }).click();
  await page.getByRole("button", { name: "Hoàn thành" }).click();
}

test("progress survives a reload", async ({ page }) => {
  await startApp(page);
  await finishLessonOne(page);
  await expect(page.getByText("+28 XP")).toBeVisible();
  await expect(page.getByText("+8 xu")).toBeVisible();
  await page.getByRole("button", { name: "Về phòng" }).click();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Phòng của Robo" })).toBeVisible();
  await expect(page.getByText("Mục tiêu hôm nay: 1/2")).toBeVisible();
  await expect(page.getByText("Xu: 8")).toBeVisible();
  await page.getByRole("link", { name: "Bản đồ học" }).click();
  await expect(page.getByRole("listitem").filter({ hasText: "Chương trình là gì?" })).toContainText("Đã xong");
});

test("a second tab only shows the other-tab message", async ({ page, context }) => {
  await startApp(page);
  const second = await context.newPage();
  await second.goto("./");
  await expect(second.getByText("Py-Pet đang mở ở tab khác. Con dùng tab đó nhé.")).toBeVisible();
});

test("exports a backup and imports it on another device", async ({ page, browser }, testInfo) => {
  await startApp(page, "An", "1234");
  await page.getByRole("link", { name: "Sao lưu" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Xuất file sao lưu" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^py-pet-an-\d{4}-\d{2}-\d{2}\.pypet$/);
  const file = testInfo.outputPath("backup.pypet");
  await download.saveAs(file);

  const otherContext = await browser.newContext();
  const other = await otherContext.newPage();
  await startApp(other, "Bình", "5678");
  await expect(other.getByText("Chào Bình!")).toBeVisible();
  await other.getByRole("link", { name: "Sao lưu" }).click();
  await other.getByLabel("Mã PIN").fill("5678");
  await other.getByRole("button", { name: "Xác nhận" }).click();
  await other.getByLabel("Chọn file .pypet").setInputFiles(file);
  await expect(other.getByText(/Hồ sơ trong file: An, giai đoạn 1/)).toBeVisible();
  await other.getByRole("button", { name: "Nhập dữ liệu (thay dữ liệu hiện tại)" }).click();
  await expect(other.getByText("Chào An!")).toBeVisible();
  await otherContext.close();
});
```

Ghi chú: trong test thứ 3, sau khi nhập, trang tự tải lại; mã PIN của máy mới được thay bằng PIN trong file (`1234`), đúng như spec 6.4 ("meta" nằm trong file).

- [ ] **Step 2: Chạy e2e**

Run: `npm run test:e2e`
Expected: 8 test PASS (5 cũ + 3 mới).

- [ ] **Step 3: Cập nhật checklist và README**

Nối vào cuối `docs/manual-test-checklist.md`:

```markdown
## Lưu trữ và vòng chơi (M2)

- [ ] Lần đầu mở: màn hình chào hỏi; sau khi tạo hồ sơ, tải lại trang vẫn vào thẳng Phòng robot
- [ ] Học xong 1 bài: Phòng robot hiện XP, xu, mục tiêu hôm nay tăng; tải lại trang không mất
- [ ] Đang làm dở bài code, tải lại trang: code đang viết vẫn còn
- [ ] Mở thêm 1 tab Py-Pet: tab thứ 2 chỉ báo "đang mở ở tab khác"
- [ ] Chế độ ẩn danh của Chrome: app vẫn học được (assumption: ẩn danh vẫn cho IndexedDB tạm; nếu bị chặn thì phải có banner đỏ)
- [ ] Xuất file sao lưu, nhập lại trên Edge hoặc máy khác: đúng tên con, xu, bài đã xong
- [ ] Nhập file bằng PIN sai: không nhập được
- [ ] Đổi giờ máy lùi 2 ngày rồi học: chuỗi ngày không tăng
- [ ] Không học 3 ngày (hoặc chỉnh giờ máy tiến 3 ngày): Pin và Vui giảm 2, robot buồn ngủ
```

Trong `README.md`, thêm vào cuối phần giới thiệu (sau dòng kế hoạch M1):

```markdown
- Kế hoạch M2: `docs/superpowers/plans/2026-10-06-m2-vong-choi-pet.md`

Tiến độ được lưu trong IndexedDB của trình duyệt. Hãy xuất file sao lưu `.pypet` thường xuyên (màn hình Sao lưu). Khi đổi cấu trúc dữ liệu, tăng `SCHEMA_VERSION`, thêm migration trong `src/storage/backup.ts` và chạy `npx tsx tools/make_backup_fixture.ts` để lưu file mẫu của phiên bản mới.
```

- [ ] **Step 4: Chạy toàn bộ kiểm tra**

Run: `npm run check`
Expected: typecheck sạch; Vitest PASS; pytest PASS; nội dung hợp lệ; Playwright 8/8 PASS.

- [ ] **Step 5: Commit**

```bash
git add e2e docs/manual-test-checklist.md README.md
git commit -F - <<'EOF'
test: cover saved progress, the tab lock and backup import end to end

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Ngoài phạm vi M2 (để rõ ranh giới)

| Mục trong spec | Mốc |
|---|---|
| Trạm ôn (điểm hoạt động +1), điểm thành thạo, Leitner, kiểm tra chủ đề, kiểm tra tiến hóa, tiến hóa robot (`pet.stage` > 1) | M3 |
| Cửa hàng, phụ kiện thưởng mốc chuỗi, phần thưởng thật, khu phụ huynh, chế độ nghỉ và lịch nghỉ, đặt lại PIN và banner đặt lại, chỉnh mục tiêu ngày/tuần, đo thời gian học, lịch sử giao dịch xu, xem nhật ký lỗi | M4 |
| Hình robot 4 dạng × 3 kích cỡ × 5 trạng thái, hoạt cảnh | M6 |
| Nhãn "Bài mới" cho bài thêm sau vào chủ đề đã xong (spec 6.7) | M5 (khi thêm nội dung) |
