/**
 * The tab that a key moves to in a tab list that follows the focus (the shop tabs, the parent tabs), or null when the key
 * is not one of the list's keys. A row of tabs answers to ArrowLeft and ArrowRight, a column to ArrowUp and ArrowDown;
 * both wrap around, and Home and End go to the first and the last tab.
 */
export function tabKeyTarget(
  key: string,
  index: number,
  count: number,
  orientation: "horizontal" | "vertical",
): number | null {
  if (count <= 0) return null;
  const [back, forward] = orientation === "horizontal" ? ["ArrowLeft", "ArrowRight"] : ["ArrowUp", "ArrowDown"];
  if (key === forward) return (index + 1) % count;
  if (key === back) return (index + count - 1) % count;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return null;
}
