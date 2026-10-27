import { useEffect, useRef, useState } from "react";
import { useLang } from "../i18n/LangProvider";
import { Icon } from "./icons";
import { Robot } from "./Robot";
import { Logo } from "./shell/Logo";
import { UiLangSwitch } from "./shell/UiLangSwitch";

const GUIDE_HREF = "huong-dan.html";
const PARENT_INFO_TITLE_ID = "landing-parent-info-title";

/**
 * The welcome page (design spec 6.3 and 7.1). With `onStart` there is no profile yet: the start controls call it and the parent area
 * opens an explaining card instead of the PIN screen. Without `onStart` they are plain links. It needs no game, only the language.
 */
export function LandingScreen({ onStart }: { onStart?: () => void }) {
  const { t } = useLang();
  const [parentInfoOpen, setParentInfoOpen] = useState(false);
  const toggleParentInfo = () => setParentInfoOpen((open) => !open);
  const parentInfo = useRef<HTMLElement>(null);
  const parentInfoTitle = useRef<HTMLHeadingElement>(null);

  // The card opens below the 3 actions, maybe out of view on a short window: the focus goes to its heading and the card scrolls
  // into view. Closing it leaves the focus on the button that was pressed.
  useEffect(() => {
    if (!parentInfoOpen) return;
    parentInfoTitle.current?.focus({ preventScroll: true });
    parentInfo.current?.scrollIntoView?.({ block: "nearest" });
  }, [parentInfoOpen]);

  return (
    <div className="landing-page">
      <nav aria-label={t("landing.navLabel")} className="landing-nav">
        <Logo />
        <div className="landing-menu">
          <a href="#/welcome" className="landing-link" aria-current="page">
            {t("landing.home")}
          </a>
          {onStart ? (
            <button type="button" className="landing-link" onClick={onStart}>
              {t("landing.lessons")}
            </button>
          ) : (
            <a href="#/" className="landing-link">
              {t("landing.lessons")}
            </a>
          )}
          <a href={GUIDE_HREF} className="landing-link">
            {t("landing.guide")}
          </a>
          {onStart ? (
            <button type="button" className="landing-link" onClick={toggleParentInfo} aria-expanded={parentInfoOpen}>
              {t("landing.parent")}
            </button>
          ) : (
            <a href="#/parent" className="landing-link">
              {t("landing.parent")}
            </a>
          )}
          <UiLangSwitch />
        </div>
      </nav>

      <main className="landing">
        <div className="landing-copy">
          <h1>
            {t("landing.titleA")}
            <mark>Python</mark>
            {t("landing.titleB")}
          </h1>
          <p className="landing-lead">{t("landing.lead")}</p>
          <div className="landing-actions">
            {onStart ? (
              <button type="button" className="primary landing-btn" onClick={onStart}>
                {t("landing.start")}
                <Icon name="next" />
              </button>
            ) : (
              <a href="#/" className="button primary landing-btn">
                {t("landing.start")}
                <Icon name="next" />
              </a>
            )}
            <a href={GUIDE_HREF} className="button landing-btn">
              {t("landing.guide")}
              <small aria-hidden="true">{t("landing.guideHint")}</small>
            </a>
            {onStart ? (
              <button type="button" className="mint landing-btn" onClick={toggleParentInfo} aria-expanded={parentInfoOpen}>
                {t("landing.parent")}
                <small aria-hidden="true">{t("landing.parentHint")}</small>
              </button>
            ) : (
              <a href="#/parent" className="button mint landing-btn">
                {t("landing.parent")}
                <small aria-hidden="true">{t("landing.parentHint")}</small>
              </a>
            )}
          </div>
          {onStart && parentInfoOpen && (
            <section ref={parentInfo} className="card landing-parent-info" aria-labelledby={PARENT_INFO_TITLE_ID}>
              <h2 ref={parentInfoTitle} id={PARENT_INFO_TITLE_ID} tabIndex={-1} className="card-title">
                {t("landing.parentInfoTitle")}
              </h2>
              <p>{t("landing.parentInfoText")}</p>
              <div className="landing-parent-actions">
                <button type="button" className="primary small" onClick={onStart}>
                  {t("landing.parentInfoStart")}
                </button>
                <a href={`${GUIDE_HREF}#bo-me`} className="button small">
                  {t("landing.parentInfoGuide")}
                </a>
              </div>
            </section>
          )}
        </div>

        <div className="landing-stage">
          <div className="landing-robo">
            <Robot form={3} mood="happy" size={190} />
          </div>
          <div className="landing-bubble">{t("landing.robotHello")}</div>
          <div className="landing-code" aria-hidden="true">
            <div className="landing-code-bar">
              <i />
              <i />
              <i />
              <span>robo.py</span>
            </div>
            <pre>
              {t("landing.code1")}
              {"\n"}
              {t("landing.code2")}
            </pre>
            <div className="landing-code-out">{t("landing.codeOutput")}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
