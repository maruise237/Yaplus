"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useMemo, useState } from "react";
import { flaggedLabel } from "@/components/ProductRow";
import { ProductSheet } from "@/components/ProductSheet";
import { closeList, setBought, toggleProduct } from "@/lib/actions";
import { getMeta, setMeta, type Product } from "@/lib/db";
import { useCategories, useCurrentShop, useMembers, useProducts } from "@/lib/hooks";
import { buildShareMessage, normalizePhone, whatsappLink } from "@/lib/whatsapp";

export default function ARacheterPage() {
  const current = useCurrentShop();
  const shopId = current?.shop.id;
  const categories = useCategories(shopId);
  const products = useProducts(shopId);
  const members = useMembers(shopId);
  const recentPhones = useLiveQuery(async () => (await getMeta<string[]>("recentPhones")) ?? [], []) ?? [];
  const [phone, setPhone] = useState("");
  const [sharedTo, setSharedTo] = useState<string | null>(null);
  const [sheet, setSheet] = useState<Product | null>(null);
  const [closedMsg, setClosedMsg] = useState<string | null>(null);

  const groups = useMemo(() => {
    const list = products.filter((p) => p.status === "to_buy" || p.status === "bought");
    const byCategory = new Map<string, Product[]>();
    for (const p of list) byCategory.set(p.category_id, [...(byCategory.get(p.category_id) ?? []), p]);
    const ordered = categories.map((c) => ({ id: c.id, name: c.name, items: byCategory.get(c.id) ?? [] }));
    const known = new Set(categories.map((c) => c.id));
    const orphans = list.filter((p) => !known.has(p.category_id));
    if (orphans.length) ordered.push({ id: "_", name: "Sans page", items: orphans });
    for (const g of ordered) {
      // Les oubliés de la dernière fois remontent en haut.
      g.items.sort((a, b) => b.forgotten_count - a.forgotten_count || a.name.localeCompare(b.name, "fr"));
    }
    return ordered.filter((g) => g.items.length);
  }, [products, categories]);

  if (!current || !shopId) return null;

  const all = groups.flatMap((g) => g.items);
  const toBuy = all.filter((p) => p.status === "to_buy");
  const bought = all.filter((p) => p.status === "bought");
  const forgotten = toBuy.filter((p) => p.forgotten_count > 0).length;

  const share = async () => {
    const normalized = phone.trim() ? normalizePhone(phone) : null;
    if (phone.trim() && !normalized) return alert("Numéro invalide");
    const message = buildShareMessage(
      current.shop.name,
      groups.map((g) => ({ category: g.name, items: g.items.filter((p) => p.status === "to_buy") })),
    );
    if (normalized) {
      await setMeta("recentPhones", [normalized, ...recentPhones.filter((p) => p !== normalized)].slice(0, 5));
      setSharedTo(normalized);
    }
    window.open(whatsappLink(message, normalized), "_blank");
  };

  const close = async () => {
    const left = toBuy.length;
    const text = `Clôturer la liste ?\n${bought.length} acheté(s) → en stock\n${left} non coché(s) → restent à racheter`;
    if (!confirm(text)) return;
    await closeList(shopId, sharedTo);
    setClosedMsg(left ? `Liste clôturée. ${left} produit(s) restent, marqués « oublié la dernière fois ».` : "Liste clôturée. Tout est acheté !");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-black">À racheter</h1>
        <span className="text-sm text-muted">
          {toBuy.length} à racheter{bought.length ? ` · ${bought.length} acheté${bought.length > 1 ? "s" : ""}` : ""}
        </span>
      </div>

      {closedMsg && <p className="rounded-2xl bg-ok-soft px-4 py-3 text-ok">{closedMsg}</p>}
      {forgotten > 0 && (
        <p className="rounded-2xl bg-warn-soft px-4 py-3 text-sm text-warn">
          {forgotten} produit{forgotten > 1 ? "s" : ""} oublié{forgotten > 1 ? "s" : ""} la dernière fois, en haut de chaque page.
        </p>
      )}

      {!all.length && <p className="py-12 text-center text-muted">Rien à racheter pour l&apos;instant.</p>}

      {groups.map((g) => (
        <section key={g.id} className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted">{g.name}</h2>
          {g.items.map((p) => {
            const isBought = p.status === "bought";
            return (
              <div key={p.id} className={`flex items-center rounded-2xl border ${isBought ? "border-ok bg-ok-soft" : "border-line bg-surface"}`}>
                <button
                  onClick={() => void setBought(p.id, !isBought)}
                  className="flex min-h-16 min-w-0 flex-1 items-center gap-3 py-3 pl-4 pr-2 text-left"
                  aria-label={isBought ? `Décocher ${p.name}` : `Cocher ${p.name} comme acheté`}
                >
                  <span className={`grid size-7 shrink-0 place-items-center rounded-lg border-2 font-black ${isBought ? "border-ok bg-ok text-white" : "border-line"}`}>
                    {isBought ? "✓" : ""}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-lg font-semibold ${isBought ? "line-through opacity-60" : ""}`}>
                      {p.name}
                      {p.note && <span className="font-normal text-muted"> · {p.note}</span>}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {flaggedLabel(p, members) && <>Signalé par {flaggedLabel(p, members)}</>}
                      {p.forgotten_count > 0 && <span className="font-semibold text-warn"> · oublié la dernière fois</span>}
                    </span>
                  </span>
                </button>
                <button onClick={() => setSheet(p)} className="shrink-0 px-2 text-xl text-muted" aria-label={`Options pour ${p.name}`}>
                  ⋯
                </button>
                {!isBought && (
                  <button onClick={() => void toggleProduct(p.id)} className="shrink-0 pr-4 text-sm text-muted" aria-label={`Retirer ${p.name} de la liste`}>
                    Retirer
                  </button>
                )}
              </div>
            );
          })}
        </section>
      ))}

      {all.length > 0 && (
        <section className="space-y-3 rounded-3xl border border-line bg-surface p-4">
          <h2 className="font-bold">Envoyer la liste sur WhatsApp</h2>
          <input
            className="w-full rounded-xl border border-line bg-bg px-3 py-3 outline-none focus:border-brand"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Numéro du fournisseur (facultatif)"
            inputMode="tel"
          />
          {recentPhones.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recentPhones.map((p) => (
                <button key={p} onClick={() => setPhone(`+${p}`)} className="rounded-full border border-line px-3 py-1.5 text-sm">
                  +{p}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => void share()}
            disabled={!toBuy.length}
            className="w-full rounded-2xl bg-[#25D366] px-4 py-4 font-semibold text-white disabled:opacity-40"
          >
            Ouvrir WhatsApp
          </button>
        </section>
      )}

      {all.length > 0 && current.isOwner && (
        <button onClick={() => void close()} className="w-full rounded-2xl border-2 border-ink px-4 py-4 font-semibold">
          Clôturer la liste
        </button>
      )}

      {sheet && (
        <ProductSheet
          product={products.find((p) => p.id === sheet.id) ?? sheet}
          categories={categories}
          products={products}
          isOwner={current.isOwner}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
}
