import { useLang } from "../i18n/LangProvider";

/** The example of an exercise: the input (only when the test has one) beside the output the code must print. */
export function ExampleTable({ input, output }: { input: string; output: string }) {
  const { t } = useLang();
  return (
    <div className="example-table">
      {input !== "" && (
        <div>
          <span className="example-label">{t("judge.input")}</span>
          <pre>{input.trimEnd()}</pre>
        </div>
      )}
      <div>
        <span className="example-label">{t("exercise.expectedOutput")}</span>
        <pre>{output.trimEnd()}</pre>
      </div>
    </div>
  );
}
