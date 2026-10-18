# Yaplus — PRD v1

> Cahier de réapprovisionnement pour commerces. « Y'a plus ? Un tap, c'est noté. »

Oct 18, 2026 · @jules

## Vision et problème

Le produit remplace le cahier papier et le groupe WhatsApp de la boutique par un cahier partagé où chaque produit fini se signale en un geste, et que le patron voit en direct, même absent.

Aujourd'hui, la liste de réapprovisionnement est écrite à la main, souvent illisible. Chaque employé écrit sur sa propre page, et il faut filmer ou photographier les feuilles pour les envoyer au patron. Les produits oubliés d'un achat à l'autre ne sont rappelés par personne.

Le vrai concurrent n'est pas une autre application, c'est la feuille et le message WhatsApp. Si signaler une rupture prend plus de temps qu'écrire sur le papier, personne ne gardera l'app. Le critère de réussite du produit tient en une phrase : un employé signale un produit fini en moins de 5 secondes, sans rien taper de long.

## Personas

Trois rôles, tous sur le même cahier, avec des besoins différents.

| Persona | Qui c'est | Ce qu'il fait aujourd'hui | Ce qu'il attend de l'app |
| --- | --- | --- | --- |
| Le patron | Propriétaire d'une ou plusieurs boutiques, il paie l'abonnement | Récupère les listes de chaque employé, les recopie, puis part acheter | Une seule liste propre, à jour, qu'il peut envoyer à son fournisseur |
| L'employé | Vendeur ou technicien en boutique, pas forcément à l'aise à l'écrit | Note sur papier ou envoie une photo au patron | Ouvrir sa catégorie, toucher le produit fini, c'est tout |
| Le patron absent | Le même patron, en déplacement ou dans une autre boutique | Appelle ou attend le retour pour savoir ce qui manque | Voir en direct les ruptures de chaque boutique et qui les a signalées |

Exemples concrets du terrain : le technicien qui ouvre sa catégorie Afficheurs, touche le modèle KG5 parce qu'il n'en reste plus, puis ouvre Accessoires et touche la pochette Itel A100. Le patron sait déjà combien en racheter. Aucune quantité à saisir.

## Parcours clés

**1. Signaler une rupture (employé)**

1. Il ouvre l'app, qui s'ouvre directement sur la grille des catégories.
2. Il touche une catégorie (Afficheurs), puis le produit fini (KG5).
3. Le produit passe en "à racheter", une note ou un "x3" reste possible mais jamais demandé.
4. S'il ne trouve pas le produit, il tape les premières lettres. L'app propose les produits existants. Si rien ne correspond, il le crée sur place et le range dans la catégorie.

**2. Préparer et partager la liste (patron)**

1. Il ouvre "À racheter" : tous les produits en rupture, regroupés par catégorie, avec le nom de l'employé qui les a signalés.
2. Il retire ou ajoute ce qu'il veut.
3. Il choisit un numéro WhatsApp (fournisseur ou autre), l'app ouvre WhatsApp avec un message déjà formaté par catégorie.

**3. Clôturer un achat (patron)**

1. Il coche ce qu'il a acheté pendant ou après ses courses.
2. Il clôture la liste. Elle part dans l'historique avec date, auteur et détail.
3. Les produits non cochés restent "à racheter" et remontent en haut avec le marqueur "oublié la dernière fois".

**4. Travailler sans réseau (tous)**

1. L'app s'ouvre et fonctionne sans connexion : la grille, les produits, les signalements.
2. Chaque action est gardée localement avec un indicateur "en attente de synchro".
3. Au retour du réseau, tout part tout seul. Un signalement fait hors-ligne n'est jamais perdu ni écrasé.

## Périmètre v1

La v1 couvre le cycle complet (signaler, partager, acheter, clôturer) sur web et Android, hors-ligne compris. Tout ce qui n'aide pas ce cycle attend la v2.

| Priorité | Fonctionnalité | Détail |
| --- | --- | --- |
| Indispensable | Comptes et boutiques | Le patron crée son compte et une ou plusieurs boutiques, invite ses employés par lien ou numéro |
| Indispensable | Cahier par catégories | Catégories libres, produits libres, création possible par le patron et par les employés |
| Indispensable | Signalement en un geste | Un tap met un produit "à racheter", un autre le remet "en stock" |
| Indispensable | Vue "À racheter" | Tous les produits à racheter, groupés par catégorie, avec l'auteur du signalement |
| Indispensable | Hors-ligne | Lecture et écriture sans réseau, synchro automatique au retour |
| Indispensable | Partage WhatsApp | Choix d'un numéro, ouverture de WhatsApp avec message formaté par catégorie |
| Indispensable | Clôture et historique | Clôture d'une liste, historique consultable avec date, auteur et détail |
| Important | Suggestion anti-doublon | À la saisie, l'app propose le produit existant le plus proche, sans fusion automatique |
| Important | Oubliés | Produits non achetés remontés en haut avec le marqueur "oublié la dernière fois" |
| Important | Vue patron multi-boutiques | Ruptures de chaque boutique en direct, avec le nom de l'employé |
| Important | Android | PWA installable, puis empaquetage Play Store |
| Utile | Recherche | Recherche par nom dans tout le cahier |
| Utile | Quantité et note optionnelles | "x3", "urgent", jamais obligatoires |

## Repoussé en v2

Ces points sont utiles mais ne servent pas à valider l'idée. On les ajoute une fois que de vraies boutiques utilisent la v1 chaque jour.

- Saisie vocale pour dicter les produits
- Rappels push avancés (la v1 se limite au marqueur "oublié" dans l'app)
- Photo du produit ou du rayon
- Statistiques : produits qui manquent le plus souvent, fréquence de rupture
- Suggestion de fournisseur par produit
- Rôles fins pour les employés (lecture seule, droits par catégorie)
- Export PDF ou Excel de l'historique
- Application iOS dédiée

## Règles produit

Ces règles sont tranchées et servent de référence pour le build.

- **Un produit, un nom libre.** Pas d'unité ni de quantité obligatoires. "Sac de riz 50kg" ou "Afficheur KG5" est un produit à part entière.
- **Trois états.** En stock, à racheter, acheté. Un tap fait passer de l'un à l'autre.
- **Pas de liste à créer.** La "liste du moment" est simplement l'ensemble des produits à racheter, regroupés par catégorie.
- **Doublons.** À la saisie, l'app compare avec les produits existants et propose "Riz 50kg existe déjà, c'est lui ?". Aucune fusion automatique, l'utilisateur décide.
- **Droits.** Le patron et les employés peuvent tous créer des produits et des catégories. Le patron voit tout de suite ce qui est créé et peut renommer, fusionner ou supprimer. Seul le patron gère les employés, la facturation et la clôture.
- **Clôture.** Elle fige la liste dans l'historique. Les produits non cochés restent "à racheter" avec le marqueur "oublié la dernière fois".
- **Rien ne se perd.** Un produit supprimé est archivé, pas effacé, pour que l'historique reste cohérent.

## Modèle de données

Base Postgres (Neon, via Vercel). Tous les identifiants sont des UUID générés sur l'appareil, pour qu'un produit créé hors-ligne existe avant même d'avoir touché le serveur. Chaque table porte `updated_at` et un `archived_at` à la place d'une vraie suppression.

| Table | Rôle | Champs principaux |
| --- | --- | --- |
| `shops` | Une boutique | id, owner\_id, name, created\_at |
| `shop_members` | Qui a accès à quelle boutique | shop\_id, user\_id, role (owner ou employee), display\_name, joined\_at, removed\_at |
| `invites` | Invitation d'un employé | id, shop\_id, code, expires\_at, used\_at |
| `categories` | Les pages du cahier | id, shop\_id, name, position, created\_by, archived\_at, updated\_at |
| `products` | Un produit du cahier | id, shop\_id, category\_id, name, name\_normalized, status (in\_stock, to\_buy, bought), note, flagged\_by, flagged\_at, forgotten\_count, created\_by, archived\_at, updated\_at |
| `product_events` | Journal de chaque changement d'état, jamais modifié | id, product\_id, shop\_id, type (flagged, restocked, bought, created), user\_id, at |
| `closures` | Une clôture de liste | id, shop\_id, closed\_by, closed\_at, shared\_to\_phone |
| `closure_items` | Le détail figé d'une clôture | id, closure\_id, product\_id, product\_name, category\_name, bought (oui ou non), note |

Points de conception à retenir :

- **`name_normalized`** (minuscules, sans accents, espaces nettoyés) sert à la suggestion anti-doublon et à la recherche.
- **`product_events`** est ajouté, jamais écrasé. Deux employés qui signalent le même produit hors-ligne produisent deux événements, aucun n'écrase l'autre, et le patron voit qui a signalé quoi.
- **`closure_items`** copie le nom du produit et de la catégorie au moment de la clôture, pour que l'historique reste lisible même si le produit est renommé ensuite.
- **`forgotten_count`** augmente à chaque clôture où le produit reste non acheté, et pilote le marqueur "oublié la dernière fois".
- **Sécurité par boutique** : chaque table est protégée par une règle (RLS) qui ne laisse lire et écrire que les membres actifs de la boutique. Seul le rôle `owner` peut inviter, retirer un membre ou clôturer.

## Architecture technique

PWA offline-first sur Next.js, Vercel et Postgres Neon. Android passe d'abord par l'installation de la PWA, puis par un empaquetage Play Store.

| Brique | Choix | Pourquoi |
| --- | --- | --- |
| Interface | Next.js en PWA installable | Une seule base de code pour web et Android |
| Stockage local | IndexedDB (via Dexie) | Tout le cahier est lisible et modifiable sans réseau |
| File d'attente | Une "outbox" locale des actions non envoyées | Chaque action part dès que le réseau revient, dans l'ordre |
| Backend | API Next.js sur Vercel + Postgres Neon | Une seule app à déployer ; comptes et droits gérés par l'API |
| Temps réel | Relève toutes les 15 s quand l'app est ouverte | Le patron voit les signalements arriver sans recharger |
| Connexion | Numéro de téléphone + mot de passe, sans code SMS ni WhatsApp | Aucun fournisseur d'envoi à payer ; le numéro sert d'identifiant |
| Partage | Lien `wa.me` avec message encodé | Aucune API payante, fonctionne sur tout téléphone avec WhatsApp |
| Rappels | Notifications push web sur Android | iOS reste limité, le marqueur dans l'app fait office de rappel |
| Android | PWA puis Trusted Web Activity pour le Play Store | Réutilise le compte développeur existant |

**Synchronisation.** On synchronise produit par produit et événement par événement, jamais la liste entière. Un changement d'état est un événement ajouté au journal, donc deux appareils hors-ligne ne se contredisent pas. Pour les champs simples comme le nom ou la note, la dernière modification gagne, comparée sur `updated_at`.

**Message WhatsApp.** Le texte est généré par catégorie, un produit par ligne, avec le nom de la boutique et la date en en-tête. Le numéro saisi est normalisé au format international (indicatif +237 par défaut) avant d'ouvrir le lien.

**Points de vigilance.** Données légères pour les connexions lentes, interface utilisable à une main sur petit écran, et temps d'ouverture de l'app sous 2 secondes, hors-ligne compris.

## Plan de build

Cinq semaines pour une v1 utilisable en vraie boutique, en solo. Chaque étape finit par quelque chose que tu peux montrer à ton cousin.

1. **Semaine 1, socle.** Projet Next.js, Vercel et Neon, connexion par numéro et mot de passe, boutiques, membres, règles de sécurité. Tu peux créer une boutique et inviter quelqu'un.
2. **Semaine 2, le cahier.** Catégories, produits, signalement en un tap, vue "À racheter", suggestion anti-doublon. Utilisable en ligne, avec le design final de la grille.
3. **Semaine 3, hors-ligne.** IndexedDB, outbox, synchro par événement, indicateur "en attente", installation PWA. Test avec le réseau coupé sur un vrai téléphone Android.
4. **Semaine 4, partage et clôture.** Message WhatsApp par catégorie, clôture, historique, marqueur "oublié", vue patron multi-boutiques en temps réel.
5. **Semaine 5, terrain.** Correction des frictions vues en boutique, empaquetage Play Store, page d'accueil simple, onboarding de 3 premières boutiques.

Tout ce qui n'est pas dans le périmètre v1 attend la fin de la semaine 5, même si l'idée est bonne.

## Validation terrain et métriques

Tu vis le problème avec ton cousin technicien et tu connais des gens du domaine, donc la validation commence avant la première ligne de code.

**Avant de coder (semaine 0).**

- Regarder 3 à 5 boutiques de types différents (téléphonie, alimentation, quincaillerie) faire leur liste, sans rien expliquer.
- Noter les catégories qu'elles utilisent et le vocabulaire exact des produits, pour préremplir un modèle de cahier par type de commerce.
- Demander combien de temps leur prend la liste aujourd'hui et qui la lit.

**Métriques de la v1.**

| Métrique | Seuil visé |
| --- | --- |
| Temps pour signaler un produit existant | Moins de 5 secondes |
| Boutiques qui utilisent l'app chaque semaine après un mois | 3 sur 3 |
| Employés actifs par boutique sur 7 jours | Au moins 1 |
| Listes clôturées par semaine et par boutique | Au moins 1 |
| Perte de signalement hors-ligne | Zéro |

Si un employé retourne au papier après une semaine, on cherche pourquoi avant d'ajouter la moindre fonctionnalité.

## Risques et questions ouvertes

| Sujet | Risque ou question | Piste |
| --- | --- | --- |
| Nom du produit | Tranché : **Yaplus** (« y'a plus »), court et facile à dire à l'oral | Identité visuelle à finaliser |
| Prix | Combien le patron paie, et par boutique ou par compte | À tester en boutique, hypothèse de départ : abonnement mensuel par boutique, employés illimités |
| Connexion par numéro | Tranché : numéro + mot de passe, pas de code envoyé | Prévoir la réinitialisation du mot de passe par le patron |
| Rappels sur iOS | Les notifications push web y sont limitées | Le marqueur dans l'app et le lien WhatsApp comblent le manque en v1 |
| Vocabulaire | Les produits s'écrivent de 10 façons différentes | Suggestion anti-doublon et modèles de cahier par type de commerce |
| Adoption des employés | Un employé peut préférer le papier par habitude | Mot de passe court accepté (chiffres), grille de catégories dès l'ouverture, aucune saisie obligatoire |
| Concurrence indirecte | EasyStor et les autres outils de stock sont plus lourds | Rester sur le geste "c'est fini", sans inventaire ni caisse |

**Questions à trancher ensuite.** L'identité visuelle, le tarif, et le premier type de commerce à cibler pour les modèles de cahier prérempli.
