import { onLocalChange } from "./actions";
import { api, ApiError, isCloudConfigured } from "./cloud";
import { db, getMeta, setMeta, SYNCED_TABLES, type SyncedTable } from "./db";
import { getSession } from "./session";

// Synchro produit par produit, événement par événement, jamais la liste entière.
// 1. push : on vide l'outbox dans l'ordre.
// 2. pull : on récupère ce qui a changé côté serveur depuis le dernier curseur (synced_at).

const BATCH = 50;

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

type PushResult = { ok: true } | { ok: false; error: string };

export async function pushOutbox(): Promise<void> {
  for (;;) {
    const batch = await db.outbox.orderBy("seq").filter((e) => !e.error).limit(BATCH).toArray();
    if (!batch.length) return;

    let results: PushResult[];
    try {
      ({ results } = await api<{ results: PushResult[] }>("/api/sync/push", {
        entries: batch.map((e) => ({ table: e.table, row: e.row })),
      }));
    } catch (e) {
      await db.outbox.bulkUpdate(batch.map((entry) => ({ key: entry.seq!, changes: { attempts: entry.attempts + 1 } })));
      throw e;
    }

    await db.transaction("rw", db.outbox, async () => {
      for (const [i, entry] of batch.entries()) {
        const result = results[i];
        if (result?.ok) await db.outbox.delete(entry.seq!);
        // Refus du serveur (droits, contrainte) : on garde l'action, marquée, sans bloquer la file.
        else await db.outbox.update(entry.seq!, { attempts: entry.attempts + 1, error: result?.error ?? "no_result" });
      }
    });
  }
}

function localKey(table: SyncedTable, row: Record<string, unknown>) {
  return table === "shop_members" ? [row.shop_id, row.user_id] : row.id;
}

export async function pullChanges(): Promise<void> {
  let pending = [...SYNCED_TABLES];
  while (pending.length) {
    const cursors: Record<string, string | undefined> = {};
    for (const table of pending) cursors[table] = await getMeta<string>(`cursor:${table}`);
    const { tables, page } = await api<{ tables: Partial<Record<SyncedTable, Record<string, unknown>[]>>; page: number }>(
      "/api/sync/pull",
      { cursors },
    );

    const next: SyncedTable[] = [];
    // Les parents avant les enfants, comme à l'envoi.
    for (const table of pending) {
      const rows = tables[table] ?? [];
      if (!rows.length) continue;
      await db.transaction("rw", db.table(table), async () => {
        for (const row of rows) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const local = await db.table(table).get(localKey(table, row) as any);
          // Une modification locale plus récente, pas encore envoyée, gagne.
          if (local && String(local.updated_at) > String(row.updated_at)) continue;
          await db.table(table).put(row);
        }
      });
      const last = String(rows[rows.length - 1].synced_at);
      await setMeta(`cursor:${table}`, last);
      if (rows.length >= page && last !== cursors[table]) next.push(table);
    }
    pending = next;
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
    const session = await getSession();
    if (!isCloudConfigured || session?.mode !== "cloud") return;

    setState({ syncing: true });
    try {
      do {
        again = false;
        await pushOutbox();
        await pullChanges();
      } while (again);
      setState({ lastSyncAt: new Date().toISOString(), lastError: null });
    } catch (e) {
      setState({ lastError: e instanceof ApiError && e.offline ? "offline" : e instanceof Error ? e.message : String(e) });
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
// et une relève régulière tant que l'app est à l'écran (le patron voit les signalements arriver).
const POLL_MS = 15_000;

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
  // Écran éteint ou app en arrière-plan : pas de relève, pas de données consommées.
  const interval = setInterval(() => document.visibilityState === "visible" && navigator.onLine && soon(), POLL_MS);

  soon();

  return () => {
    started = false;
    offLocal();
    window.removeEventListener("online", soon);
    document.removeEventListener("visibilitychange", onVisible);
    clearInterval(interval);
  };
}
