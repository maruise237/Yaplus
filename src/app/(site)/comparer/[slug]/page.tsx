import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Faq } from "@/components/site/Faq";
import { JsonLd } from "@/components/site/JsonLd";
import { LinkList } from "@/components/site/LinkList";
import { Container, H2, Lead, PageTitle } from "@/components/site/Page";
import { SiteCta } from "@/components/site/SiteCta";
import { Button } from "@/components/ui/button";
import { COMPARISONS, findComparison } from "@/content/comparer";
import { abs, breadcrumb, faqPage, graph, pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => COMPARISONS.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = findComparison((await params).slug);
  if (!c) return {};
  return pageMetadata({ title: c.title, description: c.description, ownImage: true, path: `/comparer/${c.slug}` });
}

export default async function ComparisonPage({ params }: Props) {
  const c = findComparison((await params).slug);
  if (!c) notFound();
  const path = `/comparer/${c.slug}`;
  const crumbs: [string, string][] = [["Accueil", "/accueil"], ["Comparer", "/comparer"], [`Face ${c.versus.slice(5)}`, path]];
  const others = COMPARISONS.filter((o) => o.slug !== c.slug);
  const other = c.name.charAt(0).toUpperCase() + c.name.slice(1);

  return (
    <>
      <JsonLd data={graph(breadcrumb(crumbs), faqPage(c.faq), { "@type": "WebPage", name: c.title, url: abs(path), description: c.description })} />
      <Container className="pt-6 pb-24">
        <Breadcrumbs items={crumbs} />
        <div className="max-w-3xl">
          <PageTitle className="mt-6">{c.h1}</PageTitle>
          <Lead>{c.intro}</Lead>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="touch-lg" className="px-6 text-[17px]" asChild>
              <Link href="/connexion?mode=inscription">Créer ma boutique</Link>
            </Button>
            <Button size="touch-lg" variant="outline" className="px-6 text-[17px]" asChild>
              <Link href="/decouvrir">Essayer sans compte</Link>
            </Button>
          </div>

          <section className="mt-16" aria-labelledby="pourquoi">
            <H2 id="pourquoi">Pourquoi les boutiques passent à Yaplus</H2>
            <dl className="mt-5 grid">
              {c.reasons.map((r) => (
                <div key={r.title} className="grid gap-1 border-t py-4 sm:grid-cols-[14rem_1fr] sm:gap-6">
                  <dt className="text-[17px] font-semibold">{r.title}</dt>
                  <dd className="text-[17px] leading-relaxed text-muted-foreground">{r.text}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-16" aria-labelledby="tableau">
            <H2 id="tableau">Yaplus ou {c.name}, point par point</H2>
            <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
              <table className="w-full border-collapse text-left text-[16px]">
                <caption className="sr-only">Comparaison entre Yaplus et {c.name}</caption>
                <thead className="max-sm:sr-only">
                  <tr className="border-b bg-secondary/60">
                    <th scope="col" className="px-4 py-3 font-semibold">
                      <span className="sr-only">Critère</span>
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Yaplus
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      {other}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {c.rows.map(([label, yes, no]) => (
                    <tr key={label} className="border-b last:border-b-0 max-sm:grid max-sm:gap-1 max-sm:px-4 max-sm:py-3">
                      <th scope="row" className="px-4 py-3 align-top font-semibold max-sm:p-0 sm:w-[34%]">
                        {label}
                      </th>
                      <td className="px-4 py-3 align-top max-sm:flex max-sm:gap-2 max-sm:p-0">
                        <span className="font-medium text-foreground sm:hidden">Yaplus :</span>
                        <span className="font-medium">{yes}</span>
                      </td>
                      <td className="px-4 py-3 align-top text-muted-foreground max-sm:flex max-sm:gap-2 max-sm:p-0">
                        <span className="shrink-0 font-medium text-foreground sm:hidden">{other} :</span>
                        <span>{no}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-16" aria-labelledby="garder">
            <H2 id="garder">Quand garder {c.name}</H2>
            <ul className="mt-5 grid gap-3 text-[17px] leading-relaxed">
              {c.stillRight.map((t) => (
                <li key={t} className="flex gap-3 border-t pt-3">
                  <Check className="mt-1 size-[18px] shrink-0 text-muted-foreground" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-16 border-t-2 border-foreground pt-6" aria-labelledby="verdict">
            <H2 id="verdict" className="text-[1.5rem]">
              En résumé
            </H2>
            <p className="mt-3 max-w-[38rem] text-[17px] leading-relaxed">{c.bottomLine}</p>
          </section>

          <Faq items={c.faq} />

          <section className="mt-16" aria-labelledby="autres">
            <H2 id="autres" className="text-[1.5rem]">
              Autres comparatifs
            </H2>
            <div className="mt-4">
              <LinkList items={others.map((o) => ({ href: `/comparer/${o.slug}`, title: `Yaplus ${o.versus}` }))} />
            </div>
          </section>
        </div>
      </Container>
      <SiteCta title="Une seule liste pour toute l’équipe." text="Tes employés touchent ce qui est fini, tu reçois la liste prête pour le fournisseur." />
    </>
  );
}
