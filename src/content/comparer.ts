// Pages /comparer/[slug] : Yaplus face à ce que la boutique utilise aujourd'hui.
// Honnêtes : chaque page dit aussi quand l'autre solution reste le bon choix.

export type Comparison = {
  slug: string;
  // Le nom de l'autre solution, tel qu'on l'écrit dans une phrase.
  name: string;
  // « face au cahier papier », « face à Excel » : la contraction qui va avec le nom.
  versus: string;
  title: string;
  h1: string;
  description: string;
  intro: string;
  reasons: { title: string; text: string }[];
  rows: [string, string, string][];
  stillRight: string[];
  bottomLine: string;
  faq: [string, string][];
};

export const COMPARISONS: Comparison[] = [
  {
    slug: "cahier-papier",
    name: "le cahier papier",
    versus: "face au cahier papier",
    title: "Remplacer le cahier de commande papier de la boutique",
    h1: "Le cahier papier, en mieux, dans le téléphone",
    description:
      "Yaplus remplace le cahier de réapprovisionnement papier : une seule liste lisible, remplie par toute l’équipe, que le patron voit même absent. Comparatif honnête.",
    intro:
      "Le cahier papier marche tant qu’il est au comptoir et que tout le monde écrit lisiblement. Dès qu’il y a deux employés, deux boutiques ou un patron en déplacement, il faut photographier les pages et tout recopier.",
    reasons: [
      { title: "Une seule liste, lisible", text: "Chacun signale sur son téléphone, dans le même cahier. Plus de pages à déchiffrer ni de listes à rassembler le soir." },
      { title: "Le patron voit tout, à distance", text: "Plus besoin d’appeler la boutique ou d’attendre une photo. La liste est à jour sur ton téléphone." },
      { title: "Rien n’est oublié", text: "Ce qui n’a pas été acheté reste dans la liste et remonte en haut, marqué « oublié la dernière fois »." },
      { title: "La commande part toute seule", text: "Un bouton ouvre WhatsApp avec la liste écrite, rangée par catégorie. Tu ne recopies plus rien." },
    ],
    rows: [
      ["Signaler un produit fini", "Un tap sur son nom", "L’écrire à la main"],
      ["Lisible par tout le monde", "Oui", "Selon l’écriture"],
      ["Voir la liste à distance", "En direct", "Photo à envoyer"],
      ["Savoir qui a signalé", "Nom sur chaque produit", "Rarement"],
      ["Produits oubliés", "Remontent tout seuls", "À recopier"],
      ["Envoyer au fournisseur", "Un bouton WhatsApp", "Recopier ou photographier"],
      ["Sans réseau", "Oui", "Oui"],
      ["Prix", "Gratuit pendant le lancement", "Le prix du cahier"],
    ],
    stillRight: [
      "Tu es seul dans ta boutique et tu achètes toi-même tous les jours.",
      "Personne dans l’équipe n’a de téléphone Android ou d’ordinateur.",
      "Ta liste tient sur une demi-page et ne change presque pas.",
    ],
    bottomLine:
      "Garde le cahier si tu es seul et que ta liste est courte. Dès que plusieurs personnes remarquent les ruptures, ou que tu n’es pas toujours à la boutique, une liste partagée te fait gagner le recopiage du soir et les produits oubliés.",
    faq: [
      ["Mes employés préfèrent écrire sur papier.", "Pour signaler, ils n’écrivent rien : ils touchent le produit fini. C’est plus rapide que d’écrire une ligne."],
      ["Et si le téléphone n’a plus de batterie ?", "Le cahier est aussi sur les téléphones des autres membres et sur ordinateur. Ce qui a été signalé n’est pas perdu."],
      ["Je peux garder une trace des achats passés ?", "Oui. Chaque liste clôturée part dans l’historique avec sa date, son auteur et son détail."],
      ["Combien de temps pour passer du cahier à Yaplus ?", "Une minute pour créer la boutique avec un modèle de catégories. Les produits s’ajoutent ensuite, au moment où ils manquent."],
    ],
  },
  {
    slug: "groupe-whatsapp",
    name: "le groupe WhatsApp",
    versus: "face au groupe WhatsApp",
    title: "Groupe WhatsApp de la boutique ou liste partagée ?",
    h1: "Un groupe WhatsApp, ce n’est pas une liste",
    description:
      "Gérer les ruptures dans un groupe WhatsApp, c’est relire des dizaines de messages. Yaplus garde WhatsApp pour envoyer la commande, et une vraie liste pour la préparer.",
    intro:
      "Beaucoup de boutiques notent ce qui manque dans un groupe WhatsApp. C’est rapide à écrire, mais impossible à relire : les messages se mélangent aux photos et aux vocaux, et personne ne sait ce qui a déjà été acheté.",
    reasons: [
      { title: "Une liste, pas une conversation", text: "Chaque produit à racheter apparaît une seule fois, rangé par catégorie. Pas besoin de remonter les messages." },
      { title: "On sait ce qui est acheté", text: "Le patron coche ce qu’il achète. Ce qui reste est clair pour tout le monde." },
      { title: "WhatsApp reste là où il est fort", text: "La liste finale part sur WhatsApp, au fournisseur ou à qui tu veux, déjà écrite et propre." },
      { title: "Moins de bruit pour l’équipe", text: "Les ruptures ne noient plus les autres messages du groupe." },
    ],
    rows: [
      ["Signaler un produit fini", "Un tap", "Écrire ou envoyer un vocal"],
      ["Doublons", "Impossibles : un produit, une ligne", "Fréquents"],
      ["Voir ce qui reste à acheter", "La liste à jour", "Relire les messages"],
      ["Rangé par catégorie", "Oui", "Non"],
      ["Envoyer au fournisseur", "Liste prête en un bouton", "Recopier les messages"],
      ["Historique des achats", "Oui, par liste clôturée", "Perdu dans la conversation"],
      ["Sans réseau", "Oui, envoi au retour du réseau", "Envoi au retour du réseau"],
    ],
    stillRight: [
      "Pour discuter, envoyer une photo d’un produit ou poser une question au patron.",
      "Pour une rupture urgente qu’il faut régler dans l’heure.",
      "Si tu n’as qu’un ou deux produits à noter par semaine.",
    ],
    bottomLine:
      "Garde le groupe WhatsApp pour parler. Pour la liste de ce qui manque, une liste partagée évite de relire, de recopier et d’oublier. Et quand elle est prête, elle part quand même sur WhatsApp.",
    faq: [
      ["Je dois quitter WhatsApp ?", "Non. Yaplus prépare la liste, WhatsApp l’envoie. Un bouton ouvre WhatsApp avec le message déjà écrit."],
      ["Mon fournisseur doit installer Yaplus ?", "Non. Il reçoit un message WhatsApp normal, rangé par catégorie."],
      ["Les employés doivent avoir WhatsApp ?", "Non. Ils ont besoin d’un téléphone avec un navigateur. WhatsApp sert seulement à les inviter et à envoyer la commande."],
    ],
  },
  {
    slug: "excel",
    name: "Excel et Google Sheets",
    versus: "face à Excel et Google Sheets",
    title: "Liste de réapprovisionnement : Yaplus ou un tableau Excel ?",
    h1: "Un tableau Excel, c’est bien au bureau. Pas au comptoir.",
    description:
      "Excel et Google Sheets sont puissants, mais difficiles à remplir sur un petit téléphone au comptoir. Yaplus est fait pour signaler une rupture en un tap. Comparatif.",
    intro:
      "Un tableau partagé paraît idéal : tout le monde peut l’ouvrir. En pratique, sur un petit téléphone, il faut zoomer, trouver la bonne ligne et taper au bon endroit. Les employés abandonnent vite, et le patron se retrouve seul à remplir.",
    reasons: [
      { title: "Fait pour un pouce, pas pour une souris", text: "De gros boutons, une catégorie puis un produit. Signaler prend moins de cinq secondes." },
      { title: "Pas de ligne à casser", text: "Personne ne peut effacer une colonne ou une formule par erreur." },
      { title: "Marche sans réseau", text: "Le cahier s’ouvre et se remplit hors connexion. Un tableau en ligne attend souvent le réseau." },
      { title: "La commande est déjà écrite", text: "Pas d’export ni de copier-coller : un bouton envoie la liste sur WhatsApp." },
    ],
    rows: [
      ["Remplir sur un petit téléphone", "Fait pour ça", "Difficile"],
      ["Apprendre à l’utiliser", "Aucune formation", "Il faut connaître le tableur"],
      ["Sans réseau", "Oui", "Limité"],
      ["Savoir qui a signalé", "Automatique", "À noter soi-même"],
      ["Envoyer au fournisseur", "Un bouton WhatsApp", "Copier, coller, mettre en forme"],
      ["Calculs, prix, inventaire", "Non", "Oui"],
      ["Prix", "Gratuit pendant le lancement", "Gratuit ou payant selon l’outil"],
    ],
    stillRight: [
      "Tu fais tes calculs de prix, de marge ou d’inventaire et tu as besoin de formules.",
      "La liste est remplie par une seule personne, sur un ordinateur.",
      "Tu dois produire des rapports pour un comptable ou une banque.",
    ],
    bottomLine:
      "Garde Excel pour les chiffres. Pour que toute l’équipe signale ce qui manque depuis le comptoir, une app pensée pour le téléphone sera vraiment remplie.",
    faq: [
      ["Je peux exporter ma liste vers Excel ?", "La liste se partage en texte sur WhatsApp, que tu peux copier où tu veux. Il n’y a pas d’export de fichier Excel pour l’instant."],
      ["Yaplus calcule mes marges ?", "Non, mais nos outils gratuits le font : calcul de marge, prix de vente, point de commande."],
      ["Je peux utiliser les deux ?", "Oui. Beaucoup de patrons gardent leur tableau pour les comptes et donnent Yaplus à l’équipe."],
    ],
  },
  {
    slug: "logiciel-de-gestion-de-stock",
    name: "un logiciel de gestion de stock",
    versus: "face à un logiciel de gestion de stock",
    title: "Logiciel de gestion de stock ou simple liste de réapprovisionnement ?",
    h1: "Pas besoin d’un logiciel de stock pour ne plus oublier ce qui manque",
    description:
      "Un logiciel de gestion de stock demande de saisir chaque entrée et chaque vente. Yaplus fait une seule chose : noter ce qui manque, en un tap. Lequel choisir ?",
    intro:
      "Les logiciels de gestion de stock et de caisse comptent tout : chaque vente, chaque entrée, chaque quantité. C’est utile quand tout est scanné. Dans une petite boutique où personne ne saisit les ventes, le stock affiché devient faux en quelques jours.",
    reasons: [
      { title: "Rien à compter", text: "Pas de quantités en stock à tenir à jour. On signale seulement ce qui est fini." },
      { title: "Utilisé dès le premier jour", text: "Pas de catalogue à importer ni de formation. Tu pars d’un modèle de catégories." },
      { title: "Toute l’équipe s’en sert", text: "Un employé qui n’aime pas écrire peut signaler en touchant le produit." },
      { title: "Léger et hors connexion", text: "Il marche sur un Android simple et sans réseau." },
    ],
    rows: [
      ["Mise en place", "Une minute", "Des jours : catalogue, quantités, formation"],
      ["Ce qu’il faut saisir", "Le produit fini, en un tap", "Chaque vente et chaque entrée"],
      ["Quantités en stock", "Non", "Oui"],
      ["Caisse et facturation", "Non", "Souvent"],
      ["Sans réseau", "Oui", "Selon le logiciel"],
      ["Liste pour le fournisseur", "Un bouton WhatsApp", "Selon le logiciel"],
      ["Prix", "Gratuit pendant le lancement", "Souvent un abonnement ou une licence"],
    ],
    stillRight: [
      "Tu scannes chaque vente à la caisse et tu veux un stock exact en continu.",
      "Tu dois suivre des numéros de série, des dates de péremption ou des lots.",
      "Tu as besoin de facturation, de comptabilité ou de rapports de vente.",
    ],
    bottomLine:
      "Si tu as une caisse qui enregistre tout, un logiciel de stock te donne des chiffres exacts. Si ton vrai problème est « on a oublié de racheter », une liste partagée le règle sans rien changer à la façon de vendre.",
    faq: [
      ["Yaplus peut évoluer vers la gestion de stock ?", "Yaplus reste volontairement simple : noter ce qui manque et le racheter. C’est ce qui le rend utilisable par toute l’équipe."],
      ["Je peux utiliser Yaplus avec ma caisse ?", "Oui. La caisse compte les ventes, Yaplus sert à l’équipe pour signaler ce qui manque en rayon."],
      ["Comment savoir quand recommander sans logiciel ?", "Notre calcul gratuit du point de commande te donne le moment où signaler un produit, à partir de tes ventes et du délai de livraison."],
    ],
  },
];

export const findComparison = (slug: string) => COMPARISONS.find((c) => c.slug === slug) ?? null;
