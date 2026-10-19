import type { Metadata } from "next";

// Adresse publique du site. À changer ici (ou par NEXT_PUBLIC_SITE_URL) le jour d'un vrai domaine.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://yaplus-blush.vercel.app").replace(/\/$/, "");
export const SITE_NAME = "Yaplus";
export const TAGLINE = "Y a plus ? On le note.";

export const abs = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;

// Métadonnées d'une page publique : titre, description, adresse canonique et aperçu de partage.
// `ownImage` : la page a sa propre opengraph-image ; ne pas la recouvrir par l'image par défaut.
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle,
  ownImage,
}: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
  ownImage?: boolean;
}): Metadata {
  // Une clé `images` même vide masquerait l'image du fichier : on ne la met que si besoin.
  const images = ownImage ? {} : { images: [{ url: "/opengraph-image", width: 1200, height: 630 }] };
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    robots: { index: true, follow: true },
    openGraph: { title, description, url: path, siteName: SITE_NAME, locale: "fr_FR", type: "website", ...images },
    twitter: { card: "summary_large_image", title, description, ...images },
  };
}

// Données structurées (schema.org) communes à toutes les pages publiques.
const ORGANIZATION = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
  slogan: TAGLINE,
};

const WEBSITE = {
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "fr",
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export const SOFTWARE_APP = {
  "@type": "SoftwareApplication",
  "@id": `${SITE_URL}/#app`,
  name: SITE_NAME,
  url: abs("/accueil"),
  applicationCategory: "BusinessApplication",
  operatingSystem: "Android, Web",
  inLanguage: "fr",
  description: "Cahier de réapprovisionnement partagé pour boutiques : les employés signalent ce qui est fini en un tap, le patron reçoit la liste prête pour le fournisseur sur WhatsApp. Marche sans réseau.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "XAF", description: "Gratuit pendant le lancement" },
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": [ORGANIZATION, WEBSITE, ...nodes] };
}

export function breadcrumb(items: [string, string][]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(path) })),
  };
}

export function faqPage(faq: [string, string][]) {
  return {
    "@type": "FAQPage",
    mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
}

// Retire la syntaxe de lien [texte](/chemin) pour le texte brut (données structurées, llms.txt).
export const plain = (text: string) => text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
