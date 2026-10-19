import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Calculator } from "@/components/site/Calculator";
import { Faq } from "@/components/site/Faq";
import { JsonLd } from "@/components/site/JsonLd";
import { LinkList } from "@/components/site/LinkList";
import { Container, H2, Lead, PageTitle } from "@/components/site/Page";
import { SiteCta } from "@/components/site/SiteCta";
import { findTool, TOOLS } from "@/content/outils";
import { abs, breadcrumb, faqPage, graph, pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => TOOLS.map((t) => ({ slug: t.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = findTool((await params).slug);
  if (!t) return {};
  return pageMetadata({ title: t.title, description: t.description, ownImage: true, path: `/outils/${t.slug}` });
}

export default async function ToolPage({ params }: Props) {
  const t = findTool((await params).slug);
  if (!t) notFound();
  const path = `/outils/${t.slug}`;
  const crumbs: [string, string][] = [["Accueil", "/accueil"], ["Outils", "/outils"], [t.name, path]];
  const others = TOOLS.filter((o) => o.slug !== t.slug);

  return (
    <>
      <JsonLd
        data={graph(breadcrumb(crumbs), faqPage(t.faq), {
          "@type": "WebApplication",
          name: t.name,
          url: abs(path),
          description: t.description,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Tous",
          inLanguage: "fr",
          isAccessibleForFree: true,
          offers: { "@type": "Offer", price: "0", priceCurrency: "XAF" },
        })}
      />
      <Container className="pt-6 pb-24">
        <Breadcrumbs items={crumbs} />
        <div className="max-w-3xl">
          <PageTitle className="mt-6">{t.name}</PageTitle>
          <Lead>{t.intro}</Lead>
          <div className="mt-8">
            <Calculator slug={t.slug} />
          </div>

          <section className="mt-16" aria-labelledby="formule">
            <H2 id="formule">La formule</H2>
            <p className="mt-4 max-w-[38rem] text-[17px] leading-relaxed text-muted-foreground">{t.formula.text}</p>
            <ul className="mt-4 grid gap-2">
              {t.formula.lines.map((l) => (
                <li key={l} className="rounded-xl border bg-card px-4 py-3 text-[17px] font-medium">
                  {l}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-16" aria-labelledby="exemple">
            <H2 id="exemple">Un exemple</H2>
            <p className="mt-4 max-w-[38rem] text-[17px] leading-relaxed">{t.example}</p>
          </section>

          <section className="mt-16" aria-labelledby="savoir">
            <H2 id="savoir">Bon à savoir</H2>
            <ul className="mt-5 grid max-w-[38rem] gap-3 text-[17px] leading-relaxed">
              {t.goodToKnow.map((g) => (
                <li key={g} className="border-t pt-3">
                  {g}
                </li>
              ))}
            </ul>
          </section>

          <Faq items={t.faq} />

          <section className="mt-16" aria-labelledby="autres">
            <H2 id="autres" className="text-[1.5rem]">
              Autres calculs
            </H2>
            <div className="mt-4">
              <LinkList items={others.map((o) => ({ href: `/outils/${o.slug}`, title: o.name }))} />
            </div>
          </section>
        </div>
      </Container>
      <SiteCta title="Le calcul est fait. Reste à ne pas oublier." text="Ton équipe signale le produit au bon moment, en un tap, et tu reçois la liste prête pour le fournisseur." />
    </>
  );
}
