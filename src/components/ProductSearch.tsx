"use client";

import { Plus, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createProduct, toggleProduct } from "@/lib/actions";
import type { Category, Product } from "@/lib/db";
import { findSimilar, normalizeName } from "@/lib/text";
import { cn } from "@/lib/utils";

// Un seul champ pour retrouver un produit ou le créer sur place.
// S'il existe déjà quelque chose de proche, on le propose d'abord : la création passe au second plan.
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
  const categoryNames = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const trimmed = query.trim();
  const matches = useMemo(() => (trimmed ? findSimilar(trimmed, products, 5) : []), [trimmed, products]);
  const exact = matches.some((p) => p.name_normalized === normalizeName(trimmed));
  const needsPage = !categoryId;

  const reset = () => {
    setQuery("");
  };

  // On vide le champ tout de suite : l'employé peut enchaîner sans attendre l'écriture.
  const flag = async (product: Product) => {
    reset();
    if (product.status === "to_buy") return;
    await toggleProduct(product.id);
    toast(`${product.name} ajouté à la liste`, { id: "toggle", action: { label: "Annuler", onClick: () => void toggleProduct(product.id) } });
  };

  const create = async (targetCategory: string) => {
    const name = trimmed;
    reset();
    await createProduct(shopId, targetCategory, name);
    toast(`${name} créé et ajouté à la liste`, { id: "toggle" });
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
                  }}
          onKeyDown={(e) => e.key === "Escape" && reset()}
          placeholder={placeholder}
          enterKeyHint="search"
          autoComplete="off"
          spellCheck={false}
          aria-label="Chercher ou ajouter un produit"
          className="h-12 w-full rounded-xl border border-input bg-card pr-11 pl-11 text-base shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={reset}
            className="absolute top-1/2 right-1 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground"
            aria-label="Effacer"
          >
            <X className="size-[18px]" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {trimmed && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.1 } }}
            className="mt-2 overflow-hidden rounded-xl border bg-popover shadow-sm"
          >
            {matches.length > 0 && (
              <div className="py-1.5">
                <p className="px-4 pt-1.5 pb-1 text-xs font-medium text-muted-foreground">
                  {exact ? "Dans le cahier" : "Déjà dans le cahier. C’est l’un d’eux ?"}
                </p>
                <ul>
                  {matches.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => void flag(p)}
                        className="flex min-h-14 w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{p.name}</span>
                          <span className="block truncate text-[13px] text-muted-foreground">{categoryNames.get(p.category_id) ?? "Sans catégorie"}</span>
                        </span>
                        {p.status === "to_buy" ? (
                          <span className="shrink-0 text-[13px] text-muted-foreground">Déjà sur la liste</span>
                        ) : (
                          <span className="shrink-0 text-[13px] font-medium text-flag-text">Ajouter à la liste</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!exact && (
              <div className={cn("p-3", matches.length > 0 && "border-t")}>
                {needsPage ? (
                  <div>
                    <p className="mb-2 px-1 text-[13px] text-muted-foreground">
                      Créer <span className="font-medium text-foreground">« {trimmed} »</span> dans quelle catégorie ?
                    </p>
                    {categories.length ? (
                      <div className="flex flex-wrap gap-2">
                        {categories.map((c) => (
                          <Button key={c.id} variant="outline" size="touch" onClick={() => void create(c.id)}>
                            {c.name}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="px-1 text-[13px] text-muted-foreground">Crée d’abord une catégorie.</p>
                    )}
                  </div>
                ) : (
                  <Button
                    variant={matches.length ? "outline" : "default"}
                    size="touch"
                    className="w-full min-w-0 justify-start"
                    onClick={() => void create(categoryId!)}
                  >
                    <Plus aria-hidden />
                    <span className="truncate">
                      {matches.length ? "Non, créer" : "Créer"} « {trimmed} »
                    </span>
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
