"use client";

import { CloudOff, RefreshCw, Smartphone, TriangleAlert, Check } from "lucide-react";
import { useFailedCount, useOnline, usePendingCount, useSession, useSyncState } from "@/lib/hooks";
import { syncNow } from "@/lib/sync";
import { cn } from "@/lib/utils";

// État de synchro : discret quand tout va bien, explicite quand quelque chose attend.
export function SyncStatus({ compact = false }: { compact?: boolean }) {
  const session = useSession();
  const online = useOnline();
  const pending = usePendingCount();
  const failed = useFailedCount();
  const { syncing } = useSyncState();

  let Icon = Check;
  let label = "Synchronisé";
  let tone = "text-muted-foreground";

  if (session?.mode === "local") {
    Icon = Smartphone;
    label = "Sur cet appareil";
  } else if (failed) {
    Icon = TriangleAlert;
    label = `${failed} action${failed > 1 ? "s" : ""} refusée${failed > 1 ? "s" : ""}`;
    tone = "text-destructive";
  } else if (!online) {
    Icon = CloudOff;
    label = pending ? `Hors ligne · ${pending} en attente` : "Hors ligne";
    tone = "text-flag-text";
  } else if (pending || syncing) {
    Icon = RefreshCw;
    label = pending ? `${pending} en attente` : "Synchronisation…";
  }

  return (
    <button
      type="button"
      onClick={() => void syncNow()}
      disabled={session?.mode === "local"}
      className={cn(
        "flex h-9 min-w-0 items-center gap-1.5 rounded-lg text-xs font-medium disabled:cursor-default",
        compact ? "-mr-2 px-2" : "w-full px-2 hover:bg-secondary",
        tone,
      )}
      aria-live="polite"
    >
      <Icon className={cn("size-4 shrink-0", syncing && Icon === RefreshCw && "animate-spin [animation-duration:1.4s]")} aria-hidden />
      <span className={cn("truncate", compact && !pending && !failed && online && "sr-only")}>{label}</span>
    </button>
  );
}
