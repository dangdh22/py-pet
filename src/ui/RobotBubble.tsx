import { useLang } from "../i18n/LangProvider";
import { Robot, type RobotMood } from "./Robot";

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
      <Robot mood={mood} size={44} />
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
