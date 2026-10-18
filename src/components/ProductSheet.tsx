"use client";

import { Archive, Merge } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { archiveProduct, mergeProducts, setNote, toggleProduct, updateProduct } from "@/lib/actions";
import type { Category, Product } from "@/lib/db";
import { ConfirmDialog } from "./ConfirmDialog";
import { ResponsiveSheet } from "./ResponsiveSheet";

const QUICK_NOTES = ["x2", "x3", "x5", "x10", "urgent"];

// Options d'un produit : quantité ou note (jamais obligatoires), nom, catégorie.
// Patron : fusionner un doublon ou retirer du cahier.
export function ProductSheet({
  product,
  categories,
  products,
  isOwner,
  onClose,
}: {
  product: Product | null;
  categories: Category[];
  products: Product[];
  isOwner: boolean;
  onClose: () => void;
}) {
  return (
    <ResponsiveSheet open={Boolean(product)} onOpenChange={(open) => !open && onClose()} title={product?.name ?? ""}>
      {product && <SheetBody key={product.id} product={product} categories={categories} products={products} isOwner={isOwner} onClose={onClose} />}
    </ResponsiveSheet>
  );
}

function SheetBody({
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
  const [confirmArchive, setConfirmArchive] = useState(false);

  const save = async () => {
    const nextName = name.trim() || product.name;
    if (nextName !== product.name || categoryId !== product.category_id) {
      await updateProduct(product.id, { name: nextName, category_id: categoryId });
    }
    if ((note.trim() || null) !== product.note) await setNote(product.id, note);
    onClose();
  };

  const merge = async () => {
    const target = products.find((p) => p.id === mergeInto);
    await mergeProducts(product.id, mergeInto);
    toast(`Fusionné dans ${target?.name}`);
    onClose();
  };

  return (
    <form
      className="grid gap-6 pb-2"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      {product.status === "to_buy" && (
        <div className="flex items-center gap-3 rounded-lg bg-flag-subtle py-2 pr-2 pl-3.5">
          <p className="min-w-0 flex-1 text-[15px] font-medium text-flag-text">Sur la liste à racheter</p>
          <Button type="button" variant="outline" size="touch" className="bg-card" onClick={() => void toggleProduct(product.id).then(onClose)}>
            Remettre en stock
          </Button>
        </div>
      )}

      <div className="grid gap-2.5">
        <Label htmlFor="note">
          Quantité ou note <span className="font-normal text-muted-foreground">(facultatif)</span>
        </Label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Raccourcis">
          {QUICK_NOTES.map((n) => (
            <Button
              key={n}
              type="button"
              variant="outline"
              size="touch"
              aria-pressed={note === n}
              onClick={() => setNoteValue(note === n ? "" : n)}
              className="min-w-14 aria-pressed:border-foreground aria-pressed:bg-secondary"
            >
              {n}
            </Button>
          ))}
        </div>
        <Input id="note" value={note} onChange={(e) => setNoteValue(e.target.value)} placeholder="Ex. couleur noire…" autoComplete="off" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2.5">
          <Label htmlFor="product-name">Nom</Label>
          <Input id="product-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
        </div>
        <div className="grid gap-2.5">
          <Label htmlFor="product-page">Catégorie</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="product-page" className="h-11! w-full text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id} className="h-10 text-base">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" size="touch-lg">
        Enregistrer
      </Button>

      {isOwner && (
        <>
          <Separator />
          <div className="grid gap-2.5">
            <Label htmlFor="merge">Doublon ?</Label>
            <div className="flex gap-2">
              <Select value={mergeInto} onValueChange={setMergeInto}>
                <SelectTrigger id="merge" className="h-11! min-w-0 flex-1 text-base">
                  <SelectValue placeholder="Fusionner dans…" />
                </SelectTrigger>
                <SelectContent>
                  {products
                    .filter((p) => p.id !== product.id)
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id} className="h-10 text-base">
                        {p.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" size="touch" disabled={!mergeInto} onClick={() => void merge()}>
                <Merge aria-hidden />
                Fusionner
              </Button>
            </div>
          </div>
          <Button type="button" variant="ghost" size="touch" className="justify-start text-destructive hover:text-destructive" onClick={() => setConfirmArchive(true)}>
            <Archive aria-hidden />
            Retirer du cahier
          </Button>
          <ConfirmDialog
            open={confirmArchive}
            onOpenChange={setConfirmArchive}
            title={`Retirer « ${product.name} » ?`}
            description="Il disparaît du cahier mais reste visible dans l’historique."
            confirmLabel="Retirer"
            destructive
            onConfirm={async () => {
              await archiveProduct(product.id);
              onClose();
            }}
          />
        </>
      )}
    </form>
  );
}
