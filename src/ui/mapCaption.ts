import type { SyntheticEvent } from "react";

/** The room (px) kept between a caption and the side of the page. */
const EDGE = 4;

/**
 * How many px to move a box sideways so that it lies between the sides of `bounds` (with `EDGE` of room). A box wider than the bounds
 * keeps its left side in view, because the start of a name matters more than its end.
 */
export function sideShift(box: { left: number; right: number }, bounds: { left: number; right: number }): number {
  const min = bounds.left + EDGE;
  const max = bounds.right - EDGE;
  if (box.right > max) return Math.max(max - box.right, min - box.left);
  if (box.left < min) return min - box.left;
  return 0;
}

/**
 * The caption of a map square is centred under it, so the caption of a square near a side of the page would reach past the page, and
 * `.map-page` clips what reaches past it. When a square gets the pointer or the focus, this moves its caption back inside the page
 * (the CSS variable `--caption-shift`, which `.map-node-caption` adds to its transform).
 */
export function fitCaption(event: SyntheticEvent<HTMLElement>): void {
  const caption = event.currentTarget.querySelector<HTMLElement>(".map-node-caption");
  const page = event.currentTarget.closest<HTMLElement>(".map-page");
  if (!caption || !page) return;
  // Measure from the place the CSS gives it, not from the last shift.
  caption.style.removeProperty("--caption-shift");
  const shift = sideShift(caption.getBoundingClientRect(), page.getBoundingClientRect());
  if (shift !== 0) caption.style.setProperty("--caption-shift", `${Math.round(shift)}px`);
}
