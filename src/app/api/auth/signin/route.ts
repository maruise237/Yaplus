import { NextResponse } from "next/server";
import { normalizePhone } from "@/lib/whatsapp";
import { fail, readJson } from "@/server/api";
import { query } from "@/server/db";
import { verifyPassword } from "@/server/password";
import { setSessionCookie } from "@/server/session";

// Au-delà, on fait patienter : un mot de passe à 6 caractères ne doit pas se deviner en rafale.
const MAX_FAILURES = 8;
const WINDOW = "15 minutes";

export async function POST(req: Request) {
  const body = await readJson(req);
  const phone = typeof body?.phone === "string" ? normalizePhone(body.phone) : null;
  const password = typeof body?.password === "string" ? body.password : "";
  if (!phone) return fail(400, "invalid_phone");
  if (!password) return fail(400, "password_required");

  try {
    const [{ failures }] = await query<{ failures: number }>(
      `select count(*)::int as failures from auth_failures where phone = $1 and at > now() - interval '${WINDOW}'`,
      [phone],
    );
    if (failures >= MAX_FAILURES) return fail(429, "too_many_attempts");

    const [user] = await query<{ id: string; display_name: string; password_hash: string }>(
      "select id, display_name, password_hash from users where phone = $1",
      [phone],
    );
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      await query("insert into auth_failures (phone) values ($1)", [phone]);
      return fail(401, "invalid_credentials");
    }

    await query(`delete from auth_failures where phone = $1 or at < now() - interval '1 day'`, [phone]);
    const res = NextResponse.json({ userId: user.id, displayName: user.display_name, phone: `+${phone}` });
    await setSessionCookie(res, user.id);
    return res;
  } catch (e) {
    console.error(e);
    return fail(500, "server_error");
  }
}
