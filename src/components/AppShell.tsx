"use client";

import { History, LayoutGrid, ShoppingCart, Store, type LucideIcon } from "lucide-react";
import { MotionConfig } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Toaster } from "@/components/ui/sonner";
import { useCurrentShop, useProducts, useSession } from "@/lib/hooks";
import { quick } from "@/lib/motion";
import { seedDemo } from "@/lib/demo";
import { isCloudConfigured } from "@/lib/cloud";
import { loadSupport, supportUnread } from "@/lib/support";
import { startSync, syncNow } from "@/lib/sync";
import { cn } from "@/lib/utils";
import { SupportButton } from "./SupportButton";
import { SyncStatus } from "./SyncStatus";

const PUBLIC_ROUTES = ["/accueil", "/decouvrir", "/connexion", "/rejoindre", "/nouveau-mot-de-passe"];
const NO_SHOP_ROUTES = ["/bienvenue", "/rejoindre"];

type NavItem = { href: string; label: string; icon: LucideIcon; match: (p: string) => boolean };

const NAV: NavItem[] = [
  { href: "/", label: "Cahier", icon: LayoutGrid, match: (p) => p === "/" || p === "/categorie" },
  { href: "/a-racheter", label: "À racheter", icon: ShoppingCart, match: (p) => p === "/a-racheter" },
  { href: "/historique", label: "Historique", icon: History, match: (p) => p === "/historique" },
  { href: "/boutique", label: "Boutique", icon: Store, match: (p) => p === "/boutique" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={quick}>
      <Shell>{children}</Shell>
      <Toaster position="bottom-center" offset={{ bottom: 24 }} mobileOffset={{ bottom: "var(--toast-bottom, calc(5rem + env(safe-area-inset-bottom)))" }} />
    </MotionConfig>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();
  const current = useCurrentShop();
  const products = useProducts(current?.shop.id);
  const toBuyCount = products.filter((p) => p.status === "to_buy").length;

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (session?.mode === "cloud") return startSync();
  }, [session?.mode]);

  // Réponse du support pas encore lue : un point sur l'onglet Boutique.
  const supportReply = useSyncExternalStore(supportUnread.subscribe, supportUnread.get, () => false);
  useEffect(() => {
    if (session?.mode === "cloud") loadSupport().catch(() => {});
  }, [session?.mode]);

  // Lien de démo (?demo=1) : remplit une boutique d'exemple, sur cet appareil uniquement,
  // puis reste sur la page demandée.
  const [demo] = useState(() => typeof window !== "undefined" && !isCloudConfigured && new URLSearchParams(window.location.search).has("demo"));
  useEffect(() => {
    if (demo && session === null) void seedDemo();
  }, [demo, session]);

  // Juste après la connexion, les boutiques ne sont pas encore sur le téléphone : on attend la
  // première synchro avant de conclure « pas de boutique » (sinon on tombe sur Bienvenue ou le code).
  const [syncedFor, setSyncedFor] = useState<string | null>(null);
  useEffect(() => {
    if (session?.mode !== "cloud") return;
    let live = true;
    const userId = session.userId;
    void syncNow().finally(() => live && setSyncedFor(userId));
    return () => {
      live = false;
    };
  }, [session?.mode, session?.userId]);
  const shopsKnown = session?.mode !== "cloud" || syncedFor === session.userId;

  const isPublic = PUBLIC_ROUTES.includes(pathname);
  const allowsNoShop = NO_SHOP_ROUTES.includes(pathname);

  useEffect(() => {
    if (session === undefined || current === undefined) return;
    if (demo && !current) return;
    if (session === null && !isPublic) router.replace("/accueil");
    else if (session && current === null && !shopsKnown) return;
    else if (session && current === null && !allowsNoShop) router.replace("/bienvenue");
    else if (session && current && (pathname === "/accueil" || pathname === "/decouvrir" || pathname === "/connexion" || pathname === "/bienvenue")) router.replace("/");
    // Connecté depuis « J'ai un code » sans code dans le lien, alors qu'on a déjà une boutique.
    else if (session && current && pathname === "/rejoindre" && !new URLSearchParams(window.location.search).has("code")) router.replace("/");
    else if (session && current === null && (pathname === "/accueil" || pathname === "/decouvrir")) router.replace("/bienvenue");
  }, [session, current, shopsKnown, isPublic, allowsNoShop, pathname, router, demo]);

  const ready = isPublic || (session && (current || allowsNoShop));
  if (!ready) return <div className="min-h-dvh" aria-busy="true" />;

  // Accueil et découverte : plein écran, avec leur propre fond.
  if (pathname === "/accueil" || pathname === "/decouvrir") return <>{children}</>;

  // Écrans d'accueil (connexion, création de boutique) : une colonne centrée, sans navigation.
  if (!current || isPublic || allowsNoShop) {
    return (
      <main className="mx-auto w-full max-w-sm px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-12 sm:max-w-md md:pt-[12vh]">{children}</main>
    );
  }

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[15rem_1fr]">
      {/* Grand écran : barre latérale */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r bg-card/50 md:flex">
        <div className="px-5 pt-6 pb-5">
          <Wordmark />
          <p className="mt-3 truncate text-sm font-medium">{current.shop.name}</p>
        </div>
        <nav className="grid gap-0.5 px-3">
          {NAV.map((item) => (
            <SideLink key={item.href} item={item} active={item.match(pathname)} count={item.href === "/a-racheter" ? toBuyCount : 0} dot={item.href === "/boutique" && supportReply} />
          ))}
        </nav>
        <div className="mt-auto p-4">
          {session?.mode === "cloud" && (
            <div className="-mx-1 mb-3">
              <SupportButton name={current.session.displayName} shopId={current.shop.id} side />
            </div>
          )}
          <SyncStatus />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Téléphone : en-tête compact */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b bg-background/90 px-4 backdrop-blur-md md:hidden">
          <div className="flex min-w-0 items-center gap-2.5">
            <LogoMark />
            <span className="truncate font-semibold">{current.shop.name}</span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <SyncStatus compact />
            {session?.mode === "cloud" && <SupportButton name={current.session.displayName} shopId={current.shop.id} announce={pathname === "/"} />}
          </div>
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-5 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 md:px-10 md:pt-10 md:pb-16">
          {children}
        </main>
      </div>

      {/* Téléphone : barre d'onglets */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-4">
          {NAV.map((item) => (
            <TabLink key={item.href} item={item} active={item.match(pathname)} count={item.href === "/a-racheter" ? toBuyCount : 0} dot={item.href === "/boutique" && supportReply} />
          ))}
        </div>
      </nav>
    </div>
  );
}

function TabLink({ item, active, count, dot }: { item: NavItem; active: boolean; count: number; dot: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
        active ? "text-foreground" : "text-muted-foreground",
      )}
    >
      <span className="relative">
        <Icon className="size-[22px]" strokeWidth={active ? 2.25 : 1.75} aria-hidden />
        {count > 0 && (
          <span className="absolute -top-1.5 left-3.5 min-w-[18px] rounded-full bg-flag px-1 text-center text-[10px] leading-[18px] font-semibold text-flag-foreground tabular-nums">
            {count > 99 ? "99+" : count}
          </span>
        )}
        {dot && <span className="absolute -top-0.5 -right-1 size-2.5 rounded-full bg-primary ring-2 ring-background" />}
      </span>
      {item.label}
      {dot && <span className="sr-only">, le support t’a répondu</span>}
    </Link>
  );
}

function SideLink({ item, active, count, dot }: { item: NavItem; active: boolean; count: number; dot: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
        active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
      )}
    >
      <Icon className="size-[18px]" strokeWidth={active ? 2.25 : 1.75} aria-hidden />
      <span className="flex-1">{item.label}</span>
      {count > 0 && <span className="text-xs font-semibold text-flag-text tabular-nums">{count}</span>}
      {dot && <span className="size-2 rounded-full bg-primary" aria-label="Le support t’a répondu" />}
    </Link>
  );
}

// Marque « Y+ » du kit (docs/brand/logo/mark-blue.svg), en bleu de marque.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="2 2 96 96" className={cn("size-7 shrink-0 text-brand", className)} aria-hidden>
      <path fill="currentColor" d="M6 6H31L64 58.25V96H40V59.8ZM66.5 6H81.5V19.5H95V34.5H81.5V48H66.5V34.5H53V19.5H66.5Z" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)} translate="no">
      <LogoMark />
      <span className="text-[22px] leading-none font-semibold tracking-tight">Yaplus</span>
      <span className="sr-only">, le cahier de réapprovisionnement</span>
    </span>
  );
}
