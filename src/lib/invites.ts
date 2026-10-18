import { getSession, setCurrentShopId } from "./session";
import { getSupabase } from "./supabase";
import { resetCursors, syncNow } from "./sync";

// Pas de 0/O ni 1/I : le code se lit et se dicte sans erreur.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function makeInviteCode(length = 6): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export function inviteLink(code: string): string {
  return `${window.location.origin}/rejoindre?code=${code}`;
}

// Une invitation a besoin du réseau : elle doit exister sur le serveur pour être utilisée ailleurs.
export async function createInvite(shopId: string): Promise<string> {
  const client = getSupabase();
  if (!client) throw new Error("Les invitations demandent la connexion au serveur (Supabase).");
  const code = makeInviteCode();
  const { error } = await client.from("invites").insert({ shop_id: shopId, code });
  if (error) throw new Error(error.message);
  return code;
}

export async function acceptInvite(code: string): Promise<string> {
  const client = getSupabase();
  const session = await getSession();
  if (!client || !session) throw new Error("Connecte-toi d'abord.");
  const { data, error } = await client.rpc("accept_invite", { p_code: code, p_display_name: session.displayName });
  if (error) throw new Error(error.message.includes("invalid_invite") ? "Code invalide ou expiré." : error.message);
  const shopId = data as string;
  await resetCursors();
  await syncNow();
  await setCurrentShopId(shopId);
  return shopId;
}
