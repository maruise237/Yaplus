"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { path: "", label: "Accueil" },
  { path: "/boutiques", label: "Boutiques" },
  { path: "/comptes", label: "Comptes" },
  { path: "/support", label: "Support" },
  { path: "/reglages", label: "Réglages" },
];

// `waiting` : conversations de support qui attendent une réponse.
export function AdminNav({ base, waiting, className }: { base: string; waiting: number; className?: string }) {
  const pathname = usePathname();
  return (
    <nav className={cn("flex gap-1", className)}>
      {ITEMS.map((item) => {
        const href = base + item.path;
        const active = item.path ? pathname.startsWith(href) : pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex h-11 shrink-0 items-center rounded-lg px-2.5 text-sm sm:px-3 font-medium transition-colors",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
            {item.path === "/support" && waiting > 0 && (
              <span className="ml-1.5 min-w-5 rounded-full bg-primary px-1.5 text-center text-xs leading-5 font-semibold text-primary-foreground tabular-nums">
                <span className="sr-only">, à répondre : </span>
                {waiting}
              </span>
            )}
            {active && <span className="absolute inset-x-2.5 bottom-0 sm:inset-x-3 h-0.5 rounded-full bg-primary" aria-hidden />}
          </Link>
        );
      })}
    </nav>
  );
}
