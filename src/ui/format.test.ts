import { describe, expect, test } from "vitest";
import { formatScore } from "./format";

describe("formatScore", () => {
  test("writes at most 1 decimal, with a comma in Vietnamese", () => {
    expect(formatScore(19, "vi")).toBe("19");
    expect(formatScore(19.25, "vi")).toBe("19,3");
    expect(formatScore(19.25, "en")).toBe("19.3");
  });
});
