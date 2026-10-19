import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";

// Fil d'Ariane visible ; le même chemin est décrit en données structurées par la page.
export function Breadcrumbs({ items }: { items: [string, string][] }) {
  return (
    <nav aria-label="Fil d’Ariane" className="text-[15px] text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
        {items.map(([label, href], i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={href}>
              <li className="min-w-0">
                {last ? (
                  <span aria-current="page" className="text-foreground">
                    {label}
                  </span>
                ) : (
                  <Link href={href} className="inline-flex min-h-11 items-center underline-offset-4 hover:text-foreground hover:underline">
                    {label}
                  </Link>
                )}
              </li>
              {!last && (
                <li aria-hidden>
                  <ChevronRight className="size-4" />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
