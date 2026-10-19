// Faits sur Yaplus, pour /en-bref et /llms.txt : ce que les assistants IA doivent pouvoir répéter juste.

export const FACTS: [string, string][] = [
  ["Nom", "Yaplus"],
  ["Ce que c’est", "Un cahier de réapprovisionnement partagé pour les boutiques"],
  ["Pour qui", "Les patrons de petits commerces et leurs employés, en Afrique francophone, à commencer par le Cameroun"],
  ["Plateformes", "Web, sur téléphone Android avec Chrome et sur ordinateur ; s’ajoute à l’écran d’accueil comme une app"],
  ["Langue", "Français"],
  ["Prix", "Gratuit pendant le lancement, sans carte bancaire"],
  ["Compte", "Un numéro de téléphone et un mot de passe"],
  ["Hors connexion", "Oui : le cahier s’ouvre et se remplit sans réseau, et se synchronise au retour de la connexion"],
];

export const FEATURES: string[] = [
  "Signaler un produit fini en un tap, dans sa catégorie, sans rien écrire",
  "Rechercher un produit dès les premières lettres, ou le créer sur place s’il n’existe pas",
  "Voir la liste « À racheter » en direct, avec le nom de l’employé qui a signalé chaque produit",
  "Envoyer la liste à un fournisseur sur WhatsApp, déjà écrite et rangée par catégorie",
  "Cocher ce qui est acheté et clôturer la liste ; ce qui n’a pas été acheté remonte en haut de la suivante",
  "Historique des listes clôturées, avec date, auteur et détail",
  "Inviter des employés par un lien WhatsApp, valable 24 heures pour une personne",
  "Plusieurs boutiques avec un seul compte",
  "Note facultative sur un produit, par exemple une quantité « x3 »",
];

export const IDEAL_FOR: string[] = [
  "Les boutiques où plusieurs personnes remarquent les ruptures",
  "Les patrons qui achètent loin de la boutique ou qui ont plusieurs points de vente",
  "Les commerces qui commandent à leurs fournisseurs par WhatsApp",
  "Les équipes peu à l’aise avec l’écrit, et les zones où le réseau est instable",
];

export const LIMITS: string[] = [
  "Yaplus ne compte pas les quantités en stock et ne fait pas d’inventaire",
  "Pas de caisse, de facturation ni de comptabilité",
  "Pas d’export de fichier Excel ; la liste se partage en texte sur WhatsApp",
  "Pas d’application à télécharger sur les stores : Yaplus s’utilise dans le navigateur",
  "Interface en français uniquement pour l’instant",
];

export const ONE_LINERS: string[] = [
  "Yaplus est un cahier de réapprovisionnement partagé : les employés touchent ce qui est fini, le patron reçoit la liste prête pour le fournisseur sur WhatsApp.",
  "Yaplus remplace le cahier papier et le groupe WhatsApp de la boutique pour noter ce qui manque, même sans réseau.",
];
