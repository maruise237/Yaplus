# Yaplus

> Y'a plus ? Un tap, c'est noté. Le patron voit tout, même absent.

Cahier de réapprovisionnement partagé pour boutiques : remplace le cahier papier et le groupe WhatsApp.
PWA hors-ligne d'abord (Next.js + IndexedDB/Dexie), synchronisée avec une API Next.js et Postgres **Neon**, hébergée sur **Vercel**.
En ligne : https://yaplus-blush.vercel.app. Spécification complète : [`docs/PRD.md`](docs/PRD.md).

## Interface

- Composants **shadcn/ui** (Radix) dans `src/components/ui`, icônes **Lucide**, animations **Motion** (`motion/react`), notifications **Sonner**.
- Identité : kit de marque v1 dans `docs/brand` (logo « Y+ », bleu `#0B7BE0`, anthracite, police **Outfit**). Le rouge marque uniquement les produits à racheter.
- Responsive : onglets en bas et feuilles du bas sur téléphone ; barre latérale et fenêtres centrées dès 768 px.
- Mouvement uniquement en réponse à une action (tap, ouverture, confirmation), `prefers-reduced-motion` respecté.
- Règles de design et méthode de travail : [`CLAUDE.md`](CLAUDE.md). Skills installés : `.claude/skills/impeccable` (pbakaus/impeccable, détecteur de tics IA) et `.claude/skills/frontend-design` (anthropics/skills).
- **Démo** : ouvrir `/?demo=1` (sans serveur branché) remplit une boutique d'exemple sur l'appareil, pratique pour montrer l'app.

## Démarrer

```bash
npm install
npm run dev        # http://localhost:3000
```

Sans variables d'environnement, l'app tourne en **mode démo « sur cet appareil »** : connexion par prénom,
tout reste dans le téléphone. Idéal pour montrer le geste en boutique.

## Mode équipe : Vercel + Neon

- Projet Vercel `yaplus` (équipe maruise237s-projects), base Neon `yaplus-db` (Francfort, offre gratuite)
  branchée par l'intégration Vercel : `DATABASE_URL` et `DATABASE_URL_UNPOOLED` sont posées automatiquement.
- Variables à ajouter : `AUTH_SECRET` (signature des sessions, 32 caractères minimum) et `NEXT_PUBLIC_CLOUD_SYNC=1`.
- Schéma : `db/schema.sql`, rejouable, appliqué par `npm run db:migrate` (lit `.env.local`).
- En local : `vercel env pull .env.local`, ajouter `AUTH_SECRET` et `NEXT_PUBLIC_CLOUD_SYNC=1`, puis `npm run dev`.
- Déployer : `vercel deploy --prod`.

Comptes : numéro + mot de passe, aucun SMS, aucun e-mail. Le serveur garde le mot de passe haché (scrypt),
pose un cookie de session httpOnly valable un an, et freine les essais en rafale (8 échecs / 15 min par numéro).

API (`src/app/api`) : `auth/signup`, `auth/signin`, `auth/signout`, `sync/push`, `sync/pull`, `invites`, `invites/accept`.
La base n'est jamais exposée aux téléphones ; les droits par boutique sont vérifiés dans `src/server/rules.ts`.

## Panneau d'administration (caché)

- Servi seulement sous une adresse secrète : `/<ADMIN_PATH>`. Le chemin interne `/admin` répond 404, comme toute
  adresse inconnue (`src/proxy.ts`). Aucun lien n'y mène, les pages sont `noindex` et jamais gardées en cache.
- Accès : un numéro listé dans `ADMIN_PHONES`, le mot de passe de ce compte Yaplus et le code à 6 chiffres
  d'une appli d'authentification (`ADMIN_TOTP_SECRET`). 5 échecs ferment le panneau 15 minutes.
- Session à part : cookie de 8 heures, envoyé seulement à l'adresse secrète, signé avec une clé distincte de celle du cahier.
- Contenu : vue d'ensemble (métriques v1 du PRD), boutiques, comptes, support, réglages,
  journal des actions admin (`admin_events`).
- Mot de passe oublié : le bouton de la connexion ouvre WhatsApp vers le support, avec le numéro tapé. L'admin vérifie
  (le message vient-il de ce numéro ?), puis crée dans Comptes un lien à usage unique (24 heures, annulable, seule
  l'empreinte est en base) envoyé sur le WhatsApp du compte. Le lien ouvre `/nouveau-mot-de-passe#<jeton>`.
- Centre d'aide (`src/components/SupportCenter.tsx`) : bouton casque en haut du téléphone (il s'allonge en
  « Besoin d'aide ? » à chaque arrivée sur le Cahier), Boutique puis Aide, et « Besoin d'aide ? » à la connexion.
  Accueil, Messages, Aide : questions fréquentes lisibles sans réseau (`FAQ` dans `src/lib/support.ts`), sujet choisi
  en un tap avant d'écrire (`support_messages.topic`). Une conversation par compte (`support_threads`,
  `support_messages`), réponses dans l'onglet Support du panneau, filtrables par sujet, avec des réponses toutes faites.
  Le numéro WhatsApp du support se règle dans Réglages (`app_settings`).
- Mise en place : `node scripts/admin-setup.mjs 2376XXXXXXXX`, copier les trois variables dans Vercel, puis `npm run db:migrate`.
  Sans ces variables, le panneau n'existe pas.

## Ce qui est en place (v1)

| PRD | Où |
| --- | --- |
| Découverte (3 écrans avant le compte : démo jouable, objectif, avant / après) | `src/app/(app)/decouvrir`, `src/components/onboarding` |
| Grille des catégories à l'ouverture, recherche globale | `src/app/(app)/page.tsx` |
| Signalement en un tap, note / « x3 » facultatifs | `src/components/ProductRow.tsx`, `ProductSheet.tsx` |
| Création sur place + suggestion anti-doublon (sans fusion auto) | `src/components/ProductSearch.tsx`, `src/lib/text.ts` |
| Vue « À racheter » par catégorie, avec l'auteur, oubliés en haut | `src/app/(app)/a-racheter/page.tsx` |
| Partage WhatsApp (`wa.me`, +237 par défaut) | `src/lib/whatsapp.ts` |
| Clôture (patron) + historique figé | `src/lib/actions.ts` → `closeList`, `src/app/(app)/historique` |
| Hors-ligne : IndexedDB + outbox + synchro par événement | `src/lib/db.ts`, `src/lib/sync.ts`, `public/sw.js` |
| Quasi temps réel (relève toutes les 15 s quand l'app est à l'écran), vue multi-boutiques | `src/lib/sync.ts`, `src/app/(app)/boutique` |
| Connexion par numéro + mot de passe (sans code, sans fournisseur), invitations par lien | `src/lib/auth.ts`, `src/components/SignInForm.tsx`, `src/lib/invites.ts` |
| Droits par boutique, seul le patron invite / retire / clôture | `src/server/rules.ts`, `db/schema.sql` |

### Synchronisation

- Chaque écriture va d'abord dans IndexedDB **et** dans une outbox locale, envoyée dans l'ordre dès que le réseau revient.
- `product_events`, `closures`, `closure_items` sont en ajout seul : deux signalements hors-ligne ne s'écrasent jamais.
- Champs simples : la dernière modification gagne (`updated_at`), appliqué côté serveur par un trigger.
- Le curseur de récupération est `synced_at`, posé par le serveur : un téléphone resté hors-ligne une semaine est quand même vu par les autres.

## Scripts

```bash
npm test           # tests unitaires (normalisation, WhatsApp, cycle signaler → clôturer, droits serveur)
npm run db:migrate # applique db/schema.sql sur Neon
npm run lint
npm run typecheck
npm run build
```

## Reste à faire (plan de build)

- Test terrain réseau coupé sur un vrai Android, empaquetage Play Store (Trusted Web Activity).
- Notifications push web (rappels) — la v1 s'appuie sur le marqueur « oublié la dernière fois ».
