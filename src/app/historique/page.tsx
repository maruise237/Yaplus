"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { db, type ClosureItem } from "@/lib/db";
import { useCurrentShop, useMembers } from "@/lib/hooks";

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
    return list
      .sort((a, b) => b.closed_at.localeCompare(a.closed_at))
      .map((c) => ({ ...c, items: byClosure.get(c.id) ?? [] }));
  }, [shopId]);

  if (!closures) return null;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Historique</h1>
      {!closures.length && <p className="py-12 text-center text-muted">Aucune liste clôturée pour l&apos;instant.</p>}
      {closures.map((c) => {
        const bought = c.items.filter((i) => i.bought).length;
        const isOpen = open === c.id;
        const groups = new Map<string, ClosureItem[]>();
        for (const i of c.items) groups.set(i.category_name, [...(groups.get(i.category_name) ?? []), i]);
        return (
          <div key={c.id} className="rounded-2xl border border-line bg-surface">
            <button onClick={() => setOpen(isOpen ? null : c.id)} className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left">
              <span>
                <span className="block font-semibold">
                  {new Date(c.closed_at).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                </span>
                <span className="block text-sm text-muted">
                  {members?.get(c.closed_by)?.display_name ?? "?"} · {bought}/{c.items.length} acheté{bought > 1 ? "s" : ""}
                  {c.shared_to_phone && <> · envoyé au +{c.shared_to_phone}</>}
                </span>
              </span>
              <span className="text-muted">{isOpen ? "▲" : "▼"}</span>
            </button>
            {isOpen && (
              <div className="space-y-3 border-t border-line px-4 py-3">
                {[...groups].map(([category, items]) => (
                  <div key={category}>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted">{category || "Sans page"}</p>
                    {items.map((i) => (
                      <p key={i.id} className={i.bought ? "" : "text-warn"}>
                        {i.bought ? "✓" : "✗"} {i.product_name}
                        {i.note && <span className="text-muted"> · {i.note}</span>}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
