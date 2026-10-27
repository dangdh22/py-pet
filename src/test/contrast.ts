/** WCAG 2.x contrast checks for the tests that guard the color pairs of the UI. */

function channel(hex: string, start: number): number {
  const value = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

/** Relative luminance of a `#rrggbb` color (WCAG 2.x). */
function luminance(color: string): number {
  if (!/^#[0-9a-f]{6}$/i.test(color)) throw new Error(`Expected a #rrggbb color, got "${color}"`);
  return 0.2126 * channel(color, 1) + 0.7152 * channel(color, 3) + 0.0722 * channel(color, 5);
}

/** The contrast ratio of 2 `#rrggbb` colors, from 1 to 21; the order of the arguments does not matter. */
export function contrastRatio(foreground: string, background: string): number {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** A `#rrggbb` or `rgba(r, g, b, a)` color as its 3 channels (0 to 255) and its opacity (0 to 1). */
function parseColor(color: string): { channels: number[]; alpha: number } {
  if (/^#[0-9a-f]{6}$/i.test(color)) {
    return { channels: [1, 3, 5].map((start) => Number.parseInt(color.slice(start, start + 2), 16)), alpha: 1 };
  }
  const match = /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d*\.?\d+)\s*\)$/i.exec(color);
  if (!match) throw new Error(`Expected a #rrggbb or rgba(r, g, b, a) color, got "${color}"`);
  return { channels: [match[1], match[2], match[3]].map(Number), alpha: Number(match[4]) };
}

/**
 * The `#rrggbb` color that the eye sees when `top` (`#rrggbb` or `rgba(r, g, b, a)`) is painted over the opaque `bottom`
 * (`#rrggbb`). A translucent tint is checked through this: `contrastRatio(text, composite(tint, background))`.
 */
export function composite(top: string, bottom: string): string {
  const over = parseColor(top);
  const under = parseColor(bottom);
  if (under.alpha !== 1) throw new Error(`The color underneath must be opaque, got "${bottom}"`);
  return `#${over.channels
    .map((value, i) => Math.round(over.alpha * value + (1 - over.alpha) * under.channels[i]!))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`;
}
