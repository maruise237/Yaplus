"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductSearch } from "@/components/ProductSearch";
import { createCategory } from "@/lib/actions";
import { useCategories, useCurrentShop, useProducts } from "@/lib/hooks";

// L'app s'ouvre directement sur la grille des catégories.
export default function CahierPage() {
  const current = useCurrentShop();
  const shopId = current?.shop.id;
  const categories = useCategories(shopId);
  const products = useProducts(shopId);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) if (p.status === "to_buy") map.set(p.category_id, (map.get(p.category_id) ?? 0) + 1);
    return map;
  }, [products]);

  if (!shopId) return null;

  const addCategory = async () => {
    if (newName.trim()) await createCategory(shopId, newName);
    setNewName("");
    setAdding(false);
  };

  return (
    <div className="space-y-5">
      <ProductSearch shopId={shopId} products={products} categories={categories} />

      <div className="grid grid-cols-2 gap-3">
        {categories.map((c) => {
          const n = counts.get(c.id) ?? 0;
          return (
            <Link
              key={c.id}
              href={`/categorie?id=${c.id}`}
              className={`relative flex min-h-24 items-end rounded-3xl border p-4 text-lg font-bold leading-tight ${
                n ? "border-brand bg-brand-soft" : "border-line bg-surface"
              }`}
            >
              {c.name}
              {n > 0 && (
                <span className="absolute right-3 top-3 grid min-w-7 place-items-center rounded-full bg-brand px-2 py-0.5 text-sm text-brand-ink">
                  {n}
                </span>
              )}
            </Link>
          );
        })}

        {adding ? (
          <form className="col-span-2 flex gap-2" onSubmit={(e) => (e.preventDefault(), addCategory())}>
            <input
              className="flex-1 rounded-2xl border border-line bg-surface px-4 py-3 outline-none focus:border-brand"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom de la page (ex. Afficheurs)"
              autoFocus
            />
            <button className="rounded-2xl bg-brand px-4 font-semibold text-brand-ink">OK</button>
          </form>
        ) : (
          <button onClick={() => setAdding(true)} className="min-h-24 rounded-3xl border-2 border-dashed border-line text-muted">
            + Catégorie
          </button>
        )}
      </div>
    </div>
  );
}
