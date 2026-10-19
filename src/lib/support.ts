import { api, ApiError } from "./cloud";
import { normalizePhone, whatsappLink } from "./whatsapp";

export const SUPPORT_MAX_LENGTH = 1000;

export type SupportMessage = { id: string; fromAdmin: boolean; body: string; at: string; topic: SupportTopic | null };

// Sujets choisis en un tap avant d'écrire : moins à taper, et le support trie plus vite.
export const SUPPORT_TOPICS = {
  team: "Mon équipe",
  products: "Mes produits",
  password: "Mot de passe",
  bug: "Un problème",
  idea: "Une idée",
  other: "Autre chose",
} as const;
export type SupportTopic = keyof typeof SUPPORT_TOPICS;
export const isSupportTopic = (t: unknown): t is SupportTopic => typeof t === "string" && Object.hasOwn(SUPPORT_TOPICS, t);

// Réponses toutes prêtes, lisibles sans réseau. Les mots sont ceux des écrans de l'app.
export const FAQ = [
  {
    q: "Comment ajouter un employé ?",
    a: "Va dans Boutique, puis Équipe, et touche Inviter. Envoie le lien sur WhatsApp à ton employé : il l’ouvre, choisit son mot de passe et voit le cahier tout de suite.",
  },
  {
    q: "Comment noter qu’un produit est fini ?",
    a: "Dans le Cahier, touche le produit : il passe en rouge et part dans À racheter. Tu t’es trompé ? Touche Annuler juste après, ou touche le produit encore une fois.",
  },
  {
    q: "Ça marche sans réseau ?",
    a: "Oui. Tu notes comme d’habitude, tout reste dans le téléphone. Dès que le réseau revient, Yaplus envoie tout seul, et l’équipe le voit.",
  },
  {
    q: "Comment vider la liste après les courses ?",
    a: "Le patron ouvre À racheter et touche Clôturer la liste. Les produits reviennent en stock et la liste est gardée dans Historique.",
  },
  {
    q: "J’ai oublié mon mot de passe",
    a: "Sur l’écran de connexion, touche Mot de passe oublié. Tu écris au support sur WhatsApp, et on t’envoie un lien pour en choisir un nouveau. Il marche une seule fois.",
  },
  {
    q: "J’ai plusieurs boutiques",
    a: "Va dans Boutique et touche Ajouter une boutique. Chaque boutique a son cahier et son équipe, et tu vois ce qui manque partout au même endroit.",
  },
] as const;

// Message prérempli de « Mot de passe oublié ». Le support vérifie que WhatsApp l'envoie bien
// depuis ce numéro avant de créer un lien, qui partira sur ce même numéro.
export function forgotPasswordLink(support: string | null, phone: string): string | null {
  if (!support) return null;
  const digits = normalizePhone(phone);
  const lines = ["Bonjour Yaplus, j’ai oublié mon mot de passe."];
  if (digits) lines.push(`Mon numéro de compte : +${digits}`);
  return whatsappLink(lines.join("\n"), support);
}

export type SupportThread = { messages: SupportMessage[]; unread: boolean; closedAt: string | null };

// Réponse du support pas encore lue : un point sur l'onglet Boutique et dans Aide.
let unread = false;
const listeners = new Set<() => void>();
const setUnread = (value: boolean) => {
  if (value === unread) return;
  unread = value;
  listeners.forEach((l) => l());
};
export const supportUnread = {
  subscribe: (l: () => void) => (listeners.add(l), () => void listeners.delete(l)),
  get: () => unread,
};

// `seen` : la conversation est à l'écran, la réponse du support est lue.
export async function loadSupport(seen = false): Promise<SupportThread> {
  const thread = await api<SupportThread>("/api/support", { seen });
  setUnread(thread.unread);
  return thread;
}

export async function sendSupport(body: string, shopId: string, topic: SupportTopic | null): Promise<SupportThread> {
  try {
    return await api<SupportThread>("/api/support/send", { body, shopId, topic });
  } catch (e) {
    if (e instanceof ApiError && e.offline) throw new Error("Pas de réseau. Ton message n’est pas parti, réessaie plus tard.");
    if (e instanceof ApiError && e.code === "too_many_messages") throw new Error("Beaucoup de messages en peu de temps. Attends un peu avant d’en envoyer d’autres.");
    throw new Error("Le message n’est pas parti. Réessaie dans un instant.");
  }
}
