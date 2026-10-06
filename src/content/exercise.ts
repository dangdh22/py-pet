import { FILL_BLANK } from "./types";

/** The lines of a parsons program: blank lines dropped, indentation kept. */
export function parsonsLines(solution: string): string[] {
  return solution
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() !== "");
}

/** Puts the answers into the blanks of a fill template, in order. */
export function fillTemplate(template: string, answers: readonly string[]): string {
  return template
    .split(FILL_BLANK)
    .map((part, i) => (i === 0 ? part : (answers[i - 1] ?? "") + part))
    .join("");
}
