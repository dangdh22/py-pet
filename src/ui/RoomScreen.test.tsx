// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { addDays, weekStart } from "../game/dates";
import { nextStep } from "../game/path";
import { initialGameState } from "../game/state";
import { pick } from "../i18n/lang";
import { examBundle } from "../test/examBundle";
import { testBundle } from "../test/fixtures";
import { renderWithGame, TODAY } from "../test/renderGame";
import { reviewBundle } from "../test/reviewBundle";
import { nextStepLabel } from "./nextStepLabel";
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
    expect(screen.getByRole("meter", { name: "Pin" })).toHaveAttribute("aria-valuenow", "4");
    expect(screen.getByRole("meter", { name: "Vui" })).toHaveAttribute("aria-valuemax", "5");
    expect(screen.getByRole("meter", { name: "Lớn lên" })).toHaveAttribute("aria-valuenow", "0");
    expect(document.querySelector(".room-scene")).toHaveAttribute("data-scene", "room");
    expect(document.querySelector(".room-scene")).toHaveAttribute("data-condition", "happy");
    expect(screen.getByText("Mục tiêu hôm nay: 0/2")).toBeInTheDocument();
    expect(screen.getByText("Tuần này: 0/10 bài")).toBeInTheDocument();
    expect(screen.getByText("Chuỗi: 0 ngày")).toBeInTheDocument();
    expect(screen.getByText("Thẻ giữ chuỗi: 0")).toBeInTheDocument();
    expect(screen.getByText("Xu: 0")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Học tiếp" })).toHaveAttribute("href", "#/lesson/t.l1");
    expect(screen.getByRole("heading", { name: "Robo hôm nay" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mục tiêu" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Ôn tập" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Sạc cho Robo" })).not.toBeInTheDocument();
    // The side menu has these links; the room does not repeat them.
    for (const name of ["Bản đồ học", "Cửa hàng", "Sổ thành tích", "Khu phụ huynh", "Sao lưu"]) {
      expect(screen.queryByRole("link", { name })).not.toBeInTheDocument();
    }
  });

  test("the card of the next step is named \"Học tiếp\" and describes the step and the stage", async () => {
    const bundle = testBundle();
    const step = nextStep(bundle, initialGameState(TODAY));
    if (!step) throw new Error("the fixture has a lesson to do");
    await renderWithGame(<RoomScreen />, { bundle });
    const link = screen.getByRole("link", { name: "Học tiếp" });
    expect(link).toHaveClass("next-card");
    expect(link).toHaveAccessibleDescription(`${nextStepLabel(bundle, step, "vi")} · ${pick(bundle.stages[0]!.title, "vi")}`);
    expect(link).toHaveAccessibleDescription("Bài thử · Giai đoạn thử");
  });

  test("the card of the next step follows the interface language", async () => {
    await renderWithGame(<RoomScreen />, { lang: "en" });
    const link = screen.getByRole("link", { name: "Continue learning" });
    expect(link).toHaveAttribute("href", "#/lesson/t.l1");
    expect(link).toHaveAccessibleDescription("Test lesson · Test stage");
  });

  test("the next step of the map names a review station", async () => {
    const state = initialGameState(TODAY);
    state.progress.completedLessons = ["r.l1", "r.l2"];
    await renderWithGame(<RoomScreen />, { state, bundle: reviewBundle() });
    expect(screen.getByRole("link", { name: "Học tiếp" })).toHaveAccessibleDescription("Trạm ôn · Giai đoạn ôn");
  });

  test("the review button shows its hint beside the label without changing its name", async () => {
    const state = initialGameState(TODAY);
    state.progress.completedLessons = ["t.l1"];
    await renderWithGame(<RoomScreen />, { state });
    const review = screen.getByRole("link", { name: "Ôn tập" });
    expect(review).toHaveClass("button", "mint");
    expect(review).toHaveTextContent("5 câu, sạc Pin cho Robo");
  });

  test("the goals show a square for each point and each lesson of the plan", async () => {
    const state = initialGameState(TODAY);
    state.streak.pointsDay = TODAY;
    state.streak.points = 1;
    state.week = { ...state.week, start: weekStart(TODAY), lessonsDone: 3 };
    await renderWithGame(<RoomScreen />, { state });
    const [today, week] = [...document.querySelectorAll(".room-goals .squares")];
    expect(today?.children).toHaveLength(2);
    expect(today?.querySelectorAll(".on")).toHaveLength(1);
    expect(week?.children).toHaveLength(10);
    expect(week?.querySelectorAll(".on")).toHaveLength(3);
    expect(today).toHaveAttribute("aria-hidden", "true");
    expect(week).toHaveAttribute("aria-hidden", "true");
  });

  test("a long week plan shows at most 10 squares and fills them in proportion", async () => {
    const state = initialGameState(TODAY);
    state.settings.weeklyTarget = 28;
    state.week = { ...state.week, start: weekStart(TODAY), lessonsDone: 14 };
    await renderWithGame(<RoomScreen />, { state });
    const week = document.querySelectorAll(".room-goals .squares")[1];
    expect(screen.getByText("Tuần này: 14/28 bài")).toBeInTheDocument();
    expect(week?.children).toHaveLength(10);
    expect(week?.querySelectorAll(".on")).toHaveLength(5);
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
    expect(screen.getByRole("img", { name: "Robo" })).toHaveAttribute("width", "112");
    expect(screen.getByText("Robo hết pin rồi. Con làm 1 trạm ôn để sạc cho Robo nhé!")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sạc cho Robo" })).toHaveAttribute("href", "#/review");
    expect(document.querySelector('.room-scene [data-part="charger"]')).not.toBeNull();
    expect(screen.getByText("Lớn lên: 79%")).toBeInTheDocument();
    expect(screen.getByRole("meter", { name: "Lớn lên" })).toHaveAttribute("aria-valuenow", "79");
    expect(screen.getByText("Xu: 75")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Học tiếp" })).not.toBeInTheDocument();
    expect(screen.getByText("Con đã học hết các bài hiện có. Robo chờ bài mới nhé!")).toBeInTheDocument();
  });

  test("with every lesson done the card says so and there is nothing to continue", async () => {
    const state = initialGameState(TODAY);
    state.progress.completedLessons = ["t.l1", "t.l2"];
    await renderWithGame(<RoomScreen />, { state });
    expect(screen.getByText("Con đã học hết các bài hiện có. Robo chờ bài mới nhé!")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Học tiếp" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ôn tập" })).toBeInTheDocument();
  });

  test("a drained robot before the first lesson offers no charging and keeps learning first", async () => {
    const state = initialGameState(TODAY);
    state.pet.pin = 0;
    state.pet.vui = 0;
    await renderWithGame(<RoomScreen />, { state });
    expect(screen.getByRole("img", { name: "Robo" })).toHaveAttribute("data-mood", "drained");
    expect(screen.queryByRole("link", { name: "Sạc cho Robo" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Học tiếp" })).toHaveClass("next-card");
  });

  test("a robot with battery but no joy asks for 3 right answers in a row", async () => {
    const state = initialGameState(TODAY);
    state.pet.pin = 3;
    state.pet.vui = 0;
    state.progress.completedLessons = ["t.l1"];
    await renderWithGame(<RoomScreen />, { state });
    expect(screen.getByText("Robo buồn quá. Con trả lời đúng 3 câu liên tiếp để Robo vui lại nhé!")).toBeInTheDocument();
    expect(screen.queryByText(/hết pin/)).not.toBeInTheDocument();
    const charge = screen.getByRole("link", { name: "Sạc cho Robo" });
    expect(charge).toHaveAttribute("href", "#/review");
    expect(charge).toHaveClass("next-card");
    // "Học tiếp" steps down to a plain button under the charging card.
    const next = screen.getByRole("link", { name: "Học tiếp" });
    expect(next).toHaveAttribute("href", "#/lesson/t.l2");
    expect(next).toHaveClass("button");
    expect(next).not.toHaveClass("next-card", "primary");
    expect(screen.queryByRole("link", { name: "Ôn tập" })).not.toBeInTheDocument();
  });

  test("an empty battery wins over an empty joy in the message", async () => {
    const state = initialGameState(TODAY);
    state.pet.pin = 0;
    state.pet.vui = 0;
    await renderWithGame(<RoomScreen />, { state });
    expect(screen.getByText("Robo hết pin rồi. Con làm 1 trạm ôn để sạc cho Robo nhé!")).toBeInTheDocument();
  });

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

  test("a graduated robot shows its growth bar full", async () => {
    const state = initialGameState(TODAY);
    state.pet.stage = 5;
    state.pet.xp = 900;
    state.pet.stageStartXp = 900;
    await renderWithGame(<RoomScreen />, { state });
    expect(screen.getByText("Lớn lên: 100%")).toBeInTheDocument();
    expect(screen.getByRole("meter", { name: "Lớn lên" })).toHaveAttribute("aria-valuenow", "100");
  });

  test("on vacation: the robot wears sunglasses and the week plan leaves out the vacation days", async () => {
    const state = initialGameState(TODAY);
    state.pet.pin = 0;
    state.vacation = { since: TODAY, ranges: [] };
    await renderWithGame(<RoomScreen />, { state });
    expect(screen.getByText("Robo đang đi nghỉ. Con vẫn học được nếu muốn!")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Robo" })).toHaveAttribute("data-mood", "vacation");
    expect(document.querySelector(".room-scene")).toHaveAttribute("data-scene", "beach");
    expect(screen.getByText("Tuần này: 0/2 bài")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Sạc cho Robo" })).not.toBeInTheDocument();
  });

  test("a week fully on vacation says so instead of 0 lessons", async () => {
    const state = initialGameState(TODAY);
    state.vacation = { since: null, ranges: [{ start: weekStart(TODAY), end: addDays(weekStart(TODAY), 6) }] };
    await renderWithGame(<RoomScreen />, { state });
    expect(screen.getByText("Tuần này là tuần nghỉ")).toBeInTheDocument();
    expect(screen.queryByText(/Tuần này: /)).not.toBeInTheDocument();
  });

  test("shows what the robot wears and the room decorations", async () => {
    const state = initialGameState(TODAY);
    state.inventory = { consumables: {}, owned: ["kinh-ram", "tranh", "chau-cay"], equipped: ["kinh-ram"] };
    await renderWithGame(<RoomScreen />, { state });
    expect(screen.getByText("Đang đeo: Kính râm")).toBeInTheDocument();
    expect(screen.getByText("Trong phòng: Chậu cây, Bức tranh")).toBeInTheDocument();
    expect([...document.querySelectorAll(".room-scene [data-decor]")].map((el) => el.getAttribute("data-decor"))).toEqual(
      expect.arrayContaining(["chau-cay", "tranh"]),
    );
    expect(document.querySelectorAll(".room-scene [data-decor]")).toHaveLength(2);
  });

  test("practice from the parents comes first", async () => {
    const state = initialGameState(TODAY);
    state.assigned = [{ id: "p1", conceptId: "k1", items: ["q1"], day: TODAY }];
    await renderWithGame(<RoomScreen />, { state });
    expect(screen.getByRole("link", { name: "Học tiếp" })).toHaveAttribute("href", "#/assigned/p1");
  });
});
