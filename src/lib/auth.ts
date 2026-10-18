import { MIN_PASSWORD_LENGTH } from "./auth-rules";
import { api, ApiError, isCloudConfigured } from "./cloud";
import { getMeta, setMeta } from "./db";
import { saveSession } from "./session";
import { syncNow } from "./sync";
import { normalizePhone } from "./whatsapp";

// Connexion par numéro de téléphone + mot de passe, sans code SMS ni WhatsApp :
// aucun fournisseur d'envoi, aucun coût par connexion. Le serveur garde le mot de passe
// haché (scrypt) et pose un cookie de session ; voir src/app/api/auth.
export { MIN_PASSWORD_LENGTH };

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

  const user = await callAuth("/api/auth/signup", { name: displayName, phone: digits, password }, {
    phone_taken: new AuthError("Ce numéro a déjà un compte. Connecte-toi.", "phone"),
  });
  await saveSession({ ...user, mode: "cloud" });
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

  const user = await callAuth("/api/auth/signin", { phone: digits, password }, {
    invalid_credentials: new AuthError("Numéro ou mot de passe incorrect."),
    too_many_attempts: new AuthError("Trop d’essais. Attends 15 minutes, puis réessaie."),
  });
  await saveSession({ ...user, mode: "cloud" });
  await syncNow();
}

type ServerUser = { userId: string; displayName: string; phone: string };

async function callAuth(path: string, body: object, known: Record<string, AuthError>): Promise<ServerUser> {
  try {
    return await api<ServerUser>(path, body);
  } catch (e) {
    if (e instanceof ApiError && known[e.code]) throw known[e.code];
    if (e instanceof ApiError && e.offline) throw new AuthError("Pas de réseau. La première connexion demande internet.");
    throw new AuthError("Le serveur ne répond pas. Réessaie dans un instant.");
  }
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
