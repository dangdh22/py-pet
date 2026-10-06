import { useLang } from "../i18n/LangProvider";
import type { JudgeResult, TestOutcome } from "../runner/judge";

function DiffLines({ text, highlight }: { text: string; highlight: number | null }) {
  return (
    <pre>
      {text.split("\n").map((line, i) => (
        <span key={i} className={i === highlight ? "diff-line" : undefined}>
          {line}
          {"\n"}
        </span>
      ))}
    </pre>
  );
}

function statusLabel(test: TestOutcome, t: ReturnType<typeof useLang>["t"]): string {
  if (!test.ran) return t("judge.notRun");
  if (test.passed) return t("judge.passed");
  if (test.outcome === "timeout") return t("judge.timeout");
  if (test.outcome === "error" || test.outcome === "output-limit") return t("judge.error");
  return t("judge.failed");
}

export function TestResultList({ result }: { result: JudgeResult }) {
  const { t } = useLang();
  return (
    <ol className="test-results" aria-label={t("judge.results")}>
      {result.tests.map((test) => (
        <li key={test.index} className={test.passed ? "pass" : "fail"}>
          <strong>{test.hidden ? t("judge.hidden") : t("judge.test", { n: test.index + 1 })}</strong>:{" "}
          {statusLabel(test, t)}
          {!test.passed && !test.hidden && test.ran && (
            <div className="diff">
              {test.input !== "" && (
                <>
                  <span>{t("judge.input")}</span>
                  <pre>{test.input}</pre>
                </>
              )}
              <span>{t("judge.expected")}</span>
              <DiffLines text={test.expected} highlight={test.firstDiffLine} />
              <span>{t("judge.actual")}</span>
              <DiffLines text={test.actual} highlight={test.firstDiffLine} />
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
