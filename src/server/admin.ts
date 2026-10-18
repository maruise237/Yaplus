import "server-only";
import { createHmac } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { query } from "./db";

// Panneau d'administration : caché derrière une adresse secrète (src/proxy.ts) et réservé
// aux numéros listés dans ADMIN_PHONES, avec mot de passe du compte + code de l'appli
// d'authentification. Sans ces trois réglages, le panneau n'existe pas.
const COOKIE = "yaplus_admin";
const MAX_AGE = 60 * 60 * 8;

export function adminConfig() {
  const path = process.env.ADMIN_PATH ?? "";
  const totpSecret = process.env.ADMIN_TOTP_SECRET ?? "";
  const phones = (process.env.ADMIN_PHONES ?? "").split(",").map((p) => p.replace(/\D/g, "")).filter(Boolean);
  if (!/^[\w-]{16,}$/.test(path) || totpSecret.length < 16 || !phones.length) return null;
  return { base: `/${path}`, totpSecret, phones };
}

// Clé distincte de celle des sessions du cahier : un jeton de l'un n'ouvre jamais l'autre.
function key(): Uint8Array {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SECRET manquant (32 caractères minimum)");
  return createHmac("sha256", value).update("yaplus-admin").digest();
}

export async function startAdminSession(userId: string): Promise<void> {
  const config = adminConfig();
  if (!config) return;
  const token = await new SignJWT({}).setProtectedHeader({ alg: "HS256" }).setSubject(userId).setIssuedAt().setExpirationTime(`${MAX_AGE}s`).sign(key());
  // Le cookie n'est envoyé qu'à l'adresse secrète, jamais au reste du site.
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: config.base,
    maxAge: MAX_AGE,
  });
}

export async function endAdminSession(): Promise<void> {
  const config = adminConfig();
  if (config) (await cookies()).set(COOKIE, "", { httpOnly: true, path: config.base, maxAge: 0 });
}

export type Admin = { id: string; name: string; phone: string };

// Revérifié à chaque requête : retirer un numéro de ADMIN_PHONES ferme l'accès tout de suite.
export const currentAdmin = cache(async (): Promise<Admin | null> => {
  const config = adminConfig();
  const token = (await cookies()).get(COOKIE)?.value;
  if (!config || !token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string") return null;
    const [user] = await query<{ id: string; display_name: string; phone: string }>("select id, display_name, phone from users where id = $1", [payload.sub]);
    return user && config.phones.includes(user.phone) ? { id: user.id, name: user.display_name, phone: user.phone } : null;
  } catch {
    return null;
  }
});

export async function logAdmin(adminId: string, action: string, target: string | null = null): Promise<void> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  await query("insert into admin_events (admin_id, action, target, ip) values ($1, $2, $3, $4)", [adminId, action, target, ip]);
}
