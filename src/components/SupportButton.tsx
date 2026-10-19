"use client";

import { Headset } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { SupportCenter } from "@/components/SupportCenter";
import { base } from "@/lib/motion";
import { supportUnread } from "@/lib/support";

// Bouton d'aide de l'en-tête. À chaque arrivée sur le Cahier (`announce`), il s'allonge
// un moment pour dire ce qu'il fait, puis redevient une simple icône.
// Sur grand écran (`side`), une ligne de la barre latérale, sans animation.
export function SupportButton({ name, shopId, announce = false, side = false }: { name: string; shopId: string; announce?: boolean; side?: boolean }) {
  const [open, setOpen] = useState(false);
  const [wide, setWide] = useState(false);
  const reduce = useReducedMotion();
  const unread = useSyncExternalStore(supportUnread.subscribe, supportUnread.get, () => false);

  useEffect(() => {
    if (!announce || reduce) return;
    const show = setTimeout(() => setWide(true), 1000);
    const hide = setTimeout(() => setWide(false), 4000);
    return () => (clearTimeout(show), clearTimeout(hide), setWide(false));
  }, [announce, reduce]);

  const center = <SupportCenter open={open} onOpenChange={setOpen} name={name} shopId={shopId} />;

  if (side) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
        >
          <Headset className="size-[18px]" strokeWidth={1.75} aria-hidden />
          <span className="flex-1 text-left">Aide et support</span>
          {unread && <span className="size-2 rounded-full bg-primary" aria-label="Le support t’a répondu" />}
        </button>
        {center}
      </>
    );
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        initial={false}
        animate={{ width: wide ? "auto" : 44 }}
        transition={base}
        className="relative flex h-11 shrink-0 items-center overflow-hidden rounded-full bg-primary text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label={unread ? "Aide et support, le support t’a répondu" : "Aide et support"}
      >
        <span className="grid size-11 shrink-0 place-items-center">
          <Headset className="size-5" aria-hidden />
        </span>
        <motion.span initial={false} animate={{ opacity: wide ? 1 : 0 }} transition={base} className="pr-4 text-[15px] font-medium whitespace-nowrap" aria-hidden>
          Besoin d’aide ?
        </motion.span>
        {unread && <span className="absolute top-1.5 right-1.5 size-2.5 rounded-full bg-background ring-2 ring-primary" />}
      </motion.button>
      {center}
    </>
  );
}
