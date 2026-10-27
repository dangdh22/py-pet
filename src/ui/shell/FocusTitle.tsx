import { createContext, useContext } from "react";
import { createPortal } from "react-dom";
import { StepSquares, type StepState } from "./Squares";

/**
 * The place in the bar of `FocusLayout` where a study screen puts its title. `undefined`: there is no focus frame
 * (a screen drawn alone, as in a unit test). `null`: the frame is there but has not mounted the place yet.
 */
export const FocusSlotContext = createContext<HTMLElement | null | undefined>(undefined);

/**
 * The title of a study screen, drawn in the bar of the focus frame (design spec 6.1): the topic as a small line, the
 * title as the `h1` of the page, the step squares and the progress text. It draws nothing itself where the screen is:
 * a screen that crashes takes its title away with it, while the way back stays in the bar.
 */
export function FocusTitle({
  title,
  kicker,
  progress,
  steps,
}: {
  title: string;
  kicker?: string;
  progress?: string;
  steps?: readonly StepState[];
}) {
  const slot = useContext(FocusSlotContext);
  if (slot === null) return null;
  const content = (
    <>
      <div className="focus-title">
        {kicker && <p className="focus-kicker">{kicker}</p>}
        <h1>{title}</h1>
      </div>
      {steps && <StepSquares steps={steps} />}
      {progress && <span className="focus-progress">{progress}</span>}
    </>
  );
  return slot === undefined ? <div className="focus-title-inline">{content}</div> : createPortal(content, slot);
}
