import {
  db,
  type Category,
  type Closure,
  type ClosureItem,
  type Product,
  type ProductEvent,
  type Shop,
  type ShopMember,
  type SyncedTable,
} from "./db";
import { requireSession, setCurrentShopId } from "./session";
import { normalizeName } from "./text";

// Toute écriture passe par ici : on écrit d'abord sur l'appareil, puis on met
// l'action dans l'outbox. La synchro l'enverra dès que le réseau est là.

const listeners = new Set<() => void>();
export function onLocalChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function notify() {
  listeners.forEach((fn) => fn());
}

const now = () => new Date().toISOString();
const uuid = () => crypto.randomUUID();

const WRITE_TABLES = [
  db.shops,
  db.shop_members,
  db.categories,
  db.products,
  db.product_events,
  db.closures,
  db.closure_items,
  db.outbox,
];

async function write<T>(fn: (put: (table: SyncedTable, row: object) => Promise<void>) => Promise<T>): Promise<T> {
  const result = await db.transaction("rw", WRITE_TABLES, async () => {
    const put = async (table: SyncedTable, row: object) => {
      await db.table(table).put(row);
      await db.outbox.add({ table, row: { ...row }, created_at: now(), attempts: 0 });
    };
    return fn(put);
  });
  notify();
  return result;
}

function event(product: Product, type: ProductEvent["type"], userId: string): ProductEvent {
  const at = now();
  return { id: uuid(), product_id: product.id, shop_id: product.shop_id, type, user_id: userId, at, updated_at: at };
}

async function getProduct(id: string): Promise<Product> {
  const product = await db.products.get(id);
  if (!product) throw new Error("product_not_found");
  return product;
}

export async function getMyRole(shopId: string): Promise<ShopMember["role"] | undefined> {
  const session = await requireSession();
  const member = await db.shop_members.get([shopId, session.userId]);
  return member && !member.removed_at ? member.role : undefined;
}

async function requireOwner(shopId: string) {
  if ((await getMyRole(shopId)) !== "owner") throw new Error("owner_only");
}

// ---------------------------------------------------------------------------
// Boutiques et équipe
// ---------------------------------------------------------------------------

export const SHOP_TEMPLATES: Record<string, string[]> = {
  telephonie: ["Afficheurs", "Batteries", "Chargeurs", "Accessoires", "Pochettes", "Pièces"],
  alimentation: ["Céréales", "Boissons", "Conserves", "Hygiène", "Huiles", "Divers"],
  quincaillerie: ["Électricité", "Plomberie", "Visserie", "Peinture", "Outillage", "Divers"],
  vide: [],
};

export async function createShop(name: string, template: keyof typeof SHOP_TEMPLATES = "vide"): Promise<Shop> {
  const session = await requireSession();
  const shop = await write(async (put) => {
    const t = now();
    const shop: Shop = { id: uuid(), owner_id: session.userId, name: name.trim(), created_at: t, updated_at: t, archived_at: null };
    await put("shops", shop);
    const member: ShopMember = {
      shop_id: shop.id,
      user_id: session.userId,
      role: "owner",
      display_name: session.displayName,
      joined_at: t,
      removed_at: null,
      updated_at: t,
    };
    await put("shop_members", member);
    let position = 0;
    for (const categoryName of SHOP_TEMPLATES[template] ?? []) {
      await put("categories", {
        id: uuid(),
        shop_id: shop.id,
        name: categoryName,
        position: position++,
        created_by: session.userId,
        archived_at: null,
        updated_at: t,
      } satisfies Category);
    }
    return shop;
  });
  await setCurrentShopId(shop.id);
  return shop;
}

export async function renameShop(shopId: string, name: string) {
  await requireOwner(shopId);
  const shop = await db.shops.get(shopId);
  if (!shop) return;
  await write((put) => put("shops", { ...shop, name: name.trim(), updated_at: now() }));
}

export async function removeMember(shopId: string, userId: string) {
  await requireOwner(shopId);
  const member = await db.shop_members.get([shopId, userId]);
  if (!member || member.role === "owner") return;
  await write((put) => put("shop_members", { ...member, removed_at: now(), updated_at: now() }));
}

export async function renameMember(shopId: string, userId: string, displayName: string) {
  const member = await db.shop_members.get([shopId, userId]);
  if (!member) return;
  await write((put) => put("shop_members", { ...member, display_name: displayName.trim(), updated_at: now() }));
}

// ---------------------------------------------------------------------------
// Catégories
// ---------------------------------------------------------------------------

export async function createCategory(shopId: string, name: string): Promise<Category> {
  const session = await requireSession();
  const last = await db.categories.where("shop_id").equals(shopId).sortBy("position");
  const category: Category = {
    id: uuid(),
    shop_id: shopId,
    name: name.trim(),
    position: (last.at(-1)?.position ?? -1) + 1,
    created_by: session.userId,
    archived_at: null,
    updated_at: now(),
  };
  await write((put) => put("categories", category));
  return category;
}

export async function renameCategory(id: string, name: string) {
  const category = await db.categories.get(id);
  if (!category) return;
  await write((put) => put("categories", { ...category, name: name.trim(), updated_at: now() }));
}

export async function archiveCategory(id: string) {
  const category = await db.categories.get(id);
  if (!category) return;
  await requireOwner(category.shop_id);
  await write((put) => put("categories", { ...category, archived_at: now(), updated_at: now() }));
}

// ---------------------------------------------------------------------------
// Produits
// ---------------------------------------------------------------------------

export async function createProduct(
  shopId: string,
  categoryId: string,
  name: string,
  { flag = true }: { flag?: boolean } = {},
): Promise<Product> {
  const session = await requireSession();
  return write(async (put) => {
    const t = now();
    const product: Product = {
      id: uuid(),
      shop_id: shopId,
      category_id: categoryId,
      name: name.trim(),
      name_normalized: normalizeName(name),
      status: flag ? "to_buy" : "in_stock",
      note: null,
      flagged_by: flag ? session.userId : null,
      flagged_at: flag ? t : null,
      forgotten_count: 0,
      created_by: session.userId,
      archived_at: null,
      updated_at: t,
    };
    await put("products", product);
    await put("product_events", event(product, "created", session.userId));
    if (flag) await put("product_events", event(product, "flagged", session.userId));
    return product;
  });
}

// Le geste principal : un tap met "à racheter", un autre remet "en stock".
export async function toggleProduct(id: string): Promise<Product> {
  const session = await requireSession();
  const product = await getProduct(id);
  return write(async (put) => {
    const t = now();
    let next: Product;
    if (product.status === "to_buy") {
      next = { ...product, status: "in_stock", note: null, updated_at: t };
      await put("product_events", event(product, "restocked", session.userId));
    } else {
      next = { ...product, status: "to_buy", flagged_by: session.userId, flagged_at: t, updated_at: t };
      await put("product_events", event(product, "flagged", session.userId));
    }
    await put("products", next);
    return next;
  });
}

// Pendant les courses : cocher / décocher ce qui est acheté.
export async function setBought(id: string, bought: boolean) {
  const session = await requireSession();
  const product = await getProduct(id);
  if (bought && product.status !== "to_buy") return;
  if (!bought && product.status !== "bought") return;
  await write(async (put) => {
    await put("products", { ...product, status: bought ? "bought" : "to_buy", updated_at: now() });
    if (bought) await put("product_events", event(product, "bought", session.userId));
  });
}

export async function setNote(id: string, note: string) {
  const product = await getProduct(id);
  await write((put) => put("products", { ...product, note: note.trim() || null, updated_at: now() }));
}

export async function updateProduct(id: string, changes: { name?: string; category_id?: string }) {
  const product = await getProduct(id);
  const next = { ...product, ...changes, updated_at: now() };
  if (changes.name) {
    next.name = changes.name.trim();
    next.name_normalized = normalizeName(changes.name);
  }
  await write((put) => put("products", next));
}

// Supprimer = archiver, pour que l'historique reste cohérent.
export async function archiveProduct(id: string) {
  const product = await getProduct(id);
  await requireOwner(product.shop_id);
  await write((put) => put("products", { ...product, archived_at: now(), updated_at: now() }));
}

// Fusion décidée par le patron : le doublon est archivé, son signalement est reporté.
export async function mergeProducts(duplicateId: string, keepId: string) {
  const duplicate = await getProduct(duplicateId);
  const keep = await getProduct(keepId);
  await requireOwner(keep.shop_id);
  await write(async (put) => {
    const t = now();
    await put("products", { ...duplicate, archived_at: t, updated_at: t });
    if (duplicate.status !== "in_stock" && keep.status === "in_stock") {
      await put("products", {
        ...keep,
        status: duplicate.status,
        flagged_by: duplicate.flagged_by,
        flagged_at: duplicate.flagged_at,
        note: keep.note ?? duplicate.note,
        updated_at: t,
      });
    }
  });
}

// ---------------------------------------------------------------------------
// Clôture
// ---------------------------------------------------------------------------

export async function closeList(shopId: string, sharedToPhone: string | null = null): Promise<Closure | null> {
  const session = await requireSession();
  await requireOwner(shopId);
  const items = (await db.products.where("shop_id").equals(shopId).toArray()).filter(
    (p) => !p.archived_at && (p.status === "to_buy" || p.status === "bought"),
  );
  if (!items.length) return null;
  const categories = new Map((await db.categories.where("shop_id").equals(shopId).toArray()).map((c) => [c.id, c.name]));

  return write(async (put) => {
    const t = now();
    const closure: Closure = { id: uuid(), shop_id: shopId, closed_by: session.userId, closed_at: t, shared_to_phone: sharedToPhone, updated_at: t };
    await put("closures", closure);
    for (const product of items) {
      const bought = product.status === "bought";
      await put("closure_items", {
        id: uuid(),
        closure_id: closure.id,
        shop_id: shopId,
        product_id: product.id,
        product_name: product.name,
        category_name: categories.get(product.category_id) ?? "",
        bought,
        note: product.note,
        updated_at: t,
      } satisfies ClosureItem);
      // Acheté → retour en stock. Non coché → reste à racheter, marqué "oublié".
      await put(
        "products",
        bought
          ? { ...product, status: "in_stock", note: null, forgotten_count: 0, updated_at: t }
          : { ...product, forgotten_count: product.forgotten_count + 1, updated_at: t },
      );
    }
    return closure;
  });
}
