import type { Lang } from "../i18n/lang";
import { translate } from "../i18n/translate";
import { ErrorCard } from "./ErrorCard";

/** Rendered before any provider exists, so it takes the language as a prop and uses translate(). */
export function UnsupportedBrowser({ lang }: { lang: Lang }) {
  return (
    <main className="error-page" role="alert">
      <ErrorCard title={translate(lang, "browser.unsupportedTitle")}>
        <p>{translate(lang, "browser.unsupportedAdvice")}</p>
      </ErrorCard>
    </main>
  );
}
