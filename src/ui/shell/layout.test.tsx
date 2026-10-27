// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test } from "vitest";
import { initialGameState } from "../../game/state";
import { MemoryStore } from "../../storage/memoryStore";
import { fakeRunner, okResult, renderWithApp } from "../../test/render";
import { renderWithGame, TODAY } from "../../test/renderGame";
import { PinChip, StreakChip, XuChip } from "./Chips";
import { FocusLayout } from "./FocusLayout";
import { Logo } from "./Logo";
import { RailLayout } from "./RailLayout";
import { RunnerAlert, RunnerStatus } from "./RunnerStatus";
import { SideNav, type RailItem } from "./SideNav";
import { UiLangSwitch } from "./UiLangSwitch";

const NOT_PERSISTENT = "Trình duyệt đang chặn lưu dữ liệu. Tiến độ sẽ không được lưu.";

describe("RunnerStatus and RunnerAlert", () => {
  test("shows the runner status", () => {
    renderWithApp(<RunnerStatus />, { runner: fakeRunner(() => okResult(""), "loading") });
    expect(screen.getByText("Robo đang khởi động...")).toBeInTheDocument();
  });

  test("a runner that failed gets a Robo panel with retry and reload advice instead of the small text", async () => {
    const runner = fakeRunner(() => okResult(""), "failed");
    const { container } = renderWithApp(
      <>
        <RunnerStatus />
        <RunnerAlert />
      </>,
      { runner },
    );
    const panel = screen.getByRole("alert");
    // `.runner-failed` is the panel's style: the status line must not add an empty box with it.
    expect(container.querySelectorAll(".runner-failed")).toHaveLength(1);
    expect(within(panel).getByRole("img", { name: "Robo" })).toHaveAttribute("data-mood", "sad");
    expect(within(panel).getByText("Robo chưa khởi động được")).toBeInTheDocument();
    expect(within(panel).getByText("Nếu vẫn lỗi, con tải lại trang nhé.")).toBeInTheDocument();
    expect(screen.queryByText("Robo đang khởi động...")).not.toBeInTheDocument();
    expect(screen.queryByText("Robo sẵn sàng")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Thử lại" })).toHaveLength(1);
    await userEvent.click(within(panel).getByRole("button", { name: "Thử lại" }));
    expect(runner.retry).toHaveBeenCalledOnce();
  });

  test("shows no panel while loading or ready", () => {
    for (const status of ["loading", "ready"] as const) {
      const { unmount } = renderWithApp(<RunnerAlert />, { runner: fakeRunner(() => okResult(""), status) });
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      unmount();
    }
  });

  test("the panel follows the interface language", () => {
    renderWithApp(<RunnerAlert />, { runner: fakeRunner(() => okResult(""), "failed"), lang: "en" });
    expect(screen.getByText("Robo could not start")).toBeInTheDocument();
  });
});

describe("UiLangSwitch", () => {
  test("switches the interface language", async () => {
    renderWithApp(
      <>
        <RunnerStatus />
        <UiLangSwitch />
      </>,
    );
    expect(screen.getByText("Robo sẵn sàng")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Ngôn ngữ giao diện" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "VI" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(screen.getByRole("button", { name: "EN" }));
    expect(screen.getByText("Robo is ready")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "EN" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "VI" })).toHaveAttribute("aria-pressed", "false");
  });
});

describe("Chips", () => {
  test("the streak chip shows the displayed streak and the coin chip the coins", async () => {
    const state = initialGameState(TODAY);
    state.streak = { current: 6, best: 6, freezes: 0, lastAchievedDay: TODAY, pointsDay: TODAY, points: 3 };
    state.wallet.xu = 120;
    await renderWithGame(
      <>
        <StreakChip />
        <XuChip />
      </>,
      { state },
    );
    expect(screen.getByText("Chuỗi: 6 ngày")).toBeInTheDocument();
    expect(screen.getByText("Xu: 120")).toBeInTheDocument();
  });

  test("the battery chip has the battery icon, like the streak and coin chips have theirs", async () => {
    const { container } = await renderWithGame(
      <>
        <StreakChip />
        <XuChip />
        <PinChip />
      </>,
    );
    for (const chip of container.querySelectorAll(".chip")) {
      expect(chip.querySelector("svg[aria-hidden='true']")).not.toBeNull();
    }
    expect(container.querySelectorAll(".chip")).toHaveLength(3);
    expect(screen.getByText("Pin: 4/5")).toHaveClass("chip-pin");
  });
});

describe("Logo", () => {
  test("is a link to the landing page, named by the app name", () => {
    renderWithApp(<Logo />);
    expect(screen.getByRole("link", { name: "Py-Pet" })).toHaveAttribute("href", "#/welcome");
  });

  test("renders plain text, with the same look, when it is not a link", () => {
    const { container } = renderWithApp(<Logo link={false} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Py-Pet")).toBeInTheDocument();
    expect(container.querySelector(".logo")).not.toBeNull();
  });
});

describe("SideNav", () => {
  const LINKS = [
    ["Py-Pet", "#/welcome"],
    ["Phòng Robo", "#/"],
    ["Bản đồ học", "#/map"],
    ["Cửa hàng", "#/shop"],
    ["Sổ thành tích", "#/achievements"],
    ["Sao lưu", "#/backup"],
    ["Hướng dẫn", "huong-dan.html"],
    ["Khu phụ huynh", "#/parent"],
  ] as const;

  test("is a labelled navigation whose links go to the right places, in order", () => {
    renderWithApp(<SideNav current="map" />);
    const nav = screen.getByRole("navigation", { name: "Menu chính" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(LINKS.map(([, href]) => href));
    for (const [name, href] of LINKS) {
      expect(within(nav).getByRole("link", { name })).toHaveAttribute("href", href);
    }
  });

  test("marks only the link of the current page", () => {
    renderWithApp(<SideNav current="map" />);
    const nav = screen.getByRole("navigation", { name: "Menu chính" });
    const current = within(nav)
      .getAllByRole("link")
      .filter((link) => link.hasAttribute("aria-current"));
    expect(current).toEqual([within(nav).getByRole("link", { name: "Bản đồ học" })]);
    expect(current[0]).toHaveAttribute("aria-current", "page");
  });

  test("marks each of the 6 items when it is the current page, and none for null", () => {
    const names: Record<RailItem, string> = {
      room: "Phòng Robo",
      map: "Bản đồ học",
      shop: "Cửa hàng",
      achievements: "Sổ thành tích",
      backup: "Sao lưu",
      parent: "Khu phụ huynh",
    };
    for (const [item, name] of Object.entries(names) as [RailItem, string][]) {
      const { container, unmount } = renderWithApp(<SideNav current={item} />);
      expect(screen.getByRole("link", { name })).toHaveAttribute("aria-current", "page");
      expect(container.querySelectorAll("[aria-current]")).toHaveLength(1);
      unmount();
    }
    const { container } = renderWithApp(<SideNav current={null} />);
    expect(container.querySelectorAll("[aria-current]")).toHaveLength(0);
  });

  test("shows the Python status and the interface language switch at the bottom", () => {
    renderWithApp(<SideNav current="room" />);
    expect(screen.getByText("Robo sẵn sàng")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Ngôn ngữ giao diện" })).toBeInTheDocument();
  });

  test("follows the interface language", () => {
    renderWithApp(<SideNav current="room" />, { lang: "en" });
    expect(screen.getByRole("navigation", { name: "Main menu" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Robo's room" })).toHaveAttribute("href", "#/");
    expect(screen.getByRole("link", { name: "Guide" })).toHaveAttribute("href", "huong-dan.html");
  });
});

describe("RailLayout", () => {
  test("puts the nav, the banners and the page in the rail layout", async () => {
    const { container } = await renderWithGame(
      <RailLayout nav={<SideNav current="room" />}>
        <p>page</p>
      </RailLayout>,
      { store: new MemoryStore({ persistent: false }) },
    );
    const layout = container.querySelector(".rail-layout");
    expect(layout).toHaveAttribute("data-mode", "child");
    const main = container.querySelector<HTMLElement>(".rail-main");
    expect(main).not.toBeNull();
    expect(within(main as HTMLElement).getByRole("alert")).toHaveTextContent(NOT_PERSISTENT);
    expect(within(main as HTMLElement).getByText("page")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Menu chính" }).parentElement).toBe(layout);
  });

  describe("skip link", () => {
    beforeEach(() => {
      window.location.hash = "";
    });

    function renderRail(lang?: "en") {
      return renderWithGame(
        <RailLayout nav={<SideNav current="room" />}>
          <p>page</p>
        </RailLayout>,
        { lang },
      );
    }

    test("is the first link and the first stop of the keyboard, before the menu", async () => {
      await renderRail();
      const skip = screen.getByRole("link", { name: "Bỏ qua menu" });
      expect(screen.getAllByRole("link")[0]).toBe(skip);
      await userEvent.tab();
      expect(skip).toHaveFocus();
    });

    test("moves the focus to the main column and keeps the route", async () => {
      window.location.hash = "#/shop";
      const { container } = await renderRail();
      const main = container.querySelector<HTMLElement>(".rail-main");
      expect(main).toHaveAttribute("id", "main-content");
      expect(main).toHaveAttribute("tabindex", "-1");
      await userEvent.click(screen.getByRole("link", { name: "Bỏ qua menu" }));
      expect(main).toHaveFocus();
      expect(window.location.hash).toBe("#/shop");
    });

    test("works with the keyboard: Tab, then Enter", async () => {
      window.location.hash = "#/map";
      const { container } = await renderRail();
      await userEvent.tab();
      await userEvent.keyboard("{Enter}");
      expect(container.querySelector(".rail-main")).toHaveFocus();
      expect(window.location.hash).toBe("#/map");
    });

    test("follows the interface language", async () => {
      await renderRail("en");
      expect(screen.getByRole("link", { name: "Skip the menu" })).toBeInTheDocument();
    });
  });

  test("takes the parent mode", async () => {
    const { container } = await renderWithGame(
      <RailLayout nav={<nav aria-label="parent" />} mode="parent">
        <p>page</p>
      </RailLayout>,
    );
    expect(container.querySelector(".rail-layout")).toHaveAttribute("data-mode", "parent");
  });

  test("shows the Robo panel when Python could not start", async () => {
    await renderWithGame(
      <RailLayout nav={<SideNav current="room" />}>
        <p>page</p>
      </RailLayout>,
      { runner: fakeRunner(() => okResult(""), "failed") },
    );
    expect(screen.getByText("Robo chưa khởi động được")).toBeInTheDocument();
  });
});

describe("FocusLayout", () => {
  test("has a bar with the way back, the Python status and the battery and coin chips, and no side menu", async () => {
    await renderWithGame(
      <FocusLayout>
        <p>lesson</p>
      </FocusLayout>,
    );
    expect(screen.getByRole("link", { name: "Về phòng" })).toHaveAttribute("href", "#/");
    expect(screen.getByText("Robo sẵn sàng")).toBeInTheDocument();
    expect(screen.getByText("Pin: 4/5")).toBeInTheDocument();
    expect(screen.getByText("Xu: 0")).toBeInTheDocument();
    expect(screen.getByText("lesson")).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Menu chính" })).not.toBeInTheDocument();
  });

  test("shows the banners and the Robo panel under the bar", async () => {
    await renderWithGame(
      <FocusLayout>
        <p>lesson</p>
      </FocusLayout>,
      { store: new MemoryStore({ persistent: false }), runner: fakeRunner(() => okResult(""), "failed") },
    );
    expect(screen.getAllByRole("alert")).toHaveLength(2);
    expect(screen.getByText(NOT_PERSISTENT)).toBeInTheDocument();
    expect(screen.getByText("Robo chưa khởi động được")).toBeInTheDocument();
  });
});
