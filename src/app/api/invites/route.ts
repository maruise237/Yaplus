import { NextResponse } from "next/server";
import { makeInviteCode } from "@/lib/invite-code";
import { fail, loadRoles, readJson, withUser } from "@/server/api";
import { query } from "@/server/db";

// Le patron crée un code à usage unique, valable 24 heures.
export async function POST(req: Request) {
  return withUser(async (userId) => {
    const body = await readJson(req);
    const shopId = typeof body?.shopId === "string" ? body.shopId : "";
    if ((await loadRoles(userId)).get(shopId) !== "owner") return fail(403, "owner_only");

    for (let attempt = 0; attempt < 5; attempt++) {
      const code = makeInviteCode();
      const rows = await query(
        "insert into invites (shop_id, code, created_by, expires_at) values ($1, $2, $3, now() + interval '24 hours') on conflict (code) do nothing returning code",
        [shopId, code, userId],
      );
      if (rows.length) return NextResponse.json({ code });
    }
    return fail(500, "server_error");
  });
}
