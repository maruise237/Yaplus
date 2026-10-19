"use client";

import { House, MessagesSquare, Settings, Store, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { path: "", label: "Accueil", icon: House },
  { path: "/boutiques", label: "Boutiques", icon: Store },
  { path: "/comptes", label: "Comptes", icon: Users },
  { path: "/support", label: "Support", icon: MessagesSquare },
  { path: "/reglages", label: "Réglages", icon: Settings },
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
              "relative flex h-11 shrink-0 items-center rounded-lg px-3 text-sm font-medium transition-colors",
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
            {active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" aria-hidden />}
          </Link>
        );
      })}
    </nav>
  );
}

// Téléphone : onglets en bas, à portée du pouce. Cachés dans une conversation,
// où la zone de réponse prend leur place.
export function AdminTabs({ base, waiting }: { base: string; waiting: number }) {
  const pathname = usePathname();
  if (pathname.startsWith(`${base}/support/`)) return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {ITEMS.map((item) => {
          const href = base + item.path;
          const active = item.path ? pathname.startsWith(href) : pathname === href;
          const Icon = item.icon;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn("flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors", active ? "text-foreground" : "text-muted-foreground")}
            >
              <span className="relative">
                <Icon className="size-[22px]" strokeWidth={active ? 2.25 : 1.75} aria-hidden />
                {item.path === "/support" && waiting > 0 && (
                  <span className="absolute -top-1.5 left-3.5 min-w-[18px] rounded-full bg-primary px-1 text-center text-[10px] leading-[18px] font-semibold text-primary-foreground tabular-nums">
                    <span className="sr-only">, à répondre : </span>
                    {waiting > 99 ? "99+" : waiting}
                  </span>
                )}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
