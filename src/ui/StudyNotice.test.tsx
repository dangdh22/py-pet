// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { renderWithApp } from "../test/render";
import { StudyNotice } from "./StudyNotice";

describe("StudyNotice", () => {
  test("the message is the h1 of the page, in the card, with the children below it", () => {
    renderWithApp(
      <StudyNotice message="Không tìm thấy bài này.">
        <a href="#/map">Về bản đồ</a>
      </StudyNotice>,
    );
    const headings = screen.getAllByRole("heading");
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveProperty("tagName", "H1");
    expect(headings[0]).toHaveAccessibleName("Không tìm thấy bài này.");
    const link = screen.getByRole("link", { name: "Về bản đồ" });
    expect(headings[0]!.closest(".card")).toContainElement(link);
    expect(headings[0]!.compareDocumentPosition(link)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});
