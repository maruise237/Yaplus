import { NextResponse } from "next/server";
import { fail, loadRoles, readJson, withUser } from "@/server/api";
import { query } from "@/server/db";
import { applyToRoles, checkWrite, isSyncedTable, TABLES, upsertStatement, type Row } from "@/server/rules";

const MAX_ENTRIES = 100;

type Result = { ok: true } | { ok: false; error: string };

// Reçoit l'outbox d'un appareil, dans l'ordre. Chaque action a sa réponse :
// un refus (droits, contrainte) ne bloque pas les suivantes.
export async function POST(req: Request) {
  return withUser(async (userId) => {
    const body = await readJson(req);
    const entries = Array.isArray(body?.entries) ? body.entries.slice(0, MAX_ENTRIES) : null;
    if (!entries) return fail(400, "bad_request");

    const roles = await loadRoles(userId);
    const results: Result[] = [];

    for (const entry of entries as { table?: unknown; row?: unknown }[]) {
      const { table, row } = entry ?? {};
      if (!isSyncedTable(table) || !row || typeof row !== "object") {
        results.push({ ok: false, error: "bad_entry" });
        continue;
      }
      const spec = TABLES[table];
      const data = row as Row;
      try {
        const where = spec.key.map((k, i) => `${k} = $${i + 1}`).join(" and ");
        const [existing] = await query(`select * from ${table} where ${where}`, spec.key.map((k) => data[k]));
        const refusal = checkWrite(table, data, existing ?? null, userId, roles);
        if (refusal) {
          results.push({ ok: false, error: refusal });
          continue;
        }
        const { text, params } = upsertStatement(table, data);
        await query(text, params);
        applyToRoles(table, data, userId, roles);
        results.push({ ok: true });
      } catch (e) {
        // Contrainte violée, type invalide… : l'action est refusée, la file continue.
        results.push({ ok: false, error: e instanceof Error ? e.message.slice(0, 200) : "write_failed" });
      }
    }

    return NextResponse.json({ results });
  });
}
