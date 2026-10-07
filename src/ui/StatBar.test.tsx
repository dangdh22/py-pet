// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { StatBar } from "./StatBar";

describe("StatBar", () => {
  test("a meter of Pin out of 5 that keeps its text", () => {
    render(<StatBar label="Pin" value={3} max={5} tone="pin" />);
    const meter = screen.getByRole("meter", { name: "Pin" });
    expect(meter).toHaveAttribute("aria-valuenow", "3");
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "5");
    expect(meter).toHaveClass("stat-pin");
    expect(screen.getByText("Pin: 3/5")).toBeInTheDocument();
  });

  test("the growth is a percentage", () => {
    render(<StatBar label="Lớn lên" value={79} max={100} tone="growth" />);
    const meter = screen.getByRole("meter", { name: "Lớn lên" });
    expect(meter).toHaveAttribute("aria-valuenow", "79");
    expect(meter).toHaveAttribute("aria-valuemax", "100");
    expect(screen.getByText("Lớn lên: 79%")).toBeInTheDocument();
  });

  test("the bar is filled in proportion, and never beyond its ends", () => {
    const { container } = render(
      <>
        <StatBar label="Vui" value={2} max={5} tone="vui" />
        <StatBar label="Pin" value={7} max={5} tone="pin" />
        <StatBar label="Lớn lên" value={0} max={0} tone="growth" />
      </>,
    );
    const fills = [...container.querySelectorAll<HTMLElement>(".stat-fill")].map((el) => el.style.width);
    expect(fills).toEqual(["40%", "100%", "0%"]);
  });

  test("an empty or nearly empty Pin bar is marked low", () => {
    render(<StatBar label="Pin" value={1} max={5} tone="pin" />);
    expect(screen.getByRole("meter", { name: "Pin" })).toHaveClass("stat-low");
  });
});
