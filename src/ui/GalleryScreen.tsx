import { useState, type CSSProperties, type ReactNode } from "react";
import { FORM_COUNT, robotPixelSize, type RobotForm, type RobotLook } from "../game/look";
import type { GrowthSize } from "../game/progress";
import { SHOP_ITEMS } from "../game/shop";
import { EvolutionShow } from "./EvolutionShow";
import { Robot, type RobotMood } from "./Robot";
import { BUBBLE_ROBOT_SIZE } from "./RobotBubble";
import { ItemIcon } from "./robot/accessories";
import { DECOR_IDS } from "./robot/decor";
import { RoomScene } from "./robot/RoomScene";
import { ROBOT_MOODS } from "./robot/faces";
import { useHashRoute } from "./routing";

/*
 * Design decision 8: every robot drawing on one page, for the maintainer and reviewers. Dev builds only, so the
 * fixed English labels never reach a child and need no i18n keys.
 */
const FORMS = Array.from({ length: FORM_COUNT }, (_, i) => (i + 1) as RobotForm);
const SIZES: readonly GrowthSize[] = [1, 2, 3];
const FORM_NAMES: Record<RobotForm, string> = { 1: "Capsule", 2: "Newborn", 3: "Kid", 4: "Teen" };
const ACCESSORIES = SHOP_ITEMS.filter((item) => item.kind === "accessory").map((item) => item.id);
/** One accessory in each slot together, and the states that change how they show. */
const OUTFITS: readonly { label: string; mood: RobotMood; equipped: string[]; graduated?: boolean }[] = [
  { label: "cap + sunglasses + bow", mood: "happy", equipped: ["mu-luoi-trai", "kinh-ram", "no-buom"] },
  { label: "crown + round glasses + cape", mood: "neutral", equipped: ["vuong-mien", "kinh-tron", "ao-choang"], graduated: true },
  { label: "headphones + scarf, thinking", mood: "thinking", equipped: ["tai-nghe", "khan-quang"] },
  { label: "gold antenna + pin, drained", mood: "drained", equipped: ["ang-ten-vang", "ghim-sao"] },
  { label: "vacation: no face accessory", mood: "vacation", equipped: ["mu-luoi-trai", "kinh-tron", "khan-quang"] },
  { label: "sleepy + crown + cape", mood: "sleepy", equipped: ["vuong-mien", "ao-choang"] },
  { label: "gold antenna + scarf, graduated", mood: "happy", equipped: ["ang-ten-vang", "khan-quang"], graduated: true },
];

/** The 5 room states, each on another form, so the scenes also show each form at its room size. */
const SCENES: readonly RobotLook[] = [
  { state: "happy", form: 1, graduated: false, size: 2, equipped: ["mu-luoi-trai", "no-buom"] },
  { state: "neutral", form: 2, graduated: false, size: 3, equipped: [] },
  { state: "sleepy", form: 3, graduated: false, size: 1, equipped: ["vuong-mien"] },
  { state: "drained", form: 4, graduated: true, size: 2, equipped: ["khan-quang"] },
  { state: "vacation", form: 3, graduated: false, size: 3, equipped: ["mu-luoi-trai", "kinh-tron"] },
];
/** The evolution shows the child can see: each evolution, and the check of the last stage. */
const SHOWS: readonly { label: string; from: RobotForm; to: RobotForm; graduated: boolean; equipped: string[] }[] = [
  { label: "1 → 2", from: 1, to: 2, graduated: false, equipped: [] },
  { label: "2 → 3", from: 2, to: 3, graduated: false, equipped: ["mu-luoi-trai", "no-buom"] },
  { label: "3 → 4", from: 3, to: 4, graduated: false, equipped: ["kinh-tron", "khan-quang"] },
  { label: "4 → 4 graduated", from: 4, to: 4, graduated: true, equipped: ["vuong-mien", "ao-choang"] },
];

/**
 * A phone (360 px screen) and a laptop (the 860 px the room gets inside its 900 px column); the drained forms also
 * on the smallest phone (320 px screen, 280 px for the room).
 */
const SCENE_WIDTHS = [328, 860] as const;
const SMALL_PHONE = 280;

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

function EvolutionShows() {
  const [playing, setPlaying] = useState<number | null>(null);
  const [ended, setEnded] = useState<string | null>(null);
  const show = playing === null ? null : SHOWS[playing]!;
  return (
    <section>
      <h2>Evolution show</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {SHOWS.map((item, index) => (
          <button key={item.label} type="button" data-show={index} onClick={() => setPlaying(index)}>
            Play {item.label}
          </button>
        ))}
      </div>
      {ended && <p style={caption}>Last show ended: {ended}</p>}
      {show && (
        <EvolutionShow
          key={playing}
          from={{ form: show.from, graduated: false }}
          to={{ form: show.to, graduated: show.graduated }}
          equipped={show.equipped}
          robotName="Robo"
          onDone={() => {
            setEnded(show.label);
            setPlaying(null);
          }}
        />
      )}
    </section>
  );
}

export function GalleryScreen() {
  return (
    <main style={{ padding: 20 }}>
      <h1>Robo gallery (dev only)</h1>
      <EvolutionShows />
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
        <h2>Accessories × forms, 112 px (shop icon at 40 px)</h2>
        <table style={{ borderCollapse: "collapse" }}>
          <tbody>
            {ACCESSORIES.map((id) => (
              <tr key={id}>
                <th style={head}>{id}</th>
                <td style={cell}>
                  <ItemIcon id={id} />
                </td>
                {FORMS.map((form) => (
                  <td key={form} style={cell}>
                    <Robot form={form} equipped={[id]} size={112} />
                  </td>
                ))}
              </tr>
            ))}
            {OUTFITS.map((outfit) => (
              <tr key={outfit.label}>
                <th style={head}>{outfit.label}</th>
                <td style={cell} />
                {FORMS.map((form) => (
                  <td key={form} style={cell}>
                    <Robot
                      form={form}
                      mood={outfit.mood}
                      equipped={outfit.equipped}
                      graduated={form === 4 && outfit.graduated}
                      size={112}
                    />
                  </td>
                ))}
              </tr>
            ))}
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
        <h2>Room scenes: phone without and with decor, laptop with decor</h2>
        {SCENES.map((look) => (
          <div key={look.state} style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
            {[
              { width: SCENE_WIDTHS[0], decor: [] as readonly string[] },
              { width: SCENE_WIDTHS[0], decor: DECOR_IDS },
              { width: SCENE_WIDTHS[1], decor: DECOR_IDS },
            ].map(({ width, decor }) => (
              <figure key={`${width}-${decor.length}`} style={{ ...figure, width }}>
                <RoomScene look={look} decor={[...decor]} robotSize={robotPixelSize(look.form, look.size)}>
                  <p>Robo is {look.state}. A sentence long enough to wrap on a phone.</p>
                </RoomScene>
                <figcaption style={caption}>
                  {look.state} · form {look.form}.{look.size} · {width} px · {decor.length} decor
                </figcaption>
              </figure>
            ))}
          </div>
        ))}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {FORMS.map((form) => (
            <figure key={form} style={{ ...figure, width: SMALL_PHONE }}>
              <RoomScene
                look={{ state: "drained", form, graduated: false, size: 3, equipped: [] }}
                decor={[]}
                robotSize={robotPixelSize(form, 3)}
              />
              <figcaption style={caption}>
                drained · form {form}.3 · {SMALL_PHONE} px (320 px screen), lying on the floor line
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section>
        <h2>Explanation bubble, {BUBBLE_ROBOT_SIZE} px</h2>
        <div style={floor}>
          {FORMS.flatMap((form) =>
            (["happy", "sad", "thinking"] as const).map((mood) => (
              <figure key={`${form}-${mood}`} style={figure}>
                <Robot form={form} mood={mood} size={BUBBLE_ROBOT_SIZE} />
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
