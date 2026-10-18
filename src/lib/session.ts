import { db, getMeta, setMeta } from "./db";

export type Session = {
  userId: string;
  displayName: string;
  phone: string | null;
  // "local" : pas de Supabase configuré, tout reste sur l'appareil (démo, tests terrain).
  mode: "local" | "cloud";
};

export async function getSession(): Promise<Session | undefined> {
  return getMeta<Session>("session");
}

export async function saveSession(session: Session): Promise<void> {
  await setMeta("session", session);
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) throw new Error("not_signed_in");
  return session;
}

export async function getCurrentShopId(): Promise<string | undefined> {
  return getMeta<string>("currentShopId");
}

export async function setCurrentShopId(shopId: string): Promise<void> {
  await setMeta("currentShopId", shopId);
}

export async function signOutLocal(): Promise<void> {
  await db.delete();
  await db.open();
}
