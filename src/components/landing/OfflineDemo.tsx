"use client";

import { Check, Clock, CloudOff, RefreshCw, Wifi } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { quick } from "@/lib/motion";
import { cn } from "@/lib/utils";

// Démo hors ligne : trois signalements faits pendant une coupure attendent dans le téléphone.
// Le visiteur remet le réseau, ils partent un par un.
const ROWS = [
  { name: "KG5", by: "Paul" },
  { name: "Câble Type-C", by: "Marie" },
  { name: "Pochette Itel A100", by: "Paul" },
];

export function OfflineDemo() {
  const [online, setOnline] = useState(false);
  const [sent, setSent] = useState(0);

  useEffect(() => {
    if (!online || sent >= ROWS.length) return;
    const t = window.setTimeout(() => setSent((n) => n + 1), sent === 0 ? 500 : 380);
    return () => clearTimeout(t);
  }, [online, sent]);

  const toggle = () => {
    setOnline((o) => !o);
    setSent(0);
  };

  const pending = ROWS.length - sent;
  let status = { icon: CloudOff, label: `Hors ligne, ${pending} en attente`, tone: "text-flag-text" };
  if (online && pending) status = { icon: RefreshCw, label: "Le réseau revient, envoi…", tone: "text-muted-foreground" };
  else if (online) status = { icon: Check, label: "Tout est envoyé", tone: "text-success-text" };
  const StatusIcon = status.icon;

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="flex min-h-11 flex-wrap items-center justify-between gap-3 border-b p-4 sm:px-5">
        <p className={cn("flex items-center gap-2 text-[15px] font-medium", status.tone)} aria-live="polite">
          <StatusIcon className={cn("size-[18px]", online && pending > 0 && "animate-spin [animation-duration:1.4s]")} aria-hidden />
          {status.label}
        </p>
        <Button variant={online ? "outline" : "default"} size="touch" onClick={toggle}>
          {online ? <CloudOff aria-hidden /> : <Wifi aria-hidden />}
          {online ? "Couper le réseau" : "Remettre le réseau"}
        </Button>
      </div>
      <ul className="divide-y">
        {ROWS.map((r, i) => {
          const done = i < sent;
          return (
            <li key={r.name} className="flex min-h-14 items-center gap-3 px-4 py-2 sm:px-5">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{r.name}</span>
                <span className="block text-sm text-muted-foreground">Signalé par {r.by}</span>
              </span>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={done ? "ok" : "wait"}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1, transition: quick }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.1 } }}
                  className={cn("flex shrink-0 items-center gap-1.5 text-sm font-medium", done ? "text-success-text" : "text-muted-foreground")}
                >
                  {done ? <Check className="size-4" aria-hidden /> : <Clock className="size-4" aria-hidden />}
                  {done ? "Envoyé" : "En attente"}
                </motion.span>
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
