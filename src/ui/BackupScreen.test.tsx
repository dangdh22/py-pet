// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { decodeBackup, encodeBackup } from "../storage/backup";
import { base64ToUtf8, utf8ToBase64 } from "../storage/encoding";
import { MemoryStore } from "../storage/memoryStore";
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

  test("shows an error when the export fails", async () => {
    class BrokenStore extends MemoryStore {
      broken = false;
      override async readMeta() {
        if (this.broken) throw new Error("read failed");
        return super.readMeta();
      }
      override async exportProfiles(): Promise<never> {
        throw new Error("read failed");
      }
    }
    const store = new BrokenStore({ persistent: true });
    await renderWithGame(<BackupScreen />, { store });
    store.broken = true;
    await userEvent.click(screen.getByRole("button", { name: "Xuất file sao lưu" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Chưa xuất được file sao lưu.");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
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
    await userEvent.upload(await screen.findByLabelText("Chọn file .pypet"), fileOf("hello"));
    expect(await screen.findByText("File này không phải file sao lưu của Py-Pet.")).toBeInTheDocument();
    const newer = await encodeBackup({ ...sampleBackupPayload(), schemaVersion: 99 });
    await userEvent.upload(await screen.findByLabelText("Chọn file .pypet"), fileOf(newer));
    expect(await screen.findByText("File này từ phiên bản mới hơn. Hãy tải lại trang để cập nhật app.")).toBeInTheDocument();
  });

  test("import keeps an automatic backup and replaces the data", async () => {
    const onReplaced = vi.fn();
    const { store } = await renderWithGame(<BackupScreen />, { meta: { pin: await hashPin("1234", 1000) }, onReplaced });
    await unlock("1234");
    const edited = JSON.parse(base64ToUtf8(await encodeBackup(sampleBackupPayload("Bình"))));
    edited.profiles[0].state.wallet.xu = 500;
    await userEvent.upload(await screen.findByLabelText("Chọn file .pypet"), fileOf(utf8ToBase64(JSON.stringify(edited))));
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
    await userEvent.upload(await screen.findByLabelText("Chọn file .pypet"), fileOf(await encodeBackup(sampleBackupPayload("Bình"))));
    await userEvent.click(await screen.findByRole("button", { name: "Hủy" }));
    expect(screen.getByLabelText("Chọn file .pypet")).toBeInTheDocument();
    expect(onReplaced).not.toHaveBeenCalled();
  });

  test("a double click on the confirm button imports once", async () => {
    const onReplaced = vi.fn();
    const { store } = await renderWithGame(<BackupScreen />, { meta: { pin: await hashPin("1234", 1000) }, onReplaced });
    await unlock("1234");
    await userEvent.upload(await screen.findByLabelText("Chọn file .pypet"), fileOf(await encodeBackup(sampleBackupPayload("Bình"))));
    await userEvent.dblClick(await screen.findByRole("button", { name: "Nhập dữ liệu (thay dữ liệu hiện tại)" }));
    await waitFor(() => expect(onReplaced).toHaveBeenCalledOnce());
    expect(onReplaced).toHaveBeenCalledTimes(1);
    expect((await store.readMeta()).autoBackups).toHaveLength(1);
  });

  test("a failed import shows the save error and enables the buttons again", async () => {
    class FailingStore extends MemoryStore {
      override async replaceAll(): Promise<void> {
        throw new Error("disk full");
      }
    }
    const onReplaced = vi.fn();
    const store = new FailingStore({ persistent: true });
    await renderWithGame(<BackupScreen />, { store, meta: { pin: await hashPin("1234", 1000) }, onReplaced });
    await unlock("1234");
    await userEvent.upload(await screen.findByLabelText("Chọn file .pypet"), fileOf(await encodeBackup(sampleBackupPayload("Bình"))));
    await userEvent.click(await screen.findByRole("button", { name: "Nhập dữ liệu (thay dữ liệu hiện tại)" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Không lưu được tiến độ. Hãy xuất file sao lưu ngay.");
    expect(screen.getByRole("button", { name: "Nhập dữ liệu (thay dữ liệu hiện tại)" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Hủy" })).toBeEnabled();
    expect(onReplaced).not.toHaveBeenCalled();
    expect((await store.loadActive())?.profile.childName).toBe("An");
  });
});
