import { useCallback, useEffect, useRef } from "react";
import type { RobotForm } from "../game/look";
import { useLang } from "../i18n/LangProvider";
import type { MessageKey } from "../i18n/vi";
import { Robot } from "./Robot";

export interface EvolutionShowForm {
  form: RobotForm;
  /** Passed the check of the last stage (design decision 1). */
  graduated: boolean;
}

export interface EvolutionShowProps {
  from: EvolutionShowForm;
  to: EvolutionShowForm;
  equipped: string[];
  robotName: string;
  /** Called once: at the end of the show, on "Skip" or Esc, or at once when motion is reduced. */
  onDone(): void;
  /** By default the "prefers-reduced-motion: reduce" media query; no matchMedia means motion. */
  reducedMotion?: boolean;
}

/** The last step ends at about 4.3 s; the timer ends the show when animationend never comes. */
const FALLBACK_MS = 6000;

/** Design decision 2: the part each form adds. */
const NEW_PART: Partial<Record<RobotForm, MessageKey>> = {
  2: "evolution.newPart.antenna",
  3: "evolution.newPart.arms",
  4: "evolution.newPart.chest",
};

/** Grows with the form, so the new form is never smaller than the old one on the show. */
function showSize(form: RobotForm): number {
  return 140 + 20 * form;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Design decision 7, the evolution show of spec 8.2.5 (about 4 s): a dark screen, the old form shakes and
 * brightens, a white flash, the new form grows in, then the line that names the new part. "Skip" and Esc end it
 * at any time; with reduced motion it ends before it shows.
 */
export function EvolutionShow({ from, to, equipped, robotName, onDone, reducedMotion }: EvolutionShowProps) {
  const { t } = useLang();
  const reduce = reducedMotion ?? prefersReducedMotion();
  const skipRef = useRef<HTMLButtonElement>(null);
  const partRef = useRef<HTMLParagraphElement>(null);
  const onDoneRef = useRef(onDone);
  const doneRef = useRef(false);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDoneRef.current();
  }, []);

  useEffect(() => {
    if (reduce) {
      finish();
      return;
    }
    skipRef.current?.focus();
    const timer = window.setTimeout(finish, FALLBACK_MS);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        finish();
      } else if (event.key === "Tab") {
        // The skip button is the only control of the modal dialog: the focus stays on it.
        event.preventDefault();
        skipRef.current?.focus();
      }
    };
    // The line of the new part is the last step. animationend bubbles: only the line's own animation counts.
    const part = partRef.current;
    const onPartEnd = (event: Event) => {
      if (event.target === part) finish();
    };
    document.addEventListener("keydown", onKey);
    part?.addEventListener("animationend", onPartEnd);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
      part?.removeEventListener("animationend", onPartEnd);
    };
  }, [reduce, finish]);

  if (reduce) return null;

  const partKey: MessageKey = to.graduated ? "evolution.newPart.graduated" : (NEW_PART[to.form] ?? "evolution.body");
  return (
    <div
      className="evolution-show"
      role="dialog"
      aria-modal="true"
      aria-label={t("evolution.title", { name: robotName })}
    >
      <div className="evo-stage">
        <div className="evo-halo" aria-hidden="true" />
        <div className="evo-old">
          <Robot form={from.form} graduated={from.graduated} equipped={equipped} size={showSize(from.form)} />
        </div>
        <div className="evo-new">
          <Robot
            form={to.form}
            graduated={to.graduated}
            equipped={equipped}
            mood="happy"
            size={showSize(to.form)}
          />
        </div>
      </div>
      <div className="evo-lines">
        <p className="evo-from">{t("evolution.from", { name: robotName })}</p>
        <p ref={partRef} className="evo-part">
          {t(partKey, { name: robotName })}
        </p>
      </div>
      <div className="evo-flash" aria-hidden="true" />
      <button ref={skipRef} type="button" className="evo-skip" onClick={finish}>
        {t("evolution.skip")}
      </button>
    </div>
  );
}
