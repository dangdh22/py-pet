// @vitest-environment jsdom
import type { SyntheticEvent } from "react";
import { describe, expect, test } from "vitest";
import { fitCaption, sideShift } from "./mapCaption";

describe("sideShift", () => {
  const page = { left: 64, right: 375 };

  test("a box inside the page is not moved", () => {
    expect(sideShift({ left: 100, right: 250 }, page)).toBe(0);
  });

  test("a box past the right side is moved left, up to 4 px short of the side", () => {
    expect(sideShift({ left: 256, right: 384 }, page)).toBe(-13);
  });

  test("a box past the left side is moved right, up to 4 px from the side", () => {
    expect(sideShift({ left: 32, right: 180 }, page)).toBe(36);
  });

  test("a box wider than the page keeps its left side in view", () => {
    expect(sideShift({ left: 40, right: 500 }, page)).toBe(28);
    expect(sideShift({ left: 100, right: 500 }, page)).toBe(-32);
  });
});

describe("fitCaption", () => {
  /** A `.map-page` with 1 square whose caption has the given box; `getBoundingClientRect` fakes the layout that jsdom does not have. */
  function setup(captionBox: { left: number; right: number }) {
    const page = document.createElement("main");
    page.className = "map-page";
    page.getBoundingClientRect = () => ({ left: 64, right: 375 }) as DOMRect;
    const node = document.createElement("a");
    const caption = document.createElement("span");
    caption.className = "map-node-caption";
    // The caption is where the CSS puts it, moved by the variable that was set before.
    caption.getBoundingClientRect = () => {
      const shift = parseFloat(caption.style.getPropertyValue("--caption-shift") || "0");
      return { left: captionBox.left + shift, right: captionBox.right + shift } as DOMRect;
    };
    node.append(caption);
    page.append(node);
    return { node, caption };
  }
  const eventOf = (node: HTMLElement) => ({ currentTarget: node }) as unknown as SyntheticEvent<HTMLElement>;

  test("moves a caption that reaches past the page back inside", () => {
    const { node, caption } = setup({ left: 256, right: 384 });
    fitCaption(eventOf(node));
    expect(caption.style.getPropertyValue("--caption-shift")).toBe("-13px");
  });

  test("leaves a caption inside the page alone", () => {
    const { node, caption } = setup({ left: 100, right: 250 });
    fitCaption(eventOf(node));
    expect(caption.style.getPropertyValue("--caption-shift")).toBe("");
  });

  test("measures from the place of the CSS, not from the last shift", () => {
    const { node, caption } = setup({ left: 256, right: 384 });
    fitCaption(eventOf(node));
    fitCaption(eventOf(node));
    expect(caption.style.getPropertyValue("--caption-shift")).toBe("-13px");
  });
});
