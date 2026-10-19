import { ChevronRight } from "lucide-react";
import Link from "next/link";

// Liste de liens en lignes, comme les listes de l'app : un titre, une ligne d'explication.
export function LinkList({ items }: { items: { href: string; title: string; text?: string }[] }) {
  return (
    <ul className="divide-y border-y">
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className="group flex min-h-16 items-center gap-4 py-4 outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-medium underline-offset-4 group-hover:underline">{item.title}</span>
              {item.text && <span className="mt-0.5 block text-[15px] leading-snug text-muted-foreground">{item.text}</span>}
            </span>
            <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}
