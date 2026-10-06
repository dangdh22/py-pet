import type { ErrorEntry } from "../content/types";
import type { ErrorMisconceptionFn } from "../runner/judge";
import { matchError, renderTemplate } from "./match";
import type { ExplainContext, Explanation, ExplainProvider } from "./types";

export class DictionaryProvider implements ExplainProvider {
  constructor(private readonly entries: ErrorEntry[]) {}

  async explain(context: ExplainContext): Promise<Explanation | null> {
    const match = matchError(this.entries, context.error, context.code);
    if (!match) return null;
    const { entry, vars } = match;
    return {
      text: renderTemplate(entry.explain[context.lang], vars),
      hint: entry.hint ? renderTemplate(entry.hint[context.lang], vars) : null,
      entryId: entry.id,
      misconception: entry.misconception,
    };
  }
}

export async function explainWithChain(providers: ExplainProvider[], context: ExplainContext): Promise<Explanation | null> {
  for (const provider of providers) {
    const explanation = await provider.explain(context);
    if (explanation) return explanation;
  }
  return null;
}

export function errorMisconceptionFrom(entries: ErrorEntry[]): ErrorMisconceptionFn {
  return (error, code) => matchError(entries, error, code)?.entry.misconception ?? undefined;
}
