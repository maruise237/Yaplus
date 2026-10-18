# Yaplus — règles de travail

Cahier de réapprovisionnement partagé pour boutiques (Cameroun d'abord). Spécification : `docs/PRD.md`.
Utilisateurs : employés de boutique, parfois peu à l'aise à l'écrit, une main, petits Android, réseau instable.

## Méthode (à appliquer à chaque changement d'interface)

1. Charger les skills d'interface avant tout travail d'interface :
   - `.claude/skills/impeccable` (pbakaus/impeccable) : lancer `scripts/impeccable context`, lire
     `reference/craft-floor.md` avant toute modification, puis la référence de la commande (polish, critique…).
   - `.claude/skills/frontend-design` (anthropics/skills) : direction visuelle.
2. Rechercher sur le web chaque besoin non trivial ; si une compétence manque, chercher le meilleur dépôt
   (skill, lib, guide) et l'installer dans `.claude/skills/` ou en dépendance.
3. Construire, puis **capturer l'écran** (Playwright, mobile 390px + desktop 1280px, clair + sombre),
   s'auto-critiquer (hiérarchie, alignements, décalages, cibles tactiles, textes) et corriger.
   Recommencer en boucle jusqu'à ne plus trouver de défaut, avant de pousser.
4. Détecteur de tics IA après chaque changement d'interface (doit rendre `[]`) :
   `scripts/impeccable detect --json src` puis, serveur lancé, sur les pages rendues avec données de démo
   `scripts/impeccable detect --json --viewport 390x844 "http://localhost:3000/a-racheter?demo=1"`
   (et 1280x800). En root, `IMPECCABLE_BROWSER` doit pointer vers un Chromium lancé avec `--no-sandbox`.
5. Référence : Vercel Web Interface Guidelines (cibles ≥ 44px, inputs ≥ 16px, pas d'autofocus mobile,
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
- Bordure latérale colorée de plus de 1px sur une carte, une ligne ou une alerte.
- Fenêtre modale par réflexe : préférer l'édition sur place quand rien ne doit être protégé.
- Surfaces navigateur laissées par défaut (sélection, curseur de saisie, focus).
- Animations d'entrée en cascade au chargement. Le mouvement répond seulement à une action
  (tap, ouverture, confirmation), 120–220 ms, sans rebond.
- Texte marketing dans l'app : des verbes simples, en langage de boutique.
