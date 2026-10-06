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
  test("a drained robot before the first lesson offers no charging and keeps learning first", async () => {
    const state = initialGameState(TODAY);
    state.pet.pin = 0;
    state.pet.vui = 0;
    await renderWithGame(<RoomScreen />, { state });
    expect(screen.getByRole("img", { name: "Robo" })).toHaveAttribute("data-mood", "drained");
    expect(screen.queryByRole("link", { name: "Sạc cho Robo" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Học tiếp" })).toHaveClass("button", "primary");
  });

  test("a robot with battery but no joy asks for 3 right answers in a row", async () => {
    const state = initialGameState(TODAY);
    state.pet.pin = 3;
    state.pet.vui = 0;
    state.progress.completedLessons = ["t.l1"];
    await renderWithGame(<RoomScreen />, { state });
    expect(screen.getByText("Robo buồn quá. Con trả lời đúng 3 câu liên tiếp để Robo vui lại nhé!")).toBeInTheDocument();
    expect(screen.queryByText(/hết pin/)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sạc cho Robo" })).toHaveAttribute("href", "#/review");
  });

  test("an empty battery wins over an empty joy in the message", async () => {
    const state = initialGameState(TODAY);
    state.pet.pin = 0;
    state.pet.vui = 0;
    await renderWithGame(<RoomScreen />, { state });
    expect(screen.getByText("Robo hết pin rồi. Con làm 1 trạm ôn để sạc cho Robo nhé!")).toBeInTheDocument();
  });
});
