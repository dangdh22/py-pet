import { describe, expect, test, vi } from "vitest";
import { browserLang, isBrowserSupported } from "./browserSupport";
import { nodeRoute, parseHash, routeToHash, stepRoute } from "./routing";

describe("routing", () => {
  test("parses the home and lesson hashes", () => {
    expect(parseHash("")).toEqual({ name: "home" });
    expect(parseHash("#/")).toEqual({ name: "home" });
    expect(parseHash("#/lesson/s1.lam-quen.l1")).toEqual({ name: "lesson", lessonId: "s1.lam-quen.l1" });
  });

  test("keeps a malformed escape as the raw lesson id", () => {
    expect(parseHash("#/lesson/%E0%A4%A")).toEqual({ name: "lesson", lessonId: "%E0%A4%A" });
  });

  test("round-trips a lesson route", () => {
    const route = { name: "lesson", lessonId: "s1.a.l2" } as const;
    expect(parseHash(routeToHash(route))).toEqual(route);
    expect(routeToHash({ name: "home" })).toBe("#/");
  });
  test("parses the map and backup hashes", () => {
    expect(parseHash("#/map")).toEqual({ name: "map" });
    expect(parseHash("#/backup")).toEqual({ name: "backup" });
    expect(routeToHash({ name: "map" })).toBe("#/map");
    expect(routeToHash({ name: "backup" })).toBe("#/backup");
  });
});

describe("review and practice routes", () => {
  test("parse and round-trip", () => {
    expect(parseHash("#/review")).toEqual({ name: "review", stationId: null });
    expect(parseHash("#/review/s1.a.r1")).toEqual({ name: "review", stationId: "s1.a.r1" });
    expect(parseHash("#/practice/print-call")).toEqual({ name: "practice", conceptId: "print-call" });
    for (const route of [
      { name: "review", stationId: null },
      { name: "review", stationId: "s1.a.r1" },
      { name: "practice", conceptId: "print-call" },
    ] as const) {
      expect(parseHash(routeToHash(route))).toEqual(route);
    }
  });

  test("nodeRoute opens a lesson or a station", () => {
    expect(nodeRoute({ kind: "lesson", id: "a.l1", topicId: "a" })).toEqual({ name: "lesson", lessonId: "a.l1" });
    expect(nodeRoute({ kind: "review", id: "a.r1", topicId: "a", lessons: [] })).toEqual({ name: "review", stationId: "a.r1" });
  });
});

describe("test routes", () => {
  test("parse and round-trip", () => {
    for (const route of [
      { name: "topicTest", topicId: "s1.lam-quen" },
      { name: "evolution", stageId: "s1" },
      { name: "remedial" },
    ] as const) {
      expect(parseHash(routeToHash(route))).toEqual(route);
    }
    expect(routeToHash({ name: "topicTest", topicId: "s1.a" })).toBe("#/topic-test/s1.a");
    expect(routeToHash({ name: "evolution", stageId: "s1" })).toBe("#/evolution/s1");
  });

  test("nodeRoute and stepRoute open tests and the focused review set", () => {
    expect(nodeRoute({ kind: "topicTest", id: "a.test", topicId: "a" })).toEqual({ name: "topicTest", topicId: "a" });
    expect(nodeRoute({ kind: "evolution", id: "s.evolution", stageId: "s", stage: 1 })).toEqual({
      name: "evolution",
      stageId: "s",
    });
    expect(stepRoute({ kind: "remedial" })).toEqual({ name: "remedial" });
  });
});

describe("M4a routes", () => {
  test("parse and round-trip", () => {
    for (const route of [
      { name: "assigned", id: "p 1" },
      { name: "shop" },
      { name: "achievements" },
      { name: "parent" },
    ] as const) {
      expect(parseHash(routeToHash(route))).toEqual(route);
    }
    expect(routeToHash({ name: "assigned", id: "p1" })).toBe("#/assigned/p1");
  });

  test("stepRoute opens the practice a parent gave", () => {
    expect(stepRoute({ kind: "assigned", id: "p1" })).toEqual({ name: "assigned", id: "p1" });
  });
});

describe("gallery route", () => {
  test("opens only in a dev build", () => {
    expect(parseHash("#/gallery", true)).toEqual({ name: "gallery" });
    expect(parseHash("#/gallery", false)).toEqual({ name: "home" });
    expect(routeToHash({ name: "gallery" })).toBe("#/gallery");
  });

  test("follows import.meta.env.DEV by default", () => {
    vi.stubEnv("DEV", false);
    try {
      expect(parseHash("#/gallery")).toEqual({ name: "home" });
    } finally {
      vi.unstubAllEnvs();
    }
    expect(parseHash("#/gallery")).toEqual({ name: "gallery" });
  });
});

describe("isBrowserSupported", () => {
  const full = { WebAssembly: {}, Worker: function Worker() {}, indexedDB: {} };

  test("needs WebAssembly, Worker and indexedDB", () => {
    expect(isBrowserSupported(full)).toBe(true);
    expect(isBrowserSupported({ ...full, WebAssembly: undefined })).toBe(false);
    expect(isBrowserSupported({ ...full, Worker: undefined })).toBe(false);
    expect(isBrowserSupported({ ...full, indexedDB: undefined })).toBe(false);
    expect(isBrowserSupported({ ...full, indexedDB: null })).toBe(false);
  });
});

describe("browserLang", () => {
  test("is Vietnamese for vi languages and English for the rest", () => {
    expect(browserLang({ language: "vi" })).toBe("vi");
    expect(browserLang({ language: "vi-VN" })).toBe("vi");
    expect(browserLang({ language: "VI-vn" })).toBe("vi");
    expect(browserLang({ language: "en-US" })).toBe("en");
    expect(browserLang({ language: "fr" })).toBe("en");
    expect(browserLang({ language: "" })).toBe("en");
    expect(browserLang({})).toBe("vi");
  });
});
