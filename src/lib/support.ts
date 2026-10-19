import { api, ApiError } from "./cloud";
import { normalizePhone, whatsappLink } from "./whatsapp";

export const SUPPORT_MAX_LENGTH = 1000;

export type SupportMessage = { id: string; fromAdmin: boolean; body: string; at: string };

// Message prérempli de « Mot de passe oublié ». Le support vérifie que WhatsApp l'envoie bien
// depuis ce numéro avant de créer un lien, qui partira sur ce même numéro.
export function forgotPasswordLink(support: string | null, phone: string): string | null {
  if (!support) return null;
  const digits = normalizePhone(phone);
  const lines = ["Bonjour Yaplus, j’ai oublié mon mot de passe."];
  if (digits) lines.push(`Mon numéro de compte : +${digits}`);
  return whatsappLink(lines.join("\n"), support);
}

export type SupportThread = { messages: SupportMessage[]; unread: boolean };

// `seen` : la conversation est à l'écran, la réponse du support est lue.
export async function loadSupport(seen = false): Promise<SupportThread> {
  return api<SupportThread>("/api/support", { seen });
}

export async function sendSupport(body: string, shopId: string): Promise<SupportThread> {
  try {
    return await api<SupportThread>("/api/support/send", { body, shopId });
  } catch (e) {
    if (e instanceof ApiError && e.offline) throw new Error("Pas de réseau. Ton message n’est pas parti, réessaie plus tard.");
    if (e instanceof ApiError && e.code === "too_many_messages") throw new Error("Beaucoup de messages en peu de temps. Attends un peu avant d’en envoyer d’autres.");
    throw new Error("Le message n’est pas parti. Réessaie dans un instant.");
  }
}
