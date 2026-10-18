"use client";

import { useState } from "react";
import { archiveProduct, mergeProducts, setNote, updateProduct } from "@/lib/actions";
import type { Category, Product } from "@/lib/db";

const QUICK_NOTES = ["x2", "x3", "x5", "x10", "urgent"];

// Options d'un produit : quantité / note (jamais obligatoires), renommer, déplacer,
// et pour le patron : fusionner un doublon ou archiver.
export function ProductSheet({
  product,
  categories,
  products,
  isOwner,
  onClose,
}: {
  product: Product;
  categories: Category[];
  products: Product[];
  isOwner: boolean;
  onClose: () => void;
}) {
  const [note, setNoteValue] = useState(product.note ?? "");
  const [name, setName] = useState(product.name);
  const [categoryId, setCategoryId] = useState(product.category_id);
  const [mergeInto, setMergeInto] = useState("");

  const save = async () => {
    if (name.trim() && (name.trim() !== product.name || categoryId !== product.category_id)) {
      await updateProduct(product.id, { name, category_id: categoryId });
    }
    if ((note.trim() || null) !== product.note) await setNote(product.id, note);
    onClose();
  };

  const field = "w-full rounded-xl border border-line bg-bg px-3 py-3 outline-none focus:border-brand";

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="mx-auto max-h-[90dvh] w-full max-w-xl space-y-4 overflow-y-auto rounded-t-3xl bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{product.name}</h2>
          <button onClick={onClose} className="px-2 text-2xl text-muted" aria-label="Fermer">
            ×
          </button>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-muted">Quantité ou note (facultatif)</p>
          <div className="mb-2 flex flex-wrap gap-2">
            {QUICK_NOTES.map((n) => (
              <button
                key={n}
                onClick={() => setNoteValue(note === n ? "" : n)}
                className={`rounded-full border px-4 py-2 font-medium ${note === n ? "border-brand bg-brand-soft text-brand" : "border-line"}`}
              >
                {n}
              </button>
            ))}
          </div>
          <input className={field} value={note} onChange={(e) => setNoteValue(e.target.value)} placeholder="Ex. couleur noire" />
        </div>

        <div className="grid gap-2">
          <p className="text-sm font-medium text-muted">Nom et page</p>
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} />
          <select className={field} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button onClick={() => void save()} className="w-full rounded-2xl bg-brand px-4 py-4 font-semibold text-brand-ink">
          Enregistrer
        </button>

        {isOwner && (
          <div className="space-y-2 border-t border-line pt-4">
            <p className="text-sm font-medium text-muted">Patron</p>
            <div className="flex gap-2">
              <select className={field} value={mergeInto} onChange={(e) => setMergeInto(e.target.value)}>
                <option value="">Fusionner ce doublon dans…</option>
                {products
                  .filter((p) => p.id !== product.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
              <button
                disabled={!mergeInto}
                onClick={() => void mergeProducts(product.id, mergeInto).then(onClose)}
                className="rounded-xl border border-line px-4 font-medium disabled:opacity-40"
              >
                OK
              </button>
            </div>
            <button
              onClick={() => confirm(`Retirer « ${product.name} » du cahier ?`) && void archiveProduct(product.id).then(onClose)}
              className="w-full rounded-xl px-4 py-3 text-brand"
            >
              Retirer du cahier
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
