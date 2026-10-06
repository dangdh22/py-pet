import { describe, expect, test } from "vitest";
import { translate } from "../i18n/translate";
import type { MessageKey } from "../i18n/vi";
import type { MessageVars } from "../i18n/translate";
import { crashFeedback, feedbackForProblem } from "./feedback";

const t = (key: MessageKey, vars?: MessageVars) => translate("vi", key, vars);
const nameError = { type: "NameError", message: "name 'x' is not defined", line: 2, column: null, lineText: "print(x)" };

describe("feedbackForProblem", () => {
  test("uses the explanation and the raw error", async () => {
    const explain = async () => ({ text: "Giải thích", hint: "Gợi ý", entryId: "x", misconception: null });
    expect(await feedbackForProblem(nameError, "print(x)", explain, t)).toEqual({
      mood: "sad",
      message: "Giải thích",
      hint: "Gợi ý",
      rawError: 'File "<bai-cua-con>", line 2\n    print(x)\nNameError: name \'x\' is not defined',
    });
  });

  test("falls back to the unknown message", async () => {
    const feedback = await feedbackForProblem(nameError, "print(x)", async () => null, t);
    expect(feedback.message).toBe("Lỗi này lạ quá, con hỏi bố mẹ nhé.");
    expect(feedback.rawError).toContain("NameError");
  });

  test("has no raw error for pseudo errors", async () => {
    const timeout = { type: "Timeout", message: "", line: null, column: null, lineText: "" };
    const explain = async () => ({ text: "Lâu quá", hint: null, entryId: "timeout", misconception: null });
    expect((await feedbackForProblem(timeout, "", explain, t)).rawError).toBeNull();
  });
});

test("crashFeedback", () => {
  expect(crashFeedback(t)).toEqual({ mood: "sad", message: "Robo bị trục trặc rồi. Con tải lại trang nhé.", hint: null, rawError: null });
});
