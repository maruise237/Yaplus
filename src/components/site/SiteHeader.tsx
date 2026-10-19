import Link from "next/link";
import { Wordmark } from "@/components/AppShell";
import { Button } from "@/components/ui/button";

const NAV: [string, string][] = [
  ["Modèles", "/modeles"],
  ["Outils", "/outils"],
  ["Guides", "/guides"],
];

export function SiteHeader() {
  return (
    <header className="relative z-10">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 pr-4 pl-7 sm:pr-8 sm:pl-11">
        <Link href="/accueil" className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Yaplus, accueil">
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Principal">
          {NAV.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="hidden h-11 items-center rounded-lg px-3 text-[15px] font-medium text-foreground/80 transition-colors duration-150 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring md:flex"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/connexion"
            className="flex h-11 items-center rounded-lg px-3 text-[15px] font-medium text-foreground/80 transition-colors duration-150 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            Se connecter
          </Link>
          <Button size="touch" className="hidden sm:inline-flex" asChild>
            <Link href="/connexion?mode=inscription">Créer ma boutique</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
