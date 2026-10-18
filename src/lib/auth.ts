import { getMeta, setMeta } from "./db";
import { saveSession } from "./session";
import { getSupabase, isCloudConfigured } from "./supabase";
import { syncNow } from "./sync";
import { normalizePhone } from "./whatsapp";

// Connexion par numéro de téléphone + mot de passe, sans code SMS ni WhatsApp :
// aucun fournisseur d'envoi, aucun coût par connexion.
//
// Supabase ne sait gérer le téléphone qu'avec un fournisseur SMS. On passe donc par sa connexion
// e-mail + mot de passe, avec un identifiant interne dérivé du numéro. L'utilisateur ne voit
// jamais cet identifiant. Prérequis côté Supabase : désactiver « Confirm email » (voir README).
export const PHONE_LOGIN_DOMAIN = "tel.yaplus.app";
export const MIN_PASSWORD_LENGTH = 6;

export function phoneToLogin(phone: string): string | null {
  const digits = normalizePhone(phone);
  return digits ? `${digits}@${PHONE_LOGIN_DOMAIN}` : null;
}

export type AuthField = "name" | "phone" | "password";

// Erreur à afficher à l'utilisateur ; `field` indique le champ concerné, s'il y en a un.
export class AuthError extends Error {
  constructor(
    message: string,
    readonly field: AuthField | null = null,
  ) {
    super(message);
  }
}

function requirePhone(phone: string): string {
  const digits = normalizePhone(phone);
  if (!digits) throw new AuthError("Ce numéro ne semble pas valide. Exemple : 6 99 00 11 22", "phone");
  return digits;
}

function requirePassword(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new AuthError(`Le mot de passe doit faire au moins ${MIN_PASSWORD_LENGTH} caractères.`, "password");
  }
}

export async function signUp({ name, phone, password }: { name: string; phone: string; password: string }) {
  const displayName = name.trim();
  if (!displayName) throw new AuthError("Écris ton prénom : l’équipe verra qui a signalé quoi.", "name");
  const digits = requirePhone(phone);
  requirePassword(password);

  if (!isCloudConfigured) {
    const userId = await createLocalAccount(digits, displayName, password);
    await saveSession({ userId, displayName, phone: `+${digits}`, mode: "local" });
    return;
  }

  const { data, error } = await getSupabase()!.auth.signUp({
    email: phoneToLogin(digits)!,
    password,
    options: { data: { display_name: displayName, phone: `+${digits}` } },
  });
  if (error) {
    if (/already registered|already exists/i.test(error.message)) throw new AuthError("Ce numéro a déjà un compte. Connecte-toi.", "phone");
    throw new AuthError("Le compte n’a pas pu être créé. Vérifie ta connexion et réessaie.");
  }
  if (!data.session || !data.user) {
    // La confirmation par e-mail est encore active dans Supabase : personne ne recevrait ce mail.
    throw new AuthError("Inscription bloquée par la configuration du serveur. Préviens l’administrateur.");
  }
  await saveSession({ userId: data.user.id, displayName, phone: `+${digits}`, mode: "cloud" });
  await syncNow();
}

export async function signIn({ phone, password }: { phone: string; password: string }) {
  const digits = requirePhone(phone);
  if (!password) throw new AuthError("Écris ton mot de passe.", "password");

  if (!isCloudConfigured) {
    const account = await checkLocalAccount(digits, password);
    await saveSession({ userId: account.userId, displayName: account.displayName, phone: `+${digits}`, mode: "local" });
    return;
  }

  const { data, error } = await getSupabase()!.auth.signInWithPassword({ email: phoneToLogin(digits)!, password });
  if (error || !data.user) {
    if (error && /invalid login credentials/i.test(error.message)) throw new AuthError("Numéro ou mot de passe incorrect.");
    throw new AuthError("Connexion impossible. Vérifie ta connexion et réessaie.");
  }
  const displayName = (data.user.user_metadata?.display_name as string | undefined) ?? "Moi";
  await saveSession({ userId: data.user.id, displayName, phone: `+${digits}`, mode: "cloud" });
  await syncNow();
}

// ---------------------------------------------------------------------------
// Mode « sur cet appareil » (sans serveur) : comptes gardés sur le téléphone,
// mot de passe jamais stocké en clair (PBKDF2).
// ---------------------------------------------------------------------------

type LocalAccount = { userId: string; displayName: string; salt: string; hash: string };
export const LOCAL_ACCOUNTS_KEY = "localAccounts";

const toHex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");

async function hashPassword(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: 100_000 },
    key,
    256,
  );
  return toHex(bits);
}

async function createLocalAccount(digits: string, displayName: string, password: string): Promise<string> {
  const accounts = (await getMeta<Record<string, LocalAccount>>(LOCAL_ACCOUNTS_KEY)) ?? {};
  if (accounts[digits]) throw new AuthError("Ce numéro a déjà un compte. Connecte-toi.", "phone");
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)).buffer);
  const userId = crypto.randomUUID();
  accounts[digits] = { userId, displayName, salt, hash: await hashPassword(password, salt) };
  await setMeta(LOCAL_ACCOUNTS_KEY, accounts);
  return userId;
}

async function checkLocalAccount(digits: string, password: string): Promise<LocalAccount> {
  const account = ((await getMeta<Record<string, LocalAccount>>(LOCAL_ACCOUNTS_KEY)) ?? {})[digits];
  if (!account || (await hashPassword(password, account.salt)) !== account.hash) {
    throw new AuthError("Numéro ou mot de passe incorrect.");
  }
  return account;
}
