"use client";

import type { Product, ShopMember } from "@/lib/db";
import { toggleProduct } from "@/lib/actions";

export function flaggedLabel(product: Product, members?: Map<string, ShopMember>) {
  if (!product.flagged_by) return null;
  return members?.get(product.flagged_by)?.display_name ?? "?";
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
  const bought = product.status === "bought";
  const by = flaggedLabel(product, members);

  return (
    <div
      className={`flex items-stretch overflow-hidden rounded-2xl border transition-colors ${
        toBuy ? "border-brand bg-brand-soft" : bought ? "border-ok bg-ok-soft" : "border-line bg-surface"
      }`}
    >
      <button onClick={() => void toggleProduct(product.id)} className="flex min-h-16 min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left">
        <span
          className={`grid size-8 shrink-0 place-items-center rounded-full border-2 text-sm font-black ${
            toBuy ? "border-brand bg-brand text-brand-ink" : bought ? "border-ok bg-ok text-white" : "border-line"
          }`}
          aria-hidden
        >
          {toBuy ? "!" : bought ? "✓" : ""}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-lg font-semibold">{product.name}</span>
          <span className="block truncate text-xs text-muted">
            {categoryName && <>{categoryName} · </>}
            {toBuy ? `À racheter${by ? ` · ${by}` : ""}` : bought ? "Acheté" : "En stock"}
            {product.note && <> · {product.note}</>}
            {toBuy && product.forgotten_count > 0 && <> · oublié la dernière fois</>}
          </span>
        </span>
      </button>
      {onMore && (
        <button onClick={() => onMore(product)} className="px-4 text-xl text-muted" aria-label={`Options pour ${product.name}`}>
          ⋯
        </button>
      )}
    </div>
  );
}
