import { NextResponse } from "next/server";
import { fail, readJson, withUser } from "@/server/api";
import { query } from "@/server/db";

// Une seule requête : le code est consommé et l'employé ajouté ensemble, ou rien du tout.
export async function POST(req: Request) {
  return withUser(async (userId) => {
    const body = await readJson(req);
    const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
    if (!code) return fail(400, "invalid_invite");

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
    if (!row) return fail(404, "invalid_invite");
    return NextResponse.json({ shopId: row.shop_id });
  });
}
