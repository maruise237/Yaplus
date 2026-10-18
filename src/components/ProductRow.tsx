"use client";

import { Check, MoreVertical, RotateCcw, ShoppingCart } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleProduct } from "@/lib/actions";
import type { Product, ShopMember } from "@/lib/db";
import { listItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function flaggedLabel(product: Product, members?: Map<string, ShopMember>) {
  if (!product.flagged_by) return null;
  return members?.get(product.flagged_by)?.display_name ?? null;
}

// Un tap = signaler / remettre en stock, avec "Annuler" pendant quelques secondes.
export async function toggleWithUndo(product: Product) {
  const next = await toggleProduct(product.id);
  toast(next.status === "to_buy" ? `${product.name} ajouté à la liste` : `${product.name} remis en stock`, {
    id: "toggle",
    duration: 4000,
    action: { label: "Annuler", onClick: () => void toggleProduct(product.id) },
  });
}

export function StatusMark({ status }: { status: Product["status"] }) {
  return (
    <span
      className={cn(
        "relative grid size-6 shrink-0 place-items-center rounded-full border transition-colors duration-150",
        status === "to_buy" && "border-flag bg-flag text-flag-foreground",
        status === "bought" && "border-success bg-success text-white",
        status === "in_stock" && "border-input bg-background",
      )}
      aria-hidden
    >
      <AnimatePresence initial={false} mode="popLayout">
        {status !== "in_stock" && (
          <motion.span
            key={status}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="grid place-items-center"
          >
            {status === "to_buy" ? <ShoppingCart className="size-3.5" strokeWidth={2.5} /> : <Check className="size-3.5" strokeWidth={3} />}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

export function NoteChip({ children }: { children: React.ReactNode }) {
  return <span className="shrink-0 rounded-md bg-secondary px-1.5 py-px text-[13px] leading-5 font-medium text-secondary-foreground">{children}</span>;
}

export function ProductRow({
  product,
  members,
  categoryName,
  onMore,
}: {
  product: Product;
  members?: Map<string, ShopMember>;
  categoryName?: string;
  onMore?: (product: Product) => void;
}) {
  const toBuy = product.status === "to_buy";
  const by = flaggedLabel(product, members);
  const detail = toBuy ? (by ? `Signalé par ${by}` : "À racheter") : product.status === "bought" ? "Acheté" : categoryName ?? null;

  return (
    <motion.li {...listItem} className="overflow-hidden">
      <div className={cn("flex items-center transition-colors duration-150", toBuy ? "bg-flag-subtle" : "hover:bg-accent/50")}>
        <motion.button
          type="button"
          whileTap={{ scale: 0.985 }}
          onClick={() => void toggleWithUndo(product)}
          aria-pressed={toBuy}
          className="flex min-h-16 min-w-0 flex-1 items-center py-2.5 pr-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        >
          {/* La marge du cahier : le signalement s'y inscrit */}
          <span className="grid w-12 shrink-0 place-items-center">
            <StatusMark status={product.status} />
          </span>
          <span className="min-w-0 flex-1 pl-3">
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate text-base leading-6 font-medium">{product.name}</span>
              {product.note && <NoteChip>{product.note}</NoteChip>}
            </span>
            {detail && <span className={cn("block truncate text-sm leading-5", toBuy ? "text-flag-text" : "text-muted-foreground")}>{detail}</span>}
            {toBuy && product.forgotten_count > 0 && (
              <span className="flex items-center gap-1 text-sm leading-5 font-medium text-flag-text">
                <RotateCcw className="size-3.5" aria-hidden />
                Oublié la dernière fois
              </span>
            )}
          </span>
        </motion.button>
        {onMore && (
          <Button variant="ghost" size="icon-touch" className="mr-1.5 text-muted-foreground" onClick={() => onMore(product)} aria-label={`Options pour ${product.name}`}>
            <MoreVertical />
          </Button>
        )}
      </div>
    </motion.li>
  );
}

// Liste façon page de cahier : lignes bleues, marge rouge à gauche.
export function ListCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ul
      className={cn(
        "relative divide-y overflow-hidden rounded-xl border bg-card",
        "before:pointer-events-none before:absolute before:inset-y-0 before:left-12 before:z-10 before:w-px before:bg-flag/35",
        className,
      )}
    >
      {children}
    </ul>
  );
}
