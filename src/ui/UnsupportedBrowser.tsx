import type { Lang } from "../i18n/lang";
import { translate } from "../i18n/translate";
import { Robot } from "./Robot";

/** Rendered before any provider exists, so it takes the language as a prop and uses translate(). */
export function UnsupportedBrowser({ lang }: { lang: Lang }) {
  return (
    <main className="crash unsupported" role="alert">
      <Robot mood="sad" size={96} />
      <h1>{translate(lang, "browser.unsupportedTitle")}</h1>
      <p>{translate(lang, "browser.unsupportedAdvice")}</p>
    </main>
  );
}
