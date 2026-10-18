import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { db, getMeta, setMeta, SYNCED_TABLES, type SyncedTable } from "./db";
import { onLocalChange } from "./actions";
import { getSession } from "./session";
import { getSupabase } from "./supabase";

// Synchro produit par produit, événement par événement, jamais la liste entière.
// 1. push : on vide l'outbox dans l'ordre.
// 2. pull : on récupère ce qui a changé côté serveur depuis le dernier curseur (synced_at).

const PRIMARY_KEYS: Record<SyncedTable, string> = {
  shops: "id",
  shop_members: "shop_id,user_id",
  categories: "id",
  products: "id",
  product_events: "id",
  closures: "id",
  closure_items: "id",
};

// Tables en ajout seul : un doublon (renvoi après coupure) est simplement ignoré.
const APPEND_ONLY = new Set<SyncedTable>(["product_events", "closures", "closure_items"]);

const PAGE = 500;

export type SyncState = { syncing: boolean; lastSyncAt: string | null; lastError: string | null };

let state: SyncState = { syncing: false, lastSyncAt: null, lastError: null };
const subscribers = new Set<() => void>();

export const syncStore = {
  get: () => state,
  subscribe(fn: () => void) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  },
};

function setState(patch: Partial<SyncState>) {
  state = { ...state, ...patch };
  subscribers.forEach((fn) => fn());
}

function isNetworkError(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  if (typeof navigator !== "undefined" && !navigator.onLine) return true;
  return !error.code || /fetch|network|timeout/i.test(error.message ?? "");
}

export async function pushOutbox(client: SupabaseClient): Promise<void> {
  for (;;) {
    const batch = await db.outbox.orderBy("seq").filter((e) => !e.error).limit(50).toArray();
    if (!batch.length) return;

    for (const entry of batch) {
      const query = client.from(entry.table).upsert(entry.row, {
        onConflict: PRIMARY_KEYS[entry.table],
        ignoreDuplicates: APPEND_ONLY.has(entry.table),
      });
      const { error } = await query;
      if (error && isNetworkError(error)) {
        await db.outbox.update(entry.seq!, { attempts: entry.attempts + 1 });
        throw new Error("offline");
      }
      if (error) {
        // Refus du serveur (droits, contrainte) : on garde l'action, marquée, sans bloquer la file.
        await db.outbox.update(entry.seq!, { attempts: entry.attempts + 1, error: error.message });
        continue;
      }
      await db.outbox.delete(entry.seq!);
    }
  }
}

function localKey(table: SyncedTable, row: Record<string, unknown>) {
  return table === "shop_members" ? [row.shop_id, row.user_id] : row.id;
}

export async function pullChanges(client: SupabaseClient): Promise<void> {
  for (const table of SYNCED_TABLES) {
    const cursorKey = `cursor:${table}`;
    let cursor = await getMeta<string>(cursorKey);
    for (;;) {
      let query = client.from(table).select("*").order("synced_at", { ascending: true }).limit(PAGE);
      if (cursor) query = query.gte("synced_at", cursor);
      const { data, error } = await query;
      if (error) throw new Error(isNetworkError(error) ? "offline" : error.message);
      if (!data.length) break;

      await db.transaction("rw", db.table(table), async () => {
        for (const row of data as Record<string, unknown>[]) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const local = await db.table(table).get(localKey(table, row) as any);
          // Une modification locale plus récente, pas encore envoyée, gagne.
          if (local && String(local.updated_at) > String(row.updated_at)) continue;
          await db.table(table).put(row);
        }
      });

      const last = String(data[data.length - 1].synced_at);
      await setMeta(cursorKey, last);
      if (data.length < PAGE || last === cursor) break;
      cursor = last;
    }
  }
}

// Après avoir rejoint une boutique, on relit tout : les curseurs ne couvrent pas son passé.
export async function resetCursors(): Promise<void> {
  await db.meta.where("key").startsWith("cursor:").delete();
}

let running: Promise<void> | null = null;
let again = false;

export function syncNow(): Promise<void> {
  if (running) {
    again = true;
    return running;
  }
  running = (async () => {
    const client = getSupabase();
    const session = await getSession();
    if (!client || session?.mode !== "cloud") return;
    const { data } = await client.auth.getSession();
    if (!data.session) return;

    setState({ syncing: true });
    try {
      do {
        again = false;
        await pushOutbox(client);
        await pullChanges(client);
      } while (again);
      setState({ lastSyncAt: new Date().toISOString(), lastError: null });
    } catch (e) {
      setState({ lastError: e instanceof Error ? e.message : String(e) });
    } finally {
      setState({ syncing: false });
    }
  })().finally(() => {
    running = null;
  });
  return running;
}

let started = false;

// Démarre la synchro automatique : changement local, retour du réseau, retour sur l'app,
// temps réel Supabase, et un filet de sécurité toutes les 30 secondes.
export function startSync(): () => void {
  if (started || typeof window === "undefined") return () => {};
  started = true;

  let timer: ReturnType<typeof setTimeout> | null = null;
  const soon = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void syncNow(), 300);
  };

  const offLocal = onLocalChange(soon);
  const onVisible = () => document.visibilityState === "visible" && soon();
  window.addEventListener("online", soon);
  document.addEventListener("visibilitychange", onVisible);
  const interval = setInterval(soon, 30_000);

  let channel: RealtimeChannel | null = null;
  const client = getSupabase();
  if (client) {
    channel = client.channel("yaplus-shop");
    for (const table of ["products", "categories", "shop_members", "closures"]) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, soon);
    }
    channel.subscribe();
  }

  soon();

  return () => {
    started = false;
    offLocal();
    window.removeEventListener("online", soon);
    document.removeEventListener("visibilitychange", onVisible);
    clearInterval(interval);
    if (channel) void client?.removeChannel(channel);
  };
}
