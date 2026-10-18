# Yaplus

> Y'a plus ? Un tap, c'est noté. Le patron voit tout, même absent.

Cahier de réapprovisionnement partagé pour boutiques : remplace le cahier papier et le groupe WhatsApp.
PWA hors-ligne d'abord (Next.js + IndexedDB/Dexie), synchronisée avec Supabase. Spécification complète : [`docs/PRD.md`](docs/PRD.md).

## Interface

- Composants **shadcn/ui** (Radix) dans `src/components/ui`, icônes **Lucide**, animations **Motion** (`motion/react`), notifications **Sonner**.
- Direction « le cahier » : papier, encre bleue, marge rouge pour les produits à racheter. Police **Lexend**, conçue pour faciliter la lecture.
- Responsive : onglets en bas et feuilles du bas sur téléphone ; barre latérale et fenêtres centrées dès 768 px.
- Mouvement uniquement en réponse à une action (tap, ouverture, confirmation), `prefers-reduced-motion` respecté.
- Règles de design et méthode de travail : [`CLAUDE.md`](CLAUDE.md). Skills installés : `.claude/skills/impeccable` (pbakaus/impeccable, détecteur de tics IA) et `.claude/skills/frontend-design` (anthropics/skills).
- **Démo** : ouvrir `/?demo=1` (sans Supabase configuré) remplit une boutique d'exemple sur l'appareil, pratique pour montrer l'app.

## Démarrer

```bash
npm install
npm run dev        # http://localhost:3000
```

Sans variables d'environnement, l'app tourne en **mode démo « sur cet appareil »** : connexion par prénom,
tout reste dans le téléphone. Idéal pour montrer le geste en boutique.

## Brancher Supabase (mode équipe)

1. Créer un projet Supabase, puis exécuter `supabase/migrations/0001_init.sql` (SQL Editor ou `supabase db push`).
2. Auth → Providers → **Phone** : activer, choisir un fournisseur SMS (Twilio, MessageBird, Vonage…).
   Le code par WhatsApp passe par Twilio (canal `whatsapp`).
3. Copier `.env.example` en `.env.local` et remplir `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Ce qui est en place (v1)

| PRD | Où |
| --- | --- |
| Grille des catégories à l'ouverture, recherche globale | `src/app/page.tsx` |
| Signalement en un tap, note / « x3 » facultatifs | `src/components/ProductRow.tsx`, `ProductSheet.tsx` |
| Création sur place + suggestion anti-doublon (sans fusion auto) | `src/components/ProductSearch.tsx`, `src/lib/text.ts` |
| Vue « À racheter » par catégorie, avec l'auteur, oubliés en haut | `src/app/a-racheter/page.tsx` |
| Partage WhatsApp (`wa.me`, +237 par défaut) | `src/lib/whatsapp.ts` |
| Clôture (patron) + historique figé | `src/lib/actions.ts` → `closeList`, `src/app/historique` |
| Hors-ligne : IndexedDB + outbox + synchro par événement | `src/lib/db.ts`, `src/lib/sync.ts`, `public/sw.js` |
| Temps réel, vue multi-boutiques | `src/lib/sync.ts` (Realtime), `src/app/boutique` |
| Connexion par numéro + code SMS/WhatsApp, invitations par lien | `src/components/SignInForm.tsx`, `src/lib/invites.ts` |
| RLS par boutique, seul le patron invite / retire / clôture | `supabase/migrations/0001_init.sql` |

### Synchronisation

- Chaque écriture va d'abord dans IndexedDB **et** dans une outbox locale, envoyée dans l'ordre dès que le réseau revient.
- `product_events`, `closures`, `closure_items` sont en ajout seul : deux signalements hors-ligne ne s'écrasent jamais.
- Champs simples : la dernière modification gagne (`updated_at`), appliqué côté serveur par un trigger.
- Le curseur de récupération est `synced_at`, posé par le serveur : un téléphone resté hors-ligne une semaine est quand même vu par les autres.

## Scripts

```bash
npm test           # tests unitaires (normalisation, WhatsApp, cycle signaler → clôturer)
npm run lint
npm run typecheck
npm run build
```

## Reste à faire (plan de build)

- Tester la migration SQL sur un vrai projet Supabase et la connexion par SMS au Cameroun (coût, fiabilité).
- Test terrain réseau coupé sur un vrai Android, empaquetage Play Store (Trusted Web Activity).
- Notifications push web (rappels) — la v1 s'appuie sur le marqueur « oublié la dernière fois ».
