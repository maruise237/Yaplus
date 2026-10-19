import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { JsonLd } from "@/components/site/JsonLd";
import { LinkList } from "@/components/site/LinkList";
import { Container, Lead, PageTitle } from "@/components/site/Page";
import { SiteCta } from "@/components/site/SiteCta";
import { MODELES } from "@/content/modeles";
import { abs, breadcrumb, graph, pageMetadata } from "@/lib/seo";

const TITLE = "Modèles gratuits de listes de réapprovisionnement par commerce";
const DESCRIPTION =
  "Modèles gratuits de listes de réapprovisionnement pour boutique de téléphonie, alimentation, quincaillerie, bar, restaurant, salon de coiffure et plus. Catégories et produits prêts à l’emploi.";

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/modeles" });

export default function ModelesPage() {
  return (
    <>
      <JsonLd
        data={graph(breadcrumb([["Accueil", "/accueil"], ["Modèles", "/modeles"]]), {
          "@type": "CollectionPage",
          name: TITLE,
          url: abs("/modeles"),
          hasPart: MODELES.map((m) => ({ "@type": "WebPage", name: m.title, url: abs(`/modeles/${m.slug}`) })),
        })}
      />
      <Container className="pt-6 pb-24">
        <Breadcrumbs items={[["Accueil", "/accueil"], ["Modèles", "/modeles"]]} />
        <PageTitle className="mt-6">Un cahier prêt pour ton commerce</PageTitle>
        <Lead>
          Chaque modèle range déjà les catégories et les produits qu’on trouve dans ce type de boutique. Tu le choisis en créant ta boutique, puis tu le
          modifies comme tu veux.
        </Lead>
        <div className="mt-12 max-w-3xl">
          <LinkList
            items={MODELES.map((m) => ({
              href: `/modeles/${m.slug}`,
              title: m.label,
              text: m.categories.map((c) => c.name).join(", "),
            }))}
          />
        </div>
      </Container>
      <SiteCta title="Ton commerce n’est pas dans la liste ?" text="Crée ta boutique sans modèle : tu ajoutes tes catégories, puis chaque produit au moment où il manque." />
    </>
  );
}
