// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { SHOP_ITEMS } from "../../game/shop";
import { Robot } from "../Robot";
import { ACCESSORY_ANCHORS, AccessoryArt, ItemIcon } from "./accessories";

const ACCESSORIES = SHOP_ITEMS.filter((item) => item.kind === "accessory").map((item) => item.id);
const DECOR = SHOP_ITEMS.filter((item) => item.kind === "decor").map((item) => item.id);
const FORMS = [1, 2, 3, 4] as const;

const svg = (children: React.ReactNode) => render(<svg>{children}</svg>).container;

describe("AccessoryArt", () => {
  test("draws each of the 10 accessories at each form", () => {
    expect(ACCESSORIES).toHaveLength(10);
    for (const form of FORMS) {
      for (const id of ACCESSORIES) {
        const container = svg(<AccessoryArt id={id} form={form} />);
        expect(container.querySelector(`[data-accessory="${id}"]`)).not.toBeNull();
      }
    }
  });

  test("draws nothing for an unknown id or a decoration", () => {
    expect(svg(<AccessoryArt id="khong-co" form={2} />).querySelector("[data-accessory]")).toBeNull();
    expect(svg(<AccessoryArt id="chau-cay" form={2} />).querySelector("[data-accessory]")).toBeNull();
  });

  test("every form has an anchor for each slot", () => {
    for (const form of FORMS) {
      for (const slot of ["head", "face", "neck"] as const) {
        expect(ACCESSORY_ANCHORS[form][slot].w).toBeGreaterThan(0);
      }
    }
  });
});

describe("Robot with accessories", () => {
  test("wears one accessory in each slot", () => {
    const { container } = render(<Robot form={3} equipped={["vuong-mien", "kinh-tron", "no-buom"]} />);
    for (const id of ["vuong-mien", "kinh-tron", "no-buom"]) {
      expect(container.querySelector(`[data-accessory="${id}"]`)).not.toBeNull();
    }
  });

  test("on vacation the sunglasses of the state replace the face accessory", () => {
    const { container } = render(<Robot mood="vacation" equipped={["kinh-ram", "mu-luoi-trai"]} />);
    expect(container.querySelector('[data-accessory="kinh-ram"]')).toBeNull();
    expect(container.querySelector('[data-accessory="mu-luoi-trai"]')).not.toBeNull();
  });

  test("layers: the cape behind the body, a bow in front, glasses on the face, the head on top", () => {
    const { container } = render(<Robot form={4} equipped={["tai-nghe", "kinh-ram", "ao-choang"]} />);
    const order = (a: Element, b: Element) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING;
    const cape = container.querySelector('[data-accessory="ao-choang"]')!;
    const body = container.querySelector('[data-part="body"]')!;
    const face = container.querySelector('[data-part="face"]')!;
    const glasses = container.querySelector('[data-accessory="kinh-ram"]')!;
    const phones = container.querySelector('[data-accessory="tai-nghe"]')!;
    expect(order(cape, body)).toBeTruthy();
    expect(order(face, glasses)).toBeTruthy();
    expect(order(glasses, phones)).toBeTruthy();
    expect(container.querySelector("svg")!.lastElementChild).toBe(phones);

    const bow = render(<Robot form={2} equipped={["no-buom"]} />).container;
    expect(order(bow.querySelector('[data-part="body"]')!, bow.querySelector('[data-accessory="no-buom"]')!)).toBeTruthy();
  });

  test("ignores ids that are not accessories", () => {
    const { container } = render(<Robot equipped={["chau-cay", "khong-co"]} />);
    expect(container.querySelector("[data-accessory]")).toBeNull();
  });
});

describe("ItemIcon", () => {
  test("a hidden 40 px picture for each accessory", () => {
    for (const id of ACCESSORIES) {
      const { container, unmount } = render(<ItemIcon id={id} />);
      const icon = container.querySelector("svg")!;
      expect(icon).toHaveAttribute("aria-hidden", "true");
      expect(icon).toHaveAttribute("width", "40");
      expect(icon.querySelector(`[data-accessory="${id}"]`)).not.toBeNull();
      unmount();
    }
  });

  test("a hidden 40 px picture for each decoration", () => {
    for (const id of DECOR) {
      const { container, unmount } = render(<ItemIcon id={id} />);
      const icon = container.querySelector("svg")!;
      expect(icon).toHaveAttribute("aria-hidden", "true");
      expect(icon).toHaveAttribute("width", "40");
      expect(icon.querySelector(`[data-decor="${id}"]`)).not.toBeNull();
      unmount();
    }
  });

  test("nothing for an unknown id or a Pin or Vui item", () => {
    expect(render(<ItemIcon id="khong-co" />).container.firstChild).toBeNull();
    expect(render(<ItemIcon id="pin-sac" />).container.firstChild).toBeNull();
  });
});
