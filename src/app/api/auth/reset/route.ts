import { NextResponse } from "next/server";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth-rules";
import { fail, readJson } from "@/server/api";
import { query } from "@/server/db";
import { hashPassword, resetTokenHash } from "@/server/password";
import { setSessionCookie } from "@/server/session";

const ACTIVE = "used_at is null and cancelled_at is null and expires_at > now()";

// Lien « nouveau mot de passe » créé par l'admin. Sans mot de passe : on vérifie seulement
// que le lien marche encore. Avec : on l'utilise (une seule fois) et on connecte la personne.
export async function POST(req: Request) {
  const body = await readJson(req);
  const token = typeof body?.token === "string" ? body.token : "";
  const password = typeof body?.password === "string" ? body.password : null;
  if (!/^[\w-]{43}$/.test(token)) return fail(404, "invalid_link");
  if (password !== null && (password.length < MIN_PASSWORD_LENGTH || password.length > 200)) return fail(400, "weak_password");

  try {
    const hash = resetTokenHash(token);
    if (password === null) {
      const [user] = await query<{ display_name: string; phone: string }>(
        `select u.display_name, u.phone from password_resets r join users u on u.id = r.user_id where r.token_hash = $1 and ${ACTIVE}`,
        [hash],
      );
      return user ? NextResponse.json({ displayName: user.display_name, phone: `+${user.phone}` }) : fail(404, "invalid_link");
    }

    // Le lien est marqué utilisé dans la même requête que le changement : deux envois simultanés
    // ne peuvent pas s'en servir deux fois.
    const [user] = await query<{ id: string; display_name: string; phone: string }>(
      `with used as (
         update password_resets set used_at = now() where token_hash = $1 and ${ACTIVE} returning user_id
       )
       update users set password_hash = $2 where id = (select user_id from used)
       returning id, display_name, phone`,
      [hash, await hashPassword(password)],
    );
    if (!user) return fail(404, "invalid_link");

    await query("delete from auth_failures where phone = $1", [user.phone]);
    const res = NextResponse.json({ userId: user.id, displayName: user.display_name, phone: `+${user.phone}` });
    await setSessionCookie(res, user.id);
    return res;
  } catch (e) {
    console.error(e);
    return fail(500, "server_error");
  }
}
