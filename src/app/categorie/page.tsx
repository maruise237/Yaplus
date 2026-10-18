"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ProductRow } from "@/components/ProductRow";
import { ProductSearch } from "@/components/ProductSearch";
import { ProductSheet } from "@/components/ProductSheet";
import { archiveCategory, renameCategory } from "@/lib/actions";
import type { Product } from "@/lib/db";
import { useCategories, useCurrentShop, useMembers, useProducts } from "@/lib/hooks";

function Category() {
  const id = useSearchParams().get("id");
  const current = useCurrentShop();
  const shopId = current?.shop.id;
  const categories = useCategories(shopId);
  const products = useProducts(shopId);
  const members = useMembers(shopId);
  const [sheet, setSheet] = useState<Product | null>(null);

  const category = categories.find((c) => c.id === id);
  if (!shopId || !current) return null;
  if (!category) {
    return (
      <Link href="/" className="text-brand">
        ← Retour au cahier
      </Link>
    );
  }

  const items = products.filter((p) => p.category_id === category.id);
  const rename = () => {
    const name = prompt("Nouveau nom de la page", category.name);
    if (name?.trim()) void renameCategory(category.id, name);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-2xl text-muted" aria-label="Retour">
          ←
        </Link>
        <h1 className="flex-1 truncate text-2xl font-black">{category.name}</h1>
        <button onClick={rename} className="text-sm text-muted">
          Renommer
        </button>
        {current.isOwner && (
          <button
            onClick={() => confirm(`Archiver la page « ${category.name} » ?`) && void archiveCategory(category.id)}
            className="text-sm text-muted"
          >
            Archiver
          </button>
        )}
      </div>

      <ProductSearch shopId={shopId} products={products} categories={categories} categoryId={category.id} placeholder={`Ajouter dans ${category.name}…`} />

      <p className="text-sm text-muted">Touche un produit quand il n&apos;y en a plus. Touche encore pour le remettre en stock.</p>

      <div className="space-y-2">
        {items.map((p) => (
          <ProductRow key={p.id} product={p} members={members} onMore={setSheet} />
        ))}
        {!items.length && <p className="py-8 text-center text-muted">Page vide. Tape le nom d&apos;un produit au-dessus.</p>}
      </div>

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

export default function CategoriePage() {
  return (
    <Suspense>
      <Category />
    </Suspense>
  );
}
