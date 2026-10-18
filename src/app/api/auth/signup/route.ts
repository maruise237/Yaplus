import { NextResponse } from "next/server";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth-rules";
import { normalizePhone } from "@/lib/whatsapp";
import { fail, readJson } from "@/server/api";
import { query } from "@/server/db";
import { hashPassword } from "@/server/password";
import { setSessionCookie } from "@/server/session";

export async function POST(req: Request) {
  const body = await readJson(req);
  const displayName = typeof body?.name === "string" ? body.name.trim().slice(0, 60) : "";
  const phone = typeof body?.phone === "string" ? normalizePhone(body.phone) : null;
  const password = typeof body?.password === "string" ? body.password : "";
  if (!displayName) return fail(400, "name_required");
  if (!phone) return fail(400, "invalid_phone");
  if (password.length < MIN_PASSWORD_LENGTH || password.length > 200) return fail(400, "weak_password");

  try {
    const userId = crypto.randomUUID();
    const rows = await query(
      `insert into users (id, phone, display_name, password_hash) values ($1, $2, $3, $4)
       on conflict (phone) do nothing returning id`,
      [userId, phone, displayName, await hashPassword(password)],
    );
    if (!rows.length) return fail(409, "phone_taken");

    const res = NextResponse.json({ userId, displayName, phone: `+${phone}` });
    await setSessionCookie(res, userId);
    return res;
  } catch (e) {
    console.error(e);
    return fail(500, "server_error");
  }
}
