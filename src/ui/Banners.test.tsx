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
