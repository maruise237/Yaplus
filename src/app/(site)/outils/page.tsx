import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { JsonLd } from "@/components/site/JsonLd";
import { LinkList } from "@/components/site/LinkList";
import { Container, Lead, PageTitle } from "@/components/site/Page";
import { SiteCta } from "@/components/site/SiteCta";
import { TOOLS } from "@/content/outils";
import { breadcrumb, graph, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Outils gratuits pour commerçants : marge, prix de vente, stock",
  description:
    "Calculs gratuits pour boutique, en FCFA : marge commerciale, prix de vente, point de commande, stock de sécurité et quantité à commander. Sans inscription.",
  path: "/outils",
});

export default function OutilsPage() {
  const crumbs: [string, string][] = [["Accueil", "/accueil"], ["Outils", "/outils"]];
  return (
    <>
      <JsonLd data={graph(breadcrumb(crumbs))} />
      <Container className="pt-6 pb-24">
        <Breadcrumbs items={crumbs} />
        <PageTitle className="mt-6">Les calculs de la boutique, faits pour toi</PageTitle>
        <Lead>Gratuits, en FCFA, sans compte. Tu entres tes chiffres, le résultat s’affiche tout de suite.</Lead>
        <div className="mt-12 max-w-3xl">
          <LinkList items={TOOLS.map((t) => ({ href: `/outils/${t.slug}`, title: t.name, text: t.intro }))} />
        </div>
      </Container>
      <SiteCta title="Tu sais quand racheter. Ne l’oublie plus." text="Avec Yaplus, ton équipe signale ce qui est fini en un tap, et la liste part au fournisseur sur WhatsApp." />
    </>
  );
}
