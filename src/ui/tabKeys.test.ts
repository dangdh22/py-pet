import { describe, expect, test } from "vitest";
import { tabKeyTarget } from "./tabKeys";

describe("tabKeyTarget: a row of tabs", () => {
  test.each([
    ["ArrowRight", 0, 2, 1],
    ["ArrowRight", 1, 2, 0],
    ["ArrowLeft", 0, 2, 1],
    ["ArrowLeft", 1, 2, 0],
    ["Home", 1, 2, 0],
    ["End", 0, 5, 4],
  ])("%s on tab %i of %i goes to tab %i", (key, index, count, target) => {
    expect(tabKeyTarget(key, index, count, "horizontal")).toBe(target);
  });

  test("the vertical arrows do nothing", () => {
    expect(tabKeyTarget("ArrowDown", 0, 2, "horizontal")).toBeNull();
    expect(tabKeyTarget("ArrowUp", 0, 2, "horizontal")).toBeNull();
  });
});

describe("tabKeyTarget: a column of tabs", () => {
  test.each([
    ["ArrowDown", 4, 5, 0],
    ["ArrowDown", 1, 5, 2],
    ["ArrowUp", 0, 5, 4],
    ["ArrowUp", 3, 5, 2],
    ["Home", 3, 5, 0],
    ["End", 0, 5, 4],
  ])("%s on tab %i of %i goes to tab %i", (key, index, count, target) => {
    expect(tabKeyTarget(key, index, count, "vertical")).toBe(target);
  });

  test("the horizontal arrows and other keys do nothing", () => {
    expect(tabKeyTarget("ArrowRight", 0, 5, "vertical")).toBeNull();
    expect(tabKeyTarget("ArrowLeft", 0, 5, "vertical")).toBeNull();
    expect(tabKeyTarget("a", 0, 5, "vertical")).toBeNull();
  });
});
