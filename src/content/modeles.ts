import { SITE_TEMPLATES, type ShopTemplate } from "./shop-templates";

// Texte des pages /modeles/[slug]. Les catégories et produits viennent de shop-templates.ts.
type TemplateText = {
  // Le commerce tel qu'on le dit dans une phrase : « une quincaillerie ».
  shop: string;
  title: string;
  description: string;
  intro: string;
  idealFor: string[];
  tips: { title: string; text: string }[];
  faq: [string, string][];
  related: { tools: string[]; guides: string[] };
};

const TEXT: Record<string, TemplateText> = {
  telephonie: {
    shop: "une boutique de téléphonie",
    title: "Liste de réapprovisionnement pour boutique de téléphonie",
    description:
      "Modèle gratuit de liste de réapprovisionnement pour boutique de téléphones et accessoires : afficheurs, batteries, chargeurs, pochettes. Prêt dans Yaplus en une minute.",
    intro:
      "Dans une boutique de téléphonie, les ruptures viennent des petites références : un afficheur KG5, une pochette pour un modèle précis, un chargeur Type-C. Ce modèle range déjà ces produits par catégorie, comme sur l’étagère.",
    idealFor: ["Les boutiques de téléphones et d’accessoires", "Les ateliers de réparation qui vendent des pièces", "Les patrons qui achètent chez plusieurs grossistes"],
    tips: [
      { title: "Un produit par modèle", text: "Écris « Pochette Itel A100 », pas « Pochettes ». Le grossiste sait tout de suite quoi te donner." },
      { title: "Le technicien signale ses pièces", text: "Celui qui répare sait quand il prend le dernier afficheur. Il le touche dans Afficheurs, c’est noté." },
      { title: "Une liste par grossiste", text: "Envoie Afficheurs et Pièces au fournisseur de pièces, Accessoires à l’autre. Tu choisis le numéro au moment d’envoyer." },
    ],
    faq: [
      ["Je peux ajouter mes propres modèles de téléphones ?", "Oui. Tape le nom dans la recherche : si le produit n’existe pas, tu le crées sur place et tu le ranges dans sa catégorie."],
      ["Mes techniciens ne sont pas à l’aise avec l’écrit.", "Ils n’ont rien à écrire pour signaler : ils touchent le nom du produit fini. La recherche propose les produits dès les premières lettres."],
      ["Je peux noter combien d’afficheurs racheter ?", "Oui, une note comme « x3 » reste possible, mais elle n’est jamais demandée. Souvent le patron sait déjà combien en prendre."],
    ],
    related: { tools: ["prix-de-vente", "calcul-de-marge"], guides: ["commande-fournisseur-whatsapp", "eviter-les-ruptures-de-stock"] },
  },
  alimentation: {
    shop: "une alimentation",
    title: "Liste de réapprovisionnement pour alimentation générale",
    description:
      "Modèle gratuit de liste de courses pour épicerie et alimentation générale : riz, huile, conserves, boissons, hygiène. Ton équipe signale ce qui manque en un tap.",
    intro:
      "Une alimentation vend des dizaines de produits qui partent vite : riz, huile, sucre, savon. Quand un sac de riz finit pendant que tu es au marché, personne ne le note. Ce modèle donne à l’équipe une liste qu’elle remplit sans écrire.",
    idealFor: ["Les alimentations générales et épiceries de quartier", "Les boutiques tenues à plusieurs, matin et soir", "Les patrons qui font le marché eux-mêmes"],
    tips: [
      { title: "Précise le format", text: "« Riz 25 kg » et « Riz 5 kg » ne se rachètent pas au même endroit. Garde un produit par format." },
      { title: "Coche au marché", text: "Ouvre « À racheter » pendant tes courses et coche ce que tu prends. Ce qui reste remonte la fois suivante." },
      { title: "Les produits du jour", text: "Pain, œufs, glace : ajoute-les dans Divers. Ils seront signalés aussi souvent que nécessaire." },
    ],
    faq: [
      ["Ça remplace un logiciel de caisse ?", "Non. Yaplus ne compte pas les ventes ni l’argent. Il sert à une chose : ne plus oublier ce qui manque, et préparer la commande."],
      ["Il faut compter le stock ?", "Non. On ne saisit aucune quantité en stock. On signale seulement ce qui est fini ou presque fini."],
      ["Ma boutique est dans une zone sans réseau.", "Le cahier marche sans connexion. Les signalements partent dès que le réseau revient."],
    ],
    related: { tools: ["point-de-commande", "quantite-a-commander"], guides: ["faire-une-liste-de-reapprovisionnement", "eviter-les-ruptures-de-stock"] },
  },
  quincaillerie: {
    shop: "une quincaillerie",
    title: "Liste de réapprovisionnement pour quincaillerie",
    description:
      "Modèle gratuit de liste de réapprovisionnement pour quincaillerie : électricité, plomberie, visserie, peinture, outillage. Ton équipe signale les ruptures en un tap.",
    intro:
      "Une quincaillerie a des centaines de petites références, souvent en plusieurs tailles. Le client qui ne trouve pas son coude PVC de 32 part chez le voisin. Ce modèle range les produits par rayon pour que chaque vendeur signale ce qui manque.",
    idealFor: ["Les quincailleries et magasins de matériaux", "Les vendeurs qui servent au comptoir", "Les patrons qui commandent chez plusieurs fournisseurs"],
    tips: [
      { title: "La taille dans le nom", text: "« Pointes de 70 » et « Pointes de 100 » sont deux produits. Le fournisseur reçoit la bonne référence." },
      { title: "Signale avant la fin", text: "Pour ce qui se vend par carton, signale quand il reste le dernier carton, pas quand l’étagère est vide." },
      { title: "Un rayon par vendeur", text: "Si un vendeur s’occupe de l’électricité, c’est lui qui surveille ce rayon. Tu vois son nom sur ce qu’il signale." },
    ],
    faq: [
      ["J’ai beaucoup de références. Ce n’est pas trop long à créer ?", "Non. Tu pars de ce modèle, puis chaque produit se crée au moment où il manque, en tapant son nom. Le cahier se remplit avec le temps."],
      ["Je peux envoyer la liste à mon fournisseur ?", "Oui. Un bouton ouvre WhatsApp avec la liste déjà écrite, rangée par rayon. Tu choisis le numéro."],
      ["Plusieurs vendeurs peuvent signaler en même temps ?", "Oui, chacun sur son téléphone. Rien n’est écrasé, même hors réseau."],
    ],
    related: { tools: ["stock-de-securite", "calcul-de-marge"], guides: ["commande-fournisseur-whatsapp", "faire-une-liste-de-reapprovisionnement"] },
  },
  cosmetiques: {
    shop: "une boutique de cosmétiques",
    title: "Liste de réapprovisionnement pour boutique de cosmétiques",
    description:
      "Modèle gratuit de liste de réapprovisionnement pour boutique de cosmétiques : soins, cheveux, maquillage, parfums. Ne laisse plus un produit demandé en rupture.",
    intro:
      "En cosmétiques, une cliente revient pour la même crème. Si elle ne la trouve pas, elle va ailleurs. Ce modèle aide l’équipe à signaler chaque produit fini au moment où elle le remarque.",
    idealFor: ["Les boutiques de cosmétiques et de beauté", "Les vendeuses qui conseillent en boutique", "Les patronnes qui achètent chez les grossistes ou à l’étranger"],
    tips: [
      { title: "La marque dans le nom", text: "Note la marque et le format : la cliente demande un produit précis, pas « une crème »." },
      { title: "Note ce qui est demandé", text: "Un produit que tu n’as pas mais qu’on te demande souvent ? Crée-le et signale-le : il apparaîtra dans la liste d’achat." },
      { title: "Le détail en note", text: "Teinte, parfum, taille : une note courte sur le produit suffit." },
    ],
    faq: [
      ["Je commande à l’étranger. Ça marche quand même ?", "Oui. La liste se partage sur WhatsApp à n’importe quel numéro, au Cameroun ou ailleurs."],
      ["Je peux voir qui a signalé un produit ?", "Oui. Chaque produit à racheter garde le nom de la personne qui l’a signalé."],
      ["J’ai deux boutiques.", "Un seul compte suffit. Tu crées un cahier par boutique et tu vois ce qui manque dans chacune."],
    ],
    related: { tools: ["calcul-de-marge", "prix-de-vente"], guides: ["gerer-sa-boutique-a-distance", "eviter-les-ruptures-de-stock"] },
  },
  boulangerie: {
    shop: "une boulangerie",
    title: "Liste de réapprovisionnement pour boulangerie et pâtisserie",
    description:
      "Modèle gratuit de liste d’approvisionnement pour boulangerie : farine, levure, sucre, emballages, gaz. Le boulanger signale ce qui manque avant la fournée.",
    intro:
      "Une boulangerie s’arrête quand il manque la levure ou le gaz. Le boulanger le voit la nuit, le patron l’apprend le matin. Ce modèle met ces matières premières dans une liste que tout le monde voit.",
    idealFor: ["Les boulangeries et pâtisseries de quartier", "Les équipes qui travaillent de nuit", "Les patrons qui achètent la farine par sacs"],
    tips: [
      { title: "Signale au dernier sac", text: "La farine se signale quand on ouvre le dernier sac, pas quand il est vide. La livraison a le temps d’arriver." },
      { title: "Le gaz à part", text: "Garde l’énergie dans sa propre catégorie : c’est elle qui arrête la production." },
      { title: "Les emballages comptent", text: "Sans sachets, on ne vend plus. Ils ont leur place dans la liste comme les ingrédients." },
    ],
    faq: [
      ["L’équipe de nuit peut signaler ?", "Oui. Chaque signalement est daté et porte le nom de la personne. Le patron le voit en se levant."],
      ["Ça calcule mes quantités de farine ?", "Non, Yaplus note ce qui manque. Pour estimer la quantité à racheter, utilise notre calcul gratuit de quantité à commander."],
      ["Ça marche sans internet ?", "Oui. Le cahier marche hors connexion et se met à jour quand le réseau revient."],
    ],
    related: { tools: ["quantite-a-commander", "point-de-commande"], guides: ["eviter-les-ruptures-de-stock", "gerer-sa-boutique-a-distance"] },
  },
  bar: {
    shop: "un bar",
    title: "Liste de réapprovisionnement pour bar et snack",
    description:
      "Modèle gratuit de liste de réapprovisionnement pour bar : bières, sucreries, eaux, glaçons. Les serveurs signalent ce qui manque, la commande part au dépôt sur WhatsApp.",
    intro:
      "Dans un bar, la soirée se joue sur les casiers. Quand la Castel ou la Top Ananas manque un samedi, ce sont des ventes perdues. Avec ce modèle, les serveurs signalent dès qu’un casier est presque vide.",
    idealFor: ["Les bars, snacks et buvettes", "Les gérants qui commandent au dépôt de boissons", "Les patrons qui ne sont pas là tous les soirs"],
    tips: [
      { title: "Un produit par format", text: "Grande et petite bouteille ne se commandent pas pareil. Garde un produit par format." },
      { title: "Commande avant le week-end", text: "Ouvre la liste le jeudi et envoie-la au dépôt. Ce qui manque encore remonte la semaine suivante." },
      { title: "Les glaçons aussi", text: "Les consommables arrêtent le service autant qu’une boisson : glaçons, gobelets, serviettes." },
    ],
    faq: [
      ["Je peux envoyer la commande au dépôt de boissons ?", "Oui. Un bouton ouvre WhatsApp avec la liste prête, rangée par catégorie, vers le numéro que tu choisis."],
      ["Je ne suis pas au bar le soir.", "Tu vois ce que les serveurs signalent en direct, depuis ton téléphone, avec leur nom."],
      ["Ça compte les bouteilles vendues ?", "Non. Yaplus ne fait pas la caisse ni l’inventaire. Il sert à ne rien oublier dans la commande."],
    ],
    related: { tools: ["point-de-commande", "calcul-de-marge"], guides: ["commande-fournisseur-whatsapp", "gerer-sa-boutique-a-distance"] },
  },
  restaurant: {
    shop: "un restaurant",
    title: "Liste de réapprovisionnement pour restaurant",
    description:
      "Modèle gratuit de liste de courses pour restaurant et maquis : vivres, viandes, poissons, épices, gaz. La cuisine signale ce qui manque avant le marché.",
    intro:
      "En cuisine, on remarque ce qui manque au moment de préparer, les mains occupées. Le soir, on a oublié. Ce modèle donne à la cuisine une liste de marché qu’elle remplit d’un geste.",
    idealFor: ["Les restaurants, maquis et cantines", "Les cuisinières qui préparent la liste du marché", "Les patrons qui envoient quelqu’un faire les courses"],
    tips: [
      { title: "La liste du marché", text: "Avant d’aller au marché, ouvre « À racheter ». Tout ce que la cuisine a signalé est là, rangé par catégorie." },
      { title: "Coche en achetant", text: "Celui qui fait le marché coche au fur et à mesure. Ce qu’il n’a pas trouvé reste pour la fois suivante." },
      { title: "Le gaz et le charbon", text: "Mets l’énergie dans la liste : une bouteille vide arrête la cuisine." },
    ],
    faq: [
      ["Celui qui fait le marché peut avoir la liste ?", "Oui. Envoie-la sur son WhatsApp, ou invite-le dans le cahier pour qu’il coche lui-même."],
      ["Je peux ajouter les plats du jour ?", "Le cahier note les produits à racheter, pas les plats. Ajoute les ingrédients dont tu as besoin."],
      ["Ça marche sur un vieux téléphone ?", "Sur tout Android récent avec Chrome. L’app est légère et marche sans réseau."],
    ],
    related: { tools: ["quantite-a-commander", "prix-de-vente"], guides: ["faire-une-liste-de-reapprovisionnement", "commande-fournisseur-whatsapp"] },
  },
  "salon-de-coiffure": {
    shop: "un salon de coiffure",
    title: "Liste de réapprovisionnement pour salon de coiffure",
    description:
      "Modèle gratuit de liste de réapprovisionnement pour salon de coiffure : mèches, produits, matériel de barbier, consommables. Ne tombe plus en panne de défrisant.",
    intro:
      "Au salon, on s’aperçoit qu’il manque le défrisant quand la cliente est déjà assise. Ce modèle permet aux coiffeuses de signaler ce qui finit pendant la journée, sans quitter la cliente des yeux.",
    idealFor: ["Les salons de coiffure femmes et hommes", "Les salons avec plusieurs coiffeuses", "Les patronnes qui achètent chez le grossiste"],
    tips: [
      { title: "Mèches par référence", text: "Couleur et longueur dans le nom : « Mèches X-pression noir 1 ». Le grossiste sait quoi prendre." },
      { title: "Signale à l’ouverture du dernier", text: "Quand on ouvre le dernier pot, on le signale. Il sera là pour la cliente suivante." },
      { title: "Les consommables", text: "Gants, capes et papier cou se finissent sans bruit. Garde-les dans la liste." },
    ],
    faq: [
      ["Mes coiffeuses peuvent l’utiliser ?", "Oui. Tu les invites par WhatsApp. Pour signaler, elles touchent le produit fini."],
      ["Je peux suivre deux salons ?", "Oui. Un compte, un cahier par salon, et tu vois ce qui manque dans chacun."],
      ["C’est payant ?", "C’est gratuit pendant le lancement, sans carte bancaire."],
    ],
    related: { tools: ["prix-de-vente", "calcul-de-marge"], guides: ["eviter-les-ruptures-de-stock", "gerer-sa-boutique-a-distance"] },
  },
  "librairie-papeterie": {
    shop: "une librairie-papeterie",
    title: "Liste de réapprovisionnement pour librairie et papeterie",
    description:
      "Modèle gratuit de liste de réapprovisionnement pour librairie-papeterie : cahiers, stylos, rames, fournitures scolaires. Prépare la rentrée sans oublier une référence.",
    intro:
      "À la rentrée, une papeterie vend en une semaine ce qu’elle vend en trois mois. Les cahiers de 200 pages ou les compas finissent vite. Ce modèle aide à signaler chaque référence finie et à refaire la commande d’un coup.",
    idealFor: ["Les librairies et papeteries", "Les boutiques près des écoles", "Les patrons qui préparent la rentrée scolaire"],
    tips: [
      { title: "Prépare la rentrée", text: "Signale dès août ce qui reste peu, pour passer une grosse commande avant le rush." },
      { title: "Par nombre de pages", text: "« Cahier 100 pages » et « Cahier 200 pages » sont deux produits. La commande est claire." },
      { title: "Les annales à part", text: "Les livres et annales changent chaque année. Une catégorie à part évite les mélanges." },
    ],
    faq: [
      ["Je peux partager la liste avec mon grossiste ?", "Oui. La liste part sur WhatsApp, rangée par catégorie, vers le numéro que tu choisis."],
      ["Mes vendeurs saisonniers peuvent signaler ?", "Oui. Tu les invites le temps de la rentrée, puis tu les retires de la boutique."],
      ["Ça gère les prix ?", "Non, Yaplus note ce qui manque. Pour tes prix, utilise notre calcul gratuit de prix de vente."],
    ],
    related: { tools: ["quantite-a-commander", "prix-de-vente"], guides: ["faire-une-liste-de-reapprovisionnement", "eviter-les-ruptures-de-stock"] },
  },
  "pieces-auto-moto": {
    shop: "un magasin de pièces auto et moto",
    title: "Liste de réapprovisionnement pour pièces auto et moto",
    description:
      "Modèle gratuit de liste de réapprovisionnement pour magasin de pièces détachées auto et moto : bougies, chambres à air, huiles, filtres, freinage.",
    intro:
      "Le moto-taximan qui ne trouve pas sa chambre à air ne reviendra pas demain. Dans les pièces détachées, chaque rupture est une vente perdue. Ce modèle range les pièces par famille pour que chacun signale ce qui part.",
    idealFor: ["Les magasins de pièces moto et auto", "Les garages qui vendent des pièces", "Les patrons qui commandent chez plusieurs importateurs"],
    tips: [
      { title: "La référence exacte", text: "Taille, modèle, viscosité : « Chambre à air 17 », « Huile 4T 1 L ». Une seule lecture suffit au fournisseur." },
      { title: "Les pièces qui tournent", text: "Bougies, chambres à air, plaquettes : signale-les au dernier lot, elles partent tous les jours." },
      { title: "Le mécanicien signale", text: "Au garage, celui qui monte la pièce sait qu’il a pris la dernière. Il la touche dans la liste." },
    ],
    faq: [
      ["J’ai des milliers de références.", "Pas besoin de tout créer. Commence avec ce modèle ; chaque pièce s’ajoute quand elle manque pour la première fois."],
      ["Je peux envoyer la liste à plusieurs fournisseurs ?", "Oui. Tu envoies la liste au numéro de ton choix, autant de fois que tu veux."],
      ["Mon magasin a deux vendeurs.", "Les deux remplissent le même cahier depuis leur téléphone. Tu vois qui a signalé quoi."],
    ],
    related: { tools: ["stock-de-securite", "point-de-commande"], guides: ["commande-fournisseur-whatsapp", "eviter-les-ruptures-de-stock"] },
  },
  vetements: {
    shop: "une boutique de vêtements",
    title: "Liste de réapprovisionnement pour boutique de vêtements",
    description:
      "Modèle gratuit de liste de réapprovisionnement pour boutique de vêtements et chaussures : hommes, femmes, enfants, pointures. Note les tailles qui manquent.",
    intro:
      "Dans une boutique de vêtements, ce qui manque, c’est souvent une taille : la chemise existe en M mais plus en L. Ce modèle aide les vendeuses à noter la taille ou la pointure finie, pour la racheter au prochain arrivage.",
    idealFor: ["Les boutiques de prêt-à-porter et de chaussures", "Les vendeuses qui notent les demandes des clients", "Les patrons qui achètent en balles ou chez les grossistes"],
    tips: [
      { title: "La taille fait le produit", text: "« Sandales pointure 42 » plutôt que « Sandales ». Tu rachètes la bonne taille." },
      { title: "Ce qu’on te demande", text: "Un client cherche un modèle que tu n’as pas ? Crée-le et signale-le, il sera dans la liste d’achat." },
      { title: "Les emballages", text: "Sacs et cintres aussi finissent. Ils ont leur ligne dans Accessoires." },
    ],
    faq: [
      ["Je peux noter une couleur ?", "Oui, en note sur le produit : « noir, x2 ». La note n’est jamais obligatoire."],
      ["J’achète au marché, pas chez un fournisseur.", "Ouvre « À racheter » pendant tes achats et coche ce que tu prends. Le reste remonte la fois suivante."],
      ["C’est sur iPhone ?", "Yaplus marche dans le navigateur du téléphone et sur ordinateur. Il est conçu d’abord pour Android avec Chrome."],
    ],
    related: { tools: ["prix-de-vente", "calcul-de-marge"], guides: ["faire-une-liste-de-reapprovisionnement", "gerer-sa-boutique-a-distance"] },
  },
  informatique: {
    shop: "une boutique d’informatique",
    title: "Liste de réapprovisionnement pour boutique d’informatique",
    description:
      "Modèle gratuit de liste de réapprovisionnement pour boutique d’informatique et de bureautique : clés USB, câbles, cartouches, périphériques, réseau.",
    intro:
      "Clés USB, câbles HDMI, cartouches : en informatique, les petits articles font le chiffre et finissent sans prévenir. Ce modèle les range par famille pour que l’équipe signale chaque article fini.",
    idealFor: ["Les boutiques d’informatique et de bureautique", "Les cybercafés et centres de saisie", "Les revendeurs qui achètent chez les importateurs"],
    tips: [
      { title: "La capacité dans le nom", text: "« Clé USB 32 Go » et « 64 Go » sont deux produits. La commande est sans erreur." },
      { title: "Les cartouches par numéro", text: "Écris le numéro exact de la cartouche : c’est lui que le fournisseur cherche." },
      { title: "Le cybercafé aussi", text: "Papier, encre, câbles : ce que tu utilises pour tes services va dans la même liste." },
    ],
    faq: [
      ["Je peux l’utiliser sur l’ordinateur de la boutique ?", "Oui. Yaplus marche sur ordinateur et sur téléphone, avec le même cahier."],
      ["Ça remplace mon logiciel de facturation ?", "Non. Yaplus sert à noter ce qui manque et à préparer la commande, pas à facturer."],
      ["Mes données sont gardées où ?", "Sur le téléphone, et sur nos serveurs quand tu as un compte, pour que toute l’équipe voie le même cahier."],
    ],
    related: { tools: ["calcul-de-marge", "quantite-a-commander"], guides: ["commande-fournisseur-whatsapp", "faire-une-liste-de-reapprovisionnement"] },
  },
};

export type ModelePage = ShopTemplate & TemplateText;

export const MODELES: ModelePage[] = SITE_TEMPLATES.map((t) => ({ ...t, ...TEXT[t.slug] }));

export const findModele = (slug: string) => MODELES.find((m) => m.slug === slug) ?? null;
