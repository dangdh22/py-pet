import type { ReactNode } from "react";
import { FORM_COUNT, robotPixelSize, type RobotForm } from "../game/look";
import type { GrowthSize } from "../game/progress";
import { Robot } from "./Robot";
import { ROBOT_MOODS } from "./robot/faces";
import { useHashRoute } from "./routing";

/*
 * Design decision 8: every robot drawing on one page, for the maintainer and reviewers. Dev builds only, so the
 * fixed English labels never reach a child and need no i18n keys.
 */
const FORMS = Array.from({ length: FORM_COUNT }, (_, i) => (i + 1) as RobotForm);
const SIZES: readonly GrowthSize[] = [1, 2, 3];
const FORM_NAMES: Record<RobotForm, string> = { 1: "Capsule", 2: "Newborn", 3: "Kid", 4: "Teen" };

/**
 * Shows the gallery in place of the app at #/gallery, before the game loads, so it opens without a profile.
 * App renders this gate only when import.meta.env.DEV, so a production build drops this module.
 */
export function DevGalleryGate({ children }: { children: ReactNode }) {
  const [route] = useHashRoute();
  return route.name === "gallery" ? <GalleryScreen /> : children;
}

export function GalleryScreen() {
  return (
    <main className="gallery">
      <h1>Robo gallery (dev only)</h1>
      <section>
        <h2>Forms × faces, 112 px</h2>
        <table className="gallery-grid">
          <thead>
            <tr>
              <th />
              {ROBOT_MOODS.map((mood) => (
                <th key={mood}>{mood}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FORMS.map((form) => (
              <tr key={form}>
                <th>
                  {form} {FORM_NAMES[form]}
                </th>
                {ROBOT_MOODS.map((mood) => (
                  <td key={mood}>
                    <Robot form={form} mood={mood} size={112} />
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th>4 graduated</th>
              {ROBOT_MOODS.map((mood) => (
                <td key={mood}>
                  <Robot form={4} graduated mood={mood} size={112} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </section>
      <section>
        <h2>Room sizes (form, growth size), standing on one floor</h2>
        <div className="gallery-floor">
          {FORMS.flatMap((form) =>
            SIZES.map((size) => (
              <figure key={`${form}-${size}`}>
                <Robot form={form} size={robotPixelSize(form, size)} />
                <figcaption>
                  {form}.{size} · {robotPixelSize(form, size)} px
                </figcaption>
              </figure>
            )),
          )}
        </div>
      </section>
      <section>
        <h2>Explanation bubble, 44 px</h2>
        <div className="gallery-floor">
          {FORMS.flatMap((form) =>
            (["happy", "sad", "thinking"] as const).map((mood) => (
              <figure key={`${form}-${mood}`}>
                <Robot form={form} mood={mood} size={44} />
                <figcaption>
                  {form} {mood}
                </figcaption>
              </figure>
            )),
          )}
        </div>
      </section>
    </main>
  );
}
