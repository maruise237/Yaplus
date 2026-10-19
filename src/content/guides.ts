// Pages /guides/[slug] : des réponses courtes et pratiques aux questions du commerçant.
// Un paragraphe peut contenir un lien interne écrit [texte](/chemin).

export type GuideSection = { heading: string; paragraphs: string[]; list?: string[] };

export type Guide = {
  slug: string;
  title: string;
  h1: string;
  description: string;
  date: string;
  intro: string;
  sections: GuideSection[];
  faq: [string, string][];
};

export const GUIDES: Guide[] = [
  {
    slug: "faire-une-liste-de-reapprovisionnement",
    title: "Comment faire une liste de réapprovisionnement pour sa boutique",
    h1: "Comment faire une liste de réapprovisionnement qui sert vraiment",
    description:
      "Une bonne liste de réapprovisionnement est remplie par toute l’équipe, rangée comme la boutique et lisible par le fournisseur. La méthode en 5 étapes, avec un modèle gratuit.",
    date: "2026-10-19",
    intro:
      "Une liste de réapprovisionnement, c’est la liste de ce qu’il faut racheter avant la rupture. Tout le monde en a une, sur un cahier, une feuille ou dans un groupe WhatsApp. Celles qui marchent ont quatre points communs : elles sont faciles à remplir, rangées comme la boutique, précises et partagées.",
    sections: [
      {
        heading: "1. Range la liste comme la boutique",
        paragraphs: [
          "Fais une catégorie par rayon ou par famille de produits : Boissons, Hygiène, Conserves ; ou Afficheurs, Batteries, Accessoires. Celui qui remarque un produit fini sait tout de suite où le noter, et le fournisseur reçoit une commande rangée.",
          "Garde entre 4 et 8 catégories. Au-delà, on hésite. Une catégorie Divers accueille le reste.",
        ],
      },
      {
        heading: "2. Un produit, c’est une référence précise",
        paragraphs: [
          "« Riz » ne suffit pas. « Riz 25 kg » et « Riz 5 kg » ne s’achètent pas au même prix ni au même endroit. Écris le format, la taille ou le modèle dans le nom du produit.",
          "C’est ce qui permet d’envoyer la liste au fournisseur sans l’appeler pour préciser.",
        ],
        list: ["Pochette Itel A100, pas « pochettes »", "Pointes de 70, pas « pointes »", "Castel 65 cl, pas « bières »"],
      },
      {
        heading: "3. Signale avant la rupture",
        paragraphs: [
          "Le bon moment pour noter un produit n’est pas quand l’étagère est vide, mais quand il reste juste de quoi tenir jusqu’à la livraison. Pour les produits qui partent vite, ce seuil se calcule : c’est le [point de commande](/outils/point-de-commande).",
          "Pour le reste, une règle simple marche bien : on signale quand on ouvre le dernier carton.",
        ],
      },
      {
        heading: "4. Toute l’équipe remplit la même liste",
        paragraphs: [
          "Les ruptures sont vues par ceux qui servent les clients, pas par le patron. Si chacun note sur sa propre page, il faut tout rassembler le soir, et des lignes se perdent.",
          "Une seule liste, que chacun peut remplir en quelques secondes, est la seule qui reste à jour. Plus c’est rapide à remplir, plus elle est remplie : si noter prend plus de temps qu’écrire sur un bout de papier, personne ne le fera.",
        ],
      },
      {
        heading: "5. Coche ce qui est acheté, garde le reste",
        paragraphs: [
          "Pendant les achats, coche ce que tu prends. Ce que tu n’as pas trouvé doit rester dans la liste et revenir en haut la fois suivante. C’est là que la plupart des listes papier échouent : on recommence une page neuve, et l’oublié est oublié deux fois.",
        ],
      },
      {
        heading: "Le faire avec Yaplus",
        paragraphs: [
          "Yaplus applique ces cinq règles. Tu crées ta boutique à partir d’un [modèle de catégories](/modeles), chaque employé touche le produit fini sur son téléphone, et la liste part au fournisseur sur WhatsApp. Ce qui n’est pas acheté remonte tout seul.",
        ],
      },
    ],
    faq: [
      ["Quelle différence entre liste de réapprovisionnement et inventaire ?", "L’inventaire compte tout ce qui est en stock. La liste de réapprovisionnement ne note que ce qu’il faut racheter. Elle est beaucoup plus rapide à tenir."],
      ["À quelle fréquence faire la liste ?", "Elle se remplit en continu, au moment où on remarque un produit fini. On la relit avant chaque achat."],
      ["Faut-il noter les quantités ?", "Ce n’est pas obligatoire. Le patron sait souvent combien racheter. Pour les gros produits, le calcul de la quantité à commander aide."],
    ],
  },
  {
    slug: "eviter-les-ruptures-de-stock",
    title: "Éviter les ruptures de stock dans une petite boutique",
    h1: "Éviter les ruptures de stock sans logiciel compliqué",
    description:
      "Les ruptures de stock font perdre des ventes et des clients. Six habitudes simples pour les éviter dans une boutique, une alimentation ou un bar, sans compter tout le stock.",
    date: "2026-10-19",
    intro:
      "Un client qui ne trouve pas son produit achète ailleurs, et parfois ne revient pas. Dans une petite boutique, la plupart des ruptures ne viennent pas d’un manque d’argent mais d’un oubli : quelqu’un a vu que le produit finissait, et l’information n’est pas arrivée jusqu’à celui qui achète.",
    sections: [
      {
        heading: "Pourquoi on tombe en rupture",
        paragraphs: ["Trois causes reviennent presque toujours :"],
        list: [
          "Le produit fini n’a pas été noté, ou il a été noté sur une feuille perdue.",
          "Il a été noté trop tard, quand il n’y avait plus le temps d’attendre la livraison.",
          "Il était sur la liste, mais il n’a pas été trouvé ou acheté, et personne ne l’a reporté.",
        ],
      },
      {
        heading: "1. Rendre le signalement plus rapide qu’un oubli",
        paragraphs: [
          "Si noter une rupture demande de chercher un stylo, de trouver la bonne page et d’écrire lisiblement, l’employé remet ça à plus tard. Le signalement doit prendre quelques secondes, à l’endroit où il remarque le manque.",
        ],
      },
      {
        heading: "2. Signaler au bon moment",
        paragraphs: [
          "Pour chaque produit qui part vite, fixe un seuil : quand il en reste ce nombre, on le signale. Ce seuil, c’est le [point de commande](/outils/point-de-commande) : ventes par jour multipliées par le délai de livraison, plus une réserve.",
        ],
      },
      {
        heading: "3. Garder une petite réserve sur les produits phares",
        paragraphs: [
          "Les dix produits qui font l’essentiel des ventes méritent un [stock de sécurité](/outils/stock-de-securite). Il te protège des fournisseurs en retard et des jours de forte affluence.",
        ],
      },
      {
        heading: "4. Ne jamais recommencer une liste à zéro",
        paragraphs: [
          "Ce qui n’a pas été acheté doit rester en tête de la liste suivante. Sinon, un produit introuvable une semaine devient une rupture qui dure un mois.",
        ],
      },
      {
        heading: "5. Savoir qui a vu quoi",
        paragraphs: [
          "Quand chaque signalement porte le nom de la personne, le patron peut poser la bonne question à la bonne personne, et l’équipe se sent responsable de son rayon.",
        ],
      },
      {
        heading: "6. Voir la liste même loin de la boutique",
        paragraphs: [
          "Si le patron achète en ville ou au marché, il doit voir la liste à jour sur son téléphone, sans appeler la boutique. C’est souvent là que se perdent les derniers produits signalés. Voir [comment suivre sa boutique à distance](/guides/gerer-sa-boutique-a-distance).",
        ],
      },
    ],
    faq: [
      ["Qu’est-ce qu’une rupture de stock ?", "C’est quand un produit n’est plus disponible à la vente alors qu’un client le demande."],
      ["Combien coûte une rupture ?", "La vente perdue, et souvent plus : un client qui ne trouve pas son produit prend l’habitude d’aller chez le voisin."],
      ["Faut-il un logiciel de gestion de stock ?", "Pas forcément. Dans une boutique où les ventes ne sont pas scannées, une liste partagée où l’équipe signale ce qui manque règle la plupart des ruptures."],
    ],
  },
  {
    slug: "commande-fournisseur-whatsapp",
    title: "Envoyer sa commande au fournisseur sur WhatsApp, sans recopier",
    h1: "Envoyer sa commande au fournisseur sur WhatsApp, proprement",
    description:
      "Comment envoyer une commande claire à son fournisseur ou grossiste sur WhatsApp : rangée par catégorie, avec des références précises, sans recopier sa liste à la main.",
    date: "2026-10-19",
    intro:
      "Au Cameroun et dans toute l’Afrique francophone, la plupart des commandes aux grossistes passent par WhatsApp. C’est rapide, mais une photo de cahier ou une suite de vocaux donne des commandes incomplètes et des erreurs de référence.",
    sections: [
      {
        heading: "Ce qu’un fournisseur veut recevoir",
        paragraphs: ["Un bon message de commande se lit en une fois et se prépare sans rappeler :"],
        list: [
          "Le nom de ta boutique en tête",
          "Les produits rangés par catégorie",
          "Une référence précise par ligne : format, taille, modèle",
          "La quantité quand tu la connais",
        ],
      },
      {
        heading: "Un exemple de message",
        paragraphs: [
          "Boutique Akwa, commande du 19 octobre. Afficheurs : KG5, Tecno Spark 10. Batteries : Itel BL-5 x3. Accessoires : chargeur Type-C 18 W x5, écouteurs filaires x10.",
          "Le fournisseur prépare la commande dans l’ordre de ses étagères, et rien n’est oublié.",
        ],
      },
      {
        heading: "Évite la photo de cahier",
        paragraphs: [
          "Une photo de liste écrite à la main oblige le fournisseur à déchiffrer, et une ligne coupée par le cadrage passe à la trappe. Elle ne dit pas non plus ce qui a déjà été commandé la fois d’avant.",
        ],
      },
      {
        heading: "Une liste par fournisseur",
        paragraphs: [
          "Si tu achètes chez plusieurs grossistes, envoie à chacun seulement ses catégories. Ranger la liste par catégorie rend ce tri immédiat.",
        ],
      },
      {
        heading: "Avec Yaplus, le message est déjà écrit",
        paragraphs: [
          "Dans Yaplus, la page « À racheter » contient tout ce que l’équipe a signalé, rangé par catégorie. Tu retires ou ajoutes ce que tu veux, tu choisis le numéro du fournisseur, et WhatsApp s’ouvre avec le message prêt. Le fournisseur n’a rien à installer. Voir aussi [Yaplus face à un groupe WhatsApp](/comparer/groupe-whatsapp).",
        ],
      },
    ],
    faq: [
      ["Mon fournisseur doit installer une application ?", "Non. Il reçoit un message WhatsApp normal."],
      ["Je peux envoyer la même liste à plusieurs fournisseurs ?", "Oui. Tu choisis le numéro à chaque envoi."],
      ["Comment noter une quantité ?", "Ajoute-la après le produit, par exemple « x3 ». Dans Yaplus, c’est une note facultative sur le produit."],
    ],
  },
  {
    slug: "gerer-sa-boutique-a-distance",
    title: "Savoir ce qui manque dans sa boutique sans y être",
    h1: "Savoir ce qui manque dans sa boutique quand on n’y est pas",
    description:
      "Patron en déplacement ou propriétaire de plusieurs boutiques ? Comment voir en direct ce qui manque, qui l’a signalé, et acheter sans appeler la boutique.",
    date: "2026-10-19",
    intro:
      "Beaucoup de patrons ne sont pas à la boutique quand ils achètent : ils sont au marché, chez le grossiste ou dans une autre boutique. Ils appellent pour demander ce qui manque, attendent une photo, ou rentrent avec une liste incomplète.",
    sections: [
      {
        heading: "Le problème du coup de fil",
        paragraphs: [
          "Au téléphone, l’employé répond de mémoire. Il oublie ce que son collègue a remarqué le matin, et le patron note sur un bout de papier pendant qu’il conduit. La liste est fausse avant même l’achat.",
        ],
      },
      {
        heading: "Une liste vivante, pas un rapport",
        paragraphs: [
          "Ce qui marche, c’est une liste que l’équipe remplit au fil de la journée et que le patron consulte quand il veut. Pas de rapport à demander, pas d’heure fixe : la liste est à jour au moment où on l’ouvre.",
        ],
        list: [
          "Chaque produit signalé porte le nom de la personne et l’heure",
          "Le patron coche ce qu’il achète, depuis où il est",
          "Ce qui n’a pas été trouvé reste pour la prochaine fois",
        ],
      },
      {
        heading: "Plusieurs boutiques, une seule vue",
        paragraphs: [
          "Avec deux ou trois points de vente, chaque boutique a ses ruptures. Il faut pouvoir passer de l’une à l’autre en un geste, sans changer de cahier ni de compte.",
        ],
      },
      {
        heading: "Et quand la boutique n’a pas de réseau ?",
        paragraphs: [
          "Les signalements doivent être gardés dans le téléphone de l’employé et envoyés dès que le réseau revient. Sinon, une coupure suffit à perdre la moitié de la liste.",
        ],
      },
      {
        heading: "Le faire avec Yaplus",
        paragraphs: [
          "Yaplus est construit pour ça : tes employés signalent depuis la boutique, même sans réseau, et tu vois la liste en direct depuis ton téléphone, avec le nom de chacun. Tu peux suivre plusieurs boutiques avec un seul compte. Pour commencer, choisis un [modèle de cahier](/modeles) adapté à ton commerce.",
        ],
      },
    ],
    faq: [
      ["Je peux voir qui a signalé un produit ?", "Oui. Chaque produit à racheter garde le nom de l’employé qui l’a signalé."],
      ["Mes employés ont besoin de données mobiles ?", "Seulement pour envoyer. Le cahier marche sans réseau et envoie tout dès que la connexion revient."],
      ["Je peux retirer un employé qui part ?", "Oui. Le patron retire un membre de la boutique depuis l’onglet Boutique."],
    ],
  },
  {
    slug: "inventaire-boutique",
    title: "Faire l’inventaire de sa boutique simplement",
    h1: "Faire l’inventaire de sa boutique simplement, sans y passer la nuit",
    description:
      "Comment faire l’inventaire d’une petite boutique en une soirée : préparer, compter par rayon, noter les écarts, et repartir avec une liste de réapprovisionnement propre.",
    date: "2026-10-19",
    intro:
      "Un inventaire, c’est compter tout ce qui est en boutique à une date donnée. Il sert à connaître la valeur de ton stock, repérer les pertes et repartir sur une base propre. Dans une petite boutique, il tient en une soirée si on s’organise.",
    sections: [
      {
        heading: "Quand faire l’inventaire",
        paragraphs: [
          "Au moins une fois par an, souvent en fin d’année. Certains patrons le font chaque trimestre sur les produits chers. Choisis un moment calme : après la fermeture, ou un jour de faible affluence.",
        ],
      },
      {
        heading: "Préparer",
        paragraphs: ["La moitié du travail se fait avant de compter :"],
        list: [
          "Range chaque rayon pour que les mêmes produits soient ensemble",
          "Prépare une feuille ou un tableau par rayon, avec le nom des produits",
          "Répartis les rayons entre les personnes : une personne, un rayon",
        ],
      },
      {
        heading: "Compter par rayon",
        paragraphs: [
          "Compte de gauche à droite et de haut en bas, toujours dans le même sens. Pour les cartons fermés, compte les cartons et multiplie. Note le nombre tout de suite, pas de mémoire.",
        ],
      },
      {
        heading: "Calculer la valeur du stock",
        paragraphs: [
          "Multiplie chaque quantité par le prix d’achat du produit, puis additionne. Compare avec l’inventaire précédent : un écart important signale de la casse, des vols ou des erreurs de prix. Pour vérifier tes prix, le [calcul de marge](/outils/calcul-de-marge) aide.",
        ],
      },
      {
        heading: "Repartir avec une liste propre",
        paragraphs: [
          "L’inventaire montre aussi ce qui est presque fini. Profites-en pour signaler ces produits dans ta liste de réapprovisionnement. Ensuite, inutile de recompter chaque jour : l’équipe signale ce qui finit, au fil de l’eau. Voir [comment faire une liste de réapprovisionnement](/guides/faire-une-liste-de-reapprovisionnement).",
        ],
      },
    ],
    faq: [
      ["Yaplus fait l’inventaire ?", "Non. Yaplus ne compte pas les quantités en stock. Il note ce qui manque pour le racheter. L’inventaire se fait à part, une ou deux fois par an."],
      ["Combien de temps prend un inventaire ?", "Pour une petite boutique bien rangée, quelques heures à deux personnes."],
      ["Faut-il fermer la boutique ?", "C’est plus simple. Sinon, compte un rayon pendant qu’il n’y a pas de clients et ne vends pas ce rayon pendant le comptage."],
    ],
  },
];

export const findGuide = (slug: string) => GUIDES.find((g) => g.slug === slug) ?? null;
