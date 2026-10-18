import "server-only";
import { NextResponse } from "next/server";
import type { Role } from "@/lib/db";
import { query } from "./db";
import { currentUserId } from "./session";
import type { Roles } from "./rules";

export function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

// Boutiques où l'utilisateur est actif, avec son rôle. Le propriétaire reste patron même sans ligne membre.
export async function loadRoles(userId: string): Promise<Roles> {
  const rows = await query<{ shop_id: string; role: Role }>(
    `select shop_id, role from shop_members where user_id = $1 and removed_at is null
     union all
     select id as shop_id, 'owner' as role from shops where owner_id = $1`,
    [userId],
  );
  const roles: Roles = new Map();
  for (const r of rows) if (roles.get(r.shop_id) !== "owner") roles.set(r.shop_id, r.role);
  return roles;
}

// Toute route du cahier passe par là : pas de cookie valide, pas d'accès.
export async function withUser(handler: (userId: string) => Promise<Response>): Promise<Response> {
  const userId = await currentUserId();
  if (!userId) return fail(401, "not_signed_in");
  try {
    return await handler(userId);
  } catch (e) {
    console.error(e);
    return fail(500, "server_error");
  }
}
