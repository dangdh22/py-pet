import { describe, expect, test } from "vitest";
import { isBrowserSupported } from "./browserSupport";
import { parseHash, routeToHash } from "./routing";

describe("routing", () => {
  test("parses the home and lesson hashes", () => {
    expect(parseHash("")).toEqual({ name: "home" });
    expect(parseHash("#/")).toEqual({ name: "home" });
    expect(parseHash("#/lesson/s1.lam-quen.l1")).toEqual({ name: "lesson", lessonId: "s1.lam-quen.l1" });
  });

  test("round-trips a lesson route", () => {
    const route = { name: "lesson", lessonId: "s1.a.l2" } as const;
    expect(parseHash(routeToHash(route))).toEqual(route);
    expect(routeToHash({ name: "home" })).toBe("#/");
  });
});

describe("isBrowserSupported", () => {
  test("needs WebAssembly and Worker", () => {
    expect(isBrowserSupported({ WebAssembly: {}, Worker: function Worker() {} })).toBe(true);
    expect(isBrowserSupported({ Worker: function Worker() {} })).toBe(false);
    expect(isBrowserSupported({ WebAssembly: {} })).toBe(false);
  });
});
