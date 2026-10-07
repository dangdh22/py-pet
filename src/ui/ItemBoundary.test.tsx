// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { renderWithGame } from "../test/renderGame";
import { ItemBoundary } from "./ItemBoundary";

function Boom(): never {
  throw new Error("kaboom");
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

test("a healthy item shows as usual", async () => {
  await renderWithGame(
    <ItemBoundary itemId="x.q1" onSkip={() => {}}>
      <p>Bài ổn</p>
    </ItemBoundary>,
  );
  expect(screen.getByText("Bài ổn")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Bỏ qua" })).not.toBeInTheDocument();
});

test("a render error shows the message, logs content-error with the id and the message, and Bỏ qua skips", async () => {
  const onSkip = vi.fn();
  const { store } = await renderWithGame(
    <ItemBoundary itemId="x.q1" onSkip={onSkip}>
      <Boom />
    </ItemBoundary>,
  );
  expect(screen.getByRole("alert")).toHaveTextContent("Bài này đang bị lỗi, con bỏ qua nhé");
  await waitFor(async () => {
    const log = (await store.readMeta()).errorLog;
    expect(log).toHaveLength(1);
    expect(log[0]).toMatchObject({ kind: "content-error" });
    expect(log[0]!.detail).toContain("x.q1");
    expect(log[0]!.detail).toContain("kaboom");
  });
  await userEvent.click(screen.getByRole("button", { name: "Bỏ qua" }));
  expect(onSkip).toHaveBeenCalledOnce();
});

test("the message is shown in English too", async () => {
  await renderWithGame(
    <ItemBoundary itemId="x.q1" onSkip={() => {}}>
      <Boom />
    </ItemBoundary>,
    { lang: "en" },
  );
  expect(screen.getByRole("button", { name: "Skip" })).toBeInTheDocument();
});
