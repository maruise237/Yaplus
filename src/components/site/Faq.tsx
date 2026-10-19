import { ChevronDown } from "lucide-react";
import { RichText } from "./RichText";

// Questions fréquentes, ouvertes au toucher. Le texte reste dans la page pour les moteurs.
export function Faq({ items, title = "Questions fréquentes" }: { items: [string, string][]; title?: string }) {
  return (
    <section aria-labelledby="faq" className="mt-20">
      <h2 id="faq" className="text-[clamp(1.75rem,5vw,2.25rem)] leading-tight font-semibold tracking-[-0.025em]">
        {title}
      </h2>
      <div className="mt-6 border-t">
        {items.map(([q, a]) => (
          <details key={q} className="group border-b">
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[17px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
              <h3>{q}</h3>
              <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" aria-hidden />
            </summary>
            <p className="max-w-[38rem] pb-5 text-[16px] leading-relaxed text-muted-foreground">
              <RichText text={a} />
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
