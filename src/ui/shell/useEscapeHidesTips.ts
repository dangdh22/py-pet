import { useEffect } from "react";

/**
 * Escape hides the floating notes (WCAG 1.4.13): the labels of the narrow side menu, the date of an earned badge and the captions
 * of the map squares. They show on hover or on keyboard focus, so a person must be able to dismiss them without moving the pointer
 * or the focus. The key puts `data-tips-hidden` on the root element (the style sheets show a note only while the root has no such
 * attribute). The next `focusin` or `pointerover` removes it, so the notes of the place the person moves to show as usual.
 *
 * Call it once, in the frame that has the notes. The listener never calls `preventDefault` or `stopPropagation`: the key still
 * reaches the other listeners (the evolution show skips on Escape) and the browser.
 */
export function useEscapeHidesTips(): void {
  useEffect(() => {
    const root = document.documentElement;
    const hide = (event: KeyboardEvent) => {
      if (event.key === "Escape") root.dataset.tipsHidden = "";
    };
    const show = () => {
      delete root.dataset.tipsHidden;
    };
    document.addEventListener("keydown", hide);
    document.addEventListener("focusin", show);
    document.addEventListener("pointerover", show);
    return () => {
      document.removeEventListener("keydown", hide);
      document.removeEventListener("focusin", show);
      document.removeEventListener("pointerover", show);
      show();
    };
  }, []);
}
