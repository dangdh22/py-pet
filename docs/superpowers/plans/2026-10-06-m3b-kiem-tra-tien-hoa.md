# M3b – Kiểm tra chủ đề và tiến hóa: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cuối mỗi chủ đề con làm 1 bài kiểm tra chủ đề; cuối giai đoạn con làm bài kiểm tra tiến hóa. Đạt từ 80% thì robot tiến hóa (lên giai đoạn mới, +100 xu, màn hình chúc mừng). Chưa đạt thì app liệt kê khái niệm sai, mở bộ ôn tập trọng tâm, và nút "Học tiếp" đưa con vào bộ ôn tập đó trước khi được thi lại. Dữ liệu M3a vẫn mở được.

**Architecture:** Luật chơi vẫn là hàm thuần. `src/game/exam.ts` rút đề (nhận `rng`), chấm điểm và tạo bộ ôn tập trọng tâm. `apply()` có 3 sự kiện mới (`TopicTestCompleted`, `EvolutionTestCompleted`, `RemedialCompleted`); câu trả lời trong bài kiểm tra đi qua `QuestionAnswered` / `ExerciseJudged` với nguồn `"test"` (cập nhật thành thạo, Leitner, chuỗi đúng cho Vui, không trả XP từng câu). `path.ts` thêm nút kiểm tra chủ đề và kiểm tra tiến hóa vào bản đồ và hàm `nextStep()` (bộ ôn tập trọng tâm đứng trước). `GameState` lên version 3. Giao diện có `ExamRunner` (1 câu mỗi thẻ, không hiện đúng/sai tới cuối bài) dùng chung cho `TopicTestScreen` và `EvolutionTestScreen`; `RemedialScreen` dùng lại `SessionScreen` của M3a.

**Tech Stack:** Như M3a (React 19, TypeScript 5.9, Vite 8, Vitest 5, Playwright 1.63, Dexie 4, Pyodide 314, zod 4). Không thêm thư viện.

**Spec:** `docs/superpowers/specs/2026-10-06-py-pet-design.md`

## Global Constraints

- Phạm vi M3b: kiểm tra chủ đề, kiểm tra tiến hóa (đạt 80%), bộ ôn tập trọng tâm, tiến hóa robot, ưu tiên bộ ôn tập trong nút "Học tiếp" (spec 5.3, 5.4, 5.5, 5.11, 8.2 mục 5, 3.9 luật 9).
- Ngoài phạm vi M3b (đừng làm): hình robot theo dạng tiến hóa và hoạt cảnh toàn màn hình (M6); khu phụ huynh, chỉnh ngưỡng đạt và các giá trị (*) (M4); soạn câu hỏi hay bài tập mới (M5).
- Quyết định của người bảo trì ngày 2026-10-06: kiểm tra chủ đề gồm 8 câu và 2 bài code; đề tiến hóa rút theo số câu đang có (ngân hàng ngắn thì đề ngắn hơn, luật 9 chỉ cảnh báo tới M5); khi tiến hóa chỉ cần màn hình chúc mừng đơn giản. Các quyết định của M3a vẫn giữ (Vui chỉ tăng khi trả lời đúng; ôn tập tự do không giới hạn).
- Luật chơi là hàm thuần nhận `now` và `rng` từ ngoài. `GameState` chỉ chứa dữ liệu JSON.
- Con số của spec: câu `predict`/`mcq` 1 điểm; bài `code` 3 điểm chia theo tỷ lệ test qua; đạt khi điểm ≥ 80% (19,2/24 vẫn đạt); kiểm tra chủ đề +30 XP, đạt từ 80% thì +20 xu; tiến hóa +100 xu; bộ ôn tập trọng tâm 2 bài cho mỗi khái niệm sai.
- ID đã phát hành không đổi. ID nút mới trên bản đồ: `<topic>.test` (kiểm tra chủ đề), `<stage>.evolution` (kiểm tra tiến hóa); script tham chiếu báo lỗi nếu ID này trùng ID có sẵn.
- Đổi cấu trúc dữ liệu theo `CLAUDE.md`: `SCHEMA_VERSION` 2 → 3, migration trong `src/storage/backup.ts`, chạy `npx tsx tools/make_backup_fixture.ts` 1 lần để tạo `src/storage/fixtures/backup-v3.pypet`. Không sinh lại `backup-v1.pypet` và `backup-v2.pypet`.
- Mọi chuỗi giao diện đi qua `t(key)`; `vi.ts` và `en.ts` cùng khóa, cùng placeholder.
- Không gọi mạng.
- Mọi commit message kết thúc bằng dòng trailer theo hướng dẫn attribution của phiên đang chạy. Các lệnh commit trong kế hoạch ghi dòng `Co-Authored-By`; thêm các dòng trailer khác mà phiên yêu cầu.
- Mốc xanh trước khi bắt đầu: `npm run check` (typecheck, Vitest 437, pytest 21, kiểm tra nội dung, e2e 10). Sau M3b: Vitest 486, pytest 21, e2e 11. Trong phiên cloud, đặt `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium` trước khi chạy e2e (xem `CLAUDE.md`).

## Review Focus

1. Dữ liệu M3a (state version 2 trong IndexedDB, file `.pypet` schema 2) mở được sau khi cập nhật, giữ XP, xu, trạm ôn đã xong. Test: Task 1 (`upgrades a version 2 state and keeps its review stations`, `decodes the committed schema 2 sample file and upgrades it`, `a profile saved by an older app is upgraded when it opens`).
2. Con không kiếm thêm XP/xu bằng cách làm lại bài kiểm tra: XP kiểm tra chủ đề chỉ ở lần đầu, xu chỉ ở lần đạt đầu tiên; tiến hóa chỉ 1 lần cho mỗi giai đoạn. Test: Task 4 (`a topic test pays 30 XP once, and 20 xu with Vui +1 at the first pass`, `a passed evolution test evolves the robot once, pays 100 xu and Vui +1, and keeps the XP`).
3. Thi tiến hóa chưa đạt: màn hình kết quả (khái niệm cần ôn, nút "Bắt đầu ôn tập trọng tâm") phải ở lại, không bị thay bằng thông báo chặn; thi lại chỉ mở khi xong bộ ôn tập. Test: Task 8 (`topic test, failed evolution, focused review, retake, evolution`, `an open focused review set comes before the retake`).
4. Bài kiểm tra không lộ đáp án trước khi nộp: không đánh dấu đúng/sai, không giải thích, không gợi ý, không lời giải, bài code chỉ nộp 1 lần. Test: Task 6 (`records the answer without marks or explanation`, `1 item per card; the answers are recorded as test answers and handed in at the end`).
5. Ngưỡng đạt với số thực: 19,2/24 và 11,2/14 vẫn đạt. Test: Task 4 (`isPass uses 80% with a float tolerance`).
6. Bộ ôn tập trọng tâm và đề thi không lộ bài của bài học chưa học. Test: Task 3 (`gives up to 2 items per wrong concept at the child's level`). Đề thi chỉ lấy từ các chủ đề của giai đoạn, và nút thi chỉ mở khi đã học xong các bài trước (Task 5, Task 8).

## Quyết định thiết kế

Spec để ngỏ các điểm sau; kế hoạch chốt như dưới đây. Reviewer đánh giá theo các quyết định này.

1. **Cấu hình đề trong nội dung.** `topic.yaml` có `test: { questions, code }` (mặc định 8 và 2), `stage.yaml` có `evolution: { questions, ai, code }` (mặc định 15, 3, 3). Cấu hình 0 + 0 nghĩa là không có bài kiểm tra (bộ nội dung mẫu cũ dùng cách này để giữ nguyên test M3a). Khái niệm có `ai: true` trong `concepts.yaml` là kiến thức AI; câu AI là câu có ít nhất 1 khái niệm AI.
2. **Nguồn câu hỏi.** Câu `predict`/`mcq` của chủ đề = câu trong bài học + ngân hàng `questions.yaml`. Bài code = bài `code` có `test_eligible: true` trong bài học và `practice.yaml`. Đề tiến hóa: phần AI, phần còn lại, thiếu câu thường thì bù câu AI; trộn ngẫu nhiên; bài code ở cuối. Ngân hàng ngắn thì đề ngắn hơn (quyết định của người bảo trì); `coverage.ts` cảnh báo theo luật 9.
3. **Tránh câu lần trước.** Kiểm tra chủ đề tránh `lastItems` của lần trước; kiểm tra tiến hóa tránh câu của lần thi gần nhất cùng giai đoạn. Thiếu câu mới thì dùng lại câu cũ.
4. **Kiểm tra chủ đề không chặn đường** (spec 5.3): làm xong với bất kỳ điểm nào là nút "Đã xong". +30 XP ở lần làm đầu tiên; +20 xu và Vui +1 ở lần đạt đầu tiên. Bản ghi giữ số lần làm, điểm cao nhất, đã từng đạt chưa. Câu sai được đề xuất "Luyện thêm" như bài học (M3a).
5. **Kiểm tra tiến hóa** mở khi xong mọi nút trước nó trên bản đồ (bài học, trạm ôn, kiểm tra chủ đề). Đạt: `pet.stage` + 1, +100 xu, Vui +1, `pet.stageStartXp = pet.xp` để thanh "Lớn lên" của giai đoạn mới bắt đầu từ 0 mà không mất XP. Đạt lần nữa cho cùng giai đoạn không trả thêm gì.
6. **Chưa đạt** không bị trừ gì. `buildRemedialSet` lấy 2 bài cho mỗi khái niệm sai (`REMEDIAL_PER_CONCEPT = 2`), theo mức bậc thang hiện tại của con, chỉ từ bài đã học. Bộ này lưu trong `state.remedial`; "Học tiếp" mở nó trước mọi nút khác; làm xong (`RemedialCompleted`) thì được thi lại. Không có bài nào để ôn thì thi lại được ngay.
7. **Câu trả lời trong bài kiểm tra** được ghi ngay khi con chọn hoặc nộp (thành thạo, Leitner, lịch sử làm bài, chuỗi đúng cho Vui) với nguồn `"test"`; không có XP/xu từng câu, không tính vào `answeredQuestions`/`solvedExercises`. Màn hình chỉ báo "Đã ghi nhận"; điểm hiện ở cuối. Bài code: con được "Chạy thử" với input của mình, "Nộp bài" đúng 1 lần, không có gợi ý và lời giải, bắt đầu từ code mẫu (không dùng bản nháp trong bài học).
8. **Rời bài kiểm tra giữa chừng** (link "Py-Pet" ở đầu trang): bài kiểm tra không được tính; lần mở sau rút đề mới. Các câu đã trả lời vẫn được ghi vào thành thạo (như bài học bỏ dở).
9. **Màn hình tiến hóa** là màn hình chúc mừng đơn giản (quyết định của người bảo trì): robot lớn với hiệu ứng CSS `.evolve` (tắt khi `prefers-reduced-motion`), điểm, xu, Vui. Hình robot theo dạng tiến hóa để dành cho M6.
10. **Chặn thi lại khi còn bộ ôn tập** được kiểm tra 1 lần lúc mở màn hình kiểm tra tiến hóa (trong `EvolutionTestScreen`), không ở `AppRoutes`, để màn hình kết quả "chưa đạt" không bị thay ngay khi state mở bộ ôn tập.
11. **Điểm hiển thị** làm tròn 1 chữ số thập phân; tiếng Việt dùng dấu phẩy (19,2).
12. **E2E** chạy trên nội dung thật: học 4 bài và 2 trạm ôn, làm kiểm tra chủ đề, thấy kiểm tra tiến hóa mở. Điểm phụ thuộc câu trả lời nên e2e không kiểm tra đạt/chưa đạt; luồng "chưa đạt → ôn trọng tâm → thi lại → đạt" (spec 9 mục 5) được kiểm tra bằng test tích hợp jsdom với bộ nội dung mẫu `examBundle` (Task 8). Đưa luồng này vào e2e khi M5 có đủ nội dung.
13. Thanh "Lớn lên" của giai đoạn 1 tăng thêm 30 XP tối đa cho mỗi kiểm tra chủ đề, nên robot của con có thể nhỏ lại 1 cỡ sau khi cập nhật (giống việc chuyển từ M3a số 1); robot lớn lại khi con làm bài kiểm tra chủ đề.

---

## File Structure

```
src/game/
  state.ts        (sửa) GameState v3: pet.stageStartXp, remedial, progress.topicTests, progress.evolutionTests
  schema.ts, migrate.ts  (sửa) schema và bước nâng cấp 2 → 3
  exam.ts         ExamItem, ExamAnswer, drawTopicTest, drawEvolutionTest, gradePaper, buildRemedialSet
  rewards.ts      (sửa) XP.topicTest, XU.topicTestPassed, XU.evolution, PASS_RATIO, isPass
  mastery.ts      (sửa) ResultSource thêm "test"
  apply.ts        (sửa) TopicTestCompleted, EvolutionTestCompleted, RemedialCompleted, nguồn "test"
  path.ts         (sửa) nút topicTest và evolution, hasTest, NextStep, nextStep
  progress.ts     (sửa) stageXp, stageXpMax tính kiểm tra chủ đề
  reviewSet.ts    (sửa) export itemsForConcept
src/content/
  types.ts        (sửa) Concept.ai, TopicTestConfig, EvolutionTestConfig, Topic.test, Stage.evolution
  lookup.ts       (sửa) findTopic, findStage, topicTestId, evolutionTestId, topicQuestions, topicTestCode
src/storage/      (sửa) types.ts (SCHEMA_VERSION 3), backup.ts; fixtures/backup-v3.pypet
src/ui/
  LangSwitch.tsx        nút VI/EN dùng chung (tách từ QuestionCard)
  QuestionCard.tsx      (sửa) chế độ kiểm tra `exam`
  ExamCodeView.tsx      bài code trong bài kiểm tra
  ExamRunner.tsx        chuỗi câu của 1 bài kiểm tra, formatScore
  TopicTestScreen.tsx, EvolutionTestScreen.tsx, RemedialScreen.tsx
  (sửa) routing, AppRoutes, MapScreen, RoomScreen, ResultView, styles.css
src/test/examBundle.ts  Bộ nội dung mẫu: 1 giai đoạn, 1 chủ đề, 2 bài, 6 câu (2 câu AI), 2 bài code
src/test/answerExam.ts  Trả lời hết 1 đề trong test jsdom
tools/content/   (sửa) schema.ts, buildBundle.ts, references.ts, coverage.ts
content/stage-1/01-lam-quen/concepts.yaml  (sửa) ai-basics có ai: true
e2e/exam.spec.ts
```

---
### Task 1: GameState version 3 và file sao lưu schema 3

**Files:**
- Modify: `src/game/state.ts`, `src/game/schema.ts`, `src/game/migrate.ts`, `src/storage/types.ts`, `src/storage/backup.ts`
- Create: `src/storage/fixtures/backup-v3.pypet` (sinh bằng `tools/make_backup_fixture.ts`)
- Test: `src/game/migrate.test.ts`, `src/game/dates.test.ts`, `src/storage/backup.test.ts`, `src/ui/AppRoutes.test.tsx`

**Interfaces:**
- Consumes: `upgradeGameState`, `STEPS` (M3a).
- Produces:
  - `GAME_STATE_VERSION = 3`; `interface TopicTestRecord { attempts; best; max; passed; lastItems: string[] }`; `interface EvolutionAttempt { at; stage; score; max; passed; items: string[]; wrongConcepts: string[] }`; `interface RemedialSet { stage: number; items: string[] }`.
  - `GameState.pet.stageStartXp: number`, `GameState.remedial: RemedialSet | null`, `GameState.progress.topicTests: Record<string, TopicTestRecord>`, `GameState.progress.evolutionTests: EvolutionAttempt[]`.
  - `SCHEMA_VERSION = 3`.

- [ ] **Step 1: Viết test thất bại**

`src/game/migrate.test.ts` (thay toàn bộ file):

```ts
import { describe, expect, test } from "vitest";
import { StateFormatError, upgradeGameState } from "./migrate";
import { GAME_STATE_VERSION, initialGameState } from "./state";

/** A state as the M3a app saved it (version 2). */
function versionTwoState(): Record<string, unknown> {
  const { remedial, ...rest } = initialGameState("2026-10-06");
  const { topicTests, evolutionTests, ...progress } = rest.progress;
  const { stageStartXp, ...pet } = rest.pet;
  return { ...rest, version: 2, pet: { ...pet, xp: 70 }, progress: { ...progress, completedReviews: ["s1.lam-quen.r1"] } };
}

/** A state as the M2 app saved it (version 1). */
function versionOneState(): Record<string, unknown> {
  const { mastery, reviews, retry, ...rest } = versionTwoState();
  const { completedReviews, ...progress } = rest.progress as Record<string, unknown>;
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
    expect(upgraded.progress.topicTests).toEqual({});
    expect(upgraded.remedial).toBeNull();
  });

  test("upgrades a version 2 state and keeps its review stations", () => {
    const upgraded = upgradeGameState(versionTwoState());
    expect(upgraded.version).toBe(GAME_STATE_VERSION);
    expect(upgraded.progress.completedReviews).toEqual(["s1.lam-quen.r1"]);
    expect(upgraded.pet).toMatchObject({ xp: 70, stageStartXp: 0 });
    expect(upgraded.progress.topicTests).toEqual({});
    expect(upgraded.progress.evolutionTests).toEqual([]);
    expect(upgraded.remedial).toBeNull();
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
      version: 3,
      pet: { stage: 1, xp: 0, stageStartXp: 0, pin: 4, vui: 4, correctRun: 0 },
      wallet: { xu: 0 },
      activity: { lastActiveDay: null, decayApplied: 0 },
      streak: { current: 0, best: 0, freezes: 0, lastAchievedDay: null, pointsDay: null, points: 0 },
      week: { start: "2026-10-05", lessonsDone: 0 },
      settings: { dailyGoal: 2, weeklyTarget: 10, graceDays: 1, uiLang: "vi" },
      mastery: {},
      reviews: {},
      retry: {},
      remedial: null,
      progress: {
        completedLessons: [],
        solvedExercises: [],
        answeredQuestions: [],
        completedReviews: [],
        topicTests: {},
        evolutionTests: [],
      },
      warnings: [],
    });
```

Trong `src/storage/backup.test.ts`, thay test `decodes the committed schema 2 sample file` bằng 2 test:

```ts
  test("decodes the committed schema 2 sample file and upgrades it", async () => {
    const result = await decodeBackup(readFileSync("src/storage/fixtures/backup-v2.pypet", "utf8"));
    if (!result.ok) throw new Error("the sample file must decode");
    expect(result.checksumValid).toBe(true);
    expect(result.payload.schemaVersion).toBe(SCHEMA_VERSION);
    expect(result.payload.profiles[0]!.state.mastery).toEqual({});
    expect(result.payload.profiles[0]!.state.remedial).toBeNull();
  });

  test("decodes the committed schema 3 sample file", async () => {
    const result = await decodeBackup(readFileSync("src/storage/fixtures/backup-v3.pypet", "utf8"));
    expect(result.ok && result.checksumValid).toBe(true);
    expect(result.ok && result.payload.profiles[0]!.state.progress.topicTests).toEqual({});
  });
```

Trong `src/ui/AppRoutes.test.tsx`, đổi import `initialGameState, type GameState` thành `GAME_STATE_VERSION, initialGameState, type GameState`, rồi thay test `a profile saved by an older app is upgraded when it opens` bằng:

```tsx
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
    await store.createProfile(testProfile(), old);
    render(<App bundle={testBundle()} runnerClient={makeClient().client} store={store} clock={() => FIXED_NOW} />);
    expect(await screen.findByRole("heading", { name: "Phòng của Robo" })).toBeInTheDocument();
    await waitFor(async () => expect((await store.loadActive())?.state.version).toBe(GAME_STATE_VERSION));
  });
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/game/migrate.test.ts src/game/dates.test.ts src/storage/backup.test.ts src/ui/AppRoutes.test.tsx`
Expected: FAIL: state vẫn là version 2, chưa có `backup-v3.pypet`.

- [ ] **Step 3: Viết code**

`src/game/state.ts` (thay toàn bộ file):

```ts
import type { Lang } from "../i18n/lang";
import { weekStart } from "./dates";

export const GAME_STATE_VERSION = 3;
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

/** The best result and the latest paper of a topic test (spec 5.3: it never blocks the path). */
export interface TopicTestRecord {
  attempts: number;
  best: number;
  max: number;
  passed: boolean;
  /** The items of the latest attempt, avoided by the next one when the bank allows. */
  lastItems: string[];
}

/** One evolution test (spec 5.11). */
export interface EvolutionAttempt {
  at: string;
  stage: number;
  score: number;
  max: number;
  passed: boolean;
  items: string[];
  wrongConcepts: string[];
}

/** The focused review set opened by a failed evolution test; the retake waits until it is done (spec 5.11). */
export interface RemedialSet {
  stage: number;
  items: string[];
}

export interface GameState {
  version: number;
  pet: {
    stage: number;
    /** All XP ever earned; it is never lost (spec 5.4). */
    xp: number;
    /** pet.xp when the current stage began: the growth bar shows xp - stageStartXp. */
    stageStartXp: number;
    pin: number;
    vui: number;
    correctRun: number;
  };
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
  remedial: RemedialSet | null;
  progress: {
    completedLessons: string[];
    solvedExercises: string[];
    answeredQuestions: string[];
    completedReviews: string[];
    topicTests: Record<string, TopicTestRecord>;
    evolutionTests: EvolutionAttempt[];
    /** Optional: states saved before it existed have no stats. Read it with `?? {}`. */
    exerciseStats?: Record<string, ExerciseStats>;
  };
  warnings: { at: string; kind: "clock-rollback" }[];
}

export const DEFAULT_SETTINGS: GameSettings = { dailyGoal: 2, weeklyTarget: 10, graceDays: 1, uiLang: "vi" };

export function initialGameState(today: string): GameState {
  return {
    version: GAME_STATE_VERSION,
    pet: { stage: 1, xp: 0, stageStartXp: 0, pin: STAT_START, vui: STAT_START, correctRun: 0 },
    wallet: { xu: 0 },
    activity: { lastActiveDay: null, decayApplied: 0 },
    streak: { current: 0, best: 0, freezes: 0, lastAchievedDay: null, pointsDay: null, points: 0 },
    week: { start: weekStart(today), lessonsDone: 0 },
    settings: { ...DEFAULT_SETTINGS },
    mastery: {},
    reviews: {},
    retry: {},
    remedial: null,
    progress: {
      completedLessons: [],
      solvedExercises: [],
      answeredQuestions: [],
      completedReviews: [],
      topicTests: {},
      evolutionTests: [],
    },
    warnings: [],
  };
}
```

`src/game/schema.ts` (thay toàn bộ file):

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
  pet: z.object({
    stage: z.number().int().min(1),
    xp: count,
    stageStartXp: count,
    pin: stat,
    vui: stat,
    correctRun: count,
  }),
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
  remedial: z.object({ stage: z.number().int().min(1), items: z.array(z.string()) }).nullable(),
  progress: z.object({
    completedLessons: z.array(z.string()),
    solvedExercises: z.array(z.string()),
    answeredQuestions: z.array(z.string()),
    completedReviews: z.array(z.string()),
    topicTests: z.record(
      z.string(),
      z.object({
        attempts: count,
        best: z.number().min(0),
        max: z.number().min(0),
        passed: z.boolean(),
        lastItems: z.array(z.string()),
      }),
    ),
    evolutionTests: z.array(
      z.object({
        at: z.string(),
        stage: z.number().int().min(1),
        score: z.number().min(0),
        max: z.number().min(0),
        passed: z.boolean(),
        items: z.array(z.string()),
        wrongConcepts: z.array(z.string()),
      }),
    ),
    exerciseStats: z
      .record(z.string(), z.object({ fails: count, hints: count, viewedSolution: z.boolean() }))
      .optional(),
  }),
  warnings: z.array(z.object({ at: z.string(), kind: z.literal("clock-rollback") })),
});
```

`src/game/migrate.ts`: thêm bước 2 vào `STEPS`, ngay sau bước 1:

```ts
  2: (state) => ({
    ...state,
    version: 3,
    pet: { ...(isRecord(state.pet) ? state.pet : {}), stageStartXp: 0 },
    remedial: null,
    progress: { ...(isRecord(state.progress) ? state.progress : {}), topicTests: {}, evolutionTests: [] },
  }),
```

`src/storage/types.ts`: `export const SCHEMA_VERSION = 3;`

`src/storage/backup.ts`: thêm migration 2 → 3 vào `MIGRATIONS`:

```ts
const MIGRATIONS: Record<number, (payload: BackupPayload) => BackupPayload> = {
  // Schema 2 only changed the game state (GameState version 2).
  1: (payload) => ({ ...payload, schemaVersion: 2, meta: { ...payload.meta, schemaVersion: 2 } }),
  // Schema 3 only changed the game state (GameState version 3).
  2: (payload) => ({ ...payload, schemaVersion: 3, meta: { ...payload.meta, schemaVersion: 3 } }),
};
```

Sinh file mẫu schema 3 (chạy đúng 1 lần, không sinh lại file của phiên bản cũ):

```bash
npx tsx tools/make_backup_fixture.ts
```

Expected: `Wrote src/storage/fixtures/backup-v3.pypet`.

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run && npm run typecheck`
Expected: PASS toàn bộ; typecheck không lỗi. `git status` chỉ có `backup-v3.pypet` là file mẫu mới; `backup-v1.pypet` và `backup-v2.pypet` không đổi.

- [ ] **Step 5: Commit**

```bash
git add src/game/state.ts src/game/schema.ts src/game/migrate.ts src/game/migrate.test.ts src/game/dates.test.ts src/storage/types.ts src/storage/backup.ts src/storage/backup.test.ts src/storage/fixtures/backup-v3.pypet src/ui/AppRoutes.test.tsx
git commit -m "feat(game): GameState version 3 with test records, focused review set and stage start XP

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Cấu hình bài kiểm tra trong nội dung

**Files:**
- Modify: `src/content/types.ts`, `src/content/lookup.ts`, `tools/content/schema.ts`, `tools/content/buildBundle.ts`, `tools/content/references.ts`, `tools/content/coverage.ts`, `content/stage-1/01-lam-quen/concepts.yaml`, `src/test/fixtures.ts`, `src/test/reviewBundle.ts`
- Test: `tools/content/buildBundle.test.ts`, `src/content/lookup.test.ts`

**Interfaces:**
- Consumes: không có.
- Produces:
  - `Concept.ai: boolean`; `interface TopicTestConfig { questions: number; code: number }`; `interface EvolutionTestConfig { questions: number; ai: number; code: number }`; `Topic.test: TopicTestConfig`; `Stage.evolution: EvolutionTestConfig`.
  - `lookup.ts`: `findTopic(bundle, id)`, `findStage(bundle, id)`, `topicTestId(topic)` (`<topic>.test`), `evolutionTestId(stage)` (`<stage>.evolution`), `topicQuestions(topic): ChoiceQuestion[]`, `topicTestCode(topic): CodeExercise[]`.
  - `tools/content/schema.ts`: `DEFAULT_EVOLUTION`, `DEFAULT_TOPIC_TEST`.
  - Cảnh báo luật 9 trong `contentWarnings` (chỉ cảnh báo).

- [ ] **Step 1: Viết test thất bại**

`tools/content/buildBundle.test.ts` (thay toàn bộ file):

```ts
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, test } from "vitest";
import { fillTemplate, parsonsLines } from "../../src/content/exercise";
import { buildBundle, ContentError } from "./buildBundle";
import { contentWarnings } from "./coverage";

function writeTree(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "py-pet-content-"));
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, rel)), { recursive: true });
    writeFileSync(join(root, rel), text);
  }
  return root;
}

const LESSON = `---
id: s1.a.l1
title: { vi: Bài 1 }
exercises:
  - id: s1.a.l1.ex1
    type: code
    concepts: [print-call]
    prompt: { vi: In ra Hi }
    solution: 'print("Hi")'
    tests:
      - { output: Hi }
---
Thẻ **một**
`;

function minimalTree(overrides: Record<string, string> = {}): Record<string, string> {
  return {
    "stage-1/stage.yaml": "id: s1\ntitle: { vi: Khởi động, en: Getting started }\ntopics: [01-a]\n",
    "stage-1/01-a/topic.yaml": "id: s1.a\ntitle: { vi: Chủ đề A }\nlessons: [01-x.md]\n",
    "stage-1/01-a/concepts.yaml": "concepts:\n  - id: print-call\n    name: { vi: Lệnh print }\n",
    "stage-1/01-a/questions.yaml": [
      "questions:",
      "  - id: s1.a.b1",
      "    type: mcq",
      "    lessons: [s1.a.l1]",
      "    prompt: { vi: Câu hỏi?, en: Question? }",
      "    choices:",
      "      - { text: A, correct: true }",
      "      - { vi: Không, en: No }",
      "    explanation: { vi: Vì vậy., en: Because. }",
      "",
    ].join("\n"),
    "stage-1/01-a/01-x.md": LESSON,
    "errors/errors.yaml": [
      "- id: zero-division",
      "  match: { type: ZeroDivisionError }",
      "  explain: { vi: Chia cho 0, en: Division by 0 }",
      "  sample: 'print(1 / 0)'",
      "",
    ].join("\n"),
    ...overrides,
  };
}

function problemsOf(files: Record<string, string>): string[] {
  try {
    buildBundle(writeTree(files));
  } catch (error) {
    if (error instanceof ContentError) return error.problems;
    throw error;
  }
  return [];
}

describe("buildBundle", () => {
  test("builds a bundle from a valid tree", () => {
    const bundle = buildBundle(writeTree(minimalTree()));
    const topic = bundle.stages[0]!.topics[0]!;
    const lesson = topic.lessons[0]!;
    expect(bundle.stages[0]!.title).toEqual({ vi: "Khởi động", en: "Getting started" });
    expect(lesson.cards[0]!.segments[0]).toEqual({ kind: "html", html: "<p>Thẻ <strong>một</strong></p>\n" });
    expect(lesson.exercises[0]).toEqual({
      id: "s1.a.l1.ex1",
      type: "code",
      concepts: ["print-call"],
      prompt: { vi: "In ra Hi" },
      starter: "",
      solution: 'print("Hi")',
      tests: [{ input: "", output: "Hi", hidden: false }],
      commonWrong: [],
      hints: [],
      compare: { kind: "exact" },
      testEligible: false,
    });
    expect(topic.questions[0]!.choices).toEqual([
      { text: { vi: "A", en: "A" }, correct: true, error: false, misconception: null },
      { text: { vi: "Không", en: "No" }, correct: false, error: false, misconception: null },
    ]);
    expect(topic.concepts).toEqual([
      {
        id: "print-call",
        name: { vi: "Lệnh print" },
        ai: false,
        misconceptionCard: null,
        misconceptionHtml: null,
        parentTip: null,
        practice: { level1: [], level2: [], level3: [] },
      },
    ]);
    expect(topic.reviews).toEqual([]);
    expect(topic.practice).toEqual([]);
    expect(topic.test).toEqual({ questions: 8, code: 2 });
    expect(bundle.stages[0]!.evolution).toEqual({ questions: 15, ai: 3, code: 3 });
    expect(bundle.errors).toEqual([
      {
        id: "zero-division",
        match: { type: "ZeroDivisionError", message: null, check: null },
        explain: { vi: "Chia cho 0", en: "Division by 0" },
        hint: null,
        misconception: null,
        sample: "print(1 / 0)",
        sampleInput: "",
      },
    ]);
  });

  test("gives lesson questions their own lesson id", () => {
    const lesson = LESSON.replace(
      "---\nThẻ",
      [
        "  - id: s1.a.l1.q1",
        "    type: predict",
        "    code: 'print(1)'",
        "    prompt: { vi: In ra gì?, en: What is printed? }",
        "    choices:",
        "      - { text: '1', correct: true }",
        "      - { text: '2' }",
        "    explanation: { vi: Một., en: One. }",
        "---",
        "Thẻ",
      ].join("\n"),
    );
    const bundle = buildBundle(writeTree(minimalTree({ "stage-1/01-a/01-x.md": lesson })));
    const question = bundle.stages[0]!.topics[0]!.lessons[0]!.exercises[1]!;
    expect(question).toMatchObject({ id: "s1.a.l1.q1", lessons: ["s1.a.l1"], code: "print(1)" });
  });

  test("reports a neutral choice with empty text", () => {
    const questions = minimalTree()["stage-1/01-a/questions.yaml"]!.replace("{ text: A, correct: true }", '{ text: "", correct: true }');
    const problems = problemsOf(minimalTree({ "stage-1/01-a/questions.yaml": questions }));
    expect(problems).not.toEqual([]);
  });

  test("requires English for a test-eligible code exercise", () => {
    const lesson = LESSON.replace("    prompt: { vi: In ra Hi }", "    prompt: { vi: In ra Hi }\n    test_eligible: true");
    const problems = problemsOf(minimalTree({ "stage-1/01-a/01-x.md": lesson }));
    expect(problems).toEqual([expect.stringMatching(/^stage-1\/01-a\/01-x\.md: exercises\.0: prompt\.en: /)]);
  });

  test("requires English in mcq prompts", () => {
    const questions = minimalTree()["stage-1/01-a/questions.yaml"]!.replace(
      "{ vi: Câu hỏi?, en: Question? }",
      "{ vi: Câu hỏi? }",
    );
    const problems = problemsOf(minimalTree({ "stage-1/01-a/questions.yaml": questions }));
    expect(problems).toEqual([expect.stringContaining("questions.0: prompt.en")]);
  });

  test("requires code in predict questions and exactly 1 correct choice", () => {
    const questions = minimalTree()["stage-1/01-a/questions.yaml"]!
      .replace("type: mcq", "type: predict")
      .replace("{ text: A, correct: true }", "{ text: A }");
    const problems = problemsOf(minimalTree({ "stage-1/01-a/questions.yaml": questions }));
    expect(problems).toEqual(
      expect.arrayContaining([expect.stringContaining("code: Câu predict"), expect.stringContaining("choices: Phải có đúng 1")]),
    );
  });

  test("reports duplicate ids", () => {
    const lesson = LESSON.replace("id: s1.a.l1.ex1", "id: s1.a.b1");
    const problems = problemsOf(minimalTree({ "stage-1/01-a/01-x.md": lesson }));
    expect(problems).toEqual([expect.stringContaining('ID trùng "s1.a.b1"')]);
  });

  test("reports unknown concepts and unknown lessons", () => {
    const lesson = LESSON.replace("concepts: [print-call]", "concepts: [khong-co]");
    const questions = minimalTree()["stage-1/01-a/questions.yaml"]!.replace("lessons: [s1.a.l1]", "lessons: [s1.a.l9]");
    const problems = problemsOf(minimalTree({ "stage-1/01-a/01-x.md": lesson, "stage-1/01-a/questions.yaml": questions }));
    expect(problems).toEqual(
      expect.arrayContaining([
        expect.stringContaining('khái niệm "khong-co"'),
        expect.stringContaining('bài học "s1.a.l9" không tồn tại'),
      ]),
    );
  });

  test("reports an invalid regular expression in the error dictionary", () => {
    const errors = minimalTree()["errors/errors.yaml"]!.replace(
      "match: { type: ZeroDivisionError }",
      'match: { type: ZeroDivisionError, message: "(" }',
    );
    const problems = problemsOf(minimalTree({ "errors/errors.yaml": errors }));
    expect(problems).toEqual([expect.stringContaining("match.message: Biểu thức chính quy không hợp lệ")]);
  });

  test("reports a missing file", () => {
    const problems = problemsOf(minimalTree({ "stage-1/01-a/topic.yaml": "id: s1.a\ntitle: { vi: A }\nlessons: [99-y.md]\n" }));
    expect(problems).toEqual(expect.arrayContaining([expect.stringContaining("stage-1/01-a/99-y.md: không tìm thấy file")]));
  });

  test("reports a lesson without cards", () => {
    const problems = problemsOf(minimalTree({ "stage-1/01-a/01-x.md": LESSON.replace("Thẻ **một**\n", "") }));
    expect(problems).toEqual([expect.stringContaining("bài học phải có ít nhất 1 thẻ")]);
  });

  test("sorts stage folders by number and allows a tree with only errors", () => {
    const tree = minimalTree();
    const onlyErrors = { "errors/errors.yaml": tree["errors/errors.yaml"]! };
    expect(buildBundle(writeTree(onlyErrors)).stages).toEqual([]);
    const stage10 = Object.fromEntries(
      Object.entries(tree)
        .filter(([path]) => path.startsWith("stage-1/"))
        .map(([path, text]) => [
          path.replace("stage-1/", "stage-10/"),
          text.replaceAll("s1.a", "s10.a").replaceAll("print-call", "print-call-b").replace("id: s1\n", "id: s10\n"),
        ]),
    );
    const bundle = buildBundle(writeTree({ ...tree, ...stage10 }));
    expect(bundle.stages.map((s) => s.id)).toEqual(["s1", "s10"]);
  });

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
          "stage-1/stage.yaml":
            "id: s1\ntitle: { vi: Khởi động }\ntopics: [01-a]\nevolution: { questions: 0, ai: 0, code: 0 }\n",
          "stage-1/01-a/topic.yaml":
            "id: s1.a\ntitle: { vi: Chủ đề A }\nlessons: [01-x.md]\nreviews:\n  - { id: s1.a.r1, after: s1.a.l1 }\ntest: { questions: 1, code: 0 }\n",
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
    expect(contentWarnings(bundle)).toContain(
      "print-call: thiếu thẻ hiểu lầm, gợi ý cho phụ huynh, bài luyện level1, bài luyện level2, bài luyện level3",
    );
  });

  test("warns when a bank is too small for its tests (spec 3.9 rule 9)", () => {
    const bundle = buildBundle(writeTree(minimalTree()));
    expect(contentWarnings(bundle).slice(1)).toEqual([
      "s1: ngân hàng có 1 câu, cần ít nhất 30 câu cho đề tiến hóa",
      "s1: có 0 câu AI, đề tiến hóa cần 3",
      "s1: có 0 bài code test_eligible, đề tiến hóa cần 3",
      "s1.a: có 1 câu, kiểm tra chủ đề cần 8",
      "s1.a: có 0 bài code test_eligible, kiểm tra chủ đề cần 2",
    ]);
  });

  test("reads test configs and the AI flag, and reports a test larger than its AI share allows", () => {
    const bundle = buildBundle(
      writeTree(
        minimalTree({
          "stage-1/stage.yaml": "id: s1\ntitle: { vi: K }\ntopics: [01-a]\nevolution: { questions: 4, ai: 1, code: 1 }\n",
          "stage-1/01-a/topic.yaml": "id: s1.a\ntitle: { vi: A }\nlessons: [01-x.md]\ntest: { questions: 3, code: 1 }\n",
          "stage-1/01-a/concepts.yaml": "concepts:\n  - id: print-call\n    name: { vi: P }\n    ai: true\n",
        }),
      ),
    );
    expect(bundle.stages[0]!.evolution).toEqual({ questions: 4, ai: 1, code: 1 });
    expect(bundle.stages[0]!.topics[0]!.test).toEqual({ questions: 3, code: 1 });
    expect(bundle.stages[0]!.topics[0]!.concepts[0]!.ai).toBe(true);
    const badStage = "id: s1\ntitle: { vi: K }\ntopics: [01-a]\nevolution: { questions: 2, ai: 3, code: 0 }\n";
    expect(problemsOf(minimalTree({ "stage-1/stage.yaml": badStage }))).toEqual([
      expect.stringContaining("Số câu AI không được lớn hơn số câu hỏi"),
    ]);
  });

  test("reports an item whose ID is a test node ID", () => {
    const questions = minimalTree()["stage-1/01-a/questions.yaml"]!.replace("id: s1.a.b1", "id: s1.a.test");
    expect(problemsOf(minimalTree({ "stage-1/01-a/questions.yaml": questions }))).toEqual([
      'ID trùng "s1.a.test": kiểm tra chủ đề và câu hỏi',
    ]);
  });

  test("parsonsLines and fillTemplate", () => {
    expect(parsonsLines("a\r\n\n  b  \n")).toEqual(["a", "  b"]);
    expect(fillTemplate("x = ___ + ___", ["1", "2"])).toBe("x = 1 + 2");
    expect(fillTemplate("print(1)", [])).toBe("print(1)");
  });
});
```

`src/content/lookup.test.ts` (thay toàn bộ file):

```ts
import { expect, test } from "vitest";
import { allExercises, allLessons, findConcept, findItem, findLesson } from "./lookup";
import type { ChoiceQuestion, CodeExercise, ContentBundle, FillExercise, Lesson } from "./types";

const code: CodeExercise = {
  id: "a.l1.ex1",
  type: "code",
  concepts: [],
  prompt: { vi: "In ra Hi" },
  starter: "",
  solution: 'print("Hi")',
  tests: [{ input: "", output: "Hi", hidden: false }],
  commonWrong: [],
  hints: [],
  compare: { kind: "exact" },
  testEligible: false,
};
const question: ChoiceQuestion = {
  id: "a.b1",
  type: "mcq",
  concepts: [],
  lessons: ["a.l1"],
  code: null,
  prompt: { vi: "Hỏi?", en: "Question?" },
  choices: [
    { text: { vi: "Có", en: "Yes" }, correct: true, error: false, misconception: null },
    { text: { vi: "Không", en: "No" }, correct: false, error: false, misconception: null },
  ],
  explanation: { vi: "Vì vậy.", en: "Because." },
};
const lesson1: Lesson = { id: "a.l1", title: { vi: "Bài 1" }, cards: [], exercises: [code] };
const lesson2: Lesson = { id: "a.l2", title: { vi: "Bài 2" }, cards: [], exercises: [] };
const bundle: ContentBundle = {
  stages: [
    {
      id: "s1",
      title: { vi: "Giai đoạn 1" },
      topics: [
        {
          id: "a",
          title: { vi: "A" },
          lessons: [lesson1, lesson2],
          concepts: [],
          questions: [question],
          reviews: [],
          practice: [],
          test: { questions: 0, code: 0 },
        },
      ],
      evolution: { questions: 0, ai: 0, code: 0 },
    },
  ],
  errors: [],
};

test("allLessons lists lessons in order", () => {
  expect(allLessons(bundle).map((l) => l.id)).toEqual(["a.l1", "a.l2"]);
});

test("findLesson finds by id", () => {
  expect(findLesson(bundle, "a.l2")).toBe(lesson2);
  expect(findLesson(bundle, "missing")).toBeUndefined();
});

test("allExercises includes lesson exercises and bank questions", () => {
  expect(allExercises(bundle).map((e) => e.id)).toEqual(["a.l1.ex1", "a.b1"]);
});

test("findItem and findConcept look in lessons, banks and practice files", () => {
  const concept = {
    id: "c1",
    name: { vi: "K" },
    ai: false,
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

Run: `npx vitest run tools/content/buildBundle.test.ts src/content/lookup.test.ts`
Expected: FAIL: bundle chưa có `test`, `evolution`, `ai`; chưa có cảnh báo luật 9.

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
  /** True for AI knowledge (spec 5.11: the evolution test has a share of AI questions). */
  ai: boolean;
  /** Markdown, as written in concepts.yaml. */
  misconceptionCard: string | null;
  /** The misconception card as HTML, ready to show. */
  misconceptionHtml: string | null;
  parentTip: string | null;
  practice: ConceptPractice;
}

/** The paper of a topic test: predict/mcq questions worth 1 point, test-eligible code exercises worth 3. 0 + 0 = no test. */
export interface TopicTestConfig {
  questions: number;
  code: number;
}

/** The paper of an evolution test (spec 5.11); `ai` of the questions are about AI. 0 + 0 = no test. */
export interface EvolutionTestConfig {
  questions: number;
  ai: number;
  code: number;
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
  test: TopicTestConfig;
}

export interface Stage {
  id: string;
  title: LocalizedText;
  topics: Topic[];
  evolution: EvolutionTestConfig;
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

`src/content/lookup.ts` (thay toàn bộ file):

```ts
import {
  isChoiceQuestion,
  type ChoiceQuestion,
  type CodeExercise,
  type Concept,
  type ContentBundle,
  type Exercise,
  type Lesson,
  type Stage,
  type Topic,
} from "./types";

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

export function findTopic(bundle: ContentBundle, id: string): Topic | undefined {
  return bundle.stages.flatMap((stage) => stage.topics).find((topic) => topic.id === id);
}

export function findStage(bundle: ContentBundle, id: string): Stage | undefined {
  return bundle.stages.find((stage) => stage.id === id);
}

/** The map node ID of a topic's test. */
export function topicTestId(topic: Topic): string {
  return `${topic.id}.test`;
}

/** The map node ID of a stage's evolution test. */
export function evolutionTestId(stage: Stage): string {
  return `${stage.id}.evolution`;
}

/** The predict/mcq questions of a topic: those of its lessons, then its bank. */
export function topicQuestions(topic: Topic): ChoiceQuestion[] {
  return [...topic.lessons.flatMap((lesson) => lesson.exercises).filter(isChoiceQuestion), ...topic.questions];
}

/** The code exercises of a topic that a test may use (test_eligible), from its lessons and its practice file. */
export function topicTestCode(topic: Topic): CodeExercise[] {
  return [...topic.lessons.flatMap((lesson) => lesson.exercises), ...topic.practice].filter(
    (item): item is CodeExercise => item.type === "code" && item.testEligible,
  );
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

const countSchema = z.number().int().min(0);

/** Spec 5.11 defaults: 15 questions (3 about AI) and 3 code exercises. */
export const DEFAULT_EVOLUTION = { questions: 15, ai: 3, code: 3 } as const;
/** Maintainer decision (2026-10-06): 8 questions and 2 code exercises. */
export const DEFAULT_TOPIC_TEST = { questions: 8, code: 2 } as const;

export const stageFileSchema = z
  .object({
    id: idSchema,
    title: localizedSchema,
    topics: z.array(z.string().min(1)).min(1),
    evolution: z
      .object({ questions: countSchema, ai: countSchema, code: countSchema })
      .strict()
      .refine((e) => e.ai <= e.questions, { message: "Số câu AI không được lớn hơn số câu hỏi" })
      .default({ ...DEFAULT_EVOLUTION }),
  })
  .strict();

export const topicFileSchema = z
  .object({
    id: idSchema,
    title: localizedSchema,
    lessons: z.array(z.string().min(1)).min(1),
    reviews: z.array(z.object({ id: idSchema, after: idSchema }).strict()).default([]),
    test: z.object({ questions: countSchema, code: countSchema }).strict().default({ ...DEFAULT_TOPIC_TEST }),
  })
  .strict();

const conceptSchema = z
  .object({
    id: idSchema,
    name: localizedSchema,
    ai: z.boolean().default(false),
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
    ai: raw.ai,
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

`tools/content/buildBundle.ts`: trong `buildStage` trả về `{ id: raw.id, title: toLocalized(raw.title), topics, evolution: raw.evolution }`; trong `buildTopic` thêm `test: raw.test,` sau `practice: buildPractice(c, \`${dir}/practice.yaml\`),`.

`tools/content/references.ts`: thêm `import { evolutionTestId, topicTestId } from "../../src/content/lookup";`, thêm `claim(evolutionTestId(stage), "kiểm tra tiến hóa");` sau `claim(stage.id, "giai đoạn");` và `claim(topicTestId(topic), "kiểm tra chủ đề");` sau `claim(topic.id, "chủ đề");`.

`tools/content/coverage.ts` (thay toàn bộ file):

```ts
import { allConcepts, topicQuestions, topicTestCode } from "../../src/content/lookup";
import type { ContentBundle } from "../../src/content/types";

/**
 * Spec 3.9 rule 9 and the test configs: a stage's bank holds at least twice the evolution test's questions, with
 * enough AI questions and test-eligible code; a topic has enough items for its test. Short banks make shorter papers
 * (maintainer decision 2026-10-06), so these are warnings until the content of M5.
 */
function testWarnings(bundle: ContentBundle): string[] {
  const warnings: string[] = [];
  const aiConcepts = new Set(allConcepts(bundle).filter((concept) => concept.ai).map((concept) => concept.id));
  for (const stage of bundle.stages) {
    const questions = stage.topics.flatMap(topicQuestions);
    const ai = questions.filter((q) => q.concepts.some((id) => aiConcepts.has(id))).length;
    const code = stage.topics.flatMap(topicTestCode).length;
    const { evolution } = stage;
    if (questions.length < 2 * evolution.questions) {
      warnings.push(`${stage.id}: ngân hàng có ${questions.length} câu, cần ít nhất ${2 * evolution.questions} câu cho đề tiến hóa`);
    }
    if (ai < evolution.ai) warnings.push(`${stage.id}: có ${ai} câu AI, đề tiến hóa cần ${evolution.ai}`);
    if (code < evolution.code) warnings.push(`${stage.id}: có ${code} bài code test_eligible, đề tiến hóa cần ${evolution.code}`);
    for (const topic of stage.topics) {
      const topicQ = topicQuestions(topic).length;
      const topicCode = topicTestCode(topic).length;
      if (topicQ < topic.test.questions) warnings.push(`${topic.id}: có ${topicQ} câu, kiểm tra chủ đề cần ${topic.test.questions}`);
      if (topicCode < topic.test.code) {
        warnings.push(`${topic.id}: có ${topicCode} bài code test_eligible, kiểm tra chủ đề cần ${topic.test.code}`);
      }
    }
  }
  return warnings;
}

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
  return [...warnings, ...testWarnings(bundle)];
}
```

`content/stage-1/01-lam-quen/concepts.yaml`: thêm `ai: true` vào khái niệm `ai-basics`, ngay sau dòng `name`:

```yaml
  - id: ai-basics
    name: { vi: "AI là gì", en: "What AI is" }
    ai: true
```

Bộ nội dung mẫu cũ không có bài kiểm tra (cấu hình 0 + 0), để test M3a giữ nguyên:
- `src/test/fixtures.ts` và `src/test/reviewBundle.ts`: thêm `test: { questions: 0, code: 0 },` vào chủ đề (sau `practice`) và `evolution: { questions: 0, ai: 0, code: 0 },` vào giai đoạn (sau `topics`).
- `src/test/reviewBundle.ts`: hàm `concept()` thêm `ai: false,` sau `name`.

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run && npm run typecheck && npm run content:validate`
Expected: PASS. `content:build` in thêm 2 cảnh báo (vô hại, chỉ cảnh báo tới M5):

```
Cảnh báo: s1: ngân hàng có 12 câu, cần ít nhất 30 câu cho đề tiến hóa
Cảnh báo: s1: có 2 câu AI, đề tiến hóa cần 3
```

- [ ] **Step 5: Commit**

```bash
git add src/content/types.ts src/content/lookup.ts src/content/lookup.test.ts tools/content/schema.ts tools/content/buildBundle.ts tools/content/buildBundle.test.ts tools/content/references.ts tools/content/coverage.ts content/stage-1/01-lam-quen/concepts.yaml src/test/fixtures.ts src/test/reviewBundle.ts
git commit -m "feat(content): topic and evolution test configs, AI concepts, bank size warnings

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 3: Rút đề, chấm điểm và bộ ôn tập trọng tâm

**Files:**
- Create: `src/game/exam.ts`, `src/test/examBundle.ts`
- Modify: `src/game/reviewSet.ts`
- Test: `src/game/exam.test.ts`

**Interfaces:**
- Consumes: `topicQuestions`, `topicTestCode`, `allConcepts` (Task 2); `availableItems`, `shuffled`, `Rng` (M3a).
- Produces:
  - `reviewSet.ts`: `conceptItems` đổi tên thành `itemsForConcept` và được export (cùng chữ ký).
  - `exam.ts`: `CODE_POINTS = 3`, `REMEDIAL_PER_CONCEPT = 2`; `type ExamItem = ChoiceQuestion | CodeExercise`; `type ExamAnswer = { kind: "choice"; correct: boolean } | { kind: "code"; passed: number; total: number }`; `interface ExamGrade { score; max; wrongConcepts: string[] }`; `drawTopicTest(topic, previous, rng): ExamItem[]`; `drawEvolutionTest(bundle, stage, previous, rng): ExamItem[]`; `itemMax(item)`; `gradePaper(items, answers): ExamGrade`; `buildRemedialSet(bundle, state, wrongConcepts, rng): Exercise[]`.
  - `examBundle()`: 1 giai đoạn `x`, chủ đề `x.t` với bài `x.l1`, `x.l2` (mỗi bài 1 bài code `test_eligible` giải bằng `print("Hi")`), 6 câu `x.q1`–`x.q4` (khái niệm k1, k2) và `x.a1`, `x.a2` (khái niệm AI `a1`); đáp án đúng luôn là "Đúng"; `test: { questions: 3, code: 1 }`, `evolution: { questions: 4, ai: 1, code: 1 }`.

- [ ] **Step 1: Viết test thất bại**

`src/test/examBundle.ts`:

```ts
import type { ChoiceQuestion, CodeExercise, Concept, ContentBundle, Lesson } from "../content/types";
import { fixtureErrors } from "./fixtures";

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
      { text: { vi: "Sai", en: "Wrong" }, correct: false, error: false, misconception: null },
    ],
    explanation: { vi: "Giải thích.", en: "Because." },
  };
}

export function examCode(id: string, concept: string): CodeExercise {
  return {
    id,
    type: "code",
    concepts: [concept],
    prompt: { vi: `In ra Hi (${id})`, en: `Print Hi (${id})` },
    starter: "",
    solution: 'print("Hi")',
    tests: [
      { input: "", output: "Hi", hidden: false },
      { input: "", output: "Hi", hidden: true },
    ],
    commonWrong: [],
    hints: [{ vi: "Dùng print." }],
    compare: { kind: "exact" },
    testEligible: true,
  };
}

function lesson(id: string, exercises: Lesson["exercises"]): Lesson {
  return {
    id,
    title: { vi: `Bài ${id}`, en: `Lesson ${id}` },
    cards: [{ segments: [{ kind: "html", html: `<p>${id}</p>` }] }],
    exercises,
  };
}

function concept(id: string, ai: boolean, level1: string[]): Concept {
  return {
    id,
    name: { vi: `Khái niệm ${id}`, en: `Concept ${id}` },
    ai,
    misconceptionCard: null,
    misconceptionHtml: null,
    parentTip: null,
    practice: { level1, level2: [], level3: [] },
  };
}

/**
 * 1 stage with 1 topic of 2 lessons, a topic test (3 questions + 1 code) and an evolution test (4 questions of which
 * 1 about AI + 1 code). 6 bank questions: x.q1-x.q4 on concept k1/k2, x.a1-x.a2 on the AI concept a1. Every right
 * answer is the choice "Đúng"; both code exercises are solved by printing Hi.
 */
export function examBundle(): ContentBundle {
  return {
    stages: [
      {
        id: "x",
        title: { vi: "Giai đoạn thi", en: "Exam stage" },
        topics: [
          {
            id: "x.t",
            title: { vi: "Chủ đề thi", en: "Exam topic" },
            lessons: [lesson("x.l1", [examCode("x.l1.ex1", "k1")]), lesson("x.l2", [examCode("x.l2.ex1", "k2")])],
            concepts: [
              concept("k1", false, ["x.q1", "x.q2"]),
              concept("k2", false, ["x.q3", "x.q4"]),
              concept("a1", true, []),
            ],
            questions: [
              question("x.q1", "x.l1", "k1"),
              question("x.q2", "x.l1", "k1"),
              question("x.q3", "x.l2", "k2"),
              question("x.q4", "x.l2", "k2"),
              question("x.a1", "x.l1", "a1"),
              question("x.a2", "x.l2", "a1"),
            ],
            reviews: [],
            practice: [],
            test: { questions: 3, code: 1 },
          },
        ],
        evolution: { questions: 4, ai: 1, code: 1 },
      },
    ],
    errors: fixtureErrors,
  };
}
```

`src/game/exam.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { examBundle } from "../test/examBundle";
import { buildRemedialSet, drawEvolutionTest, drawTopicTest, gradePaper, type ExamAnswer } from "./exam";
import { emptyMastery } from "./mastery";
import { seededRng } from "./random";
import { initialGameState } from "./state";

const bundle = examBundle();
const stage = bundle.stages[0]!;
const topic = stage.topics[0]!;
const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8];
const ids = (items: { id: string }[]) => items.map((item) => item.id);

describe("drawTopicTest", () => {
  test("has the configured questions, then the code exercises", () => {
    for (const seed of SEEDS) {
      const paper = drawTopicTest(topic, [], seededRng(seed));
      expect(paper).toHaveLength(4);
      expect(paper.slice(0, 3).every((item) => item.type === "mcq")).toBe(true);
      expect(paper[3]!.type).toBe("code");
    }
  });

  test("avoids the items of the previous attempt when the bank allows", () => {
    const first = ids(drawTopicTest(topic, [], seededRng(1)));
    for (const seed of SEEDS) {
      const second = ids(drawTopicTest(topic, first, seededRng(seed)));
      expect(second.filter((id) => first.includes(id))).toEqual([]);
    }
  });

  test("a short bank gives a shorter paper", () => {
    const small = { ...topic, questions: [], test: { questions: 9, code: 5 } };
    expect(drawTopicTest(small, [], seededRng(1))).toHaveLength(2);
  });
});

describe("drawEvolutionTest", () => {
  test("has the configured AI share, the other questions and the code", () => {
    for (const seed of SEEDS) {
      const paper = drawEvolutionTest(bundle, stage, [], seededRng(seed));
      expect(paper).toHaveLength(5);
      expect(ids(paper).filter((id) => id.startsWith("x.a"))).toHaveLength(1);
      expect(paper[4]!.type).toBe("code");
    }
  });

  test("fills with AI questions when the other questions run out", () => {
    const fewOthers = {
      ...stage,
      topics: [{ ...topic, questions: topic.questions.filter((q) => q.id !== "x.q3" && q.id !== "x.q4") }],
    };
    const paper = drawEvolutionTest(bundle, fewOthers, [], seededRng(1));
    expect(ids(paper).slice(0, 4).sort()).toEqual(["x.a1", "x.a2", "x.q1", "x.q2"]);
  });

  test("avoids the previous attempt's questions first", () => {
    for (const seed of SEEDS) {
      const questions = ids(drawEvolutionTest(bundle, stage, ["x.q1", "x.q2", "x.a1"], seededRng(seed)).slice(0, 4));
      expect(questions).toEqual(expect.arrayContaining(["x.a2", "x.q3", "x.q4"]));
      expect(questions).not.toContain("x.a1");
    }
  });
});

describe("gradePaper", () => {
  const items = [topic.questions[0]!, topic.questions[1]!, examCodeItem()];
  function examCodeItem() {
    return topic.lessons[0]!.exercises[0]!;
  }

  test("1 point per right question and 3 points shared by the passed test cases", () => {
    const answers: ExamAnswer[] = [
      { kind: "choice", correct: true },
      { kind: "choice", correct: false },
      { kind: "code", passed: 1, total: 2 },
    ];
    expect(gradePaper(items, answers)).toEqual({ score: 2.5, max: 5, wrongConcepts: ["k1"] });
  });

  test("an unanswered item scores 0", () => {
    expect(gradePaper(items, [])).toEqual({ score: 0, max: 5, wrongConcepts: ["k1"] });
    expect(gradePaper([], [])).toEqual({ score: 0, max: 0, wrongConcepts: [] });
  });
});

describe("buildRemedialSet", () => {
  test("gives up to 2 items per wrong concept at the child's level", () => {
    const state = initialGameState("2026-10-06");
    state.progress.completedLessons = ["x.l1", "x.l2"];
    const set = buildRemedialSet(bundle, state, ["k1", "k2"], seededRng(1));
    expect(ids(set)).toEqual(expect.arrayContaining(["x.q1", "x.q2", "x.q3", "x.q4"]));
    expect(set).toHaveLength(4);
  });

  test("starts from the ladder level and skips concepts with nothing to practise", () => {
    const state = initialGameState("2026-10-06");
    state.progress.completedLessons = ["x.l1", "x.l2"];
    state.mastery = { k1: { ...emptyMastery(), level: 3 } };
    const set = buildRemedialSet(bundle, state, ["k1", "nope"], seededRng(1));
    expect(set).toHaveLength(2);
    expect(set.every((item) => item.concepts.includes("k1"))).toBe(true);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/game/exam.test.ts`
Expected: FAIL: chưa có `./exam`.

- [ ] **Step 3: Viết code**

`src/game/reviewSet.ts`: đổi tên hàm `conceptItems` thành `itemsForConcept`, thêm `export`, sửa 2 chỗ gọi (`helpItem`, `buildPracticeSet`). Chú thích mới của hàm:

```ts
/** Items for a concept at the ladder level first, then at the nearest other levels, then its other questions. */
export function itemsForConcept(bundle: ContentBundle, available: Map<string, Exercise>, conceptId: string, level: number, rng: Rng): Exercise[] {
```

`src/game/exam.ts`:

```ts
import { allConcepts, topicQuestions, topicTestCode } from "../content/lookup";
import {
  isChoiceQuestion,
  type ChoiceQuestion,
  type CodeExercise,
  type ContentBundle,
  type Exercise,
  type Stage,
  type Topic,
} from "../content/types";
import { shuffled, type Rng } from "./random";
import { availableItems, itemsForConcept } from "./reviewSet";
import type { GameState } from "./state";

/** Spec 5.11: a code exercise in a test is worth 3 points, a question 1 point. */
export const CODE_POINTS = 3;
/** Wrong-concept items in a focused review set (spec 5.11: 2 to 3 per concept). */
export const REMEDIAL_PER_CONCEPT = 2;

/** An item of a test paper (spec 5.11): a predict/mcq question or a test-eligible code exercise. */
export type ExamItem = ChoiceQuestion | CodeExercise;

/** The answer to 1 item of a paper; undefined while it is not answered. */
export type ExamAnswer = { kind: "choice"; correct: boolean } | { kind: "code"; passed: number; total: number };

export interface ExamGrade {
  score: number;
  max: number;
  /** Concepts of the items that did not get full points, in paper order. */
  wrongConcepts: string[];
}

/** Picks `count` items, the ones not in `avoid` first (spec 5.11: avoid the questions of the previous attempt). */
function pick<T extends { id: string }>(pool: readonly T[], count: number, avoid: ReadonlySet<string>, rng: Rng): T[] {
  const fresh = shuffled(
    pool.filter((item) => !avoid.has(item.id)),
    rng,
  );
  const seen = shuffled(
    pool.filter((item) => avoid.has(item.id)),
    rng,
  );
  return [...fresh, ...seen].slice(0, Math.max(0, count));
}

/** A topic test: its questions, then its code exercises. A short bank gives a shorter paper. */
export function drawTopicTest(topic: Topic, previous: readonly string[], rng: Rng): ExamItem[] {
  const avoid = new Set(previous);
  return [
    ...pick(topicQuestions(topic), topic.test.questions, avoid, rng),
    ...pick(topicTestCode(topic), topic.test.code, avoid, rng),
  ];
}

/** An evolution test (spec 5.11): AI and other questions mixed, then the code exercises. */
export function drawEvolutionTest(
  bundle: ContentBundle,
  stage: Stage,
  previous: readonly string[],
  rng: Rng,
): ExamItem[] {
  const avoid = new Set(previous);
  const aiConcepts = new Set(
    allConcepts(bundle)
      .filter((concept) => concept.ai)
      .map((concept) => concept.id),
  );
  const questions = stage.topics.flatMap(topicQuestions);
  const isAi = (q: (typeof questions)[number]) => q.concepts.some((id) => aiConcepts.has(id));
  const { evolution } = stage;
  const ai = pick(questions.filter(isAi), evolution.ai, avoid, rng);
  const other = pick(
    questions.filter((q) => !isAi(q)),
    evolution.questions - ai.length,
    avoid,
    rng,
  );
  // Too few other questions: more AI questions fill the paper.
  const extra = pick(
    questions.filter((q) => isAi(q) && !ai.includes(q)),
    evolution.questions - ai.length - other.length,
    avoid,
    rng,
  );
  return [
    ...shuffled([...ai, ...other, ...extra], rng),
    ...pick(stage.topics.flatMap(topicTestCode), evolution.code, avoid, rng),
  ];
}

export function itemMax(item: Exercise): number {
  return isChoiceQuestion(item) ? 1 : CODE_POINTS;
}

function points(item: Exercise, answer: ExamAnswer | undefined): number {
  if (!answer) return 0;
  if (answer.kind === "choice") return answer.correct ? 1 : 0;
  return answer.total > 0 ? (itemMax(item) * answer.passed) / answer.total : 0;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function gradePaper(items: readonly Exercise[], answers: readonly (ExamAnswer | undefined)[]): ExamGrade {
  let score = 0;
  let max = 0;
  const wrongConcepts: string[] = [];
  items.forEach((item, i) => {
    const got = points(item, answers[i]);
    score += got;
    max += itemMax(item);
    if (got < itemMax(item)) {
      for (const id of item.concepts) if (!wrongConcepts.includes(id)) wrongConcepts.push(id);
    }
  });
  return { score: round2(score), max, wrongConcepts };
}

/** A focused review set (spec 5.11): items for each wrong concept at the child's ladder level. */
export function buildRemedialSet(
  bundle: ContentBundle,
  state: GameState,
  wrongConcepts: readonly string[],
  rng: Rng,
): Exercise[] {
  const available = availableItems(bundle, state);
  const chosen: Exercise[] = [];
  for (const conceptId of wrongConcepts) {
    const level = state.mastery[conceptId]?.level ?? 1;
    const items = itemsForConcept(bundle, available, conceptId, level, rng).filter((item) => !chosen.includes(item));
    chosen.push(...items.slice(0, REMEDIAL_PER_CONCEPT));
  }
  return chosen;
}
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run src/game && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/exam.ts src/game/exam.test.ts src/game/reviewSet.ts src/test/examBundle.ts
git commit -m "feat(game): draw and grade topic and evolution tests, build the focused review set

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Sự kiện kiểm tra, thưởng và tiến hóa

**Files:**
- Modify: `src/game/rewards.ts`, `src/game/mastery.ts`, `src/game/apply.ts`
- Test: `src/game/apply.test.ts`

**Interfaces:**
- Consumes: `GameState` v3 (Task 1).
- Produces:
  - `rewards.ts`: `XP.topicTest = 30`, `XU.topicTestPassed = 20`, `XU.evolution = 100`, `PASS_RATIO = 0.8`, `isPass(score, max): boolean`.
  - `mastery.ts`: `type ResultSource = "lesson" | "review" | "practice" | "test"`.
  - `GameEvent` thêm `{ type: "TopicTestCompleted"; topicId; score; max; items: string[] }`, `{ type: "EvolutionTestCompleted"; stage; score; max; items; wrongConcepts; remedialItems: string[] }`, `{ type: "RemedialCompleted" }`. Cả 3 là sự kiện hoạt động (tính ngày hoạt động như các sự kiện học khác).

- [ ] **Step 1: Viết test thất bại**

`src/game/apply.test.ts`: thêm `import { isPass } from "./rewards";` sau dòng import `./apply`, rồi thêm vào cuối file:

```ts
describe("tests", () => {
  const topicTest = (score: number, max = 14, items = ["a", "b"]): GameEvent => ({
    type: "TopicTestCompleted",
    topicId: "t1",
    score,
    max,
    items,
  });
  const evolution = (
    score: number,
    extra: Partial<Extract<GameEvent, { type: "EvolutionTestCompleted" }>> = {},
  ): GameEvent => ({
    type: "EvolutionTestCompleted",
    stage: 1,
    score,
    max: 24,
    items: ["q1", "c1"],
    wrongConcepts: ["k1"],
    remedialItems: ["p1", "p2"],
    ...extra,
  });

  test("isPass uses 80% with a float tolerance", () => {
    expect(isPass(11.2, 14)).toBe(true);
    expect(isPass(11.19, 14)).toBe(false);
    expect(isPass(19.2, 24)).toBe(true);
    expect(isPass(0, 0)).toBe(false);
  });

  test("a topic test pays 30 XP once, and 20 xu with Vui +1 at the first pass", () => {
    const start = initialGameState("2026-10-06");
    const failed = apply(start, topicTest(8), at("2026-10-06"));
    expect(failed.pet.xp).toBe(30);
    expect(failed.wallet.xu).toBe(0);
    expect(failed.progress.topicTests.t1).toEqual({
      attempts: 1,
      best: 8,
      max: 14,
      passed: false,
      lastItems: ["a", "b"],
    });
    const passed = apply(failed, topicTest(12, 14, ["c"]), at("2026-10-06"));
    expect(passed.pet.xp).toBe(30);
    expect(passed.wallet.xu).toBe(20);
    expect(passed.pet.vui).toBe(5);
    expect(passed.progress.topicTests.t1).toEqual({ attempts: 2, best: 12, max: 14, passed: true, lastItems: ["c"] });
    const again = apply(passed, topicTest(14), at("2026-10-06"));
    expect(again.wallet.xu).toBe(20);
    expect(again.progress.topicTests.t1!.best).toBe(14);
  });

  test("a failed evolution test opens the focused review set and takes nothing away", () => {
    const start = initialGameState("2026-10-06");
    start.pet.xp = 120;
    const failed = apply(start, evolution(10), at("2026-10-06"));
    expect(failed.pet).toMatchObject({ stage: 1, xp: 120, stageStartXp: 0 });
    expect(failed.wallet.xu).toBe(0);
    expect(failed.remedial).toEqual({ stage: 1, items: ["p1", "p2"] });
    expect(failed.progress.evolutionTests).toEqual([
      {
        at: at("2026-10-06").toISOString(),
        stage: 1,
        score: 10,
        max: 24,
        passed: false,
        items: ["q1", "c1"],
        wrongConcepts: ["k1"],
      },
    ]);
    const done = apply(failed, { type: "RemedialCompleted" }, at("2026-10-06"));
    expect(done.remedial).toBeNull();
  });

  test("a failed test with nothing to practise opens no review set", () => {
    const failed = apply(initialGameState("2026-10-06"), evolution(10, { remedialItems: [] }), at("2026-10-06"));
    expect(failed.remedial).toBeNull();
  });

  test("a passed evolution test evolves the robot once, pays 100 xu and Vui +1, and keeps the XP", () => {
    const start = initialGameState("2026-10-06");
    start.pet.xp = 120;
    start.pet.vui = 3;
    start.remedial = { stage: 1, items: ["p1"] };
    const passed = apply(start, evolution(20, { wrongConcepts: [] }), at("2026-10-06"));
    expect(passed.pet).toMatchObject({ stage: 2, xp: 120, stageStartXp: 120, vui: 4 });
    expect(passed.wallet.xu).toBe(100);
    expect(passed.remedial).toBeNull();
    const twice = apply(passed, evolution(24), at("2026-10-06"));
    expect(twice.pet.stage).toBe(2);
    expect(twice.wallet.xu).toBe(100);
  });

  test("test answers pay no XP but count for the Vui run", () => {
    const state = run(initialGameState("2026-10-06"), [
      ["2026-10-06", { type: "QuestionAnswered", questionId: "q1", correct: true, source: "test" }],
      ["2026-10-06", { type: "QuestionAnswered", questionId: "q2", correct: true, source: "test" }],
      ["2026-10-06", solved("c1", { source: "test" })],
    ]);
    expect(state.pet.xp).toBe(0);
    expect(state.pet.vui).toBe(5);
    expect(state.progress.answeredQuestions).toEqual([]);
    expect(state.progress.solvedExercises).toEqual([]);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/game/apply.test.ts`
Expected: FAIL: chưa có `isPass` và các sự kiện mới.

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
  topicTest: 30,
} as const;

export const XU = {
  codeFirstSubmit: 5,
  noHintBonus: 3,
  persistenceBonus: 5,
  weekPlanMet: 50,
  weekPlanExceeded: 100,
  review: 10,
  reviewPerfect: 5,
  topicTestPassed: 20,
  evolution: 100,
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
/** A test is passed from this share of its points (spec 5.11; the parent can change it in M4). */
export const PASS_RATIO = 0.8;

/** True when `score` reaches PASS_RATIO of `max`. The tolerance keeps 11.2 of 14 a pass despite float rounding. */
export function isPass(score: number, max: number): boolean {
  return max > 0 && score >= max * PASS_RATIO - 1e-9;
}
```

`src/game/mastery.ts`: thay dòng `export type ResultSource = ...` bằng:

```ts
/** Where an answer was given. "test" is a topic or evolution test: it pays per test, not per answer. */
export type ResultSource = "lesson" | "review" | "practice" | "test";
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
  isPass,
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
  | { type: "TopicTestCompleted"; topicId: string; score: number; max: number; items: string[] }
  | {
      type: "EvolutionTestCompleted";
      /** The stage the test was for (1-based). */
      stage: number;
      score: number;
      max: number;
      items: string[];
      wrongConcepts: string[];
      /** The focused review set to open if the test is failed (built by the caller with buildRemedialSet). */
      remedialItems: string[];
    }
  | { type: "RemedialCompleted" }
  | { type: "HintShown"; exerciseId: string }
  | { type: "SolutionViewed"; exerciseId: string };

const ACTIVITY_EVENTS: ReadonlySet<GameEvent["type"]> = new Set([
  "LessonCompleted",
  "ExerciseJudged",
  "QuestionAnswered",
  "ReviewCompleted",
  "TopicTestCompleted",
  "EvolutionTestCompleted",
  "RemedialCompleted",
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
    case "TopicTestCompleted":
      completeTopicTest(next, event);
      break;
    case "EvolutionTestCompleted":
      completeEvolutionTest(next, event, now);
      break;
    case "RemedialCompleted":
      next.remedial = null;
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
  // A review station or a test pays as a whole (ReviewCompleted, TopicTestCompleted, EvolutionTestCompleted), not per
  // exercise, but its answers still count for the correct run that raises Vui.
  if (source === "review" || source === "test") {
    if (e.accepted && e.failedSubmitsBefore === 0 && e.hintsUsed === 0 && !e.viewedSolution) bumpCorrectRun(s);
    else s.pet.correctRun = 0;
    return;
  }
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
  if (source === "review" || source === "test") {
    // No XP for a review or test answer, but it counts for the correct run that raises Vui.
    if (e.correct) bumpCorrectRun(s);
    else s.pet.correctRun = 0;
    return;
  }
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

function raiseVui(s: GameState): void {
  s.pet.vui = Math.min(STAT_MAX, s.pet.vui + 1);
}

/** Spec 5.4-5.6: the first completion pays 30 XP; the first pass pays 20 xu and Vui +1. Any score moves the path on. */
function completeTopicTest(s: GameState, e: Extract<GameEvent, { type: "TopicTestCompleted" }>): void {
  const previous = s.progress.topicTests[e.topicId];
  const passed = isPass(e.score, e.max);
  s.progress.topicTests[e.topicId] = {
    attempts: (previous?.attempts ?? 0) + 1,
    best: Math.max(previous?.best ?? 0, e.score),
    max: e.max,
    passed: passed || (previous?.passed ?? false),
    lastItems: e.items,
  };
  if (!previous) s.pet.xp += XP.topicTest;
  if (passed && !previous?.passed) {
    s.wallet.xu += XU.topicTestPassed;
    raiseVui(s);
  }
}

/**
 * Spec 5.11. Passed: the robot evolves to the next stage, +100 xu, Vui +1; the growth bar starts again. Failed: nothing
 * is taken away, and the focused review set opens; the retake waits for it.
 */
function completeEvolutionTest(
  s: GameState,
  e: Extract<GameEvent, { type: "EvolutionTestCompleted" }>,
  now: Date,
): void {
  const passed = isPass(e.score, e.max);
  s.progress.evolutionTests.push({
    at: now.toISOString(),
    stage: e.stage,
    score: e.score,
    max: e.max,
    passed,
    items: e.items,
    wrongConcepts: e.wrongConcepts,
  });
  if (!passed) {
    s.remedial = e.remedialItems.length > 0 ? { stage: e.stage, items: e.remedialItems } : null;
    return;
  }
  s.remedial = null;
  // A second pass of the same stage changes nothing more.
  if (s.pet.stage !== e.stage) return;
  s.pet.stage += 1;
  s.pet.stageStartXp = s.pet.xp;
  s.wallet.xu += XU.evolution;
  raiseVui(s);
}
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/rewards.ts src/game/mastery.ts src/game/apply.ts src/game/apply.test.ts
git commit -m "feat(game): topic test and evolution events with rewards, focused review set and stage up

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Bản đồ có bài kiểm tra, "Học tiếp" ưu tiên bộ ôn tập

**Files:**
- Modify: `src/game/path.ts`, `src/game/progress.ts`, `src/ui/routing.ts`, `src/ui/MapScreen.tsx`, `src/ui/RoomScreen.tsx`, `src/ui/ResultView.tsx`, `src/i18n/vi.ts`, `src/i18n/en.ts`
- Test: `src/game/path.test.ts`, `src/ui/routing.test.ts`, `src/ui/MapScreen.test.tsx`, `src/ui/RoomScreen.test.tsx`

**Interfaces:**
- Consumes: `topicTestId`, `evolutionTestId` (Task 2); `XP.topicTest` (Task 4); `examBundle` (Task 3).
- Produces:
  - `PathNode` thêm `{ kind: "topicTest"; id; topicId }` và `{ kind: "evolution"; id; stageId; stage: number }` (`stage` tính từ 1); `hasTest(config)`; `type NextStep = { kind: "remedial" } | { kind: "node"; node: PathNode }`; `nextStep(bundle, state): NextStep | null`.
  - `progress.ts`: `stageXp(state)`; `stageXpMax` cộng 30 XP cho mỗi chủ đề có bài kiểm tra.
  - `Route` thêm `{ name: "topicTest"; topicId }` (`#/topic-test/<id>`), `{ name: "evolution"; stageId }` (`#/evolution/<id>`), `{ name: "remedial" }` (`#/remedial`); `stepRoute(step): Route`.
  - Khóa i18n `map.topicTest`, `map.evolution`, `result.vui`.

- [ ] **Step 1: Viết test thất bại**

`src/game/path.test.ts` (thay toàn bộ file):

```ts
import { describe, expect, test } from "vitest";
import { reviewBundle } from "../test/reviewBundle";
import { examBundle } from "../test/examBundle";
import { findNode, hasTest, nextNode, nextStep, nodeStatuses, pathNodes } from "./path";
import { stageXp, stageXpMax } from "./progress";
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

describe("tests on the path", () => {
  const exams = examBundle();

  function examState(lessons: string[]) {
    const state = initialGameState("2026-10-06");
    state.progress.completedLessons = lessons;
    return state;
  }

  test("a topic ends with its test and a stage with its evolution test", () => {
    expect(pathNodes(exams)).toEqual([
      { kind: "lesson", id: "x.l1", topicId: "x.t" },
      { kind: "lesson", id: "x.l2", topicId: "x.t" },
      { kind: "topicTest", id: "x.t.test", topicId: "x.t" },
      { kind: "evolution", id: "x.evolution", stageId: "x", stage: 1 },
    ]);
  });

  test("the topic test is done at any score; the evolution test only when passed", () => {
    const state = examState(["x.l1", "x.l2"]);
    expect(nextNode(exams, state)?.id).toBe("x.t.test");
    state.progress.topicTests["x.t"] = { attempts: 1, best: 2, max: 6, passed: false, lastItems: [] };
    expect(nextNode(exams, state)?.id).toBe("x.evolution");
    state.progress.evolutionTests.push({ at: "", stage: 1, score: 1, max: 7, passed: false, items: [], wrongConcepts: [] });
    expect(nextNode(exams, state)?.id).toBe("x.evolution");
    state.pet.stage = 2;
    expect(nextNode(exams, state)).toBeNull();
  });

  test("an open focused review set comes first", () => {
    const state = examState(["x.l1", "x.l2"]);
    expect(nextStep(exams, state)).toEqual({ kind: "node", node: { kind: "topicTest", id: "x.t.test", topicId: "x.t" } });
    state.remedial = { stage: 1, items: ["x.q1"] };
    expect(nextStep(exams, state)).toEqual({ kind: "remedial" });
  });

  test("a config of 0 items has no test", () => {
    expect(hasTest({ questions: 0, code: 0 })).toBe(false);
    expect(hasTest({ questions: 0, ai: 0, code: 1 })).toBe(true);
    expect(pathNodes(bundle).map((node) => node.kind)).not.toContain("topicTest");
  });

  test("stageXpMax adds 30 XP for each topic test", () => {
    expect(stageXpMax(exams.stages[0]!)).toBe(2 * 10 + 2 * 15 + 30);
  });

  test("stageXp counts from the start of the stage", () => {
    const state = examState([]);
    state.pet.xp = 150;
    state.pet.stageStartXp = 120;
    expect(stageXp(state)).toBe(30);
  });
});
```

`src/ui/routing.test.ts`: import thêm `stepRoute` từ `./routing`, rồi thêm trước `describe("isBrowserSupported"`:

```ts
describe("test routes", () => {
  test("parse and round-trip", () => {
    for (const route of [
      { name: "topicTest", topicId: "s1.lam-quen" },
      { name: "evolution", stageId: "s1" },
      { name: "remedial" },
    ] as const) {
      expect(parseHash(routeToHash(route))).toEqual(route);
    }
    expect(routeToHash({ name: "topicTest", topicId: "s1.a" })).toBe("#/topic-test/s1.a");
    expect(routeToHash({ name: "evolution", stageId: "s1" })).toBe("#/evolution/s1");
  });

  test("nodeRoute and stepRoute open tests and the focused review set", () => {
    expect(nodeRoute({ kind: "topicTest", id: "a.test", topicId: "a" })).toEqual({ name: "topicTest", topicId: "a" });
    expect(nodeRoute({ kind: "evolution", id: "s.evolution", stageId: "s", stage: 1 })).toEqual({
      name: "evolution",
      stageId: "s",
    });
    expect(stepRoute({ kind: "remedial" })).toEqual({ name: "remedial" });
  });
});
```

`src/ui/MapScreen.test.tsx`: thêm `import { examBundle } from "../test/examBundle";`, rồi thêm vào cuối file:

```tsx
test("shows the topic test after the lessons and the evolution test at the end of the stage", async () => {
  const state = initialGameState(TODAY);
  state.progress.completedLessons = ["x.l1", "x.l2"];
  await renderWithGame(<MapScreen />, { state, bundle: examBundle() });
  const items = screen.getAllByRole("listitem");
  expect(items.map((item) => item.textContent)).toEqual([
    "Bài x.l1Đã xong",
    "Bài x.l2Đã xong",
    "Kiểm tra chủ đềBài tiếp theo",
    "Kiểm tra tiến hóaChưa mở",
  ]);
  expect(within(items[2]!).getByRole("link", { name: "Kiểm tra chủ đề" })).toHaveAttribute(
    "href",
    "#/topic-test/x.t",
  );
});
```

`src/ui/RoomScreen.test.tsx`: thêm `import { examBundle } from "../test/examBundle";`, rồi thêm 2 test vào cuối `describe("RoomScreen")`:

```tsx
  test("an open focused review set comes first", async () => {
    const state = initialGameState(TODAY);
    state.progress.completedLessons = ["x.l1", "x.l2"];
    state.progress.topicTests["x.t"] = { attempts: 1, best: 2, max: 6, passed: false, lastItems: [] };
    state.remedial = { stage: 1, items: ["x.q1"] };
    await renderWithGame(<RoomScreen />, { state, bundle: examBundle() });
    expect(screen.getByRole("link", { name: "Học tiếp" })).toHaveAttribute("href", "#/remedial");
  });

  test("after the topic test comes the evolution test, and the growth counts only the XP of this stage", async () => {
    const state = initialGameState(TODAY);
    state.progress.completedLessons = ["x.l1", "x.l2"];
    state.progress.topicTests["x.t"] = { attempts: 1, best: 6, max: 6, passed: true, lastItems: [] };
    state.pet.xp = 500;
    state.pet.stageStartXp = 500;
    await renderWithGame(<RoomScreen />, { state, bundle: examBundle() });
    expect(screen.getByRole("link", { name: "Học tiếp" })).toHaveAttribute("href", "#/evolution/x");
    expect(screen.getByText("Lớn lên: 0%")).toBeInTheDocument();
  });
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/game/path.test.ts src/ui/routing.test.ts src/ui/MapScreen.test.tsx src/ui/RoomScreen.test.tsx`
Expected: FAIL: chưa có `hasTest`, `nextStep`, `stageXp`, `stepRoute`; bản đồ chưa có nút kiểm tra.

- [ ] **Step 3: Viết code**

`src/game/path.ts` (thay toàn bộ file):

```ts
import { evolutionTestId, topicTestId } from "../content/lookup";
import type { ContentBundle, EvolutionTestConfig, TopicTestConfig } from "../content/types";
import type { GameState } from "./state";

/**
 * A step of the learning map (spec 5.3): a lesson, a review station with the lessons it reviews, the test at the end
 * of a topic, or the evolution test at the end of a stage.
 */
export type PathNode =
  | { kind: "lesson"; id: string; topicId: string }
  | { kind: "review"; id: string; topicId: string; lessons: string[] }
  | { kind: "topicTest"; id: string; topicId: string }
  | { kind: "evolution"; id: string; stageId: string; stage: number };

export type NodeStatus = "done" | "next" | "locked";

/** What "Học tiếp" opens (spec 5.3): an open focused review set first, then the next node of the map. */
export type NextStep = { kind: "remedial" } | { kind: "node"; node: PathNode };

/** A test with no items in its config does not exist. */
export function hasTest(config: TopicTestConfig | EvolutionTestConfig): boolean {
  return config.questions + config.code > 0;
}

export function pathNodes(bundle: ContentBundle): PathNode[] {
  const nodes: PathNode[] = [];
  bundle.stages.forEach((stage, index) => {
    for (const topic of stage.topics) {
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
      if (hasTest(topic.test)) nodes.push({ kind: "topicTest", id: topicTestId(topic), topicId: topic.id });
    }
    if (hasTest(stage.evolution)) {
      nodes.push({ kind: "evolution", id: evolutionTestId(stage), stageId: stage.id, stage: index + 1 });
    }
  });
  return nodes;
}

export function isNodeDone(node: PathNode, state: GameState): boolean {
  switch (node.kind) {
    case "lesson":
      return state.progress.completedLessons.includes(node.id);
    case "review":
      return state.progress.completedReviews.includes(node.id);
    case "topicTest":
      return state.progress.topicTests[node.topicId] !== undefined;
    case "evolution":
      return state.pet.stage > node.stage;
  }
}

/** Done nodes, then the first node not done (next), then the rest (locked): a station or a test must be done to go on. */
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

export function nextStep(bundle: ContentBundle, state: GameState): NextStep | null {
  if (state.remedial !== null) return { kind: "remedial" };
  const node = nextNode(bundle, state);
  return node ? { kind: "node", node } : null;
}

export function findNode(bundle: ContentBundle, id: string): PathNode | undefined {
  return pathNodes(bundle).find((node) => node.id === id);
}
```

`src/game/progress.ts`: thêm `import { hasTest } from "./path";` sau dòng import `./rewards`, rồi thay chú thích và hàm `stageXpMax` bằng đoạn dưới đây (thêm hàm `stageXp` ngay trước `stageXpMax`):

```ts
/** The XP of the current stage: all XP minus the XP the robot had when the stage began. */
export function stageXp(state: GameState): number {
  return state.pet.xp - state.pet.stageStartXp;
}

/**
 * The XP a child can earn in a stage from lessons, their exercises, 1 perfect run of each review station and each topic
 * test.
 */
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
  const tests = stage.topics.filter((topic) => hasTest(topic.test)).length;
  return lessons + stations * (XP.review + XP.reviewPerCorrect * REVIEW_SIZE) + tests * XP.topicTest;
}
```

`src/ui/routing.ts` (thay toàn bộ file):

```ts
import { useCallback, useEffect, useState } from "react";
import type { NextStep, PathNode } from "../game/path";

export type Route =
  | { name: "home" }
  | { name: "map" }
  | { name: "backup" }
  | { name: "lesson"; lessonId: string }
  /** stationId null: a free review, for example to charge the robot. */
  | { name: "review"; stationId: string | null }
  | { name: "practice"; conceptId: string }
  | { name: "topicTest"; topicId: string }
  | { name: "evolution"; stageId: string }
  | { name: "remedial" };

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
  if (hash === "#/remedial") return { name: "remedial" };
  const match = /^#\/(lesson|review|practice|topic-test|evolution)\/(.+)$/.exec(hash);
  if (!match) return { name: "home" };
  const id = decode(match[2] as string);
  switch (match[1]) {
    case "lesson":
      return { name: "lesson", lessonId: id };
    case "review":
      return { name: "review", stationId: id };
    case "practice":
      return { name: "practice", conceptId: id };
    case "topic-test":
      return { name: "topicTest", topicId: id };
    default:
      return { name: "evolution", stageId: id };
  }
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case "lesson":
      return `#/lesson/${encodeURIComponent(route.lessonId)}`;
    case "review":
      return route.stationId === null ? "#/review" : `#/review/${encodeURIComponent(route.stationId)}`;
    case "practice":
      return `#/practice/${encodeURIComponent(route.conceptId)}`;
    case "topicTest":
      return `#/topic-test/${encodeURIComponent(route.topicId)}`;
    case "evolution":
      return `#/evolution/${encodeURIComponent(route.stageId)}`;
    case "remedial":
      return "#/remedial";
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
  switch (node.kind) {
    case "lesson":
      return { name: "lesson", lessonId: node.id };
    case "review":
      return { name: "review", stationId: node.id };
    case "topicTest":
      return { name: "topicTest", topicId: node.topicId };
    case "evolution":
      return { name: "evolution", stageId: node.stageId };
  }
}

/** The route that "Học tiếp" opens. */
export function stepRoute(step: NextStep): Route {
  return step.kind === "remedial" ? { name: "remedial" } : nodeRoute(step.node);
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
    if (node.kind === "lesson" && title) return pick(title, uiLang);
    if (node.kind === "topicTest") return t("map.topicTest");
    if (node.kind === "evolution") return t("map.evolution");
    return t("map.review");
  };
  const item = (node: PathNode) => {
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
                {nodes.filter((node) => node.kind !== "evolution" && node.topicId === topic.id).map(item)}
              </ol>
            </div>
          ))}
          <ol className="map-path">
            {nodes.filter((node) => node.kind === "evolution" && node.stageId === stage.id).map(item)}
          </ol>
        </section>
      ))}
      <a href="#/">{t("nav.room")}</a>
    </main>
  );
}
```

`src/ui/RoomScreen.tsx` (thay toàn bộ file):

```tsx
import { nextStep } from "../game/path";
import {
  currentStage,
  displayStreak,
  growthPercent,
  growthSize,
  petCondition,
  stageXp,
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
import { routeToHash, stepRoute } from "./routing";

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
  const next = nextStep(bundle, state);
  const xp = stageXp(state);
  const canReview = state.progress.completedLessons.length > 0;
  const recharge = condition === "drained" && canReview;
  // An empty battery wins over an empty joy: charging by review fixes the battery first.
  const message = condition === "drained" && state.pet.pin > 0 ? "pet.drainedVui" : (`pet.${condition}` as const);

  return (
    <main className="room">
      <h1>{t("room.title", { name: profile.robotName })}</h1>
      <p>{t("room.greeting", { child: profile.childName })}</p>
      <div className={`room-scene condition-${condition}`}>
        <Robot mood={CONDITION_MOOD[condition]} size={ROBOT_SIZES[growthSize(xp, max)]} />
        <p className="pet-says">{t(message, { name: profile.robotName })}</p>
      </div>
      <ul className="room-stats">
        <li>
          {t("room.pin")}: {state.pet.pin}/{STAT_MAX}
        </li>
        <li>
          {t("room.vui")}: {state.pet.vui}/{STAT_MAX}
        </li>
        <li>
          {t("room.growth")}: {growthPercent(xp, max)}%
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
        {recharge && (
          <a className="button primary" href={routeToHash({ name: "review", stationId: null })}>
            {t("room.recharge", { name: profile.robotName })}
          </a>
        )}
        {next ? (
          <a className={recharge ? "button" : "button primary"} href={routeToHash(stepRoute(next))}>
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

`src/ui/ResultView.tsx` (thay toàn bộ file):

```tsx
import { findConcept } from "../content/lookup";
import type { Concept } from "../content/types";
import { nextStep } from "../game/path";
import { displayStreak, todayPoints } from "../game/progress";
import { buildPracticeSet } from "../game/reviewSet";
import type { GameState } from "../game/state";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";
import { Robot } from "./Robot";
import { routeToHash, stepRoute } from "./routing";

export function ResultView({
  before,
  after,
  title,
  message,
  practiceConcepts = [],
  onExit,
}: {
  before: GameState;
  after: GameState;
  title: string;
  message: string;
  /** Concepts whose misconception card the child saw: each one with practice items gets a link (spec 5.9 step 2). */
  practiceConcepts?: string[];
  onExit(): void;
}) {
  const { t, uiLang } = useLang();
  const bundle = useContent();
  const { today } = useGame();
  const xp = after.pet.xp - before.pet.xp;
  const xu = after.wallet.xu - before.wallet.xu;
  const pin = after.pet.pin - before.pet.pin;
  const vui = after.pet.vui - before.pet.vui;
  const next = nextStep(bundle, after);
  const practice = practiceConcepts
    .map((id) => findConcept(bundle, id))
    .filter((concept): concept is Concept => concept !== undefined)
    .filter((concept) => buildPracticeSet(bundle, after, concept.id, Math.random).length > 0);
  return (
    <main className="lesson-done">
      <Robot mood="happy" size={96} />
      <h2>{title}</h2>
      <p>{message}</p>
      <ul className="result-rewards">
        {xp > 0 && <li>{t("result.xp", { n: xp })}</li>}
        {xu > 0 && <li>{t("result.xu", { n: xu })}</li>}
        {pin > 0 && <li>{t("result.pin", { n: pin })}</li>}
        {vui > 0 && <li>{t("result.vui", { n: vui })}</li>}
      </ul>
      <p>{t("room.today", { done: todayPoints(after, today), goal: after.settings.dailyGoal })}</p>
      <p>{t("room.streak", { days: displayStreak(after, today) })}</p>
      <nav className="room-actions">
        {next && (
          <a className="button primary" href={routeToHash(stepRoute(next))}>
            {t("room.continue")}
          </a>
        )}
        {practice.map((concept) => (
          <a key={concept.id} className="button" href={routeToHash({ name: "practice", conceptId: concept.id })}>
            {t("result.practice", { concept: pick(concept.name, uiLang) })}
          </a>
        ))}
        <button onClick={onExit}>{t("nav.room")}</button>
      </nav>
    </main>
  );
}
```

`src/i18n/vi.ts`: thêm trước `"map.review"`:

```ts
  "map.topicTest": "Kiểm tra chủ đề",
  "map.evolution": "Kiểm tra tiến hóa",
```

và sau `"result.pin"`:

```ts
  "result.vui": "Vui +{n}",
```

`src/i18n/en.ts`: cùng vị trí:

```ts
  "map.topicTest": "Topic test",
  "map.evolution": "Evolution test",
```

```ts
  "result.vui": "Joy +{n}",
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run && npm run typecheck`
Expected: PASS. Các test M3a của Phòng robot, bản đồ, bài học và trạm ôn vẫn qua (bộ nội dung mẫu cũ không có bài kiểm tra).

- [ ] **Step 5: Commit**

```bash
git add src/game/path.ts src/game/path.test.ts src/game/progress.ts src/ui/routing.ts src/ui/routing.test.ts src/ui/MapScreen.tsx src/ui/MapScreen.test.tsx src/ui/RoomScreen.tsx src/ui/RoomScreen.test.tsx src/ui/ResultView.tsx src/i18n/vi.ts src/i18n/en.ts
git commit -m "feat(map): topic and evolution tests on the path; Continue opens the focused review set first

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 6: Làm bài kiểm tra: câu hỏi, bài code và chuỗi câu

**Files:**
- Create: `src/ui/LangSwitch.tsx`, `src/ui/ExamCodeView.tsx`, `src/ui/ExamRunner.tsx`
- Modify: `src/ui/QuestionCard.tsx`, `src/i18n/vi.ts`, `src/i18n/en.ts`, `src/styles.css`
- Test: `src/ui/QuestionCard.test.tsx`, `src/ui/ExamRunner.test.tsx`

**Interfaces:**
- Consumes: `ExamItem`, `ExamAnswer` (Task 3); `ResultSource "test"` (Task 4); `examBundle` (Task 3).
- Produces:
  - `LangSwitch.tsx`: `showText(text, lang)`, `LangSwitch({ lang, onChange })`, `Prompt({ text, lang })` (tách từ `QuestionCard`, dùng chung với `ExamCodeView`).
  - `QuestionCard` có prop `exam?: boolean`: nút "Chọn đáp án này", không tô đúng/sai, không giải thích, chỉ báo "Đã ghi nhận câu trả lời".
  - `ExamCodeView({ exercise, onSubmitted({ result, code }) })`: "Chạy thử" với input của con, "Nộp bài" 1 lần, không gợi ý, không lời giải.
  - `ExamRunner({ title, items, onFinish(answers: (ExamAnswer | undefined)[]) })`; `formatScore(score, lang)`.
  - Khóa i18n `exam.*` (13 khóa), `evolution.*` (7 khóa), `remedial.*` (3 khóa); Task 7 và Task 8 dùng các khóa `evolution.*` và `remedial.*`.

- [ ] **Step 1: Viết test thất bại**

`src/ui/QuestionCard.test.tsx`: thêm vào cuối file:

```tsx
describe("QuestionCard in a test", () => {
  test("records the answer without marks or explanation", async () => {
    const onAnswered = vi.fn();
    renderWithApp(<QuestionCard question={fixtureQuestion} onAnswered={onAnswered} exam />);
    expect(screen.queryByRole("button", { name: "Kiểm tra" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("radio", { name: "Lỗi" }));
    await userEvent.click(screen.getByRole("button", { name: "Chọn đáp án này" }));
    expect(onAnswered).toHaveBeenCalledWith(false, { choiceIndex: 1, lang: "vi" });
    expect(screen.getByText("Đã ghi nhận câu trả lời. Kết quả hiện ở cuối bài.")).toBeInTheDocument();
    expect(screen.queryByText("Chưa đúng rồi.")).not.toBeInTheDocument();
    expect(screen.queryByText("Lệnh print in ra A.")).not.toBeInTheDocument();
    expect(document.querySelector(".choice-wrong, .choice-correct")).toBeNull();
    expect(screen.getByRole("radio", { name: "Lỗi" })).toBeDisabled();
  });
});
```

`src/ui/ExamRunner.test.tsx`:

```tsx
// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { findItem } from "../content/lookup";
import type { ExamItem } from "../game/exam";
import { initialGameState } from "../game/state";
import { examBundle } from "../test/examBundle";
import { fakeRunner, okResult } from "../test/render";
import { renderWithGame, TODAY } from "../test/renderGame";
import { ExamRunner, formatScore } from "./ExamRunner";

const bundle = examBundle();
const items = ["x.q1", "x.l1.ex1"].map((id) => findItem(bundle, id) as ExamItem);

describe("formatScore", () => {
  test("writes at most 1 decimal, with a comma in Vietnamese", () => {
    expect(formatScore(19, "vi")).toBe("19");
    expect(formatScore(19.25, "vi")).toBe("19,3");
    expect(formatScore(19.25, "en")).toBe("19.3");
  });
});

describe("ExamRunner", () => {
  test("1 item per card; the answers are recorded as test answers and handed in at the end", async () => {
    const onFinish = vi.fn();
    const runner = fakeRunner(() => okResult("Hi\n"));
    const { store } = await renderWithGame(<ExamRunner title="Đề thử" items={items} onFinish={onFinish} />, {
      bundle,
      runner,
      state: initialGameState(TODAY),
    });
    expect(screen.getByRole("heading", { name: "Đề thử" })).toBeInTheDocument();
    expect(screen.getByText("Câu 1/2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tiếp" })).toBeDisabled();
    await userEvent.click(screen.getByRole("radio", { name: "Sai" }));
    await userEvent.click(screen.getByRole("button", { name: "Chọn đáp án này" }));
    await userEvent.click(screen.getByRole("button", { name: "Tiếp" }));

    expect(screen.getByText("In ra Hi (x.l1.ex1)")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /gợi ý/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nộp bài kiểm tra" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Nộp bài" }));
    expect(await screen.findByText("Đã nộp bài. Kết quả hiện ở cuối bài.")).toBeInTheDocument();
    expect(screen.queryByText("Chính xác!")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nộp bài" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Nộp bài kiểm tra" }));

    expect(onFinish).toHaveBeenCalledWith([
      { kind: "choice", correct: false },
      { kind: "code", passed: 2, total: 2 },
    ]);
    await waitFor(async () => expect(Object.keys((await store.loadActive())!.state.mastery)).toContain("k1"));
    const saved = (await store.loadActive())!.state;
    expect(saved.pet.xp).toBe(0);
    expect(saved.wallet.xu).toBe(0);
    expect(saved.progress.answeredQuestions).toEqual([]);
  });

  test("an empty paper says so and can still be handed in", async () => {
    const onFinish = vi.fn();
    await renderWithGame(<ExamRunner title="Đề trống" items={[]} onFinish={onFinish} />, { bundle });
    expect(screen.getByText("Chưa có câu hỏi cho bài kiểm tra này.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Nộp bài kiểm tra" }));
    expect(onFinish).toHaveBeenCalledWith([]);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/ui/QuestionCard.test.tsx src/ui/ExamRunner.test.tsx`
Expected: FAIL: không có nút "Chọn đáp án này", chưa có `./ExamRunner`.

- [ ] **Step 3: Viết code**

`src/ui/LangSwitch.tsx`:

```tsx
import type { LocalizedText } from "../content/types";
import { pick, pickBoth, type QuestionLang } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";

const LANG_BUTTONS = [
  { lang: "vi", label: "question.langVi" },
  { lang: "en", label: "question.langEn" },
  { lang: "both", label: "question.langBoth" },
] as const;

/** A question text in the chosen language, or both languages side by side. */
export function showText(text: LocalizedText, lang: QuestionLang): string {
  return lang === "both" ? pickBoth(text) : pick(text, lang);
}

/** The VI / EN / VI + EN buttons of 1 question (spec 7.2). */
export function LangSwitch({ lang, onChange }: { lang: QuestionLang; onChange(lang: QuestionLang): void }) {
  const { t } = useLang();
  return (
    <div role="group" aria-label={t("question.lang")} className="lang-switch">
      {LANG_BUTTONS.map((button) => (
        <button key={button.lang} aria-pressed={lang === button.lang} onClick={() => onChange(button.lang)}>
          {t(button.label)}
        </button>
      ))}
    </div>
  );
}

/** A prompt in the chosen language; "both" shows the 2 versions as 2 paragraphs. */
export function Prompt({ text, lang }: { text: LocalizedText; lang: QuestionLang }) {
  if (lang !== "both") return <p className="question-prompt">{pick(text, lang)}</p>;
  return (
    <>
      <p className="question-prompt">{text.vi}</p>
      {text.en && (
        <p className="question-prompt" lang="en">
          {text.en}
        </p>
      )}
    </>
  );
}
```

`src/ui/QuestionCard.tsx` (thay toàn bộ file):

```tsx
import { useState } from "react";
import type { ChoiceQuestion } from "../content/types";
import type { QuestionLang } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { LangSwitch, Prompt, showText } from "./LangSwitch";
import { RobotBubble } from "./RobotBubble";

/**
 * 1 predict/mcq question. In a test (`exam`), the answer is only recorded: no right/wrong marks and no explanation
 * until the end (spec 8.2.4).
 */
export function QuestionCard({
  question,
  onAnswered,
  exam = false,
}: {
  question: ChoiceQuestion;
  onAnswered(correct: boolean, detail: { choiceIndex: number; lang: QuestionLang }): void;
  exam?: boolean;
}) {
  const { t, questionLang } = useLang();
  const [lang, setLang] = useState<QuestionLang>(questionLang);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const correctIndex = question.choices.findIndex((choice) => choice.correct);
  const isCorrect = selected === correctIndex;

  function check() {
    if (selected === null) return;
    setChecked(true);
    onAnswered(isCorrect, { choiceIndex: selected, lang });
  }

  function choiceClass(i: number): string {
    if (!checked || exam) return "choice";
    if (i === correctIndex) return "choice choice-correct";
    if (i === selected) return "choice choice-wrong";
    return "choice";
  }

  return (
    <div className="question-card">
      <LangSwitch lang={lang} onChange={setLang} />
      <Prompt text={question.prompt} lang={lang} />
      {question.code && (
        <pre className="code-block">
          <code>{question.code.trimEnd()}</code>
        </pre>
      )}
      <fieldset disabled={checked}>
        <legend className="sr-only">{t("question.choices")}</legend>
        {question.choices.map((choice, i) => (
          <label key={i} className={choiceClass(i)}>
            <input type="radio" name={question.id} checked={selected === i} onChange={() => setSelected(i)} />
            <span className={question.type === "predict" ? "choice-text code" : "choice-text"}>{showText(choice.text, lang)}</span>
          </label>
        ))}
      </fieldset>
      {!checked && (
        <button className="primary" disabled={selected === null} onClick={check}>
          {t(exam ? "exam.choose" : "question.check")}
        </button>
      )}
      {checked && exam && <p className="exam-answered">{t("exam.answered")}</p>}
      {checked && !exam && (
        <RobotBubble
          mood={isCorrect ? "happy" : "sad"}
          message={isCorrect ? t("question.correct") : t("question.incorrect")}
          hint={showText(question.explanation, lang)}
        />
      )}
    </div>
  );
}
```

`src/ui/ExamCodeView.tsx`:

```tsx
import { useState } from "react";
import type { CodeExercise } from "../content/types";
import type { QuestionLang } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { judge, type JudgeResult } from "../runner/judge";
import { CodeEditor } from "./CodeEditor";
import { useRunner } from "./contexts";
import { LangSwitch, Prompt } from "./LangSwitch";
import { OutputPanel } from "./OutputPanel";

/**
 * A code exercise in a test: the child may run the code with their own input, then submits once. The result stays
 * hidden until the end of the test; no hints, no solution, no lesson draft.
 */
export function ExamCodeView({
  exercise,
  onSubmitted,
}: {
  exercise: CodeExercise;
  onSubmitted(info: { result: JudgeResult; code: string }): void;
}) {
  const { t, questionLang } = useLang();
  const runner = useRunner();
  const example = exercise.tests.find((test) => !test.hidden) ?? null;
  const [lang, setLang] = useState<QuestionLang>(questionLang);
  const [code, setCode] = useState(exercise.starter);
  const [stdin, setStdin] = useState(example?.input ?? "");
  const [output, setOutput] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleRun() {
    setBusy(true);
    setFailed(false);
    try {
      setOutput((await runner.run(code, stdin)).stdout);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit() {
    setBusy(true);
    setFailed(false);
    try {
      const result = await judge(exercise, code, runner.run);
      setSubmitted(true);
      onSubmitted({ result, code });
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  const disabled = busy || submitted || runner.status !== "ready";
  return (
    <div className="exercise-split">
      <section className="exercise-left">
        <LangSwitch lang={lang} onChange={setLang} />
        <Prompt text={exercise.prompt} lang={lang} />
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
      </section>
      <section className="exercise-right">
        <CodeEditor value={code} onChange={setCode} errorLine={null} ariaLabel={t("code.editorLabel")} />
        <label className="input-label">
          {t("code.inputLabel")}
          <textarea value={stdin} onChange={(event) => setStdin(event.target.value)} rows={3} />
        </label>
        <div className="exercise-actions">
          <button onClick={handleRun} disabled={disabled}>
            {t("code.run")}
          </button>
          <button className="primary" onClick={handleSubmit} disabled={disabled}>
            {t("code.submit")}
          </button>
        </div>
        {busy && <p>{t("code.running")}</p>}
        {failed && <p role="alert">{t("app.crash")}</p>}
        {output !== null && <OutputPanel stdout={output} />}
        {submitted && <p className="exam-answered">{t("exam.submitted")}</p>}
      </section>
    </div>
  );
}
```

`src/ui/ExamRunner.tsx`:

```tsx
import { useState } from "react";
import { findConcept } from "../content/lookup";
import { isChoiceQuestion } from "../content/types";
import type { ExamAnswer, ExamItem } from "../game/exam";
import type { Lang } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { ExamCodeView } from "./ExamCodeView";
import { useGame } from "./GameProvider";
import { QuestionCard } from "./QuestionCard";

/** A score with at most 1 decimal, written the way the language writes decimals (19,2 in Vietnamese). */
export function formatScore(score: number, lang: Lang): string {
  const text = Number.isInteger(score) ? String(score) : score.toFixed(1);
  return lang === "vi" ? text.replace(".", ",") : text;
}

/**
 * The items of a test, 1 per card (spec 8.2.4). Each answer is recorded at once (mastery, Leitner, attempt history)
 * with the source "test", which pays nothing per item; the results appear only after the last item.
 */
export function ExamRunner({
  title,
  items,
  onFinish,
}: {
  title: string;
  items: ExamItem[];
  onFinish(answers: (ExamAnswer | undefined)[]): void;
}) {
  const { t } = useLang();
  const game = useGame();
  const bundle = useContent();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(ExamAnswer | undefined)[]>(() => items.map(() => undefined));
  const item: ExamItem | undefined = items[index];
  const isLast = index >= items.length - 1;
  const record = (answer: ExamAnswer) =>
    setAnswers((current) => current.map((old, i) => (i === index && old === undefined ? answer : old)));

  let body;
  if (!item) {
    body = <p>{t("exam.empty")}</p>;
  } else if (isChoiceQuestion(item)) {
    body = (
      <QuestionCard
        key={item.id}
        question={item}
        exam
        onAnswered={(correct, detail) => {
          game.dispatch(
            {
              type: "QuestionAnswered",
              questionId: item.id,
              correct,
              concepts: item.concepts,
              misconception: item.choices[detail.choiceIndex]?.misconception ?? null,
              source: "test",
            },
            { kind: "choice", itemId: item.id, choiceIndex: detail.choiceIndex, correct, lang: detail.lang },
          );
          record({ kind: "choice", correct });
        }}
      />
    );
  } else {
    body = (
      <ExamCodeView
        key={item.id}
        exercise={item}
        onSubmitted={({ result, code }) => {
          const misconceptions = result.misconceptions.filter((id) => findConcept(bundle, id) !== undefined);
          game.dispatch(
            {
              type: "ExerciseJudged",
              exerciseId: item.id,
              accepted: result.status === "accepted",
              failedSubmitsBefore: 0,
              hintsUsed: 0,
              viewedSolution: false,
              concepts: item.concepts,
              misconceptions,
              source: "test",
            },
            {
              kind: "code",
              itemId: item.id,
              code,
              status: result.status,
              passedCount: result.passedCount,
              total: result.total,
              misconceptions,
            },
          );
          record({ kind: "code", passed: result.passedCount, total: result.total });
        }}
      />
    );
  }

  return (
    <main className="lesson">
      <div className="lesson-top">
        <h1>{title}</h1>
        {item && <span>{t("review.itemOf", { current: index + 1, total: items.length })}</span>}
      </div>
      {body}
      <nav className="lesson-nav">
        <button
          className="primary"
          disabled={item !== undefined && answers[index] === undefined}
          onClick={() => (isLast ? onFinish(answers) : setIndex(index + 1))}
        >
          {isLast ? t("exam.finish") : t("lesson.next")}
        </button>
      </nav>
    </main>
  );
}
```

`src/i18n/vi.ts`: thêm sau `"practice.notFound"`:

```ts
  "exam.choose": "Chọn đáp án này",
  "exam.answered": "Đã ghi nhận câu trả lời. Kết quả hiện ở cuối bài.",
  "exam.submitted": "Đã nộp bài. Kết quả hiện ở cuối bài.",
  "exam.finish": "Nộp bài kiểm tra",
  "exam.topicTitle": "Kiểm tra chủ đề: {topic}",
  "exam.evolutionTitle": "Kiểm tra tiến hóa",
  "exam.topicDone": "Xong bài kiểm tra!",
  "exam.score": "Con được {score}/{max} điểm.",
  "exam.passed": "Con đã đạt!",
  "exam.notPassed": "Lần này chưa đạt 80%, con ôn thêm nhé.",
  "exam.locked": "Bài kiểm tra này chưa mở. Con học các bài trước đã nhé.",
  "exam.notFound": "Không tìm thấy bài kiểm tra này.",
  "exam.empty": "Chưa có câu hỏi cho bài kiểm tra này.",
  "evolution.title": "{name} đã tiến hóa!",
  "evolution.body": "{name} lớn hơn và giỏi hơn nhờ con chăm học.",
  "evolution.failTitle": "Lần này chưa đạt",
  "evolution.failBody": "Không sao cả! Con ôn lại các phần dưới đây rồi thi lại nhé.",
  "evolution.weakTitle": "Phần cần ôn",
  "evolution.startRemedial": "Bắt đầu ôn tập trọng tâm",
  "evolution.remedialFirst": "Con làm xong bộ ôn tập trọng tâm trước rồi thi lại nhé.",
  "remedial.title": "Ôn tập trọng tâm",
  "remedial.doneTitle": "Xong ôn tập trọng tâm! Con có thể thi lại.",
  "remedial.none": "Con không có bộ ôn tập trọng tâm nào.",
```

`src/i18n/en.ts`: thêm sau `"practice.notFound"`:

```ts
  "exam.choose": "Choose this answer",
  "exam.answered": "Your answer is saved. You see the results at the end.",
  "exam.submitted": "Your code is submitted. You see the results at the end.",
  "exam.finish": "Finish the test",
  "exam.topicTitle": "Topic test: {topic}",
  "exam.evolutionTitle": "Evolution test",
  "exam.topicDone": "Test finished!",
  "exam.score": "You got {score} of {max} points.",
  "exam.passed": "You passed!",
  "exam.notPassed": "You did not reach 80% this time. Let us review a little more.",
  "exam.locked": "This test is not open yet. Finish the lessons before it first.",
  "exam.notFound": "This test does not exist.",
  "exam.empty": "This test has no questions yet.",
  "evolution.title": "{name} has evolved!",
  "evolution.body": "{name} is bigger and smarter because you study hard.",
  "evolution.failTitle": "Not passed this time",
  "evolution.failBody": "That is OK! Review the parts below, then take the test again.",
  "evolution.weakTitle": "Parts to review",
  "evolution.startRemedial": "Start the focused review",
  "evolution.remedialFirst": "Finish the focused review first, then take the test again.",
  "remedial.title": "Focused review",
  "remedial.doneTitle": "Focused review done! You can take the test again.",
  "remedial.none": "You have no focused review.",
```

`src/styles.css`: thêm vào cuối file:

```css

/* M3b: tests and evolution */
.exam-answered { color: var(--muted); font-style: italic; }
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run && npm run typecheck`
Expected: PASS (gồm test cùng khóa vi/en và các test cũ của `QuestionCard`).

- [ ] **Step 5: Commit**

```bash
git add src/ui/LangSwitch.tsx src/ui/QuestionCard.tsx src/ui/QuestionCard.test.tsx src/ui/ExamCodeView.tsx src/ui/ExamRunner.tsx src/ui/ExamRunner.test.tsx src/i18n/vi.ts src/i18n/en.ts src/styles.css
git commit -m "feat(ui): test runner with recorded answers, hidden marks and one code submit

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Màn hình kiểm tra chủ đề và bộ ôn tập trọng tâm

**Files:**
- Create: `src/ui/TopicTestScreen.tsx`, `src/ui/RemedialScreen.tsx`, `src/test/answerExam.ts`
- Test: `src/ui/TopicTestScreen.test.tsx`, `src/ui/RemedialScreen.test.tsx`

**Interfaces:**
- Consumes: `drawTopicTest`, `gradePaper` (Task 3); `TopicTestCompleted`, `RemedialCompleted`, `isPass` (Task 4); `ResultView` với `practiceConcepts` (M3a); `SessionScreen` (M3a); `ExamRunner`, `formatScore` (Task 6).
- Produces:
  - `TopicTestScreen({ topic, onExit, rng? })`: rút đề tránh `lastItems`, chấm, gửi `TopicTestCompleted`, rồi hiện `ResultView` với điểm, đạt/chưa đạt và "Luyện thêm" cho khái niệm sai.
  - `RemedialScreen({ onExit })`: `SessionScreen` trên `state.remedial.items` (nguồn `"practice"`); xong thì gửi `RemedialCompleted`. Không có bộ ôn tập thì báo `remedial.none`.
  - `answerPaper(choice)` (test): trả lời hết 1 đề trong jsdom.

- [ ] **Step 1: Viết test thất bại**

`src/test/answerExam.ts`:

```ts
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/**
 * Answers every item of the open test paper: each question with the choice `choice` (in the exam bundles "Đúng" is
 * right and "Sai" is wrong), each code exercise with 1 submit of the starter code. Then hands the paper in.
 */
export async function answerPaper(choice: "Đúng" | "Sai") {
  for (;;) {
    const radio = screen.queryByRole("radio", { name: choice });
    if (radio) {
      await userEvent.click(radio);
      await userEvent.click(screen.getByRole("button", { name: "Chọn đáp án này" }));
    } else {
      await userEvent.click(screen.getByRole("button", { name: "Nộp bài" }));
      await screen.findByText("Đã nộp bài. Kết quả hiện ở cuối bài.");
    }
    const finish = screen.queryByRole("button", { name: "Nộp bài kiểm tra" });
    if (finish) {
      await userEvent.click(finish);
      return;
    }
    await userEvent.click(screen.getByRole("button", { name: "Tiếp" }));
  }
}
```

`src/ui/TopicTestScreen.test.tsx`:

```tsx
// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { seededRng } from "../game/random";
import { initialGameState } from "../game/state";
import { answerPaper } from "../test/answerExam";
import { examBundle } from "../test/examBundle";
import { fakeRunner, okResult } from "../test/render";
import { renderWithGame, TODAY } from "../test/renderGame";
import { TopicTestScreen } from "./TopicTestScreen";

const bundle = examBundle();
const topic = bundle.stages[0]!.topics[0]!;

function studied() {
  const state = initialGameState(TODAY);
  state.progress.completedLessons = ["x.l1", "x.l2"];
  return state;
}

describe("TopicTestScreen", () => {
  test("a full score passes: XP, xu and the record", async () => {
    const { store } = await renderWithGame(<TopicTestScreen topic={topic} onExit={() => {}} rng={seededRng(1)} />, {
      bundle,
      runner: fakeRunner(() => okResult("Hi\n")),
      state: studied(),
    });
    expect(screen.getByRole("heading", { name: "Kiểm tra chủ đề: Chủ đề thi" })).toBeInTheDocument();
    expect(screen.getByText("Câu 1/4")).toBeInTheDocument();
    await answerPaper("Đúng");

    expect(screen.getByRole("heading", { name: "Xong bài kiểm tra!" })).toBeInTheDocument();
    expect(screen.getByText("Con được 6/6 điểm. Con đã đạt!")).toBeInTheDocument();
    expect(screen.getByText("+30 XP")).toBeInTheDocument();
    expect(screen.getByText("+20 xu")).toBeInTheDocument();
    await waitFor(async () =>
      expect((await store.loadActive())!.state.progress.topicTests["x.t"]).toMatchObject({
        attempts: 1,
        best: 6,
        max: 6,
        passed: true,
      }),
    );
  });

  test("a low score is not passed but the test is done, with practice for the weak concepts", async () => {
    const { store } = await renderWithGame(<TopicTestScreen topic={topic} onExit={() => {}} rng={seededRng(1)} />, {
      bundle,
      runner: fakeRunner(() => okResult("Ho\n")),
      state: studied(),
    });
    await answerPaper("Sai");
    expect(screen.getByText("Con được 0/6 điểm. Lần này chưa đạt 80%, con ôn thêm nhé.")).toBeInTheDocument();
    expect(screen.getByText("+30 XP")).toBeInTheDocument();
    expect(screen.queryByText(/xu$/)).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /^Luyện thêm: Khái niệm k[12]$/ }).length).toBeGreaterThan(0);
    await waitFor(async () =>
      expect((await store.loadActive())!.state.progress.topicTests["x.t"]).toMatchObject({ passed: false }),
    );
  });
});
```

`src/ui/RemedialScreen.test.tsx`:

```tsx
// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { initialGameState } from "../game/state";
import { examBundle } from "../test/examBundle";
import { renderWithGame, TODAY } from "../test/renderGame";
import { RemedialScreen } from "./RemedialScreen";

const bundle = examBundle();

describe("RemedialScreen", () => {
  test("without a focused review set it says so", async () => {
    await renderWithGame(<RemedialScreen onExit={() => {}} />, { bundle });
    expect(screen.getByText("Con không có bộ ôn tập trọng tâm nào.")).toBeInTheDocument();
  });

  test("finishing the set closes it", async () => {
    const state = initialGameState(TODAY);
    state.progress.completedLessons = ["x.l1", "x.l2"];
    state.remedial = { stage: 1, items: ["x.q1", "x.q3"] };
    const { store } = await renderWithGame(<RemedialScreen onExit={() => {}} />, { bundle, state });
    expect(screen.getByRole("heading", { name: "Ôn tập trọng tâm" })).toBeInTheDocument();
    for (const last of [false, true]) {
      await userEvent.click(screen.getByRole("radio", { name: "Đúng" }));
      await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
      await userEvent.click(screen.getByRole("button", { name: last ? "Hoàn thành" : "Tiếp" }));
    }
    expect(screen.getByRole("heading", { name: "Xong ôn tập trọng tâm! Con có thể thi lại." })).toBeInTheDocument();
    await waitFor(async () => expect((await store.loadActive())!.state.remedial).toBeNull());
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/ui/TopicTestScreen.test.tsx src/ui/RemedialScreen.test.tsx`
Expected: FAIL: chưa có `./TopicTestScreen` và `./RemedialScreen`.

- [ ] **Step 3: Viết code**

`src/ui/TopicTestScreen.tsx`:

```tsx
import { useState } from "react";
import type { Topic } from "../content/types";
import { drawTopicTest, gradePaper, type ExamGrade } from "../game/exam";
import type { Rng } from "../game/random";
import { isPass } from "../game/rewards";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { ExamRunner, formatScore } from "./ExamRunner";
import { useGame } from "./GameProvider";
import { ResultView } from "./ResultView";

/** The test at the end of a topic (spec 5.3): any score moves the path on; the weak concepts get practice links. */
export function TopicTestScreen({ topic, onExit, rng = Math.random }: { topic: Topic; onExit(): void; rng?: Rng }) {
  const { t, uiLang } = useLang();
  const game = useGame();
  const [before] = useState(() => game.state);
  const [items] = useState(() => drawTopicTest(topic, game.state.progress.topicTests[topic.id]?.lastItems ?? [], rng));
  const [grade, setGrade] = useState<ExamGrade | null>(null);

  if (grade) {
    const verdict = t(isPass(grade.score, grade.max) ? "exam.passed" : "exam.notPassed");
    return (
      <ResultView
        before={before}
        after={game.state}
        title={t("exam.topicDone")}
        message={`${t("exam.score", { score: formatScore(grade.score, uiLang), max: grade.max })} ${verdict}`}
        practiceConcepts={grade.wrongConcepts}
        onExit={onExit}
      />
    );
  }
  return (
    <ExamRunner
      title={t("exam.topicTitle", { topic: pick(topic.title, uiLang) })}
      items={items}
      onFinish={(answers) => {
        const result = gradePaper(items, answers);
        game.dispatch({
          type: "TopicTestCompleted",
          topicId: topic.id,
          score: result.score,
          max: result.max,
          items: items.map((item) => item.id),
        });
        setGrade(result);
      }}
    />
  );
}
```

`src/ui/RemedialScreen.tsx`:

```tsx
import { useState } from "react";
import { findItem } from "../content/lookup";
import type { Exercise } from "../content/types";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";
import { SessionScreen } from "./SessionScreen";

/** The focused review set of a failed evolution test (spec 5.11). Finishing it opens the retake. */
export function RemedialScreen({ onExit }: { onExit(): void }) {
  const { t } = useLang();
  const bundle = useContent();
  const game = useGame();
  const [items] = useState(() =>
    (game.state.remedial?.items ?? [])
      .map((id) => findItem(bundle, id))
      .filter((item): item is Exercise => item !== undefined),
  );
  const [open] = useState(() => game.state.remedial !== null);

  if (!open) {
    return (
      <main className="room">
        <p>{t("remedial.none")}</p>
        <a href="#/">{t("nav.room")}</a>
      </main>
    );
  }
  return (
    <SessionScreen
      title={t("remedial.title")}
      items={items}
      source="practice"
      doneTitle={t("remedial.doneTitle")}
      onFinish={() => game.dispatch({ type: "RemedialCompleted" })}
      onExit={onExit}
    />
  );
}
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/TopicTestScreen.tsx src/ui/TopicTestScreen.test.tsx src/ui/RemedialScreen.tsx src/ui/RemedialScreen.test.tsx src/test/answerExam.ts
git commit -m "feat(ui): topic test screen and focused review set screen

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Kiểm tra tiến hóa và đường dẫn

**Files:**
- Create: `src/ui/EvolutionTestScreen.tsx`
- Modify: `src/ui/AppRoutes.tsx`, `src/styles.css`
- Test: `src/ui/EvolutionTestScreen.test.tsx`, `src/ui/AppRoutes.test.tsx`

**Interfaces:**
- Consumes: `drawEvolutionTest`, `gradePaper`, `buildRemedialSet` (Task 3); `EvolutionTestCompleted`, `isPass` (Task 4); `findNode`, `nodeStatuses`, `nextStep`, `stepRoute`, các route mới (Task 5); `ExamRunner`, `formatScore` (Task 6); `TopicTestScreen`, `RemedialScreen`, `answerPaper` (Task 7).
- Produces:
  - `EvolutionTestScreen({ stage, stageNumber, onExit, rng? })`: khi mở, nếu còn bộ ôn tập trọng tâm thì chỉ hiện lời nhắc và link "Bắt đầu ôn tập trọng tâm" (kiểm tra 1 lần lúc mở). Đạt: màn hình chúc mừng (robot 200 px với hiệu ứng `.evolve`, điểm, xu, Vui, "Học tiếp"). Chưa đạt: điểm, danh sách khái niệm cần ôn, link `#/remedial`.
  - `AppRoutes` mở `topicTest`, `evolution`, `remedial`; ID không có hoặc không phải bài kiểm tra thì báo `exam.notFound`; nút còn khóa thì báo `exam.locked`.

- [ ] **Step 1: Viết test thất bại**

`src/ui/EvolutionTestScreen.test.tsx`:

```tsx
// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { seededRng } from "../game/random";
import { initialGameState } from "../game/state";
import { answerPaper } from "../test/answerExam";
import { examBundle } from "../test/examBundle";
import { fakeRunner, okResult } from "../test/render";
import { renderWithGame, TODAY } from "../test/renderGame";
import { EvolutionTestScreen } from "./EvolutionTestScreen";

const bundle = examBundle();
const stage = bundle.stages[0]!;

function ready() {
  const state = initialGameState(TODAY);
  state.progress.completedLessons = ["x.l1", "x.l2"];
  state.progress.topicTests["x.t"] = { attempts: 1, best: 6, max: 6, passed: true, lastItems: [] };
  return state;
}

describe("EvolutionTestScreen", () => {
  test("a pass evolves the robot", async () => {
    const { store } = await renderWithGame(
      <EvolutionTestScreen stage={stage} stageNumber={1} onExit={() => {}} rng={seededRng(3)} />,
      { bundle, runner: fakeRunner(() => okResult("Hi\n")), state: ready() },
    );
    expect(screen.getByRole("heading", { name: "Kiểm tra tiến hóa" })).toBeInTheDocument();
    expect(screen.getByText("Câu 1/5")).toBeInTheDocument();
    await answerPaper("Đúng");

    expect(screen.getByRole("heading", { name: "Robo đã tiến hóa!" })).toBeInTheDocument();
    expect(screen.getByText("Con được 7/7 điểm.")).toBeInTheDocument();
    expect(screen.getByText("+100 xu")).toBeInTheDocument();
    await waitFor(async () => expect((await store.loadActive())!.state.pet.stage).toBe(2));
    expect((await store.loadActive())!.state.remedial).toBeNull();
  });

  test("a fail lists the weak concepts and opens the focused review set", async () => {
    const { store } = await renderWithGame(
      <EvolutionTestScreen stage={stage} stageNumber={1} onExit={() => {}} rng={seededRng(3)} />,
      { bundle, runner: fakeRunner(() => okResult("Ho\n")), state: ready() },
    );
    await answerPaper("Sai");

    expect(screen.getByRole("heading", { name: "Lần này chưa đạt" })).toBeInTheDocument();
    expect(screen.getByText("Con được 0/7 điểm.")).toBeInTheDocument();
    expect(screen.getByText("Khái niệm k1")).toBeInTheDocument();
    expect(screen.getByText("Khái niệm a1")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Bắt đầu ôn tập trọng tâm" })).toHaveAttribute("href", "#/remedial");
    await waitFor(async () => expect((await store.loadActive())!.state.remedial).not.toBeNull());
    const saved = (await store.loadActive())!.state;
    expect(saved.pet.stage).toBe(1);
    expect(saved.progress.evolutionTests).toHaveLength(1);
  });
});
```

`src/ui/AppRoutes.test.tsx`: thêm các import

```tsx
import { answerPaper } from "../test/answerExam";
import { examBundle } from "../test/examBundle";
import { fakeRunner, okResult } from "../test/render";
```

rồi thêm vào cuối file:

```tsx
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
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/ui/EvolutionTestScreen.test.tsx src/ui/AppRoutes.test.tsx`
Expected: FAIL: chưa có `./EvolutionTestScreen`; các đường dẫn `#/topic-test/...`, `#/evolution/...` vẫn mở Phòng robot.

- [ ] **Step 3: Viết code**

`src/ui/EvolutionTestScreen.tsx`:

```tsx
import { useState } from "react";
import { findConcept } from "../content/lookup";
import type { Concept, Stage } from "../content/types";
import { buildRemedialSet, drawEvolutionTest, gradePaper, type ExamGrade } from "../game/exam";
import { nextStep } from "../game/path";
import type { Rng } from "../game/random";
import { isPass } from "../game/rewards";
import type { GameState } from "../game/state";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { ExamRunner, formatScore } from "./ExamRunner";
import { useGame } from "./GameProvider";
import { Robot } from "./Robot";
import { routeToHash, stepRoute } from "./routing";

/**
 * The evolution test of a stage (spec 5.11). The paper avoids the previous attempt's items. Passed: the robot
 * evolves. Failed: the weak concepts and a focused review set; the retake opens once the set is done.
 */
export function EvolutionTestScreen({
  stage,
  stageNumber,
  onExit,
  rng = Math.random,
}: {
  stage: Stage;
  stageNumber: number;
  onExit(): void;
  rng?: Rng;
}) {
  const { t } = useLang();
  const game = useGame();
  const bundle = useContent();
  const [before] = useState(() => game.state);
  const [items] = useState(() => {
    const previous = game.state.progress.evolutionTests.filter((attempt) => attempt.stage === stageNumber).at(-1);
    return drawEvolutionTest(bundle, stage, previous?.items ?? [], rng);
  });
  const [grade, setGrade] = useState<ExamGrade | null>(null);
  // Checked once on opening: a failed attempt opens a set, and its result screen must stay.
  const [remedialFirst] = useState(() => game.state.remedial !== null);

  if (remedialFirst) {
    return (
      <main className="room">
        <p>{t("evolution.remedialFirst")}</p>
        <a className="button primary" href={routeToHash({ name: "remedial" })}>
          {t("evolution.startRemedial")}
        </a>
        <a href="#/">{t("nav.room")}</a>
      </main>
    );
  }
  if (grade) {
    return isPass(grade.score, grade.max) ? (
      <EvolutionPassed before={before} after={game.state} grade={grade} onExit={onExit} />
    ) : (
      <EvolutionFailed after={game.state} grade={grade} onExit={onExit} />
    );
  }
  return (
    <ExamRunner
      title={t("exam.evolutionTitle")}
      items={items}
      onFinish={(answers) => {
        const result = gradePaper(items, answers);
        const remedial = isPass(result.score, result.max)
          ? []
          : buildRemedialSet(bundle, game.state, result.wrongConcepts, rng);
        game.dispatch({
          type: "EvolutionTestCompleted",
          stage: stageNumber,
          score: result.score,
          max: result.max,
          items: items.map((item) => item.id),
          wrongConcepts: result.wrongConcepts,
          remedialItems: remedial.map((item) => item.id),
        });
        setGrade(result);
      }}
    />
  );
}

function EvolutionPassed({
  before,
  after,
  grade,
  onExit,
}: {
  before: GameState;
  after: GameState;
  grade: ExamGrade;
  onExit(): void;
}) {
  const { t, uiLang } = useLang();
  const bundle = useContent();
  const { profile } = useGame();
  const next = nextStep(bundle, after);
  const xu = after.wallet.xu - before.wallet.xu;
  const vui = after.pet.vui - before.pet.vui;
  return (
    <main className="evolution-done">
      <div className="evolve">
        <Robot mood="happy" size={200} />
      </div>
      <h1>{t("evolution.title", { name: profile.robotName })}</h1>
      <p>{t("evolution.body", { name: profile.robotName })}</p>
      <p>{t("exam.score", { score: formatScore(grade.score, uiLang), max: grade.max })}</p>
      <ul className="result-rewards">
        {xu > 0 && <li>{t("result.xu", { n: xu })}</li>}
        {vui > 0 && <li>{t("result.vui", { n: vui })}</li>}
      </ul>
      <nav className="room-actions">
        {next && (
          <a className="button primary" href={routeToHash(stepRoute(next))}>
            {t("room.continue")}
          </a>
        )}
        <button onClick={onExit}>{t("nav.room")}</button>
      </nav>
    </main>
  );
}

function EvolutionFailed({ after, grade, onExit }: { after: GameState; grade: ExamGrade; onExit(): void }) {
  const { t, uiLang } = useLang();
  const bundle = useContent();
  const weak = grade.wrongConcepts
    .map((id) => findConcept(bundle, id))
    .filter((concept): concept is Concept => concept !== undefined);
  return (
    <main className="lesson-done">
      <Robot mood="thinking" size={96} />
      <h2>{t("evolution.failTitle")}</h2>
      <p>{t("evolution.failBody")}</p>
      <p>{t("exam.score", { score: formatScore(grade.score, uiLang), max: grade.max })}</p>
      {weak.length > 0 && (
        <section>
          <h3>{t("evolution.weakTitle")}</h3>
          <ul>
            {weak.map((concept) => (
              <li key={concept.id}>{pick(concept.name, uiLang)}</li>
            ))}
          </ul>
        </section>
      )}
      <nav className="room-actions">
        {after.remedial && (
          <a className="button primary" href={routeToHash({ name: "remedial" })}>
            {t("evolution.startRemedial")}
          </a>
        )}
        <button onClick={onExit}>{t("nav.room")}</button>
      </nav>
    </main>
  );
}
```

`src/ui/AppRoutes.tsx` (thay toàn bộ file):

```tsx
import { evolutionTestId, findLesson, findStage, findTopic, topicTestId } from "../content/lookup";
import { findNode, nodeStatuses } from "../game/path";
import { useLang } from "../i18n/LangProvider";
import { BackupScreen } from "./BackupScreen";
import { Banners } from "./Banners";
import { useContent } from "./contexts";
import { ErrorBoundary } from "./ErrorBoundary";
import { EvolutionTestScreen } from "./EvolutionTestScreen";
import { useGame } from "./GameProvider";
import { Header } from "./Header";
import { LessonScreen } from "./LessonScreen";
import { MapScreen } from "./MapScreen";
import { PracticeScreen } from "./PracticeScreen";
import { RemedialScreen } from "./RemedialScreen";
import { ReviewScreen } from "./ReviewScreen";
import { RoomScreen } from "./RoomScreen";
import { routeToHash, useHashRoute } from "./routing";
import { TopicTestScreen } from "./TopicTestScreen";

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
  } else if (route.name === "practice") {
    screen = <PracticeScreen key={route.conceptId} conceptId={route.conceptId} onExit={goHome} />;
  } else if (route.name === "topicTest") {
    const topic = findTopic(bundle, route.topicId);
    const node = topic && findNode(bundle, topicTestId(topic));
    if (!topic || node?.kind !== "topicTest") {
      screen = <Notice message={t("exam.notFound")} />;
    } else if (nodeStatuses(bundle, game.state).get(node.id) === "locked") {
      screen = <Notice message={t("exam.locked")} />;
    } else {
      screen = <TopicTestScreen key={topic.id} topic={topic} onExit={goHome} />;
    }
  } else if (route.name === "evolution") {
    const stage = findStage(bundle, route.stageId);
    const node = stage && findNode(bundle, evolutionTestId(stage));
    if (!stage || node?.kind !== "evolution") {
      screen = <Notice message={t("exam.notFound")} />;
    } else if (nodeStatuses(bundle, game.state).get(node.id) === "locked") {
      screen = <Notice message={t("exam.locked")} />;
    } else {
      screen = <EvolutionTestScreen key={stage.id} stage={stage} stageNumber={node.stage} onExit={goHome} />;
    }
  } else if (route.name === "remedial") {
    screen = <RemedialScreen onExit={goHome} />;
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

`src/styles.css`: thêm vào cuối file:

```css
.evolution-done { text-align: center; padding: 40px; }
.evolve { display: inline-block; animation: evolve 1.2s ease-out both; }
@keyframes evolve {
  0% { transform: scale(0.6); filter: brightness(2); opacity: 0; }
  60% { transform: scale(1.1); filter: brightness(1.4); opacity: 1; }
  100% { transform: scale(1); filter: none; }
}
@media (prefers-reduced-motion: reduce) { .evolve { animation: none; } }
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run && npm run typecheck`
Expected: PASS, gồm test tích hợp `topic test, failed evolution, focused review, retake, evolution`.

- [ ] **Step 5: Commit**

```bash
git add src/ui/EvolutionTestScreen.tsx src/ui/EvolutionTestScreen.test.tsx src/ui/AppRoutes.tsx src/ui/AppRoutes.test.tsx src/styles.css
git commit -m "feat(ui): evolution test with celebration, weak concepts and the retake after the focused review

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: E2E trên nội dung thật và kiểm tra toàn bộ

**Files:**
- Create: `e2e/exam.spec.ts`

**Interfaces:**
- Consumes: toàn bộ Task 1–8; nội dung thật `s1.lam-quen` (4 bài, 2 trạm ôn, kiểm tra chủ đề 8 câu + 2 bài code).
- Produces: e2e `after the 4 lessons of the topic come the topic test and then the evolution test`.

- [ ] **Step 1: Viết test e2e**

`e2e/exam.spec.ts`:

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

async function submitCode(page: Page, code: string, last: boolean) {
  const editor = page.getByRole("textbox", { name: "Trình soạn code" });
  await editor.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type(code);
  await page.getByRole("button", { name: "Nộp bài", exact: true }).click();
  await expect(page.getByText("Đúng hết 1/1 test!")).toBeVisible();
  await page.getByRole("button", { name: last ? "Hoàn thành" : "Tiếp" }).click();
}

/** Picks the first choice of the question on screen, checks it, then goes on. */
async function answerFirstChoice(page: Page, last: boolean) {
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Kiểm tra" }).click();
  await page.getByRole("button", { name: last ? "Hoàn thành" : "Tiếp" }).click();
}

async function readCards(page: Page) {
  await page.getByRole("link", { name: "Học tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
}

async function reviewStation(page: Page) {
  await page.getByRole("link", { name: "Học tiếp" }).click();
  await expect(page.getByRole("heading", { name: "Trạm ôn" })).toBeVisible();
  const total = Number((await page.getByText(/^Câu 1\/\d+$/).textContent())!.split("/")[1]);
  for (let n = 1; n <= total; n += 1) {
    await expect(page.getByText(`Câu ${n}/${total}`)).toBeVisible();
    await answerFirstChoice(page, n === total);
  }
  await expect(page.getByRole("heading", { name: "Xong trạm ôn!" })).toBeVisible();
}

/** Answers every item of the open test: the first choice of each question, the starter code of each exercise. */
async function answerPaper(page: Page) {
  const total = Number((await page.getByText(/^Câu 1\/\d+$/).textContent())!.split("/")[1]);
  for (let n = 1; n <= total; n += 1) {
    await expect(page.getByText(`Câu ${n}/${total}`)).toBeVisible();
    if ((await page.getByRole("radio").count()) > 0) {
      await page.getByRole("radio").first().check();
      await page.getByRole("button", { name: "Chọn đáp án này" }).click();
    } else {
      await page.getByRole("button", { name: "Nộp bài", exact: true }).click();
      await expect(page.getByText("Đã nộp bài. Kết quả hiện ở cuối bài.")).toBeVisible();
    }
    await page.getByRole("button", { name: n === total ? "Nộp bài kiểm tra" : "Tiếp", exact: true }).click();
  }
  return total;
}

test("after the 4 lessons of the topic come the topic test and then the evolution test", async ({ page }) => {
  test.setTimeout(120_000);
  await startApp(page);
  await readCards(page);
  await submitCode(page, 'print("Xin chào Robo")', false);
  await answerFirstChoice(page, true);
  await readCards(page);
  await submitCode(page, 'print("Robo đang học Python")', false);
  await answerFirstChoice(page, true);
  await reviewStation(page);
  await page.getByRole("button", { name: "Về phòng" }).click();
  await readCards(page);
  await submitCode(page, 'print("+-----+")\nprint("| o o |")\nprint("|  -  |")\nprint("+-----+")', false);
  await answerFirstChoice(page, true);
  await readCards(page);
  await answerFirstChoice(page, false);
  await submitCode(page, 'print("Robo")\nprint("đang học")\nprint("Python")', true);
  await reviewStation(page);
  await page.getByRole("button", { name: "Về phòng" }).click();

  await page.getByRole("link", { name: "Học tiếp" }).click();
  await expect(page.getByRole("heading", { name: "Kiểm tra chủ đề: Làm quen với chương trình" })).toBeVisible();
  expect(await answerPaper(page)).toBe(10);
  await expect(page.getByRole("heading", { name: "Xong bài kiểm tra!" })).toBeVisible();
  await expect(page.getByText(/^Con được [\d,]+\/14 điểm\./)).toBeVisible();
  await expect(page.getByText("+30 XP")).toBeVisible();

  await page.getByRole("link", { name: "Học tiếp" }).click();
  await expect(page.getByRole("heading", { name: "Kiểm tra tiến hóa" })).toBeVisible();
  await expect(page.getByText(/^Câu 1\/\d+$/)).toBeVisible();
  await page.getByRole("link", { name: "Py-Pet" }).click();
  await page.getByRole("link", { name: "Bản đồ học" }).click();
  await expect(page.getByRole("listitem").filter({ hasText: "Kiểm tra chủ đề" })).toContainText("Đã xong");
  await expect(page.getByRole("listitem").filter({ hasText: "Kiểm tra tiến hóa" })).toContainText("Bài tiếp theo");
});
```

- [ ] **Step 2: Chạy e2e**

Run: `export PW_CHROMIUM_PATH=/opt/pw-browsers/chromium; npx playwright test e2e/exam.spec.ts`
Expected: 1 passed. Test chỉ kiểm tra những gì không phụ thuộc câu trả lời (10 câu của đề, điểm trên 14, +30 XP, kiểm tra tiến hóa mở và nút trên bản đồ). Nếu thất bại, đọc `test-results/*/error-context.md`.

- [ ] **Step 3: Chạy kiểm tra toàn bộ**

Run: `npm run check`
Expected: typecheck không lỗi; Vitest 486 passed; pytest 21 passed; kiểm tra nội dung qua (có các dòng "Cảnh báo:" như Task 2); Playwright 11 passed.

- [ ] **Step 4: Commit**

```bash
git add e2e/exam.spec.ts
git commit -m "test(e2e): the topic test and the evolution test open after the lessons of the topic

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
