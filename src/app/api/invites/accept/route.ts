import { NextResponse } from "next/server";
import { fail, loadRoles, readJson, withUser } from "@/server/api";
import { query } from "@/server/db";

// Une seule requête : le code est consommé et l'employé ajouté ensemble, ou rien du tout.
export async function POST(req: Request) {
  return withUser(async (userId) => {
    const body = await readJson(req);
    const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
    if (!code) return fail(400, "invalid_invite");

    const [invite] = await query<{ shop_id: string; used: boolean; expired: boolean }>(
      "select shop_id, used_at is not null as used, expires_at <= now() as expired from invites where code = $1",
      [code],
    );
    if (!invite) return fail(404, "invalid_invite");
    // Déjà dans la boutique (lien rouvert, réponse perdue, patron qui teste) : on ne brûle pas le code.
    if ((await loadRoles(userId)).has(invite.shop_id)) return NextResponse.json({ shopId: invite.shop_id });
    if (invite.used) return fail(410, "invite_used");
    if (invite.expired) return fail(410, "invite_expired");

    const [row] = await query<{ shop_id: string }>(
      `with invite as (
         update invites set used_at = now(), used_by = $2, updated_at = now()
         where code = $1 and used_at is null and expires_at > now()
         returning shop_id
       ), member as (
         insert into shop_members (shop_id, user_id, role, display_name)
         select invite.shop_id, users.id, 'employee', users.display_name from invite, users where users.id = $2
         on conflict (shop_id, user_id) do update
           set removed_at = null, display_name = excluded.display_name, updated_at = now()
         returning shop_id
       )
       select shop_id from member`,
      [code, userId],
    );
    if (!row) return fail(410, "invite_used");
    return NextResponse.json({ shopId: row.shop_id });
  });
}
