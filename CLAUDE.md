# Yaplus — règles de travail

Cahier de réapprovisionnement partagé pour boutiques (Cameroun d'abord). Spécification : `docs/PRD.md`.
Utilisateurs : employés de boutique, parfois peu à l'aise à l'écrit, une main, petits Android, réseau instable.

## Méthode (à appliquer à chaque changement d'interface)

1. Charger le skill `.claude/skills/frontend-design` avant tout travail d'interface.
2. Rechercher sur le web chaque besoin non trivial ; si une compétence manque, chercher le meilleur dépôt
   (skill, lib, guide) et l'installer dans `.claude/skills/` ou en dépendance.
3. Construire, puis **capturer l'écran** (Playwright, mobile 390px + desktop 1280px, clair + sombre),
   s'auto-critiquer (hiérarchie, alignements, décalages, cibles tactiles, textes) et corriger.
   Recommencer en boucle jusqu'à ne plus trouver de défaut, avant de pousser.
4. Référence : Vercel Web Interface Guidelines (cibles ≥ 44px, inputs ≥ 16px, pas d'autofocus mobile,
   `prefers-reduced-motion`, jamais `transition: all`, états vides / erreur / chargement conçus).

## Direction visuelle : « le cahier »

L'app remplace un cahier d'écolier : on en reprend les codes, sans pastiche.

| Jeton | Clair | Rôle |
| --- | --- | --- |
| paper | `#FBFCFE` | fond |
| ink | `#1B2A4A` | texte (encre bleu-noir) |
| bic | `#2347C5` | actions principales |
| margin | `#D7263D` | « y'a plus » : produits à racheter, et rien d'autre |
| rule | `#DCE4F2` | lignes et bordures |
| bought | `#1F8A5B` | acheté |

- Typo : **Atkinson Hyperlegible Next** (une seule famille), choisie pour la lisibilité sur petits écrans.
- L'élément mémorable : la **marge rouge** des listes de produits, où le signalement s'inscrit.
  Tout le reste reste calme.
- Composants : shadcn/ui (`src/components/ui`), icônes Lucide, animations Motion (`motion/react`).

## Interdits (tics de design généré)

- Emojis comme icônes ; `prompt()`, `confirm()`, `alert()` natifs.
- Libellés en MAJUSCULES, sur-titres au-dessus des titres, infos jointes par « · ».
- Cartes arrondies identiques partout, ombres grises génériques, dégradés décoratifs.
- Animations d'entrée en cascade au chargement. Le mouvement répond seulement à une action
  (tap, ouverture, confirmation), 120–220 ms, sans rebond.
- Texte marketing dans l'app : des verbes simples, en langage de boutique.
