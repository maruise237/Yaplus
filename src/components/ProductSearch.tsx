"use client";

import { useMemo, useState } from "react";
import { createProduct, toggleProduct } from "@/lib/actions";
import type { Category, Product } from "@/lib/db";
import { findSimilar, normalizeName } from "@/lib/text";

// Champ unique pour retrouver un produit ou le créer sur place.
// Avant toute création, l'app propose les produits proches : l'utilisateur décide, jamais de fusion auto.
export function ProductSearch({
  shopId,
  products,
  categories,
  categoryId,
  placeholder = "Chercher ou ajouter un produit…",
}: {
  shopId: string;
  products: Product[];
  categories: Category[];
  categoryId?: string;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [pickCategory, setPickCategory] = useState(false);
  const categoryNames = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const matches = useMemo(() => (query.trim() ? findSimilar(query, products, 6) : []), [query, products]);
  const exact = matches.find((p) => p.name_normalized === normalizeName(query));

  // On vide le champ tout de suite : l'employé peut enchaîner sans attendre l'écriture.
  const flag = async (product: Product) => {
    setQuery("");
    if (product.status !== "to_buy") await toggleProduct(product.id);
  };

  const create = async (targetCategory: string) => {
    const name = query;
    setQuery("");
    setPickCategory(false);
    await createProduct(shopId, targetCategory, name);
  };

  return (
    <div className="space-y-2">
      <input
        className="w-full rounded-2xl border border-line bg-surface px-4 py-3.5 text-base outline-none focus:border-brand"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPickCategory(false);
        }}
        placeholder={placeholder}
        enterKeyHint="done"
      />

      {query.trim() && (
        <div className="space-y-2 rounded-2xl border border-line bg-surface p-2">
          {matches.length > 0 && !exact && (
            <p className="px-2 pt-1 text-sm text-muted">
              <strong className="text-ink">{matches[0].name}</strong> existe déjà, c&apos;est lui ?
            </p>
          )}
          {matches.map((p) => (
            <button
              key={p.id}
              onClick={() => void flag(p)}
              className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-3 text-left hover:bg-bg"
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold">{p.name}</span>
                <span className="block truncate text-xs text-muted">{categoryNames.get(p.category_id)}</span>
              </span>
              <span className={`shrink-0 text-sm font-medium ${p.status === "to_buy" ? "text-muted" : "text-brand"}`}>
                {p.status === "to_buy" ? "déjà signalé" : "Y'a plus"}
              </span>
            </button>
          ))}

          {!exact &&
            (pickCategory || !categoryId ? (
              <div className="space-y-1 px-1 pb-1">
                <p className="px-2 pt-1 text-sm text-muted">Ranger « {query.trim()} » dans :</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <button key={c.id} onClick={() => void create(c.id)} className="rounded-full border border-line px-3 py-2 text-sm">
                      {c.name}
                    </button>
                  ))}
                  {!categories.length && <p className="px-2 text-sm text-muted">Crée d&apos;abord une catégorie.</p>}
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => void create(categoryId)} className="flex-1 rounded-xl bg-brand px-3 py-3 font-semibold text-brand-ink">
                  + Créer « {query.trim()} »
                </button>
                <button onClick={() => setPickCategory(true)} className="rounded-xl border border-line px-3 text-sm text-muted">
                  Autre page
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
