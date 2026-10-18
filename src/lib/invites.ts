import { api, ApiError, isCloudConfigured } from "./cloud";
import { getSession, setCurrentShopId } from "./session";
import { resetCursors, syncNow } from "./sync";

export function inviteLink(code: string): string {
  return `${window.location.origin}/rejoindre?code=${code}`;
}

// Une invitation a besoin du réseau : elle doit exister sur le serveur pour être utilisée ailleurs.
export async function createInvite(shopId: string): Promise<string> {
  if (!isCloudConfigured) throw new Error("Les invitations demandent la connexion au serveur.");
  try {
    // La boutique vient peut-être d'être créée sur l'appareil : le serveur doit la connaître d'abord.
    await syncNow();
    return (await api<{ code: string }>("/api/invites", { shopId })).code;
  } catch (e) {
    throw new Error(e instanceof ApiError && e.offline ? "Pas de réseau. Réessaie quand tu es connecté." : "Le code n’a pas pu être créé.");
  }
}

export async function acceptInvite(code: string): Promise<string> {
  const session = await getSession();
  if (!isCloudConfigured || !session) throw new Error("Connecte-toi d'abord.");
  let shopId: string;
  try {
    shopId = (await api<{ shopId: string }>("/api/invites/accept", { code })).shopId;
  } catch (e) {
    if (e instanceof ApiError && e.offline) throw new Error("Pas de réseau. Réessaie quand tu es connecté.");
    throw new Error(e instanceof ApiError && e.code === "invalid_invite" ? "Code invalide ou expiré." : "Impossible de rejoindre la boutique.");
  }
  await resetCursors();
  await syncNow();
  await setCurrentShopId(shopId);
  return shopId;
}
