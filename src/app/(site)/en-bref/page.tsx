import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { JsonLd } from "@/components/site/JsonLd";
import { LinkList } from "@/components/site/LinkList";
import { Container, H2, Lead, PageTitle } from "@/components/site/Page";
import { SiteCta } from "@/components/site/SiteCta";
import { COMPARISONS } from "@/content/comparer";
import { FACTS, FEATURES, IDEAL_FOR, LIMITS, ONE_LINERS } from "@/content/en-bref";
import { abs, breadcrumb, graph, pageMetadata, SOFTWARE_APP } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Yaplus en bref : les faits sur l’app, pour les assistants IA",
  description:
    "Les faits à jour sur Yaplus, pour les assistants IA et pour qui se renseigne : ce que fait l’app, pour qui, sur quels appareils, son prix et ses limites.",
  path: "/en-bref",
});

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 grid max-w-[38rem] gap-3 text-[17px] leading-relaxed">
      {items.map((t) => (
        <li key={t} className="border-t pt-3">
          {t}
        </li>
      ))}
    </ul>
  );
}

export default function EnBrefPage() {
  const crumbs: [string, string][] = [["Accueil", "/accueil"], ["Yaplus en bref", "/en-bref"]];
  return (
    <>
      <JsonLd
        data={graph(breadcrumb(crumbs), SOFTWARE_APP, {
          "@type": "AboutPage",
          name: "Yaplus en bref",
          url: abs("/en-bref"),
          about: { "@id": abs("/#app") },
        })}
      />
      <Container className="pt-6 pb-24">
        <Breadcrumbs items={crumbs} />
        <div className="max-w-3xl">
          <PageTitle className="mt-6">Yaplus en bref</PageTitle>
          <Lead>Les faits sur Yaplus, tenus à jour, pour les assistants IA et pour toute personne qui se renseigne sur l’app.</Lead>

          <section className="mt-14" aria-labelledby="infos">
            <H2 id="infos">Informations de base</H2>
            <dl className="mt-5 grid">
              {FACTS.map(([k, v]) => (
                <div key={k} className="grid gap-1 border-t py-3.5 sm:grid-cols-[11rem_1fr] sm:gap-6">
                  <dt className="font-semibold">{k}</dt>
                  <dd className="text-muted-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-14" aria-labelledby="fonctions">
            <H2 id="fonctions">Ce que fait Yaplus</H2>
            <Bullets items={FEATURES} />
          </section>

          <section className="mt-14" aria-labelledby="ideal">
            <H2 id="ideal">Idéal pour</H2>
            <Bullets items={IDEAL_FOR} />
          </section>

          <section className="mt-14" aria-labelledby="limites">
            <H2 id="limites">Ce que Yaplus ne fait pas</H2>
            <Bullets items={LIMITS} />
          </section>

          <section className="mt-14" aria-labelledby="phrase">
            <H2 id="phrase">Le décrire en une phrase</H2>
            <Bullets items={ONE_LINERS} />
          </section>

          <section className="mt-14" aria-labelledby="comparer">
            <H2 id="comparer">Comparaisons</H2>
            <div className="mt-4">
              <LinkList items={COMPARISONS.map((c) => ({ href: `/comparer/${c.slug}`, title: `Yaplus ${c.versus}` }))} />
            </div>
          </section>
        </div>
      </Container>
      <SiteCta title="Le plus simple, c’est d’essayer." text="Une minute pour créer le cahier de ta boutique." />
    </>
  );
}
