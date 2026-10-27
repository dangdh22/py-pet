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
