import type { MetadataRoute } from "next";
import { COMPARISONS } from "@/content/comparer";
import { GUIDES } from "@/content/guides";
import { MODELES } from "@/content/modeles";
import { TOOLS } from "@/content/outils";
import { abs } from "@/lib/seo";

// Seules les pages publiques : l'app elle-même (cahier, listes, boutique) n'a rien à faire dans les moteurs.
export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({ url: abs(path), changeFrequency: "monthly", priority });
  return [
    page("/accueil", 1),
    page("/modeles", 0.9),
    ...MODELES.map((m) => page(`/modeles/${m.slug}`, 0.8)),
    page("/outils", 0.8),
    ...TOOLS.map((t) => page(`/outils/${t.slug}`, 0.7)),
    page("/comparer", 0.7),
    ...COMPARISONS.map((c) => page(`/comparer/${c.slug}`, 0.7)),
    page("/guides", 0.7),
    ...GUIDES.map((g) => ({ ...page(`/guides/${g.slug}`, 0.6), lastModified: g.date })),
    page("/en-bref", 0.5),
  ];
}
