import Link from "next/link";
import { Wordmark } from "@/components/AppShell";
import { COMPARISONS } from "@/content/comparer";
import { GUIDES } from "@/content/guides";
import { SITE_TEMPLATES } from "@/content/shop-templates";
import { TOOLS } from "@/content/outils";
import { cn } from "@/lib/utils";

const COLUMNS: { title: string; links: [string, string][] }[] = [
  {
    title: "Yaplus",
    links: [
      ["Accueil", "/accueil"],
      ["Essayer le geste", "/decouvrir"],
      ["Créer ma boutique", "/connexion?mode=inscription"],
      ["Se connecter", "/connexion"],
      ["Rejoindre une boutique", "/rejoindre"],
      ["Yaplus en bref", "/en-bref"],
    ],
  },
  {
    title: "Modèles",
    links: [...SITE_TEMPLATES.slice(0, 6).map((t): [string, string] => [t.label, `/modeles/${t.slug}`]), ["Tous les modèles", "/modeles"]],
  },
  { title: "Comparer", links: COMPARISONS.map((c) => [`${c.versus[0].toUpperCase()}${c.versus.slice(1)}`, `/comparer/${c.slug}`]) },
  { title: "Outils gratuits", links: TOOLS.map((t) => [t.name, `/outils/${t.slug}`]) },
  { title: "Guides", links: GUIDES.map((g) => [g.title, `/guides/${g.slug}`]) },
];

// Pied de page des pages publiques : la carte du site, pour les visiteurs comme pour les moteurs.
export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("border-t", className)}>
      <div className="mx-auto max-w-6xl pt-14 pr-4 pb-10 pl-7 sm:pr-8 sm:pl-11">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.1fr_repeat(4,1fr)] lg:gap-8">
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title} className={col.title === "Guides" ? "col-span-2 lg:col-span-1" : undefined}>
              <p className="text-[15px] font-semibold">{col.title}</p>
              <ul className="mt-2">
                {col.links.map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="flex min-h-11 items-center py-1 text-[15px] leading-snug text-muted-foreground underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline lg:min-h-9"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t pt-8 text-[15px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <Wordmark className="text-foreground" />
          <p>Y a plus&#8239;? On le note.</p>
        </div>
      </div>
    </footer>
  );
}
