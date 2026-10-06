import { useState, type FormEvent } from "react";
import { localDay } from "../game/dates";
import { initialGameState } from "../game/state";
import { useLang } from "../i18n/LangProvider";
import type { MessageKey } from "../i18n/vi";
import { requestPersistence } from "../storage/bootstrap";
import { hashPin, isValidPin } from "../storage/pin";
import type { GameStore, LoadedGame, StoredProfile } from "../storage/types";
import { Robot } from "./Robot";

export interface OnboardingProps {
  store: GameStore;
  clock: () => Date;
  onCreated(loaded: LoadedGame): void;
  requestPersist?: () => Promise<boolean>;
}

export function OnboardingScreen({ store, clock, onCreated, requestPersist = requestPersistence }: OnboardingProps) {
  const { t, uiLang, setUiLang } = useLang();
  const [childName, setChildName] = useState("");
  const [robotName, setRobotName] = useState("Robo");
  const [pin, setPin] = useState("");
  const [pinAgain, setPinAgain] = useState("");
  const [error, setError] = useState<MessageKey | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!childName.trim()) return setError("onboarding.errorName");
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
    <main className="onboarding">
      <Robot mood="happy" size={96} />
      <h1>{t("onboarding.title")}</h1>
      <form onSubmit={submit}>
        <div role="group" aria-label={t("onboarding.language")} className="lang-switch">
          <button type="button" aria-pressed={uiLang === "vi"} onClick={() => setUiLang("vi")}>
            {t("onboarding.langVi")}
          </button>
          <button type="button" aria-pressed={uiLang === "en"} onClick={() => setUiLang("en")}>
            {t("onboarding.langEn")}
          </button>
        </div>
        <label>
          {t("onboarding.childName")}
          <input value={childName} maxLength={30} onChange={(e) => setChildName(e.target.value)} />
        </label>
        <label>
          {t("onboarding.robotName")}
          <input value={robotName} maxLength={20} onChange={(e) => setRobotName(e.target.value)} />
        </label>
        <label>
          {t("onboarding.pin")}
          <input type="password" inputMode="numeric" autoComplete="new-password" value={pin} onChange={(e) => setPin(e.target.value)} />
        </label>
        <label>
          {t("onboarding.pinConfirm")}
          <input type="password" inputMode="numeric" autoComplete="new-password" value={pinAgain} onChange={(e) => setPinAgain(e.target.value)} />
        </label>
        {error && <p role="alert">{t(error)}</p>}
        <button className="primary" type="submit" disabled={busy}>
          {t("onboarding.start")}
        </button>
      </form>
    </main>
  );
}
