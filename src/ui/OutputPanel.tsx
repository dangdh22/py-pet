import { useLang } from "../i18n/LangProvider";

export const OUTPUT_DISPLAY_LIMIT = 10_000;

export function OutputPanel({ stdout }: { stdout: string }) {
  const { t } = useLang();
  const truncated = stdout.length > OUTPUT_DISPLAY_LIMIT;
  return (
    <div className="output" role="region" aria-label={t("code.output")}>
      <pre>{stdout === "" ? t("code.noOutput") : stdout.slice(0, OUTPUT_DISPLAY_LIMIT)}</pre>
      {truncated && <p>{t("code.outputTruncated")}</p>}
    </div>
  );
}
