import { useState, type FormEvent } from "react";
import { cleanSettings, SETTING_LIMITS, type NumberSetting } from "../game/settings";
import type { GameSettings } from "../game/state";
import type { Lang, QuestionLang } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import type { MessageKey } from "../i18n/vi";
import { isValidPin } from "../storage/pin";
import { downloadText } from "./download";
import { formatDateTime } from "./format";
import { useGame } from "./GameProvider";

const NUMBER_FIELDS: { key: NumberSetting; label: MessageKey }[] = [
  { key: "dailyGoal", label: "settings.dailyGoal" },
  { key: "weeklyTarget", label: "settings.weeklyTarget" },
  { key: "graceDays", label: "settings.graceDays" },
  { key: "passPercent", label: "settings.passPercent" },
  { key: "helpPercent", label: "settings.helpPercent" },
  { key: "runSeconds", label: "settings.runSeconds" },
];

const QUESTION_LANGS: { value: QuestionLang; label: MessageKey }[] = [
  { value: "vi", label: "question.langVi" },
  { value: "en", label: "question.langEn" },
  { value: "both", label: "question.langBoth" },
];

/** Spec 9.5: vacation, goals and limits (*), languages, data (backup, PIN, delete) and the logs. */
export function ParentSettings() {
  return (
    <section className="parent-settings">
      <VacationSettings />
      <NumberSettings />
      <LanguageSettings />
      <DataSettings />
      <Logs />
    </section>
  );
}

function VacationSettings() {
  const { t } = useLang();
  const game = useGame();
  const { state, today } = game;
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [bad, setBad] = useState(false);
  const upcoming = state.vacation.ranges.filter((range) => range.end >= today);
  function schedule(event: FormEvent) {
    event.preventDefault();
    if (start === "" || end === "" || start < today || start > end) return setBad(true);
    // Refuse exact duplicates.
    if (upcoming.some((range) => range.start === start && range.end === end)) return;
    setBad(false);
    game.dispatch({ type: "VacationScheduled", start, end });
    setStart("");
    setEnd("");
  }
  const on = state.vacation.since !== null;
  return (
    <div>
      <h2>{t("settings.vacationTitle")}</h2>
      <p>{on ? t("settings.vacationOn", { day: state.vacation.since as string }) : t("settings.vacationOff")}</p>
      <button onClick={() => game.dispatch({ type: "VacationToggled", on: !on })}>
        {t(on ? "settings.vacationStop" : "settings.vacationStart")}
      </button>
      {/* noValidate: the app checks the dates and shows its own message. */}
      <form onSubmit={schedule} className="settings-row" noValidate>
        <label>
          {t("settings.scheduleFrom")}
          <input type="date" value={start} min={today} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label>
          {t("settings.scheduleTo")}
          <input type="date" value={end} min={today} onChange={(e) => setEnd(e.target.value)} />
        </label>
        <button type="submit">{t("settings.schedule")}</button>
      </form>
      {bad && <p role="alert">{t("settings.scheduleBad")}</p>}
      {upcoming.length > 0 && (
        <ul>
          {upcoming.map((range) => (
            <li key={`${range.start}-${range.end}`}>
              {t("settings.scheduled", { start: range.start, end: range.end })}{" "}
              <button onClick={() => game.dispatch({ type: "VacationCancelled", start: range.start })}>
                {t("settings.cancel")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NumberSettings() {
  const { t } = useLang();
  const game = useGame();
  const [values, setValues] = useState<Record<NumberSetting, string>>(
    () =>
      Object.fromEntries(NUMBER_FIELDS.map(({ key }) => [key, String(game.state.settings[key])])) as Record<
        NumberSetting,
        string
      >,
  );
  const [saved, setSaved] = useState(false);
  function save(event: FormEvent) {
    event.preventDefault();
    const patch: Partial<GameSettings> = {};
    for (const { key } of NUMBER_FIELDS) {
      const text = values[key].trim();
      const value = Number(text);
      // A blank or non-numeric field is left out, so the saved value stays.
      if (text !== "" && Number.isFinite(value)) patch[key] = value;
    }
    game.dispatch({ type: "SettingsChanged", patch });
    // Refill the field values from the cleaned settings.
    const cleaned = cleanSettings(game.state.settings, patch);
    setValues(
      Object.fromEntries(NUMBER_FIELDS.map(({ key }) => [key, String(cleaned[key])])) as Record<NumberSetting, string>,
    );
    setSaved(true);
  }
  return (
    // noValidate: values outside the limits are brought inside them (cleanSettings).
    <form onSubmit={save} noValidate>
      <h2>{t("settings.goalsTitle")}</h2>
      {NUMBER_FIELDS.map(({ key, label }) => (
        <label key={key} className="settings-row">
          {t(label)}
          <input
            type="number"
            min={SETTING_LIMITS[key].min}
            max={SETTING_LIMITS[key].max}
            value={values[key]}
            onChange={(e) => {
              setSaved(false);
              setValues((current) => ({ ...current, [key]: e.target.value }));
            }}
          />
        </label>
      ))}
      <button className="primary" type="submit">
        {t("settings.save")}
      </button>
      {saved && <p role="status">{t("settings.saved")}</p>}
    </form>
  );
}

function LanguageSettings() {
  const { t, uiLang, setUiLang } = useLang();
  const game = useGame();
  return (
    <div>
      <h2>{t("settings.langTitle")}</h2>
      <label className="settings-row">
        {t("settings.uiLang")}
        {/* The game saves the interface language when it changes (GameProvider). */}
        <select value={uiLang} onChange={(e) => setUiLang(e.target.value as Lang)}>
          <option value="vi">{t("onboarding.langVi")}</option>
          <option value="en">{t("onboarding.langEn")}</option>
        </select>
      </label>
      <label className="settings-row">
        {t("settings.questionLang")}
        <select
          value={game.state.settings.questionLang}
          onChange={(e) =>
            game.dispatch({ type: "SettingsChanged", patch: { questionLang: e.target.value as QuestionLang } })
          }
        >
          {QUESTION_LANGS.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.label)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function DataSettings() {
  const { t } = useLang();
  const game = useGame();
  const [pin, setPin] = useState("");
  const [again, setAgain] = useState("");
  const [pinMessage, setPinMessage] = useState<MessageKey | null>(null);
  const [pinError, setPinError] = useState(false);
  const [name, setName] = useState("");
  const [eraseError, setEraseError] = useState(false);
  async function changePin(event: FormEvent) {
    event.preventDefault();
    if (!isValidPin(pin)) return setPinMessage("onboarding.errorPin");
    if (pin !== again) return setPinMessage("onboarding.errorPinMatch");
    setPinError(false);
    try {
      await game.setPin(pin, false);
      setPin("");
      setAgain("");
      setPinMessage("settings.pinChanged");
    } catch {
      setPinError(true);
      setPinMessage("banner.writeFailed");
    }
  }
  async function erase() {
    setEraseError(false);
    try {
      await game.eraseAll();
    } catch {
      setEraseError(true);
    }
  }
  return (
    <div>
      <h2>{t("settings.dataTitle")}</h2>
      <a className="button" href="#/backup">
        {t("settings.backupLink")}
      </a>
      <form onSubmit={changePin}>
        <h3>{t("settings.changePin")}</h3>
        <label className="settings-row">
          {t("parent.newPin")}
          <input type="password" inputMode="numeric" autoComplete="new-password" value={pin} onChange={(e) => setPin(e.target.value)} />
        </label>
        <label className="settings-row">
          {t("parent.newPinAgain")}
          <input type="password" inputMode="numeric" autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} />
        </label>
        <button type="submit">{t("settings.changePin")}</button>
        {pinMessage && <p role={pinError ? "alert" : "status"}>{t(pinMessage)}</p>}
      </form>
      <h3>{t("settings.erase")}</h3>
      <p>{t("settings.eraseNote")}</p>
      <label className="settings-row">
        {t("settings.eraseConfirm")}
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <button className="danger" disabled={name.trim() !== game.profile.childName} onClick={() => void erase()}>
        {t("settings.eraseButton")}
      </button>
      {eraseError && <p role="alert">{t("banner.writeFailed")}</p>}
    </div>
  );
}

function Logs() {
  const { t } = useLang();
  const game = useGame();
  const { warnings } = game.state;
  return (
    <div>
      <h2>{t("settings.logsTitle")}</h2>
      <h3>{t("settings.warnings")}</h3>
      {warnings.length === 0 ? (
        <p>{t("settings.noEntries")}</p>
      ) : (
        <ul>
          {warnings.map((warning) => (
            <li key={warning.at}>{t("settings.warningItem", { time: formatDateTime(warning.at) })}</li>
          ))}
        </ul>
      )}
      <h3>{t("settings.errors")}</h3>
      {game.errorLog.length === 0 ? (
        <p>{t("settings.noEntries")}</p>
      ) : (
        <>
          <ul className="error-log">
            {game.errorLog.map((entry, i) => (
              <li key={`${entry.at}-${i}`}>
                {formatDateTime(entry.at)} · {entry.kind} · {entry.detail}
              </li>
            ))}
          </ul>
          <button
            onClick={() =>
              downloadText(`py-pet-error-log-${game.today}.json`, JSON.stringify(game.errorLog, null, 2))
            }
          >
            {t("settings.exportLog")}
          </button>
        </>
      )}
    </div>
  );
}
