import { NextResponse } from "next/server";
import { SYNCED_TABLES } from "@/lib/db";
import { loadRoles, readJson, withUser } from "@/server/api";
import { query } from "@/server/db";
import { TABLES } from "@/server/rules";

const PAGE = 500;

// Renvoie, pour chaque table, ce qui a changé depuis le curseur de l'appareil,
// limité aux boutiques dont l'utilisateur fait partie. Un seul aller-retour pour tout le cahier.
export async function POST(req: Request) {
  return withUser(async (userId) => {
    const body = await readJson(req);
    const cursors = (body?.cursors && typeof body.cursors === "object" ? body.cursors : {}) as Record<string, unknown>;
    const shops = [...(await loadRoles(userId)).keys()];

    const tables: Record<string, unknown[]> = {};
    if (shops.length) {
      await Promise.all(
        SYNCED_TABLES.map(async (table) => {
          const scope = TABLES[table].scope;
          const cursor = typeof cursors[table] === "string" ? cursors[table] : null;
          tables[table] = await query(
            `select * from ${table} where ${scope} = any($1::uuid[]) and ($2::timestamptz is null or synced_at >= $2)
             order by synced_at asc limit ${PAGE}`,
            [shops, cursor],
          );
        }),
      );
    }

    return NextResponse.json({ tables, page: PAGE });
  });
}
