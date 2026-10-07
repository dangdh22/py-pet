import type { ChoiceQuestion } from "../content/types";

/** A question whose view throws when it renders (its choices are missing), to test the per-item error boundary. */
export function brokenQuestion(question: ChoiceQuestion): ChoiceQuestion {
  return { ...question, choices: undefined as unknown as ChoiceQuestion["choices"] };
}
