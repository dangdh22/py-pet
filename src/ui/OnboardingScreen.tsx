import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { localDay } from "../game/dates";
import { initialGameState } from "../game/state";
import { useLang } from "../i18n/LangProvider";
import type { MessageKey } from "../i18n/vi";
import { requestPersistence } from "../storage/bootstrap";
import { hashPin, isValidPin } from "../storage/pin";
import type { GameStore, LoadedGame, StoredProfile } from "../storage/types";
import { Icon } from "./icons";
import { Robot } from "./Robot";
import { Logo } from "./shell/Logo";

export interface OnboardingProps {
  store: GameStore;
  clock: () => Date;
  onCreated(loaded: LoadedGame): void;
  /** Called by "Back" on step 1; without it, step 1 has no Back button. */
  onBack?: () => void;
  requestPersist?: () => Promise<boolean>;
}

const STEPS = 4;
/** What Robo says on each step (spec 7.2). */
const SAY: readonly MessageKey[] = ["onboarding.say1", "onboarding.say2", "onboarding.say3", "onboarding.say4"];

/** The id of the question of each step: the language question, then the labels of the first field of steps 2 to 4. "Next" is described by it. */
const QUESTION_ID = ["ob-language-question", "ob-child-name-question", "ob-robot-name-question", "ob-pin-question"] as const;

type Field = "name" | "pin" | "pinAgain";
/** The field each error is about; a save error is about none of them. */
const ERROR_FIELD: Partial<Record<MessageKey, Field>> = {
  "onboarding.errorName": "name",
  "onboarding.errorPin": "pin",
  "onboarding.errorPinMatch": "pinAgain",
};

/** The welcome (spec 7.2): 4 steps, 1 question each: language, the child's name, the robot's name, the parents' PIN. */
export function OnboardingScreen({ store, clock, onCreated, onBack, requestPersist = requestPersistence }: OnboardingProps) {
  const { t, uiLang, setUiLang } = useLang();
  const [step, setStep] = useState(1);
  const [childName, setChildName] = useState("");
  const [robotName, setRobotName] = useState("Robo");
  const [pin, setPin] = useState("");
  const [pinAgain, setPinAgain] = useState("");
  const [error, setError] = useState<MessageKey | null>(null);
  const [busy, setBusy] = useState(false);
  const nextButton = useRef<HTMLButtonElement>(null);
  const firstInput = useRef<HTMLInputElement>(null);
  const errorId = useId();

  /** The red border and the error text for a screen reader on the field the error is about; `helpId` keeps its help text. */
  function errorAttributes(field: Field, helpId?: string) {
    const marked = error !== null && ERROR_FIELD[error] === field;
    const described = [marked ? errorId : undefined, helpId].filter(Boolean).join(" ");
    return { "aria-invalid": marked || undefined, "aria-describedby": described || undefined };
  }

  // A new step puts the focus on its first control, so the child lands on the new question and Enter goes on. Step 1 has no
  // text field, so its focus goes to "Next" (Enter submits it); the language buttons are 2 or 3 Shift+Tab presses away (the Back
  // button, when there is one, is between them). A screen reader would say only "Next, button" there, so "Next" is described by
  // the question of the step (`aria-describedby`).
  useEffect(() => {
    (step === 1 ? nextButton : firstInput).current?.focus();
  }, [step]);

  function goTo(target: number) {
    setError(null);
    setStep(target);
  }

  function goBack() {
    if (step === 1) onBack?.();
    else goTo(step - 1);
  }

  /** Every step is a form: Enter and "Next" do the same. The last step checks the PIN and saves. */
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (step === 2 && !childName.trim()) return setError("onboarding.errorName");
    if (step < STEPS) return goTo(step + 1);
    void save();
  }

  async function save() {
    if (!isValidPin(pin)) return setError("onboarding.errorPin");
    if (pin !== pinAgain) return setError("onboarding.errorPinMatch");
    setError(null);
    setBusy(true);
    try {
      const now = clock();
      const profile: StoredProfile = {
        id: crypto.randomUUID(),
        childName: childName.trim(),
        robotName: robotName.trim() || "Robo",
        createdAt: now.toISOString(),
      };
      const state = initialGameState(localDay(now));
      state.settings.uiLang = uiLang;
      const pinHash = await hashPin(pin);
      await store.writeMeta({ pin: pinHash });
      await store.createProfile(profile, state);
      void requestPersist();
      const loaded = await store.loadActive();
      if (!loaded) throw new Error("profile was not found after creating it");
      onCreated(loaded);
    } catch {
      setError("onboarding.errorSave");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="ob">
      <div className="ob-left">
        <Logo link={false} />
        <p className="ob-say">{t(SAY[step - 1])}</p>
        <Robot mood="happy" size={200} />
      </div>
      <div className="ob-right">
        <div className="ob-panel">
          <h1>{t("onboarding.title")}</h1>
          <div className="ob-steps" aria-hidden="true">
            {Array.from({ length: STEPS }, (_, index) => (
              <i key={index} className={index + 1 < step ? "done" : index + 1 === step ? "current" : undefined} />
            ))}
          </div>
          <p className="ob-step">{t("onboarding.step", { n: step, total: STEPS })}</p>
          <form key={step} className="ob-form" onSubmit={handleSubmit}>
            {step === 1 && (
              <>
                <p id={QUESTION_ID[0]} className="ob-question">
                  {t("onboarding.language")}
                </p>
                <div role="group" aria-labelledby={QUESTION_ID[0]} className="lang-switch ob-lang">
                  <button type="button" aria-pressed={uiLang === "vi"} onClick={() => setUiLang("vi")}>
                    {t("onboarding.langVi")}
                  </button>
                  <button type="button" aria-pressed={uiLang === "en"} onClick={() => setUiLang("en")}>
                    {t("onboarding.langEn")}
                  </button>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <label className="ob-field">
                  <span id={QUESTION_ID[1]}>{t("onboarding.childName")}</span>
                  <input
                    ref={firstInput}
                    value={childName}
                    maxLength={30}
                    {...errorAttributes("name", "ob-name-help")}
                    onChange={(e) => setChildName(e.target.value)}
                  />
                </label>
                <p id="ob-name-help" className="ob-help">
                  {t("onboarding.nameHelp")}
                </p>
              </>
            )}
            {step === 3 && (
              <label className="ob-field">
                <span id={QUESTION_ID[2]}>{t("onboarding.robotName")}</span>
                <input ref={firstInput} value={robotName} maxLength={20} onChange={(e) => setRobotName(e.target.value)} />
              </label>
            )}
            {step === 4 && (
              <>
                <div className="ob-pins">
                  <label className="ob-field">
                    <span id={QUESTION_ID[3]}>{t("onboarding.pin")}</span>
                    <input
                      ref={firstInput}
                      type="password"
                      inputMode="numeric"
                      autoComplete="new-password"
                      {...errorAttributes("pin", "ob-pin-help")}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                    />
                  </label>
                  <label className="ob-field">
                    <span>{t("onboarding.pinConfirm")}</span>
                    <input
                      type="password"
                      inputMode="numeric"
                      autoComplete="new-password"
                      {...errorAttributes("pinAgain")}
                      value={pinAgain}
                      onChange={(e) => setPinAgain(e.target.value)}
                    />
                  </label>
                </div>
                <p id="ob-pin-help" className="ob-help">
                  {t("onboarding.pinHelp")}
                </p>
              </>
            )}
            {error && (
              <p id={errorId} role="alert">
                {t(error)}
              </p>
            )}
            <div className="ob-nav">
              {(step > 1 || onBack) && (
                <button type="button" onClick={goBack} disabled={busy}>
                  <Icon name="back" />
                  {t("onboarding.back")}
                </button>
              )}
              <button
                ref={nextButton}
                className="primary ob-next"
                type="submit"
                aria-describedby={QUESTION_ID[step - 1]}
                disabled={busy}
              >
                {t(step < STEPS ? "onboarding.next" : "onboarding.start")}
                {step < STEPS && <Icon name="next" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
