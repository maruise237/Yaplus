import { NextResponse } from "next/server";
import { SUPPORT_MAX_LENGTH } from "@/lib/support";
import { fail, loadRoles, readJson, withUser } from "@/server/api";
import { query } from "@/server/db";
import { supportThread } from "@/server/support";

// Assez pour une vraie conversation, trop peu pour remplir la boîte du support.
const MAX_PER_HOUR = 20;

export async function POST(req: Request) {
  const body = await readJson(req);
  const text = typeof body?.body === "string" ? body.body.trim() : "";
  if (!text) return fail(400, "empty");
  if (text.length > SUPPORT_MAX_LENGTH) return fail(400, "too_long");

  return withUser(async (userId) => {
    const [{ recent }] = await query<{ recent: number }>(
      "select count(*)::int as recent from support_messages where user_id = $1 and not from_admin and at > now() - interval '1 hour'",
      [userId],
    );
    if (recent >= MAX_PER_HOUR) return fail(429, "too_many_messages");

    // La boutique n'est jointe que si la personne en fait partie (et qu'elle existe déjà côté serveur).
    const shopId = typeof body?.shopId === "string" && (await loadRoles(userId)).has(body.shopId) ? body.shopId : null;
    await query(
      `insert into support_threads (user_id) values ($1)
       on conflict (user_id) do update set last_at = now(), closed_at = null, user_seen_at = now()`,
      [userId],
    );
    await query("insert into support_messages (user_id, shop_id, author_id, body) values ($1, $2, $1, $3)", [userId, shopId, text]);
    return NextResponse.json(await supportThread(userId));
  });
}
