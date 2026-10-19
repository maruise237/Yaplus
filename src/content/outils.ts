// Pages /outils/[slug] : calculs gratuits pour le commerçant, sans compte.
// Le calcul lui-même est dans src/components/site/Calculator.tsx, par `slug`.

export type Tool = {
  slug: string;
  name: string;
  title: string;
  description: string;
  intro: string;
  formula: { text: string; lines: string[] };
  example: string;
  goodToKnow: string[];
  faq: [string, string][];
};

export const TOOLS: Tool[] = [
  {
    slug: "calcul-de-marge",
    name: "Calcul de marge",
    title: "Calcul de marge commerciale en FCFA : taux de marge et de marque",
    description:
      "Calcule gratuitement ta marge en FCFA à partir du prix d’achat et du prix de vente : marge par article, taux de marge et taux de marque. Sans inscription.",
    intro: "Entre le prix d’achat et le prix de vente d’un article. Le calcul donne ce que tu gagnes sur chaque pièce, et en pourcentage.",
    formula: {
      text: "La marge est la différence entre le prix de vente et le prix d’achat. On l’exprime de deux façons :",
      lines: [
        "Marge = prix de vente − prix d’achat",
        "Taux de marge = marge ÷ prix d’achat × 100",
        "Taux de marque = marge ÷ prix de vente × 100",
      ],
    },
    example:
      "Tu achètes une pochette 1 500 FCFA et tu la vends 2 500 FCFA. Ta marge est de 1 000 FCFA. Le taux de marge est de 66,7 % (1 000 ÷ 1 500) et le taux de marque de 40 % (1 000 ÷ 2 500).",
    goodToKnow: [
      "Ajoute au prix d’achat ce que te coûte l’article pour arriver en boutique : transport, moto, frais de dédouanement.",
      "Le taux de marge part du prix d’achat, le taux de marque part du prix de vente. Le taux de marque est toujours plus petit.",
      "Une marge en pourcentage élevée sur un article qui se vend peu rapporte moins qu’une petite marge sur un article qui part tous les jours.",
    ],
    faq: [
      ["Quelle est la différence entre taux de marge et taux de marque ?", "Les deux mesurent la même marge. Le taux de marge la compare au prix d’achat, le taux de marque au prix de vente. Une marge de 1 000 FCFA sur un article acheté 1 500 et vendu 2 500 donne 66,7 % de taux de marge et 40 % de taux de marque."],
      ["Comment calculer une marge de 30 % ?", "Multiplie le prix d’achat par 1,3. Un article acheté 2 000 FCFA se vend 2 600 FCFA pour 30 % de taux de marge. Le calcul du prix de vente le fait pour toi."],
      ["Faut-il compter le transport dans le prix d’achat ?", "Oui. Le prix qui compte est ce que l’article t’a coûté une fois en boutique. Divise le transport par le nombre d’articles achetés."],
      ["Quelle marge prendre dans une boutique ?", "Elle dépend du produit et du quartier. Les produits de première nécessité ont souvent une petite marge, les accessoires une marge plus forte. Compare avec les prix autour de toi."],
    ],
  },
  {
    slug: "prix-de-vente",
    name: "Calcul du prix de vente",
    title: "Calcul du prix de vente à partir du prix d’achat et de la marge",
    description:
      "Calcule le prix de vente d’un article en FCFA à partir du prix d’achat, des frais et de la marge voulue, avec un prix arrondi prêt à afficher. Gratuit.",
    intro: "Entre ce que l’article t’a coûté et la marge que tu veux. Le calcul donne le prix de vente, arrondi pour qu’il soit facile à rendre en monnaie.",
    formula: {
      text: "On part du coût de l’article en boutique, puis on ajoute la marge voulue :",
      lines: ["Coût = prix d’achat + frais par article", "Prix de vente = coût × (1 + taux de marge ÷ 100)"],
    },
    example:
      "Un chargeur acheté 2 000 FCFA, avec 150 FCFA de transport par pièce, coûte 2 150 FCFA. Avec 40 % de marge, le prix de vente est 3 010 FCFA, arrondi à 3 025 FCFA.",
    goodToKnow: [
      "L’arrondi se fait au-dessus, par tranches de 25 FCFA, pour ne jamais vendre sous ta marge.",
      "Si le prix trouvé est au-dessus de celui du voisin, regarde d’abord si tu peux acheter moins cher ou en plus grande quantité.",
      "Les frais par article, c’est le total du transport divisé par le nombre de pièces achetées.",
    ],
    faq: [
      ["Comment calculer un prix de vente avec une marge de 25 % ?", "Multiplie le coût par 1,25. Un article qui te coûte 4 000 FCFA se vend 5 000 FCFA."],
      ["Pourquoi arrondir le prix ?", "Un prix rond se rend facilement en monnaie et se retient. On arrondit au-dessus pour garder au moins la marge prévue."],
      ["Je veux un taux de marque, pas un taux de marge.", "Pour un taux de marque, divise le coût par (1 − taux ÷ 100). Pour 40 % de marque, un coût de 3 000 FCFA donne 5 000 FCFA."],
      ["La TVA est comprise ?", "Ce calcul ne gère pas la TVA. Si tu y es soumis, calcule d’abord ton prix hors taxe, puis ajoute la TVA applicable."],
    ],
  },
  {
    slug: "point-de-commande",
    name: "Calcul du point de commande",
    title: "Point de commande : quand recommander un produit ?",
    description:
      "Calcule le point de commande d’un produit : le stock restant à partir duquel il faut le racheter, selon tes ventes par jour et le délai du fournisseur. Gratuit.",
    intro: "Combien en vends-tu par jour, et combien de jours le fournisseur met-il à livrer ? Le calcul te dit à partir de combien de pièces restantes il faut signaler le produit.",
    formula: {
      text: "Le point de commande, c’est ce que tu vendras pendant que tu attends la livraison, plus une petite réserve :",
      lines: ["Point de commande = ventes par jour × délai de livraison + stock de sécurité"],
    },
    example:
      "Tu vends 4 sacs de riz par jour, ton fournisseur livre en 3 jours et tu gardes 4 sacs de réserve. Ton point de commande est 16 sacs : quand il en reste 16, il faut le signaler.",
    goodToKnow: [
      "Si tu achètes toi-même au marché, le délai, c’est le nombre de jours jusqu’à ton prochain passage.",
      "Prends tes ventes d’une semaine normale, pas d’une semaine de fête.",
      "Dans Yaplus, signale le produit quand il atteint ce nombre, pas quand l’étagère est vide.",
    ],
    faq: [
      ["Qu’est-ce que le point de commande ?", "C’est la quantité restante en stock à partir de laquelle il faut recommander, pour que la livraison arrive avant la rupture."],
      ["Comment connaître mes ventes par jour ?", "Compte ce qui part sur une semaine normale et divise par le nombre de jours d’ouverture."],
      ["Et si le délai de livraison change ?", "Prends le délai habituel et compte sur le stock de sécurité pour les retards. Le calcul du stock de sécurité t’aide à le choisir."],
      ["Faut-il calculer pour chaque produit ?", "Pour ceux qui se vendent vite ou qui coûtent cher à manquer. Pour les autres, signaler au dernier article suffit."],
    ],
  },
  {
    slug: "stock-de-securite",
    name: "Calcul du stock de sécurité",
    title: "Calcul du stock de sécurité pour éviter les ruptures",
    description:
      "Calcule le stock de sécurité d’un produit à partir de tes ventes et des délais de livraison, normaux et les pires. Pour ne plus tomber en rupture quand le fournisseur est en retard.",
    intro: "Le stock de sécurité, c’est la réserve qui te protège des mauvaises semaines : ventes plus fortes que prévu ou fournisseur en retard.",
    formula: {
      text: "On compare le pire cas raisonnable avec le cas normal :",
      lines: ["Stock de sécurité = ventes max par jour × délai max − ventes moyennes par jour × délai moyen"],
    },
    example:
      "Tu vends 6 bougies moto par jour en moyenne, 10 les meilleurs jours. Le fournisseur livre en 4 jours, 7 quand il est en retard. Stock de sécurité : 10 × 7 − 6 × 4 = 46 bougies.",
    goodToKnow: [
      "Les ventes max, ce sont celles d’un bon jour normal, pas d’un jour exceptionnel.",
      "Un stock de sécurité immobilise de l’argent : garde-le pour les produits qui se vendent tous les jours.",
      "Ajoute ce résultat au point de commande pour savoir quand signaler le produit.",
    ],
    faq: [
      ["À quoi sert le stock de sécurité ?", "À ne pas tomber en rupture quand les ventes augmentent ou que la livraison est en retard."],
      ["Mon stock de sécurité est très grand. C’est normal ?", "Il grandit vite si le délai du fournisseur est très variable. Cherche un fournisseur plus régulier, ou commande plus souvent en plus petites quantités."],
      ["Faut-il un stock de sécurité pour tout ?", "Non. Pour les produits qui partent peu, il coûte plus qu’il ne rapporte."],
    ],
  },
  {
    slug: "quantite-a-commander",
    name: "Calcul de la quantité à commander",
    title: "Combien commander ? Calcul de la quantité à racheter",
    description:
      "Calcule combien racheter d’un produit pour tenir jusqu’au prochain achat, selon tes ventes, le stock restant et ta réserve. Gratuit, sans inscription.",
    intro: "Tu sais qu’un produit manque. Combien en racheter ? Entre tes ventes par jour, le nombre de jours à tenir et ce qu’il te reste.",
    formula: {
      text: "On rachète de quoi tenir jusqu’au prochain achat, réserve comprise, moins ce qu’il reste déjà :",
      lines: ["Quantité = ventes par jour × jours à tenir + stock de sécurité − stock restant"],
    },
    example:
      "Tu vends 12 Top Ananas par jour, tu rachètes chaque semaine (7 jours), tu veux 12 bouteilles de réserve et il en reste 20. Quantité : 12 × 7 + 12 − 20 = 76 bouteilles, soit un peu plus de 6 casiers de 12.",
    goodToKnow: [
      "Les jours à tenir, c’est le temps jusqu’au prochain achat plus le délai de livraison.",
      "Arrondis au carton ou au casier supérieur : c’est comme ça que le fournisseur vend.",
      "Dans Yaplus, tu peux noter la quantité sur le produit, par exemple « x76 ».",
    ],
    faq: [
      ["Comment savoir combien commander ?", "Multiplie tes ventes par jour par le nombre de jours jusqu’au prochain achat, ajoute ta réserve et retire ce qu’il reste en stock."],
      ["Et si le résultat est négatif ?", "Tu as déjà assez pour tenir. Il n’y a rien à racheter pour l’instant."],
      ["Je n’ai pas le temps de calculer pour chaque produit.", "Fais-le pour les dix produits qui se vendent le plus. Pour les autres, ton habitude suffit."],
    ],
  },
];

export const findTool = (slug: string) => TOOLS.find((t) => t.slug === slug) ?? null;
