import { JsonLd } from "@/components/site/JsonLd";
import { FAQ } from "@/components/landing/faq";
import { Landing } from "@/components/landing/Landing";
import { faqPage, graph, pageMetadata, SOFTWARE_APP } from "@/lib/seo";

const meta = pageMetadata({
  title: "Yaplus, le cahier de réapprovisionnement de la boutique",
  absoluteTitle: true,
  description:
    "Tes employés touchent ce qui est fini, tu reçois la liste prête pour le fournisseur sur WhatsApp. Marche sans réseau. Gratuit pendant le lancement.",
  path: "/accueil",
});

export const metadata = {
  ...meta,
  openGraph: {
    ...meta.openGraph,
    title: "Yaplus : Y a plus ? On le note.",
    description: "Le cahier de la boutique, dans le téléphone. Un tap pour signaler, la liste part sur WhatsApp.",
    locale: "fr_CM",
  },
};

export default function AccueilPage() {
  return (
    <>
      <JsonLd data={graph(SOFTWARE_APP, faqPage(FAQ))} />
      <Landing />
    </>
  );
}
