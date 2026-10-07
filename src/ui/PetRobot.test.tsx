// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { initialGameState } from "../game/state";
import { renderWithGame, TODAY } from "../test/renderGame";
import { PetRobot } from "./PetRobot";

describe("PetRobot", () => {
  test("is the child's robot: its form and what it wears", async () => {
    const state = initialGameState(TODAY);
    state.pet.stage = 3;
    state.inventory = { consumables: {}, owned: ["vuong-mien"], equipped: ["vuong-mien"] };
    const { container } = await renderWithGame(<PetRobot size={96} />, { state });
    const robot = screen.getByRole("img", { name: "Robo" });
    expect(robot).toHaveAttribute("data-form", "3");
    expect(robot).toHaveAttribute("data-size", "96");
    expect(container.querySelector('[data-accessory="vuong-mien"]')).not.toBeNull();
  });

  test("shows the state of the room unless the screen asks for a mood", async () => {
    const state = initialGameState(TODAY);
    state.pet.pin = 0;
    await renderWithGame(
      <>
        <PetRobot />
        <PetRobot mood="thinking" />
      </>,
      { state },
    );
    expect(screen.getAllByRole("img", { name: "Robo" }).map((el) => el.getAttribute("data-mood"))).toEqual([
      "drained",
      "thinking",
    ]);
  });

  test("a graduate keeps the teen form with a star", async () => {
    const state = initialGameState(TODAY);
    state.pet.stage = 5;
    const { container } = await renderWithGame(<PetRobot />, { state });
    expect(screen.getByRole("img", { name: "Robo" })).toHaveAttribute("data-form", "4");
    expect(container.querySelector('[data-part="star"]')).not.toBeNull();
  });

  test("outside a game it is the capsule", () => {
    render(<PetRobot mood="happy" />);
    expect(screen.getByRole("img", { name: "Robo" })).toHaveAttribute("data-form", "1");
  });
});
