// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi as vitestVi } from "vitest";
import { LangProvider, useLang } from "./LangProvider";

function Probe() {
  const { t, uiLang, setUiLang, questionLang } = useLang();
  return (
    <div>
      <p>{t("lesson.next")}</p>
      <p>ui:{uiLang}</p>
      <p>question:{questionLang}</p>
      <button onClick={() => setUiLang("en")}>to-en</button>
    </div>
  );
}

test("switches the interface language", async () => {
  render(
    <LangProvider>
      <Probe />
    </LangProvider>,
  );
  expect(screen.getByText("Tiếp")).toBeInTheDocument();
  expect(screen.getByText("question:vi")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "to-en" }));
  expect(screen.getByText("Next")).toBeInTheDocument();
  expect(screen.getByText("ui:en")).toBeInTheDocument();
  expect(document.documentElement.lang).toBe("en");
});

test("starts with the given language", () => {
  render(
    <LangProvider initialLang="en">
      <Probe />
    </LangProvider>,
  );
  expect(screen.getByText("Next")).toBeInTheDocument();
});

test("useLang outside the provider throws", () => {
  vitestVi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => render(<Probe />)).toThrow("useLang must be used inside <LangProvider>");
});
