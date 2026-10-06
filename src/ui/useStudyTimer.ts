import { useEffect } from "react";
import { useGame } from "./GameProvider";

export const TICK_MS = 15_000;
/** Spec 5.13: time counts only with an action in the last 60 seconds. */
export const IDLE_MS = 60_000;
/** Seconds gathered before they are saved. */
export const FLUSH_SECONDS = 60;

const INPUT_EVENTS = ["keydown", "pointerdown", "wheel", "touchstart"] as const;

/**
 * Counts active study time while `active` (a study screen is open, spec 5.13): every 15 seconds, if the page is
 * visible and the child did something in the last minute. The seconds are saved once a minute, when it stops and when the page is being closed.
 */
export function useStudyTimer(active: boolean): void {
  const { dispatch } = useGame();
  useEffect(() => {
    if (!active) return;
    let lastInput = Date.now();
    let pending = 0;
    const onInput = () => {
      lastInput = Date.now();
    };
    const flush = () => {
      if (pending > 0) dispatch({ type: "ActiveTimeRecorded", seconds: pending });
      pending = 0;
    };
    for (const name of INPUT_EVENTS) window.addEventListener(name, onInput, { passive: true });
    window.addEventListener("pagehide", flush);
    const timer = setInterval(() => {
      if (document.visibilityState === "visible" && Date.now() - lastInput <= IDLE_MS) pending += TICK_MS / 1000;
      if (pending >= FLUSH_SECONDS) flush();
    }, TICK_MS);
    return () => {
      clearInterval(timer);
      for (const name of INPUT_EVENTS) window.removeEventListener(name, onInput);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [active, dispatch]);
}
