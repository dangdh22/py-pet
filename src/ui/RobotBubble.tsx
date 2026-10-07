import { useLang } from "../i18n/LangProvider";
import { PetRobot } from "./PetRobot";
import type { RobotMood } from "./Robot";

/** Big enough for the small face screen of the teen to read beside the text. */
export const BUBBLE_ROBOT_SIZE = 56;

export interface RobotBubbleProps {
  mood: RobotMood;
  message: string;
  hint?: string | null;
  rawError?: string | null;
}

export function RobotBubble({ mood, message, hint = null, rawError = null }: RobotBubbleProps) {
  const { t } = useLang();
  return (
    <div className="robot-bubble" role="status">
      <PetRobot mood={mood} size={BUBBLE_ROBOT_SIZE} />
      <div className="bubble">
        <p>{message}</p>
        {hint && <p className="bubble-hint">{hint}</p>}
        {rawError && (
          <details>
            <summary>{t("code.rawError")}</summary>
            <pre>{rawError}</pre>
          </details>
        )}
      </div>
    </div>
  );
}
