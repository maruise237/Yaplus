"use server";

import { randomInt } from "node:crypto";
import { redirect } from "next/navigation";
import { normalizePhone } from "@/lib/whatsapp";
import { adminConfig, currentAdmin, endAdminSession, logAdmin, startAdminSession } from "@/server/admin";
import { query } from "@/server/db";
import { hashPassword, verifyPassword } from "@/server/password";
import { verifyTotp } from "@/server/totp";

// Chaque action revérifie l'accès : une action serveur se rappelle par une simple requête POST.

// Un seul compteur pour toutes les tentatives : quelques essais ratés, et le panneau se ferme 15 minutes.
const MAX_FAILURES = 5;
const DENIED = "Accès refusé. Vérifie le numéro, le mot de passe et le code.";

let dummyHash: Promise<string> | null = null;

export type SignInState = { error: string | null };

export async function signInAdmin(_: SignInState, form: FormData): Promise<SignInState> {
  const config = adminConfig();
  if (!config) return { error: DENIED };

  const [{ failures }] = await query<{ failures: number }>(
    "select count(*)::int as failures from auth_failures where phone = 'admin' and at > now() - interval '15 minutes'",
  );
  if (failures >= MAX_FAILURES) return { error: "Trop d’essais. Réessaie dans 15 minutes." };

  const phone = normalizePhone(String(form.get("phone") ?? ""));
  const password = String(form.get("password") ?? "");
  const code = String(form.get("code") ?? "").replace(/\s/g, "");
  const [user] = phone ? await query<{ id: string; password_hash: string }>("select id, password_hash from users where phone = $1", [phone]) : [];

  // Le mot de passe est toujours vérifié, même sans compte : la réponse prend le même temps.
  dummyHash ??= hashPassword(crypto.randomUUID());
  const passwordOk = await verifyPassword(password, user?.password_hash ?? (await dummyHash));
  const ok = Boolean(user) && config.phones.includes(phone ?? "") && passwordOk && verifyTotp(config.totpSecret, code);
  if (!ok || !user) {
    await query("insert into auth_failures (phone) values ('admin')");
    return { error: DENIED };
  }

  await startAdminSession(user.id);
  await logAdmin(user.id, "sign_in");
  redirect(config.base);
}

export async function signOutAdmin(): Promise<void> {
  const admin = await currentAdmin();
  if (admin) await logAdmin(admin.id, "sign_out");
  await endAdminSession();
  redirect(adminConfig()?.base ?? "/");
}

// Pour un compte qui a oublié son mot de passe : 8 chiffres, montrés une seule fois à l'admin.
export async function resetPassword(userId: string): Promise<{ password: string } | { error: string }> {
  const admin = await currentAdmin();
  if (!admin) return { error: "Session expirée. Reconnecte-toi." };
  if (typeof userId !== "string" || !/^[0-9a-f-]{36}$/i.test(userId)) return { error: "Compte introuvable." };

  const password = String(randomInt(0, 100_000_000)).padStart(8, "0");
  const rows = await query("update users set password_hash = $2 where id = $1 returning id", [userId, await hashPassword(password)]);
  if (!rows.length) return { error: "Compte introuvable." };
  await logAdmin(admin.id, "reset_password", userId);
  return { password };
}
