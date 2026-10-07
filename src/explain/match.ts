import type { ErrorEntry } from "../content/types";
import type { PyErrorInfo } from "../runner/types";
import { checks } from "./checks";

export interface ErrorMatch {
  entry: ErrorEntry;
  vars: Record<string, string>;
}

/** Entries are tried in file order; the first one that matches wins. */
export function matchError(entries: ErrorEntry[], error: PyErrorInfo, code: string): ErrorMatch | null {
  for (const entry of entries) {
    if (entry.match.type !== error.type) continue;
    let vars: Record<string, string> = {
      line: error.line === null ? "?" : String(error.line),
      type: error.type,
      message: error.message,
    };
    if (entry.match.message !== null) {
      const found = new RegExp(entry.match.message).exec(error.message);
      if (!found) continue;
      for (const [key, value] of Object.entries(found.groups ?? {})) {
        if (value !== undefined) vars[key] = value;
      }
    }
    if (entry.match.check !== null) {
      const result = checks[entry.match.check]({ error, code, vars });
      if (!result.ok) continue;
      vars = result.vars;
    }
    return { entry, vars };
  }
  return null;
}

export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) => vars[name] ?? whole);
}

/**
 * The misconception an error points to. A name-similar match is the case-sensitive misconception only when the
 * name and the suggestion differ just in letter case (Print -> print); a typo (pirnt -> print) is not.
 */
export function misconceptionOf(match: ErrorMatch): string | null {
  const { entry, vars } = match;
  if (entry.match.check === "similar-name" && entry.misconception === "case-sensitive") {
    const { name, suggestion } = vars;
    if (name === undefined || suggestion === undefined || name.toLowerCase() !== suggestion.toLowerCase()) return null;
  }
  return entry.misconception;
}
