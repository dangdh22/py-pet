// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { UnsupportedBrowser } from "./UnsupportedBrowser";

describe("UnsupportedBrowser", () => {
  test("shows a sad Robo, a title and Chrome or Edge advice in Vietnamese without any provider", () => {
    render(<UnsupportedBrowser lang="vi" />);
    expect(screen.getByRole("img", { name: "Robo" })).toHaveAttribute("data-mood", "sad");
    expect(screen.getByRole("img", { name: "Robo" })).toHaveAttribute("data-form", "1");
    expect(screen.getByRole("heading")).toHaveTextContent("Trình duyệt này chưa chạy được Py-Pet");
    expect(screen.getByText(/Chrome hoặc Edge/)).toBeInTheDocument();
  });

  test("speaks English for an English browser", () => {
    render(<UnsupportedBrowser lang="en" />);
    expect(screen.getByRole("heading")).toHaveTextContent("This browser cannot run Py-Pet");
    expect(screen.getByText(/Chrome or Edge/)).toBeInTheDocument();
  });
});
