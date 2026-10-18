"use client";

import { MessageCircle, MoreVertical, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState, PageHeader } from "@/components/PageHeader";
import { flaggedLabel, ListCard, NoteChip } from "@/components/ProductRow";
import { ProductSheet } from "@/components/ProductSheet";
import { ResponsiveSheet } from "@/components/ResponsiveSheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { closeList, setBought } from "@/lib/actions";
import { getMeta, setMeta, type Product, type ShopMember } from "@/lib/db";
import { useCategories, useCurrentShop, useMembers, useProducts } from "@/lib/hooks";
import { listItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { buildShareMessage, normalizePhone, whatsappLink } from "@/lib/whatsapp";

type Group = { id: string; name: string; items: Product[] };

export default function ARacheterPage() {
  const current = useCurrentShop();
  const shopId = current?.shop.id;
  const categories = useCategories(shopId);
  const products = useProducts(shopId);
  const members = useMembers(shopId);
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [closing, setClosing] = useState(false);
  const [sharedTo, setSharedTo] = useState<string | null>(null);
  const hasItems = products.some((p) => p.status === "to_buy" || p.status === "bought");

  // Sur téléphone, les notifications passent au-dessus de la barre d'actions.
  useEffect(() => {
    if (!hasItems) return;
    const root = document.documentElement;
    root.style.setProperty("--toast-bottom", "calc(9.75rem + env(safe-area-inset-bottom))");
    return () => {
      root.style.removeProperty("--toast-bottom");
    };
  }, [hasItems]);

  const groups = useMemo<Group[]>(() => {
    const list = products.filter((p) => p.status === "to_buy" || p.status === "bought");
    const byCategory = new Map<string, Product[]>();
    for (const p of list) byCategory.set(p.category_id, [...(byCategory.get(p.category_id) ?? []), p]);
    const ordered: Group[] = categories.map((c) => ({ id: c.id, name: c.name, items: byCategory.get(c.id) ?? [] }));
    const known = new Set(categories.map((c) => c.id));
    const orphans = list.filter((p) => !known.has(p.category_id));
    if (orphans.length) ordered.push({ id: "_", name: "Sans catégorie", items: orphans });
    // Les oubliés de la dernière fois remontent en haut de leur catégorie.
    for (const g of ordered) g.items.sort((a, b) => b.forgotten_count - a.forgotten_count || a.name.localeCompare(b.name, "fr"));
    return ordered.filter((g) => g.items.length);
  }, [products, categories]);

  if (!current || !shopId) return null;

  const all = groups.flatMap((g) => g.items);
  const bought = all.filter((p) => p.status === "bought").length;
  const left = all.length - bought;
  const sheetProduct = products.find((p) => p.id === sheetId) ?? null;

  const close = async () => {
    await closeList(shopId, sharedTo);
    toast.success("Liste clôturée", {
      description: left ? `${left} produit${left > 1 ? "s restent" : " reste"} sur la liste, marqué${left > 1 ? "s" : ""} « oublié ».` : "Tout a été acheté.",
    });
  };

  const actions = (
    <>
      <Button variant="outline" size="touch-lg" className="flex-1 md:flex-none" onClick={() => setSharing(true)} disabled={left === 0}>
        <MessageCircle aria-hidden />
        Envoyer
      </Button>
      {current.isOwner && (
        <Button size="touch-lg" className="flex-1 md:flex-none" onClick={() => setClosing(true)}>
          Clôturer la liste
        </Button>
      )}
    </>
  );

  return (
    <>
      <PageHeader title="À racheter" />

      {all.length === 0 ? (
        <EmptyState
          title="Rien à racheter"
          action={
            <Button variant="outline" size="touch" asChild>
              <Link href="/">Ouvrir le cahier</Link>
            </Button>
          }
        >
          Les produits signalés dans le cahier arrivent ici, rangés par catégorie.
        </EmptyState>
      ) : (
        <div className="md:grid md:grid-cols-[1fr_17rem] md:items-start md:gap-8">
          <div className="grid gap-6">
            <p className="-mt-3 text-[15px] text-muted-foreground tabular-nums md:-mt-5">
              {bought > 0 ? `${bought} acheté${bought > 1 ? "s" : ""} sur ${all.length}` : `${all.length} produit${all.length > 1 ? "s" : ""}`}
              {current.isOwner && bought === 0 && ". Coche au fur et à mesure des achats."}
            </p>
            {groups.map((g) => (
              <section key={g.id} aria-labelledby={`g-${g.id}`}>
                <div className="mb-2 flex items-baseline justify-between px-1">
                  <h2 id={`g-${g.id}`} className="text-[17px] font-semibold">
                    {g.name}
                  </h2>
                  <span className="text-sm text-muted-foreground tabular-nums">{g.items.length}</span>
                </div>
                <ListCard>
                  <AnimatePresence initial={false}>
                    {g.items.map((p) => (
                      <BuyRow key={p.id} product={p} members={members} onMore={() => setSheetId(p.id)} />
                    ))}
                  </AnimatePresence>
                </ListCard>
              </section>
            ))}
          </div>

          {/* Grand écran : actions dans une colonne fixe */}
          <aside className="sticky top-10 hidden flex-col gap-3 rounded-xl border bg-card p-4 md:flex">
            <Progress value={bought} total={all.length} />
            <div className="flex flex-col gap-2">{actions}</div>
          </aside>
        </div>
      )}

      {/* Téléphone : actions au pouce, au-dessus des onglets */}
      {all.length > 0 && (
        <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 border-t bg-background/95 px-4 py-3 backdrop-blur-md md:hidden">
          <div className="mx-auto flex max-w-4xl gap-2">{actions}</div>
        </div>
      )}
      {all.length > 0 && <div className="h-20 md:hidden" aria-hidden />}

      <ProductSheet product={sheetProduct} categories={categories} products={products} isOwner={current.isOwner} onClose={() => setSheetId(null)} />
      <ShareSheet open={sharing} onOpenChange={setSharing} shopName={current.shop.name} groups={groups} onShared={setSharedTo} />
      <ConfirmDialog
        open={closing}
        onOpenChange={setClosing}
        title="Clôturer la liste ?"
        description={
          <ul className="grid gap-1">
            <li>
              <strong className="font-semibold text-foreground tabular-nums">{bought}</strong> acheté{bought > 1 ? "s" : ""} : retour en stock.
            </li>
            <li>
              <strong className="font-semibold text-foreground tabular-nums">{left}</strong> non coché{left > 1 ? "s" : ""} : reste{left > 1 ? "nt" : ""} sur la liste.
            </li>
          </ul>
        }
        confirmLabel="Clôturer"
        onConfirm={close}
      />
    </>
  );
}

function Progress({ value, total }: { value: number; total: number }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground tabular-nums">
        <span className="text-2xl font-bold text-foreground">{value}</span> / {total} achetés
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={value} aria-valuemax={total}>
        <motion.div className="h-full rounded-full bg-success" animate={{ width: `${total ? (value / total) * 100 : 0}%` }} />
      </div>
    </div>
  );
}

function BuyRow({ product, members, onMore }: { product: Product; members?: Map<string, ShopMember>; onMore: () => void }) {
  const isBought = product.status === "bought";
  const by = flaggedLabel(product, members);
  const id = `buy-${product.id}`;

  return (
    <motion.li {...listItem} className="overflow-hidden">
      <div className={cn("flex items-center transition-colors duration-150", isBought ? "bg-success-subtle" : "hover:bg-accent/50")}>
        <label htmlFor={id} className="flex min-h-16 min-w-0 flex-1 cursor-pointer items-center py-2.5 pr-2">
          <span className="grid w-12 shrink-0 place-items-center">
            <Checkbox
              id={id}
              checked={isBought}
              onCheckedChange={(v) => void setBought(product.id, v === true)}
              className="size-6 rounded-md border-input bg-card data-checked:border-success data-checked:bg-success dark:data-checked:bg-success data-checked:text-white [&_svg]:size-4!"
            />
          </span>
          <span className="min-w-0 flex-1 pl-3">
            <span className="flex min-w-0 items-center gap-2">
              <span className={cn("truncate text-base leading-6 font-medium transition-colors", isBought && "text-muted-foreground line-through decoration-1")}>
                {product.name}
              </span>
              {product.note && <NoteChip>{product.note}</NoteChip>}
            </span>
            {by && <span className="block truncate text-sm leading-5 text-muted-foreground">Signalé par {by}</span>}
            {product.forgotten_count > 0 && !isBought && (
              <span className="flex items-center gap-1 text-sm leading-5 font-medium text-flag-text">
                <RotateCcw className="size-3.5" aria-hidden />
                Oublié la dernière fois
              </span>
            )}
          </span>
        </label>
        <Button variant="ghost" size="icon-touch" className="mr-1.5 text-muted-foreground" onClick={onMore} aria-label={`Options pour ${product.name}`}>
          <MoreVertical />
        </Button>
      </div>
    </motion.li>
  );
}

function ShareSheet({
  open,
  onOpenChange,
  shopName,
  groups,
  onShared,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopName: string;
  groups: Group[];
  onShared: (phone: string | null) => void;
}) {
  const recent = useLiveQuery(async () => (await getMeta<string[]>("recentPhones")) ?? [], []) ?? [];
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const message = buildShareMessage(
    shopName,
    groups.map((g) => ({ category: g.name, items: g.items.filter((p) => p.status === "to_buy") })),
  );

  const send = async () => {
    const normalized = phone.trim() ? normalizePhone(phone) : null;
    if (phone.trim() && !normalized) return setError("Ce numéro ne semble pas valide. Exemple : 6 99 00 11 22");
    if (normalized) await setMeta("recentPhones", [normalized, ...recent.filter((p) => p !== normalized)].slice(0, 4));
    onShared(normalized);
    window.open(whatsappLink(message, normalized), "_blank", "noopener");
    onOpenChange(false);
  };

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Envoyer la liste"
      description="WhatsApp s’ouvre avec le message prêt, rangé par catégorie."
      footer={
        <Button size="touch-lg" onClick={() => void send()}>
          <MessageCircle aria-hidden />
          Ouvrir WhatsApp
        </Button>
      }
    >
      <div className="grid gap-5">
        <div className="grid gap-2.5">
          <Label htmlFor="share-phone">
            Numéro <span className="font-normal text-muted-foreground">(facultatif)</span>
          </Label>
          <Input
            id="share-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setError(null);
            }}
            placeholder="6 99 00 11 22"
            aria-invalid={Boolean(error)}
          />
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Sans numéro, tu choisis le contact dans WhatsApp.</p>
          )}
          {recent.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recent.map((p) => (
                <Button key={p} type="button" variant="outline" size="touch" className="tabular-nums" onClick={() => setPhone(`+${p}`)}>
                  +{p}
                </Button>
              ))}
            </div>
          )}
        </div>
        <div className="grid gap-2">
          <p className="text-sm font-medium">Aperçu</p>
          <pre className="max-h-48 overflow-y-auto rounded-lg bg-secondary px-3.5 py-3 font-sans text-sm leading-relaxed whitespace-pre-wrap">{message}</pre>
        </div>
      </div>
    </ResponsiveSheet>
  );
}
