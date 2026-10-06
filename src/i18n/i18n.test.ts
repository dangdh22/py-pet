import { describe, expect, test } from "vitest";
import { en } from "./en";
import { pick, pickBoth } from "./lang";
import { translate } from "./translate";
import { vi, type MessageKey } from "./vi";

describe("message catalogs", () => {
  test("vi and en have the same keys", () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(vi).sort());
  });

  test("no message is empty", () => {
    for (const message of [...Object.values(vi), ...Object.values(en)]) {
      expect(message.trim()).not.toBe("");
    }
  });

  test("placeholders are the same in vi and en", () => {
    const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();
    for (const key of Object.keys(vi) as MessageKey[]) {
      expect(placeholders(en[key])).toEqual(placeholders(vi[key]));
    }
  });
});

describe("translate", () => {
  test("fills placeholders", () => {
    expect(translate("vi", "lesson.cardOf", { current: 2, total: 5 })).toBe("Thẻ 2/5");
    expect(translate("en", "lesson.cardOf", { current: 2, total: 5 })).toBe("Card 2/5");
  });

  test("keeps a placeholder that has no value", () => {
    expect(translate("vi", "lesson.cardOf", { current: 1 })).toBe("Thẻ 1/{total}");
  });
});

describe("pick", () => {
  test("returns the English text when it exists", () => {
    expect(pick({ vi: "Xin chào", en: "Hello" }, "en")).toBe("Hello");
  });

  test("falls back to Vietnamese when English is missing", () => {
    expect(pick({ vi: "Xin chào" }, "en")).toBe("Xin chào");
  });

  test("pickBoth joins the 2 languages only when they differ", () => {
    expect(pickBoth({ vi: "Lỗi", en: "Error" })).toBe("Lỗi / Error");
    expect(pickBoth({ vi: "5", en: "5" })).toBe("5");
    expect(pickBoth({ vi: "Chỉ tiếng Việt" })).toBe("Chỉ tiếng Việt");
  });
});
