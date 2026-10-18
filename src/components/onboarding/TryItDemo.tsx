"use client";

import { MessageCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { StatusMark } from "@/components/ProductRow";
import { listItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

// Démo jouable : on touche ce qui manque, le message WhatsApp se remplit en direct.
// Rien n'est enregistré ; c'est le même geste que dans le vrai cahier.
const SAMPLE = [
  { id: "kg5", name: "KG5", category: "Afficheurs" },
  { id: "pochette", name: "Pochette Itel A100", category: "Pochettes" },
  { id: "chargeur", name: "Chargeur Type-C 18 W", category: "Chargeurs" },
];

export function TryItDemo({ shopName = "Boutique Akwa" }: { shopName?: string }) {
  const [flagged, setFlagged] = useState<Set<string>>(() => new Set(["kg5"]));

  const toggle = (id: string) =>
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const groups = SAMPLE.filter((p) => flagged.has(p.id)).reduce<Record<string, string[]>>((acc, p) => {
    (acc[p.category] ??= []).push(p.name);
    return acc;
  }, {});

  return (
    <div className="grid gap-3">
      <p className="text-[15px] font-medium">Essaie : touche ce qui manque.</p>

      <ul className="relative divide-y overflow-hidden rounded-xl border bg-card before:pointer-events-none before:absolute before:inset-y-0 before:left-12 before:z-10 before:w-px before:bg-flag/35">
        {SAMPLE.map((p) => {
          const on = flagged.has(p.id);
          return (
            <li key={p.id}>
              <motion.button
                type="button"
                whileTap={{ scale: 0.985 }}
                onClick={() => toggle(p.id)}
                aria-pressed={on}
                className={cn(
                  "flex min-h-14 w-full items-center py-2 pr-4 text-left transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  on ? "bg-flag-subtle" : "hover:bg-accent/50",
                )}
              >
                <span className="grid w-12 shrink-0 place-items-center">
                  <StatusMark status={on ? "to_buy" : "in_stock"} />
                </span>
                <span className="min-w-0 flex-1 pl-3">
                  <span className="block truncate font-medium">{p.name}</span>
                  <span className={cn("block text-sm", on ? "text-flag-text" : "text-muted-foreground")}>
                    {on ? "Signalé par Paul" : "En stock"}
                  </span>
                </span>
              </motion.button>
            </li>
          );
        })}
      </ul>

      {/* Ce que reçoit le fournisseur */}
      <div className="grid gap-1.5 pt-1" aria-live="polite">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MessageCircle className="size-4" aria-hidden />
          Ce que reçoit ton fournisseur sur WhatsApp
        </p>
        <div className="max-w-[88%] rounded-xl rounded-tl-sm bg-card px-3.5 pt-2.5 pb-2 shadow-[0_1px_2px_rgb(0_0_0/0.08)]">
          <p className="text-[15px] leading-relaxed">
            <strong className="font-semibold">{shopName}</strong>, à racheter
          </p>
          <AnimatePresence initial={false}>
            {Object.keys(groups).length === 0 ? (
              <motion.p key="vide" {...listItem} className="overflow-hidden text-[15px] leading-relaxed text-muted-foreground">
                Rien ne manque pour l’instant.
              </motion.p>
            ) : (
              Object.entries(groups).map(([category, names]) => (
                <motion.div key={category} {...listItem} className="overflow-hidden">
                  <p className="pt-1.5 text-[15px] leading-relaxed font-semibold">{category}</p>
                  {names.map((n) => (
                    <p key={n} className="text-[15px] leading-relaxed">
                      - {n}
                    </p>
                  ))}
                </motion.div>
              ))
            )}
          </AnimatePresence>
          <p className="mt-0.5 text-right text-xs text-muted-foreground tabular-nums">18:02</p>
        </div>
      </div>
    </div>
  );
}
