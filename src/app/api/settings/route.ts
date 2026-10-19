import { NextResponse } from "next/server";
import { fail } from "@/server/api";
import { query } from "@/server/db";

// Réglages publics de l'app, modifiables dans le panneau admin (Réglages).
export async function GET() {
  try {
    const [row] = await query<{ value: string }>("select value from app_settings where key = 'support_whatsapp'");
    return NextResponse.json({ supportWhatsapp: row?.value ?? null }, { headers: { "Cache-Control": "public, max-age=60" } });
  } catch (e) {
    console.error(e);
    return fail(500, "server_error");
  }
}
