"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { SUPPORT_MAX_LENGTH } from "@/lib/support";
import { normalizePhone } from "@/lib/whatsapp";
import { adminConfig, currentAdmin, endAdminSession, logAdmin, startAdminSession } from "@/server/admin";
import { query } from "@/server/db";
import { hashPassword, newResetToken, verifyPassword } from "@/server/password";
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

const isId = (id: unknown): id is string => typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id);

// Mot de passe oublié : un lien à usage unique, envoyé sur le WhatsApp du compte.
// Un nouveau lien annule le précédent ; l'admin ne voit jamais le mot de passe.
export async function createResetLink(userId: string): Promise<{ token: string } | { error: string }> {
  const admin = await currentAdmin();
  if (!admin) return { error: "Session expirée. Reconnecte-toi." };
  if (!isId(userId)) return { error: "Compte introuvable." };

  const { token, hash } = newResetToken();
  const rows = await query(
    `with cancelled as (
       update password_resets set cancelled_at = now() where user_id = $1 and used_at is null and cancelled_at is null
     )
     insert into password_resets (user_id, token_hash, created_by)
     select id, $2, $3 from users where id = $1 returning id`,
    [userId, hash, admin.id],
  );
  if (!rows.length) return { error: "Compte introuvable." };
  await logAdmin(admin.id, "reset_link_created", userId);
  refresh();
  return { token };
}

export async function cancelResetLink(userId: string): Promise<{ error: string } | null> {
  const admin = await currentAdmin();
  if (!admin) return { error: "Session expirée. Reconnecte-toi." };
  if (!isId(userId)) return { error: "Compte introuvable." };
  await query("update password_resets set cancelled_at = now() where user_id = $1 and used_at is null and cancelled_at is null", [userId]);
  await logAdmin(admin.id, "reset_link_cancelled", userId);
  refresh();
  return null;
}

// Support : la réponse s'affiche dans l'app, dans Boutique > Aide.
export async function replySupport(userId: string, body: string): Promise<{ error: string } | null> {
  const admin = await currentAdmin();
  if (!admin) return { error: "Session expirée. Reconnecte-toi." };
  const text = typeof body === "string" ? body.trim() : "";
  if (!isId(userId) || !text) return { error: "Écris une réponse." };
  if (text.length > SUPPORT_MAX_LENGTH) return { error: `${SUPPORT_MAX_LENGTH} caractères maximum.` };

  const rows = await query(
    `with msg as (
       insert into support_messages (user_id, from_admin, author_id, body)
       select user_id, true, $2, $3 from support_threads where user_id = $1 returning user_id
     )
     update support_threads set last_at = now() where user_id in (select user_id from msg) returning user_id`,
    [userId, admin.id, text],
  );
  if (!rows.length) return { error: "Conversation introuvable." };
  refresh();
  return null;
}

export async function setSupportClosed(userId: string, closed: boolean): Promise<void> {
  if (!(await currentAdmin()) || !isId(userId)) return;
  await query(`update support_threads set closed_at = ${closed ? "now()" : "null"} where user_id = $1`, [userId]);
  refresh();
}

// Numéro WhatsApp qui reçoit les « Mot de passe oublié » et les messages « Plutôt sur WhatsApp ».
export async function saveSupportWhatsapp(input: string): Promise<{ error: string } | null> {
  const admin = await currentAdmin();
  if (!admin) return { error: "Session expirée. Reconnecte-toi." };
  const phone = typeof input === "string" && input.trim() ? normalizePhone(input) : null;
  if (typeof input === "string" && input.trim() && !phone) return { error: "Ce numéro ne semble pas valide. Exemple : 6 99 00 11 22" };

  if (phone) {
    await query(
      `insert into app_settings (key, value, updated_by) values ('support_whatsapp', $1, $2)
       on conflict (key) do update set value = $1, updated_by = $2, updated_at = now()`,
      [phone, admin.id],
    );
  } else {
    await query("delete from app_settings where key = 'support_whatsapp'");
  }
  await logAdmin(admin.id, "support_number_changed", phone);
  refresh();
  return null;
}
