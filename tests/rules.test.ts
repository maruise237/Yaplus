import { describe, expect, it } from "vitest";
import { checkWrite, upsertStatement, type Roles } from "../src/server/rules";

const ME = "u-me";
const SHOP = "s-1";
const now = "2026-10-18T10:00:00.000Z";
const owner: Roles = new Map([[SHOP, "owner"]]);
const employee: Roles = new Map([[SHOP, "employee"]]);
const stranger: Roles = new Map();

describe("droits d'écriture par boutique", () => {
  it("chacun peut créer sa boutique, pas celle d'un autre", () => {
    expect(checkWrite("shops", { id: "s-new", owner_id: ME, updated_at: now }, null, ME, stranger)).toBeNull();
    expect(checkWrite("shops", { id: "s-new", owner_id: "u-other", updated_at: now }, null, ME, stranger)).toBe("forbidden");
  });

  it("un employé tient le cahier, un inconnu non", () => {
    const product = { id: "p-1", shop_id: SHOP, updated_at: now };
    expect(checkWrite("products", product, null, ME, employee)).toBeNull();
    expect(checkWrite("products", product, null, ME, stranger)).toBe("forbidden");
  });

  it("une ligne ne peut pas changer de boutique", () => {
    const moved = { id: "p-1", shop_id: SHOP, updated_at: now };
    expect(checkWrite("products", moved, { id: "p-1", shop_id: "s-other" }, ME, owner)).toBe("forbidden");
  });

  it("seul le patron clôture et gère l'équipe", () => {
    const closure = { id: "c-1", shop_id: SHOP, closed_by: ME, updated_at: now };
    expect(checkWrite("closures", closure, null, ME, owner)).toBeNull();
    expect(checkWrite("closures", closure, null, ME, employee)).toBe("forbidden");
    const member = { shop_id: SHOP, user_id: "u-x", role: "employee", removed_at: now, updated_at: now };
    expect(checkWrite("shop_members", member, { ...member, removed_at: null }, ME, owner)).toBeNull();
    expect(checkWrite("shop_members", member, { ...member, removed_at: null }, ME, employee)).toBe("forbidden");
  });

  it("un employé renomme sa ligne mais ne se promeut pas", () => {
    const mine = { shop_id: SHOP, user_id: ME, role: "employee", display_name: "Paul", removed_at: null, updated_at: now };
    expect(checkWrite("shop_members", { ...mine, display_name: "Paulo" }, mine, ME, employee)).toBeNull();
    expect(checkWrite("shop_members", { ...mine, role: "owner" }, mine, ME, employee)).toBe("forbidden");
  });

  it("le journal s'écrit en son propre nom", () => {
    const ev = { id: "e-1", shop_id: SHOP, product_id: "p-1", user_id: "u-other", updated_at: now };
    expect(checkWrite("product_events", ev, null, ME, employee)).toBe("forbidden");
    expect(checkWrite("product_events", { ...ev, user_id: ME }, null, ME, employee)).toBeNull();
  });
});

describe("requête d'écriture", () => {
  it("ignore les colonnes inconnues et n'écrase jamais le journal", () => {
    const { text, params } = upsertStatement("product_events", { id: "e", shop_id: SHOP, evil: "x", updated_at: now });
    expect(text).not.toContain("evil");
    expect(text).toContain("do nothing");
    expect(params).toEqual(["e", SHOP, now]);
  });
});
