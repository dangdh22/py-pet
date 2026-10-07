import type { CSSProperties, ReactNode } from "react";
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

// Inline styles, so a production build carries no gallery CSS.
const cell: CSSProperties = {
  padding: 6,
  background: "var(--surface)",
  border: "1px solid var(--border)",
  textAlign: "center",
  verticalAlign: "bottom",
};
const head: CSSProperties = { fontSize: "0.85rem", color: "var(--muted)", padding: "4px 8px" };
const floor: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-end",
  gap: 12,
  padding: 8,
  background: "var(--surface)",
  borderBottom: "3px solid var(--border)",
};
const figure: CSSProperties = { margin: 0, textAlign: "center" };
const caption: CSSProperties = { fontSize: "0.75rem", color: "var(--muted)" };

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
    <main style={{ padding: 20 }}>
      <h1>Robo gallery (dev only)</h1>
      <section>
        <h2>Forms × faces, 112 px</h2>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={head} />
              {ROBOT_MOODS.map((mood) => (
                <th key={mood} style={head}>{mood}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FORMS.map((form) => (
              <tr key={form}>
                <th style={head}>
                  {form} {FORM_NAMES[form]}
                </th>
                {ROBOT_MOODS.map((mood) => (
                  <td key={mood} style={cell}>
                    <Robot form={form} mood={mood} size={112} />
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th style={head}>4 graduated</th>
              {ROBOT_MOODS.map((mood) => (
                <td key={mood} style={cell}>
                  <Robot form={4} graduated mood={mood} size={112} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </section>
      <section>
        <h2>Room sizes (form, growth size), standing on one floor</h2>
        <div style={floor}>
          {FORMS.flatMap((form) =>
            SIZES.map((size) => (
              <figure key={`${form}-${size}`} style={figure}>
                <Robot form={form} size={robotPixelSize(form, size)} />
                <figcaption style={caption}>
                  {form}.{size} · {robotPixelSize(form, size)} px
                </figcaption>
              </figure>
            )),
          )}
        </div>
      </section>
      <section>
        <h2>Explanation bubble, 44 px</h2>
        <div style={floor}>
          {FORMS.flatMap((form) =>
            (["happy", "sad", "thinking"] as const).map((mood) => (
              <figure key={`${form}-${mood}`} style={figure}>
                <Robot form={form} mood={mood} size={44} />
                <figcaption style={caption}>
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
