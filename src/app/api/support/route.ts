import { NextResponse } from "next/server";
import { readJson, withUser } from "@/server/api";
import { query } from "@/server/db";
import { supportThread } from "@/server/support";

// La conversation de support du compte connecté. `seen: true` quand elle est affichée à l'écran.
export async function POST(req: Request) {
  const body = await readJson(req);
  return withUser(async (userId) => {
    if (body?.seen === true) await query("update support_threads set user_seen_at = now() where user_id = $1", [userId]);
    return NextResponse.json(await supportThread(userId));
  });
}
