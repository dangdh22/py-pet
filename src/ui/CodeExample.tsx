import { useState } from "react";
import { problemFromOutcome } from "../explain/problem";
import { useLang } from "../i18n/LangProvider";
import { useRunner } from "./contexts";
import { crashFeedback, feedbackForProblem, type Feedback } from "./feedback";
import { OutputPanel } from "./OutputPanel";
import { RobotBubble } from "./RobotBubble";
import { useExplain } from "./useExplain";

export function CodeExample({ code }: { code: string }) {
  const { t } = useLang();
  const runner = useRunner();
  const explain = useExplain();
  const [running, setRunning] = useState(false);
  const [stdout, setStdout] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function handleRun() {
    setRunning(true);
    setFeedback(null);
    setStdout(null);
    try {
      const result = await runner.run(code, "");
      setStdout(result.stdout);
      const problem = problemFromOutcome(result, false);
      setFeedback(problem ? await feedbackForProblem(problem, code, explain, t) : null);
    } catch {
      setFeedback(crashFeedback(t));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="code-example">
      <pre className="code-block">
        <code>{code}</code>
      </pre>
      <button onClick={handleRun} disabled={running || runner.status !== "ready"}>
        {running ? t("code.running") : t("code.run")}
      </button>
      {stdout !== null && <OutputPanel stdout={stdout} />}
      {feedback && <RobotBubble {...feedback} />}
    </div>
  );
}
