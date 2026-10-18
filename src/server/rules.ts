import type { Role, SyncedTable } from "@/lib/db";

// Ce que chaque table accepte de l'appareil, et qui a le droit d'écrire quoi.
// Les règles reprennent celles du PRD : tout membre actif tient le cahier ; seul le patron
// gère l'équipe et clôture ; le journal est en ajout seul, au nom de son auteur.

type TableSpec = { columns: string[]; key: string[]; appendOnly: boolean; scope: "id" | "shop_id" };

export const TABLES: Record<SyncedTable, TableSpec> = {
  shops: { columns: ["id", "owner_id", "name", "created_at", "updated_at", "archived_at"], key: ["id"], appendOnly: false, scope: "id" },
  shop_members: {
    columns: ["shop_id", "user_id", "role", "display_name", "joined_at", "removed_at", "updated_at"],
    key: ["shop_id", "user_id"],
    appendOnly: false,
    scope: "shop_id",
  },
  categories: {
    columns: ["id", "shop_id", "name", "position", "created_by", "archived_at", "updated_at"],
    key: ["id"],
    appendOnly: false,
    scope: "shop_id",
  },
  products: {
    columns: [
      "id", "shop_id", "category_id", "name", "name_normalized", "status", "note",
      "flagged_by", "flagged_at", "forgotten_count", "created_by", "archived_at", "updated_at",
    ],
    key: ["id"],
    appendOnly: false,
    scope: "shop_id",
  },
  product_events: {
    columns: ["id", "product_id", "shop_id", "type", "user_id", "at", "updated_at"],
    key: ["id"],
    appendOnly: true,
    scope: "shop_id",
  },
  closures: { columns: ["id", "shop_id", "closed_by", "closed_at", "shared_to_phone", "updated_at"], key: ["id"], appendOnly: true, scope: "shop_id" },
  closure_items: {
    columns: ["id", "closure_id", "shop_id", "product_id", "product_name", "category_name", "bought", "note", "updated_at"],
    key: ["id"],
    appendOnly: true,
    scope: "shop_id",
  },
};

export function isSyncedTable(name: unknown): name is SyncedTable {
  return typeof name === "string" && Object.hasOwn(TABLES, name);
}

export type Row = Record<string, unknown>;

// Rôle de l'utilisateur dans chaque boutique où il est actif (ou dont il est propriétaire).
export type Roles = Map<string, Role>;

export function shopOf(table: SyncedTable, row: Row): string {
  return String(TABLES[table].scope === "id" ? row.id : row.shop_id);
}

// Renvoie null si l'écriture est permise, sinon la raison du refus.
// `existing` est la ligne déjà sur le serveur avec la même clé, s'il y en a une.
export function checkWrite(table: SyncedTable, row: Row, existing: Row | null, userId: string, roles: Roles): string | null {
  const spec = TABLES[table];
  for (const k of spec.key) if (typeof row[k] !== "string" || !row[k]) return "missing_key";
  if (typeof row.updated_at !== "string") return "missing_updated_at";

  const shopId = shopOf(table, row);
  // Une ligne ne change jamais de boutique.
  if (existing && shopOf(table, existing) !== shopId) return "forbidden";
  const role = roles.get(shopId);
  const isOwner = role === "owner";

  switch (table) {
    case "shops":
      if (!existing) return row.owner_id === userId ? null : "forbidden";
      return isOwner && row.owner_id === existing.owner_id ? null : "forbidden";

    case "shop_members":
      if (isOwner) return null;
      // Un employé peut seulement réécrire sa propre ligne (son nom), sans toucher rôle ni statut.
      if (
        existing &&
        row.user_id === userId &&
        existing.removed_at == null &&
        row.role === existing.role &&
        (row.removed_at ?? null) === null
      ) {
        return null;
      }
      return "forbidden";

    case "categories":
    case "products":
      return role ? null : "forbidden";

    case "product_events":
      return role && row.user_id === userId ? null : "forbidden";

    case "closures":
      return isOwner && row.closed_by === userId ? null : "forbidden";

    case "closure_items":
      return isOwner ? null : "forbidden";
  }
}

// Après une écriture acceptée : créer une boutique en fait le patron, gérer l'équipe change les rôles.
export function applyToRoles(table: SyncedTable, row: Row, userId: string, roles: Roles): void {
  if (table === "shops" && row.owner_id === userId) roles.set(String(row.id), "owner");
  if (table === "shop_members" && row.user_id === userId) {
    if (row.removed_at) roles.delete(String(row.shop_id));
    else if (row.role === "owner" || row.role === "employee") roles.set(String(row.shop_id), row.role);
  }
}

// Requête d'écriture : colonnes en liste blanche, la dernière modification gagne (trigger SQL).
export function upsertStatement(table: SyncedTable, row: Row): { text: string; params: unknown[] } {
  const spec = TABLES[table];
  const cols = spec.columns.filter((c) => c in row);
  const params = cols.map((c) => row[c] ?? null);
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
  const conflict = spec.appendOnly
    ? "do nothing"
    : `do update set ${cols.filter((c) => !spec.key.includes(c)).map((c) => `${c} = excluded.${c}`).join(", ")}`;
  return {
    text: `insert into ${table} (${cols.join(", ")}) values (${placeholders}) on conflict (${spec.key.join(", ")}) ${conflict}`,
    params,
  };
}
