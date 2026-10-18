"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCurrentShop, useSession } from "@/lib/hooks";
import { startSync } from "@/lib/sync";
import { SyncBadge } from "./SyncBadge";

const PUBLIC_ROUTES = ["/connexion", "/rejoindre"];
const NO_SHOP_ROUTES = ["/bienvenue", "/rejoindre"];

const NAV = [
  { href: "/", label: "Cahier", icon: "▦" },
  { href: "/a-racheter", label: "À racheter", icon: "🛒" },
  { href: "/historique", label: "Historique", icon: "🕘" },
  { href: "/boutique", label: "Boutique", icon: "⚙" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();
  const current = useCurrentShop();

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (session?.mode === "cloud") return startSync();
  }, [session?.mode]);

  const isPublic = PUBLIC_ROUTES.includes(pathname);
  const allowsNoShop = NO_SHOP_ROUTES.includes(pathname);

  useEffect(() => {
    if (session === undefined || current === undefined) return;
    if (session === null && !isPublic) router.replace("/connexion");
    else if (session && current === null && !allowsNoShop) router.replace("/bienvenue");
    else if (session && current && (pathname === "/connexion" || pathname === "/bienvenue")) router.replace("/");
  }, [session, current, isPublic, allowsNoShop, pathname, router]);

  const ready = isPublic || (session && (current || allowsNoShop));
  if (!ready) {
    return <div className="grid min-h-dvh place-items-center text-2xl font-black text-brand">Yaplus</div>;
  }

  const showChrome = Boolean(current) && !isPublic && !allowsNoShop;

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col">
      {showChrome && (
        <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur">
          <Link href="/" className="min-w-0">
            <div className="text-xs font-black tracking-wide text-brand">YAPLUS</div>
            <div className="truncate text-base font-semibold">{current!.shop.name}</div>
          </Link>
          <SyncBadge />
        </header>
      )}
      <main className={`flex-1 px-4 ${showChrome ? "pb-28 pt-4" : "py-8"}`}>{children}</main>
      {showChrome && (
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto grid max-w-xl grid-cols-4">
            {NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" || pathname === "/categorie" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${active ? "text-brand" : "text-muted"}`}
                >
                  <span className="text-xl leading-none" aria-hidden>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
