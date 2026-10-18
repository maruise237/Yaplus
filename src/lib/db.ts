import Dexie, { type EntityTable } from "dexie";

export type ProductStatus = "in_stock" | "to_buy" | "bought";
export type Role = "owner" | "employee";

export type Shop = {
  id: string;
  owner_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

export type ShopMember = {
  shop_id: string;
  user_id: string;
  role: Role;
  display_name: string;
  joined_at: string;
  removed_at: string | null;
  updated_at: string;
};

export type Category = {
  id: string;
  shop_id: string;
  name: string;
  position: number;
  created_by: string | null;
  archived_at: string | null;
  updated_at: string;
};

export type Product = {
  id: string;
  shop_id: string;
  category_id: string;
  name: string;
  name_normalized: string;
  status: ProductStatus;
  note: string | null;
  flagged_by: string | null;
  flagged_at: string | null;
  forgotten_count: number;
  created_by: string | null;
  archived_at: string | null;
  updated_at: string;
};

export type ProductEvent = {
  id: string;
  product_id: string;
  shop_id: string;
  type: "created" | "flagged" | "restocked" | "bought";
  user_id: string;
  at: string;
  updated_at: string;
};

export type Closure = {
  id: string;
  shop_id: string;
  closed_by: string;
  closed_at: string;
  shared_to_phone: string | null;
  updated_at: string;
};

export type ClosureItem = {
  id: string;
  closure_id: string;
  shop_id: string;
  product_id: string;
  product_name: string;
  category_name: string;
  bought: boolean;
  note: string | null;
  updated_at: string;
};

export type SyncedTable =
  | "shops"
  | "shop_members"
  | "categories"
  | "products"
  | "product_events"
  | "closures"
  | "closure_items";

// Ordre d'envoi et de réception : les parents avant les enfants (clés étrangères).
export const SYNCED_TABLES: SyncedTable[] = [
  "shops",
  "shop_members",
  "categories",
  "products",
  "product_events",
  "closures",
  "closure_items",
];

export type OutboxEntry = {
  seq?: number;
  table: SyncedTable;
  row: Record<string, unknown>;
  created_at: string;
  attempts: number;
  error?: string | null;
};

export type Meta = { key: string; value: unknown };

class YaplusDB extends Dexie {
  shops!: EntityTable<Shop, "id">;
  shop_members!: Dexie.Table<ShopMember, [string, string]>;
  categories!: EntityTable<Category, "id">;
  products!: EntityTable<Product, "id">;
  product_events!: EntityTable<ProductEvent, "id">;
  closures!: EntityTable<Closure, "id">;
  closure_items!: EntityTable<ClosureItem, "id">;
  outbox!: EntityTable<OutboxEntry, "seq">;
  meta!: EntityTable<Meta, "key">;

  constructor() {
    super("yaplus");
    this.version(1).stores({
      shops: "id, owner_id",
      shop_members: "[shop_id+user_id], shop_id, user_id",
      categories: "id, shop_id, [shop_id+position]",
      products: "id, shop_id, category_id, status, [shop_id+status], name_normalized",
      product_events: "id, shop_id, product_id",
      closures: "id, shop_id, closed_at",
      closure_items: "id, closure_id, shop_id",
      outbox: "++seq, table",
      meta: "key",
    });
  }
}

export const db = new YaplusDB();

export async function getMeta<T>(key: string): Promise<T | undefined> {
  return (await db.meta.get(key))?.value as T | undefined;
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  await db.meta.put({ key, value });
}
