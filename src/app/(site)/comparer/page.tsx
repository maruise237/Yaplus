import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { JsonLd } from "@/components/site/JsonLd";
import { LinkList } from "@/components/site/LinkList";
import { Container, Lead, PageTitle } from "@/components/site/Page";
import { SiteCta } from "@/components/site/SiteCta";
import { COMPARISONS } from "@/content/comparer";
import { breadcrumb, graph, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Yaplus comparé au cahier papier, à WhatsApp, à Excel et aux logiciels de stock",
  description:
    "Cahier papier, groupe WhatsApp, Excel ou logiciel de gestion de stock : comparatifs honnêtes pour choisir comment noter ce qui manque dans ta boutique.",
  path: "/comparer",
});

export default function ComparerPage() {
  const crumbs: [string, string][] = [["Accueil", "/accueil"], ["Comparer", "/comparer"]];
  return (
    <>
      <JsonLd data={graph(breadcrumb(crumbs))} />
      <Container className="pt-6 pb-24">
        <Breadcrumbs items={crumbs} />
        <PageTitle className="mt-6">Comment ta boutique note ce qui manque aujourd’hui ?</PageTitle>
        <Lead>Le vrai concurrent de Yaplus, c’est la feuille et le message WhatsApp. Voici ce qui change, et quand garder ce que tu as.</Lead>
        <div className="mt-12 max-w-3xl">
          <LinkList items={COMPARISONS.map((c) => ({ href: `/comparer/${c.slug}`, title: c.h1, text: `Yaplus ${c.versus}` }))} />
        </div>
      </Container>
      <SiteCta title="Essaie avec ta vraie boutique." text="Une minute pour créer le cahier. Si ce n’est pas mieux que ton papier, tu n’as rien perdu." />
    </>
  );
}
