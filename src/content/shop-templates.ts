// Modèles de cahier par type de commerce : les catégories et les produits qu'on y trouve.
// Données pures, partagées entre les pages publiques (/modeles) et la création de boutique.

export type TemplateCategory = { name: string; products: string[] };
export type ShopTemplate = { slug: string; label: string; categories: TemplateCategory[] };

export const SITE_TEMPLATES: ShopTemplate[] = [
  {
    slug: "telephonie",
    label: "Téléphonie et accessoires",
    categories: [
      { name: "Afficheurs", products: ["KG5", "Tecno Spark 10", "Itel A70", "Infinix Hot 30", "Samsung A14", "Redmi 12C"] },
      { name: "Batteries", products: ["Batterie Itel BL-5", "Batterie Tecno BL-49", "Batterie Samsung A10", "Batterie Infinix BL-39"] },
      { name: "Chargeurs", products: ["Chargeur Type-C 18 W", "Chargeur micro-USB", "Chargeur iPhone 20 W", "Câble Type-C 1 m", "Câble micro-USB"] },
      { name: "Accessoires", products: ["Écouteurs filaires", "Écouteurs Bluetooth", "Power bank 10 000 mAh", "Carte mémoire 32 Go", "Support voiture"] },
      { name: "Pochettes", products: ["Pochette Itel A100", "Pochette Tecno Spark 20", "Pochette Samsung A05", "Verre trempé universel"] },
      { name: "Pièces", products: ["Connecteur de charge Type-C", "Haut-parleur", "Nappe d’écran", "Vitre arrière"] },
    ],
  },
  {
    slug: "alimentation",
    label: "Alimentation générale",
    categories: [
      { name: "Céréales", products: ["Riz 25 kg", "Riz 5 kg", "Spaghetti", "Farine de blé", "Semoule de maïs"] },
      { name: "Boissons", products: ["Eau minérale 1,5 L", "Jus en canette", "Lait en poudre", "Café soluble", "Thé en sachets"] },
      { name: "Conserves", products: ["Sardines", "Tomate concentrée", "Corned-beef", "Maquereau", "Petits pois"] },
      { name: "Huiles", products: ["Huile raffinée 1 L", "Huile raffinée 5 L", "Huile de palme 1 L", "Margarine"] },
      { name: "Hygiène", products: ["Savon de ménage", "Savon de toilette", "Dentifrice", "Papier hygiénique", "Lessive en poudre"] },
      { name: "Divers", products: ["Sucre en morceaux", "Sel", "Cube d’assaisonnement", "Allumettes", "Bougies"] },
    ],
  },
  {
    slug: "quincaillerie",
    label: "Quincaillerie",
    categories: [
      { name: "Électricité", products: ["Fil électrique 1,5 mm²", "Fil électrique 2,5 mm²", "Ampoule LED 9 W", "Prise murale", "Interrupteur", "Disjoncteur 16 A"] },
      { name: "Plomberie", products: ["Tuyau PVC 32", "Coude PVC 32", "Robinet", "Colle PVC", "Téflon"] },
      { name: "Visserie", products: ["Pointes de 70", "Pointes de 100", "Vis à bois", "Chevilles 8 mm", "Boulons"] },
      { name: "Peinture", products: ["Peinture à eau blanche", "Peinture à huile", "Diluant", "Rouleau", "Pinceau 2 pouces"] },
      { name: "Outillage", products: ["Marteau", "Tournevis", "Pince", "Mètre ruban", "Scie à métaux"] },
      { name: "Divers", products: ["Cadenas", "Fil de fer", "Brouette", "Pelle"] },
    ],
  },
  {
    slug: "cosmetiques",
    label: "Cosmétiques et beauté",
    categories: [
      { name: "Soins du corps", products: ["Lait corporel", "Beurre de karité", "Huile de coco", "Gel douche", "Déodorant"] },
      { name: "Soins du visage", products: ["Crème de jour", "Savon noir", "Gommage", "Démaquillant"] },
      { name: "Cheveux", products: ["Défrisant", "Shampoing", "Après-shampoing", "Huile capillaire", "Gel coiffant"] },
      { name: "Maquillage", products: ["Fond de teint", "Rouge à lèvres", "Crayon à sourcils", "Vernis à ongles", "Faux cils"] },
      { name: "Parfums", products: ["Eau de parfum femme", "Eau de parfum homme", "Brume corporelle"] },
      { name: "Hygiène", products: ["Serviettes hygiéniques", "Coton", "Rasoirs", "Coupe-ongles"] },
    ],
  },
  {
    slug: "boulangerie",
    label: "Boulangerie et pâtisserie",
    categories: [
      { name: "Farines", products: ["Farine de blé 50 kg", "Farine de pâtisserie", "Amidon de maïs"] },
      { name: "Ingrédients", products: ["Levure boulangère", "Améliorant", "Sucre en poudre", "Sel fin", "Œufs", "Lait en poudre"] },
      { name: "Matières grasses", products: ["Beurre", "Margarine", "Huile de friture"] },
      { name: "Garnitures", products: ["Chocolat en poudre", "Confiture", "Raisins secs", "Arôme vanille"] },
      { name: "Emballages", products: ["Sachets à pain", "Boîtes à gâteau", "Papier sulfurisé", "Sacs plastiques"] },
      { name: "Énergie", products: ["Bouteille de gaz", "Bois de four"] },
    ],
  },
  {
    slug: "bar",
    label: "Bar et snack",
    categories: [
      { name: "Bières", products: ["Castel 65 cl", "33 Export", "Mützig", "Guinness", "Booster"] },
      { name: "Sucreries", products: ["Top Ananas", "Coca-Cola 50 cl", "Fanta", "Djino", "Malta"] },
      { name: "Eaux", products: ["Supermont 1,5 L", "Tangui 1,5 L", "Eau gazeuse"] },
      { name: "Vins et spiritueux", products: ["Vin rouge", "Whisky en sachet", "Vodka", "Liqueur"] },
      { name: "Snack", products: ["Arachides grillées", "Chips", "Brochettes", "Œufs durs"] },
      { name: "Consommables", products: ["Glaçons", "Gobelets", "Serviettes en papier", "Pailles"] },
    ],
  },
  {
    slug: "restaurant",
    label: "Restaurant et maquis",
    categories: [
      { name: "Vivres", products: ["Riz 25 kg", "Plantain", "Manioc", "Macabo", "Haricot"] },
      { name: "Viandes et poissons", products: ["Poulet", "Bœuf", "Poisson braisé", "Maquereau congelé", "Soya"] },
      { name: "Légumes et épices", products: ["Oignons", "Tomates", "Piment", "Ail", "Gingembre", "Ndolé"] },
      { name: "Huiles et sauces", products: ["Huile raffinée 5 L", "Huile de palme", "Cube d’assaisonnement", "Mayonnaise"] },
      { name: "Boissons", products: ["Eau minérale", "Jus de bissap", "Sucreries", "Bières"] },
      { name: "Cuisine", products: ["Bouteille de gaz", "Charbon", "Barquettes", "Sacs plastiques", "Liquide vaisselle"] },
    ],
  },
  {
    slug: "salon-de-coiffure",
    label: "Salon de coiffure",
    categories: [
      { name: "Mèches", products: ["Mèches X-pression", "Mèches bouclées", "Perruque", "Tissage brésilien"] },
      { name: "Produits", products: ["Défrisant", "Shampoing", "Masque capillaire", "Gel coiffant", "Huile capillaire", "Teinture noire"] },
      { name: "Barbier", products: ["Lames de rasoir", "Après-rasage", "Talc", "Alcool"] },
      { name: "Petit matériel", products: ["Peignes", "Élastiques", "Épingles", "Bonnets de nuit", "Filets"] },
      { name: "Consommables", products: ["Gants", "Serviettes", "Papier cou", "Capes jetables"] },
    ],
  },
  {
    slug: "librairie-papeterie",
    label: "Librairie et papeterie",
    categories: [
      { name: "Cahiers", products: ["Cahier 100 pages", "Cahier 200 pages", "Cahier de dessin", "Registre", "Bloc-notes"] },
      { name: "Écriture", products: ["Stylo bleu", "Stylo rouge", "Crayon à papier", "Gomme", "Taille-crayon", "Correcteur"] },
      { name: "Papier", products: ["Rame A4", "Papier cartonné", "Enveloppes", "Papier calque"] },
      { name: "École", products: ["Ardoise", "Craie", "Règle 30 cm", "Équerre", "Compas", "Cartable"] },
      { name: "Bureau", products: ["Agrafeuse", "Agrafes", "Chemises cartonnées", "Colle", "Ruban adhésif"] },
      { name: "Livres", products: ["Livres de lecture", "Annales du BEPC", "Annales du bac", "Dictionnaire"] },
    ],
  },
  {
    slug: "pieces-auto-moto",
    label: "Pièces auto et moto",
    categories: [
      { name: "Moto", products: ["Bougie moto", "Chambre à air 17", "Pneu moto", "Chaîne de transmission", "Plaquettes de frein moto", "Câble d’embrayage"] },
      { name: "Huiles", products: ["Huile moteur 4T 1 L", "Huile moteur 5 L", "Liquide de frein", "Graisse"] },
      { name: "Filtres", products: ["Filtre à huile", "Filtre à air", "Filtre à gasoil"] },
      { name: "Freinage", products: ["Plaquettes avant", "Disques de frein", "Mâchoires"] },
      { name: "Électricité", products: ["Batterie 12 V", "Ampoule de phare", "Fusibles", "Clignotant"] },
      { name: "Accessoires", products: ["Rétroviseur", "Casque", "Antivol"] },
    ],
  },
  {
    slug: "vetements",
    label: "Vêtements et chaussures",
    categories: [
      { name: "Hommes", products: ["Chemise taille M", "Chemise taille L", "Jean taille 40", "Polo", "T-shirt"] },
      { name: "Femmes", products: ["Robe pagne", "Jupe", "Chemisier", "Leggings", "Ensemble"] },
      { name: "Enfants", products: ["Tenue scolaire", "Body bébé", "Short enfant", "Robe fillette"] },
      { name: "Chaussures", products: ["Babouches", "Sandales pointure 42", "Baskets pointure 43", "Escarpins"] },
      { name: "Sous-vêtements", products: ["Boxers", "Soutiens-gorge", "Chaussettes"] },
      { name: "Accessoires", products: ["Ceintures", "Sacs à main", "Casquettes", "Sacs d’emballage"] },
    ],
  },
  {
    slug: "informatique",
    label: "Informatique et bureautique",
    categories: [
      { name: "Stockage", products: ["Clé USB 32 Go", "Clé USB 64 Go", "Disque dur externe 1 To", "Carte SD 64 Go"] },
      { name: "Câbles", products: ["Câble HDMI", "Câble réseau RJ45", "Rallonge multiprise", "Câble USB imprimante"] },
      { name: "Impression", products: ["Cartouche HP 305", "Toner", "Encre en bouteille", "Rame A4"] },
      { name: "Périphériques", products: ["Souris", "Clavier", "Casque micro", "Webcam"] },
      { name: "Énergie", products: ["Chargeur d’ordinateur", "Onduleur", "Batterie d’ordinateur"] },
      { name: "Réseau", products: ["Routeur wifi", "Clé wifi USB", "Modem 4G"] },
    ],
  },
];

export const findSiteTemplate = (slug: string | null | undefined) => SITE_TEMPLATES.find((t) => t.slug === slug) ?? null;
