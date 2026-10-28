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

/** A test that ran, failed and is not hidden has a comparison to show; a hidden test must not leak its data. */
function hasComparison(test: TestOutcome): boolean {
  return !test.passed && !test.hidden && test.ran;
}

function Comparison({ test }: { test: TestOutcome }) {
  const { t } = useLang();
  return (
    <div className="diff">
      {test.input !== "" && (
        <div className="diff-input">
          <span className="diff-label">{t("judge.input")}</span>
          <pre>{test.input}</pre>
        </div>
      )}
      <div className="diff-columns">
        <div>
          <span className="diff-label">{t("judge.expected")}</span>
          <DiffLines text={test.expected} highlight={test.firstDiffLine} />
        </div>
        <div>
          <span className="diff-label">{t("judge.actual")}</span>
          <DiffLines text={test.actual} highlight={test.firstDiffLine} />
        </div>
      </div>
    </div>
  );
}

/**
 * The results of a submit: a summary and 1 row per test. The comparison of the first failed shown test is open under its
 * row; the comparison of any other failed shown test waits in a closed block.
 */
export function TestResultList({ result }: { result: JudgeResult }) {
  const { t } = useLang();
  const firstWithComparison = result.tests.findIndex(hasComparison);
  return (
    <div className="box test-box">
      <div className="box-head">{t("judge.summary", { passed: result.passedCount, total: result.total })}</div>
      <ol aria-label={t("judge.results")}>
        {result.tests.map((test, position) => (
          <li key={test.index} className={!test.ran ? "not-run" : test.passed ? "pass" : "fail"}>
            <div className="test-row">
              <span className="test-mark" aria-hidden="true" />
              <span>
                <strong>{test.hidden ? t("judge.hidden") : t("judge.test", { n: test.index + 1 })}</strong>: {statusLabel(test, t)}
              </span>
            </div>
            {hasComparison(test) &&
              (position === firstWithComparison ? (
                <Comparison test={test} />
              ) : (
                <details>
                  <summary>{t("judge.showDiff")}</summary>
                  <Comparison test={test} />
                </details>
              ))}
          </li>
        ))}
      </ol>
    </div>
  );
}
