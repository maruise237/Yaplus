import { LogoMark } from "@/components/AppShell";
import type { TemplateCategory } from "@/content/shop-templates";

// Aperçu du cahier d'un modèle : les catégories et leurs produits, en lignes comme dans l'app.
export function TemplateNotebook({ label, categories }: { label: string; categories: TemplateCategory[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-[0_18px_40px_-24px_rgb(16_40_80/0.35),0_2px_6px_-3px_rgb(16_40_80/0.1)]">
      <p className="flex items-center gap-2 border-b px-4 py-3 text-[15px] font-semibold">
        <LogoMark className="size-5" />
        Cahier {label.toLowerCase()}
      </p>
      <div className="grid sm:grid-cols-2">
        {categories.map((c) => (
          <section key={c.name} className="border-b px-4 pt-4 pb-3 sm:odd:border-r">
            <h3 className="flex items-baseline justify-between gap-3 text-[16px] font-semibold">
              {c.name}
              <span className="text-[13px] font-normal text-muted-foreground tabular-nums">{c.products.length} produits</span>
            </h3>
            <ul className="mt-2 divide-y">
              {c.products.map((p) => (
                <li key={p} className="flex min-h-10 items-center gap-2.5 text-[15px]">
                  <span className="size-4 shrink-0 rounded-full border border-input" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
