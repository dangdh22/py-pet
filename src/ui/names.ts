import type { BadgeId } from "../game/badges";
import type { MessageKey } from "../i18n/vi";

/** The message keys of shop items, badges and robot forms; a test checks that each one exists. */
export function itemKey(id: string): MessageKey {
  return `item.${id}` as MessageKey;
}

export function badgeKey(id: BadgeId): MessageKey {
  return `badge.${id}` as MessageKey;
}

/** The robot forms of the achievement book (spec 8.4), 1 per stage. */
export const FORM_COUNT = 4;

export function formKey(stage: number): MessageKey {
  return `form.${stage}` as MessageKey;
}
