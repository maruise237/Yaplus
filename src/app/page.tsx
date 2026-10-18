"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState, PageHeader } from "@/components/PageHeader";
import { ProductSearch } from "@/components/ProductSearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCategory } from "@/lib/actions";
import { useCategories, useCurrentShop, useProducts } from "@/lib/hooks";
import { cn } from "@/lib/utils";

// L'app s'ouvre directement sur les catégories du cahier.
export default function CahierPage() {
  const current = useCurrentShop();
  const shopId = current?.shop.id;
  const categories = useCategories(shopId);
  const products = useProducts(shopId);
  const [adding, setAdding] = useState(false);

  const stats = useMemo(() => {
    const map = new Map<string, { total: number; toBuy: number }>();
    for (const p of products) {
      const s = map.get(p.category_id) ?? { total: 0, toBuy: 0 };
      s.total++;
      if (p.status === "to_buy") s.toBuy++;
      map.set(p.category_id, s);
    }
    return map;
  }, [products]);

  if (!shopId) return null;

  return (
    <>
      <PageHeader title="Cahier" />
      <ProductSearch shopId={shopId} products={products} categories={categories} />

      <div className="mt-6">
        {categories.length === 0 ? (
          <EmptyState
            title="Aucune catégorie"
            action={
              <Button size="touch" onClick={() => setAdding(true)}>
                <Plus aria-hidden />
                Nouvelle catégorie
              </Button>
            }
          >
            Commence par les rayons de la boutique : Afficheurs, Batteries, Accessoires…
          </EmptyState>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => {
              const s = stats.get(c.id) ?? { total: 0, toBuy: 0 };
              return (
                <li key={c.id}>
                  <Link
                    href={`/categorie?id=${c.id}`}
                    className="flex h-24 flex-col justify-between rounded-xl border bg-card p-4 transition-[border-color,background-color] duration-150 hover:border-input focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none active:bg-accent"
                  >
                    <span className="line-clamp-2 text-[17px] leading-snug font-semibold">{c.name}</span>
                    {s.toBuy > 0 ? (
                      <span className="text-sm font-medium text-flag-text tabular-nums">{s.toBuy} à racheter</span>
                    ) : (
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {s.total === 0 ? "Vide" : `${s.total} produit${s.total > 1 ? "s" : ""}`}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
            <li className={cn(adding && "col-span-2")}>
              {adding ? (
                <NewCategoryTile onCreate={(name) => void createCategory(shopId, name)} onDone={() => setAdding(false)} />
              ) : (
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className="flex h-24 w-full flex-col items-start justify-between rounded-xl border border-dashed border-input p-4 text-left text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Plus className="size-5" aria-hidden />
                  <span className="text-[15px] font-medium">Nouvelle catégorie</span>
                </button>
              )}
            </li>
          </ul>
        )}
      </div>

      {categories.length === 0 && adding && (
        <div className="mt-3">
          <NewCategoryTile onCreate={(name) => void createCategory(shopId, name)} onDone={() => setAdding(false)} />
        </div>
      )}
    </>
  );
}

function NewCategoryTile({ onCreate, onDone }: { onCreate: (name: string) => void; onDone: () => void }) {
  const [name, setName] = useState("");
  return (
    <form
      className="flex h-24 flex-col justify-center rounded-xl border border-dashed border-input bg-card p-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim()) onCreate(name.trim());
        onDone();
      }}
    >
      <label htmlFor="new-category" className="sr-only">
        Nom de la catégorie
      </label>
      <div className="flex gap-2">
        <Input
          id="new-category"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && onDone()}
          onBlur={() => !name.trim() && onDone()}
          placeholder="Nom de la catégorie…"
          autoComplete="off"
          // Ouvert par un tap explicite : le focus suit l'intention.
          autoFocus
        />
        <Button type="submit" size="touch">
          Créer
        </Button>
      </div>
    </form>
  );
}
