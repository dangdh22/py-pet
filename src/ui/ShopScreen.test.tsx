// @vitest-environment jsdom
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { BADGES } from "../game/badges";
import { SHOP_ITEMS } from "../game/shop";
import { initialGameState } from "../game/state";
import { vi } from "../i18n/vi";
import { FIXED_NOW, renderWithGame, TODAY } from "../test/renderGame";
import { badgeKey, formKey, FORM_COUNT, itemKey } from "./names";
import { ShopScreen } from "./ShopScreen";

function richState(xu: number) {
  const state = initialGameState(TODAY);
  state.wallet.xu = xu;
  state.pet.pin = 2;
  return state;
}

const row = (name: string) => screen.getByText(name).closest("li") as HTMLElement;

describe("names", () => {
  test("every shop item, badge and robot form has a message", () => {
    for (const item of SHOP_ITEMS) expect(vi).toHaveProperty([itemKey(item.id)]);
    for (const badge of BADGES) expect(vi).toHaveProperty([badgeKey(badge)]);
    for (let stage = 1; stage <= FORM_COUNT; stage += 1) expect(vi).toHaveProperty([formKey(stage)]);
  });
});

describe("ShopScreen: things for the robot", () => {
  test("buys and uses a Pin item", async () => {
    const { store } = await renderWithGame(<ShopScreen />, { state: richState(100) });
    expect(screen.getByText("Con có 100 xu")).toBeInTheDocument();
    const charger = row("Pin sạc nhanh");
    expect(within(charger).getByText("30 xu")).toBeInTheDocument();
    expect(within(charger).getByRole("button", { name: "Dùng Pin sạc nhanh" })).toBeDisabled();
    await userEvent.click(within(charger).getByRole("button", { name: "Mua Pin sạc nhanh" }));
    expect(screen.getByText("Con có 70 xu")).toBeInTheDocument();
    expect(within(charger).getByText("Có 1")).toBeInTheDocument();
    await userEvent.click(within(charger).getByRole("button", { name: "Dùng Pin sạc nhanh" }));
    await waitFor(async () => expect((await store.loadActive())!.state.pet.pin).toBe(4));
  });

  test("buys an accessory, wears it and takes it off; a gift shows how to get it", async () => {
    const { store } = await renderWithGame(<ShopScreen />, { state: richState(100) });
    await userEvent.click(screen.getByRole("button", { name: "Mua Kính râm" }));
    await userEvent.click(screen.getByRole("button", { name: "Đeo Kính râm" }));
    await waitFor(async () => expect((await store.loadActive())!.state.inventory.equipped).toEqual(["kinh-ram"]));
    await userEvent.click(screen.getByRole("button", { name: "Tháo Kính râm" }));
    expect(screen.getByRole("button", { name: "Đeo Kính râm" })).toBeInTheDocument();
    expect(within(row("Vương miện")).getByText("Quà khi giữ chuỗi 30 ngày")).toBeInTheDocument();
    expect(within(row("Vương miện")).queryByRole("button")).not.toBeInTheDocument();
  });

  test("each accessory has a picture beside its name", async () => {
    await renderWithGame(<ShopScreen />, { state: richState(100) });
    for (const item of SHOP_ITEMS.filter((i) => i.kind === "accessory")) {
      const icons = row(vi[itemKey(item.id)]).querySelectorAll("svg");
      expect(icons).toHaveLength(1);
      expect(icons[0]).toHaveAttribute("aria-hidden", "true");
    }
  });

  test("an item costing more than the balance cannot be bought", async () => {
    await renderWithGame(<ShopScreen />, { state: richState(20) });
    expect(screen.getByRole("button", { name: "Mua Kệ sách" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Mua Dầu nhớt" })).toBeEnabled();
    expect(within(row("Kệ sách")).getByText("Chưa đủ xu")).toBeInTheDocument();
  });

  test("xu held for a pending reward cannot be spent here", async () => {
    const state = richState(100);
    state.rewards.requests = [
      { id: "q0", rewardId: "park", name: "Đi công viên", price: 100, at: FIXED_NOW.toISOString(), status: "pending", decidedAt: null },
    ];
    await renderWithGame(<ShopScreen />, { state });
    expect(screen.getByRole("button", { name: "Mua Kệ sách" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Mua Dầu nhớt" })).toBeDisabled();
    expect(within(row("Dầu nhớt")).getByText("Xu đang được giữ cho phần thưởng chờ duyệt")).toBeInTheDocument();
  });

  test("a disabled button says why", async () => {
    const state = richState(100);
    state.pet.pin = 5;
    state.inventory.consumables = { "pin-sac": 9 };
    await renderWithGame(<ShopScreen />, { state });
    const charger = row("Pin sạc nhanh");
    expect(within(charger).getByText("Đã có đủ 9 món")).toBeInTheDocument();
    expect(within(charger).getByText("Pin đã đầy")).toBeInTheDocument();
    expect(within(row("Quả bóng")).getByText("Chưa có món này")).toBeInTheDocument();
  });
});

describe("ShopScreen: rewards from the parents", () => {
  test("no reward yet", async () => {
    await renderWithGame(<ShopScreen />);
    await userEvent.click(screen.getByRole("tab", { name: "Phần thưởng từ bố mẹ" }));
    expect(screen.getByText("Bố mẹ chưa đặt phần thưởng nào.")).toBeInTheDocument();
  });

  test("asks for a reward; the request waits for the parents", async () => {
    const state = richState(120);
    state.rewards.catalog = [
      { id: "park", name: "Đi công viên", price: 100, weeklyLimit: 1 },
      { id: "tv", name: "Xem phim", price: 200, weeklyLimit: 2 },
    ];
    const { store } = await renderWithGame(<ShopScreen newId={() => "q1"} />, { state });
    await userEvent.click(screen.getByRole("tab", { name: "Phần thưởng từ bố mẹ" }));
    expect(within(row("Xem phim")).getByText("Chưa đủ xu")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Đổi Đi công viên" }));
    expect(screen.getByRole("status")).toHaveTextContent("Đã gửi yêu cầu. Bố mẹ sẽ duyệt bằng mã PIN.");
    expect(screen.getByRole("heading", { name: "Chờ bố mẹ duyệt" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Đổi Đi công viên" })).toBeDisabled();
    await waitFor(async () =>
      expect((await store.loadActive())!.state.rewards.requests).toMatchObject([{ id: "q1", status: "pending" }]),
    );
    expect((await store.loadActive())!.state.wallet.xu).toBe(120);
  });

  test("a reward with no turns left this week says so", async () => {
    const state = richState(120);
    state.rewards.catalog = [{ id: "park", name: "Đi công viên", price: 100, weeklyLimit: 1 }];
    state.rewards.requests = [
      {
        id: "q0",
        rewardId: "park",
        name: "Đi công viên",
        price: 100,
        at: FIXED_NOW.toISOString(),
        status: "approved",
        decidedAt: FIXED_NOW.toISOString(),
      },
    ];
    await renderWithGame(<ShopScreen />, { state });
    await userEvent.click(screen.getByRole("tab", { name: "Phần thưởng từ bố mẹ" }));
    expect(within(row("Đi công viên")).getByText("Hết lượt tuần này")).toBeInTheDocument();
  });

  test("a pending request holds back its price", async () => {
    const state = richState(120);
    state.rewards.catalog = [{ id: "ice", name: "Kem", price: 30, weeklyLimit: 5 }];
    state.rewards.requests = [
      {
        id: "q0",
        rewardId: "ice",
        name: "Kem",
        price: 30,
        at: FIXED_NOW.toISOString(),
        status: "pending",
        decidedAt: null,
      },
    ];
    await renderWithGame(<ShopScreen />, { state });
    await userEvent.click(screen.getByRole("tab", { name: "Phần thưởng từ bố mẹ" }));
    expect(screen.getByText("Xu chưa bị giữ: 90")).toBeInTheDocument();
  });
});
