// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { MemoryStore } from "../storage/memoryStore";
import { verifyPin } from "../storage/pin";
import { renderWithApp } from "../test/render";
import { FIXED_NOW } from "../test/renderGame";
import { OnboardingScreen } from "./OnboardingScreen";

const NAME = "Tên của con";
const ROBOT = "Tên robot";
const PIN = "Mã PIN của bố mẹ (4 đến 6 chữ số)";
const PIN_AGAIN = "Nhập lại mã PIN";

function renderOnboarding(overrides: Partial<Parameters<typeof OnboardingScreen>[0]> = {}) {
  const onCreated = vi.fn();
  const store = overrides.store ?? new MemoryStore();
  renderWithApp(
    <OnboardingScreen store={store} clock={() => FIXED_NOW} onCreated={onCreated} requestPersist={async () => true} {...overrides} />,
  );
  return { store, onCreated };
}

const next = () => userEvent.click(screen.getByRole("button", { name: "Tiếp" }));

/** Clicks "Tiếp" through the language and robot name steps, types the name and both PINs, and stops on step 4. */
async function goThrough(name: string, pin: string, again = pin) {
  await next();
  if (name) await userEvent.type(screen.getByLabelText(NAME), name);
  await next();
  await next();
  await userEvent.type(screen.getByLabelText(PIN), pin);
  if (again) await userEvent.type(screen.getByLabelText(PIN_AGAIN), again);
}

describe("OnboardingScreen", () => {
  test("creates the profile, the PIN and the starting state in 4 steps", async () => {
    const requestPersist = vi.fn(async () => true);
    const store = new MemoryStore();
    const { onCreated } = renderOnboarding({ store, requestPersist });
    expect(screen.getByRole("heading", { name: "Chào mừng đến với Py-Pet!" })).toBeInTheDocument();
    expect(screen.getByText("Bước 1/4")).toBeInTheDocument();
    await goThrough("  An  ", "2468");
    expect(screen.getByText("Bước 4/4")).toBeInTheDocument();
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
    const { onCreated } = renderOnboarding();
    await userEvent.click(screen.getByRole("button", { name: "English" }));
    expect(screen.getByRole("heading", { name: "Welcome to Py-Pet!" })).toBeInTheDocument();
    expect(screen.getByText("Step 1/4")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    await userEvent.type(screen.getByLabelText("Your name"), "Mai");
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    await userEvent.clear(screen.getByLabelText("Robot name"));
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    await userEvent.type(screen.getByLabelText("Parent PIN (4 to 6 digits)"), "1234");
    await userEvent.type(screen.getByLabelText("Type the PIN again"), "1234");
    await userEvent.click(screen.getByRole("button", { name: "Start" }));
    await waitFor(() => expect(onCreated).toHaveBeenCalledOnce());
    expect(onCreated.mock.calls[0]![0].state.settings.uiLang).toBe("en");
    expect(onCreated.mock.calls[0]![0].profile.robotName).toBe("Robo");
  });

  test("each step has its own question and its own line from Robo", async () => {
    renderOnboarding();
    expect(screen.getByRole("group", { name: "Chọn ngôn ngữ" })).toBeInTheDocument();
    expect(screen.getByText("Chào bạn! Bạn muốn dùng ngôn ngữ nào?")).toBeInTheDocument();
    await next();
    expect(screen.getByLabelText(NAME)).toBeInTheDocument();
    expect(screen.getByText("Mình nên gọi bạn là gì?")).toBeInTheDocument();
    expect(screen.getByText("Robo sẽ gọi con bằng tên này.")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(NAME), "An");
    await next();
    expect(screen.getByLabelText(ROBOT)).toHaveValue("Robo");
    expect(screen.getByText("Bạn muốn đặt tên mình là gì?")).toBeInTheDocument();
    await next();
    expect(screen.getByLabelText(PIN)).toBeInTheDocument();
    expect(screen.getByLabelText(PIN_AGAIN)).toBeInTheDocument();
    expect(screen.getByText("Cuối cùng, nhờ bố mẹ đặt mã PIN nhé!")).toBeInTheDocument();
    expect(screen.getByText("Mã PIN dùng để vào Khu phụ huynh và nhập file sao lưu.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bắt đầu" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tiếp" })).not.toBeInTheDocument();
  });

  test("the first control of each step has the focus", async () => {
    renderOnboarding();
    expect(screen.getByRole("button", { name: "Tiếp" })).toHaveFocus();
    await next();
    expect(screen.getByLabelText(NAME)).toHaveFocus();
    await userEvent.type(screen.getByLabelText(NAME), "An");
    await next();
    expect(screen.getByLabelText(ROBOT)).toHaveFocus();
    await next();
    expect(screen.getByLabelText(PIN)).toHaveFocus();
  });

  test.each(["", "   "])("step 2 does not go on with the name %j", async (name) => {
    renderOnboarding();
    await next();
    if (name) await userEvent.type(screen.getByLabelText(NAME), name);
    await next();
    expect(screen.getByRole("alert")).toHaveTextContent("Con hãy nhập tên nhé.");
    expect(screen.getByText("Bước 2/4")).toBeInTheDocument();
    // A valid name goes on and the error does not follow to the next step.
    await userEvent.type(screen.getByLabelText(NAME), "An");
    await next();
    expect(screen.getByText("Bước 3/4")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("an empty name marks its field as invalid and ties it to the error text", async () => {
    renderOnboarding();
    await next();
    expect(screen.getByLabelText(NAME)).not.toHaveAttribute("aria-invalid");
    await next();
    const field = screen.getByLabelText(NAME);
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription(/Con hãy nhập tên nhé\./);
    // The help text stays in the description of the field.
    expect(field).toHaveAccessibleDescription(/Robo sẽ gọi con bằng tên này\./);
    // The next step starts clean.
    await userEvent.type(field, "An");
    await next();
    expect(screen.getByLabelText(ROBOT)).not.toHaveAttribute("aria-invalid");
  });

  test.each([
    ["12", "12", PIN, PIN_AGAIN, "Mã PIN phải gồm 4 đến 6 chữ số."],
    ["1234", "4321", PIN_AGAIN, PIN, "Hai mã PIN chưa giống nhau."],
  ])("the PINs %j and %j mark the field %s as invalid, and not the other", async (pin, again, marked, other, message) => {
    renderOnboarding();
    await goThrough("An", pin, again);
    await userEvent.click(screen.getByRole("button", { name: "Bắt đầu" }));
    expect(screen.getByLabelText(marked)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(marked)).toHaveAccessibleDescription(new RegExp(message));
    expect(screen.getByLabelText(other)).not.toHaveAttribute("aria-invalid");
  });

  test("the welcome shows the logo as plain text: no link that leads nowhere", () => {
    renderOnboarding();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Py-Pet")).toBeInTheDocument();
  });

  test.each([
    ["12", "12", "Mã PIN phải gồm 4 đến 6 chữ số."],
    ["1234", "4321", "Hai mã PIN chưa giống nhau."],
  ])("step 4 rejects the PINs %j and %j", async (pin, again, message) => {
    const { onCreated } = renderOnboarding();
    await goThrough("An", pin, again);
    await userEvent.click(screen.getByRole("button", { name: "Bắt đầu" }));
    expect(screen.getByRole("alert")).toHaveTextContent(message);
    expect(screen.getByText("Bước 4/4")).toBeInTheDocument();
    expect(onCreated).not.toHaveBeenCalled();
  });

  test("Enter on step 1 goes on to step 2", async () => {
    renderOnboarding();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByText("Bước 2/4")).toBeInTheDocument();
    expect(screen.getByLabelText(NAME)).toHaveFocus();
  });

  test("Enter in the name field goes on to step 3, and Enter there to step 4, without saving", async () => {
    const { onCreated } = renderOnboarding();
    await userEvent.keyboard("{Enter}");
    await userEvent.type(screen.getByLabelText(NAME), "An{Enter}");
    expect(screen.getByText("Bước 3/4")).toBeInTheDocument();
    expect(screen.getByLabelText(ROBOT)).toBeInTheDocument();
    expect(onCreated).not.toHaveBeenCalled();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByText("Bước 4/4")).toBeInTheDocument();
    expect(onCreated).not.toHaveBeenCalled();
  });

  test("Enter in the last step saves the profile", async () => {
    const { onCreated } = renderOnboarding();
    await goThrough("An", "1234", "");
    await userEvent.type(screen.getByLabelText(PIN_AGAIN), "1234{Enter}");
    await waitFor(() => expect(onCreated).toHaveBeenCalledOnce());
  });

  test("Back goes to the step before and keeps what was typed", async () => {
    renderOnboarding();
    await next();
    await userEvent.type(screen.getByLabelText(NAME), "An");
    await next();
    await userEvent.clear(screen.getByLabelText(ROBOT));
    await userEvent.type(screen.getByLabelText(ROBOT), "Bit");
    await userEvent.click(screen.getByRole("button", { name: "Quay lại" }));
    expect(screen.getByText("Bước 2/4")).toBeInTheDocument();
    expect(screen.getByLabelText(NAME)).toHaveValue("An");
    await next();
    expect(screen.getByLabelText(ROBOT)).toHaveValue("Bit");
  });

  test("Back on step 1 calls onBack", async () => {
    const onBack = vi.fn();
    renderOnboarding({ onBack });
    await userEvent.click(screen.getByRole("button", { name: "Quay lại" }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  test("without onBack there is no Back button on step 1, and step 2 still has it", async () => {
    renderOnboarding();
    expect(screen.queryByRole("button", { name: "Quay lại" })).not.toBeInTheDocument();
    await next();
    expect(screen.getByRole("button", { name: "Quay lại" })).toBeInTheDocument();
  });

  test("going back clears the error of the step that was left", async () => {
    renderOnboarding();
    await goThrough("An", "12");
    await userEvent.click(screen.getByRole("button", { name: "Bắt đầu" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Quay lại" }));
    expect(screen.getByText("Bước 3/4")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("shows an error and re-enables the button when the profile cannot be saved", async () => {
    class FailingStore extends MemoryStore {
      override async createProfile(): Promise<void> {
        throw new Error("disk full");
      }
    }
    const { onCreated } = renderOnboarding({ store: new FailingStore() });
    await goThrough("An", "1234");
    await userEvent.click(screen.getByRole("button", { name: "Bắt đầu" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Chưa lưu được hồ sơ. Bố mẹ thử lại nhé.");
    expect(onCreated).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Bắt đầu" })).toBeEnabled();
  });
});
