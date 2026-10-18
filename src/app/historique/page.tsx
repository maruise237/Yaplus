"use client";

import { ChevronDown } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { EmptyState, PageHeader } from "@/components/PageHeader";
import { db, type ClosureItem } from "@/lib/db";
import { useCurrentShop, useMembers } from "@/lib/hooks";
import { base } from "@/lib/motion";
import { cn } from "@/lib/utils";

const dateFormat = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const timeFormat = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });

export default function HistoriquePage() {
  const current = useCurrentShop();
  const shopId = current?.shop.id;
  const members = useMembers(shopId);
  const [open, setOpen] = useState<string | null>(null);

  const closures = useLiveQuery(async () => {
    if (!shopId) return [];
    const list = await db.closures.where("shop_id").equals(shopId).toArray();
    const items = await db.closure_items.where("shop_id").equals(shopId).toArray();
    const byClosure = new Map<string, ClosureItem[]>();
    for (const i of items) byClosure.set(i.closure_id, [...(byClosure.get(i.closure_id) ?? []), i]);
    return list.sort((a, b) => b.closed_at.localeCompare(a.closed_at)).map((c) => ({ ...c, items: byClosure.get(c.id) ?? [] }));
  }, [shopId]);

  if (!closures) return null;

  return (
    <>
      <PageHeader title="Historique" />
      {!closures.length ? (
        <EmptyState title="Aucune liste clôturée">Quand le patron clôture une liste, elle est gardée ici avec le détail des achats.</EmptyState>
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border bg-card">
          {closures.map((c) => {
            const bought = c.items.filter((i) => i.bought).length;
            const isOpen = open === c.id;
            const groups = new Map<string, ClosureItem[]>();
            for (const i of c.items) groups.set(i.category_name, [...(groups.get(i.category_name) ?? []), i]);
            const date = new Date(c.closed_at);
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : c.id)}
                  aria-expanded={isOpen}
                  className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/60"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold first-letter:uppercase">{dateFormat.format(date)}</span>
                    <span className="block text-sm text-muted-foreground tabular-nums">
                      {bought} acheté{bought > 1 ? "s" : ""} sur {c.items.length}, par {members?.get(c.closed_by)?.display_name ?? "?"} à {timeFormat.format(date)}
                    </span>
                  </span>
                  <ChevronDown className={cn("size-5 shrink-0 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} aria-hidden />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1, transition: base }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid gap-4 px-4 pt-1 pb-5">
                        {c.shared_to_phone && <p className="text-sm text-muted-foreground tabular-nums">Envoyée au +{c.shared_to_phone}</p>}
                        {[...groups].map(([category, items]) => (
                          <div key={category}>
                            <p className="mb-1.5 text-sm font-semibold">{category || "Sans catégorie"}</p>
                            <ul className="grid gap-1">
                              {items.map((i) => (
                                <li key={i.id} className="flex items-baseline gap-2 text-[15px]">
                                  <span className={cn("w-16 shrink-0 text-sm", i.bought ? "text-success-text" : "text-flag-text")}>
                                    {i.bought ? "Acheté" : "Oublié"}
                                  </span>
                                  <span className="min-w-0">
                                    {i.product_name}
                                    {i.note && <span className="text-muted-foreground"> ({i.note})</span>}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
