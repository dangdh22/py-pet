// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import type { RobotLook, RobotState } from "../../game/look";
import { SHOP_ITEMS } from "../../game/shop";
import { RoomScene } from "./RoomScene";

const STATES: readonly RobotState[] = ["happy", "neutral", "sleepy", "drained", "vacation"];
const DECOR = SHOP_ITEMS.filter((item) => item.kind === "decor").map((item) => item.id);

const look = (state: RobotState, extra: Partial<RobotLook> = {}): RobotLook => ({
  form: 2,
  graduated: false,
  size: 1,
  state,
  equipped: [],
  ...extra,
});

const scene = (container: HTMLElement) => container.querySelector(".room-scene") as HTMLElement;

describe("RoomScene", () => {
  test("each state is drawn in the room, except the vacation on the beach", () => {
    for (const state of STATES) {
      const { container, unmount } = render(<RoomScene look={look(state)} decor={[]} robotSize={120} />);
      const where = state === "vacation" ? "beach" : "room";
      expect(scene(container)).toHaveAttribute("data-scene", where);
      expect(scene(container)).toHaveClass(`scene-${where}`);
      expect(scene(container)).toHaveAttribute("data-condition", state);
      expect(screen.getByRole("img", { name: "Robo" })).toHaveAttribute("data-mood", state);
      expect(screen.getByRole("img", { name: "Robo" })).toHaveAttribute("width", "120");
      unmount();
    }
  });

  test("only a drained Robo lies beside the charger", () => {
    for (const state of STATES) {
      const { container, unmount } = render(<RoomScene look={look(state)} decor={[]} robotSize={120} />);
      expect(container.querySelector('[data-part="charger"]') !== null).toBe(state === "drained");
      unmount();
    }
  });

  test("the decorations stand in the room", () => {
    const { container } = render(<RoomScene look={look("neutral")} decor={["chau-cay"]} robotSize={120} />);
    expect(container.querySelector('[data-decor="chau-cay"]')).not.toBeNull();
    expect(container.querySelectorAll("[data-decor]")).toHaveLength(1);
  });

  test("all 5 decorations together, and ids that are not decorations are left out", () => {
    const { container } = render(
      <RoomScene look={look("happy")} decor={[...DECOR, "kinh-ram", "khong-co"]} robotSize={120} />,
    );
    expect([...container.querySelectorAll("[data-decor]")].map((el) => el.getAttribute("data-decor")).sort()).toEqual(
      [...DECOR].sort(),
    );
  });

  test("no decorations on the beach", () => {
    const { container } = render(<RoomScene look={look("vacation")} decor={DECOR} robotSize={120} />);
    expect(container.querySelector("[data-decor]")).toBeNull();
  });

  test("Robo's words are in a bubble, and a sleepy Robo has flying Z", () => {
    const { container } = render(
      <RoomScene look={look("sleepy")} decor={[]} robotSize={120}>
        <p>Robo nhớ con</p>
      </RoomScene>,
    );
    expect(screen.getByText("Robo nhớ con").closest(".scene-bubble")).not.toBeNull();
    expect(container.querySelectorAll(".scene-z").length).toBeGreaterThan(0);
  });

  test("the robot wears what the look says", () => {
    render(<RoomScene look={look("neutral", { form: 4, graduated: true, equipped: ["vuong-mien"] })} decor={[]} robotSize={168} />);
    const robo = screen.getByRole("img", { name: "Robo" });
    expect(robo).toHaveAttribute("data-form", "4");
    expect(robo.querySelector('[data-accessory="vuong-mien"]')).not.toBeNull();
    expect(robo.querySelector('[data-part="star"]')).not.toBeNull();
  });
});
