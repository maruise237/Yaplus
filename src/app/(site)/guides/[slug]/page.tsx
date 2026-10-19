import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Faq } from "@/components/site/Faq";
import { JsonLd } from "@/components/site/JsonLd";
import { LinkList } from "@/components/site/LinkList";
import { Container, H2, Lead, PageTitle } from "@/components/site/Page";
import { RichText } from "@/components/site/RichText";
import { SiteCta } from "@/components/site/SiteCta";
import { findGuide, GUIDES } from "@/content/guides";
import { MODELES } from "@/content/modeles";
import { abs, breadcrumb, faqPage, graph, pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => GUIDES.map((g) => ({ slug: g.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = findGuide((await params).slug);
  if (!g) return {};
  const meta = pageMetadata({ title: g.title, description: g.description, ownImage: true, path: `/guides/${g.slug}` });
  return { ...meta, openGraph: { ...meta.openGraph, type: "article", publishedTime: g.date } };
}

const dateLabel = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export default async function GuidePage({ params }: Props) {
  const g = findGuide((await params).slug);
  if (!g) notFound();
  const path = `/guides/${g.slug}`;
  const crumbs: [string, string][] = [["Accueil", "/accueil"], ["Guides", "/guides"], [g.title, path]];
  const others = GUIDES.filter((o) => o.slug !== g.slug);

  return (
    <>
      <JsonLd
        data={graph(breadcrumb(crumbs), faqPage(g.faq), {
          "@type": "Article",
          headline: g.h1,
          description: g.description,
          url: abs(path),
          datePublished: g.date,
          dateModified: g.date,
          inLanguage: "fr",
          author: { "@id": abs("/#organization") },
          publisher: { "@id": abs("/#organization") },
          image: abs("/opengraph-image"),
        })}
      />
      <Container className="pt-6 pb-24">
        <Breadcrumbs items={crumbs} />
        <article className="max-w-3xl">
          <PageTitle className="mt-6 max-w-[24ch]">{g.h1}</PageTitle>
          <p className="mt-4 text-[15px] text-muted-foreground">
            <time dateTime={g.date}>{dateLabel(g.date)}</time>
          </p>
          <Lead>{g.intro}</Lead>

          {g.sections.map((s) => (
            <section key={s.heading} className="mt-14">
              <H2>{s.heading}</H2>
              {s.paragraphs.map((p) => (
                <p key={p} className="mt-4 max-w-[38rem] text-[17px] leading-relaxed">
                  <RichText text={p} />
                </p>
              ))}
              {s.list && (
                <ul className="mt-4 grid max-w-[38rem] gap-2 text-[17px] leading-relaxed">
                  {s.list.map((l) => (
                    <li key={l} className="flex gap-3">
                      <span className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-foreground/50" aria-hidden />
                      {l}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <Faq items={g.faq} />
        </article>

        <div className="mt-16 grid max-w-3xl gap-12 md:grid-cols-2">
          <section aria-labelledby="lire">
            <H2 id="lire" className="text-[1.5rem]">
              À lire aussi
            </H2>
            <div className="mt-4">
              <LinkList items={others.slice(0, 3).map((o) => ({ href: `/guides/${o.slug}`, title: o.title }))} />
            </div>
          </section>
          <section aria-labelledby="modeles">
            <H2 id="modeles" className="text-[1.5rem]">
              Modèles de cahier
            </H2>
            <div className="mt-4">
              <LinkList items={[...MODELES.slice(0, 3).map((m) => ({ href: `/modeles/${m.slug}`, title: m.label })), { href: "/modeles", title: "Tous les modèles" }]} />
            </div>
          </section>
        </div>
      </Container>
      <SiteCta title="Mets la méthode dans le téléphone." text="Ton équipe signale ce qui manque en un tap. Tu reçois la liste prête pour le fournisseur." />
    </>
  );
}
