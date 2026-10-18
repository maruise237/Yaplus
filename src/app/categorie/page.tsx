"use client";

import { ArrowLeft, Archive, MoreVertical, Pencil } from "lucide-react";
import { AnimatePresence } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState, PageHeader } from "@/components/PageHeader";
import { ListCard, ProductRow } from "@/components/ProductRow";
import { ProductSearch } from "@/components/ProductSearch";
import { ProductSheet } from "@/components/ProductSheet";
import { TextFieldDialog } from "@/components/TextFieldDialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { archiveCategory, renameCategory } from "@/lib/actions";
import type { Product } from "@/lib/db";
import { useCategories, useCurrentShop, useMembers, useProducts } from "@/lib/hooks";

function Category() {
  const id = useSearchParams().get("id");
  const router = useRouter();
  const current = useCurrentShop();
  const shopId = current?.shop.id;
  const categories = useCategories(shopId);
  const products = useProducts(shopId);
  const members = useMembers(shopId);
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const category = categories.find((c) => c.id === id);
  if (!shopId || !current) return null;

  const back = (
    <Button variant="ghost" size="icon-touch" className="-ml-3" asChild>
      <Link href="/" aria-label="Retour au cahier">
        <ArrowLeft />
      </Link>
    </Button>
  );

  if (!category) {
    return (
      <>
        <PageHeader leading={back} title="Catégorie introuvable" />
        <EmptyState title="Cette catégorie n’existe plus">Elle a peut-être été archivée par le patron.</EmptyState>
      </>
    );
  }

  // Ordre alphabétique stable : une ligne ne bouge jamais sous le doigt après un tap.
  const items = products.filter((p) => p.category_id === category.id);
  const sheetProduct: Product | null = products.find((p) => p.id === sheetId) ?? null;

  return (
    <>
      <PageHeader
        leading={back}
        title={category.name}
        aside={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-touch" className="-mr-3 text-muted-foreground" aria-label="Options de la catégorie">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              <DropdownMenuItem className="h-11 text-base" onSelect={() => setRenaming(true)}>
                <Pencil />
                Renommer
              </DropdownMenuItem>
              {current.isOwner && (
                <DropdownMenuItem className="h-11 text-base" variant="destructive" onSelect={() => setArchiving(true)}>
                  <Archive />
                  Archiver
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <ProductSearch shopId={shopId} products={products} categories={categories} categoryId={category.id} placeholder={`Ajouter dans ${category.name}…`} />

      <div className="mt-5">
        {items.length === 0 ? (
          <EmptyState title="Aucun produit">Écris le nom d’un produit au-dessus. Touche-le ensuite quand il n’en reste plus.</EmptyState>
        ) : (
          <ListCard>
            <AnimatePresence initial={false}>
              {items.map((p) => (
                <ProductRow key={p.id} product={p} members={members} onMore={(prod) => setSheetId(prod.id)} />
              ))}
            </AnimatePresence>
          </ListCard>
        )}
      </div>

      <ProductSheet product={sheetProduct} categories={categories} products={products} isOwner={current.isOwner} onClose={() => setSheetId(null)} />
      <TextFieldDialog
        open={renaming}
        onOpenChange={setRenaming}
        title="Renommer la catégorie"
        label="Nom"
        initialValue={category.name}
        onSubmit={(name) => void renameCategory(category.id, name)}
      />
      <ConfirmDialog
        open={archiving}
        onOpenChange={setArchiving}
        title={`Archiver « ${category.name} » ?`}
        description="Elle disparaît du cahier. Ses produits restent dans l’historique."
        confirmLabel="Archiver"
        destructive
        onConfirm={async () => {
          await archiveCategory(category.id);
          router.replace("/");
        }}
      />
    </>
  );
}

export default function CategoriePage() {
  return (
    <Suspense>
      <Category />
    </Suspense>
  );
}
