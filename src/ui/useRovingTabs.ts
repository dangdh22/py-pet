import { useRef, type KeyboardEvent } from "react";
import { tabKeyTarget } from "./tabKeys";

/**
 * The keyboard of a tab list that follows the focus (the shop tabs, the parent tabs, the stage tabs of the map). The tab
 * list gets `onKeyDown`, each tab button gets `ref={tabRef(index)}` and `onClick={() => select(index)}`. An arrow key of
 * the list's orientation, Home or End shows the tab it moves to (`onSelect`) and moves the focus to that tab.
 */
export function useRovingTabs({
  count,
  current,
  orientation,
  onSelect,
}: {
  /** The number of tabs; a list with no tabs ignores every key. */
  count: number;
  /** The index of the tab that is shown. */
  current: number;
  orientation: "horizontal" | "vertical";
  /** Shows the tab at `index`. It is called only with an index in `0..count-1` (MapScreen relies on this: it reads `model.stages[index]`). */
  onSelect(index: number): void;
}) {
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const tabRef = (index: number) => (element: HTMLButtonElement | null) => {
    tabs.current[index] = element;
  };
  /** Shows a tab, then moves the focus to it. */
  const select = (index: number) => {
    onSelect(index);
    tabs.current[index]?.focus();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    // Alt+ArrowLeft is "Back" in some browsers, Ctrl and Cmd keys have meanings of their own: they are not tab keys.
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const target = tabKeyTarget(event.key, current, count, orientation);
    if (target === null) return;
    event.preventDefault();
    select(target);
  };
  return { tabRef, select, onKeyDown };
}
