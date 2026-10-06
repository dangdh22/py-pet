// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

test("jsdom and jest-dom matchers work", () => {
  render(<p>Xin chào</p>);
  expect(screen.getByText("Xin chào")).toBeInTheDocument();
});
