/** The robot shop (spec 5.12): Pin and Vui items to use, accessories to wear, decorations for the room. */
export type ShopKind = "pin" | "vui" | "accessory" | "decor";
export type AccessorySlot = "head" | "face" | "neck";

export interface ShopItem {
  id: string;
  kind: ShopKind;
  /** null: not sold, only given as a streak gift. */
  price: number | null;
  /** Pin or Vui added when used. */
  effect?: number;
  slot?: AccessorySlot;
}

/** Prices are a first guess (spec 13.7: about 40 to 60 xu a day); the parent area shows the real daily average. */
export const SHOP_ITEMS: readonly ShopItem[] = [
  { id: "dau-nhot", kind: "pin", price: 15, effect: 1 },
  { id: "pin-sac", kind: "pin", price: 30, effect: 2 },
  { id: "bong", kind: "vui", price: 15, effect: 1 },
  { id: "no-buom", kind: "accessory", price: 40, slot: "neck" },
  { id: "khan-quang", kind: "accessory", price: 60, slot: "neck" },
  { id: "kinh-ram", kind: "accessory", price: 60, slot: "face" },
  { id: "kinh-tron", kind: "accessory", price: 80, slot: "face" },
  { id: "mu-luoi-trai", kind: "accessory", price: 80, slot: "head" },
  { id: "tai-nghe", kind: "accessory", price: 120, slot: "head" },
  { id: "ghim-sao", kind: "accessory", price: null, slot: "neck" },
  { id: "ang-ten-vang", kind: "accessory", price: null, slot: "head" },
  { id: "ao-choang", kind: "accessory", price: null, slot: "neck" },
  { id: "vuong-mien", kind: "accessory", price: null, slot: "head" },
  { id: "chau-cay", kind: "decor", price: 40 },
  { id: "den-ngu", kind: "decor", price: 50 },
  { id: "tranh", kind: "decor", price: 60 },
  { id: "tham", kind: "decor", price: 70 },
  { id: "ke-sach", kind: "decor", price: 90 },
];

/** Streak length -> the accessory given with the streak bonus (spec 5.5: "kèm phụ kiện"). */
export const STREAK_GIFTS: Readonly<Record<number, string>> = {
  3: "ghim-sao",
  7: "ang-ten-vang",
  14: "ao-choang",
  30: "vuong-mien",
};

/** Unused Pin and Vui items kept of each kind. */
export const MAX_CONSUMABLES = 9;

export function findShopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((item) => item.id === id);
}

export function isConsumable(item: ShopItem): item is ShopItem & { kind: "pin" | "vui" } {
  return item.kind === "pin" || item.kind === "vui";
}
