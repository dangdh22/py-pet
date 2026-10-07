// @vitest-environment jsdom
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { initialGameState } from "../game/state";
import { hashPin, verifyPin } from "../storage/pin";
import { FIXED_NOW, renderWithGame, TODAY } from "../test/renderGame";
import { downloadText } from "./download";
import { ParentSettings } from "./ParentSettings";

vi.mock("./download", () => ({ downloadText: vi.fn() }));

const section = (heading: string) => screen.getByRole("heading", { name: heading }).parentElement as HTMLElement;

describe("ParentSettings", () => {
  test("starts and ends a vacation, schedules one and cancels it", async () => {
    const { store } = await renderWithGame(<ParentSettings />);
    const vacation = section("Chế độ nghỉ");
    await userEvent.click(within(vacation).getByRole("button", { name: "Bật chế độ nghỉ ngay" }));
    expect(within(vacation).getByText("Đang nghỉ từ 2026-10-06.")).toBeInTheDocument();
    await userEvent.click(within(vacation).getByRole("button", { name: "Tắt chế độ nghỉ" }));
    expect(within(vacation).getByText("Không nghỉ.")).toBeInTheDocument();
    fireEvent.change(within(vacation).getByLabelText("Từ ngày"), { target: { value: "2026-10-01" } });
    fireEvent.change(within(vacation).getByLabelText("Đến ngày"), { target: { value: "2026-10-09" } });
    await userEvent.click(within(vacation).getByRole("button", { name: "Lên lịch nghỉ" }));
    expect(within(vacation).getByRole("alert")).toHaveTextContent("Ngày bắt đầu phải từ hôm nay");
    fireEvent.change(within(vacation).getByLabelText("Từ ngày"), { target: { value: "2026-10-12" } });
    fireEvent.change(within(vacation).getByLabelText("Đến ngày"), { target: { value: "2026-10-16" } });
    await userEvent.click(within(vacation).getByRole("button", { name: "Lên lịch nghỉ" }));
    expect(within(vacation).getByText(/^2026-10-12 đến 2026-10-16/)).toBeInTheDocument();
    await waitFor(async () =>
      expect((await store.loadActive())!.state.vacation.ranges).toEqual([{ start: "2026-10-12", end: "2026-10-16" }]),
    );
    // Duplicate ranges are refused: same start and end should not be added again.
    await userEvent.click(within(vacation).getByRole("button", { name: "Lên lịch nghỉ" }));
    await waitFor(async () =>
      expect((await store.loadActive())!.state.vacation.ranges).toEqual([{ start: "2026-10-12", end: "2026-10-16" }]),
    );
    await userEvent.click(within(vacation).getByRole("button", { name: "Hủy" }));
    await waitFor(async () => expect((await store.loadActive())!.state.vacation.ranges).toEqual([]));
  });

  test("a blank number field is left out and shows the saved value again", async () => {
    const state = initialGameState(TODAY);
    state.settings.weeklyTarget = 7;
    const { store } = await renderWithGame(<ParentSettings />, { state });
    const goals = section("Mục tiêu và ngưỡng");
    const weekly = within(goals).getByLabelText("Kế hoạch tuần (bài học)") as HTMLInputElement;
    await userEvent.clear(weekly);
    await userEvent.click(within(goals).getByRole("button", { name: "Lưu cài đặt" }));
    expect(weekly.value).toBe("7");
    await waitFor(async () => expect((await store.loadActive())!.state.settings.weeklyTarget).toBe(7));
  });

  test("saves goals and limits inside their ranges, and the question language", async () => {
    const { store } = await renderWithGame(<ParentSettings />);
    const goals = section("Mục tiêu và ngưỡng");
    await userEvent.clear(within(goals).getByLabelText("Mục tiêu mỗi ngày (điểm hoạt động)"));
    await userEvent.type(within(goals).getByLabelText("Mục tiêu mỗi ngày (điểm hoạt động)"), "3");
    const passInput = within(goals).getByLabelText("Ngưỡng đạt kiểm tra (%)") as HTMLInputElement;
    await userEvent.clear(passInput);
    await userEvent.type(passInput, "30");
    await userEvent.click(within(goals).getByRole("button", { name: "Lưu cài đặt" }));
    expect(within(goals).getByRole("status")).toHaveTextContent("Đã lưu cài đặt.");
    // The field shows what was saved (cleaned: 30 was clamped to 50).
    expect(passInput.value).toBe("50");
    await userEvent.selectOptions(screen.getByLabelText("Ngôn ngữ câu hỏi mặc định"), "both");
    await waitFor(async () =>
      expect((await store.loadActive())!.state.settings).toMatchObject({ dailyGoal: 3, passPercent: 50, questionLang: "both" }),
    );
  });

  test("changes the PIN without marking a reset", async () => {
    const { store } = await renderWithGame(<ParentSettings />, { meta: { pin: await hashPin("1111") } });
    const data = section("Dữ liệu");
    await userEvent.type(within(data).getByLabelText("Mã PIN mới (4 đến 6 chữ số)"), "2468");
    await userEvent.type(within(data).getByLabelText("Nhập lại mã PIN mới"), "2468");
    await userEvent.click(within(data).getByRole("button", { name: "Đổi mã PIN" }));
    expect(await within(data).findByText("Đã đổi mã PIN.")).toBeInTheDocument();
    const meta = await store.readMeta();
    expect(meta.pinResetAt).toBeNull();
    // Verify the new PIN works.
    expect(meta.pin).toBeTruthy();
    expect(await verifyPin("2468", meta.pin!)).toBe(true);
  });

  test("deletes everything only after the child's name is typed", async () => {
    const onReplaced = vi.fn();
    const { store } = await renderWithGame(<ParentSettings />, { onReplaced });
    const button = screen.getByRole("button", { name: "Xóa hết dữ liệu" });
    expect(button).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Tên của con"), "An");
    await userEvent.click(button);
    await waitFor(() => expect(onReplaced).toHaveBeenCalledOnce());
    expect(await store.loadActive()).toBeNull();
  });

  test("shows the clock warnings and exports the error log", async () => {
    const state = initialGameState(TODAY);
    state.warnings = [{ at: FIXED_NOW.toISOString(), kind: "clock-rollback" }];
    const errorLog = [{ at: FIXED_NOW.toISOString(), kind: "ui-crash" as const, detail: "Boom" }];
    await renderWithGame(<ParentSettings />, { state, meta: { errorLog } });
    expect(screen.getByText("2026-10-06 09:00: đồng hồ máy bị chỉnh lùi")).toBeInTheDocument();
    expect(screen.getByText("2026-10-06 09:00 · ui-crash · Boom")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Xuất nhật ký lỗi" }));
    expect(downloadText).toHaveBeenCalledWith("py-pet-error-log-2026-10-06.json", JSON.stringify(errorLog, null, 2));
  });

  test("lists a broken-item entry with its kind, the item id and the message", async () => {
    const errorLog = [{ at: FIXED_NOW.toISOString(), kind: "content-error" as const, detail: "x.q1: kaboom" }];
    await renderWithGame(<ParentSettings />, { meta: { errorLog } });
    expect(screen.getByText("2026-10-06 09:00 · content-error · x.q1: kaboom")).toBeInTheDocument();
  });
});
