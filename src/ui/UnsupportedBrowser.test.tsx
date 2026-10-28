// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { UnsupportedBrowser } from "./UnsupportedBrowser";

describe("UnsupportedBrowser", () => {
  test("shows a drained Robo, a title and Chrome or Edge advice in Vietnamese without any provider", () => {
    render(<UnsupportedBrowser lang="vi" />);
    expect(screen.getByRole("img", { name: "Robo" })).toHaveAttribute("data-mood", "drained");
    expect(screen.getByRole("img", { name: "Robo" })).toHaveAttribute("data-form", "1");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Trình duyệt này chưa chạy được Py-Pet");
    expect(screen.getByText(/Chrome hoặc Edge/)).toBeInTheDocument();
  });

  test("the page keeps its main landmark, and the alert inside it holds the heading", () => {
    render(<UnsupportedBrowser lang="vi" />);
    const main = screen.getByRole("main");
    expect(main).not.toHaveAttribute("role");
    const alert = within(main).getByRole("alert");
    expect(within(alert).getByRole("heading", { level: 1, name: "Trình duyệt này chưa chạy được Py-Pet" })).toBeInTheDocument();
  });

  test("speaks English for an English browser", () => {
    render(<UnsupportedBrowser lang="en" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("This browser cannot run Py-Pet");
    expect(screen.getByText(/Chrome or Edge/)).toBeInTheDocument();
  });
});
