// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { MemoryStore } from "../storage/memoryStore";
import { verifyPin } from "../storage/pin";
import { renderWithApp } from "../test/render";
import { FIXED_NOW } from "../test/renderGame";
import { OnboardingScreen } from "./OnboardingScreen";

async function fill(name: string, pin: string, pinAgain = pin) {
  await userEvent.type(screen.getByLabelText("Tên của con"), name);
  await userEvent.type(screen.getByLabelText("Mã PIN của bố mẹ (4 đến 6 chữ số)"), pin);
  await userEvent.type(screen.getByLabelText("Nhập lại mã PIN"), pinAgain);
}

describe("OnboardingScreen", () => {
  test("creates the profile, the PIN and the starting state", async () => {
    const store = new MemoryStore();
    const onCreated = vi.fn();
    const requestPersist = vi.fn(async () => true);
    renderWithApp(<OnboardingScreen store={store} clock={() => FIXED_NOW} onCreated={onCreated} requestPersist={requestPersist} />);
    expect(screen.getByRole("heading", { name: "Chào mừng đến với Py-Pet!" })).toBeInTheDocument();
    expect(screen.getByLabelText("Tên robot")).toHaveValue("Robo");
    await fill("  An  ", "2468");
    await userEvent.click(screen.getByRole("button", { name: "Bắt đầu" }));
    await waitFor(() => expect(onCreated).toHaveBeenCalledOnce());
    const loaded = onCreated.mock.calls[0]![0];
    expect(loaded.profile).toMatchObject({ childName: "An", robotName: "Robo", createdAt: FIXED_NOW.toISOString() });
    expect(loaded.state.settings.uiLang).toBe("vi");
    expect(loaded.state.week.start).toBe("2026-10-05");
    const meta = await store.readMeta();
    expect(await verifyPin("2468", meta.pin!)).toBe(true);
    expect(requestPersist).toHaveBeenCalledOnce();
  });

  test("the language choice switches the screen and is saved", async () => {
    const store = new MemoryStore();
    const onCreated = vi.fn();
    renderWithApp(<OnboardingScreen store={store} clock={() => FIXED_NOW} onCreated={onCreated} requestPersist={async () => true} />);
    await userEvent.click(screen.getByRole("button", { name: "English" }));
    expect(screen.getByRole("heading", { name: "Welcome to Py-Pet!" })).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Your name"), "Mai");
    await userEvent.clear(screen.getByLabelText("Robot name"));
    await userEvent.type(screen.getByLabelText("Parent PIN (4 to 6 digits)"), "1234");
    await userEvent.type(screen.getByLabelText("Type the PIN again"), "1234");
    await userEvent.click(screen.getByRole("button", { name: "Start" }));
    await waitFor(() => expect(onCreated).toHaveBeenCalledOnce());
    expect(onCreated.mock.calls[0]![0].state.settings.uiLang).toBe("en");
    expect(onCreated.mock.calls[0]![0].profile.robotName).toBe("Robo");
  });

  test.each([
    ["", "1234", "1234", "Con hãy nhập tên nhé."],
    ["An", "12", "12", "Mã PIN phải gồm 4 đến 6 chữ số."],
    ["An", "1234", "4321", "Hai mã PIN chưa giống nhau."],
  ])("rejects name %j with PIN %j / %j", async (name, pin, again, message) => {
    const onCreated = vi.fn();
    renderWithApp(<OnboardingScreen store={new MemoryStore()} clock={() => FIXED_NOW} onCreated={onCreated} requestPersist={async () => true} />);
    if (name) await userEvent.type(screen.getByLabelText("Tên của con"), name);
    await userEvent.type(screen.getByLabelText("Mã PIN của bố mẹ (4 đến 6 chữ số)"), pin);
    await userEvent.type(screen.getByLabelText("Nhập lại mã PIN"), again);
    await userEvent.click(screen.getByRole("button", { name: "Bắt đầu" }));
    expect(screen.getByRole("alert")).toHaveTextContent(message);
    expect(onCreated).not.toHaveBeenCalled();
  });

  test("shows an error and re-enables the button when the profile cannot be saved", async () => {
    class FailingStore extends MemoryStore {
      override async createProfile(): Promise<void> {
        throw new Error("disk full");
      }
    }
    const onCreated = vi.fn();
    renderWithApp(<OnboardingScreen store={new FailingStore()} clock={() => FIXED_NOW} onCreated={onCreated} requestPersist={async () => true} />);
    await fill("An", "1234");
    await userEvent.click(screen.getByRole("button", { name: "Bắt đầu" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Chưa lưu được hồ sơ. Bố mẹ thử lại nhé.");
    expect(onCreated).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Bắt đầu" })).toBeEnabled();
  });
});
