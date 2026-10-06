# M4a – Cửa hàng, phần thưởng, chế độ nghỉ: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Con tiêu xu trong cửa hàng (Pin, Vui, phụ kiện, đồ trang trí) và xin đổi phần thưởng thật từ bố mẹ. Robot nghỉ được (Pin/Vui và chuỗi ngày đứng yên). App đo thời gian học, trao huy hiệu và có Sổ thành tích. Nút "Học tiếp" mở trước bài luyện bố mẹ giao. Toàn bộ dữ liệu mới của M4 có trong GameState version 4; M4b (khu phụ huynh) chỉ thêm giao diện.

**Architecture:** Luật chơi vẫn là hàm thuần trong `src/game/`: `wallet.ts` (mọi thay đổi xu đi qua `changeXu` và được ghi lịch sử), `shop.ts` (danh mục đồ, quà chuỗi ngày), `realRewards.ts` (phần thưởng thật, giới hạn tuần), `vacation.ts` (ngày nghỉ), `badges.ts` (huy hiệu). `apply()` có thêm các sự kiện của spec 5.1 (`ItemBought`, `ItemUsed`, `RewardRequested`, `RewardApproved`, `RewardRejected`, `VacationToggled`, `VacationScheduled`, `ActiveTimeRecorded`, `PracticeAssigned`) và 4 sự kiện kế hoạch tự đặt (`RewardsEdited`, `VacationCancelled`, `AssignedPracticeDone`, `SupportGiven`). Giao diện thêm `ShopScreen` (2 tab), `AchievementsScreen`, `AssignedPracticeScreen`, trạng thái "Đi nghỉ" của Phòng robot và hook `useStudyTimer`.

**Tech Stack:** Như M3b (React 19, TypeScript 5.9, Vite 8, Vitest 5, Playwright 1.63, Dexie 4, Pyodide 314, zod 4). Không thêm thư viện.

**Spec:** `docs/superpowers/specs/2026-10-06-py-pet-design.md`

## Global Constraints

- Phạm vi M4a: dữ liệu và luật của cửa hàng, phần thưởng thật, chế độ nghỉ, thời gian học, huy hiệu, bài luyện phụ huynh giao, đánh dấu "đã kèm con"; màn hình Cửa hàng, Sổ thành tích, bài luyện bố mẹ giao; Phòng robot khi đi nghỉ (spec 5.1, 5.2, 5.5, 5.6, 5.7, 5.12, 5.13, 8.2 mục 6 và 7, 8.3).
- Ngoài phạm vi M4a (đừng làm): khu phụ huynh và mọi màn hình của phụ huynh (tạo danh sách phần thưởng, duyệt, bật chế độ nghỉ, giao bài, cài đặt các giá trị (*)), đặt lại PIN, việc chuyển từ M3a/M3b về nhập file và dữ liệu hỏng (M4b); hình phụ kiện trên robot và hoạt cảnh (M6); nội dung mới (M5).
- M4 được chia thành M4a và M4b (quyết định của Claude, ghi trong `docs/superpowers/DECISIONS.md`).
- Luật chơi là hàm thuần nhận `now` từ ngoài; ID của yêu cầu đổi thưởng và bài luyện do giao diện tạo và truyền vào sự kiện. `GameState` chỉ chứa dữ liệu JSON.
- Con số của spec: kho đồ có pin sạc nhanh, dầu nhớt (hồi Pin), đồ chơi (Vui +1), phụ kiện, đồ trang trí; xu chỉ bị trừ khi phụ huynh duyệt; chuỗi 3/7/14/30 ngày được 20/50/100/250 xu kèm phụ kiện; trong thời gian nghỉ Pin/Vui giữ nguyên, chuỗi ngày đóng băng, ngày nghỉ không tính vào kế hoạch tuần; thời gian học chỉ tính khi ở màn hình học và có thao tác trong 60 giây gần nhất; trạng thái hiển thị xét "Đi nghỉ" trước.
- Đổi cấu trúc dữ liệu theo `CLAUDE.md`: `GAME_STATE_VERSION` và `SCHEMA_VERSION` 3 → 4, migration trong `src/game/migrate.ts` và `src/storage/backup.ts`, chạy `npx tsx tools/make_backup_fixture.ts` 1 lần để tạo `src/storage/fixtures/backup-v4.pypet`. Không sinh lại file mẫu cũ.
- Mọi chuỗi giao diện đi qua `t(key)`; `vi.ts` và `en.ts` cùng khóa, cùng placeholder.
- Không gọi mạng.
- Mọi commit message kết thúc bằng dòng trailer theo hướng dẫn attribution của phiên đang chạy. Các lệnh commit trong kế hoạch ghi dòng `Co-Authored-By`; thêm các dòng trailer khác mà phiên yêu cầu.
- Mốc xanh trước khi bắt đầu: `npm run check` (typecheck, Vitest 494, pytest 21, kiểm tra nội dung, e2e 11). Sau M4a: Vitest 551, pytest 21, e2e 12. Trong phiên cloud, đặt `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium` trước khi chạy e2e.

## Review Focus

1. Dữ liệu M3b (state version 3, file `.pypet` schema 3) mở được, giữ xu, cài đặt và điểm thành thạo. Test: Task 1 (`upgrades a version 3 state: shop, rewards, vacation and settings start empty or default`, `decodes the committed schema 3 sample file and upgrades it`).
2. Xu không bao giờ âm và không bị trừ 2 lần: mua cần đủ xu; xin đổi thưởng cần đủ xu chưa bị giữ bởi yêu cầu khác; duyệt chỉ trừ 1 lần và chờ nếu con thiếu xu. Test: Task 3 (`needs enough xu`), Task 4 (`needs enough free xu and respects the weekly limit`, `an approval waits while the child has too few xu`).
3. Chế độ nghỉ không làm robot mất Pin/Vui, không cắt chuỗi ngày, và không làm con mất thưởng tuần. Test: Task 5.
4. Thời gian học không tính khi con không thao tác quá 60 giây, và không mất khi rời màn hình học. Test: Task 8 (`useStudyTimer`).
5. Mọi thay đổi xu có trong lịch sử (phụ huynh dùng ở M4b). Test: Task 2.

## Quyết định thiết kế

Spec để ngỏ các điểm sau; kế hoạch chốt như dưới đây (đều chưa được người bảo trì duyệt, ghi lại trong `docs/superpowers/DECISIONS.md`).

1. **Mọi dữ liệu mới của M4 vào version 4 một lần**, kể cả các cài đặt (*) (`questionLang`, `passPercent` 80, `helpPercent` 60, `runSeconds` 2) và `mastery.coachedAt`, để M4b không phải tăng version. Các cài đặt này chỉ có tác dụng từ M4b.
2. **Lịch sử ví** ghi theo ngày (`day`, `delta`, `reason`, `ref`), giữ 200 mục gần nhất.
3. **Danh mục cửa hàng** (giá là ước tính, spec 13.7): dầu nhớt Pin +1 (15 xu), pin sạc nhanh Pin +2 (30), quả bóng Vui +1 (15); 6 phụ kiện (40–120 xu) chia 3 chỗ đeo (đầu, mặt, cổ), mỗi chỗ 1 món; 5 đồ trang trí (40–90 xu) luôn hiện trong phòng; 4 phụ kiện chỉ là quà chuỗi 3/7/14/30 ngày. Giữ tối đa 9 món Pin/Vui mỗi loại. Dùng món Pin/Vui khi chỉ số đã đầy thì không mất món.
4. **Đồ chơi tăng Vui** theo đúng spec 5.6. Quyết định "Vui chỉ tăng khi con trả lời đúng" của M3a được hiểu là cho việc sạc bằng ôn tập; cần người bảo trì xác nhận.
5. **Phần thưởng thật:** danh sách do phụ huynh đặt được thay cả danh sách (`RewardsEdited`). Con xin đổi khi xu chưa bị giữ (số dư trừ các yêu cầu đang chờ) đủ giá và số lần trong tuần (thứ 2 đến chủ nhật, gồm yêu cầu đang chờ và đã duyệt) chưa hết. Duyệt trừ xu một lần; nếu lúc duyệt con không còn đủ xu thì yêu cầu vẫn chờ. Giữ mọi yêu cầu đang chờ và 100 yêu cầu đã xử lý gần nhất.
6. **Chế độ nghỉ:** bật ngay (`since`) hoặc lên lịch theo khoảng ngày (từ hôm nay trở đi); tắt thì các ngày đã nghỉ thành 1 khoảng đã qua. Có thêm sự kiện hủy lịch nghỉ (`VacationCancelled`). Ngày nghỉ không tính là ngày vắng (Pin/Vui), không cắt chuỗi ngày; kế hoạch tuần = làm tròn lên `mục tiêu × số ngày không nghỉ / 7`. Khoảng nghỉ cũ hơn 60 ngày bị xóa.
7. **Thời gian học:** đếm mỗi 15 giây khi trang đang hiện và có thao tác (phím, chuột, cuộn, chạm) trong 60 giây gần nhất; phút đầu khi mở màn hình học được tính cả khi con chỉ đọc. Lưu mỗi phút và khi rời màn hình học. Các màn hình học: bài học, trạm ôn, luyện tập, kiểm tra chủ đề, kiểm tra tiến hóa, ôn tập trọng tâm, bài luyện bố mẹ giao. Lưu số giây theo ngày, giữ 60 ngày.
8. **Huy hiệu** (spec không liệt kê): 16 huy hiệu cho bài học đầu tiên, 10/25/50 bài, chuỗi 3/7/14/30 ngày, trạm ôn đúng hết, đạt kiểm tra chủ đề, đạt kế hoạch tuần, vững 5/10 khái niệm, tiến hóa lần 1/2/3. "Vững" là điểm thành thạo trên 70; "đang luyện" là từ 40 đến 70 (spec 9.2).
9. **Bài luyện phụ huynh giao** được lưu trong `state.assigned`; "Học tiếp" mở bài đầu tiên trong danh sách trước bộ ôn tập trọng tâm. Làm xong (`AssignedPracticeDone`) thì xóa khỏi danh sách và tính là ngày hoạt động. `SupportGiven` bỏ cờ "Cần hỗ trợ" và các bộ đếm của nó, giữ điểm thành thạo.
10. **Phụ kiện và đồ trang trí** chỉ hiện bằng chữ trong Phòng robot ("Đang đeo: …", "Trong phòng: …"); hình vẽ để dành cho M6. Khi đi nghỉ, robot đeo kính râm (mặt) như spec 8.3.
11. **E2E** của M4a: học 2 bài, mua 1 món trong cửa hàng, thấy huy hiệu đầu tiên. Duyệt phần thưởng bằng PIN và chế độ nghỉ có e2e trong M4b (cần giao diện phụ huynh).

---

## File Structure

```
src/game/
  state.ts        (sửa) GameState v4: wallet.history, activity.seconds, settings (*), mastery.coachedAt,
                  inventory, rewards, vacation, assigned, badges
  schema.ts, migrate.ts, mastery.ts  (sửa) schema, bước nâng cấp 3 → 4, emptyMastery
  wallet.ts       changeXu (ghi lịch sử)
  shop.ts         SHOP_ITEMS, STREAK_GIFTS, findShopItem, isConsumable
  realRewards.ts  freeXu, requestsThisWeek, requestBlock, cleanCatalog, trimRequests
  vacation.ts     isVacationDay, workDaysBetween, weekTarget, toggle/schedule/cancel/prune
  badges.ts       BADGES, awardBadges, giveBadge, masteredConcepts, practisingConcepts
  apply.ts        (sửa) các sự kiện mới
  path.ts, progress.ts  (sửa) NextStep "assigned"; roomCondition, displayStreak bỏ qua ngày nghỉ
src/storage/      (sửa) SCHEMA_VERSION 4, migration; fixtures/backup-v4.pypet
src/ui/
  names.ts               khóa i18n của đồ, huy hiệu, dạng robot
  ShopScreen.tsx         2 tab: đồ cho robot, phần thưởng từ bố mẹ
  AchievementsScreen.tsx Sổ thành tích
  AssignedPracticeScreen.tsx
  useStudyTimer.ts       đo thời gian học
  (sửa) routing, AppRoutes, RoomScreen, Robot, styles.css
src/test/gameSteps.ts    at() và run() cho test luật chơi
e2e/shop.spec.ts
```

---
### Task 1: GameState version 4 và file sao lưu schema 4

**Files:**
- Modify: `src/game/state.ts`, `src/game/schema.ts`, `src/game/migrate.ts`, `src/game/mastery.ts`, `src/storage/types.ts`, `src/storage/backup.ts`
- Create: `src/storage/fixtures/backup-v4.pypet` (sinh bằng `tools/make_backup_fixture.ts`)
- Test: `src/game/migrate.test.ts`, `src/game/dates.test.ts`, `src/game/apply.test.ts`, `src/storage/backup.test.ts`, `src/ui/AppRoutes.test.tsx`

**Interfaces:**
- Consumes: `upgradeGameState`, `STEPS` (M3a/M3b).
- Produces:
  - `GAME_STATE_VERSION = 4`; `WALLET_HISTORY_LIMIT = 200`; `KEEP_DAYS = 60`.
  - `GameSettings` thêm `questionLang`, `passPercent`, `helpPercent`, `runSeconds`; `DEFAULT_SETTINGS` có giá trị mặc định.
  - Kiểu mới: `XuReason`, `XuEntry { day; delta; reason; ref }`, `RewardItem { id; name; price; weeklyLimit }`, `RewardStatus`, `RewardRequest`, `DayRange { start; end }`, `AssignedPractice { id; conceptId; items; day }`; `ConceptMastery.coachedAt: string | null`.
  - `GameState` thêm `wallet.history`, `activity.seconds`, `inventory { consumables; owned; equipped }`, `rewards { catalog; requests }`, `vacation { since; ranges }`, `assigned`, `badges`.
  - `SCHEMA_VERSION = 4`.

- [ ] **Step 1: Viết test thất bại**

`src/game/migrate.test.ts` (thay toàn bộ file):

```ts
import { describe, expect, test } from "vitest";
import { StateFormatError, upgradeGameState } from "./migrate";
import { emptyMastery } from "./mastery";
import { DEFAULT_SETTINGS, GAME_STATE_VERSION, initialGameState, type GameState } from "./state";

/** A state as the M3b app saved it (version 3), with 1 concept record and 25 xu. */
function versionThreeState(): Record<string, unknown> {
  const { inventory, rewards, vacation, assigned, badges, ...rest } = initialGameState("2026-10-06");
  const { questionLang, passPercent, helpPercent, runSeconds, ...settings } = rest.settings;
  const { coachedAt, ...concept } = emptyMastery();
  return {
    ...rest,
    version: 3,
    wallet: { xu: 25 },
    activity: { lastActiveDay: "2026-10-05", decayApplied: 0 },
    settings: { ...settings, dailyGoal: 3 },
    mastery: { k1: { ...concept, score: 42 } },
  };
}

/** A state as the M3a app saved it (version 2). */
function versionTwoState(): Record<string, unknown> {
  const { remedial, ...rest } = versionThreeState();
  const { topicTests, evolutionTests, ...progress } = rest.progress as GameState["progress"];
  const { stageStartXp, ...pet } = rest.pet as GameState["pet"];
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

  test("upgrades a version 3 state: shop, rewards, vacation and settings start empty or default", () => {
    const upgraded = upgradeGameState(versionThreeState());
    expect(upgraded.version).toBe(GAME_STATE_VERSION);
    expect(upgraded.wallet).toEqual({ xu: 25, history: [] });
    expect(upgraded.activity).toEqual({ lastActiveDay: "2026-10-05", decayApplied: 0, seconds: {} });
    expect(upgraded.settings).toEqual({ ...DEFAULT_SETTINGS, dailyGoal: 3 });
    expect(upgraded.mastery.k1).toEqual({ ...emptyMastery(), score: 42, coachedAt: null });
    expect(upgraded.inventory).toEqual({ consumables: {}, owned: [], equipped: [] });
    expect(upgraded.rewards).toEqual({ catalog: [], requests: [] });
    expect(upgraded.vacation).toEqual({ since: null, ranges: [] });
    expect(upgraded.assigned).toEqual([]);
    expect(upgraded.badges).toEqual({});
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
      version: 4,
      pet: { stage: 1, xp: 0, stageStartXp: 0, pin: 4, vui: 4, correctRun: 0 },
      wallet: { xu: 0, history: [] },
      activity: { lastActiveDay: null, decayApplied: 0, seconds: {} },
      streak: { current: 0, best: 0, freezes: 0, lastAchievedDay: null, pointsDay: null, points: 0 },
      week: { start: "2026-10-05", lessonsDone: 0 },
      settings: {
        dailyGoal: 2,
        weeklyTarget: 10,
        graceDays: 1,
        uiLang: "vi",
        questionLang: "vi",
        passPercent: 80,
        helpPercent: 60,
        runSeconds: 2,
      },
      mastery: {},
      reviews: {},
      retry: {},
      remedial: null,
      inventory: { consumables: {}, owned: [], equipped: [] },
      rewards: { catalog: [], requests: [] },
      vacation: { since: null, ranges: [] },
      assigned: [],
      badges: {},
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

Trong `src/game/apply.test.ts`, 2 chỗ `expect(once.activity).toEqual(` và `expect(next.activity).toEqual(` đổi `toEqual` thành `toMatchObject` (state có thêm `activity.seconds`).

Trong `src/storage/backup.test.ts`, thay test `decodes the committed schema 3 sample file` bằng 2 test:

```ts
  test("decodes the committed schema 3 sample file and upgrades it", async () => {
    const result = await decodeBackup(readFileSync("src/storage/fixtures/backup-v3.pypet", "utf8"));
    if (!result.ok) throw new Error("the sample file must decode");
    expect(result.checksumValid).toBe(true);
    expect(result.payload.schemaVersion).toBe(SCHEMA_VERSION);
    expect(result.payload.profiles[0]!.state.progress.topicTests).toEqual({});
    expect(result.payload.profiles[0]!.state.wallet).toEqual({ xu: 120, history: [] });
  });

  test("decodes the committed schema 4 sample file", async () => {
    const result = await decodeBackup(readFileSync("src/storage/fixtures/backup-v4.pypet", "utf8"));
    expect(result.ok && result.checksumValid).toBe(true);
    expect(result.ok && result.payload.profiles[0]!.state.inventory).toEqual({ consumables: {}, owned: [], equipped: [] });
  });
```

Trong `src/ui/AppRoutes.test.tsx`, test `a profile saved by an older app is upgraded when it opens`: sau dòng `delete old.progress.evolutionTests;` thêm:

```ts
    delete old.wallet.history;
    delete old.activity.seconds;
    delete old.inventory;
    delete old.rewards;
    delete old.vacation;
    delete old.assigned;
    delete old.badges;
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/game/migrate.test.ts src/game/dates.test.ts src/storage/backup.test.ts`
Expected: FAIL: state vẫn là version 3, chưa có `backup-v4.pypet`.

- [ ] **Step 3: Viết code**

`src/game/state.ts` (thay toàn bộ file):

```ts
import type { Lang, QuestionLang } from "../i18n/lang";
import { weekStart } from "./dates";

export const GAME_STATE_VERSION = 4;
export const STAT_MAX = 5;
export const STAT_START = 4;
export const WARNING_LIMIT = 20;
/** Wallet entries kept for the parent area (spec 5.2: the transaction history). */
export const WALLET_HISTORY_LIMIT = 200;
/** Days of study time and of past vacation ranges kept (the parent area shows 7 days). */
export const KEEP_DAYS = 60;

/** Spec 5 (*): the values a parent can change (M4b gives them a screen). */
export interface GameSettings {
  dailyGoal: number;
  weeklyTarget: number;
  graceDays: number;
  uiLang: Lang;
  /** The default question language (spec 7.2). */
  questionLang: QuestionLang;
  /** The evolution and topic test pass mark, in percent (spec 5.11: 80). */
  passPercent: number;
  /** "Needs help" below this share of right answers, in percent (spec 5.9: 60). */
  helpPercent: number;
  /** The time limit of 1 code run, in seconds (spec 4.1: 2). */
  runSeconds: number;
}

export type XuReason =
  | "code"
  | "review"
  | "topicTest"
  | "evolution"
  | "streak"
  | "week"
  | "shop"
  | "reward";

/** One change of the coin balance (spec 5.2: the transaction history). */
export interface XuEntry {
  day: string;
  delta: number;
  reason: XuReason;
  /** The item, reward or other thing it was for, when there is one. */
  ref: string | null;
}

/** A real reward the parent offers (spec 5.12). */
export interface RewardItem {
  id: string;
  name: string;
  price: number;
  /** Requests allowed per week (Monday to Sunday). */
  weeklyLimit: number;
}

export type RewardStatus = "pending" | "approved" | "rejected";

export interface RewardRequest {
  id: string;
  rewardId: string;
  /** Name and price when asked, so a later change of the list does not change the request. */
  name: string;
  price: number;
  at: string;
  status: RewardStatus;
  decidedAt: string | null;
}

export interface DayRange {
  start: string;
  end: string;
}

/** Practice a parent gives for a concept (spec 9.2); "Học tiếp" opens it first (spec 5.3). */
export interface AssignedPractice {
  id: string;
  conceptId: string;
  items: string[];
  day: string;
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
  /** The day a parent last marked "coached" for this concept (spec 9.2), or null. */
  coachedAt: string | null;
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
  wallet: {
    xu: number;
    /** The latest changes, newest last (WALLET_HISTORY_LIMIT). */
    history: XuEntry[];
  };
  activity: {
    lastActiveDay: string | null;
    decayApplied: number;
    /** Seconds of active study per day (spec 5.13), the last KEEP_DAYS days. */
    seconds: Record<string, number>;
  };
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
  /** Things bought in the shop (spec 5.12). */
  inventory: {
    /** Pin and Vui items not used yet: item -> count. */
    consumables: Record<string, number>;
    /** Accessories and room decorations owned, from the shop or as streak gifts. */
    owned: string[];
    /** The accessories the robot wears, at most 1 per slot. */
    equipped: string[];
  };
  rewards: { catalog: RewardItem[]; requests: RewardRequest[] };
  /** Spec 5.7: `since` is the first day of a vacation switched on now; `ranges` are scheduled and past ones. */
  vacation: { since: string | null; ranges: DayRange[] };
  assigned: AssignedPractice[];
  /** Badge -> the day it was earned (spec 8.2.7). */
  badges: Record<string, string>;
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

export const DEFAULT_SETTINGS: GameSettings = {
  dailyGoal: 2,
  weeklyTarget: 10,
  graceDays: 1,
  uiLang: "vi",
  questionLang: "vi",
  passPercent: 80,
  helpPercent: 60,
  runSeconds: 2,
};

export function initialGameState(today: string): GameState {
  return {
    version: GAME_STATE_VERSION,
    pet: { stage: 1, xp: 0, stageStartXp: 0, pin: STAT_START, vui: STAT_START, correctRun: 0 },
    wallet: { xu: 0, history: [] },
    activity: { lastActiveDay: null, decayApplied: 0, seconds: {} },
    streak: { current: 0, best: 0, freezes: 0, lastAchievedDay: null, pointsDay: null, points: 0 },
    week: { start: weekStart(today), lessonsDone: 0 },
    settings: { ...DEFAULT_SETTINGS },
    mastery: {},
    reviews: {},
    retry: {},
    remedial: null,
    inventory: { consumables: {}, owned: [], equipped: [] },
    rewards: { catalog: [], requests: [] },
    vacation: { since: null, ranges: [] },
    assigned: [],
    badges: {},
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
  coachedAt: day.nullable(),
});

const itemId = z.string().min(1);

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
  wallet: z.object({
    xu: count,
    history: z.array(
      z.object({
        day,
        delta: z.number().int(),
        reason: z.enum(["code", "review", "topicTest", "evolution", "streak", "week", "shop", "reward"]),
        ref: z.string().nullable(),
      }),
    ),
  }),
  activity: z.object({ lastActiveDay: day.nullable(), decayApplied: count, seconds: z.record(day, count) }),
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
    questionLang: z.enum(["vi", "en", "both"]),
    passPercent: z.number().int().min(1).max(100),
    helpPercent: z.number().int().min(1).max(100),
    runSeconds: z.number().int().min(1).max(30),
  }),
  mastery: z.record(z.string(), masterySchema),
  reviews: z.record(z.string(), z.object({ box: z.number().int().min(1).max(5), due: day })),
  retry: z.record(z.string(), day),
  remedial: z.object({ stage: z.number().int().min(1), items: z.array(z.string()) }).nullable(),
  inventory: z.object({
    consumables: z.record(itemId, count),
    owned: z.array(itemId),
    equipped: z.array(itemId),
  }),
  rewards: z.object({
    catalog: z.array(z.object({ id: itemId, name: z.string().min(1), price: count, weeklyLimit: count })),
    requests: z.array(
      z.object({
        id: itemId,
        rewardId: itemId,
        name: z.string(),
        price: count,
        at: z.string(),
        status: z.enum(["pending", "approved", "rejected"]),
        decidedAt: z.string().nullable(),
      }),
    ),
  }),
  vacation: z.object({ since: day.nullable(), ranges: z.array(z.object({ start: day, end: day })) }),
  assigned: z.array(z.object({ id: itemId, conceptId: itemId, items: z.array(z.string()), day })),
  badges: z.record(z.string(), day),
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

`src/game/migrate.ts`: đổi import thành `import { DEFAULT_SETTINGS, GAME_STATE_VERSION, type GameState } from "./state";` và thêm bước 3 vào `STEPS`, sau bước 2:

```ts
  3: (state) => {
    const mastery = isRecord(state.mastery) ? state.mastery : {};
    return {
      ...state,
      version: 4,
      wallet: { ...(isRecord(state.wallet) ? state.wallet : {}), history: [] },
      activity: { ...(isRecord(state.activity) ? state.activity : {}), seconds: {} },
      settings: { ...DEFAULT_SETTINGS, ...(isRecord(state.settings) ? state.settings : {}) },
      mastery: Object.fromEntries(
        Object.entries(mastery).map(([id, m]) => [id, { ...(isRecord(m) ? m : {}), coachedAt: null }]),
      ),
      inventory: { consumables: {}, owned: [], equipped: [] },
      rewards: { catalog: [], requests: [] },
      vacation: { since: null, ranges: [] },
      assigned: [],
      badges: {},
    };
  },
```

`src/game/mastery.ts`: `emptyMastery()` trả về thêm `coachedAt: null`:

```ts
export function emptyMastery(): ConceptMastery {
  return { score: 0, level: 1, run: 0, needsHelp: false, misconceptions: 0, recent: [], reviewMisses: 0, coachedAt: null };
}
```

`src/storage/types.ts`: `export const SCHEMA_VERSION = 4;`

`src/storage/backup.ts`: thêm migration 3 → 4 vào `MIGRATIONS`:

```ts
const MIGRATIONS: Record<number, (payload: BackupPayload) => BackupPayload> = {
  // Schema 2 only changed the game state (GameState version 2).
  1: (payload) => ({ ...payload, schemaVersion: 2, meta: { ...payload.meta, schemaVersion: 2 } }),
  // Schema 3 only changed the game state (GameState version 3).
  2: (payload) => ({ ...payload, schemaVersion: 3, meta: { ...payload.meta, schemaVersion: 3 } }),
  // Schema 4 only changed the game state (GameState version 4).
  3: (payload) => ({ ...payload, schemaVersion: 4, meta: { ...payload.meta, schemaVersion: 4 } }),
};
```

Sinh file mẫu schema 4 (đúng 1 lần):

```bash
npx tsx tools/make_backup_fixture.ts
```

Expected: `Wrote src/storage/fixtures/backup-v4.pypet`.

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run && npm run typecheck`
Expected: PASS toàn bộ. `git status` chỉ có `backup-v4.pypet` là file mẫu mới.

- [ ] **Step 5: Commit**

```bash
git add src/game/state.ts src/game/schema.ts src/game/migrate.ts src/game/migrate.test.ts src/game/mastery.ts src/game/dates.test.ts src/game/apply.test.ts src/storage/types.ts src/storage/backup.ts src/storage/backup.test.ts src/storage/fixtures/backup-v4.pypet src/ui/AppRoutes.test.tsx
git commit -m "feat(game): GameState version 4 with wallet history, shop, rewards, vacation, study time and badges

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Lịch sử ví xu

**Files:**
- Create: `src/game/wallet.ts`, `src/test/gameSteps.ts`
- Modify: `src/game/apply.ts`
- Test: `src/game/wallet.test.ts`

**Interfaces:**
- Consumes: `XuEntry`, `XuReason`, `WALLET_HISTORY_LIMIT` (Task 1).
- Produces: `changeXu(s, delta, reason, ref, day)`; mọi chỗ cộng xu trong `apply.ts` đi qua `changeXu` (code, trạm ôn, kiểm tra chủ đề, tiến hóa, chuỗi ngày, kế hoạch tuần). `judgeExercise` và `completeTopicTest` nhận thêm `today`. Helper test `at(day, hour?)`, `run(state, steps)`.

- [ ] **Step 1: Viết test thất bại**

`src/test/gameSteps.ts`:

```ts
import { apply, type GameEvent } from "../game/apply";
import type { GameState } from "../game/state";

/** 10:00 local time on `day` (or another hour). */
export const at = (day: string, hour = 10) => new Date(`${day}T${String(hour).padStart(2, "0")}:00:00`);

/** Applies each [day, event] in order. */
export function run(state: GameState, steps: [string, GameEvent][]): GameState {
  return steps.reduce((s, [day, event]) => apply(s, event, at(day)), state);
}
```

`src/game/wallet.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { at, run } from "../test/gameSteps";
import { apply } from "./apply";
import { initialGameState, WALLET_HISTORY_LIMIT } from "./state";
import { changeXu } from "./wallet";

describe("wallet history", () => {
  test("every xu change is recorded with its day, reason and source", () => {
    const state = run(initialGameState("2026-10-06"), [
      [
        "2026-10-06",
        { type: "ExerciseJudged", exerciseId: "e1", accepted: true, failedSubmitsBefore: 0, hintsUsed: 0, viewedSolution: false },
      ],
      ["2026-10-07", { type: "ReviewCompleted", stationId: "r1", correct: 5, total: 5 }],
      ["2026-10-07", { type: "TopicTestCompleted", topicId: "t1", score: 14, max: 14, items: [] }],
    ]);
    expect(state.wallet.xu).toBe(8 + 15 + 20);
    expect(state.wallet.history).toEqual([
      { day: "2026-10-06", delta: 8, reason: "code", ref: "e1" },
      { day: "2026-10-07", delta: 15, reason: "review", ref: "r1" },
      { day: "2026-10-07", delta: 20, reason: "topicTest", ref: "t1" },
    ]);
  });

  test("streak and week plan bonuses are recorded too", () => {
    let state = initialGameState("2026-10-05");
    state.settings.weeklyTarget = 1;
    for (const day of ["2026-10-05", "2026-10-06", "2026-10-07"]) {
      state = apply(state, { type: "LessonCompleted", lessonId: `l-${day}` }, at(day));
      state = apply(state, { type: "LessonCompleted", lessonId: `m-${day}` }, at(day));
    }
    state = apply(state, { type: "DayRollover" }, at("2026-10-12"));
    expect(state.wallet.history.map((entry) => [entry.reason, entry.delta, entry.ref])).toEqual([
      ["streak", 20, "3"],
      ["week", 100, "2026-10-05"],
    ]);
  });

  test("keeps the latest entries only", () => {
    const state = initialGameState("2026-10-06");
    for (let i = 0; i < WALLET_HISTORY_LIMIT + 5; i += 1) changeXu(state, 1, "code", `e${i}`, "2026-10-06");
    expect(state.wallet.xu).toBe(WALLET_HISTORY_LIMIT + 5);
    expect(state.wallet.history).toHaveLength(WALLET_HISTORY_LIMIT);
    expect(state.wallet.history[0]!.ref).toBe("e5");
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/game/wallet.test.ts`
Expected: FAIL: chưa có `./wallet`.

- [ ] **Step 3: Viết code**

`src/game/wallet.ts`:

```ts
import { WALLET_HISTORY_LIMIT, type GameState, type XuReason } from "./state";

/** Adds `delta` xu (negative to spend) and records it in the wallet history (spec 5.2). */
export function changeXu(s: GameState, delta: number, reason: XuReason, ref: string | null, day: string): void {
  if (delta === 0) return;
  s.wallet.xu += delta;
  s.wallet.history = [...s.wallet.history, { day, delta, reason, ref }].slice(-WALLET_HISTORY_LIMIT);
}
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
import { changeXu } from "./wallet";

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
      judgeExercise(next, event, today);
      break;
    case "QuestionAnswered":
      answerQuestion(next, event, today);
      break;
    case "ReviewCompleted":
      completeReview(next, event, today, rollback);
      break;
    case "TopicTestCompleted":
      completeTopicTest(next, event, today);
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
  if (target > 0 && s.week.lessonsDone >= target * WEEK_EXCEED_RATIO) changeXu(s, XU.weekPlanExceeded, "week", s.week.start, today);
  else if (target > 0 && s.week.lessonsDone >= target) changeXu(s, XU.weekPlanMet, "week", s.week.start, today);
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
  if (bonus) changeXu(s, bonus, "streak", String(s.streak.current), today);
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

function judgeExercise(s: GameState, e: Extract<GameEvent, { type: "ExerciseJudged" }>, today: string): void {
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
    changeXu(s, XU.codeFirstSubmit + (hintsUsed === 0 ? XU.noHintBonus : 0), "code", e.exerciseId, today);
    bumpCorrectRun(s);
    return;
  }
  s.pet.xp += XP.codeAfterRetries;
  if (failedSubmitsBefore >= PERSISTENCE_FAILS) changeXu(s, XU.persistenceBonus, "code", e.exerciseId, today);
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
  if (first) changeXu(s, XU.review + (total > 0 && correct === total ? XU.reviewPerfect : 0), "review", e.stationId, today);
  if (!rollback) addPoints(s, POINTS.review, today);
}

function raiseVui(s: GameState): void {
  s.pet.vui = Math.min(STAT_MAX, s.pet.vui + 1);
}

/** Spec 5.4-5.6: the first completion pays 30 XP; the first pass pays 20 xu and Vui +1. Any score moves the path on. */
function completeTopicTest(s: GameState, e: Extract<GameEvent, { type: "TopicTestCompleted" }>, today: string): void {
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
    changeXu(s, XU.topicTestPassed, "topicTest", e.topicId, today);
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
    // A test of a stage the robot already passed (a retake from the map) must not open a review set.
    if (e.stage !== s.pet.stage) return;
    s.remedial = e.remedialItems.length > 0 ? { stage: e.stage, items: e.remedialItems } : null;
    return;
  }
  s.remedial = null;
  // A second pass of the same stage changes nothing more.
  if (s.pet.stage !== e.stage) return;
  s.pet.stage += 1;
  s.pet.stageStartXp = s.pet.xp;
  changeXu(s, XU.evolution, "evolution", String(e.stage), localDay(now));
  raiseVui(s);
}
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/wallet.ts src/game/wallet.test.ts src/game/apply.ts src/test/gameSteps.ts
git commit -m "feat(game): record every xu change in the wallet history

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Cửa hàng: mua, dùng, đeo; quà chuỗi ngày

**Files:**
- Create: `src/game/shop.ts`
- Modify: `src/game/apply.ts`
- Test: `src/game/shop.test.ts`

**Interfaces:**
- Consumes: `changeXu` (Task 2); `inventory` (Task 1).
- Produces:
  - `ShopKind`, `AccessorySlot`, `ShopItem { id; kind; price: number | null; effect?; slot? }`, `SHOP_ITEMS`, `STREAK_GIFTS`, `MAX_CONSUMABLES = 9`, `findShopItem(id)`, `isConsumable(item)`.
  - Sự kiện `{ type: "ItemBought"; itemId }`, `{ type: "ItemUsed"; itemId }` (dùng món Pin/Vui, hoặc đeo/tháo phụ kiện). Chuỗi 3/7/14/30 ngày tặng phụ kiện quà.

- [ ] **Step 1: Viết test thất bại**

`src/game/shop.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { at, run } from "../test/gameSteps";
import { apply, type GameEvent } from "./apply";
import { MAX_CONSUMABLES, SHOP_ITEMS, STREAK_GIFTS } from "./shop";
import { initialGameState, type GameState } from "./state";

const DAY = "2026-10-06";
const buy = (itemId: string): GameEvent => ({ type: "ItemBought", itemId });
const use = (itemId: string): GameEvent => ({ type: "ItemUsed", itemId });

function withXu(xu: number): GameState {
  const state = initialGameState(DAY);
  state.wallet.xu = xu;
  return state;
}

describe("shop items", () => {
  test("every item has a unique id; gifts are not sold and are accessories", () => {
    const ids = SHOP_ITEMS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const gift of Object.values(STREAK_GIFTS)) {
      expect(SHOP_ITEMS.find((item) => item.id === gift)).toMatchObject({ kind: "accessory", price: null });
    }
  });
});

describe("ItemBought", () => {
  test("pays the price, records it and keeps the item", () => {
    const state = apply(withXu(100), buy("pin-sac"), at(DAY));
    expect(state.wallet.xu).toBe(70);
    expect(state.inventory.consumables).toEqual({ "pin-sac": 1 });
    expect(state.wallet.history).toEqual([{ day: DAY, delta: -30, reason: "shop", ref: "pin-sac" }]);
  });

  test("needs enough xu", () => {
    const state = apply(withXu(29), buy("pin-sac"), at(DAY));
    expect(state.wallet.xu).toBe(29);
    expect(state.inventory.consumables).toEqual({});
  });

  test("an accessory or a decoration is bought once; a gift cannot be bought", () => {
    const state = run(withXu(500), [
      [DAY, buy("kinh-ram")],
      [DAY, buy("kinh-ram")],
      [DAY, buy("tranh")],
      [DAY, buy("tranh")],
      [DAY, buy("vuong-mien")],
      [DAY, buy("khong-co")],
    ]);
    expect(state.inventory.owned).toEqual(["kinh-ram", "tranh"]);
    expect(state.wallet.xu).toBe(500 - 60 - 60);
  });

  test("keeps at most 9 of a Pin or Vui item", () => {
    const steps: [string, GameEvent][] = Array.from({ length: MAX_CONSUMABLES + 1 }, () => [DAY, buy("bong")]);
    const state = run(withXu(1000), steps);
    expect(state.inventory.consumables).toEqual({ bong: MAX_CONSUMABLES });
    expect(state.wallet.xu).toBe(1000 - 15 * MAX_CONSUMABLES);
  });
});

describe("ItemUsed", () => {
  test("a Pin item raises Pin up to 5; a Vui item raises Vui", () => {
    const start = withXu(200);
    start.pet.pin = 2;
    start.pet.vui = 1;
    const state = run(start, [
      [DAY, buy("pin-sac")],
      [DAY, buy("pin-sac")],
      [DAY, buy("bong")],
      [DAY, use("pin-sac")],
      [DAY, use("bong")],
    ]);
    expect(state.pet).toMatchObject({ pin: 4, vui: 2 });
    expect(state.inventory.consumables).toEqual({ "pin-sac": 1 });
  });

  test("is not used up when the stat is full or the item is missing", () => {
    const start = withXu(100);
    start.pet.pin = 5;
    const state = run(start, [
      [DAY, buy("dau-nhot")],
      [DAY, use("dau-nhot")],
      [DAY, use("bong")],
    ]);
    expect(state.pet.pin).toBe(5);
    expect(state.inventory.consumables).toEqual({ "dau-nhot": 1 });
  });

  test("puts an accessory on and off, 1 per slot", () => {
    const state = run(withXu(500), [
      [DAY, buy("no-buom")],
      [DAY, buy("khan-quang")],
      [DAY, buy("kinh-ram")],
      [DAY, use("no-buom")],
      [DAY, use("kinh-ram")],
      [DAY, use("khan-quang")],
    ]);
    expect(state.inventory.equipped).toEqual(["kinh-ram", "khan-quang"]);
    const off = apply(state, use("kinh-ram"), at(DAY));
    expect(off.inventory.equipped).toEqual(["khan-quang"]);
    const notOwned = apply(off, use("tai-nghe"), at(DAY));
    expect(notOwned.inventory.equipped).toEqual(["khan-quang"]);
  });
});

describe("streak gifts", () => {
  test("a 3-day streak gives its accessory with the bonus", () => {
    let state = initialGameState("2026-10-05");
    for (const day of ["2026-10-05", "2026-10-06", "2026-10-07"]) {
      state = apply(state, { type: "LessonCompleted", lessonId: `l-${day}` }, at(day));
      state = apply(state, { type: "LessonCompleted", lessonId: `m-${day}` }, at(day));
    }
    expect(state.inventory.owned).toEqual([STREAK_GIFTS[3]]);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/game/shop.test.ts`
Expected: FAIL: chưa có `./shop`.

- [ ] **Step 3: Viết code**

`src/game/shop.ts`:

```ts
/** The robot shop (spec 5.12): Pin and Vui items to use, accessories to wear, decorations for the room. */
export type ShopKind = "pin" | "vui" | "accessory" | "decor";
export type AccessorySlot = "head" | "face" | "neck";

export interface ShopItem {
  id: string;
  kind: ShopKind;
  /** null: not sold, only given as a streak gift. */
  price: number | null;
  /** Pin or Vui added when used. */
  effect?: number;
  slot?: AccessorySlot;
}

/** Prices are a first guess (spec 13.7: about 40 to 60 xu a day); the parent area shows the real daily average. */
export const SHOP_ITEMS: readonly ShopItem[] = [
  { id: "dau-nhot", kind: "pin", price: 15, effect: 1 },
  { id: "pin-sac", kind: "pin", price: 30, effect: 2 },
  { id: "bong", kind: "vui", price: 15, effect: 1 },
  { id: "no-buom", kind: "accessory", price: 40, slot: "neck" },
  { id: "khan-quang", kind: "accessory", price: 60, slot: "neck" },
  { id: "kinh-ram", kind: "accessory", price: 60, slot: "face" },
  { id: "kinh-tron", kind: "accessory", price: 80, slot: "face" },
  { id: "mu-luoi-trai", kind: "accessory", price: 80, slot: "head" },
  { id: "tai-nghe", kind: "accessory", price: 120, slot: "head" },
  { id: "ghim-sao", kind: "accessory", price: null, slot: "neck" },
  { id: "ang-ten-vang", kind: "accessory", price: null, slot: "head" },
  { id: "ao-choang", kind: "accessory", price: null, slot: "neck" },
  { id: "vuong-mien", kind: "accessory", price: null, slot: "head" },
  { id: "chau-cay", kind: "decor", price: 40 },
  { id: "den-ngu", kind: "decor", price: 50 },
  { id: "tranh", kind: "decor", price: 60 },
  { id: "tham", kind: "decor", price: 70 },
  { id: "ke-sach", kind: "decor", price: 90 },
];

/** Streak length -> the accessory given with the streak bonus (spec 5.5: "kèm phụ kiện"). */
export const STREAK_GIFTS: Readonly<Record<number, string>> = {
  3: "ghim-sao",
  7: "ang-ten-vang",
  14: "ao-choang",
  30: "vuong-mien",
};

/** Unused Pin and Vui items kept of each kind. */
export const MAX_CONSUMABLES = 9;

export function findShopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((item) => item.id === id);
}

export function isConsumable(item: ShopItem): boolean {
  return item.kind === "pin" || item.kind === "vui";
}
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
import { findShopItem, isConsumable, MAX_CONSUMABLES, STREAK_GIFTS } from "./shop";
import { changeXu } from "./wallet";

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
  | { type: "ItemBought"; itemId: string }
  /** Uses a Pin or Vui item, or puts an accessory on or takes it off. */
  | { type: "ItemUsed"; itemId: string }
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
      judgeExercise(next, event, today);
      break;
    case "QuestionAnswered":
      answerQuestion(next, event, today);
      break;
    case "ReviewCompleted":
      completeReview(next, event, today, rollback);
      break;
    case "TopicTestCompleted":
      completeTopicTest(next, event, today);
      break;
    case "EvolutionTestCompleted":
      completeEvolutionTest(next, event, now);
      break;
    case "RemedialCompleted":
      next.remedial = null;
      break;
    case "ItemBought":
      buyItem(next, event.itemId, today);
      break;
    case "ItemUsed":
      useItem(next, event.itemId);
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
  if (target > 0 && s.week.lessonsDone >= target * WEEK_EXCEED_RATIO) changeXu(s, XU.weekPlanExceeded, "week", s.week.start, today);
  else if (target > 0 && s.week.lessonsDone >= target) changeXu(s, XU.weekPlanMet, "week", s.week.start, today);
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
  if (bonus) changeXu(s, bonus, "streak", String(s.streak.current), today);
  const gift = STREAK_GIFTS[s.streak.current];
  if (gift && !s.inventory.owned.includes(gift)) s.inventory.owned.push(gift);
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

function judgeExercise(s: GameState, e: Extract<GameEvent, { type: "ExerciseJudged" }>, today: string): void {
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
    changeXu(s, XU.codeFirstSubmit + (hintsUsed === 0 ? XU.noHintBonus : 0), "code", e.exerciseId, today);
    bumpCorrectRun(s);
    return;
  }
  s.pet.xp += XP.codeAfterRetries;
  if (failedSubmitsBefore >= PERSISTENCE_FAILS) changeXu(s, XU.persistenceBonus, "code", e.exerciseId, today);
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
  if (first) changeXu(s, XU.review + (total > 0 && correct === total ? XU.reviewPerfect : 0), "review", e.stationId, today);
  if (!rollback) addPoints(s, POINTS.review, today);
}

function raiseVui(s: GameState): void {
  s.pet.vui = Math.min(STAT_MAX, s.pet.vui + 1);
}

/** Spec 5.4-5.6: the first completion pays 30 XP; the first pass pays 20 xu and Vui +1. Any score moves the path on. */
function completeTopicTest(s: GameState, e: Extract<GameEvent, { type: "TopicTestCompleted" }>, today: string): void {
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
    changeXu(s, XU.topicTestPassed, "topicTest", e.topicId, today);
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
    // A test of a stage the robot already passed (a retake from the map) must not open a review set.
    if (e.stage !== s.pet.stage) return;
    s.remedial = e.remedialItems.length > 0 ? { stage: e.stage, items: e.remedialItems } : null;
    return;
  }
  s.remedial = null;
  // A second pass of the same stage changes nothing more.
  if (s.pet.stage !== e.stage) return;
  s.pet.stage += 1;
  s.pet.stageStartXp = s.pet.xp;
  changeXu(s, XU.evolution, "evolution", String(e.stage), localDay(now));
  raiseVui(s);
}

/** Spec 5.12. A purchase needs enough xu; an accessory or a decoration is bought once, a Pin or Vui item up to 9. */
function buyItem(s: GameState, itemId: string, today: string): void {
  const item = findShopItem(itemId);
  if (!item || item.price === null || s.wallet.xu < item.price) return;
  if (isConsumable(item)) {
    const have = s.inventory.consumables[itemId] ?? 0;
    if (have >= MAX_CONSUMABLES) return;
    s.inventory.consumables[itemId] = have + 1;
  } else {
    if (s.inventory.owned.includes(itemId)) return;
    s.inventory.owned.push(itemId);
  }
  changeXu(s, -item.price, "shop", itemId, today);
}

/** A Pin or Vui item is used only when it can raise its stat; an accessory is worn alone in its slot. */
function useItem(s: GameState, itemId: string): void {
  const item = findShopItem(itemId);
  if (!item) return;
  if (isConsumable(item)) {
    const have = s.inventory.consumables[itemId] ?? 0;
    const stat = item.kind === "pin" ? "pin" : "vui";
    if (have === 0 || s.pet[stat] >= STAT_MAX) return;
    s.pet[stat] = Math.min(STAT_MAX, s.pet[stat] + (item.effect ?? 0));
    if (have === 1) delete s.inventory.consumables[itemId];
    else s.inventory.consumables[itemId] = have - 1;
    return;
  }
  if (item.kind !== "accessory" || !s.inventory.owned.includes(itemId)) return;
  if (s.inventory.equipped.includes(itemId)) {
    s.inventory.equipped = s.inventory.equipped.filter((id) => id !== itemId);
    return;
  }
  s.inventory.equipped = [
    ...s.inventory.equipped.filter((id) => findShopItem(id)?.slot !== item.slot),
    itemId,
  ];
}
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/shop.ts src/game/shop.test.ts src/game/apply.ts
git commit -m "feat(game): shop items to buy, use and wear; streak gifts

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 4: Phần thưởng thật: danh sách, xin đổi, duyệt

**Files:**
- Create: `src/game/realRewards.ts`
- Modify: `src/game/apply.ts`
- Test: `src/game/realRewards.test.ts`

**Interfaces:**
- Consumes: `changeXu` (Task 2); `rewards` (Task 1); `weekStart`, `localDay` (dates.ts).
- Produces:
  - `REWARD_HISTORY_LIMIT = 100`, `type RequestBlock = "xu" | "limit"`, `freeXu(state)`, `requestsThisWeek(state, rewardId, today)`, `requestBlock(state, reward, today)`, `cleanCatalog(catalog)`, `trimRequests(requests)`.
  - Sự kiện `{ type: "RewardsEdited"; catalog }`, `{ type: "RewardRequested"; requestId; rewardId }`, `{ type: "RewardApproved"; requestId }`, `{ type: "RewardRejected"; requestId }`.

- [ ] **Step 1: Viết test thất bại**

`src/game/realRewards.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { at, run } from "../test/gameSteps";
import { apply, type GameEvent } from "./apply";
import { cleanCatalog, freeXu, REWARD_HISTORY_LIMIT, requestBlock } from "./realRewards";
import { initialGameState, type GameState, type RewardItem } from "./state";

const MONDAY = "2026-10-05";
const PARK: RewardItem = { id: "park", name: "Đi công viên", price: 100, weeklyLimit: 1 };
const ICE: RewardItem = { id: "ice", name: "Kem", price: 30, weeklyLimit: 2 };

function withRewards(xu: number): GameState {
  const state = initialGameState(MONDAY);
  state.wallet.xu = xu;
  return apply(state, { type: "RewardsEdited", catalog: [PARK, ICE] }, at(MONDAY));
}

const ask = (requestId: string, rewardId: string): GameEvent => ({ type: "RewardRequested", requestId, rewardId });

describe("RewardsEdited", () => {
  test("cleans the parent's list", () => {
    expect(
      cleanCatalog([
        { id: "a", name: "  Kem ", price: 30.7, weeklyLimit: -1 },
        { id: "a", name: "Kem 2", price: 10, weeklyLimit: 1 },
        { id: "b", name: "   ", price: 10, weeklyLimit: 1 },
        { id: "", name: "No id", price: 10, weeklyLimit: 1 },
      ]),
    ).toEqual([{ id: "a", name: "Kem", price: 30, weeklyLimit: 0 }]);
  });
});

describe("RewardRequested", () => {
  test("creates a pending request; no xu is taken yet", () => {
    const state = apply(withRewards(150), ask("q1", "park"), at(MONDAY));
    expect(state.wallet.xu).toBe(150);
    expect(state.rewards.requests).toEqual([
      { id: "q1", rewardId: "park", name: "Đi công viên", price: 100, at: at(MONDAY).toISOString(), status: "pending", decidedAt: null },
    ]);
    expect(freeXu(state)).toBe(50);
  });

  test("needs enough free xu and respects the weekly limit", () => {
    const state = run(withRewards(150), [
      [MONDAY, ask("q1", "park")],
      [MONDAY, ask("q2", "ice")],
      [MONDAY, ask("q3", "ice")],
      [MONDAY, ask("q4", "ice")],
    ]);
    expect(state.rewards.requests.map((r) => r.id)).toEqual(["q1", "q2"]);
    expect(requestBlock(state, ICE, MONDAY)).toBe("xu");
    const richer = { ...state, wallet: { ...state.wallet, xu: 1000 } };
    expect(requestBlock(richer, PARK, MONDAY)).toBe("limit");
    expect(requestBlock(richer, PARK, "2026-10-12")).toBeNull();
  });

  test("an unknown reward or a repeated request id does nothing", () => {
    const state = run(withRewards(500), [
      [MONDAY, ask("q1", "nope")],
      [MONDAY, ask("q2", "ice")],
      [MONDAY, ask("q2", "ice")],
    ]);
    expect(state.rewards.requests.map((r) => r.id)).toEqual(["q2"]);
  });
});

describe("RewardApproved and RewardRejected", () => {
  test("approving takes the xu and records it; rejecting takes nothing", () => {
    const state = run(withRewards(150), [
      [MONDAY, ask("q1", "park")],
      [MONDAY, ask("q2", "ice")],
      ["2026-10-06", { type: "RewardApproved", requestId: "q1" }],
      ["2026-10-06", { type: "RewardRejected", requestId: "q2" }],
      ["2026-10-06", { type: "RewardApproved", requestId: "q2" }],
    ]);
    expect(state.wallet.xu).toBe(50);
    expect(state.wallet.history).toEqual([{ day: "2026-10-06", delta: -100, reason: "reward", ref: "park" }]);
    expect(state.rewards.requests.map((r) => [r.id, r.status])).toEqual([
      ["q1", "approved"],
      ["q2", "rejected"],
    ]);
    expect(state.rewards.requests[0]!.decidedAt).toBe(at("2026-10-06").toISOString());
  });

  test("an approval waits while the child has too few xu", () => {
    const asked = apply(withRewards(100), ask("q1", "park"), at(MONDAY));
    const spent = { ...asked, wallet: { ...asked.wallet, xu: 40 } };
    const state = apply(spent, { type: "RewardApproved", requestId: "q1" }, at(MONDAY));
    expect(state.wallet.xu).toBe(40);
    expect(state.rewards.requests[0]!.status).toBe("pending");
  });

  test("keeps every pending request and the latest decided ones", () => {
    let state = withRewards(100_000);
    state.rewards.catalog = [{ ...ICE, weeklyLimit: 1000 }];
    for (let i = 0; i < REWARD_HISTORY_LIMIT + 3; i += 1) {
      state = apply(state, ask(`q${i}`, "ice"), at(MONDAY));
      state = apply(state, { type: "RewardRejected", requestId: `q${i}` }, at(MONDAY));
    }
    state = apply(state, ask("last", "ice"), at(MONDAY));
    expect(state.rewards.requests).toHaveLength(REWARD_HISTORY_LIMIT + 1);
    expect(state.rewards.requests[0]!.id).toBe("q3");
    expect(state.rewards.requests.at(-1)).toMatchObject({ id: "last", status: "pending" });
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/game/realRewards.test.ts`
Expected: FAIL: chưa có `./realRewards`.

- [ ] **Step 3: Viết code**

`src/game/realRewards.ts`:

```ts
import { localDay, weekStart } from "./dates";
import type { GameState, RewardItem, RewardRequest } from "./state";

/** Decided requests kept for the history (pending ones are always kept). */
export const REWARD_HISTORY_LIMIT = 100;

export type RequestBlock = "xu" | "limit";

/** Xu still free to ask with: the balance minus the pending requests. */
export function freeXu(state: GameState): number {
  const pending = state.rewards.requests.filter((r) => r.status === "pending").reduce((sum, r) => sum + r.price, 0);
  return state.wallet.xu - pending;
}

/** Requests of a reward this week (pending or approved), for its weekly limit (spec 5.12). */
export function requestsThisWeek(state: GameState, rewardId: string, today: string): number {
  const start = weekStart(today);
  return state.rewards.requests.filter(
    (r) => r.rewardId === rewardId && r.status !== "rejected" && localDay(new Date(r.at)) >= start,
  ).length;
}

/** Why the child cannot ask for this reward now, or null when they can. */
export function requestBlock(state: GameState, reward: RewardItem, today: string): RequestBlock | null {
  if (freeXu(state) < reward.price) return "xu";
  if (requestsThisWeek(state, reward.id, today) >= reward.weeklyLimit) return "limit";
  return null;
}

/** A clean reward list: trimmed names, whole non-negative numbers, no empty names, no repeated ids. */
export function cleanCatalog(catalog: RewardItem[]): RewardItem[] {
  const seen = new Set<string>();
  const clean: RewardItem[] = [];
  for (const item of catalog) {
    const name = item.name.trim();
    if (!item.id || seen.has(item.id) || name === "") continue;
    seen.add(item.id);
    clean.push({
      id: item.id,
      name,
      price: Math.max(0, Math.floor(item.price)),
      weeklyLimit: Math.max(0, Math.floor(item.weeklyLimit)),
    });
  }
  return clean;
}

/** Pending requests, then the latest decided ones. */
export function trimRequests(requests: RewardRequest[]): RewardRequest[] {
  const decided = requests.filter((r) => r.status !== "pending");
  const keep = new Set(decided.slice(-REWARD_HISTORY_LIMIT));
  return requests.filter((r) => r.status === "pending" || keep.has(r));
}
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
  type RewardItem,
} from "./state";
import { cleanCatalog, requestBlock, trimRequests } from "./realRewards";
import { findShopItem, isConsumable, MAX_CONSUMABLES, STREAK_GIFTS } from "./shop";
import { changeXu } from "./wallet";

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
  | { type: "ItemBought"; itemId: string }
  /** Uses a Pin or Vui item, or puts an accessory on or takes it off. */
  | { type: "ItemUsed"; itemId: string }
  /** The parent's list of real rewards (spec 5.12), replaced as a whole. */
  | { type: "RewardsEdited"; catalog: RewardItem[] }
  /** `requestId` is made by the caller (the UI), so the rule stays pure. */
  | { type: "RewardRequested"; requestId: string; rewardId: string }
  | { type: "RewardApproved"; requestId: string }
  | { type: "RewardRejected"; requestId: string }
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
      judgeExercise(next, event, today);
      break;
    case "QuestionAnswered":
      answerQuestion(next, event, today);
      break;
    case "ReviewCompleted":
      completeReview(next, event, today, rollback);
      break;
    case "TopicTestCompleted":
      completeTopicTest(next, event, today);
      break;
    case "EvolutionTestCompleted":
      completeEvolutionTest(next, event, now);
      break;
    case "RemedialCompleted":
      next.remedial = null;
      break;
    case "ItemBought":
      buyItem(next, event.itemId, today);
      break;
    case "ItemUsed":
      useItem(next, event.itemId);
      break;
    case "RewardsEdited":
      next.rewards.catalog = cleanCatalog(event.catalog);
      break;
    case "RewardRequested":
      requestReward(next, event, now, today);
      break;
    case "RewardApproved":
      decideReward(next, event.requestId, true, now, today);
      break;
    case "RewardRejected":
      decideReward(next, event.requestId, false, now, today);
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
  if (target > 0 && s.week.lessonsDone >= target * WEEK_EXCEED_RATIO) changeXu(s, XU.weekPlanExceeded, "week", s.week.start, today);
  else if (target > 0 && s.week.lessonsDone >= target) changeXu(s, XU.weekPlanMet, "week", s.week.start, today);
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
  if (bonus) changeXu(s, bonus, "streak", String(s.streak.current), today);
  const gift = STREAK_GIFTS[s.streak.current];
  if (gift && !s.inventory.owned.includes(gift)) s.inventory.owned.push(gift);
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

function judgeExercise(s: GameState, e: Extract<GameEvent, { type: "ExerciseJudged" }>, today: string): void {
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
    changeXu(s, XU.codeFirstSubmit + (hintsUsed === 0 ? XU.noHintBonus : 0), "code", e.exerciseId, today);
    bumpCorrectRun(s);
    return;
  }
  s.pet.xp += XP.codeAfterRetries;
  if (failedSubmitsBefore >= PERSISTENCE_FAILS) changeXu(s, XU.persistenceBonus, "code", e.exerciseId, today);
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
  if (first) changeXu(s, XU.review + (total > 0 && correct === total ? XU.reviewPerfect : 0), "review", e.stationId, today);
  if (!rollback) addPoints(s, POINTS.review, today);
}

function raiseVui(s: GameState): void {
  s.pet.vui = Math.min(STAT_MAX, s.pet.vui + 1);
}

/** Spec 5.4-5.6: the first completion pays 30 XP; the first pass pays 20 xu and Vui +1. Any score moves the path on. */
function completeTopicTest(s: GameState, e: Extract<GameEvent, { type: "TopicTestCompleted" }>, today: string): void {
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
    changeXu(s, XU.topicTestPassed, "topicTest", e.topicId, today);
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
    // A test of a stage the robot already passed (a retake from the map) must not open a review set.
    if (e.stage !== s.pet.stage) return;
    s.remedial = e.remedialItems.length > 0 ? { stage: e.stage, items: e.remedialItems } : null;
    return;
  }
  s.remedial = null;
  // A second pass of the same stage changes nothing more.
  if (s.pet.stage !== e.stage) return;
  s.pet.stage += 1;
  s.pet.stageStartXp = s.pet.xp;
  changeXu(s, XU.evolution, "evolution", String(e.stage), localDay(now));
  raiseVui(s);
}

/** Spec 5.12. A purchase needs enough xu; an accessory or a decoration is bought once, a Pin or Vui item up to 9. */
function buyItem(s: GameState, itemId: string, today: string): void {
  const item = findShopItem(itemId);
  if (!item || item.price === null || s.wallet.xu < item.price) return;
  if (isConsumable(item)) {
    const have = s.inventory.consumables[itemId] ?? 0;
    if (have >= MAX_CONSUMABLES) return;
    s.inventory.consumables[itemId] = have + 1;
  } else {
    if (s.inventory.owned.includes(itemId)) return;
    s.inventory.owned.push(itemId);
  }
  changeXu(s, -item.price, "shop", itemId, today);
}

/** A Pin or Vui item is used only when it can raise its stat; an accessory is worn alone in its slot. */
function useItem(s: GameState, itemId: string): void {
  const item = findShopItem(itemId);
  if (!item) return;
  if (isConsumable(item)) {
    const have = s.inventory.consumables[itemId] ?? 0;
    const stat = item.kind === "pin" ? "pin" : "vui";
    if (have === 0 || s.pet[stat] >= STAT_MAX) return;
    s.pet[stat] = Math.min(STAT_MAX, s.pet[stat] + (item.effect ?? 0));
    if (have === 1) delete s.inventory.consumables[itemId];
    else s.inventory.consumables[itemId] = have - 1;
    return;
  }
  if (item.kind !== "accessory" || !s.inventory.owned.includes(itemId)) return;
  if (s.inventory.equipped.includes(itemId)) {
    s.inventory.equipped = s.inventory.equipped.filter((id) => id !== itemId);
    return;
  }
  s.inventory.equipped = [
    ...s.inventory.equipped.filter((id) => findShopItem(id)?.slot !== item.slot),
    itemId,
  ];
}

/** Spec 5.12: asking creates a request waiting for the parent; no xu is taken yet. */
function requestReward(
  s: GameState,
  e: Extract<GameEvent, { type: "RewardRequested" }>,
  now: Date,
  today: string,
): void {
  const reward = s.rewards.catalog.find((item) => item.id === e.rewardId);
  if (!reward || s.rewards.requests.some((r) => r.id === e.requestId) || requestBlock(s, reward, today) !== null) return;
  s.rewards.requests.push({
    id: e.requestId,
    rewardId: reward.id,
    name: reward.name,
    price: reward.price,
    at: now.toISOString(),
    status: "pending",
    decidedAt: null,
  });
}

/** Spec 5.12: xu are taken only when the parent approves (with the PIN), and only if the child still has them. */
function decideReward(s: GameState, requestId: string, approve: boolean, now: Date, today: string): void {
  const request = s.rewards.requests.find((r) => r.id === requestId);
  if (!request || request.status !== "pending") return;
  if (approve) {
    if (s.wallet.xu < request.price) return;
    changeXu(s, -request.price, "reward", request.rewardId, today);
  }
  request.status = approve ? "approved" : "rejected";
  request.decidedAt = now.toISOString();
  s.rewards.requests = trimRequests(s.rewards.requests);
}
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/realRewards.ts src/game/realRewards.test.ts src/game/apply.ts
git commit -m "feat(game): real rewards: the parent's list, requests with a weekly limit, approval takes the xu

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Chế độ nghỉ

**Files:**
- Create: `src/game/vacation.ts`
- Modify: `src/game/apply.ts`, `src/game/progress.ts`
- Test: `src/game/vacation.test.ts`

**Interfaces:**
- Consumes: `vacation`, `KEEP_DAYS` (Task 1); `changeXu` (Task 2).
- Produces:
  - `isVacationDay(state, day)`, `workDaysBetween(state, from, to)` (số ngày không nghỉ nằm giữa 2 ngày, không tính 2 đầu), `workDaysOfWeek`, `weekTarget(state, monday)`, `toggleVacation`, `scheduleVacation`, `cancelVacation`, `pruneVacations`.
  - Sự kiện `{ type: "VacationToggled"; on }`, `{ type: "VacationScheduled"; start; end }`, `{ type: "VacationCancelled"; start }`.
  - `progress.ts`: `roomCondition(state, today): PetCondition | "vacation"`; `displayStreak` bỏ qua ngày nghỉ.
  - Trong `apply.ts`: suy giảm Pin/Vui, chuỗi ngày và chốt kế hoạch tuần bỏ qua ngày nghỉ; khoảng nghỉ cũ hơn 60 ngày bị xóa khi sang ngày.

- [ ] **Step 1: Viết test thất bại**

`src/game/vacation.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { at, run } from "../test/gameSteps";
import { apply, type GameEvent } from "./apply";
import { displayStreak, roomCondition } from "./progress";
import { initialGameState, type GameState } from "./state";
import { isVacationDay, weekTarget, workDaysBetween } from "./vacation";

const lessons = (day: string): [string, GameEvent][] => [
  [day, { type: "LessonCompleted", lessonId: `a-${day}` }],
  [day, { type: "LessonCompleted", lessonId: `b-${day}` }],
];

describe("vacation days", () => {
  test("switched on now, then off: the days taken stay vacation days", () => {
    const state = run(initialGameState("2026-10-05"), [
      ["2026-10-06", { type: "VacationToggled", on: true }],
      ["2026-10-09", { type: "VacationToggled", on: false }],
    ]);
    expect(state.vacation).toEqual({ since: null, ranges: [{ start: "2026-10-06", end: "2026-10-08" }] });
    expect(["2026-10-05", "2026-10-06", "2026-10-08", "2026-10-09"].map((d) => isVacationDay(state, d))).toEqual([
      false,
      true,
      true,
      false,
    ]);
  });

  test("scheduled from today or later; a cancelled one is removed or ends yesterday", () => {
    const start = initialGameState("2026-10-05");
    const state = run(start, [
      ["2026-10-05", { type: "VacationScheduled", start: "2026-10-01", end: "2026-10-03" }],
      ["2026-10-05", { type: "VacationScheduled", start: "2026-10-12", end: "2026-10-10" }],
      ["2026-10-05", { type: "VacationScheduled", start: "2026-10-12", end: "2026-10-16" }],
      ["2026-10-05", { type: "VacationScheduled", start: "2026-10-20", end: "2026-10-21" }],
      ["2026-10-14", { type: "VacationCancelled", start: "2026-10-12" }],
      ["2026-10-14", { type: "VacationCancelled", start: "2026-10-20" }],
    ]);
    expect(state.vacation.ranges).toEqual([{ start: "2026-10-12", end: "2026-10-13" }]);
  });

  test("counts only the days that are not vacation days", () => {
    const state = initialGameState("2026-10-05");
    state.vacation.ranges = [{ start: "2026-10-07", end: "2026-10-08" }];
    expect(workDaysBetween(state, "2026-10-05", "2026-10-10")).toBe(2);
    expect(workDaysBetween(state, "2026-10-05", "2026-10-06")).toBe(0);
    state.settings.weeklyTarget = 10;
    expect(weekTarget(state, "2026-10-05")).toBe(8);
  });
});

describe("vacation and the game", () => {
  test("Pin and Vui do not drop on vacation days", () => {
    const state = run(initialGameState("2026-10-05"), [
      ...lessons("2026-10-05"),
      ["2026-10-06", { type: "VacationToggled", on: true }],
      ["2026-10-15", { type: "DayRollover" }],
    ]);
    expect(state.pet).toMatchObject({ pin: 5, vui: 4 });
  });

  test("the streak is frozen during a vacation", () => {
    const state = run(initialGameState("2026-10-05"), [
      ...lessons("2026-10-05"),
      ["2026-10-06", { type: "VacationScheduled", start: "2026-10-06", end: "2026-10-10" }],
      ...lessons("2026-10-11"),
    ]);
    expect(state.streak.current).toBe(2);
    expect(displayStreak(state, "2026-10-12")).toBe(2);
  });

  test("the week plan leaves out vacation days", () => {
    const start = initialGameState("2026-10-05");
    start.settings.weeklyTarget = 7;
    const state = run(start, [
      ["2026-10-05", { type: "VacationScheduled", start: "2026-10-07", end: "2026-10-11" }],
      ...lessons("2026-10-05"),
      ["2026-10-12", { type: "DayRollover" }],
    ]);
    // 2 working days: the plan of 7 lessons becomes 2, and 2 lessons meet it.
    expect(state.wallet.history).toEqual([{ day: "2026-10-12", delta: 50, reason: "week", ref: "2026-10-05" }]);
  });

  test("the room shows the vacation first", () => {
    const state = apply(initialGameState("2026-10-05"), { type: "VacationToggled", on: true }, at("2026-10-05"));
    state.pet.pin = 0;
    expect(roomCondition(state, "2026-10-05")).toBe("vacation");
    expect(roomCondition({ ...state, vacation: { since: null, ranges: [] } }, "2026-10-05")).toBe("drained");
  });

  test("old ranges are dropped after 60 days", () => {
    const start = initialGameState("2026-10-05");
    start.vacation.ranges = [
      { start: "2026-07-01", end: "2026-07-02" },
      { start: "2026-09-01", end: "2026-09-02" },
    ];
    const state = apply(start, { type: "DayRollover" }, at("2026-10-05"));
    expect(state.vacation.ranges).toEqual([{ start: "2026-09-01", end: "2026-09-02" }]);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/game/vacation.test.ts`
Expected: FAIL: chưa có `./vacation`.

- [ ] **Step 3: Viết code**

`src/game/vacation.ts`:

```ts
import { addDays, daysBetween } from "./dates";
import { KEEP_DAYS, type GameState } from "./state";

/** Longer gaps are counted without looking at each day (vacations are kept for KEEP_DAYS days only). */
const COUNT_LIMIT = 400;

/** Spec 5.7: a day of the vacation switched on now (from `since`) or of a scheduled or past range. */
export function isVacationDay(state: GameState, day: string): boolean {
  const { since, ranges } = state.vacation;
  if (since !== null && day >= since) return true;
  return ranges.some((range) => range.start <= day && day <= range.end);
}

/** The days strictly between `from` and `to` that are not vacation days (spec 5.6-5.8: they do not count). */
export function workDaysBetween(state: GameState, from: string, to: string): number {
  const gap = daysBetween(from, to) - 1;
  if (gap <= 0) return 0;
  if (gap > COUNT_LIMIT) return gap;
  let count = 0;
  for (let i = 1; i <= gap; i += 1) if (!isVacationDay(state, addDays(from, i))) count += 1;
  return count;
}

/** The days of the week starting on `monday` that are not vacation days. */
export function workDaysOfWeek(state: GameState, monday: string): number {
  let count = 0;
  for (let i = 0; i < 7; i += 1) if (!isVacationDay(state, addDays(monday, i))) count += 1;
  return count;
}

/** The week plan without its vacation days (spec 5.7), rounded up. */
export function weekTarget(state: GameState, monday: string): number {
  return Math.ceil((state.settings.weeklyTarget * workDaysOfWeek(state, monday)) / 7);
}

/** Switches the vacation on from `today`, or off: the days already taken become a past range. */
export function toggleVacation(s: GameState, on: boolean, today: string): void {
  const { since } = s.vacation;
  if (on) {
    if (since === null) s.vacation.since = today;
    return;
  }
  if (since === null) return;
  const yesterday = addDays(today, -1);
  if (since <= yesterday) s.vacation.ranges.push({ start: since, end: yesterday });
  s.vacation.since = null;
}

/** Schedules a vacation from today or later. */
export function scheduleVacation(s: GameState, start: string, end: string, today: string): void {
  if (start > end || start < today) return;
  s.vacation.ranges.push({ start, end });
}

/** Cancels the scheduled vacation that starts on `start`: a future one is removed, a running one ends yesterday. */
export function cancelVacation(s: GameState, start: string, today: string): void {
  const yesterday = addDays(today, -1);
  s.vacation.ranges = s.vacation.ranges.flatMap((range) => {
    if (range.start !== start || range.end < today) return [range];
    return range.start <= yesterday ? [{ start: range.start, end: yesterday }] : [];
  });
}

/** Drops the ranges that ended more than KEEP_DAYS days ago. */
export function pruneVacations(s: GameState, today: string): void {
  const oldest = addDays(today, -KEEP_DAYS);
  s.vacation.ranges = s.vacation.ranges.filter((range) => range.end >= oldest);
}
```

`src/game/progress.ts` (thay toàn bộ file):

```ts
import { isChoiceQuestion, type ContentBundle, type Stage } from "../content/types";
import { weekStart } from "./dates";
import { hasTest } from "./path";
import { XP } from "./rewards";
import { REVIEW_SIZE } from "./reviewSet";
import type { GameState } from "./state";
import { isVacationDay, workDaysBetween } from "./vacation";

export type PetCondition = "happy" | "normal" | "sleepy" | "drained";
export type GrowthSize = 1 | 2 | 3;

export function currentStage(bundle: ContentBundle, state: GameState): Stage | null {
  return bundle.stages[state.pet.stage - 1] ?? bundle.stages[bundle.stages.length - 1] ?? null;
}

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

/** What the room shows (spec 5.6): on vacation first, then the pet's condition. */
export function roomCondition(state: GameState, today: string): PetCondition | "vacation" {
  return isVacationDay(state, today) ? "vacation" : petCondition(state);
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
  const missed = workDaysBetween(state, lastAchievedDay, today);
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

`src/game/apply.ts` (thay toàn bộ file):

```ts
import { addDays, localDay, weekStart } from "./dates";
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
  type RewardItem,
} from "./state";
import { cleanCatalog, requestBlock, trimRequests } from "./realRewards";
import { findShopItem, isConsumable, MAX_CONSUMABLES, STREAK_GIFTS } from "./shop";
import { cancelVacation, pruneVacations, scheduleVacation, toggleVacation, weekTarget, workDaysBetween } from "./vacation";
import { changeXu } from "./wallet";

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
  | { type: "ItemBought"; itemId: string }
  /** Uses a Pin or Vui item, or puts an accessory on or takes it off. */
  | { type: "ItemUsed"; itemId: string }
  /** The parent's list of real rewards (spec 5.12), replaced as a whole. */
  | { type: "RewardsEdited"; catalog: RewardItem[] }
  /** `requestId` is made by the caller (the UI), so the rule stays pure. */
  | { type: "RewardRequested"; requestId: string; rewardId: string }
  | { type: "RewardApproved"; requestId: string }
  | { type: "RewardRejected"; requestId: string }
  /** Spec 5.7: the parent switches the vacation on now, or off. */
  | { type: "VacationToggled"; on: boolean }
  | { type: "VacationScheduled"; start: string; end: string }
  | { type: "VacationCancelled"; start: string }
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
      judgeExercise(next, event, today);
      break;
    case "QuestionAnswered":
      answerQuestion(next, event, today);
      break;
    case "ReviewCompleted":
      completeReview(next, event, today, rollback);
      break;
    case "TopicTestCompleted":
      completeTopicTest(next, event, today);
      break;
    case "EvolutionTestCompleted":
      completeEvolutionTest(next, event, now);
      break;
    case "RemedialCompleted":
      next.remedial = null;
      break;
    case "ItemBought":
      buyItem(next, event.itemId, today);
      break;
    case "ItemUsed":
      useItem(next, event.itemId);
      break;
    case "RewardsEdited":
      next.rewards.catalog = cleanCatalog(event.catalog);
      break;
    case "RewardRequested":
      requestReward(next, event, now, today);
      break;
    case "RewardApproved":
      decideReward(next, event.requestId, true, now, today);
      break;
    case "RewardRejected":
      decideReward(next, event.requestId, false, now, today);
      break;
    case "VacationToggled":
      toggleVacation(next, event.on, today);
      break;
    case "VacationScheduled":
      scheduleVacation(next, event.start, event.end, today);
      break;
    case "VacationCancelled":
      cancelVacation(next, event.start, today);
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
  pruneVacations(s, today);
  const lastActive = s.activity.lastActiveDay;
  if (lastActive === null) return;
  // Spec 5.6-5.7: vacation days are not absent days.
  const absentDays = workDaysBetween(s, lastActive, today);
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
  // Spec 5.7: vacation days do not count in the week plan.
  const target = weekTarget(s, s.week.start);
  if (target > 0 && s.week.lessonsDone >= target * WEEK_EXCEED_RATIO) changeXu(s, XU.weekPlanExceeded, "week", s.week.start, today);
  else if (target > 0 && s.week.lessonsDone >= target) changeXu(s, XU.weekPlanMet, "week", s.week.start, today);
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
    const missed = workDaysBetween(s, last, today);
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
  if (bonus) changeXu(s, bonus, "streak", String(s.streak.current), today);
  const gift = STREAK_GIFTS[s.streak.current];
  if (gift && !s.inventory.owned.includes(gift)) s.inventory.owned.push(gift);
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

function judgeExercise(s: GameState, e: Extract<GameEvent, { type: "ExerciseJudged" }>, today: string): void {
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
    changeXu(s, XU.codeFirstSubmit + (hintsUsed === 0 ? XU.noHintBonus : 0), "code", e.exerciseId, today);
    bumpCorrectRun(s);
    return;
  }
  s.pet.xp += XP.codeAfterRetries;
  if (failedSubmitsBefore >= PERSISTENCE_FAILS) changeXu(s, XU.persistenceBonus, "code", e.exerciseId, today);
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
  if (first) changeXu(s, XU.review + (total > 0 && correct === total ? XU.reviewPerfect : 0), "review", e.stationId, today);
  if (!rollback) addPoints(s, POINTS.review, today);
}

function raiseVui(s: GameState): void {
  s.pet.vui = Math.min(STAT_MAX, s.pet.vui + 1);
}

/** Spec 5.4-5.6: the first completion pays 30 XP; the first pass pays 20 xu and Vui +1. Any score moves the path on. */
function completeTopicTest(s: GameState, e: Extract<GameEvent, { type: "TopicTestCompleted" }>, today: string): void {
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
    changeXu(s, XU.topicTestPassed, "topicTest", e.topicId, today);
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
    // A test of a stage the robot already passed (a retake from the map) must not open a review set.
    if (e.stage !== s.pet.stage) return;
    s.remedial = e.remedialItems.length > 0 ? { stage: e.stage, items: e.remedialItems } : null;
    return;
  }
  s.remedial = null;
  // A second pass of the same stage changes nothing more.
  if (s.pet.stage !== e.stage) return;
  s.pet.stage += 1;
  s.pet.stageStartXp = s.pet.xp;
  changeXu(s, XU.evolution, "evolution", String(e.stage), localDay(now));
  raiseVui(s);
}

/** Spec 5.12. A purchase needs enough xu; an accessory or a decoration is bought once, a Pin or Vui item up to 9. */
function buyItem(s: GameState, itemId: string, today: string): void {
  const item = findShopItem(itemId);
  if (!item || item.price === null || s.wallet.xu < item.price) return;
  if (isConsumable(item)) {
    const have = s.inventory.consumables[itemId] ?? 0;
    if (have >= MAX_CONSUMABLES) return;
    s.inventory.consumables[itemId] = have + 1;
  } else {
    if (s.inventory.owned.includes(itemId)) return;
    s.inventory.owned.push(itemId);
  }
  changeXu(s, -item.price, "shop", itemId, today);
}

/** A Pin or Vui item is used only when it can raise its stat; an accessory is worn alone in its slot. */
function useItem(s: GameState, itemId: string): void {
  const item = findShopItem(itemId);
  if (!item) return;
  if (isConsumable(item)) {
    const have = s.inventory.consumables[itemId] ?? 0;
    const stat = item.kind === "pin" ? "pin" : "vui";
    if (have === 0 || s.pet[stat] >= STAT_MAX) return;
    s.pet[stat] = Math.min(STAT_MAX, s.pet[stat] + (item.effect ?? 0));
    if (have === 1) delete s.inventory.consumables[itemId];
    else s.inventory.consumables[itemId] = have - 1;
    return;
  }
  if (item.kind !== "accessory" || !s.inventory.owned.includes(itemId)) return;
  if (s.inventory.equipped.includes(itemId)) {
    s.inventory.equipped = s.inventory.equipped.filter((id) => id !== itemId);
    return;
  }
  s.inventory.equipped = [
    ...s.inventory.equipped.filter((id) => findShopItem(id)?.slot !== item.slot),
    itemId,
  ];
}

/** Spec 5.12: asking creates a request waiting for the parent; no xu is taken yet. */
function requestReward(
  s: GameState,
  e: Extract<GameEvent, { type: "RewardRequested" }>,
  now: Date,
  today: string,
): void {
  const reward = s.rewards.catalog.find((item) => item.id === e.rewardId);
  if (!reward || s.rewards.requests.some((r) => r.id === e.requestId) || requestBlock(s, reward, today) !== null) return;
  s.rewards.requests.push({
    id: e.requestId,
    rewardId: reward.id,
    name: reward.name,
    price: reward.price,
    at: now.toISOString(),
    status: "pending",
    decidedAt: null,
  });
}

/** Spec 5.12: xu are taken only when the parent approves (with the PIN), and only if the child still has them. */
function decideReward(s: GameState, requestId: string, approve: boolean, now: Date, today: string): void {
  const request = s.rewards.requests.find((r) => r.id === requestId);
  if (!request || request.status !== "pending") return;
  if (approve) {
    if (s.wallet.xu < request.price) return;
    changeXu(s, -request.price, "reward", request.rewardId, today);
  }
  request.status = approve ? "approved" : "rejected";
  request.decidedAt = now.toISOString();
  s.rewards.requests = trimRequests(s.rewards.requests);
}
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run && npm run typecheck`
Expected: PASS (gồm các test chuỗi ngày, suy giảm và kế hoạch tuần cũ).

- [ ] **Step 5: Commit**

```bash
git add src/game/vacation.ts src/game/vacation.test.ts src/game/progress.ts src/game/apply.ts
git commit -m "feat(game): vacation days keep Pin, Vui and the streak, and leave the week plan

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Huy hiệu, thời gian học, bài luyện bố mẹ giao, đường dẫn mới

**Files:**
- Create: `src/game/badges.ts`
- Modify: `src/game/apply.ts`, `src/game/path.ts`, `src/ui/routing.ts`
- Test: `src/game/badges.test.ts`, `src/game/path.test.ts`, `src/ui/routing.test.ts`

**Interfaces:**
- Consumes: `badges`, `assigned`, `activity.seconds`, `coachedAt` (Task 1); `MASTERY` (mastery.ts).
- Produces:
  - `BADGES` (16 id), `type BadgeId`, `PRACTISING_FROM = 40`, `masteredConcepts(state)`, `practisingConcepts(state)`, `giveBadge(s, id, today)`, `awardBadges(s, today)`.
  - Sự kiện `{ type: "ActiveTimeRecorded"; seconds }`, `{ type: "PracticeAssigned"; id; conceptId; items }`, `{ type: "AssignedPracticeDone"; id }` (sự kiện hoạt động), `{ type: "SupportGiven"; conceptId }`. Sau mỗi sự kiện (trừ khi đồng hồ bị lùi), `apply` gọi `awardBadges`.
  - `NextStep` thêm `{ kind: "assigned"; id }`, đứng đầu trong `nextStep`.
  - `Route` thêm `{ name: "assigned"; id }` (`#/assigned/<id>`), `{ name: "shop" }` (`#/shop`), `{ name: "achievements" }` (`#/achievements`); `stepRoute` xử lý `assigned`.

- [ ] **Step 1: Viết test thất bại**

`src/game/badges.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { at, run } from "../test/gameSteps";
import { apply, type GameEvent } from "./apply";
import { BADGES, masteredConcepts, practisingConcepts } from "./badges";
import { emptyMastery } from "./mastery";
import { initialGameState } from "./state";

const lessons = (day: string, n = 2): [string, GameEvent][] =>
  Array.from({ length: n }, (_, i) => [day, { type: "LessonCompleted", lessonId: `${day}-${i}` }]);

describe("badges", () => {
  test("are given once, on the day they are earned", () => {
    const state = run(initialGameState("2026-10-05"), [
      ...lessons("2026-10-05"),
      ...lessons("2026-10-06"),
      ...lessons("2026-10-07", 6),
      ...lessons("2026-10-08"),
    ]);
    expect(state.badges).toEqual({ "first-lesson": "2026-10-05", "lessons-10": "2026-10-07", "streak-3": "2026-10-07" });
  });

  test("a perfect review station, a passed topic test and an evolution", () => {
    const state = run(initialGameState("2026-10-05"), [
      ["2026-10-05", { type: "ReviewCompleted", stationId: null, correct: 3, total: 3 }],
      ["2026-10-06", { type: "TopicTestCompleted", topicId: "t", score: 14, max: 14, items: [] }],
      [
        "2026-10-07",
        { type: "EvolutionTestCompleted", stage: 1, score: 24, max: 24, items: [], wrongConcepts: [], remedialItems: [] },
      ],
    ]);
    expect(state.badges).toEqual({
      "perfect-review": "2026-10-05",
      "topic-test": "2026-10-06",
      "evolution-2": "2026-10-07",
    });
  });

  test("the week plan badge comes with the week's reward", () => {
    const start = initialGameState("2026-10-05");
    start.settings.weeklyTarget = 1;
    const state = run(start, [...lessons("2026-10-05", 1), ["2026-10-12", { type: "DayRollover" }]]);
    expect(state.badges["week-plan"]).toBe("2026-10-12");
  });

  test("counts concepts known well and being practised", () => {
    const state = initialGameState("2026-10-05");
    state.mastery = {
      a: { ...emptyMastery(), score: 80 },
      b: { ...emptyMastery(), score: 70 },
      c: { ...emptyMastery(), score: 40 },
      d: { ...emptyMastery(), score: 39 },
    };
    expect(masteredConcepts(state)).toBe(1);
    expect(practisingConcepts(state)).toBe(2);
  });

  test("every badge id is unique", () => {
    expect(new Set(BADGES).size).toBe(BADGES.length);
  });
});

describe("ActiveTimeRecorded", () => {
  test("adds seconds to today, at most a day, and keeps 60 days", () => {
    const start = initialGameState("2026-10-05");
    start.activity.seconds = { "2026-08-01": 600, "2026-09-01": 300 };
    const state = run(start, [
      ["2026-10-05", { type: "ActiveTimeRecorded", seconds: 60 }],
      ["2026-10-05", { type: "ActiveTimeRecorded", seconds: 59.6 }],
      ["2026-10-05", { type: "ActiveTimeRecorded", seconds: -5 }],
    ]);
    expect(state.activity.seconds).toEqual({ "2026-09-01": 300, "2026-10-05": 120 });
    const full = apply(state, { type: "ActiveTimeRecorded", seconds: 100_000 }, at("2026-10-05"));
    expect(full.activity.seconds["2026-10-05"]).toBe(86_400);
    expect(full.activity.lastActiveDay).toBeNull();
  });
});

describe("practice from the parent", () => {
  test("is kept until done; an empty or repeated one is ignored", () => {
    const state = run(initialGameState("2026-10-05"), [
      ["2026-10-05", { type: "PracticeAssigned", id: "p1", conceptId: "k1", items: ["q1", "q2"] }],
      ["2026-10-05", { type: "PracticeAssigned", id: "p1", conceptId: "k1", items: ["q3"] }],
      ["2026-10-05", { type: "PracticeAssigned", id: "p2", conceptId: "k2", items: [] }],
    ]);
    expect(state.assigned).toEqual([{ id: "p1", conceptId: "k1", items: ["q1", "q2"], day: "2026-10-05" }]);
    const done = apply(state, { type: "AssignedPracticeDone", id: "p1" }, at("2026-10-06"));
    expect(done.assigned).toEqual([]);
    expect(done.activity.lastActiveDay).toBe("2026-10-06");
  });

  test("SupportGiven clears the help flag and its counters and keeps the score", () => {
    const start = initialGameState("2026-10-05");
    start.mastery.k1 = { ...emptyMastery(), score: 35, needsHelp: true, misconceptions: 3, recent: [0, 0], reviewMisses: 2 };
    const state = apply(start, { type: "SupportGiven", conceptId: "k1" }, at("2026-10-06"));
    expect(state.mastery.k1).toEqual({ ...emptyMastery(), score: 35, coachedAt: "2026-10-06" });
  });
});
```

`src/game/path.test.ts`: thêm vào cuối file:

```ts
describe("practice from the parent on the path", () => {
  test("comes before the focused review set and the map", () => {
    const state = initialGameState("2026-10-06");
    state.remedial = { stage: 1, items: ["x"] };
    state.assigned = [{ id: "p1", conceptId: "k1", items: ["q1"], day: "2026-10-06" }];
    expect(nextStep(reviewBundle(), state)).toEqual({ kind: "assigned", id: "p1" });
  });
});
```

`src/ui/routing.test.ts`: thêm trước `describe("isBrowserSupported"`:

```ts
describe("M4a routes", () => {
  test("parse and round-trip", () => {
    for (const route of [{ name: "assigned", id: "p 1" }, { name: "shop" }, { name: "achievements" }] as const) {
      expect(parseHash(routeToHash(route))).toEqual(route);
    }
    expect(routeToHash({ name: "assigned", id: "p1" })).toBe("#/assigned/p1");
  });

  test("stepRoute opens the practice a parent gave", () => {
    expect(stepRoute({ kind: "assigned", id: "p1" })).toEqual({ name: "assigned", id: "p1" });
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/game/badges.test.ts src/game/path.test.ts src/ui/routing.test.ts`
Expected: FAIL: chưa có `./badges`, route và `NextStep` mới.

- [ ] **Step 3: Viết code**

`src/game/badges.ts`:

```ts
import { MASTERY } from "./mastery";
import type { GameState } from "./state";

/** Spec 8.2.7: the badges of the achievement book, in the order it shows them. */
export const BADGES = [
  "first-lesson",
  "lessons-10",
  "lessons-25",
  "lessons-50",
  "streak-3",
  "streak-7",
  "streak-14",
  "streak-30",
  "perfect-review",
  "topic-test",
  "week-plan",
  "concepts-5",
  "concepts-10",
  "evolution-2",
  "evolution-3",
  "evolution-4",
] as const;

export type BadgeId = (typeof BADGES)[number];

/** Spec 8.2.7: concepts the child knows well (above the score that clears "needs help") and is practising. */
export const PRACTISING_FROM = 40;

export function masteredConcepts(state: GameState): number {
  return Object.values(state.mastery).filter((m) => m.score > MASTERY.clearHelpAbove).length;
}

export function practisingConcepts(state: GameState): number {
  return Object.values(state.mastery).filter((m) => m.score >= PRACTISING_FROM && m.score <= MASTERY.clearHelpAbove)
    .length;
}

/** The badges whose condition can be read from the state; "perfect-review" and "week-plan" are given by their events. */
function earned(state: GameState): BadgeId[] {
  const lessons = state.progress.completedLessons.length;
  const best = state.streak.best;
  const mastered = masteredConcepts(state);
  const rules: [BadgeId, boolean][] = [
    ["first-lesson", lessons >= 1],
    ["lessons-10", lessons >= 10],
    ["lessons-25", lessons >= 25],
    ["lessons-50", lessons >= 50],
    ["streak-3", best >= 3],
    ["streak-7", best >= 7],
    ["streak-14", best >= 14],
    ["streak-30", best >= 30],
    ["topic-test", Object.values(state.progress.topicTests).some((record) => record.passed)],
    ["concepts-5", mastered >= 5],
    ["concepts-10", mastered >= 10],
    ["evolution-2", state.pet.stage >= 2],
    ["evolution-3", state.pet.stage >= 3],
    ["evolution-4", state.pet.stage >= 4],
  ];
  return rules.filter(([, ok]) => ok).map(([id]) => id);
}

export function giveBadge(s: GameState, id: BadgeId, today: string): void {
  if (!(id in s.badges)) s.badges[id] = today;
}

/** Gives every badge the state now earns; a badge, once given, stays. */
export function awardBadges(s: GameState, today: string): void {
  for (const id of earned(s)) giveBadge(s, id, today);
}
```

`src/game/apply.ts` (thay toàn bộ file):

```ts
import { addDays, localDay, weekStart } from "./dates";
import { awardBadges, giveBadge } from "./badges";
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
  KEEP_DAYS,
  STAT_MAX,
  WARNING_LIMIT,
  type ConceptMastery,
  type ExerciseStats,
  type GameSettings,
  type GameState,
  type RewardItem,
} from "./state";
import { cleanCatalog, requestBlock, trimRequests } from "./realRewards";
import { findShopItem, isConsumable, MAX_CONSUMABLES, STREAK_GIFTS } from "./shop";
import { cancelVacation, pruneVacations, scheduleVacation, toggleVacation, weekTarget, workDaysBetween } from "./vacation";
import { changeXu } from "./wallet";

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
  | { type: "ItemBought"; itemId: string }
  /** Uses a Pin or Vui item, or puts an accessory on or takes it off. */
  | { type: "ItemUsed"; itemId: string }
  /** The parent's list of real rewards (spec 5.12), replaced as a whole. */
  | { type: "RewardsEdited"; catalog: RewardItem[] }
  /** `requestId` is made by the caller (the UI), so the rule stays pure. */
  | { type: "RewardRequested"; requestId: string; rewardId: string }
  | { type: "RewardApproved"; requestId: string }
  | { type: "RewardRejected"; requestId: string }
  /** Spec 5.7: the parent switches the vacation on now, or off. */
  | { type: "VacationToggled"; on: boolean }
  | { type: "VacationScheduled"; start: string; end: string }
  | { type: "VacationCancelled"; start: string }
  /** Spec 5.13: active study seconds, sent about once a minute. */
  | { type: "ActiveTimeRecorded"; seconds: number }
  /** Spec 9.2: practice a parent gives; `id` is made by the caller. */
  | { type: "PracticeAssigned"; id: string; conceptId: string; items: string[] }
  | { type: "AssignedPracticeDone"; id: string }
  /** Spec 9.2 "Đánh dấu đã kèm con": the parent helped with this concept. */
  | { type: "SupportGiven"; conceptId: string }
  | { type: "HintShown"; exerciseId: string }
  | { type: "SolutionViewed"; exerciseId: string };

const DAY_SECONDS = 86_400;

const ACTIVITY_EVENTS: ReadonlySet<GameEvent["type"]> = new Set([
  "LessonCompleted",
  "ExerciseJudged",
  "QuestionAnswered",
  "ReviewCompleted",
  "TopicTestCompleted",
  "EvolutionTestCompleted",
  "RemedialCompleted",
  "AssignedPracticeDone",
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
      judgeExercise(next, event, today);
      break;
    case "QuestionAnswered":
      answerQuestion(next, event, today);
      break;
    case "ReviewCompleted":
      completeReview(next, event, today, rollback);
      break;
    case "TopicTestCompleted":
      completeTopicTest(next, event, today);
      break;
    case "EvolutionTestCompleted":
      completeEvolutionTest(next, event, now);
      break;
    case "RemedialCompleted":
      next.remedial = null;
      break;
    case "ItemBought":
      buyItem(next, event.itemId, today);
      break;
    case "ItemUsed":
      useItem(next, event.itemId);
      break;
    case "RewardsEdited":
      next.rewards.catalog = cleanCatalog(event.catalog);
      break;
    case "RewardRequested":
      requestReward(next, event, now, today);
      break;
    case "RewardApproved":
      decideReward(next, event.requestId, true, now, today);
      break;
    case "RewardRejected":
      decideReward(next, event.requestId, false, now, today);
      break;
    case "VacationToggled":
      toggleVacation(next, event.on, today);
      break;
    case "VacationScheduled":
      scheduleVacation(next, event.start, event.end, today);
      break;
    case "VacationCancelled":
      cancelVacation(next, event.start, today);
      break;
    case "ActiveTimeRecorded":
      recordTime(next, event.seconds, today);
      break;
    case "PracticeAssigned":
      if (event.items.length > 0 && !next.assigned.some((a) => a.id === event.id)) {
        next.assigned.push({ id: event.id, conceptId: event.conceptId, items: event.items, day: today });
      }
      break;
    case "AssignedPracticeDone":
      next.assigned = next.assigned.filter((a) => a.id !== event.id);
      break;
    case "SupportGiven":
      giveSupport(next, event.conceptId, today);
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
  if (!rollback) awardBadges(next, today);
  return next;
}

function recordRollback(s: GameState, now: Date, today: string): void {
  const last = s.warnings[s.warnings.length - 1];
  if (last && localDay(new Date(last.at)) === today) return;
  s.warnings = [...s.warnings, { at: now.toISOString(), kind: "clock-rollback" as const }].slice(-WARNING_LIMIT);
}

function rollover(s: GameState, today: string): void {
  settleWeek(s, today);
  pruneVacations(s, today);
  const lastActive = s.activity.lastActiveDay;
  if (lastActive === null) return;
  // Spec 5.6-5.7: vacation days are not absent days.
  const absentDays = workDaysBetween(s, lastActive, today);
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
  // Spec 5.7: vacation days do not count in the week plan.
  const target = weekTarget(s, s.week.start);
  if (target > 0 && s.week.lessonsDone >= target * WEEK_EXCEED_RATIO) changeXu(s, XU.weekPlanExceeded, "week", s.week.start, today);
  else if (target > 0 && s.week.lessonsDone >= target) changeXu(s, XU.weekPlanMet, "week", s.week.start, today);
  if (target > 0 && s.week.lessonsDone >= target) giveBadge(s, "week-plan", today);
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
    const missed = workDaysBetween(s, last, today);
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
  if (bonus) changeXu(s, bonus, "streak", String(s.streak.current), today);
  const gift = STREAK_GIFTS[s.streak.current];
  if (gift && !s.inventory.owned.includes(gift)) s.inventory.owned.push(gift);
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

function judgeExercise(s: GameState, e: Extract<GameEvent, { type: "ExerciseJudged" }>, today: string): void {
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
    changeXu(s, XU.codeFirstSubmit + (hintsUsed === 0 ? XU.noHintBonus : 0), "code", e.exerciseId, today);
    bumpCorrectRun(s);
    return;
  }
  s.pet.xp += XP.codeAfterRetries;
  if (failedSubmitsBefore >= PERSISTENCE_FAILS) changeXu(s, XU.persistenceBonus, "code", e.exerciseId, today);
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
  if (first) changeXu(s, XU.review + (total > 0 && correct === total ? XU.reviewPerfect : 0), "review", e.stationId, today);
  if (total > 0 && correct === total) giveBadge(s, "perfect-review", today);
  if (!rollback) addPoints(s, POINTS.review, today);
}

function raiseVui(s: GameState): void {
  s.pet.vui = Math.min(STAT_MAX, s.pet.vui + 1);
}

/** Spec 5.4-5.6: the first completion pays 30 XP; the first pass pays 20 xu and Vui +1. Any score moves the path on. */
function completeTopicTest(s: GameState, e: Extract<GameEvent, { type: "TopicTestCompleted" }>, today: string): void {
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
    changeXu(s, XU.topicTestPassed, "topicTest", e.topicId, today);
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
    // A test of a stage the robot already passed (a retake from the map) must not open a review set.
    if (e.stage !== s.pet.stage) return;
    s.remedial = e.remedialItems.length > 0 ? { stage: e.stage, items: e.remedialItems } : null;
    return;
  }
  s.remedial = null;
  // A second pass of the same stage changes nothing more.
  if (s.pet.stage !== e.stage) return;
  s.pet.stage += 1;
  s.pet.stageStartXp = s.pet.xp;
  changeXu(s, XU.evolution, "evolution", String(e.stage), localDay(now));
  raiseVui(s);
}

/** Spec 5.12. A purchase needs enough xu; an accessory or a decoration is bought once, a Pin or Vui item up to 9. */
function buyItem(s: GameState, itemId: string, today: string): void {
  const item = findShopItem(itemId);
  if (!item || item.price === null || s.wallet.xu < item.price) return;
  if (isConsumable(item)) {
    const have = s.inventory.consumables[itemId] ?? 0;
    if (have >= MAX_CONSUMABLES) return;
    s.inventory.consumables[itemId] = have + 1;
  } else {
    if (s.inventory.owned.includes(itemId)) return;
    s.inventory.owned.push(itemId);
  }
  changeXu(s, -item.price, "shop", itemId, today);
}

/** A Pin or Vui item is used only when it can raise its stat; an accessory is worn alone in its slot. */
function useItem(s: GameState, itemId: string): void {
  const item = findShopItem(itemId);
  if (!item) return;
  if (isConsumable(item)) {
    const have = s.inventory.consumables[itemId] ?? 0;
    const stat = item.kind === "pin" ? "pin" : "vui";
    if (have === 0 || s.pet[stat] >= STAT_MAX) return;
    s.pet[stat] = Math.min(STAT_MAX, s.pet[stat] + (item.effect ?? 0));
    if (have === 1) delete s.inventory.consumables[itemId];
    else s.inventory.consumables[itemId] = have - 1;
    return;
  }
  if (item.kind !== "accessory" || !s.inventory.owned.includes(itemId)) return;
  if (s.inventory.equipped.includes(itemId)) {
    s.inventory.equipped = s.inventory.equipped.filter((id) => id !== itemId);
    return;
  }
  s.inventory.equipped = [
    ...s.inventory.equipped.filter((id) => findShopItem(id)?.slot !== item.slot),
    itemId,
  ];
}

/** Spec 5.12: asking creates a request waiting for the parent; no xu is taken yet. */
function requestReward(
  s: GameState,
  e: Extract<GameEvent, { type: "RewardRequested" }>,
  now: Date,
  today: string,
): void {
  const reward = s.rewards.catalog.find((item) => item.id === e.rewardId);
  if (!reward || s.rewards.requests.some((r) => r.id === e.requestId) || requestBlock(s, reward, today) !== null) return;
  s.rewards.requests.push({
    id: e.requestId,
    rewardId: reward.id,
    name: reward.name,
    price: reward.price,
    at: now.toISOString(),
    status: "pending",
    decidedAt: null,
  });
}

/** Spec 5.12: xu are taken only when the parent approves (with the PIN), and only if the child still has them. */
function decideReward(s: GameState, requestId: string, approve: boolean, now: Date, today: string): void {
  const request = s.rewards.requests.find((r) => r.id === requestId);
  if (!request || request.status !== "pending") return;
  if (approve) {
    if (s.wallet.xu < request.price) return;
    changeXu(s, -request.price, "reward", request.rewardId, today);
  }
  request.status = approve ? "approved" : "rejected";
  request.decidedAt = now.toISOString();
  s.rewards.requests = trimRequests(s.rewards.requests);
}

/** Spec 5.13: seconds per day, at most a whole day, the last KEEP_DAYS days. */
function recordTime(s: GameState, seconds: number, today: string): void {
  if (!(seconds > 0)) return;
  const total = (s.activity.seconds[today] ?? 0) + Math.round(seconds);
  const oldest = addDays(today, -KEEP_DAYS);
  s.activity.seconds = Object.fromEntries(
    Object.entries({ ...s.activity.seconds, [today]: Math.min(DAY_SECONDS, total) }).filter(([day]) => day >= oldest),
  );
}

/** The parent helped: the flag and its counters start again, as when the score passes 70 (spec 5.9). */
function giveSupport(s: GameState, conceptId: string, today: string): void {
  updateMastery(s, conceptId, (m) => ({
    ...m,
    needsHelp: false,
    misconceptions: 0,
    recent: [],
    reviewMisses: 0,
    coachedAt: today,
  }));
}
```

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

/** What "Học tiếp" opens (spec 5.3): practice from the parent, an open focused review set, then the next node. */
export type NextStep = { kind: "assigned"; id: string } | { kind: "remedial" } | { kind: "node"; node: PathNode };

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
  const assigned = state.assigned[0];
  if (assigned) return { kind: "assigned", id: assigned.id };
  if (state.remedial !== null) return { kind: "remedial" };
  const node = nextNode(bundle, state);
  return node ? { kind: "node", node } : null;
}

export function findNode(bundle: ContentBundle, id: string): PathNode | undefined {
  return pathNodes(bundle).find((node) => node.id === id);
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
  | { name: "remedial" }
  /** Practice a parent gave (spec 9.2). */
  | { name: "assigned"; id: string }
  | { name: "shop" }
  | { name: "achievements" };

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
  if (hash === "#/shop") return { name: "shop" };
  if (hash === "#/achievements") return { name: "achievements" };
  const match = /^#\/(lesson|review|practice|topic-test|evolution|assigned)\/(.+)$/.exec(hash);
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
    case "assigned":
      return { name: "assigned", id };
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
    case "assigned":
      return `#/assigned/${encodeURIComponent(route.id)}`;
    case "shop":
      return "#/shop";
    case "achievements":
      return "#/achievements";
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
  switch (step.kind) {
    case "assigned":
      return { name: "assigned", id: step.id };
    case "remedial":
      return { name: "remedial" };
    case "node":
      return nodeRoute(step.node);
  }
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

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/badges.ts src/game/badges.test.ts src/game/apply.ts src/game/path.ts src/game/path.test.ts src/ui/routing.ts src/ui/routing.test.ts
git commit -m "feat(game): badges, study time, practice from the parents and coached concepts; routes for the shop and the book

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 7: Màn hình Cửa hàng

**Files:**
- Create: `src/ui/names.ts`, `src/ui/ShopScreen.tsx`
- Modify: `src/i18n/vi.ts`, `src/i18n/en.ts`
- Test: `src/ui/ShopScreen.test.tsx`

**Interfaces:**
- Consumes: `SHOP_ITEMS`, `STREAK_GIFTS`, `MAX_CONSUMABLES`, `isConsumable` (Task 3); `freeXu`, `requestBlock` (Task 4); `BADGES` (Task 6).
- Produces:
  - `names.ts`: `itemKey(id)`, `badgeKey(id)`, `FORM_COUNT = 4`, `formKey(stage)`.
  - `ShopScreen({ newId? })`: tab "Đồ cho {robot}" (Pin và Vui, Phụ kiện, Trang trí phòng; Mua / Dùng / Đeo / Tháo; quà chuỗi ngày hiện cách nhận) và tab "Phần thưởng từ bố mẹ" (Đổi, lý do không đổi được, danh sách chờ duyệt, lịch sử). `newId` mặc định `crypto.randomUUID()`.
  - Khóa i18n cho Task 7–9: `room.shop`, `room.achievements`, `room.wearing`, `room.decor`, `pet.vacation`, `shop.*`, `rewards.*`, `achievements.*`, `form.1`–`form.4`, `assigned.*`, `item.*` (18), `badge.*` (16).

- [ ] **Step 1: Viết test thất bại**

`src/ui/ShopScreen.test.tsx`:

```tsx
// @vitest-environment jsdom
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { BADGES } from "../game/badges";
import { SHOP_ITEMS } from "../game/shop";
import { initialGameState } from "../game/state";
import { vi } from "../i18n/vi";
import { renderWithGame, TODAY } from "../test/renderGame";
import { badgeKey, formKey, FORM_COUNT, itemKey } from "./names";
import { ShopScreen } from "./ShopScreen";

function richState(xu: number) {
  const state = initialGameState(TODAY);
  state.wallet.xu = xu;
  state.pet.pin = 2;
  return state;
}

const row = (name: string) => screen.getByText(name).closest("li") as HTMLElement;

describe("names", () => {
  test("every shop item, badge and robot form has a message", () => {
    for (const item of SHOP_ITEMS) expect(vi).toHaveProperty([itemKey(item.id)]);
    for (const badge of BADGES) expect(vi).toHaveProperty([badgeKey(badge)]);
    for (let stage = 1; stage <= FORM_COUNT; stage += 1) expect(vi).toHaveProperty([formKey(stage)]);
  });
});

describe("ShopScreen: things for the robot", () => {
  test("buys and uses a Pin item", async () => {
    const { store } = await renderWithGame(<ShopScreen />, { state: richState(100) });
    expect(screen.getByText("Con có 100 xu")).toBeInTheDocument();
    const charger = row("Pin sạc nhanh");
    expect(within(charger).getByText("30 xu")).toBeInTheDocument();
    expect(within(charger).getByRole("button", { name: "Dùng Pin sạc nhanh" })).toBeDisabled();
    await userEvent.click(within(charger).getByRole("button", { name: "Mua Pin sạc nhanh" }));
    expect(screen.getByText("Con có 70 xu")).toBeInTheDocument();
    expect(within(charger).getByText("Có 1")).toBeInTheDocument();
    await userEvent.click(within(charger).getByRole("button", { name: "Dùng Pin sạc nhanh" }));
    await waitFor(async () => expect((await store.loadActive())!.state.pet.pin).toBe(4));
  });

  test("buys an accessory, wears it and takes it off; a gift shows how to get it", async () => {
    const { store } = await renderWithGame(<ShopScreen />, { state: richState(100) });
    await userEvent.click(screen.getByRole("button", { name: "Mua Kính râm" }));
    await userEvent.click(screen.getByRole("button", { name: "Đeo Kính râm" }));
    await waitFor(async () => expect((await store.loadActive())!.state.inventory.equipped).toEqual(["kinh-ram"]));
    await userEvent.click(screen.getByRole("button", { name: "Tháo Kính râm" }));
    expect(screen.getByRole("button", { name: "Đeo Kính râm" })).toBeInTheDocument();
    expect(within(row("Vương miện")).getByText("Quà khi giữ chuỗi 30 ngày")).toBeInTheDocument();
    expect(within(row("Vương miện")).queryByRole("button")).not.toBeInTheDocument();
  });

  test("an item costing more than the balance cannot be bought", async () => {
    await renderWithGame(<ShopScreen />, { state: richState(20) });
    expect(screen.getByRole("button", { name: "Mua Kệ sách" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Mua Dầu nhớt" })).toBeEnabled();
  });
});

describe("ShopScreen: rewards from the parents", () => {
  test("no reward yet", async () => {
    await renderWithGame(<ShopScreen />);
    await userEvent.click(screen.getByRole("tab", { name: "Phần thưởng từ bố mẹ" }));
    expect(screen.getByText("Bố mẹ chưa đặt phần thưởng nào.")).toBeInTheDocument();
  });

  test("asks for a reward; the request waits for the parents", async () => {
    const state = richState(120);
    state.rewards.catalog = [
      { id: "park", name: "Đi công viên", price: 100, weeklyLimit: 1 },
      { id: "tv", name: "Xem phim", price: 200, weeklyLimit: 2 },
    ];
    const { store } = await renderWithGame(<ShopScreen newId={() => "q1"} />, { state });
    await userEvent.click(screen.getByRole("tab", { name: "Phần thưởng từ bố mẹ" }));
    expect(within(row("Xem phim")).getByText("Chưa đủ xu")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Đổi Đi công viên" }));
    expect(screen.getByRole("status")).toHaveTextContent("Đã gửi yêu cầu. Bố mẹ sẽ duyệt bằng mã PIN.");
    expect(screen.getByRole("heading", { name: "Chờ bố mẹ duyệt" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Đổi Đi công viên" })).toBeDisabled();
    await waitFor(async () =>
      expect((await store.loadActive())!.state.rewards.requests).toMatchObject([{ id: "q1", status: "pending" }]),
    );
    expect((await store.loadActive())!.state.wallet.xu).toBe(120);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/ui/ShopScreen.test.tsx`
Expected: FAIL: chưa có `./ShopScreen`, `./names`.

- [ ] **Step 3: Viết code**

`src/i18n/vi.ts`: thêm vào cuối, trước `} as const;`:

```ts
  "room.shop": "Cửa hàng",
  "room.achievements": "Sổ thành tích",
  "room.wearing": "Đang đeo: {items}",
  "room.decor": "Trong phòng: {items}",
  "pet.vacation": "{name} đang đi nghỉ. Con vẫn học được nếu muốn!",
  "shop.title": "Cửa hàng",
  "shop.tabRobot": "Đồ cho {name}",
  "shop.tabRewards": "Phần thưởng từ bố mẹ",
  "shop.balance": "Con có {xu} xu",
  "shop.consumables": "Pin và Vui",
  "shop.accessories": "Phụ kiện",
  "shop.decor": "Trang trí phòng",
  "shop.price": "{n} xu",
  "shop.buy": "Mua",
  "shop.use": "Dùng",
  "shop.have": "Có {n}",
  "shop.wear": "Đeo",
  "shop.takeOff": "Tháo",
  "shop.owned": "Đã có",
  "shop.gift": "Quà khi giữ chuỗi {days} ngày",
  "rewards.empty": "Bố mẹ chưa đặt phần thưởng nào.",
  "rewards.limit": "Mỗi tuần {n} lần",
  "rewards.ask": "Đổi",
  "rewards.noXu": "Chưa đủ xu",
  "rewards.limitReached": "Hết lượt tuần này",
  "rewards.asked": "Đã gửi yêu cầu. Bố mẹ sẽ duyệt bằng mã PIN.",
  "rewards.pendingTitle": "Chờ bố mẹ duyệt",
  "rewards.historyTitle": "Đã đổi trước đây",
  "rewards.approved": "Bố mẹ đã đồng ý",
  "rewards.rejected": "Bố mẹ chưa đồng ý",
  "achievements.title": "Sổ thành tích",
  "achievements.badges": "Huy hiệu",
  "achievements.locked": "Chưa có",
  "achievements.earned": "Nhận ngày {day}",
  "achievements.forms": "Các dạng của {name}",
  "achievements.concepts": "Khái niệm đã vững: {n}",
  "achievements.practising": "Khái niệm đang luyện: {n}",
  "form.1": "Viên nang",
  "form.2": "Sơ sinh",
  "form.3": "Bé con",
  "form.4": "Thiếu niên",
  "assigned.title": "Bài luyện bố mẹ giao: {concept}",
  "assigned.doneTitle": "Xong bài luyện bố mẹ giao!",
  "assigned.notFound": "Không tìm thấy bài luyện này.",
  "item.dau-nhot": "Dầu nhớt",
  "item.pin-sac": "Pin sạc nhanh",
  "item.bong": "Quả bóng",
  "item.no-buom": "Nơ bướm",
  "item.khan-quang": "Khăn quàng",
  "item.kinh-ram": "Kính râm",
  "item.kinh-tron": "Kính tròn",
  "item.mu-luoi-trai": "Mũ lưỡi trai",
  "item.tai-nghe": "Tai nghe",
  "item.ghim-sao": "Ghim ngôi sao",
  "item.ang-ten-vang": "Ăng-ten vàng",
  "item.ao-choang": "Áo choàng",
  "item.vuong-mien": "Vương miện",
  "item.chau-cay": "Chậu cây",
  "item.den-ngu": "Đèn ngủ",
  "item.tranh": "Bức tranh",
  "item.tham": "Tấm thảm",
  "item.ke-sach": "Kệ sách",
  "badge.first-lesson": "Bài học đầu tiên",
  "badge.lessons-10": "10 bài học",
  "badge.lessons-25": "25 bài học",
  "badge.lessons-50": "50 bài học",
  "badge.streak-3": "Chuỗi 3 ngày",
  "badge.streak-7": "Chuỗi 7 ngày",
  "badge.streak-14": "Chuỗi 14 ngày",
  "badge.streak-30": "Chuỗi 30 ngày",
  "badge.perfect-review": "Trạm ôn đúng hết",
  "badge.topic-test": "Đạt kiểm tra chủ đề",
  "badge.week-plan": "Đạt kế hoạch tuần",
  "badge.concepts-5": "Vững 5 khái niệm",
  "badge.concepts-10": "Vững 10 khái niệm",
  "badge.evolution-2": "Tiến hóa lần 1",
  "badge.evolution-3": "Tiến hóa lần 2",
  "badge.evolution-4": "Tiến hóa lần 3",
```

`src/i18n/en.ts`: thêm vào cuối, trước `};`:

```ts
  "room.shop": "Shop",
  "room.achievements": "Achievement book",
  "room.wearing": "Wearing: {items}",
  "room.decor": "In the room: {items}",
  "pet.vacation": "{name} is on vacation. You can still learn if you want!",
  "shop.title": "Shop",
  "shop.tabRobot": "Things for {name}",
  "shop.tabRewards": "Rewards from your parents",
  "shop.balance": "You have {xu} coins",
  "shop.consumables": "Battery and Joy",
  "shop.accessories": "Accessories",
  "shop.decor": "Room decorations",
  "shop.price": "{n} coins",
  "shop.buy": "Buy",
  "shop.use": "Use",
  "shop.have": "You have {n}",
  "shop.wear": "Wear",
  "shop.takeOff": "Take off",
  "shop.owned": "Owned",
  "shop.gift": "Gift for a {days}-day streak",
  "rewards.empty": "Your parents have not added any rewards yet.",
  "rewards.limit": "{n} times a week",
  "rewards.ask": "Ask",
  "rewards.noXu": "Not enough coins",
  "rewards.limitReached": "No more this week",
  "rewards.asked": "Request sent. Your parents approve it with the PIN.",
  "rewards.pendingTitle": "Waiting for your parents",
  "rewards.historyTitle": "Earlier requests",
  "rewards.approved": "Approved",
  "rewards.rejected": "Not approved",
  "achievements.title": "Achievement book",
  "achievements.badges": "Badges",
  "achievements.locked": "Not yet",
  "achievements.earned": "Earned on {day}",
  "achievements.forms": "{name}'s forms",
  "achievements.concepts": "Concepts you know well: {n}",
  "achievements.practising": "Concepts you are practising: {n}",
  "form.1": "Capsule",
  "form.2": "Newborn",
  "form.3": "Kid",
  "form.4": "Teen",
  "assigned.title": "Practice from your parents: {concept}",
  "assigned.doneTitle": "Practice from your parents done!",
  "assigned.notFound": "This practice does not exist.",
  "item.dau-nhot": "Oil can",
  "item.pin-sac": "Fast charger",
  "item.bong": "Ball",
  "item.no-buom": "Bow tie",
  "item.khan-quang": "Scarf",
  "item.kinh-ram": "Sunglasses",
  "item.kinh-tron": "Round glasses",
  "item.mu-luoi-trai": "Cap",
  "item.tai-nghe": "Headphones",
  "item.ghim-sao": "Star pin",
  "item.ang-ten-vang": "Golden antenna",
  "item.ao-choang": "Cape",
  "item.vuong-mien": "Crown",
  "item.chau-cay": "Plant",
  "item.den-ngu": "Night lamp",
  "item.tranh": "Painting",
  "item.tham": "Rug",
  "item.ke-sach": "Bookshelf",
  "badge.first-lesson": "First lesson",
  "badge.lessons-10": "10 lessons",
  "badge.lessons-25": "25 lessons",
  "badge.lessons-50": "50 lessons",
  "badge.streak-3": "3-day streak",
  "badge.streak-7": "7-day streak",
  "badge.streak-14": "14-day streak",
  "badge.streak-30": "30-day streak",
  "badge.perfect-review": "Perfect review",
  "badge.topic-test": "Topic test passed",
  "badge.week-plan": "Week plan met",
  "badge.concepts-5": "5 concepts known well",
  "badge.concepts-10": "10 concepts known well",
  "badge.evolution-2": "First evolution",
  "badge.evolution-3": "Second evolution",
  "badge.evolution-4": "Third evolution",
```

`src/ui/names.ts`:

```ts
import type { BadgeId } from "../game/badges";
import type { MessageKey } from "../i18n/vi";

/** The message keys of shop items, badges and robot forms; a test checks that each one exists. */
export function itemKey(id: string): MessageKey {
  return `item.${id}` as MessageKey;
}

export function badgeKey(id: BadgeId): MessageKey {
  return `badge.${id}` as MessageKey;
}

/** The robot forms of the achievement book (spec 8.4), 1 per stage. */
export const FORM_COUNT = 4;

export function formKey(stage: number): MessageKey {
  return `form.${stage}` as MessageKey;
}
```

`src/ui/ShopScreen.tsx`:

```tsx
import { useState } from "react";
import { freeXu, requestBlock } from "../game/realRewards";
import { isConsumable, MAX_CONSUMABLES, SHOP_ITEMS, STREAK_GIFTS, type ShopItem } from "../game/shop";
import { STAT_MAX, type GameState } from "../game/state";
import { useLang } from "../i18n/LangProvider";
import { useGame } from "./GameProvider";
import { itemKey } from "./names";

type Tab = "robot" | "rewards";

/** Spec 5.12 and 8.2.6: things for the robot, and real rewards from the parents. */
export function ShopScreen({ newId = () => crypto.randomUUID() }: { newId?: () => string }) {
  const { t } = useLang();
  const game = useGame();
  const [tab, setTab] = useState<Tab>("robot");
  return (
    <main className="shop">
      <h1>{t("shop.title")}</h1>
      <p className="shop-balance">{t("shop.balance", { xu: game.state.wallet.xu })}</p>
      <div role="tablist" className="tabs">
        <button role="tab" aria-selected={tab === "robot"} onClick={() => setTab("robot")}>
          {t("shop.tabRobot", { name: game.profile.robotName })}
        </button>
        <button role="tab" aria-selected={tab === "rewards"} onClick={() => setTab("rewards")}>
          {t("shop.tabRewards")}
        </button>
      </div>
      {tab === "robot" ? <RobotShop /> : <RewardShop newId={newId} />}
      <a href="#/">{t("nav.room")}</a>
    </main>
  );
}

function giftDays(id: string): number | undefined {
  const entry = Object.entries(STREAK_GIFTS).find(([, gift]) => gift === id);
  return entry ? Number(entry[0]) : undefined;
}

function RobotShop() {
  const { t } = useLang();
  const game = useGame();
  const { state } = game;
  const section = (title: string, items: ShopItem[]) => (
    <section>
      <h2>{title}</h2>
      <ul className="shop-items">
        {items.map((item) => (
          <ShopRow key={item.id} item={item} state={state} />
        ))}
      </ul>
    </section>
  );
  return (
    <>
      {section(t("shop.consumables"), SHOP_ITEMS.filter(isConsumable))}
      {section(t("shop.accessories"), SHOP_ITEMS.filter((item) => item.kind === "accessory"))}
      {section(t("shop.decor"), SHOP_ITEMS.filter((item) => item.kind === "decor"))}
    </>
  );
}

function ShopRow({ item, state }: { item: ShopItem; state: GameState }) {
  const { t } = useLang();
  const game = useGame();
  const name = t(itemKey(item.id));
  const owned = state.inventory.owned.includes(item.id);
  const count = state.inventory.consumables[item.id] ?? 0;
  const buy = () => game.dispatch({ type: "ItemBought", itemId: item.id });
  const use = () => game.dispatch({ type: "ItemUsed", itemId: item.id });
  const canAfford = item.price !== null && state.wallet.xu >= item.price;

  let detail;
  let actions;
  if (isConsumable(item)) {
    const full = state.pet[item.kind === "pin" ? "pin" : "vui"] >= STAT_MAX;
    detail = t(item.kind === "pin" ? "result.pin" : "result.vui", { n: item.effect ?? 0 });
    actions = (
      <>
        <span>{t("shop.have", { n: count })}</span>
        <button onClick={buy} disabled={!canAfford || count >= MAX_CONSUMABLES} aria-label={`${t("shop.buy")} ${name}`}>
          {t("shop.buy")}
        </button>
        <button onClick={use} disabled={count === 0 || full} aria-label={`${t("shop.use")} ${name}`}>
          {t("shop.use")}
        </button>
      </>
    );
  } else if (owned) {
    const worn = state.inventory.equipped.includes(item.id);
    actions =
      item.kind === "accessory" ? (
        <button onClick={use} aria-label={`${t(worn ? "shop.takeOff" : "shop.wear")} ${name}`}>
          {t(worn ? "shop.takeOff" : "shop.wear")}
        </button>
      ) : (
        <span>{t("shop.owned")}</span>
      );
  } else if (item.price === null) {
    detail = t("shop.gift", { days: giftDays(item.id) ?? 0 });
  } else {
    actions = (
      <button onClick={buy} disabled={!canAfford} aria-label={`${t("shop.buy")} ${name}`}>
        {t("shop.buy")}
      </button>
    );
  }
  return (
    <li className="shop-item">
      <span className="shop-name">{name}</span>
      {item.price !== null && <span className="shop-price">{t("shop.price", { n: item.price })}</span>}
      {detail && <span className="shop-detail">{detail}</span>}
      <span className="shop-actions">{actions}</span>
    </li>
  );
}

function RewardShop({ newId }: { newId(): string }) {
  const { t } = useLang();
  const game = useGame();
  const { state, today } = game;
  const [asked, setAsked] = useState(false);
  const { catalog, requests } = state.rewards;
  const pending = requests.filter((r) => r.status === "pending");
  const decided = requests.filter((r) => r.status !== "pending").slice(-10).reverse();
  return (
    <section>
      {catalog.length === 0 ? (
        <p>{t("rewards.empty")}</p>
      ) : (
        <ul className="shop-items">
          {catalog.map((reward) => {
            const block = requestBlock(state, reward, today);
            return (
              <li key={reward.id} className="shop-item">
                <span className="shop-name">{reward.name}</span>
                <span className="shop-price">{t("shop.price", { n: reward.price })}</span>
                <span className="shop-detail">{t("rewards.limit", { n: reward.weeklyLimit })}</span>
                <span className="shop-actions">
                  {block && <span>{t(block === "xu" ? "rewards.noXu" : "rewards.limitReached")}</span>}
                  <button
                    disabled={block !== null}
                    aria-label={`${t("rewards.ask")} ${reward.name}`}
                    onClick={() => {
                      game.dispatch({ type: "RewardRequested", requestId: newId(), rewardId: reward.id });
                      setAsked(true);
                    }}
                  >
                    {t("rewards.ask")}
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {asked && <p role="status">{t("rewards.asked")}</p>}
      {pending.length > 0 && (
        <>
          <h2>{t("rewards.pendingTitle")}</h2>
          <ul>
            {pending.map((r) => (
              <li key={r.id}>
                {r.name} · {t("shop.price", { n: r.price })}
              </li>
            ))}
          </ul>
          <p>{t("shop.balance", { xu: freeXu(state) })}</p>
        </>
      )}
      {decided.length > 0 && (
        <>
          <h2>{t("rewards.historyTitle")}</h2>
          <ul>
            {decided.map((r) => (
              <li key={r.id}>
                {r.name} · {t(r.status === "approved" ? "rewards.approved" : "rewards.rejected")}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run && npm run typecheck`
Expected: PASS (gồm test cùng khóa vi/en).

- [ ] **Step 5: Commit**

```bash
git add src/ui/names.ts src/ui/ShopScreen.tsx src/ui/ShopScreen.test.tsx src/i18n/vi.ts src/i18n/en.ts
git commit -m "feat(ui): the shop with things for the robot and rewards from the parents

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Sổ thành tích, bài luyện bố mẹ giao, đo thời gian học

**Files:**
- Create: `src/ui/AchievementsScreen.tsx`, `src/ui/AssignedPracticeScreen.tsx`, `src/ui/useStudyTimer.ts`
- Modify: `src/ui/AppRoutes.tsx`
- Test: `src/ui/AchievementsScreen.test.tsx`, `src/ui/AssignedPracticeScreen.test.tsx`, `src/ui/useStudyTimer.test.tsx`, `src/ui/AppRoutes.test.tsx`

**Interfaces:**
- Consumes: `BADGES`, `masteredConcepts`, `practisingConcepts` (Task 6); `names.ts`, `ShopScreen` (Task 7); route mới (Task 6); `SessionScreen` (M3a).
- Produces:
  - `AchievementsScreen()`: huy hiệu (đã nhận kèm ngày, chưa có), các dạng robot đã đạt, số khái niệm đã vững và đang luyện.
  - `AssignedPracticeScreen({ id, onExit })`: phiên luyện tập nguồn `"practice"`; xong thì gửi `AssignedPracticeDone`.
  - `useStudyTimer(active)`; `TICK_MS = 15_000`, `IDLE_MS = 60_000`, `FLUSH_SECONDS = 60`.
  - `AppRoutes` mở `shop`, `achievements`, `assigned`, và bật `useStudyTimer` trên các màn hình học.

- [ ] **Step 1: Viết test thất bại**

`src/ui/AchievementsScreen.test.tsx`:

```tsx
// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { emptyMastery } from "../game/mastery";
import { initialGameState } from "../game/state";
import { renderWithGame, TODAY } from "../test/renderGame";
import { AchievementsScreen } from "./AchievementsScreen";

test("shows badges earned and not yet, the forms reached and the concepts", async () => {
  const state = initialGameState(TODAY);
  state.badges = { "first-lesson": "2026-10-01", "evolution-2": "2026-10-05" };
  state.pet.stage = 2;
  state.mastery = { a: { ...emptyMastery(), score: 90 }, b: { ...emptyMastery(), score: 50 } };
  await renderWithGame(<AchievementsScreen />, { state });
  expect(screen.getByRole("heading", { name: "Sổ thành tích" })).toBeInTheDocument();
  const first = screen.getByText("Bài học đầu tiên").closest("li") as HTMLElement;
  expect(within(first).getByText("Nhận ngày 2026-10-01")).toBeInTheDocument();
  const streak = screen.getByText("Chuỗi 30 ngày").closest("li") as HTMLElement;
  expect(within(streak).getByText("Chưa có")).toBeInTheDocument();
  const forms = screen.getByRole("heading", { name: "Các dạng của Robo" }).nextElementSibling as HTMLElement;
  expect(within(forms).getAllByRole("listitem").map((li) => li.textContent)).toEqual([
    "Viên nang",
    "Sơ sinh",
    "Chưa có",
    "Chưa có",
  ]);
  expect(screen.getByText("Khái niệm đã vững: 1")).toBeInTheDocument();
  expect(screen.getByText("Khái niệm đang luyện: 1")).toBeInTheDocument();
});
```

`src/ui/AssignedPracticeScreen.test.tsx`:

```tsx
// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { initialGameState } from "../game/state";
import { examBundle } from "../test/examBundle";
import { renderWithGame, TODAY } from "../test/renderGame";
import { AssignedPracticeScreen } from "./AssignedPracticeScreen";

const bundle = examBundle();

describe("AssignedPracticeScreen", () => {
  test("an unknown id says so", async () => {
    await renderWithGame(<AssignedPracticeScreen id="nope" onExit={() => {}} />, { bundle });
    expect(screen.getByText("Không tìm thấy bài luyện này.")).toBeInTheDocument();
  });

  test("finishing the practice removes it", async () => {
    const state = initialGameState(TODAY);
    state.progress.completedLessons = ["x.l1"];
    state.assigned = [{ id: "p1", conceptId: "k1", items: ["x.q1"], day: TODAY }];
    const { store } = await renderWithGame(<AssignedPracticeScreen id="p1" onExit={() => {}} />, { bundle, state });
    expect(screen.getByRole("heading", { name: "Bài luyện bố mẹ giao: Khái niệm k1" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("radio", { name: "Đúng" }));
    await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
    await userEvent.click(screen.getByRole("button", { name: "Hoàn thành" }));
    expect(screen.getByRole("heading", { name: "Xong bài luyện bố mẹ giao!" })).toBeInTheDocument();
    await waitFor(async () => expect((await store.loadActive())!.state.assigned).toEqual([]));
  });
});
```

`src/ui/useStudyTimer.test.tsx`:

```tsx
// @vitest-environment jsdom
import { act, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { renderWithGame } from "../test/renderGame";
import { useGame } from "./GameProvider";
import { useStudyTimer } from "./useStudyTimer";

function Timer({ active }: { active: boolean }) {
  useStudyTimer(active);
  const { state, today } = useGame();
  return <p>{state.activity.seconds[today] ?? 0}</p>;
}

/** A study screen the test can close. */
function Closable() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Timer active={open} />
      <button onClick={() => setOpen(false)}>close</button>
    </>
  );
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});
afterEach(() => {
  vi.useRealTimers();
});

describe("useStudyTimer", () => {
  test("saves a minute of active time, then stops counting after a minute without input", async () => {
    const { container } = await renderWithGame(<Timer active />);
    await act(async () => {
      vi.advanceTimersByTime(60_000);
    });
    expect(container.textContent).toBe("60");
    await act(async () => {
      vi.advanceTimersByTime(120_000);
    });
    expect(container.textContent).toBe("60");
    fireEvent.keyDown(window);
    await act(async () => {
      vi.advanceTimersByTime(60_000);
    });
    expect(container.textContent).toBe("120");
  });

  test("saves the seconds left when the study screen closes", async () => {
    const view = await renderWithGame(<Closable />);
    const seconds = () => view.container.querySelector("p")!.textContent;
    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });
    expect(seconds()).toBe("0");
    fireEvent.click(view.getByRole("button", { name: "close" }));
    expect(seconds()).toBe("30");
  });
});
```

`src/ui/AppRoutes.test.tsx`: thêm vào cuối file:

```tsx
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
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/ui/AchievementsScreen.test.tsx src/ui/AssignedPracticeScreen.test.tsx src/ui/useStudyTimer.test.tsx src/ui/AppRoutes.test.tsx`
Expected: FAIL: các file chưa có; `#/shop` vẫn mở Phòng robot.

- [ ] **Step 3: Viết code**

`src/ui/AchievementsScreen.tsx`:

```tsx
import { BADGES, masteredConcepts, practisingConcepts } from "../game/badges";
import { useLang } from "../i18n/LangProvider";
import { useGame } from "./GameProvider";
import { badgeKey, FORM_COUNT, formKey } from "./names";

/** Spec 8.2.7: badges, the robot forms reached, concepts known well and being practised; no detailed weak points. */
export function AchievementsScreen() {
  const { t } = useLang();
  const { state, profile } = useGame();
  const forms = Array.from({ length: FORM_COUNT }, (_, i) => i + 1);
  return (
    <main className="achievements">
      <h1>{t("achievements.title")}</h1>
      <section>
        <h2>{t("achievements.badges")}</h2>
        <ul className="badges">
          {BADGES.map((id) => {
            const day = state.badges[id];
            return (
              <li key={id} className={day ? "badge badge-earned" : "badge badge-locked"}>
                <span className="badge-name">{t(badgeKey(id))}</span>
                <span className="badge-day">{day ? t("achievements.earned", { day }) : t("achievements.locked")}</span>
              </li>
            );
          })}
        </ul>
      </section>
      <section>
        <h2>{t("achievements.forms", { name: profile.robotName })}</h2>
        <ol className="forms">
          {forms.map((stage) => (
            <li key={stage} className={stage <= state.pet.stage ? "form form-reached" : "form form-locked"}>
              {stage <= state.pet.stage ? t(formKey(stage)) : t("achievements.locked")}
            </li>
          ))}
        </ol>
      </section>
      <section>
        <p>{t("achievements.concepts", { n: masteredConcepts(state) })}</p>
        <p>{t("achievements.practising", { n: practisingConcepts(state) })}</p>
      </section>
      <a href="#/">{t("nav.room")}</a>
    </main>
  );
}
```

`src/ui/AssignedPracticeScreen.tsx`:

```tsx
import { useState } from "react";
import { findConcept, findItem } from "../content/lookup";
import type { Exercise } from "../content/types";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";
import { SessionScreen } from "./SessionScreen";

/** Practice a parent gave (spec 9.2): a practice session; finishing it removes it from "Học tiếp". */
export function AssignedPracticeScreen({ id, onExit }: { id: string; onExit(): void }) {
  const { t, uiLang } = useLang();
  const bundle = useContent();
  const game = useGame();
  const [assigned] = useState(() => game.state.assigned.find((a) => a.id === id));
  const [items] = useState(() =>
    (assigned?.items ?? []).map((itemId) => findItem(bundle, itemId)).filter((item): item is Exercise => item !== undefined),
  );
  const concept = assigned ? findConcept(bundle, assigned.conceptId) : undefined;

  if (!assigned) {
    return (
      <main className="room">
        <p>{t("assigned.notFound")}</p>
        <a href="#/">{t("nav.room")}</a>
      </main>
    );
  }
  return (
    <SessionScreen
      title={t("assigned.title", { concept: concept ? pick(concept.name, uiLang) : assigned.conceptId })}
      items={items}
      source="practice"
      doneTitle={t("assigned.doneTitle")}
      onFinish={() => game.dispatch({ type: "AssignedPracticeDone", id })}
      onExit={onExit}
    />
  );
}
```

`src/ui/useStudyTimer.ts`:

```ts
import { useEffect } from "react";
import { useGame } from "./GameProvider";

export const TICK_MS = 15_000;
/** Spec 5.13: time counts only with an action in the last 60 seconds. */
export const IDLE_MS = 60_000;
/** Seconds gathered before they are saved. */
export const FLUSH_SECONDS = 60;

const INPUT_EVENTS = ["keydown", "pointerdown", "wheel", "touchstart"] as const;

/**
 * Counts active study time while `active` (a study screen is open, spec 5.13): every 15 seconds, if the page is
 * visible and the child did something in the last minute. The seconds are saved once a minute and when it stops.
 */
export function useStudyTimer(active: boolean): void {
  const { dispatch } = useGame();
  useEffect(() => {
    if (!active) return;
    let lastInput = Date.now();
    let pending = 0;
    const onInput = () => {
      lastInput = Date.now();
    };
    const flush = () => {
      if (pending > 0) dispatch({ type: "ActiveTimeRecorded", seconds: pending });
      pending = 0;
    };
    for (const name of INPUT_EVENTS) window.addEventListener(name, onInput, { passive: true });
    const timer = setInterval(() => {
      if (document.visibilityState === "visible" && Date.now() - lastInput <= IDLE_MS) pending += TICK_MS / 1000;
      if (pending >= FLUSH_SECONDS) flush();
    }, TICK_MS);
    return () => {
      clearInterval(timer);
      for (const name of INPUT_EVENTS) window.removeEventListener(name, onInput);
      flush();
    };
  }, [active, dispatch]);
}
```

`src/ui/AppRoutes.tsx` (thay toàn bộ file):

```tsx
import { useState } from "react";
import { evolutionTestId, findLesson, findStage, findTopic, topicTestId } from "../content/lookup";
import type { Stage } from "../content/types";
import { findNode, nodeStatuses } from "../game/path";
import { useLang } from "../i18n/LangProvider";
import { AchievementsScreen } from "./AchievementsScreen";
import { AssignedPracticeScreen } from "./AssignedPracticeScreen";
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
import { routeToHash, useHashRoute, type Route } from "./routing";
import { ShopScreen } from "./ShopScreen";
import { TopicTestScreen } from "./TopicTestScreen";
import { useStudyTimer } from "./useStudyTimer";

/** The screens whose time counts as study time (spec 5.13). */
const STUDY_ROUTES: ReadonlySet<Route["name"]> = new Set([
  "lesson",
  "review",
  "practice",
  "topicTest",
  "evolution",
  "remedial",
  "assigned",
]);

export function AppRoutes() {
  const [route, navigate] = useHashRoute();
  const bundle = useContent();
  const { t } = useLang();

  const game = useGame();
  useStudyTimer(STUDY_ROUTES.has(route.name));
  const goHome = () => navigate({ name: "home" });
  let screen;
  if (route.name === "map") {
    screen = <MapScreen />;
  } else if (route.name === "shop") {
    screen = <ShopScreen />;
  } else if (route.name === "achievements") {
    screen = <AchievementsScreen />;
  } else if (route.name === "assigned") {
    screen = <AssignedPracticeScreen key={route.id} id={route.id} onExit={goHome} />;
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
      screen = <EvolutionRoute key={stage.id} stage={stage} stageNumber={node.stage} onExit={goHome} />;
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

/**
 * A passed evolution test is not offered again. Checked once on opening: passing the test marks its node done, and
 * the result screen must stay.
 */
function EvolutionRoute({ stage, stageNumber, onExit }: { stage: Stage; stageNumber: number; onExit(): void }) {
  const { t } = useLang();
  const game = useGame();
  const [alreadyDone] = useState(() => game.state.pet.stage > stageNumber);
  if (alreadyDone) return <Notice message={t("evolution.alreadyDone", { name: game.profile.robotName })} />;
  return <EvolutionTestScreen stage={stage} stageNumber={stageNumber} onExit={onExit} />;
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

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/AchievementsScreen.tsx src/ui/AchievementsScreen.test.tsx src/ui/AssignedPracticeScreen.tsx src/ui/AssignedPracticeScreen.test.tsx src/ui/useStudyTimer.ts src/ui/useStudyTimer.test.tsx src/ui/AppRoutes.tsx src/ui/AppRoutes.test.tsx
git commit -m "feat(ui): achievement book, practice from the parents, study time on study screens

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Phòng robot: đi nghỉ, phụ kiện, đồ trang trí, lối vào cửa hàng

**Files:**
- Modify: `src/ui/RoomScreen.tsx`, `src/ui/Robot.tsx`, `src/styles.css`
- Test: `src/ui/RoomScreen.test.tsx`

**Interfaces:**
- Consumes: `roomCondition` (Task 5), `weekTarget` (Task 5), `SHOP_ITEMS` (Task 3), `itemKey` (Task 7).
- Produces: `RobotMood` thêm `"vacation"` (kính râm); `CONDITION_MOOD` có `vacation`; Phòng robot hiện lời nhắn đi nghỉ, "Đang đeo: …", "Trong phòng: …", kế hoạch tuần trừ ngày nghỉ, link "Cửa hàng" và "Sổ thành tích".

- [ ] **Step 1: Viết test thất bại**

`src/ui/RoomScreen.test.tsx`: thêm 3 test vào cuối `describe("RoomScreen")`:

```tsx
  test("on vacation: the robot wears sunglasses and the week plan leaves out the vacation days", async () => {
    const state = initialGameState(TODAY);
    state.pet.pin = 0;
    state.vacation = { since: TODAY, ranges: [] };
    await renderWithGame(<RoomScreen />, { state });
    expect(screen.getByText("Robo đang đi nghỉ. Con vẫn học được nếu muốn!")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Robo" })).toHaveAttribute("data-mood", "vacation");
    expect(screen.getByText("Tuần này: 0/2 bài")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Sạc cho Robo" })).not.toBeInTheDocument();
  });

  test("shows what the robot wears and the room decorations, and links to the shop and the book", async () => {
    const state = initialGameState(TODAY);
    state.inventory = { consumables: {}, owned: ["kinh-ram", "tranh", "chau-cay"], equipped: ["kinh-ram"] };
    await renderWithGame(<RoomScreen />, { state });
    expect(screen.getByText("Đang đeo: Kính râm")).toBeInTheDocument();
    expect(screen.getByText("Trong phòng: Chậu cây, Bức tranh")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cửa hàng" })).toHaveAttribute("href", "#/shop");
    expect(screen.getByRole("link", { name: "Sổ thành tích" })).toHaveAttribute("href", "#/achievements");
  });

  test("practice from the parents comes first", async () => {
    const state = initialGameState(TODAY);
    state.assigned = [{ id: "p1", conceptId: "k1", items: ["q1"], day: TODAY }];
    await renderWithGame(<RoomScreen />, { state });
    expect(screen.getByRole("link", { name: "Học tiếp" })).toHaveAttribute("href", "#/assigned/p1");
  });
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/ui/RoomScreen.test.tsx`
Expected: FAIL: Phòng robot chưa có trạng thái đi nghỉ và các link mới.

- [ ] **Step 3: Viết code**

`src/ui/Robot.tsx` (thay toàn bộ file):

```tsx
import type { ReactNode } from "react";

export type RobotMood = "happy" | "neutral" | "sad" | "thinking" | "sleepy" | "drained" | "vacation";

const EYES: Record<RobotMood, ReactNode> = {
  happy: <path d="M20 21 q3 -5 6 0 M30 21 q3 -5 6 0" stroke="#6ff" strokeWidth="2" fill="none" />,
  neutral: (
    <>
      <circle cx="23" cy="20" r="2.5" fill="#6ff" />
      <circle cx="33" cy="20" r="2.5" fill="#6ff" />
    </>
  ),
  sad: <path d="M20 19 q3 4 6 0 M30 19 q3 4 6 0" stroke="#6ff" strokeWidth="2" fill="none" />,
  thinking: (
    <>
      <circle cx="23" cy="20" r="2.5" fill="#6ff" />
      <path d="M30 20 h6" stroke="#6ff" strokeWidth="2" />
    </>
  ),
  sleepy: <path d="M20 21 h6 M30 21 h6" stroke="#6ff" strokeWidth="2" />,
  drained: (
    <>
      <circle cx="23" cy="20" r="2.5" fill="#4a5578" />
      <circle cx="33" cy="20" r="2.5" fill="#4a5578" />
    </>
  ),
  // Spec 8.3: on vacation the robot wears sunglasses.
  vacation: (
    <>
      <rect x="18" y="17" width="9" height="6" rx="2" fill="#111" />
      <rect x="29" y="17" width="9" height="6" rx="2" fill="#111" />
      <path d="M27 19 h2" stroke="#111" strokeWidth="1.5" />
    </>
  ),
};

export function Robot({ mood = "neutral", size = 56 }: { mood?: RobotMood; size?: number }) {
  return (
    <svg
      role="img"
      aria-label="Robo"
      data-mood={mood}
      width={size}
      height={Math.round((size * 62) / 56)}
      viewBox="0 0 56 62"
    >
      <line x1="28" y1="8" x2="28" y2="1" stroke="#7b8bb3" strokeWidth="2" />
      <circle cx="28" cy="2" r="3" fill="#ff5c7a" />
      <rect x="10" y="8" width="36" height="26" rx="9" fill="#9aa8cc" />
      <rect x="15" y="13" width="26" height="14" rx="5" fill="#1d2440" />
      {EYES[mood]}
      <rect x="14" y="36" width="28" height="18" rx="6" fill="#7b8bb3" />
      <rect x="18" y="54" width="7" height="7" fill="#7b8bb3" />
      <rect x="31" y="54" width="7" height="7" fill="#7b8bb3" />
    </svg>
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
  roomCondition,
  stageXp,
  stageXpMax,
  todayPoints,
  weekLessons,
  type GrowthSize,
  type PetCondition,
} from "../game/progress";
import { weekStart } from "../game/dates";
import { SHOP_ITEMS } from "../game/shop";
import { STAT_MAX } from "../game/state";
import { weekTarget } from "../game/vacation";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";
import { itemKey } from "./names";
import { Robot, type RobotMood } from "./Robot";
import { routeToHash, stepRoute } from "./routing";

export const ROBOT_SIZES: Record<GrowthSize, number> = { 1: 96, 2: 128, 3: 160 };

export const CONDITION_MOOD: Record<PetCondition | "vacation", RobotMood> = {
  happy: "happy",
  normal: "neutral",
  sleepy: "sleepy",
  drained: "drained",
  vacation: "vacation",
};

export function RoomScreen() {
  const game = useGame();
  const bundle = useContent();
  const { t } = useLang();
  const { state, profile, today } = game;
  const stage = currentStage(bundle, state);
  const max = stage ? stageXpMax(stage) : 0;
  const condition = roomCondition(state, today);
  const next = nextStep(bundle, state);
  const xp = stageXp(state);
  const canReview = state.progress.completedLessons.length > 0;
  const recharge = condition === "drained" && canReview;
  // An empty battery wins over an empty joy: charging by review fixes the battery first.
  const message = condition === "drained" && state.pet.pin > 0 ? "pet.drainedVui" : (`pet.${condition}` as const);
  const names = (ids: string[]) => ids.map((id) => t(itemKey(id))).join(", ");
  const decor = SHOP_ITEMS.filter((item) => item.kind === "decor" && state.inventory.owned.includes(item.id)).map(
    (item) => item.id,
  );

  return (
    <main className="room">
      <h1>{t("room.title", { name: profile.robotName })}</h1>
      <p>{t("room.greeting", { child: profile.childName })}</p>
      <div className={`room-scene condition-${condition}`}>
        <Robot mood={CONDITION_MOOD[condition]} size={ROBOT_SIZES[growthSize(xp, max)]} />
        <p className="pet-says">{t(message, { name: profile.robotName })}</p>
        {state.inventory.equipped.length > 0 && (
          <p className="room-wearing">{t("room.wearing", { items: names(state.inventory.equipped) })}</p>
        )}
        {decor.length > 0 && <p className="room-decor">{t("room.decor", { items: names(decor) })}</p>}
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
        <li>{t("room.week", { done: weekLessons(state, today), target: weekTarget(state, weekStart(today)) })}</li>
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
        <a className="button" href={routeToHash({ name: "shop" })}>
          {t("room.shop")}
        </a>
        <a className="button" href={routeToHash({ name: "achievements" })}>
          {t("room.achievements")}
        </a>
        <a className="button" href="#/backup">
          {t("room.backup")}
        </a>
      </nav>
    </main>
  );
}
```

`src/styles.css`: thêm vào cuối file:

```css
/* M4a: shop, achievements, room extras */
.tabs { display: flex; gap: 8px; margin: 12px 0; }
.tabs [aria-selected="true"] { background: var(--primary); border-color: var(--primary); color: #fff; }
.shop-items { list-style: none; padding: 0; display: grid; gap: 8px; }
.shop-item { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 8px 12px; border: 1px solid #dde3ef; border-radius: var(--radius); }
.shop-name { font-weight: 700; min-width: 10em; }
.shop-price, .shop-detail { color: var(--muted); }
.shop-actions { margin-left: auto; display: flex; gap: 8px; align-items: center; }
.badges { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px; }
.badge { padding: 8px 12px; border-radius: var(--radius); border: 1px solid #dde3ef; display: flex; flex-direction: column; }
.badge-earned { border-color: var(--success); }
.badge-locked { color: var(--muted); }
.form-locked { color: var(--muted); }
.condition-vacation { background: #e6f6ff; }
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/RoomScreen.tsx src/ui/RoomScreen.test.tsx src/ui/Robot.tsx src/styles.css
git commit -m "feat(ui): the room on vacation, what the robot wears and the room decorations

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: E2E và kiểm tra toàn bộ

**Files:**
- Create: `e2e/shop.spec.ts`

**Interfaces:**
- Consumes: toàn bộ Task 1–9; nội dung thật (bài 1 và 2 cho 8 xu mỗi bài khi đúng ngay lần đầu, không gợi ý).
- Produces: e2e `xu from 2 lessons buy an item in the shop; the achievement book shows the first badge`.

- [ ] **Step 1: Viết test e2e**

`e2e/shop.spec.ts`:

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
  await page.getByRole("button", { name: "Nộp bài", exact: true }).click();
  await expect(page.getByText("Đúng hết 1/1 test!")).toBeVisible();
  await page.getByRole("button", { name: "Tiếp" }).click();
}

async function lesson(page: Page, code: string) {
  await page.getByRole("link", { name: "Học tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  await submitCode(page, code);
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Kiểm tra" }).click();
  await page.getByRole("button", { name: "Hoàn thành" }).click();
  await page.getByRole("button", { name: "Về phòng" }).click();
}

test("xu from 2 lessons buy an item in the shop; the achievement book shows the first badge", async ({ page }) => {
  await startApp(page);
  await lesson(page, 'print("Xin chào Robo")');
  await lesson(page, 'print("Robo đang học Python")');
  await expect(page.getByText("Xu: 16")).toBeVisible();

  await page.getByRole("link", { name: "Cửa hàng" }).click();
  await expect(page.getByText("Con có 16 xu")).toBeVisible();
  await expect(page.getByRole("button", { name: "Mua Pin sạc nhanh" })).toBeDisabled();
  await page.getByRole("button", { name: "Mua Dầu nhớt" }).click();
  await expect(page.getByText("Con có 1 xu")).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Dầu nhớt" })).toContainText("Có 1");
  await page.getByRole("tab", { name: "Phần thưởng từ bố mẹ" }).click();
  await expect(page.getByText("Bố mẹ chưa đặt phần thưởng nào.")).toBeVisible();

  await page.getByRole("link", { name: "Về phòng" }).click();
  await page.getByRole("link", { name: "Sổ thành tích" }).click();
  await expect(page.getByRole("listitem").filter({ hasText: "Bài học đầu tiên" })).toContainText("Nhận ngày");
});
```

- [ ] **Step 2: Chạy e2e**

Run: `export PW_CHROMIUM_PATH=/opt/pw-browsers/chromium; npx playwright test e2e/shop.spec.ts`
Expected: 1 passed. Nếu thất bại, đọc `test-results/*/error-context.md`.

- [ ] **Step 3: Chạy kiểm tra toàn bộ**

Run: `npm run check`
Expected: typecheck không lỗi; Vitest 551 passed; pytest 21 passed; kiểm tra nội dung qua (có các dòng "Cảnh báo:" như trước); Playwright 12 passed.

- [ ] **Step 4: Commit**

```bash
git add e2e/shop.spec.ts
git commit -m "test(e2e): buy an item with the xu from 2 lessons and see the first badge

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
