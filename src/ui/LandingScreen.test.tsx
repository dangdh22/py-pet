// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { renderWithApp } from "../test/render";
import { LandingScreen } from "./LandingScreen";

describe("LandingScreen with a profile", () => {
  test("shows the title, Robo and the 3 actions as links", () => {
    renderWithApp(<LandingScreen />);
    const main = screen.getByRole("main");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Nuôi Robo bằng Python.");
    expect(within(screen.getByRole("heading", { level: 1 })).getByText("Python").tagName).toBe("MARK");
    expect(within(main).getByRole("img", { name: "Robo" })).toBeInTheDocument();
    expect(within(main).getByRole("link", { name: "Bắt đầu học" })).toHaveAttribute("href", "#/");
    expect(within(main).getByRole("link", { name: "Hướng dẫn" })).toHaveAttribute("href", "huong-dan.html");
    expect(within(main).getByRole("link", { name: "Khu phụ huynh" })).toHaveAttribute("href", "#/parent");
    expect(within(main).queryByRole("button", { name: "Bắt đầu học" })).not.toBeInTheDocument();
  });

  test("the bar has the labelled navigation with the 4 links and the language switch", () => {
    renderWithApp(<LandingScreen />);
    const nav = screen.getByRole("navigation", { name: "Trang giới thiệu" });
    expect(within(nav).getByRole("link", { name: "Py-Pet" })).toHaveAttribute("href", "#/welcome");
    expect(within(nav).getByRole("link", { name: "Trang chủ" })).toHaveAttribute("href", "#/welcome");
    expect(within(nav).getByRole("link", { name: "Trang chủ" })).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("link", { name: "Bài học" })).toHaveAttribute("href", "#/");
    expect(within(nav).getByRole("link", { name: "Hướng dẫn" })).toHaveAttribute("href", "huong-dan.html");
    expect(within(nav).getByRole("link", { name: "Khu phụ huynh" })).toHaveAttribute("href", "#/parent");
    expect(within(nav).getByRole("group", { name: "Ngôn ngữ giao diện" })).toBeInTheDocument();
  });

  test("the hint text does not change the name of a control", () => {
    renderWithApp(<LandingScreen />);
    const main = screen.getByRole("main");
    expect(within(main).getByText("cho con và bố mẹ")).toHaveAttribute("aria-hidden", "true");
    expect(within(main).getByText("cần mã PIN")).toHaveAttribute("aria-hidden", "true");
  });

  test("the code window shows the program and its output, hidden from assistive technology", () => {
    const { container } = renderWithApp(<LandingScreen />);
    const code = container.querySelector(".landing-code");
    expect(code).toHaveAttribute("aria-hidden", "true");
    expect(code).toHaveTextContent("robo.py");
    expect(code?.querySelector("pre")?.textContent).toBe('ten = "Robo"\nprint("Xin chào,", ten)');
    expect(code).toHaveTextContent("Xin chào, Robo");
    expect(screen.getByText("Chào bạn! Mình là Robo.")).toBeInTheDocument();
  });

  test("shows no parent card", () => {
    renderWithApp(<LandingScreen />);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });
});

describe("LandingScreen without a profile", () => {
  test("Start learning and Lessons are buttons that call onStart", async () => {
    const onStart = vi.fn();
    renderWithApp(<LandingScreen onStart={onStart} />);
    const main = screen.getByRole("main");
    const nav = screen.getByRole("navigation", { name: "Trang giới thiệu" });
    expect(within(main).queryByRole("link", { name: "Bắt đầu học" })).not.toBeInTheDocument();
    await userEvent.click(within(main).getByRole("button", { name: "Bắt đầu học" }));
    expect(onStart).toHaveBeenCalledTimes(1);
    await userEvent.click(within(nav).getByRole("button", { name: "Bài học" }));
    expect(onStart).toHaveBeenCalledTimes(2);
  });

  test("the Guide stays a link", () => {
    renderWithApp(<LandingScreen onStart={vi.fn()} />);
    expect(within(screen.getByRole("main")).getByRole("link", { name: "Hướng dẫn" })).toHaveAttribute(
      "href",
      "huong-dan.html",
    );
  });

  test("Parent area opens a card with Start and the guide link", async () => {
    const onStart = vi.fn();
    renderWithApp(<LandingScreen onStart={onStart} />);
    const main = screen.getByRole("main");
    expect(screen.queryByRole("region", { name: "Khu phụ huynh" })).not.toBeInTheDocument();
    expect(within(main).queryByRole("link", { name: "Khu phụ huynh" })).not.toBeInTheDocument();
    const opener = within(main).getByRole("button", { name: "Khu phụ huynh" });
    expect(opener).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(opener);
    expect(opener).toHaveAttribute("aria-expanded", "true");
    const card = screen.getByRole("region", { name: "Khu phụ huynh" });
    expect(card).toHaveTextContent("Khu phụ huynh có sau khi tạo hồ sơ.");
    expect(within(card).getByRole("link", { name: "Đọc phần dành cho bố mẹ" })).toHaveAttribute(
      "href",
      "huong-dan.html#bo-me",
    );
    await userEvent.click(within(card).getByRole("button", { name: "Bắt đầu" }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  test("the Parent area button of the bar opens the same card, and a second press closes it", async () => {
    renderWithApp(<LandingScreen onStart={vi.fn()} />);
    const nav = screen.getByRole("navigation", { name: "Trang giới thiệu" });
    const opener = within(nav).getByRole("button", { name: "Khu phụ huynh" });
    await userEvent.click(opener);
    expect(screen.getAllByRole("region", { name: "Khu phụ huynh" })).toHaveLength(1);
    expect(opener).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(opener);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(opener).toHaveAttribute("aria-expanded", "false");
  });
});

describe("LandingScreen language", () => {
  test("EN switches the text to English", async () => {
    renderWithApp(<LandingScreen />);
    const main = screen.getByRole("main");
    expect(within(main).getByRole("link", { name: "Bắt đầu học" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "EN" }));
    expect(within(main).getByRole("link", { name: "Start learning" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Raise Robo with Python.");
    expect(screen.getByRole("navigation", { name: "Welcome page" })).toBeInTheDocument();
    expect(within(main).getByRole("link", { name: "Parent area" })).toBeInTheDocument();
  });
});
