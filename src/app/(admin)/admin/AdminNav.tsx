"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { path: "", label: "Vue d’ensemble" },
  { path: "/boutiques", label: "Boutiques" },
  { path: "/comptes", label: "Comptes" },
];

export function AdminNav({ base, className }: { base: string; className?: string }) {
  const pathname = usePathname();
  return (
    <nav className={cn("flex gap-1", className)}>
      {ITEMS.map((item) => {
        const href = base + item.path;
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
            {active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" aria-hidden />}
          </Link>
        );
      })}
    </nav>
  );
}
