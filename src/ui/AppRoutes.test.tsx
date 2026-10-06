// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { RunnerClient } from "../runner/client";
import { FakeWorker } from "../test/fakeWorker";
import { testBundle } from "../test/fixtures";
import { renderWithApp } from "../test/render";
import { App } from "./App";
import { AppRoutes } from "./AppRoutes";
import { ErrorBoundary } from "./ErrorBoundary";

beforeEach(() => {
  window.location.hash = "";
});

describe("AppRoutes", () => {
  test("lists the lessons and opens one", async () => {
    renderWithApp(<AppRoutes />);
    expect(screen.getByRole("heading", { name: "Bài học" })).toBeInTheDocument();
    expect(screen.getByText("Giai đoạn thử")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("link", { name: "Bài thử" }));
    expect(await screen.findByText("Thẻ 1/2")).toBeInTheDocument();
  });

  test("marks a finished lesson as done", async () => {
    renderWithApp(<AppRoutes />);
    await userEvent.click(screen.getByRole("link", { name: "Bài thử 2" }));
    await userEvent.click(await screen.findByRole("button", { name: "Hoàn thành" }));
    await userEvent.click(screen.getByRole("button", { name: "Về danh sách bài" }));
    expect(await screen.findByText("Đã xong")).toBeInTheDocument();
  });

  test("shows a message for an unknown lesson", () => {
    window.location.hash = "#/lesson/khong-co";
    renderWithApp(<AppRoutes />);
    expect(screen.getByText("Không tìm thấy bài học này.")).toBeInTheDocument();
  });
});

describe("ErrorBoundary", () => {
  test("shows a friendly message when a screen throws", () => {
    function Boom(): never {
      throw new Error("boom");
    }
    vi.spyOn(console, "error").mockImplementation(() => {});
    renderWithApp(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Robo bị trục trặc rồi.");
    expect(screen.getByRole("button", { name: "Tải lại trang" })).toBeInTheDocument();
  });
});

describe("App", () => {
  test("shows the runner status from the client", async () => {
    const workers: FakeWorker[] = [];
    const client = new RunnerClient(() => {
      const worker = new FakeWorker();
      workers.push(worker);
      return worker;
    }, "http://localhost/pyodide/");
    render(<App bundle={testBundle()} runnerClient={client} />);
    expect(screen.getByText("Robo đang khởi động...")).toBeInTheDocument();
    act(() => workers[0]!.emit({ type: "ready" }));
    expect(await screen.findByText("Robo sẵn sàng")).toBeInTheDocument();
  });
});
