# M3a – Ôn tập và thành thạo: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Robot nhớ con đã hiểu gì: mỗi câu trả lời cập nhật điểm thành thạo, bậc thang và hộp Leitner của từng khái niệm; bản đồ có trạm ôn bắt buộc; con có thêm 2 loại bài `parsons` và `fill`; khi gặp hiểu lầm, robot mời xem thẻ "Hiểu lầm thường gặp" và luyện thêm 2 bài; robot hết pin thì sạc bằng 1 lượt ôn tập. Dữ liệu cũ của M2 vẫn mở được và file sao lưu được kiểm tra kỹ trước khi nhập.

**Architecture:** Luật học là hàm thuần trong `src/game/`: `mastery.ts` (điểm thành thạo, bậc thang, cờ "Cần hỗ trợ"), `leitner.ts` (hộp ôn), `reviewSet.ts` (chọn câu cho trạm ôn và bài luyện, nhận `rng` từ ngoài), `path.ts` (bản đồ gồm bài học và trạm ôn). `apply()` nhận thêm khái niệm, hiểu lầm và nguồn (`lesson` / `review` / `practice`) trong sự kiện, nên vẫn không cần đọc nội dung. `GameState` lên version 2; `upgradeGameState()` nâng cấp và kiểm tra bằng schema zod khi mở app và khi nhập file. Giao diện có 1 component chung `ItemView` cho mọi loại bài, dùng trong bài học, trạm ôn (`ReviewScreen`) và bài luyện (`PracticeScreen`).

**Tech Stack:** Dự án M2 (React 19, TypeScript 5.9, Vite 8, Vitest 5, Playwright 1.63, Dexie 4, Pyodide 314). `zod` 4 chuyển từ devDependencies sang dependencies để kiểm tra dữ liệu lúc chạy. Không thêm thư viện mới.

**Spec:** `docs/superpowers/specs/2026-10-06-py-pet-design.md`

## Global Constraints

- Phạm vi M3a (người bảo trì chốt ngày 2026-10-06: chia M3 thành M3a và M3b): điểm thành thạo, bậc thang, cờ "Cần hỗ trợ", hộp Leitner, trạm ôn, sạc Pin bằng ôn tập, bài `parsons` và `fill`, thẻ "Hiểu lầm thường gặp" kèm 2 bài luyện (spec 5.9, 5.10, 3.4, 3.6, 8.3). Cộng 5 việc chuyển từ M2 (`docs/superpowers/STATUS.md`): migration khi mở app, kiểm tra sâu file nhập, lời nhắn khi Pin cạn, cập nhật lúc nửa đêm, khôi phục test bị bỏ.
- Ngoài phạm vi M3a (đừng làm): kiểm tra chủ đề, kiểm tra tiến hóa, bộ ôn tập trọng tâm, tiến hóa robot, ưu tiên bộ ôn tập trong nút "Học tiếp" (M3b); tab "Con cần hỗ trợ", bài phụ huynh giao, chỉnh các giá trị (*) (M4); soạn nội dung mới (M5). `pet.stage` vẫn luôn là 1.
- Nội dung (người bảo trì chốt): test và e2e dùng bộ nội dung mẫu (`src/test/reviewBundle.ts`) và nội dung thật đang có. Luật 8 của spec 3.9 (thẻ hiểu lầm, gợi ý phụ huynh, bài luyện 3 mức) chỉ in cảnh báo cho tới M5. Không viết câu hỏi hay bài tập mới; chỉ được tham chiếu ID đã có.
- Luật chơi là hàm thuần nhận `now` (và `rng` khi cần chọn ngẫu nhiên) từ ngoài. `GameState` chỉ chứa dữ liệu JSON.
- Con số của spec: điểm thành thạo `m ← m + 0,3 × (s × 100 − m)` với `s` = 1 / 0,6 / 0,3 / 0; "Cần hỗ trợ" khi tỷ lệ đúng dưới 60% trong ít nhất 5 lượt gần nhất, hoặc 1 hiểu lầm gặp từ 3 lần, hoặc sai bài ôn 2 lần liên tiếp; bỏ cờ khi điểm vượt 70; bậc thang lên 1 mức sau 2 lần đúng liên tiếp, xuống 1 mức sau 2 lần sai liên tiếp; Leitner 5 hộp cách 1, 2, 4, 7, 14 ngày; trạm ôn 5 câu; trạm ôn thưởng 5 XP + 2 XP mỗi câu đúng, 10 xu + 5 xu nếu đúng hết, Pin +2, 1 điểm hoạt động; sai 3 lần thì mở lời giải và bài được xếp lại sau 1 ngày.
- ID đã phát hành không đổi. ID trạm ôn mới: `s1.lam-quen.r1`, `s1.lam-quen.r2`.
- Đổi cấu trúc dữ liệu theo `CLAUDE.md`: `SCHEMA_VERSION` 1 → 2, migration trong `src/storage/backup.ts`, chạy `npx tsx tools/make_backup_fixture.ts` 1 lần để tạo `src/storage/fixtures/backup-v2.pypet`. Không sinh lại `backup-v1.pypet`.
- Mọi chuỗi giao diện đi qua `t(key)`; `vi.ts` và `en.ts` cùng khóa, cùng placeholder.
- Không gọi mạng.
- Mọi commit message kết thúc bằng dòng trailer theo hướng dẫn attribution của phiên đang chạy. Các lệnh commit trong kế hoạch ghi dòng `Co-Authored-By`; thêm các dòng trailer khác mà phiên yêu cầu.
- Mốc xanh trước khi bắt đầu: `npm run check` (typecheck, Vitest 336, pytest 17, kiểm tra nội dung, e2e 8). Trong phiên cloud, đặt `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium` trước khi chạy e2e (xem `CLAUDE.md`).

## Review Focus

1. Dữ liệu M2 trên máy con (state version 1 trong IndexedDB, file `.pypet` schema 1) phải mở được sau khi cập nhật, giữ nguyên XP, xu và bài đã học. Test: Task 1 (`upgrades a version 1 state and keeps its progress`), Task 2 (`a profile saved by an older app is upgraded when it opens`, `decodes the committed schema 1 sample file and upgrades it`).
2. File sao lưu bị sửa tay đến mức hỏng (state sai kiểu, hồ sơ rỗng, state từ bản mới hơn) không bao giờ được ghi đè dữ liệu; app báo rõ "File sao lưu bị hỏng". Test: Task 2 (`refuses a file whose profile or state is damaged`, `a backup envelope with broken profiles is reported as damaged`).
3. Con làm lại trạm ôn hoặc bấm "Ôn tập" nhiều lần để kiếm xu: chỉ lần đầu của mỗi trạm trên bản đồ được xu; ôn tập tự do không mở khi không có gì để ôn. Test: Task 4 (`a repeated station or a free review pays XP and Pin but no xu`), Task 9 (`a free review does not open without anything to review`).
4. Trạm ôn và bài luyện không được lộ bài của bài học chưa học, và không được hiện bản nháp (có thể là lời giải) của con trong bài học. Test: Task 7 (`hides the items of lessons not learned yet`), Task 8 (`outside a lesson the code starts from the starter, not from the lesson draft`).
5. App mở qua nửa đêm: Phòng robot sang ngày mới đúng giờ; trạm ôn không có câu nào vẫn hoàn thành được để không chặn đường. Test: Task 11 (`runs a day rollover at midnight while the app stays open`), Task 9 (`a station with nothing to ask can still be finished`).

## Quyết định thiết kế

Spec để ngỏ các điểm sau; kế hoạch chốt như dưới đây. Reviewer đánh giá theo các quyết định này.

1. **1 lượt = 1 kết quả.** Câu `predict`/`mcq`: đúng `s = 1`, sai `s = 0`. Bài `code`/`parsons`/`fill`: chỉ lần nộp đúng ghi kết quả (`s = 1` nếu đúng ngay, `0,6` nếu đúng sau vài lần, `0,3` nếu có gợi ý hoặc đã xem lời giải); lần nộp sai chỉ đếm hiểu lầm. "Đúng" trên bậc thang và trong tỷ lệ đúng là `s ≥ 0,6`.
2. **Hiểu lầm là khái niệm.** `misconception` trong nội dung đã là ID khái niệm (script tham chiếu kiểm tra điều này), nên số lần gặp hiểu lầm lưu ngay trên khái niệm đó. Khi điểm vượt 70 và cờ "Cần hỗ trợ" được bỏ, bộ đếm hiểu lầm và bộ đếm sai bài ôn cũng về 0 để cờ không bật lại ngay.
3. **"Sai bài ôn 2 lần liên tiếp"** = 2 câu sai liên tiếp của khái niệm đó trong trạm ôn.
4. **Leitner** áp dụng cho mọi câu `predict`/`mcq` (trong bài học và ngân hàng câu hỏi), ở mọi nguồn. Câu mới bắt đầu ở hộp 1.
5. **Thưởng trạm ôn.** Mỗi lần hoàn thành: 5 XP + 2 XP mỗi câu đúng, Pin +2, 1 điểm hoạt động. Xu (10, thêm 5 nếu đúng hết) chỉ ở lần đầu của mỗi trạm trên bản đồ. Câu trả lời trong trạm ôn không nhận XP riêng. Kế hoạch tuần vẫn chỉ đếm bài học.
6. **Ôn tập tự do** ("Ôn tập", và "Sạc cho Robo" khi hết pin) mở từ Phòng robot sau bài học đầu tiên, dùng 2 bài học gần nhất làm "bài vừa học", cần ít nhất 1 câu mới mở được.
7. **Vị trí trạm ôn** khai báo trong `topic.yaml`: `reviews: [{ id, after }]`, `after` là ID bài học. Trạm ôn chặn bài kế tiếp (spec 5.3).
8. **Parsons** giữ nguyên thụt lề của từng dòng; con chỉ đổi thứ tự bằng nút ↑ ↓ (dùng được bằng bàn phím). **Fill** đánh dấu chỗ trống bằng `___`. Cả 2 được chấm bằng cách chạy code với test case và thưởng như bài `code` (assumption: cần phụ huynh xác nhận khi dùng thật).
9. **Bài luyện 3 mức** khai báo trong `concepts.yaml` (`practice.level1/2/3`); bài không thuộc bài học nào đặt trong `practice.yaml` của chủ đề. Bài của bài học chưa học không bao giờ được chọn.
10. **Bài xem lời giải** quay lại sau 1 ngày (`RETRY_AFTER_DAYS = 1`) ở ô "hỗ trợ" của trạm ôn, trước khái niệm "Cần hỗ trợ".
11. **Phiên bản dữ liệu.** `GAME_STATE_VERSION` và `SCHEMA_VERSION` cùng lên 2. State tự mang version và được nâng cấp bằng `upgradeGameState()`; migration của file sao lưu chỉ đổi lớp vỏ.
12. Việc chuyển từ M2 số 6 (xuất file chỉ có hồ sơ đang dùng khi đọc kho lỗi) vẫn để dành cho lúc có giao diện nhiều hồ sơ.

---

## File Structure

```
src/game/
  state.ts          (sửa) GameState v2: mastery, reviews, retry, progress.completedReviews
  schema.ts         gameStateSchema (zod)
  migrate.ts        upgradeGameState, StateFormatError
  mastery.ts        MASTERY, emptyMastery, solvedScore, recordResult, recordMisconception
  leitner.ts        LEITNER_DAYS, reviewCard, isDue
  random.ts         seededRng, shuffled, Rng
  rewards.ts        (sửa) thưởng trạm ôn, PIN_REVIEW, RETRY_AFTER_DAYS
  apply.ts          (sửa) sự kiện mang concepts/misconceptions/source, ReviewCompleted
  path.ts           pathNodes, nodeStatuses, nextNode, findNode
  reviewSet.ts      availableItems, buildReviewSet, buildPracticeSet
  progress.ts       (sửa) stageXpMax tính trạm ôn; bỏ lessonStatuses, nextLessonId
  dates.ts          (sửa) msUntilNextDay
src/content/
  types.ts          (sửa) ParsonsExercise, FillExercise, TestedExercise, isChoiceQuestion, Concept.practice, ReviewStation
  exercise.ts       parsonsLines, fillTemplate
  lookup.ts         (sửa) allExercises gồm bài luyện, findItem, allConcepts, findConcept
src/storage/        (sửa) backup.ts (schema 2, kiểm tra sâu), types.ts, fixtures/backup-v2.pypet
src/runner/judge.ts (sửa) JudgeSpec thay CodeExercise
src/ui/
  ItemView.tsx            1 bài bất kỳ + sự kiện + thẻ hiểu lầm
  PuzzleExerciseView.tsx  parsons và fill
  SessionScreen.tsx       chuỗi bài dạng thẻ (trạm ôn, bài luyện)
  ReviewScreen.tsx, PracticeScreen.tsx, MisconceptionHelp.tsx
  (sửa) GameRoot, GameProvider, AppRoutes, LessonScreen, ResultView, MapScreen, RoomScreen, BackupScreen,
        CodeExerciseView, routing, styles.css
src/test/reviewBundle.ts  Bộ nội dung mẫu: 3 bài, 1 trạm ôn, 6 câu hỏi, parsons, fill
tools/
  content/schema.ts, buildBundle.ts, references.ts  (sửa) parsons, fill, practice.yaml, reviews, practice
  content/coverage.ts     contentWarnings (luật 8, chỉ cảnh báo)
  build_content.ts        (sửa) in cảnh báo
  validate_content.py     (sửa) chạy lời giải parsons/fill
content/stage-1/01-lam-quen/topic.yaml, concepts.yaml  (sửa) trạm ôn, bài luyện mức 1 và 3
e2e/review.spec.ts
```

---
### Task 1: GameState version 2, schema và nâng cấp dữ liệu

**Files:**
- Modify: `src/game/state.ts`, `src/game/dates.test.ts`, `package.json`, `package-lock.json`
- Create: `src/game/schema.ts`, `src/game/migrate.ts`
- Test: `src/game/migrate.test.ts`

**Interfaces:**
- Consumes: không có.
- Produces:
  - `GAME_STATE_VERSION = 2`; `interface ConceptMastery { score: number; level: 1 | 2 | 3; run: number; needsHelp: boolean; misconceptions: number; recent: number[]; reviewMisses: number }`; `interface ReviewCard { box: number; due: string }`.
  - `GameState` thêm `mastery: Record<string, ConceptMastery>`, `reviews: Record<string, ReviewCard>`, `retry: Record<string, string>`, `progress.completedReviews: string[]`.
  - `gameStateSchema: z.ZodType<GameState>`.
  - `type StateProblem = "newer-version" | "damaged"`; `class StateFormatError extends Error { problem: StateProblem }`; `upgradeGameState(raw: unknown): GameState` (ném `StateFormatError`).

- [ ] **Step 1: Viết test thất bại**

`src/game/migrate.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { StateFormatError, upgradeGameState } from "./migrate";
import { GAME_STATE_VERSION, initialGameState } from "./state";

/** A state as the M2 app saved it (version 1). */
function versionOneState(): Record<string, unknown> {
  const { mastery, reviews, retry, ...rest } = initialGameState("2026-10-06");
  const { completedReviews, ...progress } = rest.progress;
  return { ...rest, version: 1, progress: { ...progress, completedLessons: ["s1.lam-quen.l1"] } };
}

function problemOf(raw: unknown): string {
  try {
    upgradeGameState(raw);
  } catch (error) {
    if (error instanceof StateFormatError) return error.problem;
    throw error;
  }
  return "none";
}

describe("upgradeGameState", () => {
  test("keeps a current state as it is", () => {
    const state = initialGameState("2026-10-06");
    expect(upgradeGameState(JSON.parse(JSON.stringify(state)))).toEqual(state);
  });

  test("upgrades a version 1 state and keeps its progress", () => {
    const upgraded = upgradeGameState(versionOneState());
    expect(upgraded.version).toBe(GAME_STATE_VERSION);
    expect(upgraded.mastery).toEqual({});
    expect(upgraded.reviews).toEqual({});
    expect(upgraded.retry).toEqual({});
    expect(upgraded.progress.completedReviews).toEqual([]);
    expect(upgraded.progress.completedLessons).toEqual(["s1.lam-quen.l1"]);
  });

  test("keeps the optional exercise stats", () => {
    const raw = versionOneState();
    (raw.progress as Record<string, unknown>).exerciseStats = { a: { fails: 2, hints: 1, viewedSolution: false } };
    expect(upgradeGameState(raw).progress.exerciseStats).toEqual({ a: { fails: 2, hints: 1, viewedSolution: false } });
  });

  test("refuses a state from a newer app", () => {
    expect(problemOf({ ...initialGameState("2026-10-06"), version: GAME_STATE_VERSION + 1 })).toBe("newer-version");
  });

  test("refuses a damaged state", () => {
    expect(problemOf(null)).toBe("damaged");
    expect(problemOf({})).toBe("damaged");
    expect(problemOf({ version: 0 })).toBe("damaged");
    expect(problemOf({ ...initialGameState("2026-10-06"), wallet: { xu: -5 } })).toBe("damaged");
    expect(problemOf({ ...initialGameState("2026-10-06"), pet: "robo" })).toBe("damaged");
    expect(problemOf({ ...versionOneState(), progress: { completedLessons: "all" } })).toBe("damaged");
  });
});
```

Trong `src/game/dates.test.ts`, thay khối `expect(initialGameState("2026-10-06")).toEqual({...})` bằng:

```ts
    expect(initialGameState("2026-10-06")).toEqual({
      version: 2,
      pet: { stage: 1, xp: 0, pin: 4, vui: 4, correctRun: 0 },
      wallet: { xu: 0 },
      activity: { lastActiveDay: null, decayApplied: 0 },
      streak: { current: 0, best: 0, freezes: 0, lastAchievedDay: null, pointsDay: null, points: 0 },
      week: { start: "2026-10-05", lessonsDone: 0 },
      settings: { dailyGoal: 2, weeklyTarget: 10, graceDays: 1, uiLang: "vi" },
      mastery: {},
      reviews: {},
      retry: {},
      progress: { completedLessons: [], solvedExercises: [], answeredQuestions: [], completedReviews: [] },
      warnings: [],
    });
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/game/migrate.test.ts src/game/dates.test.ts`
Expected: FAIL vì chưa có `./migrate` và `initialGameState` vẫn trả về version 1.

- [ ] **Step 3: Viết code**

Chuyển `zod` sang dependencies (app dùng zod lúc chạy từ task này):

```bash
npm pkg delete devDependencies.zod
npm pkg set dependencies.zod="^4.6.5"
npm install
```

`src/game/state.ts` (thay toàn bộ file):

```ts
import type { Lang } from "../i18n/lang";
import { weekStart } from "./dates";

export const GAME_STATE_VERSION = 2;
export const STAT_MAX = 5;
export const STAT_START = 4;
export const WARNING_LIMIT = 20;

export interface GameSettings {
  dailyGoal: number;
  weeklyTarget: number;
  graceDays: number;
  uiLang: Lang;
}

/** What the child did on an unsolved code exercise; it decides the reward and survives a reload. */
export interface ExerciseStats {
  fails: number;
  hints: number;
  viewedSolution: boolean;
}

/** One concept's learning record (spec 5.9). */
export interface ConceptMastery {
  /** 0 to 100, updated with m <- m + 0.3 * (s * 100 - m). */
  score: number;
  /** The ladder level: 1 = predict/mcq, 2 = parsons/fill, 3 = code. */
  level: 1 | 2 | 3;
  /** Results in a row on the ladder: +n right, -n wrong. */
  run: number;
  needsHelp: boolean;
  /** How often this concept's misconception was seen since the help flag was last cleared. */
  misconceptions: number;
  /** The last results, newest last, each from 0 to 1. */
  recent: number[];
  /** Wrong review-station answers in a row. */
  reviewMisses: number;
}

/** The Leitner box (1 to 5) of a question and the day it is due again (spec 5.10). */
export interface ReviewCard {
  box: number;
  due: string;
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
  mastery: Record<string, ConceptMastery>;
  reviews: Record<string, ReviewCard>;
  /** Exercises whose solution was shown -> the day they come back in a review station (spec 5.9). */
  retry: Record<string, string>;
  progress: {
    completedLessons: string[];
    solvedExercises: string[];
    answeredQuestions: string[];
    completedReviews: string[];
    /** Optional: states saved before it existed have no stats. Read it with `?? {}`. */
    exerciseStats?: Record<string, ExerciseStats>;
  };
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
    mastery: {},
    reviews: {},
    retry: {},
    progress: { completedLessons: [], solvedExercises: [], answeredQuestions: [], completedReviews: [] },
    warnings: [],
  };
}
```

`src/game/schema.ts`:

```ts
import { z } from "zod";
import type { GameState } from "./state";

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const count = z.number().int().min(0);
const stat = z.number().int().min(0).max(5);

const masterySchema = z.object({
  score: z.number().min(0).max(100),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  run: z.number().int(),
  needsHelp: z.boolean(),
  misconceptions: count,
  recent: z.array(z.number().min(0).max(1)),
  reviewMisses: count,
});

/** The shape of a saved GameState of the current version. Unknown keys are dropped. */
export const gameStateSchema: z.ZodType<GameState> = z.object({
  version: z.number().int(),
  pet: z.object({ stage: z.number().int().min(1), xp: count, pin: stat, vui: stat, correctRun: count }),
  wallet: z.object({ xu: count }),
  activity: z.object({ lastActiveDay: day.nullable(), decayApplied: count }),
  streak: z.object({
    current: count,
    best: count,
    freezes: count,
    lastAchievedDay: day.nullable(),
    pointsDay: day.nullable(),
    points: count,
  }),
  week: z.object({ start: day, lessonsDone: count }),
  settings: z.object({
    dailyGoal: count,
    weeklyTarget: count,
    graceDays: count,
    uiLang: z.enum(["vi", "en"]),
  }),
  mastery: z.record(z.string(), masterySchema),
  reviews: z.record(z.string(), z.object({ box: z.number().int().min(1).max(5), due: day })),
  retry: z.record(z.string(), day),
  progress: z.object({
    completedLessons: z.array(z.string()),
    solvedExercises: z.array(z.string()),
    answeredQuestions: z.array(z.string()),
    completedReviews: z.array(z.string()),
    exerciseStats: z
      .record(z.string(), z.object({ fails: count, hints: count, viewedSolution: z.boolean() }))
      .optional(),
  }),
  warnings: z.array(z.object({ at: z.string(), kind: z.literal("clock-rollback") })),
});
```

`src/game/migrate.ts`:

```ts
import { gameStateSchema } from "./schema";
import { GAME_STATE_VERSION, type GameState } from "./state";

export type StateProblem = "newer-version" | "damaged";

export class StateFormatError extends Error {
  constructor(
    readonly problem: StateProblem,
    message: string,
  ) {
    super(message);
    this.name = "StateFormatError";
  }
}

type RawState = Record<string, unknown>;

function isRecord(value: unknown): value is RawState {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** version N -> a pure function that turns a version N state into a version N+1 state. */
const STEPS: Record<number, (state: RawState) => RawState> = {
  1: (state) => ({
    ...state,
    version: 2,
    mastery: {},
    reviews: {},
    retry: {},
    progress: { ...(isRecord(state.progress) ? state.progress : {}), completedReviews: [] },
  }),
};

/** Brings a saved state up to GAME_STATE_VERSION and checks its shape. Throws StateFormatError. */
export function upgradeGameState(raw: unknown): GameState {
  if (!isRecord(raw) || typeof raw.version !== "number" || !Number.isInteger(raw.version) || raw.version < 1) {
    throw new StateFormatError("damaged", "The saved game has no valid version");
  }
  if (raw.version > GAME_STATE_VERSION) {
    throw new StateFormatError("newer-version", `Version ${raw.version} is newer than ${GAME_STATE_VERSION}`);
  }
  let current = raw;
  for (let version = raw.version; version < GAME_STATE_VERSION; version += 1) {
    const step = STEPS[version];
    if (!step) throw new StateFormatError("damaged", `Missing migration from version ${version}`);
    current = step(current);
  }
  const parsed = gameStateSchema.safeParse(current);
  if (!parsed.success) {
    const where = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    throw new StateFormatError("damaged", where.join("; "));
  }
  return parsed.data;
}
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run src/game/migrate.test.ts src/game/dates.test.ts && npm run typecheck`
Expected: PASS; typecheck không lỗi.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/game/state.ts src/game/schema.ts src/game/migrate.ts src/game/migrate.test.ts src/game/dates.test.ts
git commit -m "feat(game): GameState version 2 with mastery, Leitner and retry data, upgraded and checked on load

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Mở dữ liệu cũ và kiểm tra sâu file sao lưu

**Files:**
- Modify: `src/ui/GameRoot.tsx`, `src/storage/types.ts`, `src/storage/backup.ts`, `src/ui/BackupScreen.tsx`, `src/i18n/vi.ts`, `src/i18n/en.ts`
- Create: `src/storage/fixtures/backup-v2.pypet` (sinh bằng `tools/make_backup_fixture.ts`)
- Test: `src/storage/backup.test.ts`, `src/storage/store.test.ts`, `src/ui/BackupScreen.test.tsx`, `src/ui/AppRoutes.test.tsx`

**Interfaces:**
- Consumes: `upgradeGameState`, `StateFormatError`, `StateProblem` (Task 1).
- Produces:
  - `SCHEMA_VERSION = 2`; `DecodeResult` có thêm `reason: "damaged"`.
  - `decodeBackup` trả về payload đã nâng cấp: mọi `profiles[i].state` là `GameState` version 2.
  - Khóa i18n `app.newerData`, `backup.damaged`.

- [ ] **Step 1: Viết test thất bại**

`src/storage/backup.test.ts`: sửa import và thay test `decodes the committed schema 1 sample file` bằng 3 test:

```ts
import { GAME_STATE_VERSION, initialGameState } from "../game/state";
```

```ts
import {
  backupFileName,
  buildBackupPayload,
  decodeBackup,
  encodeBackup,
  migrateBackup,
  previewOf,
  type BackupPayload,
} from "./backup";
import { base64ToUtf8, sha256Hex, utf8ToBase64 } from "./encoding";
import { MemoryStore } from "./memoryStore";
import { hashPin, isValidPin, verifyPin } from "./pin";
import { SCHEMA_VERSION } from "./types";
```

```ts
  test("decodes the committed schema 1 sample file and upgrades it", async () => {
    const text = readFileSync("src/storage/fixtures/backup-v1.pypet", "utf8");
    const result = await decodeBackup(text);
    if (!result.ok) throw new Error("the sample file must decode");
    expect(result.checksumValid).toBe(true);
    expect(previewOf(result.payload)?.childName).toBe("An");
    expect(result.payload.schemaVersion).toBe(SCHEMA_VERSION);
    const state = result.payload.profiles[0]!.state;
    expect(state.version).toBe(GAME_STATE_VERSION);
    expect(state.progress.completedReviews).toEqual([]);
    expect(state.wallet.xu).toBe(120);
  });

  test("decodes the committed schema 2 sample file", async () => {
    const result = await decodeBackup(readFileSync("src/storage/fixtures/backup-v2.pypet", "utf8"));
    expect(result.ok && result.checksumValid).toBe(true);
    expect(result.ok && result.payload.profiles[0]!.state.mastery).toEqual({});
  });

  test("refuses a file whose profile or state is damaged", async () => {
    const broken = sampleBackupPayload();
    (broken.profiles[0]!.state as unknown as { wallet: unknown }).wallet = "lots";
    expect(await decodeBackup(await encodeBackup(broken))).toEqual({ ok: false, reason: "damaged" });
    const noProfile = { ...sampleBackupPayload(), profiles: [{}] } as unknown as BackupPayload;
    expect(await decodeBackup(await encodeBackup(noProfile))).toEqual({ ok: false, reason: "damaged" });
    const newerState = sampleBackupPayload();
    newerState.profiles[0]!.state.version = GAME_STATE_VERSION + 1;
    expect(await decodeBackup(await encodeBackup(newerState))).toEqual({ ok: false, reason: "damaged" });
  });
```

`src/storage/store.test.ts`, test `a meta with missing fields gets the defaults and still takes error log entries`: meta ghi vào giữ `schemaVersion` của chính nó, nên đổi dòng kiểm tra thành:

```ts
    expect(await store.readMeta()).toEqual({ ...emptyMeta(), schemaVersion: 1, activeProfileId: "p1" });
```

`src/ui/BackupScreen.test.tsx`: đổi tên và câu mong đợi của test `a backup envelope with broken profiles is not a backup`:

```ts
  test("a backup envelope with broken profiles is reported as damaged", async () => {
    await renderWithGame(<BackupScreen />, { meta: { pin: await hashPin("1234", 1000) } });
    await unlock("1234");
    const broken = await encodeBackup({ ...sampleBackupPayload(), profiles: [{}] as never });
    await userEvent.upload(await screen.findByLabelText("Chọn file .pypet"), fileOf(broken));
    expect(
      await screen.findByText("File sao lưu bị hỏng nên không nhập được. Dữ liệu hiện tại được giữ nguyên."),
    ).toBeInTheDocument();
  });
```

`src/ui/AppRoutes.test.tsx`, trong `describe("App", ...)`, thêm trước test `shows the other-tab message when the tab does not own the lock`:

```ts
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
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/storage src/ui/BackupScreen.test.tsx src/ui/AppRoutes.test.tsx`
Expected: FAIL: thiếu `backup-v2.pypet`, `decodeBackup` chưa trả `damaged`, state version 1 chưa được nâng cấp, chưa có chuỗi `app.newerData`.

- [ ] **Step 3: Viết code**

`src/storage/types.ts`: đổi `export const SCHEMA_VERSION = 1;` thành `export const SCHEMA_VERSION = 2;`.

`src/storage/backup.ts`:

1. Thêm import ở đầu file:

```ts
import { z } from "zod";
import { StateFormatError, upgradeGameState } from "../game/migrate";
```

2. Đổi kiểu `DecodeResult`:

```ts
export type DecodeResult =
  | { ok: true; payload: BackupPayload; checksumValid: boolean }
  | { ok: false; reason: "not-a-backup" | "newer-version" | "damaged" };
```

3. Thay khai báo `MIGRATIONS` bằng:

```ts
/**
 * schemaVersion N -> function that turns an N payload into an N+1 payload. A profile's state carries its own
 * version and is upgraded by upgradeGameState after these steps.
 */
const MIGRATIONS: Record<number, (payload: BackupPayload) => BackupPayload> = {
  // Schema 2 only changed the game state (GameState version 2).
  1: (payload) => ({ ...payload, schemaVersion: 2, meta: { ...payload.meta, schemaVersion: 2 } }),
};

const profileBundleSchema = z.object({
  profile: z.object({ id: z.string().min(1), childName: z.string(), robotName: z.string(), createdAt: z.string() }),
  state: z.unknown(),
  attempts: z.array(z.object({ profileId: z.string(), itemId: z.string(), kind: z.enum(["code", "choice"]) })),
  drafts: z.array(z.object({ profileId: z.string(), itemId: z.string(), code: z.string() })),
});

/** Checks every profile of a migrated payload and upgrades its state. Null when a profile is damaged. */
function checkProfiles(payload: BackupPayload): BackupPayload | null {
  const profiles: BackupPayload["profiles"] = [];
  for (const bundle of payload.profiles as unknown[]) {
    if (!profileBundleSchema.safeParse(bundle).success) return null;
    const checked = bundle as BackupPayload["profiles"][number];
    let state: GameState;
    try {
      state = upgradeGameState(checked.state);
    } catch (error) {
      if (error instanceof StateFormatError) return null;
      throw error;
    }
    profiles.push({ ...checked, state });
  }
  return { ...payload, profiles };
}
```

4. Trong `decodeBackup`, thay đoạn từ `let payload: BackupPayload;` tới hết hàm bằng:

```ts
  let migrated: BackupPayload;
  try {
    migrated = migrateBackup(rest as unknown as BackupPayload);
  } catch {
    return { ok: false, reason: "not-a-backup" };
  }
  const payload = checkProfiles(migrated);
  if (!payload) return { ok: false, reason: "damaged" };
  return { ok: true, payload, checksumValid: checksum === expected };
}
```

`src/ui/GameRoot.tsx` (thay toàn bộ file):

```tsx
import { useEffect, useState } from "react";
import { StateFormatError, upgradeGameState, type StateProblem } from "../game/migrate";
import { useLang } from "../i18n/LangProvider";
import type { GameStore, LoadedGame } from "../storage/types";
import { AppRoutes } from "./AppRoutes";
import { GameProvider } from "./GameProvider";
import { Header } from "./Header";
import { OnboardingScreen } from "./OnboardingScreen";
import { Robot } from "./Robot";

export function GameRoot({ store, clock, onReplaced }: { store: GameStore; clock: () => Date; onReplaced(): void }) {
  const { t } = useLang();
  const [loaded, setLoaded] = useState<LoadedGame | null | undefined>(undefined);
  const [loadProblem, setLoadProblem] = useState<StateProblem | "unreadable" | null>(null);

  useEffect(() => {
    let alive = true;
    store.loadActive().then(
      (result) => {
        if (!alive) return;
        if (result === null) {
          setLoaded(null);
          return;
        }
        try {
          // Data saved by an older app is upgraded here; the first event writes it back.
          setLoaded({ ...result, state: upgradeGameState(result.state) });
        } catch (error) {
          setLoadProblem(error instanceof StateFormatError ? error.problem : "damaged");
        }
      },
      () => {
        if (alive) setLoadProblem("unreadable");
      },
    );
    return () => {
      alive = false;
    };
  }, [store]);

  if (loadProblem !== null) {
    return (
      <>
        <Header />
        <main className="crash" role="alert">
          <Robot mood="sad" size={80} />
          <p>{t(loadProblem === "newer-version" ? "app.newerData" : "app.crash")}</p>
          <button onClick={() => window.location.reload()}>{t("app.reload")}</button>
        </main>
      </>
    );
  }
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

`src/ui/BackupScreen.tsx`:

1. Đổi import của `../storage/backup` thành:

```ts
import {
  backupFileName,
  decodeBackup,
  previewOf,
  type BackupPayload,
  type BackupPreview,
  type DecodeResult,
} from "../storage/backup";
```

2. Thêm trước `interface AutoBackupItem`:

```ts
const REASON_MESSAGE: Record<Extract<DecodeResult, { ok: false }>["reason"], MessageKey> = {
  "not-a-backup": "backup.notABackup",
  "newer-version": "backup.newerVersion",
  damaged: "backup.damaged",
};
```

3. Trong `onFile`, đổi `setStep({ kind: "error", message: result.reason === "newer-version" ? "backup.newerVersion" : "backup.notABackup" });` thành:

```ts
        setStep({ kind: "error", message: REASON_MESSAGE[result.reason] });
```

`src/i18n/vi.ts`: thêm trước `"app.loading"` và trước `"backup.tampered"`:

```ts
  "app.newerData": "Dữ liệu này được lưu bởi phiên bản Py-Pet mới hơn. Hãy tải lại trang để cập nhật app.",
```

```ts
  "backup.damaged": "File sao lưu bị hỏng nên không nhập được. Dữ liệu hiện tại được giữ nguyên.",
```

`src/i18n/en.ts`: thêm ở cùng vị trí:

```ts
  "app.newerData": "This data was saved by a newer version of Py-Pet. Reload the page to update the app.",
```

```ts
  "backup.damaged": "The backup file is damaged and cannot be imported. The current data stays as it is.",
```

Sinh file mẫu schema 2 (chỉ 1 lần, rồi commit):

```bash
npx tsx tools/make_backup_fixture.ts
```

Expected: `Wrote src/storage/fixtures/backup-v2.pypet`. `backup-v1.pypet` không đổi (`git status` không liệt kê nó).

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run src/storage src/ui && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/storage src/ui/GameRoot.tsx src/ui/BackupScreen.tsx src/ui/BackupScreen.test.tsx src/ui/AppRoutes.test.tsx src/i18n/vi.ts src/i18n/en.ts
git commit -m "feat(storage): open M2 data, backup schema 2, refuse damaged backup files

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 3: Điểm thành thạo, bậc thang, Leitner và số ngẫu nhiên có seed

**Files:**
- Create: `src/game/mastery.ts`, `src/game/leitner.ts`, `src/game/random.ts`
- Test: `src/game/mastery.test.ts`

**Interfaces:**
- Consumes: `ConceptMastery`, `ReviewCard` (Task 1); `addDays` (`src/game/dates.ts`).
- Produces:
  - `MASTERY` (hằng số spec 5.9); `type ResultSource = "lesson" | "review" | "practice"`; `emptyMastery(): ConceptMastery`; `solvedScore(failedSubmitsBefore: number, hintsUsed: number, viewedSolution: boolean): number`; `recordResult(m: ConceptMastery, s: number, source: ResultSource): ConceptMastery`; `recordMisconception(m: ConceptMastery): ConceptMastery`.
  - `LEITNER_DAYS = [1, 2, 4, 7, 14]`; `reviewCard(card: ReviewCard | undefined, correct: boolean, today: string): ReviewCard`; `isDue(card: ReviewCard, today: string): boolean`.
  - `type Rng = () => number`; `seededRng(seed: number): Rng`; `shuffled<T>(items: readonly T[], rng: Rng): T[]`.

- [ ] **Step 1: Viết test thất bại**

`src/game/mastery.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { addDays } from "./dates";
import { isDue, LEITNER_DAYS, reviewCard } from "./leitner";
import { emptyMastery, recordMisconception, recordResult, solvedScore, type ResultSource } from "./mastery";
import { seededRng, shuffled } from "./random";
import type { ConceptMastery } from "./state";

function results(values: number[], source: ResultSource = "lesson", start = emptyMastery()): ConceptMastery {
  return values.reduce((m, s) => recordResult(m, s, source), start);
}

describe("solvedScore", () => {
  test("follows spec 5.9", () => {
    expect(solvedScore(0, 0, false)).toBe(1);
    expect(solvedScore(2, 0, false)).toBe(0.6);
    expect(solvedScore(0, 1, false)).toBe(0.3);
    expect(solvedScore(4, 0, true)).toBe(0.3);
  });
});

describe("recordResult", () => {
  test("moves the score 30% of the way to s x 100", () => {
    expect(results([1]).score).toBe(30);
    expect(results([1, 1]).score).toBe(51);
    expect(results([1, 1, 1]).score).toBe(65.7);
    expect(results([1, 1, 1, 1]).score).toBe(75.99);
    expect(results([0.6]).score).toBe(18);
    expect(results([1, 0]).score).toBe(21);
  });

  test("keeps the last 5 results", () => {
    expect(results([1, 0, 1, 0, 1, 0.6]).recent).toEqual([0, 1, 0, 1, 0.6]);
  });

  test("the ladder goes up after 2 right in a row and down after 2 wrong in a row", () => {
    expect(results([1]).level).toBe(1);
    expect(results([1, 0.6]).level).toBe(2);
    expect(results([1, 1, 1, 1]).level).toBe(3);
    expect(results([1, 1, 1, 1, 1, 1]).level).toBe(3);
    expect(results([1, 1, 0, 0]).level).toBe(1);
    expect(results([0, 0]).level).toBe(1);
    expect(results([1, 1, 0, 1, 0]).level).toBe(2);
  });

  test("a result with a hint (0.3) counts as wrong on the ladder", () => {
    expect(results([1, 1, 0.3, 0.3]).level).toBe(1);
  });

  test("flags help when fewer than 60% of at least 5 results are right", () => {
    expect(results([1, 0, 0, 1]).needsHelp).toBe(false);
    expect(results([1, 0, 0, 1, 0]).needsHelp).toBe(true);
    expect(results([1, 0, 1, 1, 0]).needsHelp).toBe(false);
  });

  test("flags help after 2 wrong review answers in a row, not after lesson answers", () => {
    expect(results([0, 0], "lesson").needsHelp).toBe(false);
    expect(results([0, 0], "review").needsHelp).toBe(true);
    expect(results([0, 1, 0], "review").needsHelp).toBe(false);
  });

  test("clears the flag and its causes when the score goes above 70", () => {
    const flagged = results([0, 0], "review");
    const cleared = results([1, 1, 1, 1], "lesson", flagged);
    expect(cleared.score).toBe(75.99);
    expect(cleared).toMatchObject({ needsHelp: false, reviewMisses: 0, misconceptions: 0 });
    expect(results([1, 1, 1], "lesson", flagged).needsHelp).toBe(true);
  });

  test("does not change the input", () => {
    const start = emptyMastery();
    recordResult(start, 1, "review");
    expect(start).toEqual(emptyMastery());
  });
});

describe("recordMisconception", () => {
  test("flags help at the third sighting", () => {
    const twice = recordMisconception(recordMisconception(emptyMastery()));
    expect(twice).toMatchObject({ misconceptions: 2, needsHelp: false });
    expect(recordMisconception(twice)).toMatchObject({ misconceptions: 3, needsHelp: true });
  });
});

describe("Leitner", () => {
  test("a new question answered right goes to box 2", () => {
    expect(reviewCard(undefined, true, "2026-10-06")).toEqual({ box: 2, due: "2026-10-08" });
    expect(reviewCard(undefined, false, "2026-10-06")).toEqual({ box: 1, due: "2026-10-07" });
  });

  test("right moves up 1 box until box 5, wrong goes back to box 1", () => {
    expect(reviewCard({ box: 3, due: "2026-10-06" }, true, "2026-10-06")).toEqual({ box: 4, due: "2026-10-13" });
    expect(reviewCard({ box: 5, due: "2026-10-06" }, true, "2026-10-06")).toEqual({ box: 5, due: "2026-10-20" });
    expect(reviewCard({ box: 4, due: "2026-10-06" }, false, "2026-10-06")).toEqual({ box: 1, due: "2026-10-07" });
    expect(LEITNER_DAYS).toEqual([1, 2, 4, 7, 14]);
  });

  test("a card is due on its day and after it", () => {
    const card = { box: 2, due: "2026-10-08" };
    expect(isDue(card, "2026-10-07")).toBe(false);
    expect(isDue(card, "2026-10-08")).toBe(true);
    expect(isDue(card, addDays("2026-10-08", 3))).toBe(true);
  });
});

describe("random", () => {
  test("the same seed gives the same numbers", () => {
    const a = seededRng(42);
    const b = seededRng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    expect(seededRng(1)()).not.toBe(seededRng(2)());
  });

  test("shuffled keeps every item and does not change the input", () => {
    const items = [1, 2, 3, 4, 5];
    const out = shuffled(items, seededRng(7));
    expect([...out].sort()).toEqual(items);
    expect(items).toEqual([1, 2, 3, 4, 5]);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/game/mastery.test.ts`
Expected: FAIL vì chưa có `./mastery`, `./leitner`, `./random`.

- [ ] **Step 3: Viết code**

`src/game/mastery.ts`:

```ts
import type { ConceptMastery } from "./state";

/** Learning constants of spec 5.9. The values marked (*) in the spec become parent settings in M4. */
export const MASTERY = {
  rate: 0.3,
  /** s: right at the first try, right after some tries, right with a hint or the solution, wrong. */
  score: { firstTry: 1, retried: 0.6, helped: 0.3, wrong: 0 },
  /** A result counts as right from this s. */
  rightFrom: 0.6,
  recent: 5,
  helpAccuracy: 0.6,
  helpMinResults: 5,
  helpMisconceptions: 3,
  helpReviewMisses: 2,
  clearHelpAbove: 70,
  ladderStep: 2,
} as const;

export type ResultSource = "lesson" | "review" | "practice";

export function emptyMastery(): ConceptMastery {
  return { score: 0, level: 1, run: 0, needsHelp: false, misconceptions: 0, recent: [], reviewMisses: 0 };
}

/** The s of a solved exercise (spec 5.9). */
export function solvedScore(failedSubmitsBefore: number, hintsUsed: number, viewedSolution: boolean): number {
  if (viewedSolution || hintsUsed > 0) return MASTERY.score.helped;
  return failedSubmitsBefore === 0 ? MASTERY.score.firstTry : MASTERY.score.retried;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

function shouldFlag(m: ConceptMastery): boolean {
  const right = m.recent.filter((s) => s >= MASTERY.rightFrom).length;
  const lowAccuracy = m.recent.length >= MASTERY.helpMinResults && right / m.recent.length < MASTERY.helpAccuracy;
  return lowAccuracy || m.misconceptions >= MASTERY.helpMisconceptions || m.reviewMisses >= MASTERY.helpReviewMisses;
}

/** Adds 1 result s (0 to 1) to a concept: score, ladder, recent results and the help flag. */
export function recordResult(current: ConceptMastery, s: number, source: ResultSource): ConceptMastery {
  const m: ConceptMastery = { ...current, recent: [...current.recent, s].slice(-MASTERY.recent) };
  m.score = round2(Math.min(100, Math.max(0, m.score + MASTERY.rate * (s * 100 - m.score))));
  const right = s >= MASTERY.rightFrom;
  m.run = right ? Math.max(0, m.run) + 1 : Math.min(0, m.run) - 1;
  if (m.run >= MASTERY.ladderStep) {
    m.level = Math.min(3, m.level + 1) as ConceptMastery["level"];
    m.run = 0;
  } else if (m.run <= -MASTERY.ladderStep) {
    m.level = Math.max(1, m.level - 1) as ConceptMastery["level"];
    m.run = 0;
  }
  if (source === "review") m.reviewMisses = right ? 0 : m.reviewMisses + 1;
  if (m.score > MASTERY.clearHelpAbove) {
    // Clearing the flag also clears what raised it, so it does not come back at once.
    m.needsHelp = false;
    m.misconceptions = 0;
    m.reviewMisses = 0;
  } else if (shouldFlag(m)) {
    m.needsHelp = true;
  }
  return m;
}

/** Counts 1 sighting of the misconception that belongs to this concept. */
export function recordMisconception(current: ConceptMastery): ConceptMastery {
  const m = { ...current, misconceptions: current.misconceptions + 1 };
  if (shouldFlag(m)) m.needsHelp = true;
  return m;
}
```

`src/game/leitner.ts`:

```ts
import { addDays } from "./dates";
import type { ReviewCard } from "./state";

/** Days until the next review for boxes 1 to 5 (spec 5.10). */
export const LEITNER_DAYS = [1, 2, 4, 7, 14] as const;

/** Right: 1 box up (at most 5). Wrong: back to box 1. A new question starts in box 1. */
export function reviewCard(card: ReviewCard | undefined, correct: boolean, today: string): ReviewCard {
  const box = correct ? Math.min(LEITNER_DAYS.length, (card?.box ?? 1) + 1) : 1;
  return { box, due: addDays(today, LEITNER_DAYS[box - 1] as number) };
}

export function isDue(card: ReviewCard, today: string): boolean {
  return card.due <= today;
}
```

`src/game/random.ts`:

```ts
export type Rng = () => number;

/** A small seeded generator (mulberry32): the same seed gives the same numbers. */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A shuffled copy (Fisher-Yates). */
export function shuffled<T>(items: readonly T[], rng: Rng): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy;
}
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run src/game/mastery.test.ts`
Expected: PASS (15 test). Điểm làm tròn 2 chữ số thập phân, nên `75.99` là giá trị chính xác.

- [ ] **Step 5: Commit**

```bash
git add src/game/mastery.ts src/game/leitner.ts src/game/random.ts src/game/mastery.test.ts
git commit -m "feat(game): mastery score, ladder, help flag, Leitner boxes and a seeded random generator

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Sự kiện game ghi thành thạo, Leitner, bài xếp lại và trạm ôn

**Files:**
- Modify: `src/game/rewards.ts`, `src/game/apply.ts`
- Test: `src/game/apply.test.ts`

**Interfaces:**
- Consumes: Task 3 (`emptyMastery`, `MASTERY`, `recordMisconception`, `recordResult`, `solvedScore`, `ResultSource`, `reviewCard`).
- Produces:
  - `ExerciseJudged` thêm `concepts?: string[]`, `misconceptions?: string[]`, `source?: ResultSource` (mặc định `[]`, `[]`, `"lesson"`).
  - `QuestionAnswered` thêm `concepts?: string[]`, `misconception?: string | null`, `source?: ResultSource`.
  - Sự kiện mới `{ type: "ReviewCompleted"; stationId: string | null; correct: number; total: number }` (`stationId: null` = ôn tập tự do).
  - `SolutionViewed` ghi `retry[exerciseId] = today + 1`.
  - `XP.review = 5`, `XP.reviewPerCorrect = 2`, `XU.review = 10`, `XU.reviewPerfect = 5`, `POINTS.review = 1`, `PIN_REVIEW = 2`, `RETRY_AFTER_DAYS = 1`.

- [ ] **Step 1: Viết test thất bại**

Thêm vào cuối `src/game/apply.test.ts`:

```ts
describe("mastery and Leitner", () => {
  const question = (questionId: string, correct: boolean, extra: Partial<Extract<GameEvent, { type: "QuestionAnswered" }>> = {}): GameEvent => ({
    type: "QuestionAnswered",
    questionId,
    correct,
    concepts: ["c1"],
    ...extra,
  });

  test("a solved exercise updates the score of each concept", () => {
    const state = run(initialGameState("2026-10-06"), [
      ["2026-10-06", solved("x", { concepts: ["c1", "c2"] })],
      ["2026-10-06", solved("y", { concepts: ["c1"], failedSubmitsBefore: 2 })],
    ]);
    expect(state.mastery.c1).toMatchObject({ score: 39, recent: [1, 0.6], level: 2 });
    expect(state.mastery.c2).toMatchObject({ score: 30, recent: [1] });
  });

  test("a hint or the solution makes s = 0.3", () => {
    const hinted = apply(initialGameState("2026-10-06"), solved("x", { concepts: ["c1"], hintsUsed: 1 }), at("2026-10-06"));
    expect(hinted.mastery.c1!.score).toBe(9);
  });

  test("a failed submit adds no result but counts the misconceptions it shows", () => {
    const state = run(initialGameState("2026-10-06"), [
      ["2026-10-06", solved("x", { accepted: false, concepts: ["c1"], misconceptions: ["m1"] })],
      ["2026-10-06", solved("x", { accepted: false, concepts: ["c1"], misconceptions: ["m1"] })],
      ["2026-10-06", solved("x", { accepted: false, concepts: ["c1"], misconceptions: ["m1"] })],
    ]);
    expect(state.mastery.c1).toBeUndefined();
    expect(state.mastery.m1).toMatchObject({ misconceptions: 3, needsHelp: true });
  });

  test("a question answer updates the score, the misconception and the Leitner box", () => {
    const state = run(initialGameState("2026-10-06"), [
      ["2026-10-06", question("q", false, { misconception: "m1" })],
      ["2026-10-07", question("q", true)],
    ]);
    expect(state.mastery.c1).toMatchObject({ score: 30, recent: [0, 1] });
    expect(state.mastery.m1).toMatchObject({ misconceptions: 1 });
    expect(state.reviews.q).toEqual({ box: 2, due: "2026-10-09" });
  });

  test("a review answer pays no XP and does not change the lesson progress", () => {
    const state = apply(initialGameState("2026-10-06"), question("q", true, { source: "review" }), at("2026-10-06"));
    expect(state.pet.xp).toBe(0);
    expect(state.progress.answeredQuestions).toEqual([]);
    expect(state.reviews.q).toEqual({ box: 2, due: "2026-10-08" });
    expect(state.mastery.c1!.score).toBe(30);
  });

  test("2 wrong review answers in a row flag the concept", () => {
    const state = run(initialGameState("2026-10-06"), [
      ["2026-10-06", question("q", false, { source: "review" })],
      ["2026-10-06", question("r", false, { source: "review" })],
    ]);
    expect(state.mastery.c1!.needsHelp).toBe(true);
  });

  test("a solved review exercise pays nothing and is not marked solved", () => {
    const state = apply(initialGameState("2026-10-06"), solved("x", { concepts: ["c1"], source: "review" }), at("2026-10-06"));
    expect(state.pet.xp).toBe(0);
    expect(state.wallet.xu).toBe(0);
    expect(state.progress.solvedExercises).toEqual([]);
    expect(state.mastery.c1!.score).toBe(30);
  });

  test("a shown solution brings the exercise back the next day until it is solved without help", () => {
    const shown = apply(initialGameState("2026-10-06"), { type: "SolutionViewed", exerciseId: "x" }, at("2026-10-06"));
    expect(shown.retry).toEqual({ x: "2026-10-07" });
    const helped = apply(shown, solved("x", { viewedSolution: true }), at("2026-10-06"));
    expect(helped.retry).toEqual({ x: "2026-10-07" });
    const later = apply(helped, solved("x", { source: "review" }), at("2026-10-07"));
    expect(later.retry).toEqual({});
  });
});

describe("ReviewCompleted", () => {
  const review = (stationId: string | null, correct: number, total = 5): GameEvent => ({
    type: "ReviewCompleted",
    stationId,
    correct,
    total,
  });

  test("the first run of a station pays XP, xu, Pin and 1 activity point", () => {
    const start = initialGameState("2026-10-06");
    start.pet.pin = 2;
    const state = apply(start, review("s.r1", 4), at("2026-10-06"));
    expect(state.pet.xp).toBe(13);
    expect(state.wallet.xu).toBe(10);
    expect(state.pet.pin).toBe(4);
    expect(state.progress.completedReviews).toEqual(["s.r1"]);
    expect(state.streak.points).toBe(1);
    expect(state.week.lessonsDone).toBe(0);
    expect(state.activity.lastActiveDay).toBe("2026-10-06");
  });

  test("all answers right adds 5 xu", () => {
    expect(apply(initialGameState("2026-10-06"), review("s.r1", 5), at("2026-10-06")).wallet.xu).toBe(15);
  });

  test("a repeated station or a free review pays XP and Pin but no xu", () => {
    const once = apply(initialGameState("2026-10-06"), review("s.r1", 5), at("2026-10-06"));
    const again = apply(once, review("s.r1", 5), at("2026-10-06"));
    expect(again.wallet.xu).toBe(15);
    expect(again.pet.xp).toBe(30);
    const free = apply(initialGameState("2026-10-06"), review(null, 2), at("2026-10-06"));
    expect(free).toMatchObject({ wallet: { xu: 0 }, pet: { xp: 9, pin: 5 } });
    expect(free.progress.completedReviews).toEqual([]);
  });

  test("an empty station pays the base reward without the all-right bonus", () => {
    const state = apply(initialGameState("2026-10-06"), review("s.r1", 0, 0), at("2026-10-06"));
    expect(state.pet.xp).toBe(5);
    expect(state.wallet.xu).toBe(10);
  });

  test("a review and a lesson on the same day reach the daily goal", () => {
    const state = run(initialGameState("2026-10-06"), [
      ["2026-10-06", lesson("a")],
      ["2026-10-06", review("s.r1", 3)],
    ]);
    expect(state.streak).toMatchObject({ points: 2, current: 1 });
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/game/apply.test.ts`
Expected: FAIL: `ReviewCompleted` chưa có, `mastery`/`reviews`/`retry` không đổi.

- [ ] **Step 3: Viết code**

`src/game/rewards.ts` (thay toàn bộ file):

```ts
export const XP = {
  lesson: 10,
  codeFirstTry: 15,
  codeAfterRetries: 10,
  codeAfterSolution: 3,
  question: 3,
  review: 5,
  reviewPerCorrect: 2,
} as const;

export const XU = {
  codeFirstSubmit: 5,
  noHintBonus: 3,
  persistenceBonus: 5,
  weekPlanMet: 50,
  weekPlanExceeded: 100,
  review: 10,
  reviewPerfect: 5,
} as const;

/** Failed submits before a correct one that earn the persistence bonus. */
export const PERSISTENCE_FAILS = 3;

/** Streak length -> bonus xu. */
export const STREAK_MILESTONES: Readonly<Record<number, number>> = { 3: 20, 7: 50, 14: 100, 30: 250 };

export const FREEZE_EVERY = 7;
export const MAX_FREEZES = 2;
export const WEEK_EXCEED_RATIO = 1.3;
export const POINTS = { lesson: 1, review: 1 } as const;
/** Pin from a review station (spec 5.6). */
export const PIN_REVIEW = 2;
/** Days before an exercise whose solution was shown comes back (spec 5.9: 1 to 2 days). */
export const RETRY_AFTER_DAYS = 1;
export const CORRECT_RUN_FOR_VUI = 3;
```

`src/game/apply.ts` (thay toàn bộ file):

```ts
import { addDays, daysBetween, localDay, weekStart } from "./dates";
import { reviewCard } from "./leitner";
import { emptyMastery, MASTERY, recordMisconception, recordResult, solvedScore, type ResultSource } from "./mastery";
import {
  CORRECT_RUN_FOR_VUI,
  FREEZE_EVERY,
  MAX_FREEZES,
  PERSISTENCE_FAILS,
  PIN_REVIEW,
  POINTS,
  RETRY_AFTER_DAYS,
  STREAK_MILESTONES,
  WEEK_EXCEED_RATIO,
  XP,
  XU,
} from "./rewards";
import {
  STAT_MAX,
  WARNING_LIMIT,
  type ConceptMastery,
  type ExerciseStats,
  type GameSettings,
  type GameState,
} from "./state";

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
      /** The exercise's concepts. Default: none. */
      concepts?: string[];
      /** The misconceptions the judge found. Default: none. */
      misconceptions?: string[];
      /** Where the exercise was done. Default: "lesson". */
      source?: ResultSource;
    }
  | {
      type: "QuestionAnswered";
      questionId: string;
      correct: boolean;
      concepts?: string[];
      /** The misconception of the chosen wrong answer. */
      misconception?: string | null;
      source?: ResultSource;
    }
  | { type: "ReviewCompleted"; stationId: string | null; correct: number; total: number }
  | { type: "HintShown"; exerciseId: string }
  | { type: "SolutionViewed"; exerciseId: string };

const ACTIVITY_EVENTS: ReadonlySet<GameEvent["type"]> = new Set([
  "LessonCompleted",
  "ExerciseJudged",
  "QuestionAnswered",
  "ReviewCompleted",
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
      answerQuestion(next, event, today);
      break;
    case "ReviewCompleted":
      completeReview(next, event, today, rollback);
      break;
    case "HintShown":
      statsFor(next, event.exerciseId).hints += 1;
      break;
    case "SolutionViewed":
      statsFor(next, event.exerciseId).viewedSolution = true;
      next.retry[event.exerciseId] = addDays(today, RETRY_AFTER_DAYS);
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

function statsFor(s: GameState, exerciseId: string): ExerciseStats {
  const all = (s.progress.exerciseStats ??= {});
  return (all[exerciseId] ??= { fails: 0, hints: 0, viewedSolution: false });
}

function updateMastery(s: GameState, conceptId: string, change: (m: ConceptMastery) => ConceptMastery): void {
  s.mastery[conceptId] = change(s.mastery[conceptId] ?? emptyMastery());
}

function judgeExercise(s: GameState, e: Extract<GameEvent, { type: "ExerciseJudged" }>): void {
  const source = e.source ?? "lesson";
  for (const id of e.misconceptions ?? []) updateMastery(s, id, recordMisconception);
  if (e.accepted) {
    const score = solvedScore(e.failedSubmitsBefore, e.hintsUsed, e.viewedSolution);
    for (const id of e.concepts ?? []) updateMastery(s, id, (m) => recordResult(m, score, source));
    if (!e.viewedSolution) delete s.retry[e.exerciseId];
  }
  // A review station pays for the whole station (ReviewCompleted), not per exercise.
  if (source === "review") return;
  const solved = s.progress.solvedExercises.includes(e.exerciseId);
  if (!e.accepted) {
    s.pet.correctRun = 0;
    if (!solved) statsFor(s, e.exerciseId).fails += 1;
    return;
  }
  if (solved) return;
  s.progress.solvedExercises.push(e.exerciseId);
  // The stored stats survive a reload; the event only knows what the current screen saw.
  const stored = s.progress.exerciseStats?.[e.exerciseId];
  const failedSubmitsBefore = Math.max(e.failedSubmitsBefore, stored?.fails ?? 0);
  const hintsUsed = Math.max(e.hintsUsed, stored?.hints ?? 0);
  const viewedSolution = e.viewedSolution || (stored?.viewedSolution ?? false);
  if (viewedSolution) {
    s.pet.xp += XP.codeAfterSolution;
    s.pet.correctRun = 0;
    return;
  }
  if (failedSubmitsBefore === 0) {
    s.pet.xp += XP.codeFirstTry;
    s.wallet.xu += XU.codeFirstSubmit + (hintsUsed === 0 ? XU.noHintBonus : 0);
    bumpCorrectRun(s);
    return;
  }
  s.pet.xp += XP.codeAfterRetries;
  if (failedSubmitsBefore >= PERSISTENCE_FAILS) s.wallet.xu += XU.persistenceBonus;
  s.pet.correctRun = 0;
}

function answerQuestion(s: GameState, e: Extract<GameEvent, { type: "QuestionAnswered" }>, today: string): void {
  const source = e.source ?? "lesson";
  const score = e.correct ? MASTERY.score.firstTry : MASTERY.score.wrong;
  for (const id of e.concepts ?? []) updateMastery(s, id, (m) => recordResult(m, score, source));
  if (!e.correct && e.misconception) updateMastery(s, e.misconception, recordMisconception);
  s.reviews[e.questionId] = reviewCard(s.reviews[e.questionId], e.correct, today);
  if (source === "review") return;
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

function completeReview(
  s: GameState,
  e: Extract<GameEvent, { type: "ReviewCompleted" }>,
  today: string,
  rollback: boolean,
): void {
  const total = Math.max(0, e.total);
  const correct = Math.max(0, Math.min(e.correct, total));
  const first = e.stationId !== null && !s.progress.completedReviews.includes(e.stationId);
  if (first) s.progress.completedReviews.push(e.stationId as string);
  s.pet.xp += XP.review + XP.reviewPerCorrect * correct;
  s.pet.pin = Math.min(STAT_MAX, s.pet.pin + PIN_REVIEW);
  // Xu only for the first run of a station on the map, so repeated reviews cannot farm xu.
  if (first) s.wallet.xu += XU.review + (total > 0 && correct === total ? XU.reviewPerfect : 0);
  if (!rollback) addPoints(s, POINTS.review, today);
}
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run src/game && npm run typecheck`
Expected: PASS. Các test cũ của `apply.test.ts` không đổi vì trường mới có giá trị mặc định.

- [ ] **Step 5: Commit**

```bash
git add src/game/rewards.ts src/game/apply.ts src/game/apply.test.ts
git commit -m "feat(game): answers update mastery and Leitner boxes; review stations pay XP, Pin and first-run xu

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 5: Định dạng nội dung: parsons, fill, bài luyện 3 mức, trạm ôn

**Files:**
- Modify: `src/content/types.ts`, `src/content/lookup.ts`, `tools/content/schema.ts`, `tools/content/buildBundle.ts`, `tools/content/references.ts`, `tools/build_content.ts`, `src/test/fixtures.ts`, `src/ui/LessonScreen.tsx`
- Create: `src/content/exercise.ts`, `tools/content/coverage.ts`
- Test: `tools/content/buildBundle.test.ts`, `src/content/lookup.test.ts`

**Interfaces:**
- Consumes: không có.
- Produces:
  - `ParsonsExercise { id; type: "parsons"; concepts; prompt; lines: string[]; solution: string; tests; hints; compare; testEligible }`.
  - `FILL_BLANK = "___"`; `FillExercise { id; type: "fill"; concepts; prompt; template: string; answers: string[]; solution: string; tests; hints; compare; testEligible }`.
  - `type TestedExercise = CodeExercise | ParsonsExercise | FillExercise`; `type Exercise = TestedExercise | ChoiceQuestion`; `isChoiceQuestion(item: Exercise): item is ChoiceQuestion`.
  - `ConceptPractice { level1: string[]; level2: string[]; level3: string[] }`; `Concept` thêm `misconceptionHtml: string | null`, `practice: ConceptPractice`.
  - `ReviewStation { id: string; after: string }`; `Topic` thêm `reviews: ReviewStation[]`, `practice: TestedExercise[]`.
  - `parsonsLines(solution: string): string[]`, `fillTemplate(template: string, answers: readonly string[]): string` (`src/content/exercise.ts`).
  - `allExercises` gồm cả `topic.practice`; `findItem(bundle, id): Exercise | undefined`; `allConcepts(bundle): Concept[]`; `findConcept(bundle, id): Concept | undefined`.
  - `contentWarnings(bundle): string[]` (`tools/content/coverage.ts`).
  - Định dạng file nội dung mới:

    ```yaml
    # topic.yaml
    reviews:
      - { id: s1.a.r1, after: s1.a.l2 }   # trạm ôn đặt sau bài s1.a.l2
    # concepts.yaml, trong 1 khái niệm
    practice: { level1: [s1.a.b1], level2: [s1.a.p1], level3: [s1.a.l1.ex1] }
    # practice.yaml (không bắt buộc): bài code/parsons/fill không thuộc bài học nào
    exercises:
      - id: s1.a.p1
        type: parsons
        prompt: { vi: Sắp xếp các dòng }
        solution: |            # chương trình đúng; mỗi dòng không trống là 1 mảnh
          print("A")
          print("B")
        tests: [{ output: "A\nB" }]
      - id: s1.a.f1
        type: fill
        prompt: { vi: Điền chỗ trống }
        template: |
          print(___)
        answers: ['"Hi"']      # 1 đáp án cho mỗi ___
        tests: [{ output: Hi }]
    ```

- [ ] **Step 1: Viết test thất bại**

`tools/content/buildBundle.test.ts`:

1. Thêm import:

```ts
import { fillTemplate, parsonsLines } from "../../src/content/exercise";
import { contentWarnings } from "./coverage";
```

2. Trong test `builds a bundle from a valid tree`, thay khối `expect(topic.concepts).toEqual([...])` bằng:

```ts
    expect(topic.concepts).toEqual([
      {
        id: "print-call",
        name: { vi: "Lệnh print" },
        misconceptionCard: null,
        misconceptionHtml: null,
        parentTip: null,
        practice: { level1: [], level2: [], level3: [] },
      },
    ]);
    expect(topic.reviews).toEqual([]);
    expect(topic.practice).toEqual([]);
```

3. Thêm các test sau vào cuối `describe("buildBundle", ...)`:

```ts
  test("builds parsons and fill exercises, practice files, review stations and concept practice", () => {
    const practice = [
      "exercises:",
      "  - id: s1.a.p1",
      "    type: parsons",
      "    concepts: [print-call]",
      "    prompt: { vi: Sắp xếp }",
      "    solution: |",
      "      print(\"A\")",
      "",
      "      print(\"B\")",
      "    tests:",
      "      - { output: \"A\\nB\" }",
      "  - id: s1.a.f1",
      "    type: fill",
      "    concepts: [print-call]",
      "    prompt: { vi: Điền }",
      "    template: |",
      "      print(___)",
      "    answers: ['\"Hi\"']",
      "    tests:",
      "      - { output: Hi }",
      "",
    ].join("\n");
    const concepts = [
      "concepts:",
      "  - id: print-call",
      "    name: { vi: Lệnh print }",
      "    misconception_card: Viết **print** thường.",
      "    parent_tip: Đọc to lệnh print.",
      "    practice: { level1: [s1.a.b1], level2: [s1.a.p1, s1.a.f1], level3: [s1.a.l1.ex1] }",
      "",
    ].join("\n");
    const questions = minimalTree()["stage-1/01-a/questions.yaml"]!.replace("    type: mcq\n", "    type: mcq\n    concepts: [print-call]\n");
    const bundle = buildBundle(
      writeTree(
        minimalTree({
          "stage-1/01-a/topic.yaml":
            "id: s1.a\ntitle: { vi: Chủ đề A }\nlessons: [01-x.md]\nreviews:\n  - { id: s1.a.r1, after: s1.a.l1 }\n",
          "stage-1/01-a/concepts.yaml": concepts,
          "stage-1/01-a/questions.yaml": questions,
          "stage-1/01-a/practice.yaml": practice,
        }),
      ),
    );
    const topic = bundle.stages[0]!.topics[0]!;
    expect(topic.reviews).toEqual([{ id: "s1.a.r1", after: "s1.a.l1" }]);
    expect(topic.practice[0]).toMatchObject({ type: "parsons", lines: ['print("A")', 'print("B")'], solution: 'print("A")\nprint("B")\n' });
    expect(topic.practice[1]).toMatchObject({ type: "fill", template: "print(___)\n", answers: ['"Hi"'], solution: 'print("Hi")\n' });
    expect(topic.concepts[0]!.misconceptionHtml).toBe("<p>Viết <strong>print</strong> thường.</p>\n");
    expect(topic.concepts[0]!.practice).toEqual({ level1: ["s1.a.b1"], level2: ["s1.a.p1", "s1.a.f1"], level3: ["s1.a.l1.ex1"] });
    expect(contentWarnings(bundle)).toEqual([]);
  });

  test("reports bad parsons and fill exercises", () => {
    const practice = [
      "exercises:",
      "  - { id: s1.a.p1, type: parsons, prompt: { vi: P }, solution: 'print(1)', tests: [{ output: '1' }] }",
      "  - { id: s1.a.f1, type: fill, prompt: { vi: F }, template: 'print(___, ___)', answers: ['1'], tests: [{ output: '1' }] }",
      "  - { id: s1.a.q9, type: mcq, prompt: { vi: Q, en: Q }, choices: [{ text: A, correct: true }, { text: B }], explanation: { vi: E, en: E } }",
      "",
    ].join("\n");
    expect(problemsOf(minimalTree({ "stage-1/01-a/practice.yaml": practice }))).toEqual([
      expect.stringContaining("Bài parsons cần ít nhất 2 dòng khác nhau"),
      expect.stringContaining("Mẫu có 2 chỗ trống ___ nhưng có 1 đáp án"),
      expect.stringContaining("practice.yaml chỉ chứa bài code, parsons hoặc fill"),
    ]);
  });

  test("reports bad review stations and practice references", () => {
    const topic = "id: s1.a\ntitle: { vi: A }\nlessons: [01-x.md]\nreviews:\n  - { id: s1.a.r1, after: s1.a.l9 }\n  - { id: s1.a.b1, after: s1.a.l1 }\n";
    const concepts =
      "concepts:\n  - id: print-call\n    name: { vi: P }\n    practice: { level1: [s1.a.l1.ex1], level3: [nope] }\n";
    expect(problemsOf(minimalTree({ "stage-1/01-a/topic.yaml": topic, "stage-1/01-a/concepts.yaml": concepts }))).toEqual([
      's1.a.r1: trạm ôn phải đặt sau 1 bài học của chủ đề s1.a, không có "s1.a.l9"',
      'ID trùng "s1.a.b1": câu hỏi và trạm ôn',
      'print-call: practice.level1: bài "s1.a.l1.ex1" có type code, mức này cần predict hoặc mcq',
      'print-call: practice.level3: bài "nope" không tồn tại',
    ]);
  });

  test("warns about concepts without a card, a tip or practice at every level", () => {
    const bundle = buildBundle(writeTree(minimalTree()));
    expect(contentWarnings(bundle)).toEqual([
      "print-call: thiếu thẻ hiểu lầm, gợi ý cho phụ huynh, bài luyện level1, bài luyện level2, bài luyện level3",
    ]);
  });

  test("parsonsLines and fillTemplate", () => {
    expect(parsonsLines("a\r\n\n  b  \n")).toEqual(["a", "  b"]);
    expect(fillTemplate("x = ___ + ___", ["1", "2"])).toBe("x = 1 + 2");
    expect(fillTemplate("print(1)", [])).toBe("print(1)");
  });
```

`src/content/lookup.test.ts`:

1. Đổi 2 dòng import:

```ts
import { allExercises, allLessons, findConcept, findItem, findLesson } from "./lookup";
import type { ChoiceQuestion, CodeExercise, ContentBundle, FillExercise, Lesson } from "./types";
```

2. Chủ đề trong `bundle` có thêm `reviews: []` và `practice: []`:

```ts
      topics: [
        { id: "a", title: { vi: "A" }, lessons: [lesson1, lesson2], concepts: [], questions: [question], reviews: [], practice: [] },
      ],
```

3. Thêm vào cuối file:

```ts
test("findItem and findConcept look in lessons, banks and practice files", () => {
  const concept = {
    id: "c1",
    name: { vi: "K" },
    misconceptionCard: null,
    misconceptionHtml: null,
    parentTip: null,
    practice: { level1: [], level2: [], level3: [] },
  };
  const fill: FillExercise = {
    id: "a.f1",
    type: "fill",
    concepts: [],
    prompt: { vi: "Điền" },
    template: "print(___)",
    answers: ['"Hi"'],
    solution: 'print("Hi")',
    tests: code.tests,
    hints: [],
    compare: { kind: "exact" },
    testEligible: false,
  };
  const withPractice: ContentBundle = {
    ...bundle,
    stages: [{ ...bundle.stages[0]!, topics: [{ ...bundle.stages[0]!.topics[0]!, concepts: [concept], practice: [fill] }] }],
  };
  expect(findItem(withPractice, "a.l1.ex1")).toBe(code);
  expect(findItem(withPractice, "a.b1")).toBe(question);
  expect(findItem(withPractice, "a.f1")).toBe(fill);
  expect(findItem(withPractice, "nope")).toBeUndefined();
  expect(findConcept(withPractice, "c1")).toBe(concept);
  expect(findConcept(withPractice, "nope")).toBeUndefined();
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run tools src/content/lookup.test.ts`
Expected: FAIL vì chưa có `src/content/exercise.ts`, `tools/content/coverage.ts`, `findItem`, `findConcept`, và `Concept` chưa có `practice`.

- [ ] **Step 3: Viết code**

`src/content/types.ts` (thay toàn bộ file):

```ts
import type { LocalizedText } from "../i18n/lang";

export type { Lang, LocalizedText } from "../i18n/lang";

export interface TestCase {
  input: string;
  output: string;
  hidden: boolean;
}

/** A typical wrong output for one test case, and the misconception it reveals. */
export interface CommonWrong {
  test: number;
  output: string;
  misconception: string;
  sample: string;
}

export type CompareMode = { kind: "exact" } | { kind: "float"; tolerance: number };

export interface CodeExercise {
  id: string;
  type: "code";
  concepts: string[];
  prompt: LocalizedText;
  starter: string;
  solution: string;
  tests: TestCase[];
  commonWrong: CommonWrong[];
  hints: LocalizedText[];
  compare: CompareMode;
  testEligible: boolean;
}

/** Lines of a correct program in a shuffled order; the child puts them back in order (spec 3.4). */
export interface ParsonsExercise {
  id: string;
  type: "parsons";
  concepts: string[];
  prompt: LocalizedText;
  /** The program's lines in the right order, indentation included. */
  lines: string[];
  solution: string;
  tests: TestCase[];
  hints: LocalizedText[];
  compare: CompareMode;
  testEligible: boolean;
}

/** The marker of a blank in a fill template. */
export const FILL_BLANK = "___";

/** A program with blanks; the child types the missing parts (spec 3.4). */
export interface FillExercise {
  id: string;
  type: "fill";
  concepts: string[];
  prompt: LocalizedText;
  /** The program with each blank written as ___. */
  template: string;
  /** 1 answer per blank, in order. */
  answers: string[];
  solution: string;
  tests: TestCase[];
  hints: LocalizedText[];
  compare: CompareMode;
  testEligible: boolean;
}

/** An exercise graded by running code against test cases. */
export type TestedExercise = CodeExercise | ParsonsExercise | FillExercise;

export interface Choice {
  text: LocalizedText;
  correct: boolean;
  /** True when this choice means "the code stops with an error". */
  error: boolean;
  misconception: string | null;
}

export interface ChoiceQuestion {
  id: string;
  type: "predict" | "mcq";
  concepts: string[];
  lessons: string[];
  code: string | null;
  prompt: LocalizedText;
  choices: Choice[];
  explanation: LocalizedText;
}

export type Exercise = TestedExercise | ChoiceQuestion;

export function isChoiceQuestion(item: Exercise): item is ChoiceQuestion {
  return item.type === "predict" || item.type === "mcq";
}

export type CardSegment =
  | { kind: "html"; html: string }
  | { kind: "code"; code: string; run: boolean; expectError: boolean };

export interface Card {
  segments: CardSegment[];
}

export interface Lesson {
  id: string;
  title: LocalizedText;
  cards: Card[];
  exercises: Exercise[];
}

/** Practice item IDs per ladder level (spec 3.6): 1 = predict/mcq, 2 = parsons/fill, 3 = code. */
export interface ConceptPractice {
  level1: string[];
  level2: string[];
  level3: string[];
}

export interface Concept {
  id: string;
  name: LocalizedText;
  /** Markdown, as written in concepts.yaml. */
  misconceptionCard: string | null;
  /** The misconception card as HTML, ready to show. */
  misconceptionHtml: string | null;
  parentTip: string | null;
  practice: ConceptPractice;
}

/** A review station on the map, placed after a lesson of its topic. */
export interface ReviewStation {
  id: string;
  after: string;
}

export interface Topic {
  id: string;
  title: LocalizedText;
  lessons: Lesson[];
  concepts: Concept[];
  questions: ChoiceQuestion[];
  reviews: ReviewStation[];
  /** Practice exercises that belong to no lesson (practice.yaml). */
  practice: TestedExercise[];
}

export interface Stage {
  id: string;
  title: LocalizedText;
  topics: Topic[];
}

export const CHECK_NAMES = ["similar-name", "assign-in-condition", "while-loop"] as const;
export type CheckName = (typeof CHECK_NAMES)[number];

export interface BilingualText {
  vi: string;
  en: string;
}

export interface ErrorEntry {
  id: string;
  match: { type: string; message: string | null; check: CheckName | null };
  explain: BilingualText;
  hint: BilingualText | null;
  misconception: string | null;
  sample: string;
  sampleInput: string;
}

export interface ContentBundle {
  stages: Stage[];
  errors: ErrorEntry[];
}
```

`src/content/exercise.ts`:

```ts
import { FILL_BLANK } from "./types";

/** The lines of a parsons program: blank lines dropped, indentation kept. */
export function parsonsLines(solution: string): string[] {
  return solution
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() !== "");
}

/** Puts the answers into the blanks of a fill template, in order. */
export function fillTemplate(template: string, answers: readonly string[]): string {
  return template
    .split(FILL_BLANK)
    .map((part, i) => (i === 0 ? part : (answers[i - 1] ?? "") + part))
    .join("");
}
```

`src/content/lookup.ts` (thay toàn bộ file):

```ts
import type { Concept, ContentBundle, Exercise, Lesson } from "./types";

export function allLessons(bundle: ContentBundle): Lesson[] {
  return bundle.stages.flatMap((stage) => stage.topics.flatMap((topic) => topic.lessons));
}

export function findLesson(bundle: ContentBundle, id: string): Lesson | undefined {
  return allLessons(bundle).find((lesson) => lesson.id === id);
}

export function allExercises(bundle: ContentBundle): Exercise[] {
  return bundle.stages.flatMap((stage) =>
    stage.topics.flatMap((topic) => [
      ...topic.lessons.flatMap((lesson) => lesson.exercises),
      ...topic.questions,
      ...topic.practice,
    ]),
  );
}

export function findItem(bundle: ContentBundle, id: string): Exercise | undefined {
  return allExercises(bundle).find((item) => item.id === id);
}

export function allConcepts(bundle: ContentBundle): Concept[] {
  return bundle.stages.flatMap((stage) => stage.topics.flatMap((topic) => topic.concepts));
}

export function findConcept(bundle: ContentBundle, id: string): Concept | undefined {
  return allConcepts(bundle).find((concept) => concept.id === id);
}
```

`tools/content/schema.ts` (thay toàn bộ file):

```ts
import { marked } from "marked";
import { z } from "zod";
import { fillTemplate, parsonsLines } from "../../src/content/exercise";
import {
  CHECK_NAMES,
  FILL_BLANK,
  type Choice,
  type ChoiceQuestion,
  type CodeExercise,
  type CompareMode,
  type Concept,
  type ErrorEntry,
  type Exercise,
  type FillExercise,
  type ParsonsExercise,
} from "../../src/content/types";
import type { LocalizedText } from "../../src/i18n/lang";

const ID_PATTERN = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const idSchema = z.string().regex(ID_PATTERN, "ID chỉ gồm chữ thường không dấu, số, dấu chấm và dấu gạch ngang");
const localizedSchema = z.object({ vi: z.string().min(1), en: z.string().min(1).optional() }).strict();
const bilingualSchema = z.object({ vi: z.string().min(1), en: z.string().min(1) }).strict();

const testCaseSchema = z
  .object({ input: z.string().default(""), output: z.string(), hidden: z.boolean().default(false) })
  .strict();

const commonWrongSchema = z
  .object({
    test: z.number().int().min(0).default(0),
    output: z.string(),
    misconception: idSchema,
    sample: z.string().min(1),
  })
  .strict();

type TestedRaw = {
  prompt: { vi: string; en?: string | undefined };
  tests: unknown[];
  compare: "exact" | "float";
  tolerance?: number | undefined;
  test_eligible: boolean;
};

/** Rules shared by every exercise graded with test cases. */
function refineTested(ex: TestedRaw, ctx: z.RefinementCtx): void {
  if (ex.test_eligible && ex.prompt.en === undefined) {
    ctx.addIssue({
      code: "custom",
      path: ["prompt", "en"],
      message: "Bài code dùng trong đề kiểm tra (test_eligible) phải có bản tiếng Anh",
    });
  }
  if (ex.compare === "float" && ex.tolerance === undefined) {
    ctx.addIssue({ code: "custom", path: ["tolerance"], message: "compare: float cần có tolerance" });
  }
}

const testedFields = {
  id: idSchema,
  concepts: z.array(idSchema).default([]),
  prompt: localizedSchema,
  tests: z.array(testCaseSchema).min(1),
  hints: z.array(localizedSchema).default([]),
  compare: z.enum(["exact", "float"]).default("exact"),
  tolerance: z.number().positive().optional(),
  test_eligible: z.boolean().default(false),
};

const parsonsSchema = z
  .object({ ...testedFields, type: z.literal("parsons"), solution: z.string().min(1) })
  .strict()
  .superRefine((ex, ctx) => {
    refineTested(ex, ctx);
    const lines = parsonsLines(ex.solution);
    if (new Set(lines).size < 2) {
      ctx.addIssue({ code: "custom", path: ["solution"], message: "Bài parsons cần ít nhất 2 dòng khác nhau" });
    }
  });

const fillSchema = z
  .object({
    ...testedFields,
    type: z.literal("fill"),
    template: z.string().min(1),
    answers: z.array(z.string().min(1).regex(/^[^\n]*$/, "Đáp án chỉ có 1 dòng")).min(1),
  })
  .strict()
  .superRefine((ex, ctx) => {
    refineTested(ex, ctx);
    const blanks = ex.template.split(FILL_BLANK).length - 1;
    if (blanks !== ex.answers.length) {
      ctx.addIssue({
        code: "custom",
        path: ["answers"],
        message: `Mẫu có ${blanks} chỗ trống ___ nhưng có ${ex.answers.length} đáp án`,
      });
    }
  });

const codeExerciseSchema = z
  .object({
    id: idSchema,
    type: z.literal("code"),
    concepts: z.array(idSchema).default([]),
    prompt: localizedSchema,
    starter: z.string().default(""),
    solution: z.string().min(1),
    tests: z.array(testCaseSchema).min(1),
    common_wrong: z.array(commonWrongSchema).default([]),
    hints: z.array(localizedSchema).default([]),
    compare: z.enum(["exact", "float"]).default("exact"),
    tolerance: z.number().positive().optional(),
    test_eligible: z.boolean().default(false),
  })
  .strict()
  .superRefine((ex, ctx) => {
    refineTested(ex, ctx);
    ex.common_wrong.forEach((cw, i) => {
      if (cw.test >= ex.tests.length) {
        ctx.addIssue({ code: "custom", path: ["common_wrong", i, "test"], message: "test vượt quá số test case" });
      }
    });
  });

const choiceSchema = z
  .object({
    text: z.string().min(1).optional(),
    vi: z.string().optional(),
    en: z.string().optional(),
    correct: z.boolean().default(false),
    error: z.boolean().default(false),
    misconception: idSchema.optional(),
  })
  .strict()
  .superRefine((choice, ctx) => {
    const hasText = choice.text !== undefined;
    const hasLocalized = choice.vi !== undefined || choice.en !== undefined;
    if (hasText === hasLocalized) {
      ctx.addIssue({ code: "custom", path: [], message: "Lựa chọn phải có text (trung tính) hoặc có vi + en" });
    } else if (hasLocalized && (!choice.vi || !choice.en)) {
      ctx.addIssue({ code: "custom", path: [], message: "Lựa chọn song ngữ phải có đủ vi và en" });
    }
  });

const choiceQuestionSchema = z
  .object({
    id: idSchema,
    type: z.enum(["predict", "mcq"]),
    concepts: z.array(idSchema).default([]),
    lessons: z.array(idSchema).default([]),
    code: z.string().min(1).optional(),
    prompt: bilingualSchema,
    choices: z.array(choiceSchema).min(2).max(6),
    explanation: bilingualSchema,
  })
  .strict()
  .superRefine((q, ctx) => {
    if (q.type === "predict" && q.code === undefined) {
      ctx.addIssue({ code: "custom", path: ["code"], message: "Câu predict phải có code" });
    }
    if (q.choices.filter((c) => c.correct).length !== 1) {
      ctx.addIssue({ code: "custom", path: ["choices"], message: "Phải có đúng 1 lựa chọn correct: true" });
    }
  });

export const stageFileSchema = z
  .object({ id: idSchema, title: localizedSchema, topics: z.array(z.string().min(1)).min(1) })
  .strict();

export const topicFileSchema = z
  .object({
    id: idSchema,
    title: localizedSchema,
    lessons: z.array(z.string().min(1)).min(1),
    reviews: z.array(z.object({ id: idSchema, after: idSchema }).strict()).default([]),
  })
  .strict();

const conceptSchema = z
  .object({
    id: idSchema,
    name: localizedSchema,
    misconception_card: z.string().min(1).optional(),
    parent_tip: z.string().min(1).optional(),
    practice: z
      .object({
        level1: z.array(idSchema).default([]),
        level2: z.array(idSchema).default([]),
        level3: z.array(idSchema).default([]),
      })
      .strict()
      .default({ level1: [], level2: [], level3: [] }),
  })
  .strict();

export const conceptsFileSchema = z.object({ concepts: z.array(conceptSchema) }).strict();

export const questionsFileSchema = z.object({ questions: z.array(z.unknown()) }).strict();

export const practiceFileSchema = z.object({ exercises: z.array(z.unknown()) }).strict();

export const lessonFrontmatterSchema = z
  .object({ id: idSchema, title: localizedSchema, exercises: z.array(z.unknown()).default([]) })
  .strict();

const errorEntrySchema = z
  .object({
    id: idSchema,
    match: z
      .object({ type: z.string().min(1), message: z.string().min(1).optional(), check: z.enum(CHECK_NAMES).optional() })
      .strict(),
    explain: bilingualSchema,
    hint: bilingualSchema.optional(),
    misconception: idSchema.optional(),
    sample: z.string().min(1),
    sample_input: z.string().default(""),
  })
  .strict()
  .superRefine((entry, ctx) => {
    if (entry.match.message === undefined) return;
    try {
      new RegExp(entry.match.message);
    } catch (error) {
      ctx.addIssue({
        code: "custom",
        path: ["match", "message"],
        message: `Biểu thức chính quy không hợp lệ: ${(error as Error).message}`,
      });
    }
  });

export const errorsFileSchema = z.array(errorEntrySchema);

export type ParseResult<T> = { ok: true; value: T } | { ok: false; issues: string[] };
export type SafeResult<T> = { success: true; data: T } | { success: false; error: z.ZodError };

export function formatIssues(error: z.ZodError, where: string): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `: ${issue.path.join(".")}` : "";
    return `${where}${path}: ${issue.message}`;
  });
}

export function parseWith<T>(result: SafeResult<T>, where: string): ParseResult<T> {
  return result.success ? { ok: true, value: result.data } : { ok: false, issues: formatIssues(result.error, where) };
}

export function toLocalized(raw: { vi: string; en?: string | undefined }): LocalizedText {
  return raw.en === undefined ? { vi: raw.vi } : { vi: raw.vi, en: raw.en };
}

function toChoice(raw: z.infer<typeof choiceSchema>): Choice {
  const text: LocalizedText =
    raw.text !== undefined ? { vi: raw.text, en: raw.text } : { vi: raw.vi ?? "", en: raw.en ?? "" };
  return { text, correct: raw.correct, error: raw.error, misconception: raw.misconception ?? null };
}

function toCompare(raw: { compare: "exact" | "float"; tolerance?: number | undefined }): CompareMode {
  return raw.compare === "float" ? { kind: "float", tolerance: raw.tolerance ?? 0 } : { kind: "exact" };
}

function toTests(raw: { tests: { input: string; output: string; hidden: boolean }[] }) {
  return raw.tests.map((t) => ({ input: t.input, output: t.output, hidden: t.hidden }));
}

function toParsons(raw: z.infer<typeof parsonsSchema>): ParsonsExercise {
  const lines = parsonsLines(raw.solution);
  return {
    id: raw.id,
    type: "parsons",
    concepts: raw.concepts,
    prompt: toLocalized(raw.prompt),
    lines,
    solution: `${lines.join("\n")}\n`,
    tests: toTests(raw),
    hints: raw.hints.map(toLocalized),
    compare: toCompare(raw),
    testEligible: raw.test_eligible,
  };
}

function toFill(raw: z.infer<typeof fillSchema>): FillExercise {
  return {
    id: raw.id,
    type: "fill",
    concepts: raw.concepts,
    prompt: toLocalized(raw.prompt),
    template: raw.template,
    answers: raw.answers,
    solution: fillTemplate(raw.template, raw.answers),
    tests: toTests(raw),
    hints: raw.hints.map(toLocalized),
    compare: toCompare(raw),
    testEligible: raw.test_eligible,
  };
}

function toCodeExercise(raw: z.infer<typeof codeExerciseSchema>): CodeExercise {
  return {
    id: raw.id,
    type: "code",
    concepts: raw.concepts,
    prompt: toLocalized(raw.prompt),
    starter: raw.starter,
    solution: raw.solution,
    tests: toTests(raw),
    commonWrong: raw.common_wrong.map((cw) => ({
      test: cw.test,
      output: cw.output,
      misconception: cw.misconception,
      sample: cw.sample,
    })),
    hints: raw.hints.map(toLocalized),
    compare: toCompare(raw),
    testEligible: raw.test_eligible,
  };
}

function toChoiceQuestion(raw: z.infer<typeof choiceQuestionSchema>, ownerLessonId: string | null): ChoiceQuestion {
  return {
    id: raw.id,
    type: raw.type,
    concepts: raw.concepts,
    lessons: raw.lessons.length > 0 ? raw.lessons : ownerLessonId ? [ownerLessonId] : [],
    code: raw.code ?? null,
    prompt: raw.prompt,
    choices: raw.choices.map(toChoice),
    explanation: raw.explanation,
  };
}

/** Parses 1 exercise. A predict/mcq inside a lesson gets that lesson as its default `lessons`. */
export function parseExercise(raw: unknown, ownerLessonId: string | null, where: string): ParseResult<Exercise> {
  const type = typeof raw === "object" && raw !== null ? (raw as { type?: unknown }).type : undefined;
  if (type === "code") {
    const result = parseWith(codeExerciseSchema.safeParse(raw), where);
    return result.ok ? { ok: true, value: toCodeExercise(result.value) } : result;
  }
  if (type === "parsons") {
    const result = parseWith(parsonsSchema.safeParse(raw), where);
    return result.ok ? { ok: true, value: toParsons(result.value) } : result;
  }
  if (type === "fill") {
    const result = parseWith(fillSchema.safeParse(raw), where);
    return result.ok ? { ok: true, value: toFill(result.value) } : result;
  }
  if (type === "predict" || type === "mcq") {
    const result = parseWith(choiceQuestionSchema.safeParse(raw), where);
    return result.ok ? { ok: true, value: toChoiceQuestion(result.value, ownerLessonId) } : result;
  }
  return { ok: false, issues: [`${where}: type phải là code, parsons, fill, predict hoặc mcq`] };
}

export function toConcept(raw: z.infer<typeof conceptSchema>): Concept {
  return {
    id: raw.id,
    name: toLocalized(raw.name),
    misconceptionCard: raw.misconception_card ?? null,
    misconceptionHtml:
      raw.misconception_card === undefined ? null : (marked.parse(raw.misconception_card, { async: false }) as string),
    parentTip: raw.parent_tip ?? null,
    practice: raw.practice,
  };
}

export function toErrorEntry(raw: z.infer<typeof errorEntrySchema>): ErrorEntry {
  return {
    id: raw.id,
    match: { type: raw.match.type, message: raw.match.message ?? null, check: raw.match.check ?? null },
    explain: raw.explain,
    hint: raw.hint ?? null,
    misconception: raw.misconception ?? null,
    sample: raw.sample,
    sampleInput: raw.sample_input,
  };
}
```

`tools/content/buildBundle.ts` (thay toàn bộ file):

```ts
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { load } from "js-yaml";
import type { z } from "zod";
import {
  isChoiceQuestion,
  type ChoiceQuestion,
  type ContentBundle,
  type ErrorEntry,
  type Exercise,
  type Lesson,
  type Stage,
  type TestedExercise,
  type Topic,
} from "../../src/content/types";
import { LessonFormatError, parseLessonFile } from "./parseLesson";
import { checkReferences } from "./references";
import {
  conceptsFileSchema,
  errorsFileSchema,
  lessonFrontmatterSchema,
  parseExercise,
  parseWith,
  practiceFileSchema,
  questionsFileSchema,
  stageFileSchema,
  toConcept,
  toErrorEntry,
  toLocalized,
  topicFileSchema,
  type SafeResult,
} from "./schema";

export class ContentError extends Error {
  constructor(readonly problems: string[]) {
    super(`Nội dung có ${problems.length} lỗi:\n${problems.join("\n")}`);
    this.name = "ContentError";
  }
}

class Collector {
  readonly problems: string[] = [];

  constructor(readonly root: string) {}

  exists(rel: string): boolean {
    return existsSync(join(this.root, rel));
  }

  readText(rel: string): string | undefined {
    if (!this.exists(rel)) {
      this.problems.push(`${rel}: không tìm thấy file`);
      return undefined;
    }
    return readFileSync(join(this.root, rel), "utf8");
  }

  readYaml(rel: string): unknown {
    const text = this.readText(rel);
    if (text === undefined) return undefined;
    try {
      return load(text);
    } catch (error) {
      this.problems.push(`${rel}: YAML lỗi: ${(error as Error).message}`);
      return undefined;
    }
  }

  parse<S extends z.ZodType>(schema: S, raw: unknown, where: string): z.infer<S> | undefined {
    const result = parseWith(schema.safeParse(raw) as SafeResult<z.infer<S>>, where);
    if (result.ok) return result.value;
    this.problems.push(...result.issues);
    return undefined;
  }
}

export function buildBundle(contentDir: string): ContentBundle {
  const collector = new Collector(contentDir);
  const stageDirs = readdirSync(contentDir)
    .filter((name) => /^stage-\d+$/.test(name))
    .sort((a, b) => Number(a.slice(6)) - Number(b.slice(6)));
  const stages = stageDirs.map((dir) => buildStage(collector, dir)).filter((s): s is Stage => s !== undefined);

  const errorsFile = "errors/errors.yaml";
  const rawErrors = collector.parse(errorsFileSchema, collector.readYaml(errorsFile), errorsFile);
  const errors: ErrorEntry[] = rawErrors ? rawErrors.map(toErrorEntry) : [];

  const bundle: ContentBundle = { stages, errors };
  const problems = [...collector.problems, ...checkReferences(bundle)];
  if (problems.length > 0) throw new ContentError(problems);
  return bundle;
}

function buildStage(c: Collector, dir: string): Stage | undefined {
  const file = `${dir}/stage.yaml`;
  const raw = c.parse(stageFileSchema, c.readYaml(file), file);
  if (!raw) return undefined;
  const topics = raw.topics.map((name) => buildTopic(c, `${dir}/${name}`)).filter((t): t is Topic => t !== undefined);
  return { id: raw.id, title: toLocalized(raw.title), topics };
}

function buildTopic(c: Collector, dir: string): Topic | undefined {
  const topicFile = `${dir}/topic.yaml`;
  const conceptsFile = `${dir}/concepts.yaml`;
  const raw = c.parse(topicFileSchema, c.readYaml(topicFile), topicFile);
  const rawConcepts = c.parse(conceptsFileSchema, c.readYaml(conceptsFile), conceptsFile);
  if (!raw) return undefined;
  const lessons = raw.lessons.map((name) => buildLesson(c, `${dir}/${name}`)).filter((l): l is Lesson => l !== undefined);
  return {
    id: raw.id,
    title: toLocalized(raw.title),
    lessons,
    concepts: rawConcepts ? rawConcepts.concepts.map(toConcept) : [],
    questions: buildQuestions(c, `${dir}/questions.yaml`),
    reviews: raw.reviews,
    practice: buildPractice(c, `${dir}/practice.yaml`),
  };
}

function buildLesson(c: Collector, file: string): Lesson | undefined {
  const text = c.readText(file);
  if (text === undefined) return undefined;
  let parsed: ReturnType<typeof parseLessonFile>;
  try {
    parsed = parseLessonFile(text);
  } catch (error) {
    if (error instanceof LessonFormatError) {
      c.problems.push(`${file}: ${error.message}`);
      return undefined;
    }
    throw error;
  }
  const frontmatter = c.parse(lessonFrontmatterSchema, parsed.frontmatter, file);
  if (!frontmatter) return undefined;
  if (parsed.cards.length === 0) c.problems.push(`${file}: bài học phải có ít nhất 1 thẻ`);
  const exercises: Exercise[] = [];
  frontmatter.exercises.forEach((rawExercise, i) => {
    const result = parseExercise(rawExercise, frontmatter.id, `${file}: exercises.${i}`);
    if (result.ok) exercises.push(result.value);
    else c.problems.push(...result.issues);
  });
  return { id: frontmatter.id, title: toLocalized(frontmatter.title), cards: parsed.cards, exercises };
}

function buildQuestions(c: Collector, file: string): ChoiceQuestion[] {
  if (!c.exists(file)) return [];
  const raw = c.parse(questionsFileSchema, c.readYaml(file), file);
  if (!raw) return [];
  const questions: ChoiceQuestion[] = [];
  raw.questions.forEach((rawQuestion, i) => {
    const where = `${file}: questions.${i}`;
    const result = parseExercise(rawQuestion, null, where);
    if (!result.ok) {
      c.problems.push(...result.issues);
      return;
    }
    if (!isChoiceQuestion(result.value)) {
      c.problems.push(`${where}: questions.yaml chỉ chứa câu predict hoặc mcq`);
      return;
    }
    if (result.value.lessons.length === 0) {
      c.problems.push(`${where}: câu hỏi trong ngân hàng phải có lessons`);
      return;
    }
    questions.push(result.value);
  });
  return questions;
}

function buildPractice(c: Collector, file: string): TestedExercise[] {
  if (!c.exists(file)) return [];
  const raw = c.parse(practiceFileSchema, c.readYaml(file), file);
  if (!raw) return [];
  const exercises: TestedExercise[] = [];
  raw.exercises.forEach((rawExercise, i) => {
    const where = `${file}: exercises.${i}`;
    const result = parseExercise(rawExercise, null, where);
    if (!result.ok) {
      c.problems.push(...result.issues);
      return;
    }
    if (isChoiceQuestion(result.value)) {
      c.problems.push(`${where}: practice.yaml chỉ chứa bài code, parsons hoặc fill`);
      return;
    }
    exercises.push(result.value);
  });
  return exercises;
}
```

`tools/content/references.ts` (thay toàn bộ file):

```ts
import { isChoiceQuestion, type ContentBundle, type Exercise } from "../../src/content/types";

/** The item types allowed at each ladder level (spec 5.9). */
const LEVEL_TYPES = {
  level1: ["predict", "mcq"],
  level2: ["parsons", "fill"],
  level3: ["code"],
} as const;

export function checkReferences(bundle: ContentBundle): string[] {
  const problems: string[] = [];
  const owners = new Map<string, string>();
  const claim = (id: string, what: string) => {
    const previous = owners.get(id);
    if (previous) problems.push(`ID trùng "${id}": ${previous} và ${what}`);
    else owners.set(id, what);
  };

  const conceptIds = new Set<string>();
  const lessonIds = new Set<string>();
  const items: Exercise[] = [];
  const itemsById = new Map<string, Exercise>();

  for (const stage of bundle.stages) {
    claim(stage.id, "giai đoạn");
    for (const topic of stage.topics) {
      claim(topic.id, "chủ đề");
      for (const concept of topic.concepts) {
        if (conceptIds.has(concept.id)) problems.push(`Khái niệm trùng "${concept.id}"`);
        conceptIds.add(concept.id);
      }
      for (const lesson of topic.lessons) {
        claim(lesson.id, "bài học");
        lessonIds.add(lesson.id);
        for (const exercise of lesson.exercises) {
          claim(exercise.id, "bài tập");
          items.push(exercise);
        }
      }
      for (const question of topic.questions) {
        claim(question.id, "câu hỏi");
        items.push(question);
      }
      for (const exercise of topic.practice) {
        claim(exercise.id, "bài luyện");
        items.push(exercise);
      }
      const topicLessons = new Set(topic.lessons.map((lesson) => lesson.id));
      const placed = new Set<string>();
      for (const review of topic.reviews) {
        claim(review.id, "trạm ôn");
        if (!topicLessons.has(review.after)) {
          problems.push(`${review.id}: trạm ôn phải đặt sau 1 bài học của chủ đề ${topic.id}, không có "${review.after}"`);
        } else if (placed.has(review.after)) {
          problems.push(`${review.id}: đã có trạm ôn khác sau bài "${review.after}"`);
        }
        placed.add(review.after);
      }
    }
  }
  for (const item of items) itemsById.set(item.id, item);
  for (const entry of bundle.errors) claim(entry.id, "mục từ điển lỗi");

  const needConcept = (id: string, where: string) => {
    if (!conceptIds.has(id)) problems.push(`${where}: khái niệm "${id}" chưa được khai báo trong concepts.yaml`);
  };
  for (const item of items) {
    item.concepts.forEach((id) => needConcept(id, item.id));
    if (item.type === "code") {
      item.commonWrong.forEach((cw) => needConcept(cw.misconception, item.id));
    } else if (isChoiceQuestion(item)) {
      item.choices.forEach((choice) => {
        if (choice.misconception) needConcept(choice.misconception, item.id);
      });
      item.lessons.forEach((id) => {
        if (!lessonIds.has(id)) problems.push(`${item.id}: bài học "${id}" không tồn tại`);
      });
    }
  }
  for (const entry of bundle.errors) {
    if (entry.misconception) needConcept(entry.misconception, `errors/${entry.id}`);
  }
  for (const concept of bundle.stages.flatMap((stage) => stage.topics.flatMap((topic) => topic.concepts))) {
    for (const level of ["level1", "level2", "level3"] as const) {
      for (const id of concept.practice[level]) {
        const item = itemsById.get(id);
        const where = `${concept.id}: practice.${level}`;
        if (!item) problems.push(`${where}: bài "${id}" không tồn tại`);
        else if (!(LEVEL_TYPES[level] as readonly string[]).includes(item.type)) {
          problems.push(`${where}: bài "${id}" có type ${item.type}, mức này cần ${LEVEL_TYPES[level].join(" hoặc ")}`);
        } else if (!item.concepts.includes(concept.id)) {
          problems.push(`${where}: bài "${id}" chưa khai báo khái niệm ${concept.id} trong concepts`);
        }
      }
    }
  }
  return problems;
}
```

`tools/content/coverage.ts`:

```ts
import type { ContentBundle } from "../../src/content/types";

/**
 * Spec 3.9 rule 8: every concept has a misconception card, a parent tip and practice at the 3 levels. The content
 * of M5 completes it, so a gap is a warning for now, not an error.
 */
export function contentWarnings(bundle: ContentBundle): string[] {
  const warnings: string[] = [];
  for (const concept of bundle.stages.flatMap((stage) => stage.topics.flatMap((topic) => topic.concepts))) {
    const missing: string[] = [];
    if (concept.misconceptionCard === null) missing.push("thẻ hiểu lầm");
    if (concept.parentTip === null) missing.push("gợi ý cho phụ huynh");
    for (const level of ["level1", "level2", "level3"] as const) {
      if (concept.practice[level].length === 0) missing.push(`bài luyện ${level}`);
    }
    if (missing.length > 0) warnings.push(`${concept.id}: thiếu ${missing.join(", ")}`);
  }
  return warnings;
}
```

`tools/build_content.ts` (thay toàn bộ file):

```ts
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { buildBundle, ContentError } from "./content/buildBundle";
import { contentWarnings } from "./content/coverage";

const [contentDir = "content", outFile = "src/generated/content.json"] = process.argv.slice(2);

try {
  const bundle = buildBundle(contentDir);
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, `${JSON.stringify(bundle, null, 2)}\n`);
  const lessons = bundle.stages.reduce((n, s) => n + s.topics.reduce((m, t) => m + t.lessons.length, 0), 0);
  for (const warning of contentWarnings(bundle)) console.warn(`Cảnh báo: ${warning}`);
  console.log(`Đã build nội dung: ${bundle.stages.length} giai đoạn, ${lessons} bài học, ${bundle.errors.length} mục lỗi -> ${outFile}`);
} catch (error) {
  if (error instanceof ContentError) {
    console.error(error.message);
    process.exit(1);
  }
  throw error;
}
```

`src/test/fixtures.ts`: chủ đề `t.topic` trong `testBundle()` thêm 2 trường sau `questions: [],`:

```ts
            reviews: [],
            practice: [],
```

`src/ui/LessonScreen.tsx` (giữ app biên dịch được; Task 8 thay đoạn này bằng `ItemView`):

1. Đổi import: `import { isChoiceQuestion, type Card, type Exercise, type Lesson } from "../content/types";`
2. Đổi `} else {` ngay trước `const question = step.exercise;` thành `} else if (isChoiceQuestion(step.exercise)) {`.
3. Sau khối `QuestionCard` (trước `return (`), thêm nhánh cuối:

```tsx
  } else {
    // Parsons and fill exercises get their views in Task 8; no content uses them before that.
    body = null;
  }
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run tools src && npm run typecheck && npm run content:build`
Expected: PASS. `content:build` in 6 dòng `Cảnh báo: <khái niệm>: thiếu bài luyện level1, bài luyện level2, bài luyện level3` (luật 8 chỉ cảnh báo, theo quyết định của người bảo trì) và vẫn build xong.

- [ ] **Step 5: Commit**

```bash
git add src/content tools/content tools/build_content.ts src/test/fixtures.ts src/ui/LessonScreen.tsx
git commit -m "feat(content): parsons and fill exercises, practice files, concept practice levels and review stations

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Kiểm tra parsons và fill bằng CPython và Pyodide

**Files:**
- Modify: `tools/validate_content.py`, `src/runner/judge.ts`
- Test: `tools/tests/test_validate_content.py`, `src/content/parity.pyodide.test.ts`

**Interfaces:**
- Consumes: `ParsonsExercise`, `FillExercise`, `FILL_BLANK`, `topic.practice` (Task 5).
- Produces:
  - `interface JudgeSpec { tests: TestCase[]; compare: CompareMode; commonWrong?: CommonWrong[] }`; `judge(exercise: JudgeSpec, code, run, errorMisconception?)`. Mọi `TestedExercise` truyền thẳng vào `judge` được.
  - Python: `check_tested_exercise(exercise: dict) -> list[str]`; `validate_bundle` duyệt cả `topic["practice"]`.

- [ ] **Step 1: Viết test thất bại**

`tools/tests/test_validate_content.py`: thêm trước `def test_check_choice_question_accepts_matching_output():` (tên hàm tạo dữ liệu là `graded` để pytest không coi nó là test):

```python
def graded(kind, **overrides):
    exercise = {
        "id": kind[0],
        "type": kind,
        "concepts": [],
        "prompt": {"vi": "p"},
        "solution": "a = int(input())\nprint(a + 1)\n",
        "tests": [{"input": "1", "output": "2", "hidden": False}],
        "hints": [],
        "compare": EXACT,
        "testEligible": False,
    }
    if kind == "parsons":
        exercise["lines"] = ["a = int(input())", "print(a + 1)"]
    else:
        exercise["template"] = "a = int(input())\nprint(a + ___)\n"
        exercise["answers"] = ["1"]
    exercise.update(overrides)
    return exercise


def test_check_tested_exercise_accepts_valid_parsons_and_fill():
    assert vc.check_tested_exercise(graded("parsons")) == []
    assert vc.check_tested_exercise(graded("fill")) == []


def test_check_tested_exercise_reports_a_wrong_solution():
    problems = vc.check_tested_exercise(graded("parsons", solution="print(3)\n"))
    assert problems == ["[p] lời giải mẫu sai ở test 0: mong đợi '2', nhận '3\\n'"]


def test_check_tested_exercise_reports_a_fill_template_that_passes_when_empty():
    exercise = graded("fill", template="print(2)___\n", answers=["#"], solution="print(2)#\n")
    assert vc.check_tested_exercise(exercise) == ["[f] mẫu để trống vẫn qua hết test, bài tập không có ý nghĩa"]


def test_validate_bundle_checks_practice_exercises():
    bundle = {
        "stages": [{"topics": [{"lessons": [], "questions": [], "practice": [graded("fill", solution="print(0)\n")]}]}],
        "errors": [],
    }
    assert vc.validate_bundle(bundle) == ["[f] lời giải mẫu sai ở test 0: mong đợi '2', nhận '0\\n'"]
```

`src/content/parity.pyodide.test.ts`:

1. Đổi import kiểu: `import { FILL_BLANK, type ChoiceQuestion, type CodeExercise, type ContentBundle } from "./types";`
2. Thêm trước `describe("lesson content on Pyodide", ...)`:

```ts
describe("parsons and fill on Pyodide", () => {
  const tests = [{ input: "4", output: "5", hidden: false }];

  test("a parsons program in the right order passes and a shuffled one does not", async () => {
    const lines = ["n = int(input())", "n = n + 1", "print(n)"];
    const spec = { tests, compare: exact };
    expect((await judge(spec, lines.join("\n"), runAsync)).status).toBe("accepted");
    expect((await judge(spec, [lines[0], lines[2], lines[1]].join("\n"), runAsync)).status).toBe("wrong-answer");
  });

  test("a filled template passes and an empty one does not", async () => {
    const template = "n = int(input())\nprint(n ___ 1)\n";
    const spec = { tests, compare: exact };
    expect((await judge(spec, template.replace(FILL_BLANK, "+"), runAsync)).status).toBe("accepted");
    expect((await judge(spec, template.replace(FILL_BLANK, ""), runAsync)).status).toBe("error");
  });
});
```

3. Trong `describe("lesson content on Pyodide", ...)`, thêm trước vòng `for (const question of exercises.filter(...predict...))`:

```ts
  for (const exercise of exercises) {
    if (exercise.type !== "parsons" && exercise.type !== "fill") continue;
    test(`${exercise.id}: the ${exercise.type} solution passes on Pyodide`, async () => {
      expect((await judge(exercise, exercise.solution, runAsync)).status).toBe("accepted");
      if (exercise.type === "fill") {
        const empty = exercise.template.replaceAll(FILL_BLANK, "");
        expect((await judge(exercise, empty, runAsync)).status).not.toBe("accepted");
      }
    });
  }
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `.venv/bin/python -m pytest tools/tests -q && npx vitest run src/content/parity.pyodide.test.ts`
Expected: pytest FAIL (`AttributeError: module 'validate_content' has no attribute 'check_tested_exercise'`); Vitest báo lỗi kiểu khi truyền `{ tests, compare }` vào `judge` (chạy `npm run typecheck` để thấy).

- [ ] **Step 3: Viết code**

`tools/validate_content.py`:

1. Thay hàm `check_code_exercise` bằng 3 hàm:

```python
def _check_solution(exercise: dict) -> list[str]:
    ex_id, compare = exercise["id"], exercise["compare"]
    problems = []
    for index, test in enumerate(exercise["tests"]):
        result = run_code(exercise["solution"], test["input"])
        if result.outcome != "ok":
            problems.append(f"[{ex_id}] lời giải mẫu bị {_describe(result)} ở test {index}")
        elif not outputs_match(test["output"], result.stdout, compare):
            problems.append(
                f"[{ex_id}] lời giải mẫu sai ở test {index}: mong đợi {test['output']!r}, nhận {result.stdout!r}"
            )
    return problems


def _passes_all(code: str, exercise: dict) -> bool:
    for test in exercise["tests"]:
        result = run_code(code, test["input"])
        if result.outcome != "ok" or not outputs_match(test["output"], result.stdout, exercise["compare"]):
            return False
    return True


def check_code_exercise(exercise: dict) -> list[str]:
    ex_id, tests = exercise["id"], exercise["tests"]
    problems = _check_solution(exercise)
    compare = exercise["compare"]
    if _passes_all(exercise["starter"], exercise):
        problems.append(f"[{ex_id}] code starter qua hết test, bài tập không có ý nghĩa")
    for index, wrong in enumerate(exercise["commonWrong"]):
        test = tests[wrong["test"]]
        result = run_code(wrong["sample"], test["input"])
        if result.outcome != "ok" or normalize_output(result.stdout) != normalize_output(wrong["output"]):
            problems.append(
                f"[{ex_id}] common_wrong {index}: code mẫu in ra {result.stdout!r}, không phải {wrong['output']!r}"
            )
        if outputs_match(test["output"], wrong["output"], compare):
            problems.append(f"[{ex_id}] common_wrong {index}: đầu ra trùng với đáp án đúng")
    return problems
```

2. Thêm trước `def check_choice_question`:

```python
FILL_BLANK = "___"


def check_tested_exercise(exercise: dict) -> list[str]:
    """Parsons and fill: the solution passes every test; a fill template with empty blanks does not."""
    problems = _check_solution(exercise)
    if exercise["type"] == "fill" and _passes_all(exercise["template"].replace(FILL_BLANK, ""), exercise):
        problems.append(f"[{exercise['id']}] mẫu để trống vẫn qua hết test, bài tập không có ý nghĩa")
    return problems
```

3. Trong `_items`, sau vòng `for question in topic["questions"]:`, thêm:

```python
            for exercise in topic.get("practice", []):
                yield "item", exercise
```

4. Trong `validate_bundle`, thêm nhánh sau nhánh `code`:

```python
        elif item["type"] in ("parsons", "fill"):
            problems += check_tested_exercise(item)
```

`src/runner/judge.ts`:

1. Đổi import thành `import type { CommonWrong, CompareMode, TestCase } from "../content/types";`
2. Thêm trước `export async function judge`:

```ts
/** What judging needs from a code, parsons or fill exercise. */
export interface JudgeSpec {
  tests: TestCase[];
  compare: CompareMode;
  commonWrong?: CommonWrong[];
}
```

3. Đổi kiểu tham số `exercise` của `judge` và `collectMisconceptions` thành `JudgeSpec`, và vòng `for (const wrong of exercise.commonWrong)` thành `for (const wrong of exercise.commonWrong ?? [])`.

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `.venv/bin/python -m pytest tools/tests -q && npx vitest run src/content src/runner && npm run content:validate`
Expected: pytest 21 passed; Vitest PASS; `Nội dung hợp lệ.`

- [ ] **Step 5: Commit**

```bash
git add tools/validate_content.py tools/tests/test_validate_content.py src/runner/judge.ts src/content/parity.pyodide.test.ts
git commit -m "feat(content): run parsons and fill solutions on CPython and Pyodide

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 7: Bản đồ có trạm ôn và cách chọn câu ôn

**Files:**
- Create: `src/game/path.ts`, `src/game/reviewSet.ts`, `src/test/reviewBundle.ts`
- Modify: `src/game/progress.ts`
- Test: `src/game/path.test.ts`, `src/game/reviewSet.test.ts`

**Interfaces:**
- Consumes: `isDue` (Task 3), `shuffled`, `Rng` (Task 3), `findItem`, `allConcepts`, `isChoiceQuestion`, `Topic.reviews`, `Topic.practice`, `Concept.practice` (Task 5).
- Produces:
  - `type PathNode = { kind: "lesson"; id; topicId } | { kind: "review"; id; topicId; lessons: string[] }`; `type NodeStatus = "done" | "next" | "locked"`; `pathNodes(bundle)`, `isNodeDone(node, state)`, `nodeStatuses(bundle, state): Map<string, NodeStatus>`, `nextNode(bundle, state): PathNode | null`, `findNode(bundle, id): PathNode | undefined`.
  - `REVIEW_SIZE = 5`, `PRACTICE_SIZE = 2`; `availableItems(bundle, state): Map<string, Exercise>`; `buildReviewSet({ bundle, state, today, rng, recentLessons }): Exercise[]`; `buildPracticeSet(bundle, state, conceptId, rng): Exercise[]`.
  - `stageXpMax(stage)` cộng 15 XP cho mỗi trạm ôn (1 lần đúng hết) và tính parsons/fill như bài code.
  - Bộ nội dung mẫu `reviewBundle()`, `reviewCode`, `reviewParsons`, `reviewFill` (`src/test/reviewBundle.ts`), dùng lại ở Task 8 đến 10.

- [ ] **Step 1: Viết test thất bại**

`src/test/reviewBundle.ts`:

```ts
import type {
  ChoiceQuestion,
  CodeExercise,
  Concept,
  ContentBundle,
  FillExercise,
  Lesson,
  ParsonsExercise,
} from "../content/types";
import { fixtureErrors } from "./fixtures";

const tests = [{ input: "", output: "Hi", hidden: false }];

function question(id: string, lesson: string, concept: string): ChoiceQuestion {
  return {
    id,
    type: "mcq",
    concepts: [concept],
    lessons: [lesson],
    code: null,
    prompt: { vi: `Câu ${id}?`, en: `Question ${id}?` },
    choices: [
      { text: { vi: "Đúng", en: "Right" }, correct: true, error: false, misconception: null },
      { text: { vi: "Sai", en: "Wrong" }, correct: false, error: false, misconception: concept },
    ],
    explanation: { vi: "Giải thích.", en: "Because." },
  };
}

export const reviewCode: CodeExercise = {
  id: "r.l1.ex1",
  type: "code",
  concepts: ["c1"],
  prompt: { vi: "In ra Hi" },
  starter: "",
  solution: 'print("Hi")',
  tests,
  commonWrong: [],
  hints: [],
  compare: { kind: "exact" },
  testEligible: false,
};

export const reviewParsons: ParsonsExercise = {
  id: "r.p1",
  type: "parsons",
  concepts: ["c1"],
  prompt: { vi: "Sắp xếp để in ra Hi rồi Bye" },
  lines: ['print("Hi")', 'print("Bye")'],
  solution: 'print("Hi")\nprint("Bye")\n',
  tests: [{ input: "", output: "Hi\nBye", hidden: false }],
  hints: [{ vi: "Hi đứng trước." }],
  compare: { kind: "exact" },
  testEligible: false,
};

export const reviewFill: FillExercise = {
  id: "r.f1",
  type: "fill",
  concepts: ["c2"],
  prompt: { vi: "Điền để in ra Hi" },
  template: "print(___)\n",
  answers: ['"Hi"'],
  solution: 'print("Hi")\n',
  tests,
  hints: [],
  compare: { kind: "exact" },
  testEligible: false,
};

function lesson(id: string, exercises: Lesson["exercises"] = []): Lesson {
  return { id, title: { vi: `Bài ${id}`, en: `Lesson ${id}` }, cards: [{ segments: [{ kind: "html", html: `<p>${id}</p>` }] }], exercises };
}

function concept(id: string, practice: Concept["practice"]): Concept {
  return {
    id,
    name: { vi: `Khái niệm ${id}`, en: `Concept ${id}` },
    misconceptionCard: `Hiểu lầm về **${id}**.`,
    misconceptionHtml: `<p>Hiểu lầm về <strong>${id}</strong>.</p>`,
    parentTip: null,
    practice,
  };
}

/**
 * 3 lessons with a review station after lesson 2, 6 bank questions, 1 code exercise in lesson 1 and a parsons and a
 * fill practice exercise. Concept c1: r.q1, r.q2, r.q5, r.l1.ex1, r.p1. Concept c2: r.q3, r.q4, r.q6, r.f1.
 */
export function reviewBundle(): ContentBundle {
  return {
    stages: [
      {
        id: "r",
        title: { vi: "Giai đoạn ôn", en: "Review stage" },
        topics: [
          {
            id: "r.topic",
            title: { vi: "Chủ đề ôn", en: "Review topic" },
            lessons: [lesson("r.l1", [reviewCode]), lesson("r.l2"), lesson("r.l3")],
            concepts: [
              concept("c1", { level1: ["r.q1"], level2: ["r.p1"], level3: ["r.l1.ex1"] }),
              concept("c2", { level1: ["r.q3"], level2: ["r.f1"], level3: [] }),
            ],
            questions: [
              question("r.q1", "r.l1", "c1"),
              question("r.q2", "r.l1", "c1"),
              question("r.q3", "r.l2", "c2"),
              question("r.q4", "r.l2", "c2"),
              question("r.q5", "r.l3", "c1"),
              question("r.q6", "r.l1", "c2"),
            ],
            reviews: [{ id: "r.r1", after: "r.l2" }],
            practice: [reviewParsons, reviewFill],
          },
        ],
      },
    ],
    errors: fixtureErrors,
  };
}
```

`src/game/path.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { reviewBundle } from "../test/reviewBundle";
import { findNode, nextNode, nodeStatuses, pathNodes } from "./path";
import { stageXpMax } from "./progress";
import { initialGameState } from "./state";

const bundle = reviewBundle();

function stateWith(lessons: string[], reviews: string[] = []) {
  const state = initialGameState("2026-10-06");
  state.progress.completedLessons = lessons;
  state.progress.completedReviews = reviews;
  return state;
}

describe("path", () => {
  test("places each review station after its lesson with the lessons it reviews", () => {
    expect(pathNodes(bundle)).toEqual([
      { kind: "lesson", id: "r.l1", topicId: "r.topic" },
      { kind: "lesson", id: "r.l2", topicId: "r.topic" },
      { kind: "review", id: "r.r1", topicId: "r.topic", lessons: ["r.l1", "r.l2"] },
      { kind: "lesson", id: "r.l3", topicId: "r.topic" },
    ]);
    expect(findNode(bundle, "r.r1")?.kind).toBe("review");
    expect(findNode(bundle, "nope")).toBeUndefined();
  });

  test("a station must be done before the next lesson opens", () => {
    expect([...nodeStatuses(bundle, stateWith([]))]).toEqual([
      ["r.l1", "next"],
      ["r.l2", "locked"],
      ["r.r1", "locked"],
      ["r.l3", "locked"],
    ]);
    const beforeStation = stateWith(["r.l1", "r.l2"]);
    expect(nodeStatuses(bundle, beforeStation).get("r.r1")).toBe("next");
    expect(nodeStatuses(bundle, beforeStation).get("r.l3")).toBe("locked");
    expect(nextNode(bundle, beforeStation)?.id).toBe("r.r1");
    const afterStation = stateWith(["r.l1", "r.l2"], ["r.r1"]);
    expect(nodeStatuses(bundle, afterStation).get("r.l3")).toBe("next");
    expect(nextNode(bundle, stateWith(["r.l1", "r.l2", "r.l3"], ["r.r1"]))).toBeNull();
  });

  test("stageXpMax counts lessons, lesson exercises and a perfect run of each station", () => {
    expect(stageXpMax(bundle.stages[0]!)).toBe(3 * 10 + 15 + 15);
  });
});
```

`src/game/reviewSet.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { reviewBundle } from "../test/reviewBundle";
import { emptyMastery } from "./mastery";
import { seededRng } from "./random";
import { availableItems, buildPracticeSet, buildReviewSet, REVIEW_SIZE } from "./reviewSet";
import { initialGameState, type GameState } from "./state";

const bundle = reviewBundle();
const TODAY = "2026-10-10";
const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8];

function stateWith(lessons: string[]): GameState {
  const state = initialGameState(TODAY);
  state.progress.completedLessons = lessons;
  return state;
}

function ids(state: GameState, recentLessons: string[], seed: number): string[] {
  return buildReviewSet({ bundle, state, today: TODAY, rng: seededRng(seed), recentLessons }).map((item) => item.id);
}

describe("availableItems", () => {
  test("hides the items of lessons not learned yet", () => {
    expect([...availableItems(bundle, stateWith([])).keys()]).toEqual([]);
    expect([...availableItems(bundle, stateWith(["r.l1"])).keys()].sort()).toEqual(
      ["r.f1", "r.l1.ex1", "r.p1", "r.q1", "r.q2", "r.q6"].sort(),
    );
  });
});

describe("buildReviewSet", () => {
  test("has 5 questions of the learned lessons only", () => {
    for (const seed of SEEDS) {
      const set = ids(stateWith(["r.l1", "r.l2"]), ["r.l1", "r.l2"], seed);
      expect(set).toHaveLength(REVIEW_SIZE);
      expect([...set].sort()).toEqual(["r.q1", "r.q2", "r.q3", "r.q4", "r.q6"]);
    }
  });

  test("always asks about the lessons just learned", () => {
    for (const seed of SEEDS) {
      expect(ids(stateWith(["r.l1", "r.l2", "r.l3"]), ["r.l3"], seed)).toContain("r.q5");
    }
  });

  test("takes 2 due questions, weakest concept first", () => {
    const state = stateWith(["r.l1", "r.l2", "r.l3"]);
    state.reviews = {
      "r.q1": { box: 2, due: "2026-10-09" },
      "r.q2": { box: 1, due: TODAY },
      "r.q4": { box: 3, due: "2026-10-08" },
      "r.q6": { box: 4, due: "2026-10-20" },
    };
    state.mastery = { c1: { ...emptyMastery(), score: 80 }, c2: { ...emptyMastery(), score: 10 } };
    for (const seed of SEEDS) {
      const set = ids(state, ["r.l3"], seed);
      expect(set).toContain("r.q4");
      expect(set).toContain("r.q1");
    }
  });

  test("adds a practice item at the ladder level of a concept that needs help", () => {
    const state = stateWith(["r.l1", "r.l2"]);
    state.mastery = { c2: { ...emptyMastery(), needsHelp: true, level: 2 } };
    for (const seed of SEEDS) expect(ids(state, ["r.l1", "r.l2"], seed)).toContain("r.f1");
  });

  test("brings back an exercise whose solution was shown once it is due", () => {
    const state = stateWith(["r.l1", "r.l2"]);
    state.retry = { "r.l1.ex1": "2026-10-11" };
    expect(ids(state, ["r.l2"], 1)).not.toContain("r.l1.ex1");
    state.retry = { "r.l1.ex1": TODAY };
    for (const seed of SEEDS) expect(ids(state, ["r.l2"], seed)).toContain("r.l1.ex1");
  });

  test("returns fewer items when little is learned, and the same set for the same seed", () => {
    expect([...ids(stateWith(["r.l1"]), ["r.l1"], 3)].sort()).toEqual(["r.q1", "r.q2", "r.q6"]);
    expect(ids(stateWith([]), [], 3)).toEqual([]);
    const state = stateWith(["r.l1", "r.l2", "r.l3"]);
    expect(ids(state, ["r.l3"], 9)).toEqual(ids(state, ["r.l3"], 9));
  });
});

describe("buildPracticeSet", () => {
  test("starts at the child's ladder level, then the nearest levels", () => {
    const state = stateWith(["r.l1"]);
    expect(buildPracticeSet(bundle, state, "c1", seededRng(1)).map((i) => i.id)).toEqual(["r.q1", "r.p1"]);
    state.mastery = { c1: { ...emptyMastery(), level: 3 } };
    expect(buildPracticeSet(bundle, state, "c1", seededRng(1)).map((i) => i.id)).toEqual(["r.l1.ex1", "r.p1"]);
    expect(buildPracticeSet(bundle, state, "nope", seededRng(1))).toEqual([]);
  });

  test("falls back to the concept's questions", () => {
    const state = stateWith(["r.l1"]);
    state.mastery = { c2: { ...emptyMastery(), level: 3 } };
    // c2 has no level 3 item; r.q3 (level 1) belongs to lesson 2, not learned: the fill exercise, then r.q6.
    expect(buildPracticeSet(bundle, state, "c2", seededRng(1)).map((i) => i.id)).toEqual(["r.f1", "r.q6"]);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/game/path.test.ts src/game/reviewSet.test.ts`
Expected: FAIL vì chưa có `./path`, `./reviewSet`.

- [ ] **Step 3: Viết code**

`src/game/path.ts`:

```ts
import type { ContentBundle } from "../content/types";
import type { GameState } from "./state";

/** A step of the learning map: a lesson, or a review station with the lessons it reviews (spec 5.3). */
export type PathNode =
  | { kind: "lesson"; id: string; topicId: string }
  | { kind: "review"; id: string; topicId: string; lessons: string[] };

export type NodeStatus = "done" | "next" | "locked";

export function pathNodes(bundle: ContentBundle): PathNode[] {
  const nodes: PathNode[] = [];
  for (const topic of bundle.stages.flatMap((stage) => stage.topics)) {
    const stations = new Map(topic.reviews.map((review) => [review.after, review.id]));
    let since: string[] = [];
    for (const lesson of topic.lessons) {
      nodes.push({ kind: "lesson", id: lesson.id, topicId: topic.id });
      since.push(lesson.id);
      const stationId = stations.get(lesson.id);
      if (stationId) {
        nodes.push({ kind: "review", id: stationId, topicId: topic.id, lessons: since });
        since = [];
      }
    }
  }
  return nodes;
}

export function isNodeDone(node: PathNode, state: GameState): boolean {
  return node.kind === "lesson"
    ? state.progress.completedLessons.includes(node.id)
    : state.progress.completedReviews.includes(node.id);
}

/** Done nodes, then the first node not done (next), then the rest (locked): a station must be done to go on. */
export function nodeStatuses(bundle: ContentBundle, state: GameState): Map<string, NodeStatus> {
  const statuses = new Map<string, NodeStatus>();
  let nextGiven = false;
  for (const node of pathNodes(bundle)) {
    if (isNodeDone(node, state)) {
      statuses.set(node.id, "done");
    } else if (!nextGiven) {
      statuses.set(node.id, "next");
      nextGiven = true;
    } else {
      statuses.set(node.id, "locked");
    }
  }
  return statuses;
}

export function nextNode(bundle: ContentBundle, state: GameState): PathNode | null {
  return pathNodes(bundle).find((node) => !isNodeDone(node, state)) ?? null;
}

export function findNode(bundle: ContentBundle, id: string): PathNode | undefined {
  return pathNodes(bundle).find((node) => node.id === id);
}
```

`src/game/reviewSet.ts`:

```ts
import { allConcepts, findItem } from "../content/lookup";
import { isChoiceQuestion, type ChoiceQuestion, type ContentBundle, type Exercise } from "../content/types";
import { isDue } from "./leitner";
import { shuffled, type Rng } from "./random";
import type { ConceptMastery, GameState } from "./state";

/** Items in a review station (spec 5.10). */
export const REVIEW_SIZE = 5;
/** Items in a practice set after a misconception (spec 5.9 step 2). */
export const PRACTICE_SIZE = 2;

const LEVELS = ["level1", "level2", "level3"] as const;

/**
 * The items a child may meet in a review: exercises and questions of finished lessons, and the practice exercises
 * of topics with at least 1 finished lesson. Items of lessons not learned yet stay hidden.
 */
export function availableItems(bundle: ContentBundle, state: GameState): Map<string, Exercise> {
  const done = new Set(state.progress.completedLessons);
  const items = new Map<string, Exercise>();
  for (const topic of bundle.stages.flatMap((stage) => stage.topics)) {
    for (const lesson of topic.lessons) {
      if (done.has(lesson.id)) for (const exercise of lesson.exercises) items.set(exercise.id, exercise);
    }
    for (const question of topic.questions) {
      if (question.lessons.some((id) => done.has(id))) items.set(question.id, question);
    }
    if (topic.lessons.some((lesson) => done.has(lesson.id))) {
      for (const exercise of topic.practice) items.set(exercise.id, exercise);
    }
  }
  return items;
}

/** Items for a concept at the ladder level first, then at the nearest other levels. */
function conceptItems(bundle: ContentBundle, available: Map<string, Exercise>, conceptId: string, level: number, rng: Rng): Exercise[] {
  const concept = allConcepts(bundle).find((c) => c.id === conceptId);
  if (!concept) return [];
  const order = [...LEVELS].sort((a, b) => Math.abs(LEVELS.indexOf(a) + 1 - level) - Math.abs(LEVELS.indexOf(b) + 1 - level));
  const items: Exercise[] = [];
  for (const key of order) {
    for (const id of shuffled(concept.practice[key], rng)) {
      const item = available.get(id);
      if (item && !items.includes(item)) items.push(item);
    }
  }
  const others = [...available.values()].filter(
    (item) => isChoiceQuestion(item) && item.concepts.includes(conceptId) && !items.includes(item),
  );
  return [...items, ...shuffled(others, rng)];
}

function weakestScore(question: ChoiceQuestion, state: GameState): number {
  return Math.min(100, ...question.concepts.map((id) => state.mastery[id]?.score ?? 100));
}

export interface ReviewSetInput {
  bundle: ContentBundle;
  state: GameState;
  today: string;
  rng: Rng;
  /** The lessons the station reviews: the ones since the previous station, or the latest ones. */
  recentLessons: string[];
}

/**
 * Up to 5 items (spec 5.10): 2 questions on the recent lessons; 2 due questions, weakest concepts first; 1 item for
 * help (an exercise whose solution was shown and is due again, else a "needs help" concept at its ladder level);
 * random older questions for the rest.
 */
export function buildReviewSet({ bundle, state, today, rng, recentLessons }: ReviewSetInput): Exercise[] {
  const available = availableItems(bundle, state);
  const questions = [...available.values()].filter(isChoiceQuestion);
  const chosen: Exercise[] = [];
  const take = (item: Exercise | undefined) => {
    if (item && chosen.length < REVIEW_SIZE && !chosen.includes(item)) chosen.push(item);
  };

  const recent = new Set(recentLessons);
  shuffled(questions.filter((q) => q.lessons.some((id) => recent.has(id))), rng)
    .slice(0, 2)
    .forEach(take);

  const due = questions
    .filter((q) => !chosen.includes(q) && state.reviews[q.id] !== undefined && isDue(state.reviews[q.id]!, today))
    .sort(
      (a, b) =>
        weakestScore(a, state) - weakestScore(b, state) ||
        state.reviews[a.id]!.due.localeCompare(state.reviews[b.id]!.due) ||
        a.id.localeCompare(b.id),
    );
  due.slice(0, 2).forEach(take);

  take(helpItem(bundle, state, today, available, chosen, rng));
  shuffled(questions, rng).forEach(take);
  return chosen;
}

function helpItem(
  bundle: ContentBundle,
  state: GameState,
  today: string,
  available: Map<string, Exercise>,
  chosen: Exercise[],
  rng: Rng,
): Exercise | undefined {
  const retry = Object.entries(state.retry)
    .filter(([, day]) => day <= today)
    .map(([id]) => findItem(bundle, id))
    .filter((item): item is Exercise => item !== undefined && !chosen.includes(item))
    .sort((a, b) => a.id.localeCompare(b.id));
  if (retry[0]) return retry[0];
  const flagged = (Object.entries(state.mastery) as [string, ConceptMastery][])
    .filter(([, m]) => m.needsHelp)
    .sort((a, b) => a[1].score - b[1].score || a[0].localeCompare(b[0]));
  for (const [conceptId, m] of flagged) {
    const item = conceptItems(bundle, available, conceptId, m.level, rng).find((i) => !chosen.includes(i));
    if (item) return item;
  }
  return undefined;
}

/** 2 practice items for a concept at the child's ladder level (spec 5.9 step 2). */
export function buildPracticeSet(bundle: ContentBundle, state: GameState, conceptId: string, rng: Rng): Exercise[] {
  const level = state.mastery[conceptId]?.level ?? 1;
  return conceptItems(bundle, availableItems(bundle, state), conceptId, level, rng).slice(0, PRACTICE_SIZE);
}
```

`src/game/progress.ts`:

1. Đổi import nội dung và thêm import `REVIEW_SIZE`:

```ts
import { isChoiceQuestion, type ContentBundle, type Stage } from "../content/types";
```

```ts
import { REVIEW_SIZE } from "./reviewSet";
```

2. Thay hàm `stageXpMax` bằng:

```ts
/** The XP a child can earn in a stage from lessons, their exercises and 1 perfect run of each review station. */
export function stageXpMax(stage: Stage): number {
  const lessons = stage.topics
    .flatMap((topic) => topic.lessons)
    .reduce(
      (sum, lesson) =>
        sum +
        XP.lesson +
        lesson.exercises.reduce((part, exercise) => part + (isChoiceQuestion(exercise) ? XP.question : XP.codeFirstTry), 0),
      0,
    );
  const stations = stage.topics.reduce((sum, topic) => sum + topic.reviews.length, 0);
  return lessons + stations * (XP.review + XP.reviewPerCorrect * REVIEW_SIZE);
}
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run src/game && npm run typecheck`
Expected: PASS. `stageXpMax` của `testBundle()` vẫn là 38 vì bộ này không có trạm ôn.

- [ ] **Step 5: Commit**

```bash
git add src/game/path.ts src/game/reviewSet.ts src/game/progress.ts src/game/path.test.ts src/game/reviewSet.test.ts src/test/reviewBundle.ts
git commit -m "feat(game): map path with review stations and the choice of review and practice items

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Màn hình parsons và fill, component chung `ItemView`

**Files:**
- Create: `src/ui/PuzzleExerciseView.tsx`, `src/ui/ItemView.tsx`
- Modify: `src/ui/CodeExerciseView.tsx`, `src/ui/LessonScreen.tsx`, `src/i18n/vi.ts`, `src/i18n/en.ts`, `src/styles.css`
- Test: `src/ui/PuzzleExerciseView.test.tsx`, `src/ui/ItemView.test.tsx`

**Interfaces:**
- Consumes: `JudgeSpec` (Task 6), `fillTemplate`, `FILL_BLANK`, `isChoiceQuestion` (Task 5), `shuffled`, `seededRng`, `Rng`, `ResultSource` (Task 3), sự kiện có `concepts`/`misconceptions`/`source` (Task 4), `reviewBundle`, `reviewCode`, `reviewParsons`, `reviewFill` (Task 7).
- Produces:
  - `export const FAILED_SUBMITS_BEFORE_SOLUTION = 3` (từ `CodeExerciseView.tsx`).
  - `scrambleLines(lines, rng): string[]`; `PuzzleExerciseView({ exercise, onComplete, onJudged?, onHint?, onSolutionViewed?, rng? })`.
  - `interface ItemDone { correct: boolean }`; `ItemView({ item, source, onDone })`: hiện 1 bài bất kỳ, gửi sự kiện kèm khái niệm và nguồn. Ngoài bài học: không dùng bản nháp, không dùng số gợi ý đã lưu, không gửi `HintShown`.
  - Khóa i18n `parsons.lines`, `parsons.up`, `parsons.down`, `fill.blank`.

- [ ] **Step 1: Viết test thất bại**

`src/ui/PuzzleExerciseView.test.tsx`:

```tsx
// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { seededRng } from "../game/random";
import { fakeRunner, okResult, renderWithApp } from "../test/render";
import { reviewFill, reviewParsons } from "../test/reviewBundle";
import { PuzzleExerciseView, scrambleLines } from "./PuzzleExerciseView";

const lineTexts = () => screen.getAllByRole("listitem").map((li) => li.querySelector("pre")!.textContent);
const submit = () => screen.getByRole("button", { name: "Nộp bài" });

/** Prints what the code would print: only the 2 print lines of the fixtures matter. */
const echoRunner = () =>
  fakeRunner((code) => okResult(code.includes("Bye") ? code.replace(/print\("(\w+)"\)/g, "$1") : code.includes('"Hi"') ? "Hi\n" : ""));

describe("scrambleLines", () => {
  test("never returns the right order when another order exists", () => {
    for (let seed = 0; seed < 20; seed += 1) {
      expect(scrambleLines(["a", "b"], seededRng(seed))).toEqual(["b", "a"]);
      const out = scrambleLines(["a", "b", "c"], seededRng(seed));
      expect([...out].sort()).toEqual(["a", "b", "c"]);
      expect(out).not.toEqual(["a", "b", "c"]);
    }
    expect(scrambleLines(["x", "x"], seededRng(1))).toEqual(["x", "x"]);
  });
});

describe("PuzzleExerciseView: parsons", () => {
  test("moves lines and submits them in the new order", async () => {
    const onComplete = vi.fn();
    const onJudged = vi.fn();
    const runner = echoRunner();
    renderWithApp(<PuzzleExerciseView exercise={reviewParsons} onComplete={onComplete} onJudged={onJudged} rng={seededRng(1)} />, {
      runner,
    });
    expect(screen.getByText("Sắp xếp để in ra Hi rồi Bye")).toBeInTheDocument();
    expect(lineTexts()).toEqual(['print("Bye")', 'print("Hi")']);
    expect(screen.getByRole("button", { name: "Đưa dòng 1 lên" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Đưa dòng 2 lên" }));
    expect(lineTexts()).toEqual(['print("Hi")', 'print("Bye")']);
    await userEvent.click(submit());
    expect(await screen.findByText("Đúng hết 1/1 test!")).toBeInTheDocument();
    expect(runner.calls[0]!.code).toBe('print("Hi")\nprint("Bye")\n');
    expect(onComplete).toHaveBeenCalledWith("solved");
    expect(onJudged.mock.calls[0]![0]).toMatchObject({ failedSubmitsBefore: 0, hintsUsed: 0, viewedSolution: false });
    expect(submit()).toBeDisabled();
    expect(screen.getByRole("button", { name: "Đưa dòng 2 lên" })).toBeDisabled();
  });

  test("a wrong order fails; after 3 fails the solution can be shown", async () => {
    const onComplete = vi.fn();
    const onSolutionViewed = vi.fn();
    renderWithApp(
      <PuzzleExerciseView exercise={reviewParsons} onComplete={onComplete} onSolutionViewed={onSolutionViewed} rng={seededRng(1)} />,
      { runner: echoRunner() },
    );
    for (let n = 0; n < 3; n += 1) {
      await userEvent.click(submit());
      await waitFor(() => expect(submit()).toBeEnabled());
    }
    expect(screen.getByText("Đúng 0/1 test. Xem test bị sai ở bên dưới nhé.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Gợi ý" }));
    expect(screen.getByText("Gợi ý 1: Hi đứng trước.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Xem lời giải" }));
    expect(screen.getByText("Lời giải mẫu")).toBeInTheDocument();
    expect(onSolutionViewed).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledWith("viewed-solution");
  });
});

describe("PuzzleExerciseView: fill", () => {
  test("puts the typed text into the blank", async () => {
    const onComplete = vi.fn();
    const runner = echoRunner();
    renderWithApp(<PuzzleExerciseView exercise={reviewFill} onComplete={onComplete} />, { runner });
    await userEvent.type(screen.getByRole("textbox", { name: "Chỗ trống 1" }), '"Hi"');
    await userEvent.click(submit());
    expect(await screen.findByText("Đúng hết 1/1 test!")).toBeInTheDocument();
    expect(runner.calls[0]!.code).toBe('print("Hi")\n');
    expect(onComplete).toHaveBeenCalledWith("solved");
  });
});
```

`src/ui/ItemView.test.tsx`:

```tsx
// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { fixtureCodeExercise } from "../test/fixtures";
import { fakeRunner, okResult } from "../test/render";
import { renderWithGame } from "../test/renderGame";
import { reviewBundle, reviewCode, reviewFill } from "../test/reviewBundle";
import { ItemView } from "./ItemView";

vi.mock("./CodeEditor", () => ({
  CodeEditor: (props: { value: string; onChange(value: string): void; ariaLabel: string }) => (
    <textarea aria-label={props.ariaLabel} value={props.value} onChange={(e) => props.onChange(e.target.value)} />
  ),
}));

const bundle = reviewBundle();
const question = bundle.stages[0]!.topics[0]!.questions[0]!;

async function savedState(store: Awaited<ReturnType<typeof renderWithGame>>["store"]) {
  return (await store.loadActive())!.state;
}

describe("ItemView", () => {
  test("a wrong answer records the concept, the misconception, the Leitner box and the attempt", async () => {
    const onDone = vi.fn();
    const { store } = await renderWithGame(<ItemView item={question} source="review" onDone={onDone} />, { bundle });
    await userEvent.click(screen.getByRole("radio", { name: "Sai" }));
    await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
    expect(onDone).toHaveBeenCalledWith({ correct: false });
    await waitFor(async () => expect((await savedState(store)).reviews["r.q1"]).toEqual({ box: 1, due: "2026-10-07" }));
    const state = await savedState(store);
    expect(state.mastery.c1).toMatchObject({ score: 0, recent: [0], reviewMisses: 1, misconceptions: 1 });
    expect(state.pet.xp).toBe(0);
    const [bundleOut] = await store.exportProfiles();
    expect(bundleOut!.attempts).toMatchObject([{ kind: "choice", itemId: "r.q1", correct: false }]);
  });

  test("a code exercise solved at the first submit is correct and updates the concept", async () => {
    const onDone = vi.fn();
    const { store } = await renderWithGame(<ItemView item={reviewCode} source="practice" onDone={onDone} />, {
      bundle,
      runner: fakeRunner(() => okResult("Hi\n")),
    });
    await userEvent.click(screen.getByRole("button", { name: "Nộp bài" }));
    await waitFor(() => expect(onDone).toHaveBeenCalledWith({ correct: true }));
    await waitFor(async () => expect((await savedState(store)).mastery.c1?.score).toBe(30));
    expect((await savedState(store)).pet.xp).toBe(15);
  });

  test("outside a lesson the code starts from the starter, not from the lesson draft", async () => {
    await renderWithGame(<ItemView item={fixtureCodeExercise} source="review" onDone={() => {}} />, {
      drafts: { [fixtureCodeExercise.id]: 'print("Hi")' },
    });
    expect(screen.getByRole("textbox", { name: "Trình soạn code" })).toHaveValue("");
  });

  test("in a lesson the code starts from the saved draft", async () => {
    await renderWithGame(<ItemView item={fixtureCodeExercise} source="lesson" onDone={() => {}} />, {
      drafts: { [fixtureCodeExercise.id]: 'print("Hi")' },
    });
    expect(screen.getByRole("textbox", { name: "Trình soạn code" })).toHaveValue('print("Hi")');
  });

  test("a fill exercise solved after a failed submit is not counted as correct", async () => {
    const onDone = vi.fn();
    await renderWithGame(<ItemView item={reviewFill} source="review" onDone={onDone} />, {
      bundle,
      runner: fakeRunner((code) => okResult(code.includes('"Hi"') ? "Hi\n" : "")),
    });
    const submit = screen.getByRole("button", { name: "Nộp bài" });
    await userEvent.click(submit);
    await waitFor(() => expect(submit).toBeEnabled());
    await userEvent.type(screen.getByRole("textbox", { name: "Chỗ trống 1" }), '"Hi"');
    await userEvent.click(submit);
    await waitFor(() => expect(onDone).toHaveBeenCalledWith({ correct: false }));
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/ui/PuzzleExerciseView.test.tsx src/ui/ItemView.test.tsx`
Expected: FAIL vì chưa có `./PuzzleExerciseView`, `./ItemView`.

- [ ] **Step 3: Viết code**

`src/ui/CodeExerciseView.tsx`: đổi `const FAILED_SUBMITS_BEFORE_SOLUTION = 3;` thành `export const FAILED_SUBMITS_BEFORE_SOLUTION = 3;`.

`src/ui/PuzzleExerciseView.tsx`:

```tsx
import { Fragment, useState } from "react";
import { fillTemplate } from "../content/exercise";
import { FILL_BLANK, type FillExercise, type ParsonsExercise } from "../content/types";
import { isPseudoError, problemFromOutcome } from "../explain/problem";
import { shuffled, type Rng } from "../game/random";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { judge, type JudgeResult } from "../runner/judge";
import { FAILED_SUBMITS_BEFORE_SOLUTION, type ExerciseOutcome, type JudgedInfo } from "./CodeExerciseView";
import { useRunner } from "./contexts";
import { crashFeedback, feedbackForProblem, type Feedback } from "./feedback";
import { RobotBubble } from "./RobotBubble";
import { TestResultList } from "./TestResultList";
import { useExplain } from "./useExplain";

/** The lines in a new order: never the right order when another order exists. */
export function scrambleLines(lines: readonly string[], rng: Rng): string[] {
  const out = shuffled(lines, rng);
  const unchanged = out.every((line, i) => line === lines[i]);
  return unchanged && new Set(lines).size > 1 ? [...out.slice(1), out[0] as string] : out;
}

/** A parsons exercise (put the lines in order) or a fill exercise (type the blanks), graded with test cases. */
export function PuzzleExerciseView({
  exercise,
  onComplete,
  onJudged,
  onHint,
  onSolutionViewed,
  rng = Math.random,
}: {
  exercise: ParsonsExercise | FillExercise;
  onComplete(outcome: ExerciseOutcome): void;
  onJudged?(info: JudgedInfo): void;
  onHint?(): void;
  onSolutionViewed?(): void;
  rng?: Rng;
}) {
  const { t, uiLang } = useLang();
  const runner = useRunner();
  const explain = useExplain();
  const [lines, setLines] = useState(() => (exercise.type === "parsons" ? scrambleLines(exercise.lines, rng) : []));
  const [blanks, setBlanks] = useState(() => (exercise.type === "fill" ? exercise.answers.map(() => "") : []));
  const [busy, setBusy] = useState(false);
  const [solved, setSolved] = useState(false);
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [failedSubmits, setFailedSubmits] = useState(0);
  const [solutionShown, setSolutionShown] = useState(false);
  const example = exercise.tests.find((test) => !test.hidden) ?? null;
  const code = exercise.type === "parsons" ? `${lines.join("\n")}\n` : fillTemplate(exercise.template, blanks);

  function move(index: number, step: -1 | 1) {
    setLines((current) => {
      const next = [...current];
      [next[index], next[index + step]] = [next[index + step] as string, next[index] as string];
      return next;
    });
  }

  async function handleSubmit() {
    setFeedback(null);
    setJudgeResult(null);
    setBusy(true);
    try {
      const result = await judge(exercise, code, runner.run);
      setJudgeResult(result);
      onJudged?.({ result, code, failedSubmitsBefore: failedSubmits, hintsUsed: hintsShown, viewedSolution: solutionShown });
      if (result.status === "accepted") {
        setSolved(true);
        setFeedback({ mood: "happy", message: t("judge.accepted", { passed: result.passedCount, total: result.total }), hint: null, rawError: null });
        onComplete("solved");
        return;
      }
      setFailedSubmits((n) => n + 1);
      const failedTests = result.tests.filter((test) => test.ran && !test.passed);
      const failed = failedTests.find((test) => !test.hidden) ?? failedTests[0] ?? null;
      const problem = failed ? problemFromOutcome(failed, true) : null;
      if (problem && failed && (!failed.hidden || isPseudoError(problem.type))) {
        setFeedback(await feedbackForProblem(problem, code, explain, t));
      } else {
        setFeedback({ mood: "sad", message: t("judge.partial", { passed: result.passedCount, total: result.total }), hint: null, rawError: null });
      }
    } catch {
      setFeedback(crashFeedback(t));
    } finally {
      setBusy(false);
    }
  }

  function showHint() {
    setHintsShown((n) => n + 1);
    onHint?.();
  }

  function showSolution() {
    setSolutionShown(true);
    onSolutionViewed?.();
    onComplete("viewed-solution");
  }

  return (
    <div className="puzzle">
      <p className="exercise-prompt">{pick(exercise.prompt, uiLang)}</p>
      {example && (
        <div className="example">
          <h4>{t("exercise.example")}</h4>
          {example.input !== "" && (
            <>
              <span>{t("judge.input")}</span>
              <pre>{example.input.trimEnd()}</pre>
            </>
          )}
          <span>{t("exercise.expectedOutput")}</span>
          <pre>{example.output.trimEnd()}</pre>
        </div>
      )}
      {exercise.type === "parsons" ? (
        <ol className="parsons-lines" aria-label={t("parsons.lines")}>
          {lines.map((line, i) => (
            <li key={i}>
              <pre className="parsons-line">{line}</pre>
              <button aria-label={t("parsons.up", { n: i + 1 })} disabled={solved || i === 0} onClick={() => move(i, -1)}>
                ↑
              </button>
              <button
                aria-label={t("parsons.down", { n: i + 1 })}
                disabled={solved || i === lines.length - 1}
                onClick={() => move(i, 1)}
              >
                ↓
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <pre className="fill-template">
          <code>
            {exercise.template.split(FILL_BLANK).map((part, i) => (
              <Fragment key={i}>
                {i > 0 && (
                  <input
                    aria-label={t("fill.blank", { n: i })}
                    value={blanks[i - 1]}
                    disabled={solved}
                    spellCheck={false}
                    size={Math.max(4, (blanks[i - 1] ?? "").length + 1)}
                    onChange={(event) => {
                      const value = event.target.value;
                      setBlanks((current) => current.map((old, j) => (j === i - 1 ? value : old)));
                    }}
                  />
                )}
                {part}
              </Fragment>
            ))}
          </code>
        </pre>
      )}
      {exercise.hints.slice(0, hintsShown).map((hint, i) => (
        <p key={i} className="hint">
          {t("hint.title", { n: i + 1 })}: {pick(hint, uiLang)}
        </p>
      ))}
      {hintsShown < exercise.hints.length && !solved && (
        <button onClick={showHint}>{hintsShown === 0 ? t("hint.show") : t("hint.next")}</button>
      )}
      {failedSubmits >= FAILED_SUBMITS_BEFORE_SOLUTION && !solutionShown && !solved && (
        <button onClick={showSolution}>{t("solution.show")}</button>
      )}
      {solutionShown && (
        <div className="solution">
          <h4>{t("solution.title")}</h4>
          <pre>{exercise.solution.trimEnd()}</pre>
        </div>
      )}
      <div className="exercise-actions">
        <button className="primary" onClick={handleSubmit} disabled={busy || solved || runner.status !== "ready"}>
          {t("code.submit")}
        </button>
      </div>
      {busy && <p>{t("code.running")}</p>}
      {feedback && <RobotBubble {...feedback} />}
      {judgeResult && <TestResultList result={judgeResult} />}
    </div>
  );
}
```

`src/ui/ItemView.tsx`:

```tsx
import { useRef } from "react";
import { isChoiceQuestion, type Exercise } from "../content/types";
import type { ResultSource } from "../game/mastery";
import { CodeExerciseView, type ExerciseOutcome, type JudgedInfo } from "./CodeExerciseView";
import { useGame } from "./GameProvider";
import { PuzzleExerciseView } from "./PuzzleExerciseView";
import { QuestionCard } from "./QuestionCard";

export interface ItemDone {
  /** True when the first answer or the first submit was right, without a hint or the solution. */
  correct: boolean;
}

/**
 * Shows 1 exercise or question of any type and sends its events with the concepts and the source. Outside a lesson,
 * the view starts clean: no saved draft, no saved hint counts.
 */
export function ItemView({ item, source, onDone }: { item: Exercise; source: ResultSource; onDone(result: ItemDone): void }) {
  const game = useGame();
  const firstTry = useRef<boolean | null>(null);
  const inLesson = source === "lesson";

  if (isChoiceQuestion(item)) {
    return (
      <QuestionCard
        question={item}
        onAnswered={(correct, detail) => {
          game.dispatch(
            {
              type: "QuestionAnswered",
              questionId: item.id,
              correct,
              concepts: item.concepts,
              misconception: item.choices[detail.choiceIndex]?.misconception ?? null,
              source,
            },
            { kind: "choice", itemId: item.id, choiceIndex: detail.choiceIndex, correct, lang: detail.lang },
          );
          onDone({ correct });
        }}
      />
    );
  }

  const onJudged = (info: JudgedInfo) => {
    const accepted = info.result.status === "accepted";
    firstTry.current ??= accepted && info.hintsUsed === 0 && !info.viewedSolution;
    game.dispatch(
      {
        type: "ExerciseJudged",
        exerciseId: item.id,
        accepted,
        failedSubmitsBefore: info.failedSubmitsBefore,
        hintsUsed: info.hintsUsed,
        viewedSolution: info.viewedSolution,
        concepts: item.concepts,
        misconceptions: info.result.misconceptions,
        source,
      },
      {
        kind: "code",
        itemId: item.id,
        code: info.code,
        status: info.result.status,
        passedCount: info.result.passedCount,
        total: info.result.total,
        misconceptions: info.result.misconceptions,
      },
    );
  };
  const onComplete = (outcome: ExerciseOutcome) => onDone({ correct: outcome === "solved" && firstTry.current === true });
  const onHint = inLesson ? () => game.dispatch({ type: "HintShown", exerciseId: item.id }) : undefined;
  const onSolutionViewed = () => game.dispatch({ type: "SolutionViewed", exerciseId: item.id });

  if (item.type === "code") {
    return (
      <CodeExerciseView
        exercise={item}
        initialCode={inLesson ? game.draftFor(item.id) : undefined}
        onCodeChange={inLesson ? (code) => game.saveDraft(item.id, code) : undefined}
        initialStats={inLesson ? game.state.progress.exerciseStats?.[item.id] : undefined}
        onHint={onHint}
        onSolutionViewed={onSolutionViewed}
        onJudged={onJudged}
        onComplete={onComplete}
      />
    );
  }
  return (
    <PuzzleExerciseView
      exercise={item}
      onHint={onHint}
      onSolutionViewed={onSolutionViewed}
      onJudged={onJudged}
      onComplete={onComplete}
    />
  );
}
```

`src/ui/LessonScreen.tsx` (thay toàn bộ file; bài tập nào cũng đi qua `ItemView` với nguồn `lesson`):

```tsx
import { useMemo, useState } from "react";
import type { Card, Exercise, Lesson } from "../content/types";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { CardView } from "./CardView";
import { useGame } from "./GameProvider";
import { ItemView } from "./ItemView";
import { ResultView } from "./ResultView";

type Step = { kind: "card"; card: Card } | { kind: "exercise"; exercise: Exercise };

export interface LessonScreenProps {
  lesson: Lesson;
  onExit(): void;
}

export function LessonScreen({ lesson, onExit }: LessonScreenProps) {
  const { t, uiLang } = useLang();
  const game = useGame();
  const [before] = useState(() => game.state);
  const steps = useMemo<Step[]>(
    () => [
      ...lesson.cards.map((card): Step => ({ kind: "card", card })),
      ...lesson.exercises.map((exercise): Step => ({ kind: "exercise", exercise })),
    ],
    [lesson],
  );
  const [index, setIndex] = useState(0);
  const [doneSteps, setDoneSteps] = useState<ReadonlySet<number>>(() => new Set());
  const [finished, setFinished] = useState(false);

  const step = steps[index];
  if (finished || step === undefined) {
    return <ResultView before={before} after={game.state} onExit={onExit} />;
  }

  const markDone = (stepIndex: number) => setDoneSteps((previous) => new Set(previous).add(stepIndex));
  const next = () => {
    if (index + 1 < steps.length) {
      setIndex(index + 1);
    } else {
      setFinished(true);
      game.dispatch({ type: "LessonCompleted", lessonId: lesson.id });
    }
  };

  const cardCount = lesson.cards.length;
  const progress =
    step.kind === "card"
      ? t("lesson.cardOf", { current: index + 1, total: cardCount })
      : t("lesson.exerciseOf", { current: index - cardCount + 1, total: lesson.exercises.length });
  const canGoNext = step.kind === "card" || doneSteps.has(index);
  const isLast = index === steps.length - 1;

  const body =
    step.kind === "card" ? (
      <CardView key={`card-${index}`} card={step.card} />
    ) : (
      <ItemView key={step.exercise.id} item={step.exercise} source="lesson" onDone={() => markDone(index)} />
    );

  return (
    <main className="lesson">
      <div className="lesson-top">
        <h1>{pick(lesson.title, uiLang)}</h1>
        <span>{progress}</span>
      </div>
      {body}
      <nav className="lesson-nav">
        <button onClick={() => setIndex(index - 1)} disabled={index === 0}>
          {t("lesson.back")}
        </button>
        <button className="primary" onClick={next} disabled={!canGoNext}>
          {isLast ? t("lesson.finish") : t("lesson.next")}
        </button>
      </nav>
    </main>
  );
}
```

`src/i18n/vi.ts`: thêm trước `"question.lang"`:

```ts
  "parsons.lines": "Các dòng code (sắp xếp lại cho đúng thứ tự)",
  "parsons.up": "Đưa dòng {n} lên",
  "parsons.down": "Đưa dòng {n} xuống",
  "fill.blank": "Chỗ trống {n}",
```

`src/i18n/en.ts`: thêm ở cùng vị trí:

```ts
  "parsons.lines": "Lines of code (put them in the right order)",
  "parsons.up": "Move line {n} up",
  "parsons.down": "Move line {n} down",
  "fill.blank": "Blank {n}",
```

`src/styles.css`: thêm sau dòng `.node-locked { color: var(--muted); }`:

```css
.puzzle { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; }
.parsons-lines { list-style: none; padding: 0; display: grid; gap: 6px; }
.parsons-lines li { display: flex; gap: 6px; align-items: center; }
.parsons-line { flex: 1; margin: 0; padding: 8px 12px; border-radius: 8px; background: var(--code-bg); color: var(--code-text); font-family: var(--mono); font-size: 1rem; white-space: pre; }
.fill-template { background: var(--code-bg); color: var(--code-text); padding: 10px 12px; border-radius: 8px; font-family: var(--mono); font-size: 1rem; white-space: pre-wrap; }
.fill-template input { font-family: var(--mono); font-size: 1rem; margin: 0 2px; }
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run src/ui && npm run typecheck`
Expected: PASS, gồm `LessonScreen.test.tsx` cũ (bài học vẫn thưởng +28 XP, +8 xu).

- [ ] **Step 5: Commit**

```bash
git add src/ui/PuzzleExerciseView.tsx src/ui/PuzzleExerciseView.test.tsx src/ui/ItemView.tsx src/ui/ItemView.test.tsx src/ui/CodeExerciseView.tsx src/ui/LessonScreen.tsx src/i18n/vi.ts src/i18n/en.ts src/styles.css
git commit -m "feat(ui): parsons and fill views and one ItemView for every exercise type

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 9: Trạm ôn trên bản đồ, ôn tập tự do và sạc Pin

**Files:**
- Create: `src/ui/SessionScreen.tsx`, `src/ui/ReviewScreen.tsx`
- Modify: `src/ui/routing.ts`, `src/ui/ResultView.tsx`, `src/ui/LessonScreen.tsx`, `src/ui/MapScreen.tsx`, `src/ui/RoomScreen.tsx`, `src/ui/AppRoutes.tsx`, `src/game/progress.ts`, `src/i18n/vi.ts`, `src/i18n/en.ts`, `src/styles.css`, `content/stage-1/01-lam-quen/topic.yaml`, `content/stage-1/01-lam-quen/concepts.yaml`
- Test: `src/ui/ReviewScreen.test.tsx`, `src/ui/routing.test.ts`, `src/ui/MapScreen.test.tsx`, `src/ui/RoomScreen.test.tsx`, `src/ui/AppRoutes.test.tsx`, `src/ui/LessonScreen.test.tsx`, `src/game/progress.test.ts`

**Interfaces:**
- Consumes: `pathNodes`, `nodeStatuses`, `nextNode`, `findNode`, `PathNode`, `buildReviewSet` (Task 7), `ItemView` (Task 8), `ReviewCompleted` (Task 4).
- Produces:
  - `Route` thêm `{ name: "review"; stationId: string | null }` (`#/review`, `#/review/<id>`) và `{ name: "practice"; conceptId: string }` (`#/practice/<id>`, màn hình ở Task 10); `nodeRoute(node: PathNode): Route`.
  - `ResultView({ before, after, title, message, onExit })`: nút "Học tiếp" mở nút kế tiếp của bản đồ.
  - `SessionScreen({ title, items, source, onFinish, doneTitle, onExit })`: chuỗi bài dạng thẻ; danh sách rỗng vẫn bấm "Hoàn thành" được.
  - `ReviewScreen({ stationId, onExit, rng? })`.
  - Bỏ `lessonStatuses`, `nextLessonId`, `LessonStatus` khỏi `src/game/progress.ts`; bỏ khóa `result.next`.
  - Khóa i18n `review.*`, `map.review`, `room.review`, `room.recharge`; `pet.drained` mới.

- [ ] **Step 1: Viết test thất bại**

`src/ui/ReviewScreen.test.tsx`:

```tsx
// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { seededRng } from "../game/random";
import { initialGameState } from "../game/state";
import { renderWithGame, TODAY } from "../test/renderGame";
import { reviewBundle } from "../test/reviewBundle";
import { ReviewScreen } from "./ReviewScreen";

const bundle = reviewBundle();

function stateWith(lessons: string[]) {
  const state = initialGameState(TODAY);
  state.progress.completedLessons = lessons;
  return state;
}

/** Answers the current question with the given choice, then goes on. */
async function answer(choice: "Đúng" | "Sai", last = false) {
  await userEvent.click(screen.getByRole("radio", { name: choice }));
  await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
  await userEvent.click(screen.getByRole("button", { name: last ? "Hoàn thành" : "Tiếp" }));
}

describe("ReviewScreen", () => {
  test("a station: 5 questions, explanations at once, then the rewards and the next lesson", async () => {
    const { store } = await renderWithGame(<ReviewScreen stationId="r.r1" onExit={() => {}} rng={seededRng(1)} />, {
      bundle,
      state: stateWith(["r.l1", "r.l2"]),
    });
    expect(screen.getByRole("heading", { name: "Trạm ôn" })).toBeInTheDocument();
    expect(screen.getByText("Câu 1/5")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tiếp" })).toBeDisabled();
    await userEvent.click(screen.getByRole("radio", { name: "Sai" }));
    await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
    expect(screen.getByText("Giải thích.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Tiếp" }));
    for (let n = 2; n <= 4; n += 1) await answer("Đúng");
    await answer("Đúng", true);

    expect(screen.getByRole("heading", { name: "Xong trạm ôn!" })).toBeInTheDocument();
    expect(screen.getByText("Con đúng 4/5 câu.")).toBeInTheDocument();
    expect(screen.getByText("+13 XP")).toBeInTheDocument();
    expect(screen.getByText("+10 xu")).toBeInTheDocument();
    expect(screen.getByText("Pin +1")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Học tiếp" })).toHaveAttribute("href", "#/lesson/r.l3");
    await waitFor(async () => expect((await store.loadActive())?.state.progress.completedReviews).toEqual(["r.r1"]));
    expect(Object.keys((await store.loadActive())!.state.reviews)).toHaveLength(5);
  });

  test("a free review does not open without anything to review", async () => {
    await renderWithGame(<ReviewScreen stationId={null} onExit={() => {}} />, { bundle });
    expect(screen.getByText("Chưa có câu nào để ôn. Con học thêm bài nhé!")).toBeInTheDocument();
  });

  test("a free review charges the robot and pays no xu", async () => {
    const state = stateWith(["r.l1"]);
    state.pet.pin = 0;
    const onExit = vi.fn();
    const { store } = await renderWithGame(<ReviewScreen stationId={null} onExit={onExit} rng={seededRng(2)} />, {
      bundle,
      state,
    });
    expect(screen.getByRole("heading", { name: "Ôn tập" })).toBeInTheDocument();
    expect(screen.getByText("Câu 1/3")).toBeInTheDocument();
    await answer("Đúng");
    await answer("Đúng");
    await answer("Đúng", true);
    expect(screen.getByText("Pin +2")).toBeInTheDocument();
    expect(screen.queryByText(/xu$/)).not.toBeInTheDocument();
    await waitFor(async () => expect((await store.loadActive())?.state.pet.pin).toBe(2));
    expect((await store.loadActive())!.state.progress.completedReviews).toEqual([]);
    await userEvent.click(screen.getByRole("button", { name: "Về phòng" }));
    expect(onExit).toHaveBeenCalledOnce();
  });

  test("a station with nothing to ask can still be finished", async () => {
    const empty = reviewBundle();
    empty.stages[0]!.topics[0]!.questions = [];
    empty.stages[0]!.topics[0]!.practice = [];
    empty.stages[0]!.topics[0]!.lessons[0]!.exercises = [];
    await renderWithGame(<ReviewScreen stationId="r.r1" onExit={() => {}} />, {
      bundle: empty,
      state: stateWith(["r.l1", "r.l2"]),
    });
    expect(screen.getByText("Chưa có câu nào để ôn. Con học thêm bài nhé!")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Hoàn thành" }));
    expect(screen.getByText("Con đúng 0/0 câu.")).toBeInTheDocument();
  });
});
```

`src/ui/routing.test.ts`: đổi import thành `import { nodeRoute, parseHash, routeToHash } from "./routing";` và thêm trước `describe("isBrowserSupported", ...)`:

```ts
describe("review and practice routes", () => {
  test("parse and round-trip", () => {
    expect(parseHash("#/review")).toEqual({ name: "review", stationId: null });
    expect(parseHash("#/review/s1.a.r1")).toEqual({ name: "review", stationId: "s1.a.r1" });
    expect(parseHash("#/practice/print-call")).toEqual({ name: "practice", conceptId: "print-call" });
    for (const route of [
      { name: "review", stationId: null },
      { name: "review", stationId: "s1.a.r1" },
      { name: "practice", conceptId: "print-call" },
    ] as const) {
      expect(parseHash(routeToHash(route))).toEqual(route);
    }
  });

  test("nodeRoute opens a lesson or a station", () => {
    expect(nodeRoute({ kind: "lesson", id: "a.l1", topicId: "a" })).toEqual({ name: "lesson", lessonId: "a.l1" });
    expect(nodeRoute({ kind: "review", id: "a.r1", topicId: "a", lessons: [] })).toEqual({ name: "review", stationId: "a.r1" });
  });
});
```

`src/ui/MapScreen.test.tsx` (thay toàn bộ file):

```tsx
// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { initialGameState } from "../game/state";
import { renderWithGame, TODAY } from "../test/renderGame";
import { reviewBundle } from "../test/reviewBundle";
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

test("shows the review station between the lessons", async () => {
  const state = initialGameState(TODAY);
  state.progress.completedLessons = ["r.l1", "r.l2"];
  await renderWithGame(<MapScreen />, { state, bundle: reviewBundle() });
  const items = screen.getAllByRole("listitem");
  expect(items.map((item) => item.textContent)).toEqual([
    "Bài r.l1Đã xong",
    "Bài r.l2Đã xong",
    "Trạm ônBài tiếp theo",
    "Bài r.l3Chưa mở",
  ]);
  expect(within(items[2]!).getByRole("link", { name: "Trạm ôn" })).toHaveAttribute("href", "#/review/r.r1");
});
```

`src/ui/RoomScreen.test.tsx` (thay toàn bộ file):

```tsx
// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { initialGameState } from "../game/state";
import { renderWithGame, TODAY } from "../test/renderGame";
import { reviewBundle } from "../test/reviewBundle";
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
    expect(screen.queryByRole("link", { name: "Ôn tập" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Sạc cho Robo" })).not.toBeInTheDocument();
  });

  test("offers a free review once a lesson is done, and the next node of the map", async () => {
    const state = initialGameState(TODAY);
    state.progress.completedLessons = ["r.l1", "r.l2"];
    await renderWithGame(<RoomScreen />, { state, bundle: reviewBundle() });
    expect(screen.getByRole("link", { name: "Ôn tập" })).toHaveAttribute("href", "#/review");
    expect(screen.getByRole("link", { name: "Học tiếp" })).toHaveAttribute("href", "#/review/r.r1");
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
    expect(screen.getByText("Robo hết pin rồi. Con làm 1 trạm ôn để sạc cho Robo nhé!")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sạc cho Robo" })).toHaveAttribute("href", "#/review");
    expect(screen.getByText("Lớn lên: 79%")).toBeInTheDocument();
    expect(screen.getByText("Xu: 75")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Học tiếp" })).not.toBeInTheDocument();
    expect(screen.getByText("Con đã học hết các bài hiện có. Robo chờ bài mới nhé!")).toBeInTheDocument();
  });
});
```

`src/ui/AppRoutes.test.tsx`: thêm import `import { reviewBundle } from "../test/reviewBundle";` và thêm trước `describe("ErrorBoundary", ...)`:

```tsx
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
```

`src/ui/LessonScreen.test.tsx`: nút sau bài học giờ là "Học tiếp":

```ts
  expect(screen.getByRole("link", { name: "Học tiếp" })).toHaveAttribute("href", "#/lesson/t.l2");
```

`src/game/progress.test.ts`: xóa test `the first unfinished lesson is next, the rest are locked` (thay bằng `path.test.ts` ở Task 7), bỏ `lessonStatuses` và `nextLessonId` khỏi import, đổi `describe("lessons", ...)` thành `describe("stage", ...)`.

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/ui src/game/progress.test.ts`
Expected: FAIL vì chưa có `./ReviewScreen`, `nodeRoute`, trạm ôn trên bản đồ, nút "Ôn tập".

- [ ] **Step 3: Viết code**

`src/ui/routing.ts` (thay toàn bộ file):

```ts
import { useCallback, useEffect, useState } from "react";
import type { PathNode } from "../game/path";

export type Route =
  | { name: "home" }
  | { name: "map" }
  | { name: "backup" }
  | { name: "lesson"; lessonId: string }
  /** stationId null: a free review, for example to charge the robot. */
  | { name: "review"; stationId: string | null }
  | { name: "practice"; conceptId: string };

function decode(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function parseHash(hash: string): Route {
  if (hash === "#/map") return { name: "map" };
  if (hash === "#/backup") return { name: "backup" };
  if (hash === "#/review") return { name: "review", stationId: null };
  const match = /^#\/(lesson|review|practice)\/(.+)$/.exec(hash);
  if (!match) return { name: "home" };
  const id = decode(match[2] as string);
  if (match[1] === "lesson") return { name: "lesson", lessonId: id };
  if (match[1] === "review") return { name: "review", stationId: id };
  return { name: "practice", conceptId: id };
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case "lesson":
      return `#/lesson/${encodeURIComponent(route.lessonId)}`;
    case "review":
      return route.stationId === null ? "#/review" : `#/review/${encodeURIComponent(route.stationId)}`;
    case "practice":
      return `#/practice/${encodeURIComponent(route.conceptId)}`;
    case "map":
      return "#/map";
    case "backup":
      return "#/backup";
    default:
      return "#/";
  }
}

/** The route that opens a node of the map. */
export function nodeRoute(node: PathNode): Route {
  return node.kind === "lesson" ? { name: "lesson", lessonId: node.id } : { name: "review", stationId: node.id };
}

export function useHashRoute(): [Route, (route: Route) => void] {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  const navigate = useCallback((next: Route) => {
    window.location.hash = routeToHash(next);
  }, []);
  return [route, navigate];
}
```

`src/ui/ResultView.tsx` (thay toàn bộ file):

```tsx
import { nextNode } from "../game/path";
import { displayStreak, todayPoints } from "../game/progress";
import type { GameState } from "../game/state";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";
import { Robot } from "./Robot";
import { nodeRoute, routeToHash } from "./routing";

export function ResultView({
  before,
  after,
  title,
  message,
  onExit,
}: {
  before: GameState;
  after: GameState;
  title: string;
  message: string;
  onExit(): void;
}) {
  const { t } = useLang();
  const bundle = useContent();
  const { today } = useGame();
  const xp = after.pet.xp - before.pet.xp;
  const xu = after.wallet.xu - before.wallet.xu;
  const pin = after.pet.pin - before.pet.pin;
  const next = nextNode(bundle, after);
  return (
    <main className="lesson-done">
      <Robot mood="happy" size={96} />
      <h2>{title}</h2>
      <p>{message}</p>
      <ul className="result-rewards">
        {xp > 0 && <li>{t("result.xp", { n: xp })}</li>}
        {xu > 0 && <li>{t("result.xu", { n: xu })}</li>}
        {pin > 0 && <li>{t("result.pin", { n: pin })}</li>}
      </ul>
      <p>{t("room.today", { done: todayPoints(after, today), goal: after.settings.dailyGoal })}</p>
      <p>{t("room.streak", { days: displayStreak(after, today) })}</p>
      <nav className="room-actions">
        {next && (
          <a className="button primary" href={routeToHash(nodeRoute(next))}>
            {t("room.continue")}
          </a>
        )}
        <button onClick={onExit}>{t("nav.room")}</button>
      </nav>
    </main>
  );
}
```

`src/ui/SessionScreen.tsx`:

```tsx
import { useState } from "react";
import type { Exercise } from "../content/types";
import type { ResultSource } from "../game/mastery";
import { useLang } from "../i18n/LangProvider";
import { useGame } from "./GameProvider";
import { ItemView } from "./ItemView";
import { ResultView } from "./ResultView";

export interface SessionScreenProps {
  title: string;
  items: Exercise[];
  source: Exclude<ResultSource, "lesson">;
  /** Called once, when the child finishes the last item; the screen then shows the result. */
  onFinish(result: { correct: number; total: number }): void;
  doneTitle: string;
  onExit(): void;
}

/** A series of items, 1 per card (spec 8.2.4): a review station or a practice set. With no item it can still finish. */
export function SessionScreen({ title, items, source, onFinish, doneTitle, onExit }: SessionScreenProps) {
  const { t } = useLang();
  const game = useGame();
  const [before] = useState(() => game.state);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<(boolean | undefined)[]>(() => items.map(() => undefined));
  const [finished, setFinished] = useState(false);
  const correct = results.filter((r) => r === true).length;

  if (finished) {
    return (
      <ResultView
        before={before}
        after={game.state}
        title={doneTitle}
        message={t("review.score", { correct, total: items.length })}
        onExit={onExit}
      />
    );
  }

  const item: Exercise | undefined = items[index];
  const isLast = index >= items.length - 1;
  const next = () => {
    if (!isLast) {
      setIndex(index + 1);
      return;
    }
    setFinished(true);
    onFinish({ correct, total: items.length });
  };

  return (
    <main className="lesson">
      <div className="lesson-top">
        <h1>{title}</h1>
        {item && <span>{t("review.itemOf", { current: index + 1, total: items.length })}</span>}
      </div>
      {item ? (
        <ItemView
          key={item.id}
          item={item}
          source={source}
          onDone={(result) =>
            setResults((current) => current.map((old, i) => (i === index && old === undefined ? result.correct : old)))
          }
        />
      ) : (
        <p>{t("review.empty")}</p>
      )}
      <nav className="lesson-nav">
        <button className="primary" onClick={next} disabled={item !== undefined && results[index] === undefined}>
          {isLast ? t("lesson.finish") : t("lesson.next")}
        </button>
      </nav>
    </main>
  );
}
```

`src/ui/ReviewScreen.tsx`:

```tsx
import { useState } from "react";
import { findNode } from "../game/path";
import type { Rng } from "../game/random";
import { buildReviewSet } from "../game/reviewSet";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";
import { SessionScreen } from "./SessionScreen";

/**
 * A review station of the map (stationId) or a free review (null). A free review needs at least 1 item: it charges
 * the robot, so it must not pay for nothing.
 */
export function ReviewScreen({ stationId, onExit, rng = Math.random }: { stationId: string | null; onExit(): void; rng?: Rng }) {
  const { t } = useLang();
  const bundle = useContent();
  const game = useGame();
  const [items] = useState(() => {
    const node = stationId === null ? undefined : findNode(bundle, stationId);
    const recentLessons = node?.kind === "review" ? node.lessons : game.state.progress.completedLessons.slice(-2);
    return buildReviewSet({ bundle, state: game.state, today: game.today, rng, recentLessons });
  });

  if (stationId === null && items.length === 0) {
    return (
      <main className="room">
        <p>{t("review.empty")}</p>
        <a href="#/">{t("nav.room")}</a>
      </main>
    );
  }
  return (
    <SessionScreen
      title={t(stationId === null ? "review.freeTitle" : "review.title")}
      items={items}
      source="review"
      doneTitle={t("review.doneTitle")}
      onFinish={({ correct, total }) => game.dispatch({ type: "ReviewCompleted", stationId, correct, total })}
      onExit={onExit}
    />
  );
}
```

`src/ui/LessonScreen.tsx`: thay `return <ResultView before={before} after={game.state} onExit={onExit} />;` bằng:

```tsx
    return (
      <ResultView
        before={before}
        after={game.state}
        title={t("lesson.doneTitle")}
        message={t("lesson.doneBody")}
        onExit={onExit}
      />
    );
```

`src/ui/MapScreen.tsx` (thay toàn bộ file):

```tsx
import { nodeStatuses, pathNodes, type PathNode } from "../game/path";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";
import { nodeRoute, routeToHash } from "./routing";

export function MapScreen() {
  const bundle = useContent();
  const game = useGame();
  const { t, uiLang } = useLang();
  const statuses = nodeStatuses(bundle, game.state);
  const nodes = pathNodes(bundle);
  const lessonTitles = new Map(
    bundle.stages.flatMap((stage) => stage.topics.flatMap((topic) => topic.lessons)).map((lesson) => [lesson.id, lesson.title]),
  );
  const label = (node: PathNode) => {
    const title = lessonTitles.get(node.id);
    return node.kind === "lesson" && title ? pick(title, uiLang) : t("map.review");
  };
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
                {nodes
                  .filter((node) => node.topicId === topic.id)
                  .map((node) => {
                    const status = statuses.get(node.id) ?? "locked";
                    return (
                      <li key={node.id} className={`map-node node-${status} node-${node.kind}`}>
                        {status === "locked" ? (
                          <span aria-disabled="true">{label(node)}</span>
                        ) : (
                          <a href={routeToHash(nodeRoute(node))}>{label(node)}</a>
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

`src/ui/RoomScreen.tsx` (thay toàn bộ file):

```tsx
import { nextNode } from "../game/path";
import {
  currentStage,
  displayStreak,
  growthPercent,
  growthSize,
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
import { nodeRoute, routeToHash } from "./routing";

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
  const next = nextNode(bundle, state);
  const canReview = state.progress.completedLessons.length > 0;

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
        {condition === "drained" && (
          <a className="button primary" href={routeToHash({ name: "review", stationId: null })}>
            {t("room.recharge", { name: profile.robotName })}
          </a>
        )}
        {next ? (
          <a className={condition === "drained" ? "button" : "button primary"} href={routeToHash(nodeRoute(next))}>
            {t("room.continue")}
          </a>
        ) : (
          <p>{t("room.allDone")}</p>
        )}
        {canReview && condition !== "drained" && (
          <a className="button" href={routeToHash({ name: "review", stationId: null })}>
            {t("room.review")}
          </a>
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

`src/ui/AppRoutes.tsx` (thay toàn bộ file):

```tsx
import { findLesson } from "../content/lookup";
import { findNode, nodeStatuses } from "../game/path";
import { useLang } from "../i18n/LangProvider";
import { BackupScreen } from "./BackupScreen";
import { Banners } from "./Banners";
import { useContent } from "./contexts";
import { ErrorBoundary } from "./ErrorBoundary";
import { useGame } from "./GameProvider";
import { Header } from "./Header";
import { LessonScreen } from "./LessonScreen";
import { MapScreen } from "./MapScreen";
import { ReviewScreen } from "./ReviewScreen";
import { RoomScreen } from "./RoomScreen";
import { routeToHash, useHashRoute } from "./routing";

export function AppRoutes() {
  const [route, navigate] = useHashRoute();
  const bundle = useContent();
  const { t } = useLang();

  const game = useGame();
  const goHome = () => navigate({ name: "home" });
  let screen;
  if (route.name === "map") {
    screen = <MapScreen />;
  } else if (route.name === "backup") {
    screen = <BackupScreen />;
  } else if (route.name === "lesson") {
    const lesson = findLesson(bundle, route.lessonId);
    if (!lesson) {
      screen = <Notice message={t("lesson.notFound")} />;
    } else if (nodeStatuses(bundle, game.state).get(lesson.id) === "locked") {
      screen = <Notice message={t("lesson.locked")} />;
    } else {
      screen = <LessonScreen key={lesson.id} lesson={lesson} onExit={goHome} />;
    }
  } else if (route.name === "review") {
    const node = route.stationId === null ? null : findNode(bundle, route.stationId);
    if (node === undefined || (node !== null && node.kind !== "review")) {
      screen = <Notice message={t("review.notFound")} />;
    } else if (node !== null && nodeStatuses(bundle, game.state).get(node.id) === "locked") {
      screen = <Notice message={t("review.locked")} />;
    } else {
      screen = <ReviewScreen key={route.stationId ?? "free"} stationId={route.stationId} onExit={goHome} />;
    }
  } else {
    screen = <RoomScreen />;
  }

  return (
    <>
      <Header />
      <Banners />
      <ErrorBoundary key={routeToHash(route)}>{screen}</ErrorBoundary>
    </>
  );
}

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

`src/game/progress.ts`: xóa `LessonStatus`, `lessonStatuses`, `nextLessonId` và import `allLessons` (không còn nơi nào dùng).

`src/i18n/vi.ts`:

1. Đổi `"pet.drained"` thành `"{name} hết pin rồi. Con làm 1 trạm ôn để sạc cho {name} nhé!"`.
2. Xóa dòng `"result.next"`.
3. Thêm trước `"result.xp"`:

```ts
  "review.title": "Trạm ôn",
  "review.freeTitle": "Ôn tập",
  "review.itemOf": "Câu {current}/{total}",
  "review.score": "Con đúng {correct}/{total} câu.",
  "review.doneTitle": "Xong trạm ôn!",
  "review.empty": "Chưa có câu nào để ôn. Con học thêm bài nhé!",
  "review.notFound": "Không tìm thấy trạm ôn này.",
  "review.locked": "Trạm ôn này chưa mở. Con học các bài trước đã nhé.",
  "map.review": "Trạm ôn",
  "room.review": "Ôn tập",
  "room.recharge": "Sạc cho {name}",
```

`src/i18n/en.ts`:

1. Đổi `"pet.drained"` thành `"{name} has no battery. Do 1 review to charge {name}!"`.
2. Xóa dòng `"result.next"`.
3. Thêm trước `"result.xp"`:

```ts
  "review.title": "Review station",
  "review.freeTitle": "Review",
  "review.itemOf": "Question {current}/{total}",
  "review.score": "You got {correct} of {total} right.",
  "review.doneTitle": "Review done!",
  "review.empty": "There is nothing to review yet. Learn a lesson first!",
  "review.notFound": "This review station does not exist.",
  "review.locked": "This review station is not open yet. Finish the lessons before it first.",
  "map.review": "Review station",
  "room.review": "Review",
  "room.recharge": "Charge {name}",
```

`src/styles.css`: thêm sau `.node-locked { color: var(--muted); }`:

```css
.node-review { border-style: dashed; }
```

Nội dung thật. `content/stage-1/01-lam-quen/topic.yaml`, thêm vào cuối:

```yaml
reviews:
  - { id: s1.lam-quen.r1, after: s1.lam-quen.l2 }
  - { id: s1.lam-quen.r2, after: s1.lam-quen.l4 }
```

`content/stage-1/01-lam-quen/concepts.yaml`: thêm dòng `practice` vào cuối mỗi khái niệm (chỉ dùng ID đã có; mức 2 để dành cho M5):

```yaml
  - id: run-order
    # ...
    practice: { level1: [s1.lam-quen.b3, s1.lam-quen.b4], level3: [s1.lam-quen.l3.ex1] }
  - id: print-call
    # ...
    practice: { level1: [s1.lam-quen.b5, s1.lam-quen.l3.q1, s1.lam-quen.l1.q1], level3: [s1.lam-quen.l1.ex1, s1.lam-quen.l3.ex1] }
  - id: string-quotes
    # ...
    practice: { level1: [s1.lam-quen.l2.q1, s1.lam-quen.b7, s1.lam-quen.l1.q1], level3: [s1.lam-quen.l1.ex1, s1.lam-quen.l2.ex1, s1.lam-quen.l4.ex1] }
  - id: case-sensitive
    # ...
    practice: { level1: [s1.lam-quen.b6, s1.lam-quen.b7, s1.lam-quen.l1.q1], level3: [s1.lam-quen.l2.ex1] }
  - id: read-error
    # ...
    practice: { level1: [s1.lam-quen.b8, s1.lam-quen.b6, s1.lam-quen.l4.q1], level3: [s1.lam-quen.l4.ex1] }
  - id: ai-basics
    # ...
    practice: { level1: [s1.lam-quen.b1, s1.lam-quen.b2], level3: [] }
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npm run content:validate && npx vitest run && npm run typecheck`
Expected: `content:build` chỉ còn cảnh báo thiếu `level2` (và `level3` của `ai-basics`); `Nội dung hợp lệ.`; Vitest PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui src/game/progress.ts src/game/progress.test.ts src/i18n src/styles.css content/stage-1/01-lam-quen
git commit -m "feat(ui): review stations on the map, free review and charging the robot by reviewing

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 10: Thẻ "Hiểu lầm thường gặp" và 2 bài luyện

**Files:**
- Create: `src/ui/MisconceptionHelp.tsx`, `src/ui/PracticeScreen.tsx`
- Modify: `src/ui/ItemView.tsx`, `src/ui/AppRoutes.tsx`, `src/i18n/vi.ts`, `src/i18n/en.ts`, `src/styles.css`
- Test: `src/ui/ItemView.test.tsx`, `src/ui/PracticeScreen.test.tsx`

**Interfaces:**
- Consumes: `findConcept`, `Concept.misconceptionHtml` (Task 5), `buildPracticeSet` (Task 7), `ItemView` (Task 8), `SessionScreen`, route `practice` (Task 9).
- Produces:
  - `MisconceptionHelp({ conceptId, offerPractice })`: nút mở thẻ hiểu lầm; trong thẻ có link "Luyện thêm 2 bài" tới `#/practice/<conceptId>` khi `offerPractice`.
  - `ItemView` hiện `MisconceptionHelp` sau câu trả lời sai có hiểu lầm, hoặc lần nộp bài bị chấm ra hiểu lầm. Trong bài luyện (`source: "practice"`) không mời luyện thêm.
  - `PracticeScreen({ conceptId, onExit, rng? })`.
  - Khóa i18n `misconception.show`, `misconception.title`, `misconception.practice`, `practice.title`, `practice.doneTitle`, `practice.empty`, `practice.notFound`.

- [ ] **Step 1: Viết test thất bại**

Thêm vào cuối `describe("ItemView", ...)` trong `src/ui/ItemView.test.tsx`:

```tsx
  test("a wrong answer with a misconception offers its card and 2 practice items", async () => {
    await renderWithGame(<ItemView item={question} source="lesson" onDone={() => {}} />, { bundle });
    await userEvent.click(screen.getByRole("radio", { name: "Sai" }));
    await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
    await userEvent.click(screen.getByRole("button", { name: "Xem thẻ Hiểu lầm thường gặp" }));
    const card = screen.getByRole("region", { name: "Hiểu lầm thường gặp" });
    expect(card).toHaveTextContent("Hiểu lầm thường gặp: Khái niệm c1");
    expect(card).toHaveTextContent("Hiểu lầm về c1.");
    expect(screen.getByRole("link", { name: "Luyện thêm 2 bài" })).toHaveAttribute("href", "#/practice/c1");
  });

  test("a right answer or a practice set does not offer more practice", async () => {
    await renderWithGame(<ItemView item={question} source="practice" onDone={() => {}} />, { bundle });
    await userEvent.click(screen.getByRole("radio", { name: "Sai" }));
    await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
    await userEvent.click(screen.getByRole("button", { name: "Xem thẻ Hiểu lầm thường gặp" }));
    expect(screen.queryByRole("link", { name: "Luyện thêm 2 bài" })).not.toBeInTheDocument();
  });

  test("a code misconception found by the judge offers its card", async () => {
    const code = { ...reviewCode, commonWrong: [{ test: 0, output: "hi", misconception: "c2", sample: 'print("hi")' }] };
    await renderWithGame(<ItemView item={code} source="lesson" onDone={() => {}} />, {
      bundle,
      runner: fakeRunner(() => okResult("hi\n")),
    });
    await userEvent.click(screen.getByRole("button", { name: "Nộp bài" }));
    await userEvent.click(await screen.findByRole("button", { name: "Xem thẻ Hiểu lầm thường gặp" }));
    expect(screen.getByRole("region", { name: "Hiểu lầm thường gặp" })).toHaveTextContent("Khái niệm c2");
  });
```

`src/ui/PracticeScreen.test.tsx`:

```tsx
// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { initialGameState } from "../game/state";
import { fakeRunner, okResult } from "../test/render";
import { renderWithGame, TODAY } from "../test/renderGame";
import { reviewBundle } from "../test/reviewBundle";
import { PracticeScreen } from "./PracticeScreen";

const bundle = reviewBundle();

describe("PracticeScreen", () => {
  test("2 items at the child's level, then a short result", async () => {
    const state = initialGameState(TODAY);
    state.progress.completedLessons = ["r.l1"];
    const { store } = await renderWithGame(<PracticeScreen conceptId="c1" onExit={() => {}} />, {
      bundle,
      state,
      runner: fakeRunner(() => okResult("Hi\nBye\n")),
    });
    expect(screen.getByRole("heading", { name: "Luyện tập: Khái niệm c1" })).toBeInTheDocument();
    expect(screen.getByText("Câu 1/2")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("radio", { name: "Đúng" }));
    await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
    await userEvent.click(screen.getByRole("button", { name: "Tiếp" }));
    expect(screen.getByText("Sắp xếp để in ra Hi rồi Bye")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Nộp bài" }));
    await userEvent.click(await screen.findByRole("button", { name: "Hoàn thành" }));
    expect(screen.getByRole("heading", { name: "Xong bài luyện!" })).toBeInTheDocument();
    expect(screen.getByText("Con đúng 2/2 câu.")).toBeInTheDocument();
    await waitFor(async () => expect((await store.loadActive())?.state.mastery.c1?.recent).toEqual([1, 1]));
  });

  test("an unknown concept or a concept without items shows a message", async () => {
    await renderWithGame(<PracticeScreen conceptId="nope" onExit={() => {}} />, { bundle });
    expect(screen.getByText("Không tìm thấy phần luyện tập này.")).toBeInTheDocument();
  });

  test("a concept with nothing learned yet has no items", async () => {
    await renderWithGame(<PracticeScreen conceptId="c1" onExit={() => {}} />, { bundle });
    expect(screen.getByText("Chưa có bài luyện cho phần này. Con học thêm bài nhé!")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/ui/ItemView.test.tsx src/ui/PracticeScreen.test.tsx`
Expected: FAIL: không có nút "Xem thẻ Hiểu lầm thường gặp", chưa có `./PracticeScreen`.

- [ ] **Step 3: Viết code**

`src/ui/MisconceptionHelp.tsx`:

```tsx
import { useState } from "react";
import { findConcept } from "../content/lookup";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { routeToHash } from "./routing";

/** Spec 5.9 step 2: after a misconception, the robot offers its "common misconception" card and 2 practice items. */
export function MisconceptionHelp({ conceptId, offerPractice }: { conceptId: string; offerPractice: boolean }) {
  const { t, uiLang } = useLang();
  const concept = findConcept(useContent(), conceptId);
  const [open, setOpen] = useState(false);
  if (!concept?.misconceptionHtml) return null;
  return (
    <div className="misconception">
      <button aria-expanded={open} onClick={() => setOpen(!open)}>
        {t("misconception.show")}
      </button>
      {open && (
        <section className="misconception-card" aria-label={t("misconception.title")}>
          <h4>
            {t("misconception.title")}: {pick(concept.name, uiLang)}
          </h4>
          <div className="card-text" dangerouslySetInnerHTML={{ __html: concept.misconceptionHtml }} />
          {offerPractice && (
            <a className="button" href={routeToHash({ name: "practice", conceptId })}>
              {t("misconception.practice")}
            </a>
          )}
        </section>
      )}
    </div>
  );
}
```

`src/ui/PracticeScreen.tsx`:

```tsx
import { useState } from "react";
import { findConcept } from "../content/lookup";
import type { Rng } from "../game/random";
import { buildPracticeSet } from "../game/reviewSet";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";
import { SessionScreen } from "./SessionScreen";

/** 2 practice items for 1 concept at the child's ladder level. Each item pays and records as usual; the set adds nothing. */
export function PracticeScreen({ conceptId, onExit, rng = Math.random }: { conceptId: string; onExit(): void; rng?: Rng }) {
  const { t, uiLang } = useLang();
  const bundle = useContent();
  const game = useGame();
  const concept = findConcept(bundle, conceptId);
  const [items] = useState(() => buildPracticeSet(bundle, game.state, conceptId, rng));

  if (!concept || items.length === 0) {
    return (
      <main className="room">
        <p>{t(concept ? "practice.empty" : "practice.notFound")}</p>
        <a href="#/">{t("nav.room")}</a>
      </main>
    );
  }
  return (
    <SessionScreen
      title={t("practice.title", { concept: pick(concept.name, uiLang) })}
      items={items}
      source="practice"
      doneTitle={t("practice.doneTitle")}
      onFinish={() => {}}
      onExit={onExit}
    />
  );
}
```

`src/ui/ItemView.tsx` (thay toàn bộ file):

```tsx
import { useRef, useState } from "react";
import { isChoiceQuestion, type Exercise } from "../content/types";
import type { ResultSource } from "../game/mastery";
import { CodeExerciseView, type ExerciseOutcome, type JudgedInfo } from "./CodeExerciseView";
import { useGame } from "./GameProvider";
import { MisconceptionHelp } from "./MisconceptionHelp";
import { PuzzleExerciseView } from "./PuzzleExerciseView";
import { QuestionCard } from "./QuestionCard";

export interface ItemDone {
  /** True when the first answer or the first submit was right, without a hint or the solution. */
  correct: boolean;
}

/**
 * Shows 1 exercise or question of any type and sends its events with the concepts and the source. Outside a lesson,
 * the view starts clean: no saved draft, no saved hint counts.
 */
export function ItemView({
  item,
  source,
  onDone,
}: {
  item: Exercise;
  source: ResultSource;
  onDone(result: ItemDone): void;
}) {
  const game = useGame();
  const firstTry = useRef<boolean | null>(null);
  const [misconception, setMisconception] = useState<string | null>(null);
  const inLesson = source === "lesson";
  const help = misconception && <MisconceptionHelp conceptId={misconception} offerPractice={source !== "practice"} />;

  if (isChoiceQuestion(item)) {
    return (
      <>
        <QuestionCard
          question={item}
          onAnswered={(correct, detail) => {
            const chosen = item.choices[detail.choiceIndex]?.misconception ?? null;
            game.dispatch(
              {
                type: "QuestionAnswered",
                questionId: item.id,
                correct,
                concepts: item.concepts,
                misconception: chosen,
                source,
              },
              { kind: "choice", itemId: item.id, choiceIndex: detail.choiceIndex, correct, lang: detail.lang },
            );
            if (!correct && chosen) setMisconception(chosen);
            onDone({ correct });
          }}
        />
        {help}
      </>
    );
  }

  const onJudged = (info: JudgedInfo) => {
    const accepted = info.result.status === "accepted";
    firstTry.current ??= accepted && info.hintsUsed === 0 && !info.viewedSolution;
    setMisconception(accepted ? null : (info.result.misconceptions[0] ?? null));
    game.dispatch(
      {
        type: "ExerciseJudged",
        exerciseId: item.id,
        accepted,
        failedSubmitsBefore: info.failedSubmitsBefore,
        hintsUsed: info.hintsUsed,
        viewedSolution: info.viewedSolution,
        concepts: item.concepts,
        misconceptions: info.result.misconceptions,
        source,
      },
      {
        kind: "code",
        itemId: item.id,
        code: info.code,
        status: info.result.status,
        passedCount: info.result.passedCount,
        total: info.result.total,
        misconceptions: info.result.misconceptions,
      },
    );
  };
  const onComplete = (outcome: ExerciseOutcome) =>
    onDone({ correct: outcome === "solved" && firstTry.current === true });
  const onHint = inLesson ? () => game.dispatch({ type: "HintShown", exerciseId: item.id }) : undefined;
  const onSolutionViewed = () => game.dispatch({ type: "SolutionViewed", exerciseId: item.id });

  if (item.type === "code") {
    return (
      <>
        <CodeExerciseView
          exercise={item}
          initialCode={inLesson ? game.draftFor(item.id) : undefined}
          onCodeChange={inLesson ? (code) => game.saveDraft(item.id, code) : undefined}
          initialStats={inLesson ? game.state.progress.exerciseStats?.[item.id] : undefined}
          onHint={onHint}
          onSolutionViewed={onSolutionViewed}
          onJudged={onJudged}
          onComplete={onComplete}
        />
        {help}
      </>
    );
  }
  return (
    <>
      <PuzzleExerciseView
        exercise={item}
        onHint={onHint}
        onSolutionViewed={onSolutionViewed}
        onJudged={onJudged}
        onComplete={onComplete}
      />
      {help}
    </>
  );
}
```

`src/ui/AppRoutes.tsx`:

1. Thêm import `import { PracticeScreen } from "./PracticeScreen";`
2. Thêm nhánh sau nhánh `route.name === "review"`:

```tsx
  } else if (route.name === "practice") {
    screen = <PracticeScreen key={route.conceptId} conceptId={route.conceptId} onExit={goHome} />;
```

`src/i18n/vi.ts`: thêm trước `"result.xp"`:

```ts
  "misconception.show": "Xem thẻ Hiểu lầm thường gặp",
  "misconception.title": "Hiểu lầm thường gặp",
  "misconception.practice": "Luyện thêm 2 bài",
  "practice.title": "Luyện tập: {concept}",
  "practice.doneTitle": "Xong bài luyện!",
  "practice.empty": "Chưa có bài luyện cho phần này. Con học thêm bài nhé!",
  "practice.notFound": "Không tìm thấy phần luyện tập này.",
```

`src/i18n/en.ts`: thêm ở cùng vị trí:

```ts
  "misconception.show": "See the common mistake card",
  "misconception.title": "Common mistake",
  "misconception.practice": "Practice 2 more",
  "practice.title": "Practice: {concept}",
  "practice.doneTitle": "Practice done!",
  "practice.empty": "There is no practice for this yet. Learn a lesson first!",
  "practice.notFound": "This practice does not exist.",
```

`src/styles.css`: thêm sau khối `.fill-template input`:

```css
.misconception-card { margin-top: 12px; padding: 12px 16px; border: 1px solid #f0d9a8; border-radius: var(--radius); background: #fff8ea; }
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run src/ui && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/MisconceptionHelp.tsx src/ui/PracticeScreen.tsx src/ui/PracticeScreen.test.tsx src/ui/ItemView.tsx src/ui/ItemView.test.tsx src/ui/AppRoutes.tsx src/i18n/vi.ts src/i18n/en.ts src/styles.css
git commit -m "feat(ui): common-misconception card and a 2-item practice set after a misconception

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Sang ngày mới lúc nửa đêm và khôi phục các test bị bỏ ở M2

**Files:**
- Modify: `src/game/dates.ts`, `src/ui/GameProvider.tsx`
- Test: `src/game/dates.test.ts`, `src/ui/GameProvider.test.tsx`, `src/ui/LessonScreen.test.tsx`, `src/ui/AppRoutes.test.tsx`

**Interfaces:**
- Consumes: `DayRollover` (M2).
- Produces: `msUntilNextDay(now: Date): number`; `GameProvider` gửi `DayRollover` ngay sau nửa đêm (giờ địa phương) khi app vẫn mở.

- [ ] **Step 1: Viết test thất bại**

`src/game/dates.test.ts`: thêm `msUntilNextDay` vào import từ `./dates` và thêm trước test `weekStart returns the Monday`:

```ts
  test("msUntilNextDay reaches 1 second after the next local midnight", () => {
    expect(msUntilNextDay(new Date(2026, 9, 6, 23, 59, 0))).toBe(61_000);
    expect(msUntilNextDay(new Date(2026, 9, 6, 0, 0, 1))).toBe(86_400_000);
    expect(msUntilNextDay(new Date(2026, 11, 31, 23, 59, 59))).toBe(2_000);
  });
```

`src/ui/GameProvider.test.tsx`:

1. Trong `Probe`, thêm sau dòng `<p>pin:{game.state.pet.pin}</p>`:

```tsx
      <p>today:{game.today}</p>
```

2. Thêm trước test `runs a day rollover when the page becomes visible again`:

```tsx
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
```

`src/ui/LessonScreen.test.tsx` (việc chuyển từ M2 số 5): trong test `goes through the lesson, records the attempts and shows the rewards`, thay đoạn từ `expect(screen.getByText("Thẻ 1/2"))` tới lần bấm "Hoàn thành" bằng:

```tsx
  expect(screen.getByText("Thẻ 1/2")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Quay lại" })).toBeDisabled();
  await userEvent.click(screen.getByRole("button", { name: "Tiếp" }));
  expect(screen.getByText("Thẻ 2/2")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Quay lại" })).toBeEnabled();
  await userEvent.click(screen.getByRole("button", { name: "Tiếp" }));
  expect(screen.getByText("Bài tập 1/2")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Tiếp" })).toBeDisabled();
  await userEvent.click(screen.getByRole("button", { name: "Nộp bài" }));
  expect(await screen.findByText("Đúng hết 2/2 test!")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Tiếp" }));
  expect(screen.getByText("Bài tập 2/2")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Hoàn thành" })).toBeDisabled();
  await userEvent.click(screen.getByRole("radio", { name: "A" }));
  await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
  await userEvent.click(screen.getByRole("button", { name: "Hoàn thành" }));
```

`src/ui/AppRoutes.test.tsx`: thay test `shows a message for an unknown or malformed lesson` bằng:

```tsx
  test.each(["#/lesson/khong-co", "#/lesson/%E0%A4%A"])("shows a message for the unknown lesson %s", async (hash) => {
    window.location.hash = hash;
    await renderWithGame(<AppRoutes />);
    expect(screen.getByText("Không tìm thấy bài học này.")).toBeInTheDocument();
  });
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/game/dates.test.ts src/ui/GameProvider.test.tsx src/ui/LessonScreen.test.tsx src/ui/AppRoutes.test.tsx`
Expected: FAIL ở `msUntilNextDay` (chưa có) và ở test nửa đêm (`pin:3` không xuất hiện). Các test khôi phục của `LessonScreen` và `AppRoutes` qua ngay: chúng ghi lại hành vi đã có.

- [ ] **Step 3: Viết code**

`src/game/dates.ts`: thêm vào cuối file:

```ts
/** Milliseconds from `now` to 1 second after the next local midnight. */
export function msUntilNextDay(now: Date): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
  return next.getTime() - now.getTime();
}
```

`src/ui/GameProvider.tsx`:

1. Đổi import: `import { daysBetween, localDay, msUntilNextDay } from "../game/dates";`
2. Thêm ngay trước comment `// First run: show the saved language.`:

```tsx
  // An app left open past midnight starts the new day on time: rewards, decay and the room's goals.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        dispatch({ type: "DayRollover" });
        schedule();
      }, msUntilNextDay(clock()));
    };
    schedule();
    return () => clearTimeout(timer);
  }, [clock, dispatch]);
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/dates.ts src/game/dates.test.ts src/ui/GameProvider.tsx src/ui/GameProvider.test.tsx src/ui/LessonScreen.test.tsx src/ui/AppRoutes.test.tsx
git commit -m "feat(ui): start the new day at midnight while the app stays open; restore M2 test assertions

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Test đầu cuối cho trạm ôn và kiểm tra toàn bộ

**Files:**
- Create: `e2e/review.spec.ts`

**Interfaces:**
- Consumes: toàn bộ M3a và nội dung thật (`s1.lam-quen.r1` sau bài 2).
- Produces: 2 test Playwright với Pyodide thật.

- [ ] **Step 1: Viết test**

`e2e/review.spec.ts`:

```ts
import { expect, test, type Page } from "@playwright/test";

async function startApp(page: Page) {
  await page.goto("./");
  await page.getByLabel("Tên của con").fill("An");
  await page.getByLabel("Mã PIN của bố mẹ (4 đến 6 chữ số)").fill("1234");
  await page.getByLabel("Nhập lại mã PIN").fill("1234");
  await page.getByRole("button", { name: "Bắt đầu" }).click();
  await expect(page.getByText("Robo sẵn sàng")).toBeVisible({ timeout: 60_000 });
}

async function submitCode(page: Page, code: string) {
  const editor = page.getByRole("textbox", { name: "Trình soạn code" });
  await editor.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type(code);
  await page.getByRole("button", { name: "Nộp bài" }).click();
  await expect(page.getByText("Đúng hết 1/1 test!")).toBeVisible();
  await page.getByRole("button", { name: "Tiếp" }).click();
}

/** Picks the first choice of the question on screen, checks it, then goes on. */
async function answerFirstChoice(page: Page, last: boolean) {
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Kiểm tra" }).click();
  await page.getByRole("button", { name: last ? "Hoàn thành" : "Tiếp" }).click();
}

test("after 2 lessons the review station opens, pays and unlocks lesson 3", async ({ page }) => {
  await startApp(page);
  await page.getByRole("link", { name: "Học tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  await submitCode(page, 'print("Xin chào Robo")');
  await answerFirstChoice(page, true);
  await page.getByRole("link", { name: "Học tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  await submitCode(page, 'print("Robo đang học Python")');
  await answerFirstChoice(page, true);

  await page.getByRole("link", { name: "Học tiếp" }).click();
  await expect(page.getByRole("heading", { name: "Trạm ôn" })).toBeVisible();
  for (let n = 1; n <= 5; n += 1) {
    await expect(page.getByText(`Câu ${n}/5`)).toBeVisible();
    await answerFirstChoice(page, n === 5);
  }
  await expect(page.getByRole("heading", { name: "Xong trạm ôn!" })).toBeVisible();
  await expect(page.getByText(/^Con đúng [0-5]\/5 câu\.$/)).toBeVisible();
  await expect(page.getByText(/^\+(10|15) xu$/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Học tiếp" })).toHaveAttribute("href", "#/lesson/s1.lam-quen.l3");

  await page.getByRole("button", { name: "Về phòng" }).click();
  await page.getByRole("link", { name: "Bản đồ học" }).click();
  await expect(page.getByRole("listitem").filter({ hasText: "Trạm ôn" }).first()).toContainText("Đã xong");
  await expect(page.getByRole("listitem").filter({ hasText: "Lệnh chạy từ trên xuống" })).toContainText("Bài tiếp theo");
});

test("the room offers a free review after the first lesson", async ({ page }) => {
  await startApp(page);
  await page.getByRole("link", { name: "Học tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  await submitCode(page, 'print("Xin chào Robo")');
  await answerFirstChoice(page, true);
  await page.getByRole("button", { name: "Về phòng" }).click();
  await page.getByRole("link", { name: "Ôn tập" }).click();
  await expect(page.getByRole("heading", { name: "Ôn tập" })).toBeVisible();
  await expect(page.getByText(/^Câu 1\/\d$/)).toBeVisible();
});
```

Câu hỏi của trạm ôn được chọn ngẫu nhiên, nên test chọn lựa chọn đầu tiên của mỗi câu và chỉ kiểm tra những gì không phụ thuộc vào đáp án (số câu, tiêu đề kết quả, 10 hoặc 15 xu, bài kế tiếp được mở).

- [ ] **Step 2: Chạy test**

Run: `npm run test:e2e -- e2e/review.spec.ts` (phiên cloud: thêm `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium` trước lệnh)
Expected: 2 passed. Nếu test thất bại ở Task 12 mà không do test viết sai, lỗi nằm ở code của Task 9: sửa ở đó, không nới test.

- [ ] **Step 3: Chạy kiểm tra toàn bộ**

Run: `npm run check`
Expected: typecheck sạch; Vitest khoảng 420 test PASS; pytest 21 passed; `Nội dung hợp lệ.`; e2e 10 passed.

- [ ] **Step 4: Commit**

```bash
git add e2e/review.spec.ts
git commit -m "test(e2e): review station after 2 lessons and the free review in the room

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
