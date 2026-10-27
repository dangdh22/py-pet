// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Icon, type IconName } from "./icons";

const ICON_NAMES: IconName[] = [
  "home",
  "map",
  "shop",
  "trophy",
  "save",
  "help",
  "lock",
  "back",
  "next",
  "play",
  "check",
  "chart",
  "alert",
  "list",
  "gift",
  "sliders",
  "flame",
  "coin",
];

describe("Icon", () => {
  test.each(ICON_NAMES)("%s is a decorative svg with 1 non-empty path", (name) => {
    const { container } = render(<Icon name={name} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("data-icon", name);
    expect(svg).toHaveAttribute("viewBox", "0 0 18 18");
    expect(svg).toHaveClass("icon");
    const paths = container.querySelectorAll("path");
    expect(paths).toHaveLength(1);
    expect(paths[0]?.getAttribute("d")).toBeTruthy();
  });

  test("only the flame and the coin are solid", () => {
    const solid = ICON_NAMES.filter((name) => {
      const { container, unmount } = render(<Icon name={name} />);
      const isSolid = container.querySelector("svg")?.classList.contains("icon-solid") === true;
      unmount();
      return isSolid;
    });
    expect(solid).toEqual(["flame", "coin"]);
  });

  test("takes a size and an extra class", () => {
    const { container } = render(<Icon name="home" size={24} className="extra" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");
    expect(svg).toHaveClass("icon", "extra");
  });

  test("is 18 px by default", () => {
    const { container } = render(<Icon name="home" />);
    expect(container.querySelector("svg")).toHaveAttribute("width", "18");
  });
});
