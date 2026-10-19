import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { JsonLd } from "@/components/site/JsonLd";
import { LinkList } from "@/components/site/LinkList";
import { Container, Lead, PageTitle } from "@/components/site/Page";
import { SiteCta } from "@/components/site/SiteCta";
import { GUIDES } from "@/content/guides";
import { breadcrumb, graph, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Guides pour gérer le réapprovisionnement d’une boutique",
  description:
    "Guides pratiques pour commerçants : faire une liste de réapprovisionnement, éviter les ruptures de stock, commander sur WhatsApp, suivre sa boutique à distance.",
  path: "/guides",
});

export default function GuidesPage() {
  const crumbs: [string, string][] = [["Accueil", "/accueil"], ["Guides", "/guides"]];
  return (
    <>
      <JsonLd data={graph(breadcrumb(crumbs))} />
      <Container className="pt-6 pb-24">
        <Breadcrumbs items={crumbs} />
        <PageTitle className="mt-6">Moins d’oublis, moins de ruptures</PageTitle>
        <Lead>Des méthodes simples, tirées du terrain, pour que la boutique ne manque plus de ce qui se vend.</Lead>
        <div className="mt-12 max-w-3xl">
          <LinkList items={GUIDES.map((g) => ({ href: `/guides/${g.slug}`, title: g.title, text: g.description }))} />
        </div>
      </Container>
      <SiteCta title="Passe de la méthode à la liste." text="Crée le cahier de ta boutique en une minute, et invite ton équipe sur WhatsApp." />
    </>
  );
}
