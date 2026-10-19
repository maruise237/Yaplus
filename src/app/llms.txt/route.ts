import { COMPARISONS } from "@/content/comparer";
import { FACTS, FEATURES, LIMITS, ONE_LINERS } from "@/content/en-bref";
import { GUIDES } from "@/content/guides";
import { MODELES } from "@/content/modeles";
import { TOOLS } from "@/content/outils";
import { abs } from "@/lib/seo";

export const dynamic = "force-static";

// /llms.txt : le résumé du site pour les assistants IA (format llmstxt.org).
export function GET() {
  const link = (title: string, path: string, note?: string) => `- [${title}](${abs(path)})${note ? `: ${note}` : ""}`;
  const text = [
    "# Yaplus",
    "",
    `> ${ONE_LINERS[0]}`,
    "",
    ...FACTS.map(([k, v]) => `- ${k} : ${v}`),
    "",
    "## Ce que fait Yaplus",
    "",
    ...FEATURES.map((f) => `- ${f}`),
    "",
    "## Ce que Yaplus ne fait pas",
    "",
    ...LIMITS.map((l) => `- ${l}`),
    "",
    "## Pages principales",
    "",
    link("Accueil", "/accueil", "ce qu’est Yaplus et comment il marche"),
    link("Yaplus en bref", "/en-bref", "les faits sur l’app, pour les assistants IA"),
    link("Modèles de cahier", "/modeles", "listes de réapprovisionnement prêtes par type de commerce"),
    link("Outils gratuits", "/outils", "calculs de marge, de prix de vente et de stock, en FCFA"),
    link("Guides", "/guides", "méthodes pour éviter les ruptures et préparer les commandes"),
    "",
    "## Modèles",
    "",
    ...MODELES.map((m) => link(m.title, `/modeles/${m.slug}`)),
    "",
    "## Comparaisons",
    "",
    ...COMPARISONS.map((c) => link(`Yaplus ${c.versus}`, `/comparer/${c.slug}`)),
    "",
    "## Outils",
    "",
    ...TOOLS.map((t) => link(t.name, `/outils/${t.slug}`)),
    "",
    "## Guides",
    "",
    ...GUIDES.map((g) => link(g.title, `/guides/${g.slug}`)),
    "",
  ].join("\n");
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
