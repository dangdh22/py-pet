// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { CodeEditor, type CodeEditorProps } from "./CodeEditor";

// jsdom has no layout, so a `Range` cannot measure itself, and CodeMirror measures text after each update.
// These stubs return empty boxes; CodeMirror accepts them and the tests do not depend on any size.
const emptyRect = { x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0, toJSON: () => ({}) } as DOMRect;
const original = {
  getClientRects: Range.prototype.getClientRects as Range["getClientRects"] | undefined,
  getBoundingClientRect: Range.prototype.getBoundingClientRect as Range["getBoundingClientRect"] | undefined,
};

beforeAll(() => {
  Range.prototype.getClientRects = () => [] as unknown as DOMRectList;
  Range.prototype.getBoundingClientRect = () => emptyRect;
});

afterAll(() => {
  if (original.getClientRects) Range.prototype.getClientRects = original.getClientRects;
  else Reflect.deleteProperty(Range.prototype, "getClientRects");
  if (original.getBoundingClientRect) Range.prototype.getBoundingClientRect = original.getBoundingClientRect;
  else Reflect.deleteProperty(Range.prototype, "getBoundingClientRect");
});

function renderEditor(props: Partial<CodeEditorProps> = {}) {
  const all: CodeEditorProps = {
    value: 'print("Hi")\nprint("Bye")',
    onChange: () => {},
    errorLine: null,
    ariaLabel: "Trình soạn code",
    ...props,
  };
  const view = render(<CodeEditor {...all} />);
  return { ...view, props: all };
}

describe("CodeEditor", () => {
  test("is a textbox with the accessible name it is given", () => {
    renderEditor();
    expect(screen.getByRole("textbox", { name: "Trình soạn code" })).toBeInTheDocument();
  });

  test("shows the file tab, hidden from assistive technology", () => {
    const { container } = renderEditor();
    const tab = container.querySelector(".code-editor-tab");
    expect(tab).toHaveTextContent("main.py");
    expect(tab).toHaveAttribute("aria-hidden", "true");
  });

  test("marks the error line, and removes the mark when the line is null", () => {
    const { container, rerender, props } = renderEditor({ errorLine: 1 });
    expect(container.querySelectorAll(".cm-error-line")).toHaveLength(1);
    rerender(<CodeEditor {...props} errorLine={null} />);
    expect(container.querySelectorAll(".cm-error-line")).toHaveLength(0);
  });

  test("calls onChange with the whole text when the child types", async () => {
    const onChange = vi.fn();
    renderEditor({ value: "", onChange });
    await userEvent.type(screen.getByRole("textbox", { name: "Trình soạn code" }), "x = 1");
    expect(onChange).toHaveBeenLastCalledWith("x = 1");
  });
});
