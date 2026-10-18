"use client";

import { useFailedCount, useOnline, usePendingCount, useSession, useSyncState } from "@/lib/hooks";
import { syncNow } from "@/lib/sync";

export function SyncBadge() {
  const session = useSession();
  const online = useOnline();
  const pending = usePendingCount();
  const failed = useFailedCount();
  const { syncing } = useSyncState();

  if (session?.mode === "local") {
    return <span className="rounded-full bg-line px-3 py-1 text-xs text-muted">Sur cet appareil</span>;
  }

  let label = "À jour";
  let tone = "bg-ok-soft text-ok";
  if (failed) {
    label = `${failed} refusé${failed > 1 ? "s" : ""}`;
    tone = "bg-brand-soft text-brand";
  } else if (!online) {
    label = pending ? `Hors-ligne · ${pending} en attente` : "Hors-ligne";
    tone = "bg-warn-soft text-warn";
  } else if (pending || syncing) {
    label = pending ? `${pending} en attente de synchro` : "Synchro…";
    tone = "bg-warn-soft text-warn";
  }

  return (
    <button onClick={() => void syncNow()} className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${tone}`}>
      {label}
    </button>
  );
}
