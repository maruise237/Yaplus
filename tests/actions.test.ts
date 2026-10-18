import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { closeList, createProduct, createShop, setBought, toggleProduct } from "../src/lib/actions";
import { db } from "../src/lib/db";
import { saveSession } from "../src/lib/session";

const OWNER = "00000000-0000-0000-0000-000000000001";

beforeEach(async () => {
  await db.delete();
  await db.open();
  await saveSession({ userId: OWNER, displayName: "Jules", phone: null, mode: "local" });
});

async function setup() {
  const shop = await createShop("Boutique Akwa", "telephonie");
  const categories = await db.categories.where("shop_id").equals(shop.id).sortBy("position");
  return { shop, afficheurs: categories[0] };
}

describe("cycle signaler → acheter → clôturer", () => {
  it("un tap signale, un autre remet en stock, et tout passe par l'outbox", async () => {
    const { shop, afficheurs } = await setup();
    const kg5 = await createProduct(shop.id, afficheurs.id, "KG5", { flag: false });
    expect(kg5.status).toBe("in_stock");

    expect((await toggleProduct(kg5.id)).status).toBe("to_buy");
    expect((await db.products.get(kg5.id))!.flagged_by).toBe(OWNER);
    expect((await toggleProduct(kg5.id)).status).toBe("in_stock");

    const events = await db.product_events.where("product_id").equals(kg5.id).toArray();
    expect(events.map((e) => e.type).sort()).toEqual(["created", "flagged", "restocked"]);

    const outboxTables = (await db.outbox.toArray()).map((e) => e.table);
    expect(outboxTables[0]).toBe("shops");
    expect(outboxTables[1]).toBe("shop_members");
    expect(outboxTables.filter((t) => t === "product_events")).toHaveLength(3);
  });

  it("la clôture fige la liste et marque les oubliés", async () => {
    const { shop, afficheurs } = await setup();
    const kg5 = await createProduct(shop.id, afficheurs.id, "KG5");
    const a100 = await createProduct(shop.id, afficheurs.id, "Itel A100");
    await createProduct(shop.id, afficheurs.id, "Tecno Spark", { flag: false });

    await setBought(kg5.id, true);
    const closure = await closeList(shop.id, "237699001122");
    expect(closure).not.toBeNull();

    const items = await db.closure_items.where("closure_id").equals(closure!.id).toArray();
    expect(items).toHaveLength(2);
    expect(items.find((i) => i.product_name === "KG5")).toMatchObject({ bought: true, category_name: "Afficheurs" });
    expect(items.find((i) => i.product_name === "Itel A100")).toMatchObject({ bought: false });

    expect(await db.products.get(kg5.id)).toMatchObject({ status: "in_stock", forgotten_count: 0 });
    expect(await db.products.get(a100.id)).toMatchObject({ status: "to_buy", forgotten_count: 1 });

    // Rien à clôturer → pas de clôture vide
    await setBought(a100.id, true);
    await closeList(shop.id);
    expect(await closeList(shop.id)).toBeNull();
  });

  it("seul le patron clôture", async () => {
    const { shop, afficheurs } = await setup();
    await createProduct(shop.id, afficheurs.id, "KG5");
    await saveSession({ userId: "00000000-0000-0000-0000-000000000002", displayName: "Paul", phone: null, mode: "local" });
    await expect(closeList(shop.id)).rejects.toThrow("owner_only");
  });
});
